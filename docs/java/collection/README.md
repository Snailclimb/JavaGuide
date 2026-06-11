---
title: Java 集合专题：List、Map、Queue、并发集合与源码分析
description: Java 集合面试与源码学习路线，涵盖 List、Set、Map、Queue、ArrayList、HashMap、ConcurrentHashMap、阻塞队列和常见集合使用问题。
category: Java
tag:
  - Java
  - Java集合
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java集合,Java集合面试题,ArrayList,LinkedList,HashMap,ConcurrentHashMap,CopyOnWriteArrayList,ArrayBlockingQueue,PriorityQueue,DelayQueue,集合源码
---

Java 集合是业务开发中使用频率最高的基础库之一，也是 Java 面试最常考的模块。学习集合时，既要知道每个容器适合什么场景，也要理解扩容、哈希冲突、迭代器、线程安全和并发容器背后的设计取舍。

## 适合谁看

- 想系统掌握 Java 集合框架的后端开发者。
- 准备 List、Map、Queue、并发集合和源码分析相关面试题的同学。
- 平时经常使用集合，但对扩容、哈希冲突、fail-fast、线程安全等细节不熟的读者。
- 想阅读 JDK 源码，从常用集合类开始建立源码分析能力的工程师。

## 学习重点

- List、Set、Map、Queue 的接口体系和常见实现类定位。
- `ArrayList`、`LinkedList`、`HashMap`、`LinkedHashMap` 的底层数据结构和扩容机制。
- `ConcurrentHashMap`、`CopyOnWriteArrayList`、`ArrayBlockingQueue` 等并发容器的线程安全思路。
- 哈希冲突、红黑树化、fail-fast、迭代器删除、集合判空和容量预估等常见细节。
- 源码分析时如何从数据结构、关键字段、核心方法和并发控制四个角度入手。

## 建议阅读顺序

1. [Java集合常见面试题总结(上)](./java-collection-questions-01.md)：先建立集合框架和常见容器的问题清单。
2. [Java集合常见面试题总结(下)](./java-collection-questions-02.md)：继续补齐 Map、Queue、并发集合和源码细节。
3. [Java集合使用注意事项总结](./java-collection-precautions-for-use.md)：掌握项目里真正容易踩坑的使用方式。
4. [ArrayList 源码分析](./arraylist-source-code.md)、[LinkedList 源码分析](./linkedlist-source-code.md)、[HashMap 源码分析](./hashmap-source-code.md)：从最常用容器开始读源码。
5. [ConcurrentHashMap 源码分析](./concurrent-hash-map-source-code.md)、[CopyOnWriteArrayList 源码分析](./copyonwritearraylist-source-code.md)、[ArrayBlockingQueue 源码分析](./arrayblockingqueue-source-code.md)：再进入并发集合和阻塞队列。

## 核心文章

### 集合面试与使用规范

- [Java集合常见面试题总结(上)](./java-collection-questions-01.md)：覆盖集合框架、List、Set、Map、Queue 的基础问题。
- [Java集合常见面试题总结(下)](./java-collection-questions-02.md)：继续梳理哈希表、并发集合、集合源码和常见易错点。
- [Java集合使用注意事项总结](./java-collection-precautions-for-use.md)：总结集合初始化、判空、遍历删除、线程安全和性能相关注意事项。

### List 与 Map 源码

- [ArrayList 源码分析](./arraylist-source-code.md)：理解动态数组、扩容、随机访问和迭代器。
- [LinkedList 源码分析](./linkedlist-source-code.md)：理解双向链表、头尾操作和适用场景。
- [HashMap 源码分析](./hashmap-source-code.md)：理解数组、链表、红黑树、扰动函数、扩容和树化。
- [LinkedHashMap 源码分析](./linkedhashmap-source-code.md)：理解访问顺序、插入顺序和 LRU 场景。

如果对底层结构还不熟，可以先看 [线性数据结构详解](../../cs-basics/data-structure/linear-data-structure.md)、[哈希表面试题总结](../../cs-basics/data-structure/hash-table.md)、[红黑树详解](../../cs-basics/data-structure/red-black-tree.md) 和 [LRU 缓存面试题总结](../../cs-basics/data-structure/lru-cache.md)，再回来看集合源码会顺很多。

### 并发集合与队列

- [ConcurrentHashMap 源码分析](./concurrent-hash-map-source-code.md)：理解分段锁到 CAS + synchronized 的演进。
- [CopyOnWriteArrayList 源码分析](./copyonwritearraylist-source-code.md)：理解写时复制和读多写少场景。
- [ArrayBlockingQueue 源码分析](./arrayblockingqueue-source-code.md)：理解有界阻塞队列、锁和条件队列。
- [PriorityQueue 源码分析（付费）](./priorityqueue-source-code.md)：理解堆结构和优先级队列。
- [DelayQueue 源码分析](./delayqueue-source-code.md)：理解延迟队列、优先级队列和定时任务场景。

## 高频问题

- `ArrayList` 和 `LinkedList` 有什么区别？为什么很多场景更推荐 `ArrayList`？
- `HashMap` 的底层数据结构是什么？什么时候会树化？
- `HashMap` 为什么线程不安全？扩容时可能出现什么问题？
- `HashMap` 和 `ConcurrentHashMap` 有什么区别？
- `ConcurrentHashMap` 在 JDK 7 和 JDK 8 中的实现有什么变化？
- `CopyOnWriteArrayList` 为什么适合读多写少？
- fail-fast 和 fail-safe 有什么区别？
- 遍历集合时如何安全删除元素？
- `ArrayBlockingQueue`、`PriorityQueue`、`DelayQueue` 分别适合什么场景？

## 相关专题

- [Java 知识体系](../)
- [Java 基础专题](../basis/)
- [Java 并发编程专题](../concurrent/)
- [JVM 专题](../jvm/)
- [数据结构](../../cs-basics/data-structure/)
- [哈希表面试题总结](../../cs-basics/data-structure/hash-table.md)
- [LRU 缓存面试题总结](../../cs-basics/data-structure/lru-cache.md)

<!-- @include: @article-footer.snippet.md -->
