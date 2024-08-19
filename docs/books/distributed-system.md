---
title: 分布式必读经典书籍
category: 计算机书籍
icon: "distributed-network"
---

## 《深入理解分布式系统》

![](https://oss.javaguide.cn/github/javaguide/books/deep-understanding-of-distributed-system.png)

**[《深入理解分布式系统》](https://book.douban.com/subject/35794814/)** 是 2022 年出版的一本分布式中文原创书籍，主要讲的是分布式领域的基本概念、常见挑战以及共识算法。

作者用了大量篇幅来介绍分布式领域中非常重要的共识算法，并且还会基于 Go 语言带着你从零实现了一个共识算法的鼻祖 Paxos 算法。

实话说，我还没有开始看这本书。但是！这本书的作者的博客上的分布式相关的文章我几乎每一篇都认真看过。作者从 2019 年开始构思《深入理解分布式系统》，2020 年开始动笔，花了接近两年的时间才最终交稿。

![](https://oss.javaguide.cn/github/javaguide/books/image-20220706121952258.png)

作者专门写了一篇文章来介绍这本书的背后的故事，感兴趣的小伙伴可以自行查阅：<https://zhuanlan.zhihu.com/p/487534882> 。

最后，放上这本书的代码仓库和勘误地址：<https://github.com/tangwz/DistSysDeepDive> 。

## 《数据密集型应用系统设计》

![](https://oss.javaguide.cn/github/javaguide/books/ddia.png)

强推一波 **[《Designing Data-Intensive Application》](https://book.douban.com/subject/30329536/)** （DDIA，数据密集型应用系统设计），值得读很多遍！豆瓣有接近 90% 的人看了这本书之后给了五星好评。

这本书主要讲了分布式数据库、数据分区、事务、分布式系统等内容。

书中介绍的大部分概念你可能之前都听过，但是在看了书中的内容之后，你可能会豁然开朗：“哇塞！原来是这样的啊！这不是某技术的原理么？”。

这本书我之前专门写过知乎回答介绍和推荐，没看过的朋友可以看看：[有哪些你看了以后大呼过瘾的编程书？](https://www.zhihu.com/question/50408698/answer/2278198495) 。另外，如果你在阅读这本书的时候感觉难度比较大，很多地方读不懂的话，我这里推荐一下《深入理解分布式系统》作者写的[《DDIA 逐章精读》小册](https://ddia.qtmuniao.com)。

## 《深入理解分布式事务》

![](https://oss.javaguide.cn/github/javaguide/books/In-depth-understanding-of-distributed-transactions-xiaoyu.png)

**[《深入理解分布式事务》](https://book.douban.com/subject/35626925/)** 这本书的其中一位作者是 Apache ShenYu（incubating）网关创始人、Hmily、RainCat、Myth 等分布式事务框架的创始人。

学习分布式事务的时候，可以参考一下这本书。虽有一些小错误以及逻辑不通顺的地方，但对于各种分布式事务解决方案的介绍，总体来说还是不错的。

## 《从 Paxos 到 Zookeeper》

![](https://oss.javaguide.cn/github/javaguide/books/image-20211216161350118.png)

**[《从 Paxos 到 Zookeeper》](https://book.douban.com/subject/26292004/)** 是一本带你入门分布式理论的好书。这本书主要介绍几种典型的分布式一致性协议，以及解决分布式一致性问题的思路，其中重点讲解了 Paxos 和 ZAB 协议。

PS：Zookeeper 现在用的不多，可以不用重点学习，但 Paxos 和 ZAB 协议还是非常值得深入研究的。

## 《深入理解分布式共识算法》

![](https://oss.javaguide.cn/github/javaguide/books/deep-dive-into-distributed-consensus-algorithms.png)

**[《深入理解分布式共识算法》](https://book.douban.com/subject/36335459/)** 详细剖析了 Paxos、Raft、Zab 等主流分布式共识算法的核心原理和实现细节。如果你想要了解分布式共识算法的话，不妨参考一下这本书的总结。

## 《微服务架构设计模式》

![](https://oss.javaguide.cn/github/javaguide/books/microservices-patterns.png)

**[《微服务架构设计模式》](https://book.douban.com/subject/33425123/)** 的作者 Chris Richardson 被评为世界十大软件架构师之一、微服务架构先驱。这本书汇集了 44 个经过实践验证的架构设计模式，这些模式用来解决诸如服务拆分、事务管理、查询和跨服务通信等难题。书中的内容不仅理论扎实，还通过丰富的 Java 代码示例，引导读者一步步掌握开发和部署生产级别的微服务架构应用。

## 《凤凰架构》

![](https://oss.javaguide.cn/github/javaguide/books/f5bec14d3b404ac4b041d723153658b5.png)

**[《凤凰架构》](https://book.douban.com/subject/35492898/)** 这本书是周志明老师多年架构和研发经验的总结，内容非常干货，深度与广度并存，理论结合实践！

正如书名的副标题“构建可靠的大型分布式系统”所说的那样，这本书的主要内容就是讲：“如何构建一套可靠的分布式大型软件系统” ，涵盖了下面这些方面的内容：

- 软件架构从单体到微服务再到无服务的演进之路。
- 架构师应该在架构设计时应该注意哪些问题，有哪些比较好的实践。
- 分布式的基石比如常见的分布式共识算法 Paxos、Multi Paxos。
- 不可变基础设施比如虚拟化容器、服务网格。
- 向微服务迈进的避坑指南。

这本书我推荐过很多次了。详见历史文章：

- [周志明老师的又一神书！发现宝藏！](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247505254&idx=1&sn=04faf3093d6002354f06fffbfc2954e0&chksm=cea19aadf9d613bbba7ed0e02ccc4a9ef3a30f4d83530e7ad319c2cc69cd1770e43d1d470046&scene=178&cur_album_id=1646812382221926401#rd)
- [Java 领域的又一神书！周志明老师 YYDS！](https://mp.weixin.qq.com/s/9nbzfZGAWM9_qIMp1r6uUQ)

## 其他

- [《分布式系统 : 概念与设计》](https://book.douban.com/subject/21624776/)：偏教材类型，内容全而无趣，可作为参考书籍；
- [《分布式架构原理与实践》](https://book.douban.com/subject/35689350/)：2021 年出版的，没什么热度，我也还没看过。
