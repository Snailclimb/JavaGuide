---
title: 虚拟线程常见问题总结
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: 虚拟线程,Virtual Threads,Project Loom,Java 21,平台线程,轻量级线程,并发,I/O 密集型,兼容性
  - - meta
    - name: description
      content: 总结 Java 21 虚拟线程的概念与实践，解析与平台线程关系、适用场景、优势与限制以及常见问题。
---

> 本文部分内容来自 [Lorin](https://github.com/Lorin-github) 的[PR](https://github.com/Snailclimb/JavaGuide/pull/2190)。

虚拟线程在 Java 21 正式发布，这是一项重量级的更新。

## 什么是虚拟线程？

虚拟线程（Virtual Thread）是 JDK 而不是 OS 实现的轻量级线程(Lightweight Process，LWP），由 JVM 调度。许多虚拟线程共享同一个操作系统线程，虚拟线程的数量可以远大于操作系统线程的数量。

## 虚拟线程和平台线程有什么关系？

在引入虚拟线程之前，`java.lang.Thread` 包已经支持所谓的平台线程（Platform Thread），也就是没有虚拟线程之前，我们一直使用的线程。JVM 调度程序通过平台线程（载体线程）来管理虚拟线程，一个平台线程可以在不同的时间执行不同的虚拟线程（多个虚拟线程挂载在一个平台线程上），当虚拟线程被阻塞或等待时，平台线程可以切换到执行另一个虚拟线程。

虚拟线程、平台线程和系统内核线程的关系图如下所示（图源：[How to Use Java 19 Virtual Threads](https://medium.com/javarevisited/how-to-use-java-19-virtual-threads-c16a32bad5f7)）：

![虚拟线程、平台线程和系统内核线程的关系](https://oss.javaguide.cn/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

关于平台线程和系统内核线程的对应关系多提一点：在 Windows 和 Linux 等主流操作系统中，Java 线程采用的是一对一的线程模型，也就是一个平台线程对应一个系统内核线程。Solaris 系统是一个特例，HotSpot VM 在 Solaris 上支持多对多和一对一。具体可以参考 R 大的回答: [JVM 中的线程模型是用户级的么？](https://www.zhihu.com/question/23096638/answer/29617153)。

## 虚拟线程有什么优点和缺点？

### 优点

- **非常轻量级**：可以在单个线程中创建成百上千个虚拟线程而不会导致过多的线程创建和上下文切换。
- **简化异步编程**： 虚拟线程可以简化异步编程，使代码更易于理解和维护。它可以将异步代码编写得更像同步代码，避免了回调地狱（Callback Hell）。
- **减少资源开销**： 由于虚拟线程是由 JVM 实现的，它能够更高效地利用底层资源，例如 CPU 和内存。虚拟线程的上下文切换比平台线程更轻量，因此能够更好地支持高并发场景。

### 缺点

- **不适用于计算密集型任务**： 虚拟线程适用于 I/O 密集型任务，但不适用于计算密集型任务，因为密集型计算始终需要 CPU 资源作为支持。
- **与某些第三方库不兼容**： 虽然虚拟线程设计时考虑了与现有代码的兼容性，但某些依赖平台线程特性的第三方库可能不完全兼容虚拟线程。

## 如何创建虚拟线程？

官方提供了以下四种方式创建虚拟线程：

1. 使用 `Thread.startVirtualThread()` 创建
2. 使用 `Thread.ofVirtual()` 创建
3. 使用 `ThreadFactory` 创建
4. 使用 `Executors.newVirtualThreadPerTaskExecutor()`创建

**1、使用 `Thread.startVirtualThread()` 创建**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    Thread.startVirtualThread(customThread);
  }
}

static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**2、使用 `Thread.ofVirtual()` 创建**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    // 创建不启动
    Thread unStarted = Thread.ofVirtual().unstarted(customThread);
    unStarted.start();
    // 创建直接启动
    Thread.ofVirtual().start(customThread);
  }
}
static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**3、使用 `ThreadFactory` 创建**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    ThreadFactory factory = Thread.ofVirtual().factory();
    Thread thread = factory.newThread(customThread);
    thread.start();
  }
}

