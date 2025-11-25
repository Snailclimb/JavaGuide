---
title: Must-read classic database books
category: computer books
icon: "database"
head:
  - - meta
    - name: keywords
      content: Selection of database books
---

## Database basics

Regarding the basics of databases, if you think the books are boring and you can't persevere, I recommend you to watch some good videos first, such as ["Principles of Database Systems"] by Beijing Normal University (https://www.icourse163.org/cours e/BNU-1002842007) and Harbin Institute of Technology's ["Database System (Part 2): Management and Technology"] (https://www.icourse163.org/course/HIT-1001578001) are very good.

["Database System Principles"](https://www.icourse163.org/course/BNU-1002842007) The teacher of this course teaches in great detail, and the assignments in each section are designed to fit the knowledge taught, and there are many supporting experiments later.

![](https://oss.javaguide.cn/github/javaguide/books/up-e113c726a41874ef5fb19f7ac14e38e16ce.png)

If you prefer hands-on work and are resistant to theoretical knowledge, I recommend you take a look at ["How to develop a simple database"](https://cstack.github.io/db_tutorial/). This project will teach you step by step how to write a simple database.

![](https://oss.javaguide.cn/github/javaguide/books/up-11de8cb239aa7201cc8d78fa28928b9ec7d.png)

There is also a big guy on GitHub who has implemented a simple database using Java. The introduction is quite detailed. Interested friends can check it out. Address: [https://github.com/alchemystar/Freedom](https://github.com/alchemystar/Freedom).

In addition to this one written in Java, **[db_tutorial](https://github.com/cstack/db_tutorial)** This project was written in C language by a foreign boss. Friends can also take a look.

**As long as you make good use of search engines, you can find database toys implemented in various languages. **

![](https://oss.javaguide.cn/github/javaguide/books/up-d32d853f847633ac7ed0efdecf56be1f1d2.png)

**Learning on paper will eventually make you realize it is shallow. You must know that you have to do this! It is highly recommended that CS majors must practice more! ! ! **

### "Database System Concepts"

["Database System Concepts"](https://book.douban.com/subject/10548379/) This book covers a complete set of concepts of database systems, with a clear knowledge system. It is a very classic textbook for learning database systems! Not a reference book!

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409150441742.png)

### "Database System Implementation"

If you also want to study the underlying principles of MySQL, I recommend that you read ["Database System Implementation"](https://book.douban.com/subject/4838430/) first.

![](https://oss.javaguide.cn/github/javaguide/books/database-system-implementation.png)

Whether it is MySQL or Oracle, their overall framework is similar. The difference is in their internal implementation, such as the data structure of the database index, the implementation of the storage engine, etc.

The translation of this book is still poor in some places. If you can read the English version, it is recommended to start with the English version.

"Database System Implementation" is a textbook from Stanford, and there is also a "Basic Tutorial on Database Systems" (https://book.douban.com/subject/3923575/) which is a prerequisite course that can get you started with databases.

##MySQL

The data of our website or APP requires the use of a database to store data.

In general enterprise project development, MySQL is often used. If you want to learn MySQL, you can read the following 3 books:

- **["MySQL Must Know"](https://book.douban.com/subject/3354490/)**: Very thin! It is very suitable for newbies to MySQL and is a great introductory textbook.
- **["High-Performance MySQL"](https://book.douban.com/subject/23008813/)**: A classic in the MySQL field! A must-read for learning MySQL! It is advanced content and mainly teaches you how to use MySQL better. There is both theory and practice! If you don’t have time to read them all, I suggest you read Chapter 5 (Creating high-performance indexes) and Chapter 6 (Query performance optimization) carefully.
- **["MySQL Technology Insider"](https://book.douban.com/subject/24708143/)**: If you want to learn more about the MySQL storage engine, this is the right book to read!

![](https://oss.javaguide.cn/github/javaguide/books/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

For videos, you can check out Power Node’s ["MySQL Database Tutorial Video"](https://www.bilibili.com/video/BV1fx411X7BD). This video basically introduces some introductory knowledge related to MySQL.

In addition, I strongly recommend **["How MySQL works"](https://book.douban.com/subject/35231266/)** This book, the content is very suitable for preparing for interviews. It's very detailed, but not boring, and the content is very conscientious!

![](https://oss.javaguide.cn/github/javaguide/csdn/20210703120643370.png)

## PostgreSQL

Like MySQL, PostgreSQL is an open source, free and powerful relational database. PostgreSQL's Slogan is "**The world's most advanced open source relational database**".

![](https://oss.javaguide.cn/github/javaguide/books/image-20220702144954370.png)

In recent years, due to the excellent new features of PostgreSQL, more and more projects use PostgreSQL instead of MySQL.

If you are still wondering whether to try PostgreSQL, I suggest you take a look at this Zhihu topic: [What are the advantages of PostgreSQL compared with MySQL? - Zhihu](https://www.zhihu.com/question/20010554).

### "PostgreSQL Guide: Insider Exploration"

["PostgreSQL Guide: Insider Exploration"](https://book.douban.com/subject/33477094/) This book mainly introduces the internal working principles of PostgreSQL, including the logical organization and physical implementation of database objects, and the architecture of processes and memory.

When I first started working, I needed to use PostgreSQL. After reading about 1/3 of the content, I felt pretty good.

![](https://oss.javaguide.cn/github/javaguide/books/PostgreSQL-Guide.png)

### "PostgreSQL Technology Insider: In-depth Exploration of Query Optimization"

["PostgreSQL Technology Insider: In-depth Exploration of Query Optimization"](https://book.douban.com/subject/30256561/) This book mainly talks about some technical implementation details of PostgreSQL's query optimization, which can give you a deep understanding of PostgreSQL's query optimizer.

!["PostgreSQL Technology Insider: In-depth exploration of query optimization"](https://oss.javaguide.cn/github/javaguide/books/PostgreSQL-TechnologyInsider.png)

## Redis

**Redis is a database developed using C language**, but unlike traditional databases, **Redis data is stored in memory**, that is, it is an in-memory database, so the read and write speed is very fast, so Redis is widely used in the cache direction.

If you want to learn Redis, I highly recommend the following two books:- ["Redis Design and Implementation"](https://book.douban.com/subject/25900156/): Mainly content related to Redis theoretical knowledge, relatively comprehensive. I wrote an article before ["7 years ago, at the age of 24, published a Redis Divine Book》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247507030&idx=1&sn=0a5fd669413991b30163ab6f5834a4ad&chksm=cea19 39df9d61a8b93925fae92f4cee0838c449534e60731cfaf533369831192e296780b32a6&token=709354671&lang=zh_CN&scene=21#wechat_redirect) Let me introduce this book.
- ["Redis Core Principles and Practices"](https://book.douban.com/subject/26612779/): Mainly combines source code to analyze important knowledge points of Redis, such as various data structures and advanced features.

!["Redis Design and Implementation" and "Redis Design and Implementation"](https://oss.javaguide.cn/github/javaguide/books/redis-books.png)

In addition, ["Redis Development and Operation and Maintenance"](https://book.douban.com/subject/26971561/) is also a very good book. It not only provides a basic introduction, but also shares front-line development and operation and maintenance experience.

!["Redis Development and Operation and Maintenance"](https://oss.javaguide.cn/github/javaguide/books/redis-kaifa-yu-yunwei.png)