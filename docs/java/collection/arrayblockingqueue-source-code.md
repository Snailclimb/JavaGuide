---
title: ArrayBlockingQueue 源码分析
category: Java
tag:
  - Java集合
head:
  - - meta
    - name: keywords
      content: ArrayBlockingQueue,阻塞队列,生产者消费者,有界队列,JUC,put,take,线程池,ReentrantLock,Condition
  - - meta
    - name: description
      content: 讲解 ArrayBlockingQueue 的有界阻塞队列实现与典型生产者-消费者使用，结合线程池工作队列分析锁与条件的并发设计。
---

## 阻塞队列简介

### 阻塞队列的历史

Java 阻塞队列的历史可以追溯到 JDK1.5 版本，当时 Java 平台增加了 `java.util.concurrent`，即我们常说的 JUC 包，其中包含了各种并发流程控制工具、并发容器、原子类等。这其中自然也包含了我们这篇文章所讨论的阻塞队列。

为了解决高并发场景下多线程之间数据共享的问题，JDK1.5 版本中出现了 `ArrayBlockingQueue` 和 `LinkedBlockingQueue`，它们是带有生产者-消费者模式实现的并发容器。其中，`ArrayBlockingQueue` 是有界队列，即添加的元素达到上限之后，再次添加就会被阻塞或者抛出异常。而 `LinkedBlockingQueue` 则由链表构成的队列，正是因为链表的特性，所以 `LinkedBlockingQueue` 在添加元素上并不会向 `ArrayBlockingQueue` 那样有着较多的约束，所以 `LinkedBlockingQueue` 设置队列是否有界是可选的(注意这里的无界并不是指可以添加任意数量的元素，而是说队列的大小默认为 `Integer.MAX_VALUE`，近乎于无限大)。

随着 Java 的不断发展，JDK 后续的几个版本又对阻塞队列进行了不少的更新和完善:

1. JDK1.6 版本:增加 `SynchronousQueue`，一个不存储元素的阻塞队列。
2. JDK1.7 版本:增加 `TransferQueue`，一个支持更多操作的阻塞队列。
3. JDK1.8 版本:增加 `DelayQueue`，一个支持延迟获取元素的阻塞队列。

### 阻塞队列的思想

阻塞队列就是典型的生产者-消费者模型，它可以做到以下几点:

1. 当阻塞队列数据为空时，所有的消费者线程都会被阻塞，等待队列非空。
2. 当生产者往队列里填充数据后，队列就会通知消费者队列非空，消费者此时就可以进来消费。
3. 当阻塞队列因为消费者消费过慢或者生产者存放元素过快导致队列填满时无法容纳新元素时，生产者就会被阻塞，等待队列非满时继续存放元素。
4. 当消费者从队列中消费一个元素之后，队列就会通知生产者队列非满，生产者可以继续填充数据了。

总结一下：阻塞队列就说基于非空和非满两个条件实现生产者和消费者之间的交互，尽管这些交互流程和等待通知的机制实现非常复杂，好在 Doug Lea 的操刀之下已将阻塞队列的细节屏蔽，我们只需调用 `put`、`take`、`offer`、`poll` 等 API 即可实现多线程之间的生产和消费。

这也使得阻塞队列在多线程开发中有着广泛的运用，最常见的例子无非是我们的线程池,从源码中我们就能看出当核心线程无法及时处理任务时，这些任务都会扔到 `workQueue` 中。

```java
public ThreadPoolExecutor(int corePoolSize,
                            int maximumPoolSize,
                            long keepAliveTime,
                            TimeUnit unit,
                            BlockingQueue<Runnable> workQueue,
                            ThreadFactory threadFactory,
                            RejectedExecutionHandler handler) {// ...}
```

## ArrayBlockingQueue 常见方法及测试

简单了解了阻塞队列的历史之后，我们就开始重点讨论本篇文章所要介绍的并发容器——`ArrayBlockingQueue`。为了后续更加深入的了解 `ArrayBlockingQueue`，我们不妨基于下面几个实例了解以下 `ArrayBlockingQueue` 的使用。

