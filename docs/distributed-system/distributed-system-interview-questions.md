---
title: 2026 最新版分布式面试题总结：CAP、RPC、分布式锁、分布式事务、分布式 ID
description: 分布式系统面试题和复习路线汇总，覆盖 CAP/BASE、Paxos、Raft、ZAB、Gossip、一致性哈希、RPC、API 网关、分布式 ID、分布式锁、分布式事务、配置中心和 ZooKeeper 等高频考点。
category: 分布式
tag:
  - 分布式
  - 面试题
  - 系统设计
head:
  - - meta
    - name: keywords
      content: 分布式面试题,分布式系统面试题,CAP面试题,BASE面试题,RPC面试题,分布式锁面试题,分布式事务面试题,分布式ID面试题,ZooKeeper面试题,Raft面试题,Paxos面试题
---

准备分布式系统面试，最容易踩的坑是把知识点背成一堆孤立概念：CAP 是一个点、RPC 是一个点、分布式锁是一个点、分布式事务又是一个点。

真正到面试里，面试官更关心的是：**你能不能把这些技术放回真实系统里，讲清楚它们解决什么问题、带来什么代价、适合什么场景**。

这篇文章是 JavaGuide 分布式系统内容的面试复习导航，不会重复搬运所有答案，而是帮你把分布式相关文章串起来，按面试准备顺序建立一条清晰路径。

## 分布式面试先抓主线

分布式系统面试通常围绕 4 条主线展开：

1. **一致性与可用性的权衡**：CAP、BASE、最终一致性、共识算法。
2. **跨节点通信与治理**：RPC、注册发现、API 网关、配置中心。
3. **分布式数据一致性问题**：分布式 ID、分布式锁、分布式事务。
4. **典型中间件与落地场景**：ZooKeeper、Dubbo、Spring Cloud Gateway 等。

其中，最重要的是：**API 网关、配置中心、分布式 ID、分布式锁和分布式事务**。这几块内容需要你花费更多的时间。

