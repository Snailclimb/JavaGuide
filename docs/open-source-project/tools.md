---
title: Java 优质开源开发工具
description: Java优质开源开发工具推荐，涵盖代码质量检查、代码安全分析、项目构建、测试框架、容器化部署等开发必备工具精选。
category: 开源项目
icon: "mdi:tools"
---

本页收录独立运行的 GUI、CLI、平台，以及接入构建流程的检查工具。可以直接作为业务代码依赖的通用库放在[工具类库](./tool-library.md)。

## 代码质量

- [SonarQube](https://github.com/SonarSource/sonarqube "sonarqube")：持续代码质量检查平台，用于发现缺陷、安全热点、重复代码和可维护性问题。
- [Spotless](https://github.com/diffplug/spotless)：Spotless 是支持多种语言的代码格式化工具，支持 Maven 和 Gradle 以 Plugin 的形式构建。
- [Checkstyle](https://github.com/checkstyle/checkstyle "checkstyle")：检查 Java 源码是否符合编码规范，可接入 Maven、Gradle 和 CI 流程。
- [PMD](https://github.com/pmd/pmd "pmd")：可扩展的多语言静态代码分析器。
- [SpotBugs](https://github.com/spotbugs/spotbugs "spotbugs")：FindBugs 的继任者，通过字节码静态分析查找 Java 代码中的缺陷。
- [Error Prone](https://github.com/google/error-prone)：在编译阶段捕获常见 Java 编码错误，可接入 `javac`、Maven 和 Gradle 构建流程。
- [NullAway](https://github.com/uber/NullAway)：低构建开销的 Java 空指针静态检查工具，通常与 Error Prone 配合使用。它依赖空值注解和增量接入，不能替代运行时测试。
- [ArchUnit](https://github.com/TNG/ArchUnit)：用 Java 测试代码声明并检查分层、依赖方向、包结构等架构规则，适合把团队约定变成自动化测试。

## 代码安全

- [OpenTaint](https://github.com/seqra/opentaint/blob/main/docs/translations/README.zh.md "opentaint")：面向 Java、Kotlin 和 Spring Boot 应用的开源污点分析/SAST 工具，可用于检测 SQL 注入、XSS、SSRF 等安全风险。

## 项目构建

- [Maven](https://maven.apache.org/)：一个软件项目管理和理解工具。基于项目对象模型 (Project Object Model，POM) 的概念，Maven 可以从一条中心信息管理项目的构建、报告和文档。详细介绍：[Maven 核心概念总结](https://javaguide.cn/tools/maven/maven-core-concepts.html)。
- [Gradle](https://gradle.org/) ：一个开源的构建自动化工具，它足够灵活，可以构建几乎任何类型的软件。Gradle 对你要构建什么或者如何构建它做了很少的假设，这使得 Gradle 特别灵活。详细介绍：[Gradle 核心概念总结](https://javaguide.cn/tools/gradle/gradle-core-concepts.html)。

## 反编译

- [JADX](https://github.com/skylot/jadx)：用于从 Android Dex 和 Apk 文件生成 Java 源代码的命令行和 GUI 工具。

## 数据库

### 数据库管理

- [Chat2DB](https://github.com/OtterMind/Chat2DB)：跨平台数据库客户端和 SQL 工作台，支持多种数据库，并提供 SQL 生成、解释和优化等 AI 辅助能力。
- [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio)：跨平台数据库管理工具，颜值高，支持 SQLite、MySQL、MariaDB、Postgres、CockroachDB、SQL Server、Amazon Redshift。
- [DBeaver](https://github.com/dbeaver/dbeaver)：基于 Java 的跨平台数据库管理工具。社区版支持 MySQL、PostgreSQL、MariaDB、SQLite、Oracle、Db2、SQL Server 等多种数据库。
- [Kangaroo](https://gitee.com/dbkangaroo/kangaroo)：跨平台数据库管理客户端，支持 SQLite、MySQL、PostgreSQL 等数据库，以及查询、建模、同步和导入导出等操作。

### Redis

- [Another Redis Desktop Manager](https://github.com/qishibo/AnotherRedisDesktopManager/blob/master/README.zh-CN.md)：跨平台 Redis 桌面客户端，兼容 Windows、macOS 和 Linux。
- [Tiny RDM](https://github.com/tiny-craft/tiny-rdm)：基于 WebView2 的跨平台 Redis 桌面客户端，兼容 Windows、macOS 和 Linux。
- [RedisInsight](https://github.com/RedisInsight/RedisInsight)：Redis 官方 GUI，可用于浏览键值、运行命令、分析内存占用和排查慢查询。
- [CacheCloud](https://github.com/sohutv/cachecloud)：一个 Redis 云管理平台，支持 Redis 多种架构(Standalone、Sentinel、Cluster)高效管理、有效降低大规模 Redis 运维成本，提升资源管控能力和利用率。
- [RedisShake](https://github.com/tair-opensource/RedisShake)：一个用于处理和迁移 Redis 数据的工具。

## Docker

- [Portainer](https://github.com/portainer/portainer)：通过 Web 界面管理容器、镜像、网络和存储等资源。

## Kafka

- [Kafbat UI](https://github.com/kafbat/kafka-ui)：用于监控和管理 Apache Kafka 集群的开源 Web UI。
- [Kafdrop](https://github.com/obsidiandynamics/kafdrop)：用于查看 Kafka Topic、消息和 Consumer Group 的 Web UI。
- [Redpanda Console](https://github.com/redpanda-data/console)：面向 Kafka 和 Redpanda 的 Web 管理界面，可浏览 Topic、Consumer Group、Schema 和实时消息。
