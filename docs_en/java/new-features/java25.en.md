---
title: Overview of new features in Java 25
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 25, JDK25, LTS, scope values, compact object headers, generational Shenandoah, module import, structured concurrency
  - - meta
    - name: description
      content: Overview of key new features and preview changes in JDK 25, focusing on concurrency, GC, and language/platform enhancements.
---

JDK 25 was released on September 16, 2025. This is a very important version and a milestone.

JDK 25 is LTS (long-term support version). So far, there are currently four long-term support versions: JDK8, JDK11, JDK17, JDK21 and JDK 25.

JDK 21 has a total of 18 new features. This article will select some of the more important new features and introduce them in detail:

- [JEP 506: Scoped Values](https://openjdk.org/projects/jdk/25/)
- [JEP 512: Compact Source Files and Instance Main Methods (compact source files and instance main methods)](https://openjdk.org/jeps/512)
- [JEP 519: Compact Object Headers (compact object header)](https://openjdk.org/jeps/519)
- [JEP 521: Generational Shenandoah (Generational Shenandoah GC)](https://openjdk.org/jeps/521)
- [JEP 507: Primitive Types in Patterns, instanceof, and switch (Pattern matching supports basic types, third preview)](https://openjdk.org/jeps/507)
- [JEP 505: Structured Concurrency (Structured Concurrency, fifth preview)](https://openjdk.org/jeps/505)
- [JEP 511: Module Import Declarations (module import declaration)](https://openjdk.org/jeps/511)
- [JEP 513: Flexible Constructor Bodies (flexible constructor body)](https://openjdk.org/jeps/513)
- [JEP 508: Vector API (Vector API, 10th incubation)](https://openjdk.org/jeps/508)

The following figure shows the number of new features and update time brought by each version update from JDK 8 to JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 506: Scope Values

Scoped Values can share immutable data within and between threads, which is better than thread local variables `ThreadLocal`, especially when using a large number of virtual threads.

```java
final static ScopedValue<...> V = new ScopedValue<>();

//In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });
```