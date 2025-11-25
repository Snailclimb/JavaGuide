---
title: Detailed explanation of Java scheduled tasks
category: system design
icon: "time"
head:
  - - meta
    - name: keywords
      content: Scheduled tasks, Quartz, Elastic-Job, XXL-JOB, PowerJob
  - - meta
    - name: description
      content: XXL-JOB was launched in 2015 and has been tested for many years. XXL-JOB is lightweight and very simple to use. Although there are performance bottlenecks, in most cases, they have no impact on the basic needs of enterprises. PowerJob is a new star in the field of distributed task scheduling, and its stability needs to be further investigated. Since ElasticJob is based on Zookeeper in terms of architectural design, and XXL-JOB is based on database, in terms of performance, ElasticJob is slightly better.
---

## Why do we need scheduled tasks?

Let’s take a look at a few very common business scenarios:

1. A certain system needs to perform data backup at 1 o'clock in the morning.
2. An e-commerce platform requires users to automatically cancel orders if they fail to pay for half an hour after placing an order.
3. A certain media aggregation platform dynamically captures data from a certain website every 10 minutes for its own use.
4. A blog platform supports sending articles regularly.
5. A certain fund platform regularly calculates the user's daily income every night and pushes the latest data to the user.
6.…

These scenarios often require us to do something at a specific time, that is, to do something at a fixed time or with a delay.

- Scheduled tasks: Perform specific tasks at designated time points, such as 8 a.m. every day, 3 p.m. every Monday, etc. Scheduled tasks can be used to perform periodic tasks, such as data backup, log cleaning, report generation, etc.
- Delayed tasks: Execute specific tasks after a certain delay time, such as after 10 minutes, after 3 hours, etc. Delayed tasks can be used to do some asynchronous work, such as order cancellation, push notifications, red envelope withdrawal, etc.

Although the applicable scenarios of the two are different, their core idea is to schedule the execution time of the task at a certain point in the future to achieve the expected scheduling effect.

## Single machine scheduled tasks

### Timer

`java.util.Timer` is an implementation of scheduled tasks that has been supported since JDK 1.3.

`Timer` internally uses a class called `TaskQueue` to store scheduled tasks, which is a priority queue based on a minimum heap implementation. `TaskQueue` will sort the tasks according to the distance between the tasks and the next execution time, ensuring that the tasks on the top of the heap are executed first. In this way, when you need to execute a task, you only need to take out the task at the top of the heap and run it!

`Timer` is relatively simple to use. Through the following method we can create a scheduled task that will be executed after 1s.

```java
// Sample code:
TimerTask task = new TimerTask() {
    public void run() {
        System.out.println("Current time: " + new Date() + "n" +
                "Thread name: " + Thread.currentThread().getName());
    }
};
System.out.println("Current time: " + new Date() + "n" +
        "Thread name: " + Thread.currentThread().getName());
Timer timer = new Timer("Timer");
long delay = 1000L;
timer.schedule(task, delay);


//Output:
Current time: Fri May 28 15:18:47 CST 2021n Thread name: main
Current time: Fri May 28 15:18:48 CST 2021n Thread name: Timer
```

However, it has many flaws, such as one `Timer` and one thread, which means that the execution of `Timer` tasks can only be executed serially. If the execution time of one task is too long, it will affect other tasks (very poor performance). Another example is that the task stops directly when an exception occurs (`Timer` only catches `InterruptedException`).

There is a comment on the `Timer` class that reads:

```JAVA
 * This class does not offer real-time guarantees: it schedules
 * tasks using the <tt>Object.wait(long)</tt> method.
 *Java 5.0 introduced the {@code java.util.concurrent} package and
 * one of the concurrency utilities therein is the {@link
 * java.util.concurrent.ScheduledThreadPoolExecutor
 * ScheduledThreadPoolExecutor} which is a thread pool for repeatedly
 * executing tasks at a given rate or delay. It is effectively a more
 * versatile replacement for the {@code Timer}/{@code TimerTask}
 * combination, as it allows multiple service threads, accepts various
 * time units, and doesn't require subclassing {@code TimerTask} (just
 * implement {@code Runnable}). Configuring {@code
 * ScheduledThreadPoolExecutor} with one thread makes it equivalent to
 * {@code Timer}.
```

