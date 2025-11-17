---
title: DNS 域名系统详解（应用层）
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: DNS,域名解析,递归查询,迭代查询,缓存,权威DNS,端口53,UDP
  - - meta
    - name: description
      content: 详解 DNS 的层次结构与解析流程，覆盖递归/迭代、缓存与权威服务器，明确应用层端口与性能优化要点。
---

DNS（Domain Name System）域名管理系统，是当用户使用浏览器访问网址之后，使用的第一个重要协议。DNS 要解决的是**域名和 IP 地址的映射问题**。

![DNS:域名系统](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

在实际使用中，有一种情况下，浏览器是可以不必动用 DNS 就可以获知域名和 IP 地址的映射的。浏览器在本地会维护一个`hosts`列表，一般来说浏览器要先查看要访问的域名是否在`hosts`列表中，如果有的话，直接提取对应的 IP 地址记录，就好了。如果本地`hosts`列表内没有域名-IP 对应记录的话，那么 DNS 就闪亮登场了。

目前 DNS 的设计采用的是分布式、层次数据库结构，**DNS 是应用层协议，基于 UDP 协议之上，端口为 53** 。

![TCP/IP 各层协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-protocol-overview.png)

## DNS 服务器

DNS 服务器自底向上可以依次分为以下几个层级(所有 DNS 服务器都属于以下四个类别之一):

- 根 DNS 服务器。根 DNS 服务器提供 TLD 服务器的 IP 地址。目前世界上只有 13 组根服务器，我国境内目前仍没有根服务器。
- 顶级域 DNS 服务器（TLD 服务器）。顶级域是指域名的后缀，如`com`、`org`、`net`和`edu`等。国家也有自己的顶级域，如`uk`、`fr`和`ca`。TLD 服务器提供了权威 DNS 服务器的 IP 地址。
- 权威 DNS 服务器。在因特网上具有公共可访问主机的每个组织机构必须提供公共可访问的 DNS 记录，这些记录将这些主机的名字映射为 IP 地址。
- 本地 DNS 服务器。每个 ISP（互联网服务提供商）都有一个自己的本地 DNS 服务器。当主机发出 DNS 请求时，该请求被发往本地 DNS 服务器，它起着代理的作用，并将该请求转发到 DNS 层次结构中。严格说来，不属于 DNS 层级结构。

世界上并不是只有 13 台根服务器，这是很多人普遍的误解，网上很多文章也是这么写的。实际上，现在根服务器数量远远超过这个数量。最初确实是为 DNS 根服务器分配了 13 个 IP 地址，每个 IP 地址对应一个不同的根 DNS 服务器。然而，由于互联网的快速发展和增长，这个原始的架构变得不太适应当前的需求。为了提高 DNS 的可靠性、安全性和性能，目前这 13 个 IP 地址中的每一个都有多个服务器，截止到 2023 年底，所有根服务器之和达到了 600 多台，未来还会继续增加。

## DNS 工作流程

以下图为例，介绍 DNS 的查询解析过程。DNS 的查询解析过程分为两种模式：

- **迭代**
- **递归**

下图是实践中常采用的方式，从请求主机到本地 DNS 服务器的查询是递归的，其余的查询时迭代的。

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-process.png)

现在，主机`cis.poly.edu`想知道`gaia.cs.umass.edu`的 IP 地址。假设主机`cis.poly.edu`的本地 DNS 服务器为`dns.poly.edu`，并且`gaia.cs.umass.edu`的权威 DNS 服务器为`dns.cs.umass.edu`。

1. 首先，主机`cis.poly.edu`向本地 DNS 服务器`dns.poly.edu`发送一个 DNS 请求，该查询报文包含被转换的域名`gaia.cs.umass.edu`。
2. 本地 DNS 服务器`dns.poly.edu`检查本机缓存，发现并无记录，也不知道`gaia.cs.umass.edu`的 IP 地址该在何处，不得不向根服务器发送请求。
3. 根服务器注意到请求报文中含有`edu`顶级域，因此告诉本地 DNS，你可以向`edu`的 TLD DNS 发送请求，因为目标域名的 IP 地址很可能在那里。
4. 本地 DNS 获取到了`edu`的 TLD DNS 服务器地址，向其发送请求，询问`gaia.cs.umass.edu`的 IP 地址。
5. `edu`的 TLD DNS 服务器仍不清楚请求域名的 IP 地址，但是它注意到该域名有`umass.edu`前缀，因此返回告知本地 DNS，`umass.edu`的权威服务器可能记录了目标域名的 IP 地址。
6. 这一次，本地 DNS 将请求发送给权威 DNS 服务器`dns.cs.umass.edu`。
7. 终于，由于`gaia.cs.umass.edu`向权威 DNS 服务器备案过，在这里有它的 IP 地址记录，权威 DNS 成功地将 IP 地址返回给本地 DNS。
8. 最后，本地 DNS 获取到了目标域名的 IP 地址，将其返回给请求主机。

