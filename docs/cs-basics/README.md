---
title: 计算机基础知识总结：计算机网络、操作系统、数据结构与算法面试题
description: 计算机基础知识与面试题系统总结，覆盖计算机网络、操作系统、数据结构、算法、Linux、TCP/IP、HTTP、DNS 等后端面试高频考点，适合校招/社招复习。
icon: "mdi:desktop-classic"
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: 计算机基础,计算机基础知识总结,计算机基础面试题,计算机网络,计算机网络面试题,操作系统,操作系统面试题,数据结构,数据结构面试题,算法,算法面试题,Linux,TCP/IP,HTTP,DNS,后端面试,Java面试,八股文
  - - meta
    - property: og:title
      content: 计算机基础知识总结：计算机网络、操作系统、数据结构与算法面试题
  - - meta
    - property: og:description
      content: 系统整理计算机网络、操作系统、数据结构与算法等计算机基础知识和后端面试高频考点，适合校招/社招复习。
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **计算机基础知识总结** 系统整理了计算机网络、操作系统、数据结构与算法、Linux 等高频考点。内容既包括常见面试题，也包括 TCP/IP、HTTP、DNS、进程线程、内存管理、数组链表、树、图、排序算法等基础知识。

如果你正在准备 Java 后端、校招、社招或大厂技术面试，可以先从 [计算机网络常见面试题总结](./network/other-network-questions.md) 和[操作系统常见面试题总结](./operating-system/operating-system-basic-questions-01.md) 开始。

这个专栏把网络、操作系统、数据结构与算法的核心知识点系统整理了出来，整站配有 **300+ 张技术配图**，用图解的方式把抽象概念讲清楚，不是干巴巴的文字堆砌。

![计算机基础知识总结内容概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/cs-basics-overview.png)

## 计算机网络

计算机网络部分按协议层组织，从常见面试题到 TCP/IP、HTTP、HTTPS、DNS、ARP、NAT 等核心知识点，层层递进。

**计算机网络面试题**：

- [计算机网络常见面试题总结(上)](./network/other-network-questions.md)
- [计算机网络常见面试题总结(下)](./network/other-network-questions2.md)

**基础**：

- [OSI 七层模型与 TCP/IP 四层模型详解](./network/osi-and-tcp-ip-model.md)
- [从输入 URL 到页面展示到底发生了什么？](./network/the-whole-process-of-accessing-web-pages.md)

**应用层**：

- [常见应用层协议总结：HTTP、WebSocket、SMTP、FTP、SSH、DNS 等](./network/application-layer-protocol.md)
- [HTTP vs HTTPS：区别在哪里、HTTPS 为什么更安全（应用层）](./network/http-vs-https.md)
- [HTTPS 握手里的 RSA 和 ECDHE，到底差在哪？（应用层）](./network/https-rsa-vs-ecdhe.md)
- [HTTP 1.0 vs HTTP 1.1：长连接、缓存、Host 头等核心差异（应用层）](./network/http1.0-vs-http1.1.md)
- [HTTP 常见状态码总结（应用层）](./network/http-status-codes.md)
- [DNS 域名系统详解（应用层）](./network/dns.md)
- [有了HTTP，为什么还要RPC？（应用层）](./network/http-vs-rpc.md)

**传输层**：

- [TCP 三次握手和四次挥手（传输层）](./network/tcp-connection-and-disconnection.md)
- [TCP TIME_WAIT 详解：为什么要等、会不会出问题、能不能复用？](./network/tcp-time-wait.md)
- [TCP 传输可靠性保障（传输层）](./network/tcp-reliability-guarantee.md)
- [为什么 TCP 是面向字节流，UDP 是面向报文？（传输层）](./network/tcp-byte-stream-udp-datagram.md)

**网络层**：

- [ARP 协议详解(网络层)](./network/arp.md)
- [NAT 协议详解（网络层）](./network/nat.md)

**安全**：

- [网络攻击常见手段总结（安全）](./network/network-attack-means.md)

## 操作系统

- [操作系统常见面试题总结(上)](./operating-system/operating-system-basic-questions-01.md)
- [操作系统常见面试题总结(下)](./operating-system/operating-system-basic-questions-02.md)
- **Linux**：
  - [Linux 基础知识总结](./operating-system/linux-intro.md)
  - [Shell 编程基础知识总结](./operating-system/shell-intro.md)

## 数据结构

数据结构是算法和系统设计的基础。每篇都配有大量图解，把数组、链表、栈、队列、树、图、堆、红黑树、布隆过滤器等数据结构的形态和操作过程画出来，比纯文字好理解得多。

- [线性数据结构详解（数组、链表、栈、队列）](./data-structure/linear-data-structure.md)
- [树结构详解（二叉树、AVL、B/B+树）](./data-structure/tree.md)
- [图详解（DFS、BFS、最短路径）](./data-structure/graph.md)
- [堆详解（最大堆、最小堆、优先队列）](./data-structure/heap.md)
- [红黑树详解（性质、旋转、应用）](./data-structure/red-black-tree.md)
- [布隆过滤器详解（原理、实现、应用场景）](./data-structure/bloom-filter.md)

## 算法

算法部分整理了常见算法思想、LeetCode 高频题、字符串、链表、《剑指 Offer》和十大经典排序算法，适合配合数据结构一起复习。

**常见算法面试题总结**：

- [经典算法思想总结（含LeetCode题目推荐）](./algorithms/classical-algorithm-problems-recommendations.md)
- [常见数据结构经典LeetCode题目推荐](./algorithms/common-data-structures-leetcode-recommendations.md)
- [几道常见的字符串算法题](./algorithms/string-algorithm-problems.md)
- [几道常见的链表算法题](./algorithms/linkedlist-algorithm-problems.md)
- [剑指offer部分编程题](./algorithms/the-sword-refers-to-offer.md)
- [十大经典排序算法总结](./algorithms/10-classical-sorting-algorithms.md)

<!-- @include: @article-footer.snippet.md -->
