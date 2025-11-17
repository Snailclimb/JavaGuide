---
title: DelayQueue 源码分析
category: Java
tag:
  - Java集合
head:
  - - meta
    - name: keywords
      content: DelayQueue,延迟队列,Delayed,getDelay,任务调度,PriorityQueue,无界队列,ReentrantLock,Condition
  - - meta
    - name: description
      content: 介绍 DelayQueue 的延时任务队列原理与常见场景，用例包含延时执行与过期删除，解析基于 PriorityQueue 的线程安全实现。
---

## DelayQueue 简介

`DelayQueue` 是 JUC 包(`java.util.concurrent)`为我们提供的延迟队列，用于实现延时任务比如订单下单 15 分钟未支付直接取消。它是 `BlockingQueue` 的一种，底层是一个基于 `PriorityQueue` 实现的一个无界队列，是线程安全的。关于`PriorityQueue`可以参考笔者编写的这篇文章：[PriorityQueue 源码分析](./priorityqueue-source-code.md) 。

![BlockingQueue 的实现类](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

`DelayQueue` 中存放的元素必须实现 `Delayed` 接口，并且需要重写 `getDelay()`方法（计算是否到期）。

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);
}
```

默认情况下, `DelayQueue` 会按照到期时间升序编排任务。只有当元素过期时（`getDelay()`方法返回值小于等于 0），才能从队列中取出。

## DelayQueue 发展史

- `DelayQueue` 最早是在 Java 5 中引入的，作为 `java.util.concurrent` 包中的一部分，用于支持基于时间的任务调度和缓存过期删除等场景，该版本仅仅支持延迟功能的实现，还未解决线程安全问题。
- 在 Java 6 中，`DelayQueue` 的实现进行了优化，通过使用 `ReentrantLock` 和 `Condition` 解决线程安全及线程间交互的效率，提高了其性能和可靠性。
- 在 Java 7 中，`DelayQueue` 的实现进行了进一步的优化，通过使用 CAS 操作实现元素的添加和移除操作，提高了其并发操作性能。
- 在 Java 8 中，`DelayQueue` 的实现没有进行重大变化，但是在 `java.time` 包中引入了新的时间类，如 `Duration` 和 `Instant`，使得使用 `DelayQueue` 进行基于时间的调度更加方便和灵活。
- 在 Java 9 中，`DelayQueue` 的实现进行了一些微小的改进，主要是对代码进行了一些优化和精简。

总的来说，`DelayQueue` 的发展史主要是通过优化其实现方式和提高其性能和可靠性，使其更加适用于基于时间的调度和缓存过期删除等场景。

## DelayQueue 常见使用场景示例

我们这里希望任务可以按照我们预期的时间执行，例如提交 3 个任务，分别要求 1s、2s、3s 后执行，即使是乱序添加，1s 后要求 1s 执行的任务会准时执行。

![延迟任务](https://oss.javaguide.cn/github/javaguide/java/collection/delayed-task.png)

对此我们可以使用 `DelayQueue` 来实现,所以我们首先需要继承 `Delayed` 实现 `DelayedTask`，实现 `getDelay` 方法以及优先级比较 `compareTo`。

```java
/**
 * 延迟任务
 */
public class DelayedTask implements Delayed {
    /**
     * 任务到期时间
     */
    private long executeTime;
    /**
     * 任务
     */
    private Runnable task;

    public DelayedTask(long delay, Runnable task) {
        this.executeTime = System.currentTimeMillis() + delay;
        this.task = task;
    }

