---
title: 分布式锁实现方案详解：Redis、Redlock、ZooKeeper 与 Redisson 看门狗
category: 分布式
description: 分布式锁实现方案详解，覆盖 Redis SET NX EX、Lua 安全释放、Redisson Watch Dog、Redlock、ZooKeeper 临时顺序节点、Curator 可重入锁和 Fencing Token 等生产实践。
tag:
  - 分布式锁
head:
  - - meta
    - name: keywords
      content: 分布式锁,Redis 分布式锁,ZooKeeper 分布式锁,Redisson,Watch Dog,SETNX,Redlock,Fencing Token,Curator,分布式锁实现,分布式锁面试题
---

通常情况下，我们一般会选择基于 Redis 或者 ZooKeeper 实现分布式锁，Redis 用的要更多一点，我这里也先以 Redis 为例介绍分布式锁的实现。

这篇文章默认你已经知道为什么需要分布式锁。如果你还没搞清楚锁粒度、owner token、锁超时和业务临界区，建议先看 [分布式锁入门](./distributed-lock.md)。如果你想把锁过期、旧客户端恢复、Fencing Token 放到更大的协调模型里理解，可以结合 [分布式协调详解](./protocol/centralized-and-decentralized.md)。

## 基于 Redis 实现分布式锁

### 如何基于 Redis 实现一个最简易的分布式锁？

不论是本地锁还是分布式锁，核心都在于“互斥”。

在 Redis 中，`SETNX` 命令可以帮助我们实现互斥。`SETNX` 即 **SET** if **N**ot e**X**ists（对应 Java 中的 `setIfAbsent` 方法），如果 key 不存在的话，才会设置 key 的值。如果 key 已经存在，`SETNX` 啥也不做。

```bash
> SETNX lockKey uniqueValue
(integer) 1
> SETNX lockKey uniqueValue
(integer) 0
```

释放锁的话，直接通过 `DEL` 命令删除对应的 key 即可。

```bash
> DEL lockKey
(integer) 1
```

为了防止误删到其他的锁，这里我们建议使用 Lua 脚本先比对 key 对应的 value 是否为加锁时写入的唯一值，校验通过后再删除。

选用 Lua 脚本是为了保证解锁操作的原子性。因为 Redis 在执行 Lua 脚本时，可以以原子性的方式执行，从而保证了锁释放操作的原子性。

```lua
-- 释放锁时，先比对 key 对应的 value 是否为加锁时写入的唯一值，校验通过后再删除，避免误删其他客户端持有的锁
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

![Redis 实现简易分布式锁](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-setnx.png)

这是一种最简易的 Redis 分布式锁实现，实现方式比较简单，性能也很高效。不过，这种方式实现分布式锁存在一些问题。就比如应用程序遇到一些问题比如释放锁的逻辑突然挂掉，可能会导致锁无法被释放，进而造成共享资源无法再被其他线程/进程访问。

### 为什么要给锁设置一个过期时间？

为了避免锁无法被释放，我们可以想到的一个解决办法就是：**给这个 key（也就是锁）设置一个过期时间**。

```bash
127.0.0.1:6379> SET lockKey uniqueValue EX 3 NX
OK
```

- **lockKey**：加锁的锁名；
- **uniqueValue**：能够唯一标识锁的随机字符串；
- **NX**：只有当 lockKey 对应的 key 值不存在的时候才能 SET 成功；
- **EX**：过期时间设置（秒为单位）。`EX 3` 表示这个锁有一个 3 秒的自动过期时间。与 `EX` 对应的是 `PX`（毫秒为单位），这两个都是过期时间设置。

**一定要保证设置指定 key 的值和过期时间是一个原子操作！！！** 不然的话，依然可能会出现锁无法被释放的问题。

为什么要用 `SET NX EX`，而不是先 `SETNX` 再 `EXPIRE` 呢？早期常见的 `SETNX` 后再 `EXPIRE` 是两步操作，如果客户端在 `SETNX` 成功后、`EXPIRE` 前崩溃，会留下永久锁。Redis 2.6.12 起支持 `SET key value NX EX seconds` 这类原子写法，应优先使用这种方式避免死锁风险。

这样确实可以解决问题，不过，这种解决办法同样存在漏洞：**如果操作共享资源的时间大于过期时间，就会出现锁提前过期的问题，进而导致分布式锁直接失效。如果锁的超时时间设置过长，又会影响到性能。**

这也是后文需要 Fencing Token 的根源：单纯延长 TTL 不能消除“客户端 A 仍以为自己持锁，但锁实际已过期并被客户端 B 获取”的窗口。

你或许在想：**如果操作共享资源的操作还未完成，锁过期时间能够自己续期就好了！**

### 如何实现锁的优雅续期？

对于 Java 开发的小伙伴来说，已经有了现成的解决方案：**[Redisson](https://github.com/redisson/redisson)**。其他语言的解决方案，可以在 Redis 官方文档中找到，地址：<https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/>。

![Distributed locks with Redis](https://oss.javaguide.cn/github/javaguide/redis-distributed-lock.png)

Redisson 是一个开源的 Java 语言 Redis 客户端，提供了很多开箱即用的功能，不仅仅包括多种分布式锁的实现。并且，Redisson 还支持 Redis 单机、Redis Sentinel、Redis Cluster 等多种部署架构。

Redisson 中的分布式锁自带自动续期机制，使用起来非常简单，原理也比较简单，其提供了一个专门用来监控和续期锁的 **Watch Dog（看门狗）**，如果操作共享资源的线程还未执行完成的话，Watch Dog 会不断地延长锁的过期时间，进而保证锁不会因为超时而被释放。

![Redisson 看门狗自动续期](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redisson-renew-expiration.png)

看门狗名字的由来于 `getLockWatchdogTimeout()` 方法，这个方法返回的是看门狗给锁续期的过期时间，默认为 30 秒（基于 [redisson-3.17.6](https://github.com/redisson/redisson/releases/tag/redisson-3.17.6)）。Redisson 当前已进入 4.x 版本，具体配置语义建议以项目实际使用版本的 `Config#getLockWatchdogTimeout` 和 `RedissonBaseLock#renewExpiration` 源码为准。

