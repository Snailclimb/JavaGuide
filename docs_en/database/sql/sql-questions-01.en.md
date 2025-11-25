---
title: Summary of common SQL interview questions (1)
category: database
tag:
  - Database basics
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL interview questions, query, grouping, sorting, connection, subquery, aggregation
  - - meta
    - name: description
      content: Contains basic SQL high-frequency questions and solutions, covering typical scenarios such as query/grouping/sorting/joining, etc., emphasizing the balance between readability and performance.
---

> The question comes from: [Niuke Question Ba - SQL must be known and mastered](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=298)

## Retrieve data

`SELECT` is used to query data from the database.

### Retrieve all IDs from the Customers table

The existing table `Customers` is as follows:

| cust_id |
| ------- |
| A |
| B |
| C |

Write SQL statement to retrieve all `cust_id` from `Customers` table.

Answer:

```sql
SELECT cust_id
FROM Customers
```

### Retrieve and list a list of ordered products

The table `OrderItems` contains a non-empty column `prod_id`, which represents the item id and contains all ordered items (some have been ordered multiple times).

| prod_id |
| ------- |
|a1|
|a2|
| a3 |
| a4 |
| a5 |
| a6 |
| a7 |

Write a SQL statement to retrieve and list the deduplicated list of all ordered items (`prod_id`).

Answer:

```sql
SELECT DISTINCT prod_id
FROM OrderItems
```

Knowledge point: `DISTINCT` is used to return the unique distinct value in a column.

### Retrieve all columns

Now there is a `Customers` table (the table contains columns `cust_id` represents the customer id and `cust_name` represents the customer name)

| cust_id | cust_name |
| ------- | --------- |
| a1 | andy |
| a2 | ben |
| a3 | tony |
| a4 | tom |
| a5 | an |
| a6 | lee |
| a7 | hex |

You need to write SQL statements to retrieve all columns.

Answer:

```sql
SELECT cust_id, cust_name
FROM Customers
```

## Sort retrieval data

`ORDER BY` is used to sort the result set by one column or multiple columns. By default, records are sorted in ascending order. If you need to sort records in descending order, you can use the `DESC` keyword.

### Retrieve customer names and sort them

There is a table `Customers`, `cust_id` represents the customer id, `cust_name` represents the customer name.

| cust_id | cust_name |
| ------- | --------- |
| a1 | andy |
| a2 | ben |
| a3 | tony |
| a4 | tom |
| a5 | an |
| a6 | lee |
| a7 | hex |

Retrieve all customer names (`cust_name`) from `Customers` and display the results in order from Z to A.

Answer:

```sql
SELECT cust_name
FROM Customers
ORDER BY cust_name DESC
```

### Sort by customer ID and date

There is `Orders` table:

| cust_id | order_num | order_date |
| ------- | --------- | ------------------- |
| andy | aaaa | 2021-01-01 00:00:00 |
| andy | bbbb | 2021-01-01 12:00:00 |
| bob | cccc | 2021-01-10 12:00:00 |
| dick | dddd | 2021-01-11 00:00:00 |

Write a SQL statement to retrieve the customer ID (`cust_id`) and order number (`order_num`) from the `Orders` table, and sort the results first by customer ID, and then in reverse order by order date.

Answer:

```sql
# Sort by column name
# Note: order_date descending order, not order_num
SELECT cust_id, order_num
FROM Orders
ORDER BY cust_id,order_date DESC
```

Knowledge point: `order by` When sorting multiple columns, the columns that are sorted first are placed in front, and the columns that are sorted later are placed in the back. Also, different columns can have different sorting rules.

### Sort by quantity and price

Suppose there is an `OrderItems` table:

| quantity | item_price |
| -------- | ---------- |
| 1 | 100 |
| 10 | 1003 |
| 2 | 500 |

Write a SQL statement to display the quantity (`quantity`) and price (`item_price`) in the `OrderItems` table, and sort them by quantity from high to low and price from high to low.

Answer:

```sql
SELECT quantity, item_price
FROM OrderItems
ORDER BY quantity DESC,item_price DESC
```

### Check SQL statement

There is a `Vendors` table:

| vend_name |
| --------- |
| Haidilao |
| Xiaolongkan |
| Dalongyi |

Is there something wrong with the following SQL statement? Try to correct it so that it runs correctly and returns the results in reverse order according to `vend_name`.

```sql
SELECT vend_name,
FROM Vendors
ORDER vend_name DESC
```

After correction:

```sql
SELECT vend_name
FROM Vendors
ORDER BY vend_name DESC
```

Knowledge points:

- Commas are used to separate columns.
- ORDER BY contains BY, which needs to be written completely and in the correct position.

## Filter data

`WHERE` can filter the returned data.

The following operators can be used in the `WHERE` clause:

| Operator | Description |
| :------ | :--------------------------------------------------------------- |
| = | equals |
| <> | is not equal to. **Note:** In some versions of SQL, this operator can be written as != |
| > | greater than |
| < | less than |
| >= | Greater than or equal to |
| <= | Less than or equal to |
| BETWEEN | Within a range |
| LIKE | Search for a pattern |
| IN | Specifies multiple possible values for a column |

### Return fixed price products

There is table `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------------- | ---------- || a0018 | sockets | 9.49 |
| a0019 | iphone13 | 600 |
| b0018 | gucci t-shirts | 1000 |

[Problem] Retrieving the product ID (`prod_id`) and product name (`prod_name`) from the `Products` table only returns products with a price of $9.49.

Answer:

```sql
SELECT prod_id, prod_name
FROM Products
WHERE prod_price = 9.49
```

### Return higher priced products

There is table `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------------- | ---------- |
| a0018 | sockets | 9.49 |
| a0019 | iphone13 | 600 |
| b0019 | gucci t-shirts | 1000 |

[Problem] Write a SQL statement to retrieve the product ID (`prod_id`) and product name (`prod_name`) from the `Products` table, returning only products with a price of $9 or more.

Answer:

```sql
SELECT prod_id, prod_name
FROM Products
WHERE prod_price >= 9
```

### Return products and sort them by price

There is table `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011 | egg | 3 |
| a0019 | sockets | 4 |
| b0019 | coffee | 15 |

[Question] Write a SQL statement to return the name (`prod_name`) and price (`prod_price`) of all products in the `Products` table with a price between $3 and $6, and then sort the results by price.

Answer:

```sql
SELECT prod_name, prod_price
FROM Products
WHERE prod_price BETWEEN 3 AND 6
ORDER BY prod_price

