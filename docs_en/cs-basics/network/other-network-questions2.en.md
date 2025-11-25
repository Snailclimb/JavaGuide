---
title: 计算机网络常见面试题总结(下)
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: 计算机网络面试题,TCP vs UDP,TCP三次握手,HTTP/3 QUIC,IPv4 vs IPv6,TCP可靠性,IP地址,NAT协议,ARP协议,传输层面试,网络层高频题,基于TCP协议,基于UDP协议,队头阻塞,四次挥手
  - - meta
    - name: description
      content: 最新计算机网络高频面试题总结（下）：TCP/UDP深度对比、三次握手四次挥手、HTTP/3 QUIC优化、IPv6优势、NAT/ARP详解，附表格+⭐️重点标注，一文掌握传输层&网络层核心考点，快速通关后端技术面试！
---

下篇主要是传输层和网络层相关的内容。

## TCP 与 UDP

### ⭐️TCP 与 UDP 的区别（重要）

1. **是否面向连接**：
   - TCP 是面向连接的。在传输数据之前，必须先通过“三次握手”建立连接；数据传输完成后，还需要通过“四次挥手”来释放连接。这保证了双方都准备好通信。
   - UDP 是无连接的。发送数据前不需要建立任何连接，直接把数据包（数据报）扔出去。
2. **是否是可靠传输**：
   - TCP 提供可靠的数据传输服务。它通过序列号、确认应答 (ACK)、超时重传、流量控制、拥塞控制等一系列机制，来确保数据能够无差错、不丢失、不重复且按顺序地到达目的地。
   - UDP 提供不可靠的传输。它尽最大努力交付 (best-effort delivery)，但不保证数据一定能到达，也不保证到达的顺序，更不会自动重传。收到报文后，接收方也不会主动发确认。
3. **是否有状态**：
   - TCP 是有状态的。因为要保证可靠性，TCP 需要在连接的两端维护连接状态信息，比如序列号、窗口大小、哪些数据发出去了、哪些收到了确认等。
   - UDP 是无状态的。它不维护连接状态，发送方发出数据后就不再关心它是否到达以及如何到达，因此开销更小（**这很“渣男”！**）。
4. **传输效率**：
   - TCP 因为需要建立连接、发送确认、处理重传等，其开销较大，传输效率相对较低。
   - UDP 结构简单，没有复杂的控制机制，开销小，传输效率更高，速度更快。
5. **传输形式**：
   - TCP 是面向字节流 (Byte Stream) 的。它将应用程序交付的数据视为一连串无结构的字节流，可能会对数据进行拆分或合并。
   - UDP 是面向报文 (Message Oriented) 的。应用程序交给 UDP 多大的数据块，UDP 就照样发送，既不拆分也不合并，保留了应用程序消息的边界。
6. **首部开销**：
   - TCP 的头部至少需要 20 字节，如果包含选项字段，最多可达 60 字节。
   - UDP 的头部非常简单，固定只有 8 字节。
7. **是否提供广播或多播服务**：
   - TCP 只支持点对点 (Point-to-Point) 的单播通信。
   - UDP 支持一对一 (单播)、一对多 (多播/Multicast) 和一对所有 (广播/Broadcast) 的通信方式。
8. ……

为了更直观地对比，可以看下面这个表格：

| 特性         | TCP                        | UDP                                 |
| ------------ | -------------------------- | ----------------------------------- |
| **连接性**   | 面向连接                   | 无连接                              |
| **可靠性**   | 可靠                       | 不可靠 (尽力而为)                   |
| **状态维护** | 有状态                     | 无状态                              |
| **传输效率** | 较低                       | 较高                                |
| **传输形式** | 面向字节流                 | 面向数据报 (报文)                   |
| **头部开销** | 20 - 60 字节               | 8 字节                              |
| **通信模式** | 点对点 (单播)              | 单播、多播、广播                    |
| **常见应用** | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, SNMP, TFTP, VoIP, 视频流 |

### ⭐️什么时候选择 TCP，什么时候选 UDP?

选择 TCP 还是 UDP，主要取决于你的应用**对数据传输的可靠性要求有多高，以及对实时性和效率的要求有多高**。

