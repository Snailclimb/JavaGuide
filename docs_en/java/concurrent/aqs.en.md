---
title: AQS 详解
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: AQS,AbstractQueuedSynchronizer,同步器,独占锁,共享锁,CLH 队列,acquire,release,阻塞与唤醒,条件队列
  - - meta
    - name: description
      content: 全面解析 AQS 的队列同步器原理与模板方法，理解其在 ReentrantLock、Semaphore 等同步器中的应用与线程阻塞唤醒机制。
---

<!-- markdownlint-disable MD024 -->

## AQS 介绍

AQS 的全称为 `AbstractQueuedSynchronizer` ，翻译过来的意思就是抽象队列同步器。这个类在 `java.util.concurrent.locks` 包下面。

![](https://oss.javaguide.cn/github/javaguide/AQS.png)

AQS 就是一个抽象类，主要用来构建锁和同步器。

```java
public abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer implements java.io.Serializable {
}
```

AQS 为构建锁和同步器提供了一些通用功能的实现。因此，使用 AQS 能简单且高效地构造出应用广泛的大量的同步器，比如我们提到的 `ReentrantLock`，`Semaphore`，其他的诸如 `ReentrantReadWriteLock`，`SynchronousQueue`等等皆是基于 AQS 的。

## AQS 原理

在面试中被问到并发知识的时候，大多都会被问到“请你说一下自己对于 AQS 原理的理解”。下面给大家一个示例供大家参考，面试不是背题，大家一定要加入自己的思想，即使加入不了自己的思想也要保证自己能够通俗的讲出来而不是背出来。

### AQS 快速了解

在真正讲解 AQS 源码之前，需要对 AQS 有一个整体层面的认识。这里会先通过几个问题，从整体层面上认识 AQS，了解 AQS 在整个 Java 并发中所位于的层面，之后在学习 AQS 源码的过程中，才能更加了解同步器和 AQS 之间的关系。

#### AQS 的作用是什么？

AQS 解决了开发者在实现同步器时的复杂性问题。它提供了一个通用框架，用于实现各种同步器，例如 **可重入锁**（`ReentrantLock`）、**信号量**（`Semaphore`）和 **倒计时器**（`CountDownLatch`）。通过封装底层的线程同步机制，AQS 将复杂的线程管理逻辑隐藏起来，使开发者只需专注于具体的同步逻辑。

简单来说，AQS 是一个抽象类，为同步器提供了通用的 **执行框架**。它定义了 **资源获取和释放的通用流程**，而具体的资源获取逻辑则由具体同步器通过重写模板方法来实现。 因此，可以将 AQS 看作是同步器的 **基础“底座”**，而同步器则是基于 AQS 实现的 **具体“应用”**。

#### AQS 为什么使用 CLH 锁队列的变体？

CLH 锁是一种基于 **自旋锁** 的优化实现。

先说一下自旋锁存在的问题：自旋锁通过线程不断对一个原子变量执行 `compareAndSet`（简称 `CAS`）操作来尝试获取锁。在高并发场景下，多个线程会同时竞争同一个原子变量，容易造成某个线程的 `CAS` 操作长时间失败，从而导致 **“饥饿”问题**（某些线程可能永远无法获取锁）。

CLH 锁通过引入一个队列来组织并发竞争的线程，对自旋锁进行了改进：

- 每个线程会作为一个节点加入到队列中，并通过自旋监控前一个线程节点的状态，而不是直接竞争共享变量。
- 线程按顺序排队，确保公平性，从而避免了 “饥饿” 问题。

AQS（AbstractQueuedSynchronizer）在 CLH 锁的基础上进一步优化，形成了其内部的 **CLH 队列变体**。主要改进点有以下两方面：

1. **自旋 + 阻塞**： CLH 锁使用纯自旋方式等待锁的释放，但大量的自旋操作会占用过多的 CPU 资源。AQS 引入了 **自旋 + 阻塞** 的混合机制：
   - 如果线程获取锁失败，会先短暂自旋尝试获取锁；
   - 如果仍然失败，则线程会进入阻塞状态，等待被唤醒，从而减少 CPU 的浪费。
2. **单向队列改为双向队列**：CLH 锁使用单向队列，节点只知道前驱节点的状态，而当某个节点释放锁时，需要通过队列唤醒后续节点。AQS 将队列改为 **双向队列**，新增了 `next` 指针，使得节点不仅知道前驱节点，也可以直接唤醒后继节点，从而简化了队列操作，提高了唤醒效率。

#### AQS 的性能比较好，原因是什么？

因为 AQS 内部大量使用了 `CAS` 操作。

AQS 内部通过队列来存储等待的线程节点。由于队列是共享资源，在多线程场景下，需要保证队列的同步访问。

AQS 内部通过 `CAS` 操作来控制队列的同步访问，`CAS` 操作主要用于控制 `队列初始化` 、 `线程节点入队` 两个操作的并发安全。虽然利用 `CAS` 控制并发安全可以保证比较好的性能，但同时会带来比较高的 **编码复杂度** 。

#### AQS 中为什么 Node 节点需要不同的状态？

AQS 中的 `waitStatus` 状态类似于 **状态机** ，通过不同状态来表明 Node 节点的不同含义，并且根据不同操作，来控制状态之间的流转。

- 状态 `0` ：新节点加入队列之后，初始状态为 `0` 。

- 状态 `SIGNAL` ：当有新的节点加入队列，此时新节点的前继节点状态就会由 `0` 更新为 `SIGNAL` ，表示前继节点释放锁之后，需要对新节点进行唤醒操作。如果唤醒 `SIGNAL` 状态节点的后续节点，就会将 `SIGNAL` 状态更新为 `0` 。即通过清除 `SIGNAL` 状态，表示已经执行了唤醒操作。

- 状态 `CANCELLED` ：如果一个节点在队列中等待获取锁锁时，因为某种原因失败了，该节点的状态就会变为 `CANCELLED` ，表明取消获取锁，这种状态的节点是异常的，无法被唤醒，也无法唤醒后继节点。

### AQS 核心思想

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

关于 AQS 核心数据结构-CLH 锁的详细解读，强烈推荐阅读 [Java AQS 核心数据结构-CLH 锁 - Qunar 技术沙龙](https://mp.weixin.qq.com/s/jEx-4XhNGOFdCo4Nou5tqg) 这篇文章。

AQS(`AbstractQueuedSynchronizer`)的核心原理图：

![CLH 变体队列](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-state.png)

AQS 使用 **int 成员变量 `state` 表示同步状态**，通过内置的 **FIFO 线程等待/等待队列** 来完成获取资源线程的排队工作。

`state` 变量由 `volatile` 修饰，用于展示当前临界资源的获取情况。

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

以可重入的互斥锁 `ReentrantLock` 为例，它的内部维护了一个 `state` 变量，用来表示锁的占用状态。`state` 的初始值为 0，表示锁处于未锁定状态。当线程 A 调用 `lock()` 方法时，会尝试通过 `tryAcquire()` 方法独占该锁，并让 `state` 的值加 1。如果成功了，那么线程 A 就获取到了锁。如果失败了，那么线程 A 就会被加入到一个等待队列（CLH 变体队列）中，直到其他线程释放该锁。假设线程 A 获取锁成功了，释放锁之前，A 线程自己是可以重复获取此锁的（`state` 会累加）。这就是可重入性的体现：一个线程可以多次获取同一个锁而不会被阻塞。但是，这也意味着，一个线程必须释放与获取的次数相同的锁，才能让 `state` 的值回到 0，也就是让锁恢复到未锁定状态。只有这样，其他等待的线程才能有机会获取该锁。

线程 A 尝试获取锁的过程如下图所示（图源[从 ReentrantLock 的实现看 AQS 的原理及应用 - 美团技术团队](./reentrantlock.md)）：

![AQS 独占模式获取锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-exclusive-mode-acquire-lock.png)

再以倒计时器 `CountDownLatch` 以例，任务分为 N 个子线程去执行，`state` 也初始化为 N（注意 N 要与线程个数一致）。这 N 个子线程开始执行任务，每执行完一个子线程，就调用一次 `countDown()` 方法。该方法会尝试使用 CAS(Compare and Swap) 操作，让 `state` 的值减少 1。当所有的子线程都执行完毕后（即 `state` 的值变为 0），`CountDownLatch` 会调用 `unpark()` 方法，唤醒主线程。这时，主线程就可以从 `await()` 方法（`CountDownLatch` 中的`await()` 方法而非 AQS 中的）返回，继续执行后续的操作。

### Node 节点 waitStatus 状态含义

AQS 中的 `waitStatus` 状态类似于 **状态机** ，通过不同状态来表明 Node 节点的不同含义，并且根据不同操作，来控制状态之间的流转。

| Node 节点状态 | 值  | 含义                                                                                                                      |
| ------------- | --- | ------------------------------------------------------------------------------------------------------------------------- |
| `CANCELLED`   | 1   | 表示线程已经取消获取锁。线程在等待获取资源时被中断、等待资源超时会更新为该状态。                                          |
| `SIGNAL`      | -1  | 表示后继节点需要当前节点唤醒。在当前线程节点释放锁之后，需要对后继节点进行唤醒。                                          |
| `CONDITION`   | -2  | 表示节点在等待 Condition。当其他线程调用了 Condition 的 `signal()` 方法后，节点会从等待队列转移到同步队列中等待获取资源。 |
| `PROPAGATE`   | -3  | 用于共享模式。在共享模式下，可能会出现线程在队列中无法被唤醒的情况，因此引入了 `PROPAGATE` 状态来解决这个问题。           |
|               | 0   | 加入队列的新节点的初始状态。                                                                                              |

在 AQS 的源码中，经常使用 `> 0` 、 `< 0` 来对 `waitStatus` 进行判断。

如果 `waitStatus > 0` ，表明节点的状态已经取消等待获取资源。

如果 `waitStatus < 0` ，表明节点的状态处于正常的状态，即没有取消等待。

其中 `SIGNAL` 状态是最重要的，节点状态流转以及对应操作如下：

| 状态流转         | 对应操作                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`              | 新节点入队时，初始状态为 `0` 。                                                                                                                           |
| `0 -> SIGNAL`    | 新节点入队时，它的前继节点状态会由 `0` 更新为 `SIGNAL` 。`SIGNAL` 状态表明该节点的后续节点需要被唤醒。                                                    |
| `SIGNAL -> 0`    | 在唤醒后继节点时，需要清除当前节点的状态。通常发生在 `head` 节点，比如 `head` 节点的状态由 `SIGNAL` 更新为 `0` ，表示已经对 `head` 节点的后继节点唤醒了。 |
| `0 -> PROPAGATE` | AQS 内部引入了 `PROPAGATE` 状态，为了解决并发场景下，可能造成的线程节点无法唤醒的情况。（在 AQS 共享模式获取资源的源码分析会讲到）                        |

### 自定义同步器

基于 AQS 可以实现自定义的同步器， AQS 提供了 5 个模板方法（模板方法模式）。如果需要自定义同步器一般的方式是这样（模板方法模式很经典的一个应用）：

1. 自定义的同步器继承 `AbstractQueuedSynchronizer` 。
2. 重写 AQS 暴露的模板方法。

**AQS 使用了模板方法模式，自定义同步器时需要重写下面几个 AQS 提供的钩子方法：**

```java
//独占方式。尝试获取资源，成功则返回true，失败则返回false。
protected boolean tryAcquire(int)
//独占方式。尝试释放资源，成功则返回true，失败则返回false。
protected boolean tryRelease(int)
//共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
protected int tryAcquireShared(int)
//共享方式。尝试释放资源，成功则返回true，失败则返回false。
protected boolean tryReleaseShared(int)
//该线程是否正在独占资源。只有用到condition才需要去实现它。
protected boolean isHeldExclusively()
```

**What is a hook method? ** A hook method is a method declared in an abstract class. It is generally modified with the `protected` keyword. It can be an empty method (implemented by a subclass) or a method implemented by default. The template design pattern controls the implementation of fixed steps through hook methods.

Due to space issues, I won’t introduce the template method pattern in detail here. Friends who don’t know much about it can read this article: [The template method pattern modified with Java8 is really yyds!](https://mp.weixin.qq.com/s/zpScSCktFpnSWHWIQem2jg).

Except for the hook method mentioned above, other methods in the AQS class are `final`, so they cannot be overridden by other classes.

### AQS resource sharing method

AQS defines two resource sharing methods: `Exclusive` (exclusive, only one thread can execute, such as `ReentrantLock`) and `Share` (shared, multiple threads can execute at the same time, such as `Semaphore`/`CountDownLatch`).

Generally speaking, the sharing method of custom synchronizers is either exclusive or shared, and they only need to implement one of `tryAcquire-tryRelease` and `tryAcquireShared-tryReleaseShared`. But AQS also supports custom synchronizers to implement both exclusive and shared methods, such as `ReentrantReadWriteLock`.

### AQS resource acquisition source code analysis (exclusive mode)

The entry method for acquiring resources in exclusive mode in AQS is `acquire()`, as follows:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

In `acquire()`, the thread will first try to acquire the shared resource; if the acquisition fails, the thread will be encapsulated as a Node node and added to the waiting queue of AQS; after joining the queue, the thread in the waiting queue will try to acquire the resource, and the thread will be blocked. Correspond to the following three methods:

- `tryAcquire()`: Try to acquire the lock (template method), `AQS` does not provide a specific implementation and is implemented by subclasses.
- `addWaiter()`: If the lock acquisition fails, the current thread will be encapsulated as a Node node and added to the CLH variant queue of AQS to wait for the lock acquisition.
- `acquireQueued()`: Block the thread and call the `tryAcquire()` method to let the threads in the queue try to acquire the lock.

#### `tryAcquire()` Analysis

The corresponding `tryAcquire()` template method in AQS is as follows:

```JAVA
// AQS
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

The `tryAcquire()` method is a template method provided by AQS and does not provide a default implementation.

Therefore, when analyzing the `tryAcquire()` method here, we will take the unfair lock (exclusive lock) of `ReentrantLock` as an example. The `tryAcquire()` internally implemented in `ReentrantLock` will call the following `nonfairTryAcquire()`:

```JAVA
// ReentrantLock
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // 1. Get the state in AQS
    int c = getState();
    // 2. If state is 0, it proves that the lock is not occupied by other threads
    if (c == 0) {
        // 2.1. Update state through CAS
        if (compareAndSetState(0, acquires)) {
            // 2.2. If the CAS update is successful, set the lock holder to the current thread
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 3. If the current thread and the thread holding the lock are the same, it means that "lock reentrancy" has occurred.
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        // 3.1. Add 1 to the number of reentrants of the lock
        setState(nextc);
        return true;
    }
    // 4. If the lock is occupied by other threads, return false, indicating failure to acquire the lock.
    return false;
}
```

Within the `nonfairTryAcquire()` method, resource acquisition is mainly accomplished through two core operations:

- Update `state` variable via `CAS`. `state == 0` means the resource is not occupied. `state > 0` means that the resource is occupied, and `state` represents the number of reentries.
- Set the thread holding the resource through `setExclusiveOwnerThread()`.

If the thread updates the `state` variable successfully, it means that the resource has been obtained, so just set the thread holding the resource as the current thread.

#### `addWaiter()` Analysis

After trying to obtain resources through the `tryAcquire()` method fails, the `addWaiter()` method will be called to encapsulate the current thread into a Node node and add it to the queue inside `AQS`. `addWaite()` code is as follows:

```JAVA
// AQS
private Node addWaiter(Node mode) {
    // 1. Encapsulate the current thread into a Node node.
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 2. If pred! = null, it proves that the tail node has been initialized, and you can directly add the Node node to the queue.
    if (pred != null) {
        node.prev = pred;
        // 2.1. Control concurrency security through CAS.
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    // 3. Initialize the queue and add the newly created Node node to the queue.
    enq(node);
    return node;
}
```

**Concurrency safety of node enqueue:**

In the `addWaiter()` method, you need to perform the **enqueue** operation of the Node node. Since it is in a multi-threaded environment, the `CAS` operation needs to be used to ensure concurrency safety.

Use the `CAS` operation to update the `tail` pointer to point to the newly enqueued Node node. `CAS` can ensure that only one thread will successfully modify the `tail` pointer, thereby ensuring concurrency safety when the Node node is enqueued.

**AQS internal queue initialization:**

When executing `addWaiter()`, if it is found that `pred == null`, that is, the `tail` pointer is null, it proves that the queue has not been initialized. You need to call the `enq()` method to initialize the queue and add the `Node` node to the initialized queue. The code is as follows:

```JAVA
// AQS
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        if (t == null) {
            // 1. Ensure the concurrency safety of queue initialization through CAS operation
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 2. The same operation as adding nodes to the queue in the addWaiter() method
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

The queue is initialized in the `enq()` method. During the initialization process, `CAS` is also required to ensure concurrency safety.

Initializing the queue consists of two steps: initializing the `head` node and pointing `tail` to the `head` node.

**The initialized queue is as shown below:**![](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-init.png)

#### `acquireQueued()` Analysis

For the convenience of reading, here is the code for `acquire()` to obtain resources in `AQS`:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

In the `acquire()` method, after adding the `Node` node to the queue through the `addWaiter()` method, the `acquireQueued()` method will be called. The code is as follows:

```JAVA
// AQS: Let the nodes in the queue try to acquire the lock and block the thread.
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 1. Try to acquire the lock.
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 2. Determine whether the thread can be blocked. If so, block the current thread.
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3. If the lock acquisition fails, the lock acquisition will be canceled and the node status will be updated to CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

In the `acquireQueued()` method, two main things are done:

- **Try to acquire resources:** After the current thread joins the queue, if the predecessor node is found to be the `head` node, it means that the current thread is the first waiting node in the queue, so `tryAcquire()` is called to try to acquire resources.

- **Block the current thread**: If the attempt to obtain resources fails, you need to block the current thread and wait to be awakened to obtain the resources.

**1. Try to obtain resources**

In the `acquireQueued()` method, there are a total of 2 steps to try to acquire the resource:

- `p == head`: Indicates that the predecessor node of the current node is the `head` node. At this time, the current node is the first waiting node in the AQS queue.
- `tryAcquire(arg) == true`: Indicates that the current thread tried to acquire the resource successfully.

After successfully acquiring the resource, the node of the current thread needs to be removed from the waiting queue. The removal operation is: set the currently waiting thread node to the `head` node (the `head` node is a virtual node and does not participate in queuing to obtain resources).

**2. Block the current thread**

In `AQS`, the wake-up of the current node needs to depend on the previous node. If the previous node cancels acquiring the lock, its status will change to `CANCELLED`. The node in the `CANCELLED` state has not acquired the lock, so it cannot perform the unlocking operation to wake up the current node. Therefore, nodes in the `CANCELLED` state need to be skipped before blocking the current thread.

Use the `shouldParkAfterFailedAcquire()` method to determine whether the current thread node can be blocked, as follows:

```JAVA
// AQS: Determine whether the current thread node can be blocked.
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    // 1. If the status of the predecessor node is normal, just return true directly.
    if (ws == Node.SIGNAL)
        return true;
    // 2. ws > 0 means that the status of the predecessor node is abnormal, that is, the CANCELLED state, and the node in the abnormal state needs to be skipped.
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        // 3. If the status of the predecessor node is not SIGNAL or CANCELLED, set the status to SIGNAL.
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}
```

Judgment logic in the `shouldParkAfterFailedAcquire()` method:

- If the status of the predecessor node is found to be `SIGNAL`, the current thread can be blocked.
- If the status of the predecessor node is found to be `CANCELLED`, you need to skip the node in the `CANCELLED` state.
- If it is found that the status of the predecessor node is not `SIGNAL` and `CANCELLED`, it indicates that the status of the predecessor node is in a normal state of waiting for resources, so the status of the predecessor node is set to `SIGNAL`, indicating that the predecessor node needs to wake up the subsequent node.

After determining that the current thread can be blocked, block the current thread by calling the `parkAndCheckInterrupt()` method. `LockSupport` is used internally to implement blocking. The bottom layer of `LockSupoprt` is based on the `Unsafe` class to block threads. The code is as follows:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    // 1. The thread is blocked here
    LockSupport.park(this);
    // 2. After the thread is awakened, return to the thread interruption state
    return Thread.interrupted();
}
```

**Why do we need to return to the interrupt state of the thread after it is awakened? **

In the `parkAndCheckInterrupt()` method, when `LockSupport.park(this)` is executed, the thread will be blocked. The code is as follows:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    //After the thread is awakened, it needs to return to the thread interruption state
    return Thread.interrupted();
}
```

After the thread is awakened, `Thread.interrupted()` needs to be executed to return the interrupt status of the thread. Why is this?

This is related to the interrupt cooperation mechanism of the thread. After the thread is awakened, it is not sure whether it was awakened by an interrupt or by `LockSupport.unpark()`, so it needs to be judged by the interrupt status of the thread.

**In the `acquire()` method, why do you need to call `selfInterrupt()`? **

The `acquire()` method code is as follows:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

In the `acquire()` method, when the condition of the `if` statement returns `true`, `selfInterrupt()` will be called. This method will interrupt the current thread. Why do we need to interrupt the current thread?

When `if` is evaluated as `true`, `tryAcquire()` needs to return `false` and `acquireQueued()` should return `true`.

The `acquireQueued()` method returns the **interruption status** after the thread is awakened, which is returned by executing `Thread.interrupted()`. This method will clear the thread's interrupt status while returning the interrupt status.Therefore, if `if` is judged as `true`, it means that the thread's interrupt status is `true`, but after calling `Thread.interrupted()`, the thread's interrupt status is cleared to `false`, so it is necessary to re-execute `selfInterrupt()` to reset the thread's interrupt state.

### AQS resource release source code analysis (exclusive mode)

The entry method to release resources in exclusive mode in AQS is `release()`. The code is as follows:

```JAVA
// AQS
public final boolean release(int arg) {
    // 1. Try to release the lock
    if (tryRelease(arg)) {
        Node h = head;
        // 2. Wake up the successor node
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

In the `release()` method, there are two main things to do: try to release the lock and wake up the successor node. The corresponding methods are as follows:

**1. Try to release the lock**

Try to release the lock through the `tryRelease()` method. This method is a template method and is implemented by a custom synchronizer, so here we still use `ReentrantLock` as an example.

The `tryRelease()` method implemented in `ReentrantLock` is as follows:

```JAVA
// ReentrantLock
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    // 1. Determine whether the thread holding the lock is the current thread
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 2. If state is 0, it means that the current thread has no reentry times. So update free to true, indicating that the thread will release the lock.
    if (c == 0) {
        free = true;
        // 3. Update the thread holding the resource to null
        setExclusiveOwnerThread(null);
    }
    // 4. Update state value
    setState(c);
    return free;
}
```

In the `tryRelease()` method, the `state` value after the lock is released is first calculated to determine whether the `state` value is 0.

- If `state == 0`, it indicates that the thread has no reentry times, update `free = true`, and modify the thread holding the resource to null, indicating that the thread completely releases the lock.
- If `state != 0`, it means that the thread still has reentry times, so the `free` value is not updated. The `free` value is `false`, which means that the thread has not completely released the lock.

The `state` value is then updated and the `free` value is returned. The `free` value indicates whether the thread has completely released the lock.

**2. Wake up the successor node**

If `tryRelease()` returns `true`, it indicates that the thread has no reentry times and the lock has been completely released, so subsequent nodes need to be awakened.

Before waking up the successor node, it is necessary to determine whether the successor node can be awakened. The judgment condition is: `h != null && h.waitStatus != 0` . Here is an explanation of why this judgment should be made:

- `h == null`: Indicates that the `head` node has not been initialized, that is, the queue in AQS has not been initialized, so the thread node in the queue cannot be awakened.
- `h != null && h.waitStatus == 0`: Indicates that the head node has just been initialized (the initialization status of the node is 0), and the subsequent node thread has not successfully joined the queue, so there is no need to wake up the subsequent node. (When the successor node joins the queue, the status of the predecessor node will be modified to `SIGNAL`, indicating that the successor node needs to be awakened)
- `h != null && h.waitStatus != 0`: `waitStatus` may be greater than 0 or less than 0. Among them, `> 0` indicates that the node has canceled waiting to obtain resources, and `< 0` indicates that the node is in a normal waiting state.

Next, enter the `unparkSuccessor()` method to see how to wake up the successor node:

```JAVA
// AQS: The input parameter node here is the head node of the queue (virtual head node)
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    // 1. Clear the status of the head node to prepare for subsequent wake-up.
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    // 2. If the successor node is abnormal, you need to traverse forward from tail to find the normal node to wake up.
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 3. Wake up the successor node
        LockSupport.unpark(s.thread);
}
```

In `unparkSuccessor()`, if the status of the head node is `< 0` (under normal circumstances, as long as there is a successor node, the status of the head node should be `SIGNAL`, that is -1), it means that the successor node needs to be awakened. Therefore, the status identifier of the head node is cleared in advance and the status is modified to 0, indicating that the operation of waking up the subsequent node has been performed.

If `s == null` or `s.waitStatus > 0`, it indicates that the subsequent node is abnormal. At this time, the abnormal node cannot be awakened, but a node in a normal state must be found for awakening.

Therefore, it is necessary to traverse forward from the `tail` pointer to find the first node with normal status (`waitStatus <= 0`) to wake up.

**Why do we need to traverse forward from the `tail` pointer instead of traversing backward from the `head` pointer to find nodes in a normal state? **

The direction of traversal is related to the **node enqueuing operation**. How to join the team is as follows:

```JAVA
// AQS: node enqueue method
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    if (pred != null) {
        // 1. Modify the prev pointer first.
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            // 2. Modify the next pointer again.
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

In the `addWaiter()` method, adding the `node` node to the queue requires modifying the two pointers `node.prev` and `pred.next`, but these two operations are not **atomic operations**. The `node.prev` pointer is modified first, and then the `pred.next` pointer is modified.

In extreme cases, the next node status of the `head` node may be `CANCELLED`. At this time, the newly enqueued node has only updated the `node.prev` pointer, but has not updated the `pred.next` pointer, as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-addWaiter.png)

