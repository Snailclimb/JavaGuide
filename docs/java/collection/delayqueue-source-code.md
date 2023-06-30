## DelayQueue简介

DelayQueue是JUC包(java.util.concurrent)为我们提供的延迟队列，它是一个基于PriorityQueue实现的一个无界队列，是一个线程安全的延迟队列。

关于PriorityQueue可以参考笔者编写的这篇文章:

[PriorityQueue源码分析](http://t.csdn.cn/XJuAf)

当我们希望某个任务在某个时间才能取出并操作时，我们就可以让这个继承Delayed接口，实现其计算任务到期时间的方法 getDelay 。然后将任务存放到 DelayQueue 中,默认情况下, DelayQueue 会按照到期时间升序编排任务。随后当 DelayQueue 发现任务到期时，我们才能从 DelayQueue 中取出这个任务并执行。

这使得 DelayQueue非常适合运用于以下两种场景:
1. 定时任务 : DelayQueue 非常适合用于处理那些到期才能执行的任务，例如用户触发下单请求，我们规定15min后未支付则取消订单，那么我们就可以提交一个15min后到查询用户下单情况的任务给DelayQueue，如果15min后取出该任务发现用户还未下单，则取消这个订单。
2. 缓存过期 : 假如我们使用Java维护一个内存，我们希望缓存具备时效性，同样我们可以封装一个缓存过期删除的任务提交到DelayQueue，DelayQueue会在到期后取出这个任务并将缓存数据删除。




## DelayQueue发展史

DelayQueue 最早是在 Java 5 中引入的，作为 java.util.concurrent 包中的一部分，用于支持基于时间的任务调度和缓存过期删除等场景，该版本仅仅支持延迟功能的实现，还未解决线程安全问题。

在 Java 6 中，DelayQueue 的实现进行了优化，通过使用 ReentrantLock 和 Condition 解决线程安全及线程间交互的效率，提高了其性能和可靠性。

在 Java 7 中，DelayQueue 的实现进行了进一步的优化，通过使用 CAS 操作实现元素的添加和移除操作，提高了其并发操作性能。

在 Java 8 中，DelayQueue 的实现没有进行重大变化，但是在 java.time 包中引入了新的时间类，如 Duration 和 Instant，使得使用 DelayQueue 进行基于时间的调度更加方便和灵活。

在 Java 9 中，DelayQueue 的实现进行了一些微小的改进，主要是对代码进行了一些优化和精简。

总的来说，DelayQueue 的发展史主要是通过优化其实现方式和提高其性能和可靠性，使其更加适用于基于时间的调度和缓存过期删除等场景。





## DelayQueue常见使用场景示例

#### 定时任务

我们希望任务可以按照我们预期的时间执行，例如提交3个任务，分别要求1s、2s、3s后执行，即使是乱序添加，1s后要求1s执行的任务会准时执行。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213027.png)



对此我们可以使用DelayQueue来实现,所以我们首先需要继承Delayed实现 DelayedTask，实现getDelay方法以及优先级比较compareTo。


```bash
/**
 * 延迟任务
 */
public class DelayedTask implements Delayed {
    /**
     * 任务到期时间
     */
    private long executeTime;
    /**
     * 任务
     */
    private Runnable task;

    public DelayedTask(long delay, Runnable task) {
        this.executeTime = System.currentTimeMillis() + delay;
        this.task = task;
    }

    /**
     * 查看当前任务还有多久到期
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * 延迟队列需要到期时间升序入队，所以我们需要实现compareTo进行到期时间比较
     * @param o
     * @return
     */
    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }

    public void execute() {
        task.run();
    }
}
```


完成任务的封装之后，使用就很简单了，设置好多久到期然后将任务提交到延迟队列中即可。


```bash
public static void main(String[] args) throws InterruptedException {
        // 创建延迟队列，并添加任务
        DelayQueue<DelayedTask> delayQueue = new DelayQueue<>();

        //分别添加1s、2s、3s到期的任务
        delayQueue.add(new DelayedTask(2000, () -> System.out.println("Task 2")));
        delayQueue.add(new DelayedTask(1000, () -> System.out.println("Task 1")));
        delayQueue.add(new DelayedTask(3000, () -> System.out.println("Task 3")));

        // 取出任务并执行
        while (!delayQueue.isEmpty()) {
            //阻塞获取最先到期的任务
            DelayedTask task = delayQueue.take();
            if (task != null) {
                task.execute();
            }
        }
    }
```


