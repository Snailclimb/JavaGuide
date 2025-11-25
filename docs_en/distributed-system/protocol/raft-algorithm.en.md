---
title: Raft 算法详解
category: 分布式
tag:
  - 分布式协议&算法
  - 共识算法
---

> 本文由 [SnailClimb](https://github.com/Snailclimb) 和 [Xieqijun](https://github.com/jun0315) 共同完成。

## 1 背景

当今的数据中心和应用程序在高度动态的环境中运行，为了应对高度动态的环境，它们通过额外的服务器进行横向扩展，并且根据需求进行扩展和收缩。同时，服务器和网络故障也很常见。

因此，系统必须在正常操作期间处理服务器的上下线。它们必须对变故做出反应并在几秒钟内自动适应；对客户来说的话，明显的中断通常是不可接受的。

幸运的是，分布式共识可以帮助应对这些挑战。

### 1.1 拜占庭将军

在介绍共识算法之前，先介绍一个简化版拜占庭将军的例子来帮助理解共识算法。

> 假设多位拜占庭将军中没有叛军，信使的信息可靠但有可能被暗杀的情况下，将军们如何达成是否要进攻的一致性决定？

解决方案大致可以理解成：先在所有的将军中选出一个大将军，用来做出所有的决定。

举例如下：假如现在一共有 3 个将军 A，B 和 C，每个将军都有一个随机时间的倒计时器，倒计时一结束，这个将军就把自己当成大将军候选人，然后派信使传递选举投票的信息给将军 B 和 C，如果将军 B 和 C 还没有把自己当作候选人（自己的倒计时还没有结束），并且没有把选举票投给其他人，它们就会把票投给将军 A，信使回到将军 A 时，将军 A 知道自己收到了足够的票数，成为大将军。在有了大将军之后，是否需要进攻就由大将军 A 决定，然后再去派信使通知另外两个将军，自己已经成为了大将军。如果一段时间还没收到将军 B 和 C 的回复（信使可能会被暗杀），那就再重派一个信使，直到收到回复。

### 1.2 共识算法

共识是可容错系统中的一个基本问题：即使面对故障，服务器也可以在共享状态上达成一致。

共识算法允许一组节点像一个整体一样一起工作，即使其中的一些节点出现故障也能够继续工作下去，其正确性主要是源于复制状态机的性质：一组`Server`的状态机计算相同状态的副本，即使有一部分的`Server`宕机了它们仍然能够继续运行。

![rsm-architecture.png](https://oss.javaguide.cn/github/javaguide/paxos-rsm-architecture.png)

`图-1 复制状态机架构`

一般通过使用复制日志来实现复制状态机。每个`Server`存储着一份包括命令序列的日志文件，状态机会按顺序执行这些命令。因为每个日志包含相同的命令，并且顺序也相同，所以每个状态机处理相同的命令序列。由于状态机是确定性的，所以处理相同的状态，得到相同的输出。

因此共识算法的工作就是保持复制日志的一致性。服务器上的共识模块从客户端接收命令并将它们添加到日志中。它与其他服务器上的共识模块通信，以确保即使某些服务器发生故障。每个日志最终包含相同顺序的请求。一旦命令被正确地复制，它们就被称为已提交。每个服务器的状态机按照日志顺序处理已提交的命令，并将输出返回给客户端，因此，这些服务器形成了一个单一的、高度可靠的状态机。

适用于实际系统的共识算法通常具有以下特性：

- 安全。确保在非拜占庭条件（也就是上文中提到的简易版拜占庭）下的安全性，包括网络延迟、分区、包丢失、复制和重新排序。
- 高可用。只要大多数服务器都是可操作的，并且可以相互通信，也可以与客户端进行通信，那么这些服务器就可以看作完全功能可用的。因此，一个典型的由五台服务器组成的集群可以容忍任何两台服务器端故障。假设服务器因停止而发生故障；它们稍后可能会从稳定存储上的状态中恢复并重新加入集群。
- 一致性不依赖时序。错误的时钟和极端的消息延迟，在最坏的情况下也只会造成可用性问题，而不会产生一致性问题。

- 在集群中大多数服务器响应，命令就可以完成，不会被少数运行缓慢的服务器来影响整体系统性能。

## 2 基础

### 2.1 节点类型

一个 Raft 集群包括若干服务器，以典型的 5 服务器集群举例。在任意的时间，每个服务器一定会处于以下三个状态中的一个：

- `Leader`：负责发起心跳，响应客户端，创建日志，同步日志。
- `Candidate`：Leader 选举过程中的临时角色，由 Follower 转化而来，发起投票参与竞选。
- `Follower`：接受 Leader 的心跳和日志同步数据，投票给 Candidate。

在正常的情况下，只有一个服务器是 Leader，剩下的服务器是 Follower。Follower 是被动的，它们不会发送任何请求，只是响应来自 Leader 和 Candidate 的请求。

![](https://oss.javaguide.cn/github/javaguide/paxos-server-state.png)

`图-2：服务器的状态`

### 2.2 任期

![](https://oss.javaguide.cn/github/javaguide/paxos-term.png)

`图-3：任期`

如图 3 所示，raft 算法将时间划分为任意长度的任期（term），任期用连续的数字表示，看作当前 term 号。每一个任期的开始都是一次选举，在选举开始时，一个或多个 Candidate 会尝试成为 Leader。如果一个 Candidate 赢得了选举，它就会在该任期内担任 Leader。如果没有选出 Leader，将会开启另一个任期，并立刻开始下一次选举。raft 算法保证在给定的一个任期最少要有一个 Leader。

每个节点都会存储当前的 term 号，当服务器之间进行通信时会交换当前的 term 号；如果有服务器发现自己的 term 号比其他人小，那么他会更新到较大的 term 值。如果一个 Candidate 或者 Leader 发现自己的 term 过期了，他会立即退回成 Follower。如果一台服务器收到的请求的 term 号是过期的，那么它会拒绝此次请求。

### 2.3 日志

- `entry`：每一个事件成为 entry，只有 Leader 可以创建 entry。entry 的内容为`<term,index,cmd>`其中 cmd 是可以应用到状态机的操作。
- `log`：由 entry 构成的数组，每一个 entry 都有一个表明自己在 log 中的 index。只有 Leader 才可以改变其他节点的 log。entry 总是先被 Leader 添加到自己的 log 数组中，然后再发起共识请求，获得同意后才会被 Leader 提交给状态机。Follower 只能从 Leader 获取新日志和当前的 commitIndex，然后把对应的 entry 应用到自己的状态机中。

## 3 领导人选举

raft 使用心跳机制来触发 Leader 的选举。

如果一台服务器能够收到来自 Leader 或者 Candidate 的有效信息，那么它会一直保持为 Follower 状态，并且刷新自己的 electionElapsed，重新计时。

Leader 会向所有的 Follower 周期性发送心跳来保证自己的 Leader 地位。如果一个 Follower 在一个周期内没有收到心跳信息，就叫做选举超时，然后它就会认为此时没有可用的 Leader，并且开始进行一次选举以选出一个新的 Leader。

为了开始新的选举，Follower 会自增自己的 term 号并且转换状态为 Candidate。然后他会向所有节点发起 RequestVoteRPC 请求， Candidate 的状态会持续到以下情况发生：

- 赢得选举
- 其他节点赢得选举
- 一轮选举结束，无人胜出

赢得选举的条件是：一个 Candidate 在一个任期内收到了来自集群内的多数选票`（N/2+1）`，就可以成为 Leader。

在 Candidate 等待选票的时候，它可能收到其他节点声明自己是 Leader 的心跳，此时有两种情况：

- 该 Leader 的 term 号大于等于自己的 term 号，说明对方已经成为 Leader，则自己回退为 Follower。
- 该 Leader 的 term 号小于自己的 term 号，那么会拒绝该请求并让该节点更新 term。

由于可能同一时刻出现多个 Candidate，导致没有 Candidate 获得大多数选票，如果没有其他手段来重新分配选票的话，那么可能会无限重复下去。

raft 使用了随机的选举超时时间来避免上述情况。每一个 Candidate 在发起选举后，都会随机化一个新的选举超时时间，这种机制使得各个服务器能够分散开来，在大多数情况下只有一个服务器会率先超时；它会在其他服务器超时之前赢得选举。

## 4 日志复制

一旦选出了 Leader，它就开始接受客户端的请求。每一个客户端的请求都包含一条需要被复制状态机（`Replicated State Machine`）执行的命令。

Leader 收到客户端请求后，会生成一个 entry，包含`<index,term,cmd>`，再将这个 entry 添加到自己的日志末尾后，向所有的节点广播该 entry，要求其他服务器复制这条 entry。

If the Follower accepts the entry, it will add the entry to the end of its own log and return it to the Leader for approval.

If the Leader receives a majority of successful responses, the Leader will apply the entry to its own state machine, and then call the entry committed and return the execution result to the client.

raft guarantees the following two properties:

- In two logs, if there are two entries with the same index and term, then they must have the same cmd
- In two logs, if there are two entries with the same index and term, then the entries in front of them must also be the same.

The first property is guaranteed by "only the Leader can generate entries", and the second property requires a consistency check to ensure it.

Under normal circumstances, the logs of the Leader and Follower are consistent. However, the crash of the Leader will cause the logs to be different, so the consistency check will fail. Leader handles log inconsistencies by forcing Followers to copy their own logs. This means that the conflict log on the Follower will be overwritten by the leader's log.

In order to make the Follower's log consistent with its own log, the Leader needs to find the place where the Follower's log is consistent with its own log, then delete the Follower's log after that position, and then send the following log to the Follower.

`Leader` maintains a `nextIndex` for each `Follower`, which represents the index of the next log entry that `Leader` will send to the follower. When a `Leader` takes power, it initializes `nextIndex` to its latest log entry index + 1. If the log of a `Follower` is inconsistent with that of the `Leader`, the `AppendEntries` consistency check will return failure at the next `AppendEntries RPC`. After a failure, `Leader` will decrement `nextIndex` and retry `AppendEntries RPC`. Eventually `nextIndex` will reach a place where `Leader` and `Follower` logs are consistent. At this point, `AppendEntries` will return successfully, the conflicting log entries in `Follower` will be removed, and the missing `Leader` log entries will be added. Once `AppendEntries` returns successfully, the logs of `Follower` and `Leader` are consistent, and this state will remain until the end of the term.

## 5 Security

### 5.1 Election restrictions

The Leader needs to ensure that it stores all submitted log entries. This allows log entries to flow in only one direction: from Leader to Follower, and Leader will never overwrite existing log entries.

When each Candidate sends RequestVoteRPC, it will bring the last entry information. When all nodes receive the voting information, they will compare the entry. If they find their own updates, they will refuse to vote for the candidate.

The way to judge the old and new logs: if the terms of the two logs are different, the larger term is updated; if the terms are the same, the longer index is updated.

### 5.2 Node crash

If the Leader crashes and the nodes in the cluster do not receive the Leader's heartbeat information within the electionTimeout time, a new round of leader election will be triggered. During the leader election period, the entire cluster will be unavailable to the outside world.

If Follower and Candidate crash, the handling will be much simpler. Subsequent RequestVoteRPC and AppendEntriesRPC sent to it will fail. Since all raft requests are idempotent, they will be retried infinitely if they fail. If the crash is recovered, you can receive new requests and choose to append or reject the entry.

### 5.3 Timing and Availability

One of the requirements of raft is that security does not depend on time: the system cannot fail just because some events occur faster or slower than expected. In order to ensure the above requirements, it is best to meet the following time conditions:

`broadcastTime << electionTimeout << MTBF`

- `broadcastTime`: the average response time for concurrently sending messages to other nodes;
- `electionTimeout`: election timeout;
- `MTBF(mean time between failures)`: the average health time of a single machine;

`broadcastTime` should be an order of magnitude smaller than `electionTimeout`, in order to enable `Leader` to continuously send heartbeat information (heartbeat) to prevent `Follower` from starting an election;

`electionTimeout` is also several orders of magnitude smaller than `MTBF` in order to make the system run stably. When the `Leader` crashes, it will be unavailable for approximately the entire `electionTimeout`; we hope that this will only be a small fraction of the total time.

Since `broadcastTime` and `MTBF` are properties determined by the system, the time of `electionTimeout` needs to be determined.

Generally speaking, broadcastTime is generally `0.5~20ms`, electionTimeout can be set to `10~500ms`, and MTBF is generally one or two months.

## 6 Reference

- <https://tanxinyu.work/raft/>
- <https://github.com/OneSizeFitsQuorum/raft-thesis-zh_cn/blob/master/raft-thesis-zh_cn.md>
- <https://github.com/ongardie/dissertation/blob/master/stanford.pdf>
- <https://knowledge-sharing.gitbooks.io/raft/content/chapter5.html>

<!-- @include: @article-footer.snippet.md -->