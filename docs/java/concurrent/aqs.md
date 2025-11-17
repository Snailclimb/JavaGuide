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

**什么是钩子方法呢？** 钩子方法是一种被声明在抽象类中的方法，一般使用 `protected` 关键字修饰，它可以是空方法（由子类实现），也可以是默认实现的方法。模板设计模式通过钩子方法控制固定步骤的实现。

篇幅问题，这里就不详细介绍模板方法模式了，不太了解的小伙伴可以看看这篇文章：[用 Java8 改造后的模板方法模式真的是 yyds!](https://mp.weixin.qq.com/s/zpScSCktFpnSWHWIQem2jg)。

除了上面提到的钩子方法之外，AQS 类中的其他方法都是 `final` ，所以无法被其他类重写。

### AQS 资源共享方式

AQS 定义两种资源共享方式：`Exclusive`（独占，只有一个线程能执行，如`ReentrantLock`）和`Share`（共享，多个线程可同时执行，如`Semaphore`/`CountDownLatch`）。

一般来说，自定义同步器的共享方式要么是独占，要么是共享，他们也只需实现`tryAcquire-tryRelease`、`tryAcquireShared-tryReleaseShared`中的一种即可。但 AQS 也支持自定义同步器同时实现独占和共享两种方式，如`ReentrantReadWriteLock`。

### AQS 资源获取源码分析（独占模式）

AQS 中以独占模式获取资源的入口方法是 `acquire()` ，如下：

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

在 `acquire()` 中，线程会先尝试获取共享资源；如果获取失败，会将线程封装为 Node 节点加入到 AQS 的等待队列中；加入队列之后，会让等待队列中的线程尝试获取资源，并且会对线程进行阻塞操作。分别对应以下三个方法：

- `tryAcquire()` ：尝试获取锁（模板方法），`AQS` 不提供具体实现，由子类实现。
- `addWaiter()` ：如果获取锁失败，会将当前线程封装为 Node 节点加入到 AQS 的 CLH 变体队列中等待获取锁。
- `acquireQueued()` ：对线程进行阻塞，并调用 `tryAcquire()` 方法让队列中的线程尝试获取锁。

#### `tryAcquire()` 分析

AQS 中对应的 `tryAcquire()` 模板方法如下：

```JAVA
// AQS
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

`tryAcquire()` 方法是 AQS 提供的模板方法，不提供默认实现。

因此，这里分析 `tryAcquire()` 方法时，以 `ReentrantLock` 的非公平锁（独占锁）为例进行分析，`ReentrantLock` 内部实现的 `tryAcquire()` 会调用到下边的 `nonfairTryAcquire()` ：

```JAVA
// ReentrantLock
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // 1、获取 AQS 中的 state 状态
    int c = getState();
    // 2、如果 state 为 0，证明锁没有被其他线程占用
    if (c == 0) {
        // 2.1、通过 CAS 对 state 进行更新
        if (compareAndSetState(0, acquires)) {
            // 2.2、如果 CAS 更新成功，就将锁的持有者设置为当前线程
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 3、如果当前线程和锁的持有线程相同，说明发生了「锁的重入」
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        // 3.1、将锁的重入次数加 1
        setState(nextc);
        return true;
    }
    // 4、如果锁被其他线程占用，就返回 false，表示获取锁失败
    return false;
}
```

在 `nonfairTryAcquire()` 方法内部，主要通过两个核心操作去完成资源的获取：

- 通过 `CAS` 更新 `state` 变量。`state == 0` 表示资源没有被占用。`state > 0` 表示资源被占用，此时 `state` 表示重入次数。
- 通过 `setExclusiveOwnerThread()` 设置持有资源的线程。

如果线程更新 `state` 变量成功，就表明获取到了资源， 因此将持有资源的线程设置为当前线程即可。

#### `addWaiter()` 分析

在通过 `tryAcquire()` 方法尝试获取资源失败之后，会调用 `addWaiter()` 方法将当前线程封装为 Node 节点加入 `AQS` 内部的队列中。`addWaite()` 代码如下：

```JAVA
// AQS
private Node addWaiter(Node mode) {
    // 1、将当前线程封装为 Node 节点。
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 2、如果 pred ！= null，则证明 tail 节点已经被初始化，直接将 Node 节点加入队列即可。
    if (pred != null) {
        node.prev = pred;
        // 2.1、通过 CAS 控制并发安全。
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    // 3、初始化队列，并将新创建的 Node 节点加入队列。
    enq(node);
    return node;
}
```

**节点入队的并发安全：**

在 `addWaiter()` 方法中，需要执行 Node 节点 **入队** 的操作。由于是在多线程环境下，因此需要通过 `CAS` 操作保证并发安全。

通过 `CAS` 操作去更新 `tail` 指针指向新入队的 Node 节点，`CAS` 可以保证只有一个线程会成功修改 `tail` 指针，以此来保证 Node 节点入队时的并发安全。

**AQS 内部队列的初始化：**

在执行 `addWaiter()` 时，如果发现 `pred == null` ，即 `tail` 指针为 null，则证明队列没有初始化，需要调用 `enq()` 方法初始化队列，并将 `Node` 节点加入到初始化后的队列中，代码如下：

```JAVA
// AQS
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        if (t == null) {
            // 1、通过 CAS 操作保证队列初始化的并发安全
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 2、与 addWaiter() 方法中节点入队的操作相同
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

在 `enq()` 方法中初始化队列，在初始化过程中，也需要通过 `CAS` 来保证并发安全。

初始化队列总共包含两个步骤：初始化 `head` 节点、`tail` 指向 `head` 节点。

**初始化后的队列如下图所示：**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-init.png)

#### `acquireQueued()` 分析

为了方便阅读，这里再贴一下 `AQS` 中 `acquire()` 获取资源的代码：

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

在 `acquire()` 方法中，通过 `addWaiter()` 方法将 `Node` 节点加入队列之后，就会调用 `acquireQueued()` 方法。代码如下：

```JAVA
// AQS：令队列中的节点尝试获取锁，并且对线程进行阻塞。
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 1、尝试获取锁。
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 2、判断线程是否可以阻塞，如果可以，则阻塞当前线程。
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3、如果获取锁失败，就会取消获取锁，将节点状态更新为 CANCELLED。
        if (failed)
            cancelAcquire(node);
    }
}
```

在 `acquireQueued()` 方法中，主要做两件事情：

- **尝试获取资源：** 当前线程加入队列之后，如果发现前继节点是 `head` 节点，说明当前线程是队列中第一个等待的节点，于是调用 `tryAcquire()` 尝试获取资源。

- **阻塞当前线程** ：如果尝试获取资源失败，就需要阻塞当前线程，等待被唤醒之后获取资源。

**1、尝试获取资源**

在 `acquireQueued()` 方法中，尝试获取资源总共有 2 个步骤：

- `p == head` ：表明当前节点的前继节点为 `head` 节点。此时当前节点为 AQS 队列中的第一个等待节点。
- `tryAcquire(arg) == true` ：表明当前线程尝试获取资源成功。

在成功获取资源之后，就需要将当前线程的节点 **从等待队列中移除** 。移除操作为：将当前等待的线程节点设置为 `head` 节点（`head` 节点是虚拟节点，并不参与排队获取资源）。

**2、阻塞当前线程**

在 `AQS` 中，当前节点的唤醒需要依赖于上一个节点。如果上一个节点取消获取锁，它的状态就会变为 `CANCELLED` ，`CANCELLED` 状态的节点没有获取到锁，也就无法执行解锁操作对当前节点进行唤醒。因此在阻塞当前线程之前，需要跳过 `CANCELLED` 状态的节点。

通过 `shouldParkAfterFailedAcquire()` 方法来判断当前线程节点是否可以阻塞，如下：

```JAVA
// AQS：判断当前线程节点是否可以阻塞。
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    // 1、前继节点状态正常，直接返回 true 即可。
    if (ws == Node.SIGNAL)
        return true;
    // 2、ws > 0 表示前继节点的状态异常，即为 CANCELLED 状态，需要跳过异常状态的节点。
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        // 3、如果前继节点的状态不是 SIGNAL，也不是 CANCELLED，就将状态设置为 SIGNAL。
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}
```

`shouldParkAfterFailedAcquire()` 方法中的判断逻辑：

- 如果发现前继节点的状态是 `SIGNAL` ，则可以阻塞当前线程。
- 如果发现前继节点的状态是 `CANCELLED` ，则需要跳过 `CANCELLED` 状态的节点。
- 如果发现前继节点的状态不是 `SIGNAL` 和 `CANCELLED` ，表明前继节点的状态处于正常等待资源的状态，因此将前继节点的状态设置为 `SIGNAL` ，表明该前继节点需要对后续节点进行唤醒。

当判断当前线程可以阻塞之后，通过调用 `parkAndCheckInterrupt()` 方法来阻塞当前线程。内部使用了 `LockSupport` 来实现阻塞。`LockSupoprt` 底层是基于 `Unsafe` 类来阻塞线程，代码如下：

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    // 1、线程阻塞到这里
    LockSupport.park(this);
    // 2、线程被唤醒之后，返回线程中断状态
    return Thread.interrupted();
}
```

**为什么在线程被唤醒之后，要返回线程的中断状态呢？**

在 `parkAndCheckInterrupt()` 方法中，当执行完 `LockSupport.park(this)` ，线程会被阻塞，代码如下：

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    // 线程被唤醒之后，需要返回线程中断状态
    return Thread.interrupted();
}
```

当线程被唤醒之后，需要执行 `Thread.interrupted()` 来返回线程的中断状态，这是为什么呢？

这个和线程的中断协作机制有关系，线程被唤醒之后，并不确定是被中断唤醒，还是被 `LockSupport.unpark()` 唤醒，因此需要通过线程的中断状态来判断。

**在 `acquire()` 方法中，为什么需要调用 `selfInterrupt()` ？**

`acquire()` 方法代码如下：

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

在 `acquire()` 方法中，当 `if` 语句的条件返回 `true` 后，就会调用 `selfInterrupt()` ，该方法会中断当前线程，为什么需要中断当前线程呢？

当 `if` 判断为 `true` 时，需要 `tryAcquire()` 返回 `false` ，并且 `acquireQueued()` 返回 `true` 。

其中 `acquireQueued()` 方法返回的是线程被唤醒之后的 **中断状态** ，通过执行 `Thread.interrupted()` 来返回。该方法在返回中断状态的同时，会清除线程的中断状态。

因此如果 `if` 判断为 `true` ，表明线程的中断状态为 `true` ，但是调用 `Thread.interrupted()` 之后，线程的中断状态被清除为 `false` ，因此需要重新执行 `selfInterrupt()` 来重新设置线程的中断状态。

### AQS 资源释放源码分析（独占模式）

AQS 中以独占模式释放资源的入口方法是 `release()` ，代码如下：

```JAVA
// AQS
public final boolean release(int arg) {
    // 1、尝试释放锁
    if (tryRelease(arg)) {
        Node h = head;
        // 2、唤醒后继节点
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

在 `release()` 方法中，主要做两件事：尝试释放锁和唤醒后继节点。对应方法如下：

**1、尝试释放锁**

通过 `tryRelease()` 方法尝试释放锁，该方法为模板方法，由自定义同步器实现，因此这里仍然以 `ReentrantLock` 为例来讲解。

`ReentrantLock` 中实现的 `tryRelease()` 方法如下：

```JAVA
// ReentrantLock
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    // 1、判断持有锁的线程是否为当前线程
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 2、如果 state 为 0，则表明当前线程已经没有重入次数。因此将 free 更新为 true，表明该线程会释放锁。
    if (c == 0) {
        free = true;
        // 3、更新持有资源的线程为 null
        setExclusiveOwnerThread(null);
    }
    // 4、更新 state 值
    setState(c);
    return free;
}
```

在 `tryRelease()` 方法中，会先计算释放锁之后的 `state` 值，判断 `state` 值是否为 0。

- 如果 `state == 0` ，表明该线程没有重入次数了，更新 `free = true` ，并修改持有资源的线程为 null，表明该线程完全释放这把锁。
- 如果 `state != 0` ，表明该线程还存在重入次数，因此不更新 `free` 值，`free` 值为 `false` 表明该线程没有完全释放这把锁。

之后更新 `state` 值，并返回 `free` 值，`free` 值表明线程是否完全释放锁。

**2、唤醒后继节点**

如果 `tryRelease()` 返回 `true` ，表明线程已经没有重入次数了，锁已经被完全释放，因此需要唤醒后继节点。

在唤醒后继节点之前，需要判断是否可以唤醒后继节点，判断条件为： `h != null && h.waitStatus != 0` 。这里解释一下为什么要这样判断：

- `h == null` ：表明 `head` 节点还没有被初始化，也就是 AQS 中的队列没有被初始化，因此无法唤醒队列中的线程节点。
- `h != null && h.waitStatus == 0` ：表明头节点刚刚初始化完毕（节点的初始化状态为 0），后继节点线程还没有成功入队，因此不需要对后续节点进行唤醒。（当后继节点入队之后，会将前继节点的状态修改为 `SIGNAL` ，表明需要对后继节点进行唤醒）
- `h != null && h.waitStatus != 0` ：其中 `waitStatus` 有可能大于 0，也有可能小于 0。其中 `> 0` 表明节点已经取消等待获取资源，`< 0` 表明节点处于正常等待状态。

接下来进入 `unparkSuccessor()` 方法查看如何唤醒后继节点：

```JAVA
// AQS：这里的入参 node 为队列的头节点（虚拟头节点）
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    // 1、将头节点的状态进行清除，为后续的唤醒做准备。
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    // 2、如果后继节点异常，则需要从 tail 向前遍历，找到正常状态的节点进行唤醒。
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 3、唤醒后继节点
        LockSupport.unpark(s.thread);
}
```

在 `unparkSuccessor()` 中，如果头节点的状态 `< 0` （在正常情况下，只要有后继节点，头节点的状态应该为 `SIGNAL` ，即 -1），表示需要对后继节点进行唤醒，因此这里提前清除头节点的状态标识，将状态修改为 0，表示已经执行了对后续节点唤醒的操作。

如果 `s == null` 或者 `s.waitStatus > 0` ，表明后继节点异常，此时不能唤醒异常节点，而是要找到正常状态的节点进行唤醒。

因此需要从 `tail` 指针向前遍历，来找到第一个状态正常（`waitStatus <= 0`）的节点进行唤醒。

**为什么要从 `tail` 指针向前遍历，而不是从 `head` 指针向后遍历，寻找正常状态的节点呢？**

遍历的方向和 **节点的入队操作** 有关。入队方法如下：

```JAVA
// AQS：节点入队方法
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    if (pred != null) {
        // 1、先修改 prev 指针。
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            // 2、再修改 next 指针。
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

在 `addWaiter()` 方法中，`node` 节点入队需要修改 `node.prev` 和 `pred.next` 两个指针，但是这两个操作并不是 **原子操作** ，先修改了 `node.prev` 指针，之后才修改 `pred.next` 指针。

在极端情况下，可能会出现 `head` 节点的下一个节点状态为 `CANCELLED` ，此时新入队的节点仅更新了 `node.prev` 指针，还未更新 `pred.next` 指针，如下图：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-addWaiter.png)

