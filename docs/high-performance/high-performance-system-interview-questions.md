---
title: 高性能系统常见面试题总结
category: 高性能
redirectFrom:
  - /high-performance/high-performance-interview-questions.html
description: 高性能系统常见面试题总结：涵盖 CDN、负载均衡、读写分离、分库分表、SQL 优化、深度分页、冷热分离、消息队列、Kafka、RocketMQ、RabbitMQ 等核心知识点。
tag:
  - 高性能
  - 面试题
  - 系统设计
head:
  - - meta
    - name: keywords
      content: 高性能面试题,高性能系统设计,CDN面试题,负载均衡面试题,读写分离面试题,分库分表面试题,SQL优化面试题,深度分页面试题,消息队列面试题,Kafka面试题,RocketMQ面试题,RabbitMQ面试题
---

<!-- @include: @article-header.snippet.md -->

高性能系统面试通常从一个具体症状开始：接口变慢、数据库 CPU 升高、消息开始积压，或者大促流量超过了现有容量。回答时先确认 QPS、P99、数据量和读写比例，再沿着请求链查入口、应用、缓存、数据库和消息队列，直接报出“加缓存、上 MQ、分库分表”很容易被继续追问。

这篇文章是 JavaGuide 高性能专题的复习入口，按流量入口、数据库优化、消息队列和综合系统设计四部分整理。每部分列出常见追问，具体原理和实现放在对应专题文章中。

## 复习时先抓住哪些问题？

| 模块       | 需要讲清楚的内容                                 | 常见追问方向                                            |
| ---------- | ------------------------------------------------ | ------------------------------------------------------- |
| 流量入口   | 怎样缩短用户访问距离，并把请求分配给可用节点     | CDN、回源、缓存策略、四层/七层负载均衡、调度算法        |
| 数据库优化 | 读写量和数据规模增长后，怎样定位并缓解数据库瓶颈 | SQL、索引、读写分离、分库分表、深度分页、冷热分离       |
| 消息队列   | 哪些任务可以异步处理，怎样应对突发流量           | 可靠性、重复消费、顺序、积压、Kafka、RocketMQ、RabbitMQ |
| 综合设计   | 如何从指标、瓶颈和业务约束推导方案               | 容量、压测、一致性、成本、灰度和回滚                    |

高性能优化没有固定的组件清单。相同的慢查询，可能源于缺少索引、深度分页、热点数据、连接池等待，也可能是下游接口拖慢了整条链路。先用指标确定瓶颈，再讨论方案和代价。

## CDN 与负载均衡

CDN 把可缓存的内容放到离用户更近的边缘节点，减少跨地域传输和源站压力；负载均衡把进入系统的请求分配到多个服务实例。一个处理内容分发，一个处理请求调度，经常在系统设计题的入口层一起出现。

