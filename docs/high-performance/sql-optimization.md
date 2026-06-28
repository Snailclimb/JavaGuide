---
title: 常见SQL优化手段总结
description: 本文系统总结常见的 SQL 优化手段，涵盖慢 SQL 定位与分析（慢查询日志、EXPLAIN、Performance Schema）、索引优化策略、查询重写技巧、分页优化等实战方法，帮助你快速提升数据库查询性能。
category: 高性能
head:
  - - meta
    - name: keywords
      content: SQL优化,慢SQL,EXPLAIN执行计划,索引优化,MySQL优化,查询优化,分页优化,Performance Schema
---

SQL 慢了，不要一上来就套“加索引”“不要 `SELECT *`”这类规则。先把慢 SQL 找出来，看它慢在扫描行数、排序、回表、锁等待，还是调用频次太高。执行计划和业务访问方式对上之后，再决定是改索引、改 SQL、改表结构，还是把查询挪到缓存、搜索引擎或离线报表里。

排查时可以按这个顺序来：

1. 先确认慢的是平均耗时、P99，还是偶发超时；是某条 SQL 慢，还是数据库整体负载高。
2. 通过慢查询日志、APM、数据库监控定位高频慢 SQL。
3. 看执行计划里的 `type`、`key`、`rows`、`filtered`、`Extra`，确认有没有全表扫描、回表过多、临时表或文件排序。
4. 再结合业务访问方式处理：少查字段、补索引、改 SQL、拆大事务、限制分页深度。
5. 最后用相同数据量和相同条件复测，别只在小数据集上验证。

## 避免使用 SELECT \*

- `SELECT *` 可能增加 I/O、网络传输、反序列化和应用内存开销，尤其是大字段（如 varchar、blob、text）。
- `SELECT *` 会降低覆盖索引命中的机会。
- `SELECT <字段列表>` 可减少表结构变更带来的影响。

## 谨慎使用复杂 Join，不要一刀切禁止 Join

阿里巴巴《Java 开发手册》中有这样一段描述：

> 【强制】超过三个表禁止 join。需要 join 的字段，数据类型保持绝对一致;多表关联查询时，保证被关联 的字段需要有索引。

