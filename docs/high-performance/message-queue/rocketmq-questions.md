# RocketMQ常见问题

本文来自读者 [PR](https://github.com/Snailclimb/JavaGuide/pull/291)。

## 1 单机版消息中心

一个消息中心，最基本的需要支持多生产者、多消费者，例如下：

```java
class Scratch {

    public static void main(String[] args) {
        // 实际中会有 nameserver 服务来找到 broker 具体位置以及 broker 主从信息
        Broker broker = new Broker();
        Producer producer1 = new Producer();
        producer1.connectBroker(broker);
        Producer producer2 = new Producer();
        producer2.connectBroker(broker);

        Consumer consumer1 = new Consumer();
        consumer1.connectBroker(broker);
        Consumer consumer2 = new Consumer();
        consumer2.connectBroker(broker);

        for (int i = 0; i < 2; i++) {
            producer1.asyncSendMsg("producer1 send msg" + i);
            producer2.asyncSendMsg("producer2 send msg" + i);
        }
        System.out.println("broker has msg:" + broker.getAllMagByDisk());

        for (int i = 0; i < 1; i++) {
            System.out.println("consumer1 consume msg：" + consumer1.syncPullMsg());
        }
        for (int i = 0; i < 3; i++) {
            System.out.println("consumer2 consume msg：" + consumer2.syncPullMsg());
        }
    }

}

class Producer {

    private Broker broker;

    public void connectBroker(Broker broker) {
        this.broker = broker;
    }

    public void asyncSendMsg(String msg) {
        if (broker == null) {
            throw new RuntimeException("please connect broker first");
        }
        new Thread(() -> {
            broker.sendMsg(msg);
        }).start();
    }
}

class Consumer {
    private Broker broker;

    public void connectBroker(Broker broker) {
        this.broker = broker;
    }

    public String syncPullMsg() {
        return broker.getMsg();
    }

}

class Broker {

    // 对应 RocketMQ 中 MessageQueue，默认情况下 1 个 Topic 包含 4 个 MessageQueue
    private LinkedBlockingQueue<String> messageQueue = new LinkedBlockingQueue(Integer.MAX_VALUE);

    // 实际发送消息到 broker 服务器使用 Netty 发送
    public void sendMsg(String msg) {
        try {
            messageQueue.put(msg);
            // 实际会同步或异步落盘，异步落盘使用的定时任务定时扫描落盘
        } catch (InterruptedException e) {

        }
    }

    public String getMsg() {
        try {
            return messageQueue.take();
        } catch (InterruptedException e) {

        }
        return null;
    }

    public String getAllMagByDisk() {
        StringBuilder sb = new StringBuilder("\n");
        messageQueue.iterator().forEachRemaining((msg) -> {
            sb.append(msg + "\n");
        });
        return sb.toString();
    }
}
```

问题：  
1. 没有实现真正执行消息存储落盘
2. 没有实现 NameServer 去作为注册中心，定位服务
3. 使用 LinkedBlockingQueue 作为消息队列，注意，参数是无限大，在真正 RocketMQ 也是如此是无限大，理论上不会出现对进来的数据进行抛弃，但是会有内存泄漏问题（阿里巴巴开发手册也因为这个问题，建议我们使用自制线程池）  
4. 没有使用多个队列（即多个 LinkedBlockingQueue），RocketMQ 的顺序消息是通过生产者和消费者同时使用同一个 MessageQueue 来实现，但是如果我们只有一个 MessageQueue，那我们天然就支持顺序消息
5. 没有使用 MappedByteBuffer 来实现文件映射从而使消息数据落盘非常的快（实际 RocketMQ 使用的是 FileChannel+DirectBuffer）

## 2 分布式消息中心

### 2.1 问题与解决

#### 2.1.1 消息丢失的问题

1. 当你系统需要保证百分百消息不丢失，你可以使用生产者每发送一个消息，Broker 同步返回一个消息发送成功的反馈消息
2. 即每发送一个消息，同步落盘后才返回生产者消息发送成功，这样只要生产者得到了消息发送生成的返回，事后除了硬盘损坏，都可以保证不会消息丢失
3. 但是这同时引入了一个问题，同步落盘怎么才能快？

#### 2.1.2 同步落盘怎么才能快

1. 使用 FileChannel + DirectBuffer 池，使用堆外内存，加快内存拷贝  
2. 使用数据和索引分离，当消息需要写入时，使用 commitlog 文件顺序写，当需要定位某个消息时，查询index 文件来定位，从而减少文件IO随机读写的性能损耗

#### 2.1.3 消息堆积的问题

1. 后台定时任务每隔72小时，删除旧的没有使用过的消息信息  
2. 根据不同的业务实现不同的丢弃任务，具体参考线程池的 AbortPolicy，例如FIFO/LRU等（RocketMQ没有此策略）  
3. 消息定时转移，或者对某些重要的 TAG 型（支付型）消息真正落库
   
#### 2.1.4 定时消息的实现

1. 实际 RocketMQ 没有实现任意精度的定时消息，它只支持某些特定的时间精度的定时消息
2. 实现定时消息的原理是：创建特定时间精度的 MessageQueue，例如生产者需要定时1s之后被消费者消费，你只需要将此消息发送到特定的 Topic，例如：MessageQueue-1 表示这个 MessageQueue 里面的消息都会延迟一秒被消费，然后 Broker 会在 1s 后发送到消费者消费此消息，使用 newSingleThreadScheduledExecutor 实现

#### 2.1.5 顺序消息的实现

1. 与定时消息同原理，生产者生产消息时指定特定的 MessageQueue ，消费者消费消息时，消费特定的 MessageQueue，其实单机版的消息中心在一个 MessageQueue 就天然支持了顺序消息
2. 注意：同一个 MessageQueue 保证里面的消息是顺序消费的前提是：消费者是串行的消费该 MessageQueue，因为就算 MessageQueue 是顺序的，但是当并行消费时，还是会有顺序问题，但是串行消费也同时引入了两个问题：
>1. 引入锁来实现串行
>2. 前一个消费阻塞时后面都会被阻塞

#### 2.1.6 分布式消息的实现

1. 需要前置知识：2PC  
2. RocketMQ4.3 起支持，原理为2PC，即两阶段提交，prepared->commit/rollback
3. 生产者发送事务消息，假设该事务消息 Topic 为 Topic1-Trans，Broker 得到后首先更改该消息的 Topic 为 Topic1-Prepared，该 Topic1-Prepared 对消费者不可见。然后定时回调生产者的本地事务A执行状态，根据本地事务A执行状态，来是否将该消息修改为 Topic1-Commit 或 Topic1-Rollback，消费者就可以正常找到该事务消息或者不执行等

>注意，就算是事务消息最后回滚了也不会物理删除，只会逻辑删除该消息

#### 2.1.7 消息的 push 实现

1. 注意，RocketMQ 已经说了自己会有低延迟问题，其中就包括这个消息的 push 延迟问题
2. 因为这并不是真正的将消息主动的推送到消费者，而是 Broker 定时任务每5s将消息推送到消费者
3. pull模式需要我们手动调用consumer拉消息，而push模式则只需要我们提供一个listener即可实现对消息的监听，而实际上，RocketMQ的push模式是基于pull模式实现的，它没有实现真正的push。
4. push方式里，consumer把轮询过程封装了，并注册MessageListener监听器，取到消息后，唤醒MessageListener的consumeMessage()来消费，对用户而言，感觉消息是被推送过来的。

#### 2.1.8 消息重复发送的避免

1. RocketMQ 会出现消息重复发送的问题，因为在网络延迟的情况下，这种问题不可避免的发生，如果非要实现消息不可重复发送，那基本太难，因为网络环境无法预知，还会使程序复杂度加大，因此默认允许消息重复发送
2. RocketMQ 让使用者在消费者端去解决该问题，即需要消费者端在消费消息时支持幂等性的去消费消息
3. 最简单的解决方案是每条消费记录有个消费状态字段，根据这个消费状态字段来判断是否消费或者使用一个集中式的表，来存储所有消息的消费状态，从而避免重复消费
4. 具体实现可以查询关于消息幂等消费的解决方案

#### 2.1.9 广播消费与集群消费

1. 消息消费区别：广播消费，订阅该 Topic 的消息者们都会消费**每个**消息。集群消费，订阅该 Topic 的消息者们只会有一个去消费**某个**消息
2. 消息落盘区别：具体表现在消息消费进度的保存上。广播消费，由于每个消费者都独立的去消费每个消息，因此每个消费者各自保存自己的消息消费进度。而集群消费下，订阅了某个 Topic，而旗下又有多个 MessageQueue，每个消费者都可能会去消费不同的 MessageQueue，因此总体的消费进度保存在 Broker 上集中的管理

#### 2.1.10 RocketMQ 不使用 ZooKeeper 作为注册中心的原因，以及自制的 NameServer 优缺点？

1. ZooKeeper 作为支持顺序一致性的中间件，在某些情况下，它为了满足一致性，会丢失一定时间内的可用性，RocketMQ 需要注册中心只是为了发现组件地址，在某些情况下，RocketMQ 的注册中心可以出现数据不一致性，这同时也是 NameServer 的缺点，因为 NameServer 集群间互不通信，它们之间的注册信息可能会不一致
2. 另外，当有新的服务器加入时，NameServer 并不会立马通知到 Producer，而是由 Producer 定时去请求 NameServer 获取最新的 Broker/Consumer 信息（这种情况是通过 Producer 发送消息时，负载均衡解决）

#### 2.1.11 其它

![][1]

加分项咯 
1. 包括组件通信间使用 Netty 的自定义协议
2. 消息重试负载均衡策略（具体参考 Dubbo 负载均衡策略）
3. 消息过滤器（Producer 发送消息到 Broker，Broker 存储消息信息，Consumer 消费时请求 Broker 端从磁盘文件查询消息文件时,在 Broker 端就使用过滤服务器进行过滤）  
4. Broker 同步双写和异步双写中 Master 和 Slave 的交互
5. Broker 在 4.5.0 版本更新中引入了基于 Raft 协议的多副本选举，之前这是商业版才有的特性 [ISSUE-1046][2]

## 3 参考

1. 《RocketMQ技术内幕》：https://blog.csdn.net/prestigeding/article/details/85233529
2. 关于 RocketMQ 对 MappedByteBuffer 的一点优化：https://lishoubo.github.io/2017/09/27/MappedByteBuffer%E7%9A%84%E4%B8%80%E7%82%B9%E4%BC%98%E5%8C%96/
3. 十分钟入门RocketMQ：https://developer.aliyun.com/article/66101
4. 分布式事务的种类以及 RocketMQ 支持的分布式消息：https://www.infoq.cn/article/2018/08/rocketmq-4.3-release
5. 滴滴出行基于RocketMQ构建企业级消息队列服务的实践：https://yq.aliyun.com/articles/664608
6. 基于《RocketMQ技术内幕》源码注释：https://github.com/LiWenGu/awesome-rocketmq

[1]: https://leran2deeplearnjavawebtech.oss-cn-beijing.aliyuncs.com/somephoto/RocketMQ%E6%B5%81%E7%A8%8B.png
[2]: http://rocketmq.apache.org/release_notes/release-notes-4.5.0/
