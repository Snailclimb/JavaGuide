---
icon: creative
title: JavaGuide（Java学习&&面试指南）
---

<div align="center">
    <p>
        <a href="https://github.com/Snailclimb/JavaGuide" target="_blank">
            <img src="https://img-blog.csdnimg.cn/img_convert/1c00413c65d1995993bf2b0daf7b4f03.png#pic_center" width="" />
        </a>
    </p>
    <p>
        <a href="https://javaguide.cn/"><img src="https://img.shields.io/badge/阅读-read-brightgreen.svg" alt="阅读" /></a>
        <img src="https://img.shields.io/github/stars/Snailclimb/JavaGuide" alt="stars" />
        <img src="https://img.shields.io/github/forks/Snailclimb/JavaGuide" alt="forks" />
        <img src="https://img.shields.io/github/issues/Snailclimb/JavaGuide" alt="issues" />
    </p>
    <p>
        <a href="https://github.com/Snailclimb/JavaGuide">Github</a> |
        <a href="https://gitee.com/SnailClimb/JavaGuide">Gitee</a>
    </p>  
     <p>
        <a href="https://www.yuque.com/docs/share/8a30ffb5-83f3-40f9-baf9-38de68b906dc">
            <img src="https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/xingqiu/xingqiu.png" style="margin: 0 auto; width: 850px;" />
        </a>
    </p>
</div>