![尽量避免多表做 join](https://oss.javaguide.cn/github/javaguide/mysql/alibaba-java-development-handbook-multi-table-join.png)

Join 是关系型数据库的基本能力，不应该简单理解成低效。单库内，如果关联字段类型一致、索引合适、返回数据量可控，Join 往往比应用层多次查询再组装更清晰，也更容易保证结果一致。

真正需要谨慎的是复杂 Join：

1. 关联字段没有索引，或者字段类型不一致；
2. Join 表过多，执行计划复杂；
3. 返回数据量过大，回表、临时表或文件排序成本高；
4. 跨库、跨分片 Join，需要跨节点查询、合并和排序；
5. 未来明确要按这个查询路径做分库分表。

MySQL 8.0.20 之后，Block Nested-Loop Join 已被 Hash Join 替代。分析 Join 性能时，不要只背旧版 Join 算法，应该看 `EXPLAIN` / `EXPLAIN ANALYZE` 的真实执行计划，重点关注 `type`、`key`、`rows`、`filtered`、`Extra`，以及是否出现临时表、文件排序或大量回表。

实际业务场景里，如果查询跨服务、跨库，或者将来要分库分表，可以考虑把 Join 拆成多次单表查询并在业务层组装。但这不是无条件更快，它会增加网络往返、N+1 查询、应用内存占用和一致性问题，需要结合查询频率、数据量、网络开销和一致性要求判断。

另一种常见做法是**数据冗余**：把高频查询需要的少量稳定字段冗余到主表或宽表里，减少运行时关联。冗余会带来一致性和维护成本，适合表结构比较稳定、读多写少、查询路径很明确的场景。

## 深度分页优化

深度分页问题的根本原因在于：当 `LIMIT` 的偏移量过大时，MySQL 需要扫描并跳过大量记录才能获取目标数据，查询优化器可能放弃索引而选择全表扫描。此时即使有索引，也无法避免大量的回表操作，导致查询性能急剧下降。

本文介绍了四种常见的深度分页优化方案，各方案的特点及适用场景对比如下：

| 优化方案     | 核心思路                                                            | 适用场景                       | 限制                                             |
| ------------ | ------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| **范围查询** | 记录上一页最后一条 ID，通过 `WHERE id > last_id LIMIT n` 获取下一页 | 按 ID 排序、允许游标式翻页     | 不支持跳页、非 ID 排序需使用联合游标             |
| **子查询**   | 先通过子查询获取起始主键，再根据主键过滤                            | 需要支持传统 OFFSET 翻页       | 子查询可能产生临时表、依赖排序字段的索引         |
| **延迟关联** | 用 `INNER JOIN` 将分页转移到主键索引，减少回表                      | 大数据量分页、需要传统翻页逻辑 | SQL 相对复杂                                     |
| **覆盖索引** | 建立包含查询字段的联合索引，避免回表                                | 查询字段固定、可建立合适索引   | 字段较多时索引维护成本高、大结果集可能走全表扫描 |

选方案时，先看产品交互能不能改。如果可以接受“下一页”式浏览，范围查询，也就是游标分页，通常最稳，社交媒体 feed 流、无限滚动这类场景都适合这种方式。

如果必须保留 `LIMIT offset, size` 和跳页，再考虑延迟关联、覆盖索引或搜索引擎方案。查询字段固定且数量不多时，覆盖索引可以作为补充；偏移量已经到百万级时，更应该先问业务是否真的需要支持这么深的翻页，而不是只在 SQL 上硬扛。

不管用哪种方案，都要看实际执行计划。`EXPLAIN` 里没有按预期走索引，方案写得再漂亮也没用。

详细介绍可以阅读这篇文章：[深度分页介绍及优化建议](https://javaguide.cn/high-performance/deep-pagination-optimization.html)。

## 建议不要使用外键与级联

阿里巴巴《Java 开发手册》中有这样一段描述：

> 不得使用外键与级联，一切外键概念必须在应用层解决。

![](https://oss.javaguide.cn/github/javaguide/mysql/alibaba-java-development-handbook-multi-table-join-foreign-keys-and-cascades.png)

这个规范主要面向高并发互联网业务、微服务拆分、分库分表等场景。在这些场景里，依赖外键和级联会增加跨表耦合、迁移成本和线上变更复杂度。

但外键不是“没用”。在单体应用、后台系统、核心主数据等表规模可控且强一致要求明确的场景，外键可以帮助数据库层兜住引用完整性。更准确的结论是：是否使用外键，要结合架构形态、数据规模和运维成本判断，而不是简单说“外键性能差”。

## 选择合适的字段类型

存储字节越小，占用也就空间越小，性能也越好。

**a.某些字符串可以转换成数字类型存储比如可以将 IP 地址转换成整型数据。**

数字是连续的，性能更好，占用空间也更小。

MySQL 提供了几个方法来处理 IP 地址：

- `INET_ATON()`：把 IPv4 转为无符号整型，建议使用 `INT UNSIGNED` 存储，再用 `INET_NTOA()` 转回字符串。
- `INET6_ATON()`：把 IPv6 转为二进制字符串，也可以处理 IPv4；如果系统需要支持 IPv6，更推荐统一使用 `VARBINARY(16)` 或 `BINARY(16)` 存储，再用 `INET6_NTOA()` 转回字符串。

如果只存 IPv4，`INET_ATON()` + `INT UNSIGNED` 就够了；如果未来可能接入 IPv6，提前按 16 字节二进制设计更稳。

**b.对于非负型的数据 (如自增 ID,整型 IP，年龄) 来说,要优先使用无符号整型来存储。**

无符号不会改变整数类型占用的存储字节数，只是把可表示范围从包含负数改为从 0 开始的非负范围；例如 `INT` 无论 signed 还是 unsigned 都占用 4 字节，范围分别如下：

```sql
SIGNED INT -2147483648~2147483647
UNSIGNED INT 0~4294967295
```

具体存储字节数和取值范围可参考 MySQL 官方文档：[Integer Types](https://dev.mysql.com/doc/refman/8.0/en/integer-types.html) 和 [Data Type Storage Requirements](https://dev.mysql.com/doc/refman/8.0/en/storage-requirements.html)。

**c.小数值类型（比如年龄、状态表示如 0/1）优先使用 TINYINT 类型。**

**d.对于日期类型来说， 一定不要用字符串存储日期。可以考虑 DATETIME、TIMESTAMP 和 数值型时间戳。**

这三种方式都有各自的优势，根据实际场景选择最合适的才是王道。下面再对这三种方式做一个简单的对比，以供大家实际开发中选择正确的存放时间的数据类型：

> **注意**：以下存储空间基于 MySQL 5.6.4+（支持微秒精度）。5.6.4 之前，DATETIME 固定 8 字节，TIMESTAMP 固定 4 字节。小数秒精度为 1～2 位、3～4 位、5～6 位时，分别额外占用 1、2、3 字节。

| 类型         | 存储空间    | 日期格式                       | 日期范围                                                     | 时区处理                      |
| ------------ | ----------- | ------------------------------ | ------------------------------------------------------------ | ----------------------------- |
| DATETIME     | 5~8 字节    | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] ～ 9999-12-31 23:59:59[.999999] | 不做时区转换                  |
| TIMESTAMP    | 4~7 字节    | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] ～ 2038-01-19 03:14:07[.999999] | 按 session time_zone 存取转换 |
| 数值型时间戳 | 4 或 8 字节 | 全数字如 1578707612            | 取决于整数类型和精度                                         | 不做时区转换                  |

`TIMESTAMP` 不保存时区名称，而是按当前 session 的 `time_zone` 做存取转换；`DATETIME` 表示字面日期时间，不做时区转换。秒级 Unix 时间戳可以用 `INT UNSIGNED`，但会受可表示范围限制；毫秒级时间戳通常需要 `BIGINT`。

MySQL 时间类型选择的详细介绍请看这篇：[MySQL 时间类型数据存储建议](https://javaguide.cn/database/mysql/some-thoughts-on-database-storage-time.html)。

**e.金额字段用 decimal，避免精度丢失。**

decimal 用于存储有精度要求的小数比如与金钱相关的数据，可以避免浮点数带来的精度损失。

在 Java 中，MySQL 的 decimal 类型对应的是 Java 类 `java.math.BigDecimal` 。

`BigDecimal`的详细介绍请参考这篇：[BigDecimal 详解](https://javaguide.cn/java/basis/bigdecimal.html)。

**f.尽量使用自增 id 作为主键。**

如果主键为自增 id 的话，新数据会追加到 B+ 树的尾部，避免了中间位置的页分裂，性能相对最优。在写满一个数据页的时候，直接申请另一个新数据页接着写就可以了。

如果主键是非自增 id 的话，为了让新加入数据后 B+ 树的叶子节点还能保持有序，它就需要往叶子结点的中间找位置插入。如果目标页已满，就需要进行**页分裂**——将页一分为二，移动一半数据到新页。页分裂操作需要加悲观锁，涉及大量数据移动，性能较差。

不过，分库分表场景不建议依赖单库自增 ID 作为全局主键，更常见的是使用 Snowflake、号段模式、趋势递增 ID、UUIDv7/ULID 等分布式 ID。如果使用 UUID，不建议直接用随机 UUID 字符串作为 InnoDB 主键；可以考虑 `BINARY(16)` 存储、时间有序 UUID，或使用 MySQL 的 `UUID_TO_BIN()` 做更紧凑的二进制存储。

相关阅读：[数据库主键一定要自增吗？有哪些场景不建议自增？](https://mp.weixin.qq.com/s/vNRIFKjbe7itRTxmq-bkAA)。

**g.`NULL` 要按语义使用，不要机械禁止。**

`NULL` 跟 `''`（空字符串）、数字 `0` 是完全不一样的值，表示未知或不存在。判断 `NULL` 要使用 `IS NULL` 或 `IS NOT NULL`，不能用 `=`、`!=`、`<`、`>` 之类的比较运算符。

不建议一刀切把所有列都设计成可 `NULL`，因为它会增加语义和查询处理复杂度；但也不能说 `NULL` 一定导致索引失效。MySQL 可以对 `IS NULL` 使用索引优化。真正应该优先考虑的是业务语义：如果字段确实可能未知，例如 `paid_at`、`deleted_at`、`last_login_at`，使用 `NULL` 通常比塞一个魔法默认值更清楚。

另外，`NULL` 会影响聚合函数的结果。例如，`SUM`、`AVG`、`MIN`、`MAX` 等聚合函数会忽略 `NULL` 值。`COUNT(*)` 会统计所有记录数，`COUNT(列名)` 只统计非 `NULL` 值。

## 尽量用 UNION ALL 代替 UNION

UNION 会把两个结果集的所有数据放到临时表中后再进行去重操作，更耗时，更消耗 CPU 资源。

UNION ALL 不会再对结果集进行去重操作，获取到的数据包含重复的项。

如果业务上能确定两个结果集不会重复，或允许重复，优先使用 `UNION ALL`。如果必须去重，仍然应该使用 `UNION` 或显式去重。

## 优先使用批量操作

对于数据库中的数据更新，如果能使用批量操作就要尽量使用，减少请求数据库的次数，提高性能。

```sql
# 反例
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 426547, 'user1');
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 33, 'user2');
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 293854, 'user3');

# 正例
INSERT into `cus_order` (`id`, `score`, `name`) values(1, 426547, 'user1'),(1, 33, 'user2'),(1, 293854, 'user3');
```

## SHOW PROFILE 已废弃，新版本别再依赖它

[`SHOW PROFILE`](https://dev.mysql.com/doc/refman/8.0/en/show-profile.html) 和 `SHOW PROFILES` 已被 MySQL 官方标记为 deprecated，未来版本可能删除。现在排查 SQL 性能，一般先用慢查询日志把问题 SQL 找出来，再用 `EXPLAIN` 看优化器怎么执行；MySQL 8.0.18+ 可以用 `EXPLAIN ANALYZE` 看真实耗时和行数，资源消耗再交给 Performance Schema 查。

比如想看最近执行过的 SQL 耗时，可以查 `events_statements_history_long`：

```sql
SELECT
    EVENT_ID,
    SQL_TEXT,
    TIMER_WAIT / 1000000000 AS duration_ms,
    LOCK_TIME / 1000000000 AS lock_ms,
    ROWS_EXAMINED,
    ROWS_SENT,
    CPU_TIME / 1000000000 AS cpu_ms
FROM performance_schema.events_statements_history_long
WHERE SQL_TEXT IS NOT NULL
ORDER BY TIMER_WAIT DESC
LIMIT 10;
```

`CPU_TIME` 需要 MySQL 8.0.28+；如果版本较低，可以先看 `TIMER_WAIT`、`LOCK_TIME`、`ROWS_EXAMINED`、`ROWS_SENT` 等字段。`events_statements_history_long` 只保存全局最近结束的一部分语句事件，表满后旧记录会被淘汰；相关 consumers 和 instruments 未开启时，也可能采集不到足够信息。

## 优化慢 SQL

为了优化慢 SQL ，我们首先要找到哪些 SQL 语句执行速度比较慢。

MySQL 慢查询日志是用来记录 MySQL 在执行命令中，响应时间超过预设阈值的 SQL 语句。因此，通过分析慢查询日志我们就可以找出执行速度比较慢的 SQL 语句。

出于性能层面的考虑，慢查询日志功能默认是关闭的，你可以通过以下命令开启：

```sql
# 开启慢查询日志功能
SET GLOBAL slow_query_log = 'ON';
# 慢查询日志存放位置
SET GLOBAL slow_query_log_file = '/var/lib/mysql/ranking-list-slow.log';
# 无论是否超时，未使用索引的查询也会记录下来，生产环境谨慎短期开启。
SET GLOBAL log_queries_not_using_indexes = 'ON';
# 慢查询阈值（秒），SQL 执行超过这个阈值将被记录在日志中。
SET GLOBAL long_query_time = 1;
# 慢查询仅记录扫描行数大于此参数的 SQL
SET GLOBAL min_examined_row_limit = 100;
```

`SET GLOBAL` 只影响新连接；已有连接可能仍保持原 session 值。生产环境更建议写入配置文件，并通过变更流程发布。

设置成功之后，使用 `show variables like 'slow%';` 命令进行查看。

```bash
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_launch_time    | 2                                    |
| slow_query_log      | ON                                   |
| slow_query_log_file | /var/lib/mysql/ranking-list-slow.log |
+---------------------+--------------------------------------+
3 rows in set (0.01 sec)
```

我们故意在百万数据量的表(未使用索引)中执行一条排序的语句：

```sql
SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
```

不要为了查看慢日志直接修改 MySQL 数据目录权限。更稳的做法是用具备权限的账号查看、把慢日志输出到专门目录，或通过日志采集系统收集。

查看对应的慢查询日志：

```bash
 cat /var/lib/mysql/ranking-list-slow.log
```

我们刚刚故意执行的 SQL 语句已经被慢查询日志记录了下来：

```plain
# Time: 2022-10-09T08:55:37.486797Z
# User@Host: root[root] @  [172.17.0.1]  Id:    14
# Query_time: 0.978054  Lock_time: 0.000164 Rows_sent: 999999  Rows_examined: 1999998
SET timestamp=1665305736;
SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
```

这里对日志中的一些信息进行说明：

- `Time` ：被日志记录的代码在服务器上的运行时间。
- `User@Host`：谁执行的这段代码。
- `Query_time`：这段代码运行时长。
- `Lock_time`：执行这段代码时，锁定了多久。
- `Rows_sent`：慢查询返回的记录。
- `Rows_examined`：慢查询扫描过的行数。

实际项目中，慢查询日志通常会比较复杂，我们需要借助一些工具对其进行分析。像 MySQL 内置的 `mysqldumpslow` 工具就可以把相同的 SQL 归为一类，并统计出归类项的执行次数和每次执行的耗时等一系列对应的情况。

慢 SQL 治理时建议同时关注这几个指标：

| 指标            | 说明             | 常见问题                 |
| --------------- | ---------------- | ------------------------ |
| `Query_time`    | SQL 总耗时       | 执行慢、等待锁、I/O 慢   |
| `Lock_time`     | 等锁耗时         | 行锁冲突、表锁、DDL 影响 |
| `Rows_examined` | 扫描行数         | 索引缺失、索引选择性差   |
| `Rows_sent`     | 返回行数         | 查询范围过大、分页过深   |
| 执行频次        | 单位时间执行次数 | 单次不慢但总量压垮数据库 |

不要只盯着耗时最长的 SQL。线上最危险的往往是“单次 50 ms，但每秒执行几千次”的高频 SQL。

找到了慢 SQL 之后，我们可以通过 `EXPLAIN` 命令分析对应的 `SELECT` 语句。上线优化前后，最好保存同一 SQL 的 `EXPLAIN FORMAT=TREE`、`EXPLAIN ANALYZE`、慢日志指标和关键业务 QPS，避免出现“改了索引，但执行计划没变”的情况。

```sql
mysql> EXPLAIN SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra          |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
|  1 | SIMPLE      | cus_order | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 997572 |   100.00 | Using filesort |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
1 row in set, 1 warning (0.00 sec)
```

比较重要的字段说明：

- `select_type` ：查询的类型，常用的取值有 SIMPLE（普通查询，即没有联合查询、子查询）、PRIMARY（主查询）、UNION（UNION 中后面的查询）、SUBQUERY（子查询）等。
- `table` ：表示查询涉及的表或衍生表。
- `type` ：执行方式，判断查询是否高效的重要参考指标，结果值从差到好依次是：**ALL**（全表扫描）< **index**（索引全扫描）< **range**（索引范围扫描）< **index_merge**（索引合并）< **ref**（非唯一索引查找）< **eq_ref**（唯一索引查找）< **const**（单行常量）< **system**（系统表）。实际性能还需结合 rows、Extra 等字段综合判断。
- `rows` : SQL 要查找到结果集需要扫描读取的数据行数，原则上 rows 越少越好。
- ……

> **推荐阅读**：[MySQL 执行计划分析](https://javaguide.cn/database/mysql/mysql-query-execution-plan.html) 详细介绍了 EXPLAIN 各列的含义（id、select_type、type、key、rows、Extra 等），包括 MySQL 8.0.18+ 新增的 `EXPLAIN ANALYZE` 实际执行分析功能。另外，阿里的 [慢 SQL 治理经验总结](https://mp.weixin.qq.com/s/LZRSQJufGRpRw6u4h_Uyww) 也总结得不错。

## 正确使用索引

正确使用索引可以大大加快数据的检索速度（大大减少检索的数据量）。

### 选择合适的字段创建索引

- **尽量语义清晰且少为 NULL 的字段**：索引字段最好有明确业务语义，并尽量减少 `NULL` 带来的判断复杂度。如果字段确实可能未知，可以保留 `NULL`，不要为了“性能”塞一个含义不清的魔法值。
- **被频繁查询的字段** ：我们创建索引的字段应该是查询操作非常频繁的字段。
- **被作为条件查询的字段** ：被作为 WHERE 条件查询的字段，应该被考虑建立索引。
- **频繁需要排序的字段** ：索引已经排序，这样查询可以利用索引的排序，加快排序查询时间。
- **被经常频繁用于连接的字段** ：经常用于连接的字段可能是一些外键列，对于外键列并不一定要建立外键，只是说该列涉及到表与表的关系。对于频繁被连接查询的字段，可以考虑建立索引，提高多表连接查询的效率。

### 避免索引失效

索引失效也是慢查询的主要原因之一，常见的导致索引失效的情况有下面这两类：

**1. SQL 写法让索引不好用**

这类问题通常出在写法上：本来可以沿着 B+Tree 有序查找，SQL 写完后却变成了扫描后再过滤。

- **违背最左前缀原则**：跳过联合索引前导列，或遇到范围查询（如 `>`、`<`、`BETWEEN`、`LIKE "abc%"`）后，后续列通常不能继续用于精确缩小索引扫描区间，但仍可能用于 ICP 过滤、覆盖索引或排序优化，最终要看 `EXPLAIN` 的 `key_len`、`rows`、`Extra` 和 `EXPLAIN ANALYZE`。
- **对索引列进行加工**：普通索引建在原始列上时，在 `WHERE` 左侧对索引列进行数学计算或应用函数，通常会让优化器难以使用该索引。更好的写法是把函数转换到常量侧，或改成范围条件；如果确实经常按表达式查询，可以考虑生成列索引或函数索引。
- **隐式类型转换（隐蔽且致命）**：当“字符串类型的列”去比较“数字类型的值”时，MySQL 会默认在列上套用转换函数，直接破坏树的有序性。
- **LIKE 模糊查询前置通配符**：如 `LIKE "%abc"`，前缀字符的不确定性使得优化器无法锁定扫描区间的起始点。
- **ORDER BY 额外排序**：排序列未命中索引、排序方向与索引结构不一致时，MySQL 可能需要额外的内存或磁盘排序，执行计划里通常能看到 `Using filesort`。

**2. 优化器算完成本后放弃索引**

有些情况不是索引不能用，而是优化器算完成本后，觉得全表扫描反而更便宜。

- **`SELECT *` 回表太多**：查询大量非索引覆盖列时，如果命中数据量较大（通常超 20%~30%），优化器可能认为全表扫描的顺序 I/O 比频繁回表的随机 I/O 更划算，于是主动放弃索引。
- **`OR` 条件导致全表扫描**：只要 `OR` 连接的任意一侧条件没有对应索引，就会触发全表扫描。即使两侧都有索引，若 Index Merge（索引合并）的预期成本过高，依然会被放弃。
- **`IN` 列表过长引发估算失真**：`IN` 列表很长时，优化器估算成本可能不准确。MySQL 通过 `eq_range_index_dive_limit` 控制 equality range 数量达到某个阈值后是否从 index dive 切换到统计估算。不同版本和配置可能不同，不建议只背“200”这个数字，应结合 `EXPLAIN`、统计信息和 `ANALYZE TABLE` 判断。

详细介绍：[MySQL索引失效场景总结](https://javaguide.cn/database/mysql/mysql-index-invalidation.html)。

### 被频繁更新的字段应该慎重建立索引

虽然索引能带来查询上的效率，但是维护索引的成本也是不小的。 如果一个字段不被经常查询，反而被经常修改，那么就更不应该在这种字段上建立索引了。

### 尽可能的考虑建立联合索引而不是单列索引

因为索引是需要占用磁盘空间的，可以简单理解为每个索引都对应着一颗 B+树。如果一个表的字段过多，索引过多，那么当这个表的数据达到一个体量后，索引占用的空间也是很多的，且修改索引时，耗费的时间也是较多的。如果是联合索引，多个字段在一个索引上，那么将会节约很大磁盘空间，且修改数据的操作效率也会提升。

### 注意避免冗余索引

冗余索引指的是索引的功能相同，能够命中索引(a, b)就肯定能命中索引(a) ，那么索引(a)就是冗余索引。如（name,city ）和（name ）这两个索引就是冗余索引，能够命中前者的查询肯定是能够命中后者的 在大多数情况下，都应该尽量扩展已有的索引而不是创建新索引。

### 考虑在字符串类型的字段上使用前缀索引代替普通索引

前缀索引仅限于字符串类型，较普通索引会占用更小的空间，所以可以考虑使用前缀索引带替普通索引。

### 删除长期未使用的索引

删除长期未使用的索引，不用的索引的存在会造成不必要的性能损耗。MySQL 5.7 可以通过查询 sys 库的 `schema_unused_indexes` 视图来查询哪些索引从未被使用。

不过，这个视图只有在服务运行足够久、工作负载有代表性时才有意义。MySQL 8.0+ 删除索引前，可以先把索引设为 invisible，观察执行计划和业务指标，再决定是否真正删除：

```sql
ALTER TABLE t ALTER INDEX idx_name INVISIBLE;
```

## 生产优化注意事项

- **不要在高峰期直接加索引**：大表加索引可能长时间占用资源，生产环境需要评估在线 DDL、元数据锁、磁盘空间、备份、回滚、业务低峰窗口和从库复制延迟。
- **不要为了一个低频查询牺牲写入性能**：索引越多，写入、更新和删除的维护成本越高。
- **不要忽略数据分布**：同一条 SQL 在测试库很快，到了生产库可能因为数据倾斜、统计信息陈旧而走完全不同的执行计划。
- **不要只优化 SQL 文本**：有些问题需要产品侧限制查询范围，有些需要缓存，有些需要异步报表或数仓承接。
- **优化后继续观察**：上线后持续观察慢查询数量、CPU、I/O、Buffer Pool 命中率、连接数和锁等待。

## 参考

- MySQL 8.2 Optimizing SQL Statements：https://dev.mysql.com/doc/refman/8.0/en/statement-optimization.html
- 为什么阿里巴巴禁止数据库中做多表 join - Hollis：https://mp.weixin.qq.com/s/GSGVFkDLz1hZ1OjGndUjZg
- MySQL 的 COUNT 语句，竟然都能被面试官虐的这么惨 - Hollis：https://mp.weixin.qq.com/s/IOHvtel2KLNi-Ol4UBivbQ
- MySQL 性能优化神器 Explain 使用分析：https://segmentfault.com/a/1190000008131735
- 如何使用 MySQL 慢查询日志进行性能优化 ：https://kalacloud.com/blog/how-to-use-mysql-slow-query-log-profiling-mysqldumpslow/
