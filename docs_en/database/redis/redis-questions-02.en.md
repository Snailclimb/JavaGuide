---
title: Summary of common Redis interview questions (Part 2)
category: database
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis interview questions, Redis transactions, Redis performance optimization, Redis cache penetration, Redis cache breakdown, Redis cache avalanche, Redis bigkey, Redis hotkey, Redis slow query, Redis memory fragmentation, Redis cluster, Redis Sentinel, Redis Cluster, Redis pipeline, Redis Lua script
  - - meta
    - name: description
      content: Summary of the latest Redis interview questions (Part 2): In-depth analysis of Redis transaction principles, performance optimization (pipeline/Lua/bigkey/hotkey), cache penetration/breakdown/avalanche solutions, slow queries and memory fragmentation, and detailed explanations of Redis Sentinel and Cluster clusters. Help you easily cope with back-end technical interviews!
---

<!-- @include: @article-header.snippet.md -->

## Redis transactions

### What is a Redis transaction?

You can understand transactions in Redis as: **Redis transactions provide a function to package multiple command requests. Then, execute all the packaged commands in sequence without being interrupted midway. **

Redis transactions are rarely used in actual development, and their functions are relatively useless. Do not confuse them with the transactions of relational databases that we usually understand.

In addition to not meeting atomicity and durability, each command in the transaction will interact with the Redis server through the network, which is a waste of resources. Obviously it is enough to execute multiple commands in batches at one time, but this kind of operation is really incomprehensible.

Therefore, Redis transactions are not recommended for daily development.

### How to use Redis transactions?

Redis can implement transaction functions through commands such as **`MULTI`, `EXEC`, `DISCARD` and `WATCH`**.

```bash
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED
>GET PROJECT
QUEUED
> EXEC
1) OK
2) "JavaGuide"
```

