---
title: Java 线程池详解
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: 线程池,ThreadPoolExecutor,Executor,核心线程数,最大线程数,任务队列,拒绝策略,池化技术,ScheduledThreadPoolExecutor
  - - meta
    - name: description
      content: 系统梳理 Java 线程池的原理与架构，包含 Executor 框架、关键参数与队列、常见实现及配置要点。
---

<!-- markdownlint-disable MD024 -->

池化技术想必大家已经屡见不鲜了，线程池、数据库连接池、HTTP 连接池等等都是对这个思想的应用。池化技术的思想主要是为了减少每次获取资源的消耗，提高对资源的利用率。

这篇文章我会详细介绍一下线程池的基本概念以及核心原理。

## 线程池介绍

池化技术想必大家已经屡见不鲜了，线程池、数据库连接池、HTTP 连接池等等都是对这个思想的应用。池化技术的思想主要是为了减少每次获取资源的消耗，提高对资源的利用率。

线程池提供了一种限制和管理资源（包括执行一个任务）的方式。 每个线程池还维护一些基本统计信息，例如已完成任务的数量。使用线程池主要带来以下几个好处：

1. **降低资源消耗**：线程池里的线程是可以重复利用的。一旦线程完成了某个任务，它不会立即销毁，而是回到池子里等待下一个任务。这就避免了频繁创建和销毁线程带来的开销。
2. **提高响应速度**：因为线程池里通常会维护一定数量的核心线程（或者说“常驻工人”），任务来了之后，可以直接交给这些已经存在的、空闲的线程去执行，省去了创建线程的时间，任务能够更快地得到处理。
3. **提高线程的可管理性**：线程池允许我们统一管理池中的线程。我们可以配置线程池的大小（核心线程数、最大线程数）、任务队列的类型和大小、拒绝策略等。这样就能控制并发线程的总量，防止资源耗尽，保证系统的稳定性。同时，线程池通常也提供了监控接口，方便我们了解线程池的运行状态（比如有多少活跃线程、多少任务在排队等），便于调优。

## Executor 框架介绍

`Executor` 框架是 Java5 之后引进的，在 Java 5 之后，通过 `Executor` 来启动线程比使用 `Thread` 的 `start` 方法更好，除了更易管理，效率更好（用线程池实现，节约开销）外，还有关键的一点：有助于避免 this 逃逸问题。

> this 逃逸是指在构造函数返回之前其他线程就持有该对象的引用，调用尚未构造完全的对象的方法可能引发令人疑惑的错误。

`Executor` 框架不仅包括了线程池的管理，还提供了线程工厂、队列以及拒绝策略等，`Executor` 框架让并发编程变得更加简单。

`Executor` 框架结构主要由三大部分组成：

**1、任务(`Runnable` /`Callable`)**

执行任务需要实现的 **`Runnable` 接口** 或 **`Callable`接口**。**`Runnable` 接口**或 **`Callable` 接口** 实现类都可以被 **`ThreadPoolExecutor`** 或 **`ScheduledThreadPoolExecutor`** 执行。

**2、任务的执行(`Executor`)**

如下图所示，包括任务执行机制的核心接口 **`Executor`** ，以及继承自 `Executor` 接口的 **`ExecutorService` 接口。`ThreadPoolExecutor`** 和 **`ScheduledThreadPoolExecutor`** 这两个关键类实现了 **`ExecutorService`** 接口。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executor-class-diagram.png)

这里提了很多底层的类关系，但是，实际上我们需要更多关注的是 `ThreadPoolExecutor` 这个类，这个类在我们实际使用线程池的过程中，使用频率还是非常高的。

**注意：** 通过查看 `ScheduledThreadPoolExecutor` 源代码我们发现 `ScheduledThreadPoolExecutor` 实际上是继承了 `ThreadPoolExecutor` 并实现了 `ScheduledExecutorService` ，而 `ScheduledExecutorService` 又实现了 `ExecutorService`，正如我们上面给出的类关系图显示的一样。

`ThreadPoolExecutor` 类描述:

```java
//AbstractExecutorService实现了ExecutorService接口
public class ThreadPoolExecutor extends AbstractExecutorService
```

`ScheduledThreadPoolExecutor` 类描述:

```java
//ScheduledExecutorService继承ExecutorService接口
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

**3、异步计算的结果(`Future`)**

**`Future`** 接口以及 `Future` 接口的实现类 **`FutureTask`** 类都可以代表异步计算的结果。

当我们把 **`Runnable`接口** 或 **`Callable` 接口** 的实现类提交给 **`ThreadPoolExecutor`** 或 **`ScheduledThreadPoolExecutor`** 执行。（调用 `submit()` 方法时会返回一个 **`FutureTask`** 对象）

**`Executor` 框架的使用示意图**：

![Executor 框架的使用示意图](./images/java-thread-pool-summary/Executor框架的使用示意图.png)

1. 主线程首先要创建实现 `Runnable` 或者 `Callable` 接口的任务对象。
2. 把创建完成的实现 `Runnable`/`Callable`接口的 对象直接交给 `ExecutorService` 执行: `ExecutorService.execute（Runnable command）`）或者也可以把 `Runnable` 对象或`Callable` 对象提交给 `ExecutorService` 执行（`ExecutorService.submit（Runnable task）`或 `ExecutorService.submit（Callable <T> task）`）。
3. 如果执行 `ExecutorService.submit（…）`，`ExecutorService` 将返回一个实现`Future`接口的对象（我们刚刚也提到过了执行 `execute()`方法和 `submit()`方法的区别，`submit()`会返回一个 `FutureTask 对象）。由于 FutureTask` 实现了 `Runnable`，我们也可以创建 `FutureTask`，然后直接交给 `ExecutorService` 执行。
4. 最后，主线程可以执行 `FutureTask.get()`方法来等待任务执行完成。主线程也可以执行 `FutureTask.cancel（boolean mayInterruptIfRunning）`来取消此任务的执行。

## ThreadPoolExecutor 类介绍（重要）

线程池实现类 `ThreadPoolExecutor` 是 `Executor` 框架最核心的类。

### 线程池参数分析

`ThreadPoolExecutor` 类中提供的四个构造方法。我们来看最长的那个，其余三个都是在这个构造方法的基础上产生（其他几个构造方法说白点都是给定某些默认参数的构造方法比如默认制定拒绝策略是什么）。

```java
    /**
     * 用给定的初始参数创建一个新的ThreadPoolExecutor。
     */
    public ThreadPoolExecutor(int corePoolSize,//线程池的核心线程数量
                              int maximumPoolSize,//线程池的最大线程数
                              long keepAliveTime,//当线程数大于核心线程数时，多余的空闲线程存活的最长时间
                              TimeUnit unit,//时间单位
                              BlockingQueue<Runnable> workQueue,//任务队列，用来储存等待执行任务的队列
                              ThreadFactory threadFactory,//线程工厂，用来创建线程，一般默认即可
                              RejectedExecutionHandler handler//拒绝策略，当提交的任务过多而不能及时处理时，我们可以定制策略来处理任务
                               ) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

下面这些参数非常重要，在后面使用线程池的过程中你一定会用到！所以，务必拿着小本本记清楚。

`ThreadPoolExecutor` 3 个最重要的参数：

- `corePoolSize` : 任务队列未达到队列容量时，最大可以同时运行的线程数量。
- `maximumPoolSize` : 任务队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- `workQueue`: 新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

`ThreadPoolExecutor`其他常见参数 :

- `keepAliveTime`:线程池中的线程数量大于 `corePoolSize` 的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等待，直到等待的时间超过了 `keepAliveTime`才会被回收销毁。
- `unit` : `keepAliveTime` 参数的时间单位。
- `threadFactory` :executor 创建新线程的时候会用到。
- `handler` :拒绝策略（后面会单独详细介绍一下）。

下面这张图可以加深你对线程池中各个参数的相互关系的理解（图片来源：《Java 性能调优实战》）：

![线程池各个参数的关系](https://oss.javaguide.cn/github/javaguide/java/concurrent/relationship-between-thread-pool-parameters.png)

**`ThreadPoolExecutor` 拒绝策略定义:**

如果当前同时运行的线程数量达到最大线程数量并且队列也已经被放满了任务时，`ThreadPoolExecutor` 定义一些策略:

- `ThreadPoolExecutor.AbortPolicy`：抛出 `RejectedExecutionException`来拒绝新任务的处理。
- `ThreadPoolExecutor.CallerRunsPolicy`：调用执行自己的线程运行任务，也就是直接在调用`execute`方法的线程中运行(`run`)被拒绝的任务，如果执行程序已关闭，则会丢弃该任务。因此这种策略会降低对于新任务提交速度，影响程序的整体性能。如果您的应用程序可以承受此延迟并且你要求任何一个任务请求都要被执行的话，你可以选择这个策略。
- `ThreadPoolExecutor.DiscardPolicy`：不处理新任务，直接丢弃掉。
- `ThreadPoolExecutor.DiscardOldestPolicy`：此策略将丢弃最早的未处理的任务请求。

举个例子：

举个例子：Spring 通过 `ThreadPoolTaskExecutor` 或者我们直接通过 `ThreadPoolExecutor` 的构造函数创建线程池的时候，当我们不指定 `RejectedExecutionHandler` 拒绝策略来配置线程池的时候，默认使用的是 `AbortPolicy`。在这种拒绝策略下，如果队列满了，`ThreadPoolExecutor` 将抛出 `RejectedExecutionException` 异常来拒绝新来的任务 ，这代表你将丢失对这个任务的处理。如果不想丢弃任务的话，可以使用`CallerRunsPolicy`。`CallerRunsPolicy` 和其他的几个策略不同，它既不会抛弃任务，也不会抛出异常，而是将任务回退给调用者，使用调用者的线程来执行任务

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }

        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                // 直接主线程执行，而不是线程池中的线程执行
                r.run();
            }
        }
    }