如果时间有限，建议先看面试突击版：[分布式系统常见面试题总结](https://interview.javaguide.cn/distributed-system/distributed-system.html)。它已经把面试最高频的问题整理了出来，非常适合时间有限的情况下面试突击。

如果你还有时间系统补基础，可以按下面这条路线阅读 JavaGuide 正站文章。

## 第一阶段：分布式理论与算法

分布式理论是很多系统设计题的底层语言。它不一定每天都写进代码，但会决定你回答问题时有没有“架构感”。

![分布式系统通信机制：中心化 vs 去中心化](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-centralized-vs-decentralized.png)

重点文章：

- [CAP 理论和 BASE 理论解读](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)
- [Paxos 算法解读](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [Raft 算法解读](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)
- [ZAB 协议详解](https://javaguide.cn/distributed-system/protocol/zab.html)
- [Gossip 协议详解](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html)
- [一致性哈希算法详解](https://javaguide.cn/distributed-system/protocol/consistent-hashing.html)

高频面试问题：

- CAP 是不是“三选二”？为什么说 P 在分布式系统里基本无法回避？
- BASE 和 ACID 的区别是什么？最终一致性如何落地？
- Paxos、Raft、ZAB 分别解决什么问题？为什么 Raft 更容易理解和工程实现？
- Gossip 协议为什么适合节点发现和状态传播？
- 一致性哈希解决了什么问题？虚拟节点有什么作用？

这一阶段的复习重点不是背定义，而是能说清楚：**当网络不可靠、节点会宕机、数据要多副本存储时，系统为什么必须做取舍**。

## 第二阶段：RPC 与 API 网关

微服务面试里，RPC 和 API 网关经常一起出现。RPC 关注服务之间如何调用，网关关注外部流量如何进入系统。

API 网关示意图如下：

![网关示意图](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

RPC 示意图如下：

![RPC 概览](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/rpc-overview.png)

重点文章：

- [RPC 基础常见面试题总结](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)
- [Dubbo 常见面试题总结](https://javaguide.cn/distributed-system/rpc/dubbo.html)
- [HTTP 和 RPC 有什么区别？](https://javaguide.cn/distributed-system/rpc/http&rpc.html)
- [API 网关基础知识总结](https://javaguide.cn/distributed-system/api-gateway.html)
- [Spring Cloud Gateway 常见问题总结](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html)

高频面试问题：

- RPC 和 HTTP 有什么区别？为什么服务内部调用常用 RPC？
- 一个 RPC 框架通常包含哪些核心模块？
- 服务注册与发现、负载均衡、序列化、超时重试分别解决什么问题？
- API 网关和 Nginx、负载均衡器、BFF 的边界是什么？
- Spring Cloud Gateway 的过滤器链、路由匹配、限流熔断如何理解？

这一阶段建议把“调用链路”画出来：客户端请求如何进网关，网关如何路由到服务，服务之间如何通过 RPC 调用，失败时如何超时、重试、降级。

## 第三阶段：分布式 ID、锁和事务

这部分是后端面试的高频区，也是最容易被追问工程细节的部分，一定一定要花费更多时间准备。

重点文章：

- [分布式ID介绍&实现方案总结](https://javaguide.cn/distributed-system/distributed-id.html)
- [分布式 ID 设计指南](https://javaguide.cn/distributed-system/distributed-id-design.html)
- [分布式锁介绍](https://javaguide.cn/distributed-system/distributed-lock.html)
- [分布式锁常见实现方案总结](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)
- [分布式事务解决方案总结](https://javaguide.cn/distributed-system/distributed-transaction.html)

高频面试问题：

- 为什么分库分表后不能继续依赖数据库自增 ID？
- UUID、数据库号段、Redis、Snowflake 各有什么优缺点？
- Redis 分布式锁为什么要设置过期时间？为什么要用 Lua 保证释放锁的原子性？
- Redisson 看门狗解决了什么问题？它又引入了哪些边界？
- 2PC、TCC、本地消息表、事务消息、Saga 分别适合什么场景？

准备这部分时，一定要讲“异常路径”：网络超时、锁过期、业务执行一半失败、消息重复投递、事务补偿失败。这些才是面试官真正想听的工程判断。

## 第四阶段：配置中心与 ZooKeeper

配置中心和 ZooKeeper 通常不是单独考一个大题，而是穿插在注册发现、配置变更、分布式协调、Leader 选举等问题里。

ZooKeeper 可以选择跳过，目前面试问的不多。有一种情况必须准备，那就是你的项目明确用到了或者你的技能介绍中提到了。

重点文章：

- [分布式配置中心面试题总结](https://javaguide.cn/distributed-system/distributed-configuration-center.html)
- [ZooKeeper相关概念总结(入门)](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.html)
- [ZooKeeper相关概念总结(进阶)](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.html)

高频面试问题：

- 配置中心为什么不能只是一个配置文件仓库？
- 配置变更如何推送？如何保证客户端拿到的是新配置？
- ZooKeeper 的临时节点、顺序节点、Watcher 分别能解决什么问题？
- ZooKeeper 为什么适合做分布式协调？
- ZooKeeper 和注册中心、配置中心之间是什么关系？

## 推荐复习顺序

如果你是临近面试，建议先用“高频题目定范围，再用专题文章补细节”的方式复习：

1. 先看 [分布式系统常见面试题总结](https://interview.javaguide.cn/distributed-system/distributed-system.html)，快速建立高频问题清单，知道哪些内容最容易被问到。
2. 再补理论基础：[CAP 理论和 BASE 理论解读](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)、[Raft 算法解读](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)、[一致性哈希算法详解](https://javaguide.cn/distributed-system/protocol/consistent-hashing.html)。这一步重点是理解系统为什么要在一致性、可用性和扩展性之间做取舍。
3. 然后看通信与流量入口：[RPC 基础常见面试题总结](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)、[API 网关基础知识总结](https://javaguide.cn/distributed-system/api-gateway.html)。这一步要能讲清楚一次请求从网关进入系统，再到服务之间互相调用的完整链路。
4. 最后重点啃工程落地高频题：[分布式 ID](https://javaguide.cn/distributed-system/distributed-id.html)、[分布式锁](https://javaguide.cn/distributed-system/distributed-lock.html)、[分布式事务](https://javaguide.cn/distributed-system/distributed-transaction.html)。这一步不要只背方案优缺点，更要准备异常场景和兜底策略。

如果你准备的是社招或中高级岗位，不要只背标准答案。更重要的是能把方案放进具体业务场景里，讲清楚为什么这么选、失败后怎么兜底、系统压力上来后怎么扩展。

## 面试突击版推荐

这篇文章主要是 JavaGuide 正站的分布式学习导航。如果你想直接刷高频问答，可以看我已经整理好的面试突击版： [分布式系统常见面试题总结](https://interview.javaguide.cn/distributed-system/distributed-system.html)。

面试突击版更适合临考前快速过一遍；正站文章更适合系统学习和补齐细节。两者配合使用，效果会更稳。
