---
title: Java SPI 机制详解
category: Java
tag:
  - Java基础
head:
  - - meta
    - name: keywords
      content: Java SPI机制
  - - meta
    - name: description
      content: SPI 即 Service Provider Interface ，字面意思就是：“服务提供者的接口”，我的理解是：专门提供给服务提供者或者扩展框架功能的开发者去使用的一个接口。SPI 将服务接口和具体的服务实现分离开来，将服务调用方和服务实现者解耦，能够提升程序的扩展性、可维护性。修改或者替换服务实现并不需要修改调用方。
---

> 本文来自 [Kingshion](https://github.com/jjx0708) 投稿。欢迎更多朋友参与到 JavaGuide 的维护工作，这是一件非常有意义的事情。详细信息请看：[JavaGuide 贡献指南](https://javaguide.cn/javaguide/contribution-guideline.html) 。

面向对象设计鼓励模块间基于接口而非具体实现编程，以降低模块间的耦合，遵循依赖倒置原则，并支持开闭原则（对扩展开放，对修改封闭）。然而，直接依赖具体实现会导致在替换实现时需要修改代码，违背了开闭原则。为了解决这个问题，SPI 应运而生，它提供了一种服务发现机制，允许在程序外部动态指定具体实现。这与控制反转（IoC）的思想相似，将组件装配的控制权移交给了程序之外。

SPI 机制也解决了 Java 类加载体系中双亲委派模型带来的限制。[双亲委派模型](https://javaguide.cn/java/jvm/classloader.html)虽然保证了核心库的安全性和一致性，但也限制了核心库或扩展库加载应用程序类路径上的类（通常由第三方实现）。SPI 允许核心或扩展库定义服务接口，第三方开发者提供并部署实现，SPI 服务加载机制则在运行时动态发现并加载这些实现。例如，JDBC 4.0 及之后版本利用 SPI 自动发现和加载数据库驱动，开发者只需将驱动 JAR 包放置在类路径下即可，无需使用`Class.forName()`显式加载驱动类。

## SPI 介绍

### 何谓 SPI?

SPI 即 Service Provider Interface ，字面意思就是：“服务提供者的接口”，我的理解是：专门提供给服务提供者或者扩展框架功能的开发者去使用的一个接口。

SPI 将服务接口和具体的服务实现分离开来，将服务调用方和服务实现者解耦，能够提升程序的扩展性、可维护性。修改或者替换服务实现并不需要修改调用方。

很多框架都使用了 Java 的 SPI 机制，比如：Spring 框架、数据库加载驱动、日志接口、以及 Dubbo 的扩展实现等等。

<img src="https://oss.javaguide.cn/github/javaguide/java/basis/spi/22e1830e0b0e4115a882751f6c417857tplv-k3u1fbpfcp-zoom-1.jpeg" style="zoom:50%;" />

### SPI 和 API 有什么区别？

**那 SPI 和 API 有啥区别？**

说到 SPI 就不得不说一下 API（Application Programming Interface） 了，从广义上来说它们都属于接口，而且很容易混淆。下面先用一张图说明一下：

![SPI VS API](https://oss.javaguide.cn/github/javaguide/java/basis/spi-vs-api.png)

一般模块之间都是通过接口进行通讯，因此我们在服务调用方和服务实现方（也称服务提供者）之间引入一个“接口”。

- 当实现方提供了接口和实现，我们可以通过调用实现方的接口从而拥有实现方给我们提供的能力，这就是 **API**。这种情况下，接口和实现都是放在实现方的包中。调用方通过接口调用实现方的功能，而不需要关心具体的实现细节。
- 当接口存在于调用方这边时，这就是 **SPI** 。由接口调用方确定接口规则，然后由不同的厂商根据这个规则对这个接口进行实现，从而提供服务。

举个通俗易懂的例子：公司 H 是一家科技公司，新设计了一款芯片，然后现在需要量产了，而市面上有好几家芯片制造业公司，这个时候，只要 H 公司指定好了这芯片生产的标准（定义好了接口标准），那么这些合作的芯片公司（服务提供者）就按照标准交付自家特色的芯片（提供不同方案的实现，但是给出来的结果是一样的）。

## 实战演示

SLF4J （Simple Logging Facade for Java）是 Java 的一个日志门面（接口），其具体实现有几种，比如：Logback、Log4j、Log4j2 等等，而且还可以切换，在切换日志具体实现的时候我们是不需要更改项目代码的，只需要在 Maven 依赖里面修改一些 pom 依赖就好了。

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/image-20220723213306039-165858318917813.png)

这就是依赖 SPI 机制实现的，那我们接下来就实现一个简易版本的日志框架。

### Service Provider Interface

新建一个 Java 项目 `service-provider-interface` 目录结构如下：（注意直接新建 Java 项目就好了，不用新建 Maven 项目，Maven 项目会涉及到一些编译配置，如果有私服的话，直接 deploy 会比较方便，但是没有的话，在过程中可能会遇到一些奇怪的问题。）

```plain
│  service-provider-interface.iml
│
├─.idea
│  │  .gitignore
│  │  misc.xml
│  │  modules.xml
│  └─ workspace.xml
│
└─src
    └─edu
        └─jiangxuan
            └─up
                └─spi
                        Logger.java
                        LoggerService.java
                        Main.class
```

新建 `Logger` 接口，这个就是 SPI ， 服务提供者接口，后面的服务提供者就要针对这个接口进行实现。

```java
package edu.jiangxuan.up.spi;

public interface Logger {
    void info(String msg);
    void debug(String msg);
}
```

接下来就是 `LoggerService` 类，这个主要是为服务使用者（调用方）提供特定功能的。这个类也是实现 Java SPI 机制的关键所在，如果存在疑惑的话可以先往后面继续看。

```java
package edu.jiangxuan.up.spi;

import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

public class LoggerService {
    private static final LoggerService SERVICE = new LoggerService();

    private final Logger logger;

    private final List<Logger> loggerList;

    private LoggerService() {
        ServiceLoader<Logger> loader = ServiceLoader.load(Logger.class);
        List<Logger> list = new ArrayList<>();
        for (Logger log : loader) {
            list.add(log);
        }
        // LoggerList 是所有 ServiceProvider
        loggerList = list;
        if (!list.isEmpty()) {
            // Logger 只取一个
            logger = list.get(0);
        } else {
            logger = null;
        }
    }

    public static LoggerService getService() {
        return SERVICE;
    }

    public void info(String msg) {
        if (logger == null) {
            System.out.println("info 中没有发现 Logger 服务提供者");
        } else {
            logger.info(msg);
        }
    }

    public void debug(String msg) {
        if (loggerList.isEmpty()) {
            System.out.println("debug 中没有发现 Logger 服务提供者");
        }
        loggerList.forEach(log -> log.debug(msg));
    }
}
```

Create a new `Main` class (service user, caller), start the program and view the results.

```java
package org.spi.service;

public class Main {
    public static void main(String[] args) {
        LoggerService service = LoggerService.getService();

        service.info("Hello SPI");
        service.debug("Hello SPI");
    }
}
```

Program results:

> Logger service provider not found in info
> No Logger service provider found in debug

At this time, we only have an empty interface and do not provide any implementation for the `Logger` interface, so the corresponding results are not printed as expected in the output results.

You can use commands or use IDEA directly to package the entire program into a jar package.

### Service Provider

Next, create a new project to implement the `Logger` interface

The directory structure of the new project `service-provider` is as follows:

```plain
│ service-provider.iml
│
├─.idea
│ │ .gitignore
│ │ misc.xml
│ │ modules.xml
│ └─ workspace.xml
│
├─lib
│ service-provider-interface.jar
|
└─src
    ├─edu
    │ └─jiangxuan
    │ └─up
    │ └─spi
    │ └─service
    │Logback.java
    │
    └─META-INF
        └─services
                edu.jiangxuan.up.spi.Logger

```

Create a new `Logback` class

```java
package edu.jiangxuan.up.spi.service;

import edu.jiangxuan.up.spi.Logger;

public class Logback implements Logger {
    @Override
    public void info(String s) {
        System.out.println("Logback info print log: " + s);
    }

    @Override
    public void debug(String s) {
        System.out.println("Logback debug print log: " + s);
    }
}

```

Import the jar of `service-provider-interface` into the project.

Create a new lib directory, copy the jar package, and add it to the project.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/523d5e25198444d3b112baf68ce49daetplv-k3u1fbpfcp-watermark.png)

Click OK again.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/f4ba0aa71e9b4d509b9159892a220850tplv-k3u1fbpfcp-watermark.png)

