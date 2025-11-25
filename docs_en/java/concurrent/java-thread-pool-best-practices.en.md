---
title: Java Thread Pool Best Practices
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: Thread pool best practices, ThreadPoolExecutor, Executors risks, bounded queue, OOM, rejection policy, monitoring, thread naming, parameter configuration
  - - meta
    - name: description
      content: Summarizes the key practices and pitfall avoidance guidelines for using thread pools, emphasizing important matters such as manual configuration, avoiding Executors OOM risks, monitoring and naming, etc.
---

Let me briefly summarize what I know about what you should pay attention to when using a thread pool. There seems to be no article specifically written about this on the Internet.

## 1. Correctly declare the thread pool

**The thread pool must be declared manually through the constructor of `ThreadPoolExecutor` to avoid using the `Executors` class to create a thread pool, which may cause OOM risks. **

The disadvantages of `Executors` returning thread pool objects are as follows (will be introduced in detail later):

- **`FixedThreadPool` and `SingleThreadExecutor`**: The blocking queue `LinkedBlockingQueue` is used. The default length and maximum length of the task queue are `Integer.MAX_VALUE`, which can be regarded as an unbounded queue, which may accumulate a large number of requests, resulting in OOM.
- **`CachedThreadPool`**: The synchronized queue `SynchronousQueue` is used, and the number of threads allowed to be created is `Integer.MAX_VALUE`. A large number of threads may be created, resulting in OOM.
- **`ScheduledThreadPool` and `SingleThreadScheduledExecutor`**: The unbounded delay blocking queue `DelayedWorkQueue` used, the maximum length of the task queue is `Integer.MAX_VALUE`, may accumulate a large number of requests, resulting in OOM.

To put it bluntly: **Use a bounded queue to control the number of threads created. **

In addition to avoiding OOM, there are also reasons why using the two quick thread pools provided by `Executors` is not recommended:

- In actual use, you need to manually configure the parameters of the thread pool such as the number of core threads, the task queue used, the saturation strategy, etc. according to the performance of your own machine and business scenarios.
- We should name our thread pool explicitly to help us locate the problem.

## 2. Monitor the running status of the thread pool

You can detect the running status of the thread pool through some means, such as the Actuator component in SpringBoot.

In addition, we can also use the related API of `ThreadPoolExecutor` to do a simple monitoring. As can be seen from the figure below, `ThreadPoolExecutor` provides the ability to obtain the current number of threads and active threads in the thread pool, the number of completed tasks, the number of tasks in the queue, etc.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpool-methods-information.png)

Below is a simple demo. `printThreadPoolStatus()` will print out the number of threads in the thread pool, the number of active threads, the number of completed tasks, and the number of tasks in the queue every second.

```java
/**
 * Print the status of the thread pool
 *
 * @param threadPool thread pool object
 */
public static void printThreadPoolStatus(ThreadPoolExecutor threadPool) {
    ScheduledExecutorService scheduledExecutorService = new ScheduledThreadPoolExecutor(1, createThreadFactory("print-images/thread-pool-status", false));
    scheduledExecutorService.scheduleAtFixedRate(() -> {
        log.info("=========================");
        log.info("ThreadPool Size: [{}]", threadPool.getPoolSize());
        log.info("Active Threads: {}", threadPool.getActiveCount());
        log.info("Number of Tasks : {}", threadPool.getCompletedTaskCount());
        log.info("Number of Tasks in Queue: {}", threadPool.getQueue().size());
        log.info("=========================");
    }, 0, 1, TimeUnit.SECONDS);
}
```

## 3. It is recommended to use different thread pools for different types of businesses.

Many people will have questions similar to this in actual projects: **Multiple businesses in my project need to use thread pools. Should I define one for each thread pool or define a common thread pool? **

It is generally recommended that different businesses use different thread pools. When configuring the thread pool, configure the current thread pool according to the current business situation. Because the concurrency and resource usage of different businesses are different, focus on optimizing the business related to system performance bottlenecks.

