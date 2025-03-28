---
title: Java 优质开源工具类
category: 开源项目
icon: codelibrary-fill
---

## 代码质量

- [Lombok](https://github.com/rzwitserloot/lombok) :一个能够简化 Java 代码的强大工具库。通过使用 Lombok 的注解，我们可以自动生成常用的代码逻辑，例如 `getter`、`setter`、`equals`、`hashCode`、`toString` 方法，以及构造器、日志变量等内容。
- [Guava](https://github.com/google/guava "guava")： Google 开发的一组功能强大的核心库，扩展了 Java 的标准库功能。它提供了许多有用的工具类和集合类型，例如 `Multimap`（多值映射）、`Multiset`（多重集合）、`BiMap`（双向映射）和不可变集合，此外还包含图形处理库和并发工具。Guava 还支持 I/O 操作、哈希算法、字符串处理、缓存等多种实用功能。
- [Hutool](https://github.com/looly/hutool "hutool") : 一个全面且用户友好的 Java 工具库，旨在通过最小的依赖简化开发任务。它封装了许多实用的功能，例如文件操作、缓存、加密/解密、日志、文件操作。

## 问题排查和性能优化

- [Arthas](https://github.com/alibaba/arthas "arthas")：Alibaba 开源的 Java 诊断工具，可以实时监控和诊断 Java 应用程序。它提供了丰富的命令和功能，用于分析应用程序的性能问题，包括启动过程中的资源消耗和加载时间。
- [Async Profiler](https://github.com/async-profiler/async-profiler)：低开销的异步 Java 性能分析工具，用于收集和分析应用程序的性能数据。
- [Spring Boot Startup Report](https://github.com/maciejwalkowiak/spring-boot-startup-report)：用于生成 Spring Boot 应用程序启动报告的工具。它可以提供详细的启动过程信息，包括每个 bean 的加载时间、自动配置的耗时等，帮助你分析和优化启动过程。
- [Spring Startup Analyzer](https://github.com/linyimin0812/spring-startup-analyzer/blob/main/README_ZH.md)：采集 Spring 应用启动过程数据，生成交互式分析报告(HTML)，用于分析 Spring 应用启动卡点，支持 Spring Bean 异步初始化，减少优化 Spring 应用启动时间。UI 参考[Spring Boot Startup Report](https://github.com/maciejwalkowiak/spring-boot-startup-report)实现。

## 文档处理

### 文档解析

- [Tika](https://github.com/apache/tika)：Apache Tika 工具包能够检测并提取来自超过一千种不同文件类型（如 PPT、XLS 和 PDF）的元数据和文本内容。

### Excel

- [EasyExcel](https://github.com/alibaba/easyexcel) :快速、简单避免 OOM 的 Java 处理 Excel 工具。不过，这个个项目不再维护，迁移至了 [FastExcel](https://github.com/fast-excel/fastexcel)。
- [Excel Spring Boot Starter](https://github.com/pig-mesh/excel-spring-boot-starter)：基于 FastExcel 实现的 Spring Boot Starter，用于简化 Excel 的读写操作。
- [Excel Streaming Reader](https://github.com/monitorjbl/excel-streaming-reader)：Excel 流式代码风格读取工具（只支持读取 XLSX 文件），基于 Apache POI 封装，同时保留标准 POI API 的语法。
- [MyExcel](https://github.com/liaochong/myexcel)：一个集导入、导出、加密 Excel 等多项功能的工具包。

### Word

- [poi-tl](https://github.com/Sayi/poi-tl)：基于 Apache POI 的 Word 模板引擎，可以根据 Word 模板和数据生成 Word 文档，所见即所得！

### JSON

- [JsonPath](https://github.com/json-path/JsonPath)：处理 JSON 数据的工具库。

### PDF

对于简单的 PDF 创建需求，OpenPDF 是一个不错的选择，它开源免费，API 简单易用。对于需要解析、转换和提取文本等操作的复杂场景，可以选择 Apache PDFBox。当然了，复杂场景如果不介意 LGPL 许可也可以选择 iText。

- [x-easypdf](https://gitee.com/dromara/x-easypdf)：一个用搭积木的方式构建 PDF 的框架（基于 pdfbox/fop），支持 PDF 导出和编辑，适合简单的 PDF 文档生成场景。
- [iText](https://github.com/itext/itext7)：一个用于创建、编辑和增强 PDF 文档的 Java 库。iText 7 社区版采用 AGPL 许可证，如果你的项目是闭源商业项目，需要购买商业许可证。 iText 5 仍然是 LGPL 许可，可以免费用于商业用途，但已经停止维护。
- [OpenPDF](https://github.com/LibrePDF/OpenPDF)：完全开源免费 (LGPL/MPL 双重许可)，基于 iText 的一个分支，可以作为 iText 的替代品，简单易用，但功能相比于 iText 更少一些（对于大多数场景已经足够）。
- [Apache PDFBox](https://github.com/apache/pdfbox) :完全开源免费 (Apache 许可证)，功能强大，支持 PDF 的创建、解析、转换和提取文本等。不过，由于其功能过于丰富，因此 API 设计相对复杂，学习难度会大一些。
- [FOP](https://xmlgraphics.apache.org/fop/) : Apache FOP 用于将 XSL-FO（Extensible Stylesheet Language Formatting Objects）格式化对象转换为多种输出格式，最常见的是 PDF。

## 图片处理

- [Thumbnailator](https://github.com/coobird/thumbnailator)：一个图像处理工具库，主要功能是缩放图像、添加水印、旋转图像、调整图片大小以及区域裁剪。
- [Imglib](https://github.com/nackily/imglib)：一个轻量级的 JAVA 图像处理库，致力于简化对图像的常见处理，主要提供三部分的能力：图像收集、图像处理（基于 Thumbnailator 实现）、聚合与分裂。

## 验证码

- [EasyCaptcha](https://gitee.com/whvse/EasyCaptcha)：Java 图形验证码，支持 gif、中文、算术等类型，可用于 Java Web、JavaSE 等项目。
- [AJ-Captcha](https://gitee.com/anji-plus/captcha)：行为验证码(滑动拼图、点选文字)，前后端(java)交互。
- [tianai-captcha](https://gitee.com/tianai/tianai-captcha)：好看又好用的滑块验证码。

## 短信&邮件

- [SMS4J](https://github.com/dromara/SMS4J)：短信聚合框架，解决接入多个短信 SDK 的繁琐流程。
- [Simple Java Mail](https://github.com/bbottema/simple-java-mail)：最简单的 Java 轻量级邮件库，同时能够发送复杂的电子邮件。

## 在线支付

- [Jeepay](https://gitee.com/jeequan/jeepay)：一套适合互联网企业使用的开源支付系统，已实现交易、退款、转账、分账等接口，支持服务商特约商户和普通商户接口。已对接微信，支付宝，云闪付官方接口，支持聚合码支付。
- [YunGouOS-PAY-SDK](https://gitee.com/YunGouOS/YunGouOS-PAY-SDK)：YunGouOS 微信支付接口、微信官方个人支付接口、非二维码收款，非第四方清算。个人用户可提交资料开通微信支付商户，完成对接。
- [IJPay](https://gitee.com/javen205/IJPay)：聚合支付，IJPay 让支付触手可及，封装了微信支付、QQ 支付、支付宝支付、京东支付、银联支付、PayPal 支付等常用的支付方式以及各种常用的接口。

## 其他

- [oshi](https://github.com/oshi/oshi "oshi")：一款为 Java 语言提供的基于 JNA 的（本机）操作系统和硬件信息库。
- [ip2region](https://github.com/lionsoul2014/ip2region) :最自由的 ip 地址查询库，ip 到地区的映射库，提供 Binary,B 树和纯内存三种查询算法，妈妈再也不用担心我的 ip 地址定位。
- [agrona](https://github.com/real-logic/agrona)：Java 高性能数据结构（`Buffers`、`Lists`、`Maps`、`Scalable Timer Wheel`……）和实用方法。
