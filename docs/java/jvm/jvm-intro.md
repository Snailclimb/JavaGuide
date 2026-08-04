---
title: 大白话带你认识 JVM
description: 用通俗方式介绍 JVM 的基本组成与类加载执行流程，帮助快速入门虚拟机原理。
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM 基础,类加载,方法区,堆栈,程序计数器,运行时数据区
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

那我们的 **JVM** 是不认识文本文件的，所以它需要一个 **编译**，让其成为一个它会读二进制文件的 **HelloWorld.class**

#### ① 类加载器

如果 **JVM** 想要执行这个 **.class** 文件，我们需要将其装进一个 **类加载器** 中，它就像一个搬运工一样，会把所有的 **.class** 文件全部搬进 JVM 里面来。

![](https://static001.geekbang.org/infoq/2f/2f012fde94376f43a25dbe1dd07e0dd8.png)

#### ② 方法区

**方法区** 是用于存放类似于元数据信息方面的数据的，比如类信息，常量，静态变量，编译后代码···等

类加载器将 .class 文件搬过来就是先丢到这一块上

#### ③ 堆

**堆** 主要存放对象实例和数组等数据，它和方法区都属于 **线程共享区域**。线程共享只表示多个线程可以访问这些区域，并不意味着区域本身“线程不安全”；是否存在数据竞争取决于程序如何访问其中的数据。

#### ④ 栈

**栈** 这是我们的代码运行空间。我们编写的每一个方法都会放到 **栈** 里面运行。

我们会听说过本地方法栈或 Java Native Interface（JNI）这两个名词。本地方法由 Java 之外的本地代码实现，常见实现语言是 C 或 C++，具体实现取决于虚拟机和本地库。

#### ⑤ 程序计数器

程序计数器记录当前线程正在执行的 JVM 指令地址；执行分支、循环、异常处理或线程切换后，虚拟机依靠它继续执行。它和栈一样属于 **线程私有** 区域。执行 native 方法时，规范不规定其取值。

![](https://static001.geekbang.org/infoq/c6/c602f57ea9297f50bbc265f1821d6263.png)

#### 小总结

1. Java 文件经过编译后变成 .class 字节码文件
2. 字节码文件通过类加载器被搬运到 JVM 虚拟机中
3. 虚拟机运行时数据区中，方法区和堆为线程共享区域；虚拟机栈、本地方法栈和程序计数器为线程私有区域。共享与否是内存区域的可见范围，不直接等同于线程安全或不安全

### 1.2 简单的代码例子

一个简单的学生类

![](https://static001.geekbang.org/infoq/12/12f0b239db65b8a95f0ce90e9a580e4d.png)

一个 main 方法

![](https://static001.geekbang.org/infoq/0c/0c6d94ab88a9f2b923f5fea3f95bc2eb.png)

执行 main 方法的步骤如下:

1. 编译好 App.java 后得到 App.class 后，执行 App.class，系统会启动一个 JVM 进程，从 classpath 路径中找到一个名为 App.class 的二进制文件，将 App 的类信息加载到运行时数据区的方法区内，这个过程叫做 App 类的加载
2. JVM 找到 App 的主程序入口，执行 main 方法
3. 这个 main 中的第一条语句为 Student student = new Student("tellUrDream")，就是让 JVM 创建一个 Student 对象，但是这个时候方法区中是没有 Student 类的信息的，所以 JVM 马上加载 Student 类，把 Student 类的信息放到方法区中
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
2. 准备：为类变量（`static` 字段）分配存储空间并设置默认初始值，例如 `static int a = 3` 在准备阶段通常先得到默认值 0，在初始化阶段再赋值为 3。具体存储位置属于虚拟机实现细节
3. 解析：虚拟机把运行时常量池中的符号引用转换为直接引用。源码中的 `import` 只是编译期名称解析机制，不是常量池符号引用；直接引用的具体表示也不一定是对象地址

#### 2.1.3 初始化

初始化其实就是执行类构造器方法的 `<clinit>()` 的过程，而且要保证执行前父类的 `<clinit>()` 方法执行完毕。这个方法由编译器收集，顺序执行所有类变量（static 修饰的成员变量）显式初始化和静态代码块中语句。此时准备阶段时的那个 `static int a` 由默认初始化的 0 变成了显式初始化的 3。 由于执行顺序缘故，初始化阶段类变量如果在静态代码块中又进行了更改，会覆盖类变量的显式初始化，最终值会为静态代码块中的赋值。

> 注意：字节码文件中初始化方法有两种，非静态资源初始化的 `<init>` 和静态资源初始化的 `<clinit>`，类构造器方法 `<clinit>()` 不同于类的构造器，这些方法都是字节码文件中只能给 JVM 识别的特殊方法。

#### 2.1.4 卸载

类卸载是指虚拟机回收不再可达的类元数据及其关联资源，通常要求定义该类的类加载器也不再可达。它不同于普通对象的垃圾回收，而且是否、何时卸载由虚拟机实现和垃圾收集器决定。

### 2.2 类加载器的加载顺序

以 JDK 8 的 HotSpot 为例，常见类加载器层次如下。JDK 9 模块化后 Extension ClassLoader 被 Platform ClassLoader 取代，`rt.jar` 也不再存在：

1. BootStrap ClassLoader：rt.jar
2. Extension ClassLoader: 加载扩展的 jar 包
3. App ClassLoader：指定的 classpath 下面的 jar 包
4. Custom ClassLoader：自定义的类加载器

### 2.3 双亲委派机制

当一个类收到了加载请求时，它是不会先自己去尝试加载的，而是委派给父类去完成，比如我现在要 new 一个 Person，这个 Person 是我们自定义的类，如果我们要加载它，就会先委派 App ClassLoader，只有当父类加载器都反馈自己无法完成这个请求（也就是父类加载器都没有找到加载所需的 Class）时，子类加载器才会自行尝试加载。

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

尝试运行当前类的 `main` 函数的时候，我们的代码肯定会报错。这是因为在加载的时候其实是找到了 rt.jar 中的 `java.lang.String`，然而发现这个里面并没有 `main` 方法。

## 三、运行时数据区

### 3.1 本地方法栈和程序计数器

比如说我们现在点开 Thread 类的源码，会看到它的 `start0` 方法带有 `native` 关键字修饰，而且不存在 Java 方法体。这类方法由 Java 之外的本地代码实现，常见实现语言是 C 或 C++；虚拟机使用本地方法栈支持 native 方法的执行。

程序计数器记录当前线程正在执行的 JVM 指令地址。它也是《Java 虚拟机规范》中唯一没有规定任何 `OutOfMemoryError` 情形的运行时数据区。字节码解释器通过改变程序计数器的值来选取下一条需要执行的字节码指令。

如果执行的是 native 方法，规范不规定程序计数器的取值。

### 3.2 方法区

方法区主要的作用是存放类的元数据信息，常量和静态变量···等。当它存储的信息过大时，会在无法满足内存分配时报错。

### 3.3 虚拟机栈和虚拟机堆

一句话便是：栈管运行，堆管存储。则虚拟机栈负责运行代码，而虚拟机堆负责存储数据。

#### 3.3.1 虚拟机栈的概念

它是 Java 方法执行的内存模型。每次方法调用都会创建栈帧，栈帧中包含局部变量表、操作数栈、动态链接和方法返回地址等信息，并且由线程独享。局部变量表是栈帧的一部分。

```java
public class Person{
    int a = 1;

    public void doSomething(){
        int b = 2;
    }
}
```

#### 3.3.2 虚拟机栈存在的异常

如果线程请求的栈的深度大于虚拟机栈的最大深度，就会报 **StackOverflowError**（这种错误经常出现在递归中）。Java 虚拟机也可以动态扩展，但随着扩展会不断地申请内存，当无法申请足够内存时就会报错 **OutOfMemoryError**。

#### 3.3.3 虚拟机栈的生命周期

对于栈来说，不存在垃圾回收。只要程序运行结束，栈的空间自然就会释放了。栈的生命周期和所处的线程是一致的。

这里补充一句：方法参数和方法内定义的基本类型变量、对象引用通常保存在当前栈帧的局部变量表中；对象实例通常分配在堆上。方法的字节码属于类元数据，不会作为“实例方法”分配在栈中。

#### 3.3.4 虚拟机栈的执行

栈帧并不是方法本身，而是一次方法调用所对应的运行时数据结构，用于保存局部变量表、操作数栈、动态链接等信息。方法的字节码和元数据不存放在虚拟机栈中。

栈中的数据都是以栈帧的格式存在，它是一个关于方法和运行期数据的数据集。比如我们执行一个方法 a，就会对应产生一个栈帧 A1，然后 A1 会被压入栈中。同理方法 b 会有一个 B1，方法 c 会有一个 C1，等到这个线程执行完毕后，栈会先弹出 C1，后 B1,A1。它是一个先进后出，后进先出原则。

#### 3.3.5 局部变量的复用

局部变量表用于存放方法参数和方法内部所定义的局部变量。它的容量是以 Slot 为最小单位，一个 slot 可以存放 32 位以内的数据类型。

虚拟机通过索引定位局部变量表中的 Slot。若局部变量表容量为 n，有效索引范围是 `[0, n)`；`long` 和 `double` 会占用两个连续 Slot。方法参数会按规范规定的顺序排列在局部变量表中。为了节省栈帧空间，当执行位置超出某个局部变量的作用范围后，其 Slot 可以被其他变量复用；局部变量表中仍被视为有效的对象引用会参与 GC Roots 扫描。

#### 3.3.6 虚拟机堆的概念

以 HotSpot 的分代垃圾收集器为例，堆通常划分为**年轻代**和**老年代**，年轻代又可以分为 **Eden** 和两个 **Survivor** 区。一次复制过程中，一个 Survivor 区作为 from，另一个作为 to。Eden 与单个 Survivor 区的默认比例通常为 **8:1:1**，但实际大小可能受所用收集器和自适应策略影响。永久代则是 JDK 7 及以前 HotSpot 对方法区的一种实现，并不等同于全部“非堆内存”。

堆内存中主要存放对象，垃圾收集器会判断并回收其中不可达的对象。HotSpot 所称的非堆内存不只包含方法区的实现，还包括 Code Cache 等区域。JDK 8 移除永久代后，类元数据改由 JVM 管理的元空间（Metaspace）保存；元空间使用本地内存，而不是 Java 堆。相关参数包括：

```plain
MetaspaceSize：触发元数据 GC 的初始高水位阈值，之后 JVM 会动态调整
MaxMetaspaceSize：限制元空间大小上限
```

移除永久代后，不会再出现由永久代耗尽导致的 `java.lang.OutOfMemoryError: PermGen space`。但元空间仍可能因类元数据过多或达到 `MaxMetaspaceSize` 等限制而抛出 `OutOfMemoryError: Metaspace`。

#### 3.3.7 Eden 年轻代的介绍

当我们 new 一个对象后，会先放到 Eden 划分出来的一块作为存储空间的内存，但是我们知道对堆内存是线程共享的，所以有可能会出现两个对象共用一个内存的情况。这里 JVM 的处理是为每个线程都预先申请好一块连续的内存空间并规定了对象存放的位置，而如果空间不足会再申请多块内存空间。这个操作我们会称作 TLAB，有兴趣可以了解一下。

当 Eden 空间不足以继续分配对象时，通常会触发 Minor GC（即发生在年轻代的 GC），存活对象可能被复制到 Survivor 区或直接晋升到老年代。复制完成后，from 和 to 两个 Survivor 区会交换角色。对象年龄达到晋升阈值后可以进入老年代；在常见 HotSpot 分代收集器中，`-XX:MaxTenuringThreshold` 的默认值通常是 15，但实际晋升年龄还会受到动态年龄判断、Survivor 空间容量和收集器策略影响，并非所有对象都固定经历 15 次 Minor GC。

> 🐛 修正：当 Eden 区内存空间满了的时候，就会触发 Minor GC，Survivor0 区满不会触发 Minor GC。
>
> **那 Survivor0 区 的对象什么时候垃圾回收呢？**
>
> 假设 Survivor0 区现在是满的，此时又触发了 Minor GC，发现 Survivor0 区依旧是满的，存不下，此时会将 S0 区与 Eden 区的对象一起进行可达性分析，找出活跃的对象，将它复制到 S1 区并且将 S0 区域和 Eden 区的对象给清空，这样那些不可达的对象进行清除，并且将 S0 区 和 S1 区交换。

老年代主要存储长期存活或直接晋升的对象。老年代空间不足可能触发老年代收集或 Full GC，具体行为取决于垃圾收集器；不同收集器的停顿范围也不相同，不能一概而论为全程停止所有应用线程。

而且当老年区执行了 full gc 之后仍然无法进行对象保存的操作，就会产生 OOM，这时候就是虚拟机中的堆内存不足，原因可能会是堆内存设置的大小过小，这个可以通过参数-Xms、-Xmx 来调整。也可能是代码中创建的对象大且多，而且它们一直在被引用从而长时间垃圾收集无法收集它们。

![](https://static001.geekbang.org/infoq/39/398255141fde8ba208f6c99f4edaa9fe.png)

补充说明：关于-XX:TargetSurvivorRatio 参数的问题。其实也不一定是要满足-XX:MaxTenuringThreshold 才移动到老年代。可以举个例子：如对象年龄 5 的占 30%，年龄 6 的占 36%，年龄 7 的占 34%，加入某个年龄段（如例子中的年龄 6）后，总占用超过 Survivor 空间\*TargetSurvivorRatio 的时候，从该年龄段开始及大于的年龄对象就要进入老年代（即例子中的年龄 6 对象，就是年龄 6 和年龄 7 晋升到老年代），这时候无需等到 MaxTenuringThreshold 中要求的 15

#### 3.3.8 如何判断一个对象需要被干掉

![](https://static001.geekbang.org/infoq/1b/1ba7f3cff6e07c6e9c6765cc4ef74997.png)

图中程序计数器、虚拟机栈、本地方法栈，3 个区域随着线程的生存而生存的。内存分配和回收都是确定的。随着线程的结束内存自然就被回收了，因此不需要考虑垃圾回收的问题。而 Java 堆和方法区则不一样，各线程共享，内存的分配和回收都是动态的。因此垃圾收集器所关注的都是堆和方法这部分内存。

在进行回收前就要判断哪些对象还存活，哪些已经死去。下面介绍两个基础的计算方法

1. 引用计数器计算：给对象添加一个引用计数器，每次引用这个对象时计数器加一，引用失效时减一，计数器等于 0 时就是不会再次使用的。不过这个方法有一种情况就是出现对象的循环引用时 GC 没法回收。

2. 可达性分析计算：从一系列 GC Roots 出发，沿对象之间的引用关系进行搜索，搜索所走过的路径称为引用链。对象之间的引用关系构成的是图，并不是二叉树。当一个对象与 GC Roots 之间不存在任何引用链时，则说明该对象不可达。主流的商用程序语言，例如 Java、C# 等，都会使用这种思路判断对象是否存活。

（了解一下即可）在 Java 语言汇总能作为 GC Roots 的对象分为以下几种：

1. 虚拟机栈（栈帧中的本地方法表）中引用的对象（局部变量）
2. 方法区中静态变量所引用的对象（静态变量）
3. 方法区中常量引用的对象
4. 本地方法栈（即 native 修饰的方法）中 JNI 引用的对象（JNI 是 Java 虚拟机调用对应的 C 函数的方式，通过 JNI 函数也可以创建新的 Java 对象。且 JNI 对于对象的局部引用或者全局引用都会把它们指向的对象都标记为不可回收）
5. 已启动的且未终止的 Java 线程

这种方法的优点是能够解决循环引用的问题。收集器需要在某些阶段获得一致的对象引用关系，通常会产生 Stop-The-World 停顿；现代并发收集器可将大量标记工作与应用线程并发执行，并不是整个可达性分析过程都要“停止所有进程”。

#### 3.3.9 如何宣告一个对象的真正死亡

首先必须要提到的是一个名叫 **finalize()** 的方法

`finalize()` 是 `Object` 类的一个方法。一个对象的 `finalize()` 方法至多会被系统自动调用一次；如果对象通过该方法重新建立了可达关系，下一次被判定为不可达时不会再次调用。

补充一句：并不提倡在程序中调用 `finalize()` 来进行自救。它的执行时间不确定，甚至不保证一定会执行，而且运行代价高昂，无法保证各个对象的调用顺序。`finalize()` 在 Java 9 中被弃用，并在 Java 18 中被标记为待移除。需要管理堆外资源时，可以根据场景使用 `try-with-resources` 或 `java.lang.ref.Cleaner`；`Cleaner` 本身并不是强、软、弱、幻象引用的统称。

![](https://static001.geekbang.org/infoq/8d/8d7f0381c7d857c7ceb8ae5a5fef0f4a.png)

对于重写了 `finalize()` 方法且该方法尚未执行过的对象，其处理过程通常被概括为两次标记：

1. 如果对象经过可达性分析后没有发现与 GC Roots 相连的引用链，它会被第一次标记并接受筛选。对于有必要执行 `finalize()` 方法的对象，HotSpot 可能会将对应的终结引用加入待处理队列，由 Finalizer 线程异步处理。
2. 如果对象在 `finalize()` 方法中重新与引用链上的对象建立了关联，后续垃圾收集会将其移出“即将回收”集合；否则，对象仍然可以被回收。这个过程不代表垃圾收集器会同步等待 `finalize()` 方法执行，也不保证该方法一定会被调用。

如果确定对象已经死亡，我们又该如何回收这些垃圾呢

### 3.4 垃圾回收算法

关于常见垃圾回收算法的详细介绍，建议阅读这篇：[JVM 垃圾回收详解（重点）](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)。

### 3.5（了解）各种各样的垃圾回收器

HotSpot VM 中的垃圾回收器，以及适用场景

![](https://static001.geekbang.org/infoq/9f/9ff72176ab0bf58bc43e142f69427379.png)

在常见的 JDK 8 Server HotSpot 配置中，默认组合通常是 Parallel Scavenge 和 Parallel Old；实际默认值仍可能受虚拟机实现、运行模式和平台影响。

JDK 9 将 G1 设为 Server HotSpot 的默认垃圾收集器。不同收集器在吞吐量、延迟、内存占用和 CPU 开销之间各有取舍，不能脱离应用负载和 JVM 配置断言某个收集器的停顿一定最短。

### 3.6（了解）JVM 的常用参数

JVM 的参数非常之多，这里只列举比较重要的几个，通过各种各样的搜索引擎也可以得知这些信息。

| 参数名称                     | 含义                                  | 说明                                                                      |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `-Xms`                       | 初始堆大小                            | 默认值由 HotSpot 的自适应策略根据运行环境计算，不宜写成固定的物理内存比例 |
| `-Xmx`                       | 最大堆大小                            | 默认值由 HotSpot 的自适应策略根据运行环境计算                             |
| `-Xmn`                       | 年轻代大小                            | 仅适用于具有固定年轻代概念的收集器；显式设置会限制自适应调整              |
| `-XX:NewSize`                | 年轻代初始大小                        | 仅对支持该参数的分代收集器有效                                            |
| `-XX:MaxNewSize`             | 年轻代最大值                          | 仅对支持该参数的分代收集器有效                                            |
| `-XX:PermSize`               | 永久代初始大小                        | 仅适用于 JDK 7 及以前的 HotSpot，JDK 8 已移除永久代                       |
| `-XX:MaxPermSize`            | 永久代最大值                          | 仅适用于 JDK 7 及以前的 HotSpot，JDK 8 已移除永久代                       |
| `-Xss`                       | 每个线程的栈大小                      | 默认值依赖平台和 JVM 版本，应结合线程数量、调用深度和测试结果设置         |
| `-XX:NewRatio`               | 老年代与年轻代的容量比                | 例如值为 4 时，老年代与年轻代为 4:1；是否生效取决于收集器                 |
| `-XX:SurvivorRatio`          | Eden 与单个 Survivor 区的容量比       | 例如值为 8 时，Eden:From:To 通常为 8:1:1；自适应策略可能调整实际大小      |
| `-XX:+DisableExplicitGC`     | 忽略 `System.gc()` 发出的显式 GC 请求 | 不等于关闭 JVM 的自动垃圾回收，使用前需要评估直接内存等场景               |
| `-XX:PretenureSizeThreshold` | 大对象直接进入老年代的阈值            | 是否支持和如何生效取决于垃圾收集器                                        |
| `-XX:ParallelGCThreads`      | Stop-The-World 并行阶段的 GC 线程数   | 默认值由 JVM 根据可用处理器数量等因素计算                                 |
| `-XX:MaxGCPauseMillis`       | 最大 GC 停顿时间目标                  | 这是软目标而不是硬性保证，具体效果取决于所用垃圾收集器                    |

其实还有一些打印及 CMS 方面的参数，这里就不以一一列举了

## 四、关于 JVM 调优的一些方面

根据刚刚涉及的 jvm 的知识点，我们可以尝试对 JVM 进行调优，主要就是堆内存那块

对于采用固定分代布局的收集器，Java 堆可近似看作年轻代与老年代之和；永久代或元空间不属于 Java 堆。在堆总大小固定时，增大年轻代会压缩老年代空间，但具体比例没有适用于所有应用的“官方最优值”，需要根据对象分配、存活情况和所用收集器进行测试。

### 4.1 调整最大堆内存和最小堆内存

`-Xmx` 和 `-Xms` 分别指定 Java 堆的最大值和初始值。未显式设置时，默认值由 HotSpot 根据 JVM 版本、可用内存、容器限制和运行环境自适应计算，不应按固定的物理内存比例估算。

HotSpot 可以在 `-Xms` 与 `-Xmx` 之间调整已提交堆空间，`MinHeapFreeRatio` 和 `MaxHeapFreeRatio` 是部分收集器用于控制 GC 后空闲比例的参数。实际扩缩容行为和默认比例取决于所用收集器、JDK 版本及自适应策略，不能统一概括为固定的 40% 和 70%。

将 `-Xms` 与 `-Xmx` 配置为相同值可以避免运行期间调整已提交堆大小，但会从启动时就保留较大的堆容量，是否采用仍应结合部署环境和负载评估。

我们执行下面的代码

```java
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

注意：此处设置的是 Java 堆大小，也就是新生代大小 + 老年代大小

![](https://static001.geekbang.org/infoq/11/114f32ddd295b2e30444f42f6180538c.png)

设置一个 VM options 的参数

```plain
-Xmx20m -Xms5m -XX:+PrintGCDetails
```

![](https://static001.geekbang.org/infoq/7e/7ea0bf0dec20e44bf95128c571d6ef0e.png)

再次启动 main 方法

![](https://static001.geekbang.org/infoq/c8/c89edbd0a147a791cfabdc37923c6836.png)

这里 GC 弹出了一个 Allocation Failure 分配失败，这个事情发生在 PSYoungGen，也就是年轻代中

这时候申请到的内存为 18M，空闲内存为 4.214195251464844M

我们此时创建一个字节数组看看，执行下面的代码

```java
byte[] b = new byte[1 * 1024 * 1024];
System.out.println("分配了1M空间给数组");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");
```

![](https://static001.geekbang.org/infoq/db/dbeb6aea0a90949f7d7fe4746ddb11a3.png)

此时 free memory 就又缩水了，不过 total memory 是没有变化的。Java 会尽可能将 total mem 的值维持在最小堆内存大小

```java
byte[] b = new byte[10 * 1024 * 1024];
System.out.println("分配了10M空间给数组");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

![](https://static001.geekbang.org/infoq/b6/b6a7c522166dbd425dbb06eb56c9b071.png)

这时候我们创建了一个 10M 的字节数据，这时候最小堆内存是顶不住的。我们会发现现在的 total memory 已经变成了 15M，这就是已经申请了一次内存的结果。

此时我们再跑一下这个代码

```java
System.gc();
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

![](https://static001.geekbang.org/infoq/8d/8dd6e8fccfd1394b83251c136ee44ceb.png)

此处调用 `System.gc()` 只是向 JVM 提交一次垃圾收集建议，并不保证一定执行 Full GC；截图中的这次运行确实触发了相应收集并缩小了已提交堆空间，但不同 JVM 参数和收集器下结果可能不同。

### 4.2 调整新生代和老年代的比值

```plain
-XX:NewRatio --- 新生代（eden+2\*Survivor）和老年代（不包含永久区）的比值

例如：-XX:NewRatio=4，表示新生代:老年代=1:4，即新生代占整个堆的 1/5。在 Xms=Xmx 并且设置了 Xmn 的情况下，该参数不需要进行设置。
```

### 4.3 调整 Survivor 区和 Eden 区的比值

```plain
-XX:SurvivorRatio（幸存代）--- 设置两个 Survivor 区和 eden 的比值

例如：8，表示两个 Survivor:eden=2:8，即一个 Survivor 占年轻代的 1/10
```

### 4.4 设置年轻代和老年代的大小

```plain
-XX:NewSize --- 设置年轻代大小
-XX:MaxNewSize --- 设置年轻代最大值
```

可以通过设置不同参数测试不同情况。Eden 与两个 Survivor 区的常见初始比例是 8:1:1，但这不是适用于所有应用和收集器的最优解；`-Xms` 与 `-Xmx` 不同也不意味着一定会导致多次 GC。

### 4.5 小总结

应根据实际负载、所用垃圾收集器和 GC 日志调整年轻代与 Survivor 区大小，不存在对所有应用都成立的固定推荐比例。

在 OOM 时，记得 Dump 出堆，确保可以排查现场问题。通过下面命令可以输出一个 `.dump` 文件，该文件可使用 VisualVM 等工具分析。VisualVM 从 JDK 9 起不再随 Oracle JDK 一起提供，需要单独安装。

```plain
-Xmx20m -Xms5m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=你要输出的日志路径
```

一般我们也可以通过编写脚本的方式来让 OOM 出现时给我们报个信，可以通过发送邮件或者重启程序等来解决。

### 4.6 永久区的设置（仅适用于 JDK 7 及以前的 HotSpot）

```plain
-XX:PermSize -XX:MaxPermSize
```

`PermSize` 设置永久代的初始大小，`MaxPermSize` 设置其上限；具体默认值与 JVM 版本和平台有关，不能统一写成固定的物理内存比例。JDK 8 及以后应关注元空间相关参数，而不是这两个永久代参数。

tips：如果堆空间没有用完也抛出了 OOM，有可能是永久区导致的。堆空间实际占用非常少，但是永久区溢出 一样抛出 OOM。

### 4.7 JVM 的栈参数调优

#### 4.7.1 调整每个线程栈空间的大小

可以通过-Xss：调整每个线程栈空间的大小

线程栈的默认大小取决于 JVM 版本、平台和运行模式，并不是 JDK 5 以后统一为 1 MB。在其他条件相同时，减小线程栈可以为更多平台线程留出地址空间，但线程数量还受操作系统限制，并且栈过小会增加 `StackOverflowError` 风险。

#### 4.7.2 设置线程栈的大小

```plain
-XX:ThreadStackSize=<size>：
设置线程栈的大小(0 means use default stack size)
```

这些参数都是可以通过自己编写程序去简单测试的，这里碍于篇幅问题就不再提供 demo 了

### 4.8（可以直接跳过了）JVM 其他参数介绍

形形色色的参数很多，就不会说把所有都扯个遍了，因为大家其实也不会说一定要去深究到底。

#### 4.8.1 设置大内存页的大小

```plain
-XX:LargePageSizeInBytes=<size>
```

该参数用于设置大内存页大小，是否生效取决于操作系统、JVM 构建和大页配置。

#### 4.8.2 历史参数 `UseFastAccessorMethods`

```plain
-XX:+UseFastAccessorMethods
```

该旧版 HotSpot 参数针对反射访问器优化，并非“原始类型的快速优化”；现代 JDK 已不再提供该参数。

#### 4.8.3 设置关闭手动 GC

```plain
-XX:+DisableExplicitGC：
设置关闭System.gc()(这个参数需要严格的测试)
```

#### 4.8.4 设置垃圾最大年龄

```plain
-XX:MaxTenuringThreshold
设置对象晋升年龄上限。设置为 0 时，支持该参数的分代收集器会让年轻代存活对象不经过 Survivor 区而直接晋升。增大该值可能让对象在 Survivor 区经历更多次复制，但实际晋升还受动态年龄判断、Survivor 容量和收集器策略影响。
```

并不是所有垃圾收集器都使用同样的分代和年龄晋升机制，是否生效应以当前收集器的文档为准。

#### 4.8.5 历史参数 `AggressiveOpts`

```plain
-XX:+AggressiveOpts
```

这是旧版 HotSpot 中用于启用实验性性能优化的参数，不能简单理解为“加快编译速度”，并且已在 JDK 12 中移除。

#### 4.8.6 历史参数 `UseBiasedLocking`

```plain
-XX:+UseBiasedLocking
```

偏向锁在 JDK 15 中默认关闭并被弃用，相关实现随后已从 HotSpot 移除，不应作为现代 JDK 的通用调优参数。

#### 4.8.7 禁用类卸载

```plain
-Xnoclassgc
```

该参数禁用的是类的垃圾回收，而不是对象垃圾回收。

#### 4.8.8 设置堆空间存活时间

```plain
-XX:SoftRefLRUPolicyMSPerMB
设置每兆堆空闲空间中SoftReference的存活时间，默认值是1s。
```

#### 4.8.9 设置对象直接分配在老年代

```plain
-XX:PretenureSizeThreshold
设置对象超过多大时直接在老年代分配，默认值是0。
```

#### 4.8.10 设置 TLAB 占 eden 区的比例

```plain
-XX:TLABWasteTargetPercent
设置TLAB占eden区的百分比，默认值是1% 。
```

## finally

真的扯了很久这东西，参考了多方的资料，有极客时间的《深入拆解虚拟机》和《Java 核心技术面试精讲》，也有百度，也有自己在学习的一些线上课程的总结。希望对你有所帮助，谢谢。

<!-- @include: @article-footer.snippet.md -->
