---
title: 死锁详解：四个必要条件、Java 死锁排查与数据库死锁处理
description: 死锁高频面试题总结，从死锁定义和四个必要条件讲起，结合 Java synchronized、ReentrantLock、ThreadMXBean、jstack、jcmd、JConsole 以及 PostgreSQL、MySQL 数据库死锁排查与事务重试实践。
category: 计算机基础
tag:
  - 操作系统
  - Java 并发
  - 数据库
head:
  - - meta
    - name: keywords
      content: 死锁,Deadlock,死锁四个必要条件,Java死锁,线程死锁,synchronized,ReentrantLock,ThreadMXBean,jstack,jcmd,JConsole,数据库死锁,MySQL死锁,PostgreSQL死锁,操作系统面试题,Java并发面试题
---

线程 A 已经拿到了资源 1，线程 B 也拿到了资源 2。接下来，线程 A 想继续往下走，需要资源 2；线程 B 想继续往下走，又需要资源 1。

两个线程都没抛异常，也不是 CPU 把机器打满了。线上看到的现象可能只是几个请求一直不返回，线程池里的工作线程慢慢被占住。

这类问题麻烦就麻烦在这里：程序没有“算错”，而是卡在一条自己解不开的等待链上。

线程死锁说的就是这种情况：一组线程互相等对方释放资源，等待关系绕成闭环，参与其中的线程都没办法靠自己继续执行。

如果这些线程正好承载订单、支付、库存这类关键流程，外部看到的就不只是某个线程 `BLOCKED` 了，而是接口超时、队列堆积，甚至进程迟迟退不干净。

![死锁场景示意图：线程 A 持有 resource1 并等待 resource2，线程 B 持有 resource2 并等待 resource1，等待链形成闭环](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-deadlock-scenario.png)

把范围放大一点，死锁不只属于 Java 线程。进程、数据库事务、分布式任务，只要互相占着资源再继续等待，都可能卡成同样的形状。这里的资源也不一定是操作系统教材里的打印机、磁带机，它可以是 Java 对象监视器、`ReentrantLock`、数据库行锁、分布式锁、连接池里的连接、线程池里的工作线程，甚至是管道缓冲区。

后面会用 Java 代码演示，是因为这类例子最容易复现。但要记住，死锁不是 Java 专属的问题。只要系统里同时出现独占资源、持有后继续等待、资源不能被强制剥夺、等待关系成环，线程、进程和事务都会踩进去。

这篇文章按排查时更常用的顺序来讲：先看等待环怎么形成，再看四个必要条件、Java 复现代码、资源分配图、处理策略，最后落到线上该怎么抓线程栈、怎么看数据库锁。

## 死锁是怎么卡住的？

先看并发编程里最常见的场景。系统里有两个线程和两份资源：

- 线程 A 先拿到资源 1，再去申请资源 2。
- 线程 B 先拿到资源 2，再去申请资源 1。

如果两个线程刚好交错执行，就会出现下面这个状态：

- 线程 A 持有资源 1，等待资源 2。
- 线程 B 持有资源 2，等待资源 1。

线程 A 想继续运行，必须等线程 B 释放资源 2；线程 B 想继续运行，又必须等线程 A 释放资源 1。两边都在等对方先动，但谁都没有继续执行到释放资源的机会。

所以，死锁和“等得久”不是一回事。普通阻塞还有自然恢复的机会：别的线程释放锁，事务提交，网络 I/O 返回，后面的线程就能继续跑。死锁里多了一个环，环上的每个参与者都在等别人先释放资源。

还有一个排查时很容易误判的点：**死锁不一定伴随高 CPU**。很多时候线程只是安静地停在 `BLOCKED` 或 `WAITING`，CPU 反而很低。接口超时、线程池占满、数据库连接耗尽时，CPU 只能作为线索之一，不能当成唯一判断依据。

## 死锁的四个必要条件

操作系统教材通常会讲 Coffman 条件。死锁要发生，下面 4 个条件必须同时成立：

