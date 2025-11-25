---
title: Summary of common SQL interview questions (3)
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, aggregate functions, truncated average, window, problem analysis, performance
  - - meta
    - name: description
      Content: Focusing on aggregation functions and complex statistical question types, the solution methods and implementation key points such as truncated average are explained, taking into account performance and correctness.
---

> The question comes from: [Niuke Question Ba - SQL Advanced Challenge](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

You can decide whether to skip more difficult or difficult questions based on your actual situation and interview needs.

## Aggregation function

### Truncated average of scores for difficult papers in the SQL category (harder)

**Description**: Niuke's operations students want to check everyone's scores on the difficult papers in the SQL category.

Please help her calculate the truncated average (the average after removing one maximum value and one minimum value) of the scores of all users who completed the difficult SQL category exams from the `exam_record` data table.

Example data: `examination_info` (`exam_id` test paper ID, tag test paper category, `difficulty` test paper difficulty, `duration` exam duration, `release_time` release time)

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | algorithm | medium | 80 | 2020-08-02 10:00:00 |

Example data: `exam_record` (uid user ID, exam_id test paper ID, start_time start answering time, submit_time paper submission time, score score)

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81 |
| 3 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84 |
| 4 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 5 | 1001 | 9001 | 2021-09-02 12:01:01 | (NULL) | (NULL) |
| 6 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 7 | 1002 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 8 | 1002 | 9001 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |
| 9 | 1003 | 9001 | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50 |
| 10 | 1004 | 9001 | 2021-09-06 10:01:01 | (NULL) | (NULL) |

The results according to your query are as follows:

| tag | difficulty | clip_avg_score |
| --- | ---------- | --------------- |
| SQL | hard | 81.7 |

From the `examination_info` table, we can see that test paper 9001 is a highly difficult SQL test paper. The scores for this test paper are [80,81,84,90,50]. After removing the highest and lowest scores, it is [80,81,84]. The average score is 81.6666667, which is 81.7 after rounding to one decimal place.

**Enter description:**

There are at least 3 valid scores in the input data

**Idea 1:** To find the high-difficulty SQL test papers, you definitely need to connect to the examination_info table, and then find the high-difficulty courses. From examination_info, we know that the exam_id of the high-difficulty SQL is 9001, so later use exam_id = 9001 as the condition to query;

First find exam number 9001 `select * from exam_record where exam_id = 9001`

Then, find the maximum score `select max(score) maximum score from exam_record where exam_id = 9001`

Next, find the minimum score `select min(score) minimum score from exam_record where exam_id = 9001`

In the score result set obtained from the query, to remove the highest score and the lowest score, the most intuitive thing that can be thought of is NOT IN or NOT EXISTS. Here we use NOT IN to do it.

First write out the main body `select tag, difficulty, round(avg(score), 1) clip_avg_score from examination_info info INNER JOIN exam_record record`

**Tips**: MYSQL's `ROUND()` function, `ROUND(X)` returns the nearest integer to parameter

Then put the above "fragmented" statements together. Note that in NOT IN, the two subqueries are related using UNION ALL, and union is used to concentrate the results of max and min in one row, thus forming the effect of one column and multiple rows.

**Answer 1:**

```sql
SELECT tag, difficulty, ROUND(AVG(score), 1) clip_avg_score
	FROM examination_info info INNER JOIN exam_record record
		WHERE info.exam_id = record.exam_id
			AND record.exam_id = 9001
				AND record.score NOT IN(
					SELECT MAX(score)
						FROM exam_record
							WHERE exam_id = 9001
								UNION ALL
					SELECT MIN(score)
						FROM exam_record
							WHERE exam_id = 9001
				)
```

This is the most intuitive and easiest solution to think of, but it still needs to be improved. This is considered opportunistic. In fact, strictly according to the requirements of the question, it should be written like this:

```sql
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1) clip_avg_score
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND record.exam_id =
    (SELECT examination_info.exam_id
     FROM examination_info
     WHERE tag = 'SQL'
       AND difficulty = 'hard' )
  AND record.score NOT IN
    (SELECT MAX(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' )
     UNION ALL SELECT MIN(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' ) )```

However, you will find that there are many repeated statements, so you can use `WITH` to extract the common parts

**Introduction to `WITH` clause**:

The `WITH` clause, also known as a Common Table Expression (CTE), is the way to define a temporary table in a SQL query. It allows us to create a temporarily named result set in a query and reference that result set in the same query.

Basic usage:

```sql
WITH cte_name (column1, column2, ..., columnN) AS (
    -- Query body
    SELECT...
    FROM ...
    WHERE...
)
-- Main query
SELECT...
FROM cte_name
WHERE...
```

The `WITH` clause consists of the following parts:

- `cte_name`: Give the temporary table a name that can be referenced in the main query.
- `(column1, column2, ..., columnN)`: Optional, specify the column name of the temporary table.
- `AS`: required, indicates starting to define a temporary table.
- `CTE query body`: the actual query statement, used to define the data in the temporary table.

One of the primary uses of the `WITH` clause is to enhance the readability and maintainability of queries, especially when multiple nested subqueries are involved or the same query logic needs to be reused. By putting this logic in a named temporary table, we can organize our queries more clearly and eliminate duplicate code.

In addition, the `WITH` clause can also implement recursive queries in complex queries. Recursive queries allow us to perform multiple iterations of the same table in a single query, building the result set incrementally. This is useful in scenarios such as working with hierarchical data, organizational structures, and tree structures.

**Minor detail**: MySQL versions 5.7 and earlier do not support the direct use of aliases in the `WITH` clause.

Here is the improved answer:

```sql
WITH t1 AS
  (SELECT record.*,
          info.tag,
          info.difficulty
   FROM exam_record record
   INNER JOIN examination_info info ON record.exam_id = info.exam_id
   WHERE info.tag = "SQL"
     AND info.difficulty = "hard" )
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1)
FROM t1
WHERE score NOT IN
    (SELECT max(score)
     FROM t1
     UNION SELECT min(score)
     FROM t1)
```

**Idea 2:**

- Filter SQL difficult test papers: `where tag="SQL" and difficulty="hard"`
- Calculate the truncated average: `(sum-maximum value-minimum value) / (total number-2)`:
  - `(sum(score) - max(score) - min(score)) / (count(score) - 2)`
  - One disadvantage is that if there are multiple maximum values and minimum values, this method is difficult to filter out, but the question says ----->**`The average value after removing one maximum value and one minimum value`**, so this formula can be used here.

**Answer 2:**

```sql
SELECT info.tag,
       info.difficulty,
       ROUND((SUM(record.score)- MIN(record.score)- MAX(record.score)) / (COUNT(record.score)- 2), 1) AS clip_avg_score
FROM examination_info info,
     exam_record record
WHERE info.exam_id = record.exam_id
  AND info.tag = "SQL"
  AND info.difficulty = "hard";
```

### Count the number of answers

There is an exam paper answer record table `exam_record`. Please count the total number of answers `total_pv`, the number of completed exam papers `complete_pv`, and the number of completed exam papers `complete_exam_cnt`.

Example data `exam_record` table (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81 |
| 3 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84 |
| 4 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 5 | 1001 | 9001 | 2021-09-02 12:01:01 | (NULL) | (NULL) |
| 6 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 7 | 1002 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 8 | 1002 | 9001 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |
| 9 | 1003 | 9001 | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50 |
| 10 | 1004 | 9001 | 2021-09-06 10:01:01 | (NULL) | (NULL) |

Example output:

| total_pv | complete_pv | complete_exam_cnt |
| -------- | ----------- | ------------------ |
| 10 | 7 | 2 |

Explanation: As of now, there are 10 test paper answer records, and the number of completed answers is 7 (those who exited midway are in an unfinished status, and their handover time and number of copies are NULL). There are two completed test papers, 9001 and 9002.

**Idea**: As soon as you see the number of statistics for this question, you will definitely think of using the `COUNT` function to solve it immediately. The problem is to count different records. How to write it? This problem can be solved using subqueries (this problem can also be written using case when, the solution is similar, but the logic is different); first, before doing this problem, let us first understand the basic usage of `COUNT`;

The basic syntax of the `COUNT()` function is as follows:

```sql
COUNT(expression)
```

Among them, `expression` can be a column name, expression, constant or wildcard character. Here are some common usage examples:

1. Count the number of all rows in the table:

```sql
SELECT COUNT(*) FROM table_name;
```

2. Count the number of non-null (not NULL) values for a specific column:

```sql
SELECT COUNT(column_name) FROM table_name;
```

3. Calculate the number of rows that meet the conditions:

```sql
SELECT COUNT(*) FROM table_name WHERE condition;
```

4. Combined with `GROUP BY`, calculate the number of rows in each group after grouping:

```sql
SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;
```

5. Count the number of unique combinations of different column combinations:

```sql
SELECT COUNT(DISTINCT column_name1, column_name2) FROM table_name;
```

When using the `COUNT()` function without specifying any arguments or using `COUNT(*)`, all rows will be counted. If you use a column name, only the number of non-null values ​​in that column will be counted.

Additionally, the result of the `COUNT()` function is an integer value. Even if the result is zero, NULL will not be returned, which is something to keep in mind.

**Answer**:

```sql
SELECT
	count(*) total_pv,
	( SELECT count(*) FROM exam_record WHERE submit_time IS NOT NULL ) complete_pv,
	( SELECT COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL ) FROM exam_record ) complete_exam_cnt
FROM
	exam_record```

Here we focus on the sentence `COUNT(DISTINCT exam_id, score IS NOT NULL OR NULL)`, which determines whether score is null. If so, it is true, if not, return null; note that if `or null` is not added here, it will only return false if it is not null, that is, return 0;

`COUNT` itself cannot calculate the number of rows in multiple columns. The addition of `distinct` makes multiple columns into a whole, and the number of rows that appear can be calculated; `count distinct` only returns non-null rows during calculation. You should also pay attention to this;

In addition, through this question get arrived ------->count plus conditional common sentence pattern `count (column judgment or null)`

### The lowest score with a score not less than the average score

**Description**: Please find the lowest score of the user whose SQL test paper score is not less than the average score of this type of test paper from the test paper answer record table.

Example data exam_record table (uid user ID, exam_id test paper ID, start_time start answering time, submit_time paper submission time, score score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80 |
| 2 | 1002 | 9001 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 3 | 1002 | 9002 | 2021-09-02 12:01:01 | (NULL) | (NULL) |
| 4 | 1002 | 9003 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 5 | 1002 | 9001 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 6 | 1002 | 9002 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |
| 7 | 1003 | 9002 | 2021-02-06 12:01:01 | (NULL) | (NULL) |
| 8 | 1003 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86 |
| 9 | 1004 | 9003 | 2021-09-06 12:01:01 | (NULL) | (NULL) |

`examination_info` table (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` exam duration, `release_time` release time)

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | SQL | easy | 60 | 2020-02-01 10:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2020-08-02 10:00:00 |

Example output data:

| min_score_over_avg |
| ------------------ |
| 87 |

**Explanation**: Test papers 9001 and 9002 are in the SQL category. The scores for answering these two papers are [80,89,87,90], the average score is 86.5, and the minimum score that is not less than the average score is 87

**Idea**: This type of question is really complicated at first glance because we don’t know where to start. However, after we read and review the question carefully, we must learn to grasp the key information in the question stem. Take this question as an example: `Please find the lowest score of a user whose SQL test paper score is not less than the average score of this type of test paper from the test paper answer record table. `What effective information can you extract from it at a glance as a solution to the problem?

Article 1: Find ==SQL== test paper score

Article 2: This type of test paper == average score ==

Article 3: == user’s minimum score for this type of test paper ==

Then the "bridge" in the middle is == not less than ==

After splitting the conditions, complete them step by step

```sql
-- Find the score with the tag 'SQL' [80, 89,87,90]
-- Then calculate the average score of this group
select ROUND(AVG(score), 1) from examination_info info INNER JOIN exam_record record
	where info.exam_id = record.exam_id
	and tag= 'SQL'
```

Then find the lowest score for this type of test paper, and then compare the result set `[80, 89,87,90]` with the average score to get the final answer.

**Answer**:

```sql
SELECT MIN(score) AS min_score_over_avg
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND tag= 'SQL'
  AND score >=
    (SELECT ROUND(AVG(score), 1)
     FROM examination_info info
     INNER JOIN exam_record record
     WHERE info.exam_id = record.exam_id
       AND tag= 'SQL' )
```

In fact, the requirements given by this type of question seem very "convoluted", but in fact, you need to sort it out carefully, split the big conditions into small conditions, and after splitting them one by one, finally put all the conditions together. Anyway, as long as you remember: **Focus on the trunk and manage the branches**, the problem will be easily solved.

## Group query

### Average active days and number of monthly active users

**Description**: The user’s answer records in the Niuke test paper answer area are stored in the table `exam_record`, with the following content:

`exam_record` table (`uid` user ID, `exam_id` test paper ID, `start_time` starting time of answering, `submit_time` handing in time, `score` score)

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80 |
| 2 | 1002 | 9001 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81 |
| 3 | 1002 | 9002 | 2021-09-02 12:01:01 | (NULL) | (NULL) |
| 4 | 1002 | 9003 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 5 | 1002 | 9001 | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82 |
| 6 | 1002 | 9002 | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90 |
| 7 | 1003 | 9002 | 2021-07-06 12:01:01 | (NULL) | (NULL) |
| 8 | 1003 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86 |
| 9 | 1004 | 9003 | 2021-09-06 12:01:01 | (NULL) | (NULL) |
| 10 | 1002 | 9003 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81 || 11 | 1005 | 9001 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88 |
| 12 | 1006 | 9002 | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89 |
| 13 | 1007 | 9002 | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89 |

Please calculate the average number of monthly active days `avg_active_days` and the number of monthly active users `mau` in the test paper answer area in each month of 2021. The sample output of the above data is as follows:

| month | avg_active_days | mau |
| ------ | --------------- | --- |
| 202107 | 1.50 | 2 |
| 202109 | 1.25 | 4 |

**Explanation**: In July 2021, 2 people were active, and they were active for 3 days in total (1001 was active for 1 day, and 1002 was active for 2 days), and the average number of active days was 1.5; in September 2021, 4 people were active, and they were active for 5 days in total, and the average number of active days was 1.25. The result is rounded to 2 decimal places.

Note: Being active here means having the behavior of == handing in papers ==.

**Idea**: After reading the question, pay attention to the highlighted part first; generally when finding the number of days and monthly active people, you will immediately think of the relevant date function; we will also split this question, refine the problem and then solve it; first, to find the number of active people, you must use `COUNT()`, then there is a pit here. I wonder if you have noticed it? User 1002 took two different test papers in September, so pay attention to removing duplicates here, otherwise the number of active people will be wrong during statistics; the second is to know the format of the date, as shown in the table above, the question is required to be displayed in the date format of `202107`, and `DATE_FORMAT` must be used for formatting.

Basic usage:

`DATE_FORMAT(date_value, format)`

- The `date_value` parameter is the date or time value to be formatted.
- The `format` parameter is the specified date or time format (this is the same as the date format in Java).

**Answer**:

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') MONTH,
                                        round(count(DISTINCT UID, DATE_FORMAT(submit_time, '%Y%m%d')) / count(DISTINCT UID), 2) avg_active_days,
                                        COUNT(DISTINCT UID) mau
FROM exam_record
WHERE YEAR (submit_time) = 2021
GROUP BY MONTH
```

One more thing to say here, use `COUNT(DISTINCT uid, DATE_FORMAT(submit_time, '%Y%m%d'))` to count the number of combined values in the `uid` column and `submit_time` column formatted according to year, month and date.

### Total monthly number of questions and average number of questions per day

**Description**: There is a question practice record table `practice_record`. The sample content is as follows:

| id | uid | question_id | submit_time | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1 | 1001 | 8001 | 2021-08-02 11:41:01 | 60 |
| 2 | 1002 | 8001 | 2021-09-02 19:30:01 | 50 |
| 3 | 1002 | 8001 | 2021-09-02 19:20:01 | 70 |
| 4 | 1002 | 8002 | 2021-09-02 19:38:01 | 70 |
| 5 | 1003 | 8002 | 2021-08-01 19:38:01 | 80 |

Please count the total number of monthly questions `month_q_cnt` and the average number of daily questions `avg_day_q_cnt` (sorted by month in ascending order) for users in each month of 2021, as well as the overall situation of the year. The sample data output is as follows:

| submit_month | month_q_cnt | avg_day_q_cnt |
| ------------- | ---------- | ------------- |
| 202108 | 2 | 0.065 |
| 202109 | 3 | 0.100 |
| 2021 Summary | 5 | 0.161 |

**Explanation**: There are 2 records of question brushing in August 2021, and the average number of questions brushed per day is 2/31=0.065 (retaining 3 decimal places); there are 3 records of brushing questions in September 2021, and the average number of questions brushed per day is 3/30=0.100; there are 5 records of brushing questions in 2021 (the annual summary average has no practical significance, here we calculate based on 31 days 5/31=0.161)

> Niuke has adopted the latest Mysql version. If you get an error when running: ONLY_FULL_GROUP_BY, it means: for GROUP BY aggregation operation, if the column in SELECT does not appear in GROUP BY, then this SQL is illegal because the column is not in the GROUP BY clause, which means that the column found must appear after group by otherwise an error will be reported, or this field appears in the aggregate function.

**Idea:**

When you see the instance data, you will immediately think of the related functions. For example, `submit_month` will use `DATE_FORMAT` to format the date. Then find out the number of questions per month.

Number of questions per month

```sql
SELECT MONTH ( submit_time ), COUNT ( question_id )
FROM
	practice_record
GROUP BY
	MONTH (submit_time)
```

Then in the third column, the `DAY(LAST_DAY(date_value))` function is used to find the number of days in the month of a given date.

The sample code is as follows:

```sql
SELECT DAY(LAST_DAY('2023-07-08')) AS days_in_month;
-- Output: 31

SELECT DAY(LAST_DAY('2023-02-01')) AS days_in_month;
-- Output: 28 (February in a leap year)

SELECT DAY(LAST_DAY(NOW())) AS days_in_current_month;
-- Output: 31 (number of days in current month)
```

Use the `LAST_DAY()` function to get the last day of the month for a given date, then use the `DAY()` function to extract the number of days for that date. This will get the number of days in the specified month.

It should be noted that the `LAST_DAY()` function returns a date value, while the `DAY()` function is used to extract the day part of the date value.

After the above analysis, you can write the answer immediately. The complexity of this question lies in processing the date, and the logic is not difficult.

**Answer**:

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / DAY (LAST_DAY(submit_time)), 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
GROUP BY submit_month
UNION ALL
SELECT '2021 Summary' AS submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / 31, 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
ORDER BY submit_month
```

In the example data output, because the last row needs to get summary data, `UNION ALL` is added to the result set here; don't forget to sort at the end!

### Valid users with more than 1 unfinished test papers (more difficult)

**Description**: Existing test paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` starting answering time, `submit_time` handing in time, `score` score), sample data is as follows:| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82     |
| 6   | 1002 | 9002    | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1006 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |
| 13  | 1007 | 9002    | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89     |

还有一张试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间），示例数据如下：

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL  | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL  | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | 算法 | medium     | 80       | 2020-08-02 10:00:00 |

请统计 2021 年每个未完成试卷作答数大于 1 的有效用户的数据（有效用户指完成试卷作答数至少为 1 且未完成数小于 5），输出用户 ID、未完成试卷作答数、完成试卷作答数、作答过的试卷 tag 集合，按未完成试卷数量由多到少排序。示例数据的输出结果如下：

| uid  | incomplete_cnt | complete_cnt | detail                                                                      |
| ---- | -------------- | ------------ | --------------------------------------------------------------------------- |
| 1002 | 2              | 4            | 2021-09-01:算法;2021-07-02:SQL;2021-09-02:SQL;2021-09-05:SQL;2021-07-05:SQL |

**解释**：2021 年的作答记录中，除了 1004，其他用户均满足有效用户定义，但只有 1002 未完成试卷数大于 1，因此只输出 1002，detail 中是 1002 作答过的试卷{日期:tag}集合，日期和 tag 间用 **:** 连接，多元素间用 **;** 连接。

**思路：**

仔细读题后，分析出：首先要联表，因为后面要输出`tag`；

筛选出 2021 年的数据

```sql
SELECT *
FROM exam_record er
LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
WHERE YEAR (er.start_time)= 2021
```

根据 uid 进行分组，然后对每个用户进行条件进行判断，题目中要求`完成试卷数至少为1,未完成试卷数要大于1，小于5`

那么等会儿写 sql 的时候条件应该是：`未完成 > 1 and 已完成 >=1 and 未完成 < 5`

因为最后要用到字符串的拼接，而且还要组合拼接，这个可以用`GROUP_CONCAT`函数，下面简单介绍一下该函数的用法：

基本格式：

```sql
GROUP_CONCAT([DISTINCT] expr [ORDER BY {unsigned_integer | col_name | expr} [ASC | DESC] [, ...]]             [SEPARATOR sep])
```

- `expr`：要连接的列或表达式。
- `DISTINCT`：可选参数，用于去重。当指定了 `DISTINCT`，相同的值只会出现一次。
- `ORDER BY`：可选参数，用于排序连接后的值。可以选择升序 (`ASC`) 或降序 (`DESC`) 排序。
- `SEPARATOR sep`：可选参数，用于设置连接后的值的分隔符。（本题要用这个参数设置 ; 号 ）

`GROUP_CONCAT()` 函数常用于 `GROUP BY` 子句中，将一组行的值连接为一个字符串，并在结果集中以聚合的形式返回。

**答案**：

```sql
SELECT a.uid,
       SUM(CASE
               WHEN a.submit_time IS NULL THEN 1
           END) AS incomplete_cnt,
       SUM(CASE
               WHEN a.submit_time IS NOT NULL THEN 1
           END) AS complete_cnt,
       GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag)
                    ORDER BY start_time SEPARATOR ";") AS detail
FROM exam_record a
LEFT JOIN examination_info b ON a.exam_id = b.exam_id
WHERE YEAR (a.start_time)= 2021
GROUP BY a.uid
HAVING incomplete_cnt > 1
AND complete_cnt >= 1
AND incomplete_cnt < 5
ORDER BY incomplete_cnt DESC
```

- `SUM(CASE WHEN a.submit_time IS NULL THEN 1 END)` 统计了每个用户未完成的记录数量。
- `SUM(CASE WHEN a.submit_time IS NOT NULL THEN 1 END)` 统计了每个用户已完成的记录数量。
- `GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag) ORDER BY a.start_time SEPARATOR ';')` 将每个用户的考试日期和标签以逗号分隔的形式连接成一个字符串，并按考试开始时间进行排序。

## 嵌套子查询### The category that users who have completed an average of no less than 3 test papers per month like to answer (more difficult)

**Description**: Existing test paper answer record table `exam_record` (`uid`: user ID, `exam_id`: test paper ID, `start_time`: start answering time, `submit_time`: submission time, NULL if not submitted, `score`: score), sample data is as follows:

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-07-02 09:01:01 | (NULL) | (NULL) |
| 2 | 1002 | 9003 | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60 |
| 3 | 1002 | 9002 | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70 |
| 4 | 1002 | 9001 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81 |
| 5 | 1002 | 9002 | 2021-07-06 12:01:01 | (NULL) | (NULL) |
| 6 | 1003 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86 |
| 7 | 1003 | 9003 | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40 |
| 8 | 1003 | 9001 | 2021-09-08 13:01:01 | (NULL) | (NULL) |
| 9 | 1003 | 9002 | 2021-09-08 14:01:01 | (NULL) | (NULL) |
| 10 | 1003 | 9003 | 2021-09-08 15:01:01 | (NULL) | (NULL) |
| 11 | 1005 | 9001 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88 |
| 12 | 1005 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88 |
| 13 | 1005 | 9002 | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89 |

Test paper information table `examination_info` (`exam_id`: test paper ID, `tag`: test paper category, `difficulty`: test paper difficulty, `duration`: test duration, `release_time`: release time), sample data is as follows:

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | C++ | easy | 60 | 2020-02-01 10:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2020-08-02 10:00:00 |

Please count from the table the categories and number of answers that users who have an "average number of exam papers completed in the month" are not less than 3, and output them in descending order. The sample output is as follows:

| tag | tag_cnt |
| ---- | ------- |
|C++|4|
| SQL | 2 |
| Algorithm | 1 |

**Explanation**: The number of test papers completed by users 1002 and 1005 in September 2021 is 3, and the number of other users is less than 3; then the tag distribution results of the test papers answered by users 1002 and 1005, sorted in descending order by the number of answers, are C++, SQL, and algorithm.

**Idea**: This question investigates the joint subquery, and the focus is on `monthly average answer >=3`, but I personally think it is not clearly stated here. It should be easier to understand if it is just checked in September; here is not >=3 every month or all the number of answers/months. Don't get it wrong.

First check which users answer questions more than three times per month

```sql
SELECT UID
FROM exam_record record
GROUP BY UID,
         MONTH (start_time)
HAVING count(submit_time) >= 3
```

After this step, we can go deeper. As long as we can understand the previous step (I mean not to be bothered by the monthly average in the question), then set up a subquery to check which users are included, and then find out the required columns in the question. Remember to sort! !

```sql
SELECT tag,
       count(start_time) AS tag_cnt
FROM exam_record record
INNER JOIN examination_info info ON record.exam_id = info.exam_id
WHERE UID IN
    (SELECT UID
     FROM exam_record record
     GROUP BY UID,
              MONTH (start_time)
     HAVING count(submit_time) >= 3)
GROUP BY tag
ORDER BY tag_cnt DESC
```

### Number of responders and average score on the day the test paper is released

**Description**: Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time), sample data is as follows:

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 3100 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2100 | 6 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 | 1500 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 1100 | 4 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 5 | 1600 | 6 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | Niuke No. 6 | 3000 | 6 | C++ | 2020-01-01 10:00:00 |

**Interpretation**: User 1001’s nickname is Niuke No. 1, achievement value is 3100, user level is level 7, career direction is algorithm, registration time 2020-01-01 10:00:00

Test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time) Sample data is as follows:

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | C++ | easy | 60 | 2020-02-01 10:00:00 || 3 | 9003 | algorithm | medium | 80 | 2020-08-02 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score) The sample data is as follows:

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-07-02 09:01:01 | 2021-09-01 09:41:01 | 70 |
| 2 | 1002 | 9003 | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60 |
| 3 | 1002 | 9002 | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70 |
| 4 | 1002 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80 |
| 5 | 1002 | 9003 | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60 |
| 6 | 1002 | 9002 | 2021-08-02 12:01:01 | 2021-08-02 12:31:01 | 70 |
| 7 | 1002 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85 |
| 8 | 1002 | 9002 | 2021-07-06 12:01:01 | (NULL) | (NULL) |
| 9 | 1003 | 9002 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86 |
| 10 | 1003 | 9003 | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40 |
| 11 | 1003 | 9003 | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 70 |
| 12 | 1003 | 9001 | 2021-09-08 14:01:01 | (NULL) | (NULL) |
| 13 | 1003 | 9002 | 2021-09-08 15:01:01 | (NULL) | (NULL) |
| 14 | 1005 | 9001 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90 |
| 15 | 1005 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88 |
| 16 | 1005 | 9002 | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89 |

