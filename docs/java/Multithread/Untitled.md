## synchronized / Lock

1. JDK 1.5之前

   ，Java通过

   synchronized

   关键字来实现

   锁

   功能

   - synchronized是JVM实现的**内置锁**，锁的获取和释放都是由JVM**隐式**实现的

2. JDK 1.5

   ，并发包中新增了

   Lock接口

   来实现锁功能

   - 提供了与synchronized类似的同步功能，但需要**显式**获取和释放锁

3. Lock同步锁是基于

   Java

   实现的，而synchronized是基于底层操作系统的

   Mutex Lock

   实现的

   - 每次获取和释放锁都会带来**用户态和内核态的切换**，从而增加系统的**性能开销**
   - 在锁竞争激烈的情况下，synchronized同步锁的性能很糟糕
   - 在**JDK 1.5**，在**单线程重复申请锁**的情况下，synchronized锁性能要比Lock的性能**差很多**

4. **JDK 1.6**，Java对synchronized同步锁做了**充分的优化**，甚至在某些场景下，它的性能已经超越了Lock同步锁



## 实现原理

复制

```
public class SyncTest {
    public synchronized void method1() {
    }

    public void method2() {
        Object o = new Object();
        synchronized (o) {
        }
    }
}
```

复制

```
$ javac -encoding UTF-8 SyncTest.java
$ javap -v SyncTest
```

### 修饰方法

复制

```
public synchronized void method1();
  descriptor: ()V
  flags: ACC_PUBLIC, ACC_SYNCHRONIZED
  Code:
    stack=0, locals=1, args_size=1
       0: return
```

1. JVM使用**ACC_SYNCHRONIZED**访问标识来区分一个方法是否为**同步方法**

2. 在方法调用时，会检查方法是否被设置了

   ACC_SYNCHRONIZED

   访问标识

   - 如果是，执行线程会将先尝试**持有Monitor对象**，再执行方法，方法执行完成后，最后**释放Monitor对象**

### 修饰代码块

复制

```
public void method2();
  descriptor: ()V
  flags: ACC_PUBLIC
  Code:
    stack=2, locals=4, args_size=1
       0: new           #2                  // class java/lang/Object
       3: dup
       4: invokespecial #1                  // Method java/lang/Object."<init>":()V
       7: astore_1
       8: aload_1
       9: dup
      10: astore_2
      11: monitorenter
      12: aload_2
      13: monitorexit
      14: goto          22
      17: astore_3
      18: aload_2
      19: monitorexit
      20: aload_3
      21: athrow
      22: return
```

1. synchronized修饰同步代码块时，由**monitorenter**和**monitorexit**指令来实现同步
2. 进入**monitorenter**指令后，线程将**持有**该**Monitor对象**，进入**monitorexit**指令，线程将**释放**该**Monitor对象**

### 管程模型

1. JVM中的**同步**是基于进入和退出**管程**（**Monitor**）对象实现的

2. **每个Java对象实例都会有一个Monitor**，Monitor可以和Java对象实例一起被创建和销毁

