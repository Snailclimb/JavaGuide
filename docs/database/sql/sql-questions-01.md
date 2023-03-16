---
title: SQL常见面试题总结
category: 数据库
tag:
  - 数据库基础
  - SQL
---

> 题目来源于：[牛客题霸 - SQL 必知必会](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=298)

## 检索数据

`select` 用于从数据库中查询数据。

### 从 Customers 表中检索所有的 ID

现有表 `Customers` 如下：

| cust_id |
| ------- |
| A       |
| B       |
| C       |

编写 SQL 语句，从 `Customers` 表中检索所有的 `cust_id`。

答案：

```sql
select cust_id
from Customers;
```

### 检索并列出已订购产品的清单

表 `OrderItems` 含有非空的列 `prod_id` 代表商品 id，包含了所有已订购的商品（有些已被订购多次）。

| prod_id |
| ------- |
| a1      |
| a2      |
| a3      |
| a4      |
| a5      |
| a6      |
| a7      |

编写 SQL 语句，检索并列出所有已订购商品（`prod_id`）的去重后的清单。

答案：

```sql
select distinct prod_id
from OrderItems;
```

知识点：`distinct` 用于返回列中的唯一不同值。

### 检索所有列

现在有 `Customers` 表（表中含有列 `cust_id` 代表客户 id，`cust_name` 代表客户姓名）

| cust_id | cust_name |
| ------- | --------- |
| a1      | andy      |
| a2      | ben       |
| a3      | tony      |
| a4      | tom       |
| a5      | an        |
| a6      | lee       |
| a7      | hex       |

需要编写 SQL 语句，检索所有列。

答案：

```sql
select cust_id, cust_name
from Customers;
```

## 排序检索数据

`order by` 用于对结果集按照一个列或者多个列进行排序。默认按照升序对记录进行排序，如果需要按照降序对记录进行排序，可以使用 `desc` 关键字。

### 检索顾客名称并且排序

有表 `Customers`，`cust_id` 代表客户 id，`cust_name` 代表客户姓名。

| cust_id | cust_name |
| ------- | --------- |
| a1      | andy      |
| a2      | ben       |
| a3      | tony      |
| a4      | tom       |
| a5      | an        |
| a6      | lee       |
| a7      | hex       |

从 `Customers` 中检索所有的顾客名称（`cust_name`），并按从 Z 到 A 的顺序显示结果。

答案：

```sql
select cust_name from Customers order by cust_name desc
```

### 对顾客 ID 和日期排序

有 `Orders` 表：

| cust_id | order_num | order_date          |
| ------- | --------- | ------------------- |
| andy    | aaaa      | 2021-01-01 00:00:00 |
| andy    | bbbb      | 2021-01-01 12:00:00 |
| bob     | cccc      | 2021-01-10 12:00:00 |
| dick    | dddd      | 2021-01-11 00:00:00 |

编写 SQL 语句，从 `Orders` 表中检索顾客 ID（`cust_id`）和订单号（`order_num`），并先按顾客 ID 对结果进行排序，再按订单日期倒序排列。

答案：

```sql
# 根据列名排序
# 注意：是 order_date 降序，而不是 order_num
select cust_id, order_num
from Orders
order by cust_id, order_date desc;
```

知识点：`order by` 对多列排序的时候，先排序的列放前面，后排序的列放后面。并且，不同的列可以有不同的排序规则。

### 按照数量和价格排序

假设有一个 `OrderItems` 表：

| quantity | item_price |
| -------- | ---------- |
| 1        | 100        |
| 10       | 1003       |
| 2        | 500        |

编写 SQL 语句，显示 `OrderItems` 表中的数量（`quantity`）和价格（`item_price`），并按数量由多到少、价格由高到低排序。

答案：

```sql
select quantity, item_price
from OrderItems
order by quantity desc, item_price desc;
```

### 检查 SQL 语句

有 `Vendors` 表：

| vend_name |
| --------- |
| 海底捞    |
| 小龙坎    |
| 大龙燚    |

下面的 SQL 语句有问题吗？尝试将它改正确，使之能够正确运行，并且返回结果根据`vend_name` 逆序排列。

```sql
SELECT vend_name,
FROM Vendors
ORDER vend_name DESC;
```

改正后：

```sql
select vend_name
from Vendors
order by vend_name desc;
```

知识点：

- 逗号作用是用来隔开列与列之间的。
- order by 是有 by 的，需要撰写完整，且位置正确。

## 过滤数据

`where` 可以过滤返回的数据。

下面的运算符可以在 `where` 子句中使用：

| 运算符  | 描述                                                       |
| :------ | :--------------------------------------------------------- |
| =       | 等于                                                       |
| <>      | 不等于。**注释：**在 SQL 的一些版本中，该操作符可被写成 != |
| >       | 大于                                                       |
| <       | 小于                                                       |
| >=      | 大于等于                                                   |
| <=      | 小于等于                                                   |
| BETWEEN | 在某个范围内                                               |
| LIKE    | 搜索某种模式                                               |
| IN      | 指定针对某个列的多个可能值                                 |

### 返回固定价格的产品

有表 `Products` ：

| prod_id | prod_name      | prod_price |
| ------- | -------------- | ---------- |
| a0018   | sockets        | 9.49       |
| a0019   | iphone13       | 600        |
| b0018   | gucci t-shirts | 1000       |

【问题】从 `Products` 表中检索产品 ID（`prod_id`）和产品名称（`prod_name`），只返回价格为 9.49 美元的产品。

答案：

```sql
select prod_id, prod_name
from Products
where prod_price = 9.49;
```

### 返回更高价格的产品

有表 `Products` ：

| prod_id | prod_name      | prod_price |
| ------- | -------------- | ---------- |
| a0018   | sockets        | 9.49       |
| a0019   | iphone13       | 600        |
| b0019   | gucci t-shirts | 1000       |

【问题】编写 SQL 语句，从 `Products` 表中检索产品 ID（`prod_id`）和产品名称（`prod_name`），只返回价格为 9 美元或更高的产品。

答案：

```sql
select prod_id, prod_name
from Products
where prod_price >= 9;
```

### 返回产品并且按照价格排序

有表 `Products` ：

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011   | egg       | 3          |
| a0019   | sockets   | 4          |
| b0019   | coffee    | 15         |

【问题】编写 SQL 语句，返回 `Products` 表中所有价格在 3 美元到 6 美元之间的产品的名称（`prod_name`）和价格（`prod_price`），然后按价格对结果进行排序。

答案：

