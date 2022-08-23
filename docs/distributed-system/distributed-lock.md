## 什么是分布式锁？

对于单机多线程，在 Java 中，我们通常使用 `ReetrantLock` 这类 JDK 自带的 **本地锁** 来控制本地多个线程对本地共享资源的访问。对于分布式系统，我们通常使用 **分布式锁** 来控制多个服务对共享资源的访问。

一个最基本的分布式锁需要满足：

- **互斥** ：任意一个时刻，锁只能被一个线程持有；
- **高可用** ：锁服务是高可用的。并且，即使客户端的释放锁的代码逻辑出现问题，锁最终一定还是会被释放，不会影响其他线程对共享资源的访问。

通常情况下，我们一般会选择基于 Redis 或者 ZooKeeper 实现分布式锁，Redis 用的要更多一点，我这里也以 Redis 为例介绍分布式锁的实现。

## 基于 Redis 实现分布式锁

### 如何基于 Redis 实现一个最简易的分布式锁？

不论是实现锁还是分布式锁，核心都在于“互斥”。

在 Redis 中， `SETNX` 命令是可以帮助我们实现互斥。`SETNX` 即 **SET** if **N**ot e**X**ists (对应 Java 中的 `setIfAbsent` 方法)，如果 key 不存在的话，才会设置 key 的值。如果 key 已经存在， `SETNX` 啥也不做。

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

为了误删到其他的锁，这里我们建议使用 Lua 脚本通过 key 对应的 value（唯一值）来判断。

选用 Lua 脚本是为了保证解锁操作的原子性。因为 Redis 在执行 Lua 脚本时，可以以原子性的方式执行，从而保证了锁释放操作的原子性。

```lua
// 释放锁时，先比较锁对应的 value 值是否相等，避免锁的误释放
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

这是一种最简易的 Redis 分布式锁实现，实现方式比较简单，性能也很高效。不过，这种方式实现分布式锁存在一些问题。就比如应用程序遇到一些问题比如释放锁的逻辑突然挂掉，可能会导致锁无法被释放，进而造成共享资源无法再被其他线程/进程访问。

### 为什么要给锁设置一个过期时间？

为了避免锁无法被释放，我们可以想到的一个解决办法就是：给这个 key（也就是锁） 设置一个过期时间。

```bash
127.0.0.1:6379> SET lockKey uniqueValue EX 3 NX
OK
```

- **lockKey** ：加锁的锁名；
- **uniqueValue** ：能够唯一标示锁的随机字符串；
- **NX** ：只有当 lockKey 对应的 key 值不存在的时候才能 SET 成功；
- **EX** ：过期时间设置（秒为单位）EX 3 标示这个锁有一个 3 秒的自动过期时间。与 EX 对应的是 PX（毫秒为单位），这两个都是过期时间设置。

**一定要保证设置指定 key 的值和过期时间是一个原子操作！！！** 不然的话，依然可能会出现锁无法被释放的问题。

这样确实可以解决问题，不过，这种解决办法同样存在漏洞：**如果操作共享资源的时间大于过期时间，就会出现锁提前过期的问题，进而导致分布式锁直接失效。如果锁的超时时间设置过长，又会影响到性能。**

你或许在想： **如果操作共享资源的操作还未完成，锁过期时间能够自己续期就好了！**

对于 Java 开发的小伙伴来说，已经有了现成的解决方案：**[Redisson](https://github.com/redisson/redisson)** 。其他语言的解决方案，可以在 Redis 官方文档中找到，地址：https://redis.io/topics/distlock 。

![Distributed locks with Redis](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/redis-distributed-lock.png)

Redisson 是一个开源的 Java 语言 Redis 客户端，提供了很多开箱即用的功能，不仅仅包括多种分布式锁的实现。

Redisson 中的分布式锁自带自动续期机制，它提供了一个专门用来监控锁的 **Watch Dog（ 看门狗）**，如果操作共享资源的还未完成的话，Watch Dog 会不断地延长锁的过期时间，进而保证锁不会因为超时而被释放。

我这里以 Redisson 的分布式可重入锁 `RLock` 为例来说明如何使用 Redisson 实现分布式锁：

```java
// 1.获取指定的分布式锁对象
RLock lock = redisson.getLock("lock");
// 2.拿锁，具有 Watch Dog 自动续期机制
lock.lock();
// 3.执行业务
...
// 4.释放锁
lock.unlock();
```

可以看出，代码非常简洁直观。

如果使用 Redis 来实现分布式锁的话，还是比较推荐直接基于 Redisson 来做的。

### Redis 如何解决集群情况下分布式锁的可靠性？

为了避免单点故障，生产环境下的 Redis 服务通常是集群化部署的。

Redis 集群下，上面介绍到的分布式锁的实现会存在一些问题。由于 Redis 集群数据同步到各个节点时是异步的，如果在 Redis 主节点获取到锁后，在没有同步到其他节点时，Redis 主节点宕机了，此时新的 Redis 主节点依然可以获取锁，所以多个应用服务就可以同时获取到锁。

针对这个问题，Redis 之父 antirez 设计了 [Redlock 算法](https://redis.io/topics/distlock) 来解决。

Redlock 算法的思想是让客户端向 Redis 集群中的多个独立的 Redis 实例依次请求申请加锁，如果客户端能够和半数以上的实例成功地完成加锁操作，那么我们就认为，客户端成功地获得分布式锁，否则加锁失败。

即使部分 Redis 节点出现问题，只要保证 Redis 集群中有半数以上的 Redis 节点可用，分布式锁服务就是正常的。

Redlock 是直接操作 Redis 节点的，并不是通过 Redis 集群操作的，这样才可以避免Redis集群主从切换导致的锁丢失问题。

Redlock 实现比较复杂，性能也比较差。 《数据密集型应用系统设计》一书的作者曾经专门发文 diss 过Redlock。



