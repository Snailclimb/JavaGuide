---
title: Summary of Disruptor FAQs
category: high performance
tag:
  - Message queue
---

Disruptor is a relatively unpopular knowledge point, but if you have used Disruptor in your project experience, you are likely to be asked about it during the interview.

The interview (social recruitment) submitted by a golfer before involved some Disruptor issues. The article portal: [Dream Come True! Successfully received offers from major manufacturers such as ByteDance, Taobao, and Pinduoduo! ](https://mp.weixin.qq.com/s/C5QMjwEb6pzXACqZsyqC4A).

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-interview-questions.png)

This article can be seen as a brief summary of Disruptor. Each question will not go too in-depth. It is mainly aimed at interviews or a quick overview of Disruptor.

## What is a Disruptor?

Disruptor is an open source high-performance memory queue. It was originally created to solve the performance and memory safety issues of memory queues. It was developed by the British foreign exchange trading company LMAX.

According to Disruptor’s official introduction, a single thread can support 6 million orders per second based on the system LMAX (new retail financial trading platform) developed by Disruptor. Martin Fowler specifically introduced the architecture of this LMAX system in an article [The LMAX Architecture](https://martinfowler.com/articles/lmax.html) written in 2011. If you are interested, you can read this article. .

After LMAX's speech at QCon in 2010, Disruptor gained industry attention and won Oracle's official Duke's Choice Awards in 2011.

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/640.png)

> The "Duke Choice Award" aims to recognize the most influential Java technology applications developed by individuals or companies around the world in the past year, and is hosted by Oracle. The gold content is very high!

I specifically found the article that Oracle officially announced that it won the Duke's Choice Awards project (article address: <https://blogs.oracle.com/java/post/and-the-winners-arethe-dukes-choice-award)>. As can be seen from the article, other projects that won this award in the same year were famous projects such as Netty and JRebel.

