---
title: CAS detailed explanation
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: CAS, Compare-And-Swap, Unsafe, atomic operation, ABA problem, spin, optimistic locking, atomic class
  - - meta
    - name: description
      content: Analyze the implementation and principles of CAS in Java, covering the atomic operations provided by Unsafe, common issues such as ABA, and comparison with locks.
---

For an introduction to optimistic locks and pessimistic locks and common implementation methods of optimistic locks, you can read this article written by the author: [Detailed explanation of optimistic locks and pessimistic locks] (https://javaguide.cn/java/concurrent/optimistic-lock-and-pessimistic-lock.html).

This article mainly introduces: the implementation of CAS in Java and some problems of CAS.

## How is CAS implemented in Java?

In Java, a key class that implements CAS (Compare-And-Swap, compare and swap) operations is `Unsafe`.

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

The CAS methods in the `Unsafe` class are `native` methods. The `native` keyword indicates that these methods are implemented in native code (usually C or C++) rather than in Java. These methods directly call underlying hardware instructions to implement atomic operations. In other words, the Java language does not directly implement CAS in Java.

To be more precise, CAS in Java is implemented in the form of C++ inline assembly and is called through JNI (Java Native Interface). Therefore, the specific implementation of CAS is closely related to the operating system and CPU.

The `java.util.concurrent.atomic` package provides classes for atomic operations.

![JUC Atomic Class Overview](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

For the introduction and use of these Atomic atomic classes, you can read this article: [Atomic Atomic Class Summary](https://javaguide.cn/java/concurrent/atomic-classes.html).

Atomic classes rely on CAS optimistic locking to guarantee the atomicity of their methods without using traditional locking mechanisms (such as `synchronized` blocks or `ReentrantLock`).

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

## What are the problems with the CAS algorithm?

The ABA problem is the most common problem with CAS algorithms.

### ABA Questions

If a variable V has the value A when it is first read, and it is checked that it is still the value A when preparing to assign it, can we prove that its value has not been modified by other threads? Obviously it cannot, because during this period its value may be changed to other values, and then changed back to A, then the CAS operation will mistakenly think that it has never been modified. This problem is known as the "ABA" problem of CAS operations. **The solution to the ABA problem is to append a version number or timestamp in front of the variable. The `AtomicStampedReference` class after JDK 1.5 is used to solve the ABA problem. The `compareAndSet()` method is to first check whether the current reference is equal to the expected reference, and whether the current flag is equal to the expected flag. If all are equal, the value of the reference and the flag is atomically set to the given update value.

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

### Long cycle time and high overhead

CAS often uses spin operations to retry, that is, if it fails, it will continue to loop until it succeeds. If it is unsuccessful for a long time, it will bring very large execution overhead to the CPU.

If the JVM can support the `pause` instruction provided by the processor, the efficiency of the spin operation will be improved. The `pause` directive has two important functions:

1. **Delay pipeline execution instructions**: The `pause` instruction can delay the execution of instructions, thereby reducing CPU resource consumption. The exact latency depends on the processor implementation and may be zero on some processors.
2. **Avoid memory order conflicts**: When exiting the loop, the `pause` instruction can avoid the CPU pipeline being cleared due to memory order conflicts, thereby improving the CPU execution efficiency.

### Only atomic operations on a shared variable can be guaranteed

CAS operations are only valid on a single shared variable. CAS is powerless when multiple shared variables need to be manipulated. However, starting from JDK 1.5, Java provides the `AtomicReference` class, which allows us to ensure atomicity between reference objects. By encapsulating multiple variables in a single object, we can use `AtomicReference` to perform CAS operations.

In addition to `AtomicReference`, locking can also be used to ensure this.

## Summary

In Java, CAS is implemented through `native` methods in the `Unsafe` class, which call underlying hardware instructions to complete atomic operations. Because its implementation relies on C++ inline assembly and JNI calls, the specific implementation of CAS is closely related to the operating system and CPU.

Although CAS has efficient lock-free features, it also needs to pay attention to issues such as ABA, long cycle time and high overhead.