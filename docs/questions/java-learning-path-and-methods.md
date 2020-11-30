到目前为止，我觉得不管是在公众号后台、知乎还是微信上面我被问的做多的就是：“大佬，有没有 Java 学习路线和方法”。所以，这部分单独就自己的学习经历来说点自己的看法。

**下面的学习路线以及方法是笔主根据个人学习经历总结改进后得出，我相信照着这条学习路线来你的学习效率会非常高。**

学习某个知识点的过程中如果不知道看什么书的话，可以查看这篇文章 ：[Java 学习必备书籍推荐终极版！](https://github.com/Snailclimb/JavaGuide/blob/master/docs/books/java.md)。

另外，很重要的一点：**建议使用 Intellij IDEA 进行编码，可以单独抽点时间学习 Intellij IDEA 的使用。**

**下面提到的一些视频，[公众号](#公众号 "公众号")后台回复关键“1”即可获取！**

先说一个初学者很容易犯的错误：上来就通过项目学习。

**很多初学者上来就像通过做项目学习，特别是在公司，我觉得这个是不太可取的。** 如果的 Java基础或者 Spring Boot 基础不好的话，建议自己先提前学习一下之后再开始看视频或者通过其他方式做项目。 **还有点事，我不知道为什么大家都会说边跟着项目边学习做的话效果最好，我觉得这个要加一个前提是你对这门技术有基本的了解或者说你对编程有了一定的了解。**

**关于如何学习且听我从一个电商系统网站的创建来说起。假如我们要创建一个基于Java的分布式/微服务电商系统的话，我们可以按照下面的学习路线来做：**

> 首选第一步我们肯定是要从 Java 基础来学习的（如果你没有计算机基础知识的话推荐看一下《计算机导论》这类入门书籍）。

### step 1:Java 基础

**《Java 核心技术卷 1/2》** 和 **《Head First Java》** 这两本书在我看来都是入门 Java 的很不错的书籍 (**《Java 核心技术卷 1/2》** 知识点更全，我更推荐这本书)，我倒是觉得 **《Java 编程思想》** 有点属于新手劝退书的意思，慎看，建议有点基础后再看。你也可以边看视频边看书学习（黑马、尚硅谷、慕课网的视频都还行）。对于 Java8 新特性的东西，我建议你基础学好之后可以看一下，暂时看不太明白也没关系，后面抽时间再回过头来看。

看完之后，你可以用自己学的东西实现一个简单的 Java 程序，也可以尝试用 Java 解决一些编程问题，以此来将自己学到的东西付诸于实践。

**不太建议学习 Java基础的时候通过做游戏来巩固。为什么培训班喜欢通过这种方式呢？说白点就是为了找到你的G点（不好意思开车了哈）。新手学习完Java基础后做游戏一般是不太现实的，还不如找一些简单的程序问题解决一下比如简单的算法题。**

**记得多总结！打好基础！把自己重要的东西都记录下来。** API 文档放在自己可以看到的地方，以备自己可以随时查阅。为了能让自己写出更优秀的代码，**《Effective Java》**、**《重构》** 这两本书没事也可以看看。

另外，学习完之后可以看一下下面这几篇文章，检查一下自己的学习情况。这几篇文章不是我吹，可能是全网最具价值的 Java 基础知识总结，毕竟是在我的 JavaGuide开源的，经过了各路大佬以及我的不断完善。

这几篇文章总结的知识点在 Java 后端面试中的出场率也非常高哦！

1. [**Java 基础知识**](https://snailclimb.gitee.io/javaguide/#/docs/java/Java基础知识)
2. [**Java 基础知识疑难点/易错点**](https://snailclimb.gitee.io/javaguide/#/docs/java/Java疑难点)
3. [【加餐】一些重要的Java程序设计题](https://snailclimb.gitee.io/javaguide/#/docs/java/Java程序设计题)
4. [【选看】J2EE 基础知识](https://snailclimb.gitee.io/javaguide/#/docs/java/J2EE基础知识)

> 我们的网站需要运行在“操作系统”之上（一般是部署在Linux系统），并且我们与网站的每次交互都需要经过“网络”，需要经历三次握手和四次挥手才能简历连接，需要HTTP才能发出请求已经拿到网站后台的相应。所以第二步，我推荐可以适当花时间看一下 **操作系统与计算机网络 方面的知识。** 但是，不做强求！你抽时间一定要补上就行！

### step 2(可选):操作系统与计算机网络

操作系统这方面我觉得掌握操作系统的基础知识和 Linux 的常用命令就行以及一些重要概念就行了。

关于操作系统的话，我没有什么操作系统方面的书籍可以推荐，因为我自己也没认真看过几本。因为操作系统比较枯燥的原因，我建议这部分看先看视频学可能会比较好一点。我推荐一个 Github 上开源的哈工大《操作系统》课程给大家吧！地址：https://github.com/hoverwinter/HIT-OSLab 。

另外，对于 Linux 我们要掌握基本的使用就需要对一些常用命令非常熟悉比如：目录切换命令、目录操作命令、文件的操作命令、压缩或者解压文件的命令等等。推荐一个 Github 上学习 Linux 的开源文档：[《Java 程序员眼中的 Linux》](https://github.com/judasn/Linux-Tutorial "《Java 程序员眼中的 Linux》")

计算机网络方面的学习，我觉得掌握基本的知识就行了，不需要太深究，一般面试对这方面要求也不高，毕竟不是专门做网络的。推荐 **《网络是怎样连接的》** 、**《图解 HTTP》** 这两本书来看，这两本书都属于比较有趣易懂的类型，也适合没有基础的人来看。

> 我们写程序的都知道一个公式叫做 **“程序设计 = 算法 + 数据结构”**。我们想让我们的网站的地盘更加牢固的话，我觉得数据结构与算法还是很有必要学习的。所以第三步，我推荐可以适当花时间看一下 **数据结构与算法** 但是，同样不做强求！你抽时间一定要补上就行！

### step 3(可选):数据结构与算法

如果你想进入大厂的话，我推荐你在学习完 Java基础之后，就开始每天抽出一点时间来学习算法和数据结构。为了提高自己的编程能力，你也可以坚持刷 **[Leetcode](https://leetcode-cn.com "Leetcode")**。就目前国内外的大厂面试来说，刷 Leetcode 可以说已经成了不得不走的一条路。

对于想要入门算法和数据结构的朋友，建议看这两本书 **《算法图解》** 和 **《大话数据结构》**，这两本书虽然算不上很经典的书籍，但是比较有趣，对于刚入门算法和数据结构的朋友非常友好。**《算法导论》** 非常经典，但是对于刚入门的就不那么友好了。

另外，还有一本非常赞的算法书推荐给各位，这本书的名字就叫 **《算法》**，书中的代码都是用 Java 语言编写。这本书的优点太多太多比如它的讲解基础而全面、对阅读者比较友好等等。我觉得这本书唯一的缺点就是太厚了 (小声 BB，可能和作者讲解某些知识点的时候有点啰嗦有关)。除了这本书之外，**《剑指 offer》** 、**《编程珠玑》** 、**《编程之美》** 这三本书都被很多大佬推荐过了，对于算法面试非常有帮助。**《算法之美》** 这本书也非常不错，非常适合闲暇的时候看。

> 我们网站的页面搭建需要前端的知识，我们前端也后端的交互也需要前端的知识。所以第四步，我推荐你可以了解一下前端知识，不过不需要学的太精通。自己对与前端知识有了基本的了解之后通过

### step 4:前端知识

这一步主要是学习前端基础 (HTML、CSS、JavaScript),当然 BootStrap、Layui 等等比较简单的前端框架你也可以了解一下。网上有很多这方面资源，我只推荐一个大部分初学这些知识都会看的网站：http://www.w3school.com.cn/ ，这个网站用来回顾知识也很不错 。推荐先把 HTML、CSS、JS 的基础知识过一遍，然后通过一个实际的前端项目来巩固。

另外，没记错的话 Spring Boot官方推荐的是模板引擎是 thymeleaf ，这东西和HTML很像，了解了基本语法之后很容易上手。 结合layui,booystrap这些框架的话也能做成比较美观的页面。开发一些简单的页面比如一个后端项目就是为了做个简单的前端页面做某些操作的话直接用thymeleaf就好。

现在都是前后端分离，就目前来看大部分项目都优先选择 React、Angular、Vue 这些厉害的框架来开发，这些框架的上手要求要高一些。如果你想往全栈方向发展的话（笔主目前的方向，我用 React 在公司做过两个小型项目），建议先把 JS 基础打好，然后再选择 React、Angular、Vue 其中的一个来认真学习一下。国内使用 Vue 比较多一点，国外一般用的是 React 和 Angular。

 如何和后端交互呢？一般使用在 React、Vue这些框架的时候使用Axios比较多。

> 我们网站的数据比如用户信息、订单信息都需要存储，所以，下一步我推荐你学习 MySQl这个被广泛运用于各大网站的数据库。不光要学会如何写 sql 语句，更好的是还要搞清诸如索引这类重要的概念。

### step 5:MySQL

学习 MySQL 的基本使用，基本的增删改查，SQL 命令，索引、存储过程这些都学一下吧！推荐书籍 **《SQL 基础教程（第 2 版）》**（入门级）、**《高性能 MySQL : 第 3 版》**(进阶)、**《MySQL 必知必会》**。

下面这些 MySQL 相关的文章强烈推荐你看看：

1. [**【推荐】MySQL/数据库 知识点总结**](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL)
2. [**阿里巴巴开发手册数据库部分的一些最佳实践**](https://snailclimb.gitee.io/javaguide/#/docs/database/阿里巴巴开发手册数据库部分的一些最佳实践)
3. [**一千行MySQL学习笔记**](https://snailclimb.gitee.io/javaguide/#/docs/database/一千行MySQL命令)
4. [MySQL高性能优化规范建议](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL高性能优化规范建议)
5. [数据库索引总结](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL Index)
6. [事务隔离级别(图文详解)](https://snailclimb.gitee.io/javaguide/#/docs/database/事务隔离级别(图文详解))
7. [一条SQL语句在MySQL中如何执行的](https://snailclimb.gitee.io/javaguide/#/docs/database/一条sql语句在mysql中如何执行的) 

> 正式开发之前我们还要一些准备工具比如熟悉你的ide，熟悉Maven来帮助我们引入相关jar依赖，使用 Docker来帮助我们安装常用的软件。

### step 6:常用工具

非常重要！非常重要！特别是 Git和 Docker。

1. **IDEA**：熟悉基本操作以及常用快捷。
2. **Maven** ：建议学习常用框架之前可以提前花半天时间学习一下**Maven**的使用。（到处找 Jar 包，下载 Jar 包是真的麻烦费事，使用 Maven 可以为你省很多事情）。
3. **Git** ：基本的 Git 技能也是必备的，试着在学习的过程中将自己的代码托管在 Github 上。（[Git 入门](https://github.com/Snailclimb/JavaGuide/blob/master/docs/tools/Git.md)）
4. **Docker** ：学着用 Docker 安装学习中需要用到的软件比如 MySQL ,这样方便很多，可以为你节省不少时间。（[Docker 入门](https://github.com/Snailclimb/JavaGuide/blob/master/docs/tools/Docker.md)）

> 利用常用框架可以极大程度简化我们的开发工作。学习完了常用工具之后，我们就可以开始常用框架的学习啦！

### step 7:常用框架

学习 Struts2(可不用学)、**Spring**、**SpringMVC**、**Hibernate**、**Mybatis**、**shiro** 等框架的使用， (可选) 熟悉 **Spring 原理**（大厂面试必备），然后很有必要学习一下 **SpringBoot** ，**学好 SpringBoot 真的很重要**。很多公司对于应届生都是直接上手 **SpringBoot**，不过如果时间允许的话，我还是推荐你把 **Spring**、**SpringMVC** 提前学一下。

关于 SpringBoot ，推荐看一下笔主开源的 [Spring Boot 教程](https://github.com/Snailclimb/springboot-guide "Spring Boot 教程") （SpringBoot 核心知识点总结。 基于 Spring Boot 2.19+）。

**Spring 真的很重要！** 一定要搞懂 AOP 和 IOC 这两个概念。Spring 中 bean 的作用域与生命周期、SpringMVC 工作原理详解等等知识点都是非常重要的，一定要搞懂。

推荐看文档+视频结合的方式，中途配合实战来学习，学习期间可以多看看 JavaGuide 对于[常用框架的总结](https://github.com/Snailclimb/JavaGuide#%E5%B8%B8%E7%94%A8%E6%A1%86%E6%9E%B6 "常用框架的总结")。

**另外，都 2019 年了，咱千万不要再学 JSP 了好不？**

推荐阅读：

#### [Spring](https://snailclimb.gitee.io/javaguide/#/?id=spring)

1. [Spring 学习与面试](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/Spring)
2. **[Spring 常见问题总结](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/SpringInterviewQuestions)**
3. [Spring中 Bean 的作用域与生命周期](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/SpringBean)
4. [SpringMVC 工作原理详解](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/SpringMVC-Principle)
5. [Spring中都用到了那些设计模式?](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/Spring-Design-Patterns)

#### [SpringBoot](https://snailclimb.gitee.io/javaguide/#/?id=springboot)

- **[SpringBoot 指南/常见面试题总结](https://github.com/Snailclimb/springboot-guide)**

#### [MyBatis](https://snailclimb.gitee.io/javaguide/#/?id=mybatis)

- [MyBatis常见面试题总结](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/mybatis/mybatis-interview)

### step 8:多线程的简单使用

多线程这部分内容可能会比较难以理解和上手，前期可以先简单地了解一下基础，到了后面有精力和能力后再回来仔细看。推荐 **《Java 并发编程之美》** 或者 **《实战 Java 高并发程序设计》** 这两本书。我目前也在重构一份我之前写的多线程学习指南，后面会更新在公众号里面。

学习完多线程之后可以通过下面这些问题检测自己是否掌握。

**Java 多线程知识基础:**

1. 什么是线程和进程?
2. 请简要描述线程与进程的关系,区别及优缺点？
3. 说说并发与并行的区别?
4. 为什么要使用多线程呢?
5. 使用多线程可能带来什么问题?
6. 说说线程的生命周期和状态?
7. 什么是上下文切换?
8. 什么是线程死锁?如何避免死锁?
9. 说说 sleep() 方法和 wait() 方法区别和共同点?
10. 为什么我们调用 start() 方法时会执行 run() 方法，为什么我们不能直接调用 run() 方法？

**Java 多线程知识进阶：**

1. synchronized 关键字:① 说一说自己对于 synchronized 关键字的了解；② 说说自己是怎么使用 synchronized 关键字，在项目中用到了吗;③ 讲一下 synchronized 关键字的底层原理；④ 说说 JDK1.6 之后的 synchronized 关键字底层做了哪些优化，可以详细介绍一下这些优化吗；⑤ 谈谈 synchronized 和 ReentrantLock 的区别。
2. volatile 关键字： ① 讲一下 Java 内存模型；② 说说 synchronized 关键字和 volatile 关键字的区别。
3. ThreadLocal：① 简介；② 原理；③ 内存泄露问题。
4. 线程池：① 为什么要用线程池？；② 实现 Runnable 接口和 Callable 接口的区别；③ 执行 execute() 方法和 submit() 方法的区别是什么呢？；④ 如何创建线程池。
5. Atomic 原子类: ① 介绍一下 Atomic 原子类；② JUC 包中的原子类是哪 4 类?；③ 讲讲 AtomicInteger 的使用；④ 能不能给我简单介绍一下 AtomicInteger 类的原理。
6. AQS ：① 简介；② 原理；③ AQS 常用组件。

### **step 9:分布式**

1. 学习 **Dubbo、Zookeeper来实现简单的分布式服务**
2. **学习 Redis** 来提高访问速度，减少对 MySQL数据库的依赖；
3. **学习 Elasticsearch** 的使用，来为我们的网站增加搜索功能
4. 学习常见的**消息队列**（比如**RabbitMQ、Kafka**）来解耦我们的服务(ActiveMq不要学了，已经淘汰)；
5. ......

到了这一步你应该是有基础的一个 Java程序员了，我推荐你可以通过一个分布式项目来学习。觉得应该是掌握这些知识点比较好的一种方式了，另外，**推荐边看视频边自己做，遇到不懂的知识点要及时查阅网上博客和相关书籍，这样学习效果更好。**

**一定要学会拓展知识，养成自主学习的意识。** 黑马项目对这些知识点的介绍都比较蜻蜓点水。

> 继续深入学习的话，我们要了解Netty、JVM这些东西。

### step 10:深入学习

可以再回来看一下多线程方面的知识，还可以利用业余时间学习一下 **[NIO](https://github.com/Snailclimb/JavaGuide#io "NIO")** 和 **Netty** ，这样简历上也可以多点东西。如果想去大厂，**[JVM](https://github.com/Snailclimb/JavaGuide#jvm "JVM")** 的一些知识也是必学的（**Java 内存区域、虚拟机垃圾算法、虚拟垃圾收集器、JVM 内存管理**）推荐《深入理解 Java 虚拟机：JVM 高级特性与最佳实践（最新第二版》和《实战 Java 虚拟机》，如果嫌看书麻烦的话，你也可以看我整理的文档。

另外，现在微服务特别火，很多公司在面试也明确要求需要微服务方面的知识。如果有精力的话可以去学一下 SpringCloud 生态系统微服务方面的东西。

> **微服务的概念庞大，技术种类也很多，但是目前大型互联网公司广泛采用的，**实话实话这些东西我不在行，自己没有真实做过微服务的项目。不过下面是我自己总结的一些关于微服务比价重要的知识，选学。

### step 11:微服务

这部分太多了，选择性学习。

相关技术：

1. **网关** :kong,soul；
2. **分布式调用链**： SkyWalking、Zipkin
3. **日志系统：** Kibana
4. ......

Spring Cloud 相关：

1. Eureka：服务注册与发现；
2. Ribbon：负载均衡；
3. Hytrix ：熔断；
4. Zuul ：网关；
5. Spring Cloud Config：配置中心；

Spring Cloud Alibaba也是很值得学习的：

1. **[Sentinel](https://github.com/alibaba/Sentinel "Sentinel")** ：A lightweight powerful flow control component enabling reliability and monitoring for microservices. (轻量级的流量控制、熔断降级 Java 库)。
2. **[dubbo](https://github.com/apache/dubbo "dubbo")** ：Apache Dubbo 是一个基于 Java 的高性能开源 RPC 框架。
3. **[nacos](https://github.com/alibaba/nacos "nacos")** ：Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。Nacos 可以作为 Dubbo 的注册中心来使用。
4. **[seata](https://github.com/seata/seata "seata")** : Seata 是一种易于使用，高性能，基于 Java 的开源分布式事务解决方案。
5. **[RocketMQ](https://github.com/apache/rocketmq "RocketMQ")** ：阿里巴巴开源的一款高性能、高吞吐量的分布式消息中间件。

### 总结

我上面主要概括一下每一步要学习的内容，对学习规划有一个建议。知道要学什么之后，如何去学呢？我觉得学习每个知识点可以考虑这样去入手：

1. **官网（大概率是英文，不推荐初学者看）**。
2. **书籍（知识更加系统完全，推荐）**。
3. **视频（比较容易理解，推荐，特别是初学的时候。慕课网和哔哩哔哩上面有挺多学习视频可以看，只直接在上面搜索关键词就可以了）**。
4. **网上博客（解决某一知识点的问题的时候可以看看）**。

这里给各位一个建议，**看视频的过程中最好跟着一起练，要做笔记！！！**

**最好可以边看视频边找一本书籍看，看视频没弄懂的知识点一定要尽快解决，如何解决？**

首先百度/Google，通过搜索引擎解决不了的话就找身边的朋友或者认识的一些人。另外，一定要进行项目实战！很多人这时候就会问没有实际项目让我做怎么办？我觉得可以通过下面这几种方式：

1. 在网上找一个符合自己能力与找工作需求的实战项目视频或者博客跟着老师一起做。做的过程中，你要有自己的思考，不要浅尝辄止，对于很多知识点，别人的讲解可能只是满足项目就够了，你自己想多点知识的话，对于重要的知识点就要自己学会去往深处学。
2. Github 或者码云上面有很多实战类别项目，你可以选择一个来研究，为了让自己对这个项目更加理解，在理解原有代码的基础上，你可以对原有项目进行改进或者增加功能。
3. 自己动手去做一个自己想完成的东西，遇到不会的东西就临时去学，现学现卖(这种方式比较难，初学不推荐用这种方式，因为你脑海中没有基本的概念，写出来的代码一般会很难或者根本就做不出来一个像样的东西)。
4. ......

**做项目不光要做，还要改进，改善。另外，如果你的老师有相关 Java 后台项目的话，你也可以主动申请参与进来。**

**一定要学会分配自己时间，要学的东西很多，真的很多，搞清楚哪些东西是重点，哪些东西仅仅了解就够了。一定不要把精力都花在了学各种框架上，算法和数据结构真的很重要！**

另外，**学习的过程中有一个可以参考的文档很重要，非常有助于自己的学习**。我当初弄 JavaGuide： https://github.com/Snailclimb/JavaGuide 的很大一部分目的就是因为这个。**客观来说，相比于博客，JavaGuide 里面的内容因为更多人的参与变得更加准确和完善。**

### 公众号

如果大家想要实时关注我更新的文章以及分享的干货的话，可以关注我的公众号。

**《Java 面试突击》:** 由本文档衍生的专为面试而生的《Java 面试突击》V2.0 PDF 版本[公众号](#公众号 "公众号")后台回复 **"Java 面试突击"** 即可免费领取！

**Java 工程师必备学习资源:** 一些 Java 工程师常用学习资源公众号后台回复关键字 **“1”** 即可免费无套路获取。

![我的公众号](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-6/167598cd2e17b8ec.png)