当**数据准确性和完整性至关重要，一点都不能出错**时，通常选择 TCP。因为 TCP 提供了一整套机制（三次握手、确认应答、重传、流量控制等）来保证数据能够可靠、有序地送达。典型应用场景如下：

- **Web 浏览 (HTTP/HTTPS):** 网页内容、图片、脚本必须完整加载才能正确显示。
- **文件传输 (FTP, SCP):** 文件内容不允许有任何字节丢失或错序。
- **邮件收发 (SMTP, POP3, IMAP):** 邮件内容需要完整无误地送达。
- **远程登录 (SSH, Telnet):** 命令和响应需要准确传输。
- ……

当**实时性、速度和效率优先，并且应用能容忍少量数据丢失或乱序**时，通常选择 UDP。UDP 开销小、传输快，没有建立连接和保证可靠性的复杂过程。典型应用场景如下：

- **实时音视频通信 (VoIP, 视频会议, 直播):** 偶尔丢失一两个数据包（可能导致画面或声音短暂卡顿）通常比因为等待重传（TCP 机制）导致长时间延迟更可接受。应用层可能会有自己的补偿机制。
- **在线游戏:** 需要快速传输玩家位置、状态等信息，对实时性要求极高，旧的数据很快就没用了，丢失少量数据影响通常不大。
- **DHCP (动态主机配置协议):** 客户端在请求 IP 时自身没有 IP 地址，无法满足 TCP 建立连接的前提条件，并且 DHCP 有广播需求、交互模式简单以及自带可靠性机制。
- **物联网 (IoT) 数据上报:** 某些场景下，传感器定期上报数据，丢失个别数据点可能不影响整体趋势分析。
- ……

### HTTP 基于 TCP 还是 UDP？

~~**HTTP 协议是基于 TCP 协议的**，所以发送 HTTP 请求之前首先要建立 TCP 连接也就是要经历 3 次握手。~~

