> 授权转载自： https://github.com/wmyskxz/MoreThanJava#part3-redis

![](https://upload-images.jianshu.io/upload_images/7896890-31406a824536c54a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 一、Redis 中的发布/订阅功能

**发布/ 订阅系统** 是 Web 系统中比较常用的一个功能。简单点说就是 **发布者发布消息，订阅者接受消息**，这有点类似于我们的报纸/ 杂志社之类的： *(借用前边的一张图)*

![](https://upload-images.jianshu.io/upload_images/7896890-13aa5cb2668368fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 图片引用自：「消息队列」看过来! - [https://www.wmyskxz.com/2019/07/16/xiao-xi-dui-lie-kan-guo-lai/](https://www.wmyskxz.com/2019/07/16/xiao-xi-dui-lie-kan-guo-lai/)

从我们 *前面(下方相关阅读)* 学习的知识来看，我们虽然可以使用一个 `list` 列表结构结合 `lpush` 和 `rpop` 来实现消息队列的功能，但是似乎很难实现实现 **消息多播** 的功能：

![](https://upload-images.jianshu.io/upload_images/7896890-526a5b110a7c4ea2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为了支持消息多播，**Redis** 不能再依赖于那 5 种基础的数据结构了，它单独使用了一个模块来支持消息多播，这个模块就是 **PubSub**，也就是 **PublisherSubscriber** *(发布者/ 订阅者模式)*。

## PubSub 简介

我们从 *上面的图* 中可以看到，基于 `list` 结构的消息队列，是一种 `Publisher` 与 `Consumer` 点对点的强关联关系，**Redis** 为了消除这样的强关联，引入了另一种概念：**频道** *(channel)*：

![](https://upload-images.jianshu.io/upload_images/7896890-cc3bb012eeca9fca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当 `Publisher` 往 `channel` 中发布消息时，关注了指定 `channel` 的 `Consumer` 就能够同时受到消息。但这里的 **问题** 是，消费者订阅一个频道是必须 **明确指定频道名称** 的，这意味着，如果我们想要 **订阅多个** 频道，那么就必须 **显式地关注多个** 名称。

为了简化订阅的繁琐操作，**Redis** 提供了 **模式订阅** 的功能 **Pattern Subscribe**，这样就可以 **一次性关注多个频道** 了，即使生产者新增了同模式的频道，消费者也可以立即受到消息：

![](https://upload-images.jianshu.io/upload_images/7896890-18ac258e4e9387da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

例如上图中，**所有** 位于图片下方的 **`Consumer` 都能够受到消息**。

`Publisher` 往 `wmyskxz.chat` 这个 `channel` 中发送了一条消息，不仅仅关注了这个频道的 `Consumer 1` 和 `Consumer 2` 能够受到消息，图片中的两个 `channel` 都和模式 `wmyskxz.*` 匹配，所以 **Redis** 此时会同样发送消息给订阅了 `wmyskxz.*` 这个模式的 `Consumer 3` 和关注了在这个模式下的另一个频道 `wmyskxz.log` 下的 `Consumer 4` 和 `Consumer 5`。

另一方面，如果接收消息的频道是 `wmyskxz.chat`，那么 `Consumer 3` 也会受到消息。  

## 快速体验

在 **Redis** 中，**PubSub** 模块的使用非常简单，常用的命令也就下面这么几条：

```bash
# 订阅频道：
SUBSCRIBE channel [channel ....]   # 订阅给定的一个或多个频道的信息
PSUBSCRIBE pattern [pattern ....]  # 订阅一个或多个符合给定模式的频道
# 发布频道：
PUBLISH channel message  # 将消息发送到指定的频道
# 退订频道：
UNSUBSCRIBE [channel [channel ....]]   # 退订指定的频道
PUNSUBSCRIBE [pattern [pattern ....]]  #退订所有给定模式的频道
```

我们可以在本地快速地来体验一下 **PubSub**：

![](https://upload-images.jianshu.io/upload_images/7896890-518e0d1e93135775.gif?imageMogr2/auto-orient/strip)

具体步骤如下：

1. 开启本地 Redis 服务，新建两个控制台窗口；
2. 在其中一个窗口输入 `SUBSCRIBE wmyskxz.chat` 关注 `wmyskxz.chat` 频道，让这个窗口成为 **消费者**。
3. 在另一个窗口输入 `PUBLISH wmyskxz.chat 'message'` 往这个频道发送消息，这个时候就会看到 **另一个窗口实时地出现** 了发送的测试消息。

## 实现原理

可以看到，我们通过很简单的两条命令，几乎就可以简单使用这样的一个 **发布/ 订阅系统** 了，但是具体是怎么样实现的呢？

**每个 Redis 服务器进程维持着一个标识服务器状态** 的 `redis.h/redisServer` 结构，其中就 **保存着有订阅的频道** 以及 **订阅模式** 的信息：

```c
struct redisServer {
    // ...
    dict *pubsub_channels;  // 订阅频道
    list *pubsub_patterns;  // 订阅模式
    // ...
};
```

### 订阅频道原理

当客户端订阅某一个频道之后，Redis 就会往 `pubsub_channels` 这个字典中新添加一条数据，实际上这个 `dict` 字典维护的是一张链表，比如，下图展示的 `pubsub_channels` 示例中，`client 1`、`client 2` 就订阅了 `channel 1`，而其他频道也分别被其他客户端订阅：

![](https://upload-images.jianshu.io/upload_images/7896890-218fc15f7c368eee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### SUBSCRIBE 命令

`SUBSCRIBE` 命令的行为可以用下列的伪代码表示：

```python
def SUBSCRIBE(client, channels):
    # 遍历所有输入频道
    for channel in channels:
        # 将客户端添加到链表的末尾
        redisServer.pubsub_channels[channel].append(client)
```

通过 `pubsub_channels` 字典，程序只要检查某个频道是否为字典的键，就可以知道该频道是否正在被客户端订阅；只要取出某个键的值，就可以得到所有订阅该频道的客户端的信息。

#### PUBLISH 命令

了解 `SUBSCRIBE`，那么 `PUBLISH` 命令的实现也变得十分简单了，只需要通过上述字典定位到具体的客户端，再把消息发送给它们就好了：*(伪代码实现如下)*

```python
def PUBLISH(channel, message):
    # 遍历所有订阅频道 channel 的客户端
    for client in server.pubsub_channels[channel]:
        # 将信息发送给它们
        send_message(client, message)
```

#### UNSUBSCRIBE 命令

使用 `UNSUBSCRIBE` 命令可以退订指定的频道，这个命令执行的是订阅的反操作：它从 `pubsub_channels` 字典的给定频道（键）中，删除关于当前客户端的信息，这样被退订频道的信息就不会再发送给这个客户端。

### 订阅模式原理

![](https://upload-images.jianshu.io/upload_images/7896890-18ac258e4e9387da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

正如我们上面说到了，当发送一条消息到 `wmyskxz.chat` 这个频道时，Redis 不仅仅会发送到当前的频道，还会发送到匹配于当前模式的所有频道，实际上，`pubsub_patterns` 背后还维护了一个 `redis.h/pubsubPattern` 结构：

```c
typedef struct pubsubPattern {
    redisClient *client;  // 订阅模式的客户端
    robj *pattern;        // 订阅的模式
} pubsubPattern;
```

每当调用 `PSUBSCRIBE` 命令订阅一个模式时，程序就创建一个包含客户端信息和被订阅模式的 `pubsubPattern` 结构，并将该结构添加到 `redisServer.pubsub_patterns` 链表中。

我们来看一个 `pusub_patterns` 链表的示例：

![](https://upload-images.jianshu.io/upload_images/7896890-d0d3b1849fdb6162.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个时候客户端 `client 3` 执行 `PSUBSCRIBE wmyskxz.java.*`，那么 `pubsub_patterns` 链表就会被更新成这样：

![](https://upload-images.jianshu.io/upload_images/7896890-edbf11995590de50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通过遍历整个 `pubsub_patterns` 链表，程序可以检查所有正在被订阅的模式，以及订阅这些模式的客户端。

#### PUBLISH 命令

上面给出的伪代码并没有 **完整描述** `PUBLISH` 命令的行为，因为 `PUBLISH` 除了将 `message` 发送到 **所有订阅 `channel` 的客户端** 之外，它还会将 `channel` 和 `pubsub_patterns` 中的 **模式** 进行对比，如果 `channel` 和某个模式匹配的话，那么也将 `message` 发送到 **订阅那个模式的客户端**。

完整描述 `PUBLISH` 功能的伪代码定于如下：

```python
def PUBLISH(channel, message):
    # 遍历所有订阅频道 channel 的客户端
    for client in server.pubsub_channels[channel]:
        # 将信息发送给它们
        send_message(client, message)
    # 取出所有模式，以及订阅模式的客户端
    for pattern, client in server.pubsub_patterns:
        # 如果 channel 和模式匹配
        if match(channel, pattern):
            # 那么也将信息发给订阅这个模式的客户端
            send_message(client, message)
```

#### PUNSUBSCRIBE 命令

使用 `PUNSUBSCRIBE` 命令可以退订指定的模式，这个命令执行的是订阅模式的反操作：序会删除 `redisServer.pubsub_patterns` 链表中，所有和被退订模式相关联的 `pubsubPattern` 结构，这样客户端就不会再收到和模式相匹配的频道发来的信息。

## PubSub 的缺点

尽管 **Redis** 实现了 **PubSub** 模式来达到了 **多播消息队列** 的目的，但在实际的消息队列的领域，几乎 **找不到特别合适的场景**，因为它的缺点十分明显：

- **没有 Ack 机制，也不保证数据的连续：** PubSub 的生产者传递过来一个消息，Redis 会直接找到相应的消费者传递过去。如果没有一个消费者，那么消息会被直接丢弃。如果开始有三个消费者，其中一个突然挂掉了，过了一会儿等它再重连时，那么重连期间的消息对于这个消费者来说就彻底丢失了。
- **不持久化消息：** 如果 Redis 停机重启，PubSub 的消息是不会持久化的，毕竟 Redis 宕机就相当于一个消费者都没有，所有的消息都会被直接丢弃。


基于上述缺点，Redis 的作者甚至单独开启了一个 Disque 的项目来专门用来做多播消息队列，不过该项目目前好像都没有成熟。不过后来在 2018 年 6 月，**Redis 5.0** 新增了 `Stream` 数据结构，这个功能给 Redis 带来了 **持久化消息队列**，从此 PubSub 作为消息队列的功能可以说是就消失了..

![image](https://upload-images.jianshu.io/upload_images/7896890-3a144fda1a0dafcb.gif?imageMogr2/auto-orient/strip)

# 二、更为强大的 Stream | 持久化的发布/订阅系统

**Redis Stream** 从概念上来说，就像是一个 **仅追加内容** 的 **消息链表**，把所有加入的消息都一个一个串起来，每个消息都有一个唯一的 ID 和内容，这很简单，让它复杂的是从 Kafka 借鉴的另一种概念：**消费者组(Consumer Group)** *(思路一致，实现不同)*：

![](https://upload-images.jianshu.io/upload_images/7896890-b9d8afde068a165f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

上图就展示了一个典型的 **Stream** 结构。每个 Stream 都有唯一的名称，它就是 Redis 的 `key`，在我们首次使用 `xadd` 指令追加消息时自动创建。我们对图中的一些概念做一下解释：

- **Consumer Group**：消费者组，可以简单看成记录流状态的一种数据结构。消费者既可以选择使用 `XREAD` 命令进行 **独立消费**，也可以多个消费者同时加入一个消费者组进行 **组内消费**。同一个消费者组内的消费者共享所有的 Stream 信息，**同一条消息只会有一个消费者消费到**，这样就可以应用在分布式的应用场景中来保证消息的唯一性。
- **last_delivered_id**：用来表示消费者组消费在 Stream 上 **消费位置** 的游标信息。每个消费者组都有一个 Stream 内 **唯一的名称**，消费者组不会自动创建，需要使用 `XGROUP CREATE` 指令来显式创建，并且需要指定从哪一个消息 ID 开始消费，用来初始化 `last_delivered_id` 这个变量。
- **pending_ids**：每个消费者内部都有的一个状态变量，用来表示 **已经** 被客户端 **获取**，但是 **还没有 ack** 的消息。记录的目的是为了 **保证客户端至少消费了消息一次**，而不会在网络传输的中途丢失而没有对消息进行处理。如果客户端没有 ack，那么这个变量里面的消息 ID 就会越来越多，一旦某个消息被 ack，它就会对应开始减少。这个变量也被 Redis 官方称为 **PEL** *(Pending Entries List)*。



## 消息 ID 和消息内容

#### 消息 ID

消息 ID 如果是由 `XADD` 命令返回自动创建的话，那么它的格式会像这样：`timestampInMillis-sequence` *(毫秒时间戳-序列号)*，例如 `1527846880585-5`，它表示当前的消息是在毫秒时间戳 `1527846880585` 时产生的，并且是该毫秒内产生的第 5 条消息。

这些 ID 的格式看起来有一些奇怪，**为什么要使用时间来当做 ID 的一部分呢？** 一方面，我们要 **满足 ID 自增** 的属性，另一方面，也是为了 **支持范围查找** 的功能。由于 ID 和生成消息的时间有关，这样就使得在根据时间范围内查找时基本上是没有额外损耗的。

当然消息 ID 也可以由客户端自定义，但是形式必须是 **"整数-整数"**，而且后面加入的消息的 ID 必须要大于前面的消息 ID。

#### 消息内容

消息内容就是普通的键值对，形如 hash 结构的键值对。

## 增删改查示例

增删改查命令很简单，详情如下：

1. `xadd`：追加消息
2. `xdel`：删除消息，这里的删除仅仅是设置了标志位，不影响消息总长度
3. `xrange`：获取消息列表，会自动过滤已经删除的消息
4. `xlen`：消息长度
5. `del`：删除Stream

使用示例：

```bash
# *号表示服务器自动生成ID，后面顺序跟着一堆key/value
127.0.0.1:6379> xadd codehole * name laoqian age 30  #  名字叫laoqian，年龄30岁
1527849609889-0  # 生成的消息ID
127.0.0.1:6379> xadd codehole * name xiaoyu age 29
1527849629172-0
127.0.0.1:6379> xadd codehole * name xiaoqian age 1
1527849637634-0
127.0.0.1:6379> xlen codehole
(integer) 3
127.0.0.1:6379> xrange codehole - +  # -表示最小值, +表示最大值
1) 1) 1527849609889-0
   2) 1) "name"
      2) "laoqian"
      3) "age"
      4) "30"
2) 1) 1527849629172-0
   2) 1) "name"
      2) "xiaoyu"
      3) "age"
      4) "29"
3) 1) 1527849637634-0
   2) 1) "name"
      2) "xiaoqian"
      3) "age"
      4) "1"
127.0.0.1:6379> xrange codehole 1527849629172-0 +  # 指定最小消息ID的列表
1) 1) 1527849629172-0
   2) 1) "name"
      2) "xiaoyu"
      3) "age"
      4) "29"
2) 1) 1527849637634-0
   2) 1) "name"
      2) "xiaoqian"
      3) "age"
      4) "1"
127.0.0.1:6379> xrange codehole - 1527849629172-0  # 指定最大消息ID的列表
1) 1) 1527849609889-0
   2) 1) "name"
      2) "laoqian"
      3) "age"
      4) "30"
2) 1) 1527849629172-0
   2) 1) "name"
      2) "xiaoyu"
      3) "age"
      4) "29"
127.0.0.1:6379> xdel codehole 1527849609889-0
(integer) 1
127.0.0.1:6379> xlen codehole  # 长度不受影响
(integer) 3
127.0.0.1:6379> xrange codehole - +  # 被删除的消息没了
1) 1) 1527849629172-0
   2) 1) "name"
      2) "xiaoyu"
      3) "age"
      4) "29"
2) 1) 1527849637634-0
   2) 1) "name"
      2) "xiaoqian"
      3) "age"
      4) "1"
127.0.0.1:6379> del codehole  # 删除整个Stream
(integer) 1
```

## 独立消费示例

我们可以在不定义消费组的情况下进行 Stream 消息的 **独立消费**，当 Stream 没有新消息时，甚至可以阻塞等待。Redis 设计了一个单独的消费指令 `xread`，可以将 Stream 当成普通的消息队列(list)来使用。使用 `xread` 时，我们可以完全忽略 **消费组(Consumer Group)** 的存在，就好比 Stream 就是一个普通的列表(list)：

```bash
# 从Stream头部读取两条消息
127.0.0.1:6379> xread count 2 streams codehole 0-0
1) 1) "codehole"
   2) 1) 1) 1527851486781-0
         2) 1) "name"
            2) "laoqian"
            3) "age"
            4) "30"
      2) 1) 1527851493405-0
         2) 1) "name"
            2) "yurui"
            3) "age"
            4) "29"
# 从Stream尾部读取一条消息，毫无疑问，这里不会返回任何消息
127.0.0.1:6379> xread count 1 streams codehole $
(nil)
# 从尾部阻塞等待新消息到来，下面的指令会堵住，直到新消息到来
127.0.0.1:6379> xread block 0 count 1 streams codehole $
# 我们从新打开一个窗口，在这个窗口往Stream里塞消息
127.0.0.1:6379> xadd codehole * name youming age 60
1527852774092-0
# 再切换到前面的窗口，我们可以看到阻塞解除了，返回了新的消息内容
# 而且还显示了一个等待时间，这里我们等待了93s
127.0.0.1:6379> xread block 0 count 1 streams codehole $
1) 1) "codehole"
   2) 1) 1) 1527852774092-0
         2) 1) "name"
            2) "youming"
            3) "age"
            4) "60"
(93.11s)
```

客户端如果想要使用 `xread` 进行 **顺序消费**，一定要 **记住当前消费** 到哪里了，也就是返回的消息 ID。下次继续调用 `xread` 时，将上次返回的最后一个消息 ID 作为参数传递进去，就可以继续消费后续的消息。

`block 0` 表示永远阻塞，直到消息到来，`block 1000` 表示阻塞 `1s`，如果 `1s` 内没有任何消息到来，就返回 `nil`：

```bash
127.0.0.1:6379> xread block 1000 count 1 streams codehole $
(nil)
(1.07s)
```

## 创建消费者示例

Stream 通过 `xgroup create` 指令创建消费组(Consumer Group)，需要传递起始消息 ID 参数用来初始化 `last_delivered_id` 变量：

```bash
127.0.0.1:6379> xgroup create codehole cg1 0-0  #  表示从头开始消费
OK
# $表示从尾部开始消费，只接受新消息，当前Stream消息会全部忽略
127.0.0.1:6379> xgroup create codehole cg2 $
OK
127.0.0.1:6379> xinfo codehole  # 获取Stream信息
 1) length
 2) (integer) 3  # 共3个消息
 3) radix-tree-keys
 4) (integer) 1
 5) radix-tree-nodes
 6) (integer) 2
 7) groups
 8) (integer) 2  # 两个消费组
 9) first-entry  # 第一个消息
10) 1) 1527851486781-0
    2) 1) "name"
       2) "laoqian"
       3) "age"
       4) "30"
11) last-entry  # 最后一个消息
12) 1) 1527851498956-0
    2) 1) "name"
       2) "xiaoqian"
       3) "age"
       4) "1"
127.0.0.1:6379> xinfo groups codehole  # 获取Stream的消费组信息
1) 1) name
   2) "cg1"
   3) consumers
   4) (integer) 0  # 该消费组还没有消费者
   5) pending
   6) (integer) 0  # 该消费组没有正在处理的消息
2) 1) name
   2) "cg2"
   3) consumers  # 该消费组还没有消费者
   4) (integer) 0
   5) pending
   6) (integer) 0  # 该消费组没有正在处理的消息
```

## 组内消费示例

Stream 提供了 `xreadgroup` 指令可以进行消费组的组内消费，需要提供 **消费组名称、消费者名称和起始消息 ID**。它同 `xread` 一样，也可以阻塞等待新消息。读到新消息后，对应的消息 ID 就会进入消费者的 **PEL** *(正在处理的消息)* 结构里，客户端处理完毕后使用 `xack` 指令 **通知服务器**，本条消息已经处理完毕，该消息 ID 就会从 **PEL** 中移除，下面是示例：

```bash
# >号表示从当前消费组的last_delivered_id后面开始读
# 每当消费者读取一条消息，last_delivered_id变量就会前进
127.0.0.1:6379> xreadgroup GROUP cg1 c1 count 1 streams codehole >
1) 1) "codehole"
   2) 1) 1) 1527851486781-0
         2) 1) "name"
            2) "laoqian"
            3) "age"
            4) "30"
127.0.0.1:6379> xreadgroup GROUP cg1 c1 count 1 streams codehole >
1) 1) "codehole"
   2) 1) 1) 1527851493405-0
         2) 1) "name"
            2) "yurui"
            3) "age"
            4) "29"
127.0.0.1:6379> xreadgroup GROUP cg1 c1 count 2 streams codehole >
1) 1) "codehole"
   2) 1) 1) 1527851498956-0
         2) 1) "name"
            2) "xiaoqian"
            3) "age"
            4) "1"
      2) 1) 1527852774092-0
         2) 1) "name"
            2) "youming"
            3) "age"
            4) "60"
# 再继续读取，就没有新消息了
127.0.0.1:6379> xreadgroup GROUP cg1 c1 count 1 streams codehole >
(nil)
# 那就阻塞等待吧
127.0.0.1:6379> xreadgroup GROUP cg1 c1 block 0 count 1 streams codehole >
# 开启另一个窗口，往里塞消息
127.0.0.1:6379> xadd codehole * name lanying age 61
1527854062442-0
# 回到前一个窗口，发现阻塞解除，收到新消息了
127.0.0.1:6379> xreadgroup GROUP cg1 c1 block 0 count 1 streams codehole >
1) 1) "codehole"
   2) 1) 1) 1527854062442-0
         2) 1) "name"
            2) "lanying"
            3) "age"
            4) "61"
(36.54s)
127.0.0.1:6379> xinfo groups codehole  # 观察消费组信息
1) 1) name
   2) "cg1"
   3) consumers
   4) (integer) 1  # 一个消费者
   5) pending
   6) (integer) 5  # 共5条正在处理的信息还有没有ack
2) 1) name
   2) "cg2"
   3) consumers
   4) (integer) 0  # 消费组cg2没有任何变化，因为前面我们一直在操纵cg1
   5) pending
   6) (integer) 0
# 如果同一个消费组有多个消费者，我们可以通过xinfo consumers指令观察每个消费者的状态
127.0.0.1:6379> xinfo consumers codehole cg1  # 目前还有1个消费者
1) 1) name
   2) "c1"
   3) pending
   4) (integer) 5  # 共5条待处理消息
   5) idle
   6) (integer) 418715  # 空闲了多长时间ms没有读取消息了
# 接下来我们ack一条消息
127.0.0.1:6379> xack codehole cg1 1527851486781-0
(integer) 1
127.0.0.1:6379> xinfo consumers codehole cg1
1) 1) name
   2) "c1"
   3) pending
   4) (integer) 4  # 变成了5条
   5) idle
   6) (integer) 668504
# 下面ack所有消息
127.0.0.1:6379> xack codehole cg1 1527851493405-0 1527851498956-0 1527852774092-0 1527854062442-0
(integer) 4
127.0.0.1:6379> xinfo consumers codehole cg1
1) 1) name
   2) "c1"
   3) pending
   4) (integer) 0  # pel空了
   5) idle
   6) (integer) 745505
```

## QA 1：Stream 消息太多怎么办？ | Stream 的上限

很容易想到，要是消息积累太多，Stream 的链表岂不是很长，内容会不会爆掉就是个问题了。`xdel` 指令又不会删除消息，它只是给消息做了个标志位。

Redis 自然考虑到了这一点，所以它提供了一个定长 Stream 功能。在 `xadd` 的指令提供一个定长长度 `maxlen`，就可以将老的消息干掉，确保最多不超过指定长度，使用起来也很简单：

```bash
> XADD mystream MAXLEN 2 * value 1
1526654998691-0
> XADD mystream MAXLEN 2 * value 2
1526654999635-0
> XADD mystream MAXLEN 2 * value 3
1526655000369-0
> XLEN mystream
(integer) 2
> XRANGE mystream - +
1) 1) 1526654999635-0
   2) 1) "value"
      2) "2"
2) 1) 1526655000369-0
   2) 1) "value"
      2) "3"
```

如果使用 `MAXLEN` 选项，当 Stream 的达到指定长度后，老的消息会自动被淘汰掉，因此 Stream 的大小是恒定的。目前还没有选项让 Stream 只保留给定数量的条目，因为为了一致地运行，这样的命令必须在很长一段时间内阻塞以淘汰消息。*(例如在添加数据的高峰期间，你不得不长暂停来淘汰旧消息和添加新的消息)*

另外使用 `MAXLEN` 选项的花销是很大的，Stream 为了节省内存空间，采用了一种特殊的结构表示，而这种结构的调整是需要额外的花销的。所以我们可以使用一种带有 `~` 的特殊命令：

```bash
XADD mystream MAXLEN ~ 1000 * ... entry fields here ...
```

它会基于当前的结构合理地对节点执行裁剪，来保证至少会有 `1000` 条数据，可能是 `1010` 也可能是 `1030`。

## QA 2：PEL 是如何避免消息丢失的？


在客户端消费者读取 Stream 消息时，Redis 服务器将消息回复给客户端的过程中，客户端突然断开了连接，消息就丢失了。但是 PEL 里已经保存了发出去的消息 ID，待客户端重新连上之后，可以再次收到 PEL 中的消息 ID 列表。不过此时 `xreadgroup` 的起始消息 ID 不能为参数 `>` ，而必须是任意有效的消息 ID，一般将参数设为 `0-0`，表示读取所有的 PEL 消息以及自 `last_delivered_id` 之后的新消息。


## Redis Stream Vs Kafka

Redis 基于内存存储，这意味着它会比基于磁盘的 Kafka 快上一些，也意味着使用 Redis 我们 **不能长时间存储大量数据**。不过如果您想以 **最小延迟** 实时处理消息的话，您可以考虑 Redis，但是如果 **消息很大并且应该重用数据** 的话，则应该首先考虑使用 Kafka。

另外从某些角度来说，`Redis Stream` 也更适用于小型、廉价的应用程序，因为 `Kafka` 相对来说更难配置一些。


# 相关阅读

1. Redis(1)——5种基本数据结构 - [https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/](https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/)
2. Redis(2)——跳跃表 - [https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/](https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/)
3. Redis(3)——分布式锁深入探究 - [https://www.wmyskxz.com/2020/03/01/redis-3/](https://www.wmyskxz.com/2020/03/01/redis-3/)
4. Reids(4)——神奇的HyperLoglog解决统计问题 - [https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/](https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/)
5. Redis(5)——亿级数据过滤和布隆过滤器 - [https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/](https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/)
6. Redis(6)——GeoHash查找附近的人[https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/](https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/)
7. Redis(7)——持久化【一文了解】 - [https://www.wmyskxz.com/2020/03/13/redis-7-chi-jiu-hua-yi-wen-liao-jie/](https://www.wmyskxz.com/2020/03/13/redis-7-chi-jiu-hua-yi-wen-liao-jie/)


# 参考资料

1. 订阅与发布——Redis 设计与实现 - [https://redisbook.readthedocs.io/en/latest/feature/pubsub.html](https://redisbook.readthedocs.io/en/latest/feature/pubsub.html)
2. 《Redis 深度历险》 - 钱文品/ 著 - [https://book.douban.com/subject/30386804/](https://book.douban.com/subject/30386804/)
3. Introduction to Redis Streams【官方文档】 - [https://redis.io/topics/streams-intro](https://redis.io/topics/streams-intro)
4. Kafka vs. Redis: Log Aggregation Capabilities and Performance - [https://logz.io/blog/kafka-vs-redis/](https://logz.io/blog/kafka-vs-redis/)
