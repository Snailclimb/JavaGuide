---
title: 操作系统锁与同步机制详解：mutex、semaphore、condition variable、spinlock 与 futex
description: 操作系统锁与同步机制高频面试题总结，讲清临界区、mutex、spinlock、semaphore、condition variable、futex、原子指令、内存顺序、优先级反转，以及用户态锁和 Linux 内核锁的区别。
category: 计算机基础
tag:
  - 操作系统
  - Linux
  - 并发编程
head:
  - - meta
    - name: keywords
      content: 操作系统锁,同步机制,临界区,互斥锁,mutex,自旋锁,spinlock,信号量,semaphore,条件变量,condition variable,futex,原子指令,内存屏障,优先级反转,Linux内核锁,操作系统面试题,并发编程
---

两个线程同时给同一个计数器加 1，看起来很小的一件事，最后结果却可能少加一次。

原因其实很简单。`count++` 在源码里是一行，机器执行时通常要经历读取、计算、写回几个步骤。线程 A 刚读到旧值，还没写回；线程 B 也读到了同一个旧值。两边各自算出新值，最后写回的却是同一个结果。

为了避免这类并发问题，操作系统提供了锁和一系列同步机制。它们要解决的问题不只是一段代码能不能同时执行，还包括线程该不该阻塞、资源数量怎么控制、条件不满足时怎么等待。到了内核里，还要继续考虑中断、抢占、多 CPU、实时性和调度延迟。

这篇文章只讲操作系统视角下的同步机制。Java 里的 `synchronized`、`ReentrantLock`、AQS、CAS 和锁优化已经在 [Java 锁详解](../../java/concurrent/java-lock.md) 里展开过，这里不会重复那套内容。本文重点看 mutex、semaphore、condition variable、spinlock、futex 这些概念各自解决什么问题。等理解了这些同步原语，再去看 [死锁详解](./dead-lock.md)，就更容易看懂“等待关系为什么会绕成环”。

先通过一张表大致看一下这些同步机制分别解决什么问题：

| 机制               | 主要解决什么             | 等待方式                          | 常见场景                           |
| ------------------ | ------------------------ | --------------------------------- | ---------------------------------- |
| mutex              | 临界区互斥               | 语义上等待锁可用，实现可自旋/阻塞 | 保护共享结构                       |
| spinlock           | 极短临界区互斥           | 忙等                              | 内核中不能睡眠的路径               |
| semaphore          | 资源计数、并发数量控制   | 计数为 0 时等待                   | 缓冲区槽位、连接数、并发任务数     |
| condition variable | 等某个共享状态变为真     | 原子释放 mutex 并等待             | 队列非空、任务完成、缓冲区非满     |
| futex              | 用户态锁的阻塞/唤醒底座  | 用户态快路径，内核慢路径          | pthread mutex、运行时同步器        |
| memory barrier     | 约束内存访问顺序和可见性 | 通常不负责阻塞                    | 无锁结构、内核同步、设备寄存器访问 |

## 临界区到底在保护什么？

**临界区（critical section）** 指的是访问共享可变状态、并且不能被多个执行流随意交错执行的代码段。它可能是用户程序里的一段计数器更新，也可能是内核里修改调度队列、文件描述符表、页表、设备状态的代码。

![临界区保护访问协议示意图：多个线程通过统一加锁入口访问共享状态，绕开锁或更换锁对象都会破坏互斥关系](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-critical-section.png)

评价一种锁或同步机制时，可以从正确性、进展性、公平性和性能这 4 个角度看。

**第一是正确性。** 同一时刻不能让多个执行流随意交错修改共享状态；多 CPU 场景里，还要有必要的同步语义，让一个线程释放锁前写入的状态，能被后续拿到同一把锁的线程按预期看到。

**第二是进展性。** 同步机制本身不能把所有等待者都困住，导致系统再也没人能往前走。

**第三是公平性。** 多个线程都在等同一把锁时，尽量避免某个线程长期拿不到锁。实际系统不一定严格 FIFO，但饥饿问题必须被认真对待。

**第四是性能。** 没有竞争时，加锁和解锁路径应该足够轻；竞争很激烈时，等待线程不能把 CPU 大量浪费在无效循环上。

