---
title: 操作系统专题：进程线程、内存管理、文件系统、Linux 与 Shell
description: 操作系统面试与学习路线，涵盖进程线程、死锁、内存管理、文件系统、Linux 基础、Shell 编程和常见操作系统面试题。
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
      content: 操作系统,操作系统面试题,进程,线程,死锁,内存管理,虚拟内存,文件系统,Linux,Shell,后端面试
---

这份 **操作系统专题** 面向后端学习和面试复习，整理操作系统基础、进程线程、内存管理、文件系统、Linux 和 Shell 相关内容。

## 适合谁看

- 正在系统学习操作系统基础的后端开发者。
- 准备校招、社招、中大厂操作系统面试题的同学。
- 对进程线程、死锁、内存管理、Linux 命令只会零散背诵的读者。
- 想为 Java 并发、JVM、数据库、网络编程打底的工程师。

## 学习重点

- 操作系统负责管理 CPU、内存、文件、IO 和进程，是理解上层软件运行机制的基础。
- 进程和线程是并发编程、服务端性能和问题排查的基础概念。
- 死锁、上下文切换、调度、同步互斥是面试高频点。
- 内存管理、虚拟内存、分页、页面置换能帮助理解 JVM、数据库和缓存。
- Linux 和 Shell 是后端开发、部署、排障、自动化脚本的常用能力。

## 建议阅读顺序

1. [操作系统常见面试题总结（上）](./operating-system-basic-questions-01.md)：先建立操作系统基础、进程线程、死锁、内存管理的高频问题清单。
2. [操作系统常见面试题总结（下）](./operating-system-basic-questions-02.md)：继续补齐文件系统、IO、Linux 等问题。
3. [Linux 基础知识总结](./linux-intro.md)：掌握目录结构、文件权限、常用命令和基础排障能力。
4. [Shell 编程基础知识总结](./shell-intro.md)：学习变量、条件、循环、函数和常用脚本写法。

## 核心文章

- [操作系统常见面试题总结（上）](./operating-system-basic-questions-01.md)：覆盖操作系统基础、进程线程、死锁、内存管理等高频问题。
- [操作系统常见面试题总结（下）](./operating-system-basic-questions-02.md)：继续整理文件系统、IO、多路复用、Linux 等知识点。
- [Linux 基础知识总结](./linux-intro.md)：讲解 Linux 目录树、文件权限、常用命令、用户和进程管理。
- [Shell 编程基础知识总结](./shell-intro.md)：讲解 Shell 变量、条件判断、循环、函数、文本处理和脚本实践。

## 高频问题

- 进程和线程有什么区别？线程之间共享哪些资源？
- 进程间通信有哪些方式？各自适合什么场景？
- 什么是上下文切换？频繁上下文切换有什么影响？
- 死锁产生的必要条件是什么？如何预防和避免死锁？
- 虚拟内存是什么？分页和分段有什么区别？
- 页面置换算法有哪些？缺页中断是怎么回事？
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