**Let’s look at a real accident case again! ** (This case comes from: ["An online accident involving improper use of thread pools"](https://heapdump.cn/article/646639), a very exciting case)

![Case code overview](https://oss.javaguide.cn/github/javaguide/java/concurrent/production-accident-threadpool-sharing-example.png)

The above code may cause a deadlock. Why? Let me draw a picture to help you understand.

Imagine such an extreme situation: Suppose the number of core threads in our thread pool is **n**, the number of parent tasks (deduction tasks) is **n**, and there are two subtasks (subtasks under the deduction task) under the parent task, one of which has been executed and the other is placed in the task queue. Since the parent task has used up the core thread resources of the thread pool, the subtask cannot execute normally because it cannot obtain the thread resources and has been blocked in the queue. The parent task waits for the child task to complete execution, and the child task waits for the parent task to release thread pool resources, which also causes **"deadlock"**.

![Improper use of thread pool leads to deadlock](https://oss.javaguide.cn/github/javaguide/java/concurrent/production-accident-threadpool-sharing-deadlock.png)

The solution is also very simple, which is to add a new thread pool for executing subtasks specifically to serve it.

## 4. Don’t forget to name the thread pool

When initializing the thread pool, you need to display the naming (set the thread pool name prefix), which is helpful for locating problems.

The name of the thread created by default is similar to `pool-1-thread-n`, which has no business meaning and is not conducive to us locating the problem.

There are usually two ways to name threads in the thread pool:

**1. Using guava’s `ThreadFactoryBuilder`**

```java
ThreadFactory threadFactory = new ThreadFactoryBuilder()
                        .setNameFormat(threadNamePrefix + "-%d")
                        .setDaemon(true).build();
ExecutorService threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit.MINUTES, workQueue, threadFactory)
```

**2. Implement `ThreadFactory` yourself. **

```java
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread factory, which sets the thread name, helps us locate problems.
 */
public final class NamingThreadFactory implements ThreadFactory {

    private final AtomicInteger threadNum = new AtomicInteger();
    private final String name;

    /**
     * Create a named thread pool production factory
     */
    public NamingThreadFactory(String name) {
        this.name = name;
    }

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r);
        t.setName(name + " [#" + threadNum.incrementAndGet() + "]");
        return t;
    }
}```

## 5、正确配置线程池参数

说到如何给线程池配置参数，美团的骚操作至今让我难忘（后面会提到）！

我们先来看一下各种书籍和博客上一般推荐的配置线程池参数的方式，可以作为参考。

### 常规操作

很多人甚至可能都会觉得把线程池配置过大一点比较好！我觉得这明显是有问题的。就拿我们生活中非常常见的一例子来说：**并不是人多就能把事情做好，增加了沟通交流成本。你本来一件事情只需要 3 个人做，你硬是拉来了 6 个人，会提升做事效率嘛？我想并不会。** 线程数量过多的影响也是和我们分配多少人做事情一样，对于多线程这个场景来说主要是增加了**上下文切换** 成本。不清楚什么是上下文切换的话，可以看我下面的介绍。

> 上下文切换：
>
> 多线程编程中一般线程的个数都大于 CPU 核心的个数，而一个 CPU 核心在任意时刻只能被一个线程使用，为了让这些线程都能得到有效执行，CPU 采取的策略是为每个线程分配时间片并轮转的形式。当一个线程的时间片用完的时候就会重新处于就绪状态让给其他线程使用，这个过程就属于一次上下文切换。概括来说就是：当前任务在执行完 CPU 时间片切换到另一个任务之前会先保存自己的状态，以便下次再切换回这个任务时，可以再加载这个任务的状态。**任务从保存到再加载的过程就是一次上下文切换**。
>
> 上下文切换通常是计算密集型的。也就是说，它需要相当可观的处理器时间，在每秒几十上百次的切换中，每次切换都需要纳秒量级的时间。所以，上下文切换对系统来说意味着消耗大量的 CPU 时间，事实上，可能是操作系统中时间消耗最大的操作。
>
> Linux 相比与其他操作系统（包括其他类 Unix 系统）有很多的优点，其中有一项就是，其上下文切换和模式切换的时间消耗非常少。

类比于现实世界中的人类通过合作做某件事情，我们可以肯定的一点是线程池大小设置过大或者过小都会有问题，合适的才是最好。

- 如果我们设置的线程池数量太小的话，如果同一时间有大量任务/请求需要处理，可能会导致大量的请求/任务在任务队列中排队等待执行，甚至会出现任务队列满了之后任务/请求无法处理的情况，或者大量任务堆积在任务队列导致 OOM。这样很明显是有问题的，CPU 根本没有得到充分利用。
- 如果我们设置线程数量太大，大量线程可能会同时在争取 CPU 资源，这样会导致大量的上下文切换，从而增加线程的执行时间，影响了整体执行效率。

有一个简单并且适用面比较广的公式：

- **CPU 密集型任务 (N)：** 这种任务消耗的主要是 CPU 资源，线程数应设置为 N（CPU 核心数）。由于任务主要瓶颈在于 CPU 计算能力，与核心数相等的线程数能够最大化 CPU 利用率，过多线程反而会导致竞争和上下文切换开销。
- **I/O 密集型任务(M \* N)：** 这类任务大部分时间处理 I/O 交互，线程在等待 I/O 时不占用 CPU。 为了充分利用 CPU 资源，线程数可以设置为 M \* N，其中 N 是 CPU 核心数，M 是一个大于 1 的倍数，建议默认设置为 2 ，具体取值取决于 I/O 等待时间和任务特点，需要通过测试和监控找到最佳平衡点。

CPU 密集型任务不再推荐 N+1，原因如下：

- "N+1" 的初衷是希望预留线程处理突发暂停，但实际上，处理缺页中断等情况仍然需要占用 CPU 核心。
- CPU 密集场景下，CPU 始终是瓶颈，预留线程并不能凭空增加 CPU 处理能力，反而可能加剧竞争。

**如何判断是 CPU 密集任务还是 IO 密集任务？**

CPU 密集型简单理解就是利用 CPU 计算能力的任务比如你在内存中对大量数据进行排序。但凡涉及到网络读取，文件读取这类都是 IO 密集型，这类任务的特点是 CPU 计算耗费时间相比于等待 IO 操作完成的时间来说很少，大部分时间都花在了等待 IO 操作完成上。

🌈 拓展一下（参见：[issue#1737](https://github.com/Snailclimb/JavaGuide/issues/1737)）：

线程数更严谨的计算的方法应该是：`最佳线程数 = N（CPU 核心数）∗（1+WT（线程等待时间）/ST（线程计算时间））`，其中 `WT（线程等待时间）=线程运行总时间 - ST（线程计算时间）`。

线程等待时间所占比例越高，需要越多线程。线程计算时间所占比例越高，需要越少线程。

我们可以通过 JDK 自带的工具 VisualVM 来查看 `WT/ST` 比例。

CPU 密集型任务的 `WT/ST` 接近或者等于 0，因此， 线程数可以设置为 N（CPU 核心数）∗（1+0）= N，和我们上面说的 N（CPU 核心数）+1 差不多。

IO 密集型任务下，几乎全是线程等待时间，从理论上来说，你就可以将线程数设置为 2N（按道理来说，WT/ST 的结果应该比较大，这里选择 2N 的原因应该是为了避免创建过多线程吧）。

**注意**：上面提到的公示也只是参考，实际项目不太可能直接按照公式来设置线程池参数，毕竟不同的业务场景对应的需求不同，具体还是要根据项目实际线上运行情况来动态调整。接下来介绍的美团的线程池参数动态配置这种方案就非常不错，很实用！

### 美团的骚操作

美团技术团队在[《Java 线程池实现原理及其在美团业务中的实践》](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)这篇文章中介绍到对线程池参数实现可自定义配置的思路和方法。

美团技术团队的思路是主要对线程池的核心参数实现自定义可配置。这三个核心参数是：

- **`corePoolSize` :** 核心线程数定义了最小可以同时运行的线程数量。
- **`maximumPoolSize` :** 当队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- **`workQueue`:** 当新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

**为什么是这三个参数？**

我在这篇[《新手也能看懂的线程池学习总结》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485808&idx=1&sn=1013253533d73450cef673aee13267ab&chksm=cea246bbf9d5cfad1c21316340a0ef1609a7457fea4113a1f8d69e8c91e7d9cd6285f5ee1490&token=510053261&lang=zh_CN&scene=21#wechat_redirect) 中就说过这三个参数是 `ThreadPoolExecutor` 最重要的参数，它们基本决定了线程池对于任务的处理策略。

**如何支持参数动态配置？** 且看 `ThreadPoolExecutor` 提供的下面这些方法。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-methods.png)

格外需要注意的是`corePoolSize`， 程序运行期间的时候，我们调用 `setCorePoolSize（）`这个方法的话，线程池会首先判断当前工作线程数是否大于`corePoolSize`，如果大于的话就会回收工作线程。

另外，你也看到了上面并没有动态指定队列长度的方法，美团的方式是自定义了一个叫做 `ResizableCapacityLinkedBlockIngQueue` 的队列（主要就是把`LinkedBlockingQueue`的 capacity 字段的 final 关键字修饰给去掉了，让它变为可变的）。

最终实现的可动态修改线程池参数效果如下。👏👏👏

![动态配置线程池参数最终效果](https://oss.javaguide.cn/github/javaguide/java/concurrent/meituan-dynamically-configuring-thread-pool-parameters.png)

如果我们的项目也想要实现这种效果的话，可以借助现成的开源项目：

- **[Hippo4j](https://github.com/opengoofy/hippo4j)**：异步线程池框架，支持线程池动态变更&监控&报警，无需修改代码轻松引入。支持多种使用模式，轻松引入，致力于提高系统运行保障能力。
- **[Dynamic TP](https://github.com/dromara/dynamic-tp)**：轻量级动态线程池，内置监控告警功能，集成三方中间件线程池管理，基于主流配置中心（已支持 Nacos、Apollo，Zookeeper、Consul、Etcd，可通过 SPI 自定义实现）。

## 6、别忘记关闭线程池

当线程池不再需要使用时，应该显式地关闭线程池，释放线程资源。

线程池提供了两个关闭方法：

- **`shutdown（）`** :关闭线程池，线程池的状态变为 `SHUTDOWN`。线程池不再接受新任务了，但是队列里的任务得执行完毕。
- **`shutdownNow()`**: Shut down the thread pool and the status of the thread pool changes to `STOP`. The thread pool terminates the currently running tasks, stops processing queued tasks and returns the List waiting to be executed.

After calling the `shutdownNow` and `shuwdown` methods, it does not mean that the thread pool has completed the shutdown operation. It just asynchronously notifies the thread pool for shutdown processing. If you want to wait synchronously for the thread pool to be completely closed before continuing execution, you need to call the `awaitTermination` method to wait synchronously.

When calling the `awaitTermination()` method, a reasonable timeout should be set to avoid the program blocking for a long time and causing performance problems. in addition. Since tasks in the thread pool may be canceled or throw exceptions, exception handling is also required when using the `awaitTermination()` method. The `awaitTermination()` method will throw an `InterruptedException` exception, which needs to be caught and handled to avoid the program crashing or failing to exit normally.

```java
// ...
// Close the thread pool
executor.shutdown();
try {
    // Wait for the thread pool to close, up to 5 minutes
    if (!executor.awaitTermination(5, TimeUnit.MINUTES)) {
        //If the wait times out, print the log
        System.err.println("The thread pool failed to be completely closed within 5 minutes");
    }
} catch (InterruptedException e) {
    //Exception handling
}
```

## 7. Try not to put time-consuming tasks in the thread pool.

The purpose of the thread pool itself is to improve task execution efficiency and avoid performance overhead caused by frequent creation and destruction of threads. If time-consuming tasks are submitted to the thread pool for execution, the threads in the thread pool may be occupied for a long time, unable to respond to other tasks in time, and may even cause the thread pool to crash or the program to freeze.

Therefore, when using the thread pool, we should try to avoid submitting time-consuming tasks to the thread pool for execution. For some time-consuming operations, such as network requests, file reading and writing, etc., you can use `CompletableFuture` and other asynchronous operations to handle them to avoid blocking threads in the thread pool.

## 8. Some pitfalls in the use of thread pools

### Pitfalls of repeatedly creating thread pools

Thread pools can be reused. Be sure not to create thread pools frequently. For example, when a user request arrives, create a separate thread pool.

```java
@GetMapping("wrong")
public String wrong() throws InterruptedException {
    // Custom thread pool
    ThreadPoolExecutor executor = new ThreadPoolExecutor(5,10,1L,TimeUnit.SECONDS,new ArrayBlockingQueue<>(100),new ThreadPoolExecutor.CallerRunsPolicy());

    // Process tasks
    executor.execute(() -> {
      //......
    }
    return "OK";
}
```

The reason for this problem is still insufficient understanding of the thread pool, and it is necessary to strengthen the basic knowledge of the thread pool.

### The Pitfalls of Spring’s Internal Thread Pool

When using Spring's internal thread pool, you must manually customize the thread pool and configure reasonable parameters, otherwise production problems will occur (one request creates a thread).

```java
@Configuration
@EnableAsync
public class ThreadPoolExecutorConfig {

    @Bean(name="threadPoolExecutor")
    public Executor threadPoolExecutor(){
        ThreadPoolTaskExecutor threadPoolExecutor = new ThreadPoolTaskExecutor();
        int processNum = Runtime.getRuntime().availableProcessors(); // Returns the number of available processors in the Java virtual machine
        int corePoolSize = (int) (processNum / (1 - 0.2));
        int maxPoolSize = (int) (processNum / (1 - 0.5));
        threadPoolExecutor.setCorePoolSize(corePoolSize); // Core pool size
        threadPoolExecutor.setMaxPoolSize(maxPoolSize); // Maximum number of threads
        threadPoolExecutor.setQueueCapacity(maxPoolSize * 1000); // Queue length
        threadPoolExecutor.setThreadPriority(Thread.MAX_PRIORITY);
        threadPoolExecutor.setDaemon(false);
        threadPoolExecutor.setKeepAliveSeconds(300);//Thread idle time
        threadPoolExecutor.setThreadNamePrefix("test-Executor-"); // Thread name prefix
        return threadPoolExecutor;
    }
}
```

### Pitfalls shared by thread pool and ThreadLocal

The thread pool and `ThreadLocal` are shared, which may cause the thread to obtain old values/dirty data from `ThreadLocal`. This is because the thread pool will reuse the thread object, and the static attribute `ThreadLocal` variable of the class bound to the thread object will also be reused, which results in one thread possibly obtaining the `ThreadLocal` value of other threads.

Don't think that the thread pool does not exist if the thread pool is not shown in the code. For example, in order to increase the concurrency of the commonly used Web server Tomcat processing tasks, the thread pool is used, and a custom thread pool based on the improvement of the native Java thread pool is used.

Of course, you can set up Tomcat to handle tasks in a single thread. However, this is not suitable and will seriously affect the speed of its processing tasks.

```properties
server.tomcat.max-threads=1
```

The recommended way to solve the above problem is to use Alibaba's open source `TransmittableThreadLocal` (`TTL`). The `TransmittableThreadLocal` class inherits and enhances the JDK's built-in `InheritableThreadLocal` class. When using thread pools and other execution components that pool multiplexed threads, it provides a `ThreadLocal` value transfer function to solve the problem of context transfer during asynchronous execution.

`TransmittableThreadLocal` project address: <https://github.com/alibaba/transmittable-thread-local>.

<!-- @include: @article-footer.snippet.md -->