OSTEP 讲锁时也会关注这些问题：能不能真的做到互斥，等待线程会不会饿死，没有竞争时要付多少成本，单 CPU 和多 CPU 下的表现有什么差别。只问“哪种锁最快”意义不大，同一把锁放到不同机器、不同临界区长度、不同竞争强度下，答案经常会变。

## 互斥锁：先把门关上，再改共享状态

回到前面的 `count++`。如果这段自增必须算对，最直接的办法就是在读、加、写这几个动作外面加一把 **互斥锁（mutex）**。谁先拿到锁，谁先改；没拿到锁的线程在门外等着。

用 POSIX 线程写出来大概是这样：

```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
int count = 0;

void increase(void) {
    pthread_mutex_lock(&mutex);
    count++;
    pthread_mutex_unlock(&mutex);
}
```

这段代码里，`pthread_mutex_lock()` 不只是做一次标记。从 POSIX 语义看，如果锁已经被其他线程持有，调用线程会等待锁变得可用，成功返回后才拥有这把锁。

具体实现可以更灵活。很多 pthread mutex 或语言运行时里的锁，可能先在用户态短暂自旋；如果竞争还没解除，再走 futex 之类的阻塞路径。对使用者来说，重点放在语义上：拿到锁之前不能进入临界区，拿到锁之后才拥有被保护状态的访问权。

mutex 适合守住边界清楚的共享状态修改。更新引用计数、改链表指针、维护进程表、更新一小段内存缓存，都很典型。写这类代码时，最该先确认的是这把锁负责保护哪一份状态，以及所有访问这份状态的入口有没有遵守同一套规则。

举个很常见的坑：一个共享对象有 5 条访问路径，其中 4 条都会拿同一把锁，剩下一条为了“方便”直接改字段。这样一来，前面 4 条路径写得再认真，互斥关系也被绕开了。锁保护的是访问协议，光把变量放在锁旁边没有用。

还有一个细节，mutex 通常有持有者语义。简单说，谁拿锁，谁释放。Linux 内核文档介绍 lock types 时专门提到 owner semantics，大多数锁都要求获取锁的上下文负责释放。信号量不太一样，它更像计数器，后面讲到它时这个差别会很明显。

## 自旋锁：别睡，原地等一小会儿

mutex 拿不到时，线程可以睡下去，等内核以后再唤醒它。**自旋锁（spin lock）** 反过来：先别睡，继续在 CPU 上循环检查锁有没有释放。

这听起来有点傻，实际要看等待时间。

![mutex 和 spinlock 等待方式对比：mutex 在可阻塞路径中睡眠等待，spinlock 在不能睡眠的短路径中短暂忙等](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-mutex-spinlock.png)

如果一把锁只保护几行代码，持锁线程马上就会离开临界区，等待线程睡下去反而不划算。睡眠和唤醒都要经过调度器，期间还可能发生上下文切换；在多 CPU 机器上，持锁线程也许正在另一个 CPU 上执行，几条指令后就释放锁。这个时候，等待线程原地转几圈，成本可能更低。

但自旋有两个硬限制。

**第一，临界区必须短。** 持锁线程如果要访问磁盘、等待网络、分配可能睡眠的内存，等待方就会把 CPU 时间烧在空转上。

**第二，要小心单 CPU 或可抢占场景。** 如果持锁线程被抢占，而等待线程在同一个 CPU 上自旋，等待线程转得再努力也等不到释放动作。

在非 PREEMPT_RT Linux 内核里，普通 `spinlock_t` 获取后会隐式禁用抢占；如果还要防止中断处理程序在本 CPU 上打断当前临界区，才会使用 `spin_lock_irq()`、`spin_lock_irqsave()` 这类带后缀的接口。也就是说，plain `spin_lock()` 不等于总是禁用硬中断。

Linux 内核文档把锁粗分为 sleeping locks、CPU local locks 和 spinning locks。`mutex`、`semaphore`、`rw_semaphore` 属于可能睡眠的锁；`raw_spinlock_t` 在普通内核和 PREEMPT_RT 内核里都是严格自旋锁。`spinlock_t` 的语义会随 PREEMPT_RT 改变：非 PREEMPT_RT 下，它映射到 `raw_spinlock_t`；PREEMPT_RT 下，它基于 `rt_mutex` 实现，不再隐式禁用抢占，`_irq` / `_irqsave` 后缀也不再直接改变硬中断禁用状态。

