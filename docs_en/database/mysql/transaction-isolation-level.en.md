---
title: Detailed explanation of MySQL transaction isolation level
category: database
tag:
  -MySQL
head:
  - - meta
    - name: keywords
      content: transaction, isolation level, read uncommitted, read committed, repeatable read, serializable, MVCC, lock
  - - meta
    - name: description
      Content: Sort out the four major transaction isolation levels and concurrency phenomena, combine InnoDB's MVCC and lock mechanism, and clarify the response strategy for phantom reads/non-repeatable reads.
---

> This article was jointly written by [SnailClimb](https://github.com/Snailclimb) and [guang19](https://github.com/guang19).

For an introduction to the basic overview of transactions, please read the introduction of this article: [MySQL common knowledge points & summary of interview questions] (./mysql-questions-01.md#MySQL-Transactions)

## Transaction isolation level summary

The SQL standard defines four transaction isolation levels to balance transaction isolation and concurrency performance. The higher the level, the better the data consistency, but the concurrency performance may be lower. The four levels are:

- **READ-UNCOMMITTED (read uncommitted)**: The lowest isolation level, allowing reading of uncommitted data changes, which may lead to dirty reads, phantom reads, or non-repeatable reads. This level is rarely used in practical applications because its guarantee of data consistency is too weak.
- **READ-COMMITTED (read committed)**: Allows reading of data that has been committed by concurrent transactions, which can prevent dirty reads, but phantom reads or non-repeatable reads may still occur. This is the default isolation level for most databases (such as Oracle, SQL Server).
- **REPEATABLE-READ (repeatable read)**: The results of multiple reads of the same field are consistent, unless the data is modified by the own transaction itself. Dirty reads and non-repeatable reads can be prevented, but phantom reads may still occur. The default isolation level of the MySQL InnoDB storage engine is REPEATABLE READ. Moreover, InnoDB solves the phantom read problem to a large extent through the MVCC (Multi-version Concurrency Control) and Next-Key Locks (gap lock + row lock) mechanisms at this level.
- **SERIALIZABLE**: The highest isolation level, fully compliant with ACID isolation level. All transactions are executed one after another in order, so that there is no possibility of interference between transactions. In other words, this level can prevent dirty reads, non-repeatable reads and phantom reads.

| Isolation level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---------------- | ------------------ | ---------------------------------- | ----------------------- |
| READ UNCOMMITTED | √ | √ | √ |
| READ COMMITTED | × | √ | √ |
| REPEATABLE READ | × | × | √ (Standard) / ≈× (InnoDB) |
| SERIALIZABLE | × | × | × |

**Default level query:**

The default isolation level for the MySQL InnoDB storage engine is **REPEATABLE READ**. You can view it with the following command:

- Before MySQL 8.0: `SELECT @@tx_isolation;`
- MySQL 8.0 and later: `SELECT @@transaction_isolation;`

```bash
mysql> SELECT @@transaction_isolation;
+------------------------+
| @@transaction_isolation |
+------------------------+
| REPEATABLE-READ |
+------------------------+
```

**InnoDB's REPEATABLE READ handles phantom reads:**

In the standard SQL isolation level definition, REPEATABLE READ cannot prevent phantom reads. However, the implementation of InnoDB largely avoids phantom reads through the following mechanisms:

- **Snapshot Read**: Ordinary SELECT statement, implemented through the **MVCC** mechanism. A data snapshot is created when a transaction starts, and subsequent snapshot reads read this version of the data, thereby avoiding seeing newly inserted rows (phantom reads) or modified rows (non-repeatable reads) by other transactions.
- **Current Read**: Operations like `SELECT ... FOR UPDATE`, `SELECT ... LOCK IN SHARE MODE`, `INSERT`, `UPDATE`, `DELETE`. InnoDB uses **Next-Key Lock** to lock the scanned index records and the range (gap) between them to prevent other transactions from inserting new records in this range, thereby avoiding phantom reads. Next-Key Lock is a combination of Record Lock and Gap Lock.

It is worth noting that although it is generally believed that the higher the isolation level, the worse the concurrency, but the InnoDB storage engine optimizes the REPEATABLE READ level through the MVCC mechanism. For many common read-only or read-more-write-less scenarios, there may not be a significant performance difference compared to READ COMMITTED. However, in write-intensive scenarios with high concurrency conflicts, RR's gap lock mechanism may cause more lock waits than RC.

In addition, in some specific scenarios, such as distributed transactions that require strict consistency (XA Transactions), InnoDB may require or recommend the use of SERIALIZABLE isolation level to ensure the consistency of global data.

Chapter 7.7 of "MySQL Technology Insider: InnoDB Storage Engine (2nd Edition)" reads:

> The InnoDB storage engine provides support for XA transactions and supports the implementation of distributed transactions through XA transactions. Distributed transactions refer to allowing multiple independent transactional resources to participate in a global transaction. Transactional resources are typically relational database systems, but can be other types of resources. Global transactions require all participating transactions to either commit or roll back, which improves the original ACID requirements for transactions. In addition, when using distributed transactions, the transaction isolation level of the InnoDB storage engine must be set to SERIALIZABLE.

## Actual situation demonstration

Below I will use two command lines MySQL to simulate the problem of dirty reading of the same data by multiple threads (multiple transactions).

In the default configuration of the MySQL command line, transactions are automatically committed, that is, the COMMIT operation will be performed immediately after executing the SQL statement. If you want to explicitly start a transaction, you need to use the command: `START TRANSACTION`.

We can set the isolation level with the following command.

```sql
SET [SESSION|GLOBAL] TRANSACTION ISOLATION LEVEL [READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE]
```

Let’s take a look at some of the concurrency control statements we use in the following actual operations:

- `START TRANSACTION` |`BEGIN`: Explicitly start a transaction.
- `COMMIT`: Commits the transaction, making all modifications to the database permanent.
- `ROLLBACK`: Rollback ends the user's transaction and undoes all uncommitted modifications in progress.

### Dirty read (read uncommitted)

![](<https://oss.javaguide.cn/github/javaguide/2019-31-1%E8%84%8F%E8%AF%BB(%E8%AF%BB%E6%9C%AA%E6%8F%90%E4%BA%A4)%E5%AE%9E%E4%BE%8B.jpg>)

### Avoid dirty reads (read committed)

![](https://oss.javaguide.cn/github/javaguide/2019-31-2%E8%AF%BB%E5%B7%B2%E6%8F%90%E4%BA%A4%E5%AE%9E%E4%BE%8B.jpg)

### Non-repeatable read

It is still the same as the read committed picture above. Although it avoids reading uncommitted, the non-repeatable read problem occurs before a transaction is completed.

![](https://oss.javaguide.cn/github/javaguide/2019-32-1%E4%B8%8D%E5%8F%AF%E9%87%8D%E5%A4%8D%E8%AF%BB%E5%AE%9E%E4%BE%8B.jpg)

### Repeatable read![](https://oss.javaguide.cn/github/javaguide/2019-33-2%E5%8F%AF%E9%87%8D%E5%A4%8D%E8%AF%BB.jpg)

### Phantom reading

#### Demonstrate the occurrence of phantom reading

![](https://oss.javaguide.cn/github/javaguide/phantom_read.png)

When SQL Script 1 queries for the first time, there is only one record with a salary of 500. SQL Script 2 inserts a record with a salary of 500. After submission, SQL Script 1 uses the current read query again in the same transaction and finds that there are two records with a salary of 500. This is a phantom read.

#### How to solve phantom reading

There are many ways to solve phantom reads, but their core idea is that when one transaction is operating data in a certain table, another transaction is not allowed to add or delete data in this table. The main ways to solve phantom reading are as follows:

1. Adjust the transaction isolation level to `SERIALIZABLE`.
2. At the repeatable read transaction level, add a table lock to the table in the transaction operation.
3. Under the transaction level of repeatable read, add `Next-key Lock (Record Lock+Gap Lock)` to the table of transaction operation.

### Reference

- "MySQL Technology Insider: InnoDB Storage Engine"
- <https://dev.MySQL.com/doc/refman/5.7/en/>
- [Mysql Lock: Seven Questions of the Soul](https://tech.youzan.com/seven-questions-about-the-lock-of-MySQL/)
- [Relationship between transaction isolation level and locks in Innodb](https://tech.meituan.com/2014/08/20/innodb-lock.html)

<!-- @include: @article-footer.snippet.md -->