```java
// 默认 30 秒，支持修改
private long lockWatchdogTimeout = 30 * 1000;

public Config setLockWatchdogTimeout(long lockWatchdogTimeout) {
    this.lockWatchdogTimeout = lockWatchdogTimeout;
    return this;
}
public long getLockWatchdogTimeout() {
   return lockWatchdogTimeout;
}
```

`renewExpiration()` 方法包含了看门狗的主要逻辑：

```java
private void renewExpiration() {
         //......
        Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
            @Override
            public void run(Timeout timeout) throws Exception {
                //......
                // 异步续期，基于 Lua 脚本
                CompletionStage<Boolean> future = renewExpirationAsync(threadId);
                future.whenComplete((res, e) -> {
                    if (e != null) {
                        // 无法续期
                        log.error("Can't update lock " + getRawName() + " expiration", e);
                        EXPIRATION_RENEWAL_MAP.remove(getEntryName());
                        return;
                    }

                    if (res) {
                        // 通过定时器回调链式触发下一次续期，非栈式递归，不会导致调用栈无限增长
                        renewExpiration();
                    } else {
                        // 取消续期
                        cancelExpirationRenewal(null);
                    }
                });
            }
         // 延迟 internalLockLeaseTime/3（默认 10s，也就是 30/3）再调用
        }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);

        ee.setTimeout(task);
    }
```

默认情况下，每过 10 秒，看门狗就会执行续期操作，将锁的超时时间设置为 30 秒。看门狗续期前也会先判断是否需要执行续期操作，需要才会执行续期，否则取消续期操作。

Watch Dog 通过调用 `renewExpirationAsync()` 方法实现锁的异步续期：

