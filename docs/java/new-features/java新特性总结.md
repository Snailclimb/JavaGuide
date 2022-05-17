# 一文带你看遍 JDK9~15 的重要新特性！

Java 8 新特性见这里：[Java8 新特性最佳指南](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247484744&idx=1&sn=9db31dca13d327678845054af75efb74&chksm=cea24a83f9d5c3956f4feb9956b068624ab2fdd6c4a75fe52d5df5dca356a016577301399548&token=1082669959&lang=zh_CN&scene=21#wechat_redirect) 。

你可以在 [Archived OpenJDK General-Availability Releases](http://jdk.java.net/archive/) 上下载自己需要的 JDK 版本！

官方的新特性说明文档地址： https://openjdk.java.net/projects/jdk/ 。

_Guide ：别人家的特性都用了几年了，我 Java 才出来，哈哈！真实！_

## Java9

发布于 2017 年 9 月 21 日 。作为 Java8 之后 3 年半才发布的新版本，Java 9 带 来了很多重大的变化其中最重要的改动是 Java 平台模块系统的引入，其他还有诸如集合、Stream 流

### Java 平台模块系统

Java 平台模块系统是[Jigsaw Project](https://openjdk.java.net/projects/jigsaw/)的一部分，把模块化开发实践引入到了 Java 平台中，可以让我们的代码可重用性更好！

什么是模块系统？官方的定义是：A uniquely named, reusable group of related packages, as well as resources (such as images and XML files) and a module descriptor.

简单来说，你可以将一个模块看作是一组唯一命名、可重用的包、资源和模块描述文件（module-info.java）。

任意一个 jar 文件，只要加上一个 模块描述文件（module-info.java），就可以升级为一个模块。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/module-structure.png)

在引入了模块系统之后，JDK 被重新组织成 94 个模块。Java 应用可以通过新增的 jlink 工具，创建出只包含所依赖的 JDK 模块的自定义运行时镜像。这样可以极大的减少 Java 运行时环境的大小。

我们可以通过 exports 关键词精准控制哪些类可以对外开放使用，哪些类只能内部使用。

```java
module my.module {
    //exports 公开指定包的所有公共成员
    exports com.my.package.name;
}

module my.module {
     //exports…to 限制访问的成员范围
    export com.my.package.name to com.specific.package;
}
```

Java 9 模块的重要特征是在其工件（artifact）的根目录中包含了一个描述模块的 `module-info.java` 文 件。 工件的格式可以是传统的 JAR 文件或是 Java 9 新增的 JMOD 文件。

想要深入了解 Java 9 的模块化，参见：

- [《Project Jigsaw: Module System Quick-Start Guide》](https://openjdk.java.net/projects/jigsaw/quick-start)
- [《Java 9 Modules: part 1》](https://stacktraceguru.com/java9/module-introduction)

### Jshell

jshell 是 Java 9 新增的一个实用工具。为 Java 提供了类似于 Python 的实时命令行交互工具。

在 Jshell 中可以直接输入表达式并查看其执行结果。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816083417616.png)

### 集合增强

增加 了 `List.of()`、`Set.of()`、`Map.of()` 和 `Map.ofEntries()`等工厂方法来创建不可变集合（这部分内容有点参考 Guava 的味道）

```java
List.of("Java", "C++");
Set.of("Java", "C++");
Map.of("Java", 1, "C++", 2);
```

使用 `of()` 创建的集合为不可变集合，不能进行添加、删除、替换、 排序等操作，不然会报 `java.lang.UnsupportedOperationException` 异常。

`Collectors` 中增加了新的方法 `filtering()` 和 `flatMapping()`。

`Collectors` 的 `filtering()` 方法类似于 `Stream` 类的 `filter()` 方法，都是用于过滤元素。

> Java 8 为 `Collectors` 类引入了 `groupingBy` 操作，用于根据特定的属性将对象分组。

```java
List<String> list = List.of("x","www", "yy", "zz");
Map<Integer, List<String>> result = list.stream()
        .collect(Collectors.groupingBy(String::length,
                Collectors.filtering(s -> !s.contains("z"),
                        Collectors.toList())));

System.out.println(result); // {1=[x], 2=[yy], 3=[www]}
```

### Stream & Optional 增强

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

### String 存储结构变更

JDK 8 及之前的版本，`String` 一直是用 `char[]` 存储。在 Java 9 之后，`String` 的实现改用 `byte[]` 数组存储字符串。

### 进程 API

Java 9 增加了 `ProcessHandle` 接口，可以对原生进程进行管理，尤其适合于管理长时间运行的进程。

```java
System.out.println(ProcessHandle.current().pid());
System.out.println(ProcessHandle.current().info());
```

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816104614414.png)

### 平台日志 API 和服务

Java 9 允许为 JDK 和应用配置同样的日志实现。新增了 `System.LoggerFinder` 用来管理 JDK 使 用的日志记录器实现。JVM 在运行时只有一个系统范围的 `LoggerFinder` 实例。

我们可以通过添加自己的 `System.LoggerFinder` 实现来让 JDK 和应用使用 SLF4J 等其他日志记录框架。

### 反应式流 （ Reactive Streams ）

在 Java9 中的 `java.util.concurrent.Flow` 类中新增了反应式流规范的核心接口 。

`Flow` 中包含了 `Flow.Publisher`、`Flow.Subscriber`、`Flow.Subscription` 和 `Flow.Processor` 等 4 个核心接口。Java 9 还提供了`SubmissionPublisher` 作为`Flow.Publisher` 的一个实现。

### 变量句柄

变量句柄是一个变量或一组变量的引用，包括静态域，非静态域，数组元素和堆外数据结构中的组成部分等

变量句柄的含义类似于已有的方法句柄 `MethodHandle` ，由 Java 类 `java.lang.invoke.VarHandle` 来表示，可以使用类 `java.lang.invoke.MethodHandles.Lookup` 中的静态工厂方法来创建 `VarHandle` 对象。

`VarHandle` 的出现替代了 `java.util.concurrent.atomic` 和 `sun.misc.Unsafe` 的部分操作。并且提供了一系列标准的内存屏障操作，用于更加细粒度的控制内存排序。在安全性、可用性、性能上都要优于现有的 API。

### 改进方法句柄（Method Handle）

方法句柄从 Java7 开始引入，Java9 在类`java.lang.invoke.MethodHandles` 中新增了更多的静态方法来创建不同类型的方法句柄。

### 接口私有方法

Java 9 允许在接口中使用私有方法。

```java
public interface MyInterface {
    private void methodPrivate(){

    }
}
```

### Java9 其它新特性

- **try-with-resources 增强** ：在 try-with-resources 语句中可以使用 effectively-final 变量（什么是 effectively-final 变量，见这篇文章：[《Effectively Final Variables in Java》](https://ilkinulas.github.io/programming/java/2016/03/27/effectively-final-java.html)
- 类 `CompletableFuture` 中增加了几个新的方法（`completeAsync` ，`orTimeout` 等）
- **Nashorn 引擎的增强** ：Nashorn 从 Java8 开始引入的 JavaScript 引擎，Java9 对 Nashorn 做了些增强，实现了一些 ES6 的新特性（Java 11 中已经被弃用）。
- **I/O 流的新特性** ：增加了新的方法来读取和复制 `InputStream` 中包含的数据
- **改进应用的安全性能** ：Java 9 新增了 4 个 SHA- 3 哈希算法，SHA3-224、SHA3-256、SHA3-384 和 SHA3-512
- ......

## Java10

发布于 2018 年 3 月 20 日，最知名的特性应该是 var 关键字（局部变量类型推断）的引入了，其他还有垃圾收集器改善、GC 改进、性能提升、线程管控等一批新特性

### var(局部变量推断)

由于太多 Java 开发者希望 Java 中引入局部变量推断，于是 Java 10 的时候它来了，也算是众望所归了！

Java 10 提供了 var 关键字声明局部变量。

> Scala 和 Kotlin 中有 val 关键字 ( `final var` 组合关键字)，Java10 中并没有引入。

Java 10 只引入了 var，而

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

相关阅读：[《Java 10 新特性之局部变量类型推断》](https://zhuanlan.zhihu.com/p/34911982)。

### 集合增强

`list`，`set`，`map` 提供了静态方法`copyOf()`返回入参集合的一个不可变拷贝。

以下为 JDK 的源码：

```java
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
```

使用 `copyOf()` 创建的集合为不可变集合，不能进行添加、删除、替换、 排序等操作，不然会报 `java.lang.UnsupportedOperationException` 异常。 IDEA 也会有相应的提示。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210816154125579.png)

`java.util.stream.Collectors` 中新增了静态方法，用于将流中的元素收集为不可变的集合。

```java
var list = new ArrayList<>();
list.stream().collect(Collectors.toUnmodifiableList());
list.stream().collect(Collectors.toUnmodifiableSet());
```

### Optional

新增了`orElseThrow()`方法来在没有值时抛出指定的异常。

```java
Optional.ofNullable(cache.getIfPresent(key))
        .orElseThrow(() -> new PrestoException(NOT_FOUND, "Missing entry found for key: " + key));
```

### 并行全垃圾回收器 G1

从 Java9 开始 G1 就了默认的垃圾回收器，G1 是以一种低延时的垃圾回收器来设计的，旨在避免进行 Full GC,但是 Java9 的 G1 的 FullGC 依然是使用单线程去完成标记清除算法,这可能会导致垃圾回收期在无法回收内存的时候触发 Full GC。

为了最大限度地减少 Full GC 造成的应用停顿的影响，从 Java10 开始，G1 的 FullGC 改为并行的标记清除算法，同时会使用与年轻代回收和混合回收相同的并行工作线程数量，从而减少了 Full GC 的发生，以带来更好的性能提升、更大的吞吐量。

### 应用程序类数据共享(扩展 CDS 功能)

在 Java 5 中就已经引入了类数据共享机制 (Class Data Sharing，简称 CDS)，允许将一组类预处理为共享归档文件，以便在运行时能够进行内存映射以减少 Java 程序的启动时间，当多个 Java 虚拟机（JVM）共享相同的归档文件时，还可以减少动态内存的占用量，同时减少多个虚拟机在同一个物理或虚拟的机器上运行时的资源占用。CDS 在当时还是 Oracle JDK 的商业特性。

Java 10 在现有的 CDS 功能基础上再次拓展，以允许应用类放置在共享存档中。CDS 特性在原来的 bootstrap 类基础之上，扩展加入了应用类的 CDS 为 (Application Class-Data Sharing，AppCDS) 支持，大大加大了 CDS 的适用范围。其原理为：在启动时记录加载类的过程，写入到文本文件中，再次启动时直接读取此启动文本并加载。设想如果应用环境没有大的变化，启动速度就会得到提升。

### Java10 其他新特性

- **线程-局部管控**：Java 10 中线程管控引入 JVM 安全点的概念，将允许在不运行全局 JVM 安全点的情况下实现线程回调，由线程本身或者 JVM 线程来执行，同时保持线程处于阻塞状态，这种方式使得停止单个线程变成可能，而不是只能启用或停止所有线程
- **备用存储装置上的堆分配**：Java 10 中将使得 JVM 能够使用适用于不同类型的存储机制的堆，在可选内存设备上进行堆内存分配
- **统一的垃圾回收接口**：Java 10 中，hotspot/gc 代码实现方面，引入一个干净的 GC 接口，改进不同 GC 源代码的隔离性，多个 GC 之间共享的实现细节代码应该存在于辅助类中。统一垃圾回收接口的主要原因是：让垃圾回收器（GC）这部分代码更加整洁，便于新人上手开发，便于后续排查相关问题。
- ......

## Java11

Java11 于 2018 年 9 月 25 日正式发布，这是很重要的一个版本！Java 11 和 2017 年 9 月份发布的 Java 9 以及 2018 年 3 月份发布的 Java 10 相比，其最大的区别就是：在长期支持(Long-Term-Support)方面，**Oracle 表示会对 Java 11 提供大力支持，这一支持将会持续至 2026 年 9 月。这是据 Java 8 以后支持的首个长期版本。**

![](https://img-blog.csdnimg.cn/20210603202746605.png)

### String

Java 11 增加了一系列的字符串处理方法，如以下所示。

_Guide：说白点就是多了层封装，JDK 开发组的人没少看市面上常见的工具类框架啊!_

```java
//判断字符串是否为空
" ".isBlank();//true
//去除字符串首尾空格
" Java ".strip();// "Java"
//去除字符串首部空格
" Java ".stripLeading();   // "Java "
//去除字符串尾部空格
" Java ".stripTrailing();  // " Java"
//重复字符串多少次
"Java".repeat(3);             // "JavaJavaJava"

//返回由行终止符分隔的字符串集合。
"A\nB\nC".lines().count();    // 3
"A\nB\nC".lines().collect(Collectors.toList());
```

### Optional

新增了`empty()`方法来判断指定的 `Optional` 对象是否为空。

```java
var op = Optional.empty();
System.out.println(op.isEmpty());//判断指定的 Optional 对象是否为空
```

### ZGC(可伸缩低延迟垃圾收集器)

**ZGC 即 Z Garbage Collector**，是一个可伸缩的、低延迟的垃圾收集器。

ZGC 主要为了满足如下目标进行设计：

- GC 停顿时间不超过 10ms
- 即能处理几百 MB 的小堆，也能处理几个 TB 的大堆
- 应用吞吐能力不会下降超过 15%（与 G1 回收算法相比）
- 方便在此基础上引入新的 GC 特性和利用 colored 针以及 Load barriers 优化奠定基础
- 当前只支持 Linux/x64 位平台

ZGC 目前 **处在实验阶段**，只支持 Linux/x64 平台。

与 CMS 中的 ParNew 和 G1 类似，ZGC 也采用标记-复制算法，不过 ZGC 对该算法做了重大改进。

在 ZGC 中出现 Stop The World 的情况会更少！

详情可以看 ： [《新一代垃圾回收器 ZGC 的探索与实践》](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)

### 标准 HTTP Client 升级

Java 11 对 Java 9 中引入并在 Java 10 中进行了更新的 Http Client API 进行了标准化，在前两个版本中进行孵化的同时，Http Client 几乎被完全重写，并且现在完全支持异步非阻塞。

并且，Java11 中，Http Client 的包名由 `jdk.incubator.http` 改为`java.net.http`，该 API 通过 `CompleteableFuture` 提供非阻塞请求和响应语义。使用起来也很简单，如下：

```java
var request = HttpRequest.newBuilder()
    .uri(URI.create("https://javastack.cn"))
    .GET()
    .build();
var client = HttpClient.newHttpClient();

// 同步
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());

// 异步
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
```

### var(Lambda 参数的局部变量语法)

从 Java 10 开始，便引入了局部变量类型推断这一关键特性。类型推断允许使用关键字 var 作为局部变量的类型而不是实际类型，编译器根据分配给变量的值推断出类型。

Java 10 中对 var 关键字存在几个限制

- 只能用于局部变量上
- 声明时必须初始化
- 不能用作方法参数
- 不能在 Lambda 表达式中使用

Java11 开始允许开发者在 Lambda 表达式中使用 var 进行参数声明。

```java
// 下面两者是等价的
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

### 启动单文件源代码程序

[JEP 330:启动单文件源代码程序（aunch Single-File Source-Code Programs）](https://openjdk.java.net/jeps/330) 可以让我们运行单一文件的 Java 源代码。此功能允许使用 Java 解释器直接执行 Java 源代码。源代码在内存中编译，然后由解释器执行，不需要在磁盘上生成 `.class` 文件了。

唯一的约束在于所有相关的类必须定义在同一个 Java 文件中。

对于 Java 初学者并希望尝试简单程序的人特别有用，并且能和 jshell 一起使用

一定能程度上增强了使用 Java 来写脚本程序的能力。

### Java11 其他新特性

- **新的垃圾回收器 Epsilon** ：一个完全消极的 GC 实现，分配有限的内存资源，最大限度的降低内存占用和内存吞吐延迟时间
- **低开销的 Heap Profiling** ：Java 11 中提供一种低开销的 Java 堆分配采样方法，能够得到堆分配的 Java 对象信息，并且能够通过 JVMTI 访问堆信息
- **TLS1.3 协议** ：Java 11 中包含了传输层安全性（TLS）1.3 规范（RFC 8446）的实现，替换了之前版本中包含的 TLS，包括 TLS 1.2，同时还改进了其他 TLS 功能，例如 OCSP 装订扩展（RFC 6066，RFC 6961），以及会话散列和扩展主密钥扩展（RFC 7627），在安全性和性能方面也做了很多提升
- **飞行记录器(Java Flight Recorder)** ：飞行记录器之前是商业版 JDK 的一项分析工具，但在 Java 11 中，其代码被包含到公开代码库中，这样所有人都能使用该功能了。
- ......

## Java12

### String

Java 11 增加了两个的字符串处理方法，如以下所示。

`indent()` 方法可以实现字符串缩进。

```java
String text = "Java";
// 缩进 4 格
text = text.indent(4);
System.out.println(text);
text = text.indent(-10);
System.out.println(text);
```

输出：

```
     Java
Java
```

`transform()` 方法可以用来转变指定字符串。

```java
String result = "foo".transform(input -> input + " bar");
System.out.println(result); // foo bar
```

### 文件比较

Java 12 添加了以下方法来比较两个文件：

```java
public static long mismatch(Path path, Path path2) throws IOException
```

`mismatch()` 方法用于比较两个文件，并返回第一个不匹配字符的位置，如果文件相同则返回 -1L。

代码示例（两个文件内容相同的情况）：

```java
Path filePath1 = Files.createTempFile("file1", ".txt");
Path filePath2 = Files.createTempFile("file2", ".txt");
Files.writeString(filePath1, "Java 12 Article");
Files.writeString(filePath2, "Java 12 Article");

long mismatch = Files.mismatch(filePath1, filePath2);
assertEquals(-1, mismatch);
```

代码示例（两个文件内容不相同的情况）：

```java
Path filePath3 = Files.createTempFile("file3", ".txt");
Path filePath4 = Files.createTempFile("file4", ".txt");
Files.writeString(filePath3, "Java 12 Article");
Files.writeString(filePath4, "Java 12 Tutorial");

long mismatch = Files.mismatch(filePath3, filePath4);
assertEquals(8, mismatch);
```

### 数字格式化工具类

`NumberFormat` 新增了对复杂的数字进行格式化的支持

```java
NumberFormat fmt = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
String result = fmt.format(1000);
 System.out.println(result); // 输出为 1K，计算工资是多少K更方便了。。。
```

### Shenandoah GC

Redhat 主导开发的 Pauseless GC 实现，主要目标是 99.9% 的暂停小于 10ms，暂停与堆大小无关等

和 Java11 开源的 ZGC 相比（需要升级到 JDK11 才能使用），Shenandoah GC 有稳定的 JDK8u 版本，在 Java8 占据主要市场份额的今天有更大的可落地性。

### G1 收集器提升

Java12 为默认的垃圾收集器 G1 带来了两项更新:

- **可中止的混合收集集合** ：JEP344 的实现，为了达到用户提供的停顿时间目标，JEP 344 通过把要被回收的区域集（混合收集集合）拆分为强制和可选部分，使 G1 垃圾回收器能中止垃圾回收过程。 G1 可以中止可选部分的回收以达到停顿时间目标
- **及时返回未使用的已分配内存** ：JEP346 的实现，增强 G1 GC，以便在空闲时自动将 Java 堆内存返回给操作系统

### 预览新特性

作为预览特性加入，需要在`javac`编译和`java`运行时增加参数`--enable-preview` 。

#### 增强 Switch

传统的 `switch` 语法存在容易漏写 `break` 的问题，而且从代码整洁性层面来看，多个 break 本质也是一种重复

Java12 增强了 `swtich` 表达式，使用类似 lambda 语法条件匹配成功后的执行块，不需要多写 break 。

```java
switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> System.out.println(6);
    case TUESDAY                -> System.out.println(7);
    case THURSDAY, SATURDAY     -> System.out.println(8);
    case WEDNESDAY              -> System.out.println(9);
}
```

#### instanceof 模式匹配

`instanceof` 主要在**类型强转前探测对象的具体类型**。

之前的版本中，我们需要显示地对对象进行类型转换。

```java
Object obj = "我是字符串";
if(obj instanceof String){
   String str = (String) obj;
	System.out.println(str);
}
```

新版的 `instanceof` 可以在判断是否属于具体的类型同时完成转换。

```java
Object obj = "我是字符串";
if(obj instanceof String str){
	System.out.println(str);
}
```

## Java13

### 增强 ZGC(释放未使用内存)

在 Java 11 中是实验性的引入的 ZGC 在实际的使用中存在未能主动将未使用的内存释放给操作系统的问题。

ZGC 堆由一组称为 ZPages 的堆区域组成。在 GC 周期中清空 ZPages 区域时，它们将被释放并返回到页面缓存 **ZPageCache** 中，此缓存中的 ZPages 按最近最少使用（LRU）的顺序，并按照大小进行组织。

在 Java 13 中，ZGC 将向操作系统返回被标识为长时间未使用的页面，这样它们将可以被其他进程重用。

### SocketAPI 重构

Java Socket API 终于迎来了重大更新！

Java 13 将 Socket API 的底层进行了重写， `NioSocketImpl` 是对 `PlainSocketImpl` 的直接替代，它使用 `java.util.concurrent` 包下的锁而不是同步方法。如果要使用旧实现，请使用 `-Djdk.net.usePlainSocketImpl=true`。

并且，在 Java 13 中是默认使用新的 Socket 实现。

```java
public final class NioSocketImpl extends SocketImpl implements PlatformSocketImpl {
}
```

### FileSystems

`FileSystems` 类中添加了以下三种新方法，以便更容易地使用将文件内容视为文件系统的文件系统提供程序：

- `newFileSystem(Path)`
- `newFileSystem(Path, Map<String, ?>)`
- `newFileSystem(Path, Map<String, ?>, ClassLoader)`

### 动态 CDS 存档

Java 13 中对 Java 10 中引入的应用程序类数据共享(AppCDS)进行了进一步的简化、改进和扩展，即：**允许在 Java 应用程序执行结束时动态进行类归档**，具体能够被归档的类包括所有已被加载，但不属于默认基层 CDS 的应用程序类和引用类库中的类。

这提高了应用程序类数据共享（[AppCDS](https://openjdk.java.net/jeps/310)）的可用性。无需用户进行试运行来为每个应用程序创建类列表。

```bash
$ java -XX:ArchiveClassesAtExit=my_app_cds.jsa -cp my_app.jar
$ java -XX:SharedArchiveFile=my_app_cds.jsa -cp my_app.jar
```

### 预览新特性

#### 文本块

解决 Java 定义多行字符串时只能通过换行转义或者换行连接符来变通支持的问题，引入**三重双引号**来定义多行文本。

Java 13 支持两个 `"""` 符号中间的任何内容都会被解释为字符串的一部分，包括换行符。

未支持文本块之前的 HTML 写法：

```java
String json ="{\n" +
              "   \"name\":\"mkyong\",\n" +
              "   \"age\":38\n" +
              "}\n";
```

支持文本块之后的 HTML 写法：

```java
 String json = """
                {
                    "name":"mkyong",
                    "age":38
                }
                """;
```

未支持文本块之前的 SQL 写法：

```sql
String query = "SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`\n" +
               "WHERE `CITY` = 'INDIANAPOLIS'\n" +
               "ORDER BY `EMP_ID`, `LAST_NAME`;\n";
```

支持文本块之后的 SQL 写法：

```sql
String query = """
               SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
               WHERE `CITY` = 'INDIANAPOLIS'
               ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
```

另外，`String` 类新增加了 3 个新的方法来操作文本块：

- `formatted(Object... args)` ：它类似于 `String` 的`format()`方法。添加它是为了支持文本块的格式设置。
- `stripIndent()` ：用于去除文本块中每一行开头和结尾的空格。
- `translateEscapes()` ：转义序列如 _“\\\t”_ 转换为 _“\t”_

由于文本块是一项预览功能，可以在未来版本中删除，因此这些新方法被标记为弃用。

```java
@Deprecated(forRemoval=true, since="13")
public String stripIndent() {
}
@Deprecated(forRemoval=true, since="13")
public String formatted(Object... args) {

}
@Deprecated(forRemoval=true, since="13")
public String translateEscapes() {
}
```

#### 增强 Switch(引入 yield 关键字到 Switch 中)

`Switch` 表达式中就多了一个关键字用于跳出 `Switch` 块的关键字 `yield`，主要用于返回一个值

`yield`和 `return` 的区别在于：`return` 会直接跳出当前循环或者方法，而 `yield` 只会跳出当前 `Switch` 块，同时在使用 `yield` 时，需要有 `default` 条件

```java
 private static String descLanguage(String name) {
        return switch (name) {
            case "Java": yield "object-oriented, platform independent and secured";
            case "Ruby": yield "a programmer's best friend";
            default: yield name +" is a good language";
        };
 }
```

## Java14

### 空指针异常精准提示

通过 JVM 参数中添加`-XX:+ShowCodeDetailsInExceptionMessages`，可以在空指针异常中获取更为详细的调用信息，更快的定位和解决问题。

```java
a.b.c.i = 99; // 假设这段代码会发生空指针
```

Java 14 之前：

```java
Exception in thread "main" java.lang.NullPointerException
    at NullPointerExample.main(NullPointerExample.java:5)
```

Java 14 之后：

```java
 // 增加参数后提示的异常中很明确的告知了哪里为空导致
Exception in thread "main" java.lang.NullPointerException:
        Cannot read field 'c' because 'a.b' is null.
    at Prog.main(Prog.java:5)
```

### switch 的增强(转正)

Java12 引入的 switch（预览特性）在 Java14 变为正式版本，不需要增加参数来启用，直接在 JDK14 中就能使用。

Java12 为 switch 表达式引入了类似 lambda 语法条件匹配成功后的执行块，不需要多写 break ，Java13 提供了 `yield` 来在 block 中返回值。

```java
String result = switch (day) {
            case "M", "W", "F" -> "MWF";
            case "T", "TH", "S" -> "TTS";
            default -> {
                if(day.isEmpty())
                    yield "Please insert a valid day.";
                else
                    yield "Looks like a Sunday.";
            }

        };
System.out.println(result);
```

### 预览新特性

#### record 关键字

简化数据类的定义方式，使用 `record` 代替 `class` 定义的类，只需要声明属性，就可以在获得属性的访问方法，以及 `toString()`，`hashCode()`, `equals()`方法

类似于使用 `class` 定义类，同时使用了 lombok 插件，并打上了`@Getter,@ToString,@EqualsAndHashCode`注解

```java
/**
 * 这个类具有两个特征
 * 1. 所有成员属性都是final
 * 2. 全部方法由构造方法，和两个成员属性访问器组成（共三个）
 * 那么这种类就很适合使用record来声明
 */
final class Rectangle implements Shape {
    final double length;
    final double width;

    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    double length() { return length; }
    double width() { return width; }
}
/**
 * 1. 使用record声明的类会自动拥有上面类中的三个方法
 * 2. 在这基础上还附赠了equals()，hashCode()方法以及toString()方法
 * 3. toString方法中包括所有成员属性的字符串表示形式及其名称
 */
record Rectangle(float length, float width) { }
```

#### 文本块

Java14 中，文本块依然是预览特性，不过，其引入了两个新的转义字符：

- `\` : 表示行尾，不引入换行符
- `\s` ：表示单个空格

```java
String str = "凡心所向，素履所往，生如逆旅，一苇以航。";

String str2 = """
        凡心所向，素履所往， \
        生如逆旅，一苇以航。""";
System.out.println(str2);// 凡心所向，素履所往， 生如逆旅，一苇以航。
String text = """
        java
        c++\sphp
        """;
System.out.println(text);
//输出：
java
c++ php
```

#### instanceof 增强

依然是**预览特性** ，Java 12 新特性中介绍过。

### Java14 其他特性

- 从 Java11 引入的 ZGC 作为继 G1 过后的下一代 GC 算法，从支持 Linux 平台到 Java14 开始支持 MacOS 和 Window（个人感觉是终于可以在日常开发工具中先体验下 ZGC 的效果了，虽然其实 G1 也够用）
- 移除了 CMS(Concurrent Mark Sweep) 垃圾收集器（功成而退）
- 新增了 jpackage 工具，标配将应用打成 jar 包外，还支持不同平台的特性包，比如 linux 下的`deb`和`rpm`，window 平台下的`msi`和`exe`

## Java15

### CharSequence

`CharSequence` 接口添加了一个默认方法 `isEmpty()` 来判断字符序列为空，如果是则返回 true。

```java
public interface CharSequence {
  default boolean isEmpty() {
      return this.length() == 0;
  }
}
```

### TreeMap

`TreeMap` 新引入了下面这些方法：

- `putIfAbsent()`
- `computeIfAbsent()`
- `computeIfPresent()`
- `compute()`
- `merge()`

### ZGC(转正)

Java11 的时候 ，ZGC 还在试验阶段。

当时，ZGC 的出现让众多 Java 开发者看到了垃圾回收器的另外一种可能，因此备受关注。

经过多个版本的迭代，不断的完善和修复问题，ZGC 在 Java 15 已经可以正式使用了！

不过，默认的垃圾回收器依然是 G1。你可以通过下面的参数启动 ZGC：

```bash
$ java -XX:+UseZGC className
```

### EdDSA(数字签名算法)

新加入了一个安全性和性能都更强的基于 Edwards-Curve Digital Signature Algorithm （EdDSA）实现的数字签名算法。

虽然其性能优于现有的 ECDSA 实现，不过，它并不会完全取代 JDK 中现有的椭圆曲线数字签名算法( ECDSA)。

```java
KeyPairGenerator kpg = KeyPairGenerator.getInstance("Ed25519");
KeyPair kp = kpg.generateKeyPair();

byte[] msg = "test_string".getBytes(StandardCharsets.UTF_8);

Signature sig = Signature.getInstance("Ed25519");
sig.initSign(kp.getPrivate());
sig.update(msg);
byte[] s = sig.sign();

String encodedString = Base64.getEncoder().encodeToString(s);
System.out.println(encodedString);
```

输出：

```
0Hc0lxxASZNvS52WsvnncJOH/mlFhnA8Tc6D/k5DtAX5BSsNVjtPF4R4+yMWXVjrvB2mxVXmChIbki6goFBgAg==
```

### 文本块(转正)

在 Java 15 ，文本块是正式的功能特性了。

### 隐藏类(Hidden Classes)

隐藏类是为框架（frameworks）所设计的，隐藏类不能直接被其他类的字节码使用，只能在运行时生成类并通过反射间接使用它们。

### 预览新特性

#### 密封类

Java 15 对 Java 14 中引入的预览新特性进行了增强，主要是引入了一个新的概念 **密封类（Sealed Classes）。**

密封类可以对继承或者实现它们的类进行限制。

比如抽象类 `Person` 只允许 `Employee` 和 `Manager` 继承。

```java
public abstract sealed class Person
    permits Employee, Manager {

    //...
}
```

另外，任何扩展密封类的类本身都必须声明为 `sealed`、`non-sealed` 或 `final`。

```java
public final class Employee extends Person {
}

public non-sealed class Manager extends Person {
}
```

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/javaguide/image-20210820153955587.png)

#### instanceof 模式匹配

Java 15 并没有对此特性进行调整，继续预览特性，主要用于接受更多的使用反馈。

在未来的 Java 版本中，Java 的目标是继续完善 `instanceof` 模式匹配新特性。

### Java15 其他新特性

- **Nashorn JavaScript 引擎彻底移除** ：Nashorn 从 Java8 开始引入的 JavaScript 引擎，Java9 对 Nashorn 做了些增强，实现了一些 ES6 的新特性。在 Java 11 中就已经被弃用，到了 Java 15 就彻底被删除了。
- **DatagramSocket API 重构**
- **禁用和废弃偏向锁（Biased Locking）** ： 偏向锁的引入增加了 JVM 的复杂性大于其带来的性能提升。不过，你仍然可以使用 `-XX:+UseBiasedLocking` 启用偏向锁定，但它会提示 这是一个已弃用的 API。
- ......

## 总结

### 关于预览特性

先贴一段 oracle 官网原文：`This is a preview feature, which is a feature whose design, specification, and implementation are complete, but is not permanent, which means that the feature may exist in a different form or not at all in future JDK releases. To compile and run code that contains preview features, you must specify additional command-line options.`

这是一个预览功能，该功能的设计，规格和实现是完整的，但不是永久性的，这意味着该功能可能以其他形式存在或在将来的 JDK 版本中根本不存在。 要编译和运行包含预览功能的代码，必须指定其他命令行选项。

就以`switch`的增强为例子，从 Java12 中推出，到 Java13 中将继续增强，直到 Java14 才正式转正进入 JDK 可以放心使用，不用考虑后续 JDK 版本对其的改动或修改

一方面可以看出 JDK 作为标准平台在增加新特性的严谨态度，另一方面个人认为是对于预览特性应该采取审慎使用的态度。特性的设计和实现容易，但是其实际价值依然需要在使用中去验证

### JVM 虚拟机优化

每次 Java 版本的发布都伴随着对 JVM 虚拟机的优化，包括对现有垃圾回收算法的改进，引入新的垃圾回收算法，移除老旧的不再适用于今天的垃圾回收算法等

整体优化的方向是**高效，低时延的垃圾回收表现**

对于日常的应用开发者可能比较关注新的语法特性，但是从一个公司角度来说，在考虑是否升级 Java 平台时更加考虑的是**JVM 运行时的提升**

## 参考资料

- JDK Project Overview ： <https://openjdk.java.net/projects/jdk/ >
- IBM Developer Java9 <https://www.ibm.com/developerworks/cn/java/the-new-features-of-Java-9/>
- Guide to Java10 <https://www.baeldung.com/java-10-overview>
- Java 10 新特性介绍<https://www.ibm.com/developerworks/cn/java/the-new-features-of-Java-10/index.html>
- IBM Devloper Java11 <https://www.ibm.com/developerworks/cn/java/the-new-features-of-Java-11/index.html>
- Java 11 – Features and Comparison： <https://www.geeksforgeeks.org/java-11-features-and-comparison/>
- Oracle Java12 ReleaseNote <https://www.oracle.com/technetwork/java/javase/12all-relnotes-5211423.html#NewFeature>
- Oracle Java13 ReleaseNote <https://www.oracle.com/technetwork/java/javase/13all-relnotes-5461743.html#NewFeature>
- New Features in Java 12 <https://www.baeldung.com/java-12-new-features>
- New Java13 Features <https://www.baeldung.com/java-13-new-features>
- Java13 新特性概述 <https://www.ibm.com/developerworks/cn/java/the-new-features-of-Java-13/index.html>
- Oracle Java14 record <https://docs.oracle.com/en/java/javase/14/language/records.html>
- java14-features <https://www.techgeeknext.com/java/java14-features>
- Java 14 Features : <https://www.journaldev.com/37273/java-14-features>
- What is new in Java 15: https://mkyong.com/java/what-is-new-in-java-15/
