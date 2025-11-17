---
title: Java 25 新特性概览
category: Java
tag:
  - Java新特性
head:
  - - meta
    - name: keywords
      content: Java 25,JDK25,LTS,作用域值,紧凑对象头,分代 Shenandoah,模块导入,结构化并发
  - - meta
    - name: description
      content: 概览 JDK 25 的关键新特性与预览改动，关注并发、GC 与语言/平台增强。
---

JDK 25 于 2025 年 9 月 16 日 发布，这是一个非常重要的版本，里程碑式。

JDK 25 是 LTS（长期支持版），至此为止，目前有 JDK8、JDK11、JDK17、JDK21 和 JDK 25 这四个长期支持版了。

JDK 21 共有 18 个新特性，这篇文章会挑选其中较为重要的一些新特性进行详细介绍：

- [JEP 506: Scoped Values (作用域值)](https://openjdk.org/projects/jdk/25/)
- [JEP 512: Compact Source Files and Instance Main Methods (紧凑源文件与实例主方法)](https://openjdk.org/jeps/512)
- [JEP 519: Compact Object Headers (紧凑对象头)](https://openjdk.org/jeps/519)
- [JEP 521: Generational Shenandoah (分代 Shenandoah GC)](https://openjdk.org/jeps/521)
- [JEP 507: Primitive Types in Patterns, instanceof, and switch (模式匹配支持基本类型, 第三次预览)](https://openjdk.org/jeps/507)
- [JEP 505: Structured Concurrency (结构化并发, 第五次预览)](https://openjdk.org/jeps/505)
- [JEP 511: Module Import Declarations (模块导入声明)](https://openjdk.org/jeps/511)
- [JEP 513: Flexible Constructor Bodies (灵活的构造函数体)](https://openjdk.org/jeps/513)
- [JEP 508: Vector API (向量 API, 第十次孵化)](https://openjdk.org/jeps/508)

下图是从 JDK 8 到 JDK 24 每个版本的更新带来的新特性数量和更新时间：

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 506: 作用域值

作用域值（Scoped Values）可以在线程内和线程间共享不可变的数据，优于线程局部变量 `ThreadLocal` ，尤其是在使用大量虚拟线程时。

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });
```
