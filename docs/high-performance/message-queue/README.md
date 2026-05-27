---
title: 消息队列专题：异步处理、削峰填谷、可靠性、顺序性、Kafka、RocketMQ 与 RabbitMQ
description: 消息队列面试与 MQ 学习路线，涵盖异步处理、应用解耦、削峰填谷、消息可靠性、幂等性、顺序性、消息积压、Kafka、RocketMQ 和 RabbitMQ。
category: 高性能
tag:
  - 消息队列
  - Kafka
  - RocketMQ
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: 消息队列,消息队列面试题,Kafka,RocketMQ,RabbitMQ,Disruptor,消息可靠性,消息幂等,消息顺序性,消息积压,异步处理,削峰填谷,后端面试
---

消息队列是高性能和高可用系统里都非常常见的中间件，主要用于异步处理、应用解耦、削峰填谷和流量缓冲。学习消息队列时，不能只背 Kafka、RocketMQ、RabbitMQ 的特性，更要理解消息可靠性、顺序性、幂等性、积压处理和技术选型。

## 适合谁看

- 想系统学习消息队列的后端开发者。
- 准备 Kafka、RocketMQ、RabbitMQ、消息可靠性相关面试题的同学。
- 已经在项目中使用 MQ，但对消息丢失、重复消费、顺序消费、消息积压处理不够熟的读者。
- 需要在 Kafka、RocketMQ、RabbitMQ、Disruptor 之间做技术选型的工程师。

## 学习重点

- 消息队列解决的是异步、解耦、削峰和缓冲问题，不是所有链路都应该引 MQ。
- 消息可靠性要分别看生产者、Broker、消费者和业务幂等。
- 消息顺序性通常需要从 Topic、队列、分区、消费线程和业务 Key 一起设计。
- 消息积压不是单点问题，可能来自消费能力、下游依赖、限流策略和数据倾斜。
- Kafka、RocketMQ、RabbitMQ、Disruptor 的定位不同，选型时要结合吞吐、延迟、消息模型、生态和运维成本。

## 建议阅读顺序

1. [消息队列基础知识总结](./message-queue.md)：先理解 MQ 的通用模型、应用场景和常见问题。
2. [Kafka 常见问题总结](./kafka-questions-01.md)：理解高吞吐日志流、分区、副本、Consumer Group 和 Rebalance。
3. [RocketMQ 常见问题总结](./rocketmq-questions.md)：理解业务消息场景、事务消息、定时消息、顺序消息和消息存储。
4. [RabbitMQ 常见问题总结](./rabbitmq-questions.md)：理解 AMQP、Exchange、消息确认、死信队列和延迟队列。
5. [Disruptor 常见问题总结](./disruptor-questions.md)：理解高性能内存队列、无锁设计和低延迟场景。

## 核心文章

- [消息队列基础知识总结](./message-queue.md)：系统讲解应用场景、消息模型、消息可靠性、幂等性、顺序性、积压处理和技术选型。
- [Kafka 常见问题总结](./kafka-questions-01.md)：覆盖 Broker、Topic、Partition、Consumer Group、零拷贝、顺序写、ACK、ISR 和 Rebalance。
- [RocketMQ 常见问题总结](./rocketmq-questions.md)：覆盖 NameServer、Broker、Proxy、普通消息、顺序消息、事务消息、定时消息和存储机制。
- [RabbitMQ 常见问题总结](./rabbitmq-questions.md)：覆盖 AMQP、Exchange 类型、确认机制、死信队列、延迟队列、优先级队列和高可用集群。
- [Disruptor 常见问题总结](./disruptor-questions.md)：覆盖 RingBuffer、Sequencer、WaitStrategy、无锁设计、缓存行填充和预分配内存。

## 高频问题

- 为什么要使用消息队列？哪些场景不适合引入 MQ？
- 如何保证消息不丢失？
- 如何处理重复消费和业务幂等？
- 如何保证消息顺序性？
- 消息积压如何排查和处理？
- Kafka 为什么吞吐高？零拷贝和顺序写分别起什么作用？
- RocketMQ 的事务消息如何工作？
- RabbitMQ 的 Exchange 有哪些类型？各自适合什么场景？
- Kafka、RocketMQ、RabbitMQ 应该如何选型？

## 相关专题

- [高性能系统知识体系](../)
- [高可用系统知识体系](../../high-availability/)
- [分布式系统知识体系](../../distributed-system/)
- [系统设计](../../system-design/)

<!-- @include: @article-footer.snippet.md -->
