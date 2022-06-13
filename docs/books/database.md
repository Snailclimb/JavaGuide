---
title: 数据库
category: 计算机书籍
icon: database
head:
  - - meta
    - name: keywords
      content: 数据库书籍精选
---

## 基础

教材的话，强烈推荐 **[《数据库系统概念》](https://book.douban.com/subject/10548379/)** ，这本书涵盖了数据库系统的全套概念，知识体系清晰，是学习数据库系统非常经典的教材！不是参考书！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409150441742.png)

如果你觉得书籍比较枯燥，自己坚持不下来的话，我推荐你可以先看看一些不错的视频。就比如北京师范大学的[《数据库系统原理》](https://www.icourse163.org/course/BNU-1002842007)这个就很不错。

这个课程的老师讲的非常详细，而且每一小节的作业设计的也与所讲知识很贴合，后面还有很多配套实验。

![](https://img-blog.csdnimg.cn/20210406154403673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM0MzM3Mjcy,size_16,color_FFFFFF,t_70)

如果你比较喜欢动手，对于理论知识比较抵触的话，我推荐你看看[《如何开发一个简单的数据库》](https://cstack.github.io/db_tutorial/) ，这个 project 会手把手教你编写一个简单的数据库。

![](https://img-blog.csdnimg.cn/20210406154601698.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM0MzM3Mjcy,size_16,color_FFFFFF,t_70)

纸上学来终觉浅 绝知此事要躬行！强烈推荐 CS 专业的小伙伴一定要多多实践！！！

## MySQL

我们网站或 者 APP 的数据都是需要使用数据库来存储数据的。

一般企业项目开发中，使用 MySQL 比较多。如果你要学习 MySQL 的话，可以看下面这 3 本书籍：

- **[《MySQL 必知必会》](https://book.douban.com/subject/3354490/)** ：非常薄！非常适合 MySQL 新手阅读，很棒的入门教材。
- **[《高性能 MySQL》](https://book.douban.com/subject/23008813/)** ： MySQL 领域的经典之作！学习 MySQL 必看！属于进阶内容，主要教你如何更好地使用 MySQL 。既有有理论，又有实践！如果你没时间都看一遍的话，我建议第 5 章（创建高性能的索引） 、第 6 章（查询性能优化） 你一定要认真看一下。
- **[《MySQL 技术内幕》](https://book.douban.com/subject/24708143/)** ：你想深入了解 MySQL 存储引擎的话，看这本书准没错！

![](https://oscimg.oschina.net/oscnet/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

视频的话，你可以看看动力节点的 [《MySQL 数据库教程视频》](https://www.bilibili.com/video/BV1fx411X7BD)。这个视频基本上把 MySQL 的相关一些入门知识给介绍完了。

另外，强推一波 [《MySQL 是怎样运行的》](https://book.douban.com/subject/35231266/) 这本书，内容很适合拿来准备面试。讲的很细节，但又不枯燥，内容非常良心！

![](https://img-blog.csdnimg.cn/20210703120643370.png)

学习了 MySQL 之后，务必确保自己掌握下面这些知识点：

1. MySQL 常用命令 ：

   - 安全：登录、增加/删除用户、备份数据和还原数据
   - 数据库操作： 建库建表/删库删表、用户权限分配
   - ......

2. MySQL 中常用的数据类型、字符集编码
3. MySQL 简单查询、条件查询、模糊查询、多表查询以及如何对查询结果排序、过滤、分组......
4. MySQL 中使用索引、视图、存储过程、游标、触发器
5. ......

如果你想让自己更加了解 MySQL ，同时也是为了准备面试的话，下面这些知识点要格外注意：

1. 索引：索引优缺点、B 树和 B+树、聚集索引与非聚集索引、覆盖索引
2. 事务：事务、数据库事务、ACID、并发事务、事务隔离级别
3. 存储引擎（MyISAM 和 InnoDB）
4. 锁机制与 InnoDB 锁算法

## Redis

**Redis 就是一个使用 C 语言开发的数据库**，不过与传统数据库不同的是 **Redis 的数据是存在内存中的** ，也就是它是内存数据库，所以读写速度非常快，因此 Redis 被广泛应用于缓存方向。

如果你要学习 Redis 的话，强烈推荐 **[《Redis 设计与实现》](https://book.douban.com/subject/25900156/)** 和 **[《Redis 实战》](https://book.douban.com/subject/26612779/)** 这两本书。另外，**[《Redis 开发与运维》](https://book.douban.com/subject/26971561/)** 这本书也非常不错，既有基础介绍，又有一线开发运维经验分享。

![](https://oscimg.oschina.net/oscnet/up-9f20f5e860d143181bd27343abfef3af2ce.png)
