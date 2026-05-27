---
title: Spring & Spring Boot 专题：IoC、AOP、事务、自动装配、常用注解与源码
description: Spring 和 Spring Boot 面试学习路线，涵盖 IoC、AOP、Bean 生命周期、事务、自动装配、常用注解、设计模式、@Async、源码和常见面试题。
category: 框架
tag:
  - Spring
  - Spring Boot
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: Spring,Spring Boot,Spring面试题,SpringBoot面试题,IoC,AOP,Bean生命周期,Spring事务,Spring自动装配,Spring常用注解,Spring源码,@Async,Java后端面试
---

Spring 是 Java 后端最核心的基础设施之一。学习 Spring 不能只背注解，还要理解 IoC、AOP、Bean 生命周期、事务、自动装配、设计模式和常见扩展点。

Spring Boot 则进一步把配置、依赖管理、自动装配和生产可观测能力整合起来，让应用开发更快，但也更容易让人忽略底层原理。

## 适合谁看

- 正在系统学习 Spring、Spring MVC、Spring Boot 的 Java 后端开发者。
- 准备 Spring、Spring Boot 高频面试题的同学。
- 用过 Spring Boot 开发项目，但对 IoC、AOP、事务和自动装配理解不够深的读者。
- 想从框架原理角度理解后端工程基础设施的工程师。

## 学习重点

- Spring IoC 解决对象创建和依赖管理问题，AOP 解决横切逻辑复用问题。
- Bean 生命周期、作用域、循环依赖和扩展点是理解 Spring 容器的关键。
- Spring 事务要重点掌握传播行为、隔离级别、回滚规则和失效场景。
- Spring Boot 自动装配的核心在于条件装配、配置绑定和 Starter 体系。
- 学注解不能只背用途，还要知道它背后对应的容器能力。
- Spring 源码和设计模式适合用来加深理解，不建议一开始就硬啃源码细节。

## 建议阅读顺序

1. [Spring常见面试题总结](./spring-knowledge-and-questions-summary.md)：先建立 Spring 高频问题清单。
2. [IoC & AOP详解（快速搞懂）](./ioc-and-aop.md)：理解 Spring 最核心的两个基础概念。
3. [Spring&SpringMVC&SpringBoot常用注解总结](./spring-common-annotations.md)：把常用注解和容器能力对应起来。
4. [Spring 事务详解](./spring-transaction.md)：重点掌握事务传播、隔离级别、回滚规则和失效场景。
5. [SpringBoot 自动装配原理详解](./spring-boot-auto-assembly-principles.md)：理解 Spring Boot 为什么能做到开箱即用。
6. 再根据需要阅读 [Spring 中的设计模式详解](./spring-design-patterns-summary.md)、[Async 注解原理分析](./async.md) 和 [Spring Boot核心源码解读](./springboot-source-code.md)。

## 核心文章

- [Spring常见面试题总结](./spring-knowledge-and-questions-summary.md)：覆盖 IoC 容器、AOP 原理、Bean 生命周期、依赖注入等 Spring 核心知识点。
- [SpringBoot常见面试题总结](./springboot-knowledge-and-questions-summary.md)：覆盖自动配置原理、Starter 机制、配置文件加载及 Actuator 监控等知识点。
- [IoC & AOP详解（快速搞懂）](./ioc-and-aop.md)：讲解控制反转、依赖注入、切面编程和动态代理实现机制。
- [Spring&SpringMVC&SpringBoot常用注解总结](./spring-common-annotations.md)：梳理 `@Autowired`、`@Component`、`@RequestMapping` 等常用注解。
- [Spring 事务详解](./spring-transaction.md)：覆盖 `@Transactional`、事务传播行为、隔离级别、事务失效场景及回滚规则。
- [SpringBoot 自动装配原理详解](./spring-boot-auto-assembly-principles.md)：解析 `@EnableAutoConfiguration`、SpringFactories 加载机制和条件注解。
- [Spring 中的设计模式详解](./spring-design-patterns-summary.md)：理解工厂模式、代理模式、单例模式、模板方法等在 Spring 中的应用。
- [Async 注解原理分析](./async.md)：理解异步任务配置、线程池设置和 `@EnableAsync` 机制。
- [Spring Boot核心源码解读](./springboot-source-code.md)：从源码角度理解启动流程、自动配置机制和 SpringApplication。

## 高频问题

- 什么是 IoC？什么是 DI？
- Spring AOP 和动态代理是什么关系？
- Spring Bean 的生命周期是怎样的？
- Spring 如何解决循环依赖？哪些循环依赖解决不了？
- `@Autowired` 和 `@Resource` 有什么区别？
- Spring 事务的传播行为有哪些？
- `@Transactional` 常见失效场景有哪些？
- Spring Boot 自动装配的流程是什么？
- Starter 的作用是什么？如何自定义一个 Starter？
- Spring 中用到了哪些设计模式？
- `@Async` 为什么有时不生效？
- Spring 源码应该从哪些入口开始看？

## 相关专题

- [系统设计知识体系](../../)
- [系统设计基础专题](../../basis/)
- [设计模式常见面试题总结](../../design-pattern.md)
- [MyBatis常见面试题总结](../mybatis/mybatis-interview.md)
- [分布式系统知识体系](../../../distributed-system/)

<!-- @include: @article-footer.snippet.md -->
