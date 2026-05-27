---
title: SQL 专题：语法基础、查询、聚合、连接、子查询与常见面试题
description: SQL 面试与数据库基础学习路线，涵盖 SQL 查询、过滤、排序、聚合、分组、连接、子查询、增删改、约束、事务和常见 SQL 面试题。
category: 数据库
tag:
  - SQL
  - 数据库
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: SQL,SQL面试题,SQL语法,SQL查询,SQL聚合,SQL连接,SQL子查询,数据库基础,后端面试
---

SQL 是后端开发绕不开的数据库基本功。无论后续学习 MySQL 索引、执行计划，还是做慢 SQL 优化，都需要先把查询、过滤、聚合、连接、子查询和数据修改这些基础语义掌握扎实。

## 适合谁看

- 正在学习数据库基础和 SQL 语法的后端开发者。
- 准备 SQL 基础、SQL 查询题、数据库 CRUD 相关面试题的同学。
- 写过简单 SQL，但对 JOIN、GROUP BY、HAVING、子查询和执行顺序不够熟的读者。
- 想在学习 MySQL 索引和 SQL 优化前补齐 SQL 基本功的工程师。

## 学习重点

- SELECT、WHERE、ORDER BY、LIMIT、GROUP BY、HAVING 的职责和执行顺序如何理解？
- INNER JOIN、LEFT JOIN、RIGHT JOIN、UNION、子查询分别适合哪些场景？
- 聚合函数、分组统计和条件过滤如何组合使用？
- INSERT、UPDATE、DELETE 写法中有哪些容易忽略的边界？
- 面试中的 SQL 题应该如何从表关系、过滤条件、聚合维度和排序分页拆解？

## 建议阅读顺序

1. [SQL 语法基础知识总结](./sql-syntax-summary.md)：先系统掌握 SQL 的基本语法和常见操作。
2. [SQL 常见面试题总结（1）](./sql-questions-01.md)、[SQL 常见面试题总结（2）](./sql-questions-02.md)：练习基础查询、排序、聚合和常见函数。
3. [SQL 常见面试题总结（3）](./sql-questions-03.md)：继续补充连接、子查询和复杂查询思路。
4. [SQL 常见面试题总结（4）](./sql-questions-04.md)、[SQL 常见面试题总结（5）](./sql-questions-05.md)：通过更多题目巩固查询拆解能力。
5. 学完 SQL 基础后，建议继续阅读 [MySQL 专题](../mysql/)，把 SQL 写法和索引、执行计划结合起来。

## 核心文章

- [SQL 语法基础知识总结](./sql-syntax-summary.md)：覆盖查询、过滤、排序、聚合、分组、连接、子查询、插入、更新、删除和约束等基础语法。
- [SQL 常见面试题总结（1）](./sql-questions-01.md)：通过基础题目熟悉查询、排序和简单过滤。
- [SQL 常见面试题总结（2）](./sql-questions-02.md)：继续练习函数、字符串处理、日期处理和常见查询写法。
- [SQL 常见面试题总结（3）](./sql-questions-03.md)：适合用来训练多表查询、分组统计和子查询拆解。
- [SQL 常见面试题总结（4）](./sql-questions-04.md)：补充更多常见 SQL 面试题和解题思路。
- [SQL 常见面试题总结（5）](./sql-questions-05.md)：进一步巩固 SQL 查询题的综合应用能力。

## 高频问题

- SQL 查询语句的逻辑执行顺序是什么？
- WHERE 和 HAVING 有什么区别？
- INNER JOIN 和 LEFT JOIN 有什么区别？
- UNION 和 UNION ALL 有什么区别？
- COUNT(\*)、COUNT(1)、COUNT(列名) 有什么区别？
- 子查询和 JOIN 应该如何选择？
- GROUP BY 后为什么只能选择分组列或聚合结果？
- 分页查询有哪些常见写法？
- UPDATE 和 DELETE 为什么一定要谨慎带过滤条件？
- SQL 题应该如何根据表关系拆解？

## 相关专题

- [数据库知识体系](../)
- [MySQL 专题](../mysql/)
- [高性能系统知识体系](../../high-performance/)
- [常见 SQL 优化手段总结](../../high-performance/sql-optimization.md)

<!-- @include: @article-footer.snippet.md -->