In this way, if you traverse backward from the `head` pointer, you cannot find the newly enqueued node, so you need to traverse forward from the `tail` pointer to find the newly enqueued node.

### Illustration of the working principle of AQS (exclusive mode)

At this point, the source code for obtaining resources and releasing resources in exclusive mode in AQS is finished. In order to have a clearer understanding of the working principle of AQS and node status changes, we will next understand the working principle of the entire AQS by drawing pictures.

Since AQS is a low-level synchronization tool, the method of obtaining and releasing resources does not provide specific implementation, so here we will draw a diagram based on `ReentrantLock` to explain.

Assume that there are a total of 3 threads trying to acquire the lock, threads `T1`, `T2` and `T3` ​​respectively.

At this time, assume that thread `T1` acquires the lock first, and thread `T2` queues up to wait to acquire the lock. Before thread `T2` enters the queue, the AQS internal queue needs to be initialized. The `head` node has a state of `0` after initialization. The queue after initialization inside AQS is as shown below:![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process.png)

At this point, thread `T2` attempts to acquire the lock. Since thread `T1` holds the lock, thread `T2` will enter the queue and wait to acquire the lock. At the same time, the status of the predecessor node (`head` node) will be updated from `0` to `SIGNAL`, indicating that the successor node of the `head` node needs to be awakened. At this time, the AQS internal queue is as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-2.png)