```

### 线程池创建的两种方式

在 Java 中，创建线程池主要有两种方式：

**方式一：通过 `ThreadPoolExecutor` 构造函数直接创建 (推荐)**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-construtors.png)

这是最推荐的方式，因为它允许开发者明确指定线程池的核心参数，对线程池的运行行为有更精细的控制，从而避免资源耗尽的风险。

**方式二：通过 `Executors` 工具类创建 (不推荐用于生产环境)**

`Executors`工具类提供的创建线程池的方法如下图所示：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executors-new-thread-pool-methods.png)

可以看出，通过`Executors`工具类可以创建多种类型的线程池，包括：

- `FixedThreadPool`：固定线程数量的线程池。该线程池中的线程数量始终不变。当有一个新的任务提交时，线程池中若有空闲线程，则立即执行。若没有，则新的任务会被暂存在一个任务队列中，待有线程空闲时，便处理在任务队列中的任务。
- `SingleThreadExecutor`： 只有一个线程的线程池。若多余一个任务被提交到该线程池，任务会被保存在一个任务队列中，待线程空闲，按先入先出的顺序执行队列中的任务。
- `CachedThreadPool`： 可根据实际情况调整线程数量的线程池。线程池的线程数量不确定，但若有空闲线程可以复用，则会优先使用可复用的线程。若所有线程均在工作，又有新的任务提交，则会创建新的线程处理任务。所有线程在当前任务执行完毕后，将返回线程池进行复用。
- `ScheduledThreadPool`：给定的延迟后运行任务或者定期执行任务的线程池。

《阿里巴巴 Java 开发手册》强制线程池不允许使用 `Executors` 去创建，而是通过 `ThreadPoolExecutor` 构造函数的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险

`Executors` 返回线程池对象的弊端如下(后文会详细介绍到)：

- `FixedThreadPool` 和 `SingleThreadExecutor`:使用的是阻塞队列 `LinkedBlockingQueue`，任务队列最大长度为 `Integer.MAX_VALUE`，可以看作是无界的，可能堆积大量的请求，从而导致 OOM。
- `CachedThreadPool`:使用的是同步队列 `SynchronousQueue`, 允许创建的线程数量为 `Integer.MAX_VALUE` ，如果任务数量过多且执行速度较慢，可能会创建大量的线程，从而导致 OOM。
- `ScheduledThreadPool` 和 `SingleThreadScheduledExecutor`:使用的无界的延迟阻塞队列`DelayedWorkQueue`，任务队列最大长度为 `Integer.MAX_VALUE`,可能堆积大量的请求，从而导致 OOM。

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    // LinkedBlockingQueue 的默认长度为 Integer.MAX_VALUE，可以看作是无界的
    return new ThreadPoolExecutor(nThreads, nThreads,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>());

}

public static ExecutorService newSingleThreadExecutor() {
    // LinkedBlockingQueue 的默认长度为 Integer.MAX_VALUE，可以看作是无界的
    return new FinalizableDelegatedExecutorService (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>()));

}

// 同步队列 SynchronousQueue，没有容量，最大线程数是 Integer.MAX_VALUE`
public static ExecutorService newCachedThreadPool() {

    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,60L, TimeUnit.SECONDS,new SynchronousQueue<Runnable>());

}

// DelayedWorkQueue（延迟阻塞队列）
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

### Summary of commonly used blocking queues in thread pools

When a new task comes, it will first determine whether the number of currently running threads reaches the number of core threads. If so, the new task will be stored in the queue.

Different thread pools will use different blocking queues, which we can analyze with the built-in thread pool.