从输出结果可以看出，即使笔者先提到2s到期的任务，1s到期的任务Task1还是优先执行的。


```bash
Task 1
Task 2
Task 3
```


#### 缓存过期

对于某些热点数据，我们希望将其缓存到内存中，为避免没必要的内存占用，我们希望对缓存数据设置到期失效。




![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213864.png)





对于这种需求，如果不希望引入中间件或者第三方工具的话，我们完全可以通过DelayQueue实现，这里笔者大概介绍一下实现思路:

1. 封装要提交到DelayQueue的任务，该任务指明到期要删除的key和删除时间。
2. 封装缓存类，实现缓存数据的存取以及缓存到期清除的逻辑。
3. 测试类，测试未到期时缓存是否可以获取以及到期后是否返回null。


首先我们需要编写一个缓存的任务CacheItem，告知延迟队列何时到期以及优先级如何判断。


```bash
/**
 * 定时删除缓存项
 * @param <K>
 */
public class CacheItem<K> implements Delayed {
    /**
     * 到期将被删除的key名称
     */
    private final K key;
    /**
     * 到期时间
     */
    private final long expireTime;


    /**
     * 设置key以及key的到期时间
     * @param key
     * @param expireAfterWrite
     * @param timeUnit
     */
    public CacheItem(K key, long expireAfterWrite, TimeUnit timeUnit) {
        this.key = key;
        this.expireTime = System.currentTimeMillis() + timeUnit.toMillis(expireAfterWrite);
    }

    /**
     * 查询到期时间
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(expireTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }


    @Override
    public int compareTo(Delayed o) {
        return Long.compare(expireTime, ((CacheItem<?>) o).expireTime);
    }

    public K getKey() {
        return key;
    }
}
```


完成任务编写之后，我们就可以实现我们自己的缓存工具了，这里实现的方式非常简单，对于缓存数据的存取我们都用ConcurrentHashMap来管理，而到期删除的逻辑，我们在存缓存数据的同时，提交一个缓存到期的任务给DelayQueue即可。

```bash
/**
 * 基于延迟队列实现缓存过期的示例
 * @param <K>
 * @param <V>
 */
public class Cache<K, V> {
    /**
     * 延迟队列，定时清除到期缓存数据
     */
    private final DelayQueue<CacheItem<K>> queue = new DelayQueue<>();
    /**
     * 存放缓存的键值对
     */
    private final  Map<K, V> cache = new ConcurrentHashMap<>();


    /**
     * 构造方法创建一个守护线程，定时查询到期的key并清除缓存
     */
    public Cache() {
        Thread t = new Thread(this::expireItems);
        t.setDaemon(true);
        t.start();
    }


    /**
     * 添加数据到缓存中
     * @param key
     * @param value
     * @param expireAfterWrite
     * @param timeUnit
     */
    public void put(K key, V value, long expireAfterWrite, TimeUnit timeUnit) {
        //插入数据到缓存中
        cache.put(key, value);
        //添加一个任务，到期时清除缓存中的key
        queue.put(new CacheItem<>(key, expireAfterWrite, timeUnit));
    }

    /**
     * 从缓存中获取数据
     * @param key
     * @return
     */
    public V get(K key) {
        return cache.get(key);
    }



    private void expireItems() {
        while (true) {
            try {
                CacheItem<K> item = queue.take();
                System.out.println("item:" + item.getKey() + "已过期,开始删除");
                cache.remove(item.getKey());
                System.out.println("item:" + item.getKey() + "删除成功");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }


   
}
```


完成缓存工具开发之后，我们不妨进行一下简单的测试，我们往缓存中添加一个5s到期的缓存，看看6s前和6s后的获取情况。




```bash
 public static void main(String[] args) throws InterruptedException {
        Cache<String, Integer> cache = new Cache<>();

        // 存储数据项，并设置过期时间为 5 秒
        cache.put("key1", 1, 5, TimeUnit.SECONDS);
        cache.put("key2", 2, 5, TimeUnit.SECONDS);


        // 获取数据项
        System.out.println(cache.get("key1")); // 输出 1

        // 等待 6 秒，让数据项过期
        Thread.sleep(6000);

        // 再次获取数据项
        System.out.println(cache.get("key1")); // 输出 null
    }
```