这样如果从 `head` 指针向后遍历，无法找到新入队的节点，因此需要从 `tail` 指针向前遍历找到新入队的节点。

### 图解 AQS 工作原理（独占模式）

至此，AQS 中以独占模式获取资源、释放资源的源码就讲完了。为了对 AQS 的工作原理、节点状态变化有一个更加清晰的认识，接下来会通过画图的方式来了解整个 AQS 的工作原理。

由于 AQS 是底层同步工具，获取和释放资源的方法并没有提供具体实现，因此这里基于 `ReentrantLock` 来画图进行讲解。

假设总共有 3 个线程尝试获取锁，线程分别为 `T1` 、 `T2` 和 `T3` 。

此时，假设线程 `T1` 先获取到锁，线程 `T2` 排队等待获取锁。在线程 `T2` 进入队列之前，需要对 AQS 内部队列进行初始化。`head` 节点在初始化后状态为 `0` 。AQS 内部初始化后的队列如下图：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process.png)

此时，线程 `T2` 尝试获取锁。由于线程 `T1` 持有锁，因此线程 `T2` 会进入队列中等待获取锁。同时会将前继节点（ `head` 节点）的状态由 `0` 更新为 `SIGNAL` ，表示需要对 `head` 节点的后继节点进行唤醒。此时，AQS 内部队列如下图所示：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-2.png)

