---
title: Detailed explanation of SpringBoot automatic assembly principle
category: framework
tag:
  - SpringBoot
---

> Author: [Miki-byte-1024](https://github.com/Miki-byte-1024) & [Snailclimb](https://github.com/Snailclimb)

Every time I am asked about Spring Boot, the interviewer likes to ask this question very much: "Tell me about the principle of Spring Boot automatic assembly?".

I think we can answer from the following aspects:

1. What is SpringBoot autowiring?
2. How does SpringBoot implement automatic assembly? How to implement on-demand loading?
3. How to implement a Starter?

Due to length issues, this article does not go into depth. Friends can also directly use debug to take a look at the source code of the SpringBoot automatic assembly part.

## Preface

Friends who have used Spring must have the fear of being dominated by XML configuration. Even though Spring later introduced annotation-based configuration, we still need to use XML or Java for explicit configuration when turning on certain Spring features or introducing third-party dependencies.

Give an example. When there is no Spring Boot, when we write a RestFul Web service, we first need to configure it as follows.

```java
@Configuration
public class RESTConfiguration
{
    @Bean
    public View jsonTemplate() {
        MappingJackson2JsonView view = new MappingJackson2JsonView();
        view.setPrettyPrint(true);
        return view;
    }

    @Bean
    public ViewResolver viewResolver() {
        return new BeanNameViewResolver();
    }
}
```

`spring-servlet.xml`

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/context/ http://www.springframework.org/schema/context/spring-context.xsd
    http://www.springframework.org/schema/mvc/ http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <context:component-scan base-package="com.howtodoinjava.demo" />
    <mvc:annotation-driven />

    <!-- JSON Support -->
    <bean name="viewResolver" class="org.springframework.web.servlet.view.BeanNameViewResolver"/>
    <bean name="jsonTemplate" class="org.springframework.web.servlet.view.json.MappingJackson2JsonView"/>

</beans>
```

However, for the Spring Boot project, we only need to add relevant dependencies without configuration. Just start the `main` method below.

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

Moreover, we can set the project through Spring Boot's global configuration file `application.properties` or `application.yml`, such as changing the port number, configuring JPA properties, etc.

**Why is Spring Boot so fun to use? ** This is due to its automatic assembly. **Automatic assembly can be said to be the core of Spring Boot. So what exactly is automatic assembly? **

## What is SpringBoot autowiring?

When we talk about automatic assembly now, we usually associate it with Spring Boot. However, in fact, Spring Framework has already implemented this feature. Spring Boot only further optimizes it through SPI.

> SpringBoot defines a set of interface specifications. This set of specifications stipulates that SpringBoot will scan the `META-INF/spring.factories` file in the external reference jar package at startup, load the type information configured in the file into the Spring container (this involves the JVM class loading mechanism and Spring's container knowledge), and perform various operations defined in the class. For external jars, you only need to follow the standards defined by SpringBoot to install your own functions into SpringBoot.
> Since Spring Boot 3.0, the path of the auto-configuration package has been changed from `META-INF/spring.factories` to `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

Without Spring Boot, if we need to introduce third-party dependencies, we need to configure them manually, which is very troublesome. However, in Spring Boot, we can directly introduce a starter. For example, if you want to use redis in your project, you can directly introduce the corresponding starter into the project.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

After introducing the starter, we can use the functions provided by third-party components with a few annotations and some simple configurations.

In my opinion, automatic assembly can be simply understood as: **A certain function can be implemented with the help of Spring Boot through annotations or some simple configurations. **

## How does SpringBoot implement automatic assembly?

Let’s first take a look at SpringBoot’s core annotation `SpringBootApplication`.

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
<1.>@SpringBootConfiguration
<2.>@ComponentScan
<3.>@EnableAutoConfiguration
public @interface SpringBootApplication {

}

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration //Actually it is also a configuration class
public @interface SpringBootConfiguration {
}
```

You can probably think of `@SpringBootApplication` as a collection of `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan` annotations. According to the SpringBoot official website, the functions of these three annotations are:

- `@EnableAutoConfiguration`: Enable SpringBoot’s automatic configuration mechanism
- `@Configuration`: allows registering additional beans in the context or importing other configuration classes- `@ComponentScan`: Scan beans annotated with `@Component` (`@Service`, `@Controller`). By default, the annotation will scan all classes under the package where the startup class is located. You can customize certain beans not to be scanned. As shown in the figure below, `TypeExcludeFilter` and `AutoConfigurationExcludeFilter` will be excluded from the container.

![](https://oss.javaguide.cn/p3-juejin/bcc73490afbe4c6ba62acde6a94ffdfd~tplv-k3u1fbpfcp-watermark.png)

`@EnableAutoConfiguration` is an important annotation for realizing automatic assembly. We start with this annotation.

### @EnableAutoConfiguration: Core annotations to implement automatic assembly

`EnableAutoConfiguration` is just a simple annotation. The core function of automatic assembly is actually implemented through the `AutoConfigurationImportSelector` class.

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage //Function: Register all components under the main package into the container
@Import({AutoConfigurationImportSelector.class}) //Load the automatic assembly class xxxAutoconfiguration
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}
```

Let us now focus on analyzing what the `AutoConfigurationImportSelector` class does?

### AutoConfigurationImportSelector: Load automatic assembly class

The inheritance system of the `AutoConfigurationImportSelector` class is as follows:

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector, BeanClassLoaderAware, ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {

}

public interface DeferredImportSelector extends ImportSelector {

}

public interface ImportSelector {
    String[] selectImports(AnnotationMetadata var1);
}
```

It can be seen that the `AutoConfigurationImportSelector` class implements the `ImportSelector` interface, and also implements the `selectImports` method in this interface. This method is mainly used to **obtain the fully qualified class names of all qualified classes, which need to be loaded into the IoC container**.

```java
private static final String[] NO_IMPORTS = new String[0];

public String[] selectImports(AnnotationMetadata annotationMetadata) {
        // <1>. Determine whether the automatic assembly switch is turned on
        if (!this.isEnabled(annotationMetadata)) {
            return NO_IMPORTS;
        } else {
          //<2>. Get all beans that need to be assembled
            AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader.loadMetadata(this.beanClassLoader);
            AutoConfigurationImportSelector.AutoConfigurationEntry autoConfigurationEntry = this.getAutoConfigurationEntry(autoConfigurationMetadata, annotationMetadata);
            return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
        }
    }
```

Here we need to focus on the `getAutoConfigurationEntry()` method, which is mainly responsible for loading the automatic configuration class.

The method call chain is as follows:

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/3c1200712655443ca4b38500d615bb70~tplv-k3u1fbpfcp-watermark.png)

Now let's analyze it in detail based on the source code of `getAutoConfigurationEntry()`:

```java
private static final AutoConfigurationEntry EMPTY_ENTRY = new AutoConfigurationEntry();

AutoConfigurationEntry getAutoConfigurationEntry(AutoConfigurationMetadata autoConfigurationMetadata, AnnotationMetadata annotationMetadata) {
        //<1>.
        if (!this.isEnabled(annotationMetadata)) {
            return EMPTY_ENTRY;
        } else {
            //<2>.
            AnnotationAttributes attributes = this.getAttributes(annotationMetadata);
            //<3>.
            List<String> configurations = this.getCandidateConfigurations(annotationMetadata, attributes);
            //<4>.
            configurations = this.removeDuplicates(configurations);
            Set<String> exclusions = this.getExclusions(annotationMetadata, attributes);
            this.checkExcludedClasses(configurations, exclusions);
            configurations.removeAll(exclusions);
            configurations = this.filter(configurations, autoConfigurationMetadata);
            this.fireAutoConfigurationImportEvents(configurations, exclusions);
            return new AutoConfigurationImportSelector.AutoConfigurationEntry(configurations, exclusions);
        }
    }
```

**Step 1**:

Determine whether the automatic assembly switch is turned on. Default `spring.boot.enableautoconfiguration=true`, can be set in `application.properties` or `application.yml`

![](https://oss.javaguide.cn/p3-juejin/77aa6a3727ea4392870f5cccd09844ab~tplv-k3u1fbpfcp-watermark.png)

**Step 2**:

Used to get `exclude` and `excludeName` in `EnableAutoConfiguration` annotation.![](https://oss.javaguide.cn/p3-juejin/3d6ec93bbda1453aa08c52b49516c05a~tplv-k3u1fbpfcp-zoom-1.png)

**Step 3**

Get all configuration classes that need to be automatically assembled and read `META-INF/spring.factories`

```plain
spring-boot/spring-boot-project/spring-boot-autoconfigure/src/main/resources/META-INF/spring.factories
```

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/58c51920efea4757aa1ec29c6d5f9e36~tplv-k3u1fbpfcp-watermark.png)

As you can see from the picture below, the configuration content of this file has been read by us. The function of `XXXAutoConfiguration` is to load components on demand.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/94d6e1a060ac41db97043e1758789026~tplv-k3u1fbpfcp-watermark.png)

Not only `META-INF/spring.factories` under this dependency is read, but all `META-INF/spring.factories` under Spring Boot Starter will be read.

So, you can clearly see that the Spring Boot Starter of the druid database connection pool created the `META-INF/spring.factories` file.

If we want to create a Spring Boot Starter ourselves, this step is essential.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/68fa66aeee474b0385f94d23bcfe1745~tplv-k3u1fbpfcp-watermark.png)

**Step 4**:

At this point, the interviewer may ask you: "With so many configurations in `spring.factories`, do you need to load them all every time you start it?".

Obviously, this is unrealistic. When we debug, you will find that the value of `configurations` becomes smaller.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/267f8231ae2e48d982154140af6437b0~tplv-k3u1fbpfcp-watermark.png)

Because this step has gone through a screening process, and all the conditions in `@ConditionalOnXXX` are met before this class will take effect.

```java
@Configuration
// Check whether related classes: RabbitTemplate and Channel exist
// Will be loaded only if it exists
@ConditionalOnClass({ RabbitTemplate.class, Channel.class })
@EnableConfigurationProperties(RabbitProperties.class)
@Import(RabbitAnnotationDrivenConfiguration.class)
public class RabbitAutoConfiguration {
}
```

Interested children's shoes can learn more about the condition annotations provided by Spring Boot.

- `@ConditionalOnBean`: When there is a specified Bean in the container
- `@ConditionalOnMissingBean`: When there is no Bean specified in the container
- `@ConditionalOnSingleCandidate`: When there is only one specified Bean in the container, or there are multiple Beans but the preferred Bean is specified
- `@ConditionalOnClass`: When there is a specified class in the class path
- `@ConditionalOnMissingClass`: When there is no specified class in the class path
- `@ConditionalOnProperty`: Whether the specified property has the specified value
- `@ConditionalOnResource`: whether the classpath has the specified value
- `@ConditionalOnExpression`: based on SpEL expression as judgment condition
- `@ConditionalOnJava`: based on Java version as a judgment condition
- `@ConditionalOnJndi`: The difference is at the specified position under the condition that JNDI exists
- `@ConditionalOnNotWebApplication`: When the current project is not a Web project
- `@ConditionalOnWebApplication`: Under the condition that the current project is a Web project

## How to implement a Starter

Just talk without practicing tricks, now let’s create a starter to implement a custom thread pool

The first step is to create the `threadpool-spring-boot-starter` project

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/1ff0ebe7844f40289eb60213af72c5a6~tplv-k3u1fbpfcp-watermark.png)

The second step is to introduce Spring Boot related dependencies

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/5e14254276604f87b261e5a80a354cc0~tplv-k3u1fbpfcp-watermark.png)

The third step is to create `ThreadPoolAutoConfiguration`

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/1843f1d12c5649fba85fd7b4e4a59e39~tplv-k3u1fbpfcp-watermark.png)

The fourth step is to create the `META-INF/spring.factories` file under the resources package of the `threadpool-spring-boot-starter` project.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/97b738321f1542ea8140484d6aaf0728~tplv-k3u1fbpfcp-watermark.png)

Finally, the new project introduces `threadpool-spring-boot-starter`

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/edcdd8595a024aba85b6bb20d0e3fed4~tplv-k3u1fbpfcp-watermark.png)

Test passed! ! !

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/9a265eea4de742a6bbdbbaa75f437307~tplv-k3u1fbpfcp-watermark.png)

## Summary

Spring Boot turns on automatic assembly through `@EnableAutoConfiguration`, and finally loads the automatic configuration class in `META-INF/spring.factories` through SpringFactoriesLoader to implement automatic assembly. The automatic configuration class is actually a configuration class loaded on demand through `@Conditional`. For it to take effect, the `spring-boot-starter-xxx` package must be introduced to realize the starting dependency.

<!-- @include: @article-footer.snippet.md -->