---
title: RPC基础知识总结
category: 分布式
tag:
  - rpc
---

这篇文章会简单介绍一下 RPC 相关的基础概念。

## RPC 是什么?

**RPC（Remote Procedure Call）** 即远程过程调用，通过名字我们就能看出 RPC 关注的是远程调用而非本地调用。

**为什么要 RPC ？** 因为，两个不同的服务器上的服务提供的方法不在一个内存空间，所以，需要通过网络编程才能传递方法调用所需要的参数。并且，方法调用的结果也需要通过网络编程来接收。但是，如果我们自己手动网络编程来实现这个调用过程的话工作量是非常大的，因为，我们需要考虑底层传输方式（TCP 还是 UDP）、序列化方式等等方面。

**RPC 能帮助我们做什么呢？** 简单来说，通过 RPC 可以帮助我们调用远程计算机上某个服务的方法，这个过程就像调用本地方法一样简单。并且！我们不需要了解底层网络编程的具体细节。

举个例子：两个不同的服务 A、B 部署在两台不同的机器上，服务 A 如果想要调用服务 B 中的某个方法的话就可以通过 RPC 来做。

一言蔽之：**RPC 的出现就是为了让你调用远程方法像调用本地方法一样简单。**

## RPC 的原理是什么?

为了能够帮助小伙伴们理解 RPC 原理，我们可以将整个 RPC 的 核心功能看作是下面 👇 5 个部分实现的：

1. **客户端（服务消费端）**：调用远程方法的一端。
1. **客户端 Stub（桩）**：这其实就是一代理类。代理类主要做的事情很简单，就是把你调用方法、类、方法参数等信息传递到服务端。
1. **网络传输**：网络传输就是你要把你调用的方法的信息比如说参数啊这些东西传输到服务端，然后服务端执行完之后再把返回结果通过网络传输给你传输回来。网络传输的实现方式有很多种比如最基本的 Socket 或者性能以及封装更加优秀的 Netty（推荐）。
1. **服务端 Stub（桩）**：这个桩就不是代理类了。我觉得理解为桩实际不太好，大家注意一下就好。这里的服务端 Stub 实际指的就是接收到客户端执行方法的请求后，去执行对应的方法然后返回结果给客户端的类。
1. **服务端（服务提供端）**：提供远程方法的一端。

具体原理图如下，后面我会串起来将整个 RPC 的过程给大家说一下。

![RPC原理图](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/37345851.jpg)

1. 服务消费端（client）以本地调用的方式调用远程服务；
1. 客户端 Stub（client stub） 接收到调用后负责将方法、参数等组装成能够进行网络传输的消息体（序列化）：`RpcRequest`；
1. 客户端 Stub（client stub） 找到远程服务的地址，并将消息发送到服务提供端；
1. 服务端 Stub（桩）收到消息将消息反序列化为 Java 对象: `RpcRequest`；
1. 服务端 Stub（桩）根据`RpcRequest`中的类、方法、方法参数等信息调用本地的方法；
1. 服务端 Stub（桩）得到方法执行结果并将组装成能够进行网络传输的消息体：`RpcResponse`（序列化）发送至消费方；
1. 客户端 Stub（client stub）接收到消息并将消息反序列化为 Java 对象:`RpcResponse` ，这样也就得到了最终结果。over!

相信小伙伴们看完上面的讲解之后，已经了解了 RPC 的原理。

虽然篇幅不多，但是基本把 RPC 框架的核心原理讲清楚了！另外，对于上面的技术细节，我会在后面的章节介绍到。

**最后，对于 RPC 的原理，希望小伙伴不单单要理解，还要能够自己画出来并且能够给别人讲出来。因为，在面试中这个问题在面试官问到 RPC 相关内容的时候基本都会碰到。**

## 有哪些常见的 RPC 框架？

我们这里说的 RPC 框架指的是可以让客户端直接调用服务端方法，就像调用本地方法一样简单的框架，比如我下面介绍的 Dubbo、Motan、gRPC 这些。 如果需要和 HTTP 协议打交道，解析和封装 HTTP 请求和响应。这类框架并不能算是“RPC 框架”，比如 Feign。

### Dubbo

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716111053081.png)

Apache Dubbo 是一款微服务框架，为大规模微服务实践提供高性能 RPC 通信、流量治理、可观测性等解决方案，
涵盖 Java、Golang 等多种语言 SDK 实现。

Dubbo 提供了从服务定义、服务发现、服务通信到流量管控等几乎所有的服务治理能力，支持 Triple 协议（基于 HTTP/2 之上定义的下一代 RPC 通信协议）、应用级服务发现、Dubbo Mesh （Dubbo3 赋予了很多云原生友好的新特性）等特性。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716111545343.png)

Dubbo 是由阿里开源，后来加入了 Apache 。正是由于 Dubbo 的出现，才使得越来越多的公司开始使用以及接受分布式架构。

Dubbo 算的是比较优秀的国产开源项目了，它的源码也是非常值得学习和阅读的！

