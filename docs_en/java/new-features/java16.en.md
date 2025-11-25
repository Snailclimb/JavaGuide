---
title: Java 16 新特性概览
category: Java
tag:
  - Java新特性
head:
  - - meta
    - name: keywords
      content: Java 16,JDK16,记录类改进,新 API,JEP,性能
  - - meta
    - name: description
      content: 介绍 JDK 16 的语言与平台更新，包含记录类与其他 JEP 改动。
---

Java 16 在 2021 年 3 月 16 日正式发布，非长期支持（LTS）版本。

相关阅读：[OpenJDK Java 16 文档](https://openjdk.java.net/projects/jdk/16/) 。

## JEP 338:向量 API(第一次孵化)

向量（Vector） API 最初由 [JEP 338](https://openjdk.java.net/jeps/338) 提出，并作为[孵化 API](http://openjdk.java.net/jeps/11)集成到 Java 16 中。第二轮孵化由 [JEP 414](https://openjdk.java.net/jeps/414) 提出并集成到 Java 17 中，第三轮孵化由 [JEP 417](https://openjdk.java.net/jeps/417) 提出并集成到 Java 18 中，第四轮由 [JEP 426](https://openjdk.java.net/jeps/426) 提出并集成到了 Java 19 中。

该孵化器 API 提供了一个 API 的初始迭代以表达一些向量计算，这些计算在运行时可靠地编译为支持的 CPU 架构上的最佳向量硬件指令，从而获得优于同等标量计算的性能，充分利用单指令多数据（SIMD）技术（大多数现代 CPU 上都可以使用的一种指令）。尽管 HotSpot 支持自动向量化，但是可转换的标量操作集有限且易受代码更改的影响。该 API 将使开发人员能够轻松地用 Java 编写可移植的高性能向量算法。

在 [Java 18 新特性概览](./java18.md) 中，我有详细介绍到向量 API，这里就不再做额外的介绍了。

## JEP 347:启用 C++ 14 语言特性

Java 16 允许在 JDK 的 C++ 源代码中使用 C++14 语言特性，并提供在 HotSpot 代码中可以使用哪些特性的具体指导。

在 Java 15 中，JDK 中 C++ 代码使用的语言特性仅限于 C++98/03 语言标准。它要求更新各种平台编译器的最低可接受版本。

## JEP 376:ZGC 并发线程堆栈处理

Java16 将 ZGC 线程栈处理从安全点转移到一个并发阶段，甚至在大堆上也允许在毫秒内暂停 GC 安全点。消除 ZGC 垃圾收集器中最后一个延迟源可以极大地提高应用程序的性能和效率。

## JEP 387:弹性元空间

自从引入了 Metaspace 以来，根据反馈，Metaspace 经常占用过多的堆外内存，从而导致内存浪费。弹性元空间这个特性可将未使用的 HotSpot 类元数据（即元空间，metaspace）内存更快速地返回到操作系统，从而减少元空间的占用空间。

并且，这个提案还简化了元空间的代码以降低维护成本。

## JEP 390:对基于值的类发出警告

> 以下介绍摘自：[实操 | 剖析 Java16 新语法特性](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116)，原文写的很不错，推荐阅读。

早在 Java9 版本时，Java 的设计者们就对 `@Deprecated` 注解进行了一次升级，增加了 `since` 和 `forRemoval` 等 2 个新元素。其中，since 元素用于指定标记了 `@Deprecated` 注解的 API 被弃用时的版本，而 `forRemoval` 则进一步明确了 API 标记 @Deprecated 注解时的语义，如果`forRemoval=true`时，则表示该 API 在未来版本中肯定会被删除，开发人员应该使用新的 API 进行替代，不再容易产生歧义（Java9 之前，标记 @Deprecated 注解的 API，语义上存在多种可能性，比如：存在使用风险、可能在未来存在兼容性错误、可能在未来版本中被删除，以及应该使用更好的替代方案等）。

仔细观察原始类型的包装类（比如：`java.lang.Integer`、`java.lang.Double`），不难发现，其构造函数上都已经标记有`@Deprecated(since="9", forRemoval = true)`注解，这就意味着其构造函数在将来会被删除，不应该在程序中继续使用诸如`new Integer();`这样的编码方式（建议使用`Integer a = 10;`或者`Integer.valueOf()`函数），如果继续使用，编译期将会产生'Integer(int)' is deprecated and marked for removal 告警。并且，值得注意的是，这些包装类型已经被指定为同 `java.util.Optional` 和 `java.time.LocalDateTime` 一样的值类型。

其次，如果继续在 `synchronized` 同步块中使用值类型，将会在编译期和运行期产生警告，甚至是异常。在此大家需要注意，就算编译期和运行期没有产生警告和异常，也不建议在 `synchronized` 同步块中使用值类型，举个自增的例子。示例 1-5：

```java
public void inc(Integer count) {
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            synchronized (count) {
                count++;
            }
        }).start();
    }
}
```

当执行上述程序示例时，最终的输出结果一定会与你的期望产生差异，这是许多新人经常犯错的一个点，因为在并发环境下，`Integer` 对象根本无法通过 `synchronized` 来保证线程安全，这是因为每次的`count++`操作，所产生的 `hashcode` 均不同，简而言之，每次加锁都锁在了不同的对象上。因此，如果希望在实际的开发过程中保证其原子性，应该使用 `AtomicInteger`。

## JEP 392:打包工具

在 Java 14 中，JEP 343 引入了打包工具，命令是 `jpackage`。在 Java 15 中，继续孵化，现在在 Java 16 中，终于成为了正式功能。

这个打包工具允许打包自包含的 Java 应用程序。它支持原生打包格式，为最终用户提供自然的安装体验，这些格式包括 Windows 上的 msi 和 exe、macOS 上的 pkg 和 dmg，还有 Linux 上的 deb 和 rpm。它还允许在打包时指定启动时参数，并且可以从命令行直接调用，也可以通过 ToolProvider API 以编程方式调用。注意 jpackage 模块名称从 jdk.incubator.jpackage 更改为 jdk.jpackage。这将改善最终用户在安装应用程序时的体验，并简化了“应用商店”模型的部署。

关于这个打包工具的实际使用，可以看这个视频 [Playing with Java 16 jpackage](https://www.youtube.com/watch?v=KahYIVzRIkQ)（需要梯子）。

## JEP 393:外部内存访问 API(第三次孵化)

引入外部内存访问 API 以允许 Java 程序安全有效地访问 Java 堆之外的外部内存。

Java 14([JEP 370](https://openjdk.org/jeps/370)) 的时候，第一次孵化外部内存访问 API，Java 15 中进行了第二次复活（[JEP 383](https://openjdk.org/jeps/383)），在 Java 16 中进行了第三次孵化。

引入外部内存访问 API 的目的如下：

- 通用：单个 API 应该能够对各种外部内存（如本机内存、持久内存、堆内存等）进行操作。
- 安全：无论操作何种内存，API 都不应该破坏 JVM 的安全性。
- 控制：可以自由的选择如何释放内存（显式、隐式等）。
- 可用：如果需要访问外部内存，API 应该是 `sun.misc.Unsafe`.

## JEP 394:instanceof 模式匹配(转正)

| JDK 版本   | 更新类型          | JEP                                     | 更新内容                                 |
| ---------- | ----------------- | --------------------------------------- | ---------------------------------------- |
| Java SE 14 | preview | [JEP 305](https://openjdk.org/jeps/305) | Introducing instanceof pattern matching for the first time.           |
| Java SE 15 | Second Preview | [JEP 375](https://openjdk.org/jeps/375) | No changes compared to the previous version, continue to collect more feedback. |
| Java SE 16 | Permanent Release | [JEP 394](https://openjdk.org/jeps/394) | Mode variables are no longer implicitly final.               |

Starting from Java 16, you can modify the variable value in `instanceof`.

```java
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

//New code
if (o instanceof String s) {
    ... use s ...
}
```

## JEP 395: Record types (converted)

Record type change history:

| JDK Version | Update Type | JEP | Update Content |
| ---------- | ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Java SE 14 | Preview | [JEP 359](https://openjdk.java.net/jeps/359) | Introducing the `record` keyword, `record` provides a compact syntax to define immutable data in a class. |
| Java SE 15 | Second Preview | [JEP 384](https://openjdk.org/jeps/384) | Support for using `record` in local methods and interfaces.                                     |
| Java SE 16 | Permanent Release | [JEP 395](https://openjdk.org/jeps/395) | Non-static inner classes can define non-const static members.                                    |

Starting with Java SE 16, non-static inner classes can define non-const static members.

```java
public class Outer {
  class Inner {
    static int age;
  }
}
```

> Before JDK 16, if you write the above code, the IDE will prompt you that the static field age cannot be defined in a non-static inner class unless it is initialized with a constant expression. (The field age cannot be declared static in a non-static inner type, unless initialized with a constant expression)

## JEP 396: Strongly encapsulate JDK internal elements by default

This feature strongly encapsulates all internal elements of the JDK by default, except for critical internal APIs (such as `sun.misc.Unsafe`). By default, code that accesses JDK internal APIs that was successfully compiled using an earlier version may no longer work. Developers are encouraged to migrate from using internal elements to using standard APIs so that both they and their users can seamlessly upgrade to future Java versions. Strong encapsulation is controlled by the launcher option –illegal-access in JDK 9. The default is changed to warning in JDK 15 and the default is deny starting from JDK 16. It is still (currently) possible to relax packaging for all packages using a single command line option, in the future only specific packages will be opened using –add-opens.

## JEP 397: Sealed Classes (Preview)

Sealed classes were previewed by [JEP 360](https://openjdk.java.net/jeps/360) and integrated into Java 15. In JDK 16, sealed classes have been improved (stricter reference checking and inheritance relationships of sealed classes), and are previewed again by [JEP 397](https://openjdk.java.net/jeps/397).

In [Java 14 & 15 New Features Overview](./java14-15.md), I have introduced the sealed class in detail, so I will not give any additional introduction here.

## Other optimizations and improvements

- **JEP 380: Unix-Domain Socket Channels**: Unix-domain sockets have been a feature of most Unix platforms and are now supported in Windows 10 and Windows Server 2019. This feature adds Unix-domain (AF_UNIX) socket support to the socket channels and server socket channel APIs of the java.nio.channels package. It extends the inherited channel mechanism to support Unix-domain socket channels and server socket channels. Unix-domain sockets are used for inter-process communication (IPC) on the same host. They are largely similar to TCP/IP, except that sockets are addressed by file system pathnames rather than Internet Protocol (IP) addresses and port numbers. For local inter-process communication, Unix-domain sockets are more secure and efficient than TCP/IP loopback connections
- **JEP 389: External Linker API (Incubation):** This incubator API provides statically typed, pure Java access to native code. This API will greatly simplify the originally complex and error-prone process of binding native libraries. Java 1.1 already supports native method calls through the Java Native Interface (JNI), but it is not easy to use. Java developers should be able to bind specific native libraries for specific tasks. It also provides foreign function support without any intermediate JNI glue code.
- **JEP 357: Migrating from Mercurial to Git**: Previously, OpenJDK source code was managed using the version management tool Mercurial, and now it is migrated to Git.
- **JEP 369: Migration to GitHub**: Consistent with the changes in JEP 357 from Mercurial to Git, after migrating version management to Git, we chose to host the OpenJDK community's Git repository on GitHub. However, only JDK 11 and higher versions of JDK have been migrated.
- **JEP 386: Porting Alpine Linux**: Alpine Linux is an independent, non-commercial Linux distribution. It is very small. A container requires no more than 8MB of space. The minimum installation to the disk only requires about 130MB of storage space. It is very simple and takes into account security. This proposal ported the JDK to Apline Linux. Since Apline Linux is a lightweight Linux distribution based on musl lib, other Linux distributions using musl lib on x64 and AArch64 architectures are also suitable.
- **JEP 388: Windows/AArch64 Ports**: The focus of these JEPs is not on the porting efforts themselves, but on integrating them into the mainline JDK repositories; JEP 386 porting the JDK to Alpine Linux and other distributions that use musl as the main C library on x64. Additionally, JEP 388 ported the JDK to Windows AArch64 (ARM64).

## References

- [Java Language Changes](https://docs.oracle.com/en/java/javase/16/language/java-language-changes.html)
- [Consolidated JDK 16 Release Notes](https://www.oracle.com/java/technologies/javase/16all-relnotes.html)
- [Java 16 officially released, new features analyzed one by one](https://www.infoq.cn/article/IAkwhx7i9V7G8zLVEd4L)
- [Practical operation | Analysis of new syntax features of Java16](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116) (very well written)

<!-- @include: @article-footer.snippet.md -->