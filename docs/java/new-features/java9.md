---
title: Java 9 新特性概览
category: Java
tag:
  - Java新特性
---

**Java 9** 发布于 2017 年 9 月 21 日 。作为 Java 8 之后 3 年半才发布的新版本，Java 9 带来了很多重大的变化其中最重要的改动是 Java 平台模块系统的引入，其他还有诸如集合、`Stream` 流......。

你可以在 [Archived OpenJDK General-Availability Releases](http://jdk.java.net/archive/) 上下载自己需要的 JDK 版本！官方的新特性说明文档地址： https://openjdk.java.net/projects/jdk/ 。

**概览（精选了一部分）** ：

- [JEP 222: Java 命令行工具](https://openjdk.java.net/jeps/222)
- [JEP 261: 模块化系统](https://openjdk.java.net/jeps/261)
- [JEP 248：G1 成为默认垃圾回收器](https://openjdk.java.net/jeps/248)
- [JEP 193: 变量句柄](https://openjdk.java.net/jeps/193)
- [JEP 254：字符串存储结构优化](https://openjdk.java.net/jeps/254)

## JShell

JShell 是 Java 9 新增的一个实用工具。为 Java 提供了类似于 Python 的实时命令行交互工具。

在 JShell 中可以直接输入表达式并查看其执行结果。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816083417616.png)

**JShell 为我们带来了哪些好处呢？**

1. 降低了输出第一行 Java 版"Hello World！"的门槛，能够提高新手的学习热情。
2. 在处理简单的小逻辑，验证简单的小问题时，比 IDE 更有效率（并不是为了取代 IDE，对于复杂逻辑的验证，IDE 更合适，两者互补）。
3. ......

**JShell 的代码和普通的可编译代码，有什么不一样？**

1. 一旦语句输入完成，JShell 立即就能返回执行的结果，而不再需要编辑器、编译器、解释器。
2. JShell 支持变量的重复声明，后面声明的会覆盖前面声明的。
3. JShell 支持独立的表达式比如普通的加法运算 `1 + 1`。
4. ......

## 模块化系统

模块系统是[Jigsaw Project](https://openjdk.java.net/projects/jigsaw/)的一部分，把模块化开发实践引入到了 Java 平台中，可以让我们的代码可重用性更好！

**什么是模块系统？** 官方的定义是：

> A uniquely named, reusable group of related packages, as well as resources (such as images and XML files) and a module descriptor。

简单来说，你可以将一个模块看作是一组唯一命名、可重用的包、资源和模块描述文件（`module-info.java`）。

任意一个 jar 文件，只要加上一个模块描述文件（`module-info.java`），就可以升级为一个模块。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/module-structure.png)

在引入了模块系统之后，JDK 被重新组织成 94 个模块。Java 应用可以通过新增的 **[jlink](http://openjdk.java.net/jeps/282) 工具** (Jlink 是随 Java 9 一起发布的新命令行工具。它允许开发人员为基于模块的 Java 应用程序创建自己的轻量级、定制的 JRE)，创建出只包含所依赖的 JDK 模块的自定义运行时镜像。这样可以极大的减少 Java 运行时环境的大小。

我们可以通过 `exports` 关键词精准控制哪些类可以对外开放使用，哪些类只能内部使用。

```java
module my.module {
    //exports 公开指定包的所有公共成员
    exports com.my.package.name;
}

module my.module {
     //exports…to 限制访问的成员范围
    export com.·my.package.name to com.specific.package;
}
```

想要深入了解 Java 9 的模块化，可以参考下面这几篇文章：

- [《Project Jigsaw: Module System Quick-Start Guide》](https://openjdk.java.net/projects/jigsaw/quick-start)
- [《Java 9 Modules: part 1》](https://stacktraceguru.com/java9/module-introduction)
- [[Java 9 揭秘（2. 模块化系统）](https://www.cnblogs.com/IcanFixIt/p/6947763.html)](http://www.cnblogs.com/IcanFixIt/p/6947763.html)

## G1 成为默认垃圾回收器

在 Java 8 的时候，默认垃圾回收器是 Parallel Scavenge（新生代）+Parallel Old（老年代）。到了 Java 9, CMS 垃圾回收器被废弃了，**G1（Garbage-First Garbage Collector）**  成为了默认垃圾回收器。

G1 还是在 Java 7 中被引入的，经过两个版本优异的表现成为成为默认垃圾回收器。


## 快速创建不可变集合

增加了`List.of()`、`Set.of()`、`Map.of()` 和 `Map.ofEntries()`等工厂方法来创建不可变集合（有点参考 Guava 的味道）：

```java
List.of("Java", "C++");
Set.of("Java", "C++");
Map.of("Java", 1, "C++", 2);
```

使用 `of()` 创建的集合为不可变集合，不能进行添加、删除、替换、 排序等操作，不然会报 `java.lang.UnsupportedOperationException` 异常。

## String 存储结构优化

Java 8 及之前的版本，`String` 一直是用 `char[]` 存储。在 Java 9 之后，`String` 的实现改用 `byte[]` 数组存储字符串，节省了空间。

```java
public final class String implements java.io.Serializable,Comparable<String>, CharSequence {
    // @Stable 注解表示变量最多被修改一次，称为“稳定的”。
    @Stable
    private final byte[] value;
}
```

## 接口私有方法

Java 9 允许在接口中使用私有方法。这样的话，接口的使用就更加灵活了，有点像是一个简化版的抽象类。

```java
public interface MyInterface {
    private void methodPrivate(){
    }
}
```

## try-with-resources 增强

在 Java 9 之前，我们只能在 `try-with-resources` 块中声明变量：

```java
try (Scanner scanner = new Scanner(new File("testRead.txt"));
    PrintWriter writer = new PrintWriter(new File("testWrite.txt"))) {
    // omitted
}
```

在 Java 9 之后，在 `try-with-resources` 语句中可以使用 effectively-final 变量。

```java
final Scanner scanner = new Scanner(new File("testRead.txt"));
PrintWriter writer = new PrintWriter(new File("testWrite.txt"))
try (scanner;writer) {
    // omitted
}
```

**什么是 effectively-final 变量？** 简单来说就是没有被 `final` 修饰但是值在初始化后从未更改的变量。

正如上面的代码所演示的那样，即使 `writer` 变量没有被显示声明为 `final`，但它在第一次被复制后就不会改变了，因此，它就是 effectively-final 变量。

## Stream & Optional 增强

`Stream` 中增加了新的方法 `ofNullable()`、`dropWhile()`、`takeWhile()` 以及 `iterate()` 方法的重载方法。

Java 9 中的 `ofNullable()` 方 法允许我们创建一个单元素的 `Stream`，可以包含一个非空元素，也可以创建一个空 `Stream`。 而在 Java 8 中则不可以创建空的 `Stream` 。

```java
Stream<String> stringStream = Stream.ofNullable("Java");
System.out.println(stringStream.count());// 1
Stream<String> nullStream = Stream.ofNullable(null);
System.out.println(nullStream.count());//0
```

`takeWhile()` 方法可以从 `Stream` 中依次获取满足条件的元素，直到不满足条件为止结束获取。

```java
List<Integer> integerList = List.of(11, 33, 66, 8, 9, 13);
integerList.stream().takeWhile(x -> x < 50).forEach(System.out::println);// 11 33
```

`dropWhile()` 方法的效果和 `takeWhile()` 相反。

```java
List<Integer> integerList2 = List.of(11, 33, 66, 8, 9, 13);
integerList2.stream().dropWhile(x -> x < 50).forEach(System.out::println);// 66 8 9 13
```

`iterate()` 方法的新重载方法提供了一个 `Predicate` 参数 (判断条件)来决定什么时候结束迭代

```java
public static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) {
}
// 新增加的重载方法
public static<T> Stream<T> iterate(T seed, Predicate<? super T> hasNext, UnaryOperator<T> next) {

}
```

两者的使用对比如下，新的 `iterate()` 重载方法更加灵活一些。

```java
// 使用原始 iterate() 方法输出数字 1~10
Stream.iterate(1, i -> i + 1).limit(10).forEach(System.out::println);
// 使用新的 iterate() 重载方法输出数字 1~10
Stream.iterate(1, i -> i <= 10, i -> i + 1).forEach(System.out::println);
```

`Optional` 类中新增了 `ifPresentOrElse()`、`or()` 和 `stream()` 等方法

`ifPresentOrElse()` 方法接受两个参数 `Consumer` 和 `Runnable` ，如果 `Optional` 不为空调用 `Consumer` 参数，为空则调用 `Runnable` 参数。

```java
public void ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction)

Optional<Object> objectOptional = Optional.empty();
objectOptional.ifPresentOrElse(System.out::println, () -> System.out.println("Empty!!!"));// Empty!!!
```

`or()` 方法接受一个 `Supplier` 参数 ，如果 `Optional` 为空则返回 `Supplier` 参数指定的 `Optional` 值。

```java
public Optional<T> or(Supplier<? extends Optional<? extends T>> supplier)

Optional<Object> objectOptional = Optional.empty();
objectOptional.or(() -> Optional.of("java")).ifPresent(System.out::println);//java
```

## 进程 API

Java 9 增加了 `java.lang.ProcessHandle` 接口来实现对原生进程进行管理，尤其适合于管理长时间运行的进程。

```java
// 获取当前正在运行的 JVM 的进程
ProcessHandle currentProcess = ProcessHandle.current();
// 输出进程的 id
System.out.println(currentProcess.pid());
// 输出进程的信息
System.out.println(currentProcess.info());
```

`ProcessHandle` 接口概览：

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816104614414.png)

## 响应式流 （ Reactive Streams ）

在 Java 9 中的 `java.util.concurrent.Flow` 类中新增了反应式流规范的核心接口 。

`Flow` 中包含了 `Flow.Publisher`、`Flow.Subscriber`、`Flow.Subscription` 和 `Flow.Processor` 等 4 个核心接口。Java 9 还提供了`SubmissionPublisher` 作为`Flow.Publisher` 的一个实现。

关于 Java 9 响应式流更详细的解读，推荐你看 [Java 9 揭秘（17. Reactive Streams ）- 林本托 ](https://www.cnblogs.com/IcanFixIt/p/7245377.html) 这篇文章。

## 变量句柄

变量句柄是一个变量或一组变量的引用，包括静态域，非静态域，数组元素和堆外数据结构中的组成部分等。

变量句柄的含义类似于已有的方法句柄 `MethodHandle` ，由 Java 类 `java.lang.invoke.VarHandle` 来表示，可以使用类 `java.lang.invoke.MethodHandles.Lookup` 中的静态工厂方法来创建 `VarHandle` 对象。

`VarHandle` 的出现替代了 `java.util.concurrent.atomic` 和 `sun.misc.Unsafe` 的部分操作。并且提供了一系列标准的内存屏障操作，用于更加细粒度的控制内存排序。在安全性、可用性、性能上都要优于现有的 API。

## 其它

- **平台日志 API 改进** ： Java 9 允许为 JDK 和应用配置同样的日志实现。新增了 `System.LoggerFinder` 用来管理 JDK 使 用的日志记录器实现。JVM 在运行时只有一个系统范围的 `LoggerFinder` 实例。我们可以通过添加自己的 `System.LoggerFinder` 实现来让 JDK 和应用使用 SLF4J 等其他日志记录框架。
- **`CompletableFuture`类增强** ：新增了几个新的方法（`completeAsync` ，`orTimeout` 等）。
- **Nashorn 引擎的增强** ：Nashorn 从 Java8 开始引入的 JavaScript 引擎，Java9 对 Nashorn 做了些增强，实现了一些 ES6 的新特性（Java 11 中已经被弃用）。
- **I/O 流的新特性** ：增加了新的方法来读取和复制 `InputStream` 中包含的数据。
- **改进应用的安全性能** ：Java 9 新增了 4 个 SHA- 3 哈希算法，SHA3-224、SHA3-256、SHA3-384 和 SHA3-512。
- **改进方法句柄（Method Handle）** ：方法句柄从 Java7 开始引入，Java9 在类`java.lang.invoke.MethodHandles` 中新增了更多的静态方法来创建不同类型的方法句柄。
- ......

## 参考

- Java version history：https://en.wikipedia.org/wiki/Java_version_history
- Release Notes for JDK 9 and JDK 9 Update Releases : https://www.oracle.com/java/technologies/javase/9-all-relnotes.html
- 《深入剖析 Java 新特性》-极客时间 - JShell：怎么快速验证简单的小问题？
- New Features in Java 9:https://www.baeldung.com/new-java-9
- Java – Try with Resources：https://www.baeldung.com/java-try-with-resources