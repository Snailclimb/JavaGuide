---
title: RabbitMQ 常见问题总结
description: RabbitMQ 常见面试题与知识点总结，涵盖 AMQP 协议、Exchange 交换机类型（Direct/Topic/Fanout）、消息确认机制、死信队列、延迟队列、优先级队列、Quorum Queue、Streams 等内容。
category: 高性能
tag:
  - 消息队列
head:
  - - meta
    - name: keywords
      content: RabbitMQ,AMQP协议,Exchange交换机,消息确认,死信队列,延迟队列,优先级队列,RabbitMQ集群,消息队列面试
---

RabbitMQ 现在不能只按“Exchange + Queue”那套老答案准备。RabbitMQ 4.0 已经移除镜像队列；需要复制和高可用时，主要看 Quorum Queue；需要日志型存储、历史回放或大量堆积时，再评估 Streams。

这篇文章按 RabbitMQ 4.x 最新版本为核心介绍，同时保留 3.x 老集群里还会遇到的镜像队列问题。重点看四件事：AMQP 模型怎么工作，Exchange 怎么路由，消息可靠性怎么保证，以及 Classic Queue、Quorum Queue、Streams 该怎么选。

## RabbitMQ 是什么？

RabbitMQ 是用 Erlang 编写的开源消息中间件，最常用的是 AMQP 0-9-1，同时也支持 AMQP 1.0、MQTT、STOMP 等协议。

它在系统中扮演 Broker 角色：生产者把消息发到交换器，交换器按照绑定规则把消息路由到队列，消费者再从队列取走消息。RabbitMQ 的优势主要体现在路由能力、确认机制、插件体系和多语言客户端生态上。

## RabbitMQ 特点

- **可靠性**：支持消息持久化、消费者手动 Ack、Publisher Confirms、死信交换器等机制。
- **灵活的路由**：消息先进入交换器，再由交换器根据路由键和绑定关系投递到队列。常见路由用内置交换器就够了，复杂场景也可以组合多个交换器或使用插件。
- **扩展性**：多个 RabbitMQ 节点可以组成集群，队列副本能力由队列类型决定，不能只看“集群”两个字。
- **高可用性**：Quorum Queue 基于 Raft 协议复制数据；Streams 也是复制型数据结构，更适合日志和回放场景。
- **多种协议**：RabbitMQ 除了原生支持 AMQP 协议，还支持 STOMP、MQTT 等多种消息中间件协议。
- **多语言客户端**：RabbitMQ 几乎支持所有常用语言，比如 Java、Python、Ruby、PHP、C#、JavaScript 等。
- **管理界面**：Management UI 可以查看队列、连接、Channel、Exchange、节点状态和常见运行指标。
- **插件机制**：RabbitMQ 通过插件扩展 MQTT、STOMP、Prometheus 监控等能力。

## RabbitMQ 有哪些重要概念？

RabbitMQ 整体上是一个生产者与消费者模型，主要负责接收、存储和转发消息。可以把消息传递的过程想象成：当你将一个包裹送到邮局，邮局会暂存并最终将邮件通过邮递员送到收件人的手上，RabbitMQ 就好比由邮局、邮箱和邮递员组成的一个系统。从计算机术语层面来说，RabbitMQ 模型更像是一种交换机模型。

RabbitMQ 的整体模型架构如下：