此时，线程 `T3` 尝试获取锁。由于线程 `T1` 持有锁，因此线程 `T3` 会进入队列中等待获取锁。同时会将前继节点（线程 `T2` 节点）的状态由 `0` 更新为 `SIGNAL` ，表示线程 `T2` 节点需要对后继节点进行唤醒。此时，AQS 内部队列如下图所示：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-3.png)

此时，假设线程 `T1` 释放锁，会唤醒后继节点 `T2` 。线程 `T2` 被唤醒后获取到锁，并且会从等待队列中退出。

这里线程 `T2` 节点退出等待队列并不是直接从队列移除，而是令线程 `T2` 节点成为新的 `head` 节点，以此来退出资源获取的等待。此时 AQS 内部队列如下所示：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-4.png)

此时，假设线程 `T2` 释放锁，会唤醒后继节点 `T3` 。线程 `T3` 获取到锁之后，同样也退出等待队列，即将线程 `T3` 节点变为 `head` 节点来退出资源获取的等待。此时 AQS 内部队列如下所示：

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-5.png)

### AQS 资源获取源码分析（共享模式）

AQS 中以共享模式获取资源的入口方法是 `acquireShared()` ，如下：

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

在 `acquireShared()` 方法中，会先尝试获取共享锁，如果获取失败，则将当前线程加入到队列中阻塞，等待唤醒后尝试获取共享锁，分别对应一下两个方法：`tryAcquireShared()` 和 `doAcquireShared()` 。

其中 `tryAcquireShared()` 方法是 AQS 提供的模板方法，由同步器来实现具体逻辑。因此这里以 `Semaphore` 为例，来分析共享模式下，如何获取资源。

#### `tryAcquireShared()` 分析

`Semaphore` 中实现了公平锁和非公平锁，接下来以非公平锁为例来分析 `tryAcquireShared()` 源码。

`Semaphore` 中重写的 `tryAcquireShared()` 方法会调用下边的 `nonfairTryAcquireShared()` 方法：

