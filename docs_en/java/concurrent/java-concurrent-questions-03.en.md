---
title: Summary of common Java concurrency interview questions (Part 2)
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: multi-threading, deadlock, thread pool, CAS, AQS
  - - meta
    - name: description
      content: Summary of common Java concurrency knowledge points and interview questions (including detailed answers), I hope it will be helpful to you!
---

<!-- @include: @article-header.snippet.md -->

##ThreadLocal

### What is ThreadLocal used for?

Normally, the variables we create can be accessed and modified by any thread. This can lead to data races and thread safety issues in multi-threaded environments. So, if you want each thread to have its own exclusive local variable, how to implement it? **

The `ThreadLocal` class provided in the JDK is designed to solve this problem. **The `ThreadLocal` class allows each thread to bind its own value**, which can be vividly compared to a "box that stores data". Each thread has its own independent box for storing private data to ensure that data between different threads do not interfere with each other.

When you create a `ThreadLocal` variable, each thread that accesses the variable will have an independent copy. This is where the name `ThreadLocal` comes from. A thread can obtain a local copy of its own thread through the `get()` method, or modify the value of the copy through the `set()` method, thereby avoiding thread safety issues.

To give a simple example: Suppose two people go to the treasure house to collect treasures. If they share a bag, there will inevitably be arguments; but if everyone has an independent bag, there will be no such problem. If these two people are compared to threads, then `ThreadLocal` is a method used to prevent these two threads from competing for the same resource.

```java
public class ThreadLocalExample {
    private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) {
        Runnable task = () -> {
            int value = threadLocal.get();
            value += 1;
            threadLocal.set(value);
            System.out.println(Thread.currentThread().getName() + " Value: " + threadLocal.get());
        };

        Thread thread1 = new Thread(task, "Thread-1");
        Thread thread2 = new Thread(task, "Thread-2");

        thread1.start(); // Output: Thread-1 Value: 1
        thread2.start(); // Output: Thread-2 Value: 1
    }
}
```

### ⭐️Do you understand the principle of ThreadLocal?

Start with the `Thread` class source code.

```java
public class Thread implements Runnable {
    //......
    //ThreadLocal value related to this thread. Maintained by ThreadLocal class
    ThreadLocal.ThreadLocalMap threadLocals = null;

    //InheritableThreadLocal value related to this thread. Maintained by InheritableThreadLocal class
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;
    //......
}
```

From the source code of the `Thread` class above, we can see that there is a `threadLocals` and an `inheritableThreadLocals` variable in the `Thread` class. They are both variables of the `ThreadLocalMap` type. We can understand `ThreadLocalMap` as a customized `HashMap` implemented by the `ThreadLocal` class. By default, these two variables are null. They are created only when the current thread calls the `set` or `get` method of the `ThreadLocal` class. In fact, when calling these two methods, we call the `get()` and `set()` methods corresponding to the `ThreadLocalMap` class.

`set()` method of `ThreadLocal` class

```java
public void set(T value) {
    //Get the thread of the current request
    Thread t = Thread.currentThread();
    //Get the threadLocals variable (hash table structure) inside the Thread class
    ThreadLocalMap map = getMap(t);
    if (map != null)
        //Put the value to be stored into this hash table
        map.set(this, value);
    else
        createMap(t, value);
}
ThreadLocalMap getMap(Thread t) {
    return t.threadLocals;
}
```

Through the above content, we can conclude by guessing: **The final variable is placed in the `ThreadLocalMap` of the current thread, and does not exist on `ThreadLocal`. `ThreadLocal` can be understood as just a package of `ThreadLocalMap`, passing the variable value. ** In the `ThrealLocal` class, after you can obtain the current thread object through `Thread.currentThread()`, you can directly access the `ThreadLocalMap` object of the thread through `getMap(Thread t)`.

**Each `Thread` has a `ThreadLocalMap`, and `ThreadLocalMap` can store key-value pairs with `ThreadLocal` as the key and the Object object as the value. **

```java
ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
    //......
}
```

For example, if we declare two `ThreadLocal` objects in the same thread, `Thread` internally uses the only `ThreadLocal` to store data. The key of `ThreadLocalMap` is the `ThreadLocal` object, and the value is the value set by calling the `set` method of the `ThreadLocal` object.

The `ThreadLocal` data structure is shown in the figure below:

![ThreadLocal data structure](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadlocal-data-structure.png)

`ThreadLocalMap` is a static inner class of `ThreadLocal`.

![ThreadLocal inner class](https://oss.javaguide.cn/github/javaguide/java/concurrent/thread-local-inner-class.png)

### ⭐️What causes ThreadLocal memory leak problem?

The root cause of `ThreadLocal` memory leaks lies in its internal implementation mechanism.

From the above content, we already know: each thread maintains a map named `ThreadLocalMap`. When you use `ThreadLocal` to store a value, you are actually storing the value in the current thread's `ThreadLocalMap`, with the `ThreadLocal` instance itself as the key and the value you want to store as the value.

The source code of `set()` method of `ThreadLocal` is as follows:

```java
public void set(T value) {
    Thread t = Thread.currentThread(); // Get the current thread
    ThreadLocalMap map = getMap(t); // Get the ThreadLocalMap of the current thread
    if (map != null) {
        map.set(this, value); // Set value
    } else {
        createMap(t, value); // Create a new ThreadLocalMap
    }
}
```In the `set()` and `createMap()` methods of `ThreadLocalMap`, the `ThreadLocal` object itself is not directly stored. Instead, the hash value of `ThreadLocal` is used to calculate the array index, and is finally stored in an array of type `static class Entry extends WeakReference<ThreadLocal<?>>`.

```java
int i = key.threadLocalHashCode & (len-1);
```

`Entry` of `ThreadLocalMap` is defined as follows:

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

`ThreadLocalMap`’s `key` and `value` reference mechanism:

- **key is a weak reference**: The key in `ThreadLocalMap` is a weak reference to `ThreadLocal` (`WeakReference<ThreadLocal<?>>`). This means that if a `ThreadLocal` instance is no longer pointed to by any strong reference, the garbage collector will recycle the instance during the next GC, causing the corresponding key in `ThreadLocalMap` to become `null`.
- **value is a strong reference**: Even if `key` is recycled by GC, `value` is still strongly referenced by `ThreadLocalMap.Entry` and cannot be recycled by GC.

When a `ThreadLocal` instance loses its strong reference, its corresponding value still exists in `ThreadLocalMap` because the `Entry` object has a strong reference to it. If the thread continues to survive (such as a thread in a thread pool), `ThreadLocalMap` will always exist, causing the entry with key `null` to not be garbage collected, which will cause a memory leak.

In other words, for a memory leak to occur, two conditions need to be met at the same time:

1. The `ThreadLocal` instance is no longer strongly referenced;
2. The thread continues to survive, causing `ThreadLocalMap` to exist for a long time.

Although `ThreadLocalMap` will try to clean up entries with null keys during `get()`, `set()` and `remove()` operations, this cleaning mechanism is passive and not completely reliable.

**How ​​to avoid memory leaks? **

1. After using `ThreadLocal`, be sure to call the `remove()` method. This is the safest and most recommended approach. The `remove()` method will explicitly remove the corresponding entry from `ThreadLocalMap`, completely eliminating the risk of memory leaks. Even if `ThreadLocal` is defined as `static final`, it is strongly recommended to call `remove()` after each use.
2. In thread pool and other thread reuse scenarios, using the `try-finally` block can ensure that the `remove()` method will be executed even if an exception occurs.

### ⭐️How to pass the value of ThreadLocal across threads?

Because the variable value of `ThreadLocal` is stored in `Thread`, and the parent and child threads belong to different `Thread`. Therefore, in an asynchronous scenario, the `ThreadLocal` value of the parent and child threads cannot be transferred.

If you want to pass `ThreadLocal` value in asynchronous scenario, there are two solutions:

- `InheritableThreadLocal`: `InheritableThreadLocal` is a tool provided by JDK1.2 and inherits from `ThreadLocal`. When using `InheritableThreadLocal`, when creating a child thread, the child thread will inherit the `ThreadLocal` value in the parent thread, but the `ThreadLocal` value transfer in the thread pool scenario cannot be supported.
- `TransmittableThreadLocal`: `TransmittableThreadLocal` (referred to as TTL) is Alibaba's open source tool class. It inherits and enhances the `InheritableThreadLocal` class and can support `ThreadLocal` value transfer in a thread pool scenario. Project address: <https://github.com/alibaba/transmittable-thread-local>.

#### InheritableThreadLocal principle

`InheritableThreadLocal` implements the function of inheriting the `ThreadLocal` value of the parent thread when creating an asynchronous thread. This class is provided by the JDK team. It implements the transfer of the `ThreadLocal` value when creating a thread by transforming the `Thread` class in the JDK source code package.

**Where is the value of `InheritableThreadLocal` stored? **

A new `ThreadLocalMap` was added to the `Thread` class, named `inheritableThreadLocals`. This variable is used to store `ThreadLocal` values that need to be passed across threads. As follows:

```JAVA
class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;
}
```

**How to complete the passing of `ThreadLocal` value? **

This is achieved by transforming the constructor of the `Thread` class. When creating a `Thread` thread, just get the `inheritableThreadLocals` variable of the parent thread and assign it to the child thread. The relevant code is as follows:

```JAVA
// The constructor of Thread will call the init() method
private void init(/* ... */) {
	// 1. Get the parent thread
    Thread parent = currentThread();
    // 2. Assign the inheritableThreadLocals of the parent thread to the child thread
    if (inheritThreadLocals && parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
        	ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
}
```

#### TransmittableThreadLocal principle

By default, JDK does not support the function of `ThreadLocal` value transfer in thread pool scenarios, so Alibaba open sourced a set of tools `TransmittableThreadLocal` to implement this function.

Alibaba cannot change the source code of the JDK, so it uses the **decorator mode** internally to enhance the original functions to achieve the `ThreadLocal` value transfer in the thread pool scenario.

There are two places where TTL has been transformed:

- Implement a custom `Thread` and perform the assignment operation of the `ThreadLocal` variable inside the `run()` method.

- Decoration based on **Thread Pool**, in the `execute()` method, do not submit the JDK internal `Thread`, but submit the custom `Thread`.

If you want to view the relevant source code, you can introduce Maven dependencies for download.

```XML
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>transmittable-thread-local</artifactId>
    <version>2.12.0</version>
</dependency>
```

#### Application scenarios

1. **Pressure test flow mark**: In the pressure test scenario, use `ThreadLocal` to store the stress test mark, which is used to distinguish the pressure test flow and the real flow. If the tag is missing, the stress test traffic may be mistakenly treated as online traffic.
2. **Context delivery**: In a distributed system, transfer link tracking information (such as Trace ID) or user context information.

## Thread pool

### What is a thread pool?

As the name suggests, a thread pool is a resource pool that manages a series of threads. When there is a task to be processed, the thread is directly obtained from the thread pool for processing. After processing, the thread will not be destroyed immediately, but will wait for the next task.

### ⭐️Why use thread pool?

Pooling technology must be familiar to everyone. Thread pools, database connection pools, HTTP connection pools, etc. are all applications of this idea. The idea of ​​pooling technology is mainly to reduce the consumption of resources each time and improve the utilization of resources.

Thread pools provide a way to limit and manage resources, including executing a task. Each thread pool also maintains some basic statistics, such as the number of completed tasks. Using a thread pool mainly brings the following benefits:

1. **Reduce resource consumption**: Threads in the thread pool can be reused. Once a thread completes a task, it is not destroyed immediately, but returns to the pool to wait for the next task. This avoids the overhead caused by frequently creating and destroying threads.2. **Improve response speed**: Because the thread pool usually maintains a certain number of core threads (or "resident workers"), when tasks come, they can be directly handed over to these existing and idle threads for execution, saving the time of creating threads, and tasks can be processed faster.
3. **Improve thread manageability**: The thread pool allows us to uniformly manage the threads in the pool. We can configure the size of the thread pool (number of core threads, maximum number of threads), type and size of task queue, rejection policy, etc. This can control the total number of concurrent threads, prevent resource exhaustion, and ensure system stability. At the same time, the thread pool usually also provides a monitoring interface to facilitate us to understand the running status of the thread pool (such as how many active threads there are, how many tasks are queued, etc.) and to facilitate tuning.

### How to create a thread pool?

In Java, there are two main ways to create a thread pool:

**Method 1: Create directly through the `ThreadPoolExecutor` constructor (recommended)**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-construtors.png)