Next, you can import some classes and methods in the jar package into the project, just like the JDK tool class import package.

Implement the `Logger` interface, create a new `META-INF/services` folder in the `src` directory, and then create a new file `edu.jiangxuan.up.spi.Logger` (the full class name of SPI). The content in the file is: `edu.jiangxuan.up.spi.service.Logback` (the full class name of Logback, that is, the package name + class name of the SPI implementation class).

**This is the standard agreed upon by the JDK SPI mechanism ServiceLoader. **

Here is a brief explanation: The SPI mechanism in Java is that every time a class is loaded, it will first find the files in the services folder under the `META-INF` folder in the directory relative to the class, load all the files under this folder into the memory, and then find the specific implementation class of the corresponding interface based on the file names and file contents of these files. After finding the implementation class, you can use reflection to generate the corresponding object and save it in a list In the list, you can get the corresponding instance object through iteration or traversal to generate different implementations.

Therefore, some standard requirements will be put forward: the file name must be the full class name of the interface, and the content inside must be the full class name of the implementation class. There can be multiple implementation classes, just wrap it in a new line. When there are multiple implementation classes, they will be loaded one by one iteratively.

Next, also package the `service-provider` project into a jar package. This jar package is the implementation of the service provider. Usually the pom dependency we import into maven is similar to this, except that we have not published this jar package to the maven public warehouse, so we can only manually add it to the project where it needs to be used.