```JAVA
// Semaphore 重写 AQS 的模板方法
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Semaphore
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 1、获取可用资源数量。
        int available = getState();
        // 2、计算剩余资源数量。
        int remaining = available - acquires;
        // 3、如果剩余资源数量 < 0，则说明资源不足，直接返回；如果 CAS 更新 state 成功，则说明当前线程获取到了共享资源，直接返回。
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

在共享模式下，AQS 中的 `state` 值表示共享资源的数量。

在 `nonfairTryAcquireShared()` 方法中，会在死循环中不断尝试获取资源，如果 「剩余资源数不足」 或者 「当前线程成功获取资源」 ，就退出死循环。方法返回 **剩余的资源数量** ，根据返回值的不同，分为 3 种情况：

- **剩余资源数量 > 0** ：表示成功获取资源，并且后续的线程也可以成功获取资源。
- **剩余资源数量 = 0** ：表示成功获取资源，但是后续的线程无法成功获取资源。
- **剩余资源数量 < 0** ：表示获取资源失败。

#### `doAcquireShared()` 分析

为了方便阅读，这里再贴一下获取资源的入口方法 `acquireShared()` ：

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

在 `acquireShared()` 方法中，会先通过 `tryAcquireShared()` 尝试获取资源。

如果发现方法的返回值 `< 0` ，即剩余的资源数小于 0，则表明当前线程获取资源失败。因此会进入 `doAcquireShared()` 方法，将当前线程加入到 AQS 队列进行等待。如下：

```JAVA
// AQS
private void doAcquireShared(int arg) {
    // 1、将当前线程加入到队列中等待。
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 2、如果当前线程是等待队列的第一个节点，则尝试获取资源。
                int r = tryAcquireShared(arg);
                if (r >= 0) {
					// 3、将当前线程节点移出等待队列，并唤醒后续线程节点。
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
        // 3、如果获取资源失败，就会取消获取资源，将节点状态更新为 CANCELLED。
        if (failed)
            cancelAcquire(node);
    }
}
```

由于当前线程已经尝试获取资源失败了，因此在 `doAcquireShared()` 方法中，需要将当前线程封装为 Node 节点，加入到队列中进行等待。

以 **共享模式** 获取资源和 **独占模式** 获取资源最大的不同之处在于：共享模式下，资源的数量可能会大于 1，即可以多个线程同时持有资源。

因此在共享模式下，当线程线程被唤醒之后，获取到了资源，如果发现还存在剩余资源，就会尝试唤醒后边的线程去尝试获取资源。对应的 `setHeadAndPropagate()` 方法如下：

```JAVA
// AQS
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head;
    // 1、将当前线程节点移出等待队列。
    setHead(node);
	// 2、唤醒后续等待节点。
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

在 `setHeadAndPropagate()` 方法中，唤醒后续节点需要满足一定的条件，主要需要满足 2 个条件：

- `propagate > 0` ：`propagate` 代表获取资源之后剩余的资源数量，如果 `> 0` ，则可以唤醒后续线程去获取资源。
- `h.waitStatus < 0` ：这里的 `h` 节点是执行 `setHead()` 之前的 `head` 节点。判断 `head.waitStatus` 时使用 `< 0` ，主要为了确定 `head` 节点的状态为 `SIGNAL` 或 `PROPAGATE` 。如果 `head` 节点为 `SIGNAL` ，则可以唤醒后续节点；如果 `head` 节点状态为 `PROPAGATE` ，也可以唤醒后续节点（这是为了解决并发场景下出现的问题，后续会细讲）。

代码中关于 **唤醒后续等待节点** 的 `if` 判断稍微复杂一些，这里来讲一下为什么这样写：

```JAVA
if (propagate > 0 || h == null || h.waitStatus < 0 ||
    (h = head) == null || h.waitStatus < 0)
```

- `h == null || h.waitStatus < 0` ： `h == null` 用于防止空指针异常。正常情况下 h 不会为 `null` ，因为执行到这里之前，当前节点已经加入到队列中了，队列不可能还没有初始化。

  `h.waitStatus < 0` 主要判断 `head` 节点的状态是否为 `SIGNAL` 或者 `PROPAGATE` ，直接使用 `< 0` 来判断比较方便。

- `(h = head) == null || h.waitStatus < 0` ：如果到这里说明之前判断的 `h.waitStatus < 0` ，说明存在并发。

  同时存在其他线程在唤醒后续节点，已经将 `head` 节点的值由 `SIGNAL` 修改为 `0` 了。因此，这里重新获取新的 `head` 节点，这次获取的 `head` 节点为通过 `setHead()` 设置的当前线程节点，之后再次判断 `waitStatus` 状态。

如果 `if` 条件判断通过，就会走到 `doReleaseShared()` 方法唤醒后续等待节点，如下：

```JAVA
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        // 1、队列中至少需要一个等待的线程节点。
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 2、如果 head 节点的状态为 SIGNAL，则可以唤醒后继节点。
            if (ws == Node.SIGNAL) {
                // 2.1 清除 head 节点的 SIGNAL 状态，更新为 0。表示已经唤醒该节点的后继节点了。
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 2.2 唤醒后继节点
                unparkSuccessor(h);
            }
            // 3、如果 head 节点的状态为 0，则更新为 PROPAGATE。这是为了解决并发场景下存在的问题，接下来会细讲。
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```

在 `doReleaseShared()` 方法中，会判断 `head` 节点的 `waitStatus` 状态来决定接下来的操作，有两种情况：

- `head` 节点的状态为 `SIGNAL` ：表明 `head` 节点存在后继节点需要唤醒，因此通过 `CAS` 操作将 `head` 节点的 `SIGNAL` 状态更新为 `0` 。通过清除 `SIGNAL` 状态来表示已经对 `head` 节点的后继节点进行唤醒操作了。
- `head` 节点的状态为 `0` ：表明存在并发情况，需要将 `0` 修改为 `PROPAGATE` 来保证在并发场景下可以正常唤醒线程。

#### 为什么需要 `PROPAGATE` 状态？

在 `doReleaseShared()` 释放资源时，第 3 步不太容易理解，即如果发现 `head` 节点的状态是 `0` ，就将 `head` 节点的状态由 `0` 更新为 `PROPAGATE` 。