```java
protected CompletionStage<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            // 判断是否为持锁线程，如果是就执行续期操作，将锁的过期时间设置为 30s（默认）
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getRawName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

可以看出，`renewExpirationAsync` 方法其实是调用 Lua 脚本实现的续期，这样做主要是为了保证续期操作的原子性。

我这里以 Redisson 的可重入锁实现 `RLock` 为例来说明如何使用 Redisson 实现分布式锁：

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

所谓可重入锁指的是在一个线程中可以多次获取同一把锁，比如一个线程在执行一个带锁的方法，该方法中又调用了另一个需要相同锁的方法，则该线程可以直接执行调用的方法即可重入，而无需重新获得锁。像 Java 中的 `synchronized` 和 `ReentrantLock` 都属于可重入锁。

**不可重入的分布式锁基本可以满足绝大部分业务场景了，一些特殊的场景可能会需要使用可重入的分布式锁。**

可重入分布式锁的实现核心思路是线程在获取锁的时候判断是否为自己的锁，如果是的话，就不用再重新获取了。为此，我们可以为每个锁关联一个可重入计数器和一个占有它的线程。当可重入计数器大于 0 时，则锁被占有，需要判断占有该锁的线程和请求获取锁的线程是否为同一个。

实际项目中，我们不需要自己手动实现，推荐使用我们上面提到的 **Redisson**，其内置了多种类型的锁比如可重入锁（Reentrant Lock）、自旋锁（Spin Lock）、公平锁（Fair Lock）、多重锁（MultiLock）、红锁（RedLock）、读写锁（ReadWriteLock）。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redisson-readme-locks.png)

### Redis 如何解决集群情况下分布式锁的可靠性？

为了避免单点故障，生产环境下的 Redis 服务通常是集群化部署的。

Redis 集群下，上面介绍到的分布式锁的实现会存在一些问题。Redis 主从复制默认是异步的：主节点写入锁成功后会立即返回客户端，再异步同步给从节点。如果主节点在同步前宕机，Sentinel 或 Redis Cluster 故障转移可能把尚未收到锁数据的从节点提升为新主，导致原锁丢失，其他客户端可以再次加锁，从而破坏互斥性。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redis-master-slave-distributed-lock.png)

针对这个问题，Redis 之父 antirez 设计了 [Redlock 算法](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) 来解决。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redis.io-realock.png)

Redlock 算法的思想是让客户端向多个相互独立的 Redis master 依次请求申请加锁，如果客户端能够在严格多数派实例上成功完成加锁操作，那么就可以认为客户端成功获得分布式锁，否则加锁失败。

Redlock 的完整判断条件如下：

- 使用 N 个相互独立的 Redis master（不是 Redis Cluster 分片）。
- 客户端记录开始时间。
- 依次向各节点用相同的 key、value、TTL 加锁，每次请求设置较短超时，避免单个节点拖慢整体加锁。
- 只有获得至少 `N/2 + 1` 个节点成功，且总耗时小于 TTL，才算加锁成功。
- 锁的实际有效时间约为 `TTL - 加锁耗时 - 时钟漂移余量`。
- 失败时要向所有节点发起释放，包括加锁失败或请求超时的节点。

Redlock 是直接操作独立 Redis 节点的，并不是通过 Redis Cluster 操作的，这样才可以避免单个主从分片故障转移导致的锁丢失问题。

Redlock 实现比较复杂，性能比较差，发生时钟变迁的情况下还存在安全性隐患。《数据密集型应用系统设计》一书的作者 Martin Kleppmann 曾经专门发文（[How to do distributed locking - Martin Kleppmann - 2016](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)）批评过 Redlock，他认为这是一个很差的分布式锁实现。感兴趣的朋友可以看看[Redis 锁从面试连环炮聊到神仙打架](https://mp.weixin.qq.com/s?__biz=Mzg3NjU3NTkwMQ==&mid=2247505097&idx=1&sn=5c03cb769c4458350f4d4a321ad51f5a&source=41#wechat_redirect)这篇文章，有详细介绍到 antirez 和 Martin Kleppmann 关于 Redlock 的讨论。

如何判断是否该用 Redlock？核心是先区分锁的使用场景：

1. 如果是**效率型加锁**，也就是锁失效时只是造成重复计算、重复执行任务这类可接受后果，可以使用 Redis 单实例、Sentinel 或 Cluster 方案，并显式接受极端情况下偶发并发执行的风险。
2. 如果是**正确性型加锁**，也就是锁失效会造成库存错误、资金错误、数据损坏这类不可接受后果，应优先考虑 ZooKeeper/etcd，并配合 Fencing Token，而不是依赖 Redis 主从故障转移保证强互斥。
3. Redlock 依赖有界网络延迟、有界进程暂停、有界时钟漂移。GC 长停顿、时钟跳变、延迟报文都会削弱其正确性。
4. Martin Kleppmann 的核心观点是：正确性型锁必须配合 Fencing Token；antirez 的反驳重点在于工程实践中时钟漂移影响有限、随机 value 可防误删。读者应先区分场景，再选方案。

## 基于 ZooKeeper 实现分布式锁

ZooKeeper 相比于 Redis 实现分布式锁，除了提供相对更高的可靠性之外，在功能层面还有一个非常有用的特性：**Watch 机制**。这个机制可以用来实现公平的分布式锁。不过，使用 ZooKeeper 实现的分布式锁在性能方面相对较差，因此如果对性能要求比较高的话，ZooKeeper 可能就不太适合了。

### 如何基于 ZooKeeper 实现分布式锁？

ZooKeeper 分布式锁是基于 **临时顺序节点** 和 **Watcher（事件监听器）** 实现的。

获取锁：

1. 首先我们要有一个持久节点 `/locks`，客户端获取锁就是在 `/locks` 下创建临时顺序节点。
2. 假设客户端 1 创建了 `/locks/lock1` 节点，创建成功之后，会判断 `lock1` 是否是 `/locks` 下最小的子节点。
3. 如果 `lock1` 是最小的子节点，则获取锁成功。否则，获取锁失败。
4. 如果获取锁失败，则说明有其他的客户端已经成功获取锁。客户端 1 并不会不停地循环去尝试加锁，而是在前一个节点比如 `/locks/lock0` 上注册一个事件监听器。这个监听器的作用是当前一个节点释放锁之后通知客户端 1（避免无效自旋），这样客户端 1 就加锁成功了。

释放锁：

1. 成功获取锁的客户端在执行完业务流程之后，会将对应的子节点删除。
2. 成功获取锁的客户端在出现故障之后，对应的子节点由于是临时顺序节点，也会被自动删除，避免了锁无法被释放。
3. 我们前面说的事件监听器其实监听的就是这个子节点删除事件，子节点删除就意味着锁被释放。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-zookeeper.png)

实际项目中，推荐使用 Curator 来实现 ZooKeeper 分布式锁。Curator 是 Netflix 公司开源的一套 ZooKeeper Java 客户端框架，相比于 ZooKeeper 自带的客户端 zookeeper 来说，Curator 的封装更加完善，各种 API 都可以比较方便地使用。

`Curator`主要实现了下面四种锁：

- `InterProcessMutex`：分布式可重入排它锁
- `InterProcessSemaphoreMutex`：分布式不可重入排它锁
- `InterProcessReadWriteLock`：分布式读写锁
- `InterProcessMultiLock`：将多个锁作为单个实体管理的容器，获取锁的时候获取所有锁，释放锁也会释放所有锁资源（忽略释放失败的锁）。

```java
CuratorFramework client = ZKUtils.getClient();
client.start();
// 分布式可重入排它锁
InterProcessLock lock1 = new InterProcessMutex(client, lockPath1);
// 分布式不可重入排它锁
InterProcessLock lock2 = new InterProcessSemaphoreMutex(client, lockPath2);
// 将多个锁作为一个整体
InterProcessMultiLock lock = new InterProcessMultiLock(Arrays.asList(lock1, lock2));

