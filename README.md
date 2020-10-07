> 关于 JavaGuide 的相关介绍请看：[《从编程小白到做了一个接近 90k 点赞的一个国产 Java 开源项目》](https://www.yuque.com/snailclimb/dr6cvl/mr44yt#vu3ok)
>
> 准备面试的小伙伴可以考虑面试专版：[《Java 面试进阶指南》](https://xiaozhuanlan.com/javainterview?rel=javaguide) ，欢迎加入[我的星球](https://wx.zsxq.com/dweb2/index/group/48418884588288)获取更多实用干货。
>
> 阿里云最近在做活动，服务器不到 10 元/月，小伙伴们搭建一个网站提高简历质量。支持国内开源做的比较好的公司！[点击此链接直达活动首页。](https://promotion.aliyun.com/ntms/yunparter/invite.html?userCode=hf47liqn)
>
> 项目的发展离不开你的支持，如果 JavaGuide 帮助到了你找到自己满意的 offer，那就[请作者喝杯咖啡吧](https://www.yuque.com/snailclimb/dr6cvl/mr44yt#vu3ok)☕！我会继续将项目完善下去！加油！

《JavaGuide 面试突击版》PDF 版本+3 本 PDF Java 学习手册，在公众号 **[JavaGuide](#公众号)** 后台回复“**面试突击**”即可获取。

如果 Github 访问速度比较慢或者图片无法刷新出来的话，可以转移到[码云](https://gitee.com/SnailClimb/JavaGuide)查看，或者[在线阅读](https://snailclimb.gitee.io/javaguide)。**如果你要提交 issue 或者 pr 的话请到 [Github](https://github.com/Snailclimb/JavaGuide) 提交。**

如要进群或者请教问题，请[联系我](#联系我) （备注来自 Github。请直入问题，工作时间不回复）。

**开始阅读之前必看** ：[完结撒花！JavaGuide 面试突击版来啦！](./docs/javaguide面试突击版.md) 。

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

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://t.1yb.co/5p8J">
          <img src="./media/sponsor/xiangxue.png" style="margin: 0 auto;width:450px" /></a>
      </td>  
       <td align="center" valign="middle">
        <a href="https://w.url.cn/s/AS6JeXA">
          <img src="./media/sponsor/kaikeba.png" style="margin: 0 auto;width:450px" /></a>
      </td>       
    </tr>
  </tbody>
</table>


## 目录

- [目录](#目录)
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
  - [必知](#必知)
  - [常用框架](#常用框架)
    - [Spring/SpringBoot](#springspringboot)
    - [MyBatis](#mybatis)
    - [Netty](#netty)
  - [认证授权](#认证授权)
    - [JWT](#jwt)
    - [SSO(单点登录)](#sso单点登录)
  - [分布式](#分布式)
    - [分布式搜索引擎](#分布式搜索引擎)
    - [RPC](#rpc)
    - [消息队列](#消息队列)
    - [API 网关](#api-网关)
    - [分布式 id](#分布式id)
    - [分布式限流](#分布式限流)
    - [分布式接口幂等性](#分布式接口幂等性)
    - [ZooKeeper](#zookeeper)
    - [其他](#其他-1)
    - [数据库扩展](#数据库扩展)
  - [大型网站架构](#大型网站架构)
    - [性能测试](#性能测试)
    - [高并发](#高并发)
    - [高可用](#高可用)
  - [微服务](#微服务)
    - [Spring Cloud](#spring-cloud)
- [必会工具](#必会工具)
  - [Git](#git)
  - [Docker](#docker)
  - [其他](#其他-2)
- [面试指南](#面试指南)
- [Java 学习常见问题汇总](#java学习常见问题汇总)
- [资源](#资源)
  - [Java 程序员必备书单](#java程序员必备书单)
  - [实战项目推荐](#实战项目推荐)
  - [Github](#github)
- [待办](#待办)
- [说明](#说明)

## Java

### 基础

**基础知识系统总结：**

1. **[Java 基础知识](docs/java/Java基础知识.md)**
2. **[Java 基础知识疑难点/易错点](docs/java/Java疑难点.md)**
3. [【选看】J2EE 基础知识](docs/java/J2EE基础知识.md)

**重要知识点详解：**

1. [枚举](docs/java/basic/用好Java中的枚举真的没有那么简单.md) （很重要的一个数据结构，用好枚举真的没有那么简单！）
2. [Java 常见关键字总结：final、static、this、super!](docs/java/basic/final,static,this,super.md)
3. [什么是反射机制?反射机制的应用场景有哪些?](docs/java/basic/reflection.md)
4. [代理模式详解：静态代理+JDK/CGLIB 动态代理实战（动态代理和静态代理的区别？JDK 动态代理 和 CGLIB 动态代理的区别？）](docs/java/basic/java-proxy.md)

**其他：**

1. [JAD 反编译](docs/java/JAD反编译tricks.md)
2. [手把手教你定位常见 Java 性能问题](./docs/java/手把手教你定位常见Java性能问题.md)

### 容器

1. **[Java 容器常见面试题/知识点总结](docs/java/collection/Java集合框架常见面试题.md)**
2. 源码分析：[ArrayList 源码](docs/java/collection/ArrayList.md) 、[LinkedList 源码](docs/java/collection/LinkedList.md) 、[HashMap(JDK1.8)源码](docs/java/collection/HashMap.md) 、[ConcurrentHashMap 源码](docs/java/collection/ConcurrentHashMap.md)

### 并发

**[多线程学习指南](./docs/java/Multithread/多线程学习指南.md)**

**面试题总结：**

1. **[Java 并发基础常见面试题总结](docs/java/Multithread/JavaConcurrencyBasicsCommonInterviewQuestionsSummary.md)**
2. **[Java 并发进阶常见面试题总结](docs/java/Multithread/JavaConcurrencyAdvancedCommonInterviewQuestions.md)**

**面试常问知识点：**

1. [并发容器总结](docs/java/Multithread/并发容器总结.md)
2. **线程池**：[Java 线程池学习总结](./docs/java/Multithread/java线程池学习总结.md)、[拿来即用的线程池最佳实践](./docs/java/Multithread/best-practice-of-threadpool.md)
3. [乐观锁与悲观锁](docs/essential-content-for-interview/面试必备之乐观锁与悲观锁.md)
4. [万字图文深度解析 ThreadLocal](docs/java/Multithread/ThreadLocal.md)
5. [JUC 中的 Atomic 原子类总结](docs/java/Multithread/Atomic.md)
6. [AQS 原理以及 AQS 同步组件总结](docs/java/Multithread/AQS.md)

### JVM

1. **[Java 内存区域](docs/java/jvm/Java内存区域.md)**
2. **[JVM 垃圾回收](docs/java/jvm/JVM垃圾回收.md)**
3. [JDK 监控和故障处理工具](docs/java/jvm/JDK监控和故障处理工具总结.md)
4. [类文件结构](docs/java/jvm/类文件结构.md)
5. **[类加载过程](docs/java/jvm/类加载过程.md)**
6. [类加载器](docs/java/jvm/类加载器.md)
7. **[【待完成】最重要的 JVM 参数指南（翻译完善了一半）](docs/java/jvm/最重要的JVM参数指南.md)**
8. [JVM 配置常用参数和常用 GC 调优策略](docs/java/jvm/GC调优参数.md)
9. **[【加餐】大白话带你认识 JVM](docs/java/jvm/[加餐]大白话带你认识JVM.md)**

### 其他

1.  **Linux IO** ： [Linux IO](docs/java/Linux_IO.md)
2.  **I/O** ：[BIO,NIO,AIO 总结 ](docs/java/BIO-NIO-AIO.md)
3.  **Java 8** ：[Java 8 新特性总结](docs/java/What's%20New%20in%20JDK8/Java8Tutorial.md)、[Java 8 学习资源推荐](docs/java/What's%20New%20in%20JDK8/Java8教程推荐.md)、[Java8 forEach 指南](docs/java/What's%20New%20in%20JDK8/Java8foreach指南.md)
4.  **Java9~Java14** : [一文带你看遍 JDK9~14 的重要新特性！](./docs/java/jdk-new-features/new-features-from-jdk8-to-jdk14.md)
5.  Java 编程规范：**[Java 编程规范以及优雅 Java 代码实践总结](docs/java/Java编程规范.md)** 、[告别编码 5 分钟，命名 2 小时！史上最全的 Java 命名规范参考！](docs/java/java-naming-conventions.md)
6.  设计模式 :[设计模式系列文章](docs/system-design/设计模式.md)

## 网络

1. [计算机网络常见面试题](docs/network/计算机网络.md)
2. [计算机网络基础知识总结](docs/network/干货：计算机网络知识总结.md)

## 操作系统

[最硬核的操作系统常见问题总结！](docs/operating-system/basis.md)

### Linux

- [后端程序员必备的 Linux 基础知识](docs/operating-system/linux.md)
- [Shell 编程入门](docs/operating-system/Shell.md)
- [我为什么从 Windows 转到 Linux？](docs/operating-system/完全使用GNU_Linux学习.md)
- [Linux IO 模型](docs/operating-system/Linux_IO.md)
- [Linux 性能分析工具合集](docs/operating-system/Linux性能分析工具合集.md)

## 数据结构与算法

### 数据结构

- [不了解布隆过滤器？一文给你整的明明白白！](docs/dataStructures-algorithms/data-structure/bloom-filter.md)
- [数据结构知识学习与面试](docs/dataStructures-algorithms/数据结构.md)

### 算法

- [硬核的算法学习书籍+资源推荐](docs/dataStructures-algorithms/算法学习资源推荐.md)
- 常见算法问题总结：
  - [几道常见的字符串算法题总结 ](docs/dataStructures-algorithms/几道常见的子符串算法题.md)
  - [几道常见的链表算法题总结 ](docs/dataStructures-algorithms/几道常见的链表算法题.md)
  - [剑指 offer 部分编程题](docs/dataStructures-algorithms/剑指offer部分编程题.md)
  - [公司真题](docs/dataStructures-algorithms/公司真题.md)
  - [回溯算法经典案例之 N 皇后问题](docs/dataStructures-algorithms/Backtracking-NQueens.md)

## 数据库

### MySQL

**总结：**

1. **[【推荐】MySQL/数据库 知识点总结](docs/database/MySQL.md)**
2. **[阿里巴巴开发手册数据库部分的一些最佳实践](docs/database/阿里巴巴开发手册数据库部分的一些最佳实践.md)**
3. **[一千行 MySQL 学习笔记](docs/database/一千行MySQL命令.md)**
4. [MySQL 高性能优化规范建议](docs/database/MySQL高性能优化规范建议.md)

**重要知识点：**

1. [数据库索引总结 1](docs/database/MySQL%20Index.md)、[数据库索引总结 2](docs/database/数据库索引.md)
2. [事务隔离级别(图文详解)](<docs/database/事务隔离级别(图文详解).md>)
3. [一条 SQL 语句在 MySQL 中如何执行的](docs/database/一条sql语句在mysql中如何执行的.md)
4. **[关于数据库中如何存储时间的一点思考](docs/database/关于数据库存储时间的一点思考.md)**

### Redis

- [关于缓存的一些重要概念(Redis 前置菜)](docs/database/Redis/some-concepts-of-caching.md)
- [Redis 常见问题总结](docs/database/Redis/redis-all.md)

## 系统设计

### 必知

1. **[RestFul API 简明教程](docs/system-design/restful-api.md)**
2. **[因为命名被 diss 无数次。Guide 简单聊聊编程最头疼的事情之一:命名](docs/system-design/naming.md)**

### 常用框架

#### Spring/SpringBoot

1. **[Spring 常见问题总结](docs/system-design/framework/spring/SpringInterviewQuestions.md)**
2. **[SpringBoot 指南/常见面试题总结](https://github.com/Snailclimb/springboot-guide)**
3. **[Spring/Spring 常用注解总结！安排！](./docs/system-design/framework/spring/spring-annotations.md)**
4. **[Spring 事务总结](docs/system-design/framework/spring/spring-transaction.md)**
5. [Spring IoC 和 AOP 详解](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486938&idx=1&sn=c99ef0233f39a5ffc1b98c81e02dfcd4&chksm=cea24211f9d5cb07fa901183ba4d96187820713a72387788408040822ffb2ed575d28e953ce7&token=1666190828&lang=zh_CN#rd)
6. [Spring 中 Bean 的作用域与生命周期](docs/system-design/framework/spring/SpringBean.md)
7. [SpringMVC 工作原理详解](docs/system-design/framework/spring/SpringMVC-Principle.md)
8. [Spring 中都用到了那些设计模式?](docs/system-design/framework/spring/Spring-Design-Patterns.md)

#### MyBatis

- [MyBatis 常见面试题总结](docs/system-design/framework/mybatis/mybatis-interview.md)

#### Netty

1. [剖析面试最常见问题之 Netty（上）](https://xiaozhuanlan.com/topic/4028536971)
2. [剖析面试最常见问题之 Netty（下）](https://xiaozhuanlan.com/topic/3985146207)

### 认证授权

**[认证授权基础:搞清 Authentication,Authorization 以及 Cookie、Session、Token、OAuth 2、SSO](docs/system-design/authority-certification/basis-of-authority-certification.md)**

#### JWT

- **[JWT 优缺点分析以及常见问题解决方案](docs/system-design/authority-certification/JWT-advantages-and-disadvantages.md)**
- **[适合初学者入门 Spring Security With JWT 的 Demo](https://github.com/Snailclimb/spring-security-jwt-guide)**

#### SSO(单点登录)

SSO(Single Sign On)即单点登录说的是用户登陆多个子系统的其中一个就有权访问与其相关的其他系统。举个例子我们在登陆了京东金融之后，我们同时也成功登陆京东的京东超市、京东家电等子系统。相关阅读：**[SSO 单点登录看这篇就够了！](docs/system-design/authority-certification/sso.md)**

### 分布式

[分布式相关概念入门](docs/system-design/website-architecture/分布式.md)

#### 分布式搜索引擎

提高搜索效率。常见于电商购物网站的商品搜索于分类。

比较常用的是 Elasticsearch 和 Solr。

代办。

#### RPC

让调用远程服务调用像调用本地方法那样简单。

- [Dubbo 总结：关于 Dubbo 的重要知识点](docs/system-design/data-communication/dubbo.md)
- [服务之间的调用为啥不直接用 HTTP 而用 RPC？](docs/system-design/data-communication/why-use-rpc.md)

#### 消息队列

消息队列在分布式系统中主要是为了解耦和削峰。相关阅读： **[消息队列总结](docs/system-design/data-communication/message-queue.md)** 。

**RabbitMQ:**

1. [RabbitMQ 入门](docs/system-design/data-communication/rabbitmq.md)

**RocketMQ:**

1. [RocketMQ 入门](docs/system-design/data-communication/RocketMQ.md)
2. [RocketMQ 的几个简单问题与答案](docs/system-design/data-communication/RocketMQ-Questions.md)

**Kafka:**

1. **[Kafka 入门+SpringBoot 整合 Kafka 系列](https://github.com/Snailclimb/springboot-kafka)**
2. **[Kafka 常见面试题总结](docs/system-design/data-communication/kafka-inverview.md)**
3. [【加餐】Kafka 入门看这一篇就够了](docs/system-design/data-communication/Kafka入门看这一篇就够了.md)

#### API 网关

网关主要用于请求转发、安全认证、协议转换、容灾。

1. [为什么要网关？你知道有哪些常见的网关系统？](docs/system-design/micro-service/api-gateway-intro.md)
2. [如何设计一个亿级网关(API Gateway)？](docs/system-design/micro-service/API网关.md)

#### 分布式 id

1. [为什么要分布式 id ？分布式 id 生成方案有哪些？](docs/system-design/micro-service/分布式id生成方案总结.md)

#### 分布式限流

1. [限流算法有哪些？](docs/system-design/micro-service/limit-request.md)

#### 分布式接口幂等性

#### ZooKeeper

> 前两篇文章可能有内容重合部分，推荐都看一遍。

1. [【入门】ZooKeeper 相关概念总结 01](docs/system-design/framework/zookeeper/zookeeper-intro.md)
2. [【进阶】ZooKeeper 相关概念总结 02](docs/system-design/framework/zookeeper/zookeeper-plus.md)
3. [【实战】ZooKeeper 实战](docs/system-design/framework/zookeeper/zookeeper-in-action.md)

#### 其他

- 接口幂等性（代办）：分布式系统必须要考虑接口的幂等性。

#### 数据库扩展

读写分离、分库分表。

代办.....

### 大型网站架构

- [8 张图读懂大型网站技术架构](docs/system-design/website-architecture/8%20张图读懂大型网站技术架构.md)
- [关于大型网站系统架构你不得不懂的 10 个问题](docs/system-design/website-architecture/关于大型网站系统架构你不得不懂的10个问题.md)

#### 性能测试

- [后端程序员也要懂的性能测试知识](https://articles.zsxq.com/id_lwl39teglv3d.html) （知识星球）

#### 高并发

待办......

#### 高可用

高可用描述的是一个系统在大部分时间都是可用的，可以为我们提供服务的。高可用代表系统即使在发生硬件故障或者系统升级的时候，服务仍然是可用的 。相关阅读： **《[如何设计一个高可用系统？要考虑哪些地方？](docs/system-design/website-architecture/如何设计一个高可用系统？要考虑哪些地方？.md)》** 。

### 微服务

#### Spring Cloud

- [ 大白话入门 Spring Cloud](docs/system-design/micro-service/spring-cloud.md)

## 必会工具

### Git

- [Git 入门](docs/tools/Git.md)

### Docker

1. [Docker 基本概念解读](docs/tools/Docker.md)
2. [一文搞懂 Docker 镜像的常用操作！](docs/tools/Docker-Image.md)

### 其他

- [【原创】如何使用云服务器？希望这篇文章能够对你有帮助！](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485738&idx=1&sn=f97e91a50e444944076c30b0717b303a&chksm=cea246e1f9d5cff73faf6a778b147ea85162d1f3ed55ca90473c6ebae1e2c4d13e89282aeb24&token=406194678&lang=zh_CN#rd)

## 面试指南

> 这部分很多内容比如大厂面经、真实面经分析被移除，详见[完结撒花！JavaGuide 面试突击版来啦！](./docs/javaguide面试突击版.md)。

1. **[【备战面试 1】程序员的简历就该这样写](docs/essential-content-for-interview/PreparingForInterview/程序员的简历之道.md)**
2. **[【备战面试 2】初出茅庐的程序员该如何准备面试？](docs/essential-content-for-interview/PreparingForInterview/interviewPrepare.md)**
3. **[【备战面试 3】7 个大部分程序员在面试前很关心的问题](docs/essential-content-for-interview/PreparingForInterview/JavaProgrammerNeedKnow.md)**
4. **[【备战面试 4】Github 上开源的 Java 面试/学习相关的仓库推荐](docs/essential-content-for-interview/PreparingForInterview/JavaInterviewLibrary.md)**
5. **[【备战面试 5】如果面试官问你“你有什么问题问我吗？”时，你该如何回答](docs/essential-content-for-interview/PreparingForInterview/面试官-你有什么问题要问我.md)**
6. [【备战面试 6】应届生面试最爱问的几道 Java 基础问题](docs/essential-content-for-interview/PreparingForInterview/应届生面试最爱问的几道Java基础问题.md)
7. **[【备战面试 6】美团面试常见问题总结(附详解答案)](docs/essential-content-for-interview/PreparingForInterview/美团面试常见问题总结.md)**

## Java 学习常见问题汇总

1. [Java 学习路线和方法推荐](docs/questions/java-learning-path-and-methods.md)
2. [Java 培训四个月能学会吗？](docs/questions/java-training-4-month.md)
3. [新手学习 Java，有哪些 Java 相关的博客，专栏，和技术学习网站推荐？](docs/questions/java-learning-website-blog.md)
4. [Java 还是大数据，你需要了解这些东西！](docs/questions/java-big-data.md)

## 资源

### Java 程序员必备书单

1. [「基础篇」Guide 的 Java 后端书架来啦！都是 Java 程序员必看的书籍？](./docs/books/java基础篇.md)

### 实战项目推荐

- **[Java、SpringBoot 实战项目推荐](https://github.com/Snailclimb/awesome-java#实战项目)**

### Github

- [Github 上非常棒的 Java 开源项目集合](https://github.com/Snailclimb/awesome-java)
- [Github 上 Star 数最多的 10 个项目，看完之后很意外!](docs/tools/github/github-star-ranking.md)
- [年末将至，值得你关注的 16 个 Java 开源项目！](docs/github-trending/2019-12.md)
- [Java 项目历史月榜单](docs/github-trending/JavaGithubTrending.md)

---

## 待办

- [x] Netty 总结
- [ ] 数据结构总结重构(---正在进行中---)

## 说明

开源项目在于大家的参与，这才使得它的价值得到提升。感谢 🙏 有你！

项目的 Markdown 格式参考：[Github Markdown 格式](https://guides.github.com/features/mastering-markdown/)，表情素材来自：[EMOJI CHEAT SHEET](https://www.webpagefx.com/tools/emoji-cheat-sheet/)。

利用 docsify 生成文档部署在 Github pages: [docsify 官网介绍](https://docsify.js.org/#/) ，另见[《Guide 哥手把手教你搭建一个文档类型的网站!免费且高速！》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486555&idx=2&sn=8486026ee9f9ba645ff0363df6036184&chksm=cea24390f9d5ca86ff4177c0aca5e719de17dc89e918212513ee661dd56f17ca8269f4a6e303&token=298703358&lang=zh_CN#rd) 。

Logo 下的小图标是使用[Shields.IO](https://shields.io/) 生成的。

## 联系我

![个人微信](https://cdn.jsdelivr.net/gh/javaguide-tech/blog-images/2020-08/wechat3.jpeg)

## 捐赠支持

项目的发展离不开你的支持，如果 JavaGuide 帮助到了你找到自己满意的 offer，请作者喝杯咖啡吧 ☕ 后续会继续完善更新！加油！

[点击捐赠支持作者](https://www.yuque.com/snailclimb/dr6cvl/mr44yt#vu3ok)

## Contributor

下面是笔主收集的一些对本仓库提过有价值的 pr 或者 issue 的朋友，人数较多，如果你也对本仓库提过不错的 pr 或者 issue 的话，你可以加我的微信与我联系。下面的排名不分先后！

<a href="https://github.com/LiWenGu">
    <img src="https://avatars0.githubusercontent.com/u/15909210?s=460&v=4" width="45px">
</a>
<a href="https://github.com/fanofxiaofeng">
    <img src="https://avatars0.githubusercontent.com/u/3983683?s=460&v=4" width="45px">
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

## 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号。

**《Java 面试突击》:** 由本文档衍生的专为面试而生的《Java 面试突击》V2.0 PDF 版本[公众号](#公众号)后台回复 **"Java 面试突击"** 即可免费领取！

**Java 工程师必备学习资源:** 一些 Java 工程师常用学习资源公众号后台回复关键字 **“1”** 即可免费无套路获取。

![我的公众号](https://cdn.jsdelivr.net/gh/javaguide-tech/blog-images/2020-08/167598cd2e17b8ec.png)