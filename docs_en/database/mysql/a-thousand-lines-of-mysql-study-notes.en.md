---
title: One Thousand Lines of MySQL Study Notes
category: database
tag:
  -MySQL
head:
  - - meta
    - name: keywords
      content: MySQL notes, tuning, indexing, transactions, tools, experience summary, practice
  - - meta
    - name: description
      content: Organizes thousands of lines of notes on MySQL learning and practice, condensing tuning ideas, indexing and transaction key points, and tool usage for quick reference and review.
---

> Original address: <https://shockerli.net/post/1000-line-mysql-note/>, JavaGuide has simplified the layout of this article and added a new table of contents.

A very good summary, I strongly recommend saving it and reading it when needed.

### Basic operations

```sql
/* Windows service */
-- Start MySQL
			net start mysql
-- Create a Windows service
				sc create mysql binPath= mysqld_bin_path (note: there is a space between the equal sign and the value)
/* Connect and disconnect from server */
-- Connect to MySQL
				mysql -h address -P port -u username -p password
-- Show which threads are running
				SHOW PROCESSLIST
-- Display system variable information
				SHOW VARIABLES
```

### Database operations

```sql
/* Database operations */
-- View the current database
    SELECT DATABASE();
-- Display the current time, user name, and database version
    SELECT now(), user(), version();
--Create library
    CREATE DATABASE[IF NOT EXISTS] database name database options
    Database options:
        CHARACTER SET charset_name
        COLLATE collation_name
-- View existing libraries
    SHOW DATABASES[ LIKE 'PATTERN']
-- View current library information
    SHOW CREATE DATABASE database name
-- Modify library option information
    ALTER DATABASE library name option information
-- Delete library
    DROP DATABASE[IF EXISTS] database name
        Delete the directory related to the database and its directory contents at the same time
```

### Table operations

```sql
/* Table operations */
--Create table
    CREATE [TEMPORARY] TABLE[ IF NOT EXISTS] [Library name.] Table name (structure definition of the table) [Table options]
        Each field must have a data type
        There cannot be a comma after the last field
        TEMPORARY temporary table, the table automatically disappears when the session ends
        For field definition:
            Field name Data type [NOT NULL | NULL] [DEFAULT default_value] [AUTO_INCREMENT] [UNIQUE [KEY] | [PRIMARY] KEY] [COMMENT 'string']
-- table options
    --Character set
        CHARSET = charset_name
        If the table is not set, the database character set is used
    -- storage engine
        ENGINE = engine_name
        Tables use different data structures when managing data. Different structures will lead to different processing methods and provided feature operations.
        Common engines: InnoDB MyISAM Memory/Heap BDB Merge Example CSV MaxDB Archive
        Different engines use different ways to save the structure and data of tables
        MyISAM table file meaning: .frm table definition, .MYD table data, .MYI table index
        InnoDB table file meaning: .frm table definition, table space data and log files
        SHOW ENGINES -- displays storage engine status information
        SHOW ENGINE engine name {LOGS|STATUS} -- displays the log or status information of the storage engine
    --increment starting number
    	AUTO_INCREMENT = number of rows
    --Data file directory
        DATA DIRECTORY = 'Directory'
    -- Index file directory
        INDEX DIRECTORY = 'Directory'
    -- table comments
        COMMENT = 'string'
    --Partition options
        PARTITION BY ... (see manual for details)
-- View all tables
    SHOW TABLES[ LIKE 'pattern']
    SHOW TABLES FROM library name
-- View table structure
    SHOW CREATE TABLE table name (more detailed information)
    DESC table name / DESCRIBE table name / EXPLAIN table name / SHOW COLUMNS FROM table name [LIKE 'PATTERN']
    SHOW TABLE STATUS [FROM db_name] [LIKE 'pattern']
--Modify table
    --Modify options for the table itself
        ALTER TABLE table name table options
        eg: ALTER TABLE table name ENGINE=MYISAM;
    -- Rename the table
        RENAME TABLE original table name TO new table name
        RENAME TABLE original table name TO database name.table name (the table can be moved to another database)
        -- RENAME can exchange two table names
    -- Modify the field structure of the table (13.1.2. ALTER TABLE syntax)
        ALTER TABLE table name operation name
        -- operation name
            ADD[COLUMN] field definition -- add field
                AFTER field name -- means adding after the field name
                FIRST -- means adding in the first
            ADD PRIMARY KEY (field name) -- Create a primary key
            ADD UNIQUE [index name] (field name)--Create a unique index
            ADD INDEX [index name] (field name) -- Create a normal index
            DROP[COLUMN] field name -- delete field
            MODIFY[COLUMN] Field name Field attribute -- Supports modification of field attributes, field name cannot be modified (all original attributes must also be written)
            CHANGE[COLUMN] Original field name New field name Field attributes -- Supports modification of field names
            DROP PRIMARY KEY -- Delete the primary key (you need to delete its AUTO_INCREMENT attribute before deleting the primary key)
            DROP INDEX index name -- delete index
            DROP FOREIGN KEY foreign key -- delete foreign key
-- Delete table
    DROP TABLE[IF EXISTS] table name ...
--Clear table data
    TRUNCATE [TABLE] table name
--Copy table structure
    CREATE TABLE table name LIKE table name to copy
--Copy table structure and data
    CREATE TABLE table name [AS] SELECT * FROM table name to be copied
-- Check the table for errors
    CHECK TABLE tbl_name [, tbl_name] ... [option] ...
-- Optimize table
    OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
-- Repair table
    REPAIR [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ... [QUICK] [EXTENDED] [USE_FRM]
-- analysis table
    ANALYZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```