At this point, thread `T3` attempts to acquire the lock. Since thread `T1` holds the lock, thread `T3` ​​will enter the queue and wait to acquire the lock. At the same time, the status of the predecessor node (thread `T2` node) will be updated from `0` to `SIGNAL`, indicating that the thread `T2` node needs to wake up the successor node. At this time, the AQS internal queue is as shown below:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-3.png)

At this time, assuming that thread `T1` releases the lock, the successor node `T2` will be awakened. Thread `T2` acquires the lock after being awakened and exits from the waiting queue.

Here, when the thread `T2` node exits the waiting queue, it does not directly remove it from the queue, but makes the thread `T2` node become the new `head` node, thereby exiting the waiting for resource acquisition. At this time, the AQS internal queue looks as follows:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-4.png)

At this time, assuming that thread `T2` releases the lock, the successor node `T3` will be awakened. After thread `T3` ​​acquires the lock, it also exits the waiting queue, that is, changes the thread `T3` ​​node to the `head` node to exit the wait for resource acquisition. At this time, the AQS internal queue looks as follows:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-5.png)

### AQS resource acquisition source code analysis (shared mode)

The entry method for acquiring resources in shared mode in AQS is `acquireShared()`, as follows:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

In the `acquireShared()` method, it will first try to acquire the shared lock. If the acquisition fails, the current thread will be added to the queue and blocked, waiting to wake up and try to acquire the shared lock, corresponding to the following two methods: `tryAcquireShared()` and `doAcquireShared()`.

