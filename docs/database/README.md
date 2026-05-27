---
title: 数据库知识体系：SQL、MySQL、Redis、MongoDB 与 Elasticsearch
description: 数据库面试与知识体系学习路线，涵盖 SQL、MySQL 索引、事务、日志、MVCC、执行计划、Redis 缓存、MongoDB 和 Elasticsearch。
category: 数据库
tag:
  - 数据库
  - MySQL
  - Redis
sitemap:
  changefreq: weekly
  priority: 0.95
head:
  - - meta
    - name: keywords
      content: 数据库,数据库面试题,SQL,MySQL,Redis,MongoDB,Elasticsearch,MySQL索引,MySQL事务,MySQL日志,MVCC,Redis缓存,Redis持久化,Redis集群,后端面试
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **数据库知识体系** 面向后端学习、工程实践和面试复习，按“数据库基础 -> SQL -> MySQL -> Redis -> NoSQL 与搜索”的顺序整理本站数据库相关文章。

如果你时间有限，建议先看 [数据库基础常见面试题总结](./basis.md)、[SQL 语法基础知识总结](./sql/sql-syntax-summary.md)、[MySQL 常见面试题总结](./mysql/mysql-questions-01.md) 和 [Redis 常见面试题总结（上）](./redis/redis-questions-01.md)，快速建立高频问题清单。

## 适合谁看

- 正在系统学习数据库基础、SQL、MySQL 和 Redis 的后端开发者。
- 准备校招、社招、中大厂后端面试的同学。
- 想补齐索引、事务、日志、执行计划、缓存一致性、Redis 持久化和集群能力的工程师。
- 已经写过业务 CRUD，但对数据库底层原理、性能优化和 NoSQL 选型不够熟的读者。

## 学习重点

- 关系型数据库和 NoSQL 分别适合解决什么问题，常见选型边界在哪里？
- SQL 的查询、聚合、连接、子查询和事务语义应该如何掌握？
- MySQL 索引、事务隔离、MVCC、三大日志和执行计划如何串成一条主线？
- Redis 为什么快，常用数据结构、缓存策略、持久化、阻塞问题和集群机制如何理解？
- MongoDB、Elasticsearch 这类 NoSQL/搜索系统在后端面试和工程选型中常考哪些点？

## 建议阅读顺序

1. [数据库基础常见面试题总结](./basis.md) 和 [NoSQL 基础常见面试题总结](./nosql.md)：先理解数据库分类、事务、范式、NoSQL 类型和典型应用场景。
2. [SQL 语法基础知识总结](./sql/sql-syntax-summary.md)：补齐查询、过滤、排序、聚合、连接、子查询、插入、更新和删除等 SQL 基本功。
3. [MySQL 专题](./mysql/)：重点学习索引、事务隔离、MVCC、三大日志、执行过程和执行计划。
4. [Redis 专题](./redis/)：重点学习缓存基础、数据结构、缓存读写策略、持久化、阻塞问题、内存碎片和集群。
5. [MongoDB 专题](./mongodb/) 和 [Elasticsearch 常见面试题总结](./elasticsearch/elasticsearch-questions-01.md)：根据岗位要求补充文档数据库和搜索引擎相关知识。

## 核心文章

### 数据库基础与 SQL

这部分适合先建立数据库通用认知，重点理解数据库类型、事务语义、字符集、SQL 基础和常见查询题。

- [数据库基础常见面试题总结](./basis.md)：梳理数据库基础概念、事务特性、并发控制、范式和常见面试问题。
- [NoSQL 基础常见面试题总结](./nosql.md)：理解键值、文档、列族、图数据库等 NoSQL 类型及适用场景。
- [字符集详解：字符集是什么？怎么用？](./character-set.md)：理解字符集、编码、乱码原因以及 MySQL 字符集设置。
- [SQL 专题](./sql/)：从 SQL 语法基础讲到常见 SQL 面试题。
- [SQL 语法基础知识总结](./sql/sql-syntax-summary.md)：覆盖查询、过滤、排序、聚合、分组、连接、子查询和数据修改。

### MySQL

