---
title: Summary of common SQL interview questions (2)
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, additions, deletions, batch insertions, imports, replacement insertions, constraints
  - - meta
    - name: description
      content: Focus on the analysis of questions on basic operations such as addition, deletion, and modification, and summarize techniques and precautions such as batch insertion/import and replacement insertion.
---

> The question comes from: [Niuke Question Ba - SQL Advanced Challenge](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

## Add, delete, and modify operations

Summary of how SQL inserts records:

- **Normal insert (all fields)**: `INSERT INTO table_name VALUES (value1, value2, ...)`
- **Normal insert (qualified fields)**: `INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)`
- **Multiple inserts at once**: `INSERT INTO table_name (column1, column2, ...) VALUES (value1_1, value1_2, ...), (value2_1, value2_2, ...), ...`
- **Import from another table**: `INSERT INTO table_name SELECT * FROM table_name2 [WHERE key=value]`
- **Insert with update**: `REPLACE INTO table_name VALUES (value1, value2, ...)` (note that this principle is to delete the original record and reinsert it after detecting a duplicate primary key or unique index key)

### Insert record (1)

**Description**: Niuke backend will record each user’s test paper answers to the `exam_record` table. The details of the answer records of two users are as follows:

- User 1001 started answering test paper 9001 at 10:11:12 pm on September 1, 2021, and submitted it after 50 minutes, and received 90 points;
- User 1002 started answering paper 9002 at 7:01:02 AM on September 4, 2021, and exited the platform 10 minutes later.

In the test paper answer record table `exam_record`, the table has been built and its structure is as follows. Please use one statement to insert these two records into the table.

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

**Answer**:

```sql
// There is an auto-incrementing primary key, no manual assignment is required
INSERT INTO exam_record (uid, exam_id, start_time, submit_time, score) VALUES
(1001, 9001, '2021-09-01 22:11:12', '2021-09-01 23:01:12', 90),
(1002, 9002, '2021-09-04 07:01:02', NULL, NULL);
```

### Insert record (2)

**Description**: There is an examination paper answer record table `exam_record`, with the structure as follows, which contains user answer paper records over the years. Due to the increasing amount of data, maintenance is becoming more and more difficult, so the data table content needs to be streamlined and historical data backed up.

Table `exam_record`:

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

We have created a new table `exam_record_before_2021` to back up test answer records before 2021. The structure is consistent with the `exam_record` table. Please import the completed test answer records before 2021 into this table.

**Answer**:

```sql
INSERT INTO exam_record_before_2021 (uid, exam_id, start_time, submit_time, score)
SELECT uid,exam_id,start_time,submit_time,score
FROM exam_record
WHERE YEAR(submit_time) < 2021;
```

### Insert record (3)

**Description**: There is now a set of difficult SQL test papers with ID 9003, which lasts for one and a half hours. Please insert 2021-01-01 00:00:00 as the release time into the test question information table `examination_info`. Regardless of whether the ID test paper exists, the insertion must be successful. Please try to insert it.

Test question information table `examination_info`:

| Filed | Type | Null | Key | Extra | Default | Comment |
| ------------ | ----------- | ---- | --- | -------------- | ------- | ------------ |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| exam_id | int(11) | NO | UNI | | (NULL) | Exam paper ID |
| tag | varchar(32) | YES | | | (NULL) | category tag |
| difficulty | varchar(8) | YES | | | (NULL) | difficulty |
| duration | int(11) | NO | | | (NULL) | Duration (number of minutes) |
| release_time | datetime | YES | | | (NULL) | release time |

**Answer**:

```sql
REPLACE INTO examination_info VALUES
 (NULL, 9003, "SQL", "hard", 90, "2021-01-01 00:00:00");
```

### Update record (1)**Description**: There is now a test paper information table `examination_info`. The table structure is as shown below:

| Filed | Type | Null | Key | Extra | Default | Comment |
| ------------ | -------- | ---- | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| exam_id | int(11) | NO | UNI | | (NULL) | Exam paper ID |
| tag | char(32) | YES | | | (NULL) | Category tag |
| difficulty | char(8) | YES | | | (NULL) | difficulty |
| duration | int(11) | NO | | | (NULL) | duration |
| release_time | datetime | YES | | | (NULL) | release time |

Please modify all the `tag` fields whose `tag` is `PYTHON` in the **examination_info** table to `Python`.

**Idea**: There are two ways to solve this problem. The easiest one to think of is to directly use `update + where` to specify conditional updates. The second one is to search and replace based on the fields to be modified.

**Answer 1**:

```sql
UPDATE examination_info SET tag = 'Python' WHERE tag='PYTHON'
```

**Answer 2**:

```sql
UPDATE examination_info
SET tag = REPLACE(tag,'PYTHON','Python')

# REPLACE (target field, "find content", "replace content")
```

### Update record (2)

**Description**: There is an examination paper answer record table exam_record, which contains user answer paper records for many years. The structure is as follows: Answer record table `exam_record`: **`submit_time`** is the completion time (note this sentence)

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

**Question requirements**: Please change all the == unfinished == records in the `exam_record` table that were started before September 1, 2021 == to passive completion, that is: change the completion time to '2099-01-01 00:00:00', and change the score to 0.

**Idea**: Pay attention to the keyword in the question stem (already highlighted) `" xxx time "` before the condition, then you will immediately think of time comparison here. You can directly `xxx_time < "2021-09-01 00:00:00",` or you can use the `date()` function for comparison; the second condition is `"Unfinished"`, that is, the completion time is NULL, which is the submission time in the question ----- `submit_time is NULL`.

**Answer**:

```sql
UPDATE exam_record SET submit_time = '2099-01-01 00:00:00', score = 0 WHERE DATE(start_time) < "2021-09-01" AND submit_time IS null
```

### Delete records (1)

**Description**: There is an exam paper answer record table `exam_record`, which contains user answer paper records for many years. The structure is as follows:

Answer record table `exam_record:` **`start_time`** is the start time of the test paper `submit_time` is the hand-in time, that is, the end time.

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | ---- | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

**Requirement**: Please delete the records in the `exam_record` table whose answer time is less than 5 minutes and whose score is failing (passing mark is 60 points);

**Idea**: Although this question is an exercise in deletion, if you look carefully, it is indeed an examination of the usage of time functions. Compared with the minutes mentioned here, the commonly used functions are **`TIMEDIFF`** and **`TIMESTAMPDIFF`**. The usage of the two is slightly different, and the latter is more flexible. This all depends on personal habits.

1. `TIMEDIFF`: the difference between two times

```sql
TIMEDIFF(time1, time2)
```

Both parameters are required and are both a time or datetime expression. If the specified parameter is illegal or NULL, the function will return NULL.

For this question, it can be used in the minute function, because TIMEDIFF calculates the difference in time. If you put a MINUTE function outside, the calculated number is the number of minutes.

2. `TIMESTAMPDIFF`: used to calculate the time difference between two dates

```sql
TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)
# Parameter description
#unit: The time difference unit returned by date comparison. Commonly used optional values are as follows:
SECOND: seconds
MINUTE: minutes
HOUR: hours
DAY: day
WEEK: week
MONTH: month
QUARTER: quarter
YEAR: year
# TIMESTAMPDIFF function returns the result of datetime_expr2 - datetime_expr1 (in human words: the latter - the previous one, that is, 2-1), where datetime_expr1 and datetime_expr2 can be DATE or DATETIME type values (in human words: it can be "2023-01-01", or it can be "2023-01-01- 00:00:00")
```

This question requires a comparison of minutes, so TIMESTAMPDIFF(MINUTE, start time, end time) < 5

**Answer**:

```sql
DELETE FROM exam_record WHERE MINUTE (TIMEDIFF(submit_time , start_time)) < 5 AND score < 60
```

```sql
DELETE FROM exam_record WHERE TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5 AND score < 60
```### Delete records (2)

**Description**: There is an exam paper answer record table `exam_record`, which contains user answer paper records over the years. The structure is as follows:

Answer record table `exam_record`: `start_time` is the start time of the test paper, `submit_time` is the hand-in time, that is, the end time. If it is not completed, it will be empty.

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | :--: | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

**Requirement**: Please delete the 3 records with the earliest starting time among the records in the `exam_record` table that have unfinished answers == or == the answer time is less than 5 minutes.

**Idea**: This question is relatively simple, but you should pay attention to the information given in the question stem, the end time, if it is not completed, it will be empty, this is actually a condition

There is another condition that is less than 5 minutes, which is similar to the previous question, but here it is ** or **, that is, only one of the two conditions is met; in addition, the usage of sorting and limit is slightly examined.

**Answer**:

```sql
DELETE FROM exam_record WHERE submit_time IS null OR TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5
ORDER BY start_time
LIMIT 3
# The default is asc, desc is descending order
```

### Delete records (3)

**Description**: There is an exam paper answer record table exam_record, which contains user answer paper records for many years. The structure is as follows:

| Filed | Type | Null | Key | Extra | Default | Comment |
| ----------- | ---------- | :--: | --- | -------------- | ------- | -------- |
| id | int(11) | NO | PRI | auto_increment | (NULL) | Auto-increment ID |
| uid | int(11) | NO | | | (NULL) | user ID |
| exam_id | int(11) | NO | | | (NULL) | Exam ID |
| start_time | datetime | NO | | | (NULL) | start time |
| submit_time | datetime | YES | | | (NULL) | Submit time |
| score | tinyint(4) | YES | | | (NULL) | score |

**Requirement**: Please delete all records in the `exam_record` table, == and reset the auto-incrementing primary key==

**Idea**: This question examines the difference between three delete statements. Pay attention to the highlighted part, which requires resetting the primary key;

- `DROP`: clear the table, delete the table structure, irreversible
- `TRUNCATE`: Format the table without deleting the table structure, irreversible
- `DELETE`: delete data, reversible

The reason why `TRUNCATE` is chosen here is: TRUNCATE can only act on tables; `TRUNCATE` will clear all rows in the table, but the table structure, its constraints, indexes, etc. remain unchanged; `TRUNCATE` will reset the auto-increment value of the table; using `TRUNCATE` will restore the space occupied by the table and indexes to their initial size.

This question can also be done using `DELETE`, but after deletion, you still need to manually `ALTER` the table structure to set the initial value of the primary key;

In the same way, you can also use `DROP` to directly delete the entire table, including the table structure, and then create a new table.

**Answer**:

```sql
TRUNCATE exam_record;
```

## Table and index operations

### Create a new table

**Description**: There is currently a user information table, which contains user information that has been registered on the platform over the years. As the Niuke platform continues to grow, the number of users has grown rapidly. In order to efficiently provide services to highly active users, it is now necessary to split some users into a new table.

Original user information table:

| Filed | Type | Null | Key | Default | Extra | Comment |
| ------------- | ----------- | ---- | --- | ------------------ | -------------- | -------- |
| id | int(11) | NO | PRI | (NULL) | auto_increment | Auto-increment ID |
| uid | int(11) | NO | UNI | (NULL) | | user ID |
| nick_name | varchar(64) | YES | | (NULL) | | Nickname |
| achievement | int(11) | YES | | 0 | | achievement value |
| level | int(11) | YES | | (NULL) | | User level |
| job | varchar(32) | YES | | (NULL) | | Career direction |
| register_time | datetime | YES | | CURRENT_TIMESTAMP | | registration time |

As a data analyst, please create a high-quality user information table user_info_vip** with the same structure as the user information table.

The output you should return is shown in the table below. Please write a table creation statement to record all restrictions and instructions in the table into the table.

| Filed | Type | Null | Key | Default | Extra | Comment |
| ------------- | ----------- | ---- | --- | ------------------ | -------------- | -------- |
| id | int(11) | NO | PRI | (NULL) | auto_increment | Auto-increment ID |
| uid | int(11) | NO | UNI | (NULL) | | user ID |
| nick_name | varchar(64) | YES | | (NULL) | | Nickname |
| achievement | int(11) | YES | | 0 | | achievement value |
| level | int(11) | YES | | (NULL) | | User level || job | varchar(32) | YES | | (NULL) | | Career direction |
| register_time | datetime | YES | | CURRENT_TIMESTAMP | | registration time |

**Idea**: If this question gives the name of the old table, you can directly `create table new table as select * from old table;` However, this question does not give the name of the old table, so you need to create it yourself. Just pay attention to the creation of default values and keys, which is relatively simple. (Note: If it is executed on Niuke.com, please note that the comment must be consistent with the comment in the question, including upper and lower case, otherwise it will not pass, and the characters must also be set)

Answer:

```sql
CREATE TABLE IF NOT EXISTS user_info_vip(
    id INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT'Auto-increment ID',
    uid INT(11) UNIQUE NOT NULL COMMENT 'User ID',
    nick_name VARCHAR(64) COMMENT'nickname',
    achievement INT(11) DEFAULT 0 COMMENT 'Achievement value',
    `level` INT(11) COMMENT 'User level',
    job VARCHAR(32) COMMENT 'Career direction',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration time'
)CHARACTER SET UTF8
```

### Modify table

**Description**: There is a user information table `user_info`, which contains user information registered on the platform over the years.

**User information table `user_info`:**

| Filed | Type | Null | Key | Default | Extra | Comment |
| ------------- | ----------- | ---- | --- | ------------------ | -------------- | -------- |
| id | int(11) | NO | PRI | (NULL) | auto_increment | Auto-increment ID |
| uid | int(11) | NO | UNI | (NULL) | | user ID |
| nick_name | varchar(64) | YES | | (NULL) | | Nickname |
| achievement | int(11) | YES | | 0 | | achievement value |
| level | int(11) | YES | | (NULL) | | User level |
| job | varchar(32) | YES | | (NULL) | | Career direction |
| register_time | datetime | YES | | CURRENT_TIMESTAMP | | registration time |

**Requirements:** Please add a field `school` that can store up to 15 Chinese characters in the user information table after the field `level`; change the `job` column name in the table to `profession`, and change the `varchar` field length to 10; set the default value of `achievement` to 0.

**Idea**: Before doing this question first, you need to understand the basic usage of the ALTER statement:

- Add a column: `ALTER TABLE table name ADD COLUMN column name type [first | after field name];` (first: add before a column, after vice versa)
- Modify the column type or constraint: `ALTER TABLE table name MODIFY COLUMN column name new type [new constraint];`
- Modify column name: `ALTER TABLE table name change COLUMN old column name new column name type;`
- Delete column: `ALTER TABLE table name drop COLUMN column name;`
- Modify table name: `ALTER TABLE table name rename [to] new table name;`
- Put a column into the first column: `ALTER TABLE table name MODIFY COLUMN column name type first;`

The `COLUMN` keyword can actually be omitted, but it is listed here based on the specification.

When modifying, if there are multiple modification items, you can write them together, but pay attention to the format.

**Answer**:

```sql
ALTER TABLE user_info
    ADD school VARCHAR(15) AFTER level,
    CHANGE job profession VARCHAR(10),
    MODIFY achievement INT(11) DEFAULT 0;
```

### Delete table

**Description**: There is an exam paper answer record table `exam_record`, which contains user answer paper records for many years. Generally, a backup table `exam_record_{YEAR} will be created for the `exam_record` table every year, {YEAR}` is the corresponding year.

Now with more and more data and storage shortage, please delete all the backup tables from a long time ago (2011 to 2014) (if they exist).

**Idea**: This question is very simple, just delete it. If you find it troublesome, you can separate the tables to be deleted with commas and write them on one line; there will definitely be friends here asking: What if you want to delete many tables? Don't worry, if you want to delete many tables, you can write a script to delete them.

**Answer**:

```sql
DROP TABLE IF EXISTS exam_record_2011;
DROP TABLE IF EXISTS exam_record_2012;
DROP TABLE IF EXISTS exam_record_2013;
DROP TABLE IF EXISTS exam_record_2014;
```

### Create index

**Description**: There is an examination paper information table `examination_info`, which contains information about various types of examination papers. In order to query the table more conveniently and quickly, you need to create the following index in the `examination_info` table,

The rules are as follows: create a normal index `idx_duration` on the `duration` column, create a unique index `uniq_idx_exam_id` on the `exam_id` column, and create a full-text index `full_idx_tag` on the `tag` column.

According to the meaning of the question, the following results will be returned:

| examination_info | 0 | PRIMARY | 1 | id | A | 0 | | | | BTREE |
| ---------------- | --- | ---------------- | --- | -------- | --- | --- | --- | --- | --- | -------- |
| examination_info | 0 | uniq_idx_exam_id | 1 | exam_id | A | 0 | | | YES | BTREE |
| examination_info | 1 | idx_duration | 1 | duration | A | 0 | | | | BTREE |
| examination_info | 1 | full_idx_tag | 1 | tag | | 0 | | | YES | FULLTEXT |

Note: The background will compare the output results through the `SHOW INDEX FROM examination_info` statement

**Idea**: To answer this question, you first need to understand the common index types:

- B-Tree index: B-Tree (or balanced tree) index is the most common and default index type. It is suitable for various query conditions and can quickly locate data that meets the conditions. B-Tree index is suitable for ordinary search operations and supports equality query, range query and sorting.
- Unique index: A unique index is similar to a normal B-Tree index, except that it requires the value of the indexed column to be unique. This means that MySQL verifies the uniqueness of index columns when inserting or updating data.
- Primary key index: The primary key index is a special unique index that is used to uniquely identify each row of data in the table. Each table can only have one primary key index, which can help improve data access speed and data integrity.- Full-text indexing: Full-text indexing is used for full-text search in text data. It supports keyword searches in text fields, not just simple equality or range lookups. Full-text indexing is suitable for application scenarios that require full-text search.

```sql
-- Example:
-- Add B-Tree index:
	CREATE INDEX idx_name (index name) ON table name (field name); -- idx_name is the index name, all of the following
--Create a unique index:
	CREATE UNIQUE INDEX idx_name ON table name (field name);
-- Create a primary key index:
	ALTER TABLE table name ADD PRIMARY KEY (field name);
--Create a full-text index
	ALTER TABLE table name ADD FULLTEXT INDEX idx_name (field name);

-- Through the above example, you can see that both create and alter can add indexes
```

With the above basic knowledge, the answer to this question will become apparent.

**Answer**:

```sql
ALTER TABLE examination_info
    ADD INDEX idx_duration(duration),
    ADD UNIQUE INDEX uniq_idx_exam_id(exam_id),
    ADD FULLTEXT INDEX full_idx_tag(tag);
```

### Delete index

**Description**: Please delete the unique index uniq_idx_exam_id and the full-text index full_idx_tag on the `examination_info` table.

**Idea**: This question examines the basic syntax of deleting an index:

```sql
-- Use DROP INDEX to delete the index
DROP INDEX idx_name ON table name;

-- Use ALTER TABLE to delete the index
ALTER TABLE employees DROP INDEX idx_email;
```

What needs to be noted here is that in MySQL, deleting multiple indexes at one time is not supported. Each time you delete an index, you can only specify one index name to delete.

And the **DROP** command needs to be used with caution! ! !

**Answer**:

```sql
DROP INDEX uniq_idx_exam_id ON examination_info;
DROP INDEX full_idx_tag ON examination_info;
```

<!-- @include: @article-footer.snippet.md -->