先看看第一个例子，我们这里会用两个线程分别模拟生产者和消费者，生产者生产完会使用 `put` 方法生产 10 个元素给消费者进行消费，当队列元素达到我们设置的上限 5 时，`put` 方法就会阻塞。
同理消费者也会通过 `take` 方法消费元素，当队列为空时，`take` 方法就会阻塞消费者线程。这里笔者为了保证消费者能够在消费完 10 个元素后及时退出。便通过倒计时门闩，来控制消费者结束，生产者在这里只会生产 10 个元素。当消费者将 10 个元素消费完成之后，按下倒计时门闩，所有线程都会停止。

```java
public class ProducerConsumerExample {

    public static void main(String[] args) throws InterruptedException {

        // 创建一个大小为 5 的 ArrayBlockingQueue
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // 创建生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    // 向队列中添加元素，如果队列已满则阻塞等待
                    queue.put(i);
                    System.out.println("生产者添加元素：" + i);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        CountDownLatch countDownLatch = new CountDownLatch(1);

        // 创建消费者线程
        Thread consumer = new Thread(() -> {
            try {
                int count = 0;
                while (true) {

                    // 从队列中取出元素，如果队列为空则阻塞等待
                    int element = queue.take();
                    System.out.println("消费者取出元素：" + element);
                    ++count;
                    if (count == 10) {
                        break;
                    }
                }

                countDownLatch.countDown();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        // 启动线程
        producer.start();
        consumer.start();

        // 等待线程结束
        producer.join();
        consumer.join();

        countDownLatch.await();

        producer.interrupt();
        consumer.interrupt();
    }

}
```

代码输出结果如下，可以看到只有生产者往队列中投放元素之后消费者才能消费，这也就意味着当队列中没有数据的时消费者就会阻塞，等待队列非空再继续消费。

```cpp
生产者添加元素：1
生产者添加元素：2
消费者取出元素：1
消费者取出元素：2
生产者添加元素：3
消费者取出元素：3
生产者添加元素：4
生产者添加元素：5
消费者取出元素：4
生产者添加元素：6
消费者取出元素：5
生产者添加元素：7
生产者添加元素：8
生产者添加元素：9
生产者添加元素：10
消费者取出元素：6
消费者取出元素：7
消费者取出元素：8
消费者取出元素：9
消费者取出元素：10
```

了解了 `put`、`take` 这两个会阻塞的存和取方法之后，我我们再来看看阻塞队列中非阻塞的入队和出队方法 `offer` 和 `poll`。

如下所示，我们设置了一个大小为 3 的阻塞队列，我们会尝试在队列用 offer 方法存放 4 个元素，然后再从队列中用 `poll` 尝试取 4 次。

```cpp
public class OfferPollExample {

    public static void main(String[] args) {
        // 创建一个大小为 3 的 ArrayBlockingQueue
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

        // 向队列中添加元素
        System.out.println(queue.offer("A"));
        System.out.println(queue.offer("B"));
        System.out.println(queue.offer("C"));

        // 尝试向队列中添加元素，但队列已满，返回 false
        System.out.println(queue.offer("D"));

        // 从队列中取出元素
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.poll());

        // 尝试从队列中取出元素，但队列已空，返回 null
        System.out.println(queue.poll());
    }

}
```

最终代码的输出结果如下，可以看到因为队列的大小为 3 的缘故，我们前 3 次存放到队列的结果为 true，第 4 次存放时，由于队列已满，所以存放结果返回 false。这也是为什么我们后续的 `poll` 方法只得到了 3 个元素的值。

```cpp
true
true
true
false
A
B
C
null
```

了解了阻塞存取和非阻塞存取，我们再来看看阻塞队列的一个比较特殊的操作，某些场景下，我们希望能够一次性将阻塞队列的结果存到列表中再进行批量操作，我们就可以使用阻塞队列的 `drainTo` 方法，这个方法会一次性将队列中所有元素存放到列表，如果队列中有元素，且成功存到 list 中则 `drainTo` 会返回本次转移到 list 中的元素数，反之若队列为空，`drainTo` 则直接返回 0。

```java
public class DrainToExample {

    public static void main(String[] args) {
        // 创建一个大小为 5 的 ArrayBlockingQueue
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // 向队列中添加元素
        queue.add(1);
        queue.add(2);
        queue.add(3);
        queue.add(4);
        queue.add(5);

        // 创建一个 List，用于存储从队列中取出的元素
        List<Integer> list = new ArrayList<>();

        // 从队列中取出所有元素，并添加到 List 中
        queue.drainTo(list);

        // 输出 List 中的元素
        System.out.println(list);
    }

}
```

