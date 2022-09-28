---
title: Java 16 新特性概览
category: Java
tag:
  - Java新特性
---

Java 16 在 2021 年 3 月 16 日正式发布，非长期支持（LTS）版本。

相关阅读：[OpenJDK Java 16 文档](https://openjdk.java.net/projects/jdk/16/) 。

## JEP 338:向量 API(第二次孵化)

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

早在 Java9 版本时，Java 的设计者们就对 `@Deprecated` 注解进行了一次升级，增加了 `since` 和 `forRemova`l 等 2 个新元素。其中，since 元素用于指定标记了 `@Deprecated` 注解的 API 被弃用时的版本，而 `forRemoval` 则进一步明确了 API 标记 @Deprecated 注解时的语义，如果`forRemoval=true`时，则表示该 API 在未来版本中肯定会被删除，开发人员应该使用新的 API 进行替代，不再容易产生歧义（Java9 之前，标记 @Deprecated 注解的 API，语义上存在多种可能性，比如：存在使用风险、可能在未来存在兼容性错误、可能在未来版本中被删除，以及应该使用更好的替代方案等）。

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

Java 14([ JEP 370](https://openjdk.org/jeps/370)) 的时候，第一次孵化外部内存访问 API，Java 15 中进行了第二次复活（[JEP 383](https://openjdk.org/jeps/383)），在 Java 16 中进行了第三次孵化。

引入外部内存访问 API 的目的如下：

- 通用：单个 API 应该能够对各种外部内存（如本机内存、持久内存、堆内存等）进行操作。
- 安全：无论操作何种内存，API 都不应该破坏 JVM 的安全性。
- 控制：可以自由的选择如何释放内存（显式、隐式等）。
- 可用：如果需要访问外部内存，API 应该是 `sun.misc.Unsafa`.

## JEP 394:instanceof 模式匹配(转正)

| JDK 版本   | 更新类型          | JEP                                     | 更新内容                                 |
| ---------- | ----------------- | --------------------------------------- | ---------------------------------------- |
| Java SE 14 | preview           | [JEP 305](https://openjdk.org/jeps/305) | 首次引入 instanceof 模式匹配。           |
| Java SE 15 | Second Preview    | [JEP 375](https://openjdk.org/jeps/375) | 相比较上个版本无变化，继续收集更多反馈。 |
| Java SE 16 | Permanent Release | [JEP 394](https://openjdk.org/jeps/394) | 模式变量不在隐式为 final。               |

从 Java 16 开始，你可以对 `instanceof` 中的变量值进行修改。

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

## JEP 395:记录类型(转正)

记录类型变更历史：

| JDK 版本   | 更新类型          | JEP                                          | 更新内容                                                     |
| ---------- | ----------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Java SE 14 | Preview           | [JEP 359](https://openjdk.java.net/jeps/359) | 引入 `record` 关键字，`record` 提供一种紧凑的语法来定义类中的不可变数据。 |
| Java SE 15 | Second Preview    | [JEP 384](https://openjdk.org/jeps/384)      | 支持在局部方法和接口中使用 `record`。                        |
| Java SE 16 | Permanent Release | [JEP 395](https://openjdk.org/jeps/395)      | 非静态内部类可以定义非常量的静态成员。                       |

从 Java SE 16 开始，非静态内部类可以定义非常量的静态成员。

```java
public class Outer {
	class Inner {
		static int age;
	}
}
```

> 在 JDK 16 之前，如果写上面这种代码，IDE 会提示你静态字段 age 不能在非静态的内部类中定义，除非它用一个常量表达式初始化。（The field age cannot be declared static in a non-static inner type, unless initialized with a constant expression）

## JEP 396:默认强封装 JDK 内部元素

此特性会默认强封装 JDK 的所有内部元素，但关键内部 API（例如 `sun.misc.Unsafe`）除外。默认情况下，使用早期版本成功编译的访问 JDK 内部 API 的代码可能不再起作用。鼓励开发人员从使用内部元素迁移到使用标准 API 的方法上，以便他们及其用户都可以无缝升级到将来的 Java 版本。强封装由 JDK 9 的启动器选项–illegal-access 控制，到 JDK 15 默认改为 warning，从 JDK 16 开始默认为 deny。（目前）仍然可以使用单个命令行选项放宽对所有软件包的封装，将来只有使用–add-opens 打开特定的软件包才行。

## JEP 397:密封类(预览)

密封类由 [JEP 360](https://openjdk.java.net/jeps/360) 提出预览，集成到了 Java 15 中。在 JDK 16 中， 密封类得到了改进（更加严格的引用检查和密封类的继承关系），由 [JEP 397](https://openjdk.java.net/jeps/397) 提出了再次预览。

在 [Java 15 新特性概览](./java15.md) 中，我有详细介绍到密封类，这里就不再做额外的介绍了。

## 其他优化与改进

- **JEP 380:Unix-Domain 套接字通道** ：Unix-domain 套接字一直是大多数 Unix 平台的一个特性，现在在 Windows 10 和 Windows Server 2019 也提供了支持。此特性为 java.nio.channels 包的套接字通道和服务器套接字通道 API 添加了 Unix-domain（AF_UNIX）套接字支持。它扩展了继承的通道机制以支持 Unix-domain 套接字通道和服务器套接字通道。Unix-domain 套接字用于同一主机上的进程间通信（IPC）。它们在很大程度上类似于 TCP/IP，区别在于套接字是通过文件系统路径名而不是 Internet 协议（IP）地址和端口号寻址的。对于本地进程间通信，Unix-domain 套接字比 TCP/IP 环回连接更安全、更有效
- **JEP 389:外部链接器 API(孵化) ：**该孵化器 API 提供了静态类型、纯 Java 访问原生代码的特性，该 API 将大大简化绑定原生库的原本复杂且容易出错的过程。Java 1.1 就已通过 Java 原生接口（JNI）支持了原生方法调用，但并不好用。Java 开发人员应该能够为特定任务绑定特定的原生库。它还提供了外来函数支持，而无需任何中间的 JNI 粘合代码。
- **JEP 357:从 Mercurial 迁移到 Git** ：在此之前，OpenJDK 源代码是使用版本管理工具 Mercurial 进行管理，现在迁移到了 Git。
- **JEP 369:迁移到 GitHub**：和 JEP 357 从 Mercurial 迁移到 Git 的改变一致，在把版本管理迁移到 Git 之后，选择了在 GitHub 上托管 OpenJDK 社区的 Git 仓库。不过只对 JDK 11 以及更高版本 JDK 进行了迁移。
- **JEP 386:移植 Alpine Linux** ：Apine Linux 是一个独立的、非商业的 Linux 发行版，它十分的小，一个容器需要不超过 8MB 的空间，最小安装到磁盘只需要大约 130MB 存储空间，并且十分的简单，同时兼顾了安全性。此提案将 JDK 移植到了 Apline Linux，由于 Apline Linux 是基于 musl lib 的轻量级 Linux 发行版，因此其他 x64 和 AArch64 架构上使用 musl lib 的 Linux 发行版也适用。
- **JEP 388:Windows/AArch64 移植** ：这些 JEP 的重点不是移植工作本身，而是将它们集成到 JDK 主线存储库中；JEP 386 将 JDK 移植到 Alpine Linux 和其他使用 musl 作为 x64 上主要 C 库的发行版上。此外，JEP 388 将 JDK 移植到 Windows AArch64（ARM64）。

## 参考文献

- [Java Language Changes](https://docs.oracle.com/en/java/javase/16/language/java-language-changes.html)
- [Consolidated JDK 16 Release Notes](https://www.oracle.com/java/technologies/javase/16all-relnotes.html)
- [Java 16 正式发布，新特性一一解析](https://www.infoq.cn/article/IAkwhx7i9V7G8zLVEd4L)
- [实操 | 剖析 Java16 新语法特性](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116)（写的很赞）
