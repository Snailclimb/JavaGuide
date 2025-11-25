---
title: Overview of new features in Java 11
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 11, JDK11, LTS, HTTP client, string API, removal features
  - - meta
    - name: description
      content: Summarizes the updates in JDK 11, focusing on practical features such as the new HTTP client and string enhancements.
---

**Java 11** was officially released on September 25, 2018. This is a very important version! Compared with Java 9 released in September 2017 and Java 10 released in March 2018, the biggest difference is that in terms of long-term support (Long-Term-Support), Oracle said it will provide strong support for Java 11, and this support will last until September 2026. This is the first long-term release supported beyond Java 8. **

The picture below is the official timeline of Oracle JDK support given by Oracle.

![](https://oss.javaguide.cn/github/javaguide/java/new-features/4c1611fad59449edbbd6e233690e9fa7.png)

**Overview (selected parts)**:

- [JEP 321: HTTP Client Standardization](https://openjdk.java.net/jeps/321)
- [JEP 333: ZGC (Scalable Low Latency Garbage Collector)](https://openjdk.java.net/jeps/333)
- [JEP 323: Local variable syntax for Lambda parameters](https://openjdk.java.net/jeps/323)
- [JEP 330: Launching a single-file source code program](https://openjdk.java.net/jeps/330)

## HTTP Client Standardization

Java 11 standardizes the Http Client API introduced in Java 9 and updated in Java 10. While incubating in the first two versions, Http Client was almost completely rewritten and now fully supports asynchronous non-blocking.

Moreover, in Java 11, the package name of Http Client was changed from `jdk.incubator.http` to `java.net.http`. The API provides non-blocking request and response semantics through `CompleteableFuture`. It is also very simple to use, as follows:

```java
var request = HttpRequest.newBuilder()
    .uri(URI.create("https://javastack.cn"))
    .GET()
    .build();
var client = HttpClient.newHttpClient();

// sync
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());

// asynchronous
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
```

## String enhancement

Java 11 adds a series of string processing methods:

```java
//Determine whether the string is empty
" ".isBlank();//true
//Remove spaces from the beginning and end of the string
" Java ".strip();// "Java"
//Remove spaces from the beginning of the string
" Java ".stripLeading(); // "Java "
//Remove trailing spaces from string
" Java ".stripTrailing(); // " Java"
//How many times to repeat the string
"Java".repeat(3); // "JavaJavaJava"
//Return a collection of strings separated by line terminators.
"A\nB\nC".lines().count(); // 3
"A\nB\nC".lines().collect(Collectors.toList());
```

## Optional enhancement

A new `isEmpty()` method is added to determine whether the specified `Optional` object is empty.

```java
var op = Optional.empty();
System.out.println(op.isEmpty());//Determine whether the specified Optional object is empty
```

## ZGC (Scalable Low Latency Garbage Collector)

**ZGC stands for Z Garbage Collector**, which is a scalable, low-latency garbage collector.

ZGC is mainly designed to meet the following goals:

- GC pause time does not exceed 10ms
- Can handle both small heaps of several hundred MB and large heaps of several TB
- Application throughput does not drop more than 15% (compared to G1 recycling algorithm)
- It is convenient to introduce new GC features on this basis and lay the foundation for optimization using colored needles and Load barriers
- Currently only supports Linux/x64-bit platform

ZGC is currently **in the experimental stage** and only supports Linux/x64 platforms.

Similar to ParNew and G1 in CMS, ZGC also uses a mark-copy algorithm, but ZGC has made significant improvements to this algorithm.

There will be fewer Stop The World occurrences in ZGC!

For details, please see: ["Exploration and Practice of the New Generation of Garbage Collector ZGC"](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)

## Local variable syntax for Lambda parameters

Starting with Java 10, the key feature of local variable type inference was introduced. Type inference allows using keyword var as the type of a local variable instead of the actual type, the compiler infers the type based on the value assigned to the variable.

There are several restrictions on the var keyword in Java 10

- Can only be used on local variables
- Must be initialized when declared
- cannot be used as method parameter
- cannot be used in lambda expressions

Java 11 begins to allow developers to use var for parameter declaration in Lambda expressions.

```java
//The following two are equivalent
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

## Start a single file source code program

This means we can run Java source code from a single file. This feature allows direct execution of Java source code using the Java interpreter. The source code is compiled in memory and then executed by the interpreter, eliminating the need to generate `.class` files on disk. The only constraint is that all related classes must be defined in the same Java file.

Especially useful for those who are new to Java and want to try simple programs, and can be used with jshell. The ability to use Java to write scripts has been enhanced to a certain extent.

## Other new features

- **New garbage collector Epsilon**: a completely passive GC implementation that allocates limited memory resources to minimize memory usage and memory throughput latency
- **Low-overhead Heap Profiling**: Java 11 provides a low-overhead Java heap allocation sampling method that can obtain heap-allocated Java object information and access heap information through JVMTI
- **TLS1.3 protocol**: Java 11 includes an implementation of the Transport Layer Security (TLS) 1.3 specification (RFC 8446), replacing TLS included in previous versions, including TLS 1.2, while also improving other TLS features such as OCSP stapling extensions (RFC 6066, RFC 6961), and session hashing and extended master key extensions (RFC 7627), and many improvements have been made in terms of security and performance.
- **Flight Recorder (Java Flight Recorder)**: Flight Recorder was previously an analysis tool in the commercial JDK, but in Java 11, its code is included in the public code base so that everyone can use this feature.
-…

## Reference

- JDK 11 Release Notes: <https://www.oracle.com/java/technologies/javase/11-relnote-issues.html>
- Java 11 – Features and Comparison: <https://www.geeksforgeeks.org/java-11-features-and-comparison/>

<!-- @include: @article-footer.snippet.md -->