用户态业务代码通常不应该自己写自旋锁。库和运行时可以在非常短的路径上做自适应自旋，但应用代码里手写 `while` 循环等锁，多数时候只是在把 CPU 变热。

## 信号量：不是只有 0 和 1 的锁

**信号量（semaphore）** 可以看成一个不会降到负数的计数器。`sem_wait()` 尝试把计数减 1；如果当前值大于 0，减完就继续；如果当前值是 0，调用线程阻塞。`sem_post()` 把计数加 1，并可能唤醒等待者。

计数初始值设为 1 时，信号量可以当互斥锁用：

```c
sem_t sem;

sem_init(&sem, 0, 1);

sem_wait(&sem);
// critical section
sem_post(&sem);
```

不过，信号量真正常见的用途是“资源计数”。比如缓冲区有 N 个空槽，连接池最多允许 N 个连接，某类任务最多同时跑 N 个。这个时候，信号量的初始值就是资源数量。

二值信号量可以模拟互斥，但它不等于 mutex。mutex 强调持有者和临界区所有权，semaphore 强调计数和许可数量。一个有界缓冲区通常会把这两类问题拆开：信号量管槽位数量，mutex 管缓冲区内部结构。

![semaphore 管理有界缓冲区资源数量示意图：empty_slots 记录空位数量，filled_slots 记录可消费数量，buffer_mutex 保护缓冲区结构](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-semaphore-buffer.png)

下面代码省略了 `item_t` 和缓冲区的具体实现，只保留同步骨架：

```c
#include <errno.h>
#include <pthread.h>
#include <semaphore.h>
#include <stdlib.h>

#define BUFFER_SIZE 1024

sem_t empty_slots;
sem_t filled_slots;
pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;

void init_buffer(void) {
    if (sem_init(&empty_slots, 0, BUFFER_SIZE) == -1) {
        abort();
    }
    if (sem_init(&filled_slots, 0, 0) == -1) {
        abort();
    }
}

static void wait_sem(sem_t *sem) {
    while (sem_wait(sem) == -1) {
        if (errno == EINTR) {
            continue;
        }
        abort();
    }
}

void producer(void) {
    item_t item = produce_item();

    wait_sem(&empty_slots);
    pthread_mutex_lock(&buffer_mutex);
    put_item(item);
    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&filled_slots);
}

void consumer(void) {
    wait_sem(&filled_slots);
    pthread_mutex_lock(&buffer_mutex);
    item_t item = take_item();
    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&empty_slots);

    consume(item);
}
```

`empty_slots` 记录还有多少空位，`filled_slots` 记录已经有多少可消费元素。生产者先消耗一个空位，放入数据后增加一个可消费元素；消费者反过来。`buffer_mutex` 只负责保护 `put_item()` 和 `take_item()` 对缓冲区结构的修改。

`wait_sem()` 里重试 `EINTR` 也不是装饰。Linux man-pages 明确列出 `sem_wait()` 可能因为信号处理程序打断而返回 `-1`，并把 `errno` 设为 `EINTR`。示例代码如果完全不处理这个分支，读者复制以后很容易留下偶发 bug。

Linux Kernel locking 文档明确说明，semaphore 可以用于串行化和等待；写新代码时，更推荐把互斥、事件完成这类语义拆到 mutex、completion 等机制里。原因之一是 semaphore 没有明确 owner，PREEMPT_RT 无法为它提供优先级继承，阻塞在 semaphore 上可能出现优先级反转。

## 条件变量：等的不是锁，是某个条件成立

mutex 解决的是“同一时刻谁能进临界区”。但很多时候，线程进入临界区后发现条件还没满足。

比如消费者拿到锁后发现队列为空。它不能继续取数据，也不能一直拿着锁睡觉。否则生产者拿不到锁，没法往队列里放数据，系统就僵住了。

**条件变量（condition variable）** 解决的就是这种等待条件的问题。它通常和 mutex 配套使用：

```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;
queue_t queue;

void consumer(void) {
    pthread_mutex_lock(&mutex);

    while (queue_empty(&queue)) {
        pthread_cond_wait(&not_empty, &mutex);
    }

    item_t item = queue_pop(&queue);
    pthread_mutex_unlock(&mutex);

    consume(item);
}

void producer(item_t item) {
    pthread_mutex_lock(&mutex);
    queue_push(&queue, item);
    pthread_cond_signal(&not_empty);
    pthread_mutex_unlock(&mutex);
}
```

