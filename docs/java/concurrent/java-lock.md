---
title: Java 锁详解：互斥锁、读写锁、自旋锁与 synchronized 锁优化
description: Java 锁机制系统梳理：从互斥锁、读写锁、自旋锁到 synchronized、ReentrantLock、AQS、StampedLock，讲清锁分类、实现原理、版本差异与选型建议。
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: Java锁,互斥锁,读写锁,自旋锁,synchronized,ReentrantLock,AQS,StampedLock,CAS,锁升级,锁优化,Java并发
---

学 Java 并发时，锁相关的名字很容易让大家搞混：互斥锁、读写锁、自旋锁、悲观锁、乐观锁、CAS、AQS、`synchronized`、`ReentrantLock`、`StampedLock`、偏向锁、轻量级锁、重量级锁。

这些名字并不都在同一个分类维度里。

有的说“谁能进入临界区”，比如互斥锁和读写锁；有的说“拿不到锁时怎么等”，比如自旋锁和阻塞锁；有的说“修改共享数据前先锁住，还是提交时再校验”，比如悲观锁和乐观锁；还有的说 HotSpot 在不同竞争强度下怎么优化 `synchronized`。

这篇文章先把锁的坐标系立起来，再看 Java 里常用锁工具怎么落地。关于悲观锁、乐观锁和 CAS 的细节，站内已经有两篇文章详细介绍：[乐观锁和悲观锁详解](./optimistic-lock-and-pessimistic-lock.md)、[CAS 详解](./cas.md)。本文只保留必要上下文，重点放在“锁体系怎么串起来”。

PS：本文主要以 HotSpot / OpenJDK 为背景。`synchronized` 的 monitor 互斥和内存语义属于 Java/JVM 规范层面；对象头、Mark Word、轻量级锁、锁膨胀这些内容属于 HotSpot 实现优化，Java 语言规范并不承诺固定流程。偏向锁从 JDK 15 起默认禁用并废弃相关参数，JDK 18 起相关参数已经 obsoleted；虚拟线程与 `synchronized` pinning 的结论也要区分 JDK 21~23 和 JDK 24+。

先用一张表把分类维度拆开：

| 维度           | 典型名称                                       | 回答的问题                           |
| -------------- | ---------------------------------------------- | ------------------------------------ |
| 临界区互斥方式 | 互斥锁、读写锁                                 | 谁能进入临界区                       |
| 等待策略       | 自旋锁、阻塞锁                                 | 拿不到锁时怎么等                     |
| 并发控制思路   | 悲观锁、乐观锁                                 | 先锁住再改，还是提交时校验           |
| 原子更新机制   | CAS、Atomic 类                                 | 如何无阻塞更新单个变量               |
| JVM 实现优化   | 轻量级锁、重量级锁、锁膨胀                     | HotSpot 如何降低 `synchronized` 成本 |
| Java 锁工具    | `synchronized`、`ReentrantLock`、`StampedLock` | 代码里具体用什么                     |

## 一把锁到底保护什么？

锁要解决的是临界区问题。临界区指那段会访问共享可变状态，并且不能让多个执行单元随意交错执行的代码。

![临界区保护访问协议示意图：多个线程通过统一加锁入口访问共享状态，绕开锁或更换锁对象都会破坏互斥关系](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-critical-section.png)

比如下面这个自增：

```java
count++;
```

源码里只有一行，但这行代码不能当成不可拆的动作。线程通常要先读出 `count`，再加 1，最后写回去。两个线程同时执行时，可能都读到旧值 `0`，各自算出 `1`，最后都把 `1` 写回去。两个线程都执行了自增，结果只加了一次。

锁的做法很直接：进入这段代码前先获得锁，执行完再释放锁。只要所有访问同一份共享状态的代码都遵守同一把锁的约定，就可以把原本可能交错的读写压成一段互斥执行。

这里有一句很容易被忽略的话：**锁真正保护的是访问对象状态的协议，对象本身不会因为被加锁就自动安全**。

`synchronized (account)` 不会神奇地让 `account` 的所有字段都安全。如果另一段代码绕过这把锁直接改 `account.balance`，线程安全照样会被破坏。MIT 6.005 的锁课程反复强调的也是这个点：锁应该守住某个数据抽象的表示不变量，随手找个对象套一下，并不能保证不变量一直成立。

## 互斥锁：同一时刻只允许一个线程进入

