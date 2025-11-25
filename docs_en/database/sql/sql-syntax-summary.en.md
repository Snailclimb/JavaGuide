---
title: Summary of basic knowledge of SQL syntax
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL syntax, DDL, DML, DQL, constraints, transactions, indexes, paradigms
  - - meta
    - name: description
      content: Systematically organizes basic SQL syntax and terminology, covering DDL/DML/DQL, constraints and transaction indexes, forming a knowledge path from entry to practice.
---

> This article is compiled and improved from the following two materials:
>
> - [SQL Syntax Quick Manual](https://juejin.cn/post/6844903790571700231)
> - [MySQL Super Complete Tutorial](https://www.begtut.com/mysql/mysql-tutorial.html)

## Basic concepts

### Database terminology

- `database` - A container (usually a file or set of files) that holds organized data.
- `table` - a structured list of data of a specific type.
- `schema` - information about the layout and properties of databases and tables. The schema defines how data is stored in the table, including what kind of data is stored, how the data is decomposed, how each part of the information is named, and other information. Both databases and tables have schemas.
- `column` – a field in a table. All tables are composed of one or more columns.
- `row(row)` - a record in the table.
- `primary key` - a column (or set of columns) whose value uniquely identifies each row in a table.

### SQL syntax

SQL (Structured Query Language), standard SQL is managed by the ANSI Standards Committee, so it is called ANSI SQL. Each DBMS has its own implementation, such as PL/SQL, Transact-SQL, etc.

#### SQL syntax structure

![](https://oss.javaguide.cn/p3-juejin/cb684d4c75fc430e92aaee226069c7da~tplv-k3u1fbpfcp-zoom-1.png)

SQL syntax structures include:

- **`clause`** - is the component of statements and queries. (In some cases, these are optional.)
- **`expression`** - can produce any scalar value, or a database table consisting of columns and rows
- **`Predicate`** - Specify conditions for SQL three-valued logic (3VL) (true/false/unknown) or Boolean truth values that need to be evaluated, and limit the effects of statements and queries, or change program flow.
- **`Query`** - Retrieve data based on specific criteria. This is an important part of SQL.
- **`Statement`** - Can permanently affect the schema and data, and can also control database transactions, program flow, connections, sessions, or diagnostics.

#### SQL syntax points

- **SQL statements are not case-sensitive**, but whether database table names, column names and values are distinguished depends on the specific DBMS and configuration. For example: `SELECT` is the same as `select`, `Select`.
- **Multiple SQL statements must be separated by semicolons (`;`)**.
- **All spaces are ignored** when processing SQL statements.

SQL statements can be written in one line or divided into multiple lines.

```sql
-- One line of SQL statement

UPDATE user SET username='robot', password='robot' WHERE username = 'root';

--Multi-line SQL statement
UPDATE user
SET username='robot', password='robot'
WHERE username = 'root';
```

SQL supports three types of comments:

```sql
## Note 1
-- Note 2
/* Note 3 */
```

### SQL Classification

#### Data Definition Language (DDL)

Data Definition Language (DDL) is a language in the SQL language that is responsible for the definition of data structures and database objects.

The main function of DDL is to define database objects.

The core instructions of DDL are `CREATE`, `ALTER`, and `DROP`.

#### Data Manipulation Language (DML)

Data Manipulation Language (DML) is a programming statement used for database operations to access objects and data in the database.

The main function of DML is to **access data**, so its syntax is mainly based on **reading and writing database**.

The core instructions of DML are `INSERT`, `UPDATE`, `DELETE`, and `SELECT`. These four instructions are collectively called CRUD (Create, Read, Update, Delete), which means add, delete, modify, and query.

#### Transaction Control Language (TCL)

Transaction Control Language (TCL) is used to manage transactions in the database. These are used to manage changes made by DML statements. It also allows statements to be grouped into logical transactions.

The core instructions of TCL are `COMMIT` and `ROLLBACK`.

#### Data Control Language (DCL)

Data Control Language (DCL) is an instruction that can control data access rights. It can control the control rights of specific user accounts to database objects such as data tables, view tables, stored procedures, and user-defined functions.

The core instructions of DCL are `GRANT` and `REVOKE`.

DCL mainly focuses on controlling user access rights, so its instruction method is not complicated. The permissions that can be controlled by DCL are: `CONNECT`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXECUTE`, `USAGE`, `REFERENCES`.

Different DBMSs and different security entities support different permission controls.

**Let’s first introduce the usage of DML statements. The main function of DML is to read and write databases to implement additions, deletions, modifications and queries. **

## Add, delete, modify and check

Add, delete, modify, and query, also known as CRUD, is a basic operation in basic database operations.

### Insert data

The `INSERT INTO` statement is used to insert new records into the table.

**INSERT COMPLETE ROW**

```sql
# insert a row
INSERT INTO user
VALUES (10, 'root', 'root', 'xxxx@163.com');
# Insert multiple rows
INSERT INTO user
VALUES (10, 'root', 'root', 'xxxx@163.com'), (12, 'user1', 'user1', 'xxxx@163.com'), (18, 'user2', 'user2', 'xxxx@163.com');
```

**Insert part of row**

```sql
INSERT INTO user(username, password, email)
VALUES ('admin', 'admin', 'xxxx@163.com');
```

**Insert the queried data**

```sql
INSERT INTO user(username)
SELECT name
FROM account;
```

### Update data

The `UPDATE` statement is used to update records in a table.

```sql
UPDATE user
SET username='robot', password='robot'
WHERE username = 'root';
```

### Delete data

- The `DELETE` statement is used to delete records from a table.
- `TRUNCATE TABLE` can clear the table, that is, delete all rows. Explanation: The `TRUNCATE` statement does not belong to DML syntax but DDL syntax.

**Delete specified data in the table**

```sql
DELETE FROM user
WHERE username = 'robot';
```

**Clear the data in the table**

```sql
TRUNCATE TABLE user;
```

### Query data

The `SELECT` statement is used to query data from the database.

`DISTINCT` is used to return uniquely different values. It operates on all columns, which means that all columns must have the same value to be considered the same.

`LIMIT` limits the number of rows returned. It can have two parameters. The first parameter is the starting row, starting from 0; the second parameter is the total number of rows returned.

- `ASC`: ascending order (default)
- `DESC`: descending order

**Query single column**

```sql
SELECT prod_name
FROM products;
```

**Query multiple columns**

```sql
SELECT prod_id, prod_name, prod_price
FROM products;
```

**Query all columns**

```sql
SELECT *
FROM products;
```

**Query for different values**

```sql
SELECT DISTINCT
vend_id FROM products;
```

**Limit query results**

```sql
-- Return the first 5 rows
SELECT * FROM mytable LIMIT 5;
SELECT * FROM mytable LIMIT 0, 5;
-- Return to lines 3 ~ 5
SELECT * FROM mytable LIMIT 2, 3;
```

## Sort`order by` is used to sort the result set by one column or multiple columns. By default, records are sorted in ascending order. If you need to sort records in descending order, you can use the `desc` keyword.

`order by` When sorting multiple columns, the column that is sorted first is placed in front, and the column that is sorted later is placed in the back. Also, different columns can have different sorting rules.

```sql
SELECT * FROM products
ORDER BY prod_price DESC, prod_name ASC;
```

## Grouping

**`group by`**:

- The `group by` clause groups records into summary rows.
- `group by` returns one record for each group.
- `group by` usually also involves aggregating `count`, `max`, `sum`, `avg`, etc.
- `group by` can group by one or more columns.
- `group by` After sorting by group field, `order by` can sort by summary field.

**Group**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name;
```

**Sort after grouping**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name
ORDER BY cust_name DESC;
```

**`having`**:

- `having` is used to filter the aggregated `group by` results.
- `having` is usually used together with `group by`.
- `where` and `having` can be in the same query.

**Filter data using WHERE and HAVING**

```sql
SELECT cust_name, COUNT(*) AS NumberOfOrders
FROM Customers
WHERE cust_email IS NOT NULL
GROUP BY cust_name
HAVING COUNT(*) > 1;
```

**`having` vs `where`**:

- `where`: Filter the specified rows. Aggregation functions (grouping functions) cannot be added later. `where` before `group by`.
- `having`: Filter grouping, usually used in conjunction with `group by` and cannot be used alone. `having` comes after `group by`.

## Subquery

A subquery is a SQL query nested within a larger query, also called an inner query or inner select, and the statement containing the subquery is also called an outer query or outer select. Simply put, a subquery refers to using the result of a `select` query (subquery) as the data source or judgment condition of another SQL statement (main query).

Subqueries can be embedded in `SELECT`, `INSERT`, `UPDATE` and `DELETE` statements, and can also be used with operators such as `=`, `<`, `>`, `IN`, `BETWEEN`, `EXISTS` and other operators.

Subqueries are often used after the `WHERE` clause and the `FROM` clause:

- When used in the `WHERE` clause, depending on different operators, the subquery can return a single row and a single column, multiple rows and a single column, or a single row and multiple columns of data. The subquery is to return a value that can be used as the query condition of the `WHERE` clause.
- When used in the `FROM` clause, multi-row and multi-column data is generally returned, which is equivalent to returning a temporary table, so as to comply with the rule that `FROM` is followed by a table. This approach can implement joint queries on multiple tables.

> Note: MYSQL database only supports subqueries from version 4.1, and earlier versions do not support it.

The basic syntax of a subquery for a `WHERE` clause is as follows:

```sql
select column_name [, column_name ]
from table1 [, table2 ]
where column_name operator
    (select column_name [, column_name ]
    from table1 [, table2 ]
    [where])
```

- Subqueries need to be placed within brackets `( )`.
- `operator` represents the operator used in the where clause.

The basic syntax of a subquery for a `FROM` clause is as follows:

```sql
select column_name [, column_name ]
from (select column_name [, column_name ]
      from table1 [, table2 ]
      [where]) as temp_table_name
where condition
```

The result returned by the subquery for `FROM` is equivalent to a temporary table, so you need to use the AS keyword to give the temporary table a name.

**Subquery of subqueries**

```sql
SELECT cust_name, cust_contact
FROM customers
WHERE cust_id IN (SELECT cust_id
                  FROM orders
                  WHERE order_num IN (SELECT order_num
                                      FROM orderitems
                                      WHERE prod_id = 'RGAN01'));
```

The inner query is executed first before its parent query so that the results of the inner query can be passed to the outer query. You can refer to the following figure for the execution process:

![](https://oss.javaguide.cn/p3-juejin/c439da1f5d4e4b00bdfa4316b933d764~tplv-k3u1fbpfcp-zoom-1.png)

### WHERE

- The `WHERE` clause is used to filter records, that is, to narrow the scope of accessed data.
- `WHERE` followed by a condition that returns `true` or `false`.
- `WHERE` can be used with `SELECT`, `UPDATE` and `DELETE`.
- Operators that can be used in the `WHERE` clause.

| Operator | Description |
| ------- | ------------------------------------------------------- |
| = | equals |
| <> | is not equal to. Note: In some versions of SQL, this operator can be written as != |
| > | greater than |
| < | less than |
| >= | Greater than or equal to |
| <= | Less than or equal to |
| BETWEEN | Within a range |
| LIKE | Search for a pattern |
| IN | Specifies multiple possible values for a column |

**The `WHERE` clause in the `SELECT` statement**

```ini
SELECT * FROM Customers
WHERE cust_name = 'Kids Place';
```

**The `WHERE` clause in the `UPDATE` statement**

```ini
UPDATECustomers
SET cust_name = 'Jack Jones'
WHERE cust_name = 'Kids Place';
```

**The `WHERE` clause in the `DELETE` statement**

```ini
DELETE FROM Customers
WHERE cust_name = 'Kids Place';
```

### IN AND BETWEEN

- The `IN` operator is used in the `WHERE` clause to select any one of several specified values.
- The `BETWEEN` operator is used in the `WHERE` clause to select values ​​within a certain range.

**IN Example**

```sql
SELECT *
FROM products
WHERE vend_id IN ('DLL01', 'BRS01');
```

**BETWEEN EXAMPLE**

```sql
SELECT *
FROM products
WHERE prod_price BETWEEN 3 AND 5;
```

### AND, OR, NOT- `AND`, `OR`, `NOT` are logical processing instructions for filtering conditions.
- `AND` has higher priority than `OR`. To clarify the processing order, you can use `()`.
- The `AND` operator indicates that both left and right conditions must be met.
- The `OR` operator means that any one of the left and right conditions must be met.
- The `NOT` operator is used to negate a condition.

**AND Example**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' AND prod_price <= 4;
```

**OR Example**

```ini
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' OR vend_id = 'BRS01';
```

**NOT Example**

```sql
SELECT *
FROM products
WHERE prod_price NOT BETWEEN 3 AND 5;
```

### LIKE

- The `LIKE` operator is used in the `WHERE` clause to determine whether a string matches a pattern.
- Use `LIKE` only if the field is a text value.
- `LIKE` supports two wildcard matching options: `%` and `_`.
- Don't abuse wildcards, matching at the beginning will be very slow.
- `%` means any character appearing any number of times.
- `_` means any character appears once.

**% Example**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '%bean bag%';
```

**\_ Example**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '__ inch teddy bear';
```

## Connect

JOIN means "connection". As the name suggests, the SQL JOIN clause is used to join two or more tables for query.

When connecting tables, you need to select a field in each table and compare the values ​​of these fields. Two records with the same value will be merged into one. **The essence of joining tables is to merge records from different tables to form a new table. Of course, this new table is only temporary, it only exists for the duration of this query**.

The basic syntax for joining two tables using `JOIN` is as follows:

```sql
select table1.column1, table2.column2...
from table1
join table2
on table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` is a join condition. Only records that meet this condition will be merged into one row. You can join tables using several operators, such as =, >, <, <>, <=, >=, !=, `between`, `like`, or `not`, but the most common is to use =.

When there are fields with the same name in two tables, in order to help the database engine distinguish the fields of which table, the table name needs to be added when writing the field names with the same name. Of course, if the written field name is unique in the two tables, you can not use the above format and just write the field name.

In addition, if the related field names of the two tables are the same, you can also use the `USING` clause instead of `ON`, for example:

```sql
# join....on
select c.cust_name, o.order_num
from Customers c
inner join Orders o
on c.cust_id = o.cust_id
order by c.cust_name;

# If the associated field names of the two tables are the same, you can also use the USING clause: join....using()
select c.cust_name, o.order_num
from Customers c
inner join Orders o
using(cust_id)
order by c.cust_name;
```

**The difference between `ON` and `WHERE`**:

- When joining tables, SQL will generate a new temporary table based on the join conditions. `ON` is the connection condition, which determines the generation of temporary tables.
- `WHERE` is to filter the data in the temporary table after the temporary table is generated to generate the final result set. At this time, there is no JOIN-ON.

So in summary: **SQL first generates a temporary table based on ON, and then filters the temporary table based on WHERE**.

SQL allows some modifying keywords to be added to the left of `JOIN` to form different types of connections, as shown in the following table:

| Connection type | Description |
|------------------------------------------------ |------------------------------------------------------------------------------------------------ |
| INNER JOIN inner join | (default connection method) Rows will be returned only when there are records that meet the conditions in both tables.                                |
| LEFT JOIN / LEFT OUTER JOIN Left (outer) join | Returns all rows in the left table, even if there are no rows in the right table that meet the condition.                                      |
| RIGHT JOIN / RIGHT OUTER JOIN Right (outer) join | Returns all rows in the right table, even if there are no rows in the left table that meet the condition.                                      |
| FULL JOIN / FULL OUTER JOIN Full (outer) join | As long as one of the tables has records that meet the conditions, rows will be returned.                                                |
| SELF JOIN | Joins a table to itself as if the table were two tables. To differentiate between two tables, at least one table needs to be renamed in the SQL statement. |
| CROSS JOIN | Cross join returns the Cartesian product of record sets from two or more joined tables.                                        |

The figure below shows 7 usages related to LEFT JOIN, RIGHT JOIN, INNER JOIN, and OUTER JOIN.

![](https://oss.javaguide.cn/p3-juejin/701670942f0f45d3a3a2187cd04a12ad~tplv-k3u1fbpfcp-zoom-1.png)

If you just write `JOIN` without adding any modifiers, the default is `INNER JOIN`

For `INNER JOIN`, there is also an implicit way of writing, called "**Implicit inner join**", that is, there is no `INNER JOIN` keyword, and the `WHERE` statement is used to implement the inner join function.

```sql
#Implicit inner join
select c.cust_name, o.order_num
from Customers c, Orders o
where c.cust_id = o.cust_id
order by c.cust_name;

#Explicit inner join
select c.cust_name, o.order_num
from Customers c inner join Orders o
using(cust_id)
order by c.cust_name;
```

## Combination

The `UNION` operator combines the results of two or more queries and produces a result set containing the extracted rows from the participating queries in `UNION`.

`UNION` basic rules:

- The number and order of columns must be the same for all queries.
- The data types of the columns involved in the tables in each query must be the same or compatible.
- Usually the column names returned are taken from the first query.

By default, the `UNION` operator selects distinct values. If duplicate values ​​are allowed, use `UNION ALL`.

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

The column names in the `UNION` result set are always equal to the column names in the first `SELECT` statement in the `UNION`.

`JOIN` vs `UNION`:

- The columns of the joined tables in `JOIN` may be different, but in `UNION` the number and order of columns must be the same for all queries.
- `UNION` puts the rows after the query together (vertically), but `JOIN` puts the columns after the query together (horizontally), i.e. it forms a Cartesian product.

## Function

Functions tend to differ from database to database and are therefore not portable. This section mainly uses MySQL functions as an example.### Text processing

| Function | Description |
| -------------------------- | -------------------------- |
| `LEFT()`, `RIGHT()` | The character on the left or right |
| `LOWER()`, `UPPER()` | Convert to lowercase or uppercase |
| `LTRIM()`, `RTRIM()` | Remove spaces on the left or right side |
| `LENGTH()` | Length in bytes |
| `SOUNDEX()` | Convert to speech value |

Among them, **`SOUNDEX()`** can convert a string into an alphanumeric pattern that describes its phonetic representation.

```sql
SELECT *
FROM mytable
WHERE SOUNDEX(col1) = SOUNDEX('apple')
```

### Date and time processing

- Date format: `YYYY-MM-DD`
- Time format: `HH:MM:SS`

| function | description |
| --------------- | ------------------------------- |
| `AddDate()` | Add a date (day, week, etc.) |
| `AddTime()` | Add a time (hour, minute, etc.) |
| `CurDate()` | Returns the current date |
| `CurTime()` | Returns the current time |
| `Date()` | Returns the date part of a datetime |
| `DateDiff()` | Calculate the difference between two dates |
| `Date_Add()` | Highly flexible date operation function |
| `Date_Format()` | Returns a formatted date or time string |
| `Day()` | Returns the day part of a date |
| `DayOfWeek()` | For a date, return the corresponding day of the week |
| `Hour()` | Returns the hour part of a time |
| `Minute()` | Returns the minute part of a time |
| `Month()` | Returns the month part of a date |
| `Now()` | Returns the current date and time |
| `Second()` | Returns the second part of a time |
| `Time()` | Returns the time part of a datetime |
| `Year()` | Returns the year part of a date |

### Numerical processing

| Function | Description |
| ------ | ------ |
| SIN() | sine |
| COS() | cosine |
| TAN() | tangent |
| ABS() | Absolute value |
| SQRT() | Square root |
| MOD() | Remainder |
| EXP() | index |
| PI() | Pi |
| RAND() | Random number |

### Summary

| function | description |
| --------- | ---------------- |
| `AVG()` | Returns the average value of a column |
| `COUNT()` | Returns the number of rows in a column |
| `MAX()` | Returns the maximum value of a column |
| `MIN()` | Returns the minimum value of a column |
| `SUM()` | Returns the sum of values in a column |

`AVG()` ignores NULL rows.

Use `DISTINCT` to have summary function values ​​summarize different values.

```sql
SELECT AVG(DISTINCT col1) AS avg_col
FROM mytable
```

**Next, let’s introduce the usage of DDL statements. The main function of DDL is to define database objects (such as databases, data tables, views, indexes, etc.)**

## Data definition

### Database (DATABASE)

#### Create database

```sql
CREATE DATABASE test;
```

#### Delete database

```sql
DROP DATABASE test;
```

#### Select database

```sql
USE test;
```

### Data table (TABLE)

#### Create data table

**Normal creation**

```sql
CREATE TABLE user (
  id int(10) unsigned NOT NULL COMMENT 'Id',
  username varchar(64) NOT NULL DEFAULT 'default' COMMENT 'username',
  password varchar(64) NOT NULL DEFAULT 'default' COMMENT 'password',
  email varchar(64) NOT NULL DEFAULT 'default' COMMENT 'email'
) COMMENT='user table';
```

**Create a new table based on an existing table**

```sql
CREATE TABLE vip_user AS
SELECT * FROM user;
```

#### Delete data table

```sql
DROP TABLE user;
```

#### Modify data table

**Add Column**

```sql
ALTER TABLE user
ADD age int(3);
```

**Delete Column**

```sql
ALTER TABLE user
DROP COLUMN age;
```

**Modify column**

```sql
ALTER TABLE `user`
MODIFY COLUMN age tinyint;
```

**Add primary key**

```sql
ALTER TABLE user
ADD PRIMARY KEY (id);
```

**Delete primary key**

```sql
ALTER TABLE user
DROP PRIMARY KEY;
```

### View (VIEW)

Definition:

- A view is a table that visualizes the result set of a SQL statement.
- A view is a virtual table and does not contain data, so it cannot be indexed. Operations on views are the same as operations on ordinary tables.

Function:

- Simplify complex SQL operations, such as complex joins;
- Only use part of the data from the actual table;
- Ensure data security by only giving users permission to access views;
- Change data format and presentation.

![mysql view](https://oss.javaguide.cn/p3-juejin/ec4c975296ea4a7097879dac7c353878~tplv-k3u1fbpfcp-zoom-1.jpeg)

#### Create view

```sql
CREATE VIEW top_10_user_view AS
SELECT id, username
FROM user
WHERE id < 10;
```

#### Delete view

```sql
DROP VIEW top_10_user_view;
```

### Index (INDEX)

**Index is a data structure used for quick query and retrieval of data. Its essence can be regarded as a sorted data structure. **

The function of the index is equivalent to the table of contents of the book. For example: when we look up a dictionary, if there is no table of contents, then we can only go page by page to find the word we need to look up, which is very slow. If there is a table of contents, we only need to search the position of the word in the table of contents first, and then directly turn to that page.

**Advantages**:

- Using indexes can greatly speed up data retrieval (greatly reduce the amount of data retrieved), which is also the main reason for creating indexes.
- By creating a unique index, you can ensure the uniqueness of each row of data in the database table.

**Disadvantages**:

- Creating and maintaining indexes takes a lot of time. When adding, deleting, or modifying data in a table, if the data has an index, the index also needs to be dynamically modified, which will reduce SQL execution efficiency.
- Indexes require physical file storage and will also consume a certain amount of space.

However, **Does using indexes definitely improve query performance?**

In most cases, index queries are faster than full table scans. But if the amount of data in the database is not large, using indexes may not necessarily bring about a big improvement.

For a detailed introduction to indexes, please read my article [MySQL Index Detailed Explanation](https://javaguide.cn/database/mysql/mysql-index.html).

#### Create index

```sql
CREATE INDEX user_index
ON user(id);
```

#### Add index

```sql
ALTER table user ADD INDEX user_index(id)
```

#### Create a unique index

```sql
CREATE UNIQUE INDEX user_index
ON user(id);
```

#### Delete index

```sql
ALTER TABLE user
DROP INDEX user_index;```

### Constraints

SQL constraints are used to specify rules for data in a table.

If there is a data behavior that violates the constraint, the behavior will be terminated by the constraint.

Constraints can be specified when the table is created (via the CREATE TABLE statement), or after the table is created (via the ALTER TABLE statement).

Constraint type:

- `NOT NULL` - Indicates that a column cannot store NULL values.
- `UNIQUE` - Guarantees that each row of a column must have a unique value.
- `PRIMARY KEY` - Combination of NOT NULL and UNIQUE. Ensuring that a column (or a combination of two or more columns) is uniquely identified can help make it easier and faster to find a specific record in a table.
- `FOREIGN KEY` - Ensures referential integrity that data in one table matches values ​​in another table.
- `CHECK` - Ensures that the values ​​in the column meet the specified conditions.
- `DEFAULT` - Specifies the default value when no value is assigned to the column.

Use constraints when creating tables:

```sql
CREATE TABLE Users (
  Id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Auto-increment Id',
  Username VARCHAR(64) NOT NULL UNIQUE DEFAULT 'default' COMMENT 'username',
  Password VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT 'password',
  Email VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT 'Email address',
  Enabled TINYINT(4) DEFAULT NULL COMMENT 'Is it valid',
  PRIMARY KEY (Id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='User table';
```

**Next, let’s introduce the usage of TCL statements. The main function of TCL is to manage transactions in the database. **

## Transaction processing

The `SELECT` statement cannot be rolled back, and it is meaningless to roll back the `SELECT` statement; the `CREATE` and `DROP` statements cannot be rolled back.

**MySQL defaults to implicit commit**. Each time a statement is executed, the statement is regarded as a transaction and then submitted. When the `START TRANSACTION` statement appears, implicit commit will be turned off; when the `COMMIT` or `ROLLBACK` statement is executed, the transaction will be automatically closed and implicit commit will be restored.

Autocommit can be canceled by `set autocommit=0` and will not be committed until `set autocommit=1`; the `autocommit` flag is for each connection and not for the server.

Instructions:

- `START TRANSACTION` - directive is used to mark the starting point of a transaction.
- `SAVEPOINT` - directive is used to create a save point.
- `ROLLBACK TO` - The instruction is used to roll back to the specified retention point; if no retention point is set, it will roll back to the `START TRANSACTION` statement.
- `COMMIT` - Commit the transaction.

```sql
-- Start transaction
START TRANSACTION;

-- Insert operation A
INSERT INTO `user`
VALUES (1, 'root1', 'root1', 'xxxx@163.com');

-- Create a retention point updateA
SAVEPOINT updateA;

-- Insert operation B
INSERT INTO `user`
VALUES (2, 'root2', 'root2', 'xxxx@163.com');

-- Roll back to retention point updateA
ROLLBACK TO updateA;

-- Submit the transaction, only operation A takes effect
COMMIT;
```

**Next, let’s introduce the usage of DCL statements. The main function of DCL is to control user access rights. **

## Permission control

To grant permissions to a user account, use the `GRANT` command. To revoke a user's permissions, use the `REVOKE` command. Here, MySQL is used as an example to introduce the practical application of permission control.

`GRANT` grant permission syntax:

```sql
GRANT privilege,[privilege],.. ON privilege_level
TO user [IDENTIFIED BY password]
[REQUIRE tsl_option]
[WITH [GRANT_OPTION | resource_option]];
```

Just explain it briefly:

1. Specify one or more permissions after the `GRANT` keyword. If the user is granted multiple permissions, each permission is separated by a comma.
2. `ON privilege_level` determines the level of permission application. MySQL supports global (`*.*`), database (`database.*`), table (`database.table`) and column levels. If you use column permission levels, you must specify one or a comma-separated list of columns after each permission.
3. `user` is the user to whom permissions are to be granted. If the user already exists, the `GRANT` statement will modify its permissions. Otherwise, the `GRANT` statement will create a new user. The optional clause `IDENTIFIED BY` allows you to set a new password for the user.
4. `REQUIRE tsl_option` specifies whether users must connect to the database server through secure connections such as SSL, X059, etc.
5. The optional `WITH GRANT OPTION` clause allows you to grant or remove permissions that you have from other users. In addition, you can use the `WITH` clause to allocate the resources of the MySQL database server, for example, to set the number of connections or statements that a user can use per hour. This is useful in shared environments such as MySQL shared hosting.

`REVOKE` revoke permission syntax:

```sql
REVOKE privilege_type [(column_list)]
        [, priv_type [(column_list)]]...
ON [object_type] privilege_level
FROM user [, user]...
```

Just explain it briefly:

1. Specify the list of permissions to be revoked from the user after the `REVOKE` keyword. You need to separate permissions with commas.
2. Specify the privilege level at which privileges are revoked in the `ON` clause.
3. Specify the user account whose permissions are to be revoked in the `FROM` clause.

`GRANT` and `REVOKE` control access at several levels:

- The entire server, using `GRANT ALL` and `REVOKE ALL`;
- The entire database, use `ON database.*`;
- For a specific table, use `ON database.table`;
- specific columns;
- Specific stored procedures.

Newly created accounts do not have any permissions. Accounts are defined in the form `username@host`, and `username@%` uses the default hostname. MySQL account information is stored in the mysql database.

```sql
USE mysql;
SELECT user FROM user;
```

The following table illustrates all allowed permissions available for the `GRANT` and `REVOKE` statements:

| **Privilege** | **Description** | **Level** | | | | | |
| ----------------------- | ----------------------------------------------------------------------------------------------- | -------- | ------ | -------- | -------- | --- | --- |
| **Global** | Database | **Table** | **Column** | **Program** | **Agent** | | |
| ALL [PRIVILEGES] | Grants all privileges to the specified access level except GRANT OPTION | | | | | | |
| ALTER | Allows users to use the ALTER TABLE statement || ALTER ROUTINE | Allows the user to change or delete a stored routine |
| CREATE | Allows users to create databases and tables | X |
| CREATE ROUTINE | Allows the user to create a stored routine |
| CREATE TABLESPACE | Allows users to create, alter, or delete tablespaces and log file groups | X | | | | | |
| CREATE TEMPORARY TABLES | Allows users to create temporary tables using CREATE TEMPORARY TABLE | X |
| CREATE USER | Allows users to use the CREATE USER, DROP USER, RENAME USER and REVOKE ALL PRIVILEGES statements.                        | X | | | | | |
| CREATE VIEW | Allows users to create or modify views.                                                                                |
| DELETE | Allow users to use DELETE |
| DROP | Allows users to drop databases, tables and views |
| EVENT | Enables event usage by the event scheduler.                                                                            |
| EXECUTE | Allows the user to execute a stored routine |
| FILE | Allows users to read any file in the database directory.                                                                    | X | | | | | |
| GRANT OPTION | Allows a user to have the ability to grant or revoke permissions from other accounts.                                                              |
| INDEX | Allows users to create or delete indexes.                                                                                |
| INSERT | Allows users to use the INSERT statement |
| LOCK TABLES | Allows users to use LOCK TABLES on tables with SELECT permission |
| PROCESS | Allows users to view all processes using the SHOW PROCESSLIST statement.                                                        | X | | | | | |
| PROXY | Enable user agent.                                                                                          | | | | | | |
| REFERENCES | Allows users to create foreign keys |
| RELOAD | Allows users to use FLUSH operations | X | | | | | |
| REPLICATION CLIENT | Allows users to query to see the location of a master or slave server | X | | | | | |
| REPLICATION SLAVE | Allows users to read binary log events from the master server using a replication slave.                                                      | X | | | | | || SELECT | Allows users to use the SELECT statement |
| SHOW DATABASES | Allows the user to show all databases |
| SHOW VIEW | Allows users to use the SHOW CREATE VIEW statement |
| SHUTDOWN | Allows users to use the mysqladmin shutdown command |
| SUPER | Allows users to use other administrative operations such as CHANGE MASTER TO, KILL, PURGE BINARY LOGS, SET GLOBAL and mysqladmin commands |
| TRIGGER | Allows the user to use the TRIGGER operation.                                                                             |
| UPDATE | Allows users to use the UPDATE statement |
| USAGE | Equivalent to "no privileges" | | | | | | |

### Create account

```sql
CREATE USER myuser IDENTIFIED BY 'mypassword';
```

### Modify account name

```sql
UPDATE user SET user='newuser' WHERE user='myuser';
FLUSH PRIVILEGES;
```

### Delete account

```sql
DROP USER myuser;
```

### View permissions

```sql
SHOW GRANTS FOR myuser;
```

### Grant permissions

```sql
GRANT SELECT, INSERT ON *.* TO myuser;
```

### Delete permissions

```sql
REVOKE SELECT, INSERT ON *.* FROM myuser;
```

### Change password

```sql
SET PASSWORD FOR myuser = 'mypass';
```

## Stored procedure

Stored procedures can be thought of as batch processing of a series of SQL operations. Stored procedures can be called by triggers, other stored procedures, and applications such as Java, Python, PHP, etc.

![mysql stored procedure](https://oss.javaguide.cn/p3-juejin/60afdc9c9a594f079727ec64a2e698a3~tplv-k3u1fbpfcp-zoom-1.jpeg)

Benefits of using stored procedures:

- Code encapsulation ensures a certain level of security;
- Code reuse;
- High performance since it is pre-compiled.

Create stored procedure:

- Creating a stored procedure in the command line requires custom delimiters, because the command line ends with `;`, and the stored procedure also contains a semicolon, so this part of the semicolon will be mistakenly regarded as the terminator, causing a syntax error.
- Contains three parameters: `in`, `out` and `inout`.
- To assign a value to a variable, you need to use the `select into` statement.
- Only one variable can be assigned a value at a time, and collection operations are not supported.

It should be noted that: **Alibaba's "Java Development Manual" forcibly prohibits the use of stored procedures. Because stored procedures are difficult to debug and extend, they are not portable. **

![](https://oss.javaguide.cn/p3-juejin/93a5e011ade4450ebfa5d82057532a49~tplv-k3u1fbpfcp-zoom-1.png)

As for whether to use it in the project, it still depends on the actual needs of the project, and just weigh the pros and cons!

### Create stored procedure

```sql
DROP PROCEDURE IF EXISTS `proc_adder`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_adder`(IN a int, IN b int, OUT sum int)
BEGIN
    DECLARE c int;
    if a is null then set a = 0;
    end if;

    if b is null then set b = 0;
    end if;

    set sum = a + b;
END
;;
DELIMITER;
```

### Use stored procedures

```less
set @b=5;
call proc_adder(2,@b,@s);
select @s as sum;
```

## Cursor

A cursor is a database query stored on the DBMS server. It is not a `SELECT` statement, but the result set retrieved by the statement.

Cursors can be used in stored procedures to traverse a result set.

Cursors are primarily used in interactive applications where the user needs to scroll through data on the screen and browse or make changes to the data.

A few clear steps for using cursors:

- Before using a cursor, you must declare (define) it. This procedure does not actually retrieve data, it simply defines the `SELECT` statement and cursor options to be used.

- Once declared, the cursor must be opened for use. This process uses the SELECT statement defined earlier to actually retrieve the data.

- For cursors filled with data, fetch (retrieve) rows as needed.

- When ending use of a cursor, the cursor must be closed and, if possible, released (depending on the tool).

  DBMS).

```sql
DELIMITER $
CREATE PROCEDURE getTotal()
BEGIN
    DECLARE total INT;
    --Create a variable to receive cursor data
    DECLARE sid INT;
    DECLARE sname VARCHAR(10);
    --Create a total variable
    DECLARE sage INT;
    --Create an end flag variable
    DECLARE done INT DEFAULT false;
    --Create cursor
    DECLARE cur CURSOR FOR SELECT id,name,age from cursor_table where age>30;
    --Specify the return value at the end of the cursor loop
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = true;
    SET total = 0;
    OPEN cur;
    FETCH cur INTO sid, sname, sage;
    WHILE(NOT done)
    DO
        SET total = total + 1;
        FETCH cur INTO sid, sname, sage;
    END WHILE;

    CLOSE cur;
    SELECT total;
END $
DELIMITER;

-- Call stored procedure
call getTotal();
```

## Trigger

A trigger is a database object related to table operations. When a specified event occurs on the table where the trigger is located, the object will be called, that is, the operation event of the table triggers the execution of the trigger on the table.We can use triggers for audit tracking and record changes to another table.

Advantages of using triggers:

- SQL triggers provide another way to check data integrity.
- SQL triggers can capture errors in business logic in the database layer.
- SQL triggers provide another way to run scheduled tasks. By using SQL triggers, you don't have to wait for a scheduled task to run because the trigger is automatically called before or after changes are made to the data in the table.
- SQL triggers are useful for auditing changes to data in tables.

Disadvantages of using triggers:

- SQL triggers can only provide extended validation and cannot replace all validation. Some simple validation must be done in the application layer. For example, you can validate user input on the client side using JavaScript, or on the server side using a server-side scripting language (such as JSP, PHP, ASP.NET, Perl).
- SQL triggers are not visible when called and executed from the client application, so it is difficult to figure out what is going on in the database layer.
- SQL triggers may add overhead to the database server.

MySQL does not allow the use of CALL statements in triggers, that is, stored procedures cannot be called.

> Note: In MySQL, the semicolon `;` is the identifier of the end of a statement. Encountering a semicolon indicates that the statement has ended and MySQL can start execution. Therefore, the interpreter starts execution after encountering the semicolon in the trigger execution action, and then reports an error because no END matching BEGIN is found.
>
> The `DELIMITER` command will be used at this time (DELIMITER is the delimiter, which means the separator). It is a command and does not require an end-of-statement identifier. The syntax is: `DELIMITER new_delimiter`. `new_delimiter` can be set to 1 or more length symbols, the default is semicolon `;`, we can modify it to other symbols, such as `$` - `DELIMITER $`. The statement after this ends with a semicolon, and the interpreter will not react. Only when `$` is encountered, the statement is considered to have ended. Note that after using it, we should remember to modify it back.

Prior to MySQL version 5.7.2, up to six triggers could be defined per table.

- `BEFORE INSERT` - Activate before inserting data into the table.
- `AFTER INSERT` - activated after inserting data into the table.
- `BEFORE UPDATE` - Activate before updating data in the table.
- `AFTER UPDATE` - activated after updating data in the table.
- `BEFORE DELETE` - Activate before deleting data from the table.
- `AFTER DELETE` - activated after deleting data from the table.

However, starting with MySQL version 5.7.2+, multiple triggers can be defined for the same trigger event and action time.

**`NEW` and `OLD`**:

- The `NEW` and `OLD` keywords are defined in MySQL, which are used to indicate the row of data in the table where the trigger is located that triggered the trigger.
- In `INSERT` type triggers, `NEW` is used to indicate new data that will be (`BEFORE`) or has been (`AFTER`) inserted;
- In `UPDATE` type triggers, `OLD` is used to represent the original data that will be or has been modified, and `NEW` is used to represent the new data that will be or has been modified;
- In `DELETE` type triggers, `OLD` is used to represent the original data that will be or has been deleted;
- Usage: `NEW.columnName` (columnName is a column name of the corresponding data table)

### Create trigger

> Tip: In order to understand the gist of triggers, it is necessary to first understand the instructions for creating triggers.

The `CREATE TRIGGER` command is used to create a trigger.

Syntax:

```sql
CREATE TRIGGER trigger_name
trigger_time
trigger_event
ON table_name
FOR EACH ROW
BEGIN
  trigger_statements
END;
```

Description:

- `trigger_name`: trigger name
- `trigger_time`: The trigger firing time. The value is `BEFORE` or `AFTER`.
- `trigger_event`: The listening event of the trigger. The value is `INSERT`, `UPDATE` or `DELETE`.
- `table_name`: The listening target of the trigger. Specify the table on which to create the trigger.
- `FOR EACH ROW`: Row-level monitoring, Mysql fixed writing method, different from other DBMS.
- `trigger_statements`: Trigger execution actions. Is a list of one or more SQL statements. Each statement in the list must be terminated with a semicolon `;`.

When the triggering condition of the trigger is met, the trigger execution action between `BEGIN` and `END` will be executed.

Example:

```sql
DELIMITER $
CREATE TRIGGER `trigger_insert_user`
AFTER INSERT ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO `user_history`(user_id, operate_type, operate_time)
    VALUES (NEW.id, 'add a user', now());
END $
DELIMITER;
```

### View triggers

```sql
SHOW TRIGGERS;
```

### Delete trigger

```sql
DROP TRIGGER IF EXISTS trigger_insert_user;
```

## Article recommendation

- [A must-have for back-end programmers: SQL high-performance optimization guide! 35+ optimization suggestions GET now!](https://mp.weixin.qq.com/s/I-ZT3zGTNBZ6egS7T09jyQ)
- [Must-have for back-end programmers: 30 tips for writing high-quality SQL suggestions](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486461&idx=1&sn=60a22279196d084cc398936fe3b37772&c hksm=cea24436f9d5cd20a4fa0e907590f3e700d7378b3f608d7b33bb52cfb96f503b7ccb65a1deed&token=1987003517&lang=zh_CN#rd)

<!-- @include: @article-footer.snippet.md -->