AQS 中，Node 节点的 `PROPAGATE` 就是为了处理并发场景下可能出现的无法唤醒线程节点的问题。`PROPAGATE` 只在 `doReleaseShared()` 方法中用到一次。

**接下来通过案例分析，为什么需要 `PROPAGATE` 状态？**

在共享模式下，线程获取和释放资源的方法调用链如下：

- 线程获取资源的方法调用链为： `acquireShared() -> tryAcquireShared() -> 线程阻塞等待唤醒 -> tryAcquireShared() -> setHeadAndPropagate() -> if (剩余资源数 > 0) || (head.waitStatus < 0) 则唤醒后续节点` 。

- 线程释放资源的方法调用链为： `releaseShared() -> tryReleaseShared() -> doReleaseShared()` 。

**如果在释放资源时，没有将 `head` 节点的状态由 `0` 改为 `PROPAGATE` ：**

假设总共有 4 个线程尝试以共享模式获取资源，总共有 2 个资源。初始 `T3` 和 `T4` 线程获取到了资源，`T1` 和 `T2` 线程没有获取到，因此在队列中排队等候。

- 在时刻 1 时，线程 `T1` 和 `T2` 在等待队列中，`T3` 和 `T4` 持有资源。此时等待队列内节点以及对应状态为（括号内为节点的 `waitStatus` 状态）：

  `head(-1) -> T1(-1) -> T2(0)` 。

- 在时刻 2 时，线程 `T3` 释放资源，通过 `doReleaseShared()` 方法将 `head` 节点的状态由 `SIGNAL` 更新为 `0` ，并唤醒线程 `T1` ，之后线程 `T3` 退出。

  线程 `T1` 被唤醒之后，通过 `tryAcquireShared()` 获取到资源，但是此时还未来得及执行 `setHeadAndPropagate()` 将自己设置为 `head` 节点。此时等待队列内节点状态为：

  `head(0) -> T1(-1) -> T2(0)` 。

- 在时刻 3 时，线程 `T4` 释放资源， 由于此时 `head` 节点的状态为 `0` ，因此在 `doReleaseShared()` 方法中无法唤醒 `head` 的后继节点， 之后线程 `T4` 退出。

- 在时刻 4 时，线程 `T1` 继续执行 `setHeadAndPropagate()` 方法将自己设置为 `head` 节点。

  但是此时由于线程 `T1` 执行 `tryAcquireShared()` 方法返回的剩余资源数为 `0` ，并且 `head` 节点的状态为 `0` ，因此线程 `T1` 并不会在 `setHeadAndPropagate()` 方法中唤醒后续节点。此时等待队列内节点状态为：

  `head(-1，线程 T1 节点) -> T2(0)` 。

此时，就导致线程 `T2` 节点在等待队列中，无法被唤醒。对应时刻表如下：

| 时刻   | 线程 T1                                                        | 线程 T2  | 线程 T3          | 线程 T4                                                       | 等待队列                          |
| ------ | -------------------------------------------------------------- | -------- | ---------------- | ------------------------------------------------------------- | --------------------------------- |
| 时刻 1 | 等待队列                                                       | 等待队列 | 持有资源         | 持有资源                                                      | `head(-1) -> T1(-1) -> T2(0)`     |
| 时刻 2 | （执行）被唤醒后，获取资源，但未来得及将自己设置为 `head` 节点 | 等待队列 | （执行）释放资源 | 持有资源                                                      | `head(0) -> T1(-1) -> T2(0)`      |
| 时刻 3 |                                                                | 等待队列 | 已退出           | （执行）释放资源。但 `head` 节点状态为 `0` ，无法唤醒后继节点 | `head(0) -> T1(-1) -> T2(0)`      |
| 时刻 4 | （执行）将自己设置为 `head` 节点                               | 等待队列 | 已退出           | 已退出                                                        | `head(-1，线程 T1 节点) -> T2(0)` |

**如果在线程释放资源时，将 `head` 节点的状态由 `0` 改为 `PROPAGATE` ，则可以解决上边出现的并发问题，如下：**

- 在时刻 1 时，线程 `T1` 和 `T2` 在等待队列中，`T3` 和 `T4` 持有资源。此时等待队列内节点以及对应状态为：

  `head(-1) -> T1(-1) -> T2(0)` 。

- 在时刻 2 时，线程 `T3` 释放资源，通过 `doReleaseShared()` 方法将 `head` 节点的状态由 `SIGNAL` 更新为 `0` ，并唤醒线程 `T1` ，之后线程 `T3` 退出。

  线程 `T1` 被唤醒之后，通过 `tryAcquireShared()` 获取到资源，但是此时还未来得及执行 `setHeadAndPropagate()` 将自己设置为 `head` 节点。此时等待队列内节点状态为：

  `head(0) -> T1(-1) -> T2(0)` 。

- 在时刻 3 时，线程 `T4` 释放资源， 由于此时 `head` 节点的状态为 `0` ，因此在 `doReleaseShared()` 方法中会将 `head` 节点的状态由 `0` 更新为 `PROPAGATE` ， 之后线程 `T4` 退出。此时等待队列内节点状态为：

  `head(PROPAGATE) -> T1(-1) -> T2(0)` 。

- 在时刻 4 时，线程 `T1` 继续执行 `setHeadAndPropagate()` 方法将自己设置为 `head` 节点。此时等待队列内节点状态为：

  `head(-1，线程 T1 节点) -> T2(0)` 。

- 在时刻 5 时，虽然此时由于线程 `T1` 执行 `tryAcquireShared()` 方法返回的剩余资源数为 `0` ，但是 `head` 节点状态为 `PROPAGATE < 0` （这里的 `head` 节点是老的 `head` 节点，而不是刚成为 `head` 节点的线程 `T1` 节点）。

  因此线程 `T1` 会在 `setHeadAndPropagate()` 方法中唤醒后续 `T2` 节点，并将 `head` 节点的状态由 `SIGNAL` 更新为 `0`。此时等待队列内节点状态为：

  `head(0，线程 T1 节点) -> T2(0)` 。

- 在时刻 6 时，线程 `T2` 被唤醒后，获取到资源，并将自己设置为 `head` 节点。此时等待队列内节点状态为：

  `head(0，线程 T2 节点)` 。