- `LinkedBlockingQueue` (unbounded queue) with capacity `Integer.MAX_VALUE`: `FixedThreadPool` and `SingleThreadExector`. `FixedThreadPool` can only create threads with a maximum number of core threads (the number of core threads and the maximum number of threads are equal), and `SingleThreadExector` can only create one thread (the number of core threads and the maximum number of threads are both 1). The task queues of both will never be full.
- `SynchronousQueue`: `CachedThreadPool`. `SynchronousQueue` has no capacity and does not store elements. The purpose is to ensure that for submitted tasks, if there is an idle thread, the idle thread will be used to process it; otherwise, a new thread will be created to process the task. In other words, the maximum number of threads of `CachedThreadPool` is `Integer.MAX_VALUE`, which can be understood as the number of threads can be infinitely expanded, and a large number of threads may be created, resulting in OOM.
- `DelayedWorkQueue` (delayed blocking queue): `ScheduledThreadPool` and `SingleThreadScheduledExecutor`. The internal elements of `DelayedWorkQueue` are not sorted according to the time they are put in, but the tasks are sorted according to the length of delay. The internal "heap" data structure is used to ensure that each task dequeued is the one with the longest execution time in the current queue. `DelayedWorkQueue` will automatically expand to 1/2 of its original capacity after the added elements are full, that is, it will never block. The maximum expansion can reach `Integer.MAX_VALUE`, so only the number of core threads can be created at most.

## Analysis of thread pool principle (important)

We have explained the `Executor` framework and the `ThreadPoolExecutor` class above. Let us practice it and review the above content by writing a small Demo of `ThreadPoolExecutor`.

### Thread pool sample code

First create an implementation class of the `Runnable` interface (of course it can also be the `Callable` interface, we will introduce the difference between the two later.)

`MyRunnable.java`

```java
import java.util.Date;

/**
 * This is a simple Runnable class that takes about 5 seconds to perform its task.
 * @author shuang.kou
 */
public class MyRunnable implements Runnable {

    private String command;

    public MyRunnable(String s) {
        this.command = s;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " Start. Time = " + new Date());
        processCommand();
        System.out.println(Thread.currentThread().getName() + " End. Time = " + new Date());
    }

    private void processCommand() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String toString() {
        return this.command;
    }
}

```

To write a test program, we use the method recommended by Alibaba to use the `ThreadPoolExecutor` constructor custom parameters to create a thread pool.

`ThreadPoolExecutorDemo.java`

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class ThreadPoolExecutorDemo {

    private static final int CORE_POOL_SIZE = 5;
    private static final int MAX_POOL_SIZE = 10;
    private static final int QUEUE_CAPACITY = 100;
    private static final Long KEEP_ALIVE_TIME = 1L;
    public static void main(String[] args) {

        //Use the method recommended by Alibaba to create a thread pool
        //Created through custom parameters of ThreadPoolExecutor constructor
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                CORE_POOL_SIZE,
                MAX_POOL_SIZE,
                KEEP_ALIVE_TIME,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(QUEUE_CAPACITY),
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 0; i < 10; i++) {
            //Create WorkerThread object (WorkerThread class implements Runnable interface)
            Runnable worker = new MyRunnable("" + i);
            //Execute Runnable
            executor.execute(worker);
        }
        //terminate thread pool
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.out.println("Finished all threads");
    }
}

```

You can see that our code above specifies:

- `corePoolSize`: The number of core threads is 5.
- `maximumPoolSize`: Maximum number of threads 10
- `keepAliveTime` : The waiting time is 1L.
- `unit`: The unit of waiting time is TimeUnit.SECONDS.
- `workQueue`: The task queue is `ArrayBlockingQueue` and the capacity is 100;
- `handler`: Deny policy is `CallerRunsPolicy`.

**Output structure**:

```plain
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:47 CST 2020
Finished all threads // The tasks will not jump out until all tasks are executed, because executor.isTerminated() will jump out of the while loop when it is judged to be true. If and only if the shutdown() method is called, and all submitted tasks are completed, it will return to true.```

### 线程池原理分析

我们通过前面的代码输出结果可以看出：**线程池首先会先执行 5 个任务，然后这些任务有任务被执行完的话，就会去拿新的任务执行。** 大家可以先通过上面讲解的内容，分析一下到底是咋回事？（自己独立思考一会）

现在，我们就分析上面的输出内容来简单分析一下线程池原理。

为了搞懂线程池的原理，我们需要首先分析一下 `execute`方法。 在示例代码中，我们使用 `executor.execute(worker)`来提交一个任务到线程池中去。

这个方法非常重要，下面我们来看看它的源码：

