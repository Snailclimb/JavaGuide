---
title: 2026 最新版 Java 后端面试通关计划（涵盖后端通用体系）
description: Java 后端面试复习计划，提供 4 周压缩版和 8 周标准版，覆盖项目与简历、Java 核心、MySQL、Redis、Spring、计算机基础、分布式、高可用与 JVM，并给出各阶段的产出和自测方法。
category: 面试准备
icon: mdi:star-outline
head:
  - - meta
    - name: keywords
      content: Java后端面试,面试准备计划,面试指南,八股文,校招,社招,项目经验,Java面试
---

把 JavaGuide 里的面试题从头看到尾，只完成了资料阅读。面试官通常从简历和项目开始问，再顺着里面的 Java、MySQL、Redis、Spring 或消息队列继续追问。只按知识库目录复习，很容易看了很多文章，轮到自己回答时仍然不知道从哪里讲起。

这份计划把项目和简历放在前面，技术知识跟着简历与目标岗位展开。计划分为 4 周压缩版和 8 周标准版，时间不够时删掉与岗位无关的扩展内容，不要把每个专题都压成走马观花。

## 先选 4 周还是 8 周

| 阶段                   | 4 周压缩版                         | 8 周标准版                        |
| ---------------------- | ---------------------------------- | --------------------------------- |
| 前期检查               | 第 1～2 天                         | 第 1～2 天                        |
| 项目与简历             | 第 1 周剩余时间                    | 第 1 周                           |
| Java、MySQL、Redis     | 第 2 周                            | 第 2～4 周                        |
| Spring 与系统设计      | 第 3 周前半段                      | 第 5 周                           |
| 计算机基础与算法       | 每天穿插，按岗位取舍               | 第 6 周集中复习，算法每天保持练习 |
| 分布式、JVM 与线上排查 | 第 3 周后半段至第 4 周，按简历选择 | 第 7 周                           |
| 模拟面试与查漏补缺     | 最后 2 天                          | 第 8 周                           |

4 周版本适合学过主要知识、现在需要集中复习的人；第一次系统学习 Java 后端知识，8 周也只是一个起点。每天能稳定拿出的时间不到 2 小时，优先选 8 周版本。已经开始投递或面试临近，可以走 4 周版本，但复习范围要跟着简历收缩：简历没有写 Kafka，岗位描述也没有相关要求，就不必在消息队列实现细节上花掉两三天。

算法不要留到最后突击。有笔试或代码题要求的岗位，从第一周开始保持练习；不考算法的岗位，把这部分时间留给项目、数据库和场景题。

## 什么程度才算会了

“看过”和“面试时能答”差得很远。同一个问题至少要经过下面三层：

| 层级       | 自测方式                                                       |
| ---------- | -------------------------------------------------------------- |
| 能回答     | 不看资料，用 30～60 秒说出结论和关键词                         |
| 能追问     | 继续解释实现原理、适用条件、常见失败方式和替代方案             |
| 能落到项目 | 说明项目中是否使用、为什么这样选、遇到过什么限制、如何验证结果 |

复习记录不必做得很复杂，保留“问题、资料链接、当前层级、没答好的点”四列即可。当天读完的内容至少做一次脱稿回答；答不上来再回原文查，不要用反复阅读代替回忆。

## 第 0 阶段：先把范围定下来

用 1～2 天完成三件事：确定目标岗位、检查简历、做一次摸底自测。

先找几份准备投递的岗位描述，记录反复出现的技能，再和简历逐项核对。复习范围主要来自两处：岗位明确要求什么，简历主动写了什么。简历上出现“熟悉 Redis”“负责订单模块”“使用 Kafka 处理异步任务”，后面就应该有对应问题和项目细节可以接住。

这一阶段至少留下四份材料：

- 一份可以投递的 PDF 简历。
- 30～60 秒的自我介绍提纲。
- 每个项目的一张项目底稿。
- 一份按优先级排列的待复习问题列表。

准备方法可以参考[如何高效准备 Java 面试？](./teach-you-how-to-prepare-for-the-interview-hand-in-hand.md)和[Java 后端面试重点总结](./key-points-of-interview.md)。

