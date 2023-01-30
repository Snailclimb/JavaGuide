---
title:  最重要的 JVM 参数总结
category: Java
tag:
  - JVM
---

> 本文由 JavaGuide 翻译自 [https://www.baeldung.com/jvm-parameters](https://www.baeldung.com/jvm-parameters)，并对文章进行了大量的完善补充。
>
> JDK 版本：1.8

## 1.概述

在本篇文章中，你将掌握最常用的 JVM 参数配置。

## 2.堆内存相关

> Java 虚拟机所管理的内存中最大的一块，Java 堆是所有线程共享的一块内存区域，在虚拟机启动时创建。**此内存区域的唯一目的就是存放对象实例，几乎所有的对象实例以及数组都在这里分配内存。**

### 2.1.显式指定堆内存`–Xms`和`-Xmx`

与性能有关的最常见实践之一是根据应用程序要求初始化堆内存。如果我们需要指定最小和最大堆大小（推荐显示指定大小），以下参数可以帮助你实现：

```bash
-Xms<heap size>[unit]
-Xmx<heap size>[unit]
```

- **heap size** 表示要初始化内存的具体大小。
- **unit** 表示要初始化内存的单位。单位为**_“ g”_** (GB) 、**_“ m”_**（MB）、**_“ k”_**（KB）。

举个栗子 🌰，如果我们要为 JVM 分配最小 2 GB 和最大 5 GB 的堆内存大小，我们的参数应该这样来写：

```bash
-Xms2G -Xmx5G
```

### 2.2.显式新生代内存(Young Generation)

根据[Oracle 官方文档](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/sizing.html)，在堆总可用内存配置完成之后，第二大影响因素是为 `Young Generation` 在堆内存所占的比例。默认情况下，YG 的最小大小为 1310 _MB_，最大大小为*无限制*。

一共有两种指定 新生代内存(Young Ceneration)大小的方法：

**1.通过`-XX:NewSize`和`-XX:MaxNewSize`指定**

```bash
-XX:NewSize=<young size>[unit]
-XX:MaxNewSize=<young size>[unit]
```

举个栗子 🌰，如果我们要为 新生代分配 最小 256m 的内存，最大 1024m 的内存我们的参数应该这样来写：

```bash
-XX:NewSize=256m
-XX:MaxNewSize=1024m
```

**2.通过`-Xmn<young size>[unit]`指定**

举个栗子 🌰，如果我们要为 新生代分配 256m 的内存（NewSize 与 MaxNewSize 设为一致），我们的参数应该这样来写：

```bash
-Xmn256m
```

GC 调优策略中很重要的一条经验总结是这样说的：

> 将新对象预留在新生代，由于 Full GC 的成本远高于 Minor GC，因此尽可能将对象分配在新生代是明智的做法，实际项目中根据 GC 日志分析新生代空间大小分配是否合理，适当通过“-Xmn”命令调节新生代大小，最大限度降低新对象直接进入老年代的情况。

另外，你还可以通过 **`-XX:NewRatio=<int>`** 来设置老年代与新生代内存的比值。

比如下面的参数就是设置老年代与新生代内存的比值为 1。也就是说老年代和新生代所占比值为 1：1，新生代占整个堆栈的 1/2。

```
-XX:NewRatio=1
```

### 2.3.显式指定永久代/元空间的大小

**从 Java 8 开始，如果我们没有指定 Metaspace 的大小，随着更多类的创建，虚拟机会耗尽所有可用的系统内存（永久代并不会出现这种情况）。**

JDK 1.8 之前永久代还没被彻底移除的时候通常通过下面这些参数来调节方法区大小

```bash
-XX:PermSize=N #方法区 (永久代) 初始大小
-XX:MaxPermSize=N #方法区 (永久代) 最大大小,超过这个值将会抛出 OutOfMemoryError 异常:java.lang.OutOfMemoryError: PermGen
```

相对而言，垃圾收集行为在这个区域是比较少出现的，但并非数据进入方法区后就“永久存在”了。

**JDK 1.8 的时候，方法区（HotSpot 的永久代）被彻底移除了（JDK1.7 就已经开始了），取而代之是元空间，元空间使用的是本地内存。**

下面是一些常用参数：

```bash
-XX:MetaspaceSize=N #设置 Metaspace 的初始（和最小大小）
-XX:MaxMetaspaceSize=N #设置 Metaspace 的最大大小，如果不指定大小的话，随着更多类的创建，虚拟机会耗尽所有可用的系统内存。
```

## 3.垃圾收集相关

### 3.1.垃圾回收器

为了提高应用程序的稳定性，选择正确的[垃圾收集](http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)算法至关重要。

JVM 具有四种类型的 GC 实现：

- 串行垃圾收集器
- 并行垃圾收集器
- CMS 垃圾收集器
- G1 垃圾收集器

可以使用以下参数声明这些实现：

```bash
-XX:+UseSerialGC
-XX:+UseParallelGC
-XX:+UseParNewGC
-XX:+UseG1GC
```

有关*垃圾回收*实施的更多详细信息，请参见[此处](https://github.com/Snailclimb/JavaGuide/blob/master/docs/java/jvm/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6.md)。

### 3.2.GC 日志记录

生产环境上，或者其他要测试 GC 问题的环境上，一定会配置上打印 GC 日志的参数，便于分析 GC 相关的问题。

```bash
# 必选
# 打印基本 GC 信息
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
# 打印对象分布
-XX:+PrintTenuringDistribution
# 打印堆数据
-XX:+PrintHeapAtGC
# 打印Reference处理信息
# 强引用/弱引用/软引用/虚引用/finalize 相关的方法
-XX:+PrintReferenceGC
# 打印STW时间
-XX:+PrintGCApplicationStoppedTime

# 可选
# 打印safepoint信息，进入 STW 阶段之前，需要要找到一个合适的 safepoint
-XX:+PrintSafepointStatistics
-XX:PrintSafepointStatisticsCount=1

# GC日志输出的文件路径
-Xloggc:/path/to/gc-%t.log
# 开启日志文件分割
-XX:+UseGCLogFileRotation
# 最多分割几个文件，超过之后从头文件开始写
-XX:NumberOfGCLogFiles=14
# 每个文件上限大小，超过就触发分割
-XX:GCLogFileSize=50M
```

## 4.处理 OOM

对于大型应用程序来说，面对内存不足错误是非常常见的，这反过来会导致应用程序崩溃。这是一个非常关键的场景，很难通过复制来解决这个问题。

这就是为什么 JVM 提供了一些参数，这些参数将堆内存转储到一个物理文件中，以后可以用来查找泄漏:

```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./java_pid<pid>.hprof
-XX:OnOutOfMemoryError="< cmd args >;< cmd args >"
-XX:+UseGCOverheadLimit
```

这里有几点需要注意:

- **HeapDumpOnOutOfMemoryError** 指示 JVM 在遇到 **OutOfMemoryError** 错误时将 heap 转储到物理文件中。
- **HeapDumpPath** 表示要写入文件的路径; 可以给出任何文件名; 但是，如果 JVM 在名称中找到一个 `<pid>` 标记，则当前进程的进程 id 将附加到文件名中，并使用`.hprof`格式
- **OnOutOfMemoryError** 用于发出紧急命令，以便在内存不足的情况下执行; 应该在 `cmd args` 空间中使用适当的命令。例如，如果我们想在内存不足时重启服务器，我们可以设置参数: `-XX:OnOutOfMemoryError="shutdown -r"` 。
- **UseGCOverheadLimit** 是一种策略，它限制在抛出 OutOfMemory 错误之前在 GC 中花费的 VM 时间的比例

## 5.其他

- `-server` : 启用“ Server Hotspot VM”; 此参数默认用于 64 位 JVM
- `-XX:+UseStringDeduplication` : _Java 8u20_ 引入了这个 JVM 参数，通过创建太多相同 String 的实例来减少不必要的内存使用; 这通过将重复 String 值减少为单个全局 `char []` 数组来优化堆内存。
- `-XX:+UseLWPSynchronization`: 设置基于 LWP (轻量级进程)的同步策略，而不是基于线程的同步。
- ``-XX:LargePageSizeInBytes `: 设置用于 Java 堆的较大页面大小; 它采用 GB/MB/KB 的参数; 页面大小越大，我们可以更好地利用虚拟内存硬件资源; 然而，这可能会导致 PermGen 的空间大小更大，这反过来又会迫使 Java 堆空间的大小减小。
- `-XX:MaxHeapFreeRatio` : 设置 GC 后, 堆空闲的最大百分比，以避免收缩。
- `-XX:SurvivorRatio` : eden/survivor 空间的比例, 例如`-XX:SurvivorRatio=6` 设置每个 survivor 和 eden 之间的比例为 1:6。
- `-XX:+UseLargePages` : 如果系统支持，则使用大页面内存; 请注意，如果使用这个 JVM 参数，OpenJDK 7 可能会崩溃。
- `-XX:+UseStringCache` : 启用 String 池中可用的常用分配字符串的缓存。
- `-XX:+UseCompressedStrings` : 对 String 对象使用 `byte []` 类型，该类型可以用纯 ASCII 格式表示。
- `-XX:+OptimizeStringConcat` : 它尽可能优化字符串串联操作。

## 文章推荐

这里推荐了非常多优质的 JVM 实践相关的文章，推荐阅读，尤其是 JVM 性能优化和问题排查相关的文章。

- [JVM参数配置说明 - 阿里云官方文档 - 2022](https://help.aliyun.com/document_detail/148851.html)
- [JVM内存配置最佳实践 - 阿里云官方文档 - 2022](https://help.aliyun.com/document_detail/383255.html)
- [求你了，GC 日志打印别再瞎配置了 - 思否 - 2022](https://segmentfault.com/a/1190000039806436)
- [一次大量 JVM Native 内存泄露的排查分析（64M 问题） - 掘金 - 2022](https://juejin.cn/post/7078624931826794503)
- [一次线上JVM调优实践，FullGC40次/天到10天一次的优化过程 - HeadpDump - 2021](https://heapdump.cn/article/1859160)
- [听说 JVM 性能优化很难？今天我小试了一把！ - 陈树义 - 2021](https://shuyi.tech/archives/have-a-try-in-jvm-combat)
- [你们要的线上 GC 问题案例来啦 - 编了个程 - 2021](https://mp.weixin.qq.com/s/df1uxHWUXzhErxW1sZ6OvQ)
- [Java 中 9 种常见的 CMS GC 问题分析与解决 - 美团技术团队 - 2020](https://tech.meituan.com/2020/11/12/java-9-cms-gc.html)
- [从实际案例聊聊 Java 应用的 GC 优化-美团技术团队 - 美团技术团队 - 2017](https://tech.meituan.com/2017/12/29/jvm-optimize.html)
