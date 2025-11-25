---
title: Java high-quality open source development tools
category: open source projects
icon: tool
---

## Code quality

- [SonarQube](https://github.com/SonarSource/sonarqube "sonarqube"): A static code inspection tool that helps check code defects. It can quickly locate potential or obvious errors in the code, improve code quality, and increase development speed.
- [Spotless](https://github.com/diffplug/spotless): Spotless is a code formatting tool that supports multiple languages ​​and supports Maven and Gradle to be built in the form of Plugin.
- [CheckStyle](https://github.com/checkstyle/checkstyle "checkstyle") : Similar to Spotless, it helps programmers write Java code that complies with coding standards.
- [PMD](https://github.com/pmd/pmd "pmd") : Extensible multi-language static code analyzer.
- [SpotBugs](https://github.com/spotbugs/spotbugs "spotbugs") : The successor of FindBugs. Static analysis tool for finding errors in Java code.
- [P3C](https://github.com/alibaba/p3c "p3c")：Alibaba Java Coding Guidelines pmd implements and IDE plugin. The plug-in is available on Eclipse and IDEA.

## Project build

- [Maven](https://maven.apache.org/): A software project management and understanding tool. Based on the concept of Project Object Model (POM), Maven can manage the project's build, reporting and documentation from a central piece of information. Detailed introduction: [Summary of Maven core concepts](https://javaguide.cn/tools/maven/maven-core-concepts.html).
- [Gradle](https://gradle.org/): An open source build automation tool that is flexible enough to build almost any type of software. Gradle makes very few assumptions about what you want to build or how to build it, which makes Gradle particularly flexible. Detailed introduction: [Summary of Gradle core concepts](https://javaguide.cn/tools/gradle/gradle-core-concepts.html).

## Decompile

- [JADX](https://github.com/skylot/jadx): Command line and GUI tool for generating Java source code from Android Dex and Apk files.
- [JD-GUI](https://github.com/java-decompiler/jd-gui): A standalone GUI tool that displays Java source code in CLASS files.

## Database

### Database modeling

- [CHINER](https://gitee.com/robergroup/chiner): An open source and free domestic database modeling tool. The goal is to create a database relational model design platform that enriches the database ecosystem and is independent of specific databases. The predecessor was [PDMan](https://gitee.com/robergroup/pdman), positioned as a free alternative to PowerDesigner.

There are relatively few open source database modeling tools. Here are some non-open source database modeling tools (some require payment to use):

- [MySQL Workbench](https://www.mysql.com/products/workbench/): A visual tool officially provided by MySQL for database architects, developers and DBAs. MySQL Workbench supports data modeling, SQL development, server configuration, user management, performance optimization, database backup and migration, etc. It supports Windows, Linux and Mac OS X platforms.
- [Navicat Data Modeler](https://www.navicat.com.cn/products/navicat-data-modeler): A powerful and cost-effective database design tool that helps users create high-quality conceptual, logical and physical data models. Allows you to visually design database structures, perform reverse or forward engineering procedures, import models from ODBC data sources, generate complex SQL/DDL and print models to files, etc. Pay.
- [DbSchema](https://dbschema.com/): A powerful visual tool for database design and management, supporting almost all relational and NoSQL databases. Pay.
- [dbdiagram.io](https://dbdiagram.io/home): It is a simple and free online ER diagram drawing tool that creates models by writing code, designed for developers and data analysts. It generates data models through a simple custom language and supports functions such as forward engineering and reverse engineering of MySQL, PostgreSQL, and SQL Server database DDL files, version history, online sharing, and export of images or PDFs. dbdiagram.io offers a free version.

### Database Management

- [Chat2DB](https://github.com/alibaba/Chat2DB): An intelligent universal database tool and SQL client open sourced by Alibaba. It supports local installation on Windows and Mac, as well as server-side deployment and Web page access. Compared with traditional database client software Navicat and DBeaver, Chat2DB integrates the capabilities of AIGC and supports natural language generation of SQL, SQL performance optimization and other functions.
- [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio): A cross-platform database management tool with good looks and support for SQLite, MySQL, MariaDB, Postgres, CockroachDB, SQL Server, and Amazon Redshift.
- [Sequel Pro](https://github.com/sequelpro/sequelpro): MySQL/MariaDB database management tool for macOS.
- [DBeaver](https://github.com/dbeaver/dbeaver): An open source database management tool developed based on Java and supporting almost all database products. DBeaver Community Edition not only supports relational databases such as MySQL, PostgreSQL, MariaDB, SQLite, Oracle, Db2, and SQL Server, but also embedded databases such as SQLite and H2. It also supports common full-text search engines such as Elasticsearch and Solr, and big data-related tools such as Hive and Spark.
- [Kangaroo](https://gitee.com/dbkangaroo/kangaroo): Kangaroo is a management client built for popular database systems (SQLite / MySQL / PostgreSQL / ...). It supports table creation, query, model, synchronization, import and export and other functions. It supports Windows / Mac / Linux and other operating systems, and strives to be an easy-to-use, fun, and development-friendly SQL tool.
- [Arctype](https://arctype.com/): A desktop database query tool that can connect to various databases, execute SQL statements in them, and display data in a visual form.
- [Mongood](https://github.com/RenzHoly/Mongood): MongoDB graphical management tool. Based on Microsoft Fluent UI, supports automatic dark mode.

### Redis

- [Another Redis Desktop Manager](https://github.com/qishibo/AnotherRedisDesktopManager/blob/master/README.zh-CN.md): Faster, better, and more stable Redis desktop (GUI) management client, compatible with Windows, Mac, and Linux.
- [Tiny RDM](https://github.com/tiny-craft/tiny-rdm): A more modern Redis desktop (GUI) management client, based on Webview2, compatible with Windows, Mac, and Linux.
- [Redis Manager](https://github.com/ngbdf/redis-manager): Redis one-stop management platform supports cluster (cluster, master-replica, sentinel) monitoring, installation (except sentinel), management, alarms and basic data operation functions.
- [CacheCloud](https://github.com/sohutv/cachecloud): A Redis cloud management platform that supports efficient management of multiple Redis architectures (Standalone, Sentinel, Cluster), effectively reduces large-scale Redis operation and maintenance costs, and improves resource management and control capabilities and utilization.
- [RedisShake](https://github.com/tair-opensource/RedisShake): A tool for processing and migrating Redis data.

## Docker- [Portainer](https://github.com/portainer/portainer): Visually manage Docker, in the form of web applications.
- [lazydocker](https://github.com/jesseduffield/lazydocker): Simple terminal UI for docker and docker-compose.

## ZooKeeper

- [PrettyZoo](https://github.com/vran-dev/PrettyZoo): A ZooKeeper graphical management client based on Apache Curator and JavaFX. It is very beautiful and supports Mac / Windows / Linux. You can use PrettyZoo to implement visual addition, deletion, modification and query of ZooKeeper.
- [zktools](https://zktools.readthedocs.io/en/latest/#installing): A low-latency ZooKeeper graphical management client, very beautiful, supports Mac / Windows / Linux. You can use zktools to implement visual addition, deletion, modification and query of ZooKeeper.

## Kafka

- [Kafka UI](https://github.com/provectus/kafka-ui): Free and open source web UI for monitoring and managing Apache Kafka clusters.
- [Kafdrop](https://github.com/obsidiandynamics/kafdrop): A web UI for viewing Kafka topics and browsing consumer groups.
- [EFAK](https://github.com/smartloli/EFAK) (Eagle For Apache Kafka, formerly known as Kafka Eagle): A simple high-performance monitoring system for comprehensive monitoring and management of Kafka clusters.