有了 `PROPAGATE` 状态，就可以避免线程 `T2` 无法被唤醒的情况。对应时刻表如下：

| 时刻   | 线程 T1                                                                                                                                                                    | 线程 T2                                                            | 线程 T3          | 线程 T4                                                             | 等待队列                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------- | ------------------------------------ |
| 时刻 1 | 等待队列                                                                                                                                                                   | 等待队列                                                           | 持有资源         | 持有资源                                                            | `head(-1) -> T1(-1) -> T2(0)`        |
| 时刻 2 | （执行）被唤醒后，获取资源，但未来得及将自己设置为 `head` 节点                                                                                                             | 等待队列                                                           | （执行）释放资源 | 持有资源                                                            | `head(0) -> T1(-1) -> T2(0)`         |
| 时刻 3 | 未继续向下执行                                                                                                                                                             | 等待队列                                                           | 已退出           | （执行）释放资源。此时会将 `head` 节点状态由 `0` 更新为 `PROPAGATE` | `head(PROPAGATE) -> T1(-1) -> T2(0)` |
| 时刻 4 | （执行）将自己设置为 `head` 节点                                                                                                                                           | 等待队列                                                           | 已退出           | 已退出                                                              | `head(-1，线程 T1 节点) -> T2(0)`    |
| 时刻 5 | （执行）由于 `head` 节点状态为 `PROPAGATE < 0` ，因此会在 `setHeadAndPropagate()` 方法中唤醒后续节点，此时将新的 `head` 节点的状态由 `SIGNAL` 更新为 `0` ，并唤醒线程 `T2` | 等待队列                                                           | 已退出           | 已退出                                                              | `head(0，线程 T1 节点) -> T2(0)`     |
| 时刻 6 | 已退出                                                                                                                                                                     | （执行）线程 `T2` 被唤醒后，获取到资源，并将自己设置为 `head` 节点 | 已退出           | 已退出                                                              | `head(0，线程 T2 节点)`              |

### AQS 资源释放源码分析（共享模式）

AQS 中以共享模式释放资源的入口方法是 `releaseShared()` ，代码如下：

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

其中 `tryReleaseShared()` 方法是 AQS 提供的模板方法，这里同样以 `Semaphore` 来讲解，如下：

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

在 `Semaphore` 实现的 `tryReleaseShared()` 方法中，会在死循环内不断尝试释放资源，即通过 `CAS` 操作来更新 `state` 值。

如果更新成功，则证明资源释放成功，会进入到 `doReleaseShared()` 方法。

`doReleaseShared()` 方法在前文获取资源（共享模式）的部分已进行了详细的源码分析，此处不再重复。

## 常见同步工具类

下面介绍几个基于 AQS 的常见同步工具类。

### Semaphore(信号量)

#### 介绍

`synchronized` 和 `ReentrantLock` 都是一次只允许一个线程访问某个资源，而`Semaphore`(信号量)可以用来控制同时访问特定资源的线程数量。

`Semaphore` 的使用简单，我们这里假设有 `N(N>5)` 个线程来获取 `Semaphore` 中的共享资源，下面的代码表示同一时刻 N 个线程中只有 5 个线程能获取到共享资源，其他线程都会阻塞，只有获取到共享资源的线程才能执行。等到有线程释放了共享资源，其他阻塞的线程才能获取到。

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

#### 原理

`Semaphore` 是共享锁的一种实现，它默认构造 AQS 的 `state` 值为 `permits`，你可以将 `permits` 的值理解为许可证的数量，只有拿到许可证的线程才能执行。

以无参 `acquire` 方法为例，调用`semaphore.acquire()` ，线程尝试获取许可证，如果 `state > 0` 的话，则表示可以获取成功，如果 `state <= 0` 的话，则表示许可证数量不足，获取失败。

如果可以获取成功的话(`state > 0` )，会尝试使用 CAS 操作去修改 `state` 的值 `state=state-1`。如果获取失败则会创建一个 Node 节点加入等待队列，挂起当前线程。

```java
// 获取1个许可证
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

// 获取一个或者多个许可证
public void acquire(int permits) throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireSharedInterruptibly(permits);
}
```

`acquireSharedInterruptibly`方法是 `AbstractQueuedSynchronizer` 中的默认实现。

```java
// 共享模式下获取许可证，获取成功则返回，失败则加入等待队列，挂起线程
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // 尝试获取许可证，arg为获取许可证个数，当获取失败时,则创建一个节点加入等待队列，挂起当前线程。
    if (tryAcquireShared(arg) < 0)
      doAcquireSharedInterruptibly(arg);
}
```

这里再以非公平模式（`NonfairSync`）的为例，看看 `tryAcquireShared` 方法的实现。

```java
// 共享模式下尝试获取资源(在Semaphore中的资源即许可证):
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// 非公平的共享模式获取许可证
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 当前可用许可证数量
        int available = getState();
        /*
         * 尝试获取许可证，当前可用许可证数量小于等于0时，返回负值，表示获取失败，
         * 当前可用许可证大于0时才可能获取成功，CAS失败了会循环重新获取最新的值尝试获取
         */
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

以无参 `release` 方法为例，调用`semaphore.release();` ，线程尝试释放许可证，并使用 CAS 操作去修改 `state` 的值 `state=state+1`。释放许可证成功之后，同时会唤醒等待队列中的一个线程。被唤醒的线程会重新尝试去修改 `state` 的值 `state=state-1` ，如果 `state > 0` 则获取令牌成功，否则重新进入等待队列，挂起线程。

```java
// 释放一个许可证
public void release() {
    sync.releaseShared(1);
}

// 释放一个或者多个许可证
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}
```

`releaseShared`方法是 `AbstractQueuedSynchronizer` 中的默认实现。

```java
// 释放共享锁
// 如果 tryReleaseShared 返回 true，就唤醒等待队列中的一个或多个线程。
public final boolean releaseShared(int arg) {
    //释放共享锁
    if (tryReleaseShared(arg)) {
      //释放当前节点的后置等待节点
      doReleaseShared();
      return true;
    }
    return false;
}
```

`tryReleaseShared` 方法是`Semaphore` 的内部类 `Sync` 重写的一个方法， `AbstractQueuedSynchronizer`中的默认实现仅仅抛出 `UnsupportedOperationException` 异常。

```java
// 内部类 Sync 中重写的一个方法
// 尝试释放资源
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        // 可用许可证+1
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
         // CAS修改state的值
        if (compareAndSetState(current, next))
            return true;
    }
}
```

可以看到，上面提到的几个方法底层基本都是通过同步器 `sync` 实现的。`Sync` 是 `CountDownLatch` 的内部类 , 继承了 `AbstractQueuedSynchronizer` ，重写了其中的某些方法。并且，Sync 对应的还有两个子类 `NonfairSync`（对应非公平模式） 和 `FairSync`（对应公平模式）。

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

#### 实战

```java
public class SemaphoreExample {
  // 请求的数量
  private static final int threadCount = 550;