```java
   // 存放线程池的运行状态 (runState) 和线程池内有效线程的数量 (workerCount)
   private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

    private static int workerCountOf(int c) {
        return c & CAPACITY;
    }
    //任务队列
    private final BlockingQueue<Runnable> workQueue;

    public void execute(Runnable command) {
        // 如果任务为null，则抛出异常。
        if (command == null)
            throw new NullPointerException();
        // ctl 中保存的线程池当前的一些状态信息
        int c = ctl.get();

        //  下面会涉及到 3 步 操作
        // 1.首先判断当前线程池中执行的任务数量是否小于 corePoolSize
        // 如果小于的话，通过addWorker(command, true)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        // 2.如果当前执行的任务数量大于等于 corePoolSize 的时候就会走到这里，表明创建新的线程失败。
        // 通过 isRunning 方法判断线程池状态，线程池处于 RUNNING 状态并且队列可以加入任务，该任务才会被加入进去
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            // 再次获取线程池状态，如果线程池状态不是 RUNNING 状态就需要从任务队列中移除任务，并尝试判断线程是否全部执行完毕。同时执行拒绝策略。
            if (!isRunning(recheck) && remove(command))
                reject(command);
                // 如果当前工作线程数量为0，新创建一个线程并执行。
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        //3. 通过addWorker(command, false)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        // 传入 false 代表增加线程时判断当前线程数是否少于 maxPoolSize
        //如果addWorker(command, false)执行失败，则通过reject()执行相应的拒绝策略的内容。
        else if (!addWorker(command, false))
            reject(command);
    }
```

这里简单分析一下整个流程（对整个逻辑进行了简化，方便理解）：

1. 如果当前运行的线程数小于核心线程数，那么就会新建一个线程来执行任务。
2. 如果当前运行的线程数等于或大于核心线程数，但是小于最大线程数，那么就把该任务放入到任务队列里等待执行。
3. 如果向任务队列投放任务失败（任务队列已经满了），但是当前运行的线程数是小于最大线程数的，就新建一个线程来执行任务。
4. 如果当前运行的线程数已经等同于最大线程数了，新建线程将会使当前运行的线程超出最大线程数，那么当前任务会被拒绝，拒绝策略会调用`RejectedExecutionHandler.rejectedExecution()`方法。