### Data operations

```sql
/* Data operations */ ------------------
-- increase
    INSERT [INTO] table name [(field list)] VALUES (value list)[, (value list), ...]
        -- The field list can be omitted if the list of values to be inserted contains all fields and is in consistent order.
        -- Multiple data records can be inserted at the same time!
        REPLACE is similar to INSERT, the only difference is that for matching rows, the data of the existing row (compared with the primary key/unique key) is replaced, and if there is no existing row, a new row is inserted.
    INSERT [INTO] table name SET field name=value[, field name=value, ...]
-- Check
    SELECT field list FROM table name [other clauses]
        -- Multiple fields that can come from multiple tables
        --Other clauses may not be used
        -- The field list can be replaced by * to indicate all fields
-- Delete
    DELETE FROM table name [delete condition clause]
        Without a conditional clause, all will be deleted
-- change
    UPDATE table name SET field name=new value[, field name=new value] [update condition]```

### 字符集编码

```sql
/* 字符集编码 */ ------------------
-- MySQL、数据库、表、字段均可设置编码
-- 数据编码与客户端编码不需一致
SHOW VARIABLES LIKE 'character_set_%'   -- 查看所有字符集编码项
    character_set_client        客户端向服务器发送数据时使用的编码
    character_set_results       服务器端将结果返回给客户端所使用的编码
    character_set_connection    连接层编码
SET 变量名 = 变量值
    SET character_set_client = gbk;
    SET character_set_results = gbk;
    SET character_set_connection = gbk;
SET NAMES GBK;  -- 相当于完成以上三个设置
-- 校对集
    校对集用以排序
    SHOW CHARACTER SET [LIKE 'pattern']/SHOW CHARSET [LIKE 'pattern']   查看所有字符集
    SHOW COLLATION [LIKE 'pattern']     查看所有校对集
    CHARSET 字符集编码     设置字符集编码
    COLLATE 校对集编码     设置校对集编码
```

### 数据类型(列类型)

```sql
/* 数据类型（列类型） */ ------------------
1. 数值类型
-- a. 整型 ----------
    类型         字节     范围（有符号位）
    tinyint     1字节    -128 ~ 127      无符号位：0 ~ 255
    smallint    2字节    -32768 ~ 32767
    mediumint   3字节    -8388608 ~ 8388607
    int         4字节
    bigint      8字节
    int(M)  M表示总位数
    - 默认存在符号位，unsigned 属性修改
    - 显示宽度，如果某个数不够定义字段时设置的位数，则前面以0补填，zerofill 属性修改
        例：int(5)   插入一个数'123'，补填后为'00123'
    - 在满足要求的情况下，越小越好。
    - 1表示bool值真，0表示bool值假。MySQL没有布尔类型，通过整型0和1表示。常用tinyint(1)表示布尔型。
-- b. 浮点型 ----------
    类型             字节     范围
    float(单精度)     4字节
    double(双精度)    8字节
    浮点型既支持符号位 unsigned 属性，也支持显示宽度 zerofill 属性。
        不同于整型，前后均会补填0.
    定义浮点型时，需指定总位数和小数位数。
        float(M, D)     double(M, D)
        M表示总位数，D表示小数位数。
        M和D的大小会决定浮点数的范围。不同于整型的固定范围。
        M既表示总位数（不包括小数点和正负号），也表示显示宽度（所有显示符号均包括）。
        支持科学计数法表示。
        浮点数表示近似值。
-- c. 定点数 ----------
    decimal -- 可变长度
    decimal(M, D)   M也表示总位数，D表示小数位数。
    保存一个精确的数值，不会发生数据的改变，不同于浮点数的四舍五入。
    将浮点数转换为字符串来保存，每9位数字保存为4个字节。
2. 字符串类型
-- a. char, varchar ----------
    char    定长字符串，速度快，但浪费空间
    varchar 变长字符串，速度慢，但节省空间
    M表示能存储的最大长度，此长度是字符数，非字节数。
    不同的编码，所占用的空间不同。
    char,最多255个字符，与编码无关。
    varchar,最多65535字符，与编码有关。
    一条有效记录最大不能超过65535个字节。
        utf8 最大为21844个字符，gbk 最大为32766个字符，latin1 最大为65532个字符
    varchar 是变长的，需要利用存储空间保存 varchar 的长度，如果数据小于255个字节，则采用一个字节来保存长度，反之需要两个字节来保存。
    varchar 的最大有效长度由最大行大小和使用的字符集确定。
    最大有效长度是65532字节，因为在varchar存字符串时，第一个字节是空的，不存在任何数据，然后还需两个字节来存放字符串的长度，所以有效长度是65535-1-2=65532字节。
    例：若一个表定义为 CREATE TABLE tb(c1 int, c2 char(30), c3 varchar(N)) charset=utf8; 问N的最大值是多少？ 答：(65535-1-2-4-30*3)/3
-- b. blob, text ----------
    blob 二进制字符串（字节字符串）
        tinyblob, blob, mediumblob, longblob
    text 非二进制字符串（字符字符串）
        tinytext, text, mediumtext, longtext
    text 在定义时，不需要定义长度，也不会计算总长度。
    text 类型在定义时，不可给default值
-- c. binary, varbinary ----------
    类似于char和varchar，用于保存二进制字符串，也就是保存字节字符串而非字符字符串。
    char, varchar, text 对应 binary, varbinary, blob.
3. 日期时间类型
    一般用整型保存时间戳，因为PHP可以很方便的将时间戳进行格式化。
    datetime    8字节    日期及时间     1000-01-01 00:00:00 到 9999-12-31 23:59:59
    date        3字节    日期         1000-01-01 到 9999-12-31
    timestamp   4字节    时间戳        19700101000000 到 2038-01-19 03:14:07
    time        3字节    时间         -838:59:59 到 838:59:59
    year        1字节    年份         1901 - 2155
datetime    YYYY-MM-DD hh:mm:ss
timestamp   YY-MM-DD hh:mm:ss
            YYYYMMDDhhmmss
            YYMMDDhhmmss
            YYYYMMDDhhmmss
            YYMMDDhhmmss
date        YYYY-MM-DD
            YY-MM-DD
            YYYYMMDD
            YYMMDD
            YYYYMMDD
            YYMMDD
time        hh:mm:ss
            hhmmss
            hhmmss
year        YYYY
            YY
            YYYY
            YY
4. 枚举和集合
-- 枚举(enum) ----------
enum(val1, val2, val3...)
    在已知的值中进行单选。最大数量为65535.
    枚举值在保存时，以2个字节的整型(smallint)保存。每个枚举值，按保存的位置顺序，从1开始逐一递增。
    表现为字符串类型，存储却是整型。
    NULL值的索引是NULL。
    空字符串错误值的索引值是0。
-- 集合（set） ----------
set(val1, val2, val3...)
    create table tab ( gender set('男', '女', '无') );
    insert into tab values ('男, 女');
    最多可以有64个不同的成员。以bigint存储，共8个字节。采取位运算的形式。
    当创建表时，SET成员值的尾部空格将自动被删除。
```

