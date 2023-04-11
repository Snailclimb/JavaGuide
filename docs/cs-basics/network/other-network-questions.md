---
title: 计算机网络常见面试题总结
category: 计算机基础
tag:
  - 计算机网络
---

## 计算机网络基础

### OSI 和 TCP/IP 网络分层模型

**相关面试题** ：

- OSI 七层模型是什么？每一层的作用是什么？
- TCP/IP 四层模型是什么？每一层的作用是什么？
- 为什么网络要分层？

**参考答案** ：[OSI 和 TCP/IP 网络分层模型详解（基础）](./osi&tcp-ip-model.md)。

### 应用层有哪些常见的协议？

- **HTTP（超文本传输协议）** ：基于 TCP协议，是一种用于传输超文本和多媒体内容的协议，主要是为 Web 浏览器与 Web 服务器之间的通信而设计的。当我们使用浏览器浏览网页的时候，我们网页就是通过 HTTP 请求进行加载的。
- **SMTP（简单邮件传输(发送)协议）** ：基于 TCP 协议，是一种用于发送电子邮件的协议。注意⚠️：SMTP协议只负责邮件的发送，而不是接收。要从邮件服务器接收邮件，需要使用POP3或IMAP协议。
- **POP3/IMAP（邮件接收的协议）** ：基于 TCP 协议，两者都是负责邮件接收的协议。IMAP协议是比POP3更新的协议，它在功能和性能上都更加强大。IMAP支持邮件搜索、标记、分类、归档等高级功能，而且可以在多个设备之间同步邮件状态。几乎所有现代电子邮件客户端和服务器都支持 IMAP。
- **FTP（文件传输协议）** : 基于 TCP 协议，是一种用于在计算机之间传输文件的协议，可以屏蔽操作系统和文件存储方式。注意⚠️：FTP 是一种不安全的协议，因为它在传输过程中不会对数据进行加密。建议在传输敏感数据时使用更安全的协议，如SFTP。
- **Telnet（远程登陆协议）** ：基于 TCP 协议，用于通过一个终端登陆到其他服务器。Telnet 协议的最大缺点之一是所有数据（包括用户名和密码）均以明文形式发送，这有潜在的安全风险。这就是为什么如今很少使用Telnet，而是使用一种称为SSH的非常安全的网络传输协议的主要原因。
- **SSH（安全的网络传输协议）** ：基于  TCP 协议，通过加密和认证机制实现安全的访问和文件传输等业务
- **RTP（实时传输协议）**：通常基于 UDP 协议，但也支持 TCP 协议。它提供了端到端的实时传输数据的功能，但不包含资源预留存、不保证实时传输质量，这些功能由 WebRTC 实现。
- **DNS（域名管理系统）**: 基于 UDP 协议，用于解决域名和 IP 地址的映射问题。

关于这些协议的详细介绍请看 [应用层常见协议总结（应用层）](./application-layer-protocol.md)  这篇文章。

## TCP 与 UDP


###  TCP 与 UDP 的区别（重要）

1. **是否面向连接** ：UDP 在传送数据之前不需要先建立连接。而 TCP 提供面向连接的服务，在传送数据之前必须先建立连接，数据传送结束后要释放连接。
2. **是否是可靠传输**：远地主机在收到 UDP 报文后，不需要给出任何确认，并且不保证数据不丢失，不保证是否顺序到达。TCP 提供可靠的传输服务，TCP 在传递数据之前，会有三次握手来建立连接，而且在数据传递时，有确认、窗口、重传、拥塞控制机制。通过 TCP 连接传输的数据，无差错、不丢失、不重复、并且按序到达。
3. **是否有状态** ：这个和上面的“是否可靠传输”相对应。TCP 传输是有状态的，这个有状态说的是 TCP 会去记录自己发送消息的状态比如消息是否发送了、是否被接收了等等。为此 ，TCP 需要维持复杂的连接状态表。而 UDP 是无状态服务，简单来说就是不管发出去之后的事情了（**这很渣男！**）。
4. **传输效率** ：由于使用 TCP 进行传输的时候多了连接、确认、重传等机制，所以 TCP 的传输效率要比 UDP 低很多。
5. **传输形式** ： TCP 是面向字节流的，UDP 是面向报文的。
6. **首部开销** ：TCP 首部开销（20 ～ 60 字节）比 UDP 首部开销（8 字节）要大。
7. **是否提供广播或多播服务** ：TCP 只支持点对点通信，UDP 支持一对一、一对多、多对一、多对多；
8. ......