3. Monitor是由**ObjectMonitor**实现的，对应[ObjectMonitor.hpp](https://github.com/JetBrains/jdk8u_hotspot/blob/master/src/share/vm/runtime/objectMonitor.hpp)

4. 当多个线程同时访问一段同步代码时，会先被放在**EntryList**中

5. 当线程获取到Java对象的Monitor时（Monitor是依靠

   底层操作系统

   的

   Mutex Lock

   来实现

   互斥

   的）

   - 线程申请Mutex成功，则持有该Mutex，其它线程将无法获取到该Mutex

6. 进入

   WaitSet

   - 竞争锁**失败**的线程会进入**WaitSet**
   - 竞争锁**成功**的线程如果调用**wait**方法，就会**释放当前持有的Mutex**，并且该线程会进入**WaitSet**
   - 进入**WaitSet**的进程会等待下一次唤醒，然后进入EntryList**重新排队**

7. 如果当前线程顺利执行完方法，也会释放Mutex

8. Monitor依赖于**底层操作系统**的实现，存在**用户态**和**内核态之间**的**切换**，所以增加了**性能开销**

[![img](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-monitor.png)](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-monitor.png)

复制

```
ObjectMonitor() {
  _header       = NULL;
  _count        = 0;        // 记录个数
  _waiters      = 0,
  _recursions   = 0;
  _object       = NULL;
  _owner        = NULL;     // 持有该Monitor的线程
  _WaitSet      = NULL;     // 处于wait状态的线程，会被加入 _WaitSet
  _WaitSetLock  = 0 ;
  _Responsible  = NULL ;
  _succ         = NULL ;
  _cxq          = NULL ;
  FreeNext      = NULL ;
  _EntryList    = NULL ;    // 多个线程访问同步块或同步方法，会首先被加入 _EntryList
  _SpinFreq     = 0 ;
  _SpinClock    = 0 ;
  OwnerIsThread = 0 ;
  _previous_owner_tid = 0;
}
```

## 锁升级优化

1. 为了提升性能，在**JDK 1.6**引入**偏向锁、轻量级锁、重量级锁**，用来**减少锁竞争带来的上下文切换**
2. 借助JDK 1.6新增的**Java对象头**，实现了**锁升级**功能

### Java对象头

1. 在**JDK 1.6**的JVM中，对象实例在**堆内存**中被分为三部分：**对象头**、**实例数据**、**对齐填充**
2. 对象头的组成部分：**Mark Word**、**指向类的指针**、**数组长度**（可选，数组类型时才有）
3. Mark Word记录了**对象**和**锁**有关的信息，在64位的JVM中，Mark Word为**64 bit**
4. 锁升级功能主要依赖于Mark Word中**锁标志位**和**是否偏向锁标志位**
5. synchronized同步锁的升级优化路径：***偏向锁** -> **轻量级锁** -> **重量级锁***

[![img](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-mark-word.jpg)](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-mark-word.jpg)

### 偏向锁

1. 偏向锁主要用来优化**同一线程多次申请同一个锁**的竞争，在某些情况下，大部分时间都是同一个线程竞争锁资源

2. 偏向锁的作用

   - 当一个线程再次访问同一个同步代码时，该线程只需对该对象头的**Mark Word**中去判断是否有偏向锁指向它
   - **无需再进入Monitor去竞争对象**（避免用户态和内核态的**切换**）

3. 当对象被当做同步锁，并有一个线程抢到锁时

   - 锁标志位还是**01**，是否偏向锁标志位设置为**1**，并且记录抢到锁的**线程ID**，进入***偏向锁状态***

4. 偏向锁

   **不会主动释放锁**

   - 当线程1再次获取锁时，会比较**当前线程的ID**与**锁对象头部的线程ID**是否一致，如果一致，无需CAS来抢占锁

   - 如果不一致，需要查看

     锁对象头部记录的线程

     是否存活

     - 如果**没有存活**，那么锁对象被重置为**无锁**状态（也是一种撤销），然后重新偏向线程2

     - 如果

       存活

       ，查找线程1的栈帧信息

       - 如果线程1还是需要继续持有该锁对象，那么暂停线程1（**STW**），**撤销偏向锁**，**升级为轻量级锁**
       - 如果线程1不再使用该锁对象，那么将该锁对象设为**无锁**状态（也是一种撤销），然后重新偏向线程2

5. 一旦出现其他线程竞争锁资源时，偏向锁就会被

   撤销

   - 偏向锁的撤销**可能需要**等待**全局安全点**，暂停持有该锁的线程，同时检查该线程**是否还在执行该方法**
   - 如果还没有执行完，说明此刻有**多个线程**竞争，升级为**轻量级锁**；如果已经执行完毕，唤醒其他线程继续**CAS**抢占

6. 在

   高并发

   场景下，当

   大量线程

   同时竞争同一个锁资源时，偏向锁会被

   撤销

   ，发生

   STW

   ，加大了

   性能开销

   - 默认配置

     - `-XX:+UseBiasedLocking -XX:BiasedLockingStartupDelay=4000`
     - 默认开启偏向锁，并且**延迟生效**，因为JVM刚启动时竞争非常激烈

   - 关闭偏向锁

     - `-XX:-UseBiasedLocking`

   - 直接

     设置为重量级锁

     - `-XX:+UseHeavyMonitors`

红线流程部分：偏向锁的**获取**和**撤销**
[![img](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-1.png)](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-1.png)

### 轻量级锁

1. 当有另外一个线程竞争锁时，由于该锁处于**偏向锁**状态

2. 发现对象头Mark Word中的线程ID不是自己的线程ID，该线程就会执行

   CAS

   操作获取锁

   - 如果获取**成功**，直接替换Mark Word中的线程ID为自己的线程ID，该锁会***保持偏向锁状态***
   - 如果获取**失败**，说明当前锁有一定的竞争，将偏向锁**升级**为轻量级锁

3. 线程获取轻量级锁时会有两步

   - 先把**锁对象的Mark Word**复制一份到线程的**栈帧**中（**DisplacedMarkWord**），主要为了**保留现场**!!
   - 然后使用**CAS**，把对象头中的内容替换为**线程栈帧中DisplacedMarkWord的地址**

4. 场景

   - 在线程1复制对象头Mark Word的同时（CAS之前），线程2也准备获取锁，也复制了对象头Mark Word
   - 在线程2进行CAS时，发现线程1已经把对象头换了，线程2的CAS失败，线程2会尝试使用**自旋锁**来等待线程1释放锁

5. 轻量级锁的适用场景：线程**交替执行**同步块，***绝大部分的锁在整个同步周期内都不存在长时间的竞争***

红线流程部分：升级轻量级锁
[![img](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-2.png)](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-2.png)

### 自旋锁 / 重量级锁

1. 轻量级锁

   CAS

   抢占失败，线程将会被挂起进入

   阻塞

   状态

   - 如果正在持有锁的线程在**很短的时间**内释放锁资源，那么进入**阻塞**状态的线程被**唤醒**后又要**重新抢占**锁资源

2. JVM提供了**自旋锁**，可以通过**自旋**的方式**不断尝试获取锁**，从而***避免线程被挂起阻塞***

3. 从

   JDK 1.7

   开始，

   自旋锁默认启用

   ，自旋次数

   不建议设置过大

   （意味着

   长时间占用CPU

   ）

   - `-XX:+UseSpinning -XX:PreBlockSpin=10`

4. 自旋锁重试之后如果依然抢锁失败，同步锁会升级至

   重量级锁

   ，锁标志位为

   10

   - 在这个状态下，未抢到锁的线程都会**进入Monitor**，之后会被阻塞在**WaitSet**中

5. 在

   锁竞争不激烈

   且

   锁占用时间非常短

   的场景下，自旋锁可以提高系统性能

   - 一旦锁竞争激烈或者锁占用的时间过长，自旋锁将会导致大量的线程一直处于**CAS重试状态**，**占用CPU资源**

6. 在

   高并发

   的场景下，可以通过

   关闭自旋锁

   来优化系统性能

   - ```
     -XX:-UseSpinning
     ```

     - 关闭自旋锁优化

   - ```
     -XX:PreBlockSpin
     ```

     - 默认的自旋次数，在**JDK 1.7**后，**由JVM控制**

[![img](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-3.png)](https://java-performance-1253868755.cos.ap-guangzhou.myqcloud.com/java-performance-synchronized-lock-upgrade-3.png)

## 小结

1. JVM在**JDK 1.6**中引入了**分级锁**机制来优化synchronized

2. 当一个线程获取锁时，首先对象锁成为一个

   偏向锁

   - 这是为了避免在**同一线程重复获取同一把锁**时，**用户态和内核态频繁切换**

3. 如果有多个线程竞争锁资源，锁将会升级为

   轻量级锁

   - 这适用于在**短时间**内持有锁，且分锁**交替切换**的场景
   - 轻量级锁还结合了**自旋锁**来**避免线程用户态与内核态的频繁切换**

4. 如果锁竞争太激烈（自旋锁失败），同步锁会升级为重量级锁

5. 优化synchronized同步锁的关键：

   减少锁竞争

   - 应该尽量使synchronized同步锁处于**轻量级锁**或**偏向锁**，这样才能提高synchronized同步锁的性能
   - 常用手段
     - **减少锁粒度**：降低锁竞争
     - **减少锁的持有时间**，提高synchronized同步锁在自旋时获取锁资源的成功率，**避免升级为重量级锁**

6. 在**锁竞争激烈**时，可以考虑**禁用偏向锁**和**禁用自旋锁**