if (!lock.acquire(10, TimeUnit.SECONDS)) {
   throw new IllegalStateException("不能获取多锁");
}
System.out.println("已获取多锁");
System.out.println("是否有第一个锁: " + lock1.isAcquiredInThisProcess());
System.out.println("是否有第二个锁: " + lock2.isAcquiredInThisProcess());
try {
    // 资源操作
    resource.use();
} finally {
    System.out.println("释放多个锁");
    lock.release();
}
System.out.println("是否有第一个锁: " + lock1.isAcquiredInThisProcess());
System.out.println("是否有第二个锁: " + lock2.isAcquiredInThisProcess());
client.close();
```

### 为什么要用临时顺序节点？

每个数据节点在 ZooKeeper 中被称为 **znode**，它是 ZooKeeper 中数据的最小单元。

我们通常是将 znode 分为 4 大类：

- **持久（PERSISTENT）节点**：一旦创建就一直存在即使 ZooKeeper 集群宕机，直到将其删除。
- **临时（EPHEMERAL）节点**：临时节点的生命周期是与 **客户端会话（session）** 绑定的，**会话消失则节点消失**。并且，**临时节点只能做叶子节点**，不能创建子节点。
- **持久顺序（PERSISTENT_SEQUENTIAL）节点**：除了具有持久（PERSISTENT）节点的特性之外，子节点的名称还具有顺序性。比如 `/node1/app0000000001`、`/node1/app0000000002`。
- **临时顺序（EPHEMERAL_SEQUENTIAL）节点**：除了具备临时（EPHEMERAL）节点的特性之外，子节点的名称还具有顺序性。

可以看出，临时节点相比持久节点，最主要的是对会话失效的情况处理不一样，临时节点会话消失则对应的节点消失。这样的话，如果客户端发生异常导致没来得及释放锁也没关系，会话失效节点会自动被删除，可以避免客户端进程崩溃后永久占锁。

不过，ZooKeeper 同样需要考虑 GC 停顿、网络分区和 session timeout。客户端长时间 GC 或网络分区导致 session 过期时，ZooKeeper 会删除临时节点并允许新客户端加锁，而旧客户端可能还没感知到会话失效，仍以为自己持锁。对于正确性要求高的场景，仍应结合 Fencing Token 防止旧客户端恢复后写入陈旧数据。

使用 Redis 实现分布式锁的时候，我们是通过过期时间来避免锁无法被释放导致死锁问题的，而 ZooKeeper 可以利用临时节点的特性处理客户端崩溃后的锁释放问题。

假设不使用顺序节点的话，所有尝试获取锁的客户端都会对持有锁的子节点加监听器。当该锁被释放之后，势必会造成所有尝试获取锁的客户端来争夺锁，这样对性能不友好。使用顺序节点之后，只需要监听前一个节点就好了，对性能更友好。

### 为什么要设置对前一个节点的监听？

> Watcher（事件监听器），是 ZooKeeper 中的一个很重要的特性。ZooKeeper 允许用户在指定节点上注册一些 Watcher，并且在一些特定事件触发的时候，ZooKeeper 服务端会将事件通知到感兴趣的客户端上去，该机制是 ZooKeeper 实现分布式协调服务的重要特性。

同一时间段内，可能会有很多客户端同时获取锁，但只有一个可以获取成功。如果获取锁失败，则说明有其他的客户端已经成功获取锁。获取锁失败的客户端并不会不停地循环去尝试加锁，而是在前一个节点注册一个事件监听器。

这个事件监听器的作用是：**当前一个节点对应的客户端释放锁之后（也就是前一个节点被删除之后，监听的是删除事件），通知获取锁失败的客户端（唤醒等待的线程，Java 中的 `wait/notifyAll`），让它尝试去获取锁，然后就成功获取锁了。**

### 如何实现可重入锁？

这里以 Curator 的 `InterProcessMutex` 对可重入锁的实现来介绍（源码地址：[InterProcessMutex.java](https://github.com/apache/curator/blob/master/curator-recipes/src/main/java/org/apache/curator/framework/recipes/locks/InterProcessMutex.java)）。

当我们调用 `InterProcessMutex#acquire` 方法获取锁的时候，会调用 `InterProcessMutex#internalLock` 方法。