# or
SELECT prod_name, prod_price
FROM Products
WHERE prod_price >= 3 AND prod_price <= 6
ORDER BY prod_price
```

### Return to more products

The `OrderItems` table contains: order number `order_num`, `quantity` product quantity

| order_num | quantity |
| --------- | -------- |
| a1 | 105 |
| a2 | 1100 |
| a2 | 200 |
| a4 | 1121 |
| a5 | 10 |
| a2 | 19 |
| a7 | 5 |

[Problem] Retrieve all distinct and unique order numbers (`order_num`) from the `OrderItems` table, where each order must contain 100 or more products.

Answer:

```sql
SELECT order_num
FROM OrderItems
GROUP BY order_num
HAVING SUM(quantity) >= 100
```

## Advanced data filtering

The `AND` and `OR` operators are used to filter records based on more than one condition and can be used in combination. `AND` requires both conditions to be true, and `OR` only needs one of the 2 conditions to be true.

### Retrieve supplier name

The `Vendors` table has fields vendor name (`vend_name`), vendor country (`vend_country`), vendor state (`vend_state`)

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple | USA | CA |
| vivo | CNA | shenzhen |
| huawei | CNA | xian |

[Problem] Write a SQL statement to retrieve the vendor name (`vend_name`) from the `Vendors` table and return only suppliers in California (this needs to be filtered by country [USA] and state [CA], maybe there is a CA in other countries)

Answer:

```sql
SELECT vend_name
FROM Vendors
WHERE vend_country = 'USA' AND vend_state = 'CA'
```

### Retrieve and list a list of ordered products

The `OrderItems` table contains all ordered products (some have been ordered multiple times).

| prod_id | order_num | quantity |
| ------- | --------- | -------- |
| BR01 | a1 | 105 |
| BR02 | a2 | 1100 |
| BR02 | a2 | 200 |
| BR03 | a4 | 1121 |
| BR017 | a5 | 10 |
| BR02 | a2 | 19 |
| BR017 | a7 | 5 |

[Question] Write a SQL statement to find all orders for `BR01`, `BR02` or `BR03` with a quantity of at least 100 units. You need to return the order number (`order_num`), product ID (`prod_id`) and quantity (`quantity`) of the `OrderItems` table and filter by product ID and quantity.

Answer:

```sql
SELECT order_num, prod_id, quantity
FROM OrderItems
WHERE prod_id IN ('BR01', 'BR02', 'BR03') AND quantity >= 100
```

### Returns the name and price of all products priced between $3 and $6

There is table `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011 | egg | 3 |
| a0019 | sockets | 4 |
| b0019 | coffee | 15 |

[Question] Write a SQL statement to return the name (`prod_name`) and price (`prod_price`) of all products with a price between $3 and $6, use the AND operator, and then sort the results in ascending order by price.

Answer:

```sql
SELECT prod_name, prod_price
FROM Products
WHERE prod_price >= 3 and prod_price <= 6
ORDER BY prod_price
```

### Check SQL statement

The suppliers table `Vendors` has fields supplier name `vend_name`, supplier country `vend_country`, supplier province `vend_state`

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple | USA | CA |
| vivo | CNA | shenzhen |
| huawei | CNA | xian |

[Problem] Modify the following sql correctly so that it can be returned correctly.

```sql
SELECT vend_name
FROM Vendors
ORDER BY vend_name
WHERE vend_country = 'USA' AND vend_state = 'CA';
```

After modification:

```sql
SELECT vend_name
FROM Vendors
WHERE vend_country = 'USA' AND vend_state = 'CA'
ORDER BY vend_name
```

The `ORDER BY` statement must be placed after `WHERE`.

## Use wildcards to filterSQL wildcards must be used with the `LIKE` operator

In SQL, the following wildcard characters can be used:

| wildcard | description |
| :---------------------------------- | :---------------------------------- |
| `%` | represents zero or more characters |
| `_` | Replaces only one character |
| `[charlist]` | Any single character in a character list |
| `[^charlist]` or `[!charlist]` | Any single character not in the character list |

### Retrieve product name and description (1)

The `Products` table is as follows:

| prod_name | prod_desc |
| ---------- | --------------- |
| a0011 | usb |
| a0019 | iphone13 |
| b0019 | gucci t-shirts |
| c0019 | gucci toy |
| d0019 | lego toy |

[Problem] Write a SQL statement to retrieve the product name (`prod_name`) and description (`prod_desc`) from the `Products` table and return only the product names that contain the word `toy` in the description.

Answer:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%'
```

### Retrieve product name and description (2)

The `Products` table is as follows:

| prod_name | prod_desc |
| ---------- | --------------- |
| a0011 | usb |
| a0019 | iphone13 |
| b0019 | gucci t-shirts |
| c0019 | gucci toy |
| d0019 | lego toy |

[Problem] Write a SQL statement to retrieve the product name (`prod_name`) and description (`prod_desc`) from the `Products` table, return only the products where the word `toy` does not appear in the description, and finally sort the results by "product name".

Answer:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc NOT LIKE '%toy%'
ORDER BY prod_name
```

### Retrieve product name and description (3)

The `Products` table is as follows:

| prod_name | prod_desc |
| --------- | ---------------- |
| a0011 | usb |
| a0019 | iphone13 |
| b0019 | gucci t-shirts |
| c0019 | gucci toy |
| d0019 | lego carrots toy |

[Problem] Write a SQL statement to retrieve the product name (`prod_name`) and description (`prod_desc`) from the `Products` table, and only return products where `toy` and `carrots` appear in the description. There are several ways to do this, but for this challenge, use `AND` and two `LIKE` comparisons.

Answer:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%' AND prod_desc LIKE "%carrots%"
```

### Retrieve product name and description (4)

The `Products` table is as follows:

| prod_name | prod_desc |
| --------- | ---------------- |
| a0011 | usb |
| a0019 | iphone13 |
| b0019 | gucci t-shirts |
| c0019 | gucci toy |
| d0019 | lego toy carrots |

[Problem] Write a SQL statement to retrieve the product name (prod_name) and description (prod_desc) from the Products table, and only return products in which toys and carrots appear in **sequence** in the description. Tip: Just use `LIKE` with three `%` symbols.

Answer:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%carrots%'
```

## Create a calculated field

### Alias

A common use of aliases is to rename table column fields in retrieved results (to meet specific reporting requirements or customer needs). There is a table `Vendors` representing supplier information, `vend_id` supplier id, `vend_name` supplier name, `vend_address` supplier address, `vend_city` supplier city.

| vend_id | vend_name | vend_address | vend_city |
| ------- | ------------- | ------------ | ---------- |
| a001 | tencent cloud | address1 | shenzhen |
| a002 | huawei cloud | address2 | dongguan |
| a003 | aliyun cloud | address3 | hangzhou |
| a003 | netease cloud | address4 | guangzhou |

[Problem] Write a SQL statement to retrieve `vend_id`, `vend_name`, `vend_address` and `vend_city` from the `Vendors` table, rename `vend_name` to `vname`, rename `vend_city` to `vcity`, rename `vend_address` to `vaddress`, and sort the results in ascending order by vendor name.

