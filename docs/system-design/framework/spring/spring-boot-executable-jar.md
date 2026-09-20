---
title: Spring Boot 的 JAR 为什么可以直接运行？
description: 从 java -jar、Main-Class、Start-Class、BOOT-INF 和 Spring Boot Loader 解释可执行 JAR 的打包与启动机制，并区分内嵌容器和自动配置的职责。
category: 框架
tag:
  - Spring Boot
  - Java
head:
  - - meta
    - name: keywords
      content: Spring Boot,可执行JAR,java -jar,JarLauncher,Main-Class,Start-Class,BOOT-INF,repackage
---

**Spring Boot 可执行 JAR 的关键是清单中的启动入口，以及能够加载嵌套依赖的 Boot Loader。** 内嵌 Tomcat 负责提供 HTTP 服务，是 Web 应用启动后的一个组成部分；没有 Web 容器的命令行应用同样可以打包运行。

## 普通 JAR 也能通过 java -jar 运行吗？

可以。JAR 是归档格式，不是 Spring Boot 专用格式。使用 `java -jar app.jar` 时，Java 启动器读取 `META-INF/MANIFEST.MF` 中的 `Main-Class`，再调用相应入口。普通应用只要提供符合目标 JDK 要求的入口，并使依赖可加载，也可以这样启动。详见 [Java 17 的 java 命令文档](https://docs.oracle.com/en/java/javase/17/docs/specs/man/java.html)。

Boot 额外解决的是依赖如何随应用一起分发、如何从外层 JAR 里加载的问题。标准 Java 类加载机制不会自动递归加载一个 JAR 内部的其他 JAR，单纯把依赖文件复制进压缩包并不够。

## Boot 可执行 JAR 里有什么？

下面是常见的 Boot Loader 布局，省略了部分文件：

```text
app.jar
├── META-INF/MANIFEST.MF
├── org/springframework/boot/loader/...
└── BOOT-INF/
    ├── classes/
    │   ├── com/example/Application.class
    │   ├── application.yml
    │   └── static/...
    └── lib/
        ├── spring-context-*.jar
        └── other-dependency-*.jar
```

应用类和类路径资源位于 `BOOT-INF/classes/`，依赖仍以独立 JAR 的形式放在 `BOOT-INF/lib/`，Loader 类放在外层 JAR 可直接加载的位置。依赖没有被全部展开、合并成一套类文件，这与常见的 shaded JAR 做法不同。详见 [Spring Boot 嵌套 JAR 规范](https://docs.spring.io/spring-boot/specification/executable-jar/nested-jars.html)。

## Main-Class 和 Start-Class 有什么区别？

使用 Spring Boot 3.2 默认引入的新 Loader 时，清单中的两个字段类似这样：

```text
Main-Class: org.springframework.boot.loader.launch.JarLauncher
Start-Class: com.example.Application
```

- **Main-Class**：Java 启动器首先调用的引导类。
- **Start-Class**：Boot Launcher 最终要调用的应用主类。

旧版 Loader 常见的入口是 `org.springframework.boot.loader.JarLauncher`，没有中间的 `launch` 包。Spring Boot 3.2 重写了 Loader，并调整了默认入口类名；排查时应以实际构建产物的清单为准。详见 [Spring Boot 3.2 发布说明](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.2-Release-Notes)。

`Start-Class` 是 Boot 使用的元数据，不是 Java 启动器自动识别的应用入口。`@SpringBootApplication` 也不能代替清单中的入口配置。

## 从 java -jar 到应用启动经历了什么？

1. Java 启动器读取 `Main-Class`，执行 `JarLauncher`。
2. Launcher 按 Boot 布局组织应用类和嵌套依赖的加载路径，创建相应的类加载器。
3. Launcher 读取 `Start-Class`，加载应用主类并调用它的 `main` 方法。
4. 应用主类通常调用 `SpringApplication.run(...)`，创建应用上下文，进行 Bean 注册和自动配置。
5. 如果应用满足 Web 应用及相应服务器的配置条件，再创建、启动内嵌服务器。

因此，`JarLauncher` 是引导类，并不等同于类加载器；自动配置和 Web 服务器也不是 JVM 识别可执行 JAR 的原因。入口机制见 [Launching Executable Jars](https://docs.spring.io/spring-boot/specification/executable-jar/launching.html)，自动配置细节见 [Spring Boot 自动装配原理](./spring-boot-auto-assembly-principles.md)。

Boot Loader 可以按外层归档中的位置读取嵌套条目，通常不需要先把整个 JAR 解压到磁盘，也不需要一次把所有依赖读入内存。某些依赖需要解包时属于额外适配，不能概括为“Boot 启动就是先解压所有 JAR”。详见 [NestedJarFile 说明](https://docs.spring.io/spring-boot/specification/executable-jar/jarfile-class.html)。

## 如何确认打包结果是可执行 JAR？

Maven 项目一般由 `spring-boot-maven-plugin` 的 `repackage` 目标重新组织普通 JAR。使用 `spring-boot-starter-parent` 时，相关执行已预配置，但仍需声明插件；只导入依赖 BOM 并不会自动绑定该打包目标。Gradle 项目则使用 Spring Boot 插件提供的 `bootJar` 任务。

例如，在已经正确配置 Maven 插件的项目中构建，然后检查实际产物：

```bash
mvn package
jar tf target/app.jar
unzip -p target/app.jar META-INF/MANIFEST.MF
java -jar target/app.jar
```

这里的 `app.jar` 要替换为项目实际生成的文件名。Maven 插件默认可能保留 `.original` 原始归档，Gradle 项目也可能同时生成普通 JAR；部署前要确认选中了 Boot 重打包后的产物。打包行为可参考 [Maven 插件文档](https://docs.spring.io/spring-boot/maven-plugin/packaging.html) 和 [Gradle 插件文档](https://docs.spring.io/spring-boot/gradle-plugin/packaging.html)。

遇到启动失败，可以沿同一条路径检查：

| 现象                         | 优先检查                                       |
| ---------------------------- | ---------------------------------------------- |
| 缺少 main manifest attribute | 是否运行了普通 JAR，是否执行过重打包           |
| 找不到 JarLauncher           | 清单里的类名是否与实际 Loader 版本、包内容一致 |
| 找不到应用类或依赖类         | `Start-Class`、应用目录和运行依赖是否正确打包  |
| 应用启动但没有 HTTP 端口     | 是否为 Web 应用，是否引入并启用了对应服务器    |
| UnsupportedClassVersionError | 运行时 JDK 是否低于类文件要求的版本            |

可执行 JAR 打包了应用及所包含的 Java 依赖，仍需要兼容的 Java 运行时；数据库、外部配置、操作系统原生库等环境依赖也不会因此自动消失。

<!-- @include: @article-footer.snippet.md -->