    /**
     * 查看当前任务还有多久到期
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * 延迟队列需要到期时间升序入队，所以我们需要实现compareTo进行到期时间比较
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

完成任务的封装之后，使用就很简单了，设置好多久到期然后将任务提交到延迟队列中即可。

```java
// 创建延迟队列，并添加任务
DelayQueue < DelayedTask > delayQueue = new DelayQueue < > ();

//分别添加1s、2s、3s到期的任务
delayQueue.add(new DelayedTask(2000, () -> System.out.println("Task 2")));
delayQueue.add(new DelayedTask(1000, () -> System.out.println("Task 1")));
delayQueue.add(new DelayedTask(3000, () -> System.out.println("Task 3")));

// 取出任务并执行
while (!delayQueue.isEmpty()) {
  //阻塞获取最先到期的任务
  DelayedTask task = delayQueue.take();
  if (task != null) {
    task.execute();
  }
}
```

从输出结果可以看出，即使笔者先提到 2s 到期的任务，1s 到期的任务 Task1 还是优先执行的。

```java
Task 1
Task 2
Task 3
```

## DelayQueue 源码解析

这里以 JDK1.8 为例，分析一下 `DelayQueue` 的底层核心源码。

`DelayQueue` 的类定义如下：

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E> implements BlockingQueue<E>
{
  //...
}
```

`DelayQueue` 继承了 `AbstractQueue` 类，实现了 `BlockingQueue` 接口。

![DelayQueue类图](https://oss.javaguide.cn/github/javaguide/java/collection/delayqueue-class-diagram.png)

### 核心成员变量

`DelayQueue` 的 4 个核心成员变量如下：

```java
//可重入锁，实现线程安全的关键
private final transient ReentrantLock lock = new ReentrantLock();
//延迟队列底层存储数据的集合,确保元素按照到期时间升序排列
private final PriorityQueue<E> q = new PriorityQueue<E>();

//指向准备执行优先级最高的线程
private Thread leader = null;
//实现多线程之间等待唤醒的交互
private final Condition available = lock.newCondition();
```

- `lock` : 我们都知道 `DelayQueue` 存取是线程安全的，所以为了保证存取元素时线程安全，我们就需要在存取时上锁，而 `DelayQueue` 就是基于 `ReentrantLock` 独占锁确保存取操作的线程安全。
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

我们再来看看非阻塞的获取元素方法 `poll` ，逻辑比较简单，整体步骤如下:

1. 尝试获取可重入锁。
2. 查看队列第一个元素,判断元素是否为空。
3. 若元素为空，或者元素未到期，则直接返回空。
4. 若元素不为空且到期了，直接调用 `poll` 返回出去。
5. 释放可重入锁 `lock` 。

源码如下,读者可自行参阅源码及注释:

```java
public E poll() {
    //尝试获取可重入锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        //查看队列第一个元素,判断元素是否为空
        E first = q.peek();

        //若元素为空，或者元素未到期，则直接返回空
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            //若元素不为空且到期了，直接调用poll返回出去
            return q.poll();
    } finally {
        //释放可重入锁lock
        lock.unlock();
    }
}
```

### 查看元素

上文获取元素时都会调用到 `peek` 方法，peek 顾名思义仅仅窥探一下队列中的元素，它的步骤就 4 步:

1. 上锁。
2. 调用优先队列 q 的 peek 方法查看索引 0 位置的元素。
3. 释放锁。
4. 将元素返回出去。

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

## DelayQueue 常见面试题

### DelayQueue 的实现原理是什么？

`DelayQueue` 底层是使用优先队列 `PriorityQueue` 来存储元素，而 `PriorityQueue` 采用二叉小顶堆的思想确保值小的元素排在最前面，这就使得 `DelayQueue` 对于延迟任务优先级的管理就变得十分方便了。同时 `DelayQueue` 为了保证线程安全还用到了可重入锁 `ReentrantLock`,确保单位时间内只有一个线程可以操作延迟队列。最后，为了实现多线程之间等待和唤醒的交互效率，`DelayQueue` 还用到了 `Condition`，通过 `Condition` 的 `await` 和 `signal` 方法完成多线程之间的等待唤醒。

### DelayQueue 的实现是否线程安全？

`DelayQueue` 的实现是线程安全的，它通过 `ReentrantLock` 实现了互斥访问和 `Condition` 实现了线程间的等待和唤醒操作，可以保证多线程环境下的安全性和可靠性。

### DelayQueue 的使用场景有哪些？

`DelayQueue` 通常用于实现定时任务调度和缓存过期删除等场景。在定时任务调度中，需要将需要执行的任务封装成延迟任务对象，并将其添加到 `DelayQueue` 中，`DelayQueue` 会自动按照剩余延迟时间进行升序排序(默认情况)，以保证任务能够按照时间先后顺序执行。对于缓存过期这个场景而言，在数据被缓存到内存之后，我们可以将缓存的 key 封装成一个延迟的删除任务，并将其添加到 `DelayQueue` 中，当数据过期时，拿到这个任务的 key，将这个 key 从内存中移除。

### DelayQueue 中 Delayed 接口的作用是什么？

`Delayed` 接口定义了元素的剩余延迟时间(`getDelay`)和元素之间的比较规则(该接口继承了 `Comparable` 接口)。若希望元素能够存放到 `DelayQueue` 中，就必须实现 `Delayed` 接口的 `getDelay()` 方法和 `compareTo()` 方法，否则 `DelayQueue` 无法得知当前任务剩余时长和任务优先级的比较。

### DelayQueue 和 Timer/TimerTask 的区别是什么？

`DelayQueue` 和 `Timer/TimerTask` 都可以用于实现定时任务调度，但是它们的实现方式不同。`DelayQueue` 是基于优先级队列和堆排序算法实现的，可以实现多个任务按照时间先后顺序执行；而 `Timer/TimerTask` 是基于单线程实现的，只能按照任务的执行顺序依次执行，如果某个任务执行时间过长，会影响其他任务的执行。另外，`DelayQueue` 还支持动态添加和移除任务，而 `Timer/TimerTask` 只能在创建时指定任务。

## 参考文献

- 《深入理解高并发编程：JDK 核心技术》:
- 一口气说出 Java 6 种延时队列的实现方法(面试官也得服):<https://www.jb51.net/article/186192.htm>
- 图解 DelayQueue 源码（java 8）——延时队列的小九九: <https://blog.csdn.net/every__day/article/details/113810985>
<!-- @include: @article-footer.snippet.md -->