`pthread_cond_wait()` 做了一件非常关键的事：它会原子地释放 mutex，并让当前线程等待条件变量；被唤醒返回前，又会重新获得 mutex。这个“释放锁并睡眠”的动作必须连在一起，否则就可能出现丢信号：线程刚准备睡，生产者已经发完通知，消费者随后睡下去，再也没人叫醒它。

![condition variable 等待条件成立流程图：线程在 while 中检查共享状态，条件不满足时释放 mutex 并睡眠，被 signal 唤醒后重新检查条件](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-condition-variable.png)

条件变量有三条使用规则很重要。

**第一，等待条件要写在 `while` 里，不要写成 `if`。** POSIX 明确允许 condition wait 出现 spurious wakeup，也就是线程醒来时条件未必成立。即使没有这种唤醒，多个消费者同时被唤醒后，也可能只有一个线程抢到数据，其他线程再次发现队列为空。

**第二，条件变量本身不保存状态，真正的状态必须放在受 mutex 保护的共享变量里**。`pthread_cond_signal()` 不是往队列里塞一张永久有效的票。如果 signal 发生时没人等待，这次通知可能就过去了。真正决定消费者能不能继续执行的，是 `queue_empty()` 背后的队列长度。

**第三，同一个条件变量在有等待者期间，应该和同一把 mutex 配套使用。** POSIX 把这叫动态绑定：只要还有线程阻塞在某个 condition variable 上，其他线程如果拿另一把 mutex 去等待同一个 condition variable，行为就是未定义的。这个规则平时不常被提起，但它能解释为什么条件变量代码通常会把“状态变量、mutex、condvar”放在同一个数据结构里管理。

很多条件变量 bug 都出在这里：把 signal 当状态，或者醒来后不重新检查条件。

## futex：用户态先试，失败再找内核

Linux 里经常会听到 futex（fast userspace mutex）。名字里有 mutex，但 futex 更像一块搭锁的地基。

futex 的设计思路是：没有竞争时，完全在用户态用原子指令修改一个 32 位整数；只有需要睡眠或唤醒等待者时，才进入内核调用 `futex()`。这样可以避开每次加锁都系统调用的开销。

一个简化版流程是：

1. 线程先在用户态用原子操作尝试把锁字从 0 改成 1。
2. 如果成功，说明没人竞争，直接进入临界区。
3. 如果失败，说明锁被占用，再调用 `FUTEX_WAIT` 让内核把线程挂起。
4. 持锁线程释放锁后，如果发现有人等待，调用 `FUTEX_WAKE` 唤醒一个或多个等待者。

![futex 用户态快路径与内核慢路径示意图：无竞争时通过用户态原子操作拿锁，竞争失败后进入 FUTEX_WAIT，释放时通过 FUTEX_WAKE 唤醒等待线程](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-futex.png)

`FUTEX_WAIT` 走的是 compare-and-block：内核会先确认 futex word 仍然等于调用者传入的期望值，只有匹配时才把线程挂起。这个比较和阻塞动作是原子的，所以它能把用户态原子操作和内核睡眠队列接起来。

man-pages 对 futex 的描述也强调了这一点：futex 操作围绕一个用户空间地址上的 32 位值展开，常见操作包括等待和唤醒。应用一般不会直接把 futex 当业务锁使用；pthread mutex、条件变量、运行时同步器这类库，会在更高层同步原语里用到它。

所以，看 Linux 用户态锁时可以记住这句话：快路径尽量留在用户态，慢路径才进内核排队睡眠。

## 原子指令：锁总得有一个不可拆的起点

无论 mutex、spinlock 还是 futex，最后都要落到某种硬件支持的原子操作上。否则“检查锁是否空闲”和“把锁标记为已占用”之间仍然会被别的线程插进来。

常见原子指令包括 test-and-set、compare-and-swap、fetch-and-add 等。它们保证对某个内存位置的读改写不会被其他 CPU 观察成半截状态。

早期教材里还会讲“关中断实现锁”。在单 CPU 内核里，关中断可以防止当前执行流被中断处理打断，从而保护某些内核临界区。但这个方法有很强边界：它只影响当前 CPU，不能阻止另一个 CPU 同时访问同一份内存。多处理器系统里，跨 CPU 的互斥仍然要靠原子指令、缓存一致性协议和内核锁规则。