互斥锁（Mutex）的规则很简单：同一时刻，最多只有一个线程持有锁并进入临界区。

在 Java 中，`synchronized` 和 `ReentrantLock` 都可以作为互斥锁使用：

```java
class Counter {
    private int count;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}
```

换成 `ReentrantLock`，写法会啰嗦一点，但能拿到更多控制权：

```java
class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
}
```

`try/finally` 不能省。`synchronized` 的释放动作由 JVM 帮你做，代码块正常退出或异常退出都会释放 monitor；`ReentrantLock` 是显式 API，拿锁和解锁要自己配对。Oracle 的 `ReentrantLock` 文档也把“调用 `lock` 后立刻进入 `try` 块”作为推荐写法。

互斥锁真正难的地方不在语法，而在锁粒度。

一把大锁把所有操作都包住，最省心，但并发度低；多把小锁分别保护不同数据，吞吐可能更好，但锁顺序、死锁、状态一致性都更难管。OSTEP 在讲 POSIX mutex 时也提到过这个取舍：不同数据用不同锁能增加并发，但程序员必须清楚每把锁到底保护哪一块状态。

## 读写锁：读读共享，写操作独占

互斥锁对读操作也很严格：只要一个线程在读，另一个线程也不能进来读。但很多业务对象有一个特点：读不会改变状态，多个读线程同时执行并不会互相破坏。

读写锁就是为这种场景准备的。

它把访问分成两类：

- 读锁：共享锁，多个线程可以同时持有。
- 写锁：独占锁，只能一个线程持有，并且写锁和读锁互斥。

对应规则也很好记：

- 读读不互斥。
- 读写互斥。
- 写写互斥。

Java 里的典型实现是 `ReentrantReadWriteLock`：

```java
class ProfileCache {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    private final Map<Long, String> cache = new HashMap<>();

    public String get(long userId) {
        readLock.lock();
        try {
            return cache.get(userId);
        } finally {
            readLock.unlock();
        }
    }

    public void put(long userId, String profile) {
        writeLock.lock();
        try {
            cache.put(userId, profile);
        } finally {
            writeLock.unlock();
        }
    }
}
```

读写锁适合读多写少、读操作足够短、数据结构不容易被拆坏的场景。它不适合所有缓存，也不一定比互斥锁快。如果写操作很频繁，读线程和写线程会不断互相挡路，读写锁的维护成本反而可能抵消收益。

Java 还提供了 `StampedLock`，它支持写锁、悲观读锁和乐观读。乐观读没有真正持有传统读锁；它会先拿一个 stamp，读完后再校验期间有没有写入发生：

```java
class Point {
    private final StampedLock lock = new StampedLock();
    private double x;
    private double y;

    double distanceFromOrigin() {
        long stamp = lock.tryOptimisticRead();
        double currentX = x;
        double currentY = y;
        if (!lock.validate(stamp)) {
            stamp = lock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return Math.hypot(currentX, currentY);
    }
}
```

`StampedLock` 的乐观读有边界：读到的数据可能短暂不一致，所以只适合能在本地变量里完成读取、并且可以通过 `validate` 失败后重读来兜底的短读场景。它也很难直接替代 `ReentrantReadWriteLock`，尤其要注意它不支持重入。

## 自旋锁：不阻塞，先原地等一会儿

线程拿不到锁时，通常有两种等待方式：

- 阻塞：挂起当前线程，让操作系统之后再唤醒。
- 自旋：不挂起线程，在 CPU 上循环检查锁是否可用。

自旋锁适合临界区非常短的场景。比如持锁线程马上就会释放锁，如果等待线程直接阻塞，线程挂起和唤醒的成本可能比“原地转几圈”等待还高。

问题也在这里：自旋会付出 CPU 成本，它会持续占用 CPU。如果锁很久不释放，或者等待线程很多，自旋会把 CPU 时间浪费在空转上。

Java 代码里可以用 CAS 写出一个很小的自旋锁示例：

```java
class SpinLock {
    private final AtomicReference<Thread> owner = new AtomicReference<>();

    public void lock() {
        Thread current = Thread.currentThread();
        while (!owner.compareAndSet(null, current)) {
            Thread.onSpinWait();
        }
    }

    public void unlock() {
        Thread current = Thread.currentThread();
        if (!owner.compareAndSet(current, null)) {
            throw new IllegalMonitorStateException();
        }
    }
}
```

