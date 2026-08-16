---
title: Java 线程池最佳实践
description: Java 线程池最佳实践总结：从业务吞吐、任务耗时和下游容量估算线程数与队列长度，讲解队列堆积、拒绝策略、任务超时、异常处理、动态调参、监控和虚拟线程等生产问题。
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: 线程池最佳实践,ThreadPoolExecutor参数配置,线程池监控,队列堆积,CallerRunsPolicy,动态线程池,任务超时,虚拟线程
---

看到 `corePoolSize = 8`、`maximumPoolSize = 16`、`queueCapacity = 1000` 这组配置，仅凭机器有 8 个 CPU 核心，还判断不了它是否合适。图片压缩、批量查数据库和调用外部接口的耗时构成不同，需要的线程数可能相差很大。任务进入多快、执行多久、允许排队多久，以及数据库和下游能接住多少并发，都会影响最终配置。

七大参数、任务执行流程、阻塞队列及拒绝策略的基础知识，可以先看 [Java 线程池详解](./java-thread-pool-summary.md)。生产环境还要处理参数估算、过载、任务超时和监控，这些问题更依赖业务容量和运行数据。

## 正确声明线程池

业务线程池通常需要明确指定线程数、队列容量、线程名称和拒绝策略。使用 `Executors` 的快捷方法虽然方便，但部分方法会创建近似无界的队列或允许线程数持续增长，业务高峰期容易积压大量任务或创建过多线程。

- `newFixedThreadPool()` 和 `newSingleThreadExecutor()` 使用无界的 `LinkedBlockingQueue`，任务持续进入时，队列可能不断增长。
- `newCachedThreadPool()` 使用 `SynchronousQueue`，最大线程数是 `Integer.MAX_VALUE`，提交速度长期高于处理速度时可能创建大量线程。
- `newScheduledThreadPool()` 使用无界的 `DelayedWorkQueue`，同样要考虑延迟任务不断堆积的问题。

因此，普通业务线程池更适合直接使用 `ThreadPoolExecutor`，把容量限制写在配置里：

```java
ThreadFactory threadFactory = new NamingThreadFactory("order-query");

ThreadPoolExecutor executor = new ThreadPoolExecutor(
        8,
        16,
        60L,
        TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(200),
        threadFactory,
        new ThreadPoolExecutor.AbortPolicy()
);
```

示例中的 `8`、`16` 和 `200` 只用于展示参数位置，不能直接用于生产环境。参数要结合业务容量和压测结果确定。

线程工厂至少应该为线程设置有业务含义的名称：

```java
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

public final class NamingThreadFactory implements ThreadFactory {

    private final AtomicInteger sequence = new AtomicInteger();
    private final String prefix;

    public NamingThreadFactory(String prefix) {
        this.prefix = prefix;
    }

    @Override
    public Thread newThread(Runnable task) {
        Thread thread = new Thread(task);
        thread.setName(prefix + "-" + sequence.incrementAndGet());
        thread.setDaemon(false);
        return thread;
    }
}
```

线程名会出现在线程转储、日志和监控数据中。`pool-1-thread-3` 很难判断属于哪项业务，`order-query-3` 则能直接缩小排查范围。

## 线程池参数怎么估算？

CPU 密集型任务常从 CPU 核数附近起步，I/O 密集型任务可以配置更多线程。这类经验适合做初始判断，实际配置还要回答几个更具体的问题：高峰期每秒会提交多少个任务？一个任务会运行多久？其中多少时间在等待 I/O？下游能接住多少并发？任务最多允许排队多久？

在一段相对稳定的高峰窗口内，假设每秒提交的任务数为 $\lambda$，任务平均执行时间为 $T$ 秒，执行中的任务数量 $L$ 可以先按下面的方式估算：

$$
L \approx \lambda \times T
$$

例如，某个接口高峰期每秒产生 400 个异步任务，每个任务平均执行 80 ms，对应的平均并发需求约为 `400 × 0.08 = 32`。这只是估算起点，不能据此直接把线程数设置为 32，原因包括：

- 平均耗时会掩盖慢任务，P95、P99 可能远高于平均值。
- 任务耗时上涨时，并发需求也会随之上涨。
- CPU、内存和上下文切换会限制平台线程数量。
- 数据库连接池或下游接口可能只允许更低的并发。

《Java 并发编程实战》给出过一个包含目标 CPU 利用率的估算式。对于混合了计算和等待的任务，可以用它辅助确定初始值：

$$
N_{threads} \approx N_{cpu} \times U_{cpu} \times \left(1 + \frac{W}{C}\right)
$$