我把上面总结的内容通过表格形式展示出来了！确定不点个赞嘛？

|                        | TCP            | UDP        |
| ---------------------- | -------------- | ---------- |
| 是否面向连接           | 是             | 否         |
| 是否可靠               | 是             | 否         |
| 是否有状态             | 是             | 否         |
| 传输效率               | 较慢           | 较快       |
| 传输形式               | 字节流         | 数据报文段 |
| 首部开销               | 20 ～ 60 bytes | 8 bytes    |
| 是否提供广播或多播服务 | 否             | 是         |

###  什么时候选择 TCP,什么时候选 UDP?


- **UDP 一般用于即时通信**，比如： 语音、 视频 、直播等等。这些场景对传输数据的准确性要求不是特别高，比如你看视频即使少个一两帧，实际给人的感觉区别也不大。
- **TCP 用于对传输准确性要求特别高的场景**，比如文件传输、发送和接收邮件、远程登录等等。

###  HTTP 基于 TCP 还是 UDP？

~~**HTTP 协议是基于 TCP 协议的**，所以发送 HTTP 请求之前首先要建立 TCP 连接也就是要经历 3 次握手。~~

🐛 修正（参见 [issue#1915](https://github.com/Snailclimb/JavaGuide/issues/1915)）：HTTP 3.0 之前是基于 TCP 协议的，而 HTTP3.0 将弃用 TCP，改用 **基于 UDP 的 QUIC 协议** 。此变化主要为了解决 HTTP/2 中存在的队头阻塞问题。由于 HTTP/2 在单个 TCP 连接上使用了多路复用，受到 TCP 拥塞控制的影响，少量的丢包就可能导致整个 TCP 连接上的所有流被阻塞。

相关证明可以参考下面这两个链接：

- https://zh.wikipedia.org/zh/HTTP/3
- https://datatracker.ietf.org/doc/rfc9114/

### 使用 TCP 的协议有哪些?使用 UDP 的协议有哪些?

**运行于 TCP 协议之上的协议** ：

1. **HTTP 协议** ：超文本传输协议（HTTP，HyperText Transfer Protocol)主要是为 Web 浏览器与 Web 服务器之间的通信而设计的。当我们使用浏览器浏览网页的时候，我们网页就是通过 HTTP 请求进行加载的。
2. **HTTPS 协议** ：更安全的超文本传输协议(HTTPS,Hypertext Transfer Protocol Secure)，身披 SSL 外衣的 HTTP 协议
3. **FTP 协议**：文件传输协议 FTP（File Transfer Protocol），提供文件传输服务，**基于 TCP** 实现可靠的传输。使用 FTP 传输文件的好处是可以屏蔽操作系统和文件存储方式。
4. **SMTP 协议**：简单邮件传输协议（SMTP，Simple Mail Transfer Protocol）的缩写，**基于 TCP 协议**，用来发送电子邮件。注意 ⚠️：接受邮件的协议不是 SMTP 而是 POP3 协议。
5. **POP3/IMAP 协议**： POP3 和 IMAP 两者都是负责邮件接收的协议。
6. **Telnet 协议**：远程登陆协议，通过一个终端登陆到其他服务器。被一种称为 SSH 的非常安全的协议所取代。
7. **SSH 协议** : SSH（ Secure Shell）是目前较可靠，专为远程登录会话和其他网络服务提供安全性的协议。利用 SSH 协议可以有效防止远程管理过程中的信息泄露问题。SSH 建立在可靠的传输协议 TCP 之上。
8. ......

**运行于 UDP 协议之上的协议** ：

1. **DHCP 协议**：动态主机配置协议，动态配置 IP 地址
2. **DNS** ： **域名系统（DNS，Domain Name System）将人类可读的域名 (例如，www.baidu.com) 转换为机器可读的 IP 地址 (例如，220.181.38.148)。** 我们可以将其理解为专为互联网设计的电话薄。实际上 DNS 同时支持 UDP 和 TCP 协议。

### TCP 三次握手和四次挥手（非常重要）

**相关面试题** ：

