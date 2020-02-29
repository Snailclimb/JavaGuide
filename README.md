Github用户如果访问速度缓慢的话，可以转移到[码云](https://gitee.com/SnailClimb/JavaGuide )查看，或者[在线阅读](https://snailclimb.gitee.io/javaguide )。

[阿里云高性能服务器，1核1g最低89，不限性能。](https://www.aliyun.com/minisite/goods?userCode=hf47liqn)

更多原创内容和干货分享：

1. 公众号 ： [JavaGuide](#公众号) （最新原创文章+免费领取本文档配套的《Java面试突击》以及Java工程师必备学习资源）
2. B站：[Guide哥](https://space.bilibili.com/504390397) （各种干货视频和生活向视频，来个一键三连可好！）
3. 知识星球 ：[JavaGuide读者圈](https://javaguide.cn/2019/01/02/chat/%E5%81%9A%E4%BA%86%E4%B8%80%E4%B8%AA%E5%BE%88%E4%B9%85%E6%B2%A1%E6%95%A2%E5%81%9A%E7%9A%84%E4%BA%8B%E6%83%85/) (优惠卷永久有效！)

<p align="center">
<a href="https://github.com/Snailclimb/JavaGuide" target="_blank">
	<img src="https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-3/logo - 副本.png" width=""/>
</a>
</p>

<p align="center">
  <a href="https://snailclimb.gitee.io/javaguide"><img src="https://img.shields.io/badge/阅读-read-brightgreen.svg" alt="阅读"></a>
  <a href="#公众号"><img src="https://img.shields.io/badge/%E5%85%AC%E4%BC%97%E5%8F%B7-JavaGuide-lightgrey.svg" alt="公众号"></a>
  <a href="#公众号"><img src="https://img.shields.io/badge/PDF-Java面试突击-important.svg" alt="公众号"></a>
  <a href="#投稿"><img src="https://img.shields.io/badge/support-投稿-critical.svg" alt="投稿"></a>
  <a href="https://xiaozhuanlan.com/javainterview?rel=javaguide"><img src="https://img.shields.io/badge/Java-面试指南-important" alt="投稿"></a>
</p>

<h3 align="center">Sponsor</h3>
<p align="center">
<a  href="https://mp.weixin.qq.com/s/li9_YXNVxan6Qgt3Q9FYqA">
<img src="https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/WechatIMG1.png" style="margin: 0 auto;width:400px"/>
</a >
</p>

## 目录

- [Java](#java)
    - [基础](#基础)
    - [容器](#容器)
    - [并发](#并发)
    - [JVM](#jvm)
    - [其他](#其他)
- [网络](#网络)
- [操作系统](#操作系统)
    - [Linux](#linux)
- [数据结构与算法](#数据结构与算法)
    - [数据结构](#数据结构)
    - [算法](#算法)
- [数据库](#数据库)
    - [MySQL](#mysql)
    - [Redis](#redis)
- [系统设计](#系统设计)
    - [常用框架](#常用框架)
        - [Spring](#spring)
        - [SpringBoot](#springboot)
        - [MyBatis](#mybatis)
    - [认证授权(JWT、SSO)](#认证授权)
    - [分布式](#分布式)
        - [Elasticsearch(分布式搜索引擎)](#elasticsearch分布式搜索引擎)
        - [RPC](#rpc)
        - [消息队列](#消息队列)
        - [API 网关](#api-网关)
        - [唯一 id 生成](#唯一-id-生成)
        - [ZooKeeper](#zookeeper)
        - [数据库扩展](#数据库扩展)
    - [大型网站架构](#大型网站架构)
        - [性能测试](#性能测试)
        - [高并发](#高并发)
        - [高可用](#高可用)
    - [微服务](#微服务)
        - [Spring Cloud](#spring-cloud)
        - [配置中心](#配置中心)
- [面试指南](#面试指南)
    - [备战面试](#备战面试)
    - [真实面试经历分析](#真实面试经历分析)
    - [面经](#面经)
- [Java学习常见问题汇总](#java学习常见问题汇总)
- [工具](#工具)
    - [Git](#git)
    - [Docker](#docker)
    - [其他](#其他-1)
- [资源](#资源)
    - [书单](#书单)
    - [实战项目推荐](#实战项目推荐)
    - [Github](#github)
- [待办](#待办)
- [说明](#说明)
    - [JavaGuide介绍](#javaguide介绍)
    - [作者的其他开源项目推荐](#作者的其他开源项目推荐)
    - [关于转载](#关于转载)
    - [如何对该开源文档进行贡献](#如何对该开源文档进行贡献)
    - [为什么要做这个开源文档？](#为什么要做这个开源文档)
    - [投稿](#投稿)
    - [联系我](#联系我)
    - [公众号](#公众号)

## Java

### 基础

**基础知识系统总结：**

1. **[Java 基础知识](docs/java/Java基础知识.md)**
2. **[Java 基础知识疑难点/易错点](docs/java/Java疑难点.md)**
3. [【加餐】一些重要的Java程序设计题](docs/java/Java程序设计题.md)
4. [【选看】J2EE 基础知识](docs/java/J2EE基础知识.md)

**重要知识点详解：**

1. [枚举](docs/java/basis/用好Java中的枚举真的没有那么简单.md) （很重要的一个数据结构，用好枚举真的没有那么简单！）
2. [Java 常见关键字总结：final、static、this、super!](docs/java/basis/final、static、this、super.md)
3. [什么是反射机制?反射机制的应用场景有哪些?](docs/java/basis/reflection.md)

### 容器

1. **[Java容器常见面试题/知识点总结](docs/java/collection/Java集合框架常见面试题.md)**
2. [ArrayList 源码](docs/java/collection/ArrayList.md)  、[LinkedList 源码](docs/java/collection/LinkedList.md)   、[HashMap(JDK1.8)源码](docs/java/collection/HashMap.md)  

### 并发

**面试题总结：**

1. **[Java 并发基础常见面试题总结](docs/java/Multithread/JavaConcurrencyBasicsCommonInterviewQuestionsSummary.md)**
2. **[Java 并发进阶常见面试题总结](docs/java/Multithread/JavaConcurrencyAdvancedCommonInterviewQuestions.md)**

**必备知识点：**

1. [并发容器总结](docs/java/Multithread/并发容器总结.md)
2. **[Java线程池学习总结](./docs/java/Multithread/java线程池学习总结.md)**
3. [乐观锁与悲观锁](docs/essential-content-for-interview/面试必备之乐观锁与悲观锁.md)
4. [JUC 中的 Atomic 原子类总结](docs/java/Multithread/Atomic.md)
5. [AQS 原理以及 AQS 同步组件总结](docs/java/Multithread/AQS.md)

### JVM

1. **[Java内存区域](docs/java/jvm/Java内存区域.md)**
2. **[JVM垃圾回收](docs/java/jvm/JVM垃圾回收.md)**
3. [JDK 监控和故障处理工具](docs/java/jvm/JDK监控和故障处理工具总结.md)
4. [类文件结构](docs/java/jvm/类文件结构.md)
5. **[类加载过程](docs/java/jvm/类加载过程.md)**
6. [类加载器](docs/java/jvm/类加载器.md)
7. **[【待完成】最重要的 JVM 参数指南（翻译完善了一半）](docs/java/jvm/最重要的JVM参数指南.md)**
8. [JVM 配置常用参数和常用 GC 调优策略](docs/java/jvm/GC调优参数.md)
9. **[【加餐】大白话带你认识JVM](docs/java/jvm/[加餐]大白话带你认识JVM.md)**

### 其他

1. **I/O** ：[BIO,NIO,AIO 总结 ](docs/java/BIO-NIO-AIO.md)
2. **Java 8**  ：[Java 8 新特性总结](docs/java/What's%20New%20in%20JDK8/Java8Tutorial.md)、[Java 8 学习资源推荐](docs/java/What's%20New%20in%20JDK8/Java8教程推荐.md)、[Java8 forEach 指南](docs/java/What's%20New%20in%20JDK8/Java8foreach指南.md)
3.  **[Java 编程规范以及优雅 Java 代码实践总结](docs/java/Java编程规范.md)**
4. 设计模式 :[设计模式系列文章](docs/system-design/设计模式.md)

## 网络

1. [计算机网络常见面试题](docs/network/计算机网络.md)
2. [计算机网络基础知识总结](docs/network/干货：计算机网络知识总结.md)
3. [HTTPS中的TLS](docs/network/HTTPS中的TLS.md)

## 操作系统

操作系统相关概念总结

### Linux

* [后端程序员必备的 Linux 基础知识](docs/operating-system/后端程序员必备的Linux基础知识.md)  
* [Shell 编程入门](docs/operating-system/Shell.md) 

## 数据结构与算法

### 数据结构

- [不了解布隆过滤器？一文给你整的明明白白！](docs/dataStructures-algorithms/data-structure/bloom-filter.md)
- [数据结构知识学习与面试](docs/dataStructures-algorithms/数据结构.md)

### 算法

- [算法学习资源推荐](docs/dataStructures-algorithms/算法学习资源推荐.md)  
- [几道常见的字符串算法题总结 ](docs/dataStructures-algorithms/几道常见的子符串算法题.md)
- [几道常见的链表算法题总结 ](docs/dataStructures-algorithms/几道常见的链表算法题.md)   
- [剑指offer部分编程题](docs/dataStructures-algorithms/剑指offer部分编程题.md)
- [公司真题](docs/dataStructures-algorithms/公司真题.md)
- [回溯算法经典案例之N皇后问题](docs/dataStructures-algorithms/Backtracking-NQueens.md)

## 数据库

### MySQL

1. **[【推荐】MySQL/数据库 知识点总结](docs/database/MySQL.md)**
2. **[阿里巴巴开发手册数据库部分的一些最佳实践](docs/database/阿里巴巴开发手册数据库部分的一些最佳实践.md)**
3. **[一千行MySQL学习笔记](docs/database/一千行MySQL命令.md)**
4. [MySQL高性能优化规范建议](docs/database/MySQL高性能优化规范建议.md)
5. [数据库索引总结](docs/database/MySQL%20Index.md)
6. [事务隔离级别(图文详解)](docs/database/事务隔离级别(图文详解).md)
7. [一条SQL语句在MySQL中如何执行的](docs/database/一条sql语句在mysql中如何执行的.md)

### Redis

* [Redis 总结](docs/database/Redis/Redis.md)
* [Redlock分布式锁](docs/database/Redis/Redlock分布式锁.md)
* [如何做可靠的分布式锁，Redlock真的可行么](docs/database/Redis/如何做可靠的分布式锁，Redlock真的可行么.md)
* [几种常见的 Redis 集群以及使用场景](docs/database/Redis/redis集群以及应用场景.md) 

## 系统设计

### 常用框架

#### Spring

1. [Spring 学习与面试](docs/system-design/framework/spring/Spring.md)
2. **[Spring 常见问题总结](docs/system-design/framework/spring/SpringInterviewQuestions.md)**
3. [Spring中 Bean 的作用域与生命周期](docs/system-design/framework/spring/SpringBean.md)
4. [SpringMVC 工作原理详解](docs/system-design/framework/spring/SpringMVC-Principle.md)
5. [Spring中都用到了那些设计模式?](docs/system-design/framework/spring/Spring-Design-Patterns.md)

#### SpringBoot

- **[SpringBoot 指南/常见面试题总结](https://github.com/Snailclimb/springboot-guide)**

#### MyBatis

- [MyBatis常见面试题总结](docs/system-design/framework/mybatis/mybatis-interview.md)

### 认证授权

**[认证授权基础:搞清Authentication,Authorization以及Cookie、Session、Token、OAuth 2、SSO](docs/system-design/authority-certification/basis-of-authority-certification.md)**

#### JWT

- **[JWT 优缺点分析以及常见问题解决方案](docs/system-design/authority-certification/JWT-advantages-and-disadvantages.md)**
- **[适合初学者入门 Spring Security With JWT 的 Demo](https://github.com/Snailclimb/spring-security-jwt-guide)**

#### SSO(单点登录)

SSO(Single Sign On)即单点登录说的是用户登陆多个子系统的其中一个就有权访问与其相关的其他系统。举个例子我们在登陆了京东金融之后，我们同时也成功登陆京东的京东超市、京东家电等子系统。相关阅读：**[SSO 单点登录看这篇就够了！](docs/system-design/authority-certification/sso.md)**

### 分布式

[分布式相关概念入门](docs/system-design/website-architecture/分布式.md)

#### Elasticsearch(分布式搜索引擎)

提高搜索效率。常见于电商购物网站的商品搜索于分类。

代办......

#### RPC

让调用远程服务调用像调用本地方法那样简单。

- [Dubbo 总结：关于 Dubbo 的重要知识点](docs/system-design/data-communication/dubbo.md)
- [服务之间的调用为啥不直接用 HTTP 而用 RPC？](docs/system-design/data-communication/why-use-rpc.md)

#### 消息队列

消息队列在分布式系统中主要是为了接耦和削峰。相关阅读： **[消息队列总结](docs/system-design/data-communication/message-queue.md)** 。

**RabbitMQ:**

1. [RabbitMQ 入门](docs/system-design/data-communication/rabbitmq.md)

**RocketMQ:**

1. [RocketMQ 入门](docs/system-design/data-communication/RocketMQ.md)
2. [RocketMQ的几个简单问题与答案](docs/system-design/data-communication/RocketMQ-Questions.md)

**Kafka:**

1. **[Kafka 入门+SpringBoot整合Kafka系列](https://github.com/Snailclimb/springboot-kafka)**
2. [Kafka系统设计开篇-面试看这篇就够了](docs/system-design/data-communication/Kafka系统设计开篇-面试看这篇就够了.md)
3. [【加餐】Kafka入门看这一篇就够了](docs/system-design/data-communication/Kafka入门看这一篇就够了.md)

#### API 网关

网关主要用于请求转发、安全认证、协议转换、容灾。

- [浅析如何设计一个亿级网关(API Gateway)](docs/system-design/micro-service/API网关.md)

#### 唯一 id 生成

-  [分布式id生成方案总结](docs/system-design/micro-service/分布式id生成方案总结.md)

#### ZooKeeper

> 前两篇文章可能有内容重合部分，推荐都看一遍。

1. [【入门】ZooKeeper 相关概念总结](docs/system-design/framework/ZooKeeper.md)
2. [【进阶】Zookeeper 原理简单入门！](docs/system-design/framework/ZooKeeper-plus.md)
3. [【拓展】ZooKeeper 数据模型和常见命令](docs/system-design/framework/ZooKeeper数据模型和常见命令.md)

#### 其他

- 接口幂等性（代办）：分布式系统必须要考虑接口的幂等性。

#### 数据库扩展

读写分离、分库分表。

代办.....

### 大型网站架构

- [8 张图读懂大型网站技术架构](docs/system-design/website-architecture/8%20张图读懂大型网站技术架构.md)
- [关于大型网站系统架构你不得不懂的10个问题](docs/system-design/website-architecture/关于大型网站系统架构你不得不懂的10个问题.md)

#### 性能测试

- [后端程序员也要懂的性能测试知识](https://articles.zsxq.com/id_lwl39teglv3d.html) （知识星球）

#### 高并发

待办......

#### 高可用

高可用描述的是一个系统在大部分时间都是可用的，可以为我们提供服务的。高可用代表系统即使在发生硬件故障或者系统升级的时候，服务仍然是可用的 。相关阅读： **《[如何设计一个高可用系统？要考虑哪些地方？](docs/system-design/website-architecture/如何设计一个高可用系统？要考虑哪些地方？.md)》** 。

### 微服务

#### Spring Cloud

- [ 大白话入门 Spring Cloud](docs/system-design/micro-service/spring-cloud.md)

#### 配置中心

待办......

## 面试指南

### 备战面试

* **[【备战面试1】程序员的简历就该这样写](docs/essential-content-for-interview/PreparingForInterview/程序员的简历之道.md)**
* **[【备战面试2】初出茅庐的程序员该如何准备面试？](docs/essential-content-for-interview/PreparingForInterview/interviewPrepare.md)**
* **[【备战面试3】7个大部分程序员在面试前很关心的问题](docs/essential-content-for-interview/PreparingForInterview/JavaProgrammerNeedKnow.md)**
* **[【备战面试4】Github上开源的Java面试/学习相关的仓库推荐](docs/essential-content-for-interview/PreparingForInterview/JavaInterviewLibrary.md)**
* **[【备战面试5】如果面试官问你“你有什么问题问我吗？”时，你该如何回答](docs/essential-content-for-interview/PreparingForInterview/面试官-你有什么问题要问我.md)**
* [【备战面试6】应届生面试最爱问的几道 Java 基础问题](docs/essential-content-for-interview/PreparingForInterview/应届生面试最爱问的几道Java基础问题.md)
* **[【备战面试6】美团面试常见问题总结(附详解答案)](docs/essential-content-for-interview/PreparingForInterview/美团面试常见问题总结.md)**
* **[【备战面试7】一些刁难的面试问题总结](https://xiaozhuanlan.com/topic/9056431872)**

### 真实面试经历分析

- **[我和阿里面试官的一次“邂逅”(附问题详解)](docs/essential-content-for-interview/real-interview-experience-analysis/alibaba-1.md)**

### 面经

- [5面阿里,终获offer(2018年秋招)](docs/essential-content-for-interview/BATJrealInterviewExperience/5面阿里,终获offer.md)
- [蚂蚁金服2019实习生面经总结(已拿口头offer)](docs/essential-content-for-interview/BATJrealInterviewExperience/蚂蚁金服实习生面经总结(已拿口头offer).md)
- [2019年蚂蚁金服、头条、拼多多的面试总结](docs/essential-content-for-interview/BATJrealInterviewExperience/2019alipay-pinduoduo-toutiao.md)
- [Bigo的Java面试，我挂在了第三轮技术面上.........](docs/essential-content-for-interview/BATJrealInterviewExperience/bingo-interview.md)
- [2020 字节跳动后端面经分享！已拿 offer!](docs/essential-content-for-interview/BATJrealInterviewExperience/2020-zijietiaodong.md)

## Java学习常见问题汇总

1. [Java学习路线和方法推荐](docs/questions/java-learning-path-and-methods.md)
2. [Java培训四个月能学会吗？](docs/questions/java-training-4-month.md)
3. [新手学习Java，有哪些Java相关的博客，专栏，和技术学习网站推荐？](docs/questions/java-learning-website-blog.md)
4. [Java 还是大数据，你需要了解这些东西！](docs/questions/java-big-data)
5. [Java 后台开发/大数据？你需要了解这些东西！](https://articles.zsxq.com/id_wto1iwd5g72o.html)（知识星球）

## 工具

### Git

* [Git入门](docs/tools/Git.md)

### Docker

1. [Docker 基本概念解读](docs/tools/Docker.md)
2. [一文搞懂 Docker 镜像的常用操作！](docs/tools/Docker-Image.md )

### 其他

- [阿里云服务器使用经验](docs/tools/阿里云服务器使用经验.md)

## 资源

### 书单

- [Java程序员必备书单](docs/data/java-recommended-books.md)

### 实战项目推荐

- [Github 上热门的 Spring Boot 项目实战推荐](docs/data/spring-boot-practical-projects.md)

### Github

- [Github 上 Star 数最多的 10 个项目，看完之后很意外!](docs/tools/github/github-star-ranking.md)
- [年末将至，值得你关注的16个Java 开源项目！](docs/github-trending/2019-12.md)
- [Java 项目月榜单](docs/github-trending/JavaGithubTrending.md)

***

## 待办

- [ ] Netty 总结(---正在进行中---)
- [ ] 数据结构总结重构(---正在进行中---)

## 说明

开源项目在于大家的参与，这才使得它的价值得到提升。感谢🙏有你！

### JavaGuide介绍

开源 JavaGuide 初始想法源于自己的个人那一段比较迷茫的学习经历。主要目的是为了通过这个开源平台来帮助一些在学习 Java 或者面试过程中遇到问题的小伙伴。

*  **对于 Java 初学者来说：** 本文档倾向于给你提供一个比较详细的学习路径，让你对于Java整体的知识体系有一个初步认识。另外，本文的一些文章
也是你学习和复习 Java 知识不错的实践；
*  **对于非 Java 初学者来说：** 本文档更适合回顾知识，准备面试，搞清面试应该把重心放在那些问题上。要搞清楚这个道理：提前知道那些面试常见，不是为了背下来应付面试，而是为了让你可以更有针对的学习重点。

Markdown 格式参考：[Github Markdown格式](https://guides.github.com/features/mastering-markdown/)，表情素材来自：[EMOJI CHEAT SHEET](https://www.webpagefx.com/tools/emoji-cheat-sheet/)。

利用 docsify 生成文档部署在 Github pages: [docsify 官网介绍](https://docsify.js.org/#/)

### 作者的其他开源项目推荐

1. [springboot-guide](https://github.com/Snailclimb/springboot-guide) : 适合新手入门以及有经验的开发人员查阅的 Spring Boot 教程（业余时间维护中，欢迎一起维护）。
2. [programmer-advancement](https://github.com/Snailclimb/programmer-advancement) : 我觉得技术人员应该有的一些好习惯！
3. [spring-security-jwt-guide](https://github.com/Snailclimb/spring-security-jwt-guide) :从零入门 ！Spring Security With JWT（含权限验证）后端部分代码。

### 关于转载

如果你需要转载本仓库的一些文章到自己的博客的话，记得注明原文地址就可以了。

### 如何对该开源文档进行贡献

1. 笔记内容大多是手敲，所以难免会有笔误，你可以帮我找错别字。
2. 很多知识点我可能没有涉及到，所以你可以对其他知识点进行补充。
3. 现有的知识点难免存在不完善或者错误，所以你可以对已有知识点进行修改/补充。

### 联系我

![个人微信](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/wechat3.jpeg)

### Contributor

下面是笔主收集的一些对本仓库提过有价值的pr或者issue的朋友，人数较多，如果你也对本仓库提过不错的pr或者issue的话，你可以加我的微信与我联系。下面的排名不分先后！

<a href="https://github.com/fanofxiaofeng">
    <img src="https://avatars0.githubusercontent.com/u/3983683?s=460&v=4" width="45px">
</a>
<a href="https://github.com/LiWenGu">
    <img src="https://avatars0.githubusercontent.com/u/15909210?s=460&v=4" width="45px">
</a>
<a href="https://github.com/fanchenggang">  
    <img src="https://avatars2.githubusercontent.com/u/8225921?s=460&v=4" width="45px">
</a>
<a href="https://github.com/Rustin-Liu">  
    <img src="https://avatars2.githubusercontent.com/u/29879298?s=400&v=4" width="45px">
</a>

<a href="https://github.com/ipofss">
    <img src="https://avatars1.githubusercontent.com/u/5917359?s=460&v=4" width="45px"></a>
<a href="https://github.com/Gene1994">
    <img src="https://avatars3.githubusercontent.com/u/24930369?s=460&v=4" width="45px">
</a>
<a href="https://github.com/spikesp">
    <img src="https://avatars0.githubusercontent.com/u/12581996?s=460&v=4" width="45px"></a>
<a href="https://github.com/illusorycloud">
    <img src="https://avatars3.githubusercontent.com/u/31980412?s=460&v=4" width="45px">
</a>
<a href="https://github.com/kinglaw1204">
    <img src="https://avatars1.githubusercontent.com/u/20039931?s=460&v=4" width="45px">
</a>
<a href="https://github.com/jun1st">
    <img src="https://avatars2.githubusercontent.com/u/14312378?s=460&v=4" width="45px">
</a>"
<a href="https://github.com/fantasygg">  
    <img src="https://avatars3.githubusercontent.com/u/13445354?s=460&v=4" width="45px">
</a>
<a href="https://github.com/debugjoker">  
    <img src="https://avatars3.githubusercontent.com/u/26218005?s=460&v=4" width="45px">
</a>
<a href="https://github.com/zhyank">  
    <img src="https://avatars0.githubusercontent.com/u/17696240?s=460&v=4" width="45px">
</a>
<a href="https://github.com/Goose9527">  
    <img src="https://avatars2.githubusercontent.com/u/43314997?s=460&v=4" width="45px">
</a>
<a href="https://github.com/yuechuanx">  
    <img src="https://avatars3.githubusercontent.com/u/19339293?s=460&v=4" width="45px">
</a>
<a href="https://github.com/cnLGMing">  
    <img src="https://avatars2.githubusercontent.com/u/15910705?s=460&v=4" width="45px">
</a>
<a href="https://github.com/fanchenggang">  
    <img src="https://avatars0.githubusercontent.com/u/20358122?s=460&v=4" width="45px">
</a>

### 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号。

**《Java面试突击》:** 由本文档衍生的专为面试而生的《Java面试突击》V2.0 PDF 版本[公众号](#公众号)后台回复 **"Java面试突击"** 即可免费领取！

**Java工程师必备学习资源:** 一些Java工程师常用学习资源公众号后台回复关键字 **“1”** 即可免费无套路获取。 

![我的公众号](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-6/167598cd2e17b8ec.png)


