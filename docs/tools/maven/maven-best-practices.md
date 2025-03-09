---
title: Maven最佳实践
category: 开发工具
head:
  - - meta
    - name: keywords
      content: Maven坐标,Maven仓库,Maven生命周期,Maven多模块管理
  - - meta
    - name: description
      content: Maven 是一种广泛使用的 Java 项目构建自动化工具。它简化了构建过程并帮助管理依赖关系，使开发人员的工作更轻松。在这篇博文中，我们将讨论一些最佳实践、提示和技巧，以优化我们在项目中对 Maven 的使用并改善我们的开发体验。
---

> 本文由 JavaGuide 翻译并完善，原文地址：<https://medium.com/@AlexanderObregon/maven-best-practices-tips-and-tricks-for-java-developers-438eca03f72b> 。

Maven 是一种广泛使用的 Java 项目构建自动化工具。它简化了构建过程并帮助管理依赖关系，使开发人员的工作更轻松。Maven 详细介绍可以参考我写的这篇 [Maven 核心概念总结](./maven-core-concepts.md) 。

这篇文章不会涉及到 Maven 概念的介绍，主要讨论一些最佳实践、建议和技巧，以优化我们在项目中对 Maven 的使用并改善我们的开发体验。

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

## 指定 Maven 编译器插件

默认情况下，Maven 使用 Java5 编译我们的项目。要使用不同的 JDK 版本，请在 `pom.xml` 文件中配置 Maven 编译器插件。

例如，如果你想要使用 Java8 来编译你的项目，你可以在`<build>`标签下添加以下的代码片段：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.8.1</version>
      <configuration>
        <source>1.8</source>
        <target>1.8</target>
      </configuration>
    </plugin>
  </plugins>
</build>
```

这样，Maven 就会使用 Java8 的编译器来编译你的项目。如果你想要使用其他版本的 JDK，你只需要修改`<source>`和`<target>`标签的值即可。例如，如果你想要使用 Java11，你可以将它们的值改为 11。

## 有效管理依赖关系

Maven 的依赖管理系统是其最强大的功能之一。在顶层 pom 文件中，通过标签 `dependencyManagement` 定义公共的依赖关系，这有助于避免冲突并确保所有模块使用相同版本的依赖项。

例如，假设我们有一个父模块和两个子模块 A 和 B，我们想要在所有模块中使用 JUnit 5.7.2 作为测试框架。我们可以在父模块的`pom.xml`文件中使用`<dependencyManagement>`标签来定义 JUnit 的版本：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.7.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

在子模块 A 和 B 的 `pom.xml` 文件中，我们只需要引用 JUnit 的 `groupId` 和 `artifactId` 即可:

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
  </dependency>
</dependencies>
```

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
- 将插件和依赖项的版本号保留在 `<properties>` 标签内以便于管理。

```xml
<properties>
  <junit.version>5.7.0</junit.version>
  <mockito.version>3.9.0</mockito.version>
</properties>
```

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

## 通过持续集成实现构建自动化

将 Maven 项目与持续集成 (CI) 系统（例如 Jenkins 或 GitHub Actions）集成，可确保自动构建、测试和部署我们的代码。CI 有助于及早发现问题并在整个团队中提供一致的构建流程。以下是 Maven 项目的简单 GitHub Actions 工作流程示例：

```groovy
name: Java CI with Maven

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'

    - name: Build with Maven
      run: ./mvnw clean install
```

## 利用 Maven 插件获得附加功能

有许多 Maven 插件可用于扩展 Maven 的功能。一些流行的插件包括（前三个是 Maven 自带的插件，后三个是第三方提供的插件）：

- maven-surefire-plugin：配置并执行单元测试。
- maven-failsafe-plugin：配置并执行集成测试。
- maven-javadoc-plugin：生成 Javadoc 格式的项目文档。
- maven-checkstyle-plugin：强制执行编码标准和最佳实践。
- jacoco-maven-plugin: 单测覆盖率。
- sonar-maven-plugin：分析代码质量。
- ……

jacoco-maven-plugin 使用示例：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.8</version>
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

Maven 是一个强大的工具，可以简化 Java 项目的构建过程和依赖关系管理。通过遵循这些最佳实践和技巧，我们可以优化 Maven 的使用并改善我们的 Java 开发体验。请记住使用标准目录结构，有效管理依赖关系，利用不同环境的配置文件，并将项目与持续集成系统集成，以确保构建一致。
