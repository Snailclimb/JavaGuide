---
icon: "mdi:head-lightbulb-outline"
title: Java 面试指南（JavaGuide 后端通用面试题总结）
description: JavaGuide Java 面试指南，系统整理 Java 八股文和后端面试题，覆盖 Java 基础、集合、并发、JVM、Spring、MySQL、Redis、系统设计与分布式，适用于校招和社招复习。
sitemap:
  changefreq: weekly
  priority: 1
head:
  - - meta
    - name: keywords
      content: Java面试,Java面试指南,Java八股文,Java面试题,Java基础面试,JVM面试,并发面试,线程池面试,Spring面试,MySQL面试,Redis面试,系统设计面试,分布式面试,后端面试
---

<!-- @include: @small-advertisement.snippet.md -->

<!-- markdownlint-disable MD024 -->

JavaGuide 是一份系统化的 **Java 面试指南** 和**后端通用面试复习资料**，内容覆盖 Java 基础、集合、并发编程、JVM、Spring/Spring Boot、MySQL、Redis、分布式、高并发、高可用和系统设计等核心知识点。

如果你正在准备校招、社招或跳槽面试，可以从 [Java 后端面试通关计划](./interview-preparation/backend-interview-plan.md) 开始，再按下面的模块逐步复习高频 Java 八股文和后端面试题。