![图解线程池实现原理](https://oss.javaguide.cn/github/javaguide/java/concurrent/thread-pool-principle.png)

在 `execute` 方法中，多次调用 `addWorker` 方法。`addWorker` 这个方法主要用来创建新的工作线程，如果返回 true 说明创建和启动工作线程成功，否则的话返回的就是 false。

```java
    // 全局锁，并发操作必备
    private final ReentrantLock mainLock = new ReentrantLock();
    // 跟踪线程池的最大大小，只有在持有全局锁mainLock的前提下才能访问此集合
    private int largestPoolSize;
    // 工作线程集合，存放线程池中所有的（活跃的）工作线程，只有在持有全局锁mainLock的前提下才能访问此集合
    private final HashSet<Worker> workers = new HashSet<>();
    //获取线程池状态
    private static int runStateOf(int c)     { return c & ~CAPACITY; }
    //判断线程池的状态是否为 Running
    private static boolean isRunning(int c) {
        return c < SHUTDOWN;
    }


    /**
     * 添加新的工作线程到线程池
     * @param firstTask 要执行
     * @param core参数为true的话表示使用线程池的基本大小，为false使用线程池最大大小
     * @return 添加成功就返回true否则返回false
     */
   private boolean addWorker(Runnable firstTask, boolean core) {
        retry:
        for (;;) {
            //这两句用来获取线程池的状态
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
               //获取线程池中工作的线程的数量
                int wc = workerCountOf(c);
                // core参数为false的话表明队列也满了，线程池大小变为 maximumPoolSize
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
               //原子操作将workcount的数量加1
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // 如果线程的状态改变了就再次执行上述操作
                c = ctl.get();
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }
        // 标记工作线程是否启动成功
        boolean workerStarted = false;
        // 标记工作线程是否创建成功
        boolean workerAdded = false;
        Worker w = null;
        try {

            w = new Worker(firstTask);
            final Thread t = w.thread;
            if (t != null) {
              // 加锁
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                   //获取线程池状态
                    int rs = runStateOf(ctl.get());
                   //rs < SHUTDOWN 如果线程池状态依然为RUNNING,并且线程的状态是存活的话，就会将工作线程添加到工作线程集合中
                  //(rs=SHUTDOWN && firstTask == null)如果线程池状态小于STOP，也就是RUNNING或者SHUTDOWN状态下，同时传入的任务实例firstTask为null，则需要添加到工作线程集合和启动新的Worker
                   // firstTask == null证明只新建线程而不执行任务
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                       //更新当前工作线程的最大容量
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                      // 工作线程是否启动成功
                        workerAdded = true;
                    }
                } finally {
                    // 释放锁
                    mainLock.unlock();
                }
                //// 如果成功添加工作线程，则调用Worker内部的线程实例t的Thread#start()方法启动真实的线程实例
                if (workerAdded) {
                    t.start();
                  /// 标记线程启动成功
                    workerStarted = true;
                }
            }
        } finally {
           // 线程启动失败，需要从工作线程中移除对应的Worker
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```

For more content on thread pool source code analysis, I recommend this article: Hardcore dry stuff: [4W words to analyze the implementation principle of JUC thread pool ThreadPoolExecutor from the source code] (https://www.cnblogs.com/throwable/p/13574306.html).

Now, let's go back to the sample code. Shouldn't it be easy to understand how it works?

If you don’t understand it, it doesn’t matter. You can take a look at my analysis:

> We simulated 10 tasks in the code. We configured the number of core threads to be 5 and the waiting queue capacity to be 100, so only 5 tasks may be executed at the same time each time, and the remaining 5 tasks will be placed in the waiting queue. If any of the current five tasks has been executed, the thread pool will get a new task for execution.

### Several common comparisons

#### `Runnable` vs `Callable`

`Runnable` has been around since Java 1.0, but `Callable` was only introduced in Java 1.5 to handle use cases that `Runnable` does not support. The `Runnable` interface does not return results or throw checked exceptions, but the `Callable` interface does. Therefore, if the task does not need to return results or throw exceptions, it is recommended to use the `Runnable` interface, so that the code will look more concise.

The utility class `Executors` can convert `Runnable` objects into `Callable` objects. (`Executors.callable(Runnable task)` or `Executors.callable(Runnable task, Object result)`).

`Runnable.java`

```java
@FunctionalInterface
public interface Runnable {
   /**
    * Executed by a thread, there is no return value and no exception can be thrown
    */
    public abstract void run();
}
```

`Callable.java`

```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Compute the result, or throw an exception if this cannot be done.
     * @return calculated result
     * @throws throws an exception if the result cannot be calculated
     */
    V call() throws Exception;
}

```

#### `execute()` vs `submit()`

`execute()` and `submit()` are two methods of submitting tasks to the thread pool. There are some differences:

- **Return value**: The `execute()` method is used to submit tasks that do not require a return value. Usually used to execute `Runnable` tasks. It is impossible to determine whether the task is successfully executed by the thread pool. The `submit()` method is used to submit tasks that require return values. Can submit `Runnable` or `Callable` tasks. The `submit()` method returns a `Future` object, through which the `Future` object can be used to determine whether the task is executed successfully and obtain the return value of the task (the `get()` method will block the current thread until the task is completed, `get(long timeout, TimeUnit unit)` has an additional timeout period, if the task has not been executed within the `timeout` time, a `java.util.concurrent.TimeoutException` will be thrown).
- **Exception handling**: When using the `submit()` method, you can use the `Future` object to handle exceptions thrown during task execution; when using the `execute()` method, exception handling needs to be done through a custom `ThreadFactory` (the `UncaughtExceptionHandler` object is set when the thread factory creates the thread to handle exceptions) or `ThreadPoolExecutor`'s `afterExecute()` method to deal with

Example 1: Use the `get()` method to get the return value.

```java
// This is just for demonstration purposes. It is recommended to use the `ThreadPoolExecutor` constructor to create a thread pool.
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get();
System.out.println(s);
executorService.shutdown();
```

Output:

```plain
abc
```

Example 2: Use the `get(long timeout, TimeUnit unit)` method to get the return value.

```java
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get(3, TimeUnit.SECONDS);
System.out.println(s);
executorService.shutdown();
```

Output:

```plain
Exception in thread "main" java.util.concurrent.TimeoutException
  at java.util.concurrent.FutureTask.get(FutureTask.java:205)
```

#### `shutdown()`VS`shutdownNow()`

- **`shutdown()`**: Shut down the thread pool and the status of the thread pool changes to `SHUTDOWN`. The thread pool no longer accepts new tasks, but the tasks in the queue must be completed.
- **`shutdownNow()`**: Shut down the thread pool and the status of the thread pool changes to `STOP`. The thread pool terminates the currently running tasks, stops processing queued tasks and returns the List waiting to be executed.

#### `isTerminated()` VS `isShutdown()`

- **`isShutDown`** Returns true when calling the `shutdown()` method.
- **`isTerminated`** returns true when the `shutdown()` method is called and all submitted tasks are completed

## Several common built-in thread pools

### FixedThreadPool

#### Introduction

`FixedThreadPool` is known as a thread pool that can reuse a fixed number of threads. Let’s take a look at the relevant implementation through the relevant source code in the `Executors` class:

```java
   /**
     * Create a thread pool that can reuse a fixed number of threads
     */
    public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>(),
                                      threadFactory);
    }
```

There is also an implementation method of `FixedThreadPool`, which is similar to the above, so I won’t elaborate on it here:

```java
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```From the source code above, we can see that the `corePoolSize` and `maximumPoolSize` of the newly created `FixedThreadPool` are both set to `nThreads`. This `nThreads` parameter is passed by ourselves when we use it.

Even if the value of `maximumPoolSize` is greater than `corePoolSize`, at most `corePoolSize` threads will be created. This is because `FixedThreadPool` uses a `LinkedBlockingQueue` (unbounded queue) with a capacity of `Integer.MAX_VALUE`, and the queue will never be filled.

#### Introduction to the task execution process

Schematic diagram of the `execute()` method of `FixedThreadPool` (source of this picture: "The Art of Java Concurrent Programming"):

![FixedThreadPool’s execute() method operation diagram](./images/java-thread-pool-summary/FixedThreadPool.png)

**Description of the above picture:**

1. If the number of currently running threads is less than `corePoolSize`, if a new task comes again, a new thread will be created to execute the task;
2. After the number of currently running threads equals `corePoolSize`, if a new task comes, the task will be added to `LinkedBlockingQueue`;
3. After the thread in the thread pool completes the task at hand, it will repeatedly obtain the task from `LinkedBlockingQueue` in the loop for execution;

#### Why is `FixedThreadPool` not recommended?

`FixedThreadPool` uses the unbounded queue `LinkedBlockingQueue` (the capacity of the queue is Integer.MAX_VALUE) as the work queue of the thread pool, which will have the following effects on the thread pool:

1. When the number of threads in the thread pool reaches `corePoolSize`, new tasks will wait in the unbounded queue, so the number of threads in the thread pool will not exceed `corePoolSize`;
2. `maximumPoolSize` will be an invalid parameter when using an unbounded queue, because it is impossible for the task queue to be full. Therefore, by creating the source code of `FixedThreadPool`, we can see that the `corePoolSize` and `maximumPoolSize` of the created `FixedThreadPool` are set to the same value.
3. Due to 1 and 2, `keepAliveTime` will be an invalid parameter when using unbounded queue;
4. The running `FixedThreadPool` (without executing `shutdown()` or `shutdownNow()`) will not reject tasks, and will cause OOM (memory overflow) when there are many tasks.

### SingleThreadExecutor

#### Introduction

`SingleThreadExecutor` is a thread pool with only one thread. Let’s take a look at the implementation of **SingleThreadExecutor:**

```java
   /**
     *Returns a thread pool with only one thread
     */
    public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>(),
                                    threadFactory));
    }
```

```java
   public static ExecutorService newSingleThreadExecutor() {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>()));
    }
```

From the source code above, we can see that the `corePoolSize` and `maximumPoolSize` of the newly created `SingleThreadExecutor` are both set to 1, and the other parameters are the same as `FixedThreadPool`.

#### Introduction to the task execution process

Operation diagram of `SingleThreadExecutor` (source of this picture: "The Art of Java Concurrent Programming"):

![SingleThreadExecutor operation diagram](./images/java-thread-pool-summary/SingleThreadExecutor.png)

**Description of the above picture**:

1. If the number of currently running threads is less than `corePoolSize`, create a new thread to perform the task;
2. After there is a running thread in the current thread pool, add the task to `LinkedBlockingQueue`
3. After the thread completes the current task, it will repeatedly obtain tasks from `LinkedBlockingQueue` in the loop for execution;

#### Why is `SingleThreadExecutor` not recommended?

`SingleThreadExecutor`, like `FixedThreadPool`, uses `LinkedBlockingQueue` (unbounded queue) with a capacity of `Integer.MAX_VALUE` as the work queue of the thread pool. `SingleThreadExecutor` using an unbounded queue as the thread pool's work queue will have the same impact on the thread pool as `FixedThreadPool`. To put it simply, it may cause OOM.

### CachedThreadPool

#### Introduction

`CachedThreadPool` is a thread pool that creates new threads as needed. Let’s take a look at the implementation of `CachedThreadPool` through the source code:

```java
    /**
     * Create a thread pool that creates new threads as needed, but reuses previously built threads when they become available.
     */
    public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>(),
                                      threadFactory);
    }

```

```java
    public static ExecutorService newCachedThreadPool() {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>());
    }
```

The `corePoolSize` of `CachedThreadPool` is set to empty (0), and the `maximumPoolSize` is set to `Integer.MAX.VALUE`, that is, it is unbounded. This means that if the speed of the main thread submitting tasks is higher than the speed of thread processing tasks in `maximumPool`, `CachedThreadPool` will continue to create new threads. In extreme cases, this can lead to exhaustion of cpu and memory resources.

#### Introduction to the task execution process

Schematic diagram of the execution of the `execute()` method of `CachedThreadPool` (source of this picture: "The Art of Java Concurrent Programming"):

![Execution diagram of the execute() method of CachedThreadPool](./images/java-thread-pool-summary/CachedThreadPool-execute.png)

**Description of the above picture:**1. First execute `SynchronousQueue.offer(Runnable task)` to submit the task to the task queue. If there is an idle thread in the current `maximumPool` that is executing `SynchronousQueue.poll(keepAliveTime,TimeUnit.NANOSECONDS)`, then the main thread executes the offer operation and the `poll` operation executed by the idle thread is paired successfully, the main thread hands the task to the idle thread for execution, and the execution of the `execute()` method is completed, otherwise proceed to step 2 below;
2. When the initial `maximumPool` is empty, or there are no idle threads in `maximumPool`, no thread will execute `SynchronousQueue.poll(keepAliveTime,TimeUnit.NANOSECONDS)`. In this case, step 1 will fail. At this time, `CachedThreadPool` will create a new thread to perform the task, and the execute method will be executed;

#### Why is `CachedThreadPool` not recommended?

`CachedThreadPool` uses a synchronized queue `SynchronousQueue`, and the number of threads allowed to be created is `Integer.MAX_VALUE`. A large number of threads may be created, causing OOM.

### ScheduledThreadPool

#### Introduction

`ScheduledThreadPool` is used to run tasks after a given delay or execute tasks periodically. This is basically not used in actual projects and is not recommended. You just need to have a brief understanding of it.

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

`ScheduledThreadPool` is created through `ScheduledThreadPoolExecutor` and uses `DelayedWorkQueue` (delayed blocking queue) as the task queue of the thread pool.

The internal elements of `DelayedWorkQueue` are not sorted according to the time they are put in, but the tasks are sorted according to the length of delay. The internal "heap" data structure is used to ensure that each task dequeued is the one with the longest execution time in the current queue. `DelayedWorkQueue` will automatically expand to 1/2 of its original capacity after the added elements are full, that is, it will never block. The maximum expansion can reach `Integer.MAX_VALUE`, so only the number of core threads can be created at most.

`ScheduledThreadPoolExecutor` inherits `ThreadPoolExecutor`, so creating `ScheduledThreadExecutor` is essentially creating a `ThreadPoolExecutor` thread pool, but the parameters passed in are different.

```java
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

#### Comparison between ScheduledThreadPoolExecutor and Timer

- `Timer` is sensitive to changes in the system clock, `ScheduledThreadPoolExecutor` is not;
- `Timer` has only one thread of execution, so long-running tasks can delay other tasks. `ScheduledThreadPoolExecutor` can be configured with any number of threads. Furthermore, you can have full control over the created threads if you want (by providing a `ThreadFactory`);
- A runtime exception thrown in `TimerTask` will kill a thread, causing `Timer` to freeze, i.e. the scheduled task will no longer run. `ScheduledThreadExecutor` not only catches runtime exceptions, but also allows you to handle them if needed (by overriding the `afterExecute` method of `ThreadPoolExecutor`). The task that throws the exception will be canceled, but other tasks will continue to run.

For a detailed introduction to scheduled tasks, you can read this article: [Java scheduled tasks detailed explanation](https://javaguide.cn/system-design/schedule-task.html).

## Thread pool best practices

[Java Thread Pool Best Practices](https://javaguide.cn/java/concurrent/java-thread-pool-best-practices.html) This article summarizes some things that should be paid attention to when using thread pools. You can take a look before using thread pools in actual projects.

## Reference

- "The Art of Concurrent Programming in Java"
- [Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example](https://www.journaldev.com/2340/java-scheduler-scheduledexecutorservice-scheduledthreadpoolexecutor-example "Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example")
- [java.util.concurrent.ScheduledThreadPoolExecutor Example](https://examples.javacodegeeks.com/core-java/util/concurrent/scheduledthreadpoolexecutor/java-util-concurrent-scheduledthreadpoolexecutor-example/ "java.util.concurrent.ScheduledThreadPoolExecutor Example")
- [ThreadPoolExecutor – Java Thread Pool Example](https://www.journaldev.com/1069/threadpoolexecutor-java-thread-pool-example-executorservice "ThreadPoolExecutor – Java Thread Pool Example")

<!-- @include: @article-footer.snippet.md -->