```java
// 获取可重入互斥锁，直到获取成功为止
@Override
public void acquire() throws Exception {
  if (!internalLock(-1, null)) {
    throw new IOException("Lost connection while trying to acquire lock: " + basePath);
  }
}
```

`internalLock` 方法会先获取当前请求锁的线程，然后从 `threadData`（`ConcurrentMap<Thread, LockData>` 类型）中获取当前线程对应的 `lockData`。`lockData` 包含锁的信息和加锁的次数，是实现可重入锁的关键。

第一次获取锁的时候，`lockData` 为 `null`。获取锁成功之后，会将当前线程和对应的 `lockData` 放到 `threadData` 中。

```java
private boolean internalLock(long time, TimeUnit unit) throws Exception {
  // 获取当前请求锁的线程
  Thread currentThread = Thread.currentThread();
  // 拿对应的 lockData
  LockData lockData = threadData.get(currentThread);
  // 第一次获取锁的话，lockData 为 null
  if (lockData != null) {
    // 当前线程获取过一次锁之后
    // 因为当前线程的锁存在，lockCount 自增后返回，实现锁重入
    lockData.lockCount.incrementAndGet();
    return true;
  }
  // 尝试获取锁
  String lockPath = internals.attemptLock(time, unit, getLockNodeBytes());
  if (lockPath != null) {
    LockData newLockData = new LockData(currentThread, lockPath);
    // 获取锁成功之后，将当前线程和对应的 lockData 放到 threadData 中
    threadData.put(currentThread, newLockData);
    return true;
  }

  return false;
}
```

`LockData` 是 `InterProcessMutex` 中的一个静态内部类。

