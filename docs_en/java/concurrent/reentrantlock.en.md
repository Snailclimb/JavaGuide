---
title: 从ReentrantLock的实现看AQS的原理及应用
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: ReentrantLock,AQS,公平锁,非公平锁,可重入,lock/unlock,Sync Queue,独占锁,compareAndSetState,acquire
  - - meta
    - name: description
      content: 结合 ReentrantLock 的实现剖析 AQS 工作原理，比较公平与非公平锁、与 synchronized 的差异以及独占锁的加解锁流程。
---

> 本文转载自：<https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>
>
> 作者：美团技术团队

Java 中的大部分同步类（Semaphore、ReentrantLock 等）都是基于 AbstractQueuedSynchronizer（简称为 AQS）实现的。AQS 是一种提供了原子式管理同步状态、阻塞和唤醒线程功能以及队列模型的简单框架。

本文会从应用层逐渐深入到原理层，并通过 ReentrantLock 的基本特性和 ReentrantLock 与 AQS 的关联，来深入解读 AQS 相关独占锁的知识点，同时采取问答的模式来帮助大家理解 AQS。由于篇幅原因，本篇文章主要阐述 AQS 中独占锁的逻辑和 Sync Queue，不讲述包含共享锁和 Condition Queue 的部分（本篇文章核心为 AQS 原理剖析，只是简单介绍了 ReentrantLock，感兴趣同学可以阅读一下 ReentrantLock 的源码）。

## 1 ReentrantLock

### 1.1 ReentrantLock 特性概览

ReentrantLock 意思为可重入锁，指的是一个线程能够对一个临界资源重复加锁。为了帮助大家更好地理解 ReentrantLock 的特性，我们先将 ReentrantLock 跟常用的 Synchronized 进行比较，其特性如下（蓝色部分为本篇文章主要剖析的点）：