```sql
select prod_name, prod_price
from Products
where prod_price between 3 and 6
order by prod_price;

# 或者
select prod_name, prod_price
from Products
where prod_price >= 3 and prod_price <= 6
order by prod_price;
```

### 返回更多的产品

`OrderItems` 表含有：订单号 `order_num`，`quantity`产品数量

| order_num | quantity |
| --------- | -------- |
| a1        | 105      |
| a2        | 1100     |
| a2        | 200      |
| a4        | 1121     |
| a5        | 10       |
| a2        | 19       |
| a7        | 5        |

【问题】从 `OrderItems` 表中检索出所有不同且不重复的订单号（`order_num`），其中每个订单都要包含 100 个或更多的产品。

答案：

```sql
select distinct order_num
from OrderItems
where quantity >= 100;
```

## 高级数据过滤

`and` 和 `or` 运算符用于基于一个以上的条件对记录进行过滤，两者可以结合使用。`and` 必须 2 个条件都成立，`or`只要 2 个条件中的一个成立即可。

### 检索供应商名称

`Vendors` 表有字段供应商名称（`vend_name`）、供应商国家（`vend_country`）、供应商州（`vend_state`）

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple     | USA          | CA         |
| vivo      | CNA          | shenzhen   |
| huawei    | CNA          | xian       |

【问题】编写 SQL 语句，从 `Vendors` 表中检索供应商名称（`vend_name`），仅返回加利福尼亚州的供应商（这需要按国家[USA]和州[CA]进行过滤，没准其他国家也存在一个 CA）

答案：

```sql
select vend_name
from Vendors
where vend_country = 'USA' and vend_state = 'CA';
```

### 检索并列出已订购产品的清单

`OrderItems` 表包含了所有已订购的产品（有些已被订购多次）。

| prod_id | order_num | quantity |
| ------- | --------- | -------- |
| BR01    | a1        | 105      |
| BR02    | a2        | 1100     |
| BR02    | a2        | 200      |
| BR03    | a4        | 1121     |
| BR017   | a5        | 10       |
| BR02    | a2        | 19       |
| BR017   | a7        | 5        |

【问题】编写 SQL 语句，查找所有订购了数量至少 100 个的 `BR01`、`BR02` 或 `BR03` 的订单。你需要返回 `OrderItems` 表的订单号（`order_num`）、产品 ID（`prod_id`）和数量（`quantity`），并按产品 ID 和数量进行过滤。

答案：

```sql
select order_num, prod_id, quantity
from OrderItems
where quantity >= 100
    and prod_id in('BR01', 'BR02', 'BR03');
```

### 返回所有价格在 3 美元到 6 美元之间的产品的名称和价格

有表 `Products`：

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011   | egg       | 3          |
| a0019   | sockets   | 4          |
| b0019   | coffee    | 15         |

【问题】编写 SQL 语句，返回所有价格在 3 美元到 6 美元之间的产品的名称（`prod_name`）和价格（`prod_price`），使用 AND 操作符，然后按价格对结果进行升序排序。

答案：

```sql
select prod_name, prod_price
from Products
where prod_price between 3 and 6
order by prod_price;
```

### 检查 SQL 语句

供应商表 `Vendors` 有字段供应商名称 `vend_name`、供应商国家 `vend_country`、供应商省份 `vend_state`

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple     | USA          | CA         |
| vivo      | CNA          | shenzhen   |
| huawei    | CNA          | xian       |

【问题】修改正确下面 sql，使之正确返回。

```sql
SELECT vend_name
FROM Vendors
ORDER BY vend_name
WHERE vend_country = 'USA' AND vend_state = 'CA';
```

修改后：

```sql
select vend_name
from Vendors
where vend_country = 'USA' and vend_state = 'CA'
order by vend_name;
```

`order by` 语句必须放在 where 之后。

## 用通配符进行过滤

SQL 通配符必须与 `LIKE` 运算符一起使用

在 SQL 中，可使用以下通配符：

| 通配符                           | 描述                       |
| :------------------------------- | :------------------------- |
| `%`                              | 代表零个或多个字符         |
| `_`                              | 仅替代一个字符             |
| `[charlist]`                     | 字符列中的任何单一字符     |
| `[^charlist]` 或者 `[!charlist]` | 不在字符列中的任何单一字符 |

### 检索产品名称和描述（一）

`Products` 表如下：

| prod_name | prod_desc      |
| --------- | -------------- |
| a0011     | usb            |
| a0019     | iphone13       |
| b0019     | gucci t-shirts |
| c0019     | gucci toy      |
| d0019     | lego toy       |

【问题】编写 SQL 语句，从 `Products` 表中检索产品名称（`prod_name`）和描述（`prod_desc`），仅返回描述中包含 `toy` 一词的产品名称。

答案：

```sql
select prod_name, prod_desc
from Products
where prod_desc like '%toy%';
```

### 检索产品名称和描述（二）

`Products` 表如下：

| prod_name | prod_desc      |
| --------- | -------------- |
| a0011     | usb            |
| a0019     | iphone13       |
| b0019     | gucci t-shirts |
| c0019     | gucci toy      |
| d0019     | lego toy       |

【问题】编写 SQL 语句，从 `Products` 表中检索产品名称（`prod_name`）和描述（`prod_desc`），仅返回描述中未出现 `toy` 一词的产品，最后按”产品名称“对结果进行排序。

答案：

```sql
select prod_name, prod_desc
from Products
where prod_desc not like '%toy%'
order by prod_name;
```

### 检索产品名称和描述（三）

`Products` 表如下：

| prod_name | prod_desc        |
| --------- | ---------------- |
| a0011     | usb              |
| a0019     | iphone13         |
| b0019     | gucci t-shirts   |
| c0019     | gucci toy        |
| d0019     | lego carrots toy |

【问题】编写 SQL 语句，从 `Products` 表中检索产品名称（`prod_name`）和描述（`prod_desc`），仅返回描述中同时出现 `toy` 和 `carrots` 的产品。有好几种方法可以执行此操作，但对于这个挑战题，请使用 `AND` 和两个 `LIKE` 比较。

答案：

```sql
select prod_name, prod_desc
from Products
where prod_desc like '%toy%'
    and prod_desc like "%carrots%";
```

### 检索产品名称和描述（四）

`Products` 表如下：

| prod_name | prod_desc        |
| --------- | ---------------- |
| a0011     | usb              |
| a0019     | iphone13         |
| b0019     | gucci t-shirts   |
| c0019     | gucci toy        |
| d0019     | lego toy carrots |

