---
title: Java high-quality open source tools
category: open source projects
icon: codelibrary-fill
---

## Code quality

- [Lombok](https://github.com/rzwitserloot/lombok): A powerful tool library that can simplify Java code. By using Lombok's annotations, we can automatically generate commonly used code logic, such as `getter`, `setter`, `equals`, `hashCode`, `toString` methods, as well as constructors, log variables, etc.
- [Guava](https://github.com/google/guava "guava"): A set of powerful core libraries developed by Google that extends Java's standard library functionality. It provides many useful utility classes and collection types, such as Multimap, Multiset, BiMap, and immutable collections, as well as graphics libraries and concurrency tools. Guava also supports I/O operations, hashing algorithms, string processing, caching and other practical functions.
- [Hutool](https://github.com/looly/hutool "hutool") : A comprehensive and user-friendly Java tool library designed to simplify development tasks with minimal dependencies. It encapsulates many practical functions, such as file operations, caching, encryption/decryption, logging, and file operations.

## Troubleshooting and performance optimization

- [Arthas](https://github.com/alibaba/arthas "arthas"): Alibaba's open source Java diagnostic tool, which can monitor and diagnose Java applications in real time. It provides a rich set of commands and functions for analyzing application performance issues, including resource consumption and loading times during startup.
- [Async Profiler](https://github.com/async-profiler/async-profiler): A low-overhead asynchronous Java performance profiling tool for collecting and analyzing application performance data.
- [Spring Boot Startup Report](https://github.com/maciejwalkowiak/spring-boot-startup-report): Tool for generating Spring Boot application startup report. It can provide detailed startup process information, including the loading time of each bean, the time taken for automatic configuration, etc., to help you analyze and optimize the startup process.
- [Spring Startup Analyzer](https://github.com/linyimin0812/spring-startup-analyzer/blob/main/README_ZH.md): Collects Spring application startup process data and generates an interactive analysis report (HTML), which is used to analyze Spring application startup stuck points, supports Spring Bean asynchronous initialization, and reduces and optimizes Spring application startup time. UI refers to [Spring Boot Startup Report](https://github.com/maciejwalkowiak/spring-boot-startup-report) implementation.

## Document processing

### Document analysis

- [Tika](https://github.com/apache/tika): The Apache Tika toolkit is capable of detecting and extracting metadata and textual content from over a thousand different file types such as PPT, XLS, and PDF.

### Excel

- [EasyExcel](https://github.com/alibaba/easyexcel): A quick and easy Java processing Excel tool to avoid OOM. However, this project is no longer maintained and has been migrated to [FastExcel](https://github.com/fast-excel/fastexcel).
- [Excel Spring Boot Starter](https://github.com/pig-mesh/excel-spring-boot-starter): Spring Boot Starter based on FastExcel, used to simplify Excel read and write operations.
- [Excel Streaming Reader](https://github.com/monitorjbl/excel-streaming-reader): Excel streaming code style reading tool (only supports reading XLSX files), based on Apache POI encapsulation, while retaining the syntax of the standard POI API.
- [MyExcel](https://github.com/liaochong/myexcel): A toolkit that integrates multiple functions such as importing, exporting, and encrypting Excel.

### Word

- [poi-tl](https://github.com/Sayi/poi-tl): Word template engine based on Apache POI, which can generate Word documents based on Word templates and data, what you see is what you get!

### JSON

- [JsonPath](https://github.com/json-path/JsonPath): Tool library for processing JSON data.

### PDF

For simple PDF creation needs, OpenPDF is a good choice. It is open source and free, and its API is simple and easy to use. For complex scenarios that require operations such as parsing, converting, and extracting text, choose Apache PDFBox. Of course, if you don’t mind the LGPL license for complex scenarios, you can also choose iText.

- [x-easypdf](https://gitee.com/dromara/x-easypdf): A framework for building PDF using building blocks (based on pdfbox/fop), supports PDF export and editing, and is suitable for simple PDF document generation scenarios.
- [iText](https://github.com/itext/itext7): A Java library for creating, editing, and enhancing PDF documents. iText 7 Community Edition adopts AGPL license. If your project is a closed-source commercial project, you need to purchase a commercial license. iText 5 is still LGPL licensed and free for commercial use, but maintenance has ceased.
- [OpenPDF](https://github.com/LibrePDF/OpenPDF): Completely open source and free (LGPL/MPL dual license), based on a fork of iText, it can be used as a substitute for iText. It is simple and easy to use, but has fewer functions than iText (which is enough for most scenarios).
- [Apache PDFBox](https://github.com/apache/pdfbox): Completely open source and free (Apache license), powerful, supporting PDF creation, parsing, conversion and text extraction, etc. However, because its functions are too rich, the API design is relatively complex and difficult to learn.
- [FOP](https://xmlgraphics.apache.org/fop/) : Apache FOP is used to convert XSL-FO (Extensible Stylesheet Language Formatting Objects) formatting objects to a variety of output formats, the most common being PDF.

## Image processing

- [Thumbnailator](https://github.com/coobird/thumbnailator): An image processing tool library whose main functions are scaling images, adding watermarks, rotating images, resizing images and cropping areas.
- [Imglib](https://github.com/nackily/imglib): A lightweight JAVA image processing library dedicated to simplifying common processing of images. It mainly provides three parts of capabilities: image collection, image processing (based on Thumbnailator), aggregation and splitting.

## Verification code

- [EasyCaptcha](https://gitee.com/whvse/EasyCaptcha): Java graphical verification code, supports gif, Chinese, arithmetic and other types, and can be used for Java Web, JavaSE and other projects.
- [AJ-Captcha](https://gitee.com/anji-plus/captcha): Behavior verification code (sliding puzzle, click text), front-end and back-end (java) interaction.
- [tianai-captcha](https://gitee.com/tianai/tianai-captcha): A beautiful and easy-to-use slider verification code.

## SMS & Email

- [SMS4J](https://github.com/dromara/SMS4J): SMS aggregation framework, solving the cumbersome process of accessing multiple SMS SDKs.
- [Simple Java Mail](https://github.com/bbottema/simple-java-mail): The simplest Java lightweight mail library, capable of sending complex emails.

## Online payment

- [Jeepay](https://gitee.com/jeequan/jeepay): An open source payment system suitable for use by Internet companies. It has implemented interfaces such as transactions, refunds, transfers, and account splits, and supports interfaces for service providers' special merchants and ordinary merchants. It has been connected to the official interfaces of WeChat, Alipay, and UnionPay QuickPass, and supports aggregate code payment.
- [YunGouOS-PAY-SDK](https://gitee.com/YunGouOS/YunGouOS-PAY-SDK): YunGouOS WeChat payment interface, WeChat official personal payment interface, non-QR code collection, non-fourth party clearing. Individual users can submit information to open WeChat payment merchants and complete the connection.- [IJPay](https://gitee.com/javen205/IJPay): Aggregated payment, IJPay makes payment at your fingertips, encapsulating common payment methods such as WeChat payment, QQ payment, Alipay payment, JD payment, UnionPay payment, PayPal payment, and various commonly used interfaces.

## Others

- [oshi](https://github.com/oshi/oshi "oshi"): A JNA-based (native) operating system and hardware repository for the Java language.
- [ip2region](https://github.com/lionsoul2014/ip2region): The most free ip address query library, ip to region mapping library, providing three query algorithms: Binary, B-tree and pure memory. Mom no longer has to worry about my ip address location.
- [agrona](https://github.com/real-logic/agrona): Java high-performance data structures (`Buffers`, `Lists`, `Maps`, `Scalable Timer Wheel`…) and utility methods.