![CDN 简易示意图](https://oss.javaguide.cn/github/javaguide/high-performance/cdn/cdn-101.png)

相关内容：

- [CDN 工作原理详解](https://javaguide.cn/high-performance/cdn.html)
- [负载均衡原理及算法详解](https://javaguide.cn/high-performance/load-balancing.html)

常见面试题：

- CDN 为什么能降低访问延迟？哪些请求仍然需要回源？
- HTML、带 Hash 的 JS/CSS、图片和下载文件应该怎样设置缓存？
- 缓存命中率下降或回源量突然增加时，应该检查哪些配置？
- 什么是负载均衡？四层和七层负载均衡分别工作在哪一层？
- 轮询、加权轮询、随机、最少连接数和一致性哈希怎样选择？
- 健康检查、连接排空和会话保持怎样影响节点上下线？
- 服务端负载均衡和客户端负载均衡有什么区别？

回答 CDN 问题时不要默认所有内容都适合长期缓存。HTML 如果引用了已经清理的旧静态资源，缓存时间过长会让用户拿到无法加载的页面；涉及用户身份和权限的动态响应还要防止跨用户缓存。

## 数据库性能优化

数据库变慢后，可以先看慢 SQL、执行计划、索引命中、锁等待、连接池和磁盘 I/O。单条查询还有优化空间时，直接分库分表只会把查询、事务和运维问题一起放大。读写分离和数据分片适合解决容量与吞吐问题，不能代替 SQL 和索引优化。

![读写分离架构](https://oss.javaguide.cn/github/javaguide/high-performance/read-and-write-separation-and-library-subtable/read-and-write-separation.png)

相关内容：

- [读写分离和分库分表详解](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html)
- [数据冷热分离详解](https://javaguide.cn/high-performance/data-cold-hot-separation.html)
- [常见 SQL 优化手段总结](https://javaguide.cn/high-performance/sql-optimization.html)
- [深度分页介绍及优化建议](https://javaguide.cn/high-performance/deep-pagination-optimization.html)

常见面试题：

- 读写分离解决什么问题？主从复制和读请求路由怎样配合？
- 主从延迟会造成哪些业务问题？哪些请求必须读主库？
- 什么时候才需要分库分表？垂直拆分和水平拆分有什么区别？
- 分库分表后，跨库 JOIN、分页、排序、事务和扩容怎样处理？
- 分片键应该怎样选择？热点租户或热点商家会造成什么问题？
- SQL 优化应该从慢查询日志、执行计划和索引中的哪一步开始？
- 哪些写法会导致索引失效？联合索引的字段顺序如何确定？
- `LIMIT offset, size` 为什么会随页码变慢？游标翻页、延迟关联和覆盖索引怎样选择？
- 冷热数据怎样划分？迁移期间如何处理双写、增量同步和数据校验？

这组问题经常追问一致性。读写分离会暴露主从延迟，分库分表会增加跨分片事务和查询成本，冷热迁移则要面对新旧存储短期并存。答案里要说明业务能容忍多长时间的不一致，以及出现错误后如何校验和补偿。

## 消息队列与削峰

消息队列可以把非实时任务移出同步调用链，并在流量突增时暂存请求。引入 MQ 后，调用关系变成异步，生产者确认、Broker 持久化、消费者处理和重试策略都会影响最终结果。

![消息队列削峰](https://oss.javaguide.cn/github/javaguide/%E5%89%8A%E5%B3%B0-%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97.png)

相关内容：

- [消息队列面试题总结](https://javaguide.cn/high-performance/message-queue/message-queue-interview-questions.html)
- [消息队列基础常见问题总结](https://javaguide.cn/high-performance/message-queue/message-queue.html)
- [Kafka 常见面试题总结](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html)
- [RocketMQ 常见面试题总结](https://javaguide.cn/high-performance/message-queue/rocketmq-questions.html)
- [RabbitMQ 常见面试题总结](https://javaguide.cn/high-performance/message-queue/rabbitmq-questions.html)
- [Disruptor 常见面试题总结](https://javaguide.cn/high-performance/message-queue/disruptor-questions.html)

常见面试题：

- 消息队列怎样实现异步、解耦和削峰？引入后会增加哪些问题？
- 一条消息从生产者到消费者，哪些环节可能丢失？
- 至少一次投递为什么可能产生重复消息？消费者如何保证幂等？
- 全局顺序和分区顺序有什么区别？顺序消费会牺牲哪些能力？
- 消息积压时，怎样区分生产突增、消费变慢、分区不足和下游故障？
- Kafka 为什么吞吐量高？批处理、顺序写、页缓存和零拷贝分别起什么作用？
- Kafka 的 ACK、副本和消费者位点怎样影响消息可靠性？
- RocketMQ 事务消息解决什么问题？回查机制怎样处理未知状态？
- RabbitMQ 的 Exchange、Queue、Binding 和 Routing Key 如何配合？
- Disruptor 与跨进程消息队列有什么区别？它适合放在哪类进程内链路？

“消息不丢”不能只看 Broker 是否持久化。生产者发送后没有收到确认、消费者处理成功但位点提交失败、业务数据库写入后进程崩溃，都可能让消息丢失或重复。准备答案时要沿着整条传递链逐段说明。

## 综合系统设计题

系统设计题不会提前告诉你该用哪种组件。先确认业务目标和容量，再定位最可能的瓶颈；方案落地后还要用压测和监控验证，不能只用平均 RT 或单机 QPS 证明系统已经满足要求。

相关内容：[性能测试入门](https://javaguide.cn/high-availability/performance-test.html)

常见面试题：

- 如何设计一个高性能订单系统？查询、下单和异步任务分别怎样处理？
- 接口变慢时，如何利用 Trace、慢 SQL、线程池、连接池和系统资源指标定位瓶颈？
- QPS、TPS、并发数、P95/P99 和错误率分别反映什么？
- 怎样从业务峰值估算容量，并为数据库、缓存、MQ 和下游接口留出安全水位？
- 缓存、读写分离、分库分表和消息队列应该按什么顺序引入？
- 优化上线后，怎样通过灰度、压测、监控和回滚验证效果？
- 性能提高后，一致性、可用性、成本和运维复杂度会发生什么变化？

社招和中高级岗位通常会继续追问项目证据。例如“优化后接口更快了”，需要补充优化前后的流量、延迟分位数、错误率、资源使用率、压测环境和观察周期。没有参与过的部分按学习结果回答即可，不要编造生产指标。

## 按准备时间安排复习

| 剩余时间 | 建议安排                                                                | 复习目标                                           |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| 1～2 天  | 先过本文所有问题，优先补 SQL/索引、读写分离、分库分表和消息可靠性       | 能回答高频问题，并说出每种方案的主要限制           |
| 3～7 天  | 补 CDN、负载均衡、深度分页、冷热分离及一种主流 MQ，再画一条完整请求链路 | 能从瓶颈推导方案，遇到一致性和异常场景可以继续回答 |
| 1 周以上 | 阅读全部专题文章，结合项目整理一次性能问题的发现、定位、优化和验证过程  | 能用真实指标说明选型、收益、代价和后续监控方式     |

<!-- @include: @article-footer.snippet.md -->
