---
title: ZooKeeper 专题：核心概念、ZNode、Watcher、ZAB、集群部署、Curator 与分布式锁
description: ZooKeeper 面试与分布式协调学习路线，涵盖 ZNode、节点类型、Watcher、ACL、ZAB 协议、Leader 选举、集群部署、Curator 和分布式锁。
category: 分布式
tag:
  - ZooKeeper
  - 分布式协调
  - 分布式锁
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: ZooKeeper,ZooKeeper入门,ZooKeeper进阶,ZNode,Watcher,ZAB协议,Leader选举,Curator,分布式协调,分布式锁,注册中心,后端面试
---

ZooKeeper 是经典的分布式协调组件，常用于注册中心、配置管理、分布式锁、Leader 选举和集群元数据管理。学习 ZooKeeper 时，可以先掌握数据模型和 Watcher，再理解 ZAB 协议、Leader 选举和工程实践。

## 适合谁看

- 想系统学习 ZooKeeper 的后端开发者。
- 准备 ZooKeeper、注册中心、分布式锁、分布式协调相关面试题的同学。
- 用过 ZooKeeper 或 Curator，但对 ZNode、Watcher、ZAB、Leader 选举不够熟的读者。
- 需要对比 ZooKeeper、Eureka、Nacos 等注册中心和协调组件的工程师。

## 学习重点

- ZooKeeper 的数据模型为什么是树形 ZNode？
- 临时节点、有序节点、Watcher 机制分别适合解决哪些问题？
- ZooKeeper 如何通过 ZAB 协议处理消息广播、主从同步和崩溃恢复？
- 为什么 ZooKeeper 集群通常建议部署奇数个节点？
- Curator 如何简化原生 ZooKeeper 客户端开发和分布式锁实现？

## 建议阅读顺序

1. [ZooKeeper 入门指南](./zookeeper-intro.md)：先理解 ZNode、Watcher、ACL 和典型应用场景。
2. [ZooKeeper 进阶详解](./zookeeper-plus.md)：再补齐 ZAB、Leader 选举、集群部署和会话机制。
3. [ZooKeeper 实战教程](./zookeeper-in-action.md)：最后通过 Docker、zkCli、四字命令和 Curator 做实践。

## 核心文章

- [ZooKeeper 入门指南](./zookeeper-intro.md)：讲解 ZooKeeper 核心概念、ZNode 数据模型、节点类型、Watcher 监听机制、ACL 权限控制和典型应用场景。
- [ZooKeeper 进阶详解](./zookeeper-plus.md)：深入讲解 ZAB 协议、Leader 选举、集群部署策略、奇数节点原则、会话管理以及与 Eureka、Nacos 等注册中心的对比。
- [ZooKeeper 实战教程](./zookeeper-in-action.md)：覆盖 Docker 安装部署、zkCli 常用命令、四字命令、Curator Java 客户端 CRUD 操作和分布式锁示例。

## 高频问题

- ZooKeeper 适合解决哪些分布式协调问题？
- ZNode 有哪些类型？临时顺序节点为什么常用于分布式锁？
- Watcher 为什么是一次性触发？使用时有什么注意事项？
- ZAB 协议和 Raft、Paxos 有什么关系？
- ZooKeeper 集群为什么通常部署奇数个节点？
- ZooKeeper 和 Eureka、Nacos 作为注册中心有什么区别？
- Curator 相比原生 ZooKeeper 客户端解决了哪些开发痛点？

## 相关专题

- [分布式系统知识体系](../../)
- [分布式理论、算法与协议专题](../../protocol/)
- [ZAB 协议详解](../../protocol/zab.md)
- [分布式锁实现方案详解](../../distributed-lock-implementations.md)
- [分布式配置中心详解](../../distributed-configuration-center.md)

<!-- @include: @article-footer.snippet.md -->
