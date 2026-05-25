---
title: 分布式事务解决方案详解：XA、AT、TCC、Saga、本地消息表与事务消息
category: 分布式
description: 分布式事务解决方案详解，覆盖 2PC、3PC、XA、Seata AT、TCC、Saga、本地消息表、RocketMQ 事务消息、最大努力通知等方案的原理、优缺点、适用场景和面试考点。
tag:
  - 分布式事务
head:
  - - meta
    - name: keywords
      content: 分布式事务,2PC,3PC,XA,Seata AT,TCC,Saga,本地消息表,事务消息,RocketMQ,最大努力通知,最终一致性,补偿事务,分布式事务面试题
---

**网上已经有很多关于分布式事务的文章了，为啥还要写一篇？**

1. 第一是我觉得大部分文章理解起来挺难的，不太适合一些经验不多的小伙伴。这篇文章我的目标就是让即使是没啥工作经验的小伙伴们都能真正看懂分布式事务。
2. 第二是我觉得大部分文章介绍的不够详细，很多分布式事务相关的重要概念都没有提到。

开始聊分布式事务之前，我们先来回顾一下事务相关的概念。

> **版本说明**：本文 Seata 相关内容基于 1.7+ / 2.x 文档，RocketMQ 事务消息基于 4.9+ / 5.x 文档。不同版本的默认参数、API 和部署方式可能存在差异，落地时要以项目实际版本文档为准。

## 事务

我们设想一个场景，这个场景中我们需要插入多条相关联的数据到数据库，不幸的是，这个过程可能会遇到下面这些问题：

- 数据库中途突然因为某些原因挂掉了。
- 客户端突然因为网络原因连接不上数据库了。
- 并发访问数据库时，多个线程同时写入数据库，覆盖了彼此的更改。
- ……

上面的任何一个问题都可能会导致数据的不一致性。为了保证数据的一致性，系统必须能够处理这些问题。事务就是我们抽象出来简化这些问题的首选机制。事务的概念起源于数据库，目前，已经成为一个比较广泛的概念。

**何为事务？** 一言以蔽之，**事务是逻辑上的一组操作，要么都执行，要么都不执行。**

事务最经典、最常被引用的例子就是转账。假如小明要给小红转账 1000 元，这个转账会涉及到两个关键操作，这两个操作必须都成功或者都失败。

1. 将小明的余额减少 1000 元
2. 将小红的余额增加 1000 元。

事务会把这两个操作看成逻辑上的一个整体，这个整体包含的操作要么都成功，要么都失败。这样就不会出现小明余额减少而小红的余额却并没有增加的情况。

