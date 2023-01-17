---
title: 有了 HTTP 协议，为什么还要有 RPC ？
category: 分布式
tag:
  - rpc
---

> 本文来自[小白debug](https://juejin.cn/user/4001878057422087)投稿，原文：https://juejin.cn/post/7121882245605883934 。

我想起了我刚工作的时候，第一次接触 RPC 协议，当时就很懵，我 HTTP 协议用的好好的，为什么还要用 RPC 协议？

于是就到网上去搜。

不少解释显得非常官方，我相信大家在各种平台上也都看到过，解释了又好像没解释，都在**用一个我们不认识的概念去解释另外一个我们不认识的概念**，懂的人不需要看，不懂的人看了还是不懂。

这种看了，又好像没看的感觉，云里雾里的很难受，**我懂**。

为了避免大家有强烈的**审丑疲劳**，今天我们来尝试重新换个方式讲一讲。

## 从 TCP 聊起

作为一个程序员，假设我们需要在 A 电脑的进程发一段数据到 B 电脑的进程，我们一般会在代码里使用 socket 进行编程。

这时候，我们可选项一般也就**TCP 和 UDP 二选一。TCP 可靠，UDP 不可靠。** 除非是马总这种神级程序员（早期 QQ 大量使用 UDP），否则，只要稍微对可靠性有些要求，普通人一般无脑选 TCP 就对了。

类似下面这样。

```ini
fd = socket(AF_INET,SOCK_STREAM,0);
```

其中`SOCK_STREAM`，是指使用**字节流**传输数据，说白了就是**TCP 协议**。

在定义了 socket 之后，我们就可以愉快的对这个 socket 进行操作，比如用`bind()`绑定 IP 端口，用`connect()`发起建连。

![握手建立连接流程](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/f410977cda814d32b0eff3645c385a8a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

在连接建立之后，我们就可以使用`send()`发送数据，`recv()`接收数据。

光这样一个纯裸的 TCP 连接，就可以做到收发数据了，那是不是就够了？

不行，这么用会有问题。

## 使用纯裸 TCP 会有什么问题

八股文常背，TCP 是有三个特点，**面向连接**、**可靠**、基于**字节流**。

![TCP是什么](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/acb4508111cb47d8a3df6734d04818bc~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

这三个特点真的概括的 **非常精辟** ，这个八股文我们没白背。

每个特点展开都能聊一篇文章，而今天我们需要关注的是 **基于字节流** 这一点。

字节流可以理解为一个双向的通道里流淌的二进制数据，也就是 **01 串** 。纯裸 TCP 收发的这些 01 串之间是 **没有任何边界** 的，你根本不知道到哪个地方才算一条完整消息。

![01二进制字节流](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/b82d4fcdd0c4491e979856c93c1750d7~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

正因为这个没有任何边界的特点，所以当我们选择使用 TCP 发送 **"夏洛"和"特烦恼"** 的时候，接收端收到的就是 **"夏洛特烦恼"** ，这时候接收端没发区分你是想要表达 **"夏洛"+"特烦恼"** 还是 **"夏洛特"+"烦恼"** 。

![消息对比](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/4e120d0f1152419585565f693e744a3a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

这就是所谓的 **粘包问题**，之前也写过一篇专门的[文章](https://mp.weixin.qq.com/s/0-YBxU1cSbDdzcZEZjmQYA)聊过这个问题。

说这个的目的是为了告诉大家，纯裸 TCP 是不能直接拿来用的，你需要在这个基础上加入一些 **自定义的规则** ，用于区分 **消息边界** 。

于是我们会把每条要发送的数据都包装一下，比如加入 **消息头** ，消息头里写清楚一个完整的包长度是多少，根据这个长度可以继续接收数据，截取出来后它们就是我们真正要传输的 **消息体** 。

![消息边界长度标志](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/cb29659d4907446e9f70551c44c6369f~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

而这里头提到的 **消息头** ，还可以放各种东西，比如消息体是否被压缩过和消息体格式之类的，只要上下游都约定好了，互相都认就可以了，这就是所谓的 **协议。**

每个使用 TCP 的项目都可能会定义一套类似这样的协议解析标准，他们可能 **有区别，但原理都类似**。

**于是基于 TCP，就衍生了非常多的协议，比如 HTTP 和 RPC。**

## HTTP 和 RPC

### RPC 其实是一种调用方式

我们回过头来看网络的分层图。

![四层网络协议](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/04b603b5bd2443209233deea87816161~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

**TCP 是传输层的协议** ，而基于 TCP 造出来的 HTTP 和各类 RPC 协议，它们都只是定义了不同消息格式的 **应用层协议** 而已。

**HTTP**（**H**yper **T**ext **T**ransfer **P**rotocol）协议又叫做 **超文本传输协议** 。我们用的比较多，平时上网在浏览器上敲个网址就能访问网页，这里用到的就是 HTTP 协议。

![HTTP调用](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/8f07a5d1c72a4c4fa811c6c3b5aadd3d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

而 **RPC**（**R**emote **P**rocedure **C**all）又叫做 **远程过程调用**，它本身并不是一个具体的协议，而是一种 **调用方式** 。

举个例子，我们平时调用一个 **本地方法** 就像下面这样。

```ini
 res = localFunc(req)
```

如果现在这不是个本地方法，而是个**远端服务器**暴露出来的一个方法`remoteFunc`，如果我们还能像调用本地方法那样去调用它，这样就可以**屏蔽掉一些网络细节**，用起来更方便，岂不美哉？

```ini
res = remoteFunc(req)
```

![RPC可以像调用本地方法那样调用远端方法](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/761da6c30af244e19b1c44075d8b4254~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

基于这个思路，大佬们造出了非常多款式的 RPC 协议，比如比较有名的`gRPC`，`thrift`。

值得注意的是，虽然大部分 RPC 协议底层使用 TCP，但实际上 **它们不一定非得使用 TCP，改用 UDP 或者 HTTP，其实也可以做到类似的功能。**

到这里，我们回到文章标题的问题。

### 那既然有 RPC 了，为什么还要有 HTTP 呢？

其实，TCP 是 **70 年** 代出来的协议，而 HTTP 是 **90 年代** 才开始流行的。而直接使用裸 TCP 会有问题，可想而知，这中间这么多年有多少自定义的协议，而这里面就有 **80 年代** 出来的`RPC`。

所以我们该问的不是 **既然有 HTTP 协议为什么要有 RPC** ，而是 **为什么有 RPC 还要有 HTTP 协议?**

现在电脑上装的各种联网软件，比如 xx 管家，xx 卫士，它们都作为客户端（Client） 需要跟服务端（Server） 建立连接收发消息，此时都会用到应用层协议，在这种 Client/Server (C/S) 架构下，它们可以使用自家造的 RPC 协议，因为它只管连自己公司的服务器就 ok 了。

但有个软件不同，浏览器（Browser） ，不管是 Chrome 还是 IE，它们不仅要能访问自家公司的**服务器（Server）** ，还需要访问其他公司的网站服务器，因此它们需要有个统一的标准，不然大家没法交流。于是，HTTP 就是那个时代用于统一 **Browser/Server (B/S)** 的协议。

也就是说在多年以前，**HTTP 主要用于 B/S 架构，而 RPC 更多用于 C/S 架构。但现在其实已经没分那么清了，B/S 和 C/S 在慢慢融合。** 很多软件同时支持多端，比如某度云盘，既要支持**网页版**，还要支持**手机端和 PC 端**，如果通信协议都用 HTTP 的话，那服务器只用同一套就够了。而 RPC 就开始退居幕后，一般用于公司内部集群里，各个微服务之间的通讯。

那这么说的话，**都用 HTTP 得了，还用什么 RPC？**

仿佛又回到了文章开头的样子，那这就要从它们之间的区别开始说起。

### HTTP 和 RPC 有什么区别

我们来看看 RPC 和 HTTP 区别比较明显的几个点。

#### 服务发现

首先要向某个服务器发起请求，你得先建立连接，而建立连接的前提是，你得知道 **IP 地址和端口** 。这个找到服务对应的 IP 端口的过程，其实就是 **服务发现**。

在 **HTTP** 中，你知道服务的域名，就可以通过 **DNS 服务** 去解析得到它背后的 IP 地址，默认 **80 端口**。

而 **RPC** 的话，就有些区别，一般会有专门的中间服务去保存服务名和 IP 信息，比如 **Consul、Etcd、Nacos、ZooKeeper，甚至是 Redis**。想要访问某个服务，就去这些中间服务去获得 IP 和端口信息。由于 DNS 也是服务发现的一种，所以也有基于 DNS 去做服务发现的组件，比如 **CoreDNS**。

可以看出服务发现这一块，两者是有些区别，但不太能分高低。

#### 底层连接形式

以主流的 **HTTP1.1** 协议为例，其默认在建立底层 TCP 连接之后会一直保持这个连接（**keep alive**），之后的请求和响应都会复用这条连接。

而 **RPC** 协议，也跟 HTTP 类似，也是通过建立 TCP 长链接进行数据交互，但不同的地方在于，RPC 协议一般还会再建个 **连接池**，在请求量大的时候，建立多条连接放在池内，要发数据的时候就从池里取一条连接出来，用完放回去，下次再复用，可以说非常环保。

![connection_pool](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/72fcad064c9e4103a11f1a2d579f79b2~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

由于连接池有利于提升网络请求性能，所以不少编程语言的网络库里都会给 HTTP 加个连接池，比如 Go 就是这么干的。

可以看出这一块两者也没太大区别，所以也不是关键。

#### 传输的内容

基于 TCP 传输的消息，说到底，无非都是 **消息头 Header 和消息体 Body。**

**Header** 是用于标记一些特殊信息，其中最重要的是 **消息体长度**。

**Body** 则是放我们真正需要传输的内容，而这些内容只能是二进制 01 串，毕竟计算机只认识这玩意。所以 TCP 传字符串和数字都问题不大，因为字符串可以转成编码再变成 01 串，而数字本身也能直接转为二进制。但结构体呢，我们得想个办法将它也转为二进制 01 串，这样的方案现在也有很多现成的，比如 **JSON，Protocol Buffers (Protobuf)** 。

这个将结构体转为二进制数组的过程就叫 **序列化** ，反过来将二进制数组复原成结构体的过程叫 **反序列化**。

![序列化和反序列化](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/d501dfc6f764430188ce61fda0f3e5d9~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

对于主流的 HTTP1.1，虽然它现在叫超文本协议，支持音频视频，但 HTTP 设计 初是用于做网页文本展示的，所以它传的内容以字符串为主。Header 和 Body 都是如此。在 Body 这块，它使用 **JSON** 来 **序列化** 结构体数据。

我们可以随便截个图直观看下。

![HTTP报文](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/04e8a79ddb7247759df23f1132c01655~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

可以看到这里面的内容非常多的冗余，显得非常啰嗦。最明显的，像 Header 里的那些信息，其实如果我们约定好头部的第几位是 `Content-Type`，就不需要每次都真的把 `Content-Type` 这个字段都传过来，类似的情况其实在 Body 的 JSON 结构里也特别明显。

而 RPC，因为它定制化程度更高，可以采用体积更小的 Protobuf 或其他序列化协议去保存结构体数据，同时也不需要像 HTTP 那样考虑各种浏览器行为，比如 302 重定向跳转啥的。**因此性能也会更好一些，这也是在公司内部微服务中抛弃 HTTP，选择使用 RPC 的最主要原因。**

![HTTP原理](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/284c26bb7f2848889d1d9b95cf49decb~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

![RPC原理](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/distributed-system/rpc/edb050d383c644e895e505253f1c4d90~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

当然上面说的 HTTP，其实 **特指的是现在主流使用的 HTTP1.1**，`HTTP2`在前者的基础上做了很多改进，所以 **性能可能比很多 RPC 协议还要好**，甚至连`gRPC`底层都直接用的`HTTP2`。

那么问题又来了。

### 为什么既然有了 HTTP2，还要有 RPC 协议？

这个是由于 HTTP2 是 2015 年出来的。那时候很多公司内部的 RPC 协议都已经跑了好些年了，基于历史原因，一般也没必要去换了。

## 总结

- 纯裸 TCP 是能收发数据，但它是个无边界的数据流，上层需要定义消息格式用于定义 **消息边界** 。于是就有了各种协议，HTTP 和各类 RPC 协议就是在 TCP 之上定义的应用层协议。
- **RPC 本质上不算是协议，而是一种调用方式**，而像 gRPC 和 Thrift 这样的具体实现，才是协议，它们是实现了 RPC 调用的协议。目的是希望程序员能像调用本地方法那样去调用远端的服务方法。同时 RPC 有很多种实现方式，**不一定非得基于 TCP 协议**。
- 从发展历史来说，**HTTP 主要用于 B/S 架构，而 RPC 更多用于 C/S 架构。但现在其实已经没分那么清了，B/S 和 C/S 在慢慢融合。** 很多软件同时支持多端，所以对外一般用 HTTP 协议，而内部集群的微服务之间则采用 RPC 协议进行通讯。
- RPC 其实比 HTTP 出现的要早，且比目前主流的 HTTP1.1 性能要更好，所以大部分公司内部都还在使用 RPC。
- **HTTP2.0** 在 **HTTP1.1** 的基础上做了优化，性能可能比很多 RPC 协议都要好，但由于是这几年才出来的，所以也不太可能取代掉 RPC。