| 条件                     | 含义                                     | 对应到 Java 或数据库                          |
| ------------------------ | ---------------------------------------- | --------------------------------------------- |
| 互斥                     | 某个资源同一时刻只能被一个执行单元占用   | `synchronized` 锁对象、行级排他锁、独占文件锁 |
| 请求与保持（占有并等待） | 已经拿着一部分资源，同时继续等待其他资源 | 线程持有 `resource1` 时继续申请 `resource2`   |
| 非抢占                   | 资源不能被外部强行拿走，只能由持有者释放 | Java 内置锁不能被另一个线程直接剥夺           |
| 循环等待                 | 等待关系形成闭环                         | 线程 1 等线程 2，线程 2 又等线程 1            |

![死锁四个必要条件示意图：互斥、请求与保持、非抢占、循环等待同时成立才会形成死锁](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-four-conditions.png)

这张表不要当成“满足其中一条就死锁”的清单。它真正表达的是：四项同时出现，死锁才具备发生条件；少掉任意一项，等待环就很难闭合。

写业务代码时，最容易下手的是第 2 条和第 4 条。

互斥通常绕不开。同一行库存、同一个账户余额、同一段共享内存，本来就不能让多个线程同时乱写。非抢占也不好硬改，锁保护的往往是一段尚未完成的状态，粗暴抢走可能留下半成品。相比之下，让线程一次拿齐资源，或者规定所有入口都按同一顺序拿锁，更容易变成团队能执行的代码规范。

## 用 Java 复现一个死锁

下面这段代码就是把图 1 写成 Java。两个 `Object` 分别充当资源 1 和资源 2，两个线程按相反顺序进入 `synchronized`。

`Thread.sleep(1000)` 不是死锁的原因，它只是把两个线程交错执行的窗口拉大，让问题更容易复现。

```java
public class DeadLockDemo {
    private static final Object resource1 = new Object();
    private static final Object resource2 = new Object();

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "线程 1").start();

        new Thread(() -> {
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println(Thread.currentThread() + "waiting get resource1");
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }, "线程 2").start();
    }
}
```

比较典型的一次输出是：

```text
Thread[线程 1,5,main]get resource1
Thread[线程 2,5,main]get resource2
Thread[线程 1,5,main]waiting get resource2
Thread[线程 2,5,main]waiting get resource1
```

程序到这里就停住了。`sleep()` 早晚会结束，真正卡住的是第二层 `synchronized`：线程 1 进不去 `resource2`，线程 2 进不去 `resource1`。

把现场对回前面的四个条件：

- 互斥：`resource1` 和 `resource2` 同一时间只能被一个线程持有。
- 请求与保持：线程 1 拿着 `resource1` 等 `resource2`，线程 2 拿着 `resource2` 等 `resource1`。
- 非抢占：Java 不会强制把 `resource1` 从线程 1 手里拿走。
- 循环等待：线程 1 等线程 2，线程 2 又等线程 1。

四个条件都对上了，剩下的就是调度时序。也正因为触发依赖时序，有些死锁在线上不是每次都能复现，压测跑十次可能只有一两次卡住。

**怎么改这段代码才能没有死锁问题？**

最直接的修法是把加锁顺序固定下来。所有线程都先拿 `resource1`，再拿 `resource2`，等待链就没有机会绕回起点。

```java
public class OrderedLockDemo {
    private static final Object resource1 = new Object();
    private static final Object resource2 = new Object();

    public static void main(String[] args) {
        Runnable task = () -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");

                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        };

        new Thread(task, "线程 1").start();
        new Thread(task, "线程 2").start();
    }
}
```

这个改法破坏的是“循环等待”。只要所有代码路径都遵守同一个顺序，就不会出现 A 等 B、B 又等 A 的闭环。

难点在“所有代码路径”。小例子里只有两个锁，一眼就能看完；业务系统里，锁可能散在订单、库存、支付几个模块里。A 链路先拿订单锁再拿库存锁，B 链路先拿库存锁再拿订单锁，单独看每个方法都像是合理的，组合起来才出问题。

实际项目里，我更建议把下面几条写进并发代码的检查清单：