这也是为什么操作系统课程会先讲原子指令，再讲锁实现。锁对程序员暴露的是 `lock()` / `unlock()`，底下靠的是 CPU 和内核共同维护的不可拆更新。

## 锁还负责内存顺序

锁不只是在临界区门口排队。多 CPU 系统里，CPU 和编译器都可能调整内存访问顺序；如果同步语义不够，一个 CPU 写入的状态，另一个 CPU 未必会按源码顺序看到。

所以，锁获取和锁释放通常还带有内存顺序含义。可以先按这两个词理解：

- acquire：拿到锁之后的内存访问，不能被重排到拿锁之前。
- release：释放锁之前的内存访问，不能被重排到释放锁之后。

Linux 内核内存屏障文档也把 LOCK 操作归到 acquire，把 UNLOCK 操作归到 release。正确使用 mutex、spinlock 这类同步原语时，开发者通常不需要手写内存屏障；只有写无锁结构、驱动、内核底层同步或设备交互时，才需要直接面对 memory barrier。

这里还有一个边界：acquire 和 release 是最小保证，二者配合不等于任意场景下的 full memory barrier。普通业务代码一般不需要背这些细节，但如果已经在写无锁队列、RCU、驱动或 MMIO 访问，这个差别就不能跳过。

## 优先级反转：锁也会影响调度

锁还会把调度问题带进来。

经典问题是优先级反转。低优先级线程 L 持有一把锁，高优先级线程 H 等这把锁；这时中优先级线程 M 持续运行，把 L 抢占掉。结果是 H 明明优先级最高，却一直等不到 L 释放锁。

解决思路之一是优先级继承。持锁的低优先级线程临时继承等待者中的最高优先级，尽快跑完临界区并释放锁。

POSIX mutex 的 protocol 属性里就有 `PTHREAD_PRIO_INHERIT` 和 `PTHREAD_PRIO_PROTECT`。Linux 的 `rt_mutex` 也围绕 priority inheritance 设计，用来支持 PI-futex 和带优先级继承属性的 pthread mutex。

这也是前面说 semaphore 没有 owner 会带来限制的原因。没有明确持有者，系统就不知道该提升谁的优先级；Linux Kernel locking 文档也指出，semaphore 在 PREEMPT_RT 下无法提供优先级继承，阻塞在 semaphore 上可能导致优先级反转。

## 用户态锁和内核锁有什么不同？

用户态程序关心的是线程之间如何协作。Pthreads 给你 mutex、condition variable、semaphore；C++、Java、Go、Rust 又在各自运行时和标准库里封装出更贴近语言的同步工具。

内核里的锁多了一层上下文约束。内核代码可能运行在普通进程上下文，也可能运行在中断、软中断或不可抢占区域；有些路径能睡眠，有些路径绝对不能睡；有些锁拿着时会禁用抢占或中断；实时内核还要处理优先级反转和调度延迟。

所以，看内核锁时要多问几句：

- 当前上下文能不能睡眠？
- 持锁期间能不能被抢占？
- 是否可能被中断处理程序重入？
- 它保护的是 per-CPU 数据，还是跨 CPU 共享数据？
- 当前运行的是普通内核，还是 PREEMPT_RT 内核？
- 是否需要优先级继承来控制实时延迟？

![用户态锁和内核锁的上下文差异示意图：用户态主要关注线程协作，内核态还要判断能否睡眠、能否抢占、是否处于中断路径以及是否跨 CPU 共享](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/os-lock-kernel-context.png)

可以先抓住几个常见区别：

- mutex 这类 sleeping lock 可以让任务睡眠，适合较长临界区，但不能在中断上下文随便使用。
- spinlock 适合非常短、不能睡的内核路径，持锁期间要避免调用可能阻塞的函数。
- rw_semaphore、rwlock 面向多读单写，但公平性和实时语义会随内核配置变化。
- local lock、关抢占、关中断更偏向保护当前 CPU 上的数据，不能自然替代跨 CPU 锁。

Linux Kernel locking 文档把这些规则写得很细，尤其是 PREEMPT_RT 下锁语义的变化。普通应用开发不需要背完整细节，但要知道一件事：内核锁不能只按“互斥/读写/自旋”几个名字理解，它还和当前上下文能不能睡、能不能被抢占、能不能处理中断紧紧绑在一起。

