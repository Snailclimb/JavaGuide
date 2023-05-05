---
title: 应用层常见协议总结（应用层）
category: 计算机基础
tag:
  - 计算机网络
---

## HTTP:超文本传输协议

**超文本传输协议（HTTP，HyperText Transfer Protocol)** 是一种用于传输超文本和多媒体内容的协议，主要是为 Web 浏览器与 Web 服务器之间的通信而设计的。当我们使用浏览器浏览网页的时候，我们网页就是通过 HTTP 请求进行加载的。

HTTP 使用客户端-服务器模型，客户端向服务器发送 HTTP Request（请求），服务器响应请求并返回 HTTP Response（响应），整个过程如下图所示。

![](https://oss.javaguide.cn/github/javaguide/450px-HTTP-Header.png)

HTTP 协议基于 TCP 协议，发送 HTTP 请求之前首先要建立 TCP 连接也就是要经历 3 次握手。目前使用的 HTTP 协议大部分都是 1.1。在 1.1 的协议里面，默认是开启了 Keep-Alive 的，这样的话建立的连接就可以在多次请求中被复用了。

另外， HTTP 协议是”无状态”的协议，它无法记录客户端用户的状态，一般我们都是通过 Session 来记录客户端用户的状态。

## SMTP:简单邮件传输(发送)协议

**简单邮件传输(发送)协议（SMTP，Simple Mail Transfer Protocol）** 基于 TCP 协议，是一种用于发送电子邮件的协议

![SMTP 协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/what-is-smtp.png)

注意 ⚠️：**接受邮件的协议不是 SMTP 而是 POP3 协议。**

SMTP 协议这块涉及的内容比较多，下面这两个问题比较重要：

1. 电子邮件的发送过程
2. 如何判断邮箱是真正存在的？

**电子邮件的发送过程？**

比如我的邮箱是“dabai@cszhinan.com”，我要向“xiaoma@qq.com”发送邮件，整个过程可以简单分为下面几步：

1. 通过 **SMTP** 协议，我将我写好的邮件交给 163 邮箱服务器（邮局）。
2. 163 邮箱服务器发现我发送的邮箱是 qq 邮箱，然后它使用 SMTP 协议将我的邮件转发到 qq 邮箱服务器。
3. qq 邮箱服务器接收邮件之后就通知邮箱为“xiaoma@qq.com”的用户来收邮件，然后用户就通过 **POP3/IMAP** 协议将邮件取出。

**如何判断邮箱是真正存在的？**

很多场景(比如邮件营销)下面我们需要判断我们要发送的邮箱地址是否真的存在，这个时候我们可以利用 SMTP 协议来检测：

1. 查找邮箱域名对应的 SMTP 服务器地址
2. 尝试与服务器建立连接
3. 连接成功后尝试向需要验证的邮箱发送邮件
4. 根据返回结果判定邮箱地址的真实性

推荐几个在线邮箱是否有效检测工具：

1. https://verify-email.org/
2. http://tool.chacuo.net/mailverify
3. https://www.emailcamel.com/

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

注意 ⚠️：FTP 是一种不安全的协议，因为它在传输过程中不会对数据进行加密。因此，FTP 传输的文件可能会被窃听或篡改。建议在传输敏感数据时使用更安全的协议，如 SFTP（一种基于 SSH 协议的安全文件传输协议，用于在网络上安全地传输文件）。

## Telnet:远程登陆协议

**Telnet 协议** 基于 TCP 协议，用于通过一个终端登陆到其他服务器。Telnet 协议的最大缺点之一是所有数据（包括用户名和密码）均以明文形式发送，这有潜在的安全风险。这就是为什么如今很少使用 Telnet，而是使用一种称为 SSH 的非常安全的网络传输协议的主要原因。

![Telnet:远程登陆协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Telnet_is_vulnerable_to_eavesdropping-2.png)

## SSH:安全的网络传输协议

**SSH（Secure Shell）** 基于 TCP 协议，通过加密和认证机制实现安全的访问和文件传输等业务。

SSH 的经典用途是登录到远程电脑中执行命令。除此之外，SSH 也支持隧道协议、端口映射和 X11 连接。借助 SFTP 或 SCP 协议，SSH 还可以传输文件。

SSH 使用客户端-服务器模型，默认端口是 22。SSH 是一个守护进程，负责实时监听客户端请求，并进行处理。大多数现代操作系统都提供了 SSH。

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
- RTP 协议介绍:https://mthli.xyz/rtp-introduction/