本站所有内容都已免费开源，欢迎一起[维护完善](http://localhost:8080/javaguide/contribution-guideline.html)，有帮助的话，欢迎 Star！

- **项目地址**：<https://github.com/Snailclimb/JavaGuide>
- **在线阅读**：<https://javaguide.cn/>

## 面试准备

- [⭐Java 后端面试通关计划（涵盖后端通用体系）](./interview-preparation/backend-interview-plan.md) (一定要看 :+1:)
- [如何高效准备 Java 面试？](./interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.md)
- [Java 后端面试重点总结](./interview-preparation/key-points-of-interview.md)
- [Java 学习路线（最新版，4w+ 字）](./interview-preparation/java-roadmap.md)
- [程序员简历编写指南](./interview-preparation/resume-guide.md)
- [项目经验指南](./interview-preparation/project-experience-guide.md)
- [面试太紧张怎么办？](./interview-preparation/how-to-handle-interview-nerves.md)
- [校招没有实习经历怎么办？实习经历怎么写？](./interview-preparation/internship-experience.md)

## Java

### 基础

**知识点/面试题总结** : (必看:+1: )：

- [Java 基础常见知识点&面试题总结(上)](./java/basis/java-basic-questions-01.md)
- [Java 基础常见知识点&面试题总结(中)](./java/basis/java-basic-questions-02.md)
- [Java 基础常见知识点&面试题总结(下)](./java/basis/java-basic-questions-03.md)

**重要知识点详解**：

- [为什么 Java 中只有值传递？](./java/basis/why-there-only-value-passing-in-java.md)
- [Java 序列化详解](./java/basis/serialization.md)
- [泛型&通配符详解](./java/basis/generics-and-wildcards.md)
- [Java 反射机制详解](./java/basis/reflection.md)
- [Java 代理模式详解](./java/basis/proxy.md)
- [BigDecimal 详解](./java/basis/bigdecimal.md)
- [Java 魔法类 Unsafe 详解](./java/basis/unsafe.md)
- [Java SPI 机制详解](./java/basis/spi.md)
- [Java 语法糖详解](./java/basis/syntactic-sugar.md)

### 集合

**知识点/面试题总结**：

- [Java 集合常见知识点&面试题总结(上)](./java/collection/java-collection-questions-01.md) (必看 :+1:)
- [Java 集合常见知识点&面试题总结(下)](./java/collection/java-collection-questions-02.md) (必看 :+1:)
- [Java 集合使用注意事项总结](./java/collection/java-collection-precautions-for-use.md)

**源码分析**：

- [ArrayList 核心源码+扩容机制分析](./java/collection/arraylist-source-code.md)
- [LinkedList 核心源码分析](./java/collection/linkedlist-source-code.md)
- [HashMap 核心源码+底层数据结构分析](./java/collection/hashmap-source-code.md)
- [ConcurrentHashMap 核心源码+底层数据结构分析](./java/collection/concurrent-hash-map-source-code.md)
- [LinkedHashMap 核心源码分析](./java/collection/linkedhashmap-source-code.md)
- [CopyOnWriteArrayList 核心源码分析](./java/collection/copyonwritearraylist-source-code.md)
- [ArrayBlockingQueue 核心源码分析](./java/collection/arrayblockingqueue-source-code.md)
- [PriorityQueue 核心源码分析](./java/collection/priorityqueue-source-code.md)
- [DelayQueue 核心源码分析](./java/collection/priorityqueue-source-code.md)

### IO

- [IO 基础知识总结](./java/io/io-basis.md)
- [IO 设计模式总结](./java/io/io-design-patterns.md)
- [IO 模型详解](./java/io/io-model.md)
- [NIO 核心知识总结](./java/io/nio-basis.md)

### 并发

**知识点/面试题总结** : (必看 :+1:)

- [Java 并发常见知识点&面试题总结（上）](./java/concurrent/java-concurrent-questions-01.md)
- [Java 并发常见知识点&面试题总结（中）](./java/concurrent/java-concurrent-questions-02.md)
- [Java 并发常见知识点&面试题总结（下）](./java/concurrent/java-concurrent-questions-03.md)

**重要知识点详解**：

- [乐观锁和悲观锁详解](./java/concurrent/optimistic-lock-and-pessimistic-lock.md)
- [CAS 详解](./java/concurrent/cas.md)
- [JMM（Java 内存模型）详解](./java/concurrent/jmm.md)
- **线程池**：[Java 线程池详解](./java/concurrent/java-thread-pool-summary.md)、[Java 线程池最佳实践](./java/concurrent/java-thread-pool-best-practices.md)
- [ThreadLocal 详解](./java/concurrent/threadlocal.md)
- [Java 并发容器总结](./java/concurrent/java-concurrent-collections.md)
- [Atomic 原子类总结](./java/concurrent/atomic-classes.md)
- [AQS 详解](./java/concurrent/aqs.md)
- [CompletableFuture 详解](./java/concurrent/completablefuture-intro.md)

### JVM (必看 :+1:)

JVM 这部分内容主要参考 [JVM 虚拟机规范-Java8](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) 和周志明老师的[《深入理解 Java 虚拟机（第 3 版）》](https://book.douban.com/subject/34907497/) （强烈建议阅读多遍！）。

- **[Java 内存区域](./java/jvm/memory-area.md)**
- **[JVM 垃圾回收](./java/jvm/jvm-garbage-collection.md)**
- [类文件结构](./java/jvm/class-file-structure.md)
- **[类加载过程](./java/jvm/class-loading-process.md)**
- [类加载器](./java/jvm/classloader.md)
- [【待完成】最重要的 JVM 参数总结（翻译完善了一半）](./java/jvm/jvm-parameters-intro.md)
- [【加餐】大白话带你认识 JVM](./java/jvm/jvm-intro.md)
- [JDK 监控和故障处理工具](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### 新特性

- **Java 8**：[Java 8 新特性总结（翻译）](./java/new-features/java8-tutorial-translate.md)、[Java8 常用新特性总结](./java/new-features/java8-common-new-features.md)
- [Java 9 新特性概览](./java/new-features/java9.md)
- [Java 10 新特性概览](./java/new-features/java10.md)
- [Java 11 新特性概览](./java/new-features/java11.md)
- [Java 12 & 13 新特性概览](./java/new-features/java12-13.md)
- [Java 14 & 15 新特性概览](./java/new-features/java14-15.md)
- [Java 16 新特性概览](./java/new-features/java16.md)
- [Java 17 新特性概览](./java/new-features/java17.md)
- [Java 18 新特性概览](./java/new-features/java18.md)
- [Java 19 新特性概览](./java/new-features/java19.md)
- [Java 20 新特性概览](./java/new-features/java20.md)
- [Java 21 新特性概览](./java/new-features/java21.md)
- [Java 22 & 23 新特性概览](./java/new-features/java22-23.md)
- [Java 24 新特性概览](./java/new-features/java24.md)
- [Java 25 新特性概览](./java/new-features/java25.md)

## 计算机基础

> 计算机基础（计算机网络、操作系统、数据结构与算法）已独立为单独模块，详见 [计算机基础知识总结](./cs-basics/)。

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](./about-the-author/zhishixingqiu-two-years.md)

## 数据库

### 基础

- [数据库基础知识总结](./database/basis.md)
- [NoSQL 基础知识总结](./database/nosql.md)
- [字符集详解](./database/character-set.md)
- SQL :
  - [SQL 语法基础知识总结](./database/sql/sql-syntax-summary.md)
  - [SQL 常见面试题总结](./database/sql/sql-questions-01.md)

### MySQL

**知识点/面试题总结：**

- **[MySQL 常见知识点&面试题总结](./database/mysql/mysql-questions-01.md)** (必看 :+1:)
- [MySQL 高性能优化规范建议总结](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**重要知识点：**

- [MySQL 索引详解](./database/mysql/mysql-index.md)
- [MySQL 索引失效场景总结](./database/mysql/mysql-index-invalidation.md)
- [MySQL 事务隔离级别图文详解)](./database/mysql/transaction-isolation-level.md)
- [MySQL 三大日志(binlog、redo log 和 undo log)详解](./database/mysql/mysql-logs.md)
- [InnoDB 存储引擎对 MVCC 的实现](./database/mysql/innodb-implementation-of-mvcc.md)
- [SQL 语句在 MySQL 中的执行过程](./database/mysql/how-sql-executed-in-mysql.md)
- [MySQL 查询缓存详解](./database/mysql/mysql-query-cache.md)
- [MySQL 执行计划分析](./database/mysql/mysql-query-execution-plan.md)
- [MySQL 自增主键一定是连续的吗](./database/mysql/mysql-auto-increment-primary-key-continuous.md)
- [MySQL 时间类型数据存储建议](./database/mysql/some-thoughts-on-database-storage-time.md)
- [MySQL 隐式转换造成索引失效](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**知识点/面试题总结** : (必看:+1: )：

- [Redis 常见知识点&面试题总结(上)](./database/redis/redis-questions-01.md)
- [Redis 常见知识点&面试题总结(下)](./database/redis/redis-questions-02.md)

**重要知识点：**

- [3 种常用的缓存读写策略详解](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Redis 能做消息队列吗？怎么实现？](./database/redis/redis-stream-mq.md)
- [Redis 5 种基本数据结构详解](./database/redis/redis-data-structures-01.md)
- [Redis 3 种特殊数据结构详解](./database/redis/redis-data-structures-02.md)
- [Redis 持久化机制详解](./database/redis/redis-persistence.md)
- [Redis 内存碎片详解](./database/redis/redis-memory-fragmentation.md)
- [Redis 常见阻塞原因总结](./database/redis/redis-common-blocking-problems-summary.md)
- [Redis 集群详解](./database/redis/redis-cluster.md)

### MongoDB

- [MongoDB 常见知识点&面试题总结(上)](./database/mongodb/mongodb-questions-01.md)
- [MongoDB 常见知识点&面试题总结(下)](./database/mongodb/mongodb-questions-02.md)

## 搜索引擎

[Elasticsearch 常见面试题总结(付费)](./database/elasticsearch/elasticsearch-questions-01.md)

![JavaGuide 官方公众号](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## 开发工具

### Maven

- [Maven 核心概念总结](./tools/maven/maven-core-concepts.md)
- [Maven 最佳实践](./tools/maven/maven-best-practices.md)

### Gradle

[Gradle 核心概念总结](./tools/gradle/gradle-core-concepts.md)（可选，目前国内还是使用 Maven 普遍一些）

### Docker

- [Docker 核心概念总结](./tools/docker/docker-intro.md)
- [Docker 实战](./tools/docker/docker-in-action.md)

### Git

- [Git 核心概念总结](./tools/git/git-intro.md)
- [GitHub 实用小技巧总结](./tools/git/github-tips.md)

## 系统设计

- [⭐系统设计常见面试题总结](./system-design/system-design-questions.md)
- [⭐设计模式常见面试题总结](https://interview.javaguide.cn/system-design/design-pattern.html)

### 基础

- [RestFul API 简明教程](./system-design/basis/RESTfulAPI.md)
- [软件工程简明教程](./system-design/basis/software-engineering.md)
- [代码命名指南](./system-design/basis/naming.md)
- [代码重构指南](./system-design/basis/refactoring.md)
- [单元测试指南](./system-design/basis/unit-test.md)

### 常用框架

#### Spring/SpringBoot (必看 :+1:)

**知识点/面试题总结** :

- [Spring 常见知识点&面试题总结](./system-design/framework/spring/spring-knowledge-and-questions-summary.md)
- [SpringBoot 常见知识点&面试题总结](./system-design/framework/spring/springboot-knowledge-and-questions-summary.md)
- [Spring/Spring Boot 常用注解总结](./system-design/framework/spring/spring-common-annotations.md)
- [SpringBoot 入门指南](https://github.com/Snailclimb/springboot-guide)

**重要知识点详解**：

- [IoC & AOP 详解（快速搞懂）](./system-design/framework/spring/ioc-and-aop.md)
- [Spring 事务详解](./system-design/framework/spring/spring-transaction.md)
- [Spring 中的设计模式详解](./system-design/framework/spring/spring-design-patterns-summary.md)
- [SpringBoot 自动装配原理详解](./system-design/framework/spring/spring-boot-auto-assembly-principles.md)

#### MyBatis

[MyBatis 常见面试题总结](./system-design/framework/mybatis/mybatis-interview.md)

### 安全

#### 认证授权

- [认证授权基础概念详解](./system-design/security/basis-of-authority-certification.md)
- [JWT 基础概念详解](./system-design/security/jwt-intro.md)
- [JWT 优缺点分析以及常见问题解决方案](./system-design/security/advantages-and-disadvantages-of-jwt.md)
- [SSO 单点登录详解](./system-design/security/sso-intro.md)
- [权限系统设计详解](./system-design/security/design-of-authority-system.md)

#### 数据安全

- [常见加密算法总结](./system-design/security/encryption-algorithms.md)
- [敏感词过滤方案总结](./system-design/security/sentive-words-filter.md)
- [数据脱敏方案总结](./system-design/security/data-desensitization.md)
- [为什么前后端都要做数据校验](./system-design/security/data-validation.md)
- [为什么忘记密码时只能重置，不能告诉你原密码？](./system-design/security/why-password-reset-instead-of-retrieval.md)

### 定时任务

[Java 定时任务详解](./system-design/schedule-task.md)

### Web 实时消息推送

[Web 实时消息推送详解](./system-design/web-real-time-message-push.md)

## 分布式

- [⭐分布式高频面试题](https://interview.javaguide.cn/distributed-system/distributed-system.html)

### 理论&算法&协议

- [CAP 理论和 BASE 理论解读](./distributed-system/protocol/cap-and-base-theorem.md)
- [Paxos 算法解读](./distributed-system/protocol/paxos-algorithm.md)
- [Raft 算法解读](./distributed-system/protocol/raft-algorithm.md)
- [ZAB 协议解读](./distributed-system/protocol/zab.md)
- [Gossip 协议详解](./distributed-system/protocol/gossip-protocol.md)
- [一致性哈希算法详解](./distributed-system/protocol/consistent-hashing.md)

### RPC

- [RPC 基础知识总结](./distributed-system/rpc/rpc-intro.md)
- [Dubbo 常见知识点&面试题总结](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> 这两篇文章可能有内容重合部分，推荐都看一遍。

- [ZooKeeper 相关概念总结(入门)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [ZooKeeper 相关概念总结(进阶)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)

### API 网关

- [API 网关基础知识总结](./distributed-system/api-gateway.md)
- [Spring Cloud Gateway 常见知识点&面试题总结](./distributed-system/spring-cloud-gateway-questions.md)

### 分布式 ID

- [分布式 ID 常见知识点&面试题总结](./distributed-system/distributed-id.md)
- [分布式 ID 设计指南](./distributed-system/distributed-id-design.md)

### 分布式锁

- [分布式锁介绍](https://javaguide.cn/distributed-system/distributed-lock.html)
- [分布式锁常见实现方案总结](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)

### 分布式事务

[分布式事务常见知识点&面试题总结](./distributed-system/distributed-transaction.md)

### 分布式配置中心

[分布式配置中心常见知识点&面试题总结](./distributed-system/distributed-configuration-center.md)

## 高性能

### 数据库优化

- [数据库读写分离和分库分表](./high-performance/read-and-write-separation-and-library-subtable.md)
- [数据冷热分离](./high-performance/data-cold-hot-separation.md)
- [常见 SQL 优化手段总结](./high-performance/sql-optimization.md)
- [深度分页介绍及优化建议](./high-performance/deep-pagination-optimization.md)

### 负载均衡

[负载均衡常见知识点&面试题总结](./high-performance/load-balancing.md)

### CDN

[CDN（内容分发网络）常见知识点&面试题总结](./high-performance/cdn.md)

### 消息队列

- [消息队列基础知识总结](./high-performance/message-queue/message-queue.md)
- [Disruptor 常见知识点&面试题总结](./high-performance/message-queue/disruptor-questions.md)
- [RabbitMQ 常见知识点&面试题总结](./high-performance/message-queue/rabbitmq-questions.md)
- [RocketMQ 常见知识点&面试题总结](./high-performance/message-queue/rocketmq-questions.md)
- [Kafka 常见知识点&面试题总结](./high-performance/message-queue/kafka-questions-01.md)

## 高可用

[高可用系统设计指南](./high-availability/high-availability-system-design.md)

### 冗余设计

[冗余设计详解](./high-availability/redundancy.md)

### 限流

[服务限流详解](./high-availability/limit-request.md)

### 降级&熔断

[降级&熔断详解](./high-availability/fallback-and-circuit-breaker.md)

### 超时&重试

[超时&重试详解](./high-availability/timeout-and-retry.md)

### 集群

相同的服务部署多份，避免单点故障。

### 灾备设计和异地多活

**灾备** = 容灾 + 备份。

- **备份**：将系统所产生的所有重要数据多备份几份。
- **容灾**：在异地建立两个完全相同的系统。当某个地方的系统突然挂掉，整个应用系统可以切换到另一个，这样系统就可以正常提供服务了。

**异地多活** 描述的是将服务部署在异地并且服务同时对外提供服务。和传统的灾备设计的最主要区别在于“多活”，即所有站点都是同时在对外提供服务的。异地多活是为了应对突发状况比如火灾、地震等自然或者人为灾害。

## Star 趋势

![Stars](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号“**JavaGuide**”。

![JavaGuide 官方公众号](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