The `tryAcquireShared()` method is a template method provided by AQS, and the synchronizer implements the specific logic. Therefore, here we take `Semaphore` as an example to analyze how to obtain resources in shared mode.

#### `tryAcquireShared()` Analysis

Fair locks and unfair locks are implemented in `Semaphore`. Next, we will take unfair locks as an example to analyze the `tryAcquireShared()` source code.

The `tryAcquireShared()` method overridden in `Semaphore` will call the following `nonfairTryAcquireShared()` method:

```JAVA
// Semaphore overrides the template method of AQS
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Semaphore
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 1. Get the number of available resources.
        int available = getState();
        // 2. Calculate the number of remaining resources.
        int remaining = available - acquires;
        // 3. If the number of remaining resources < 0, it means there are insufficient resources and returns directly; if CAS updates the state successfully, it means the current thread has obtained the shared resources and returns directly.
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

In shared mode, the `state` value in AQS represents the number of shared resources.

In the `nonfairTryAcquireShared()` method, it will continuously try to acquire resources in an infinite loop. If "the number of remaining resources is insufficient" or "the current thread successfully acquires resources", the infinite loop will be exited. The method returns **the remaining number of resources**, which is divided into 3 situations depending on the return value:

- **Number of remaining resources > 0**: Indicates that resources are successfully obtained, and subsequent threads can also successfully obtain resources.
- **Number of remaining resources = 0**: Indicates that the resource was successfully obtained, but subsequent threads cannot successfully obtain the resource.
- **Number of remaining resources < 0**: Indicates failure to obtain resources.

#### `doAcquireShared()` Analysis

For the convenience of reading, here is the entry method for acquiring resources `acquireShared()`:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

In the `acquireShared()` method, it will first try to obtain the resource through `tryAcquireShared()`.

If the return value of the found method is `< 0`, that is, the number of remaining resources is less than 0, it indicates that the current thread failed to obtain resources. Therefore, the `doAcquireShared()` method will be entered to add the current thread to the AQS queue to wait. As follows:

```JAVA
// AQS
private void doAcquireShared(int arg) {
    // 1. Add the current thread to the queue and wait.
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 2. If the current thread is the first node in the waiting queue, try to obtain resources.
                int r = tryAcquireShared(arg);
                if (r >= 0) {
					// 3. Move the current thread node out of the waiting queue and wake up subsequent thread nodes.
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3. If the resource acquisition fails, the resource acquisition will be canceled and the node status will be updated to CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

Since the current thread has failed to acquire resources, in the `doAcquireShared()` method, the current thread needs to be encapsulated as a Node node and added to the queue to wait.

The biggest difference between obtaining resources in **shared mode** and obtaining resources in **exclusive mode** is that in shared mode, the number of resources may be greater than 1, that is, multiple threads can hold resources at the same time.Therefore, in the shared mode, when the thread is awakened and the resource is obtained, if it is found that there are remaining resources, it will try to wake up the following thread to try to obtain the resource. The corresponding `setHeadAndPropagate()` method is as follows:

```JAVA
// AQS
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head;
    // 1. Move the current thread node out of the waiting queue.
    setHead(node);
	// 2. Wake up subsequent waiting nodes.
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

In the `setHeadAndPropagate()` method, certain conditions need to be met to wake up subsequent nodes, mainly 2 conditions need to be met:

- `propagate > 0`: `propagate` represents the number of resources remaining after acquiring the resource. If `> 0`, subsequent threads can be awakened to acquire resources.
- `h.waitStatus < 0`: The `h` node here is the `head` node before executing `setHead()`. Use `< 0` when judging `head.waitStatus`, mainly to determine whether the status of the `head` node is `SIGNAL` or `PROPAGATE`. If the `head` node is `SIGNAL`, subsequent nodes can be awakened; if the `head` node status is `PROPAGATE`, subsequent nodes can also be awakened (this is to solve problems in concurrency scenarios, which will be discussed in detail later).

The `if` judgment about **waking up subsequent waiting nodes** in the code is a little more complicated. Here is why it is written like this:

```JAVA
if (propagate > 0 || h == null || h.waitStatus < 0 ||
    (h = head) == null || h.waitStatus < 0)
```

- `h == null || h.waitStatus < 0` : `h == null` is used to prevent null pointer exception. Under normal circumstances, h will not be `null`, because the current node has been added to the queue before execution here, and the queue cannot be initialized yet.

  `h.waitStatus < 0` mainly determines whether the status of the `head` node is `SIGNAL` or `PROPAGATE`. It is more convenient to directly use `< 0` to determine.

- `(h = head) == null || h.waitStatus < 0`: If the previously determined `h.waitStatus < 0` is explained here, it means there is concurrency.

  At the same time, there are other threads waking up subsequent nodes, and the value of the `head` node has been modified from `SIGNAL` to `0`. Therefore, a new `head` node is obtained here again. The `head` node obtained this time is the current thread node set by `setHead()`, and then the `waitStatus` status is determined again.

If the `if` condition is passed, it will go to the `doReleaseShared()` method to wake up subsequent waiting nodes, as follows:

```JAVA
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        // 1. At least one waiting thread node is required in the queue.
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 2. If the status of the head node is SIGNAL, the successor node can be awakened.
            if (ws == Node.SIGNAL) {
                // 2.1 Clear the SIGNAL status of the head node and update it to 0. Indicates that the successor node of this node has been awakened.
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 2.2 Wake up the successor node
                unparkSuccessor(h);
            }
            // 3. If the status of the head node is 0, update it to PROPAGATE. This is to solve problems existing in concurrency scenarios, which will be discussed in detail next.
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```

In the `doReleaseShared()` method, the `waitStatus` status of the `head` node will be judged to determine the next operation. There are two situations:

- The status of the `head` node is `SIGNAL`: It indicates that the `head` node has a successor node that needs to be awakened, so the `SIGNAL` status of the `head` node is updated to `0` through the `CAS` operation. Clearing the `SIGNAL` status indicates that the successor node of the `head` node has been awakened.
- The status of the `head` node is `0`: indicating the existence of concurrency. You need to change `0` to `PROPAGATE` to ensure that the thread can be woken up normally in a concurrent scenario.

#### Why is `PROPAGATE` status needed?

When `doReleaseShared()` releases resources, step 3 is not easy to understand, that is, if the state of the `head` node is found to be `0`, update the state of the `head` node from `0` to `PROPAGATE`.

In AQS, the `PROPAGATE` of the Node node is to deal with the problem of being unable to wake up the thread node that may occur in concurrent scenarios. `PROPAGATE` is only used once in the `doReleaseShared()` method.

**Next, through case analysis, why is `PROPAGATE` status needed? **

In shared mode, the method call chain for threads to acquire and release resources is as follows:

- The method call chain for threads to acquire resources is: `acquireShared() -> tryAcquireShared() -> Thread blocks and waits for wake-up -> tryAcquireShared() -> setHeadAndPropagate() -> if (number of remaining resources > 0) || (head.waitStatus < 0) then wake up subsequent nodes`.

- The method call chain for a thread to release resources is: `releaseShared() -> tryReleaseShared() -> doReleaseShared()`.

**If the status of the `head` node is not changed from `0` to `PROPAGATE` when releasing resources:**

Assume a total of 4 threads try to acquire a resource in shared mode, for a total of 2 resources. The initial `T3` ​​and `T4` threads obtained the resource, but the `T1` and `T2` threads did not, so they were queued and waiting in the queue.

- At time 1, threads `T1` and `T2` are in the waiting queue, and `T3` ​​and `T4` hold resources. At this time, the nodes in the waiting queue and the corresponding status are (the `waitStatus` status of the node is in parentheses):

  `head(-1) -> T1(-1) -> T2(0)` .

- At time 2, thread `T3` ​​releases resources, updates the status of the `head` node from `SIGNAL` to `0` through the `doReleaseShared()` method, and wakes up thread `T1`, after which thread `T3` ​​exits.

  After thread `T1` is awakened, it obtains resources through `tryAcquireShared()`, but it has not yet had time to execute `setHeadAndPropagate()` to set itself as the `head` node. At this time, the status of the nodes in the waiting queue is:

  `head(0) -> T1(-1) -> T2(0)` .

- At time 3, thread `T4` releases resources. Since the status of `head` node is `0` at this time, the successor node of `head` cannot be awakened in the `doReleaseShared()` method, and then thread `T4` exits.

- At time 4, thread `T1` continues to execute the `setHeadAndPropagate()` method to set itself as the `head` node.

  But at this time, because the number of remaining resources returned by thread `T1` when executing the `tryAcquireShared()` method is `0`, and the status of the `head` node is `0`, thread `T1` will not wake up subsequent nodes in the `setHeadAndPropagate()` method. At this time, the status of the nodes in the waiting queue is:

  `head(-1, thread T1 node) -> T2(0)`.At this time, the thread `T2` node is in the waiting queue and cannot be awakened. The corresponding timetable is as follows:

| Time | Thread T1 | Thread T2 | Thread T3 | Thread T4 | Wait queue |
| ------ | ------------------------------------------------------------------ | -------- | ---------------- | ------------------------------------------------------------------ | ---------------------------------- |
| Time 1 | Waiting queue | Waiting queue | Holding resources | Holding resources | `head(-1) -> T1(-1) -> T2(0)` |
| Time 2 | (Execution) After being awakened, obtain resources, but will not have time to set itself as the `head` node | Waiting queue | (Execution) release resources | Hold resources | `head(0) -> T1(-1) -> T2(0)` |
| Time 3 | | Waiting queue | Exited | (Execute) Release resources. But the `head` node status is `0` and the successor node cannot be awakened | `head(0) -> T1(-1) -> T2(0)` |
| Time 4 | (Execution) Set self to `head` node | Waiting queue | Exited | Exited | `head(-1, thread T1 node) -> T2(0)` |

**If you change the status of the `head` node from `0` to `PROPAGATE` when the thread releases resources, you can solve the concurrency problem above, as follows: **

- At time 1, threads `T1` and `T2` are in the waiting queue, and `T3` and `T4` hold resources. At this time, the nodes in the waiting queue and their corresponding status are:

  `head(-1) -> T1(-1) -> T2(0)` .

- At time 2, thread `T3` ​​releases resources, updates the status of the `head` node from `SIGNAL` to `0` through the `doReleaseShared()` method, and wakes up thread `T1`, after which thread `T3` ​​exits.

  After thread `T1` is awakened, it obtains resources through `tryAcquireShared()`, but it has not yet had time to execute `setHeadAndPropagate()` to set itself as the `head` node. At this time, the status of the nodes in the waiting queue is:

  `head(0) -> T1(-1) -> T2(0)` .

- At time 3, thread `T4` releases resources. Since the status of `head` node is `0` at this time, the `doReleaseShared()` method will update the status of `head` node from `0` to `PROPAGATE`, and then thread `T4` exits. At this time, the status of the nodes in the waiting queue is:

  `head(PROPAGATE) -> T1(-1) -> T2(0)` .

- At time 4, thread `T1` continues to execute the `setHeadAndPropagate()` method to set itself as the `head` node. At this time, the status of the nodes in the waiting queue is:

  `head(-1, thread T1 node) -> T2(0)`.

- At time 5, although the number of remaining resources returned by thread `T1` when executing the `tryAcquireShared()` method is `0`, the `head` node status is `PROPAGATE < 0` (the `head` node here is the old `head` node, not the thread `T1` node that has just become the `head` node).

  Therefore, thread `T1` will wake up the subsequent `T2` node in the `setHeadAndPropagate()` method and update the status of the `head` node from `SIGNAL` to `0`. At this time, the status of the nodes in the waiting queue is:

  `head(0, thread T1 node) -> T2(0)`.

- At time 6, after thread `T2` is awakened, it obtains the resource and sets itself as the `head` node. At this time, the status of the nodes in the waiting queue is:

  `head(0, thread T2 node)` .

With the `PROPAGATE` state, you can avoid the situation where thread `T2` cannot be awakened. The corresponding timetable is as follows:

| Time | Thread T1 | Thread T2 | Thread T3 | Thread T4 | Wait queue |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------- |
| Time 1 | Waiting queue | Waiting queue | Holding resources | Holding resources | `head(-1) -> T1(-1) -> T2(0)` |
| Time 2 | (Execution) After being awakened, obtain resources, but will not have time to set itself as the `head` node | Waiting queue | (Execution) release resources | Hold resources | `head(0) -> T1(-1) -> T2(0)` || Time 3 | No further execution | Waiting queue | Exited | (Execution) Release resources. At this time, the `head` node status will be updated from `0` to `PROPAGATE` | `head(PROPAGATE) -> T1(-1) -> T2(0)` |
| Time 4 | (Execution) Set self to `head` node | Waiting queue | Exited | Exited | `head(-1, thread T1 node) -> T2(0)` |
| Time 5 | (Execution) Since the `head` node status is `PROPAGATE < 0`, subsequent nodes will be awakened in the `setHeadAndPropagate()` method. At this time, the state of the new `head` node will be updated from `SIGNAL` to `0`, and thread `T2` will be awakened | Waiting queue | Exited | Exited | `head(0, thread T1 node) -> T2(0)` |
| Time 6 | Exited | After the (execution) thread `T2` is awakened, it obtains the resource and sets itself as the `head` node | Exited | Exited | `head(0, thread T2 node)` |

### AQS resource release source code analysis (shared mode)

The entry method to release resources in shared mode in AQS is `releaseShared()`, and the code is as follows:

```JAVA
// AQS
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```

The `tryReleaseShared()` method is a template method provided by AQS. It is also explained here using `Semaphore`, as follows:

```JAVA
// Semaphore
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        if (compareAndSetState(current, next))
            return true;
    }
}
```

In the `tryReleaseShared()` method implemented by `Semaphore`, it will continuously try to release resources in an infinite loop, that is, update the `state` value through the `CAS` operation.

If the update is successful, it proves that the resource is released successfully and the `doReleaseShared()` method will be entered.

The `doReleaseShared()` method has undergone detailed source code analysis in the previous part of obtaining resources (shared mode) and will not be repeated here.

## Common synchronization tools

The following introduces several common synchronization tool classes based on AQS.

### Semaphore(Semaphore)

#### Introduction

Both `synchronized` and `ReentrantLock` allow only one thread to access a certain resource at a time, and `Semaphore` (semaphore) can be used to control the number of threads accessing a specific resource at the same time.

The use of `Semaphore` is simple. We assume here that there are `N(N>5)` threads to obtain the shared resources in `Semaphore`. The following code indicates that only 5 threads among the N threads can obtain the shared resources at the same time, and other threads will be blocked. Only the thread that obtains the shared resources can execute. Wait until a thread releases the shared resource before other blocked threads can obtain it.

```java
//Initial number of shared resources
final Semaphore semaphore = new Semaphore(5);
// Get 1 license
semaphore.acquire();
// Release 1 license
semaphore.release();
```

When the initial number of resources is 1, `Semaphore` degenerates into an exclusive lock.

`Semaphore` has two modes:.

- **Fair mode:** The order in which the `acquire()` method is called is the order in which licenses are obtained, following FIFO;
- **Unfair Mode:** Preemptive.

The two construction methods corresponding to `Semaphore` are as follows:

```java
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

