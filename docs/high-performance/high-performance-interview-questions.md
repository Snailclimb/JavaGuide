---
title: 高性能系统设计面试题总结：缓存、读写分离、分库分表、负载均衡、消息队列
description: 高性能系统面试题和复习路线汇总，覆盖 CDN、负载均衡、数据库优化、读写分离、分库分表、冷热分离、深度分页、SQL 优化、消息队列、Kafka、RocketMQ、RabbitMQ 等高频考点。
category: 高性能
tag:
  - 高性能
  - 面试题
  - 系统设计
head:
  - - meta
    - name: keywords
      content: 高性能面试题,系统设计面试题,读写分离面试题,分库分表面试题,SQL优化面试题,负载均衡面试题,消息队列面试题,Kafka面试题,RocketMQ面试题,RabbitMQ面试题,CDN面试题
---

高性能系统面试不是问你会不会背几个优化手段，而是看你能不能把请求链路拆开：**用户请求进来后，哪里可能慢，哪里可能扛不住，哪里需要削峰，哪里需要减少数据库压力，哪里需要用监控和压测验证效果**。

这篇文章把 JavaGuide 现有高性能相关文章串成一条面试复习路线，适合准备后端开发、系统设计和架构设计相关面试。

## 高性能系统设计面试怎么准备？

高性能问题通常可以按请求链路拆成 4 层：

1. **入口层**：CDN、负载均衡、网关。
2. **应用层**：限流、异步化、线程池、批处理。
3. **数据层**：索引、SQL 优化、读写分离、分库分表、冷热分离。
4. **削峰层**：消息队列、延迟处理、重试和补偿。

面试回答时，不要一上来就说“加缓存”。更好的方式是先确认场景和指标：QPS 多大、RT 和 P99 要求是多少、读写比例如何、数据量级多大、瓶颈出现在 CPU、I/O、数据库还是外部依赖。只有先判断瓶颈在哪里，后面的方案才不会像硬套模板。

## 第一阶段：CDN 和负载均衡

入口层优化解决的是“流量怎么更快、更稳地进来”。这一层通常不直接改业务代码，但会明显影响用户访问延迟、源站压力和系统可用性。

重点文章：

