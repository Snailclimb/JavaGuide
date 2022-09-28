---
title: Java 17 新特性概览
category: Java
tag:
  - Java新特性
---

Java 17 在 2021 年 9 月 14 日正式发布，Java 17 是一个长期支持（LTS）版本，这次更新共带来 14 个新特性：

- [JEP 306:Restore Always-Strict Floating-Point Semantics（恢复始终严格的浮点语义）](https://openjdk.java.net/jeps/306)
- [JEP 356:Enhanced Pseudo-Random Number Generators（增强的伪随机数生成器）](https://openjdk.java.net/jeps/356)
- [JEP 382:New macOS Rendering Pipeline（新的 macOS 渲染管道）](https://openjdk.java.net/jeps/382)
- [JEP 391:macOS/AArch64 Port（支持 macOS AArch64）](https://openjdk.java.net/jeps/391)
- [JEP 398:Deprecate the Applet API for Removal（删除已弃用的 Applet API）](https://openjdk.java.net/jeps/398)
- [JEP 403:Strongly Encapsulate JDK Internals（更强大的封装 JDK 内部元素）](https://openjdk.java.net/jeps/403)
- [JEP 406:Pattern Matching for switch (switch 的类型匹配)](https://openjdk.java.net/jeps/406)（预览）
- [JEP 407:Remove RMI Activation（删除远程方法调用激活机制）](https://openjdk.java.net/jeps/407)
- [JEP 409:Sealed Classes（密封类）](https://openjdk.java.net/jeps/409)（转正）
- [JEP 410:Remove the Experimental AOT and JIT Compiler（删除实验性的 AOT 和 JIT 编译器）](https://openjdk.java.net/jeps/410)
- [JEP 411:Deprecate the Security Manager for Removal（弃用安全管理器以进行删除）](https://openjdk.java.net/jeps/411)
- [JEP 412:Foreign Function & Memory API (外部函数和内存 API)](https://openjdk.java.net/jeps/412)（孵化）
- [JEP 414:Vector（向量） API ](https://openjdk.java.net/jeps/417)（第二次孵化）
- [JEP 415:Context-Specific Deserialization Filters](https://openjdk.java.net/jeps/415)

这里只对 356、398、413、406、407、409、410、411、412、414 这几个我觉得比较重要的新特性进行详细介绍。

相关阅读：[OpenJDK Java 17 文档](https://openjdk.java.net/projects/jdk/17/) 。

## JEP 356:增强的伪随机数生成器

JDK 17 之前，我们可以借助 `Random`、`ThreadLocalRandom`和`SplittableRandom`来生成随机数。不过，这 3 个类都各有缺陷，且缺少常见的伪随机算法支持。

Java 17 为伪随机数生成器 （pseudorandom number generator，RPNG，又称为确定性随机位生成器）增加了新的接口类型和实现，使得开发者更容易在应用程序中互换使用各种 PRNG 算法。

> [RPNG](https://ctf-wiki.org/crypto/streamcipher/prng/intro/) 用来生成接近于绝对随机数序列的数字序列。一般来说，PRNG 会依赖于一个初始值，也称为种子，来生成对应的伪随机数序列。只要种子确定了，PRNG 所生成的随机数就是完全确定的，因此其生成的随机数序列并不是真正随机的。

使用示例：

```java
RandomGeneratorFactory<RandomGenerator> l128X256MixRandom = RandomGeneratorFactory.of("L128X256MixRandom");
// 使用时间戳作为随机数种子
RandomGenerator randomGenerator = l128X256MixRandom.create(System.currentTimeMillis());
// 生成随机数
randomGenerator.nextInt(10));
```

## JEP 398:弃用 Applet API 以进行删除

Applet API 用于编写在 Web 浏览器端运行的 Java 小程序，很多年前就已经被淘汰了，已经没有理由使用了。

Applet API 在 Java 9 时被标记弃用（[JEP 289](https://openjdk.java.net/jeps/289)），但不是为了删除。

## JEP 406:switch 的类型匹配（预览）

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

对于 `null` 值的判断也进行了优化。

```java
// Old code
static void testFooBar(String s) {
    if (s == null) {
        System.out.println("oops!");
        return;
    }
    switch (s) {
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}

// New code
static void testFooBar(String s) {
    switch (s) {
        case null         -> System.out.println("Oops");
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}
```

## JEP 407:删除远程方法调用激活机制

删除远程方法调用 (RMI) 激活机制，同时保留 RMI 的其余部分。RMI 激活机制已过时且不再使用。

## JEP 409：密封类（转正）

密封类由 [JEP 360](https://openjdk.java.net/jeps/360) 提出预览，集成到了 Java 15 中。在 JDK 16 中， 密封类得到了改进（更加严格的引用检查和密封类的继承关系），由 [JEP 397](https://openjdk.java.net/jeps/397) 提出了再次预览。

在 [Java 15 新特性概览](./java15.md) 中，我有详细介绍到密封类，这里就不再做额外的介绍了。

## JEP 410:删除实验性的 AOT 和 JIT 编译器

在 Java 9 的 [JEP 295](https://openjdk.java.net/jeps/295) ,引入了实验性的提前 (AOT) 编译器，在启动虚拟机之前将 Java 类编译为本机代码。

Java 17，删除实验性的提前 (AOT) 和即时 (JIT) 编译器，因为该编译器自推出以来很少使用，维护它所需的工作量很大。保留实验性的 Java 级 JVM 编译器接口 (JVMCI)，以便开发人员可以继续使用外部构建的编译器版本进行 JIT 编译。

## JEP 411:弃用安全管理器以进行删除

弃用安全管理器以便在将来的版本中删除。

安全管理器可追溯到 Java 1.0，多年来，它一直不是保护客户端 Java 代码的主要方法，也很少用于保护服务器端代码。为了推动 Java 向前发展，Java 17 弃用安全管理器，以便与旧版 Applet API ( [JEP 398](https://openjdk.java.net/jeps/398) ) 一起移除。

## JEP 412:外部函数和内存 API（孵化）

Java 程序可以通过该 API 与 Java 运行时之外的代码和数据进行互操作。通过高效地调用外部函数（即 JVM 之外的代码）和安全地访问外部内存（即不受 JVM 管理的内存），该 API 使 Java 程序能够调用本机库并处理本机数据，而不会像 JNI 那样危险和脆弱。

外部函数和内存 API 在 Java 17 中进行了第一轮孵化，由 [JEP 412](https://openjdk.java.net/jeps/412) 提出。第二轮孵化由[ JEP 419](https://openjdk.org/jeps/419) 提出并集成到了 Java 18 中，预览由 [JEP 424](https://openjdk.org/jeps/424) 提出并集成到了 Java 19 中。

在 [Java 19 新特性概览](./java19.md) 中，我有详细介绍到外部函数和内存 API，这里就不再做额外的介绍了。

## JEP 414:向量 API（第二次孵化）

向量（Vector） API 最初由 [JEP 338](https://openjdk.java.net/jeps/338) 提出，并作为[孵化 API](http://openjdk.java.net/jeps/11)集成到 Java 16 中。第二轮孵化由 [JEP 414](https://openjdk.java.net/jeps/414) 提出并集成到 Java 17 中，第三轮孵化由 [JEP 417](https://openjdk.java.net/jeps/417) 提出并集成到 Java 18 中，第四轮由 [JEP 426](https://openjdk.java.net/jeps/426) 提出并集成到了 Java 19 中。

该孵化器 API 提供了一个 API 的初始迭代以表达一些向量计算，这些计算在运行时可靠地编译为支持的 CPU 架构上的最佳向量硬件指令，从而获得优于同等标量计算的性能，充分利用单指令多数据（SIMD）技术（大多数现代 CPU 上都可以使用的一种指令）。尽管 HotSpot 支持自动向量化，但是可转换的标量操作集有限且易受代码更改的影响。该 API 将使开发人员能够轻松地用 Java 编写可移植的高性能向量算法。

在 [Java 18 新特性概览](./java18.md) 中，我有详细介绍到向量 API，这里就不再做额外的介绍了。