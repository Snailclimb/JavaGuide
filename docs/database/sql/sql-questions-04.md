---
title: SQL常见面试题总结（4）
category: 数据库
tag:
  - 数据库基础
  - SQL
---

> 题目来源于：[牛客题霸 - SQL 进阶挑战](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

较难或者困难的题目可以根据自身实际情况和面试需要来决定是否要跳过。

## 专用窗口函数

MySQL 8.0 版本引入了窗口函数的支持，下面是 MySQL 中常见的窗口函数及其用法：

1. `ROW_NUMBER()`: 为查询结果集中的每一行分配一个唯一的整数值。

```sql
SELECT col1, col2, ROW_NUMBER() OVER (ORDER BY col1) AS row_num
FROM table;
```

2. `RANK()`: 计算每一行在排序结果中的排名。

```sql
SELECT col1, col2, RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

3. `DENSE_RANK()`: 计算每一行在排序结果中的排名，保留相同的排名。

```sql
SELECT col1, col2, DENSE_RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

4. `NTILE(n)`: 将结果分成 n 个基本均匀的桶，并为每个桶分配一个标识号。

```sql
SELECT col1, col2, NTILE(4) OVER (ORDER BY col1) AS bucket
FROM table;
```

5. `SUM()`, `AVG()`,`COUNT()`, `MIN()`, `MAX()`: 这些聚合函数也可以与窗口函数结合使用，计算窗口内指定列的汇总、平均值、计数、最小值和最大值。

```sql
SELECT col1, col2, SUM(col1) OVER () AS sum_col
FROM table;
```

6. `LEAD()` 和 `LAG()`: LEAD 函数用于获取当前行之后的某个偏移量的行的值，而 LAG 函数用于获取当前行之前的某个偏移量的行的值。

```sql
SELECT col1, col2, LEAD(col1, 1) OVER (ORDER BY col1) AS next_col1,
                 LAG(col1, 1) OVER (ORDER BY col1) AS prev_col1
FROM table;
```

7. `FIRST_VALUE()` 和 `LAST_VALUE()`: FIRST_VALUE 函数用于获取窗口内指定列的第一个值，LAST_VALUE 函数用于获取窗口内指定列的最后一个值。

```sql
SELECT col1, col2, FIRST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS first_val,
                 LAST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS last_val
FROM table;
```

窗口函数通常需要配合 OVER 子句一起使用，用于定义窗口的大小、排序规则和分组方式。

### 每类试卷得分前三名

**描述**：

现有试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id   | exam_id | tag  | difficulty | duration | release_time        |
| ---- | ------- | ---- | ---------- | -------- | ------------------- |
| 1    | 9001    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 2    | 9002    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 3    | 9003    | 算法 | medium     | 80       | 2021-09-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, score 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1    | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78     |
| 2    | 1002 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 3    | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 4    | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86     |
| 5    | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89     |
| 6    | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 7    | 1005 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 8    | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84     |
| 9    | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 10   | 1003 | 9002    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |

找到每类试卷得分的前 3 名，如果两人最大分数相同，选择最小分数大者，如果还相同，选择 uid 大者。由示例数据结果输出如下：

| tid  | uid  | ranking |
| ---- | ---- | ------- |
| SQL  | 1003 | 1       |
| SQL  | 1004 | 2       |
| SQL  | 1002 | 3       |
| 算法 | 1005 | 1       |
| 算法 | 1006 | 2       |
| 算法 | 1003 | 3       |

**解释**：有作答得分记录的试卷 tag 有 SQL 和算法，SQL 试卷用户 1001、1002、1003、1004 有作答得分，最高得分分别为 81、81、89、85，最低得分分别为 78、81、86、40，因此先按最高得分排名再按最低得分排名取前三为 1003、1004、1002。

**答案**：

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
WHERE ranking <= 3
```

### 第二快/慢用时之差大于试卷时长一半的试卷（较难）

**描述**：

现有试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id   | exam_id | tag  | difficulty | duration | release_time        |
| ---- | ------- | ---- | ---------- | -------- | ------------------- |
| 1    | 9001    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 2    | 9002    | C++  | hard       | 60       | 2021-09-01 06:00:00 |
| 3    | 9003    | 算法 | medium     | 80       | 2021-09-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1    | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:51:01 | 78     |
| 2    | 1001 | 9002    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 3    | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 4    | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:59:01 | 86     |
| 5    | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89     |
| 6    | 1004 | 9002    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 7    | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 8    | 1006 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84     |
| 9    | 1003 | 9001    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 10   | 1003 | 9002    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 11   | 1005 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 12   | 1003 | 9003    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |

找到第二快和第二慢用时之差大于试卷时长的一半的试卷信息，按试卷 ID 降序排序。由示例数据结果输出如下：

| exam_id | duration | release_time        |
| ------- | -------- | ------------------- |
| 9001    | 60       | 2021-09-01 06:00:00 |

**解释**：试卷 9001 被作答用时有 50 分钟、50 分钟、30 分 1 秒、11 分钟、10 分钟，第二快和第二慢用时之差为 50 分钟-11 分钟=39 分钟，试卷时长为 60 分钟，因此满足大于试卷时长一半的条件，输出试卷 ID、时长、发布时间。

**思路：**

第一步，找到每张试卷完成时间的顺序排名和倒序排名 也就是表 a；

第二步，与通过试卷信息表 b 建立内连接，并根据试卷 id 分组，利用`having`筛选排名为第二个数据，将秒转化为分钟并进行比较，最后再根据试卷 id 倒序排序就行

**答案**：

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

### 连续两次作答试卷的最大时间窗（较难）

**描述**

现有试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score |
| ---- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1    | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:02 | 84    |
| 2    | 1006 | 9001    | 2021-09-01 12:11:01 | 2021-09-01 12:31:01 | 89    |
| 3    | 1006 | 9002    | 2021-09-06 10:01:01 | 2021-09-06 10:21:01 | 81    |
| 4    | 1005 | 9002    | 2021-09-05 10:01:01 | 2021-09-05 10:21:01 | 81    |
| 5    | 1005 | 9001    | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81    |

请计算在 2021 年至少有两天作答过试卷的人中，计算该年连续两次作答试卷的最大时间窗 `days_window`，那么根据该年的历史规律他在 `days_window` 天里平均会做多少套试卷，按最大时间窗和平均做答试卷套数倒序排序。由示例数据结果输出如下：

| uid  | days_window | avg_exam_cnt |
| ---- | ----------- | ------------ |
| 1006 | 6           | 2.57         |

**解释**：用户 1006 分别在 20210901、20210906、20210907 作答过 3 次试卷，连续两次作答最大时间窗为 6 天（1 号到 6 号），他 1 号到 7 号这 7 天里共做了 3 张试卷，平均每天 3/7=0.428571 张，那么 6 天里平均会做 0.428571\*6=2.57 张试卷（保留两位小数）；用户 1005 在 20210905 做了两张试卷，但是只有一天的作答记录，过滤掉。

**思路：**

上面这个解释中提示要对作答记录去重，千万别被骗了，不要去重！去重就通不过测试用例。注意限制时间是 2021 年；

而且要注意时间差要+1 天；还要注意==没交卷也算在内==！！！！ （反正感觉这题描述不清，出的不是很好）

**答案**：

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

### 近三个月未完成为 0 的用户完成情况

**描述**：

现有试卷作答记录表 `exam_record`（`uid`:用户 ID, `exam_id`:试卷 ID, `start_time`:开始作答时间, `submit_time`:交卷时间，为空的话则代表未完成, `score`:得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1    | 1006 | 9003    | 2021-09-06 10:01:01 | 2021-09-06 10:21:02 | 84     |
| 2    | 1006 | 9001    | 2021-08-02 12:11:01 | 2021-08-02 12:31:01 | 89     |
| 3    | 1006 | 9002    | 2021-06-06 10:01:01 | 2021-06-06 10:21:01 | 81     |
| 4    | 1006 | 9002    | 2021-05-06 10:01:01 | 2021-05-06 10:21:01 | 81     |
| 5    | 1006 | 9001    | 2021-05-01 12:01:01 | (NULL)              | (NULL) |
| 6    | 1001 | 9001    | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81     |
| 7    | 1001 | 9003    | 2021-08-01 09:01:01 | 2021-08-01 09:51:11 | 78     |
| 8    | 1001 | 9002    | 2021-07-01 09:01:01 | 2021-07-01 09:31:00 | 81     |
| 9    | 1001 | 9002    | 2021-07-01 12:01:01 | 2021-07-01 12:31:01 | 81     |
| 10   | 1001 | 9002    | 2021-07-01 12:01:01 | (NULL)              | (NULL) |

找到每个人近三个有试卷作答记录的月份中没有试卷是未完成状态的用户的试卷作答完成数，按试卷完成数和用户 ID 降序排名。由示例数据结果输出如下：

| uid  | exam_complete_cnt |
| ---- | ----------------- |
| 1006 | 3                 |

**解释**：用户 1006 近三个有作答试卷的月份为 202109、202108、202106，作答试卷数为 3，全部完成；用户 1001 近三个有作答试卷的月份为 202109、202108、202107，作答试卷数为 5，完成试卷数为 4，因为有未完成试卷，故过滤掉。

**思路:**

1. `找到每个人近三个有试卷作答记录的月份中没有试卷是未完成状态的用户的试卷作答完成数`首先看这句话，肯定要先根据人进行分组
2. 最近三个月，可以采用连续重复排名，倒序排列，排名<=3
3. 统计作答数
4. 拼装剩余条件
5. 排序

**答案**：

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

### 未完成率较高的 50%用户近三个月答卷情况（困难）

**描述**：

现有用户信息表 `user_info`（`uid` 用户 ID，`nick_name` 昵称, `achievement` 成就值, `level` 等级, `job` 职业方向, `register_time` 注册时间）：

| id   | uid  | nick_name   | achievement | level | job  | register_time       |
| ---- | ---- | ----------- | ----------- | ----- | ---- | ------------------- |
| 1    | 1001 | 牛客 1 号   | 3200        | 7     | 算法 | 2020-01-01 10:00:00 |
| 2    | 1002 | 牛客 2 号   | 2500        | 6     | 算法 | 2020-01-01 10:00:00 |
| 3    | 1003 | 牛客 3 号 ♂ | 2200        | 5     | 算法 | 2020-01-01 10:00:00 |

试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id   | exam_id | tag    | difficulty | duration | release_time        |
| ---- | ------- | ------ | ---------- | -------- | ------------------- |
| 1    | 9001    | SQL    | hard       | 60       | 2020-01-01 10:00:00 |
| 2    | 9002    | SQL    | hard       | 80       | 2020-01-01 10:00:00 |
| 3    | 9003    | 算法   | hard       | 80       | 2020-01-01 10:00:00 |
| 4    | 9004    | PYTHON | medium     | 70       | 2020-01-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score |
| ---- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1    | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90    |
| 15   | 1002 | 9001    | 2020-01-01 18:01:01 | 2020-01-01 18:59:02 | 90    |
| 13   | 1001 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 2    | 1002 | 9001    | 2020-01-20 10:01:01 |                     |       |
| 3    | 1002 | 9001    | 2020-02-01 12:11:01 |                     |       |
| 5    | 1001 | 9001    | 2020-03-01 12:01:01 |                     |       |
| 6    | 1002 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90    |
| 4    | 1003 | 9001    | 2020-03-01 19:01:01 |                     |       |
| 7    | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90    |
| 14   | 1001 | 9002    | 2020-01-01 12:11:01 |                     |       |
| 8    | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 9    | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10   | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 11   | 1002 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 12   | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 17   | 1001 | 9002    | 2020-05-05 18:01:01 |                     |       |
| 16   | 1002 | 9003    | 2020-05-06 12:01:01 |                     |       |

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
         t1.month_d
```

### 试卷完成数同比 2020 年的增长率及排名变化（困难）

**描述**：

现有试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id   | exam_id | tag    | difficulty | duration | release_time        |
| ---- | ------- | ------ | ---------- | -------- | ------------------- |
| 1    | 9001    | SQL    | hard       | 60       | 2021-01-01 10:00:00 |
| 2    | 9002    | C++    | hard       | 80       | 2021-01-01 10:00:00 |
| 3    | 9003    | 算法   | hard       | 80       | 2021-01-01 10:00:00 |
| 4    | 9004    | PYTHON | medium     | 70       | 2021-01-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score |
| ---- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1    | 1001 | 9001    | 2020-08-02 10:01:01 | 2020-08-02 10:31:01 | 89    |
| 2    | 1002 | 9001    | 2020-04-01 18:01:01 | 2020-04-01 18:59:02 | 90    |
| 3    | 1001 | 9001    | 2020-04-01 09:01:01 | 2020-04-01 09:21:59 | 80    |
| 5    | 1002 | 9001    | 2021-03-02 19:01:01 | 2021-03-02 19:32:00 | 20    |
| 8    | 1003 | 9001    | 2021-05-02 12:01:01 | 2021-05-02 12:31:01 | 98    |
| 13   | 1003 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 9    | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10   | 1002 | 9002    | 2021-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 11   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 16   | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 17   | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 18   | 1001 | 9002    | 2021-05-05 18:01:01 |                     |       |
| 4    | 1002 | 9003    | 2021-01-20 10:01:01 | 2021-01-20 10:10:01 | 81    |
| 6    | 1001 | 9003    | 2021-04-02 19:01:01 | 2021-04-02 19:40:01 | 89    |
| 15   | 1002 | 9003    | 2021-01-01 18:01:01 | 2021-01-01 18:59:02 | 90    |
| 7    | 1004 | 9004    | 2020-05-02 12:01:01 | 2020-05-02 12:20:01 | 99    |
| 12   | 1001 | 9004    | 2021-09-02 12:11:01 |                     |       |
| 14   | 1002 | 9004    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83    |

请计算 2021 年上半年各类试卷的做完次数相比 2020 年上半年同期的增长率（百分比格式，保留 1 位小数），以及做完次数排名变化，按增长率和 21 年排名降序输出。

由示例数据结果输出如下：

| tag  | exam_cnt_20 | exam_cnt_21 | growth_rate | exam_cnt_rank_20 | exam_cnt_rank_21 | rank_delta |
| ---- | ----------- | ----------- | ----------- | ---------------- | ---------------- | ---------- |
| SQL  | 3           | 2           | -33.3%      | 1                | 2                | 1          |

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

## 聚合窗口函数

### 对试卷得分做 min-max 归一化

**描述**：

现有试卷信息表 `examination_info`（`exam_id` 试卷 ID, `tag` 试卷类别, `difficulty` 试卷难度, `duration` 考试时长, `release_time` 发布时间）：

| id   | exam_id | tag    | difficulty | duration | release_time        |
| ---- | ------- | ------ | ---------- | -------- | ------------------- |
| 1    | 9001    | SQL    | hard       | 60       | 2020-01-01 10:00:00 |
| 2    | 9002    | C++    | hard       | 80       | 2020-01-01 10:00:00 |
| 3    | 9003    | 算法   | hard       | 80       | 2020-01-01 10:00:00 |
| 4    | 9004    | PYTHON | medium     | 70       | 2020-01-01 10:00:00 |

试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 6    | 1003 | 9001    | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 68     |
| 9    | 1001 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89     |
| 1    | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 12   | 1002 | 9002    | 2021-05-05 18:01:01 | (NULL)              | (NULL) |
| 3    | 1004 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:11:01 | 60     |
| 2    | 1003 | 9002    | 2020-01-01 19:01:01 | 2020-01-01 19:30:01 | 75     |
| 7    | 1001 | 9002    | 2020-01-02 12:01:01 | 2020-01-02 12:43:01 | 81     |
| 10   | 1002 | 9002    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83     |
| 4    | 1003 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:41:01 | 90     |
| 5    | 1002 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:32:00 | 90     |
| 11   | 1002 | 9004    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 8    | 1001 | 9005    | 2020-01-02 12:11:01 | (NULL)              | (NULL) |

在物理学及统计学数据计算时，有个概念叫 min-max 标准化，也被称为离差标准化，是对原始数据的线性变换，使结果值映射到[0 - 1]之间。

转换函数为：

![](https://oss.javaguide.cn/github/javaguide/database/sql/29A377601170AB822322431FCDF7EDFE.png)

请你将用户作答高难度试卷的得分在每份试卷作答记录内执行 min-max 归一化后缩放到[0,100]区间，并输出用户 ID、试卷 ID、归一化后分数平均值；最后按照试卷 ID 升序、归一化分数降序输出。（注：得分区间默认为[0,100]，如果某个试卷作答记录中只有一个得分，那么无需使用公式，归一化并缩放后分数仍为原分数）。

由示例数据结果输出如下：

| uid  | exam_id | avg_new_score |
| ---- | ------- | ------------- |
| 1001 | 9001    | 98            |
| 1003 | 9001    | 0             |
| 1002 | 9002    | 88            |
| 1003 | 9002    | 75            |
| 1001 | 9002    | 70            |
| 1004 | 9002    | 0             |

解释：高难度试卷有 9001、9002、9003；

作答了 9001 的记录有 3 条，分数分别为 68、89、90，按给定公式归一化后分数为：0、95、100，而后两个得分都是用户 1001 作答的，因此用户 1001 对试卷 9001 的新得分为(95+100)/2≈98（只保留整数部分），用户 1003 对于试卷 9001 的新得分为 0。最后结果按照试卷 ID 升序、归一化分数降序输出。

**思路：**

注意点：

1. 将高难度的试卷，按每类试卷的得分，利用 max/min (col) over()窗口函数求得各组内最大最小值，然后进行归一化公式计算，缩放区间为[0,100]，即 min_max\*100
2. 若某类试卷只有一个得分，则无需使用归一化公式，因只有一个分 max_score=min_score,score，公式后结果可能会变成 0。
3. 最后结果按 uid、exam_id 分组求归一化后均值，score 为 NULL 的要过滤掉。

最后就是仔细看上面公式 （说实话，这题看起来就很绕）

**答案**：

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

### 每份试卷每月作答数和截止当月的作答总数

**描述:**

现有试卷作答记录表 exam_record（uid 用户 ID, exam_id 试卷 ID, start_time 开始作答时间, submit_time 交卷时间, score 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1    | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 2    | 1002 | 9001    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89     |
| 3    | 1002 | 9001    | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83     |
| 4    | 1003 | 9001    | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75     |
| 5    | 1004 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60     |
| 6    | 1003 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90     |
| 7    | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90     |
| 8    | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69     |
| 9    | 1004 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99     |
| 10   | 1003 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68     |
| 11   | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81     |
| 12   | 1001 | 9002    | 2020-03-02 12:11:01 | (NULL)              | (NULL) |

请输出每份试卷每月作答数和截止当月的作答总数。
由示例数据结果输出如下：

| exam_id | start_month | month_cnt | cum_exam_cnt |
| ------- | ----------- | --------- | ------------ |
| 9001    | 202001      | 2         | 2            |
| 9001    | 202002      | 1         | 3            |
| 9001    | 202003      | 3         | 6            |
| 9001    | 202005      | 1         | 7            |
| 9002    | 202001      | 1         | 1            |
| 9002    | 202002      | 3         | 4            |
| 9002    | 202003      | 1         | 5            |

解释：试卷 9001 在 202001、202002、202003、202005 共 4 个月有被作答记录，每个月被作答数分别为 2、1、3、1，截止当月累积作答总数为 2、3、6、7。

**思路：**

这题就两个关键点：统计截止当月的作答总数、输出每份试卷每月作答数和截止当月的作答总数

这个是关键`**sum(count(*)) over(partition by exam_id order by date_format(start_time,'%Y%m'))**`

**答案**：

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

### 每月及截止当月的答题情况（较难）

**描述**：现有试卷作答记录表 `exam_record`（`uid` 用户 ID, `exam_id` 试卷 ID, `start_time` 开始作答时间, `submit_time` 交卷时间, `score` 得分）：

| id   | uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1    | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 2    | 1002 | 9001    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89     |
| 3    | 1002 | 9001    | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83     |
| 4    | 1003 | 9001    | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75     |
| 5    | 1004 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60     |
| 6    | 1003 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90     |
| 7    | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90     |
| 8    | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69     |
| 9    | 1004 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99     |
| 10   | 1003 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68     |
| 11   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-02-02 12:43:01 | 81     |
| 12   | 1001 | 9002    | 2020-03-02 12:11:01 | (NULL)              | (NULL) |

请输出自从有用户作答记录以来，每月的试卷作答记录中月活用户数、新增用户数、截止当月的单月最大新增用户数、截止当月的累积用户数。结果按月份升序输出。

由示例数据结果输出如下：

| start_month | mau  | month_add_uv | max_month_add_uv | cum_sum_uv |
| ----------- | ---- | ------------ | ---------------- | ---------- |
| 202001      | 2    | 2            | 2                | 2          |
| 202002      | 4    | 2            | 2                | 4          |
| 202003      | 3    | 0            | 2                | 4          |
| 202005      | 1    | 0            | 2                | 4          |

| month  | 1001 | 1002 | 1003 | 1004 |
| ------ | ---- | ---- | ---- | ---- |
| 202001 | 1    | 1    |      |      |
| 202002 | 1    | 1    | 1    | 1    |
| 202003 | 1    |      | 1    | 1    |
| 202005 |      | 1    |      |      |

由上述矩阵可以看出，2020 年 1 月有 2 个用户活跃（mau=2），当月新增用户数为 2；

2020 年 2 月有 4 个用户活跃，当月新增用户数为 2，最大单月新增用户数为 2，当前累积用户数为 4。

**思路：**

难点：

1.如何求每月新增用户

2.截至当月的答题情况

大致流程：

（1）统计每个人的首次登陆月份 `min()`

（2）统计每月的月活和新增用户数：先得到每个人的首次登陆月份，再对首次登陆月份分组求和是该月份的新增人数

（3）统计截止当月的单月最大新增用户数、截止当月的累积用户数 ，最终按照按月份升序输出

**答案**：

```sql
-- 截止当月的单月最大新增用户数、截止当月的累积用户数，按月份升序输出
SELECT
	start_month,
	mau,
	month_add_uv,
	max( month_add_uv ) over ( ORDER BY start_month ),
	sum( month_add_uv ) over ( ORDER BY start_month )
FROM
	(
	-- 统计每月的月活和新增用户数
	SELECT
		date_format( a.start_time, '%Y%m' ) AS start_month,
		count( DISTINCT a.uid ) AS mau,
		count( DISTINCT b.uid ) AS month_add_uv
	FROM
		exam_record a
		LEFT JOIN (
         -- 统计每个人的首次登陆月份
		SELECT uid, min( date_format( start_time, '%Y%m' )) AS first_month FROM exam_record GROUP BY uid ) b ON date_format( a.start_time, '%Y%m' ) = b.first_month
	GROUP BY
		start_month
	) main
ORDER BY
	start_month
```