Answer:

```sql
SELECT vend_id, vend_name AS vname, vend_address AS vaddress, vend_city AS vcity
FROM Vendors
ORDER BY vname
# as can be omitted
SELECT vend_id, vend_name vname, vend_address vaddress, vend_city vcity
FROM Vendors
ORDER BY vname
```

### Discount

Our example store is running a sale with 10% off all products. The `Products` table contains `prod_id` product id, `prod_price` product price.

[Question] Write SQL statements to return `prod_id`, `prod_price` and `sale_price` from the `Products` table. `sale_price` is a calculated field containing the promotional price. Tip: You can multiply by 0.9 to get 90% of the original price (i.e. 10% discount).

Answer:

```sql
SELECT prod_id, prod_price, prod_price * 0.9 AS sale_price
FROM Products
```

Note: `sale_price` is the name of the calculation result, not the original column name.

## Use functions to process data

### Customer login name

Our store is online and customer accounts are being created. All users require a login name, and the default login name is a combination of their name and city.

The `Customers` table is given as follows:

| cust_id | cust_name | cust_contact | cust_city |
| ------- | --------- | ------------ | --------- |
| a1 | Andy Li | Andy Li | Oak Park |
| a2 | Ben Liu | Ben Liu | Oak Park |
| a3 | Tony Dai | Tony Dai | Oak Park |
| a4 | Tom Chen | Tom Chen | Oak Park || a5 | An Li | An Li | Oak Park |
| a6 | Lee Chen | Lee Chen | Oak Park |
| a7 | Hex Liu | Hex Liu | Oak Park |

[Question] Write a SQL statement to return the customer ID (`cust_id`), customer name (`cust_name`) and login name (`user_login`), where the login name is all uppercase letters and consists of the first two characters of the customer's contact person (`cust_contact`) and the first three characters of the city (`cust_city`). Tip: Requires the use of functions, concatenation and aliases.

Answer:

```sql
SELECT cust_id, cust_name, UPPER(CONCAT(SUBSTRING(cust_contact, 1, 2), SUBSTRING(cust_city, 1, 3))) AS user_login
FROM Customers
```

Knowledge points:

- Interception function `SUBSTRING()`: intercepts a string, `substring(str,n,m)` (n represents the starting interception position, m represents the number of characters to be intercepted) means that the returned string str intercepts m characters starting from the nth character;
- Concatenation function `CONCAT()`: concatenates two or more strings into one string, select concat(A,B): concatenates strings A and B.

- Uppercase function `UPPER()`: Converts the specified string to uppercase.

### Return the order number and order date of all orders in January 2020

`Orders` order table is as follows:

| order_num | order_date |
| --------- | ------------------- |
| a0001 | 2020-01-01 00:00:00 |
| a0002 | 2020-01-02 00:00:00 |
| a0003 | 2020-01-01 12:00:00 |
| a0004 | 2020-02-01 00:00:00 |
| a0005 | 2020-03-01 00:00:00 |

[Question] Write a SQL statement to return the order number (`order_num`) and order date (`order_date`) of all orders in January 2020, and sort them in ascending order by order date

Answer:

```sql
SELECT order_num, order_date
FROM Orders
WHERE month(order_date) = '01' AND YEAR(order_date) = '2020'
ORDER BY order_date
```

You can also use wildcards to do this:

```sql
SELECT order_num, order_date
FROM Orders
WHERE order_date LIKE '2020-01%'
ORDER BY order_date
```

Knowledge points:

- Date format: `YYYY-MM-DD`
- Time format: `HH:MM:SS`

Commonly used functions related to date and time processing:

| function | description |
| --------------- | ------------------------------- |
| `ADDDATE()` | Add a date (day, week, etc.) |
| `ADDTIME()` | Add a time (hour, minute, etc.) |
| `CURDATE()` | Returns the current date |
| `CURTIME()` | Return the current time |
| `DATE()` | Returns the date part of a datetime |
| `DATEDIFF` | Calculate the difference between two dates |
| `DATE_FORMAT()` | Returns a formatted date or time string |
| `DAY()` | Returns the day part of a date |
| `DAYOFWEEK()` | For a date, return the corresponding day of the week |
| `HOUR()` | Returns the hour part of a time |
| `MINUTE()` | Returns the minute part of a time |
| `MONTH()` | Returns the month part of a date |
| `NOW()` | Returns the current date and time |
| `SECOND()` | Returns the seconds part of a time |
| `TIME()` | Returns the time part of a datetime |
| `YEAR()` | Returns the year part of a date |

## Summary data

Functions related to summary data:

| function | description |
| --------- | ---------------- |
| `AVG()` | Returns the average value of a column |
| `COUNT()` | Returns the number of rows in a column |
| `MAX()` | Returns the maximum value of a column |
| `MIN()` | Returns the minimum value of a column |
| `SUM()` | Returns the sum of values in a column |

### Determine the total number of products sold

The `OrderItems` table represents the products sold, and `quantity` represents the number of items sold.

| quantity |
|--------|
| 10 |
| 100 |
| 1000 |
| 10001 |
| 2 |
| 15 |

[Question] Write a SQL statement to determine the total number of products sold.

Answer:

```sql
SELECT Sum(quantity) AS items_ordered
FROM OrderItems
```

### Determine the total number of product items BR01 sold

The `OrderItems` table represents the products sold, `quantity` represents the quantity of items sold, and the product item is `prod_id`.

| quantity | prod_id |
| -------- | ------- |
| 10 | AR01 |
| 100 | AR10 |
| 1000 | BR01 |
| 10001 | BR010 |

[Problem] Modify the created statement to determine the total number of product items (`prod_id`) sold as "BR01".

Answer:

```sql
SELECT Sum(quantity) AS items_ordered
FROM OrderItems
WHERE prod_id = 'BR01'
```

### Determine the price of the most expensive product in the Products table that is $10 or less

The `Products` table is as follows, `prod_price` represents the price of the product.

| prod_price |
| ---------- |
| 9.49 |
| 600 |
| 1000 |

[Question] Write a SQL statement to determine the price (`prod_price`) of the most expensive product in the `Products` table whose price does not exceed $10. Name the calculated field `max_price`.

Answer:

```sql
SELECT Max(prod_price) AS max_price
FROM Products
WHERE prod_price <= 10
```

## Grouped data

`GROUP BY`:

- The `GROUP BY` clause groups records into summary rows.
- `GROUP BY` returns one record for each group.
- `GROUP BY` usually also involves aggregating `COUNT`, `MAX`, `SUM`, `AVG`, etc.
- `GROUP BY` can group by one or more columns.
- `GROUP BY` After sorting by grouping fields, `ORDER BY` can sort by summary fields.

