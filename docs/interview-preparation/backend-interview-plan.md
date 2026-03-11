---
title: Java 后端面试通关计划（涵盖后端通用体系）
description: Java 后端面试通关计划：严格按照面试考察真实优先级编排，涵盖项目经历、Java核心、MySQL/Redis、框架、系统设计、计算机基础、分布式与JVM，适合校招/社招准备。
category: 面试准备
icon: star
head:
  - - meta
    - name: keywords
      content: Java后端面试,面试准备计划,面试指南,八股文,校招,社招,项目经验,Java面试
---

本计划严格按照面试考察的**真实优先级**进行编排，顺序为：
**「 项目经历与简历深挖 → Java核心/MySQL/Redis → 框架应用 → 系统设计与场景题 → 计算机基础 → 分布式/高并发 → JVM」**

每一阶段都对应了本站具体的精选文章，方便你按图索骥，逐个击破。

- **建议总周期**：4～8 周（请根据目标公司是中小厂还是大厂，以及自身的脱产时间灵活压缩或拉长）。
- **适用人群**：准备秋招/春招的计算机专业学生，以及 0-5 年经验准备跳槽的 Java 开发者。
- **面试突击**：下文中推荐的技术文章以 [JavaGuide](https://javaguide.cn/) 为主，非常全面且详细，如果突击面试，可以选择阅读 [JavaGuide 面试突击版](https://interview.javaguide.cn/) 中对应的文章。

### 计划总览

| 阶段                               | 建议时长              | 核心产出                                       | 自测标准                                                                      |
| ---------------------------------- | --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| **第 0 步** 前期准备               | 1～2 天               | 简历定稿、复习节奏、心态准备                   | 任选一项目，30 秒内讲清业务+你的角色，不卡壳、有重点                          |
| **第一阶段** 项目与简历深挖        | 约 1 周               | 项目卡片、必会题清单、1/3 分钟话术稿           | 脱稿讲清每项目背景+难点+你的贡献；必会题清单随机抽 3 题能答出要点             |
| **第二阶段** Java + MySQL + Redis  | 2～3 周               | 八股理解与关键词记忆（基础+集合+并发+库）      | 本站文章随机抽题，能用自己的话讲清原理与关键词，不依赖逐字背                  |
| **第三阶段** 框架                  | 1～2 周               | Spring/IoC/AOP/事务、设计模式、权限与安全      | 能说清项目对框架的使用、吃透IoC 和 AOP、事务失效场景等等                      |
| **系统设计与场景题**（接在框架后） | 按需 0.5～1 周        | 系统设计题与场景题思路（短链/秒杀/海量数据等） | 无提示口述经典设计（如短链/秒杀）的整体流程与关键取舍（存储、限流、一致性等） |
| **第四阶段** 计算机基础            | 按需 0.5～2 周        | 计网、OS、数据结构；面中大厂等加算法           | 能手写常见算法/手写题；本站文章随机抽题能答出核心机制                         |
| **第五阶段** 分布式与高并发        | 按需 1～2 周          | 分布式理论、RPC、MQ、高可用                    | 能讲清项目里用到的分布式方案（锁/ID/MQ 等）及选型理由                         |
| **第六阶段** JVM                   | 大厂/部分中厂 3～5 天 | 内存、GC、类加载、调优与排查                   | 能说清内存区域、GC 过程、类加载；能口述一次 GC 调优或 OOM 排查思路            |
| **面试前冲刺**                     | 1～2 天               | 必会题过一遍、项目话术再练、心态与设备         | 必会题清单过一遍能复述要点；每项目 1 分钟版话术练一遍不卡壳                   |

**📌 阶段调整说明：**

- 标「按需」的阶段可根据目标公司调整：面字节、快手、腾讯等**重算法厂**，请务必加强第四阶段（算法与数据结构）；
- 如果你的简历或应聘岗位明确涉及**分布式/微服务**，请系统性死磕第五阶段；
- 如果目标是阿里、美团、京东等**大厂核心部门**，请重点攻克第六阶段（JVM 底层与线上排查）。

### 第 0 步：前期准备（建议 1～2 天）

在系统刷八股前，先把「怎么准备、怎么写简历、怎么稳住心态」搞定，避免方向跑偏。

| 事项       | 说明                                    | 对应文章                                                                                                                                                                                                                                 |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 准备方法   | 明确复习节奏、自测方式、时间分配        | [如何高效准备 Java 面试？](https://javaguide.cn/interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.html)<br />[Java后端面试重点总结](https://javaguide.cn/interview-preparation/key-points-of-interview.html) |
| 简历       | 一到两页纸、项目 STAR、技术栈与岗位匹配 | [程序员简历编写指南](https://javaguide.cn/interview-preparation/resume-guide.html)                                                                                                                                                       |
| 学习路线   | 查漏补缺，确定自己当前所处阶段          | [Java 学习路线（最新版，4w+ 字）](https://javaguide.cn/interview-preparation/java-roadmap.html)                                                                                                                                          |
| 项目与经历 | 没有项目/实习时如何包装、怎么讲         | [项目经验指南](https://javaguide.cn/interview-preparation/project-experience-guide.html)<br />[校招没有实习经历怎么办？实习经历怎么写？](https://javaguide.cn/interview-preparation/internship-experience.html)                          |
| 心态       | 减少紧张、发挥更稳                      | [面试太紧张怎么办？](https://javaguide.cn/interview-preparation/how-to-handle-interview-nerves.html)                                                                                                                                     |

**核心要点**：

- **技术好≠面试能过**，必须系统准备——尽早以求职为导向学习，根据招聘要求制定技能清单。
- **掌握投递简历的黄金时间**：秋招 7-9 月，春招 3-4 月；多渠道获取招聘信息（官网、招聘网站、牛客网、内推等）。
- **花 2-3 天完善简历**，重视项目经历描述；**校招简历不超过 2 页，社招不超过 3 页**。一定要把包装润色，但也要避免简历夸大事实，面试时易被深挖暴露。
- **八股文很有意义**，日常开发也会用到；不要抱侥幸心理，打铁还需自身硬。
- **提前准备 1-2 分钟自我介绍话术**，能流畅讲出个人背景、技术栈和求职意向。
- **多多自测**，可以用 AI 辅助模拟面试，找同学朋友互相模拟面试。

### 第一阶段：项目与简历深挖（约 1 周）

**目标**：能清晰讲出每个项目的背景、你的角色、技术选型与难点，并能推导出「可能被问的面试题」。

**产出物**：

- **项目卡片**：按简历逐条过项目，为每个项目写清——业务背景、技术栈、你负责的模块、1～2 个难点与解决方式、可量化的成果（如 QPS、耗时、节省成本）。
- **必会题清单**：根据项目用到的技术，列出「必会题」（例如：用了 Redis 缓存→ Redis 常见数据结构、持久化机制、线程模型等；用了 MySQL → 索引、事务、慢 SQL 优化等）。可参考 [JavaGuide](https://javaguide.cn/) 网站中的面试题总结按项目拓展。
- **话术稿**：每个项目准备 1～2 分钟版本（自我介绍用）和 3～5 分钟版本（深挖用），能流畅讲出「为什么这么选、遇到什么问题、怎么解决的」。

**每日建议**：每天至少梳理 1 个项目 + 对应必会题，周末做一次脱稿自测（录音或对着镜子讲）。

**自测**：能脱稿讲清每个项目的背景、难点和你的贡献；必会题清单里的题能答出要点，对于大厂面试要能抗住深挖，做到举一反三。

**没有项目经验怎么办？**

1. **实战项目视频/专栏**：慕课网、哔哩哔哩、拉勾、极客时间等；选择适合自己能力的项目，不必强求微服务项目。[JavaGuide 官方知识星球](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)已经推出[⭐AI 智能面试辅助平台 + RAG 知识库](https://javaguide.cn/zhuanlan/interview-guide.html)和[手写 RPC 框架](https://javaguide.cn/zhuanlan/handwritten-rpc-framework.html)。并且，还分享了很多高频项目经历（如博客、外卖、线程池、短连接）的优化版介绍和面试准备。
2. **实战类开源项目**：JavaGuide 推荐的[优质开源实战项目](https://javaguide.cn/open-source-project/practical-project.html)；在理解基础上改进或增加功能。
3. **参加大公司组织的比赛**：阿里云天池大赛等；获奖项目含金量高。

**项目经历写作要点（STAR 法则）**：

- **Situation（情景）**：项目背景是什么？要解决什么问题？
- **Task（任务）**：你在项目中负责什么？你的角色是什么？
- **Action（行动）**：你具体做了什么？用了什么技术？遇到了什么问题？如何解决的？
- **Result（结果）**：取得了什么成果？最好量化（QPS 从 xxx 提高到 xxx，响应时间降低 xx%）

**项目介绍高频问题**：

- 技术架构直接写技术名词，不需要解释。
- 减少纯业务描述，多挖掘技术亮点，结合具体业务场景描述。
- 优化成果要量化（QPS、响应时间、成本节省等），非真实项目包装合理数值即可。
- 工作内容介绍控制在 6~8 条左右比较好，多了少了都有影响，一定要至少有 3-4 条是有技术亮点的，能吸引到面试官。
- 避免模糊性描述（如"负责开发"），要具体（技术+场景+效果）。
- 一定要包装项目，但也不要过度包装，准备时多想“如果面试官问为什么”，确保逻辑自洽。

### 第二阶段：Java 核心 + MySQL + Redis （约 2～3 周）

**优先级**：最重要的部分，面试高频考点，MySQL + Redis ≥ Java 基础/集合/并发 > 框架知识，大厂会深挖并发与底层。

**Java 基础**

- [Java 基础常见面试题总结（上）](https://javaguide.cn/java/basis/java-basic-questions-01.html)、[（中）](https://javaguide.cn/java/basis/java-basic-questions-02.html)、[（下）](https://javaguide.cn/java/basis/java-basic-questions-03.html)：语法与面向对象、字符串与拷贝、异常/泛型/反射/SPI/序列化/注解

**Java 集合**

- [Java 集合常见面试题（上）](https://javaguide.cn/java/collection/java-collection-questions-01.html)、[（下）](https://javaguide.cn/java/collection/java-collection-questions-02.html)：List/Set/Queue、HashMap、ConcurrentHashMap

**Java 并发**（大厂必深挖）

- [Java 并发常见面试题（上）](https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html)、[（中）](https://javaguide.cn/java/concurrent/java-concurrent-questions-02.html)、[（下）](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html)：线程与锁、synchronized/ReentrantLock、ThreadLocal/线程池/Future/AQS/虚拟线程
- [JMM](https://javaguide.cn/java/concurrent/jmm.html)、[线程池详解](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html)与[最佳实践](https://javaguide.cn/java/concurrent/java-thread-pool-best-practices.html)
- [ThreadLocal](https://javaguide.cn/java/concurrent/threadlocal.html)、[AQS](https://javaguide.cn/java/concurrent/aqs.html)、[CompletableFuture](https://javaguide.cn/java/concurrent/completablefuture-intro.html)、[常见并发容器](https://javaguide.cn/java/concurrent/java-concurrent-collections.html)

**MySQL**（必看）

- [MySQL 常见面试题总结](https://javaguide.cn/database/mysql/mysql-questions-01.html)（基础、引擎、事务、索引、锁、优化）
- [MySQL 索引详解](https://javaguide.cn/database/mysql/mysql-index.html)、[三大日志](https://javaguide.cn/database/mysql/mysql-logs.html)、[事务隔离级别](https://javaguide.cn/database/mysql/transaction-isolation-level.html)
- [InnoDB 对 MVCC 的实现](https://javaguide.cn/database/mysql/innodb-implementation-of-mvcc.html)、[SQL 执行过程](https://javaguide.cn/database/mysql/how-sql-executed-in-mysql.html)

**Redis**（必看）

- [Redis 常见面试题总结（上）](https://javaguide.cn/database/redis/redis-questions-01.html)、[Redis 常见面试题总结（下）](https://javaguide.cn/database/redis/redis-questions-02.html)
- [Redis 延时任务](https://javaguide.cn/database/redis/redis-delayed-task.html)、[Redis 做消息队列](https://javaguide.cn/database/redis/redis-stream-mq.html)
- [5 种基本数据类型](https://javaguide.cn/database/redis/redis-data-structures-01.html)、[3 种特殊类型](https://javaguide.cn/database/redis/redis-data-structures-02.html)、[跳表实现有序集合](https://javaguide.cn/database/redis/redis-skiplist.html)
- [持久化](https://javaguide.cn/database/redis/redis-persistence.html)、[内存碎片](https://javaguide.cn/database/redis/redis-memory-fragmentation.html)、[常见阻塞原因](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html)

**自测**：随机抽题，能用自己的话讲出来，不死记硬背，理解记忆，重点记关键词。尤其是要重点测试 MySQL 和 Redis 部分，面试考察重点中的重点。

### 第三阶段：框架和系统设计（约 1～3 周）

#### 设计模式

- [设计模式常见面试题总结](https://interview.javaguide.cn/system-design/design-pattern.html)

**自测**：掌握单例模式至少两种常见写法；代理模式、责任链模式、策略模式一定要搞懂，最好能够结合你的项目经历或者开源框架中的运用讲出来。

#### 框架

**Spring / Spring Boot**

- [Spring 常见面试题](https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html)、[SpringBoot 常见面试题](https://javaguide.cn/system-design/framework/spring/springboot-knowledge-and-questions-summary.html)
- [常用注解](https://javaguide.cn/system-design/framework/spring/spring-common-annotations.html)、[IoC 与 AOP](https://javaguide.cn/system-design/framework/spring/ioc-and-aop.html)、[Spring 事务](https://javaguide.cn/system-design/framework/spring/spring-transaction.html)
- [Spring 中的设计模式](https://javaguide.cn/system-design/framework/spring/spring-design-patterns-summary.html)、[SpringBoot 自动装配](https://javaguide.cn/system-design/framework/spring/spring-boot-auto-assembly-principles.html)、[Async 原理](https://javaguide.cn/system-design/framework/spring/async.html)（原理性知识，时间不够可跳过）
- [MyBatis 常见面试题](https://javaguide.cn/system-design/framework/mybatis/mybatis-interview.html)（不重要，可跳过，考查不多）、[Netty 常见面试题](https://javaguide.cn/system-design/framework/netty.html)（用到才需要准备）

**自测**：能说清项目里用到的 Spring 注解、IoC/AOP 在项目中的体现、事务失效场景。

**权限与安全**

- [认证授权基础](https://javaguide.cn/system-design/security/basis-of-authority-certification.html)、[JWT](https://javaguide.cn/system-design/security/jwt-intro.html) 与[优缺点](https://javaguide.cn/system-design/security/advantages-and-disadvantages-of-jwt.html)、[权限系统设计](https://javaguide.cn/system-design/security/design-of-authority-system.html)、[SSO](https://javaguide.cn/system-design/security/sso-intro.html)、[常见加密算法](https://javaguide.cn/system-design/security/encryption-algorithms.html)

#### 系统设计与场景题

面试官常会穿插一两道系统设计或场景题，考察整体思路和方案权衡。

- **系统设计 / 场景题汇总**：[系统设计常见面试题总结](https://javaguide.cn/system-design/system-design-questions.html)（付费内容在 [《后端面试高频系统设计&场景题》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html) 专栏，含短链、秒杀、海量数据处理等 30+ 道）。
- **本站可参考的设计类文章**（思路可迁移到面试口述）：[定时任务](https://javaguide.cn/system-design/schedule-task.html)、[Web 实时消息推送](https://javaguide.cn/system-design/web-real-time-message-push.html)。

![《后端面试高频系统设计&场景题》](https://oss.javaguide.cn/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

**自测**：能口述 1～2 个经典系统设计（如短链、秒杀、限流）的整体思路与关键取舍；场景题（如海量数据去重、第三方登录）能说出常见方案。

### 第四阶段：计算机基础（按目标公司安排）

**目标字节、腾讯等重算法/基础的厂**：适当多留时间，算法与代码题要单独刷（LeetCode 热题、剑指 Offer 等等）；**目标中小厂**：可压缩或后置。

- **算法与代码题**（面字节、快手等必留时间）：[剑指 Offer 题解](https://javaguide.cn/cs-basics/algorithms/the-sword-refers-to-offer.html)、LeetCode 热题 100、常见手写（如 LRU、生产者消费者、单例等）。建议每天至少 1 道，保持手感。
- **网络**：[计网常见面试题（上）](https://javaguide.cn/cs-basics/network/other-network-questions.html)、[（下）](https://javaguide.cn/cs-basics/network/other-network-questions2.html)、[访问网页全过程](https://javaguide.cn/cs-basics/network/the-whole-process-of-accessing-web-pages.html)、[应用层常见协议](https://javaguide.cn/cs-basics/network/application-layer-protocol.html)、[HTTP/HTTPS](https://javaguide.cn/cs-basics/network/http-vs-https.html)、[HTTP 1.0 vs 1.1](https://javaguide.cn/cs-basics/network/http1.0-vs-http1.1.html)、[DNS](https://javaguide.cn/cs-basics/network/dns.html)、[TCP 三次握手与四次挥手](https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html)、[TCP 可靠性](https://javaguide.cn/cs-basics/network/tcp-reliability-guarantee.html)、[ARP](https://javaguide.cn/cs-basics/network/arp.html)
- **操作系统**：[操作系统常见面试题（上）](https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-01.html)、[（下）](https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-02.html)、[Linux 基础](https://javaguide.cn/cs-basics/operating-system/linux-intro.html)
- **数据结构**：[数组/链表/栈/队列](https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html)、[图](https://javaguide.cn/cs-basics/data-structure/graph.html)、[堆](https://javaguide.cn/cs-basics/data-structure/heap.html)、[树](https://javaguide.cn/cs-basics/data-structure/tree.html)、[红黑树](https://javaguide.cn/cs-basics/data-structure/red-black-tree.html)、[布隆过滤器](https://javaguide.cn/cs-basics/data-structure/bloom-filter.html)

**自测**：能画访问网页全过程、TCP 握手挥手等等；算法题能手写常见套路；OS 进程/线程、内存、死锁能说清概念与例子。

### 第五阶段：分布式与高并发（按简历与岗位）

若简历或岗位涉及分布式/微服务/高并发，再系统过一遍；否则可只过「项目会用到的点」。

- **分布式理论**：[CAP 与 BASE](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)、[Paxos](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)、[Raft](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)、[ZAB](https://javaguide.cn/distributed-system/protocol/zab.html)、[Gossip](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html)、[一致性哈希](https://javaguide.cn/distributed-system/protocol/consistent-hashing.html)
- **RPC**：[RPC 基础](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)、[Dubbo](https://javaguide.cn/distributed-system/rpc/dubbo.html)（目前问的很少，可跳过）
- **分布式 ID / 网关 / 锁 / 事务**（项目涉及再重点看）：[分布式 ID](https://javaguide.cn/distributed-system/distributed-id.html)、[设计指南](https://javaguide.cn/distributed-system/distributed-id-design.html)、[API 网关](https://javaguide.cn/distributed-system/api-gateway.html)、[Spring Cloud Gateway](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html)、[分布式锁](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)、[分布式事务](https://javaguide.cn/distributed-system/distributed-transaction.html)
- **高并发**（项目涉及再重点看）：[CDN](https://javaguide.cn/high-performance/cdn.html)、[读写分离与分库分表](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html)、[冷热分离](https://javaguide.cn/high-performance/data-cold-hot-separation.html)、[SQL 优化](https://javaguide.cn/high-performance/sql-optimization.html)、[深度分页](https://javaguide.cn/high-performance/deep-pagination-optimization.html)、[负载均衡](https://javaguide.cn/high-performance/load-balancing.html)
- **高可用**（项目涉及再重点看）：[高可用系统设计](https://javaguide.cn/high-availability/high-availability-system-design.html)、[限流](https://javaguide.cn/high-availability/limit-request.html)、[熔断与降级](https://javaguide.cn/high-availability/fallback-and-circuit-breaker.html)、[超时与重试](https://javaguide.cn/high-availability/timeout-and-retry.html)、[幂等设计](https://javaguide.cn/high-availability/idempotency.html)、[冗余设计](https://javaguide.cn/high-availability/redundancy.html)
- **消息队列**（项目涉及再重点看）：[MQ 基础](https://javaguide.cn/high-performance/message-queue/message-queue.html)、[Disruptor](https://javaguide.cn/high-performance/message-queue/disruptor-questions.html)、[RabbitMQ](https://javaguide.cn/high-performance/message-queue/rabbitmq-questions.html)、[RocketMQ](https://javaguide.cn/high-performance/message-queue/rocketmq-questions.html)、[Kafka](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html)

**自测**：能讲清项目里用到的分布式方案（如分布式锁、ID、MQ）及选型理由；CAP/BASE、一致性哈希等能举例说明。

### 第六阶段：JVM（大厂 / 部分中厂）

目标阿里、美团、携程、顺丰、招银等可重点看；面国企或小厂可跳过。

- [Java 内存区域](https://javaguide.cn/java/jvm/memory-area.html)、[JVM 垃圾回收](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)
- [类文件结构](https://javaguide.cn/java/jvm/class-file-structure.html)、[类加载过程](https://javaguide.cn/java/jvm/class-loading-process.html)、[类加载器](https://javaguide.cn/java/jvm/classloader.html)
- 结合[星球](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)的 [常见线上问题案例](https://t.zsxq.com/0bsAac47U) 理解调优与排查（也可以参考这篇 [JVM 线上问题排查和性能调优案例](https://javaguide.cn/java/jvm/jvm-in-action.html)）

**自测**：能说清内存区域、常见 GC 器与回收过程、类加载与双亲委派；能结合项目或案例讲一次 GC 调优或 OOM 排查思路。

**Java 新特性**（按岗位要求选读）：[Java 11](https://javaguide.cn/java/new-features/java11.html)、[Java 17](https://javaguide.cn/java/new-features/java17.html)、[Java 21](https://javaguide.cn/java/new-features/java21.html)

### 面试前 1～2 天冲刺清单

临近面试时优先做这几件事，避免临时抱佛脚方向散乱：

| 事项              | 说明                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 过一遍必会题      | 重点看你第一阶段整理的「项目相关必会题」+ 简历上写的「熟练掌握」对应的考点，能口头复述要点即可。                                                        |
| 练一遍项目话术    | 每个项目 1 分钟版、3 分钟版各讲一遍，卡壳的地方记下来再顺一遍。                                                                                         |
| 目标公司/岗位倾向 | 翻一下该公司或同类型岗位的面经，看有没有偏重（如算法、计网、项目深挖），针对性过一眼。                                                                  |
| 心态与状态        | 早睡、准备好设备（线上面试）或路线（现场），可看 [面试太紧张怎么办？](https://javaguide.cn/interview-preparation/how-to-handle-interview-nerves.html)。 |

面试结束后建议做一次简短复盘：哪些题答得不好、哪些没准备到，补充进必会题清单，下一场前重点过一遍。