MySQL 是后端开发最核心的关系型数据库考点之一，学习时建议把“索引 -> 执行计划 -> 事务 -> MVCC -> 日志 -> 性能优化”连起来。

- [MySQL 专题](./mysql/)：串联 MySQL 索引、事务、MVCC、日志、执行计划和性能优化。
- [MySQL 常见面试题总结](./mysql/mysql-questions-01.md)：快速建立 MySQL 高频问题清单。
- [MySQL 索引详解](./mysql/mysql-index.md)：理解索引数据结构、最左前缀、覆盖索引、回表和索引设计原则。
- [MySQL 事务隔离级别详解](./mysql/transaction-isolation-level.md)：理解脏读、不可重复读、幻读和不同隔离级别的权衡。
- [InnoDB 存储引擎对 MVCC 的实现](./mysql/innodb-implementation-of-mvcc.md)：理解 Read View、隐藏字段、undo log 和快照读。
- [MySQL 三大日志详解](./mysql/mysql-logs.md)：理解 binlog、redo log、undo log 的作用和关系。
- [MySQL 执行计划分析](./mysql/mysql-query-execution-plan.md)：掌握 EXPLAIN 常见字段和慢 SQL 分析入口。

### Redis

Redis 既是缓存，也是高频中间件考点。学习时不要只背命令，更要理解缓存策略、数据结构、持久化、阻塞原因和集群机制。

- [Redis 专题](./redis/)：围绕缓存、数据结构、持久化、集群、阻塞问题和工程实践展开。
- [缓存基础常见面试题总结](./redis/cache-basics.md)：理解缓存使用场景、缓存穿透、击穿、雪崩和一致性问题。
- [Redis 常见面试题总结（上）](./redis/redis-questions-01.md) 和 [Redis 常见面试题总结（下）](./redis/redis-questions-02.md)：快速建立 Redis 高频问题清单。
- [Redis 5 种基本数据类型详解](./redis/redis-data-structures-01.md)：理解 String、List、Hash、Set、Sorted Set 的应用场景。
- [Redis 持久化机制详解](./redis/redis-persistence.md)：理解 RDB、AOF、AOF 重写和混合持久化。
- [Redis 集群详解](./redis/redis-cluster.md)：理解主从复制、哨兵、Cluster、槽位和故障转移。

### NoSQL 与搜索

这部分适合在掌握关系型数据库和缓存之后补充，用来理解文档数据库、搜索引擎和非关系型存储的选型边界。

- [MongoDB 专题](./mongodb/)：整理 MongoDB 文档模型、索引、副本集、分片、事务和常见面试问题。
- [MongoDB 常见面试题总结（上）](./mongodb/mongodb-questions-01.md) 和 [MongoDB 常见面试题总结（下）](./mongodb/mongodb-questions-02.md)：理解 MongoDB 核心概念和工程实践。
- [Elasticsearch 常见面试题总结](./elasticsearch/elasticsearch-questions-01.md)：理解倒排索引、分片、副本、写入查询流程和搜索场景。

## 高频问题

- 关系型数据库和 NoSQL 有什么区别？分别适合哪些场景？
- 数据库事务 ACID 是什么？隔离级别分别解决什么问题？
- SQL 中 WHERE、GROUP BY、HAVING、ORDER BY 的执行顺序如何理解？
- MySQL 索引为什么能加速查询？什么情况下会索引失效？
- InnoDB 如何通过 MVCC 实现非锁定一致性读？
- binlog、redo log、undo log 分别解决什么问题？
- 如何通过 EXPLAIN 分析 SQL 执行计划？
- Redis 为什么快？缓存穿透、击穿、雪崩如何处理？
- Redis 持久化、主从复制、哨兵和 Cluster 分别解决什么问题？
- MongoDB 和 Elasticsearch 分别适合什么业务场景？

## 相关专题

- [高性能系统知识体系](../high-performance/)
- [高可用系统知识体系](../high-availability/)
- [分布式系统知识体系](../distributed-system/)
- [系统设计](../system-design/)

<!-- @include: @article-footer.snippet.md -->
