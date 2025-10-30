Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

---
title: Summary of Common Java Interview Questions (Part 1)
category: Java
tag:
  - Java Basics
head:
  - - meta
    - name: keywords
      content: Java features, Java SE, Java EE, Java ME, Java Virtual Machine, JVM, JDK, JRE, bytecode, Java compilation and interpretation, AOT compilation, cloud native, AOT vs. JIT, GraalVM, differences between Oracle JDK and OpenJDK, OpenJDK, LTS support, multi-threading support, static variables, member variables and local variables, wrapper class caching mechanism, auto-boxing and auto-unboxing, floating-point precision loss, BigDecimal, Java primitive data types, Java identifiers and keywords, bitshift operators, Java comments, static methods and instance methods, method overloading and overriding, varargs, Java performance optimization
  - - meta
    - name: description
      content: The highest quality summary of common Java basic knowledge points and interview questions, hoping to help you!

<!-- @include: @small-advertisement.snippet.md -->

## Basic Concepts and Knowledge

### What are the features of the Java language?

1. Simple and easy to learn (simple syntax, easy to get started);
2. Object-oriented (encapsulation, inheritance, polymorphism);
3. Platform independence (Java Virtual Machine implements platform independence);
4. Support for multithreading (C++ language does not have built-in multithreading mechanism, so it must call the operating system's multithreading function to design multithreading programs, while Java language provides multithreading support);
5. Reliability (with exception handling and automatic memory management mechanisms);
6. Security (the design of the Java language itself provides multiple security protection mechanisms such as access permission modifiers, restrictions on direct access to operating system resources);
7. High efficiency (through the optimization of technologies such as Just In Time compilers, the execution efficiency of Java language is still very good);
8. Support for network programming and very convenient;
9. Compilation and interpretation coexist;
10. ......

> **🐛 Correction (see: [issue#544](https://github.com/Snailclimb/JavaGuide/issues/544))**: Since C++11 (in 2011), C++ has introduced a multithreading library, and you can use `std::thread` and `std::async` to create threads on Windows, Linux, and macOS. Reference link: <http://www.cplusplus.com/reference/thread/thread/?kw=thread>

🌈 Let's expand a bit:

The slogan "Write Once, Run Anywhere" is a classic that has been spreading for many years! To the extent that even today, many people still feel that cross-platform is the biggest advantage of the Java language. In fact, cross-platform is no longer the biggest selling point of Java, nor are the new features of the JDK. Nowadays, virtualization technology is already very mature, for example, you can easily achieve cross-platform through Docker. In my opinion, the powerful ecosystem of Java is the key!

### Java SE vs. Java EE

- Java SE (Java Platform, Standard Edition): The standard edition of the Java platform, which is the foundation of the Java programming language. It includes the core libraries and virtual machine components that support the development and execution of Java applications. Java SE can be used to build desktop applications or simple server applications.
- Java EE (Java Platform, Enterprise Edition): The enterprise edition of the Java platform, which is built on top of Java SE and includes standards and specifications (such as Servlet, JSP, EJB, JDBC, JPA, JTA, JavaMail, JMS) that support the development and deployment of enterprise-level Java applications. Java EE can be used to build distributed, portable, robust, scalable, and secure server-side Java applications, such as web applications.

In simple terms, Java SE is the basic version of Java, and Java EE is the advanced version of Java. Java SE is more suitable for developing desktop applications or simple server applications, while Java EE is more suitable for developing complex enterprise-level applications or web applications.

In addition to Java SE and Java EE, there is also Java ME (Java Platform, Micro Edition). Java ME is the micro version of Java, mainly used for developing embedded applications for consumer electronic devices, such as mobile phones, PDAs, set-top boxes, refrigerators, air conditioners, etc. Java ME is not a focus, just know that it exists, and it is no longer used nowadays.

### ⭐️JVM vs. JDK vs. JRE

#### JVM

The Java Virtual Machine (JVM) is a virtual machine that runs Java bytecode. There are specific implementations of the JVM for different systems (Windows, Linux, macOS), with the goal of achieving the same results using the same bytecode. Bytecode and the different JVM implementations are the key to Java's "write once, run anywhere" feature.

As shown in the figure below, different programming languages (Java, Groovy, Kotlin, JRuby, Clojure, etc.) are compiled by their respective compilers into `.class` files, and ultimately run on the JVM on different platforms (Windows, Mac, Linux).

![Programming languages running on the Java Virtual Machine](https://oss.javaguide.cn/github/javaguide/java/basis/java-virtual-machine-program-language-os.png)

**The JVM is not just one type! As long as they meet the JVM specification, any company, organization, or individual can develop their own custom JVM.** That is to say, the HotSpot VM we commonly encounter is just one implementation of the JVM specification.

In addition to the HotSpot VM that we commonly use, there are also J9 VM, Zing VM, JRockit VM, and other JVMs. You can find a comparison of common JVMs on Wikipedia: [Comparison of Java virtual machines](https://en.wikipedia.org/wiki/Comparison_of_Java_virtual_machines). And you can find the JVM specifications for each version of the JDK on the [Java SE Specifications](https://docs.oracle.com/javase/specs/index.html) page.

![](https://oss.javaguide.cn/github/javaguide/java/basis/JavaSeSpecifications.jpg)

#### JDK and JRE
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

The JDK (Java Development Kit) is a full-featured Java development toolkit for developers to create and compile Java programs. It includes the JRE (Java Runtime Environment), as well as the javac compiler and other tools, such as javadoc (documentation generator), jdb (debugger), jconsole (monitoring tool), and javap (decompiler).

The JRE is the environment required to run compiled Java programs, and it mainly consists of the following two parts:

1. **JVM**: The Java Virtual Machine mentioned above.
2. **Java Class Library**: A set of standard libraries that provide common functionality and APIs (such as I/O operations, network communication, data structures, etc.).

In simple terms, the JRE only includes the environment and libraries required to run Java programs, while the JDK not only contains the JRE, but also includes tools for developing and debugging Java programs.

If you need to write, compile Java programs, or use the Java API documentation, you need to install the JDK. Some applications that require Java features (such as JSP to Servlet conversion or using reflection) may also require the JDK to compile and run Java code. Therefore, even if you are not doing Java development work, you may sometimes need to install the JDK.

The following diagram clearly shows the relationship between JDK, JRE, and JVM.

![jdk-include-jre](https://oss.javaguide.cn/github/javaguide/java/basis/jdk-include-jre.png)

However, starting from JDK 9, the distinction between JDK and JRE is no longer necessary, replaced by a module system (JDK is reorganized into 94 modules) + the [jlink](http://openjdk.java.net/jeps/282) tool (a new command-line tool released with Java 9 to generate custom Java runtime images that only include the modules required by the given application). Moreover, from JDK 11 onwards, Oracle no longer provides a separate JRE download.

In the article [Overview of Java 9 New Features](https://javaguide.cn/java/new-features/java9.html), when introducing the modular system, I mentioned:

> With the introduction of the module system, the JDK has been reorganized into 94 modules. Java applications can use the new jlink tool to create a custom runtime image that only includes the JDK modules it depends on. This can greatly reduce the size of the Java runtime environment.

That is, you can use jlink to create a smaller runtime based on your needs, instead of the same JRE for all applications.

Customized, modularized Java runtime images help simplify Java application deployment, save memory, and enhance security and maintainability. This is very important for meeting the requirements of modern application architectures, such as virtualization, containerization, microservices, and cloud-native development.

### ⭐️What is bytecode? What are the benefits of using bytecode?

In Java, the code that the JVM can understand is called bytecode (i.e., files with the `.class` extension). It is not targeted at any specific processor, but only towards the virtual machine. Java language solves the problem of low execution efficiency of traditional interpreted languages to some extent through the use of bytecode, while retaining the portability feature of interpreted languages. Therefore, the execution of Java programs is relatively efficient (though still lagging behind languages like C, C++, Rust, and Go), and since the bytecode is not targeted at a specific machine, Java programs can run on various different operating system computers without the need for recompilation.

**The process of a Java program from source code to execution is shown in the following diagram:**

![The process of Java code to machine code](https://oss.javaguide.cn/github/javaguide/java/basis/java-code-to-machine-code.png)

The step we need to pay special attention to is `.class->Machine Code`. In this step, the JVM class loader first loads the bytecode file, and then interprets and executes it line by line, which tends to be relatively slow. Furthermore, some methods and code blocks are frequently called (known as hot spots), so the **JIT (Just in Time Compilation)** compiler was later introduced, which is a runtime compiler. After the JIT compiler completes the first compilation, it saves the machine code corresponding to the bytecode, which can be directly used next time. We know that the efficiency of machine code is certainly higher than that of the Java interpreter. This also explains why we often say that **Java is a language with coexistence of compilation and interpretation**.

> 🌈 Further reading:
>
> - [Basics | Principles and Practice of the Java JIT Compiler - Meituan Technical Team](https://tech.meituan.com/2020/10/22/java-jit-practice-in-meituan.html)
> - [Building Microservice Applications Based on Static Compilation - Alibaba Middleware](https://mp.weixin.qq.com/s/4haTyXUmh8m-dBQaEzwDJw)

![The process of Java code to machine code with JIT](https://oss.javaguide.cn/github/javaguide/java/basis/java-code-to-machine-code-with-jit.png)

> HotSpot uses lazy evaluation, and according to the 80/20 rule, only a small portion of the code (hot spots) consumes the majority of system resources, which is what the JIT needs to compile. The JVM collects information based on how often the code is executed and makes optimizations accordingly, so the more it is executed, the faster it becomes.

The relationship between JDK, JRE, JVM, and JIT is shown in the following diagram.

![Relationship between JDK, JRE, JVM, and JIT](https://oss.javaguide.cn/github/javaguide/java/basis/jdk-jre-jvm-jit.png)

The following diagram shows the rough structure model of the JVM.

![Rough structure model of the JVM](https://oss.javaguide.cn/github/javaguide/java/basis/jvm-rough-structure-model.png)

### ⭐️Why is Java language said to be "compiled and interpreted"?

We have already mentioned this when discussing bytecode, but since it is quite important, we will discuss it again here.

We can divide high-level programming languages into two types based on the execution method of the program:

- **Compiled**: [Compiled languages](https://en.wikipedia.org/wiki/Compiled_language) use a [compiler](https://en.wikipedia.org/wiki/Compiler) to translate the source code into machine code that can be executed by the platform. Generally, the execution speed of compiled languages is faster, but the development efficiency is lower. Common compiled languages include C, C++, Go, Rust, and so on.
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

- **Interpreted**: [Interpreted languages](https://en.wikipedia.org/wiki/Interpreted_language) are interpreted (interpret) into machine code line by line through an [interpreter](https://en.wikipedia.org/wiki/Interpreter_(computing)) before being executed. Interpreted languages have a faster development efficiency but slower execution speed. Common interpreted languages include Python, JavaScript, PHP, etc.

![Compiled and Interpreted Languages](https://oss.javaguide.cn/github/javaguide/java/basis/compiled-and-interpreted-languages.png)

According to the Wikipedia introduction:

> To improve the efficiency of interpreted languages, Just-In-Time (JIT) compilation technology has been developed, which has narrowed the gap between these two types of languages. This technology combines the advantages of compiled languages and interpreted languages. Like compiled languages, it first compiles the program source code into [bytecode](https://en.wikipedia.org/wiki/Bytecode). At the time of execution, the bytecode is then directly interpreted and executed. [Java](https://en.wikipedia.org/wiki/Java) and [LLVM](https://en.wikipedia.org/wiki/LLVM) are representative products of this technology.
>
> Related reading: [Basics | Principle analysis and practice of Java Just-In-Time (JIT) compiler](https://tech.meituan.com/2020/10/22/java-jit-practice-in-meituan.html)

**Why is Java language described as "compilation and interpretation coexist"?**

This is because Java language has the characteristics of both compiled languages and interpreted languages. Java programs need to go through both compilation and interpretation steps. Java programs written in Java need to go through the compilation step first, generating bytecode (`.class` files), and this bytecode must be interpreted and executed by the Java interpreter.

### What are the advantages of AOT? Why not use AOT exclusively?

JDK 9 introduced a new compilation mode called **AOT (Ahead of Time Compilation)**. Unlike JIT, this compilation mode will compile the program into machine code before it is executed, which is a static compilation (C, C++, Rust, Go, etc. are static compilation languages). AOT avoids various overhead of JIT preheating, which can improve the startup speed of Java programs and avoid long preheating time. Additionally, AOT can reduce memory usage and enhance the security of Java programs (the AOT-compiled code is difficult to decompile and modify), making it particularly suitable for cloud-native scenarios.

**Key indicator comparison between JIT and AOT**:

<img src="https://oss.javaguide.cn/github/javaguide/java/basis/jit-vs-aot.png" alt="JIT vs AOT" style="zoom: 25%;" />

As can be seen, the main advantages of AOT are in startup time, memory usage, and package size. The main advantage of JIT is that it has a higher peak processing capability and can reduce the maximum latency of requests.

When talking about AOT, we can't help but mention [GraalVM](https://www.graalvm.org/)! GraalVM is a high-performance JDK (a complete JDK distribution) that can run Java and other JVM languages, as well as JavaScript, Python, and other non-JVM languages. GraalVM not only provides AOT compilation, but also JIT compilation. Interested students can take a look at the official GraalVM documentation: <https://www.graalvm.org/latest/docs/>. If you find the official documentation a bit difficult to understand, you can also look for some articles, such as:

- [Building Microservices Applications Based on Static Compilation](https://mp.weixin.qq.com/s/4haTyXUmh8m-dBQaEzwDJw)
- [Towards Nativization: Spring&Dubbo AOT Technology Example and Principle Explanation](https://cn.dubbo.apache.org/zh-cn/blog/2023/06/28/%e8%b5%b0%e5%90%91-native-%e5%8c%96springdubbo-aot-%e6%8a%80%e6%9c%af%e7%a4%ba%e4%be%8b%e4%b8%8e%e5%8e%9f%e7%90%86%e8%ae%b2%e8%a7%a3/)

**Since AOT has so many advantages, why not use this compilation mode exclusively?**

As we've compared JIT and AOT earlier, both have their own advantages, and we can only say that AOT is more suitable for the current cloud-native scenario and more friendly to the microservices architecture. In addition to that, AOT compilation cannot support some of Java's dynamic features, such as reflection, dynamic proxies, dynamic loading, JNI (Java Native Interface), etc. However, many frameworks and libraries (such as Spring, CGLIB) use these features. If we use only AOT compilation, we won't be able to use these frameworks and libraries, or we need to do targeted adaptation and optimization. For example, CGLIB dynamic proxy uses ASM technology, whose basic principle is to dynamically generate and load the modified bytecode files (`.class` files) in memory at runtime. If we use AOT compilation exclusively, we won't be able to use the ASM technology either. To support such dynamic features, we choose to use the JIT just-in-time compiler.

### Oracle JDK vs OpenJDK

Before looking at this issue, many people, like me, may not have encountered or used OpenJDK. So, are there any major differences between Oracle JDK and OpenJDK? Through the information I've gathered, I'll answer this question that many people have overlooked.

First, in 2006, SUN company open-sourced Java, which gave birth to OpenJDK. In 2009, Oracle acquired Sun company and created Oracle JDK based on OpenJDK. Oracle JDK is not open-source, and the first few versions (Java8 to Java11) will also add some proprietary features and tools compared to OpenJDK.

Secondly, for Java 7, OpenJDK and Oracle JDK are very close. Oracle JDK is built based on OpenJDK 7, with only a few small additional features, maintained by Oracle engineers.

The following is an excerpt from an Oracle official blog post in 2012:

> Q: What are the differences between the source code in the OpenJDK repository and the code used to build the Oracle JDK?
Answer: Very close - our Oracle JDK version build process is based on building from OpenJDK 7, with just a few additions, such as deployment code, including Oracle's Java plugin and Java WebStart implementations, as well as some closed-source third-party components, such as a graphics rasterizer, some open-source third-party components, like Rhino, and some miscellaneous things, like additional documentation or third-party fonts. Looking ahead, our goal is to open source all parts of the Oracle JDK, except for the parts we consider to be commercial features.

Finally, here's a simple summary of the differences between Oracle JDK and OpenJDK:

1. **Open Source**: OpenJDK is a reference model and is completely open-source, while Oracle JDK is based on OpenJDK implementation and is not fully open-source (personal opinion: as we all know, the JDK was originally developed by Sun Microsystems, and later Sun was sold to Oracle. Oracle is famous for its Oracle database, which is closed-source. At this point, Oracle didn't want to make everything open-source, but the original Sun company had already open-sourced the JDK. If Oracle had taken it back and closed it again, it would have certainly angered many Java developers, causing them to lose confidence in Java. So Oracle came up with a clever trick - they'd open-source a portion of the core code for you to play with, and they'd call their version Oracle JDK, while you can continue to play with your own OpenJDK. If you come up with something cool, Oracle can incorporate it into their future releases of Oracle JDK, a win-win situation!). OpenJDK open-source project: [https://github.com/openjdk/jdk](https://github.com/openjdk/jdk).
2. **Free of Charge**: Oracle JDK provides a free version, but it usually has a time limit. The versions after JDK17 can be freely distributed and used commercially, but only for 3 years. However, before JDK8u221, it can be used indefinitely for free. OpenJDK is completely free.
3. **Functionality**: Oracle JDK adds some unique features and tools to the basic OpenJDK, such as Java Flight Recorder (JFR, a monitoring tool) and Java Mission Control (JMC, a monitoring tool). However, after Java 11, the functionality of Oracle JDK and OpenJDK is basically the same, and most of the private components in Oracle JDK have also been donated to open-source organizations.
4. **Stability**: OpenJDK does not provide LTS (Long-Term Support) service, while Oracle JDK releases an LTS version about every three years. However, many companies have provided corresponding LTS versions based on OpenJDK, with the same cycle as Oracle JDK. So the stability of the two is actually quite similar.
5. **Licensing**: Oracle JDK is licensed under the BCL/OTN (Binary Code License/Oracle Technology Network) license, while OpenJDK is licensed under the GPL v2 (GNU General Public License) license.

> Since Oracle JDK is so good, why is there still OpenJDK?
>
> Answer:
>
> 1. OpenJDK is open-source, which means you can modify and optimize it according to your own needs, such as Alibaba developing Dragonwell8 based on OpenJDK: [https://github.com/alibaba/dragonwell8](https://github.com/alibaba/dragonwell8)
> 2. OpenJDK is commercially free (this is also why the JDK installed by default through the yum package manager is OpenJDK, not Oracle JDK). Although Oracle JDK is also commercially free (such as JDK 8), not all versions are free.
> 3. OpenJDK has a faster update rate. Oracle JDK generally releases a new version every 6 months, while OpenJDK generally releases a new version every 3 months. (Now you know why Oracle JDK is more stable, right? They first test the waters in OpenJDK, resolve most of the issues, and then release it on Oracle JDK)
>
> Based on the above reasons, OpenJDK still has its necessity!

![oracle jdk release cadence](https://oss.javaguide.cn/github/javaguide/java/basis/oracle-jdk-release-cadence.jpg)

**How to choose between Oracle JDK and OpenJDK?**

It is recommended to choose OpenJDK or a distribution based on OpenJDK, such as Amazon Corretto from AWS or Alibaba Dragonwell from Alibaba.

🌈 Expand a bit:

- BCL (Oracle Binary Code License Agreement): You can use the JDK (support commercial use), but you cannot modify it.
- OTN (Oracle Technology Network License Agreement): The JDK released from version 11 onwards uses this license, which can be used privately, but commercial use requires payment.

### Differences between Java and C++?

I know many people haven't learned C++, but interviewers just like to compare our Java with C++ for no reason! Well, even if you haven't learned C++, you still need to remember these differences.

Although Java and C++ are both object-oriented languages and support encapsulation, inheritance, and polymorphism, they still have quite a few differences:

- Java does not provide pointers to directly access memory, making the program memory more secure.
- Java's classes are single inheritance, while C++ supports multiple inheritance; although Java's classes cannot inherit multiple classes, interfaces can inherit multiple interfaces.
- Java has automatic memory management garbage collection (GC), and programmers don't need to manually release unused memory.
- C++ supports both method overloading and operator overloading, but Java only supports method overloading (operator overloading increases complexity, which is not in line with Java's original design principles).
- ......

## Basic Syntax

### What are the different forms of comments in Java?

There are three types of comments in Java:

1. **Single-line comments**: Typically used to explain the purpose of a single line of code.

2. **Multi-line comments**: Typically used to explain the purpose of a block of code.

3. **Javadoc comments**: Typically used to generate Java development documentation.

The most commonly used are single-line comments and Javadoc comments, while multi-line comments are used relatively less in actual development.

![](https://oss.javaguide.cn/github/javaguide/java/basis/image-20220714112336911.png)
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

When we write code, if the code quantity is relatively small, we or other members of the team can easily understand the code. However, when the project structure becomes complex, we need to use comments. Comments will not be executed (the compiler will remove all comments from the code before compiling it, and the bytecode will not retain the comments). They are written by us programmers for ourselves. Comments are the instruction manual for your code, and they can help the person reading the code quickly understand the logical relationship between the code. Therefore, it is a very good habit to add comments while writing programs.

The book "Clean Code" clearly states:

> **The more detailed the comments, the better the code is not. In fact, good code itself is a comment, and we should try to standardize and beautify our code to reduce unnecessary comments.**
>
> **If the programming language is expressive enough, there is no need for comments, and try to explain through the code as much as possible.**
>
> For example:
>
> Remove the complex comments below, and you only need to create a function that describes the same thing as the comments.
>
> ```java
> // check to see if the employee is eligible for full benefits
> if ((employee.flags & HOURLY_FLAG) && (employee.age > 65))
> ```
>
> It should be replaced with
>
> ```java
> if (employee.isEligibleForFullBenefits())
> ```

### What is the difference between identifiers and keywords?

When we write programs, we need to name a lot of things, such as programs, classes, variables, and methods, so we have **identifiers**. Simply put, **an identifier is a name**.

There are some identifiers to which Java language has already given special meanings, and they can only be used in specific places. These special identifiers are called **keywords**. Simply put, **keywords are identifiers with special meanings**.For example, in our daily life, if we want to open a store, we need to give the store a name, and the name we give is called an identifier. But we cannot name our store "Police Station" because "Police Station" is already a keyword with a special meaning.

### What are the keywords in Java language?

| Category                | Keywords   |            |          |              |            |           |        |
| :---------------------- | ---------- | ---------- | -------- | ------------ | ---------- | --------- | ------ |
| Access Control          | private    | protected  | public   |              |            |           |        |
| Class, Method and Variable Modifiers | abstract | class      | extends  | final        | implements | interface | native |
|                         | new        | static     | strictfp | synchronized | transient  | volatile  | enum   |
| Program Control         | break      | continue   | return   | do           | while      | if        | else   |
|                         | for        | instanceof | switch   | case         | default    | assert    |        |
| Error Handling          | try        | catch      | throw    | throws       | finally    |           |        |
| Package Related         | import     | package    |          |              |            |           |        |
| Primitive Types         | boolean    | byte       | char     | double       | float      | int       | long   |
|                         | short      |            |          |              |            |           |        |
| Variable Reference      | super      | this       | void     |              |            |           |        |
| Reserved Words          | goto       | const      |          |              |            |           |        |

> Tips: All keywords are in lowercase, and they will be displayed in a special color in the IDE.
>
> The keyword `default` is very special, as it belongs to program control, class/method/variable modifiers, and access control.
>
> - In program control, when no case matches in a `switch` statement, you can use `default` to write the default matching case.
> - In class/method/variable modifiers, since JDK8, default methods have been introduced, and you can use the `default` keyword to define the default implementation of a method.
> - In access control, if a method has no modifier, it will have a `default` modifier by default, but if you add the `default` modifier, it will cause an error.

⚠️ Note: Although `true`, `false`, and `null` look like keywords, they are actually literal values, and you cannot use them as identifiers.

Official documentation: [https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html)

### ⭐️ Increment and Decrement Operators

In the process of writing code, a common situation is the need to increase or decrease an integer type variable by 1. Java provides the increment operator (`++`) and decrement operator (`--`) to simplify this operation.

The `++` and `--` operators can be placed before or after the variable:

- **Prefix form** (e.g., `++a` or `--a`): First, the value of the variable is incremented/decremented, and then the variable is used. For example, `b = ++a` first increases `a` by 1, and then assigns the increased value to `b`.
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

- **Postfix form** (e.g., `a++` or `a--`): First use the current value of the variable, then increment/decrement the value of the variable. For example, `b = a++` first assigns the current value of `a` to `b`, then increments `a` by 1.

To help remember, you can use the following mnemonic: **If the symbol is in front, it's added/subtracted first; if the symbol is behind, it's added/subtracted later**.

Now, let's look at a common interview question that tests the understanding of the increment and decrement operators:

After executing the following code, what are the values of `a`, `b`, `c`, `d`, and `e`?

```java
int a = 9;
int b = a++;
int c = ++a;
int d = c--;
int e = --d;
```

The answer is: `a = 11`, `b = 9`, `c = 10`, `d = 10`, `e = 10`.

### ⭐️Bitwise Shift Operators

Bitwise shift operators are one of the most basic operators, and they are included in almost every programming language. In a shift operation, the bits of the operand are shifted left or right by the specified number of positions.

Bitwise shift operators are widely used in various frameworks and the JDK's own source code. For example, the `hash` method in `HashMap` (JDK1.8) uses bitwise shift operators:

```java
static final int hash(Object key) {
    int h;
    // key.hashCode(): return the hash value, i.e., hashcode
    // ^: bitwise XOR
    // >>>: unsigned right shift, ignore the sign bit, fill with 0
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**The main reasons for using bitwise shift operators:**

1. **Efficiency**: Bitwise shift operators directly correspond to processor shift instructions. Modern processors have dedicated hardware instructions to perform these shift operations, which usually complete in a single clock cycle. In comparison, arithmetic operations like multiplication and division require more clock cycles to complete at the hardware level.
2. **Memory saving**: Bitwise shift operations can be used to store multiple boolean values or flag bits in a single integer (such as `int` or `long`), thereby saving memory.

Bitwise shift operators are most commonly used for quickly multiplying or dividing by powers of 2. In addition, they play an important role in the following areas:

- **Bit field management**: For example, storing and manipulating multiple boolean values.
- **Hash algorithms and cryptography**: By using shifts and bitwise AND, OR, etc., to scramble data.
- **Data compression**: For example, Huffman coding can quickly process and operate on binary data using bitwise shift operators to generate compact compressed formats.
- **Data validation**: For example, CRC (Cyclic Redundancy Check) uses bitwise shifts and polynomial division to generate and verify data integrity.
- **Memory alignment**: Bitwise shift operations can be used to easily calculate and adjust the aligned addresses of data.

Mastering the basic knowledge of bitwise shift operators is very necessary, as it can not only help us use them in our code, but also help us understand the code in the source code that involves bitwise shift operators.

Java has three types of bitwise shift operators:

- `<<`: Left shift operator, shifts the bits to the left by the specified number of positions. `x << n` is equivalent to `x * 2^n` (in the absence of overflow).
- `>>`: Signed right shift operator, shifts the bits to the right by the specified number of positions. The high bits are filled with the sign bit (0 for positive numbers, 1 for negative numbers). `x >> n` is equivalent to `x / 2^n`.
- `>>>`: Unsigned right shift operator, shifts the bits to the right by the specified number of positions, ignoring the sign bit and filling the high bits with 0.

Although shift operations can be divided into left shifts and right shifts, in practical applications, right shift operations need to consider the handling of the sign bit.

Since `double` and `float` have a special representation in binary, they cannot be used for shift operations.

Shift operators actually only support `int` and `long` types. The compiler will convert `short`, `byte`, and `char` types to `int` before performing the shift operation.

**What happens if the shift amount exceeds the number of bits in the value?**

When the left/right shift bit count for an `int` type is greater than or equal to 32 bits, the bit count will be taken modulo 32 before the left/right shift operation. This means that a left/right shift of 32 bits is equivalent to no shift at all (32%32=0), and a left/right shift of 42 bits is equivalent to a left/right shift of 10 bits (42%32=10). When performing left/right shift operations on a `long` type, the modulo base becomes 64, as `long` corresponds to 64-bit binary.

In other words: `x<<42` is equivalent to `x<<10`, `x>>42` is equivalent to `x>>10`, and `x>>>42` is equivalent to `x>>>10`.

**Example code for left shift operator**:

```java
int i = -1;
System.out.println("Initial data: " + i);
System.out.println("Binary string of initial data: " + Integer.toBinaryString(i));
i <<= 10;
System.out.println("Data after left shift of 10 bits: " + i);
System.out.println("Binary string of data after left shift of 10 bits: " + Integer.toBinaryString(i));
```

Output:

```plain
Initial data: -1
Binary string of initial data: 11111111111111111111111111111111
Data after left shift of 10 bits: -1024
Binary string of data after left shift of 10 bits: 11111111111111111111110000000000
```

Since the left shift bit count is greater than or equal to 32 bits, the bit count will be taken modulo 32 before the left shift operation. So, the following code, which left shifts 42 bits, is equivalent to left shifting 10 bits (42%32=10), and the output is the same as the previous example.

```java
int i = -1;
System.out.println("Initial data: " + i);
System.out.println("Binary string of initial data: " + Integer.toBinaryString(i));
i <<= 42;
System.out.println("Data after left shift of 10 bits: " + i);
System.out.println("Binary string of data after left shift of 10 bits: " + Integer.toBinaryString(i));
```

The use of the right shift operator is similar, and I won't demonstrate it here due to space constraints.

### What's the difference between `continue`, `break`, and `return`?

In a loop structure, when the loop condition is not met or the required number of iterations is reached, the loop will normally end. However, sometimes you may need to terminate the loop prematurely when certain conditions occur. This is where the following keywords come into play:

1. `continue`: Skips the current iteration of the loop and continues to the next iteration.
2. `break`: Exits the entire loop body and continues with the statement after the loop.

`return` is used to exit the current method and stop its execution. There are two main uses of `return`:

1. `return;`: Directly use `return` to end the method execution, used for methods without a return value.
2. `return value;`: Return a specific value, used for methods with a return value.

Now, let's think about the output of the following code:

```java

```

Unfortunately, the original code snippet is incomplete, so I cannot provide the output. Without the full code, I cannot determine the behavior and the resulting output.
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

```java
public static void main(String[] args) {
    boolean flag = false;
    for (int i = 0; i <= 3; i++) {
        if (i == 0) {
            System.out.println("0");
        } else if (i == 1) {
            System.out.println("1");
            continue;
        } else if (i == 2) {
            System.out.println("2");
            flag = true;
        } else if (i == 3) {
            System.out.println("3");
            break;
        } else if (i == 4) {
            System.out.println("4");
        }
        System.out.println("xixi");
    }
    if (flag) {
        System.out.println("haha");
        return;
    }
    System.out.println("heihei");
}
```

Output:

```plain
0
xixi
1
2
xixi
3
haha
```

## ⭐️ Basic Data Types

### Do you understand the various basic data types in Java?

Java has 8 basic data types:

- 6 numeric types:
  - 4 integer types: `byte`, `short`, `int`, `long`
  - 2 floating-point types: `float`, `double`
- 1 character type: `char`
- 1 boolean type: `boolean`

The default values and the size of these basic data types are as follows:

| Data Type | Bits | Bytes | Default Value | Value Range                                                  |
| :-------- | :--- | :---- | :------------- | ------------------------------------------------------------ |
| `byte`    | 8    | 1     | 0              | -128 ~ 127                                                   |
| `short`   | 16   | 2     | 0              | -32768 (-2^15) ~ 32767 (2^15 - 1)                           |
| `int`     | 32   | 4     | 0              | -2147483648 ~ 2147483647                                    |
| `long`    | 64   | 8     | 0L             | -9223372036854775808 (-2^63) ~ 9223372036854775807 (2^63 -1)|
| `char`    | 16   | 2     | 'u0000'        | 0 ~ 65535 (2^16 - 1)                                       |
| `float`   | 32   | 4     | 0f             | 1.4E-45 ~ 3.4028235E38                                      |
| `double`  | 64   | 8     | 0d             | 4.9E-324 ~ 1.7976931348623157E308                           |
| `boolean` | 1    |       | false          | true, false                                                 |

You can see that the maximum positive numbers for `byte`, `short`, `int`, `long` are one less than the power of 2. This is because in the binary two's complement representation, the highest bit is used to represent the sign (0 for positive, 1 for negative), and the remaining bits represent the value part. So, to represent the maximum positive number, we need to set all the bits except the highest bit to 1. If we add 1, it will cause an overflow and become a negative number.

For `boolean`, the official documentation does not explicitly define the size, as it depends on the specific JVM implementation. Logically, it occupies 1 bit, but in practice, the computer's efficient storage factors will be considered.

Additionally, the storage space occupied by each basic data type in Java does not change with the hardware architecture, unlike many other languages. This consistency in storage space is one of the reasons why Java programs are more portable than programs written in most other languages (mentioned in "Thinking in Java" 2.2).

**Note:**

1. In Java, you must add **L** after a `long` type value, otherwise, it will be interpreted as an integer.
2. In Java, you must add **f or F** after a `float` type value, otherwise, it will not compile.
3. `char a = 'h'` (single quotes), `String a = "hello"` (double quotes).

These eight basic data types have corresponding wrapper classes: `Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`, `Character`, `Boolean`.

### What are the differences between basic data types and wrapper classes?

- **Usage**: Except for defining some constants and local variables, we rarely use basic data types to define variables in other places, such as method parameters or object properties. Wrapper classes can be used in generics, while basic data types cannot.
- **Storage**: The local variables of basic data types are stored in the local variable table of the Java virtual machine stack, and the member variables of basic data types (not modified by `static`) are stored in the heap of the Java virtual machine. Wrapper classes are object types, and we know that almost all object instances are stored in the heap.
- **Memory Consumption**: Compared to wrapper classes (object types), basic data types often occupy much less space.
- **Default Value**: Wrapper class member variables have a default value of `null`, while basic data types have a non-null default value.
- **Comparison**: For basic data types, `==` compares the values. For wrapper data types, `==` compares the memory addresses of the objects. All integer wrapper class objects are compared using the `equals()` method.
**Why is it said that almost all object instances exist on the heap?** This is because after the HotSpot virtual machine introduced JIT optimization, it will perform escape analysis on objects. If it is found that an object does not escape the method, it may be possible to implement stack allocation through scalar replacement, thereby avoiding heap allocation of memory.

⚠️ Note: **The storage of primitive data types on the stack is a common misconception!** The storage location of primitive data types depends on their scope and declaration method. If they are local variables, they will be stored on the stack; if they are member variables, they will be stored on the heap/method area/metaspace.

```java
public class Test {
    // Member variable, stored on the heap
    int a = 10;
    // Member variable modified by static, stored in the method area before JDK 1.7, and in the metaspace after JDK 1.8, not stored on the heap.
    // Variables belong to the class, not to the object.
    static int b = 20;

    public void method() {
        // Local variable, stored on the stack
        int c = 30;
        static int d = 40; // Compilation error, cannot use static to modify local variables
    }
}
```

### Do you know about the wrapper class cache mechanism?

Most of the Java primitive data type wrapper classes use a cache mechanism to improve performance.

The `Byte`, `Short`, `Integer`, `Long` 4 wrapper classes default to creating a cache of corresponding type data in the range **[-128, 127]**, `Character` creates a cache of data in the range **[0, 127]**, and `Boolean` directly returns `TRUE` or `FALSE`.

For `Integer`, you can modify the cache upper limit through the JVM parameter `-XX:AutoBoxCacheMax=<size>`, but you cannot modify the lower limit of -128. When actually used, it is not recommended to set too large a value to avoid wasting memory, or even causing OOM.

For `Byte`, `Short`, `Long`, `Character`, there is no similar `-XX:AutoBoxCacheMax` parameter to modify, so the cache range is fixed and cannot be adjusted through JVM parameters. `Boolean` directly returns the pre-defined `TRUE` and `FALSE` instances, without the concept of a cache range.

**Integer cache source code:**

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static {
        // high value may be configured by property
        int h = 127;
    }
}
```

**`Character` cache source code:**

```java
public static Character valueOf(char c) {
    if (c <= 127) { // must cache
      return CharacterCache.cache[(int)c];
    }
    return new Character(c);
}

private static class CharacterCache {
    private CharacterCache(){}
    static final Character cache[] = new Character[127 + 1];
    static {
        for (int i = 0; i < cache.length; i++)
            cache[i] = new Character((char)i);
    }

}
```

**`Boolean` cache source code:**

```java
public static Boolean valueOf(boolean b) {
    return (b ? TRUE : FALSE);
}
```

If it still exceeds the corresponding range, new objects will be created, and the size of the cache range is just a balance between performance and resources.

The two floating-point wrapper classes `Float` and `Double` do not implement a cache mechanism.

```java
Integer i1 = 33;
Integer i2 = 33;
System.out.println(i1 == i2);// Output: true

Float i11 = 333f;
Float i22 = 333f;
System.out.println(i11 == i22);// Output: false

Double i3 = 1.2;
Double i4 = 1.2;
System.out.println(i3 == i4);// Output: false
```

Now let's look at a problem: Is the output of the code below `true` or `false`?

```java
Integer i1 = 40;
Integer i2 = new Integer(40);
System.out.println(i1==i2);
```

The line `Integer i1=40` will undergo autoboxing, which means this line of code is equivalent to `Integer i1=Integer.valueOf(40)`. Therefore, `i1` directly uses the object in the cache. While `Integer i2 = new Integer(40)` will create a new object directly.

Therefore, the answer is `false`. Did you get it right?

Remember: **For all integer wrapper class objects, the comparison of values should use the `equals` method.**

![](https://oss.javaguide.cn/github/javaguide/up-1ae0425ce8646adfb768b5374951eeb820d.png)

### Do you understand autoboxing and unboxing? What is the principle behind it?

**What is autoboxing and unboxing?**

- **Boxing**: Wrapping a primitive type in its corresponding wrapper class;
- **Unboxing**: Converting a wrapper class to its corresponding primitive type;

Example:

```java
Integer i = 10;  //Boxing
int n = i;   //Unboxing
```

The corresponding bytecode for the above two lines of code is:

```java
   L1

    LINENUMBER 8 L1

    ALOAD 0

    BIPUSH 10
```
Here is the English translation of the Chinese Java content, with all markdown, code blocks, and links preserved:

    INVOKESTATIC java/lang/Integer.valueOf (I)Ljava/lang/Integer;

    PUTFIELD AutoBoxTest.i : Ljava/lang/Integer;

   L2

    LINENUMBER 9 L2

    ALOAD 0

    ALOAD 0

    GETFIELD AutoBoxTest.i : Ljava/lang/Integer;

    INVOKEVIRTUAL java/lang/Integer.intValue ()I

    PUTFIELD AutoBoxTest.n : I

    RETURN
```

From the bytecode, we find that autoboxing is actually a call to the `valueOf()` method of the wrapper class, and unboxing is actually a call to the `xxxValue()` method.

Therefore,

- `Integer i = 10` is equivalent to `Integer i = Integer.valueOf(10)`
- `int n = i` is equivalent to `int n = i.intValue()`;

Note: **If there are frequent boxing and unboxing operations, it will also seriously affect the system's performance. We should try to avoid unnecessary boxing and unboxing operations.**

```java
private static long sum() {
    // Should use long instead of Long
    Long sum = 0L;
    for (long i = 0; i <= Integer.MAX_VALUE; i++)
        sum += i;
    return sum;
}
```

### Why is there a risk of precision loss when doing floating-point arithmetic?

Demonstration of floating-point arithmetic precision loss:

```java
float a = 2.0f - 1.9f;
float b = 1.8f - 1.7f;
System.out.printf("%.9f",a);// 0.100000024
System.out.println(b);// 0.099999905
System.out.println(a == b);// false
```

Why does this problem occur?

This is closely related to the mechanism of how computers store floating-point numbers. We know that computers are binary, and when a computer represents a number, the width is limited. For infinitely recurring decimals stored in the computer, they can only be truncated, which leads to a loss of decimal precision. This is why floating-point numbers cannot be precisely represented in binary.

For example, the decimal 0.2 cannot be precisely converted to a binary decimal:

```java
// The process of converting 0.2 to a binary number is to continuously multiply by 2 until there is no decimal, 
// and the integer parts obtained from top to bottom are the binary result.
0.2 * 2 = 0.4 -> 0
0.4 * 2 = 0.8 -> 0
0.8 * 2 = 1.6 -> 1
0.6 * 2 = 1.2 -> 1
0.2 * 2 = 0.4 -> 0 (cyclic)
...
```

For more information about floating-point numbers, it is recommended to read the article [Computer System Fundamentals (Four) Floating-Point Numbers](http://kaito-kidd.com/2018/08/08/computer-system-float-point/).

### How to solve the precision loss problem of floating-point arithmetic?

`BigDecimal` can be used to perform arithmetic operations on floating-point numbers without causing precision loss. Usually, most business scenarios that require precise floating-point calculation results (such as scenarios involving money) are done using `BigDecimal`.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");
BigDecimal c = new BigDecimal("0.8");

BigDecimal x = a.subtract(c);
BigDecimal y = b.subtract(c);

System.out.println(x); /* 0.2 */
System.out.println(y); /* 0.20 */
// Compare content, not value
System.out.println(Objects.equals(x, y)); /* false */
// Use compareTo to compare values, 0 means equal
System.out.println(0 == x.compareTo(y)); /* true */
```

For a detailed introduction to `BigDecimal`, you can check out the article I wrote: [BigDecimal Explanation](https://javaguide.cn/java/basis/bigdecimal.html).

### How should data exceeding the long integer type be represented?

Basic numeric types all have a range of expression, and if they exceed this range, there is a risk of numeric overflow.

In Java, the 64-bit long integer type is the largest integer type.

```java
long l = Long.MAX_VALUE;
System.out.println(l + 1); // -9223372036854775808
System.out.println(l + 1 == Long.MIN_VALUE); // true
```

`BigInteger` uses an `int[]` array internally to store arbitrary-sized integer data.

Compared to regular integer type operations, the efficiency of `BigInteger` operations will be relatively low.

## Variables

### ⭐️ What is the difference between member variables and local variables?

- **Syntax form**: From the syntax form, member variables belong to the class, while local variables are defined in code blocks or methods, or are method parameters. Member variables can be modified by access modifiers like `public`, `private`, `static`, etc., while local variables cannot be modified by access modifiers or `static`. However, both member variables and local variables can be modified by `final`.
- **Storage method**: From the perspective of how variables are stored in memory, if a member variable is modified by `static`, then this member variable belongs to the class. If it is not modified by `static`, the member variable belongs to the instance. Objects exist in the heap memory, while local variables exist in the stack memory.
- **Lifetime**: From the perspective of the lifetime of variables in memory, member variables are part of the object and exist as long as the object is created, while local variables are automatically generated when the method is called and disappear when the method call ends.
- **Default value**: From the perspective of whether variables have a default value, if member variables are not assigned an initial value, they will be automatically assigned the default value of the type (one exception is that member variables modified by `final` must be explicitly assigned a value), while local variables will not be automatically assigned a value.

**Why do member variables have default values?**

The core reason is to ensure the safety and predictability of the object state.

Member variables and local variables differ in this rule mainly because their **lifecycle** is different, which leads to the compiler's "control" over them being different as well.

- **Local variables** only exist within a method, and the compiler can clearly see whether they are assigned a value before use, so the compiler will force you to manually assign a value, otherwise it will report an error.
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

- **Instance variables** are associated with the object, and their values may be assigned in the constructor or in a subsequent `setter` method. The compiler cannot predict when they will be assigned.

Furthermore, if a variable is not initialized, its memory will contain "garbage values" - arbitrary data left over from the previous use of that memory. If the program reads and uses this garbage value, the result will be completely unpredictable, such as a number becoming a random number or an object reference becoming an illegal address, which can directly lead to program crashes or strange bugs.

To prevent you from getting a dangerous object with "garbage values", Java simply provides a safe default value (such as `null` or `0`) for all instance variables, as a **safety net**.

Example code for instance variables and local variables:

```java
public class VariableExample {

    // Instance variables
    private String name;
    private int age;

    // Local variables in a method
    public void method() {
        int num1 = 10; // Local variable allocated on the stack
        String str = "Hello, world!"; // Local variable allocated on the stack
        System.out.println(num1);
        System.out.println(str);
    }

    // Local variables in a method with parameters
    public void method2(int num2) {
        int sum = num2 + 10; // Local variable allocated on the stack
        System.out.println(sum);
    }

    // Local variables in a constructor
    public VariableExample(String name, int age) {
        this.name = name; // Assigning values to instance variables
        this.age = age; // Assigning values to instance variables
        int num3 = 20; // Local variable allocated on the stack
        String str2 = "Hello, " + this.name + "!"; // Local variable allocated on the stack
        System.out.println(num3);
        System.out.println(str2);
    }
}
```

### What is the purpose of static variables?

Static variables, or variables marked with the `static` keyword, can be shared by all instances of a class. No matter how many objects of a class are created, they all share the same static variable. This means that the static variable is only allocated memory once, saving memory.

Static variables are accessed using the class name, e.g., `StaticVariableExample.staticVar` (unless they are marked `private`, in which case they cannot be accessed this way).

```java
public class StaticVariableExample {
    // Static variable
    public static int staticVar = 0;
}
```

Typically, static variables are marked as `final` to become constants.

```java
public class ConstantVariableExample {
    // Constant
    public static final int constantVar = 0;
}
```

### What is the difference between character constants and string constants?

- **Form**: Character constants are enclosed in single quotes, while string constants are enclosed in double quotes.
- **Meaning**: Character constants are equivalent to an integer value (the ASCII value), and can be used in expressions. String constants represent an address value (the location of the string in memory).
- **Memory size**: Character constants occupy 2 bytes, while string constants occupy several bytes.

⚠️ Note that `char` in Java occupies two bytes.

Example code for character constants and string constants:

```java
public class StringExample {
    // Character constant
    public static final char LETTER_A = 'A';

    // String constant
    public static final String GREETING_MESSAGE = "Hello, world!";
    public static void main(String[] args) {
        System.out.println("The size of the character constant is: " + Character.BYTES);
        System.out.println("The size of the string constant is: " + GREETING_MESSAGE.getBytes().length);
    }
}
```

Output:

```plain
The size of the character constant is: 2
The size of the string constant is: 13
```

## Methods

### What is a method's return value? What are the different types of methods?

**The method's return value** is the result produced by the execution of the code within the method body! (provided that the method is capable of producing a result). The purpose of the return value is to capture the result, so that it can be used in other operations!

We can classify methods into the following types based on their return values and parameters:

**1. Methods with no parameters and no return value**

```java
public void f1() {
    //......
}
// The following method also has no return value, although it uses `return`
public void f(int a) {
    if (...) {
        // Indicates the end of the method execution, the following print statement will not be executed
        return;
    }
    System.out.println(a);
}
```

**2. Methods with parameters and no return value**

```java
public void f2(Parameter 1, ..., Parameter n) {
    //......
}
```

**3. Methods with a return value and no parameters**

```java
public int f3() {
    //......
    return x;
}
```

**4. Methods with a return value and parameters**

```java
public int f4(int a, int b) {
    return a * b;
}
```

### Why can't static methods call non-static members?

This is related to the knowledge of the JVM. The main reasons are:

1. Static methods belong to the class and are allocated memory when the class is loaded, and can be accessed directly by the class name. Non-static members belong to the object instance, and only exist after the object is instantiated, and need to be accessed through the object instance.
2. When the static method exists, the non-static members may not yet exist in memory, so calling the non-existent non-static members from the static method is an illegal operation.
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

```java
public class Example {
    // Define a character constant
    public static final char LETTER_A = 'A';

    // Define a string constant
    public static final String GREETING_MESSAGE = "Hello, world!";

    public static void main(String[] args) {
        // Output the value of the character constant
        System.out.println("The value of the character constant is: " + LETTER_A);

        // Output the value of the string constant
        System.out.println("The value of the string constant is: " + GREETING_MESSAGE);
    }
}
```

### ⭐️What is the difference between static methods and instance methods?

**1. Calling method**

When calling a static method from the outside, you can use the `class_name.method_name` syntax, or you can also use the `object.method_name` syntax. However, instance methods can only be called using the `object.method_name` syntax. This means that **you don't need to create an object to call a static method**.

However, it's generally not recommended to use the `object.method_name` syntax to call a static method. This approach can easily cause confusion, as static methods belong to the class itself, not to a specific object.

Therefore, it is generally recommended to use the `class_name.method_name` syntax to call static methods.

```java
public class Person {
    public void method() {
      //......
    }

    public static void staicMethod(){
      //......
    }
    public static void main(String[] args) {
        Person person = new Person();
        // Calling an instance method
        person.method();
        // Calling a static method
        Person.staicMethod()
    }
}
```

**2. Accessing class members**

When accessing members of the class, static methods can only access static members (static variables and static methods), but cannot access instance members (instance variables and instance methods). Instance methods, on the other hand, do not have this restriction.

### ⭐️What is the difference between overloading and overriding?

> Overloading is when the same method can perform different tasks based on the input data.
>
> Overriding is when a subclass inherits a method from a parent class, and the input data is the same, but the response is different from the parent class.

#### Overloading

Overloading occurs within the same class (or between a parent class and a subclass). The method names must be the same, but the parameter types, the number of parameters, or the order of parameters must be different. The return type and access modifiers can be different.

The book "Java Core Technology" explains overloading like this:

> If multiple methods (such as the constructor methods of `StringBuilder`) have the same name but different parameters, overloading occurs.
>
> ```java
> StringBuilder sb = new StringBuilder();
> StringBuilder sb2 = new StringBuilder("HelloWorld");
> ```
>
> The compiler must choose which method to execute. It does this by matching the parameter types of the method call with the parameter types of the various methods. If the compiler cannot find a match, it will generate a compile-time error, because there is no match, or none is better than the others (this process is called overload resolution).
>
> Java allows overloading of any method, not just constructor methods.

In summary: Overloading is when multiple methods in the same class have the same name but different parameters, and they execute different logic based on the different parameters.

#### Overriding

Overriding occurs at runtime. It is when a subclass rewrites the implementation of a method that is allowed to be accessed from the parent class.

1. The method name and parameter list must be the same, the return type of the subclass method should be the same or a subtype of the parent class method's return type, the exceptions thrown should be the same or a subset of the parent class method, and the access modifier of the subclass method should be the same or wider than the parent class method.
2. If the parent class method is marked as `private/final/static`, the subclass cannot override that method, but a `static` method can be redeclared.
3. Constructors cannot be overridden.

#### Summary

In summary: **Overriding is when a subclass re-implements a method from the parent class, where the external appearance cannot be changed, but the internal logic can be changed.**

| Difference    | Overloading (Overloading)                                                            | Overriding (Overriding)                                                                     |
| ------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Scope**     | Within the same class.                                                             | Between a parent class and a subclass (with inheritance relationship).                      |
| **Method Signature** | The method names **must be the same**, but the **parameter list must be different** (at least one of the parameters' type, number, or order must be different). | The method name and parameter list **must be exactly the same**.                            |
| **Return Type** | The return type can be **changed** arbitrarily.                                  | The subclass method's return type must be **the same** as or a **subtype** of the parent class method's return type. |
| **Access Modifier** | The access modifier can be **changed** arbitrarily.                          | The subclass method's access modifier **cannot be more restrictive** than the parent class method's access modifier. (public > protected > default > private) |
Here is the English translation of the Chinese Java content, preserving all markdown, code blocks, and links:

| **Binding Time** | Compile-time Binding or Static Binding | Run-time Binding or Dynamic Binding |

**The method overriding must follow the "two sames, two smalls, and one big"** (the following content is excerpted from the book "Crazy Java Lecture Notes", [issue#892](https://github.com/Snailclimb/JavaGuide/issues/892)):

- "Two sames" means the same method name and the same parameter list;
- "Two smalls" means the return type of the subclass method should be smaller or equal to the return type of the parent class method, and the exception types declared to be thrown by the subclass method should be smaller or equal to the exception types declared to be thrown by the parent class method;
- "One big" means the access modifier of the subclass method should be greater or equal to the access modifier of the parent class method.

⭐️ Regarding the **return type of overridden methods**, it needs to be explained further. The previous statement is not entirely accurate: if the return type of the method is void or a primitive data type, the return type cannot be changed during overriding. However, if the return type of the method is a reference type, the return type can be overridden with a subclass of that reference type.

```java
public class Hero {
    public String name() {
        return "Super Hero";
    }
}
public class SuperMan extends Hero{
    @Override
    public String name() {
        return "Superman";
    }
    public Hero hero() {
        return new Hero();
    }
}

public class SuperSuperMan extends SuperMan {
    @Override
    public String name() {
        return "Super Super Hero";
    }

    @Override
    public SuperMan hero() {
        return new SuperMan();
    }
}
```

### What is a variable-length argument?

Starting from Java 5, Java supports defining variable-length arguments, which means allowing a variable number of arguments to be passed when calling a method. For example, the following method can accept 0 or more arguments.

```java
public static void method1(String... args) {
   //......
}
```

Additionally, variable arguments can only be the last parameter of a method, but they can be preceded by other parameters or not.

```java
public static void method2(String arg1, String... args) {
   //......
}
```

**What if we encounter method overloading? Will the fixed-parameter method or the variable-parameter method be prioritized?**

The answer is that the fixed-parameter method will be prioritized, as it has a higher match degree.

We can prove this with the following example.

```java
/**
 * Search WeChat for "JavaGuide" and reply "Interview Cracker" to get a free personal Java interview manual
 *
 * @author Guide哥
 * @date 2021/12/13 16:52
 **/
public class VariableLengthArgument {

    public static void printVariable(String... args) {
        for (String s : args) {
            System.out.println(s);
        }
    }

    public static void printVariable(String arg1, String arg2) {
        System.out.println(arg1 + arg2);
    }

    public static void main(String[] args) {
        printVariable("a", "b");
        printVariable("a", "b", "c", "d");
    }
}
```

Output:

```plain
ab
a
b
c
d
```

Additionally, Java's variable-length arguments are actually converted to an array during compilation, which can be seen in the generated `class` file.

```java
public class VariableLengthArgument {

    public static void printVariable(String... args) {
        String[] var1 = args;
        int var2 = args.length;

        for(int var3 = 0; var3 < var2; ++var3) {
            String s = var1[var3];
            System.out.println(s);
        }

    }
    // ......
}
```

## References

- What is the difference between JDK and JRE?: <https://stackoverflow.com/questions/1906445/what-is-the-difference-between-jdk-and-jre>
- Oracle vs OpenJDK: <https://www.educba.com/oracle-vs-openjdk/>
- Differences between Oracle JDK and OpenJDK: <https://stackoverflow.com/questions/22358071/differences-between-oracle-jdk-and-openjdk>
- Fully Understand Java Shift Operators: <https://juejin.cn/post/6844904025880526861>

<!-- @include: @article-footer.snippet.md -->