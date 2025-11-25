---
title: 从面试官和候选者的角度谈如何准备技术初试
category: 技术文章精选集
author: 琴水玉
tag:
  - 面试
---

> **推荐语**：从面试官和面试者两个角度探讨了技术面试！非常不错！
>
> **内容概览：**
>
> - 通过技术基础考察候选者，才能考察到候选者的真实技术实力：技术深度和广度。
> - 实战与理论结合。比如，候选人叙述 JVM 内存模型布局之后，可以接着问：有哪些原因可能会导致 OOM , 有哪些预防措施? 你是否遇到过内存泄露的问题? 如何排查和解决这类问题?
> - 项目经历考察不宜超过两个。因为要深入考察一个项目的详情，所占用的时间还是比较大的。一般来说，会让候选人挑选一个他或她觉得最有收获的/最有挑战的/印象最深刻的/自己觉得特有意思的项目。然后围绕这个项目进行发问。通常是从项目背景出发，考察项目的技术栈、项目模块及交互的整体理解、项目中遇到的有挑战性的技术问题及解决方案、排查和解决问题、代码可维护性问题、工程质量保障等。
> - 多问少说，让候选者多表现。根据候选者的回答适当地引导或递进或横向移动。
>
> **原文地址：** <https://www.cnblogs.com/lovesqcc/p/15169365.html>

## 考察目标和思路

首先明确，技术初试的考察目标：

- 候选人的技术基础；
- 候选人解决问题的思路和能力。

技术基础是基石（冰山之下的东西），占七分， 解决问题的思路和能力是落地（冰山之上露出的部分），占三分。 业务和技术基础考察，三七开。

## 技术基础考察

### 为什么要考察技术基础?

程序员最重要的两种技术思维能力，是逻辑思维能力和抽象设计能力。逻辑思维能力是基础，抽象设计能力是高阶。 考察技术基础，正好可以同时考察这两种思维能力。能不能理解基础技术概念及关联，是考察逻辑思维能力；能不能把业务问题抽象成技术问题并合理的组织映射，是考察抽象设计能力。

绝大部分业务问题，都可以抽象成技术问题。在某种意义上，业务问题只是技术问题的领域化表述。

因此，**通过技术基础考察候选者，才能考察到候选者的真实技术实力：技术深度和广度。**

### 技术基础怎么考察？

技术基础怎么考察？通过有效的多角度的发问模式来考察。

#### 是什么-为什么

是什么考察对概念的基本理解，为什么考察对概念的实现原理。

比如：索引是什么？ 索引是如何实现的？

#### 引导-横向发问-深入发问

引导性，比如 “你对 Java 同步工具熟悉吗？” 作个试探，得到肯定答复后，可以进一步问：“你熟悉哪些同步工具类？” 了解候选者的广度；

获取候选者的回答后，可以进一步问：“ 谈谈 `ConcurrentHashMap` 或 `AQS` 的实现原理？”

一个人在多大程度上把技术原理能讲得清晰，包括思路和细节，说明他对技术的掌握能力有多强。

#### 跳跃式/交叉式发问

比如：讲到哈希高效查找，可以谈谈哈希一致性算法 。 两者既有关联又有很多不同点。也是一种技术广度的考察方法。

#### 总结性发问

比如：你在做 XXX 中，获得了哪些可以分享的经验？ 考察候选人的归纳总结能力。

#### 实战与理论结合

比如，候选人叙述 JVM 内存模型布局之后，可以接着问：有哪些原因可能会导致 OOM , 有哪些预防措施? 你是否遇到过内存泄露的问题? 如何排查和解决这类问题?

比如，候选人有谈到 SQL 优化和索引优化，那就正好谈谈索引的实现原理，如何建立最佳索引？

再比如，候选人有谈到事务，那就正好谈谈事务实现原理，隔离级别，快照实现等；

#### 熟悉与不熟悉结合

针对候选人简历上写的熟悉的部分，和没有写出的都问下。比如候选人简历上写着：熟悉 JVM 内存模型， 那我就考察下内存管理相关（熟悉部分），再考察下 Java 并发工具类（不确定是否熟悉部分）。

#### 死知识与活知识结合

比如，查找算法有哪些？顺序查找、二分查找、哈希查找。这些大家通常能说出来，也是“死知识”。

这些查找算法各适用于什么场景？在你工作中，有哪些场景用到了哪些查找算法？为什么？ 这些是“活知识”。

