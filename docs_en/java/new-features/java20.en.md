---
title: Overview of new features in Java 20
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 20, JDK20, record mode preview, virtual thread improvements, language enhancements, JEP
  - - meta
    - name: description
      content: Summarizes the language and concurrency changes in JDK 20, continuing the enhancements related to virtual threads and pattern matching.
---

JDK 20 was released on March 21, 2023, and is not a long-term support version.

According to the development plan, the next LTS version is JDK 21, which will be released in September 2023.

![](https://oss.javaguide.cn/github/javaguide/java/new-features/640.png)

JDK 20 has only 7 new features:

- [JEP 429: Scoped Values](https://openjdk.org/jeps/429) (first hatch)
- [JEP 432: Record Patterns (record mode)](https://openjdk.org/jeps/432) (Second preview)
- [JEP 433: switch pattern matching](https://openjdk.org/jeps/433) (4th preview)
- [JEP 434: Foreign Function & Memory API](https://openjdk.org/jeps/434) (Second preview)
- [JEP 436: Virtual Threads](https://openjdk.org/jeps/436) (Second Preview)
- [JEP 437:Structured Concurrency (Structured Concurrency)](https://openjdk.org/jeps/437)(Second incubation)
- [JEP 432: Vector API (](https://openjdk.org/jeps/438) fifth incubation)

## JEP 429: Scoped Values (First Incubation)

Scoped Values can share immutable data within and between threads, which is better than thread-local variables, especially when using a large number of virtual threads.

```java
final static ScopedValue<...> V = new ScopedValue<>();

//In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped values allow data to be shared safely and efficiently between components in large programs without resorting to method parameters.

For a detailed introduction to scoped values, it is recommended to read this article [Scoped Values ​​FAQ](https://www.happycoders.eu/java/scoped-values/).

## JEP 432: Recording Mode (Second Preview)

Record Patterns can deconstruct the value of record, which makes it easier to extract data from the Record Class. And nested record patterns can be combined with type patterns to enable powerful, declarative, and composable forms of data navigation and processing.

Record mode cannot be used alone, but must be used with instanceof or switch pattern matching.

Let’s take instanceof as an example to demonstrate briefly.

Simply define a record class:

```java
record Shape(String type, long unit){}
```

Before logging mode:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape shape) {

  System.out.println("Area of " + shape.type() + " is : " + Math.PI * Math.pow(shape.unit(), 2));
}
```

After having recording mode:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape(String type, long unit)) {
  System.out.println("Area of " + type + " is : " + Math.PI * Math.pow(unit, 2));
}
```

Let’s take a look at the use of record mode and switch.

Define some classes:

```java
interfaceShape{}
record Circle(double radius) implements Shape { }
record Square(double side) implements Shape { }
record Rectangle(double length, double width) implements Shape { }
```

Before logging mode:

```java
Shape shape = new Circle(10);
switch (shape) {
    case Circle c:
        System.out.println("The shape is Circle with area: " + Math.PI * c.radius() * c.radius());
        break;

    case squares:
        System.out.println("The shape is Square with area: " + s.side() * s.side());
        break;

    case Rectangle r:
        System.out.println("The shape is Rectangle with area: + " + r.length() * r.width());
        break;

    default:
        System.out.println("Unknown Shape");
        break;
}
```

After having recording mode:

```java
Shape shape = new Circle(10);
switch(shape) {

  case Circle(double radius):
    System.out.println("The shape is Circle with area: " + Math.PI * radius * radius);
    break;

  case Square(double side):
    System.out.println("The shape is Square with area: " + side * side);
    break;

  case Rectangle(double length, double width):
    System.out.println("The shape is Rectangle with area: + " + length * width);
    break;

  default:
    System.out.println("Unknown Shape");
    break;
}
```

Recording mode can avoid unnecessary conversions, making code construction concise and easy to read. Moreover, after using record mode, you no longer have to worry about `null` or `NullPointerException`, and the code is safer and more reliable.

Recording mode was first previewed in Java 19, proposed by [JEP 405](https://openjdk.org/jeps/405). JDK 20 is the second preview, proposed by [JEP 432](https://openjdk.org/jeps/432). Improvements this time include:

- Add support for generic record mode type parameter inference,
- Add support for record mode to appear in the title of a boost statement with `for`
- Removed support for named record mode.

**Note**: Do not confuse logging mode with the logging classes officially introduced in [JDK16](./java16.md).

## JEP 433: switch pattern matching (4th preview)

Just like `instanceof`, `switch` also adds automatic conversion function for type matching.

`instanceof` code example:

```java
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

//New code
if (o instanceof String s) {
    ... use s ...
}
```

`switch` code example:

```java
// Old code
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}

//New code
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l -> String.format("long %d", l);
        case Double d -> String.format("double %f", d);
        case String s -> String.format("String %s", s);
        default -> o.toString();
    };
}```

`switch` pattern matching was previewed in Java17, Java18, and Java19 respectively, and Java20 is the fourth preview. Every preview will basically have some small improvements, which I won’t mention in detail here.

## JEP 434: External Functions and Memory API (Second Preview)

This API allows Java programs to interoperate with code and data outside the Java runtime. By efficiently calling external functions (i.e., code outside the JVM) and safely accessing external memory (i.e., memory not managed by the JVM), the API enables Java programs to call native libraries and manipulate native data without the dangers and brittleness of JNI.

The external functions and memory API had its first incubation in Java 17, proposed by [JEP 412](https://openjdk.java.net/jeps/412). There was a second incubation in Java 18, proposed by [JEP 419](https://openjdk.org/jeps/419). First previewed in Java 19, proposed by [JEP 424](https://openjdk.org/jeps/424).

JDK 20 is the second preview, proposed by [JEP 434](https://openjdk.org/jeps/434). This time improvements include:

- Unification of `MemorySegment` and `MemoryAddress` abstractions
- Enhanced `MemoryLayout` hierarchy
- `MemorySession` split into `Arena` and `SegmentScope` to facilitate segment sharing across maintenance boundaries.

In [Java 19 New Features Overview](./java19.md), I have introduced external functions and memory API in detail, so I will not give additional introduction here.

## JEP 436: Virtual Threads (Second Preview)

Virtual Thread is a lightweight thread (Lightweight Process, LWP) implemented by JDK instead of OS and is scheduled by JVM. Many virtual threads share the same operating system thread, and the number of virtual threads can be much greater than the number of operating system threads.

Before the introduction of virtual threads, the `java.lang.Thread` package already supported so-called platform threads, which are the threads we have been using before there were no virtual threads. The JVM scheduler manages virtual threads through platform threads (carrier threads). A platform thread can execute different virtual threads at different times (multiple virtual threads are mounted on one platform thread). When a virtual thread is blocked or waiting, the platform thread can switch to execute another virtual thread.

The relationship diagram between virtual threads, platform threads and system kernel threads is as follows (Source: [How to Use Java 19 Virtual Threads](https://medium.com/javarevisited/how-to-use-java-19-virtual-threads-c16a32bad5f7)):

![The relationship between virtual threads, platform threads and system kernel threads](https://oss.javaguide.cn/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

One more point about the correspondence between platform threads and system kernel threads: In mainstream operating systems such as Windows and Linux, Java threads use a one-to-one thread model, that is, one platform thread corresponds to one system kernel thread. Solaris systems are a special case, HotSpot VM supports many-to-many and one-to-one on Solaris. For details, please refer to R's answer: [Is the threading model in the JVM user-level? ](https://www.zhihu.com/question/23096638/answer/29617153).

Compared with platform threads, virtual threads are cheap and lightweight and are destroyed immediately after use, so they do not need to be reused or pooled. Each task can have its own dedicated virtual thread to run. Virtual threads are paused and resumed to achieve switching between threads, avoiding the additional cost of context switching, taking into account the advantages of multi-threading, simplifying the complexity of high-concurrency programs, and effectively reducing the workload of writing, maintaining, and observing high-throughput concurrent applications.

Virtual threads have proven to be very useful in other multi-threaded languages, such as Goroutines in Go and processes in Erlang.

Zhihu has a discussion about Java 19 virtual threads. If you are interested, you can check it out: <https://www.zhihu.com/question/536743167>.

For detailed interpretation and principles of Java virtual threads, you can read the following articles:

- [A simple introduction to virtual threads](https://javaguide.cn/java/concurrent/virtual-thread.html)
- [Java19 officially GA! See how virtual threads can greatly improve system throughput](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Thread - VirtualThread source code perspective](https://www.cnblogs.com/throwable/p/16758997.html)

Virtual threads were first previewed in Java 19, proposed by [JEP 425](https://openjdk.org/jeps/425). JDK 20 is the second preview, and some minor changes have been made, which will not be mentioned in detail here.

Finally, let's look at four ways to create virtual threads:

```java
// 1. Created through Thread.ofVirtual()
Runnable fn = () -> {
  // your code here
};

Thread thread = Thread.ofVirtual(fn)
                      .start();

// 2. Create through Thread.startVirtualThread()
Thread thread = Thread.startVirtualThread(() -> {
  // your code here
});

// 3. Created through Executors.newVirtualThreadPerTaskExecutor()
var executorService = Executors.newVirtualThreadPerTaskExecutor();

executorService.submit(() -> {
  // your code here
});

class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}

//4. Created through ThreadFactory
CustomThread customThread = new CustomThread();
// Get the thread factory class
ThreadFactory factory = Thread.ofVirtual().factory();
//Create virtual thread
Thread thread = factory.newThread(customThread);
//Start thread
thread.start();
```

It can be seen from the four methods of creating virtual threads listed above that in order to lower the threshold of virtual threads, the official government tries its best to reuse the original `Thread` thread class, so that it can smoothly transition to the use of virtual threads.

## JEP 437: Structured Concurrency (Second Incubation)

Java 19 introduces structured concurrency, a multi-threaded programming method. The purpose is to simplify multi-threaded programming through the structured concurrency API. It is not intended to replace `java.util.concurrent`. It is currently in the incubator stage.

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
```Structured concurrency is well suited for virtual threads, which are lightweight threads implemented by the JDK. Many virtual threads share the same operating system thread, allowing a very large number of virtual threads.

The only change to structured concurrency in JDK 20 is an update to support `StructuredTaskScope` for threads created within task scope to inherit scope values. This simplifies sharing of immutable data across threads, as detailed in [JEP 429](https://openjdk.org/jeps/429).

## JEP 432: Vector API (Fifth Incubation)

Vector calculations consist of a series of operations on vectors. The Vector API is used to express vector computations that can be reliably compiled at runtime into the best vector instructions on a supported CPU architecture, resulting in performance superior to equivalent scalar computations.

The goal of the Vector API is to provide users with a concise, easy-to-use, platform-independent way of expressing a wide range of vector computations.

The Vector API was originally proposed by [JEP 338](https://openjdk.java.net/jeps/338) and integrated into Java 16 as an [Incubation API](http://openjdk.java.net/jeps/11). The second round of incubation was proposed by [JEP 414](https://openjdk.java.net/jeps/414) and integrated into Java 17, the third round of incubation was proposed by [JEP 417](https://openjdk.java.net/jeps/417) and integrated into Java 18, and the fourth round was proposed by [JEP 426](https://openjdk.java.net/jeps/426) Proposed and integrated into Java 19.

This incubation of Java20 basically did not change the vector API, but made some bug fixes and performance enhancements. For details, see [JEP 438](https://openjdk.org/jeps/438).

<!-- @include: @article-footer.snippet.md -->