---
title: 字符集详解
category: 数据库
tag:
  - 数据库基础
head:
  - - meta
    - name: keywords
      content: 字符集,编码,UTF-8,UTF-16,GBK,utf8mb4,emoji,存储与传输
  - - meta
    - name: description
      content: 从编码与字符集原理入手，解释 utf8 与 utf8mb4 差异与 emoji 存储问题，指导数据库与应用的正确配置。
---

MySQL 字符编码集中有两套 UTF-8 编码实现：**`utf8`** 和 **`utf8mb4`**。

如果使用 **`utf8`** 的话，存储 emoji 符号和一些比较复杂的汉字、繁体字就会出错。

为什么会这样呢？这篇文章可以从源头给你解答。

## 字符集是什么？

字符是各种文字和符号的统称，包括各个国家文字、标点符号、表情、数字等等。 **字符集** 就是一系列字符的集合。字符集的种类较多，每个字符集可以表示的字符范围通常不同，就比如说有些字符集是无法表示汉字的。

**计算机只能存储二进制的数据，那英文、汉字、表情等字符应该如何存储呢？**

我们要将这些字符和二进制的数据一一对应起来，比如说字符“a”对应“01100001”，反之，“01100001”对应 “a”。我们将字符对应二进制数据的过程称为"**字符编码**"，反之，二进制数据解析成字符的过程称为“**字符解码**”。

## 字符编码是什么？

字符编码是一种将字符集中的字符与计算机中的二进制数据相互转换的方法，可以看作是一种映射规则。也就是说，字符编码的目的是为了让计算机能够存储和传输各种文字信息。

每种字符集都有自己的字符编码规则，常用的字符集编码规则有 ASCII 编码、 GB2312 编码、GBK 编码、GB18030 编码、Big5 编码、UTF-8 编码、UTF-16 编码等。

## 有哪些常见的字符集？

常见的字符集有：ASCII、GB2312、GB18030、GBK、Unicode……。

不同的字符集的主要区别在于：

- 可以表示的字符范围
- 编码方式

### ASCII

**ASCII** (**A**merican **S**tandard **C**ode for **I**nformation **I**nterchange，美国信息交换标准代码) 是一套主要用于现代美国英语的字符集（这也是 ASCII 字符集的局限性所在）。

**为什么 ASCII 字符集没有考虑到中文等其他字符呢？** 因为计算机是美国人发明的，当时，计算机的发展还处于比较雏形的时代，还未在其他国家大规模使用。因此，美国发布 ASCII 字符集的时候没有考虑兼容其他国家的语言。

ASCII 字符集至今为止共定义了 128 个字符，其中有 33 个控制字符（比如回车、删除）无法显示。

一个 ASCII 码长度是一个字节也就是 8 个 bit，比如“a”对应的 ASCII 码是“01100001”。不过，最高位是 0 仅仅作为校验位，其余 7 位使用 0 和 1 进行组合，所以，ASCII 字符集可以定义 128（2^7）个字符。

由于，ASCII 码可以表示的字符实在是太少了。后来，人们对其进行了扩展得到了 **ASCII 扩展字符集** 。ASCII 扩展字符集使用 8 位（bits）表示一个字符，所以，ASCII 扩展字符集可以定义 256（2^8）个字符。

