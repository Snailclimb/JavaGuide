---
title: MySQL执行计划分析
description: 详解MySQL EXPLAIN执行计划的各列含义，包括id、select_type、type、key、rows、Extra等关键字段解读，帮助你分析SQL性能瓶颈并进行针对性优化。
category: 数据库
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL执行计划,EXPLAIN,查询优化器,SQL性能分析,索引命中,type访问类型,Extra字段,慢查询优化
---

优化 SQL 的第一步应该是读懂 SQL 的执行计划。本篇文章，我们一起来学习下 MySQL `EXPLAIN` 执行计划相关知识。

> **版本说明**：本文内容基于 MySQL 5.7+ 和 8.0+ 版本。`filtered` 和 `partitions` 列在 MySQL 5.7+ 可用，`EXPLAIN ANALYZE` 和 Hash Join 特性需要 MySQL 8.0.18+ 和 8.0.20+。

## 什么是执行计划？

**执行计划** 是指一条 SQL 语句在经过 **MySQL 查询优化器** 的优化后，具体的执行方式。

执行计划通常用于 SQL 性能分析、优化等场景。通过 `EXPLAIN` 的结果，可以了解到如数据表的查询顺序、数据查询操作的操作类型、哪些索引可以被命中、哪些索引实际会命中、每个数据表有多少行记录被查询等信息。

## 如何获取执行计划？

MySQL 为我们提供了 `EXPLAIN` 命令，来获取执行计划的相关信息。

需要注意的是，标准 `EXPLAIN` 语句并不会真的去执行相关的语句，而是通过查询优化器对语句进行分析，找出最优的查询方案，并显示对应的信息。

MySQL 8.0.18 引入了 `EXPLAIN ANALYZE`，它会**真正执行**查询并输出每个步骤的实际耗时与行数，比标准 `EXPLAIN` 的估算数据更可靠，适合在测试环境深度排查慢查询：

```sql
EXPLAIN ANALYZE SELECT * FROM dept_emp WHERE emp_no = 10001;
```

此外，`EXPLAIN FORMAT=JSON` 可以输出优化器的成本模型数据（`query_cost`），比表格形式更能反映各步骤的实际代价，在多表 JOIN 或子查询调优时尤为有用：

```sql
EXPLAIN FORMAT=JSON SELECT * FROM dept_emp WHERE emp_no = 10001;
```

`EXPLAIN` 执行计划支持 `SELECT`、`DELETE`、`INSERT`、`REPLACE` 以及 `UPDATE` 语句。我们一般多用于分析 `SELECT` 查询语句，使用起来非常简单，语法如下：

```sql
EXPLAIN SELECT 查询语句；
```

我们简单来看下一条查询语句的执行计划：

```sql
mysql> explain SELECT * FROM dept_emp WHERE emp_no IN (SELECT emp_no FROM dept_emp GROUP BY emp_no HAVING COUNT(emp_no)>1);
+----+-------------+----------+------------+-------+-----------------+---------+---------+------+--------+----------+-------------+
| id | select_type | table    | partitions | type  | possible_keys   | key     | key_len | ref  | rows   | filtered | Extra       |
+----+-------------+----------+------------+-------+-----------------+---------+---------+------+--------+----------+-------------+
|  1 | PRIMARY     | dept_emp | NULL       | ALL   | NULL            | NULL    | NULL    | NULL | 331143 |   100.00 | Using where |
|  2 | SUBQUERY    | dept_emp | NULL       | index | PRIMARY,dept_no | PRIMARY | 16      | NULL | 331143 |   100.00 | Using index |
+----+-------------+----------+------------+-------+-----------------+---------+---------+------+--------+----------+-------------+
```

可以看到，执行计划结果中共有 12 列，各列代表的含义总结如下表：

| **列名**      | **含义**                                     |
| ------------- | -------------------------------------------- |
| id            | SELECT 查询的序列标识符                      |
| select_type   | SELECT 关键字对应的查询类型                  |
| table         | 用到的表名                                   |
| partitions    | 匹配的分区，对于未分区的表，值为 NULL        |
| type          | 表的访问方法                                 |
| possible_keys | 可能用到的索引                               |
| key           | 实际用到的索引                               |
| key_len       | 所选索引的长度                               |
| ref           | 当使用索引等值查询时，与索引作比较的列或常量 |
| rows          | 预计要读取的行数                             |
| filtered      | 按表条件过滤后，留存的记录数的百分比         |
| Extra         | 附加信息                                     |

## 如何分析 EXPLAIN 结果？

为了分析 `EXPLAIN` 语句的执行结果，我们需要搞懂执行计划中的重要字段。

### id

`SELECT` 标识符，用于标识每个 `SELECT` 语句的执行顺序。

