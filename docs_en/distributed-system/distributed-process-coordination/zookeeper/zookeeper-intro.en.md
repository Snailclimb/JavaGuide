---
title: ZooKeeper相关概念总结(入门)
category: 分布式
tag:
  - ZooKeeper
---

相信大家对 ZooKeeper 应该不算陌生。但是你真的了解 ZooKeeper 到底有啥用不？如果别人/面试官让你给他讲讲对于 ZooKeeper 的认识，你能回答到什么地步呢？

拿我自己来说吧！我本人在大学曾经使用 Dubbo 来做分布式项目的时候，使用了 ZooKeeper 作为注册中心。为了保证分布式系统能够同步访问某个资源，我还使用 ZooKeeper 做过分布式锁。另外，我在学习 Kafka 的时候，知道 Kafka 很多功能的实现依赖了 ZooKeeper。

前几天，总结项目经验的时候，我突然问自己 ZooKeeper 到底是个什么东西？想了半天，脑海中只是简单的能浮现出几句话：

1. ZooKeeper 可以被用作注册中心、分布式锁；
2. ZooKeeper 是 Hadoop 生态系统的一员；
3. 构建 ZooKeeper 集群的时候，使用的服务器最好是奇数台。

由此可见，我对于 ZooKeeper 的理解仅仅是停留在了表面。

所以，通过本文，希望带大家稍微详细的了解一下 ZooKeeper 。如果没有学过 ZooKeeper ，那么本文将会是你进入 ZooKeeper 大门的垫脚砖。如果你已经接触过 ZooKeeper ，那么本文将带你回顾一下 ZooKeeper 的一些基础概念。

另外，本文不光会涉及到 ZooKeeper 的一些概念，后面的文章会介绍到 ZooKeeper 常见命令的使用以及使用 Apache Curator 作为 ZooKeeper 的客户端。

_如果文章有任何需要改善和完善的地方，欢迎在评论区指出，共同进步！_

## ZooKeeper 介绍

### ZooKeeper 由来

正式介绍 ZooKeeper 之前，我们先来看看 ZooKeeper 的由来，还挺有意思的。

下面这段内容摘自《从 Paxos 到 ZooKeeper》第四章第一节，推荐大家阅读一下：

> ZooKeeper 最早起源于雅虎研究院的一个研究小组。在当时，研究人员发现，在雅虎内部很多大型系统基本都需要依赖一个类似的系统来进行分布式协调，但是这些系统往往都存在分布式单点问题。所以，雅虎的开发人员就试图开发一个通用的无单点问题的分布式协调框架，以便让开发人员将精力集中在处理业务逻辑上。
>
> 关于“ZooKeeper”这个项目的名字，其实也有一段趣闻。在立项初期，考虑到之前内部很多项目都是使用动物的名字来命名的（例如著名的 Pig 项目),雅虎的工程师希望给这个项目也取一个动物的名字。时任研究院的首席科学家 RaghuRamakrishnan 开玩笑地说：“在这样下去，我们这儿就变成动物园了！”此话一出，大家纷纷表示就叫动物园管理员吧一一一因为各个以动物命名的分布式组件放在一起，雅虎的整个分布式系统看上去就像一个大型的动物园了，而 ZooKeeper 正好要用来进行分布式环境的协调一一于是，ZooKeeper 的名字也就由此诞生了。

### ZooKeeper 概览

ZooKeeper 是一个开源的**分布式协调服务**，它的设计目标是将那些复杂且容易出错的分布式一致性服务封装起来，构成一个高效可靠的原语集，并以一系列简单易用的接口提供给用户使用。

> **原语：** 操作系统或计算机网络用语范畴。是由若干条指令组成的，用于完成一定功能的一个过程。具有不可分割性，即原语的执行必须是连续的，在执行过程中不允许被中断。

ZooKeeper 为我们提供了高可用、高性能、稳定的分布式数据一致性解决方案，通常被用于实现诸如数据发布/订阅、负载均衡、命名服务、分布式协调/通知、集群管理、Master 选举、分布式锁和分布式队列等功能。这些功能的实现主要依赖于 ZooKeeper 提供的 **数据存储+事件监听** 功能（后文会详细介绍到） 。

ZooKeeper 将数据保存在内存中，性能是不错的。 在“读”多于“写”的应用程序中尤其地高性能，因为“写”会导致所有的服务器间同步状态。（“读”多于“写”是协调服务的典型场景）。

