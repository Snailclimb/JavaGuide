---
title: Java 24 新特性概览
category: Java
tag:
  - Java新特性
head:
  - - meta
    - name: keywords
      content: Java 24,JDK24,JEP 更新,语言特性,GC 改进,平台增强
  - - meta
    - name: description
      content: 总结 JDK 24 的新特性与改动，便于跟踪 Java 演进。
---

[JDK 24](https://openjdk.org/projects/jdk/24/) 是自 JDK 21 以来的第三个非长期支持版本，和 [JDK 22](https://javaguide.cn/java/new-features/java22-23.html)、[JDK 23](https://javaguide.cn/java/new-features/java22-23.html)一样。下一个长期支持版是 **JDK 25**，预计今年 9 月份发布。

JDK 24 带来的新特性还是蛮多的，一共 24 个。JDK 22 和 JDK 23 都只有 12 个，JDK 24 的新特性相当于这两次的总和了。因此，这个版本还是非常有必要了解一下的。

JDK 24 新特性概览：

![JDK 24 新特性](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk24-features.png)

下图是从 JDK 8 到 JDK 24 每个版本的更新带来的新特性数量和更新时间：

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 478: 密钥派生函数 API（预览）

密钥派生函数 API 是一种用于从初始密钥和其他数据派生额外密钥的加密算法。它的核心作用是为不同的加密目的（如加密、认证等）生成多个不同的密钥，避免密钥重复使用带来的安全隐患。 这在现代加密中是一个重要的里程碑，为后续新兴的量子计算环境打下了基础

通过该 API，开发者可以使用最新的密钥派生算法（如 HKDF 和未来的 Argon2）：

```java
// 创建一个 KDF 对象，使用 HKDF-SHA256 算法
KDF hkdf = KDF.getInstance("HKDF-SHA256");

// 创建 Extract 和 Expand 参数规范
AlgorithmParameterSpec params =
    HKDFParameterSpec.ofExtract()
                     .addIKM(initialKeyMaterial) // 设置初始密钥材料
                     .addSalt(salt)             // 设置盐值
                     .thenExpand(info, 32);     // 设置扩展信息和目标长度

// 派生一个 32 字节的 AES 密钥
SecretKey key = hkdf.deriveKey("AES", params);

// 可以使用相同的 KDF 对象进行其他密钥派生操作
```

## JEP 483: 提前类加载和链接

在传统 JVM 中，应用在每次启动时需要动态加载和链接类。这种机制对启动时间敏感的应用（如微服务或无服务器函数）带来了显著的性能瓶颈。该特性通过缓存已加载和链接的类，显著减少了重复工作的开销，显著减少 Java 应用程序的启动时间。测试表明，对大型应用（如基于 Spring 的服务器应用），启动时间可减少 40% 以上。

这个优化是零侵入性的，对应用程序、库或框架的代码无需任何更改，启动也方式保持一致，仅需添加相关 JVM 参数（如 `-XX:+ClassDataSharing`）。

## JEP 484: 类文件 API

类文件 API 在 JDK 22 进行了第一次预览（[JEP 457](https://openjdk.org/jeps/457)），在 JDK 23 进行了第二次预览并进一步完善（[JEP 466](https://openjdk.org/jeps/466)）。最终，该特性在 JDK 24 中顺利转正。

类文件 API 的目标是提供一套标准化的 API，用于解析、生成和转换 Java 类文件，取代过去对第三方库（如 ASM）在类文件处理上的依赖。

```java
// 创建一个 ClassFile 对象，这是操作类文件的入口。
ClassFile cf = ClassFile.of();
// 解析字节数组为 ClassModel
ClassModel classModel = cf.parse(bytes);

// 构建新的类文件，移除以 "debug" 开头的所有方法
byte[] newBytes = cf.build(classModel.thisClass().asSymbol(),
        classBuilder -> {
            // 遍历所有类元素
            for (ClassElement ce : classModel) {
                // 判断是否为方法 且 方法名以 "debug" 开头
                if (!(ce instanceof MethodModel mm
                        && mm.methodName().stringValue().startsWith("debug"))) {
                    // 添加到新的类文件中
                    classBuilder.with(ce);
                }
            }
        });
```

## JEP 485: 流收集器

流收集器 `Stream::gather(Gatherer)` 是一个强大的新特性，它允许开发者定义自定义的中间操作，从而实现更复杂、更灵活的数据转换。`Gatherer` 接口是该特性的核心，它定义了如何从流中收集元素，维护中间状态，并在处理过程中生成结果。

与现有的 `filter`、`map` 或 `distinct` 等内置操作不同，`Stream::gather` 使得开发者能够实现那些难以用标准 Stream 操作完成的任务。例如，可以使用 `Stream::gather` 实现滑动窗口、自定义规则的去重、或者更复杂的状态转换和聚合。 这种灵活性极大地扩展了 Stream API 的应用范围，使开发者能够应对更复杂的数据处理场景。

基于 `Stream::gather(Gatherer)` 实现字符串长度的去重逻辑：

```java
var result = Stream.of("foo", "bar", "baz", "quux")
                   .gather(Gatherer.ofSequential(
                       HashSet::new, // 初始化状态为 HashSet,用于保存已经遇到过的字符串长度
                       (set, str, downstream) -> {
                           if (set.add(str.length())) {
                               return downstream.push(str);
                           }
                           return true; // 继续处理流
                       }
                   ))
                   .toList();// 转换为列表

// 输出结果 ==> [foo, quux]
```

## JEP 486: 永久禁用安全管理器

JDK 24 不再允许启用 `Security Manager`，即使通过 `java -Djava.security.manager`命令也无法启用，这是逐步移除该功能的关键一步。虽然 `Security Manager` 曾经是 Java 中限制代码权限（如访问文件系统或网络、读取或写入敏感文件、执行系统命令）的重要工具，但由于复杂性高、使用率低且维护成本大，Java 社区决定最终移除它。

## JEP 487: 作用域值 （第四次预览）

作用域值（Scoped Values）可以在线程内和线程间共享不可变的数据，优于线程局部变量，尤其是在使用大量虚拟线程时。

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

作用域值允许在大型程序中的组件之间安全有效地共享数据，而无需求助于方法参数。

## JEP 491: 虚拟线程的同步而不固定平台线程

优化了虚拟线程与 `synchronized` 的工作机制。 虚拟线程在 `synchronized` 方法和代码块中阻塞时，通常能够释放其占用的操作系统线程（平台线程），避免了对平台线程的长时间占用，从而提升应用程序的并发能力。 这种机制避免了“固定 (Pinning)”——即虚拟线程长时间占用平台线程，阻止其服务于其他虚拟线程的情况。

现有的使用 `synchronized` 的 Java 代码无需修改即可受益于虚拟线程的扩展能力。 例如，一个 I/O 密集型的应用程序，如果使用传统的平台线程，可能会因为线程阻塞而导致并发能力下降。 而使用虚拟线程，即使在 `synchronized` 块中发生阻塞，也不会固定平台线程，从而允许平台线程继续服务于其他虚拟线程，提高整体的并发性能。

## JEP 493: 在没有 JMOD 文件的情况下链接运行时镜像

默认情况下，JDK 同时包含运行时镜像（运行时所需的模块）和 JMOD 文件。这个特性使得 jlink 工具无需使用 JDK 的 JMOD 文件就可以创建自定义运行时镜像，减少了 JDK 的安装体积（约 25%）。

说明：

- Jlink 是随 Java 9 一起发布的新命令行工具。它允许开发人员为基于模块的 Java 应用程序创建自己的轻量级、定制的 JRE。
- JMOD 文件是 Java 模块的描述文件，包含了模块的元数据和资源。

## JEP 495: 简化的源文件和实例主方法（第四次预览）

这个特性主要简化了 `main` 方法的声明。对于 Java 初学者来说，这个 `main` 方法的声明引入了太多的 Java 语法概念，不利于初学者快速上手。

没有使用该特性之前定义一个 `main` 方法：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

使用该新特性之后定义一个 `main` 方法：

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

进一步简化（未命名的类允许我们省略类名）

```java
void main() {
   System.out.println("Hello, World!");
}
```

## JEP 497: 量子抗性数字签名算法 (ML-DSA)

JDK 24 引入了支持实施抗量子的基于模块晶格的数字签名算法 （Module-Lattice-Based Digital Signature Algorithm, **ML-DSA**），为抵御未来量子计算机可能带来的威胁做准备。

ML-DSA 是美国国家标准与技术研究院（NIST）在 FIPS 204 中标准化的量子抗性算法，用于数字签名和身份验证。

## JEP 498: 使用 `sun.misc.Unsafe` 内存访问方法时发出警告

JDK 23([JEP 471](https://openjdk.org/jeps/471)) 提议弃用 `sun.misc.Unsafe` 中的内存访问方法，这些方法将来的版本中会被移除。在 JDK 24 中，当首次调用 `sun.misc.Unsafe` 的任何内存访问方法时，运行时会发出警告。

这些不安全的方法已有安全高效的替代方案：

- `java.lang.invoke.VarHandle` ：JDK 9 (JEP 193) 中引入，提供了一种安全有效地操作堆内存的方法，包括对象的字段、类的静态字段以及数组元素。
- `java.lang.foreign.MemorySegment` ：JDK 22 (JEP 454) 中引入，提供了一种安全有效地访问堆外内存的方法，有时会与 `VarHandle` 协同工作。

这两个类是 Foreign Function & Memory API（外部函数和内存 API） 的核心组件，分别用于管理和操作堆外内存。Foreign Function & Memory API 在 JDK 22 中正式转正，成为标准特性。

```java
import jdk.incubator.foreign.*;
import java.lang.invoke.VarHandle;

// 管理堆外整数数组的类
class OffHeapIntBuffer {

    // 用于访问整数元素的VarHandle
    private static final VarHandle ELEM_VH = ValueLayout.JAVA_INT.arrayElementVarHandle();

    // 内存管理器
    private final Arena arena;

    // 堆外内存段
    private final MemorySegment buffer;

    // 构造函数，分配指定数量的整数空间
    public OffHeapIntBuffer(long size) {
        this.arena  = Arena.ofShared();
        this.buffer = arena.allocate(ValueLayout.JAVA_INT, size);
    }

    // 释放内存
    public void deallocate() {
        arena.close();
    }

    // 以volatile方式设置指定索引的值
    public void setVolatile(long index, int value) {
        ELEM_VH.setVolatile(buffer, 0L, index, value);
    }

    // 初始化指定范围的元素为0
    public void initialize(long start, long n) {
        buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                       ValueLayout.JAVA_INT.byteSize() * n)
              .fill((byte) 0);
    }

    // 将指定范围的元素复制到新数组
    public int[] copyToNewArray(long start, int n) {
        return buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                              ValueLayout.JAVA_INT.byteSize() * n)
                     .toArray(ValueLayout.JAVA_INT);
    }
}
```

## JEP 499: 结构化并发（第四次预览）

JDK 19 引入了结构化并发，一种多线程编程方法，目的是为了通过结构化并发 API 来简化多线程编程，并不是为了取代`java.util.concurrent`，目前处于孵化器阶段。

结构化并发将不同线程中运行的多个任务视为单个工作单元，从而简化错误处理、提高可靠性并增强可观察性。也就是说，结构化并发保留了单线程代码的可读性、可维护性和可观察性。

结构化并发的基本 API 是`StructuredTaskScope`，它支持将任务拆分为多个并发子任务，在它们自己的线程中执行，并且子任务必须在主任务继续之前完成。

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
