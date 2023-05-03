---
icon: creative
title: JavaGuide（Java学习&&面试指南）
---

::: tip 友情提示

- **面试专版** ：准备 Java 面试的小伙伴可以考虑面试专版：**[《Java 面试指北 》](./zhuanlan/java-mian-shi-zhi-bei.md)** (质量很高，专为面试打造，配合 JavaGuide 食用)。
- **知识星球** ：专属面试小册/一对一交流/简历修改/专属求职指南，欢迎加入 **[JavaGuide 知识星球](./about-the-author/zhishixingqiu-two-years.md)**（点击链接即可查看星球的详细介绍，一定确定自己真的需要再加入）。
- **转载须知** ：以下所有文章如非文首说明为转载皆为 JavaGuide 原创，转载在文首注明出处，如发现恶意抄袭/搬运，会动用法律武器维护自己的权益。让我们一起维护一个良好的技术创作环境！

:::

<div align="center">

[![logo](https://oss.javaguide.cn/github/javaguide/csdn/1c00413c65d1995993bf2b0daf7b4f03.png)](https://github.com/Snailclimb/JavaGuide)

[![阅读](https://img.shields.io/badge/阅读-read-brightgreen.svg)](https://javaguide.cn/)
![Stars](https://img.shields.io/github/stars/Snailclimb/JavaGuide)
![forks](https://img.shields.io/github/forks/Snailclimb/JavaGuide)
![issues](https://img.shields.io/github/issues/Snailclimb/JavaGuide)

[GitHub](https://github.com/Snailclimb/JavaGuide) | [Gitee](https://gitee.com/SnailClimb/JavaGuide)

</div>

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)

## Java

### 基础

**知识点/面试题总结** : (必看:+1: )：

- [Java 基础常见知识点&面试题总结(上)](./java/basis/java-basic-questions-01.md)
- [Java 基础常见知识点&面试题总结(中)](./java/basis/java-basic-questions-02.md)
- [Java 基础常见知识点&面试题总结(下)](./java/basis/java-basic-questions-03.md)

**重要知识点详解** ：

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

**知识点/面试题总结** ：

- [Java 集合常见知识点&面试题总结(上)](./java/collection/java-collection-questions-01.md) (必看 :+1:)
- [Java 集合常见知识点&面试题总结(下)](./java/collection/java-collection-questions-02.md) (必看 :+1:)
- [Java 容器使用注意事项总结](./java/collection/java-collection-precautions-for-use.md)

**源码分析** ：

- [ArrayList 源码+扩容机制分析](./java/collection/arraylist-source-code.md)
- [HashMap(JDK1.8)源码+底层数据结构分析](./java/collection/hashmap-source-code.md)
- [ConcurrentHashMap 源码+底层数据结构分析](./java/collection/concurrent-hash-map-source-code.md)

### IO

- [IO 基础知识总结](./java/io/io-basis.md)
- [IO 设计模式总结](./java/io/io-design-patterns.md)
- [IO 模型详解](./java/io/io-model.md)

### 并发

**知识点/面试题总结** : (必看 :+1:)

- [Java 并发常见知识点&面试题总结（上）](./java/concurrent/java-concurrent-questions-01.md)
- [Java 并发常见知识点&面试题总结（中）](./java/concurrent/java-concurrent-questions-02.md)
- [Java 并发常见知识点&面试题总结（下）](./java/concurrent/java-concurrent-questions-03.md)

**重要知识点详解** ：

- [JMM（Java 内存模型）详解](./java/concurrent/jmm.md)
- **线程池** ：[Java 线程池详解](./java/concurrent/java-thread-pool-summary.md)、[Java 线程池最佳实践](./java/concurrent/java-thread-pool-best-practices.md)
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

- **Java 8** ：[Java 8 新特性总结（翻译）](./java/new-features/java8-tutorial-translate.md)、[Java8 常用新特性总结](./java/new-features/java8-common-new-features.md)
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

## 计算机基础

### 操作系统

- [操作系统常见问题总结！](./cs-basics/operating-system/operating-system-basic-questions-01.md)
- [后端程序员必备的 Linux 基础知识总结](./cs-basics/operating-system/linux-intro.md)
- [Shell 编程基础知识总结](./cs-basics/operating-system/shell-intro.md)

### 网络

**知识点/面试题总结** ：

- [计算机网络常见知识点&面试题总结(上)](./cs-basics/network/other-network-questions.md)
- [计算机网络常见知识点&面试题总结(下)](./cs-basics/network/other-network-questions2.md)
- [谢希仁老师的《计算机网络》内容总结（补充）](./cs-basics/network/computer-network-xiexiren-summary.md)

**重要知识点详解** ：

- [OSI 和 TCP/IP 网络分层模型详解（基础）](./cs-basics/network/osi-and-tcp-ip-model.md)
- [应用层常见协议总结（应用层）](./cs-basics/network/application-layer-protocol.md)
- [HTTP vs HTTPS（应用层）](./cs-basics/network/http-vs-https.md)
- [HTTP 1.0 vs HTTP 1.1（应用层）](./cs-basics/network/http1.0-vs-http1.1.md)
- [HTTP 常见状态码（应用层）](./cs-basics/network/http-status-codes.md)
- [DNS 域名系统详解（应用层）](./cs-basics/network/dns.md)
- [TCP 三次握手和四次挥手（传输层）](./cs-basics/network/tcp-connection-and-disconnection.md)
- [TCP 传输可靠性保障（传输层）](./cs-basics/network/tcp-reliability-guarantee.md)
- [ARP 协议详解(网络层)](./cs-basics/network/arp.md)
- [NAT 协议详解(网络层)](./cs-basics/network/nat.md)
- [网络攻击常见手段总结（安全）](./cs-basics/network/network-attack-means.md)

### 数据结构

**图解数据结构：**

- [线性数据结构 :数组、链表、栈、队列](./cs-basics/data-structure/linear-data-structure.md)
- [图](./cs-basics/data-structure/graph.md)
- [堆](./cs-basics/data-structure/heap.md)
- [树](./cs-basics/data-structure/tree.md) ：重点关注[红黑树](./cs-basics/data-structure/red-black-tree.md)、B-，B+，B\*树、LSM 树

其他常用数据结构 ：

- [布隆过滤器](./cs-basics/data-structure/bloom-filter.md)

### 算法

算法这部分内容非常重要，如果你不知道如何学习算法的话，可以看下我写的：

- [算法学习书籍+资源推荐](https://www.zhihu.com/question/323359308/answer/1545320858) 。
- [如何刷 Leetcode?](https://www.zhihu.com/question/31092580/answer/1534887374)

**常见算法问题总结** ：

- [几道常见的字符串算法题总结](./cs-basics/algorithms/string-algorithm-problems.md)
- [几道常见的链表算法题总结](./cs-basics/algorithms/linkedlist-algorithm-problems.md)
- [剑指 offer 部分编程题](./cs-basics/algorithms/the-sword-refers-to-offer.md)
- [十大经典排序算法](./cs-basics/algorithms/10-classical-sorting-algorithms.md)

另外，[GeeksforGeeks](https://www.geeksforgeeks.org/fundamentals-of-algorithms/) 这个网站总结了常见的算法 ，比较全面系统。

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

[Maven 核心概念总结](./tools/maven/maven-core-concepts.md)

### Gradle

[Gradle 核心概念总结](./tools/gradle/gradle-core-concepts.md)（可选，目前国内还是使用 Maven 普遍一些）

### Docker

- [Docker 核心概念总结](./tools/docker/docker-intro.md)
- [Docker 实战](./tools/docker/docker-in-action.md)

### Git

- [Git 核心概念总结](./tools/git/git-intro.md)
- [Github 实用小技巧总结](./tools/git/github-tips.md)

## 系统设计

- [系统设计常见面试题总结](./system-design/system-design-questions.md)
- [设计模式常见面试题总结](./system-design/design-pattern.md)

### 基础

- [RestFul API 简明教程](./system-design/basis/RESTfulAPI.md)
- [软件工程简明教程简明教程](./system-design/basis/software-engineering.md)
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

**重要知识点详解** ：

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

#### 数据脱敏

数据脱敏说的就是我们根据特定的规则对敏感信息数据进行变形，比如我们把手机号、身份证号某些位数使用 \* 来代替。

#### 敏感词过滤

[敏感词过滤方案总结](./system-design/security/sentive-words-filter.md)

### 定时任务

[Java 定时任务详解](./system-design/schedule-task.md)

### Web 实时消息推送

[Web 实时消息推送详解](./system-design/web-real-time-message-push.md)

## 分布式

### 理论&算法&协议

- [CAP 理论和 BASE 理论解读](./distributed-system/protocol/cap-and-base-theorem.md)
- [Paxos 算法解读](./distributed-system/protocol/paxos-algorithm.md)
- [Raft 算法解读](./distributed-system/protocol/raft-algorithm.md)
- [Gossip 协议详解](./distributed-system/protocol/gossip-protocl.md)

### API 网关

[API 网关详解](./distributed-system/api-gateway.md)

### 分布式 ID

[分布式 ID 详解](./distributed-system/distributed-id.md)

### 分布式锁

[分布式锁详解](./distributed-system/distributed-lock.md)

### 分布式事务

[分布式事务详解](./distributed-system/distributed-transaction.md)

### 分布式配置中心

[分布式配置中心详解](./distributed-system/distributed-configuration-center.md)

### RPC

- [RPC 基础常见知识点&面试题总结](./distributed-system/rpc/rpc-intro.md)
- [Dubbo 常见知识点&面试题总结](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> 前两篇文章可能有内容重合部分，推荐都看一遍。

- [ZooKeeper 相关概念总结(入门)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [ZooKeeper 相关概念总结(进阶)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)
- [ZooKeeper 实战](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-in-action.md)

## 高性能

### 数据库读写分离&分库分表

[数据库读写分离&分库分表详解](./high-performance/read-and-write-separation-and-library-subtable.md)

### 负载均衡

[负载均衡详解](./high-performance/load-balancing.md)

### SQL 优化

[常见 SQL 优化手段总结](./high-performance/sql-optimization.md)

### CDN

[CDN（内容分发网络）详解](./high-performance/cdn.md)

### 消息队列

消息队列在分布式系统中主要是为了解耦和削峰。相关阅读： [消息队列常见问题总结](./high-performance/message-queue/message-queue.md)。

- **RabbitMQ** : [RabbitMQ 基础知识总结](./high-performance/message-queue/rabbitmq-intro.md)、[RabbitMQ 常见面试题](./high-performance/message-queue/rabbitmq-questions.md)
- **RocketMQ** : [RocketMQ 基础知识总结](./high-performance/message-queue/rocketmq-intro.md)、[RocketMQ 常见面试题总结](./high-performance/message-queue/rocketmq-questions.md)
- **Kafka** ：[Kafka 常见问题总结](./high-performance/message-queue/kafka-questions-01.md)

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

**灾备** = 容灾+备份。

- **备份** ： 将系统所产生的的所有重要数据多备份几份。
- **容灾** ： 在异地建立两个完全相同的系统。当某个地方的系统突然挂掉，整个应用系统可以切换到另一个，这样系统就可以正常提供服务了。

**异地多活** 描述的是将服务部署在异地并且服务同时对外提供服务。和传统的灾备设计的最主要区别在于“多活”，即所有站点都是同时在对外提供服务的。异地多活是为了应对突发状况比如火灾、地震等自然或者人为灾害。

## Star 趋势

![Stars](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号“**JavaGuide**”。

![JavaGuide 官方公众号](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
