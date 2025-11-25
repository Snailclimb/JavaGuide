---
title: Overview of new features in Java 19
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 19, JDK19, virtual thread preview, structured concurrency, external function API, JEP
  - - meta
    - name: description
      content: Introducing the preview features and concurrency-related updates of JDK 19, paving the way for subsequent virtual threads.
---

JDK 19 is scheduled to be officially released for production use on September 20, 2022, and is not a long-term support version. However, there are some important new features in JDK 19 that are worthy of attention.

JDK 19 has only 7 new features:

- [JEP 405: Record Patterns](https://openjdk.org/jeps/405) (Preview)
- [JEP 422: Linux/RISC-V Port](https://openjdk.org/jeps/422)
- [JEP 424: Foreign Function & Memory API (Foreign Function and Memory API)](https://openjdk.org/jeps/424) (Preview)
- [JEP 425: Virtual Threads](https://openjdk.org/jeps/425) (Preview)
- [JEP 426: Vector API](https://openjdk.java.net/jeps/426) (Fourth incubation)
- [JEP 427: Pattern Matching for switch (switch pattern matching)](https://openjdk.java.net/jeps/427)
- [JEP 428: Structured Concurrency](https://openjdk.org/jeps/428) (Incubation)

Here I will only give a detailed introduction to the four new features 424, 425, 426, and 428 that I think are more important.

Related reading: [OpenJDK Java 19 Documentation](https://openjdk.org/projects/jdk/19/)

## JEP 424: External Functions and Memory API (Preview)

This API allows Java programs to interoperate with code and data outside the Java runtime. By efficiently calling external functions (i.e., code outside the JVM) and safely accessing external memory (i.e., memory not managed by the JVM), the API enables Java programs to call native libraries and manipulate native data without the dangers and brittleness of JNI.

The external functions and memory API had its first incubation in Java 17, proposed by [JEP 412](https://openjdk.java.net/jeps/412). The second incubation was proposed by [JEP 419](https://openjdk.org/jeps/419) and integrated into Java 18, and the preview was proposed by [JEP 424](https://openjdk.org/jeps/424) and integrated into Java 19.

Before external functions and memory APIs:

- Java provides some methods to perform low-level, unsafe operations (such as direct access to system memory resources, autonomous management of memory resources, etc.) through [`sun.misc.Unsafe`](https://hg.openjdk.java.net/jdk/jdk/file/tip/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java). The `Unsafe` class allows the Java language to have something similar to C While language pointers have the same ability to operate memory space, they also increase the unsafety of the Java language. Improper use of the `Unsafe` class will increase the probability of program errors.
- Java 1.1 already supports native method calls through the Java Native Interface (JNI), but it is not easy to use. JNI is too complicated to implement and the steps are cumbersome (for specific steps, please refer to this article: [Guide to JNI (Java Native Interface)](https://www.baeldung.com/jni)). It is not controlled by the JVM's language security mechanism and affects the cross-platform features of the Java language. Also, the performance of JNI is not good, because JNI method calls cannot benefit from many common JIT optimizations (such as inlining). Although frameworks such as [JNA](https://github.com/java-native-access/jna), [JNR](https://github.com/jnr/jnr-ffi) and [JavaCPP](https://github.com/bytedeco/javacpp) have improved JNI, the effect is still not ideal.

The introduction of the external function and memory API is to solve some of the pain points in Java's access to external functions and external memory.

The Foreign Function & Memory API (FFM API) defines classes and interfaces:

- Allocate external memory: `MemorySegment`, `MemoryAddress` and `SegmentAllocator`;
- Manipulate and access structured external memory: `MemoryLayout`, `VarHandle`;
- Control the allocation and release of external memory: `MemorySession`;
- Call external functions: `Linker`, `FunctionDescriptor` and `SymbolLookup`.

The following is an example of using the FFM API. This code obtains the `radixsort` method handle of the C library function and then uses it to sort four strings in a Java array.

```java
// 1. Find external functions on the C library path
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixSort = linker.downcallHandle(
                             stdlib.lookup("radixsort"), ...);
// 2. Allocate memory on the heap to store four strings
String[] javaStrings = { "mouse", "cat", "dog", "car" };
// 3. Allocate off-heap memory to store four pointers
SegmentAllocator allocator = implicitAllocator();
MemorySegment offHeap = allocator.allocateArray(ValueLayout.ADDRESS, javaStrings.length);
// 4. Copy the string from the heap to outside the heap
for (int i = 0; i < javaStrings.length; i++) {
    // Allocate a string off the heap and store a pointer to it
    MemorySegment cString = allocator.allocateUtf8String(javaStrings[i]);
    offHeap.setAtIndex(ValueLayout.ADDRESS, i, cString);
}
// 5. Sort off-heap data by calling external functions
radixSort.invoke(offHeap, javaStrings.length, MemoryAddress.NULL, '\0');
// 6. Copy the (reordered) string from off-heap to heap
for (int i = 0; i < javaStrings.length; i++) {
    MemoryAddress cStringPtr = offHeap.getAtIndex(ValueLayout.ADDRESS, i);
    javaStrings[i] = cStringPtr.getUtf8String(0);
}
assert Arrays.equals(javaStrings, new String[] {"car", "cat", "dog", "mouse"}); // true
```

## JEP 425: Virtual Threads (Preview)

Virtual Thread-) is a lightweight thread (Lightweight Process, LWP) implemented by JDK instead of OS. Many virtual threads share the same operating system thread, and the number of virtual threads can be much greater than the number of operating system threads.

Virtual threads have proven to be very useful in other multi-threaded languages, such as Goroutines in Go and processes in Erlang.

Virtual threads avoid the extra cost of context switching, take into account the advantages of multi-threading, simplify the complexity of high-concurrency programs, and can effectively reduce the workload of writing, maintaining, and observing high-throughput concurrent applications.

Zhihu has a discussion about Java 19 virtual threads. If you are interested, you can check it out: <https://www.zhihu.com/question/536743167>.

For a detailed explanation and principle of Java virtual threads, you can read the following two articles:

- [Virtual thread principle and performance analysis | Dewu Technology](https://mp.weixin.qq.com/s/vdLXhZdWyxc6K-D3Aj03LA)- [Java19 officially GA! See how virtual threads can greatly improve system throughput](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Thread - VirtualThread source code perspective](https://www.cnblogs.com/throwable/p/16758997.html)

## JEP 426: Vector API (Fourth Incubation)

The Vector API was originally proposed by [JEP 338](https://openjdk.java.net/jeps/338) and integrated into Java 16 as an [Incubation API](http://openjdk.java.net/jeps/11). The second round of incubation was proposed by [JEP 414](https://openjdk.java.net/jeps/414) and integrated into Java 17, the third round of incubation was proposed by [JEP 417](https://openjdk.java.net/jeps/417) and integrated into Java 18, and the fourth round was proposed by [JEP 426](https://openjdk.java.net/jeps/426) Proposed and integrated into Java 19.

In [Java 18 New Features Overview](./java18.md), I introduced the vector API in detail, so I won’t give any additional introduction here.

## JEP 428: Structured Concurrency (Incubation)

JDK 19 introduces structured concurrency, a multi-threaded programming method. The purpose is to simplify multi-threaded programming through the structured concurrency API. It is not intended to replace `java.util.concurrent`. It is currently in the incubator stage.

Structured concurrency treats multiple tasks running in different threads as a single unit of work, simplifying error handling, improving reliability, and enhancing observability. That is, structured concurrency preserves the readability, maintainability, and observability of single-threaded code.

The basic API for structured concurrency is [`StructuredTaskScope`](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html). `StructuredTaskScope` supports splitting a task into multiple concurrent subtasks, executed in their own threads, and the subtasks must be completed before the main task can continue.

The basic usage of `StructuredTaskScope` is as follows:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // Use the fork method to spawn a thread to perform subtasks
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // Wait for the thread to complete
        scope.join();
        // Handling of results may include handling or re-throwing exceptions
        ... process results/exceptions ...
    } // close
```

Structured concurrency is well suited for virtual threads, which are lightweight threads implemented by the JDK. Many virtual threads share the same operating system thread, allowing a very large number of virtual threads.

<!-- @include: @article-footer.snippet.md -->