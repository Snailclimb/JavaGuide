---
title: 深度分页介绍及优化建议
category: 高性能
head:
  - - meta
    - name: keywords
      content: 深度分页
  - - meta
    - name: description
      content: 查询偏移量过大的场景我们称为深度分页，这会导致查询性能较低。深度分页可以采用范围查询、子查询、INNER JOIN 延迟关联、覆盖索引等方法进行优化。
---

## 深度分页介绍

查询偏移量过大的场景我们称为深度分页，这会导致查询性能较低，例如：

```sql
# MySQL 在无法利用索引的情况下跳过1000000条记录后，再获取10条记录
SELECT * FROM t_order ORDER BY id LIMIT 1000000, 10
```
## 深度分页问题的原因
**全表扫描**：当OFFSET值较大时，MySQL可能会选择执行全表扫描而不是使用索引。
![image](https://github.com/user-attachments/assets/d2537428-74db-4eba-bd1b-20b0ef681b8e)
![image](https://github.com/user-attachments/assets/00467d02-b5bd-4241-8145-acded334b76a)

具体的临界点每个机器不一样，我的机器上是5980，为什么产生呢？
![image](https://github.com/user-attachments/assets/19bb5403-398b-4bff-934a-7db2e31995aa)
![image](https://github.com/user-attachments/assets/d01a5b84-a47e-4ddd-966d-520cc3d3b3bd)
MySQL数据库的查询优化器是采用了基于代价的，而查询代价的估算是基于CPU代价和IO代价。
如果MySQL在查询代价估算中，认为全表扫描方式比走索引扫描的方式效率更高的话，就会放弃索引，直接全表扫描。
这就是为什么在大分页的SQL查询中，明明给该字段加了索引，但是MySQL却走了全表扫描的原因。




## 深度分页优化建议

这里以 MySQL 数据库为例介绍一下如何优化深度分页。

### 范围查询

当可以保证 ID 的连续性时，根据 ID 范围进行分页是比较好的解决方案：

```sql
# 查询指定 ID 范围的数据
SELECT * FROM t_order WHERE id > 100000 AND id <= 100010 ORDER BY id
# 也可以通过记录上次查询结果的最后一条记录的ID进行下一页的查询：
SELECT * FROM t_order WHERE id > 100000 LIMIT 10
```

这种基于 ID 范围的深度分页优化方式存在很大限制：

1. **ID 连续性要求高**: 实际项目中，数据库自增 ID 往往因为各种原因（例如删除数据、事务回滚等）导致 ID 不连续，难以保证连续性。
2. **排序问题**: 如果查询需要按照其他字段（例如创建时间、更新时间等）排序，而不是按照 ID 排序，那么这种方法就不再适用。
3. **并发场景**: 在高并发场景下，单纯依赖记录上次查询的最后一条记录的 ID 进行分页，容易出现数据重复或遗漏的问题。

### 子查询

我们先查询出 limit 第一个参数对应的主键值，再根据这个主键值再去过滤并 limit，这样效率会更快一些。

阿里巴巴《Java 开发手册》中也有对应的描述：

> 利用延迟关联或者子查询优化超多分页场景。
>
> ![](https://oss.javaguide.cn/github/javaguide/mysql/alibaba-java-development-handbook-paging.png)

```sql
# 通过子查询来获取 id 的起始值，把 limit 1000000 的条件转移到子查询
SELECT * FROM t_order WHERE id >= (SELECT id FROM t_order limit 1000000, 1) LIMIT 10;
```

**工作原理**:

1. 子查询 `(SELECT id FROM t_order LIMIT 1000000, 1)` 会利用主键索引快速定位到第 1000001 条记录，并返回其 ID 值。
2. 主查询 `SELECT * FROM t_order WHERE id >= ... LIMIT 10` 将子查询返回的起始 ID 作为过滤条件，使用 `id >=` 获取从该 ID 开始的后续 10 条记录。

不过，子查询的结果会产生一张新表，会影响性能，应该尽量避免大量使用子查询。并且，这种方法只适用于 ID 是正序的。在复杂分页场景，往往需要通过过滤条件，筛选到符合条件的 ID，此时的 ID 是离散且不连续的。

当然，我们也可以利用子查询先去获取目标分页的 ID 集合，然后再根据 ID 集合获取内容，但这种写法非常繁琐，不如使用 INNER JOIN 延迟关联。

### 延迟关联

延迟关联与子查询的优化思路类似，都是通过将 `LIMIT` 操作转移到主键索引树上，减少回表次数。相比直接使用子查询，延迟关联通过 `INNER JOIN` 将子查询结果集成到主查询中，避免了子查询可能产生的临时表。在执行 `INNER JOIN` 时，MySQL 优化器能够利用索引进行高效的连接操作（如索引扫描或其他优化策略），因此在深度分页场景下，性能通常优于直接使用子查询。

```sql
-- 使用 INNER JOIN 进行延迟关联
SELECT t1.*
FROM t_order t1
INNER JOIN (SELECT id FROM t_order LIMIT 1000000, 10) t2 ON t1.id = t2.id;
```

**工作原理**:

1. 子查询 `(SELECT id FROM t_order LIMIT 1000000, 10)` 利用主键索引快速定位目标分页的 10 条记录的 ID。
2. 通过 `INNER JOIN` 将子查询结果与主表 `t_order` 关联，获取完整的记录数据。

除了使用 INNER JOIN 之外，还可以使用逗号连接子查询。

```sql
-- 使用逗号进行延迟关联
SELECT t1.* FROM t_order t1,
(SELECT id FROM t_order limit 1000000, 10) t2
WHERE t1.id = t2.id;
```

**注意**: 虽然逗号连接子查询也能实现类似的效果，但为了代码可读性和可维护性，建议使用更规范的 `INNER JOIN` 语法。

### 覆盖索引

索引中已经包含了所有需要获取的字段的查询方式称为覆盖索引。

**覆盖索引的好处：**

- **避免 InnoDB 表进行索引的二次查询，也就是回表操作:** InnoDB 是以聚集索引的顺序来存储的，对于 InnoDB 来说，二级索引在叶子节点中所保存的是行的主键信息，如果是用二级索引查询数据的话，在查找到相应的键值后，还要通过主键进行二次查询才能获取我们真实所需要的数据。而在覆盖索引中，二级索引的键值中可以获取所有的数据，避免了对主键的二次查询（回表），减少了 IO 操作，提升了查询效率。
- **可以把随机 IO 变成顺序 IO 加快查询效率:** 由于覆盖索引是按键值的顺序存储的，对于 IO 密集型的范围查找来说，对比随机从磁盘读取每一行的数据 IO 要少的多，因此利用覆盖索引在访问时也可以把磁盘的随机读取的 IO 转变成索引查找的顺序 IO。

```sql
# 如果只需要查询 id, code, type 这三列，可建立 code 和 type 的覆盖索引
SELECT id, code, type FROM t_order
ORDER BY code
LIMIT 1000000, 10;
```

**⚠️注意**:

- 当查询的结果集占表的总行数的很大一部分时，MySQL 查询优化器可能选择放弃使用索引，自动转换为全表扫描。
- 虽然可以使用 `FORCE INDEX` 强制查询优化器走索引，但这种方式可能会导致查询优化器无法选择更优的执行计划，效果并不总是理想。

## 总结

本文总结了几种常见的深度分页优化方案:

1. **范围查询**: 基于 ID 连续性进行分页，通过记录上一页最后一条记录的 ID 来获取下一页数据。适合 ID 连续且按 ID 查询的场景，但在 ID 不连续或需要按其他字段排序时存在局限。
2. **子查询**: 先通过子查询获取分页的起始主键值，再根据主键进行筛选分页。利用主键索引提高效率，但子查询会生成临时表，复杂场景下性能不佳。
3. **延迟关联 (INNER JOIN)**: 使用 `INNER JOIN` 将分页操作转移到主键索引上，减少回表次数。相比子查询，延迟关联的性能更优，适合大数据量的分页查询。
4. **覆盖索引**: 通过索引直接获取所需字段，避免回表操作，减少 IO 开销，适合查询特定字段的场景。但当结果集较大时，MySQL 可能会选择全表扫描。

## 参考

- 聊聊如何解决 MySQL 深分页问题 - 捡田螺的小男孩：<https://juejin.cn/post/7012016858379321358>
- 数据库深分页介绍及优化方案 - 京东零售技术：<https://mp.weixin.qq.com/s/ZEwGKvRCyvAgGlmeseAS7g>
- MySQL 深分页优化 - 得物技术：<https://juejin.cn/post/6985478936683610149>
