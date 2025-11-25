---
title: Overview of new features in Java 9
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 9, JDK9, modularization, JPMS, jlink, collection factory method, new API
  - - meta
    - name: description
      content: Analyze Java 9's modular system and jlink and other updates, and understand the impact on the use of runtime images and libraries.
---

**Java 9** released on September 21, 2017. As a new version released three and a half years after Java 8, Java 9 has brought many major changes. The most important change is the introduction of the Java platform module system. Others include collections, `Stream` streams...

You can download the JDK version you need at [Archived OpenJDK General-Availability Releases](http://jdk.java.net/archive/)! The official new feature documentation address: <https://openjdk.java.net/projects/jdk/>.

**Overview (selected parts)**:

- [JEP 222: Java command line tools](https://openjdk.java.net/jeps/222)
- [JEP 261: Modular Systems](https://openjdk.java.net/jeps/261)
- [JEP 248: G1 becomes the default garbage collector](https://openjdk.java.net/jeps/248)
- [JEP 193: Variable handles](https://openjdk.java.net/jeps/193)
- [JEP 254: String storage structure optimization](https://openjdk.java.net/jeps/254)

##JShell

JShell is a new utility tool added in Java 9. Provides a Python-like real-time command line interactive tool for Java.

In JShell, you can directly enter expressions and view their execution results.

![](https://oss.javaguide.cn/java-guide-blog/image-20210816083417616.png)

**What benefits does JShell bring us? **

1. Lowers the threshold for outputting the first line of Java version "Hello World!", which can improve the enthusiasm of novices to learn.
2. It is more efficient than IDE when dealing with simple small logic and verifying simple small problems (it is not intended to replace IDE. For verification of complex logic, IDE is more suitable, and the two are complementary).
3.…

**What is the difference between JShell code and ordinary compilable code? **

1. Once the statement input is completed, JShell can immediately return the execution results without the need for an editor, compiler, or interpreter.
2. JShell supports repeated declaration of variables, and subsequent declarations will overwrite previously declared ones.
3. JShell supports independent expressions such as ordinary addition operation `1 + 1`.
4.…

## Modular system

The module system is part of the [Jigsaw Project](https://openjdk.java.net/projects/jigsaw/), which introduces modular development practices into the Java platform, making our code more reusable!

**What is a module system? **The official definition is:

> A uniquely named, reusable group of related packages, as well as resources (such as images and XML files) and a module descriptor.

Simply put, you can think of a module as a set of uniquely named, reusable packages, resources, and module description files (`module-info.java`).

Any jar file can be upgraded to a module by adding a module description file (`module-info.java`).

![](https://oss.javaguide.cn/java-guide-blog/module-structure.png)

After the introduction of the module system, the JDK was reorganized into 94 modules. Java applications can use the new **[jlink](http://openjdk.java.net/jeps/282) tool** (Jlink is a new command line tool released with Java 9. It allows developers to create their own lightweight, customized JRE for module-based Java applications) to create a custom runtime image that only contains the JDK modules it depends on. This can greatly reduce the size of the Java runtime environment.

We can use the `exports` keyword to precisely control which classes can be used by the outside world and which classes can only be used internally.

```java
module my.module {
    //exports exposes all public members of the specified package
    exports com.my.package.name;
}

module my.module {
     //exports…to restricts access to the member range
    export com.my.package.name to com.specific.package;
}
```

If you want to learn more about the modularity of Java 9, you can refer to the following articles:

- ["Project Jigsaw: Module System Quick-Start Guide"](https://openjdk.java.net/projects/jigsaw/quick-start)
- [《Java 9 Modules: part 1》](https://stacktraceguru.com/java9/module-introduction)
- [Java 9 Revealed (2. Modular System)](http://www.cnblogs.com/IcanFixIt/p/6947763.html)

## G1 becomes the default garbage collector

In Java 8, the default garbage collector is Parallel Scavenge (new generation) + Parallel Old (old generation). By Java 9, the CMS garbage collector was deprecated and G1 (Garbage-First Garbage Collector) became the default garbage collector.

G1 was introduced in Java 7 and became the default garbage collector after two versions of excellent performance.

## Quickly create immutable collections

Added factory methods such as `List.of()`, `Set.of()`, `Map.of()` and `Map.ofEntries()` to create immutable collections (a bit like Guava):

```java
List.of("Java", "C++");
Set.of("Java", "C++");
Map.of("Java", 1, "C++", 2);
```

The collection created using `of()` is an immutable collection and cannot be added, deleted, replaced, sorted, etc., otherwise a `java.lang.UnsupportedOperationException` exception will be reported.

## String storage structure optimization

In Java 8 and previous versions, `String` has always been stored in `char[]`. After Java 9, the implementation of `String` switched to using `byte[]` array to store strings, saving space.

```java
public final class String implements java.io.Serializable,Comparable<String>, CharSequence {
    // @Stable annotation indicates that the variable can be modified at most once and is called "stable".
    @Stable
    private final byte[] value;
}
```

##Interface private method

Java 9 allows private methods in interfaces. In this case, the use of the interface is more flexible, a bit like a simplified version of an abstract class.

```java
public interface MyInterface {
    private void methodPrivate(){
    }
}
```

## try-with-resources enhancement

Before Java 9, we could only declare variables in a `try-with-resources` block:

```java
try (Scanner scanner = new Scanner(new File("testRead.txt"));
    PrintWriter writer = new PrintWriter(new File("testWrite.txt"))) {
    // omitted
}
```

After Java 9, effectively-final variables can be used in `try-with-resources` statements.

```java
final Scanner scanner = new Scanner(new File("testRead.txt"));
PrintWriter writer = new PrintWriter(new File("testWrite.txt"))
try (scanner;writer) {
    // omitted
}
```**What is an effectively-final variable? ** Simply put, it is a variable that is not modified by `final` but the value never changes after initialization.

As the code above demonstrates, even though the `writer` variable is not explicitly declared `final`, it does not change after it is assigned a value for the first time, therefore, it is effectively-final.

## Stream & Optional enhancement

New methods `ofNullable()`, `dropWhile()`, `takeWhile()` and overloaded methods of `iterate()` method have been added to `Stream`.

The `ofNullable()` method in Java 9 allows us to create a single-element `Stream`, which can contain a non-null element, or create an empty `Stream`. In Java 8, it is not possible to create an empty `Stream`.

```java
Stream<String> stringStream = Stream.ofNullable("Java");
System.out.println(stringStream.count());// 1
Stream<String> nullStream = Stream.ofNullable(null);
System.out.println(nullStream.count());//0
```

The `takeWhile()` method can sequentially obtain elements that meet the conditions from the `Stream` until the conditions are not met.

```java
List<Integer> integerList = List.of(11, 33, 66, 8, 9, 13);
integerList.stream().takeWhile(x -> x < 50).forEach(System.out::println);// 11 33
```

The effect of the `dropWhile()` method is opposite to that of `takeWhile()`.

```java
List<Integer> integerList2 = List.of(11, 33, 66, 8, 9, 13);
integerList2.stream().dropWhile(x -> x < 50).forEach(System.out::println);// 66 8 9 13
```

The new overloaded method of `iterate()` method provides a `Predicate` parameter (judgment condition) to decide when to end the iteration

```java
public static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) {
}
// Newly added overloaded method
public static<T> Stream<T> iterate(T seed, Predicate<? super T> hasNext, UnaryOperator<T> next) {

}
```

The usage comparison of the two is as follows. The new `iterate()` overloaded method is more flexible.

```java
// Use the original iterate() method to output numbers 1~10
Stream.iterate(1, i -> i + 1).limit(10).forEach(System.out::println);
// Use the new iterate() overloaded method to output numbers 1~10
Stream.iterate(1, i -> i <= 10, i -> i + 1).forEach(System.out::println);
```

New methods `ifPresentOrElse()`, `or()` and `stream()` have been added to the `Optional` class

The `ifPresentOrElse()` method accepts two parameters `Consumer` and `Runnable`. If `Optional` is not empty, the `Consumer` parameter is called, and if it is empty, the `Runnable` parameter is called.

```java
public void ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction)

Optional<Object> objectOptional = Optional.empty();
objectOptional.ifPresentOrElse(System.out::println, () -> System.out.println("Empty!!!"));// Empty!!!
```

The `or()` method accepts a `Supplier` parameter and returns the `Optional` value specified by the `Supplier` parameter if `Optional` is empty.

```java
public Optional<T> or(Supplier<? extends Optional<? extends T>> supplier)

Optional<Object> objectOptional = Optional.empty();
objectOptional.or(() -> Optional.of("java")).ifPresent(System.out::println);//java
```

## Process API

Java 9 adds the `java.lang.ProcessHandle` interface to manage native processes, which is especially suitable for managing long-running processes.

```java
// Get the process of the currently running JVM
ProcessHandle currentProcess = ProcessHandle.current();
// Output process id
System.out.println(currentProcess.pid());
// Output process information
System.out.println(currentProcess.info());
```

`ProcessHandle` interface overview:

![](https://oss.javaguide.cn/java-guide-blog/image-20210816104614414.png)

## Reactive Streams (Reactive Streams)

The core interface of the reactive flow specification has been added to the `java.util.concurrent.Flow` class in Java 9.

`Flow` contains 4 core interfaces: `Flow.Publisher`, `Flow.Subscriber`, `Flow.Subscription` and `Flow.Processor`. Java 9 also provides `SubmissionPublisher` as an implementation of `Flow.Publisher`.

For a more detailed interpretation of Java 9 reactive streams, I recommend you read this article [Java 9 Revealed (17. Reactive Streams) - Lin Bento](https://www.cnblogs.com/IcanFixIt/p/7245377.html).

## Variable handle

A variable handle is a reference to a variable or a group of variables, including static fields, non-static fields, array elements and components in off-heap data structures.

The meaning of the variable handle is similar to the existing method handle `MethodHandle`, which is represented by the Java class `java.lang.invoke.VarHandle`. You can use the static factory method in the class `java.lang.invoke.MethodHandles.Lookup` to create a `VarHandle` object.

The emergence of `VarHandle` replaces some operations of `java.util.concurrent.atomic` and `sun.misc.Unsafe`. It also provides a series of standard memory barrier operations for more fine-grained control of memory sorting. It is better than the existing API in terms of security, availability and performance.

## Others

- **Platform logging API improvements**: Java 9 allows configuring the same logging implementation for both the JDK and the application. Added `System.LoggerFinder` to manage logger implementations used by the JDK. The JVM has only one system-wide instance of `LoggerFinder` at runtime. We can make the JDK and applications use other logging frameworks such as SLF4J by adding our own `System.LoggerFinder` implementation.
- **`CompletableFuture` class enhancement**: Added several new methods (`completeAsync`, `orTimeout`, etc.).
- **Nashorn engine enhancements**: Nashorn is a JavaScript engine introduced from Java 8. Java 9 has made some enhancements to Nashorn and implemented some new features of ES6 (which have been deprecated in Java 11).
- **New features for I/O streams**: New methods have been added to read and copy the data contained in an `InputStream`.
- **Improved application security**: Java 9 adds 4 new SHA-3 hashing algorithms, SHA3-224, SHA3-256, SHA3-384 and SHA3-512.
- **Improved method handle (Method Handle)**: Method handles were introduced from Java7. Java9 added more static methods in the class `java.lang.invoke.MethodHandles` to create different types of method handles.
- ……

## refer to- Java version history: <https://en.wikipedia.org/wiki/Java_version_history>
- Release Notes for JDK 9 and JDK 9 Update Releases : <https://www.oracle.com/java/technologies/javase/9-all-relnotes.html>
- "In-depth Analysis of New Java Features" - Geek Time - JShell: How to quickly verify simple small problems?
- New Features in Java 9: <https://www.baeldung.com/new-java-9>
- Java – Try with Resources: <https://www.baeldung.com/java-try-with-resources>

<!-- @include: @article-footer.snippet.md -->