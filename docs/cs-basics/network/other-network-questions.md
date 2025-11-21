---
title: 计算机网络常见面试题总结(上)
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: 计算机网络面试题,TCP/IP四层模型,HTTP面试,HTTPS vs HTTP,HTTP/1.1 vs HTTP/2,HTTP/3 QUIC,TCP三次握手,UDP区别,DNS解析,WebSocket vs SSE,GET vs POST,应用层协议,网络分层,队头阻塞,PING命令,ARP协议
  - - meta
    - name: description
      content: 最新计算机网络高频面试题总结（上）：TCP/IP四层模型、HTTP全版本对比、TCP三次握手、DNS解析、WebSocket/SSE实时推送等，附图解+⭐️重点标注，一文搞定应用层&传输层&网络层核心考点，快速备战后端面试！
---

<!-- @include: @small-advertisement.snippet.md -->

上篇主要是计算机网络基础和应用层相关的内容。

## 计算机网络基础

### 网络分层模型

#### OSI 七层模型是什么？每一层的作用是什么？

**OSI 七层模型** 是国际标准化组织提出的一个网络分层模型，其大体结构以及每一层提供的功能如下图所示：

![OSI 七层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/osi-7-model.png)

每一层都专注做一件事情，并且每一层都需要使用下一层提供的功能比如传输层需要使用网络层提供的路由和寻址功能，这样传输层才知道把数据传输到哪里去。

**OSI 的七层体系结构概念清楚，理论也很完整，但是它比较复杂而且不实用，而且有些功能在多个层中重复出现。**

上面这种图可能比较抽象，再来一个比较生动的图片。下面这个图片是我在国外的一个网站上看到的，非常赞！

