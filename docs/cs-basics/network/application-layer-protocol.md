---
title: 常见应用层协议总结：HTTP、WebSocket、SMTP、FTP、SSH、DNS 等
description: 汇总应用层常见协议的核心概念与典型场景，重点对比 HTTP 与 WebSocket 的通信模型与能力边界。
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: 应用层协议,HTTP,WebSocket,DNS,SMTP,FTP,特性,场景
---

<!-- @include: @article-header.snippet.md -->

应用层协议很多，HTTP、WebSocket、SMTP、POP3/IMAP、FTP、Telnet、SSH、RTP、DNS 这些名字也经常一起出现。

这些协议不需要每一个都学到实现细节，但如果只记协议名，很容易在“用途、底层传输协议、典型场景”这几个点上混在一起。

这篇文章主要回答几个问题：

1. HTTP、WebSocket、SMTP、FTP、SSH、DNS 等协议分别解决什么问题？
2. 这些协议通常基于 TCP 还是 UDP，常见端口和使用场景是什么？
3. 哪些协议最容易混淆，面试和实践中应该怎么区分？

## HTTP：超文本传输协议

**超文本传输协议（HTTP，HyperText Transfer Protocol）** 是一种用于传输超文本和多媒体内容的应用层协议，最常见的使用场景就是 Web 浏览器与 Web 服务器之间的通信。

![HTTP：超文本传输协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-overview.png)

当我们在浏览器里访问一个网页时，浏览器会向服务器发送 HTTP 请求，服务器处理后返回 HTTP 响应。页面中的 HTML、CSS、JavaScript、图片、视频等资源，很多都是通过 HTTP 加载的。

HTTP 使用客户端-服务器模型，客户端发送 HTTP Request（请求），服务器返回 HTTP Response（响应），整个过程如下图所示。

