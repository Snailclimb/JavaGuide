---
title: Java 19 新特性概览
category: Java
tag:
  - Java新特性
---

Java 18 在 2022 年 3 月 22 日正式发布，非长期支持版本。Java 18 带来了 9 个新特性：

- [JEP 400:UTF-8 by Default（默认字符集为 UTF-8）](https://openjdk.java.net/jeps/400)
- [JEP 408:Simple Web Server（简易的 Web 服务器）](https://openjdk.java.net/jeps/408)
- [JEP 413:Code Snippets in Java API Documentation（Java API 文档中的代码片段）](https://openjdk.java.net/jeps/413)
- [JEP 416:Reimplement Core Reflection with Method Handles（使用方法句柄重新实现反射核心）](https://openjdk.java.net/jeps/416)
- [JEP 417:Vector（向量） API ](https://openjdk.java.net/jeps/417)（第三次孵化）
- [JEP 418:Internet-Address Resolution（互联网地址解析）SPI](https://openjdk.java.net/jeps/418)
- [JEP 419:Foreign Function & Memory API（外部函数和内存 API）](https://openjdk.java.net/jeps/419)（第二次孵化）
- [JEP 420:Pattern Matching for switch（switch 模式匹配）](https://openjdk.java.net/jeps/420)（第二次预览）
- [JEP 421:Deprecate Finalization for Removal](https://openjdk.java.net/jeps/421)

Java 17 中包含 14 个特性，Java 16 中包含 17 个特性，Java 15 中包含 14 个特性，Java 14 中包含 16 个特性。相比于前面发布的版本来说，Java 18 的新特性少了很多。

这里只对 400、408、413、416、418 这 5 个我觉得比较重要的新特性进行详细介绍。在 [Java 19 新特性概览](./java19.md)这篇文章中，我详细介绍了 Vector（向量） API 和 Foreign Function & Memory API（外部函数和内存 API），感兴趣的可以看看，这里就不重复讲了。

相关阅读：

- [OpenJDK Java 18 文档](https://openjdk.java.net/projects/jdk/18/)
- [IntelliJ IDEA | Java 18 功能支持](https://mp.weixin.qq.com/s/PocFKR9z9u7-YCZHsrA5kQ)

## JEP 400:默认字符集为 UTF-8

JDK 终于将 UTF-8 设置为默认字符集。

在 Java 17 及更早版本中，默认字符集是在 Java 虚拟机运行时才确定的，取决于不同的操作系统、区域设置等因素，因此存在潜在的风险。就比如说你在 Mac 上运行正常的一段打印文字到控制台的 Java 程序到了 Windows 上就会出现乱码，如果你不手动更改字符集的话。

## JEP 408:简易的 Web 服务器

Java 18 之后，你可以使用 `jwebserver` 命令启动一个简易的静态 Web 服务器。

```bash
$ jwebserver
Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
Serving /cwd and subdirectories on 127.0.0.1 port 8000
URL: http://127.0.0.1:8000/
```

这个服务器不支持 CGI 和 Servlet，只限于静态文件。

## JEP 413:优化 Java API 文档中的代码片段

在 Java 18 之前，如果我们想要在 Javadoc 中引入代码片段可以使用 `<pre>{@code ...}</pre>` 。

```java
<pre>{@code
    lines of source code
}</pre>
```

`<pre>{@code ...}</pre>` 这种方式生成的效果比较一般。

在 Java 18 之后，可以通过 `@snippet` 标签来做这件事情。

```java
/**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet :
 * if (v.isPresent()) {
 *     System.out.println("v: " + v.get());
 * }
 * }
 */
```

`@snippet` 这种方式生成的效果更好且使用起来更方便一些。

## JEP 416:使用方法句柄重新实现反射核心

Java 18 改进了 `java.lang.reflect.Method`、`Constructor` 的实现逻辑，使之性能更好，速度更快。这项改动不会改动相关 API ，这意味着开发中不需要改动反射相关代码，就可以体验到性能更好反射。

OpenJDK 官方给出了新老实现的反射性能基准测试结果。

![新老实现的反射性能基准测试结果](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/java/new-features/JEP416Benchmark.png)

## JEP 418:互联网地址解析 SPI

Java 18 定义了一个全新的 SPI（service-provider interface），用于主要名称和地址的解析，以便 `java.net.InetAddress` 可以使用平台之外的第三方解析器。