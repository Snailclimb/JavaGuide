---
title: 系统设计知识体系：设计模式、工程基础、认证授权、数据安全与常用框架
description: 系统设计面试与知识体系学习路线，涵盖设计模式、RESTful API、软件工程、代码重构、单元测试、认证授权、数据安全、Spring 和实时消息推送。
category: 系统设计
tag:
  - 系统设计
  - 设计模式
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: 系统设计,系统设计面试题,设计模式,RESTful API,软件工程,代码重构,单元测试,认证授权,JWT,SSO,权限系统,数据安全,Spring,Spring Boot,MyBatis,Netty,定时任务,实时消息推送,后端面试
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **系统设计知识体系** 面向后端学习、工程实践和面试复习，围绕“把业务需求拆成稳定、可维护、可扩展的工程方案”整理本站系统设计相关文章。

系统设计不是只背秒杀、短链、Feed 流这类场景题。真正落到后端开发里，还需要理解 API 设计、代码质量、设计模式、框架原理、认证授权、数据安全、定时任务和实时消息推送等基础能力。

如果你时间有限，建议先看 [系统设计常见面试题总结](./system-design-questions.md)，快速建立高频问题清单；如果想系统补基础，可以按下面的阅读顺序推进。

## 适合谁看

- 正在系统学习后端系统设计的开发者。
- 准备校招、社招、中大厂后端面试的同学。
- 想把“会写业务代码”进一步提升到“能设计模块和方案”的工程师。
- 已经接触 Spring、MyBatis、权限系统、定时任务等技术，但缺少系统化梳理的读者。

## 学习重点

- 系统设计面试中，如何从需求澄清、核心流程、数据模型、接口设计、扩展性和风险点组织答案？
- RESTful API、命名、重构、单元测试这些工程基础，如何影响长期维护成本？
- 设计模式不是背 UML 图，而是理解常见变化点如何被封装。
- Spring、MyBatis、Netty 等框架分别解决了哪些工程复杂度？
- 认证授权、JWT、SSO、权限系统和数据安全分别覆盖安全链路的哪些部分？
- 定时任务和实时消息推送在生产环境里有哪些选型和稳定性问题？

## 建议阅读顺序

1. [系统设计常见面试题总结](./system-design-questions.md)：先建立系统设计场景题和高频问题清单。
2. [系统设计基础专题](./basis/)：补齐 RESTful API、软件工程、代码命名、代码重构和单元测试。
3. [设计模式常见面试题总结](./design-pattern.md)：理解常见设计模式适合解决哪些变化点。
4. [Spring & Spring Boot 专题](./framework/spring/)：掌握 IoC、AOP、事务、自动装配、常用注解和框架设计模式。
5. [认证授权与数据安全专题](./security/)：系统理解认证授权、JWT、SSO、权限系统、加密、脱敏和数据校验。
6. 再根据项目需要阅读 [Java 定时任务详解](./schedule-task.md) 和 [Web 实时消息推送详解](./web-real-time-message-push.md)。

## 核心文章

### 系统设计与工程基础

- [系统设计常见面试题总结](./system-design-questions.md)：覆盖短链系统、秒杀系统、海量数据处理等系统设计场景题。
- [系统设计基础专题](./basis/)：从 RESTful API、软件工程讲到代码命名、代码重构和单元测试。
- [RestFul API 简明教程](./basis/RESTfulAPI.md)：理解资源建模、HTTP 方法、状态码和接口设计规范。
- [代码重构指南](./basis/refactoring.md)：理解代码坏味道、重构原则和常见重构手法。
- [单元测试到底是什么？应该怎么做？](./basis/unit-test.md)：理解单元测试、Mock、Stub、测试金字塔和 JUnit 基础。
- [设计模式常见面试题总结](./design-pattern.md)：梳理单例、工厂、代理、责任链、策略、观察者等常见设计模式。

### 常用框架

- [Spring & Spring Boot 专题](./framework/spring/)：串联 Spring、Spring MVC、Spring Boot 的常见问题。
- [Spring常见面试题总结](./framework/spring/spring-knowledge-and-questions-summary.md)：覆盖 IoC、AOP、Bean 生命周期、依赖注入等核心问题。
- [SpringBoot常见面试题总结](./framework/spring/springboot-knowledge-and-questions-summary.md)：覆盖自动配置、Starter、配置加载和 Actuator 等问题。
- [MyBatis常见面试题总结](./framework/mybatis/mybatis-interview.md)：理解 `#{}`、`${}`、动态 SQL、缓存、分页插件和 Mapper 映射。
- [Netty常见面试题总结](./framework/netty.md)：了解高性能网络编程、Reactor 模型、事件循环和 ChannelPipeline。

### 认证授权与数据安全

- [认证授权与数据安全专题](./security/)：围绕认证授权、JWT、SSO、权限系统、加密、脱敏和数据校验展开。
- [认证授权基础概念详解](./security/basis-of-authority-certification.md)：理解认证、授权、Session、Token、OAuth2 等基础概念。
- [JWT 基础概念详解](./security/jwt-intro.md)：理解 JWT 组成、签名、工作流程和登录鉴权场景。
- [权限系统设计详解](./security/design-of-authority-system.md)：理解 RBAC 权限模型和权限系统设计。
- [常见加密算法总结](./security/encryption-algorithms.md)：理解对称加密、非对称加密、哈希算法和常见应用场景。
- [数据脱敏方案总结](./security/data-desensitization.md)：理解常见敏感数据脱敏规则和工程实现。

### 任务调度与消息推送

- [Java 定时任务详解](./schedule-task.md)：梳理 Timer、ScheduledThreadPoolExecutor、DelayQueue、时间轮、Spring @Scheduled 和分布式任务调度框架。
- [Web 实时消息推送详解](./web-real-time-message-push.md)：理解短轮询、长轮询、SSE、WebSocket 和消息推送选型。
- [J2EE 基础知识](./J2EE基础知识.md)：回顾 Servlet、请求转发与重定向、Session 和 Cookie 等 Java Web 基础。

## 高频问题

- 系统设计题应该按什么结构回答？
- RESTful API 设计里，资源路径、HTTP 方法和状态码应该如何使用？
- 代码命名、重构和单元测试为什么会影响系统可维护性？
- 常见设计模式分别解决什么问题？在 Spring 里有哪些应用？
- Spring IoC、AOP、Bean 生命周期和事务机制怎么理解？
- Spring Boot 自动装配的核心流程是什么？
- MyBatis 的 `#{}` 和 `${}` 有什么区别？一级缓存和二级缓存如何工作？
- 认证和授权有什么区别？Session、Token、JWT、OAuth2 分别适合什么场景？
- RBAC 权限系统应该如何设计？
- 数据脱敏、数据校验和加密算法分别解决什么安全问题？
- 定时任务框架应该如何选型？分布式任务调度要注意哪些问题？
- Web 实时消息推送有哪些方案？短轮询、SSE 和 WebSocket 如何取舍？

## 相关专题

- [高性能系统知识体系](../high-performance/)
- [高可用系统知识体系](../high-availability/)
- [分布式系统知识体系](../distributed-system/)
- [数据库](../database/)
- [计算机网络](../cs-basics/network/other-network-questions.md)

<!-- @include: @article-footer.snippet.md -->