You can enter multiple commands after the [`MULTI`](https://redis.io/commands/multi) command. Redis will not execute these commands immediately, but will put them in the queue. When the [`EXEC`](https://redis.io/commands/exec) command is called, all commands will be executed.

The process goes like this:

1. Start transaction (`MULTI`);
2. Command enqueue (batch operation of Redis commands, executed in first-in, first-out (FIFO) order);
3. Execute transaction (`EXEC`).

You can also cancel a transaction through the [`DISCARD`](https://redis.io/commands/discard) command, which will clear all commands saved in the transaction queue.

```bash
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED
>GET PROJECT
QUEUED
> DISCARD
OK
```

You can monitor the specified Key through the [`WATCH`](https://redis.io/commands/watch) command. When calling the `EXEC` command to execute a transaction, if a Key monitored by the `WATCH` command is modified by **other clients/Session**, the entire transaction will not be executed.

```bash
# client 1
> SET PROJECT "RustGuide"
OK
> WATCH PROJECT
OK
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED

# client 2
# Modify the value of PROJECT before client 1 executes the EXEC command to commit the transaction
> SET PROJECT "GoGuide"

# client 1
# The modification failed because the value of PROJECT was modified by client 2
> EXEC
(nil)
>GET PROJECT
"GoGuide"
```

However, if **WATCH** and **Transaction** are in the same Session, and the modification of the Key monitored by **WATCH** occurs within the transaction, the transaction can be executed successfully (related issue: [Different effects when the WATCH command encounters the MULTI command](https://github.com/Snailclimb/JavaGuide/issues/1714)).

Modify the Key monitored by WATCH within the transaction:

```bash
> SET PROJECT "JavaGuide"
OK
> WATCH PROJECT
OK
> MULTI
OK
> SET PROJECT "JavaGuide1"
QUEUED
> SET PROJECT "JavaGuide2"
QUEUED
> SET PROJECT "JavaGuide3"
QUEUED
> EXEC
1) OK
2) OK
3) OK
127.0.0.1:6379> GET PROJECT
"JavaGuide3"
```

Modify the Key monitored by WATCH outside the transaction:

```bash
> SET PROJECT "JavaGuide"
OK
> WATCH PROJECT
OK
> SET PROJECT "JavaGuide2"
OK
> MULTI
OK
> GET USER
QUEUED
> EXEC
(nil)
```

The relevant introduction to the Redis official website [https://redis.io/topics/transactions](https://redis.io/topics/transactions) is as follows:

![Redis transactions](https://oss.javaguide.cn/github/javaguide/database/redis/redis-transactions.png)

### Do Redis transactions support atomicity?

Redis transactions are different from the relational database transactions we usually understand. We know that transactions have four major characteristics: **1. Atomicity**, **2. Isolation**, **3. Durability**, **4. Consistency**.

1. **Atomicity**: A transaction is the smallest execution unit and does not allow division. The atomicity of transactions ensures that actions either complete completely or have no effect at all;
2. **Isolation**: When accessing the database concurrently, a user's transaction will not be interfered by other transactions, and the database is independent between concurrent transactions;
3. **Durability**: after a transaction is committed. Its changes to the data in the database are durable and should not have any impact even if the database fails;
4. **Consistency**: The data remains consistent before and after executing a transaction, and the results of multiple transactions reading the same data are the same.

In the case of a Redis transaction running error, except for the command with an error during execution, other commands can be executed normally. Moreover, Redis transactions do not support rollback operations. Therefore, Redis transactions do not actually satisfy atomicity.

The Redis official website also explains why it does not support rollback. To put it simply, Redis developers feel that there is no need to support rollback, which is simpler, more convenient and has better performance. Redis developers feel that even command execution errors should be discovered during the development process rather than during the production process.

![Why does Redis not support rollback](https://oss.javaguide.cn/github/javaguide/database/redis/redis-rollback.png)

**Related issues**:

- [issue#452: Regarding the issue that Redis transactions do not satisfy atomicity](https://github.com/Snailclimb/JavaGuide/issues/452).
- [Issue#491: About Redis without transaction rollback? ](https://github.com/Snailclimb/JavaGuide/issues/491).

### Do Redis transactions support persistence?

One important thing that makes Redis different from Memcached is that Redis supports persistence and supports 3 persistence methods:

- Snapshotting (RDB);
- Append-only file (AOF);
- Hybrid persistence of RDB and AOF (new in Redis 4.0).

Compared with RDB persistence, AOF persistence has better real-time performance. There are three different AOF persistence methods (`fsync` strategy) in the Redis configuration file. They are:

```bash
appendfsync always #Every time a data modification occurs, the fsync function will be called to synchronize the AOF file. After fsync is completed, the thread returns, which will seriously reduce the speed of Redis.
appendfsync everysec #Call the fsync function to synchronize the AOF file once every second
appendfsync no #Let the operating system decide when to synchronize, usually every 30 seconds
```

Data loss will occur when the `fsync` policy of AOF persistence is no and everysec. Always can basically meet the persistence requirements, but the performance is too poor and will not be used in the actual development process.

Therefore, the durability of Redis transactions cannot be guaranteed.### 如何解决 Redis 事务的缺陷？

Redis 从 2.6 版本开始支持执行 Lua 脚本，它的功能和事务非常类似。我们可以利用 Lua 脚本来批量执行多条 Redis 命令，这些 Redis 命令会被提交到 Redis 服务器一次性执行完成，大幅减小了网络开销。

一段 Lua 脚本可以视作一条命令执行，一段 Lua 脚本执行过程中不会有其他脚本或 Redis 命令同时执行，保证了操作不会被其他指令插入或打扰。

不过，如果 Lua 脚本运行时出错并中途结束，出错之后的命令是不会被执行的。并且，出错之前执行的命令是无法被撤销的，无法实现类似关系型数据库执行失败可以回滚的那种原子性效果。因此，**严格来说的话，通过 Lua 脚本来批量执行 Redis 命令实际也是不完全满足原子性的。**

如果想要让 Lua 脚本中的命令全部执行，必须保证语句语法和命令都是对的。

另外，Redis 7.0 新增了 [Redis functions](https://redis.io/docs/latest/develop/programmability/functions-intro/) 特性，你可以将 Redis functions 看作是比 Lua 更强大的脚本。

## ⭐️Redis 性能优化（重要）

除了下面介绍的内容之外，再推荐两篇不错的文章：

- [你的 Redis 真的变慢了吗？性能优化如何做 - 阿里开发者](https://mp.weixin.qq.com/s/nNEuYw0NlYGhuKKKKoWfcQ)。
- [Redis 常见阻塞原因总结 - JavaGuide](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html)。

### 使用批量操作减少网络传输

一个 Redis 命令的执行可以简化为以下 4 步：

1. 发送命令；
2. 命令排队；
3. 命令执行；
4. 返回结果。

其中，第 1 步和第 4 步耗费时间之和称为 **Round Trip Time（RTT，往返时间）**，也就是数据在网络上传输的时间。

使用批量操作可以减少网络传输次数，进而有效减小网络开销，大幅减少 RTT。

另外，除了能减少 RTT 之外，发送一次命令的 socket I/O 成本也比较高（涉及上下文切换，存在 `read()` 和 `write()` 系统调用），批量操作还可以减少 socket I/O 成本。这个在官方对 pipeline 的介绍中有提到：<https://redis.io/docs/manual/pipelining/>。

#### 原生批量操作命令

Redis 中有一些原生支持批量操作的命令，比如：

- `MGET`（获取一个或多个指定 key 的值）、`MSET`（设置一个或多个指定 key 的值）、
- `HMGET`（获取指定哈希表中一个或者多个指定字段的值）、`HMSET`（同时将一个或多个 field-value 对设置到指定哈希表中）、
- `SADD`（向指定集合添加一个或多个元素）
- ……

不过，在 Redis 官方提供的分片集群解决方案 Redis Cluster 下，使用这些原生批量操作命令可能会存在一些小问题需要解决。就比如说 `MGET` 无法保证所有的 key 都在同一个 **hash slot（哈希槽）** 上，`MGET`可能还是需要多次网络传输，原子操作也无法保证了。不过，相较于非批量操作，还是可以节省不少网络传输次数。

整个步骤的简化版如下（通常由 Redis 客户端实现，无需我们自己再手动实现）：

1. 找到 key 对应的所有 hash slot；
2. 分别向对应的 Redis 节点发起 `MGET` 请求获取数据；
3. 等待所有请求执行结束，重新组装结果数据，保持跟入参 key 的顺序一致，然后返回结果。

如果想要解决这个多次网络传输的问题，比较常用的办法是自己维护 key 与 slot 的关系。不过这样不太灵活，虽然带来了性能提升，但同样让系统复杂性提升。

> Redis Cluster 并没有使用一致性哈希，采用的是 **哈希槽分区**，每一个键值对都属于一个 **hash slot（哈希槽）**。当客户端发送命令请求的时候，需要先根据 key 通过上面的计算公式找到的对应的哈希槽，然后再查询哈希槽和节点的映射关系，即可找到目标 Redis 节点。
>
> 我在 [Redis 集群详解（付费）](https://javaguide.cn/database/redis/redis-cluster.html) 这篇文章中详细介绍了 Redis Cluster 这部分的内容，感兴趣地可以看看。

#### pipeline

对于不支持批量操作的命令，我们可以利用 **pipeline（流水线）** 将一批 Redis 命令封装成一组，这些 Redis 命令会被一次性提交到 Redis 服务器，只需要一次网络传输。不过，需要注意控制一次批量操作的 **元素个数**（例如 500 以内，实际也和元素字节数有关），避免网络传输的数据量过大。

与 `MGET`、`MSET` 等原生批量操作命令一样，pipeline 同样在 Redis Cluster 上使用会存在一些小问题。原因类似，无法保证所有的 key 都在同一个 **hash slot（哈希槽）** 上。如果想要使用的话，客户端需要自己维护 key 与 slot 的关系。

原生批量操作命令和 pipeline 的是有区别的，使用的时候需要注意：

- 原生批量操作命令是原子操作，pipeline 是非原子操作。
- pipeline 可以打包不同的命令，原生批量操作命令不可以。
- 原生批量操作命令是 Redis 服务端支持实现的，而 pipeline 需要服务端和客户端的共同实现。

顺带补充一下 pipeline 和 Redis 事务的对比：

- 事务是原子操作，pipeline 是非原子操作。两个不同的事务不会同时运行，而 pipeline 可以同时以交错方式执行。
- Redis 事务中每个命令都需要发送到服务端，而 Pipeline 只需要发送一次，请求次数更少。

> 事务可以看作是一个原子操作，但其实并不满足原子性。当我们提到 Redis 中的原子操作时，主要指的是这个操作（比如事务、Lua 脚本）不会被其他操作（比如其他事务、Lua 脚本）打扰，并不能完全保证这个操作中的所有写命令要么都执行要么都不执行。这主要也是因为 Redis 是不支持回滚操作。

![](https://oss.javaguide.cn/github/javaguide/database/redis/redis-pipeline-vs-transaction.png)

另外，pipeline 不适用于执行顺序有依赖关系的一批命令。就比如说，你需要将前一个命令的结果给后续的命令使用，pipeline 就没办法满足你的需求了。对于这种需求，我们可以使用 **Lua 脚本**。

#### Lua 脚本

Lua 脚本同样支持批量操作多条命令。一段 Lua 脚本可以视作一条命令执行，可以看作是 **原子操作**。也就是说，一段 Lua 脚本执行过程中不会有其他脚本或 Redis 命令同时执行，保证了操作不会被其他指令插入或打扰，这是 pipeline 所不具备的。

并且，Lua 脚本中支持一些简单的逻辑处理比如使用命令读取值并在 Lua 脚本中进行处理，这同样是 pipeline 所不具备的。

不过， Lua 脚本依然存在下面这些缺陷：

- 如果 Lua 脚本运行时出错并中途结束，之后的操作不会进行，但是之前已经发生的写操作不会撤销，所以即使使用了 Lua 脚本，也不能实现类似数据库回滚的原子性。
- Redis Cluster 下 Lua 脚本的原子操作也无法保证了，原因同样是无法保证所有的 key 都在同一个 **hash slot（哈希槽）** 上。

### 大量 key 集中过期问题

我在前面提到过：对于过期 key，Redis 采用的是 **定期删除+惰性/懒汉式删除** 策略。

定期删除执行过程中，如果突然遇到大量过期 key 的话，客户端请求必须等待定期清理过期 key 任务线程执行完成，因为这个这个定期任务线程是在 Redis 主线程中执行的。这就导致客户端请求没办法被及时处理，响应速度会比较慢。

**如何解决呢？** 下面是两种常见的方法：

1. 给 key 设置随机过期时间。
2. 开启 lazy-free（惰性删除/延迟释放）。lazy-free 特性是 Redis 4.0 开始引入的，指的是让 Redis 采用异步方式延迟释放 key 使用的内存，将该操作交给单独的子线程处理，避免阻塞主线程。

个人建议不管是否开启 lazy-free，我们都尽量给 key 设置随机过期时间。

### Redis bigkey（大 Key）

#### 什么是 bigkey？

简单来说，如果一个 key 对应的 value 所占用的内存比较大，那这个 key 就可以看作是 bigkey。具体多大才算大呢？有一个不是特别精确的参考标准：

- String 类型的 value 超过 1MB
- The value of a composite type (List, Hash, Set, Sorted Set, etc.) contains more than 5000 elements (however, for a value of a composite type, the more elements it contains, the more memory it takes up).

![bigkey criterion](https://oss.javaguide.cn/github/javaguide/database/redis/bigkey-criterion.png)

#### How did bigkey come about? What's the harm?

Bigkey is usually generated for the following reasons:

- Improper program design, such as directly using the String type to store binary data corresponding to larger files.
- Inadequate consideration of the data scale of the business. For example, when using collection types, the rapid growth of data volume was not considered.
- Failure to clean up junk data in time, such as a large number of redundant useless key-value pairs in the hash.

In addition to consuming more memory space and bandwidth, bigkey will also have a relatively large impact on performance.

In this article [Summary of Common Redis Blocking Causes](./redis-common-blocking-problems-summary.md) we mentioned that large keys can also cause blocking problems. Specifically, it is mainly reflected in the following three aspects:

1. Client timeout blocking: Since Redis executes commands in a single thread, and it takes a long time to operate large keys, Redis will be blocked. From the perspective of the client, there will be no response for a long time.
2. Network blocking: Each time a large key is obtained, the network traffic is large. If the size of a key is 1 MB and the number of visits per second is 1,000, then 1,000 MB of traffic will be generated per second, which is catastrophic for servers with ordinary Gigabit network cards.
3. Working thread blocking: If you use del to delete a large key, the working thread will be blocked, making it impossible to process subsequent commands.

The blocking problem caused by large keys will further affect master-slave synchronization and cluster expansion.

In summary, there are many potential problems caused by big keys, and we should try to avoid the existence of big keys in Redis.

#### How to discover bigkey?

**1. Use the `--bigkeys` parameter that comes with Redis to search. **

```bash
# redis-cli -p 6379 --bigkeys

# Scanning the entire keyspace to find biggest keys as well as
# average sizes per key type. You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Biggest string found so far '"ballcat:oauth:refresh_auth:f6cdb384-9a9d-4f2f-af01-dc3f28057c20"' with 4437 bytes
[00.00%] Biggest list found so far '"my-list"' with 17 items

-------- summary -------

Sampled 5 keys in the keyspace!
Total key length in bytes is 264 (avg len 52.80)

Biggest list found '"my-list"' has 17 items
Biggest string found '"ballcat:oauth:refresh_auth:f6cdb384-9a9d-4f2f-af01-dc3f28057c20"' has 4437 bytes

1 lists with 17 items (20.00% of keys, avg size 17.00)
0 hashes with 0 fields (00.00% of keys, avg size 0.00)
4 strings with 4831 bytes (80.00% of keys, avg size 1207.75)
0 streams with 0 entries (00.00% of keys, avg size 0.00)
0 sets with 0 members (00.00% of keys, avg size 0.00)
0 zsets with 0 members (00.00% of keys, avg size 0.00
```

From the running results of this command, we can see that this command will scan (Scan) all keys in Redis, which will have a slight impact on the performance of Redis. Moreover, this method can only find the top 1 bigkey of each data structure (the String data type that takes up the largest memory, and the composite data type that contains the most elements). However, having many elements in a key does not mean that it takes up more memory. We need to make further judgments based on specific business conditions.

When executing this command online, in order to reduce the impact on Redis, you need to specify the `-i` parameter to control the frequency of scanning. `redis-cli -p 6379 --bigkeys -i 3` means that the rest interval after each scan during the scanning process is 3 seconds.

**2. Use the SCAN command that comes with Redis**

The `SCAN` command can return matching keys according to a certain pattern and number. After obtaining the key, you can use `STRLEN`, `HLEN`, `LLEN` and other commands to return its length or number of members.

| Data structure | Command | Complexity | Result (corresponding to key) |
| ---------- | ------ | ------ | ------------------ |
| String | STRLEN | O(1) | The length of the string value |
| Hash | HLEN | O(1) | Number of fields in the hash table |
| List | LLEN | O(1) | Number of elements in the list |
| Set | SCARD | O(1) | Number of set elements |
| Sorted Set | ZCARD | O(1) | Number of elements in a sorted set |

For collection types, you can also use the `MEMORY USAGE` command (Redis 4.0+). This command will return the memory space occupied by key-value pairs.

**3. Use open source tools to analyze RDB files. **

Find big keys by analyzing RDB files. The premise of this solution is that your Redis uses RDB persistence.

There are ready-made codes/tools available online that can be used directly:

- [redis-rdb-tools](https://github.com/sripathikrishnan/redis-rdb-tools): A tool written in Python language to analyze Redis RDB snapshot files.
- [rdb_bigkeys](https://github.com/weiyanwei412/rdb_bigkeys): A tool written in Go language to analyze Redis's RDB snapshot file, with better performance.

**4. Use the Redis analysis service of the public cloud. **

If you are using the public cloud Redis service, you can see if it provides key analysis function (usually it does).

Here we take Alibaba Cloud Redis as an example. It supports bigkey real-time analysis and discovery. The document address is: <https://www.alibabacloud.com/help/zh/apsaradb-for-redis/latest/use-the-real-time-key-statistics-feature>.

![Alibaba Cloud Key Analysis](https://oss.javaguide.cn/github/javaguide/database/redis/aliyun-key-analysis.png)

#### How to deal with bigkey?

Common processing and optimization methods for bigkey are as follows (these methods can be used in conjunction):

- **Split bigkey**: Split a bigkey into multiple small keys. For example, a Hash containing tens of thousands of fields is split into multiple Hash according to a certain strategy (such as secondary hashing).
- **Manual Cleanup**: Redis 4.0+ can use the `UNLINK` command to asynchronously delete one or more specified keys. For Redis 4.0 and below, you can consider using the `SCAN` command in combination with the `DEL` command to delete in batches.
- **Adopt appropriate data structures**: For example, do not use String to save file binary data, use HyperLogLog to count page UV, and Bitmap to save status information (0/1).
- **Turn on lazy-free (lazy deletion/delayed release)**: The lazy-free feature was introduced in Redis 4.0. It means that Redis uses an asynchronous method to delay the release of the memory used by the key, and hands the operation to a separate sub-thread to avoid blocking the main thread.

### Redis hotkey (hot key)

#### What is a hotkey?

If a key is accessed more often and significantly more than other keys, then this key can be regarded as a hotkey. For example, if a Redis instance processes 5,000 requests per second, and a certain key has 2,000 visits per second, then this key can be regarded as a hotkey.

The main reason for the emergence of hotkey is the sudden increase in the number of visits to a certain hot data, such as major hot search events and products participating in flash sales.#### What are the dangers of hotkey?

Processing hotkeys consumes a lot of CPU and bandwidth and may affect the normal processing of other requests by the Redis instance. In addition, if the sudden request to access the hotkey exceeds the processing capacity of Redis, Redis will directly crash. In this case, a large number of requests will fall on the later database, possibly causing the database to crash.

Therefore, hotkey is likely to become the bottleneck of system performance and needs to be optimized separately to ensure high availability and stability of the system.

#### How to find hotkey?

**1. Use the `--hotkeys` parameter that comes with Redis to search. **

The `hotkeys` parameter has been added to Redis version 4.0.3, which can return the number of times all keys have been accessed.

The prerequisite for using this solution is that the `maxmemory-policy` parameter of Redis Server is set to the LFU algorithm, otherwise the error shown below will occur.

```bash
# redis-cli -p 6379 --hotkeys

# Scanning the entire keyspace to find hot keys as well as
# average sizes per key type. You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

Error: ERR An LFU maxmemory policy is not selected, access frequency not tracked. Please note that when switching between policies at runtime LRU and LFU data will take some time to adjust.
```

There are two LFU algorithms in Redis:

1. **volatile-lfu (least frequently used)**: Select the least frequently used data from the data set (`server.db[i].expires`) with an expiration time set for elimination.
2. **allkeys-lfu (least frequently used)**: When the memory is not enough to accommodate newly written data, in the key space, remove the least frequently used key.

The following is an example from the configuration file `redis.conf`:

```properties
# Use volatile-lfu strategy
maxmemory-policy volatile-lfu

# Or use allkeys-lfu strategy
maxmemory-policy allkeys-lfu
```

It should be noted that the `hotkeys` parameter command will also increase the CPU and memory consumption (global scan) of the Redis instance, so it needs to be used with caution.

**2. Use the `MONITOR` command. **

The `MONITOR` command is a way provided by Redis to view all operations of Redis in real time. It can be used to temporarily monitor the operation of a Redis instance, including read, write, delete and other operations.

Since this command has a large impact on Redis performance, it is prohibited to open `MONITOR` for a long time (it is recommended to use this command with caution in a production environment).

```bash
#redis-cli
127.0.0.1:6379>MONITOR
OK
1683638260.637378 [0 172.17.0.1:61516] "ping"
1683638267.144236 [0 172.17.0.1:61518] "smembers" "mySet"
1683638268.941863 [0 172.17.0.1:61518] "smembers" "mySet"
1683638269.551671 [0 172.17.0.1:61518] "smembers" "mySet"
1683638270.646256 [0 172.17.0.1:61516] "ping"
1683638270.849551 [0 172.17.0.1:61518] "smembers" "mySet"
1683638271.926945 [0 172.17.0.1:61518] "smembers" "mySet"
1683638274.276599 [0 172.17.0.1:61518] "smembers" "mySet2"
1683638276.327234 [0 172.17.0.1:61518] "smembers" "mySet"
```

In the event of an emergency, we can choose to briefly execute the `MONITOR` command at an appropriate time and redirect the output to a file. After closing the `MONITOR` command, we can find out the hotkey during this period by classifying and analyzing the requests in the file.

**3. Use open source projects. **

JD Retail's [hotkey](https://gitee.com/jd-platform-opensource/hotkey) project not only supports hotkey discovery, but also supports hotkey processing.

![JD retail open source hotkey](https://oss.javaguide.cn/github/javaguide/database/redis/jd-hotkey.png)

**4. Estimate in advance based on business conditions. **

Some hotkeys can be estimated based on business conditions, such as product data participating in flash sale activities, etc. However, we cannot predict the emergence of all hotkeys, such as breaking hot news events.

**5. Record analysis in business code. **

Add corresponding logic to the business code to record and analyze key access conditions. However, this method will increase the complexity of the business code and is generally not used.

**6. Use the Redis analysis service of the public cloud. **

If you are using the public cloud Redis service, you can see if it provides key analysis function (usually it does).

Here we take Alibaba Cloud Redis as an example. It supports hotkey real-time analysis and discovery. The document address is: <https://www.alibabacloud.com/help/zh/apsaradb-for-redis/latest/use-the-real-time-key-statistics-feature>.

![Alibaba Cloud Key Analysis](https://oss.javaguide.cn/github/javaguide/database/redis/aliyun-key-analysis.png)

#### How to solve hotkey?

Common processing and optimization methods for hotkey are as follows (these methods can be used in conjunction):

- **Read and write separation**: The master node handles write requests, and the slave node handles read requests.
- **Use Redis Cluster**: Store hotspot data distributedly on multiple Redis nodes.
- **Level 2 Cache**: Hotkey is processed using Level 2 cache, and a copy of the hotkey is stored in the JVM local memory (Caffeine can be used).

In addition to these methods, if you use the public cloud Redis service, you can also pay attention to the out-of-the-box solutions it provides.

Here we take Alibaba Cloud Redis as an example. It supports optimizing hot key issues through the proxy query cache function (Proxy Query Cache).

![Optimizing hot key issues through Alibaba Cloud’s Proxy Query Cache](https://oss.javaguide.cn/github/javaguide/database/redis/aliyun-hotkey-proxy-query-cache.png)

### Slow query command

#### Why are there slow query commands?

We know that the execution of a Redis command can be simplified to the following 4 steps:

1. Send a command;
2. Command queuing;
3. Command execution;
4. Return the result.

Redis slow query counts the time it takes to execute this step of the command. Slow query commands are those commands that take a long time to execute.

Why does Redis have slow query commands?

Most commands in Redis have O(1) time complexity, but there are also a few commands with O(n) time complexity, such as:

- `KEYS *`: will return all keys that match the rules.
- `HGETALL`: will return all key-value pairs in a Hash.
- `LRANGE`: Returns elements within the specified range in List.
- `SMEMBERS`: Returns all elements in Set.
- `SINTER`/`SUNION`/`SDIFF`: Calculate the intersection/union/difference of multiple Sets.
-…

Since the time complexity of these commands is O(n), sometimes the entire table will be scanned. As n increases, the execution time will become longer. However, these commands do not necessarily cannot be used, but the value of N needs to be specified. In addition, if you have traversal requirements, you can use `HSCAN`, `SSCAN`, `ZSCAN` instead.

In addition to these O(n) time complexity commands that may cause slow queries, there are also some commands that may have a time complexity above O(N), such as:

- `ZRANGE`/`ZREVRANGE`: Returns all elements within the specified ranking range in the specified Sorted Set. The time complexity is O(log(n)+m), where n is the number of all elements and m is the number of elements returned. When m and n are quite large, the time complexity of O(n) is smaller.- `ZREMRANGEBYRANK`/`ZREMRANGEBYSCORE`：移除 Sorted Set 中指定排名范围/指定 score 范围内的所有元素。时间复杂度为 O(log(n)+m)，n 为所有元素的数量，m 被删除元素的数量，当 m 和 n 相当大时，O(n) 的时间复杂度更小。
- ……

#### 如何找到慢查询命令？

Redis 提供了一个内置的**慢查询日志 (Slow Log)** 功能，专门用来记录执行时间超过指定阈值的命令。这对于排查性能瓶颈、找出导致 Redis 阻塞的“慢”操作非常有帮助，原理和 MySQL 的慢查询日志类似。

在 `redis.conf` 文件中，我们可以使用 `slowlog-log-slower-than` 参数设置耗时命令的阈值，并使用 `slowlog-max-len` 参数设置耗时命令的最大记录条数。

当 Redis 服务器检测到执行时间超过 `slowlog-log-slower-than` 阈值的命令时，就会将该命令记录在慢查询日志（slow log）中，这点和 MySQL 记录慢查询语句类似。当慢查询日志超过设定的最大记录条数之后，Redis 会把最早的执行命令依次舍弃。

⚠️ 注意：由于慢查询日志会占用一定内存空间，如果设置最大记录条数过大，可能会导致内存占用过高的问题。

`slowlog-log-slower-than` 和 `slowlog-max-len` 的默认配置如下（可以自行修改）：

```properties
# The following time is expressed in microseconds, so 1000000 is equivalent
# to one second. Note that a negative number disables the slow log, while
# a value of zero forces the logging of every command.
slowlog-log-slower-than 10000

# There is no limit to this length. Just be aware that it will consume memory.
# You can reclaim memory used by the slow log with SLOWLOG RESET.
slowlog-max-len 128
```

除了修改配置文件之外，你也可以直接通过 `CONFIG` 命令直接设置：

```bash
# 命令执行耗时超过 10000 微妙（即10毫秒）就会被记录
CONFIG SET slowlog-log-slower-than 10000
# 只保留最近 128 条耗时命令
CONFIG SET slowlog-max-len 128
```

获取慢查询日志的内容很简单，直接使用 `SLOWLOG GET` 命令即可。

```bash
127.0.0.1:6379> SLOWLOG GET #慢日志查询
 1) 1) (integer) 5
   2) (integer) 1684326682
   3) (integer) 12000
   4) 1) "KEYS"
      2) "*"
   5) "172.17.0.1:61152"
   6) ""
  // ...
```

慢查询日志中的每个条目都由以下六个值组成：

1. **唯一 ID**: 日志条目的唯一标识符。
2. **时间戳 (Timestamp)**: 命令执行完成时的 Unix 时间戳。
3. **耗时 (Duration)**: 命令执行所花费的时间，单位是**微秒**。
4. **命令及参数 (Command)**: 执行的具体命令及其参数数组。
5. **客户端信息 (Client IP:Port)**: 执行命令的客户端地址和端口。
6. **客户端名称 (Client Name)**: 如果客户端设置了名称 (CLIENT SETNAME)。

`SLOWLOG GET` 命令默认返回最近 10 条的的慢查询命令，你也自己可以指定返回的慢查询命令的数量 `SLOWLOG GET N`。

下面是其他比较常用的慢查询相关的命令：

```bash
# 返回慢查询命令的数量
127.0.0.1:6379> SLOWLOG LEN
(integer) 128
# 清空慢查询命令
127.0.0.1:6379> SLOWLOG RESET
OK
```

### Redis 内存碎片

**相关问题**：

1. 什么是内存碎片？为什么会有 Redis 内存碎片？
2. 如何清理 Redis 内存碎片？

**参考答案**：[Redis 内存碎片详解](https://javaguide.cn/database/redis/redis-memory-fragmentation.html)。

## ⭐️Redis 生产问题（重要）

### 缓存穿透

#### 什么是缓存穿透？

缓存穿透说简单点就是大量请求的 key 是不合理的，**根本不存在于缓存中，也不存在于数据库中**。这就导致这些请求直接到了数据库上，根本没有经过缓存这一层，对数据库造成了巨大的压力，可能直接就被这么多请求弄宕机了。

![缓存穿透](https://oss.javaguide.cn/github/javaguide/database/redis/redis-cache-penetration.png)

举个例子：某个黑客故意制造一些非法的 key 发起大量请求，导致大量请求落到数据库，结果数据库上也没有查到对应的数据。也就是说这些请求最终都落到了数据库上，对数据库造成了巨大的压力。

#### 有哪些解决办法？

最基本的就是首先做好参数校验，一些不合法的参数请求直接抛出异常信息返回给客户端。比如查询的数据库 id 不能小于 0、传入的邮箱格式不对的时候直接返回错误消息给客户端等等。

**1）缓存无效 key**

如果缓存和数据库都查不到某个 key 的数据，就写一个到 Redis 中去并设置过期时间，具体命令如下：`SET key value EX 10086`。这种方式可以解决请求的 key 变化不频繁的情况，如果黑客恶意攻击，每次构建不同的请求 key，会导致 Redis 中缓存大量无效的 key。很明显，这种方案并不能从根本上解决此问题。如果非要用这种方式来解决穿透问题的话，尽量将无效的 key 的过期时间设置短一点，比如 1 分钟。

另外，这里多说一嘴，一般情况下我们是这样设计 key 的：`表名:列名:主键名:主键值`。

如果用 Java 代码展示的话，差不多是下面这样的：

```java
public Object getObjectInclNullById(Integer id) {
    // 从缓存中获取数据
    Object cacheValue = cache.get(id);
    // 缓存为空
    if (cacheValue == null) {
        // 从数据库中获取
        Object storageValue = storage.get(key);
        // 缓存空对象
        cache.set(key, storageValue);
        // 如果存储数据为空，需要设置一个过期时间(300秒)
        if (storageValue == null) {
            // 必须设置过期时间，否则有被攻击的风险
            cache.expire(key, 60 * 5);
        }
        return storageValue;
    }
    return cacheValue;
}
```

**2）布隆过滤器**

布隆过滤器是一个非常神奇的数据结构，通过它我们可以非常方便地判断一个给定数据是否存在于海量数据中。我们可以把它看作由二进制向量（或者说位数组）和一系列随机映射函数（哈希函数）两部分组成的数据结构。相比于我们平时常用的 List、Map、Set 等数据结构，它占用空间更少并且效率更高，但是缺点是其返回的结果是概率性的，而不是非常准确的。理论情况下添加到集合中的元素越多，误报的可能性就越大。并且，存放在布隆过滤器的数据不容易删除。

![Bloom Filter 的简单原理示意图](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-simple-schematic-diagram.png)

Bloom Filter 会使用一个较大的 bit 数组来保存所有的数据，数组中的每个元素都只占用 1 bit ，并且每个元素只能是 0 或者 1（代表 false 或者 true），这也是 Bloom Filter 节省内存的核心所在。这样来算的话，申请一个 100w 个元素的位数组只占用 1000000Bit / 8 = 125000 Byte = 125000/1024 KB ≈ 122KB 的空间。

![位数组](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-bit-table.png)

具体是这样做的：把所有可能存在的请求的值都存放在布隆过滤器中，当用户请求过来，先判断用户发来的请求的值是否存在于布隆过滤器中。不存在的话，直接返回请求参数错误信息给客户端，存在的话才会走下面的流程。

加入布隆过滤器之后的缓存处理流程图如下：

![加入布隆过滤器之后的缓存处理流程图](https://oss.javaguide.cn/github/javaguide/database/redis/redis-cache-penetration-bloom-filter.png)

更多关于布隆过滤器的详细介绍可以看看我的这篇原创：[不了解布隆过滤器？一文给你整的明明白白！](https://javaguide.cn/cs-basics/data-structure/bloom-filter.html)，强烈推荐。

**3）接口限流**

根据用户或者 IP 对接口进行限流，对于异常频繁的访问行为，还可以采取黑名单机制，例如将异常 IP 列入黑名单。

后面提到的缓存击穿和雪崩都可以配合接口限流来解决，毕竟这些问题的关键都是有很多请求落到了数据库上造成数据库压力过大。

限流的具体方案可以参考这篇文章：[服务限流详解](https://javaguide.cn/high-availability/limit-request.html)。

### 缓存击穿

#### 什么是缓存击穿？

缓存击穿中，请求的 key 对应的是 **热点数据**，该数据 **存在于数据库中，但不存在于缓存中（通常是因为缓存中的那份数据已经过期）**。这就可能会导致瞬时大量的请求直接打到了数据库上，对数据库造成了巨大的压力，可能直接就被这么多请求弄宕机了。

![缓存击穿](https://oss.javaguide.cn/github/javaguide/database/redis/redis-cache-breakdown.png)

举个例子：秒杀进行过程中，缓存中的某个秒杀商品的数据突然过期，这就导致瞬时大量对该商品的请求直接落到数据库上，对数据库造成了巨大的压力。

#### 有哪些解决办法？

1. **永不过期**（不推荐）：设置热点数据永不过期或者过期时间比较长。
2. **提前预热**（推荐）：针对热点数据提前预热，将其存入缓存中并设置合理的过期时间比如秒杀场景下的数据在秒杀结束之前不过期。
3. **加锁**（看情况）：在缓存失效后，通过设置互斥锁确保只有一个请求去查询数据库并更新缓存。

#### 缓存穿透和缓存击穿有什么区别？

缓存穿透中，请求的 key 既不存在于缓存中，也不存在于数据库中。

缓存击穿中，请求的 key 对应的是 **热点数据** ，该数据 **存在于数据库中，但不存在于缓存中（通常是因为缓存中的那份数据已经过期）** 。

### 缓存雪崩

#### 什么是缓存雪崩？

我发现缓存雪崩这名字起的有点意思，哈哈。

实际上，缓存雪崩描述的就是这样一个简单的场景：**缓存在同一时间大面积的失效，导致大量的请求都直接落到了数据库上，对数据库造成了巨大的压力。** 这就好比雪崩一样，摧枯拉朽之势，数据库的压力可想而知，可能直接就被这么多请求弄宕机了。

另外，缓存服务宕机也会导致缓存雪崩现象，导致所有的请求都落到了数据库上。

![缓存雪崩](https://oss.javaguide.cn/github/javaguide/database/redis/redis-cache-avalanche.png)

举个例子：缓存中的大量数据在同一时间过期，这个时候突然有大量的请求需要访问这些过期的数据。这就导致大量的请求直接落到数据库上，对数据库造成了巨大的压力。

#### 有哪些解决办法？

**针对 Redis 服务不可用的情况**：

1. **Redis 集群**：采用 Redis 集群，避免单机出现问题整个缓存服务都没办法使用。Redis Cluster 和 Redis Sentinel 是两种最常用的 Redis 集群实现方案，详细介绍可以参考：[Redis 集群详解(付费)](https://javaguide.cn/database/redis/redis-cluster.html)。
2. **多级缓存**：设置多级缓存，例如本地缓存+Redis 缓存的二级缓存组合，当 Redis 缓存出现问题时，还可以从本地缓存中获取到部分数据。

**针对大量缓存同时失效的情况**：

1. **设置随机失效时间**（可选）：为缓存设置随机的失效时间，例如在固定过期时间的基础上加上一个随机值，这样可以避免大量缓存同时到期，从而减少缓存雪崩的风险。
2. **提前预热**（推荐）：针对热点数据提前预热，将其存入缓存中并设置合理的过期时间，比如秒杀场景下的数据在秒杀结束之前不过期。
3. **持久缓存策略**（看情况）：虽然一般不推荐设置缓存永不过期，但对于某些关键性和变化不频繁的数据，可以考虑这种策略。

#### 缓存预热如何实现？

常见的缓存预热方式有两种：

1. 使用定时任务，比如 xxl-job，来定时触发缓存预热的逻辑，将数据库中的热点数据查询出来并存入缓存中。
2. 使用消息队列，比如 Kafka，来异步地进行缓存预热，将数据库中的热点数据的主键或者 ID 发送到消息队列中，然后由缓存服务消费消息队列中的数据，根据主键或者 ID 查询数据库并更新缓存。

#### 缓存雪崩和缓存击穿有什么区别？

缓存雪崩和缓存击穿比较像，但缓存雪崩导致的原因是缓存中的大量或者所有数据失效，缓存击穿导致的原因主要是某个热点数据不存在于缓存中（通常是因为缓存中的那份数据已经过期）。

### 如何保证缓存和数据库数据的一致性？

缓存和数据库一致性是个挺常见的技术挑战。引入缓存主要是为了提升性能、减轻数据库压力，但确实会带来数据不一致的风险。绝对的一致性往往意味着更高的系统复杂度和性能开销，所以实践中我们通常会根据业务场景选择合适的策略，在性能和一致性之间找到一个平衡点。

下面单独对 **Cache Aside Pattern（旁路缓存模式）** 来聊聊。这是非常常用的一种缓存读写策略，它的读写逻辑是这样的：

- **读操作**：
  1. 先尝试从缓存读取数据。
  2. 如果缓存命中，直接返回数据。
  3. 如果缓存未命中，从数据库查询数据，将查到的数据放入缓存并返回数据。
- **写操作**：
  1. 先更新数据库。
  2. 再直接删除缓存中对应的数据。

图解如下：

![](https://oss.javaguide.cn/github/javaguide/database/redis/cache-aside-write.png)

![](https://oss.javaguide.cn/github/javaguide/database/redis/cache-aside-read.png)

如果更新数据库成功，而删除缓存这一步失败的情况的话，简单说有两个解决方案：

1. **缓存失效时间（TTL - Time To Live）变短**（不推荐，治标不治本）：我们让缓存数据的过期时间变短，这样的话缓存就会从数据库中加载数据。另外，这种解决办法对于先操作缓存后操作数据库的场景不适用。
2. **增加缓存更新重试机制**（常用）：如果缓存服务当前不可用导致缓存删除失败的话，我们就隔一段时间进行重试，重试次数可以自己定。不过，这里更适合引入消息队列实现异步重试，将删除缓存重试的消息投递到消息队列，然后由专门的消费者来重试，直到成功。虽然说多引入了一个消息队列，但其整体带来的收益还是要更高一些。

相关文章推荐：[缓存和数据库一致性问题，看这篇就够了 - 水滴与银弹](https://mp.weixin.qq.com/s?__biz=MzIyOTYxNDI5OA==&mid=2247487312&idx=1&sn=fa19566f5729d6598155b5c676eee62d&chksm=e8beb8e5dfc931f3e35655da9da0b61c79f2843101c130cf38996446975014f958a6481aacf1&scene=178&cur_album_id=1699766580538032128#rd)。

### 哪些情况可能会导致 Redis 阻塞？

常见的导致 Redis 阻塞原因有：

- `O(n)` 复杂度命令执行（如 `KEYS *`、`HGETALL`、`LRANGE`、`SMEMBERS` 等），随着数据量增大导致执行时间过长。
- 执行 `SAVE` 命令生成 RDB 快照时同步阻塞主线程，而 `BGSAVE` 通过 `fork` 子进程避免阻塞。
- AOF 记录日志在主线程中进行，可能因命令执行后写日志而阻塞后续命令。
- AOF 刷盘（fsync）时后台线程同步到磁盘，磁盘压力大导致 `fsync` 阻塞，进而阻塞主线程 `write` 操作，尤其在 `appendfsync always` 或 `everysec` 配置下明显。
- AOF 重写过程中将重写缓冲区内容追加到新 AOF 文件时产生阻塞。
- Operating large keys (string > 1MB or composite type elements > 5000) causes client timeouts, network blocking, and worker thread blocking.
- Using `flushdb` or `flushall` to clear the database involves deleting a large number of key-value pairs and releasing memory, causing the main thread to block.
- Data migration is a synchronous operation when the cluster is expanded or reduced. Migration of large keys causes nodes at both ends to be blocked for a long time, which may trigger failover.
- Insufficient memory triggers Swap, and the operating system swaps out the Redis memory to the hard disk, causing a sharp decline in read and write performance.
- Other processes excessively occupy the CPU, causing Redis throughput to decrease.
- Network problems such as connection rejection, high latency, network card soft interrupt, etc. cause Redis to block.

For a detailed introduction, you can read this article: [Summary of common blocking causes in Redis](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html).

## Redis cluster

**Redis Sentinel**:

1. What is Sentinel? What's the use?
2. How does Sentinel detect whether a node is offline? What is the difference between subjective offline and objective offline?
3. How does Sentinel implement failover?
4. Why is it recommended to deploy multiple sentinel nodes (sentinel cluster)?
5. How does Sentinel choose a new master (election mechanism)?
6. How to select Leader from Sentinel cluster?
7. Can Sentinel prevent split-brain?

**Redis Cluster**:

1. Why do you need Redis Cluster? What problem was solved? What are the advantages?
2. How is Redis Cluster sharded?
3. Why are the hash slots of Redis Cluster 16384?
4. How to determine which hash slot a given key should be distributed to?
5. Does Redis Cluster support redistribution of hash slots?
6. Can Redis Cluster provide services during expansion and contraction?
7. How do nodes in Redis Cluster communicate?

**Reference answer**: [Detailed explanation of Redis cluster (paid)](https://javaguide.cn/database/redis/redis-cluster.html).

## Redis usage specifications

In the actual use of Redis, we try to adhere to some common specifications, such as:

1. Use a connection pool: avoid frequently creating and closing client connections.
2. Try not to use O(n) commands. When using O(n) commands, pay attention to the number of n: O(n) commands such as `KEYS *`, `HGETALL`, `LRANGE`, `SMEMBERS`, `SINTER`/`SUNION`/`SDIFF` are not unusable, but the value of n needs to be clear. In addition, if you have traversal requirements, you can use `HSCAN`, `SSCAN`, `ZSCAN` instead.
3. Use batch operations to reduce network transmission: native batch operation commands (such as `MGET`, `MSET`, etc.), pipeline, Lua scripts.
4. Try not to use Redis transactions: The functions implemented by Redis transactions are relatively useless, and you can use Lua scripts instead.
5. It is forbidden to turn on the monitor for a long time: it will have a great impact on performance.
6. Control the life cycle of the key: Avoid storing too much data that is not frequently accessed in Redis.
7.…

## Reference

- "Redis Development and Operation and Maintenance"
- "Redis Design and Implementation"
- Redis Transactions: <https://redis.io/docs/manual/transactions/>
- What is Redis Pipeline：<https://buildatscale.tech/what-is-redis-pipeline/>
- A detailed explanation of the discovery and processing of BigKey and HotKey in Redis: <https://mp.weixin.qq.com/s/FPYE1B839_8Yk1-YSiW-1Q>
- Exploration of ideas and methods for solving Bigkey problems: <https://mp.weixin.qq.com/s/Sej7D9TpdAobcCmdYdMIyA>
- Comprehensive troubleshooting guide for Redis latency issues: <https://mp.weixin.qq.com/s/mIc6a9mfEGdaNDD3MmfFsg>

<!-- @include: @article-footer.snippet.md -->