---
title: 操作系统专题：进程线程、IPC、虚拟内存、I/O 多路复用、Linux 与 Shell
description: 操作系统面试与学习路线，涵盖进程线程、进程间通信、死锁、虚拟内存、零拷贝、I/O 多路复用、文件系统、Linux 基础、Shell 编程和常见操作系统面试题。
category: 计算机基础
tag:
  - 操作系统
  - Linux
  - Shell
sidebar: false
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: 操作系统,操作系统面试题,进程,线程,进程间通信,IPC,死锁,内存管理,虚拟内存,零拷贝,I/O多路复用,select,poll,epoll,文件系统,Linux,Shell,后端面试
---

这份 **操作系统专题** 面向后端学习和面试复习，整理操作系统基础、进程线程、进程间通信、内存管理、虚拟内存、零拷贝、I/O 多路复用、文件系统、Linux 和 Shell 相关内容。

## 适合谁看

- 正在系统学习操作系统基础的后端开发者。
- 准备校招、社招、中大厂操作系统面试题的同学。
- 对进程线程、死锁、内存管理、Linux 命令只会零散背诵的读者。
- 想为 Java 并发、JVM、数据库、网络编程打底的工程师。

## 学习重点

- 操作系统负责管理 CPU、内存、文件、I/O 和进程，是理解上层软件运行机制的基础。
- 进程、线程和进程间通信是并发编程、服务端性能和问题排查的基础概念。
- 死锁、上下文切换、调度、同步互斥是面试高频点。
- 内存管理、虚拟内存、分页、页面置换能帮助理解 JVM、数据库和缓存。
- 零拷贝、I/O 多路复用能帮助理解 Kafka、RocketMQ、Redis、Nginx、Netty 等高性能组件。
- Linux 和 Shell 是后端开发、部署、排障、自动化脚本的常用能力。

## 建议阅读顺序

1. [操作系统常见面试题总结（上）](./operating-system-basic-questions-01.md)：先建立操作系统基础、进程线程、死锁、内存管理的高频问题清单。
2. [操作系统常见面试题总结（下）](./operating-system-basic-questions-02.md)：继续补齐文件系统、I/O、Linux 等问题。
3. [进程与线程详解：区别、状态、通信、上下文切换与虚拟线程](./process-and-thread.md)：系统理解进程、线程、PCB/TCB、fork/exec/wait、线程模型和上下文切换。
4. [进程间通信（IPC）详解：管道、消息队列、共享内存、Socket 与 Binder](./ipc.md)：对比管道、消息队列、共享内存、信号量、Socket、Binder 等 IPC 方案。
5. [死锁详解：四个必要条件、Java 死锁排查与数据库死锁处理](./dead-lock.md)：讲清死锁等待环、四个必要条件、Java 线程死锁排查和数据库事务重试。
6. [虚拟内存详解：地址转换、TLB、缺页中断与页面置换](./virtual-memory.md)：把分页、页表、TLB、缺页中断和页面置换串起来。
7. [I/O 多路复用详解：select、poll、epoll 原理与区别](./io-multiplexing.md)：理解一个线程处理海量连接背后的内核机制。
8. [零拷贝详解：mmap、sendfile 与 splice](./zero-copy.md)：搞清传统 I/O、mmap、sendfile、splice 的拷贝路径和适用场景。
9. [Linux 基础知识总结](./linux-intro.md)：掌握目录结构、文件权限、常用命令和基础排障能力。
10. [Shell 编程基础知识总结](./shell-intro.md)：学习变量、条件、循环、函数和常用脚本写法。

## 核心文章

- [操作系统常见面试题总结（上）](./operating-system-basic-questions-01.md)：覆盖操作系统基础、进程线程、死锁、内存管理等高频问题。
- [操作系统常见面试题总结（下）](./operating-system-basic-questions-02.md)：继续整理文件系统、I/O、多路复用、Linux 等知识点。
- [进程与线程详解：区别、状态、通信、上下文切换与虚拟线程](./process-and-thread.md)：讲清进程和线程的资源边界、状态转换、Linux 创建机制和 Java 虚拟线程。
- [进程间通信（IPC）详解：管道、消息队列、共享内存、Socket 与 Binder](./ipc.md)：讲清常见 IPC 方式的原理、优缺点和选型思路。
- [死锁详解：四个必要条件、Java 死锁排查与数据库死锁处理](./dead-lock.md)：讲清死锁形成条件、资源分配图、Java 排查工具、数据库死锁检测和应用层重试策略。
- [虚拟内存详解：地址转换、TLB、缺页中断与页面置换](./virtual-memory.md)：讲清虚拟地址、物理地址、分页、多级页表、TLB、缺页中断和页面置换算法。
- [I/O 多路复用详解：select、poll、epoll 原理与区别](./io-multiplexing.md)：讲清网络 I/O 的两个阶段、五种 I/O 模型，以及 select、poll、epoll 的区别。
- [零拷贝详解：mmap、sendfile 与 splice](./zero-copy.md)：讲清零拷贝到底省掉了什么，以及 Java NIO、Kafka、RocketMQ 中的典型应用。
- [Linux 基础知识总结](./linux-intro.md)：讲解 Linux 目录树、文件权限、常用命令、用户和进程管理。
- [Shell 编程基础知识总结](./shell-intro.md)：讲解 Shell 变量、条件判断、循环、函数、文本处理和脚本实践。

## 高频问题

- 进程和线程有什么区别？线程之间共享哪些资源？
- 进程间通信有哪些方式？各自适合什么场景？
- 什么是上下文切换？频繁上下文切换有什么影响？
- 死锁产生的必要条件是什么？Java 和数据库里如何排查死锁？
- 虚拟内存是什么？分页和分段有什么区别？
- TLB、缺页中断和页面置换分别解决什么问题？
- 页面置换算法有哪些？缺页中断是怎么回事？
- 零拷贝为什么快？mmap、sendfile、splice 有什么区别？
- 文件系统 inode、硬链接、软链接分别是什么？
- select、poll、epoll 有什么区别？
- Linux 文件权限如何理解？常用排障命令有哪些？
- Shell 脚本适合解决哪些自动化问题？

## 相关专题

- [计算机基础知识体系](../)
- [计算机网络专题](../network/)
- [数据结构专题](../data-structure/)
- [Java 并发编程](../../java/concurrent/java-concurrent-questions-01.md)
- [JVM 内存区域详解](../../java/jvm/memory-area.md)

<!-- @include: @article-footer.snippet.md -->
