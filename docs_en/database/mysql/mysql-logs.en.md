---
title: MySQL三大日志(binlog、redo log和undo log)详解
category: 数据库
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL 日志,binlog,redo log,undo log,两阶段提交,崩溃恢复,复制
  - - meta
    - name: description
      content: 系统解析 MySQL 的 binlog/redo/undo 三大日志与两阶段提交，理解崩溃恢复与主从复制的实现原理与取舍。
---

> 本文来自公号程序猿阿星投稿，JavaGuide 对其做了补充完善。

## 前言

MySQL 日志 主要包括错误日志、查询日志、慢查询日志、事务日志、二进制日志几大类。其中，比较重要的还要属二进制日志 binlog（归档日志）和事务日志 redo log（重做日志）和 undo log（回滚日志）。

![](https://oss.javaguide.cn/github/javaguide/01.png)

今天就来聊聊 redo log（重做日志）、binlog（归档日志）、两阶段提交、undo log（回滚日志）。

## redo log

redo log（重做日志）是 InnoDB 存储引擎独有的，它让 MySQL 拥有了崩溃恢复能力。

比如 MySQL 实例挂了或宕机了，重启时，InnoDB 存储引擎会使用 redo log 恢复数据，保证数据的持久性与完整性。

![](https://oss.javaguide.cn/github/javaguide/02.png)

MySQL 中数据是以页为单位，你查询一条记录，会从硬盘把一页的数据加载出来，加载出来的数据叫数据页，会放入到 `Buffer Pool` 中。

后续的查询都是先从 `Buffer Pool` 中找，没有命中再去硬盘加载，减少硬盘 IO 开销，提升性能。

更新表数据的时候，也是如此，发现 `Buffer Pool` 里存在要更新的数据，就直接在 `Buffer Pool` 里更新。

然后会把“在某个数据页上做了什么修改”记录到重做日志缓存（`redo log buffer`）里，接着刷盘到 redo log 文件里。

![](https://oss.javaguide.cn/github/javaguide/03.png)

> 图片笔误提示：第 4 步 “清空 redo log buffe 刷盘到 redo 日志中”这句话中的 buffe 应该是 buffer。

理想情况，事务一提交就会进行刷盘操作，但实际上，刷盘的时机是根据策略来进行的。

> 小贴士：每条 redo 记录由“表空间号+数据页号+偏移量+修改数据长度+具体修改的数据”组成

### 刷盘时机

在 InnoDB 存储引擎中，**redo log buffer**（重做日志缓冲区）是一块用于暂存 redo log 的内存区域。为了确保事务的持久性和数据的一致性，InnoDB 会在特定时机将这块缓冲区中的日志数据刷新到磁盘上的 redo log 文件中。这些时机可以归纳为以下六种：

1. **事务提交时（最核心）**：当事务提交时，log buffer 里的 redo log 会被刷新到磁盘（可以通过`innodb_flush_log_at_trx_commit`参数控制，后文会提到）。
2. **redo log buffer 空间不足时**：这是 InnoDB 的一种主动容量管理策略，旨在避免因缓冲区写满而导致用户线程阻塞。
   - 当 redo log buffer 的已用空间超过其总容量的**一半 (50%)** 时，后台线程会**主动**将这部分日志刷新到磁盘，为后续的日志写入腾出空间，这是一种“未雨绸缪”的优化。
   - 如果因为大事务或 I/O 繁忙导致 buffer 被**完全写满**，那么所有试图写入新日志的用户线程都会被**阻塞**，并强制进行一次同步刷盘，直到有可用空间为止。这种情况会影响数据库性能，应尽量避免。
3. **触发检查点 (Checkpoint) 时**：Checkpoint 是 InnoDB 为了缩短崩溃恢复时间而设计的核心机制。当 Checkpoint 被触发时，InnoDB 需要将在此检查点之前的所有脏页刷写到磁盘。根据 **Write-Ahead Logging (WAL)** 原则，数据页写入磁盘前，其对应的 redo log 必须先落盘。因此，执行 Checkpoint 操作必然会确保相关的 redo log 也已经被刷新到了磁盘。
4. **后台线程周期性刷新**：InnoDB 有一个后台的 master thread，它会大约每秒执行一次例行任务，其中就包括将 redo log buffer 中的日志刷新到磁盘。这个机制是 `innodb_flush_log_at_trx_commit` 设置为 0 或 2 时的主要持久化保障。
5. **正常关闭服务器**：在 MySQL 服务器正常关闭的过程中，为了确保所有已提交事务的数据都被完整保存，InnoDB 会执行一次最终的刷盘操作，将 redo log buffer 中剩余的全部日志都清空并写入磁盘文件。
6. **binlog 切换时**：当开启 binlog 后，在 MySQL 采用 `innodb_flush_log_at_trx_commit=1` 和 `sync_binlog=1` 的 双一配置下，为了保证 redo log 和 binlog 之间状态的一致性（用于崩溃恢复或主从复制），在 binlog 文件写满或者手动执行 flush logs 进行切换时，会触发 redo log 的刷盘动作。

总之，InnoDB 在多种情况下会刷新重做日志，以保证数据的持久性和一致性。

我们要注意设置正确的刷盘策略`innodb_flush_log_at_trx_commit` 。根据 MySQL 配置的刷盘策略的不同，MySQL 宕机之后可能会存在轻微的数据丢失问题。

`innodb_flush_log_at_trx_commit` 的值有 3 种，也就是共有 3 种刷盘策略：

- **0**：设置为 0 的时候，表示每次事务提交时不进行刷盘操作。这种方式性能最高，但是也最不安全，因为如果 MySQL 挂了或宕机了，可能会丢失最近 1 秒内的事务。
- **1**：设置为 1 的时候，表示每次事务提交时都将进行刷盘操作。这种方式性能最低，但是也最安全，因为只要事务提交成功，redo log 记录就一定在磁盘里，不会有任何数据丢失。
- **2**：设置为 2 的时候，表示每次事务提交时都只把 log buffer 里的 redo log 内容写入 page cache（文件系统缓存）。page cache 是专门用来缓存文件的，这里被缓存的文件就是 redo log 文件。这种方式的性能和安全性都介于前两者中间。

刷盘策略`innodb_flush_log_at_trx_commit` 的默认值为 1，设置为 1 的时候才不会丢失任何数据。为了保证事务的持久性，我们必须将其设置为 1。

另外，InnoDB 存储引擎有一个后台线程，每隔`1` 秒，就会把 `redo log buffer` 中的内容写到文件系统缓存（`page cache`），然后调用 `fsync` 刷盘。

![](https://oss.javaguide.cn/github/javaguide/04.png)

也就是说，一个没有提交事务的 redo log 记录，也可能会刷盘。

**为什么呢？**

因为在事务执行过程 redo log 记录是会写入`redo log buffer` 中，这些 redo log 记录会被后台线程刷盘。

![](https://oss.javaguide.cn/github/javaguide/05.png)

除了后台线程每秒`1`次的轮询操作，还有一种情况，当 `redo log buffer` 占用的空间即将达到 `innodb_log_buffer_size` 一半的时候，后台线程会主动刷盘。

下面是不同刷盘策略的流程图。

#### innodb_flush_log_at_trx_commit=0

![](https://oss.javaguide.cn/github/javaguide/06.png)

为`0`时，如果 MySQL 挂了或宕机可能会有`1`秒数据的丢失。

#### innodb_flush_log_at_trx_commit=1

![](https://oss.javaguide.cn/github/javaguide/07.png)

为`1`时， 只要事务提交成功，redo log 记录就一定在硬盘里，不会有任何数据丢失。

如果事务执行期间 MySQL 挂了或宕机，这部分日志丢了，但是事务并没有提交，所以日志丢了也不会有损失。

#### innodb_flush_log_at_trx_commit=2

![](https://oss.javaguide.cn/github/javaguide/09.png)

When it is `2`, as long as the transaction is submitted successfully, the contents in `redo log buffer` are only written to the file system cache (`page cache`).

If MySQL is just down, there will be no data loss, but the downtime may result in `1` second of data loss.

### Log file group

There is more than one redo log file stored on the hard disk, but it appears in the form of a **log file group**. The size of each `redo` log file is the same.

For example, it can be configured as a set of `4` files, the size of each file is `1GB`, and the entire redo log log file group can record the contents of `4G`.

It adopts the form of a circular array, writing from the beginning, writing to the end and then returning to the beginning to write in a loop, as shown in the figure below.

![](https://oss.javaguide.cn/github/javaguide/10.png)

There are two important attributes in this **log file group**, namely `write pos, checkpoint`

- **write pos** is the position of the current record, moving backward while writing
- **checkpoint** is the current position to be erased, and it is also moved to the future.

Every time the redo log is flushed and recorded in the **log file group**, the `write pos` position will be moved back and updated.

Each time MySQL loads the **log file group** to recover data, the loaded redo log records will be cleared, and the `checkpoint` will be moved back and updated.

The empty part between `write pos` and `checkpoint` can be used to write new redo log records.

![](https://oss.javaguide.cn/github/javaguide/11.png)

If `write pos` catches up with `checkpoint`, it means that the **log file group** is full. At this time, new redo log records cannot be written. MySQL has to stop, clear some records, and advance `checkpoint`.

![](https://oss.javaguide.cn/github/javaguide/12.png)

Note that starting from MySQL 8.0.30, the log file group has changed slightly:

> The innodb_redo_log_capacity variable supersedes the innodb_log_files_in_group and innodb_log_file_size variables, which are deprecated. When the innodb_redo_log_capacity setting is defined, the innodb_log_files_in_group and innodb_log_file_size settings are ignored; otherwise, these settings are used to compute the innodb_redo_log_capacity setting (innodb_log_files_in_group \* innodb_log_file_size = innodb_redo_log_capacity). If none of those variables are set, redo log capacity is set to the innodb_redo_log_capacity default value, which is 104857600 bytes (100MB). The maximum redo log capacity is 128GB.

> Redo log files reside in the #innodb_redo directory in the data directory unless a different directory was specified by the innodb_log_group_home_dir variable. If innodb_log_group_home_dir was defined, the redo log files reside in the #innodb_redo directory in that directory. to be used. InnoDB tries to maintain 32 redo log files in total, with each file equal in size to 1/32 \* innodb_redo_log_capacity; however, file sizes may differ for a time after modifying the innodb_redo_log_capacity setting.

This means that before MySQL 8.0.30, you can configure the number and file size of the log file group through `innodb_log_files_in_group` and `innodb_log_file_size`, but in MySQL 8.0.30 and later versions, these two variables have been abandoned, and even if they are specified, they are used to calculate the value of `innodb_redo_log_capacity`. The number of files in the log file group is fixed at 32, and the file size is `innodb_redo_log_capacity / 32`.

Regarding this change, we can verify it.

First create a configuration file and configure the values ​​of `innodb_log_files_in_group` and `innodb_log_file_size`:

```properties
[mysqld]
innodb_log_file_size = 10485760
innodb_log_files_in_group = 64
```

Docker starts a MySQL 8.0.32 container:

```bash
docker run -d -p 3312:3309 -e MYSQL_ROOT_PASSWORD=your-password -v /path/to/your/conf:/etc/mysql/conf.d --name
MySQL830 mysql:8.0.32
```

Now let's take a look at the startup log:

```plain
2023-08-03T02:05:11.720357Z 0 [Warning] [MY-013907] [InnoDB] Deprecated configuration parameters innodb_log_file_size and/or innodb_log_files_in_group have been used to compute innodb_redo_log_capacity=671088640. Please use innodb_redo_log_capacity instead.
```

It is also shown here that the two variables `innodb_log_files_in_group` and `innodb_log_file_size` are used to calculate `innodb_redo_log_capacity` and have been deprecated.

Let’s take a look at the number of files in the log file group:

![](images/redo-log.png)

You can see that there are exactly 32, and the size of each log file is `671088640 / 32 = 20971520`

Therefore, when using MySQL 8.0.30 and later versions, it is recommended to use the `innodb_redo_log_capacity` variable to configure the log file group

### redo log summary

I believe everyone knows the function of redo log, its flushing time and storage mode.

Now let's think about a question: **As long as the modified data page is flushed directly to the disk every time, what's the point of the redo log? **

Aren't they all brushes? What's the difference?

```java
1 Byte=8bit
1 KB = 1024 Byte
1 MB = 1024 KB
1 GB = 1024 MB
1 TB = 1024 GB
```

In fact, the data page size is `16KB`, and flushing is time-consuming. It may only modify a few `Byte` data in the data page. Is it necessary to flush the complete data page?

Moreover, data page flushing is written randomly, because the corresponding location of a data page may be at a random location in the hard disk file, so the performance is very poor.

If you are writing redo log, one row of records may occupy dozens of `Byte` and only include the table space number, data page number, and disk file offset.
Amount, update value, plus sequential writing, so the disk flushing speed is very fast.

Therefore, the performance of recording modifications in the form of redo log will far exceed that of refreshing the data page, which also makes the database's concurrency capability stronger.

> In fact, the data pages of the memory will also be flushed at certain times. We call this page merging. We will explain this in detail when we talk about `Buffer Pool`

## binlog

redo log is a physical log that records "what modifications were made on a certain data page" and belongs to the InnoDB storage engine.

Binlog is a logical log, and the record content is the original logic of the statement, similar to "add 1 to the c field of the row with ID=2", and belongs to the `MySQL Server` layer.不管用什么存储引擎，只要发生了表数据更新，都会产生 binlog 日志。

那 binlog 到底是用来干嘛的？

可以说 MySQL 数据库的**数据备份、主备、主主、主从**都离不开 binlog，需要依靠 binlog 来同步数据，保证数据一致性。

![](https://oss.javaguide.cn/github/javaguide/01-20220305234724956.png)

binlog 会记录所有涉及更新数据的逻辑操作，并且是顺序写。

### 记录格式

binlog 日志有三种格式，可以通过`binlog_format`参数指定。

- **statement**
- **row**
- **mixed**

指定`statement`，记录的内容是`SQL`语句原文，比如执行一条`update T set update_time=now() where id=1`，记录的内容如下。

![](https://oss.javaguide.cn/github/javaguide/02-20220305234738688.png)

同步数据时，会执行记录的`SQL`语句，但是有个问题，`update_time=now()`这里会获取当前系统时间，直接执行会导致与原库的数据不一致。

为了解决这种问题，我们需要指定为`row`，记录的内容不再是简单的`SQL`语句了，还包含操作的具体数据，记录内容如下。

![](https://oss.javaguide.cn/github/javaguide/03-20220305234742460.png)

`row`格式记录的内容看不到详细信息，要通过`mysqlbinlog`工具解析出来。

`update_time=now()`变成了具体的时间`update_time=1627112756247`，条件后面的@1、@2、@3 都是该行数据第 1 个~3 个字段的原始值（**假设这张表只有 3 个字段**）。

这样就能保证同步数据的一致性，通常情况下都是指定为`row`，这样可以为数据库的恢复与同步带来更好的可靠性。

但是这种格式，需要更大的容量来记录，比较占用空间，恢复与同步时会更消耗 IO 资源，影响执行速度。

所以就有了一种折中的方案，指定为`mixed`，记录的内容是前两者的混合。

MySQL 会判断这条`SQL`语句是否可能引起数据不一致，如果是，就用`row`格式，否则就用`statement`格式。

### 写入机制

binlog 的写入时机也非常简单，事务执行过程中，先把日志写到`binlog cache`，事务提交的时候，再把`binlog cache`写到 binlog 文件中。

因为一个事务的 binlog 不能被拆开，无论这个事务多大，也要确保一次性写入，所以系统会给每个线程分配一个块内存作为`binlog cache`。

我们可以通过`binlog_cache_size`参数控制单个线程 binlog cache 大小，如果存储内容超过了这个参数，就要暂存到磁盘（`Swap`）。

binlog 日志刷盘流程如下

![](https://oss.javaguide.cn/github/javaguide/04-20220305234747840.png)

- **上图的 write，是指把日志写入到文件系统的 page cache，并没有把数据持久化到磁盘，所以速度比较快**
- **上图的 fsync，才是将数据持久化到磁盘的操作**

`write`和`fsync`的时机，可以由参数`sync_binlog`控制，默认是`1`。

为`0`的时候，表示每次提交事务都只`write`，由系统自行判断什么时候执行`fsync`。

![](https://oss.javaguide.cn/github/javaguide/05-20220305234754405.png)

虽然性能得到提升，但是机器宕机，`page cache`里面的 binlog 会丢失。

为了安全起见，可以设置为`1`，表示每次提交事务都会执行`fsync`，就如同 **redo log 日志刷盘流程** 一样。

最后还有一种折中方式，可以设置为`N(N>1)`，表示每次提交事务都`write`，但累积`N`个事务后才`fsync`。

![](https://oss.javaguide.cn/github/javaguide/06-20220305234801592.png)

在出现 IO 瓶颈的场景里，将`sync_binlog`设置成一个比较大的值，可以提升性能。

同样的，如果机器宕机，会丢失最近`N`个事务的 binlog 日志。

## 两阶段提交

redo log（重做日志）让 InnoDB 存储引擎拥有了崩溃恢复能力。

binlog（归档日志）保证了 MySQL 集群架构的数据一致性。

虽然它们都属于持久化的保证，但是侧重点不同。

在执行更新语句过程，会记录 redo log 与 binlog 两块日志，以基本的事务为单位，redo log 在事务执行过程中可以不断写入，而 binlog 只有在提交事务时才写入，所以 redo log 与 binlog 的写入时机不一样。

![](https://oss.javaguide.cn/github/javaguide/01-20220305234816065.png)

回到正题，redo log 与 binlog 两份日志之间的逻辑不一致，会出现什么问题？

我们以`update`语句为例，假设`id=2`的记录，字段`c`值是`0`，把字段`c`值更新成`1`，`SQL`语句为`update T set c=1 where id=2`。

假设执行过程中写完 redo log 日志后，binlog 日志写期间发生了异常，会出现什么情况呢？

![](https://oss.javaguide.cn/github/javaguide/02-20220305234828662.png)

由于 binlog 没写完就异常，这时候 binlog 里面没有对应的修改记录。因此，之后用 binlog 日志恢复数据时，就会少这一次更新，恢复出来的这一行`c`值是`0`，而原库因为 redo log 日志恢复，这一行`c`值是`1`，最终数据不一致。

![](https://oss.javaguide.cn/github/javaguide/03-20220305235104445.png)

为了解决两份日志之间的逻辑一致问题，InnoDB 存储引擎使用**两阶段提交**方案。

原理很简单，将 redo log 的写入拆成了两个步骤`prepare`和`commit`，这就是**两阶段提交**。

![](https://oss.javaguide.cn/github/javaguide/04-20220305234956774.png)

使用**两阶段提交**后，写入 binlog 时发生异常也不会有影响，因为 MySQL 根据 redo log 日志恢复数据时，发现 redo log 还处于`prepare`阶段，并且没有对应 binlog 日志，就会回滚该事务。

![](https://oss.javaguide.cn/github/javaguide/05-20220305234937243.png)

再看一个场景，redo log 设置`commit`阶段发生异常，那会不会回滚事务呢？

![](https://oss.javaguide.cn/github/javaguide/06-20220305234907651.png)

并不会回滚事务，它会执行上图框住的逻辑，虽然 redo log 是处于`prepare`阶段，但是能通过事务`id`找到对应的 binlog 日志，所以 MySQL 认为是完整的，就会提交事务恢复数据。

## undo log

> 这部分内容为 JavaGuide 的补充：

每一个事务对数据的修改都会被记录到 undo log ，当执行事务过程中出现错误或者需要执行回滚操作的话，MySQL 可以利用 undo log 将数据恢复到事务开始之前的状态。

undo log 属于逻辑日志，记录的是 SQL 语句，比如说事务执行一条 DELETE 语句，那 undo log 就会记录一条相对应的 INSERT 语句。同时，undo log 的信息也会被记录到 redo log 中，因为 undo log 也要实现持久性保护。并且，undo-log 本身是会被删除清理的，例如 INSERT 操作，在事务提交之后就可以清除掉了；UPDATE/DELETE 操作在事务提交不会立即删除，会加入 history list，由后台线程 purge 进行清理。

undo log 是采用 segment（段）的方式来记录的，每个 undo 操作在记录的时候占用一个 **undo log segment**（undo 日志段），undo log segment 包含在 **rollback segment**（回滚段）中。事务开始时，需要为其分配一个 rollback segment。每个 rollback segment 有 1024 个 undo log segment，这有助于管理多个并发事务的回滚需求。

Normally, the **rollback segment header** (usually the first page of the rollback segment) is responsible for managing the rollback segment. The rollback segment header is part of the rollback segment, usually on the first page of the rollback segment. **history list** is part of the rollback segment header. Its main function is to record the undo log of all transactions that have been submitted but have not yet been purged. This list enables the purge thread to find and clean up undo log records that are no longer needed.

In addition, the implementation of `MVCC` depends on: **Hidden fields, Read View, and undo log**. In the internal implementation, InnoDB determines the visibility of the data through the `DB_TRX_ID` and `Read View` of the data row. If it is not visible, it uses the `DB_ROLL_PTR` of the data row to find the historical version in the undo log. The data version read by each transaction may be different. In the same transaction, the user can only see the modifications committed before the transaction created `Read View` and the modifications made by the transaction itself.

## Summary

> This part is a supplement to JavaGuide:

The MySQL InnoDB engine uses **redo log (redo log)** to ensure the **durability** of transactions, and uses **undo log (rollback log)** to ensure the **atomicity** of transactions.

The **data backup, primary and secondary, primary-master, and master-slave** of the MySQL database are all inseparable from binlog. Binlog is required to synchronize data and ensure data consistency.

## Reference

- "MySQL Practical Lectures 45"
- "Take you to become a MySQL practical optimization master from scratch"
- "How MySQL works: Understanding MySQL from the fundamentals"
- "MySQL Technology Innodb Storage Engine"

<!-- @include: @article-footer.snippet.md -->