---
title: 计算机基础
category: 计算机书籍
head:
  - - meta
    - name: keywords
      content: 计算机基础书籍精选
---

考虑到很多同学比较喜欢看视频，因此，这部分内容我不光会推荐书籍，还会顺便推荐一些我觉得不错的视频教程和各大高校的 Project。

## 操作系统

**为什么要学习操作系统？**

**从对个人能力方面提升来说**，操作系统中的很多思想、很多经典的算法，你都可以在我们日常开发使用的各种工具或者框架中找到它们的影子。比如说我们开发的系统使用的缓存（比如 Redis）和操作系统的高速缓存就很像。CPU 中的高速缓存有很多种，不过大部分都是为了解决 CPU 处理速度和内存处理速度不对等的问题。我们还可以把内存可以看作外存的高速缓存，程序运行的时候我们把外存的数据复制到内存，由于内存的处理速度远远高于外存，这样提高了处理速度。同样地，我们使用的 Redis 缓存就是为了解决程序处理速度和访问常规关系型数据库速度不对等的问题。高速缓存一般会按照局部性原理（2-8 原则）根据相应的淘汰算法保证缓存中的数据是经常会被访问的。我们平常使用的 Redis 缓存很多时候也会按照 2-8 原则去做，很多淘汰算法都和操作系统中的类似。既说了 2-8 原则，那就不得不提命中率了，这是所有缓存概念都通用的。简单来说也就是你要访问的数据有多少能直接在缓存中直接找到。命中率高的话，一般表明你的缓存设计比较合理，系统处理速度也相对较快。

**从面试角度来说**，尤其是校招，对于操作系统方面知识的考察是非常非常多的。

**简单来说，学习操作系统能够提高自己思考的深度以及对技术的理解力，并且，操作系统方面的知识也是面试必备。**

