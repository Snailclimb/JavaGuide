---
title: DelayQueue source code analysis
category: Java
tag:
  - Java collections
head:
  - - meta
    - name: keywords
      content: DelayQueue, delay queue, Delayed, getDelay, task scheduling, PriorityQueue, unbounded queue, ReentrantLock, Condition
  - - meta
    - name: description
      content: Introduces the principle and common scenarios of DelayQueue's delayed task queue. Use cases include delayed execution and expired deletion, and analyzes the thread safety implementation based on PriorityQueue.
---

## DelayQueue Introduction

`DelayQueue` is a delay queue provided by the JUC package (`java.util.concurrent)`, which is used to implement delayed tasks such as direct cancellation of orders without payment within 15 minutes. It is a type of `BlockingQueue`. The bottom layer is an unbounded queue implemented based on `PriorityQueue`, which is thread-safe. Regarding `PriorityQueue`, you can refer to this article written by the author: [PriorityQueue source code analysis](./priorityqueue-source-code.md).

![Implementation class of BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

The elements stored in `DelayQueue` must implement the `Delayed` interface, and the `getDelay()` method needs to be overridden (to calculate whether it expires).

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);
}
```

By default, `DelayQueue` arranges tasks in ascending order of expiration time. Only when the element expires (the return value of the `getDelay()` method is less than or equal to 0) can it be removed from the queue.

## DelayQueue Development History

- `DelayQueue` was first introduced in Java 5 as part of the `java.util.concurrent` package to support scenarios such as time-based task scheduling and cache expiration deletion. This version only supports the implementation of delay functions and has not yet solved thread safety issues.
- In Java 6, the implementation of `DelayQueue` has been optimized to improve its performance and reliability by using `ReentrantLock` and `Condition` to solve thread safety and the efficiency of interaction between threads.
- In Java 7, the implementation of `DelayQueue` has been further optimized to improve its concurrent operation performance by using CAS operations to add and remove elements.
- In Java 8, the implementation of `DelayQueue` has not undergone major changes, but new time classes such as `Duration` and `Instant` have been introduced in the `java.time` package, making time-based scheduling using `DelayQueue` more convenient and flexible.
- In Java 9, the implementation of `DelayQueue` has undergone some minor improvements, mainly optimizing and streamlining the code.

In general, the development history of `DelayQueue` is mainly by optimizing its implementation and improving its performance and reliability, making it more suitable for scenarios such as time-based scheduling and cache expiration deletion.

## DelayQueue common usage scenario examples

Here we hope that the tasks can be executed according to our expected time. For example, if we submit three tasks and require them to be executed in 1s, 2s, and 3s respectively, even if they are added out of order, the tasks that require 1s to be executed after 1s will be executed on time.

![Delayed task](https://oss.javaguide.cn/github/javaguide/java/collection/delayed-task.png)

We can use `DelayQueue` to achieve this, so we first need to inherit `Delayed` to implement `DelayedTask`, implement the `getDelay` method and priority comparison `compareTo`.

```java
/**
 * Delay tasks
 */
public class DelayedTask implements Delayed {
    /**
     * Task expiration time
     */
    private long executeTime;
    /**
     * Task
     */
    private Runnable task;

    public DelayedTask(long delay, Runnable task) {
        this.executeTime = System.currentTimeMillis() + delay;
        this.task = task;
    }

    /**
     * Check how long the current task is due
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * The delay queue needs to be queued in ascending order by expiration time, so we need to implement compareTo to compare expiration times.
     * @param o
     * @return
     */
    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }

    public void execute() {
        task.run();
    }
}
```

After completing the encapsulation of the task, it is very simple to use. Just set the expiration time and then submit the task to the delay queue.

```java
//Create a delay queue and add tasks
DelayQueue < DelayedTask > delayQueue = new DelayQueue < > ();

//Add tasks due in 1s, 2s, and 3s respectively
delayQueue.add(new DelayedTask(2000, () -> System.out.println("Task 2")));
delayQueue.add(new DelayedTask(1000, () -> System.out.println("Task 1")));
delayQueue.add(new DelayedTask(3000, () -> System.out.println("Task 3")));

