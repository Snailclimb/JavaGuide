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

这种优化方式限制比较大，且一般项目的 ID 也没办法保证完全连续。

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

不过，子查询的结果会产生一张新表，会影响性能，应该尽量避免大量使用子查询。并且，这种方法只适用于 ID 是正序的。在复杂分页场景，往往需要通过过滤条件，筛选到符合条件的 ID，此时的 ID 是离散且不连续的。

当然，我们也可以利用子查询先去获取目标分页的 ID 集合，然后再根据 ID 集合获取内容，但这种写法非常繁琐，不如使用 INNER JOIN 延迟关联。

### 延迟关联

延迟关联的优化思路，跟子查询的优化思路其实是一样的：都是把条件转移到主键索引树，减少回表的次数。不同点是，延迟关联使用了 INNER JOIN（内连接） 包含子查询。

```sql
SELECT t1.* FROM t_order t1
INNER JOIN (SELECT id FROM t_order limit 1000000, 10) t2
ON t1.id = t2.id;
```

除了使用 INNER JOIN 之外，还可以使用逗号连接子查询。

```sql
SELECT t1.* FROM t_order t1,
(SELECT id FROM t_order limit 1000000, 10) t2
WHERE t1.id = t2.id;
```

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

不过，当查询的结果集占表的总行数的很大一部分时，可能就不会走索引了，自动转换为全表扫描。当然了，也可以通过 `FORCE INDEX` 来强制查询优化器走索引，但这种提升效果一般不明显。

## 参考

- 聊聊如何解决 MySQL 深分页问题 - 捡田螺的小男孩：<https://juejin.cn/post/7012016858379321358>
- 数据库深分页介绍及优化方案 - 京东零售技术：<https://mp.weixin.qq.com/s/ZEwGKvRCyvAgGlmeseAS7g>
- MySQL 深分页优化 - 得物技术：<https://juejin.cn/post/6985478936683610149>
