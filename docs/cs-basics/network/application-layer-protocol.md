---
title: 应用层常见协议总结（应用层）
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: 应用层协议,HTTP,WebSocket,DNS,SMTP,FTP,特性,场景
  - - meta
    - name: description
      content: 汇总应用层常见协议的核心概念与典型场景，重点对比 HTTP 与 WebSocket 的通信模型与能力边界。
---

## HTTP:超文本传输协议

**超文本传输协议（HTTP，HyperText Transfer Protocol)** 是一种用于传输超文本和多媒体内容的协议，主要是为 Web 浏览器与 Web 服务器之间的通信而设计的。当我们使用浏览器浏览网页的时候，我们网页就是通过 HTTP 请求进行加载的。

HTTP 使用客户端-服务器模型，客户端向服务器发送 HTTP Request（请求），服务器响应请求并返回 HTTP Response（响应），整个过程如下图所示。

![](https://oss.javaguide.cn/github/javaguide/450px-HTTP-Header.png)

HTTP 协议基于 TCP 协议，发送 HTTP 请求之前首先要建立 TCP 连接也就是要经历 3 次握手。目前使用的 HTTP 协议大部分都是 1.1。在 1.1 的协议里面，默认是开启了 Keep-Alive 的，这样的话建立的连接就可以在多次请求中被复用了。

另外， HTTP 协议是“无状态”的协议，它无法记录客户端用户的状态，一般我们都是通过 Session 来记录客户端用户的状态。

## Websocket：全双工通信协议

WebSocket 是一种基于 TCP 连接的全双工通信协议，即客户端和服务器可以同时发送和接收数据。

WebSocket 协议在 2008 年诞生，2011 年成为国际标准，几乎所有主流较新版本的浏览器都支持该协议。不过，WebSocket 不只能在基于浏览器的应用程序中使用，很多编程语言、框架和服务器都提供了 WebSocket 支持。

WebSocket 协议本质上是应用层的协议，用于弥补 HTTP 协议在持久通信能力上的不足。客户端和服务器仅需一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

![Websocket 示意图](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

下面是 WebSocket 的常见应用场景：

- 视频弹幕
- 实时消息推送，详见[Web 实时消息推送详解](https://javaguide.cn/system-design/web-real-time-message-push.html)这篇文章
- 实时游戏对战
- 多用户协同编辑
- 社交聊天
- ……

WebSocket 的工作过程可以分为以下几个步骤：

1. 客户端向服务器发送一个 HTTP 请求，请求头中包含 `Upgrade: websocket` 和 `Sec-WebSocket-Key` 等字段，表示要求升级协议为 WebSocket；
2. 服务器收到这个请求后，会进行升级协议的操作，如果支持 WebSocket，它将回复一个 HTTP 101 状态码，响应头中包含 ，`Connection: Upgrade`和 `Sec-WebSocket-Accept: xxx` 等字段、表示成功升级到 WebSocket 协议。
3. 客户端和服务器之间建立了一个 WebSocket 连接，可以进行双向的数据传输。数据以帧（frames）的形式进行传送，WebSocket 的每条消息可能会被切分成多个数据帧（最小单位）。发送端会将消息切割成多个帧发送给接收端，接收端接收消息帧，并将关联的帧重新组装成完整的消息。
4. 客户端或服务器可以主动发送一个关闭帧，表示要断开连接。另一方收到后，也会回复一个关闭帧，然后双方关闭 TCP 连接。

另外，建立 WebSocket 连接之后，通过心跳机制来保持 WebSocket 连接的稳定性和活跃性。

## SMTP:简单邮件传输(发送)协议

**简单邮件传输(发送)协议（SMTP，Simple Mail Transfer Protocol）** 基于 TCP 协议，是一种用于发送电子邮件的协议

![SMTP 协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/what-is-smtp.png)

注意 ⚠️：**接受邮件的协议不是 SMTP 而是 POP3 协议。**

SMTP 协议这块涉及的内容比较多，下面这两个问题比较重要：

1. 电子邮件的发送过程
2. 如何判断邮箱是真正存在的？

**电子邮件的发送过程？**

比如我的邮箱是“<dabai@cszhinan.com>”，我要向“<xiaoma@qq.com>”发送邮件，整个过程可以简单分为下面几步：

1. 通过 **SMTP** 协议，我将我写好的邮件交给 163 邮箱服务器（邮局）。
2. 163 邮箱服务器发现我发送的邮箱是 qq 邮箱，然后它使用 SMTP 协议将我的邮件转发到 qq 邮箱服务器。
3. qq 邮箱服务器接收邮件之后就通知邮箱为“<xiaoma@qq.com>”的用户来收邮件，然后用户就通过 **POP3/IMAP** 协议将邮件取出。

**如何判断邮箱是真正存在的？**

很多场景(比如邮件营销)下面我们需要判断我们要发送的邮箱地址是否真的存在，这个时候我们可以利用 SMTP 协议来检测：

1. 查找邮箱域名对应的 SMTP 服务器地址
2. 尝试与服务器建立连接
3. 连接成功后尝试向需要验证的邮箱发送邮件
4. 根据返回结果判定邮箱地址的真实性

推荐几个在线邮箱是否有效检测工具：

1. <https://verify-email.org/>
2. <http://tool.chacuo.net/mailverify>
3. <https://www.emailcamel.com/>

## POP3/IMAP:邮件接收的协议

这两个协议没必要多做阐述，只需要了解 **POP3 和 IMAP 两者都是负责邮件接收的协议** 即可（二者也是基于 TCP 协议）。另外，需要注意不要将这两者和 SMTP 协议搞混淆了。**SMTP 协议只负责邮件的发送，真正负责接收的协议是 POP3/IMAP。**

IMAP 协议是比 POP3 更新的协议，它在功能和性能上都更加强大。IMAP 支持邮件搜索、标记、分类、归档等高级功能，而且可以在多个设备之间同步邮件状态。几乎所有现代电子邮件客户端和服务器都支持 IMAP。

## FTP:文件传输协议

**FTP 协议** 基于 TCP 协议，是一种用于在计算机之间传输文件的协议，可以屏蔽操作系统和文件存储方式。

FTP 是基于客户—服务器（C/S）模型而设计的，在客户端与 FTP 服务器之间建立两个连接。如果我们要基于 FTP 协议开发一个文件传输的软件的话，首先需要搞清楚 FTP 的原理。关于 FTP 的原理，很多书籍上已经描述的非常详细了：

> FTP 的独特的优势同时也是与其它客户服务器程序最大的不同点就在于它在两台通信的主机之间使用了两条 TCP 连接（其它客户服务器应用程序一般只有一条 TCP 连接）：
>
> 1. 控制连接：用于传送控制信息（命令和响应）
> 2. 数据连接：用于数据传送；
>
> 这种将命令和数据分开传送的思想大大提高了 FTP 的效率。

![FTP工作过程](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ftp.png)

注意 ⚠️：FTP 是一种不安全的协议，因为它在传输过程中不会对数据进行加密。因此，FTP 传输的文件可能会被窃听或篡改。建议在传输敏感数据时使用更安全的协议，如 SFTP（SSH File Transfer Protocol，一种基于 SSH 协议的安全文件传输协议，用于在网络上安全地传输文件）。

## Telnet:远程登陆协议

**Telnet 协议** 基于 TCP 协议，用于通过一个终端登陆到其他服务器。Telnet 协议的最大缺点之一是所有数据（包括用户名和密码）均以明文形式发送，这有潜在的安全风险。这就是为什么如今很少使用 Telnet，而是使用一种称为 SSH 的非常安全的网络传输协议的主要原因。

![Telnet:远程登陆协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Telnet_is_vulnerable_to_eavesdropping-2.png)

## SSH:安全的网络传输协议

**SSH（Secure Shell）** 基于 TCP 协议，通过加密和认证机制实现安全的访问和文件传输等业务。

SSH 的经典用途是登录到远程电脑中执行命令。除此之外，SSH 也支持隧道协议、端口映射和 X11 连接（允许用户在本地运行远程服务器上的图形应用程序）。借助 SFTP（SSH File Transfer Protocol） 或 SCP（Secure Copy Protocol） 协议，SSH 还可以安全传输文件。

SSH 使用客户端-服务器模型，默认端口是 22。SSH 是一个守护进程，负责实时监听客户端请求，并进行处理。大多数现代操作系统都提供了 SSH。

如下图所示，SSH Client（SSH 客户端）和 SSH Server（SSH 服务器）通过公钥交换生成共享的对称加密密钥，用于后续的加密通信。

![SSH:安全的网络传输协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ssh-client-server.png)

## RTP:实时传输协议

RTP（Real-time Transport Protocol，实时传输协议）通常基于 UDP 协议，但也支持 TCP 协议。它提供了端到端的实时传输数据的功能，但不包含资源预留存、不保证实时传输质量，这些功能由 WebRTC 实现。

RTP 协议分为两种子协议：

- **RTP（Real-time Transport Protocol，实时传输协议）**：传输具有实时特性的数据。
- **RTCP（RTP Control Protocol，RTP 控制协议）**：提供实时传输过程中的统计信息（如网络延迟、丢包率等），WebRTC 正是根据这些信息处理丢包

## DNS:域名系统

DNS（Domain Name System，域名管理系统）基于 UDP 协议，用于解决域名和 IP 地址的映射问题。

![DNS:域名系统](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

## 参考

- 《计算机网络自顶向下方法》（第七版）
- RTP 协议介绍:<https://mthli.xyz/rtp-introduction/>

<!-- @include: @article-footer.snippet.md -->
