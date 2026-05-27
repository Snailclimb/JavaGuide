---
title: Java 基础专题：语法、面向对象、泛型、反射、代理与序列化
description: Java 基础面试与学习路线，涵盖基础语法、面向对象、关键字、值传递、泛型、反射、代理、序列化、SPI、Unsafe 和语法糖。
category: Java
tag:
  - Java
  - Java基础
  - Java面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Java基础,Java基础面试题,Java关键字,Java值传递,Java泛型,Java反射,Java代理,Java序列化,Java SPI,Java Unsafe,Java语法糖
---

Java 基础是后续学习集合、并发、JVM、Spring 和各类中间件的前置能力。这部分内容不只是背语法，更重要的是理解 Java 的对象模型、参数传递、泛型擦除、反射调用、动态代理、序列化边界和框架扩展机制。

## 适合谁看

- 刚开始系统学习 Java，想把基础语法和核心机制串起来的读者。
- 准备 Java 基础面试题，希望快速查漏补缺的同学。
- 已经写过 Java 项目，但对反射、代理、泛型、SPI、序列化等机制理解不深的开发者。
- 想继续学习集合、并发、JVM、Spring 源码前，需要补齐前置知识的工程师。

## 学习重点

- Java 基本语法、面向对象、异常、常用类、关键字和编码细节。
- 值传递、引用变量、对象可变性和方法调用之间的关系。
- 泛型、通配符、类型擦除以及它们对集合、API 设计和反射的影响。
- 反射、动态代理、SPI 等框架底层常见机制。
- 序列化、`BigDecimal`、`Unsafe`、语法糖等容易在项目和面试中踩坑的知识点。

## 建议阅读顺序

1. [Java基础常见面试题总结(上)](./java-basic-questions-01.md)：先过一遍 Java 基础语法、面向对象和常用类。
2. [Java基础常见面试题总结(中)](./java-basic-questions-02.md) 和 [Java基础常见面试题总结(下)](./java-basic-questions-03.md)：补齐异常、泛型、反射、注解和常见易错点。
3. [Java 关键字总结](./java-keyword-summary.md) 和 [Java 值传递详解](./why-there-only-value-passing-in-java.md)：厘清基础概念中的高频误区。
4. [泛型&通配符详解](./generics-and-wildcards.md)、[Java 反射机制详解](./reflection.md)、[Java 代理模式详解](./proxy.md)：理解框架底层常见能力。
5. [Java 序列化详解](./serialization.md)、[Java SPI 机制详解](./spi.md)、[Java 魔法类 Unsafe 详解](./unsafe.md)：继续补齐工程实践和源码阅读中的扩展知识。

## 核心文章

### 基础面试题

- [Java基础常见面试题总结(上)](./java-basic-questions-01.md)：覆盖 Java 语言特点、基础语法、面向对象、常用类和常见易错点。
- [Java基础常见面试题总结(中)](./java-basic-questions-02.md)：继续梳理异常、泛型、反射、注解等基础能力。
- [Java基础常见面试题总结(下)](./java-basic-questions-03.md)：补齐更偏细节和进阶的基础面试题。

### 语言机制

- [Java 关键字总结](./java-keyword-summary.md)：讲清 `final`、`static`、`this`、`super` 等关键字。
- [Java 值传递详解](./why-there-only-value-passing-in-java.md)：解释 Java 为什么只有值传递，以及引用变量传参时的真实语义。
- [泛型&通配符详解](./generics-and-wildcards.md)：理解泛型语法、上下界通配符、类型擦除和常见使用场景。
- [Java 语法糖详解](./syntactic-sugar.md)：了解编译器如何处理增强 for、自动装箱拆箱、枚举、Lambda 等语法糖。

### 框架底层机制

- [Java 反射机制详解](./reflection.md)：理解 Class 对象、反射调用、性能开销和使用场景。
- [Java 代理模式详解](./proxy.md)：掌握静态代理、JDK 动态代理和 CGLIB 代理。
- [Java SPI 机制详解](./spi.md)：理解服务发现和插件化扩展机制。
- [Java 序列化详解](./serialization.md)：理解序列化流程、serialVersionUID、安全风险和替代方案。

### 实用细节

- [BigDecimal 详解](./bigdecimal.md)：掌握金额计算、精度、舍入模式和构造方式的注意点。
- [Java 魔法类 Unsafe 详解](./unsafe.md)：了解堆外内存、CAS、对象字段偏移和源码中的底层能力。

## 高频问题

- Java 是值传递还是引用传递？对象作为参数传递时为什么能修改字段？
- `==` 和 `equals()` 有什么区别？为什么重写 `equals()` 必须重写 `hashCode()`？
- `String`、`StringBuilder`、`StringBuffer` 如何选择？
- `final`、`static`、`this`、`super` 分别有什么作用？
- 泛型擦除是什么？`List<String>` 和 `List<Integer>` 在运行时有什么区别？
- 反射为什么慢？有哪些典型使用场景？
- JDK 动态代理和 CGLIB 动态代理有什么区别？
- 为什么不建议直接使用 Java 原生序列化？
- `BigDecimal` 为什么推荐用字符串构造？

## 相关专题

- [Java 知识体系](../)
- [Java 集合专题](../collection/)
- [Java 并发编程专题](../concurrent/)
- [JVM 专题](../jvm/)
- [Spring](../../system-design/framework/spring/)

<!-- @include: @article-footer.snippet.md -->