- 为什么要三次握手?
- 第 2 次握手传回了ACK，为什么还要传回SYN？
- 为什么要四次挥手？
- 为什么不能把服务器发送的 ACK 和 FIN 合并起来，变成三次挥手？
- 如果第二次挥手时服务器的 ACK 没有送达客户端，会怎样？
- 为什么第四次挥手客户端需要等待 2\*MSL（报文段最长寿命）时间后才进入 CLOSED 状态？

**参考答案** ：[TCP 三次握手和四次挥手（传输层）](./tcp-connection-and-disconnection.md) 。

### TCP 如何保证传输的可靠性？（重要）

[TCP 传输可靠性保障（传输层）](./tcp-reliability-guarantee.md)

## HTTP

### 从输入URL 到页面展示到底发生了什么？（非常重要）

> 类似的问题：打开一个网页，整个过程会使用哪些协议？

图解（图片来源：《图解 HTTP》）：

<img src="https://oss.javaguide.cn/github/javaguide/url%E8%BE%93%E5%85%A5%E5%88%B0%E5%B1%95%E7%A4%BA%E5%87%BA%E6%9D%A5%E7%9A%84%E8%BF%87%E7%A8%8B.jpg" style="zoom:50%; " />

> 上图有一个错误，请注意，是 OSPF 不是 OPSF。 OSPF（Open Shortest Path First，ospf）开放最短路径优先协议, 是由 Internet 工程任务组开发的路由选择协议

总体来说分为以下几个过程:

1. DNS 解析
2. TCP 连接
3. 发送 HTTP 请求
4. 服务器处理请求并返回 HTTP 报文
5. 浏览器解析渲染页面
6. 连接结束

具体可以参考下面这两篇文章：