### 列属性(列约束)

```sql
/* 列属性（列约束） */ ------------------
1. PRIMARY 主键
    - 能唯一标识记录的字段，可以作为主键。
    - 一个表只能有一个主键。
    - 主键具有唯一性。
    - 声明字段时，用 primary key 标识。
        也可以在字段列表之后声明
            例：create table tab ( id int, stu varchar(10), primary key (id));
    - 主键字段的值不能为null。
    - 主键可以由多个字段共同组成。此时需要在字段列表后声明的方法。
        例：create table tab ( id int, stu varchar(10), age int, primary key (stu, age));
2. UNIQUE 唯一索引（唯一约束）
    使得某字段的值也不能重复。
3. NULL 约束
    null不是数据类型，是列的一个属性。
    表示当前列是否可以为null，表示什么都没有。
    null, 允许为空。默认。
    not null, 不允许为空。
    insert into tab values (null, 'val');
        -- 此时表示将第一个字段的值设为null, 取决于该字段是否允许为null
4. DEFAULT 默认值属性
    当前字段的默认值。
    insert into tab values (default, 'val');    -- 此时表示强制使用默认值。
    create table tab ( add_time timestamp default current_timestamp );
        -- 表示将当前时间的时间戳设为默认值。
        current_date, current_time
5. AUTO_INCREMENT 自动增长约束
    自动增长必须为索引（主键或unique）
    只能存在一个字段为自动增长。
    默认为1开始自动增长。可以通过表属性 auto_increment = x进行设置，或 alter table tbl auto_increment = x;
6. COMMENT 注释
    例：create table tab ( id int ) comment '注释内容';
7. FOREIGN KEY 外键约束
    用于限制主表与从表数据完整性。
    alter table t1 add constraint `t1_t2_fk` foreign key (t1_id) references t2(id);
        -- 将表t1的t1_id外键关联到表t2的id字段。
        -- 每个外键都有一个名字，可以通过 constraint 指定
    存在外键的表，称之为从表（子表），外键指向的表，称之为主表（父表）。
    作用：保持数据一致性，完整性，主要目的是控制存储在外键表（从表）中的数据。
    MySQL中，可以对InnoDB引擎使用外键约束：
    语法：
    foreign key (外键字段） references 主表名 (关联字段) [主表记录删除时的动作] [主表记录更新时的动作]
    此时需要检测一个从表的外键需要约束为主表的已存在的值。外键在没有关联的情况下，可以设置为null.前提是该外键列，没有not null。
    可以不指定主表记录更改或更新时的动作，那么此时主表的操作被拒绝。
    如果指定了 on update 或 on delete：在删除或更新时，有如下几个操作可以选择：
    1. cascade，级联操作。主表数据被更新（主键值更新），从表也被更新（外键值更新）。主表记录被删除，从表相关记录也被删除。
    2. set null，设置为null。主表数据被更新（主键值更新），从表的外键被设置为null。主表记录被删除，从表相关记录外键被设置成null。但注意，要求该外键列，没有not null属性约束。
    3. restrict，拒绝父表删除和更新。
    注意，外键只被InnoDB存储引擎所支持。其他引擎是不支持的。

```

### 建表规范

```sql
/* 建表规范 */ ------------------
    -- Normal Format, NF
        - 每个表保存一个实体信息
        - 每个具有一个ID字段作为主键
        - ID主键 + 原子表
    -- 1NF, 第一范式
        字段不能再分，就满足第一范式。
    -- 2NF, 第二范式
        满足第一范式的前提下，不能出现部分依赖。
        消除复合主键就可以避免部分依赖。增加单列关键字。
    -- 3NF, 第三范式
        满足第二范式的前提下，不能出现传递依赖。
        某个字段依赖于主键，而有其他字段依赖于该字段。这就是传递依赖。
        将一个实体信息的数据放在一个表内实现。
```