`HAVING`:

- `HAVING` is used to filter aggregated `GROUP BY` results.
- `HAVING` must be used with `GROUP BY`.
- `WHERE` and `HAVING` can be in the same query.

`HAVING` vs `WHERE`:

- `WHERE`: Filter the specified rows, and aggregate functions (grouping functions) cannot be added later.
- `HAVING`: Filter grouping, must be used together with `GROUP BY`, cannot be used alone.

### Return the number of rows for each order number

The `OrderItems` table contains every product for every order

| order_num |
| --------- |
| a002 |
| a002 |
| a002 |
| a004 |
| a007 |

[Question] Write a SQL statement to return the number of rows (`order_lines`) for each order number (`order_num`), and sort the results in ascending order by `order_lines`.

Answer:

```sql
SELECT order_num, Count(order_num) AS order_lines
FROM OrderItems
GROUP BY order_num
ORDER BY order_lines```

Knowledge points:

1. Both `count(*)` and `count(column name)` are acceptable. The difference is that `count(column name)` counts the number of non-NULL rows;
2. `order by` is executed last, so column aliases can be used;
3. Don’t forget to add `group by` when performing group aggregation, otherwise there will only be one row of results.

### Lowest cost product per supplier

There is a `Products` table with fields `prod_price` representing the product price and `vend_id` representing the supplier id.

| vend_id | prod_price |
| ------- | ---------- |
| a0011 | 100 |
| a0019 | 0.1 |
| b0019 | 1000 |
| b0019 | 6980 |
| b0019 | 20 |

[Question] Write a SQL statement that returns a field named `cheapest_item` that contains the lowest cost product from each supplier (using `prod_price` from the `Products` table), and then sorts the results in ascending order from lowest cost to highest cost.

Answer:

```sql
SELECT vend_id, Min(prod_price) AS cheapest_item
FROM Products
GROUP BY vend_id
ORDER BY cheapest_item
```

### Return the order numbers of all orders whose total order quantity is not less than 100

`OrderItems` represents the order item table, including: order number `order_num` and order quantity `quantity`.

| order_num | quantity |
| --------- | -------- |
| a1 | 105 |
| a2 | 1100 |
| a2 | 200 |
| a4 | 1121 |
| a5 | 10 |
| a2 | 19 |
| a7 | 5 |

[Question] Please write a SQL statement to return all order numbers whose total order quantity is not less than 100. The final results are sorted in ascending order by order number.

Answer:

```sql
# Direct aggregation
SELECT order_num
FROM OrderItems
GROUP BY order_num
HAVING Sum(quantity) >= 100
ORDER BY order_num

# Subquery
SELECT a.order_num
FROM (SELECT order_num, Sum(quantity) AS sum_num
    FROM OrderItems
    GROUP BY order_num
    HAVING sum_num >= 100) a
ORDER BY a.order_num
```

Knowledge points:

- `where`: Filter the specified rows. Aggregation functions (grouping functions) cannot be added later.
- `having`: filter grouping, used together with `group by`, cannot be used alone.

### Calculate the sum

The `OrderItems` table represents order information, including fields: order number `order_num` and `item_price` the selling price of the product, `quantity` the quantity of the product.

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1 | 10 | 105 |
| a2 | 1 | 1100 |
| a2 | 1 | 200 |
| a4 | 2 | 1121 |
| a5 | 5 | 10 |
| a2 | 1 | 19 |
| a7 | 7 | 5 |

[Question] Write a SQL statement to aggregate based on order numbers and return all order numbers with a total order price of not less than 1,000. The final results are sorted in ascending order by order number.

Tip: total price = item_price times quantity

Answer:

```sql
SELECT order_num, Sum(item_price * quantity) AS total_price
FROM OrderItems
GROUP BY order_num
HAVING total_price >= 1000
ORDER BY order_num
```

### Check SQL statement

`OrderItems` table contains `order_num` order numbers

| order_num |
| --------- |
| a002 |
| a002 |
| a002 |
| a004 |
| a007 |

[Question] Modify the following code correctly and execute it

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY items
HAVING COUNT(*) >= 3
ORDER BY items, order_num;
```

After modification:

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY order_num
HAVING items >= 3
ORDER BY items, order_num;
```

## Use subquery

A subquery is a SQL query nested within a larger query, also called an inner query or inner select, and the statement containing the subquery is also called an outer query or outer select. Simply put, a subquery refers to using the result of a `SELECT` query (subquery) as the data source or judgment condition of another SQL statement (main query).

Subqueries can be embedded in `SELECT`, `INSERT`, `UPDATE` and `DELETE` statements, and can also be used with operators such as `=`, `<`, `>`, `IN`, `BETWEEN`, `EXISTS` and other operators.

Subqueries are often used after the `WHERE` clause and the `FROM` clause:

- When used in the `WHERE` clause, depending on different operators, the subquery can return a single row and a single column, multiple rows and a single column, or a single row and multiple columns of data. A subquery is to return a value that can be used as a WHERE clause query condition.
- When used in the `FROM` clause, multi-row and multi-column data is generally returned, which is equivalent to returning a temporary table, so as to comply with the rule that `FROM` is followed by a table. This approach can implement joint queries on multiple tables.

> Note: MySQL database only supports subqueries from version 4.1, and earlier versions do not support it.

The basic syntax of a subquery for a `WHERE` clause is as follows:

```sql
SELECT column_name [, column_name ]
FROM table1 [, table2 ]
WHERE column_name operator
(SELECT column_name [, column_name ]
FROM table1 [, table2 ]
[WHERE])
```

- Subqueries need to be placed within brackets `( )`.
- `operator` represents the operator used for the `WHERE` clause, which can be a comparison operator (such as `=`, `<`, `>`, `<>`, etc.) or a logical operator (such as `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`, etc.), which is determined according to the requirements.

The basic syntax of a subquery for a `FROM` clause is as follows:

```sql
SELECT column_name [, column_name ]
FROM (SELECT column_name [, column_name ]
      FROM table1 [, table2 ]
      [WHERE]) AS temp_table_name [, ...]
[JOIN type JOIN table_name ON condition]
WHERE condition;
```

- The result returned by the subquery for `FROM` is equivalent to a temporary table, so you need to use the AS keyword to give the temporary table a name.
- Subqueries need to be placed within brackets `( )`.
- You can specify multiple temporary table names and join these tables using the `JOIN` statement.

### Returns a list of customers who purchased products priced at $10 or more

`OrderItems` represents the order item table, containing fields order number: `order_num`, order price: `item_price`; `Orders` table represents the order information table, containing customer `id: cust_id` and order number: `order_num`

`OrderItems` table:

| order_num | item_price |
| --------- | ---------- |
| a1 | 10 |
| a2 | 1 |
| a2 | 1 |
| a4 | 2 |
| a5 | 5 || a2 | 1 |
| a7 | 7 |

`Orders` table:

| order_num | cust_id |
| --------- | ------- |
| a1 | cust10 |
| a2 | cust1 |
| a2 | cust1 |
| a4 | cust2 |
| a5 | cust5 |
| a2 | cust1 |
| a7 | cust7 |

[Problem] Use a subquery to return a list of customers who purchased products with a price of $10 or more. The results do not need to be sorted.

Answer:

```sql
SELECT cust_id
FROM Orders
WHERE order_num IN (SELECT DISTINCT order_num
    FROM OrderItems
    where item_price >= 10)
```

### Determine which orders purchased the product with prod_id BR01 (1)

The table `OrderItems` represents the order product information table, `prod_id` is the product id; the `Orders` table represents the order table, `cust_id` represents the customer id and the order date `order_date`

`OrderItems` table:

| prod_id | order_num |
| ------- | --------- |
| BR01 | a0001 |
| BR01 | a0002 |
| BR02 | a0003 |
| BR02 | a0013 |

`Orders` table:

| order_num | cust_id | order_date |
| --------- | ------- | ------------------- |
| a0001 | cust10 | 2022-01-01 00:00:00 |
| a0002 | cust1 | 2022-01-01 00:01:00 |
| a0003 | cust1 | 2022-01-02 00:00:00 |
| a0013 | cust2 | 2022-01-01 00:20:00 |

【Question】

Write a SQL statement that uses a subquery to determine which orders (in `OrderItems`) purchased the product with `prod_id` as "BR01", then return the customer ID (`cust_id`) and order date (`order_date`) for each product from the `Orders` table, sorting the results in ascending order by order date.

Answer:

```sql
# Writing method 1: subquery
SELECT cust_id,order_date
FROM Orders
WHERE order_num IN
    (SELECT order_num
     FROM OrderItems
     WHERE prod_id = 'BR01' )
ORDER BY order_date;

# Writing method 2: Join table
SELECT b.cust_id, b.order_date
FROM OrderItems a,Orders b
WHERE a.order_num = b.order_num AND a.prod_id = 'BR01'
ORDER BY order_date
```

### Return the emails of all customers who purchased the product with prod_id BR01 (1)

You want to know the date of ordering BR01 product. The table `OrderItems` represents the order product information table, `prod_id` is the product id; the `Orders` table represents the order table, which has `cust_id` which represents the customer id and the order date `order_date`; the `Customers` table contains `cust_email` customer email and `cust_id` customer id

`OrderItems` table:

| prod_id | order_num |
| ------- | --------- |
| BR01 | a0001 |
| BR01 | a0002 |
| BR02 | a0003 |
| BR02 | a0013 |

`Orders` table:

| order_num | cust_id | order_date |
| --------- | ------- | ------------------- |
| a0001 | cust10 | 2022-01-01 00:00:00 |
| a0002 | cust1 | 2022-01-01 00:01:00 |
| a0003 | cust1 | 2022-01-02 00:00:00 |
| a0013 | cust2 | 2022-01-01 00:20:00 |

The `Customers` table represents customer information, `cust_id` is the customer id, `cust_email` is the customer email

| cust_id | cust_email |
| ------- | ------------------ |
| cust10 | <cust10@cust.com> |
| cust1 | <cust1@cust.com> |
| cust2 | <cust2@cust.com> |

[Problem] Return the emails of all customers who purchased the product with `prod_id` as `BR01` (`cust_email` in the `Customers` table) without sorting the results.

Tip: This involves `SELECT` statements, the innermost one returning `order_num` from the `OrderItems` table, and the middle one returning `cust_id` from the `Customers` table.

Answer:

```sql
# Writing method 1: subquery
SELECT cust_email
FROM Customers
WHERE cust_id IN (SELECT cust_id
    FROM Orders
    WHERE order_num IN (SELECT order_num
        FROM OrderItems
        WHERE prod_id = 'BR01'))

# Writing method 2: Join table (inner join)
SELECT c.cust_email
FROM OrderItems a,Orders b,Customers c
WHERE a.order_num = b.order_num AND b.cust_id = c.cust_id AND a.prod_id = 'BR01'

#Writing 3: Join table (left join)
SELECT c.cust_email
FROM ORDERS A LEFT JOIN
  OrderItems b ON a.order_num = b.order_num LEFT JOIN
  Customers c ON a.cust_id = c.cust_id
WHERE b.prod_id = 'BR01'
```

### Return the total amount of different orders for each customer

We need a list of customer IDs with the total amount they have ordered.

The `OrderItems` table represents order information. The `OrderItems` table has order number: `order_num`, product selling price: `item_price`, and product quantity: `quantity`.

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a0001 | 10 | 105 |
| a0002 | 1 | 1100 |
| a0002 | 1 | 200 |
| a0013 | 2 | 1121 |
| a0003 | 5 | 10 |
| a0003 | 1 | 19 |
| a0003 | 7 | 5 |

`Orders` table order number: `order_num`, customer id: `cust_id`

| order_num | cust_id |
| --------- | ------- |
| a0001 | cust10 |
| a0002 | cust1 |
| a0003 | cust1 |
| a0013 | cust2 |

【Question】

Write a SQL statement that returns the customer ID (`cust_id` in the `Orders` table) and use a subquery to return `total_ordered` to return the total number of orders for each customer, sorting the results by amount from largest to smallest.

Answer:

```sql
# Writing method 1: subquery
SELECT o.cust_id, SUM(tb.total_ordered) AS `total_ordered`
FROM (SELECT order_num, SUM(item_price * quantity) AS total_ordered
    FROM OrderItems
    GROUP BY order_num) AS tb,
  Orders o
WHERE tb.order_num = o.order_num
GROUP BY o.cust_id
ORDER BY total_ordered DESC;

# Writing method 2: Join table
SELECT b.cust_id, Sum(a.quantity * a.item_price) AS total_ordered
FROM OrderItems a,Orders b
WHERE a.order_num = b.order_num
GROUP BY cust_id
ORDER BY total_ordered DESC```