这段代码只是用来说明“自旋 + CAS”的关系，不建议直接拿去做业务锁。真实锁要考虑可重入、公平性、中断、超时、异常释放、监控指标、等待队列等问题。JDK 已经把这些复杂性封装在 `synchronized`、`ReentrantLock`、AQS 同步器和 Atomic 类里了。

## 悲观锁、乐观锁和 CAS 的位置

悲观锁和乐观锁描述的是两种并发控制思路，不对应某个固定 Java 类。

悲观锁假设冲突很可能发生，所以先把资源锁住再操作。`synchronized`、`ReentrantLock`、数据库 `SELECT ... FOR UPDATE` 都是常见例子。

乐观锁假设冲突不频繁，先不阻塞别人，提交修改时再检查数据有没有被改过。数据库里的 `version` 字段、Java Atomic 类里的 CAS，都属于这个方向。

CAS（Compare-And-Swap，比较并交换）可以理解成一种硬件支持的原子更新方式：只有当内存中的值仍然等于预期旧值时，才把它改成新值。否则说明有人先改过了，当前线程可以选择重试、放弃或走降级逻辑。

CAS 常见问题有三个：

- 失败重试会消耗 CPU，冲突越激烈越明显。
- 只能很自然地处理单个变量，多个变量的一致性要额外设计。
- ABA 问题：值从 A 变成 B，又变回 A，单看值会以为它没变过。

ABA 可以用版本号、时间戳或带标记引用解决。Java 里有 `AtomicStampedReference` 和 `AtomicMarkableReference` 这类工具，不过在业务代码里更常见的做法是让数据模型本身带版本号。

这块如果继续展开，就会和已有文章重复。想看实现方式、版本号示例、ABA 处理和 Atomic 类源码，可以继续读：

- [乐观锁和悲观锁详解](./optimistic-lock-and-pessimistic-lock.md)
- [CAS 详解](./cas.md)
- [Atomic 原子类总结](./atomic-classes.md)

## synchronized 的底层：monitor、字节码和内存语义

`synchronized` 是 Java 语言内置的同步机制，可以修饰实例方法、静态方法，也可以包住代码块。

```java
class Account {
    private long balance;

    public synchronized void deposit(long amount) {
        balance += amount;
    }

    public long balance() {
        synchronized (this) {
            return balance;
        }
    }
}
```

同步方法和同步代码块在字节码层面的表现不完全一样：

- 同步方法依赖方法访问标志 `ACC_SYNCHRONIZED`。
- 同步代码块会生成 `monitorenter` 和 `monitorexit` 指令。

不管表现形式如何，语义都是进入 monitor、退出 monitor。Java 语言规范还规定了锁释放和后续锁获取之间的 happens-before 关系：一个线程释放某把锁之前的写入，对随后获得同一把锁的线程可见。

这也是 `synchronized` 和“只做互斥”的普通概念锁不同的地方。它同时提供互斥和内存可见性。只保护临界区但不建立可见性，另一个线程可能仍然读到旧值。

另外，`synchronized` 是可重入的。一个线程已经持有某个对象的 monitor 时，可以再次进入同一把锁保护的代码，JVM 会记录重入次数，退出时逐层减少。

```java
class ReentrantDemo {
    public synchronized void outer() {
        inner();
    }

    public synchronized void inner() {
        // 同一线程可以再次进入 this 的 monitor
    }
}
```

## synchronized 锁优化：别把“锁升级”背成固定口诀

很多资料会把 `synchronized` 讲成“无锁 -> 偏向锁 -> 轻量级锁 -> 重量级锁”。这条线索对理解 HotSpot 早期优化很有帮助，但不能脱离版本。

JDK 6 之后，HotSpot 为 `synchronized` 做了大量优化。偏向锁面向“总是同一个线程进入同一把锁”的场景；轻量级锁面向“竞争不激烈，多个线程错开进入”的场景；重量级锁则会用到 ObjectMonitor，竞争线程可能阻塞和唤醒。

版本差异要单独记一下：

- JDK 6 到 JDK 14：偏向锁是 HotSpot 常见优化之一。
- JDK 15：JEP 374 将偏向锁默认禁用，并废弃相关参数。
- JDK 18：偏向锁相关参数被 obsoleted，传入后会被忽略并给出警告。
- JDK 21 到 JDK 23：虚拟线程在 `synchronized` 中阻塞时可能 pin 住平台线程。
- JDK 24：JEP 491 改进了虚拟线程与 `synchronized` 的配合，阻塞在 `synchronized` 上的虚拟线程可以释放底层平台线程，减少 pinning 问题。

