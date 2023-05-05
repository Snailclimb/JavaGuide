---
title: NoSQL基础知识总结
category: 数据库
tag:
  - NoSQL
  - MongoDB
  - Redis
---

## NoSQL 是什么？

NoSQL（Not Only SQL 的缩写）泛指非关系型的数据库，主要针对的是键值、文档以及图形类型数据存储。并且，NoSQL 数据库天生支持分布式，数据冗余和数据分片等特性，旨在提供可扩展的高可用高性能数据存储解决方案。

一个常见的误解是 NoSQL 数据库或非关系型数据库不能很好地存储关系型数据。NoSQL 数据库可以存储关系型数据—它们与关系型数据库的存储方式不同。

NoSQL 数据库代表：HBase、Cassandra、MongoDB、Redis。

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/sql-nosql-tushi.png)

## SQL 和 NoSQL 有什么区别？

|              | SQL 数据库                                                                 | NoSQL 数据库                                                                                                                            |
| :----------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 数据存储模型 | 结构化存储，具有固定行和列的表格                                           | 非结构化存储。文档：JSON 文档，键值：键值对，宽列：包含行和动态列的表，图：节点和边                                                     |
| 发展历程     | 开发于 1970 年代，重点是减少数据重复                                       | 开发于 2000 年代后期，重点是提升可扩展性，减少大规模数据的存储成本                                                                      |
| 例子         | Oracle、MySQL、Microsoft SQL Server、PostgreSQL                            | 文档：MongoDB、CouchDB，键值：Redis、DynamoDB，宽列：Cassandra、 HBase，图表：Neo4j、 Amazon Neptune、Giraph                            |
| ACID 属性    | 提供原子性、一致性、隔离性和持久性 (ACID) 属性                             | 通常不支持 ACID 事务，为了可扩展、高性能进行了权衡，少部分支持比如 MongoDB 。不过，MongoDB 对 ACID 事务 的支持和 MySQL 还是有所区别的。 |
| 性能         | 性能通常取决于磁盘子系统。要获得最佳性能，通常需要优化查询、索引和表结构。 | 性能通常由底层硬件集群大小、网络延迟以及调用应用程序来决定。                                                                            |
| 扩展         | 垂直（使用性能更强大的服务器进行扩展）、读写分离、分库分表                 | 横向（增加服务器的方式横向扩展，通常是基于分片机制）                                                                                    |
| 用途         | 普通企业级的项目的数据存储                                                 | 用途广泛比如图数据库支持分析和遍历连接数据之间的关系、键值数据库可以处理大量数据扩展和极高的状态变化                                    |
| 查询语法     | 结构化查询语言 (SQL)                                                       | 数据访问语法可能因数据库而异                                                                                                            |

## NoSQL 数据库有什么优势？

NoSQL 数据库非常适合许多现代应用程序，例如移动、Web 和游戏等应用程序，它们需要灵活、可扩展、高性能和功能强大的数据库以提供卓越的用户体验。

- **灵活性：** NoSQL 数据库通常提供灵活的架构，以实现更快速、更多的迭代开发。灵活的数据模型使 NoSQL 数据库成为半结构化和非结构化数据的理想之选。
- **可扩展性：** NoSQL 数据库通常被设计为通过使用分布式硬件集群来横向扩展，而不是通过添加昂贵和强大的服务器来纵向扩展。
- **高性能：** NoSQL 数据库针对特定的数据模型和访问模式进行了优化，这与尝试使用关系数据库完成类似功能相比可实现更高的性能。
- **强大的功能：** NoSQL 数据库提供功能强大的 API 和数据类型，专门针对其各自的数据模型而构建。

## NoSQL 数据库有哪些类型？

NoSQL 数据库主要可以分为下面四种类型：

- **键值**：键值数据库是一种较简单的数据库，其中每个项目都包含键和值。这是极为灵活的 NoSQL 数据库类型，因为应用可以完全控制 value 字段中存储的内容，没有任何限制。Redis 和 DynanoDB 是两款非常流行的键值数据库。
- **文档**：文档数据库中的数据被存储在类似于 JSON（JavaScript 对象表示法）对象的文档中，非常清晰直观。每个文档包含成对的字段和值。这些值通常可以是各种类型，包括字符串、数字、布尔值、数组或对象等，并且它们的结构通常与开发者在代码中使用的对象保持一致。MongoDB 就是一款非常流行的文档数据库。
- **图形**：图形数据库旨在轻松构建和运行与高度连接的数据集一起使用的应用程序。图形数据库的典型使用案例包括社交网络、推荐引擎、欺诈检测和知识图形。Neo4j 和 Giraph 是两款非常流行的图形数据库。
- **宽列**：宽列存储数据库非常适合需要存储大量的数据。Cassandra 和 HBase 是两款非常流行的宽列存储数据库。

下面这张图片来源于 [微软的官方文档 | 关系数据与 NoSQL 数据](https://learn.microsoft.com/en-us/dotnet/architecture/cloud-native/relational-vs-nosql-data)。

![NoSQL 数据模型](https://oss.javaguide.cn/github/javaguide/database/mongodb/types-of-nosql-datastores.png)

## 参考

- NoSQL 是什么？- MongoDB 官方文档：<https://www.mongodb.com/zh-cn/nosql-explained>
- 什么是 NoSQL? - AWS：<https://aws.amazon.com/cn/nosql/>
- NoSQL vs. SQL Databases - MongoDB 官方文档：<https://www.mongodb.com/zh-cn/nosql-explained/nosql-vs-sql>
