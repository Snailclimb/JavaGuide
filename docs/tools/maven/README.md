---
title: Maven 专题：POM、坐标、仓库、依赖管理、生命周期、插件与多模块项目
description: Maven 面试与项目构建学习路线，涵盖 POM、坐标、仓库、依赖范围、生命周期、插件、多模块项目和最佳实践，适合 Java 后端开发者。
category: 开发工具
tag:
  - Maven
  - 项目构建
  - 依赖管理
sitemap:
  changefreq: weekly
  priority: 0.85
head:
  - - meta
    - name: keywords
      content: Maven,POM,Maven坐标,Maven仓库,依赖管理,依赖范围,Maven生命周期,Maven插件,多模块项目,Java项目构建
---

Maven 是 Java 后端项目中最常见的构建和依赖管理工具。学习 Maven 时，不要只会复制 `pom.xml`，还要理解坐标、仓库、依赖传递、生命周期、插件和多模块管理这些基础概念。

## 适合谁看

- 正在学习 Java 项目构建和依赖管理的同学。
- 使用 Maven 写项目，但遇到依赖冲突、版本不统一、多模块管理时容易卡住的开发者。
- 准备面试，需要讲清 Maven 核心概念和最佳实践的读者。
- 需要维护 Spring Boot、微服务或多模块 Java 项目的工程师。

## 学习重点

- POM 是 Maven 项目的核心配置，坐标用于唯一标识一个构件。
- Maven 仓库分为本地仓库、私服仓库和中央仓库，依赖解析会按一定顺序查找。
- 依赖范围、依赖传递、依赖排除和版本管理决定项目最终使用哪些 Jar 包。
- 生命周期定义构建阶段，插件负责真正执行编译、测试、打包等任务。
- 多模块项目要重点关注父 POM、`dependencyManagement`、`pluginManagement` 和模块边界。

## 建议阅读顺序

1. [Maven 核心概念总结](./maven-core-concepts.md)：先理解 POM、坐标、仓库、依赖、生命周期、插件和多模块项目。
2. [Maven 最佳实践](./maven-best-practices.md)：再学习标准目录结构、编译插件、依赖版本管理、多模块管理和常见实践。
3. 结合一个 Spring Boot 项目查看 `pom.xml`：重点看父工程、依赖范围、插件配置和最终依赖树。

## 核心文章

- [Maven 核心概念总结](./maven-core-concepts.md)：系统介绍 Maven 的定位、POM、坐标、仓库、依赖、生命周期、插件和多模块项目。
- [Maven 最佳实践](./maven-best-practices.md)：整理标准目录结构、编译器插件、依赖版本统一、多模块管理和日常使用建议。

## 高频问题

- Maven 是什么？它主要解决哪些问题？
- POM、groupId、artifactId、version 分别是什么？
- 本地仓库、私服仓库、中央仓库有什么区别？
- Maven 依赖传递是什么？依赖冲突如何排查？
- `dependencyManagement` 和 `dependencies` 有什么区别？
- Maven 生命周期和插件是什么关系？
- `compile`、`provided`、`runtime`、`test` 等依赖范围有什么区别？
- 多模块项目为什么通常需要父 POM？

## 相关专题

- [开发工具知识体系](../)
- [Gradle 核心概念总结](../gradle/gradle-core-concepts.md)
- [Git 专题](../git/)
- [Java 基础](../../java/basis/java-basic-questions-01.md)

<!-- @include: @article-footer.snippet.md -->
