

# Spring相关教程/资料：

> ## 官网相关

 [Spring官网](https://spring.io/)

[Spring系列主要项目](https://spring.io/projects)

从配置到安全性，Web应用到大数据 - 无论您的应用程序的基础架构需求如何，都有一个Spring Project来帮助您构建它。 从小处着手，根据需要使用 - Spring是通过设计模块化的。

 [Spring官网指南](https://spring.io/guides)

无论您在构建什么，这些指南都旨在尽可能快地提高您的工作效率 - 使用Spring团队推荐的最新Spring项目发布和技术。

 [Spring官方文档翻译（1~6章）](https://blog.csdn.net/tangtong1/article/details/51326887)

> ##   系统学习教程：

### 文档：

 [极客学院Spring Wiki](http://wiki.jikexueyuan.com/project/spring/transaction-management.html)

 [Spring W3Cschool教程 ](https://www.w3cschool.cn/wkspring/f6pk1ic8.html)

### 视频：

[网易云课堂——58集精通java教程Spring框架开发](http://study.163.com/course/courseMain.htm?courseId=1004475015#/courseDetail?tab=1&35)

 [慕课网相关视频](https://www.imooc.com/)

**黑马视频（非常推荐）：**
微信公众号：“**Java面试通关手册**”后台回复“**资源分享第一波**”免费领取。

> ## 一些常用的东西

[Spring Framework 4.3.17.RELEASE API](https://docs.spring.io/spring/docs/4.3.17.RELEASE/javadoc-api/)

默认浏览器打开，当需要查某个类的作用的时候，可以在浏览器通过ctrl+f搜索。


# 面试必备知识点

> ## Spring事务管理

[可能是最漂亮的Spring事务管理详解](https://juejin.im/post/5b00c52ef265da0b95276091)

[Spring编程式和声明式事务实例讲解](https://juejin.im/post/5b010f27518825426539ba38)

> ## SpringAOP,IOC实现原理

AOP实现原理、动态代理和静态代理、Spring IOC的初始化过程、IOC原理、自己实现怎么实现一个IOC容器？这些东西都是经常会被问到的。

[自己动手实现的 Spring IOC 和 AOP - 上篇](http://www.coolblog.xyz/2018/01/18/自己动手实现的-Spring-IOC-和-AOP-上篇/)

[自己动手实现的 Spring IOC 和 AOP - 下篇](http://www.coolblog.xyz/2018/01/18/自己动手实现的-Spring-IOC-和-AOP-下篇/)

### AOP：

AOP思想的实现一般都是基于 **代理模式** ，在JAVA中一般采用JDK动态代理模式，但是我们都知道，**JDK动态代理模式只能代理接口而不能代理类**。因此，Spring AOP 会这样子来进行切换，因为Spring AOP 同时支持 CGLIB、ASPECTJ、JDK动态代理。

- 如果目标对象的实现类实现了接口，Spring AOP 将会采用 JDK 动态代理来生成 AOP 代理类；
- 如果目标对象的实现类没有实现接口，Spring AOP 将会采用 CGLIB 来生成 AOP 代理类——不过这个选择过程对开发者完全透明、开发者也无需关心。



[JDK动态代理、CGLIB动态代理讲解](http://www.cnblogs.com/puyangsky/p/6218925.html)

我们知道AOP思想的实现一般都是基于 **代理模式** ，所以在看下面的文章之前建议先了解一下静态代理以及JDK动态代理、CGLIB动态代理的实现方式。

[Spring AOP 入门](https://juejin.im/post/5aa7818af265da23844040c6)

带你入门的一篇文章。这篇文章主要介绍了AOP中的基本概念：5种类型的通知（Before，After，After-returning，After-throwing，Around）；Spring中对AOP的支持：AOP思想的实现一般都是基于代理模式，在JAVA中一般采用JDK动态代理模式，Spring AOP 同时支持 CGLIB、ASPECTJ、JDK动态代理，

[Spring AOP 基于AspectJ注解如何实现AOP](https://juejin.im/post/5a55af9e518825734d14813f)

主要介绍了@AspectJ 详解以及Spring AOP - AspectJ注解（讲的挺不错的）

[探秘Spring AOP（慕课网视频，很不错）](https://www.imooc.com/learn/869)

慕课网视频，讲解的很不错，详细且深入


[spring源码剖析（六）AOP实现原理剖析](https://blog.csdn.net/fighterandknight/article/details/51209822)

通过源码分析Spring AOP的原理

### IOC：

Spring IOC的初始化过程：
![Spring IOC的初始化过程](https://user-gold-cdn.xitu.io/2018/5/22/16387903ee72c831?w=709&h=56&f=png&s=4673)

[[Spring框架]Spring IOC的原理及详解。](https://www.cnblogs.com/wang-meng/p/5597490.html)

[Spring IOC核心源码学习](https://yikun.github.io/2015/05/29/Spring-IOC核心源码学习/)

比较简短，推荐阅读。

[Spring IOC 容器源码分析](https://javadoop.com/post/spring-ioc)

强烈推荐，内容详尽，而且便于阅读。

> ## 其他

**Spring单例与线程安全：**

[Spring框架中的单例模式（源码解读）](http://www.cnblogs.com/chengxuyuanzhilu/p/6404991.html)

单例模式是一种常用的软件设计模式。通过单例模式可以保证系统中一个类只有一个实例。spring依赖注入时，使用了 多重判断加锁 的单例模式。

> ## Spring源码阅读

阅读源码不仅可以加深我们对Spring设计思想的理解，提高自己的编码水品，还可以让自己字面试中如鱼得水。下面的是Github上的一个开源的Spring源码阅读，大家有时间可以看一下，当然你如果有时间也可以自己慢慢研究源码。

###  [Spring源码阅读](https://github.com/seaswalker/Spring)
 - [spring-core](https://github.com/seaswalker/Spring/blob/master/note/Spring.md)
- [spring-aop](https://github.com/seaswalker/Spring/blob/master/note/spring-aop.md)
- [spring-context](https://github.com/seaswalker/Spring/blob/master/note/spring-context.md)
- [spring-task](https://github.com/seaswalker/Spring/blob/master/note/spring-task.md)
- [spring-transaction](https://github.com/seaswalker/Spring/blob/master/note/spring-transaction.md)
- [spring-mvc](https://github.com/seaswalker/Spring/blob/master/note/spring-mvc.md)
- [guava-cache](https://github.com/seaswalker/Spring/blob/master/note/guava-cache.md)
