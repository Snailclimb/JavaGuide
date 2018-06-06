> ### 书籍推荐

**《高性能MySQL : 第3版》**

> ### 文字教程推荐

[MySQL 教程（菜鸟教程）](http://www.runoob.com/mysql/mysql-tutorial.html)

[MySQL教程（易百教程）](https://www.yiibai.com/mysql/)

> ### 视频教程推荐


**基础入门：** [与MySQL的零距离接触-慕课网](https://www.imooc.com/learn/122)

**Mysql开发技巧：** [MySQL开发技巧（一）](https://www.imooc.com/learn/398)　　[MySQL开发技巧（二）](https://www.imooc.com/learn/427)　　[MySQL开发技巧（三）](https://www.imooc.com/learn/449)

**Mysql5.7新特性及相关优化技巧：** [MySQL5.7版本新特性](https://www.imooc.com/learn/533)　　[性能优化之MySQL优化](https://www.imooc.com/learn/194)

[MySQL集群（PXC）入门](https://www.imooc.com/learn/993)　　[MyCAT入门及应用](https://www.imooc.com/learn/951)



> ### 常见问题总结

- **存储引擎**

  [MySQL常见的两种存储引擎：MyISAM与InnoDB的爱恨情仇](https://juejin.im/post/5b1685bef265da6e5c3c1c34)
  
- **字符集及校对规则**

   字符集指的是一种从二进制编码到某类字符符号的映射。校对规则则是指某种字符集下的排序规则。Mysql中每一种字符集都会对应一系列的校对规则。

   Mysql采用的是类似继承的方式指定字符集的默认值，每个数据库以及每张数据表都有自己的默认值，他们逐层继承。比如：某个库中所有表的默认字符集将是该数据库所指定的字符集（这些表在没有指定字符集的情况下，才会采用默认字符集） PS：整理自《Java工程师修炼之道》
   
   详细内容可以参考：   [MySQL字符集及校对规则的理解](https://www.cnblogs.com/geaozhang/p/6724393.html#mysqlyuzifuji)

 - **索引相关的内容（数据库使用中非常关键的技术，合理正确的使用索引可以大大提高数据库的查询性能）**
    
   　Mysql索引使用的数据结构主要有BTree索引和哈希索引。对于哈希索引来说，底层的数据结构就是哈希表，因此在绝大多数需求为单条记录查询的时候，可以选择哈希索引，查询性能最快；其余大部分场景，建议选择BTree索引。
   
   　Mysql的BTree索引使用的是B数中的B+Tree，但对于主要的两种存储引擎的实现方式是不同的。

   　**MyISAM:** B+Tree叶节点的data域存放的是数据记录的地址。在索引检索的时候，首先按照B+Tree搜索算法搜索索引，如果指定的Key存在，则取出其data域的值，然后以data域的值为地址读取相应的数据记录。这被称为“非聚簇索引”。
   
   　**InnoDB:** 其数据文件本身就是索引文件。相比MyISAM，索引文件和数据文件是分离的，其表数据文件本身就是按B+Tree组织的一个索引结构，树的叶节点data域保存了完整的数据记录。这个索引的key是数据表的主键，因此InnoDB表数据文件本身就是主索引。这被称为“聚簇索引（或聚集索引）”。而其余的索引都作为辅助索引，辅助索引的data域存储相应记录主键的值而不是地址，这也是和MyISAM不同的地方。**在根据主索引搜索时，直接找到key所在的节点即可取出数据；在根据辅助索引查找时，则需要先取出主键的值，在走一遍主索引。** **因此，在设计表的时候，不建议使用过长的字段作为主键，也不建议使用非单调的字段作为主键，这样会造成主索引频繁分裂。**
   
    详细内容可以参考：   [干货：mysql索引的数据结构](https://www.jianshu.com/p/1775b4ff123a)
   
 
  


