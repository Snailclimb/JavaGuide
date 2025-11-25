---
title: Overview of new features in Java 10
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 10, JDK10, var local variable type inference, garbage collection improvements, performance
  - - meta
    - name: description
      content: Overview of the major updates in JDK 10, focusing on var type inference and other platform improvements.
---

**Java 10** was released on March 20, 2018. The most well-known feature should be the introduction of the `var` keyword (local variable type inference). There are also a number of new features such as garbage collector improvements, GC improvements, performance improvements, and thread management.

**Overview (selected parts)**:

- [JEP 286: Local variable type inference](https://openjdk.java.net/jeps/286)
- [JEP 304: Garbage Collector Interface](https://openjdk.java.net/jeps/304)
- [JEP 307: G1 Parallel Full GC](https://openjdk.java.net/jeps/307)
- [JEP 310: Application Class Data Sharing (Extending CDS Functionality)](https://openjdk.java.net/jeps/310)
- [JEP 317: Experimental Java-based JIT Compiler](https://openjdk.java.net/jeps/317)

## Local variable type inference (var)

Because too many Java developers hope to introduce local variable inference in Java, it came in Java 10, which is considered a long-awaited one!

Java 10 provides the `var` keyword to declare local variables.

```java
var id = 0;
var codefx = new URL("https://mp.weixin.qq.com/");
var list = new ArrayList<>();
var list = List.of(1, 2, 3);
var map = new HashMap<String, String>();
var p = Paths.of("src/test/java/Java9FeaturesTest.java");
var numbers = List.of("a", "b", "c");
for (var n : list)
    System.out.print(n+ " ");
```

The var keyword can only be used in local variables with constructors and in for loops.

```java
var count=null; //❌Compilation fails and cannot be declared as null
var r = () -> Math.random();//❌ Compilation fails and cannot be declared as a Lambda expression
var array = {1,2,3};//❌Compilation fails, array cannot be declared
```

var doesn't change the fact that Java is a statically typed language, the compiler is responsible for inferring types.

Additionally, Scala and Kotlin already have the `val` keyword (the `final var` combination keyword).

Related reading: ["Java 10 New Features Local Variable Type Inference"] (https://zhuanlan.zhihu.com/p/34911982).

## Garbage collector interface

In the early days of the JDK structure, the components that made up the garbage collector (GC) implementation were scattered throughout the code base. Java 10 separates the source code of different garbage collectors by introducing a pure set of garbage collector interfaces.

## G1 Parallel Full GC

Starting from Java 9, G1 has become the default garbage collector. G1 is designed as a low-latency garbage collector to avoid Full GC. However, the Full GC of G1 in Java 9 still uses a single thread to complete the mark clearing algorithm, which may cause the garbage collection period to trigger Full GC when the memory cannot be reclaimed.

In order to minimize the impact of application pauses caused by Full GC, starting from Java10, G1's FullGC has been changed to a parallel mark-and-sweep algorithm, which will use the same number of parallel worker threads as young generation collection and mixed collection, thereby reducing the occurrence of Full GC and leading to better performance improvement and greater throughput.

## Collection enhancement

`List`, `Set`, `Map` provide the static method `copyOf()` which returns an immutable copy of the input parameter set.

```java
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
```

The collection created using `copyOf()` is an immutable collection and cannot be added, deleted, replaced, sorted, etc., otherwise a `java.lang.UnsupportedOperationException` exception will be reported. IDEA will also provide corresponding prompts.

![](https://oss.javaguide.cn/java-guide-blog/image-20210816154125579.png)

Moreover, a new static method has been added to `java.util.stream.Collectors`, which is used to collect elements in the stream into an immutable collection.

```java
var list = new ArrayList<>();
list.stream().collect(Collectors.toUnmodifiableList());
list.stream().collect(Collectors.toUnmodifiableSet());
```

## Optional enhancement

`Optional` adds a new parameterless `orElseThrow()` method, which is a simplified version of `orElseThrow(Supplier<? extends X> exceptionSupplier)` with parameters and throws a NoSuchElementException exception by default when there is no value.

```java
Optional<String> optional = Optional.empty();
String result = optional.orElseThrow();
```

## Application class data sharing (extended CDS functionality)

The Class Data Sharing (CDS) mechanism has been introduced in Java 5, which allows a group of classes to be preprocessed into a shared archive file so that memory mapping can be performed at runtime to reduce the startup time of the Java program. When multiple Java virtual machines (JVM) share the same archive file, it can also reduce the amount of dynamic memory occupied and reduce the resource occupation when multiple virtual machines run on the same physical or virtual machine. CDS was still a commercial feature of the Oracle JDK at the time.

Java 10 extends the existing CDS functionality to allow application classes to be placed in a shared archive. The CDS feature is based on the original bootstrap class and extends the application class CDS (Application Class-Data Sharing, AppCDS) support, which greatly expands the scope of application of CDS. The principle is: record the process of loading a class at startup, write it to a text file, and directly read this startup text and load it when it starts again. Imagine that if there are no major changes in the application environment, the startup speed will be improved.

## Experimental Java-based JIT compiler

Graal is a JIT compiler written in the Java language and is the basis for the experimental Ahead-of-Time (AOT) compiler introduced in JDK 9.

Oracle's HotSpot VM comes with two JIT compilers implemented in C++: C1 and C2. In Java 10 (Linux/x64, macOS/x64), HotSpot still uses C2 by default, but it can be replaced by Graal by adding the `-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler` parameter to the java command.

Related reading: [An in-depth explanation of Java 10’s experimental JIT compiler Graal - Zheng Yudi](https://www.infoq.cn/article/java-10-jit-compiler-graal)

## Others

- **Thread-local control**: Thread control in Java 10 introduces the concept of JVM safe points, which will allow thread callbacks to be implemented without running the global JVM safe point, executed by the thread itself or the JVM thread, while keeping the thread in a blocked state. This method makes it possible to stop a single thread instead of only enabling or stopping all threads.
- **Heap allocation on alternative storage devices**: Java 10 will enable the JVM to allocate heap memory on optional memory devices using heaps for different types of storage mechanisms
-…

## Reference

- Java 10 Features and Enhancements: <https://howtodoinjava.com/java10/java10-features/>

- Guide to Java10 : <https://www.baeldung.com/java-10-overview>- 4 Class Data Sharing : <https://docs.oracle.com/javase/10/vm/class-data-sharing.htm#JSJVM-GUID-7EAA3411-8CF0-4D19-BD05-DF5E1780AA91>

<!-- @include: @article-footer.snippet.md -->