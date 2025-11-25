---
title: Summary of common implementation solutions for distributed locks
category: distributed
---

<!-- @include: @small-advertisement.snippet.md -->

Under normal circumstances, we generally choose to implement distributed locks based on Redis or ZooKeeper. Redis is used more often. I will first introduce the implementation of distributed locks using Redis as an example.

## Implement distributed lock based on Redis

### How to implement the simplest distributed lock based on Redis?

Whether it is a local lock or a distributed lock, the core lies in "mutual exclusion".

In Redis, the `SETNX` command can help us achieve mutual exclusion. `SETNX` is **SET** if **N**ot e**X**ists (corresponding to the `setIfAbsent` method in Java). If the key does not exist, the value of the key will be set. If key already exists, `SETNX` does nothing.

```bash
> SETNX lockKey uniqueValue
(integer) 1
> SETNX lockKey uniqueValue
(integer) 0
```

To release the lock, delete the corresponding key directly through the `DEL` command.

```bash
> DEL lockKey
(integer) 1
```

In order to prevent accidentally deleting other locks, we recommend using Lua script to judge by the value (unique value) corresponding to the key.

The Lua script was chosen to ensure the atomicity of the unlocking operation. Because Redis can execute Lua scripts in an atomic manner, thus ensuring the atomicity of the lock release operation.

```lua
// When releasing the lock, first compare the value values corresponding to the lock to see if they are equal to avoid accidentally releasing the lock.
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

![Redis implements simple distributed lock](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-setnx.png)

This is the simplest Redis distributed lock implementation. The implementation method is relatively simple and the performance is very efficient. However, there are some problems with implementing distributed locking in this way. For example, if the application encounters some problems, such as the logic of releasing the lock suddenly hangs up, the lock may not be released, and the shared resources can no longer be accessed by other threads/processes.

### Why do we need to set an expiration time for the lock?

In order to prevent the lock from being released, one solution we can think of is: **Set an expiration time** for this key (that is, the lock).

```bash
127.0.0.1:6379> SET lockKey uniqueValue EX 3 NX
OK
```

- **lockKey**: the lock name;
- **uniqueValue**: a random string that uniquely identifies the lock;
- **NX**: SET can only succeed when the key value corresponding to lockKey does not exist;
- **EX**: Expiration time setting (in seconds) EX 3 indicates that this lock has an automatic expiration time of 3 seconds. Corresponding to EX is PX (in milliseconds), both of which are expiration time settings.

**Be sure to ensure that setting the value and expiration time of the specified key is an atomic operation! ! ! ** Otherwise, there may still be a problem that the lock cannot be released.

This can indeed solve the problem, but this solution also has loopholes: **If the time to operate the shared resource is greater than the expiration time, there will be a problem of early expiration of the lock, which will lead to the direct failure of the distributed lock. If the lock timeout is set too long, performance will be affected. **

You may be thinking: **If the operation of operating shared resources has not been completed, it would be great if the lock expiration time could be renewed by itself! **

### How to achieve graceful renewal of locks?

For Java development partners, there is already a ready-made solution: **[Redisson](https://github.com/redisson/redisson)**. Solutions in other languages ​​can be found in the official Redis documentation at: <https://redis.io/topics/distlock>.

![Distributed locks with Redis](https://oss.javaguide.cn/github/javaguide/redis-distributed-lock.png)

Redisson is an open source Java language Redis client that provides many out-of-the-box features, including not only the implementation of multiple distributed locks. Moreover, Redisson also supports multiple deployment architectures such as Redis stand-alone, Redis Sentinel, and Redis Cluster.

The distributed lock in Redisson comes with an automatic renewal mechanism. It is very simple to use and the principle is relatively simple. It provides a **Watch Dog** specially used to monitor and renew the lock. If the thread operating the shared resource has not completed execution, the Watch Dog will continuously extend the expiration time of the lock, thereby ensuring that the lock will not be released due to timeout.

![Redisson watchdog automatic renewal](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redisson-renew-expiration.png)

The name of the watchdog comes from the `getLockWatchdogTimeout()` method. This method returns the expiration time for the watchdog to renew the lock. The default is 30 seconds ([redisson-3.17.6](https://github.com/redisson/redisson/releases/tag/redisson-3.17.6)).

```java
//Default 30 seconds, supports modification
private long lockWatchdogTimeout = 30 * 1000;

