---
title: Java 10 新特性概览
category: Java
tag:
  - Java新特性
---

**Java 10** 发布于 2018 年 3 月 20 日，最知名的特性应该是 `var` 关键字（局部变量类型推断）的引入了，其他还有垃圾收集器改善、GC 改进、性能提升、线程管控等一批新特性。

**概览（精选了一部分）** ：

- [JEP 286：局部变量类型推断](https://openjdk.java.net/jeps/286)
- [JEP 304：垃圾回收器接口](https://openjdk.java.net/jeps/304)
- [JEP 307：G1 并行 Full GC](https://openjdk.java.net/jeps/307)
- [JEP 310：应用程序类数据共享(扩展 CDS 功能)](https://openjdk.java.net/jeps/310)
- [JEP 317：实验性的基于 Java 的 JIT 编译器](https://openjdk.java.net/jeps/317)

## 局部变量类型推断(var)

由于太多 Java 开发者希望 Java 中引入局部变量推断，于是 Java 10 的时候它来了，也算是众望所归了！

Java 10 提供了 `var` 关键字声明局部变量。

```java
var id = 0;
var codefx = new URL("https://mp.weixin.qq.com/");
var list = new ArrayList<>();
var list = List.of(1, 2, 3);
var map = new HashMap<String, String>();
var p = Paths.of("src/test/java/Java9FeaturesTest.java");
var numbers = List.of("a", "b", "c");
for (var n : list)
    System.out.print(n+ " ");
```

var 关键字只能用于带有构造器的局部变量和 for 循环中。

```java
var count=null; //❌编译不通过，不能声明为 null
var r = () -> Math.random();//❌编译不通过,不能声明为 Lambda表达式
var array = {1,2,3};//❌编译不通过,不能声明数组
```

var 并不会改变 Java 是一门静态类型语言的事实，编译器负责推断出类型。

另外，Scala 和 Kotlin 中已经有了  `val` 关键字 ( `final var` 组合关键字)。

相关阅读：[《Java 10 新特性之局部变量类型推断》](https://zhuanlan.zhihu.com/p/34911982)。

## 垃圾回收器接口

在早期的 JDK 结构中，组成垃圾收集器 (GC) 实现的组件分散在代码库的各个部分。 Java 10 通过引入一套纯净的垃圾收集器接口来将不同垃圾收集器的源代码分隔开。

## G1 并行 Full GC

从 Java9 开始 G1 就了默认的垃圾回收器，G1 是以一种低延时的垃圾回收器来设计的，旨在避免进行 Full GC,但是 Java9 的 G1 的 FullGC 依然是使用单线程去完成标记清除算法,这可能会导致垃圾回收期在无法回收内存的时候触发 Full GC。

为了最大限度地减少 Full GC 造成的应用停顿的影响，从 Java10 开始，G1 的 FullGC 改为并行的标记清除算法，同时会使用与年轻代回收和混合回收相同的并行工作线程数量，从而减少了 Full GC 的发生，以带来更好的性能提升、更大的吞吐量。

## 集合增强

`List`，`Set`，`Map` 提供了静态方法`copyOf()`返回入参集合的一个不可变拷贝。

```java
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
```

使用 `copyOf()` 创建的集合为不可变集合，不能进行添加、删除、替换、 排序等操作，不然会报 `java.lang.UnsupportedOperationException` 异常。 IDEA 也会有相应的提示。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816154125579.png)

并且，`java.util.stream.Collectors` 中新增了静态方法，用于将流中的元素收集为不可变的集合。

```java
var list = new ArrayList<>();
list.stream().collect(Collectors.toUnmodifiableList());
list.stream().collect(Collectors.toUnmodifiableSet());
```

## Optional 增强

`Optional` 新增了`orElseThrow()`方法来在没有值时抛出指定的异常。

```java
Optional.ofNullable(cache.getIfPresent(key))
        .orElseThrow(() -> new PrestoException(NOT_FOUND, "Missing entry found for key: " + key));
```

## 应用程序类数据共享(扩展 CDS 功能)

在 Java 5 中就已经引入了类数据共享机制 (Class Data Sharing，简称 CDS)，允许将一组类预处理为共享归档文件，以便在运行时能够进行内存映射以减少 Java 程序的启动时间，当多个 Java 虚拟机（JVM）共享相同的归档文件时，还可以减少动态内存的占用量，同时减少多个虚拟机在同一个物理或虚拟的机器上运行时的资源占用。CDS 在当时还是 Oracle JDK 的商业特性。

Java 10 在现有的 CDS 功能基础上再次拓展，以允许应用类放置在共享存档中。CDS 特性在原来的 bootstrap 类基础之上，扩展加入了应用类的 CDS 为 (Application Class-Data Sharing，AppCDS) 支持，大大加大了 CDS 的适用范围。其原理为：在启动时记录加载类的过程，写入到文本文件中，再次启动时直接读取此启动文本并加载。设想如果应用环境没有大的变化，启动速度就会得到提升。

## 实验性的基于 Java 的 JIT 编译器

Graal 是一个基于 Java 语言编写的 JIT 编译器，是 JDK 9 中引入的实验性 Ahead-of-Time (AOT) 编译器的基础。

Oracle 的 HotSpot VM 便附带两个用 C++ 实现的 JIT compiler：C1 及 C2。在Java 10 (Linux/x64, macOS/x64) 中，默认情况下HotSpot 仍使用C2，但通过向java 命令添加 `-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler` 参数便可将 C2 替换成 Graal。

相关阅读：[深入浅出 Java 10 的实验性 JIT 编译器 Graal - 郑雨迪](https://www.infoq.cn/article/java-10-jit-compiler-graal)

## 其他

- **线程-局部管控**：Java 10 中线程管控引入 JVM 安全点的概念，将允许在不运行全局 JVM 安全点的情况下实现线程回调，由线程本身或者 JVM 线程来执行，同时保持线程处于阻塞状态，这种方式使得停止单个线程变成可能，而不是只能启用或停止所有线程
- **备用存储装置上的堆分配**：Java 10 中将使得 JVM 能够使用适用于不同类型的存储机制的堆，在可选内存设备上进行堆内存分配
- ......

## 参考

- Java 10 Features and Enhancements : https://howtodoinjava.com/java10/java10-features/

- Guide to Java10 : <https://www.baeldung.com/java-10-overview>

- 4 Class Data Sharing : https://docs.oracle.com/javase/10/vm/class-data-sharing.htm#JSJVM-GUID-7EAA3411-8CF0-4D19-BD05-DF5E1780AA91

  