### SELECT

```sql
/* SELECT */ ------------------
SELECT [ALL|DISTINCT] select_expr FROM -> WHERE -> GROUP BY [合计函数] -> HAVING -> ORDER BY -> LIMIT
a. select_expr
    -- 可以用 * 表示所有字段。
        select * from tb;
    -- 可以使用表达式（计算公式、函数调用、字段也是个表达式）
        select stu, 29+25, now() from tb;
    -- 可以为每个列使用别名。适用于简化列标识，避免多个列标识符重复。
        - 使用 as 关键字，也可省略 as.
        select stu+10 as add10 from tb;
b. FROM 子句
    用于标识查询来源。
    -- 可以为表起别名。使用as关键字。
        SELECT * FROM tb1 AS tt, tb2 AS bb;
    -- from子句后，可以同时出现多个表。
        -- 多个表会横向叠加到一起，而数据会形成一个笛卡尔积。
        SELECT * FROM tb1, tb2;
    -- 向优化符提示如何选择索引
        USE INDEX、IGNORE INDEX、FORCE INDEX
        SELECT * FROM table1 USE INDEX (key1,key2) WHERE key1=1 AND key2=2 AND key3=3;
        SELECT * FROM table1 IGNORE INDEX (key3) WHERE key1=1 AND key2=2 AND key3=3;
c. WHERE 子句
    -- 从from获得的数据源中进行筛选。
    -- 整型1表示真，0表示假。
    -- 表达式由运算符和运算数组成。
        -- 运算数：变量（字段）、值、函数返回值
        -- 运算符：
            =, <=>, <>, !=, <=, <, >=, >, !, &&, ||,
            in (not) null, (not) like, (not) in, (not) between and, is (not), and, or, not, xor
            is/is not 加上true/false/unknown，检验某个值的真假
            <=>与<>功能相同，<=>可用于null比较
d. GROUP BY 子句, 分组子句
    GROUP BY 字段/别名 [排序方式]
    分组后会进行排序。升序：ASC，降序：DESC
    以下[合计函数]需配合 GROUP BY 使用：
    count 返回不同的非NULL值数目  count(*)、count(字段)
    sum 求和
    max 求最大值
    min 求最小值
    avg 求平均值
    group_concat 返回带有来自一个组的连接的非NULL值的字符串结果。组内字符串连接。
e. HAVING 子句，条件子句
    与 where 功能、用法相同，执行时机不同。
    where 在开始时执行检测数据，对原数据进行过滤。
    having 对筛选出的结果再次进行过滤。
    having 字段必须是查询出来的，where 字段必须是数据表存在的。
    where 不可以使用字段的别名，having 可以。因为执行WHERE代码时，可能尚未确定列值。
    where 不可以使用合计函数。一般需用合计函数才会用 having
    SQL标准要求HAVING必须引用GROUP BY子句中的列或用于合计函数中的列。
f. ORDER BY 子句，排序子句
    order by 排序字段/别名 排序方式 [,排序字段/别名 排序方式]...
    升序：ASC，降序：DESC
    支持多个字段的排序。
g. LIMIT 子句，限制结果数量子句
    仅对处理好的结果进行数量限制。将处理好的结果的看作是一个集合，按照记录出现的顺序，索引从0开始。
    limit 起始位置, 获取条数
    省略第一个参数，表示从索引0开始。limit 获取条数
h. DISTINCT, ALL 选项
    distinct 去除重复记录
    默认为 all, 全部记录
```

### UNION

```sql
/* UNION */ ------------------
      将多个select查询的结果组合成一个结果集合。
      SELECT ... UNION [ALL|DISTINCT] SELECT ...
      默认 DISTINCT 方式，即所有返回的行都是唯一的
      建议，对每个SELECT查询加上小括号包裹。
      ORDER BY 排序时，需加上 LIMIT 进行结合。
      需要各select查询的字段数量一样。
      每个select查询的字段列表(数量、类型)应一致，因为结果中的字段名以第一条select语句为准。
```

### 子查询

```sql
/* 子查询 */ ------------------
    - 子查询需用括号包裹。
-- from型
    from后要求是一个表，必须给子查询结果取个别名。
    - 简化每个查询内的条件。
    - from型需将结果生成一个临时表格，可用以原表的锁定的释放。
    - 子查询返回一个表，表型子查询。
    select * from (select * from tb where id>0) as subfrom where id>1;
-- where型
    - 子查询返回一个值，标量子查询。
    - 不需要给子查询取别名。
    - where子查询内的表，不能直接用以更新。
    select * from tb where money = (select max(money) from tb);
    -- 列子查询
        如果子查询结果返回的是一列。
        使用 in 或 not in 完成查询
        exists 和 not exists 条件
            如果子查询返回数据，则返回1或0。常用于判断条件。
            select column1 from t1 where exists (select * from t2);
    -- 行子查询
        查询条件是一个行。
        select * from t1 where (id, gender) in (select id, gender from t2);
        行构造符：(col1, col2, ...) 或 ROW(col1, col2, ...)
        行构造符通常用于与对能返回两个或两个以上列的子查询进行比较。
    -- 特殊运算符
    != all()    相当于 not in
    = some()    相当于 in。any 是 some 的别名
    != some()   不等同于 not in，不等于其中某一个。
    all, some 可以配合其他运算符一起使用。
```

### 连接查询(join)

