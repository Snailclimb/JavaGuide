> ## RPC

**RPC（Remote Procedure Call）—远程过程调用** ，它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。RPC协议假定某些传输协议的存在，如TCP或UDP，为通信程序之间携带信息数据。在OSI网络通信模型中，RPC跨越了传输层和应用层。RPC使得开发分布式程序就像开发本地程序一样简单。

**RPC采用客户端（服务调用方）/服务器端（服务提供方）模式，** 都运行在自己的JVM中。客户端只需要引入要使用的接口，接口的实现和运行都在服务器端。RPC主要依赖的技术包括序列化、反序列化和数据传输协议，这是一种定义与实现相分离的设计。

**目前Java使用比较多的RPC方案主要有RMI（JDK自带）、Hessian、Dubbo以及Thrift等。**

**注意： RPC主要指内部服务之间的调用，RESTful也可以用于内部服务之间的调用，但其主要用途还在于外部系统提供服务，因此没有将其包含在本知识点内。**

### 常见RPC框架：

- **RMI（JDK自带）：** JDK自带的RPC
 
   详细内容可以参考：[从懵逼到恍然大悟之Java中RMI的使用](https://blog.csdn.net/lmy86263/article/details/72594760)

- **Dubbo:** Dubbo是 阿里巴巴公司开源的一个高性能优秀的服务框架，使得应用可通过高性能的 RPC 实现服务的输出和输入功能，可以和 Spring框架无缝集成。

  详细内容可以参考：

  - [ 高性能优秀的服务框架-dubbo介绍](https://blog.csdn.net/qq_34337272/article/details/79862899)
  
  - [Dubbo是什么？能做什么？](https://blog.csdn.net/houshaolin/article/details/76408399)
 

- **Hessian：** Hessian是一个轻量级的remotingonhttp工具，使用简单的方法提供了RMI的功能。 相比WebService，Hessian更简单、快捷。采用的是二进制RPC协议，因为采用的是二进制协议，所以它很适合于发送二进制数据。

  详细内容可以参考： [Hessian的使用以及理解](https://blog.csdn.net/sunwei_pyw/article/details/74002351)

- **Thrift：**  Apache Thrift是Facebook开源的跨语言的RPC通信框架，目前已经捐献给Apache基金会管理，由于其跨语言特性和出色的性能，在很多互联网公司得到应用，有能力的公司甚至会基于thrift研发一套分布式服务框架，增加诸如服务注册、服务发现等功能。
  

    详细内容可以参考： [【Java】分布式RPC通信框架Apache Thrift 使用总结](https://www.cnblogs.com/zeze/p/8628585.html)
  
### 如何进行选择：

- **是否允许代码侵入：**  即需要依赖相应的代码生成器生成代码，比如Thrift。
- **是否需要长连接获取高性能：**  如果对于性能需求较高的haul，那么可以果断选择基于TCP的Thrift、Dubbo。
- **是否需要跨越网段、跨越防火墙：** 这种情况一般选择基于HTTP协议的Hessian和Thrift的HTTP Transport。

此外，Google推出的基于HTTP2.0的gRPC框架也开始得到应用，其序列化协议基于Protobuf，网络框架使用的是Netty4,但是其需要生成代码，可扩展性也比较差。  

> ## 消息中间件

**消息中间件，也可以叫做中央消息队列或者是消息队列（区别于本地消息队列，本地消息队列指的是JVM内的队列实现）**，是一种独立的队列系统，消息中间件经常用来解决内部服务之间的 **异步调用问题** 。请求服务方把请求队列放到队列中即可返回，然后等待服务提供方去队列中获取请求进行处理，之后通过回调等机制把结果返回给请求服务方。

异步调用只是消息中间件一个非常常见的应用场景。此外，常用的消息队列应用场景还偷如下几个：
- **解耦 ：** 一个业务的非核心流程需要依赖其他系统，但结果并不重要，有通知即可。
- **最终一致性 ：** 指的是两个系统的状态保持一致，可以有一定的延迟，只要最终达到一致性即可。经常用在解决分布式事务上。
- **广播 ：** 消息队列最基本的功能。生产者只负责生产消息，订阅者接收消息。
- **错峰和流控**


具体可以参考： 
 
[《消息队列深入解析》](https://blog.csdn.net/qq_34337272/article/details/80029918)

当前使用较多的消息队列有ActiveMQ（性能差，不推荐使用）、RabbitMQ、RocketMQ、Kafka等等，我们之前提到的redis数据库也可以实现消息队列，不过不推荐，redis本身设计就不是用来做消息队列的。

-  **ActiveMQ：** ActiveMQ是Apache出品，最流行的，能力强劲的开源消息总线。ActiveMQ是一个完全支持JMS1.1和J2EE 1.4规范的JMSProvider实现,尽管JMS规范出台已经是很久的事情了,但是JMS在当今的J2EE应用中间仍然扮演着特殊的地位。

   具体可以参考： 
   
   [《消息队列ActiveMQ的使用详解》](https://blog.csdn.net/qq_34337272/article/details/80031702)
 
- **RabbitMQ:** RabbitMQ 是一个由 Erlang 语言开发的 AMQP 的开源实现。RabbitMQ 最初起源于金融系统，用于在分布式系统中存储转发消息，在易用性、扩展性、高可用性等方面表现不俗
    > AMQP ：Advanced Message Queue，高级消息队列协议。它是应用层协议的一个开放标准，为面向消息的中间件设计，基于此协议的客户端与消息中间件可传递消息，并不受产品、开发语言等条件的限制。


   具体可以参考：
   
   [《消息队列之 RabbitMQ》](https://www.jianshu.com/p/79ca08116d57)

- **RocketMQ：**
   
   具体可以参考：
   
   [《RocketMQ 实战之快速入门》](https://www.jianshu.com/p/824066d70da8)

   [《十分钟入门RocketMQ》](http://jm.taobao.org/2017/01/12/rocketmq-quick-start-in-10-minutes/) （阿里中间件团队博客）


- **Kafka**：Kafka是一个分布式的、可分区的、可复制的、基于发布/订阅的消息系统（现在官方的描述是“一个分布式流平台”）,Kafka主要用于大数据领域,当然在分布式系统中也有应用。目前市面上流行的消息队列RocketMQ就是阿里借鉴Kafka的原理、用Java开发而得。
  
  具体可以参考：

  [《Kafka应用场景》](http://book.51cto.com/art/201801/565244.htm)
   
  [《初谈Kafka》](https://mp.weixin.qq.com/s?__biz=MzU4NDQ4MzU5OA==&mid=2247484106&idx=1&sn=aa1999895d009d91eb3692a3e6429d18&chksm=fd9854abcaefddbd1101ca5dc2c7c783d7171320d6300d9b2d8e68b7ef8abd2b02ea03e03600#rd)

**推荐阅读：**

[《Kafka、RabbitMQ、RocketMQ等消息中间件的对比 —— 消息发送性能和区别》](https://mp.weixin.qq.com/s?__biz=MzU5OTMyODAyNg==&mid=2247484721&idx=1&sn=11e4e29886e581dd328311d308ccc068&chksm=feb7d144c9c058529465b02a4e26a25ef76b60be8984ace9e4a0f5d3d98ca52e014ecb73b061&scene=21#wechat_redirect)







