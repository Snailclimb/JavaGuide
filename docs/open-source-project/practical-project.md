---
title: Java 优质开源实战项目
description: Java优质开源实战项目推荐，涵盖快速开发平台、电商系统、权限管理等可用于学习和简历的实战项目精选。
category: 开源项目
icon: "mdi:projector-screen-outline"
---

实战项目适合用来观察业务建模、权限控制、数据访问、测试和部署方式。准备写进简历前，至少要完成本地运行、读懂一条核心业务链路，并做过可以解释的改造。

## 官方示例项目

- [Spring Petclinic](https://github.com/spring-projects/spring-petclinic)：Spring 官方维护的示例应用，业务规模不大，但 Web、数据访问、校验和测试的边界比较清楚，适合第一次完整阅读 Spring 应用。

## AI

- [interview-guide](https://github.com/Snailclimb/interview-guide)：基于 Spring Boot 4.0、Java 21、Spring AI、PostgreSQL、pgvector、RustFS 和 Redis，实现简历分析、AI 模拟面试、知识库 RAG 检索等功能。
- [PaiAgent](https://github.com/itwanger/PaiAgent)：AI 工作流可视化编排平台，可通过拖拽组合模型和处理节点，适合学习工作流定义、任务调度和多模型接入。

## 快速开发平台

- [Snowy](https://gitee.com/xiaonuobase/snowy)：支持国密算法、前后端分离和插件化扩展的快速开发平台。
- [RuoYi](https://gitee.com/y_project/RuoYi)：基于 Spring Boot 的权限管理系统，包含用户、角色、菜单、部门和字典等常见后台功能，可直接运行。
- [EuBackend](https://gitee.com/zhaoeryu/eu-backend)：基于 Spring Boot 开发的轻量级快速开发平台。
- [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro)：RuoYi-Vue 全新 Pro 版本，优化重构所有功能，支持数据权限、SaaS 多租户、Flowable 工作流、三方登录、支付等功能。
- [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus)：RuoYi-Vue 全新 Plus 版本，重写了 RuoYi-Vue 所有功能，集成了 Sa-Token、Mybatis-Plus、Jackson、SpringDoc、Hutool、OSS 定期同步等。
- [pig](https://gitee.com/log4j/pig "pig")：基于 Spring Boot + Spring Cloud + OAuth2 的 RBAC 权限管理系统。
- [Guns](https://gitee.com/stylefeng/guns)：现代化的 Java 应用开发基础框架。
- [JeecgBoot](https://github.com/zhangdaiscott/jeecg-boot)：一款基于代码生成器的 J2EE 低代码快速开发平台，支持生成前后端分离架构的项目。
- [Erupt](https://gitee.com/erupt/erupt)：低代码全栈框架，通过 Java 注解动态生成页面以及增删改查、权限控制等后台功能。
- [BallCat](https://github.com/ballcat-projects/ballcat)：快速开发脚手架，除权限管理和定时任务外，还支持 XSS 过滤、SQL 防注入和数据脱敏等功能。
- [JHipster](https://github.com/jhipster/generator-jhipster)：应用生成平台，可创建 Spring Boot 与 Angular、React 等前端框架组合的项目。

## 博客/论坛系统

- [paicoding](https://github.com/itwanger/paicoding)：一款好用又强大的开源社区，基于 Spring Boot 系列主流技术栈，附详细的教程。
- [Halo](https://github.com/halo-dev/halo)：一款开源建站工具，可用于搭建博客、知识库和企业网站。适合关注插件机制、内容管理和主题扩展的读者。

## Wiki/文档系统

- [kkFileView](https://gitee.com/kekingcn/file-online-preview)：文档在线预览解决方案，支持几乎所有主流文档格式预览，例如 doc、docx、ppt、pptx、wps、xls、xlsx、zip、rar、ofd、xmind、bpmn 、eml 、epub、3ds、dwg、psd 、mp4、mp3 等等。

## 文件管理系统/网盘

- [free-fs](https://gitee.com/dh_free/free-fs)：基于 Spring Boot、MyBatis-Plus、MySQL、Sa-Token 和 Layui 的云存储管理系统，可对接七牛云和阿里云 OSS，支持上传、下载、预览、移动、重命名和权限控制等功能。
- [zfile](https://github.com/zfile-dev/zfile)：基于 Spring Boot + Vue 实现的在线网盘，支持对接 S3、OneDrive、SharePoint、Google Drive、多吉云、又拍云、本地存储、FTP、SFTP 等存储源，支持在线浏览图片、播放音视频，文本文件、Office、obj（3d）等文件类型。

## 考试/刷题系统

- [PlayEdu](https://github.com/PlayEdu/PlayEdu)：一款适用于搭建内部培训平台的开源系统，旨在为企业/机构打造自己品牌的内部培训平台。
- [uexam](https://gitee.com/mindskip/uexam)：在线考试系统，包含题库、试卷、考试、批改和用户管理等功能。

## 商城系统

商城项目的业务链路和依赖较多。如果还没有独立完成过 Spring Boot 项目，建议先从规模更小的示例开始，不要直接把下面的项目当作毕业设计模板。

- [mall](https://github.com/macrozheng/mall "mall")：包含前台商城和后台管理系统的电商项目，后端以 Spring Boot 和 MyBatis 为主。
- [mall-swarm](https://github.com/macrozheng/mall-swarm "mall-swarm")：微服务商城系统，技术栈以 Spring Cloud Greenwich、Spring Boot 2、MyBatis、Docker 和 Elasticsearch 为主。阅读既有系统有参考价值，新项目选型前要评估框架版本和安全更新。

## 售票系统

- [大麦](https://gitee.com/java-up-up/damai)：演唱会购票实战项目，重点展示高并发抢票场景下的库存、限流和订单处理方案。

## 行业应用

- [DataEase](https://github.com/dataease/dataease)：开源 BI 与数据可视化平台，适合学习数据源接入、权限管理、图表配置和仪表板等功能的工程实现。
- [ThingsBoard](https://github.com/thingsboard/thingsboard)：开源物联网平台，覆盖设备管理、数据采集、规则处理和可视化。项目体量较大，更适合有 Spring 和消息系统基础后阅读。
- [Apache Fineract](https://github.com/apache/fineract)：可扩展的开源核心银行平台，包含账户、贷款、交易等金融领域模型。业务规则复杂，适合学习领域建模，不适合作为 Java 入门项目。
- [Jeepay](https://gitee.com/jeequan/jeepay)：开源支付系统，覆盖交易、退款、转账和分账等接口，并对接微信、支付宝、云闪付等渠道。支付项目涉及资金与合规要求，更适合学习业务建模和接口设计，不应未经安全审计直接用于生产。

## 造轮子

- [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework)：基于 Netty、Kryo 和 ZooKeeper 实现的 RPC 框架，附有实现过程和配套教程。
- [mini-spring](https://github.com/DerekYRC/mini-spring)：简化版的 Spring 框架，能帮助你快速熟悉 Spring 源码和掌握 Spring 的核心原理。代码极度简化，保留了 Spring 的核心功能，如 IoC 和 AOP、资源加载器等核心功能。
- [mini-spring-cloud](https://github.com/DerekYRC/mini-spring-cloud)：手写的简化版 Spring Cloud，用于理解服务注册、配置和调用等核心原理。相关阅读：[手写一个简化版的 Spring Cloud！](https://mp.weixin.qq.com/s/v3FUp-keswE2EhcTaLpSMQ)。