简历还没定稿时，先看[程序员简历编写指南](./resume-guide.md)；不要一边复习一边频繁往简历里增加新技术，否则复习范围会不断扩大。

## 第一阶段：项目与简历深挖

项目通常是技术追问的入口。项目讲不清，背再多组件原理也很难把回答接回自己的经历。

给每个重点项目整理下面这些内容：

| 内容       | 要回答的问题                                       |
| ---------- | -------------------------------------------------- |
| 业务背景   | 项目给谁使用，解决什么问题，核心链路是什么         |
| 个人职责   | 哪些接口、表、任务或模块由自己负责，参与到什么程度 |
| 请求链路   | 一次请求经过哪些服务、缓存、数据库和消息队列       |
| 技术选型   | 为什么采用当前方案，比较过什么，付出了什么代价     |
| 难点或故障 | 现象是什么，怎样定位、修复和验证                   |
| 项目指标   | 数据来自生产还是测试，统计口径和对照条件是什么     |
| 职责范围   | 哪些部分由其他同事或团队负责                       |

每个项目准备 30 秒和 3 分钟两个版本。30 秒版本讲业务、职责和一个重点；3 分钟版本补上核心链路、技术选型以及一个可以继续追问的问题。不要背逐字稿，记住顺序和关键词即可。具体写法见[后端项目面试怎么讲？](./backend-project-interview-guide.md)。

顺着项目里的每项技术继续列问题。例如使用 Redis 缓存商品信息，至少要准备 Key 设计、过期策略、缓存未命中、数据一致性和 Redis 不可用时的处理；写了线程池，就要能解释任务类型、核心参数、队列、拒绝策略以及下游承载能力。

项目结果可以量化，但数字必须有来源。没有生产指标时，可以在测试环境补测，并注明机器配置、数据量、并发模型和测试时长。不要给练手项目编造生产 QPS，也不要把只看过的模块写成自己负责。

没有实习或正式项目也可以准备。跟着课程完成的项目、二次开发的开源项目、课程设计和比赛项目都能写，重点是自己做过哪些改动：增加功能、调整表结构、补测试、修复缺陷或比较过不同方案。可以继续阅读[项目经验指南](./project-experience-guide.md)、[校招没有实习经历怎么办？](./internship-experience.md)和[Java 优质开源实战项目](../open-source-project/practical-project.md)。

完成这一阶段后，随机挑一个项目，脱稿回答下面四个问题：

1. 这个项目解决什么问题，你负责什么？
2. 一条核心请求怎样流转？
3. 哪个技术选择最值得解释，为什么？
4. 遇到过什么问题，结论由什么证据支持？

## 第二阶段：Java、MySQL 与 Redis

这三部分覆盖面很大，不适合平均分配时间。先做一轮随机抽题，哪个专题只能说出定义，就把时间补到哪里；已经能结合项目回答的内容只做复盘。

### Java 基础、集合与并发

先看 Java 基础、集合和并发这三组文章：

- [Java 基础常见面试题（上）](../java/basis/java-basic-questions-01.md)、[（中）](../java/basis/java-basic-questions-02.md)、[（下）](../java/basis/java-basic-questions-03.md)
- [Java 集合常见面试题（上）](../java/collection/java-collection-questions-01.md)、[（下）](../java/collection/java-collection-questions-02.md)
- [Java 并发常见面试题（上）](../java/concurrent/java-concurrent-questions-01.md)、[（中）](../java/concurrent/java-concurrent-questions-02.md)、[（下）](../java/concurrent/java-concurrent-questions-03.md)

基础部分要能解释常见概念和代码行为；集合重点放在选型、扩容、线程安全和常见误用；并发要能把线程状态、锁、JMM、ThreadLocal、线程池和异步任务串起来。简历涉及并发编程时，再深入看 [JMM](../java/concurrent/jmm.md)、[线程池详解](../java/concurrent/java-thread-pool-summary.md)、[ThreadLocal](../java/concurrent/threadlocal.md)、[AQS](../java/concurrent/aqs.md) 和 [CompletableFuture](../java/concurrent/completablefuture-intro.md)。

### MySQL

[MySQL 常见面试题总结](../database/mysql/mysql-questions-01.md)适合作为主线。读到索引、事务和锁时，再进入专题文章：