- GitHub：[https://github.com/apache/incubator-dubbo](https://github.com/apache/incubator-dubbo "https://github.com/apache/incubator-dubbo")
- 官网：<https://dubbo.apache.org/zh/>

### Motan

Motan 是新浪微博开源的一款 RPC 框架，据说在新浪微博正支撑着千亿次调用。不过笔者倒是很少看到有公司使用，而且网上的资料也比较少。

很多人喜欢拿 Motan 和 Dubbo 作比较，毕竟都是国内大公司开源的。笔者在查阅了很多资料，以及简单查看了其源码之后发现：**Motan 更像是一个精简版的 Dubbo，可能是借鉴了 Dubbo 的思想，Motan 的设计更加精简，功能更加纯粹。**

不过，我不推荐你在实际项目中使用 Motan。如果你要是公司实际使用的话，还是推荐 Dubbo ，其社区活跃度以及生态都要好很多。

- 从 Motan 看 RPC 框架设计：[http://kriszhang.com/motan-rpc-impl/](http://kriszhang.com/motan-rpc-impl/ "http://kriszhang.com/motan-rpc-impl/")
- Motan 中文文档：[https://github.com/weibocom/motan/wiki/zh_overview](https://github.com/weibocom/motan/wiki/zh_overview "https://github.com/weibocom/motan/wiki/zh_overview")

### gRPC

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/2843b10d-0c2f-4b7e-9c3e-ea4466792a8b.png)

gRPC 是 Google 开源的一个高性能、通用的开源 RPC 框架。其由主要面向移动应用开发并基于 HTTP/2 协议标准而设计（支持双向流、消息头压缩等功能，更加节省带宽），基于 ProtoBuf 序列化协议开发，并且支持众多开发语言。

**何谓 ProtoBuf？** [ProtoBuf（ Protocol Buffer）](https://github.com/protocolbuffers/protobuf) 是一种更加灵活、高效的数据格式，可用于通讯协议、数据存储等领域，基本支持所有主流编程语言且与平台无关。不过，通过 ProtoBuf 定义接口和数据类型还挺繁琐的，这是一个小问题。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716104304033.png)

不得不说，gRPC 的通信层的设计还是非常优秀的，[Dubbo-go 3.0](https://dubbogo.github.io/) 的通信层改进主要借鉴了 gRPC。

不过，gRPC 的设计导致其几乎没有服务治理能力。如果你想要解决这个问题的话，就需要依赖其他组件比如腾讯的 PolarisMesh（北极星）了。

- GitHub：[https://github.com/grpc/grpc](https://github.com/grpc/grpc "https://github.com/grpc/grpc")
- 官网：[https://grpc.io/](https://grpc.io/ "https://grpc.io/")

### Thrift
Apache Thrift is Facebook's open source cross-language RPC communication framework. It has been donated to the Apache Foundation for management. Due to its cross-language features and excellent performance, it is used by many Internet companies. Competent companies will even develop a distributed service framework based on Thrift to add functions such as service registration and service discovery.

`Thrift` supports a variety of **programming languages**, including `C++`, `Java`, `Python`, `PHP`, `Ruby`, etc. (compared to gRPC, it supports more languages).

- Official website: [https://thrift.apache.org/](https://thrift.apache.org/ "https://thrift.apache.org/")
- Brief introduction to Thrift: [https://www.jianshu.com/p/8f25d057a5a9](https://www.jianshu.com/p/8f25d057a5a9 "https://www.jianshu.com/p/8f25d057a5a9")

### Summary

Although gRPC and Thrift support cross-language RPC calls, they only provide the most basic RPC framework functions and lack the support of a series of supporting service components and service governance functions.

Dubbo is the best in terms of functionality, ecosystem, and community activity. Moreover, Dubbo has many successful cases in China such as Dangdang, Didi, etc. It is a mature and stable RPC framework that can withstand the test of production. The most important thing is that you can also find a lot of Dubbo reference materials, and the learning cost is relatively low.

The diagram below shows Dubbo’s ecosystem.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/eee98ff2-8e06-4628-a42b-d30ffcd2831e.png)

Dubbo is also a component in Spring Cloud Alibaba.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/0d195dae-72bc-4956-8451-3eaf6dd11cbd.png)

However, Dubbo and Motan are mainly used by the Java language. Although Dubbo and Motan are currently compatible with some languages, they are not recommended. If you need to call across multiple languages, consider using gRPC.

In summary, if it is a Java back-end technology stack and you are struggling with which RPC framework to choose, I recommend you to consider Dubbo.

## How to design and implement an RPC framework?

**"Handwritten RPC Framework"** is an internal booklet of my [Knowledge Planet] (https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html). I wrote 12 articles to explain how to implement a simple RPC framework from scratch based on Netty+Kyro+Zookeeper.

Although Sparrow is small, it has all the necessary features. The project code has detailed comments and clear structure. It also integrates the Check Style standard code structure, making it very suitable for reading and learning.

**Content Overview**:

![](https://oss.javaguide.cn/github/javaguide/image-20220308100605485.png)

## Now that we have the HTTP protocol, why do we need RPC?

For a detailed answer to this question, please see this article: [With HTTP protocol, why do we need RPC? ](http&rpc.md) .

<!-- @include: @article-footer.snippet.md -->