Please calculate the number of users with level 5 or above answering `uv` and the average score `avg_score` of each SQL category test paper after it is released, in descending order of the number of people, and for the same number of people, in ascending order of average score. The sample data output is as follows:

| exam_id | uv | avg_score |
| ------- | --- | --------- |
| 9001 | 3 | 81.3 |

Explanation: There is only one SQL category test paper, and the test paper ID is 9001. On the day of release (2021-09-01), 1001, 1002, 1003, and 1005 answered, but 1003 is a level 5 user, and the other 3 are level 5 or above. The scores of the three of them are [70, 80, 85, 90], and the average score is 81.3 (reserved 1 decimal places).

**Idea**: This question seems very complicated, but first gradually split the "outer" conditions, and then put them together, and the answer will come out. Anyway, remember to work from the outside to the inside for multi-table queries.

First connect the three tables and give some conditions. For example, if the user in the question requires `Level > 5`, then you can find out first

```sql
SELECT DISTINCT u_info.uid
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND u_info.LEVEL > 5
```

Then pay attention to the requirement in the question: `After each sql category test paper is released, users should answer the questions on the same day`. Pay attention to the == on the same day==, then we will immediately think of the need to compare time.

Compare the test paper release date and test start date: `DATE(e_info.release_time) = DATE(record.start_time)`; don’t worry about `submit_time` being null, it will be filtered out in where later.

