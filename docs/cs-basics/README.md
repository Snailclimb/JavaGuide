---
title: 计算机基础知识体系：计算机网络、操作系统、数据结构与算法
description: 计算机基础面试与学习路线，涵盖计算机网络、操作系统、数据结构、算法、Linux、TCP/IP、HTTP、DNS 等内容，适合校招和社招复习。
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
      content: 计算机基础知识体系：计算机网络、操作系统、数据结构与算法
  - - meta
    - property: og:description
      content: 梳理计算机网络、操作系统、数据结构与算法等计算机基础知识，适合后端开发者校招、社招复习。
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **计算机基础知识体系** 面向后端学习和面试复习，按“计算机网络 -> 操作系统 -> 数据结构 -> 算法”的顺序整理本站计算机基础相关文章。

如果你时间有限，建议先看 [计算机网络常见面试题总结](./network/other-network-questions.md) 和 [操作系统常见面试题总结](./operating-system/operating-system-basic-questions-01.md)，快速建立高频问题清单；如果你想系统补基础，可以按下面的专题顺序推进。

整站配有 **300+ 张技术配图**，用图解的方式把抽象概念讲清楚，不是干巴巴的文字堆砌。

![计算机基础知识总结内容概览](https://oss.javaguide.cn/github/javaguide/cs-basics/network/cs-basics-overview.png)

## 适合谁看

- 正在系统补齐计算机基础的后端开发者。
- 准备校招、社招、中大厂后端面试的同学。
- 想把网络、操作系统、数据结构和算法串成完整知识体系的读者。
- 已经写过业务代码，但对 TCP/IP、HTTP、进程线程、内存管理、树图、排序等基础不够扎实的工程师。

## 学习重点

- 计算机网络重点理解分层模型、TCP/UDP、HTTP/HTTPS、DNS、ARP、NAT 和常见网络安全问题。
- 操作系统重点理解进程线程、内存管理、文件系统、Linux 基础和 Shell 使用。
- 数据结构重点理解数组、链表、栈、队列、树、图、堆、红黑树和布隆过滤器的特点与适用场景。
- 算法重点理解常见算法思想、复杂度分析、排序、字符串、链表和 LeetCode 高频题。
- 面试中要能把“概念 -> 原理 -> 对比 -> 场景 -> 常见问题”串成完整回答。

## 建议阅读顺序

1. [计算机网络专题](./network/)：先从分层模型、HTTP、TCP、DNS 和常见网络面试题入手，建立网络通信的整体认知。
2. [操作系统专题](./operating-system/)：理解进程线程、内存、文件系统、Linux 和 Shell，为并发编程、JVM、数据库打基础。
3. [数据结构专题](./data-structure/)：掌握线性表、树、图、堆、红黑树、布隆过滤器等常见结构。
4. [算法专题](./algorithms/)：结合经典算法思想和 LeetCode 高频题进行练习。
5. 回到面试题做查缺补漏：重点复盘网络和操作系统高频问题，再把数据结构与算法题按类型刷一遍。

## 核心文章

### 计算机网络

- [计算机网络专题](./network/)：按协议层梳理计算机网络核心知识和面试高频题。
- [计算机网络常见面试题总结（上）](./network/other-network-questions.md)：覆盖 OSI/TCP-IP 模型、HTTP、HTTPS、DNS 等基础问题。
- [计算机网络常见面试题总结（下）](./network/other-network-questions2.md)：继续补充 TCP、UDP、网络安全、Socket 等常见问题。
- [OSI 七层模型与 TCP/IP 四层模型详解](./network/osi-and-tcp-ip-model.md)：建立网络分层和协议职责认知。
- [从输入 URL 到页面展示到底发生了什么？](./network/the-whole-process-of-accessing-web-pages.md)：用一次完整请求串联 DNS、TCP、HTTP、浏览器渲染等知识点。
- [HTTP vs HTTPS](./network/http-vs-https.md)、[HTTP 1.0 vs HTTP 1.1](./network/http1.0-vs-http1.1.md)、[HTTP 常见状态码总结](./network/http-status-codes.md)：集中理解 HTTP 相关高频考点。
- [TCP 三次握手和四次挥手](./network/tcp-connection-and-disconnection.md)、[TCP 传输可靠性保障](./network/tcp-reliability-guarantee.md)：掌握 TCP 最核心的连接管理和可靠传输机制。

### 操作系统

- [操作系统专题](./operating-system/)：从操作系统基础讲到 Linux 常见问题。
- [操作系统常见面试题总结（上）](./operating-system/operating-system-basic-questions-01.md)：覆盖操作系统基础、进程线程、死锁、内存管理等问题。
- [操作系统常见面试题总结（下）](./operating-system/operating-system-basic-questions-02.md)：继续整理文件系统、IO、Linux 等面试考点。
- [Linux 基础知识总结](./operating-system/linux-intro.md)：掌握 Linux 目录、文件权限、常用命令和系统基础。
- [Shell 编程基础知识总结](./operating-system/shell-intro.md)：补齐脚本编写、变量、流程控制和常用命令能力。

### 数据结构

- [数据结构专题](./data-structure/)：按结构类型整理常见数据结构及图解。
- [线性数据结构详解](./data-structure/linear-data-structure.md)：理解数组、链表、栈、队列的存储特点和操作复杂度。
- [树结构详解](./data-structure/tree.md)：掌握二叉树、二叉搜索树、AVL、B 树、B+ 树等常见树结构。
- [图详解](./data-structure/graph.md)：理解图的表示、DFS、BFS 和最短路径等基础算法。
- [堆详解](./data-structure/heap.md)、[红黑树详解](./data-structure/red-black-tree.md)、[布隆过滤器详解](./data-structure/bloom-filter.md)：补齐高频工程结构和面试考点。

### 算法

- [算法专题](./algorithms/)：整理常见算法思想、LeetCode 高频题和经典排序。
- [经典算法思想总结](./algorithms/classical-algorithm-problems-recommendations.md)：覆盖二分、双指针、滑动窗口、回溯、动态规划等常见思想。
- [常见数据结构经典 LeetCode 题目推荐](./algorithms/common-data-structures-leetcode-recommendations.md)：按数据结构类型整理刷题路线。
- [几道常见的字符串算法题](./algorithms/string-algorithm-problems.md)、[几道常见的链表算法题](./algorithms/linkedlist-algorithm-problems.md)：集中练习高频题型。
- [剑指 Offer 部分编程题](./algorithms/the-sword-refers-to-offer.md)、[十大经典排序算法总结](./algorithms/10-classical-sorting-algorithms.md)：适合面试前复盘。

## 高频问题

- OSI 七层模型和 TCP/IP 四层模型分别是什么？每层解决什么问题？
- 从输入 URL 到页面展示，中间经历了哪些步骤？
- HTTP 和 HTTPS 有什么区别？HTTPS 为什么更安全？
- TCP 三次握手、四次挥手分别解决什么问题？TIME_WAIT 为什么存在？
- TCP 如何保证可靠传输？TCP 和 UDP 如何选型？
- 进程和线程有什么区别？什么是死锁，如何避免？
- 操作系统内存管理、虚拟内存、分页和分段分别是什么？
- 数组、链表、栈、队列、树、图、堆分别适合什么场景？
- 红黑树、B+ 树、布隆过滤器在工程中常用在哪里？
- 刷算法题时如何按题型建立解题模板？

## 相关专题

- [Java 知识体系](../java/)
- [数据库知识体系](../database/)
- [分布式系统知识体系](../distributed-system/)
- [高性能系统知识体系](../high-performance/)
- [系统设计](../system-design/)
- [计算机基础书籍推荐](../books/cs-basics.md)

<!-- @include: @article-footer.snippet.md -->
