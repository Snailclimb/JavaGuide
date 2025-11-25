---
title: CAP & BASE理论详解
category: 分布式
tag:
  - 分布式理论
---

经历过技术面试的小伙伴想必对 CAP & BASE 这个两个理论已经再熟悉不过了！

我当年参加面试的时候，不夸张地说，只要问到分布式相关的内容，面试官几乎是必定会问这两个分布式相关的理论。一是因为这两个分布式基础理论是学习分布式知识的必备前置基础，二是因为很多面试官自己比较熟悉这两个理论（方便提问）。

我们非常有必要将这两个理论搞懂，并且能够用自己的理解给别人讲出来。

## CAP 理论

[CAP 理论/定理](https://zh.wikipedia.org/wiki/CAP%E5%AE%9A%E7%90%86)起源于 2000 年，由加州大学伯克利分校的 Eric Brewer 教授在分布式计算原理研讨会（PODC）上提出，因此 CAP 定理又被称作 **布鲁尔定理（Brewer’s theorem）**

2 年后，麻省理工学院的 Seth Gilbert 和 Nancy Lynch 发表了布鲁尔猜想的证明，CAP 理论正式成为分布式领域的定理。

### 简介

**CAP** 也就是 **Consistency（一致性）**、**Availability（可用性）**、**Partition Tolerance（分区容错性）** 这三个单词首字母组合。

![](https://oss.javaguide.cn/2020-11/cap.png)

CAP 理论的提出者布鲁尔在提出 CAP 猜想的时候，并没有详细定义 **Consistency**、**Availability**、**Partition Tolerance** 三个单词的明确定义。

因此，对于 CAP 的民间解读有很多，一般比较被大家推荐的是下面 👇 这种版本的解读。

在理论计算机科学中，CAP 定理（CAP theorem）指出对于一个分布式系统来说，当设计读写操作时，只能同时满足以下三点中的两个：

- **一致性（Consistency）** : 所有节点访问同一份最新的数据副本
- **可用性（Availability）**: 非故障的节点在合理的时间内返回合理的响应（不是错误或者超时的响应）。
- **分区容错性（Partition Tolerance）** : 分布式系统出现网络分区的时候，仍然能够对外提供服务。

**什么是网络分区？**

分布式系统中，多个节点之间的网络本来是连通的，但是因为某些故障（比如部分节点网络出了问题）某些节点之间不连通了，整个网络就分成了几块区域，这就叫 **网络分区**。

![partition-tolerance](https://oss.javaguide.cn/2020-11/partition-tolerance.png)

### 不是所谓的“3 选 2”

大部分人解释这一定律时，常常简单的表述为：“一致性、可用性、分区容忍性三者你只能同时达到其中两个，不可能同时达到”。实际上这是一个非常具有误导性质的说法，而且在 CAP 理论诞生 12 年之后，CAP 之父也在 2012 年重写了之前的论文。

> **当发生网络分区的时候，如果我们要继续服务，那么强一致性和可用性只能 2 选 1。也就是说当网络分区之后 P 是前提，决定了 P 之后才有 C 和 A 的选择。也就是说分区容错性（Partition tolerance）我们是必须要实现的。**
>
> 简而言之就是：CAP 理论中分区容错性 P 是一定要满足的，在此基础上，只能满足可用性 A 或者一致性 C。

因此，**分布式系统理论上不可能选择 CA 架构，只能选择 CP 或者 AP 架构。** 比如 ZooKeeper、HBase 就是 CP 架构，Cassandra、Eureka 就是 AP 架构，Nacos 不仅支持 CP 架构也支持 AP 架构。

**为啥不可能选择 CA 架构呢？** 举个例子：若系统出现“分区”，系统中的某个节点在进行写操作。为了保证 C， 必须要禁止其他节点的读写操作，这就和 A 发生冲突了。如果为了保证 A，其他节点的读写操作正常的话，那就和 C 发生冲突了。

**选择 CP 还是 AP 的关键在于当前的业务场景，没有定论，比如对于需要确保强一致性的场景如银行一般会选择保证 CP 。**

另外，需要补充说明的一点是：**如果网络分区正常的话（系统在绝大部分时候所处的状态），也就说不需要保证 P 的时候，C 和 A 能够同时保证。**

### CAP 实际应用案例

我这里以注册中心来探讨一下 CAP 的实际应用。考虑到很多小伙伴不知道注册中心是干嘛的，这里简单以 Dubbo 为例说一说。

下图是 Dubbo 的架构图。**注册中心 Registry 在其中扮演了什么角色呢？提供了什么服务呢？**

注册中心负责服务地址的注册与查找，相当于目录服务，服务提供者和消费者只在启动时与注册中心交互，注册中心不转发请求，压力较小。

![](https://oss.javaguide.cn/2020-11/dubbo-architecture.png)

常见的可以作为注册中心的组件有：ZooKeeper、Eureka、Nacos...。

1. **ZooKeeper 保证的是 CP。** 任何时刻对 ZooKeeper 的读请求都能得到一致性的结果，但是， ZooKeeper 不保证每次请求的可用性比如在 Leader 选举过程中或者半数以上的机器不可用的时候服务就是不可用的。
2. **Eureka 保证的则是 AP。** Eureka 在设计的时候就是优先保证 A （可用性）。在 Eureka 中不存在什么 Leader 节点，每个节点都是一样的、平等的。因此 Eureka 不会像 ZooKeeper 那样出现选举过程中或者半数以上的机器不可用的时候服务就是不可用的情况。 Eureka 保证即使大部分节点挂掉也不会影响正常提供服务，只要有一个节点是可用的就行了。只不过这个节点上的数据可能并不是最新的。
3. **Nacos 不仅支持 CP 也支持 AP。**

**🐛 修正（参见：[issue#1906](https://github.com/Snailclimb/JavaGuide/issues/1906)）**：

ZooKeeper 通过可线性化（Linearizable）写入、全局 FIFO 顺序访问等机制来保障数据一致性。多节点部署的情况下， ZooKeeper 集群处于 Quorum 模式。Quorum 模式下的 ZooKeeper 集群， 是一组 ZooKeeper 服务器节点组成的集合，其中大多数节点必须同意任何变更才能被视为有效。

由于 Quorum 模式下的读请求不会触发各个 ZooKeeper 节点之间的数据同步，因此在某些情况下还是可能会存在读取到旧数据的情况，导致不同的客户端视图上看到的结果不同，这可能是由于网络延迟、丢包、重传等原因造成的。ZooKeeper 为了解决这个问题，提供了 Watcher 机制和版本号机制来帮助客户端检测数据的变化和版本号的变更，以保证数据的一致性。

### 总结

在进行分布式系统设计和开发时，我们不应该仅仅局限在 CAP 问题上，还要关注系统的扩展性、可用性等等

在系统发生“分区”的情况下，CAP 理论只能满足 CP 或者 AP。要注意的是，这里的前提是系统发生了“分区”

如果系统没有发生“分区”的话，节点间的网络连接通信正常的话，也就不存在 P 了。这个时候，我们就可以同时保证 C 和 A 了。

总结：**如果系统发生“分区”，我们要考虑选择 CP 还是 AP。如果系统没有发生“分区”的话，我们要思考如何保证 CA 。**

### 推荐阅读

1. [CAP 定理简化](https://medium.com/@ravindraprasad/cap-theorem-simplified-28499a67eab4) （英文，有趣的案例）
2. [神一样的 CAP 理论被应用在何方](https://juejin.im/post/6844903936718012430) （中文，列举了很多实际的例子）
3. [请停止呼叫数据库 CP 或 AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html) （英文，带给你不一样的思考）

## BASE 理论

[BASE 理论](https://dl.acm.org/doi/10.1145/1394127.1394128)起源于 2008 年， 由 eBay 的架构师 Dan Pritchett 在 ACM 上发表。

### 简介

**BASE** 是 **Basically Available（基本可用）**、**Soft-state（软状态）** 和 **Eventually Consistent（最终一致性）** 三个短语的缩写。BASE 理论是对 CAP 中一致性 C 和可用性 A 权衡的结果，其来源于对大规模互联网系统分布式实践的总结，是基于 CAP 定理逐步演化而来的，它大大降低了我们对系统的要求。

### BASE 理论的核心思想

即使无法做到强一致性，但每个应用都可以根据自身业务特点，采用适当的方式来使系统达到最终一致性。

> That is to say, data consistency is sacrificed to meet the high availability of the system. When part of the data in the system is unavailable or inconsistent, the entire system still needs to be kept "mainly available".

**BASE theory is essentially an extension and supplement to CAP, more specifically, a supplement to the AP scheme in CAP. **

**Why do you say this? **

We have also said this in the CAP theory section:

> If the system is not "partitioned" and the network connection communication between nodes is normal, there will be no P. At this time, we can guarantee C and A at the same time. Therefore, if the system is "partitioned", we need to consider whether to choose CP or AP. If the system is not "partitioned", we need to think about how to ensure CA. **

Therefore, the AP scheme only gives up consistency when the system is partitioned, rather than giving up consistency forever. After recovery from a partition failure, the system should reach eventual consistency. This is actually where BASE theory extends.

### Three elements of BASE theory

![Three elements of BASE theory](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAxOC81LzI0LzE2MzkxNDgwNmQ5ZTE1YzY?x-oss-process=image/format,png)

#### Basically available

Basic availability means that the distributed system is allowed to lose part of its availability when unpredictable failures occur. However, this is by no means equivalent to the system being unavailable.

**What does it mean to allow partial loss of availability? **

- **Loss in response time**: Under normal circumstances, it takes 0.5s to process a user request and return a result, but due to a system failure, the time to process a user request becomes 3 s.
- **Loss of system functions**: Under normal circumstances, users can use all functions of the system, but due to a sudden increase in system visits, some non-core functions of the system cannot be used.

#### Soft state

Soft state refers to allowing the data in the system to exist in an intermediate state (**data inconsistency in CAP theory**), and believing that the existence of this intermediate state will not affect the overall availability of the system, that is, allowing the system to have a delay in the process of data synchronization between data copies of different nodes.

####Eventual consistency

Eventual consistency emphasizes that all data copies in the system can eventually reach a consistent state after a period of synchronization. Therefore, the essence of eventual consistency is that the system needs to ensure that the final data can be consistent, but it does not need to ensure the strong consistency of the system data in real time.

> 3 levels of distributed consistency:
>
> 1. **Strong consistency**: Whatever the system writes is what is read out.
> 2. **Weak consistency**: It is not necessarily possible to read the latest written value, nor is it guaranteed that the data read after a certain amount of time will be the latest, but it will try to ensure that the data is consistent at a certain moment.
> 3. **Eventual Consistency**: An upgraded version of weak consistency. The system will ensure that data is consistent within a certain period of time.
>
> **The industry recommends the ultimate consistency level, but in some scenarios that have very strict data consistency requirements, such as bank transfers, strong consistency must be ensured. **

So what is the specific way to achieve eventual consistency? ["Distributed Protocols and Algorithms in Practice"] (http://gk.link/a/10rZM) is introduced like this:

> - **Repair while reading**: When reading data, detect data inconsistencies and repair them. For example, Cassandra's Read Repair implementation. Specifically, when querying data from the Cassandra system, if it detects that the replica data on different nodes is inconsistent, the system will automatically repair the data.
> - **Repair on write**: When writing data and detecting data inconsistencies, repair them. For example, Cassandra’s Hinted Handoff implementation. Specifically, when writing data remotely between nodes in the Cassandra cluster, if the writing fails, the data will be cached and then retransmitted regularly to repair data inconsistencies.
> - **Asynchronous Repair**: This is the most commonly used method, which detects the consistency of the copy data through regular reconciliation and repairs it.

**Repair on write** is recommended. This method has lower performance consumption.

### Summary

**ACID is the theory of database transaction integrity, CAP is the distributed system design theory, and BASE is an extension of the AP scheme in the CAP theory. **

<!-- @include: @article-footer.snippet.md -->