- 资源要有稳定顺序。可以按业务 ID、数据库主键、账户号这类不会变的值排序，别依赖对象哈希这种不适合表达业务顺序的东西。
- 锁内只做必要的状态修改。RPC、慢 SQL、文件 I/O 这类操作尽量放到锁外，否则一次慢调用就会把等待链拉长。
- 拿不齐资源就退出来。已经拿到 A、拿不到 B 时，释放 A 后重试，比拿着 A 一直等 B 更安全。
- 业务允许失败时，用 `tryLock(timeout, unit)` 给等待加上上限，别让线程无限挂住。
- 如果两把锁总是一起出现，考虑合成一把更粗的锁。并发度会下降，但换来的是更容易证明的正确性。

最后这一条看起来有点“退步”，但工程里经常有用。锁拆得太细不一定更高级；如果几份状态天然强相关，拆开反而会给死锁留出空间。

## 资源分配图和等待图

操作系统教材里常用资源分配图来画死锁。图里其实就两类东西：

- 进程或线程节点。
- 资源节点。

箭头也分两种：

- 从线程指向资源，表示线程正在等待这个资源。
- 从资源指向线程，表示资源已经分配给这个线程。

先看一个最有用的结论：图里没有环，就没有死锁。

图里有环时，不能立刻一刀切，还要看资源实例数：

- 每类资源只有 1 个实例时，有环就代表死锁。
- 每类资源有多个实例时，有环只说明可能死锁，还要继续判断是否存在某个线程能先完成并释放资源。

拿数据库行锁举个例子。事务 T1 已经锁住订单 `id=1`，接着要更新 `id=2`；事务 T2 先锁住了 `id=2`，又回头更新 `id=1`。这时可以把资源节点先拿掉，只看事务之间的等待关系：

```text
T1 -> T2
T2 -> T1
```

这种只保留“谁等谁”的图叫等待图（Wait-for Graph），可以看成资源分配图的简化版。Java 线程死锁、数据库死锁检测、Linux lockdep 都会用到类似的图思维，只是使用时机不一样：数据库通常等事务真的阻塞后再检查等待环；lockdep 更像是记录锁获取顺序，提前发现某些顺序组合可能绕成环。

![资源分配图与等待图示意图：资源分配图包含线程和资源节点，等待图只保留线程之间的等待关系](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-resource-allocation-graph.png)

## 预防、避免、检测、恢复

讲死锁处理时，经常会看到 4 个词：预防、避免、检测、恢复。名字很像，但它们介入的时间点不同。

业务代码里最常见的是预防，比如统一加锁顺序、缩短持锁时间；数据库更习惯检测和恢复，因为事务可以回滚；银行家算法属于“避免”，很适合理解安全状态，但普通后端服务很少真的照着实现一套。

| 方法 | 做法                                           | 代价                             | 工程常见程度                   |
| ---- | ---------------------------------------------- | -------------------------------- | ------------------------------ |
| 预防 | 破坏死锁四条件之一，让死锁结构上不成立         | 可能降低并发度或增加编码约束     | 很常见                         |
| 避免 | 分配资源前判断这次分配会不会把系统推向危险状态 | 需要提前知道资源需求，检查成本高 | 教材常讲，通用系统少见         |
| 检测 | 允许死锁发生，定期或按需检查等待环             | 检测本身有成本                   | 数据库、JVM 工具、内核调试常见 |
| 恢复 | 检测到死锁后终止、回滚或抢占资源               | 可能丢弃已完成工作               | 数据库事务里比较自然           |

![死锁处理策略图：预防、避免、检测、恢复四类方法的作用位置和工程常见程度](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-strategies.png)

### 死锁预防

预防做的事很直接：别让四个必要条件同时凑齐。

**破坏互斥**：把资源改成可共享。只读数据、不可变对象、无锁数据结构、追加写日志，都能减少互斥需求。但这条路经常走不通，比如同一行库存扣减、同一个文件写入位置、同一个用户余额，本来就不能让多个执行单元随便同时改。

**破坏占有并等待**：要么一次拿齐资源，要么一个都不拿。这样就不会出现“手里攥着 A，又一直等 B”的状态。代价也清楚：资源利用率可能下降，调用方还得提前知道自己到底要哪些资源。

**破坏非抢占**：拿不到新资源时，主动释放已经拿到的资源，稍后再试。Java 内置锁不支持超时获取，也不能让别的线程强制撤销；`Lock` 接口提供的 `tryLock()`，可以把“等不到就退出来”写进代码里。