#### 学习或工作中遇到的

有时，在学习和工作中遇到的问题，也可以作为面试题。

比如，最近在学习《操作系统导论》并发部分，有一章节是如何使数据结构成为线程安全的。这里就有一些可以提问的地方：如何实现一个锁？如何实现一个线程安全的计数器？如何实现一个线程安全的链表？如何实现一个线程安全的 `Map` ？如何提升并发的性能？

工作中遇到的问题，也可以抽象提炼出来，作为技术基础面试题。

#### 技术栈适配度发问

如果候选人（简历上所写的）使用的某些技术与本公司的技术栈比较契合，则可以针对这些技术点进行深入提问，考察候选人在这些技术点的掌握程度。如果掌握程度比较好，则技术适配度相对更高一些。

当然，这一点并不能作为筛掉那些没有使用该技术栈的候选人的依据。比如本公司使用 `MongoDB` 和 `MySQL`， 而一个候选人没有用过 `Mongodb，` 但使用过 `MySQL`, `Redis`, `ES`, `HBase` 等多种存储系统，那么适配度并不比仅使用过 `MySQL` 和 `MongoDB` 的候选人逊色，因为他所涉及的技术广度更大，可以推断出他有足够能力掌握 `Mongodb`。

#### 创造有个性的面试题库

每个技术面试官都会有一个面试题库。持续积累面试题库，日常中突然想到的问题，就随手记录下来。

## 业务维度考察

### 为什么要考察业务维度？

技术基础考察，容易错过的地方是，候选人的非技术能力特质，比如沟通组织能力、带项目能力、抗压能力、解决实际问题的能力、团队影响力、其它性格特质等。

### 为什么不能单考察业务维度？

因为业务方面通常比较熟悉，可能就直接按照现有方案说出来了，很难考察到候选人的深入理解、横向拓展和归纳总结能力。

这一点，建议有针对性地考察下候选人的归纳总结能力：比如， 微服务搭建或开发或维护/保证系统稳定性或性能方面的过程中，你收获了哪些可以分享的经验？

## 解决问题能力考察

仅仅只是技术基础还不够，通常最好结合实际业务，针对他项目里的业务，抽象出技术问题进行考察。

解决思路重在层层递进。这一点对于面试官的要求也比较高，兼具良好的倾听能力、技术深度和业务经验。首先要仔细倾听候选人的阐述，找到适当的技术切入点，然后进行发问。如果进不去，那就容易考察失败。

### 设计问题

- 比如多个机器间共享大量业务对象，这些业务对象之间有些联合字段是重复的，如何去重？
- 如果瞬时有大量请求涌入，如何保证服务器的稳定性？

### 项目经历

项目经历考察不宜超过两个。因为要深入考察一个项目的详情，所占用的时间还是比较大的。

一般来说，会让候选人挑选一个他或她觉得最有收获的/最有挑战的/印象最深刻的/自己觉得特有意思的项目。然后围绕这个项目进行发问。通常是从项目背景出发，考察项目的技术栈、项目模块及交互的整体理解、项目中遇到的有挑战性的技术问题及解决方案、排查和解决问题、代码可维护性问题、工程质量保障等。

## 面试官如何做好一场面试?

### 预先准备

面试官也需要做一些准备。比如熟悉候选者的技能优势、工作经历等，做一个面试设计。

在面试将要开始时，做好面试准备。此外，面试官也需要对公司的一些基本情况有所了解，尤其是公司所使用技术栈、业务全景及方向、工作内容、晋升制度等，这一点技术型候选人问得比较多。

### 面试启动

一般以候选人自我介绍启动，不过候选人往往会谈得比较散，因此，我会直接提问：谈谈你有哪些优势以及自己觉得可以改进的地方？

然后以一个相对简单的基础题作为技术提问的开始：你熟悉哪些查找算法？大多数人是能答上顺序查找、二分查找、哈希查找的。

### 问题设计

提前阅读候选人简历，从简历中筛选出关键词，根据这些关键词进行有针对性地问题设计。

比如候选人简历里提到 `MVVM` ，可以问 `MVVM` 与 `MVC` 的区别； 提到了观察者模式，可以谈谈观察者模式，顺便问问他还熟悉哪些设计模式。

### 宽松氛围

即使问的问题比较多比较难，也要注意保持宽松氛围。