For a detailed introduction to the writing method, please refer to: [issue#2402: Errors in writing method 1 and how to modify it](https://github.com/Snailclimb/JavaGuide/issues/2402).

### Retrieve all product names and corresponding sales totals from the Products table

Retrieve all product names: `prod_name`, product ids: `prod_id` in the `Products` table

| prod_id | prod_name |
| ------- | --------- |
| a0001 | egg |
| a0002 | sockets |
| a0013 | coffee |
| a0003 | cola |

`OrderItems` represents the order item table, order product: `prod_id`, sold quantity: `quantity`

| prod_id | quantity |
| ------- | -------- |
| a0001 | 105 |
| a0002 | 1100 |
| a0002 | 200 |
| a0013 | 1121 |
| a0003 | 10 |
| a0003 | 19 |
| a0003 | 5 |

【Question】

Write a SQL statement to retrieve all product names (`prod_name`) from the `Products` table, and a calculated column named `quant_sold` that contains the total number of products sold (retrieved using a subquery and `SUM(quantity)` on the `OrderItems` table).

Answer:

```sql
# Writing method 1: subquery
SELECT p.prod_name, tb.quant_sold
FROM (SELECT prod_id, Sum(quantity) AS quant_sold
    FROM OrderItems
    GROUP BY prod_id) AS tb,
  Products p
WHERE tb.prod_id = p.prod_id

# Writing method 2: Join table
SELECT p.prod_name, Sum(o.quantity) AS quant_sold
FROM Products p,
  OrderItems o
WHERE p.prod_id = o.prod_id
GROUP BY p.prod_name (p.prod_id cannot be used here, an error will be reported)
```

## Join table

JOIN means "connection". As the name suggests, the SQL JOIN clause is used to join two or more tables for query.

When connecting tables, you need to select a field in each table and compare the values ​​of these fields. Two records with the same value will be merged into one. **The essence of joining tables is to merge records from different tables to form a new table. Of course, this new table is only temporary, it only exists for the duration of this query**.

The basic syntax for joining two tables using `JOIN` is as follows:

```sql
SELECT table1.column1, table2.column2...
FROM table1
JOIN table2
ON table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` is a join condition. Only records that meet this condition will be merged into one row. You can join tables using several operators, such as =, >, <, <>, <=, >=, !=, `between`, `like`, or `not`, but the most common is to use =.

When there are fields with the same name in two tables, in order to help the database engine distinguish the fields of which table, the table name needs to be added when writing the field names with the same name. Of course, if the written field name is unique in the two tables, you can not use the above format and just write the field name.

In addition, if the related field names of the two tables are the same, you can also use the `USING` clause instead of `ON`, for example:

```sql
# join....on
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
ON c.cust_id = o.cust_id
ORDER BY c.cust_name

# If the associated field names of the two tables are the same, you can also use the USING clause: JOIN....USING()
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name
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

![](https://oss.javaguide.cn/github/javaguide/csdn/d1794312b448516831369f869814ab39.png)

If you just write `JOIN` without adding any modifiers, the default is `INNER JOIN`

For `INNER JOIN`, there is also an implicit way of writing, called "**Implicit inner join**", that is, there is no `INNER JOIN` keyword, and the `WHERE` statement is used to implement the inner join function.

```sql
#Implicit inner join
SELECT c.cust_name, o.order_num
FROM Customers c,Orders o
WHERE c.cust_id = o.cust_id
ORDER BY c.cust_name

#Explicit inner join
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name;
```

### Return customer name and related order number

The `Customers` table has fields customer name `cust_name` and customer id `cust_id`

| cust_id | cust_name |
|--------|---------|
| cust10 | andy |
| cust1 | ben |
| cust2 | tony |
| cust22 | tom |
| cust221 | an |
| cust2217 | hex |`Orders` order information table, containing fields `order_num` order number, `cust_id` customer id

| order_num | cust_id |
| --------- | -------- |
| a1 | cust10 |
| a2 | cust1 |
| a3 | cust2 |
| a4 | cust22 |
| a5 | cust221 |
| a7 | cust2217 |

[Question] Write a SQL statement to return the customer name (`cust_name`) in the `Customers` table and the related order number (`order_num`) in the `Orders` table, and sort the results by customer name and order number in ascending order. You can try two different writing methods, one using simple equal join syntax, and the other using INNER JOIN.

Answer:

```sql
#Implicit inner join
SELECT c.cust_name, o.order_num
FROM Customers c,Orders o
WHERE c.cust_id = o.cust_id
ORDER BY c.cust_name,o.order_num

#Explicit inner join
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name,o.order_num;
```

### Return the customer name and related order number and the total price of each order

The `Customers` table has fields, customer name: `cust_name`, customer id: `cust_id`

| cust_id | cust_name |
|--------|---------|
| cust10 | andy |
| cust1 | ben |
| cust2 | tony |
| cust22 | tom |
| cust221 | an |
| cust2217 | hex |

`Orders` order information table, contains fields, order number: `order_num`, customer id: `cust_id`

| order_num | cust_id |
| --------- | -------- |
| a1 | cust10 |
| a2 | cust1 |
| a3 | cust2 |
| a4 | cust22 |
| a5 | cust221 |
| a7 | cust2217 |

The `OrderItems` table has fields, product order number: `order_num`, product quantity: `quantity`, product price: `item_price`

| order_num | quantity | item_price |
| --------- | -------- | ---------- |
| a1 | 1000 | 10 |
| a2 | 200 | 10 |
| a3 | 10 | 15 |
| a4 | 25 | 50 |
| a5 | 15 | 25 |
| a7 | 7 | 7 |

[Problem] In addition to returning the customer name and order number, return the customer name (`cust_name`) in the `Customers` table and the related order number (`order_num`) in the `Orders` table, add a third column `OrderTotal`, which contains the total price of each order, and sort the results by customer name and then by order number in ascending order.

```sql
# Simple equal connection syntax
SELECT c.cust_name, o.order_num, SUM(quantity * item_price) AS OrderTotal
FROM Customers c,Orders o,OrderItems oi
WHERE c.cust_id = o.cust_id AND o.order_num = oi.order_num
GROUP BY c.cust_name, o.order_num
ORDER BY c.cust_name, o.order_num
```

Note, some friends may write like this:

```sql
SELECT c.cust_name, o.order_num, SUM(quantity * item_price) AS OrderTotal
FROM Customers c,Orders o,OrderItems oi
WHERE c.cust_id = o.cust_id AND o.order_num = oi.order_num
GROUP BY c.cust_name
ORDER BY c.cust_name,o.order_num
```

This is wrong! Clustering only `cust_name` does meet the meaning of the question, but it does not comply with the syntax of `GROUP BY`.

In the select statement, if there is no `GROUP BY` statement, then `cust_name` and `order_num` will return several values, while `sum(quantity * item_price)` will only return one value. Through `group by` `cust_name` can make `cust_name` and `sum(quantity * item_price)` correspond one to one, or **clustering**, so the same must be done. `order_num` performs clustering.

> **In a word, the fields in select are either all clustered or none**

### Determine which orders purchased the product with prod_id BR01 (2)

The table `OrderItems` represents the order product information table, `prod_id` is the product id; the `Orders` table represents the order table, `cust_id` represents the customer id and the order date `order_date`

`OrderItems` table:

| prod_id | order_num |
| ------- | --------- |
| BR01 | a0001 |
| BR01 | a0002 |
| BR02 | a0003 |
| BR02 | a0013 |

`Orders` table:

| order_num | cust_id | order_date |
| --------- | ------- | ------------------- |
| a0001 | cust10 | 2022-01-01 00:00:00 |
| a0002 | cust1 | 2022-01-01 00:01:00 |
| a0003 | cust1 | 2022-01-02 00:00:00 |
| a0013 | cust2 | 2022-01-01 00:20:00 |

【Question】

Write a SQL statement that uses a subquery to determine which orders (in `OrderItems`) purchased the product with `prod_id` as "BR01", then return the customer ID (`cust_id`) and order date (`order_date`) for each product from the `Orders` table, sorting the results in ascending order by order date.

Tip: This time use joins and simple equijoin syntax.

```sql
# Writing method 1: subquery
SELECT cust_id, order_date
FROM Orders
WHERE order_num IN (SELECT order_num
    FROM OrderItems
    WHERE prod_id = 'BR01')
ORDER BY order_date

#Writing method 2: join table inner join
SELECT cust_id, order_date
FROM ORDERS o INNER JOIN
  (SELECT order_num
    FROM OrderItems
    WHERE prod_id = 'BR01') tb ON o.order_num = tb.order_num
ORDER BY order_date

# Writing method 3: Simplified version of writing method 2
SELECT cust_id, order_date
FROM Orders
INNER JOIN OrderItems USING(order_num)
WHERE OrderItems.prod_id = 'BR01'
ORDER BY order_date
```

### Return the emails of all customers who purchased the product with prod_id BR01 (2)There is a table `OrderItems` representing the order product information table, `prod_id` is the product id; the `Orders` table represents the order table having `cust_id` representing the customer id and the order date `order_date`; the `Customers` table contains `cust_email` customer email and cust_id customer id

`OrderItems` table:

| prod_id | order_num |
| ------- | --------- |
| BR01 | a0001 |
| BR01 | a0002 |
| BR02 | a0003 |
| BR02 | a0013 |

`Orders` table:

| order_num | cust_id | order_date |
| --------- | ------- | ------------------- |
| a0001 | cust10 | 2022-01-01 00:00:00 |
| a0002 | cust1 | 2022-01-01 00:01:00 |
| a0003 | cust1 | 2022-01-02 00:00:00 |
| a0013 | cust2 | 2022-01-01 00:20:00 |

The `Customers` table represents customer information, `cust_id` is the customer id, `cust_email` is the customer email

| cust_id | cust_email |
| ------- | ------------------ |
| cust10 | <cust10@cust.com> |
| cust1 | <cust1@cust.com> |
| cust2 | <cust2@cust.com> |

[Problem] Return the emails of all customers who purchased the product with `prod_id` as BR01 (`cust_email` in the `Customers` table) without sorting the results.

Tip: When it comes to the `SELECT` statement, the innermost one returns `order_num` from the `OrderItems` table, and the middle one returns `cust_id` from the `Customers` table, but the INNER JOIN syntax must be used.

```sql
SELECT cust_email
FROM Customers
INNER JOIN Orders using(cust_id)
INNER JOIN OrderItems using(order_num)
WHERE OrderItems.prod_id = 'BR01'
```

### Another way to determine the best customers (2)

The `OrderItems` table represents order information. Another way to determine the best customers is to look at how much they spend. The `OrderItems` table has the order number `order_num` and `item_price` the price at which the item was sold, and `quantity` the quantity of the item.

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1 | 10 | 105 |
| a2 | 1 | 1100 |
| a2 | 1 | 200 |
| a4 | 2 | 1121 |
| a5 | 5 | 10 |
| a2 | 1 | 19 |
| a7 | 7 | 5 |

The `Orders` table contains the fields `order_num` order number, `cust_id` customer id

| order_num | cust_id |
| --------- | -------- |
| a1 | cust10 |
| a2 | cust1 |
| a3 | cust2 |
| a4 | cust22 |
| a5 | cust221 |
| a7 | cust2217 |

The customer table `Customers` has fields `cust_id` customer id, `cust_name` customer name

| cust_id | cust_name |
|--------|---------|
| cust10 | andy |
| cust1 | ben |
| cust2 | tony |
| cust22 | tom |
| cust221 | an |
| cust2217 | hex |

[Question] Write a SQL statement to return the customer name and total amount (`order_num` in the `OrderItems` table) whose order total price is not less than 1000.

Tip: Need to calculate the sum (`item_price` times `quantity`). To sort the results by total amount, use the `INNER JOIN` syntax.

```sql
SELECT cust_name, SUM(item_price * quantity) AS total_price
FROM Customers
INNER JOIN Orders USING(cust_id)
INNER JOIN OrderItems USING(order_num)
GROUP BY cust_name
HAVING total_price >= 1000
ORDER BY total_price
```

## Create advanced connection

### Retrieve each customer's name and all order numbers (1)

The `Customers` table represents customer information containing customer id `cust_id` and customer name `cust_name`

| cust_id | cust_name |
|--------|---------|
| cust10 | andy |
| cust1 | ben |
| cust2 | tony |
| cust22 | tom |
| cust221 | an |
| cust2217 | hex |

The `Orders` table represents order information including order number `order_num` and customer id `cust_id`

| order_num | cust_id |
| --------- | -------- |
| a1 | cust10 |
| a2 | cust1 |
| a3 | cust2 |
| a4 | cust22 |
| a5 | cust221 |
| a7 | cust2217 |

[Problem] Use INNER JOIN to write SQL statements to retrieve the name of each customer (`cust_name` in the `Customers` table) and all order numbers (`order_num` in the `Orders` table), and finally return them in ascending order according to the customer name `cust_name`.

```sql
SELECT cust_name, order_num
FROM Customers
INNER JOIN Orders
USING(cust_id)
ORDER BY cust_name
```

### Retrieve each customer's name and all order numbers (2)

The `Orders` table represents order information including order number `order_num` and customer id `cust_id`

| order_num | cust_id |
| --------- | -------- |
| a1 | cust10 |
| a2 | cust1 |
| a3 | cust2 |
| a4 | cust22 |
| a5 | cust221 |
| a7 | cust2217 |

The `Customers` table represents customer information containing customer id `cust_id` and customer name `cust_name`

| cust_id | cust_name |
|--------|---------|
| cust10 | andy |
| cust1 | ben |
| cust2 | tony |
| cust22 | tom |
| cust221 | an |
| cust2217 | hex |
| cust40 | ace |

[Problem] Retrieve each customer's name (`cust_name` in the `Customers` table) and all order numbers (`order_num` in the Orders table), and list all customers, even if they have not placed an order. Finally, it is returned in ascending order according to the customer name `cust_name`.

```sql
SELECT cust_name, order_num
FROM Customers
LEFT JOIN Orders
USING(cust_id)
ORDER BY cust_name```

### Return the product name and the order number associated with it

The `Products` table contains the fields `prod_id` product id, `prod_name` product name for the product information table.

| prod_id | prod_name |
| ------- | --------- |
| a0001 | egg |
| a0002 | sockets |
| a0013 | coffee |
| a0003 | cola |
| a0023 | soda |

The `OrderItems` table contains the fields `order_num`, order number and product id `prod_id` for the order information table.

| prod_id | order_num |
| ------- | --------- |
| a0001 | a105 |
| a0002 | a1100 |
| a0002 | a200 |
| a0013 | a1121 |
| a0003 | a10 |
| a0003 | a19 |
| a0003 | a5 |

[Problem] Use outer joins (left join, right join, full join) to join the `Products` table and the `OrderItems` table, return a list of product names (`prod_name`) and related order numbers (`order_num`), and sort them in ascending order by product name.

```sql
SELECT prod_name, order_num
FROM Products
LEFT JOIN OrderItems
USING(prod_id)
ORDER BY prod_name
```

### Return the product name and the total number of orders for each product

The `Products` table contains the fields `prod_id` product id, `prod_name` product name for the product information table.

| prod_id | prod_name |
| ------- | --------- |
| a0001 | egg |
| a0002 | sockets |
| a0013 | coffee |
| a0003 | cola |
| a0023 | soda |

The `OrderItems` table contains the fields `order_num`, order number and product id `prod_id` for the order information table.

| prod_id | order_num |
| ------- | --------- |
| a0001 | a105 |
| a0002 | a1100 |
| a0002 | a200 |
| a0013 | a1121 |
| a0003 | a10 |
| a0003 | a19 |
| a0003 | a5 |

【Question】

Use OUTER JOIN to join the `Products` table and the `OrderItems` table, return the product name (`prod_name`) and the total number of orders for each product (not the order number), and sort by product name in ascending order.

```sql
SELECT prod_name, COUNT(order_num) AS orders
FROM Products
LEFT JOIN OrderItems
USING(prod_id)
GROUP BY prod_name
ORDER BY prod_name
```

### List suppliers and their available product quantities

There is a `Vendors` table containing `vend_id` (vendor id)

| vend_id |
| ------- |
| a0002 |
| a0013 |
| a0003 |
| a0010 |

There is a `Products` table containing `vend_id` (vendor id) and prod_id (supplied product id)

| vend_id | prod_id |
| ------- | -------------------- |
| a0001 | egg |
| a0002 | prod_id_iphone |
| a00113 | prod_id_tea |
| a0003 | prod_id_vivo phone |
| a0010 | prod_id_huawei phone |

[Question] List vendors (`vend_id` in `Vendors` table) and their available product quantities, including vendors with no products. You need to use OUTER JOIN and COUNT() aggregate function to calculate the quantity of each product in the `Products` table, and finally sort them in ascending order based on vend_id.

NOTE: The `vend_id` column appears in multiple tables, so it needs to be fully qualified each time it is referenced.

```sql
SELECT v.vend_id, COUNT(prod_id) AS prod_id
FROM Vendors v
LEFT JOIN Products p
USING(vend_id)
GROUP BY v.vend_id
ORDER BY v.vend_id
```

## Combined query

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

### Combine two SELECT statements (1)

The table `OrderItems` contains order product information. The field `prod_id` represents the product id and `quantity` represents the product quantity.

| prod_id | quantity |
| ------- | -------- |
| a0001 | 105 |
| a0002 | 100 |
| a0002 | 200 |
| a0013 | 1121 |
| a0003 | 10 |
| a0003 | 19 |
| a0003 | 5 |
|BNBG|10002|

[Question] Combine two `SELECT` statements to retrieve product id (`prod_id`) and `quantity` from the `OrderItems` table. One `SELECT` statement filters rows with a quantity of 100, another `SELECT` statement filters products whose id starts with BNBG, and finally sorts the results by product id in ascending order.

```sql
SELECT prod_id, quantity
FROM OrderItems
WHERE quantity = 100
UNION
SELECT prod_id, quantity
FROM OrderItems
WHERE prod_id LIKE 'BNBG%'
```

### Combine two SELECT statements (2)

The table `OrderItems` contains order product information, the field `prod_id` represents the product id, and `quantity` represents the product quantity.

| prod_id | quantity |
| ------- | -------- |
| a0001 | 105 |
| a0002 | 100 |
| a0002 | 200 |
| a0013 | 1121 |
| a0003 | 10 |
| a0003 | 19 |
| a0003 | 5 |
|BNBG|10002|

[Question] Combine two `SELECT` statements to retrieve product id (`prod_id`) and `quantity` from the `OrderItems` table. One `SELECT` statement filters rows with a quantity of 100, another `SELECT` statement filters products whose id starts with BNBG, and finally sorts the results by product id in ascending order. NOTE: **Only use a single SELECT statement this time. **

Answer:

If only one select statement is required, use `or` instead of `union`.

```sql
SELECT prod_id, quantity
FROM OrderItems
WHERE quantity = 100 OR prod_id LIKE 'BNBG%'```

### Combine the product names in the Products table and the customer names in the Customers table

The `Products` table contains the field `prod_name` representing the product name

| prod_name |
| --------- |
| flower |
| rice |
| ring |
| umbrella |

The Customers table represents customer information, and cust_name represents the customer name.

| cust_name |
| --------- |
| andy |
| ben |
| tony |
| tom |
| an |
|lee|
| hex |

[Problem] Write a SQL statement to combine the product name (`prod_name`) in the `Products` table and the customer name (`cust_name`) in the `Customers` table and return it, and then sort the results in ascending order by product name.

```sql
# The column names in the UNION result set are always equal to the column names in the first SELECT statement in the UNION.
SELECT prod_name
FROM Products
UNION
SELECT cust_name
FROM Customers
ORDER BY prod_name
```

### Check SQL statement

The table `Customers` contains fields `cust_name` customer name, `cust_contact` customer contact information, `cust_state` customer state, `cust_email` customer `email`

| cust_name | cust_contact | cust_state | cust_email |
| --------- | ------------ | ---------- | ------------------ |
| cust10 | 8695192 | MI | <cust10@cust.com> |
| cust1 | 8695193 | MI | <cust1@cust.com> |
| cust2 | 8695194 | IL | <cust2@cust.com> |

[Problem] Correct the following incorrect SQL

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

After correction:

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

When using `union` to combine queries, only one `order by` statement can be used, and it must be located after the last `select` statement

Or just use `or` to do it:

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI' or cust_state = 'IL'
ORDER BY cust_name;
```

<!-- @include: @article-footer.snippet.md -->