This is the most recommended method because it allows developers to explicitly specify the core parameters of the thread pool and have more granular control over the running behavior of the thread pool, thus avoiding the risk of resource exhaustion.

**Method 2: Create through `Executors` tool class (not recommended for production environment)**

The method of creating a thread pool provided by the `Executors` tool class is shown in the figure below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executors-new-thread-pool-methods.png)

It can be seen that multiple types of thread pools can be created through the `Executors` tool class, including:

- `FixedThreadPool`: A thread pool with a fixed number of threads. The number of threads in this thread pool always remains the same. When a new task is submitted, if there are idle threads in the thread pool, it will be executed immediately. If not, the new task will be temporarily stored in a task queue, and when a thread is idle, the task in the task queue will be processed.
- `SingleThreadExecutor`: Thread pool with only one thread. If more than one task is submitted to the thread pool, the task will be saved in a task queue. When the thread is idle, the tasks in the queue will be executed in first-in, first-out order.
- `CachedThreadPool`: A thread pool that can adjust the number of threads according to actual conditions. The number of threads in the thread pool is uncertain, but if there are idle threads that can be reused, the reusable threads will be used first. If all threads are working and a new task is submitted, a new thread will be created to handle the task. After all threads complete the execution of the current task, they will be returned to the thread pool for reuse.
- `ScheduledThreadPool`: A thread pool that runs tasks after a given delay or executes tasks periodically.

### ⭐️Why is it not recommended to use the built-in thread pool?

In the "Concurrency Processing" chapter of the "Alibaba Java Development Manual", it is clearly stated that thread resources must be provided through the thread pool, and explicit creation of threads in the application is not allowed.

**Why? **

> The advantage of using a thread pool is to reduce the time spent on creating and destroying threads and system resource overhead, and solve the problem of insufficient resources. If the thread pool is not used, it may cause the system to create a large number of similar threads, leading to memory consumption or "excessive switching" problems.

In addition, the mandatory thread pool in the "Alibaba Java Development Manual" does not allow the use of `Executors` to create, but through the `ThreadPoolExecutor` constructor. This processing method allows the writing students to be more clear about the operating rules of the thread pool and avoid the risk of resource exhaustion.

The disadvantages of `Executors` returning thread pool objects are as follows (will be introduced in detail later):

- `FixedThreadPool` and `SingleThreadExecutor`: use the blocking queue `LinkedBlockingQueue`. The maximum length of the task queue is `Integer.MAX_VALUE`, which can be regarded as unbounded and may accumulate a large number of requests, resulting in OOM.
- `CachedThreadPool`: uses a synchronized queue `SynchronousQueue`, and the number of threads allowed to be created is `Integer.MAX_VALUE`. If there are too many tasks and the execution speed is slow, a large number of threads may be created, resulting in OOM.
- `ScheduledThreadPool` and `SingleThreadScheduledExecutor`: use the unbounded delay blocking queue `DelayedWorkQueue`, the maximum length of the task queue is `Integer.MAX_VALUE`, which may accumulate a large number of requests, resulting in OOM.

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    // The default length of LinkedBlockingQueue is Integer.MAX_VALUE, which can be regarded as unbounded
    return new ThreadPoolExecutor(nThreads, nThreads,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>());

}

public static ExecutorService newSingleThreadExecutor() {
    // The default length of LinkedBlockingQueue is Integer.MAX_VALUE, which can be regarded as unbounded
    return new FinalizableDelegatedExecutorService (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>()));

}

// Synchronous queue SynchronousQueue, no capacity, the maximum number of threads is Integer.MAX_VALUE`
public static ExecutorService newCachedThreadPool() {

    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,60L, TimeUnit.SECONDS,new SynchronousQueue<Runnable>());

}

// DelayedWorkQueue (delayed blocking queue)
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

### ⭐️What are the common parameters of thread pool? How to explain?

```java
    /**
     * Create a new ThreadPoolExecutor with the given initial parameters.
     */
    public ThreadPoolExecutor(int corePoolSize,//The number of core threads in the thread pool
                              int maximumPoolSize,//The maximum number of threads in the thread pool
                              long keepAliveTime,//When the number of threads is greater than the number of core threads, the maximum time for the excess idle threads to survive
                              TimeUnit unit,//time unit
                              BlockingQueue<Runnable> workQueue,//task queue, used to store queues waiting for execution of tasks
                              ThreadFactory threadFactory,//Thread factory, used to create threads, generally the default is enough
                              RejectedExecutionHandler handler//Rejection strategy, when too many tasks are submitted and cannot be processed in time, we can customize the strategy to handle the tasks
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
    }```

`ThreadPoolExecutor` 3 most important parameters:

- `corePoolSize`: When the task queue does not reach the queue capacity, the maximum number of threads that can run simultaneously.
- `maximumPoolSize`: When the tasks stored in the task queue reach the queue capacity, the number of threads that can currently run simultaneously becomes the maximum number of threads.
- `workQueue`: When a new task comes, it will first determine whether the number of currently running threads reaches the number of core threads. If so, the new task will be stored in the queue.

`ThreadPoolExecutor`Other common parameters:

- `keepAliveTime`: When the number of threads in the thread pool is greater than `corePoolSize`, that is, when there are non-core threads (threads other than core threads in the thread pool), these non-core threads will not be destroyed immediately after becoming idle, but will wait until the waiting time exceeds `keepAliveTime` before they will be recycled and destroyed.
- `unit` : The time unit of the `keepAliveTime` parameter.
- `threadFactory` :executor is used when creating a new thread.
- `handler`: rejection strategy (will be introduced in detail later).

The picture below can deepen your understanding of the relationship between various parameters in the thread pool (picture source: "Java Performance Tuning Practice"):

![Relationship between thread pool parameters](https://oss.javaguide.cn/github/javaguide/java/concurrent/relationship-between-thread-pool-parameters.png)

### Will the core threads of the thread pool be recycled?

`ThreadPoolExecutor` will not recycle core threads by default, even if they are idle. This is to reduce the overhead of creating threads, because core threads are usually kept active for a long time. However, if the thread pool is used for cyclic use scenarios and the frequency is not high (there is obvious idle time between cycles), you can consider setting the parameter of the `allowCoreThreadTimeOut(boolean value)` method to `true`, so that the idle (time interval is specified by `keepAliveTime`) core threads will be recycled.

```java
public void allowCoreThreadTimeOut(boolean value) {
    // The keepAliveTime of the core thread must be greater than 0 to enable the timeout mechanism
    if (value && keepAliveTime <= 0) {
        throw new IllegalArgumentException("Core threads must have nonzero keep alive times");
    }
    //Set the value of allowCoreThreadTimeOut
    if (value != allowCoreThreadTimeOut) {
        allowCoreThreadTimeOut = value;
        // If the timeout mechanism is enabled, clean up all idle threads, including core threads
        if (value) {
            interruptIdleWorkers();
        }
    }
}
```

### What state is the core thread in when it is idle?

When the core thread is idle, its status is divided into the following two situations:

- **Set the survival time of the core thread**: When the core thread is idle, it will be in the `WAITING` state, waiting to obtain tasks. If the blocking waiting time exceeds the core thread survival time, the thread will exit the work, the thread will be removed from the worker thread collection of the thread pool, and the thread status will change to `TERMINATED` state.
- **The survival time of the core thread is not set**: When the core thread is idle, it will always be in the `WAITING` state, waiting to obtain tasks, and the core thread will always survive in the thread pool.

When there are available tasks in the queue, the blocked thread will be awakened, and the thread's state will change from `WAITING` state to `RUNNABLE` state, and then the corresponding task will be executed.

Next, learn about how the thread pool is done internally through the relevant source code.

Threads are abstracted into `Worker` inside the thread pool. When `Worker` is started, it will continue to obtain tasks from the task queue.

When acquiring tasks, the behavior of acquiring tasks from the task queue (`BlockingQueue`) will be determined based on the `timed` value.

If "the survival time of the core thread is set" or "the number of threads exceeds the number of core threads", then `timed` is marked as `true`, indicating that `poll()` needs to be used to specify the timeout when acquiring the task.

- `timed == true`: Use `poll(timeout, unit)` to get the task. If you use the `poll(timeout, unit)` method to obtain the task timeout, the current thread will exit execution (`TERMINATED`) and the thread will be removed from the thread pool.
- `timed == false`: Use `take()` to get the task. Using the `take()` method to obtain a task will cause the current thread to be blocked and waiting (`WAITING`).

The source code is as follows:

```JAVA
// ThreadPoolExecutor
private Runnable getTask() {
    boolean timedOut = false;
    for (;;) {
        // ...

        // 1. If "the survival time of the core thread is set" or "the number of threads exceeds the number of core threads", then timed is true.
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        // 2. Decrease the number of threads.
        // wc > maximuimPoolSize: The number of threads in the thread pool exceeds the maximum number of threads. Where wc is the number of threads in the thread pool.
        // timed && timeOut: timeOut indicates that the acquisition task has timed out.
        // Divided into two situations: the core thread has set a survival time && if the acquisition task times out, the number of threads will be deducted; the number of threads exceeds the number of core threads && if the acquisition task times out, the number of threads will be deducted.
        if ((wc > maximumPoolSize || (timed && timedOut))
            && (wc > 1 || workQueue.isEmpty())) {
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }
        try {
            // 3. If timed is true, use poll() to obtain the task; otherwise, use take() to obtain the task.
            Runnable r = timed?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS):
                workQueue.take();
            // 4. Return after obtaining the task.
            if (r != null)
                return r;
            timedOut = true;
        } catch (InterruptedException retry) {
            timedOut = false;
        }
    }
}
```

### ⭐️What are the rejection strategies of the thread pool?

If the number of threads currently running simultaneously reaches the maximum number of threads and the queue is full of tasks, `ThreadPoolExecutor` defines some strategies:

- `ThreadPoolExecutor.AbortPolicy`: Throws `RejectedExecutionException` to reject the processing of new tasks.
- `ThreadPoolExecutor.CallerRunsPolicy`: Call the executor's own thread to run the task, that is, run (`run`) the rejected task directly in the thread that calls the `execute` method. If the executor has been closed, the task will be discarded. Therefore, this strategy will reduce the speed of new task submission and affect the overall performance of the program. You can choose this strategy if your application can tolerate this delay and you require that every task request must be executed.
- `ThreadPoolExecutor.DiscardPolicy`: New tasks are not processed and discarded directly.
- `ThreadPoolExecutor.DiscardOldestPolicy`: This policy will discard the oldest unhandled task request.For example: When Spring creates a thread pool through `ThreadPoolTaskExecutor` or we directly use the constructor of `ThreadPoolExecutor`, when we do not specify the `RejectedExecutionHandler` rejection policy to configure the thread pool, the default is `AbortPolicy`. Under this rejection strategy, if the queue is full, `ThreadPoolExecutor` will throw a `RejectedExecutionException` exception to reject the incoming task, which means that you will lose the processing of this task. If you don't want to discard tasks, you can use `CallerRunsPolicy`. `CallerRunsPolicy` is different from several other policies in that it neither abandons the task nor throws an exception. Instead, it returns the task to the caller and uses the caller's thread to execute the task.

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }

        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                // Directly execute the main thread instead of thread execution in the thread pool
                r.run();
            }
        }
    }
```

### If dropping tasks is not allowed, which rejection policy should be chosen?

Based on the above introduction to the thread pool rejection policy, I believe everyone can easily come to the answer: `CallerRunsPolicy`.

Here we will take a look at the source code of `CallerRunsPolicy`:

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }


        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            //As long as the current program is not closed, use the thread that executes the execute method to perform the task.
            if (!e.isShutdown()) {

                r.run();
            }
        }
    }
```

It can be seen from the source code that as long as the current program is not closed, the thread that executes the `execute` method will be used to perform the task.

### What are the risks of the CallerRunsPolicy deny policy? How to solve it?

We also mentioned above: If you want to ensure that any task request will be executed, it is more appropriate to choose the `CallerRunsPolicy` rejection policy.

However, if the task of reaching `CallerRunsPolicy` is a very time-consuming task, and the thread that handles the submitted task is the main thread, it may cause the main thread to be blocked and affect the normal operation of the program.

Here is a simple example. The thread pool limits the maximum number of threads to 2 and the blocking queue size to 1 (which means that the fourth task will reach the rejection policy). `ThreadUtil` is a tool class provided by Hutool:

```java
public class ThreadPoolTest {

    private static final Logger log = LoggerFactory.getLogger(ThreadPoolTest.class);

    public static void main(String[] args) {
        //Create a thread pool with the number of core threads being 1 and the maximum number of threads being 2
        // When the number of threads is greater than the number of core threads, the maximum time that the excess idle threads can survive is 60 seconds.
        // The task queue is an ArrayBlockingQueue with a capacity of 1, and the saturation policy is CallerRunsPolicy.
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(1,
                2,
                60,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1),
                new ThreadPoolExecutor.CallerRunsPolicy());

        // Submit the first task to be executed by the core thread
        threadPoolExecutor.execute(() -> {
            log.info("Core thread executes the first task");
            ThreadUtil.sleep(1, TimeUnit.MINUTES);
        });

        //Submit the second task. Since the core thread is occupied, the task will enter the queue and wait.
        threadPoolExecutor.execute(() -> {
            log.info("Non-core thread processes the second task enqueued");
            ThreadUtil.sleep(1, TimeUnit.MINUTES);
        });

        //Submit the third task. Since the core thread is occupied and the queue is full, a non-core thread is created for processing.
        threadPoolExecutor.execute(() -> {
            log.info("Non-core thread processing third task");
            ThreadUtil.sleep(1, TimeUnit.MINUTES);
        });

        //Submit the fourth task. Since both core threads and non-core threads are occupied and the queue is full, according to the CallerRunsPolicy policy, the task will be executed by the thread that submitted the task (i.e. the main thread).
        threadPoolExecutor.execute(() -> {
            log.info("The main thread processes the fourth task");
            ThreadUtil.sleep(2, TimeUnit.MINUTES);
        });

        //Submit the fifth task. The main thread is stuck by the fourth task. The task must wait until the main thread finishes executing before it can be submitted.
        threadPoolExecutor.execute(() -> {
            log.info("Core thread executes fifth task");
        });

        // Close the thread pool
        threadPoolExecutor.shutdown();
    }
}

```