![HTTP 协议](https://oss.javaguide.cn/github/javaguide/450px-HTTP-Header.png)

需要注意的是，HTTP 是应用层协议，它本身不直接负责可靠传输。不同版本的 HTTP 底层依赖也不完全一样：

- **HTTP/1.1**：基于 TCP。
- **HTTP/2**：通常也基于 TCP，但引入了多路复用、头部压缩等能力。
- **HTTP/3**：基于 QUIC，而 QUIC 基于 UDP，主要用于降低连接建立开销，并缓解 TCP 队头阻塞带来的影响。

在 HTTP/1.1 中，默认开启 Keep-Alive，也就是长连接。这样同一个 TCP 连接可以被多个 HTTP 请求复用，避免每次请求都重新建立 TCP 连接，从而减少三次握手带来的开销。

从连接复用角度看，HTTP/1.1 的 Keep-Alive 解决的是“同一个 TCP 连接复用多个请求”的问题，但同一连接上的请求处理仍然可能受到队头阻塞影响。

HTTP/2 在一个 TCP 连接上引入多路复用，可以并行传输多个请求和响应，减少了 HTTP 层面的队头阻塞。但由于底层仍然是 TCP，一旦某个 TCP 包丢失，整个连接上的数据仍然会受影响。

HTTP/3 基于 QUIC，QUIC 在 UDP 之上实现多路复用和可靠传输。不同流之间相互独立，可以缓解 TCP 层队头阻塞问题。

另外，HTTP 是一种**无状态协议**。服务端不会天然记住“上一次请求是谁发的、处于什么状态”。因此，在实际 Web 开发中，通常需要借助 Cookie、Session、Token（包括 JWT）等机制来维护用户登录态和会话状态。

## WebSocket：全双工通信协议

**WebSocket** 是一种基于 TCP 连接的全双工通信协议，客户端和服务器可以在同一条连接上同时发送和接收数据。

![WebSocket：全双工通信协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/websocket-overview.png)

它的典型特点是：**连接建立后，服务端也可以主动向客户端推送消息**。这正好弥补了传统 HTTP 请求-响应模型在实时通信场景下的不足。

WebSocket 协议在 2008 年诞生，2011 年成为国际标准，现代主流浏览器基本都已经支持。WebSocket 不只用于浏览器场景，很多编程语言、框架和服务器也都提供了对应支持。

WebSocket 本质上仍然是应用层协议。它通常先通过一次 HTTP 请求发起协议升级，升级成功后，客户端和服务端之间会建立一条持久连接，后续就可以进行双向数据传输。

![WebSocket 示意图](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

WebSocket 的常见应用场景包括：

- 视频弹幕
- 实时消息推送，详见[Web 实时消息推送详解](https://javaguide.cn/system-design/web-real-time-message-push.html)
- 实时游戏对战
- 多用户协同编辑
- 在线客服 / 社交聊天
- 股票行情、体育比分等实时数据更新

WebSocket 的工作过程可以简单分为下面几步：

1. 客户端向服务器发送一个 HTTP 请求，请求头中包含 `Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Key` 等字段，表示希望把当前连接升级为 WebSocket。
2. 服务器收到请求后，如果支持 WebSocket，会返回 HTTP `101 Switching Protocols` 状态码，响应头中包含 `Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Accept` 等字段，表示协议升级成功。
3. 协议升级后，客户端和服务器之间就建立了一条 WebSocket 连接，双方可以进行双向通信。
4. WebSocket 数据以帧（Frame）的形式传输。一条完整消息可能会被拆分成多个帧发送，接收端再重新组装成完整消息。
5. 客户端或服务器都可以主动发送关闭帧，另一方收到后也会回复关闭帧，然后双方关闭 TCP 连接。

另外，WebSocket 连接通常会配合**心跳机制**使用。比如定期发送 Ping/Pong 帧，或者在业务层发送心跳包，用来检测连接是否仍然可用，避免连接假死。

## SMTP：简单邮件传输协议

**简单邮件传输协议（SMTP，Simple Mail Transfer Protocol）** 是一种基于 TCP 的应用层协议，主要用于**发送和转发电子邮件**。

![SMTP：简单邮件传输协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/smtp-overview.png)

这里要注意一个容易混淆的点：

**SMTP 负责邮件发送和邮件服务器之间的转发；POP3/IMAP 负责用户从邮箱服务器收取邮件。**

也就是说，邮件从你的邮箱服务器发送到对方邮箱服务器，这个过程通常还是 SMTP；而用户使用客户端查看邮箱里的邮件，通常使用 POP3 或 IMAP。

![SMTP 协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/what-is-smtp.png)

常见 SMTP 相关端口有 25、465、587，三者用途不完全一样：

| 端口 | 常见用途               | 说明                                                                          |
| ---- | ---------------------- | ----------------------------------------------------------------------------- |
| 25   | 邮件服务器之间转发邮件 | 主要用于 MTA 到 MTA 的投递，很多云厂商或 ISP 会限制 25 端口出站，防止垃圾邮件 |
| 587  | 客户端提交邮件         | 标准的 Message Submission 端口，通常配合 STARTTLS 和身份认证使用              |
| 465  | 隐式 TLS 的邮件提交    | 客户端连接时直接建立 TLS 加密通道，很多邮件服务商仍然支持                     |

### 电子邮件的发送过程

比如我的邮箱是 `<dabai@cszhinan.com>`，我要向 `<xiaoma@qq.com>` 发送邮件，整个过程可以简单理解为：

1. 我通过邮箱客户端或网页邮箱写好邮件。
2. 邮件客户端通过 SMTP 协议，把邮件提交给 `cszhinan.com` 对应的邮件服务器。
3. 发送方邮件服务器根据收件人域名 `qq.com` 查询对应的邮件服务器地址。
4. 发送方邮件服务器再通过 SMTP，把邮件投递到 QQ 邮箱服务器。
5. QQ 邮箱服务器接收邮件并保存。
6. 用户 `<xiaoma@qq.com>` 通过 POP3 或 IMAP 协议从 QQ 邮箱服务器读取邮件。

### 如何判断邮箱是否真正存在？

一些场景下，我们可能需要判断某个邮箱地址是否真实存在。常见思路是基于 SMTP 做探测：

1. 查询邮箱域名对应的 MX 记录，找到邮件服务器。
2. 尝试连接目标邮件服务器。
3. 使用 SMTP 命令模拟投递流程。
4. 根据服务器返回结果判断邮箱地址是否可能存在。

不过，这种方式并不总是可靠。

很多邮件服务商为了防止垃圾邮件、撞库和隐私泄露，会屏蔽邮箱存在性探测，或者统一返回模糊结果。因此，SMTP 探测只能作为参考，不能 100% 判断邮箱一定存在或不存在。

推荐几个在线邮箱有效性检测工具：

1. <https://verify-email.org/>
2. <http://tool.chacuo.net/mailverify>
3. <https://www.emailcamel.com/>

## POP3/IMAP：邮件接收协议

**POP3 和 IMAP 都是用于接收邮件的协议**，二者也都是基于 TCP 的应用层协议。

![POP3/IMAP：邮件接收协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/pop3-imap-overview.png)

需要注意的是：**SMTP 主要负责邮件发送和转发，POP3/IMAP 主要负责用户从邮箱服务器读取邮件。**

POP3 的设计比较简单，常见模式是把邮件从服务器下载到本地。它适合单设备收信，但多设备同步体验较差。

IMAP 是更现代、更常用的邮件接收协议。它支持在服务器端管理邮件，能够同步邮件状态，比如已读、未读、删除、归档、文件夹分类等。因此，如果你同时在手机、电脑、网页端查看同一个邮箱，IMAP 的体验通常会更好。

简单对比一下：

| 协议 | 主要用途       | 特点                             |
| ---- | -------------- | -------------------------------- |
| POP3 | 接收邮件       | 偏下载到本地，多设备同步能力弱   |
| IMAP | 接收和管理邮件 | 支持多设备同步、搜索、标记、归档 |
| SMTP | 发送和转发邮件 | 负责邮件投递链路                 |

## FTP：文件传输协议

**FTP（File Transfer Protocol，文件传输协议）** 是一种基于 TCP 的应用层协议，用于在客户端和服务器之间传输文件。

![FTP：文件传输协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ftp-overview.png)

FTP 采用客户端-服务器模型。它比较特殊的一点是：FTP 通常会建立两条 TCP 连接。

> FTP 与很多应用层协议不同，它在客户端和服务器之间使用两条连接：
>
> 1. **控制连接**：用于传输命令和响应，例如登录、切换目录、删除文件等。
> 2. **数据连接**：用于真正传输文件内容或目录列表。

这种将命令和数据分开传输的设计，能够让控制命令和文件数据互不干扰。

![FTP 工作过程](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ftp.png)

FTP 有主动模式（PORT）和被动模式（PASV）两种数据连接方式：

- **主动模式**：客户端通过控制连接告诉服务端自己监听的端口，服务端再主动连接客户端的这个端口建立数据连接。由于服务端要主动连接客户端，如果客户端在 NAT 或防火墙后面，很容易连接失败。
- **被动模式**：客户端请求服务端开放一个数据端口，然后由客户端主动连接服务端的数据端口。因为连接方向仍然是客户端到服务端，更容易穿过 NAT 和防火墙，所以实际生产环境中更常用被动模式。

注意：FTP 本身是不安全的。它默认不会加密传输内容，用户名、密码和文件数据都可能被窃听或篡改。

因此，传输敏感文件时不建议使用普通 FTP，可以选择：

- **SFTP**：基于 SSH 的安全文件传输协议。
- **FTPS**：在 FTP 基础上增加 TLS/SSL 加密。

其中，SFTP 和 FTPS 名字相似，但不是同一个协议。SFTP 基于 SSH，FTPS 是 FTP over TLS。

## Telnet：远程登录协议

**Telnet** 是一种基于 TCP 的远程登录协议，默认端口是 23。它允许用户通过终端远程登录到服务器，并在远程机器上执行命令。

Telnet 最大的问题是：**明文传输**。

![Telnet：远程登录协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/telnet-overview.png)

用户名、密码、命令内容和返回结果都不会加密，攻击者如果能监听网络流量，就可能直接看到敏感信息。

![Telnet：远程登录协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Telnet_is_vulnerable_to_eavesdropping-2.png)

因此，Telnet 现在已经很少用于真正的远程管理。实际生产环境中，通常使用 SSH 替代 Telnet。

## SSH：安全的网络传输协议

**SSH（Secure Shell）** 是一种基于 TCP 的安全网络协议，默认端口是 22。它通过加密和认证机制，为远程登录、命令执行和文件传输提供安全保障。

![SSH：安全的网络传输协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ssh-overview.png)

SSH 最经典的用途是登录远程服务器：

```bash
ssh user@server_ip
```

除了远程登录，SSH 还支持：

- 远程执行命令
- 端口转发
- 隧道代理
- X11 转发
- 基于 SFTP 或 SCP 的安全文件传输

SSH 使用客户端-服务器模型。SSH Server 监听客户端连接请求，SSH Client 发起连接。双方会先协商加密算法，并通过密钥交换生成后续通信使用的对称加密密钥。之后的通信内容都会被加密传输。

![SSH：安全的网络传输协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ssh-client-server.png)

需要注意的是，SSH 的安全性不仅来自加密传输，也来自身份认证机制。常见认证方式包括：

- 密码认证
- 公钥认证
- 多因素认证

实际生产环境中，更推荐使用公钥认证，并关闭弱密码登录。

## RTP：实时传输协议

**RTP（Real-time Transport Protocol，实时传输协议）** 是一种用于传输音频、视频等实时数据的协议。它通常运行在 UDP 之上。在 TCP/IP 分层模型中，UDP 之上就是应用层，所以 RTP 按分层规则被归入应用层。但它承担的职责（序列号、时间戳、同步、质量反馈）更接近传输层功能，RFC 3550 也说它“通常会集成到应用处理中，而不是作为独立层实现”。

![RTP：实时传输协议概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/rtp-overview.png)

RTP 主要用在语音通话、视频会议、直播等实时场景。它本身不保证可靠传输，也不保证按时到达，而是通过序列号、时间戳等信息帮助接收端进行排序、同步和播放控制。虽然也存在 RTP over TCP 的封装方式（如 RFC 4571），但更多用于穿越防火墙或兼容特定协议栈等特殊场景，实际实时音视频场景中 RTP 仍以 UDP 为主。

RTP 通常会和 RTCP 配合使用：

- **RTP**：负责传输实时音视频数据。
- **RTCP（RTP Control Protocol）**：负责传输控制信息和统计信息，比如丢包率、延迟、抖动等。

在 WebRTC 中，RTP/RTCP 是实时音视频传输的重要基础。WebRTC 还会结合 SRTP 加密、拥塞控制、抖动缓冲、NACK、FEC 等机制，提升实时通信的安全性和质量。

需要注意的是，RTP 本身不负责资源预留，也不保证实时传输质量。它提供的是实时媒体传输的基础能力，具体的质量控制需要依赖上层机制配合完成。

## DNS：域名系统

**DNS（Domain Name System，域名系统）** 用于解决域名和 IP 地址之间的映射问题。

![DNS：域名系统概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

我们访问网站时，通常输入的是域名，例如：

```text
www.javaguide.cn
```

但网络通信实际需要的是 IP 地址。DNS 的作用就是把域名解析成对应的 IP 地址。

DNS 通常使用 UDP，默认端口是 53。之所以优先使用 UDP，是因为大多数 DNS 查询和响应都比较小，不需要 TCP 三次握手，响应更快。

在早期 DNS 规范中，UDP DNS 消息大小限制为 512 字节（不包含 IP 和 UDP 头）。如果响应过大，服务器会设置截断标志，客户端再通过 TCP 重试。

后来 EDNS0 扩展了 DNS over UDP 的报文大小上限，使 DNS 能承载更大的响应，比如 DNSSEC 相关数据。但如果响应超过协商的 UDP 大小，或者发生区域传送（DNS 服务器之间同步整域数据，普通域名解析几乎不会触发），仍然会使用 TCP。

现代网络中还出现了更安全的 DNS 方案，比如：

- **DoH（DNS over HTTPS）**
- **DoT（DNS over TLS）**

它们的目的都是减少 DNS 明文查询带来的隐私和安全问题。

## 常见应用层协议端口总结

| 协议      |                          默认端口 | 传输层协议 | 主要用途               |
| --------- | --------------------------------: | ---------- | ---------------------- |
| HTTP      |                                80 | TCP        | Web 页面访问           |
| HTTPS     |                               443 | TCP / QUIC | 加密 Web 访问          |
| WebSocket |                          80 / 443 | TCP        | 双向实时通信           |
| SMTP      |                    25 / 465 / 587 | TCP        | 邮件发送和转发         |
| POP3      |                         110 / 995 | TCP        | 邮件接收               |
| IMAP      |                         143 / 993 | TCP        | 邮件接收和同步         |
| FTP       |                           20 / 21 | TCP        | 文件传输               |
| SSH       |                                22 | TCP        | 安全远程登录和文件传输 |
| Telnet    |                                23 | TCP        | 明文远程登录           |
| DNS       |                                53 | UDP / TCP  | 域名解析               |
| RTP       | 动态端口（偶数），RTCP 用相邻奇数 | UDP 为主   | 实时音视频传输         |

这里 HTTPS 写成 TCP / QUIC，是因为传统 HTTPS 通常基于 TLS over TCP，而 HTTP/3 场景下会基于 QUIC。

## 小结

这篇文章只做了常见应用层协议的快速梳理，没有展开到协议报文和具体实现细节。

复习时可以重点记住几个容易混淆的点：

- HTTP 是应用层协议，HTTP/1.1 和 HTTP/2 通常基于 TCP，HTTP/3 基于 QUIC。
- HTTP/1.1 通过 Keep-Alive 复用 TCP 连接，HTTP/2 在一个 TCP 连接上做多路复用，HTTP/3 基于 QUIC 缓解 TCP 队头阻塞。
- WebSocket 通过 HTTP 升级建立连接，之后支持双向通信。
- SMTP 负责邮件发送和服务器间转发，POP3/IMAP 负责用户收取邮件。
- SMTP 常见端口包括 25、587、465，分别对应服务器间转发、客户端提交和隐式 TLS 提交等场景。
- FTP 有主动模式和被动模式，实际生产环境中被动模式更常见。
- FTP、SFTP、FTPS 不是一回事，FTP 明文传输，SFTP 基于 SSH，FTPS 基于 TLS。
- Telnet 明文传输，不适合生产环境远程管理，实际更常用 SSH。
- DNS 通常基于 UDP，但响应过大、发生截断、区域传送等场景下也会使用 TCP。
- RTP 运行在 UDP 之上，按分层规则归入应用层，但职责更接近传输层；RTP 用偶数端口，配套 RTCP 用相邻奇数端口。

## 参考

- 《计算机网络：自顶向下方法》（第七版）
- RTP 协议介绍：<https://mthli.xyz/rtp-introduction/>
- RFC 6455：The WebSocket Protocol
- RFC 9110：HTTP Semantics
- RFC 8446：TLS 1.3
- RFC 9000：QUIC
- RFC 3550：RTP: A Transport Protocol for Real-Time Applications
- RFC 4571：Framing Real-time Transport Protocol (RTP) and RTP Control Protocol (RTCP) Packets over Connection-Oriented Transport
- RFC 6891：Extension Mechanisms for DNS (EDNS(0))

<!-- @include: @article-footer.snippet.md -->
