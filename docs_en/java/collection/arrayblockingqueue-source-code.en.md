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

After understanding the common operations of `BlockingQueue`, we know that `ArrayBlockingQueue` implements the `BlockingQueue` method and rewrites it, then fills it into the `AbstractQueue` method. From this, we know where the `offer` method of the `add` method of `AbstractQueue` above is implemented.

```java
public boolean add(E e) {
  //AbstractQueue's offer comes from the lower ArrayBlockingQueue's offer method implemented and rewritten from BlockingQueue.
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

### Initialization

Before understanding the details of `ArrayBlockingQueue`, we might as well take a look at its constructor and understand its initialization process. From the source code, we can see that `ArrayBlockingQueue` has 3 construction methods, and the core construction method is the one below.

```java
// capacity represents the initial capacity of the queue, fair represents the fairness of the lock
public ArrayBlockingQueue(int capacity, boolean fair) {
  //If the set queue size is less than 0, throw IllegalArgumentException directly.
  if (capacity <= 0)
      throw new IllegalArgumentException();
  //Initialize an array to store the elements of the queue
  this.items = new Object[capacity];
  //Create a lock that blocks queue process control
  lock = new ReentrantLock(fair);
  //Use lock to create two conditions to control queue production and consumption
  notEmpty = lock.newCondition();
  notFull = lock.newCondition();
}
```

There are two core member variables in this construction method, `notEmpty` (not empty) and `notFull` (not full). We need to pay special attention to them. They are the key to achieving the orderly work of producers and consumers. I will explain this in detail in the subsequent source code analysis. Here we only need to have a preliminary understanding of the structure of the blocking queue.

The other two construction methods are based on the above construction method. By default, we will use the following construction method, which means that `ArrayBlockingQueue` uses an unfair lock, that is, after each producer or consumer thread receives the notification, the competition for the lock is random.

```java
 public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
    }