【问题】编写 SQL 语句，从 Products 表中检索产品名称（prod_name）和描述（prod_desc），仅返回在描述中以**先后顺序**同时出现 toy 和 carrots 的产品。提示：只需要用带有三个 `%` 符号的 `LIKE` 即可。

答案：

```sql
select prod_name, prod_desc
from Products
where prod_desc like '%toy%carrots%';
```

## 创建计算字段

### 别名

别名的常见用法是在检索出的结果中重命名表的列字段（为了符合特定的报表要求或客户需求）。有表 `Vendors` 代表供应商信息，`vend_id` 供应商 id、`vend_name` 供应商名称、`vend_address` 供应商地址、`vend_city` 供应商城市。

| vend_id | vend_name     | vend_address | vend_city |
| ------- | ------------- | ------------ | --------- |
| a001    | tencent cloud | address1     | shenzhen  |
| a002    | huawei cloud  | address2     | dongguan  |
| a003    | aliyun cloud  | address3     | hangzhou  |
| a003    | netease cloud | address4     | guangzhou |

【问题】编写 SQL 语句，从 `Vendors` 表中检索 `vend_id`、`vend_name`、`vend_address` 和 `vend_city`，将 `vend_name` 重命名为 `vname`，将 `vend_city` 重命名为 `vcity`，将 `vend_address` 重命名为 `vaddress`，按供应商名称对结果进行升序排序。

答案：

```sql
select vend_id, vend_name as vname, vend_address as vaddress, vend_city as vcity
from Vendors
order by vname;

# as 可以省略
select vend_id, vend_name vname, vend_address vaddress, vend_city vcity
from Vendors
order by vname;
```

### 打折

我们的示例商店正在进行打折促销，所有产品均降价 10%。`Products` 表包含 `prod_id` 产品 id、`prod_price` 产品价格。

【问题】编写 SQL 语句，从 `Products` 表中返回 `prod_id`、`prod_price` 和 `sale_price`。`sale_price` 是一个包含促销价格的计算字段。提示：可以乘以 0.9，得到原价的 90%（即 10%的折扣）。

答案：

```sql
select prod_id, prod_price, prod_price * 0.9 as sale_price
from Products;
```

注意：`sale_price` 是对计算结果的命名，而不是原有的列名。

## 使用函数处理数据

### 顾客登录名

我们的商店已经上线了，正在创建顾客账户。所有用户都需要登录名，默认登录名是其名称和所在城市的组合。

给出 `Customers` 表 如下：

| cust_id | cust_name | cust_contact | cust_city |
| ------- | --------- | ------------ | --------- |
| a1      | Andy Li   | Andy Li      | Oak Park  |
| a2      | Ben Liu   | Ben Liu      | Oak Park  |
| a3      | Tony Dai  | Tony Dai     | Oak Park  |
| a4      | Tom Chen  | Tom Chen     | Oak Park  |
| a5      | An Li     | An Li        | Oak Park  |
| a6      | Lee Chen  | Lee Chen     | Oak Park  |
| a7      | Hex Liu   | Hex Liu      | Oak Park  |

【问题】编写 SQL 语句，返回顾客 ID（`cust_id`）、顾客名称（`cust_name`）和登录名（`user_login`），其中登录名全部为大写字母，并由顾客联系人的前两个字符（`cust_contact`）和其所在城市的前三个字符（`cust_city`）组成。提示：需要使用函数、拼接和别名。

答案：

```sql
select
    cust_id,
    cust_name,
    upper(concat(substring(cust_contact, 1, 2), substring(cust_city, 1, 3))) as user_login
from
    Customers;
```

知识点：

- 截取函数`substring()`：截取字符串，`substring(str ,n ,m)`：返回字符串 str 从第 n 个字符截取到第 m 个字符（左闭右闭）；
- 拼接函数`concat()`：将两个或多个字符串连接成一个字符串，select concat(A,B) ：连接字符串 A 和 B。

- 大写函数 `upper()`：将指定字符串转换为大写。

### 返回 2020 年 1 月的所有订单的订单号和订单日期

`Orders` 订单表如下：

| order_num | order_date          |
| --------- | ------------------- |
| a0001     | 2020-01-01 00:00:00 |
| a0002     | 2020-01-02 00:00:00 |
| a0003     | 2020-01-01 12:00:00 |
| a0004     | 2020-02-01 00:00:00 |
| a0005     | 2020-03-01 00:00:00 |

【问题】编写 SQL 语句，返回 2020 年 1 月的所有订单的订单号（`order_num`）和订单日期（`order_date`），并按订单日期升序排序

答案：

```sql
select order_num, order_date
from Orders
where month(order_date) = '01' and year(order_date) = '2020'
order by order_date;
```

也可以用通配符来做：

```sql
select order_num, order_date
from Orders
where order_date like '2020-01%'
order by order_date;
```

知识点：

- 日期格式：`YYYY-MM-DD`
- 时间格式：`HH:MM:SS`

日期和时间处理相关的常用函数：

| 函 数           | 说 明                          |
| --------------- | ------------------------------ |
| `adddate()`     | 增加一个日期（天、周等）       |
| `addtime()`     | 增加一个时间（时、分等）       |
| `curdate()`     | 返回当前日期                   |
| `curtime()`     | 返回当前时间                   |
| `date()`        | 返回日期时间的日期部分         |
| `datediff()`    | 计算两个日期之差               |
| `date_format()` | 返回一个格式化的日期或时间串   |
| `day()`         | 返回一个日期的天数部分         |
| `dayofweek()`   | 对于一个日期，返回对应的星期几 |
| `hour()`        | 返回一个时间的小时部分         |
| `minute()`      | 返回一个时间的分钟部分         |
| `month()`       | 返回一个日期的月份部分         |
| `now()`         | 返回当前日期和时间             |
| `second()`      | 返回一个时间的秒部分           |
| `time()`        | 返回一个日期时间的时间部分     |
| `year()`        | 返回一个日期的年份部分         |

## 汇总数据

汇总数据相关的函数：

| 函 数     | 说 明            |
| --------- | ---------------- |
| `avg()`   | 返回某列的平均值 |
| `count()` | 返回某列的行数   |
| `max()`   | 返回某列的最大值 |
| `min()`   | 返回某列的最小值 |
| `sum()`   | 返回某列值之和   |

### 确定已售出产品的总数

`OrderItems` 表代表售出的产品，`quantity` 代表售出商品数量。

| quantity |
| -------- |
| 10       |
| 100      |
| 1000     |
| 10001    |
| 2        |
| 15       |