代码输出结果如下

```cpp
[1, 2, 3, 4, 5]
```

## ArrayBlockingQueue 源码分析

自此我们对阻塞队列的使用有了基本的印象，接下来我们就可以进一步了解一下 `ArrayBlockingQueue` 的工作机制了。

### 整体设计

在了解 `ArrayBlockingQueue` 的具体细节之前，我们先来看看 `ArrayBlockingQueue` 的类图。

![ArrayBlockingQueue 类图](https://oss.javaguide.cn/github/javaguide/java/collection/arrayblockingqueue-class-diagram.png)

从图中我们可以看出，`ArrayBlockingQueue` 实现了阻塞队列 `BlockingQueue` 这个接口，不难猜出通过实现 `BlockingQueue` 这个接口之后，`ArrayBlockingQueue` 就拥有了阻塞队列那些常见的操作行为。

同时， `ArrayBlockingQueue` 还继承了 `AbstractQueue` 这个抽象类，这个继承了 `AbstractCollection` 和 `Queue` 的抽象类，从抽象类的特定和语义我们也可以猜出，这个继承关系使得 `ArrayBlockingQueue` 拥有了队列的常见操作。

所以我们是否可以得出这样一个结论，通过继承 `AbstractQueue` 获得队列所有的操作模板，其实现的入队和出队操作的整体框架。然后 `ArrayBlockingQueue` 通过实现 `BlockingQueue` 获取到阻塞队列的常见操作并将这些操作实现，填充到 `AbstractQueue` 模板方法的细节中，由此 `ArrayBlockingQueue` 成为一个完整的阻塞队列。

为了印证这一点，我们到源码中一探究竟。首先我们先来看看 `AbstractQueue`，从类的继承关系我们可以大致得出，它通过 `AbstractCollection` 获得了集合的常见操作方法，然后通过 `Queue` 接口获得了队列的特性。

```java
public abstract class AbstractQueue<E>
    extends AbstractCollection<E>
    implements Queue<E> {
       //...
}
```

对于集合的操作无非是增删改查，所以我们不妨从添加方法入手，从源码中我们可以看到，它实现了 `AbstractCollection` 的 `add` 方法，其内部逻辑如下:

1. 调用继承 `Queue` 接口得来的 `offer` 方法，如果 `offer` 成功则返回 `true`。
2. 如果 `offer` 失败，即代表当前元素入队失败直接抛异常。

```java
public boolean add(E e) {
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

而 `AbstractQueue` 中并没有对 `Queue` 的 `offer` 的实现，很明显这样做的目的是定义好了 `add` 的核心逻辑，将 `offer` 的细节交由其子类即我们的 `ArrayBlockingQueue` 实现。

到此，我们对于抽象类 `AbstractQueue` 的分析就结束了，我们继续看看 `ArrayBlockingQueue` 中实现的另一个重要接口 `BlockingQueue`。

点开 `BlockingQueue` 之后，我们可以看到这个接口同样继承了 `Queue` 接口，这就意味着它也具备了队列所拥有的所有行为。同时，它还定义了自己所需要实现的方法。

```java
public interface BlockingQueue<E> extends Queue<E> {

     //元素入队成功返回true，反之则会抛出异常IllegalStateException
    boolean add(E e);

     //元素入队成功返回true，反之返回false
    boolean offer(E e);

     //元素入队成功则直接返回，如果队列已满元素不可入队则将线程阻塞，因为阻塞期间可能会被打断，所以这里方法签名抛出了InterruptedException
    void put(E e) throws InterruptedException;

   //和上一个方法一样,只不过队列满时只会阻塞单位为unit，时间为timeout的时长，如果在等待时长内没有入队成功则直接返回false。
    boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException;

    //从队头取出一个元素，如果队列为空则阻塞等待，因为会阻塞线程的缘故，所以该方法可能会被打断，所以签名定义了InterruptedException
    E take() throws InterruptedException;

      //取出队头的元素并返回，如果当前队列为空则阻塞等待timeout且单位为unit的时长，如果这个时间段没有元素则直接返回null。
    E poll(long timeout, TimeUnit unit)
        throws InterruptedException;

      //获取队列剩余元素个数
    int remainingCapacity();

     //删除我们指定的对象，如果成功返回true，反之返回false。
    boolean remove(Object o);

    //判断队列中是否包含指定元素
    public boolean contains(Object o);

     //将队列中的元素全部存到指定的集合中
    int drainTo(Collection<? super E> c);

    //转移maxElements个元素到集合中
    int drainTo(Collection<? super E> c, int maxElements);
}
```

了解了 `BlockingQueue` 的常见操作后，我们就知道了 `ArrayBlockingQueue` 通过实现 `BlockingQueue` 的方法并重写后，填充到 `AbstractQueue` 的方法上，由此我们便知道了上文中 `AbstractQueue` 的 `add` 方法的 `offer` 方法是哪里是实现的了。

```java
public boolean add(E e) {
  //AbstractQueue的offer来自下层的ArrayBlockingQueue从BlockingQueue实现并重写的offer方法
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

### 初始化

了解 `ArrayBlockingQueue` 的细节前，我们不妨先看看其构造函数，了解一下其初始化过程。从源码中我们可以看出 `ArrayBlockingQueue` 有 3 个构造方法，而最核心的构造方法就是下方这一个。

```java
// capacity 表示队列初始容量，fair 表示 锁的公平性
public ArrayBlockingQueue(int capacity, boolean fair) {
  //如果设置的队列大小小于0，则直接抛出IllegalArgumentException
  if (capacity <= 0)
      throw new IllegalArgumentException();
  //初始化一个数组用于存放队列的元素
  this.items = new Object[capacity];
  //创建阻塞队列流程控制的锁
  lock = new ReentrantLock(fair);
  //用lock锁创建两个条件控制队列生产和消费
  notEmpty = lock.newCondition();
  notFull =  lock.newCondition();
}
```

这个构造方法里面有两个比较核心的成员变量 `notEmpty`(非空) 和 `notFull` （非满） ，需要我们格外留意，它们是实现生产者和消费者有序工作的关键所在，这一点笔者会在后续的源码解析中详细说明，这里我们只需初步了解一下阻塞队列的构造即可。

另外两个构造方法都是基于上述的构造方法，默认情况下，我们会使用下面这个构造方法，该构造方法就意味着 `ArrayBlockingQueue` 用的是非公平锁，即各个生产者或者消费者线程收到通知后，对于锁的争抢是随机的。

```java
 public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
    }
```

还有一个不怎么常用的构造方法，在初始化容量和锁的非公平性之后，它还提供了一个 `Collection` 参数，从源码中不难看出这个构造方法是将外部传入的集合的元素在初始化时直接存放到阻塞队列中。

```java
public ArrayBlockingQueue(int capacity, boolean fair,
                              Collection<? extends E> c) {
  //初始化容量和锁的公平性
  this(capacity, fair);

  final ReentrantLock lock = this.lock;
  //上锁并将c中的元素存放到ArrayBlockingQueue底层的数组中
  lock.lock();
  try {
      int i = 0;
      try {
                //遍历并添加元素到数组中
          for (E e : c) {
              checkNotNull(e);
              items[i++] = e;
          }
      } catch (ArrayIndexOutOfBoundsException ex) {
          throw new IllegalArgumentException();
      }
      //记录当前队列容量
      count = i;
                      //更新下一次put或者offer或用add方法添加到队列底层数组的位置
      putIndex = (i == capacity) ? 0 : i;
  } finally {
      //完成遍历后释放锁
      lock.unlock();
  }
}
```

### 阻塞式获取和新增元素

`ArrayBlockingQueue` 阻塞式获取和新增元素对应的就是生产者-消费者模型，虽然它也支持非阻塞式获取和新增元素（例如 `poll()` 和 `offer(E e)` 方法，后文会介绍到），但一般不会使用。

`ArrayBlockingQueue` 阻塞式获取和新增元素的方法为：

- `put(E e)`：将元素插入队列中，如果队列已满，则该方法会一直阻塞，直到队列有空间可用或者线程被中断。
- `take()` ：获取并移除队列头部的元素，如果队列为空，则该方法会一直阻塞，直到队列非空或者线程被中断。

这两个方法实现的关键就是在于两个条件对象 `notEmpty`(非空) 和 `notFull` （非满），这个我们在上文的构造方法中有提到。

接下来笔者就通过两张图让大家了解一下这两个条件是如何在阻塞队列中运用的。

![ArrayBlockingQueue 非空条件](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-take.png)

假设我们的代码消费者先启动，当它发现队列中没有数据，那么非空条件就会将这个线程挂起，即等待条件非空时挂起。然后 CPU 执行权到达生产者，生产者发现队列中可以存放数据，于是将数据存放进去，通知此时条件非空，此时消费者就会被唤醒到队列中使用 `take` 等方法获取值了。

![ArrayBlockingQueue 非满条件](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notFull-put.png)

随后的执行中，生产者生产速度远远大于消费者消费速度，于是生产者将队列塞满后再次尝试将数据存入队列，发现队列已满，于是阻塞队列就将当前线程挂起，等待非满。然后消费者拿着 CPU 执行权进行消费，于是队列可以存放新数据了，发出一个非满的通知，此时挂起的生产者就会等待 CPU 执行权到来时再次尝试将数据存到队列中。

简单了解阻塞队列的基于两个条件的交互流程之后，我们不妨看看 `put` 和 `take` 方法的源码。

```java
public void put(E e) throws InterruptedException {
    //确保插入的元素不为null
    checkNotNull(e);
    //加锁
    final ReentrantLock lock = this.lock;
    //这里使用lockInterruptibly()方法而不是lock()方法是为了能够响应中断操作，如果在等待获取锁的过程中被打断则该方法会抛出InterruptedException异常。
    lock.lockInterruptibly();
    try {
            //如果count等数组长度则说明队列已满，当前线程将被挂起放到AQS队列中，等待队列非满时插入（非满条件）。
       //在等待期间，锁会被释放，其他线程可以继续对队列进行操作。
        while (count == items.length)
            notFull.await();
           //如果队列可以存放元素，则调用enqueue将元素入队
        enqueue(e);
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

`put`方法内部调用了 `enqueue` 方法来实现元素入队，我们继续深入查看一下 `enqueue` 方法的实现细节：

```java
private void enqueue(E x) {
   //获取队列底层的数组
    final Object[] items = this.items;
    //将putindex位置的值设置为我们传入的x
    items[putIndex] = x;
    //更新putindex，如果putindex等于数组长度，则更新为0
    if (++putIndex == items.length)
        putIndex = 0;
    //队列长度+1
    count++;
    //通知队列非空，那些因为获取元素而阻塞的线程可以继续工作了
    notEmpty.signal();
}
```

从源码中可以看到入队操作的逻辑就是在数组中追加一个新元素，整体执行步骤为:

1. 获取 `ArrayBlockingQueue` 底层的数组 `items`。
2. 将元素存到 `putIndex` 位置。
3. 更新 `putIndex` 到下一个位置，如果 `putIndex` 等于队列长度，则说明 `putIndex` 已经到达数组末尾了，下一次插入则需要 0 开始。(`ArrayBlockingQueue` 用到了循环队列的思想，即从头到尾循环复用一个数组)
4. 更新 `count` 的值，表示当前队列长度+1。
5. 调用 `notEmpty.signal()` 通知队列非空，消费者可以从队列中获取值了。

自此我们了解了 `put` 方法的流程，为了更加完整的了解 `ArrayBlockingQueue` 关于生产者-消费者模型的设计，我们继续看看阻塞获取队列元素的 `take` 方法。

```java
public E take() throws InterruptedException {
       //获取锁
     final ReentrantLock lock = this.lock;
     lock.lockInterruptibly();
     try {
             //如果队列中元素个数为0，则将当前线程打断并存入AQS队列中，等待队列非空时获取并移除元素（非空条件）
         while (count == 0)
             notEmpty.await();
            //如果队列不为空则调用dequeue获取元素
         return dequeue();
     } finally {
          //释放锁
         lock.unlock();
     }
}
```

理解了 `put` 方法再看`take` 方法就很简单了，其核心逻辑和`put` 方法正好是相反的，比如`put` 方法在队列满的时候等待队列非满时插入元素（非满条件），而`take` 方法等待队列非空时获取并移除元素（非空条件）。

`take`方法内部调用了 `dequeue` 方法来实现元素出队，其核心逻辑和 `enqueue` 方法也是相反的。

```java
private E dequeue() {
  //获取阻塞队列底层的数组
  final Object[] items = this.items;
  @SuppressWarnings("unchecked")
  //从队列中获取takeIndex位置的元素
  E x = (E) items[takeIndex];
  //将takeIndex置空
  items[takeIndex] = null;
  //takeIndex向后挪动，如果等于数组长度则更新为0
  if (++takeIndex == items.length)
      takeIndex = 0;
  //队列长度减1
  count--;
  if (itrs != null)
      itrs.elementDequeued();
  //通知那些被打断的线程当前队列状态非满，可以继续存放元素
  notFull.signal();
  return x;
}
```

由于`dequeue` 方法（出队）和上面介绍的 `enqueue` 方法（入队）的步骤大致类似，这里就不重复介绍了。

为了帮助理解，我专门画了一张图来展示 `notEmpty`(非空) 和 `notFull` （非满）这两个条件对象是如何控制 `ArrayBlockingQueue` 的存和取的。

![ArrayBlockingQueue 非空非满](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-notFull.png)

- **消费者**：当消费者从队列中 `take` 或者 `poll` 等操作取出一个元素之后，就会通知队列非满，此时那些等待非满的生产者就会被唤醒等待获取 CPU 时间片进行入队操作。
- **生产者**：当生产者将元素存到队列中后，就会触发通知队列非空，此时消费者就会被唤醒等待 CPU 时间片尝试获取元素。如此往复，两个条件对象就构成一个环路，控制着多线程之间的存和取。

### 非阻塞式获取和新增元素

`ArrayBlockingQueue` 非阻塞式获取和新增元素的方法为：

- `offer(E e)`：将元素插入队列尾部。如果队列已满，则该方法会直接返回 false，不会等待并阻塞线程。
- `poll()`：获取并移除队列头部的元素，如果队列为空，则该方法会直接返回 null，不会等待并阻塞线程。
- `add(E e)`：将元素插入队列尾部。如果队列已满则会抛出 `IllegalStateException` 异常，底层基于 `offer(E e)` 方法。
- `remove()`：移除队列头部的元素，如果队列为空则会抛出 `NoSuchElementException` 异常，底层基于 `poll()`。
- `peek()`：获取但不移除队列头部的元素，如果队列为空，则该方法会直接返回 null，不会等待并阻塞线程。

先来看看 `offer` 方法，逻辑和 `put` 差不多，唯一的区别就是入队失败时不会阻塞当前线程，而是直接返回 `false`。

```java
public boolean offer(E e) {
        //确保插入的元素不为null
        checkNotNull(e);
        //获取锁
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
             //队列已满直接返回false
            if (count == items.length)
                return false;
            else {
                //反之将元素入队并直接返回true
                enqueue(e);
                return true;
            }
        } finally {
            //释放锁
            lock.unlock();
        }
    }
```

`poll` 方法同理，获取元素失败也是直接返回空，并不会阻塞获取元素的线程。

```java
public E poll() {
        final ReentrantLock lock = this.lock;
        //上锁
        lock.lock();
        try {
            //如果队列为空直接返回null，反之出队返回元素值
            return (count == 0) ? null : dequeue();
        } finally {
            lock.unlock();
        }
    }
```

`add` 方法其实就是对于 `offer` 做了一层封装，如下代码所示，可以看到 `add` 会调用没有规定时间的 `offer`，如果入队失败则直接抛异常。

```java
public boolean add(E e) {
        return super.add(e);
    }


public boolean add(E e) {
        //调用offer方法如果失败直接抛出异常
        if (offer(e))
            return true;
        else
            throw new IllegalStateException("Queue full");
    }
```

`remove` 方法同理，调用 `poll`，如果返回 `null` 则说明队列没有元素，直接抛出异常。

```java
public E remove() {
        E x = poll();
        if (x != null)
            return x;
        else
            throw new NoSuchElementException();
    }
```

`peek()` 方法的逻辑也很简单，内部调用了 `itemAt` 方法。

```java
public E peek() {
        //加锁
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            //当队列为空时返回 null
            return itemAt(takeIndex);
        } finally {
            //释放锁
            lock.unlock();
        }
    }

