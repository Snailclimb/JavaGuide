---
title: Java 优质开源开发工具
category: 开源项目
icon: tool
---

## 项目构建

- [Maven](https://maven.apache.org/)：一个软件项目管理和理解工具。基于项目对象模型 (Project Object Model，POM) 的概念，Maven 可以从一条中心信息管理项目的构建、报告和文档。详细介绍：[Maven核心概念总结](https://javaguide.cn/tools/maven/maven-core-concepts.html)。
- [Gradle](https://gradle.org/) ：一个开源的构建自动化工具，它足够灵活，可以构建几乎任何类型的软件。Gradle 对你要构建什么或者如何构建它做了很少的假设，这使得 Gradle 特别灵活。详细介绍：[Gradle核心概念总结](https://javaguide.cn/tools/gradle/gradle-core-concepts.html)。

## 反编译

- [JADX](https://github.com/skylot/jadx)：用于从 Android Dex 和 Apk 文件生成 Java 源代码的命令行和 GUI 工具。
- [JD-GUI](https://github.com/java-decompiler/jd-gui):一个独立的 GUI 工具，可显示 CLASS 文件中的 Java 源代码。

## 数据库

### 数据库建模

- [CHINER](https://gitee.com/robergroup/chiner)：开源免费的国产数据库建模工具。目标是做一款丰富数据库生态，独立于具体数据库之外的，数据库关系模型设计平台。前生是 [PDMan](https://gitee.com/robergroup/pdman)，定位为 PowerDesigner 的免费替代方案。

开源的数据库建模工具比较少，以下是一些非开源的数据库建模工具（部分需要付费才能使用） :

- [MySQL Workbench](https://www.mysql.com/products/workbench/) : MySQL 官方为数据库架构师、开发人员和 DBA 提供的一个可视化工具。 MySQL Workbench 支持数据建模，SQL 开发以及服务器配置、用户管理、性能优化、数据库备份以及迁移等功能，支持 Windows、Linux 和 Mac OS X 平台。
- [Navicat Data Modeler](https://www.navicat.com.cn/products/navicat-data-modeler) : 一款强大的和符合成本效益的数据库设计工具，它能帮助用户创建高质素的概念、逻辑和物理数据模型。让你可视化地设计数据库结构、执行逆向或正向工程程序、从 ODBC 数据源导入模型、生成复杂的 SQL/DDL 和打印模型到文件等。付费。
- [DbSchema](https://dbschema.com/) : 一款功能强大的数据库设计和管理的可视化工具，支持几乎所有的关系型和 NoSQL 数据库。付费。
- [dbdiagram.io](https://dbdiagram.io/home) : 是一款简单免费的在线 ER 图绘制工具，通过编写代码创建模型，专为开发人员和数据分析师而设计。它通过一个简单的自定义语言来生成数据模型，支持 MySQL、PostgreSQL、SQL Server 数据库 DDL 文件的正向工程和逆向工程、版本历史、在线共享、导出图片或者 PDF 等功能。dbdiagram.io 提供了免费版。

### 数据库管理

- [Chat2DB](https://github.com/alibaba/Chat2DB)：阿里巴巴开源的一款智能的通用数据库工具和 SQL 客户端，支持 Windows、Mac 本地安装，也支持服务器端部署，Web 网页访问。和传统的数据库客户端软件 Navicat、DBeaver 相比 Chat2DB 集成了 AIGC 的能力，支持自然语言生成 SQL、SQL 性能优化等功能。
- [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio)：跨平台数据库管理工具，颜值高，支持 SQLite、MySQL、MariaDB、Postgres、CockroachDB、SQL Server、Amazon Redshift。
- [Sequel Pro](https://github.com/sequelpro/sequelpro)：适用于 macOS 的 MySQL/MariaDB 数据库管理工具。
- [DBeaver](https://github.com/dbeaver/dbeaver)：一个基于 Java 开发 ，并且支持几乎所有的数据库产品的开源数据库管理工具。DBeaver 社区版不光支持关系型数据库比如 MySQL、PostgreSQL、MariaDB、SQLite、Oracle、Db2、SQL Server，还比如 SQLite、H2 这些内嵌数据库。还支持常见的全文搜索引擎比如 Elasticsearch 和 Solr、大数据相关的工具比如 Hive 和 Spark。
- [Kangaroo](https://gitee.com/dbkangaroo/kangaroo)：袋鼠是一款为热门数据库系统打造的管理客户端(SQLite / MySQL / PostgreSQL / ...) ，支持建表、查询、模型、同步、导入导出等功能，支持 Windows / Mac / Linux 等操作系统，力求打造成好用、好玩、开发友好的 SQL 工具。
- [Arctype](https://arctype.com/)：一个桌面的数据库查询工具，可以连接各种数据库，在其中执行 SQL 语句，以可视化形式展示数据。
- [Mongood](https://github.com/RenzHoly/Mongood) : MongoDB 图形化的管理工具。基于微软 Fluent UI，支持自动黑暗模式。

### Redis

- [Another Redis Desktop Manager](https://github.com/qishibo/AnotherRedisDesktopManager/blob/master/README.zh-CN.md)：更快、更好、更稳定的 Redis 桌面(GUI)管理客户端。
- [Redis Manager](https://github.com/ngbdf/redis-manager)：Redis 一站式管理平台，支持集群（cluster、master-replica、sentinel）的监控、安装（除 sentinel）、管理、告警以及基本的数据操作功能。

## Docker

- [Portainer](https://github.com/portainer/portainer)：可视化管理 Docker，Web 应用的形式。
- [lazydocker](https://github.com/jesseduffield/lazydocker)：适用于 docker 和 docker-compose 的简单终端 UI。

## ZooKeeper

- [PrettyZoo](https://github.com/vran-dev/PrettyZoo)：一个基于 Apache Curator 和 JavaFX 实现的 ZooKeeper 图形化管理客户端，颜值非常高，支持 Mac / Windows / Linux 。你可以使用 PrettyZoo 来实现对 ZooKeeper 的可视化增删改查。
- [zktools](https://zktools.readthedocs.io/en/latest/#installing)：一个低延迟的 ZooKeeper 图形化管理客户端，颜值非常高，支持 Mac / Windows / Linux 。你可以使用 zktools 来实现对 ZooKeeper 的可视化增删改查。