Output:

```bash
18:19:48.203 INFO [pool-1-thread-1] c.j.concurrent.ThreadPoolTest - The core thread executes the first task
18:19:48.203 INFO [pool-1-thread-2] c.j.concurrent.ThreadPoolTest - Non-core thread processing third task
18:19:48.203 INFO [main] c.j.concurrent.ThreadPoolTest - The main thread processes the fourth task
18:20:48.212 INFO [pool-1-thread-2] c.j.concurrent.ThreadPoolTest - Non-core thread handles second enqueued task
18:21:48.219 INFO [pool-1-thread-2] c.j.concurrent.ThreadPoolTest - The core thread executes the fifth task
```

It can be seen from the output results that because of the rejection policy of `CallerRunsPolicy`, time-consuming tasks are executed on the main thread, causing the thread pool to be blocked, which in turn causes subsequent tasks to be unable to be executed in time, and in serious cases may lead to OOM.

Let's start with the essence of the problem. The caller uses `CallerRunsPolicy` in the hope that all tasks can be executed, and tasks that cannot be processed temporarily are stored in the blocking queue `BlockingQueue`. In this case, if memory permits, we can increase the size of the blocking queue `BlockingQueue` and adjust the heap memory to accommodate more tasks to ensure that tasks can be executed accurately.

In order to make full use of the CPU, we can also adjust the `maximumPoolSize` (maximum number of threads) parameter of the thread pool, which can increase the task processing speed and avoid running out of memory due to too many tasks accumulated in the `BlockingQueue`.

![Adjust the blocking queue size and maximum number of threads](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpool-reject-2-threadpool-reject-01.png)如果服务器资源以达到可利用的极限，这就意味我们要在设计策略上改变线程池的调度了，我们都知道，导致主线程卡死的本质就是因为我们不希望任何一个任务被丢弃。换个思路，有没有办法既能保证任务不被丢弃且在服务器有余力时及时处理呢？

这里提供的一种**任务持久化**的思路，这里所谓的任务持久化，包括但不限于:

1. 设计一张任务表将任务存储到 MySQL 数据库中。
2. Redis 缓存任务。
3. 将任务提交到消息队列中。

这里以方案一为例，简单介绍一下实现逻辑：

1. 实现`RejectedExecutionHandler`接口自定义拒绝策略，自定义拒绝策略负责将线程池暂时无法处理（此时阻塞队列已满）的任务入库（保存到 MySQL 中）。注意：线程池暂时无法处理的任务会先被放在阻塞队列中，阻塞队列满了才会触发拒绝策略。
2. 继承`BlockingQueue`实现一个混合式阻塞队列，该队列包含 JDK 自带的`ArrayBlockingQueue`。另外，该混合式阻塞队列需要修改取任务处理的逻辑，也就是重写`take()`方法，取任务时优先从数据库中读取最早的任务，数据库中无任务时再从 `ArrayBlockingQueue`中去取任务。

![将一部分任务保存到MySQL中](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpool-reject-2-threadpool-reject-02.png)

整个实现逻辑还是比较简单的，核心在于自定义拒绝策略和阻塞队列。如此一来，一旦我们的线程池中线程达到满载时，我们就可以通过拒绝策略将最新任务持久化到 MySQL 数据库中，等到线程池有了有余力处理所有任务时，让其优先处理数据库中的任务以避免"饥饿"问题。

当然，对于这个问题，我们也可以参考其他主流框架的做法，以 Netty 为例，它的拒绝策略则是直接创建一个线程池以外的线程处理这些任务，为了保证任务的实时处理，这种做法可能需要良好的硬件设备且临时创建的线程无法做到准确的监控：

```java
private static final class NewThreadRunsPolicy implements RejectedExecutionHandler {
    NewThreadRunsPolicy() {
        super();
    }
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        try {
            //创建一个临时线程处理任务
            final Thread t = new Thread(r, "Temporary task executor");
            t.start();
        } catch (Throwable e) {
            throw new RejectedExecutionException(
                    "Failed to start a new thread", e);
        }
    }
}
```

ActiveMQ 则是尝试在指定的时效内尽可能的争取将任务入队，以保证最大交付：

```java
new RejectedExecutionHandler() {
                @Override
                public void rejectedExecution(final Runnable r, final ThreadPoolExecutor executor) {
                    try {
                        //限时阻塞等待，实现尽可能交付
                        executor.getQueue().offer(r, 60, TimeUnit.SECONDS);
                    } catch (InterruptedException e) {
                        throw new RejectedExecutionException("Interrupted waiting for BrokerService.worker");
                    }
                    throw new RejectedExecutionException("Timed Out while attempting to enqueue Task.");
                }
            });
```

### 线程池常用的阻塞队列有哪些？

新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

不同的线程池会选用不同的阻塞队列，我们可以结合内置线程池来分析。

- 容量为 `Integer.MAX_VALUE` 的 `LinkedBlockingQueue`（无界阻塞队列）：`FixedThreadPool` 和 `SingleThreadExecutor` 。`FixedThreadPool`最多只能创建核心线程数的线程（核心线程数和最大线程数相等），`SingleThreadExecutor`只能创建一个线程（核心线程数和最大线程数都是 1），二者的任务队列永远不会被放满。
- `SynchronousQueue`（同步队列）：`CachedThreadPool` 。`SynchronousQueue` 没有容量，不存储元素，目的是保证对于提交的任务，如果有空闲线程，则使用空闲线程来处理；否则新建一个线程来处理任务。也就是说，`CachedThreadPool` 的最大线程数是 `Integer.MAX_VALUE` ，可以理解为线程数是可以无限扩展的，可能会创建大量线程，从而导致 OOM。
- `DelayedWorkQueue`（延迟队列）：`ScheduledThreadPool` 和 `SingleThreadScheduledExecutor` 。`DelayedWorkQueue` 的内部元素并不是按照放入的时间排序，而是会按照延迟的时间长短对任务进行排序，内部采用的是“堆”的数据结构，可以保证每次出队的任务都是当前队列中执行时间最靠前的。`DelayedWorkQueue` 是一个无界队列。其底层虽然是数组，但当数组容量不足时，它会自动进行扩容，因此队列永远不会被填满。当任务不断提交时，它们会全部被添加到队列中。这意味着线程池的线程数量永远不会超过其核心线程数，最大线程数参数对于使用该队列的线程池来说是无效的。
- `ArrayBlockingQueue`（有界阻塞队列）：底层由数组实现，容量一旦创建，就不能修改。

### ⭐️线程池处理任务的流程了解吗？