【问题】编写 SQL 语句，确定已售出产品的总数。

答案：

```sql
select sum(quantity) as items_ordered
from OrderItems;
```

### 确定已售出产品项 BR01 的总数

`OrderItems` 表代表售出的产品，`quantity` 代表售出商品数量，产品项为 `prod_id`。

| quantity | prod_id |
| -------- | ------- |
| 10       | AR01    |
| 100      | AR10    |
| 1000     | BR01    |
| 10001    | BR010   |

【问题】修改创建的语句，确定已售出产品项（`prod_id`）为"BR01"的总数。

答案：

```sql
select sum(quantity) as items_ordered
from OrderItems
where prod_id = 'BR01';
```

### 确定 Products 表中价格不超过 10 美元的最贵产品的价格

`Products` 表如下，`prod_price` 代表商品的价格。

| prod_price |
| ---------- |
| 9.49       |
| 600        |
| 1000       |

【问题】编写 SQL 语句，确定 `Products` 表中价格不超过 10 美元的最贵产品的价格（`prod_price`）。将计算所得的字段命名为 `max_price`。

答案：

```sql
select max(prod_price) as max_price
from Products
where prod_price <= 10;
```

## 分组数据

`group by` ：

- `group by` 子句将记录分组到汇总行中。
- `group by` 为每个组返回一个记录。
- `group by` 通常还涉及聚合`count`，`max`，`sum`，`avg` 等。
- `group by` 可以按一列或多列进行分组。
- `group by` 按分组字段进行排序后，`order by` 可以以汇总字段来进行排序。

`having`：

- `having` 用于对汇总的 `group by` 结果进行过滤。
- `having` 必须要与 `group by` 连用。
- `where` 和 `having` 可以在相同的查询中。

`having` vs `where`：

- `where`：过滤过滤指定的行，后面不能加聚合函数（分组函数）。
- `having`：过滤分组，必须要与 `group by` 连用，不能单独使用。

### 返回每个订单号各有多少行数

`OrderItems` 表包含每个订单的每个产品

| order_num |
| --------- |
| a002      |
| a002      |
| a002      |
| a004      |
| a007      |

【问题】编写 SQL 语句，返回每个订单号（`order_num`）各有多少行数（`order_lines`），并按 `order_lines` 对结果进行升序排序。

答案：

```sql
select order_num, count(order_num) as order_lines
from OrderItems
group by order_num
order by order_lines;
```

知识点：

1. `count(*)`,`count(列名)`都可以，区别在于，`count(列名)`是统计非 NULL 的行数；
2. `order by` 最后执行，所以可以使用列别名；
3. 分组聚合一定不要忘记加上 `group by` ,不然只会有一行结果。

### 每个供应商成本最低的产品

有 `Products` 表，含有字段 `prod_price` 代表产品价格，`vend_id` 代表供应商 id

| vend_id | prod_price |
| ------- | ---------- |
| a0011   | 100        |
| a0019   | 0.1        |
| b0019   | 1000       |
| b0019   | 6980       |
| b0019   | 20         |

【问题】编写 SQL 语句，返回名为 `cheapest_item` 的字段，该字段包含每个供应商成本最低的产品（使用 `Products` 表中的 `prod_price`），然后从最低成本到最高成本对结果进行升序排序。

答案：

```sql
select vend_id, min(prod_price) as cheapest_item
from Products
group by vend_id
order by cheapest_item;
```

### 返回订单数量总和不小于 100 的所有订单的订单号

`OrderItems` 代表订单商品表，包括：订单号 `order_num` 和订单数量 `quantity`。

| order_num | quantity |
| --------- | -------- |
| a1        | 105      |
| a2        | 1100     |
| a2        | 200      |
| a4        | 1121     |
| a5        | 10       |
| a2        | 19       |
| a7        | 5        |

【问题】请编写 SQL 语句，返回订单数量总和不小于 100 的所有订单号，最后结果按照订单号升序排序。

答案：

```sql
# 直接聚合
select order_num
from OrderItems
group by order_num
having sum(quantity) >= 100
order by order_num;

# 子查询
select order_num
from (select order_num, sum(quantity) as sum_num
        from OrderItems group by order_num having sum_num >= 100
) a
order by order_num;
```

知识点：

- `where`：过滤过滤指定的行，后面不能加聚合函数（分组函数）。
- `having`：过滤分组，与 `group by` 连用，不能单独使用。

### 计算总和

`OrderItems` 表代表订单信息，包括字段：订单号 `order_num` 和 `item_price` 商品售出价格、`quantity` 商品数量。

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1        | 10         | 105      |
| a2        | 1          | 1100     |
| a2        | 1          | 200      |
| a4        | 2          | 1121     |
| a5        | 5          | 10       |
| a2        | 1          | 19       |
| a7        | 7          | 5        |

【问题】编写 SQL 语句，根据订单号聚合，返回订单总价不小于 1000 的所有订单号，最后的结果按订单号进行升序排序。

提示：总价 = item_price 乘以 quantity

答案：

```sql
select order_num, sum(item_price * quantity) as total_price
from OrderItems
group by order_num
having total_price >= 1000
order by order_num;
```

### 检查 SQL 语句

`OrderItems` 表含有 `order_num` 订单号

| order_num |
| --------- |
| a002      |
| a002      |
| a002      |
| a004      |
| a007      |

【问题】将下面代码修改正确后执行

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY items
HAVING COUNT(*) >= 3
ORDER BY items, order_num;
```

修改后：

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY order_num
HAVING items >= 3
ORDER BY items, order_num;
```

## 使用子查询

子查询是嵌套在较大查询中的 SQL 查询，也称内部查询或内部选择，包含子查询的语句也称为外部查询或外部选择。简单来说，子查询就是指将一个 `select` 查询（子查询）的结果作为另一个 SQL 语句（主查询）的数据来源或者判断条件。

子查询可以嵌入 `select`、`insert`、`update` 和 `delete` 语句中，也可以和 `=`、`<`、`>`、`in`、`between`、`exists` 等运算符一起使用。

子查询常用在 `where` 子句和 `from` 子句后边：

- 当用于 `where` 子句时，根据不同的运算符，子查询可以返回单行单列、多行单列、单行多列数据。子查询就是要返回能够作为 WHERE 子句查询条件的值。
- 当用于 `from` 子句时，一般返回多行多列数据，相当于返回一张临时表，这样才符合 `from` 后面是表的规则。这种做法能够实现多表联合查询。

> 注意：MySQL 数据库从 4.1 版本才开始支持子查询，早期版本是不支持的。