🐛 修正（参见 [issue#1915](https://github.com/Snailclimb/JavaGuide/issues/1915)）：

HTTP/3.0 之前是基于 TCP 协议的，而 HTTP/3.0 将弃用 TCP，改用 **基于 UDP 的 QUIC 协议** ：

- **HTTP/1.x 和 HTTP/2.0**：这两个版本的 HTTP 协议都明确建立在 TCP 之上。TCP 提供了可靠的、面向连接的传输，确保数据按序、无差错地到达，这对于网页内容的正确展示非常重要。发送 HTTP 请求前，需要先通过 TCP 的三次握手建立连接。
- **HTTP/3.0**：这是一个重大的改变。HTTP/3 弃用了 TCP，转而使用 QUIC 协议，而 QUIC 是构建在 UDP 之上的。

![http-3-implementation](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-3-implementation.png)

**为什么 HTTP/3 要做这个改变呢？主要有两大原因：**

1. 解决队头阻塞 (Head-of-Line Blocking，简写：HOL blocking) 问题。
2. 减少连接建立的延迟。

下面我们来详细介绍这两大优化。

在 HTTP/2 中，虽然可以在一个 TCP 连接上并发传输多个请求/响应流（多路复用），但 TCP 本身的特性（保证有序、可靠）意味着如果其中一个流的某个 TCP 报文丢失或延迟，整个 TCP 连接都会被阻塞，等待该报文重传。这会导致所有在这个 TCP 连接上的 HTTP/2 流都受到影响，即使其他流的数据包已经到达。**QUIC (运行在 UDP 上) 解决了这个问题**。QUIC 内部实现了自己的多路复用和流控制机制。不同的 HTTP 请求/响应流在 QUIC 层面是真正独立的。如果一个流的数据包丢失，它只会阻塞该流，而不会影响同一 QUIC 连接上的其他流（本质上是多路复用+轮询），大大提高了并发传输的效率。

In addition to solving the head-of-line blocking problem, HTTP/3.0 can also reduce the delay in the handshake process. In HTTP/2.0, if you want to establish a secure HTTPS connection, you need to go through the TCP three-way handshake and TLS handshake:

1. TCP three-way handshake: The client and server exchange SYN and ACK packets to establish a TCP connection. This process requires 1.5 RTT (round-trip time), which is the time from sending to receiving a data packet.
2. TLS handshake: The client and server exchange keys and certificates, establishing a TLS encryption layer. This process requires at least 1 RTT (TLS 1.3) or 2 RTT (TLS 1.2).

Therefore, HTTP/2.0 connection establishment requires at least 2.5 RTT (TLS 1.3) or 3.5 RTT (TLS 1.2). In HTTP/3.0, the QUIC protocol used (TLS 1.3, TLS 1.3 not only supports 1 RTT handshake, but also supports 0 RTT handshake) connection establishment requires only 0-RTT or 1-RTT. This means that QUIC, in the best case scenario, does not require any additional round trip time to establish a new connection.

For relevant proofs, please refer to the following two links:

- <https://en.wikipedia.org/en/HTTP/3>
- <https://datatracker.ietf.org/doc/rfc9114/>

### What TCP/UDP based protocols do you know?

TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are the two core protocols of the Internet transport layer. They provide basic communication services for various application layer protocols. Here are some common application layer protocols built on top of TCP and UDP:

**Protocol running on top of TCP protocol (emphasis on reliable, orderly transmission):**

| Full Chinese name (abbreviation) | Full English name | Main uses | Description and characteristics |
| -------------------------- | ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Hypertext Transfer Protocol (HTTP) | HyperText Transfer Protocol | Transfers web pages, hypertext, multimedia content | **HTTP/1.x and HTTP/2 are based on TCP**. Early versions were unencrypted and were the basis for web communications.                                                        |
| HyperText Transfer Protocol Secure (HTTPS) | HyperText Transfer Protocol Secure | Encrypted web page transfer | Adds an SSL/TLS encryption layer between HTTP and TCP to ensure confidentiality and integrity of data transmission.                                                    |
| File Transfer Protocol (FTP) | File Transfer Protocol | File transfer | Traditional FTP **clear text transfer**, unsafe. It is recommended to use its secure version **SFTP (SSH File Transfer Protocol)** or **FTPS (FTP over SSL/TLS)**. |
| Simple Mail Transfer Protocol (SMTP) | Simple Mail Transfer Protocol | **Send** email | Responsible for sending emails from the client to the server, or between mail servers. Can be upgraded to encrypted transmission via **STARTTLS**.                                |
| Post Office Protocol version 3 (POP3) | **Receive** email | Typically delete the server copy** after downloading the message from the server** to the local device** (configurable retention). **POP3S** is its SSL/TLS encrypted version.                        |
| Internet Message Access Protocol (IMAP) | Internet Message Access Protocol | **Receive and manage** emails | Emails are retained on the server and support multi-device synchronization of email status, folder management, online search, etc. **IMAPS** is its SSL/TLS encrypted version. The modern email service of choice.       |
| Remote Terminal Protocol (Telnet) | Teletype Network | Remote Terminal Login | **Clear text transmission** All data (including passwords), security is extremely poor, and has basically been completely replaced by SSH.                                                        |
| Secure Shell Protocol (SSH) | Secure Shell | Secure remote management, encrypted data transmission | Provides functions such as encrypted remote login and command execution, as well as secure file transfer (SFTP), and is a secure alternative to Telnet.                                  |

**Protocol running on top of UDP protocol (emphasis on fast, low-overhead transmission):**

| Full Chinese name (abbreviation) | Full English name | Main uses | Description and characteristics |
| ----------------------- | -------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hypertext Transfer Protocol (HTTP/3) | HyperText Transfer Protocol version 3 | A new generation of web page transmission | Based on the **QUIC** protocol (QUIC itself is built on UDP), designed to reduce latency, solve the TCP head-of-queue blocking problem, and support 0-RTT connection establishment.    |
| Dynamic Host Configuration Protocol (DHCP) | Dynamic Host Configuration Protocol | Dynamic allocation of IP addresses and network configuration | The client automatically obtains IP address, subnet mask, gateway, DNS server and other information from the server.                                           |
| Domain Name System (DNS) | Domain Name System | Domain name to IP address resolution | **Usually UDP** is used for fast queries. When the response packet is too large or does a zone transfer (AXFR), **switches to TCP** to ensure data integrity. |
| Real-time Transport Protocol (RTP) | Real-time Transport Protocol | Real-time audio and video data stream transmission | Commonly used in VoIP, video conferencing, live broadcast, etc. Pursue low latency and allow for a small amount of packet loss. Typically used with RTCP.                              |
| RTP Control Protocol (RTCP) | RTP Control Protocol | Quality monitoring and control information of RTP streams | Works with RTP to provide statistical information such as packet loss, delay, jitter, etc. to assist flow control and congestion management.                                      |
| Trivial File Transfer Protocol (TFTP) | Trivial File Transfer Protocol | Simplified file transfer | Simple function, often used in small file transfer scenarios such as diskless workstation startup in LAN, network device firmware upgrade, etc.                                   || 简单网络管理协议 (SNMP) | Simple Network Management Protocol    | 网络设备的监控与管理       | 允许网络管理员查询和修改网络设备的状态信息。                                                                 |
| 网络时间协议 (NTP)      | Network Time Protocol                 | 同步计算机时钟             | 用于在网络中的计算机之间同步时间，确保时间的一致性。                                                         |

**总结一下：**

- **TCP** 更适合那些对数据**可靠性、完整性和顺序性**要求高的应用，如网页浏览 (HTTP/HTTPS)、文件传输 (FTP/SFTP)、邮件收发 (SMTP/POP3/IMAP)。
- **UDP** 则更适用于那些对**实时性要求高、能容忍少量数据丢失**的应用，如域名解析 (DNS)、实时音视频 (RTP)、在线游戏、网络管理 (SNMP) 等。

### ⭐️TCP 三次握手和四次挥手（非常重要）

**相关面试题**：

- 为什么要三次握手?
- 第 2 次握手传回了 ACK，为什么还要传回 SYN？
- 为什么要四次挥手？
- 为什么不能把服务器发送的 ACK 和 FIN 合并起来，变成三次挥手？
- 如果第二次挥手时服务器的 ACK 没有送达客户端，会怎样？
- 为什么第四次挥手客户端需要等待 2\*MSL（报文段最长寿命）时间后才进入 CLOSED 状态？

**参考答案**：[TCP 三次握手和四次挥手（传输层）](https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html) 。

### ⭐️TCP 如何保证传输的可靠性？（重要）

[TCP 传输可靠性保障（传输层）](https://javaguide.cn/cs-basics/network/tcp-reliability-guarantee.html)

## IP

### IP 协议的作用是什么？

**IP（Internet Protocol，网际协议）** 是 TCP/IP 协议中最重要的协议之一，属于网络层的协议，主要作用是定义数据包的格式、对数据包进行路由和寻址，以便它们可以跨网络传播并到达正确的目的地。

目前 IP 协议主要分为两种，一种是过去的 IPv4，另一种是较新的 IPv6，目前这两种协议都在使用，但后者已经被提议来取代前者。

### 什么是 IP 地址？IP 寻址如何工作？

每个连入互联网的设备或域（如计算机、服务器、路由器等）都被分配一个 **IP 地址（Internet Protocol address）**，作为唯一标识符。每个 IP 地址都是一个字符序列，如 192.168.1.1（IPv4）、2001:0db8:85a3:0000:0000:8a2e:0370:7334（IPv6） 。

当网络设备发送 IP 数据包时，数据包中包含了 **源 IP 地址** 和 **目的 IP 地址** 。源 IP 地址用于标识数据包的发送方设备或域，而目的 IP 地址则用于标识数据包的接收方设备或域。这类似于一封邮件中同时包含了目的地地址和回邮地址。

网络设备根据目的 IP 地址来判断数据包的目的地，并将数据包转发到正确的目的地网络或子网络，从而实现了设备间的通信。

这种基于 IP 地址的寻址方式是互联网通信的基础，它允许数据包在不同的网络之间传递，从而实现了全球范围内的网络互联互通。IP 地址的唯一性和全局性保证了网络中的每个设备都可以通过其独特的 IP 地址进行标识和寻址。

![IP 地址使数据包到达其目的地](https://oss.javaguide.cn/github/javaguide/cs-basics/network/internet_protocol_ip_address_diagram.png)

### 什么是 IP 地址过滤？

**IP 地址过滤（IP Address Filtering）** 简单来说就是限制或阻止特定 IP 地址或 IP 地址范围的访问。例如，你有一个图片服务突然被某一个 IP 地址攻击，那我们就可以禁止这个 IP 地址访问图片服务。

IP 地址过滤是一种简单的网络安全措施，实际应用中一般会结合其他网络安全措施，如认证、授权、加密等一起使用。单独使用 IP 地址过滤并不能完全保证网络的安全。

### ⭐️IPv4 和 IPv6 有什么区别？

**IPv4（Internet Protocol version 4）** 是目前广泛使用的 IP 地址版本，其格式是四组由点分隔的数字，例如：123.89.46.72。IPv4 使用 32 位地址作为其 Internet 地址，这意味着共有约 42 亿（ 2^32）个可用 IP 地址。

![IPv4](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Figure-1-IPv4Addressformatwithdotteddecimalnotation-29c824f6a451d48d8c27759799f0c995.png)

这么少当然不够用啦！为了解决 IP 地址耗尽的问题，最根本的办法是采用具有更大地址空间的新版本 IP 协议 - **IPv6（Internet Protocol version 6）**。IPv6 地址使用更复杂的格式，该格式使用由单或双冒号分隔的一组数字和字母，例如：2001:0db8:85a3:0000:0000:8a2e:0370:7334 。IPv6 使用 128 位互联网地址，这意味着越有 2^128（3 开头的 39 位数字，恐怖如斯） 个可用 IP 地址。

![IPv6](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Figure-2-IPv6Addressformatwithhexadecimalnotation-7da3a419bd81627a9b2cef3b0efb4940.png)

除了更大的地址空间之外，IPv6 的优势还包括：

- **无状态地址自动配置（Stateless Address Autoconfiguration，简称 SLAAC）**：主机可以直接通过根据接口标识和网络前缀生成全局唯一的 IPv6 地址，而无需依赖 DHCP（Dynamic Host Configuration Protocol）服务器，简化了网络配置和管理。
- **NAT（Network Address Translation，网络地址转换） 成为可选项**：IPv6 地址资源充足，可以给全球每个设备一个独立的地址。
- **对标头结构进行了改进**：IPv6 标头结构相较于 IPv4 更加简化和高效，减少了处理开销，提高了网络性能。
- **可选的扩展头**：允许在 IPv6 标头中添加不同的扩展头（Extension Headers），用于实现不同类型的功能和选项。
- **ICMPv6（Internet Control Message Protocol for IPv6）**：IPv6 中的 ICMPv6 相较于 IPv4 中的 ICMP 有了一些改进，如邻居发现、路径 MTU 发现等功能的改进，从而提升了网络的可靠性和性能。
- ……

### 如何获取客户端真实 IP？

获取客户端真实 IP 的方法有多种，主要分为应用层方法、传输层方法和网络层方法。

**应用层方法** ：

通过 [X-Forwarded-For](https://en.wikipedia.org/wiki/X-Forwarded-For) 请求头获取，简单方便。不过，这种方法无法保证获取到的是真实 IP，这是因为 X-Forwarded-For 字段可能会被伪造。如果经过多个代理服务器，X-Forwarded-For 字段可能会有多个值（附带了整个请求链中的所有代理服务器 IP 地址）。并且，这种方法只适用于 HTTP 和 SMTP 协议。

**传输层方法**：

利用 TCP Options 字段承载真实源 IP 信息。这种方法适用于任何基于 TCP 的协议，不受应用层的限制。不过，这并非是 TCP 标准所支持的，所以需要通信双方都进行改造。也就是：对于发送方来说，需要有能力把真实源 IP 插入到 TCP Options 里面。对于接收方来说，需要有能力把 TCP Options 里面的 IP 地址读取出来。

也可以通过 Proxy Protocol 协议来传递客户端 IP 和 Port 信息。这种方法可以利用 Nginx 或者其他支持该协议的反向代理服务器来获取真实 IP 或者在业务服务器解析真实 IP。

**网络层方法**：

隧道 +DSR 模式。这种方法可以适用于任何协议，就是实施起来会比较麻烦，也存在一定限制，实际应用中一般不会使用这种方法。

### NAT 的作用是什么？

**NAT (Network Address Translation)** is mainly used to translate IP addresses between different networks. It allows mapping of private IP addresses (such as the IP addresses used on the LAN) to public IP addresses (IP addresses used on the Internet) or vice versa, allowing multiple devices within the LAN to access the Internet through a single public IP address.

NAT can not only alleviate the shortage of IPv4 address resources, but also hide the actual topology of the internal network, making it impossible for external networks to directly access devices in the internal network, thereby improving the security of the internal network.

![NAT implements IP address translation](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-address-translation.png)

Related reading: [Detailed explanation of NAT protocol (network layer)](https://javaguide.cn/cs-basics/network/nat.html).

## ARP

### What is a Mac address?

The full name of MAC address is **Media Access Control Address**. If every resource on the Internet is uniquely identified by an IP address (IP protocol content), then all network devices are uniquely identified by a MAC address.

![The MAC address will be indicated on the back of the router](https://oss.javaguide.cn/github/javaguide/cs-basics/network/router-back-will-indicate-mac-address.png)

It can be understood that the MAC address is the real ID number of a network device, and the IP address is just a non-duplicate positioning method (for example, for Zhang San who lives in a certain street in a certain city in a certain province, this logical positioning is the IP address, and his ID number is his MAC address). It can also be understood that the MAC address is the ID number and the IP address is the postal address. The MAC address also has some other names, such as LAN address, physical address, Ethernet address, etc.

> Another thing to know is that not only network resources have IP addresses, but network devices also have IP addresses, such as routers. But structurally speaking, the role of network devices such as routers is to form a network, and it is usually an intranet, so the IP addresses they use are usually intranet IPs. When intranet devices communicate with devices outside the intranet, they need to use the NAT protocol.

The length of the MAC address is 6 bytes (48 bits), and the address space size is as much as 280 trillion ($2^{48}$). The MAC address is managed and allocated by the IEEE. In theory, the MAC address on the network card in a network device is permanent. Different network card manufacturers purchase their own MAC address space (the first 24 bits of the MAC) from the IEEE, that is, the first 24 bits are managed uniformly by the IEEE to ensure no duplication. The next 24 bits are managed by each manufacturer themselves to ensure that the MAC addresses of the two network cards produced will not be repeated.

The MAC address is portable and permanent, and the ID number permanently identifies a person's identity and will not change no matter where he goes. IP addresses do not have these properties. When a device changes networks, its IP address may change, which means its positioning on the Internet changes.

Finally, remember that MAC addresses have a special address: FF-FF-FF-FF-FF-FF (all ones), which represents the broadcast address.

### ⭐️What problems does the ARP protocol solve?

ARP protocol, the full name is **Address Resolution Protocol**, which solves the problem of conversion between network layer addresses and link layer addresses. Because during the physical transmission of an IP datagram, you always need to know where the next hop (physical next destination) should go, but the IP address is a logical address, and the MAC address is the physical address. The ARP protocol solves some problems of converting IP addresses to MAC addresses.

### How does the ARP protocol work?

[Detailed explanation of ARP protocol (network layer)](https://javaguide.cn/cs-basics/network/arp.html)

## Review suggestions

I highly recommend everyone to read the book "HTTP Illustrated". This book does not have many pages, but the content is very substantial. It is very helpful whether it is used to systematically master some knowledge about the network or simply to cope with interviews. Some of the articles below are for reference only. When I was studying this course in my sophomore year, the textbook we used was "Computer Networks 7th Edition" (edited by Xie Xiren). I don't recommend everyone to read this textbook. The book is very thick and the knowledge is theoretical. I'm not sure if you can finish it calmly.

## Reference

- "HTTP Illustrated"
- "Top-Down Method of Computer Networks" (Seventh Edition)
- What is Internet Protocol (IP)? ：<https://www.cloudflare.com/zh-cn/learning/network-layer/internet-protocol/>
- Various methods to transparently transmit the real source IP - Geek Time: <https://time.geekbang.org/column/article/497864>
- What Is NAT and What Are the Benefits of NAT Firewalls?：<https://community.fs.com/blog/what-is-nat-and-what-are-the-benefits-of-nat-firewalls.html>

<!-- @include: @article-footer.snippet.md -->