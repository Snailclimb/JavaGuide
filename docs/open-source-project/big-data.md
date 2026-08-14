---
title: Java 优质开源大数据项目
description: Java优质开源大数据项目推荐，涵盖Hadoop、Spark、Flink、Beam、SeaTunnel、Iceberg、Hudi、Paimon等计算、存储、集成和湖仓项目。
category: 开源项目
icon: "mdi:database-search-outline"
---

大数据项目横跨计算、存储、数据集成和湖仓，不能只按“谁更热门”横向比较。先确定要解决的问题，再选择对应层次的项目。

## 分布式计算

- [Apache Hadoop](https://github.com/apache/hadoop)：分布式存储和批处理生态的基础项目，包含 HDFS、MapReduce 和 YARN 等核心模块。
- [Apache Spark](https://github.com/apache/spark)：用于大规模数据处理的统一分析引擎，覆盖批处理、流处理、SQL 和机器学习等场景。
- [Apache Flink](https://github.com/apache/flink)：面向有界和无界数据流的有状态计算框架，常用于实时数据处理和流批一体任务。
- [Apache Beam](https://github.com/apache/beam)：统一描述批处理与流处理任务的编程模型，可通过不同 Runner 把同一套 Pipeline 运行在 Flink、Spark 等引擎上。
- [Apache Storm](https://github.com/apache/storm)：分布式实时计算系统，适合了解早期流处理架构。新项目选型时建议同时对比 Flink 和 Spark Structured Streaming。

## 分布式存储

- [Apache HBase](https://github.com/apache/hbase)：构建在 Hadoop 生态上的分布式列式存储，适合需要大规模随机读写的场景。

## 数据集成

- [Apache SeaTunnel](https://github.com/apache/seatunnel)：分布式海量数据集成工具，提供多种数据源连接器，可用于离线同步和实时同步。
- [Flink CDC](https://github.com/apache/flink-cdc)：基于 Flink 的流式数据集成工具，适合捕获数据库变更并构建实时数据管道。
- [Apache Flume](https://github.com/apache/flume)：用于采集、聚合和传输日志数据的分布式系统。维护仍在继续，但主要面向传统日志采集场景，新项目选型时应和 Kafka Connect、SeaTunnel 等方案一起评估。

## 湖仓表格式

- [Apache Iceberg](https://github.com/apache/iceberg)：面向大规模分析数据集的开放表格式，支持 Schema 演进、分区演进和快照等能力。
- [Apache Hudi](https://github.com/apache/hudi)：面向数据湖的增量处理平台，强调更新、删除、变更流和增量查询。
- [Apache Paimon](https://github.com/apache/paimon)：面向实时湖仓的表格式，支持 Flink 和 Spark 的流批读写，适合关注实时更新能力的场景。
