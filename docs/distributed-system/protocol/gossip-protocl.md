---
title: Gossip 协议详解
category: 分布式
tag:
  - 分布式协议&算法
  - 共识算法
---

## 背景

在分布式系统中，不同的节点进行数据/信息共享是一个基本的需求。

一种比较简单粗暴的方法就是 **集中式发散消息**，简单来说就是一个主节点同时共享最新信息给其他所有节点，比较适合中心化系统。这种方法的缺陷也很明显，节点多的时候不光同步消息的效率低，还太依赖与中心节点，存在单点风险问题。

于是，**分散式发散消息** 的 **Gossip 协议** 就诞生了。

## Gossip 协议介绍

Gossip 直译过来就是闲话、流言蜚语的意思。流言蜚语有什么特点呢？容易被传播且传播速度还快，你传我我传他，然后大家都知道了。

![](./images/gossip/gossip.png)

**Gossip 协议** 也叫 Epidemic 协议（流行病协议）或者 Epidemic propagation 算法（疫情传播算法），别名很多。不过，这些名字的特点都具有 **随机传播特性** （联想一下病毒传播、癌细胞扩散等生活中常见的情景），这也正是 Gossip 协议最主要的特点。

Gossip 协议最早是在 ACM 上的一篇 1987 年发表的论文 [《Epidemic Algorithms for Replicated Database Maintenance》](https://dl.acm.org/doi/10.1145/41840.41841)中被提出的。根据论文标题，我们大概就能知道 Gossip 协议当时提出的主要应用是在分布式数据库系统中各个副本节点同步数据。

正如 Gossip 协议其名一样，这是一种随机且带有传染性的方式将信息传播到整个网络中，并在一定时间内，使得系统内的所有节点数据一致。

在 Gossip 协议下，没有所谓的中心节点，每个节点周期性地随机找一个节点互相同步彼此的信息，理论上来说，各个节点的状态最终会保持一致。

下面我们来对 Gossip 协议的定义做一个总结： **Gossip 协议是一种允许在分布式系统中共享状态的去中心化通信协议，通过这种通信协议，我们可以将信息传播给网络或集群中的所有成员。**

## Gossip 协议应用

NoSQL 数据库 Redis 和 Apache Cassandra、服务网格解决方案 Consul 等知名项目都用到了 Gossip 协议，学习 Gossip 协议有助于我们搞清很多技术的底层原理。

我们这里以 Redis Cluster 为例说明 Gossip 协议的实际应用。

我们经常使用的分布式缓存 Redis 的官方集群解决方案（3.0 版本引入） Redis Cluster 就是基于 Gossip 协议来实现集群中各个节点数据的最终一致性。

![](https://oscimg.oschina.net/oscnet/up-fcacc1eefca6e51354a5f1fc9f2919f51ec.png)

Redis Cluster 是一个典型的分布式系统，分布式系统中的各个节点需要互相通信。既然要相互通信就要遵循一致的通信协议，Redis Cluster 中的各个节点基于 **Gossip 协议** 来进行通信共享信息，每个 Redis 节点都维护了一份集群的状态信息。

Redis Cluster 的节点之间会相互发送多种 Gossip 消息：

- **MEET** ：在 Redis Cluster 中的某个 Redis 节点上执行 `CLUSTER MEET ip port` 命令，可以向指定的 Redis 节点发送一条 MEET 信息，用于将其添加进 Redis Cluster 成为新的 Redis 节点。
- **PING/PONG** ：Redis Cluster 中的节点都会定时地向其他节点发送 PING 消息，来交换各个节点状态信息，检查各个节点状态，包括在线状态、疑似下线状态 PFAIL 和已下线状态 FAIL。
- **FAIL** ：Redis Cluster 中的节点 A 发现 B 节点 PFAIL ，并且在下线报告的有效期限内集群中半数以上的节点将 B 节点标记为 PFAIL，节点 A 就会向集群广播一条 FAIL 消息，通知其他节点将故障节点 B 标记为 FAIL 。
- ......

下图就是主从架构的 Redis Cluster 的示意图，图中的虚线代表的就是各个节点之间使用 Gossip 进行通信 ，实线表示主从复制。

![](./images/gossip/redis-cluster-gossip.png)

有了 Redis Cluster 之后，不需要专门部署 Sentinel 集群服务了。Redis Cluster 相当于是内置了 Sentinel 机制，Redis Cluster 内部的各个 Redis 节点通过 Gossip 协议互相探测健康状态，在故障时可以自动切换。

关于 Redis Cluster 的详细介绍，可以查看这篇文章 [Redis 集群详解(付费)](https://javaguide.cn/database/redis/redis-cluster.html) 。

## Gossip 协议消息传播模式

Gossip 设计了两种可能的消息传播模式：**反熵（Anti-Entropy）** 和 **传谣（Rumor-Mongering）**。

### 反熵(Anti-entropy)

根据维基百科：

> 熵的概念最早起源于[物理学](https://zh.wikipedia.org/wiki/物理学)，用于度量一个热力学系统的混乱程度。熵最好理解为不确定性的量度而不是确定性的量度，因为越随机的信源的熵越大。

在这里，你可以把反熵中的熵了解为节点之间数据的混乱程度/差异性，反熵就是指消除不同节点中数据的差异，提升节点间数据的相似度，从而降低熵值。

具体是如何反熵的呢？集群中的节点，每隔段时间就随机选择某个其他节点，然后通过互相交换自己的所有数据来消除两者之间的差异，实现数据的最终一致性。

在实现反熵的时候，主要有推、拉和推拉三种方式：

- 推方式，就是将自己的所有副本数据，推给对方，修复对方副本中的熵。
- 拉方式，就是拉取对方的所有副本数据，修复自己副本中的熵。
- 推拉就是同时修复自己副本和对方副本中的熵。

伪代码如下：

![](https://oscimg.oschina.net/oscnet/up-df16e98bf71e872a7e1f01ca31cee93d77b.png)

在我们实际应用场景中，一般不会采用随机的节点进行反熵，而是需要可以的设计一个闭环。这样的话，我们能够在一个确定的时间范围内实现各个节点数据的最终一致性，而不是基于随机的概率。像 InfluxDB 就是这样来实现反熵的。

![](./images/gossip/反熵-闭环.png)

1. 节点 A 推送数据给节点 B，节点 B 获取到节点 A 中的最新数据。
2. 节点 B 推送数据给 C，节点 C 获取到节点 A，B 中的最新数据。
3. 节点 C 推送数据给 A，节点 A 获取到节点 B，C 中的最新数据。
4. 节点 A 再推送数据给 B 形成闭环，这样节点 B 就获取到节点 C 中的最新数据。

虽然反熵很简单实用，但是，节点过多或者节点动态变化的话，反熵就不太适用了。这个时候，我们想要实现最终一致性就要靠 **谣言传播(Rumor mongering)** 。

### 谣言传播(Rumor mongering)

谣言传播指的是分布式系统中的一个节点一旦有了新数据之后，就会变为活跃节点，活跃节点会周期性地联系其他节点向其发送新数据，直到所有的节点都存储了该新数据。

如下图所示（下图来自于[INTRODUCTION TO GOSSIP](https://managementfromscratch.wordpress.com/2016/04/01/introduction-to-gossip/) 这篇文章）：

![Gossip 传播示意图](./images/gossip/gossip-rumor- mongering.gif)

伪代码如下：

![](https://oss.javaguide.cn/github/javaguide/csdn/20210605170707933.png)

谣言传播比较适合节点数量比较多的情况，不过，这种模式下要尽量避免传播的信息包不能太大，避免网络消耗太大。

### 总结

- 反熵（Anti-Entropy）会传播节点的所有数据，而谣言传播（Rumor-Mongering）只会传播节点新增的数据。
- 我们一般会给反熵设计一个闭环。
- 谣言传播（Rumor-Mongering）比较适合节点数量比较多或者节点动态变化的场景。

## Gossip 协议优势和缺陷

**优势：**

1、相比于其他分布式协议/算法来说，Gossip 协议理解起来非常简单。

2、能够容忍网络上节点的随意地增加或者减少，宕机或者重启，因为 Gossip 协议下这些节点都是平等的，去中心化的。新增加或者重启的节点在理想情况下最终是一定会和其他节点的状态达到一致。

3、速度相对较快。节点数量比较多的情况下，扩散速度比一个主节点向其他节点传播信息要更快（多播）。

**缺陷** :

1、消息需要通过多个传播的轮次才能传播到整个网络中，因此，必然会出现各节点状态不一致的情况。毕竟，Gossip 协议强调的是最终一致，至于达到各个节点的状态一致需要多长时间，谁也无从得知。

2、由于拜占庭将军问题，不允许存在恶意节点。

3、可能会出现消息冗余的问题。由于消息传播的随机性，同一个节点可能会重复收到相同的消息。

## 总结

- Gossip 协议是一种允许在分布式系统中共享状态的通信协议，通过这种通信协议，我们可以将信息传播给网络或集群中的所有成员。
- Gossip 协议被 Redis 、Apache Cassandra、Consul 等项目应用。
- 谣言传播（Rumor-Mongering）比较适合节点数量比较多或者节点动态变化的场景。

## 参考

- 一万字详解 Redis Cluster Gossip 协议：https://segmentfault.com/a/1190000038373546
- 《分布式协议与算法实战》
- 《Redis 设计与实现》