![图解线程池实现原理](https://oss.javaguide.cn/github/javaguide/java/concurrent/thread-pool-principle.png)

1. 如果当前运行的线程数小于核心线程数，那么就会新建一个线程来执行任务。
2. 如果当前运行的线程数等于或大于核心线程数，但是小于最大线程数，那么就把该任务放入到任务队列里等待执行。
3. 如果向任务队列投放任务失败（任务队列已经满了），但是当前运行的线程数是小于最大线程数的，就新建一个线程来执行任务。
4. 如果当前运行的线程数已经等同于最大线程数了，新建线程将会使当前运行的线程超出最大线程数，那么当前任务会被拒绝，拒绝策略会调用`RejectedExecutionHandler.rejectedExecution()`方法。

再提一个有意思的小问题：**线程池在提交任务前，可以提前创建线程吗？**

答案是可以的！`ThreadPoolExecutor` 提供了两个方法帮助我们在提交任务之前，完成核心线程的创建，从而实现线程池预热的效果：

- `prestartCoreThread()`:启动一个线程，等待任务，如果已达到核心线程数，这个方法返回 false，否则返回 true；
- `prestartAllCoreThreads()`:启动所有的核心线程，并返回启动成功的核心线程数。

### ⭐️线程池中线程异常后，销毁还是复用？

直接说结论，需要分两种情况：

- **使用`execute()`提交任务**：当任务通过`execute()`提交到线程池并在执行过程中抛出异常时，如果这个异常没有在任务内被捕获，那么该异常会导致当前线程终止，并且异常会被打印到控制台或日志文件中。线程池会检测到这种线程终止，并创建一个新线程来替换它，从而保持配置的线程数不变。
- **使用`submit()`提交任务**：对于通过`submit()`提交的任务，如果在任务执行中发生异常，这个异常不会直接打印出来。相反，异常会被封装在由`submit()`返回的`Future`对象中。当调用`Future.get()`方法时，可以捕获到一个`ExecutionException`。在这种情况下，线程不会因为异常而终止，它会继续存在于线程池中，准备执行后续的任务。

简单来说：使用`execute()`时，未捕获异常导致线程终止，线程池创建新线程替代；使用`submit()`时，异常被封装在`Future`中，线程继续复用。

这种设计允许`submit()`提供更灵活的错误处理机制，因为它允许调用者决定如何处理异常，而`execute()`则适用于那些不需要关注执行结果的场景。

具体的源码分析可以参考这篇：[线程池中线程异常后：销毁还是复用？ - 京东技术](https://mp.weixin.qq.com/s/9ODjdUU-EwQFF5PrnzOGfw)。

### ⭐️如何给线程池命名？

初始化线程池的时候需要显示命名（设置线程池名称前缀），有利于定位问题。

默认情况下创建的线程名字类似 `pool-1-thread-n` 这样的，没有业务含义，不利于我们定位问题。

给线程池里的线程命名通常有下面两种方式：

**1、利用 guava 的 `ThreadFactoryBuilder`**

```java
ThreadFactory threadFactory = new ThreadFactoryBuilder()
                        .setNameFormat(threadNamePrefix + "-%d")
                        .setDaemon(true).build();
ExecutorService threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit.MINUTES, workQueue, threadFactory);
```

**2、自己实现 `ThreadFactory`。**

```java
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 线程工厂，它设置线程名称，有利于我们定位问题。
 */
public final class NamingThreadFactory implements ThreadFactory {

    private final AtomicInteger threadNum = new AtomicInteger();
    private final String name;

    /**
     * 创建一个带名字的线程池生产工厂
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
}
```

### 如何设定线程池的大小？

很多人甚至可能都会觉得把线程池配置过大一点比较好！我觉得这明显是有问题的。就拿我们生活中非常常见的一例子来说：**并不是人多就能把事情做好，增加了沟通交流成本。你本来一件事情只需要 3 个人做，你硬是拉来了 6 个人，会提升做事效率嘛？我想并不会。** 线程数量过多的影响也是和我们分配多少人做事情一样，对于多线程这个场景来说主要是增加了**上下文切换**成本。不清楚什么是上下文切换的话，可以看我下面的介绍。

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

- **CPU 密集型任务(N+1)：** 这种任务消耗的主要是 CPU 资源，可以将线程数设置为 N（CPU 核心数）+1。比 CPU 核心数多出来的一个线程是为了防止线程偶发的缺页中断，或者其它原因导致的任务暂停而带来的影响。一旦任务暂停，CPU 就会处于空闲状态，而在这种情况下多出来的一个线程就可以充分利用 CPU 的空闲时间。
- **I/O 密集型任务(2N)：** 这种任务应用起来，系统会用大部分的时间来处理 I/O 交互，而线程在处理 I/O 的时间段内不会占用 CPU 来处理，这时就可以将 CPU 交出给其它线程使用。因此在 I/O 密集型任务的应用中，我们可以多配置一些线程，具体的计算方法是 2N。

**如何判断是 CPU 密集任务还是 IO 密集任务？**

CPU 密集型简单理解就是利用 CPU 计算能力的任务比如你在内存中对大量数据进行排序。但凡涉及到网络读取，文件读取这类都是 IO 密集型，这类任务的特点是 CPU 计算耗费时间相比于等待 IO 操作完成的时间来说很少，大部分时间都花在了等待 IO 操作完成上。

> 🌈 拓展一下（参见：[issue#1737](https://github.com/Snailclimb/JavaGuide/issues/1737)）：
>
> 线程数更严谨的计算的方法应该是：`最佳线程数 = N（CPU 核心数）∗（1+WT（线程等待时间）/ST（线程计算时间））`，其中 `WT（线程等待时间）=线程运行总时间 - ST（线程计算时间）`。
>
> 线程等待时间所占比例越高，需要越多线程。线程计算时间所占比例越高，需要越少线程。
>
> 我们可以通过 JDK 自带的工具 VisualVM 来查看 `WT/ST` 比例。
>
> CPU 密集型任务的 `WT/ST` 接近或者等于 0，因此， 线程数可以设置为 N（CPU 核心数）∗（1+0）= N，和我们上面说的 N（CPU 核心数）+1 差不多。
>
> IO 密集型任务下，几乎全是线程等待时间，从理论上来说，你就可以将线程数设置为 2N（按道理来说，WT/ST 的结果应该比较大，这里选择 2N 的原因应该是为了避免创建过多线程吧）。

公式也只是参考，具体还是要根据项目实际线上运行情况来动态调整。我在后面介绍的美团的线程池参数动态配置这种方案就非常不错，很实用！

### ⭐️如何动态修改线程池的参数？

美团技术团队在[《Java 线程池实现原理及其在美团业务中的实践》](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)这篇文章中介绍到对线程池参数实现可自定义配置的思路和方法。

美团技术团队的思路是主要对线程池的核心参数实现自定义可配置。这三个核心参数是：

- **`corePoolSize` :** 核心线程数定义了最小可以同时运行的线程数量。
- **`maximumPoolSize` :** 当队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- **`workQueue`:** 当新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

**为什么是这三个参数？**

我在[Java 线程池详解](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html) 这篇文章中就说过这三个参数是 `ThreadPoolExecutor` 最重要的参数，它们基本决定了线程池对于任务的处理策略。

**如何支持参数动态配置？** 且看 `ThreadPoolExecutor` 提供的下面这些方法。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-methods.png)

格外需要注意的是`corePoolSize`， 程序运行期间的时候，我们调用 `setCorePoolSize()`这个方法的话，线程池会首先判断当前工作线程数是否大于`corePoolSize`，如果大于的话就会回收工作线程。

另外，你也看到了上面并没有动态指定队列长度的方法，美团的方式是自定义了一个叫做 `ResizableCapacityLinkedBlockIngQueue` 的队列（主要就是把`LinkedBlockingQueue`的 capacity 字段的 final 关键字修饰给去掉了，让它变为可变的）。

最终实现的可动态修改线程池参数效果如下。👏👏👏

![动态配置线程池参数最终效果](https://oss.javaguide.cn/github/javaguide/java/concurrent/meituan-dynamically-configuring-thread-pool-parameters.png)

还没看够？我在[《后端面试高频系统设计&场景题》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html)中详细介绍了如何设计一个动态线程池，这也是面试中常问的一道系统设计题。

![《后端面试高频系统设计&场景题》](https://oss.javaguide.cn/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

如果我们的项目也想要实现这种效果的话，可以借助现成的开源项目：

- **[Hippo4j](https://github.com/opengoofy/hippo4j)**：异步线程池框架，支持线程池动态变更&监控&报警，无需修改代码轻松引入。支持多种使用模式，轻松引入，致力于提高系统运行保障能力。
- **[Dynamic TP](https://github.com/dromara/dynamic-tp)**：轻量级动态线程池，内置监控告警功能，集成三方中间件线程池管理，基于主流配置中心（已支持 Nacos、Apollo，Zookeeper、Consul、Etcd，可通过 SPI 自定义实现）。

### ⭐️如何设计一个能够根据任务的优先级来执行的线程池？

这是一个常见的面试问题，本质其实还是在考察求职者对于线程池以及阻塞队列的掌握。

我们上面也提到了，不同的线程池会选用不同的阻塞队列作为任务队列，比如`FixedThreadPool` 使用的是`LinkedBlockingQueue`（有界队列），默认构造器初始的队列长度为 `Integer.MAX_VALUE` ，由于队列永远不会被放满，因此`FixedThreadPool`最多只能创建核心线程数的线程。

假如我们需要实现一个优先级任务线程池的话，那可以考虑使用 `PriorityBlockingQueue` （优先级阻塞队列）作为任务队列（`ThreadPoolExecutor` 的构造函数有一个 `workQueue` 参数可以传入任务队列）。

![ThreadPoolExecutor构造函数](https://oss.javaguide.cn/github/javaguide/java/concurrent/common-parameters-of-threadpool-workqueue.jpg)

`PriorityBlockingQueue` 是一个支持优先级的无界阻塞队列，可以看作是线程安全的 `PriorityQueue`，两者底层都是使用小顶堆形式的二叉堆，即值最小的元素优先出队。不过，`PriorityQueue` 不支持阻塞操作。

要想让 `PriorityBlockingQueue` 实现对任务的排序，传入其中的任务必须是具备排序能力的，方式有两种：

1. 提交到线程池的任务实现 `Comparable` 接口，并重写 `compareTo` 方法来指定任务之间的优先级比较规则。
2. 创建 `PriorityBlockingQueue` 时传入一个 `Comparator` 对象来指定任务之间的排序规则(推荐)。

不过，这存在一些风险和问题，比如：

- `PriorityBlockingQueue` 是无界的，可能堆积大量的请求，从而导致 OOM。
- 可能会导致饥饿问题，即低优先级的任务长时间得不到执行。
- 由于需要对队列中的元素进行排序操作以及保证线程安全（并发控制采用的是可重入锁 `ReentrantLock`），因此会降低性能。

对于 OOM 这个问题的解决比较简单粗暴，就是继承`PriorityBlockingQueue` 并重写一下 `offer` 方法(入队)的逻辑，当插入的元素数量超过指定值就返回 false 。

饥饿问题这个可以通过优化设计来解决（比较麻烦），比如等待时间过长的任务会被移除并重新添加到队列中，但是优先级会被提升。

对于性能方面的影响，是没办法避免的，毕竟需要对任务进行排序操作。并且，对于大部分业务场景来说，这点性能影响是可以接受的。

## Future

重点是要掌握 `CompletableFuture` 的使用以及常见面试题。

除了下面的面试题之外，还推荐你看看我写的这篇文章： [CompletableFuture 详解](https://javaguide.cn/java/concurrent/completablefuture-intro.html)。

### Future 类有什么用？

`Future` 类是异步思想的典型运用，主要用在一些需要执行耗时任务的场景，避免程序一直原地等待耗时任务执行完成，执行效率太低。具体来说是这样的：当我们执行某一耗时的任务时，可以将这个耗时任务交给一个子线程去异步执行，同时我们可以干点其他事情，不用傻傻等待耗时任务执行完成。等我们的事情干完后，我们再通过 `Future` 类获取到耗时任务的执行结果。这样一来，程序的执行效率就明显提高了。

这其实就是多线程中经典的 **Future 模式**，你可以将其看作是一种设计模式，核心思想是异步调用，主要用在多线程领域，并非 Java 语言独有。

在 Java 中，`Future` 类只是一个泛型接口，位于 `java.util.concurrent` 包下，其中定义了 5 个方法，主要包括下面这 4 个功能：

- 取消任务；
- 判断任务是否被取消;
- 判断任务是否已经执行完成;
- 获取任务执行结果。

```java
// V 代表了Future执行的任务返回值的类型
public interface Future<V> {
    // 取消任务执行
    // 成功取消返回 true，否则返回 false
    boolean cancel(boolean mayInterruptIfRunning);
    // 判断任务是否被取消
    boolean isCancelled();
    // 判断任务是否已经执行完成
    boolean isDone();
    // 获取任务执行结果
    V get() throws InterruptedException, ExecutionException;
    // 指定时间内没有返回计算结果就抛出 TimeOutException 异常
    V get(long timeout, TimeUnit unit)

        throws InterruptedException, ExecutionException, TimeoutExceptio

}
```

简单理解就是：我有一个任务，提交给了 `Future` 来处理。任务执行期间我自己可以去做任何想做的事情。并且，在这期间我还可以取消任务以及获取任务的执行状态。一段时间之后，我就可以 `Future` 那里直接取出任务执行结果。

### Callable 和 Future 有什么关系？

我们可以通过 `FutureTask` 来理解 `Callable` 和 `Future` 之间的关系。

`FutureTask` 提供了 `Future` 接口的基本实现，常用来封装 `Callable` 和 `Runnable`，具有取消任务、查看任务是否执行完成以及获取任务执行结果的方法。`ExecutorService.submit()` 方法返回的其实就是 `Future` 的实现类 `FutureTask` 。

```java
<T> Future<T> submit(Callable<T> task);
Future<?> submit(Runnable task);
```

`FutureTask` not only implements the `Future` interface, but also implements the `Runnable` interface, so it can be directly executed by a thread as a task.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/completablefuture-class-diagram.jpg)

`FutureTask` has two constructors, which can pass in `Callable` or `Runnable` objects. In fact, passing in a `Runnable` object is also converted to a `Callable` object inside the method.

```java
public FutureTask(Callable<V> callable) {
    if (callable == null)
        throw new NullPointerException();
    this.callable = callable;
    this.state = NEW;
}
public FutureTask(Runnable runnable, V result) {
    // Convert the Runnable object runnable into a Callable object through the adapter RunnableAdapter
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;
}
```

`FutureTask` is equivalent to encapsulating `Callable`, managing the task execution, and storing the task execution results of `Callable`'s `call` method.

For more source code details of `Future`, you can read this 10,000-word analysis, which is very clear: [How does Java implement the Future pattern? Detailed explanation of 10,000 words! ](https://juejin.cn/post/6844904199625375757).

### What is the use of the CompletableFuture class?

`Future` has some limitations in actual use. For example, it does not support the orchestration and combination of asynchronous tasks, and the `get()` method to obtain calculation results is a blocking call.

The `CompletableFuture` class was introduced in Java 8 to solve these shortcomings of `Future`. In addition to providing more easy-to-use and powerful `Future` features, `CompletableFuture` also provides functional programming, asynchronous task orchestration and combination (multiple asynchronous tasks can be connected in series to form a complete chain call) and other capabilities.

Let's take a brief look at the definition of the `CompletableFuture` class.

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
}
```

As you can see, `CompletableFuture` implements both the `Future` and `CompletionStage` interfaces.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/completablefuture-class-diagram.jpg)

The `CompletionStage` interface describes an asynchronous computation stage. Many calculations can be divided into multiple stages or steps. At this time, it can be used to combine all steps to form an asynchronous calculation pipeline.

There are many methods in the `CompletionStage` interface, and the functional capabilities of `CompletableFuture` are given by this interface. From the method parameters of this interface, you can find that it makes extensive use of functional programming introduced in Java8.

![](https://oss.javaguide.cn/javaguide/image-20210902093026059.png)

### ⭐️A task needs to depend on two other tasks before it is executed. How to design it?

This task orchestration scenario is very suitable to be implemented through `CompletableFuture`. It is assumed here that T3 is executed after T2 and T1 are executed.

The code is as follows (in order to simplify the code, Hutool’s thread tool class `ThreadUtil` and date and time tool class `DateUtil` are used):

```java
// T1
CompletableFuture<Void> futureT1 = CompletableFuture.runAsync(() -> {
    System.out.println("T1 is executing. Current time: " + DateUtil.now());
    // Simulate time-consuming operations
    ThreadUtil.sleep(1000);
});
//T2
CompletableFuture<Void> futureT2 = CompletableFuture.runAsync(() -> {
    System.out.println("T2 is executing. Current time: " + DateUtil.now());
    ThreadUtil.sleep(1000);
});

// Use the allOf() method to merge the CompletableFutures of T1 and T2 and wait for them to complete
CompletableFuture<Void> bothCompleted = CompletableFuture.allOf(futureT1, futureT2);
//When both T1 and T2 are completed, execute T3
bothCompleted.thenRunAsync(() -> System.out.println("T3 is executing after T1 and T2 have completed.Current time: " + DateUtil.now()));
// Wait for all tasks to be completed and verify the effect
ThreadUtil.sleep(3000);
```

Run T1 and T2 in parallel through the `allOf()` static method of `CompletableFuture`. When both T1 and T2 are completed, execute T3.

### ⭐️Using CompletableFuture, a task fails, how to handle the exception?

When using `CompletableFuture`, exceptions must be handled in the correct way to avoid exceptions being lost or uncontrollable problems.

Here are some suggestions:

- Use the `whenComplete` method to trigger the callback function when the task is completed and handle the exception correctly instead of letting the exception be swallowed or lost.
- Use the `exceptionally` method to handle exceptions and rethrow them so that they propagate to subsequent stages rather than having them ignored or terminated.
- Use the `handle` method to handle normal return results and exceptions, and return a new result instead of letting exceptions affect normal business logic.
- Use the `CompletableFuture.allOf` method to combine multiple `CompletableFuture` and handle exceptions for all tasks uniformly, instead of making exception handling too lengthy or repetitive.
-…

### ⭐️Why do you need to customize the thread pool when using CompletableFuture?

`CompletableFuture` uses the globally shared `ForkJoinPool.commonPool()` as the executor by default, and all asynchronous tasks that do not specify an executor will use this thread pool. This means that if an application, multiple libraries or frameworks (such as Spring, third-party libraries) all depend on `CompletableFuture`, they will all share the same thread pool by default.

Although `ForkJoinPool` is very efficient, when a large number of tasks are submitted at the same time, it may cause resource contention and thread starvation, thereby affecting system performance.

To avoid these problems, it is recommended to provide a custom thread pool for `CompletableFuture`, which brings the following advantages:

-Isolation: Allocate independent thread pools to different tasks to avoid global thread pool resource contention.
- Resource control: Adjust thread pool size and queue type according to task characteristics to optimize performance.
- Exception handling: Better handle exceptions in threads by customizing `ThreadFactory`.

```java
private ThreadPoolExecutor executor = new ThreadPoolExecutor(10, 10,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>());

CompletableFuture.runAsync(() -> {
     //...
}, executor);
```

## AQS

For a detailed analysis of the AQS source code, you can read this article: [AQS Detailed Explanation](https://javaguide.cn/java/concurrent/aqs.html).

### What is AQS?

AQS (`AbstractQueuedSynchronizer`, abstract queue synchronizer) is a Java concurrency core component provided starting from JDK1.5.

AQS solves the complexity problem for developers when implementing synchronizers. It provides a general framework for implementing various synchronizers, such as ReentrantLock, Semaphore and CountDownLatch. By encapsulating the underlying thread synchronization mechanism, AQS hides complex thread management logic, allowing developers to only focus on specific synchronization logic.简单来说，AQS 是一个抽象类，为同步器提供了通用的 **执行框架**。它定义了 **资源获取和释放的通用流程**，而具体的资源获取逻辑则由具体同步器通过重写模板方法来实现。 因此，可以将 AQS 看作是同步器的 **基础“底座”**，而同步器则是基于 AQS 实现的 **具体“应用”**。

### ⭐️AQS 的原理是什么？

AQS 核心思想是，如果被请求的共享资源空闲，则将当前请求资源的线程设置为有效的工作线程，并且将共享资源设置为锁定状态。如果被请求的共享资源被占用，那么就需要一套线程阻塞等待以及被唤醒时锁分配的机制，这个机制 AQS 是基于 **CLH 锁** （Craig, Landin, and Hagersten locks） 进一步优化实现的。

**CLH 锁** 对自旋锁进行了改进，是基于单链表的自旋锁。在多线程场景下，会将请求获取锁的线程组织成一个单向队列，每个等待的线程会通过自旋访问前一个线程节点的状态，前一个节点释放锁之后，当前节点才可以获取锁。**CLH 锁** 的队列结构如下图所示。

![CLH 锁的队列结构](https://oss.javaguide.cn/github/javaguide/open-source-project/clh-lock-queue-structure.png)

AQS 中使用的 **等待队列** 是 CLH 锁队列的变体（接下来简称为 CLH 变体队列）。

AQS 的 CLH 变体队列是一个双向队列，会暂时获取不到锁的线程将被加入到该队列中，CLH 变体队列和原本的 CLH 锁队列的区别主要有两点：

- 由 **自旋** 优化为 **自旋 + 阻塞** ：自旋操作的性能很高，但大量的自旋操作比较占用 CPU 资源，因此在 CLH 变体队列中会先通过自旋尝试获取锁，如果失败再进行阻塞等待。
- 由 **单向队列** 优化为 **双向队列** ：在 CLH 变体队列中，会对等待的线程进行阻塞操作，当队列前边的线程释放锁之后，需要对后边的线程进行唤醒，因此增加了 `next` 指针，成为了双向队列。

AQS 将每条请求共享资源的线程封装成一个 CLH 变体队列的一个结点（Node）来实现锁的分配。在 CLH 变体队列中，一个节点表示一个线程，它保存着线程的引用（thread）、 当前节点在队列中的状态（waitStatus）、前驱节点（prev）、后继节点（next）。

AQS 中的 CLH 变体队列结构如下图所示：

![CLH 变体队列结构](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-bianti.png)

AQS(`AbstractQueuedSynchronizer`)的核心原理图：

![CLH 变体队列](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-state.png)

AQS 使用 **int 成员变量 `state` 表示同步状态**，通过内置的 **线程等待队列** 来完成获取资源线程的排队工作。

`state` 变量由 `volatile` 修饰，用于展示当前临界资源的获锁情况。

```java
// 共享变量，使用volatile修饰保证线程可见性
private volatile int state;
```

另外，状态信息 `state` 可以通过 `protected` 类型的`getState()`、`setState()`和`compareAndSetState()` 进行操作。并且，这几个方法都是 `final` 修饰的，在子类中无法被重写。

```java
//返回同步状态的当前值
protected final int getState() {
     return state;
}
 // 设置同步状态的值
protected final void setState(int newState) {
     state = newState;
}
//原子地（CAS操作）将同步状态值设置为给定值update如果当前同步状态的值等于expect（期望值）
protected final boolean compareAndSetState(int expect, int update) {
      return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

以 `ReentrantLock` 为例，`state` 初始值为 0，表示未锁定状态。A 线程 `lock()` 时，会调用 `tryAcquire()` 独占该锁并将 `state+1` 。此后，其他线程再 `tryAcquire()` 时就会失败，直到 A 线程 `unlock()` 到 `state=`0（即释放锁）为止，其它线程才有机会获取该锁。当然，释放锁之前，A 线程自己是可以重复获取此锁的（`state` 会累加），这就是可重入的概念。但要注意，获取多少次就要释放多少次，这样才能保证 state 是能回到零态的。

再以 `CountDownLatch` 以例，任务分为 N 个子线程去执行，`state` 也初始化为 N（注意 N 要与线程个数一致）。这 N 个子线程是并行执行的，每个子线程执行完后`countDown()` 一次，state 会 CAS(Compare and Swap) 减 1。等到所有子线程都执行完后(即 `state=0` )，会 `unpark()` 主调用线程，然后主调用线程就会从 `await()` 函数返回，继续后续动作。

### Semaphore 有什么用？

`synchronized` 和 `ReentrantLock` 都是一次只允许一个线程访问某个资源，而`Semaphore`(信号量)可以用来控制同时访问特定资源的线程数量。

Semaphore 的使用简单，我们这里假设有 N(N>5) 个线程来获取 `Semaphore` 中的共享资源，下面的代码表示同一时刻 N 个线程中只有 5 个线程能获取到共享资源，其他线程都会阻塞，只有获取到共享资源的线程才能执行。等到有线程释放了共享资源，其他阻塞的线程才能获取到。

```java
// 初始共享资源数量
final Semaphore semaphore = new Semaphore(5);
// 获取1个许可
semaphore.acquire();
// 释放1个许可
semaphore.release();
```

当初始的资源个数为 1 的时候，`Semaphore` 退化为排他锁。

`Semaphore` 有两种模式：。

- **公平模式：** 调用 `acquire()` 方法的顺序就是获取许可证的顺序，遵循 FIFO；
- **非公平模式：** 抢占式的。

`Semaphore` 对应的两个构造方法如下：

```java
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

**这两个构造方法，都必须提供许可的数量，第二个构造方法可以指定是公平模式还是非公平模式，默认非公平模式。**

`Semaphore` 通常用于那些资源有明确访问数量限制的场景比如限流（仅限于单机模式，实际项目中推荐使用 Redis +Lua 来做限流）。

### Semaphore 的原理是什么？

`Semaphore` 是共享锁的一种实现，它默认构造 AQS 的 `state` 值为 `permits`，你可以将 `permits` 的值理解为许可证的数量，只有拿到许可证的线程才能执行。

调用`semaphore.acquire()` ，线程尝试获取许可证，如果 `state >= 0` 的话，则表示可以获取成功。如果获取成功的话，使用 CAS 操作去修改 `state` 的值 `state=state-1`。如果 `state<0` 的话，则表示许可证数量不足。此时会创建一个 Node 节点加入阻塞队列，挂起当前线程。

```java
/**
 *  获取1个许可证
 */
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
/**
 * 共享模式下获取许可证，获取成功则返回，失败则加入阻塞队列，挂起线程
 */
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // 尝试获取许可证，arg为获取许可证个数，当可用许可证数减当前获取的许可证数结果小于0,则创建一个节点加入阻塞队列，挂起当前线程。
    if (tryAcquireShared(arg) < 0)
      doAcquireSharedInterruptibly(arg);
}
```

Calling `semaphore.release();`, the thread attempts to release the license and uses the CAS operation to modify the value of `state` to `state=state+1`. After the license is released successfully, a thread in the synchronization queue will be awakened at the same time. The awakened thread will retry to modify the value of `state` to `state=state-1`. If `state>=0`, the token is obtained successfully, otherwise it will re-enter the blocking queue and suspend the thread.

```java
// Release a license
public void release() {
    sync.releaseShared(1);
}

// Release the shared lock and wake up a thread in the synchronization queue.
public final boolean releaseShared(int arg) {
    //Release shared lock
    if (tryReleaseShared(arg)) {
      //Wake up a thread in the synchronization queue
      doReleaseShared();
      return true;
    }
    return false;
}
```

### What is the use of CountDownLatch?

`CountDownLatch` allows `count` threads to block in one place until all threads' tasks are completed.

`CountDownLatch` is one-time use. The value of the counter can only be initialized once in the constructor. There is no mechanism to set its value again afterwards. When `CountDownLatch` is used, it cannot be used again.

### What is the principle of CountDownLatch?

`CountDownLatch` is an implementation of shared locks. It constructs the `state` value of AQS by default as `count`. When the thread uses the `countDown()` method, it actually uses the `tryReleaseShared` method to reduce `state` with CAS operations until `state` is 0. When calling the `await()` method, if `state` is not 0, it proves that the task has not been completed, and the `await()` method will always block, which means that the statements after the `await()` method will not be executed. Until `count` threads call `countDown()` so that the state value is reduced to 0, or the thread calling `await()` is interrupted, the thread will be awakened from blocking, and the statements after the `await()` method will be executed.

### Have you ever used CountDownLatch? In what scenario is it used?

The function of `CountDownLatch` is to allow count threads to block in one place until all threads' tasks are completed. In the previous project, there was a scenario where multi-threading was used to read and process multiple files. I used `CountDownLatch`. The specific scenario is as follows:

We need to read and process 6 files. These 6 tasks are all tasks that have no execution order dependency, but we need to statistically organize the results of processing these files when returning them to the user.

For this we define a thread pool and a `CountDownLatch` object with a count of 6. Use the thread pool to handle the reading task. After each thread is processed, it will count-1 and call the `await()` method of the `CountDownLatch` object. The subsequent logic will not be executed until all files have been read.

The pseudocode is as follows:

```java
public class CountDownLatchExample1 {
    //Number of files to process
    private static final int threadCount = 6;

    public static void main(String[] args) throws InterruptedException {
        // Create a thread pool object with a fixed number of threads (it is recommended to use the constructor method to create it)
        ExecutorService threadPool = Executors.newFixedThreadPool(10);
        final CountDownLatch countDownLatch = new CountDownLatch(threadCount);
        for (int i = 0; i < threadCount; i++) {
            final int threadnum = i;
            threadPool.execute(() -> {
                try {
                    //Business operations for processing files
                    //......
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    //Indicates that a file has been completed
                    countDownLatch.countDown();
                }

            });
        }
        countDownLatch.await();
        threadPool.shutdown();
        System.out.println("finish");
    }
}
```

**Is there anything that can be improved? **

This can be improved using the `CompletableFuture` class! Java8's `CompletableFuture` provides many multi-thread-friendly methods. It can be used to easily write multi-threaded programs for us. It is very convenient to be asynchronous, serial, parallel or wait for all threads to finish executing tasks.

```java
CompletableFuture<Void> task1 =
    CompletableFuture.supplyAsync(()->{
        //Customized business operations
    });
...
CompletableFuture<Void> task6 =
    CompletableFuture.supplyAsync(()->{
    //Customized business operations
    });
...
CompletableFuture<Void> headerFuture=CompletableFuture.allOf(task1,....,task6);

try {
    headerFuture.join();
} catch (Exception ex) {
    //......
}
System.out.println("all done. ");
```

The above code can continue to be optimized. When there are too many tasks, it is not practical to list every task. You can consider adding tasks through a loop.

```java
//Folder location
List<String> filePaths = Arrays.asList(...)
// Process all files asynchronously
List<CompletableFuture<String>> fileFutures = filePaths.stream()
    .map(filePath -> doSomeThing(filePath))
    .collect(Collectors.toList());
// merge them
CompletableFuture<Void> allFutures = CompletableFuture.allOf(
    fileFutures.toArray(new CompletableFuture[fileFutures.size()])
);
```

### What is the use of CyclicBarrier?

`CyclicBarrier` is very similar to `CountDownLatch`. It can also implement technical waiting between threads, but its function is more complex and powerful than `CountDownLatch`. The main application scenarios are similar to `CountDownLatch`.

> The implementation of `CountDownLatch` is based on AQS, while `CyclicBarrier` is based on `ReentrantLock` (`ReentrantLock` also belongs to the AQS synchronizer) and `Condition`.

`CyclicBarrier` literally means cyclic barrier. What it does is: let a group of threads be blocked when they reach a barrier (also called a synchronization point). The barrier will not open until the last thread reaches the barrier, and all threads intercepted by the barrier will continue to work.

### What is the principle of CyclicBarrier?

`CyclicBarrier` internally uses a `count` variable as a counter. The initial value of `count` is the initialization value of the `parties` attribute. Whenever a thread reaches the barrier, the counter is decremented by 1. If the count value is 0, it means that this is the last thread of this generation to reach the fence, and it will try to execute the task entered in our constructor.

```java
//The number of threads intercepted each time
private final int parties;
//Counter
private int count;
```

Let’s take a brief look at the source code below.1. The default constructor of `CyclicBarrier` is `CyclicBarrier(int parties)`, whose parameters represent the number of threads intercepted by the barrier. Each thread calls the `await()` method to tell `CyclicBarrier` that I have reached the barrier, and then the current thread is blocked.

```java
public CyclicBarrier(int parties) {
    this(parties, null);
}

public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    this.parties = parties;
    this.count = parties;
    this.barrierCommand = barrierAction;
}
```

Among them, `parties` represents the number of intercepted threads. When the number of intercepted threads reaches this value, the fence will be opened to allow all threads to pass.

2. When calling the `await()` method of the `CyclicBarrier` object, the `dowait(false, 0L)` method is actually called. The `await()` method acts like erecting a fence, blocking threads. When the number of blocked threads reaches the value of `parties`, the fence will open and the threads can pass for execution.

```java
public int await() throws InterruptedException, BrokenBarrierException {
  try {
      return dowait(false, 0L);
  } catch (TimeoutException toe) {
      throw new Error(toe); // cannot happen
  }
}
```

The source code analysis of `dowait(false, 0L)` method is as follows:

```java
    // When the number of threads or the number of requests reaches count, the method after await will be executed. In the above example, the value of count is 5.
    private int count;
    /**
     * Main barrier code, covering the various policies.
     */
    private int dowait(boolean timed, long nanos)
        throws InterruptedException, BrokenBarrierException,
               TimeoutException {
        final ReentrantLock lock = this.lock;
        // lock
        lock.lock();
        try {
            final Generation g = generation;

            if (g.broken)
                throw new BrokenBarrierException();

            //If the thread is interrupted, throw an exception
            if (Thread.interrupted()) {
                breakBarrier();
                throw new InterruptedException();
            }
            // cout decreases by 1
            int index = --count;
            // When the count is reduced to 0, it means that the last thread has reached the fence, that is, it has reached the condition after which the await method can be executed.
            if (index == 0) { // tripped
                boolean ranAction = false;
                try {
                    final Runnable command = barrierCommand;
                    if (command != null)
                        command.run();
                    ranAction = true;
                    //Reset count to the initialization value of the parties property
                    // Wake up the previously waiting thread
                    //The next wave of execution begins
                    nextGeneration();
                    return 0;
                } finally {
                    if (!ranAction)
                        breakBarrier();
                }
            }

            // loop until tripped, broken, interrupted, or timed out
            for (;;) {
                try {
                    if (!timed)
                        trip.await();
                    else if (nanos > 0L)
                        nanos = trip.awaitNanos(nanos);
                } catch (InterruptedException ie) {
                    if (g == generation && ! g.broken) {
                        breakBarrier();
                        throw ie;
                    } else {
                        // We're about to finish waiting even if we had not
                        // been interrupted, so this interrupt is deemed to
                        // "belong" to subsequent execution.
                        Thread.currentThread().interrupt();
                    }
                }

                if (g.broken)
                    throw new BrokenBarrierException();

                if (g != generation)
                    return index;

                if (timed && nanos <= 0L) {
                    breakBarrier();
                    throw new TimeoutException();
                }
            }
        } finally {
            lock.unlock();
        }
    }
```

## Virtual thread

Virtual threads were officially released in Java 21, which is a major update. Although there are not many questions asked in interviews at present, it is still recommended that everyone take a brief look. I wrote an article to summarize common problems with virtual threads: [Summary of common problems with virtual threads](https://javaguide.cn/java/concurrent/virtual-thread.html), including the following questions:

1. What is a virtual thread?
2. What is the relationship between virtual threads and platform threads?
3. What are the advantages and disadvantages of virtual threads?
4. How to create a virtual thread?
5. What is the underlying principle of virtual threads?

## Reference

- "In-depth Understanding of Java Virtual Machine"
- "Practical Java High Concurrency Programming"
- The implementation principle of Java thread pool and its best practices in business: Alibaba Cloud Developer: <https://mp.weixin.qq.com/s/icrrxEsbABBvEU0Gym7D5Q>
- Let you know about SynchronousQueue (concurrent queue topic): <https://juejin.cn/post/7031196740128768037>- Blocking queue — DelayedWorkQueue source code analysis: <https://zhuanlan.zhihu.com/p/310621485>
- Java multi-threading (3) - FutureTask/CompletableFuture: <https://www.cnblogs.com/iwehdio/p/14285282.html>
- Detailed explanation of Java concurrency AQS: <https://www.cnblogs.com/waterystone/p/4920797.html>
- Cornerstone of Java concurrency package-AQS detailed explanation: <https://www.cnblogs.com/chengxiao/archive/2017/07/24/7141160.html>

<!-- @include: @article-footer.snippet.md -->