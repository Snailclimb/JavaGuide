---
title: Maven 最佳实践
description: 总结 Maven 在 Java 项目中的常见最佳实践，涵盖标准目录结构、编译版本、依赖管理、Profile、Maven Wrapper、CI 构建和插件使用。
category: 开发工具
head:
  - - meta
    - name: keywords
      content: Maven坐标,Maven仓库,Maven生命周期,Maven多模块管理,Maven Wrapper,依赖管理
---

> 本文由 JavaGuide 翻译并完善，原文地址：<https://medium.com/@AlexanderObregon/maven-best-practices-tips-and-tricks-for-java-developers-438eca03f72b> 。

Maven 是一种广泛使用的 Java 项目构建自动化工具。它简化了构建过程，并帮助我们管理依赖关系。Maven 详细介绍可以参考这篇文章：[Maven 核心概念总结](./maven-core-concepts.md)。

这篇文章不展开 Maven 基础概念，主要讨论项目中更容易踩坑的实践问题：目录结构、编译版本、依赖版本、环境配置、Wrapper、CI 和插件管理。

## Maven 标准目录结构

Maven 遵循标准目录结构来保持项目之间的一致性。遵循这种结构可以让其他开发人员更轻松地理解我们的项目。

Maven 项目的标准目录结构如下：

```groovy
src/
  main/
    java/
    resources/
  test/
    java/
    resources/
pom.xml
```

- `src/main/java`：源代码目录
- `src/main/resources`：资源文件目录
- `src/test/java`：测试代码目录
- `src/test/resources`：测试资源文件目录

这只是一个最简单的 Maven 项目目录示例。实际项目中，我们还会根据项目规范去做进一步的细分。

## 明确指定 Java 编译版本

不要依赖 Maven 或插件的默认编译版本，项目应该在 `pom.xml` 中明确声明目标 Java 版本。对于现代 Java 项目，优先使用 `maven.compiler.release`，它对应 `javac --release`，比单独配置 `source` 和 `target` 更稳妥。

需要注意的是，`javac --release` 从 JDK 9 开始提供；Maven Compiler Plugin 3.13.0 及之后版本在 JDK 8 上也支持 `maven.compiler.release`，会自动转换为 `source` 和 `target`。如果项目仍使用更旧的插件或构建环境，再显式配置 `source`、`target`。

例如，项目需要按 Java 17 编译，可以这样写：

```xml
<properties>
  <maven.compiler.release>17</maven.compiler.release>
</properties>
```

如果需要直接配置 Maven Compiler Plugin，也可以这样写：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.15.0</version>
      <configuration>
        <release>17</release>
      </configuration>
    </plugin>
  </plugins>
</build>
```

`release` 的值不要再写成 `1.8` 这种旧格式。比如 Java 8 写 `8`，Java 17 写 `17`，Java 21 写 `21`。

## 有效管理依赖关系

Maven 的依赖管理系统是其最强大的功能之一。在父 POM 中，通过 `dependencyManagement` 定义公共依赖版本，可以避免多个模块各写一份版本号，降低依赖冲突概率。

例如，假设我们有一个父模块和两个子模块 A 和 B，想要在所有模块中使用 JUnit 5，可以在父模块的 `pom.xml` 文件中通过 `<dependencyManagement>` 定义 JUnit 的版本：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

在子模块 A 和 B 的 `pom.xml` 文件中，只需要引用 JUnit 的 `groupId` 和 `artifactId` 即可：

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
  </dependency>
</dependencies>
```

对于 Spring Boot、Spring Cloud 这类已经提供 BOM 的生态，优先导入官方 BOM，再在业务模块里省略具体依赖版本。这样能减少“手工拼版本”带来的兼容性问题。

## 针对不同环境使用配置文件

Maven 配置文件允许我们配置不同环境的构建设置，例如开发、测试和生产。在 `pom.xml` 文件中定义配置文件并使用命令行参数激活它们：

```xml
<profiles>
  <profile>
    <id>development</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    <properties>
      <environment>dev</environment>
    </properties>
  </profile>
  <profile>
    <id>production</id>
    <properties>
      <environment>prod</environment>
    </properties>
  </profile>
</profiles>
```