```sql
/* 连接查询(join) */ ------------------
    将多个表的字段进行连接，可以指定连接条件。
-- 内连接(inner join)
    - 默认就是内连接，可省略inner。
    - 只有数据存在时才能发送连接。即连接结果不能出现空行。
    on 表示连接条件。其条件表达式与where类似。也可以省略条件（表示条件永远为真）
    也可用where表示连接条件。
    还有 using, 但需字段名相同。 using(字段名)
    -- 交叉连接 cross join
        即，没有条件的内连接。
        select * from tb1 cross join tb2;
-- 外连接(outer join)
    - 如果数据不存在，也会出现在连接结果中。
    -- 左外连接 left join
        如果数据不存在，左表记录会出现，而右表为null填充
    -- 右外连接 right join
        如果数据不存在，右表记录会出现，而左表为null填充
-- 自然连接(natural join)
    自动判断连接条件完成连接。
    相当于省略了using，会自动查找相同字段名。
    natural join
    natural left join
    natural right join
select info.id, info.name, info.stu_num, extra_info.hobby, extra_info.sex from info, extra_info where info.stu_num = extra_info.stu_id;
```

### TRUNCATE

```sql
/* TRUNCATE */ ------------------
TRUNCATE [TABLE] tbl_name
清空数据
删除重建表
区别：
1，truncate 是删除表再创建，delete 是逐条删除
2，truncate 重置auto_increment的值。而delete不会
3，truncate 不知道删除了几条，而delete知道。
4，当被用于带分区的表时，truncate 会保留分区
```

### 备份与还原

```sql
/* 备份与还原 */ ------------------
备份，将数据的结构与表内数据保存起来。
利用 mysqldump 指令完成。
-- 导出
mysqldump [options] db_name [tables]
mysqldump [options] ---database DB1 [DB2 DB3...]
mysqldump [options] --all--database
1. 导出一张表
　　mysqldump -u用户名 -p密码 库名 表名 > 文件名(D:/a.sql)
2. 导出多张表
　　mysqldump -u用户名 -p密码 库名 表1 表2 表3 > 文件名(D:/a.sql)
3. 导出所有表
　　mysqldump -u用户名 -p密码 库名 > 文件名(D:/a.sql)
4. 导出一个库
　　mysqldump -u用户名 -p密码 --lock-all-tables --database 库名 > 文件名(D:/a.sql)
可以-w携带WHERE条件
-- 导入
1. 在登录mysql的情况下：
　　source  备份文件
2. 在不登录的情况下
　　mysql -u用户名 -p密码 库名 < 备份文件
```

### 视图

```sql
什么是视图：
    视图是一个虚拟表，其内容由查询定义。同真实的表一样，视图包含一系列带有名称的列和行数据。但是，视图并不在数据库中以存储的数据值集形式存在。行和列数据来自由定义视图的查询所引用的表，并且在引用视图时动态生成。
    视图具有表结构文件，但不存在数据文件。
    对其中所引用的基础表来说，视图的作用类似于筛选。定义视图的筛选可以来自当前或其它数据库的一个或多个表，或者其它视图。通过视图进行查询没有任何限制，通过它们进行数据修改时的限制也很少。
    视图是存储在数据库中的查询的sql语句，它主要出于两种原因：安全原因，视图可以隐藏一些数据，如：社会保险基金表，可以用视图只显示姓名，地址，而不显示社会保险号和工资数等，另一原因是可使复杂的查询易于理解和使用。
-- 创建视图
CREATE [OR REPLACE] [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}] VIEW view_name [(column_list)] AS select_statement
    - 视图名必须唯一，同时不能与表重名。
    - 视图可以使用select语句查询到的列名，也可以自己指定相应的列名。
    - 可以指定视图执行的算法，通过ALGORITHM指定。
    - column_list如果存在，则数目必须等于SELECT语句检索的列数
-- 查看结构
    SHOW CREATE VIEW view_name
-- 删除视图
    - 删除视图后，数据依然存在。
    - 可同时删除多个视图。
    DROP VIEW [IF EXISTS] view_name ...
-- 修改视图结构
    - 一般不修改视图，因为不是所有的更新视图都会映射到表上。
    ALTER VIEW view_name [(column_list)] AS select_statement
-- 视图作用
    1. 简化业务逻辑
    2. 对客户端隐藏真实的表结构
-- 视图算法(ALGORITHM)
    MERGE       合并
        将视图的查询语句，与外部查询需要先合并再执行！
    TEMPTABLE   临时表
        将视图执行完毕后，形成临时表，再做外层查询！
    UNDEFINED   未定义(默认)，指的是MySQL自主去选择相应的算法。
```

### 事务(transaction)

