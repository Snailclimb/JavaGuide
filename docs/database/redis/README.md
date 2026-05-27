---
title: Redis 专题：缓存、数据结构、持久化、集群、阻塞与工程实践
description: Redis 面试与缓存学习路线，涵盖缓存穿透、缓存击穿、缓存雪崩、读写策略、Redis 数据结构、持久化、阻塞问题、延时任务和集群。
category: 数据库
tag:
  - Redis
  - 缓存
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Redis,Redis面试题,缓存,缓存穿透,缓存击穿,缓存雪崩,Redis数据结构,Redis持久化,Redis集群,Redis阻塞,Redis跳表,Redis延时任务,Redis消息队列,后端面试
---

Redis 是后端开发最常用的缓存和高性能内存数据存储之一。学习 Redis 时，不能只停留在命令和数据类型上，还要理解缓存读写策略、底层数据结构、持久化、阻塞原因、内存管理、复制与集群等工程问题。

## 适合谁看

- 想系统学习 Redis 原理、缓存设计和工程实践的后端开发者。
- 准备 Redis 数据结构、持久化、集群、高可用、缓存一致性相关面试题的同学。
- 已经在项目中使用 Redis，但对缓存异常、阻塞、内存碎片和集群机制不够熟的读者。
- 需要基于 Redis 实现延时任务、消息队列、排行榜、购物车等能力的工程师。

## 学习重点

- Redis 常用数据结构分别适合哪些业务场景，底层编码如何影响性能？
- 缓存穿透、击穿、雪崩和缓存一致性问题应该如何设计方案？
- Redis 持久化中 RDB、AOF、AOF 重写和混合持久化有什么区别？
- Redis 为什么可能阻塞，如何定位慢命令、大 Key、热 Key 和持久化影响？
- 主从复制、哨兵和 Cluster 分别解决什么问题，故障转移有哪些关键流程？
- 基于 Redis 做延时任务、消息队列时有哪些能力边界和可靠性风险？

## 建议阅读顺序

1. [缓存基础常见面试题总结](./cache-basics.md)：先理解缓存使用场景、缓存异常和一致性问题。
2. [Redis 常见面试题总结（上）](./redis-questions-01.md)、[Redis 常见面试题总结（下）](./redis-questions-02.md)：建立 Redis 高频问题清单。
3. [Redis 5 种基本数据类型详解](./redis-data-structures-01.md)、[Redis 3 种特殊数据类型详解](./redis-data-structures-02.md)：系统掌握数据结构和应用场景。
4. [3 种常用的缓存读写策略详解](./3-commonly-used-cache-read-and-write-strategies.md)、[Redis 持久化机制详解](./redis-persistence.md)：补齐缓存一致性和数据恢复能力。
5. [Redis 常见阻塞原因总结](./redis-common-blocking-problems-summary.md)、[Redis 集群详解](./redis-cluster.md)：把 Redis 放到生产环境里理解。

## 核心文章

### 缓存基础与读写策略

- [缓存基础常见面试题总结](./cache-basics.md)：讲解缓存应用场景、缓存穿透、缓存击穿、缓存雪崩、缓存一致性和缓存淘汰。
- [3 种常用的缓存读写策略详解](./3-commonly-used-cache-read-and-write-strategies.md)：对比 Cache Aside、Read/Write Through、Write Behind 等常见策略。
- [Redis 常见面试题总结（上）](./redis-questions-01.md) 和 [Redis 常见面试题总结（下）](./redis-questions-02.md)：串联 Redis 基础、线程模型、数据结构、持久化、集群和生产问题。

### 数据结构与典型应用

- [Redis 5 种基本数据类型详解](./redis-data-structures-01.md)：理解 String、List、Hash、Set、Sorted Set 的底层结构和业务场景。
- [Redis 3 种特殊数据类型详解](./redis-data-structures-02.md)：理解 Bitmap、HyperLogLog、Geospatial 的用法和适用场景。
- [Redis 为什么用跳表实现有序集合](./redis-skiplist.md)：理解跳表结构、查询复杂度和 Sorted Set 的实现选择。
- [如何基于 Redis 实现延时任务？](./redis-delayed-task.md)：对比过期事件、Sorted Set、Stream 等实现方式。
- [如何基于 Redis 实现消息队列？](./redis-stream-mq.md)：理解 List、Pub/Sub、Stream 做消息队列的差异。

### 持久化、内存与集群

- [Redis 持久化机制详解](./redis-persistence.md)：系统讲解 RDB、AOF、AOF 重写和混合持久化。
- [Redis 内存碎片详解](./redis-memory-fragmentation.md)：理解内存碎片产生原因、指标观察和清理策略。
- [Redis 常见阻塞原因总结](./redis-common-blocking-problems-summary.md)：整理慢命令、大 Key、持久化、主从同步、CPU 和网络等阻塞来源。
- [Redis 集群详解](./redis-cluster.md)：理解主从复制、哨兵、Cluster、槽位迁移和故障转移。

## 高频问题

- Redis 为什么快？单线程为什么还能支撑高并发？
- Redis 常见数据类型分别适合哪些业务场景？
- Sorted Set 为什么使用跳表？
- 缓存穿透、击穿、雪崩有什么区别，如何处理？
- 缓存和数据库如何保证一致性？
- RDB 和 AOF 有什么区别？AOF 重写解决什么问题？
- Redis 常见阻塞原因有哪些？如何排查大 Key 和慢命令？
- Redis 主从复制、哨兵和 Cluster 有什么区别？
- Redis 如何实现延时任务？可靠性风险在哪里？
- Redis Stream 和传统消息队列相比有哪些边界？

## 相关专题

- [数据库知识体系](../)
- [高性能系统知识体系](../../high-performance/)
- [高可用系统知识体系](../../high-availability/)
- [消息队列专题](../../high-performance/message-queue/)

<!-- @include: @article-footer.snippet.md -->
