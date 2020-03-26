> 授权转载自： https://github.com/wmyskxz/MoreThanJava#part3-redis

![](https://upload-images.jianshu.io/upload_images/7896890-7879862264eeea7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 一、持久化简介

**Redis** 的数据 **全部存储** 在 **内存** 中，如果 **突然宕机**，数据就会全部丢失，因此必须有一套机制来保证 Redis 的数据不会因为故障而丢失，这种机制就是 Redis 的 **持久化机制**，它会将内存中的数据库状态 **保存到磁盘** 中。

## 持久化发生了什么 | 从内存到磁盘

我们来稍微考虑一下 **Redis** 作为一个 **"内存数据库"** 要做的关于持久化的事情。通常来说，从客户端发起请求开始，到服务器真实地写入磁盘，需要发生如下几件事情：

![](https://upload-images.jianshu.io/upload_images/7896890-5c209bc08da11abb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**详细版** 的文字描述大概就是下面这样：

1. 客户端向数据库 **发送写命令** *(数据在客户端的内存中)*
2. 数据库 **接收** 到客户端的 **写请求** *(数据在服务器的内存中)*
3. 数据库 **调用系统 API** 将数据写入磁盘 *(数据在内核缓冲区中)*
4. 操作系统将 **写缓冲区** 传输到 **磁盘控控制器** *(数据在磁盘缓存中)*
5. 操作系统的磁盘控制器将数据 **写入实际的物理媒介** 中 *(数据在磁盘中)*

**注意:** 上面的过程其实是 **极度精简** 的，在实际的操作系统中，**缓存** 和 **缓冲区** 会比这 **多得多**...

## 如何尽可能保证持久化的安全

如果我们故障仅仅涉及到 **软件层面** *(该进程被管理员终止或程序崩溃)* 并且没有接触到内核，那么在 *上述步骤 3* 成功返回之后，我们就认为成功了。即使进程崩溃，操作系统仍然会帮助我们把数据正确地写入磁盘。

如果我们考虑 **停电/ 火灾** 等 **更具灾难性** 的事情，那么只有在完成了第 **5** 步之后，才是安全的。

![机房”火了“](https://upload-images.jianshu.io/upload_images/7896890-de083f477fe1bce4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以我们可以总结得出数据安全最重要的阶段是：**步骤三、四、五**，即：

- 数据库软件调用写操作将用户空间的缓冲区转移到内核缓冲区的频率是多少？
- 内核多久从缓冲区取数据刷新到磁盘控制器？
- 磁盘控制器多久把数据写入物理媒介一次？
- **注意：** 如果真的发生灾难性的事件，我们可以从上图的过程中看到，任何一步都可能被意外打断丢失，所以只能 **尽可能地保证** 数据的安全，这对于所有数据库来说都是一样的。

我们从 **第三步** 开始。Linux 系统提供了清晰、易用的用于操作文件的 `POSIX file API`，`20` 多年过去，仍然还有很多人对于这一套 `API` 的设计津津乐道，我想其中一个原因就是因为你光从 `API` 的命名就能够很清晰地知道这一套 API 的用途：

```c
int open(const char *path, int oflag, .../*,mode_t mode */);
int close (int filedes);int remove( const char *fname );
ssize_t write(int fildes, const void *buf, size_t nbyte);
ssize_t read(int fildes, void *buf, size_t nbyte);
```

- 参考自：API 设计最佳实践的思考 - [https://www.cnblogs.com/yuanjiangw/p/10846560.html](https://www.cnblogs.com/yuanjiangw/p/10846560.html)

所以，我们有很好的可用的 `API` 来完成 **第三步**，但是对于成功返回之前，我们对系统调用花费的时间没有太多的控制权。

然后我们来说说 **第四步**。我们知道，除了早期对电脑特别了解那帮人 *(操作系统就这帮人搞的)*，实际的物理硬件都不是我们能够 **直接操作** 的，都是通过 **操作系统调用** 来达到目的的。为了防止过慢的 I/O 操作拖慢整个系统的运行，操作系统层面做了很多的努力，譬如说 **上述第四步** 提到的 **写缓冲区**，并不是所有的写操作都会被立即写入磁盘，而是要先经过一个缓冲区，默认情况下，Linux 将在 **30 秒** 后实际提交写入。

![image](https://upload-images.jianshu.io/upload_images/7896890-c08b7572ef02d67b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是很明显，**30 秒** 并不是 Redis 能够承受的，这意味着，如果发生故障，那么最近 30 秒内写入的所有数据都可能会丢失。幸好 `PROSIX API` 提供了另一个解决方案：`fsync`，该命令会 **强制** 内核将 **缓冲区** 写入 **磁盘**，但这是一个非常消耗性能的操作，每次调用都会 **阻塞等待** 直到设备报告 IO 完成，所以一般在生产环境的服务器中，**Redis** 通常是每隔 1s 左右执行一次 `fsync` 操作。

到目前为止，我们了解到了如何控制 `第三步` 和 `第四步`，但是对于 **第五步**，我们 **完全无法控制**。也许一些内核实现将试图告诉驱动实际提交物理介质上的数据，或者控制器可能会为了提高速度而重新排序写操作，不会尽快将数据真正写到磁盘上，而是会等待几个多毫秒。这完全是我们无法控制的。


# 二、Redis 中的两种持久化方式

## 方式一：快照

![image](https://upload-images.jianshu.io/upload_images/7896890-9a4d234c53120b33.gif?imageMogr2/auto-orient/strip)

**Redis 快照** 是最简单的 Redis 持久性模式。当满足特定条件时，它将生成数据集的时间点快照，例如，如果先前的快照是在2分钟前创建的，并且现在已经至少有 *100* 次新写入，则将创建一个新的快照。此条件可以由用户配置 Redis 实例来控制，也可以在运行时修改而无需重新启动服务器。快照作为包含整个数据集的单个 `.rdb` 文件生成。

但我们知道，Redis 是一个 **单线程** 的程序，这意味着，我们不仅仅要响应用户的请求，还需要进行内存快照。而后者要求 Redis 必须进行 IO 操作，这会严重拖累服务器的性能。

还有一个重要的问题是，我们在 **持久化的同时**，**内存数据结构** 还可能在 **变化**，比如一个大型的 hash 字典正在持久化，结果一个请求过来把它删除了，可是这才刚持久化结束，咋办？

![](https://upload-images.jianshu.io/upload_images/7896890-fbfcbd606e95f105.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 使用系统多进程 COW(Copy On Write) 机制 | fork 函数

操作系统多进程 **COW(Copy On Write) 机制** 拯救了我们。**Redis** 在持久化时会调用 `glibc` 的函数 `fork` 产生一个子进程，简单理解也就是基于当前进程 **复制** 了一个进程，主进程和子进程会共享内存里面的代码块和数据段：

![](https://upload-images.jianshu.io/upload_images/7896890-bc264b6a9f0c3404.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里多说一点，**为什么 fork 成功调用后会有两个返回值呢？** 因为子进程在复制时复制了父进程的堆栈段，所以两个进程都停留在了 `fork` 函数中 *(都在同一个地方往下继续"同时"执行)*，等待返回，所以 **一次在父进程中返回子进程的 pid，另一次在子进程中返回零，系统资源不够时返回负数**。 *(伪代码如下)*

```python
pid = os.fork()
if pid > 0:
  handle_client_request()  # 父进程继续处理客户端请求
if pid == 0:
  handle_snapshot_write()  # 子进程处理快照写磁盘
if pid < 0:  
  # fork error
```

所以 **快照持久化** 可以完全交给 **子进程** 来处理，**父进程** 则继续 **处理客户端请求**。**子进程** 做数据持久化，它 **不会修改现有的内存数据结构**，它只是对数据结构进行遍历读取，然后序列化写到磁盘中。但是 **父进程** 不一样，它必须持续服务客户端请求，然后对 **内存数据结构进行不间断的修改**。

这个时候就会使用操作系统的 COW 机制来进行 **数据段页面** 的分离。数据段是由很多操作系统的页面组合而成，当父进程对其中一个页面的数据进行修改时，会将被共享的页面复
制一份分离出来，然后 **对这个复制的页面进行修改**。这时 **子进程** 相应的页面是 **没有变化的**，还是进程产生时那一瞬间的数据。

子进程因为数据没有变化，它能看到的内存里的数据在进程产生的一瞬间就凝固了，再也不会改变，这也是为什么 **Redis** 的持久化 **叫「快照」的原因**。接下来子进程就可以非常安心的遍历数据了进行序列化写磁盘了。

## 方式二：AOF

![](https://upload-images.jianshu.io/upload_images/7896890-e4e08ebef2cf0144.gif?imageMogr2/auto-orient/strip)

**快照不是很持久**。如果运行 Redis 的计算机停止运行，电源线出现故障或者您 `kill -9` 的实例意外发生，则写入 Redis 的最新数据将丢失。尽管这对于某些应用程序可能不是什么大问题，但有些使用案例具有充分的耐用性，在这些情况下，快照并不是可行的选择。

**AOF(Append Only File - 仅追加文件)** 它的工作方式非常简单：每次执行 **修改内存** 中数据集的写操作时，都会 **记录** 该操作。假设 AOF 日志记录了自 Redis 实例创建以来 **所有的修改性指令序列**，那么就可以通过对一个空的 Redis 实例 **顺序执行所有的指令**，也就是 **「重放」**，来恢复 Redis 当前实例的内存数据结构的状态。

为了展示 AOF 在实际中的工作方式，我们来做一个简单的实验：

```bash
./redis-server --appendonly yes  # 设置一个新实例为 AOF 模式
```

然后我们执行一些写操作：

```bash
redis 127.0.0.1:6379> set key1 Hello
OK
redis 127.0.0.1:6379> append key1 " World!"
(integer) 12
redis 127.0.0.1:6379> del key1
(integer) 1
redis 127.0.0.1:6379> del non_existing_key
(integer) 0
```

前三个操作实际上修改了数据集，第四个操作没有修改，因为没有指定名称的键。这是 AOF 日志保存的文本：

```bash
$ cat appendonly.aof 
*2
$6
SELECT
$1
0
*3
$3
set
$4
key1
$5
Hello
*3
$6
append
$4
key1
$7
 World!
*2
$3
del
$4
key1
```

如您所见，最后的那一条 `DEL` 指令不见了，因为它没有对数据集进行任何修改。

就是这么简单。当 Redis 收到客户端修改指令后，会先进行参数校验、逻辑处理，如果没问题，就 **立即** 将该指令文本 **存储** 到 AOF 日志中，也就是说，**先执行指令再将日志存盘**。这一点不同于 `MySQL`、`LevelDB`、`HBase` 等存储引擎，如果我们先存储日志再做逻辑处理，这样就可以保证即使宕机了，我们仍然可以通过之前保存的日志恢复到之前的数据状态，但是 **Redis 为什么没有这么做呢？**

> Emmm... 没找到特别满意的答案，引用一条来自知乎上的回答吧：
> - **@缘于专注** - 我甚至觉得没有什么特别的原因。仅仅是因为，由于AOF文件会比较大，为了避免写入无效指令（错误指令），必须先做指令检查？如何检查，只能先执行了。因为语法级别检查并不能保证指令的有效性，比如删除一个不存在的key。而MySQL这种是因为它本身就维护了所有的表的信息，所以可以语法检查后过滤掉大部分无效指令直接记录日志，然后再执行。
> - 更多讨论参见：[为什么Redis先执行指令，再记录AOF日志，而不是像其它存储引擎一样反过来呢？ - https://www.zhihu.com/question/342427472](https://www.zhihu.com/question/342427472)

### AOF 重写

![](https://upload-images.jianshu.io/upload_images/7896890-c21e2a37892ee989.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Redis** 在长期运行的过程中，AOF 的日志会越变越长。如果实例宕机重启，重放整个 AOF 日志会非常耗时，导致长时间 Redis 无法对外提供服务。所以需要对 **AOF 日志 "瘦身"**。

**Redis** 提供了 `bgrewriteaof` 指令用于对 AOF 日志进行瘦身。其 **原理** 就是 **开辟一个子进程** 对内存进行 **遍历** 转换成一系列 Redis 的操作指令，**序列化到一个新的 AOF 日志文件** 中。序列化完毕后再将操作期间发生的 **增量 AOF 日志** 追加到这个新的 AOF 日志文件中，追加完毕后就立即替代旧的 AOF 日志文件了，瘦身工作就完成了。

### fsync

![](https://upload-images.jianshu.io/upload_images/7896890-384a546b5bf6b86d.gif?imageMogr2/auto-orient/strip)

AOF 日志是以文件的形式存在的，当程序对 AOF 日志文件进行写操作时，实际上是将内容写到了内核为文件描述符分配的一个内存缓存中，然后内核会异步将脏数据刷回到磁盘的。

就像我们 *上方第四步* 描述的那样，我们需要借助 `glibc` 提供的 `fsync(int fd)` 函数来讲指定的文件内容 **强制从内核缓存刷到磁盘**。但 **"强制开车"** 仍然是一个很消耗资源的一个过程，需要 **"节制"**！通常来说，生产环境的服务器，Redis 每隔 1s 左右执行一次 `fsync` 操作就可以了。

Redis 同样也提供了另外两种策略，一个是 **永不 `fsync`**，来让操作系统来决定合适同步磁盘，很不安全，另一个是 **来一个指令就 `fsync` 一次**，非常慢。但是在生产环境基本不会使用，了解一下即可。

## Redis 4.0 混合持久化

![](https://upload-images.jianshu.io/upload_images/7896890-7de9f7706be6216c.gif?imageMogr2/auto-orient/strip)

重启 Redis 时，我们很少使用 `rdb` 来恢复内存状态，因为会丢失大量数据。我们通常使用 AOF 日志重放，但是重放 AOF 日志性能相对 `rdb` 来说要慢很多，这样在 Redis 实例很大的情况下，启动需要花费很长的时间。

**Redis 4.0** 为了解决这个问题，带来了一个新的持久化选项——**混合持久化**。将 `rdb` 文件的内容和增量的 AOF 日志文件存在一起。这里的 AOF 日志不再是全量的日志，而是 **自持久化开始到持久化结束** 的这段时间发生的增量 AOF 日志，通常这部分 AOF 日志很小：

![](https://upload-images.jianshu.io/upload_images/7896890-2f7887f84eaa34d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

于是在 Redis 重启的时候，可以先加载 `rdb` 的内容，然后再重放增量 AOF 日志就可以完全替代之前的 AOF 全量文件重放，重启效率因此大幅得到提升。

# 相关阅读

1. Redis(1)——5种基本数据结构 - [https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/](https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/)
2. Redis(2)——跳跃表 - [https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/](https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/)
3. Redis(3)——分布式锁深入探究 - [https://www.wmyskxz.com/2020/03/01/redis-3/](https://www.wmyskxz.com/2020/03/01/redis-3/)
4. Reids(4)——神奇的HyperLoglog解决统计问题 - [https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/](https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/)
5. Redis(5)——亿级数据过滤和布隆过滤器 - [https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/](https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/)
6. Redis(6)——GeoHash查找附近的人[https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/](https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/)

# 扩展阅读

1. Redis 数据备份与恢复 | 菜鸟教程 - [https://www.runoob.com/redis/redis-backup.html](https://www.runoob.com/redis/redis-backup.html)
2. Java Fork/Join 框架 - [https://www.cnblogs.com/cjsblog/p/9078341.html](https://www.cnblogs.com/cjsblog/p/9078341.html)

# 参考资料

1. Redis persistence demystified | antirez weblog (作者博客) - [http://oldblog.antirez.com/post/redis-persistence-demystified.html](http://oldblog.antirez.com/post/redis-persistence-demystified.html)
2. 操作系统 — fork()函数的使用与底层原理 - [https://blog.csdn.net/Dawn_sf/article/details/78709839](https://blog.csdn.net/Dawn_sf/article/details/78709839)
3. 磁盘和内存读写简单原理 - [https://blog.csdn.net/zhanghongzheng3213/article/details/54141202](https://blog.csdn.net/zhanghongzheng3213/article/details/54141202)

