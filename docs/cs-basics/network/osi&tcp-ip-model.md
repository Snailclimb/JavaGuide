---
title:  OSI 和 TCP/IP 网络分层模型详解（基础）
category: 计算机基础
tag:
  - 计算机网络
---

## OSI 七层模型

**OSI 七层模型** 是国际标准化组织提出一个网络分层模型，其大体结构以及每一层提供的功能如下图所示：

![OSI 七层模型](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/osi-7-model.png)

每一层都专注做一件事情，并且每一层都需要使用下一层提供的功能比如传输层需要使用网络层提供的路由和寻址功能，这样传输层才知道把数据传输到哪里去。

**OSI 的七层体系结构概念清楚，理论也很完整，但是它比较复杂而且不实用，而且有些功能在多个层中重复出现。**

上面这种图可能比较抽象，再来一个比较生动的图片。下面这个图片是我在国外的一个网站上看到的，非常赞！

![osi七层模型2](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/osi七层模型2.png)

**既然 OSI 七层模型这么厉害，为什么干不过 TCP/IP 四 层模型呢？**

的确，OSI 七层模型当时一直被一些大公司甚至一些国家政府支持。这样的背景下，为什么会失败呢？我觉得主要有下面几方面原因：

1. OSI 的专家缺乏实际经验，他们在完成 OSI 标准时缺乏商业驱动力
2. OSI 的协议实现起来过分复杂，而且运行效率很低
3. OSI 制定标准的周期太长，因而使得按 OSI 标准生产的设备无法及时进入市场（20 世纪 90 年代初期，虽然整套的 OSI 国际标准都已经制定出来，但基于 TCP/IP 的互联网已经抢先在全球相当大的范围成功运行了）
4. OSI 的层次划分不太合理，有些功能在多个层次中重复出现。

OSI 七层模型虽然失败了，但是却提供了很多不错的理论基础。为了更好地去了解网络分层，OSI 七层模型还是非常有必要学习的。

最后再分享一个关于 OSI 七层模型非常不错的总结图片！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/osi-model-detail.png)

## TCP/IP 四层模型

**TCP/IP 四层模型** 是目前被广泛采用的一种模型,我们可以将 TCP / IP 模型看作是 OSI 七层模型的精简版本，由以下 4 层组成：

1. 应用层
2. 传输层
3. 网络层
4. 网络接口层

需要注意的是，我们并不能将 TCP/IP 四层模型 和 OSI 七层模型完全精确地匹配起来，不过可以简单将两者对应起来，如下图所示：

![TCP/IP 四层模型](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

### 应用层（Application layer）

**应用层位于传输层之上，主要提供两个终端设备上的应用程序之间信息交换的服务，它定义了信息交换的格式，消息会交给下一层传输层来传输。** 我们把应用层交互的数据单元称为报文。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/5971-2-7I1-20220111095024771-20220111201807861.png)

应用层协议定义了网络通信规则，对于不同的网络应用需要不同的应用层协议。在互联网中应用层协议很多，如支持 Web 应用的 HTTP 协议，支持电子邮件的 SMTP 协议等等。

![应用层重要协议](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/application-layer-protocol.png)

应用层常见协议总结，请看这篇文章：[应用层常见协议总结（应用层）](./application-layer-protocol.md)。

### 传输层（Transport layer）

**传输层的主要任务就是负责向两台终端设备进程之间的通信提供通用的数据传输服务。** 应用进程利用该服务传送应用层报文。“通用的”是指并不针对某一个特定的网络应用，而是多种应用可以使用同一个运输层服务。

**运输层主要使用以下两种协议：**

1. **传输控制协议 TCP**（Transmisson Control Protocol）--提供 **面向连接** 的，**可靠的** 数据传输服务。
2. **用户数据协议 UDP**（User Datagram Protocol）--提供 **无连接** 的，尽最大努力的数据传输服务（不保证数据传输的可靠性）。

![传输层重要协议](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/transport-layer-protocol.png)

### 网络层（Network layer）

**网络层负责为分组交换网上的不同主机提供通信服务。** 在发送数据时，网络层把运输层产生的报文段或用户数据报封装成分组和包进行传送。在 TCP/IP 体系结构中，由于网络层使用 IP 协议，因此分组也叫 IP 数据报，简称数据报。

⚠️注意 ：**不要把运输层的“用户数据报 UDP”和网络层的“IP 数据报”弄混**。

**网络层的还有一个任务就是选择合适的路由，使源主机运输层所传下来的分组，能通过网络层中的路由器找到目的主机。**

这里强调指出，网络层中的“网络”二字已经不是我们通常谈到的具体网络，而是指计算机网络体系结构模型中第三层的名称。

互联网是由大量的异构（heterogeneous）网络通过路由器（router）相互连接起来的。互联网使用的网络层协议是无连接的网际协议（Internet Prococol）和许多路由选择协议，因此互联网的网络层也叫做 **网际层** 或 **IP 层**。

![网络层重要协议](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/nerwork-layer-protocol.png)

**网络层常见协议** ：