## 怎么选同步原语？

如果只是保护一段共享状态修改，先考虑 mutex。它表达清楚，等待时可以睡眠，适合大多数用户态临界区。

如果要限制某类资源同时被多少线程使用，信号量更自然。比如最多 10 个并发下载任务、连接池最多 50 个连接。这个场景的关键是“数量”，不是谁进入临界区。

如果线程要等某个状态变化，用条件变量。队列从空变非空、任务从未完成变完成、缓冲区从满变未满，都属于这种等待条件。记得把状态放在共享变量里，用 mutex 保护，并在 `while` 中等待。

如果在内核里保护非常短的路径，并且当前上下文不能睡，才考虑 spinlock。用户态业务代码里长期自旋通常是坏味道。

如果你在实现语言运行时、线程库或高性能同步器，futex 这类机制才会进入视野。普通业务代码更应该使用标准库或成熟并发库，而不是直接对 futex 系统调用编程。

这几个判断也解释了为什么 Java 文章里会把 `synchronized`、`ReentrantLock`、AQS、CAS 放在一起讲。Java 开发者面对的是语言级抽象；操作系统面对的是线程调度、阻塞唤醒、CPU 原子指令和内核上下文。

## 常见错误

**把锁当成性能开关。**

锁先保证正确性，再谈性能。如果共享状态会被写坏，少一把锁只会把 bug 交给调度时机决定。

**用 `if` 等条件变量。**

条件变量醒来不代表条件已经成立。醒来后必须重新检查条件。这里用 `while` 才符合条件变量的使用语义。

**把 semaphore 当万能锁。**

信号量能做很多事，也正因为如此，代码读起来容易失去语义。只是互斥就用 mutex；只是等一次性事件，内核里常见 completion 这类更直接的工具；需要资源计数时再用 semaphore。

**在持锁期间做慢操作。**

持锁时访问磁盘、发网络请求、等待外部系统，都会把临界区拖长。线程越多，锁竞争越容易放大成吞吐下降、排队积压甚至死锁。

**忽略锁顺序。**

两个线程分别按 `A -> B` 和 `B -> A` 拿锁，等待环很容易形成。操作系统、数据库、Java 线程都会遇到同样的问题。死锁的完整介绍可以看 [死锁详解](./dead-lock.md)。

## 总结

操作系统里的锁不能只按某一个 API 理解。它是一组围绕共享状态、等待条件、资源数量和调度上下文设计出来的同步机制。

mutex 负责互斥，spinlock 用忙等换掉睡眠切换，semaphore 负责计数和限流，condition variable 让线程在条件不满足时睡下去，futex 把用户态原子操作和内核阻塞唤醒接在一起。它们看起来都和“等”有关，实际等待的对象并不一样：有的等进入临界区，有的等资源数量，有的等状态变化，有的等内核把自己重新放回可运行队列。

学 Java 锁时，很多细节会被 JVM 和类库包起来；回到操作系统这一层，重点就变成了：线程什么时候该睡，什么时候可以自旋，谁负责唤醒，哪段代码不能被抢占，哪个上下文不能阻塞。

## 参考资料

- [OSTEP: Locks](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf)
- [OSTEP: Condition Variables](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf)
- [OSTEP: Semaphores](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf)
- [POSIX Programmer's Manual: pthread_mutex_lock](https://man7.org/linux/man-pages/man3/pthread_mutex_lock.3p.html)
- [POSIX Programmer's Manual: pthread_cond_wait](https://man7.org/linux/man-pages/man3/pthread_cond_wait.3p.html)
- [POSIX Programmer's Manual: pthread_mutexattr_getprotocol](https://man7.org/linux/man-pages/man3/pthread_mutexattr_getprotocol.3p.html)
- [Linux man-pages: sem_wait](https://man7.org/linux/man-pages/man3/sem_wait.3.html)
- [Linux man-pages: futex](https://man7.org/linux/man-pages/man2/futex.2.html)
- [Linux Kernel Documentation: Lock types and their rules](https://docs.kernel.org/locking/locktypes.html)
- [Linux Kernel Documentation: Memory Barriers](https://www.kernel.org/doc/Documentation/memory-barriers.txt)
- [Linux Kernel Documentation: RT-mutex subsystem with PI support](https://docs.kernel.org/locking/rt-mutex.html)
