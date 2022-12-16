---
title: Maven 核心概念总结
category: 开发工具
head:
  - - meta
    - name: keywords
      content: Maven坐标,Maven仓库,Maven生命周期,Maven多模块管理
  - - meta
    - name: description
      content:  Apache Maven 的本质是一个软件项目管理和理解工具。基于项目对象模型 (Project Object Model，POM) 的概念，Maven 可以从一条中心信息管理项目的构建、报告和文档。
---

> 这部分内容主要根据 Maven 官方文档整理，做了对应的删减，主要保留比较重要的部分，不涉及实战，主要是一些重要概念的介绍。

## Maven 介绍

[Maven](https://github.com/apache/maven) 官方文档是这样介绍的 Maven 的：

> Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information.
>
> Apache Maven 的本质是一个软件项目管理和理解工具。基于项目对象模型 (Project Object Model，POM) 的概念，Maven 可以从一条中心信息管理项目的构建、报告和文档。

**什么是 POM？** 每一个 Maven 工程都有一个 `pom.xml` 文件，位于根目录中，包含项目构建生命周期的详细信息。通过 `pom.xml` 文件，我们可以定义项目的坐标、项目依赖、项目信息、插件信息等等配置。

对于开发者来说，Maven 的主要作用主要有 3 个：

1. **项目构建** ：提供标准的、跨平台的自动化项目构建方式。
2. **依赖管理** ：方便快捷的管理项目依赖的资源（jar 包），避免资源间的版本冲突问题。
3. **统一开发结构** ：提供标准的、统一的项目结构。

关于 Maven 的基本使用这里就不介绍了，建议看看官网的 5 分钟上手 Maven 的教程：[Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html) 。

## Maven 坐标

项目中依赖的第三方库以及插件可统称为构件。每一个构件都可以使用 Maven 坐标唯一标识，坐标元素包括：

- **goupId**(必须): 定义了当前 Maven 项目隶属的组织或公司。groupId 一般分为多段，通常情况下，第一段为域，第二段为公司名称。域又分为 org、com、cn 等，其中 org 为非营利组织，com 为商业组织，cn 表示中国。以 apache 开源社区的 tomcat 项目为例，这个项目的 groupId 是 org.apache，它的域是 org（因为 tomcat 是非营利项目），公司名称是 apache，artifactId 是 tomcat。
- **artifactId**(必须)：定义了当前 Maven 项目的名称，项目的唯一的标识符，对应项目根目录的名称。
- **version**(必须)： 定义了 Maven 项目当前所处版本。
- **packaging**（可选）：定义了 Maven 项目的打包方式（比如 jar，war...），默认使用 jar。
- **classifier**(可选)：常用于区分从同一 POM 构建的具有不同内容的构件，可以是任意的字符串，附加在版本号之后。

只要你提供正确的坐标，就能从 Maven 仓库中找到相应的构件供我们使用。

举个例子（引入阿里巴巴开源的 EasyExcel） ：

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.1.1</version>
</dependency>
```

你可以在 https://mvnrepository.com/ 这个网站上找到几乎所有可用的构件，如果你的项目使用的是 Maven 作为构建工具，那这个网站你一定会经常接触。

![Maven 仓库](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/tools/maven/mvnrepository.com.png)

## Maven 依赖

如果使用 Maven 构建产生的构件（例如 Jar 文件）被其他的项目引用，那么该构件就是其他项目的依赖。

### 依赖配置

**配置信息示例** ：

```xml
<project>
    <dependencies>
        <dependency>
            <groupId></groupId>
            <artifactId></artifactId>
            <version></version>
            <type>...</type>
            <scope>...</scope>
            <optional>...</optional>
            <exclusions>
                <exclusion>
                  <groupId>...</groupId>
                  <artifactId>...</artifactId>
                </exclusion>
          </exclusions>
        </dependency>
      </dependencies>
</project>
```

**配置说明** ：

- dependencies： 一个 pom.xml 文件中只能存在一个这样的标签，是用来管理依赖的总标签。
- dependency：包含在dependencies标签中，可以有多个，每一个表示项目的一个依赖。
- groupId,artifactId,version(必要)：依赖的基本坐标，对于任何一个依赖来说，基本坐标是最重要的，Maven 根据坐标才能找到需要的依赖。我们在上面解释过这些元素的具体意思，这里就不重复提了。
- type(可选)：依赖的类型，对应于项目坐标定义的packaging。大部分情况下，该元素不必声明，其默认值是jar。
- scope(可选)：依赖的范围，默认值是 compile。
- optional(可选)： 标记依赖是否可选
- exclusions(可选)：用来排除传递性依赖,例如jar包冲突

### 依赖范围

**classpath** 用于指定 `.class` 文件存放的位置，类加载器会从该路径中加载所需的 `.class` 文件到内存中。

Maven 在编译、执行测试、实际运行有着三套不同的 classpath：

- **编译 classpath** ：编译主代码有效
- **测试 classpath** ：编译、运行测试代码有效
- **运行 classpath** ：项目运行时有效

Maven 的依赖范围如下：

- **compile**：编译依赖范围（默认），使用此依赖范围对于编译、测试、运行三种都有效，即在编译、测试和运行的时候都要使用该依赖 Jar 包。
- **test**：测试依赖范围，从字面意思就可以知道此依赖范围只能用于测试，而在编译和运行项目时无法使用此类依赖，典型的是 JUnit，它只用于编译测试代码和运行测试代码的时候才需要。
- **provided** ：此依赖范围，对于编译和测试有效，而对运行时无效。比如 `servlet-api.jar` 在 Tomcat 中已经提供了，我们只需要的是编译期提供而已。
- **runtime**：运行时依赖范围，对于测试和运行有效，但是在编译主代码时无效，典型的就是 JDBC 驱动实现。
- **system**：系统依赖范围，使用 system 范围的依赖时必须通过 systemPath 元素显示地指定依赖文件的路径，不依赖 Maven 仓库解析，所以可能会造成建构的不可移植。

### 传递依赖性

### 依赖冲突

**1、对于 Maven 而言，同一个 groupId 同一个 artifactId 下，只能使用一个 version。**

```xml
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.48</version>
</dependency>
<!-- 只会使用 1.0.49 这个版本的依赖 -->
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.49</version>
</dependency>
```

若相同类型但版本不同的依赖存在于同一个 pom 文件，只会引入后一个声明的依赖。

**2、项目的两个依赖同时引入了某个依赖。**

举个例子，项目存在下面这样的依赖关系：

```
依赖链路一：A -> B -> C -> X(1.0)
依赖链路二：A -> D -> X(2.0)
```

这两条依赖路径上有两个版本的 X，为了避免依赖重复，Maven 只会选择其中的一个进行解析。

**哪个版本的 X 会被 Maven 解析使用呢?**

Maven 在遇到这种问题的时候，会遵循 **路径最短优先** 和 **声明顺序优先** 两大原则。解决这个问题的过程也被称为 **Maven 依赖调解** 。

**路径最短优先**

```
依赖链路一：A -> B -> C -> X(1.0) // dist = 3
依赖链路二：A -> D -> X(2.0) // dist = 2
```

依赖链路二的路径最短，因此，X(2.0)会被解析使用。

不过，你也可以发现。路径最短优先原则并不是通用的，像下面这种路径长度相等的情况就不能单单通过其解决了：

```
依赖链路一：A -> B -> X(1.0) // dist = 3
依赖链路二：A -> D -> X(2.0) // dist = 2
```

因此，Maven 又定义了声明顺序优先原则。

依赖调解第一原则不能解决所有问题，比如这样的依赖关系：A->B->Y(1.0)、A-> C->Y(2.0)，Y(1.0)和 Y(2.0)的依赖路径长度是一样的，都为 2。Maven 定义了依赖调解的第二原则：

**声明顺序优先**

在依赖路径长度相等的前提下，在 `pom.xml` 中依赖声明的顺序决定了谁会被解析使用，顺序最前的那个依赖优胜。该例中，如果 B 的依赖声明在 D 之前，那么 X (1.0)就会被解析使用。

```xml
<!-- A pom.xml -->
<dependencies>
    ...
    dependency B
    ...
    dependency D
</dependencies>
```

### 排除依赖

单纯依赖 Maven 来进行依赖调解，在很多情况下是不适用的，需要我们手动排除依赖。

举个例子，当前项目存在下面这样的依赖关系：

```
依赖链路一：A -> B -> C -> X(1.5) // dist = 3
依赖链路二：A -> D -> X(1.0) // dist = 2
```

根据路径最短优先原则，X(1.0) 会被解析使用，也就是说实际用的是 1.0 版本的 X。

但是！！！这会一些问题：如果 D 依赖用到了 1.5 版本的 X 中才有的一个类，运行项目就会报`NoClassDefFoundError`错误。如果 D 依赖用到了 1.5 版本的 X 中才有的一个方法，运行项目就会报`NoSuchMethodError`错误。

现在知道为什么你的 Maven 项目总是会报`NoClassDefFoundError`和`NoSuchMethodError`错误了吧？

**如何解决呢？** 我们可以通过`exclusive`标签手动将 X(1.0) 给排除。

```xml
<dependencyB>
    ......
    <exclusions>
      <exclusion>
        <artifactId>x</artifactId>
        <groupId>org.apache.x</groupId>
      </exclusion>
    </exclusions>
</dependency>
```

一般我们在解决依赖冲突的时候，都会优先保留版本较高的。这是因为大部分 jar 在升级的时候都会做到向下兼容。

如果高版本修改了低版本的一些类或者方法的话，这个时候就能直接保留高版本了，而是应该考虑优化上层依赖，比如升级上层依赖的版本。

还是上面的例子：

```
依赖链路一：A -> B -> C -> X(1.5) // dist = 3
依赖链路二：A -> D -> X(1.0) // dist = 2
```

我们保留了 1.5 版本的 X，但是这个版本的 X 删除了 1.0 版本中的某些类。这个时候，我们可以考虑升级 D 的版本到一个 X 兼容的版本。

## Maven 仓库

在 Maven 世界中，任何一个依赖、插件或者项目构建的输出，都可以称为 **构件** 。

坐标和依赖是构件在 Maven 世界中的逻辑表示方式，构件的物理表示方式是文件，Maven 通过仓库来统一管理这些文件。 任何一个构件都有一组坐标唯一标识。有了仓库之后，无需手动引入构件，我们直接给定构件的坐标即可在 Maven 仓库中找到该构件。

Maven 仓库分为：

- **本地仓库** ：运行 Maven 的计算机上的一个目录，它缓存远程下载的构件并包含尚未发布的临时构件。`settings.xml` 文件中可以看到 Maven 的本地仓库路径配置，默认本地仓库路径是在 `${user.home}/.m2/repository`。
- **远程仓库** ：官方或者其他组织维护的 Maven 仓库。

Maven 远程仓库可以分为：

- **中央仓库** ：这个仓库是由 Maven 社区来维护的，里面存放了绝大多数开源软件的包，并且是作为 Maven 的默认配置，不需要开发者额外配置。另外为了方便查询，还提供了一个[查询地址](https://search.maven.org/)，开发者可以通过这个地址更快的搜索需要构件的坐标。
- **私服** ：私服是一种特殊的远程 Maven 仓库，它是架设在局域网内的仓库服务，私服一般被配置为互联网远程仓库的镜像，供局域网内的 Maven 用户使用。
- **其他的公共仓库** ：有一些公共仓库是未来加速访问（比如阿里云 Maven 镜像仓库）或者部分构件不存在于中央仓库中。

Maven 依赖包寻找顺序：

1. 先去本地仓库找寻，有的话，直接使用。
2. 本地仓库没有找到的话，会去远程仓库找寻，下载包到本地仓库。
3. 远程仓库没有找到的话，会报错。

## Maven 生命周期

Maven 的生命周期就是为了对所有的构建过程进行抽象和统一，包含了项目的清理、初始化、编译、测试、打包、集成测试、验证、部署和站点生成等几乎所有构建步骤。

Maven 定义了 3 个生命周期`META-INF/plexus/components.xml`：

- `default` 生命周期
- `clean`生命周期
- `site`生命周期

这些生命周期是相互独立的，每个生命周期包含多个阶段(phase)。并且，这些阶段是有序的，也就是说，后面的阶段依赖于前面的阶段。当执行某个阶段的时候，会先执行它前面的阶段。

执行 Maven 生命周期的命令格式如下：

```bash
mvn 阶段 [阶段2] ...[阶段n]
```

### default 生命周期

`default`生命周期是在没有任何关联插件的情况下定义的，是 Maven 的主要生命周期，用于构建应用程序，共包含 23 个阶段。

```xml
<phases>
  <!-- 验证项目是否正确，并且所有必要的信息可用于完成构建过程 -->
  <phase>validate</phase>
  <!-- 建立初始化状态，例如设置属性 -->
  <phase>initialize</phase>
  <!-- 生成要包含在编译阶段的源代码 -->
  <phase>generate-sources</phase>
  <!-- 处理源代码 -->
  <phase>process-sources</phase>
  <!-- 生成要包含在包中的资源 -->
  <phase>generate-resources</phase>
  <!-- 将资源复制并处理到目标目录中，为打包阶段做好准备。 -->
  <phase>process-resources</phase>
  <!-- 编译项目的源代码  -->
  <phase>compile</phase>
  <!-- 对编译生成的文件进行后处理，例如对 Java 类进行字节码增强/优化 -->
  <phase>process-classes</phase>
  <!-- 生成要包含在编译阶段的任何测试源代码 -->
  <phase>generate-test-sources</phase>
  <!-- 处理测试源代码 -->
  <phase>process-test-sources</phase>
  <!-- 生成要包含在编译阶段的测试源代码 -->
  <phase>generate-test-resources</phase>
  <!-- 处理从测试代码文件编译生成的文件 -->
  <phase>process-test-resources</phase>
  <!-- 编译测试源代码 -->
  <phase>test-compile</phase>
  <!-- 处理从测试代码文件编译生成的文件 -->
  <phase>process-test-classes</phase>
  <!-- 使用合适的单元测试框架（Junit 就是其中之一）运行测试 -->
  <phase>test</phase>
  <!-- 在实际打包之前，执行任何的必要的操作为打包做准备 -->
  <phase>prepare-package</phase>
  <!-- 获取已编译的代码并将其打包成可分发的格式，例如 JAR、WAR 或 EAR 文件 -->
  <phase>package</phase>
  <!-- 在执行集成测试之前执行所需的操作。 例如，设置所需的环境 -->
  <phase>pre-integration-test</phase>
  <!-- 处理并在必要时部署软件包到集成测试可以运行的环境 -->
  <phase>integration-test</phase>
  <!-- 执行集成测试后执行所需的操作。 例如，清理环境  -->
  <phase>post-integration-test</phase>
  <!-- 运行任何检查以验证打的包是否有效并符合质量标准。 -->
  <phase>verify</phase>
  <!-- 	将包安装到本地仓库中，可以作为本地其他项目的依赖 -->
  <phase>install</phase>
  <!-- 将最终的项目包复制到远程仓库中与其他开发者和项目共享 -->
  <phase>deploy</phase>
</phases>
```

根据前面提到的阶段间依赖关系理论，当我们执行 `mvn test`命令的时候，会执行从 validate 到 test 的所有阶段，这也就解释了为什么执行测试的时候，项目的代码能够自动编译。

### clean 生命周期

clean 生命周期的目的是清理项目，共包含 3 个阶段：

1. pre-clean
2. clean
3. post-clean

```xml
<phases>
  <!--  执行一些需要在clean之前完成的工作 -->
  <phase>pre-clean</phase>
  <!--  移除所有上一次构建生成的文件 -->
  <phase>clean</phase>
  <!--  执行一些需要在clean之后立刻完成的工作 -->
  <phase>post-clean</phase>
</phases>
<default-phases>
  <clean>
    org.apache.maven.plugins:maven-clean-plugin:2.5:clean
  </clean>
</default-phases>
```

根据前面提到的阶段间依赖关系理论，当我们执行 `mvn clean` 的时候，会执行 clean 生命周期中的 pre-clean 和 clean 阶段。

### site 生命周期

site 生命周期的目的是建立和发布项目站点，共包含 4 个阶段：

1. pre-site
2. site
3. post-site
4. site-deploy

```xml
<phases>
  <!--  执行一些需要在生成站点文档之前完成的工作 -->
  <phase>pre-site</phase>
  <!--  生成项目的站点文档作 -->
  <phase>site</phase>
  <!--  执行一些需要在生成站点文档之后完成的工作，并且为部署做准备 -->
  <phase>post-site</phase>
  <!--  将生成的站点文档部署到特定的服务器上 -->
  <phase>site-deploy</phase>
</phases>
<default-phases>
  <site>
    org.apache.maven.plugins:maven-site-plugin:3.3:site
  </site>
  <site-deploy>
    org.apache.maven.plugins:maven-site-plugin:3.3:deploy
  </site-deploy>
</default-phases>
```

Maven 能够基于 `pom.xml` 所包含的信息，自动生成一个友好的站点，方便团队交流和发布项目信息。

## Maven 多模块管理 

多模块管理简单地来说就是将一个项目分为多个模块，每个模块只负责单一的功能实现。直观的表现就是一个 Maven 项目中不止有一个 `pom.xml` 文件，会在不同的目录中有多个 `pom.xml` 文件，进而实现多模块管理。

多模块管理除了可以更加便于项目开发和管理，还有如下好处：

1. 降低代码之间的耦合性（从类级别的耦合提升到jar包级别的耦合）；
2. 减少重复，提升复用性；
3. 每个模块都可以是自解释的（通过模块名或者模块文档）；
4. 模块还规范了代码边界的划分，开发者很容易通过模块确定自己所负责的内容。

多模块管理下，会有一个父模块，其他的都是子模块。父模块通常只有一个 `pom.xml`，没有其他内容。父模块的 `pom.xml` 一般只定义了各个依赖的版本号、包含哪些子模块以及插件有哪些。不过，要注意的是，如果依赖只在某个子项目中使用，则可以在子项目的pom.xml中直接引入，防止父pom的过于臃肿。

如下图所示，Dubbo 项目就被分成了多个子模块比如dubbo-common（公共逻辑模块）、dubbo-remoting（远程通讯模块）、dubbo-rpc（远程调用模块）。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/tools/maven/dubbo-maven-multi-module.png)

## 参考

- 《Maven 实战》
- Introduction to Repositories - Maven 官方文档：https://maven.apache.org/guides/introduction/introduction-to-repositories.html
- Introduction to the Build Lifecycle - Maven 官方文档：https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html#Lifecycle_Reference
- Maven 依赖范围：http://www.mvnbook.com/maven-dependency.html
- 解决 maven 依赖冲突，这篇就够了！：https://www.cnblogs.com/qdhxhz/p/16363532.html
- Multi-Module Project with Maven：https://www.baeldung.com/maven-multi-module