使用命令行激活配置文件：

```bash
mvn clean install -P production
```

## 保持 pom.xml 干净且井然有序

组织良好的 `pom.xml` 文件更易于维护和理解。以下是维护干净的 `pom.xml` 的一些技巧：

- 将相似的依赖项和插件组合在一起。
- 使用注释来描述特定依赖项或插件的用途。
- 将公共版本号放在 `<properties>` 标签内，或者统一放到父 POM 的 `dependencyManagement` / `pluginManagement` 中管理。

```xml
<properties>
  <junit.version>5.10.2</junit.version>
  <mockito.version>5.12.0</mockito.version>
</properties>
```

插件版本也建议显式声明。不要依赖 Maven 的默认插件版本，否则不同 Maven 版本或不同构建环境下可能出现行为差异。

## 使用 Maven Wrapper

Maven Wrapper 是一个用于管理和使用 Maven 的工具，它允许在没有预先安装 Maven 的情况下运行和构建 Maven 项目。

Maven 官方文档是这样介绍 Maven Wrapper 的：

> The Maven Wrapper is an easy way to ensure a user of your Maven build has everything necessary to run your Maven build.
>
> Maven Wrapper 是一种简单的方法，可以确保 Maven 构建的用户拥有运行 Maven 构建所需的一切。

Maven Wrapper 可以确保构建过程使用正确的 Maven 版本，非常方便。要使用 Maven Wrapper，请在项目目录中运行以下命令：

```bash
mvn wrapper:wrapper
```

此命令会在我们的项目中生成 Maven Wrapper 文件。现在我们可以使用 `./mvnw` （或 Windows 上的 `./mvnw.cmd`）而不是 `mvn` 来执行 Maven 命令。

团队项目建议提交 `mvnw`、`mvnw.cmd` 和 `.mvn/wrapper/` 目录。这样新成员或 CI 环境不需要预先安装指定版本的 Maven，也能用项目声明的 Maven 版本完成构建。

## 通过持续集成实现构建自动化

将 Maven 项目与持续集成 (CI) 系统（例如 Jenkins 或 GitHub Actions）集成，可确保自动构建、测试和部署我们的代码。CI 有助于及早发现问题并在整个团队中提供一致的构建流程。以下是 Maven 项目的简单 GitHub Actions 工作流程示例：

```yaml
name: Java CI with Maven

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: "temurin"
          cache: "maven"

      - name: Build with Maven
        run: ./mvnw -B clean verify
```

CI 中建议使用 `clean verify`，它会执行测试和必要的校验流程。`install` 会把构建产物安装到本地仓库，只有后续步骤确实依赖本地安装结果时才需要使用。

## 利用 Maven 插件获得附加功能

有许多 Maven 插件可用于扩展 Maven 的功能。一些流行的插件包括（前三个是 Maven 自带的插件，后三个是第三方提供的插件）：

- maven-surefire-plugin：配置并执行单元测试。
- maven-failsafe-plugin：配置并执行集成测试。
- maven-javadoc-plugin：生成 Javadoc 格式的项目文档。
- maven-checkstyle-plugin：强制执行编码标准和最佳实践。
- jacoco-maven-plugin：单测覆盖率。
- sonar-maven-plugin：分析代码质量。
- ……

jacoco-maven-plugin 使用示例：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
        <execution>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>generate-code-coverage-report</id>
          <phase>test</phase>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

如果这些已有的插件无法满足我们的需求，我们还可以自定义插件。

探索可用的插件并在 `pom.xml` 文件中配置它们以增强我们的开发过程。

## 总结

Maven 最重要的不是“能不能把项目跑起来”，而是让团队在本地、CI 和部署环境中使用一致的构建方式。实际项目里，建议优先做好这几件事：使用标准目录结构，显式声明 Java 和插件版本，通过父 POM、BOM、`dependencyManagement` 管理依赖版本，提交 Maven Wrapper，并在 CI 中固定 JDK 和 Maven 构建命令。
