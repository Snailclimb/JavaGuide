---
title: Java 20 新特性概览
category: Java
tag:
  - Java新特性
---

JDK 20 于 2023 年 3 月 21 日发布，非长期支持版本。

根据开发计划，下一个 LTS 版本就是将于 2023 年 9 月发布的 JDK 21。

![](https://oss.javaguide.cn/github/javaguide/java/new-features/640.png)

JDK 20 只有 7 个新特性：

- [JEP 429：Scoped Values（作用域值）](https://openjdk.org/jeps/429)（第一次孵化）
- [JEP 432：Record Patterns（记录模式）](https://openjdk.org/jeps/432)（第二次预览）
- [JEP 433：switch 模式匹配](https://openjdk.org/jeps/433)（第四次预览）
- [JEP 434: Foreign Function & Memory API（外部函数和内存 API）](https://openjdk.org/jeps/434)（第二次预览）
- [JEP 436: Virtual Threads（虚拟线程）](https://openjdk.org/jeps/436)（第二次预览）
- [JEP 437: Structured Concurrency（结构化并发）](https://openjdk.org/jeps/437)(第二次孵化)
- [JEP 432：向量 API（](https://openjdk.org/jeps/438)第五次孵化）

## JEP 429：作用域值（第一次孵化）

作用域值（Scoped Values）它可以在线程内和线程间共享不可变的数据，优于线程局部变量，尤其是在使用大量虚拟线程时。

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

作用域值允许在大型程序中的组件之间安全有效地共享数据，而无需求助于方法参数。

关于作用域值的详细介绍，推荐阅读[作用域值常见问题解答](https://www.happycoders.eu/java/scoped-values/)。

## JEP 432：记录模式（第二次预览）

记录模式（Record Patterns） 可对 record 的值进行解构，可以嵌套记录模式和类型模式，实现强大的、声明性的和可组合的数据导航和处理形式。

记录模式不能单独使用，而是要与 instanceof 或 switch 模式匹配一同使用。

记录模式在 Java 19 进行了第一次预览， 由[JEP 405](https://openjdk.org/jeps/405)提出。JDK 20 中是第二次预览，由 [JEP 432](https://openjdk.org/jeps/432) 提出。这次的改进包括：

- 添加对通用记录模式类型参数推断的支持，
- 添加对记录模式的支持以出现在增强语句的标题中`for`
- 删除对命名记录模式的支持。

## JEP 433：switch 模式匹配（第四次预览）

正如 `instanceof` 一样， `switch` 也紧跟着增加了类型匹配自动转换功能。

`instanceof` 代码示例：

```java
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// New code
if (o instanceof String s) {
    ... use s ...
}
```

`switch` 代码示例：

```java
// Old code
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}

// New code
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}
```

`switch` 模式匹配分别在 Java17、Java18、Java19 中进行了预览，Java20 是第四次预览了。每一次的预览基本都会有一些小改进，这里就不细提了。

## JEP 434: 外部函数和内存 API（第二次预览）

Java 程序可以通过该 API 与 Java 运行时之外的代码和数据进行互操作。通过高效地调用外部函数（即 JVM 之外的代码）和安全地访问外部内存（即不受 JVM 管理的内存），该 API 使 Java 程序能够调用本机库并处理本机数据，而不会像 JNI 那样危险和脆弱。

外部函数和内存 API 在 Java 17 中进行了第一轮孵化，由 [JEP 412](https://openjdk.java.net/jeps/412) 提出。Java 18 中进行了第二次孵化，由[ JEP 419](https://openjdk.org/jeps/419) 提出。Java 19 中是第一次预览，由 [JEP 424](https://openjdk.org/jeps/424) 提出。

JDK 20 中是第二次预览，由 [JEP 434](https://openjdk.org/jeps/434) 提出，这次的改进包括：

- `MemorySegment` 和 `MemoryAddress` 抽象的统一
- 增强的 `MemoryLayout` 层次结构
- `MemorySession`拆分为`Arena`和`SegmentScope`，以促进跨维护边界的段共享。

在 [Java 19 新特性概览](./java19.md) 中，我有详细介绍到外部函数和内存 API，这里就不再做额外的介绍了。

## JEP 436: 虚拟线程（第二次预览）

虚拟线程（Virtual Thread-）是 JDK 而不是 OS 实现的轻量级线程(Lightweight Process，LWP），许多虚拟线程共享同一个操作系统线程，虚拟线程的数量可以远大于操作系统线程的数量。

虚拟线程在其他多线程语言中已经被证实是十分有用的，比如 Go 中的 Goroutine、Erlang 中的进程。

虚拟线程避免了上下文切换的额外耗费，兼顾了多线程的优点，简化了高并发程序的复杂，可以有效减少编写、维护和观察高吞吐量并发应用程序的工作量。

知乎有一个关于 Java 19 虚拟线程的讨论，感兴趣的可以去看看：https://www.zhihu.com/question/536743167 。

Java 虚拟线程的详细解读和原理可以看下面这两篇文章：

- [Java19 正式 GA！看虚拟线程如何大幅提高系统吞吐量](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [虚拟线程 - VirtualThread 源码透视](https://www.cnblogs.com/throwable/p/16758997.html)

虚拟线程在 Java 19 中进行了第一次预览，由[JEP 425](https://openjdk.org/jeps/425)提出。JDK 20 中是第二次预览，做了一些细微变化，这里就不细提了。

## JEP 437: 结构化并发(第二次孵化)

Java 19 引入了结构化并发，一种多线程编程方法，目的是为了通过结构化并发 API 来简化多线程编程，并不是为了取代`java.util.concurrent`，目前处于孵化器阶段。

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

JDK 20 中对结构化并发唯一变化是更新为支持在任务范围内创建的线程`StructuredTaskScope`继承范围值 这简化了跨线程共享不可变数据，详见[JEP 429 ](https://openjdk.org/jeps/429)。

## JEP 432：向量 API（第五次孵化）

向量计算由对向量的一系列操作组成。向量 API 用来表达向量计算，该计算可以在运行时可靠地编译为支持的 CPU 架构上的最佳向量指令，从而实现优于等效标量计算的性能。

向量 API 的目标是为用户提供简洁易用且与平台无关的表达范围广泛的向量计算。

向量（Vector） API 最初由 [JEP 338](https://openjdk.java.net/jeps/338) 提出，并作为[孵化 API](http://openjdk.java.net/jeps/11)集成到 Java 16 中。第二轮孵化由 [JEP 414](https://openjdk.java.net/jeps/414) 提出并集成到 Java 17 中，第三轮孵化由 [JEP 417](https://openjdk.java.net/jeps/417) 提出并集成到 Java 18 中，第四轮由 [JEP 426](https://openjdk.java.net/jeps/426) 提出并集成到了 Java 19 中。

Java20 的这次孵化基本没有改变向量 API ，只是进行了一些错误修复和性能增强，详见 [JEP 438](https://openjdk.org/jeps/438)。