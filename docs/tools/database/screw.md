# screw:一键生成数据库文档，堪称数据库界的Swagger

在项目中，我们经常需要整理数据库表结构文档。

一般情况下，我们都是手动整理数据库表结构文档，当表结构有变动的时候，自己手动进行维护。

数据库表少的时候还好，数据库表多了之后，手动整理和维护数据库表结构文档简直不要太麻烦，而且，还非常容易出错！

**有没有什么好用的工具帮助我们自动生成数据库表结构文档呢？**

当然有！Github 上就有一位朋友开源了一款数据库表结构文档自动生成工具—— **screw** 。

项目地址： https://github.com/pingfangushi/screw 。

![](https://img-blog.csdnimg.cn/cc9556dbe0494e449b7c913f3eb8fe9e.png)

screw 翻译过来的意思就是螺丝钉，作者希望这个工具能够像螺丝钉一样切实地帮助到我们的开发工作。

目前的话，screw 已经支持市面上大部分常见的数据库比如 MySQL、MariaDB、Oracle、SqlServer、PostgreSQL、TiDB。

另外，screw 使用起来也非常简单，根据官网提示，不用 10 分钟就能成功在本地使用起来！

## 快速入门

为了验证 screw 自动生成数据库表结构文档的效果，我们首先创建一个简单的存放博客数据的数据库表。

```sql
CREATE TABLE `blog` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` varchar(255) NOT NULL COMMENT '博客标题',
  `content` longtext NOT NULL COMMENT '博客内容',
  `description` varchar(255) DEFAULT NULL COMMENT '博客简介',
  `cover` varchar(255) DEFAULT NULL COMMENT '博客封面图片地址',
  `views` int(11) NOT NULL DEFAULT '0' COMMENT '博客阅读次数',
  `user_id` bigint(20) DEFAULT '0' COMMENT '发表博客的用户ID',
  `channel_id` bigint(20) NOT NULL COMMENT '博客分类ID',
  `recommend` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否推荐',
  `top` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否置顶',
  `comment` bit(1) NOT NULL DEFAULT b'1' COMMENT '是否开启评论',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COMMENT='博客';
```

### 基于 Java 代码

#### 引入依赖

创建一个普通的 Maven 项目即可！然后引入 screw、HikariCP、MySQL 这 3 个依赖。

```xml
<!--screw-->
<dependency>
    <groupId>cn.smallbun.screw</groupId>
    <artifactId>screw-core</artifactId>
    <version>1.0.5</version>
</dependency>
<!-- HikariCP -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.4.5</version>
</dependency>
<!--MySQL-->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.20</version>
</dependency>
```

你可以通过下面的地址在 mvnrepository 获取最新版本的 screw。

> https://mvnrepository.com/artifact/cn.smallbun.screw/screw-core

#### 编写代码

生成数据库文档的代码的整个代码逻辑还是比较简单的，我们只需要经过下面 5 步即可：

```java
// 1.获取数据源
DataSource dataSource = getDataSource();
// 2.获取数据库文档生成配置（文件路径、文件类型）
EngineConfig engineConfig = getEngineConfig();
// 3.获取数据库表的处理配置，可忽略
ProcessConfig processConfig = getProcessConfig();
// 4.Screw 完整配置
Configuration config = getScrewConfig(dataSource, engineConfig, processConfig);
// 5.执行生成数据库文档
new DocumentationExecute(config).execute();
```

**1、获取数据库源**

对数据库以及数据库连接池进行相关配置。务必将数据库相关的配置修改成你自己的。

```java
/**
 * 获取数据库源
 */
private static DataSource getDataSource() {
    //数据源
    HikariConfig hikariConfig = new HikariConfig();
    hikariConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
    hikariConfig.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/javaguide-blog");
    hikariConfig.setUsername("root");
    hikariConfig.setPassword("123456");
    //设置可以获取tables remarks信息
    hikariConfig.addDataSourceProperty("useInformationSchema", "true");
    hikariConfig.setMinimumIdle(2);
    hikariConfig.setMaximumPoolSize(5);
    return new HikariDataSource(hikariConfig);
}
```

**2、获取文件生成配置**

这一步会指定数据库文档生成的位置、文件类型以及文件名称。

```java
/**
 * 获取文件生成配置
 */
private static EngineConfig getEngineConfig() {
    //生成配置
    return EngineConfig.builder()
            //生成文件路径
            .fileOutputDir("/Users/guide/Documents/代码示例/screw-demo/doc")
            //打开目录
            .openOutputDir(true)
            //文件类型
            .fileType(EngineFileType.HTML)
            //生成模板实现
            .produceType(EngineTemplateType.freemarker)
            //自定义文件名称
            .fileName("数据库结构文档").build();
}
```

如果不配置生成文件路径的话，默认也会存放在项目的 `doc` 目录下。

另外，我们这里指定生成的文件格式为 HTML。除了 HTML 之外，screw 还支持 Word 、Markdown 这两种文件格式。

不太建议生成 Word 格式,比较推荐 Markdown 格式。

**3、获取数据库表的处理配置**

这一步你可以指定只生成哪些表：

```java
/**
 * 获取数据库表的处理配置，可忽略
 */
private static ProcessConfig getProcessConfig() {
    return ProcessConfig.builder()
      // 指定只生成 blog 表
      .designatedTableName(new ArrayList<>(Collections.singletonList("blog")))
      .build();
}
```

还可以指定忽略生成哪些表：

```java
private static ProcessConfig getProcessConfig() {
    ArrayList<String> ignoreTableName = new ArrayList<>();
    ignoreTableName.add("test_user");
    ignoreTableName.add("test_group");
    ArrayList<String> ignorePrefix = new ArrayList<>();
    ignorePrefix.add("test_");
    ArrayList<String> ignoreSuffix = new ArrayList<>();
    ignoreSuffix.add("_test");
    return ProcessConfig.builder()
            //忽略表名
            .ignoreTableName(ignoreTableName)
            //忽略表前缀
            .ignoreTablePrefix(ignorePrefix)
            //忽略表后缀
            .ignoreTableSuffix(ignoreSuffix)
            .build();
}
```

这一步也可以省略。如果不指定 `ProcessConfig` 的话，就会按照默认配置来！

**4、生成 screw 完整配置**

根据前面 3 步，生成 screw 完整配置。

```java
private static Configuration getScrewConfig(DataSource dataSource, EngineConfig engineConfig, ProcessConfig processConfig) {
    return Configuration.builder()
            //版本
            .version("1.0.0")
            //描述
            .description("数据库设计文档生成")
            //数据源
            .dataSource(dataSource)
            //生成配置
            .engineConfig(engineConfig)
            //生成配置
            .produceConfig(processConfig)
            .build();
}
```

**5、执行生成数据库文档**

![](https://img-blog.csdnimg.cn/ab2c9ee575304dcdb3c6c231c9eadd17.png)

下图就是生成的 HTML 格式的数据库设计文档。

![](https://img-blog.csdnimg.cn/6ac5a73f27ed4314960fa7671c479525.png)

### 基于 Maven 插件

除了基于 Java 代码这种方式之外，你还可以通过 screw 提供的 Maven 插件来生成数据库文档。方法也非常简单！

**1、配置 Maven 插件**

务必将数据库相关的配置修改成你自己的。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>cn.smallbun.screw</groupId>
            <artifactId>screw-maven-plugin</artifactId>
            <version>1.0.5</version>
            <dependencies>
                <!-- HikariCP -->
                <dependency>
                    <groupId>com.zaxxer</groupId>
                    <artifactId>HikariCP</artifactId>
                    <version>3.4.5</version>
                </dependency>
                <!--mysql driver-->
                <dependency>
                    <groupId>mysql</groupId>
                    <artifactId>mysql-connector-java</artifactId>
                    <version>8.0.20</version>
                </dependency>
            </dependencies>
            <configuration>
                <!--username-->
                <username>root</username>
                <!--password-->
                <password>123456</password>
                <!--driver-->
                <driverClassName>com.mysql.cj.jdbc.Driver</driverClassName>
                <!--jdbc url-->
                <jdbcUrl>jdbc:mysql://127.0.0.1:3306/javaguide-blog</jdbcUrl>
                <!--生成文件类型-->
                <fileType>MD</fileType>
                <!--打开文件输出目录-->
                <openOutputDir>true</openOutputDir>
                <!--生成模板-->
                <produceType>freemarker</produceType>
                <!--文档名称 为空时:将采用[数据库名称-描述-版本号]作为文档名称-->
                <fileName>数据库结构文档</fileName>
                <!--描述-->
                <description>数据库设计文档生成</description>
                <!--版本-->
                <version>${project.version}</version>
                <!--标题-->
                <title>数据库文档</title>
            </configuration>
            <executions>
                <execution>
                    <phase>compile</phase>
                    <goals>
                        <goal>run</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**2、手动执行生成数据库文档**

![](https://img-blog.csdnimg.cn/9d711f5efba54b44b526cbf5e0173b3d.png)

我们这里指定生成的是 Markdown 格式。

![](https://img-blog.csdnimg.cn/d9debd83fa644b9b8fbd44ac3340530a.png)

下图就是生成的 Markdown 格式的数据库设计文档，效果还是非常不错的！

![](https://img-blog.csdnimg.cn/654d93c2faae4a47bd4b8b8a4f5d8376.png)