**Answer**:

```sql
SELECT record.exam_id AS exam_id,
       COUNT(DISTINCT u_info.uid) AS uv,
       ROUND(SUM(record.score) / COUNT(u_info.uid), 1) AS avg_score
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND DATE (e_info.release_time) = DATE (record.start_time)
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
  AND u_info.LEVEL > 5
GROUP BY record.exam_id
ORDER BY uv DESC,
         avg_score ASC
```

Pay attention to the final grouping order! Arrange them first according to the number of people, and if they are consistent, then arrange them according to the average score.

### User level distribution of people who scored more than 80 on the test paper

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 3100 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2100 | 6 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 | 1500 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 1100 | 4 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 5 | 1600 | 6 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | Niuke No. 6 | 3000 | 6 | C++ | 2020-01-01 10:00:00 |

Examination paper information table `examination_info` (`exam_id` examination paper ID, `tag` examination paper category, `difficulty` examination paper difficulty, `duration` examination duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- || 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2   | 9002    | C++  | easy       | 60       | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

试卷作答信息表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 79     |
| 2 | 1002 | 9003 | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60 |
| 3   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 4 | 1002 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80 |
| 5 | 1002 | 9003 | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60 |
| 6 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70 |
| 7 | 1002 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85 |
| 8   | 1002 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 9 | 1003 | 9002 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86 |
| 10 | 1003 | 9003 | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40 |
| 11 | 1003 | 9003 | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 81 |
| 12  | 1003 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 13 | 1003 | 9002 | 2021-09-08 15:01:01 | (NULL) | (NULL) |
| 14 | 1005 | 9001 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90 |
| 15 | 1005 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88 |
| 16 | 1005 | 9002 | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89 |

统计作答 SQL 类别的试卷得分大于过 80 的人的用户等级分布，按数量降序排序（保证数量都不同）。 The sample data result output is as follows:

| level | level_cnt |
| ----- | --------- |
| 6 | 2 |
| 5 | 1 |

Explanation: 9001 is a SQL-type test paper. There are 3 people who answered this test paper with a score greater than 80 points: 1002, 1003, and 1005, two at level 6 and one at level 5.

**Idea:** This question is the same as the previous question, but the query conditions have changed. If you understand the previous question, you can solve this question in minutes.

**Answer**:

```sql
SELECT u_info.LEVEL AS LEVEL,
       count(u_info.uid) AS level_cnt
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND record.score > 80
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
GROUP BY LEVEL
ORDER BY level_cnt DESC
```

## Combined query

### The number of people and times that each question and each test paper was answered

**Description**:

现有试卷作答记录表 exam_record（uid 用户 ID, exam_id 试卷 ID, start_time 开始作答时间, submit_time 交卷时间, score 得分）：

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 81 |
| 2 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70 |
| 3   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 4 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70 |
| 5 | 1004 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85 |
| 6 | 1002 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |

Question practice table practice_record (uid user ID, question_id question ID, submit_time submission time, score score):

| id | uid | question_id | submit_time | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1 | 1001 | 8001 | 2021-08-02 11:41:01 | 60 |
| 2 | 1002 | 8001 | 2021-09-02 19:30:01 | 50 |
| 3 | 1002 | 8001 | 2021-09-02 19:20:01 | 70 |
| 4 | 1002 | 8002 | 2021-09-02 19:38:01 | 70 |
| 5 | 1003 | 8001 | 2021-08-02 19:38:01 | 70 |
| 6 | 1003 | 8001 | 2021-08-02 19:48:01 | 90 |
| 7   | 1003 | 8002        | 2021-08-01 19:38:01 | 80    |

请统计每个题目和每份试卷被作答的人数和次数，分别按照"试卷"和"题目"的 uv & pv 降序显示，示例数据结果输出如下：

| tid | uv | pv |
| ---- | --- | --- |
| 9001 | 3 | 3 |
| 9002 | 1 | 3 |
| 8001 | 3 | 5 |
| 8002 | 2 | 2 |

**解释**：“试卷”有 3 人共练习 3 次试卷 9001，1 人作答 3 次 9002；“刷题”有 3 人刷 5 次 8001，有 2 人刷 2 次 8002**Idea**: The difficulty and error-prone point of this question lies in the simultaneous use of `UNION` and `ORDER BY`

There are the following situations: using `union` and multiple `order by` without brackets, an error will be reported!

`order by` has no effect in clauses joined by `union`;

For example, without parentheses:

```sql
SELECT exam_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM exam_record
GROUP BY exam_id
ORDER BY uv DESC,
         pvDESC
UNION
SELECT question_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM practice_record
GROUP BY question_id
ORDER BY uv DESC,
         pvDESC
```

Report a syntax error directly. If there are no brackets, there can only be one `order by`

There is also a situation where `order by` does not work, but it works in clauses of clauses. The solution here is to put another layer of query outside.

**Answer**:

```sql
SELECT *
FROM
  (SELECT exam_id AS tid,
          COUNT(DISTINCT exam_record.uid) uv,
          COUNT(*)pv
   FROM exam_record
   GROUP BY exam_id
   ORDER BY uv DESC, pv DESC) t1
UNION
SELECT *
FROM
  (SELECT question_id AS tid,
          COUNT(DISTINCT practice_record.uid) uv,
          COUNT(*)pv
   FROM practice_record
   GROUP BY question_id
   ORDER BY uv DESC, pv DESC) t2;
```

### People who satisfy two activities respectively

**Description**: In order to promote more users to learn and improve on the Niuke platform, we will often provide benefits to some users who are both active and perform well. Suppose we had two operations in the past, and issued welfare coupons to those who scored 85 points on each test paper (activity1), and to those who completed the difficult test paper in half the time at least once with a score greater than 80 (activity2).

Now, you need to screen out the people who satisfy these two activities at once and hand them over to the operations students. Please write a SQL implementation: Output the IDs and activity numbers of all people who can score 85 points on every test paper in 2021, and those who have completed a difficult test paper in half the time at least once with a score greater than 80. Sort the output by user ID.

Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | C++ | easy | 60 | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81 |
| 2 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70 |
| 3 | 1003 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | **86** |
| 4 | 1003 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 89 |
| 5 | 1004 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85 |

Sample data output:

| uid | activity |
| ---- | --------- |
| 1001 | activity2 |
| 1003 | activity1 |
| 1004 | activity1 |
| 1004 | activity2 |

**Explanation**: User 1001's minimum score of 81 does not meet activity 1, but he completed the 60-minute test paper in 29 minutes and 59 seconds with a score of 81, which meets activity 2; 1003's minimum score of 86 meets activity 1, and the completion time is greater than half of the test paper length, which does not meet activity 2; User 1004 completed the test paper in exactly half the time (30 minutes) and scored 85, which meets activity 1 and activity 2.

**Idea**: This question involves time subtraction, and you need to use the `TIMESTAMPDIFF()` function to calculate the minute difference between two timestamps.

Let’s take a look at the basic usage

Example:

```sql
TIMESTAMPDIFF(MINUTE, start_time, end_time)
```

The first parameter of the `TIMESTAMPDIFF()` function is the time unit. Here we choose `MINUTE` to return the minute difference. The second parameter is the earlier timestamp and the third parameter is the later timestamp. The function returns the difference in minutes between them

After understanding the usage of this function, let's go back and look at the requirements of `activity1`. Just ask for the score to be greater than 85. So let's write this out first, and the subsequent ideas will be much clearer.

```sql
SELECT DISTINCT UID
FROM exam_record
WHERE score >= 85
  AND YEAR (start_time) = '2021'
```

According to condition 2, then write `people who completed the difficult test paper in half the time and scored more than 80'

```sql
SELECT UID
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND (TIMESTAMPDIFF(MINUTE, start_time, submit_time)) < (info.duration / 2)
  AND difficulty = 'hard'
  AND score >= 80
```

Then just `UNION` the two. (Special attention should be paid to the bracket problem and the position of `order by` here. The specific usage has been mentioned in the previous article)

**Answer**:

```sql
SELECT DISTINCT UID UID,
                    'activity1' activity
FROM exam_record
WHERE UID not in
    (SELECT UID
     FROM exam_record
     WHERE score<85
       AND YEAR(submit_time) = 2021 )
UNION
SELECT DISTINCT UID UID,
                    'activity2' activity
FROM exam_record e_r
LEFT JOIN examination_info e_i ON e_r.exam_id = e_i.exam_id
WHERE YEAR(submit_time) = 2021
  AND difficulty = 'hard'
  AND TIMESTAMPDIFF(SECOND, start_time, submit_time) <= duration *30
  AND score>80
ORDER BY UID
```

## Connection query

### The number of test papers completed and the number of question exercises (difficulty) for users who meet the conditions

**Description**:Existing user information table user_info (uid user ID, nick_name nickname, achievement achievement value, level level, job career direction, register_time registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 3100 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2300 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 | 2500 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 1200 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 5 | 1600 | 6 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | Niuke No. 6 | 2000 | 6 | C++ | 2020-01-01 10:00:00 |

Examination paper information table examination_info (exam_id examination paper ID, tag examination paper category, difficulty examination paper difficulty, duration examination duration, release_time release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | C++ | hard | 60 | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

Examination paper answer record table exam_record (uid user ID, exam_id examination paper ID, start_time start answering time, submit_time submission time, score score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1 | 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81 |
| 2 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81 |
| 3 | 1003 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86 |
| 4 | 1003 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89 |
| 5 | 1004 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85 |
| 6 | 1005 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85 |
| 7 | 1006 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84 |
| 8 | 1006 | 9001 | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 80 |

Question practice record table practice_record (uid user ID, question_id question ID, submit_time submission time, score score):

| id | uid | question_id | submit_time | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1 | 1001 | 8001 | 2021-08-02 11:41:01 | 60 |
| 2 | 1002 | 8001 | 2021-09-02 19:30:01 | 50 |
| 3 | 1002 | 8001 | 2021-09-02 19:20:01 | 70 |
| 4 | 1002 | 8002 | 2021-09-02 19:38:01 | 70 |
| 5 | 1004 | 8001 | 2021-08-02 19:38:01 | 70 |
| 6 | 1004 | 8002 | 2021-08-02 19:48:01 | 90 |
| 7 | 1001 | 8002 | 2021-08-02 19:38:01 | 70 |
| 8 | 1004 | 8002 | 2021-08-02 19:48:01 | 90 |
| 9 | 1004 | 8002 | 2021-08-02 19:58:01 | 94 |
| 10 | 1004 | 8003 | 2021-08-02 19:38:01 | 70 |
| 11 | 1004 | 8003 | 2021-08-02 19:48:01 | 90 |
| 12 | 1004 | 8003 | 2021-08-01 19:38:01 | 80 |

Please find famous experts whose average scores on the difficult SQL test papers are greater than 80 and who are level 7, count their total number of completed test papers and total number of practice questions in 2021, and only retain users who have completed test paper records in 2021. The results are in ascending order by the number of completed test papers and in descending order by the number of practice questions.

Sample data output is as follows:

| uid | exam_cnt | question_cnt |
| ---- | -------- | ------------ |
| 1001 | 1 | 2 |
| 1003 | 2 | 0 |

Explanation: Users 1001, 1003, 1004, and 1006 meet the requirements of the high-difficulty SQL test paper with an average score greater than 80, but only 1001 and 1003 are level 7 famous bosses; 1001 completed 1 test paper 1001 and practiced the questions 2 times; 1003 completed 2 test papers 9001, 9002, question not practiced (so count is 0)

**Idea:**

First conduct preliminary screening of conditions, for example, first find users who have taken difficult SQL test papers

```sql
SELECT
	record.uid
FROM
	exam_record record
	INNER JOIN examination_info e_info ON record.exam_id = e_info.exam_id
	JOIN user_info u_info ON record.uid = u_info.uid
WHERE
	e_info.tag = 'SQL'
	AND e_info.difficulty = 'hard'
```

Then according to the requirements of the question, just add the conditions;

But here’s something to note:

First: You cannot put the `YEAR(submit_time)= 2021` condition at the end, but in the `ON` condition, because there is a situation where the left join returns all the rows of the left table and the right table is null. The purpose of placing it in the `ON` clause of the `JOIN` condition is to ensure that when connecting two tables, only records that meet the year condition will be connected. This prevents records from other years from being included in the results. That is, 1001 has taken the 2021 test paper but has not practiced it. If the condition is placed at the end, this situation will be eliminated.

Second, it must be `COUNT(distinct er.exam_id) exam_cnt, COUNT(distinct pr.id) question_cnt, `should be added distinct, because there are many duplicate values ​​​​generated by left joins.

**Answer**:

```sql
SELECT er.uid AS UID,
       count(DISTINCT er.exam_id) AS exam_cnt,
       count(DISTINCT pr.id) AS question_cnt
FROM exam_recorder
LEFT JOIN practice_record pr ON er.uid = pr.uid
AND YEAR (er.submit_time)= 2021
AND YEAR (pr.submit_time)= 2021
WHERE er.uid IN
    (SELECT er.uid
     FROM exam_recorder
     LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
     LEFT JOIN user_info ui ON er.uid = ui.uid
     WHERE tag = 'SQL'
       AND difficulty = 'hard'
       AND LEVEL = 7
     GROUP BY er.uid
     HAVING avg(score) > 80)
GROUP BY er.uid
ORDER BY exam_cnt,
         question_cnt DESC```

Careful friends may find out why user 1003 can still find two exam records despite clearly limiting the conditions to `tag = 'SQL' AND difficulty = 'hard'`, one of which has an exam `tag` of `C++`; This is due to the characteristics of `LEFT JOIN`, even if there are no rows matching the right table, all records in the left table will still be retained.

### Activity status of each level 6/7 user (difficult)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 3100 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2300 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 | 2500 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 1200 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 5 | 1600 | 6 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | Niuke No. 6 | 2600 | 7 | C++ | 2020-01-01 10:00:00 |

Examination paper information table `examination_info` (`exam_id` examination paper ID, `tag` examination paper category, `difficulty` examination paper difficulty, `duration` examination duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | C++ | easy | 60 | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| uid | exam_id | start_time | submit_time | score |
| ---- | ------- | ------------------- | ------------------- | ------ |
| 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78 |
| 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81 |
| 1005 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85 |
| 1005 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85 |
| 1006 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:21:59 | 84 |
| 1006 | 9001 | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 81 |
| 1002 | 9001 | 2020-09-01 13:01:01 | 2020-09-01 13:41:01 | 81 |
| 1005 | 9001 | 2021-09-01 14:01:01 | (NULL) | (NULL) |

Question practice record table `practice_record` (`uid` user ID, `question_id` question ID, `submit_time` submission time, `score` score):

| uid | question_id | submit_time | score |
| ---- | ----------- | ------------------- | ----- |
| 1001 | 8001 | 2021-08-02 11:41:01 | 60 |
| 1004 | 8001 | 2021-08-02 19:38:01 | 70 |
| 1004 | 8002 | 2021-08-02 19:48:01 | 90 |
| 1001 | 8002 | 2021-08-02 19:38:01 | 70 |
| 1004 | 8002 | 2021-08-02 19:48:01 | 90 |
| 1006 | 8002 | 2021-08-04 19:58:01 | 94 |
| 1006 | 8003 | 2021-08-03 19:38:01 | 70 |
| 1006 | 8003 | 2021-08-02 19:48:01 | 90 |
| 1006 | 8003 | 2020-08-01 19:38:01 | 80 |

Please count the total number of active months, number of active days in 2021, number of active days in answering test papers in 2021, and number of active days in answering questions for each level 6/7 user, and sort them in descending order according to the total number of active months and number of active days in 2021. The output from the sample data is as follows:

| uid | act_month_total | act_days_2021 | act_days_2021_exam |
| ---- | --------------- | ------------- | ------------------ |
| 1006 | 3 | 4 | 1 |
| 1001 | 2 | 2 | 1 |
| 1005 | 1 | 1 | 1 |
| 1002 | 1 | 0 | 0 |
| 1003 | 0 | 0 | 0 |

**Explanation**: There are 5 level 6/7 users, of which 1006 was active for a total of 3 months in 202109, 202108, and 202008. The active dates in 2021 are 20210907, 20210804, 20210803, and 20210802 for a total of 4 days. In 2021, it is in the test paper answer area. 20210907 has been active for 1 day and has been active in the question practice area for 3 days.

**Idea:**

The key to this question lies in the use of `CASE WHEN THEN`, otherwise you have to write a lot of `left join` because it will produce a lot of result sets.

The `CASE WHEN THEN` statement is a conditional expression used in SQL to perform different operations or return different results based on conditions.

The syntax structure is as follows:

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE result
END
```

In this structure, you can add multiple WHEN clauses as needed, each WHEN clause is followed by a condition and a result. The condition can be any logical expression. If the condition is met, the corresponding result will be returned.

The final ELSE clause is optional and is used to specify the default return result when all previous conditions are not met. If no `ELSE` clause is provided, `NULL` is returned by default.For example:

```sql
SELECT score,
    CASE
        WHEN score >= 90 THEN 'Excellent'
        WHEN score >= 80 THEN 'Good'
        WHEN score >= 60 THEN 'pass'
        ELSE 'failed'
    END AS grade
FROM student_scores;
```

In the above example, the CASE WHEN THEN statement is used to return the corresponding grade based on different ranges of student scores. If the score is greater than or equal to 90, "Excellent" is returned; if the score is greater than or equal to 80, "Good" is returned; if the score is greater than or equal to 60, "Pass" is returned; otherwise, "Fail" is returned.

After understanding the above usage, look back at the question and ask to list different active days.

```sql
count(distinct act_month) as act_month_total,
count(distinct case when year(act_time)='2021'then act_day end) as act_days_2021,
count(distinct case when year(act_time)='2021' and tag='exam' then act_day end) as act_days_2021_exam,
count(distinct case when year(act_time)='2021' and tag='question'then act_day end) as act_days_2021_question
```

The tag here is given first to facilitate the differentiation of queries and to separate exams and answers.

Find the users in the test paper answer area

```sql
SELECT
		uid,
		exam_id AS ans_id,
		start_time AS act_time,
		date_format( start_time, '%Y%m' ) AS act_month,
		date_format( start_time, '%Y%m%d' ) AS act_day,
		'exam' AS tag
	FROM
		exam_record
```

Then there are the users in the question and answer area.

```sql
SELECT
		uid,
		question_id AS ans_id,
		submit_time AS act_time,
		date_format( submit_time, '%Y%m' ) AS act_month,
		date_format( submit_time, '%Y%m%d' ) AS act_day,
		'question' AS tag
	FROM
		practice_record
```

Finally, `UNION` the two results. Finally, don’t forget to sort the results (this question is somewhat similar to the idea of ​​divide and conquer)

**Answer**:

```sql
SELECT user_info.uid,
       count(DISTINCT act_month) AS act_month_total,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021' THEN act_day
                      END) AS act_days_2021,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'exam' THEN act_day
                      END) AS act_days_2021_exam,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'question' THEN act_day
                      END) AS act_days_2021_question
FROM
  (SELECT UID,
          exam_id AS ans_id,
          start_time AS act_time,
          date_format(start_time, '%Y%m') AS act_month,
          date_format(start_time, '%Y%m%d') AS act_day,
          'exam' AS tag
   FROM exam_record
   UNION ALL SELECT UID,
                    question_id AS ans_id,
                    submit_time AS act_time,
                    date_format(submit_time, '%Y%m') AS act_month,
                    date_format(submit_time, '%Y%m%d') AS act_day,
                    'question' AS tag
   FROM practice_record) total
RIGHT JOIN user_info ON total.uid = user_info.uid
WHERE user_info.LEVEL IN (6,
                          7)
GROUP BY user_info.uid
ORDER BY act_month_total DESC,
         act_days_2021 DESC
```

<!-- @include: @article-footer.snippet.md -->