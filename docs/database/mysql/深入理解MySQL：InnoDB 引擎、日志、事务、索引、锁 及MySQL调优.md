@[toc]

# 逻辑架构

 ![在这里插入图片描述](https://img-blog.csdnimg.cn/cb2b03ed6f744cf68002e0150631ead4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)

|阶段|注意事项  |
|--|--|
| 连接器 | 建立连接成本过高，尽量使用长连接，维护长连接的方式有两种：定期断开长连接或定期执行mysql_reset_connection 来重新初始化连接资源|
| 查询缓存 | （key-value形式）key是查询语句，value是查询结果，查询缓存命中率不高，弊大于利，在mysql8.0已被移除 |
| 分析器 | 判断表是否存在，列是否存在，判断sql语句是否满足语法规则，不满足返回 You have an error in your SQL syntax |
| 优化器 | 选择索引（依据扫描行数，是否使用临时表，是否排序），存在join时，决定各表的连接顺序 |
| 执行器 | 判断表权限，调用引擎接口|


# 日志系统
## 1.redo log与binlog的对比

|  | redo log | binlog |
|---|--|--|
| 存在位置 | InnoDB 引擎特有的  |  Server 层实现的，所有引擎都可以使用|
| 日志性质 | 物理日志，记录的是“在某个数据页上做了什么修改”  |逻辑日志，记录的是这个语句的原始逻辑，比如“给 ID=2 这一行的 c 字段加 1  |
| 写入方式 | 循环写的，空间固定会用完  |追加写，写到一定大小后会切换到下一个，并不会覆盖以前的日志 |
|写入逻辑 | 事务在执行过程中，生成的 redo log 要先写到 redo log buffer ，**redo log buffer 是全局共用的**|事务执行过程中，先把日志写到 binlog cache，事务提交的时候，再把 binlog cache 写到 binlog 文件中， **binlog cache 是每个线程自己维护的**|
| 单步持久化到磁盘开关 |  innodb_flush_log_at_trx_commit=1 | sync_binlog=1 |
| 主要职责 |  异常重启恢复 | 备份迁移，归档 |
| 重建数据状态 | 只能重建到最新状态| 可以重建到任何历史状态   |

**“双 1”配置**：指的是 sync_binlog 和 innodb_flush_log_at_trx_commit 都设置成 1，也就是说，一个事务完整提交前，需要等待两次刷盘，一次是 redo log（prepare 阶段），一次是 binlog

两种日志均实现了数据库的**Write-Ahead Logging**，即先写日志，再写磁盘，减少磁盘写 IO

WAL 机制主要得益于两个方面：
1. redo log 和 binlog 都是顺序写，磁盘的顺序写比随机写速度要快
2. 组提交机制，可以大幅度降低磁盘的 IOPS 消耗

binlog 没有崩溃恢复的能力，由于 **WAL技术**，有些修改是还没有落盘的，但是事物已经提交，这时候如果崩溃，重启后看 binlog 会认为这些修改已经落盘了（或者说根本没法判断落没落盘），这样就会丢失修改

而 redo log 的 checkpoint 机制保障了异常重启的恢复能力，在 checkpoint 后面的记录肯定是没有刷盘的，所以只需要重放一遍即可，当崩毁恢复时，redo log 负责将内存数据更新成最新的，然后再刷脏页，而不是由 redo log 直接恢复数据

**binlog cache 是每个线程自己维护的，而 redo log buffer 是全局共用的原因**：binlog 是一种逻辑性的日志，记录的是一个事务完整的语句。当用来做主从同步，如果分散写，可能造成事务不完整，分多次执行，从而导致不可预知的问题。 而 redo log 属于物理性的日志，记录的是物理地址的变动，因此，分散写也不会改变最终的结果

## 2.redo log


**redo log的逻辑架构**

![在这里插入图片描述](https://img-blog.csdnimg.cn/cff7887c59d6425187169d33d5f891c7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)


 - write pos 是当前记录的位置，一边写一边后移
 - write pos 和 checkpoint 之间的空余部分，用来记录新的操作
 - 如果 write pos 追上 checkpoint，表示没有空余部分，这时候不能再执行新的更新，得停下来先擦掉一些记录，把 checkpoint 推进

**LSN**

LSN是指日志逻辑序列号（log sequence number），LSN 是单调递增的，用来对应 redo log 的一个个写入点。每次写入长度为 length 的 redo log， LSN 的值就会加上 length

LSN 也会写到 InnoDB 的数据页中，来确保数据页不会被多次执行重复的 redo log

**redo log 的写入机制**

redo log buffer 是一块内存，还未提交的事务会先写 入redo log buffer 再写入 redo log

![在这里插入图片描述](https://img-blog.csdnimg.cn/36cd3c77cb344699bdedd1a1ab116c99.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)redo log 的三种存储状态：

- 存在 redo log buffer 中，物理上是在 MySQL 进程内存中，就是图中的红色部分
- 写到磁盘 (write)，但是没有持久化（fsync)，物理上是在文件系统的 page cache 里面，也就是图中的黄色部分
- 持久化到磁盘，对应的是 hard disk，也就是图中的绿色部分

日志写到 redo log buffer 和 wirte 到 page cache 都很快，但是持久化到磁盘的速度就慢多了

redo log 的写入策略，由InnoDB 提供的 innodb_flush_log_at_trx_commit 参数控制：
- 设置为 0 的时候，表示每次事务提交时都只是把 redo log 留在 redo log buffer 中 
- 设置为 1 的时候，表示每次事务提交时都将 redo log 直接持久化到磁盘
- 设置为 2 的时候，表示每次事务提交时都只是把 redo log 写到 page cache

没有提交的事务的 redo log ，但可能已经持久化到磁盘的情况有：
1. 后台每秒的轮询，会把 redo log buffer 中的日志，调用 write 写到文件系统的 page cache，然后调用 fsync 持久化到磁盘
2. redo log buffer 占用的空间即将达到 innodb_log_buffer_size 一半的时候，后台线程会主动写盘
3. 并行的事务提交的时候，顺带将这个事务的 redo log buffer 持久化到磁盘

## 3.binlog

MySQL 能够成为现下最流行的开源数据库，binlog 功不可没，其几乎所有的高可用架构，都直接依赖于 binlog

**binlog 的写入机制**

![在这里插入图片描述](https://img-blog.csdnimg.cn/4e26a323953f4d7cb3b0a25653fb6eeb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)
如图，每个线程有自己的 binlog cache，但是共用同一份 binlog 文件

 - 图中的 **write**，指的就是指把日志写入到文件系统的 page cache，并没有把数据持久化到磁盘，所以速度比较快
 - 图中的 **fsync**，才是将数据持久化到磁盘的操作。一般情况下，我们认为 fsync 才占磁盘的 IOPS


write 和 fsync 的时机，由参数 sync_binlog 控制

- sync_binlog=0 的时候，表示每次提交事务都只 write，不 fsync
- sync_binlog=1 的时候，表示每次提交事务都会执行 fsync
- sync_binlog=N(N>1) 的时候，表示每次提交事务都 write，但累积 N 个事务后才 fsync


sync_binlog 设置为 N 的风险是：如果主机发生异常重启，会丢失最近 N 个事务的 binlog 日志


**binlog的格式**

1. **statement**，**记录了SQL语句原文**，最后会有 COMMIT 确保完整性
![在这里插入图片描述](https://img-blog.csdnimg.cn/dfc86c023a7543fdb5ac3c99cb736fab.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)

2. **row**，**记录了操作的表和行**，最后会有一个 XID event 确保完整性
![在这里插入图片描述](https://img-blog.csdnimg.cn/e391f1b43b1c4ffc9a7aee3f97ed6ef9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)

3. **mixed**，即 statement + row

statement 格式下，记录到 binlog 里的是语句原文，因此可能会出现这样一种情况：在主库执行这条 SQL 语句的时候，用的是索引 a，而在备库执行这条 SQL 语句的时候，却使用了索引 b。因此，MySQL 认为这样写是有风险的
 
当 binlog_format 使用 row 格式的时候，binlog 里面记录了真实删除行的主键 id，这样 binlog 传到备库去的时候，就肯定会删除真实的行，不会有主备删除不同行的问题

statement 格式的 binlog 可能会导致主备不一致，row 格式的缺点是很占空间，所以，MySQL 就取了个折中方案，也就是有了 mixed 格式的 binlog。mixed 格式的意思是，MySQL 自己会判断这条 SQL 语句是否可能引起主备不一致，如果有可能，就用 row 格式，否则就用 statement 格式

现在越来越多的场景要求把 MySQL 的 binlog 格式设置成 row。这么做的主要理由是**恢复数据**


 
## 4.两阶段提交

**两阶段提交是为了让两份日志之间的逻辑一致**


两阶段提交过程图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/ec841d92566c41688befdd4f2553e2e5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)



redolog 和 binlog 具有关联行，在恢复数据时，redolog 用于恢复主机故障时的未更新的物理数据，binlog 用于备份操作。每个阶段的 log 操作都是记录在磁盘的，在恢复数据时，redolog 状态为 commit 则说明 binlog 也成功，直接恢复数据；如果 redo log 是 prepare，则需要查询对应的 binlog 事务是否成功，决定是回滚还是执行，也就是为了保持故障恢复（redo log）和备份恢复（binlog）的结果一致性

**组提交**

虽然 innodb_flush_log_at_trx_commit 设置成 1，单步刷盘，但这个过程的执行是需要消耗时间的，在这个时间段内，其它事物也在执行，所以可以把它们组成一个组，一起刷盘，一次组提交里面，在并发更新场景下，第一个事务写完 redo log buffer 以后，接下来这个 fsync 越晚调用，组员可能越多，节约 IOPS 的效果就越好

![在这里插入图片描述](https://img-blog.csdnimg.cn/1ff4afea8803466dbfd1bc9d324c054e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)
**提升 binlog 组提交的效果参数**

- binlog_group_commit_sync_delay 参数，表示延迟多少微秒后才调用 fsync
- binlog_group_commit_sync_no_delay_count 参数，表示累积多少次以后才调用 fsync



# 事务隔离

事务的特性：ACID（Atomicity、Consistency、Isolation、Durability，即原子性、一致性、隔离性、持久性）

事务是保证一组数据库操作的原子性，要么全部成功，要么全部失败

## 1.隔离级别

| 事务隔离级别 | 含义 |
|--|--|
| 读未提交（read uncommitted） | 一个事务还没提交时，它做的变更就能被别的事务看到 |
| 读提交（read committed） | 一个事务提交之后，它做的变更才会被其他事务看到 |
| 可重复读（repeatable read） | 一个事务执行过程中看到的数据，总是跟这个事务在启动时看到的数据是一致的。当然在可重复读隔离级别下，未提交变更对其他事务也是不可见的 |
| 串行化（serializable） | 是对于同一行记录，“写”会加“写锁”，“读”会加“读锁”。当出现读写锁冲突的时候，后访问的事务必须等前一个事务执行完成，才能继续执行 |


不同隔离级别对于并发事务出现的问题的解决情况


|  | 脏读 |不可重复读 |幻读  |
|--|--|--|--|
|读未提交 | N |N  | N |
|读提交  | Y | N | N |
| 可重复读 | Y | Y | N |
|串行化	  | Y |Y  |Y  |

	


## 2.多版本并发控制（MVCC）

MySQL中两种视图概念

|  |  view | 一致性读视图 |
|--|--|--|
| 概念  | 查询语句虚拟表，查询方法与表一样 | InnoDB 实现 MVCC 时的一致性读视图（consisitent read view），用于支持 RC（Read Committed，读提交）和 RR（Repeatable Read，可重复读）隔离级别的实现 |

两种事务启动命令的对比

|  | begin/start transaction | transaction with consistent snapshot |
|--|--|--|
| 一致性视图的创建时机 | 一致性视图是在执行第一个快照读语句时创建 | 一致性视图是在执行 start transaction with consistent snapshot 时创建|



隔离级别的实现依靠于视图，不同时刻启动的事务都有不同的视图，一行记录在系统中可以存在多个版本，这就是**多版本并发控制（MVCC）**，系统会自行判断，当没有视图使用回滚段时候，回滚日志会被删除，而此处也是尽量不要使用长事务的原因，长事务意味着会保留古老的视图，十分占用内存空间

![在这里插入图片描述](https://img-blog.csdnimg.cn/e8b58c9207084fc283417bb43a67ebff.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)






**多版本并发控制（MVCC）的实现**




![在这里插入图片描述](https://img-blog.csdnimg.cn/9bf173ac40484504aadee7d812be158b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)



 1. 每个事务都有一个事务ID,叫做 **transaction id** (严格递增)
 2. 事务在启动时，找到已提交的最大事务ID记为 **up_limit_id**
 3. 事务在更新一条语句时，比如 id=1 改为了 id=2，会把 id=1 和该行之前的 row trx_id 写到undo log 里，并且在数据页上把id的值改为 2，并且把修改这条语句的 transaction id 记在该行行头
 4. 一个事务要查看一条数据时，必须先用该事务的 **up_limit_id** 与该行的 transaction id做比对，如果 up_limit_id >= transaction id，那么可以看，如果 up_limit_id < transaction id，则只能去 undo log 里去取。去 undo log 查找数据的时候，也需要做比对，必须 up_limit_id > transaction id，才返回数据


**当前读**

由于当前读都是先读后写，只能读当前的值，所以为当前读，会更新事务内的 up_limit_id 为该事务的 transaction id，如果有其他事务占用行锁，则进入锁等待

**快照读和当前读**

 当前读指的是 select for update 或者 select in share mode，指的是在更新之前必须先查寻当前的值，因此叫当前读。 快照读指的是在语句执行之前或者在事务开始的时候会创建一个视图，后面的读都是基于这个视图的，不会再去查询最新的值


**读提交的逻辑和可重复读的区别**

 - 在可重复读隔离级别下，只需要在事务开始的时候创建一致性视图，之后事务里的其他查询都共用这个一致性视图
 - 在读提交隔离级别下，每一个语句执行前都会重新算出一个新的视图


## 3.幻读（phantom read）
幻读指的是一个事务在前后两次查询同一个范围的时候，后一次查询看到了前一次查询没有看到的行，同时，幻读仅专指“新插入的行”

**在可重复读隔离级别下，普通的查询是快照读，是不会看到别的事务插入的数据的。因此，幻读在“当前读”下才会出现**

幻读会导致语义被破坏及数据不一致的问题

幻读产生的原因：即使给所有行加上了锁，也避免不了幻读，这是因为给行加锁的时候，这条记录还不存在，没法加锁

为了解决幻读问题，InnoDB 引入了新的锁，也就是**间隙锁 (Gap Lock)**，后文有讲到


## 4.脏读（dirty read）

脏读指事务读取到了另一个事务更新了但是未提交的数据，然后另一个事务由于某种错误发生回滚，那么该事务读取到的就是脏数据

## 5.不可重复读（non-repeatable read）

不可重复读指在数据库访问时，一个事务在前后两次相同的访问中却读到了不同的数据内容

幻读和不可重复读的本质是一样的，两者都表现为两次读取的结果不一致。但是**不可重复读指的是两次读取同一条记录的值不同，而幻读指的是两次读取的记录数量不同**

不可重复读重点在于update和delete，而幻读的重点在于insert

# 索引

索引的出现其实就是为了提高数据查询的效率，就像书的目录一样，实现于存储引擎层

## 1.InnoDB 的索引模型

InnoDB 使用 B+ 树索引模型，B+ 树能够很好地配合磁盘的读写特性，减少单次查询的磁盘访问次数

- 主键索引的叶子节点存的是整行数据。在 InnoDB 里，主键索引也被称为聚簇索引（clustered index）
- 非主键索引的叶子节点内容是主键的值。在 InnoDB 里，非主键索引也被称为二级索引（secondary index）

主键查询方式只需要搜索 ID 这颗 B+ 树，非主键索引需要先搜索非主键索引树，拿到 ID值，再回到主键索引树再搜索一次，这个过程就是**回表**

## 2.索引维护

如果插入对象所在的数据页已经满了，根据 B+ 树的算法，这时候需要申请一个新的数据页，然后挪动部分数据过去。这个过程称为**页分裂**，页分裂的逆过程称为**页合并**，在这两种情况下，性能会受到50%的影响

**使用自增主键作为索引**可以有效提升效率，两个原因：

 1. 保证插入记录的有序性，所有的操作都是追加操作，不会触发页分裂
 2. 从存储空间的角度，主键长度越小，普通索引的叶子节点就越小，普通索引占用的空间也就越小

**重建索引**也是维护索引的重要手段：索引可能因为删除，或者页分裂等原因，导致数据页有空洞，重建索引的过程会创建一个新的索引，把数据按顺序插入，这样页面的利用率最高，也就是索引更紧凑、更省空间



## 3.覆盖索引

当查询字段已经在普通索引树上时，可以直接返回查询结果，**不需要回表**，也就是说在这次查询里面已经覆盖了查询需求，所以称作覆盖索引

覆盖索引可以减少树的搜索次数，显著提升查询性能，所以使用覆盖索引是一个常用的性能优化手段

## 4.最左前缀原则

最左前缀原则可以避免建立不必要的索引

mysql做词法分析语法分析的时候是通过建立最左子树来建立语法树的，解析的过程也是从左到右所以遵循最左前缀的原则

也就是说，索引项会按照索引定义里面出现的字段顺序排序

而建立联合索引的第一原则是，如果通过调整顺序，可以少维护一个索引，那么这个顺序往往就是需要优先考虑采用的

## 5.索引下推

在查询语句中存在 where 子句且 where 子句条件字段存在索引，那么mysql会在索引遍历过程中，对索引中包含的字段先做判断，**直接过滤掉不满足条件的记录**，减少回表次数，这个优化是在 mysql5.6 后推出的

## 6.索引失效

三种索引失效的情况：

1. 对索引字段做函数操作，可能会破坏索引值的有序性，因此优化器就决定放弃走树搜索功能
2. 隐式转换字段类型
3. 字符集不同（隐式字符编码转换）

# 锁
数据库锁设计的初衷是处理并发问题。作为多用户共享的资源，当出现并发访问的时候，数据库需要合理地控制资源的访问规则。而锁就是用来实现这些访问规则的重要数据结构

根据加锁的范围，MySQL 里面的锁大致可以分成全局锁、表级锁和行锁三类

## 1.全局锁

全局锁命令：**Flush tables with read lock (FTWRL)**

使用场景：全库逻辑备份，使全库只读

说到备份，官方自带的逻辑备份工具是 mysqldump。当 mysqldump 使用参数 –single-transaction 的时候，导数据之前就会启动一个事务，来确保拿到一致性视图。而由于 MVCC 的支持，这个过程中数据是可以正常更新的

而 **single-transaction** 方法只适用于所有的表使用事务引擎的库，对于不支持事务的 MyISAM 引擎只能使用 FTWRL 方法，这也是 MyISAM 被 InnoDB 取代的重要原因之一

而为什么不使用 set global readonly=true 使全库只读的原因有：

 1. readonly 值会被用作判断备库
 2. 异常处理机制与FTWRL方法存在差异：如果执行 FTWRL 命令之后由于客户端发生异常断开，那么 MySQL 会自动释放这个全局锁，整个库回到可以正常更新的状态。而将整个库设置为 readonly 之后，如果客户端发生异常，则数据库就会一直保持 readonly 状态，这样会导致整个库长时间处于不可写状态，风险较高

## 2.表级锁
MySQL 里面表级别的锁有两种：一种是表锁，一种是元数据锁（meta data lock，MDL)

**表锁**

表锁的语法是 lock tables … read/write

lock tables 语法除了会限制别的线程的读写外，**也限定了本线程接下来的操作对象**，也就是说加了写锁后，本线程只能进行写操作，锁的粒度较大


**元数据锁（meta data lock，MDL)**

元数据锁主要用于隔离 DML（Data Manipulation Language，数据操纵语言，如select）和DDL（Data Definition Language，数据定义语言，如改表头新增一列）操作之间的干扰。每执行一条 DML、DDL 语句时都会申请 MDL 锁，DML 操作需要 MDL 读锁，DDL 操作需要 MDL 写锁（MDL 加锁过程是系统自动控制，无法直接干预，**读读共享，读写互斥，写写互斥**）

事务中的 MDL 锁，在语句执行开始时申请，但是语句结束后并不会马上释放，而会等到整个事务提交后再释放，这也是尽量不要使用长事务的原因之一

如果要给热点数据做**表结构变更**要带上超时时间，拿不到写锁就放弃


## 3.行锁

加锁语句：加上 lock in share mode 或 for update

行锁就是针对数据表中行记录的锁

MySQL 的行锁是在引擎层实现的，MyISAM 引擎就不支持行锁，并发锁粒度较大，这也是 MyISAM 被 InnoDB 取代的原因之一

**两阶段锁协议**

在 InnoDB 事务中，行锁是在需要的时候才加上的，但并不是不需要了就立刻释放，而是要等到事务结束时才释放。这个就是两阶段锁协议


**死锁和死锁检测**

当并发系统中不同线程出现**循环资源依赖**，涉及的线程都在等待别的线程释放资源时，就会导致这几个线程都进入无限等待的状态，称为死锁

出现死锁后的两种策略：

 1. 直接进入等待，直到超时，超时时间设置参数为： innodb_lock_wait_timeout（默认50s），所以 InnoDB 的行锁是**悲观锁**
 2. 发起死锁检测，发现死锁后，主动回滚死锁链条中的某一个事务，让其他事务得以继续执行。将参数 innodb_deadlock_detect 设置为 on，表示开启这个逻辑

开启死锁检测后，每一个新线程都要判断是否会因为自己的加入而导致死锁，这个时间复杂度是 O(n)，而n个线程则是 O(n²)，当并发度过高时会消耗大量的CPU资源

降低死锁检测性能消耗的方式有三种：

 1. 在确保自己的业务不会出现死锁检测的前提下，直接关闭死锁检测
 2. 使用控制并发量的中间件，将并发量控制在一个能接受的范围内
 3. 将热更新的行数据拆分成逻辑上的多行来减少锁冲突，但是业务复杂度可能会大大提高

> **tips**：为了避免系统死锁，进入锁等待的线程并不会占用并发线程数

**lock in share mode 与 for update** 

lock in share mode 走的是IS锁（意向共享锁），即在符合条件的 rows 上都加了共享锁，这样的话，其他 session 可以读取这些记录，也可以继续添加 IS 锁，但是无法修改这些记录直到这个加锁的 session 执行完成（否则直接锁等待超时）

for update 走的是IX锁（意向排它锁），即在符合条件的 rows 上都加了排它锁，其他session也就无法在这些记录上添加任何的 S 锁或 X 锁。如果不存在一致性非锁定读的话，那么其他 session 是无法读取和修改这些记录的，但是innodb有非锁定读（快照读并不需要加锁），for update 之后并不会阻塞其他 session 的快照读取操作，除了 select ...lock in share mode 和 select ... for update 这种显示加锁的查询操作

for update 的加锁方式无非是比 lock in share mode 的方式多阻塞了 lock in share mode 的查询方式，并不会阻塞快照读

如果要用 lock in share mode 来给行加读锁避免数据被更新的话，就必须得绕过覆盖索引的优化，在查询字段中加入索引中不存在的字段



## 4.间隙锁 (Gap Lock)
顾名思义，间隙锁，锁的就是两个值之间的空隙

间隙锁的出现是为了解决幻读问题

间隙锁在可重复读隔离级别下才会生效

**与行锁的对比**

对于行锁来说：读锁之间不冲突, 写锁与读锁冲突, 写锁与写锁冲突，所以与行锁冲突的是另外一个锁，而跟间隙锁存在冲突关系的，是“往这个间隙中插入一个记录”这个操作


间隙锁的引入也带来了一些新的问题，比如：降低并发度，可能导致死锁


**间隙锁加锁规则**

1. 对主键或唯一索引，如果当前读时，where条件全部精确命中（ = 或者 in），这种场景本身就不会出现幻读，所以只会加行记录锁

2. 没有索引的列，当前读操作时，会加全表Gap间隙锁

3. 非唯一索引列，如果 where 条件部分命中（>、<、like 等）或者全未命中，则会加附近Gap间隙锁


## 5.next-key lock

间隙锁和行锁合称 next-key lock

加锁规则：

1. 加锁的基本单位是 next-key lock。next-key lock 是前开后闭区间
2. 查找过程中访问到的对象才会加锁，当使用覆盖索引时，主键索引不会加锁
3. 索引上的等值查询，给唯一索引加锁的时候，next-key lock 退化为行锁
4. 索引上的等值查询，向右遍历时且最后一个值不满足等值条件的时候，next-key lock 退化为间隙锁，同时，在删除数据的时候尽量加 limit 可以减小锁的范围
5. 唯一索引上的范围查询会访问到不满足条件的第一个值为止


# 主备高可用
## 1.主备一致性

如上文所述，binlog 保证了主备的一致，

## 2.主备流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/078120b693054893a22f381860598ef3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)
1. 在备库 B 上通过 change master 命令，设置主库 A 的 IP、端口、用户名、密码，以及要从哪个位置开始请求 binlog，这个位置包含文件名和日志偏移量
2. 在备库 B 上执行 start slave 命令，这时候备库会启动两个线程，就是图中的 io_thread 和 sql_thread。其中 io_thread 负责与主库建立连接
3. 主库 A 校验完用户名、密码后，开始按照备库 B 传过来的位置，从本地读取 binlog，发给 B
4. 备库 B 拿到 binlog 后，写到本地文件，称为中转日志（relay log）
5. sql_thread 读取中转日志，解析出日志里的命令，并执行

**循环复制问题**


当两库互为主备时，两库可能会互传binlog造成循环复制，解决方法：

1. 规定两个库的 server id 必须不同，如果相同，则它们之间不能设定为主备关系
2. 一个备库接到 binlog 并在重放的过程中，生成与原 binlog 的 server id 相同的新的 binlog
3. 每个库在收到从自己的主库发过来的日志后，先判断 server id，如果跟自己的相同，表示这个日志是自己生成的，就直接丢弃这个日志


## 3.主备延迟

同一个事务在主库与备库开始执行的时间戳之差叫做同步延迟，也叫主备延迟，在备库上执行 show slave status 命令查看 **seconds_behind_master** 的值即是主备延迟，当主备两库系统时间不一致时主备延迟在计算时会自动减去这个值并不会影响其准确性

**主备延迟的来源**

1. **备库所在机器的性能要比主库所在的机器性能差**，解决方案是采用对称部署或配置“双1”
2. **备库压力大**，解决方案是一主多从部署或通过 binlog 输出到外部系统，比如 Hadoop 这类系统，让外部系统提供统计类查询的能力
3. **大事务**，主库必须等事务结束才能写 binlog ，这个时间会扩大主备延迟 


**可靠性优先策略**

在进行主备切换时，会先检查备库 seconds_behind_master 的值是否小于 5s ，小于则把主库的 readonly 设置为 true 表示主库只读，后再次检查备库 seconds_behind_master 的值是否为 0s ，为 0s 则将备库的 readonly 设置为 false 表示备库可写，进而进行主备切换

在这个过程中系统存在主备库均只可读的阶段，也就是存在不可用时间

**可用性优先策略**
 
不等主备数据同步，直接把连接切到备库，并且让备库可以读写，那么系统几乎就没有不可用时间，但是可能存在数据不一致的代价

**备库并行复制能力**

如果备库执行日志的能力低于主库生成日志的能力，那么主备延迟会剧增，备库追不上主库节奏，会造成主备不一致问题

而并行复制能力，也就是多线程复制，可以很好的解决这个问题

多线程模型

![在这里插入图片描述](https://img-blog.csdnimg.cn/39a7dfc65d304a49a627878357b19fba.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)
coordinator 就是原来的 sql_thread, 不过现在其不再直接更新数据了，只负责读取中转日志和分发事务。真正更新日志的，变成了 worker 线程，而 work 线程的个数，就是由参数 slave_parallel_workers 决定

## 4.并行复制策略

而跨线程需要保证原子性，同一行的两个事务，在主库和备库执行的先后顺序不一样可能会导致主备不一致

所以，coordinator 在分发的时候，需要满足以下这两个基本要求：
1. 不能造成更新覆盖。这就要求更新同一行的两个事务，必须被分发到同一个 worker 中
2. 同一个事务不能被拆开，必须放到同一个 worker 中

每个事务在分发的时候，跟所有 worker 的冲突关系包括以下三种情况：

1. 如果跟所有 worker 都不冲突，coordinator 线程就会把这个事务分配给最空闲的 woker
2. 如果跟多于一个 worker 冲突，coordinator 线程就进入等待状态，直到和这个事务存在冲突关系的 worker 只剩下 1 个
3. 如果只跟一个 worker 冲突，coordinator 线程就会把这个事务分配给这个存在冲突关系的 worker

**按表分发策略**：如果两个事务更新不同的表，它们就可以并行。因为数据是存储在表里的，所以按表分发，可以保证两个 worker 不会更新同一行，当事务与多于一个 worker 冲突时，则进入队列等待

**按行分发策略**：如果两个事务没有更新相同的行，它们在备库上可以并行执行。显然，这个模式要求 binlog 格式必须是 row，因为 statement 记录的是语句，无法看出来该事务更新了哪几行

由于按行分发粒度更小，相比较按表并行分发策略，按行并行策略在决定线程分发的时候，需要消耗更多的计算资源，同时两策略都有一些约束条件：
1. 要能够从 binlog 里面解析出表名、主键值和唯一索引的值。也就是说，主库的 binlog 格式必须是 row
2. 表必须有主键
3. 不能有外键。表上如果有外键，级联更新的行不会记录在 binlog 中，这样冲突检测就不准确

**按行分发策略优化**：设置一个阈值，单个事务如果超过设置的行数阈值则退化为单线程执行，具体过程：coordinator 暂时先 hold 住这个事务，等所有 worker 执行完毕，coordinator 自己执行这个事务，执行完后再恢复并行

**MySQL 5.6 版本的并行复制策略**

MySQL 5.6 版本的并行复制策略是按库分发，粒度很大，相比于前面两个策略，按库分发在判断冲突时无需消耗大量 CPU 资源及不要求 binlog 的格式


**MariaDB 的并行复制策略**

MariaDB 的并行复制策略利用了 redo log 组提交 (group commit) 优化，即能够在同一组里提交的事务，一定不会修改同一行与能够在同一组里提交的事务，一定不会修改同一行，具体实现时 MariaDB 会将 commit_id 相同的事务分发到同一个 worker 上

之前业界的思路都是在“**分析 binlog，并拆分到 worker**”上。而 MariaDB 的这个策略，目标是“**模拟主库的并行模式**”，十分具有创新性

但这个策略容易被大事务拖后腿，当遇到大事务时，仅有一个 worker 在工作，并行也就退化成了串行

**MySQL 5.7.22 的并行复制策略**

由参数 binlog-transaction-dependency-tracking 控制，这个参数的可选值有以下三种

1. **COMMIT_ORDER**，表示在两阶段提交时，同时进入 prepare 和 commit 的事务可以并行的策略
2. **WRITESET**，表示的是对于事务涉及更新的每一行，计算出这一行的 hash 值，组成集合 writeset。如果两个事务没有操作相同的行，也就是说它们的 writeset 没有交集，就可以并行
3. **WRITESET_SESSION**，是在 WRITESET 的基础上多了一个约束，即在主库上同一个线程先后执行的两个事务，在备库执行的时候，要保证相同的先后顺序


**优势**：

1. writeset 由主库生成，直接写入到 binlog ，备库执行时不需要解析 binlog 内容（event 里的行数据），节省了很多计算量
2. 不需要把整个事务的 binlog 都扫一遍才能决定分发到哪个 worker，更省内存
3. 由于备库的分发策略不依赖于 binlog 内容，所以 binlog 是 statement 格式也是可以的

## 5.一主多从的主备切换过程

一主多从的主备切换过程图

![在这里插入图片描述](https://img-blog.csdnimg.cn/6bec28359cc24882b87bd2af0729380e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)

> **tips**：备库和从库的概念是不同的，虽然二者都是只读的，但是从库对外提供服务，而备库只是为主库提供备份


 **基于位点的主备切换**

当通过 change master 命令将节点 B 设置成节点 A’ 的从库时，不可避免需要设置位点参数，但是位点存在不精确的问题

**基于 GTID 的主备切换**

GTID 的全称是 Global Transaction Identifier，也就是全局事务 ID，是一个事务在提交的时候生成的，是这个事务的唯一标识，由两部分组成，格式是 **GTID=server_uuid:gno**

- server_uuid 是一个实例第一次启动时自动生成的，是一个全局唯一的值
- gno 是一个整数，初始值是 1，每次提交事务的时候分配给这个事务，并加 1

**transaction_id 与 gno 的区别**：transaction_id 就是指事务 id，事务 id 是在事务执行过程中分配的，如果这个事务回滚了，事务 id 也会递增，而 gno 是在事务提交的时候才会分配，两个都是递增，不同点是事务id自增但不一定连续，因为会被回滚，而gno在提交时分配，所以是连续递增的

每个 MySQL 实例都维护了一个 GTID 集合，用来对应“这个实例执行过的所有事务”

**切换逻辑**
1. 实例 B 指定主库 A’，基于主备协议建立连接
2. 实例 B 把 set_b 发给主库 A’。实例 A’算出 set_a 与 set_b 的差集，也就是所有存在于 set_a，但是不存在于 set_b 的 GTID 的集合，判断 A’本地是否包含了这个差集需要的所有 binlog 事务
 a. 如果不包含，表示 A’已经把实例 B 需要的 binlog 给删掉了，直接返回错误
 b. 如果确认全部包含，A’从自己的 binlog 文件里面，找出第一个不在 set_b 的事务，发给 B

3. 之后就从这个事务开始，往后读文件，按顺序取 binlog 发给 B 去执行

## 6.如何判断主库异常

**select 1 判断**

select 1 成功返回，只能说明这个库的进程还在，并不能说明主库没问题，比如当并发线程数达到了最大值，系统死锁后，select 1 依旧能成功返回

**查表判断**

为了能够检测 InnoDB 并发线程数过多导致的系统不可用情况，需要设计一个访问 InnoDB 的场景。一般的做法是，在系统库（mysql 库）里创建一个表，比如命名为 health_check，里面只放一行数据，然后定期执行

但是更新事务要写 binlog，而一旦 binlog 所在磁盘的空间占用率达到 100%，那么所有的更新语句和事务提交的 commit 语句就都会被堵住。但是，系统这时候还是可以正常读数据


**更新判断**

要放个有意义的字段，常见做法是放一个 timestamp 字段，用来表示最后一次执行检测的时间

但是，备库的检测也是要写 binlog，如果主库 A 和备库 B 都用相同的更新命令，就可能出现行冲突，也就是可能会导致主备同步停止

为了让主备之间的更新不产生冲突，可以在 mysql.health_check 表上存入多行数据，并用 A、B 的 server_id 做主键

但是，当 IO 利用率 100% 时，update 语句仍能正常运行，原因在于外部检测的随机性，对主库可用性检测不可控

**内部统计**

MySQL 的 performance_schema 表信息，可以详细检查其内部的流程是否有异常
# 实践调优
## 1.change buffer

当需要更新一个数据页，如果数据页在内存中就直接更新，如果不在内存中，在不影响数据一致性的前提下，InnoDB 会将这些更新操作缓存在 change buffer 中。下次查询需要访问这个数据页的时候，将数据页读入内存，然后执行 change buffer 中的与这个页有关的操作


**相关概念**：

1. change buffer 是可以持久化的数据。在内存中有拷贝，会被写入到磁盘上，同时 change buffer 的操作也**会记录到 redo log** 里，因此崩溃恢复的时候，change buffer 能找回来


2. 将 change buffer 中的操作应用到原数据页上，得到最新结果的过程，称为**merge**

3. 访问这个数据页会触发 merge，系统有后台线程定期 merge，在数据库正常关闭的过程中，也会执行 merge

4. change buffer 用的是 buffer pool 里的内存，change buffer 的大小，可以通过参数 innodb_change_buffer_max_size 来动态设置。这个参数设置为50的时候，表示 change buffer 的大小最多只能占用 buffer pool 的 50%


5. 将数据从磁盘读入内存涉及随机 IO 的访问，是数据库里面成本最高的操作之一，change buffer 因为**减少了随机磁盘访问**，所以对更新性能的提升很明显

**唯一索引的更新不能使用change buffer**

对于唯一索引来说，所有的更新操作都要先判断这个操作是否违反唯一性约束，用不上 change buffer 的优化机制


**change buffer使用场景**

在一个数据页做murge之前，change buffer 记录的变更越多，收益就越大

对于写多读少的业务来说，页面在写完以后马上被访问到的概率比较小，此时 change buffer 的使用效果最好。这种业务模型常见的就是账单类、日志类的系统

反过来，假设一个业务的更新模式是写入之后马上会做查询，那么即使满足了条件，将更新先记录在 change buffe，但之后由于马上要访问这个数据页，会立即触发 merge 过程

这样随机访问 IO 的次数不会减少，反而增加了 change buffer 的维护代价。所以，对于这种业务模式来说，change buffer 反而起到了副作用

**索引的选择和实践**

尽可能使用普通索引

log 主要节省的是随机写磁盘的 IO 消耗(转成顺序写)，而 change buffer 主要节省的则是随机读磁盘的IO消耗

## 2.索引选择异常和处理

优化器会根据**扫描行数**，**是否使用临时表**，**是否排序**进行综合判断选择一个最优的索引，以最小代价方案执行，而MySQL有时会因为扫描行数不够精确选错索引，所以需要优化

扫描行数的判断依据于**基数（cardinality）**，基数表示的是区分度，也就是索引中不同值的个数，基数越大，区分度越好

基数的统计方式是**采样统计**，选取N个数据页，统计不同值的平均值再乘以索引页面数作为基数，而采样统计不可避免存在误差，就会导致基数精确度不够，扫描行数判断失误，索引选择异常

选错索引可能有两种情况 ：
1. 也就是上述，由于索引统计信息不准确，导致判断扫描行数不准确，此种情况可用  analyze table 来解决 
2. 由于临时表，排序字段，导致优化器误判，此种情况可用 force index 来强行指定索引，也可以通过修改语句引导优化器，还可以通过增加或者删除索引来绕过这个问题

## 3.字符串索引策略
1. 直接创建完整索引，比较占用空间
2. 创建前缀索引，节省空间，但会增加查询扫描次数，并且不能使用覆盖索引
3. 倒序存储，再创建前缀索引，用于绕过字符串本身前缀的区分度不够的问题
4. 创建 hash 字段索引，查询性能稳定，有额外的存储和计算消耗，跟第三种方式一样，都不支持范围扫描

## 4.刷脏页的控制策略

当内存数据页跟磁盘数据页内容不一致的时候，我们称这个内存页为**脏页**。内存数据写入到磁盘后，内存和磁盘上的数据页的内容就一致了，称为**干净页**

触发刷脏页的四种情况：
1.  InnoDB 的 redo log 写满，更新全部堵住，写性能跌为 0
2. 系统内存不足，当需要新的内存页，而内存不够用的时候，就要淘汰一些数据页，空出内存给别的数据页使用，如果淘汰的是“脏页”，就要先刷脏页
3. 系统空闲的时候，主动刷脏页以保证效率
4. MySQL 正常关闭的情况。这时候，MySQL 会把内存的脏页都 flush 到磁盘上，这样下次 MySQL 启动的时候，就可以直接从磁盘上读数据，启动速度会很快

**控制策略**

需要正确设置 innodb_io_capacity 参数，告知InnoDB其所在主机的 IO 能力，建议设置成磁盘的 IOPS，此时 InnoDB 已经知晓该主机全力刷脏页的能力，会按照全力刷脏页的**百分比**来刷新脏页

百分比的设置参考两个因素：**脏页比例**和 **redo log 写盘速度**

![ ](https://img-blog.csdnimg.cn/387527e9966e4ad9bb2e03235d7d0a8e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)


根据上述算得的 F1(M) 和 F2(N) 两个值，取其中较大的值记为 R，之后引擎就可以按照 innodb_io_capacity 定义的能力乘以 R% 来控制刷脏页的速度


## 5.收缩表空间

delete 命令只是把记录的位置，或者数据页标记为了“可复用”，但磁盘文件的大小是不会变的。也可以认为是一种逻辑删除，所以物理空间没有实际释放，只是标记为可复用，表文件的大小不变。这些可以复用但未被使用的空间，就是空洞

清理空洞，正确收缩表空间的方式是**重建表**，MySQL 会创建一个临时表并自动完成转存数据、交换表名、删除旧表的操作

MySQL5.6以后引入了  **Online DDL**，对重建表的过程进行了优化，将复制过程中的增删操作写入日志文件（row log）最后再合并进入临时表，实现在重建表的过程中对数据进行增删操作，本质上是 Copy-On-Write 的思想，同时，**alter 语句在启动的时候会获取 MDL 写锁，但是这个写锁在真正拷贝数据之前会退化成读锁**

**Online 和 inplace**
重建表的过程在存储引擎中实现，对于server端来说，无感知，这种方式叫做 inplace，即**原地操作**

DDL 过程如果是 Online 的，就一定是 inplace 的，inplace 的 DDL，有可能不是 Online 的

**optimize table、analyze table 和 alter table的区别**：

1. alter table t engine = InnoDB （即recreate）采取的是Online DDL
2. analyze table t 其实不是重建表，只是对表的索引信息做重新统计，没有修改数据，这个过程中加了 MDL 读锁
3. optimize table t 等于 recreate+analyze


## 6.count(*)优化

**count(*) 的实现方式**

MyISAM 会存储总行数，可以直接返回，效率很高，而 InnoDB 由于存在事务设计，基于MVCC（多版本并发控制），所以每一行都要判断其是否可见，只能一行一行统计计数，所以效率不高，不过这个过程存在一个简单优化，MySQL 会选择最小的索引树进行遍历，减少扫描量以提升性能

优化方案：

1.  **用缓存系统保存计数**，存入 redis 中，但存在**丢失更新**（redis异常重启）和**逻辑上不正确**（无法保证“ MySQ L插入一行数据”跟“ Redis 计数加 1 ”这两个操作的原子性）的问题，不推荐使用
2. **在数据库保存计数**，InnoDB 的 redo log 则能解决崩溃恢复问题，**利用事务的原子性，将计数的记录 + 1 和插入一条数据放入到同一个事务**可以解决逻辑不正确问题，推荐使用

count语法的性能对比，自上而下性能递增

|语法| 底层原理 |
|--|--|
|count(字段）  | 遍历整张表，需要取值，判断 字段 != null |
|count(id)  |遍历整张表，需要取ID，判断 id !=null，按行累加 |
| count(1)  |遍历整张表，不需要取值，返回的每一行放一个数字1，按行累加 |
|count(*) |按行累加； 因为count(*) 和 count(1) 不取字段值，减少往 server层的数据返回，所以比其他count(字段)要返回值的性能较好 |


## 7.order by机制

排序机制有两种，全字段排序和 rowid 排序，排序的选择依据于排序数据的**单行长度**，通过参数：max_length_for_sort_data 设置，单行长度小于这个值则选择全字段排序，大于这个值则选择rowid排序

排序开始时，会初始化 **sort_buffer**（通过参数 sort_buffer_size 设置其大小），如果 sort buffer 的大小足够，那么排序就在内存中完成，否则就需要使用磁盘临时文件进行排序，在 sort buffer 中排好序然后把结果存入临时文件，最后合并成一个大的临时文件，采用**归并排序算法**


> **补充**：如果结果集需要的有序列很少的话，则会使用优先队列算法，维护一个大根堆或小根堆，避免使用临时表以提升效率
> 

**全字段排序**

1. 通过索引将所需的字段**全部**读取到 sort_buffer 中

2. 按照排序字段进行排序

3. 将结果集返回给客户端




**rowid排序**

1. 只将需要排序的字段和主键读取到 sort_buffer 中，并按照排序字段进行排序

2. 按照排序后的顺序，取id进行**回表**取出想要获取的数据

3. 将结果集返回给客户端


**全字段排序 vs rowid 排序**

|  | 全字段排序 | rowid 排序 |
|--|--|--|
| 优点 |造成 sort_buffer 中存放不下很多数据，因为除了排序字段还存放其他字段，对 sort_buffer 的利用效率不高，当所需排序数据量很大时，会有很多的临时文件，排序性能也会很差  | 更好的利用内存的sort_buffer 进行排序操作，尽量减少对磁盘的访问 |
| 缺点 | 造成 sort_buffer 中存放不下很多数据，因为除了排序字段还存放其他字段，对 sort_buffer 的利用效率不高，当所需排序数据量很大时，会有很多的临时文件，排序性能也会很差 | 回表的操作是随机 IO，会造成大量的随机读，不一定就比全字段排序减少对磁盘的访问 |

**Ung index优化**

可以利用**索引覆盖**优化，取消回表，但相应的会付出维护联合索引的代价，二者需要权衡

**order by rand()**

这个语句需要 Using temporary 和 Using filesort，查询的执行代价比较大。所以，在设计的时候要尽量避开这种写法，随机数的计算应该放在业务中进行，让数据库只做读写数据，保持单一职责

## 8.查询优化

查询无返回的几种情况：

1. **等 MDL 锁**，线程状态为 Waiting for table metadata lock，kill掉造成阻塞的线程即可
2. **等 flush**，线程状态为 Waiting for table flush ，flush tables 会等待正在运行的所有语句执行结束，如何flush线程被阻塞，则其会阻塞所有请求，优化方案为解决掉阻塞 flush 的线程
3. **等行锁**，解决掉长期占有行锁但不提交的事务

查询缓慢的几种情况：
 1. **一致性读慢**，事务A在执行过程中，其它事务对记录有很多次的更新，导致 undo log过大，事务A要用大量 undo log 才能拿到启动时的快照，优化方案是尽量不要使用长事务
 2. 上文提到的**索引选择异常**，应急方案就是给这个语句加上 force index 制定索引
 3. **索引没有设计好**，利用 Online DDL 机制执行 alter table 语句紧急创建索引


## 9.短连接风暴

MySQL 建立连接的成本很高。除了正常的网络连接三次握手外，还需要做登录权限判断和获得这个连接的数据读写权限，连接数由参数 max_connections 控制，当连接超过了上限，数据库就会拒绝请求，对业务来说数据库不可用，而设置 max_connections 参数的目的是为了降低负载保护数据库，所以调高这个参数并不能很好的优化

优化方案：

1. 处理掉占着连接但是不工作的线程
2. 减少连接过程的消耗，使用 –skip-grant-tables 参数重启数据库跳过权限校验阶段，但风险极高

## 10.QPS 突增问题

往往是由业务层面导致（此类问题一般使用中间件实现负载均衡），数据库层面的解决方案：

1. 停掉业务，或者将客户端从数据库白名单中去掉，依赖于虚拟化白名单机制
2. 使用管理员账号删除该用户，依赖于业务账号分离机制
3. 查询重写，把压力最大的 SQL 语句直接重写成"select 1"返回，但会导致业务逻辑失败，优先级最低

## 11.IO性能瓶颈
优化方案：

1. 设置 binlog_group_commit_sync_delay 和 binlog_group_commit_sync_no_delay_count 参数，减少 binlog 的写盘次数。这个方法是基于“额外的故意等待”来实现的，因此可能会增加语句的响应时间，但没有丢失数据的风险
2. 将 sync_binlog 设置为大于 1 的值（比较常见是 100~1000）。这样做的风险是，主机掉电时会丢 binlog 日志
3. 将 innodb_flush_log_at_trx_commit 设置为 2。这样做的风险是，主机掉电的时候会丢数据

## 12.读写分离优化
“在从库上会读到系统的一个过期状态”的现象，可以称之为“过期读”

解决过期读的方案如下

**强制走主库方案**

将查询请求做分类，对于必须要拿到最新结果的请求，强制将其发到主库上，对于可以读到旧数据的请求，才将其发到从库上

**sleep 方案**

主库更新后，读从库之前先 sleep 一下。具体的方案就是，类似于执行一条 select sleep(1) 命令

**判断主备无延迟方案**

要确保备库无延迟，通常有三种做法:

1. 每次从库执行查询请求前，先判断 seconds_behind_master 是否已经等于 0。如果还不等于 0 ，那就必须等到这个参数变为 0 才能执行查询请求
2. 对比位点确保主备无延迟
3. 对比 GTID 集合确保主备无延迟

**配合 semi-sync 方案**

引入**半同步复制**，也就是 semi-sync replication


semi-sync 做了这样的设计：
1. 事务提交的时候，主库把 binlog 发给从库
2. 从库收到 binlog 以后，发回给主库一个 ack，表示收到了
3. 主库收到这个 ack 以后，才能给客户端返回“事务完成”的确认

也就是说，如果启用了 semi-sync，就表示所有给客户端发送过确认的事务，都确保了备库已经收到了这个日志

**等主库位点方案**

在从库上执行命令

```sql
select master_pos_wait(file, pos[, timeout]);
```

相当于主库上事务更新后，不知道从库执行情况，先在主库上找到位置，然后在从库上找，返回 0 和返回大于 0 都表示这个从库执行过这个事务了，可以在这个从库上select，没执行过等，超过N秒没有返回说明过期

**等 GTID 方案**

在从库上执行命令

```sql
 select wait_for_executed_gtid_set(gtid_set, 1);
```

相当于从库执行完事务后，将事务id发给主库，如果返回值是 0，则在这个从库执行查询语句，否则，到主库执行查询语句，超过N秒没有返回说明过期

## 13.误删修复

**使用 delete 语句误删数据行**

可以用 Flashback 工具通过闪回把数据恢复回来，Flashback 恢复数据的原理，是修改 binlog 的内容，拿回原库重放。而能够使用这个方案的前提是，需要确保 **binlog_format=row 和 binlog_row_image=FULL**

**事前预防方案**：
1. 把 sql_safe_updates 参数设置为 on。如果忘记在 delete 或者 update 语句中写 where 条件，或者 where 条件里面没有包含索引字段的话，这条语句的执行就会报错
2. 代码上线前，必须经过 SQL 审计

设置完 sql_safe_updates 后删除全表可以在语句后继加 where id>=0 ，但是delete 全表是很慢的，需要生成回滚日志、写 redo、写 binlog。所以，从性能角度考虑，应该优先考虑使用 truncate table 或者 drop table 命令

**使用 drop table 或者 truncate table 语句误删数据表或使用 drop database 语句误删数据库**

在误删库/表情况下恢复数据，要求线上有定期的全量备份和实时备份binlog

恢复流程：

1. 取最近一次的全量备份恢复出一个临时库
2. 取binlog日志中固定时间点之后的日志
3.  把这些日志除了误删数据的语句外，全部应用到临时库

加速恢复的方案：

1. 应用 binlog 时，指定误删库
2. 新增临时实例，设置为备库，利用并行复制加快速度
3. 当数据量特别大时，可以采用延时备份

**预防方案**：

1. **账号分离**，避免写错命令
2. **制定操作规范**，避免写错要删除的表名
![在这里插入图片描述](https://img-blog.csdnimg.cn/b57696784d2b4402b6c5e2d4ad7f1ea4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASGVucmlrLVlhbw==,size_20,color_FFFFFF,t_70,g_se,x_16)





**使用 rm 命令误删整个 MySQL 实例**

对于一个有高可用机制的 MySQL 集群来说，最不怕的就是 rm 删除数据了。只要不是恶意地把整个集群删除，而只是删掉了其中某一个节点的数据的话，HA 系统就会开始工作，选出一个新的主库，从而保证整个集群的正常工作

# explain分析执行计划
在sql语句前面加explain可以分析sql语句的执行信息



| 字段          | 含义                                                         |
| ------------- | ------------------------------------------------------------ |
| id            | select查询的序列号，是一组数字，表示的是查询中执行select子句或者是操作表的顺序。 |
| select_type   | 表示 SELECT 的类型，常见的取值有 SIMPLE（简单表，即不使用表连接或者子查询）、PRIMARY（主查询，即外层的查询）、UNION（UNION 中的第二个或者后面的查询语句）、SUBQUERY（子查询中的第一个 SELECT）等 |
| table         | 输出结果集的表                                               |
| type          | 表示表的连接类型，性能由好到差的连接类型为( system  --->  const  ----->  eq_ref  ------>  ref  ------->  ref_or_null---->  index_merge  --->  index_subquery  ----->  range  ----->  index  ------> all ) |
| possible_keys | 表示查询时，可能使用的索引                                   |
| key           | 表示实际使用的索引                                           |
| key_len       | 索引字段的长度                                               |
| rows          | 扫描行的数量                                                 |
| extra         | 执行情况的说明和描述                                         |


**id**

id存在三种情况

 -  id 相同表示加载表的顺序是从上到下
 -  id 不同id值越大，优先级越高，越先被执行
 -  id 有相同，也有不同，同时存在。id相同的可以认为是一组，从上往下顺序执行；在所有的组中，id的值越大，优先级越高，越先执行

**select_type**

| select_type  | 含义                                                         |
| ------------ | ------------------------------------------------------------ |
| SIMPLE       | 简单的select查询，查询中不包含子查询或者UNION                |
| PRIMARY      | 查询中若包含任何复杂的子查询，最外层查询标记为该标识         |
| SUBQUERY     | 在SELECT 或 WHERE 列表中包含了子查询                         |
| DERIVED      | 在FROM 列表中包含的子查询，被标记为 DERIVED（衍生） MYSQL会递归执行这些子查询，把结果放在临时表中 |
| UNION        | 若第二个SELECT出现在UNION之后，则标记为UNION ； 若UNION包含在FROM子句的子查询中，外层SELECT将被标记为 ： DERIVED |
| UNION RESULT | 从UNION表获取结果的SELECT                                    |

**type**

type 显示的是访问类型，是较为重要的一个指标，可取值为： 


| type   | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| NULL   | MySQL不访问任何表，索引，直接返回结果                        |
| system | 表只有一行记录(等于系统表)，这是const类型的特例，一般不会出现 |
| const  | 表示通过索引一次就找到了，const 用于比较primary key 或者 unique 索引。因为只匹配一行数据，所以很快。如将主键置于where列表中，MySQL 就能将该查询转换为一个常亮。const于将 "主键" 或 "唯一" 索引的所有部分与常量值进行比较 |
| eq_ref | 类似ref，区别在于使用的是唯一索引，使用主键的关联查询，关联查询出的记录只有一条。常见于主键或唯一索引扫描 |
| ref    | 非唯一性索引扫描，返回匹配某个单独值的所有行。本质上也是一种索引访问，返回所有匹配某个单独值的所有行（多个） |
| range  | 只检索给定返回的行，使用一个索引来选择行。 where 之后出现 between ， < , > , in 等操作。 |
| index  | index 与 ALL的区别为  index 类型只是遍历了索引树， 通常比ALL 快， ALL 是遍历数据文件。 |
| all    | 将遍历全表以找到匹配的行                                     |

结果值从最好到最坏以此是：

```shell
NULL > system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL

system > const > eq_ref > ref > range > index > ALL
```

**extra**

其他的额外的执行计划信息，在该列展示 

| extra            | 含义                                                         |
| ---------------- | ------------------------------------------------------------ |
| using  filesort  | 说明mysql会对数据使用一个外部的索引排序，而不是按照表内的索引顺序进行读取， 称为 “文件排序”, 效率低。 |
| using  temporary | 使用了临时表保存中间结果，MySQL在对查询结果排序时使用临时表。常见于 order by 和 group by； 效率低 |
| using  index     | 表示相应的select操作使用了覆盖索引， 避免访问表的数据行， 效率不错。 |