**Both of these two construction methods must provide the number of permissions. The second construction method can specify whether it is fair mode or unfair mode. The default is unfair mode. **

`Semaphore` is usually used in scenarios where resources have clear limits on the number of accesses, such as current limiting (only in stand-alone mode, it is recommended to use Redis + Lua for current limiting in actual projects).

#### Principle

`Semaphore` is an implementation of shared locks. It constructs the `state` value of AQS by default as `permits`. You can understand the value of `permits` as the number of licenses. Only threads that have obtained the license can execute.

Taking the parameterless `acquire` method as an example, calling `semaphore.acquire()`, the thread tries to obtain the license. If `state > 0`, it means that the acquisition can be successful. If `state <= 0`, it means that the number of licenses is insufficient and the acquisition fails.

If it can be obtained successfully (`state > 0`), it will try to use the CAS operation to modify the value of `state` to `state=state-1`. If the acquisition fails, a Node node will be created and added to the waiting queue, and the current thread will be suspended.

```java
// Get 1 license
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

// Get one or more licenses
public void acquire(int permits) throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireSharedInterruptibly(permits);
}
```

The `acquireSharedInterruptibly` method is the default implementation in `AbstractQueuedSynchronizer`.

```java
// Obtain the license in shared mode. If the acquisition is successful, it will be returned. If it fails, it will be added to the waiting queue and the thread will be suspended.
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        //Try to obtain the license. arg is the number of licenses to obtain. When the acquisition fails, create a node and add it to the waiting queue, suspending the current thread.
    if (tryAcquireShared(arg) < 0)
      doAcquireSharedInterruptibly(arg);
}```

