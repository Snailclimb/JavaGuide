---
title: 类加载过程详解
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: 类加载,加载,验证,准备,解析,初始化,clinit,常量池
  - - meta
    - name: description
      content: 拆解 JVM 类加载的各阶段与关键细节，理解验证、准备、解析与初始化的具体行为。
---

## 类的生命周期

类从被加载到虚拟机内存中开始到卸载出内存为止，它的整个生命周期可以简单概括为 7 个阶段：加载（Loading）、验证（Verification）、准备（Preparation）、解析（Resolution）、初始化（Initialization）、使用（Using）和卸载（Unloading）。其中，验证、准备和解析这三个阶段可以统称为连接（Linking）。

这 7 个阶段的顺序如下图所示：

![一个类的完整生命周期](https://oss.javaguide.cn/github/javaguide/java/jvm/lifecycle-of-a-class.png)

## 类加载过程

**Class 文件需要加载到虚拟机中之后才能运行和使用，那么虚拟机是如何加载这些 Class 文件呢？**

系统加载 Class 类型的文件主要三步：**加载->连接->初始化**。连接过程又可分为三步：**验证->准备->解析**。

![类加载过程](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-procedure.png)

详见 [Java Virtual Machine Specification - 5.3. Creation and Loading](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.3 "Java Virtual Machine Specification - 5.3. Creation and Loading")。

### 加载

类加载过程的第一步，主要完成下面 3 件事情：

1. 通过全类名获取定义此类的二进制字节流。
2. 将字节流所代表的静态存储结构转换为方法区的运行时数据结构。
3. 在内存中生成一个代表该类的 `Class` 对象，作为方法区这些数据的访问入口。

虚拟机规范上面这 3 点并不具体，因此是非常灵活的。比如："通过全类名获取定义此类的二进制字节流" 并没有指明具体从哪里获取（ `ZIP`、 `JAR`、`EAR`、`WAR`、网络、动态代理技术运行时动态生成、其他文件生成比如 `JSP`...）、怎样获取。

加载这一步主要是通过我们后面要讲到的 **类加载器** 完成的。类加载器有很多种，当我们想要加载一个类的时候，具体是哪个类加载器加载由 **双亲委派模型** 决定（不过，我们也能打破双亲委派模型）。

> 类加载器、双亲委派模型也是非常重要的知识点，这部分内容在[类加载器详解](https://javaguide.cn/java/jvm/classloader.html "类加载器详解")这篇文章中有详细介绍到。阅读本篇文章的时候，大家知道有这么个东西就可以了。

每个 Java 类都有一个引用指向加载它的 `ClassLoader`。不过，数组类不是通过 `ClassLoader` 创建的，而是 JVM 在需要的时候自动创建的，数组类通过`getClassLoader()`方法获取 `ClassLoader` 的时候和该数组的元素类型的 `ClassLoader` 是一致的。

一个非数组类的加载阶段（加载阶段获取类的二进制字节流的动作）是可控性最强的阶段，这一步我们可以去完成还可以自定义类加载器去控制字节流的获取方式（重写一个类加载器的 `loadClass()` 方法）。

加载阶段与连接阶段的部分动作(如一部分字节码文件格式验证动作)是交叉进行的，加载阶段尚未结束，连接阶段可能就已经开始了。

### 验证

**验证是连接阶段的第一步，这一阶段的目的是确保 Class 文件的字节流中包含的信息符合《Java 虚拟机规范》的全部约束要求，保证这些信息被当作代码运行后不会危害虚拟机自身的安全。**

验证阶段这一步在整个类加载过程中耗费的资源还是相对较多的，但很有必要，可以有效防止恶意代码的执行。任何时候，程序安全都是第一位。

不过，验证阶段也不是必须要执行的阶段。如果程序运行的全部代码(包括自己编写的、第三方包中的、从外部加载的、动态生成的等所有代码)都已经被反复使用和验证过，在生产环境的实施阶段就可以考虑使用 `-Xverify:none` 参数来关闭大部分的类验证措施，以缩短虚拟机类加载的时间。但是需要注意的是 `-Xverify:none` 和 `-noverify` 在 JDK 13 中被标记为 deprecated ，在未来版本的 JDK 中可能会被移除。

验证阶段主要由四个检验阶段组成：

1. 文件格式验证（Class 文件格式检查）
2. 元数据验证（字节码语义检查）
3. 字节码验证（程序语义检查）
4. 符号引用验证（类的正确性检查）

![验证阶段示意图](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-process-verification.png)

文件格式验证这一阶段是基于该类的二进制字节流进行的，主要目的是保证输入的字节流能正确地解析并存储于方法区之内，格式上符合描述一个 Java 类型信息的要求。除了这一阶段之外，其余三个验证阶段都是基于方法区的存储结构上进行的，不会再直接读取、操作字节流了。

> 方法区属于是 JVM 运行时数据区域的一块逻辑区域，是各个线程共享的内存区域。当虚拟机要使用一个类时，它需要读取并解析 Class 文件获取相关信息，再将信息存入到方法区。方法区会存储已被虚拟机加载的 **类信息、字段信息、方法信息、常量、静态变量、即时编译器编译后的代码缓存等数据**。
>
> 关于方法区的详细介绍，推荐阅读 [Java 内存区域详解](https://javaguide.cn/java/jvm/memory-area.html "Java 内存区域详解") 这篇文章。

符号引用验证发生在类加载过程中的解析阶段，具体点说是 JVM 将符号引用转化为直接引用的时候（解析阶段会介绍符号引用和直接引用）。

符号引用验证的主要目的是确保解析阶段能正常执行，如果无法通过符号引用验证，JVM 会抛出异常，比如：

- `java.lang.IllegalAccessError`：当类试图访问或修改它没有权限访问的字段，或调用它没有权限访问的方法时，抛出该异常。
- `java.lang.NoSuchFieldError`：当类试图访问或修改一个指定的对象字段，而该对象不再包含该字段时，抛出该异常。
- `java.lang.NoSuchMethodError`：当类试图访问一个指定的方法，而该方法不存在时，抛出该异常。
- ……

### 准备

**准备阶段是正式为类变量分配内存并设置类变量初始值的阶段**，这些内存都将在方法区中分配。对于该阶段有以下几点需要注意：

1. 这时候进行内存分配的仅包括类变量（ Class Variables ，即静态变量，被 `static` 关键字修饰的变量，只与类相关，因此被称为类变量），而不包括实例变量。实例变量会在对象实例化时随着对象一块分配在 Java 堆中。
2. 从概念上讲，类变量所使用的内存都应当在 **方法区** 中进行分配。不过有一点需要注意的是：JDK 7 之前，HotSpot 使用永久代来实现方法区的时候，实现是完全符合这种逻辑概念的。 而在 JDK 7 及之后，HotSpot 已经把原本放在永久代的字符串常量池、静态变量等移动到堆中，这个时候类变量则会随着 Class 对象一起存放在 Java 堆中。相关阅读：[《深入理解 Java 虚拟机（第 3 版）》勘误#75](https://github.com/fenixsoft/jvm_book/issues/75 "《深入理解Java虚拟机（第3版）》勘误#75")
3. 这里所设置的初始值"通常情况"下是数据类型默认的零值（如 0、0L、null、false 等），比如我们定义了`public static int value=111` ，那么 value 变量在准备阶段的初始值就是 0 而不是 111（初始化阶段才会赋值）。特殊情况：比如给 value 变量加上了 final 关键字`public static final int value=111` ，那么准备阶段 value 的值就被赋值为 111。

**基本数据类型的零值**：(图片来自《深入理解 Java 虚拟机》第 3 版 7.3.3 )

![基本数据类型的零值](https://oss.javaguide.cn/github/javaguide/java/%E5%9F%BA%E6%9C%AC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E7%9A%84%E9%9B%B6%E5%80%BC.png)

### Analysis

**The parsing phase is the process in which the virtual machine replaces symbol references in the constant pool with direct references. ** The parsing action is mainly performed on class or interface, field, class method, interface method, method type, method handle and call qualifier 7 class symbol references.

The explanation of symbolic references and direct references in the third edition of Section 7.3.4 of "In-depth Understanding of the Java Virtual Machine" is as follows:

![Symbol reference and direct reference](https://oss.javaguide.cn/github/javaguide/java/jvm/symbol-reference-and-direct-reference.png)

For example: when the program executes a method, the system needs to know exactly where the method is located. The Java virtual machine prepares a method table for each class to store all methods in the class. When you need to call a method of a class, you can call the method directly as long as you know the offset of the method in the method table. By parsing the operation symbol reference, it can be directly converted into the location of the target method in the method table of the class, so that the method can be called.

In summary, the parsing phase is the process in which the virtual machine replaces the symbolic reference in the constant pool with a direct reference, that is, obtains the pointer or offset of the class, field, or method in memory.

### Initialization

**The initialization phase is the process of executing the initialization method `<clinit> ()` method. It is the last step of class loading. At this step, the JVM begins to actually execute the Java program code (bytecode) defined in the class. **

> Note: The `<clinit> ()` method is automatically generated after compilation.

For calls to the `<clinit> ()` method, the virtual machine itself ensures its safety in a multi-threaded environment. Because the `<clinit> ()` method is thread-safe with locks, class initialization in a multi-threaded environment may cause multiple threads to block, and this blocking is difficult to detect.

For the initialization phase, the virtual machine strictly regulates that there are only 6 situations in which a class must be initialized (a class will only be initialized if it is actively used):

1. When encountering the four bytecode instructions `new`, `getstatic`, `putstatic` or `invokestatic`:
   - `new`: Create an instance object of a class.
   - `getstatic`, `putstatic`: Read or set static fields of a type (except static fields modified by `final` and the results have been put into the constant pool at compile time).
   - `invokestatic`: Invoke the static method of the class.
2. Use the methods of the `java.lang.reflect` package to make reflection calls to the class, such as `Class.forName("...")`, `newInstance()`, etc. If the class is not initialized, its initialization needs to be triggered.
3. Initialize a class. If its parent class has not been initialized yet, trigger the initialization of the parent class first.
4. When the virtual machine starts, the user needs to define a main class to be executed (the class containing the `main` method), and the virtual machine will initialize this class first.
5. `MethodHandle` and `VarHandle` can be regarded as lightweight reflection calling mechanisms. If you want to use these two calls, you must first use `findStaticVarHandle` to initialize the class to be called.
6. **"Additional, from [issue745](https://github.com/Snailclimb/JavaGuide/issues/745 "issue745")"** When an interface defines a new default method added by JDK8 (an interface method modified by the default keyword), if the implementation class of this interface is initialized, the interface must be initialized before it.

## Class unloading

> This part of uninstalling comes from [issue#662](https://github.com/Snailclimb/JavaGuide/issues/662 "issue#662") and is supplemented by **[guang19](https://github.com/guang19 "guang19")**.

**Unloading a class means that the Class object of this class is GC. **

Uninstalling classes needs to meet 3 requirements:

1. All instance objects of this class have been GCed, which means that there are no instance objects of this class in the heap.
2. The class is not referenced anywhere else
3. The instance of the class loader of this class has been GC

Therefore, during the JVM life cycle, classes loaded by the class loader that comes with the jvm will not be unloaded. But classes loaded by our custom class loader may be unloaded.

Just think about it, the `BootstrapClassLoader`, `ExtClassLoader`, `AppClassLoader` that comes with the JDK are responsible for loading the classes provided by the JDK, so they (instances of the class loader) will definitely not be recycled. Instances of our custom class loader can be recycled, so classes loaded using our custom loader can be unloaded.

**Reference**

- "In-depth Understanding of Java Virtual Machine"
- "Practical Java Virtual Machine"
- Chapter 5. Loading, Linking, and Initializing - Java Virtual Machine Specification: <https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.4>

<!-- @include: @article-footer.snippet.md -->