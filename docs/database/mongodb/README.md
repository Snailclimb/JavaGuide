---
title: MongoDB 专题：文档模型、索引、副本集、分片、事务与常见面试题
description: MongoDB 面试与 NoSQL 学习路线，涵盖文档模型、集合、索引、副本集、分片、事务、聚合、读写关注、存储引擎和常见面试题。
category: 数据库
tag:
  - MongoDB
  - NoSQL
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.85
head:
  - - meta
    - name: keywords
      content: MongoDB,MongoDB面试题,NoSQL,文档数据库,MongoDB索引,副本集,分片,聚合,事务,后端面试
---

MongoDB 是典型的文档数据库，适合半结构化数据、灵活字段模型和快速迭代的业务场景。学习 MongoDB 时，建议重点理解文档模型、索引、副本集、分片、聚合和事务能力，而不是把它简单看成“可以存 JSON 的数据库”。

## 适合谁看

- 想了解 MongoDB 和文档数据库核心概念的后端开发者。
- 准备 MongoDB、NoSQL、文档模型相关面试题的同学。
- 需要在关系型数据库和文档数据库之间做选型的工程师。
- 已经接触过 MongoDB，但对索引、副本集、分片和事务机制不够熟的读者。

## 学习重点

- MongoDB 的数据库、集合、文档和关系型数据库中的库、表、行有什么差异？
- 文档模型适合哪些数据结构，什么时候不适合用 MongoDB？
- MongoDB 索引、聚合管道、副本集和分片分别解决什么问题？
- read concern、write concern、事务和一致性语义如何理解？
- 面试中如何从“模型、查询、索引、高可用、扩展性、适用场景”回答 MongoDB 问题？

## 建议阅读顺序

1. [NoSQL 基础常见面试题总结](../nosql.md)：先理解 NoSQL 分类、适用场景和与关系型数据库的差异。
2. [MongoDB 常见面试题总结（上）](./mongodb-questions-01.md)：学习 MongoDB 基础概念、文档模型、索引和查询。
3. [MongoDB 常见面试题总结（下）](./mongodb-questions-02.md)：继续理解副本集、分片、事务、聚合和生产实践。
4. 再回到 [数据库知识体系](../)，把 MongoDB 与 MySQL、Redis、Elasticsearch 的定位放在一起比较。

## 核心文章

- [MongoDB 常见面试题总结（上）](./mongodb-questions-01.md)：覆盖 MongoDB 基础概念、文档模型、集合、查询、索引和常见使用问题。
- [MongoDB 常见面试题总结（下）](./mongodb-questions-02.md)：覆盖副本集、分片、事务、聚合、读写关注、存储引擎和生产实践。
- [NoSQL 基础常见面试题总结](../nosql.md)：帮助理解 MongoDB 在 NoSQL 体系中的定位，以及与键值、列族、图数据库的区别。

## 高频问题

- MongoDB 和 MySQL 有什么区别？
- MongoDB 的文档模型适合哪些业务场景？
- MongoDB 索引有哪些类型？如何设计索引？
- MongoDB 副本集如何保证高可用？
- MongoDB 分片解决什么问题？分片键如何选择？
- MongoDB 支持事务吗？适合复杂事务场景吗？
- MongoDB 的聚合管道适合解决哪些问题？
- read concern 和 write concern 分别控制什么？
- 什么场景不适合使用 MongoDB？
- MongoDB、Redis、Elasticsearch 的定位有什么区别？

## 相关专题

- [数据库知识体系](../)
- [NoSQL 基础常见面试题总结](../nosql.md)
- [MySQL 专题](../mysql/)
- [Redis 专题](../redis/)

<!-- @include: @article-footer.snippet.md -->
