---
title: Summary of Common Java Concurrency Interview Questions (Part 2)
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: multi-threading, deadlock, synchronized, ReentrantLock, volatile, ThreadLocal, thread pool, CAS, AQS
  - - meta
    - name: description
      content: Summary of common Java concurrency knowledge points and interview questions (including detailed answers).
---

<!-- @include: @article-header.snippet.md -->

## ⭐️JMM (Java Memory Model)

There are many and important issues related to JMM (Java Memory Model), so I extracted a separate article to summarize the knowledge points and issues related to JMM: [JMM (Java Memory Model) Detailed Explanation](https://javaguide.cn/java/concurrent/jmm.html).

## ⭐️volatile keyword

### How to ensure the visibility of variables?

In Java, the `volatile` keyword can ensure the visibility of a variable. If we declare a variable as **`volatile`**, this indicates to the JVM that this variable is shared and unstable and will be read from the main memory every time it is used.

![JMM(Java Memory Model)](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm.png)

![JMM (Java Memory Model) forces reading in main memory](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm2.png)

The `volatile` keyword is actually not unique to the Java language, it is also found in the C language. Its original meaning is to disable the CPU cache. If we use `volatile` to modify a variable, this indicates to the compiler that this variable is shared and unstable, and will be read from main memory every time it is used.

The `volatile` keyword guarantees the visibility of the data, but does not guarantee the atomicity of the data. The `synchronized` keyword guarantees both.

### How to disable instruction reordering?

**In Java, in addition to ensuring the visibility of variables, the `volatile` keyword also plays an important role in preventing JVM instruction reordering. ** If we declare a variable as **`volatile`**, when reading and writing this variable, a specific **memory barrier** will be inserted to prevent instruction reordering.

In Java, the `Unsafe` class provides three memory barrier-related methods out of the box, shielding the underlying differences in the operating system:

```java
public native void loadFence();
public native void storeFence();
public native void fullFence();
```

Theoretically, you can use these three methods to achieve the same effect as `volatile` prohibiting reordering, but it will be more troublesome.

Let me take a common interview question as an example to explain the effect of the `volatile` keyword in prohibiting instruction reordering.

During interviews, interviewers often say: "Do you understand the singleton pattern? Come and write it down for me! Explain to me the principle of double-check locking to implement the singleton pattern!"

**Double verification lock implements object singleton (thread safety)**:

```java
public class Singleton {

    private volatile static Singleton uniqueInstance;

    private Singleton() {
    }

    public static Singleton getUniqueInstance() {
       //First determine whether the object has been instantiated, and then enter the locking code if it has not been instantiated.
        if (uniqueInstance == null) {
            //Class object lock
            synchronized (Singleton.class) {
                if (uniqueInstance == null) {
                    uniqueInstance = new Singleton();
                }
            }
        }
        return uniqueInstance;
    }
}
```

It is also necessary to modify `uniqueInstance` with the `volatile` keyword. `uniqueInstance = new Singleton();` This code is actually divided into three steps:

1. Allocate memory space for `uniqueInstance`
2. Initialize `uniqueInstance`
3. Point `uniqueInstance` to the allocated memory address

However, due to the instruction rearrangement feature of the JVM, the execution order may become 1->3->2. Instruction reordering does not cause problems in a single-threaded environment, but in a multi-threaded environment it will cause a thread to obtain an instance that has not yet been initialized. For example, thread T1 executes 1 and 3. At this time, T2 calls `getUniqueInstance`() and finds that `uniqueInstance` is not empty, so it returns `uniqueInstance`, but `uniqueInstance` has not been initialized yet.

### Can volatile guarantee atomicity?

**The `volatile` keyword can guarantee the visibility of variables, but it does not guarantee that operations on variables are atomic. **

We can prove it with the following code:

```java
/**
 * Search JavaGuide on WeChat and reply to "Interview Assault" to get your own original Java interview manual for free
 *
 * @author Guide brother
 * @date 2022/08/03 13:40
 **/
public class VolatileAtomicDemo {
    public volatile static int inc = 0;

    public void increase() {
        inc++;
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        VolatileAtomicityDemo volatileAtomicityDemo = new VolatileAtomicityDemo();
        for (int i = 0; i < 5; i++) {
            threadPool.execute(() -> {
                for (int j = 0; j < 500; j++) {
                    volatileAtomicityDemo.increase();
                }
            });
        }
        // Wait 1.5 seconds to ensure that the above program execution is completed
        Thread.sleep(1500);
        System.out.println(inc);
        threadPool.shutdown();
    }
}
```

Under normal circumstances, running the above code should output `2500`. But after you actually run the above code, you will find that the output result is less than `2500` every time.

Why does this happen? Isn’t it said that `volatile` can guarantee the visibility of variables?

That is, if `volatile` can guarantee the atomicity of `inc++` operations. After the `inc` variable is incremented in each thread, other threads can immediately see the modified value. Five threads performed 500 operations respectively, so the final value of inc should be 5\*500=2500.

Many people mistakenly think that the increment operation `inc++` is atomic. In fact, `inc++` is actually a compound operation, including three steps:

1. Read the value of inc.
2. Add 1 to inc.
3. Write the value of inc back to memory.

`volatile` cannot guarantee that these three operations are atomic, which may lead to the following situation:

1. After thread 1 reads `inc`, it has not modified it. Thread 2 reads the value of `inc` again, modifies it (+1), and then writes the value of `inc` back to memory.
2. After thread 2 completes the operation, thread 1 modifies the value of `inc` (+1), and then writes the value of `inc` back to the memory.

This also leads to the fact that after two threads perform an auto-increment operation on `inc`, `inc` actually only increases by 1.

In fact, if you want to ensure that the above code runs correctly, it is very simple, you can use `synchronized`, `Lock` or `AtomicInteger`.

Improved using `synchronized`:

```java
public synchronized void increase() {
    inc++;
}
```

Improved using `AtomicInteger`:

```java
public AtomicInteger inc = new AtomicInteger();

public void increase() {
    inc.getAndIncrement();
}```

使用 `ReentrantLock` 改进：

```java
Lock lock = new ReentrantLock();
public void increase() {
    lock.lock();
    try {
        inc++;
    } finally {
        lock.unlock();
    }
}
```

## ⭐️乐观锁和悲观锁

### 什么是悲观锁？

悲观锁总是假设最坏的情况，认为共享资源每次被访问的时候就会出现问题(比如共享数据被修改)，所以每次在获取资源操作的时候都会上锁，这样其他线程想拿到这个资源就会阻塞直到锁被上一个持有者释放。也就是说，**共享资源每次只给一个线程使用，其它线程阻塞，用完后再把资源转让给其它线程**。

像 Java 中`synchronized`和`ReentrantLock`等独占锁就是悲观锁思想的实现。

```java
public void performSynchronisedTask() {
    synchronized (this) {
        // 需要同步的操作
    }
}

private Lock lock = new ReentrantLock();
lock.lock();
try {
   // 需要同步的操作
} finally {
    lock.unlock();
}
```

高并发的场景下，激烈的锁竞争会造成线程阻塞，大量阻塞线程会导致系统的上下文切换，增加系统的性能开销。并且，悲观锁还可能会存在死锁问题，影响代码的正常运行。

### 什么是乐观锁？

乐观锁总是假设最好的情况，认为共享资源每次被访问的时候不会出现问题，线程可以不停地执行，无需加锁也无需等待，只是在提交修改的时候去验证对应的资源（也就是数据）是否被其它线程修改了（具体方法可以使用版本号机制或 CAS 算法）。

在 Java 中`java.util.concurrent.atomic`包下面的原子变量类（比如`AtomicInteger`、`LongAdder`）就是使用了乐观锁的一种实现方式 **CAS** 实现的。
![JUC原子类概览](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88-20230814005211968.png)

```java
// LongAdder 在高并发场景下会比 AtomicInteger 和 AtomicLong 的性能更好
// 代价就是会消耗更多的内存空间（空间换时间）
LongAdder sum = new LongAdder();
sum.increment();
```

高并发的场景下，乐观锁相比悲观锁来说，不存在锁竞争造成线程阻塞，也不会有死锁的问题，在性能上往往会更胜一筹。但是，如果冲突频繁发生（写占比非常多的情况），会频繁失败和重试，这样同样会非常影响性能，导致 CPU 飙升。

不过，大量失败重试的问题也是可以解决的，像我们前面提到的 `LongAdder`以空间换时间的方式就解决了这个问题。

理论上来说：

- 悲观锁通常多用于写比较多的情况（多写场景，竞争激烈），这样可以避免频繁失败和重试影响性能，悲观锁的开销是固定的。不过，如果乐观锁解决了频繁失败和重试这个问题的话（比如`LongAdder`），也是可以考虑使用乐观锁的，要视实际情况而定。
- 乐观锁通常多用于写比较少的情况（多读场景，竞争较少），这样可以避免频繁加锁影响性能。不过，乐观锁主要针对的对象是单个共享变量（参考`java.util.concurrent.atomic`包下面的原子变量类）。

### 如何实现乐观锁？

乐观锁一般会使用版本号机制或 CAS 算法实现，CAS 算法相对来说更多一些，这里需要格外注意。

#### 版本号机制

一般是在数据表中加上一个数据版本号 `version` 字段，表示数据被修改的次数。当数据被修改时，`version` 值会加一。当线程 A 要更新数据值时，在读取数据的同时也会读取 `version` 值，在提交更新时，若刚才读取到的 version 值为当前数据库中的 `version` 值相等时才更新，否则重试更新操作，直到更新成功。

**举一个简单的例子**：假设数据库中帐户信息表中有一个 version 字段，当前值为 1 ；而当前帐户余额字段（ `balance` ）为 \$100 。

1. 操作员 A 此时将其读出（ `version`=1 ），并从其帐户余额中扣除 $50（ $100-\$50 ）。
2. 在操作员 A 操作的过程中，操作员 B 也读入此用户信息（ `version`=1 ），并从其帐户余额中扣除 $20 （ $100-\$20 ）。
3. 操作员 A 完成了修改工作，将数据版本号（ `version`=1 ），连同帐户扣除后余额（ `balance`=\$50 ），提交至数据库更新，此时由于提交数据版本等于数据库记录当前版本，数据被更新，数据库记录 `version` 更新为 2 。
4. 操作员 B 完成了操作，也将版本号（ `version`=1 ）试图向数据库提交数据（ `balance`=\$80 ），但此时比对数据库记录版本时发现，操作员 B 提交的数据版本号为 1 ，数据库记录当前版本也为 2 ，不满足 “ 提交版本必须等于当前版本才能执行更新 “ 的乐观锁策略，因此，操作员 B 的提交被驳回。

这样就避免了操作员 B 用基于 `version`=1 的旧数据修改的结果覆盖操作员 A 的操作结果的可能。

#### CAS 算法

CAS 的全称是 **Compare And Swap（比较与交换）** ，用于实现乐观锁，被广泛应用于各大框架中。CAS 的思想很简单，就是用一个预期值和要更新的变量值进行比较，两值相等才会进行更新。

CAS 是一个原子操作，底层依赖于一条 CPU 的原子指令。

> **原子操作** 即最小不可拆分的操作，也就是说操作一旦开始，就不能被打断，直到操作完成。

CAS 涉及到三个操作数：

- **V**：要更新的变量值(Var)
- **E**：预期值(Expected)
- **N**：拟写入的新值(New)

当且仅当 V 的值等于 E 时，CAS 通过原子方式用新值 N 来更新 V 的值。如果不等，说明已经有其它线程更新了 V，则当前线程放弃更新。

**举一个简单的例子**：线程 A 要修改变量 i 的值为 6，i 原值为 1（V = 1，E=1，N=6，假设不存在 ABA 问题）。

1. i 与 1 进行比较，如果相等， 则说明没被其他线程修改，可以被设置为 6 。
2. i 与 1 进行比较，如果不相等，则说明被其他线程修改，当前线程放弃更新，CAS 操作失败。

当多个线程同时使用 CAS 操作一个变量时，只有一个会胜出，并成功更新，其余均会失败，但失败的线程并不会被挂起，仅是被告知失败，并且允许再次尝试，当然也允许失败的线程放弃操作。

Java 语言并没有直接实现 CAS，CAS 相关的实现是通过 C++ 内联汇编的形式实现的（JNI 调用）。因此， CAS 的具体实现和操作系统以及 CPU 都有关系。

`sun.misc`包下的`Unsafe`类提供了`compareAndSwapObject`、`compareAndSwapInt`、`compareAndSwapLong`方法来实现的对`Object`、`int`、`long`类型的 CAS 操作

```java
/**
  *  CAS
  * @param o         包含要修改field的对象
  * @param offset    对象中某field的偏移量
  * @param expected  期望值
  * @param update    更新值
  * @return          true | false
  */
public final native boolean compareAndSwapObject(Object o, long offset,  Object expected, Object update);

public final native boolean compareAndSwapInt(Object o, long offset, int expected,int update);

public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```

关于 `Unsafe` 类的详细介绍可以看这篇文章：[Java 魔法类 Unsafe 详解 - JavaGuide - 2022](https://javaguide.cn/java/basis/unsafe.html) 。

### Java 中 CAS 是如何实现的？

在 Java 中，实现 CAS（Compare-And-Swap, 比较并交换）操作的一个关键类是`Unsafe`。

The `Unsafe` class is located under the `sun.misc` package and is a class that provides low-level, unsafe operations. Due to its powerful functions and potential dangers, it is usually used inside the JVM or in some libraries that require extremely high performance and low-level access, and is not recommended for use by ordinary developers in applications. For a detailed introduction to the `Unsafe` class, you can read this article: 📌[Detailed explanation of Java magic class Unsafe](https://javaguide.cn/java/basis/unsafe.html).

The `Unsafe` class under the `sun.misc` package provides `compareAndSwapObject`, `compareAndSwapInt` and `compareAndSwapLong` methods to implement CAS operations on `Object`, `int` and `long` types:

```java
/**
 * Atomicly update the value of an object field.
 *
 * @param o The object to be operated on
 * @param offset The memory offset of the object field
 * @param expected The expected old value
 * @param x the new value to be set
 * @return Returns true if the value is successfully updated; otherwise returns false
 */
boolean compareAndSwapObject(Object o, long offset, Object expected, Object x);

/**
 * Atomicly update the value of an object field of type int.
 */
boolean compareAndSwapInt(Object o, long offset, int expected, int x);

/**
 * Atomicly update the value of an object field of type long.
 */
boolean compareAndSwapLong(Object o, long offset, long expected, long x);
```

The CAS methods in the `Unsafe` class are `native` methods. The `native` keyword indicates that these methods are implemented in native code (usually C or C++) rather than in Java. These methods directly call underlying hardware instructions to implement atomic operations. In other words, the Java language does not directly implement CAS in Java, but in the form of C++ inline assembly (through JNI calls). Therefore, the specific implementation of CAS is closely related to the operating system and CPU.

The `java.util.concurrent.atomic` package provides classes for atomic operations. These classes utilize low-level atomic instructions to ensure that operations in a multi-threaded environment are thread-safe.

![JUC Atomic Class Overview](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

For the introduction and use of these Atomic atomic classes, you can read this article: [Atomic Atomic Class Summary](https://javaguide.cn/java/concurrent/atomic-classes.html).

`AtomicInteger` is one of Java's atomic classes. It is mainly used to perform atomic operations on variables of type `int`. It uses the low-level atomic operation methods provided by the `Unsafe` class to achieve lock-free thread safety.

Below, we explain how Java uses the methods of the `Unsafe` class to implement atomic operations by interpreting the core source code of `AtomicInteger` (JDK1.8).

The core source code of `AtomicInteger` is as follows:

```java
// Get Unsafe instance
private static final Unsafe unsafe = Unsafe.getUnsafe();
private static final long valueOffset;

static {
    try {
        // Get the memory offset of the "value" field in the AtomicInteger class
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}
// Ensure visibility of "value" field
private volatile int value;

// If the current value is equal to the expected value, atomically set the value to newValue
// Use the Unsafe#compareAndSwapInt method to perform CAS operations
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}

// Atomicly add delta to the current value and return the old value
public final int getAndAdd(int delta) {
    return unsafe.getAndAddInt(this, valueOffset, delta);
}

// Atomicly increase the current value by 1 and return the value before addition (old value)
// Use the Unsafe#getAndAddInt method to perform CAS operations.
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}

// Atomicly decrement the current value by 1 and return the value before decrement (old value)
public final int getAndDecrement() {
    return unsafe.getAndAddInt(this, valueOffset, -1);
}
```

`Unsafe#getAndAddInt` source code:

```java
// Atomically get and increment an integer value
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        // Get the integer value of object o at memory offset offset in volatile mode
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, v + delta));
    //return old value
    return v;
}
```

As you can see, `getAndAddInt` uses a `do-while` loop: when the `compareAndSwapInt` operation fails, it will be retried until it succeeds. That is to say, the `getAndAddInt` method will try to update the value of `value` through the `compareAndSwapInt` method. If the update fails (the current value is modified by other threads during this period), it will re-obtain the current value and try to update again until the operation is successful.

Since CAS operations may fail due to concurrency conflicts, they are usually used with a while loop to retry after failure until the operation succeeds. This is the **Spin Lock Mechanism**.

### What are the problems with the CAS algorithm?

The ABA problem is the most common problem with CAS algorithms.

#### ABA Questions

If a variable V has the value A when it is first read, and it is checked that it is still the value A when preparing to assign it, can we prove that its value has not been modified by other threads? Obviously it cannot, because during this period its value may be changed to other values, and then changed back to A, then the CAS operation will mistakenly think that it has never been modified. This problem is known as the "ABA" problem of CAS operations. **

The solution to the ABA problem is to append a version number or timestamp in front of the variable. The `AtomicStampedReference` class after JDK 1.5 is used to solve the ABA problem. The `compareAndSet()` method is to first check whether the current reference is equal to the expected reference, and whether the current flag is equal to the expected flag. If all are equal, the value of the reference and the flag is atomically set to the given update value.

```java
public boolean compareAndSet(V expectedReference,
                             V newReference,
                             int expectedStamp,
                             int newStamp) {
    Pair<V> current = pair;
    return
        expectedReference == current.reference &&
        expectedStamp == current.stamp &&
        ((newReference == current.reference &&
          newStamp == current.stamp) ||
         casPair(current, Pair.of(newReference, newStamp)));
}
```

#### Long cycle time and high overheadCAS 经常会用到自旋操作来进行重试，也就是不成功就一直循环执行直到成功。如果长时间不成功，会给 CPU 带来非常大的执行开销。

如果 JVM 能够支持处理器提供的`pause`指令，那么自旋操作的效率将有所提升。`pause`指令有两个重要作用：

1. **延迟流水线执行指令**：`pause`指令可以延迟指令的执行，从而减少 CPU 的资源消耗。具体的延迟时间取决于处理器的实现版本，在某些处理器上，延迟时间可能为零。
2. **避免内存顺序冲突**：在退出循环时，`pause`指令可以避免由于内存顺序冲突而导致的 CPU 流水线被清空，从而提高 CPU 的执行效率。

#### 只能保证一个共享变量的原子操作

CAS 操作仅能对单个共享变量有效。当需要操作多个共享变量时，CAS 就显得无能为力。不过，从 JDK 1.5 开始，Java 提供了`AtomicReference`类，这使得我们能够保证引用对象之间的原子性。通过将多个变量封装在一个对象中，我们可以使用`AtomicReference`来执行 CAS 操作。

除了 `AtomicReference` 这种方式之外，还可以利用加锁来保证。

## synchronized 关键字

### synchronized 是什么？有什么用？

`synchronized` 是 Java 中的一个关键字，翻译成中文是同步的意思，主要解决的是多个线程之间访问资源的同步性，可以保证被它修饰的方法或者代码块在任意时刻只能有一个线程执行。

在 Java 早期版本中，`synchronized` 属于 **重量级锁**，效率低下。这是因为监视器锁（monitor）是依赖于底层的操作系统的 `Mutex Lock` 来实现的，Java 的线程是映射到操作系统的原生线程之上的。如果要挂起或者唤醒一个线程，都需要操作系统帮忙完成，而操作系统实现线程之间的切换时需要从用户态转换到内核态，这个状态之间的转换需要相对比较长的时间，时间成本相对较高。

不过，在 Java 6 之后， `synchronized` 引入了大量的优化如自旋锁、适应性自旋锁、锁消除、锁粗化、偏向锁、轻量级锁等技术来减少锁操作的开销，这些优化让 `synchronized` 锁的效率提升了很多。因此， `synchronized` 还是可以在实际项目中使用的，像 JDK 源码、很多开源框架都大量使用了 `synchronized` 。

关于偏向锁多补充一点：由于偏向锁增加了 JVM 的复杂性，同时也并没有为所有应用都带来性能提升。因此，在 JDK15 中，偏向锁被默认关闭（仍然可以使用 `-XX:+UseBiasedLocking` 启用偏向锁），在 JDK18 中，偏向锁已经被彻底废弃（无法通过命令行打开）。

### 如何使用 synchronized？

`synchronized` 关键字的使用方式主要有下面 3 种：

1. 修饰实例方法
2. 修饰静态方法
3. 修饰代码块

**1、修饰实例方法** （锁当前对象实例）

给当前对象实例加锁，进入同步代码前要获得 **当前对象实例的锁** 。

```java
synchronized void method() {
    //业务代码
}
```

**2、修饰静态方法** （锁当前类）

给当前类加锁，会作用于类的所有对象实例 ，进入同步代码前要获得 **当前 class 的锁**。

这是因为静态成员不属于任何一个实例对象，归整个类所有，不依赖于类的特定实例，被类的所有实例共享。

```java
synchronized static void method() {
    //业务代码
}
```

静态 `synchronized` 方法和非静态 `synchronized` 方法之间的调用互斥么？不互斥！如果一个线程 A 调用一个实例对象的非静态 `synchronized` 方法，而线程 B 需要调用这个实例对象所属类的静态 `synchronized` 方法，是允许的，不会发生互斥现象，因为访问静态 `synchronized` 方法占用的锁是当前类的锁，而访问非静态 `synchronized` 方法占用的锁是当前实例对象锁。

**3、修饰代码块** （锁指定对象/类）

对括号里指定的对象/类加锁：

- `synchronized(object)` 表示进入同步代码块前要获得 **给定对象的锁**。
- `synchronized(类.class)` 表示进入同步代码块前要获得 **给定 Class 的锁**

```java
synchronized(this) {
    //业务代码
}
```

**总结：**

- `synchronized` 关键字加到 `static` 静态方法和 `synchronized(class)` 代码块上都是是给 Class 类上锁；
- `synchronized` 关键字加到实例方法上是给对象实例上锁；
- 尽量不要使用 `synchronized(String a)` 因为 JVM 中，字符串常量池具有缓存功能。

### 构造方法可以用 synchronized 修饰么？

构造方法不能使用 synchronized 关键字修饰。不过，可以在构造方法内部使用 synchronized 代码块。

另外，构造方法本身是线程安全的，但如果在构造方法中涉及到共享资源的操作，就需要采取适当的同步措施来保证整个构造过程的线程安全。

### ⭐️synchronized 底层原理了解吗？

synchronized 关键字底层原理属于 JVM 层面的东西。

#### synchronized 同步语句块的情况

```java
public class SynchronizedDemo {
    public void method() {
        synchronized (this) {
            System.out.println("synchronized 代码块");
        }
    }
}
```

通过 JDK 自带的 `javap` 命令查看 `SynchronizedDemo` 类的相关字节码信息：首先切换到类的对应目录执行 `javac SynchronizedDemo.java` 命令生成编译后的 .class 文件，然后执行`javap -c -s -v -l SynchronizedDemo.class`。

![synchronized关键字原理](https://oss.javaguide.cn/github/javaguide/java/concurrent/synchronized-principle.png)

从上面我们可以看出：**`synchronized` 同步语句块的实现使用的是 `monitorenter` 和 `monitorexit` 指令，其中 `monitorenter` 指令指向同步代码块的开始位置，`monitorexit` 指令则指明同步代码块的结束位置。**

上面的字节码中包含一个 `monitorenter` 指令以及两个 `monitorexit` 指令，这是为了保证锁在同步代码块代码正常执行以及出现异常的这两种情况下都能被正确释放。

当执行 `monitorenter` 指令时，线程试图获取锁也就是获取 **对象监视器 `monitor`** 的持有权。

> 在 Java 虚拟机(HotSpot)中，Monitor 是基于 C++实现的，由[ObjectMonitor](https://github.com/openjdk-mirror/jdk7u-hotspot/blob/50bdefc3afe944ca74c3093e7448d6b889cd20d1/src/share/vm/runtime/objectMonitor.cpp)实现的。每个对象中都内置了一个 `ObjectMonitor`对象。
>
> 另外，`wait/notify`等方法也依赖于`monitor`对象，这就是为什么只有在同步的块或者方法中才能调用`wait/notify`等方法，否则会抛出`java.lang.IllegalMonitorStateException`的异常的原因。

在执行`monitorenter`时，会尝试获取对象的锁，如果锁的计数器为 0 则表示锁可以被获取，获取后将锁计数器设为 1 也就是加 1。

![执行 monitorenter 获取锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/synchronized-get-lock-code-block.png)

对象锁的拥有者线程才可以执行 `monitorexit` 指令来释放锁。在执行 `monitorexit` 指令后，将锁计数器设为 0，表明锁被释放，其他线程可以尝试获取锁。

![执行 monitorexit 释放锁](https://oss.javaguide.cn/github/javaguide/java/concurrent/synchronized-release-lock-block.png)

如果获取对象锁失败，那当前线程就要阻塞等待，直到锁被另外一个线程释放为止。

#### synchronized 修饰方法的情况

```java
public class SynchronizedDemo2 {
    public synchronized void method() {
        System.out.println("synchronized 方法");
    }
}

```

![synchronized关键字原理](https://oss.javaguide.cn/github/javaguide/synchronized%E5%85%B3%E9%94%AE%E5%AD%97%E5%8E%9F%E7%90%862.png)

`synchronized` 修饰的方法并没有 `monitorenter` 指令和 `monitorexit` 指令，取而代之的是 `ACC_SYNCHRONIZED` 标识，该标识指明了该方法是一个同步方法。JVM 通过该 `ACC_SYNCHRONIZED` 访问标志来辨别一个方法是否声明为同步方法，从而执行相应的同步调用。

如果是实例方法，JVM 会尝试获取实例对象的锁。如果是静态方法，JVM 会尝试获取当前 class 的锁。

#### 总结

`synchronized` 同步语句块的实现使用的是 `monitorenter` 和 `monitorexit` 指令，其中 `monitorenter` 指令指向同步代码块的开始位置，`monitorexit` 指令则指明同步代码块的结束位置。

`synchronized` 修饰的方法并没有 `monitorenter` 指令和 `monitorexit` 指令，取而代之的是 `ACC_SYNCHRONIZED` 标识，该标识指明了该方法是一个同步方法。

**不过，两者的本质都是对对象监视器 monitor 的获取。**

相关推荐：[Java 锁与线程的那些事 - 有赞技术团队](https://tech.youzan.com/javasuo-yu-xian-cheng-de-na-xie-shi/) 。

🧗🏻 进阶一下：学有余力的小伙伴可以抽时间详细研究一下对象监视器 `monitor`。

### JDK1.6 之后的 synchronized 底层做了哪些优化？锁升级原理了解吗？

在 Java 6 之后， `synchronized` 引入了大量的优化如自旋锁、适应性自旋锁、锁消除、锁粗化、偏向锁、轻量级锁等技术来减少锁操作的开销，这些优化让 `synchronized` 锁的效率提升了很多（JDK18 中，偏向锁已经被彻底废弃，前面已经提到过了）。

锁主要存在四种状态，依次是：无锁状态、偏向锁状态、轻量级锁状态、重量级锁状态，他们会随着竞争的激烈而逐渐升级。注意锁可以升级不可降级，这种策略是为了提高获得锁和释放锁的效率。

`synchronized` 锁升级是一个比较复杂的过程，面试也很少问到，如果你想要详细了解的话，可以看看这篇文章：[浅析 synchronized 锁升级的原理与实现](https://www.cnblogs.com/star95/p/17542850.html)。

### synchronized 的偏向锁为什么被废弃了？

Open JDK 官方声明：[JEP 374: Deprecate and Disable Biased Locking](https://openjdk.org/jeps/374)

在 JDK15 中，偏向锁被默认关闭（仍然可以使用 `-XX:+UseBiasedLocking` 启用偏向锁），在 JDK18 中，偏向锁已经被彻底废弃（无法通过命令行打开）。

在官方声明中，主要原因有两个方面：

- **性能收益不明显：**

偏向锁是 HotSpot 虚拟机的一项优化技术，可以提升单线程对同步代码块的访问性能。

受益于偏向锁的应用程序通常使用了早期的 Java 集合 API，例如 HashTable、Vector，在这些集合类中通过 synchronized 来控制同步，这样在单线程频繁访问时，通过偏向锁会减少同步开销。

随着 JDK 的发展，出现了 ConcurrentHashMap 高性能的集合类，在集合类内部进行了许多性能优化，此时偏向锁带来的性能收益就不明显了。

偏向锁仅仅在单线程访问同步代码块的场景中可以获得性能收益。

如果存在多线程竞争，就需要 **撤销偏向锁** ，这个操作的性能开销是比较昂贵的。偏向锁的撤销需要等待进入到全局安全点（safe point），该状态下所有线程都是暂停的，此时去检查线程状态并进行偏向锁的撤销。

- **JVM 内部代码维护成本太高：**

偏向锁将许多复杂代码引入到同步子系统，并且对其他的 HotSpot 组件也具有侵入性。这种复杂性为理解代码、系统重构带来了困难，因此， OpenJDK 官方希望禁用、废弃并删除偏向锁。

### ⭐️synchronized 和 volatile 有什么区别？

`synchronized` 关键字和 `volatile` 关键字是两个互补的存在，而不是对立的存在！

- `volatile` 关键字是线程同步的轻量级实现，所以 `volatile`性能肯定比`synchronized`关键字要好 。但是 `volatile` 关键字只能用于变量而 `synchronized` 关键字可以修饰方法以及代码块 。
- `volatile` 关键字能保证数据的可见性，但不能保证数据的原子性。`synchronized` 关键字两者都能保证。
- `volatile`关键字主要用于解决变量在多个线程之间的可见性，而 `synchronized` 关键字解决的是多个线程之间访问资源的同步性。

## ReentrantLock

### ReentrantLock 是什么？

`ReentrantLock` 实现了 `Lock` 接口，是一个可重入且独占式的锁，和 `synchronized` 关键字类似。不过，`ReentrantLock` 更灵活、更强大，增加了轮询、超时、中断、公平锁和非公平锁等高级功能。

```java
public class ReentrantLock implements Lock, java.io.Serializable {}
```

`ReentrantLock` 里面有一个内部类 `Sync`，`Sync` 继承 AQS（`AbstractQueuedSynchronizer`），添加锁和释放锁的大部分操作实际上都是在 `Sync` 中实现的。`Sync` 有公平锁 `FairSync` 和非公平锁 `NonfairSync` 两个子类。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/reentrantlock-class-diagram.png)

`ReentrantLock` 默认使用非公平锁，也可以通过构造器来显式的指定使用公平锁。

```java
// 传入一个 boolean 值，true 时为公平锁，false 时为非公平锁
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

从上面的内容可以看出， `ReentrantLock` 的底层就是由 AQS 来实现的。关于 AQS 的相关内容推荐阅读 [AQS 详解](https://javaguide.cn/java/concurrent/aqs.html) 这篇文章。

### 公平锁和非公平锁有什么区别？

- **公平锁** : 锁被释放之后，先申请的线程先得到锁。性能较差一些，因为公平锁为了保证时间上的绝对顺序，上下文切换更频繁。
- **非公平锁**：锁被释放之后，后申请的线程可能会先获取到锁，是随机或者按照其他优先级排序的。性能更好，但可能会导致某些线程永远无法获取到锁。

### ⭐️synchronized 和 ReentrantLock 有什么区别？

#### 两者都是可重入锁

**可重入锁** 也叫递归锁，指的是线程可以再次获取自己的内部锁。比如一个线程获得了某个对象的锁，此时这个对象锁还没有释放，当其再次想要获取这个对象的锁的时候还是可以获取的，如果是不可重入锁的话，就会造成死锁。

JDK 提供的所有现成的 `Lock` 实现类，包括 `synchronized` 关键字锁都是可重入的。

在下面的代码中，`method1()` 和 `method2()`都被 `synchronized` 关键字修饰，`method1()`调用了`method2()`。

```java
public class SynchronizedDemo {
    public synchronized void method1() {
        System.out.println("方法1");
        method2();
    }

    public synchronized void method2() {
        System.out.println("方法2");
    }
}
```

由于 `synchronized`锁是可重入的，同一个线程在调用`method1()` 时可以直接获得当前对象的锁，执行 `method2()` 的时候可以再次获取这个对象的锁，不会产生死锁问题。假如`synchronized`是不可重入锁的话，由于该对象的锁已被当前线程所持有且无法释放，这就导致线程在执行 `method2()`时获取锁失败，会出现死锁问题。

#### synchronized depends on JVM and ReentrantLock depends on API

`synchronized` relies on JVM implementation. As we mentioned earlier, the virtual machine team made a lot of optimizations for the `synchronized` keyword in JDK1.6, but these optimizations were implemented at the virtual machine level and were not directly exposed to us.

`ReentrantLock` is implemented at the JDK level (that is, at the API level, which requires the `lock()` and `unlock()` methods together with the `try/finally` statement block), so we can see how it is implemented by looking at its source code.

#### ReentrantLock adds some advanced features than synchronized

Compared with `synchronized`, `ReentrantLock` adds some advanced functions. Mainly speaking, there are three main points:

- **Waiting for Interruptible**: `ReentrantLock` provides a mechanism to interrupt threads waiting for the lock. This mechanism is implemented through `lock.lockInterruptibly()`. That is to say, while the current thread is waiting to acquire the lock, if other threads interrupt the current thread "`interrupt()`", the current thread will throw an `InterruptedException` exception, which can be caught and processed accordingly.
- **Achievable fair lock**: `ReentrantLock` can specify whether it is a fair lock or an unfair lock. And `synchronized` can only be an unfair lock. The so-called fair lock means that the thread waiting first obtains the lock first. `ReentrantLock` is unfair by default, and you can specify whether it is fair through the `ReentrantLock(boolean fair)` constructor of the `ReentrantLock` class.
- **Notification mechanism is more powerful**: `ReentrantLock` can achieve group wake-up and selective notification by binding multiple `Condition` objects. This solves the efficiency problem of `synchronized` which can only wake up randomly or all of them, and provides powerful support for complex thread collaboration scenarios.
- **Support timeout**: `ReentrantLock` provides the `tryLock(timeout)` method, which can specify the maximum waiting time to acquire the lock. If the waiting time is exceeded, the lock acquisition will fail and will not wait forever.

If you want to use the above features, then choosing `ReentrantLock` is a good choice.

Additional information about the `Condition` interface:

> `Condition` is only available after JDK1.5. It has good flexibility. For example, it can implement multi-channel notification function, that is, multiple `Condition` instances (i.e. object monitors) can be created in a `Lock` object. **Thread objects can be registered in the specified `Condition`, so that thread notification can be selectively carried out and it is more flexible in scheduling threads. When using the `notify()/notifyAll()` method to notify, the thread to be notified is selected by the JVM. Using the `ReentrantLock` class combined with the `Condition` instance can implement "selective notification"**. This function is very important and is provided by the `Condition` interface by default. The `synchronized` keyword is equivalent to only one `Condition` instance in the entire `Lock` object, and all threads are registered in it. If the `notifyAll()` method is executed, all threads in the waiting state will be notified, which will cause great efficiency problems. The `signalAll()` method of a `Condition` instance will only wake up all waiting threads registered in the `Condition` instance.

Additional information about **Waiting for interruptible**:

> `lockInterruptibly()` will allow the thread acquiring the lock to respond to interrupts while blocking and waiting. That is, when the current thread acquires the lock and finds that the lock is held by another thread, it will block and wait.
>
> During the blocking and waiting process, if other threads interrupt the current thread `interrupt()`, an `InterruptedException` exception will be thrown. You can catch the exception and do some processing operations.
>
> In order to better understand this method, borrow a case from Stack Overflow to better understand that `lockInterruptibly()` can respond to interrupts:
>
> ```JAVA
> public class MyRentrantlock {
> Thread t = new Thread() {
> @Override
> public void run() {
> ReentrantLock r = new ReentrantLock();
> // 1.1. The first attempt to acquire the lock can be successful.
> r.lock();
>
> // 1.2. The number of reentrants of the lock at this time is 1
> System.out.println("lock() : lock count :" + r.getHoldCount());
>
> // 2. Interrupt the current thread. Through Thread.currentThread().isInterrupted() you can see that the interruption status of the current thread is true.
> interrupt();
> System.out.println("Current thread is interrupted");
>
> // 3.1. Try to acquire the lock and you can acquire it successfully.
> r.tryLock();
> // 3.2. The number of reentrants of the lock at this time is 2
> System.out.println("tryLock() on interrupted thread lock count :" + r.getHoldCount());
> try {
> // 4. If the interrupt status of the printing thread is true, then calling the lockInterruptibly() method will throw an InterruptedException exception.
> System.out.println("Current Thread isInterrupted:" + Thread.currentThread().isInterrupted());
> r.lockInterruptibly();
> System.out.println("lockInterruptibly() --NOt executable statement" + r.getHoldCount());
> } catch (InterruptedException e) {
> r.lock();
> System.out.println("Error");
> } finally {
> r.unlock();
> }
>
> // 5. Print the number of reentrants of the lock. You can find that the lockInterruptibly() method did not successfully acquire the lock.
> System.out.println("lockInterruptibly() not able to Acqurie lock: lock count :" + r.getHoldCount());
>
> r.unlock();
> System.out.println("lock count :" + r.getHoldCount());
> r.unlock();
> System.out.println("lock count :" + r.getHoldCount());
> }
> };
> public static void main(String str[]) {
> MyRentrantlock m = new MyRentrantlock();
> m.t.start();
> }
> }
> ```
>
> Output:
>
> ``BASH
> lock() : lock count :1
> Current thread is interrupted
> tryLock() on interrupted thread lock count :2
> Current Thread isInterrupted:true
> Error
> lockInterruptibly() not able to Acqurie lock: lock count :2
> lock count :1
> lock count :0
> ```

Additional information about **Support Timeout**:

> **Why do you need the `tryLock(timeout)` function? **
>> `tryLock(timeout)` 方法尝试在指定的超时时间内获取锁。如果成功获取锁，则返回 `true`；如果在锁可用之前超时，则返回 `false`。此功能在以下几种场景中非常有用：
>
> - **防止死锁：** 在复杂的锁场景中，`tryLock(timeout)` 可以通过允许线程在合理的时间内放弃并重试来帮助防止死锁。
> - **提高响应速度：** 防止线程无限期阻塞。
> - **处理时间敏感的操作：** 对于具有严格时间限制的操作，`tryLock(timeout)` 允许线程在无法及时获取锁时继续执行替代操作。

### 可中断锁和不可中断锁有什么区别？

- **可中断锁**：获取锁的过程中可以被中断，不需要一直等到获取锁之后 才能进行其他逻辑处理。`ReentrantLock` 就属于是可中断锁。
- **不可中断锁**：一旦线程申请了锁，就只能等到拿到锁以后才能进行其他的逻辑处理。 `synchronized` 就属于是不可中断锁。

## ReentrantReadWriteLock

`ReentrantReadWriteLock` 在实际项目中使用的并不多，面试中也问的比较少，简单了解即可。JDK 1.8 引入了性能更好的读写锁 `StampedLock` 。

### ReentrantReadWriteLock 是什么？

`ReentrantReadWriteLock` 实现了 `ReadWriteLock` ，是一个可重入的读写锁，既可以保证多个线程同时读的效率，同时又可以保证有写入操作时的线程安全。

```java
public class ReentrantReadWriteLock
        implements ReadWriteLock, java.io.Serializable{
}
public interface ReadWriteLock {
    Lock readLock();
    Lock writeLock();
}
```

- 一般锁进行并发控制的规则：读读互斥、读写互斥、写写互斥。
- 读写锁进行并发控制的规则：读读不互斥、读写互斥、写写互斥（只有读读不互斥）。

`ReentrantReadWriteLock` 其实是两把锁，一把是 `WriteLock` (写锁)，一把是 `ReadLock`（读锁） 。读锁是共享锁，写锁是独占锁。读锁可以被同时读，可以同时被多个线程持有，而写锁最多只能同时被一个线程持有。

和 `ReentrantLock` 一样，`ReentrantReadWriteLock` 底层也是基于 AQS 实现的。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/reentrantreadwritelock-class-diagram.png)

`ReentrantReadWriteLock` 也支持公平锁和非公平锁，默认使用非公平锁，可以通过构造器来显式地指定。

```java
// 传入一个 boolean 值，true 时为公平锁，false 时为非公平锁
public ReentrantReadWriteLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
    readerLock = new ReadLock(this);
    writerLock = new WriteLock(this);
}
```

### ReentrantReadWriteLock 适合什么场景？

由于 `ReentrantReadWriteLock` 既可以保证多个线程同时读的效率，同时又可以保证有写入操作时的线程安全。因此，在读多写少的情况下，使用 `ReentrantReadWriteLock` 能够明显提升系统性能。

### 共享锁和独占锁有什么区别？

- **共享锁**：一把锁可以被多个线程同时获得。
- **独占锁**：一把锁只能被一个线程获得。

### 线程持有读锁还能获取写锁吗？

- 在线程持有读锁的情况下，该线程不能取得写锁(因为获取写锁的时候，如果发现当前的读锁被占用，就马上获取失败，不管读锁是不是被当前线程持有)。
- 在线程持有写锁的情况下，该线程可以继续获取读锁（获取读锁时如果发现写锁被占用，只有写锁没有被当前线程占用的情况才会获取失败）。

读写锁的源码分析，推荐阅读 [聊聊 Java 的几把 JVM 级锁 - 阿里巴巴中间件](https://mp.weixin.qq.com/s/h3VIUyH9L0v14MrQJiiDbw) 这篇文章，写的很不错。

### 读锁为什么不能升级为写锁？

写锁可以降级为读锁，但是读锁却不能升级为写锁。这是因为读锁升级为写锁会引起线程的争夺，毕竟写锁属于是独占锁，这样的话，会影响性能。

另外，还可能会有死锁问题发生。举个例子：假设两个线程的读锁都想升级写锁，则需要对方都释放自己锁，而双方都不释放，就会产生死锁。

## StampedLock

`StampedLock` 面试中问的比较少，不是很重要，简单了解即可。

### StampedLock 是什么？

`StampedLock` 是 JDK 1.8 引入的性能更好的读写锁，不可重入且不支持条件变量 `Condition`。

不同于一般的 `Lock` 类，`StampedLock` 并不是直接实现 `Lock`或 `ReadWriteLock`接口，而是基于 **CLH 锁** 独立实现的（AQS 也是基于这玩意）。

```java
public class StampedLock implements java.io.Serializable {
}
```

`StampedLock` 提供了三种模式的读写控制模式：读锁、写锁和乐观读。

- **写锁**：独占锁，一把锁只能被一个线程获得。当一个线程获取写锁后，其他请求读锁和写锁的线程必须等待。类似于 `ReentrantReadWriteLock` 的写锁，不过这里的写锁是不可重入的。
- **读锁** （悲观读）：共享锁，没有线程获取写锁的情况下，多个线程可以同时持有读锁。如果己经有线程持有写锁，则其他线程请求获取该读锁会被阻塞。类似于 `ReentrantReadWriteLock` 的读锁，不过这里的读锁是不可重入的。
- **乐观读**：允许多个线程获取乐观读以及读锁。同时允许一个写线程获取写锁。

另外，`StampedLock` 还支持这三种锁在一定条件下进行相互转换 。

```java
long tryConvertToWriteLock(long stamp){}
long tryConvertToReadLock(long stamp){}
long tryConvertToOptimisticRead(long stamp){}
```

`StampedLock` 在获取锁的时候会返回一个 long 型的数据戳，该数据戳用于稍后的锁释放参数，如果返回的数据戳为 0 则表示锁获取失败。当前线程持有了锁再次获取锁还是会返回一个新的数据戳，这也是`StampedLock`不可重入的原因。

```java
// 写锁
public long writeLock() {
    long s, next;  // bypass acquireWrite in fully unlocked case only
    return ((((s = state) & ABITS) == 0L &&
             U.compareAndSwapLong(this, STATE, s, next = s + WBIT)) ?
            next : acquireWrite(false, 0L));
}
// 读锁
public long readLock() {
    long s = state, next;  // bypass acquireRead on common uncontended case
    return ((whead == wtail && (s & ABITS) < RFULL &&
             U.compareAndSwapLong(this, STATE, s, next = s + RUNIT)) ?
            next : acquireRead(false, 0L));
}
// 乐观读
public long tryOptimisticRead() {
    long s;
    return (((s = state) & WBIT) == 0L) ? (s & SBITS) : 0L;
}
```

### StampedLock 的性能为什么更好？

相比于传统读写锁多出来的乐观读是`StampedLock`比 `ReadWriteLock` 性能更好的关键原因。`StampedLock` 的乐观读允许一个写线程获取写锁，所以不会导致所有写线程阻塞，也就是当读多写少的时候，写线程有机会获取写锁，减少了线程饥饿的问题，吞吐量大大提高。

### StampedLock 适合什么场景？

Like `ReentrantReadWriteLock`, `StampedLock` is also suitable for business scenarios with more reading and less writing. It can be used as a substitute for `ReentrantReadWriteLock` with better performance.

However, it should be noted that `StampedLock` is not reentrant, does not support condition variables `Condition`, and is not friendly to interrupt operations (improper use can easily cause CPU spikes). If you need to use some of the advanced features of `ReentrantLock`, it is not recommended to use `StampedLock`.

In addition, although `StampedLock` has good performance, it is relatively troublesome to use. Once used improperly, production problems will occur. It is strongly recommended that you read the cases in [StampedLock official documentation](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/StampedLock.html) before using `StampedLock`.

### Do you understand the underlying principle of StampedLock?

`StampedLock` does not directly implement the `Lock` or `ReadWriteLock` interface, but is implemented based on **CLH lock** (AQS is also based on this thing). CLH lock is an improvement on spin lock and is an implicit linked list queue. `StampedLock` manages threads through the CLH queue, and uses the synchronization state value `state` to represent the status and type of the lock.

The principle of `StampedLock` is similar to the AQS principle, so I won’t introduce it in detail here. If you are interested, you can read the following two articles:

- [AQS detailed explanation](https://javaguide.cn/java/concurrent/aqs.html)
- [Analysis of the underlying principles of StampedLock](https://segmentfault.com/a/1190000015808032)

If you are just preparing for an interview, it is recommended that you spend more effort to understand the AQS principle. The probability of encountering the underlying principle of `StampedLock` in an interview is very small.

## Atomic atomic class

I wrote a separate article to summarize the content of the Atomic atomic class: [Atomic Atomic Class Summary](./atomic-classes.md).

## Reference

- "In-depth Understanding of Java Virtual Machine"
- "Practical Java High Concurrency Programming"
- Guide to the Volatile Keyword in Java - Baeldung: <https://www.baeldung.com/java-volatile>
- Things that must be said about Java "lock" - Meituan technical team: <https://tech.meituan.com/2018/11/15/java-lock.html>
- Why can't the read lock in the ReadWriteLock class be upgraded to a write lock? ：<https://cloud.tencent.com/developer/article/1176230>
- StampedLock, a high-performance tool to solve thread hunger: <https://mp.weixin.qq.com/s/2Acujjr4BHIhlFsCLGwYSg>
- Understanding ThreadLocal in Java - Technical Black Room: <https://droidyue.com/blog/2016/03/13/learning-threadlocal-in-java/>
- ThreadLocal (Java Platform SE 8) - Oracle Help Center: <https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html>

<!-- @include: @article-footer.snippet.md -->