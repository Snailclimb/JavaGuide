---
title: Java 常用开源工具类库
description: Java开源工具类库推荐，涵盖Lombok、Guava、Jackson、Hibernate Validator、Tika、PDFBox等常用依赖。
category: 开源项目
icon: "mdi:library-outline"
---

本页收录通过 Maven 或 Gradle 引入代码的 Java 类库。需要单独安装或部署的 GUI、CLI 和管理平台放在[开发工具](./tools.md)。

## 基础工具

- [Lombok](https://github.com/rzwitserloot/lombok)：通过注解生成 `getter`、`setter`、`equals`、`hashCode`、`toString`、构造器和日志字段等样板代码。它依赖编译期注解处理，团队使用前要统一 IDE 插件和构建配置。
- [Guava](https://github.com/google/guava "guava")：Google 维护的 Java 核心库，提供 `Multimap`、`Multiset`、`BiMap`、不可变集合以及 I/O、哈希、字符串处理等工具。
- [Hutool](https://github.com/looly/hutool "hutool")：综合 Java 工具库，覆盖文件、字符串、日期、加密、缓存和日志等常见操作。模块较多，建议按实际需求引入，避免把它当作所有问题的默认答案。

## JSON 处理

- [Jackson Databind](https://github.com/FasterXML/jackson-databind)：Jackson 的通用数据绑定模块，用于在 JSON 与 Java 对象之间转换。升级时要同步关注 Jackson BOM 和安全公告，避免模块版本混用。
- [Gson](https://github.com/google/gson)：Google 开源的 Java JSON 序列化与反序列化库，API 简单，适合依赖规模较小的场景。

## 参数校验

- [Hibernate Validator](https://github.com/hibernate/hibernate-validator)：Jakarta Validation 的参考实现，可通过注解声明字段、方法参数和返回值约束。

## 问题排查和性能优化

- [Arthas](https://github.com/alibaba/arthas "arthas")：Alibaba 开源的 Java 诊断工具，可以实时监控和诊断 Java 应用程序。它提供了丰富的命令和功能，用于分析应用程序的性能问题，包括启动过程中的资源消耗和加载时间。
- [Async Profiler](https://github.com/async-profiler/async-profiler)：低开销的异步 Java 性能分析工具，用于收集和分析应用程序的性能数据。

## 文件与媒体处理

### 文档解析

- [Tika](https://github.com/apache/tika)：Apache Tika 工具包能够检测并提取来自超过一千种不同文件类型（如 PPT、XLS 和 PDF）的元数据和文本内容。

### 图像与媒体元数据

- [TwelveMonkeys ImageIO](https://github.com/haraldk/TwelveMonkeys)：为 Java ImageIO 补充更多图片格式插件和扩展，适合需要读取 TIFF、WebP、PSD 等格式的场景。
- [metadata-extractor](https://github.com/drewnoakes/metadata-extractor)：从图片、视频和音频中提取 EXIF、IPTC、XMP、ICC 等元数据。

### Excel

- [FastExcel](https://github.com/fast-excel/fastexcel)：面向 Java 的高性能、低内存占用 Excel 读写工具。
- [Excel Spring Boot Starter](https://github.com/pig-mesh/excel-spring-boot-starter)：基于 FastExcel 实现的 Spring Boot Starter，用于简化 Excel 的读写操作。

### PDF

简单的 PDF 创建需求可以选择 OpenPDF；需要解析、转换和提取文本时，可以选择 Apache PDFBox。iText 的功能更丰富，但社区版采用 AGPL 许可证，闭源商业项目需要评估商业授权。

- [x-easypdf](https://gitee.com/dromara/x-easypdf)：基于 PDFBox 和 FOP 的 PDF 构建框架，支持 PDF 导出和编辑，适合常规文档生成场景。
- [iText](https://github.com/itext/itext7)：用于创建、编辑和增强 PDF 文档的 Java 库。社区版采用 AGPL 许可证，闭源商业项目通常需要购买商业许可证。
- [OpenPDF](https://github.com/LibrePDF/OpenPDF)：采用 LGPL/MPL 双重许可的 PDF 库，由 iText 的早期版本演化而来，适合常见的 PDF 创建和编辑需求。
- [Apache PDFBox](https://github.com/apache/pdfbox)：采用 Apache 许可证，支持 PDF 创建、解析、转换和文本提取，功能完整，但 API 的学习成本相对高。
- [Apache FOP](https://github.com/apache/xmlgraphics-fop)：用于把 XSL-FO（Extensible Stylesheet Language Formatting Objects）转换为 PDF 等输出格式。

## 短信与邮件

- [SMS4J](https://github.com/dromara/SMS4J)：短信聚合框架，解决接入多个短信 SDK 的繁琐流程。
- [Simple Java Mail](https://github.com/bbottema/simple-java-mail)：轻量级 Java 邮件库，支持附件、嵌入图片、签名和加密等邮件场景。

## 密码学

- [Bouncy Castle for Java](https://github.com/bcgit/bc-java)：Bouncy Castle 的 Java 发行版，提供密码算法、证书、CMS、OpenPGP 等能力。密码学实现不宜自行拼装，使用时应结合项目许可证、合规要求和安全更新评估版本。

## 其他

- [oshi](https://github.com/oshi/oshi "oshi")：一款为 Java 语言提供的基于 JNA 的（本机）操作系统和硬件信息库。
- [ip2region](https://github.com/lionsoul2014/ip2region)：离线 IP 地址定位库，提供多语言查询客户端和紧凑的数据文件。IP 定位结果存在精度边界，不应当作身份或合规判断的唯一依据。
- [agrona](https://github.com/real-logic/agrona)：Java 高性能数据结构（`Buffers`、`Lists`、`Maps`、`Scalable Timer Wheel`……）和实用方法。
