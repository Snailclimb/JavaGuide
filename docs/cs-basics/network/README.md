---
title: 计算机网络专题：分层模型、HTTP、HTTPS、DNS、TCP、UDP、ARP 与 NAT
description: 计算机网络面试与学习路线，涵盖 OSI/TCP-IP 分层模型、HTTP、HTTPS、DNS、TCP、UDP、ARP、NAT、网络安全和常见面试题。
category: 计算机基础
tag:
  - 计算机网络
  - TCP/IP
  - HTTP
sidebar: false
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: 计算机网络,计算机网络面试题,OSI七层模型,TCP/IP,HTTP,HTTPS,DNS,TCP,UDP,ARP,NAT,后端面试
---

这份 **计算机网络专题** 面向后端学习和面试复习，按“分层模型 -> 应用层 -> 传输层 -> 网络层 -> 安全”的顺序整理本站网络相关文章。

## 适合谁看

- 正在系统学习计算机网络的后端开发者。
- 准备校招、社招、中大厂网络面试题的同学。
- 对 HTTP、HTTPS、TCP、DNS、Socket 等知识点只会零散背诵的读者。
- 想把网络知识和 RPC、网关、负载均衡、系统设计联系起来的工程师。

## 学习重点

- 网络分层的核心价值是拆分复杂通信问题，每一层只解决自己的职责。
- HTTP、HTTPS、DNS 是后端开发最常用的应用层知识。
- TCP 高频考点集中在连接管理、可靠传输、拥塞控制、TIME_WAIT 和 Keepalive。
- ARP、NAT 等网络层知识能帮助理解局域网通信、内外网访问和排障。
- 面试中要能结合一次完整请求，把协议、连接、加密、解析和传输串起来。

## 建议阅读顺序

1. [计算机网络常见面试题总结（上）](./other-network-questions.md) 和 [计算机网络常见面试题总结（下）](./other-network-questions2.md)：先建立高频问题清单。
2. [OSI 七层模型与 TCP/IP 四层模型详解](./osi-and-tcp-ip-model.md)：理解网络分层和各层职责。
3. [从输入 URL 到页面展示到底发生了什么？](./the-whole-process-of-accessing-web-pages.md)：用完整链路串联 DNS、TCP、HTTP 和浏览器处理。
4. [HTTP vs HTTPS](./http-vs-https.md)、[HTTPS 握手里的 RSA 和 ECDHE](./https-rsa-vs-ecdhe.md)、[HTTP 常见状态码总结](./http-status-codes.md)：补齐应用层高频问题。
5. [TCP 三次握手和四次挥手](./tcp-connection-and-disconnection.md)、[TCP 传输可靠性保障](./tcp-reliability-guarantee.md)、[TCP TIME_WAIT 详解](./tcp-time-wait.md)：重点攻克 TCP。

## 核心文章

### 总览与基础

- [计算机网络常见面试题总结（上）](./other-network-questions.md)：覆盖网络模型、HTTP、HTTPS、DNS 等基础问题。
- [计算机网络常见面试题总结（下）](./other-network-questions2.md)：继续整理 TCP、UDP、Socket、网络安全等高频问题。
- [OSI 七层模型与 TCP/IP 四层模型详解](./osi-and-tcp-ip-model.md)：理解网络模型、协议分层和数据封装过程。
- [从输入 URL 到页面展示到底发生了什么？](./the-whole-process-of-accessing-web-pages.md)：用一次请求串联常见网络知识点。

### 应用层

- [常见应用层协议总结](./application-layer-protocol.md)：梳理 HTTP、WebSocket、SMTP、FTP、SSH、DNS 等协议。
- [HTTP vs HTTPS](./http-vs-https.md)：理解 HTTPS 加密、证书、身份认证和完整性保护。
- [HTTPS 握手里的 RSA 和 ECDHE](./https-rsa-vs-ecdhe.md)：区分不同密钥交换方式和前向安全性。
- [HTTP 1.0 vs HTTP 1.1](./http1.0-vs-http1.1.md)：理解长连接、缓存、Host 头等差异。
- [HTTP 常见状态码总结](./http-status-codes.md)：掌握 1xx 到 5xx 状态码语义和使用场景。
- [DNS 域名系统详解](./dns.md)：理解域名解析、递归查询、迭代查询和缓存。
- [有了 HTTP，为什么还要 RPC？](./http-vs-rpc.md)：厘清 HTTP 和 RPC 的层次关系。

### 传输层、网络层与安全

- [TCP 三次握手和四次挥手](./tcp-connection-and-disconnection.md)：掌握连接建立、断开和关键状态。
- [TCP 传输可靠性保障](./tcp-reliability-guarantee.md)：理解序列号、确认应答、重传、流量控制和拥塞控制。
- [TCP TIME_WAIT 详解](./tcp-time-wait.md)：理解 TIME_WAIT 的作用、影响和优化边界。
- [TCP Keepalive 和 HTTP Keep-Alive 有什么区别？](./tcp-keepalive-vs-http-keepalive.md)：区分传输层保活和应用层长连接。
- [为什么 TCP 是面向字节流，UDP 是面向报文？](./tcp-byte-stream-udp-datagram.md)：理解 TCP/UDP 数据边界差异。
- [ARP 协议详解](./arp.md)、[NAT 协议详解](./nat.md)、[网络攻击常见手段总结](./network-attack-means.md)：补齐网络层和安全常识。

## 高频问题

- OSI 七层模型和 TCP/IP 四层模型有什么区别？
- 从输入 URL 到页面展示，网络部分发生了什么？
- HTTP 和 HTTPS 有什么区别？HTTPS 握手过程是怎样的？
- HTTP 1.0、1.1、2.0 的核心差异是什么？
- 常见 HTTP 状态码分别表示什么？
- TCP 三次握手、四次挥手为什么不能少？
- TCP 如何保证可靠传输？拥塞控制和流量控制有什么区别？
- TIME_WAIT 为什么存在？大量 TIME_WAIT 如何排查？
- TCP Keepalive 和 HTTP Keep-Alive 有什么区别？
- DNS、ARP、NAT 分别解决什么问题？

## 相关专题

- [计算机基础知识体系](../)
- [操作系统专题](../operating-system/)
- [分布式系统知识体系](../../distributed-system/)
- [RPC 专题](../../distributed-system/rpc/)
- [高性能系统知识体系](../../high-performance/)

<!-- @include: @article-footer.snippet.md -->