```java
boolean gotA = false;
boolean gotB = false;

try {
    gotA = lockA.tryLock(100, TimeUnit.MILLISECONDS);
    if (!gotA) {
        return;
    }

    gotB = lockB.tryLock(100, TimeUnit.MILLISECONDS);
    if (!gotB) {
        return;
    }

    // 同时拿到两把锁后再处理共享状态
    updateSharedState();
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    // 不要吞掉中断信号，具体是返回还是抛异常由业务决定。
} finally {
    if (gotB) {
        lockB.unlock();
    }
    if (gotA) {
        lockA.unlock();
    }
}
```

这段代码的好处是不会无限等下去。坏处也要看清：它只是把等待变成了失败返回，后面怎么重试、是否允许重试、有没有幂等键，都得由业务自己处理。否则死锁没了，频繁失败或活锁又来了。

**破坏循环等待**：给资源排一个稳定顺序，所有线程只能按这个顺序申请。后端业务里最常见的例子是批量更新数据库行时先按主键排序，再逐条更新。

### 死锁避免

死锁避免不直接拆四个条件，而是在资源分配前先问一句：这次分配出去之后，系统还找不找得到一条“大家都能陆续完成”的顺序？

教材里最典型的是银行家算法。它要求每个进程提前声明最大资源需求，系统每次准备分配资源前，都要做一次安全性检查：

- 如果分配后仍然存在一个安全序列，就允许分配。
- 如果分配后找不到安全序列，就先让申请方等待。

安全状态不会走到死锁；不安全状态也不是已经死锁，只是后面可能走进死锁。

银行家算法适合用来理解“安全状态”，但普通业务服务很少直接用它。原因并不玄乎：大多数程序很难提前说清最大资源需求，请求顺序也会随业务分支变化；每次分配前都做全局检查，成本还不低。

### 死锁检测

检测的思路换了一个方向：系统先正常运行，等线程或事务真的互相等住了，再去找等待环。

数据库很适合这么做。事务本来就有回滚边界，发现死锁后选一个事务回滚，另一个事务就能继续执行。应用侧要做的是识别这类错误，并决定是否重试整个事务。

Java 进程里也能做诊断。JDK 提供了 `ThreadMXBean`：

```java
import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;

public class DeadlockDetector {
    public static void printDeadlocks() {
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        long[] threadIds = bean.findDeadlockedThreads();

        if (threadIds == null || threadIds.length == 0) {
            System.out.println("No deadlock found");
            return;
        }

        ThreadInfo[] threadInfos = bean.getThreadInfo(threadIds, true, true);
        for (ThreadInfo threadInfo : threadInfos) {
            System.out.println(threadInfo);
        }
    }
}
```

`findDeadlockedThreads()` 可以检查对象监视器，也能覆盖 `java.util.concurrent` 里的 ownable synchronizer。它更适合放在诊断工具或临时排障脚本里，不适合高频塞进业务主流程；这类检查本身也会有开销。

它的边界也要说清楚：它只能看到 JVM 内部可见的 monitor 和 ownable synchronizer。线程 A 拿着 Java 锁去等数据库行锁，线程 B 拿着数据库行锁又卡在另一个应用动作上，这种跨系统等待链，单靠 `ThreadMXBean` 看不完整，还得把线程栈、数据库锁视图和业务日志放在一起对。

线上更常见的是直接打线程栈：

```bash
jcmd <pid> Thread.print -l
jstack -l <pid>
```

如果输出里出现 `Found one Java-level deadlock`、`waiting to lock`、`which is held by`，通常就可以顺着等待链反查到业务代码。这里建议带上 `-l`，因为很多项目里用的是 `ReentrantLock`、`ReentrantReadWriteLock` 这类 JUC 锁；少了 `-l`，ownable synchronizer 的信息可能不完整。

本地复现时，JConsole、VisualVM 这类图形化工具也很好用。以 JConsole 为例，先找到 JDK 的 `bin` 目录并打开 `jconsole`。

