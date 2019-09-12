

> 本文由JavaGuide整理翻译自（做了适当删减和修改）：
>
> - https://www.javaguides.net/2018/11/spring-boot-interview-questions-and-answers.html
> - https://www.algrim.co/posts/101-spring-boot-interview-questions 

### 1. 什么是 Spring Boot?

首先，重要的是要理解 Spring Boot 并不是一个框架，它是一种创建独立应用程序的更简单方法，只需要很少或没有配置（相比于 Spring 来说）。Spring Boot最好的特性之一是它利用现有的 Spring 项目和第三方项目来开发适合生产的应用程序。

### 2. 说出使用Spring Boot的主要优点

1. 开发基于 Spring 的应用程序很容易。
2. Spring Boot 项目所需的开发或工程时间明显减少，通常会提高整体生产力。
3. Spring Boot不需要编写大量样板代码、XML配置和注释。
4. Spring引导应用程序可以很容易地与Spring生态系统集成，如Spring JDBC、Spring ORM、Spring Data、Spring Security等。
5. Spring Boot遵循“固执己见的默认配置”，以减少开发工作（默认配置可以修改）。
6. Spring Boot 应用程序提供嵌入式HTTP服务器，如Tomcat和Jetty，可以轻松地开发和测试web应用程序。（这点很赞！普通运行Java程序的方式就能运行基于Spring Boot web 项目，省事很多）
7. Spring Boot提供命令行接口(CLI)工具，用于开发和测试Spring Boot应用程序，如Java或Groovy。
8. Spring Boot提供了多种插件，可以使用内置工具(如Maven和Gradle)开发和测试Spring Boot应用程序。

### 3. 为什么需要Spring Boot?

Spring Framework旨在简化J2EE企业应用程序开发。Spring Boot Framework旨在简化Spring开发。

![why-we-need-springboot](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/why-we-need-springboot.png)

### 4. 什么是 Spring Boot Starters?

Spring Boot Starters 是一系列依赖关系的集合，因为它的存在，项目的依赖之间的关系对我们来说变的更加简单了。举个例子：在没有Spring Boot Starters之前，我们开发REST服务或Web应用程序时; 我们需要使用像Spring MVC，Tomcat和Jackson这样的库，这些依赖我们需要手动一个一个添加。但是，有了 Spring Boot Starters 我们只需要一个只需添加一个**spring-boot-starter-web**一个依赖就可以了，这个依赖包含的字依赖中包含了我们开发REST 服务需要的所有依赖。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 如何在Spring Boot应用程序中使用Jetty而不是Tomcat?

Spring Boot Web starter使用Tomcat作为默认的嵌入式servlet容器, 如果你想使用 Jetty 的话只需要修改pom.xml(Maven)或者build.gradle(Gradle)就可以了。

**Maven:**

```xml
<!--从Web启动器依赖中排除Tomcat-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
	<exclusions>
		<exclusion>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-tomcat</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!--添加Jetty依赖-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

**Gradle:**

```groovy
compile("org.springframework.boot:spring-boot-starter-web") {
     exclude group: 'org.springframework.boot', module: 'spring-boot-starter-tomcat'
}
compile("org.springframework.boot:spring-boot-starter-jetty")
```

说个题外话，从上面可以看出使用 Gradle 更加简洁明了，但是国内目前还是 Maven 使用的多一点，我个人觉得 Gradle 在很多方面都要好很多。

### 介绍一下@SpringBootApplication注解

```java
package org.springframework.boot.autoconfigure;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
		@Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
   ......
}
```

```java
package org.springframework.boot;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
public @interface SpringBootConfiguration {

}
```

可以看出大概可以把 `@SpringBootApplication `看作是 `@Configuration`、`@EnableAutoConfiguration`、`@ComponentScan ` 注解的集合。根据 SpringBoot官网，这三个注解的作用分别是：

- `@EnableAutoConfiguration`：启用 SpringBoot 的自动配置机制
- `@ComponentScan`： 扫描被`@Component` (`@Service`,`@Controller`)注解的bean，注解默认会扫描该类所在的包下所有的类。
- `@Configuration`：允许在上下文中注册额外的bean或导入其他配置类

