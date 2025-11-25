---
title: MySQL日期类型选择建议
category: 数据库
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL 日期类型选择, MySQL 时间存储最佳实践, MySQL 时间存储效率, MySQL DATETIME 和 TIMESTAMP 区别, MySQL 时间戳存储, MySQL 数据库时间存储类型, MySQL 开发日期推荐, MySQL 字符串存储日期的缺点, MySQL 时区设置方法, MySQL 日期范围对比, 高性能 MySQL 日期存储, MySQL UNIX_TIMESTAMP 用法, 数值型时间戳优缺点, MySQL 时间存储性能优化, MySQL TIMESTAMP 时区转换, MySQL 时间格式转换, MySQL 时间存储空间对比, MySQL 时间类型选择建议, MySQL 日期类型性能分析, 数据库时间存储优化
---

在日常的软件开发工作中，存储时间是一项基础且常见的需求。无论是记录数据的操作时间、金融交易的发生时间，还是行程的出发时间、用户的下单时间等等，时间信息与我们的业务逻辑和系统功能紧密相关。因此，正确选择和使用 MySQL 的日期时间类型至关重要，其恰当与否甚至可能对业务的准确性和系统的稳定性产生显著影响。

本文旨在帮助开发者重新审视并深入理解 MySQL 中不同的时间存储方式，以便做出更合适项目业务场景的选择。

## 不要用字符串存储日期

和许多数据库初学者一样，笔者在早期学习阶段也曾尝试使用字符串（如 VARCHAR）类型来存储日期和时间，甚至一度认为这是一种简单直观的方法。毕竟，'YYYY-MM-DD HH:MM:SS' 这样的格式看起来清晰易懂。

但是，这是不正确的做法，主要会有下面两个问题：

1. **空间效率**：与 MySQL 内建的日期时间类型相比，字符串通常需要占用更多的存储空间来表示相同的时间信息。
2. **查询与计算效率低下**：
   - **比较操作复杂且低效**：基于字符串的日期比较需要按照字典序逐字符进行，这不仅不直观（例如，'2024-05-01' 会小于 '2024-1-10'），而且效率远低于使用原生日期时间类型进行的数值或时间点比较。
   - **计算功能受限**：无法直接利用数据库提供的丰富日期时间函数进行运算（例如，计算两个日期之间的间隔、对日期进行加减操作等），需要先转换格式，增加了复杂性。
   - **索引性能不佳**：基于字符串的索引在处理范围查询（如查找特定时间段内的数据）时，其效率和灵活性通常不如原生日期时间类型的索引。

## DATETIME 和 TIMESTAMP 选择

`DATETIME` 和 `TIMESTAMP` 是 MySQL 中两种非常常用的、用于存储包含日期和时间信息的数据类型。它们都可以存储精确到秒（MySQL 5.6.4+ 支持更高精度的小数秒）的时间值。那么，在实际应用中，我们应该如何在这两者之间做出选择呢？

下面我们从几个关键维度对它们进行对比：

### 时区信息

`DATETIME` 类型存储的是**字面量的日期和时间值**，它本身**不包含任何时区信息**。当你插入一个 `DATETIME` 值时，MySQL 存储的就是你提供的那个确切的时间，不会进行任何时区转换。

**这样就会有什么问题呢？** 如果你的应用需要支持多个时区，或者服务器、客户端的时区可能发生变化，那么使用 `DATETIME` 时，应用程序需要自行处理时区的转换和解释。如果处理不当（例如，假设所有存储的时间都属于同一个时区，但实际环境变化了），可能会导致时间显示或计算上的混乱。

**`TIMESTAMP` 和时区有关**。存储时，MySQL 会将当前会话时区下的时间值转换成 UTC（协调世界时）进行内部存储。当查询 `TIMESTAMP` 字段时，MySQL 又会将存储的 UTC 时间转换回当前会话所设置的时区来显示。

这意味着，对于同一条记录的 `TIMESTAMP` 字段，在不同的会话时区设置下查询，可能会看到不同的本地时间表示，但它们都对应着同一个绝对时间点（UTC 时间）。这对于需要全球化、多时区支持的应用来说非常有用。