- [从输入URL到页面加载发生了什么？](https://segmentfault.com/a/1190000006879700)
- [浏览器从输入网址到页面展示的过程](https://cloud.tencent.com/developer/article/1879758)

### HTTP 状态码有哪些？

HTTP 状态码用于描述 HTTP 请求的结果，比如2xx 就代表请求被成功处理。

![常见 HTTP 状态码](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-status-code.png)

关于 HTTP 状态码更详细的总结，可以看我写的这篇文章：[HTTP 常见状态码总结（应用层）](./http-status-codes.md)。

### HTTP Header 中常见的字段有哪些？

| 请求头字段名        | 说明                                                         | 示例                                                         |
| :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Accept              | 能够接受的回应内容类型（Content-Types）。                    | Accept: text/plain                                           |
| Accept-Charset      | 能够接受的字符集                                             | Accept-Charset: utf-8                                        |
| Accept-Datetime     | 能够接受的按照时间来表示的版本                               | Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT               |
| Accept-Encoding     | 能够接受的编码方式列表。参考HTTP压缩。                       | Accept-Encoding: gzip, deflate                               |
| Accept-Language     | 能够接受的回应内容的自然语言列表。                           | Accept-Language: en-US                                       |
| Authorization       | 用于超文本传输协议的认证的认证信息                           | Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==            |
| Cache-Control       | 用来指定在这次的请求/响应链中的所有缓存机制 都必须 遵守的指令 | Cache-Control: no-cache                                      |
| Connection          | 该浏览器想要优先使用的连接类型                               | Connection: keep-alive Connection: Upgrade                   |
| Content-Length      | 以 八位字节数组 （8位的字节）表示的请求体的长度              | Content-Length: 348                                          |
| Content-MD5         | 请求体的内容的二进制 MD5 散列值，以 Base64 编码的结果        | Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==                        |
| Content-Type        | 请求体的 多媒体类型 （用于POST和PUT请求中）                  | Content-Type: application/x-www-form-urlencoded              |
| Cookie              | 之前由服务器通过 Set- Cookie （下文详述）发送的一个 超文本传输协议Cookie | Cookie: $Version=1; Skin=new;                                |
| Date                | 发送该消息的日期和时间(按照 RFC 7231 中定义的"超文本传输协议日期"格式来发送) | Date: Tue, 15 Nov 1994 08:12:31 GMT                          |
| Expect              | 表明客户端要求服务器做出特定的行为                           | Expect: 100-continue                                         |
| From                | 发起此请求的用户的邮件地址                                   | From: [user@example.com](mailto:user@example.com)            |
| Host                | 服务器的域名(用于虚拟主机 )，以及服务器所监听的传输控制协议端口号。如果所请求的端口是对应的服务的标准端口，则端口号可被省略。 | Host: en.wikipedia.org:80                                    |
| If-Match            | 仅当客户端提供的实体与服务器上对应的实体相匹配时，才进行对应的操作。主要作用时，用作像 PUT 这样的方法中，仅当从用户上次更新某个资源以来，该资源未被修改的情况下，才更新该资源。 | If-Match: “737060cd8c284d8af7ad3082f209582d”                 |
| If-Modified-Since   | 允许在对应的内容未被修改的情况下返回304未修改（ 304 Not Modified ） | If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT             |
| If-None-Match       | 允许在对应的内容未被修改的情况下返回304未修改（ 304 Not Modified ） | If-None-Match: “737060cd8c284d8af7ad3082f209582d”            |
| If-Range            | 如果该实体未被修改过，则向我发送我所缺少的那一个或多个部分；否则，发送整个新的实体 | If-Range: “737060cd8c284d8af7ad3082f209582d”                 |
| If-Unmodified-Since | 仅当该实体自某个特定时间已来未被修改的情况下，才发送回应。   | If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT           |
| Max-Forwards        | 限制该消息可被代理及网关转发的次数。                         | Max-Forwards: 10                                             |
| Origin              | 发起一个针对 跨来源资源共享 的请求。                         | Origin: [http://www.example-social-network.com](http://www.example-social-network.com/) |
| Pragma              | 与具体的实现相关，这些字段可能在请求/回应链中的任何时候产生多种效果。 | Pragma: no-cache                                             |
| Proxy-Authorization | 用来向代理进行认证的认证信息。                               | Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==      |
| Range               | 仅请求某个实体的一部分。字节偏移以0开始。参见字节服务。      | Range: bytes=500-999                                         |
| Referer             | 表示浏览器所访问的前一个页面，正是那个页面上的某个链接将浏览器带到了当前所请求的这个页面。 | Referer: [http://en.wikipedia.org/wiki/Main_Page](https://en.wikipedia.org/wiki/Main_Page) |
| TE                  | 浏览器预期接受的传输编码方式：可使用回应协议头 Transfer-Encoding 字段中的值； | TE: trailers, deflate                                        |
| Upgrade             | 要求服务器升级到另一个协议。                                 | Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11               |
| User-Agent          | 浏览器的浏览器身份标识字符串                                 | User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0 |
| Via                 | 向服务器告知，这个请求是由哪些代理发出的。                   | Via: 1.0 fred, 1.1 example.com (Apache/1.1)                  |
| Warning             | 一个一般性的警告，告知，在实体内容体中可能存在错误。         | Warning: 199 Miscellaneous warning                           |

### HTTP 和 HTTPS 有什么区别？（重要）

![HTTP 和 HTTPS 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-vs-https.png)

- **端口号** ：HTTP 默认是 80，HTTPS 默认是 443。
- **URL 前缀** ：HTTP 的 URL 前缀是 `http://`，HTTPS 的 URL 前缀是 `https://`。
- **安全性和资源消耗** ： HTTP 协议运行在 TCP 之上，所有传输的内容都是明文，客户端和服务器端都无法验证对方的身份。HTTPS 是运行在 SSL/TLS 之上的 HTTP 协议，SSL/TLS 运行在 TCP 之上。所有传输的内容都经过加密，加密采用对称加密，但对称加密的密钥用服务器方的证书进行了非对称加密。所以说，HTTP 安全性没有 HTTPS 高，但是 HTTPS 比 HTTP 耗费更多服务器资源。
- **SEO（搜索引擎优化）** ：搜索引擎通常会更青睐使用HTTPS协议的网站，因为HTTPS能够提供更高的安全性和用户隐私保护。使用HTTPS协议的网站在搜索结果中可能会被优先显示，从而对SEO产生影响。

关于 HTTP 和 HTTPS 更详细的对比总结，可以看我写的这篇文章：[HTTP vs HTTPS（应用层）](./http&https.md) 。

### HTTP 1.0 和 HTTP 1.1 有什么区别？

![HTTP 1.0 和 HTTP 1.1 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.0-vs-http1.1.png)

- **连接方式** : HTTP 1.0 为短连接，HTTP 1.1 支持长连接。
- **状态响应码** : HTTP/1.1中新加入了大量的状态码，光是错误响应状态码就新增了24种。比如说，`100 (Continue)`——在请求大资源前的预热请求，`206 (Partial Content)`——范围请求的标识码，`409 (Conflict)`——请求与当前资源的规定冲突，`410 (Gone)`——资源已被永久转移，而且没有任何已知的转发地址。
- **缓存机制** : 在 HTTP1.0 中主要使用 Header 里的 If-Modified-Since,Expires 来做为缓存判断的标准，HTTP1.1 则引入了更多的缓存控制策略例如 Entity tag，If-Unmodified-Since, If-Match, If-None-Match 等更多可供选择的缓存头来控制缓存策略。
- **带宽** ：HTTP1.0 中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能，HTTP1.1 则在请求头引入了 range 头域，它允许只请求资源的某个部分，即返回码是 206（Partial Content），这样就方便了开发者自由的选择以便于充分利用带宽和连接。
- **Host 头（Host Header）处理** :HTTP 1.1 引入了 Host 头字段，允许在同一 IP 地址上托管多个域名，从而支持虚拟主机的功能。而 HTTP 1.0 没有 Host 头字段，无法实现虚拟主机。

关于 HTTP 1.0 和 HTTP 1.1 更详细的对比总结，可以看我写的这篇文章：[HTTP 1.0 vs HTTP 1.1（应用层）](./http1.0&http1.1.md) 。

### HTTP 1.1 和 HTTP 2.0 有什么区别？

![HTTP 1.1 和 HTTP 2.0 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.1-vs-http2.0.png)

- **IO多路复用（Multiplexing）** ：HTTP2.0 在同一连接上可以同时传输多个请求和响应（可以看作是 HTTP 1.1 中长链接的升级版本）。HTTP1.1 则使用串行方式，每个请求和响应都需要独立的连接。这使得 HTTP2 在处理多个请求时更加高效，减少了网络延迟和提高了性能。
- **二进制帧（Binary Frames）** ：HTTP2 使用二进制帧进行数据传输，而 HTTP1.1 则使用文本格式的报文。二进制帧更加紧凑和高效，减少了传输的数据量和带宽消耗。
- **头部压缩（Header Compression）** ：HTTP 1.1支持`Body`压缩，`Header`不支持压缩。HTTP2.0 支持对`Header`压缩，减少了网络开销。
- **服务器推送（Server Push）**：HTTP 2.0  支持服务器推送，可以在客户端请求一个资源时，将其他相关资源一并推送给客户端，从而减少了客户端的请求次数和延迟。而 HTTP1.1 需要客户端自己发送请求来获取相关资源。

### HTTP 2.0 和 HTTP 3.0 有什么区别？

![HTTP 2.0 和 HTTP 3.0 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2.0-vs-http3.0.png)

- **传输协议** ：HTTP 2.0 是基于 TCP 协议实现的，HTTP 3.0是基于 UDP协议实现的。
- **传输方式** ：HTTP3.0 新增了 QUIC（Quick UDP Internet Connections） 协议来实现可靠的传输，提供与TLS/SSL相当的安全性，具有较低的连接和传输延迟。
- **错误恢复** ：HTTP3 具有更好的错误恢复机制，当出现丢包、延迟等网络问题时，可以更快地进行恢复和重传。而 HTTP2 则需要依赖于 TCP 的错误恢复机制。
- **握手过程** ：HTTP3 的握手过程相较于 HTTP2 更加简洁，减少了握手次数和握手延迟，从而提高了连接建立速度和性能。

### HTTP 是不保存状态的协议, 如何保存用户状态?

HTTP 是一种不保存状态，即无状态（stateless）协议。也就是说 HTTP 协议自身不对请求和响应之间的通信状态进行保存。那么我们保存用户状态呢？Session 机制的存在就是为了解决这个问题，Session 的主要作用就是通过服务端记录用户的状态。典型的场景是购物车，当你要添加商品到购物车的时候，系统不知道是哪个用户操作的，因为 HTTP 协议是无状态的。服务端给特定的用户创建特定的 Session 之后就可以标识这个用户并且跟踪这个用户了（一般情况下，服务器会在一定时间内保存这个 Session，过了时间限制，就会销毁这个 Session）。

在服务端保存 Session 的方法很多，最常用的就是内存和数据库(比如是使用内存数据库 redis 保存)。既然 Session 存放在服务器端，那么我们如何实现 Session 跟踪呢？大部分情况下，我们都是通过在 Cookie 中附加一个 Session ID 来方式来跟踪。

**Cookie 被禁用怎么办?**

最常用的就是利用 URL 重写把 Session ID 直接附加在 URL 路径的后面。

### URI 和 URL 的区别是什么?

* URI(Uniform Resource Identifier) 是统一资源标志符，可以唯一标识一个资源。
* URL(Uniform Resource Locator) 是统一资源定位符，可以提供该资源的路径。它是一种具体的 URI，即 URL 可以用来标识一个资源，而且还指明了如何 locate 这个资源。

URI 的作用像身份证号一样，URL 的作用更像家庭住址一样。URL 是一种具体的 URI，它不仅唯一标识资源，而且还提供了定位该资源的信息。

### Cookie 和 Session 有什么区别？

准确点来说，这个问题属于认证授权的范畴，你可以在 [认证授权基础概念详解](https://javaguide.cn/system-design/security/basis-of-authority-certification.html) 这篇文章中找到详细的答案。

## PING

### PING命令的作用是什么？

PING命令是一种常用的网络诊断工具，经常用来测试网络中主机之间的连通性和网络延迟。

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

1. **ICMP Echo Request（请求报文）信息** ：序列号、TTL（Time to Live）值。
2. **目标主机的域名或IP地址** ：输出结果的第一行。
3. **往返时间（RTT，Round-Trip Time）** ：从发送 ICMP Echo Request（请求报文）到接收到ICMP Echo Reply（响应报文）的总时间，用来衡量网络连接的延迟。
4. **统计结果（Statistics）** ：包括发送的ICMP请求数据包数量、接收到的ICMP响应数据包数量、丢包率、往返时间（RTT）的最小、平均、最大和标准偏差值。

如果PING对应的目标主机无法得到正确的响应，则表明这两个主机之间的连通性存在问题。如果往返时间（RTT）过高，则表明网络延迟过高。

### PING命令的工作原理是什么？

PING 基于 **ICMP（Internet Control Message Protocol，互联网控制报文协议）**，其主要原理就是通过在网络上发送和接收 ICMP 报文实现的。

ICMP 报文中包含了类型字段，用于标识 ICMP 报文类型。ICMP 报文的类型有很多种，但大致可以分为两类：

- **查询报文类型** ：向目标主机发送请求并期望得到响应。
- **差错报文类型** ：向源主机发送错误信息，用于报告网络中的错误情况。

PING 用到的ICMP Echo Request（类型为 8 ） 和 ICMP Echo Reply（类型为 0） 属于查询报文类型 。

- PING命令会向目标主机发送ICMP Echo Request。
- 如果两个主机的连通性正常，目标主机会返回一个对应的ICMP Echo Reply。

## DNS

### DNS 的作用是什么？

DNS（Domain Name System）域名管理系统，是当用户使用浏览器访问网址之后，使用的第一个重要协议。DNS 要解决的是**域名和 IP 地址的映射问题**。

![DNS:域名系统](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

在实际使用中，有一种情况下，浏览器是可以不必动用 DNS 就可以获知域名和 IP 地址的映射的。浏览器在本地会维护一个`hosts`列表，一般来说浏览器要先查看要访问的域名是否在`hosts`列表中，如果有的话，直接提取对应的 IP 地址记录，就好了。如果本地`hosts`列表内没有域名-IP 对应记录的话，那么 DNS 就闪亮登场了。

目前 DNS 的设计采用的是分布式、层次数据库结构，**DNS 是应用层协议，基于 UDP 协议之上，端口为 53** 。

### DNS 服务器有哪些？

DNS 服务器自底向上可以依次分为以下几个层级(所有 DNS 服务器都属于以下四个类别之一):

- 根 DNS 服务器。根 DNS 服务器提供 TLD 服务器的 IP 地址。目前世界上只有 13 组根服务器，我国境内目前仍没有根服务器。
- 顶级域 DNS 服务器（TLD 服务器）。顶级域是指域名的后缀，如`com`、`org`、`net`和`edu`等。国家也有自己的顶级域，如`uk`、`fr`和`ca`。TLD 服务器提供了权威 DNS 服务器的 IP 地址。
- 权威 DNS 服务器。在因特网上具有公共可访问主机的每个组织机构必须提供公共可访问的 DNS 记录，这些记录将这些主机的名字映射为 IP 地址。
- 本地 DNS 服务器。每个 ISP（互联网服务提供商）都有一个自己的本地 DNS 服务器。当主机发出 DNS 请求时，该请求被发往本地 DNS 服务器，它起着代理的作用，并将该请求转发到 DNS 层次结构中。严格说来，不属于 DNS 层级结构

### DNS 解析的过程是什么样的？

整个过程的步骤比较多，我单独写了一篇文章详细介绍：[DNS 域名系统详解（应用层）](./dns.md) 。

## ARP

### 什么是 Mac 地址？

MAC 地址的全称是 **媒体访问控制地址（Media Access Control Address）**。如果说，互联网中每一个资源都由 IP 地址唯一标识（IP 协议内容），那么一切网络设备都由 MAC 地址唯一标识。

![路由器的背面就会注明 MAC 位址](./images/arp/2008410143049281.png)

可以理解为，MAC 地址是一个网络设备真正的身份证号，IP 地址只是一种不重复的定位方式（比如说住在某省某市某街道的张三，这种逻辑定位是 IP 地址，他的身份证号才是他的 MAC 地址），也可以理解为 MAC 地址是身份证号，IP 地址是邮政地址。MAC 地址也有一些别称，如 LAN 地址、物理地址、以太网地址等。

> 还有一点要知道的是，不仅仅是网络资源才有 IP 地址，网络设备也有 IP 地址，比如路由器。但从结构上说，路由器等网络设备的作用是组成一个网络，而且通常是内网，所以它们使用的 IP 地址通常是内网 IP，内网的设备在与内网以外的设备进行通信时，需要用到 NAT 协议。

MAC 地址的长度为 6 字节（48 比特），地址空间大小有 280 万亿之多（$2^{48}$），MAC 地址由 IEEE 统一管理与分配，理论上，一个网络设备中的网卡上的 MAC 地址是永久的。不同的网卡生产商从 IEEE 那里购买自己的 MAC 地址空间（MAC 的前 24 比特），也就是前 24 比特由 IEEE 统一管理，保证不会重复。而后 24 比特，由各家生产商自己管理，同样保证生产的两块网卡的 MAC 地址不会重复。

MAC 地址具有可携带性、永久性，身份证号永久地标识一个人的身份，不论他到哪里都不会改变。而 IP 地址不具有这些性质，当一台设备更换了网络，它的 IP 地址也就可能发生改变，也就是它在互联网中的定位发生了变化。

最后，记住，MAC 地址有一个特殊地址：FF-FF-FF-FF-FF-FF（全 1 地址），该地址表示广播地址。

### ARP 协议解决了什么问题地位如何？

ARP 协议，全称 **地址解析协议（Address Resolution Protocol）**，它解决的是网络层地址和链路层地址之间的转换问题。因为一个 IP 数据报在物理上传输的过程中，总是需要知道下一跳（物理上的下一个目的地）该去往何处，但 IP 地址属于逻辑地址，而 MAC 地址才是物理地址，ARP 协议解决了 IP 地址转 MAC 地址的一些问题。

### ARP 协议的工作原理？

[ARP 协议详解(网络层)](./arp.md)

## 复习建议

非常推荐大家看一下 《图解 HTTP》 这本书，这本书页数不多，但是内容很是充实，不管是用来系统的掌握网络方面的一些知识还是说纯粹为了应付面试都有很大帮助。下面的一些文章只是参考。大二学习这门课程的时候，我们使用的教材是 《计算机网络第七版》（谢希仁编著），不推荐大家看这本教材，书非常厚而且知识偏理论，不确定大家能不能心平气和的读完。

## 参考

- 《图解 HTTP》
- 《计算机网络自顶向下方法》（第七版）
- 详解 HTTP2.0 及 HTTPS 协议：https://juejin.cn/post/7034668672262242318
- HTTP 请求头字段大全| HTTP Request Headers：https://www.flysnow.org/tools/table/http-request-headers/