### Effect display

In order to display the effect more intuitively, I will create a new project here specifically for testing: `java-spi-test`

Then first import the interface jar package of `Logger`, and then import the jar package of the specific implementation class.

![](https://oss.javaguide.cn/github/javaguide/java/basis/spi/image-20220723215812708-165858469599214.png)

Create a new Main method test:

```java
package edu.jiangxuan.up.service;

import edu.jiangxuan.up.spi.LoggerService;

public class TestJavaSPI {
    public static void main(String[] args) {
        LoggerService loggerService = LoggerService.getService();
        loggerService.info("Hello");
        loggerService.debug("Test Java SPI mechanism");
    }
}
```

The running results are as follows:

> Logback info print log: Hello
> Logback debug print log: test Java SPI mechanism

It means that the implementation class imported into the jar package has taken effect.

If we do not import the jar package of the specific implementation class, then the result of the program running at this time will be:

> Logger service provider not found in info
> No Logger service provider found in debug

By using the SPI mechanism, we can see that the coupling between the service (`LoggerService`) and the service provider is very low. If we want to change to another implementation, we only need to modify the specific implementation of the `Logger` interface in the `service-provider` project. We only need to change a jar package, or there can be multiple implementations in one project. Isn't this the principle of SLF4J?

If the requirements change one day, and you need to output the log to the message queue, or do some other operations, there is no need to change the implementation of Logback at this time. You only need to add a service implementation (service-provider). You can add a new implementation in this project or introduce a new service implementation jar package from the outside. We can select a specific service implementation (service-provider) in the service (LoggerService) to complete the operations we need.

Then let’s talk about the key principles of Java SPI work in detail - **ServiceLoader**.

## ServiceLoader

### ServiceLoader specific implementation

If you want to use Java's SPI mechanism, you need to rely on `ServiceLoader` to achieve it, so let's take a look at how `ServiceLoader` does it specifically:

`ServiceLoader` is a tool class provided by JDK, located under the `package java.util;` package.

```plain
A facility to load implementations of a service.
```

This is the official comment from the JDK: **A tool for loading service implementations. **

Looking further down, we find that this class is a `final` type, so it cannot be modified by inheritance, and it implements the `Iterable` interface. The reason why iterators are implemented is to facilitate the subsequent we can obtain the corresponding service implementation through iteration.

```java
public final class ServiceLoader<S> implements Iterable<S>{ xxx...}
```

You can see a familiar constant definition:`private static final String PREFIX = "META-INF/services/";`

The following is the `load` method: You can find that the `load` method supports two overloaded input parameters;

```java
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}

public static <S> ServiceLoader<S> load(Class<S> service,
                                        ClassLoader loader) {
    return new ServiceLoader<>(service, loader);
}

private ServiceLoader(Class<S> svc, ClassLoader cl) {
    service = Objects.requireNonNull(svc, "Service interface cannot be null");
    loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
    acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
    reload();
}

public void reload() {
    providers.clear();
    lookupIterator = new LazyIterator(service, loader);
}
```

The mechanism for solving third-party class loading is actually contained in `ClassLoader cl = Thread.currentThread().getContextClassLoader();`, `cl` is **Thread Context ClassLoader** (Thread Context ClassLoader). This is a class loader held by each thread. The JDK is designed to allow an application or container (such as a web application server) to set this class loader so that the core class library can load application classes through it.

The thread context class loader is the application class loader (Application ClassLoader) by default, which is responsible for loading classes on the classpath. When the core library needs to load an application-provided class, it can do so using a thread context class loader. This way, even core library code loaded by the bootstrap class loader can load and use classes loaded by the application class loader.

According to the calling sequence of the code, the `reload()` method is implemented through an inner class `LazyIterator`. Let’s continue looking below.

After `ServiceLoader` implements the method of `Iterable` interface, it has the ability to iterate. When this `iterator` method is called, it will first search in the `Provider` cache of `ServiceLoader`. If there is no hit in the cache, it will search in `LazyIterator`.

```java

public Iterator<S> iterator() {
    return new Iterator<S>() {

        Iterator<Map.Entry<String, S>> knownProviders
                = providers.entrySet().iterator();

        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext(); // Call LazyIterator
        }

        public S next() {
            if (knownProviders.hasNext())
                return knownProviders.next().getValue();
            return lookupIterator.next(); // Call LazyIterator
        }

        public void remove() {
            throw new UnsupportedOperationException();
        }

    };
}
```

When calling `LazyIterator`, the specific implementation is as follows:

```java

public boolean hasNext() {
    if (acc == null) {
        return hasNextService();
    } else {
        PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
            public Boolean run() {
                return hasNextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private boolean hasNextService() {
    if (nextName != null) {
        return true;
    }
    if (configs == null) {
        try {
            //Get the corresponding configuration file through PREFIX (META-INF/services/) and class name to get the specific implementation class
            String fullName = PREFIX + service.getName();
            if (loader == null)
                configs = ClassLoader.getSystemResources(fullName);
            else
                configs = loader.getResources(fullName);
        } catch (IOException x) {
            fail(service, "Error locating configuration files", x);
        }
    }
    while ((pending == null) || !pending.hasNext()) {
        if (!configs.hasMoreElements()) {
            return false;
        }
        pending = parse(service, configs.nextElement());
    }
    nextName = pending.next();
    return true;
}


public S next() {
    if (acc == null) {
        return nextService();
    } else {
        PrivilegedAction<S> action = new PrivilegedAction<S>() {
            public S run() {
                return nextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private S nextService() {
    if (!hasNextService())
        throw new NoSuchElementException();
    String cn = nextName;
    nextName = null;
    Class<?> c = null;
    try {
        c = Class.forName(cn, false, loader);
    } catch (ClassNotFoundException x) {
        fail(service,
                "Provider " + cn + " not found");
    }
    if (!service.isAssignableFrom(c)) {
        fail(service,
                "Provider " + cn + " not a subtype");
    }
    try {
        S p = service.cast(c.newInstance());
        providers.put(cn, p);
        return p;
    } catch (Throwable x) {
        fail(service,
                "Provider " + cn + " could not be instantiated",
                x);
    }
    throw new Error(); // This cannot happen
}```

Many people may find this a bit complicated, but it doesn’t matter. I have implemented a simple small model of `ServiceLoader`. The process and principles are consistent. You can start by implementing a simple version yourself:

### Implement a ServiceLoader yourself

I'll post the code first:

```java
package edu.jiangxuan.up.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class MyServiceLoader<S> {

    //Corresponding interface Class template
    private final Class<S> service;

    // There can be multiple corresponding implementation classes, encapsulated with List
    private final List<S> providers = new ArrayList<>();

    // class loader
    private final ClassLoader classLoader;

    // A method exposed to external use. By calling this method, you can start loading your own customized implementation process.
    public static <S> MyServiceLoader<S> load(Class<S> service) {
        return new MyServiceLoader<>(service);
    }

    // Privatize the constructor
    private MyServiceLoader(Class<S> service) {
        this.service = service;
        this.classLoader = Thread.currentThread().getContextClassLoader();
        doLoad();
    }

    //Key method, loading the logic of the specific implementation class
    private void doLoad() {
        try {
            // Read the files under the META-INF/services package in all jar packages. The file name is the interface name, and the content in the file is the path to the specific implementation class plus the full class name.
            Enumeration<URL> urls = classLoader.getResources("META-INF/services/" + service.getName());
            // Traverse the retrieved files one by one
            while (urls.hasMoreElements()) {
                // Get the current file
                URL url = urls.nextElement();
                System.out.println("File = " + url.getPath());
                // Create link
                URLConnection urlConnection = url.openConnection();
                urlConnection.setUseCaches(false);
                // Get the file input stream
                InputStream inputStream = urlConnection.getInputStream();
                // Get cache from file input stream
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                // Get the full class name of the implementation class from the file content
                String className = bufferedReader.readLine();

                while (className != null) {
                    // Get the instance of the implementation class through reflection
                    Class<?> clazz = Class.forName(className, false, classLoader);
                    // If the declared interface is of the same type as the specific implementation class, (which can be understood as a kind of polymorphism in Java, the relationship between the interface and the implementation class, parent class, subclass, etc.), then construct an instance
                    if (service.isAssignableFrom(clazz)) {
                        Constructor<? extends S> constructor = (Constructor<? extends S>) clazz.getConstructor();
                        S instance = constructor.newInstance();
                        //Add the currently constructed instance object to the Provider's list
                        providers.add(instance);
                    }
                    // Continue to read the implementation class of the next line. There can be multiple implementation classes, and you only need to wrap the line.
                    className = bufferedReader.readLine();
                }
            }
        } catch (Exception e) {
            System.out.println("Exception in reading file...");
        }
    }

    //Return the list of specific implementation classes corresponding to the spi interface
    public List<S> getProviders() {
        return providers;
    }
}
```

The key information has basically been described through code comments.

The main process is:

1. Find the corresponding file from the `/META-INF/services` directory of the jar package through the URL tool class.
2. Read the name of this file to find the corresponding spi interface.
3. Read the full class name of the specific implementation class in the file through the `InputStream` stream.
4. Based on the obtained full class name, first determine whether it is the same type as the spi interface. If so, then construct the corresponding instance object through the reflection mechanism.
5. Add the constructed instance object to the list of `Providers`.

## Summary

In fact, it is not difficult to find that the specific implementation of the SPI mechanism is essentially completed through reflection. That is: **We declare the specific implementation class to be exposed for external use in the `META-INF/services/` file according to regulations. **

In addition, the SPI mechanism is applied in many frameworks: the basic principles of the Spring framework are also similar. There is also the Dubbo framework that provides the same SPI extension mechanism. However, the specific implementation of the SPI mechanism in the Dubbo and spring frameworks is slightly different from what we learned today. However, the overall principles are the same. I believe that by studying the SPI mechanism in the JDK, you can understand everything and deepen your understanding of other advanced frameworks.

The SPI mechanism can greatly improve the flexibility of interface design, but the SPI mechanism also has some shortcomings, such as:

1. Iteratively loads all implementation classes, which is relatively inefficient;
2. When multiple `ServiceLoader` `load` at the same time, there will be concurrency problems.

<!-- @include: @article-footer.snippet.md -->