The general meaning is: `ScheduledThreadPoolExecutor` supports multi-threading to execute scheduled tasks and is more powerful. It is a replacement of `Timer`.

### ScheduledExecutorService

`ScheduledExecutorService` is an interface with multiple implementation classes, the more commonly used one is `ScheduledThreadPoolExecutor`.

![](https://oss.javaguide.cn/javaguide/20210607154324712.png)

`ScheduledThreadPoolExecutor` itself is a thread pool that supports concurrent execution of tasks. And, it uses `DelayedWorkQueue` internally as a task queue.

```java
// Sample code:
TimerTask repeatedTask = new TimerTask() {
    @SneakyThrows
    public void run() {
        System.out.println("Current time: " + new Date() + "n" +
                "Thread name: " + Thread.currentThread().getName());
    }
};
System.out.println("Current time: " + new Date() + "n" +
        "Thread name: " + Thread.currentThread().getName());
ScheduledExecutorService executor = Executors.newScheduledThreadPool(3);
long delay = 1000L;
long period = 1000L;
executor.scheduleAtFixedRate(repeatedTask, delay, period, TimeUnit.MILLISECONDS);
Thread.sleep(delay + period * 5);
executor.shutdown();
//Output:
Current time: Fri May 28 15:40:46 CST 2021n Thread name: main
Current time: Fri May 28 15:40:47 CST 2021n Thread name: pool-1-thread-1
Current time: Fri May 28 15:40:48 CST 2021n Thread name: pool-1-thread-1
Current time: Fri May 28 15:40:49 CST 2021n Thread name: pool-1-thread-2
Current time: Fri May 28 15:40:50 CST 2021n Thread name: pool-1-thread-2
Current time: Fri May 28 15:40:51 CST 2021n Thread name: pool-1-thread-2
Current time: Fri May 28 15:40:52 CST 2021n Thread name: pool-1-thread-2
```

Whether using `Timer` or `ScheduledExecutorService`, you cannot use Cron expressions to specify the specific time for task execution.

### DelayQueue`DelayQueue` 是 JUC 包(`java.util.concurrent)`为我们提供的延迟队列，用于实现延时任务比如订单下单 15 分钟未支付直接取消。它是 `BlockingQueue` 的一种，底层是一个基于 `PriorityQueue` 实现的一个无界队列，是线程安全的。关于`PriorityQueue`可以参考笔者编写的这篇文章：[PriorityQueue 源码分析](https://javaguide.cn/java/collection/priorityqueue-source-code.html) 。

![BlockingQueue 的实现类](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

`DelayQueue` 和 `Timer/TimerTask` 都可以用于实现定时任务调度，但是它们的实现方式不同。`DelayQueue` 是基于优先级队列和堆排序算法实现的，可以实现多个任务按照时间先后顺序执行；而 `Timer/TimerTask` 是基于单线程实现的，只能按照任务的执行顺序依次执行，如果某个任务执行时间过长，会影响其他任务的执行。另外，`DelayQueue` 还支持动态添加和移除任务，而 `Timer/TimerTask` 只能在创建时指定任务。

关于 `DelayQueue` 的详细介绍，请参考我写的这篇文章：[`DelayQueue` 源码分析](https://javaguide.cn/java/collection/delayqueue-source-code.html)。

### Spring Task

我们直接通过 Spring 提供的 `@Scheduled` 注解即可定义定时任务，非常方便！

```java
/**
 * cron：使用Cron表达式。　每分钟的1，2秒运行
 */
@Scheduled(cron = "1-2 * * * * ? ")
public void reportCurrentTimeWithCronExpression() {
  log.info("Cron Expression: The time is now {}", dateFormat.format(new Date()));
}

```

我在大学那会做的一个 SSM 的企业级项目，就是用的 Spring Task 来做的定时任务。

并且，Spring Task 还是支持 **Cron 表达式** 的。Cron 表达式主要用于定时作业(定时任务)系统定义执行时间或执行频率的表达式，非常厉害，你可以通过 Cron 表达式进行设置定时任务每天或者每个月什么时候执行等等操作。咱们要学习定时任务的话，Cron 表达式是一定是要重点关注的。推荐一个在线 Cron 表达式生成器：[http://cron.qqe2.com/](http://cron.qqe2.com/) 。

但是，Spring 自带的定时调度只支持单机，并且提供的功能比较单一。之前写过一篇文章:[《5 分钟搞懂如何在 Spring Boot 中 Schedule Tasks》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485563&idx=1&sn=7419341f04036a10b141b74624a3f8c9&chksm=cea247b0f9d5cea6440759e6d49b4e77d06f4c99470243a10c1463834e873ca90266413fbc92&token=2133161636&lang=zh_CN#rd) ，不了解的小伙伴可以参考一下。

Spring Task 底层是基于 JDK 的 `ScheduledThreadPoolExecutor` 线程池来实现的。

**优缺点总结：**

- 优点：简单，轻量，支持 Cron 表达式
- 缺点：功能单一

### 时间轮

Kafka、Dubbo、ZooKeeper、Netty、Caffeine、Akka 中都有对时间轮的实现。

时间轮简单来说就是一个环形的队列（底层一般基于数组实现），队列中的每一个元素（时间格）都可以存放一个定时任务列表。

时间轮中的每个时间格代表了时间轮的基本时间跨度或者说时间精度，假如时间一秒走一个时间格的话，那么这个时间轮的最高精度就是 1 秒（也就是说 3 s 和 3.9s 会在同一个时间格中）。

下图是一个有 12 个时间格的时间轮，转完一圈需要 12 s。当我们需要新建一个 3s 后执行的定时任务，只需要将定时任务放在下标为 3 的时间格中即可。当我们需要新建一个 9s 后执行的定时任务，只需要将定时任务放在下标为 9 的时间格中即可。

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/one-layers-of-time-wheel.png)

那当我们需要创建一个 13s 后执行的定时任务怎么办呢？这个时候可以引入一叫做 **圈数/轮数** 的概念，也就是说这个任务还是放在下标为 1 的时间格中， 不过它的圈数为 2 。

除了增加圈数这种方法之外，还有一种 **多层次时间轮** （类似手表），Kafka 采用的就是这种方案。

针对下图的时间轮，我来举一个例子便于大家理解。

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/three-layers-of-time-wheel.png)

上图的时间轮(ms -> s)，第 1 层的时间精度为 1 ，第 2 层的时间精度为 20 ，第 3 层的时间精度为 400。假如我们需要添加一个 350s 后执行的任务 A 的话（当前时间是 0s），这个任务会被放在第 2 层（因为第二层的时间跨度为 20\*20=400>350）的第 350/20=17 个时间格子。

当第一层转了 17 圈之后，时间过去了 340s ，第 2 层的指针此时来到第 17 个时间格子。此时，第 2 层第 17 个格子的任务会被移动到第 1 层。

任务 A 当前是 10s 之后执行，因此它会被移动到第 1 层的第 10 个时间格子。

这里在层与层之间的移动也叫做时间轮的升降级。参考手表来理解就好！

**时间轮比较适合任务数量比较多的定时任务场景，它的任务写入和执行的时间复杂度都是 0（1）。**

## 分布式定时任务

### Redis

Redis 是可以用来做延时任务的，基于 Redis 实现延时任务的功能无非就下面两种方案：

1. Redis 过期事件监听
2. Redisson 内置的延时队列

这部分内容的详细介绍我放在了[《后端面试高频系统设计&场景题》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html)中，有需要的同学可以进入星球后阅读学习。篇幅太多，这里就不重复分享了。

![《后端面试高频系统设计&场景题》](https://oss.javaguide.cn/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

### MQ

大部分消息队列，例如 RocketMQ、RabbitMQ，都支持定时/延时消息。定时消息和延时消息本质其实是相同的，都是服务端根据消息设置的定时时间在某一固定时刻将消息投递给消费者消费。

不过，在使用 MQ 定时消息之前一定要看清楚其使用限制，以免不适合项目需求，例如 RocketMQ 定时时长最大值默认为 24 小时且不支持自定义修改、只支持 18 个 Level 的延时并不支持任意时间。

**优缺点总结：**

- **优点**：可以与 Spring 集成、支持分布式、支持集群、性能不错
- **缺点**：功能性较差、不灵活、需要保障消息可靠性

## 分布式任务调度框架

如果我们需要一些高级特性比如支持任务在分布式场景下的分片和高可用的话，我们就需要用到分布式任务调度框架了。

通常情况下，一个分布式定时任务的执行往往涉及到下面这些角色：

- **任务**：首先肯定是要执行的任务，这个任务就是具体的业务逻辑比如定时发送文章。
- **调度器**：其次是调度中心，调度中心主要负责任务管理，会分配任务给执行器。
- **执行器**：最后就是执行器，执行器接收调度器分派的任务并执行。

### Quartz

一个很火的开源任务调度框架，完全由 Java 写成。Quartz 可以说是 Java 定时任务领域的老大哥或者说参考标准，其他的任务调度框架基本都是基于 Quartz 开发的，比如当当网的`elastic-job`就是基于 Quartz 二次开发之后的分布式调度解决方案。

使用 Quartz 可以很方便地与 Spring 集成，并且支持动态添加任务和集群。但是，Quartz 使用起来也比较麻烦，API 繁琐。

Moreover, Quartz does not have a built-in UI management console, but you can use the [quartzui](https://github.com/zhaopeiym/quartzui) open source project to solve this problem.

In addition, Quartz also supports distributed tasks. However, it is made at the database level through the database locking mechanism, and has many disadvantages, such as severe system intrusion and unbalanced node load. It feels a bit pseudo-distributed.

**Summary of advantages and disadvantages:**

- Advantages: Can be integrated with Spring and supports dynamic addition of tasks and clusters.
- Disadvantages: Unfriendly distributed support, no support for visual task management, troublesome to use (compared to other frameworks of the same type)

### Elastic-Job

ElasticJob is an open source distributed scheduling solution oriented to the Internet ecosystem and massive tasks. It consists of two independent sub-projects, ElasticJob-Lite and ElasticJob-Cloud.

The comparison between ElasticJob-Lite and ElasticJob-Cloud is as follows:

| | ElasticJob-Lite | ElasticJob-Cloud |
| :------- | :-------------- | ------------------ |
| Decentralized | Yes | No |
| Resource allocation | Not supported | Supported |
| Operation Mode | Resident | Resident + Instantaneous |
| Deployment dependencies | ZooKeeper | ZooKeeper + Mesos |

`ElasticJob` supports tasks such as sharding and high availability in distributed scenarios, as well as task visual management.

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/elasticjob-feature-list.png)

The architectural design of ElasticJob-Lite is shown in the figure below:

![Architecture design of ElasticJob-Lite](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/elasticjob-lite-architecture-design.png)

As can be seen from the above figure, Elastic-Job does not have the concept of a scheduling center. Instead, it uses ZooKeeper as the registration center. The registration center is responsible for coordinating the distribution of tasks to different nodes.

Timing scheduling in Elastic-Job is triggered by the executor itself. This design is also called decentralized design (scheduling and processing are completed by the executor alone).

```java
@Component
@ElasticJobConf(name = "dayJob", cron = "0/10 * * * * ?", shardingTotalCount = 2,
        shardingItemParameters = "0=AAAA,1=BBBB", description = "Simple task", failover = true)
public class TestJob implements SimpleJob {
    @Override
    public void execute(ShardingContext shardingContext) {
        log.info("TestJob task name: [{}], number of slices: [{}], param=[{}]", shardingContext.getJobName(), shardingContext.getShardingTotalCount(),
                shardingContext.getShardingParameter());
    }
}
```

**Related address:**

- GitHub address: <https://github.com/apache/shardingsphere-elasticjob. >
- Official website: <https://shardingsphere.apache.org/elasticjob/index_zh.html>.

**Summary of advantages and disadvantages:**

- Advantages: Can be integrated with Spring, supports distribution, supports clustering, has good performance, and supports visual task management
- Disadvantages: relies on additional middleware such as Zookeeper (increased complexity, reduced reliability, and higher maintenance costs)

###XXL-JOB

`XXL-JOB` was open sourced in 2015. It is an excellent lightweight distributed task scheduling framework that supports visual task management, elastic expansion and contraction, task failure retries and alarms, task sharding and other functions.

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/xxljob-feature-list.png)

According to the official website of `XXL-JOB`, it solves many shortcomings of Quartz.

> Quartz, as a leader in open source job scheduling, is the first choice for job scheduling. However, in a cluster environment, Quartz uses APIs to manage tasks, which can avoid the above problems. However, the following problems also exist:
>
> - Problem 1: The method of calling API to operate tasks is not user-friendly;
> - Problem 2: The business QuartzJobBean needs to be persisted into the underlying data table, and the system is quite intrusive.
> - Problem 3: Scheduling logic and QuartzJobBean are coupled in the same project, which will lead to a problem. When the number of scheduling tasks gradually increases, and the scheduling task logic gradually increases, the performance of the scheduling system will be greatly limited by the business;
> - Question 4: The bottom layer of quartz obtains DB locks in a "preemptive manner" and the successfully preempted node is responsible for running the task, which will lead to a very large disparity in node load. However, XXL-JOB implements "co-distribution" running tasks through executors, giving full play to the advantages of the cluster and balancing the load on each node.
>
> XXL-JOB makes up for the above shortcomings of quartz.

The architectural design of `XXL-JOB` is shown in the figure below:

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/xxljob-architecture-design-v2.1.0.png)

As can be seen from the above figure, `XXL-JOB` consists of two parts: **Scheduling Center** and **Executor**. The dispatch center is mainly responsible for task management, executor management and log management. The executor mainly receives and processes scheduling signals. In addition, when the dispatch center performs task scheduling, it is implemented through self-developed RPC.

Different from the decentralized design of Elastic-Job, this design of `XXL-JOB` is also called a centralized design (the dispatch center schedules multiple executors to execute tasks).

Similar to `Quzrtz`, `XXL-JOB` also schedules tasks based on database locks, which has performance bottlenecks. However, generally when the workload is not particularly large, there is no impact and it can meet the requirements of most companies.

Don’t be intimidated by the architecture diagram of `XXL-JOB`. In fact, if we want to use `XXL-JOB`, we only need to rewrite the `IJobHandler` to customize the task execution logic. It is very easy to use!

```java
@JobHandler(value="myApiJobHandler")
@Component
public class MyApiJobHandler extends IJobHandler {

    @Override
    public ReturnT<String> execute(String param) throws Exception {
        //......
        return ReturnT.SUCCESS;
    }
}
```

Tasks can also be defined directly based on annotations.

```java
@XxlJob("myAnnotationJobHandler")
public ReturnT<String> myAnnotationJobHandler(String param) throws Exception {
  //......
  return ReturnT.SUCCESS;
}
```

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/xxljob-admin-task-management.png)

**Related address:**

- GitHub address: <https://github.com/xuxueli/xxl-job/. >
- Official introduction: <https://www.xuxueli.com/xxl-job/>.

**Summary of advantages and disadvantages:**

- Advantages: ready to use out of the box (low learning cost), integrated with Spring, supports distribution, supports clusters, and supports visual task management.
- Disadvantages: Dynamically adding tasks is not supported (if you absolutely want to dynamically create tasks, it is also supported, see: [xxl-job issue277](https://github.com/xuxueli/xxl-job/issues/277)).

### PowerJob

A distributed task scheduling framework that deserves attention, a new star in the field of distributed task scheduling. At present, many companies have accessed it, such as OPPO, JD.com, ZTO, and Cisco.The birth of this framework is also quite interesting. The author of PowerJob was an intern at Alibaba, and Alibaba used the internally developed SchedulerX (Alibaba Cloud paid product). After the internship ended, the author of PowerJob left Alibaba. I thought about developing a SchedulerX on my own to prevent SchedulerX from meeting the demand one day, so PowerJob was born.

For more stories about PowerJob, friends can check out the PowerJob author’s video ["Me and My Task Scheduling Middleware"] (https://www.bilibili.com/video/BV1SK411A7F3/). A simple summary is: "Games are no longer interesting. I want to take up the banner of a new generation of distributed task scheduling and computing framework!".

Since SchedulerX is a RMB product, I won’t introduce it in detail here. PowerJob officials have also compared it with QuartZ, XXL-JOB and SchedulerX.

| | QuartZ | xxl-job | SchedulerX 2.0 | PowerJob |
| ----------------- | ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| Timing Type | CRON | CRON | CRON, Fixed Frequency, Fixed Delay, OpenAPI | **CRON, Fixed Frequency, Fixed Delay, OpenAPI** |
| Task type | Built-in Java | Built-in Java, GLUE Java, Shell, Python and other scripts | Built-in Java, external Java (FatJar), Shell, Python and other scripts | **Built-in Java, external Java (container), Shell, Python and other scripts** |
| Distributed Computing | None | Static Sharding | MapReduce Dynamic Sharding | **MapReduce Dynamic Sharding** |
| Online task management | Not supported | Supported | Supported | **Supported** |
| Log white screen | Not supported | Supported | Not supported | **Supported** |
| Scheduling method and performance | Based on database locks, there are performance bottlenecks | Based on database locks, there are performance bottlenecks | Unknown | **Lock-free design, strong performance without upper limit** |
| Alarm Monitoring | None | Email | SMS | **WebHook, Email, DingTalk and Custom Extensions** |
| System dependencies | JDBC supported relational databases (MySQL, Oracle...) | MySQL | RMB | **Any Spring Data Jpa supported relational databases (MySQL, Oracle...)** |
| DAG Workflow | Not supported | Not supported | Supported | **Supported** |

## Summary of scheduled task plan

Common solutions for stand-alone scheduled tasks include `Timer`, `ScheduledExecutorService`, `DelayQueue`, Spring Task and time wheel. The most commonly used and recommended one is time wheel. In addition, these stand-alone scheduled task solutions can also implement delayed tasks.

Although Redis and MQ can implement distributed timing tasks, they are not specifically used for distributed timing tasks. They do not provide relatively complete and powerful distributed timing task functions. Moreover, both are not suitable for executing periodic scheduled tasks, because they can only guarantee that the message is consumed once, but cannot guarantee that the message is consumed multiple times. Therefore, they are more suitable for performing one-time delayed tasks, such as order cancellation and red envelope withdrawal. In actual projects, MQ delayed tasks are used more often, which can reduce the coupling between businesses.

Quartz, Elastic-Job, XXL-JOB and PowerJob are frameworks specifically used for distributed scheduling. They provide more complete and powerful distributed scheduled task functions and are more suitable for executing periodic scheduled tasks. In addition to Quartz, the other three support visual task management.

Launched in 2015, XXL-JOB has proven itself over the years. XXL-JOB is lightweight and very simple to use. Although there are performance bottlenecks, in most cases, they have no impact on the basic needs of enterprises. PowerJob is a new star in the field of distributed task scheduling, and its stability needs to be further investigated. Since ElasticJob is based on Zookeeper in terms of architectural design, and XXL-JOB is based on database, in terms of performance, ElasticJob is slightly better.

This article does not introduce actual use, but that does not mean that actual use is not important. Before I wrote this article, I had already written the corresponding demo. Like Quartz, I used it when I was in college. However, Spring was used at that time. In order to have a better experience, I actually tried it on Spring Boot myself. It is untenable to say that a framework is not easy to use if you have not actually used it.

<!-- @include: @article-footer.snippet.md -->