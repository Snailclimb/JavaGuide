Java 面试通关手册（Java 学习指南，欢迎 Star，会一直完善下去，欢迎建议和指导）：[https://github.com/Snailclimb/Java_Guide](https://github.com/Snailclimb/Java_Guide "https://github.com/Snailclimb/Java_Guide")

## 一 使用线程池的好处

**池化技术相比大家已经屡见不鲜了，线程池、数据库连接池、Http 连接池等等都是对这个思想的应用。池化技术的思想主要是为了减少每次获取资源的消耗，提高对资源的利用率。**

**线程池**提供了一种限制和管理资源（包括执行一个任务）。 每个**线程池**还维护一些基本统计信息，例如已完成任务的数量。

这里借用《Java 并发编程的艺术》提到的来说一下**使用线程池的好处**：

- **降低资源消耗**。通过重复利用已创建的线程降低线程创建和销毁造成的消耗。
- **提高响应速度**。当任务到达时，任务可以不需要的等到线程创建就能立即执行。
- **提高线程的可管理性**。线程是稀缺资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。

## 二 Executor 框架

### 2.1 简介

Executor 框架是 Java5 之后引进的，在 Java 5 之后，通过 Executor 来启动线程比使用 Thread 的 start 方法更好，除了更易管理，效率更好（用线程池实现，节约开销）外，还有关键的一点：有助于避免 this 逃逸问题。

> 补充：this 逃逸是指在构造函数返回之前其他线程就持有该对象的引用. 调用尚未构造完全的对象的方法可能引发令人疑惑的错误。

### 2.2 Executor 框架结构(主要由三大部分组成)

#### 1 任务。

执行任务需要实现的**Runnable 接口**或**Callable 接口**。**Runnable 接口**或**Callable 接口**实现类都可以被**ThreadPoolExecutor**或**ScheduledThreadPoolExecutor**执行。

**两者的区别：**

> **Runnable 接口**不会返回结果但是**Callable 接口**可以返回结果。后面介绍**Executors 类**的一些方法的时候会介绍到两者的相互转换。

#### 2 任务的执行

如下图所示，包括任务执行机制的**核心接口 Executor** ，以及继承自 Executor 接口的**ExecutorService 接口**。**ThreadPoolExecutor** 和 **ScheduledThreadPoolExecutor**这两个关键类实现了**ExecutorService 接口**。

> **注意：** 通过查看 `ScheduledThreadPoolExecutor` 源代码我们发现 `ScheduledThreadPoolExecutor` 实际上是继承了  `ThreadPoolExecutor` 并实现了 ScheduledExecutorService ，而  `ScheduledExecutorService` 又实现了 ` ExecutorService`，正如我们下面给出的类关系图显示的一样。

**ThreadPoolExecutor 类描述:**

```java
//AbstractExecutorService实现了ExecutorService接口
public class ThreadPoolExecutor extends AbstractExecutorService
```

**ScheduledThreadPoolExecutor 类描述:**

```java
//ScheduledExecutorService实现了ExecutorService接口
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

![任务的执行相关接口](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzkwMDU4NTc0LmpwZw?x-oss-process=image/format,png)

#### 3 异步计算的结果

**Future 接口**以及 Future 接口的实现类**FutureTask 类**。
当我们把**Runnable 接口**或**Callable 接口**的实现类提交（调用 submit 方法）给**ThreadPoolExecutor**或**ScheduledThreadPoolExecutor**时，会返回一个**FutureTask 对象**。

我们以**AbstractExecutorService**接口中的一个 submit 方法为例子来看看源代码：

```java
    public Future<?> submit(Runnable task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<Void> ftask = newTaskFor(task, null);
        execute(ftask);
        return ftask;
    }
```

上面方法调用的 newTaskFor 方法返回了一个 FutureTask 对象。

```java
    protected <T> RunnableFuture<T> newTaskFor(Runnable runnable, T value) {
        return new FutureTask<T>(runnable, value);
    }
```

### 2.3 Executor 框架的使用示意图

![Executor 框架的使用示意图](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC01LTMwLzg0ODIzMzMwLmpwZw?x-oss-process=image/format,png)

1. **主线程首先要创建实现 Runnable 或者 Callable 接口的任务对象。**
   **备注：** 工具类 Executors 可以实现 Runnable 对象和 Callable 对象之间的相互转换。（`Executors.callable（Runnable task`）或 `Executors.callable（Runnable task，Object resule）`）。
2. **然后可以把创建完成的 Runnable 对象直接交给 ExecutorService 执行**（ExecutorService.execute（Runnable command））；或者也可以把 Runnable 对象或 Callable 对象提交给 ExecutorService 执行（ExecutorService.submit（Runnable task）或 ExecutorService.submit（Callable <T> task））。
3. **如果执行 ExecutorService.submit（…），ExecutorService 将返回一个实现 Future 接口的对象**（我们刚刚也提到过了执行 `execute()`方法和 `submit()`方法的区别，到目前为止的 JDK 中，返回的是 FutureTask 对象）。由于 FutureTask 实现了 Runnable，程序员也可以创建 FutureTask，然后直接交给 `ExecutorService` 执行。
4. **最后，主线程可以执行 `FutureTask.get()`方法来等待任务执行完成。主线程也可以执行 `FutureTask.cancel（boolean mayInterruptIfRunning）`来取消此任务的执行。**

**执行 execute()方法和 submit()方法的区别是什么呢？**

> 1. **execute()方法用于提交不需要返回值的任务，所以无法判断任务是否被线程池执行成功与否；**
> 2. **submit()方法用于提交需要返回值的任务。线程池会返回一个 future 类型的对象，通过这个 future 对象可以判断任务是否执行成功**，并且可以通过 future 的 get()方法来获取返回值，get()方法会阻塞当前线程直到任务完成，而使用 get（long timeout，TimeUnit unit）方法则会阻塞当前线程一段时间后立即返回，这时候有可能任务没有执行完。

## 三 ThreadPoolExecutor 类简单介绍(重要)

线程池实现类 ThreadPoolExecutor 是 Executor 框架最核心的类，先来看一下这个类中比较重要的四个属性

### 3.1 ThreadPoolExecutor 类分析

`ThreadPoolExecutor` 类中提供的四个构造方法。我们来看最长的那个，其余三个都是在这个构造方法的基础上产生（其他几个构造方法说白点都是给定某些默认参数的构造方法比如默认制定拒绝策略是什么），这里就不贴代码讲了，比较简单。

```java
    /**
     * 用给定的初始参数创建一个新的ThreadPoolExecutor。
     */
    public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
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

**下面这些对创建 非常重要，在后面使用线程池的过程中你一定会用到！所以，务必拿着小本本记清楚。**

**`ThreadPoolExecutor` 3个最重要的参数：**

- **`corePoolSize` :** 核心线程数线程数定义了最小可以同时运行的线程数量。
- **`maximumPoolSize` :** 当队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- **`workQueue`:** 当新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，信任就会被存放在队列中。

`ThreadPoolExecutor`其他常见参数:

1. **`keepAliveTime`**:当线程池中的线程数量大于 `corePoolSize` 的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等待，直到等待的时间超过了 `keepAliveTime`才会被回收销毁；
2. **`unit`**  : `keepAliveTime` 参数的时间单位。
3. **`threadFactory`** :executor 创建新线程的时候会用到。
4. **`handler`** :饱和策略。关于饱和策略下面单独介绍一下。

**`ThreadPoolExecutor` 饱和策略定义:**

如果当前同时运行的线程数量达到最大线程数量并且队列也已经被放满了任时，`ThreadPoolTaskExecutor` 定义一些策略:

- **ThreadPoolExecutor.AbortPolicy**：抛出 `RejectedExecutionException`来拒绝新任务的处理。
- **ThreadPoolExecutor.CallerRunsPolicy**：调用执行自己的线程运行任务。您不会任务请求。但是这种策略会降低对于新任务提交速度，影响程序的整体性能。另外，这个策略喜欢增加队列容量。如果您的应用程序可以承受此延迟并且你不能任务丢弃任何一个任务请求的话，你可以选择这个策略。
- **ThreadPoolExecutor.DiscardPolicy：** 不处理新任务，直接丢弃掉。
- **ThreadPoolExecutor.DiscardOldestPolicy：** 此策略将丢弃最早的未处理的任务请求。

举个例子： Spring 通过 `ThreadPoolTaskExecutor` 或者我们直接通过 `ThreadPoolExecutor ` 的构造函数创建线程池的时候，当我们不指定 `RejectedExecutionHandler` 饱和策略的话来配置线程池的时候默认使用的是 `ThreadPoolExecutor.AbortPolicy`。在默认情况下，`ThreadPoolExecutor` 将抛出 `RejectedExecutionException` 来拒绝新来的任务 ，这代表你将丢失对这个任务的处理。 对于可伸缩的应用程序，建议使用 `ThreadPoolExecutor.CallerRunsPolicy`。当最大池被填满时，此策略为我们提供可伸缩队列。（这个直接查看 `ThreadPoolExecutor ` 的构造函数源码就可以看出，比较简单的原因，这里就不贴代码了。）

### 3.2 推荐使用ThreadPoolExecutor 构造函数创建线程池

**在《阿里巴巴 Java 开发手册》“并发处理”这一章节，明确指出线程资源必须通过线程池提供，不允许在应用中自行显示创建线程。**

**为什么呢？**

> **使用线程池的好处是减少在创建和销毁线程上所消耗的时间以及系统资源开销，解决资源不足的问题。如果不使用线程池，有可能会造成系统创建大量同类线程而导致消耗完内存或者“过度切换”的问题。**

**另外《阿里巴巴 Java 开发手册》中强制线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 构造函数的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险**

> Executors 返回线程池对象的弊端如下：
>
> - **FixedThreadPool 和 SingleThreadExecutor** ： 允许请求的队列长度为 Integer.MAX_VALUE,可能堆积大量的请求，从而导致 OOM。
> - **CachedThreadPool 和 ScheduledThreadPool** ： 允许创建的线程数量为 Integer.MAX_VALUE ，可能会创建大量线程，从而导致 OOM。

**方式一：通过`ThreadPoolExecutor `构造函数实现（推荐）**
![通过构造方法实现](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzE3ODU4MjMwLmpwZw?x-oss-process=image/format,png)
**方式二：通过 Executor 框架的工具类 Executors 来实现**
我们可以创建三种类型的 ThreadPoolExecutor：

- **FixedThreadPool**
- **SingleThreadExecutor**
- **CachedThreadPool**

对应 Executors 工具类中的方法如图所示：
![通过Executor 框架的工具类Executors来实现](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzEzMjk2OTAxLmpwZw?x-oss-process=image/format,png)

## 五 ThreadPoolExecutor 使用示例

我们上面讲解了 `Executor`框架以及 `ThreadPoolExecutor` 类，下面让我们实战一下，来通过写一个 `ThreadPoolExecutor` 的小 Demo 来回顾上面的内容。

### 5.1 示例代码

首先创建一个 `Runnable` 接口的实现类（当然也可以是 `Callable` 接口，我们上面也说了两者的区别是：`Runnable` 接口不会返回结果但是 `Callable` 接口可以返回结果。后面介绍 `Executors` 类的一些方法的时候会介绍到两者的相互转换。）

```java
import java.util.Date;

/**
 * 这是一个简单的Runnable类，需要大约5秒钟来执行其任务。
 */
public class WorkerThread implements Runnable {

    private String command;

    public WorkerThread(String s) {
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

编写测试程序，我们这里以阿里巴巴推荐的使用 `ThreadPoolExecutor` 构造函数自定义参数的方式来创建线程池。

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

        //使用阿里巴巴推荐的创建线程池的方式
        //通过ThreadPoolExecutor构造函数自定义参数创建
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                CORE_POOL_SIZE,
                MAX_POOL_SIZE,
                KEEP_ALIVE_TIME,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(QUEUE_CAPACITY),
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 0; i < 10; i++) {
            //创建WorkerThread对象（WorkerThread类实现了Runnable 接口）
            Runnable worker = new WorkerThread("" + i);
            //执行Runnable
            executor.execute(worker);
        }
        //终止线程池
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.out.println("Finished all threads");
    }
}
```

可以看到我们上面的代码指定了：

1. `corePoolSize`: 核心线程数为 5。
2. `maximumPoolSize` ：最大线程数 10 
3. `keepAliveTime` : 等待时间为 1L。
4. `unit`: 等待时间的单位为 TimeUnit.SECONDS。
5. `workQueue`：任务队列为 `ArrayBlockingQueue`，并且容量为 100;
6. `handler`:饱和策略为 `CallerRunsPolicy`。

输出示例：

```
pool-1-thread-2 Start. Time = Tue Nov 12 20:59:44 CST 2019
pool-1-thread-5 Start. Time = Tue Nov 12 20:59:44 CST 2019
pool-1-thread-4 Start. Time = Tue Nov 12 20:59:44 CST 2019
pool-1-thread-1 Start. Time = Tue Nov 12 20:59:44 CST 2019
pool-1-thread-3 Start. Time = Tue Nov 12 20:59:44 CST 2019
pool-1-thread-5 End. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-3 End. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-2 End. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-4 End. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-1 End. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-2 Start. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-1 Start. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-4 Start. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-3 Start. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-5 Start. Time = Tue Nov 12 20:59:49 CST 2019
pool-1-thread-2 End. Time = Tue Nov 12 20:59:54 CST 2019
pool-1-thread-3 End. Time = Tue Nov 12 20:59:54 CST 2019
pool-1-thread-4 End. Time = Tue Nov 12 20:59:54 CST 2019
pool-1-thread-5 End. Time = Tue Nov 12 20:59:54 CST 2019
pool-1-thread-1 End. Time = Tue Nov 12 20:59:54 CST 2019

```

### 5.2 原理分析

承接 5.1 节，我们通过代码输出结果可以看出：**线程池每次会同时执行 5 个任务，这5 个任务执行完之后，剩余的 5 个任务才会被执行。** 大家可以先通过上面讲解的内容，分析一下到底是咋回事？（自己独立思考一会）

现在，我们就分析上面的输出内容来简单分析一下线程池原理。

**为了搞懂线程池的原理，我们需要首先分析一下 `execute`方法。**在 5.1 节中的 Demo 中我们使用 ` executor.execute(worker)`来提交一个任务到线程池中去，这个方法非常重要，下面我们来看看它的源码：

```java
   // 存放线程池的运行状态 (runState) 和线程池内有效线程的数量 (workerCount) 
   private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

    private static int workerCountOf(int c) {
        return c & CAPACITY;
    }

    private final BlockingQueue<Runnable> workQueue;

    public void execute(Runnable command) {
        // 如果任务为null，则抛出异常。
        if (command == null)
            throw new NullPointerException();
        // ctl 中保存的线程池当前的一些状态信息
        int c = ctl.get();

        //  下面会涉及到 3 步 操作
        // 1.首先判断当前线程池中之行的任务数量是否小于 corePoolSize 
        // 如果小于的话，通过addWorker(command, true)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        // 2.如果当前之行的任务数量大于等于 corePoolSize 的时候就会走到这里
        // 通过 isRunning 方法判断线程池状态，线程池处于 RUNNING 状态才会被并且队列可以加入任务，该任务才会被加入进去 
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            // 再次获取线程池状态，如果线程池状态不是 RUNNING 状态就需要从任务队列中移除任务，并尝试判断线程是否全部执行完毕。同时执行拒绝策略。
            if (!isRunning(recheck) && remove(command))
                reject(command);
                // 如果当前线程池为空就新创建一个线程并执行。
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        //3. 通过addWorker(command, false)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        //如果addWorker(command, false)执行失败，则通过reject()执行相应的拒绝策略的内容。
        else if (!addWorker(command, false))
            reject(command);
    }
```

通过下图可以更好的对上面这 3 步做一个展示，下图是我为了省事直接从网上找到，原地址不明。

![图解线程池实现原理](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/图解线程池实现原理.png)

现在，让我们在回到 5.1 节我们写的 Demo， 现在应该是不是很容易就可以搞懂它的原理了呢？

没搞懂的话，也没关系，可以看看我的分析：

>  我们在代码中模拟了 10 个任务，我们配置的核心线程数为 5 、等待队列容量为 100 ，所以每次只可能存在 5 个任务同时执行，剩下的 5 个任务会被放到等待队列中去。当前的 5 个任务之行完成后，才会之行剩下的 5 个任务。

### 5.3 几个常见的方法对比

#### 5.3.1 shutdown（）VS shutdownNow（）

- **`shutdown（）`**  :关闭线程池，线程池的状态变为 `SHUTDOWN `。线程池不再接受新任务了，但是队列里的任务得执行完毕。
- **`shutdownNow（）`** :关闭线程池，线程的状态变为 `STOP`。线程池会终止当前正在运行的任务，并停止处理排队的任务并返回正在等待执行的 List。

#### 5.3.2 isTerminated() Vs isShutdown()

- **`isShutDown`** 当调用 `shutdown()` 方法后返回为true。 
- **`isTerminated`** 当调用 `shutdown()` 方法后，并且所有提交的任务完成后返回为true

##四 几种常见的线程池详解 

### 4.1 FixedThreadPool 详解

`FixedThreadPool` 被称为可重用固定线程数的线程池。通过 Executors 类中的相关源代码来看一下相关实现：

```java
   /**
     * 创建一个可重用固定数量线程的线程池
     */
    public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>(),
                                      threadFactory);
    }
```

另外还有一个 `FixedThreadPool` 的实现方法，和上面的类似，所以这里不多做阐述：

```java
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```

从上面源代码可以看出新创建的 FixedThreadPool 的 corePoolSize 和 maximumPoolSize 都被设置为 nThreads。
**FixedThreadPool 的 execute()方法运行示意图（该图片来源：《Java 并发编程的艺术》）：**

![FixedThreadPool的execute()方法运行示意图](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzcxMzc1OTYzLmpwZw?x-oss-process=image/format,png)

**上图说明：**

1.  如果当前运行的线程数小于 corePoolSize， 如果再来新任务的话，就创建新的线程来执行任务；
2.  当前运行的线程数等于 corePoolSize 后， 如果再来新任务的话，会将任务加入 `LinkedBlockingQueue`；
3.  线程池中的线程执行完 手头的任务后，会在循环中反复从 `LinkedBlockingQueue` 中获取任务来执行；

**FixedThreadPool 使用无界队列 LinkedBlockingQueue（队列的容量为 Intger.MAX_VALUE）作为线程池的工作队列会对线程池带来如下影响：**

1. 当线程池中的线程数达到 corePoolSize 后，新任务将在无界队列中等待，因此线程池中的线程数不会超过 corePoolSize；
2. 由于 1，使用无界队列时 maximumPoolSize 将是一个无效参数；
3. 由于 1 和 2，使用无界队列时 keepAliveTime 将是一个无效参数；
4. 运行中的 FixedThreadPool（未执行 shutdown()或 shutdownNow()方法）不会拒绝任务

### 3.5 SingleThreadExecutor 详解

SingleThreadExecutor 是使用单个 worker 线程的 Executor。下面看看**SingleThreadExecutor 的实现：**

```java
   /**
     *创建使用单个worker线程运行无界队列的Executor
	 *并使用提供的ThreadFactory在需要时创建新线程
     *
     * @param threadFactory 创建新线程时使用的factory
     *
     * @return 新创建的单线程Executor
     * @throws NullPointerException 如果ThreadFactory为空
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

从上面源代码可以看出新创建的 SingleThreadExecutor 的 corePoolSize 和 maximumPoolSize 都被设置为 1.其他参数和 FixedThreadPool 相同。SingleThreadExecutor 使用无界队列 LinkedBlockingQueue 作为线程池的工作队列（队列的容量为 Intger.MAX_VALUE）。SingleThreadExecutor 使用无界队列作为线程池的工作队列会对线程池带来的影响与 FixedThreadPool 相同。

**SingleThreadExecutor 的运行示意图（该图片来源：《Java 并发编程的艺术》）：**
![SingleThreadExecutor的运行示意图](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzgyMjc2NDU4LmpwZw?x-oss-process=image/format,png)

**上图说明;**

1. 如果当前运行的线程数少于 corePoolSize，则创建一个新的线程执行任务；
2. 当前线程池中有一个运行的线程后，将任务加入 LinkedBlockingQueue
3. 线程执行完 1 中的任务后，会在循环中反复从 LinkedBlockingQueue 中获取任务来执行；

### 3.6 CachedThreadPool 详解

CachedThreadPool 是一个会根据需要创建新线程的线程池。下面通过源码来看看 CachedThreadPool 的实现：

```java
    /**
     * 创建一个线程池，根据需要创建新线程，但会在先前构建的线程可用时重用它，
	 *并在需要时使用提供的ThreadFactory创建新线程。
     * @param threadFactory 创建新线程使用的factory
     * @return 新创建的线程池
     * @throws NullPointerException 如果threadFactory为空
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

CachedThreadPool 的 corePoolSize 被设置为空（0），maximumPoolSize 被设置为 Integer.MAX.VALUE，即它是无界的，这也就意味着如果主线程提交任务的速度高于 maximumPool 中线程处理任务的速度时，CachedThreadPool 会不断创建新的线程。极端情况下，这样会导致耗尽 cpu 和内存资源。

**CachedThreadPool 的 execute()方法的执行示意图（该图片来源：《Java 并发编程的艺术》）：**
![CachedThreadPool的execute()方法的执行示意图](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzE4NjExNzY3LmpwZw?x-oss-process=image/format,png)

**上图说明：**

1. 首先执行 SynchronousQueue.offer(Runnable task)。如果当前 maximumPool 中有闲线程正在执行 SynchronousQueue.poll(keepAliveTime,TimeUnit.NANOSECONDS)，那么主线程执行 offer 操作与空闲线程执行的 poll 操作配对成功，主线程把任务交给空闲线程执行，execute()方法执行完成，否则执行下面的步骤 2；
2. 当初始 maximumPool 为空，或者 maximumPool 中没有空闲线程时，将没有线程执行 SynchronousQueue.poll(keepAliveTime,TimeUnit.NANOSECONDS)。这种情况下，步骤 1 将失败，此时 CachedThreadPool 会创建新线程执行任务，execute 方法执行完成；

## 四 ScheduledThreadPoolExecutor 详解

### 4.1 简介

**ScheduledThreadPoolExecutor 主要用来在给定的延迟后运行任务，或者定期执行任务。**

**ScheduledThreadPoolExecutor 使用的任务队列 DelayQueue 封装了一个 PriorityQueue，PriorityQueue 会对队列中的任务进行排序，执行所需时间短的放在前面先被执行(ScheduledFutureTask 的 time 变量小的先执行)，如果执行所需时间相同则先提交的任务将被先执行(ScheduledFutureTask 的 squenceNumber 变量小的先执行)。**

**ScheduledThreadPoolExecutor 和 Timer 的比较：**

- Timer 对系统时钟的变化敏感，ScheduledThreadPoolExecutor 不是；
- Timer 只有一个执行线程，因此长时间运行的任务可以延迟其他任务。 ScheduledThreadPoolExecutor 可以配置任意数量的线程。 此外，如果你想（通过提供 ThreadFactory），你可以完全控制创建的线程;
- 在 TimerTask 中抛出的运行时异常会杀死一个线程，从而导致 Timer 死机:-( ...即计划任务将不再运行。ScheduledThreadExecutor 不仅捕获运行时异常，还允许您在需要时处理它们（通过重写 afterExecute 方法 ThreadPoolExecutor）。抛出异常的任务将被取消，但其他任务将继续运行。

**综上，在 JDK1.5 之后，你没有理由再使用 Timer 进行任务调度了。**

> **备注：** Quartz 是一个由 java 编写的任务调度库，由 OpenSymphony 组织开源出来。在实际项目开发中使用 Quartz 的还是居多，比较推荐使用 Quartz。因为 Quartz 理论上能够同时对上万个任务进行调度，拥有丰富的功能特性，包括任务调度、任务持久化、可集群化、插件等等。

### 4.2 ScheduledThreadPoolExecutor 运行机制

![ScheduledThreadPoolExecutor运行机制](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC00LTE2LzkyNTk0Njk4LmpwZw?x-oss-process=image/format,png)

**ScheduledThreadPoolExecutor 的执行主要分为两大部分：**

1. 当调用 ScheduledThreadPoolExecutor 的 **scheduleAtFixedRate()** 方法或者**scheduleWirhFixedDelay()** 方法时，会向 ScheduledThreadPoolExecutor 的 **DelayQueue** 添加一个实现了 **RunnableScheduledFutur** 接口的 **ScheduledFutureTask** 。
2. 线程池中的线程从 DelayQueue 中获取 ScheduledFutureTask，然后执行任务。

**ScheduledThreadPoolExecutor 为了实现周期性的执行任务，对 ThreadPoolExecutor 做了如下修改：**

- 使用 **DelayQueue** 作为任务队列；
- 获取任务的方不同
- 执行周期任务后，增加了额外的处理

### 4.3 ScheduledThreadPoolExecutor 执行周期任务的步骤

![ScheduledThreadPoolExecutor执行周期任务的步骤](https://imgconvert.csdnimg.cn/aHR0cDovL215LWJsb2ctdG8tdXNlLm9zcy1jbi1iZWlqaW5nLmFsaXl1bmNzLmNvbS8xOC01LTMwLzU5OTE2Mzg5LmpwZw?x-oss-process=image/format,png)

1. 线程 1 从 DelayQueue 中获取已到期的 ScheduledFutureTask（DelayQueue.take()）。到期任务是指 ScheduledFutureTask 的 time 大于等于当前系统的时间；
2. 线程 1 执行这个 ScheduledFutureTask；
3. 线程 1 修改 ScheduledFutureTask 的 time 变量为下次将要被执行的时间；
4. 线程 1 把这个修改 time 之后的 ScheduledFutureTask 放回 DelayQueue 中（DelayQueue.add())。

### 4.4 ScheduledThreadPoolExecutor 使用示例

1. 创建一个简单的实现 Runnable 接口的类（我们上面的例子已经实现过）

2. 测试程序使用 ScheduledExecutorService 和 ScheduledThreadPoolExecutor 实现的 java 调度。

```java
/**
 * 使用ScheduledExecutorService和ScheduledThreadPoolExecutor实现的java调度程序示例程序。
 */
public class ScheduledThreadPoolDemo {

    public static void main(String[] args) throws InterruptedException {

        //创建一个ScheduledThreadPoolExecutor对象
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        //计划在某段时间后运行
        System.out.println("Current Time = "+new Date());
        for(int i=0; i<3; i++){
            Thread.sleep(1000);
            WorkerThread worker = new WorkerThread("do heavy processing");
            //创建并执行在给定延迟后启用的单次操作。
            scheduledThreadPool.schedule(worker, 10, TimeUnit.SECONDS);
        }

        //添加一些延迟让调度程序产生一些线程
        Thread.sleep(30000);
        System.out.println("Current Time = "+new Date());
        //关闭线程池
        scheduledThreadPool.shutdown();
        while(!scheduledThreadPool.isTerminated()){
            //等待所有任务完成
        }
        System.out.println("Finished all threads");
    }

}
```

运行结果：

```
Current Time = Wed May 30 17:11:16 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:11:27 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:11:28 CST 2018
pool-1-thread-3 Start. Time = Wed May 30 17:11:29 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:11:32 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:11:33 CST 2018
pool-1-thread-3 End. Time = Wed May 30 17:11:34 CST 2018
Current Time = Wed May 30 17:11:49 CST 2018
Finished all threads
```

#### 4.4.1 ScheduledExecutorService scheduleAtFixedRate(Runnable command,long initialDelay,long period,TimeUnit unit)方法

我们可以使用 ScheduledExecutorService scheduleAtFixedRate 方法来安排任务在初始延迟后运行，然后在给定的时间段内运行。

时间段是从池中第一个线程的开始，因此如果您将 period 指定为 1 秒并且线程运行 5 秒，那么只要第一个工作线程完成执行，下一个线程就会开始执行。

```java
for (int i = 0; i < 3; i++) {
	Thread.sleep(1000);
	WorkerThread worker = new WorkerThread("do heavy processing");
	// schedule task to execute at fixed rate
	scheduledThreadPool.scheduleAtFixedRate(worker, 0, 10,
	TimeUnit.SECONDS);
}
```

输出示例:

```
Current Time = Wed May 30 17:47:09 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:47:10 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:47:11 CST 2018
pool-1-thread-3 Start. Time = Wed May 30 17:47:12 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:47:15 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:47:16 CST 2018
pool-1-thread-3 End. Time = Wed May 30 17:47:17 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:47:20 CST 2018
pool-1-thread-4 Start. Time = Wed May 30 17:47:21 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:47:22 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:47:25 CST 2018
pool-1-thread-4 End. Time = Wed May 30 17:47:26 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:47:27 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:47:30 CST 2018
pool-1-thread-3 Start. Time = Wed May 30 17:47:31 CST 2018
pool-1-thread-5 Start. Time = Wed May 30 17:47:32 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:47:35 CST 2018
pool-1-thread-3 End. Time = Wed May 30 17:47:36 CST 2018
pool-1-thread-5 End. Time = Wed May 30 17:47:37 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:47:40 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:47:41 CST 2018
Current Time = Wed May 30 17:47:42 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:47:45 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:47:46 CST 2018
Finished all threads

Process finished with exit code 0

```

#### 4.4.2 ScheduledExecutorService scheduleWithFixedDelay(Runnable command,long initialDelay,long delay,TimeUnit unit)方法

ScheduledExecutorService scheduleWithFixedDelay 方法可用于以初始延迟启动周期性执行，然后以给定延迟执行。 延迟时间是线程完成执行的时间。

```java
for (int i = 0; i < 3; i++) {
	Thread.sleep(1000);
	WorkerThread worker = new WorkerThread("do heavy processing");
	scheduledThreadPool.scheduleWithFixedDelay(worker, 0, 1,
	TimeUnit.SECONDS);
}
```

输出示例：

```
Current Time = Wed May 30 17:58:09 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:58:10 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:11 CST 2018
pool-1-thread-3 Start. Time = Wed May 30 17:58:12 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:58:15 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:16 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:58:16 CST 2018
pool-1-thread-3 End. Time = Wed May 30 17:58:17 CST 2018
pool-1-thread-4 Start. Time = Wed May 30 17:58:17 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:18 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:58:21 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:58:22 CST 2018
pool-1-thread-4 End. Time = Wed May 30 17:58:22 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:23 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:23 CST 2018
pool-1-thread-4 Start. Time = Wed May 30 17:58:24 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:58:27 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:28 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:58:28 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:29 CST 2018
pool-1-thread-4 End. Time = Wed May 30 17:58:29 CST 2018
pool-1-thread-4 Start. Time = Wed May 30 17:58:30 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:58:33 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:34 CST 2018
pool-1-thread-1 Start. Time = Wed May 30 17:58:34 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:35 CST 2018
pool-1-thread-4 End. Time = Wed May 30 17:58:35 CST 2018
pool-1-thread-4 Start. Time = Wed May 30 17:58:36 CST 2018
pool-1-thread-1 End. Time = Wed May 30 17:58:39 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:40 CST 2018
pool-1-thread-5 Start. Time = Wed May 30 17:58:40 CST 2018
pool-1-thread-4 End. Time = Wed May 30 17:58:41 CST 2018
pool-1-thread-2 Start. Time = Wed May 30 17:58:41 CST 2018
Current Time = Wed May 30 17:58:42 CST 2018
pool-1-thread-5 End. Time = Wed May 30 17:58:45 CST 2018
pool-1-thread-2 End. Time = Wed May 30 17:58:46 CST 2018
Finished all threads
```

#### 4.4.3 scheduleWithFixedDelay() vs scheduleAtFixedRate()

scheduleAtFixedRate（...）将延迟视为两个任务开始之间的差异（即定期调用）
scheduleWithFixedDelay（...）将延迟视为一个任务结束与下一个任务开始之间的差异

> **scheduleAtFixedRate():** 创建并执行在给定的初始延迟之后，随后以给定的时间段首先启用的周期性动作; 那就是执行将在 initialDelay 之后开始，然后 initialDelay+period ，然后是 initialDelay + 2 \* period ，等等。 如果任务的执行遇到异常，则后续的执行被抑制。 否则，任务将仅通过取消或终止执行人终止。 如果任务执行时间比其周期长，则后续执行可能会迟到，但不会同时执行。
> **scheduleWithFixedDelay() :** 创建并执行在给定的初始延迟之后首先启用的定期动作，随后在一个执行的终止和下一个执行的开始之间给定的延迟。 如果任务的执行遇到异常，则后续的执行被抑制。 否则，任务将仅通过取消或终止执行终止。

## 五 各种线程池的适用场景介绍

- **FixedThreadPool：** 适用于为了满足资源管理需求，而需要限制当前线程数量的应用场景。它适用于负载比较重的服务器；

- **SingleThreadExecutor：** 适用于需要保证顺序地执行各个任务并且在任意时间点，不会有多个线程是活动的应用场景。

**CachedThreadPool：** 适用于执行很多的短期异步任务的小程序，或者是负载较轻的服务器；

**ScheduledThreadPoolExecutor：** 适用于需要多个后台执行周期任务，同时为了满足资源管理需求而需要限制后台线程的数量的应用场景，

**SingleThreadScheduledExecutor：** 适用于需要单个后台线程执行周期任务，同时保证顺序地执行各个任务的应用场景。

## 六 总结

本节只是简单的介绍了一下使用线程池的好处，然后花了大量篇幅介绍 Executor 框架。详细介绍了 Executor 框架中 ThreadPoolExecutor 和 ScheduledThreadPoolExecutor，并且通过实例详细讲解了 ScheduledThreadPoolExecutor 的使用。对于 FutureTask 只是粗略带过，因为篇幅问题，并没有深究它的原理，后面的文章会进行补充。这一篇文章只是大概带大家过一下线程池的基本概览，深入讲解的地方不是很多，后续会通过源码深入研究其中比较重要的一些知识点。

最后，就是这两周要考试了，会抽点时间出来简单应付一下学校考试了。然后，就是写这篇多线程的文章废了好多好多时间。一直不知从何写起。

## 参考

- 《Java 并发编程的艺术》
- [Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example](https://www.journaldev.com/2340/java-scheduler-scheduledexecutorservice-scheduledthreadpoolexecutor-example "Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example")
- [java.util.concurrent.ScheduledThreadPoolExecutor Example](https://examples.javacodegeeks.com/core-java/util/concurrent/scheduledthreadpoolexecutor/java-util-concurrent-scheduledthreadpoolexecutor-example/ "java.util.concurrent.ScheduledThreadPoolExecutor Example")
- [ThreadPoolExecutor – Java Thread Pool Example](https://www.journaldev.com/1069/threadpoolexecutor-java-thread-pool-example-executorservice "ThreadPoolExecutor – Java Thread Pool Example")

## 其他推荐阅读

- [Java并发（三）线程池原理](https://www.cnblogs.com/warehouse/p/10720781.html)