Here we take the non-fair mode (`NonfairSync`) as an example to see the implementation of the `tryAcquireShared` method.

```java
// Try to obtain resources in shared mode (resources in Semaphore are licenses):
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Obtain license in unfair sharing mode
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        //The current number of available licenses
        int available = getState();
        /*
         * Try to obtain a license. When the current number of available licenses is less than or equal to 0, a negative value is returned, indicating that the acquisition failed.
         * Successful acquisition is possible only when the current available license is greater than 0. If CAS fails, it will re-acquire the latest value in a loop and try to obtain it.
         */
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

Taking the parameterless `release` method as an example, calling `semaphore.release();`, the thread tries to release the license and uses the CAS operation to modify the value of `state` to `state=state+1`. After the license is released successfully, a thread in the waiting queue will be awakened at the same time. The awakened thread will retry to modify the value of `state` `state=state-1`. If `state > 0`, the token is obtained successfully, otherwise it will re-enter the waiting queue and suspend the thread.

```java
// Release a license
public void release() {
    sync.releaseShared(1);
}

// Release one or more licenses
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}
```

The `releaseShared` method is the default implementation in `AbstractQueuedSynchronizer`.

```java
// Release shared lock
// If tryReleaseShared returns true, wake up one or more threads in the waiting queue.
public final boolean releaseShared(int arg) {
    //Release shared lock
    if (tryReleaseShared(arg)) {
      //Release the current node's post-waiting node
      doReleaseShared();
      return true;
    }
    return false;
}
```

The `tryReleaseShared` method is a method overridden by the internal class `Sync` of `Semaphore`. The default implementation in `AbstractQueuedSynchronizer` only throws the `UnsupportedOperationException` exception.

```java
//A method overridden in the inner class Sync
//Try to release resources
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        // Available licenses +1
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
         // CAS modifies the value of state
        if (compareAndSetState(current, next))
            return true;
    }
}
```

As you can see, the underlying methods mentioned above are basically implemented through the synchronizer `sync`. `Sync` is an internal class of `CountDownLatch`, inherits `AbstractQueuedSynchronizer` and overrides some of its methods. Moreover, Sync corresponds to two subclasses: `NonfairSync` (corresponding to unfair mode) and `FairSync` (corresponding to fair mode).

```java
private static final class Sync extends AbstractQueuedSynchronizer {
  // ...
}
static final class NonfairSync extends Sync {
  // ...
}
static final class FairSync extends Sync {
  // ...
}
```

#### Actual combat

```java
public class SemaphoreExample {
  //Number of requests
  private static final int threadCount = 550;

