
为了优化大家的阅读体验，我重新进行了排版，并且增加了较为详细的目录供大家参考！如果有老哥对操作系统比较重要的知识总结过的话，欢迎找我哦！
一些常用资源[公众号](#公众号)后台回复关键字“1”即可免费无套路获取。

【限时福利】极客时间[《Java 并发编程面试必备》](#Java并发编程专栏)专栏限时特惠，购买之后的小伙伴加 [我的微信](#我的微信) 报上自己的极客时间大名可以找我会把24元返现退给大家，减轻各位学习成本。

<div align="center">  
<img src="http://my-blog-to-use.oss-cn-beijing.aliyuncs.com/18-11-16/49833984.jpg" width=""/>
</br>

[![QQ群](https://img.shields.io/badge/QQ%E7%BE%A4-984466017-red.svg)](//shang.qq.com/wpa/qunwpa?idkey=10aee68bd241e739e59a8dfb0d4b33690bd3a4b5af0d09142cbdae2cb8c3966a)
</br>
微信交流群添加 [我的微信](#我的微信) 后回复关键字“加群”即可入群。

</div>



## 目录

- [:coffee: Java](#coffee-java)
  - [Java/J2EE 基础](#javaj2ee-基础)
  - [Java 集合框架](#java-集合框架)
  - [Java 多线程](#java-多线程)
  - [Java BIO,NIO,AIO](#java-bionioaio)
  - [Java 虚拟机 jvm](#java-虚拟机-jvm)
- [:open_file_folder: 数据结构与算法](#open_file_folder-数据结构与算法)
  - [数据结构](#数据结构)
  - [算法](#算法)
- [:computer: 计算机网络与数据通信](#computer-计算机网络与数据通信)
  - [网络相关](#网络相关)
  - [数据通信\(RESTful,RPC,消息队列\)总结](#数据通信restfulrpc消息队列总结)
- [:iphone: 操作系统](#iphone-操作系统)
  - [Linux相关](#linux相关)
- [:pencil2: 主流框架/软件](#pencil2-主流框架软件)
  - [Spring](#spring)
  - [ZooKeeper](#zookeeper)
- [:floppy_disk: 数据存储](#floppy_disk-数据存储)
  - [MySQL](#mysql)
  - [Redis](#redis)
- [:punch: 架构](#punch-架构)
- [:musical_note: 面试必备](#musical_note-面试必备)
  - [备战春招/秋招系列](#备战春招秋招系列)
  - [最最最常见的Java面试题总结](#最最最常见的java面试题总结)
  - [Java学习/面试开源仓库推荐](#java学习面试开源仓库推荐)
- [:art: 闲谈](#art-闲谈)
- [:envelope: 说明](#envelope-说明)

## 待办

- [ ] Java 8 新特性总结
- [x] BIO,NIO,AIO 总结 
- [ ] Netty 总结
- [ ] 数据结构总结重构

  
## :coffee: Java

### Java/J2EE 基础

* [Java 基础知识回顾](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/Java基础知识.md)
* [J2EE 基础知识回顾](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/J2EE基础知识.md)
* [static、final、this、super关键字总结](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/final、static、this、super.md) 
* [static 关键字详解](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/static.md)   
    
### Java 集合框架

* [这几道Java集合框架面试题几乎必问](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/这几道Java集合框架面试题几乎必问.md)
* [Java 集合框架常见面试题总结](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/Java集合框架常见面试题总结.md)
* [ArrayList 源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/ArrayList.md) 
* [【面试必备】透过源码角度一步一步带你分析 ArrayList 扩容机制](https://github.com/Snailclimb/JavaGuide/blob/master/Java相关/ArrayList-Grow.md)    
* [LinkedList 源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/LinkedList.md)   
* [HashMap(JDK1.8)源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/HashMap.md)  
   
### Java 多线程
* [多线程系列文章](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/多线程系列.md)
* [并发编程面试必备：synchronized 关键字使用、底层原理、JDK1.6 之后的底层优化以及 和ReenTrantLock 的对比](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/synchronized.md)
* [并发编程面试必备：乐观锁与悲观锁](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/面试必备之乐观锁与悲观锁.md)
* [并发编程面试必备：JUC 中的 Atomic 原子类总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/Atomic.md)
* [并发编程面试必备：AQS 原理以及 AQS 同步组件总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/AQS.md)
* [BATJ都爱问的多线程面试题](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/BATJ都爱问的多线程面试题.md)
* [并发容器总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/并发容器总结.md)

### Java 虚拟机 jvm

* [可能是把Java内存区域讲的最清楚的一篇文章](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/可能是把Java内存区域讲的最清楚的一篇文章.md)
* [搞定JVM垃圾回收就是这么简单](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/搞定JVM垃圾回收就是这么简单.md)
* [《深入理解Java虚拟机》第2版学习笔记](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Java虚拟机（jvm）.md)


### Java BIO,NIO,AIO

* [BIO,NIO,AIO 总结 ](https://github.com/Snailclimb/JavaGuide/blob/master/Java%E7%9B%B8%E5%85%B3/BIO%2CNIO%2CAIO%20summary.md)
* [Java IO 与 NIO系列文章](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Java%20IO与NIO.md)

### 设计模式

* [设计模式系列文章](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/设计模式.md)

## :open_file_folder: 数据结构与算法
   
### 数据结构

* [数据结构知识学习与面试](https://github.com/Snailclimb/Java_Guide/blob/master/数据结构与算法/数据结构.md)

### 算法

* [算法学习与面试](https://github.com/Snailclimb/Java_Guide/blob/master/数据结构与算法/算法.md)  
* [常见安全算法（MD5、SHA1、Base64等等）总结](https://github.com/Snailclimb/Java_Guide/blob/master/数据结构与算法/常见安全算法（MD5、SHA1、Base64等等）总结.md)
* [算法总结——几道常见的子符串算法题 ](https://github.com/Snailclimb/Java_Guide/blob/master/数据结构与算法/搞定BAT面试——几道常见的子符串算法题.md)
* [算法总结——几道常见的链表算法题 ](https://github.com/Snailclimb/Java_Guide/blob/master/数据结构与算法/Leetcode-LinkList1.md)   

## :computer: 计算机网络与数据通信

### 网络相关

* [计算机网络常见面试题](https://github.com/Snailclimb/Java_Guide/blob/master/计算机网络与数据通信/计算机网络.md)
* [计算机网络基础知识总结](https://github.com/Snailclimb/Java_Guide/blob/master/计算机网络与数据通信/干货：计算机网络知识总结.md)
* [HTTPS中的TLS](https://github.com/Snailclimb/Java_Guide/blob/master/计算机网络与数据通信/HTTPS中的TLS.md)

### 数据通信(RESTful,RPC,消息队列)总结

* [数据通信(RESTful、RPC、消息队列)相关知识点总结](https://github.com/Snailclimb/Java-Guide/blob/master/计算机网络与数据通信/数据通信(RESTful、RPC、消息队列).md)
* [Dubbo 总结：关于 Dubbo 的重要知识点](https://github.com/Snailclimb/Java-Guide/blob/master/计算机网络与数据通信/dubbo.md)
* [消息队列总结：新手也能看懂，消息队列其实很简单](https://github.com/Snailclimb/Java-Guide/blob/master/计算机网络与数据通信/message-queue.md)
* [一文搞懂 RabbitMQ 的重要概念以及安装](https://github.com/Snailclimb/Java-Guide/blob/master/计算机网络与数据通信/rabbitmq.md)

## :iphone: 操作系统

### Linux相关

* [后端程序员必备的 Linux 基础知识](https://github.com/Snailclimb/Java-Guide/blob/master/操作系统/后端程序员必备的Linux基础知识.md)  
* [Shell 编程入门](https://github.com/Snailclimb/Java-Guide/blob/master/操作系统/Shell.md)  
## :pencil2: 主流框架/软件

### Spring

* [Spring 学习与面试](https://github.com/Snailclimb/Java_Guide/blob/master/主流框架/Spring学习与面试.md)
* [Spring中bean的作用域与生命周期](https://github.com/Snailclimb/Java_Guide/blob/master/主流框架/SpringBean.md)
* [SpringMVC 工作原理详解](https://github.com/Snailclimb/JavaGuide/blob/master/主流框架/SpringMVC%20%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86%E8%AF%A6%E8%A7%A3.md)

### ZooKeeper

* [可能是把 ZooKeeper 概念讲的最清楚的一篇文章](https://github.com/Snailclimb/Java_Guide/blob/master/主流框架/ZooKeeper.md)
* [ZooKeeper 数据模型和常见命令了解一下，速度收藏！](https://github.com/Snailclimb/Java_Guide/blob/master/主流框架/ZooKeeper数据模型和常见命令.md)
  
## :floppy_disk: 数据存储

### MySQL

* [MySQL 学习与面试](https://github.com/Snailclimb/Java_Guide/blob/master/数据存储/MySQL.md)
* [【思维导图-索引篇】搞定数据库索引就是这么简单](https://github.com/Snailclimb/Java_Guide/blob/master/数据存储/MySQL%20Index.md)

### Redis

* [Redis 总结](https://github.com/Snailclimb/Java_Guide/blob/master/数据存储/Redis/Redis.md)
* [Redlock分布式锁](https://github.com/Snailclimb/Java_Guide/blob/master/数据存储/Redis/Redlock分布式锁.md)
* [如何做可靠的分布式锁，Redlock真的可行么](https://github.com/Snailclimb/Java_Guide/blob/master/数据存储/Redis/如何做可靠的分布式锁，Redlock真的可行么.md)

## :punch: 架构

* [一文读懂分布式应该学什么](https://github.com/Snailclimb/Java_Guide/blob/master/架构/分布式.md)
* [8 张图读懂大型网站技术架构](https://github.com/Snailclimb/JavaGuide/blob/master/架构/8%20张图读懂大型网站技术架构.md)
* [【面试精选】关于大型网站系统架构你不得不懂的10个问题](https://github.com/Snailclimb/JavaGuide/blob/master/架构/【面试精选】关于大型网站系统架构你不得不懂的10个问题.md)

## :musical_note: 面试必备

### 备战春招/秋招系列

* [【备战春招/秋招系列1】程序员的简历就该这样写](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/程序员的简历之道.md)
* [手把手教你用Markdown写一份高质量的简历](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/手把手教你用Markdown写一份高质量的简历.md)
* [【备战春招/秋招系列2】初出茅庐的程序员该如何准备面试？](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/interviewPrepare.md)
* [【备战春招/秋招系列3】Java程序员必备书单](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/books.md)   
* [ 【备战春招/秋招系列4】美团面经总结基础篇 （附详解答案）](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/美团-基础篇.md)
* [ 【备战春招/秋招系列5】美团面经总结进阶篇 （附详解答案）](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/美团-进阶篇.md)
* [ 【备战春招/秋招系列5】美团面经总结终结篇篇 （附详解答案）](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/美团-终结篇.md)

### 最最最常见的Java面试题总结
   
这里会分享一些出现频率极其极其高的面试题，初定周更一篇，什么时候更完什么时候停止。
   
* [第一周（2018-8-7）](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/最最最常见的Java面试题总结/第一周（2018-8-7）.md) (为什么 Java 中只有值传递、==与equals、 hashCode与equals)
* [第二周（2018-8-13）](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/最最最常见的Java面试题总结/第二周(2018-8-13).md)(String和StringBuffer、StringBuilder的区别是什么？String为什么是不可变的？、什么是反射机制？反射机制的应用场景有哪些？......)
* [第三周（2018-08-22）](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/这几道Java集合框架面试题几乎必问.md) （Arraylist 与 LinkedList 异同、ArrayList 与 Vector 区别、HashMap的底层实现、HashMap 和 Hashtable 的区别、HashMap 的长度为什么是2的幂次方、HashSet 和 HashMap 区别、ConcurrentHashMap 和 Hashtable 的区别、ConcurrentHashMap线程安全的具体实现方式/底层具体实现、集合框架底层数据结构总结）
* [第四周(2018-8-30).md](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/最最最常见的Java面试题总结/第四周(2018-8-30).md) （主要内容是几道面试常问的多线程基础题。）

### Java学习/面试开源仓库推荐

* [盘点一下Github上开源的Java面试/学习相关的仓库，看完弄懂薪资至少增加10k](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/JavaInterviewGithub.md)
    
## :art: 闲谈  

* [选择技术方向都要考虑哪些因素](https://github.com/Snailclimb/Java-Guide/blob/master/其他/选择技术方向都要考虑哪些因素.md) 
* [结束了我短暂的秋招，说点自己的感受](https://github.com/Snailclimb/JavaGuide/blob/master/%E5%85%B6%E4%BB%96/2018%20%E7%A7%8B%E6%8B%9B.md) 
* [这7个问题，可能大部分Java程序员都比较关心吧！](https://github.com/Snailclimb/JavaGuide/blob/master/%E9%9D%A2%E8%AF%95%E5%BF%85%E5%A4%87/java%20programmer%20need%20know.md)
* [【2018总结】即使平凡，也要热爱自己的生活](https://github.com/Snailclimb/JavaGuide/blob/master/%E5%85%B6%E4%BB%96/2018%20summary.md)

***

## :envelope: 说明

### 项目介绍

该文档主要是笔主在学习 Java 的过程中的一些学习笔记，但是为了能够涉及到大部分后端学习所需的技术知识点我也会偶尔引用一些别人的优秀文章的链接。文档大部分内容都是笔者参考书籍以及自己的原创。少部分面试题回答参考了其他人已有答案，上面都已注明。

该文档涉及的主要内容包括： Java、 数据结构与算法、计算机网络与数据通信、 操作系统、主流框架、数据存储、架构、面试必备知识点等等。相信不论你是前端还是后端都能在这份文档中收获到东西。

### 关于转载

**如果需要引用到本仓库的一些东西，必须注明转载地址！！！毕竟大多都是手敲的，或者引用的是我的原创文章，希望大家尊重一下作者的劳动**:smiley::smiley::smiley:！

### 如何对该开源文档进行贡献

1. 笔记内容大多是手敲，所以难免会有笔误，你可以帮我找错别字。
2. 很多知识点我可能没有涉及到，所以你可以对其他知识点进行补充。
3. 现有的知识点难免存在不完善或者错误，所以你可以对已有知识点的修改/补充。

### 为什么要做这个开源文档？

在我们学习Java的时候，很多人会面临我不知道继续学什么或者面试会问什么的尴尬情况（我本人之前就很迷茫:smile:）。所以，我决定通过这个开源平台来帮助一些有需要的人，通过下面的内容，你会掌握系统的Java学习以及面试的相关知识。本来是想通过Gitbook的形式来制作的，后来想了想觉得可能有点大题小做 :grin: 。另外，我自己一个人的力量毕竟有限，希望各位有想法的朋友可以提issue。开源的最大目的是，让更多人参与进来，这样文档的正确性才能得以保障！

### 最后

本人会利用业余时间一直更新下去，目前还有很多地方不完善，一些知识点我会原创总结，还有一些知识点如果说网上有比较好的文章了，我会把这些文章加入进去。您也可以关注我的微信公众号：“Java面试通关手册”，我会在这里分享一些自己的原创文章。 另外该文档格式参考：[Github Markdown格式](https://guides.github.com/features/mastering-markdown/)，表情素材来自：[EMOJI CHEAT SHEET](https://www.webpagefx.com/tools/emoji-cheat-sheet/)。如果大家需要与我交流，可以扫描下方二维码添加我的微信：

### 我的微信

![我的微信](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-2/JavaGuide.jpg)

### Java并发编程专栏

微信扫描下方二维码，购买之后我会将自己得到的24元返现都还给你，减轻各位的学习成本！

![ Java并发编程专栏](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-2/Java并发编程实战.jpg)

### 致谢

下面是笔主收集的一些对本仓库提过有价值的pr或者issue的朋友，人数较多，如果你也对本仓库提过不错的pr或者issue的话，你可以加我的微信与我联系。下面的排名不分先后！

<a href="https://github.com/fanofxiaofeng">
    <img src="https://avatars0.githubusercontent.com/u/3983683?s=460&v=4" width="45px"></a>
<a href="https://github.com/Gene1994">
    <img src="https://avatars3.githubusercontent.com/u/24930369?s=460&v=4" width="45px">
</a>
<a href="https://github.com/illusorycloud">
    <img src="https://avatars3.githubusercontent.com/u/31980412?s=460&v=4" width="45px">
</a>
<a href="https://github.com/LiWenGu">
    <img src="https://avatars0.githubusercontent.com/u/15909210?s=460&v=4" width="45px">
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
### 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号。我是 ThoughtWorks 准入职Java工程师。专注Java知识分享！开源 Java 学习指南——JavaGuide（12k+ Star）的作者。公众号多篇文章被各大技术社区转载。公众号后台回复关键字“1”可以领取一份我精选的Java资源哦！可以扫描下方二维码或者通过微信的搜一搜搜索ID：“Java_Guide”即可。


![我的公众号](https://user-gold-cdn.xitu.io/2018/11/28/167598cd2e17b8ec?w=258&h=258&f=jpeg&s=27334)
