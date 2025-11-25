---
title: MySQL execution plan analysis
category: database
tag:
  -MySQL
head:
  - - meta
    - name: keywords
      content: MySQL basics, MySQL execution plan, EXPLAIN, query optimizer
  - - meta
    - name: description
      content: Execution plan refers to the specific execution method of a SQL statement after being optimized by the MySQL query optimizer. The first step in optimizing SQL should be to understand the execution plan of SQL.
---

> This article comes from the official MySQL technology, and JavaGuide has supplemented and improved it. Original address: <https://mp.weixin.qq.com/s/d5OowNLtXBGEAbT31sSH4g>

The first step in optimizing SQL should be to understand the execution plan of SQL. In this article, let’s learn about MySQL `EXPLAIN` execution plan.

## What is an execution plan?

**Execution plan** refers to the specific execution method of a SQL statement after being optimized by **MySQL Query Optimizer**.

Execution plans are usually used in SQL performance analysis, optimization and other scenarios. Through the results of `EXPLAIN`, you can learn information such as the query sequence of the data table, the operation type of the data query operation, which indexes can be hit, which indexes will actually be hit, how many rows of records in each data table are queried, etc.

## How to get the execution plan?

MySQL provides us with the `EXPLAIN` command to obtain information about the execution plan.

It should be noted that the `EXPLAIN` statement does not actually execute the relevant statements. Instead, it analyzes the statements through the query optimizer to find the optimal query plan and displays the corresponding information.

The `EXPLAIN` execution plan supports `SELECT`, `DELETE`, `INSERT`, `REPLACE` and `UPDATE` statements. We usually use it to analyze `SELECT` query statements. It is very simple to use. The syntax is as follows:

```sql
EXPLAIN + SELECT query statement;
```

Let’s briefly look at the execution plan of the next query statement:

```sql
mysql> explain SELECT * FROM dept_emp WHERE emp_no IN (SELECT emp_no FROM dept_emp GROUP BY emp_no HAVING COUNT(emp_no)>1);
+----+-------------+----------+------------+-------+------------------+----------+----------+------+--------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra |
+----+-------------+----------+------------+-------+------------------+----------+----------+------+--------+----------+-------------+
| 1 | PRIMARY | dept_emp | NULL | ALL | NULL | NULL | NULL | NULL | 331143 | 100.00 | Using where |
| 2 | SUBQUERY | dept_emp | NULL | index | PRIMARY,dept_no | PRIMARY | 16 | NULL | 331143 | 100.00 | Using index |
+----+-------------+----------+------------+-------+------------------+----------+----------+------+--------+----------+-------------+
```

As you can see, there are 12 columns in the execution plan results. The meaning of each column is summarized in the following table:

| **Column Name** | **Meaning** |
|------------- | ----------------------------------------------- |
| id | The sequence identifier of the SELECT query |
| select_type | The query type corresponding to the SELECT keyword |
| table | table name used |
| partitions | Matching partitions, or NULL for unpartitioned tables |
| type | table access method |
| possible_keys | Possible indexes |
| key | the actual index used |
| key_len | The length of the selected index |
| ref | When using an index equivalent query, the column or constant to compare with the index |
| rows | The expected number of rows to read |
| filtered | Percentage of retained records after filtering by table conditions |
| Extra | Additional Information |

## How to analyze EXPLAIN results?

In order to analyze the execution results of the `EXPLAIN` statement, we need to understand the important fields in the execution plan.

###id

`SELECT` identifier, used to identify the execution order of each `SELECT` statement.

If the ids are the same, execute them in order from top to bottom. The id is different. The larger the id value, the higher the execution priority. If the row refers to the union result of other rows, the value can be NULL.

### select_type

The type of query is mainly used to distinguish between ordinary queries, joint queries, subqueries and other complex queries. Common values ​​are:

- **SIMPLE**: Simple query, does not contain UNION or subquery.
- **PRIMARY**: If the query contains subqueries or other parts, the outer SELECT will be marked as PRIMARY.
- **SUBQUERY**: The first SELECT in a subquery.
- **UNION**: In the UNION statement, SELECT that appears after UNION.
- **DERIVED**: Subqueries appearing in FROM will be marked as DERIVED.
- **UNION RESULT**: The result of UNION query.

### table

Each row has a corresponding table name for the table name used in the query. In addition to the normal table, the table name may also be the following values:

- **`<unionM,N>`**: This line refers to the UNION result of the lines with id M and N;
- **`<derivedN>`**: This line refers to the derived table result generated by the table with id N. Derived tables may be generated from subqueries in the FROM statement.
- **`<subqueryN>`**: This line refers to the materialized subquery results generated by the table with id N.

### type (important)

The type of query execution, describes how the query is executed. The order of all values from best to worst is:

system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL

The specific meanings of several common types are as follows:

- **system**: If the engine used by the table is accurate for table row count statistics (such as MyISAM), and there is only one row of records in the table, the access method is system, which is a special case of const.
- **const**: There is at most one row of matching records in the table, which can be found in one query. It is often used to use all fields of the primary key or unique index as query conditions.
- **eq_ref**: When querying connected tables, the rows of the previous table have only one corresponding row in the current table. It is the best join method besides system and const. It is often used to use all fields of the primary key or unique index as the join condition.
- **ref**: Use ordinary indexes as query conditions, and the query results may find multiple rows that meet the conditions.
- **index_merge**: When the query condition uses multiple indexes, it means that Index Merge optimization is turned on. At this time, the key column in the execution plan lists the indexes used.
- **range**: Perform a range query on the index column. The key column in the execution plan indicates which index is used.- **index**: The query traverses the entire index tree, similar to ALL, except that it scans the index, which is generally in memory and is faster.
- **ALL**: Full table scan.

### possible_keys

The possible_keys column represents the indexes that MySQL may use when executing the query. If this column is NULL, it means that there is no index that may be used; in this case, you need to check the columns used in the WHERE statement to see if query performance can be improved by adding an index to one or more of these columns.

### key (important)

The key column represents the index actually used by MySQL. If NULL, the index is not used.

### key_len

The key_len column represents the maximum length of the index actually used by MySQL; when a joint index is used, it may be the sum of the lengths of multiple columns. The shorter it is, the better if it meets your needs. If the key column displays NULL , the key_len column also displays NULL .

### rows

The rows column indicates a rough estimate of the number of rows that need to be found or read based on table statistics and selection. The smaller the value, the better.

### Extra (Important)

This column contains additional information about MySQL parsing the query. Through this information, you can more accurately understand how MySQL executes the query. Common values are as follows:

- **Using filesort**: External index sorting is used during sorting, and in-table index is not used for sorting.
- **Using temporary**: MySQL needs to create a temporary table to store the results of the query, which is common in ORDER BY and GROUP BY.
- **Using index**: Indicates that the query uses a covering index, without returning the table, and the query efficiency is very high.
- **Using index condition**: Indicates that the query optimizer chooses to use the index condition push-down feature.
- **Using where**: Indicates that the query uses the WHERE clause for conditional filtering. This usually occurs when the index is not used.
- **Using join buffer (Block Nested Loop)**: The method of joining table query, which means that when the driven table does not use an index, MySQL will first read out the driving table and put it into the join buffer, and then traverse the driven table and driving table for query.

As a reminder, when the Extra column contains Using filesort or Using temporary, MySQL performance may have problems and needs to be avoided as much as possible.

## Reference

- <https://dev.mysql.com/doc/refman/5.7/en/explain-output.html>
- <https://juejin.cn/post/6953444668973514789>

<!-- @include: @article-footer.snippet.md -->