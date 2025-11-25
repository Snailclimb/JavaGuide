---
title: Overview of new features in Java 24
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 24, JDK24, JEP updates, language features, GC improvements, platform enhancements
  - - meta
    - name: description
      content: Summarizes the new features and changes of JDK 24 to facilitate tracking Java evolution.
---

[JDK 24](https://openjdk.org/projects/jdk/24/) is the third non-long-term support version since JDK 21, and [JDK 22](https://javaguide.cn/java/new-features/java22-23.html), [JDK 23](https://javaguide.cn/java/new-features/java22-23.html). The next long-term support release is **JDK 25**, expected to be released in September this year.

JDK 24 brings quite a lot of new features, 24 in total. JDK 22 and JDK 23 both have only 12, and the new features of JDK 24 are equivalent to the sum of these two times. Therefore, it is still necessary to understand this version.

Overview of new features in JDK 24:

![JDK 24 new features](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk24-features.png)

The following figure shows the number of new features and update time brought by each version update from JDK 8 to JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 478: Key Derivation Function API (Preview)

The key derivation function API is a cryptographic algorithm used to derive additional keys from an initial key and other data. Its core function is to generate multiple different keys for different encryption purposes (such as encryption, authentication, etc.) to avoid security risks caused by key reuse. This is an important milestone in modern encryption and lays the foundation for the subsequent emerging quantum computing environment.

Through this API, developers can use the latest key derivation algorithms (such as HKDF and future Argon2):

```java
//Create a KDF object using the HKDF-SHA256 algorithm
KDF hkdf = KDF.getInstance("HKDF-SHA256");

// Create Extract and Expand parameter specifications
AlgorithmParameterSpec params =
    HKDFParameterSpec.ofExtract()
                     .addIKM(initialKeyMaterial) //Set the initial key material
                     .addSalt(salt) //Set salt value
                     .thenExpand(info, 32); //Set extension information and target length

// Derive a 32-byte AES key
SecretKey key = hkdf.deriveKey("AES", params);

// The same KDF object can be used for other key derivation operations
```

## JEP 483: Early class loading and linking

In a traditional JVM, an application needs to dynamically load and link classes every time it starts. This mechanism creates significant performance bottlenecks for startup-time-sensitive applications such as microservices or serverless functions. This feature significantly reduces the overhead of duplicating work and significantly reduces the startup time of Java applications by caching loaded and linked classes. Testing has shown that for large applications, such as Spring-based server applications, startup time can be reduced by more than 40%.

This optimization is zero-intrusive, requires no changes to the code of the application, library or framework, and starts in the same way, just by adding relevant JVM parameters (such as `-XX:+ClassDataSharing`).

## JEP 484: Class File API

The class file API was first previewed in JDK 22 ([JEP 457](https://openjdk.org/jeps/457)), and second previewed and further improved in JDK 23 ([JEP 466](https://openjdk.org/jeps/466)). Finally, this feature was successfully implemented in JDK 24.

The goal of the Class File API is to provide a standardized API for parsing, generating, and converting Java class files, replacing the past reliance on third-party libraries (such as ASM) for class file processing.

```java
//Create a ClassFile object, which is the entry point for operating class files.
ClassFile cf = ClassFile.of();
// Parse the byte array into ClassModel
ClassModel classModel = cf.parse(bytes);

// Build a new class file and remove all methods starting with "debug"
byte[] newBytes = cf.build(classModel.thisClass().asSymbol(),
        classBuilder -> {
            // Traverse all class elements
            for (ClassElement ce : classModel) {
                // Determine whether it is a method and the method name starts with "debug"
                if (!(ce instanceof MethodModel mm
                        && mm.methodName().stringValue().startsWith("debug"))) {
                    //Add to new class file
                    classBuilder.with(ce);
                }
            }
        });
```

## JEP 485: Stream Collector

The stream collector `Stream::gather(Gatherer)` is a powerful new feature that allows developers to define custom intermediate operations to achieve more complex and flexible data transformation. The `Gatherer` interface is the core of this feature, defining how to collect elements from a stream, maintain intermediate state, and produce results during processing.

Unlike existing built-in operations such as `filter`, `map` or `distinct`, `Stream::gather` enables developers to achieve tasks that are difficult to accomplish with standard Stream operations. For example, you can use `Stream::gather` to implement sliding windows, custom rule deduplication, or more complex state transitions and aggregations. This flexibility greatly expands the application scope of the Stream API, allowing developers to deal with more complex data processing scenarios.

Implement string length deduplication logic based on `Stream::gather(Gatherer)`:

```java
var result = Stream.of("foo", "bar", "baz", "quux")
                   .gather(Gatherer.ofSequential(
                       HashSet::new, // The initialization state is HashSet, used to save the length of strings that have been encountered
                       (set, str, downstream) -> {
                           if (set.add(str.length())) {
                               return downstream.push(str);
                           }
                           return true; // Continue processing the stream
                       }
                   ))
                   .toList();//Convert to list

// Output result ==> [foo, quux]
```

## JEP 486: Permanently disable security manager

JDK 24 no longer allows enabling `Security Manager`, even through the `java -Djava.security.manager` command, which is a key step in the gradual removal of this feature. Although `Security Manager` was once an important tool in Java for restricting code permissions (such as accessing the file system or network, reading or writing sensitive files, executing system commands), the Java community decided to eventually remove it due to high complexity, low usage, and high maintenance costs.

## JEP 487: Scoped Values (4th Preview)

Scoped Values can share immutable data within and between threads, which is superior to thread-local variables, especially when using a large number of virtual threads.

```java
final static ScopedValue<...> V = new ScopedValue<>();

//In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...```

Scoped values allow data to be shared safely and efficiently between components in large programs without resorting to method parameters.

## JEP 491: Synchronization of virtual threads without pinning platform threads

Optimized the working mechanism of virtual threads and `synchronized`. When virtual threads are blocked in `synchronized` methods and code blocks, they can usually release the operating system threads (platform threads) they occupy, avoiding long-term occupation of platform threads, thus improving the concurrency capabilities of the application. This mechanism avoids "pinning" - a situation where a virtual thread occupies a platform thread for an extended period of time, preventing it from serving other virtual threads.

Existing Java code that uses `synchronized` can benefit from the scaling capabilities of virtual threads without modification. For example, an I/O-intensive application that uses traditional platform threads may suffer from reduced concurrency due to thread blocking. With virtual threads, even if blocking occurs in a `synchronized` block, the platform thread will not be pinned, allowing the platform thread to continue serving other virtual threads and improving overall concurrency performance.

## JEP 493: Linking a runtime image without a JMOD file

By default, the JDK contains both runtime images (modules required for the runtime) and JMOD files. This feature allows the jlink tool to create a custom runtime image without using the JDK's JMOD file, reducing the JDK installation size (about 25%).

Description:

- Jlink is a new command line tool released with Java 9. It allows developers to create their own lightweight, customized JRE for module-based Java applications.
- A JMOD file is a description file for a Java module and contains the module's metadata and resources.

## JEP 495: Simplified source files and instance master methods (4th preview)

This feature mainly simplifies the declaration of the `main` method. For Java beginners, this declaration of the `main` method introduces too many Java syntax concepts, which is not conducive to beginners getting started quickly.

Define a `main` method before using this feature:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Define a `main` method after using this new feature:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

Further simplification (unnamed classes allow us to omit the class name)

```java
void main() {
   System.out.println("Hello, World!");
}
```

## JEP 497: Quantum Resistant Digital Signature Algorithm (ML-DSA)

JDK 24 introduces support for implementing the quantum-resistant Module-Lattice-Based Digital Signature Algorithm (**ML-DSA**) to prepare for the threats that may be brought about by future quantum computers.

ML-DSA is a quantum-resistant algorithm standardized in FIPS 204 by the National Institute of Standards and Technology (NIST) for digital signatures and authentication.

## JEP 498: Warn when using `sun.misc.Unsafe` memory access methods

JDK 23([JEP 471](https://openjdk.org/jeps/471)) proposes to deprecate the memory access methods in `sun.misc.Unsafe` and these methods will be removed in future versions. In JDK 24, the runtime emits a warning when any memory access method of `sun.misc.Unsafe` is called for the first time.

There are safe and efficient alternatives to these unsafe methods:

- `java.lang.invoke.VarHandle`: Introduced in JDK 9 (JEP 193), it provides a safe and efficient way to manipulate heap memory, including fields of objects, static fields of classes, and array elements.
- `java.lang.foreign.MemorySegment`: Introduced in JDK 22 (JEP 454), provides a safe and efficient way to access off-heap memory, sometimes working in conjunction with `VarHandle`.

These two classes are the core components of the Foreign Function & Memory API and are used to manage and operate off-heap memory respectively. The Foreign Function & Memory API was officially formalized in JDK 22 and became a standard feature.

```java
import jdk.incubator.foreign.*;
import java.lang.invoke.VarHandle;

// Class that manages off-heap integer arrays
class OffHeapIntBuffer {

    // VarHandle for accessing integer elements
    private static final VarHandle ELEM_VH = ValueLayout.JAVA_INT.arrayElementVarHandle();

    // memory manager
    private final Arena arena;

    // Off-heap memory segment
    private final MemorySegment buffer;

    // Constructor, allocates the specified amount of integer space
    public OffHeapIntBuffer(long size) {
        this.arena = Arena.ofShared();
        this.buffer = arena.allocate(ValueLayout.JAVA_INT, size);
    }

    // release memory
    public void deallocate() {
        arena.close();
    }

    //Set the value of the specified index volatilely
    public void setVolatile(long index, int value) {
        ELEM_VH.setVolatile(buffer, 0L, index, value);
    }

    //Initialize the elements in the specified range to 0
    public void initialize(long start, long n) {
        buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                       ValueLayout.JAVA_INT.byteSize() * n)
              .fill((byte) 0);
    }

    //Copy the specified range of elements to a new array
    public int[] copyToNewArray(long start, int n) {
        return buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                              ValueLayout.JAVA_INT.byteSize() * n)
                     .toArray(ValueLayout.JAVA_INT);
    }
}
```

## JEP 499: Structured Concurrency (Fourth Preview)

JDK 19 introduces structured concurrency, a multi-threaded programming method. The purpose is to simplify multi-threaded programming through the structured concurrency API. It is not intended to replace `java.util.concurrent`. It is currently in the incubator stage.

Structured concurrency treats multiple tasks running in different threads as a single unit of work, simplifying error handling, improving reliability, and enhancing observability. That is, structured concurrency preserves the readability, maintainability, and observability of single-threaded code.

The basic API for structured concurrency is `StructuredTaskScope`, which supports splitting a task into multiple concurrent subtasks, executed in their own threads, and the subtasks must complete before the main task can continue.

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