```java
private final ConcurrentMap<Thread, LockData> threadData = Maps.newConcurrentMap();

private static class LockData
{
    // 当前持有锁的线程
    final Thread owningThread;
    // 锁对应的子节点
    final String lockPath;
    // 加锁的次数
    final AtomicInteger lockCount = new AtomicInteger(1);

    private LockData(Thread owningThread, String lockPath)
    {
      this.owningThread = owningThread;
      this.lockPath = lockPath;
    }
}
```

如果已经获取过一次锁，后面再来获取锁的话，直接就会在 `if (lockData != null)` 这里被拦下了，然后就会执行 `lockData.lockCount.incrementAndGet();` 将加锁次数加 1。

整个可重入锁的实现逻辑非常简单，直接在客户端判断当前线程有没有获取锁，有的话直接将加锁次数加 1 就可以了。

需要注意可重入的边界：Curator `InterProcessMutex` 的可重入仅限同一 JVM 内的同一线程。Redisson 的 `RLock` 也是通过 `UUID:threadId` 记录持锁线程和重入计数，并不表示同一业务用户跨 JVM、跨线程天然可重入。如果需要跨进程或跨 JVM 的业务级可重入，需要在应用层设计业务身份、幂等和去重逻辑。

## Fencing Token 的工程落地

Fencing Token（隔离令牌）本身只是一个单调递增的版本号，只有资源端配合校验才能发挥作用。客户端访问数据库、对象存储或外部资源时必须携带 token；资源端需要保存已见过的最大 token，并拒绝任何更小 token 的写入。否则，单独生成 token 没有意义。

常见落地方式如下：

| 存储/系统 | Token 来源                              | 校验方式                                                                                           |
| --------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| MySQL     | 业务表增加 `fencing_token` 字段         | `UPDATE ... SET fencing_token = ? WHERE id = ? AND ? > fencing_token`，确保新 token 大于已存 token |
| 对象存储  | 写入时携带 token 或版本条件             | 使用条件写（Conditional Write）或对象版本约束                                                      |
| ZooKeeper | 可考虑使用 `zxid` 或 znode stat version | 资源端拒绝旧版本写入                                                                               |
| etcd      | `revision` / `mod_revision`             | 通过条件事务（Txn）校验版本                                                                        |

注意：如果外部资源不支持条件写或版本校验，则不适合承担正确性型分布式锁场景，应考虑换用更强一致性的协调服务，或者把资源写入路径改造成支持 token 校验。

这正是前文提到“锁提前过期”问题的根源：单纯延长 TTL 不能消除“客户端 A 仍以为自己持锁，但锁实际已过期并被客户端 B 获取”的窗口。Fencing Token 通过资源端的版本校验来兜底。

## etcd / Consul 简要对照

- **etcd**：基于 Raft，提供 Lease、Txn、revision 等能力，天然更适合做带 fencing 的协调。云原生/Kubernetes 生态里 etcd 更常见。
- **Consul**：提供 Session + Lock，但仍要考虑 session TTL 误判和 fencing。

Java 生态里 ZooKeeper + Curator 更成熟；云原生/Kubernetes 生态里 etcd 更常见。

实际选型时要结合团队已有基础设施、客户端生态、性能要求和故障处理能力。

## 总结

在这篇文章中，我主要介绍了实现分布式锁的两种常见方式：**Redis** 和 **ZooKeeper**，并简单补充了 etcd / Consul 的对照。至于具体选择哪种方案，还是要根据业务的具体需求来决定。

- 如果对性能要求比较高，且能接受极端情况下偶发并发执行的风险，可以使用 Redis 实现分布式锁。推荐优先选择 **Redisson** 提供的现成分布式锁，而不是自己实现。
- 如果对可靠性和正确性要求比较高，建议使用 ZooKeeper 或 etcd 实现分布式锁，并配合 Fencing Token。推荐基于 **Curator** 框架来实现 ZooKeeper 分布式锁。不过，现在很多项目都不会用到 ZooKeeper，如果单纯是因为分布式锁而引入 ZooKeeper 的话，那是不太可取的，不建议为了一个小功能增加系统复杂度。

需要注意的是，无论选择哪种方式实现分布式锁，包括 Redis、ZooKeeper 或 etcd，在进程 GC 停顿、网络延迟、网络分区、时钟漂移等异常下，任何基于租约（lease）的分布式锁都存在客户端误以为自己仍持锁的窗口。为了进一步提高系统的可靠性，建议引入 Fencing Token 这类资源端兜底机制来避免陈旧客户端写入。

<!-- @include: @article-footer.snippet.md -->