static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**4、使用`Executors.newVirtualThreadPerTaskExecutor()`创建**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    executor.submit(customThread);
  }
}
static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

## 虚拟线程和平台线程性能对比

通过多线程和虚拟线程的方式处理相同的任务，对比创建的系统线程数和处理耗时。

**说明**：统计创建的系统线程中部分为后台线程（比如 GC 线程），两种场景下都一样，所以并不影响对比。

**测试代码**：

```java
public class VirtualThreadTest {
    static List<Integer> list = new ArrayList<>();
    public static void main(String[] args) {
        // 开启线程 统计平台线程数
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        scheduledExecutorService.scheduleAtFixedRate(() -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            ThreadInfo[] threadInfo = threadBean.dumpAllThreads(false, false);
            updateMaxThreadNum(threadInfo.length);
        }, 10, 10, TimeUnit.MILLISECONDS);

        long start = System.currentTimeMillis();
        // 虚拟线程
        ExecutorService executor =  Executors.newVirtualThreadPerTaskExecutor();
        // 使用平台线程
        // ExecutorService executor =  Executors.newFixedThreadPool(200);
        for (int i = 0; i < 10000; i++) {
            executor.submit(() -> {
                try {
                    // 线程睡眠 0.5 s，模拟业务处理
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ignored) {
                }
            });
        }
        executor.close();
        System.out.println("max：" + list.get(0) + " platform thread/os thread");
        System.out.printf("totalMillis：%dms\n", System.currentTimeMillis() - start);


    }
    // 更新创建的平台最大线程数
    private static void updateMaxThreadNum(int num) {
        if (list.isEmpty()) {
            list.add(num);
        } else {
            Integer integer = list.get(0);
            if (num > integer) {
                list.add(0, num);
            }
        }
    }
}
```

**请求数 10000 单请求耗时 1s**：

```plain
// Virtual Thread
max：22 platform thread/os thread
totalMillis：1806ms

// Platform Thread  线程数200
max：209 platform thread/os thread
totalMillis：50578ms

// Platform Thread  线程数500
max：509 platform thread/os thread
totalMillis：20254ms

// Platform Thread  线程数1000
max：1009 platform thread/os thread
totalMillis：10214ms

// Platform Thread  线程数2000
max：2009 platform thread/os thread
totalMillis：5358ms
```

**请求数 10000 单请求耗时 0.5s**：

```plain
// Virtual Thread
max：22 platform thread/os thread
totalMillis：1316ms

// Platform Thread  线程数200
max：209 platform thread/os thread
totalMillis：25619ms

// Platform Thread  线程数500
max：509 platform thread/os thread
totalMillis：10277ms

// Platform Thread  线程数1000
max：1009 platform thread/os thread
totalMillis：5197ms

// Platform Thread  线程数2000
max：2009 platform thread/os thread
totalMillis：2865ms
```

- 可以看到在密集 IO 的场景下，需要创建大量的平台线程异步处理才能达到虚拟线程的处理速度。
- 因此，在密集 IO 的场景，虚拟线程可以大幅提高线程的执行效率，减少线程资源的创建以及上下文切换。

**注意**：有段时间 JDK 一直致力于 Reactor 响应式编程来提高 Java 性能，但响应式编程难以理解、调试、使用，最终又回到了同步编程，最终虚拟线程诞生。

## 虚拟线程的底层原理是什么？

如果你想要详细了解虚拟线程实现原理，推荐一篇文章：[虚拟线程 - VirtualThread 源码透视](https://www.cnblogs.com/throwable/p/16758997.html)。

面试一般是不会问到这个问题的，仅供学有余力的同学进一步研究学习。