```

There is also a less commonly used construction method. After initializing the capacity and unfairness of the lock, it also provides a `Collection` parameter. It is not difficult to see from the source code that this construction method directly stores the elements of the externally passed collection into the blocking queue during initialization.

```java
public ArrayBlockingQueue(int capacity, boolean fair,
                              Collection<? extends E> c) {
  //Initialize capacity and lock fairness
  this(capacity, fair);

  final ReentrantLock lock = this.lock;
  //Lock and store the elements in c into the underlying array of ArrayBlockingQueue
  lock.lock();
  try {
      int i = 0;
      try {
                //Traverse and add elements to the array
          for (E e : c) {
              checkNotNull(e);
              items[i++] = e;
          }
      } catch (ArrayIndexOutOfBoundsException ex) {
          throw new IllegalArgumentException();
      }
      //Record the current queue capacity
      count = i;
                      //Update the next put or offer or add the position to the underlying array of the queue using the add method
      putIndex = (i == capacity) ? 0 : i;
  } finally {
      //Release the lock after completing the traversal
      lock.unlock();
  }
}
```

### Blocking acquisition and new elements

`ArrayBlockingQueue` blocking acquisition and new elements correspond to the producer-consumer model. Although it also supports non-blocking acquisition and new elements (such as `poll()` and `offer(E e)` methods, which will be introduced later), they are generally not used.

`ArrayBlockingQueue` The blocking method of obtaining and adding elements is:

- `put(E e)`: Insert elements into the queue. If the queue is full, this method will block until space is available in the queue or the thread is interrupted.
- `take()`: Get and remove the element at the head of the queue. If the queue is empty, this method will block until the queue is not empty or the thread is interrupted.

The key to the implementation of these two methods lies in the two conditional objects `notEmpty` (not empty) and `notFull` (not full), which we mentioned in the constructor method above.

Next, the author will use two pictures to let everyone understand how these two conditions are used in the blocking queue.

![ArrayBlockingQueue non-empty condition](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-take.png)

Assume that our code consumer starts first. When it finds that there is no data in the queue, the non-empty condition will suspend the thread, that is, the thread will be suspended when the waiting condition is not empty. Then the CPU execution right reaches the producer. The producer finds that the data can be stored in the queue, so he stores the data in it and notifies that the condition is not empty. At this time, the consumer will be awakened to the queue and use methods such as `take` to obtain the value.

![ArrayBlockingQueue not full condition](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notFull-put.png)

In subsequent executions, the producer's production speed is much greater than the consumer's consumption speed, so the producer fills the queue and tries to store data into the queue again. It is found that the queue is full, so the blocking queue suspends the current thread and waits until it is full. Then the consumer takes the CPU execution rights to consume, so the queue can store new data and sends a non-full notification. At this time, the suspended producer will wait for the arrival of CPU execution rights and try to store data in the queue again.

After briefly understanding the interaction process of the blocking queue based on two conditions, we might as well take a look at the source code of the `put` and `take` methods.

```java
public void put(E e) throws InterruptedException {
    //Make sure the inserted element is not null
    checkNotNull(e);
    //Lock
    final ReentrantLock lock = this.lock;
    //The lockInterruptibly() method is used instead of the lock() method here to be able to respond to interrupt operations. If it is interrupted while waiting to acquire the lock, this method will throw an InterruptedException exception.
    lock.lockInterruptibly();
    try {
            //If the array length is equal to count, it means that the queue is full, and the current thread will be suspended and placed in the AQS queue, waiting for insertion when the queue is not full (non-full condition).
       //During the waiting period, the lock will be released and other threads can continue to operate on the queue.
        while (count == items.length)
            notFull.await();
           //If the queue can store elements, call enqueue to enqueue the elements.
        enqueue(e);
    } finally {
        //Release the lock
        lock.unlock();
    }
}
```

The `enqueue` method is called internally in the `put` method to implement elements into the queue. Let's continue to take a closer look at the implementation details of the `enqueue` method:

```java
private void enqueue(E x) {
   //Get the array at the bottom of the queue
    final Object[] items = this.items;
    //Set the value of the putindex position to the x we passed in
    items[putIndex] = x;
    //Update putindex, if putindex is equal to the length of the array, update it to 0
    if (++putIndex == items.length)
        putIndex = 0;
    //queue length+1
    count++;
    //Notify that the queue is not empty, and those threads blocked by obtaining elements can continue to work.
    notEmpty.signal();
}```

From the source code, we can see that the logic of the enqueue operation is to append a new element to the array. The overall execution steps are:

1. Get the underlying array `items` of `ArrayBlockingQueue`.
2. Save the element to the `putIndex` location.
3. Update `putIndex` to the next position. If `putIndex` is equal to the queue length, it means that `putIndex` has reached the end of the array, and the next insertion needs to start from 0. (`ArrayBlockingQueue` uses the idea of a circular queue, that is, cyclically reusing an array from beginning to end)
4. Update the value of `count` to represent the current queue length + 1.
5. Call `notEmpty.signal()` to notify the queue that the queue is not empty and the consumer can get values ​​from the queue.

Since then we have understood the process of the `put` method. In order to have a more complete understanding of the design of the producer-consumer model of `ArrayBlockingQueue`, we continue to look at the `take` method that blocks the acquisition of queue elements.

```java
public E take() throws InterruptedException {
       //Get the lock
     final ReentrantLock lock = this.lock;
     lock.lockInterruptibly();
     try {
             //If the number of elements in the queue is 0, interrupt the current thread and store it in the AQS queue, and wait for the elements to be obtained and removed when the queue is not empty (non-empty condition)
         while (count == 0)
             notEmpty.await();
            //If the queue is not empty, call dequeue to get the elements
         return dequeue();
     } finally {
          //Release the lock
         lock.unlock();
     }
}
```

After understanding the `put` method, it is very simple to look at the `take` method. Its core logic is exactly the opposite of the `put` method. For example, the `put` method waits for the queue to be full when the queue is not full to insert elements (non-full condition), while the `take` method waits for the queue to be non-empty to obtain and remove elements (non-empty condition).

The `take` method internally calls the `dequeue` method to dequeue elements, and its core logic is also opposite to that of the `enqueue` method.

```java
private E dequeue() {
  //Get the array at the bottom of the blocking queue
  final Object[] items = this.items;
  @SuppressWarnings("unchecked")
  //Get the element at takeIndex position from the queue
  E x = (E) items[takeIndex];
  //Make takeIndex empty
  items[takeIndex] = null;
  //takeIndex moves backward, if it is equal to the length of the array, it is updated to 0
  if (++takeIndex == items.length)
      takeIndex = 0;
  //Decrease the queue length by 1
  count--;
  if (itrs != null)
      itrs.elementDequeued();
  //Notify those interrupted threads that the current queue status is not full and can continue to store elements.
  notFull.signal();
  return x;
}
```

Since the steps of the `dequeue` method (dequeuing) are roughly similar to the `enqueue` method (enqueueing) introduced above, they will not be repeated here.

To help understand, I drew a picture to show how the two condition objects `notEmpty` (not empty) and `notFull` (not full) control the storage and access of `ArrayBlockingQueue`.

![ArrayBlockingQueue is not empty and not full](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-notFull.png)

- **Consumer**: When the consumer takes out an element from the queue through operations such as `take` or `poll`, it will notify the queue that it is not full. At this time, those producers who are waiting for the queue to be not full will be awakened to wait for CPU time slices to join the queue.
- **Producer**: When the producer saves the element into the queue, it will trigger a notification that the queue is not empty. At this time, the consumer will be awakened to wait for the CPU time slice to try to obtain the element. In this way, the two condition objects form a loop, controlling the storage and retrieval between multiple threads.

### Non-blocking acquisition and new elements

`ArrayBlockingQueue` non-blocking method of obtaining and adding elements is:

- `offer(E e)`: Insert the element into the end of the queue. If the queue is full, this method will return false directly without waiting and blocking the thread.
- `poll()`: Get and remove the element at the head of the queue. If the queue is empty, this method will directly return null and will not wait and block the thread.
- `add(E e)`: Insert elements into the end of the queue. If the queue is full, an `IllegalStateException` exception will be thrown, and the underlying method is based on the `offer(E e)` method.
- `remove()`: Removes the element at the head of the queue. If the queue is empty, a `NoSuchElementException` exception will be thrown. The underlying layer is based on `poll()`.
- `peek()`: Gets but does not remove the element at the head of the queue. If the queue is empty, this method will directly return null without waiting and blocking the thread.

Let’s take a look at the `offer` method first. The logic is similar to `put`. The only difference is that the current thread will not be blocked when the queue fails, but `false` will be returned directly.

```java
public boolean offer(E e) {
        //Make sure the inserted element is not null
        checkNotNull(e);
        //Get the lock
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
             //The queue is full and returns false directly.
            if (count == items.length)
                return false;
            else {
                // Otherwise, add the element to the queue and return true directly
                enqueue(e);
                return true;
            }
        } finally {
            //Release the lock
            lock.unlock();
        }
    }
