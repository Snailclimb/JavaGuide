---
title: Maven Best Practices
category: development tools
head:
  - - meta
    - name: keywords
      content: Maven coordinates, Maven warehouse, Maven life cycle, Maven multi-module management
  - - meta
    - name: description
      content: Maven is a widely used Java project build automation tool. It simplifies the build process and helps manage dependencies, making developers' lives easier. In this blog post, we will discuss some best practices, tips, and tricks to optimize our use of Maven in our projects and improve our development experience.
---

> This article was translated and improved by JavaGuide, original address: <https://medium.com/@AlexanderObregon/maven-best-practices-tips-and-tricks-for-java-developers-438eca03f72b>.

Maven is a widely used Java project build automation tool. It simplifies the build process and helps manage dependencies, making developers' lives easier. For a detailed introduction to Maven, please refer to this article I wrote [Summary of Maven Core Concepts](./maven-core-concepts.md).

This article will not involve an introduction to Maven concepts, but will mainly discuss some best practices, suggestions, and techniques to optimize our use of Maven in projects and improve our development experience.

## Maven standard directory structure

Maven follows a standard directory structure to maintain consistency between projects. Following this structure makes it easier for other developers to understand our project.

The standard directory structure of a Maven project is as follows:

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

- `src/main/java`: source code directory
- `src/main/resources`: resource file directory
- `src/test/java`: test code directory
- `src/test/resources`: test resource file directory

This is just the simplest example of a Maven project directory. In actual projects, we will also make further subdivisions based on project specifications.

## Specify Maven compiler plugin

By default, Maven compiles our project using Java5. To use a different JDK version, configure the Maven compiler plugin in the `pom.xml` file.

For example, if you want to compile your project using Java 8, you can add the following code snippet under the `<build>` tag:

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

In this way, Maven will use the Java8 compiler to compile your project. If you want to use another version of the JDK, you only need to modify the values ​​​​of the `<source>` and `<target>` tags. For example, if you want to use Java11, you can change their value to 11.

## Effectively manage dependencies

Maven's dependency management system is one of its most powerful features. In the top-level pom file, define common dependencies through the tag `dependencyManagement`, which helps avoid conflicts and ensure that all modules use the same version of the dependency.

For example, let's say we have a parent module and two child modules A and B, and we want to use JUnit 5.7.2 as a testing framework in all modules. We can use the `<dependencyManagement>` tag in the `pom.xml` file of the parent module to define the JUnit version:

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

In the `pom.xml` files of submodules A and B, we only need to reference JUnit's `groupId` and `artifactId`:

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
  </dependency>
</dependencies>
```

## Use configuration files for different environments

Maven configuration files allow us to configure build settings for different environments, such as development, testing, and production. Define configuration files in the `pom.xml` file and activate them using command line parameters:

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

Activate the profile using the command line:

```bash
mvn clean install -P production
```

## Keep pom.xml clean and organized

A well-organized `pom.xml` file is easier to maintain and understand. Here are some tips for maintaining a clean `pom.xml`:

- Group similar dependencies and plugins together.
- Use comments to describe the purpose of a specific dependency or plugin.
- Keep version numbers of plugins and dependencies within `<properties>` tags for easier management.

```xml
<properties>
  <junit.version>5.7.0</junit.version>
  <mockito.version>3.9.0</mockito.version>
</properties>
```

## Using Maven Wrapper

Maven Wrapper is a tool for managing and using Maven, which allows running and building Maven projects without pre-installing Maven.

The official Maven documentation introduces Maven Wrapper like this:

> The Maven Wrapper is an easy way to ensure a user of your Maven build has everything necessary to run your Maven build.
>
> Maven Wrapper is a simple way to ensure that users of Maven builds have everything they need to run their Maven builds.

Maven Wrapper can ensure that the correct Maven version is used during the build process, which is very convenient. To use Maven Wrapper, run the following command in the project directory:

```bash
mvn wrapper:wrapper
```

This command will generate the Maven Wrapper file in our project. Now we can use `./mvnw` (or `./mvnw.cmd` on Windows) instead of `mvn` to execute Maven commands.

## Build automation through continuous integration

Integrating Maven projects with a continuous integration (CI) system such as Jenkins or GitHub Actions ensures that our code is built, tested, and deployed automatically. CI helps identify issues early and provides a consistent build process across the team. Here is a simple GitHub Actions workflow example for a Maven project:

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
      run: ./mvnw clean install```

## Leverage Maven plugins for additional functionality

There are many Maven plugins available to extend the functionality of Maven. Some popular plug-ins include (the first three are plug-ins that come with Maven, and the last three are plug-ins provided by third parties):

- maven-surefire-plugin: Configure and execute unit tests.
- maven-failsafe-plugin: Configure and execute integration tests.
- maven-javadoc-plugin: Generate project documentation in Javadoc format.
- maven-checkstyle-plugin: Enforce coding standards and best practices.
- jacoco-maven-plugin: Single test coverage.
- sonar-maven-plugin: analyze code quality.
-…

jacoco-maven-plugin usage example:

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

If these existing plug-ins cannot meet our needs, we can also customize plug-ins.

Explore the available plugins and configure them in the `pom.xml` file to enhance our development process.

## Summary

Maven is a powerful tool that simplifies the build process and dependency management of Java projects. By following these best practices and tips, we can optimize our use of Maven and improve our Java development experience. Remember to use a standard directory structure, manage dependencies efficiently, leverage configuration files for different environments, and integrate your project with a continuous integration system to ensure consistent builds.