下面实际演示一下！

建表 SQL 语句：

```sql
CREATE TABLE `time_zone_test` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date_time` datetime DEFAULT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

插入一条数据（假设当前会话时区为系统默认，例如 UTC+0）:：

```sql
INSERT INTO time_zone_test(date_time,time_stamp) VALUES(NOW(),NOW());
```

查询数据（在同一时区会话下）：

```sql
SELECT date_time, time_stamp FROM time_zone_test;
```

结果：

```plain
+---------------------+---------------------+
| date_time           | time_stamp          |
+---------------------+---------------------+
| 2020-01-11 09:53:32 | 2020-01-11 09:53:32 |
+---------------------+---------------------+
```

现在，修改当前会话的时区为东八区 (UTC+8):

```sql
SET time_zone = '+8:00';
```

再次查询数据：

```bash
# TIMESTAMP 的值自动转换为 UTC+8 时间
+---------------------+---------------------+
| date_time           | time_stamp          |
+---------------------+---------------------+
| 2020-01-11 09:53:32 | 2020-01-11 17:53:32 |
+---------------------+---------------------+
```

**扩展：MySQL 时区设置常用 SQL 命令**

```sql
# 查看当前会话时区
SELECT @@session.time_zone;
# 设置当前会话时区
SET time_zone = 'Europe/Helsinki';
SET time_zone = "+00:00";
# 数据库全局时区设置
SELECT @@global.time_zone;
# 设置全局时区
SET GLOBAL time_zone = '+8:00';
SET GLOBAL time_zone = 'Europe/Helsinki';
```

### 占用空间

下图是 MySQL 日期类型所占的存储空间（官方文档传送门：<https://dev.mysql.com/doc/refman/8.0/en/storage-requirements.html>）：