`id` 列的解读规则：

- **id 相同**：从上往下依次执行（通常出现在多表 JOIN 场景）
- **id 不同**：id 值越大，执行优先级越高（子查询先于外层查询执行）
- **id 为 NULL**：表示这是 UNION RESULT 或 DERIVED 表的结果集，不需要单独执行查询

**示例**：

```sql
EXPLAIN SELECT * FROM dept_emp WHERE emp_no = 10001
UNION
SELECT * FROM dept_emp WHERE dept_no = 'd001';
```

输出中最后一行的 `id = NULL`，table = `<union1,2>`，表示这是前两个查询结果的合并。

### select_type

查询的类型，主要用于区分普通查询、联合查询、子查询等复杂的查询，常见的值有：

- **SIMPLE**：简单查询，不包含 UNION 或者子查询。
- **PRIMARY**：查询中如果包含子查询或其他部分，外层的 SELECT 将被标记为 PRIMARY。
- **SUBQUERY**：子查询中的第一个 SELECT。
- **UNION**：在 UNION 语句中，UNION 之后出现的 SELECT。
- **DERIVED**：在 FROM 中出现的子查询将被标记为 DERIVED。
- **UNION RESULT**：UNION 查询的结果。

### table

查询用到的表名，每行都有对应的表名，表名除了正常的表之外，也可能是以下列出的值：

- **`<unionM,N>`** : 本行引用了 id 为 M 和 N 的行的 UNION 结果；
- **`<derivedN>`** : 本行引用了 id 为 N 的表所产生的派生表结果。派生表有可能产生自 FROM 语句中的子查询。
- **`<subqueryN>`** : 本行引用了 id 为 N 的表所产生的物化子查询结果。

### type（重要）

查询执行的类型，描述了查询是如何执行的。**从最优到最差的排序为**：

`system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL`

**性能判断经验法则**：

- **优秀**（至少达到）：`system`、`const`、`eq_ref`、`ref`、`range`
- **需关注**：`index_merge`、`index`（全索引扫描，大数据量下仍有性能风险）
- **需优化**：`ALL`（全表扫描）

**注意**：此排序反映的是**单表访问效率**，不代表整体查询性能。例如 `type=ref` 配合大量回表，可能比 `type=index` 的覆盖索引更慢。

常见的几种类型具体含义如下：

- **system**：表中只有一行记录（或者是空表），且存储引擎能够精确统计行数。适用于 MyISAM、Memory、InnoDB（当表只有 1 行时，InnoDB 会优化为 const）等引擎。是 const 访问类型的特例。
- **const**：表中最多只有一行匹配的记录，一次查询就可以找到，常用于使用主键或唯一索引的所有字段作为查询条件。
- **eq_ref**：当连表查询时，前一张表的行在当前这张表中只有一行与之对应。是除了 system 与 const 之外最好的 join 方式，常用于使用主键或唯一非空索引的所有字段作为连表条件（严格保证一对一匹配）。
- **ref**：使用普通索引作为查询条件，查询结果可能找到多个符合条件的行（与 eq_ref 的区别：一个驱动行可能匹配多个被驱动行）。
- **index_merge**：当 WHERE 子句包含多个范围条件，且每个条件可以使用不同索引时，MySQL 会合并多个索引的扫描结果。key 列列出使用的索引，Extra 列显示合并算法：

  - `Using union(...)`：对多个索引结果取并集（OR 条件）
  - `Using sort_union(...)`：先对索引结果排序再取并集（OR 条件，索引列非有序）
  - `Using intersection(...)`：对多个索引结果取交集（AND 条件）

  **示例**：

  ```sql
  -- OR 条件触发 index merge union
  EXPLAIN SELECT * FROM employees WHERE emp_no = 10001 OR dept_no = 'd001';
  -- Extra: Using union(PRIMARY,dept_no_index)
  ```

- **range**：对索引列进行范围查询，执行计划中的 key 列表示哪个索引被使用了。
- **index**：Full Index Scan，查询遍历了整棵索引树。与 ALL（全表扫描）类似，但通常开销更低：索引记录的体积远小于完整行数据，读取相同行数所需的 I/O 页数更少；若同时满足覆盖索引条件，还可避免回表。但在超大表（亿级以上）上，全索引扫描同样可能产生大量 I/O，不可因 type 级别高于 ALL 就忽视其代价。
- **ALL**：全表扫描。

### possible_keys

possible_keys 列表示 MySQL 执行查询时可能用到的索引。如果这一列为 NULL ，则表示没有可能用到的索引；这种情况下，需要检查 WHERE 语句中所使用的列，看是否可以通过给这些列中某个或多个添加索引的方法来提高查询性能。

### key（重要）

