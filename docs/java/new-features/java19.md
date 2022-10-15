---
title: Java 19 新特性概览
category: Java
tag:
  - Java新特性
---

JDK 19 定于 9 月 20 日正式发布以供生产使用，非长期支持版本。不过，JDK 19 中有一些比较重要的新特性值得关注。

JDK 19 只有 7 个新特性：

- [JEP 405: Record Patterns（记录模式）](https://openjdk.org/jeps/405)（预览）
- [JEP 422: Linux/RISC-V Port](https://openjdk.org/jeps/422)
- [JEP 424: Foreign Function & Memory API（外部函数和内存 API）](https://openjdk.org/jeps/424)（预览）
- [JEP 425: Virtual Threads（虚拟线程）](https://openjdk.org/jeps/425)（预览）
- [JEP 426: Vector（向量）API](https://openjdk.java.net/jeps/426)（第四次孵化）
- [JEP 427: Pattern Matching for switch（switch 模式匹配）](https://openjdk.java.net/jeps/427)
- [JEP 428: Structured Concurrency（结构化并发）](https://openjdk.org/jeps/428)（孵化）

这里只对 424、425、426、428 这 4 个我觉得比较重要的新特性进行详细介绍。

相关阅读：[OpenJDK Java 19 文档](https://openjdk.org/projects/jdk/19/)

## JEP 424: 外部函数和内存 API（预览）

Java 程序可以通过该 API 与 Java 运行时之外的代码和数据进行互操作。通过高效地调用外部函数（即 JVM 之外的代码）和安全地访问外部内存（即不受 JVM 管理的内存），该 API 使 Java 程序能够调用本机库并处理本机数据，而不会像 JNI 那样危险和脆弱。

外部函数和内存 API 在 Java 17 中进行了第一轮孵化，由 [JEP 412](https://openjdk.java.net/jeps/412) 提出。第二轮孵化由[ JEP 419](https://openjdk.org/jeps/419) 提出并集成到了 Java 18 中，预览由 [JEP 424](https://openjdk.org/jeps/424) 提出并集成到了 Java 19 中。

在没有外部函数和内存 API 之前：

- Java 通过 [`sun.misc.Unsafe`](https://hg.openjdk.java.net/jdk/jdk/file/tip/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java) 提供一些执行低级别、不安全操作的方法（如直接访问系统内存资源、自主管理内存资源等），`Unsafe` 类让 Java 语言拥有了类似 C 语言指针一样操作内存空间的能力的同时，也增加了 Java 语言的不安全性，不正确使用 `Unsafe` 类会使得程序出错的概率变大。
- Java 1.1 就已通过 Java 原生接口（JNI）支持了原生方法调用，但并不好用。JNI 实现起来过于复杂，步骤繁琐（具体的步骤可以参考这篇文章：[Guide to JNI (Java Native Interface)](https://www.baeldung.com/jni) ），不受 JVM 的语言安全机制控制，影响 Java 语言的跨平台特性。并且，JNI 的性能也不行，因为 JNI 方法调用不能从许多常见的 JIT 优化(如内联)中受益。虽然[JNA](https://github.com/java-native-access/jna)、[JNR](https://github.com/jnr/jnr-ffi)和[JavaCPP](https://github.com/bytedeco/javacpp)等框架对 JNI 进行了改进，但效果还是不太理想。

引入外部函数和内存 API 就是为了解决 Java 访问外部函数和外部内存存在的一些痛点。

Foreign Function & Memory API (FFM API) 定义了类和接口：

- 分配外部内存 ：`MemorySegment`、、`MemoryAddress`和`SegmentAllocator`）；
- 操作和访问结构化的外部内存： `MemoryLayout`, `VarHandle`；
- 控制外部内存的分配和释放：`MemorySession`；
- 调用外部函数：`Linker`、`FunctionDescriptor`和`SymbolLookup`。

下面是 FFM API 使用示例，这段代码获取了 C 库函数的 `radixsort` 方法句柄，然后使用它对 Java 数组中的四个字符串进行排序。

```java
// 1. 在C库路径上查找外部函数
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixSort = linker.downcallHandle(
                             stdlib.lookup("radixsort"), ...);
// 2. 分配堆上内存以存储四个字符串
String[] javaStrings   = { "mouse", "cat", "dog", "car" };
// 3. 分配堆外内存以存储四个指针
SegmentAllocator allocator = implicitAllocator();
MemorySegment offHeap  = allocator.allocateArray(ValueLayout.ADDRESS, javaStrings.length);
// 4. 将字符串从堆上复制到堆外
for (int i = 0; i < javaStrings.length; i++) {
    // 在堆外分配一个字符串，然后存储指向它的指针
    MemorySegment cString = allocator.allocateUtf8String(javaStrings[i]);
    offHeap.setAtIndex(ValueLayout.ADDRESS, i, cString);
}
// 5. 通过调用外部函数对堆外数据进行排序
radixSort.invoke(offHeap, javaStrings.length, MemoryAddress.NULL, '\0');
// 6. 将(重新排序的)字符串从堆外复制到堆上
for (int i = 0; i < javaStrings.length; i++) {
    MemoryAddress cStringPtr = offHeap.getAtIndex(ValueLayout.ADDRESS, i);
    javaStrings[i] = cStringPtr.getUtf8String(0);
}
assert Arrays.equals(javaStrings, new String[] {"car", "cat", "dog", "mouse"});  // true
```

## JEP 425: 虚拟线程（预览）

虚拟线程（Virtual Thread-）是 JDK 而不是 OS 实现的轻量级线程(Lightweight Process，LWP），许多虚拟线程共享同一个操作系统线程，虚拟线程的数量可以远大于操作系统线程的数量。

虚拟线程在其他多线程语言中已经被证实是十分有用的，比如 Go 中的 Goroutine、Erlang 中的进程。

虚拟线程避免了上下文切换的额外耗费，兼顾了多线程的优点，简化了高并发程序的复杂，可以有效减少编写、维护和观察高吞吐量并发应用程序的工作量。

知乎有一个关于 Java 19 虚拟线程的讨论，感兴趣的可以去看看：https://www.zhihu.com/question/536743167 。

Java 虚拟线程的详细解读和原理可以看下面这两篇文章：

- [Java19 正式 GA！看虚拟线程如何大幅提高系统吞吐量](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [虚拟线程 - VirtualThread源码透视](https://www.cnblogs.com/throwable/p/16758997.html)

## JEP 426: 向量 API（第四次孵化）

向量（Vector） API 最初由 [JEP 338](https://openjdk.java.net/jeps/338) 提出，并作为[孵化 API](http://openjdk.java.net/jeps/11)集成到 Java 16 中。第二轮孵化由 [JEP 414](https://openjdk.java.net/jeps/414) 提出并集成到 Java 17 中，第三轮孵化由 [JEP 417](https://openjdk.java.net/jeps/417) 提出并集成到 Java 18 中，第四轮由 [JEP 426](https://openjdk.java.net/jeps/426) 提出并集成到了 Java 19 中。

在 [Java 18 新特性概览](./java18.md) 中，我有详细介绍到向量 API，这里就不再做额外的介绍了。

## JEP 428: 结构化并发(孵化)

JDK 19 引入了结构化并发，一种多线程编程方法，目的是为了通过结构化并发 API 来简化多线程编程，并不是为了取代`java.util.concurrent`，目前处于孵化器阶段。

结构化并发将不同线程中运行的多个任务视为单个工作单元，从而简化错误处理、提高可靠性并增强可观察性。也就是说，结构化并发保留了单线程代码的可读性、可维护性和可观察性。

结构化并发的基本 API 是[`StructuredTaskScope`](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html)。`StructuredTaskScope` 支持将任务拆分为多个并发子任务，在它们自己的线程中执行，并且子任务必须在主任务继续之前完成。

`StructuredTaskScope` 的基本用法如下：

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // 使用fork方法派生线程来执行子任务
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // 等待线程完成
        scope.join();
        // 结果的处理可能包括处理或重新抛出异常
        ... process results/exceptions ...
    } // close
```

结构化并发非常适合虚拟线程，虚拟线程是 JDK 实现的轻量级线程。许多虚拟线程共享同一个操作系统线程，从而允许非常多的虚拟线程。