![](https://oss.javaguide.cn/github/javaguide/mysql/%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

## 数据库事务

大多数情况下，我们在谈论事务的时候，如果没有特指**分布式事务**，往往指的就是**数据库事务**。

数据库事务在我们日常开发中接触的最多了。如果你的项目属于单体架构的话，你接触到的往往就是数据库事务了。

**那数据库事务有什么作用呢？**

简单来说，数据库事务可以保证多个对数据库的操作（也就是 SQL 语句）构成一个逻辑上的整体。构成这个逻辑上的整体的这些数据库操作遵循：**要么全部执行成功，要么全部不执行**。

```sql
# 开启一个事务
START TRANSACTION;
# 多条 SQL 语句
SQL1,SQL2...
## 提交事务
COMMIT;
```

![数据库事务示意图](https://oss.javaguide.cn/github/javaguide/mysql/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

另外，关系型数据库（例如：`MySQL`、`SQL Server`、`Oracle` 等）事务都有 **ACID** 特性：

![ACID](https://oss.javaguide.cn/github/javaguide/mysql/ACID.png)

1. **原子性**（`Atomicity`）：事务是最小的执行单位，不允许分割。事务的原子性确保动作要么全部完成，要么完全不起作用；
2. **一致性**（`Consistency`）：执行事务前后，数据保持一致，例如转账业务中，无论事务是否成功，转账者和收款人的总额应该是不变的；
3. **隔离性**（`Isolation`）：并发访问数据库时，一个用户的事务不被其他事务所干扰，各并发事务之间数据库是独立的；
4. **持久性**（`Durability`）：一个事务被提交之后。它对数据库中数据的改变是持久的，即使数据库发生故障也不应该对其有任何影响。

🌈 这里要额外补充一点：**只有保证了事务的持久性、原子性、隔离性之后，一致性才能得到保障。也就是说 A、I、D 是手段，C 是目的！** 想必大家和我一样，被 ACID 这个概念误导了很久！我也是看周志明老师的公开课[《周志明的软件架构课》](https://time.geekbang.org/opencourse/intro/100064201)才搞清楚的（多看好书！！！）。

![AID->C](https://oss.javaguide.cn/github/javaguide/mysql/AID-%3EC.png)

另外，DDIA 也就是 [《Designing Data-Intensive Application（数据密集型应用系统设计）》](https://book.douban.com/subject/30329536/) 的作者在他的这本书中如是说：

> Atomicity, isolation, and durability are properties of the database, whereas consis‐
> tency (in the ACID sense) is a property of the application. The application may rely
> on the database’s atomicity and isolation properties in order to achieve consistency,
> but it’s not up to the database alone.
>
> 翻译过来的意思是：原子性，隔离性和持久性是数据库的属性，而一致性（在 ACID 意义上）是应用程序的属性。应用可能依赖数据库的原子性和隔离属性来实现一致性，但这并不仅取决于数据库。因此，字母 C 不属于 ACID 。

《Designing Data-Intensive Application（数据密集型应用系统设计）》这本书强推一波，值得读很多遍！豆瓣有接近 90% 的人看了这本书之后给了五星好评。另外，中文翻译版本已经在 GitHub 开源，地址：[https://github.com/Vonng/ddia](https://github.com/Vonng/ddia)。

![](https://img-blog.csdnimg.cn/20210526162552353.png)

**数据库事务的实现原理呢？**

我们这里以 MySQL 的 InnoDB 引擎为例来简单说一下。

MySQL InnoDB 引擎使用 **redo log（重做日志）** 保证事务的**持久性**，使用 **undo log（回滚日志）** 来保证事务的**原子性**。MySQL InnoDB 引擎通过 **锁机制**、**MVCC** 等手段来保证事务的隔离性（默认支持的隔离级别是 **`REPEATABLE-READ`**）。

## 分布式事务

微服务架构下，一个系统被拆分为多个小的微服务。每个微服务都可能存在不同的机器上，并且每个微服务可能都有一个单独的数据库供自己使用。这种情况下，一组操作可能会涉及到多个微服务以及多个数据库。举个例子：电商系统中，你创建一个订单往往会涉及到订单服务（订单数加一）、库存服务（库存减一）等等服务，这些服务会有供自己单独使用的数据库。

![分布式事务示意图](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-with-two-services.png)

**那么如何保证这一组操作要么都执行成功，要么都执行失败呢？**

这个时候单单依靠数据库事务就不行了！我们就需要引入 **分布式事务** 这个概念了！

实际上，只要跨数据库的场景都需要用到引入分布式事务。比如说单个数据库的性能达到瓶颈或者数据量太大的时候，我们需要进行 **分库**。分库之后，同一个数据库中的表分布在了不同的数据库中，如果单个操作涉及到多个数据库，那么数据库自带的事务就无法满足我们的要求了。

一言以蔽之，**分布式事务的终极目标就是保证系统中多个相关联的数据库中的数据的一致性！**

那既然分布式事务也属于事务，理论上就应该遵守事务的 ACID 四大特性。但是，考虑到性能、可用性等各方面因素，我们往往是无法完全满足 ACID 的，只能选择一个比较折中的方案。

针对分布式事务，又诞生了一些新的理论。

## 分布式事务基础理论

### CAP 理论和 BASE 理论

CAP 理论和 BASE 理论是分布式领域非常非常重要的两个理论。不夸张地说，只要问到分布式相关的内容，面试官几乎是必定会问这两个分布式相关的理论。

不论是你面试也好，工作也罢，都非常有必要将这两个理论搞懂，并且能够用自己的理解给别人讲出来。

我这里就不多提这两个理论了，不了解的小伙伴，可以看我前段时间写过的一篇相关的文章：[《CAP 和 BASE 理论了解么？可以结合实际案例说下不？》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247495298&idx=1&sn=965be0f54ab44bda818656db1f21a39f&chksm=cea1a149f9d6285f1169413ab7663ca2a9c1a8440a5ae5816566eb66b20e4d86f5db1002f66c&token=657875872&lang=zh_CN#rd) 。

### 一致性的 3 种级别

我们可以把对于系统一致性的要求分为下面 3 种级别：

- **强一致性**：系统写入了什么，读出来的就是什么。
- **弱一致性**：不一定可以读取到最新写入的值，也不保证多少时间之后读取到的数据是最新的，只是会尽量保证某个时刻达到数据一致的状态。
- **最终一致性**：弱一致性的升级版。系统会保证在一定时间内达到数据一致的状态。

除了上面这 3 个比较常见的一致性级别之外，还有读写一致性、因果一致性等一致性模型，具体可以参考[《Operational Characterization of Weak Memory Consistency Models》](https://es.cs.uni-kl.de/publications/datarsg/Senf13.pdf)这篇论文。因为日常工作中这些一致性模型很少见，我这里就不多做阐述（因为我自己也不是特别了解 😅）。

业界比较推崇是 **最终一致性**，但是某些对数据一致要求十分严格的场景比如银行转账还是要保证强一致性。

### 柔性事务

互联网应用最关键的就是要保证高可用，分布式系统几秒钟无法使用都可能造成巨大损失。在此场景下，一些大佬们在 CAP 理论和 BASE 理论的基础上，提出了 **柔性事务** 的概念。**柔性事务追求的是最终一致性。**

实际上，柔性事务就是 **BASE 理论 + 业务实践**。柔性事务追求的目标是：我们根据自身业务特性，通过适当的方式来保证系统数据的最终一致性。像 **TCC**、**Saga**、**MQ 事务**、**本地消息表** 就属于柔性事务。

### 刚性事务

与柔性事务相对的就是 **刚性事务** 了。前面我们说了，**柔性事务追求的是最终一致性**。那么，与之对应，刚性事务追求的就是 **强一致性**。像 **2PC**、**3PC** 就属于刚性事务。

![分布式事务解决方案总结](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-solution-summary.png)

## 分布式事务解决方案

分布式事务的解决方案有很多，比如：**XA / 2PC**、**3PC**、**AT**、**TCC**、**Saga**、**本地消息表**、**MQ 事务**（Kafka 和 RocketMQ 都提供了事务相关功能）、**最大努力通知**等等。

2PC、3PC 属于业务代码无侵入方案。XA 规范是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准，定义了 TM 与 RM 之间的接口，并通常通过 2PC 完成提交。TCC、Saga 属于业务侵入方案，AT 介于 XA 与 TCC 之间，MQ 事务依赖于使用消息队列的场景，本地消息表和最大努力通知主要追求最终一致性，不支持自动回滚。

这些方案的适用场景有所区别，我们需要根据具体的场景选择适合自己项目的解决方案。

一个简单的选型思路：

- **不能容忍最终一致性**：优先考虑 XA / 2PC，适合金融、账务等短事务强一致场景，但要接受性能和可用性成本。
- **希望业务少改造**：可以评估 Seata AT、本地消息表或 MQ 事务。AT 对业务代码侵入较低，但对数据库表结构、SQL 支持范围和全局锁有要求。
- **可以接受业务侵入，且链路较短**：可以考虑 TCC，典型场景是账户冻结、库存预留、优惠券锁定等需要资源预留的业务。
- **链路较长、步骤较多**：可以考虑 Saga，典型场景是订单履约、旅行预订、审批流等长事务流程。
- **只需要通知对方最终完成**：可以考虑最大努力通知，例如支付回调、物流状态通知、积分发放等。

开始介绍 2PC 和 3PC 之前，我们先来介绍一下 2PC 和 3PC 涉及到的一些角色（XA 规范的角色组成）：

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/xa-specification-roles.png)

- **AP（Application Program）**：应用程序本身。
- **RM（Resource Manager）**：资源管理器，也就是事务的参与者，绝大部分情况下就是指数据库（后文会以关系型数据库为例），一个分布式事务往往涉及到多个 RM。
- **TM（Transaction Manager）**：事务管理器，负责管理全局事务，分配事务唯一标识，监控事务的执行进度，并负责事务的提交、回滚、失败恢复等。

### 2PC（两阶段提交协议）

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/2pc-work-flow.png)

2PC（Two-Phase Commit）这三个字母的含义：

- **2** -> 指代事务提交的 2 个阶段
- **P** -> Prepare（准备阶段）
- **C** -> Commit（提交阶段）

2PC 将事务的提交过程分为 2 个阶段：**准备阶段** 和 **提交阶段** 。

#### 准备阶段（Prepare）

准备阶段的核心是“询问”事务参与者执行本地数据库事务操作是否成功。

准备阶段的工作流程：

1. **事务协调者/管理者（后文简称 TM）** 向所有涉及到的 **事务参与者（后文简称 RM）** 发送消息询问：“你是否可以执行事务操作呢？”，并等待其答复。
2. **RM** 接收到消息之后，开始执行本地数据库事务预操作比如写 redo log/undo log 日志，**此时并不会提交事务** 。
3. **RM** 如果执行本地数据库事务操作成功，那就回复“Yes”表示我已就绪，否则就回复“No”表示我未就绪。

#### 提交阶段（Commit）

提交阶段的核心是“询问”事务参与者提交本地事务是否成功。

当所有事务参与者都是“就绪”状态的话：

1. **TM** 向所有参与者发送消息：“你们可以提交事务啦！”（**Commit 消息**）
2. **RM** 接收到 **Commit 消息** 后执行 **提交本地数据库事务** 操作，执行完成之后 **释放整个事务期间所占用的资源**。
3. **RM** 回复：“事务已经提交” （**ACK 消息**）。
4. **TM** 收到所有 **事务参与者** 的 **ACK 消息** 之后，整个分布式事务过程正式结束。

![2PC示意图-就绪](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-2pc-ready.png)

当任一事务参与者是“未就绪”状态的话：

1. **TM** 向所有参与者发送消息：“你们可以执行回滚操作了！”（**Rollback 消息**）。
2. **RM** 接收到 **Rollback 消息** 后执行 **本地数据库事务回滚** 执行完成之后 **释放整个事务期间所占用的资源**。
3. **RM** 回复：“事务已经回滚” （**ACK 消息**）。
4. **TM** 收到所有 **RM** 的 **ACK 消息** 之后，中断事务。

![2PC示意图-未就绪](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-2pc-not-ready.png)

#### 总结

简单总结一下 **2PC** 两阶段中比较重要的一些点：

1. **准备阶段** 的主要目的是测试 **RM** 能否执行 **本地数据库事务** 操作（!!!注意：这一步并不会提交事务）。
2. **提交阶段** 中 **TM** 会根据 **准备阶段** 中 **RM** 的消息来决定是执行事务提交还是回滚操作。
3. **提交阶段** 之后一定会结束当前的分布式事务

**2PC 的优点：**

- 理论模型简单，便于理解和实现。
- 主流数据库（如 MySQL InnoDB、Oracle、PostgreSQL）通常都支持 XA，可以作为 2PC 中的 RM，由外部 TM 协调提交或回滚。

**2PC 的权衡：**

- 2PC 的设计目标是数据强一致性。但在工程实现中，由于网络分区、TM 宕机、RM 超时等极端情况，仍可能出现数据不一致或事务长时间阻塞，并不等于“天然绝对强一致”。

**2PC 存在的问题：**

- **同步阻塞**：事务参与者会在正式提交事务之前会一直占用相关的资源。比如用户小明转账给小红，那其他事务也要操作用户小明或小红的话，就会阻塞。
- **数据不一致**：由于网络问题或者 TM 宕机都有可能会造成数据不一致的情况。比如在第 2 阶段（提交阶段），部分网络出现问题导致部分参与者收不到 Commit/Rollback 消息的话，就会导致数据不一致。
- **单点问题**：TM 在其中也是一个很重要的角色，如果 TM 在准备（Prepare）阶段完成之后挂掉的话，事务参与者就会一直卡在提交（Commit）阶段。

### XA 模式

XA 可以理解为 2PC 在数据库等资源层面的标准化落地。2PC 是提交协议，XA 是 X/Open 定义的 DTP 接口规范，规定了 TM 如何协调多个 RM 参与同一个全局事务。

典型流程是：

1. AP 发起全局事务，TM 负责生成全局事务上下文。
2. 各个 RM（例如不同数据库）执行本地事务，但先不真正提交。
3. TM 调用各个 RM 的 `prepare`，所有 RM 都准备成功后再调用 `commit`，否则调用 `rollback`。

XA 的优势是业务侵入低，数据库本身负责事务隔离和回滚能力，适合短事务、强一致、并发压力不太高的场景。缺点也很明显：事务期间数据库资源会被长时间占用，性能和可用性都容易受到影响。

Seata 从 1.2 版本开始支持 XA 模式。Seata XA 模式利用数据库、消息服务等资源对 XA 协议的支持来管理分支事务，整体一致性更强，但吞吐通常不如 AT / TCC / Saga 这类柔性方案。

### 3PC（三阶段提交协议）

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/3pc-work-flow.png)

3PC 是在 2PC 基础上的优化版本。它将 2PC 的 **Prepare 阶段**拆成两个独立阶段：CanCommit（只询问能否提交，不执行事务预操作）和 PreCommit（执行事务预操作、写 redo/undo log）。再加上最后的 DoCommit，共三个阶段：

1. CanCommit（询问能否提交）
2. PreCommit（执行事务预操作）
3. DoCommit（真正提交）

![3PC示意图-就绪](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-3pc-ready.png)

#### 准备阶段(CanCommit)

准备阶段 RM 不会执行事务操作，TM 只是向 RM 发送 **准备请求** ，顺便询问一些信息比如事务参与者能否执行本地数据库事务操作。RM 回复“Yes”、“No”或者直接超时未回复。

#### 预提交阶段(PreCommit)

如果准备阶段所有的 RM 回复 “Yes”的话，TM 就会向所有的 RM 发送 **PreCommit 消息（预提交请求）** ，RM 收到消息之后会执行本地数据库事务预操作比如写 redo log/undo log 日志。

如果准备阶段有任一 RM 回复“NO” 或者直接超时未回复的话，TM 就会给所有 RM 发送 **Abort 消息（中断请求）** ，RM 收到消息后直接中断事务。这样其实对 RM 来说损失并不大，因为本质上 RM 到现在还并没有实际做什么事情。

如果 RM 成功的执行了事务预操作，就返回 “YES”。否则，返回“No”（最后的反悔机会）。

预提交阶段 TM 与 RM 都引入了超时机制，如果 **参与者** 没有收到 TM 的 PreCommit 消息，或者 TM 没有收到参与者返回的预执行结果状态，那么在超过等待时间后，事务就会中断，这就避免了事务的阻塞。

#### 执行事务提交阶段（DoCommit）

**执行事务提交（DoCommit）** 阶段就开始进行真正的事务提交。

如果预提交阶段所有的 RM 回复 “YES”的话，TM 就会向所有的 RM 发送 **DoCommit 消息（执行事务提交请求）** ，RM 收到消息之后会执行本地数据库事务提交，并在完成后释放占用的资源。当事务提交成功后，RM 会返回 “YES”。

如果预提交阶段有任一 RM 回复“NO”或者直接超时未回复的话，TM 就会给所有 RM 发送 **Abort 消息（中断请求）** ，RM 收到消息后会进行事务回滚，释放资源，中断本次事务。

如果 RM 在设定时间内没有收到 TM 的 DoCommit 消息，RM 会认为 TM 可能发生了故障，会直接进行事务提交。

只要预提交阶段所有 RM 都返回了 `Yes`，那么进入第三阶段后，事务大概率可以执行成功。

但这里要特别注意：**RM 超时后默认提交是 3PC 的“双刃剑”**。它缓解了 2PC 中 TM 宕机导致 RM 永久阻塞的问题，但也引入了新的不一致风险。比如 TM 原本决定 Abort，但只有部分 RM 收到 Abort 消息，其他 RM 因超时默认提交，就会造成同一个事务在不同 RM 上出现“部分提交、部分回滚”的状态。这也是 3PC 在工程上很少真正落地的重要原因。

#### 总结

**3PC 除了将 2PC 中的 Prepare 阶段做了进一步拆分之外，还做了哪些改进？**

3PC 同时在 TM 和 RM 中引入了 **超时机制**。如果 TM 在一定时间内没有收到 RM 的消息，就默认失败并中断事务；如果 RM 长时间收不到 TM 的下一步指令，也会根据所处阶段选择中断或提交，尽量避免资源长期阻塞。

不过，3PC 并没有完美解决 2PC 的阻塞问题，还引入了性能更差、仍可能数据不一致等新问题。因此，3PC 的实际应用并不广泛。工程上更主流的方向是使用 Paxos / Raft 等共识协议（通常结合复制状态机模式）来解决协调者单点和状态一致性问题，而不是直接使用 3PC。

### TCC（补偿事务）

TCC 属于目前比较常见的一种柔性事务解决方案。数据库专家帕特 · 赫兰德（Pat Helland）于 2007 年发表的 [《Life beyond Distributed Transactions: an Apostate’s Opinion》](https://www.ics.uci.edu/~cs223/papers/cidr07p15.pdf) 讨论了避免传统分布式事务、改用业务补偿的思路，感兴趣的小伙伴可以阅读一下这篇论文。

简单来说，TCC 是 Try、Confirm、Cancel 三个词的缩写，它分为三个阶段：

1. **Try（尝试）阶段**：尝试执行。完成业务检查，并预留好必需的业务资源。
2. **Confirm（确认）阶段**：确认执行。当所有事务参与者的 Try 阶段执行成功就会执行 Confirm，Confirm 阶段会处理 Try 阶段预留的业务资源。否则，就会执行 Cancel。
3. **Cancel（取消）阶段**：取消执行，释放 Try 阶段预留的业务资源。

每个阶段由业务代码控制，这样可以避免数据库层面的长事务和长期持锁，但代价是业务代码侵入更强，开发者需要自己处理资源预留、确认、取消、重试和异常补偿。

我们拿转账场景来说：

1. **Try（尝试）阶段**：在转账场景下，Try 要做的事情就是检查账户余额是否充足，预留的资源就是转账资金。
2. **Confirm（确认）阶段**：如果 Try 阶段执行成功的话，Confirm 阶段就会执行真正的扣钱操作。
3. **Cancel（取消）阶段**：释放 Try 阶段预留的转账资金。

一般情况下，当我们使用 `TCC` 模式的时候，需要自己实现 `try`、`confirm`、`cancel` 这三个方法，来达到最终一致性。

正常情况下，会执行 `try`、`confirm` 方法。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-tcc-confirm.png)

出现异常的话，会执行 `try`、`cancel` 方法。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-tcc-cancel.png)

Try 阶段出现问题的话，可以执行 Cancel。**那如果 Confirm 或者 Cancel 阶段失败了怎么办呢？**

TCC 会记录事务日志并持久化事务日志到某种存储介质上比如本地文件、关系型数据库、ZooKeeper，事务日志包含了事务的执行状态，通过事务执行状态可以判断出事务是提交成功了还是提交失败了，以及具体失败在哪一步。如果发现是 Confirm 或者 Cancel 阶段失败的话，会进行重试，继续尝试执行 Confirm 或者 Cancel 阶段的逻辑。重试次数由具体框架决定，超过最大重试次数仍未成功的，通常需要告警并进入人工介入流程。

如果代码没有特殊 Bug 的话，Confirm 或者 Cancel 阶段出现问题的概率是比较小的。

TCC 落地时有三个非常经典的工程问题：

1. **幂等性**：Confirm 和 Cancel 可能因为网络超时、TC 重试等原因被重复调用，必须保证多次执行结果一致。常见做法是在数据库中维护事务状态表，每次执行前先检查状态。
2. **空回滚**：Try 请求因为网络问题没有真正到达 RM，但 TM 已经发起 Cancel。此时 Cancel 面对的是“从未 Try 过的事务”，需要识别并直接返回成功，避免误执行回滚逻辑。
3. **悬挂**：Cancel 比 Try 先到达 RM，随后 Try 才姗姗来迟。如果 Try 继续预留资源，这份资源就可能永远没人 Confirm/Cancel。解决思路是在 Try 中先检查该事务是否已经被 Cancel 过，若已 Cancel 则拒绝执行 Try。

**事务日志会被删除吗？** 会的。如果事务提交成功（没有抛出任何异常），就可以删除对应的事务日志，节省资源。

**TCC 模式不需要依赖于底层数据资源的事务支持，但是需要我们手动实现更多的代码**，属于 **侵入业务代码** 的一种分布式解决方案。

TCC 事务模型的思想类似 2PC，我简单花了一张图对比一下二者。

![2PC 对比 TCC](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/2pc-vs-tcc.png)

**TCC 和 2PC/3PC 有什么区别呢？**

- 2PC/3PC 依靠数据库或者存储资源层面的事务，TCC 主要通过修改业务代码来实现。
- 2PC/3PC 属于业务代码无侵入的，TCC 对业务代码有侵入。
- 2PC/3PC 追求的是强一致性，在两阶段提交的整个过程中，一直会持有数据库的锁。TCC 追求的是最终一致性，不会一直持有各个业务资源的锁。

针对 TCC 的实现，业界也有一些不错的开源框架。不同的框架对于 TCC 的实现可能略有不同，不过大致思想都一样。

1. **[ByteTCC](https://github.com/liuyangming/ByteTCC)**：ByteTCC 是基于 Try-Confirm-Cancel（TCC）机制的分布式事务管理器的实现。相关阅读：[关于如何实现一个 TCC 分布式事务框架的一点思考](https://www.bytesoft.org/how-to-impl-tcc/)
2. **[Seata](https://seata.apache.org/zh-cn/)**：Seata 是一款开源的分布式事务解决方案，同时支持 AT、TCC、Saga、XA 四种模式。这里说的是它的 TCC 模式。
3. **[Hmily](https://gitee.com/dromara/hmily)**：金融级分布式事务解决方案。新项目选型时建议同时评估社区活跃度和 Seata 等替代方案。

### AT 模式（自动补偿）

AT（Automatic Transaction）模式是 Seata 的核心模式之一，目标是在尽量少改业务代码的前提下提供最终一致能力。它可以理解为“自动补偿”方案：业务仍然按本地事务提交，但框架会记录回滚所需的信息。

AT 模式大致分为两个阶段：

1. **一阶段**：业务 SQL 正常执行并提交本地事务，同时 Seata 代理数据源会解析 SQL，记录数据的 before image / after image 到 `undo_log` 表，并向 TC 注册分支事务。
2. **二阶段提交**：如果全局事务提交，TC 通知 RM 异步删除 `undo_log`。
3. **二阶段回滚**：如果全局事务回滚，RM 根据 `undo_log` 生成反向补偿 SQL，将数据恢复到 before image。

AT 模式的优点是业务侵入低，适合大量基于关系型数据库的常规 CRUD 场景；缺点是对 SQL 类型、表主键、全局锁、隔离级别等有要求，不适合所有复杂 SQL 和跨非关系型资源场景。

### TCC vs Saga

| 维度         | TCC                                  | Saga                                   |
| ------------ | ------------------------------------ | -------------------------------------- |
| 资源处理     | Try 阶段预留或冻结资源               | 每一步本地事务直接提交                 |
| 隔离性       | 通过业务预留实现“伪隔离”             | 隔离性弱，已提交结果可能被其他事务看到 |
| 业务侵入     | 高，需要 Try/Confirm/Cancel 三套逻辑 | 高，需要每一步正向操作和补偿操作       |
| 适合事务长度 | 更适合短链路、资源预留明确的场景     | 更适合长链路、多步骤流程               |
| 典型场景     | 转账、库存冻结、优惠券锁定           | 订单履约、旅行预订、审批流             |

### MQ 事务

RocketMQ、Kafka、Pulsar、QMQ 都提供了事务相关的功能。事务允许事件流应用将消费、处理、生产消息整个过程定义为一个原子操作。

这里我们拿 RocketMQ 来说（图源：《消息队列高手课》）。相关阅读：[RocketMQ 事务消息参考文档](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)。

![](https://img-blog.csdnimg.cn/2021060810404597.png)

1. MQ 发送方（比如物流服务）在消息队列上开启一个事务，然后发送一个“半消息”给 MQ Server/Broker。事务提交之前，半消息对于 MQ 订阅方/消费者（比如第三方通知服务）不可见
2. “半消息”发送成功的话，MQ 发送方就开始执行本地事务。
3. MQ 发送方的本地事务执行成功的话，“半消息”变成正常消息，可以正常被消费。MQ 发送方的本地事务执行失败的话，会直接回滚。

从上面的流程中可以看出，RocketMQ 的事务消息借鉴了两阶段提交的思想：先发送半消息，半消息对消费者不可见；等本地事务执行成功之后，再提交半消息，使其变为正常消息并被消费者消费。它并不是传统 XA 语义下的 2PC，而是 MQ 为了保证“本地事务结果”和“消息可见性”最终一致设计的一套机制。

**如果 MQ 发送方提交或者回滚事务消息时失败怎么办？**

RocketMQ 中的 Broker 会定期去 MQ 发送方上反查这个事务的本地事务的执行情况，并根据反查结果决定提交或者回滚这个事务。

事务反查机制的实现依赖于我们业务代码实现的对应的接口，比如你要查看创建物流信息的本地事务是否执行成功的话，直接在数据库中查询对应的物流信息是否存在即可。

![](https://img-blog.csdnimg.cn/20210608114710962.png)

**如果正常消息没有被正确消费怎么办呢？**

消息消费失败的话，RocketMQ 会自动进行消费重试。如果超过最大重试次数这个消息还是没有正确消费，RocketMQ 就会认为这个消息有问题，然后将其放到 **死信队列**。

![](https://img-blog.csdnimg.cn/20210608120207740.png)

进入死信队列的消息一般需要人工处理，手动排查问题。

**QMQ** 的事务消息就没有 RocketMQ 实现的那么复杂了，它借助了数据库自带的事务功能。其核心思想其实就是 eBay 提出的 **本地消息表** 方案，将分布式事务拆分成本地事务进行处理。

我们维护一个本地消息表用来存放消息发送的状态，保存消息发送情况到本地消息表的操作和业务操作要在一个事务里提交。这样的话，业务执行成功代表消息表也写入成功。

然后，我们再单独起一个线程定时轮询消息表，把没处理的消息发送到消息中间件。

消息发送成功后，更新消息状态为成功或者直接删除消息。

两类方案的核心差异在于对 MQ 可用性的依赖：

- **RocketMQ 事务消息**：本地事务本身不依赖 Broker，但执行本地事务之前需要先成功发送半消息。Broker 不可用时，半消息发送会失败，应用层需要决定是快速失败、重试，还是降级到其他补偿流程，不能简单理解为“整个应用挂掉”。
- **QMQ / 本地消息表**：消息先写入业务方本地数据库，并且和业务操作处于同一个本地事务中。MQ 短暂不可用不影响业务事务提交，后续由独立线程继续投递。

因此，本地消息表方案对 MQ 短暂不可用的容忍度更高，但代价是业务方需要维护消息表、投递线程、重试策略、幂等消费和对账机制。QMQ 只是把这套本地消息表方案封装得更完整、更开箱即用。

相关阅读： [面试官：RocketMQ 分布式事务消息的缺点？](https://mp.weixin.qq.com/s/cBx1l1zaThN6_808fMl27g)

### Saga

Saga 绝对可以说是历史非常悠久了，Saga 事务理论在 1987 年 Hector & Kenneth 在 ACM 发表的论文 [《Sagas》](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf) 中就被提出了，早于分布式事务概念的提出。

Saga 属于长事务解决方案，其核心思想是将长事务拆分为多个本地短事务（本地短事务序列）。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-transaction/distributed-transaction-saga.png)

- 长事务 —> T1,T2 ~ Tn 个本地短事务
- 每个短事务都有一个补偿动作 —> C1,C2 ~ Cn

下图来自于 [微软技术文档—Saga 分布式事务](https://docs.microsoft.com/zh-cn/azure/architecture/reference-architectures/saga/saga) 。

![](https://img-blog.csdnimg.cn/20210611101344496.png)

如果 T1,T2 ~ Tn 这些短事务都能顺利完成的话，整个事务也就顺利结束，否则，将采取恢复模式。

**反向恢复**：

- 简介：如果 Ti 短事务提交失败，则补偿所有已完成的事务（一直执行 Ci 对 Ti 进行补偿）。
- 执行顺序：T1，T2，……，Ti（失败），Ci（补偿），……，C2，C1。

**正向恢复**：

- 简介：如果 Ti 短事务提交失败，则一直对 Ti 进行重试，直至成功为止。
- 执行顺序：T1，T2，……，Ti（失败），Ti（重试）……，Ti+1，……，Tn。

和 TCC 类似，Saga 正向操作与补偿操作都需要业务开发者自己实现，因此也属于 **侵入业务代码** 的一种分布式解决方案。和 TCC 很大的一点不同是 Saga 没有“Try” 动作，它的本地事务 Ti 直接被提交。因此，性能非常高！

补偿操作本身也是业务代码，同样可能因为网络、外部依赖不可用、业务规则变化等原因失败。Saga 框架通常采用“持续重试 + 最大重试上限 + 人工干预”的策略处理补偿失败，因此补偿动作必须设计为幂等。为了提高容错性（比如 Saga 系统本身也可能会崩溃），保证所有的短事务都得以提交或补偿，我们还需要将这些操作通过日志记录下来（Saga log，类似于数据库的日志机制）。这样，Saga 系统恢复之后，我们就知道短事务执行到哪里了或者补偿操作执行到哪里了。

另外，因为 Saga 没有进行“Try” 动作预留资源，所以不能保证隔离性。这也是 Saga 比较大的一个缺点。

针对 Saga 的实现，业界也有一些不错的开源框架。不同的框架对于 Saga 的实现可能略有不同，不过大致思想都一样。

1. **[ServiceComb Pack](https://github.com/apache/servicecomb-pack)**：微服务应用的数据最终一致性解决方案。
2. **[Seata](https://seata.apache.org/zh-cn/)**：Seata 是一款开源的分布式事务解决方案，Saga 是它支持的模式之一。

### 最大努力通知

最大努力通知是一种更轻量的最终一致方案，常见于支付回调、物流状态通知、积分发放等场景。

它的思路很简单：发起方完成本地事务后，尽最大努力把结果通知给接收方。如果通知失败，就按照固定间隔或指数退避持续重试；接收方接口必须保证幂等。超过最大重试次数后，一般进入人工处理或对账补偿。

最大努力通知可以看作本地消息表方案的简化变体：它可以不引入 MQ，由发起方直接重试调用接收方接口；但可靠性和削峰能力通常不如“本地消息表 + MQ + 消费幂等”的完整方案。

## Seata 综合方案简介

Seata 是国内比较常见的一站式分布式事务解决方案，核心角色包括：

- **TC（Transaction Coordinator）**：事务协调者，维护全局事务和分支事务状态。
- **TM（Transaction Manager）**：事务管理器，定义全局事务边界，负责开启、提交或回滚全局事务。
- **RM（Resource Manager）**：资源管理器，管理分支事务资源，向 TC 注册分支事务并上报状态。

Seata 支持多种事务模式：

| 模式 | 业务侵入 | 一致性目标            | 典型特点                             | 适用场景                   |
| ---- | -------- | --------------------- | ------------------------------------ | -------------------------- |
| AT   | 低       | 最终一致              | 自动生成 `undo_log`，二阶段自动补偿  | 常规关系型数据库 CRUD      |
| TCC  | 高       | 最终一致 / 业务强约束 | 业务实现 Try/Confirm/Cancel          | 需要资源预留的短链路事务   |
| Saga | 高       | 最终一致              | 长事务拆成本地事务 + 补偿            | 长流程、多服务编排         |
| XA   | 低       | 强一致倾向            | 依赖数据库 XA 能力，资源锁持有时间长 | 短事务、强一致、低并发场景 |

因此，不建议把 Seata 简单归类为 TCC 或 Saga 框架。实际选型时，要根据业务侵入度、数据库支持情况、链路长度、性能要求和一致性要求，在 AT / TCC / Saga / XA 中选择合适模式。

## 荐文

为了方便大家进一步学习，精选了一些不错的文章（中文）供小伙伴参考

> **[深度剖析 Saga 分布式事务](https://segmentfault.com/a/1190000041001954)**
>
> **[分布式事务最经典的七种解决方案](https://segmentfault.com/a/1190000040321750)**
>
> **[分布式事务的这些常见用法都有坑，来看看正确姿势](https://segmentfault.com/a/1190000041031586)**
>
> 叶东富 👍👍👍👍👍

写的很不错，总结的方案非常全面深入。

> [对比 7 种分布式事务方案，还是偏爱阿里开源的 Seata，真香！(原理+实战)](https://mp.weixin.qq.com/s/sXVSFqq2UZ6Pwwt7vx7vIA)
>
> 码猿技术专栏 🗓️2021-10-25 👍👍👍👍👍

介绍一些目前主流的几种分布式解决方案以及阿里开源的一站式分布式解决方案 Seata。

这篇文章不仅介绍了理论，还实战了 Seata 的 AT 模式。

> **[Seata 分布式事务实践和开源详解 | GIAC 实录](https://www.sofastack.tech/blog/seata-distributed-transaction-deep-dive/)**
>
> 张森 🗓️2019-07-02 👍👍👍👍👍

这篇文章是蚂蚁金服技术专家、分布式事务 Seata 发起者之一张森（花名：绍辉）在 GIAC 全球互联网架构大会的分享。文章内容详细介绍了分布式事务问题产生原因以及蚂蚁金服的应对措施（分布式事务 Seata 的 AT、TCC、Saga 和 XA 四种模式）。

文中有很多生动的配图帮助我们理解！实属是一篇顶级好文！

> **[1.4 w 字，25 张图让你彻底掌握分布式事务原理](https://mp.weixin.qq.com/s/qeUfEJFYCfyDjgzDnq_Jdw)**
>
> 码海 🗓️2020-10-30 👍👍👍👍👍

主要介绍了单数据源事务 & 多数据源事务、常见分布式事务解决方案以及 Seata in AT mode 的实现。

> **[6 张图带你彻底搞懂分布式事务 XA 模式](https://mp.weixin.qq.com/s/Rp8paKc2bQhERBGDKtpMcA)**
>
> 朱晋君 🗓️2021-04-25 👍👍👍

阿里巴巴云原生的一篇文章，主要介绍了 XA 模式以及 Seata 对 XA 模式的实现和优化。介绍的比较泛，需要结合一些相关文章来深入了解。

## 分布式事务开源项目

1. **[Seata](https://seata.apache.org/zh-cn/)**：Seata 是一款开源的分布式事务解决方案，支持 AT、TCC、Saga、XA 等模式，致力于在微服务架构下提供高性能和简单易用的分布式事务服务。
2. **[Hmily](https://gitee.com/dromara/hmily)**：Hmily 是一款高性能、金融级柔性分布式事务解决方案，主要提供 TCC、TAC（自动生成回滚 SQL）等方案。新项目选型时建议关注其社区活跃度，并与 Seata、DTM 等方案一起评估。
3. **[Raincat](https://gitee.com/dromara/Raincat)**：2 阶段提交分布式事务中间件。
4. **[Myth](https://gitee.com/dromara/myth)**：采用消息队列解决分布式事务的开源框架，基于 Java 语言开发（JDK 1.8），支持 Dubbo、Spring Cloud、Motan 等 RPC 框架。

## 参考

- [分布式系统的一致性协议之 2PC 和 3PC - Matt -2018](https://matt33.com/2018/07/08/distribute-system-consistency-protocol/)
- [Dealing Distributed Transactions with 2PC, 3PC, Local Transaction Table with MQs - Adrian -2021](https://masteranyfield.com/2021/07/26/dealing-distributed-transactions-with-2pc-3pc-local-transaction-table-with-mqs/)
- [怎么理解 3PC 解决了 2PC 的阻塞问题？ - 知乎提问](https://www.zhihu.com/question/422691164)
- [Apache Seata 官方文档](https://seata.apache.org/docs/overview/what-is-seata/)
- [Seata XA 模式](https://seata.apache.org/zh-cn/docs/user/mode/xa)
- [Seata TCC Fence：幂等、空回滚和悬挂问题](https://seata.apache.org/blog/seata-tcc-fence)
- [RocketMQ 事务消息官方文档](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)