![jconsole](https://oss.javaguide.cn/github/javaguide/java/concurrent/jdk-home-bin-jconsole.png)

连接目标 Java 进程后，进入“线程”页面，点击“检测死锁”。

![jconsole 检测死锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock.png)

如果目标进程里存在 Java 线程死锁，JConsole 会把相关线程单独列出来。

![jconsole 检测到死锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock-done.png)

线上环境一般还是优先用 `jcmd`、`jstack`。它们可以通过 SSH 执行，输出也容易留档。JConsole 更适合本地复现、教学演示，或者测试环境里快速看线程状态。生产环境远程连 JConsole 要额外考虑权限、网络暴露和运行开销，很多团队会选择先导出线程栈，再离线分析。

如果应用大量使用 Java 21+ 虚拟线程，还要多留一个心眼。虚拟线程不是长期绑定在某个 OS 线程上，传统 `jstack` 或 `Thread.print` 看到的信息可能不如平台线程直观。可以用下面的命令导出虚拟线程 dump：

```bash
jcmd <pid> Thread.dump_to_file -format=text thread-dump.txt
jcmd <pid> Thread.dump_to_file -format=json thread-dump.json
```

虚拟线程 dump 和传统线程 dump 的字段并不完全一样；对象地址、锁、JNI 统计、堆统计等传统线程 dump 里常见的信息未必都会包含。排查时别只看一份 dump，业务日志、JFR、数据库和外部依赖状态都要一起看。

### 死锁恢复

恢复比检测更棘手，因为系统得决定“牺牲谁”。

常见手段有 3 类：

- 终止所有参与死锁的执行单元。
- 一次终止一个，检测死锁是否解除。
- 抢占某些资源，回滚到可继续执行的状态。

数据库事务适合恢复，因为事务边界清楚，回滚以后可以重新执行。普通 Java 线程就麻烦得多：一个线程持锁时可能已经改了一半内存状态、写了一半文件、发了一半远程请求，直接杀掉通常不可取。Java 早就不推荐使用 `Thread.stop()`，也是这个原因。

应用代码更应该做的是避免把自己写进绝路：一旦卡住，只能靠杀进程恢复。

## 数据库里的死锁

死锁在数据库里很常见，尤其是多事务更新多行数据时。

假设有一张订单表：

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  status VARCHAR(32) NOT NULL
);
```

两个事务这样执行：

```sql
-- 事务 T1
BEGIN;
UPDATE orders SET status = 'PAID' WHERE id = 1;
UPDATE orders SET status = 'PAID' WHERE id = 2;
COMMIT;
```

```sql
-- 事务 T2
BEGIN;
UPDATE orders SET status = 'CANCELLED' WHERE id = 2;
UPDATE orders SET status = 'CANCELLED' WHERE id = 1;
COMMIT;
```

如果 T1 先锁住 `id=1`，T2 先锁住 `id=2`，后面就会互相等待。

数据库一般不会让这两个事务一直挂着。PostgreSQL 有 `deadlock_timeout` 参数，默认是 `1s`；事务等锁超过这个时间后，数据库才开始检查死锁，因为构造和扫描等待图也要成本。MySQL InnoDB 默认开启死锁检测，发现等待环后会回滚一个事务来解开局面，通常倾向选择修改行数更少的事务。

应用层要配合两件事。

第一，事务失败后要能重跑。PostgreSQL 的死锁错误码是 SQLSTATE `40P01`；MySQL InnoDB 遇到死锁时会回滚整个事务。应用收到这类错误后，应该重新执行整个事务，而不是只补最后一条 SQL。

第二，加锁顺序要稳定。批量更新多行时，先按主键或唯一业务键排序，所有入口都按同一个顺序更新。这个习惯很普通，但能减少大量交叉等待。

重试前还要确认业务具备幂等能力。比较常见的做法是使用唯一请求号、业务流水号或状态机校验。否则数据库已经把死锁处理掉了，应用层却可能因为重试引入重复扣款、重复发货。

减少和排查数据库死锁时，可以先看这几类信息：

- 事务尽量短，别在事务里等用户输入、调用慢接口、处理大文件。
- 索引要正确，否则更新一行可能扫描并锁住更多记录。
- 少用不必要的 `SELECT ... FOR UPDATE`。
- MySQL 可以用 `SHOW ENGINE INNODB STATUS` 看最近一次 InnoDB 死锁信息；如果死锁很频繁，可以考虑开启 `innodb_print_all_deadlocks` 把所有死锁信息写入错误日志。
- PostgreSQL 可以结合错误日志、`pg_locks`、`pg_stat_activity` 查阻塞关系。

PostgreSQL 里可以先用下面这个查询看当前哪些会话正在等锁，以及它们被哪些 pid 阻塞：

```sql
SELECT
    a.pid,
    a.usename,
    a.state,
    a.wait_event_type,
    a.wait_event,
    pg_blocking_pids(a.pid) AS blocking_pids,
    a.query
