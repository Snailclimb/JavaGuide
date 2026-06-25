---
title: RPC 远程过程调用专题：原理、调用流程、序列化、服务发现、Dubbo 与 gRPC
description: RPC 面试与远程调用学习路线，涵盖 RPC 原理、调用流程、动态代理、序列化、网络传输、服务发现、负载均衡、Dubbo、gRPC 和 HTTP 对比。
category: 分布式
tag:
  - RPC
  - Dubbo
  - 分布式
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: RPC,RPC原理,RPC框架,Dubbo,gRPC,Thrift,远程过程调用,服务发现,动态代理,序列化协议,负载均衡,HTTP和RPC区别,后端面试
---

RPC（Remote Procedure Call，远程过程调用）是分布式系统里最常见的服务调用方式之一。它希望让调用远程服务像调用本地方法一样自然，同时封装网络通信、序列化、服务发现、负载均衡、超时重试和容错治理等复杂细节。

## 适合谁看

- 想理解 RPC 框架工作原理的后端开发者。
- 正在准备 RPC、Dubbo、微服务调用相关面试题的同学。
- 已经用过 Feign、Dubbo、gRPC，但对底层调用流程和服务治理不够熟的读者。
- 需要判断内部服务调用到底该用 HTTP 还是 RPC 的工程师。

## 学习重点

- RPC 是远程调用模型，不是某一个具体协议。
- 一次 RPC 调用通常会经过动态代理、序列化、网络传输、服务发现、负载均衡、结果反序列化等步骤。
- Dubbo、gRPC、Thrift 等框架的侧重点不同，不能只用“性能更好”概括 RPC。
- HTTP 和 RPC 不是互斥关系，gRPC 就是基于 HTTP/2 承载 RPC 调用的典型例子。
- 面试中要能从“为什么需要 RPC、RPC 怎么工作、框架如何治理服务、如何选型”几个层次回答。

## 和其他分布式文章的关系

RPC 主要解决**服务之间如何调用**。它和 [API 网关](../api-gateway.md) 经常一起出现，但两者位置不同：网关负责外部流量入口和统一治理，RPC 更常用于内部服务之间的调用。

RPC 框架通常还会依赖注册发现、负载均衡、超时重试和集群容错。想把这条链路补完整，可以把本专题和 [分布式配置中心详解](../distributed-configuration-center.md)、[ZooKeeper 专题](../distributed-process-coordination/zookeeper/) 放在一起看。

## 建议阅读顺序

1. [有了 HTTP 协议，为什么还要 RPC？](../../cs-basics/network/http-vs-rpc.md)：先厘清 HTTP 与 RPC 的关系。
2. [RPC 远程过程调用详解](./rpc-intro.md)：再系统理解 RPC 调用流程、核心组件和框架选型。
3. [Dubbo 面试题总结](./dubbo.md)：最后把 RPC 放到 Dubbo 这种成熟框架里，看服务治理和生产实践。

## 核心文章

- [RPC 远程过程调用详解](./rpc-intro.md)：从调用流程、动态代理、序列化协议、网络传输和服务发现等角度理解 RPC 的基本原理。
- [Dubbo 面试题总结](./dubbo.md)：串联 Dubbo 架构原理、服务暴露与引用、SPI 扩展机制、负载均衡、集群容错、注册中心和生产实践问题。
- [有了 HTTP 协议，为什么还要 RPC？](../../cs-basics/network/http-vs-rpc.md)：解释 HTTP 与 RPC 的关系，避免把 RPC 简单理解成“比 HTTP 更高级的协议”。

## 高频问题

- RPC 调用一次完整流程是什么？
- RPC 框架为什么通常会用动态代理？
- RPC 常见序列化协议有哪些，如何选型？
- Dubbo 的服务暴露和服务引用过程是怎样的？
- Dubbo 的 SPI、负载均衡和集群容错机制怎么实现？
- HTTP 和 RPC 有什么区别？为什么服务内部调用常用 RPC？
- gRPC 为什么说是 RPC，又为什么基于 HTTP/2？
- 内部服务调用用 HTTP 还是 RPC，应该从哪些维度判断？

## 相关专题

- [分布式系统知识体系](../)
- [API 网关详解](../api-gateway.md)
- [Spring Cloud Gateway 面试题总结](../spring-cloud-gateway-questions.md)
- [计算机网络](../../cs-basics/network/)

<!-- @include: @article-footer.snippet.md -->