![RabbitMQ 4.0 核心架构与消息生命周期流转图](https://oss.javaguide.cn/github/javaguide/high-performance/rabbitmq/rabbitmq-core-architecture-and-message-lifecycle-flow.png)

下面看几个主要对象。

### Producer(生产者) 和 Consumer(消费者)

- **Producer(生产者)** :生产消息的一方（邮件投递者）
- **Consumer(消费者)** :消费消息的一方（邮件收件人）

消息一般由 2 部分组成：**消息头**（或者说是标签 Label）和 **消息体**。消息体也可以称为 **payload**，消息体是不透明的，而消息头则由一系列的可选属性组成，这些属性包括 routing-key（路由键）、priority（相对于其他消息的优先权）、delivery-mode（指出该消息可能需要持久性存储）等。生产者把消息交由 RabbitMQ 后，RabbitMQ 会根据消息头把消息发送给感兴趣的 Consumer(消费者)。

### Exchange(交换器)

在 RabbitMQ 中，消息并不是直接被投递到 **Queue(消息队列)** 中的，中间还必须经过 **Exchange(交换器)** 这一层，**Exchange(交换器)** 会把我们的消息分配到对应的 **Queue(消息队列)** 中。

**Exchange(交换器)** 用来接收生产者发送的消息，再把消息路由到一个或多个队列。如果路由不到，消息可能被返回给生产者，也可能进入备用交换器，或者直接被丢弃，具体取决于发布参数和交换器配置。

**RabbitMQ 的 Exchange(交换器) 有 4 种类型，不同的类型对应着不同的路由策略**：**direct**，**fanout**, **topic**, 和 **headers**，不同类型的 Exchange 转发消息的策略有所区别。这个会在介绍 **Exchange Types(交换器类型)** 的时候介绍到。

> 注意：AMQP 0-9-1 里有一个默认交换器（Default Exchange），它是预声明的 direct 交换器，名称为空字符串 `""`。创建业务交换器时，需要显式指定交换器类型。

生产者将消息发给交换器的时候，一般会指定一个 **RoutingKey(路由键)**，用来指定这个消息的路由规则，而这个 **RoutingKey 需要与交换器类型和绑定键(BindingKey)联合使用才能最终生效**。

RabbitMQ 中通过 **Binding(绑定)** 将 **Exchange(交换器)** 与 **Queue(消息队列)** 关联起来。绑定时通常会指定一个 **BindingKey(绑定键)**，RabbitMQ 根据它判断消息应该进入哪个队列。一个绑定可以理解为一条路由规则，Exchange 和 Queue 可以是多对多关系。

生产者将消息发送给交换器时，通常会带上 RoutingKey。当 BindingKey 和 RoutingKey 按当前交换器类型匹配时，消息会被路由到对应队列。同一个交换器可以绑定多个队列，也允许多个绑定使用相同的 BindingKey。BindingKey 是否参与匹配取决于交换器类型，比如 fanout 交换器会忽略 BindingKey，把消息投递到所有绑定队列。

### Queue(消息队列)

**Queue(消息队列)** 用来保存消息直到发送给消费者。它是消息的容器，也是消息的终点。一个消息可投入一个或多个队列。消息一直在队列里面，等待消费者连接到这个队列将其取走。

**RabbitMQ** 在经典架构中，消息只能存储在 **队列** 中，这一点和 **Kafka** 这种消息中间件相反。Kafka 将消息存储在 **topic（主题）** 这个逻辑层面，而相对应的队列逻辑只是 topic 实际存储文件中的位移标识。RabbitMQ 的生产者生产消息并最终投递到队列中，消费者可以从队列中获取消息并消费。

> RabbitMQ 3.9 开始提供 Streams。Streams 采用 append-only 日志：消息消费后不会从日志里删除，消费者可以按 offset 回放历史消息。事件溯源、日志分发、大量消息堆积这类场景更适合 Streams；普通异步任务仍然优先看 Classic Queue 或 Quorum Queue。

**多个消费者可以订阅同一个队列**，队列中的消息会分发给其中一个消费者处理，而不是每个消费者都收到一份。

> 注意：实际分发效果受 `prefetch_count` 影响。在 AMQP 0-9-1 中，`prefetch_count=0` 表示不限制未确认消息数量，消费者可能一次拿到很多消息。业务处理耗时不稳定时，建议给消费者设置合适的 prefetch 值，避免消息都堆在某个消费者本地。

**RabbitMQ** 不支持队列层面的广播消费。如果希望每个消费者都收到一份消息，通常做法是给每个消费者准备独立队列，再把这些队列绑定到同一个 fanout 或 topic 交换器。

### Broker（消息中间件的服务节点）

对于 RabbitMQ 来说，一个 RabbitMQ Broker 可以简单地看作一个 RabbitMQ 服务节点，或者 RabbitMQ 服务实例。大多数情况下也可以将一个 RabbitMQ Broker 看作一台 RabbitMQ 服务器。

### Exchange Types(交换器类型)

RabbitMQ 常用的 Exchange Type 有 **fanout**、**direct**、**topic**、**headers** 这四种（AMQP 规范里还提到两种 Exchange Type，分别为 system 与自定义，这里不予以描述）。

![RabbitMQ Exchange 四种类型对比](https://oss.javaguide.cn/github/javaguide/high-performance/rabbitmq/rabbitmq-exchange-types.png)

| 类型    | 路由规则                                           | 常见场景                                     |
| ------- | -------------------------------------------------- | -------------------------------------------- |
| fanout  | 忽略 RoutingKey，发给所有绑定队列                  | 配置刷新、缓存失效、日志同时分发到多个消费者 |
| direct  | BindingKey 和 RoutingKey 完全匹配                  | 按级别、业务类型或服务名精确分发             |
| topic   | RoutingKey 按 `.` 分段，BindingKey 支持 `*` 和 `#` | 按地域、业务模块、事件类型做多级过滤         |
| headers | 按消息 headers 匹配，支持 `x-match=all` 和 `any`   | 很少使用，能用 topic 表达时一般不选 headers  |

topic 的两个通配符容易混：`*` 只匹配一个单词，`#` 可以匹配零个或多个单词。例如 `order.china.*` 可以匹配 `order.china.beijing`，不能匹配 `order.china.beijing.created`；`#.client.#` 可以匹配 `com.rabbitmq.client`。

## AMQP 是什么?

RabbitMQ 最早围绕 AMQP 0-9-1 实现，生产者、交换器、队列、绑定、路由键这些概念都来自 AMQP 模型。RabbitMQ 还支持 AMQP 1.0、MQTT、STOMP 等协议，不同协议接入时的功能细节会有差异。

RabbitMQ 中的交换器、交换器类型、队列、绑定、路由键等都是遵循的 AMQP 协议中**相应**的概念。

> RabbitMQ 4.0 起原生支持 AMQP 1.0，默认启用，不再依赖旧版 AMQP 1.0 插件做协议转换。AMQP 0-9-1 仍然被继续支持，现有 Java、Spring AMQP 等生态大多还是围绕它展开。新项目是否选择 AMQP 1.0，要看客户端库成熟度、互操作需求以及 RabbitMQ 对 AMQP 1.0 功能的实际支持情况。

**AMQP 0-9-1 里需要区分 AMQ model 和协议层**：

- **AMQ model**：定义交换器、队列、绑定等核心对象，以及消息如何从生产者路由到消费者。
- **Functional Layer**：定义按逻辑类分组的协议命令，例如 exchange、queue、basic、tx 等。
- **Transport Layer**：负责帧处理、Channel 复用、心跳、错误处理和数据表示等。

**AMQP 模型的三大组件**：

- **交换器 (Exchange)**：消息代理服务器中用于把消息路由到队列的组件。
- **队列 (Queue)**：用来存储消息的数据结构，位于硬盘或内存中。
- **绑定 (Binding)**：一套规则，告知交换器消息应该将消息投递给哪个队列。

## 说说生产者 Producer 和消费者 Consumer

**生产者**：

- 消息生产者，就是投递消息的一方。
- 消息一般包含两个部分：**消息体**（payload）和**消息头**（Label/Headers）。

**消费者**：

- 消费消息，也就是接收消息的一方。
- 消费者连接到 RabbitMQ 服务器并订阅队列。业务通常处理消息体；routing key、headers、delivery tag 等属于路由或投递元数据，可以用于日志、幂等和确认处理，但不应该被当成业务消息体本身。

## 说说 Broker 服务节点、Queue 队列、Exchange 交换器？

- **Broker**：可以看做 RabbitMQ 的服务节点。一般情况下一个 Broker 可以看做一个 RabbitMQ 服务器。
- **Queue**：RabbitMQ 的内部对象，用于存储消息。多个消费者可以订阅同一队列，这时队列中的消息会被平摊（轮询）给多个消费者进行处理。
- **Exchange**：生产者将消息发送到交换器，由交换器将消息路由到一个或者多个队列中。当路由不到时，或返回给生产者或直接丢弃。

## 什么是死信队列？如何导致的？

DLX，全称为 `Dead-Letter-Exchange`（死信交换器），当消息在一个队列中变成死信（`dead message`）之后，它能被重新发送到另一个交换器中，这个交换器就是 DLX，绑定 DLX 的队列就称之为死信队列。

**导致死信的常见原因**：

- 消息被拒（`Basic.Reject` 或 `Basic.Nack`）且 `requeue = false`。
- 消息 TTL 过期。
- 队列达到长度限制，消息被丢弃。
- Quorum Queue 中消息返回次数超过 `delivery-limit`。

## 什么是延迟队列？RabbitMQ 怎么实现延迟队列？

延迟队列保存的是延迟消息：消息已经发送到 RabbitMQ，但业务希望它过一段时间后再被消费者拿到。

RabbitMQ 本身是没有延迟队列的，要实现延迟消息，一般有两种方式：

1. 使用 TTL + DLX。消息先进入带 TTL 的队列，过期后被投递到死信交换器，再进入真正消费队列。缺点是容易受到队列头部阻塞影响；如果每种延迟时间都建一组队列，维护成本也会变高。
2. 使用 `rabbitmq-delayed-message-exchange` 插件。它提供 `x-delayed-message` 交换器，可以按消息设置延迟时间。官方 README 的定位是秒、分钟、小时级延迟，最多一两天；如果要做天、周、月级调度，或者要堆积十万、百万级延迟消息，应使用外部存储和调度系统。

也就是说，RabbitMQ 常见延迟消息不是普通队列的原生能力，TTL + DLX 和延迟插件都能做，但都要看延迟规模和可恢复性要求。

## 什么是优先级队列？

RabbitMQ 支持的是消息优先级，队列本身没有优先级区分。优先级队列指同一个队列内部按照消息优先级投递，高优先级消息会更早交给消费者。

Classic Queue 可以通过 `x-max-priority` 参数声明优先级队列，Quorum Queue 也支持优先级。需要注意的是，如果消费速度一直大于生产速度，队列里没有堆积，优先级就很难体现出来。

## RabbitMQ 有哪些工作模式？

- 简单模式
- work 工作模式
- pub/sub 发布订阅模式
- Routing 路由模式
- Topic 主题模式

## RabbitMQ 消息怎么传输？

由于 TCP 连接的创建和销毁开销较大（三次握手、慢启动等），并发连接数也受系统资源限制，RabbitMQ 使用信道（Channel）复用 TCP 连接。Channel 是建立在 TCP 连接上的虚拟通信通道。

> 注意：
>
> - 单个 TCP 连接可承载多个 Channel，但官方建议不超过 100-200 个/连接
> - 每个 Channel 有独立的编号，但共享同一 TCP 连接的流量控制
> - **Channel 不是线程安全的**，多线程应使用不同 Channel 实例

## 如何保证消息的可靠性？

![RabbitMQ 4.0 消息可靠性与队列架构全景图](https://oss.javaguide.cn/github/javaguide/high-performance/rabbitmq/rabbitmq-message-reliability-and-queue-architecture-overview.png)

消息可能在三个环节出问题：生产者到 Broker、Broker 存储期间、Broker 到消费者。

**1. 生产者到 Broker**

生产者端通常同时处理“是否被 Broker 接收”和“是否成功路由到队列”这两件事：

- **Publisher Confirms**：确认消息是否被 Broker 接收。对于持久化消息路由到持久化队列，确认会等消息持久化；对于 Quorum Queue，确认会等多数副本接受。

  ```java
  channel.confirmSelect();
  channel.addConfirmListener((sequenceNumber, multiple) -> {
      // Broker 已处理该序号对应的消息
  }, (sequenceNumber, multiple) -> {
      // Broker 无法处理该消息，记录日志并按业务策略重试
  });
  ```

- **mandatory + Return Listener**：消息到达 Exchange 但没有匹配队列时，生产者可以收到 return。

  ```java
  channel.basicPublish("exchange", "routingKey",
      true,  // mandatory=true
      null,
      messageBody);

  channel.addReturnListener((replyCode, replyText, exchange, routingKey, properties, body) -> {
      // 消息到达 Exchange，但没有路由到任何队列
      log.error("Message returned: {}", replyText);
  });
  ```

只开 Confirm 不够。路由失败的消息也可能收到 `basic.ack`，因为 Broker 已经处理了这次发布；是否进入业务队列，要靠 mandatory return 或 Alternate Exchange 兜住。

- **事务机制**（不推荐）：同步阻塞，吞吐通常比 Publisher Confirms 差很多。
  - 注意：事务机制和 Confirm 机制是互斥的，两者不能共存

**2. Broker 存储期间**

- `delivery_mode=2`：消息按持久化消息处理。
- `durable=true`：队列元数据可在 Broker 重启后恢复。
- 复制型队列：RabbitMQ 4.x 中，镜像队列已移除；需要复制时主要考虑 Quorum Queue 或 Streams。

只设置持久化并不等于消息一定不丢。生产者还要等 Publisher Confirm，消费者也要使用手动 Ack；否则 Broker 宕机、连接断开、消费失败这些场景仍然可能丢数据或重复消费。

**3. Broker 到消费者**

- **手动 Ack**：`basicAck(deliveryTag, multiple)`，确保消费成功后再确认
- **重试机制**：消费失败时可以 `basicNack` 或 `basicReject`，再根据异常类型决定是否 `requeue`
- **死信队列**：达到最大重试次数或被拒绝后路由到 DLQ，后续再告警、补偿或人工处理
- **幂等性保障**：业务层实现，避免重复消费导致的数据不一致。幂等性具体实现方案参考这篇文章：[接口幂等方案总结](https://javaguide.cn/high-availability/idempotency.html)。

> 注意：Alternate Exchange（备用交换器）也能处理路由失败。配置了备用交换器后，无法路由的消息会被转发过去；如果备用交换器也无法路由，并且消息设置了 mandatory，生产者才会收到 return。

## 如何保证 RabbitMQ 消息的顺序性？

RabbitMQ 的 FIFO 只在单个队列内成立，而且会受到消费者数量、prefetch、重试和重新入队影响。常见处理方式有三种：

**1. 单 Consumer 模式**：一个队列只绑定一个消费者。顺序最好保证，吞吐也最容易成为瓶颈。

**2. 分区有序**：按业务 key（如订单 ID）哈希到不同队列，每个队列由独立消费者处理。同一个业务 key 始终进入同一个队列，就能在提高吞吐的同时保留局部顺序。

分区方案有两个坑：队列扩缩容会改变哈希结果，同一个业务 key 的新老消息可能进不同队列；消费失败后重新入队也可能改变后续投递顺序。强顺序业务最好在业务表里加状态机、版本号或唯一约束，不要只依赖 MQ 投递顺序。

**3. 消费者内部排队**：单个消费者先拉消息，再按业务 key 分发到本地内存队列和 Worker 线程。这个方案要自己处理内存堆积、进程宕机丢失、Ack 时机和背压，生产环境慎用。

## 如何保证 RabbitMQ 高可用的？

RabbitMQ 的高可用要分两层看：集群只能让多个节点共同管理元数据和连接；队列里的消息是否复制，要看队列类型。

RabbitMQ 4.x 里，Classic Queue 是非复制队列；镜像队列已经移除；复制型数据结构主要是 Quorum Queue 和 Streams。还在使用 3.x 的老集群时，才会遇到镜像队列的维护问题。

网络分区也要单独处理。普通集群和旧镜像队列都可能受到网络抖动影响，常见策略是配置 `cluster_partition_handling = pause_minority`，让少数派节点暂停服务，避免两边各自继续写入。Quorum Queue 使用 Raft，一致性更明确，但它也需要多数副本可用，不能把它理解成“任何网络故障都能继续服务”。

**单机模式**

Demo 级别的，一般就是你本地启动了玩玩儿的，没人生产用单机模式。

**普通集群模式**

意思就是在多台机器上启动多个 RabbitMQ 实例，每个机器启动一个。你创建的 queue，只会放在一个 RabbitMQ 实例上，但是每个实例都同步 queue 的元数据（元数据可以认为是 queue 的一些配置信息，通过元数据，可以找到 queue 所在实例）。

你消费的时候，实际上如果连接到了另外一个实例，那么那个实例会从 queue 所在实例上拉取数据过来。这方案主要是提高吞吐量的，就是说让集群中多个节点来服务某个 queue 的读写操作。

**镜像集群模式**（Classic Queue Mirroring，已移除）

镜像队列已在 RabbitMQ 4.0 移除。RabbitMQ 3.8 引入 Quorum Queue 作为替代方案，3.13 版本仍能使用镜像队列，但已经废弃。新项目不要再选镜像队列。

这种模式是 RabbitMQ 早期版本的高可用方案。跟普通集群模式不一样的是，在镜像集群模式下，你创建的 queue，无论元数据还是 queue 里的消息都会存在于多个实例上，每个 RabbitMQ 节点都有这个 queue 的一个完整镜像，包含 queue 的全部数据。每次写消息到 queue 的时候，都会自动把消息同步到多个实例的 queue 上。

它的工作方式大致如下：

- Queue 主节点接收消息，同步到 N 个镜像节点
- 主节点宕机时，最老的镜像节点升级为主节点
- 通过管理控制台新增策略，指定数据同步到所有节点或指定数量的节点

优点：

- 任何机器宕机，其他节点包含该 queue 的完整数据
- Consumer 可以切换到其他节点继续消费

缺点：

- 性能开销大，消息需要同步到所有机器上
- 网络带宽压力和消耗重
- 不是真正的分布式架构，是主从复制

**Quorum Queue**（3.8+）

Quorum Queue 是基于 Raft 协议的复制队列，适合长期存在、对数据安全要求高的队列：

- **基于 Raft 协议**：通过日志复制和选举实现一致性
- **仲裁写入**：需要多数节点确认（N/2 + 1）才认为写入成功
- **复制语义更清楚**：比镜像队列更容易处理主节点故障和网络分区
- **适用场景**：订单、支付、库存扣减等不能轻易丢消息的业务链路

Quorum Queue 不适合所有场景。临时队列、高频创建删除队列、极低延迟、大量长期积压（尤其是百万级以上）、大规模 fanout 这类场景，要优先评估 Classic Queue 或 Streams。官方也建议无论队列数量多少，都要做升级和故障演练。

**声明方式（客户端）**：

Java：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");
channel.queueDeclare("my-queue", true, false, false, args);
```

Python：

```python
channel.queue_declare(
    queue='my-queue',
    durable=True,
    arguments={'x-queue-type': 'quorum'}
)
```

> `x-queue-type` 必须在队列声明时提供，不能通过 Policy 后续修改。队列类型一旦确定，就不能把已有 classic queue 直接改成 quorum queue。

## 如何解决消息队列的延时以及过期失效问题？

RabbitMQ 可以设置消息过期时间（TTL）。如果消息在队列中停留时间超过 TTL，就会过期；配置了 DLX 时会进入死信交换器，否则会被丢弃。

如果数据能从数据库等源头恢复，可以用批量重导做补偿：

1. 高峰期先丢弃无法及时处理的数据，保住系统可用性。
2. 低峰期编写临时程序，从数据库查询缺失数据。
3. 把查到的数据重新发送到 MQ 中，让消费者补偿处理。

**示例场景**：

- 假设 1 万个订单积压在 MQ 中未处理
- 其中 1000 个订单因 TTL 过期被丢弃
- 处理方案：从数据库查询这 1000 个订单，重新发送到 MQ 补偿

这个方案有前提：数据库里必须有完整历史数据，补偿消费要做好幂等，消息积压也要有监控告警。否则临时补偿程序很容易把重复数据或脏数据再打一遍。

## 生产环境要关注哪些指标？

**1. 内存水位线**

- 监控 `rabbitmq_memory_limit` 占比
- 告警阈值：默认高水位为 0.4（40%）
- 影响：达到高水位后，RabbitMQ 会阻塞发布连接，生产者写入会变慢甚至停住
- 建议配置：

  ```ini
  vm_memory_high_watermark.relative = 0.4
  vm_memory_high_watermark_paging_ratio = 0.5
  ```

**2. 文件句柄消耗**

- 监控 File Descriptors 使用率
- 连接数突增时，文件句柄耗尽会导致新连接失败，严重时会影响节点稳定性
- 高连接数环境要提前调大系统限制，例如 `ulimit -n 100000`

**3. Channel 创建和销毁速率**

- 监控信道的创建与销毁速率
- 高频创建销毁 Channel 会带来额外 CPU 和 Erlang 进程开销
- Channel 应复用，但也不要在单个连接上无限堆，通常控制在几十到一两百以内

**4. 消息积压深度**

- 监控 Queue 消息数量和 Consumer Lag
- 告警阈值：根据业务定义（如 > 10,000 条）
- 工具：RabbitMQ Management UI、Prometheus + Grafana

**5. 磁盘空间与 I/O**

- 监控磁盘剩余空间和 IOPS
- 告警阈值：磁盘剩余 < 20% 触发告警
- Quorum Queue 对磁盘 I/O 要求较高，建议使用 NVMe SSD

## RabbitMQ 使用中有哪些常见误区？

**误区 1：所有队列都用 Quorum Queue**

Quorum Queue 会把消息复制到多个副本，并且按 Raft 语义确认写入。它适合高可靠队列，但并不适合临时队列、极低延迟、大量短生命周期队列、超大积压和大规模 fanout。吞吐优先时，可以评估非复制 Classic Queue 或 Streams；可靠性优先时，再看 Quorum Queue。

**误区 2：Prefetch Count 越大越好**

Prefetch 太大时，消费者会提前拿走大量消息。服务端队列看起来不堆积，但消息都卡在消费者本地的 Unacked 状态，别的消费者接不到，客户端内存也可能被拖垮。

可以先给一个保守值，再按处理耗时和吞吐压测调整：

```java
channel.basicQos(20);
```

**误区 3：延迟队列插件可以当定时任务系统用**

`rabbitmq-delayed-message-exchange` 适合短时间延迟，不适合长期调度，也不适合堆积十万、百万级延迟消息。大规模延迟任务应该把调度状态放到数据库、Redis、时间轮或调度系统里，到点后再投递 MQ。

**误区 4：网络分区不会发生在我们环境**

跨机房部署、跨可用区部署、交换机抖动都可能触发网络分区。普通集群和旧镜像队列要配置分区恢复策略；需要复制队列时优先评估 Quorum Queue，但也要确认多数副本能落在可靠的可用区拓扑里。

**误区 5：开启事务机制后就不用 Publisher Confirms**

事务机制是同步阻塞模式，官方文档也明确提到它会明显降低吞吐。生产者侧通常优先使用 Publisher Confirms，再配合 mandatory return 或 Alternate Exchange 处理路由失败。