用于 `where` 子句的子查询的基本语法如下：

```sql
select column_name [, column_name ]
from   table1 [, table2 ]
where  column_name operator
    (select column_name [, column_name ]
    from table1 [, table2 ]
    [where])
```

- 子查询需要放在括号`( )`内。
- `operator` 表示用于 where 子句的运算符。

用于 `from` 子句的子查询的基本语法如下：

```sql
select column_name [, column_name ]
from (select column_name [, column_name ]
      from table1 [, table2 ]
      [where]) as temp_table_name
where  condition
```

用于 `from` 的子查询返回的结果相当于一张临时表，所以需要使用 AS 关键字为该临时表起一个名字。

### 返回购买价格为 10 美元或以上产品的顾客列表

`OrderItems` 表示订单商品表，含有字段订单号：`order_num`、订单价格：`item_price`；`Orders` 表代表订单信息表，含有顾客 `id：cust_id` 和订单号：`order_num`

`OrderItems` 表:

| order_num | item_price |
| --------- | ---------- |
| a1        | 10         |
| a2        | 1          |
| a2        | 1          |
| a4        | 2          |
| a5        | 5          |
| a2        | 1          |
| a7        | 7          |

`Orders` 表：

| order_num | cust_id |
| --------- | ------- |
| a1        | cust10  |
| a2        | cust1   |
| a2        | cust1   |
| a4        | cust2   |
| a5        | cust5   |
| a2        | cust1   |
| a7        | cust7   |

【问题】使用子查询，返回购买价格为 10 美元或以上产品的顾客列表，结果无需排序。

答案：

```sql
select cust_id
from Orders
where order_num in (
    select order_num
    from OrderItems
    group by order_num
    having sum(item_price) >= 10
);
```

### 确定哪些订单购买了 prod_id 为 BR01 的产品（一）

表 `OrderItems` 代表订单商品信息表，`prod_id` 为产品 id；`Orders` 表代表订单表有 `cust_id` 代表顾客 id 和订单日期 `order_date`

`OrderItems` 表：

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

`Orders` 表：

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

【问题】

编写 SQL 语句，使用子查询来确定哪些订单（在 `OrderItems` 中）购买了 `prod_id` 为 "BR01" 的产品，然后从 `Orders` 表中返回每个产品对应的顾客 ID（`cust_id`）和订单日期（`order_date`），按订购日期对结果进行升序排序。

答案：

```sql
# 写法 1：子查询
select cust_id, order_date
from Orders
where order_num in (
    select order_num
    from OrderItems
    where prod_id = 'BR01'
)
order by order_date;

# 写法 2: 连接表
select
    b.cust_id, b.order_date
from
    OrderItems a, Orders b
where
    a.order_num = b.order_num
    and a.prod_id = 'BR01'
order by
    order_date;
```

### 返回购买 prod_id 为 BR01 的产品的所有顾客的电子邮件（一）

你想知道订购 BR01 产品的日期，有表 `OrderItems` 代表订单商品信息表，`prod_id` 为产品 id；`Orders` 表代表订单表有 `cust_id` 代表顾客 id 和订单日期 `order_date`；`Customers` 表含有 `cust_email` 顾客邮件和 `cust_id` 顾客 id

`OrderItems` 表：

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

`Orders` 表：

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

`Customers` 表代表顾客信息，`cust_id` 为顾客 id，`cust_email` 为顾客 email

| cust_id | cust_email      |
| ------- | --------------- |
| cust10  | cust10@cust.com |
| cust1   | cust1@cust.com  |
| cust2   | cust2@cust.com  |

【问题】返回购买 `prod_id` 为 `BR01` 的产品的所有顾客的电子邮件（`Customers` 表中的 `cust_email`），结果无需排序。

提示：这涉及 `SELECT` 语句，最内层的从 `OrderItems` 表返回 `order_num`，中间的从 `Customers` 表返回 `cust_id`。

答案：

```sql
# 写法 1：子查询
select cust_email
from Customers
where cust_id in (
    select cust_id
    from Orders
    where order_num in (
        select order_num
        from OrderItems
        where prod_id = 'BR01'
    )
);

# 写法 2: 连接表（inner join）
select c.cust_email
from OrderItems a, Orders b, Customers c
where a.order_num = b.order_num
    and b.cust_id = c.cust_id
    and a.prod_id = 'BR01';

# 写法 3：连接表（left join）
select
    c.cust_email
from
    Orders a
    left join OrderItems b on a.order_num = b.order_num
    left join Customers c on a.cust_id = c.cust_id
where
    b.prod_id = 'BR01';
```

### 返回每个顾客不同订单的总金额

我们需要一个顾客 ID 列表，其中包含他们已订购的总金额。

`OrderItems` 表代表订单信息，`OrderItems` 表有订单号：`order_num` 和商品售出价格：`item_price`、商品数量：`quantity`。

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a0001     | 10         | 105      |
| a0002     | 1          | 1100     |
| a0002     | 1          | 200      |
| a0013     | 2          | 1121     |
| a0003     | 5          | 10       |
| a0003     | 1          | 19       |
| a0003     | 7          | 5        |

`Orders` 表订单号：`order_num`、顾客 id：`cust_id`

| order_num | cust_id |
| --------- | ------- |
| a0001     | cust10  |
| a0002     | cust1   |
| a0003     | cust1   |
| a0013     | cust2   |

【问题】

编写 SQL 语句，返回顾客 ID（`Orders` 表中的 `cust_id`），并使用子查询返回 `total_ordered` 以便返回每个顾客的订单总数，将结果按金额从大到小排序。

答案：

```sql
# 写法 1：子查询
SELECT
    o.cust_id cust_id,
    tb.total_ordered total_ordered
FROM (
    SELECT order_num, SUM(item_price * quantity) total_ordered
    FROM OrderItems
    GROUP BY order_num
    ) as tb,
    Orders o
WHERE
    tb.order_num = o.order_num
ORDER BY
    total_ordered DESC;

# 写法 2：连接表
select b.cust_id, sum(a.quantity * a.item_price) as total_ordered
from OrderItems a, Orders b
where a.order_num = b.order_num
group by cust_id
order by total_ordered desc;
```

### 从 Products 表中检索所有的产品名称以及对应的销售总数

`Products` 表中检索所有的产品名称：`prod_name`、产品 id：`prod_id`

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |

`OrderItems` 代表订单商品表，订单产品：`prod_id`、售出数量：`quantity`

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 1100     |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |

【问题】

