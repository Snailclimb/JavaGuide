---
title: 开发工具知识体系：Maven、Gradle、Git、GitHub、Docker 与 IDEA
description: 后端开发工具学习路线，涵盖 Maven、Gradle、Git、GitHub、Docker、IDEA、项目构建、依赖管理、版本控制、代码协作和容器化部署。
category: 开发工具
tag:
  - 开发工具
  - Maven
  - Git
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: 开发工具,Maven,Gradle,Git,GitHub,Docker,IDEA,依赖管理,项目构建,版本控制,容器化部署,后端开发
---

<!-- @include: @small-advertisement.snippet.md -->

这份 **开发工具知识体系** 面向后端学习和日常开发，围绕“项目构建 -> 依赖管理 -> 版本控制 -> 协作提效 -> 容器化交付”的顺序整理本站开发工具相关文章。

开发工具不只是会敲几个命令，更重要的是理解它们在团队协作、工程规范、环境一致性和交付效率中的作用。

## 适合谁看

- 正在学习后端开发，需要补齐常用工程工具的同学。
- 准备校招、社招，想把 Maven、Git、Docker 等工具问题答得更扎实的读者。
- 已经能写业务代码，但对依赖冲突、Git 分支协作、Docker 镜像和容器管理不够熟的开发者。
- 想提升项目构建、代码协作、环境交付和日常开发效率的工程师。

## 学习重点

- Maven 和 Gradle 解决的是项目构建、依赖管理、生命周期和插件扩展问题。
- Git 是团队协作的基础能力，重点不是背命令，而是理解工作区、暂存区、提交、分支、合并和冲突处理。
- GitHub 不只是代码托管平台，也承载开源协作、个人展示、代码阅读和项目管理。
- Docker 主要解决环境一致性、部署隔离、镜像分发和本地快速搭建依赖服务的问题。
- 工具类知识最好结合真实项目练习，单独看概念容易会看不会用。

## 建议阅读顺序

1. [Git 核心概念总结](./git/git-intro.md)：先掌握版本控制、提交、分支、合并和协作流程。
2. [Maven 核心概念总结](./maven/maven-core-concepts.md)：理解 Java 项目构建、POM、坐标、仓库、依赖和生命周期。
3. [Maven 最佳实践](./maven/maven-best-practices.md)：补齐依赖版本管理、多模块项目和日常使用规范。
4. [Docker 核心概念总结](./docker/docker-intro.md)：建立镜像、容器、仓库和 Docker 引擎的基本认知。
5. [Docker 实战](./docker/docker-in-action.md)：通过命令和场景练习容器管理、镜像构建和服务部署。
6. [Gradle 核心概念总结](./gradle/gradle-core-concepts.md) 和 [GitHub 实用小技巧总结](./git/github-tips.md)：按项目需要补充 Gradle 与 GitHub 使用技巧。

## 核心文章

### 项目构建与依赖管理

- [Maven 专题](./maven/)：讲清 Maven 核心概念和最佳实践，是 Java 后端项目构建最常用的工具专题。
- [Maven 核心概念总结](./maven/maven-core-concepts.md)：理解 POM、坐标、仓库、依赖范围、生命周期、插件和多模块项目。
- [Maven 最佳实践](./maven/maven-best-practices.md)：整理标准目录结构、编译插件、依赖管理、多模块管理和常用实践建议。
- [Gradle 核心概念总结](./gradle/gradle-core-concepts.md)：了解 Gradle、Groovy、Gradle Wrapper、插件和 Task 等核心概念。

### 版本控制与代码协作

- [Git 专题](./git/)：围绕 Git 核心概念、工作流和 GitHub 提效技巧展开。
- [Git 核心概念总结](./git/git-intro.md)：理解版本控制、工作区、暂存区、提交、分支、合并、冲突和远程仓库。
- [GitHub 实用小技巧总结](./git/github-tips.md)：整理个人主页、项目徽章、代码阅读、搜索和开源协作相关技巧。

### 容器化与本地环境

- [Docker 专题](./docker/)：从核心概念到实战操作，帮助理解容器化交付和环境一致性。
- [Docker 核心概念总结](./docker/docker-intro.md)：理解容器、镜像、仓库、Docker 引擎以及容器和虚拟机的区别。
- [Docker 实战](./docker/docker-in-action.md)：通过镜像、容器、网络、数据卷和常见命令完成 Docker 入门实践。

### IDE 与效率工具

- [IDEA 教程](https://gitee.com/SnailClimb/awesome-idea-tutorial)：整理 IntelliJ IDEA 常用配置、插件、快捷键和提效技巧。

## 高频问题

- Maven 的 POM、坐标、仓库、依赖范围分别是什么？
- Maven 生命周期和插件是什么关系？
- Maven 多模块项目如何管理公共依赖版本？
- Gradle 和 Maven 有什么区别？什么时候需要了解 Gradle？
- Git 工作区、暂存区、本地仓库和远程仓库分别是什么？
- Git merge 和 rebase 有什么区别？冲突应该如何处理？
- GitHub 除了托管代码，还能帮助开发者做哪些事？
- Docker 镜像和容器是什么关系？容器和虚拟机有什么区别？
- Docker 为什么能解决开发、测试、部署环境不一致的问题？

## 相关专题

- [面试准备](../interview-preparation/)
- [Java 基础](../java/basis/java-basic-questions-01.md)
- [Spring&Spring Boot](../system-design/framework/spring/)
- [开源项目](../open-source-project/)

<!-- @include: @article-footer.snippet.md -->