所以，面试或写文章时可以讲“HotSpot 曾经通过偏向锁、轻量级锁、重量级锁降低 `synchronized` 成本”，但不要把偏向锁说成现代 JDK 一定会走的默认路径。

工程上更重要的是另一个结论：早年那句“能不用就不用”已经不适合今天的 `synchronized`。普通互斥场景下，它语法简单、异常释放安全、JIT 优化成熟。只有当你需要公平锁、可中断获取、超时获取、多个条件队列时，才更自然地转向 `ReentrantLock`。

## ReentrantLock、Condition 和 AQS 怎么接上

`ReentrantLock` 提供了比 `synchronized` 更细的控制能力：

- 可以选择公平锁或非公平锁。
- 可以用 `lockInterruptibly()` 响应中断。
- 可以用 `tryLock()` 或 `tryLock(timeout, unit)` 避免无限等待。
- 可以创建多个 `Condition`，把不同等待条件拆开管理。

一个典型写法如下：

```java
class BoundedBuffer<E> {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    private final Queue<E> queue = new ArrayDeque<>();
    private final int capacity;

    BoundedBuffer(int capacity) {
        this.capacity = capacity;
    }

    public void put(E item) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.add(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public E take() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            E item = queue.remove();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

这里的 `while` 也不能随便改成 `if`。线程被唤醒后，只能说明“有机会重新竞争锁并检查条件”，不代表条件一定成立。虚假唤醒、多个等待线程竞争、条件被别的线程先消费掉，都要求醒来后再次检查。

`ReentrantLock` 底层依赖 AQS（AbstractQueuedSynchronizer）。AQS 可以先粗略理解成一套同步器框架：用一个 `state` 表示同步状态，用 FIFO 队列管理没抢到资源的线程，再配合 CAS、`LockSupport.park/unpark` 完成排队、阻塞和唤醒。

很多并发工具都建立在 AQS 之上，比如 `ReentrantLock`、`Semaphore`、`CountDownLatch`、`ReentrantReadWriteLock`。如果想把队列、`state`、CAS 和阻塞唤醒这条线继续拆开，可以接着看 [AQS 详解](./aqs.md) 和 [从ReentrantLock的实现看AQS的原理及应用](./reentrantlock.md)。

## Java 锁该怎么选？

选锁时别急着比较“哪个最快”。锁的表现跟临界区长度、竞争强度、线程数量、失败后的处理方式都有关。先把几个问题问清楚：这段代码保护哪份共享状态？持锁时间大概多长？拿不到锁时能不能等待？等待失败后是返回、重试，还是直接报错？

如果只是保护 JVM 进程内的一小段状态，比如更新几个字段、维护一个内存 Map、切换对象状态，`synchronized` 往往就够了。它写起来短，退出代码块时自动释放锁，也少了手写 `unlock()` 漏掉的风险。等到代码需要超时获取、可中断获取、公平锁，或者要用多个 `Condition` 管理不同等待队列，再换成 `ReentrantLock` 会更顺手。

读多写少时，可以看 `ReentrantReadWriteLock`。这里的重点是“写少”，光有读方法还不够。如果写操作很频繁，读锁和写锁会一直互相挡，维护读写状态也有成本，最后未必比一把互斥锁更划算。`StampedLock` 的乐观读更挑场景：读逻辑要短，读到中间状态也不能出大问题，并且必须接受校验失败后重新读一遍。

如果只是更新一个计数、状态位或引用，优先看 Atomic 类、`LongAdder`、`LongAccumulator` 这类工具。它们适合很短的原子更新，不适合把一整段业务流程塞进 CAS 重试循环里。业务流程越长，失败重试越容易把 CPU 消耗在无效循环上，也更难处理副作用。

如果问题已经越过 JVM 边界，比如多个应用实例同时改同一行数据库记录，Java 里的锁就管不住了。冲突不频繁时，可以用版本号做乐观锁；冲突比较频繁、必须强一致修改时，通常要回到数据库行锁、`SELECT ... FOR UPDATE`、唯一约束这类数据库机制。再往外走到跨服务互斥，就需要 Redis、ZooKeeper、数据库等外部系统来承接，不能指望 `synchronized` 或 `ReentrantLock`。

锁粒度也别一味追求“小”。一把大锁容易保证正确性，但吞吐可能受影响；拆成多把小锁，竞争会少一些，可锁顺序、死锁和排查成本都会上来。很多时候，先用清楚的一把锁把不变量守住，再根据压测结果拆锁，比一开始就设计一堆细粒度锁更稳。

## 常见坑

**锁对象不稳定。**

有些代码看起来加了锁，实际可能锁到了不同对象。常见原因是锁对象会变，比如字符串拼接结果、装箱对象、可重新赋值的字段。线程 A 进来时锁的是旧对象，线程 B 进来时锁的是新对象，两边互不影响，临界区就被拆开了。

```java
private Object lock = new Object();

