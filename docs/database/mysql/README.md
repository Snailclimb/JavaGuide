---
title: MySQL 专题：索引、事务、日志、MVCC、执行计划与性能优化
description: MySQL 面试与性能优化学习路线，涵盖索引、索引失效、事务隔离级别、MVCC、binlog、redo log、undo log、执行计划和 SQL 优化。
category: 数据库
tag:
  - MySQL
  - 数据库
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: MySQL,MySQL面试题,MySQL索引,索引失效,事务隔离级别,MVCC,binlog,redo log,undo log,执行计划,SQL执行过程,MySQL性能优化,后端面试
---

MySQL 是后端开发最常用的关系型数据库之一，也是数据库面试中最容易追问到底的专题。学习 MySQL 时，建议围绕“索引怎么让查询变快、事务怎么保证一致性、日志怎么保证恢复和复制、执行计划怎么定位慢 SQL”这几条主线展开。

## 适合谁看

- 想系统学习 MySQL 原理和性能优化的后端开发者。
- 准备 MySQL 索引、事务、MVCC、日志、执行计划相关面试题的同学。
- 已经能写常规 SQL，但对慢 SQL 分析、索引设计和事务问题不够熟的读者。
- 需要在项目中处理 MySQL 性能、数据一致性和字段设计问题的工程师。

## 学习重点

- B+ 树索引、聚簇索引、二级索引、覆盖索引和回表分别是什么？
- 哪些 SQL 写法会导致索引失效，如何通过执行计划验证？
- MySQL 事务隔离级别如何影响脏读、不可重复读和幻读？
- InnoDB 如何通过 MVCC、undo log 和 Read View 实现快照读？
- binlog、redo log、undo log 分别解决复制、崩溃恢复和事务回滚中的哪些问题？
- 慢 SQL 优化应该如何从建表、索引、SQL 写法和执行计划逐层定位？

## 建议阅读顺序

1. [MySQL 常见面试题总结](./mysql-questions-01.md)：先建立 MySQL 高频问题清单。
2. [MySQL 索引详解](./mysql-index.md)、[MySQL 索引失效场景总结](./mysql-index-invalidation.md)：理解索引原理和常见失效场景。
3. [MySQL 事务隔离级别详解](./transaction-isolation-level.md)、[InnoDB 存储引擎对 MVCC 的实现](./innodb-implementation-of-mvcc.md)：掌握事务和一致性读。
4. [MySQL 三大日志详解](./mysql-logs.md)、[SQL 语句在 MySQL 中的执行过程](./how-sql-executed-in-mysql.md)：理解写入、提交、恢复和执行链路。
5. [MySQL 执行计划分析](./mysql-query-execution-plan.md)、[MySQL 高性能优化规范建议总结](./mysql-high-performance-optimization-specification-recommendations.md)：把原理落到慢 SQL 和工程规范上。

## 核心文章

### 总览与规范

- [MySQL 常见面试题总结](./mysql-questions-01.md)：串联索引、事务、锁、日志、存储引擎和 SQL 优化等高频考点。
- [MySQL 高性能优化规范建议总结](./mysql-high-performance-optimization-specification-recommendations.md)：从建表、字段、索引、SQL、事务和开发规范角度总结优化建议。
- [一千行 MySQL 学习笔记](./a-thousand-lines-of-mysql-study-notes.md)：适合用来查漏补缺，快速回顾 MySQL 常见知识点。

### 索引与执行计划

- [MySQL 索引详解](./mysql-index.md)：理解索引数据结构、聚簇索引、二级索引、覆盖索引、最左前缀和索引设计。
- [MySQL 索引失效场景总结](./mysql-index-invalidation.md)：整理常见索引失效写法和排查思路。
- [MySQL 隐式转换造成索引失效](./index-invalidation-caused-by-implicit-conversion.md)：聚焦隐式类型转换导致的索引失效问题。
- [MySQL 执行计划分析](./mysql-query-execution-plan.md)：掌握 EXPLAIN 的 type、key、rows、Extra 等关键字段。

### 事务、MVCC 与日志

- [MySQL 事务隔离级别详解](./transaction-isolation-level.md)：理解读未提交、读已提交、可重复读、串行化以及并发读异常。
- [InnoDB 存储引擎对 MVCC 的实现](./innodb-implementation-of-mvcc.md)：理解隐藏字段、undo log、Read View 和可见性判断。
- [MySQL 三大日志详解](./mysql-logs.md)：理解 binlog、redo log、undo log 的作用、写入时机和两阶段提交。

### 执行过程与工程细节

- [SQL 语句在 MySQL 中的执行过程](./how-sql-executed-in-mysql.md)：理解连接器、查询缓存、分析器、优化器、执行器和存储引擎的协作。
- [MySQL 查询缓存详解](./mysql-query-cache.md)：理解查询缓存的工作方式、失效原因和被移除的背景。
- [MySQL 自增主键一定是连续的吗？](./mysql-auto-increment-primary-key-continuous.md)：理解自增值分配、回滚、批量插入和主键连续性的关系。
- [MySQL 日期类型选择建议](./some-thoughts-on-database-storage-time.md)：对比 DATE、DATETIME、TIMESTAMP 等类型的适用场景。

## 高频问题

- MySQL 为什么推荐使用 B+ 树索引？
- 聚簇索引和二级索引有什么区别？什么是回表和覆盖索引？
- 最左前缀原则是什么？哪些场景会导致索引失效？
- 如何通过 EXPLAIN 判断一条 SQL 是否走了合适的索引？
- MySQL 的四种事务隔离级别分别解决什么问题？
- MVCC 是如何实现的？Read View 里有哪些关键字段？
- binlog、redo log、undo log 有什么区别？两阶段提交解决什么问题？
- 慢 SQL 优化应该从哪些维度入手？
- 自增主键为什么不一定连续？
- DATETIME 和 TIMESTAMP 应该如何选择？

## 相关专题

- [数据库知识体系](../)
- [SQL 专题](../sql/)
- [高性能系统知识体系](../../high-performance/)
- [高可用系统知识体系](../../high-availability/)

<!-- @include: @article-footer.snippet.md -->