// Take out the task and execute it
while (!delayQueue.isEmpty()) {
  //Block to get the first due task
  DelayedTask task = delayQueue.take();
  if (task != null) {
    task.execute();
  }
}
```

It can be seen from the output that even if the author mentions the task due in 2s first, the task due in 1s, Task1, will still be executed first.

```java
Task 1
Task 2
Task 3
```

## DelayQueue source code analysis

Here we take JDK1.8 as an example to analyze the underlying core source code of `DelayQueue`.

The class definition of `DelayQueue` is as follows:

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E> implements BlockingQueue<E>
{
  //...
}
```

`DelayQueue` inherits the `AbstractQueue` class and implements the `BlockingQueue` interface.

![DelayQueue class diagram](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-class-diagram.png)

### Core member variables

The four core member variables of `DelayQueue` are as follows:

```java
//Reentrant lock, the key to achieving thread safety
private final transient ReentrantLock lock = new ReentrantLock();
//The collection of data stored at the bottom of the delay queue ensures that the elements are arranged in ascending order according to the expiration time
private final PriorityQueue<E> q = new PriorityQueue<E>();

//Point to the thread with the highest execution priority
private Thread leader = null;
//Implement the interaction between multiple threads waiting to wake up
private final Condition available = lock.newCondition();
```- `lock` : 我们都知道 `DelayQueue` 存取是线程安全的，所以为了保证存取元素时线程安全，我们就需要在存取时上锁，而 `DelayQueue` 就是基于 `ReentrantLock` 独占锁确保存取操作的线程安全。
- `q` : 延迟队列要求元素按照到期时间进行升序排列，所以元素添加时势必需要进行优先级排序,所以 `DelayQueue` 底层元素的存取都是通过这个优先队列 `PriorityQueue` 的成员变量 `q` 来管理的。
- `leader` : 延迟队列的任务只有到期之后才会执行,对于没有到期的任务只有等待,为了确保优先级最高的任务到期后可以即刻被执行,设计者就用 `leader` 来管理延迟任务，只有 `leader` 所指向的线程才具备定时等待任务到期执行的权限，而其他那些优先级低的任务只能无限期等待，直到 `leader` 线程执行完手头的延迟任务后唤醒它。
- `available` : 上文讲述 `leader` 线程时提到的等待唤醒操作的交互就是通过 `available` 实现的，假如线程 1 尝试在空的 `DelayQueue` 获取任务时，`available` 就会将其放入等待队列中。直到有一个线程添加一个延迟任务后通过 `available` 的 `signal` 方法将其唤醒。

### 构造方法

相较于其他的并发容器，延迟队列的构造方法比较简单，它只有两个构造方法，因为所有成员变量在类加载时都已经初始完成了，所以默认构造方法什么也没做。还有一个传入 `Collection` 对象的构造方法，它会将调用 `addAll()`方法将集合元素存到优先队列 `q` 中。

```java
public DelayQueue() {}

public DelayQueue(Collection<? extends E> c) {
    this.addAll(c);
}
```

### 添加元素

`DelayQueue` 添加元素的方法无论是 `add`、`put` 还是 `offer`,本质上就是调用一下 `offer` ,所以了解延迟队列的添加逻辑我们只需阅读 offer 方法即可。

`offer` 方法的整体逻辑为:

1. 尝试获取 `lock` 。
2. 如果上锁成功,则调 `q` 的 `offer` 方法将元素存放到优先队列中。
3. 调用 `peek` 方法看看当前队首元素是否就是本次入队的元素,如果是则说明当前这个元素是即将到期的任务(即优先级最高的元素)，于是将 `leader` 设置为空,通知因为队列为空时调用 `take` 等方法导致阻塞的线程来争抢元素。
4. 上述步骤执行完成，释放 `lock`。
5. 返回 true。

源码如下，笔者已详细注释，读者可自行参阅:

```java
public boolean offer(E e) {
    //尝试获取lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        //如果上锁成功,则调q的offer方法将元素存放到优先队列中
        q.offer(e);
        //调用peek方法看看当前队首元素是否就是本次入队的元素,如果是则说明当前这个元素是即将到期的任务(即优先级最高的元素)
        if (q.peek() == e) {
            //将leader设置为空,通知调用取元素方法而阻塞的线程来争抢这个任务
            leader = null;
            available.signal();
        }
        return true;
    } finally {
        //上述步骤执行完成，释放lock
        lock.unlock();
    }
}
```

### 获取元素

`DelayQueue` 中获取元素的方式分为阻塞式和非阻塞式，先来看看逻辑比较复杂的阻塞式获取元素方法 `take`,为了让读者可以更直观的了解阻塞式获取元素的全流程，笔者将以 3 个线程并发获取元素为例讲述 `take` 的工作流程。

> 想要理解下面的内容，需要用到 AQS 相关的知识，推荐阅读下面这两篇文章：
>
> - [图文讲解 AQS ，一起看看 AQS 的源码……(图文较长)](https://xie.infoq.cn/article/5a3cc0b709012d40cb9f41986)
> - [AQS 都看完了，Condition 原理可不能少！](https://xie.infoq.cn/article/0223d5e5f19726b36b084b10d)

1、首先， 3 个线程会尝试获取可重入锁 `lock`,假设我们现在有 3 个线程分别是 t1、t2、t3,随后 t1 得到了锁，而 t2、t3 没有抢到锁，故将这两个线程存入等待队列中。

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-0.png)

2、紧接着 t1 开始进行元素获取的逻辑。

3、线程 t1 首先会查看 `DelayQueue` 队列首元素是否为空。

4、如果元素为空，则说明当前队列没有任何元素，故 t1 就会被阻塞存到 `conditionWaiter` 这个队列中。

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-1.png)

注意，调用 `await` 之后 t1 就会释放 `lcok` 锁，假如 `DelayQueue` 持续为空，那么 t2、t3 也会像 t1 一样执行相同的逻辑并进入 `conditionWaiter` 队列中。

![](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-take-2.png)

如果元素不为空，则判断当前任务是否到期，如果元素到期，则直接返回出去。如果元素未到期，则判断当前 `leader` 线程(`DelayQueue` 中唯一一个可以等待并获取元素的线程引用)是否为空，若不为空，则说明当前 `leader` 正在等待执行一个优先级比当前元素还高的元素到期，故当前线程 t1 只能调用 `await` 进入无限期等待，等到 `leader` 取得元素后唤醒。反之，若 `leader` 线程为空，则将当前线程设置为 leader 并进入有限期等待,到期后取出元素并返回。

自此我们阻塞式获取元素的逻辑都已完成后,源码如下，读者可自行参阅:

```java
public E take() throws InterruptedException {
    // 尝试获取可重入锁,将底层AQS的state设置为1,并设置为独占锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            //查看队列第一个元素
            E first = q.peek();
            //若为空,则将当前线程放入ConditionObject的等待队列中，并将底层AQS的state设置为0，表示释放锁并进入无限期等待
            if (first == null)
                available.await();
            else {
                //若元素不为空，则查看当前元素多久到期
                long delay = first.getDelay(NANOSECONDS);
                //如果小于0则说明已到期直接返回出去
                if (delay <= 0)
                    return q.poll();
                //如果大于0则说明任务还没到期，首先需要释放对这个元素的引用
                first = null; // don't retain ref while waiting
                //判断leader是否为空，如果不为空，则说明正有线程作为leader并等待一个任务到期，则当前线程进入无限期等待
                if (leader != null)
                    available.await();
                else {
                    //反之将我们的线程成为leader
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        //并进入有限期等待
                        available.awaitNanos(delay);
                    } finally {
                        //等待任务到期时，释放leader引用，进入下一次循环将任务return出去
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 收尾逻辑:当leader为null，并且队列中有任务时，唤醒等待的获取元素的线程。
        if (leader == null && q.peek() != null)
            available.signal();
        //释放锁
        lock.unlock();
    }
}
```

Let’s take a look at the non-blocking element acquisition method `poll`. The logic is relatively simple. The overall steps are as follows:

1. Try to acquire a reentrant lock.
2. Check the first element of the queue to determine whether the element is empty.
3. If the element is empty or the element has not expired, empty will be returned directly.
4. If the element is not empty and has expired, call `poll` directly to return.
5. Release the reentrant lock `lock`.

The source code is as follows, readers can refer to the source code and comments by themselves:

```java
public E poll() {
    //Try to acquire a reentrant lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        //View the first element of the queue to determine whether the element is empty
        E first = q.peek();

        //If the element is empty or the element has not expired, return empty directly.
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            //If the element is not empty and has expired, call poll directly to return it.
            return q.poll();
    } finally {
        //Release the reentrant lock
        lock.unlock();
    }
}
```

### View elements

The `peek` method will be called when acquiring elements above. As the name suggests, peek only peeks at the elements in the queue. Its steps are 4 steps:

1. Lock up.
2. Call the peek method of priority queue q to view the element at index 0.
3. Release the lock.
4. Return the element.

```java
public E peek() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        return q.peek();
    } finally {
        lock.unlock();
    }
}
```

## DelayQueue Common Interview Questions

### What is the implementation principle of DelayQueue?

The bottom layer of `DelayQueue` uses the priority queue `PriorityQueue` to store elements, and `PriorityQueue` uses the idea of ​​​​a binary small top heap to ensure that elements with small values ​​are ranked first, which makes `DelayQueue` very convenient for managing the priority of delayed tasks. At the same time, `DelayQueue` also uses a reentrant lock `ReentrantLock` to ensure thread safety, ensuring that only one thread can operate the delay queue per unit time. Finally, in order to achieve the interactive efficiency of waiting and waking up between multiple threads, `DelayQueue` also uses `Condition` to complete the waiting and waking up between multiple threads through the `await` and `signal` methods of `Condition`.

### Is the implementation of DelayQueue thread-safe?

The implementation of `DelayQueue` is thread-safe. It implements mutually exclusive access through `ReentrantLock` and `Condition` to implement waiting and wake-up operations between threads, which can ensure security and reliability in a multi-threaded environment.

### What are the usage scenarios of DelayQueue?

`DelayQueue` is usually used to implement scenarios such as scheduled task scheduling and cache expiration deletion. In scheduled task scheduling, the tasks that need to be executed need to be encapsulated into delayed task objects and added to `DelayQueue`. `DelayQueue` will automatically sort in ascending order according to the remaining delay time (default) to ensure that tasks can be executed in time order. For the cache expiration scenario, after the data is cached in the memory, we can encapsulate the cached key into a delayed deletion task and add it to the `DelayQueue`. When the data expires, we get the key of the task and remove the key from the memory.

### What is the role of the Delayed interface in DelayQueue?

The `Delayed` interface defines the remaining delay time of the element (`getDelay`) and the comparison rules between elements (this interface inherits the `Comparable` interface). If you want elements to be stored in `DelayQueue`, you must implement the `getDelay()` method and `compareTo()` method of the `Delayed` interface, otherwise `DelayQueue` cannot know the comparison between the remaining duration of the current task and the task priority.

### What is the difference between DelayQueue and Timer/TimerTask?

Both `DelayQueue` and `Timer/TimerTask` can be used to implement scheduled task scheduling, but their implementation methods are different. `DelayQueue` is implemented based on the priority queue and heap sorting algorithm, which can realize the execution of multiple tasks in time order; while `Timer/TimerTask` is based on a single thread and can only be executed in the order of execution of tasks. If the execution time of a task is too long, it will affect the execution of other tasks. In addition, `DelayQueue` also supports dynamic addition and removal of tasks, while `Timer/TimerTask` can only specify tasks when creating.

## References

- "In-depth understanding of high-concurrency programming: JDK core technology":
- Tell the implementation methods of Java's 6 delay queues in one breath (the interviewer must also be convinced): <https://www.jb51.net/article/186192.htm>
- Illustration of DelayQueue source code (java 8) - Xiaojiujiu of delay queue: <https://blog.csdn.net/every__day/article/details/113810985>
<!-- @include: @article-footer.snippet.md -->