---
title: 数据库必读经典书籍
category: 计算机书籍
icon: "database"
head:
  - - meta
    - name: keywords
      content: 数据库书籍精选
---

## 数据库基础

数据库基础这块，如果你觉得书籍比较枯燥，自己坚持不下来的话，我推荐你可以先看看一些不错的视频，北京师范大学的[《数据库系统原理》](https://www.icourse163.org/course/BNU-1002842007)、哈尔滨工业大学的[《数据库系统（下）：管理与技术》](https://www.icourse163.org/course/HIT-1001578001)就很不错。

[《数据库系统原理》](https://www.icourse163.org/course/BNU-1002842007)这个课程的老师讲的非常详细，而且每一小节的作业设计的也与所讲知识很贴合，后面还有很多配套实验。

![](https://img-blog.csdnimg.cn/20210406154403673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM0MzM3Mjcy,size_16,color_FFFFFF,t_70)



如果你比较喜欢动手，对于理论知识比较抵触的话，推荐你看看[《如何开发一个简单的数据库》](https://cstack.github.io/db_tutorial/) ，这个 project 会手把手教你编写一个简单的数据库。

![](https://img-blog.csdnimg.cn/20210406154601698.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM0MzM3Mjcy,size_16,color_FFFFFF,t_70)

Github上也已经有大佬用 Java 实现过一个简易的数据库，介绍的挺详细的，感兴趣的朋友可以去看看。地址：[https://github.com/alchemystar/Freedom](https://github.com/alchemystar/Freedom) 。

除了这个用 Java 写的之外，**[db_tutorial](https://github.com/cstack/db_tutorial)** 这个项目是国外的一个大佬用 C 语言写的，朋友们也可以去瞅瞅。

**只要利用好搜索引擎，你可以找到各种语言实现的数据库玩具。**

![](https://oscimg.oschina.net/oscnet/up-d32d853f847633ac7ed0efdecf56be1f1d2.png)

**纸上学来终觉浅 绝知此事要躬行！强烈推荐 CS 专业的小伙伴一定要多多实践！！！**

### 《数据库系统概念》

[《数据库系统概念》](https://book.douban.com/subject/10548379/)这本书涵盖了数据库系统的全套概念，知识体系清晰，是学习数据库系统非常经典的教材！不是参考书！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409150441742.png)

### 《数据库系统实现》

如果你也想要研究 MySQL 底层原理的话，我推荐你可以先阅读一下[《数据库系统实现》](https://book.douban.com/subject/4838430/)。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/database-system-implementation.png)

不管是 MySQL 还是Oracle ，它们总体的架子是差不多的，不同的是其内部的实现比如数据库索引的数据结构、存储引擎的实现方式等等。

这本书有些地方还是翻译的比较蹩脚，有能力看英文版的还是建议上手英文版。

《数据库系统实现》 这本书是斯坦福的教材，另外还有一本[《数据库系统基础教程》](https://book.douban.com/subject/3923575/)是前置课程，可以带你入门数据库。

## MySQL

我们网站或者 APP 的数据都是需要使用数据库来存储数据的。

一般企业项目开发中，使用 MySQL 比较多。如果你要学习 MySQL 的话，可以看下面这 3 本书籍：

- **[《MySQL 必知必会》](https://book.douban.com/subject/3354490/)** ：非常薄！非常适合 MySQL 新手阅读，很棒的入门教材。
- **[《高性能 MySQL》](https://book.douban.com/subject/23008813/)** ： MySQL 领域的经典之作！学习 MySQL 必看！属于进阶内容，主要教你如何更好地使用 MySQL 。既有有理论，又有实践！如果你没时间都看一遍的话，我建议第 5 章（创建高性能的索引） 、第 6 章（查询性能优化） 你一定要认真看一下。
- **[《MySQL 技术内幕》](https://book.douban.com/subject/24708143/)** ：你想深入了解 MySQL 存储引擎的话，看这本书准没错！

![](https://oscimg.oschina.net/oscnet/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

视频的话，你可以看看动力节点的 [《MySQL 数据库教程视频》](https://www.bilibili.com/video/BV1fx411X7BD)。这个视频基本上把 MySQL 的相关一些入门知识给介绍完了。

另外，强推一波 **[《MySQL 是怎样运行的》](https://book.douban.com/subject/35231266/)** 这本书，内容很适合拿来准备面试。讲的很细节，但又不枯燥，内容非常良心！

![](https://img-blog.csdnimg.cn/20210703120643370.png)

## PostgreSQL

和 MySQL 一样，PostgreSQL 也是开源免费且功能强大的关系型数据库。PostgreSQL 的 Slogan 是“**世界上最先进的开源关系型数据库**” 。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/image-20220702144954370.png)

最近几年，由于 PostgreSQL 的各种新特性过于优秀，使用 PostgreSQL 代替 MySQL 的项目越来越多了。

如果你还在纠结是否尝试一下 PostgreSQL 的话，建议你看看这个知乎话题：[PostgreSQL 与 MySQL 相比，优势何在？ - 知乎](https://www.zhihu.com/question/20010554) 。

### 《PostgreSQL 指南：内幕探索》

[《PostgreSQL 指南：内幕探索》](https://book.douban.com/subject/33477094/)这本书主要介绍了 PostgreSQL 内部的工作原理，包括数据库对象的逻辑组织与物理实现，进程与内存的架构。

刚工作那会需要用到 PostgreSQL ，看了大概 1/3 的内容，感觉还不错。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/PostgreSQL-Guide.png)

### 《PostgreSQL 技术内幕：查询优化深度探索》

[《PostgreSQL 技术内幕：查询优化深度探索》](https://book.douban.com/subject/30256561/)这本书主要讲了 PostgreSQL 在查询优化上的一些技术实现细节，可以让你对 PostgreSQL 的查询优化器有深层次的了解。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/PostgreSQL-TechnologyInsider.png)

## Redis

**Redis 就是一个使用 C 语言开发的数据库**，不过与传统数据库不同的是 **Redis 的数据是存在内存中的** ，也就是它是内存数据库，所以读写速度非常快，因此 Redis 被广泛应用于缓存方向。

如果你要学习 Redis 的话，强烈推荐 **[《Redis 设计与实现》](https://book.douban.com/subject/25900156/)** 和 **[《Redis 实战》](https://book.douban.com/subject/26612779/)** 这两本书。

另外，**[《Redis 开发与运维》](https://book.douban.com/subject/26971561/)** 这本书也非常不错，既有基础介绍，又有一线开发运维经验分享。

![](https://oscimg.oschina.net/oscnet/up-9f20f5e860d143181bd27343abfef3af2ce.png)
