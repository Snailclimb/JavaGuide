---
title: Gradle核心概念总结
category: 开发工具
head:
  - - meta
    - name: keywords
      content: Gradle,Groovy,Gradle Wrapper,Gradle 包装器,Gradle 插件
  - - meta
    - name: description
      content: Gradle 就是一个运行在 JVM 上的自动化的项目构建工具，用来帮助我们自动构建项目。
---

> 这部分内容主要根据 Gradle 官方文档整理，做了对应的删减，主要保留比较重要的部分，不涉及实战，主要是一些重要概念的介绍。

Gradle 这部分内容属于可选内容，可以根据自身需求决定是否学习，目前国内还是使用 Maven 普遍一些。

## Gradle 介绍

Gradle 官方文档是这样介绍的 Gradle 的：

> Gradle is an open-source [build automation](https://en.wikipedia.org/wiki/Build_automation) tool flexible enough to build almost any type of software. Gradle makes few assumptions about what you’re trying to build or how to build it. This makes Gradle particularly flexible.
>
> Gradle 是一个开源的构建自动化工具，它足够灵活，可以构建几乎任何类型的软件。Gradle 对你要构建什么或者如何构建它做了很少的假设。这使得 Gradle 特别灵活。

简单来说，Gradle 就是一个运行在 JVM 上的自动化的项目构建工具，用来帮助我们自动构建项目。

对于开发者来说，Gradle 的主要作用主要有 3 个：

1. **项目构建** ：提供标准的、跨平台的自动化项目构建方式。
2. **依赖管理** ：方便快捷的管理项目依赖的资源（jar 包），避免资源间的版本冲突问题。
3. **统一开发结构** ：提供标准的、统一的项目结构。

Gradle 构建脚本是使用 Groovy 或 Kotlin 语言编写的，表达能力非常强，也足够灵活。

## Groovy 介绍

Gradle 是运行在 JVM 上的一个程序，它可以使用 Groovy 来编写构建脚本。

Groovy 是运行在 JVM 上的脚本语言，是基于 Java 扩展的动态语言，它的语法和 Java 非常的相似，可以使用 Java 的类库。Groovy 可以用于面向对象编程，也可以用作纯粹的脚本语言。在语言的设计上它吸纳了 Java 、Python、Ruby 和 Smalltalk 语言的优秀特性，比如动态类型转换、闭包和元编程支持。

我们可以用学习 Java 的方式去学习 Groovy ，学习成本相对来说还是比较低的，即使开发过程中忘记 Groovy 语法，也可以用 Java 语法继续编码。

基于 JVM 的语言有很多种比如 Groovy，Kotlin，Java，Scala，他们最终都会编译生成 Java 字节码文件并在 JVM 上运行。

## Gradle 优势

Gradle 是新一代的构建系统，具有高效和灵活等诸多优势，广泛用于 Java 开发。不仅 Android 将其作为官方构建系统, 越来越多的 Java 项目比如 Spring Boot 也慢慢迁移到 Gradle。

- 在灵活性上，Gradle 支持基于 Groovy 语言编写脚本，侧重于构建过程的灵活性，适合于构建复杂度较高的项目，可以完成非常复杂的构建。
- 在粒度性上，Gradle 构建的粒度细化到了每一个 task 之中。并且它所有的 Task 源码都是开源的，在我们掌握了这一整套打包流程后，我们就可以通过去修改它的 Task 去动态改变其执行流程。
- 在扩展性上，Gradle 支持插件机制，所以我们可以复用这些插件，就如同复用库一样简单方便。

## Gradle Wrapper 介绍

Gradle 官方文档是这样介绍的 Gradle Wrapper 的：

> The recommended way to execute any Gradle build is with the help of the Gradle Wrapper (in short just “Wrapper”). The Wrapper is a script that invokes a declared version of Gradle, downloading it beforehand if necessary. As a result, developers can get up and running with a Gradle project quickly without having to follow manual installation processes saving your company time and money.
>
> 执行 Gradle 构建的推荐方法是借助 Gradle Wrapper(简而言之就是“Wrapper”)。Wrapper 它是一个脚本，调用了已经声明的 Gradle 版本，如果需要的话，可以预先下载它。因此，开发人员可以快速启动并运行 Gradle 项目，而不必遵循手动安装过程，从而为公司节省时间和金钱。

我们可以称 Gradle Wrapper 为 Gradle 包装器，它将 Gradle 再次包装，让所有的 Gradle 构建方法在 Gradle 包装器的帮助下运行。

Gradle Wrapper 的工作流程图如下（图源[Gradle Wrapper 官方文档介绍](https://docs.gradle.org/current/userguide/gradle_wrapper.html)）：

![包装器工作流程](https://oss.javaguide.cn/github/javaguide/csdn/efa7a0006b04051e2b84cd116c6ccdfc.png)

整个流程主要分为下面 3 步：

1. 首先当我们刚创建的时候，如果指定的版本没有被下载，就先会去 Gradle 的服务器中下载对应版本的压缩包；
2. 下载完成后需要先进行解压缩并且执行批处理文件；
3. 后续项目每次构建都会重用这个解压过的 Gradle 版本。

Gradle Wrapper 会给我们带来下面这些好处：

1. 在给定的 Gradle 版本上标准化项目，从而实现更可靠和健壮的构建。
2. 可以让我们的电脑中不安装 Gradle 环境也可以运行 Gradle 项目。
3. 为不同的用户和执行环境（例如 IDE 或持续集成服务器）提供新的 Gradle 版本就像更改 Wrapper 定义一样简单。

### 生成 Gradle Wrapper

如果想要生成 Gradle Wrapper 的话，需要本地配置好 Gradle 环境变量。Gradle 中已经内置了内置了 Wrapper Task，在项目根目录执行执行`gradle wrapper`命令即可帮助我们生成 Gradle Wrapper。

执行命令 `gradle wrapper` 命令时可以指定一些参数来控制 wrapper 的生成。具体有如下两个配置参数：

- `--gradle-version` 用于指定使用的 Gradle 的版本
- `--gradle-distribution-url` 用于指定下载 Gradle 版本的 URL，该值的规则是 `http://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip`

执行`gradle wrapper`命令之后，Gradle Wrapper 就生成完成了，项目根目录中生成如下文件：

```
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
└── gradlew.bat
```

每个文件的含义如下：

- `gradle-wrapper.jar`：包含了 Gradle 运行时的逻辑代码。
- `gradle-wrapper.properties` ： 定义了 Gradle 的版本号和 Gradle 运行时的行为属性。
- `gradlew`：Linux 平台下，用于执行 Gralde 命令的包装器脚本。
- `gradlew.bat`：Windows 平台下，用于执行 Gralde 命令的包装器脚本。

`gradle-wrapper.properties` 文件的内容如下：

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-6.0.1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

- `distributionBase`： Gradle 解包后存储的父目录。
- `distributionPath`： `distributionBase`指定目录的子目录。`distributionBase+distributionPath`就是 Gradle 解包后的存放的具体目录。
- `distributionUrl`： Gradle 指定版本的压缩包下载地址。
- `zipStoreBase`： Gradle 压缩包下载后存储父目录。
- `zipStorePath`： `zipStoreBase`指定目录的子目录。`zipStoreBase+zipStorePath`就是 Gradle 压缩包的存放位置。

### 更新 Gradle Wrapper

更新 Gradle Wrapper 有 2 种方式：

1. 接修改`distributionUrl`字段，然后执行 Gradle 命令。
2. 执行 gradlew 命令`gradlew wrapper –-gradle-version [version]`。

下面的命令会将 Gradle 版本升级为 7.6。

```shell
gradlew wrapper --gradle-version 7.6
```

`gradle-wrapper.properties` 文件中的 `distributionUrl` 属性也发生了改变。

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-all.zip
```

### 自定义 Gradle Wrapper

Gradle 已经内置了 Wrapper Task，因此构建 Gradle Wrapper 会生成 Gradle Wrapper 的属性文件，这个属性文件可以通过自定义 Wrapper Task 来设置。比如我们想要修改要下载的 Gralde 版本为 7.6，可以这么设置：

```javascript
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
}
```

也可以设置 Gradle 发行版压缩包的下载地址和 Gradle 解包后的本地存储路径等配置。

```groovy
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
    distributionUrl = '../../gradle-7.6-bin.zip'
    distributionPath=wrapper/dists
}
```

`distributionUrl` 属性可以设置为本地的项目目录，你也可以设置为网络地址。

## Gradle 任务

在 Gradle 中，任务(Task)是构建执行的单个工作单元。

Gradle 的构建是基于 Task 进行的，当你运行项目的时候，实际就是在执行了一系列的 Task 比如编译 Java 源码的 Task、生成 jar 文件的 Task。

Task 的声明方式如下（还有其他几种声明方式）：

```groovy
// 声明一个名字为 helloTask 的 Task
task helloTask{
     doLast{
       println "Hello"
     }
}
```

创建一个 Task 后，可以根据需要给 Task 添加不同的 Action，上面的“doLast”就是给队列尾增加一个 Action。

```groovy
 //在Action 队列头部添加Action
 Task doFirst(Action<? super Task> action);
 Task doFirst(Closure action);

 //在Action 队列尾部添加Action
 Task doLast(Action<? super Task> action);
 Task doLast(Closure action);

 //删除所有的Action
 Task deleteAllActions();
```

一个 Task 中可以有多个 Acton，从队列头部开始向队列尾部执行 Acton。

Action 代表的是一个个函数、方法，每个 Task 都是一堆 Action 按序组成的执行图。

Task 声明依赖的关键字是`dependsOn`，支持声明一个或多个依赖：

```groovy
task first {
 doLast {
        println "+++++first+++++"
    }
}
task second {
 doLast {
        println "+++++second+++++"
    }
}

// 指定多个 task 依赖
task print(dependsOn :[second,first]) {
 doLast {
      logger.quiet "指定多个task依赖"
    }
}

// 指定一个 task 依赖
task third(dependsOn : print) {
 doLast {
      println '+++++third+++++'
    }
}
```

执行 Task 之前，会先执行它的依赖 Task。

我们还可以设置默认 Task，脚本中我们不调用默认 Task ，也会执行。

```groovy
defaultTasks 'clean', 'run'

task clean {
    doLast {
        println 'Default Cleaning!'
    }
}

task run {
    doLast {
        println 'Default Running!'
    }
}
```

Gradle 本身也内置了很多 Task 比如 copy（复制文件）、delete（删除文件）。

```groovy
task deleteFile(type: Delete) {
    delete "C:\\Users\\guide\\Desktop\\test"
}
```

## Gradle 插件

Gradle 提供的是一套核心的构建机制，而 Gradle 插件则是运行在这套机制上的一些具体构建逻辑，其本质上和 `.gradle` 文件是相同。你可以将 Gradle 插件看作是封装了一系列 Task 并执行的工具。

Gradle 插件主要分为两类：

- 脚本插件： 脚本插件就是一个普通的脚本文件，它可以被导入都其他构建脚本中。
- 二进制插件 / 对象插件：在一个单独的插件模块中定义，其他模块通过 Plugin ID 应用插件。因为这种方式发布和复用更加友好，我们一般接触到的 Gradle 插件都是指二进制插件的形式。

虽然 Gradle 插件与 .gradle 文件本质上没有区别，`.gradle` 文件也能实现 Gradle 插件类似的功能。但是，Gradle 插件使用了独立模块封装构建逻辑，无论是从开发开始使用来看，Gradle 插件的整体体验都更友好。

- **逻辑复用：** 将相同的逻辑提供给多个相似项目复用，减少重复维护类似逻辑开销。当然 .gradle 文件也能做到逻辑复用，但 Gradle 插件的封装性更好；
- **组件发布：** 可以将插件发布到 Maven 仓库进行管理，其他项目可以使用插件 ID 依赖。当然 .gradle 文件也可以放到一个远程路径被其他项目引用；
- **构建配置：** Gradle 插件可以声明插件扩展来暴露可配置的属性，提供定制化能力。当然 .gradle 文件也可以做到，但实现会麻烦些。

## Gradle 构建生命周期

Gradle 构建的生命周期有三个阶段：**初始化阶段，配置阶段**和**运行阶段**。

![](https://oss.javaguide.cn/github/javaguide/csdn/dadbdf59fccd9a2ebf60a2d018541e52.png)

在初始化阶段与配置阶段之间、配置阶段结束之后、执行阶段结束之后，我们都可以加一些定制化的 Hook。

![](https://oss.javaguide.cn/github/javaguide/csdn/5c297ccc4dac83229ff3e19caee9d1d2.png)

### 初始化阶段

Gradle 支持单项目和多项目构建。在初始化阶段，Gradle 确定哪些项目将参与构建，并为每个项目创建一个 [Project 实例](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) 。本质上也就是执行 `settings.gradle` 脚本，从而读取整个项目中有多少个 Project 实例。

### 配置阶段

在配置阶段，Gradle 会解析每个工程的 `build.gradle` 文件，创建要执行的任务子集和确定各种任务之间的关系，以供执行阶段按照顺序执行，并对任务的做一些初始化配置。

每个 `build.gradle` 对应一个 Project 对象，配置阶段执行的代码包括 `build.gradle` 中的各种语句、闭包以及 Task 中的配置语句。

在配置阶段结束后，Gradle 会根据 Task 的依赖关系会创建一个 **有向无环图** 。

### 运行阶段

在运行阶段，Gradle 根据配置阶段创建和配置的要执行的任务子集，执行任务。

## 参考

- Gradle 官方文档：<https://docs.gradle.org/current/userguide/userguide.html>
- Gradle 入门教程：<https://www.imooc.com/wiki/gradlebase>
- Groovy 快速入门看这篇就够了：<https://cloud.tencent.com/developer/article/1358357>
- 【Gradle】Gradle 的生命周期详解：<https://juejin.cn/post/7067719629874921508>
- 手把手带你自定义 Gradle 插件 —— Gradle 系列(2)：<https://www.cnblogs.com/pengxurui/p/16281537.html>
- Gradle 爬坑指南 -- 理解 Plugin、Task、构建流程：<https://juejin.cn/post/6889090530593112077>