```sql
事务是指逻辑上的一组操作，组成这组操作的各个单元，要不全成功要不全失败。
    - 支持连续SQL的集体成功或集体撤销。
    - 事务是数据库在数据完整性方面的一个功能。
    - 需要利用 InnoDB 或 BDB 存储引擎，对自动提交的特性支持完成。
    - InnoDB被称为事务安全型引擎。
-- 事务开启
    START TRANSACTION; 或者 BEGIN;
    开启事务后，所有被执行的SQL语句均被认作当前事务内的SQL语句。
-- 事务提交
    COMMIT;
-- 事务回滚
    ROLLBACK;
    如果部分操作发生问题，映射到事务开启前。
-- 事务的特性
    1. 原子性（Atomicity）
        事务是一个不可分割的工作单位，事务中的操作要么都发生，要么都不发生。
    2. 一致性（Consistency）
        事务前后数据的完整性必须保持一致。
        - 事务开始和结束时，外部数据一致
        - 在整个事务过程中，操作是连续的
    3. 隔离性（Isolation）
        多个用户并发访问数据库时，一个用户的事务不能被其它用户的事务所干扰，多个并发事务之间的数据要相互隔离。
    4. 持久性（Durability）
        一个事务一旦被提交，它对数据库中的数据改变就是永久性的。
-- 事务的实现
    1. 要求是事务支持的表类型
    2. 执行一组相关的操作前开启事务
    3. 整组操作完成后，都成功，则提交；如果存在失败，选择回滚，则会回到事务开始的备份点。
-- 事务的原理
    利用InnoDB的自动提交(autocommit)特性完成。
    普通的MySQL执行语句后，当前的数据提交操作均可被其他客户端可见。
    而事务是暂时关闭“自动提交”机制，需要commit提交持久化数据操作。
-- 注意
    1. 数据定义语言（DDL）语句不能被回滚，比如创建或取消数据库的语句，和创建、取消或更改表或存储的子程序的语句。
    2. 事务不能被嵌套
-- 保存点
    SAVEPOINT 保存点名称 -- 设置一个事务保存点
    ROLLBACK TO SAVEPOINT 保存点名称 -- 回滚到保存点
    RELEASE SAVEPOINT 保存点名称 -- 删除保存点
-- InnoDB自动提交特性设置
    SET autocommit = 0|1;   0表示关闭自动提交，1表示开启自动提交。
    - 如果关闭了，那普通操作的结果对其他客户端也不可见，需要commit提交后才能持久化数据操作。
    - 也可以关闭自动提交来开启事务。但与START TRANSACTION不同的是，
        SET autocommit是永久改变服务器的设置，直到下次再次修改该设置。(针对当前连接)
        而START TRANSACTION记录开启前的状态，而一旦事务提交或回滚后就需要再次开启事务。(针对当前事务)

```

### 锁表

```sql
/* 锁表 */
表锁定只用于防止其它客户端进行不正当地读取和写入
MyISAM 支持表锁，InnoDB 支持行锁
-- 锁定
    LOCK TABLES tbl_name [AS alias]
-- 解锁
    UNLOCK TABLES
```

### 触发器

```sql
/* 触发器 */ ------------------
    触发程序是与表有关的命名数据库对象，当该表出现特定事件时，将激活该对象
    监听：记录的增加、修改、删除。
-- 创建触发器
CREATE TRIGGER trigger_name trigger_time trigger_event ON tbl_name FOR EACH ROW trigger_stmt
    参数：
    trigger_time是触发程序的动作时间。它可以是 before 或 after，以指明触发程序是在激活它的语句之前或之后触发。
    trigger_event指明了激活触发程序的语句的类型
        INSERT：将新行插入表时激活触发程序
        UPDATE：更改某一行时激活触发程序
        DELETE：从表中删除某一行时激活触发程序
    tbl_name：监听的表，必须是永久性的表，不能将触发程序与TEMPORARY表或视图关联起来。
    trigger_stmt：当触发程序激活时执行的语句。执行多个语句，可使用BEGIN...END复合语句结构
-- 删除
DROP TRIGGER [schema_name.]trigger_name
可以使用old和new代替旧的和新的数据
    更新操作，更新前是old，更新后是new.
    删除操作，只有old.
    增加操作，只有new.
-- 注意
    1. 对于具有相同触发程序动作时间和事件的给定表，不能有两个触发程序。
-- 字符连接函数
concat(str1,str2,...])
concat_ws(separator,str1,str2,...)
-- 分支语句
if 条件 then
    执行语句
elseif 条件 then
    执行语句
else
    执行语句
end if;
-- 修改最外层语句结束符
delimiter 自定义结束符号
    SQL语句
自定义结束符号
delimiter ;     -- 修改回原来的分号
-- 语句块包裹
begin
    语句块
end
-- 特殊的执行
1. 只要添加记录，就会触发程序。
2. Insert into on duplicate key update 语法会触发：
    如果没有重复记录，会触发 before insert, after insert;
    如果有重复记录并更新，会触发 before insert, before update, after update;
    如果有重复记录但是没有发生更新，则触发 before insert, before update
3. Replace 语法 如果有记录，则执行 before insert, before delete, after delete, after insert
```

### SQL Programming

