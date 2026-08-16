---
title: 2026 最新分布式系统面试题总结：CAP、Raft、RPC、分布式锁、事务与 ID
description: 2026 最新分布式系统面试题和复习路线汇总，覆盖 CAP、BASE、中心化与去中心化、Paxos、Raft、ZAB、Gossip、一致性哈希、RPC、API 网关、分布式 ID、分布式锁、分布式事务、配置中心和 ZooKeeper 等高频考点。
category: 分布式
tag:
  - 分布式
  - 面试题
  - 系统设计
head:
  - - meta
    - name: keywords
      content: 分布式面试题,分布式系统面试题,中心化,去中心化,CAP 面试题,BASE 面试题,RPC 面试题,API 网关面试题,分布式锁面试题,分布式事务面试题,分布式 ID 面试题,ZooKeeper 面试题,Raft 面试题,Paxos 面试题
---

分布式系统面试很少让你单独背一个 CAP 定义。面试官通常会从某个业务问题开始追问：服务为什么要拆到多个节点？网络超时后能不能重试？锁提前过期怎么办？跨服务的数据如何保持一致？

这篇文章是 JavaGuide 分布式系统专题的复习入口，按分布式理论、RPC 与网关、分布式 ID/锁/事务、配置中心与 ZooKeeper 四部分整理。每部分只列复习时需要抓住的问题，答案和实现细节放在对应专题文章中。

