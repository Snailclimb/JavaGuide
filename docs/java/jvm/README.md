---
title: JVM 专题：内存区域、类加载、垃圾回收、参数调优与线上排查
description: JVM 面试与性能调优学习路线，涵盖 Java 内存区域、类文件结构、类加载、垃圾回收、JVM 参数、JDK 监控工具和线上问题排查。
category: Java
tag:
  - Java
  - JVM
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: JVM,JVM面试题,Java内存区域,类加载,类加载器,垃圾回收,GC,JVM参数,JDK监控工具,OOM,性能调优
---

JVM 是 Java 后端绕不开的核心基础。学习 JVM 的目标不是背概念，而是能解释对象如何创建和回收、类如何加载、GC 如何影响应用、参数如何配置，以及线上 OOM、频繁 GC、CPU 飙高等问题应该如何排查。

## 适合谁看

- 想系统学习 JVM 的 Java 后端开发者。
- 准备 JVM 内存、类加载、GC、参数调优和线上排查相关面试题的同学。
- 已经参与过线上服务维护，但对 GC 日志、堆转储、线程栈和 JDK 工具不熟的读者。
- 想继续深入 Spring、Netty、中间件或性能优化的工程师。

## 学习重点

- JVM 运行时内存区域、对象创建、对象访问和 OOM 场景。
- 类文件结构、类加载过程、类加载器和双亲委派模型。
- 垃圾回收基础、对象存活判断、垃圾收集算法和主流垃圾收集器。
- JVM 参数、GC 日志、堆转储、线程栈和常见 JDK 监控诊断工具。
- 线上问题排查的基本路径：现象观察、指标采集、工具分析、原因定位和优化验证。

## 建议阅读顺序

1. [大白话带你认识 JVM](./jvm-intro.md)：先建立 JVM 的整体认知。
2. [Java内存区域详解（重点）](./memory-area.md)：理解运行时数据区和常见 OOM 场景。
3. [类文件结构详解](./class-file-structure.md)、[类加载过程详解](./class-loading-process.md)、[类加载器详解（重点）](./classloader.md)：掌握类从 `.class` 到可运行对象的过程。
4. [JVM垃圾回收详解（重点）](./jvm-garbage-collection.md)：系统学习 GC 基础、算法和垃圾收集器。
5. [最重要的JVM参数总结](./jvm-parameters-intro.md)、[JDK监控和故障处理工具总结](./jdk-monitoring-and-troubleshooting-tools.md)、[JVM线上问题排查和性能调优案例](./jvm-in-action.md)：进入参数配置和线上实践。

## 核心文章

### JVM 基础与内存

- [大白话带你认识 JVM](./jvm-intro.md)：用整体视角理解 JVM 的定位和组成。
- [Java内存区域详解（重点）](./memory-area.md)：讲解程序计数器、虚拟机栈、本地方法栈、堆、方法区和直接内存。
- [类文件结构详解](./class-file-structure.md)：理解魔数、版本号、常量池、访问标志、字段表、方法表和属性表。

### 类加载

- [类加载过程详解](./class-loading-process.md)：梳理加载、验证、准备、解析、初始化、使用和卸载。
- [类加载器详解（重点）](./classloader.md)：理解启动类加载器、扩展类加载器、应用类加载器和双亲委派模型。

### 垃圾回收与调优

- [JVM垃圾回收详解（重点）](./jvm-garbage-collection.md)：理解对象存活判断、引用类型、垃圾收集算法、分代收集和主流垃圾收集器。
- [最重要的JVM参数总结](./jvm-parameters-intro.md)：整理堆大小、GC 日志、OOM 转储、垃圾收集器和诊断相关参数。
- [JDK监控和故障处理工具总结](./jdk-monitoring-and-troubleshooting-tools.md)：介绍 jps、jstat、jmap、jstack、jcmd、JConsole、VisualVM、JMC 等工具。
- [JVM线上问题排查和性能调优案例](./jvm-in-action.md)：结合线上问题理解 CPU、内存、GC、线程和 Full GC 排查路径。

## 高频问题

- JVM 运行时内存区域如何划分？哪些区域线程私有？
- 堆和方法区分别存放什么？直接内存会不会 OOM？
- 对象是如何创建的？对象访问定位有哪几种方式？
- 类加载过程有哪些阶段？初始化阶段什么时候触发？
- 什么是双亲委派模型？为什么需要它？
- 如何判断对象是否可以被回收？强软弱虚引用有什么区别？
- Minor GC、Major GC、Full GC 有什么区别？
- G1、ZGC、Shenandoah 分别适合什么场景？
- 常用 JVM 参数有哪些？线上如何保留 GC 日志和 OOM dump？
- CPU 飙高、频繁 Full GC、内存泄漏应该如何排查？

## 相关专题

- [Java 知识体系](../)
- [Java 基础专题](../basis/)
- [Java 并发编程专题](../concurrent/)
- [Java IO 专题](../io/)
- [操作系统](../../cs-basics/operating-system/)

<!-- @include: @article-footer.snippet.md -->