另外，很多顶级的开源项目都用到了 ZooKeeper，比如：

- **Kafka** : ZooKeeper 主要为 Kafka 提供 Broker 和 Topic 的注册以及多个 Partition 的负载均衡等功能。不过，在 Kafka 2.8 之后，引入了基于 Raft 协议的 KRaft 模式，不再依赖 Zookeeper，大大简化了 Kafka 的架构。
- **Hbase** : ZooKeeper 为 Hbase 提供确保整个集群只有一个 Master 以及保存和提供 regionserver 状态信息（是否在线）等功能。
- **Hadoop** : ZooKeeper 为 Namenode 提供高可用支持。

### ZooKeeper 特点

- **顺序一致性：** 从同一客户端发起的事务请求，最终将会严格地按照顺序被应用到 ZooKeeper 中去。
- **原子性：** 所有事务请求的处理结果在整个集群中所有机器上的应用情况是一致的，也就是说，要么整个集群中所有的机器都成功应用了某一个事务，要么都没有应用。
- **单一系统映像：** 无论客户端连到哪一个 ZooKeeper 服务器上，其看到的服务端数据模型都是一致的。
- **可靠性：** 一旦一次更改请求被应用，更改的结果就会被持久化，直到被下一次更改覆盖。
- **实时性：** 一旦数据发生变更，其他节点会实时感知到。每个客户端的系统视图都是最新的。
- **集群部署**：3~5 台（最好奇数台）机器就可以组成一个集群，每台机器都在内存保存了 ZooKeeper 的全部数据，机器之间互相通信同步数据，客户端连接任何一台机器都可以。
- **高可用：**如果某台机器宕机，会保证数据不丢失。集群中挂掉不超过一半的机器，都能保证集群可用。比如 3 台机器可以挂 1 台，5 台机器可以挂 2 台。

### ZooKeeper 应用场景

ZooKeeper 概览中，我们介绍到使用其通常被用于实现诸如数据发布/订阅、负载均衡、命名服务、分布式协调/通知、集群管理、Master 选举、分布式锁和分布式队列等功能。

下面选 3 个典型的应用场景来专门说说：