编写 SQL 语句，从 `Products` 表中检索所有的产品名称（`prod_name`），以及名为 `quant_sold` 的计算列，其中包含所售产品的总数（在 `OrderItems` 表上使用子查询和 `SUM(quantity)` 检索）。

答案：

```sql
# 写法 1：子查询
select p.prod_name, tb.quant_sold
from (
    select prod_id, sum(quantity) as quant_sold
    from OrderItems
    group by prod_id
    ) as tb,
    Products p
where tb.prod_id = p.prod_id;

# 写法 2：连接表
select p.prod_name, sum(o.quantity) as quant_sold
from Products p, OrderItems o
where p.prod_id = o.prod_id
group by p.prod_name;（这里不能用 p.prod_id，会报错）
```

## 连接表

JOIN 是“连接”的意思，顾名思义，SQL JOIN 子句用于将两个或者多个表联合起来进行查询。

连接表时需要在每个表中选择一个字段，并对这些字段的值进行比较，值相同的两条记录将合并为一条。**连接表的本质就是将不同表的记录合并起来，形成一张新表。当然，这张新表只是临时的，它仅存在于本次查询期间**。

使用 `JOIN` 连接两个表的基本语法如下：

```sql
select table1.column1, table2.column2...
from table1
join table2
on table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` 是连接条件，只有满足此条件的记录才会合并为一行。您可以使用多个运算符来连接表，例如 =、>、<、<>、<=、>=、!=、`between`、`like` 或者 `not`，但是最常见的是使用 =。

当两个表中有同名的字段时，为了帮助数据库引擎区分是哪个表的字段，在书写同名字段名时需要加上表名。当然，如果书写的字段名在两个表中是唯一的，也可以不使用以上格式，只写字段名即可。

另外，如果两张表的关联字段名相同，也可以使用 `USING`子句来代替 `ON`，举个例子：

```sql
# join....on
select c.cust_name, o.order_num
from Customers c
inner join Orders o
on c.cust_id = o.cust_id
order by c.cust_name;

# 如果两张表的关联字段名相同，也可以使用USING子句：join....using()
select c.cust_name, o.order_num
from Customers c
inner join Orders o
using(cust_id)
order by c.cust_name;
```

**`ON` 和 `WHERE` 的区别**：

- 连接表时，SQL 会根据连接条件生成一张新的临时表。`ON` 就是连接条件，它决定临时表的生成。
- `WHERE` 是在临时表生成以后，再对临时表中的数据进行过滤，生成最终的结果集，这个时候已经没有 JOIN-ON 了。

所以总结来说就是：**SQL 先根据 ON 生成一张临时表，然后再根据 WHERE 对临时表进行筛选**。

SQL 允许在 `JOIN` 左边加上一些修饰性的关键词，从而形成不同类型的连接，如下表所示：

| 连接类型                                 | 说明                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| INNER JOIN 内连接                        | （默认连接方式）只有当两个表都存在满足条件的记录时才会返回行。 |
| LEFT JOIN / LEFT OUTER JOIN 左(外)连接   | 返回左表中的所有行，即使右表中没有满足条件的行也是如此。     |
| RIGHT JOIN / RIGHT OUTER JOIN 右(外)连接 | 返回右表中的所有行，即使左表中没有满足条件的行也是如此。     |
| FULL JOIN / FULL OUTER JOIN 全(外)连接   | 只要其中有一个表存在满足条件的记录，就返回行。               |
| SELF JOIN                                | 将一个表连接到自身，就像该表是两个表一样。为了区分两个表，在 SQL 语句中需要至少重命名一个表。 |
| CROSS JOIN                               | 交叉连接，从两个或者多个连接表中返回记录集的笛卡尔积。       |

下图展示了 LEFT JOIN、RIGHT JOIN、INNER JOIN、OUTER JOIN 相关的 7 种用法。