- [CDN 工作原理详解](https://javaguide.cn/high-performance/cdn.html)
- [负载均衡原理及算法详解](https://javaguide.cn/high-performance/load-balancing.html)

高频面试问题：

- CDN 为什么能加速静态资源访问？回源是什么意思？
- 浏览器缓存、CDN 缓存、源站缓存分别解决什么问题？
- 为什么 HTML 不适合长期缓存，而 hash JS/CSS 可以长期缓存？
- 四层负载均衡和七层负载均衡有什么区别？
- 轮询、加权轮询、最少连接、一致性哈希分别适合什么场景？

准备这一部分时，可以把一次页面访问拆成：DNS 解析、CDN 命中、回源、浏览器缓存、静态资源加载。再补上“命中率下降怎么办”“某个机房故障如何摘流量”“负载均衡算法为什么会影响后端压力分布”这类追问，答案会更像真实项目经验。

## 第二阶段：数据库性能优化

数据库是后端系统最常见的性能瓶颈，也是面试最爱追问的地方。很多高性能方案最终都会落到一个问题上：如何在数据规模变大之后，继续把查询、写入和存储成本控制住。

重点文章：

- [读写分离和分库分表详解](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html)
- [数据冷热分离详解](https://javaguide.cn/high-performance/data-cold-hot-separation.html)
- [常见 SQL 优化手段总结](https://javaguide.cn/high-performance/sql-optimization.html)
- [深度分页介绍及优化建议](https://javaguide.cn/high-performance/deep-pagination-optimization.html)

高频面试问题：

- 读写分离能解决什么问题？主从延迟怎么处理？
- 分库分表解决什么问题？会带来哪些复杂度？
- 分片键怎么选？范围分片和哈希分片有什么区别？
- 深度分页为什么慢？游标分页、延迟关联、覆盖索引分别怎么优化？
- 冷热数据如何划分？归档后如何保证查询体验？
- SQL 优化时，如何结合执行计划判断索引是否生效？

数据库优化不要只记方案名。面试官通常会继续问：**数据量多大、查询模式是什么、写入压力如何、是否能接受最终一致、迁移成本怎么控制**。这些边界决定方案是否靠谱。

这一阶段建议重点准备 3 类回答：慢 SQL 如何定位和优化、单库压力太大如何拆、历史数据太多如何迁移和归档。能把这 3 类问题讲清楚，基本就覆盖了大部分数据库性能追问。

## 第三阶段：消息队列与削峰

消息队列的核心价值不是“解耦”两个字，而是让系统在高峰流量下有缓冲、有重试、有异步处理能力。它适合处理“写入突增、下游处理慢、多个系统需要协作”的场景，但也会引入一致性、重复消费和运维复杂度。

重点文章：

- [消息队列基础常见问题总结](https://javaguide.cn/high-performance/message-queue/message-queue.html)
- [Kafka 常见面试题总结](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html)
- [RocketMQ 常见面试题总结](https://javaguide.cn/high-performance/message-queue/rocketmq-questions.html)
- [RabbitMQ 常见面试题总结](https://javaguide.cn/high-performance/message-queue/rabbitmq-questions.html)
- [Disruptor 常见面试题总结](https://javaguide.cn/high-performance/message-queue/disruptor-questions.html)

高频面试问题：

- 消息队列有哪些典型使用场景？异步、削峰、解耦分别怎么理解？
- 消息丢失、重复消费、顺序消费分别怎么解决？
- Kafka 为什么吞吐高？它的分区、副本、ISR 分别解决什么问题？
- RocketMQ 的事务消息解决什么问题？
- RabbitMQ 的交换机、队列、路由键分别是什么？
- MQ 积压了怎么办？消费者扩容一定有用吗？

这一部分最重要的是讲清楚“可靠性”。生产环境里，消息系统真正难的不是发出去，而是失败、重复、乱序、积压之后系统还能恢复。

复习时不要只比较 Kafka、RocketMQ、RabbitMQ 的概念差异，还要能结合场景说明选择依据：日志采集更看重吞吐，交易链路更看重可靠性和事务语义，普通业务异步化更看重接入成本和运维复杂度。

## 第四阶段：把高性能方案放回系统设计题

面试里的高性能问题经常以系统设计题出现，比如：

- 如何设计一个秒杀系统？
- 如何优化一个慢查询很多的订单系统？
- 如何支撑首页高并发访问？
- 如何处理消息积压？
- 如何设计高吞吐日志采集链路？

回答这类问题时，建议按这个顺序展开：

1. **先确认业务目标、读写比例、峰值流量、数据规模和一致性要求**。
2. **入口层用 CDN、负载均衡、网关承接流量**。
3. **应用层用缓存、限流、异步化削峰**。
4. **数据层用索引、读写分离、分库分表、冷热分离降低数据库压力**。
5. **消息层用 MQ 做削峰、解耦、重试和补偿**。
6. **最后补监控、压测、降级、容量预估和成本评估**。

这样回答不会显得像在背八股，而是在做真实系统设计。尤其是社招和中高级岗位，面试官更关注你是否能讲清楚取舍：为什么用这个方案，不用它会发生什么，它会引入什么新问题，后续如何验证和治理。

## 推荐复习顺序

临近面试可以按“先数据层，再消息队列，最后入口层”的顺序复习。原因很简单：数据库优化和消息队列最容易被追问工程细节，入口层更适合放在最后补齐系统设计链路。

1. 先看 [常见 SQL 优化手段总结](https://javaguide.cn/high-performance/sql-optimization.html) 和 [深度分页介绍及优化建议](https://javaguide.cn/high-performance/deep-pagination-optimization.html)，掌握慢 SQL 定位、索引优化和分页优化这些高频问题。
2. 再看 [读写分离和分库分表详解](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html)、[数据冷热分离详解](https://javaguide.cn/high-performance/data-cold-hot-separation.html)，重点理解数据量继续变大后，系统如何拆库、拆表、归档和迁移。
3. 然后补 [消息队列基础常见问题总结](https://javaguide.cn/high-performance/message-queue/message-queue.html)、[Kafka 常见面试题总结](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html)、[RocketMQ 常见面试题总结](https://javaguide.cn/high-performance/message-queue/rocketmq-questions.html)，把异步、削峰、可靠投递、重复消费和消息积压准备扎实。
4. 最后看 [CDN 工作原理详解](https://javaguide.cn/high-performance/cdn.html) 和 [负载均衡原理及算法详解](https://javaguide.cn/high-performance/load-balancing.html)，把入口层链路补齐，能够从用户访问一路讲到后端服务承接流量。

如果你能把这些内容串成一条完整链路：**入口流量如何进来、应用如何削峰、数据库如何减压、消息系统如何兜底、系统效果如何验证**，高性能系统设计题就会好答很多。
