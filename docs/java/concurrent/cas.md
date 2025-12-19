---
title: CAS 详解
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: CAS,Compare-And-Swap,Unsafe,原子操作,ABA 问题,自旋,乐观锁,原子类
  - - meta
    - name: description
      content: 解析 Java 中 CAS 的实现与原理，涵盖 Unsafe 提供的原子操作、常见问题如 ABA 以及与锁的对比。
---

乐观锁和悲观锁的介绍以及乐观锁常见实现方式可以阅读笔者写的这篇文章：[乐观锁和悲观锁详解](https://javaguide.cn/java/concurrent/optimistic-lock-and-pessimistic-lock.html)。

这篇文章主要介绍 ：Java 中 CAS 的实现以及 CAS 存在的一些问题。

## Java 中 CAS 是如何实现的？

在 Java 中，实现 CAS（Compare-And-Swap, 比较并交换）操作的一个关键类是`Unsafe`。

`Unsafe`类位于`sun.misc`包下，是一个提供低级别、不安全操作的类。由于其强大的功能和潜在的危险性，它通常用于 JVM 内部或一些需要极高性能和底层访问的库中，而不推荐普通开发者在应用程序中使用。关于 `Unsafe`类的详细介绍，可以阅读这篇文章：📌[Java 魔法类 Unsafe 详解](https://javaguide.cn/java/basis/unsafe.html)。

`sun.misc`包下的`Unsafe`类提供了`compareAndSwapObject`、`compareAndSwapInt`、`compareAndSwapLong`方法来实现的对`Object`、`int`、`long`类型的 CAS 操作：

```java
/**
 * 以原子方式更新对象字段的值。
 *
 * @param o        要操作的对象
 * @param offset   对象字段的内存偏移量
 * @param expected 期望的旧值
 * @param x        要设置的新值
 * @return 如果值被成功更新，则返回 true；否则返回 false
 */
boolean compareAndSwapObject(Object o, long offset, Object expected, Object x);

/**
 * 以原子方式更新 int 类型的对象字段的值。
 */
boolean compareAndSwapInt(Object o, long offset, int expected, int x);

/**
 * 以原子方式更新 long 类型的对象字段的值。
 */
boolean compareAndSwapLong(Object o, long offset, long expected, long x);
```

`Unsafe`类中的 CAS 方法是`native`方法。`native`关键字表明这些方法是用本地代码（通常是 C 或 C++）实现的，而不是用 Java 实现的。这些方法直接调用底层的硬件指令来实现原子操作。也就是说，Java 语言并没有直接用 Java 实现 CAS。

更准确点来说，Java 中 CAS 是 C++ 内联汇编的形式实现的，通过 JNI（Java Native Interface） 调用。因此，CAS 的具体实现与操作系统以及 CPU 密切相关。

`java.util.concurrent.atomic` 包提供了一些用于原子操作的类。

![JUC原子类概览](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

关于这些 Atomic 原子类的介绍和使用，可以阅读这篇文章：[Atomic 原子类总结](https://javaguide.cn/java/concurrent/atomic-classes.html)。

Atomic 类依赖于 CAS 乐观锁来保证其方法的原子性，而不需要使用传统的锁机制（如 `synchronized` 块或 `ReentrantLock`）。

`AtomicInteger`是 Java 的原子类之一，主要用于对 `int` 类型的变量进行原子操作，它利用`Unsafe`类提供的低级别原子操作方法实现无锁的线程安全性。

下面，我们通过解读`AtomicInteger`的核心源码（JDK1.8），来说明 Java 如何使用`Unsafe`类的方法来实现原子操作。

`AtomicInteger`核心源码如下：

```java
// 获取 Unsafe 实例
private static final Unsafe unsafe = Unsafe.getUnsafe();
private static final long valueOffset;

static {
    try {
        // 获取“value”字段在AtomicInteger类中的内存偏移量
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}
// 确保“value”字段的可见性
private volatile int value;

// 如果当前值等于预期值，则原子地将值设置为newValue
// 使用 Unsafe#compareAndSwapInt 方法进行CAS操作
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}

// 原子地将当前值加 delta 并返回旧值
public final int getAndAdd(int delta) {
    return unsafe.getAndAddInt(this, valueOffset, delta);
}

// 原子地将当前值加 1 并返回加之前的值（旧值）
// 使用 Unsafe#getAndAddInt 方法进行CAS操作。
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}

// 原子地将当前值减 1 并返回减之前的值（旧值）
public final int getAndDecrement() {
    return unsafe.getAndAddInt(this, valueOffset, -1);
}
```

`Unsafe#getAndAddInt`源码：

```java
// 原子地获取并增加整数值
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        // 以 volatile 方式获取对象 o 在内存偏移量 offset 处的整数值
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, v + delta));
    // 返回旧值
    return v;
}
```

可以看到，`getAndAddInt` 使用了 `do-while` 循环：在`compareAndSwapInt`操作失败时，会不断重试直到成功。也就是说，`getAndAddInt`方法会通过 `compareAndSwapInt` 方法来尝试更新 `value` 的值，如果更新失败（当前值在此期间被其他线程修改），它会重新获取当前值并再次尝试更新，直到操作成功。

由于 CAS 操作可能会因为并发冲突而失败，因此通常会与`while`循环搭配使用，在失败后不断重试，直到操作成功。这就是 **自旋锁机制** 。

## CAS 算法存在哪些问题？

ABA 问题是 CAS 算法最常见的问题。

### ABA 问题

如果一个变量 V 初次读取的时候是 A 值，并且在准备赋值的时候检查到它仍然是 A 值，那我们就能说明它的值没有被其他线程修改过了吗？很明显是不能的，因为在这段时间它的值可能被改为其他值，然后又改回 A，那 CAS 操作就会误认为它从来没有被修改过。这个问题被称为 CAS 操作的 **"ABA"问题。**

ABA 问题的解决思路是在变量前面追加上**版本号或者时间戳**。JDK 1.5 以后的 `AtomicStampedReference` 类就是用来解决 ABA 问题的，其中的 `compareAndSet()` 方法就是首先检查当前引用是否等于预期引用，并且当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。

```java
public boolean compareAndSet(V   expectedReference,
                             V   newReference,
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

#### ABA 问题的实际影响场景

虽然 ABA 问题在理论上存在,但在实际应用中是否真的会造成影响需要具体分析:

**无影响场景**: 如果只关心变量的当前值而不关心变更历史,ABA 问题通常不会造成实际影响。例如 `AtomicInteger` 的累加操作,即使值经历了 A→B→A 的变化,最终累加结果仍然正确。

**有影响场景**: 在需要维护数据结构完整性的场景中,ABA 问题可能导致严重错误。典型案例是**无锁栈**的出栈操作:

```
线程 1 准备 CAS 弹出节点 A (A→B→C)
线程 2 弹出 A 和 B,然后重新压入 A (栈变为 A→C)
线程 1 的 CAS 成功(发现栈顶仍是 A),将 next 指向原来的 B
结果: 节点 C 丢失,B 可能已被回收导致悬挂指针
```

因此,涉及指针操作和数据结构维护时,应使用 `AtomicStampedReference` 或 `AtomicMarkableReference` 避免 ABA 问题。

### CAS 的 CPU 层面实现

在 x86 架构下,CAS 操作最终会被编译为 **CMPXCHG 指令**,并配合 **LOCK 前缀**保证原子性:

```assembly
LOCK CMPXCHG [内存地址], 新值
```

**LOCK 前缀的作用:**

1. **锁定总线或缓存行**: 在多核处理器中,LOCK 前缀会锁定相关的缓存行(而非整个总线),防止其他 CPU 同时修改该内存位置
2. **保证内存可见性**: 强制将写缓冲区的数据刷新到主内存,并使其他 CPU 的缓存行失效

这就是为什么 CAS 能够在硬件层面保证原子性的原因。相比 synchronized 的重量级锁,CAS 仅锁定单个缓存行,因此开销小得多。

### 自旋与阻塞的性能权衡

CAS 失败时会进行自旋重试,这在不同竞争程度下有不同的性能表现:

**低竞争场景**: CAS 几乎不会失败,自旋开销极小,性能远超加锁方式(避免了线程上下文切换)。

**高竞争场景**: CAS 频繁失败导致大量自旋,CPU 空转消耗资源。此时 synchronized 或 Lock 的阻塞机制反而更优,因为线程会被挂起释放 CPU。

JDK 的 **自适应自旋锁** 就是基于这种权衡:JVM 会根据历史竞争情况动态调整自旋次数,在高竞争时及时转为阻塞。

### LongAdder 的分段 CAS 优化

在高并发计数场景下,多个线程对同一个 `AtomicLong` 进行 CAS 更新会导致激烈竞争。`LongAdder` 通过**分段计数**大幅降低竞争:

**核心思想**: 维护一个 `Cell` 数组,每个线程优先更新自己的 Cell,最终求和获取总值。

```java
// LongAdder 内部结构
transient volatile Cell[] cells;
transient volatile long base;

final void longAccumulate(long x, ...) {
    // 如果 cells 为空,先尝试更新 base
    if (cells == null) {
        if (casBase(b = base, b + x))
            return;
    }
    // 否则找到线程对应的 Cell 进行更新
    Cell c = cells[getProbe() & m];
    if (c.cas(v = c.value, v + x))
        return;
    // 更新失败则扩容或rehash
}

public long sum() {
    Cell[] cs = cells;
    long sum = base;
    if (cs != null) {
        for (Cell c : cs)
            if (c != null)
                sum += c.value;
    }
    return sum;
}
```

这种设计与 `ConcurrentHashMap` 的 `counterCells` 机制完全一致,都是通过**分散热点、化整为零**的思想实现高并发下的性能优化。在高并发累加场景下,`LongAdder` 的性能优于 `AtomicLong`。

### 循环时间长开销大

CAS 经常会用到自旋操作来进行重试，也就是不成功就一直循环执行直到成功。如果长时间不成功，会给 CPU 带来非常大的执行开销。

如果 JVM 能够支持处理器提供的`pause`指令，那么自旋操作的效率将有所提升。`pause`指令有两个重要作用：

1. **延迟流水线执行指令**：`pause`指令可以延迟指令的执行，从而减少 CPU 的资源消耗。具体的延迟时间取决于处理器的实现版本，在某些处理器上，延迟时间可能为零。
2. **避免内存顺序冲突**：在退出循环时，`pause`指令可以避免由于内存顺序冲突而导致的 CPU 流水线被清空，从而提高 CPU 的执行效率。

### 只能保证一个共享变量的原子操作

CAS 操作仅能对单个共享变量有效。当需要操作多个共享变量时，CAS 就显得无能为力。不过，从 JDK 1.5 开始，Java 提供了`AtomicReference`类，这使得我们能够保证引用对象之间的原子性。通过将多个变量封装在一个对象中，我们可以使用`AtomicReference`来执行 CAS 操作。

除了 `AtomicReference` 这种方式之外，还可以利用加锁来保证。

## 总结

在 Java 中，CAS 通过 `Unsafe` 类中的 `native` 方法实现，这些方法调用底层的硬件指令来完成原子操作。由于其实现依赖于 C++ 内联汇编和 JNI 调用，因此 CAS 的具体实现与操作系统以及 CPU 密切相关。

CAS 虽然具有高效的无锁特性，但也需要注意 ABA 、循环时间长开销大等问题。

## 参考资料

- 《Java 并发编程的艺术》方腾飞等著, 第 2 章 Java 并发机制的底层实现原理
- 《深入理解 Java 虚拟机(第 3 版)》周志明著, 第 13 章 线程安全与锁优化
- OpenJDK Unsafe 源码: <https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/jdk/internal/misc/Unsafe.java>
- Intel® 64 and IA-32 Architectures Software Developer's Manual, Volume 3A: System Programming Guide, Part 1, Chapter 8: Multiple-Processor Management
- Doug Lea - A Java Fork/Join Framework: <http://gee.cs.oswego.edu/dl/papers/fj.pdf>
- Oracle Docs - java.util.concurrent.atomic Package Summary: <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/package-summary.html>