  public static void main(String[] args) throws InterruptedException {
    // 创建一个具有固定线程数量的线程池对象（如果这里线程池的线程数量给太少的话你会发现执行的很慢）
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    // 初始许可证数量
    final Semaphore semaphore = new Semaphore(20);

    for (int i = 0; i < threadCount; i++) {
      final int threadnum = i;
      threadPool.execute(() -> {// Lambda 表达式的运用
        try {
          semaphore.acquire();// 获取一个许可，所以可运行线程数量为20/1=20
          test(threadnum);
          semaphore.release();// 释放一个许可
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
    Thread.sleep(1000);// 模拟请求的耗时操作
    System.out.println("threadnum:" + threadnum);
    Thread.sleep(1000);// 模拟请求的耗时操作
  }
}
```

执行 `acquire()` 方法阻塞，直到有一个许可证可以获得然后拿走一个许可证；每个 `release` 方法增加一个许可证，这可能会释放一个阻塞的 `acquire()` 方法。然而，其实并没有实际的许可证这个对象，`Semaphore` 只是维持了一个可获得许可证的数量。 `Semaphore` 经常用于限制获取某种资源的线程数量。

当然一次也可以一次拿取和释放多个许可，不过一般没有必要这样做：

```java
semaphore.acquire(5);// 获取5个许可，所以可运行线程数量为20/5=4
test(threadnum);
semaphore.release(5);// 释放5个许可
```

除了 `acquire()` 方法之外，另一个比较常用的与之对应的方法是 `tryAcquire()` 方法，该方法如果获取不到许可就立即返回 false。

[issue645 补充内容](https://github.com/Snailclimb/JavaGuide/issues/645)：

> `Semaphore` 基于 AQS 实现，用于控制并发访问的线程数量，但它与共享锁的概念有所不同。`Semaphore` 的构造函数使用 `permits` 参数初始化 AQS 的 `state` 变量，该变量表示可用的许可数量。当线程调用 `acquire()` 方法尝试获取许可时，`state` 会原子性地减 1。如果 `state` 减 1 后大于等于 0，则 `acquire()` 成功返回，线程可以继续执行。如果 `state` 减 1 后小于 0，表示当前并发访问的线程数量已达到 `permits` 的限制，该线程会被放入 AQS 的等待队列并阻塞，**而不是自旋等待**。当其他线程完成任务并调用 `release()` 方法时，`state` 会原子性地加 1。`release()` 操作会唤醒 AQS 等待队列中的一个或多个阻塞线程。这些被唤醒的线程将再次尝试 `acquire()` 操作，竞争获取可用的许可。因此，`Semaphore` 通过控制许可数量来限制并发访问的线程数量，而不是通过自旋和共享锁机制。

### CountDownLatch （倒计时器）

#### 介绍

`CountDownLatch` 允许 `count` 个线程阻塞在一个地方，直至所有线程的任务都执行完毕。

`CountDownLatch` 是一次性的，计数器的值只能在构造方法中初始化一次，之后没有任何机制再次对其设置值，当 `CountDownLatch` 使用完毕后，它不能再次被使用。

#### 原理

`CountDownLatch` 是共享锁的一种实现，它默认构造 AQS 的 `state` 值为 `count`。这个我们通过 `CountDownLatch` 的构造方法即可看出。

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

当线程调用 `countDown()` 时，其实使用了`tryReleaseShared`方法以 CAS 的操作来减少 `state`，直至 `state` 为 0 。当 `state` 为 0 时，表示所有的线程都调用了 `countDown` 方法，那么在 `CountDownLatch` 上等待的线程就会被唤醒并继续执行。

```java
public void countDown() {
    // Sync 是 CountDownLatch 的内部类 , 继承了 AbstractQueuedSynchronizer
    sync.releaseShared(1);
}
```

`releaseShared`方法是 `AbstractQueuedSynchronizer` 中的默认实现。

```java
// 释放共享锁
// 如果 tryReleaseShared 返回 true，就唤醒等待队列中的一个或多个线程。
public final boolean releaseShared(int arg) {
    //释放共享锁
    if (tryReleaseShared(arg)) {
      //释放当前节点的后置等待节点
      doReleaseShared();
      return true;
    }
    return false;
}
```

`tryReleaseShared` 方法是`CountDownLatch` 的内部类 `Sync` 重写的一个方法， `AbstractQueuedSynchronizer`中的默认实现仅仅抛出 `UnsupportedOperationException` 异常。

```java
// 对 state 进行递减，直到 state 变成 0；
// 只有 count 递减到 0 时，countDown 才会返回 true
protected boolean tryReleaseShared(int releases) {
    // 自选检查 state 是否为 0
    for (;;) {
        int c = getState();
        // 如果 state 已经是 0 了，直接返回 false
        if (c == 0)
            return false;
        // 对 state 进行递减
        int nextc = c-1;
        // CAS 操作更新 state 的值
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```

以无参 `await`方法为例，当调用 `await()` 的时候，如果 `state` 不为 0，那就证明任务还没有执行完毕，`await()` 就会一直阻塞，也就是说 `await()` 之后的语句不会被执行（`main` 线程被加入到等待队列也就是 变体 CLH 队列中了）。然后，`CountDownLatch` 会自旋 CAS 判断 `state == 0`，如果 `state == 0` 的话，就会释放所有等待的线程，`await()` 方法之后的语句得到执行。

```java
// 等待（也可以叫做加锁）
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
// 带有超时时间的等待
public boolean await(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

`acquireSharedInterruptibly`方法是 `AbstractQueuedSynchronizer` 中的默认实现。

```java
// 尝试获取锁，获取成功则返回，失败则加入等待队列，挂起线程
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // 尝试获得锁，获取成功则返回
    if (tryAcquireShared(arg) < 0)
      // 获取失败加入等待队列，挂起线程
      doAcquireSharedInterruptibly(arg);
}
```

`tryAcquireShared` 方法是`CountDownLatch` 的内部类 `Sync` 重写的一个方法，其作用就是判断 `state` 的值是否为 0，是的话就返回 1，否则返回 -1。

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

#### 实战

**CountDownLatch 的两种典型用法**：

1. 某一线程在开始运行前等待 n 个线程执行完毕 : 将 `CountDownLatch` 的计数器初始化为 n （`new CountDownLatch(n)`），每当一个任务线程执行完毕，就将计数器减 1 （`countdownlatch.countDown()`），当计数器的值变为 0 时，在 `CountDownLatch 上 await()` 的线程就会被唤醒。一个典型应用场景就是启动一个服务时，主线程需要等待多个组件加载完毕，之后再继续执行。
2. 实现多个线程开始执行任务的最大并行性：注意是并行性，不是并发，强调的是多个线程在某一时刻同时开始执行。类似于赛跑，将多个线程放到起点，等待发令枪响，然后同时开跑。做法是初始化一个共享的 `CountDownLatch` 对象，将其计数器初始化为 1 （`new CountDownLatch(1)`），多个线程在开始执行任务前首先 `coundownlatch.await()`，当主线程调用 `countDown()` 时，计数器变为 0，多个线程同时被唤醒。

**CountDownLatch 代码示例**：

```java
public class CountDownLatchExample {
  // 请求的数量
  private static final int THREAD_COUNT = 550;

  public static void main(String[] args) throws InterruptedException {
    // 创建一个具有固定线程数量的线程池对象（如果这里线程池的线程数量给太少的话你会发现执行的很慢）
    // 只是测试使用，实际场景请手动赋值线程池参数
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
          // 表示一个请求已经被完成
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
}
```

上面的代码中，我们定义了请求的数量为 550，当这 550 个请求被处理完成之后，才会执行`System.out.println("finish");`。

与 `CountDownLatch` 的第一次交互是主线程等待其他线程。主线程必须在启动其他线程后立即调用 `CountDownLatch.await()` 方法。这样主线程的操作就会在这个方法上阻塞，直到其他线程完成各自的任务。

其他 N 个线程必须引用闭锁对象，因为他们需要通知 `CountDownLatch` 对象，他们已经完成了各自的任务。这种通知机制是通过 `CountDownLatch.countDown()`方法来完成的；每调用一次这个方法，在构造函数中初始化的 count 值就减 1。所以当 N 个线程都调 用了这个方法，count 的值等于 0，然后主线程就能通过 `await()`方法，恢复执行自己的任务。

再插一嘴：`CountDownLatch` 的 `await()` 方法使用不当很容易产生死锁，比如我们上面代码中的 for 循环改为：

```java
for (int i = 0; i < threadCount-1; i++) {
.......
}
```

这样就导致 `count` 的值没办法等于 0，然后就会导致一直等待。

### CyclicBarrier(循环栅栏)

#### 介绍

`CyclicBarrier` 和 `CountDownLatch` 非常类似，它也可以实现线程间的技术等待，但是它的功能比 `CountDownLatch` 更加复杂和强大。主要应用场景和 `CountDownLatch` 类似。

> `CountDownLatch` 的实现是基于 AQS 的，而 `CyclicBarrier` 是基于 `ReentrantLock`(`ReentrantLock` 也属于 AQS 同步器)和 `Condition` 的。

`CyclicBarrier` 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是：让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。

#### 原理

`CyclicBarrier` 内部通过一个 `count` 变量作为计数器，`count` 的初始值为 `parties` 属性的初始化值，每当一个线程到了栅栏这里了，那么就将计数器减 1。如果 count 值为 0 了，表示这是这一代最后一个线程到达栅栏，就尝试执行我们构造方法中输入的任务。

```java
//每次拦截的线程数
private final int parties;
//计数器
private int count;
```

下面我们结合源码来简单看看。

1、`CyclicBarrier` 默认的构造方法是 `CyclicBarrier(int parties)`，其参数表示屏障拦截的线程数量，每个线程调用 `await()` 方法告诉 `CyclicBarrier` 我已经到达了屏障，然后当前线程被阻塞。

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

其中，`parties` 就代表了有拦截的线程的数量，当拦截的线程数量达到这个值的时候就打开栅栏，让所有线程通过。

2、当调用 `CyclicBarrier` 对象调用 `await()` 方法时，实际上调用的是 `dowait(false, 0L)`方法。 `await()` 方法就像树立起一个栅栏的行为一样，将线程挡住了，当拦住的线程数量达到 `parties` 的值时，栅栏才会打开，线程才得以通过执行。

```java
public int await() throws InterruptedException, BrokenBarrierException {
  try {
      return dowait(false, 0L);
  } catch (TimeoutException toe) {
      throw new Error(toe); // cannot happen
  }
}
```

`dowait(false, 0L)`方法源码分析如下：

```java
    // 当线程数量或者请求数量达到 count 时 await 之后的方法才会被执行。上面的示例中 count 的值就为 5。
    private int count;
    /**
     * Main barrier code, covering the various policies.
     */
    private int dowait(boolean timed, long nanos)
        throws InterruptedException, BrokenBarrierException,
               TimeoutException {
        final ReentrantLock lock = this.lock;
        // 锁住
        lock.lock();
        try {
            final Generation g = generation;

            if (g.broken)
                throw new BrokenBarrierException();

            // 如果线程中断了，抛出异常
            if (Thread.interrupted()) {
                breakBarrier();
                throw new InterruptedException();
            }
            // count 减1
            int index = --count;
            // 当 count 数量减为 0 之后说明最后一个线程已经到达栅栏了，也就是达到了可以执行await 方法之后的条件
            if (index == 0) {  // tripped
                boolean ranAction = false;
                try {
                    final Runnable command = barrierCommand;
                    if (command != null)
                        command.run();
                    ranAction = true;
                    // 将 count 重置为 parties 属性的初始化值
                    // 唤醒之前等待的线程
                    // 下一波执行开始
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