  public static void main(String[] args) throws InterruptedException {
    //Create a thread pool object with a fixed number of threads (if the number of threads in the thread pool here is too small, you will find that the execution is very slow)
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    //Initial license quantity
    final Semaphore semaphore = new Semaphore(20);

    for (int i = 0; i < threadCount; i++) {
      final int threadnum = i;
      threadPool.execute(() -> {// Application of Lambda expression
        try {
          semaphore.acquire();//Acquire a license, so the number of runnable threads is 20/1=20
          test(threadnum);
          semaphore.release(); // Release a license
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }

      });
    }
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000); // Simulate the time-consuming operation of the request
    System.out.println("threadnum:" + threadnum);
    Thread.sleep(1000); // Simulate the time-consuming operation of the request
  }
}
```

Execution of the `acquire()` method blocks until a license can be obtained and then takes a license; each `release` method adds a license, which may release a blocked `acquire()` method. However, there is no actual license object, `Semaphore` just maintains a number of available licenses. `Semaphore` is often used to limit the number of threads that can obtain a certain resource.

Of course, you can also take and release multiple licenses at once, but this is generally not necessary:

```java
semaphore.acquire(5);//Acquire 5 licenses, so the number of runnable threads is 20/5=4
test(threadnum);
semaphore.release(5);//Release 5 licenses
```

In addition to the `acquire()` method, another commonly used corresponding method is the `tryAcquire()` method, which returns false immediately if the permission cannot be obtained.

[Supplementary content for issue645](https://github.com/Snailclimb/JavaGuide/issues/645):> `Semaphore` is implemented based on AQS and is used to control the number of threads for concurrent access, but it is different from the concept of shared locks. The constructor of `Semaphore` uses the `permits` parameter to initialize the AQS `state` variable, which represents the number of available licenses. When a thread calls the `acquire()` method to try to acquire a permission, `state` is atomically decremented by 1. If `state` is greater than or equal to 0 after being decremented by 1, `acquire()` returns successfully and the thread can continue execution. If `state` is less than 0 after decremented by 1, it means that the number of threads currently accessing concurrently has reached the `permits` limit, and the thread will be put into the AQS waiting queue and blocked, **instead of spinning and waiting**. When other threads complete their tasks and call the `release()` method, `state` is atomically incremented by 1. The `release()` operation wakes up one or more blocked threads in the AQS wait queue. These awakened threads will attempt the `acquire()` operation again, competing for available permissions. Therefore, `Semaphore` limits the number of concurrently accessed threads by controlling the number of permissions, rather than through spin and shared lock mechanisms.

### CountDownLatch (countdown timer)

#### Introduction

`CountDownLatch` allows `count` threads to block in one place until all threads' tasks are completed.

`CountDownLatch` is one-time use. The value of the counter can only be initialized once in the constructor. There is no mechanism to set its value again afterwards. When `CountDownLatch` is used, it cannot be used again.

#### Principle

`CountDownLatch` is an implementation of shared locks. It constructs the `state` value of AQS by default as `count`. We can see this through the constructor of `CountDownLatch`.

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}

private static final class Sync extends AbstractQueuedSynchronizer {
    Sync(int count) {
        setState(count);
    }
  //...
}
```

When the thread calls `countDown()`, it actually uses the `tryReleaseShared` method to reduce `state` with CAS operations until `state` is 0. When `state` is 0, it means that all threads have called the `countDown` method, then the threads waiting on `CountDownLatch` will be awakened and continue execution.

```java
public void countDown() {
    // Sync is the internal class of CountDownLatch, which inherits AbstractQueuedSynchronizer
    sync.releaseShared(1);
}
```

The `releaseShared` method is the default implementation in `AbstractQueuedSynchronizer`.

```java
// Release shared lock
// If tryReleaseShared returns true, wake up one or more threads in the waiting queue.
public final boolean releaseShared(int arg) {
    //Release shared lock
    if (tryReleaseShared(arg)) {
      //Release the current node's post-waiting node
      doReleaseShared();
      return true;
    }
    return false;
}
```

The `tryReleaseShared` method is a method overridden by the inner class `Sync` of `CountDownLatch`. The default implementation in `AbstractQueuedSynchronizer` only throws the `UnsupportedOperationException` exception.

```java
// Decrement state until state becomes 0;
// countDown will return true only when count decrements to 0
protected boolean tryReleaseShared(int releases) {
    // Optional check whether state is 0
    for (;;) {
        int c = getState();
        // If state is already 0, return false directly
        if(c==0)
            return false;
        // Decrement state
        int nextc = c-1;
        //CAS operation updates the value of state
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```

