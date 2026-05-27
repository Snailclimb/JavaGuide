---
title: Java 知识体系：基础、集合、并发、JVM、IO 与新特性
description: Java 面试与知识体系学习路线，涵盖 Java 基础、集合源码、并发编程、JVM、IO/NIO 和 Java 新特性，适合校招、社招和 Java 后端面试复习。
category: Java
tag:
  - Java
  - Java基础
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: Java,Java基础,Java集合,Java并发,JVM,Java IO,Java NIO,Java新特性,Java面试题,Java后端面试
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **Java 知识体系** 面向 Java 后端学习和面试复习，按“基础语法 -> 集合容器 -> 并发编程 -> IO/NIO -> JVM -> 新特性”的顺序整理本站 Java 相关文章。

如果你时间有限，建议先看 Java 基础、集合、并发和 JVM 的面试题总结，快速建立高频问题清单；如果你想系统补基础，可以按下面的专题顺序阅读。

## 适合谁看

- 正在系统学习 Java 的后端开发者。
- 准备校招、社招、中大厂 Java 后端面试的同学。
- 想把 Java 基础、集合、并发、JVM、IO 和新特性串起来复习的读者。
- 已经写过 Java 项目，但对底层原理、源码设计和工程实践理解不够系统的工程师。

## 学习重点

- Java 基础语法、面向对象、异常、泛型、反射、代理、序列化等核心机制。
- List、Map、Queue、并发容器的使用边界、源码实现和常见面试题。
- Java 线程、锁、JMM、CAS、AQS、线程池、CompletableFuture 和虚拟线程。
- JVM 内存区域、类加载、垃圾回收、参数配置、监控工具和线上问题排查。
- BIO、NIO、AIO、IO 模型，以及装饰器、适配器等 IO 相关设计模式。
- Java 8 到 Java 26 的重要新特性，以及哪些特性真正影响日常开发。

## 建议阅读顺序

1. [Java 基础专题](./basis/)：先掌握语法、面向对象、泛型、反射、代理、序列化等基础能力。
2. [Java 集合专题](./collection/)：理解 ArrayList、LinkedList、HashMap、ConcurrentHashMap 等常用容器的使用和源码。
3. [Java 并发编程专题](./concurrent/)：系统学习线程、锁、JMM、CAS、AQS、线程池和并发工具类。
4. [JVM 专题](./jvm/)：理解内存区域、类加载、垃圾回收、JVM 参数和线上排查。
5. [Java IO 专题](./io/)：补齐 BIO、NIO、AIO、Reactor、多路复用和 IO 设计模式。
6. [Java 新特性专题](./new-features/)：按版本梳理 Lambda、Stream、模块化、var、Record、虚拟线程等关键特性。

## 核心文章

### Java 基础

- [Java 基础专题](./basis/)：从基础语法讲到核心机制和常见 Java 面试题。
- [Java基础常见面试题总结(上)](./basis/java-basic-questions-01.md)：覆盖 Java 语言特点、基础语法、面向对象和常用类。
- [Java基础常见面试题总结(中)](./basis/java-basic-questions-02.md)：继续梳理异常、泛型、反射、注解和常见细节。
- [Java基础常见面试题总结(下)](./basis/java-basic-questions-03.md)：补齐高级基础知识和常见易错点。
- [Java 值传递详解](./basis/why-there-only-value-passing-in-java.md)：厘清值传递、引用变量和对象修改之间的关系。
- [Java 序列化详解](./basis/serialization.md)：理解序列化机制、serialVersionUID、安全风险和替代方案。
- [Java 反射机制详解](./basis/reflection.md) 和 [Java 代理模式详解](./basis/proxy.md)：掌握框架底层常见机制。

### Java 集合