//返回队列中指定位置的元素
@SuppressWarnings("unchecked")
final E itemAt(int i) {
    return (E) items[i];
}
```

### 指定超时时间内阻塞式获取和新增元素

在 `offer(E e)` 和 `poll()` 非阻塞获取和新增元素的基础上，设计者提供了带有等待时间的 `offer(E e, long timeout, TimeUnit unit)` 和 `poll(long timeout, TimeUnit unit)` ，用于在指定的超时时间内阻塞式地添加和获取元素。

```java
 public boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException {

        checkNotNull(e);
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
        //队列已满，进入循环
            while (count == items.length) {
            //时间到了队列还是满的，则直接返回false
                if (nanos <= 0)
                    return false;
                 //阻塞nanos时间，等待非满
                nanos = notFull.awaitNanos(nanos);
            }
            enqueue(e);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

可以看到，带有超时时间的 `offer` 方法在队列已满的情况下，会等待用户所传的时间段，如果规定时间内还不能存放元素则直接返回 `false`。

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
          //队列为空，循环等待，若时间到还是空的，则直接返回null
            while (count == 0) {
                if (nanos <= 0)
                    return null;
                nanos = notEmpty.awaitNanos(nanos);
            }
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
```

同理，带有超时时间的 `poll` 也一样，队列为空则在规定时间内等待，若时间到了还是空的，则直接返回 null。

### 判断元素是否存在

`ArrayBlockingQueue` 提供了 `contains(Object o)` 来判断指定元素是否存在于队列中。

```java
public boolean contains(Object o) {
    //若目标元素为空，则直接返回 false
    if (o == null) return false;
    //获取当前队列的元素数组
    final Object[] items = this.items;
    //加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 如果队列非空
        if (count > 0) {
            final int putIndex = this.putIndex;
            //从队列头部开始遍历
            int i = takeIndex;
            do {
                if (o.equals(items[i]))
                    return true;
                if (++i == items.length)
                    i = 0;
            } while (i != putIndex);
        }
        return false;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

## ArrayBlockingQueue 获取和新增元素的方法对比

为了帮助理解 `ArrayBlockingQueue` ，我们再来对比一下上面提到的这些获取和新增元素的方法。

新增元素：

| 方法                                      | 队列满时处理方式                                         | 方法返回值 |
| ----------------------------------------- | -------------------------------------------------------- | ---------- |
| `put(E e)`                                | 线程阻塞，直到中断或被唤醒                               | void       |
| `offer(E e)`                              | 直接返回 false                                           | boolean    |
| `offer(E e, long timeout, TimeUnit unit)` | 指定超时时间内阻塞，超过规定时间还未添加成功则返回 false | boolean    |
| `add(E e)`                                | 直接抛出 `IllegalStateException` 异常                    | boolean    |

获取/移除元素：

| 方法                                | 队列空时处理方式                                    | 方法返回值 |
| ----------------------------------- | --------------------------------------------------- | ---------- |
| `take()`                            | 线程阻塞，直到中断或被唤醒                          | E          |
| `poll()`                            | 返回 null                                           | E          |
| `poll(long timeout, TimeUnit unit)` | 指定超时时间内阻塞，超过规定时间还是空的则返回 null | E          |
| `peek()`                            | 返回 null                                           | E          |
| `remove()`                          | 直接抛出 `NoSuchElementException` 异常              | boolean    |

![](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-get-add-element-methods.png)

## ArrayBlockingQueue 相关面试题

### ArrayBlockingQueue 是什么？它的特点是什么？

`ArrayBlockingQueue` 是 `BlockingQueue` 接口的有界队列实现类，常用于多线程之间的数据共享，底层采用数组实现，从其名字就能看出来了。

`ArrayBlockingQueue` 的容量有限，一旦创建，容量不能改变。

为了保证线程安全，`ArrayBlockingQueue` 的并发控制采用可重入锁 `ReentrantLock` ，不管是插入操作还是读取操作，都需要获取到锁才能进行操作。并且，它还支持公平和非公平两种方式的锁访问机制，默认是非公平锁。

`ArrayBlockingQueue` 虽名为阻塞队列，但也支持非阻塞获取和新增元素（例如 `poll()` 和 `offer(E e)` 方法），只是队列满时添加元素会抛出异常，队列为空时获取的元素为 null，一般不会使用。

### ArrayBlockingQueue 和 LinkedBlockingQueue 有什么区别？

`ArrayBlockingQueue` 和 `LinkedBlockingQueue` 是 Java 并发包中常用的两种阻塞队列实现，它们都是线程安全的。不过，不过它们之间也存在下面这些区别：

- 底层实现：`ArrayBlockingQueue` 基于数组实现，而 `LinkedBlockingQueue` 基于链表实现。
- 是否有界：`ArrayBlockingQueue` 是有界队列，必须在创建时指定容量大小。`LinkedBlockingQueue` 创建时可以不指定容量大小，默认是`Integer.MAX_VALUE`，也就是无界的。但也可以指定队列大小，从而成为有界的。
- 锁是否分离： `ArrayBlockingQueue`中的锁是没有分离的，即生产和消费用的是同一个锁；`LinkedBlockingQueue`中的锁是分离的，即生产用的是`putLock`，消费是`takeLock`，这样可以防止生产者和消费者线程之间的锁争夺。
- 内存占用：`ArrayBlockingQueue` 需要提前分配数组内存，而 `LinkedBlockingQueue` 则是动态分配链表节点内存。这意味着，`ArrayBlockingQueue` 在创建时就会占用一定的内存空间，且往往申请的内存比实际所用的内存更大，而`LinkedBlockingQueue` 则是根据元素的增加而逐渐占用内存空间。

### ArrayBlockingQueue 和 ConcurrentLinkedQueue 有什么区别？

`ArrayBlockingQueue` 和 `ConcurrentLinkedQueue` 是 Java 并发包中常用的两种队列实现，它们都是线程安全的。不过，不过它们之间也存在下面这些区别：

- 底层实现：`ArrayBlockingQueue` 基于数组实现，而 `ConcurrentLinkedQueue` 基于链表实现。
- 是否有界：`ArrayBlockingQueue` 是有界队列，必须在创建时指定容量大小，而 `ConcurrentLinkedQueue` 是无界队列，可以动态地增加容量。
- 是否阻塞：`ArrayBlockingQueue` 支持阻塞和非阻塞两种获取和新增元素的方式（一般只会使用前者）， `ConcurrentLinkedQueue` 是无界的，仅支持非阻塞式获取和新增元素。

### ArrayBlockingQueue 的实现原理是什么？

`ArrayBlockingQueue` 的实现原理主要分为以下几点（这里以阻塞式获取和新增元素为例介绍）：

- `ArrayBlockingQueue` 内部维护一个定长的数组用于存储元素。
- 通过使用 `ReentrantLock` 锁对象对读写操作进行同步，即通过锁机制来实现线程安全。
- 通过 `Condition` 实现线程间的等待和唤醒操作。

这里再详细介绍一下线程间的等待和唤醒具体的实现（不需要记具体的方法，面试中回答要点即可）：

- 当队列已满时，生产者线程会调用 `notFull.await()` 方法让生产者进行等待，等待队列非满时插入（非满条件）。
- 当队列为空时，消费者线程会调用 `notEmpty.await()`方法让消费者进行等待，等待队列非空时消费（非空条件）。
- 当有新的元素被添加时，生产者线程会调用 `notEmpty.signal()`方法唤醒正在等待消费的消费者线程。
- 当队列中有元素被取出时，消费者线程会调用 `notFull.signal()`方法唤醒正在等待插入元素的生产者线程。

关于 `Condition`接口的补充：

> `Condition`是 JDK1.5 之后才有的，它具有很好的灵活性，比如可以实现多路通知功能也就是在一个`Lock`对象中可以创建多个`Condition`实例（即对象监视器），**线程对象可以注册在指定的`Condition`中，从而可以有选择性的进行线程通知，在调度线程上更加灵活。 在使用`notify()/notifyAll()`方法进行通知时，被通知的线程是由 JVM 选择的，用`ReentrantLock`类结合`Condition`实例可以实现“选择性通知”** ，这个功能非常重要，而且是 `Condition` 接口默认提供的。而`synchronized`关键字就相当于整个 `Lock` 对象中只有一个`Condition`实例，所有的线程都注册在它一个身上。如果执行`notifyAll()`方法的话就会通知所有处于等待状态的线程，这样会造成很大的效率问题。而`Condition`实例的`signalAll()`方法，只会唤醒注册在该`Condition`实例中的所有等待线程。

## 参考文献

- 深入理解 Java 系列 | BlockingQueue 用法详解：<https://juejin.cn/post/6999798721269465102>
- 深入浅出阻塞队列 BlockingQueue 及其典型实现 ArrayBlockingQueue：<https://zhuanlan.zhihu.com/p/539619957>
- 并发编程大扫盲：ArrayBlockingQueue 底层原理和实战：<https://zhuanlan.zhihu.com/p/339662987>
<!-- @include: @article-footer.snippet.md -->
