---
title: Java IO 专题：BIO、NIO、AIO、IO 模型与设计模式
description: Java IO 与 NIO 学习路线，涵盖 BIO、NIO、AIO、阻塞/非阻塞、同步/异步、I/O 多路复用、Reactor 模型和 IO 设计模式。
category: Java
tag:
  - Java
  - Java IO
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java IO,Java NIO,BIO,NIO,AIO,IO模型,I/O多路复用,Reactor,Selector,Channel,Buffer,Java IO面试题
---

Java IO 是理解文件读写、网络编程、Netty、RPC 框架和高性能服务端的重要基础。学习 IO 时，建议同时理解 Java API、操作系统 IO 模型和常见设计模式，这样才能把 BIO、NIO、AIO、Selector、Channel、Buffer、Reactor 串起来。

## 适合谁看

- 想系统学习 Java IO/NIO 的后端开发者。
- 准备 BIO、NIO、AIO、IO 多路复用、Reactor 相关面试题的同学。
- 想继续学习 Netty、RPC、消息队列、数据库驱动等网络通信框架的读者。
- 对阻塞/非阻塞、同步/异步、Selector、Channel、Buffer 等概念容易混淆的工程师。

## 学习重点

- Java IO 流体系、字节流、字符流、缓冲流和常见文件操作。
- 装饰器模式、适配器模式等设计模式在 IO 中的应用。
- BIO、NIO、AIO 的模型差异、适用场景和优缺点。
- 同步/异步、阻塞/非阻塞、I/O 多路复用、Reactor 和 Proactor。
- Buffer、Channel、Selector 的协作关系，以及它们在网络编程中的作用。

## 建议阅读顺序

1. [Java IO 基础知识总结](./io-basis.md)：先掌握 IO 流体系、常用类和文件读写基础。
2. [Java IO 设计模式总结](./io-design-patterns.md)：理解装饰器模式、适配器模式等设计模式如何落到 IO API 中。
3. [Java IO 模型详解](./io-model.md)：厘清 BIO、NIO、AIO、同步/异步、阻塞/非阻塞和多路复用。
4. [Java NIO 核心知识总结](./nio-basis.md)：深入学习 Buffer、Channel、Selector 和 NIO 编程模型。

## 核心文章

- [Java IO 基础知识总结](./io-basis.md)：系统介绍字节流、字符流、缓冲流、随机访问文件和常见 IO 类。
- [Java IO 设计模式总结](./io-design-patterns.md)：讲解装饰器模式、适配器模式等设计模式在 IO 中的应用。
- [Java IO 模型详解](./io-model.md)：区分 BIO、NIO、AIO、同步/异步、阻塞/非阻塞和 I/O 多路复用。
- [Java NIO 核心知识总结](./nio-basis.md)：理解 Buffer、Channel、Selector、SelectionKey 和 NIO 服务端编程。

## 高频问题

- 字节流和字符流有什么区别？什么时候使用缓冲流？
- Java IO 中为什么大量使用装饰器模式？
- BIO、NIO、AIO 有什么区别？
- 同步和异步、阻塞和非阻塞分别是什么意思？
- I/O 多路复用解决了什么问题？
- `select`、`poll`、`epoll` 有什么区别？
- Reactor 模型是什么？和 Proactor 有什么区别？
- NIO 中 Buffer、Channel、Selector 分别承担什么职责？
- 为什么 Netty 基于 NIO 构建，而不是直接使用传统 BIO？

## 相关专题

- [Java 知识体系](../)
- [Java 并发编程专题](../concurrent/)
- [JVM 专题](../jvm/)
- [计算机网络](../../cs-basics/network/)
- [Netty](../../system-design/framework/netty.md)

<!-- @include: @article-footer.snippet.md -->
