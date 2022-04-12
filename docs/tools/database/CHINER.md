# CHINER: 干掉 PowerDesigner，这个国产数据库建模工具很强！

大家好，我是 Guide！

今天给小伙伴们分享一个我平时经常使用的国产数据库建模工具，非常好用！

这个数据库建模工具的名字叫做 **CHINER** [kaɪˈnər] 。可能大部分小伙伴都没有听过这个工具，不过，相信大部分小伙伴应该都听说过 CHINER 的前身 **PDMan**。

CHINER 是 CHINESE Entity Relation 的缩写，翻译过来就是国产实体关系图工具，中文名称为：**元数建模**，也作:"**CHINER[元数建模]**"公开使用。

CHINER 对 PDMan 的架构设计进行了大幅改善，并对 PDMan 做到高度兼容。

CHINER 的界面简单，功能简洁，非常容易上手。并且，可以直接导入 PowerDesigner 文件、PDMan 文件，还可以直接从数据库或者 DDL 语句直接导入。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/javaguide/c877cb96e03e4de8920dd22a79d6fba1.png)

CHINER 的技术栈：React+Electron+Java 。

* Gitee 地址：https://gitee.com/robergroup/chiner 。
* 操作手册： https://www.yuque.com/chiner/docs/manual 。

## 快速体验

### 下载安装

CHINER 提供了 **Windows** 、**Mac** 、**Linux** 下的一键安装包，我们直接下载即可。

> 下载地址：https://gitee.com/robergroup/chiner/releases

需要注意的是：如果你当前使用的 Chrome 浏览器的话，无法直接点击链接下载。你可以更换浏览器下载或者右键链接选择链接存储为...。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/javaguide/de3f014d52254bc3b181bd601fada431.png)

打开软件之后，界面如下图所示。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/javaguide/image-20211016084319216.png)

我这里以电商项目参考模板来演示 CHINER 的基本操作。

### 模块化管理

电商项目比较复杂，我们可以将其拆分为一个一个独立的模块（表分组），每个模块下有数据表，视图，关系图，数据字典。

像这个电商项目就创建了 3 个模块：消费端、商家端、平台端。

![](https://img-blog.csdnimg.cn/c23a46c0a32442e38962c1ec63a59ecc.png)

不过，对于一些比较简单的项目比如博客系统、企业管理系统直接使用简单模式即可。

### 数据库表管理

右键数据表即可创建新的数据库表，点击指定的数据库表即可对指定的数据库表进行设计。

![](https://img-blog.csdnimg.cn/d106ad816e7f429b95a1050c8a8ee734.png)

并且，数据表字段可以直接关联数据字典。

![](https://img-blog.csdnimg.cn/7dc3085aeded4cac8da6d22ee596101a.png)

如果需要创建视图的话，直接右键视图即可。视图是从一个或多个表导出的虚拟的表，其内容由查询定义。具有普通表的结构，但是不实现数据存储。

![](https://img-blog.csdnimg.cn/6983993063e743ef93a0ad13f39edb4a.png)

数据库视图可以方便我们进行查询。不过，数据库视图会影响数据库性能，通常不建议使用。

### 关系图

我平时在项目中比较常见的 **ER 关联关系图** ，可以使用 CHINER 进行手动维护。

如果你需要添加新的数据库表到关系图的话，直接拖拽指定的数据库表到右边的关系图展示界面即可。另外，表与表之间的关联也需要你手动对相关联的字段进行连接。

![](https://img-blog.csdnimg.cn/7f7d0ae74e3f42068c9f084d1ff39af1.png)

手动进行维护，说实话还是比较麻烦的，也比较容易出错。

像 [Navicat Data Modeler](https://www.navicat.com.cn/products/navicat-data-modeler) 在这方面就强多了，它可以自动生成 ER 图。

![](https://img-blog.csdnimg.cn/08740807c2d746a3ab44d939b79d4d8f.png)

### 数据库表代码模板

支持直接生成对应表的 SQL 代码（支持 MySQL、Oracle、SQL Server、PostgreSQL 等数据库）并且还提供了 Java 和 C# 的 JavaBean。

![](https://img-blog.csdnimg.cn/ab758108b5e540f0bcff0a09f0513636.png)

### 导出数据库表

你可以选择导出 DDL、Word 文档、数据字典 SQL、当前关系图的图片。

![](https://img-blog.csdnimg.cn/1497089d38a7416db1fd6da7c01b41ea.png)

### 数据库逆向

你还可以连接数据库，逆向解析数据库。

![](https://img-blog.csdnimg.cn/e93ee1d31f0f4cf894e330eee1420b89.png)

数据库连接成功之后，我们点击右上角的菜单 `导入—> 从数据库导入` 即可。

![](https://img-blog.csdnimg.cn/377f8aef4f4e4b17afda532362bdbeae.png)