![ASCII字符编码](https://oss.javaguide.cn/github/javaguide/csdn/c1c6375d08ca268690cef2b13591a5b4.png)

### GB2312

我们上面说了，ASCII 字符集是一种现代美国英语适用的字符集。因此，很多国家都捣鼓了一个适合自己国家语言的字符集。

GB2312 字符集是一种对汉字比较友好的字符集，共收录 6700 多个汉字，基本涵盖了绝大部分常用汉字。不过，GB2312 字符集不支持绝大部分的生僻字和繁体字。

对于英语字符，GB2312 编码和 ASCII 码是相同的，1 字节编码即可。对于非英字符，需要 2 字节编码。

### GBK

GBK 字符集可以看作是 GB2312 字符集的扩展，兼容 GB2312 字符集，共收录了 20000 多个汉字。

GBK 中 K 是汉语拼音 Kuo Zhan（扩展）中的“Kuo”的首字母。

### GB18030

GB18030 完全兼容 GB2312 和 GBK 字符集，纳入中国国内少数民族的文字，且收录了日韩汉字，是目前为止最全面的汉字字符集，共收录汉字 70000 多个。

### BIG5

BIG5 主要针对的是繁体中文，收录了 13000 多个汉字。

### Unicode & UTF-8

为了更加适合本国语言，诞生了很多种字符集。

我们上面也说了不同的字符集可以表示的字符范围以及编码规则存在差异。这就导致了一个非常严重的问题：**使用错误的编码方式查看一个包含字符的文件就会产生乱码现象。**

就比如说你使用 UTF-8 编码方式打开 GB2312 编码格式的文件就会出现乱码。示例：“牛”这个汉字 GB2312 编码后的十六进制数值为 “C5A3”，而 “C5A3” 用 UTF-8 解码之后得到的却是 “ţ”。

你可以通过这个网站在线进行编码和解码：<https://www.haomeili.net/HanZi/ZiFuBianMaZhuanHuan>

![](https://oss.javaguide.cn/github/javaguide/csdn/836c49b117ee4408871b0020b74c991d.png)

这样我们就搞懂了乱码的本质：**编码和解码时用了不同或者不兼容的字符集** 。

![](https://oss.javaguide.cn/javaguide/a8808cbabeea49caa3af27d314fa3c02-1.jpg)

为了解决这个问题，人们就想：“如果我们能够有一种字符集将世界上所有的字符都纳入其中就好了！”。

然后，**Unicode** 带着这个使命诞生了。

Unicode 字符集中包含了世界上几乎所有已知的字符。不过，Unicode 字符集并没有规定如何存储这些字符（也就是如何使用二进制数据表示这些字符）。

然后，就有了 **UTF-8**（**8**-bit **U**nicode **T**ransformation **F**ormat）。类似的还有 UTF-16、 UTF-32。

UTF-8 使用 1 到 4 个字节为每个字符编码， UTF-16 使用 2 或 4 个字节为每个字符编码，UTF-32 固定位 4 个字节为每个字符编码。

UTF-8 可以根据不同的符号自动选择编码的长短，像英文字符只需要 1 个字节就够了，这一点 ASCII 字符集一样 。因此，对于英语字符，UTF-8 编码和 ASCII 码是相同的。

UTF-32 的规则最简单，不过缺陷也比较明显，对于英文字母这类字符消耗的空间是 UTF-8 的 4 倍之多。

**UTF-8** 是目前使用最广的一种字符编码。

![](https://oss.javaguide.cn/javaguide/1280px-Utf8webgrowth.svg.png)

## MySQL 字符集

MySQL 支持很多种字符集的方式，比如 GB2312、GBK、BIG5、多种 Unicode 字符集（UTF-8 编码、UTF-16 编码、UCS-2 编码、UTF-32 编码等等）。

### 查看支持的字符集

你可以通过 `SHOW CHARSET` 命令来查看，支持 like 和 where 子句。

![](https://oss.javaguide.cn/javaguide/image-20211008164229671.png)

### 默认字符集

在 MySQL5.7 中，默认字符集是 `latin1` ；在 MySQL8.0 中，默认字符集是 `utf8mb4`

### 字符集的层次级别

MySQL 中的字符集有以下的层次级别：

- `server`（MySQL 实例级别）
- `database`（库级别）
- `table`（表级别）
- `column`（字段级别）

它们的优先级可以简单的认为是从上往下依次增大，也即 `column` 的优先级会大于 `table` 等其余层次的。如指定 MySQL 实例级别字符集是`utf8mb4`，指定某个表字符集是`latin1`，那么这个表的所有字段如果不指定的话，编码就是`latin1`。

#### server

不同版本的 MySQL 其 `server` 级别的字符集默认值不同，在 MySQL5.7 中，其默认值是 `latin1` ；在 MySQL8.0 中，其默认值是 `utf8mb4` 。

当然也可以通过在启动 `mysqld` 时指定 `--character-set-server` 来设置 `server` 级别的字符集。

```bash
mysqld
mysqld --character-set-server=utf8mb4
mysqld --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_0900_ai_ci
```

Or if you are starting MySQL from source, you can specify options in the `cmake` command:

```sh
cmake .-DDEFAULT_CHARSET=latin1
or
cmake . -DDEFAULT_CHARSET=latin1 \
  -DDEFAULT_COLLATION=latin1_german1_ci
```

In addition, you can also change the value of `character_set_server` at runtime to modify the `server` level character set.

The `server` level character set is a global setting of the MySQL server. It will not only serve as the default character set when creating or modifying the database (if no other character set is specified), but also affects the connection character set between the client and the server. For details, see [MySQL Connector/J 8.0 - 6.7 Using Character Sets and Unicode](https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-charsets.html).

#### database

The `database` level character set is specified when we create and modify the database:

```sql
CREATE DATABASE db_name
    [[DEFAULT] CHARACTER SET charset_name]
    [[DEFAULT] COLLATE collation_name]

ALTER DATABASE db_name
    [[DEFAULT] CHARACTER SET charset_name]
    [[DEFAULT] COLLATE collation_name]
```

As mentioned earlier, if no character set is specified when executing the above statement, MySQL will use the `server` level character set.

You can check the character set of a database in the following way:

```sql
USE db_name;
SELECT @@character_set_database, @@collation_database;
```

```sql
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'db_name';
```

#### table

The `table` level character set is specified when creating and modifying the table:

```sql
CREATE TABLE tbl_name (column_list)
    [[DEFAULT] CHARACTER SET charset_name]
    [COLLATE collation_name]]

ALTER TABLE tbl_name
    [[DEFAULT] CHARACTER SET charset_name]
    [COLLATE collation_name]
```

If no character set is specified when creating and modifying tables, the `database` level character set will be used.

#### column

The `column` level character set is also specified when creating and modifying the table, but it is defined in the column. Here is an example:

```sql
CREATE TABLE t1
(
    col1 VARCHAR(5)
      CHARACTER SET latin1
      COLLATE latin1_german1_ci
);
```

If a column-level character set is not specified, the table-level character set will be used.

### Connection character set

As mentioned earlier, the hierarchical levels of character sets are related to storage. The connection character set involves communication with the MySQL server.

The connection character set is closely related to the following variables:

- `character_set_client`: Describes the character set used by the SQL statement sent by the client to the server.
- `character_set_connection`: Describes what character set the server uses for translation when it receives a SQL statement.
- `character_set_results`: Describes what character set is used in the results returned by the server to the client.

Their values can be queried through the following SQL statement:

```sql
SELECT * FROM performance_schema.session_variables
WHERE VARIABLE_NAME IN (
'character_set_client', 'character_set_connection',
'character_set_results', 'collation_connection'
) ORDER BY VARIABLE_NAME;
```

```sql
SHOW SESSION VARIABLES LIKE 'character\_set\_%';
```

If you want to modify the values of the variables mentioned earlier, you have the following methods:

1. Modify the configuration file

```properties
[mysql]
# Only for MySQL client program
default-character-set=utf8mb4
```

2. Use SQL statements

```sql
set names utf8mb4
# Or modify them one by one
# SET character_set_client = utf8mb4;
# SET character_set_results = utf8mb4;
# SET collation_connection = utf8mb4;
```

### Impact of JDBC on connection character sets

I don’t know if you have ever encountered a situation where emoji expressions are stored normally, but when you use software like Navicat to query, you find that the emoji expressions turn into question marks. This problem is most likely caused by the JDBC driver.

According to the previous content, we know that the connection character set will also affect the data we store, and the JDBC driver will affect the connection character set.

`mysql-connector-java` (JDBC driver) mainly affects the connection character set through these properties:

- `characterEncoding`
- `characterSetResults`

Taking `DataGrip 2023.1.2` as an example, in its advanced dialog box for configuring data sources, you can see that the default value of `characterSetResults` is `utf8`. When using `mysql-connector-java 8.0.25`, the connection character set will finally be set to `utf8mb3`. In this case, the emoji expression will be displayed as a question mark, and the current version of the driver does not support setting `characterSetResults` to `utf8mb4`, but it is allowed to change to `mysql-connector-java driver 8.0.29`.

For details, please take a look at StackOverflow's answer [DataGrip MySQL stores emojis correctly but displays them as?](https://stackoverflow.com/questions/54815419/datagrip-mysql-stores-emojis-correctly-but-displays-them-as).

### UTF-8 usage

Normally, we recommend using UTF-8 as the default character encoding.

However, there is a small pit here.

There are two sets of UTF-8 encoding implementations in the MySQL character encoding set:

- **`utf8`**: `utf8` encoding only supports `1-3` bytes. In `utf8` encoding, Chinese characters occupy 3 bytes, and other numbers, English, and symbols occupy one byte. However, emoji symbols occupy 4 bytes, and some more complex text and traditional Chinese characters also occupy 4 bytes.
- **`utf8mb4`**: Complete implementation of UTF-8, genuine! Supports up to 4 bytes for character representation, so it can be used to store emoji symbols.

**Why are there two sets of UTF-8 encoding implementations? **The reasons are as follows:

![](https://oss.javaguide.cn/javaguide/image-20211008164542347.png)

Therefore, if you need to store `emoji` type data or some more complex text or traditional Chinese characters into the MySQL database, the database encoding must be specified as `utf8mb4` instead of `utf8`, otherwise an error will be reported when storing.

Demonstrate it! (Environment: MySQL 5.7+)

The table creation statement is as follows. We specify the database CHARSET as `utf8`.

```sql
CREATE TABLE `user` (
  `id` varchar(66) CHARACTER SET utf8mb3 NOT NULL,
  `name` varchar(33) CHARACTER SET utf8mb3 NOT NULL,
  `phone` varchar(33) CHARACTER SET utf8mb3 DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb3 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

When we execute the following insert statement to insert data into the database, an error is reported!

```sql
INSERT INTO `user` (`id`, `name`, `phone`, `password`)
VALUES
 ('A00003', 'guide brother😘😘😘', '181631312312', '123456');```

The error message is as follows:

```plain
Incorrect string value: '\xF0\x9F\x98\x98\xF0\x9F...' for column 'name' at row 1
```

## Reference

-Charset & Encoding: <https://www.cnblogs.com/skynet/archive/2011/05/03/2035105.html>
- Understand the character set and character encoding in ten minutes: <http://cenalulu.github.io/linux/character-encoding/>
- Unicode-Wikipedia: <https://zh.wikipedia.org/wiki/Unicode>
- GB2312-Wikipedia: <https://zh.wikipedia.org/wiki/GB_2312>
- UTF-8-Wikipedia: <https://zh.wikipedia.org/wiki/UTF-8>
- GB18030-Wikipedia: <https://zh.wikipedia.org/wiki/GB_18030>
- MySQL8 documentation: <https://dev.mysql.com/doc/refman/8.0/en/charset.html>
- MySQL5.7 documentation: <https://dev.mysql.com/doc/refman/5.7/en/charset.html>
- MySQL Connector/J documentation: <https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-charsets.html>

<!-- @include: @article-footer.snippet.md -->