![](https://oss.javaguide.cn/github/javaguide/FhRGUVHFK0ujRPNA75f6CuOXQHTE.jpeg)

在 MySQL 5.6.4 之前，DateTime 和 TIMESTAMP 的存储空间是固定的，分别为 8 字节和 4 字节。但是从 MySQL 5.6.4 开始，它们的存储空间会根据毫秒精度的不同而变化，DateTime 的范围是 5~8 字节，TIMESTAMP 的范围是 4~7 字节。

### 表示范围

`TIMESTAMP` 表示的时间范围更小，只能到 2038 年：

- `DATETIME`：'1000-01-01 00:00:00.000000' 到 '9999-12-31 23:59:59.999999'
- `TIMESTAMP`：'1970-01-01 00:00:01.000000' UTC 到 '2038-01-19 03:14:07.999999' UTC

### 性能

由于 `TIMESTAMP` 在存储和检索时需要进行 UTC 与当前会话时区的转换，这个过程可能涉及到额外的计算开销，尤其是在需要调用操作系统底层接口获取或处理时区信息时。虽然现代数据库和操作系统对此进行了优化，但在某些极端高并发或对延迟极其敏感的场景下，`DATETIME` 因其不涉及时区转换，处理逻辑相对更简单直接，可能会表现出微弱的性能优势。

In order to obtain predictable behavior and possibly reduce the conversion overhead of `TIMESTAMP`, it is recommended to manage time zones uniformly at the application level, or to explicitly set the `time_zone` parameter at the database connection/session level, rather than relying on the server's default or operating system time zone.

## Are numeric timestamps a better choice?

In addition to the above two types, integer types (`INT` or `BIGINT`) are also commonly used in practice to store the so-called "Unix timestamp" (that is, the total number of seconds, or milliseconds, from January 1, 1970 00:00:00 UTC to the target time).

This storage method has some advantages of the `TIMESTAMP` type, and using it to perform date sorting and comparison operations will be more efficient, and it is also very convenient across systems. After all, it is just a stored value. The disadvantage is also obvious, that is, the readability of the data is too poor, and you cannot intuitively see the specific time.

The timestamp is defined as follows:

> The definition of timestamp is to count from a base time. This base time is "1970-1-1 00:00:00 +0:00". Starting from this time, it is expressed as an integer and measured in seconds. As time goes by, this time integer continues to increase. In this way, I only need one value to perfectly represent time, and this value is an absolute value, that is, no matter where you are in any corner of the earth, the timestamp representing time is the same, and the generated value is the same, and there is no concept of time zone. Therefore, no additional conversion is required during the time transmission in the system. It is converted to local time in string format only when displayed to the user.

Actual operations in the database:

```sql
-- Convert datetime string to Unix timestamp (seconds)
mysql> SELECT UNIX_TIMESTAMP('2020-01-11 09:53:32');
+---------------------------------------------+
| UNIX_TIMESTAMP('2020-01-11 09:53:32') |
+---------------------------------------------+
| 1578707612 |
+---------------------------------------------+
1 row in set (0.00 sec)

-- Convert Unix timestamp (seconds) to datetime format
mysql> SELECT FROM_UNIXTIME(1578707612);
+--------------------------+
| FROM_UNIXTIME(1578707612) |
+--------------------------+
| 2020-01-11 09:53:32 |
+--------------------------+
1 row in set (0.01 sec)
```

## There is no DATETIME in PostgreSQL

Since some readers mentioned the time type of PostgreSQL (PG), I will expand and add it here. The PG official document describes the time type at: <https://www.postgresql.org/docs/current/datatype-datetime.html>.

![PostgreSQL time type summary](https://oss.javaguide.cn/github/javaguide/mysql/pg-datetime-types.png)

As you can see, PG does not have a type named `DATETIME`:

- PG's `TIMESTAMP WITHOUT TIME ZONE` is functionally closest to MySQL's `DATETIME`. It stores the date and time, but does not contain any time zone information and stores literal values.
- PG's `TIMESTAMP WITH TIME ZONE` (or `TIMESTAMPTZ`) is equivalent to MySQL's `TIMESTAMP`. It converts the input value to UTC when stored and converted based on the current session's time zone when retrieved for display.

For most application scenarios that require recording precise time points, `TIMESTAMPTZ` is the most recommended and robust choice in PostgreSQL because it can best handle time zone complexities.

## Summary

How to store time in MySQL? `DATETIME`? `TIMESTAMP`? Or a numerical timestamp?

There is no silver bullet. Many programmers think that numeric timestamps are really good, efficient and compatible. However, many people think that it is not intuitive enough.

The author of the magic book "High-Performance MySQL" recommends TIMESTAMP because numerical representation of time is not intuitive enough. The following is the original text:

<img src="https://oss.javaguide.cn/github/javaguide/%E9%AB%98%E6%80%A7%E8%83%BDmysql-%E4 %B8%8D%E6%8E%A8%E8%8D%90%E7%94%A8%E6%95%B0%E5%80%BC%E6%97%B6%E9%97%B4%E6%88%B3.jpg" style="zoom:50%;" />

Each method has its own advantages, and the best way to choose is based on the actual scenario. Let's make a simple comparison of these three methods to help you choose the correct data type for storing time in actual development:

| Type | Storage space | Date format | Date range | Whether to include time zone information |
| -------------------------- | -------- | ----------------------------- | --------------------------------------------------------------- | ------------- |
| DATETIME | 5~8 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] ~ 9999-12-31 23:59:59[.999999] | No |
| TIMESTAMP | 4~7 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] ~ 2038-01-19 03:14:07[.999999] | Yes |
| Numeric timestamp | 4 bytes | Full number such as 1578707612 | Time after 1970-01-01 00:00:01 | No |

**Summary of selection suggestions:**

- The core strength of `TIMESTAMP` is its built-in time zone handling capabilities. The database takes care of UTC storage and automatic conversion based on the session time zone, simplifying the development of applications that need to handle multiple time zones. If your application needs to handle multiple time zones, or you want the database to automatically manage time zone conversions, `TIMESTAMP` is a natural choice (note its time range limit, aka the 2038 problem).
- If the application scenario does not involve time zone conversion, or you want the application to have full control over the time zone logic, and need to represent time after 2038, `DATETIME` is a safer choice.
- Numeric timestamps are a powerful option if comparison performance is of paramount concern, or if time data needs to be passed frequently across systems and the sacrifice of readability (or always conversion at the application layer) is acceptable.

<!-- @include: @article-footer.snippet.md -->