- [Java 集合专题](./collection/)：串联集合框架、使用注意事项和常见源码分析。
- [Java集合常见面试题总结(上)](./collection/java-collection-questions-01.md) 和 [Java集合常见面试题总结(下)](./collection/java-collection-questions-02.md)：覆盖 List、Set、Map、Queue 和并发集合高频问题。
- [Java集合使用注意事项总结](./collection/java-collection-precautions-for-use.md)：总结集合判空、遍历、扩容、线程安全和性能相关注意点。
- [ArrayList 源码分析](./collection/arraylist-source-code.md)、[HashMap 源码分析](./collection/hashmap-source-code.md)、[ConcurrentHashMap 源码分析](./collection/concurrent-hash-map-source-code.md)：从源码理解常用容器的设计取舍。

### Java 并发

- [Java 并发编程专题](./concurrent/)：围绕线程、锁、内存模型、线程池和并发工具展开。
- [Java并发常见面试题总结（上）](./concurrent/java-concurrent-questions-01.md)、[Java并发常见面试题总结（中）](./concurrent/java-concurrent-questions-02.md)、[Java并发常见面试题总结（下）](./concurrent/java-concurrent-questions-03.md)：建立并发面试问题清单。
- [JMM（Java 内存模型）详解](./concurrent/jmm.md)：理解可见性、原子性、有序性和 happens-before。
- [CAS 详解](./concurrent/cas.md)、[AQS 详解](./concurrent/aqs.md)、[Java 线程池详解](./concurrent/java-thread-pool-summary.md)：掌握并发底层高频考点。
- [虚拟线程常见问题总结](./concurrent/virtual-thread.md)：理解 Project Loom 对并发模型的影响。

### JVM 与 IO

- [JVM 专题](./jvm/)：围绕内存、类加载、GC、参数、工具和线上排查展开。
- [Java内存区域详解（重点）](./jvm/memory-area.md)：理解程序计数器、虚拟机栈、本地方法栈、堆和方法区。
- [JVM垃圾回收详解（重点）](./jvm/jvm-garbage-collection.md)：理解对象存活判断、垃圾收集算法和主流垃圾收集器。
- [类加载过程详解](./jvm/class-loading-process.md) 和 [类加载器详解（重点）](./jvm/classloader.md)：掌握类生命周期和双亲委派模型。
- [Java IO 专题](./io/)：从 BIO、NIO、AIO 讲到 IO 模型和 IO 设计模式。
- [Java IO 基础知识总结](./io/io-basis.md)、[Java NIO 核心知识总结](./io/nio-basis.md)、[Java IO 模型详解](./io/io-model.md)：补齐网络编程和中间件学习前置知识。

### Java 新特性

- [Java 新特性专题](./new-features/)：按版本梳理 Java 8 之后的重要语言、标准库和 JVM 特性。
- [Java8 新特性实战](./new-features/java8-common-new-features.md)：掌握 Lambda、Stream、Optional、接口默认方法和新日期 API。
- [Java 11 新特性概览（重要）](./new-features/java11.md)、[Java 17 新特性概览（重要）](./new-features/java17.md)、[Java 21 新特性概览(重要)](./new-features/java21.md)：优先关注 LTS 版本中的长期可用特性。

## 高频问题

- Java 为什么是值传递？对象引用作为参数传递时到底发生了什么？
- `String`、`StringBuilder`、`StringBuffer` 有什么区别？
- `equals()` 和 `hashCode()` 有什么关系？
- `ArrayList` 和 `LinkedList` 如何选择？`HashMap` 为什么线程不安全？
- `ConcurrentHashMap` 在 JDK 7 和 JDK 8 中有什么变化？
- `synchronized` 和 `ReentrantLock` 有什么区别？
- JMM 如何保证可见性、有序性和原子性？
- 线程池核心参数如何配置？为什么不建议直接使用 `Executors`？
- JVM 内存区域如何划分？哪些区域可能发生 OOM？
- G1、ZGC、Shenandoah 分别适合什么场景？
- BIO、NIO、AIO 有什么区别？Reactor 模型解决什么问题？
- Java 8、11、17、21 中哪些新特性最值得掌握？

## 相关专题

- [计算机基础](../cs-basics/)
- [系统设计](../system-design/)
- [数据库](../database/)
- [分布式系统知识体系](../distributed-system/)
- [高性能系统知识体系](../high-performance/)

<!-- @include: @article-footer.snippet.md -->