```sql
/* SQL programming */ ------------------
--//Local variables ----------
-- variable declaration
    declare var_name[,...] type [default value]
    This statement is used to declare local variables. To provide a default value for a variable, include a default clause. The value can be specified as an expression and does not need to be a constant. If there is no default clause, the initial value is null.
-- assignment
    Use set and select into statements to assign values to variables.
    - Note: Global variables (user-defined variables) can be used within functions
--//Global variables ----------
-- Definition, assignment
The set statement can define and assign values to variables.
set @var = value;
You can also use the select into statement to initialize and assign values to variables. This requires that the select statement can only return one row, but it can be multiple fields, which means that multiple variables are assigned values ​​at the same time. The number of variables needs to be consistent with the number of columns in the query.
You can also think of the assignment statement as an expression, which is executed through select. At this time, in order to avoid = being treated as a relational operator, use := instead. (The set statement can use = and :=).
select @var:=20;
select @v1:=id, @v2=name from t1 limit 1;
select * from tbl_name where @var:=30;
Select into can assign the data obtained from the query in the table to a variable.
    -| select max(height) into @max_height from tb;
-- Custom variable name
In order to avoid conflicts between user-defined variables and system identifiers (usually field names) in select statements, user-defined variables use @ as the starting symbol before the variable name.
@var=10;
    - Once a variable is defined, it is valid throughout the session (login to logout)
--//Control structure ----------
--if statement
if search_condition then
    statement_list
[elseif search_condition then
    statement_list]
...
[else
    statement_list]
end if;
--case statement
CASE value WHEN [compare-value] THEN result
[WHEN [compare-value] THEN result ...]
[ELSE result]
END
-- while loop
[begin_label:] while search_condition do
    statement_list
end while [end_label];
- If you need to terminate the while loop early within the loop, you need to use labels; labels need to appear in pairs.
    --Exit the loop
        Exit the entire loop leave
        Exit the current loop iterate
        Determine which loop to exit through the exit label
--//Built-in function ----------
-- Numerical functions
abs(x) -- absolute value abs(-10.9) = 10
format(x, d) -- format the thousandth value format(1234567.456, 2) = 1,234,567.46
ceil(x) -- round up ceil(10.1) = 11
floor(x) -- round down floor (10.1) = 10
round(x) -- round to integer
mod(m, n) -- m%n m mod n Find remainder 10%3=1
pi() -- get pi
pow(m, n) -- m^n
sqrt(x) -- arithmetic square root
rand() -- random number
truncate(x, d) -- truncate to d decimal places
-- Time and date function
now(), current_timestamp(); -- current date and time
current_date(); -- current date
current_time(); -- current time
date('yyyy-mm-dd hh:ii:ss'); -- Get the date part
time('yyyy-mm-dd hh:ii:ss'); -- Get the time part
date_format('yyyy-mm-dd hh:ii:ss', '%d %y %a %d %m %b %j'); -- formatting time
unix_timestamp(); -- Get unix timestamp
from_unixtime(); -- Get time from timestamp
-- String functions
length(string) – string length, bytes
char_length(string) – the number of characters in string
substring(str, position [,length]) -- Starting from the position of str, take length characters
replace(str,search_str,replace_str) -- replace search_str with replace_str in str
instr(string,substring) -- returns the position where substring first appears in string
concat(string [,...]) -- Concatenate strings
charset(str) -- Returns the string character set
lcase(string) -- Convert to lowercase
left(string, length) -- Take length characters from the left in string2
load_file(file_name) -- read content from file
locate(substring, string [,start_position]) -- same as instr, but can specify the starting position
lpad(string, length, pad) -- Repeat adding pad to the beginning of string until the length of the string is length
ltrim(string) -- remove leading spaces
repeat(string, count) -- repeat count times
rpad(string, length, pad) --Add pad after str until the length is length
rtrim(string) -- remove trailing spaces
strcmp(string1,string2) -- compare the size of two strings character by character
-- Process function
case when [condition] then result [when [condition] then result ...] [else result] end multi-branch
if(expr1,expr2,expr3) double branch.
-- Aggregation function
count()
sum();
max();
min();
avg();
group_concat()
--Other commonly used functions
md5();
default();
--//Storage function, custom function ----------
-- New
    CREATE FUNCTION function_name (parameter list) RETURNS return value type
        function body
    - The function name should be a legal identifier and should not conflict with existing keywords.
    - A function should belong to a certain database. You can use the form of db_name.function_name to execute the database to which the current function belongs, otherwise it is the current database.
    - The parameter part consists of "parameter name" and "parameter type". Multiple parameters are separated by commas.
    - The function body consists of multiple available mysql statements, process control, variable declaration and other statements.
    - Multiple statements should be enclosed using begin...end statement blocks.
    - There must be a return return value statement.
-- Delete
    DROP FUNCTION [IF EXISTS] function_name;
-- View
    SHOW FUNCTION STATUS LIKE 'partten'
    SHOW CREATE FUNCTION function_name;
-- Modify
    ALTER FUNCTION function_name function option
--// Stored procedure, custom function ----------
-- Definition
Stored stored procedure is a piece of code (procedure) consisting of SQL stored in the database.
A stored procedure is usually used to complete a piece of business logic, such as registration, shift payment, order warehousing, etc.
A function usually focuses on a certain function and is regarded as a service for other programs. It needs to call the function in other statements. However, a stored procedure cannot be called by other people and is executed by itself through call.
-- create
CREATE PROCEDURE sp_name (parameter list)
    process body
Parameter list: Different from the parameter list of a function, the parameter type needs to be specified
IN, indicating input type
OUT, indicating output type
INOUT, indicating mixed type
Note that there is no return value.
```

### Stored procedure

```sql
/* Stored procedure */ ------------------
A stored procedure is a collection of executable code. It prefers business logic to functions.
Call: CALL procedure name
-- Note
- No return value.
- Can only be called alone and cannot be mixed with other statements
-- Parameters
IN|OUT|INOUT parameter name data type
IN input: During the calling process, data is input into the parameters inside the procedure body.
OUT output: During the calling process, the result of processing the process body is returned to the client.
INOUT input and output: both input and output
-- Grammar
CREATE PROCEDURE procedure name (parameter list)
BEGIN
    process body
END```

### User and permission management

