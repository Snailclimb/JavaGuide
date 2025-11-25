---
icon: creative
title: JavaGuide (Java Learning & Interview Guide)
---

::: tip Friendly reminder

- **Interview Special Edition**: Friends who are preparing for Java interviews may consider the special interview edition: **["Java Interview Guide North"](./zhuanlan/java-mian-shi-zhi-bei.md)** (high quality, specially created for interviews, and consumed with JavaGuide).
- **Knowledge Planet**: Exclusive interview booklet/one-on-one communication/resume modification/exclusive job search guide, welcome to join **[JavaGuide Knowledge Planet](./about-the-author/zhishixingqiu-two-years.md)** (click the link to view the detailed introduction of the planet, be sure to make sure you really need to join again).
- **Usage Suggestions**: Skilled interviewers dig out technical issues based on project experience. Be sure not to memorize technical eight-part essays by rote! For detailed learning suggestions, please refer to: [JavaGuide usage suggestions](./javaguide/use-suggestion.md).
- **Ask for a Star**: If you think the content of JavaGuide is helpful to you, please click a free Star. This is the greatest encouragement to me. Thank you for walking together and encouraging each other! Portal: [GitHub](https://github.com/Snailclimb/JavaGuide) | [Gitee](https://gitee.com/SnailClimb/JavaGuide).
- **Reprint Notice**: All the following articles are original to JavaGuide unless stated as reprinted at the beginning of the article. Please indicate the source at the beginning of the article for reprinting. If malicious plagiarism/transportation is discovered, legal weapons will be used to protect one's rights. Let us maintain a good technical creation environment together!

:::

## Java

### Basics

**Knowledge points/Summary of interview questions**: (Must read: +1: ):

- [Java basic common knowledge points & summary of interview questions (Part 1)](./java/basis/java-basic-questions-01.md)
- [Java Basic Common Knowledge Points & Summary of Interview Questions (Part 2)](./java/basis/java-basic-questions-02.md)
- [Java basic common knowledge points & summary of interview questions (Part 2)](./java/basis/java-basic-questions-03.md)

**Detailed explanation of important knowledge points**:

- [Why is there only passing by value in Java? ](./java/basis/why-there-only-value-passing-in-java.md)
- [Java serialization detailed explanation](./java/basis/serialization.md)
- [Generics & wildcards detailed explanation](./java/basis/generics-and-wildcards.md)
- [Detailed explanation of Java reflection mechanism](./java/basis/reflection.md)
- [Detailed explanation of Java proxy mode](./java/basis/proxy.md)
- [BigDecimal detailed explanation](./java/basis/bigdecimal.md)
- [Detailed explanation of Java magic class Unsafe](./java/basis/unsafe.md)
- [Detailed explanation of Java SPI mechanism](./java/basis/spi.md)
- [Java syntactic sugar detailed explanation](./java/basis/syntactic-sugar.md)

### Collection

**Summary of knowledge points/interview questions**:

- [Java Collection Common Knowledge Points & Summary of Interview Questions (Part 1)](./java/collection/java-collection-questions-01.md) (Must read: +1:)
- [Java Collection Common Knowledge Points & Summary of Interview Questions (Part 2)](./java/collection/java-collection-questions-02.md) (Must read: +1:)
- [Summary of precautions for using Java collections](./java/collection/java-collection-precautions-for-use.md)

**Source code analysis**:

- [ArrayList core source code + expansion mechanism analysis](./java/collection/arraylist-source-code.md)
- [LinkedList core source code analysis](./java/collection/linkedlist-source-code.md)
- [HashMap core source code + underlying data structure analysis](./java/collection/hashmap-source-code.md)
- [ConcurrentHashMap core source code + underlying data structure analysis](./java/collection/concurrent-hash-map-source-code.md)
- [LinkedHashMap core source code analysis](./java/collection/linkedhashmap-source-code.md)
- [CopyOnWriteArrayList core source code analysis](./java/collection/copyonwritearraylist-source-code.md)
- [ArrayBlockingQueue core source code analysis](./java/collection/arrayblockingqueue-source-code.md)
- [PriorityQueue core source code analysis](./java/collection/priorityqueue-source-code.md)
- [DelayQueue core source code analysis](./java/collection/priorityqueue-source-code.md)

###IO

- [Summary of IO basic knowledge](./java/io/io-basis.md)
- [IO design pattern summary](./java/io/io-design-patterns.md)
- [IO model detailed explanation](./java/io/io-model.md)
- [NIO core knowledge summary](./java/io/nio-basis.md)

### Concurrency

**Knowledge points/Summary of interview questions**: (must read: +1:)

- [Java concurrency common knowledge points & summary of interview questions (Part 1)](./java/concurrent/java-concurrent-questions-01.md)
- [Java concurrency common knowledge points & summary of interview questions (Part 2)](./java/concurrent/java-concurrent-questions-02.md)
- [Java concurrency common knowledge points & summary of interview questions (Part 2)](./java/concurrent/java-concurrent-questions-03.md)

**Detailed explanation of important knowledge points**:

- [Detailed explanation of optimistic lock and pessimistic lock](./java/concurrent/optimistic-lock-and-pessimistic-lock.md)
- [CAS detailed explanation](./java/concurrent/cas.md)
- [JMM (Java Memory Model) Detailed Explanation](./java/concurrent/jmm.md)
- **Thread Pool**: [Java thread pool detailed explanation](./java/concurrent/java-thread-pool-summary.md), [Java thread pool best practices](./java/concurrent/java-thread-pool-best-practices.md)
- [ThreadLocal detailed explanation](./java/concurrent/threadlocal.md)
- [Java Concurrent Container Summary](./java/concurrent/java-concurrent-collections.md)
- [Atomic atomic class summary](./java/concurrent/atomic-classes.md)
- [AQS detailed explanation](./java/concurrent/aqs.md)
- [CompletableFuture detailed explanation](./java/concurrent/completablefuture-intro.md)

### JVM (must read :+1:)

This part of JVM mainly refers to [JVM Virtual Machine Specification-Java8](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) and Mr. Zhou Zhiming’s ["In-depth Understanding of Java Virtual Machine (3rd Edition)"](https://book.douban.com/subject/34907497/) (strongly recommended to read it multiple times!).

- **[Java Memory Area](./java/jvm/memory-area.md)**
- **[JVM Garbage Collection](./java/jvm/jvm-garbage-collection.md)**
- [Class file structure](./java/jvm/class-file-structure.md)
- **[Class loading process](./java/jvm/class-loading-process.md)**
- [Classloader](./java/jvm/classloader.md)
- [[To be completed] Summary of the most important JVM parameters (the translation is half complete)](./java/jvm/jvm-parameters-intro.md)
- [[Additional meal] Vernacular to introduce you to JVM](./java/jvm/jvm-intro.md)- [JDK Monitoring and Troubleshooting Tools](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### New features

- **Java 8**: [Java 8 new features summary (translation)] (./java/new-features/java8-tutorial-translate.md), [Java8 common new features summary] (./java/new-features/java8-common-new-features.md)
- [Java 9 new features overview](./java/new-features/java9.md)
- [Java 10 new features overview](./java/new-features/java10.md)
- [Java 11 new features overview](./java/new-features/java11.md)
- [Java 12 & 13 new features overview](./java/new-features/java12-13.md)
- [Java 14 & 15 new features overview](./java/new-features/java14-15.md)
- [Java 16 new features overview](./java/new-features/java16.md)
- [Java 17 new features overview](./java/new-features/java17.md)
- [Java 18 new features overview](./java/new-features/java18.md)
- [Java 19 new features overview](./java/new-features/java19.md)
- [Java 20 new features overview](./java/new-features/java20.md)
- [Java 21 new features overview](./java/new-features/java21.md)
- [Java 22 & 23 new features overview](./java/new-features/java22-23.md)
- [Java 24 new features overview](./java/new-features/java24.md)
- [Java 25 new features overview](./java/new-features/java25.md)

## Computer Basics

### Operating System

- [Common operating system knowledge points & summary of interview questions (Part 1)](./cs-basics/operating-system/operating-system-basic-questions-01.md)
- [Common operating system knowledge points & summary of interview questions (Part 2)](./cs-basics/operating-system/operating-system-basic-questions-02.md)
- **Linux**:
  - [Summary of essential Linux basic knowledge for back-end programmers](./cs-basics/operating-system/linux-intro.md)
  - [Summary of basic knowledge of Shell programming](./cs-basics/operating-system/shell-intro.md)

### Network

**Summary of knowledge points/interview questions**:

- [Common computer network knowledge points & summary of interview questions (Part 1)](./cs-basics/network/other-network-questions.md)
- [Common computer network knowledge points & summary of interview questions (Part 2)](./cs-basics/network/other-network-questions2.md)
- [Summary of the contents of "Computer Network" by Teacher Xie Xiren (supplement)](./cs-basics/network/computer-network-xiexiren-summary.md)

**Detailed explanation of important knowledge points**:

- [Detailed explanation of OSI and TCP/IP network layering model (basic)](./cs-basics/network/osi-and-tcp-ip-model.md)
- [Summary of common protocols in the application layer (application layer)](./cs-basics/network/application-layer-protocol.md)
- [HTTP vs HTTPS (application layer)](./cs-basics/network/http-vs-https.md)
- [HTTP 1.0 vs HTTP 1.1 (application layer)](./cs-basics/network/http1.0-vs-http1.1.md)
- [HTTP common status codes (application layer)](./cs-basics/network/http-status-codes.md)
- [DNS Domain Name System Detailed Explanation (Application Layer)](./cs-basics/network/dns.md)
- [TCP three-way handshake and four-way wave (transport layer)](./cs-basics/network/tcp-connection-and-disconnection.md)
- [TCP Transmission Reliability Guarantee (Transport Layer)](./cs-basics/network/tcp-reliability-guarantee.md)
- [Detailed explanation of ARP protocol (network layer)](./cs-basics/network/arp.md)
- [Detailed explanation of NAT protocol (network layer)](./cs-basics/network/nat.md)
- [Summary of common network attack means (security)](./cs-basics/network/network-attack-means.md)

### Data structure

**Illustrated data structure:**

- [Linear data structure: array, linked list, stack, queue](./cs-basics/data-structure/linear-data-structure.md)
- [Graph](./cs-basics/data-structure/graph.md)
- [Heap](./cs-basics/data-structure/heap.md)
- [Tree](./cs-basics/data-structure/tree.md): Focus on [red-black tree](./cs-basics/data-structure/red-black-tree.md), B-, B+, B\* tree, LSM tree

Other commonly used data structures:

- [Bloom filter](./cs-basics/data-structure/bloom-filter.md)

### Algorithm

This part of the algorithm is very important. If you don’t know how to learn algorithms, you can read what I wrote:

- [Algorithm learning books + resource recommendations](https://www.zhihu.com/question/323359308/answer/1545320858).
- [How to flash Leetcode?](https://www.zhihu.com/question/31092580/answer/1534887374)

**Summary of common algorithm problems**:

- [Summary of several common string algorithm problems](./cs-basics/algorithms/string-algorithm-problems.md)
- [Summary of several common linked list algorithm problems](./cs-basics/algorithms/linkedlist-algorithm-problems.md)
- [The sword refers to offer some programming questions](./cs-basics/algorithms/the-sword-refers-to-offer.md)
- [Top Ten Classic Sorting Algorithms](./cs-basics/algorithms/10-classical-sorting-algorithms.md)

In addition, [GeeksforGeeks](https://www.geeksforgeeks.org/fundamentals-of-algorithms/) This website summarizes common algorithms and is relatively comprehensive and systematic.

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](./about-the-author/zhishixingqiu-two-years.md)

## Database

### Basics

- [Summary of basic database knowledge](./database/basis.md)
- [Summary of NoSQL basic knowledge](./database/nosql.md)
- [Detailed explanation of character set](./database/character-set.md)
-SQL:
  - [Summary of basic knowledge of SQL syntax](./database/sql/sql-syntax-summary.md)
  - [Summary of common SQL interview questions](./database/sql/sql-questions-01.md)

###MySQL

**Summary of knowledge points/interview questions:**

- **[MySQL common knowledge points & summary of interview questions](./database/mysql/mysql-questions-01.md)** (must read: +1:)
- [MySQL High Performance Optimization Specification Recommendations Summary](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**Important knowledge points:**

- [MySQL index detailed explanation](./database/mysql/mysql-index.md)
- [MySQL transaction isolation level graphic and text explanation)](./database/mysql/transaction-isolation-level.md)- [Detailed explanation of MySQL's three major logs (binlog, redo log and undo log)](./database/mysql/mysql-logs.md)
- [InnoDB storage engine implementation of MVCC](./database/mysql/innodb-implementation-of-mvcc.md)
- [The execution process of SQL statements in MySQL](./database/mysql/how-sql-executed-in-mysql.md)
- [MySQL query cache detailed explanation](./database/mysql/mysql-query-cache.md)
- [MySQL execution plan analysis](./database/mysql/mysql-query-execution-plan.md)
- [MySQL auto-increment primary key must be continuous](./database/mysql/mysql-auto-increment-primary-key-continuous.md)
- [MySQL time type data storage suggestions](./database/mysql/some-thoughts-on-database-storage-time.md)
- [MySQL index invalidation caused by implicit conversion](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**Knowledge points/Summary of interview questions**: (Must read: +1: ):

- [Redis common knowledge points & summary of interview questions (Part 1)](./database/redis/redis-questions-01.md)
- [Redis common knowledge points & summary of interview questions (Part 2)](./database/redis/redis-questions-02.md)

**Important knowledge points:**

- [Detailed explanation of 3 commonly used cache read and write strategies](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Detailed explanation of 5 basic data structures of Redis](./database/redis/redis-data-structures-01.md)
- [Detailed explanation of three special data structures of Redis](./database/redis/redis-data-structures-02.md)
- [Detailed explanation of Redis persistence mechanism](./database/redis/redis-persistence.md)
- [Detailed explanation of Redis memory fragmentation](./database/redis/redis-memory-fragmentation.md)
- [Summary of common blocking causes in Redis](./database/redis/redis-common-blocking-problems-summary.md)
- [Detailed explanation of Redis cluster](./database/redis/redis-cluster.md)

### MongoDB

- [MongoDB common knowledge points & summary of interview questions (Part 1)](./database/mongodb/mongodb-questions-01.md)
- [MongoDB common knowledge points & summary of interview questions (Part 2)](./database/mongodb/mongodb-questions-02.md)

## Search engine

[Summary of common Elasticsearch interview questions (paid)](./database/elasticsearch/elasticsearch-questions-01.md)

![JavaGuide official public account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Development tools

###Maven

- [Summary of Maven core concepts](./tools/maven/maven-core-concepts.md)
- [Maven Best Practices](./tools/maven/maven-best-practices.md)

### Gradle

[Summary of Gradle core concepts](./tools/gradle/gradle-core-concepts.md) (optional, Maven is still more common in China)

### Docker

- [Summary of Docker core concepts](./tools/docker/docker-intro.md)
- [Docker in action](./tools/docker/docker-in-action.md)

### Git

- [Summary of Git core concepts](./tools/git/git-intro.md)
- [Summary of GitHub practical tips](./tools/git/github-tips.md)

## System Design

- [Summary of common system design interview questions](./system-design/system-design-questions.md)
- [Summary of common interview questions on design patterns](./system-design/design-pattern.md)

### Basics

- [RestFul API concise tutorial](./system-design/basis/RESTfulAPI.md)
- [A concise tutorial on software engineering: a concise tutorial](./system-design/basis/software-engineering.md)
- [Code Naming Guide](./system-design/basis/naming.md)
- [Code Refactoring Guide](./system-design/basis/refactoring.md)
- [Unit Testing Guide](./system-design/basis/unit-test.md)

### Commonly used frameworks

#### Spring/SpringBoot (must read :+1:)

**Knowledge points/Summary of interview questions**:

- [Spring common knowledge points & interview questions summary](./system-design/framework/spring/spring-knowledge-and-questions-summary.md)
- [SpringBoot common knowledge points & interview questions summary](./system-design/framework/spring/springboot-knowledge-and-questions-summary.md)
- [Summary of common annotations in Spring/Spring Boot](./system-design/framework/spring/spring-common-annotations.md)
- [SpringBoot Getting Started Guide](https://github.com/Snailclimb/springboot-guide)

**Detailed explanation of important knowledge points**:

- [Detailed explanation of IoC & AOP (quick understanding)](./system-design/framework/spring/ioc-and-aop.md)
- [Spring transaction details](./system-design/framework/spring/spring-transaction.md)
- [Detailed explanation of design patterns in Spring](./system-design/framework/spring/spring-design-patterns-summary.md)
- [Detailed explanation of SpringBoot automatic assembly principles](./system-design/framework/spring/spring-boot-auto-assembly-principles.md)

#### MyBatis

[Summary of MyBatis common interview questions](./system-design/framework/mybatis/mybatis-interview.md)

### Security

#### Authentication and authorization

- [Detailed explanation of the basic concepts of authentication and authorization](./system-design/security/basis-of-authority-certification.md)
- [Detailed explanation of JWT basic concepts](./system-design/security/jwt-intro.md)
- [Analysis of advantages and disadvantages of JWT and solutions to common problems](./system-design/security/advantages-and-disadvantages-of-jwt.md)
- [SSO single sign-on detailed explanation](./system-design/security/sso-intro.md)
- [Detailed explanation of authority system design](./system-design/security/design-of-authority-system.md)

#### Data Security

- [Summary of common encryption algorithms](./system-design/security/encryption-algorithms.md)
- [Summary of sensitive word filtering solutions](./system-design/security/sentive-words-filter.md)
- [Summary of data desensitization solutions](./system-design/security/data-desensitization.md)
- [Why do data verification need to be done on both the front and back ends](./system-design/security/data-validation.md)

### Scheduled tasks

[Detailed explanation of Java scheduled tasks](./system-design/schedule-task.md)

### Web real-time message push[Detailed explanation of Web real-time message push](./system-design/web-real-time-message-push.md)

## Distributed

### Theory&Algorithm&Protocol

- [Interpretation of CAP theory and BASE theory](./distributed-system/protocol/cap-and-base-theorem.md)
- [Interpretation of Paxos algorithm](./distributed-system/protocol/paxos-algorithm.md)
- [Raft algorithm interpretation](./distributed-system/protocol/raft-algorithm.md)
- [Gossip protocol detailed explanation](./distributed-system/protocol/gossip-protocl.md)
- [Detailed explanation of consistent hashing algorithm](./distributed-system/protocol/consistent-hashing.md)

### RPC

- [Summary of RPC basic knowledge](./distributed-system/rpc/rpc-intro.md)
- [Dubbo common knowledge points & interview questions summary](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> These two articles may have overlapping content, so it is recommended to read them both.

- [Summary of ZooKeeper related concepts (getting started)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [Summary of ZooKeeper related concepts (advanced)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)

### API Gateway

- [Summary of basic knowledge of API gateway](./distributed-system/api-gateway.md)
- [Spring Cloud Gateway common knowledge points & summary of interview questions](./distributed-system/spring-cloud-gateway-questions.md)

### Distributed ID

- [Distributed ID common knowledge points & summary of interview questions](./distributed-system/distributed-id.md)
- [Distributed ID Design Guide](./distributed-system/distributed-id-design.md)

### Distributed lock

- [Introduction to distributed locks](https://javaguide.cn/distributed-system/distributed-lock.html)
- [Summary of common implementation solutions for distributed locks](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)

### Distributed transactions

[Common knowledge points about distributed transactions & summary of interview questions](./distributed-system/distributed-transaction.md)

### Distributed Configuration Center

[Common knowledge points of distributed configuration center & summary of interview questions](./distributed-system/distributed-configuration-center.md)

## High performance

### Database optimization

- [Database read-write separation and sub-database and sub-table](./high-performance/read-and-write-separation-and-library-subtable.md)
- [Data hot and cold separation](./high-performance/data-cold-hot-separation.md)
- [Summary of common SQL optimization methods](./high-performance/sql-optimization.md)
- [Introduction to deep pagination and optimization suggestions](./high-performance/deep-pagination-optimization.md)

### Load balancing

[Common knowledge points on load balancing & summary of interview questions](./high-performance/load-balancing.md)

### CDN

[CDN (Content Delivery Network) Common Knowledge Points & Summary of Interview Questions](./high-performance/cdn.md)

### Message queue

- [Summary of basic knowledge of message queue](./high-performance/message-queue/message-queue.md)
- [Disruptor common knowledge points & summary of interview questions](./high-performance/message-queue/disruptor-questions.md)
- [RabbitMQ common knowledge points & summary of interview questions](./high-performance/message-queue/rabbitmq-questions.md)
- [RocketMQ common knowledge points & summary of interview questions](./high-performance/message-queue/rocketmq-questions.md)
- [Kafka common knowledge points & summary of interview questions](./high-performance/message-queue/kafka-questions-01.md)

## High availability

[High Availability System Design Guide](./high-availability/high-availability-system-design.md)

### Redundant design

[Detailed explanation of redundancy design](./high-availability/redundancy.md)

### Current limiting

[Detailed explanation of service current limit](./high-availability/limit-request.md)

### Downgrade & Circuit Breaker

[Detailed explanation of fallback and circuit breaker](./high-availability/fallback-and-circuit-breaker.md)

### Timeout & Retry

[Detailed explanation of timeout & retry](./high-availability/timeout-and-retry.md)

### Cluster

Deploy multiple copies of the same service to avoid single points of failure.

### Disaster recovery design and multi-activity in remote locations

**Disaster Recovery** = Disaster Recovery + Backup.

- **Backup**: Back up several copies of all important data generated by the system.
- **Disaster Recovery**: Establish two identical systems in different places. When a system somewhere suddenly hangs up, the entire application system can be switched to another one so that the system can provide services normally.

**Remote multi-activity** describes the deployment of services in remote locations and the services are provided to the outside world at the same time. The main difference from traditional disaster recovery design is "multi-activity", that is, all sites provide services to the outside world at the same time. Living more in different places is to cope with emergencies such as fires, earthquakes and other natural or man-made disasters.

## Star Trends

![Stars](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## Official account

If you want to follow my updated articles and shared information in real time, you can follow my public account "**JavaGuide**".

![JavaGuide official public account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)