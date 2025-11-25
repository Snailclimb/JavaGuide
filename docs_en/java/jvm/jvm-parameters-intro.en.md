---
title: Summary of the most important JVM parameters
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM parameters, heap size, stack size, GC settings, performance tuning, XX parameters
  - - meta
    - name: description
      content: Summarizes commonly used JVM parameters and configuration methods, combined with practical suggestions for memory and GC tuning.
---

> This article was translated by JavaGuide from [https://www.baeldung.com/jvm-parameters](https://www.baeldung.com/jvm-parameters), and a lot of improvements and supplements have been made to the article.
> Document parameters [https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)
>
> JDK version: 1.8 mainly, common parameters for new versions will also be added

In this article, we will master some of the most commonly used parameter configurations in the Java Virtual Machine (JVM) to help you better understand and tune the running environment of Java applications.

## Heap memory related

> Java Heap is the largest area of memory managed by the JVM. It is shared by all threads and is created when the virtual machine starts. **The only purpose of this memory area is to store object instances. Almost all object instances and arrays must allocate memory on the heap. **

![Common configuration parameters in memory area](./pictures/Common configuration parameters in memory area.png)

### Set heap memory size (-Xms and -Xmx)

Setting the initial and maximum heap memory size according to the actual needs of the application is one of the most common practices in performance tuning. **It is recommended to set these two parameters explicitly, and it is generally recommended to set them to the same value** to avoid the performance overhead caused by dynamic adjustment of heap memory at runtime.

Set it up using the following parameters:

```bash
-Xms<heap size>[unit] # Set the JVM initial heap size
-Xmx<heap size>[unit] #Set the JVM maximum heap size
```

- `<heap size>`: Specify the specific value of memory.
- `[unit]`: Specify the unit of memory, such as g (GB), m (MB), k (KB).

**Example:** Set both the JVM's initial and maximum heap to 4GB:

```bash
-Xms4G -Xmx4G
```

### Set the memory size of the new generation (Young Generation)

According to [Oracle official documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/sizing.html), after the total available memory of the heap is configured, the second largest influencing factor is the proportion of `Young Generation` in the heap memory. By default, YG has a minimum size of **1310 MB** and a maximum size of **Unlimited**.

The young generation memory size can be set in the following two ways:

**1. Specify through `-XX:NewSize` and `-XX:MaxNewSize`**

```bash
-XX:NewSize=<young size>[unit] # Set the initial size of the new generation
-XX:MaxNewSize=<young size>[unit] # Set the maximum size of the new generation
```

**Example:** Set the minimum size of the new generation to 512MB and the maximum size to 1024MB:

```bash
-XX:NewSize=512m -XX:MaxNewSize=1024m
```

**2. Specify through `-Xmn<young size>[unit]`**

**Example:** Fix the young generation size to 512MB:

```bash
-Xmn512m
```

A very important summary of experience in GC tuning strategies is this:

> Try to allow newly created objects to allocate memory and be recycled in the new generation, because the cost of Minor GC is usually much lower than Full GC. By analyzing GC logs, determine whether the new generation space allocation is reasonable. If a large number of new objects enter the old generation prematurely (Promotion), you can appropriately adjust the size of the new generation through `-Xmn` or -`XX:NewSize/-XX:MaxNewSize`. The goal is to minimize the situation where objects directly enter the old generation.

In addition, you can also set the memory size ratio between the old generation and the new generation (excluding the Survivor area) through the **`-XX:NewRatio=<int>`** parameter.

For example, `-XX:NewRatio=2` (default value) means old generation : new generation = 2 : 1. That is, the new generation occupies 1/3 of the entire heap size.

```bash
-XX:NewRatio=2
```

### Set the permanent generation/metaspace size (PermGen/Metaspace)

**Starting from Java 8, if we do not specify the size of the Metaspace, the virtual machine will exhaust all available system memory as more classes are created (this does not happen with the permanent generation). **

Before JDK 1.8, when the permanent generation had not been completely removed, the method area size was usually adjusted through the following parameters:

```bash
-XX:PermSize=N #Initial size of method area (permanent generation)
-XX:MaxPermSize=N #The maximum size of the method area (permanent generation), exceeding this value will throw an OutOfMemoryError exception: java.lang.OutOfMemoryError: PermGen
```

Relatively speaking, garbage collection behavior is relatively rare in this area, but it does not mean that the data "exists permanently" after entering the method area.

**In JDK 1.8, the method area (HotSpot's permanent generation) was completely removed (already started in JDK 1.7) and replaced by metaspace, which uses local memory. **

Here are some commonly used parameters:

```bash
-XX:MetaspaceSize=N #Set the initial size of Metaspace (this is a common misunderstanding, which will be explained later)
-XX:MaxMetaspaceSize=N #Set the maximum size of Metaspace
```

**🐛 Correction (see: [issue#1947](https://github.com/Snailclimb/JavaGuide/issues/1947))**:

**1. `-XX:MetaspaceSize` is not the initial capacity: ** The initial capacity of Metaspace is not set by `-XX:MetaspaceSize`. No matter what value is configured with `-XX:MetaspaceSize`, for a 64-bit JVM, the initial capacity of the metaspace is usually a fixed, small value (Oracle documents mention between about 12MB and 20MB, and the actual observation is about 20.8MB).

You can refer to what is mentioned in Oracle's official documentation [Other Considerations](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/considerations.html):

> Specify a higher value for the option MetaspaceSize to avoid early garbage collections induced for class metadata. The amount of class metadata allocated for an application is application-dependent and general guidelines do not exist for the selection of MetaspaceSize. The default size of MetaspaceSize is platform-dependent and ranges from 12 MB to about 20 MB.
>
> The default size of MetaspaceSize is platform dependent and ranges from 12 MB to approximately 20 MB.

In addition, you can also take a look at this experiment: [Misunderstanding of JVM parameter MetaspaceSize](https://mp.weixin.qq.com/s/jqfppqqd98DfAJHZhFbmxA).

**2. Expansion and Full GC:** When the usage of Metaspace increases and reaches the threshold specified by `-XX:MetaspaceSize` for the first time, a Full GC will be triggered. After that, the JVM will dynamically adjust the threshold that triggers GC. If the metaspace continues to grow, a Full GC may still be triggered each time a new threshold is reached and expansion is required (the specific behavior depends on the garbage collector and version). The garbage collector internally determines whether the Metaspace area reaches the threshold based on the variable `_capacity_until_GC`. The initialization code is as follows:

```c
void MetaspaceGC::initialize() {
  // Set the high-water mark to MaxMetapaceSize during VM initialization since
  // we can't do a GC during initialization.
  _capacity_until_GC = MaxMetaspaceSize;
}
```**3、`-XX:MaxMetaspaceSize` 的重要性：**如果不显式设置 -`XX:MaxMetaspaceSize`，元空间的最大大小理论上受限于可用的本地内存。在极端情况下（如类加载器泄漏导致不断加载类），这确实**可能耗尽大量本地内存**。因此，**强烈建议设置一个合理的 `-XX:MaxMetaspaceSize` 上限**，以防止对系统造成影响。

相关阅读：[issue 更正：MaxMetaspaceSize 如果不指定大小的话，不会耗尽内存 #1204](https://github.com/Snailclimb/JavaGuide/issues/1204) 。

## 垃圾收集相关

### 选择垃圾回收器

选择合适的垃圾收集器（Garbage Collector, GC）对于应用的吞吐量和响应延迟至关重要。关于垃圾收集算法和收集器的详细介绍，可以看笔者写的这篇：[JVM 垃圾回收详解（重点）](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)。

JVM 提供了多种 GC 实现，适用于不同的场景：

- **Serial GC (串行垃圾收集器):** 单线程执行 GC，适用于客户端模式或单核 CPU 环境。参数：`-XX:+UseSerialGC`。
- **Parallel GC (并行垃圾收集器):** 多线程执行新生代 GC (Minor GC)，以及可选的多线程执行老年代 GC (Full GC，通过 `-XX:+UseParallelOldGC`)。关注吞吐量，是 JDK 8 的默认 GC。参数：`-XX:+UseParallelGC`。
- **CMS GC (Concurrent Mark Sweep 并发标记清除收集器):** 以获取最短回收停顿时间为目标，大部分 GC 阶段可与用户线程并发执行。适用于对响应时间要求高的应用。在 JDK 9 中被标记为弃用，JDK 14 中被移除。参数：`-XX:+UseConcMarkSweepGC`。
- **G1 GC (Garbage-First Garbage Collector):** JDK 9 及之后版本的默认 GC。将堆划分为多个 Region，兼顾吞吐量和停顿时间，试图在可预测的停顿时间内完成 GC。参数：`-XX:+UseG1GC`。
- **ZGC:** 更新的低延迟 GC，目标是将 GC 停顿时间控制在几毫秒甚至亚毫秒级别，需要较新版本的 JDK 支持。参数（具体参数可能随版本变化）：`-XX:+UseZGC`、`-XX:+UseShenandoahGC`。

### GC 日志记录

在生产环境或进行 GC 问题排查时，**务必开启 GC 日志记录**。详细的 GC 日志是分析和解决 GC 问题的关键依据。

以下是一些推荐配置的 GC 日志参数（适用于 JDK 8/11 等常见版本）：

```bash
# --- 推荐的基础配置 ---
# 打印详细 GC 信息
-XX:+PrintGCDetails
# 打印 GC 发生的时间戳 (相对于 JVM 启动时间)
# -XX:+PrintGCTimeStamps
# 打印 GC 发生的日期和时间 (更常用)
-XX:+PrintGCDateStamps
# 指定 GC 日志文件的输出路径，%t 可以输出日期时间戳
-Xloggc:/path/to/gc-%t.log

# --- 推荐的进阶配置 ---
# 打印对象年龄分布 (有助于判断对象晋升老年代的情况)
-XX:+PrintTenuringDistribution
# 在 GC 前后打印堆信息
-XX:+PrintHeapAtGC
# 打印各种类型引用 (强/软/弱/虚) 的处理信息
-XX:+PrintReferenceGC
# 打印应用暂停时间 (Stop-The-World, STW)
-XX:+PrintGCApplicationStoppedTime

# --- GC 日志文件滚动配置 ---
# 启用 GC 日志文件滚动
-XX:+UseGCLogFileRotation
# 设置滚动日志文件的数量 (例如，保留最近 14 个)
-XX:NumberOfGCLogFiles=14
# 设置每个日志文件的最大大小 (例如，50MB)
-XX:GCLogFileSize=50M

# --- 可选的辅助诊断配置 ---
# 打印安全点 (Safepoint) 统计信息 (有助于分析 STW 原因)
# -XX:+PrintSafepointStatistics
# -XX:PrintSafepointStatisticsCount=1
```

**注意:** JDK 9 及之后版本引入了统一的 JVM 日志框架 (`-Xlog`)，配置方式有所不同，但上述 `-Xloggc` 和滚动参数通常仍然兼容或有对应的新参数。

## 处理 OOM

对于大型应用程序来说，面对内存不足错误是非常常见的，这反过来会导致应用程序崩溃。这是一个非常关键的场景，很难通过复制来解决这个问题。

这就是为什么 JVM 提供了一些参数，这些参数将堆内存转储到一个物理文件中，以后可以用来查找泄漏:

```bash
# 在发生 OOM 时生成堆转储文件
-XX:+HeapDumpOnOutOfMemoryError

# 指定堆转储文件的输出路径。<pid> 会被替换为进程 ID
-XX:HeapDumpPath=/path/to/heapdump/java_pid<pid>.hprof
# 示例：-XX:HeapDumpPath=/data/dumps/

# (可选) 在发生 OOM 时执行指定的命令或脚本
# 例如，发送告警通知或尝试重启服务（需谨慎使用）
# -XX:OnOutOfMemoryError="<command> <args>"
# 示例：-XX:OnOutOfMemoryError="sh /path/to/notify.sh"

# (可选) 启用 GC 开销限制检查
# 如果 GC 时间占总时间比例过高（默认 98%）且回收效果甚微（默认小于 2% 堆内存），
# 会提前抛出 OOM，防止应用长时间卡死在 GC 中。
-XX:+UseGCOverheadLimit
```

## 其他常用参数

- `-server`: 明确启用 Server 模式的 HotSpot VM。（在 64 位 JVM 上通常是默认值）。
- `-XX:+UseStringDeduplication`: (JDK 8u20+) 尝试识别并共享底层 `char[]` 数组相同的 String 对象，以减少内存占用。适用于存在大量重复字符串的场景。
- `-XX:SurvivorRatio=<ratio>`: 设置 Eden 区与单个 Survivor 区的大小比例。例如 `-XX:SurvivorRatio=8` 表示 Eden:Survivor = 8:1。
- `-XX:MaxTenuringThreshold=<threshold>`: 设置对象从新生代晋升到老年代的最大年龄阈值（对象每经历一次 Minor GC 且存活，年龄加 1）。默认值通常是 15。
- `-XX:+DisableExplicitGC`: 禁止代码中显式调用 `System.gc()`。推荐开启，避免人为触发不必要的 Full GC。
- `-XX:+UseLargePages`: (需要操作系统支持) 尝试使用大内存页（如 2MB 而非 4KB），可能提升内存密集型应用的性能，但需谨慎测试。
- -`XX:MinHeapFreeRatio=<percent> / -XX:MaxHeapFreeRatio=<percent>`: 控制 GC 后堆内存保持空闲的最小/最大百分比，用于动态调整堆大小（如果 `-Xms` 和 `-Xmx` 不相等）。通常建议将 `-Xms` 和 `-Xmx` 设为一致，避免调整开销。

**注意：** 以下参数在现代 JVM 版本中可能已**弃用、移除或默认开启且无需手动设置**：

- `-XX:+UseLWPSynchronization`: 较旧的同步策略选项，现代 JVM 通常有更优化的实现。
- `-XX:LargePageSizeInBytes`: 通常由 `-XX:+UseLargePages` 自动确定或通过 OS 配置。
- `-XX:+UseStringCache`: 已被移除。
- `-XX:+UseCompressedStrings`: 已被 Java 9 及之后默认开启的 Compact Strings 特性取代。
- `-XX:+OptimizeStringConcat`: 字符串连接优化（invokedynamic）在 Java 9 及之后是默认行为。

## 总结

本文为 Java 开发者提供了一份实用的 JVM 常用参数配置指南，旨在帮助读者理解和优化 Java 应用的性能与稳定性。文章重点强调了以下几个方面：

1. **堆内存配置：** 建议显式设置初始与最大堆内存 (`-Xms`, -`Xmx`，通常设为一致) 和新生代大小 (`-Xmn` 或 `-XX:NewSize/-XX:MaxNewSize`)，这对 GC 性能至关重要。
2. **Metaspace Management (Java 8+):** Clarified what `-XX:MetaspaceSize` actually does (the threshold at which Full GC is triggered for the first time, not the initial capacity), and strongly recommends setting `-XX:MaxMetaspaceSize` to prevent potential local memory exhaustion.
3. **Garbage collector selection and logging: **Introduces the applicable scenarios of different GC algorithms, and emphasizes the necessity of turning on detailed GC logs (`-Xloggc`, `-XX:+PrintGCDetails`, etc.) for troubleshooting in production and test environments.
4. **OOM Troubleshooting:** Explains how to automatically generate a heap dump file when an OOM occurs through parameters such as `-XX:+HeapDumpOnOutOfMemoryError` for subsequent memory leak analysis.
5. **Other parameters:** Briefly introduces other useful parameters such as string deduplication, and points out the current status of some old parameters.

For specific troubleshooting and tuning cases, you can refer to this article compiled by the author: [JVM online troubleshooting and performance tuning cases] (https://javaguide.cn/java/jvm/jvm-in-action.html).

<!-- @include: @article-footer.snippet.md -->