public Config setLockWatchdogTimeout(long lockWatchdogTimeout) {
    this.lockWatchdogTimeout = lockWatchdogTimeout;
    return this;
}
public long getLockWatchdogTimeout() {
   return lockWatchdogTimeout;
}
```

The `renewExpiration()` method contains the main logic of the watchdog:

```java
private void renewExpiration() {
         //......
        Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
            @Override
            public void run(Timeout timeout) throws Exception {
                //......
                //Asynchronous renewal, based on Lua script
                CompletionStage<Boolean> future = renewExpirationAsync(threadId);
                future.whenComplete((res, e) -> {
                    if (e != null) {
                        //Cannot renew
                        log.error("Can't update lock " + getRawName() + " expiration", e);
                        EXPIRATION_RENEWAL_MAP.remove(getEntryName());
                        return;
                    }

                    if (res) {
                        // Recursive call to implement renewal
                        renewExpiration();
                    } else {
                        // Cancel renewal
                        cancelExpirationRenewal(null);
                    }
                });
            }
         // Delay internalLockLeaseTime/3 (default 10s, which is 30/3) before calling
        }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);

        ee.setTimeout(task);
    }
```默认情况下，每过 10 秒，看门狗就会执行续期操作，将锁的超时时间设置为 30 秒。看门狗续期前也会先判断是否需要执行续期操作，需要才会执行续期，否则取消续期操作。

Watch Dog 通过调用 `renewExpirationAsync()` 方法实现锁的异步续期：

```java
protected CompletionStage<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            // 判断是否为持锁线程，如果是就执行续期操作，就锁的过期时间设置为 30s（默认）
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getRawName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

可以看出， `renewExpirationAsync` 方法其实是调用 Lua 脚本实现的续期，这样做主要是为了保证续期操作的原子性。

我这里以 Redisson 的分布式可重入锁 `RLock` 为例来说明如何使用 Redisson 实现分布式锁：

```java
// 1.获取指定的分布式锁对象
RLock lock = redisson.getLock("lock");
// 2.拿锁且不设置锁超时时间，具备 Watch Dog 自动续期机制
lock.lock();
// 3.执行业务
...
// 4.释放锁
lock.unlock();
```

只有未指定锁超时时间，才会使用到 Watch Dog 自动续期机制。

```java
// 手动给锁设置过期时间，不具备 Watch Dog 自动续期机制
lock.lock(10, TimeUnit.SECONDS);
```

如果使用 Redis 来实现分布式锁的话，还是比较推荐直接基于 Redisson 来做的。

### 如何实现可重入锁？

所谓可重入锁指的是在一个线程中可以多次获取同一把锁，比如一个线程在执行一个带锁的方法，该方法中又调用了另一个需要相同锁的方法，则该线程可以直接执行调用的方法即可重入 ，而无需重新获得锁。像 Java 中的 `synchronized` 和 `ReentrantLock` 都属于可重入锁。

**不可重入的分布式锁基本可以满足绝大部分业务场景了，一些特殊的场景可能会需要使用可重入的分布式锁。**

可重入分布式锁的实现核心思路是线程在获取锁的时候判断是否为自己的锁，如果是的话，就不用再重新获取了。为此，我们可以为每个锁关联一个可重入计数器和一个占有它的线程。当可重入计数器大于 0 时，则锁被占有，需要判断占有该锁的线程和请求获取锁的线程是否为同一个。

实际项目中，我们不需要自己手动实现，推荐使用我们上面提到的 **Redisson** ，其内置了多种类型的锁比如可重入锁（Reentrant Lock）、自旋锁（Spin Lock）、公平锁（Fair Lock）、多重锁（MultiLock）、 红锁（RedLock）、 读写锁（ReadWriteLock）。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redisson-readme-locks.png)

### Redis 如何解决集群情况下分布式锁的可靠性？

为了避免单点故障，生产环境下的 Redis 服务通常是集群化部署的。