![](https://p0.meituan.net/travelcube/412d294ff5535bbcddc0d979b2a339e6102264.png)

下面通过伪代码，进行更加直观的比较：

```java
// **************************Synchronized的使用方式**************************
// 1.用于代码块
synchronized (this) {}
// 2.用于对象
synchronized (object) {}
// 3.用于方法
public synchronized void test () {}
// 4.可重入
for (int i = 0; i < 100; i++) {
  synchronized (this) {}
}
// **************************ReentrantLock的使用方式**************************
public void test () throw Exception {
  // 1.初始化选择公平锁、非公平锁
  ReentrantLock lock = new ReentrantLock(true);
  // 2.可用于代码块
  lock.lock();
  try {
    try {
      // 3.支持多种加锁方式，比较灵活; 具有可重入特性
      if(lock.tryLock(100, TimeUnit.MILLISECONDS)){ }
    } finally {
      // 4.手动释放锁
      lock.unlock()
    }
  } finally {
    lock.unlock();
  }
}
```

### 1.2 ReentrantLock 与 AQS 的关联

通过上文我们已经了解，ReentrantLock 支持公平锁和非公平锁（关于公平锁和非公平锁的原理分析，可参考《[不可不说的 Java“锁”事](https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651749434&idx=3&sn=5ffa63ad47fe166f2f1a9f604ed10091&chksm=bd12a5778a652c61509d9e718ab086ff27ad8768586ea9b38c3dcf9e017a8e49bcae3df9bcc8&scene=38#wechat_redirect)》），并且 ReentrantLock 的底层就是由 AQS 来实现的。那么 ReentrantLock 是如何通过公平锁和非公平锁与 AQS 关联起来呢？ 我们着重从这两者的加锁过程来理解一下它们与 AQS 之间的关系（加锁过程中与 AQS 的关联比较明显，解锁流程后续会介绍）。

非公平锁源码中的加锁流程如下：

```java
// java.util.concurrent.locks.ReentrantLock#NonfairSync

// 非公平锁
static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
    }
  ...
}
```

这块代码的含义为：

- 若通过 CAS 设置变量 State（同步状态）成功，也就是获取锁成功，则将当前线程设置为独占线程。
- 若通过 CAS 设置变量 State（同步状态）失败，也就是获取锁失败，则进入 Acquire 方法进行后续处理。

第一步很好理解，但第二步获取锁失败后，后续的处理策略是怎么样的呢？这块可能会有以下思考：

- 某个线程获取锁失败的后续流程是什么呢？有以下两种可能：

(1) 将当前线程获锁结果设置为失败，获取锁流程结束。这种设计会极大降低系统的并发度，并不满足我们实际的需求。所以就需要下面这种流程，也就是 AQS 框架的处理流程。

(2) 存在某种排队等候机制，线程继续等待，仍然保留获取锁的可能，获取锁流程仍在继续。

- 对于问题 1 的第二种情况，既然说到了排队等候机制，那么就一定会有某种队列形成，这样的队列是什么数据结构呢？
- 处于排队等候机制中的线程，什么时候可以有机会获取锁呢？
- 如果处于排队等候机制中的线程一直无法获取锁，还是需要一直等待吗，还是有别的策略来解决这一问题？

带着非公平锁的这些问题，再看下公平锁源码中获锁的方式：

```java
// java.util.concurrent.locks.ReentrantLock#FairSync

static final class FairSync extends Sync {
  ...
  final void lock() {
    acquire(1);
  }
  ...
}
```

看到这块代码，我们可能会存在这种疑问：Lock 函数通过 Acquire 方法进行加锁，但是具体是如何加锁的呢？

结合公平锁和非公平锁的加锁流程，虽然流程上有一定的不同，但是都调用了 Acquire 方法，而 Acquire 方法是 FairSync 和 UnfairSync 的父类 AQS 中的核心方法。

对于上边提到的问题，其实在 ReentrantLock 类源码中都无法解答，而这些问题的答案，都是位于 Acquire 方法所在的类 AbstractQueuedSynchronizer 中，也就是本文的核心——AQS。下面我们会对 AQS 以及 ReentrantLock 和 AQS 的关联做详细介绍（相关问题答案会在 2.3.5 小节中解答）。

## 2 AQS

首先，我们通过下面的架构图来整体了解一下 AQS 框架：

![](https://p1.meituan.net/travelcube/82077ccf14127a87b77cefd1ccf562d3253591.png)

- 上图中有颜色的为 Method，无颜色的为 Attribution。
- 总的来说，AQS 框架共分为五层，自上而下由浅入深，从 AQS 对外暴露的 API 到底层基础数据。
- 当有自定义同步器接入时，只需重写第一层所需要的部分方法即可，不需要关注底层具体的实现流程。当自定义同步器进行加锁或者解锁操作时，先经过第一层的 API 进入 AQS 内部方法，然后经过第二层进行锁的获取，接着对于获取锁失败的流程，进入第三层和第四层的等待队列处理，而这些处理方式均依赖于第五层的基础数据提供层。

下面我们会从整体到细节，从流程到方法逐一剖析 AQS 框架，主要分析过程如下：

![](https://p1.meituan.net/travelcube/d2f7f7fffdc30d85d17b44266c3ab05323338.png)

### 2.1 Principle Overview

The core idea of AQS is that if the requested shared resource is idle, then the thread currently requesting the resource is set as a valid working thread and the shared resource is set to the locked state; if the shared resource is occupied, a certain blocking and waiting wake-up mechanism is required to ensure lock allocation. This mechanism is mainly implemented using a variant of the CLH queue, and threads that cannot temporarily obtain the lock are added to the queue.

CLH: Craig, Landin and Hagersten queue is a one-way linked list. The queue in AQS is a virtual two-way queue (FIFO) of CLH variant. AQS implements lock allocation by encapsulating each thread requesting shared resources into a node.

The main schematic diagram is as follows:

![](https://p0.meituan.net/travelcube/7132e4cef44c26f62835b197b239147b18062.png)

AQS uses a Volatile int type member variable to represent the synchronization state, completes the queuing work of resource acquisition through the built-in FIFO queue, and completes the modification of the State value through CAS.

#### 2.1.1 AQS data structure

Let’s first look at the most basic data structure in AQS - Node. Node is the node in the CLH variant queue above.

![](https://p1.meituan.net/travelcube/960271cf2b5c8a185eed23e98b72c75538637.png)

Explain the meaning of several methods and attribute values:

| Method and property values | Meaning |
| :---------- | :--------------------------------------------------------------------------------------------- |
| waitStatus | The status of the current node in the queue |
| thread | represents the thread at this node |
| prev | Precursor pointer |
| predecessor | Returns the predecessor node, if not, throws npe |
| nextWaiter | Points to the next node in the CONDITION state (since this article does not describe the Condition Queue queue, this pointer will not be introduced in detail) |
| next | successor pointer |

Two lock modes for threads:

| Pattern | Meaning |
| :-------- | :-------------------------------- |
| SHARED | Indicates that the thread is waiting for the lock in shared mode |
| EXCLUSIVE | Indicates that the thread is waiting for the lock exclusively |

waitStatus has the following enumeration values:

| Enumeration | Meaning |
| :-------- | :----------------------------------------------- |
| 0 | The default value when a Node is initialized |
| CANCELLED | is 1, indicating that the thread's request to acquire the lock has been canceled |
| CONDITION | is -2, indicating that the node is in the waiting queue and the node thread is waiting to wake up |
| PROPAGATE | is -3, this field will only be used when the current thread is in SHARED |
| SIGNAL | is -1, indicating that the thread is ready and is waiting for the resource to be released |

#### 2.1.2 Synchronization state State

After understanding the data structure, let’s learn about the synchronization state of AQS - State. AQS maintains a field named state, which means synchronization status. It is modified by Volatile and is used to display the current lock status of critical resources.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

Here are several ways to access this field:

| Method name | Description |
| :------------------------------------------------------------------ | :----------------------- |
| protected final int getState() | Get the value of State |
| protected final void setState(int newState) | Set the value of State |
| protected final boolean compareAndSetState(int expect, int update) | Use CAS to update State |

These methods are all modified with Final, which means they cannot be overridden in subclasses. We can implement multi-threaded exclusive mode and shared mode (locking process) by modifying the synchronization state represented by the State field.

![](https://p0.meituan.net/travelcube/27605d483e8935da683a93be015713f331378.png)

![](https://p0.meituan.net/travelcube/3f1e1a44f5b7d77000ba4f9476189b2e32806.png)

For our customized synchronization tool, we need to customize the way to obtain synchronization status and release status, which is the first layer in the AQS architecture diagram: API layer.

### 2.2 Association between AQS important methods and ReentrantLock

As can be seen from the architecture diagram, AQS provides a large number of Protected methods for custom synchronizer implementation. The related methods of custom synchronizer implementation are only to implement multi-threaded exclusive mode or shared mode by modifying the State field. The custom synchronizer needs to implement the following methods (the methods that ReentrantLock needs to implement are as follows, not all):

| Method name | Description |
| :------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| protected boolean isHeldExclusively() | Whether this thread is holding resources exclusively. You only need to implement it if you use Condition.                                                            |
| protected boolean tryAcquire(int arg) | Exclusive mode. arg is the number of times to acquire the lock and try to acquire the resource. True will be returned if successful and False if failed.                                        || protected boolean tryRelease(int arg) | Exclusive mode. arg is the number of times to release the lock. Try to release the resource. True will be returned if successful, False if failed.                                        |
| protected int tryAcquireShared(int arg) | Sharing method. arg is the number of times to acquire the lock and try to acquire the resource. A negative number indicates failure; 0 indicates success, but no resources remain available; a positive number indicates success, and there are remaining resources. |
| protected boolean tryReleaseShared(int arg) | Sharing method. arg is the number of times to release the lock. Try to release the resource. If it is allowed to wake up the subsequent waiting node after the release, it returns True, otherwise it returns False.                  |

Generally speaking, custom synchronizers are either exclusive or shared, and they only need to implement one of tryAcquire-tryRelease and tryAcquireShared-tryReleaseShared. AQS also supports custom synchronizers to implement both exclusive and shared methods, such as ReentrantReadWriteLock. ReentrantLock is an exclusive lock, so tryAcquire-tryRelease is implemented.

Taking unfair locks as an example, here we mainly explain the relationship between unfair locks and AQS. The specific role of each core method will be explained in detail later in the article.

![](https://p1.meituan.net/travelcube/b8b53a70984668bc68653efe9531573e78636.png)

> 🐛 Correction (see: [issue#1761](https://github.com/Snailclimb/JavaGuide/issues/1761)): A small error in the picture, (AQS)CAS should successfully acquire the lock after successfully modifying the shared resource State (unfair lock).
>
> The corresponding source code is as follows:
>
> ```java
> final boolean nonfairTryAcquire(int acquires) {
> final Thread current = Thread.currentThread();//Get the current thread
> int c = getState();
> if (c == 0) {
> if (compareAndSetState(0, acquires)) {//CAS lock grabbing
> setExclusiveOwnerThread(current);//Set the current thread as an exclusive thread
> return true;//Lock grabbing successful
> }
> }
> else if (current == getExclusiveOwnerThread()) {
> int nextc = c + acquires;
> if (nextc < 0) // overflow
> throw new Error("Maximum lock count exceeded");
> setState(nextc);
> return true;
> }
> return false;
> }
> ```

In order to help everyone understand the interaction process between ReentrantLock and AQS, taking unfair lock as an example, we will highlight the interaction process of locking and unlocking separately to facilitate understanding of the subsequent content.

![](https://p1.meituan.net/travelcube/7aadb272069d871bdee8bf3a218eed8136919.png)

Lock:

- Perform locking operations through the locking method Lock of ReentrantLock.
- The Lock method of the internal class Sync will be called. Since Sync#lock is an abstract method, executing the Lock method of the relevant internal class based on the fair lock and unfair lock selected by ReentrantLock initialization will essentially execute the Acquire method of AQS.
- The Acquire method of AQS will execute the tryAcquire method, but since tryAcquire requires a custom synchronizer implementation, the tryAcquire method in ReentrantLock is executed. Since ReentrantLock is a tryAcquire method implemented through fair lock and unfair lock internal classes, different tryAcquire will be executed depending on the lock type.
- tryAcquire is the lock acquisition logic. After the acquisition fails, the subsequent logic of the framework AQS will be executed, which has nothing to do with the ReentrantLock custom synchronizer.

Unlock:

- Unlock through the Unlock method of ReentrantLock.
- Unlock will call the Release method of the internal class Sync, which is inherited from AQS.
- The tryRelease method will be called in Release. tryRelease requires a custom synchronizer implementation. tryRelease is only implemented in Sync in ReentrantLock. Therefore, it can be seen that the process of releasing the lock does not distinguish whether it is a fair lock.
- After the release is successful, all processing is completed by the AQS framework and has nothing to do with the custom synchronizer.

Through the above description, we can probably summarize the mapping relationship of the core methods of the API layer when locking and unlocking ReentrantLock.

![](https://p0.meituan.net/travelcube/f30c631c8ebbf820d3e8fcb6eee3c0ef18748.png)

## 3 Understanding AQS through ReentrantLock

Fair locks and unfair locks in ReentrantLock are the same at the bottom level. Here we take unfair locks as an example for analysis.

In unfair lock, there is a piece of code like this:

```java
// java.util.concurrent.locks.ReentrantLock

static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
  }
  ...
}
```

Take a look at how this Acquire is written:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

Take another look at the tryAcquire method:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

protected boolean tryAcquire(int arg) {
  throw new UnsupportedOperationException();
}
```

It can be seen that this is just a simple implementation of AQS. The specific implementation method of acquiring locks is implemented separately by respective fair locks and unfair locks (taking ReentrantLock as an example). If this method returns True, it means that the current thread has successfully acquired the lock, and there is no need to execute it further; if the acquisition fails, it needs to be added to the waiting queue. The following will explain in detail when and how threads are added to the waiting queue.

### 3.1 Thread joins waiting queue

#### 3.1.1 Timing to join the queue

When Acquire(1) is executed, the lock is acquired through tryAcquire. In this case, if the lock acquisition fails, addWaiter will be called to join the waiting queue.

#### 3.1.2 How to join the queue

After failing to acquire the lock, addWaiter(Node.EXCLUSIVE) will be executed to join the waiting queue. The specific implementation method is as follows:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
private final boolean compareAndSetTail(Node expect, Node update) {
  return unsafe.compareAndSwapObject(this, tailOffset, expect, update);
}```

主要的流程如下：

- 通过当前的线程和锁模式新建一个节点。
- Pred 指针指向尾节点 Tail。
- 将 New 中 Node 的 Prev 指针指向 Pred。
- 通过 compareAndSetTail 方法，完成尾节点的设置。这个方法主要是对 tailOffset 和 Expect 进行比较，如果 tailOffset 的 Node 和 Expect 的 Node 地址是相同的，那么设置 Tail 的值为 Update 的值。

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static {
  try {
    stateOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("state"));
    headOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("head"));
    tailOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("tail"));
    waitStatusOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("waitStatus"));
    nextOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("next"));
  } catch (Exception ex) {
    throw new Error(ex);
  }
}
```

从 AQS 的静态代码块可以看出，都是获取一个对象的属性相对于该对象在内存当中的偏移量，这样我们就可以根据这个偏移量在对象内存当中找到这个属性。tailOffset 指的是 tail 对应的偏移量，所以这个时候会将 new 出来的 Node 置为当前队列的尾节点。同时，由于是双向链表，也需要将前一个节点指向尾节点。

- 如果 Pred 指针是 Null（说明等待队列中没有元素），或者当前 Pred 指针和 Tail 指向的位置不同（说明被别的线程已经修改），就需要看一下 Enq 的方法。

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node enq(final Node node) {
  for (;;) {
    Node t = tail;
    if (t == null) { // Must initialize
      if (compareAndSetHead(new Node()))
        tail = head;
    } else {
      node.prev = t;
      if (compareAndSetTail(t, node)) {
        t.next = node;
        return t;
      }
    }
  }
}
```

如果没有被初始化，需要进行初始化一个头结点出来。但请注意，初始化的头结点并不是当前线程节点，而是调用了无参构造函数的节点。如果经历了初始化或者并发导致队列中有元素，则与之前的方法相同。其实，addWaiter 就是一个在双端链表添加尾节点的操作，需要注意的是，双端链表的头结点是一个无参构造函数的头结点。

总结一下，线程获取锁的时候，过程大体如下：

1、当没有线程获取到锁时，线程 1 获取锁成功。

2、线程 2 申请锁，但是锁被线程 1 占有。

![img](https://p0.meituan.net/travelcube/e9e385c3c68f62c67c8d62ab0adb613921117.png)

3、如果再有线程要获取锁，依次在队列中往后排队即可。

回到上边的代码，hasQueuedPredecessors 是公平锁加锁时判断等待队列中是否存在有效节点的方法。如果返回 False，说明当前线程可以争取共享资源；如果返回 True，说明队列中存在有效节点，当前线程必须加入到等待队列中。

```java
// java.util.concurrent.locks.ReentrantLock

public final boolean hasQueuedPredecessors() {
  // The correctness of this depends on head being initialized
  // before tail and on head.next being accurate if the current
  // thread is first in queue.
  Node t = tail; // Read fields in reverse initialization order
  Node h = head;
  Node s;
  return h != t && ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

看到这里，我们理解一下 h != t && ((s = h.next) == null || s.thread != Thread.currentThread());为什么要判断的头结点的下一个节点？第一个节点储存的数据是什么？

> 双向链表中，第一个节点为虚节点，其实并不存储任何信息，只是占位。真正的第一个有数据的节点，是在第二个节点开始的。当 h != t 时：如果(s = h.next) == null，等待队列正在有线程进行初始化，但只是进行到了 Tail 指向 Head，没有将 Head 指向 Tail，此时队列中有元素，需要返回 True（这块具体见下边代码分析）。 如果(s = h.next) != null，说明此时队列中至少有一个有效节点。如果此时 s.thread == Thread.currentThread()，说明等待队列的第一个有效节点中的线程与当前线程相同，那么当前线程是可以获取资源的；如果 s.thread != Thread.currentThread()，说明等待队列的第一个有效节点线程与当前线程不同，当前线程必须加入进等待队列。

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer#enq

if (t == null) { // Must initialize
  if (compareAndSetHead(new Node()))
    tail = head;
} else {
  node.prev = t;
  if (compareAndSetTail(t, node)) {
    t.next = node;
    return t;
  }
}
```

节点入队不是原子操作，所以会出现短暂的 head != tail，此时 Tail 指向最后一个节点，而且 Tail 指向 Head。如果 Head 没有指向 Tail（可见 5、6、7 行），这种情况下也需要将相关线程加入队列中。所以这块代码是为了解决极端情况下的并发问题。

#### 3.1.3 等待队列中线程出队列时机

回到最初的源码：

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

上文解释了 addWaiter 方法，这个方法其实就是把对应的线程以 Node 的数据结构形式加入到双端队列里，返回的是一个包含该线程的 Node。而这个 Node 会作为参数，进入到 acquireQueued 方法中。acquireQueued 方法可以对排队中的线程进行“获锁”操作。

总的来说，一个线程获取锁失败了，被放入等待队列，acquireQueued 会把放入队列中的线程不断去获取锁，直到获取成功或者不再需要获取（中断）。

下面我们从“何时出队列？”和“如何出队列？”两个方向来分析一下 acquireQueued 源码：

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  // 标记是否成功拿到资源
  boolean failed = true;
  try {
    // 标记等待过程中是否中断过
    boolean interrupted = false;
    // 开始自旋，要么获取锁，要么中断
    for (;;) {
      // 获取当前节点的前驱节点
      final Node p = node.predecessor();
      // 如果p是头结点，说明当前节点在真实数据队列的首部，就尝试获取锁（别忘了头结点是虚节点）
      if (p == head && tryAcquire(arg)) {
        // 获取锁成功，头指针移动到当前node
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      // 说明p为头节点且当前没有获取到锁（可能是非公平锁被抢占了）或者是p不为头结点，这个时候就要判断当前node是否要被阻塞（被阻塞条件：前驱节点的waitStatus为-1），防止无限循环浪费资源。具体两个方法下面细细分析
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
    }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

Note: The setHead method sets the current node as a virtual node, but does not modify waitStatus because it is data that is always needed.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void setHead(Node node) {
  head = node;
  node.thread = null;
  node.prev = null;
}

// java.util.concurrent.locks.AbstractQueuedSynchronizer

// Determine whether the current thread should be blocked based on the predecessor node
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
  // Get the node status of the predecessor node
  int ws = pred.waitStatus;
  // Indicates that the predecessor node is in the awake state
  if (ws == Node.SIGNAL)
    return true;
  // Through the enumeration value, we know that waitStatus>0 is the cancellation status
  if (ws > 0) {
    do {
      // Loop forward to find the cancellation node and remove the cancellation node from the queue
      node.prev = pred = pred.prev;
    } while (pred.waitStatus > 0);
    pred.next = node;
  } else {
    //Set the waiting status of the predecessor node to SIGNAL
    compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
  }
  return false;
}
```

parkAndCheckInterrupt is mainly used to suspend the current thread, block the call stack, and return the interrupt status of the current thread.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

The flow chart of the above method is as follows:

![](https://p0.meituan.net/travelcube/c124b76dcbefb9bdc778458064703d1135485.png)

As can be seen from the above figure, the condition for jumping out of the current loop is when "the preceding node is the head node and the current thread acquires the lock successfully." In order to prevent CPU resources from being wasted due to endless loops, we will judge the status of the previous node to decide whether to suspend the current thread. The specific suspension process is represented by a flow chart as follows (shouldParkAfterFailedAcquire process):

![](https://p0.meituan.net/travelcube/9af16e2481ad85f38ca322a225ae737535740.png)

Now that the doubts about releasing nodes from the queue have been dispelled, there are new questions:

- How is the cancellation node generated in shouldParkAfterFailedAcquire? When is a node's waitStatus set to -1?
- At what time is the node released notified to the suspended thread?

### 3.2 CANCELLED status node generation

Finally code in acquireQueued method:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    ...
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        ...
        failed = false;
        ...
      }
      ...
  } finally {
    if (failed)
      cancelAcquire(node);
    }
}
```

Mark the Node's status as CANCELLED through the cancelAcquire method. Next, we analyze the principle of this method line by line:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void cancelAcquire(Node node) {
  // Filter out invalid nodes
  if (node == null)
    return;
  //Set this node not to be associated with any thread, that is, a virtual node
  node.thread = null;
  Node pred = node.prev;
  // Use the predecessor node to skip the canceled node.
  while (pred.waitStatus > 0)
    node.prev = pred = pred.prev;
  // Get the successor node of the filtered predecessor node
  Node predNext = pred.next;
  //Set the status of the current node to CANCELLED
  node.waitStatus = Node.CANCELLED;
  // If the current node is the tail node, set the first non-cancelled node from the back to the front as the tail node
  // If the update fails, enter else. If the update is successful, set the successor node of tail to null.
  if (node == tail && compareAndSetTail(node, pred)) {
    compareAndSetNext(pred, predNext, null);
  } else {
    int ws;
    // If the current node is not the successor node of head, 1: Determine whether the predecessor node of the current node is SIGNAL, 2: If not, set the predecessor node to SIGNAL to see if it is successful.
    // If either 1 or 2 is true, then determine whether the thread of the current node is null.
    // If the above conditions are met, point the successor pointer of the current node's predecessor node to the current node's successor node
    if (pred != head && ((ws = pred.waitStatus) == Node.SIGNAL || (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) && pred.thread != null) {
      Node next = node.next;
      if (next != null && next.waitStatus <= 0)
        compareAndSetNext(pred, predNext, next);
    } else {
      // If the current node is the successor node of head, or the above conditions are not met, then wake up the successor node of the current node
      unparkSuccessor(node);
    }
    node.next = node; // help GC
  }
}
```

Current process:

- Get the predecessor node of the current node. If the status of the predecessor node is CANCELLED, then traverse forward to find the first node with waitStatus <= 0, associate the found Pred node with the current Node, and set the current Node to CANCELLED.
- Based on the position of the current node, consider the following three situations:

(1) The current node is the tail node.

(2) The current node is the successor node of Head.

(3) The current node is not the successor node of Head, nor is it the tail node.

According to the second item above, let’s analyze the process of each situation.

The current node is the tail node.

![](https://p1.meituan.net/travelcube/b845211ced57561c24f79d56194949e822049.png)

The current node is the successor node of Head.

![](https://p1.meituan.net/travelcube/ab89bfec875846e5028a4f8fead32b7117975.png)

The current node is not the successor node of Head, nor is it the tail node.

![](https://p0.meituan.net/travelcube/45d0d9e4a6897eddadc4397cf53d6cd522452.png)

Through the above process, we already have a general understanding of the generation and changes of the CANCELLED node status, but why do all changes operate on the Next pointer and not on the Prev pointer? Under what circumstances will the Prev pointer be operated?> When cancelAcquire is executed, the previous node of the current node may have been removed from the queue (the shouldParkAfterFailedAcquire method in the Try code block has been executed). If the Prev pointer is modified at this time, it may cause Prev to point to another Node that has been removed from the queue, so this change of the Prev pointer is unsafe. In the shouldParkAfterFailedAcquire method, the following code will be executed, which is actually processing the Prev pointer. shouldParkAfterFailedAcquire will only be executed when the lock acquisition fails. After entering this method, it means that the shared resource has been acquired, and the nodes before the current node will not change, so it is safer to change the Prev pointer at this time.
>
> ```java
> do {
> node.prev = pred = pred.prev;
> } while (pred.waitStatus > 0);
> ```

### 3.3 How to unlock

We have analyzed the basic process in the locking process, and then we will analyze the basic process of unlocking. Since ReentrantLock does not distinguish between fair locks and unfair locks when unlocking, we directly look at the unlocking source code:

```java
// java.util.concurrent.locks.ReentrantLock

public void unlock() {
  sync.release(1);
}
```

It can be seen that the essence of releasing the lock is done through the framework.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  if (tryRelease(arg)) {
    Node h = head;
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

Sync, the parent class of fair locks and unfair locks in ReentrantLock, defines the lock release mechanism for reentrant locks.

```java
// java.util.concurrent.locks.ReentrantLock.Sync

//The method returns whether the current lock is not held by the thread
protected final boolean tryRelease(int releases) {
  // Reduce the number of reentrants
  int c = getState() - releases;
  //The current thread is not the thread holding the lock, and an exception is thrown.
  if (Thread.currentThread() != getExclusiveOwnerThread())
    throw new IllegalMonitorStateException();
  boolean free = false;
  // If all holding threads are released, set all threads of the current exclusive lock to null and update state
  if (c == 0) {
    free = true;
    setExclusiveOwnerThread(null);
  }
  setState(c);
  return free;
}
```

Let's explain the following source code:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  // If the custom tryRelease above returns true, it means that the lock is not held by any thread.
  if (tryRelease(arg)) {
    // Get the head node
    Node h = head;
    // If the head node is not empty and the waitStatus of the head node is not an initialization node, release the thread suspension state.
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

Why is the judgment condition here h != null && h.waitStatus != 0?

> h == null Head has not been initialized yet. In the initial case, head == null, the first node is added to the queue, and Head will be initialized as a virtual node. Therefore, if there is no time to join the team here, head == null will occur.
>
> h != null && waitStatus == 0 indicates that the thread corresponding to the successor node is still running and does not need to be awakened.
>
> h != null && waitStatus < 0 indicates that the successor node may be blocked and needs to be woken up.

Take another look at the unparkSuccessor method:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void unparkSuccessor(Node node) {
  // Get the head node waitStatus
  int ws = node.waitStatus;
  if (ws < 0)
    compareAndSetWaitStatus(node, ws, 0);
  // Get the next node of the current node
  Node s = node.next;
  // If the next node is null or the next node is canceled, find the non-cancelled node at the beginning of the queue
  if (s == null || s.waitStatus > 0) {
    s = null;
    // Start searching from the tail node, go to the head of the queue, and find the first node in the queue with waitStatus<0.
    for (Node t = tail; t != null && t != node; t = t.prev)
      if (t.waitStatus <= 0)
        s = t;
  }
  // If the next node of the current node is not empty and the status is <= 0, unpark the current node
  if (s != null)
    LockSupport.unpark(s.thread);
}
```

Why do we need to find the first non-Canceled node from back to front? Here’s why.

Previous addWaiter method:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
```

We can see from here that joining the node into the queue is not an atomic operation. In other words, node.prev = pred; compareAndSetTail(pred, node) can be regarded as the atomic operation of Tail joining the queue. However, pred.next = node; has not been executed yet. If the unparkSuccessor method is executed at this time, there is no way to search from front to back, so you need to search from back to front. There is another reason. When the CANCELLED status node is generated, the Next pointer is disconnected first, and the Prev pointer is not disconnected. Therefore, all Nodes must be traversed from back to front.

To sum up, if you search from front to back, due to the non-atomic operation of enqueuing in extreme cases and the operation of disconnecting the Next pointer during the generation of CANCELLED nodes, it may not be possible to traverse all nodes. Therefore, after waking up the corresponding thread, the corresponding thread will continue to execute. How to handle interruption after continuing to execute acquireQueued method?

### 3.4 Execution process after interruption and recovery

After waking up, return Thread.interrupted(); will be executed. This function returns the interrupt status of the current execution thread and clears it.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
  LockSupport.park(this);
  return Thread.interrupted();
}
```

Returning to the acquireQueued code, when parkAndCheckInterrupt returns True or False, the value of interrupted is different, but the next loop will be executed. If the lock is acquired successfully at this time, the current interrupted will be returned.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    boolean interrupted = false;
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
      }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}```

If acquireQueued is True, the selfInterrupt method will be executed.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static void selfInterrupt() {
  Thread.currentThread().interrupt();
}
```

This method is actually to interrupt the thread. But why do we need to interrupt the thread after acquiring the lock? This part belongs to the collaborative interrupt knowledge content provided by Java. Interested students can check it out. Here is a brief introduction:

1. When the interrupt thread is awakened, the reason for the awakening is not known. It may be that the current thread was interrupted while waiting, or it may be awakened after the lock is released. Therefore, we check the interrupt flag through the Thread.interrupted() method (this method returns the interrupt status of the current thread and sets the interrupt flag of the current thread to False), and records it. If it is found that the thread has been interrupted, interrupt it again.
2. The thread is awakened while waiting for resources. After waking up, it will continue to try to acquire the lock until it grabs the lock. That is to say, during the entire process, it does not respond to interrupts, but only records interrupt records. Finally, the lock is grabbed and returned. If it has been interrupted, another interruption needs to be added.

The processing method here mainly uses the runWorker in the basic operating unit Worder in the thread pool, and performs additional judgment processing through Thread.interrupted(). Interested students can take a look at the ThreadPoolExecutor source code.

### 3.5 Summary

We raised some questions in Section 1.3 and now answer them.

> Q: What is the follow-up process if a thread fails to acquire a lock?
>
> A: There is some kind of queuing mechanism. The thread continues to wait, and the possibility of acquiring the lock remains, and the process of acquiring the lock continues.
>
> Q: Since we are talking about the queuing waiting mechanism, there must be some kind of queue formed. What is the data structure of such a queue?
>
> A: A FIFO deque that is a CLH variant.
>
> Q: When can a thread in the queue waiting mechanism have the opportunity to acquire a lock?
>
> A: You can read section 2.3.1.3 in detail.
>
> Q: If a thread in the queue waiting mechanism has been unable to acquire the lock, does it need to wait forever? Or are there other strategies to solve this problem?
>
> A: The status of the node where the thread is located will change to the canceled status, and the node in the canceled status will be released from the queue. See section 2.3.2 for details.
>
> Q: The Lock function locks through the Acquire method, but how exactly is it locked?
>
> A: AQS's Acquire will call the tryAcquire method. tryAcquire is implemented by each custom synchronizer, and the locking process is completed through tryAcquire.

## 4 AQS Application

### 4.1 Reentrant application of ReentrantLock

ReentrantLock's reentrancy is one of the good applications of AQS. After understanding the above knowledge points, we can easily know how to implement ReentrantLock's reentrancy. In ReentrantLock, whether it is a fair lock or an unfair lock, there is a logic.

Fair lock:

```java
// java.util.concurrent.locks.ReentrantLock.FairSync#tryAcquire

if (c == 0) {
  if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) {
    setExclusiveOwnerThread(current);
    return true;
  }
}
else if (current == getExclusiveOwnerThread()) {
  int nextc = c + acquires;
  if (nextc < 0)
    throw new Error("Maximum lock count exceeded");
  setState(nextc);
  return true;
}
```

Unfair lock:

```java
// java.util.concurrent.locks.ReentrantLock.Sync#nonfairTryAcquire

if (c == 0) {
  if (compareAndSetState(0, acquires)){
    setExclusiveOwnerThread(current);
    return true;
  }
}
else if (current == getExclusiveOwnerThread()) {
  int nextc = c + acquires;
  if (nextc < 0) // overflow
    throw new Error("Maximum lock count exceeded");
  setState(nextc);
  return true;
}
```

As you can see from the above two paragraphs, there is a synchronization state State to control the overall reentrant situation. State is modified with Volatile to ensure certain visibility and orderliness.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

Next, let’s look at the main process of the State field:

1. State is 0 when initialized, indicating that no thread holds the lock.
2. When a thread holds the lock, the value will be +1 based on the original value. If the same thread obtains the lock multiple times, it will be +1 multiple times. This is the concept of reentrancy.
3. Unlocking also changes this field from -1 to 0, and this thread releases the lock.

### 4.2 Application scenarios in JUC

In addition to the reentrant application of ReentrantLock above, AQS, as a concurrent programming framework, provides good solutions for many other synchronization tools. The following lists several synchronization tools in JUC, and gives a general introduction to the application scenarios of AQS:

| Synchronization tool | Association between synchronization tool and AQS |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ReentrantLock | Use AQS to save the number of times a lock is repeatedly held. When a thread acquires a lock, ReentrantLock records the identity of the thread currently acquiring the lock, which is used to detect repeated acquisitions and handle exceptions when the wrong thread attempts to unlock the operation. |
| Semaphore | Use AQS sync state to hold the current count of a semaphore. tryRelease increments the count and acquireShared decrements it.                                                                  |
| CountDownLatch | Uses AQS sync status to represent counts. When the count is 0, all Acquire operations (await method of CountDownLatch) can pass.                                                   |
| ReentrantReadWriteLock | Use 16 bits in the AQS synchronization state to save the number of times the write lock is held, and the remaining 16 bits are used to save the number of times the read lock is held.                                                                         |
| ThreadPoolExecutor | Worker uses AQS synchronization status to set exclusive thread variables (tryAcquire and tryRelease).                                                                              |

### 4.3 Custom synchronization tool

After understanding the basic principles of AQS, implement a synchronization tool yourself according to the AQS knowledge points mentioned above.

```java
public class LeeLock {

    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire (int arg) {
            return compareAndSetState(0, 1);
        }

        @Override
        protected boolean tryRelease (int arg) {
            setState(0);
            return true;
        }

        @Override
        protected boolean isHeldExclusively () {
            return getState() == 1;
        }
    }

    private Sync sync = new Sync();

    public void lock () {
        sync.acquire(1);
    }

    public void unlock () {
        sync.release(1);
    }
}```

Complete certain synchronization functions through our own defined Lock.

```java
public class LeeMain {

    static int count = 0;
    static LeeLock leeLock = new LeeLock();

    public static void main (String[] args) throws InterruptedException {

        Runnable runnable = new Runnable() {
            @Override
            public void run () {
                try {
                    leeLock.lock();
                    for (int i = 0; i < 10000; i++) {
                        count++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    leeLock.unlock();
                }

            }
        };
        Thread thread1 = new Thread(runnable);
        Thread thread2 = new Thread(runnable);
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
        System.out.println(count);
    }
}
```

The result of running the above code will be 20000 every time. The synchronization function can be achieved with a few simple lines of code. This is the power of AQS.

## 5 Summary

There are too many scenarios where we use concurrency in our daily development, but not many people understand the basic framework principles within concurrency. Due to space reasons, this article only introduces the principle of reentrant lock ReentrantLock and the principle of AQS. I hope it can be a stepping stone for everyone to understand synchronizers such as AQS and ReentrantLock.

## References

- Lea D. The java. util. concurrent synchronizer framework\[J]. Science of Computer Programming, 2005, 58(3): 293-309.
- "Java Concurrent Programming in Practice"
- [Must-talk about Java “lock”](https://tech.meituan.com/2018/11/15/java-lock.html)

<!-- @include: @article-footer.snippet.md -->