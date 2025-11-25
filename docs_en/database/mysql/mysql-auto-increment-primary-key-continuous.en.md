---
title: MySQL自增主键一定是连续的吗
category: 数据库
tag:
  - MySQL
  - 大厂面试
head:
  - - meta
    - name: keywords
      content: 自增主键,不连续,事务回滚,并发插入,计数器,聚簇索引
  - - meta
    - name: description
      content: 解析自增主键不连续的根因与触发场景，结合事务回滚与并发插入，说明 InnoDB 计数器与聚簇索引的行为。
---

> 作者：飞天小牛肉
>
> 原文：<https://mp.weixin.qq.com/s/qci10h9rJx_COZbHV3aygQ>

众所周知，自增主键可以让聚集索引尽量地保持递增顺序插入，避免了随机查询，从而提高了查询效率。

但实际上，MySQL 的自增主键并不能保证一定是连续递增的。

下面举个例子来看下，如下所示创建一张表：

![](https://oss.javaguide.cn/p3-juejin/3e6b80ba50cb425386b80924e3da0d23~tplv-k3u1fbpfcp-zoom-1.png)

## 自增值保存在哪里？

使用 `insert into test_pk values(null, 1, 1)` 插入一行数据，再执行 `show create table` 命令来看一下表的结构定义：

![](https://oss.javaguide.cn/p3-juejin/c17e46230bd34150966f0d86b2ad5e91~tplv-k3u1fbpfcp-zoom-1.png)

上述表的结构定义存放在后缀名为 `.frm` 的本地文件中，在 MySQL 安装目录下的 data 文件夹下可以找到这个 `.frm` 文件：

![](https://oss.javaguide.cn/p3-juejin/3ec0514dd7be423d80b9e7f2d52f5902~tplv-k3u1fbpfcp-zoom-1.png)

从上述表结构可以看到，表定义里面出现了一个 `AUTO_INCREMENT=2`，表示下一次插入数据时，如果需要自动生成自增值，会生成 id = 2。

但需要注意的是，自增值并不会保存在这个表结构也就是 `.frm` 文件中，不同的引擎对于自增值的保存策略不同：

1）MyISAM 引擎的自增值保存在数据文件中

2）InnoDB 引擎的自增值，其实是保存在了内存里，并没有持久化。第一次打开表的时候，都会去找自增值的最大值 `max(id)`，然后将 `max(id)+1` 作为这个表当前的自增值。

举个例子：我们现在表里当前数据行里最大的 id 是 1，AUTO_INCREMENT=2，对吧。这时候，我们删除 id=1 的行，AUTO_INCREMENT 还是 2。

![](https://oss.javaguide.cn/p3-juejin/61b8dc9155624044a86d91c368b20059~tplv-k3u1fbpfcp-zoom-1.png)

但如果马上重启 MySQL 实例，重启后这个表的 AUTO_INCREMENT 就会变成 1。﻿ 也就是说，MySQL 重启可能会修改一个表的 AUTO_INCREMENT 的值。

![](https://oss.javaguide.cn/p3-juejin/27fdb15375664249a31f88b64e6e5e66~tplv-k3u1fbpfcp-zoom-1.png)

![](https://oss.javaguide.cn/p3-juejin/dee15f93e65d44d384345a03404f3481~tplv-k3u1fbpfcp-zoom-1.png)

以上，是在我本地 MySQL 5.x 版本的实验，实际上，**到了 MySQL 8.0 版本后，自增值的变更记录被放在了 redo log 中，提供了自增值持久化的能力** ，也就是实现了“如果发生重启，表的自增值可以根据 redo log 恢复为 MySQL 重启前的值”

也就是说对于上面这个例子来说，重启实例后这个表的 AUTO_INCREMENT 仍然是 2。

理解了 MySQL 自增值到底保存在哪里以后，我们再来看看自增值的修改机制，并以此引出第一种自增值不连续的场景。

## 自增值不连续的场景

### 自增值不连续场景 1

在 MySQL 里面，如果字段 id 被定义为 AUTO_INCREMENT，在插入一行数据的时候，自增值的行为如下：

- 如果插入数据时 id 字段指定为 0、null 或未指定值，那么就把这个表当前的 AUTO_INCREMENT 值填到自增字段；
- 如果插入数据时 id 字段指定了具体的值，就直接使用语句里指定的值。

根据要插入的值和当前自增值的大小关系，自增值的变更结果也会有所不同。假设某次要插入的值是 `insert_num`，当前的自增值是 `autoIncrement_num`：

- 如果 `insert_num < autoIncrement_num`，那么这个表的自增值不变
- 如果 `insert_num >= autoIncrement_num`，就需要把当前自增值修改为新的自增值

也就是说，如果插入的 id 是 100，当前的自增值是 90，`insert_num >= autoIncrement_num`，那么自增值就会被修改为新的自增值即 101

一定是这样吗？

非也~

了解过分布式 id 的小伙伴一定知道，为了避免两个库生成的主键发生冲突，我们可以让一个库的自增 id 都是奇数，另一个库的自增 id 都是偶数

这个奇数偶数其实是通过 `auto_increment_offset` 和 `auto_increment_increment` 这两个参数来决定的，这俩分别用来表示自增的初始值和步长，默认值都是 1。

所以，上面的例子中生成新的自增值的步骤实际是这样的：从 `auto_increment_offset` 开始，以 `auto_increment_increment` 为步长，持续叠加，直到找到第一个大于 100 的值，作为新的自增值。

所以，这种情况下，自增值可能会是 102，103 等等之类的，就会导致不连续的主键 id。

更遗憾的是，即使在自增初始值和步长这两个参数都设置为 1 的时候，自增主键 id 也不一定能保证主键是连续的

### 自增值不连续场景 2

举个例子，我们现在往表里插入一条 (null,1,1) 的记录，生成的主键是 1，AUTO_INCREMENT= 2，对吧

![](https://oss.javaguide.cn/p3-juejin/c22c4f2cea234c7ea496025eb826c3bc~tplv-k3u1fbpfcp-zoom-1.png)

这时我再执行一条插入 `(null,1,1)` 的命令，很显然会报错 `Duplicate entry`，因为我们设置了一个唯一索引字段 `a`：

![](https://oss.javaguide.cn/p3-juejin/c0325e31398d4fa6bb1cbe08ef797b7f~tplv-k3u1fbpfcp-zoom-1.png)

但是，你会惊奇的发现，虽然插入失败了，但自增值仍然从 2 增加到了 3！

这是为啥？

我们来分析下这个 insert 语句的执行流程：

1. 执行器调用 InnoDB 引擎接口准备插入一行记录 (null,1,1);
2. InnoDB 发现用户没有指定自增 id 的值，则获取表 `test_pk` 当前的自增值 2；
3. 将传入的记录改成 (2,1,1);
4. 将表的自增值改成 3；
5. 继续执行插入数据操作，由于已经存在 a=1 的记录，所以报 Duplicate key error，语句返回

可以看到，自增值修改的这个操作，是在真正执行插入数据的操作之前。

这个语句真正执行的时候，因为碰到唯一键 a 冲突，所以 id = 2 这一行并没有插入成功，但也没有将自增值再改回去。所以，在这之后，再插入新的数据行时，拿到的自增 id 就是 3。也就是说，出现了自增主键不连续的情况。

至此，我们已经罗列了两种自增主键不连续的情况：

1. 自增初始值和自增步长设置不为 1
2. 唯一键冲突

除此之外，事务回滚也会导致这种情况

### 自增值不连续场景 3

我们现在表里有一行 `(1,1,1)` 的记录，AUTO_INCREMENT = 3：

![](https://oss.javaguide.cn/p3-juejin/6220fcf7dac54299863e43b6fb97de3e~tplv-k3u1fbpfcp-zoom-1.png)

我们先插入一行数据 `(null, 2, 2)`，也就是 (3, 2, 2) 嘛，并且 AUTO_INCREMENT 变为 4：

![](https://oss.javaguide.cn/p3-juejin/3f02d46437d643c3b3d9f44a004ab269~tplv-k3u1fbpfcp-zoom-1.png)

再去执行这样一段 SQL：

![](https://oss.javaguide.cn/p3-juejin/faf5ce4a2920469cae697f845be717f5~tplv-k3u1fbpfcp-zoom-1.png)

Although we inserted a (null, 3, 3) record, it was rolled back using rollback, so there is no such record in the database:

![](https://oss.javaguide.cn/p3-juejin/6cb4c02722674dd399939d3d03a431c1~tplv-k3u1fbpfcp-zoom-1.png)

In the case of this transaction rollback, the auto-increment value does not also roll back! As shown in the figure below, the self-increment value still stubbornly increases from 4 to 5:

![](https://oss.javaguide.cn/p3-juejin/e6eea1c927424ac7bda34a511ca521ae~tplv-k3u1fbpfcp-zoom-1.png)

So when we insert a piece of data (null, 3, 3) at this time, the primary key id will be automatically assigned to `5`:

![](https://oss.javaguide.cn/p3-juejin/80da69dd13b543c4a32d6ed832a3c568~tplv-k3u1fbpfcp-zoom-1.png)

So, why doesn't MySQL change the table's auto-increment value back when a unique key conflict or rollback occurs? If we go back, won't the self-increasing IDs become discontinuous?

In fact, the main reason for doing this is to improve performance.

We directly use proof by contradiction to verify: Assume that MySQL will change the self-increment value back when the transaction is rolled back, what will happen?

Now there are two transactions A and B that are executed in parallel. When applying for auto-increment value, in order to prevent the two transactions from applying for the same auto-increment ID, they must lock and then apply sequentially, right?

1. Assume that transaction A applies for id = 1, and transaction B applies for id = 2. Then the auto-increment value of table t is 3 at this time, and execution continues thereafter.
2. Transaction B is submitted correctly, but transaction A has a unique key conflict, that is, the insertion of the row record with id = 1 fails. If transaction A is allowed to roll back the auto-incremented id, that is, change the current auto-increment value of the table back to 1, then there will be a situation like this: there is already a row with id = 2 in the table, and the current auto-increment id value is 1.
3. Next, other transactions that continue to be executed will apply for id=2. At this time, an insert statement error "primary key conflict" will appear.

![](https://oss.javaguide.cn/p3-juejin/5f26f02e60f643c9a7cab88a9f1bdce9~tplv-k3u1fbpfcp-zoom-1.png)

In order to resolve this primary key conflict, there are two methods:

1. Before each application for an id, first determine whether the id already exists in the table. If it exists, skip the id.
2. Expand the lock scope of the self-increasing ID. You must wait until a transaction is completed and submitted before the next transaction can apply for the self-increasing ID.

Obviously, the costs of the above two methods are relatively high and will cause performance problems. The reason is the "allowing auto-increment id fallback" we assumed.

Therefore, InnoDB abandoned this design and will not fall back to incrementing the ID if the statement fails to execute. It is precisely because of this that it is only guaranteed that the auto-incrementing id is increasing, but it is not guaranteed to be continuous.

In summary, three scenarios of discontinuous self-increasing value have been analyzed, and there is also a fourth scenario: batch insertion of data.

### Self-increasing value discontinuous scenario 4

For statements that insert data in batches, MySQL has a strategy to apply for auto-increment IDs in batches:

1. During statement execution, if you apply for an auto-increment ID for the first time, 1 will be allocated;
2. After 1 is used up, this statement will apply for an auto-increment ID for the second time, and 2 will be allocated;
3. After 2 are used up, the same statement remains. If you apply for an auto-increment ID for the third time, 4 will be allocated;
4. By analogy, if you use the same statement to apply for auto-increment IDs, the number of auto-increment IDs applied each time is twice that of the previous time.

Note that the batch insertion of data mentioned here does not include multiple value values ​​in the ordinary insert statement! ! ! , because this type of statement can accurately calculate how many IDs are needed when applying for auto-incrementing IDs, and then apply for them all at once. After the application is completed, the lock can be released.

For statements such as `insert ... select`, replace ... select and load data, MySQL does not know how many IDs need to be applied for, so it adopts this batch application strategy. After all, it is too slow to apply one by one.

For example, assume that our current table has the following data:

![](https://oss.javaguide.cn/p3-juejin/6453cfc107f94e3bb86c95072d443472~tplv-k3u1fbpfcp-zoom-1.png)

We create a table `test_pk2` with the same structure definition as the current table `test_pk`:

![](https://oss.javaguide.cn/p3-juejin/45248a6dc34f431bba14d434bee2c79e~tplv-k3u1fbpfcp-zoom-1.png)

Then use `insert...select` to batch insert data into the `teset_pk2` table:

![](https://oss.javaguide.cn/p3-juejin/c1b061e86bae484694d15ceb703b10ca~tplv-k3u1fbpfcp-zoom-1.png)

As you can see, the data was successfully imported.

Let’s take a look at the auto-increment value of `test_pk2`:

![](https://oss.javaguide.cn/p3-juejin/0ff9039366154c738331d64ebaf88d3b~tplv-k3u1fbpfcp-zoom-1.png)

As analyzed above, it is 8 instead of 6

Specifically, insert...select actually inserts 5 rows of data (1 1) (2 2) (3 3) (4 4) (5 5) into the table. However, these five lines of data are self-increasing IDs applied for three times. Combined with the batch application strategy, the number of self-increasing IDs applied for each time is twice that of the previous time, so:

- I applied for an id for the first time: id=1
- Two ids were assigned for the second time: id=2 and id=3
- For the third time, 4 ids were assigned: id=4, id = 5, id = 6, id=7

Since this statement actually uses only 5 ids, id=6 and id=7 are wasted. After that, execute `insert into test_pk2 values(null,6,6)`, and the actually inserted data is (8,6,6):

![](https://oss.javaguide.cn/p3-juejin/51612fbac3804cff8c5157df21d6e355~tplv-k3u1fbpfcp-zoom-1.png)

## Summary

This article summarizes four scenarios of discontinuous self-increasing value:

1. The auto-increment initial value and auto-increment step size are not set to 1.
2. Unique key conflict
3. Transaction rollback
4. Batch insertion (such as `insert...select` statement)

<!-- @include: @article-footer.snippet.md -->