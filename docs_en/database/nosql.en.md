---
title: Summary of NoSQL basic knowledge
category: database
tag:
  - NoSQL
  - MongoDB
  - Redis
head:
  - - meta
    - name: keywords
      content: NoSQL, key-value, document, column family, graph database, distributed, scalability, data model
  - - meta
    - name: description
      content: Summarizes the classification and characteristics of NoSQL, compares relational databases, combines distributed and scalable scenarios, and guides model and selection.
---

## What is NoSQL?

NoSQL (abbreviation for Not Only SQL) generally refers to non-relational databases, mainly targeting key-value, document and graph type data storage. Moreover, NoSQL databases inherently support features such as distribution, data redundancy and data sharding, aiming to provide scalable, highly available and high-performance data storage solutions.

A common misconception is that NoSQL databases, or non-relational databases, do not store relational data well. NoSQL databases can store relational data—they store it differently than relational databases do.

NoSQL database representatives: HBase, Cassandra, MongoDB, Redis.

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/sql-nosql-tushi.png)

## What is the difference between SQL and NoSQL?

| | SQL database | NoSQL database |
| :---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Data storage model | Structured storage, tables with fixed rows and columns | Unstructured storage. Document: JSON document, Key-value: key-value pairs, Wide-column: Table with rows and dynamic columns, Graph: Nodes and Edges |
| Development History | Developed in the 1970s with a focus on reducing data duplication | Developed in the late 2000s with a focus on improving scalability and reducing storage costs for large-scale data |
| Examples | Oracle, MySQL, Microsoft SQL Server, PostgreSQL | Documents: MongoDB, CouchDB, Keys: Redis, DynamoDB, Wide columns: Cassandra, HBase, Charts: Neo4j, Amazon Neptune, Giraph |
| ACID properties | Provide atomicity, consistency, isolation, and durability (ACID) properties | Generally do not support ACID transactions, trade-offs are made for scalability and high performance, and a few support such as MongoDB. However, MongoDB's support for ACID transactions is still different from MySQL. |
| Performance | Performance often depends on the disk subsystem. For optimal performance, queries, indexes, and table structures often need to be optimized. | Performance is typically determined by the size of the underlying hardware cluster, network latency, and the calling application.                                                                            |
| Expansion | Vertical (use more powerful servers for expansion), read-write separation, database and table sharding | Horizontal (horizontal expansion by adding servers, usually based on sharding mechanism) |
| Purpose | Data storage for common enterprise-level projects | Wide range of uses, such as graph databases that support analysis and traversal of relationships between connected data, and key-value databases that can handle large amounts of data expansion and extremely high state changes |
| Query syntax | Structured Query Language (SQL) | Data access syntax may vary from database to database |

## What are the advantages of NoSQL databases?

NoSQL databases are ideal for many modern applications, such as mobile, web, and gaming applications, which require flexible, scalable, high-performance, and powerful databases to provide a superior user experience.

- **Flexibility:** NoSQL databases often offer flexible architectures to enable faster, more iterative development. Flexible data models make NoSQL databases ideal for semi-structured and unstructured data.
- **Scalability:** NoSQL databases are typically designed to scale horizontally through the use of distributed hardware clusters, rather than vertically by adding expensive and powerful servers.
- **High Performance:** NoSQL databases are optimized for specific data models and access patterns, which allows for higher performance than trying to accomplish similar functions with relational databases.
- **Powerful Features:** NoSQL databases provide powerful APIs and data types specifically built for their respective data models.

## What types of NoSQL databases are there?

NoSQL databases can be mainly divided into the following four types:

- **Key-value**: A key-value database is a simpler database where each item contains a key and a value. This is an extremely flexible NoSQL database type because the application has complete control over what is stored in the value field without any restrictions. Redis and DynanoDB are two very popular key-value databases.
- **Document**: Data in the document database is stored in documents similar to JSON (JavaScript Object Notation) objects, which is very clear and intuitive. Each document contains pairs of fields and values. These values ​​can typically be of various types, including strings, numbers, Boolean values, arrays, or objects, and their structure is usually consistent with the objects developers use in their code. MongoDB is a very popular document database.
- **Graph**: Graph databases are designed to easily build and run applications that work with highly connected data sets. Typical use cases for graph databases include social networks, recommendation engines, fraud detection, and knowledge graphs. Neo4j and Giraph are two very popular graph databases.
- **Wide Column**: Wide column storage database is very suitable for storing large amounts of data. Cassandra and HBase are two very popular wide column storage databases.

The picture below comes from [Microsoft's official documentation | Relational data and NoSQL data](https://learn.microsoft.com/en-us/dotnet/architecture/cloud-native/relational-vs-nosql-data).

![NoSQL data model](https://oss.javaguide.cn/github/javaguide/database/mongodb/types-of-nosql-datastores.png)

## Reference

- What is NoSQL? - MongoDB official documentation: <https://www.mongodb.com/zh-cn/nosql-explained>
- What is NoSQL? - AWS: <https://aws.amazon.com/cn/nosql/>
- NoSQL vs. SQL Databases - MongoDB official documentation: <https://www.mongodb.com/zh-cn/nosql-explained/nosql-vs-sql>

<!-- @include: @article-footer.snippet.md -->