1. **命名服务**：可以通过 ZooKeeper 的顺序节点生成全局唯一 ID。
2. **数据发布/订阅**：通过 **Watcher 机制** 可以很方便地实现数据发布/订阅。当你将数据发布到 ZooKeeper 被监听的节点上，其他机器可通过监听 ZooKeeper 上节点的变化来实现配置的动态更新。
3. **分布式锁**：通过创建唯一节点获得分布式锁，当获得锁的一方执行完相关代码或者是挂掉之后就释放锁。分布式锁的实现也需要用到 **Watcher 机制** ，我在 [分布式锁详解](https://javaguide.cn/distributed-system/distributed-lock.html) 这篇文章中有详细介绍到如何基于 ZooKeeper 实现分布式锁。

实际上，这些功能的实现基本都得益于 ZooKeeper 可以保存数据的功能，但是 ZooKeeper 不适合保存大量数据，这一点需要注意。

## ZooKeeper 重要概念

_破音：拿出小本本，下面的内容非常重要哦！_

### Data model（数据模型）

ZooKeeper 数据模型采用层次化的多叉树形结构，每个节点上都可以存储数据，这些数据可以是数字、字符串或者是二进制序列。并且。每个节点还可以拥有 N 个子节点，最上层是根节点以“/”来代表。每个数据节点在 ZooKeeper 中被称为 **znode**，它是 ZooKeeper 中数据的最小单元。并且，每个 znode 都有一个唯一的路径标识。

强调一句：**ZooKeeper 主要是用来协调服务的，而不是用来存储业务数据的，所以不要放比较大的数据在 znode 上，ZooKeeper 给出的每个节点的数据大小上限是 1M 。**

从下图可以更直观地看出：ZooKeeper 节点路径标识方式和 Unix 文件系统路径非常相似，都是由一系列使用斜杠"/"进行分割的路径表示，开发人员可以向这个节点中写入数据，也可以在节点下面创建子节点。这些操作我们后面都会介绍到。

![ZooKeeper 数据模型](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/znode-structure.png)

### znode（数据节点）

介绍了 ZooKeeper 树形数据模型之后，我们知道每个数据节点在 ZooKeeper 中被称为 **znode**，它是 ZooKeeper 中数据的最小单元。你要存放的数据就放在上面，是你使用 ZooKeeper 过程中经常需要接触到的一个概念。

我们通常是将 znode 分为 4 大类：

- **持久（PERSISTENT）节点**：一旦创建就一直存在即使 ZooKeeper 集群宕机，直到将其删除。
- **Temporary (EPHEMERAL) node**: The life cycle of the temporary node is bound to the **client session (session)**. **When the session disappears, the node disappears**. Moreover, **temporary nodes can only be used as leaf nodes** and cannot create child nodes.
- **Persistent Sequence (PERSISTENT_SEQUENTIAL) node**: In addition to the characteristics of the persistent (PERSISTENT) node, the names of child nodes are also sequential. For example `/node1/app0000000001`, `/node1/app0000000002`.
- **Temporary Sequential (EPHEMERAL_SEQUENTIAL) Node**: In addition to having the characteristics of temporary (EPHEMERAL) nodes, the names of child nodes also have sequential properties.

Each znode consists of 2 parts:

- **stat**: status information
- **data**: The specific content of the data stored in the node

As shown below, I use the get command to obtain the contents of the dubbo node in the root directory. (The get command will be introduced below).

```shell
[zk: 127.0.0.1:2181(CONNECTED) 6] get /dubbo
#The data content associated with this data node is empty
null
#The following is some status information of the data node, which is actually the formatted output of the Stat object.
cZxid = 0x2
ctime = Tue Nov 27 11:05:34 CST 2018
mZxid = 0x2
mtime = Tue Nov 27 11:05:34 CST 2018
pZxid = 0x3
cversion=1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 1
```

The Stat class contains fields for all status information of a data node, including transaction ID (cZxid), node creation time (ctime), number of child nodes (numChildren), etc.

Let’s take a look at what each znode status information actually represents! (The following content comes from "From Paxos to ZooKeeper Distributed Consistency Principles and Practices", because the Guide is indeed not particularly clear, so you need to learn the reference materials!):

| znode status information | explanation |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| cZxid | create ZXID, which is the transaction id when the data node was created |
| ctime | create time, that is, the creation time of the node |
| mZxid | modified ZXID, which is the transaction id when the node was last updated |
| mtime | modified time, which is the last update time of the node |
| pZxid | The transaction id when the node's child node list was last modified. Only changes in the child node list will update pZxid, and changes in the child node content will not be updated |
| cversion | The version number of the child node, the value increases by 1 every time the child node of the current node changes |
| dataVersion | Data node content version number. It is 0 when the node is created. Every time the node content is updated (regardless of whether the content changes or not), the value of the version number increases by 1 |
| aclVersion | The ACL version number of the node, indicating the number of changes to the ACL information of the node |
| ephemeralOwner | sessionId of the session that created this temporary node; if the current node is a persistent node, ephemeralOwner=0 |
| dataLength | Data node content length |
| numChildren | The number of child nodes of the current node |

### Version

As we mentioned before, corresponding to each znode, ZooKeeper will maintain a data structure called **Stat** for it. Stat records three related versions of this znode:

- **dataVersion**: The version number of the current znode node
- **cversion**: The version of the current znode child node
- **aclVersion**: The version of the ACL of the current znode.

### ACL (Authority Control)

ZooKeeper uses the ACL (AccessControlLists) policy for permission control, which is similar to the permission control of UNIX file systems.

For znode operation permissions, ZooKeeper provides the following 5 types:

- **CREATE** : Can create child nodes
- **READ**: Can obtain node data and list its child nodes
- **WRITE** : Can set/update node data
- **DELETE** : can delete child nodes
- **ADMIN**: Permission to set node ACL

What needs special attention is that both **CREATE** and **DELETE** are permission controls for **child nodes**.

For identity authentication, the following methods are provided:

- **world**: Default mode, all users can access unconditionally.
- **auth**: does not use any id, represents any authenticated user.
- **digest** :username:password authentication method: _username:password_.
- **ip**: Restrict the specified IP.

### Watcher (event listener)

Watcher (event listener) is a very important feature in ZooKeeper. ZooKeeper allows users to register some Watchers on designated nodes, and when certain events are triggered, the ZooKeeper server will notify interested clients of the event. This mechanism is an important feature of ZooKeeper in implementing distributed coordination services.

![ZooKeeper Watcher mechanism](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-watcher.png)

_Poyin: A very useful feature. I took out a small notebook and memorized it. The Watcher (event listener) mechanism is basically inseparable from ZooKeeper when used later. _

### Session

Session can be regarded as a long TCP connection between the ZooKeeper server and the client. Through this connection, the client can maintain a valid session with the server through heartbeat detection, and can also send requests to the ZooKeeper server and receive responses. It can also receive Watcher event notifications from the server through this connection.

Session has a property called: `sessionTimeout`, `sessionTimeout` represents the session timeout. When the client connection is disconnected due to various reasons such as excessive server pressure, network failure, or the client actively disconnects, as long as any server in the cluster can be reconnected within the time specified by `sessionTimeout`, the previously created session will still be valid.

In addition, before creating a session for a client, the server first assigns a `sessionID` to each client. Since `sessionID` is an important identifier of a ZooKeeper session, many session-related operating mechanisms are based on this `sessionID`. Therefore, no matter which server assigns `sessionID` to the client, it must be globally unique.

## ZooKeeper cluster

In order to ensure high availability, it is best to deploy ZooKeeper in a cluster form, so that as long as most of the machines in the cluster are available (can tolerate certain machine failures), ZooKeeper itself will still be available. Usually 3 servers can form a ZooKeeper cluster. The architecture diagram officially provided by ZooKeeper is a ZooKeeper cluster that provides services to the outside world as a whole.![ZooKeeper 集群架构](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-cluster.png)

上图中每一个 Server 代表一个安装 ZooKeeper 服务的服务器。组成 ZooKeeper 服务的服务器都会在内存中维护当前的服务器状态，并且每台服务器之间都互相保持着通信。集群间通过 ZAB 协议（ZooKeeper Atomic Broadcast）来保持数据的一致性。

**最典型集群模式：Master/Slave 模式（主备模式）**。在这种模式中，通常 Master 服务器作为主服务器提供写服务，其他的 Slave 服务器从服务器通过异步复制的方式获取 Master 服务器最新的数据提供读服务。

### ZooKeeper 集群角色

但是，在 ZooKeeper 中没有选择传统的 Master/Slave 概念，而是引入了 Leader、Follower 和 Observer 三种角色。如下图所示

![ZooKeeper 集群中角色](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-cluser-roles.png)

ZooKeeper 集群中的所有机器通过一个 **Leader 选举过程** 来选定一台称为 “**Leader**” 的机器，Leader 既可以为客户端提供写服务又能提供读服务。除了 Leader 外，**Follower** 和 **Observer** 都只能提供读服务。Follower 和 Observer 唯一的区别在于 Observer 机器不参与 Leader 的选举过程，也不参与写操作的“过半写成功”策略，因此 Observer 机器可以在不影响写性能的情况下提升集群的读性能。

| 角色     | 说明                                                                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leader   | 为客户端提供读和写的服务，负责投票的发起和决议，更新系统状态。                                                                                                                    |
| Follower | 为客户端提供读服务，如果是写服务则转发给 Leader。参与选举过程中的投票。                                                                                                           |
| Observer | 为客户端提供读服务，如果是写服务则转发给 Leader。不参与选举过程中的投票，也不参与“过半写成功”策略。在不影响写性能的情况下提升集群的读性能。此角色于 ZooKeeper3.3 系列新增的角色。 |

### ZooKeeper 集群 Leader 选举过程

当 Leader 服务器出现网络中断、崩溃退出与重启等异常情况时，就会进入 Leader 选举过程，这个过程会选举产生新的 Leader 服务器。

这个过程大致是这样的：

1. **Leader election（选举阶段）**：节点在一开始都处于选举阶段，只要有一个节点得到超半数节点的票数，它就可以当选准 leader。
2. **Discovery（发现阶段）**：在这个阶段，followers 跟准 leader 进行通信，同步 followers 最近接收的事务提议。
3. **Synchronization（同步阶段）**：同步阶段主要是利用 leader 前一阶段获得的最新提议历史，同步集群中所有的副本。同步完成之后准 leader 才会成为真正的 leader。
4. **Broadcast（广播阶段）**：到了这个阶段，ZooKeeper 集群才能正式对外提供事务服务，并且 leader 可以进行消息广播。同时如果有新的节点加入，还需要对新节点进行同步。

ZooKeeper 集群中的服务器状态有下面几种：

- **LOOKING**：寻找 Leader。
- **LEADING**：Leader 状态，对应的节点为 Leader。
- **FOLLOWING**：Follower 状态，对应的节点为 Follower。
- **OBSERVING**：Observer 状态，对应节点为 Observer，该节点不参与 Leader 选举。

### ZooKeeper 集群为啥最好奇数台？

ZooKeeper 集群在宕掉几个 ZooKeeper 服务器之后，如果剩下的 ZooKeeper 服务器个数大于宕掉的个数的话整个 ZooKeeper 才依然可用。假如我们的集群中有 n 台 ZooKeeper 服务器，那么也就是剩下的服务数必须大于 n/2。先说一下结论，2n 和 2n-1 的容忍度是一样的，都是 n-1，大家可以先自己仔细想一想，这应该是一个很简单的数学问题了。

比如假如我们有 3 台，那么最大允许宕掉 1 台 ZooKeeper 服务器，如果我们有 4 台的的时候也同样只允许宕掉 1 台。
假如我们有 5 台，那么最大允许宕掉 2 台 ZooKeeper 服务器，如果我们有 6 台的的时候也同样只允许宕掉 2 台。

综上，何必增加那一个不必要的 ZooKeeper 呢？

### ZooKeeper 选举的过半机制防止脑裂

**何为集群脑裂？**

对于一个集群，通常多台机器会部署在不同机房，来提高这个集群的可用性。保证可用性的同时，会发生一种机房间网络线路故障，导致机房间网络不通，而集群被割裂成几个小集群。这时候子集群各自选主导致“脑裂”的情况。

举例说明：比如现在有一个由 6 台服务器所组成的一个集群，部署在了 2 个机房，每个机房 3 台。正常情况下只有 1 个 leader，但是当两个机房中间网络断开的时候，每个机房的 3 台服务器都会认为另一个机房的 3 台服务器下线，而选出自己的 leader 并对外提供服务。若没有过半机制，当网络恢复的时候会发现有 2 个 leader。仿佛是 1 个大脑（leader）分散成了 2 个大脑，这就发生了脑裂现象。脑裂期间 2 个大脑都可能对外提供了服务，这将会带来数据一致性等问题。

**过半机制是如何防止脑裂现象产生的？**

ZooKeeper 的过半机制导致不可能产生 2 个 leader，因为少于等于一半是不可能产生 leader 的，这就使得不论机房的机器如何分配都不可能发生脑裂。

## ZAB 协议和 Paxos 算法

Paxos 算法应该可以说是 ZooKeeper 的灵魂了。但是，ZooKeeper 并没有完全采用 Paxos 算法 ，而是使用 ZAB 协议作为其保证数据一致性的核心算法。另外，在 ZooKeeper 的官方文档中也指出，ZAB 协议并不像 Paxos 算法那样，是一种通用的分布式一致性算法，它是一种特别为 Zookeeper 设计的崩溃可恢复的原子消息广播算法。

### ZAB 协议介绍

ZAB（ZooKeeper Atomic Broadcast，原子广播） 协议是为分布式协调服务 ZooKeeper 专门设计的一种支持崩溃恢复的原子广播协议。 在 ZooKeeper 中，主要依赖 ZAB 协议来实现分布式数据一致性，基于该协议，ZooKeeper 实现了一种主备模式的系统架构来保持集群中各个副本之间的数据一致性。

### ZAB 协议两种基本的模式：崩溃恢复和消息广播

ZAB 协议包括两种基本的模式，分别是

- **崩溃恢复**：当整个服务框架在启动过程中，或是当 Leader 服务器出现网络中断、崩溃退出与重启等异常情况时，ZAB 协议就会进入恢复模式并选举产生新的 Leader 服务器。当选举产生了新的 Leader 服务器，同时集群中已经有过半的机器与该 Leader 服务器完成了状态同步之后，ZAB 协议就会退出恢复模式。其中，**所谓的状态同步是指数据同步，用来保证集群中存在过半的机器能够和 Leader 服务器的数据状态保持一致**。
- **Message Broadcast**:** When more than half of the Follower servers in the cluster have completed the status synchronization with the Leader server, then the entire service framework can enter the message broadcast mode. ** When a server that also complies with the ZAB protocol joins the cluster after being started, if there is already a Leader server in the cluster responsible for message broadcast, then the newly added server will consciously enter the data recovery mode: find the server where the Leader is located, synchronize data with it, and then participate in the message broadcast process together.

### ZAB Protocol & Paxos Algorithm Article Recommendations

There are too many things that need to be talked about and understood about **ZAB protocol & Paxos algorithm**. For details, you can read the following articles:

- [Detailed explanation of Paxos algorithm](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [ZooKeeper and Zab Protocol · Analyze](https://wingsxdu.com/posts/database/zookeeper/)
- [Detailed explanation of Raft algorithm](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)

## ZooKeeper VS ETCD

[ETCD](https://etcd.io/) is a strongly consistent distributed key-value store that provides a reliable way to store data that needs to be accessed by a distributed system or machine cluster. ETCD internally uses [Raft algorithm](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html) as the consistency algorithm, which is implemented based on Go language.

Similar to ZooKeeper, ETCD can also be used in data publishing/subscription, load balancing, naming services, distributed coordination/notification, distributed locks and other scenarios. So how to choose between the two?

This article by Dewu Technology [A brief analysis of how to implement high-availability architecture based on ZooKeeper] (https://mp.weixin.qq.com/s/pBI3rjv5NdS1124Z7HQ-JA) provides the following comparison table (I have further optimized it), which can be used as a reference:

| | ZooKeeper | ETCD |
|---------------- |-------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Language** | Java | Go |
| **Protocol** | TCP | Grpc |
| **Interface Call** | You must use your own client to call | Can be transmitted through HTTP, you can call it through commands such as CURL |
| **Consensus Algorithm** | Zab Protocol | Raft Algorithm |
| **Watcher mechanism** | Limited, one-time trigger | One Watch can monitor all events |
| **Data model** | Directory-based hierarchical model | Refers to zk's data model, which is a flat kv model |
| **Storage** | kv storage, using ConcurrentHashMap, memory storage, generally not recommended to store large amounts of data | kv storage, using the bbolt storage engine, can handle several GB of data. |
| **MVCC** | Not supported | Supported, version control through two B+ Trees |
| **Global Session** | Defects | Implementation is more flexible and avoids security issues |
| **Permission Verification** | ACL | RBAC |
| **Transaction Capability** | Provides simple transaction capabilities | Only provides version number checking capabilities |
| **Deployment and Maintenance** | Complex | Simple |

ZooKeeper has certain limitations in storage performance, global Session, Watcher mechanism, etc. More and more open source projects are replacing ZooKeeper with Raft implementation or other distributed coordination services, such as: [Kafka Needs No Keeper - Removing ZooKeeper Dependency (confluent.io)](https://www.confluent.io/blog/removing-zookeeper-dependency-in-kafka/), [Moving Toward a ZooKeeper-Less Apache Pulsar (streamnative.io)](https://streamnative.io/blog/moving-toward-zookeeper-less-apache-pulsar).

ETCD is relatively better, providing more stable high-load reading and writing capabilities, and improving and optimizing many problems exposed by ZooKeeper. Moreover, ETCD can basically cover all application scenarios of ZooKeeper and replace it.

## Summary

1. ZooKeeper itself is a distributed program (as long as more than half of the nodes survive, ZooKeeper can serve normally).
2. In order to ensure high availability, it is best to deploy ZooKeeper in a cluster form. In this way, as long as most of the machines in the cluster are available (can tolerate certain machine failures), ZooKeeper itself will still be available.
3. ZooKeeper stores data in memory, which ensures high throughput and low latency (however, the memory limits the amount of data that can be stored, and this limitation is also a further reason to keep the amount of data stored in znodes small).
4. ZooKeeper is high performance. This is especially true in applications where there are more reads than writes, since the writes cause all inter-server states to be synchronized. (More "reads" than "writes" are a typical scenario for coordinating services.)
5. ZooKeeper has the concept of temporary nodes. Transient nodes exist as long as the client session that created the transient node remains active. When the session ends, the transient node is deleted. A persistent node means that once the znode is created, the znode will always be saved on ZooKeeper unless the znode is actively removed.
6. The bottom layer of ZooKeeper actually only provides two functions: ① manage (storage, read) data submitted by user programs; ② provide data node monitoring services for user programs.

## Reference

- "Principles and Practices of Distributed Consistency from Paxos to ZooKeeper"
- Talk about the limitations of ZooKeeper: <https://wingsxdu.com/posts/database/zookeeper-limitations/>

<!-- @include: @article-footer.snippet.md -->