public void update() {
    synchronized (lock) {
        lock = new Object(); // 后续线程可能会锁到另一把锁
    }
}
```

如果需要单独的锁对象，通常把它定义成 `private final`，并且不要把它暴露给外部代码。

**锁住外部可见对象。**

`synchronized (this)` 和 `synchronized (SomeClass.class)` 有时没问题，但它们也可能被外部代码拿来加锁，导致你无法控制锁竞争范围。库代码尤其要谨慎，通常更推荐私有 final 锁对象。

```java
private final Object lock = new Object();
```

**持锁期间做慢操作。**

持锁时访问数据库、调用 RPC、写大文件，都会拉长锁占用时间。锁占用越久，等待线程越多，超时、线程池耗尽和死锁风险都会变高。

**锁顺序不一致。**

两个线程分别按 `A -> B` 和 `B -> A` 的顺序加锁，很容易形成死锁。多把锁同时使用时，要给资源排一个全局稳定顺序。死锁的完整介绍可以看 [死锁详解](../../cs-basics/operating-system/dead-lock.md)。

**把线程安全类和复合操作混为一谈。**

`ConcurrentHashMap` 的单次 `get`、`put` 是线程安全的，但“先判断不存在，再插入”是复合操作，需要用 `computeIfAbsent` 这类原子方法，或者额外同步。

```java
// 不推荐：containsKey 和 put 之间可能被其他线程插入
if (!map.containsKey(key)) {
    map.put(key, createValue());
}

// 推荐：把复合逻辑交给 ConcurrentHashMap 的原子方法
map.computeIfAbsent(key, ignored -> createValue());
```

**只看锁，不看资源池。**

线上很多“卡住”和 Java 锁死锁无关，线程可能都在等数据库连接、HTTP 连接、线程池队列或外部服务返回。线程栈里看到 `WAITING` 只能说明线程在等，判断死锁还要找到稳定的等待环。

## 总结

锁是一组并发控制工具的总称，这个概念还是比较大的。

互斥锁和读写锁回答“谁能进临界区”；自旋锁和阻塞锁回答“拿不到锁怎么等”；悲观锁和乐观锁回答“冲突发生前后怎么处理”；CAS 和 Atomic 类解决单变量原子更新；`synchronized`、`ReentrantLock`、`StampedLock`、AQS 则是 Java 把这些思想落到代码里的方式。

真正写代码时，先把共享状态和不变量找出来，再决定锁保护什么、锁粒度多大、等待是否能中断、失败是否能重试。工具只是手段，真正要守住的是同一套同步协议：所有访问共享状态的路径都必须遵守它。

## 参考资料

- [The Java Language Specification, Chapter 17. Threads and Locks](https://docs.oracle.com/javase/specs/jls/se24/html/jls-17.html)
- [The Java Virtual Machine Specification, monitorenter](https://docs.oracle.com/javase/specs/jvms/se24/html/jvms-6.html#jvms-6.5.monitorenter)
- [Oracle Java API: Lock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/Lock.html)
- [Oracle Java API: ReentrantLock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/ReentrantLock.html)
- [Oracle Java API: StampedLock](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/StampedLock.html)
- [OpenJDK JEP 374: Deprecate and Disable Biased Locking](https://openjdk.org/jeps/374)
- [OpenJDK JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491)
- [OSTEP 中文版：Locks](https://pages.cs.wisc.edu/~remzi/OSTEP/Chinese/28.pdf)
- [MIT 6.005: Locks and Synchronization](http://web.mit.edu/6.005/www/fa15/classes/23-locks/)