Redis 集群下，上面介绍到的分布式锁的实现会存在一些问题。由于 Redis 集群数据同步到各个节点时是异步的，如果在 Redis 主节点获取到锁后，在没有同步到其他节点时，Redis 主节点宕机了，此时新的 Redis 主节点依然可以获取锁，所以多个应用服务就可以同时获取到锁。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redis-master-slave-distributed-lock.png)

针对这个问题，Redis 之父 antirez 设计了 [Redlock 算法](https://redis.io/topics/distlock) 来解决。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redis.io-realock.png)

Redlock 算法的思想是让客户端向 Redis 集群中的多个独立的 Redis 实例依次请求申请加锁，如果客户端能够和半数以上的实例成功地完成加锁操作，那么我们就认为，客户端成功地获得分布式锁，否则加锁失败。

即使部分 Redis 节点出现问题，只要保证 Redis 集群中有半数以上的 Redis 节点可用，分布式锁服务就是正常的。

Redlock 是直接操作 Redis 节点的，并不是通过 Redis 集群操作的，这样才可以避免 Redis 集群主从切换导致的锁丢失问题。

Redlock 实现比较复杂，性能比较差，发生时钟变迁的情况下还存在安全性隐患。《数据密集型应用系统设计》一书的作者 Martin Kleppmann 曾经专门发文（[How to do distributed locking - Martin Kleppmann - 2016](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)）怼过 Redlock，他认为这是一个很差的分布式锁实现。感兴趣的朋友可以看看[Redis 锁从面试连环炮聊到神仙打架](https://mp.weixin.qq.com/s?__biz=Mzg3NjU3NTkwMQ==&mid=2247505097&idx=1&sn=5c03cb769c4458350f4d4a321ad51f5a&source=41#wechat_redirect)这篇文章，有详细介绍到 antirez 和 Martin Kleppmann 关于 Redlock 的激烈辩论。

实际项目中不建议使用 Redlock 算法，成本和收益不成正比，可以考虑基于 Redis 主从复制+哨兵模式实现分布式锁。

## 基于 ZooKeeper 实现分布式锁

ZooKeeper 相比于 Redis 实现分布式锁，除了提供相对更高的可靠性之外，在功能层面还有一个非常有用的特性：**Watch 机制**。这个机制可以用来实现公平的分布式锁。不过，使用 ZooKeeper 实现的分布式锁在性能方面相对较差，因此如果对性能要求比较高的话，ZooKeeper 可能就不太适合了。

### 如何基于 ZooKeeper 实现分布式锁？

ZooKeeper 分布式锁是基于 **临时顺序节点** 和 **Watcher（事件监听器）** 实现的。

获取锁：

1. 首先我们要有一个持久节点`/locks`，客户端获取锁就是在`locks`下创建临时顺序节点。
2. 假设客户端 1 创建了`/locks/lock1`节点，创建成功之后，会判断 `lock1`是否是 `/locks` 下最小的子节点。
3. 如果 `lock1`是最小的子节点，则获取锁成功。否则，获取锁失败。
4. 如果获取锁失败，则说明有其他的客户端已经成功获取锁。客户端 1 并不会不停地循环去尝试加锁，而是在前一个节点比如`/locks/lock0`上注册一个事件监听器。这个监听器的作用是当前一个节点释放锁之后通知客户端 1（避免无效自旋），这样客户端 1 就加锁成功了。

释放锁：

1. 成功获取锁的客户端在执行完业务流程之后，会将对应的子节点删除。
2. 成功获取锁的客户端在出现故障之后，对应的子节点由于是临时顺序节点，也会被自动删除，避免了锁无法被释放。
3. 我们前面说的事件监听器其实监听的就是这个子节点删除事件，子节点删除就意味着锁被释放。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-zookeeper.png)

In actual projects, it is recommended to use Curator to implement ZooKeeper distributed locks. Curator is a set of ZooKeeper Java client frameworks open sourced by Netflix. Compared with ZooKeeper's own client zookeeper, Curator's encapsulation is more complete, and various APIs can be used more conveniently.

`Curator` mainly implements the following four locks:

- `InterProcessMutex`: distributed reentrant exclusive lock
- `InterProcessSemaphoreMutex`: distributed non-reentrant exclusive lock
- `InterProcessReadWriteLock`: distributed read-write lock
- `InterProcessMultiLock`: A container that manages multiple locks as a single entity. When acquiring a lock, all locks are acquired. Releasing the lock will also release all lock resources (ignore locks that fail to be released).

```java
CuratorFramework client = ZKUtils.getClient();
client.start();
// Distributed reentrant exclusive lock
InterProcessLock lock1 = new InterProcessMutex(client, lockPath1);
// Distributed non-reentrant exclusive lock
InterProcessLock lock2 = new InterProcessSemaphoreMutex(client, lockPath2);
// Treat multiple locks as a whole
InterProcessMultiLock lock = new InterProcessMultiLock(Arrays.asList(lock1, lock2));

if (!lock.acquire(10, TimeUnit.SECONDS)) {
   throw new IllegalStateException("Cannot acquire multiple locks");
}
System.out.println("Multiple locks acquired");
System.out.println("Is there the first lock: " + lock1.isAcquiredInThisProcess());
System.out.println("Is there a second lock: " + lock2.isAcquiredInThisProcess());
try {
    // Resource operations
    resource.use();
} finally {
    System.out.println("Release multiple locks");
    lock.release();
}
System.out.println("Is there the first lock: " + lock1.isAcquiredInThisProcess());
System.out.println("Is there a second lock: " + lock2.isAcquiredInThisProcess());
client.close();
```

### Why use temporary sequential nodes?

Each data node is called **znode** in ZooKeeper, which is the smallest unit of data in ZooKeeper.

We usually divide znodes into 4 major categories:

- **persistent (PERSISTENT) node**: Once created, it will always exist even if the ZooKeeper cluster goes down, until it is deleted.
- **Temporary (EPHEMERAL) node**: The life cycle of the temporary node is bound to the **client session (session)**. **The node disappears when the session disappears**. Moreover, **temporary nodes can only be used as leaf nodes** and cannot create child nodes.
- **Persistent Sequence (PERSISTENT_SEQUENTIAL) node**: In addition to the characteristics of the persistent (PERSISTENT) node, the names of child nodes are also sequential. For example `/node1/app0000000001`, `/node1/app0000000002`.
- **Temporary Sequential (EPHEMERAL_SEQUENTIAL) Node**: In addition to having the characteristics of temporary (EPHEMERAL) nodes, the names of child nodes are also sequential.

It can be seen that compared with persistent nodes, the most important thing about temporary nodes is that they handle session failure differently. When the temporary node session disappears, the corresponding node disappears. In this case, it doesn't matter if an exception occurs on the client and the lock is not released in time. The session invalid node will be automatically deleted and deadlock will not occur.

When using Redis to implement distributed locks, we use the expiration time to avoid deadlock problems caused by the lock being unable to be released, while ZooKeeper can directly use the characteristics of temporary nodes.

Assuming that sequential nodes are not used, all clients that try to acquire a lock will add listeners to the child nodes holding the lock. When the lock is released, it will inevitably cause all clients trying to obtain the lock to compete for the lock, which is not friendly to performance. After using sequential nodes, you only need to listen to the previous node, which is more performance-friendly.

### Why do we need to set up monitoring on the previous node?

> Watcher (event listener) is a very important feature in ZooKeeper. ZooKeeper allows users to register some Watchers on designated nodes, and when certain events are triggered, the ZooKeeper server will notify interested clients of the event. This mechanism is an important feature of ZooKeeper in implementing distributed coordination services.

During the same time period, many clients may acquire the lock at the same time, but only one can acquire it successfully. If the lock acquisition fails, it means that another client has successfully acquired the lock. The client that fails to acquire the lock will not keep looping to try to acquire the lock, but will register an event listener on the previous node.

The function of this event listener is: **After the client corresponding to the current node releases the lock (that is, after the previous node is deleted, the listening event is the deletion event), notify the client that failed to acquire the lock (wake up the waiting thread, `wait/notifyAll` in Java), let it try to acquire the lock, and then successfully acquire the lock. **

### How to implement reentrant lock?

Here we use Curator's `InterProcessMutex` to introduce the implementation of reentrant locks (source code address: [InterProcessMutex.java](https://github.com/apache/curator/blob/master/curator-recipes/src/main/java/org/apache/curator/framework/recipes/locks/InterProcessMutex.java)).

When we call the `InterProcessMutex#acquire` method to acquire the lock, the `InterProcessMutex#internalLock` method will be called.

```java
// Acquire the reentrant mutex until the acquisition is successful
@Override
public void acquire() throws Exception {
  if (!internalLock(-1, null)) {
    throw new IOException("Lost connection while trying to acquire lock: " + basePath);
  }
}
```

The `internalLock` method will first obtain the thread currently requesting the lock, and then obtain the `lockData` corresponding to the current thread from `threadData` (`ConcurrentMap<Thread, LockData>` type). `lockData` contains lock information and the number of locks, which is the key to implementing reentrant locks.

When the lock is acquired for the first time, `lockData` is `null`. After successfully acquiring the lock, the current thread and the corresponding `lockData` will be placed in `threadData`

```java
private boolean internalLock(long time, TimeUnit unit) throws Exception {
  // Get the thread currently requesting the lock
  Thread currentThread = Thread.currentThread();
  // Get the corresponding lockData
  LockData lockData = threadData.get(currentThread);
  // When acquiring the lock for the first time, lockData is null
  if (lockData != null) {
    //After the current thread acquires the lock once
    // Because the current thread's lock exists, lockCount is incremented and then returned to achieve lock reentrancy.
    lockData.lockCount.incrementAndGet();
    return true;
  }
  //Try to acquire the lock
  String lockPath = internals.attemptLock(time, unit, getLockNodeBytes());
  if (lockPath != null) {
    LockData newLockData = new LockData(currentThread, lockPath);
     // After successfully acquiring the lock, put the current thread and the corresponding lockData into threadData.
    threadData.put(currentThread, newLockData);
    return true;
  }

  return false;
}
```

`LockData` is a static inner class in `InterProcessMutex`.

```java
private final ConcurrentMap<Thread, LockData> threadData = Maps.newConcurrentMap();

private static class LockData
{
    //The thread currently holding the lock
    final Thread owningThread;
    // Lock the corresponding child node
    final String lockPath;
    //Number of locks
    final AtomicInteger lockCount = new AtomicInteger(1);

    private LockData(Thread owningThread, String lockPath)
    {
      this.owningThread = owningThread;
      this.lockPath = lockPath;
    }
}```

If the lock has been acquired once and you acquire the lock again later, it will be blocked directly at `if (lockData != null)`, and then `lockData.lockCount.incrementAndGet();` will be executed to increase the number of locks by 1.

The implementation logic of the entire reentrant lock is very simple. You can directly determine whether the current thread has acquired the lock on the client side. If so, just add 1 to the number of locks.

## Summary

In this article, I introduced two common ways to implement distributed locks: **Redis** and **ZooKeeper**. As for the specific choice of Redis or ZooKeeper to implement distributed locks, it still depends on the specific needs of the business.

- If the performance requirements are relatively high, it is recommended to use Redis to implement distributed locks. It is recommended to choose the ready-made distributed lock provided by **Redisson** instead of implementing it yourself. It is not recommended to use the Redlock algorithm in actual projects because the costs and benefits are not proportional. You can consider implementing distributed locks based on Redis master-slave replication + sentinel mode.
- If the reliability requirements are relatively high, it is recommended to use ZooKeeper to implement distributed locks, and it is recommended to implement it based on the **Curator** framework. However, many projects now do not use ZooKeeper. It is not advisable to introduce ZooKeeper simply because of distributed locks. It is not recommended. It increases the complexity of the system for a small function.

It should be noted that no matter which method you choose to implement distributed locks, including Redis, ZooKeeper or Etcd (not introduced in this article, but often used to implement distributed locks), there is no guarantee of 100% security, especially when encountering abnormal situations such as process garbage collection (GC) and network delays.

In order to further improve the reliability of the system, it is recommended to introduce a safety net mechanism. For example, concurrency conflicts can be avoided through the **version number (Fencing Token) mechanism**.

<!-- @include: @article-footer.snippet.md -->