在面试前，根据候选人基本信息适当调侃一下，比如一位候选人叫汪奎，那我就说：之前我们团队有位叫袁奎，我们都喊他奎爷。

在面试过程中，适当提示，或者给出少量自己的看法，也能缓解候选人的紧张情绪。

### 学会倾听

多问少说，让候选者多表现。根据候选者的回答适当地引导或递进或横向移动。

引导候选人表现他最优势的一面，让他或她感觉好一些：毕竟一场面试双方都付出了时间和精力，不应该是面试官 Diss 候选人的场合，而应该让彼此有更好的交流。很大可能，你也能从候选人那里学到不少东西。

面试这件事，只不过双方的角色和立场有所不同，但并不代表面试官的水平就一定高于候选人。

### 记录重点

认真客观地记录候选人的回答，尽可能避免任何主观评价，亦不作任何加工（比如自己给总结一下，总结能力也是候选人的一个特质）。

## 作出判断

面试过程是一种铺垫，关键的是作出判断。

作出判断最容易陷入误区的是：贪深求全。总希望候选人技术又深入又全面。实际上，这是一种奢望。如果候选人的技术能力又深入又全面，很可能也会面临两种情况：

1. 候选人有更好的选择；
2. The candidate may have deficiencies in other aspects, such as teamwork.

A more appropriate scale is:

1. Whether his or her technical level is qualified for the current job;
2. How his or her technical level compares with that of fellow team members;
3. Whether his or her skill level matches his or her years of experience and whether he or she has the potential to perform more complex tasks.

**Different ages value different things. **

For engineers with less than three years of experience, more attention should be paid to their technical foundation, because this represents their future potential; at the same time, their performance in actual development, such as teamwork, business experience, stress resistance, enthusiasm and ability for active learning, etc., should also be examined.

For engineers with more than three years of experience, more attention should be paid to their business experience and problem-solving abilities, to see how he or she analyzes specific problems, and to examine the depth and breadth of his or her technical foundation within the business scope.

I am also learning how to judge a candidate's true technical level and whether he or she fits the needs.

## Message to Candidates

### Focus on technical foundations

A common doubt is: most of the time when developing business systems, the design and implementation of data structures and algorithms are basically not involved. Why should we examine the implementation principle of `HashMap`? Why should we learn basic courses such as data structures and algorithms, operating systems, and network communications?

Now I can give an answer:

- As mentioned above, the vast majority of business problems will actually eventually be mapped to basic technical issues: the implementation of data structures and algorithms, memory management, concurrency control, network communication, etc.; these are the cornerstones of understanding large-scale programs on the modern Internet and solving difficult program problems. Unless you can bless yourself to never encounter difficult problems, you will always be satisfied with writing CRUD;
- These technical foundations are the most interesting and exciting part of the programming world. If you are not interested in these, it will be difficult to go deep into this field. It is better to switch to other professions as soon as possible. The non-technical world has always been exciting and vast (sometimes I also want to go out more and do not want to be limited to the technical world);
- The technical foundation is the programmer's internal strength, while the specific technology is the moves. If you only have moves but not deep internal skills, you will be easily vulnerable to the competition from experts (competition from outstanding practitioners and difficult diseases);
- With a solid professional and technical foundation, the upper limit of what can be achieved is higher, and it is more likely to be capable of solving complex technical problems in the future, or to be able to come up with better solutions on the same problems;
- People like to cooperate with people who are similar to themselves, and good people tend to get better results by cooperating with good people. If most people in a team have a good technical foundation, and a person with a weak technical foundation comes in, the cost of collaboration will become higher. If you want to work with good people to get better results, then you must at least be able to match the technical foundation with good people;
- Expanding other talents on the basis of CRUD is also a good choice, but this will not be a true programmer's posture. At most, it will be talents with technical foundations such as product managers, project managers, HR, operations, full bookings and other positions. This is a matter of career choice, which goes beyond the scope of examining programmers.

### Don’t worry if you can’t answer a question

If the interviewer asks you a lot of questions and doesn't answer some of them, don't worry. The interviewer is probably just testing your technical depth and breadth, and then judging whether you have reached a certain water mark.

The point is: you answered some questions very deeply, which also reflects your in-depth thinking ability.

I only realized this when I became a technical interviewer. Of course, not every technical interviewer thinks this way, but I think this should be a more appropriate way.

<!-- @include: @article-footer.snippet.md -->