其中，$N_{cpu}$ 是 CPU 核数，$U_{cpu}$ 是目标 CPU 利用率，$W/C$ 是任务等待时间与计算时间的比值。

等待时间越长，理论上可以安排越多线程，让一部分任务等待 I/O 时，其他任务继续使用 CPU。不过，当等待来自数据库连接池耗尽、下游限流或锁竞争时，增加线程只会制造更多等待。公式无法识别这种区别。

初始值确定后，还要用接近真实流量的压测逐步调整。压测时同时观察吞吐、P95/P99 延迟、CPU、上下文切换、队列等待时间和下游连接池，不能只看应用 QPS。

## 有界队列应该设置多大？

队列主要用来吸收短时间的流量波动，不适合长期保存来不及处理的任务。队列过小，轻微抖动就可能触发拒绝；队列过大，任务虽然被接收了，却可能在真正执行前已经超过业务超时时间，还会占用大量堆内存。

可以先用突发流量估算需要的缓冲量。$\lambda_{in}$ 表示任务进入速率，$\lambda_{out}$ 表示完成速率，$\Delta t$ 表示突发持续时间：

$$
Q \approx (\lambda_{in} - \lambda_{out}) \times \Delta t
$$

例如，线程池每秒能完成约 500 个任务，某次流量高峰会在 2 秒内把提交速率推到每秒 600 个，那么这段时间会多出约 200 个任务。这个数字只能说明短时缓冲需求，最终容量还要受任务时效和内存限制。

队列等待时间也可以做一个粗略判断：队列中有 500 个任务，线程池每秒完成 500 个任务，队尾任务大约还要等待 1 秒。接口总超时只有 800 ms 时，这批任务即使入队也很难按时返回。

工作线程达到 `corePoolSize` 后，新任务会先进入队列；只有队列满了，线程池才会继续创建线程，直到 `maximumPoolSize`。队列设置得很大时，线程数可能长期停在核心线程数，最大线程数很少有机会生效。无界队列下，`maximumPoolSize` 实际上不会参与扩容。

确定队列容量时，至少要做四项验证：

1. 用高峰流量和突发持续时间估算缓冲需求。
2. 检查队尾任务的预计等待时间是否超过业务期限。
3. 测量排队任务占用的内存，尤其是携带文件、请求体或大集合的任务。
4. 在队列满、任务被拒绝的情况下验证降级和告警是否生效。

## 线程数为什么要和下游容量一起设计？

不少 I/O 任务最终会访问数据库、Redis 或外部接口。线程池可以让更多任务同时发起调用，却不会增加下游的处理能力。

假设订单服务部署了 4 个实例，每个实例给某项数据库任务配置 40 个线程，理论上可能同时产生 160 个数据库请求。数据库连接池每个实例只有 20 个连接时，大量线程会阻塞在获取连接的位置；数据库本身只能稳定承受 80 个并发查询时，即便继续扩大连接池，也可能把压力转移到数据库。

配置时要从整条调用链分配并发预算：

- 数据库连接要给 Web 请求、定时任务和其他业务线程池预留份额，不能全部交给一个线程池。
- HTTP 客户端连接池的每路由限制和总连接数，应该与实际调用并发匹配。
- 下游有限流阈值时，上游所有实例的并发总和不能长期超过该阈值。
- 一个任务会串行或并行访问多个依赖时，要分别计算每个依赖的占用时间。

线程数增加后，如果活跃连接、获取连接等待时间、下游 P99 和错误率同时上升，继续扩线程通常没有帮助。此时应当减少无效并发，处理慢 SQL、下游超时或热点资源。

## 队列堆积后怎么处理？

队列持续增长，说明任务进入速度已经超过完成速度。流量突然增加会造成堆积，任务本身变慢也会造成堆积，两者的处理方式不同。

| 现象                               | 需要核对的证据                     | 处理方向                             |
| ---------------------------------- | ---------------------------------- | ------------------------------------ |
| 提交速率上涨，任务执行时间基本不变 | 入口 QPS、活动流量、调用方重试     | 入口限流、扩实例或用 MQ 削峰         |
| 提交速率稳定，任务执行时间上涨     | 线程栈、慢 SQL、锁等待、下游延迟   | 处理慢任务和下游故障，不急着增加线程 |
| 活跃线程已满，CPU 长期接近上限     | CPU 使用率、运行队列、上下文切换   | 优化计算、拆分任务或扩机器           |
| 线程大量等待数据库连接             | 连接池活跃数、等待数、获取连接超时 | 限制并发、优化 SQL，重新分配连接预算 |
| 排队时间已经超过任务有效期         | 队列等待 P95/P99、业务超时         | 快速失败、丢弃过期任务或转入补偿流程 |
| 队列和拒绝增加，下游仍有容量       | CPU、连接池和下游指标正常          | 压测后调整线程数、队列或实例数       |