时间比较紧的话，可以先看 [分布式系统常见面试题总结](https://interview.javaguide.cn/distributed-system/distributed-system.html)，把不会的问题标出来，再回到本文补原理和工程细节。

## 复习时先抓住哪些问题？

| 模块         | 需要讲清楚的内容                                         | 常见追问方向                                             |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| 分布式理论   | 节点和网络都不可靠时，系统怎样在一致性与可用性之间取舍   | CAP、BASE、共识算法、Gossip、一致性哈希                  |
| RPC 与网关   | 请求怎样进入系统，服务之间又怎样完成调用                 | 注册发现、负载均衡、序列化、超时重试、路由和限流         |
| ID、锁与事务 | 多个节点同时读写数据时，怎样控制唯一性、互斥和业务一致性 | Snowflake、Redis 锁、2PC、TCC、事务消息、Saga            |
| 配置与协调   | 节点怎样发现配置变化并协同工作                           | 配置推送、版本管理、ZooKeeper 节点、Watcher、Leader 选举 |

回答这些问题时，不要停在“方案有哪些”。至少还要说明选型条件、失败时会发生什么，以及项目里准备了哪些兜底措施。

## 分布式理论与算法

先设想一个最常见的场景：同一份数据存了多个副本，节点可能宕机，节点之间的网络也可能中断。CAP、BASE 和共识算法讨论的，都是这个场景里的选择与约束。

![分布式系统通信机制：中心化 vs 去中心化](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-centralized-vs-decentralized.png)

相关内容：

- [CAP 理论和 BASE 理论解读](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)
- [分布式协调详解](https://javaguide.cn/distributed-system/protocol/centralized-and-decentralized.html)
- [Paxos 算法解读](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [Raft 算法解读](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)
- [ZAB 协议详解](https://javaguide.cn/distributed-system/protocol/zab.html)
- [Gossip 协议详解](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html)
- [一致性哈希算法详解](https://javaguide.cn/distributed-system/protocol/consistent-hashing.html)

常见面试题：

- CAP 是不是“三选二”？为什么说 P 在分布式系统里基本无法回避？
- BASE 和 ACID 的区别是什么？最终一致性如何落地？
- 中心化和去中心化有什么区别？Leader 单点、脑裂、多数派、Gossip 分别怎么理解？
- Paxos、Raft、ZAB 分别解决什么问题？Raft 为什么更容易理解和实现？
- Gossip 协议为什么适合节点发现和状态传播？
- 一致性哈希解决了什么问题？虚拟节点有什么作用？

这一部分要能连起来回答：网络分区发生后，系统还能提供什么能力；多个副本出现分歧时，谁来决定最终结果；节点增减后，数据如何重新分布。只背算法步骤，遇到场景追问时通常不够用。

## RPC 与 API 网关

RPC 处理服务之间的调用，API 网关承接外部请求。复习时可以沿着一次请求往下讲：请求先经过网关完成鉴权、路由或限流，再进入具体服务；服务之间通过 RPC 继续调用，注册发现、负载均衡、序列化和超时控制都在这条链路上发挥作用。

API 网关示意图如下：

![网关示意图](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

RPC 示意图如下：

![RPC 概览](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/rpc-overview.png)

相关内容：

- [微服务面试题总结](https://javaguide.cn/distributed-system/microservices-interview-questions.html)
- [RPC 基础常见面试题总结](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)
- [Dubbo 常见面试题总结](https://javaguide.cn/distributed-system/rpc/dubbo.html)
- [HTTP 和 RPC 有什么区别？](https://javaguide.cn/distributed-system/rpc/http&rpc.html)
- [API 网关基础知识总结](https://javaguide.cn/distributed-system/api-gateway.html)
- [Spring Cloud Gateway 常见问题总结](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html)

常见面试题：

- RPC 和 HTTP 有什么区别？为什么服务内部调用常用 RPC？
- 一个 RPC 框架通常包含哪些核心模块？
- 服务注册与发现、负载均衡、序列化、超时重试分别解决什么问题？
- API 网关和 Nginx、负载均衡器、BFF 的边界是什么？
- Spring Cloud Gateway 如何完成路由匹配？过滤器链、限流和熔断分别在哪个环节生效？

这组题最好配合调用链路来回答。尤其是超时和重试，不能只说“失败后重试”：读请求和写请求的处理不同，多层重试还可能放大流量，写请求则要先考虑幂等和结果不确定。

## 分布式 ID、锁和事务

订单号怎么生成、多个实例如何争抢同一资源、一次业务跨越多个服务后怎样处理部分成功，这三个问题分别对应分布式 ID、分布式锁和分布式事务。它们在后端面试中经常结合项目继续追问，需要留出更多复习时间。

相关内容：

- [分布式ID介绍&实现方案总结](https://javaguide.cn/distributed-system/distributed-id.html)
- [分布式 ID 设计指南](https://javaguide.cn/distributed-system/distributed-id-design.html)
- [分布式锁介绍](https://javaguide.cn/distributed-system/distributed-lock.html)
- [分布式锁常见实现方案总结](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)
- [分布式事务解决方案总结](https://javaguide.cn/distributed-system/distributed-transaction.html)

常见面试题：

- 为什么分库分表后不能继续依赖数据库自增 ID？
- UUID、数据库号段、Redis、Snowflake 各有什么优缺点？
- Redis 分布式锁为什么要设置过期时间？为什么要用 Lua 保证释放锁的原子性？
- Redisson 看门狗解决了什么问题？哪些情况下锁仍然可能失效？
- 2PC、TCC、本地消息表、事务消息、Saga 分别适合什么场景？

准备答案时，把异常情况放进方案里一起讲：时钟回拨会不会影响 ID，锁过期后原持有者是否仍在执行，消息重复投递怎样处理，补偿操作失败后由谁接管。工程方案的差异，往往就藏在这些地方。

## 配置中心与 ZooKeeper

配置中心通常和配置变更、客户端推拉、版本管理一起问；ZooKeeper 则容易出现在注册发现、分布式协调和 Leader 选举等问题里。

如果简历和项目没有使用 ZooKeeper，可以降低这部分的复习优先级。只要简历写了 ZooKeeper，就要准备临时节点、顺序节点、Watcher、会话机制以及典型应用，不能只回答“它可以做分布式锁”。

相关内容：

- [分布式配置中心面试题总结](https://javaguide.cn/distributed-system/distributed-configuration-center.html)
- [ZooKeeper相关概念总结(入门)](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.html)
- [ZooKeeper相关概念总结(进阶)](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.html)

常见面试题：

- 配置中心为什么不能只是一个配置文件仓库？
- 配置变更如何推送？如何保证客户端拿到的是新配置？
- ZooKeeper 的临时节点、顺序节点、Watcher 分别能解决什么问题？
- ZooKeeper 为什么适合做分布式协调？
- ZooKeeper 和注册中心、配置中心之间是什么关系？

## 按准备时间安排复习

| 剩余时间 | 建议安排                                                                                                                                              | 复习目标                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1～2 天  | 先过一遍 [分布式系统常见面试题总结](https://interview.javaguide.cn/distributed-system/distributed-system.html)，优先补分布式 ID、锁、事务、RPC 和网关 | 高频问题能给出完整回答，知道各方案最主要的限制 |
| 3～7 天  | 在高频题之外，补 CAP/BASE、Raft、一致性哈希，并画出网关到 RPC 服务的调用链路                                                                          | 能解释方案背后的取舍，遇到追问不会停在定义上   |
| 1 周以上 | 按本文顺序阅读专题文章，再结合自己的项目整理异常案例和选型依据                                                                                        | 能从业务约束讲到方案、故障处理和扩展方式       |

社招和中高级岗位还要把答案落回自己的项目。面试官问“为什么用 Redis 分布式锁”时，通用优缺点只是开头，接下来往往会问：锁保护了什么资源、并发量有多大、超时和续期怎样处理、释放失败如何发现。没有实际使用过的方案，按学习和调研结果回答即可，不要编造项目数据。

<!-- @include: @article-footer.snippet.md -->
