---
title: 大白话带你认识 JVM
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM 基础,类加载,方法区,堆栈,程序计数器,运行时数据区
  - - meta
    - name: description
      content: 用通俗方式介绍 JVM 的基本组成与类加载执行流程，帮助快速入门虚拟机原理。
---

> 来自[说出你的愿望吧丷](https://juejin.im/user/5c2400afe51d45451758aa96)投稿，原文地址：<https://juejin.im/post/5e1505d0f265da5d5d744050>。

## 前言

如果在文中用词或者理解方面出现问题，欢迎指出。此文旨在提及而不深究，但会尽量效率地把知识点都抛出来

## 一、JVM 的基本介绍

JVM 是 Java Virtual Machine 的缩写，它是一个虚构出来的计算机，一种规范。通过在实际的计算机上仿真模拟各类计算机功能实现···

好，其实抛开这么专业的句子不说，就知道 JVM 其实就类似于一台小电脑运行在 windows 或者 linux 这些操作系统环境下即可。它直接和操作系统进行交互，与硬件不直接交互，而操作系统可以帮我们完成和硬件进行交互的工作。

![](https://static001.geekbang.org/infoq/da/da0380a04d9c04facd2add5f6dba06fa.png)

### 1.1 Java 文件是如何被运行的

比如我们现在写了一个 HelloWorld.java 好了，那这个 HelloWorld.java 抛开所有东西不谈，那是不是就类似于一个文本文件，只是这个文本文件它写的都是英文，而且有一定的缩进而已。

那我们的 **JVM** 是不认识文本文件的，所以它需要一个 **编译** ，让其成为一个它会读二进制文件的 **HelloWorld.class**

#### ① 类加载器

如果 **JVM** 想要执行这个 **.class** 文件，我们需要将其装进一个 **类加载器** 中，它就像一个搬运工一样，会把所有的 **.class** 文件全部搬进 JVM 里面来。

![](https://static001.geekbang.org/infoq/2f/2f012fde94376f43a25dbe1dd07e0dd8.png)

#### ② 方法区

**方法区** 是用于存放类似于元数据信息方面的数据的，比如类信息，常量，静态变量，编译后代码···等

类加载器将 .class 文件搬过来就是先丢到这一块上

#### ③ 堆

**堆** 主要放了一些存储的数据，比如对象实例，数组···等，它和方法区都同属于 **线程共享区域** 。也就是说它们都是 **线程不安全** 的

#### ④ 栈

**栈** 这是我们的代码运行空间。我们编写的每一个方法都会放到 **栈** 里面运行。

我们会听说过 本地方法栈 或者 本地方法接口 这两个名词，不过我们基本不会涉及这两块的内容，它俩底层是使用 C 来进行工作的，和 Java 没有太大的关系。

#### ⑤ 程序计数器

主要就是完成一个加载工作，类似于一个指针一样的，指向下一行我们需要执行的代码。和栈一样，都是 **线程独享** 的，就是说每一个线程都会有自己对应的一块区域而不会存在并发和多线程的问题。

![](https://static001.geekbang.org/infoq/c6/c602f57ea9297f50bbc265f1821d6263.png)

#### 小总结

1. Java 文件经过编译后变成 .class 字节码文件
2. 字节码文件通过类加载器被搬运到 JVM 虚拟机中
3. 虚拟机主要的 5 大块：方法区，堆都为线程共享区域，有线程安全问题，栈和本地方法栈和计数器都是独享区域，不存在线程安全问题，而 JVM 的调优主要就是围绕堆，栈两大块进行

### 1.2 简单的代码例子

一个简单的学生类

![](https://static001.geekbang.org/infoq/12/12f0b239db65b8a95f0ce90e9a580e4d.png)

一个 main 方法

![](https://static001.geekbang.org/infoq/0c/0c6d94ab88a9f2b923f5fea3f95bc2eb.png)

执行 main 方法的步骤如下:

1. 编译好 App.java 后得到 App.class 后，执行 App.class，系统会启动一个 JVM 进程，从 classpath 路径中找到一个名为 App.class 的二进制文件，将 App 的类信息加载到运行时数据区的方法区内，这个过程叫做 App 类的加载
2. JVM 找到 App 的主程序入口，执行 main 方法
3. 这个 main 中的第一条语句为 Student student = new Student("tellUrDream") ，就是让 JVM 创建一个 Student 对象，但是这个时候方法区中是没有 Student 类的信息的，所以 JVM 马上加载 Student 类，把 Student 类的信息放到方法区中
4. 加载完 Student 类后，JVM 在堆中为一个新的 Student 实例分配内存，然后调用构造函数初始化 Student 实例，这个 Student 实例持有 **指向方法区中的 Student 类的类型信息** 的引用
5. 执行 student.sayName();时，JVM 根据 student 的引用找到 student 对象，然后根据 student 对象持有的引用定位到方法区中 student 类的类型信息的方法表，获得 sayName() 的字节码地址。
6. 执行 sayName()

其实也不用管太多，只需要知道对象实例初始化时会去方法区中找类信息，完成后再到栈那里去运行方法。找方法就在方法表中找。

## 二、类加载器的介绍

之前也提到了它是负责加载.class 文件的，它们在文件开头会有特定的文件标示，将 class 文件字节码内容加载到内存中，并将这些内容转换成方法区中的运行时数据结构，并且 ClassLoader 只负责 class 文件的加载，而是否能够运行则由 Execution Engine 来决定

### 2.1 类加载器的流程

从类被加载到虚拟机内存中开始，到释放内存总共有 7 个步骤：加载，验证，准备，解析，初始化，使用，卸载。其中**验证，准备，解析三个部分统称为连接**

#### 2.1.1 加载

1. 将 class 文件加载到内存
2. 将静态数据结构转化成方法区中运行时的数据结构
3. 在堆中生成一个代表这个类的 java.lang.Class 对象作为数据访问的入口

#### 2.1.2 链接

1. 验证：确保加载的类符合 JVM 规范和安全，保证被校验类的方法在运行时不会做出危害虚拟机的事件，其实就是一个安全检查
2. 准备：为 static 变量在方法区中分配内存空间，设置变量的初始值，例如 static int a = 3 （注意：准备阶段只设置类中的静态变量（方法区中），不包括实例变量（堆内存中），实例变量是对象初始化时赋值的）
3. 解析：虚拟机将常量池内的符号引用替换为直接引用的过程（符号引用比如我现在 import java.util.ArrayList 这就算符号引用，直接引用就是指针或者对象地址，注意引用对象一定是在内存进行）

#### 2.1.3 初始化

初始化其实就是执行类构造器方法的`<clinit>()`的过程，而且要保证执行前父类的`<clinit>()`方法执行完毕。这个方法由编译器收集，顺序执行所有类变量（static 修饰的成员变量）显式初始化和静态代码块中语句。此时准备阶段时的那个 `static int a` 由默认初始化的 0 变成了显式初始化的 3。 由于执行顺序缘故，初始化阶段类变量如果在静态代码块中又进行了更改，会覆盖类变量的显式初始化，最终值会为静态代码块中的赋值。

> 注意：字节码文件中初始化方法有两种，非静态资源初始化的`<init>`和静态资源初始化的`<clinit>`，类构造器方法`<clinit>()`不同于类的构造器，这些方法都是字节码文件中只能给 JVM 识别的特殊方法。

#### 2.1.4 卸载

GC 将无用对象从内存中卸载

### 2.2 类加载器的加载顺序

加载一个 Class 类的顺序也是有优先级的，类加载器从最底层开始往上的顺序是这样的

1. BootStrap ClassLoader：rt.jar
2. Extension ClassLoader: 加载扩展的 jar 包
3. App ClassLoader：指定的 classpath 下面的 jar 包
4. Custom ClassLoader：自定义的类加载器

### 2.3 双亲委派机制

当一个类收到了加载请求时，它是不会先自己去尝试加载的，而是委派给父类去完成，比如我现在要 new 一个 Person，这个 Person 是我们自定义的类，如果我们要加载它，就会先委派 App ClassLoader ，只有当父类加载器都反馈自己无法完成这个请求（也就是父类加载器都没有找到加载所需的 Class）时，子类加载器才会自行尝试加载。

这样做的好处是，加载位于 rt.jar 包中的类时不管是哪个加载器加载，最终都会委托到 BootStrap ClassLoader 进行加载，这样保证了使用不同的类加载器得到的都是同一个结果。

其实这个也是一个隔离的作用，避免了我们的代码影响了 JDK 的代码，比如我现在自己定义一个 `java.lang.String`：

```java
package java.lang;
public class String {
    public static void main(String[] args) {
        System.out.println();
    }
}
```

尝试运行当前类的 `main` 函数的时候，我们的代码肯定会报错。这是因为在加载的时候其实是找到了 rt.jar 中的`java.lang.String`，然而发现这个里面并没有 `main` 方法。

## 三、运行时数据区

### 3.1 本地方法栈和程序计数器

比如说我们现在点开 Thread 类的源码，会看到它的 start0 方法带有一个 native 关键字修饰，而且不存在方法体，这种用 native 修饰的方法就是本地方法，这是使用 C 来实现的，然后一般这些方法都会放到一个叫做本地方法栈的区域。

程序计数器其实就是一个指针，它指向了我们程序中下一句需要执行的指令，它也是内存区域中唯一一个不会出现 OutOfMemoryError 的区域，而且占用内存空间小到基本可以忽略不计。这个内存仅代表当前线程所执行的字节码的行号指示器，字节码解析器通过改变这个计数器的值选取下一条需要执行的字节码指令。

如果执行的是 native 方法，那这个指针就不工作了。

### 3.2 方法区

方法区主要的作用是存放类的元数据信息，常量和静态变量···等。当它存储的信息过大时，会在无法满足内存分配时报错。

### 3.3 虚拟机栈和虚拟机堆

一句话便是：栈管运行，堆管存储。则虚拟机栈负责运行代码，而虚拟机堆负责存储数据。

#### 3.3.1 虚拟机栈的概念

它是 Java 方法执行的内存模型。里面会对局部变量，动态链表，方法出口，栈的操作（入栈和出栈）进行存储，且线程独享。同时如果我们听到局部变量表，那也是在说虚拟机栈

```java
public class Person{
    int a = 1;

    public void doSomething(){
        int b = 2;
    }
}
```

#### 3.3.2 虚拟机栈存在的异常

如果线程请求的栈的深度大于虚拟机栈的最大深度，就会报 **StackOverflowError** （这种错误经常出现在递归中）。Java 虚拟机也可以动态扩展，但随着扩展会不断地申请内存，当无法申请足够内存时就会报错 **OutOfMemoryError**。

#### 3.3.3 虚拟机栈的生命周期

对于栈来说，不存在垃圾回收。只要程序运行结束，栈的空间自然就会释放了。栈的生命周期和所处的线程是一致的。

这里补充一句：8 种基本类型的变量+对象的引用变量+实例方法都是在栈里面分配内存。

#### 3.3.4 虚拟机栈的执行

我们经常说的栈帧数据，说白了在 JVM 中叫栈帧，放到 Java 中其实就是方法，它也是存放在栈中的。

栈中的数据都是以栈帧的格式存在，它是一个关于方法和运行期数据的数据集。比如我们执行一个方法 a，就会对应产生一个栈帧 A1，然后 A1 会被压入栈中。同理方法 b 会有一个 B1，方法 c 会有一个 C1，等到这个线程执行完毕后，栈会先弹出 C1，后 B1,A1。它是一个先进后出，后进先出原则。

#### 3.3.5 局部变量的复用

局部变量表用于存放方法参数和方法内部所定义的局部变量。它的容量是以 Slot 为最小单位，一个 slot 可以存放 32 位以内的数据类型。

虚拟机通过索引定位的方式使用局部变量表，范围为 `[0,局部变量表的 slot 的数量]`。方法中的参数就会按一定顺序排列在这个局部变量表中，至于怎么排的我们可以先不关心。而为了节省栈帧空间，这些 slot 是可以复用的，当方法执行位置超过了某个变量，那么这个变量的 slot 可以被其它变量复用。当然如果需要复用，那我们的垃圾回收自然就不会去动这些内存。

#### 3.3.6 虚拟机堆的概念

JVM 内存会划分为堆内存和非堆内存，堆内存中也会划分为**年轻代**和**老年代**，而非堆内存则为**永久代**。年轻代又会分为**Eden**和**Survivor**区。Survivor 也会分为**FromPlace**和**ToPlace**，toPlace 的 survivor 区域是空的。Eden，FromPlace 和 ToPlace 的默认占比为 **8:1:1**。当然这个东西其实也可以通过一个 -XX:+UsePSAdaptiveSurvivorSizePolicy 参数来根据生成对象的速率动态调整

堆内存中存放的是对象，垃圾收集就是收集这些对象然后交给 GC 算法进行回收。非堆内存其实我们已经说过了，就是方法区。在 1.8 中已经移除永久代，替代品是一个元空间(MetaSpace)，最大区别是 metaSpace 是不存在于 JVM 中的，它使用的是本地内存。并有两个参数

```plain
MetaspaceSize：初始化元空间大小，控制发生GC
MaxMetaspaceSize：限制元空间大小上限，防止占用过多物理内存。
```

移除的原因可以大致了解一下：融合 HotSpot JVM 和 JRockit VM 而做出的改变，因为 JRockit 是没有永久代的，不过这也间接性地解决了永久代的 OOM 问题。

#### 3.3.7 Eden 年轻代的介绍

当我们 new 一个对象后，会先放到 Eden 划分出来的一块作为存储空间的内存，但是我们知道对堆内存是线程共享的，所以有可能会出现两个对象共用一个内存的情况。这里 JVM 的处理是为每个线程都预先申请好一块连续的内存空间并规定了对象存放的位置，而如果空间不足会再申请多块内存空间。这个操作我们会称作 TLAB，有兴趣可以了解一下。

当 Eden 空间满了之后，会触发一个叫做 Minor GC（就是一个发生在年轻代的 GC）的操作，存活下来的对象移动到 Survivor0 区。~~Survivor0 区满后触发 Minor GC，就会将存活对象移动到 Survivor1 区~~，此时还会把 from 和 to 两个指针交换，这样保证了一段时间内总有一个 survivor 区为空且 to 所指向的 survivor 区为空。经过多次的 Minor GC 后仍然存活的对象（**这里的存活判断是 15 次，对应到虚拟机参数为 -XX:MaxTenuringThreshold 。为什么是 15，因为 HotSpot 会在对象头中的标记字段里记录年龄，分配到的空间仅有 4 位，所以最多只能记录到 15**）会移动到老年代。

> 🐛 修正：当 Eden 区内存空间满了的时候，就会触发 Minor GC，Survivor0 区满不会触发 Minor GC 。
>
> **那 Survivor0 区 的对象什么时候垃圾回收呢？**
>
> 假设 Survivor0 区现在是满的，此时又触发了 Minor GC ，发现 Survivor0 区依旧是满的，存不下，此时会将 S0 区与 Eden 区的对象一起进行可达性分析，找出活跃的对象，将它复制到 S1 区并且将 S0 区域和 Eden 区的对象给清空，这样那些不可达的对象进行清除，并且将 S0 区 和 S1 区交换。

老年代是存储长期存活的对象的，占满时就会触发我们最常听说的 Full GC，期间会停止所有线程等待 GC 的完成。所以对于响应要求高的应用应该尽量去减少发生 Full GC 从而避免响应超时的问题。

而且当老年区执行了 full gc 之后仍然无法进行对象保存的操作，就会产生 OOM，这时候就是虚拟机中的堆内存不足，原因可能会是堆内存设置的大小过小，这个可以通过参数-Xms、-Xmx 来调整。也可能是代码中创建的对象大且多，而且它们一直在被引用从而长时间垃圾收集无法收集它们。

![](https://static001.geekbang.org/infoq/39/398255141fde8ba208f6c99f4edaa9fe.png)

Supplementary note: Regarding the -XX:TargetSurvivorRatio parameter. In fact, it is not necessary to meet -XX:MaxTenuringThreshold before moving to the old generation. An example can be given: For example, objects with age 5 account for 30%, objects with age 6 account for 36%, and objects with age 7 account for 34%. After adding a certain age group (such as age 6 in the example), the total occupied space exceeds Survivor space\*TargetSurvivorRatio. Objects starting from this age group and older will enter the old generation (that is, the age 6 object in the example is age 6 and age 7). promoted to the old generation), at this time there is no need to wait for the 15 required in MaxTenuringThreshold

#### 3.3.8 How to determine whether an object needs to be killed

![](https://static001.geekbang.org/infoq/1b/1ba7f3cff6e07c6e9c6765cc4ef74997.png)

In the figure, the program counter, virtual machine stack, and local method stack are three areas that survive as the thread survives. Memory allocation and deallocation are deterministic. The memory is naturally recycled as the thread ends, so there is no need to consider garbage collection. The Java heap and method area are different. They are shared by each thread, and memory allocation and recycling are dynamic. Therefore, the garbage collector focuses on the heap and method memory.

Before recycling, it is necessary to determine which objects are still alive and which have died. Here are two basic calculation methods:

1. Reference counter calculation: Add a reference counter to the object. Each time the object is referenced, the counter increases by one, and when the reference expires, it decreases by one. When the counter equals 0, it will not be used again. However, there is a situation with this method that the GC cannot recycle when there is a circular reference to the object.

2. Reachability analysis and calculation: This is an implementation similar to a binary tree. A series of GC ROOTS are used as the starting set of surviving objects. Search downward from this node. The path traveled by the search becomes a reference chain, and objects that can be referenced by the set are added to the set. Searching for an object when it does not use any reference chain to GC Roots means that the object is unavailable. Mainstream commercial programming languages, such as Java, C#, etc., all rely on this method to determine whether an object is alive.

(Just learn about it) In the Java language, the objects that can be used as GC Roots are divided into the following types:

1. Objects (local variables) referenced in the virtual machine stack (local method table in the stack frame)
2. The object referenced by the static variable in the method area (static variable)
3. Objects referenced by constants in the method area
4. Objects referenced by JNI in the native method stack (i.e. native-modified methods) (JNI is the way for the Java virtual machine to call the corresponding C function. New Java objects can also be created through JNI functions. And JNI’s local references or global references to objects will mark the objects they point to as non-recyclable)
5. Java threads that have been started and not terminated

The advantage of this method is that it can solve the problem of circular references, but its implementation requires a lot of resources and time, and also requires GC (the reference relationship of its analysis process cannot change, so all processes need to be stopped)

#### 3.3.9 How to declare the true death of an object

The first thing that must be mentioned is a method called **finalize()**

finalize() is a method of the Object class. The finalize() method of an object will only be automatically called once by the system. Objects that escape death through the finalize() method will not be called again for the second time.

One additional sentence: It is not recommended to call finalize() in the program to save yourself. It is recommended to forget about the existence of this method in Java programs. Because its execution time is uncertain, and even whether it is executed is uncertain (abnormal exit of the Java program), and the running cost is high, and the calling order of each object cannot be guaranteed (even called in different threads). It has been marked as **deprecated** in Java9, and it has been gradually replaced in `java.lang.ref.Cleaner` (that is, the set of strong, soft, weak, and phantom references), which will be more lightweight and reliable than `finalize`.

![](https://static001.geekbang.org/infoq/8d/8d7f0381c7d857c7ceb8ae5a5fef0f4a.png)

Determining the death of an object requires at least two markings

1. If the object does not find a reference chain connected to GC Roots after the reachability analysis, it will be marked for the first time and filtered once. The condition of judgment is to determine whether it is necessary for this object to execute the finalize() method. If it is necessary for the object to execute the finalize() method, it will be placed in the F-Queue queue.
2. GC marks the objects in the F-Queue queue twice. If the object is re-associated with any object on the reference chain in the finalize() method, it will be removed from the "soon to be recycled" collection during the second marking. If the object has not escaped successfully at this time, it can only be recycled.

If it is determined that the object is dead, how should we recycle the garbage?

### 3.4 Garbage collection algorithm

For a detailed introduction to common garbage collection algorithms, it is recommended to read this article: [JVM Garbage Collection Detailed Explanation (Key Points)](https://javaguide.cn/java/jvm/jvm-garbage-collection.html).

### 3.5 (Understand) various garbage collectors

Garbage collector in HotSpot VM and applicable scenarios

![](https://static001.geekbang.org/infoq/9f/9ff72176ab0bf58bc43e142f69427379.png)

As of jdk8, the default garbage collectors are Parallel Scavenge and Parallel Old

Starting from jdk9, the G1 collector becomes the default garbage collector
At present, the G1 collector has the shortest pause time and no obvious shortcomings, making it very suitable for web applications. When testing a web application in jdk8, with a heap memory of 6G and a new generation of 4.5G, Parallel Scavenge pauses for recycling the new generation for up to 1.5 seconds. The G1 collector only pauses for 0.2 seconds to collect the new generation of the same size.

### 3.6 (Understand) Common parameters of JVM

There are many JVM parameters. Here are just a few of the more important ones. This information can also be obtained through various search engines.

| Parameter name | Meaning | Default value | Description |
| -------------------------- | ---------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || -Xms | Initial heap size | 1/64 of physical memory (<1GB) | By default (the MinHeapFreeRatio parameter can be adjusted) when the free heap memory is less than 40%, the JVM will increase the heap until the maximum limit of -Xmx. |
| -Xmx | Maximum heap size | 1/4 of physical memory (<1GB) | By default (MaxHeapFreeRatio parameter can be adjusted) when the free heap memory is greater than 70%, the JVM will reduce the heap until the minimum limit of -Xms |
| -Xmn | Young generation size (1.4 or later) | | Note: The size here is (eden+ 2 survivor space). It is different from the New gen shown in jmap -heap. The size of the entire heap = the size of the young generation + the size of the old generation + the size of the persistent generation (permanent generation). After increasing the young generation, the size of the old generation will be reduced. This value has a greater impact on system performance. Sun officially recommends a configuration of 3/8 of the entire heap |
| -XX:NewSize | Set the young generation size (for 1.3/1.4) | | |
| -XX:MaxNewSize | Young generation maximum size (for 1.3/1.4) | | |
| -XX:PermSize | Set the initial value of the persistent generation (perm gen) | 1/64 of physical memory | || -XX:MaxPermSize | Set the maximum size of the persistent generation | 1/4 of the physical memory | |
| -Xss | Stack size of each thread | | After JDK5.0, the stack size of each thread is 1M. In the past, the stack size of each thread was 256K. Adjust according to the memory size required by the thread of the application. Under the same physical memory, reducing this value can generate more threads. However, the operating system still has a limit on the number of threads in a process and cannot be generated infinitely. The experience value is around 3000~5000 for general small applications. If the stack is not very deep, it should be 128k is sufficient, and 256k is recommended for large applications. This option has a greater impact on performance and requires rigorous testing. (Principal) The explanation of the threadstacksize option is very similar. The official document does not seem to have an explanation. There is a sentence in the forum: -Xss is translated in a VM flag named ThreadStackSize" Generally, setting this value is enough |
| -XX:NewRatio | The ratio of the young generation (including Eden and two Survivor areas) to the old generation (excluding the persistent generation) | | -XX:NewRatio=4 means that the ratio of the young generation to the old generation is 1:4. The young generation accounts for 1/5 of the entire stack. Xms=Xmx and when Xmn is set, this parameter does not need to be set.                                                                                                                                                                                                                                                                                                                                                                                      |
| -XX:SurvivorRatio | The size ratio of the Eden area to the Survivor area | | Set to 8, then the ratio of two Survivor areas to one Eden area is 2:8, and one Survivor area accounts for 1/10 of the entire young generation |
| -XX:+DisableExplicitGC | Turn off System.gc() | | This parameter requires strict testing |
| -XX:PretenureSizeThreshold | The object that exceeds the size is allocated directly in the old generation | 0 | Unit byte is invalid when the new generation uses Parallel ScavengeGC. Another situation where it is allocated directly in the old generation is a large array object, and there are no external reference objects in the array. |
| -XX:ParallelGCThreads | The number of parallel collector threads | | This value is best configured to be equal to the number of processors. Also applies to CMS || -XX:MaxGCPauseMillis | The maximum time (maximum pause time) for each young generation garbage collection | | If this time cannot be met, the JVM will automatically adjust the young generation size to meet this value. |

In fact, there are some printing and CMS parameters, so I won’t list them all here.

## 4. Some aspects of JVM tuning

Based on the knowledge points of jvm just mentioned, we can try to tune the JVM, mainly the heap memory.

The size of the data area shared by all threads = the size of the young generation + the size of the old generation + the size of the persistent generation. The persistent generation generally has a fixed size of 64m. Therefore, after increasing the young generation in the Java heap, the size of the old generation will be reduced (because the old generation is cleaned using fullgc, so if the old generation is too small, the number of fullgc will increase). This value has a great impact on system performance. Sun officially recommends a configuration of 3/8 of the Java heap.

### 4.1 Adjust the maximum heap memory and minimum heap memory

-Xmx –Xms: Specify the maximum java heap size (the default value is 1/4 (<1GB) of physical memory) and the initial java heap minimum size (the default value is 1/64 (<1GB) of physical memory)

By default (the MinHeapFreeRatio parameter can be adjusted) when the free heap memory is less than 40%, the JVM will increase the heap until the maximum limit of -Xmx. By default (the MaxHeapFreeRatio parameter can be adjusted) when the free heap memory is greater than 70%, the JVM will reduce the heap until the minimum limit of -Xms. To put it simply, you keep throwing data into the heap memory. When the remaining size is less than 40%, the JVM will dynamically apply for memory space but it will be less than -Xmx. If the remaining size is greater than 70%, it will dynamically shrink it but not less than -Xms. It's that simple

During the development process, the two parameters -Xms and -Xmx are usually configured to the same value. The purpose is to avoid wasting resources by re-dividing and calculating the size of the heap area after the Java garbage collection mechanism cleans up the heap area.

We execute the following code

```java
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M"); //The maximum space of the system
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M"); //Free space of the system
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M"); //The total space currently available
```

Note: What is set here is the Java heap size, which is the size of the new generation + the size of the old generation.

![](https://static001.geekbang.org/infoq/11/114f32ddd295b2e30444f42f6180538c.png)

Set the parameters of a VM options

```plain
-Xmx20m -Xms5m -XX:+PrintGCDetails
```

![](https://static001.geekbang.org/infoq/7e/7ea0bf0dec20e44bf95128c571d6ef0e.png)

Start the main method again

![](https://static001.geekbang.org/infoq/c8/c89edbd0a147a791cfabdc37923c6836.png)

Here the GC pops up an Allocation Failure. This happens in PSYoungGen, which is the young generation.

The memory applied for at this time is 18M, and the free memory is 4.214195251464844M

Let's create a byte array at this time and execute the following code

```java
byte[] b = new byte[1 * 1024 * 1024];
System.out.println("1M space allocated to array");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M"); //The maximum space of the system
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M"); //Free space of the system
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");
```

![](https://static001.geekbang.org/infoq/db/dbeb6aea0a90949f7d7fe4746ddb11a3.png)

At this time, free memory has shrunk again, but total memory has not changed. Java will try its best to maintain the value of total mem at the minimum heap memory size

```java
byte[] b = new byte[10 * 1024 * 1024];
System.out.println("10M space allocated to array");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M"); //The maximum space of the system
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M"); //Free space of the system
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M"); //The total space currently available
```

![](https://static001.geekbang.org/infoq/b6/b6a7c522166dbd425dbb06eb56c9b071.png)

At this time we created a 10M byte data, which the minimum heap memory cannot hold. We will find that the total memory now has become 15M, which is the result of having applied for memory once.

At this point let’s run this code again

```java
System.gc();
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M"); //The maximum space of the system
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M"); //Free space of the system
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M"); //The total space currently available
```

![](https://static001.geekbang.org/infoq/8d/8dd6e8fccfd1394b83251c136ee44ceb.png)

At this time, we manually executed fullgc. At this time, the memory space of total memory changed back to 5.5M. At this time, the applied memory was released again.

### 4.2 Adjust the ratio between the new generation and the old generation

```plain
-XX:NewRatio --- The ratio between the new generation (eden+2\*Survivor) and the old generation (excluding permanent areas)

For example: -XX:NewRatio=4, means new generation:old generation=1:4, that is, the new generation occupies 1/5 of the entire heap. In the case of Xms=Xmx and Xmn is set, this parameter does not need to be set.
```

### 4.3 Adjust the ratio of Survivor area and Eden area

```plain
-XX:SurvivorRatio (survivor generation)---Set the ratio of two Survivor areas and eden

For example: 8 means two Survivors:eden=2:8, that is, one Survivor accounts for 1/10 of the young generation.
```### 4.4 Set the size of the young generation and old generation

```plain
-XX:NewSize --- Set the young generation size
-XX:MaxNewSize --- Set the maximum size of the young generation
```

You can test different situations by setting different parameters. Anyway, the optimal solution is of course that the official ratio of Eden and Survivor is 8:1:1. And when these parameters were just introduced, some instructions were included. If you are interested, you can also take a look. Anyway, if the values ​​of the maximum heap memory and the minimum heap memory are different, it will cause multiple gcs, so you need to pay attention.

### 4.5 Summary

Adjust the sizes of the new generation and the survivor generation according to actual conditions. The official recommendation is that the new generation accounts for 3/8 of the Java heap, and the survivor generation accounts for 1/10 of the new generation.

When OOM occurs, remember to Dump out of the heap to ensure that on-site problems can be troubleshooted. You can output a .dump file through the following command. This file can use VisualVM or the Java VisualVM tool that comes with Java.

```plain
-Xmx20m -Xms5m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=The log path you want to output
```

Generally, we can also write scripts to notify us when OOM occurs. This can be solved by sending an email or restarting the program.

### 4.6 Permanent area settings

```plain
-XX:PermSize -XX:MaxPermSize
```

Initial space (default is 1/64 of physical memory) and maximum space (default is 1/4 of physical memory). In other words, when the jvm starts, the permanent area occupies a space of PermSize size from the beginning. If the space is not enough, it can continue to be expanded, but it cannot exceed MaxPermSize, otherwise OOM will occur.

Tips: If the heap space is not used up and OOM is thrown, it may be caused by the permanent area. The actual heap space occupied is very small, but an OOM will still be thrown when the permanent area overflows.

### 4.7 JVM stack parameter tuning

#### 4.7.1 Adjust the size of each thread stack space

You can pass -Xss: adjust the size of each thread stack space

After JDK5.0, the stack size of each thread is 1M. Previously, the stack size of each thread was 256K. Under the same physical memory, reducing this value can generate more threads. However, the operating system still has limits on the number of threads in a process and cannot be generated infinitely. The experience value is around 3000~5000.

#### 4.7.2 Set the thread stack size

```plain
-XXThreadStackSize:
Set the thread stack size (0 means use default stack size)
```

These parameters can be easily tested by writing your own program. Due to space issues, a demo will not be provided here.

### 4.8 (You can skip it directly) Introduction to other JVM parameters

There are many parameters of all kinds, so I won’t say that I have gone through them all, because in fact, I won’t say that I must go to the bottom of it.

#### 4.8.1 Set the size of the memory page

```plain
-XXThreadStackSize:
Set the size of the memory page. Do not set it too large, which will affect the size of the Perm.
```

#### 4.8.2 Set up fast optimization of primitive types

```plain
-XX:+UseFastAccessorMethods：
Set up quick optimizations for primitive types
```

#### 4.8.3 Set to turn off manual GC

```plain
-XX:+DisableExplicitGC：
Set to turn off System.gc() (this parameter requires strict testing)
```

#### 4.8.4 Set the maximum age of garbage

```plain
-XX:MaxTenuringThreshold
Set the maximum garbage age. If set to 0, the young generation objects will directly enter the old generation without passing through the Survivor area. For applications with a large number of old generations, the efficiency can be improved. If this value is set to a larger value, the young generation object will be copied multiple times in the Survivor area, which can increase the survival time of the object in the young generation and increase the probability of being recycled in the young generation. This parameter is only valid for serial GC.
```

#### 4.8.5 Speed up compilation

```plain
-XX:+AggressiveOpts
Speed up compilation
```

#### 4.8.6 Improve lock mechanism performance

```plain
-XX:+UseBiasedLocking
```

#### 4.8.7 Disabling garbage collection

```plain
-Xnoclassgc
```

#### 4.8.8 Set heap space survival time

```plain
-XX:SoftRefLRUPolicyMSPerMB
Set the survival time of SoftReference in each megabyte of heap free space. The default value is 1s.
```

#### 4.8.9 Set objects to be allocated directly in the old generation

```plain
-XX:PretenureSizeThreshold
Set the size of the object to be allocated directly in the old generation. The default value is 0.
```

#### 4.8.10 Set the proportion of TLAB in eden area

```plain
-XX:TLABWasteTargetPercent
Set the percentage of TLAB in the eden area. The default value is 1%.
```

#### 4.8.11 Set whether to give priority to YGC

```plain
-XX:+CollectGen0First
Whether to first YGC when setting FullGC, the default value is false.
```

## finally

I have been talking about this for a long time, and I have consulted various materials, including "In-depth Disassembly of Virtual Machines" and "Java Core Technology Interview Lectures" by Geek Time, Baidu, and summaries of some online courses I am studying. Hope it helps, thank you.

<!-- @include: @article-footer.snippet.md -->