---
title: Java 并发编程专题：线程、锁、JMM、CAS、AQS、线程池与虚拟线程
description: Java 并发编程面试与学习路线，涵盖线程、锁、synchronized、ReentrantLock、JMM、CAS、AQS、ThreadLocal、线程池、CompletableFuture 和虚拟线程。
category: Java
tag:
  - Java
  - Java并发
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java并发,Java锁,synchronized,ReentrantLock,JMM,CAS,AQS,ThreadLocal,线程池,CompletableFuture,并发容器,Atomic,虚拟线程
---

Java 并发编程是后端开发和面试中最重要、也最容易混淆的模块之一。学习并发不能只背 API，要把线程生命周期、锁机制、内存模型、原子操作、线程池和并发工具类放在同一条主线上理解。

## 适合谁看

- 想系统学习 Java 并发编程的后端开发者。
- 准备线程、锁、JMM、CAS、AQS、线程池等面试题的同学。
- 已经在项目中使用多线程，但对死锁、线程池参数、ThreadLocal 泄漏等问题不够熟的读者。
- 想理解并发容器、CompletableFuture、虚拟线程等工程实践能力的工程师。

## 学习重点

- 线程创建、生命周期、上下文切换、线程安全和常见并发问题。
- `synchronized`、`volatile`、`ReentrantLock`、互斥锁、读写锁、乐观锁、悲观锁的适用边界。
- JMM、happens-before、指令重排、可见性、原子性和有序性。
- CAS、Atomic 原子类、AQS、并发容器和阻塞队列的底层思路。
- 线程池核心参数、拒绝策略、任务队列、参数配置和生产实践。
- CompletableFuture、ThreadLocal、虚拟线程在真实项目中的使用方式和风险。

## 建议阅读顺序

1. [Java并发常见面试题总结（上）](./java-concurrent-questions-01.md)：先建立线程、锁和线程安全的基础问题清单。
2. [Java并发常见面试题总结（中）](./java-concurrent-questions-02.md) 和 [Java并发常见面试题总结（下）](./java-concurrent-questions-03.md)：继续补齐 JMM、CAS、AQS、线程池和并发工具。
3. [Java 锁详解](./java-lock.md)、[乐观锁和悲观锁详解](./optimistic-lock-and-pessimistic-lock.md)、[CAS 详解](./cas.md)、[JMM（Java 内存模型）详解](./jmm.md)：先建立锁体系，再理解并发控制的底层语义。
4. [AQS 详解](./aqs.md)、[从ReentrantLock的实现看AQS的原理及应用](./reentrantlock.md)：深入理解 Java 锁和同步器。
5. [Java 线程池详解](./java-thread-pool-summary.md) 和 [Java 线程池最佳实践](./java-thread-pool-best-practices.md)：掌握生产中最常用的并发基础设施。

## 核心文章

### 并发面试题

- [Java并发常见面试题总结（上）](./java-concurrent-questions-01.md)：覆盖线程基础、线程安全、锁和常见并发问题。
- [Java并发常见面试题总结（中）](./java-concurrent-questions-02.md)：继续梳理 JMM、volatile、CAS、AQS 等核心知识。
- [Java并发常见面试题总结（下）](./java-concurrent-questions-03.md)：补齐线程池、并发工具类、CompletableFuture 和虚拟线程等内容。

### 锁、内存模型与同步器

- [Java 锁详解](./java-lock.md)：从互斥锁、读写锁、自旋锁到 `synchronized`、`ReentrantLock`、AQS，建立 Java 锁体系。
- [乐观锁和悲观锁详解](./optimistic-lock-and-pessimistic-lock.md)：理解不同并发冲突处理策略。
- [CAS 详解](./cas.md)：理解比较并交换、ABA 问题和自旋开销。
- [JMM（Java 内存模型）详解](./jmm.md)：掌握可见性、原子性、有序性和 happens-before。
- [AQS 详解](./aqs.md)：理解同步队列、独占/共享模式和常见同步器底层。
- [从ReentrantLock的实现看AQS的原理及应用](./reentrantlock.md)：通过 ReentrantLock 深入理解 AQS。

### 并发工具与工程实践

- [Java 线程池详解](./java-thread-pool-summary.md)：理解核心参数、任务队列、拒绝策略和执行流程。
- [Java 线程池最佳实践](./java-thread-pool-best-practices.md)：总结生产环境中线程池隔离、参数配置和监控建议。
- [Java 常见并发容器总结](./java-concurrent-collections.md)：梳理 ConcurrentHashMap、CopyOnWriteArrayList、BlockingQueue 等容器。
- [Atomic 原子类总结](./atomic-classes.md)：理解原子更新基本类型、数组、引用和字段。
- [ThreadLocal 详解](./threadlocal.md)：理解线程本地变量、ThreadLocalMap 和内存泄漏风险。
- [CompletableFuture 详解](./completablefuture-intro.md)：掌握异步编排、异常处理和线程池使用。
- [虚拟线程常见问题总结](./virtual-thread.md)：理解虚拟线程的定位、适用场景和使用限制。

## 高频问题

- 线程和进程有什么区别？线程有哪些状态？
- 什么是线程安全？如何定位死锁？
- 互斥锁、读写锁、自旋锁有什么区别？
- `synchronized` 和 `ReentrantLock` 有什么区别？
- `volatile` 能保证原子性吗？它解决什么问题？
- JMM 是什么？happens-before 规则有什么用？
- CAS 有什么优缺点？ABA 问题如何解决？
- AQS 的核心思想是什么？哪些工具类基于 AQS？
- 线程池核心参数如何配置？拒绝策略如何选择？
- 为什么不建议直接使用 `Executors` 创建线程池？
- `ThreadLocal` 为什么可能内存泄漏？
- CompletableFuture 默认线程池有什么风险？
- 虚拟线程适合 CPU 密集型任务吗？

## 相关专题

- [Java 知识体系](../)
- [Java 集合专题](../collection/)
- [JVM 专题](../jvm/)
- [Java IO 专题](../io/)
- [操作系统](../../cs-basics/operating-system/)

<!-- @include: @article-footer.snippet.md -->
