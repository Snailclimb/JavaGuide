---
title: Summary of common SQL interview questions (4)
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, window function, ROW_NUMBER, ranking, grouping, MySQL 8
  - - meta
    - name: description
      content: Summarizes the usage of window functions introduced in MySQL 8, including high-frequency questions and implementation techniques for sorting and grouping statistical scenarios.
---

> The question comes from: [Niuke Question Ba - SQL Advanced Challenge](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

You can decide whether to skip more difficult or difficult questions based on your actual situation and interview needs.

##Specialized window functions

MySQL version 8.0 introduced support for window functions. The following are common window functions and their usage in MySQL:

1. `ROW_NUMBER()`: Assign a unique integer value to each row in the query result set.

```sql
SELECT col1, col2, ROW_NUMBER() OVER (ORDER BY col1) AS row_num
FROM table;
```

2. `RANK()`: Calculate the ranking of each row in the sorted results.

```sql
SELECT col1, col2, RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

3. `DENSE_RANK()`: Calculate the ranking of each row in the sorted results, keeping the same ranking.

```sql
SELECT col1, col2, DENSE_RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

4. `NTILE(n)`: Divide the results into n substantially uniform buckets and assign an identification number to each bucket.

```sql
SELECT col1, col2, NTILE(4) OVER (ORDER BY col1) AS bucket
FROM table;
```

5. `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()`: These aggregate functions can also be used in conjunction with window functions to calculate the summary, average, count, minimum and maximum values of specified columns within the window.

```sql
SELECT col1, col2, SUM(col1) OVER () AS sum_col
FROM table;
```

6. `LEAD()` and `LAG()`: The LEAD function is used to get the value of the row at an offset after the current row, while the LAG function is used to get the value of the row at an offset before the current row.

```sql
SELECT col1, col2, LEAD(col1, 1) OVER (ORDER BY col1) AS next_col1,
                 LAG(col1, 1) OVER (ORDER BY col1) AS prev_col1
FROM table;
```

7. `FIRST_VALUE()` and `LAST_VALUE()`: The FIRST_VALUE function is used to get the first value of the specified column in the window, and the LAST_VALUE function is used to get the last value of the specified column in the window.

```sql
SELECT col1, col2, FIRST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS first_val,
                 LAST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS last_val
FROM table;
```

Window functions usually need to be used together with the OVER clause to define the size, sorting rules and grouping method of the window.

### The top three scores in each type of test paper

**Description**:

Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` submission time, score score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78 |
| 2 | 1002 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81 |
| 3 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81 |
| 4 | 1003 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86 |
| 5 | 1003 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89 |
| 6 | 1004 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85 |
| 7 | 1005 | 9003 | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85 |
| 8 | 1006 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84 |
| 9 | 1003 | 9003 | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40 |
| 10 | 1003 | 9002 | 2021-09-01 14:01:01 | (NULL) | (NULL) |

Find the top 3 scores for each type of test paper. If the two have the same maximum score, choose the one with the larger minimum score. If they are still the same, choose the one with the larger uid. The output from the sample data is as follows:

| tid | uid | ranking |
| ---- | ---- | ------- |
| SQL | 1003 | 1 |
| SQL | 1004 | 2 |
| SQL | 1002 | 3 |
| Algorithm | 1005 | 1 |
| Algorithm | 1006 | 2 |
| Algorithm | 1003 | 3 |

**Explanation**: The test paper tags with answer score records include SQL and algorithm. SQL test paper users 1001, 1002, 1003, and 1004 have answer scores. The highest scores are 81, 81, 89, and 85 respectively, and the lowest scores are 78, 81, 86, and 40. Therefore, the top three are ranked according to the highest score first and then the lowest score, which are 1003, 1004, and 1002.

**Answer**:

```sql
SELECT tag,
       UID,
       ranking
FROM
  (SELECT b.tag AS tag,
          a.uid AS UID,
          ROW_NUMBER() OVER (PARTITION BY b.tag
                             ORDER BY b.tag,
                                      max(a.score) DESC,
                                      min(a.score) DESC,
                                      a.uid DESC) AS ranking
   FROM exam_record a
   LEFT JOIN examination_info b ON a.exam_id = b.exam_id
   GROUP BY b.tag,
            a.uid) t
WHERE ranking <= 3```

### The second fastest/slowest test paper whose time difference is greater than half the test paper length (more difficult)

**Description**:

Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2021-09-01 06:00:00 |
| 2 | 9002 | C++ | hard | 60 | 2021-09-01 06:00:00 |
| 3 | 9003 | algorithm | medium | 80 | 2021-09-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2021-09-01 09:01:01 | 2021-09-01 09:51:01 | 78 |
| 2 | 1001 | 9002 | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81 |
| 3 | 1002 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81 |
| 4 | 1003 | 9001 | 2021-09-01 19:01:01 | 2021-09-01 19:59:01 | 86 |
| 5 | 1003 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89 |
| 6 | 1004 | 9002 | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85 |
| 7 | 1005 | 9001 | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85 |
| 8 | 1006 | 9001 | 2021-09-07 10:02:01 | 2021-09-07 10:21:01 | 84 |
| 9 | 1003 | 9001 | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40 |
| 10 | 1003 | 9002 | 2021-09-01 14:01:01 | (NULL) | (NULL) |
| 11 | 1005 | 9001 | 2021-09-01 14:01:01 | (NULL) | (NULL) |
| 12 | 1003 | 9003 | 2021-09-08 15:01:01 | (NULL) | (NULL) |

Find the test paper information where the difference between the second fastest and the second slowest time is greater than half of the test paper length, and sort by test paper ID in descending order. The output from the sample data is as follows:

| exam_id | duration | release_time |
| ------- | -------- | ------------------- |
| 9001 | 60 | 2021-09-01 06:00:00 |

**Explanation**: Test paper 9001 takes 50 minutes, 58 minutes, 30 minutes and 1 second, 19 minutes, and 10 minutes. The difference between the second fastest and the second slowest time is 50 minutes - 19 minutes = 31 minutes. The test paper duration is 60 minutes. Therefore, the condition of being greater than half of the test paper length is met, and the test paper ID, duration, and release time are output.

**Idea:**

The first step is to find the sequential ranking and reverse ranking of the completion time of each test paper, which is Table a;

In the second step, establish an inner connection with the passed test paper information table b, group it according to the test paper id, use `having` to filter the ranking into the second data, convert seconds into minutes and compare, and finally sort according to the test paper id in reverse order.

**Answer**:

```sql
SELECT a.exam_id,
       b.duration,
       b.release_time
FROM
  (SELECT exam_id,
          row_number() OVER (PARTITION BY exam_id
                             ORDER BY timestampdiff(SECOND, start_time, submit_time) DESC) rn1,
          row_number() OVER (PARTITION BY exam_id
                            ORDER BY timestampdiff(SECOND, start_time, submit_time) ASC) rn2,
                                              timestampdiff(SECOND, start_time, submit_time) timex
   FROM exam_record
   WHERE score IS NOT NULL ) a
INNER JOIN examination_info b ON a.exam_id = b.exam_id
GROUP BY a.exam_id
HAVING (max(IF (rn1 = 2, a.timex, 0))- max(IF (rn2 = 2, a.timex, 0)))/ 60 > b.duration / 2
ORDER BY a.exam_id DESC
```

### The maximum time window for answering the test paper twice in a row (more difficult)

**Description**

Existing exam paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` starting answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1 | 1006 | 9003 | 2021-09-07 10:01:01 | 2021-09-07 10:21:02 | 84 |
| 2 | 1006 | 9001 | 2021-09-01 12:11:01 | 2021-09-01 12:31:01 | 89 |
| 3 | 1006 | 9002 | 2021-09-06 10:01:01 | 2021-09-06 10:21:01 | 81 |
| 4 | 1005 | 9002 | 2021-09-05 10:01:01 | 2021-09-05 10:21:01 | 81 |
| 5 | 1005 | 9001 | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81 |

Please calculate among those who have answered the test paper on at least two days in 2021, calculate the maximum time window `days_window` for answering the test paper twice in a row in that year, then according to the historical rules of the year, how many sets of test papers he will take on average in `days_window` days, sort in reverse order by the maximum time window and the average number of sets of answer papers. The output from the sample data is as follows:

| uid | days_window | avg_exam_cnt |
| ---- | ----------- | ------------ |
| 1006 | 6 | 2.57 |**Explanation**: User 1006 answered 3 test papers in 20210901, 20210906, and 20210907 respectively. The maximum time window for two consecutive responses is 6 days (1st to 6th). He took a total of 3 test papers in the 7 days from 1st to 7th. On average, 3/7=0.428571 papers per day, so on average he will do 3 test papers in 6 days. 0.428571\*6=2.57 test papers (keep two decimal places); User 1005 took two test papers in 20210905, but only had one day's answer records, so filter them out.

**Idea:**

The above explanation reminds you to remove duplicates from the answer records. Don’t be fooled and don’t delete duplicates! If you remove duplicates, the test case will fail. Note that the restriction is in 2021;

And please note that the time difference is +1 day; also note that == unsubmitted papers are also counted ==! ! ! ! (Anyway, I feel that the description of this question is unclear and the answer is not very good)

**Answer**:

```sql
SELECT UID,
       max(datediff(next_time, start_time)) + 1 AS days_window,
       round(count(start_time)/(datediff(max(start_time), min(start_time))+ 1) * (max(datediff(next_time, start_time))+ 1), 2) AS avg_exam_cnt
FROM
  (SELECT UID,
          start_time,
          lead(start_time, 1) OVER (PARTITION BY UID
                                    ORDER BY start_time) AS next_time
   FROM exam_record
   WHERE YEAR (start_time) = '2021' ) a
GROUP BY UID
HAVING count(DISTINCT date(start_time)) > 1
ORDER BY days_window DESC,
         avg_exam_cnt DESC
```

### The completion status of users who have not completed 0 in the past three months

**Description**:

Existing test paper answer record table `exam_record` (`uid`: user ID, `exam_id`: test paper ID, `start_time`: start answering time, `submit_time`: handing in time, if it is empty, it means not completed, `score`: score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1006 | 9003 | 2021-09-06 10:01:01 | 2021-09-06 10:21:02 | 84 |
| 2 | 1006 | 9001 | 2021-08-02 12:11:01 | 2021-08-02 12:31:01 | 89 |
| 3 | 1006 | 9002 | 2021-06-06 10:01:01 | 2021-06-06 10:21:01 | 81 |
| 4 | 1006 | 9002 | 2021-05-06 10:01:01 | 2021-05-06 10:21:01 | 81 |
| 5 | 1006 | 9001 | 2021-05-01 12:01:01 | (NULL) | (NULL) |
| 6 | 1001 | 9001 | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81 |
| 7 | 1001 | 9003 | 2021-08-01 09:01:01 | 2021-08-01 09:51:11 | 78 |
| 8 | 1001 | 9002 | 2021-07-01 09:01:01 | 2021-07-01 09:31:00 | 81 |
| 9 | 1001 | 9002 | 2021-07-01 12:01:01 | 2021-07-01 12:31:01 | 81 |
| 10 | 1001 | 9002 | 2021-07-01 12:01:01 | (NULL) | (NULL) |

Find the number of test paper completions for users who have no test paper in the unfinished status in the last three months for each person who has test paper answer records, and rank them in descending order by the number of test paper completions and user ID. The output from the sample data is as follows:

| uid | exam_complete_cnt |
| ---- | ------------------ |
| 1006 | 3 |

**Explanation**: User 1006 has answered test papers in the last three months of 202109, 202108, and 202106, and the number of answered test papers is 3, all of which have been completed; User 1001 has answered test papers in the last three months of 202109, 202108, and 202107, and the number of answered test papers is 5, and the number of completed test papers is 4. Because there are unfinished test papers, they are filtered out.

**Idea:**

1. `Find the number of completed test papers for users who have no test paper answer records in the past three months and have no test paper answer records.` First of all, look at this sentence. You must first group them according to people.
2. In the past three months, you can use continuous repeated ranking, sort in reverse order, ranking <=3
3. Count the number of answers
4. Assemble remaining conditions
5. Sort

**Answer**:

```sql
SELECT UID,
       count(score) exam_complete_cnt
FROM
  (SELECT *, DENSE_RANK() OVER (PARTITION BY UID
                             ORDER BY date_format(start_time, '%Y%m') DESC) dr
   FROM exam_record) t1
WHERE dr <= 3
GROUP BY UID
HAVING count(dr)= count(score)
ORDER BY exam_complete_cnt DESC,
         UID DESC
```

### Response status of the 50% users with high incompleteness rate in the past three months (difficult)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 3200 | 7 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2500 | 6 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 2200 | 5 | Algorithm | 2020-01-01 10:00:00 |

Examination paper information table `examination_info` (`exam_id` examination paper ID, `tag` examination paper category, `difficulty` examination paper difficulty, `duration` examination duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | SQL | hard | 80 | 2020-01-01 10:00:00 |
| 3 | 9003 | Algorithm | hard | 80 | 2020-01-01 10:00:00 |
| 4 | 9004 | PYTHON | medium | 70 | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90    |
| 15  | 1002 | 9001    | 2020-01-01 18:01:01 | 2020-01-01 18:59:02 | 90    |
| 13  | 1001 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 2   | 1002 | 9001    | 2020-01-20 10:01:01 |                     |       |
| 3   | 1002 | 9001    | 2020-02-01 12:11:01 |                     |       |
| 5   | 1001 | 9001    | 2020-03-01 12:01:01 |                     |       |
| 6   | 1002 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90    |
| 4   | 1003 | 9001    | 2020-03-01 19:01:01 |                     |       |
| 7   | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90    |
| 14  | 1001 | 9002    | 2020-01-01 12:11:01 |                     |       |
| 8   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 9   | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10  | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 11  | 1002 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 12  | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 17  | 1001 | 9002    | 2020-05-05 18:01:01 |                     |       |
| 16  | 1002 | 9003    | 2020-05-06 12:01:01 |                     |       |

请统计 SQL 试卷上未完成率较高的 50%用户中，6 级和 7 级用户在有试卷作答记录的近三个月中，每个月的答卷数目和完成数目。按用户 ID、月份升序排序。

由示例数据结果输出如下：

| uid  | start_month | total_cnt | complete_cnt |
| ---- | ----------- | --------- | ------------ |
| 1002 | 202002      | 3         | 1            |
| 1002 | 202003      | 2         | 1            |
| 1002 | 202005      | 2         | 1            |

解释：各个用户对 SQL 试卷的未完成数、作答总数、未完成率如下：

| uid  | incomplete_cnt | total_cnt | incomplete_rate |
| ---- | -------------- | --------- | --------------- |
| 1001 | 3              | 7         | 0.4286          |
| 1002 | 4              | 8         | 0.5000          |
| 1003 | 1              | 1         | 1.0000          |

1001、1002、1003 分别排在 1.0、0.5、0.0 的位置，因此较高的 50%用户（排位<=0.5）为 1002、1003；

1003 不是 6 级或 7 级；

有试卷作答记录的近三个月为 202005、202003、202002；

这三个月里 1002 的作答题数分别为 3、2、2，完成数目分别为 1、1、1。

**思路：**

注意点：这题注意求的是所有的答题次数和完成次数，而 sql 类别的试卷是限制未完成率排名，6, 7 级用户限制的是做题记录。

先求出未完成率的排名

```sql
SELECT UID,
       count(submit_time IS NULL
             OR NULL)/ count(start_time) AS num,
       PERCENT_RANK() OVER (
                            ORDER BY count(submit_time IS NULL
                                           OR NULL)/ count(start_time)) AS ranking
FROM exam_record
LEFT JOIN examination_info USING (exam_id)
WHERE tag = 'SQL'
GROUP BY UID
```

再求出最近三个月的练习记录

```sql
SELECT UID,
       date_format(start_time, '%Y%m') AS month_d,
       submit_time,
       exam_id,
       dense_rank() OVER (PARTITION BY UID
                          ORDER BY date_format(start_time, '%Y%m') DESC) AS ranking
FROM exam_record
LEFT JOIN user_info USING (UID)
WHERE LEVEL IN (6,7)
```

**答案**：

```sql
SELECT t1.uid,
       t1.month_d,
       count(*) AS total_cnt,
       count(t1.submit_time) AS complete_cnt
FROM-- 先求出未完成率的排名

  (SELECT UID,
          count(submit_time IS NULL OR NULL)/ count(start_time) AS num,
          PERCENT_RANK() OVER (
                               ORDER BY count(submit_time IS NULL OR NULL)/ count(start_time)) AS ranking
   FROM exam_record
   LEFT JOIN examination_info USING (exam_id)
   WHERE tag = 'SQL'
   GROUP BY UID) t
INNER JOIN
  (-- 再求出近三个月的练习记录
 SELECT UID,
        date_format(start_time, '%Y%m') AS month_d,
        submit_time,
        exam_id,
        dense_rank() OVER (PARTITION BY UID
                           ORDER BY date_format(start_time, '%Y%m') DESC) AS ranking
   FROM exam_record
   LEFT JOIN user_info USING (UID)
   WHERE LEVEL IN (6,7) ) t1 USING (UID)
WHERE t1.ranking <= 3 AND t.ranking >= 0.5 -- 使用限制找到符合条件的记录

GROUP BY t1.uid,
         t1.month_d
ORDER BY t1.uid,
         t1.month_d```

### 试卷完成数同比 2020 年的增长率及排名变化（困难）

**描述**：

现有试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id  | exam_id | tag    | difficulty | duration | release_time        |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL    | hard       | 60       | 2021-01-01 10:00:00 |
| 2   | 9002    | C++    | hard       | 80       | 2021-01-01 10:00:00 |
| 3   | 9003    | 算法   | hard       | 80       | 2021-01-01 10:00:00 |
| 4   | 9004    | PYTHON | medium     | 70       | 2021-01-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2020-08-02 10:01:01 | 2020-08-02 10:31:01 | 89    |
| 2   | 1002 | 9001    | 2020-04-01 18:01:01 | 2020-04-01 18:59:02 | 90    |
| 3   | 1001 | 9001    | 2020-04-01 09:01:01 | 2020-04-01 09:21:59 | 80    |
| 5   | 1002 | 9001    | 2021-03-02 19:01:01 | 2021-03-02 19:32:00 | 20    |
| 8   | 1003 | 9001    | 2021-05-02 12:01:01 | 2021-05-02 12:31:01 | 98    |
| 13  | 1003 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 9   | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10  | 1002 | 9002    | 2021-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 11  | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 16  | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 17  | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 18  | 1001 | 9002    | 2021-05-05 18:01:01 |                     |       |
| 4   | 1002 | 9003    | 2021-01-20 10:01:01 | 2021-01-20 10:10:01 | 81    |
| 6   | 1001 | 9003    | 2021-04-02 19:01:01 | 2021-04-02 19:40:01 | 89    |
| 15  | 1002 | 9003    | 2021-01-01 18:01:01 | 2021-01-01 18:59:02 | 90    |
| 7   | 1004 | 9004    | 2020-05-02 12:01:01 | 2020-05-02 12:20:01 | 99    |
| 12  | 1001 | 9004    | 2021-09-02 12:11:01 |                     |       |
| 14  | 1002 | 9004    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83    |

请计算 2021 年上半年各类试卷的做完次数相比 2020 年上半年同期的增长率（百分比格式，保留 1 位小数），以及做完次数排名变化，按增长率和 21 年排名降序输出。

由示例数据结果输出如下：

| tag | exam_cnt_20 | exam_cnt_21 | growth_rate | exam_cnt_rank_20 | exam_cnt_rank_21 | rank_delta |
| --- | ----------- | ----------- | ----------- | ---------------- | ---------------- | ---------- |
| SQL | 3           | 2           | -33.3%      | 1                | 2                | 1          |

解释：2020 年上半年有 3 个 tag 有作答完成的记录，分别是 C++、SQL、PYTHON，它们被做完的次数分别是 3、3、2，做完次数排名为 1、1（并列）、3；

2021 年上半年有 2 个 tag 有作答完成的记录，分别是算法、SQL，它们被做完的次数分别是 3、2，做完次数排名为 1、2；具体如下：

| tag    | start_year | exam_cnt | exam_cnt_rank |
| ------ | ---------- | -------- | ------------- |
| C++    | 2020       | 3        | 1             |
| SQL    | 2020       | 3        | 1             |
| PYTHON | 2020       | 2        | 3             |
| 算法   | 2021       | 3        | 1             |
| SQL    | 2021       | 2        | 2             |

因此能输出同比结果的 tag 只有 SQL，从 2020 到 2021 年，做完次数 3=>2，减少 33.3%（保留 1 位小数）；排名 1=>2，后退 1 名。

**思路：**

本题难点在于长整型的数据类型要求不能有负号产生，用 cast 函数转换数据类型为 signed。

以及用到的`增长率计算公式：(exam_cnt_21-exam_cnt_20)/exam_cnt_20`

做完次数排名变化（2021 年和 2020 年比排名升了或者降了多少）

计算公式：`exam_cnt_rank_21 - exam_cnt_rank_20`

在 MySQL 中，`CAST()` 函数用于将一个表达式的数据类型转换为另一个数据类型。它的基本语法如下：

```sql
CAST(expression AS data_type)

-- 将一个字符串转换成整数
SELECT CAST('123' AS INT);
```

示例就不一一举例了，这个函数很简单

**答案**：

```sql
SELECT
  tag,
  exam_cnt_20,
  exam_cnt_21,
  concat(
    round(
      100 * (exam_cnt_21 - exam_cnt_20) / exam_cnt_20,
      1
    ),
    '%'
  ) AS growth_rate,
  exam_cnt_rank_20,
  exam_cnt_rank_21,
  cast(exam_cnt_rank_21 AS signed) - cast(exam_cnt_rank_20 AS signed) AS rank_delta
FROM
  (
    #2020年、2021年上半年各类试卷的做完次数和做完次数排名
    SELECT
      tag,
      count(
        IF (
          date_format(start_time, '%Y%m%d') BETWEEN '20200101'
          AND '20200630',
          start_time,
          NULL
        )
      ) AS exam_cnt_20,
      count(
        IF (
          substring(start_time, 1, 10) BETWEEN '2021-01-01'
          AND '2021-06-30',
          start_time,
          NULL
        )
      ) AS exam_cnt_21,
      rank() over (
        ORDER BY
          count(
            IF (
              date_format(start_time, '%Y%m%d') BETWEEN '20200101'
              AND '20200630',
              start_time,
              NULL
            )
          ) DESC
      ) AS exam_cnt_rank_20,
      rank() over (
        ORDER BY
          count(
            IF (
              substring(start_time, 1, 10) BETWEEN '2021-01-01'
              AND '2021-06-30',
              start_time,
              NULL
            )
          ) DESC
      ) AS exam_cnt_rank_21
    FROM
      examination_info
      JOIN exam_record USING (exam_id)
    WHERE
      submit_time IS NOT NULL
    GROUP BY
      tag
  ) main
WHERE
  exam_cnt_21 * exam_cnt_20 <> 0
ORDER BY
  growth_rate DESC,
  exam_cnt_rank_21 DESC
```

## Aggregation window function

### Perform min-max normalization on test paper scores

**Description**:

Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | C++ | hard | 80 | 2020-01-01 10:00:00 |
| 3 | 9003 | Algorithm | hard | 80 | 2020-01-01 10:00:00 |
| 4 | 9004 | PYTHON | medium | 70 | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 6 | 1003 | 9001 | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 68 |
| 9 | 1001 | 9001 | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89 |
| 1 | 1001 | 9001 | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90 |
| 12 | 1002 | 9002 | 2021-05-05 18:01:01 | (NULL) | (NULL) |
| 3 | 1004 | 9002 | 2020-01-01 12:01:01 | 2020-01-01 12:11:01 | 60 |
| 2 | 1003 | 9002 | 2020-01-01 19:01:01 | 2020-01-01 19:30:01 | 75 |
| 7 | 1001 | 9002 | 2020-01-02 12:01:01 | 2020-01-02 12:43:01 | 81 |
| 10 | 1002 | 9002 | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83 |
| 4 | 1003 | 9002 | 2020-01-01 12:01:01 | 2020-01-01 12:41:01 | 90 |
| 5 | 1002 | 9002 | 2020-01-02 19:01:01 | 2020-01-02 19:32:00 | 90 |
| 11 | 1002 | 9004 | 2021-09-06 12:01:01 | (NULL) | (NULL) |
| 8 | 1001 | 9005 | 2020-01-02 12:11:01 | (NULL) | (NULL) |

In physics and statistical data calculation, there is a concept called min-max standardization, also known as dispersion standardization, which is a linear transformation of the original data so that the result value is mapped to [0 - 1].

The conversion function is:

![](https://oss.javaguide.cn/github/javaguide/database/sql/29A377601170AB822322431FCDF7EDFE.png)

Please perform min-max normalization on each test paper's answer record and scale it to the [0,100] interval, and output the user ID, test paper ID, and average score after normalization; finally, output the test paper ID in ascending order and the normalized score in descending order. (Note: The score interval defaults to [0,100]. If there is only one score in the answer record of a certain test paper, there is no need to use a formula. The score will still be the original score after normalization and scaling).

The output from the sample data is as follows:

| uid | exam_id | avg_new_score |
| ---- | ------- | ------------- |
| 1001 | 9001 | 98 |
| 1003 | 9001 | 0 |
| 1002 | 9002 | 88 |
| 1003 | 9002 | 75 |
| 1001 | 9002 | 70 |
| 1004 | 9002 | 0 |

Explanation: The difficult papers are 9001, 9002, and 9003;

There are 3 records of answering 9001, and the scores are 68, 89, and 90 respectively. After normalization according to the given formula, the scores are: 0, 95, 100, and the latter two scores are answered by user 1001. Therefore, user 1001’s new score for test paper 9001 is (95+100)/2≈98 (only the integer part is retained). User 1003’s score for the test paper 9001 has a new score of 0. The final results are output in ascending order of test paper ID and descending order of normalized scores.

**Idea:**

Note:

1. For difficult test papers, use the max/min (col) over() window function to find the maximum and minimum values in each group according to the scores of each type of test paper, and then calculate the normalized formula. The scaling interval is [0,100], that is, min_max\*100
2. If a certain type of test paper has only one score, there is no need to use the normalization formula, because there is only one score max_score=min_score,score, and the result may become 0 after the formula.
3. The final results are grouped by uid and exam_id to find the normalized mean. Those with a score of NULL should be filtered out.

The last thing is to look carefully at the above formula (to be honest, this question seems very convoluted)

**Answer**:

```sql
SELECT
  uid,
  exam_id,
  round(sum(min_max) / count(score), 0) AS avg_new_score
FROM
  (
    SELECT
      *,
      IF (
        max_score = min_score,
        score,
        (score - min_score) / (max_score - min_score) * 100
      ) AS min_max
    FROM
      (
        SELECT
          uid,
          a.exam_id,
          score,
          max(score) over (PARTITION BY a.exam_id) AS max_score,
          min(score) over (PARTITION BY a.exam_id) AS min_score
        FROM
          exam_record a
          LEFT JOIN examination_info b USING (exam_id)
        WHERE
          difficulty = 'hard'
      ) t
    WHERE
      score IS NOT NULL
  ) t1
GROUP BY
  uid,
  exam_id
ORDER BY
  exam_id ASC,
  avg_new_score DESC;
```

### The number of answers per test paper per month and the total number of answers as of the current month

**Description:**

Existing test paper answer record table exam_record (uid user ID, exam_id test paper ID, start_time start answering time, submit_time handover time, score score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ || 1 | 1001 | 9001 | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90 |
| 2 | 1002 | 9001 | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89 |
| 3 | 1002 | 9001 | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83 |
| 4 | 1003 | 9001 | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75 |
| 5 | 1004 | 9001 | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60 |
| 6 | 1003 | 9001 | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90 |
| 7 | 1002 | 9001 | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90 |
| 8 | 1001 | 9002 | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69 |
| 9 | 1004 | 9002 | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99 |
| 10 | 1003 | 9002 | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68 |
| 11 | 1001 | 9002 | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81 |
| 12 | 1001 | 9002 | 2020-03-02 12:11:01 | (NULL) | (NULL) |

Please output the number of responses per month for each test paper and the total number of responses as of the current month.
The output from the sample data is as follows:

| exam_id | start_month | month_cnt | cum_exam_cnt |
| ------- | ----------- | --------- | ----------- |
| 9001 | 202001 | 2 | 2 |
| 9001 | 202002 | 1 | 3 |
| 9001 | 202003 | 3 | 6 |
| 9001 | 202005 | 1 | 7 |
| 9002 | 202001 | 1 | 1 |
| 9002 | 202002 | 3 | 4 |
| 9002 | 202003 | 1 | 5 |

Explanation: Test paper 9001 has been answered in 4 months, 202001, 202002, 202003, and 202005. The number of answers per month is 2, 1, 3, and 1 respectively. The total number of answers as of the current month is 2, 3, 6, and 7.

**Idea:**

This question has two key points: counting the total number of answers as of the current month, outputting the number of monthly responses for each test paper, and outputting the total number of responses as of the current month.

This is the key `**sum(count(*)) over(partition by exam_id order by date_format(start_time,'%Y%m'))**`

**Answer**:

```sql
SELECT exam_id,
       date_format(start_time, '%Y%m') AS start_month,
       count(*) AS month_cnt,
       sum(count(*)) OVER (PARTITION BY exam_id
                           ORDER BY date_format(start_time, '%Y%m')) AS cum_exam_cnt
FROM exam_record
GROUP BY exam_id,
         start_month
```

### Question answering status every month and as of the current month (more difficult)

**Description**: Existing test paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90 |
| 2 | 1002 | 9001 | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89 |
| 3 | 1002 | 9001 | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83 |
| 4 | 1003 | 9001 | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75 |
| 5 | 1004 | 9001 | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60 |
| 6 | 1003 | 9001 | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90 |
| 7 | 1002 | 9001 | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90 |
| 8 | 1001 | 9002 | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69 |
| 9 | 1004 | 9002 | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99 |
| 10 | 1003 | 9002 | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68 |
| 11 | 1001 | 9002 | 2020-01-02 19:01:01 | 2020-02-02 12:43:01 | 81 |
| 12 | 1001 | 9002 | 2020-03-02 12:11:01 | (NULL) | (NULL) |

Please output the number of monthly active users, the number of new users, the maximum number of new users in a single month as of the current month, and the cumulative number of users as of the current month in the monthly test paper response records since the user's answer record was created. The results are output in ascending order of month.

The output from the sample data is as follows:

| start_month | mau | month_add_uv | max_month_add_uv | cum_sum_uv |
| ----------- | --- | ------------ | ---------------- | ---------- |
| 202001 | 2 | 2 | 2 | 2 |
| 202002 | 4 | 2 | 2 | 4 |
| 202003 | 3 | 0 | 2 | 4 |
| 202005 | 1 | 0 | 2 | 4 |

| month | 1001 | 1002 | 1003 | 1004 |
| ------ | ---- | ---- | ---- | ---- |
| 202001 | 1 | 1 | | |
| 202002 | 1 | 1 | 1 | 1 |
| 202003 | 1 | | 1 | 1 |
| 202005 | | 1 | | |As can be seen from the above matrix, there were 2 active users in January 2020 (mau=2), and the number of new users that month was 2;

There were 4 active users in February 2020, the number of new users in that month was 2, the maximum number of new users in a single month was 2, and the current cumulative number of users was 4.

**Idea:**

Difficulties:

1. How to find new users every month

2. Answers as of the current month

Rough process:

(1) Count each person’s first login month `min()`

(2) Statistics of monthly active and new users: first get each person’s first login month, and then sum up the first login month grouping to get the number of new users in that month.

(3) Count the maximum number of new users in a single month as of the current month, the cumulative number of users as of the current month, and finally output them in ascending order by month

**Answer**:

```sql
--The maximum number of new users in a single month as of the current month and the cumulative number of users as of the current month, output in ascending order by month
SELECT
	start_month,
	mau,
	month_add_uv,
	max( month_add_uv ) over ( ORDER BY start_month ),
	sum( month_add_uv ) over ( ORDER BY start_month )
FROM
	(
	-- Statistics of monthly active users and number of new users
	SELECT
		date_format( a.start_time, '%Y%m' ) AS start_month,
		count( DISTINCT a.uid ) AS mau,
		count( DISTINCT b.uid ) AS month_add_uv
	FROM
		exam_record a
		LEFT JOIN (
         -- Count each person's first login month
		SELECT uid, min( date_format( start_time, '%Y%m' )) AS first_month FROM exam_record GROUP BY uid ) b ON date_format( a.start_time, '%Y%m' ) = b.first_month
	GROUP BY
		start_month
	) main
ORDER BY
	start_month
```

<!-- @include: @article-footer.snippet.md -->