---
title: DataGrip:IDEA官方的这个数据库管理神器真香！
category: 数据库
tag:
  - 开发工具
---

> Atzuge | https://www.cnblogs.com/zuge/p/7397255.html

DataGrip 是由 JetBrains 公司（就是那个出品 Intellij IDEA 的公司,JetBrains出品，必属精品）推出的数据库管理软件。如果你不爱折腾的话，这家公司出品的很多 IDE 都是你的最佳选择，比如你进行 Python 开发的可以选择 JetBrains 全家桶中的 PyCharm 。

**DataGrip 支持几乎所有主流的关系数据库产品，如 DB2、Derby、H2、MySQL、Oracle、PostgreSQL、SQL Server、Sqllite 及 Sybase 等，并且提供了简单易用的界面，开发者上手几乎不会遇到任何困难。**

我相信，当你第一眼看到 DataGrip 以后，会有一种惊艳的感觉，就好比你第一眼看到一个姑娘，就是那么一瞥，你对自己说，就是她了！废话不多说，来看看 DataGrip 的常用功能。

## 下载

DataGrip 下载链接如下 [https://www.jetbrains.com/datagrip/download](https://www.jetbrains.com/datagrip/download)。安装过程也很简单，双击安装，下一步，中间会让你选择主题，本人选择的是经典的 Darcula，安装完成后，启动，界面如下

![](http://dl2.iteye.com/upload/attachment/0119/1201/1a20c170-1d14-3f98-a418-4b951c6548c4.png)

## 配置 Data Source

相信使用过 IDEA 的同学看到这个界面都会感到很亲切。`File->DataSource` ：配置数据源。

![](http://dl2.iteye.com/upload/attachment/0119/1203/d6311108-d7a2-3ece-9cd7-613dd27688cf.png)
DataGrip 支持主流的数据库。你也可以在 Database 视图中展开绿色的+号，添加数据库连接

![](http://dl2.iteye.com/upload/attachment/0119/1217/3298f379-102f-3dc7-ad30-20cfb5d6126d.jpg)
选择需要连接的数据库类型

![](http://dl2.iteye.com/upload/attachment/0119/1219/93e106e6-8e06-3eb5-b507-fe6ee88a2ac8.png)

在面板中，左上部分列出了已经建立的数据库连接，点击各项，右侧会展示当前连接的配置信息，General 面板中，可以配置数据库连接的信息，如主机、用户名、密码等，不同数据库配置信息不完全相同，填入数据库 URL，注意，URL 后有个选项，可以选择直接填入 url，那么就不需要单独填主机名、端口等信息了。

Driver 部分显示数据库驱动信息，如果还没有下载过驱动，底部会有个警告，提示缺少驱动

![](http://dl2.iteye.com/upload/attachment/0119/1236/9879937b-3abf-300d-8b00-23a848f5db04.png)
点击 Driver 后的数据库类型，会跳转到驱动下载页面，点击 download，下载完会显示驱动包

![](http://dl2.iteye.com/upload/attachment/0119/1242/76cdb03e-b8a0-33dd-8dc3-3f2b5c5f5e57.png)

![](http://dl2.iteye.com/upload/attachment/0119/1246/1496c2e6-e180-3fd4-bf4a-cab8a601ce59.png)
如果下载的驱动有问题，可以手动添加本地驱动包，在试用过程中，创建 Oracle 连接时，下载的驱动包就有问题，提示缺少 class，点击右侧绿色的+号，选择本地下载好的 jar 包，通过右侧上下箭头，将导入的 jar 包移到最上位置就 OK 了

![](http://dl2.iteye.com/upload/attachment/0119/1248/1684afeb-e45e-328a-aeab-44ced763b1f9.png)

点击 Test Connection，查看配置是否正确，接下来就可以使用了。

## 常用设置

打开 DataGrip，选择 `File->Settings`，当前面板显示了常用设置项

![](http://dl2.iteye.com/upload/attachment/0119/1252/e074472a-ee46-317d-a18b-63e6c251f919.png)
基本上默认设置就足够了，要更改设置也很简单，左侧菜单已经分类好了，第一项是数据库相关的配置，第二项是配置外观的，在这里可以修改主题，key map 修改快捷键，editor 配置编辑器相关设置，在这里可以修改编辑器字体，展开 edit 项: `Editor->Color & Fonts->Font`

![](http://dl2.iteye.com/upload/attachment/0119/1256/080b78d6-c01b-346b-adb7-840b792372f8.png)
需要将当前主题保存一下，点击 save as，起个名，选择重命名后的主题就能修改了，这里我选择习惯的 Conurier New 字体，大小为 14 号，点击右下角的 apply，点击 OK

![点击查看原始大小图片](http://dl2.iteye.com/upload/attachment/0119/1258/c0d34593-f845-3e44-ba9b-7ba9fcdd8183.png)

其他的没啥好设置的了。

## 数据库常用操作

接下来，我们来使用 DataGrip 完成数据库的常用操作，包括查询数据、修改数据，创建数据库、表等。

![点击查看原始大小图片](http://dl2.iteye.com/upload/attachment/0119/1263/6b0ffcc8-5829-326c-815b-80a476e19c2c.png)
左上区域显示了当前数据库连接，展开后会显示数据库表等信息，如果展开后没有任何信息，需要选中数据库连接，点击上面的旋转图标同步一下，下方有个 More Schema 选项，点击可以切换不同的 schema。

### sql 语句编写

右键选中的数据库连接，选择 open console，就可以在右侧的控制台中书写 sql 语句了。

![img](http://dl2.iteye.com/upload/attachment/0119/1265/f2fc1c17-288a-3991-887b-716f59f8dab5.png)

**DataGrip 的智能提示非常爽，无论是标准的 sql 关键字，还是表名、字段名，甚至数据库特定的字段，都能提示，不得不感叹这智能提示太强大了，Intellij IDEA 的智能提示也是秒杀 eclipse。**

写完 sql 语句后，可以选中，电子左上侧绿色箭头执行

![](http://dl2.iteye.com/upload/attachment/0119/1273/bebf5996-5c3e-37a8-8065-33243f8a5265.png)
也可以使用快捷键 `Ctrl+Enter`，选中情况下，会直接执行该 sql，未选中情况下，如果控制台中有多条 sql，会提示你要执行哪条 sql。

之前习惯了 dbvisualizer 中的操作，dbvisualizer 中光标停留在当前 sql 上(sql 以分号结尾)，按下`Ctrl+.`快捷键会自动执行当前 sql，其实 DataGrip 也能设置，在 `setting->Database-General`中

![](http://dl2.iteye.com/upload/attachment/0119/1283/b4c05671-600a-3305-af48-3112ef44bf17.png)
语句执行时默认是提示，改成 smallest statement 后，光标停留在当前语句时，按下 Ctrl+Enter 就会直接执行当前语句。

语句的执行结果在底部显示

![](http://dl2.iteye.com/upload/attachment/0119/1291/e6fc6a18-da4d-32b6-8c8e-670248b372b5.png)
如果某列的宽度太窄，可以鼠标点击该列的任意一个，使用快捷键`Ctrl+Shift+左右箭头`可以调整宽度，如果要调整所有列的宽度，可以点击左上角红框部分，选择所有行，使用快捷键`Ctrl+Shift+左右箭头调整`

### 修改数据

添加行、删除行也很方便，上部的+、-按钮能直接添加行或删除选中的行，编辑列同样也很方便，双击要修改的列，输入修改后的值，鼠标在其他部分点击就完成修改了

![](http://dl2.iteye.com/upload/attachment/0119/1295/0bc1c527-2d48-369b-bcf5-acada66255b9.png)
有的时候我们要把某个字段置为 null，不是空字符串""，DataGrip 也提供了渐变的操作，直接在列上右键，选择 set null

![](http://dl2.iteye.com/upload/attachment/0119/1297/6fc97e37-fb7f-3c01-a146-c9fba9e7cfa3.png)
对于需要多窗口查看结果的，即希望查询结果在新的 tab 中展示，可以点击 pin tab 按钮，那新查询将不会再当前 tab 中展示，而是新打开一个 tab

![](http://dl2.iteye.com/upload/attachment/0119/1301/3eb0023a-740b-3f80-8014-464d885d7dbc.png)

旁边的 output 控制台显示了执行 sql 的日志信息，能看到 sql 执行的时间等信息

![](http://dl2.iteye.com/upload/attachment/0119/1299/83fa531c-91b4-3a02-b02f-296195f51058.png)
我就问这么吊的工具，还有谁！！！

### 新建表

要新建表也是相当简单、智能，选中数据库连接，点击绿色+号下选择 table

![](http://dl2.iteye.com/upload/attachment/0119/1303/25102ef8-ac5b-303b-9c06-ee4308ffac9e.png)
在新打开的窗口中，可以填写表信息

![](http://dl2.iteye.com/upload/attachment/0119/1306/f00179e9-0fe9-351d-9455-66537440f5cc.png)
我就问你看到这个窗口兴奋不兴奋！！！

顶部可以填写表名、表注释，中间可以点击右侧绿色+号添加列，列类型 type 也是能自动补全，default 右侧的消息框图标点击后能对列添加注释，旁边的几个 tab 可以设置索引及外键

所有这些操作的 DDL 都会直接在底部显示

![](http://dl2.iteye.com/upload/attachment/0119/1310/32c24402-023f-3cad-a2dd-c8a42ace32d1.png)
我就问你怕不怕

表建完后，可以点击下图中的 table 图标，打开表查看视图

![](http://dl2.iteye.com/upload/attachment/0119/1312/9894cfcf-48b6-382d-ab2e-57e6be6a2a5f.png)
可以查看表的数据，也能查看 DDL 语句

### 数据库导出

这些基本功能的设计、体验，已经惊艳到我了，接下来就是数据的导出。

DataGrip 的导出功能也是相当强大

选择需要导出数据的表，右键，Dump Data To File

![](http://dl2.iteye.com/upload/attachment/0119/1315/6520ee08-7ef1-3463-be63-9e8c96861df5.png)
即可以导出 insert、update 形式的 sql 语句，也能导出为 html、csv、json 格式的数据

也可以在查询结果视图中导出

![](http://dl2.iteye.com/upload/attachment/0119/1317/354a6ef4-9ea4-3a32-bc1e-53e02c7f0231.png)
点击右上角下载图标，在弹出窗口中可以选择不同的导出方式，如 sql insert、sql update、csv 格式等

![](http://dl2.iteye.com/upload/attachment/0119/1319/3a9da4d9-0b91-3dc6-b3c1-176b8eaea63b.png)

如果是导出到 csv 格式，还能控制导出的格式

![](http://dl2.iteye.com/upload/attachment/0119/1321/2893f834-9098-322f-8253-5741ab6893cb.png)

导出后用 excel 打开是这种结果

![](http://dl2.iteye.com/upload/attachment/0119/1323/5b5956d0-6cad-3c06-83f4-1a715fa94654.png)
除了能导出数据外，还能导入数据

选择表，右键->Import from File，选择要导入的文件

![](http://dl2.iteye.com/upload/attachment/0119/1325/6926c5c8-be4d-3ebc-b8cb-9737e6838ed3.png)
注意，导出的时候如果勾选了左侧的两个 header 选项，导入的时候如果有 header，也要勾选，不然会提示列个数不匹配

## 小技巧

### 导航+全局搜索

#### 关键字导航

当在 datagrip 的文本编辑区域编写 sql 时，按住键盘 Ctrl 键不放，同时鼠标移动到 sql 关键字上，比如表名、字段名称、或者是函数名上，鼠标会变成手型，关键字会变蓝，并加了下划线，点击，会自动定位到左侧对象树，并选中点击的对象

![](http://dl2.iteye.com/upload/attachment/0121/5964/c29da366-7d43-3aa0-9bce-042285f8771e.png)

#### 快速导航到指定的表、视图、函数等

在 datagrip 中，使用 Ctrl+N 快捷键，弹出一个搜索框，输入需要导航的名称，回车即可

![](http://dl2.iteye.com/upload/attachment/0121/5966/d9ca4280-67a1-3d26-b2aa-796b70cf3e95.png)

#### 全局搜索

连续两次按下 shift 键，或者鼠标点击右上角的搜索图标，弹出搜索框，搜索任何你想搜索的东西

![](http://dl2.iteye.com/upload/attachment/0121/5970/d6bfaa7f-0713-3938-8efc-6c86f354c05e.png)

#### 结果集搜索

在查询结果集视图区域点击鼠标，按下 Ctrl+F 快捷键，弹出搜索框，输入搜索内容，支持正则表达式、过滤结果

![](http://dl2.iteye.com/upload/attachment/0121/5978/7c84cc4f-2337-3767-9a06-4db2747fde40.png)

#### 导航到关联数据

表之间会有外检关联，查询的时候，能直接定位到关联数据，或者被关联数据，例如 user1 表有个外检字段 classroom 指向 classroom 表的主键 id，在查询 classroom 表数据的时候，可以在 id 字段上右键，go to，referencing data

![](http://dl2.iteye.com/upload/attachment/0121/5982/a9dc35f0-12a9-3bfe-aa68-c5396d628253.png)
选择要显示第一条数据还是显示所有数据

![](http://dl2.iteye.com/upload/attachment/0121/5984/421da02c-cd94-33cc-9fbc-cd854991090c.png)
会自动打开关联表的数据

![](http://dl2.iteye.com/upload/attachment/0121/5986/fcde71af-c071-38d2-affd-d08dab7483d5.png)
相反，查询字表的数据时，也能自动定位到父表

### 数据转换

#### 结果集数据过滤

对于使用 table edit（对象树中选中表，右键->table editor）打开的结果集，可以使用条件继续过滤结果集，如下图所示，可以在结果集左上角输入款中输入 where 条件过滤

![](http://dl2.iteye.com/upload/attachment/0121/5994/bbbb92b4-0e49-33cf-8448-cf59e1992986.png)
也可以对着需要过滤数据的列右键，filter by 过滤

![](http://dl2.iteye.com/upload/attachment/0121/5990/84a2bcc7-8722-311e-8b30-0a75618281a6.png)

#### 行转列

对于字段比较多的表，查看数据要左右推动，可以切换成列显示，在结果集视图区域使用 Ctrl+Q 快捷键

![](http://dl2.iteye.com/upload/attachment/0121/5992/4a242dd4-c1e4-3b6f-9204-1468e767906a.png)

#### 变量重命名

鼠标点击需要重命名的变量，按下 Shift+F6 快捷键，弹出重命名对话框，输入新的名称

![](http://dl2.iteye.com/upload/attachment/0121/5996/2587d544-9641-3635-a987-2755bac6a760.png)

#### 自动检测无法解析的对象

如果表名、字段名不存在，datagrip 会自动提示，此时对着有问题的表名或字段名，按下 Alt+Enter，会自动提示是否创建表或添加字段

![](http://dl2.iteye.com/upload/attachment/0121/5998/bb21ae31-209d-3f44-9604-fbf78209e926.png)

#### 权限定字段名

对于查询使用表别名的，而字段中没有使用别名前缀的，datagrip 能自动添加前缀，鼠标停留在需要添加别名前缀的字段上，使用 Alt+Enter 快捷键

![](http://dl2.iteye.com/upload/attachment/0121/6000/38babb30-fcef-3db6-9b06-efb040f3ee12.png)

### 格式化

#### \*通配符自动展开

查询的时候我们会使用 select *查询所有列，这是不好的习惯，datagrip 能快速展开列，光标定位到*后面，按下 Alt+Enter 快捷键

![](http://dl2.iteye.com/upload/attachment/0121/6002/a1b9a749-c223-3197-a073-2f4fc15f30f9.png)

#### 大写自动转换

sql 使用大写形式是个好的习惯，如果使用了小写，可以将光标停留在需要转换的字段或表名上，使用 Ctrl+shift+U 快捷键自动转换

#### sql 格式化

选中需要格式化的 sql 代码，使用 Ctrl+Alt+L 快捷键

datagrip 提供了一个功能强大的编辑器，实现了 notpad++的列编辑模式

### 列编辑

#### 多光标模式

在编辑 sql 的时候，可能需要同时输入或同时删除一些字符，按下 alt+shift，同时鼠标在不同的位置点击，会出现多个光标

![](http://dl2.iteye.com/upload/attachment/0121/6004/cf942465-18ba-3d0a-92c0-2fef52635990.png)

#### 代码注释

选中要注释的代码，按下 Ctrl+/或 Ctrl+shift+/快捷键，能注释代码，或取消注释

![](http://dl2.iteye.com/upload/attachment/0121/6006/daa4c7e7-548a-3b46-a787-e335d001aa1a.png)

#### 列编辑

按住键盘 Alt 键，同时按下鼠标左键拖动，能选择多列，拷贝黏贴等操作

![](http://dl2.iteye.com/upload/attachment/0121/6008/4fd42813-8602-3520-8d63-446c22e942de.png)

### 历史记录

#### 代码历史

在文本编辑器中，邮件，local history，show history，可以查看使用过的 sql 历史

![](http://dl2.iteye.com/upload/attachment/0121/6010/cc243a75-f7ef-366b-b184-f5635855d9f6.png)

#### 命令历史

![](http://dl2.iteye.com/upload/attachment/0121/6012/cf962c1c-0dfe-3241-b137-fef4eac9f1f0.png)
