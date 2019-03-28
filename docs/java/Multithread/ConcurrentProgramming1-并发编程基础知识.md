# Java 并发基础知识

Java 并发的基础知识，可能会在笔试中遇到，技术面试中也可能以并发知识环节提问的第一个问题出现。比如面试官可能会问你：“谈谈自己对于进程和线程的理解，两者的区别是什么？”

**本节思维导图：**

![Java 并发基础知识](http://my-blog-to-use.oss-cn-beijing.aliyuncs.com/18-10-26/51390272.jpg)

## 一 进程和线程

进程和线程的对比这一知识点由于过于基础，所以在面试中很少碰到，但是极有可能会在笔试题中碰到。

常见的提问形式是这样的：**“什么是线程和进程?，请简要描述线程与进程的关系、区别及优缺点？ ”**。

### 1.1. 何为进程?

进程是程序的一次执行过程，是系统运行程序的基本单位，因此进程是动态的。系统运行一个程序即是一个进程从创建，运行到消亡的过程。

在Java中，当我们启动 main 函数时其实就是启动了一个 JVM 的进程，而 main 函数所在的线程就是这个进程中的一个线程，也称主线程。

如下图所示，在 windows 中通过查看任务管理器的方式，我们就可以清楚看到 window 当前运行的进程（.exe文件的运行）。

![进程](https://images.gitbook.cn/a0929b60-d133-11e8-88a4-5328c5b70145)

### 1.2 何为线程?

线程与进程相似，但线程是一个比进程更小的执行单位。一个进程在其执行的过程中可以产生多个线程。与进程不同的是同类的多个线程共享进程的**堆**和**方法区**资源，但每个线程有自己的**程序计数器**、**虚拟机栈**和**本地方法栈**，所以系统在产生一个线程，或是在各个线程之间作切换工作时，负担要比进程小得多，也正因为如此，线程也被称为轻量级进程。

Java 程序天生就是多线程程序，我们可以通过 JMX 来看一下一个普通的 Java 程序有哪些线程，代码如下。

```java
public class MultiThread {
	public static void main(String[] args) {
		// 获取Java线程管理MXBean
	ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
		// 不需要获取同步的monitor和synchronizer信息，仅获取线程和线程堆栈信息
		ThreadInfo[] threadInfos = threadMXBean.dumpAllThreads(false, false);
		// 遍历线程信息，仅打印线程ID和线程名称信息
		for (ThreadInfo threadInfo : threadInfos) {
			System.out.println("[" + threadInfo.getThreadId() + "] " + threadInfo.getThreadName());
		}
	}
}
```

上述程序输出如下（输出内容可能不同，不用太纠结下面每个线程的作用，只用知道 main 线程执行main方法即可）：

```
[5] Attach Listener //添加事件
[4] Signal Dispatcher // 分发处理给JVM信号的线程
[3] Finalizer //调用对象finalize方法的线程
[2] Reference Handler //清除reference线程
[1] main //main线程,程序入口
```

从上面的输出内容可以看出：**一个 Java 程序的运行是 main 线程和多个其他线程同时运行**。

### 1.3 从 JVM 角度说进程和线程之间的关系（重要） 	

#### 1.3.1 图解进程和线程的关系

下图是 Java 内存区域，通过下图我们从 JVM 的角度来说一下线程和进程之间的关系。如果你对  Java 内存区域(运行时数据区)这部分知识不太了解的话可以阅读一下我的这篇文章：[《可能是把Java内存区域讲的最清楚的一篇文章》](https://github.com/Snailclimb/JavaGuide/blob/master/Java相关/可能是把Java内存区域讲的最清楚的一篇文章.md)

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-3/JVM运行时数据区域.png)

从上图可以看出：一个进程中可以有多个线程，多个线程共享进程的**堆**和**方法区**资源，但是每个线程有自己的**程序计数器**、**虚拟机栈** 和 **本地方法栈**。

下面来思考这样一个问题：为什么**程序计数器**、**虚拟机栈**和**本地方法栈**是线程私有的呢？为什么堆和方法区是线程共享的呢？

#### 1.3.2 程序计数器为什么是私有的?

程序计数器主要有下面两个作用：

1. 字节码解释器通过改变程序计数器来依次读取指令，从而实现代码的流程控制，如：顺序执行、选择、循环、异常处理。
2. 在多线程的情况下，程序计数器用于记录当前线程执行的位置，从而当线程被切换回来的时候能够知道该线程上次运行到哪儿了。

需要注意的是，如果执行的是native方法，那么程序计数器记录的是undefined地址，只有执行的是Java代码时程序计数器记录的才是下一条指令的地址。

所以，程序计数器私有主要是为了**线程切换后能恢复到正确的执行位置**。

#### 1.3.3 虚拟机栈和本地方法栈为什么是私有的?

- **虚拟机栈：**每个 Java 方法在执行的同时会创建一个栈帧用于存储局部变量表、操作数栈、常量池引用等信息。从方法调用直至执行完成的过程，就对应着一个栈帧在 Java 虚拟机栈中入栈和出栈的过程。
- **本地方法栈：**和虚拟机栈所发挥的作用非常相似，区别是： **虚拟机栈为虚拟机执行 Java 方法 （也就是字节码）服务，而本地方法栈则为虚拟机使用到的 Native 方法服务。** 在 HotSpot 虚拟机中和 Java 虚拟机栈合二为一。

所以，为了**保证线程中的局部变量不被别的线程访问到**，虚拟机栈和本地方法栈是线程私有的。

#### 1.3.4 一句话简单了解堆和方法区

堆和方法区是所有线程共享的资源，其中堆是进程中最大的一块内存，主要用于存放新创建的对象(所有对象都在这里分配内存)，方法区主要用于存放已被加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。

## 二 多线程并发编程

### 2.1 并发与并行

- **并发：** 同一时间段，多个任务都在执行(单位时间内不一定同时执行)；
- **并行：**单位时间内，多个任务同时执行。

### 2.1 多线程并发编程详解

单CPU时代多个任务共享一个CPU，某一特定时刻只能有一个任务被执行，CPU会分配时间片给当前要执行的任务。当一个任务占用CPU时，其他任务就会被挂起。当占用CPU的任务的时间片用完后，才会由 CPU 选择下一个需要执行的任务。所以说，在单核CPU时代，多线程编程没有太大意义，反而会因为线程间频繁的上下文切换而带来额外开销。

但现在 CPU 一般都是多核，如果这个CPU是多核的话，那么进程中的不同线程可以使用不同核心，实现了真正意义上的并行运行。**那为什么我们不直接叫做多线程并行编程呢？**

**这是因为多线程在实际开发使用中，线程的个数往往多于CPU的个数，所以一般都称多线程并发编程而不是多线程并行编程。`**

### 2.2 为什么要多线程并发编程?

- **从计算机底层来说：**线程可以比作是轻量级的进程，是程序执行的最小单位,线程间的切换和调度的成本远远小于进程。另外，多核 CPU 时代意味着多个线程可以同时运行，这减少了线程上下文切换的开销。

- **从当代互联网发展趋势来说：**现在的系统动不动就要求百万级甚至千万级的并发量，而多线程并发编程正是开发高并发系统的基础，利用好多线程机制可以大大提高系统整体的并发能力以及性能。

## 三 线程的创建与运行

前两种实际上很少使用，一般都是用线程池的方式比较多一点。

### 3.1 继承 Thread 类的方式


```java
public class MyThread extends Thread {
	@Override
	public void run() {
		super.run();
		System.out.println("MyThread");
	}
}
```
Run.java

```java
public class Run {

	public static void main(String[] args) {
		MyThread mythread = new MyThread();
		mythread.start();
		System.out.println("运行结束");
	}

}

```
运行结果：
![结果](https://user-gold-cdn.xitu.io/2018/3/20/16243e80f22a2d54?w=161&h=54&f=jpeg&s=7380)

从上面的运行结果可以看出：线程是一个子任务，CPU以不确定的方式，或者说是以随机的时间来调用线程中的run方法。

### 3.2 实现Runnable接口的方式

推荐实现Runnable接口方式开发多线程，因为Java单继承但是可以实现多个接口。

MyRunnable.java

```java
public class MyRunnable implements Runnable {
	@Override
	public void run() {
		System.out.println("MyRunnable");
	}
}
```

Run.java

```java
public class Run {

	public static void main(String[] args) {
		Runnable runnable=new MyRunnable();
		Thread thread=new Thread(runnable);
		thread.start();
		System.out.println("运行结束！");
	}

}
```
运行结果：
![运行结果](https://user-gold-cdn.xitu.io/2018/3/20/16243f4373c6141a?w=137&h=46&f=jpeg&s=7316)

### 3.3 使用线程池的方式

使用线程池的方式也是最推荐的一种方式，另外，《阿里巴巴Java开发手册》在第一章第六节并发处理这一部分也强调到“线程资源必须通过线程池提供，不允许在应用中自行显示创建线程”。这里就不给大家演示代码了，线程池这一节会详细介绍到这部分内容。

## 四 线程的生命周期和状态

Java 线程在运行的生命周期中的指定时刻只可能处于下面6种不同状态的其中一个状态（图源《Java 并发编程艺术》4.1.4节）。

![Java线程的状态](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/19-1-29/Java%E7%BA%BF%E7%A8%8B%E7%9A%84%E7%8A%B6%E6%80%81.png)

线程在生命周期中并不是固定处于某一个状态而是随着代码的执行在不同状态之间切换。Java 线程状态变迁如下图所示（图源《Java 并发编程艺术》4.1.4节）：

![Java线程状态变迁](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/19-1-29/Java%20%E7%BA%BF%E7%A8%8B%E7%8A%B6%E6%80%81%E5%8F%98%E8%BF%81.png)



由上图可以看出：

线程创建之后它将处于 **NEW（新建）** 状态，调用 `start()` 方法后开始运行，线程这时候处于 **READY（可运行）** 状态。可运行状态的线程获得了 cpu 时间片（timeslice）后就处于 **RUNNING（运行）** 状态。

> 操作系统隐藏 Java虚拟机（JVM）中的 RUNNABLE 和 RUNNING 状态，它只能看到 RUNNABLE 状态（图源：[HowToDoInJava](https://howtodoinjava.com/)：[Java Thread Life Cycle and Thread States](https://howtodoinjava.com/java/multi-threading/java-thread-life-cycle-and-thread-states/)），所以 Java 系统一般将这两个状态统称为 **RUNNABLE（运行中）** 状态 。

![RUNNABLE-VS-RUNNING](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-3/RUNNABLE-VS-RUNNING.png)

当线程执行 `wait()`方法之后，线程进入 **WAITING（等待）**状态。进入等待状态的线程需要依靠其他线程的通知才能够返回到运行状态，而 **TIME_WAITING(超时等待)** 状态相当于在等待状态的基础上增加了超时限制，比如通过 `sleep（long millis）`方法或 `wait（long millis）`方法可以将 Java 线程置于 TIMED WAITING 状态。当超时时间到达后 Java 线程将会返回到 RUNNABLE 状态。当线程调用同步方法时，在没有获取到锁的情况下，线程将会进入到 **BLOCKED（阻塞）** 状态。线程在执行 Runnable 的` run() `方法之后将会进入到 **TERMINATED（终止）** 状态。

## 五 线程优先级

**理论上**来说系统会根据优先级来决定首先使哪个线程进入运行状态。当 CPU 比较闲的时候，设置线程优先级几乎不会有任何作用，而且很多操作系统压根不会不会理会你设置的线程优先级，所以不要让业务过度依赖于线程的优先级。

另外，**线程优先级具有继承特性**比如A线程启动B线程，则B线程的优先级和A是一样的。**线程优先级还具有随机性** 也就是说线程优先级高的不一定每一次都先执行完。

Thread类中包含的成员变量代表了线程的某些优先级。如**Thread.MIN_PRIORITY（常数1）**，**Thread.NORM_PRIORITY（常数5）**,**Thread.MAX_PRIORITY（常数10）**。其中每个线程的优先级都在**1** 到**10** 之间，在默认情况下优先级都是**Thread.NORM_PRIORITY（常数5）**。

**一般情况下，不会对线程设定优先级别，更不会让某些业务严重地依赖线程的优先级别，比如权重，借助优先级设定某个任务的权重，这种方式是不可取的，一般定义线程的时候使用默认的优先级就好了。**

**相关方法：**

```java
public final void setPriority(int newPriority) //为线程设定优先级
public final int getPriority() //获取线程的优先级
```
**设置线程优先级方法源码：**

```java
    public final void setPriority(int newPriority) {
        ThreadGroup g;
        checkAccess();
        //线程游戏优先级不能小于1也不能大于10，否则会抛出异常
        if (newPriority > MAX_PRIORITY || newPriority < MIN_PRIORITY) {
            throw new IllegalArgumentException();
        }
        //如果指定的线程优先级大于该线程所在线程组的最大优先级，那么该线程的优先级将设为线程组的最大优先级
        if((g = getThreadGroup()) != null) {
            if (newPriority > g.getMaxPriority()) {
                newPriority = g.getMaxPriority();
            }
            setPriority0(priority = newPriority);
        }
    }

```

## 六 守护线程和用户线程

**守护线程和用户线程简介:**

- **用户(User)线程：**运行在前台，执行具体的任务，如程序的主线程、连接网络的子线程等都是用户线程
- **守护(Daemon)线程：**运行在后台，为其他前台线程服务.也可以说守护线程是JVM中非守护线程的 **“佣人”**。一旦所有用户线程都结束运行，守护线程会随JVM一起结束工作.

main 函数所在的线程就是一个用户线程啊，main函数启动的同时在JVM内部同时还启动了好多守护线程，比如垃圾回收线程。

**那么守护线程和用户线程有什么区别呢？**

比较明显的区别之一是用户线程结束，JVM退出，不管这个时候有没有守护线程运行。而守护线程不会影响 JVM 的退出。

**注意事项：**

1.  `setDaemon(true)`必须在`start（）`方法前执行，否则会抛出 `IllegalThreadStateException` 异常
2.  在守护线程中产生的新线程也是守护线程
3.  不是所有的任务都可以分配给守护线程来执行，比如读写操作或者计算逻辑
4.  守护(Daemon)线程中不能依靠 finally 块的内容来确保执行关闭或清理资源的逻辑。因为我们上面也说过了一旦所有用户线程都结束运行，守护线程会随JVM一起结束工作，所以守护(Daemon)线程中的finally语句块可能无法被执行。



## 参考

- 《Java并发编程之美》
- 《Java并发编程的艺术》
- https://howtodoinjava.com/java/multi-threading/java-thread-life-cycle-and-thread-states/