![2011 Oracle's official Duke's Choice Awards](https://oss.javaguide.cn/javaguide/image-20211015152323898.png)

The functional advantages provided by Disruptor are similar to distributed queues such as Kafka and RocketMQ, but its scope is JVM (memory).

- Github address: <https://github.com/LMAX-Exchange/disruptor>
- Official tutorial: <https://lmax-exchange.github.io/disruptor/user-guide/index.html>

Regarding how to use Disruptor in Spring Boot projects, you can read this article: [Spring Boot + Disruptor Practical Introduction](https://mp.weixin.qq.com/s/0iG5brK3bYF0BgSjX4jRiA).

## Why use Disruptor?

Disruptor mainly solves the performance and memory safety issues of JDK's built-in thread-safe queue.

**Common thread-safe queues in JDK are as follows**:

| Queue name | Lock | Whether bounded |
| ----------------------- | ----------------------- | -------- |
| `ArrayBlockingQueue` | Lock(`ReentrantLock`) | Bounded |
| `LinkedBlockingQueue` | Lock(`ReentrantLock`) | Bounded |
| `LinkedTransferQueue` | Lock-free (`CAS`) | Unbounded |
| `ConcurrentLinkedQueue` | Lock-free (`CAS`) | Unbounded |

As can be seen from the above table: these queues are either locked and bounded, or they are lock-free and unbounded. Locked queues will inevitably affect performance, and unbounded queues run the risk of memory overflow.

Therefore, under normal circumstances, we do not recommend using the JDK's built-in thread-safe queue.

**Disruptor is different! It also ensures that the queue is bounded without locking and is thread-safe. **

The picture below is a comparison of the delay histograms of Disruptor and ArrayBlockingQueue provided by the Disruptor official website.

![disruptor-latency-histogram](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-latency-histogram.png)

Disruptor is really fast. The question of why it is so fast will be introduced later.

In addition, Disruptor also provides rich extension functions such as supporting batch operations and supporting multiple waiting strategies.

## What is the difference between Kafka and Disruptor?

- **Kafka**: Distributed message queue, generally used for message passing between systems or services, and can also be used as a streaming processing platform.
- **Disruptor**: Memory-level message queue, generally used for message passing between threads within the system.

## Which components use Disruptor?

There are quite a few open source projects that use Disruptor. Here are a few examples:

- **Log4j2**: Log4j2 is a commonly used logging framework that implements asynchronous logging based on Disruptor.
- **SOFATracer**: SOFATracer is Ant Financial’s open source distributed application link tracking tool. It is based on Disruptor to implement asynchronous logs.
- **Storm**: Storm is an open source distributed real-time computing system that is based on Disruptor to implement message passing within the worker process (no network communication is required between threads on the same Storm node).
- **HBase**: HBase is a distributed column storage database system based on Disruptor to improve write concurrency performance.
-…

## What are the core concepts of Disruptor?

- **Event**: You can understand Event as a message object stored in the queue waiting to be consumed.
- **EventFactory**: The event factory is used to produce events, we need to use it when initializing the `Disruptor` class.
- **EventHandler**: Event is processed in the corresponding Handler, which you can understand as a consumer in the production-consumer model.
- **EventProcessor**: EventProcessor holds the Sequence of a specific consumer (Consumer) and provides an event loop (Event Loop) for calling event processing implementation.
- **Disruptor**: The production and consumption of events require the use of `Disruptor` objects.
- **RingBuffer**: RingBuffer (ring array) is used to save events.
- **WaitStrategy**: Wait strategy. Determines how event consumers wait for the arrival of new events when there are no events to consume.
- **Producer**: Producer, just generally refers to the user code that calls the `Disruptor` object to publish events. Disruptor does not define a specific interface or type.
- **ProducerType**: Specify whether it is a single event publisher mode or multiple event publisher mode (publisher and producer have similar meanings, I personally prefer to use publisher).
- **Sequencer**: Sequencer is the true core of Disruptor. This interface has two implementation classes `SingleProducerSequencer` and `MultiProducerSequencer`, which define concurrency algorithms for fast and correct data transfer between producers and consumers.

The picture below is taken from the Disruptor official website and shows an example of the LMAX system using Disruptor.

![Example of using Disruptor in LMAX system](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-models.png)

## What are the waiting strategies for Disruptor?

**WaitStrategy** determines how event consumers wait for the arrival of new events when there are no events to consume.

Common waiting strategies include the following:![Disruptor Wait Strategy](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/DisruptorWaitStrategy.png)

- `BlockingWaitStrategy`: Based on `ReentrantLock`+`Condition` to implement waiting and wake-up operations, the implementation code is very simple and is the default waiting strategy of Disruptor. Although the slowest, it is also the option with the lowest CPU usage and the most stable. Recommended for production environments;
- `BusySpinWaitStrategy`: The performance is very good, but there is a risk of continuous spinning. Improper use will cause the CPU load to be 100%, so use with caution;
- `LiteBlockingWaitStrategy`: A lightweight waiting strategy based on `BlockingWaitStrategy`, which will omit the wake-up operation when there is no lock competition. However, the author said that the test is insufficient, so it is not recommended to use;
- `TimeoutBlockingWaitStrategy`: Waiting strategy with timeout, the business-specified processing logic will be executed after timeout;
- `LiteTimeoutBlockingWaitStrategy`: Based on the strategy of `TimeoutBlockingWaitStrategy`, the wake-up operation will be omitted when there is no lock competition;
- `SleepingWaitStrategy`: three-stage strategy, the first stage is spin, the second stage executes Thread.yield to give up the CPU, the third stage sleep execution time, and sleeps repeatedly;
- `YieldingWaitStrategy`: two-stage strategy, the first stage is spinning, and the second stage executes Thread.yield to hand over the CPU;
- `PhasedBackoffWaitStrategy`: four-stage strategy, the first stage spins for a specified number of times, the second stage spins for a specified time, the third stage executes `Thread.yield` to hand over the CPU, and the fourth stage calls the `waitFor` method of the member variable. The member variable can be set to one of the three `BlockingWaitStrategy`, `LiteBlockingWaitStrategy`, and `SleepingWaitStrategy`.

## Disruptor Why so fast?

- **RingBuffer (Ring Array)**: The RingBuffer inside Disruptor is implemented through an array. Since all elements in this array are created at once during initialization, the memory addresses of these elements are generally consecutive. The advantage of this is that when the producer continuously inserts new event objects into the RingBuffer, the memory addresses of these event objects can remain continuous, thereby utilizing the locality principle of the CPU cache to load adjacent event objects into the cache together to improve program performance. This is similar to MySQL's read-ahead mechanism, which pre-reads several consecutive pages into memory. In addition, RingBuffer is array-based and supports batch operations (processing multiple elements at one time), and can also avoid frequent memory allocation and garbage collection (RingBuffer is a fixed-size array, when adding new elements to the array, if the array is full, the new elements will overwrite the oldest elements).
- **Avoid false sharing problem**: The CPU cache is internally managed according to Cache Line (cache line). The general Cache Line size is about 64 bytes. In order to ensure that the target field occupies an exclusive Cache Line, the Disruptor will add byte padding (the first 56 bytes and the last 56 bytes) before and after the target field. This can avoid the problem of false sharing (False Sharing) of the Cache Line. At the same time, in order to allow the RingBuffer array to store data to occupy the cache line exclusively, the array is designed as invalid filling (128 bytes) + valid data.
- **Lock-free design**: Disruptor adopts a lock-free design to avoid competition and delays caused by traditional lock mechanisms. The lock-free implementation of Disruptor is relatively complex and is mainly implemented based on CAS, Memory Barrier, RingBuffer and other technologies.

To sum up, the reason why Disruptor can be so fast is based on the comprehensive effect of a series of optimization strategies, which not only make full use of the characteristics of modern CPU cache structures, but also avoid common concurrency problems and performance bottlenecks.

For a detailed introduction to the principle of Disruptor's high-performance queue, you can view this article: [A Brief Analysis of the Principle of Disruptor's High-Performance Queue](https://qin.news/disruptor/) (Refer to the article [High-Performance Queue - Disruptor](https://tech.meituan.com/2016/11/18/disruptor.html) by the Meituan technical team).

🌈 Here is an additional point: **Why can continuous object element addresses in an array improve performance? **

CPU caching achieves faster reads by storing recently used data in cache, and uses a prefetch mechanism to load data from adjacent memory ahead of time to take advantage of the locality principle.

In a computer system, the CPU primarily accesses cache and memory. Cache is a very fast, relatively small-capacity memory that is usually divided into multi-level caches, where L1, L2, and L3 represent the first-level cache, the second-level cache, and the third-level cache respectively. The closer the cache is to the CPU, the faster it is and the smaller its capacity. In comparison, the memory capacity is relatively large, but the speed is slower.

![CPU cache model diagram](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache.png)

In order to speed up the data reading process, the CPU will first load the data from the memory into the cache. If the same data needs to be accessed next time, it can be read directly from the cache without accessing the memory again. This is called a **cache hit**. In addition, in order to take advantage of the **locality principle**, the CPU will also prefetch adjacent memory data based on the previously accessed memory address, because in the program, consecutive memory addresses are usually accessed frequently. This can improve the cache hit rate of the data, thereby improving the performance of the program.

## Reference

- Disruptor The way to high performance - waiting strategy: <<http://wuwenliang.net/2022/02/28/Disruptor> The way to high performance - waiting strategy/>
- "Java Concurrent Programming in Practice" - 40 | Case Analysis (3): High-Performance Queue Disruptor: <https://time.geekbang.org/column/article/98134>

<!-- @include: @article-footer.snippet.md -->