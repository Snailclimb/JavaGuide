# DBeaver:开源数据库管理工具。

[《再见，Navicat！同事安利的这个IDEA的兄弟，真香！》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247489523&idx=1&sn=4e96972842bdcea2e05cb267d17c5e8e&chksm=cea25838f9d5d12e45a9939370eccf2bff7177038e70437ea0e01d64030118852ee66ae72284&token=2000865596&lang=zh_CN#rd)    这篇文章发了之后很多人抱怨Datagrip 的占用内存太大，很多人推荐了  DBeaver 这款开源免费的数据库管理工具。于是，我昨夜简单体验了一下 DBeaver ，然后写了这篇文章。

## DBeaver 概览

DBeaver 是一个基于 Java 开发 ，并且支持几乎所有的数据库产品的开源数据库管理工具。

DBeaver 社区版不光支持关系型数据库比如MySQL、PostgreSQL、MariaDB、SQLite、Oracle、Db2、SQL Server，还比如 SQLite、H2这些内嵌数据库。还支持常见的全文搜索引擎比如 Elasticsearch 和 Solr、大数据相关的工具比如Hive和 Spark。

![DBeaver 支持的数据库概览](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/%E6%9C%AA%E5%91%BD%E5%90%8D%E6%8B%BC%E5%9B%BE.jpg)

甚至说，DBeaver 的商业版本还支持各种 NoSQL  数据库。

![DBeaver 的商业版本还支持各种 NoSQL  数据库](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200803074546854.png)

## 使用

**DBeaver 虽然小巧，但是功能还是十分强大的。基本的表设计、SQL执行、ER图、数据导入导出等等常用功能都不在话下。**

**我下面只简单演示一下基本的数据库的创建以及表的创建。**

### 下载安装

官方网提供的下载地址：https://dbeaver.io/download/ ，你可以根据自己的操作系统选择合适的版本进行下载安装。

比较简单，这里就不演示了。

### 连接数据库

**1.选择自己想要的连接的数据库，然后点击下一步即可（第一次连接可能需要下载相关驱动）。**

我这里以MySQL为例。

![image-20200803082419586](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200803082419586.png)

**2.输入数据库的地址、用户名和密码等信息，然后点击完成即可连接**

点击完成之前，你可以先通过左下方的测试连接来看一下数据库是否可以被成功连接上。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200803082107033.png)

### 新建数据库

右键-> 新建数据库（MySQL 用户记得使用 utf8mb4而不是 utf8）

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812200954000.png)

### 数据库表相关操作

#### 新建表

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812201130467.png)

#### 新建列

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812203427352.png)

#### 创建约束（主键、唯一键）

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812202618448.png)

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812204054048.png)

#### 插入数据

我们通过 SQL 编辑器插入数据：

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-8/image-20200812205208540.png)

```java
INSERT into user(id,name,phone,password) values ('A00001','guide哥','181631312315','123456'); 
INSERT into user(id,name,phone,password) values ('A00002','guide哥2','181631312313','123456');
INSERT into user(id,name,phone,password) values ('A00003','guide哥3','181631312312','123456');
```

## 总结

总的来说，简单体验之后感觉还是很不错的，占用内存也确实比 DataGrip 确实要小很多。

各位小伙伴可以自行体验一下。毕竟免费并且开源，还是很香的！




