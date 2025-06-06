---
title: Java后端面试重点总结
category: 面试准备
icon: star
---

::: tip 友情提示
本文节选自 **[《Java 面试指北》](../zhuanlan/java-mian-shi-zhi-bei.md)**。这是一份教你如何更高效地准备面试的专栏，内容和 JavaGuide 互补，涵盖常见八股文（系统设计、常见框架、分布式、高并发 ……）、优质面经等内容。
:::

## Java 后端面试哪些知识点是重点？

**准备面试的时候，具体哪些知识点是重点呢？如何把握重点？**

给你几点靠谱的建议：

1. Java 基础、集合、并发、MySQL、Redis 、Spring、Spring Boot 这些 Java 后端开发必备的知识点（MySQL + Redis >= Java > Spring + Spring Boot）。大厂以及中小厂的面试问的比较多的就是这些知识点。Spring 和 Spring Boot 这俩框架类的知识点相对前面的知识点来说重要性要稍低一些，但一般面试也会问一些，尤其是中小厂。并发知识一般中大厂提问更多也更难，尤其是大厂喜欢深挖底层，很容易把人问倒。计算机基础相关的内容会在下面提到。
2. 你的项目经历涉及到的知识点是重中之重，有水平的面试官都是会根据你的项目经历来问的。举个例子，你的项目经历使用了 Redis 来做限流，那 Redis 相关的八股文（比如 Redis 常见数据结构）以及限流相关的八股文（比如常见的限流算法）你就应该多花更多心思来搞懂吃透！你把项目经历上的知识点吃透之后，再把你简历上哪些写熟练掌握的技术给吃透，最后再去花时间准备其他知识点。
3. 针对自身找工作的需求，你又可以适当地调整复习的重点。像中小厂一般问计算机基础比较少一些，有些大厂比如字节比较重视计算机基础尤其是算法。这样的话，如果你的目标是中小厂的话，计算机基础就准备面试来说不是那么重要了。如果复习时间不够的话，可以暂时先放放，腾出时间给其他重要的知识点。
4. 一般校招的面试不会强制要求你会分布式/微服务、高并发的知识（不排除个别岗位有这方面的硬性要求），所以到底要不要掌握还是要看你个人当前的实际情况。如果你会这方面的知识的话，对面试相对来说还是会更有利一些（想要让项目经历有亮点，还是得会一些性能优化的知识。性能优化的知识这也算是高并发知识的一个小分支了）。如果你的技能介绍或者项目经历涉及到分布式/微服务、高并发的知识，那建议你尽量也要抽时间去认真准备一下，面试中很可能会被问到，尤其是项目经历用到的时候。不过，也还是主要准备写在简历上的那些知识点就好。
5. JVM 相关的知识点，一般是大厂（例如美团、阿里）和一些不错的中厂（例如携程、顺丰、招银网络）才会问到，面试国企、差一点的中厂和小厂就没必要准备了。JVM 面试中比较常问的是 [Java 内存区域](https://javaguide.cn/java/jvm/memory-area.html)、[JVM 垃圾回收](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)、[类加载器和双亲委派模型](https://javaguide.cn/java/jvm/classloader.html) 以及 JVM 调优和问题排查（我之前分享过一些[常见的线上问题案例](https://t.zsxq.com/0bsAac47U)，里面就有 JVM 相关的）。
6. 不同的大厂面试侧重点也会不同。比如说你要去阿里这种公司的话，项目和八股文就是重点，阿里笔试一般会有代码题，进入面试后就很少问代码题了，但是对原理性的问题问的比较深，经常会问一些你对技术的思考。再比如说你要面试字节这种公司，那计算机基础，尤其是算法是重点，字节的面试十分注重代码功底，有时候开始面试就会直接甩给你一道代码题，写出来再谈别的。也会问面试八股文，以及项目，不过，相对来说要少很多。建议你看一下这篇文章 [为了解开互联网大厂秋招内幕，我把他们全面了一遍](https://mp.weixin.qq.com/s/pBsGQNxvRupZeWt4qZReIA)，了解一下常见大厂的面试题侧重点。
7. 多去找一些面经看看，尤其你目标公司或者类似公司对应岗位的面经。这样可以实现针对性的复习，还能顺便自测一波，检查一下自己的掌握情况。

看似 Java 后端八股文很多，实际把复习范围一缩小，重要的东西就是那些。考虑到时间问题，你不可能连一些比较冷门的知识点也给准备了。这没必要，主要精力先放在那些重要的知识点即可。

## 如何更高效地准备八股文？

对于技术八股文来说，尽量不要死记硬背，这种方式非常枯燥且对自身能力提升有限！但是！想要一点不背是不太现实的，只是说要结合实际应用场景和实战来理解记忆。

我一直觉得面试八股文最好是和实际应用场景和实战相结合。很多同学现在的方向都错了，上来就是直接背八股文，硬生生学成了文科，那当然无趣了。

举个例子：你的项目中需要用到 Redis 来做缓存，你对照着官网简单了解并实践了简单使用 Redis 之后，你去看了 Redis 对应的八股文。你发现 Redis 可以用来做限流、分布式锁，于是你去在项目中实践了一下并掌握了对应的八股文。紧接着，你又发现 Redis 内存不够用的情况下，还能使用 Redis Cluster 来解决，于是你就又去实践了一下并掌握了对应的八股文。

**一定要记住你的主要目标是理解和记关键词，而不是像背课文一样一字一句地记下来，这样毫无意义！效率最低，对自身帮助也最小！**

还要注意适当“投机取巧”，不要单纯死记八股，有些技术方案的实现有很多种，例如分布式 ID、分布式锁、幂等设计，想要完全记住所有方案不太现实，你就重点记忆你项目的实现方案以及选择该种实现方案的原因就好了。当然，其他方案还是建议你简单了解一下，不然也没办法和你选择的方案进行对比。

想要检测自己是否搞懂或者加深印象，记录博客或者用自己的理解把对应的知识点讲给别人听也是一个不错的选择。

另外，准备八股文的过程中，强烈建议你花个几个小时去根据你的简历（主要是项目经历部分）思考一下哪些地方可能被深挖，然后把你自己的思考以面试问题的形式体现出来。面试之后，你还要根据当下的面试情况复盘一波，对之前自己整理的面试问题进行完善补充。这个过程对于个人进一步熟悉自己的简历（尤其是项目经历）部分，非常非常有用。这些问题你也一定要多花一些时间搞懂吃透，能够流畅地表达出来。面试问题可以参考 [Java 面试常见问题总结（2024 最新版）](https://t.zsxq.com/0eRq7EJPy)，记得根据自己项目经历去深入拓展即可！

最后，准备技术面试的同学一定要定期复习（自测的方式非常好），不然确实会遗忘的。