- **IP:网际协议** ：网际协议 IP 是TCP/IP协议中最重要的协议之一，也是网络层最重要的协议之一，IP协议的作用包括寻址规约、定义数据包的格式等等，是网络层信息传输的主力协议。目前IP协议主要分为两种，一种是过去的IPv4，另一种是较新的IPv6，目前这两种协议都在使用，但后者已经被提议来取代前者。
- **ARP 协议** ：ARP协议，全称地址解析协议（Address Resolution Protocol），它解决的是网络层地址和链路层地址之间的转换问题。因为一个IP数据报在物理上传输的过程中，总是需要知道下一跳（物理上的下一个目的地）该去往何处，但IP地址属于逻辑地址，而MAC地址才是物理地址，ARP协议解决了IP地址转MAC地址的一些问题。
- **NAT:网络地址转换协议** ：NAT协议（Network Address Translation）的应用场景如同它的名称——网络地址转换，应用于内部网到外部网的地址转换过程中。具体地说，在一个小的子网（局域网，LAN）内，各主机使用的是同一个LAN下的IP地址，但在该LAN以外，在广域网（WAN）中，需要一个统一的IP地址来标识该LAN在整个Internet上的位置。
- ......

### 网络接口层（Network interface layer）

我们可以把网络接口层看作是数据链路层和物理层的合体。

1. 数据链路层(data link layer)通常简称为链路层（ 两台主机之间的数据传输，总是在一段一段的链路上传送的）。**数据链路层的作用是将网络层交下来的 IP 数据报组装成帧，在两个相邻节点间的链路上传送帧。每一帧包括数据和必要的控制信息（如同步信息，地址信息，差错控制等）。**
2. **物理层的作用是实现相邻计算机节点之间比特流的透明传送，尽可能屏蔽掉具体传输介质和物理设备的差异**

![网络接口层重要协议](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/network-interface-layer-protocol.png)

### 总结

简单总结一下每一层包含的协议和核心技术:

![TCP/IP 各层协议概览](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/cs-basics/network/network-protocol-overview.png)

**应用层协议** :

- HTTP 协议（超文本传输协议，网页浏览常用的协议）
- DHCP 协议（动态主机配置）
- DNS 系统原理（域名系统）
- FTP 协议（文件传输协议）
- Telnet协议（远程登陆协议）
- 电子邮件协议等（SMTP、POP3、IMAP）
- ......

**传输层协议** :

- TCP 协议
  - 报文段结构
  - 可靠数据传输
  - 流量控制
  - 拥塞控制
- UDP 协议
  - 报文段结构
  - RDT（可靠数据传输协议）

**网络层协议** :

- IP 协议（TCP/IP 协议的基础，分为 IPv4 和 IPv6）
- ARP 协议（地址解析协议，用于解析 IP 地址和 MAC 地址之间的映射）
- ICMP 协议（控制报文协议，用于发送控制消息）
- NAT 协议（网络地址转换协议）
- RIP 协议、OSPF 协议、BGP 协议（路由选择协议）
- ......

**网络接口层** :

- 差错检测技术
- 多路访问协议（信道复用技术）
- CSMA/CD 协议
- MAC 协议
- 以太网技术
- ......

## 网络分层的原因

在这篇文章的最后，我想聊聊：“为什么网络要分层？”。

说到分层，我们先从我们平时使用框架开发一个后台程序来说，我们往往会按照每一层做不同的事情的原则将系统分为三层（复杂的系统分层会更多）:

1. Repository（数据库操作）
2. Service（业务操作）
3. Controller（前后端数据交互）

**复杂的系统需要分层，因为每一层都需要专注于一类事情。网络分层的原因也是一样，每一层只专注于做一类事情。**

好了，再来说回：“为什么网络要分层？”。我觉得主要有 3 方面的原因：

1. **各层之间相互独立**：各层之间相互独立，各层之间不需要关心其他层是如何实现的，只需要知道自己如何调用下层提供好的功能就可以了（可以简单理解为接口调用）**。这个和我们对开发时系统进行分层是一个道理。**
2. **提高了整体灵活性** ：每一层都可以使用最适合的技术来实现，你只需要保证你提供的功能以及暴露的接口的规则没有改变就行了。**这个和我们平时开发系统的时候要求的高内聚、低耦合的原则也是可以对应上的。**
3. **大问题化小** ： 分层可以将复杂的网络间题分解为许多比较小的、界线比较清晰简单的小问题来处理和解决。这样使得复杂的计算机网络系统变得易于设计，实现和标准化。 **这个和我们平时开发的时候，一般会将系统功能分解，然后将复杂的问题分解为容易理解的更小的问题是相对应的，这些较小的问题具有更好的边界（目标和接口）定义。**

我想到了计算机世界非常非常有名的一句话，这里分享一下：

> 计算机科学领域的任何问题都可以通过增加一个间接的中间层来解决，计算机整个体系从上到下都是按照严格的层次结构设计的。

## 参考

- TCP/IP model vs OSI model：https://fiberbit.com.tw/tcpip-model-vs-osi-model/
- Data Encapsulation and the TCP/IP Protocol Stack：https://docs.oracle.com/cd/E19683-01/806-4075/ipov-32/index.html