key 列表示 MySQL 实际使用到的索引。如果为 NULL，则表示未用到索引。

### key_len

key_len 列表示 MySQL 实际使用的索引的最大长度；当使用到联合索引时，有可能是多个列的长度和。在满足需求的前提下越短越好。如果 key 列显示 NULL ，则 key_len 列也显示 NULL 。

### rows

rows 列表示根据表统计信息及索引选用情况，**估算**出找到所需记录需要读取的行数，数值越小越好。

需要注意的是，该值是估算值而非精确值。InnoDB 的统计信息基于对索引页的随机采样：

- 采样页数由 `innodb_stats_persistent_sample_pages` 控制（默认 20 页）
- 在表数据频繁变动或批量导入后，估算值与真实行数的偏差可能达到 10%～50% 甚至更大
- **小表陷阱**：当表行数极少（如 < 100 行）时，优化器可能忽略索引而选择全表扫描，因为全表扫描的成本估算更低

**验证方法**：

```sql
-- 执行计划估算行数
EXPLAIN SELECT * FROM dept_emp WHERE emp_no = 10001;

-- 实际行数（注意：在大表上慎用 COUNT(*)）
SELECT COUNT(*) FROM dept_emp WHERE emp_no = 10001;
```

遇到执行计划与实际性能不符时，可以执行 `ANALYZE TABLE` 重新采样，再观察执行计划的变化。

### filtered

filtered 列表示存储引擎返回的数据在 Server 层经 WHERE 条件过滤后，**估算**留存的记录占比（百分比，0～100）。计算公式为：`filtered = (条件过滤后的行数 / 存储引擎返回的行数) × 100`。

**解读规则**：

- 当 `filtered = 100`：存储引擎返回的所有行都满足 WHERE 条件（理想情况）
- 当 `filtered < 100`：部分行被 Server 层过滤掉，说明索引未能覆盖所有查询条件
- **JOIN 场景**：优化器用 `rows × (filtered / 100)` 估算当前表传递给下一张表的行数（扇出）

该字段在多表 JOIN 场景中尤为重要：扇出越大，驱动表需要匹配的被驱动表行数就越多。因此当 `filtered` 值很低时，说明过滤效率较好；而当 `rows` 很大且 `filtered` 又不高时，则是潜在性能瓶颈的信号，应优先考虑通过索引下推（ICP）或更合适的索引来减少扇出。

### Extra（重要）

这列包含了 MySQL 解析查询的额外信息，通过这些信息，可以更准确的理解 MySQL 到底是如何执行查询的。常见的值如下：

- **Using filesort**：MySQL 无法利用索引完成 ORDER BY 或 GROUP BY 的排序要求，需要在返回结果集后额外执行一次排序操作。当结果集大小在 `sort_buffer_size` 以内时，排序在内存中完成；超出则借助临时磁盘文件。"filesort" 是历史遗留名称，并不代表一定产生磁盘 I/O。
- **Using temporary**：MySQL 需要创建临时表来存储查询的结果，常见于 ORDER BY 和 GROUP BY。
- **Using index**：表明查询使用了覆盖索引，不用回表，查询效率非常高。
- **Using index condition**：表示查询优化器选择使用了索引条件下推这个特性。
- **Using where**：MySQL Server 层对存储引擎返回的行应用了额外的 WHERE 条件过滤。即使已命中索引（如 `type=ref`），若索引只能满足部分查询条件，剩余条件仍需在 Server 层过滤，此时同样会出现 `Using where`。
- **Using join buffer (Block Nested Loop)**：连表查询时，被驱动表未使用索引，MySQL 会先将驱动表数据读入 join buffer，再遍历被驱动表进行匹配（复杂度 O(N×M)）。
- **Using join buffer (hash join)**：MySQL 8.0.18 引入了 Hash Join 算法，**仅用于等值 JOIN**（如 `t1.id = t2.id`），8.0.20 起默认替代 BNL。Hash Join 复杂度为构建阶段 O(N) + 探测阶段 O(M)，比 BNL 的 O(N×M) 更高效。

  **例外场景**（仍会退回 BNL）：

  - 非等值 JOIN（如 `t1.id > t2.id`）
  - JOIN 条件包含函数或表达式
  - 被驱动表上有索引可用时（此时会使用 Index Nested Loop）

这里提醒下，当 Extra 列包含 Using filesort 或 Using temporary 时，MySQL 的性能可能会存在问题，需要尽可能避免。

## 参考

- <https://dev.mysql.com/doc/refman/8.0/en/explain-output.html>
- <https://dev.mysql.com/doc/refman/8.0/en/explain.html>
- <https://juejin.cn/post/6953444668973514789>

<!-- @include: @article-footer.snippet.md -->