- [MySQL 索引详解](../database/mysql/mysql-index.md)
- [MySQL 三大日志](../database/mysql/mysql-logs.md)
- [事务隔离级别](../database/mysql/transaction-isolation-level.md)
- [InnoDB 对 MVCC 的实现](../database/mysql/innodb-implementation-of-mvcc.md)
- [SQL 在 MySQL 中如何执行](../database/mysql/how-sql-executed-in-mysql.md)
- [MySQL 执行计划分析](../database/mysql/mysql-query-execution-plan.md)

索引题不要停在最左匹配和索引失效。给一条项目 SQL，说明查询条件、数据分布、执行计划、扫描行数以及最终怎样修改。事务题也要能落到代码：事务范围为什么过大、哪些调用不该放在事务里、Spring 事务在哪些情况下会失效。

### Redis

先读[Redis 常见面试题（上）](../database/redis/redis-questions-01.md)和[（下）](../database/redis/redis-questions-02.md)，再根据项目选择专题：

- 数据结构：[5 种基本数据类型](../database/redis/redis-data-structures-01.md)、[3 种特殊数据类型](../database/redis/redis-data-structures-02.md)、[跳表](../database/redis/redis-skiplist.md)
- 缓存问题：[缓存基础](../database/redis/cache-basics.md)、[常见缓存读写策略](../database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- 运行与存储：[持久化](../database/redis/redis-persistence.md)、[内存碎片](../database/redis/redis-memory-fragmentation.md)、[常见阻塞原因](../database/redis/redis-common-blocking-problems-summary.md)
- 业务用法：[Redis 延时任务](../database/redis/redis-delayed-task.md)、[Redis Stream 做消息队列](../database/redis/redis-stream-mq.md)

准备 Redis 时，不要只背数据类型。从项目里挑一条真实的缓存链路，试着完整讲一遍：请求如何读取缓存，未命中后从哪里查数据，查到后怎样回填，缓存多久过期，Redis 出故障时业务怎么兜底。

复习完后，把 Java、MySQL 和 Redis 混着抽题，每类各抽 5 道。每道题先用一两句话给出结论，然后继续追问两轮：“为什么？”“项目里怎么用？”哪道题卡住，就回到对应文章补那一个知识点，不必整章重读。

## 第三阶段：Spring 与系统设计

### Spring、Spring Boot 和 MyBatis

Spring 的准备重点是项目里真实使用的功能。先看[Spring 常见面试题](../system-design/framework/spring/spring-knowledge-and-questions-summary.md)和[Spring Boot 常见面试题](../system-design/framework/spring/springboot-knowledge-and-questions-summary.md)，再补下面这些专题：

- [IoC 与 AOP](../system-design/framework/spring/ioc-and-aop.md)
- [Spring 事务](../system-design/framework/spring/spring-transaction.md)
- [Spring Boot 自动装配](../system-design/framework/spring/spring-boot-auto-assembly-principles.md)
- [Spring 中使用的设计模式](../system-design/framework/spring/spring-design-patterns-summary.md)
- [MyBatis 常见面试题](../system-design/framework/mybatis/mybatis-interview.md)

自测时不要只解释注解含义。结合项目说明 Bean 怎样创建、AOP 用在哪里、事务边界如何划分、某个事务为什么会失效，以及 MyBatis 最终执行了什么 SQL。项目没有使用 Netty、响应式编程或复杂扩展点，不必为了覆盖面临时补进简历。

### 认证、授权与常见安全问题

简历涉及登录、权限或开放接口时，准备[认证授权基础](../system-design/security/basis-of-authority-certification.md)、[JWT](../system-design/security/jwt-intro.md)、[SSO](../system-design/security/sso-intro.md)和[权限系统设计](../system-design/security/design-of-authority-system.md)。回答时讲清认证信息放在哪里、权限在什么位置校验、Token 如何失效，以及接口怎样防止越权和重复提交。

### 系统设计与场景题

系统设计题先确认需求和约束，再开始画组件。回答按这条顺序展开：

1. 明确用户规模、请求量、延迟、可用性和一致性要求。
2. 找出核心业务流程、数据模型和接口。
3. 给出能工作的基础方案。
4. 根据瓶颈增加缓存、异步、分片、限流或降级。
5. 说明失败场景、数据一致性、监控和容量验证。

入门先看[系统设计常见面试题总结](../system-design/system-design-questions.md)、[高性能系统设计面试题](../high-performance/high-performance-system-interview-questions.md)和[高可用系统设计面试题](../high-availability/high-availability-system-interview-questions.md)。短链、秒杀、海量数据处理等完整场景可参考[后端面试高频系统设计与场景题](../zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.md)。

完成后选择两个题目口述，不看现成架构图。第一次先给基础方案，面试官增加流量、故障或一致性要求后再调整，重点讲清方案为什么变化。

## 第四阶段：计算机基础与算法

计算机基础的复习深度由岗位和面试流程决定。有笔试、算法面或手写代码环节，算法需要从第一周持续练习；岗位更关注业务开发，仍要保证网络、操作系统和常见数据结构能够回答。

### 算法与数据结构

先用[算法专题](../cs-basics/algorithms/)确定范围，再练习[二分查找](../cs-basics/algorithms/binary-search.md)、[双指针与滑动窗口](../cs-basics/algorithms/two-pointers-and-sliding-window.md)、[DFS/BFS](../cs-basics/algorithms/dfs-bfs.md)、[回溯](../cs-basics/algorithms/backtracking.md)、[动态规划](../cs-basics/algorithms/dynamic-programming.md)和 [Top K](../cs-basics/algorithms/top-k.md)。

刷题时保留错题和边界条件，不追求只记模板。至少能解释时间复杂度，手写常见链表、树遍历、二分、哈希和堆相关题；简历写了某种数据结构，还要能说明它为什么适合当前场景。

### 计算机网络和操作系统

网络先过[计算机网络常见面试题（上）](../cs-basics/network/other-network-questions.md)和[（下）](../cs-basics/network/other-network-questions2.md)，再重点看[从输入 URL 到页面展示的过程](../cs-basics/network/the-whole-process-of-accessing-web-pages.md)、[HTTP 与 HTTPS](../cs-basics/network/http-vs-https.md)、[TCP 三次握手和四次挥手](../cs-basics/network/tcp-connection-and-disconnection.md)以及[TCP 如何保证可靠传输](../cs-basics/network/tcp-reliability-guarantee.md)。

操作系统以[操作系统常见面试题（上）](../cs-basics/operating-system/operating-system-basic-questions-01.md)和[（下）](../cs-basics/operating-system/operating-system-basic-questions-02.md)为主，重点检查进程与线程、虚拟内存、I/O、死锁和系统调用。不要只背定义，尝试把它们和 Java 线程、文件 I/O、网络请求、OOM 以及上下文切换联系起来。

## 第五阶段：分布式、高性能与高可用

这一阶段跟着简历和岗位走。项目是单体应用，岗位也没有分布式要求，掌握常见问题即可；简历写了微服务、消息队列、分布式锁或分库分表，对应专题就要能扛住追问。

| 简历或岗位出现的内容 | 复习入口                                                                                                                                                                                                                       | 至少准备到什么程度                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| 微服务、RPC          | [微服务面试题](../distributed-system/microservices-interview-questions.md)、[RPC 基础](../distributed-system/rpc/rpc-intro.md)                                                                                                 | 服务如何拆分，调用怎样超时和重试，故障如何隔离 |
| 网关、配置中心       | [API 网关](../distributed-system/api-gateway.md)、[分布式配置中心](../distributed-system/distributed-configuration-center.md)                                                                                                  | 请求路由、鉴权、限流、配置推送与故障处理       |
| 分布式 ID、锁、事务  | [分布式 ID](../distributed-system/distributed-id.md)、[分布式锁](../distributed-system/distributed-lock-implementations.md)、[分布式事务](../distributed-system/distributed-transaction.md)                                    | 选型条件、正确性风险、超时与失败恢复           |
| 消息队列             | [消息队列面试题](../high-performance/message-queue/message-queue-interview-questions.md)                                                                                                                                       | 发送失败、重复消费、顺序、积压和下游容量       |
| 高并发与数据库优化   | [高性能系统设计](../high-performance/high-performance-system-interview-questions.md)、[SQL 优化](../high-performance/sql-optimization.md)                                                                                      | 瓶颈位置、容量上限、缓存与异步带来的代价       |
| 稳定性建设           | [高可用系统设计](../high-availability/high-availability-system-design.md)、[超时和重试](../high-availability/timeout-and-retry.md)、[限流](../high-availability/limit-request.md)、[幂等](../high-availability/idempotency.md) | 故障怎样传播，怎样止损，临时措施有什么副作用   |

CAP、BASE、一致性哈希、Raft 等理论用来解释具体设计，不必脱离项目背成长篇定义。从项目中挑一个分布式方案，回答为什么需要、为什么这样选、失败时会怎样，以及怎样证明它真的生效。

## 第六阶段：JVM 与线上问题排查

简历写了 JVM 调优、GC 优化、OOM 排查，或者岗位强调生产问题处理，这一阶段应提前到 Java 并发之后。缺少线上经验的校招生，至少要掌握内存区域、对象回收、类加载和常见诊断思路。

先用 [JVM 常见面试题总结](../java/jvm/jvm-interview-questions.md)列出需要回答的问题，再补下面这些专题：

- [Java 内存区域](../java/jvm/memory-area.md)
- [JVM 垃圾回收](../java/jvm/jvm-garbage-collection.md)
- [类加载过程](../java/jvm/class-loading-process.md)和[类加载器](../java/jvm/classloader.md)
- [JDK 监控和故障处理工具](../java/jvm/jdk-monitoring-and-troubleshooting-tools.md)
- [Java 后端线上问题排查](../java/jvm/jvm-in-action.md)

自测不要停在“堆里放对象、栈里放局部变量”。给自己一个具体告警，例如 CPU 飙高、Full GC 频繁或 OOM，说明先确认哪些指标、怎样保留现场、使用什么工具缩小范围、哪些操作可能扩大故障，以及修复后如何验证。

## 一周内怎样安排复习

每天的时间大致分成三块：一半用来阅读和理解，四分之一脱稿回答，剩余时间练项目表达或算法。当天读了多少页不重要，至少留下一个能复述的问题和一个仍然答不好的点。

每周安排一次 30～60 分钟的模拟面试。让对方从简历开始问，项目追问后再进入 Java、数据库和场景题。没有同伴时可以录音，也可以使用 AI 模拟追问，但回答结束后仍要回到文章、代码或官方文档核对事实。

复习过程中不断增加新资料，很容易让计划失控。一个专题保留一份主线资料和少量专题文章即可；同一道题看了三份答案仍然说不出来，应该开始脱稿回答，而不是继续收藏第四份。

## 面试前 1～2 天做什么

临近面试不要再开新专题，按简历和错题收口：

| 事项       | 怎么做                                                       |
| ---------- | ------------------------------------------------------------ |
| 自我介绍   | 讲一遍 30～60 秒版本，确认经历、技术栈和求职方向一致         |
| 项目       | 每个重点项目讲一遍 30 秒和 3 分钟版本，卡住的位置立即补材料  |
| 简历技术栈 | 抽查写了“熟悉”或“掌握”的技术，确认能回答原理、限制和项目用法 |
| 高频错题   | 只复盘自己的错题和薄弱点，不重新刷完整题库                   |
| 代码与设备 | 线上面试提前检查网络、摄像头、麦克风、共享屏幕和编程环境     |
| 岗位信息   | 再看一次岗位描述，准备与岗位最相关的项目和问题               |

紧张会影响发挥时，可以参考[面试太紧张怎么办？](./how-to-handle-interview-nerves.md)。

## 面试结束后怎么复盘

面试结束后尽快记下问题，不必追求完整还原。每道没答好的题记录五项：题目、当时怎么答、缺了什么、正确依据在哪里、下次怎样回答。项目追问卡住时，还要回到项目底稿补职责、代码位置、指标口径或方案限制。

下一场面试前只看这份复盘和原来的高优先级问题。连续几场都没有被问到、简历和岗位也没有出现的扩展内容，可以降级；反复出现的问题则进入主清单。复习范围会随着真实面试逐渐收敛。