```sql
/* User and permission management */ ------------------
-- root password reset
1. Stop the MySQL service
2. [Linux] /usr/local/mysql/bin/safe_mysqld --skip-grant-tables &
    [Windows] mysqld --skip-grant-tables
3. use mysql;
4. UPDATE `user` SET PASSWORD=PASSWORD("password") WHERE `user` = "root";
5. FLUSH PRIVILEGES;
User information table: mysql.user
-- Refresh permissions
FLUSH PRIVILEGES;
-- Add user
CREATE USER username IDENTIFIED BY [PASSWORD] password (string)
    - Must have the global CREATE USER permission of the mysql database, or have the INSERT permission.
    - Users can only be created, but permissions cannot be granted.
    - User name, pay attention to the quotation marks: such as 'user_name'@'192.168.1.1'
    - Passwords also need quotation marks, and pure numeric passwords also need quotation marks.
    - To specify a password in plain text, ignore the PASSWORD keyword. To specify a password as the hashed value returned by the PASSWORD() function, include the keyword PASSWORD
-- Rename user
RENAME USER old_user TO new_user
-- Set password
SET PASSWORD = PASSWORD('password') -- Set a password for the current user
SET PASSWORD FOR username = PASSWORD('password') -- Set a password for the specified user
-- Delete user
DROP USER username
-- Assign permissions/Add users
GRANT permission list ON table name TO user name [IDENTIFIED BY [PASSWORD] 'password']
    - all privileges means all permissions
    - *.* represents all tables in all libraries
    - Library name.Table name indicates a table under a certain library
    GRANT ALL PRIVILEGES ON `pms`.* TO 'pms'@'%' IDENTIFIED BY 'pms0817';
-- View permissions
SHOW GRANTS FOR username
    -- View current user permissions
    SHOW GRANTS; or SHOW GRANTS FOR CURRENT_USER; or SHOW GRANTS FOR CURRENT_USER();
-- revoke permission
REVOKE permission list ON table name FROM user name
REVOKE ALL PRIVILEGES, GRANT OPTION FROM username -- revoke all privileges
--Permission level
-- To use GRANT or REVOKE, you must have the GRANT OPTION permission, and you must be using the permission you are granting or revoking.
Global level: Global permissions apply to all databases in a given server, mysql.user
    GRANT ALL ON *.* and REVOKE ALL ON *.* only grant and revoke global permissions.
Database level: Database permissions apply to all targets in a given database, mysql.db, mysql.host
    GRANT ALL ON db_name.* and REVOKE ALL ON db_name.* only grant and revoke database permissions.
Table level: Table permissions apply to all columns in a given table, mysql.talbes_priv
    GRANT ALL ON db_name.tbl_name and REVOKE ALL ON db_name.tbl_name only grant and revoke table permissions.
Column level: Column permissions apply to a single column in a given table, mysql.columns_priv
    When using REVOKE, you must specify the same columns as the authorized columns.
-- Permission list
ALL [PRIVILEGES] -- Set all simple permissions except GRANT OPTION
ALTER -- enable ALTER TABLE
ALTER ROUTINE -- alter or cancel a stored subroutine
CREATE -- enables the use of CREATE TABLE
CREATE ROUTINE -- Create a stored subroutine
CREATE TEMPORARY TABLES -- enables the use of CREATE TEMPORARY TABLE
CREATE USER -- Allows CREATE USER, DROP USER, RENAME USER and REVOKE ALL PRIVILEGES.
CREATE VIEW -- enables the use of CREATE VIEW
DELETE -- allows DELETE to be used
DROP -- enables the use of DROP TABLE
EXECUTE -- allows the user to run a stored subroutine
FILE -- allows SELECT...INTO OUTFILE and LOAD DATA INFILE
INDEX -- allows CREATE INDEX and DROP INDEX
INSERT -- Allow the use of INSERT
LOCK TABLES -- Allows LOCK TABLES on tables for which you have SELECT permissions
PROCESS -- Allows use of SHOW FULL PROCESSLIST
REFERENCES -- not implemented
RELOAD -- Allow the use of FLUSH
REPLICATION CLIENT -- allows the user to ask for the address of a slave or master server
REPLICATION SLAVE -- for replication slave servers (read binary log events from the master server)
SELECT -- Allow the use of SELECT
SHOW DATABASES -- show all databases
SHOW VIEW -- enables the use of SHOW CREATE VIEW
SHUTDOWN -- Allow mysqladmin shutdown
SUPER -- Allows the use of CHANGE MASTER, KILL, PURGE MASTER LOGS and SET GLOBAL statements, the mysqladmin debug command; allows you to connect (once) even if max_connections have been reached.
UPDATE -- Allow UPDATE
USAGE -- synonym for "no permissions"
GRANT OPTION -- Allow permission to be granted
```

### Table maintenance

```sql
/* Table maintenance */
--Analyze and store keyword distribution of tables
ANALYZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE table name ...
-- Check one or more tables for errors
CHECK TABLE tbl_name [, tbl_name] ... [option] ...
option = {QUICK | FAST | MEDIUM | EXTENDED | CHANGED}
-- Defragment data files
OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```

### Miscellaneous

```sql
/* Miscellaneous */ ------------------
1. You can use backticks (`) to wrap identifiers (library names, table names, field names, indexes, aliases) to avoid duplication of keywords! Chinese can also be used as an identifier!
2. Each library directory contains an option file db.opt that saves the current database.
3. Notes:
    Single line comment #Comment content
    Multi-line comments /* Comment content */
    Single line comment -- comment content (standard SQL comment style, requiring a space after double dashes (space, TAB, newline, etc.))
4. Pattern wildcard:
    _ any single character
    % any number of characters, even zero characters
    Single quotes need to be escaped \'
5. The statement terminator in the CMD command line can be ";", "\G", "\g", which only affects the display results. Elsewhere, end with a semicolon. delimiter can modify the statement terminator of the current conversation.
6. SQL is not case sensitive
7. Clear existing statements: \c
```

<!-- @include: @article-footer.snippet.md -->