Take the parameterless `await` method as an example. When calling `await()`, if `state` is not 0, it means that the task has not been executed yet, and `await()` will always block, which means that the statements after `await()` will not be executed (the `main` thread is added to the waiting queue, which is the variant CLH queue). Then, `CountDownLatch` will spin CAS to determine `state == 0`. If `state == 0`, all waiting threads will be released, and the statements after the `await()` method will be executed.

```java
// Wait (can also be called locking)
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
// Wait with timeout
public boolean await(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

The `acquireSharedInterruptibly` method is the default implementation in `AbstractQueuedSynchronizer`.

```java
//Try to acquire the lock, return if successful, join the waiting queue if failed, and suspend the thread
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        //Try to acquire the lock and return if successful.
    if (tryAcquireShared(arg) < 0)
      // If the acquisition fails, join the waiting queue and suspend the thread.
      doAcquireSharedInterruptibly(arg);
}
```

The `tryAcquireShared` method is a method overridden by the internal class `Sync` of `CountDownLatch`. Its function is to determine whether the value of `state` is 0. If so, it returns 1, otherwise it returns -1.

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

#### Actual combat

**Two typical uses of CountDownLatch**:

1. A thread waits for n threads to complete execution before starting to run: Initialize the counter of `CountDownLatch` to n (`new CountDownLatch(n)`). Whenever a task thread completes execution, decrement the counter by 1 (`countdownlatch.countDown()`). When the counter value becomes 0, the thread await()` on `CountDownLatch` will be awakened. A typical application scenario is that when starting a service, the main thread needs to wait for multiple components to be loaded before continuing execution.
2. Achieve maximum parallelism for multiple threads to start executing tasks: Note that it is parallelism, not concurrency. The emphasis is that multiple threads start executing at the same time at a certain moment. Similar to a race, multiple threads are placed at the starting point, wait for the starting gun to sound, and then start running at the same time. The method is to initialize a shared `CountDownLatch` object and initialize its counter to 1 (`new CountDownLatch(1)`). Multiple threads first `coundownlatch.await()` before starting to execute the task. When the main thread calls `countDown()`, the counter becomes 0 and multiple threads are awakened at the same time.

**CountDownLatch code example**:

```java
public class CountDownLatchExample {
  //Number of requests
  private static final int THREAD_COUNT = 550;

  public static void main(String[] args) throws InterruptedException {
    //Create a thread pool object with a fixed number of threads (if the number of threads in the thread pool here is too small, you will find that the execution is very slow)
    // This is only used for testing. In actual scenarios, please manually assign thread pool parameters.
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    final CountDownLatch countDownLatch = new CountDownLatch(THREAD_COUNT);
    for (int i = 0; i < THREAD_COUNT; i++) {
      final int threadNum = i;
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          e.printStackTrace();
        } finally {
          // Indicates that a request has been completed
          countDownLatch.countDown();
        }

      });
    }
    countDownLatch.await();
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000);
    System.out.println("threadNum:" + threadnum);
    Thread.sleep(1000);
  }
}```

In the above code, we define the number of requests as 550. When these 550 requests are processed, `System.out.println("finish");` will be executed.

The first interaction with `CountDownLatch` is the main thread waiting for other threads. The main thread must call the `CountDownLatch.await()` method immediately after starting other threads. In this way, the operation of the main thread will block on this method until other threads complete their respective tasks.

The other N threads must reference the latch object because they need to notify the `CountDownLatch` object that they have completed their respective tasks. This notification mechanism is accomplished through the `CountDownLatch.countDown()` method; each time this method is called, the count value initialized in the constructor is decremented by 1. So when N threads all call this method, the value of count is equal to 0, and then the main thread can resume executing its own tasks through the `await()` method.

One more comment: Improper use of the `await()` method of `CountDownLatch` can easily cause deadlock. For example, the for loop in our code above is changed to:

```java
for (int i = 0; i < threadCount-1; i++) {
.......
}
```

This will result in the value of `count` being unable to be equal to 0, which will result in waiting forever.

### CyclicBarrier(Cyclic Barrier)

#### Introduction

`CyclicBarrier` is very similar to `CountDownLatch`. It can also implement technical waiting between threads, but its function is more complex and powerful than `CountDownLatch`. The main application scenarios are similar to `CountDownLatch`.

> The implementation of `CountDownLatch` is based on AQS, while `CyclicBarrier` is based on `ReentrantLock` (`ReentrantLock` also belongs to the AQS synchronizer) and `Condition`.

`CyclicBarrier` literally means cyclic barrier. What it does is: let a group of threads be blocked when they reach a barrier (also called a synchronization point). The barrier will not open until the last thread reaches the barrier, and all threads intercepted by the barrier will continue to work.

#### Principle

`CyclicBarrier` internally uses a `count` variable as a counter. The initial value of `count` is the initialization value of the `parties` attribute. Whenever a thread reaches the barrier, the counter is decremented by 1. If the count value is 0, it means that this is the last thread of this generation to reach the fence, and it will try to execute the task entered in our constructor.

```java
//The number of threads intercepted each time
private final int parties;
//Counter
private int count;
```

Let’s take a brief look at the source code below.

1. The default constructor of `CyclicBarrier` is `CyclicBarrier(int parties)`, whose parameters represent the number of threads intercepted by the barrier. Each thread calls the `await()` method to tell `CyclicBarrier` that I have reached the barrier, and then the current thread is blocked.

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
            // count minus 1
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
    }```

#### 实战

示例 1：

```java
public class CyclicBarrierExample1 {
  // 请求的数量
  private static final int threadCount = 550;
  // 需要同步的线程数量
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5);

  public static void main(String[] args) throws InterruptedException {
    // 创建线程池
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    try {
      /**等待60秒，保证子线程完全执行结束*/
      cyclicBarrier.await(60, TimeUnit.SECONDS);
    } catch (Exception e) {
      System.out.println("-----CyclicBarrierException------");
    }
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

运行结果，如下：

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
threadnum:4is finish
threadnum:0is finish
threadnum:1is finish
threadnum:2is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
threadnum:9is finish
threadnum:5is finish
threadnum:8is finish
threadnum:7is finish
threadnum:6is finish
......
```

可以看到当线程数量也就是请求数量达到我们定义的 5 个的时候， `await()` 方法之后的方法才被执行。

另外，`CyclicBarrier` 还提供一个更高级的构造函数 `CyclicBarrier(int parties, Runnable barrierAction)`，用于在线程到达屏障时，优先执行 `barrierAction`，方便处理更复杂的业务场景。

示例 2：

```java
public class CyclicBarrierExample2 {
  // 请求的数量
  private static final int threadCount = 550;
  // 需要同步的线程数量
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5, () -> {
    System.out.println("------当线程数达到之后，优先执行------");
  });

  public static void main(String[] args) throws InterruptedException {
    // 创建线程池
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    cyclicBarrier.await();
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

运行结果，如下：

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
------当线程数达到之后，优先执行------
threadnum:4is finish
threadnum:0is finish
threadnum:2is finish
threadnum:1is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
------当线程数达到之后，优先执行------
threadnum:9is finish
threadnum:5is finish
threadnum:6is finish
threadnum:8is finish
threadnum:7is finish
......
```

## 参考

- Java 并发之 AQS 详解：<https://www.cnblogs.com/waterystone/p/4920797.html>
- 从 ReentrantLock 的实现看 AQS 的原理及应用：<https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>

<!-- @include: @article-footer.snippet.md -->