![](https://oss.javaguide.cn/github/javaguide/csdn/d1794312b448516831369f869814ab39.png)

如果不加任何修饰词，只写 `JOIN`，那么默认为 `INNER JOIN`

对于 `INNER JOIN` 来说，还有一种隐式的写法，称为 “**隐式内连接**”，也就是没有 `INNER JOIN` 关键字，使用 `WHERE` 语句实现内连接的功能

```sql
# 隐式内连接
select c.cust_name, o.order_num
from Customers c, Orders o
where c.cust_id = o.cust_id
order by c.cust_name;

# 显式内连接
select c.cust_name, o.order_num
from Customers c inner join Orders o
using(cust_id)
order by c.cust_name;
```

### 返回顾客名称和相关订单号

`Customers` 表有字段顾客名称 `cust_name`、顾客 id `cust_id`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

`Orders` 订单信息表，含有字段 `order_num` 订单号、`cust_id` 顾客 id

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

【问题】编写 SQL 语句，返回 `Customers` 表中的顾客名称（`cust_name`）和 `Orders` 表中的相关订单号（`order_num`），并按顾客名称再按订单号对结果进行升序排序。你可以尝试用两个不同的写法，一个使用简单的等连接语法，另外一个使用 INNER JOIN。

答案：

```sql
# 隐式内连接
select c.cust_name, o.order_num
from Customers c, Orders o
where c.cust_id = o.cust_id
order by c.cust_name,o.order_num;

# 显式内连接
select c.cust_name, o.order_num
from Customers c inner join Orders o
using(cust_id)
order by c.cust_name,o.order_num;
```

### 返回顾客名称和相关订单号以及每个订单的总价

`Customers` 表有字段，顾客名称：`cust_name`、顾客 id：`cust_id`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

`Orders` 订单信息表，含有字段，订单号：`order_num`、顾客 id：`cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

`OrderItems` 表有字段，商品订单号：`order_num`、商品数量：`quantity`、商品价格：`item_price`

| order_num | quantity | item_price |
| --------- | -------- | ---------- |
| a1        | 1000     | 10         |
| a2        | 200      | 10         |
| a3        | 10       | 15         |
| a4        | 25       | 50         |
| a5        | 15       | 25         |
| a7        | 7        | 7          |

【问题】除了返回顾客名称和订单号，返回 `Customers` 表中的顾客名称（`cust_name`）和 `Orders` 表中的相关订单号（`order_num`），添加第三列 `OrderTotal`，其中包含每个订单的总价，并按顾客名称再按订单号对结果进行升序排序。

```sql
# 简单的等连接语法
select c.cust_name, o.order_num, sum(quantity * item_price) as OrderTotal
from Customers c, Orders o, OrderItems oi
where c.cust_id = o.cust_id
    and o.order_num = oi.order_num
group by c.cust_name, o.order_num
order by c.cust_name, o.order_num;
```

注意，可能有小伙伴会这样写：

```sql
select c.cust_name, o.order_num, sum(quantity * item_price) as OrderTotal
from Customers c, Orders o, OrderItems oi
where c.cust_id = o.cust_id
    and o.order_num = oi.order_num
group by c.cust_name
order by c.cust_name, o.order_num;
```

这是错误的！只对 `cust_name` 进行聚类确实符合题意，但是不符合 `group by` 的语法。

select 语句中，如果没有 `group by` 语句，那么 `cust_name`、`order_num` 会返回若干个值，而 `sum(quantity _ item_price)` 只返回一个值，通过 `group by` `cust_name` 可以让 `cust_name` 和 `sum(quantity _ item_price)` 一一对应起来，或者说**聚类**，所以同样的，也要对 `order_num` 进行聚类。

> **一句话，select 中的字段要么都聚类，要么都不聚类**

### 确定哪些订单购买了 prod_id 为 BR01 的产品（二）

表 `OrderItems` 代表订单商品信息表，`prod_id` 为产品 id；`Orders` 表代表订单表有 `cust_id` 代表顾客 id 和订单日期 `order_date`

`OrderItems` 表：

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

`Orders` 表：

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

【问题】

编写 SQL 语句，使用子查询来确定哪些订单（在 `OrderItems` 中）购买了 `prod_id` 为 "BR01" 的产品，然后从 `Orders` 表中返回每个产品对应的顾客 ID（`cust_id`）和订单日期（`order_date`），按订购日期对结果进行升序排序。

提示：这一次使用连接和简单的等连接语法。

```sql
# 写法 1：子查询
select cust_id, order_date
from Orders
where order_num in (
    select order_num
    from OrderItems
    where prod_id = 'BR01'
)
order by order_date;

# 写法 2：连接表 inner join
select cust_id, order_date
from Orders o inner join (
    select order_num
    from OrderItems
    where prod_id = 'BR01'
) tb on o.order_num = tb.order_num
order by order_date;

# 写法 3：写法 2 的简化版
select cust_id, order_date
from Orders
inner join OrderItems using(order_num)
where OrderItems.prod_id = 'BR01'
order by order_date;
```

### 返回购买 prod_id 为 BR01 的产品的所有顾客的电子邮件（二）

有表 `OrderItems` 代表订单商品信息表，`prod_id` 为产品 id；`Orders` 表代表订单表有 `cust_id` 代表顾客 id 和订单日期 `order_date`；`Customers` 表含有 `cust_email` 顾客邮件和 cust_id 顾客 id

`OrderItems` 表：

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

`Orders` 表：

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

`Customers` 表代表顾客信息，`cust_id` 为顾客 id，`cust_email` 为顾客 email

| cust_id | cust_email      |
| ------- | --------------- |
| cust10  | cust10@cust.com |
| cust1   | cust1@cust.com  |
| cust2   | cust2@cust.com  |

【问题】返回购买 `prod_id` 为 BR01 的产品的所有顾客的电子邮件（`Customers` 表中的 `cust_email`），结果无需排序。

提示：涉及到 `SELECT` 语句，最内层的从 `OrderItems` 表返回 `order_num`，中间的从 `Customers` 表返回 `cust_id`，但是必须使用 INNER JOIN 语法。

```sql
select cust_email
from Customers
inner join Orders using(cust_id)
inner join OrderItems using(order_num)
where OrderItems.prod_id = 'BR01';
```

### 确定最佳顾客的另一种方式（二）

`OrderItems` 表代表订单信息，确定最佳顾客的另一种方式是看他们花了多少钱，`OrderItems` 表有订单号 `order_num` 和 `item_price` 商品售出价格、`quantity` 商品数量

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1        | 10         | 105      |
| a2        | 1          | 1100     |
| a2        | 1          | 200      |
| a4        | 2          | 1121     |
| a5        | 5          | 10       |
| a2        | 1          | 19       |
| a7        | 7          | 5        |

`Orders` 表含有字段 `order_num` 订单号、`cust_id` 顾客 id

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

顾客表 `Customers` 有字段 `cust_id` 客户 id、`cust_name` 客户姓名

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

【问题】编写 SQL 语句，返回订单总价不小于 1000 的客户名称和总额（`OrderItems` 表中的 `order_num`）。

提示：需要计算总和（`item_price` 乘以 `quantity`）。按总额对结果进行排序，请使用 INNER JOIN 语法。

```sql
select cust_name, sum(item_price * quantity) as total_price
from Customers
inner join Orders using(cust_id)
inner join OrderItems using(order_num)
group by cust_name
having total_price >= 1000
order by total_price;
```

## 创建高级连接

### 检索每个顾客的名称和所有的订单号（一）

`Customers` 表代表顾客信息含有顾客 id `cust_id` 和 顾客名称 `cust_name`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

`Orders` 表代表订单信息含有订单号 `order_num` 和顾客 id `cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

【问题】使用 INNER JOIN 编写 SQL 语句，检索每个顾客的名称（`Customers` 表中的 `cust_name`）和所有的订单号（`Orders` 表中的 `order_num`），最后根据顾客姓名 `cust_name` 升序返回。

```sql
select cust_name, order_num
from Customers
inner join Orders
using(cust_id)
order by cust_name;
```

### 检索每个顾客的名称和所有的订单号（二）

`Orders` 表代表订单信息含有订单号 `order_num` 和顾客 id `cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

`Customers` 表代表顾客信息含有顾客 id `cust_id` 和 顾客名称 `cust_name`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |
| cust40   | ace       |

【问题】检索每个顾客的名称（`Customers` 表中的 `cust_name`）和所有的订单号（Orders 表中的 `order_num`），列出所有的顾客，即使他们没有下过订单。最后根据顾客姓名 `cust_name` 升序返回。

```sql
select cust_name, order_num
from Customers
left join Orders
using(cust_id)
order by cust_name;
```

### 返回产品名称和与之相关的订单号

`Products` 表为产品信息表含有字段 `prod_id` 产品 id、`prod_name` 产品名称

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |
| a0023   | soda      |

`OrderItems` 表为订单信息表含有字段 `order_num` 订单号和产品 id `prod_id`

| prod_id | order_num |
| ------- | --------- |
| a0001   | a105      |
| a0002   | a1100     |
| a0002   | a200      |
| a0013   | a1121     |
| a0003   | a10       |
| a0003   | a19       |
| a0003   | a5        |

【问题】使用外连接（left join、 right join、full join）联结 `Products` 表和 `OrderItems` 表，返回产品名称（`prod_name`）和与之相关的订单号（`order_num`）的列表，并按照产品名称升序排序。

```sql
select prod_name, order_num
from Products
left join OrderItems
using(prod_id)
order by prod_name;
```

### 返回产品名称和每一项产品的总订单数

`Products` 表为产品信息表含有字段 `prod_id` 产品 id、`prod_name` 产品名称

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |
| a0023   | soda      |

`OrderItems` 表为订单信息表含有字段 `order_num` 订单号和产品 id `prod_id`

| prod_id | order_num |
| ------- | --------- |
| a0001   | a105      |
| a0002   | a1100     |
| a0002   | a200      |
| a0013   | a1121     |
| a0003   | a10       |
| a0003   | a19       |
| a0003   | a5        |

【问题】

使用 OUTER JOIN 联结 `Products` 表和 `OrderItems` 表，返回产品名称（`prod_name`）和每一项产品的总订单数（不是订单号），并按产品名称升序排序。

```sql
select prod_name, count(order_num) as orders
from Products
left join OrderItems
using(prod_id)
group by prod_name
order by prod_name;
```

### 列出供应商及其可供产品的数量

有 `Vendors` 表含有 `vend_id` （供应商 id）

| vend_id |
| ------- |
| a0002   |
| a0013   |
| a0003   |
| a0010   |

有 `Products` 表含有 `vend_id`（供应商 id）和 prod_id（供应产品 id）

| vend_id | prod_id              |
| ------- | -------------------- |
| a0001   | egg                  |
| a0002   | prod_id_iphone       |
| a00113  | prod_id_tea          |
| a0003   | prod_id_vivo phone   |
| a0010   | prod_id_huawei phone |

【问题】列出供应商（`Vendors` 表中的 `vend_id`）及其可供产品的数量，包括没有产品的供应商。你需要使用 OUTER JOIN 和 COUNT()聚合函数来计算 `Products` 表中每种产品的数量，最后根据 vend_id 升序排序。

注意：`vend_id` 列会显示在多个表中，因此在每次引用它时都需要完全限定它。

```sql
select vend_id, count(prod_id) as prod_id
from Vendors
left join Products
using(vend_id)
group by vend_id
order by vend_id;
```

## 组合查询

`UNION` 运算符将两个或更多查询的结果组合起来，并生成一个结果集，其中包含来自 `UNION` 中参与查询的提取行。

`UNION` 基本规则：

- 所有查询的列数和列顺序必须相同。
- 每个查询中涉及表的列的数据类型必须相同或兼容。
- 通常返回的列名取自第一个查询。

默认地，`UNION` 操作符选取不同的值。如果允许重复的值，请使用 `UNION ALL`。

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

`UNION` 结果集中的列名总是等于 `UNION` 中第一个 `SELECT` 语句中的列名。

`JOIN` vs `UNION`：

- `JOIN` 中连接表的列可能不同，但在 `UNION` 中，所有查询的列数和列顺序必须相同。
- `UNION` 将查询之后的行放在一起（垂直放置），但 `JOIN` 将查询之后的列放在一起（水平放置），即它构成一个笛卡尔积。

### 将两个 SELECT 语句结合起来（一）

表 `OrderItems` 包含订单产品信息，字段 `prod_id` 代表产品 id、`quantity` 代表产品数量

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 100      |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |
| BNBG    | 10002    |

【问题】将两个 `SELECT` 语句结合起来，以便从 `OrderItems` 表中检索产品 id（`prod_id`）和 `quantity`。其中，一个 `SELECT` 语句过滤数量为 100 的行，另一个 `SELECT` 语句过滤 id 以 BNBG 开头的产品，最后按产品 id 对结果进行升序排序。

```sql
select prod_id, quantity
from OrderItems
where quantity = 100
union
select prod_id, quantity
from OrderItems
where prod_id like 'BNBG%';
```

### 将两个 SELECT 语句结合起来（二）

表 `OrderItems` 包含订单产品信息，字段 `prod_id` 代表产品 id、`quantity` 代表产品数量。

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 100      |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |
| BNBG    | 10002    |

【问题】将两个 `SELECT` 语句结合起来，以便从 `OrderItems` 表中检索产品 id（`prod_id`）和 `quantity`。其中，一个 `SELECT` 语句过滤数量为 100 的行，另一个 `SELECT` 语句过滤 id 以 BNBG 开头的产品，最后按产品 id 对结果进行升序排序。 注意：**这次仅使用单个 SELECT 语句。**

答案：

要求只用一条 select 语句，那就用 `or` 不用 `union` 了。

```sql
select prod_id, quantity
from OrderItems
where quantity = 100 or prod_id like 'BNBG%';
```

### 组合 Products 表中的产品名称和 Customers 表中的顾客名称

`Products` 表含有字段 `prod_name` 代表产品名称

| prod_name |
| --------- |
| flower    |
| rice      |
| ring      |
| umbrella  |

Customers 表代表顾客信息，cust_name 代表顾客名称

| cust_name |
| --------- |
| andy      |
| ben       |
| tony      |
| tom       |
| an        |
| lee       |
| hex       |

【问题】编写 SQL 语句，组合 `Products` 表中的产品名称（`prod_name`）和 `Customers` 表中的顾客名称（`cust_name`）并返回，然后按产品名称对结果进行升序排序。

```sql
# UNION 结果集中的列名总是等于 UNION 中第一个 SELECT 语句中的列名。
select prod_name
from Products
union
select cust_name
from Customers
order by prod_name;
```

### 检查 SQL 语句

表 `Customers` 含有字段 `cust_name` 顾客名、`cust_contact` 顾客联系方式、`cust_state` 顾客州、`cust_email` 顾客 `email`

| cust_name | cust_contact | cust_state | cust_email      |
| --------- | ------------ | ---------- | --------------- |
| cust10    | 8695192      | MI         | cust10@cust.com |
| cust1     | 8695193      | MI         | cust1@cust.com  |
| cust2     | 8695194      | IL         | cust2@cust.com  |

【问题】修正下面错误的 SQL

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI'
ORDER BY cust_name;
UNION
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'IL'ORDER BY cust_name;
```

修正后：

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI'

UNION
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'IL'

ORDER BY cust_name;
```

使用 `union` 组合查询时，只能使用一条 `order by` 字句，他必须位于最后一条 `select` 语句之后

或者直接用 `or` 来做：

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI' or cust_state = 'IL'
ORDER BY cust_name;
```