```

The `poll` method has the same principle. If it fails to obtain an element, it will directly return null and will not block the thread that obtains the element.

```java
public E poll() {
        final ReentrantLock lock = this.lock;
        //Lock
        lock.lock();
        try {
            //If the queue is empty, return null directly, otherwise return the element value after dequeuing.
            return (count == 0) ? null : dequeue();
        } finally {
            lock.unlock();
        }
    }
```

The `add` method actually encapsulates `offer`. As shown in the following code, you can see that `add` will call `offer` without a specified time. If the entry into the queue fails, an exception will be thrown directly.

```java
public boolean add(E e) {
        return super.add(e);
    }


public boolean add(E e) {
        //Call the offer method and throw an exception directly if it fails.
        if (offer(e))
            return true;
        else
            throw new IllegalStateException("Queue full");
    }
```

The `remove` method is the same. Call `poll`. If `null` is returned, it means that there are no elements in the queue and an exception will be thrown directly.

```java
public E remove() {
        E x = poll();
        if (x != null)
            return x;
        else
            throw new NoSuchElementException();
    }
```

The logic of the `peek()` method is also very simple, and the `itemAt` method is called internally.

```java
public E peek() {
        //Lock
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            //Return null when the queue is empty
            return itemAt(takeIndex);
        } finally {
            //Release the lock
            lock.unlock();
        }
    }