从输出结果来看5s到期的缓存数据在休眠6s后已经无法获取到了:

```bash
1
item:key1已过期,开始删除
item:key1删除成功
item:key2已过期,开始删除
item:key2删除成功
null
```

## DelayQueue源码解析

### 核心成员变量


了解了DelayQueue的使用方式之后，我们就可以深入的去了解DelayQueue源码了。首先我们先来看看几个比较核心的成员变量:


1. lock : 我们都知道DelayQueue存取是线程安全的，所以为了保证存取元素时线程安全，我们就需要在存取时上锁,而DelayQueue就是基于lock独占锁确保存取操作的线程安全。
2. q : 延迟队列要求元素按照到期时间进行升序排列，所以元素添加时势必需要进行优先级排序,所以DelayQueue底层元素的存取都是通过这个优先队列PriorityQueue的成员变量q来管理的。
3. leader : 延迟队列的任务只有到期之后才会执行,对于没有到期的任务只有等待,为了确保优先级最高的任务到期后可以即刻被执行,设计者就用leader来管理延迟任务，只有leader所指向的线程才具备定时等待任务到期执行的权限，而其他那些优先级低的任务只能无限期等待，直到leader线程执行完手头的延迟任务后唤醒它。
4. available : 上文讲述leader线程时提到的等待唤醒操作的交互就是通过 available 实现的，假如线程1尝试在空的DelayQueue获取任务时，available 就会将其放入等待队列中。直到有一个线程添加一个延迟任务后通过available 的signal方法将其唤醒。


所有成员变量的定义如下:

```bash
	//可重入锁，实现线程安全的关键
    private final transient ReentrantLock lock = new ReentrantLock();
    //延迟队列底层存储数据的集合,确保元素按照到期时间升序排列
    private final PriorityQueue<E> q = new PriorityQueue<E>();

 	//指向准备执行优先级最高的线程
    private Thread leader = null;
	//实现多线程之间等待唤醒的交互
    private final Condition available = lock.newCondition();
```

### 构造方法


相较于其他的并发容器，延迟队列的构造方法比较简单，它只有两个构造方法，因为所有成员变量在类加载时都已经初始完成了，所以默认构造方法什么也没做。还有一个传入Collection对象的构造方法，它会将调用addAll将集合元素存到优先队列q中。


```bash
	public DelayQueue() {}

 
    public DelayQueue(Collection<? extends E> c) {
        this.addAll(c);
    }
```

### 添加元素

DelayQueue 添加元素的方法无论是add、put还是offer,本质上就是调用一下 offer ,所以了解延迟队列的添加逻辑我们只需阅读offer方法即可。


offer 方法的整体逻辑为:
1. 尝试获取 lock 。
2. 如果上锁成功,则调 q 的 offer 方法将元素存放到优先队列中。
3. 调用 peek 方法看看当前队首元素是否就是本次入队的元素,如果是则说明当前这个元素是即将到期的任务(即优先级最高的元素)，于是将leader设置为空,通知因为队列为空时调用take等方法导致阻塞的线程来争抢元素。
4. 上述步骤执行完成，释放lock。
5. 返回true。



源码如下，笔者已详细注释，读者可自行参阅:

```bash
public boolean offer(E e) {
		//尝试获取lock 
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
        //如果上锁成功,则调q的offer方法将元素存放到优先队列中
            q.offer(e);
            //调用peek方法看看当前队首元素是否就是本次入队的元素,如果是则说明当前这个元素是即将到期的任务(即优先级最高的元素)
            if (q.peek() == e) {
            //将leader设置为空,通知调用取元素方法而阻塞的线程来争抢这个任务
                leader = null;
                available.signal();
            }
            return true;
        } finally {
        //上述步骤执行完成，释放lock
            lock.unlock();
        }
    }
```


### 获取元素


