---
title: Summary of common SQL interview questions (5)
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, null value processing, statistics, incomplete rate, CASE, aggregation
  - - meta
    - name: description
      Content: Analyzes null value processing and statistics topics, combines CASE and aggregate functions to provide a robust implementation, and avoid common pitfalls.
---

> The question comes from: [Niuke Question Ba - SQL Advanced Challenge](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

You can decide whether to skip more difficult or difficult questions based on your actual situation and interview needs.

## Null value handling

### Count the number of unfinished papers and their unfinished rate

**Description**:

The existing examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` starting answering time, `submit_time` handing in time, `score` score), the data is as follows:

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81 |
| 3 | 1001 | 9001 | 2021-09-02 12:01:01 | (NULL) | (NULL) |

Please count the number of incomplete_cnt and incomplete_rate of the test papers with incomplete status. The output from the sample data is as follows:

| exam_id | incomplete_cnt | complete_rate |
| ------- | -------------- | ------------- |
| 9001 | 1 | 0.333 |

Explanation: Test Paper 9001 has records of being answered three times, of which two were completed and one was incomplete. Therefore, the number of incompletes is 1 and the incomplete rate is 0.333 (retaining 3 decimal places)

**Ideas**:

For this question, you only need to note that one has conditional restrictions and the other does not have conditional restrictions; either query the conditions separately and then merge them; or perform conditional judgment directly in select.

**Answer**:

Writing method 1:

```sql
SELECT
    exam_id,
    (COUNT(*) - COUNT(submit_time)) AS incomplete_cnt,
    ROUND((COUNT(*) - COUNT(submit_time)) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    (COUNT(*) - COUNT(submit_time)) > 0;
```

Use `COUNT(*)` to count the total number of records in the group, `COUNT(submit_time)` only counts the number of records whose `submit_time` field is not NULL (that is, the number of completed records). Subtracting the two is the unfinished number.

Writing method 2:

```sql
SELECT
    exam_id,
    COUNT(CASE WHEN submit_time IS NULL THEN 1 END) AS incomplete_cnt,
    ROUND(COUNT(CASE WHEN submit_time IS NULL THEN 1 END) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    COUNT(CASE WHEN submit_time IS NULL THEN 1 END) > 0;
```

Use a `CASE` expression to return a non-`NULL` value (such as 1) when the condition is met, otherwise return `NULL`. Then use the `COUNT` function to count the number of non-`NULL` values.

Writing method 3:

```sql
SELECT
    exam_id,
    SUM(submit_time IS NULL) AS incomplete_cnt,
    ROUND(SUM(submit_time IS NULL) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    incomplete_cnt > 0;
```

Use the `SUM` function to sum an expression. The expression `(submit_time IS NULL)` evaluates to 1 (TRUE) when `submit_time` is `NULL` and 0 (FALSE) otherwise. Adding these 1s and 0s together gives you the number of outstanding items.

### Average time and average score of high-difficulty test papers for level 0 users

**Description**:

The existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time), the data is as follows:

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 10 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 2100 | 6 | Algorithm | 2020-01-01 10:00:00 |

Test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time), the data is as follows:

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | SQL | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | SQL | easy | 60 | 2020-01-01 10:00:00 |
| 3 | 9004 | algorithm | medium | 80 | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` submission time, `score` score), the data is as follows:

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | (NULL) | (NULL) |
| 3 | 1001 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 4 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20 |
| 5 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 || 6 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 7 | 1002 | 9002 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |

Please output the average test time and average score of all high-difficulty test papers for each level 0 user, the maximum test time and 0-point processing for unfinished default test papers. The output from the sample data is as follows:

| uid | avg_score | avg_time_took |
| ---- | --------- | ------------- |
| 1001 | 33 | 36.7 |

Explanation: There are 1001 level 0 users, 9001 high-difficulty test papers, and there are 3 records of 1001 answering 9001, which took 20 minutes, incomplete (the test paper lasted 60 minutes), and 30 minutes (less than 31 minutes). The scores were 80 points, incomplete (processed with 0 points), and 20 points respectively. Therefore his average time is 110/3=36.7 (rounded to one decimal place) and his average score is 33 points (rounded)

**Idea**: It is most convenient to use `IF` for this question because it involves the judgment of NULL values. Of course, `case when` can also be used, which is very similar. The difficulty of this question lies in the processing of null values. I believe that other query conditions and so on will not be difficult for everyone.

**Answer**:

```sql
SELECT UID,
       round(avg(new_socre)) AS avg_score,
       round(avg(time_diff), 1) AS avg_time_took
FROM
  (SELECT er.uid,
          IF (er.submit_time IS NOT NULL, TIMESTAMPDIFF(MINUTE, start_time, submit_time), ef.duration) AS time_diff,
          IF (er.submit_time IS NOT NULL,er.score,0) AS new_socre
   FROM exam_recorder
   LEFT JOIN user_info uf ON er.uid = uf.uid
   LEFT JOIN examination_info ef ON er.exam_id = ef.exam_id
   WHERE uf.LEVEL = 0 AND ef.difficulty = 'hard' ) t
GROUP BY UID
ORDER BY UID
```

## Advanced conditional statements

### Filter users with limited nickname achievement value and active date (harder)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ----------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 1000 | 2 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Attack No. 3 | 2200 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 2500 | 6 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 5 | 3000 | 7 | C++ | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 3 | 1001 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | (NULL) | (NULL) |
| 4 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20 |
| 6 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 5 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 11 | 1002 | 9001 | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 81 |
| 12 | 1002 | 9002 | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82 |
| 13 | 1002 | 9002 | 2020-02-02 12:11:01 | 2020-02-02 12:31:01 | 83 |
| 7 | 1002 | 9002 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |
| 16 | 1002 | 9001 | 2021-09-06 12:01:01 | 2021-09-06 12:21:01 | 80 |
| 17 | 1002 | 9001 | 2021-09-06 12:01:01 | (NULL) | (NULL) |
| 18 | 1002 | 9001 | 2021-09-07 12:01:01 | (NULL) | (NULL) |
| 8 | 1003 | 9003 | 2021-02-06 12:01:01 | (NULL) | (NULL) |
| 9 | 1003 | 9001 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89 |
| 10 | 1004 | 9002 | 2021-08-06 12:01:01 | (NULL) | (NULL) |
| 14 | 1005 | 9001 | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84 |
| 15 | 1006 | 9001 | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84 |

Question practice record table `practice_record` (`uid` user ID, `question_id` question ID, `submit_time` submission time, `score` score):

| id | uid | question_id | submit_time | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1 | 1001 | 8001 | 2021-08-02 11:41:01 | 60 |
| 2 | 1002 | 8001 | 2021-09-02 19:30:01 | 50 |
| 3 | 1002 | 8001 | 2021-09-02 19:20:01 | 70 |
| 4 | 1002 | 8002 | 2021-09-02 19:38:01 | 70 || 5 | 1003 | 8002 | 2021-09-01 19:38:01 | 80 |

Please find the user information whose nickname starts with "Niuke" and ends with "号", whose achievement value is between 1200 and 2500, and who was last active (answering questions or answering papers) in September 2021.

The output from the sample data is as follows:

| uid | nick_name | achievement |
| ---- | --------- | ----------- |
| 1002 | Niuke No. 2 | 1200 |

**Explanation**: There are 1002 and 1004 whose nicknames start with "Niuke" and end with "号" and have achievement values between 1200 and 2500;

1002 The last active test paper area was September 2021, and the last active question area was September 2021; 1004 The last active test paper area was August 2021, and the question area was not active.

Therefore, only 1002 finally meets the condition.

**Ideas**:

First list the main query statements according to the conditions

Nickname starts with "Niuke" and ends with "number": `nick_name LIKE "牛客%号"`

Achievement value is between 1200~2500: `achievement BETWEEN 1200 AND 2500`

The third condition is limited to September, so just write it directly: `( date_format( record.submit_time, '%Y%m' )= 202109 OR date_format( pr.submit_time, '%Y%m' )= 202109 )`

**Answer**:

```sql
SELECT DISTINCT u_info.uid,
                u_info.nick_name,
                u_info.achievement
FROM user_info u_info
LEFT JOIN exam_record record ON record.uid = u_info.uid
LEFT JOIN practice_record pr ON u_info.uid = pr.uid
WHERE u_info.nick_name LIKE "nickname%"
  AND u_info.achievement BETWEEN 1200
  AND 2500
  AND (date_format(record.submit_time, '%Y%m')= 202109
       OR date_format(pr.submit_time, '%Y%m')= 202109)
GROUP BY u_info.uid
```

### Filter the answer records of nickname rules and test paper rules (more difficult)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 1900 | 2 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 2200 | 5 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 2500 | 6 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 555 | 2000 | 7 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | 666666 | 3000 | 6 | C++ | 2020-01-01 10:00:00 |

Examination paper information table `examination_info` (`exam_id` examination paper ID, `tag` examination paper category, `difficulty` examination paper difficulty, `duration` examination duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | --- | ---------- | -------- | ------------------- |
| 1 | 9001 | C++ | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | c# | hard | 80 | 2020-01-01 10:00:00 |
| 3 | 9003 | SQL | medium | 70 | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | (NULL) | (NULL) |
| 4 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20 |
| 3 | 1001 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 5 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 6 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 11 | 1002 | 9001 | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 81 |
| 16 | 1002 | 9001 | 2021-09-06 12:01:01 | 2021-09-06 12:21:01 | 80 |
| 17 | 1002 | 9001 | 2021-09-06 12:01:01 | (NULL) | (NULL) |
| 18 | 1002 | 9001 | 2021-09-07 12:01:01 | (NULL) | (NULL) |
| 7 | 1002 | 9002 | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90 |
| 12 | 1002 | 9002 | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82 |
| 13 | 1002 | 9002 | 2020-02-02 12:11:01 | 2020-02-02 12:31:01 | 83 |
| 9 | 1003 | 9001 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89 |
| 8 | 1003 | 9003 | 2021-02-06 12:01:01 | (NULL) | (NULL) |
| 10 | 1004 | 9002 | 2021-08-06 12:01:01 | (NULL) | (NULL) |
| 14 | 1005 | 9001 | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84 || 15 | 1006 | 9001 | 2021-02-01 11:01:01 | 2021-09-01 11:31:01 | 84 |

Find the completed test paper IDs and average scores for test paper categories starting with the letter c (such as C, C++, c#, etc.) for users whose nicknames consist of "Niuke" + pure numbers + "号" or pure numbers, and sort them in ascending order by user ID and average score. The output from the sample data is as follows:

| uid | exam_id | avg_score |
| ---- | ------- | --------- |
| 1002 | 9001 | 81 |
| 1002 | 9002 | 85 |
| 1005 | 9001 | 84 |
| 1006 | 9001 | 84 |

Explanation: The users whose nicknames meet the conditions are 1002, 1004, 1005, and 1006;

The test papers starting with c include 9001 and 9002;

Among the answer records that meet the above conditions, the scores for 1002 and 9001 are 81 and 80, with an average score of 81 (80.5 is rounded up to 81);

1002 completed 9002 with scores of 90, 82, and 83, with an average score of 85;

**Ideas**:

It’s still the same as before. Since the conditions are given, write out each condition first.

Find users whose nicknames consist of "Niuke" + pure numbers + "号" or pure numbers: I initially wrote this: `nick_name LIKE 'Nuke% number' OR nick_name REGEXP '^[0-9]+$'`. If there is a "Nike H number" in the table, it will also pass.

So you have to use regular rules here: `nick_name LIKE '^nickel[0-9]+号'`

For test paper categories starting with the letter c: `e_info.tag LIKE 'c%'` or `tag regexp '^c|^C'` The first one can also match the uppercase C

**Answer**:

```sql
SELECT UID,
       exam_id,
       ROUND(AVG(score), 0) avg_score
FROM exam_record
WHERE UID IN
    (SELECT UID
     FROM user_info
     WHERE nick_name RLIKE "^nickname[0-9]+number $"
       OR nick_name RLIKE "^[0-9]+$")
  AND exam_id IN
    (SELECT exam_id
     FROM examination_info
     WHERE tag RLIKE "^[cC]")
  AND score IS NOT NULL
GROUP BY UID,exam_id
ORDER BY UID,avg_score;
```

### Output different situations based on whether the specified record exists (difficulty)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ----------- | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 19 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Attack No. 3 | 22 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 25 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 555 | 2000 | 7 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | 666666 | 3000 | 6 | C++ | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | (NULL) | (NULL) |
| 3 | 1001 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87 |
| 4 | 1001 | 9002 | 2021-09-01 12:01:01 | (NULL) | (NULL) |
| 5 | 1001 | 9003 | 2021-09-02 12:01:01 | (NULL) | (NULL) |
| 6 | 1001 | 9004 | 2021-09-03 12:01:01 | (NULL) | (NULL) |
| 7 | 1002 | 9001 | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 99 |
| 8 | 1002 | 9003 | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82 |
| 9 | 1002 | 9003 | 2020-02-02 12:11:01 | (NULL) | (NULL) |
| 10 | 1002 | 9002 | 2021-05-05 18:01:01 | (NULL) | (NULL) |
| 11 | 1002 | 9001 | 2021-09-06 12:01:01 | (NULL) | (NULL) |
| 12 | 1003 | 9003 | 2021-02-06 12:01:01 | (NULL) | (NULL) |
| 13 | 1003 | 9001 | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89 |

Please filter the data in the table. When the number of uncompleted test papers for any level 0 user is greater than 2, output the number of uncompleted test papers and the uncompleted rate (retaining 3 decimal places) for each level 0 user. If there is no such user, output these two indicators for all users with answer records. Results are sorted in ascending order by incomplete rate.

The output from the sample data is as follows:

| uid | incomplete_cnt | incomplete_rate |
| ---- | -------------- | --------------- |
| 1004 | 0 | 0.000 |
| 1003 | 1 | 0.500 |
| 1001 | 4 | 0.667 |

**Explanation**: There are 1001, 1003, and 1004 level 0 users; the number of test papers they answered and the number of unfinished papers are: 6:4, 2:1, and 0:0 respectively;

There is a level 0 user 1001 whose number of unfinished test papers is greater than 2, so the unfinished number and uncompleted rate of these three users are output (1004 has not answered the test paper, and the unfinished rate is filled with 0 by default, and it is 0.000 after retaining 3 decimal places);

Results are sorted in ascending order by incomplete rate.

Attachment: If 1001 does not satisfy "the number of unfinished test papers is greater than 2", you need to output the two indicators of 1001, 1002, and 1003, because there are only the answer records of these three users in the test paper answer record table.

**Ideas**:

First write out the SQL that may satisfy the condition **"The number of unfinished test papers for level 0 users is greater than 2"**

```sql
SELECT ui.uid UID
FROM user_info ui
LEFT JOIN exam_record er ON ui.uid = er.uid
WHERE ui.uid IN
    (SELECT ui.uid
     FROM user_info ui
     LEFT JOIN exam_record er ON ui.uid = er.uid
     WHERE er.submit_time IS NULL
       AND ui.LEVEL = 0 )
GROUP BY ui.uid
HAVING sum(IF(er.submit_time IS NULL, 1, 0)) > 2```

Then write the SQL query statements for the two situations:

Situation 1. Query the uncompleted rate of test papers for level 0 users with conditional requirements

```sql
SELECT
	tmp1.uid uid,
	sum(
	IF
	( er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0 )) incomplete_cnt,
	round(
		sum(
		IF
		(er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0))/ count(tmp1.uid),
		3
	) incomplete_rate
FROM
	(
	SELECT DISTINCT
		ui.uid
	FROM
		user_info ui
		LEFT JOIN exam_record er ON ui.uid = er.uid
	WHERE
		er.submit_time IS NULL
		AND ui.LEVEL = 0
	) tmp1
	LEFT JOIN exam_record er ON tmp1.uid = er.uid
GROUP BY
	tmp1.uid
ORDER BY
	incomplete_rate
```

Situation 2. Query the uncompletion rate of all yong users who have answer records when there are no conditional requirements.

```sql
SELECT
	ui.uid uid,
	sum( CASE WHEN er.submit_time IS NULL AND er.start_time IS NOT NULL THEN 1 ELSE 0 END ) incomplete_cnt,
	round(
		sum(
		IF
		( er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0 ))/ count( ui.uid ),
		3
	) incomplete_rate
FROM
	user_info ui
	JOIN exam_record er ON ui.uid = er.uid
GROUP BY
	ui.uid
ORDER BY
	incomplete_rate
```

Putting them together is the answer

```sql
WITH host_user AS
  (SELECT ui.uid UID
   FROM user_info ui
   LEFT JOIN exam_record er ON ui.uid = er.uid
   WHERE ui.uid IN
       (SELECT ui.uid
        FROM user_info ui
        LEFT JOIN exam_record er ON ui.uid = er.uid
        WHERE er.submit_time IS NULL
          AND ui.LEVEL = 0 )
   GROUP BY ui.uid
   HAVING sum(IF (er.submit_time IS NULL, 1, 0))> 2),
     tt1AS
  (SELECT tmp1.uid UID,
                   sum(IF (er.submit_time IS NULL
                           AND er.start_time IS NOT NULL, 1, 0)) incomplete_cnt,
                   round(sum(IF (er.submit_time IS NULL
                                 AND er.start_time IS NOT NULL, 1, 0))/ count(tmp1.uid), 3) incomplete_rate
   FROM
     (SELECT DISTINCT ui.uid
      FROM user_info ui
      LEFT JOIN exam_record er ON ui.uid = er.uid
      WHERE er.submit_time IS NULL
        AND ui.LEVEL = 0 ) tmp1
   LEFT JOIN exam_record er ON tmp1.uid = er.uid
   GROUP BY tmp1.uid
   ORDER BY incomplete_rate),
     tt2AS
  (SELECT ui.uid UID,
                 sum(CASE
                         WHEN er.submit_time IS NULL
                              AND er.start_time IS NOT NULL THEN 1
                         ELSE 0
                     END) incomplete_cnt,
                 round(sum(IF (er.submit_time IS NULL
                               AND er.start_time IS NOT NULL, 1, 0))/ count(ui.uid), 3) incomplete_rate
   FROM user_info ui
   JOIN exam_record er ON ui.uid = er.uid
   GROUP BY ui.uid
   ORDER BY incomplete_rate)
  (SELECT tt1.*
   FROM tt1
   LEFT JOIN
     (SELECT UID
      FROM host_user) t1 ON 1 = 1
   WHERE t1.uid IS NOT NULL )
UNION ALL
  (SELECT tt2.*
   FROM tt2
   LEFT JOIN
     (SELECT UID
      FROM host_user) t2 ON 1 = 1
   WHERE t2.uid IS NULL)
```

V2 version (based on the improvements made above, the answer is shortened and the logic is stronger):

```sql
SELECT
	ui.uid,
	SUM(
	IF
	( start_time IS NOT NULL AND score IS NULL, 1, 0 )) AS incomplete_cnt, #3. The number of incomplete test papers
	ROUND( AVG( IF ( start_time IS NOT NULL AND score IS NULL, 1, 0 )), 3 ) AS incomplete_rate #4. Incomplete rate

FROM
	user_info ui
	LEFT JOIN exam_record USING ( uid )
WHERE
CASE

		WHEN (#1. When any level 0 user has more than 2 uncompleted test papers
		SELECT
			MAX(lv0_incom_cnt)
		FROM
			(
			SELECT
				SUM(
				IF
				( score IS NULL, 1, 0 )) AS lv0_incom_cnt
			FROM
				user_info
				JOIN exam_record USING ( uid )
			WHERE
				LEVEL = 0
			GROUP BY
				uid
			) table1
			)> 2 THEN
			uid IN ( #1.1 Find each level 0 user
			SELECT uid FROM user_info WHERE LEVEL = 0 ) ELSE uid IN ( #2. If there is no such user, find the user with the answer record
			SELECT DISTINCT uid FROM exam_record )
		END
		GROUP BY
			ui.uid
	ORDER BY
	incomplete_rate #5.The results are sorted in ascending order by incomplete rate
```

### The proportion of different score performance of each user level (more difficult)

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 19 | 0 | Algorithm | 2020-01-01 10:00:00 || 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 22 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 25 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 555 | 2000 | 7 | C++ | 2020-01-01 10:00:00 |
| 6 | 1006 | 666666 | 3000 | 6 | C++ | 2020-01-01 10:00:00 |

Examination paper answer record table exam_record (uid user ID, exam_id examination paper ID, start_time start answering time, submit_time submission time, score score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 2 | 1001 | 9001 | 2021-05-02 10:01:01 | (NULL) | (NULL) |
| 3 | 1001 | 9002 | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 75 |
| 4 | 1001 | 9002 | 2021-09-01 12:01:01 | 2021-09-01 12:11:01 | 60 |
| 5 | 1001 | 9003 | 2021-09-02 12:01:01 | 2021-09-02 12:41:01 | 90 |
| 6 | 1001 | 9001 | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20 |
| 7 | 1001 | 9002 | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89 |
| 8 | 1001 | 9004 | 2021-09-03 12:01:01 | (NULL) | (NULL) |
| 9 | 1002 | 9001 | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 99 |
| 10 | 1002 | 9003 | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82 |
| 11 | 1002 | 9003 | 2020-02-02 12:11:01 | 2020-02-02 12:41:01 | 76 |

In order to obtain the qualitative performance of the user's answer to the test paper, we divided the test paper scores into four score levels of excellent, medium and poor according to the cut-off point [90, 75, 60] (the cut-off point is divided into the left interval). Please count the proportion of each score level in the completed test papers of people with different user levels (the results are retained to 3 decimal places). Users who have not completed the test paper do not need to output. The results are sorted in descending order of user level and proportion.

The output from the sample data is as follows:

| level | score_grade | ratio |
| ----- | ----------- | ----- |
| 3 | Good | 0.667 |
| 3 | Excellent | 0.333 |
| 0 | Good | 0.500 |
| 0 | Medium | 0.167 |
| 0 | Excellent | 0.167 |
| 0 | Difference | 0.167 |

Explanation: The number of users who have completed the test paper are 1001 and 1002; the user levels and score levels corresponding to the completed test papers are as follows:

| uid | exam_id | score | level | score_grade |
| ---- | ------- | ----- | ----- | ----------- |
| 1001 | 9001 | 80 | 0 | Good |
| 1001 | 9002 | 75 | 0 | Good |
| 1001 | 9002 | 60 | 0 | Medium |
| 1001 | 9003 | 90 | 0 | Excellent |
| 1001 | 9001 | 20 | 0 | Poor |
| 1001 | 9002 | 89 | 0 | Good |
| 1002 | 9001 | 99 | 3 | Excellent |
| 1002 | 9003 | 82 | 3 | Good |
| 1002 | 9003 | 76 | 3 | Good |

Therefore, the proportion of each score level for level 0 users (only 1001) is: excellent 1/6, good 1/6, average 1/6, and poor 3/6; the proportion of each score level for level 3 users (only 1002) is: excellent 1/3, good 2/3. The result is rounded to 3 decimal places.

**Ideas**:

First write out the condition **"Divide the test paper scores into four score levels according to the cut-off points [90, 75, 60]: excellent, medium and poor"**, you can use `case when` here

```sql
CASE
		WHEN a.score >= 90 THEN
		'Excellent'
		WHEN a.score < 90 AND a.score >= 75 THEN
		'good'
		WHEN a.score < 75 AND a.score >= 60 THEN
	'medium' ELSE 'poor'
END
```

The key point of this question is this, the rest is conditional splicing

**Answer**:

```sql
SELECT a.LEVEL,
       a.score_grade,
       ROUND(a.cur_count / b.total_num, 3) AS ratio
FROM
  (SELECT b.LEVEL AS LEVEL,
          (CASE
               WHEN a.score >= 90 THEN 'Excellent'
               WHEN a.score < 90
                    AND a.score >= 75 THEN 'good'
               WHEN a.score < 75
                    AND a.score >= 60 THEN 'medium'
               ELSE 'poor'
           END) AS score_grade,
          count(1) AS cur_count
   FROM exam_record a
   LEFT JOIN user_info b ON a.uid = b.uid
   WHERE a.submit_time IS NOT NULL
   GROUP BY b.LEVEL,
            score_grade) a
LEFT JOIN
  (SELECT b.LEVEL AS LEVEL,
          count(b.LEVEL) AS total_num
   FROM exam_record a
   LEFT JOIN user_info b ON a.uid = b.uid
   WHERE a.submit_time IS NOT NULL
   GROUP BY b.LEVEL) b ON a.LEVEL = b.LEVEL
ORDER BY a.LEVEL DESC,
         ratioDESC
```

## Limited query

### The three people with the earliest registration time

**Description**:

Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time || --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke No. 1 | 19 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-02-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 22 | 0 | Algorithm | 2020-01-02 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 5 | 1005 | Niuke No. 555 | 4000 | 7 | C++ | 2020-01-11 10:00:00 |
| 6 | 1006 | 666666 | 3000 | 6 | C++ | 2020-11-01 10:00:00 |

Please find the 3 people with the earliest registration time. The output from the sample data is as follows:

| uid | nick_name | register_time |
| ---- | ------------ | ------------------- |
| 1001 | Niuke 1 | 2020-01-01 10:00:00 |
| 1003 | Niuke No. 3 ♂ | 2020-01-02 10:00:00 |
| 1004 | Niuke No. 4 | 2020-01-02 11:00:00 |

Explanation: Select the top three after sorting by registration time, and output their user ID, nickname, and registration time.

**Answer**:

```sql
SELECT uid, nick_name, register_time
    FROM user_info
    ORDER BY register_time
    LIMIT 3
```

### Completed the third page of the test paper list on the day of registration (more difficult)

**Description**: Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1 | 1001 | Niuke 1 | 19 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 22 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 25 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 5 | 1005 | Niuke No. 555 | 4000 | 7 | Algorithm | 2020-01-11 10:00:00 |
| 6 | 1006 | Niuke No. 6 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 7 | 1007 | Niuke No. 7 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 8 | 1008 | Niuke No. 8 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 9 | 1009 | Niuke No. 9 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 10 | 1010 | Niuke No. 10 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |
| 11 | 1011 | 666666 | 3000 | 6 | C++ | 2020-01-02 10:00:00 |

Examination paper information table examination_info (exam_id examination paper ID, tag examination paper category, difficulty examination paper difficulty, duration examination duration, release_time release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | algorithm | hard | 60 | 2020-01-01 10:00:00 |
| 2 | 9002 | Algorithm | hard | 80 | 2020-01-01 10:00:00 |
| 3 | 9003 | SQL | medium | 70 | 2020-01-01 10:00:00 |

Examination paper answer record table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1 | 1001 | 9001 | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80 |
| 2 | 1002 | 9003 | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 81 |
| 3 | 1002 | 9002 | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83 |
| 4 | 1003 | 9002 | 2020-01-01 19:01:01 | 2020-01-01 19:30:01 | 75 |
| 5 | 1004 | 9002 | 2020-01-01 12:01:01 | 2020-01-01 12:11:01 | 60 |
| 6 | 1005 | 9002 | 2020-01-01 12:01:01 | 2020-01-01 12:41:01 | 90 |
| 7 | 1006 | 9001 | 2020-01-02 19:01:01 | 2020-01-02 19:32:00 | 20 |
| 8 | 1007 | 9002 | 2020-01-02 19:01:01 | 2020-01-02 19:40:01 | 89 |
| 9 | 1008 | 9003 | 2020-01-02 12:01:01 | 2020-01-02 12:20:01 | 99 |
| 10 | 1008 | 9001 | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 98 |
| 11 | 1009 | 9002 | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 82 |
| 12 | 1010 | 9002 | 2020-01-02 12:11:01 | 2020-01-02 12:41:01 | 76 |
| 13 | 1011 | 9001 | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89 |

![](https://oss.javaguide.cn/github/javaguide/database/sql/D2B491866B85826119EE3474F10D3636.png)Those who are looking for a job as an algorithm engineer and have completed the algorithm test paper on the day of registration will be ranked according to the highest scores in all exams they have taken. The ranking list is very long. We will display it in pages, with 3 items per page. Now you need to take out the information of the people on page 3 (the page number starts from 1).

The output from the sample data is as follows:

| uid | level | register_time | max_score |
| ---- | ----- | ------------------- | --------- |
| 1010 | 0 | 2020-01-02 11:00:00 | 76 |
| 1003 | 0 | 2020-01-01 10:00:00 | 75 |
| 1004 | 0 | 2020-01-01 11:00:00 | 60 |

Explanation: Except for 1011, all other users are looking for algorithm engineers; there are 9001 and 9002 algorithm test papers, and all 11 users completed the algorithm test papers on the day of registration; calculating the maximum time points of all their exams, only 1002 and 1008 completed two exams, and the others only completed one exam. The highest score for 1002 in the two exams was 81, and the highest score for 1008 was 99.

Ranking by highest score is as follows:

| uid | level | register_time | max_score |
| ---- | ----- | ------------------- | --------- |
| 1008 | 0 | 2020-01-02 11:00:00 | 99 |
| 1005 | 7 | 2020-01-01 10:00:00 | 90 |
| 1007 | 0 | 2020-01-02 11:00:00 | 89 |
| 1002 | 3 | 2020-01-01 10:00:00 | 83 |
| 1009 | 0 | 2020-01-02 11:00:00 | 82 |
| 1001 | 0 | 2020-01-01 10:00:00 | 80 |
| 1010 | 0 | 2020-01-02 11:00:00 | 76 |
| 1003 | 0 | 2020-01-01 10:00:00 | 75 |
| 1004 | 0 | 2020-01-01 11:00:00 | 60 |
| 1006 | 0 | 2020-01-02 11:00:00 | 20 |

There are 3 items per page, and the third page is the 7th to 9th items. Just return row records of 1010, 1003, and 1004.

**Ideas**:

1. Three items per page, that is, the information of the person on the third page needs to be retrieved, so `limit` must be used.

2. Statistics of people who are looking for jobs as algorithm engineers and who have completed the algorithm test paper on the day of registration and the scores for each record. First find the users who meet the conditions, and then use left join to connect to find the information and the scores for each record.

**Answer**:

```sql
SELECT t1.uid,
       LEVEL,
       register_time,
       max(score) AS max_score
FROM exam_record t
JOIN examination_info USING (exam_id)
JOIN user_info t1 ON t.uid = t1.uid
AND date(t.submit_time) = date(t1.register_time)
WHERE job = 'algorithm'
  AND tag = 'algorithm'
GROUP BY t1.uid,
         LEVEL,
         register_time
ORDER BY max_score DESC
LIMIT 6,3
```

## Text conversion function

### Repair serialized records

**Description**: Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` exam duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | -------------- | ---------- | -------- | ------------------- |
| 1 | 9001 | algorithm | hard | 60 | 2021-01-01 10:00:00 |
| 2 | 9002 | Algorithm | hard | 80 | 2021-01-01 10:00:00 |
| 3 | 9003 | SQL | medium | 70 | 2021-01-01 10:00:00 |
| 4 | 9004 | Algorithm,medium,80 | | 0 | 2021-01-01 10:00:00 |

A student who recorded the questions accidentally entered the test category tag, difficulty, and duration of some records into the tag field at the same time. Please help find these incorrect records, split them, and output them in the correct column type.

The output from the sample data is as follows:

| exam_id | tag | difficulty | duration |
| ------- | ---- | ---------- | -------- |
| 9004 | algorithm | medium | 80 |

**Ideas**:

Let’s first learn the functions used in this question

The `SUBSTRING_INDEX` function is used to extract the portion of a string with a specified delimiter. It accepts three parameters: the original string, the delimiter, and the number of parts specified to be returned.

The following is the syntax of the `SUBSTRING_INDEX` function:

```sql
SUBSTRING_INDEX(str, delimiter, count)
```

- `str`: the original string to be split.
- `delimiter`: string or character used as delimiter.
- `count`: Specifies the number of parts to return.
  - If `count` is greater than 0, return the first `count` parts starting from the left (bounded by the delimiter).
  - If `count` is less than 0, return the first `count` parts (bounded by the delimiter) starting from the right, counting from the right to the left.

Here are some examples demonstrating the use of the `SUBSTRING_INDEX` function:

1. Extract the first part of the string:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', 1);
   -- Output result: 'apple'
   ```

2. Extract the last part of the string:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', -1);
   -- Output result: 'cherry'
   ```

3. Extract the first two parts of the string:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', 2);
   -- Output result: 'apple,banana'
   ```

4. Extract the last two parts of the string:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', -2);
   -- Output result: 'banana,cherry'
   ```

**Answer**:

```sql
SELECT
	exam_id,
	substring_index( tag, ',', 1 ) tag,
	substring_index( substring_index( tag, ',', 2 ), ',',- 1 ) difficulty,
	substring_index( tag, ',',- 1 ) duration
FROM
	examination_info
WHERE
	difficulty = ''
```

### Interception processing of nicknames that are too long

**Description**: Existing user information table `user_info` (`uid` user ID, `nick_name` nickname, `achievement` achievement value, `level` level, `job` career direction, `register_time` registration time):

| id | uid | nick_name | achievement | level | job | register_time |
| --- | ---- | ----------------------- | ----------- | ----- | ---- | ------------------- || 1 | 1001 | Niuke 1 | 19 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 2 | 1002 | Niuke No. 2 | 1200 | 3 | Algorithm | 2020-01-01 10:00:00 |
| 3 | 1003 | Niuke No. 3 ♂ | 22 | 0 | Algorithm | 2020-01-01 10:00:00 |
| 4 | 1004 | Niuke No. 4 | 25 | 0 | Algorithm | 2020-01-01 11:00:00 |
| 5 | 1005 | Niuke No. 5678901234 | 4000 | 7 | Algorithm | 2020-01-11 10:00:00 |
| 6 | 1006 | Niuke No. 67890123456789 | 25 | 0 | Algorithm | 2020-01-02 11:00:00 |

Some users' nicknames are particularly long, which may cause style confusion in some display scenarios. Therefore, particularly long nicknames need to be converted before outputting. Please output user information with more than 10 characters. For users with more than 13 characters, output the first 10 characters and then add three periods: "...".

The output from the sample data is as follows:

| uid | nick_name |
| ---- | ------------------ |
| 1005 | Niuke No. 5678901234 |
| 1006 | Niuke 67890123... |

Explanation: There are 1005 and 1006 users with more than 10 characters, and the lengths are 13 and 17 respectively; therefore, the output of the nickname of 1006 needs to be truncated.

**Ideas**:

This question involves character calculation. To calculate the number of characters in a string (that is, the length of the string), you can use the `LENGTH` function or the `CHAR_LENGTH` function. The difference between these two functions is the way multibyte characters are treated.

1. `LENGTH` function: It returns the number of bytes of the given string. For strings containing multibyte characters, each character is counted as a byte.

Example:

```sql
SELECT LENGTH('Hello'); -- Output result: 6, because each Chinese character in 'Hello' occupies 3 bytes each
```

1. `CHAR_LENGTH` function: It returns the number of characters of the given string. For strings containing multibyte characters, each character is counted as one character.

Example:

```sql
SELECT CHAR_LENGTH('Hello'); -- Output result: 2, because there are two characters in 'Hello', that is, two Chinese characters
```

**Answer**:

```sql
SELECT
	uid,
CASE

		WHEN CHAR_LENGTH( nick_name ) > 13 THEN
		CONCAT( SUBSTR( nick_name, 1, 10 ), '...' ) ELSE nick_name
	END AS nick_name
FROM
	user_info
WHERE
	CHAR_LENGTH( nick_name ) > 10
GROUP BY
	uid;
```

### Filter statistics when case is confused (difficult)

**Description**:

Existing test paper information table `examination_info` (`exam_id` test paper ID, `tag` test paper category, `difficulty` test paper difficulty, `duration` test duration, `release_time` release time):

| id | exam_id | tag | difficulty | duration | release_time |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1 | 9001 | algorithm | hard | 60 | 2021-01-01 10:00:00 |
| 2 | 9002 | C++ | hard | 80 | 2021-01-01 10:00:00 |
| 3 | 9003 | C++ | hard | 80 | 2021-01-01 10:00:00 |
| 4 | 9004 | sql | medium | 70 | 2021-01-01 10:00:00 |
| 5 | 9005 | C++ | hard | 80 | 2021-01-01 10:00:00 |
| 6 | 9006 | C++ | hard | 80 | 2021-01-01 10:00:00 |
| 7 | 9007 | C++ | hard | 80 | 2021-01-01 10:00:00 |
| 8 | 9008 | SQL | medium | 70 | 2021-01-01 10:00:00 |
| 9 | 9009 | SQL | medium | 70 | 2021-01-01 10:00:00 |
| 10 | 9010 | SQL | medium | 70 | 2021-01-01 10:00:00 |

Examination paper answer information table `exam_record` (`uid` user ID, `exam_id` test paper ID, `start_time` start answering time, `submit_time` handing in time, `score` score):

| id | uid | exam_id | start_time | submit_time | score |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1 | 1001 | 9001 | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 80 |
| 2 | 1002 | 9003 | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 81 |
| 3 | 1002 | 9002 | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83 |
| 4 | 1003 | 9002 | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75 |
| 5 | 1004 | 9002 | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60 |
| 6 | 1005 | 9002 | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90 |
| 7 | 1006 | 9001 | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 20 |
| 8 | 1007 | 9003 | 2020-01-02 19:01:01 | 2020-01-02 19:40:01 | 89 |
| 9 | 1008 | 9004 | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99 |
| 10 | 1008 | 9001 | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 98 |
| 11 | 1009 | 9002 | 2020-02-02 12:01:01 | 2020-01-02 12:43:01 | 81 |
| 12 | 1010 | 9001 | 2020-01-02 12:11:01 | (NULL) | (NULL) |
| 13 | 1010 | 9001 | 2020-02-02 12:01:01 | 2020-01-02 10:31:01 | 89 |

The category tags of the test paper may have mixed case. Please first filter out the category tags with less than 3 answers in the test paper, and count the corresponding number of answers in the original test paper after converting them to uppercase.

If the tag has not changed after conversion, the result will not be output.

The output from the sample data is as follows:

| tag | answer_cnt |
| --- | ---------- |
|C++|6|

Explanation: The papers that have been answered include 9001, 9002, 9003, and 9004. Their tags and the number of times they have been answered are as follows:

| exam_id | tag | answer_cnt |
| ------- | ---- | ---------- || 9001 | Algorithm | 4 |
| 9002 | C++ | 6 |
| 9003 | c++ | 2 |
| 9004 | sql | 2 |

Tags with less than 3 answers include c++ and sql. However, after being converted to uppercase, only C++ has an original answer count. Therefore, the output number of c++ after being converted to uppercase is 6.

**Ideas**:

First of all, this question is a bit confusing. According to the sample data, 9004 is found only once, but here it is shown that there are two times.

Let’s take a look at the case conversion function first:

1. The `UPPER(s)` or `UCASE(s)` function can convert all alphabetic characters in the string s into uppercase letters;

2. The `LOWER(s)` or `LCASE(s)` function can convert all alphabetic characters in the string s into lowercase letters.

The difficulty is that when joining the same table, you need to query different values.

**Answer**:

```sql
WITH a AS
  (SELECT tag,
          COUNT(start_time) AS answer_cnt
   FROM exam_recorder
   JOIN examination_info ei ON er.exam_id = ei.exam_id
   GROUP BY tag)
SELECT a.tag,
       b.answer_cnt
FROM a
INNER JOIN a AS b ON UPPER(a.tag)= b.tag #a lower case b upper case
AND a.tag != b.tag
WHERE a.answer_cnt < 3;
```

<!-- @include: @article-footer.snippet.md -->