扩机器适合服务整体容量不足且任务可以横向拆分的情况。扩线程适合单实例仍有 CPU 和下游余量，但当前并发度偏低的情况。任务已经失去时效时，继续排队意义不大；不能丢的异步任务则应先写入 MQ 或数据库，由可重试的消费流程处理。

线上已经出现线程池堆积时，可以参考 [Java 后端线上问题排查](../jvm/jvm-in-action.md#线程池队列堆积怎么排查)，结合提交速率、完成速率、线程栈和下游状态定位。

## CallerRunsPolicy 能形成背压吗？

`CallerRunsPolicy` 会让调用 `execute()` 的线程执行被拒绝的任务。提交线程因此变慢，后续任务的提交速度也可能下降，所以它具备一定的反馈调节作用。

效果取决于提交者是谁。消息消费线程或批处理调度线程被迫执行任务时，上游拉取速度可能自然下降；Tomcat 请求线程执行长任务时，请求线程会被占住，接口延迟和请求线程池压力也会增加。提交线程持有锁或数据库事务时，任务在调用线程执行还会延长锁和事务的占用时间。

线程池关闭后，`CallerRunsPolicy` 不会再执行任务，而是直接丢弃。业务不能接受丢任务时，需要自定义拒绝处理：记录拒绝次数，返回明确失败，或者把任务写入可靠存储。不要只换一个拒绝策略，就把任务可靠性问题留给调用方。

## 不同业务要不要隔离线程池？

共享线程池会让一类慢任务占用其他业务的执行资源。支付回调、报表导出和普通通知的时效、失败处理方式、依赖资源都不同，放在同一个线程池里很难配置统一的线程数、队列和拒绝策略。

隔离也不是每个接口都创建一个线程池。通常按照任务优先级、耗时特征和下游依赖划分：调用同一个慢服务的任务可以单独隔离；核心交易和非核心通知不共用队列；CPU 密集任务不要和大量阻塞 I/O 任务混在一起。线程池过多会增加线程、队列、监控和配置成本，同类任务可以复用一个池。

现有文章曾引用过一个父子任务共用线程池的事故案例（来源：[线程池运用不当的一次线上事故](https://heapdump.cn/article/646639)）：

![案例代码概览](https://oss.javaguide.cn/github/javaguide/java/concurrent/production-accident-threadpool-sharing-example.png)

假设线程池有 $n$ 个工作线程，同时运行了 $n$ 个父任务。每个父任务提交子任务后，又同步等待子任务结束。子任务进入队列，却没有空闲线程可以执行；父任务不结束，工作线程也不会释放，最终形成线程饥饿死锁。

![线程池使用不当导致死锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/production-accident-threadpool-sharing-deadlock.png)

父任务和它同步等待的子任务不应使用这个有界线程池形成环形等待。可以让父任务直接执行子逻辑、改为不阻塞的任务编排，或者为确实需要隔离的子任务分配独立执行资源。

## 任务超时后会自动停止吗？

`Future.get(timeout, unit)` 只限制调用线程等待结果的时间。抛出 `TimeoutException` 时，后台任务可能仍在运行。调用 `cancel(true)` 可以尝试中断执行线程，但中断是协作机制，任务不检查中断状态，或者底层调用不响应中断，任务仍可能继续执行。

```java
Future<String> future = executor.submit(this::callRemoteService);

try {
    return future.get(200, TimeUnit.MILLISECONDS);
} catch (TimeoutException e) {
    future.cancel(true);
    throw new IllegalStateException("调用超时", e);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new IllegalStateException("等待任务时被中断", e);
} catch (ExecutionException e) {
    throw new IllegalStateException("任务执行失败", e.getCause());
}
```

这段代码还不够替代网络超时。HTTP、数据库和 Redis 客户端仍要配置连接、读取和总调用超时，否则线程可能一直卡在不响应中断的底层操作里。

任务代码收到 `InterruptedException` 后，一般要结束当前工作；如果无法在当前层结束，应恢复中断标记，让上层继续处理：

```java
try {
    blockingCall();
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    return;
}
```

`CompletableFuture.orTimeout()` 会让 `CompletableFuture` 超时后以异常完成，但不会自动终止底层任务。`CompletableFuture.cancel(true)` 的参数在该实现中也不会触发线程中断。使用 `CompletableFuture` 编排阻塞任务时，仍要给底层调用配置超时和取消方案。

## 异步任务的异常为什么容易丢？

通过 `execute()` 提交的 `Runnable` 抛出未捕获异常时，工作线程会异常结束，可以由线程的 `UncaughtExceptionHandler` 记录。通过 `submit()` 提交时，任务通常被包装成 `FutureTask`，异常保存在返回的 `Future` 中；调用方既不保存 `Future`，也不调用 `get()`，异常就可能没有业务日志。

`ThreadPoolExecutor.afterExecute()` 也有同样的区别。使用 `submit()` 时，传给 `afterExecute()` 的 `Throwable` 通常是 `null`，需要判断任务是否为已经完成的 `Future`，再通过 `get()` 取得异常。

异常处理方式最好在项目内统一：调用方消费 `Future`，任务入口主动捕获并记录异常，或者扩展线程池集中处理。日志要带上任务类型、业务 ID 和 Trace ID，不能只打印一段脱离业务的堆栈。

## 线程池应该监控哪些指标？

`ThreadPoolExecutor` 自带的统计信息可以看到当前线程数、活跃线程数、历史最大线程数、任务总数、完成任务数和队列长度。这些值多数是近似值，适合监控和趋势分析，不适合参与要求严格一致性的业务判断。

生产监控至少应覆盖：

- **任务流量**：提交速率、开始执行速率和完成速率。
- **线程状态**：当前线程数、活跃线程数、历史最大线程数和活跃度。
- **队列状态**：当前长度、总容量、使用率和队列等待时间。
- **任务结果**：执行时间、成功数、异常数、超时数、取消数和拒绝数。
- **关联资源**：CPU、堆内存、数据库连接池、HTTP 连接池和下游延迟。

任务总数和完成任务数是累计值，需要计算一段时间内的差值才能得到速率。队列长度也要结合变化趋势：队列都是 100，一个正在从 500 降到 100，另一个从 10 涨到 100，风险并不相同。

排队时间和执行时间不能混成一个指标。排队时间上涨、执行时间稳定，多半是容量不足或流量突增；执行时间先上涨，随后队列开始增长，应优先检查任务逻辑和下游。可以在提交任务时记录时间戳，在任务真正开始和结束时分别计算两段耗时。

队列在一个采集周期里突然变长，可能只是流量尖峰，很快就会回落。告警除了阈值，还应加上持续时间，并确认积压能不能自行消化。队列长时间处于高水位、完成速率连续低于提交速率，说明旧任务越积越多；P99 排队时间接近任务可等待时间时，即使队列没满，也应该告警。拒绝次数要单独统计。核心任务出现拒绝立即告警，允许丢弃的任务再按拒绝比例和持续时间设置阈值。

## 动态调参能解决什么问题？

任务耗时没有明显变化，CPU、连接池和下游也还有余量，只是当前并发赶不上提交速度，这时可以调整线程数。要是线程都卡在数据库连接、慢 SQL 或下游超时上，调大线程数只会多出一批等待者。

`ThreadPoolExecutor` 的部分参数可以在线修改，不过生效方式并不相同。运行期间可以修改 `corePoolSize`、`maximumPoolSize`、`keepAliveTime`、拒绝策略和线程工厂。调大核心线程数后，只要队列中还有任务，线程池就会按需创建新线程。核心线程数或最大线程数调小，不会中断正在执行的任务；超出的工作线程会在空闲后退出。新设置的线程工厂只影响此后创建的线程，不会重命名已经存在的工作线程。

修改核心线程数和最大线程数时要注意顺序：

- 新的核心线程数高于旧的最大线程数，先调大最大线程数，再调整核心线程数。
- 新的最大线程数低于旧的核心线程数，先调小核心线程数，再调整最大线程数。

否则，参数校验会抛出 `IllegalArgumentException`。

JDK 没有提供修改现有阻塞队列容量的通用方法。需要调整队列时，可以使用经过验证的可变容量队列或动态线程池框架；自行修改 `LinkedBlockingQueue` 实现要同时处理并发可见性、入队条件和唤醒逻辑，不能只改一个容量字段。

美团技术团队在[《Java 线程池实现原理及其在美团业务中的实践》](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)中介绍过线程池参数动态配置和监控告警的实现思路。开源方案中，[Hippo4j](https://github.com/opengoofy/hippo4j) 和 [Dynamic TP](https://github.com/dromara/dynamic-tp) 都提供了动态配置、监控和告警能力。引入前仍要核对项目使用的线程池类型、配置中心、框架版本和故障降级方式。

业务高峰前预调参数，最好以历史指标或压测结果为依据。调整后，如果完成速率没有提高，反而出现 CPU 上涨、连接池等待或下游错误率增加，应当回滚参数，继续检查任务本身和依赖。

线上修改时应保留参数上下限、变更记录、灰度范围和回滚值。每次尽量只改一个主要变量，观察任务完成速率、排队时间、拒绝数和下游压力，再决定是否继续调整。

## 还有哪些容易忽略的问题？

### 不要重复创建线程池

线程池用于复用线程，不应在每个请求或每次方法调用中重新创建。频繁创建会增加线程启动和销毁开销，也容易遗漏关闭逻辑。应用级线程池通常交给容器统一管理生命周期。

Spring 的 `@Async`、定时任务、Web 容器和部分客户端内部也会使用线程池。项目没有显式调用 `new ThreadPoolExecutor()`，不代表不存在需要配置和监控的线程池。

### 不要让长任务占满共享线程池

长时间阻塞的任务会占用工作线程，后续短任务只能排队。报表导出、文件处理和慢外部接口适合使用独立的执行资源，或者改成异步任务并向用户返回任务状态。

`CompletableFuture` 只负责任务编排，不会把阻塞式网络请求变成非阻塞操作。没有显式指定 `Executor` 的异步方法通常使用公共线程池，公共线程池被阻塞后，还可能影响应用中的其他异步任务。

### 清理线程上下文

线程池会复用线程。前一个任务写入 `ThreadLocal` 后没有清理，后续任务可能在同一线程上读到旧值，还可能让大对象长期被工作线程引用。

上下文传递和清理应由统一的任务包装器处理，在 `finally` 中恢复或删除原值。日志 MDC、登录信息和租户信息都要考虑这个问题。跨线程传递场景也可以使用 [TransmittableThreadLocal](https://github.com/alibaba/transmittable-thread-local)，但仍要确认包装方式和清理时机。

### 正确关闭线程池

`shutdown()` 不再接收新任务，会继续处理已经提交的任务；`shutdownNow()` 会尝试中断正在执行的任务，并返回尚未开始执行的任务。两者都不会等待线程池彻底终止。

```java
executor.shutdown();
try {
    if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
        executor.shutdownNow();
        if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
            System.err.println("线程池未能正常退出");
        }
    }
} catch (InterruptedException e) {
    executor.shutdownNow();
    Thread.currentThread().interrupt();
}
```

任务需要正确响应中断，否则 `shutdownNow()` 也不能保证立即停止。应用关闭期间还要决定队列中的任务能否丢失；不能丢的业务任务不应只存在进程内存里。

## 使用虚拟线程后还需要传统线程池吗？

虚拟线程适合包含大量阻塞等待的任务。它创建和切换的成本比平台线程低，通常采用每个任务一个虚拟线程的方式，不要把虚拟线程放进固定大小的池里复用。

需要限制数据库或下游接口并发时，继续使用连接池、`Semaphore`、限流器等机制约束具体资源。虚拟线程数量很多，也不会增加数据库连接数、CPU 核数或下游接口容量。

传统平台线程池仍适用于 CPU 密集型任务、需要固定调度线程的任务，以及必须显式控制平台线程和工作队列的组件。项目是否迁移还要看 JDK 版本、框架支持、监控工具和现有异步模型。详细说明可以参考 [虚拟线程常见问题总结](./virtual-thread.md)。

## 面试中怎么回答线程池参数配置？

回答线程池参数时，可以从任务和系统容量出发：先根据高峰任务提交速率和任务耗时估算并发需求，再区分计算时间和 I/O 等待时间；线程数还要受 CPU、数据库连接池、HTTP 连接池及下游限流约束。队列只吸收短时突发，容量要同时满足业务等待期限和内存限制。初始参数确定后，通过压测和线上监控观察提交速率、完成速率、排队时间、执行时间和拒绝次数，再逐步调整。

面试官继续追问队列堆积时，不要只回答扩大线程池。先比较任务提交速率和完成速率，再看执行时间、线程栈、CPU、连接池与下游延迟。流量上涨可以限流或扩实例；任务变慢要处理 SQL、锁或下游故障；任务已经过期时应快速失败或转入补偿。动态调参只能处理容量配置不合适，不能代替超时、隔离、限流和下游治理。

## 参考

- [ThreadPoolExecutor API 文档](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- [Future API 文档](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html)
- [CompletableFuture API 文档](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html)
- [JEP 444：Virtual Threads](https://openjdk.org/jeps/444)
- [Java 线程池实现原理及其在美团业务中的实践](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)
- 《Java 并发编程实战》

<!-- @include: @article-footer.snippet.md -->