DelayQueue 中获取元素的方式分为阻塞式和非阻塞式，先来看看逻辑比较复杂的阻塞式获取元素方法take,为了让读者可以更直观的了解阻塞式获取元素的全流程，笔者将以3个线程并发获取元素为例讲述take的工作流程。


1. 首先3个线程会尝试获取可重入锁lock,假设我们现在有3个线程分别是t1、t2、t3,随后t1得到了锁，而t2、t3没有抢到锁，故将这两个线程存入等待队列中。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213758.png)







2. 紧接着t1开始进行元素获取的逻辑。
3. 线程t1首先会查看DelayQueue队列首元素是否为空。
4. 如果元素为空，则说明当前队列没有任何元素，故t1就会被阻塞存到conditionWaiter这个队列中。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213690.png)



注意，调用await之后t1就会释放lcok锁，假如DelayQueue持续为空，那么t2、t3也会像t1一样执行相同的逻辑并进入conditionWaiter队列中。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213656.png)



如果元素不为空，则判断当前任务是否到期，如果元素到期，则直接返回出去。如果元素未到期，则判断当前leader线程(DelayQueue中唯一一个可以等待并获取元素的线程引用)是否为空，若不为空，则说明当前leader正在等待执行一个优先级比当前元素还高的元素到期，故当前线程t1只能调用await进入无限期等待，等到leader取得元素后唤醒。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/img202306301213007.png)




反之若leader线程为空，则将当前线程设置为leader并进入有限期等待,到期后取出元素并返回。





自此我们阻塞式获取元素的逻辑都已完成后,源码如下，读者可自行参阅:


```bash
public E take() throws InterruptedException {
		// 尝试获取可重入锁,将底层AQS的state设置为1,并设置为独占锁
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            for (;;) {
                //查看队列第一个元素
                E first = q.peek();
                //若为空,则将当前线程放入ConditionObject的等待队列中，并将底层AQS的state设置为0，表示释放锁并进入无限期等待
                if (first == null)
                    available.await();
                else {
                	//若元素不为空，则查看当前元素多久到期
                    long delay = first.getDelay(NANOSECONDS);
                    //如果小于0则说明已到期直接返回出去
                    if (delay <= 0)
                        return q.poll();
                     //如果大于0则说明任务还没到期，首先需要释放对这个元素的引用
                    first = null; // don't retain ref while waiting
                    //判断leader是否为空，如果不为空，则说明正有线程作为leader并等待一个任务到期，则当前线程进入无限期等待
                    if (leader != null)
                        available.await();
                    else {
                    	//反之将我们的线程成为leader
                        Thread thisThread = Thread.currentThread();
                        leader = thisThread;
                        try {
                        	//并进入有限期等待
                            available.awaitNanos(delay);
                        } finally {
                        //等待任务到期时，释放leader引用，进入下一次循环将任务return出去
                            if (leader == thisThread)
                                leader = null;
                        }
                    }
                }
            }
        } finally {
        //收尾逻辑:如果leader不为空且q有元素，则说明有任务没人认领，直接发起通知唤醒因为锁被当前消费者持有而导致阻塞的生产者(即调用put、add、offer的线程)
            if (leader == null && q.peek() != null)
                available.signal();
            //释放锁
            lock.unlock();
        }
    }
```



我们再来看看非阻塞的获取元素方法 poll ，逻辑比较简单，整体步骤如下:
1. 尝试获取可重入锁。
2. 查看队列第一个元素,判断元素是否为空。
3. 若元素为空，或者元素未到期，则直接返回空。
4. 若元素不为空且到期了，直接调用poll返回出去。
5. 释放可重入锁 lock 。



源码如下,读者可自行参阅源码及注释:


```bash
public E poll() {
		//尝试获取可重入锁
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
        //查看队列第一个元素,判断元素是否为空
            E first = q.peek();

			//若元素为空，或者元素未到期，则直接返回空
            if (first == null || first.getDelay(NANOSECONDS) > 0)
                return null;
            else
            //若元素不为空且到期了，直接调用poll返回出去
                return q.poll();
        } finally {
           //释放可重入锁lock
            lock.unlock();
        }
    }
```


### 查看元素

上文获取元素时都会调用到peek方法，peek顾名思义仅仅窥探一下队列中的元素，它的步骤就4步:

1. 上锁。
2. 调用优先队列q的peek方法查看索引0位置的元素。
3. 释放锁。
4. 将元素返回出去。

```bash
public E peek() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return q.peek();
        } finally {
            lock.unlock();
        }
    }
```







## DelayQueue常见面试题



### DelayQueue 的实现原理是什么？

DelayQueue底层是使用优先队列PriorityQueue来存储元素，而PriorityQueue采用二叉小顶堆的思想确保值小的元素排在最前面，这就使得DelayQueue对于延迟任务优先级的管理就变得十分方便了。同时DelayQueue为了保证线程安全还用到了可重入锁ReentrantLock,确保单位时间内只有一个线程可以操作延迟队列。最后，为了实现多线程之间等待和唤醒的交互效率，DelayQueue还用到了Condition，通过Condition的await和signal方法完成多线程之间的等待唤醒。



### DelayQueue 的使用场景有哪些？

DelayQueue 通常用于实现定时任务调度和缓存过期删除等场景。在定时任务调度中，需要将需要执行的任务封装成延迟任务对象，并将其添加到 DelayQueue 中，DelayQueue 会自动按照剩余延迟时间进行升序排序(默认情况)，以保证任务能够按照时间先后顺序执行。对于缓存过期这个场景而言，在数据被缓存到内存之后，我们可以将缓存的key封装成一个延迟的删除任务，并将其添加到 DelayQueue 中，当数据过期时，拿到这个任务的key，将这个key从内存中移除。

### DelayQueue 中 Delayed 接口的作用是什么？

Delayed接口定义了元素的剩余延迟时间(getDelay)和元素之间的比较规则(该接口继承了Comparable接口)。若希望元素能够存放到DelayQueue 中，就必须实现 Delayed 接口的 getDelay() 方法和 compareTo() 方法，否则DelayQueue无法得知当前任务剩余时长和任务优先级的比较。

### DelayQueue 和 Timer/TimerTask 的区别是什么？

DelayQueue 和 Timer/TimerTask 都可以用于实现定时任务调度，但是它们的实现方式不同。DelayQueue 是基于优先级队列和堆排序算法实现的，可以实现多个任务按照时间先后顺序执行；而 Timer/TimerTask 是基于单线程实现的，只能按照任务的执行顺序依次执行，如果某个任务执行时间过长，会影响其他任务的执行。另外，DelayQueue 还支持动态添加和移除任务，而 Timer/TimerTask 只能在创建时指定任务。

### DelayQueue 的实现是否线程安全？

DelayQueue 的实现是线程安全的，它通过 ReentrantLock 实现了互斥访问和 Condition 实现了线程间的等待和唤醒操作，可以保证多线程环境下的安全性和可靠性。



### 实现延迟队列的几种方式

实现延迟队列的方式有很多，我们需要结合场景选用合适的方案，总体来说有一下几种实现方案:
1. DelayQueue:直接将任务到JDK自带的DelayQueue用线程去监听。
2. 第三方任务调度工具:例如Quartz 等定时任务调度工具。
3. Redis有序集合:以时分秒作为整数等方式作为优先级，元素作为value存到redis sorted set中,然后Java进程去轮询redis的set集合,判断当前时间是否到期，若到期则将元素从set中移除并执行。
4. Redis过期回调:设置 Redis 过期回调监听即将到期的key。
5. RabbitMQ: 基于 RabbitMQ 的TTL和DLX设置延迟消息，待延迟消息进入死信队列时将其转发到正常消息队列中，我们只需监听这个消息队列并处理这些从死信队列中转发过来的消息即可。
6. 时间轮算法: 这种不是很常见,以钟表为为单表，设置好时间点index和圈数round,待时间轮到达这个值时将任务取出执行。


详情可参考这篇文章,写的比较详细:[一口气说出Java 6种延时队列的实现方法(面试官也得服)](https://blog.csdn.net/monokai/article/details/109023025)






## 参考文献

深入理解高并发编程：JDK核心技术: <https://book.douban.com/subject/36262609/>

一口气说出Java 6种延时队列的实现方法(面试官也得服): <https://www.jb51.net/article/186192.htm>

图解DelayQueue源码（java 8）——延时队列的小九九: <https://blog.csdn.net/every__day/article/details/113810985>