FROM pg_stat_activity a
WHERE a.wait_event_type = 'Lock';
```

这条 SQL 只能看当前等待关系。分析一次已经发生的死锁，还要回到数据库错误日志里的死锁详情，找到应用日志里的 traceId/requestId，再还原两个事务各自执行 SQL 的顺序。

数据库死锁不是“数据库坏了”。更多时候，它是在提醒你：应用层访问同一批资源的顺序不够稳定。

## 死锁、饥饿和活锁有什么区别？

这几个概念都会表现成“程序没按预期往前走”，但现场差别很大。

| 问题 | 表现                                           | 典型原因                       |
| ---- | ---------------------------------------------- | ------------------------------ |
| 死锁 | 多个执行单元互相等待，形成闭环                 | 反向加锁、事务交叉更新         |
| 饥饿 | 某个执行单元长期拿不到资源，但系统整体仍在推进 | 优先级过低、非公平锁竞争       |
| 活锁 | 执行单元一直在动作，但总是互相让路，没人完成   | 失败后同时重试、退避策略太同步 |

![死锁、饥饿和活锁对比图：死锁表现为等待环，饥饿表现为长期拿不到资源，活锁表现为持续动作但没有进展](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/dead-lock-deadlock-vs-starvation-livelock.png)

可以用三个画面记：死锁像两辆车在窄桥中间顶住，谁都不倒车；饥饿像队伍里一直有人插队，队尾那个人始终轮不到；活锁像两个人迎面走来，每次都同时往同一边让，结果一直错不开。

排查时别只看“卡住”这一个现象。死锁要找等待环，饥饿要看调度或锁竞争是否长期偏向，活锁要看重试逻辑是不是把所有参与者绑在同一个节奏上。

## 哪些卡住不一定是死锁？

线上有不少“卡住”看起来像死锁，最后查下来并没有等待环。常见的有这些：

- **线程池耗尽**：所有工作线程都在跑慢任务，新请求只能排队。
- **连接池耗尽**：线程都在等数据库连接，但没有形成互相等待的闭环。
- **慢 SQL**：线程停在 JDBC 调用里，数据库还在执行。
- **外部服务超时**：线程卡在 HTTP/RPC 调用上，等待对方响应。
- **GC 或 safepoint 停顿**：所有 Java 线程短时间暂停。
- **饥饿**：某些线程长期抢不到资源，但系统整体仍在推进。

判断死锁，关键证据不是“慢”或“卡”，而是能不能找到稳定的等待环。

## 线上怎么排查 Java 死锁？

如果线上接口卡住，先别急着重启。只要进程还活着，就尽量先留下线程栈和现场指标。

### 1. 先确认是不是“全挂”

先看现象是不是集中在“线程不释放资源”上：

- 某些接口一直超时，但进程还活着。
- CPU 不高，线程数、连接数、请求队列持续堆积。
- 线程池活跃线程长期占满，队列不下降。
- 数据库连接池连接被占住不释放。

这些现象只能说明服务在等，不足以证明死锁。慢 SQL、外部依赖卡住、线程池配置不合理，也会制造类似现场。

### 2. 连续抓 2 到 3 次线程栈

线程栈建议连续抓几次，间隔 10 到 30 秒。只抓一次，很容易把瞬时阻塞误判成死锁：

```bash
jcmd <pid> Thread.print -l > thread-1.log
sleep 10
jcmd <pid> Thread.print -l > thread-2.log
sleep 10
jcmd <pid> Thread.print -l > thread-3.log
```

多次栈的价值在于对比。如果三次都停在同一把锁、同一个连接池、同一段业务代码上，判断会比单次栈可靠得多。

Java 能识别的线程死锁，线程栈通常会直接打印死锁信息。没有直接打印时，也可以观察大量线程是不是长期停在同一批锁、同一个连接池获取逻辑或同一段业务方法上。

### 3. 顺着 `waiting to lock` 找持有者

读线程栈时，先抓这几类信息：

- 线程名和线程状态，例如 `BLOCKED`、`WAITING`。
- 正在等待的锁对象。
- 当前已经持有的锁。
- 栈顶业务方法。
- `parking to wait for` 对应的 `Lock` 或条件队列。

如果能看到 A 等 B 持有的锁，B 又等 A 持有的锁，等待环基本就浮出来了。

`synchronized` 相关死锁通常会看到 `waiting to lock <...>` 和 `locked <...>`；`ReentrantLock` 这类 JUC 锁通常会看到 `parking to wait for <...>`，并且需要关注 `Locked ownable synchronizers`。因此抓栈时建议带上 `-l`。

### 4. 回到代码看锁顺序

定位到栈里的业务方法后，再回代码里查这些点：

- 是否存在多个入口反向获取同一组锁。
- 是否在持锁期间调用外部服务或数据库。
- 是否锁住了范围过大的对象，例如全局 `Map`、单例对象、`Class` 对象。
- 是否混用了 Java 锁和数据库事务锁，导致链路更长。
- 是否用了非公平锁、无限等待、无超时获取。

很多死锁不是某一行代码单独造成的，而是两个调用链组合以后才出现。单看 A 链路、B 链路都说得过去，放在一起才绕成环。

## 写代码时怎么减少死锁？

下面几条更像代码评审时的检查项，尤其适合多锁、多事务、多资源更新的场景。

### 固定加锁顺序

同时操作多个用户、订单或账户时，先排序再加锁。下面这个转账例子假设账户 ID 全局唯一，并且创建后不再变化。

```java
public void transfer(Account from, Account to, long amount) {
    if (from == to) {
        return;
    }

    Account first;
    Account second;
    int compare = Long.compare(from.id(), to.id());
    if (compare < 0) {
        first = from;
        second = to;
    } else if (compare > 0) {
        first = to;
        second = from;
    } else {
        throw new IllegalStateException("Account id must be unique");
    }

    synchronized (first) {
        synchronized (second) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

这个例子里，不管是 A 给 B 转账，还是 B 给 A 转账，都会先锁 ID 小的账户，再锁 ID 大的账户。顺序固定后，循环等待就少了一条边。

### 避免持锁做慢操作

持锁期间尽量别做下面这些事：

- RPC 或 HTTP 请求。
- 慢 SQL 或大事务。
- 文件上传下载。
- 等待消息队列返回。
- 调用不清楚内部会不会加锁的第三方代码。

锁应该保护共享状态，而不是把整段业务流程都包进去。能提前算好的数据放在锁外算，锁内只留下最短的状态切换。

### 使用超时和失败策略

内置锁 `synchronized` 没有超时获取能力。业务允许失败或重试时，可以考虑 `ReentrantLock.tryLock()`：

```java
try {
    if (!lock.tryLock(200, TimeUnit.MILLISECONDS)) {
        throw new IllegalStateException("系统繁忙，请稍后重试");
    }

    try {
        updateSharedState();
    } finally {
        lock.unlock();
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new IllegalStateException("获取锁时被中断", e);
}
```

超时只能限制等待时间，不能自动保证业务正确。拿不到锁以后要不要重试、最多重试几次、会不会重复提交、是否需要幂等键，这些问题都要提前设计好。否则，超时只是让错误更快暴露出来。

### 少混用多套锁体系

比较难排的是跨层死锁，比如：

- Java 线程持有 JVM 锁，同时等待数据库行锁。
- 另一个请求持有数据库行锁，回调到应用逻辑里等待 JVM 锁。

这种等待链会同时出现在 JVM 线程栈和数据库日志里，单看一边都不完整。能把锁控制在同一层，就别让等待关系穿透太多组件；必须跨层时，至少要有超时、日志和统一顺序。

### 给锁命名，给线程命名

线上排查时，最怕看到的就是“Thread-17 等待 Object@4afcd809”这种信息。线程池自定义线程名、锁对象绑定业务 ID、日志里打印关键资源顺序，平时多写几行，出问题时能省很多时间。

比如线程名里带上业务池：

```java
private static final AtomicInteger THREAD_INDEX = new AtomicInteger();

ThreadFactory factory = runnable -> {
    Thread thread = new Thread(runnable);
    thread.setName("order-worker-" + THREAD_INDEX.incrementAndGet());
    return thread;
};
```

`AtomicInteger` 来自 `java.util.concurrent.atomic`。自己编号比直接依赖线程 ID 更稳，也兼容 Java 8/11 这类仍然很常见的运行环境。

命名本身不能防死锁，但能让你更快知道是哪一类业务线程卡住了。

## 面试怎么回答死锁？

面试里问死锁，不用一上来背很长的定义。可以先用一个两锁互等的例子把场景讲清楚：

> 死锁是多个线程或进程互相等待对方释放资源，导致所有参与者都无法继续执行的状态。典型例子是线程 A 拿着锁 1 等锁 2，线程 B 拿着锁 2 等锁 1。

然后补四个必要条件：

> 死锁要同时满足互斥、占有并等待、非抢占、循环等待这 4 个条件。只要能破坏其中一个条件，就可以从结构上避免死锁。

再说处理方法：

> 工程里最常用的是预防，比如统一加锁顺序、缩小锁范围、一次申请完整资源、使用超时锁。操作系统教材还会讲银行家算法，它属于死锁避免，需要提前知道最大资源需求。数据库一般采用检测和恢复，发现等待环后回滚一个事务，应用层再重试。

如果继续追问 Java 排查：

> Java 可以用 `jcmd <pid> Thread.print -l` 或 `jstack -l <pid>` 打线程栈，也可以用 `ThreadMXBean.findDeadlockedThreads()` 在程序里做诊断。排查时看线程状态、正在等待的锁、已经持有的锁，再回到代码里确认是否存在反向加锁或持锁慢操作。

这样答能覆盖概念、条件、方案和排查，比只背四个条件更完整。

## 总结

死锁最该记住的不是术语，而是等待关系。

只要代码里存在“已经持有一部分资源，又继续等待另一部分资源”的路径，就要多问一句：这些等待关系有没有可能绕成环？如果有，要么固定顺序，要么缩短持有时间，要么允许超时撤退，要么交给数据库事务这类能检测、能回滚的系统处理。

有些地方没法保证永远不死锁，比如复杂数据库事务、高并发批量更新、跨服务资源编排。更现实的目标是把概率降下来，把现场留住，把失败做成可以安全重试，而不是一路拖到只能重启进程。

## 参考资料

- [JavaGuide：操作系统常见面试题总结（上）](https://github.com/Snailclimb/JavaGuide)
- [用个通俗的例子讲一讲死锁 - 知乎专栏](https://zhuanlan.zhihu.com/p/26945588)
- [Yale CS：Deadlock](https://www.cs.yale.edu/homes/aspnes/pinewiki/Deadlock.html)
- [University of Wisconsin CS 537 Notes：Deadlock](https://pages.cs.wisc.edu/~bart/537/lecturenotes/s12.html)
- [Oracle Java Tutorials：Deadlock](https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html)
- [Oracle JDK API：ReentrantLock](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html)
- [Oracle JDK API：ThreadMXBean](https://docs.oracle.com/javase/8/docs/api/java/lang/management/ThreadMXBean.html)
- [Oracle Troubleshooting Guide：The jstack Utility](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/tooldescr016.html)
- [Oracle Java Documentation：Virtual Threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [Linux Kernel Documentation：Runtime locking correctness validator](https://docs.kernel.org/locking/lockdep-design.html)
- [PostgreSQL Documentation：Lock Management](https://www.postgresql.org/docs/current/runtime-config-locks.html)
- [PostgreSQL Documentation：Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [PostgreSQL Documentation：pg_locks](https://www.postgresql.org/docs/current/view-pg-locks.html)
- [MySQL 8.4 Reference Manual：Deadlock Detection](https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlock-detection.html)
- [MySQL 8.4 Reference Manual：InnoDB Error Handling](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html)