除了迭代式查询，还有一种递归式查询如下图，具体过程和上述类似，只是顺序有所不同。

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-process2.png)

另外，DNS 的缓存位于本地 DNS 服务器。由于全世界的根服务器甚少，只有 600 多台，分为 13 组，且顶级域的数量也在一个可数的范围内，因此本地 DNS 通常已经缓存了很多 TLD DNS 服务器，所以在实际查找过程中，无需访问根服务器。根服务器通常是被跳过的，不请求的。这样可以提高 DNS 查询的效率和速度，减少对根服务器和 TLD 服务器的负担。

## DNS 报文格式

DNS 的报文格式如下图所示：

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-packet.png)

DNS 报文分为查询和回答报文，两种形式的报文结构相同。

- 标识符。16 比特，用于标识该查询。这个标识符会被复制到对查询的回答报文中，以便让客户用它来匹配发送的请求和接收到的回答。
- 标志。1 比特的”查询/回答“标识位，`0`表示查询报文，`1`表示回答报文；1 比特的”权威的“标志位（当某 DNS 服务器是所请求名字的权威 DNS 服务器时，且是回答报文，使用”权威的“标志）；1 比特的”希望递归“标志位，显式地要求执行递归查询；1 比特的”递归可用“标志位，用于回答报文中，表示 DNS 服务器支持递归查询。
- 问题数、回答 RR 数、权威 RR 数、附加 RR 数。分别指示了后面 4 类数据区域出现的数量。
- 问题区域。包含正在被查询的主机名字，以及正被询问的问题类型。
- 回答区域。包含了对最初请求的名字的资源记录。**在回答报文的回答区域中可以包含多条 RR，因此一个主机名能够有多个 IP 地址。**
- 权威区域。包含了其他权威服务器的记录。
- 附加区域。包含了其他有帮助的记录。

## DNS 记录

DNS 服务器在响应查询时，需要查询自己的数据库，数据库中的条目被称为 **资源记录(Resource Record，RR)** 。RR 提供了主机名到 IP 地址的映射。RR 是一个包含了`Name`, `Value`, `Type`, `TTL`四个字段的四元组。

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/20210506174303797.png)

`TTL`是该记录的生存时间，它决定了资源记录应当从缓存中删除的时间。

`Name`和`Value`字段的取值取决于`Type`：

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/20210506170307897.png)

- 如果`Type=A`，则`Name`是主机名信息，`Value` 是该主机名对应的 IP 地址。这样的 RR 记录了一条主机名到 IP 地址的映射。
- 如果 `Type=AAAA` （与 `A` 记录非常相似），唯一的区别是 A 记录使用的是 IPv4，而 `AAAA` 记录使用的是 IPv6。
- 如果`Type=CNAME` (Canonical Name Record,真实名称记录) ，则`Value`是别名为`Name`的主机对应的规范主机名。`Value`值才是规范主机名。`CNAME` 记录将一个主机名映射到另一个主机名。`CNAME` 记录用于为现有的 `A` 记录创建别名。下文有示例。
- 如果`Type=NS`，则`Name`是个域，而`Value`是个知道如何获得该域中主机 IP 地址的权威 DNS 服务器的主机名。通常这样的 RR 是由 TLD 服务器发布的。
- 如果`Type=MX` ，则`Value`是个别名为`Name`的邮件服务器的规范主机名。既然有了 `MX` 记录，那么邮件服务器可以和其他服务器使用相同的别名。为了获得邮件服务器的规范主机名，需要请求 `MX` 记录；为了获得其他服务器的规范主机名，需要请求 `CNAME` 记录。

`CNAME`记录总是指向另一则域名，而非 IP 地址。假设有下述 DNS zone：

```plain
NAME                    TYPE   VALUE
--------------------------------------------------
bar.example.com.        CNAME  foo.example.com.
foo.example.com.        A      192.0.2.23
```

当用户查询 `bar.example.com` 的时候，DNS Server 实际返回的是 `foo.example.com` 的 IP 地址。

## 参考

- DNS 服务器类型：<https://www.cloudflare.com/zh-cn/learning/dns/dns-server-types/>
- DNS Message Resource Record Field Formats：<http://www.tcpipguide.com/free/t_DNSMessageResourceRecordFieldFormats-2.htm>
- Understanding Different Types of Record in DNS Server：<https://www.mustbegeek.com/understanding-different-types-of-record-in-dns-server/>

<!-- @include: @article-footer.snippet.md -->