![osi七层模型2](https://oss.javaguide.cn/github/javaguide/osi七层模型2.png)

#### ⭐️TCP/IP 四层模型是什么？每一层的作用是什么？

**TCP/IP 四层模型** 是目前被广泛采用的一种模型,我们可以将 TCP / IP 模型看作是 OSI 七层模型的精简版本，由以下 4 层组成：

1. 应用层
2. 传输层
3. 网络层
4. 网络接口层

需要注意的是，我们并不能将 TCP/IP 四层模型 和 OSI 七层模型完全精确地匹配起来，不过可以简单将两者对应起来，如下图所示：

![TCP/IP 四层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

关于每一层作用的详细介绍，请看 [OSI 和 TCP/IP 网络分层模型详解（基础）](https://javaguide.cn/cs-basics/network/osi-and-tcp-ip-model.html) 这篇文章。

#### 为什么网络要分层？

说到分层，我们先从我们平时使用框架开发一个后台程序来说，我们往往会按照每一层做不同的事情的原则将系统分为三层（复杂的系统分层会更多）:

1. Repository（数据库操作）
2. Service（业务操作）
3. Controller（前后端数据交互）

**复杂的系统需要分层，因为每一层都需要专注于一类事情。网络分层的原因也是一样，每一层只专注于做一类事情。**

好了，再来说回：“为什么网络要分层？”。我觉得主要有 3 方面的原因：

1. **各层之间相互独立**：各层之间相互独立，各层之间不需要关心其他层是如何实现的，只需要知道自己如何调用下层提供好的功能就可以了（可以简单理解为接口调用）**。这个和我们对开发时系统进行分层是一个道理。**
2. **提高了灵活性和可替换性**：每一层都可以使用最适合的技术来实现，你只需要保证你提供的功能以及暴露的接口的规则没有改变就行了。并且，每一层都可以根据需要进行修改或替换，而不会影响到整个网络的结构。**这个和我们平时开发系统的时候要求的高内聚、低耦合的原则也是可以对应上的。**
3. **大问题化小**：分层可以将复杂的网络问题分解为许多比较小的、界线比较清晰简单的小问题来处理和解决。这样使得复杂的计算机网络系统变得易于设计，实现和标准化。 **这个和我们平时开发的时候，一般会将系统功能分解，然后将复杂的问题分解为容易理解的更小的问题是相对应的，这些较小的问题具有更好的边界（目标和接口）定义。**

我想到了计算机世界非常非常有名的一句话，这里分享一下：

> 计算机科学领域的任何问题都可以通过增加一个间接的中间层来解决，计算机整个体系从上到下都是按照严格的层次结构设计的。

### 常见网络协议

#### ⭐️应用层有哪些常见的协议？

![应用层常见协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/application-layer-protocol.png)

- **HTTP（Hypertext Transfer Protocol，超文本传输协议）**：基于 TCP 协议，是一种用于传输超文本和多媒体内容的协议，主要是为 Web 浏览器与 Web 服务器之间的通信而设计的。当我们使用浏览器浏览网页的时候，我们网页就是通过 HTTP 请求进行加载的。
- **SMTP（Simple Mail Transfer Protocol，简单邮件发送协议）**：基于 TCP 协议，是一种用于发送电子邮件的协议。注意 ⚠️：SMTP 协议只负责邮件的发送，而不是接收。要从邮件服务器接收邮件，需要使用 POP3 或 IMAP 协议。
- **POP3/IMAP（邮件接收协议）**：基于 TCP 协议，两者都是负责邮件接收的协议。IMAP 协议是比 POP3 更新的协议，它在功能和性能上都更加强大。IMAP 支持邮件搜索、标记、分类、归档等高级功能，而且可以在多个设备之间同步邮件状态。几乎所有现代电子邮件客户端和服务器都支持 IMAP。
- **FTP（File Transfer Protocol，文件传输协议）** : 基于 TCP 协议，是一种用于在计算机之间传输文件的协议，可以屏蔽操作系统和文件存储方式。注意 ⚠️：FTP 是一种不安全的协议，因为它在传输过程中不会对数据进行加密。建议在传输敏感数据时使用更安全的协议，如 SFTP。
- **Telnet（远程登陆协议）**：基于 TCP 协议，用于通过一个终端登陆到其他服务器。Telnet 协议的最大缺点之一是所有数据（包括用户名和密码）均以明文形式发送，这有潜在的安全风险。这就是为什么如今很少使用 Telnet，而是使用一种称为 SSH 的非常安全的网络传输协议的主要原因。
- **SSH（Secure Shell Protocol，安全的网络传输协议）**：基于 TCP 协议，通过加密和认证机制实现安全的访问和文件传输等业务
- **RTP（Real-time Transport Protocol，实时传输协议）**：通常基于 UDP 协议，但也支持 TCP 协议。它提供了端到端的实时传输数据的功能，但不包含资源预留存、不保证实时传输质量，这些功能由 WebRTC 实现。
- **DNS（Domain Name System，域名管理系统）**: 基于 UDP 协议，用于解决域名和 IP 地址的映射问题。

关于这些协议的详细介绍请看 [应用层常见协议总结（应用层）](./application-layer-protocol.md) 这篇文章。

#### 传输层有哪些常见的协议？

![传输层常见协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/transport-layer-protocol.png)

- **TCP（Transmission Control Protocol，传输控制协议 ）**：提供 **面向连接** 的，**可靠** 的数据传输服务。
- **UDP（User Datagram Protocol，用户数据协议）**：提供 **无连接** 的，**尽最大努力** 的数据传输服务（不保证数据传输的可靠性），简单高效。

#### 网络层有哪些常见的协议？

![网络层常见协议](images/network-model/nerwork-layer-protocol.png)

- **IP（Internet Protocol，网际协议）**：TCP/IP 协议中最重要的协议之一，属于网络层的协议，主要作用是定义数据包的格式、对数据包进行路由和寻址，以便它们可以跨网络传播并到达正确的目的地。目前 IP 协议主要分为两种，一种是过去的 IPv4，另一种是较新的 IPv6，目前这两种协议都在使用，但后者已经被提议来取代前者。
- **ARP（Address Resolution Protocol，地址解析协议）**：ARP 协议解决的是网络层地址和链路层地址之间的转换问题。因为一个 IP 数据报在物理上传输的过程中，总是需要知道下一跳（物理上的下一个目的地）该去往何处，但 IP 地址属于逻辑地址，而 MAC 地址才是物理地址，ARP 协议解决了 IP 地址转 MAC 地址的一些问题。
- **ICMP（Internet Control Message Protocol，互联网控制报文协议）**：一种用于传输网络状态和错误消息的协议，常用于网络诊断和故障排除。例如，Ping 工具就使用了 ICMP 协议来测试网络连通性。
- **NAT（Network Address Translation，网络地址转换协议）**：NAT 协议的应用场景如同它的名称——网络地址转换，应用于内部网到外部网的地址转换过程中。具体地说，在一个小的子网（局域网，LAN）内，各主机使用的是同一个 LAN 下的 IP 地址，但在该 LAN 以外，在广域网（WAN）中，需要一个统一的 IP 地址来标识该 LAN 在整个 Internet 上的位置。
- **OSPF（Open Shortest Path First，开放式最短路径优先）**：一种内部网关协议（Interior Gateway Protocol，IGP），也是广泛使用的一种动态路由协议，基于链路状态算法，考虑了链路的带宽、延迟等因素来选择最佳路径。
- **RIP(Routing Information Protocol，路由信息协议）**：一种内部网关协议（Interior Gateway Protocol，IGP），也是一种动态路由协议，基于距离向量算法，使用固定的跳数作为度量标准，选择跳数最少的路径作为最佳路径。
- **BGP（Border Gateway Protocol，边界网关协议）**：一种用来在路由选择域之间交换网络层可达性信息（Network Layer Reachability Information，NLRI）的路由选择协议，具有高度的灵活性和可扩展性。

## HTTP

### ⭐️从输入 URL 到页面展示到底发生了什么？（非常重要）

> 类似的问题：打开一个网页，整个过程会使用哪些协议？

先来看一张图（来源于《图解 HTTP》）：

<img src="https://oss.javaguide.cn/github/javaguide/url%E8%BE%93%E5%85%A5%E5%88%B0%E5%B1%95%E7%A4%BA%E5%87%BA%E6%9D%A5%E7%9A%84%E8%BF%87%E7%A8%8B.jpg" style="zoom:50%" />

上图有一个错误需要注意：是 OSPF 不是 OPSF。 OSPF（Open Shortest Path First，ospf）开放最短路径优先协议, 是由 Internet 工程任务组开发的路由选择协议

总体来说分为以下几个步骤:

1. 在浏览器中输入指定网页的 URL。
2. 浏览器通过 DNS 协议，获取域名对应的 IP 地址。
3. 浏览器根据 IP 地址和端口号，向目标服务器发起一个 TCP 连接请求。
4. 浏览器在 TCP 连接上，向服务器发送一个 HTTP 请求报文，请求获取网页的内容。
5. 服务器收到 HTTP 请求报文后，处理请求，并返回 HTTP 响应报文给浏览器。
6. 浏览器收到 HTTP 响应报文后，解析响应体中的 HTML 代码，渲染网页的结构和样式，同时根据 HTML 中的其他资源的 URL（如图片、CSS、JS 等），再次发起 HTTP 请求，获取这些资源的内容，直到网页完全加载显示。
7. 浏览器在不需要和服务器通信时，可以主动关闭 TCP 连接，或者等待服务器的关闭请求。

详细介绍可以查看这篇文章：[访问网页的全过程（知识串联）](https://javaguide.cn/cs-basics/network/the-whole-process-of-accessing-web-pages.html)（强烈推荐）。

### ⭐️HTTP 状态码有哪些？

HTTP 状态码用于描述 HTTP 请求的结果，比如 2xx 就代表请求被成功处理。

![常见 HTTP 状态码](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-status-code.png)

关于 HTTP 状态码更详细的总结，可以看我写的这篇文章：[HTTP 常见状态码总结（应用层）](https://javaguide.cn/cs-basics/network/http-status-codes.html)。

### HTTP Header 中常见的字段有哪些？

| 请求头字段名        | 说明                                                                                                                                                                          | 示例                                                                             |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| Accept              | 能够接受的回应内容类型（Content-Types）。                                                                                                                                     | Accept: text/plain                                                               |
| Accept-Charset      | 能够接受的字符集                                                                                                                                                              | Accept-Charset: utf-8                                                            |
| Accept-Datetime     | 能够接受的按照时间来表示的版本                                                                                                                                                | Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT                                   |
| Accept-Encoding     | 能够接受的编码方式列表。参考 HTTP 压缩。                                                                                                                                      | Accept-Encoding: gzip, deflate                                                   |
| Accept-Language     | 能够接受的回应内容的自然语言列表。                                                                                                                                            | Accept-Language: en-US                                                           |
| Authorization       | 用于超文本传输协议的认证的认证信息                                                                                                                                            | Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==                                |
| Cache-Control       | 用来指定在这次的请求/响应链中的所有缓存机制 都必须 遵守的指令                                                                                                                 | Cache-Control: no-cache                                                          |
| Connection          | 该浏览器想要优先使用的连接类型                                                                                                                                                | Connection: keep-alive                                                           |
| Content-Length      | 以八位字节数组（8 位的字节）表示的请求体的长度                                                                                                                                | Content-Length: 348                                                              |
| Content-MD5         | 请求体的内容的二进制 MD5 散列值，以 Base64 编码的结果                                                                                                                         | Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==                                            |
| Content-Type        | 请求体的多媒体类型（用于 POST 和 PUT 请求中）                                                                                                                                 | Content-Type: application/x-www-form-urlencoded                                  |
| Cookie              | 之前由服务器通过 Set-Cookie（下文详述）发送的一个超文本传输协议 Cookie                                                                                                        | Cookie: $Version=1; Skin=new;                                                    |
| Date                | 发送该消息的日期和时间(按照 RFC 7231 中定义的"超文本传输协议日期"格式来发送)                                                                                                  | Date: Tue, 15 Nov 1994 08:12:31 GMT                                              |
| Expect              | 表明客户端要求服务器做出特定的行为                                                                                                                                            | Expect: 100-continue                                                             |
| From                | 发起此请求的用户的邮件地址                                                                                                                                                    | From: `user@example.com`                                                         |
| Host                | 服务器的域名(用于虚拟主机)，以及服务器所监听的传输控制协议端口号。如果所请求的端口是对应的服务的标准端口，则端口号可被省略。                                                  | Host: en.wikipedia.org                                                           |
| If-Match            | 仅当客户端提供的实体与服务器上对应的实体相匹配时，才进行对应的操作。主要作用是用于像 PUT 这样的方法中，仅当从用户上次更新某个资源以来，该资源未被修改的情况下，才更新该资源。 | If-Match: "737060cd8c284d8af7ad3082f209582d"                                     |
| If-Modified-Since   | 允许服务器在请求的资源自指定的日期以来未被修改的情况下返回 `304 Not Modified` 状态码                                                                                          | If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT                                 |
| If-None-Match       | 允许服务器在请求的资源的 ETag 未发生变化的情况下返回 `304 Not Modified` 状态码                                                                                                | If-None-Match: "737060cd8c284d8af7ad3082f209582d"                                |
| If-Range            | 如果该实体未被修改过，则向我发送我所缺少的那一个或多个部分；否则，发送整个新的实体                                                                                            | If-Range: "737060cd8c284d8af7ad3082f209582d"                                     |
| If-Unmodified-Since | 仅当该实体自某个特定时间以来未被修改的情况下，才发送回应。                                                                                                                    | If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT                               |
| Max-Forwards        | 限制该消息可被代理及网关转发的次数。                                                                                                                                          | Max-Forwards: 10                                                                 |
| Origin              | 发起一个针对跨来源资源共享的请求。                                                                                                                                            | `Origin: http://www.example-social-network.com`                                  |
| Pragma              | 与具体的实现相关，这些字段可能在请求/回应链中的任何时候产生多种效果。                                                                                                         | Pragma: no-cache                                                                 |
| Proxy-Authorization | 用来向代理进行认证的认证信息。                                                                                                                                                | Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==                          |
| Range               | 仅请求某个实体的一部分。字节偏移以 0 开始。参见字节服务。                                                                                                                     | Range: bytes=500-999                                                             |
| Referer             | 表示浏览器所访问的前一个页面，正是那个页面上的某个链接将浏览器带到了当前所请求的这个页面。                                                                                    | `Referer: http://en.wikipedia.org/wiki/Main_Page`                                |
| TE                  | 浏览器预期接受的传输编码方式：可使用回应协议头 Transfer-Encoding 字段中的值；                                                                                                 | TE: trailers, deflate                                                            |
| Upgrade             | 要求服务器升级到另一个协议。                                                                                                                                                  | Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11                                   |
| User-Agent          | 浏览器的浏览器身份标识字符串                                                                                                                                                  | User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0 |
| Via                 | 向服务器告知，这个请求是由哪些代理发出的。                                                                                                                                    | Via: 1.0 fred, 1.1 example.com (Apache/1.1)                                      |
| Warning             | 一个一般性的警告，告知，在实体内容体中可能存在错误。                                                                                                                          | Warning: 199 Miscellaneous warning                                               |

### ⭐️HTTP 和 HTTPS 有什么区别？（重要）

![HTTP 和 HTTPS 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-vs-https.png)

- **端口号**：HTTP 默认是 80，HTTPS 默认是 443。
- **URL 前缀**：HTTP 的 URL 前缀是 `http://`，HTTPS 的 URL 前缀是 `https://`。
- **安全性和资源消耗**：HTTP 协议运行在 TCP 之上，所有传输的内容都是明文，客户端和服务器端都无法验证对方的身份。HTTPS 是运行在 SSL/TLS 之上的 HTTP 协议，SSL/TLS 运行在 TCP 之上。所有传输的内容都经过加密，加密采用对称加密，但对称加密的密钥用服务器方的证书进行了非对称加密。所以说，HTTP 安全性没有 HTTPS 高，但是 HTTPS 比 HTTP 耗费更多服务器资源。
- **SEO（搜索引擎优化）**：搜索引擎通常会更青睐使用 HTTPS 协议的网站，因为 HTTPS 能够提供更高的安全性和用户隐私保护。使用 HTTPS 协议的网站在搜索结果中可能会被优先显示，从而对 SEO 产生影响。

关于 HTTP 和 HTTPS 更详细的对比总结，可以看我写的这篇文章：[HTTP vs HTTPS（应用层）](https://javaguide.cn/cs-basics/network/http-vs-https.html) 。

### HTTP/1.0 和 HTTP/1.1 有什么区别？

![HTTP/1.0 和 HTTP/1.1 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.0-vs-http1.1.png)

- **连接方式** : HTTP/1.0 为短连接，HTTP/1.1 支持长连接。HTTP 协议的长连接和短连接，实质上是 TCP 协议的长连接和短连接。
- **状态响应码** : HTTP/1.1 中新加入了大量的状态码，光是错误响应状态码就新增了 24 种。比如说，`100 (Continue)`——在请求大资源前的预热请求，`206 (Partial Content)`——范围请求的标识码，`409 (Conflict)`——请求与当前资源的规定冲突，`410 (Gone)`——资源已被永久转移，而且没有任何已知的转发地址。
- **缓存机制** : 在 HTTP/1.0 中主要使用 Header 里的 If-Modified-Since,Expires 来做为缓存判断的标准，HTTP/1.1 则引入了更多的缓存控制策略例如 Entity tag，If-Unmodified-Since, If-Match, If-None-Match 等更多可供选择的缓存头来控制缓存策略。
- **带宽**：HTTP/1.0 中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能，HTTP/1.1 则在请求头引入了 range 头域，它允许只请求资源的某个部分，即返回码是 206（Partial Content），这样就方便了开发者自由的选择以便于充分利用带宽和连接。
- **Host 头（Host Header）处理** :HTTP/1.1 引入了 Host 头字段，允许在同一 IP 地址上托管多个域名，从而支持虚拟主机的功能。而 HTTP/1.0 没有 Host 头字段，无法实现虚拟主机。

关于 HTTP/1.0 和 HTTP/1.1 更详细的对比总结，可以看我写的这篇文章：[HTTP/1.0 vs HTTP/1.1（应用层）](https://javaguide.cn/cs-basics/network/http1.0-vs-http1.1.html) 。

### ⭐️HTTP/1.1 和 HTTP/2.0 有什么区别？

![HTTP/1.0 和 HTTP/1.1 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.1-vs-http2.0.png)

- **多路复用（Multiplexing）**：HTTP/2.0 在同一连接上可以同时传输多个请求和响应（可以看作是 HTTP/1.1 中长链接的升级版本），互不干扰。HTTP/1.1 则使用串行方式，每个请求和响应都需要独立的连接，而浏览器为了控制资源会有 6-8 个 TCP 连接的限制。这使得 HTTP/2.0 在处理多个请求时更加高效，减少了网络延迟和提高了性能。
- **二进制帧（Binary Frames）**：HTTP/2.0 使用二进制帧进行数据传输，而 HTTP/1.1 则使用文本格式的报文。二进制帧更加紧凑和高效，减少了传输的数据量和带宽消耗。
- **队头阻塞**：HTTP/2 引入了多路复用技术，允许多个请求和响应在单个 TCP 连接上并行交错传输，解决了 HTTP/1.1 应用层的队头阻塞问题，但 HTTP/2 依然受到 TCP 层队头阻塞 的影响。
- **头部压缩（Header Compression）**：HTTP/1.1 支持`Body`压缩，`Header`不支持压缩。HTTP/2.0 支持对`Header`压缩，使用了专门为`Header`压缩而设计的 HPACK 算法，减少了网络开销。
- **服务器推送（Server Push）**：HTTP/2.0 支持服务器推送，可以在客户端请求一个资源时，将其他相关资源一并推送给客户端，从而减少了客户端的请求次数和延迟。而 HTTP/1.1 需要客户端自己发送请求来获取相关资源。

HTTP/2.0 多路复用效果图（图源： [HTTP/2 For Web Developers](https://blog.cloudflare.com/http-2-for-web-developers/)）：

![HTTP/2 Multiplexing](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2.0-multiplexing.png)

可以看到，HTTP/2 的多路复用机制允许多个请求和响应共享一个 TCP 连接，从而避免了 HTTP/1.1 在应对并发请求时需要建立多个并行连接的情况，减少了重复连接建立和维护的额外开销。而在 HTTP/1.1 中，尽管支持持久连接，但为了缓解队头阻塞问题，浏览器通常会为同一域名建立多个并行连接。

### HTTP/2.0 和 HTTP/3.0 有什么区别？

![HTTP/2.0 和 HTTP/3.0 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2.0-vs-http3.0.png)

- **传输协议**：HTTP/2.0 是基于 TCP 协议实现的，HTTP/3.0 新增了 QUIC（Quick UDP Internet Connections） 协议来实现可靠的传输，提供与 TLS/SSL 相当的安全性，具有较低的连接和传输延迟。你可以将 QUIC 看作是 UDP 的升级版本，在其基础上新增了很多功能比如加密、重传等等。HTTP/3.0 之前名为 HTTP-over-QUIC，从这个名字中我们也可以发现，HTTP/3 最大的改造就是使用了 QUIC。
- **连接建立**：HTTP/2.0 需要经过经典的 TCP 三次握手过程（由于安全的 HTTPS 连接建立还需要 TLS 握手，共需要大约 3 个 RTT）。由于 QUIC 协议的特性（TLS 1.3，TLS 1.3 除了支持 1 个 RTT 的握手，还支持 0 个 RTT 的握手）连接建立仅需 0-RTT 或者 1-RTT。这意味着 QUIC 在最佳情况下不需要任何的额外往返时间就可以建立新连接。
- **头部压缩**：HTTP/2.0 使用 HPACK 算法进行头部压缩，而 HTTP/3.0 使用更高效的 QPACK 头压缩算法。
- **队头阻塞**：HTTP/2.0 多请求复用一个 TCP 连接，一旦发生丢包，就会阻塞住所有的 HTTP 请求。由于 QUIC 协议的特性，HTTP/3.0 在一定程度上解决了队头阻塞（Head-of-Line blocking, 简写：HOL blocking）问题，一个连接建立多个不同的数据流，这些数据流之间独立互不影响，某个数据流发生丢包了，其数据流不受影响（本质上是多路复用+轮询）。
- **连接迁移**：HTTP/3.0 支持连接迁移，因为 QUIC 使用 64 位 ID 标识连接，只要 ID 不变就不会中断，网络环境改变时（如从 Wi-Fi 切换到移动数据）也能保持连接。而 TCP 连接是由（源 IP，源端口，目的 IP，目的端口）组成，这个四元组中一旦有一项值发生改变，这个连接也就不能用了。
- **错误恢复**：HTTP/3.0 具有更好的错误恢复机制，当出现丢包、延迟等网络问题时，可以更快地进行恢复和重传。而 HTTP/2.0 则需要依赖于 TCP 的错误恢复机制。
- **安全性**：在 HTTP/2.0 中，TLS 用于加密和认证整个 HTTP 会话，包括所有的 HTTP 头部和数据负载。TLS 的工作是在 TCP 层之上，它加密的是在 TCP 连接中传输的应用层的数据，并不会对 TCP 头部以及 TLS 记录层头部进行加密，所以在传输的过程中 TCP 头部可能会被攻击者篡改来干扰通信。而 HTTP/3.0 的 QUIC 对整个数据包（包括报文头和报文体）进行了加密与认证处理，保障安全性。

HTTP/1.0、HTTP/2.0 和 HTTP/3.0 的协议栈比较：

![http-3-implementation](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-3-implementation.png)

下图是一个更详细的 HTTP/2.0 和 HTTP/3.0 对比图：

![HTTP/2.0 和 HTTP/3.0 详细对比图](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2-and-http3-stacks-comparison.png)

从上图可以看出：

- **HTTP/2.0**：使用 TCP 作为传输协议、使用 HPACK 进行头部压缩、依赖 TLS 进行加密。
- **HTTP/3.0**：使用基于 UDP 的 QUIC 协议、使用更高效的 QPACK 进行头部压缩、在 QUIC 中直接集成了 TLS。QUIC 协议具备连接迁移、拥塞控制与避免、流量控制等特性。

关于 HTTP/1.0 -> HTTP/3.0 更详细的演进介绍，推荐阅读[HTTP1 到 HTTP3 的工程优化](https://dbwu.tech/posts/http_evolution/)。

### HTTP/1.1 和 HTTP/2.0 的队头阻塞有什么不同？

HTTP/1.1 队头阻塞的主要原因是无法多路复用：

- 在一个 TCP 连接中，资源的请求和响应是按顺序处理的。如果一个大的资源（如一个大文件）正在传输，后续的小资源（如较小的 CSS 文件）需要等待前面的资源传输完成后才能被发送。
- 如果浏览器需要同时加载多个资源（如多个 CSS、JS 文件等），它通常会开启多个并行的 TCP 连接（一般限制为 6 个）。但每个连接仍然受限于顺序的请求-响应机制，因此仍然会发生 **应用层的队头阻塞**。

虽然 HTTP/2.0 引入了多路复用技术，允许多个请求和响应在单个 TCP 连接上并行交错传输，解决了 **HTTP/1.1 应用层的队头阻塞问题**，但 HTTP/2.0 依然受到 **TCP 层队头阻塞** 的影响：

- HTTP/2.0 通过帧（frame）机制将每个资源分割成小块，并为每个资源分配唯一的流 ID，这样多个资源的数据可以在同一 TCP 连接中交错传输。
- TCP 作为传输层协议，要求数据按顺序交付。如果某个数据包在传输过程中丢失，即使后续的数据包已经到达，也必须等待丢失的数据包重传后才能继续处理。这种传输层的顺序性导致了 **TCP 层的队头阻塞**。
- 举例来说，如果 HTTP/2 的一个 TCP 数据包中携带了多个资源的数据（例如 JS 和 CSS），而该数据包丢失了，那么后续数据包中的所有资源数据都需要等待丢失的数据包重传回来，导致所有流（streams）都被阻塞。

最后，来一张表格总结补充一下：

| **方面**       | **HTTP/1.1 的队头阻塞**                  | **HTTP/2.0 的队头阻塞**                                          |
| -------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **层级**       | 应用层（HTTP 协议本身的限制）            | 传输层（TCP 协议的限制）                                         |
| **根本原因**   | 无法多路复用，请求和响应必须按顺序传输   | TCP 要求数据包按顺序交付，丢包时阻塞整个连接                     |
| **受影响范围** | 单个 HTTP 请求/响应会阻塞后续请求/响应。 | 单个 TCP 包丢失会影响所有 HTTP/2.0 流(依赖于同一个底层 TCP 连接) |
| **缓解方法**   | 开启多个并行的 TCP 连接                  | 减少网络掉包或者使用基于 UDP 的 QUIC 协议                        |
| **影响场景**   | 每次都会发生，尤其是大文件阻塞小文件时。 | 丢包率较高的网络环境下更容易发生。                               |

### ⭐️HTTP 是不保存状态的协议, 如何保存用户状态?

HTTP 协议本身是 **无状态的 (stateless)** 。这意味着服务器默认情况下无法区分两个连续的请求是否来自同一个用户，或者同一个用户之前的操作是什么。这就像一个“健忘”的服务员，每次你跟他说话，他都不知道你是谁，也不知道你之前点过什么菜。

但在实际的 Web 应用中，比如网上购物、用户登录等场景，我们显然需要记住用户的状态（例如购物车里的商品、用户的登录信息）。为了解决这个问题，主要有以下几种常用机制：

**方案一：Session (会话) 配合 Cookie (主流方式)：**

![](https://oss.javaguide.cn/github/javaguide/system-design/security/session-cookie-authentication-process.png)

这可以说是最经典也是最常用的方法了。基本流程是这样的：

1. 用户向服务器发送用户名、密码、验证码用于登陆系统。
2. 服务器验证通过后，会为这个用户创建一个专属的 Session 对象（可以理解为服务器上的一块内存，存放该用户的状态数据，如购物车、登录信息等）存储起来，并给这个 Session 分配一个唯一的 `SessionID`。
3. 服务器通过 HTTP 响应头中的 `Set-Cookie` 指令，把这个 `SessionID` 发送给用户的浏览器。
4. 浏览器接收到 `SessionID` 后，会将其以 Cookie 的形式保存在本地。当用户保持登录状态时，每次向该服务器发请求，浏览器都会自动带上这个存有 `SessionID` 的 Cookie。
5. 服务器收到请求后，从 Cookie 中拿出 `SessionID`，就能找到之前保存的那个 Session 对象，从而知道这是哪个用户以及他之前的状态了。

使用 Session 的时候需要注意下面几个点：

- **客户端 Cookie 支持**：依赖 Session 的核心功能要确保用户浏览器开启了 Cookie。
- **Session 过期管理**：合理设置 Session 的过期时间，平衡安全性和用户体验。
- **Session ID 安全**：为包含 `SessionID` 的 Cookie 设置 `HttpOnly` 标志可以防止客户端脚本（如 JavaScript）窃取，设置 Secure 标志可以保证 `SessionID` 只在 HTTPS 连接下传输，增加安全性。

Session 数据本身存储在服务器端。常见的存储方式有：

- **服务器内存**:实现简单，访问速度快，但服务器重启数据会丢失，且不利于多服务器间的负载均衡。这种方式适合简单且用户量不大的业务场景。
- **数据库 (如 MySQL, PostgreSQL)**:数据持久化，但读写性能相对较低，一般不会使用这种方式。
- **分布式缓存 (如 Redis)**:性能高，支持分布式部署，是目前大规模应用中非常主流的方案。

**方案二：当 Cookie 被禁用时：URL 重写 (URL Rewriting)**

如果用户的浏览器禁用了 Cookie，或者某些情况下不便使用 Cookie，还有一种备选方案是 URL 重写。这种方式会将 `SessionID` 直接附加到 URL 的末尾，作为参数传递。例如：<http://www.example.com/page?sessionid=xxxxxx>。服务器端会解析 URL 中的 `sessionid` 参数来获取 `SessionID`，进而找到对应的 Session 数据。

这种方法一般不会使用，存在以下缺点：

- URL 会变长且不美观；
- `SessionID` 暴露在 URL 中，安全性较低（容易被复制、分享或记录在日志中）；
- 对搜索引擎优化 (SEO) 可能不友好。

**方案三：Token-based 认证 (如 JWT - JSON Web Tokens)**

这是一种越来越流行的无状态认证方式，尤其适用于前后端分离的架构和微服务。

![ JWT 身份验证示意图](https://oss.javaguide.cn/github/javaguide/system-design/jwt/jwt-authentication%20process.png)

以 JWT 为例（普通 Token 方案也可以），简化后的步骤如下

1. 用户向服务器发送用户名、密码以及验证码用于登陆系统；
2. 如果用户用户名、密码以及验证码校验正确的话，服务端会返回已经签名的 Token，也就是 JWT；
3. 客户端收到 Token 后自己保存起来（比如浏览器的 `localStorage` ）；
4. 用户以后每次向后端发请求都在 Header 中带上这个 JWT ；
5. 服务端检查 JWT 并从中获取用户相关信息。

JWT 详细介绍可以查看这两篇文章：

- [JWT 基础概念详解](https://javaguide.cn/system-design/security/jwt-intro.html)
- [JWT 身份认证优缺点分析](https://javaguide.cn/system-design/security/advantages-and-disadvantages-of-jwt.html)

总结来说，虽然 HTTP 本身是无状态的，但通过 Cookie + Session、URL 重写或 Token 等机制，我们能够有效地在 Web 应用中跟踪和管理用户状态。其中，**Cookie + Session 是最传统也最广泛使用的方式，而 Token-based 认证则在现代 Web 应用中越来越受欢迎。**

### URI 和 URL 的区别是什么?

- URI(Uniform Resource Identifier) 是统一资源标志符，可以唯一标识一个资源。
- URL(Uniform Resource Locator) 是统一资源定位符，可以提供该资源的路径。它是一种具体的 URI，即 URL 可以用来标识一个资源，而且还指明了如何 locate 这个资源。

URI 的作用像身份证号一样，URL 的作用更像家庭住址一样。URL 是一种具体的 URI，它不仅唯一标识资源，而且还提供了定位该资源的信息。

### Cookie 和 Session 有什么区别？

准确点来说，这个问题属于认证授权的范畴，你可以在 [认证授权基础概念详解](https://javaguide.cn/system-design/security/basis-of-authority-certification.html) 这篇文章中找到详细的答案。

### ⭐️GET 和 POST 的区别

这个问题在知乎上被讨论的挺火热的，地址：<https://www.zhihu.com/question/28586791> 。

![](https://static001.geekbang.org/infoq/04/0454a5fff1437c32754f1dfcc3881148.png)

GET 和 POST 是 HTTP 协议中两种常用的请求方法，它们在不同的场景和目的下有不同的特点和用法。一般来说，可以从以下几个方面来区分二者（重点搞清两者在语义上的区别即可）：

- 语义（主要区别）：GET 通常用于获取或查询资源，而 POST 通常用于创建或修改资源。
- 幂等：GET 请求是幂等的，即多次重复执行不会改变资源的状态，而 POST 请求是不幂等的，即每次执行可能会产生不同的结果或影响资源的状态。
- 格式：GET 请求的参数通常放在 URL 中，形成查询字符串（querystring），而 POST 请求的参数通常放在请求体（body）中，可以有多种编码格式，如 application/x-www-form-urlencoded、multipart/form-data、application/json 等。GET 请求的 URL 长度受到浏览器和服务器的限制，而 POST 请求的 body 大小则没有明确的限制。不过，实际上 GET 请求也可以用 body 传输数据，只是并不推荐这样做，因为这样可能会导致一些兼容性或者语义上的问题。
- 缓存：由于 GET 请求是幂等的，它可以被浏览器或其他中间节点（如代理、网关）缓存起来，以提高性能和效率。而 POST 请求则不适合被缓存，因为它可能有副作用，每次执行可能需要实时的响应。
- 安全性：GET 请求和 POST 请求如果使用 HTTP 协议的话，那都不安全，因为 HTTP 协议本身是明文传输的，必须使用 HTTPS 协议来加密传输数据。另外，GET 请求相比 POST 请求更容易泄露敏感数据，因为 GET 请求的参数通常放在 URL 中。

再次提示，重点搞清两者在语义上的区别即可，实际使用过程中，也是通过语义来区分使用 GET 还是 POST。不过，也有一些项目所有的请求都用 POST，这个并不是固定的，项目组达成共识即可。

## WebSocket

### 什么是 WebSocket?

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

### ⭐️WebSocket 和 HTTP 有什么区别？

WebSocket 和 HTTP 两者都是基于 TCP 的应用层协议，都可以在网络中传输数据。

下面是二者的主要区别：

- WebSocket 是一种双向实时通信协议，而 HTTP 是一种单向通信协议。并且，HTTP 协议下的通信只能由客户端发起，服务器无法主动通知客户端。
- WebSocket 使用 ws:// 或 wss://（使用 SSL/TLS 加密后的协议，类似于 HTTP 和 HTTPS 的关系） 作为协议前缀，HTTP 使用 http:// 或 https:// 作为协议前缀。
- WebSocket 可以支持扩展，用户可以扩展协议，实现部分自定义的子协议，如支持压缩、加密等。
- WebSocket 通信数据格式比较轻量，用于协议控制的数据包头部相对较小，网络开销小，而 HTTP 通信每次都要携带完整的头部，网络开销较大（HTTP/2.0 使用二进制帧进行数据传输，还支持头部压缩，减少了网络开销）。

### WebSocket 的工作过程是什么样的？

WebSocket 的工作过程可以分为以下几个步骤：

1. 客户端向服务器发送一个 HTTP 请求，请求头中包含 `Upgrade: websocket` 和 `Sec-WebSocket-Key` 等字段，表示要求升级协议为 WebSocket；
2. 服务器收到这个请求后，会进行升级协议的操作，如果支持 WebSocket，它将回复一个 HTTP 101 状态码，响应头中包含 ，`Connection: Upgrade`和 `Sec-WebSocket-Accept: xxx` 等字段、表示成功升级到 WebSocket 协议。
3. 客户端和服务器之间建立了一个 WebSocket 连接，可以进行双向的数据传输。数据以帧（frames）的形式进行传送，WebSocket 的每条消息可能会被切分成多个数据帧（最小单位）。发送端会将消息切割成多个帧发送给接收端，接收端接收消息帧，并将关联的帧重新组装成完整的消息。
4. 客户端或服务器可以主动发送一个关闭帧，表示要断开连接。另一方收到后，也会回复一个关闭帧，然后双方关闭 TCP 连接。

另外，建立 WebSocket 连接之后，通过心跳机制来保持 WebSocket 连接的稳定性和活跃性。

### ⭐️WebSocket 与短轮询、长轮询的区别

这三种方式，都是为了解决“**客户端如何及时获取服务器最新数据，实现实时更新**”的问题。它们的实现方式和效率、实时性差异较大。

**1.短轮询（Short Polling）**

- **原理**：客户端每隔固定时间（如 5 秒）发起一次 HTTP 请求，询问服务器是否有新数据。服务器收到请求后立即响应。
- **优点**：实现简单，兼容性好，直接用常规 HTTP 请求即可。
- **缺点**：
  - **实时性一般**：消息可能在两次轮询间到达，用户需等到下次请求才知晓。
  - **资源浪费大**：反复建立/关闭连接，且大多数请求收到的都是“无新消息”，极大增加服务器和网络压力。

**2.长轮询（Long Polling）**

- **原理**：客户端发起请求后，若服务器暂时无新数据，则会保持连接，直到有新数据或超时才响应。客户端收到响应后立即发起下一次请求，实现“伪实时”。
- **优点**：
  - **实时性较好**：一旦有新数据可立即推送，无需等待下次定时请求。
  - **空响应减少**：减少了无效的空响应，提升了效率。
- **缺点**：
  - **服务器资源占用高**：需长时间维护大量连接，消耗服务器线程/连接数。
  - **资源浪费大**：每次响应后仍需重新建立连接，且依然基于 HTTP 单向请求-响应机制。

**3. WebSocket**

- **原理**：客户端与服务器通过一次 HTTP Upgrade 握手后，建立一条持久的 TCP 连接。之后，双方可以随时、主动地发送数据，实现真正的全双工、低延迟通信。
- **优点**：
  - **实时性强**：数据可即时双向收发，延迟极低。
  - **资源效率高**：连接持续，无需反复建立/关闭，减少资源消耗。
  - **功能强大**：支持服务端主动推送消息、客户端主动发起通信。
- **缺点**：
  - **使用限制**：需要服务器和客户端都支持 WebSocket 协议。对连接管理有一定要求（如心跳保活、断线重连等）。
  - **实现麻烦**：实现起来比短轮询和长轮询要更麻烦一些。

![Websocket 示意图](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

### ⭐️SSE 与 WebSocket 有什么区别？

SSE (Server-Sent Events) 和 WebSocket 都是用来实现服务器向浏览器实时推送消息的技术，让网页内容能自动更新，而不需要用户手动刷新。虽然目标相似，但它们在工作方式和适用场景上有几个关键区别：

1. **通信方式:**
   - **SSE:** **单向通信**。只有服务器能向客户端（浏览器）发送数据。客户端不能通过同一个连接向服务器发送数据（需要发起新的 HTTP 请求）。
   - **WebSocket:** **双向通信 (全双工)**。客户端和服务器可以随时互相发送消息，实现真正的实时交互。
2. **底层协议:**
   - **SSE:** 基于**标准的 HTTP/HTTPS 协议**。它本质上是一个“长连接”的 HTTP 请求，服务器保持连接打开并持续发送事件流。不需要特殊的服务器或协议支持，现有的 HTTP 基础设施就能用。
   - **WebSocket:** 使用**独立的 ws:// 或 wss:// 协议**。它需要通过一个特定的 HTTP "Upgrade" 请求来建立连接，并且服务器需要明确支持 WebSocket 协议来处理连接和消息帧。
3. **实现复杂度和成本:**
   - **SSE:** **实现相对简单**，主要在服务器端处理。浏览器端有标准的 EventSource API，使用方便。开发和维护成本较低。
   - **WebSocket:** **稍微复杂一些**。需要服务器端专门处理 WebSocket 连接和协议，客户端也需要使用 WebSocket API。如果需要考虑兼容性、心跳、重连等，开发成本会更高。
4. **断线重连:**
   - **SSE:** **浏览器原生支持**。EventSource API 提供了自动断线重连的机制。
   - **WebSocket:** **需要手动实现**。开发者需要自己编写逻辑来检测断线并进行重连尝试。
5. **数据类型:**
   - **SSE:** **主要设计用来传输文本** (UTF-8 编码)。如果需要传输二进制数据，需要先进行 Base64 等编码转换成文本。
   - **WebSocket:** **原生支持传输文本和二进制数据**，无需额外编码。

为了提供更好的用户体验和利用其简单、高效、基于标准 HTTP 的特性，**Server-Sent Events (SSE) 是目前大型语言模型 API（如 OpenAI、DeepSeek 等）实现流式响应的常用甚至可以说是标准的技术选择**。

这里以 DeepSeek 为例，我们发送一个请求并打开浏览器控制台验证一下：

![DeepSeek 响应标头](https://oss.javaguide.cn/github/javaguide/cs-basics/network/deepseek-sse.png)

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/deepseek-sse-eventstream.png)

可以看到，响应头应里包含了 `text/event-stream`，说明使用的确实是 SSE。并且，响应数据也确实是持续分块传输。

## PING

### PING 命令的作用是什么？

PING 命令是一种常用的网络诊断工具，经常用来测试网络中主机之间的连通性和网络延迟。

这里简单举一个例子，我们来 PING 一下百度。

```bash
# 发送4个PING请求数据包到 www.baidu.com
❯ ping -c 4 www.baidu.com

PING www.a.shifen.com (14.119.104.189): 56 data bytes
64 bytes from 14.119.104.189: icmp_seq=0 ttl=54 time=27.867 ms
64 bytes from 14.119.104.189: icmp_seq=1 ttl=54 time=28.732 ms
64 bytes from 14.119.104.189: icmp_seq=2 ttl=54 time=27.571 ms
64 bytes from 14.119.104.189: icmp_seq=3 ttl=54 time=27.581 ms

--- www.a.shifen.com ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 27.571/27.938/28.732/0.474 ms
```

PING 命令的输出结果通常包括以下几部分信息：

1. **ICMP Echo Request（请求报文）信息**：序列号、TTL（Time to Live）值。
2. **目标主机的域名或 IP 地址**：输出结果的第一行。
3. **往返时间（RTT，Round-Trip Time）**：从发送 ICMP Echo Request（请求报文）到接收到 ICMP Echo Reply（响应报文）的总时间，用来衡量网络连接的延迟。
4. **统计结果（Statistics）**：包括发送的 ICMP 请求数据包数量、接收到的 ICMP 响应数据包数量、丢包率、往返时间（RTT）的最小、平均、最大和标准偏差值。

如果 PING 对应的目标主机无法得到正确的响应，则表明这两个主机之间的连通性存在问题（有些主机或网络管理员可能禁用了对 ICMP 请求的回复，这样也会导致无法得到正确的响应）。如果往返时间（RTT）过高，则表明网络延迟过高。

### PING 命令的工作原理是什么？

PING 基于网络层的 **ICMP（Internet Control Message Protocol，互联网控制报文协议）**，其主要原理就是通过在网络上发送和接收 ICMP 报文实现的。

ICMP 报文中包含了类型字段，用于标识 ICMP 报文类型。ICMP 报文的类型有很多种，但大致可以分为两类：

- **查询报文类型**：向目标主机发送请求并期望得到响应。
- **差错报文类型**：向源主机发送错误信息，用于报告网络中的错误情况。

PING 用到的 ICMP Echo Request（类型为 8 ） 和 ICMP Echo Reply（类型为 0） 属于查询报文类型 。

- PING 命令会向目标主机发送 ICMP Echo Request。
- 如果两个主机的连通性正常，目标主机会返回一个对应的 ICMP Echo Reply。

## DNS

### DNS 的作用是什么？

DNS（Domain Name System）域名管理系统，是当用户使用浏览器访问网址之后，使用的第一个重要协议。DNS 要解决的是**域名和 IP 地址的映射问题**。

![DNS:域名系统](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

在一台电脑上，可能存在浏览器 DNS 缓存，操作系统 DNS 缓存，路由器 DNS 缓存。如果以上缓存都查询不到，那么 DNS 就闪亮登场了。

目前 DNS 的设计采用的是分布式、层次数据库结构，**DNS 是应用层协议，它可以在 UDP 或 TCP 协议之上运行，端口为 53** 。

### DNS 服务器有哪些？根服务器有多少个？

DNS 服务器自底向上可以依次分为以下几个层级(所有 DNS 服务器都属于以下四个类别之一):

- 根 DNS 服务器。根 DNS 服务器提供 TLD 服务器的 IP 地址。目前世界上只有 13 组根服务器，我国境内目前仍没有根服务器。
- 顶级域 DNS 服务器（TLD 服务器）。顶级域是指域名的后缀，如`com`、`org`、`net`和`edu`等。国家也有自己的顶级域，如`uk`、`fr`和`ca`。TLD 服务器提供了权威 DNS 服务器的 IP 地址。
- 权威 DNS 服务器。在因特网上具有公共可访问主机的每个组织机构必须提供公共可访问的 DNS 记录，这些记录将这些主机的名字映射为 IP 地址。
- 本地 DNS 服务器。每个 ISP（互联网服务提供商）都有一个自己的本地 DNS 服务器。当主机发出 DNS 请求时，该请求被发往本地 DNS 服务器，它起着代理的作用，并将该请求转发到 DNS 层次结构中。严格说来，不属于 DNS 层级结构

世界上并不是只有 13 台根服务器，这是很多人普遍的误解，网上很多文章也是这么写的。实际上，现在根服务器数量远远超过这个数量。最初确实是为 DNS 根服务器分配了 13 个 IP 地址，每个 IP 地址对应一个不同的根 DNS 服务器。然而，由于互联网的快速发展和增长，这个原始的架构变得不太适应当前的需求。为了提高 DNS 的可靠性、安全性和性能，目前这 13 个 IP 地址中的每一个都有多个服务器，截止到 2023 年底，所有根服务器之和达到了 1700 多台，未来还会继续增加。

### ⭐️DNS 解析的过程是什么样的？

整个过程的步骤比较多，我单独写了一篇文章详细介绍：[DNS 域名系统详解（应用层）](https://javaguide.cn/cs-basics/network/dns.html) 。

### DNS 劫持了解吗？如何应对？

DNS 劫持是一种网络攻击，它通过修改 DNS 服务器的解析结果，使用户访问的域名指向错误的 IP 地址，从而导致用户无法访问正常的网站，或者被引导到恶意的网站。DNS 劫持有时也被称为 DNS 重定向、DNS 欺骗或 DNS 污染。

## 参考

- 《图解 HTTP》
- 《计算机网络自顶向下方法》（第七版）
- 详解 HTTP/2.0 及 HTTPS 协议：<https://juejin.cn/post/7034668672262242318>
- HTTP 请求头字段大全| HTTP Request Headers：<https://www.flysnow.org/tools/table/http-request-headers/>
- HTTP1、HTTP2、HTTP3：<https://juejin.cn/post/6855470356657307662>
- 如何看待 HTTP/3 ？ - 车小胖的回答 - 知乎: <https://www.zhihu.com/question/302412059/answer/533223530>

<!-- @include: @article-footer.snippet.md -->