//Return the element at the specified position in the queue
@SuppressWarnings("unchecked")
final E itemAt(int i) {
    return (E) items[i];
}```

### Blocking acquisition and new elements within the specified timeout period

On the basis of `offer(E e)` and `poll()` non-blocking acquisition and new elements, the designer provides `offer(E e, long timeout, TimeUnit unit)` and `poll(long timeout, TimeUnit unit)` with waiting time for blocking addition and acquisition of elements within the specified timeout period.

```java
 public boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException {

        checkNotNull(e);
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
        //The queue is full, enter the loop
            while (count == items.length) {
            //The queue is still full when the time is up, then return false directly.
                if (nanos <= 0)
                    return false;
                 //Block nanos time and wait until it is not full
                nanos = notFull.awaitNanos(nanos);
            }
            enqueue(e);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

It can be seen that the `offer` method with a timeout will wait for the time period passed by the user when the queue is full. If the element cannot be stored within the specified time, it will directly return `false`.

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
          //The queue is empty, wait in a loop, if the time is still empty, return null directly
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

In the same way, the same goes for `poll` with a timeout. If the queue is empty, it will wait within the specified time. If the queue is still empty when the time is up, null will be returned directly.

### Determine whether the element exists

`ArrayBlockingQueue` provides `contains(Object o)` to determine whether the specified element exists in the queue.

```java
public boolean contains(Object o) {
    //If the target element is empty, return false directly.
    if (o == null) return false;
    //Get the element array of the current queue
    final Object[] items = this.items;
    //Lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // If the queue is not empty
        if (count > 0) {
            final int putIndex = this.putIndex;
            //Traverse from the head of the queue
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
        //Release the lock
        lock.unlock();
    }
}
```

## ArrayBlockingQueue Comparison of methods of obtaining and adding elements

To help understand `ArrayBlockingQueue`, let’s compare the methods of obtaining and adding elements mentioned above.

New elements:

| Method | How to handle when the queue is full | Method return value |
| ---------------------------------------- | -------------------------------------------------------- | ---------- |
| `put(E e)` | The thread blocks until interrupted or awakened | void |
| `offer(E e)` | Return false directly | boolean |
| `offer(E e, long timeout, TimeUnit unit)` | Block within the specified timeout, and return false if the addition is not successful after the specified time | boolean |
| `add(E e)` | Directly throw `IllegalStateException` exception | boolean |

Get/remove elements:

| Method | How to handle when the queue is empty | Method return value |
| ----------------------------------- | --------------------------------------------------- | ---------- |
| `take()` | The thread blocks until interrupted or awakened | E |
| `poll()` | returns null | E |
| `poll(long timeout, TimeUnit unit)` | Block within the specified timeout. If it exceeds the specified time or is empty, return null | E |
| `peek()` | returns null | E |
| `remove()` | Directly throw `NoSuchElementException` exception | boolean |

![](https://oss.javaguide.cn/github/javaguide/java/collection/ArrayBlockingQueue-get-add-element-methods.png)

## ArrayBlockingQueue related interview questions

### What is ArrayBlockingQueue? What are its characteristics?

`ArrayBlockingQueue` is a bounded queue implementation class of the `BlockingQueue` interface. It is often used for data sharing between multi-threads. The bottom layer is implemented using an array, as can be seen from its name.

The capacity of `ArrayBlockingQueue` is limited and once created, the capacity cannot be changed.In order to ensure thread safety, the concurrency control of `ArrayBlockingQueue` uses the reentrant lock `ReentrantLock`. Whether it is an insertion operation or a read operation, the lock needs to be acquired before the operation can be performed. Moreover, it also supports fair and unfair lock access mechanisms. The default is unfair lock.

Although `ArrayBlockingQueue` is called a blocking queue, it also supports non-blocking acquisition and new elements (such as `poll()` and `offer(E e)` methods). However, adding elements when the queue is full will throw an exception. When the queue is empty, the elements obtained are null and are generally not used.

### What is the difference between ArrayBlockingQueue and LinkedBlockingQueue?

`ArrayBlockingQueue` and `LinkedBlockingQueue` are two blocking queue implementations commonly used in Java concurrency packages. They are both thread-safe. However, there are also the following differences between them:

- Underlying implementation: `ArrayBlockingQueue` is implemented based on arrays, while `LinkedBlockingQueue` is implemented based on linked lists.
- Whether it is bounded: `ArrayBlockingQueue` is a bounded queue and the capacity must be specified when it is created. `LinkedBlockingQueue` can be created without specifying the capacity. The default is `Integer.MAX_VALUE`, which is unbounded. But it is also possible to specify the queue size, thus making it bounded.
- Whether the locks are separated: The locks in `ArrayBlockingQueue` are not separated, that is, the same lock is used for production and consumption; the locks in `LinkedBlockingQueue` are separated, that is, `putLock` is used for production and `takeLock` is used for consumption. This can prevent lock contention between producer and consumer threads.
- Memory usage: `ArrayBlockingQueue` needs to allocate array memory in advance, while `LinkedBlockingQueue` dynamically allocates linked list node memory. This means that `ArrayBlockingQueue` will occupy a certain amount of memory space when it is created, and often the memory requested is larger than the actual memory used, while `LinkedBlockingQueue` gradually occupies memory space according to the increase of elements.

### What is the difference between ArrayBlockingQueue and ConcurrentLinkedQueue?

`ArrayBlockingQueue` and `ConcurrentLinkedQueue` are two queue implementations commonly used in the Java concurrency package. They are both thread-safe. However, there are also the following differences between them:

- Underlying implementation: `ArrayBlockingQueue` is implemented based on arrays, while `ConcurrentLinkedQueue` is implemented based on linked lists.
- Whether it is bounded: `ArrayBlockingQueue` is a bounded queue and the capacity must be specified when it is created, while `ConcurrentLinkedQueue` is an unbounded queue and can dynamically increase its capacity.
- Whether to block: `ArrayBlockingQueue` supports blocking and non-blocking methods of obtaining and adding elements (generally only the former is used). `ConcurrentLinkedQueue` is unbounded and only supports non-blocking methods of obtaining and adding elements.

### What is the implementation principle of ArrayBlockingQueue?

The implementation principles of `ArrayBlockingQueue` are mainly divided into the following points (herein, blocking acquisition and new elements are introduced as examples):

- `ArrayBlockingQueue` internally maintains a fixed-length array for storing elements.
- Synchronize read and write operations by using the `ReentrantLock` lock object, that is, thread safety is achieved through the lock mechanism.
- Implement waiting and wake-up operations between threads through `Condition`.

Here is a detailed introduction to the specific implementation of waiting and waking up between threads (you don’t need to remember the specific methods, just answer the key points in the interview):

- When the queue is full, the producer thread will call the `notFull.await()` method to let the producer wait and insert when the queue is not full (non-full condition).
- When the queue is empty, the consumer thread will call the `notEmpty.await()` method to let the consumer wait and consume when the queue is not empty (non-empty condition).
- When a new element is added, the producer thread will call the `notEmpty.signal()` method to wake up the consumer thread waiting for consumption.
- When an element is taken out of the queue, the consumer thread will call the `notFull.signal()` method to wake up the producer thread that is waiting to insert the element.

Additional information about the `Condition` interface:

> `Condition` is only available after JDK1.5. It has good flexibility. For example, it can implement multi-channel notification function, that is, multiple `Condition` instances (i.e. object monitors) can be created in a `Lock` object. **Thread objects can be registered in the specified `Condition`, so that thread notification can be selectively carried out and it is more flexible in scheduling threads. When using the `notify()/notifyAll()` method to notify, the thread to be notified is selected by the JVM. Using the `ReentrantLock` class combined with the `Condition` instance can implement "selective notification"**. This function is very important and is provided by the `Condition` interface by default. The `synchronized` keyword is equivalent to only one `Condition` instance in the entire `Lock` object, and all threads are registered in it. If the `notifyAll()` method is executed, all threads in the waiting state will be notified, which will cause great efficiency problems. The `signalAll()` method of a `Condition` instance will only wake up all waiting threads registered in the `Condition` instance.

## References

- In-depth understanding of Java series | Detailed explanation of BlockingQueue usage: <https://juejin.cn/post/6999798721269465102>
- An in-depth explanation of the blocking queue BlockingQueue and its typical implementation ArrayBlockingQueue: <https://zhuanlan.zhihu.com/p/539619957>
- Literacy in concurrent programming: ArrayBlockingQueue underlying principles and practice: <https://zhuanlan.zhihu.com/p/339662987>
<!-- @include: @article-footer.snippet.md -->