> - **面试专版** ：准备面试的小伙伴可以考虑面试专版：[《Java 面试进阶指北 》](https://www.yuque.com/docs/share/f37fc804-bfe6-4b0d-b373-9c462188fec7) (质量很高，专为面试打造，配合 JavaGuide 食用)。
> - **知识星球** ：专属面试小册/一对一交流/简历修改/专属求职指南，欢迎加入 [JavaGuide 知识星球](https://www.yuque.com/docs/share/8a30ffb5-83f3-40f9-baf9-38de68b906dc)（点击链接即可查看星球的详细介绍，一定一定一定确定自己真的需要再加入，一定一定要看完详细介绍之后再加我）。
> - **转载须知** ：以下所有文章如非文首说明为转载皆为 JavaGuide 原创，转载在文首注明出处，如发现恶意抄袭/搬运，会动用法律武器维护自己的权益。让我们一起维护一个良好的技术创作环境！

<div style="text-align:center">
    <p>
        <a href="https://www.yuque.com/docs/share/8a30ffb5-83f3-40f9-baf9-38de68b906dc">
            <img src="https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/gongzhonghaoxuanchuan.png" style="margin: 0 auto;" />
        </a>
    </p>
</div>


## 项目相关

* [项目介绍](./javaguide/intro.md)
* [贡献指南](./javaguide/contribution-guideline.md)
* [常见问题](./javaguide/faq.md)
* [项目代办](./javaguide/todo.md)

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

* [ArrayList 源码+扩容机制分析](./java/collection/arraylist-source-code.md)
* [HashMap(JDK1.8)源码+底层数据结构分析](./java/collection/hashmap-source-code.md)
* [ConcurrentHashMap 源码+底层数据结构分析](./java/collection/concurrent-hash-map-source-code.md)

### IO

* [IO 基础知识总结](./java/io/io-basis.md)
* [IO 设计模式总结](./java/io/io-design-patterns.md)
* [IO 模型详解](./java/io/io-model.md)

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
- [CompletableFuture入门](./java/concurrent/completablefuture-intro.md)

### JVM (必看 :+1:)

JVM 这部分内容主要参考 [JVM 虚拟机规范-Java8 ](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) 和周志明老师的[《深入理解Java虚拟机（第3版）》](https://book.douban.com/subject/34907497/) （强烈建议阅读多遍！）。

- **[Java 内存区域](./java/jvm/memory-area.md)**
- **[JVM 垃圾回收](./java/jvm/jvm-garbage-collection.md)**
- [类文件结构](./java/jvm/class-file-structure.md)
- **[类加载过程](./java/jvm/class-loading-process.md)**
- [类加载器](./java/jvm/classloader.md)
- [【待完成】最重要的 JVM 参数总结（翻译完善了一半）](./java/jvm/jvm-parameters-intro.md)
- [【加餐】大白话带你认识 JVM](./java/jvm/jvm-intro.md)
- [JDK 监控和故障处理工具](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### 新特性

- **Java 8** ：[Java 8 新特性总结（翻译）](./java/new-features/java8-tutorial-translate.md)、[Java8常用新特性总结](./java/new-features/java8-common-new-features.md)
- [Java 9 新特性概览](./java/new-features/java9.md)
- [Java 10 新特性概览](./java/new-features/java10.md)
- [Java 11 新特性概览](./java/new-features/java11.md)
- [Java 12~13 新特性概览](./java/new-features/java12-13.md)
- [Java 14~15 新特性概览](./java/new-features/java14-15.md)
- [Java 16 新特性概览](./java/new-features/java16.md)
- [Java 18 新特性概览](./java/new-features/java18.md)
- [Java 19 新特性概览](./java/new-features/java19.md)

## 计算机基础

### 操作系统

- [操作系统常见问题总结！](./cs-basics/operating-system/operating-system-basic-questions-01.md)
- [后端程序员必备的 Linux 基础知识总结](./cs-basics/operating-system/linux-intro.md)
- [Shell 编程基础知识总结](./cs-basics/operating-system/shell-intro.md)

### 网络

**知识点/面试题总结** ：

- [计算机网络常见知识点&面试题总结](./cs-basics/network/other-network-questions.md)
- [谢希仁老师的《计算机网络》内容总结（补充）](./cs-basics/network/computer-network-xiexiren-summary.md)

**重要知识点详解** ：

- [OSI 和 TCP/IP 网络分层模型详解（基础）](./cs-basics/network/osi&tcp-ip-model.md)
- [应用层常见协议总结（应用层）](./cs-basics/network/application-layer-protocol.md)
- [HTTP vs HTTPS（应用层）](./cs-basics/network/http&https.md)
- [HTTP 1.0 vs HTTP 1.1（应用层）](./cs-basics/network/http1.0&http1.1.md)
- [HTTP 常见状态码（应用层）](./cs-basics/network/http-status-codes.md)
- [TCP 三次握手和四次挥手（传输层）](./cs-basics/network/tcp-connection-and-disconnection.md)
- [TCP 传输可靠性保障（传输层）](./cs-basics/network/tcp-reliability-guarantee.md)
- [ARP 协议详解(网络层)](./cs-basics/network/arp.md)

### 数据结构

**图解数据结构：**

- [线性数据结构 :数组、链表、栈、队列](./cs-basics/data-structure/linear-data-structure.md)
- [图](./cs-basics/data-structure/graph.md)
- [堆](./cs-basics/data-structure/heap.md)
- [树](./cs-basics/data-structure/tree.md) ：重点关注[红黑树](./cs-basics/data-structure/red-black-tree.md)、B-，B+，B*树、LSM树

其他常用数据结构 ：

- [布隆过滤器](./cs-basics/data-structure/bloom-filter.md)

### 算法

算法这部分内容非常重要，如果你不知道如何学习算法的话，可以看下我写的：

* [算法学习书籍+资源推荐](https://www.zhihu.com/question/323359308/answer/1545320858) 。
* [如何刷Leetcode?](https://www.zhihu.com/question/31092580/answer/1534887374) 

**常见算法问题总结** ：

* [几道常见的字符串算法题总结 ](./cs-basics/algorithms/string-algorithm-problems.md)
* [几道常见的链表算法题总结 ](./cs-basics/algorithms/linkedlist-algorithm-problems.md)
* [剑指 offer 部分编程题](./cs-basics/algorithms/the-sword-refers-to-offer.md)
* [十大经典排序算法](./cs-basics/algorithms/10-classical-sorting-algorithms.md)

另外，[GeeksforGeeks]( https://www.geeksforgeeks.org/fundamentals-of-algorithms/) 这个网站总结了常见的算法 ，比较全面系统。

## 数据库

### 基础

- [数据库基础知识总结](./database/basis.md)
- [字符集详解](./database/character-set.md)

### MySQL

**知识点/面试题总结：**

- **[MySQL知识点总结](./database/mysql/mysql-questions-01.md)** (必看 :+1:)
- [一千行 MySQL 学习笔记](./database/mysql/a-thousand-lines-of-mysql-study-notes.md)
- [MySQL 高性能优化规范建议](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**重要知识点：**

- [MySQL数据库索引总结](./database/mysql/mysql-index.md)
- [事务隔离级别(图文详解)](./database/mysql/transaction-isolation-level.md)
- [MySQL三大日志(binlog、redo log和undo log)详解](./database/mysql/mysql-logs.md)
- [InnoDB存储引擎对MVCC的实现](./database/mysql/innodb-implementation-of-mvcc.md)
- [SQL语句在MySQL中的执行过程](./database/mysql/how-sql-executed-in-mysql.md)
- [关于数据库中如何存储时间的一点思考](./database/mysql/some-thoughts-on-database-storage-time.md)
- [MySQL中的隐式转换造成的索引失效](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**知识点/面试题总结** : (必看:+1: )：

- [Redis 常见问题总结(上)](./database/redis/redis-questions-01.md)
- [Redis 常见问题总结(下)](./database/redis/redis-questions-02.md)

**重要知识点：**

- [3种常用的缓存读写策略详解](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Redis 5 种基本数据结构详解](./database/redis/redis-data-structures-01.md)
- [Redis 3 种特殊数据结构详解](./database/redis/redis-data-structures-02.md)
- [Redis 内存碎片详解](./database/redis/redis-memory-fragmentation.md)
- [Redis 集群详解](./database/redis/redis-cluster.md)

## 搜索引擎

用于提高搜索效率，功能和浏览器搜索引擎类似。比较常见的搜索引擎是 Elasticsearch（推荐） 和 Solr。

![JavaGuide 官方公众号](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/gongzhonghaoxuanchuan.png)

## 开发工具

### Docker

* [Docker 基本概念解读](./tools/docker/docker-intro.md)
* [Docker从入门到上手干事](./tools/docker/docker-in-action.md)

### Git

* [Git 入门](./tools/git/git-intro.md)
* [Github 小技巧](./tools/git/github-tips.md)

## 系统设计

- [系统设计常见面试题总结](./system-design/system-design-questions.md)
- [设计模式常见面试题总结](./system-design/design-pattern.md)

### 基础

- [RestFul API 简明教程](./system-design/basis/RESTfulAPI.md)
- [Java 编码命名之道](./system-design/basis/naming.md) 
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
- [JWT 优缺点分析以及常见问题解决方案](./system-design/security/advantages&disadvantages-of-jwt.md)
- [SSO 单点登录详解](./system-design/security/sso-intro.md)
- [权限系统设计详解](./system-design/security/design-of-authority-system.md)

#### 数据脱敏

数据脱敏说的就是我们根据特定的规则对敏感信息数据进行变形，比如我们把手机号、身份证号某些位数使用 * 来代替。

#### 敏感词过滤

[敏感词过滤方案总结](./system-design/security/sentive-words-filter.md)

### 定时任务

[Java 定时任务详解](./system-design/schedule-task.md)

### Web 实时消息推送

[Web 实时消息推送详解](./system-design/web-real-time-message-push.md)

## 分布式

### CAP 理论和 BASE 理论

[CAP 理论和 BASE 理论解读](./distributed-system/theorem&algorithm&protocol/cap&base-theorem.md)

### Paxos 算法和 Raft 算法

- [Paxos 算法解读](./distributed-system/theorem&algorithm&protocol/paxos-algorithm.md)
- [Raft 算法解读](./distributed-system/theorem&algorithm&protocol/raft-algorithm.md)

### RPC

* [RPC 基础常见知识点&面试题总结](./distributed-system/rpc/rpc-intro.md)
* [Dubbo 常见知识点&面试题总结](./distributed-system/rpc/dubbo.md)

### API 网关

* [为什么要网关？你知道有哪些常见的网关系统？](./distributed-system/api-gateway.md)
* [百亿规模API网关服务Shepherd的设计与实现](https://tech.meituan.com/2021/05/20/shepherd-api-gateway.html)

### 分布式 id

[为什么要分布式 id ？分布式 id 生成方案有哪些？](./distributed-system/distributed-id.md)

### 分布式锁

[分布式锁](./distributed-system/distributed-lock.md)

### 分布式事务

[分布式事务](./distributed-system/distributed-transaction.md)

### 分布式协调

> 前两篇文章可能有内容重合部分，推荐都看一遍。

- [ZooKeeper 相关概念总结(入门)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [ZooKeeper 相关概念总结(进阶)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)
- [ZooKeeper 实战](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-in-action.md)

## 高性能

### 消息队列

消息队列在分布式系统中主要是为了解耦和削峰。相关阅读： [消息队列常见问题总结](./high-performance/message-queue/message-queue.md)。

- **RabbitMQ** : [RabbitMQ 基础知识总结](./high-performance/message-queue/rabbitmq-intro.md)、[RabbitMQ 常见面试题](./high-performance/message-queue/rabbitmq-questions.md)
- **RocketMQ** : [RocketMQ 基础知识总结](./high-performance/message-queue/rocketmq-intro.md)、[RocketMQ 常见面试题总结](./high-performance/message-queue/rocketmq-questions.md)
- **Kafka** ：[Kafka 常见问题总结](./high-performance/message-queue/kafka-questions-01.md)

### 读写分离&分库分表

 [读写分离&分库分表](./high-performance/read-and-write-separation-and-library-subtable.md)

### 负载均衡

 [负载均衡](./high-performance/load-balancing.md)

### CDN

[CDN（内容分发网络）](./high-performance/cdn.md)

## 高可用

[高可用系统设计指南](./high-availability/high-availability-system-design.md) 。

### 限流

[何为限流？限流算法有哪些？](./high-availability/limit-request.md)

### 降级&熔断

[降级&熔断](./high-availability/fallback&circuit-breaker.md)

### 超时&重试

[超时&重试](./high-availability/timeout-and-retry.md)

### 集群

相同的服务部署多份，避免单点故障。

### 灾备设计和异地多活

**灾备**  = 容灾+备份。

* **备份** ： 将系统所产生的的所有重要数据多备份几份。
* **容灾** ： 在异地建立两个完全相同的系统。当某个地方的系统突然挂掉，整个应用系统可以切换到另一个，这样系统就可以正常提供服务了。

**异地多活** 描述的是将服务部署在异地并且服务同时对外提供服务。和传统的灾备设计的最主要区别在于“多活”，即所有站点都是同时在对外提供服务的。异地多活是为了应对突发状况比如火灾、地震等自然或者人为灾害。

## Star 趋势

![](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)



## 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号“**JavaGuide**”。

![JavaGuide 官方公众号](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/gongzhonghaoxuanchuan.png)

