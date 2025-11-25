---
title: Summary of Gradle core concepts
category: development tools
head:
  - - meta
    - name: keywords
      content: Gradle,Groovy,Gradle Wrapper,Gradle wrapper,Gradle plug-in
  - - meta
    - name: description
      content: Gradle is an automated project construction tool running on the JVM to help us automatically build projects.
---

> This part of the content is mainly organized based on the Gradle official documentation and has been deleted accordingly. It mainly retains the more important parts and does not involve actual combat. It is mainly an introduction to some important concepts.

This part of Gradle is optional. You can decide whether to learn it according to your own needs. Currently, Maven is more commonly used in China.

## Introduction to Gradle

The official Gradle documentation introduces Gradle like this:

> Gradle is an open-source [build automation](https://en.wikipedia.org/wiki/Build_automation) tool flexible enough to build almost any type of software. Gradle makes few assumptions about what you’re trying to build or how to build it. This makes Gradle particularly flexible.
>
> Gradle is an open source build automation tool that is flexible enough to build almost any type of software. Gradle makes very few assumptions about what you want to build or how to build it. This makes Gradle particularly flexible.

Simply put, Gradle is an automated project construction tool running on the JVM to help us automatically build projects.

For developers, Gradle has three main functions:

1. **Project Construction**: Provides a standard, cross-platform automated project construction method.
2. **Dependency Management**: Conveniently and quickly manage the resources (jar packages) that the project depends on to avoid version conflicts between resources.
3. **Unified development structure**: Provides a standard and unified project structure.

Gradle build scripts are written in Groovy or Kotlin languages, which are very expressive and flexible enough.

## Introduction to Groovy

Gradle is a program that runs on the JVM and can use Groovy to write build scripts.

Groovy is a scripting language that runs on the JVM. It is a dynamic language based on Java extensions. Its syntax is very similar to Java and you can use Java class libraries. Groovy can be used for object-oriented programming or as a pure scripting language. In terms of language design, it absorbs the excellent features of Java, Python, Ruby and Smalltalk languages, such as dynamic type conversion, closures and metaprogramming support.

We can learn Groovy the same way we learn Java, and the learning cost is relatively low. Even if you forget Groovy syntax during the development process, you can still use Java syntax to continue coding.

There are many JVM-based languages ​​such as Groovy, Kotlin, Java, and Scala. They will eventually compile and generate Java bytecode files and run on the JVM.

## Gradle Advantages

Gradle is a new generation build system with many advantages such as efficiency and flexibility, and is widely used in Java development. Not only does Android use it as its official build system, more and more Java projects such as Spring Boot are also slowly migrating to Gradle.

- In terms of flexibility, Gradle supports scripting based on the Groovy language, focusing on the flexibility of the build process. It is suitable for building projects with high complexity and can complete very complex builds.
- In terms of granularity, the granularity of Gradle construction is refined into each task. And all its Task source codes are open source. After we master this complete set of packaging processes, we can dynamically change its execution process by modifying its Tasks.
- In terms of scalability, Gradle supports the plug-in mechanism, so we can reuse these plug-ins as easily and conveniently as reusing libraries.

## Gradle Wrapper Introduction

Gradle official documentation introduces Gradle Wrapper like this:

> The recommended way to execute any Gradle build is with the help of the Gradle Wrapper (in short just “Wrapper”). The Wrapper is a script that invokes a declared version of Gradle, downloading it beforehand if necessary. As a result, developers can get up and running with a Gradle project quickly without having to follow manual installation processes saving your company time and money.
>
> The recommended way to perform a Gradle build is with the Gradle Wrapper (or "Wrapper" in short). Wrapper It is a script that calls the declared Gradle version and can download it beforehand if needed. As a result, developers can quickly get Gradle projects up and running without having to follow a manual installation process, saving companies time and money.

We can call Gradle Wrapper a Gradle wrapper, which wraps Gradle again and allows all Gradle build methods to run with the help of the Gradle wrapper.

The workflow diagram of Gradle Wrapper is as follows (picture source [Gradle Wrapper official document introduction](https://docs.gradle.org/current/userguide/gradle_wrapper.html)):

![Wrapper workflow](https://oss.javaguide.cn/github/javaguide/csdn/efa7a0006b04051e2b84cd116c6ccdfc.png)

The whole process is mainly divided into the following 3 steps:

1. First, when we first create it, if the specified version has not been downloaded, we will first go to the Gradle server to download the compressed package of the corresponding version;
2. After downloading, you need to decompress and execute the batch file;
3. Each subsequent project build will reuse this decompressed Gradle version.

Gradle Wrapper will bring us the following benefits:

1. Standardize projects on a given Gradle version, resulting in more reliable and robust builds.
2. We can run the Gradle project without installing the Gradle environment on our computer.
3. Providing new Gradle versions to different users and execution environments (such as IDEs or continuous integration servers) is as simple as changing the Wrapper definition.

### Generate Gradle Wrapper

If you want to generate Gradle Wrapper, you need to configure Gradle environment variables locally. Gradle has built-in Wrapper Task. Executing the `gradle wrapper` command in the project root directory can help us generate Gradle Wrapper.

When executing the command `gradle wrapper`, you can specify some parameters to control the generation of wrapper. Specifically, there are two configuration parameters:

- `--gradle-version` is used to specify the version of Gradle used
- `--gradle-distribution-url` is used to specify the URL to download the Gradle version. The rule for this value is `http://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip`

After executing the `gradle wrapper` command, the Gradle Wrapper is generated and the following files are generated in the project root directory:

```plain
├── gradle
│ └── wrapper
│ ├── gradle-wrapper.jar
│ └── gradle-wrapper.properties
├── gradlew
└── gradlew.bat
```

The meaning of each file is as follows:

- `gradle-wrapper.jar`: Contains the logic code of Gradle runtime.
- `gradle-wrapper.properties`: Defines the Gradle version number and Gradle runtime behavior properties.
- `gradlew`: A wrapper script for executing Gralde commands on Linux platform.
- `gradlew.bat`: wrapper script for executing Gralde commands on Windows platform.

The contents of the `gradle-wrapper.properties` file are as follows:

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-6.0.1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists```

- `distributionBase`: The parent directory where Gradle is stored after unpacking.
- `distributionPath`: `distributionBase` specifies a subdirectory of the directory. `distributionBase+distributionPath` is the specific directory where Gradle unpacks it.
- `distributionUrl`: The download address of the compressed package of the Gradle specified version.
- `zipStoreBase`: The parent directory where the Gradle compressed package is stored after downloading.
- `zipStorePath`: A subdirectory of the directory specified by `zipStoreBase`. `zipStoreBase+zipStorePath` is the storage location of the Gradle compressed package.

### Update Gradle Wrapper

There are 2 ways to update Gradle Wrapper:

1. Then modify the `distributionUrl` field, and then execute the Gradle command.
2. Execute the gradlew command `gradlew wrapper –-gradle-version [version]`.

The following command will upgrade the Gradle version to 7.6.

```shell
gradlew wrapper --gradle-version 7.6
```

The `distributionUrl` property in the `gradle-wrapper.properties` file has also changed.

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-all.zip
```

### Custom Gradle Wrapper

Gradle has built-in Wrapper Task, so building Gradle Wrapper will generate Gradle Wrapper's properties file. This property file can be set by customizing Wrapper Task. For example, if we want to modify the Gralde version to be downloaded to 7.6, we can set it like this:

```javascript
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
}
```

You can also set the download address of the Gradle distribution compressed package and the local storage path after Gradle unpacking.

```groovy
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
    distributionUrl = '../../gradle-7.6-bin.zip'
    distributionPath=wrapper/dists
}
```

The `distributionUrl` property can be set to the local project directory, or you can set it to a network address.

## Gradle tasks

In Gradle, a task is a single unit of work that a build executes.

The construction of Gradle is based on Tasks. When you run the project, you are actually executing a series of Tasks, such as Tasks for compiling Java source code and Tasks for generating jar files.

Task is declared as follows (there are several other declaration ways):

```groovy
//Declare a Task named helloTask
task helloTask{
     doLast{
       println "Hello"
     }
}
```

After creating a Task, you can add different Actions to the Task as needed. The above "doLast" is to add an Action to the end of the queue.

```groovy
 //Add Action to the head of the Action queue
 Task doFirst(Action<? super Task> action);
 Task doFirst(Closure action);

 //Add Action at the end of the Action queue
 Task doLast(Action<? super Task> action);
 Task doLast(Closure action);

 //Delete all Actions
 Task deleteAllActions();
```

There can be multiple Actons in a Task, and Actons are executed from the head of the queue to the tail of the queue.

Action represents functions and methods, and each Task is an execution graph composed of a bunch of Actions in sequence.

The keyword for Task to declare dependencies is `dependsOn`, which supports the declaration of one or more dependencies:

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

//Specify multiple task dependencies
task print(dependsOn :[second,first]) {
 doLast {
      logger.quiet "Specify multiple task dependencies"
    }
}

//Specify a task dependency
task third(dependsOn : print) {
 doLast {
      println '+++++third+++++'
    }
}
```

Before executing a Task, its dependent Tasks will be executed first.

We can also set a default Task. If we don’t call the default Task in the script, it will still be executed.

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

Gradle itself also has many built-in tasks such as copy (copy files) and delete (delete files).

```groovy
task deleteFile(type: Delete) {
    delete "C:\\Users\\guide\\Desktop\\test"
}
```

## Gradle plugin

Gradle provides a set of core build mechanisms, and Gradle plug-ins are some specific build logic that run on this mechanism, which are essentially the same as `.gradle` files. You can think of a Gradle plugin as a tool that encapsulates and executes a series of tasks.

Gradle plugins are mainly divided into two categories:

- Script plug-in: A script plug-in is an ordinary script file that can be imported into other build scripts.
- Binary plug-ins / object plug-ins: defined in a separate plug-in module, other modules apply the plug-in through the Plugin ID. Because this method is more friendly to release and reuse, the Gradle plug-ins we generally come into contact with are in the form of binary plug-ins.

Although Gradle plugins are essentially the same as .gradle files, `.gradle` files can also implement similar functions to Gradle plugins. However, the Gradle plug-in uses an independent module to encapsulate the build logic. From the perspective of development, the overall experience of the Gradle plug-in is more friendly.

- **Logic reuse:** Provide the same logic to multiple similar projects for reuse, reducing the overhead of repeated maintenance of similar logic. Of course, .gradle files can also achieve logic reuse, but the Gradle plug-in has better encapsulation;
- **Component publishing:** Plug-ins can be published to the Maven repository for management, and other projects can use the plug-in ID to depend on it. Of course, the .gradle file can also be placed in a remote path and referenced by other projects;
- **Build Configuration:** Gradle plugins can declare plugin extensions to expose configurable properties and provide customization capabilities. Of course, .gradle files can also be used, but the implementation will be more troublesome.

## Gradle build life cycle

The Gradle build life cycle has three phases: Initialization phase, Configuration phase and Run phase.

![](https://oss.javaguide.cn/github/javaguide/csdn/dadbdf59fccd9a2ebf60a2d018541e52.png)

We can add some customized Hooks between the initialization phase and the configuration phase, after the configuration phase, and after the execution phase.

![](https://oss.javaguide.cn/github/javaguide/csdn/5c297ccc4dac83229ff3e19caee9d1d2.png)

### Initialization phase

Gradle supports single-project and multi-project builds. During the initialization phase, Gradle determines which projects will participate in the build and creates a [Project instance](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) for each project. Essentially, it executes the `settings.gradle` script to read how many Project instances there are in the entire project.

### Configuration phase

In the configuration phase, Gradle will parse the `build.gradle` file of each project, create a subset of tasks to be executed and determine the relationship between various tasks for execution in order during the execution phase, and do some initial configuration of the tasks.Each `build.gradle` corresponds to a Project object. The code executed during the configuration phase includes various statements, closures in `build.gradle` and configuration statements in Task.

After the configuration phase, Gradle will create a **directed acyclic graph** based on the Task's dependencies.

### Running phase

During the run phase, Gradle executes tasks based on the subset of tasks created and configured to be executed during the configure phase.

## Reference

- Gradle official documentation: <https://docs.gradle.org/current/userguide/userguide.html>
- Gradle introductory tutorial: <https://www.imooc.com/wiki/gradlebase>
- For a quick introduction to Groovy, just read this article: <https://cloud.tencent.com/developer/article/1358357>
- [Gradle] Detailed explanation of Gradle's life cycle: <https://juejin.cn/post/7067719629874921508>
- Take you step by step to customize Gradle plug-in - Gradle series (2): <https://www.cnblogs.com/pengxurui/p/16281537.html>
- Gradle pit climbing guide -- understanding Plugin, Task, and build process: <https://juejin.cn/post/6889090530593112077>

<!-- @include: @article-footer.snippet.md -->