如果你要系统地学习操作系统的话，最硬核最权威的书籍是 **[《操作系统导论》](https://book.douban.com/subject/33463930/)** 。你可以再配套一个 **[《深入理解计算机系统》](https://book.douban.com/subject/1230413/)** 加深你对计算机系统本质的认识，美滋滋！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20201012191645919.png)

另外，去年新出的一本国产的操作系统书籍也很不错：**[《现代操作系统：原理与实现》](https://book.douban.com/subject/35208251/)** （夏老师和陈老师团队的力作，值得推荐）。

![](https://img-blog.csdnimg.cn/20210406132050845.png)

如果你比较喜欢动手，对于理论知识比较抵触的话，我推荐你看看 **[《30 天自制操作系统》](https://book.douban.com/subject/11530329/)** ，这本书会手把手教你编写一个操作系统。

纸上学来终觉浅 绝知此事要躬行！强烈推荐 CS 专业的小伙伴一定要多多实践！！！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409123802972.png)

其他相关书籍推荐：

- **[《自己动手写操作系统》](https://book.douban.com/subject/1422377/)** ： 不光会带着你详细分析操作系统原理的基础，还会用丰富的实例代码，一步一步地指导你用 C 语言和汇编语言编写出一个具备操作系统基本功能的操作系统框架。
- **[《现代操作系统》](https://book.douban.com/subject/3852290/)** ： 内容很不错，不过，翻译的一般。如果你是精读本书的话，建议把课后习题都做了。
- **[《操作系统真象还原》](https://book.douban.com/subject/26745156/)** ： 这本书的作者毕业于北京大学，前百度运维高级工程师。因为在大学期间曾重修操作系统这一科，后对操作系统进行深入研究，著下此书。
- **[《深度探索 Linux 操作系统》](https://book.douban.com/subject/25743846/)** ：跟着这本书的内容走，可以让你对如何制作一套完善的 GNU/Linux 系统有了清晰的认识。
- **[《操作系统设计与实现》](https://book.douban.com/subject/2044818/)** ：操作系统的权威教学教材。
- **[《Orange'S:一个操作系统的实现》](https://book.douban.com/subject/3735649/)** ： 从只有二十行的引导扇区代码出发，一步一步地向读者呈现一个操作系统框架的完成过程。配合《操作系统设计与实现》一起食用更佳！

如果你比较喜欢看视频的话，推荐哈工大李治军老师主讲的慕课 [《操作系统》](https://www.icourse163.org/course/HIT-1002531008)，内容质量吊打一众国家精品课程。

课程的大纲如下：

![课程大纲](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/image-20220414144527747.png)

主要讲了一个基本操作系统中的六个基本模块： CPU 管理、内存管理、外设管理、磁盘管理与文件系统、用户接口和启动模块 。

课程难度还是比较大的，尤其是课后的 lab。如果大家想要真正搞懂操作系统底层原理的话，对应的 lab 能做尽量做一下。正如李治军老师说的那样：“纸上得来终觉浅，绝知此事要躬行”。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/image-20220414145210679.png)

如果你能独立完成几个 lab 的话，我相信你对操作系统的理解绝对要上升几个台阶。当然了，如果你仅仅是为了突击面试的话，那就不需要做 lab 了。

说点心里话，我本人非常喜欢李治军老师讲的课，我觉得他是国内不可多得的好老师。他知道我们国内的教程和国外的差距在哪里，也知道国内的学生和国外学生的差距在哪里，他自己在努力着通过自己的方式来缩小这个差距。真心感谢，期待李治军老师的下一个课程。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/books/image-20220414145249714.png)

还有下面这个国外的课程 [《深入理解计算机系统 》](https://www.bilibili.com/video/av31289365?from=search&seid=16298868573410423104) 也很不错。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20201204140653318.png)

## 计算机网络

计算机网络是一门系统性比较强的计算机专业课，各大名校的计算机网络课程打磨的应该都比较成熟。

要想学好计算机网络，首先要了解的就是 OSI 七层模型或 TCP/IP 五层模型，即应用层（应用层、表示层、会话层）、传输层、网络层、数据链路层、物理层。

![osi七层模型](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksosi%E4%B8%83%E5%B1%82%E6%A8%A1%E5%9E%8B2.png)

关于这门课，首先强烈推荐参考书是**机械工业出版社的《计算机网络——自顶向下方法》**。该书目录清晰，按照 TCP/IP 五层模型逐层讲解，对每层涉及的技术都展开了详细讨论，基本上高校里开设的课程的教学大纲就是这本书的目录了。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409123250570.png)

如果你觉得上面这本书看着比较枯燥的话，我强烈推荐+安利你看看下面这两本非常有趣的网络相关的书籍：

- [《图解 HTTP》](https://book.douban.com/subject/25863515/ "《图解 HTTP》") ： 讲漫画一样的讲 HTTP，很有意思，不会觉得枯燥，大概也涵盖也 HTTP 常见的知识点。因为篇幅问题，内容可能不太全面。不过，如果不是专门做网络方向研究的小伙伴想研究 HTTP 相关知识的话，读这本书的话应该来说就差不多了。
- [《网络是怎样连接的》](https://book.douban.com/subject/26941639/ "《网络是怎样连接的》") ：从在浏览器中输入网址开始，一路追踪了到显示出网页内容为止的整个过程，以图配文，讲解了网络的全貌，并重点介绍了实际的网络设备和软件是如何工作的。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20201011215144139.png)

除了理论知识之外，学习计算机网络非常重要的一点就是：“**动手实践**”。这点和我们编程差不多。

Github 上就有一些名校的计算机网络试验/Project：

- [哈工大计算机网络实验](https://github.com/rccoder/HIT-Computer-Network)
- [《计算机网络－自顶向下方法(原书第 6 版)》编程作业，Wireshark 实验文档的翻译和解答。](https://github.com/moranzcw/Computer-Networking-A-Top-Down-Approach-NOTES)
- [计算机网络的期末 Project，用 Python 编写的聊天室](https://github.com/KevinWang15/network-pj-chatroom)
- [CMU 的计算机网络课程](https://computer-networks.github.io/sp19/lectures.html)

我知道，还有很多小伙伴可能比较喜欢边看视频边学习。所以，我这里再推荐几个顶好的计算机网络视频讲解。

**1、[哈工大的计算机网络课程](http://www.icourse163.org/course/HIT-154005)** ：国家精品课程，截止目前已经开了 10 次课了。大家对这门课的评价都非常高！所以，非常推荐大家看一下！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20201218141241911.png)

**2、[王道考研的计算机网络](https://www.bilibili.com/video/BV19E411D78Q?from=search&seid=17198507506906312317)** ：非常适合 CS 专业考研的小朋友！这个视频目前在哔哩哔哩上已经有 1.6w+的点赞。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20201218141652837.png)

## 算法

先来看三本入门书籍。 这三本入门书籍中的任何一本拿来作为入门学习都非常好。

1. [《我的第一本算法书》](https://book.douban.com/subject/30357170/)
2. [《算法图解》](https://book.douban.com/subject/26979890/)
3. [《啊哈!算法》](https://book.douban.com/subject/25894685/)

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210327104418851.png)

我个人比较倾向于 **[《我的第一本算法书》](https://book.douban.com/subject/30357170/)** 这本书籍，虽然它相比于其他两本书集它的豆瓣评分略低一点。我觉得它的配图以及讲解是这三本书中最优秀，唯一比较明显的问题就是没有代码示例。但是，我觉得这不影响它是一本好的算法书籍。因为本身下面这三本入门书籍的目的就不是通过代码来让你的算法有多厉害，只是作为一本很好的入门书籍让你进入算法学习的大门。

再推荐几本比较经典的算法书籍。

**[《算法》](https://book.douban.com/subject/19952400/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409123422140.png)

这本书内容非常清晰易懂，适合数据结构和算法小白阅读。书中把一些常用的数据结构和算法都介绍到了！

我在大二的时候被我们的一个老师强烈安利过！自己也在当时购买了一本放在宿舍，到离开大学的时候自己大概看了一半多一点。因为内容实在太多了！另外，这本书还提供了详细的 Java 代码，非常适合学习 Java 的朋友来看，可以说是 Java 程序员的必备书籍之一了。

> **下面这些书籍都是经典中的经典，但是阅读起来难度也比较大，不做太多阐述，神书就完事了！**
>
> **如果你仅仅是准备算法面试的话，不建议你阅读下面这些书籍。**

**[《编程珠玑》](https://book.douban.com/subject/3227098/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145334093.png)

经典名著，ACM 冠军、亚军这种算法巨佬都强烈推荐的一本书籍。这本书的作者也非常厉害，Java 之父 James Gosling 就是他的学生。

很多人都说这本书不是教你具体的算法，而是教你一种编程的思考方式。这种思考方式不仅仅在编程领域适用，在其他同样适用。

**[《算法设计手册》](https://book.douban.com/subject/4048566/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145411049.png)

这是一本被 Github 上的爆火的计算机自学项目 [Teach Yourself Computer Science](https://link.zhihu.com/?target=https%3A//teachyourselfcs.com/) 强烈推荐的一本算法书籍。

类似的神书还有 [《算法导论》](https://book.douban.com/subject/20432061/)、[《计算机程序设计艺术（第 1 卷）》](https://book.douban.com/subject/1130500/) 。

**如果说你要准备面试的话，下面这几本书籍或许对你有帮助！**

**[《剑指 Offer》](https://book.douban.com/subject/6966465/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145506482.png)

这本面试宝典上面涵盖了很多经典的算法面试题，如果你要准备大厂面试的话一定不要错过这本书。

《剑指 Offer》 对应的算法编程题部分的开源项目解析：[CodingInterviews](https://link.zhihu.com/?target=https%3A//github.com/gatieme/CodingInterviews) 。

**[《程序员代码面试指南（第 2 版）》](https://book.douban.com/subject/30422021/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145622758.png)

《程序员代码面试指南（第 2 版）》里的大部分题目相比于《剑指 offer》 来说要难很多，题目涵盖面相比于《剑指 offer》也更加全面。全书一共有将近 300 道真实出现过的经典代码面试题。

视频的话，推荐北京大学的国家精品课程—**[程序设计与算法（二）算法基础](https://www.icourse163.org/course/PKU-1001894005)**，讲的非常好！

![](https://img-blog.csdnimg.cn/22ce4a17dc0c40f6a3e0d58002261b7a.png)

这个课程把七种基本的通用算法（枚举、二分、递归、分治、动态规划、搜索、贪心）都介绍到了。各种复杂算法问题的解决，都可能用到这些基本的思想。并且，这个课程的一部分的例题和 ACM 国际大学生程序设计竞赛中的中等题相当，如果你能够解决这些问题，那你的算法能力将超过绝大部分的高校计算机专业本科毕业生。

## 数据结构

其实，上面提到的很多算法类书籍（比如 **《算法》** 和 **《算法导论》**）都详细地介绍了常用的数据结构。

我这里再另外补充基本和数据结构相关的书籍。

**[《大话数据结构》](https://book.douban.com/subject/6424904/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145803440.png)

入门类型的书籍，读起来比较浅显易懂，适合没有数据结构基础或者说数据结构没学好的小伙伴用来入门数据结构。

**[《数据结构与算法分析：Java 语言描述》](https://book.douban.com/subject/3351237/)**

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/booksimage-20220409145823973.png)

质量很高，介绍了常用的数据结构和算法。

类似的还有 **[《数据结构与算法分析 ：C 语言描述》](https://book.douban.com/subject/1139426/)** 、**[《数据结构与算法分析：C++ 描述》](https://book.douban.com/subject/1971825/)**

![](https://img-blog.csdnimg.cn/d9c450ccc5224a5fba77f4fa937f7b9c.png)

视频的话推荐你看浙江大学的国家精品课程—**[《数据结构》](https://www.icourse163.org/course/ZJU-93001#/info)** 。

姥姥的数据结构讲的非常棒！不过，还是有一些难度的，尤其是课后练习题。