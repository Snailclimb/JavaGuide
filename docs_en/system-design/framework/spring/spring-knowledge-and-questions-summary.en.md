---
title: Spring常见面试题总结
category: 框架
tag:
  - Spring
---

<!-- @include: @small-advertisement.snippet.md -->

这篇文章主要是想通过一些问题，加深大家对于 Spring 的理解，所以不会涉及太多的代码！

下面的很多问题我自己在使用 Spring 的过程中也并没有注意，自己也是临时查阅了很多资料和书籍补上的。网上也有一些很多关于 Spring 常见问题/面试题整理的文章，我感觉大部分都是互相 copy，而且很多问题也不是很好，有些回答也存在问题。所以，自己花了一周的业余时间整理了一下，希望对大家有帮助。

## Spring 基础

### 什么是 Spring 框架?

Spring 是一款开源的轻量级 Java 开发框架，旨在提高开发人员的开发效率以及系统的可维护性。

我们一般说 Spring 框架指的都是 Spring Framework，它是很多模块的集合，使用这些模块可以很方便地协助我们进行开发，比如说 Spring 支持 IoC（Inversion of Control:控制反转） 和 AOP(Aspect-Oriented Programming:面向切面编程)、可以很方便地对数据库进行访问、可以很方便地集成第三方组件（电子邮件，任务，调度，缓存等等）、对单元测试支持比较好、支持 RESTful Java 应用程序的开发。

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/38ef122122de4375abcd27c3de8f60b4.png)

Spring 最核心的思想就是不重新造轮子，开箱即用，提高开发效率。

Spring 翻译过来就是春天的意思，可见其目标和使命就是为 Java 程序员带来春天啊！感动！

🤐 多提一嘴：**语言的流行通常需要一个杀手级的应用，Spring 就是 Java 生态的一个杀手级的应用框架。**

Spring 提供的核心功能主要是 IoC 和 AOP。学习 Spring ，一定要把 IoC 和 AOP 的核心思想搞懂！

- Spring 官网：<https://spring.io/>
- GitHub 地址： <https://github.com/spring-projects/spring-framework>

### Spring 包含的模块有哪些？

**Spring4.x 版本**：

![Spring4.x主要模块](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/jvme0c60b4606711fc4a0b6faf03230247a.png)

**Spring5.x 版本**：

![Spring5.x主要模块](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/20200831175708.png)

Spring5.x 版本中 Web 模块的 Portlet 组件已经被废弃掉，同时增加了用于异步响应式处理的 WebFlux 组件。

Spring 各个模块的依赖关系如下：

![Spring 各个模块的依赖关系](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/20200902100038.png)

#### Core Container

Spring 框架的核心模块，也可以说是基础模块，主要提供 IoC 依赖注入功能的支持。Spring 其他所有的功能基本都需要依赖于该模块，我们从上面那张 Spring 各个模块的依赖关系图就可以看出来。

- **spring-core**：Spring 框架基本的核心工具类。
- **spring-beans**：提供对 bean 的创建、配置和管理等功能的支持。
- **spring-context**：提供对国际化、事件传播、资源加载等功能的支持。
- **spring-expression**：提供对表达式语言（Spring Expression Language） SpEL 的支持，只依赖于 core 模块，不依赖于其他模块，可以单独使用。

#### AOP

- **spring-aspects**：该模块为与 AspectJ 的集成提供支持。
- **spring-aop**：提供了面向切面的编程实现。
- **spring-instrument**：提供了为 JVM 添加代理（agent）的功能。 具体来讲，它为 Tomcat 提供了一个织入代理，能够为 Tomcat 传递类文 件，就像这些文件是被类加载器加载的一样。没有理解也没关系，这个模块的使用场景非常有限。

#### Data Access/Integration

- **spring-jdbc**：提供了对数据库访问的抽象 JDBC。不同的数据库都有自己独立的 API 用于操作数据库，而 Java 程序只需要和 JDBC API 交互，这样就屏蔽了数据库的影响。
- **spring-tx**：提供对事务的支持。
- **spring-orm**：提供对 Hibernate、JPA、iBatis 等 ORM 框架的支持。
- **spring-oxm**：提供一个抽象层支撑 OXM(Object-to-XML-Mapping)，例如：JAXB、Castor、XMLBeans、JiBX 和 XStream 等。
- **spring-jms** : 消息服务。自 Spring Framework 4.1 以后，它还提供了对 spring-messaging 模块的继承。

#### Spring Web

- **spring-web**：对 Web 功能的实现提供一些最基础的支持。
- **spring-webmvc**：提供对 Spring MVC 的实现。
- **spring-websocket**：提供了对 WebSocket 的支持，WebSocket 可以让客户端和服务端进行双向通信。
- **spring-webflux**：提供对 WebFlux 的支持。WebFlux 是 Spring Framework 5.0 中引入的新的响应式框架。与 Spring MVC 不同，它不需要 Servlet API，是完全异步。

#### Messaging

**spring-messaging** 是从 Spring4.0 开始新加入的一个模块，主要职责是为 Spring 框架集成一些基础的报文传送应用。

#### Spring Test

Spring 团队提倡测试驱动开发（TDD）。有了控制反转 (IoC)的帮助，单元测试和集成测试变得更简单。

Spring 的测试模块对 JUnit（单元测试框架）、TestNG（类似 JUnit）、Mockito（主要用来 Mock 对象）、PowerMock（解决 Mockito 的问题比如无法模拟 final, static， private 方法）等等常用的测试框架支持的都比较好。

### Spring,Spring MVC,Spring Boot 之间什么关系?

很多人对 Spring,Spring MVC,Spring Boot 这三者傻傻分不清楚！这里简单介绍一下这三者，其实很简单，没有什么高深的东西。

Spring 包含了多个功能模块（上面刚刚提到过），其中最重要的是 Spring-Core（主要提供 IoC 依赖注入功能的支持） 模块， Spring 中的其他模块（比如 Spring MVC）的功能实现基本都需要依赖于该模块。

下图对应的是 Spring4.x 版本。目前最新的 5.x 版本中 Web 模块的 Portlet 组件已经被废弃掉，同时增加了用于异步响应式处理的 WebFlux 组件。

![Spring主要模块](https://oss.javaguide.cn/github/javaguide/jvme0c60b4606711fc4a0b6faf03230247a.png)

Spring MVC 是 Spring 中的一个很重要的模块，主要赋予 Spring 快速构建 MVC 架构的 Web 程序的能力。MVC 是模型(Model)、视图(View)、控制器(Controller)的简写，其核心思想是通过将业务逻辑、数据、显示分离来组织代码。

![](https://oss.javaguide.cn/java-guide-blog/image-20210809181452421.png)

使用 Spring 进行开发各种配置过于麻烦比如开启某些 Spring 特性时，需要用 XML 或 Java 进行显式配置。于是，Spring Boot 诞生了！

Spring 旨在简化 J2EE 企业应用程序开发。Spring Boot 旨在简化 Spring 开发（减少配置文件，开箱即用！）。

Spring Boot only simplifies the configuration. If you need to build a Web program with an MVC architecture, you still need to use Spring MVC as the MVC framework. It just means that Spring Boot helps you simplify a lot of Spring MVC configuration, so that it can truly be used out of the box!

## Spring IoC

### What is IoC?

IoC (Inversion of Control) means inversion of control/inversion of control. It is an idea not a technical implementation. Describes: the creation and management of objects in the Java development field.

For example: existing class A depends on class B

- **Traditional development method**: Often in class A, an object of B is manually new using the new keyword.
- **Development method using IoC ideas**: Do not create objects through the new keyword, but use the IoC container (Spring framework) to help us instantiate objects. Which object we need can be retrieved directly from the IoC container.

Judging from the comparison of the above two development methods: we "lost a power" (the power to create and manage objects), and thus also gained a benefit (no need to consider the creation and management of objects, etc.)

**Why is it called inversion of control?**

- **Control**: refers to the power to create (instantiate, manage) objects
- **Inversion**: control is given to the external environment (IoC container)

![IoC illustration](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration.png)

### What problem does IoC solve?

The idea of IoC is that the two parties do not depend on each other, and the third-party container manages related resources. What are the benefits of this?

1. The degree of coupling or dependence between objects is reduced;
2. Resources become easier to manage; for example, if you use the Spring container to provide it, you can easily implement a singleton.

For example: There is an existing operation for User, which is developed using the two-layer structure of Service and Dao.

Without using the IoC idea, if the Service layer wants to use the specific implementation of the Dao layer, it needs to manually new the specific implementation class `UserDaoImpl` of `IUserDao` in `UserServiceImpl` through the new keyword (the interface class cannot be new directly).

It's perfect, this method is also achievable, but let's imagine the following scenario:

During the development process, I suddenly received a new requirement and developed another specific implementation class for the `IUserDao` interface. Because the Server layer relies on the specific implementation of `IUserDao`, we need to modify the new object in `UserServiceImpl`. If only one class references the specific implementation of `IUserDao`, you may feel that it is okay, and it is not very laborious to modify. However, if there are many places that reference the specific implementation of `IUserDao`, once you need to change the implementation of `IUserDao`, it will be a very headache to modify.

![IoC&Aop-ioc-illustration-dao-service](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao-service.png)

Using the idea of ​​IoC, we hand over the control of objects (creation and management) to the IoC container. When we use it, we can directly "ask" it from the IoC container.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao.png)

### What is Spring Bean?

Simply put, Bean refers to the objects managed by the IoC container.

We need to tell the IoC container which objects to help us manage. This is defined through configuration metadata. Configuration metadata can be XML files, annotations, or Java configuration classes.

```xml
<!-- Constructor-arg with 'value' attribute -->
<bean id="..." class="...">
   <constructor-arg value="..."/>
</bean>
```

The diagram below briefly illustrates how an IoC container uses configuration metadata to manage objects.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/062b422bd7ac4d53afd28fb74b2bc94d.png)

The two packages `org.springframework.beans` and `org.springframework.context` are the basis for IoC implementation. If you want to study IoC-related source code, you can take a look.

### What are the annotations for declaring a class as a Bean?

- `@Component`: A general annotation that can mark any class as a `Spring` component. If a bean does not know which layer it belongs to, it can be annotated using the `@Component` annotation.
- `@Repository`: corresponds to the persistence layer, which is the Dao layer, and is mainly used for database-related operations.
- `@Service`: Corresponds to the service layer, which mainly involves some complex logic and requires the use of the Dao layer.
- `@Controller`: corresponds to the Spring MVC control layer, mainly used to accept user requests and call the `Service` layer to return data to the front-end page.

### What is the difference between @Component and @Bean?

- The `@Component` annotation acts on classes, while the `@Bean` annotation acts on methods.
- `@Component` is usually automatically detected and automatically assembled into the Spring container through class path scanning (we can use the `@ComponentScan` annotation to define the path to be scanned to find out the classes that need to be assembled and automatically assemble them into the Spring bean container). The `@Bean` annotation usually defines the bean in the method marked with the annotation. `@Bean` tells Spring that this is an instance of a certain class and will be returned to me when I need to use it.
- The `@Bean` annotation is more customizable than the `@Component` annotation, and in many places we can only register beans through the `@Bean` annotation. For example, when we reference a class in a third-party library and need to assemble it into the `Spring` container, this can only be achieved through `@Bean`.

`@Bean` annotation usage example:

```java
@Configuration
public class AppConfig {
    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl();
    }

}
```

The above code is equivalent to the following xml configuration

```xml
<beans>
    <bean id="transferService" class="com.acme.TransferServiceImpl"/>
</beans>
```

The following example is not possible with `@Component`.

```java
@Bean
public OneService getService(status) {
    case (status) {
        when 1:
                return new serviceImpl1();
        when 2:
                return new serviceImpl2();
        when 3:
                return new serviceImpl3();
    }
}
```

### What are the annotations for injecting beans?

Spring's built-in `@Autowired` and JDK's built-in `@Resource` and `@Inject` can be used to inject beans.

| Annotation | Package | Source |
| -------------------------- | ---------------------------------- | ------------ |
| `@Autowired` | `org.springframework.bean.factory` | Spring 2.5+ |
| `@Resource` | `javax.annotation` | Java JSR-250 |
| `@Inject` | `javax.inject` | Java JSR-330 |

`@Autowired` and `@Resource` are used more frequently.

### What is the difference between @Autowired and @Resource?

`@Autowired` is Spring's built-in annotation. The default injection logic is to first match by type (byType), and if there are multiple beans of the same type, try to filter by name (byName).

Specifically:

1. First search for matching beans in the Spring container based on the type of interface/class. If only one Bean that matches the type is found, inject it directly without considering the name;2. If multiple beans of the same type are found (for example, an interface has multiple implementation classes), it will try to match the name of the bean through the attribute name or parameter name (the default bean name is the first letter of the class name in lowercase, unless explicitly specified through `@Bean(name = "...")` or `@Component("...")`).

When there are multiple implementation classes for an interface:

- If the property name is consistent with the name of a Bean, inject the Bean;
- If the property name does not match all bean names, `NoUniqueBeanDefinitionException` will be thrown. In this case, you need to explicitly specify the bean name to be injected through `@Qualifier`.

Example:

```java
// The SmsService interface has two implementation classes: SmsServiceImpl1, SmsServiceImpl2 (both managed by Spring)

// Error: byType matches multiple beans, and the attribute name "smsService" does not match the default names of the two implementation classes (smsServiceImpl1, smsServiceImpl2)
@Autowired
private SmsService smsService;

// Correct: the property name "smsServiceImpl1" matches the default name of the implementation class SmsServiceImpl1
@Autowired
private SmsService smsServiceImpl1;

// Correct: Explicitly specify the bean name "smsServiceImpl1" via @Qualifier
@Autowired
@Qualifier(value = "smsServiceImpl1")
private SmsService smsService;
```

In actual development practice, we still recommend explicitly specifying the name through the `@Qualifier` annotation instead of relying on the name of the variable.

`@Resource` is an annotation provided by JDK. The default injection logic is to first match by name (byName), and if there are multiple beans of the same type, then try to filter by type (byType).

`@Resource` has two important attributes that are commonly used in daily development: `name` (name) and `type` (type).

```java
public @interface Resource {
    String name() default "";
    Class<?> type() default Object.class;
}
```

If only the `name` attribute is specified, the injection method is `byName`, if only the `type` attribute is specified, the injection method is `byType`, if both `name` and `type` attributes are specified (not recommended), the injection method is `byType`+`byName`.

```java
// Error reported, neither byName nor byType can match the bean
@Resource
private SmsService smsService;
// Correctly inject the bean corresponding to the SmsServiceImpl1 object
@Resource
private SmsService smsServiceImpl1;
// Correctly inject the bean corresponding to the SmsServiceImpl1 object (this method is more recommended)
@Resource(name = "smsServiceImpl1")
private SmsService smsService;
```

**Brief summary**:

- `@Autowired` is an annotation provided by Spring, and `@Resource` is an annotation provided by JDK.
- The default injection method of `Autowired` is `byType` (matching based on type), and the default injection method of `@Resource` is `byName` (matching based on name).
- When there are multiple implementation classes for an interface, both `@Autowired` and `@Resource` need to be matched to the corresponding bean by name. `Autowired` can specify the name explicitly through the `@Qualifier` annotation, and `@Resource` can explicitly specify the name through the `name` attribute.
- `@Autowired` supports use on constructors, methods, fields and parameters. `@Resource` is mainly used for injection on fields and methods, and does not support use on constructors or parameters.

Considering that `@Resource` has clearer semantics (name first) and is a Java standard, which can reduce the strong coupling to the Spring framework, we usually recommend using `@Resource`**, especially in scenarios where injection by name is required. `@Autowired` combined with constructor injection has advantages in achieving immutability and coercion of dependency injection, and is also a very good practice.

### What are the ways to inject beans?

Common ways of dependency injection (Dependency Injection, DI):

1. Constructor injection: Dependencies are injected through the constructor of the class.
1. Setter injection: Inject dependencies through the Setter method of the class.
1. Field injection: Use annotations (such as `@Autowired` or `@Resource`) directly on the fields of the class to inject dependencies.

Constructor injection example:

```java
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //...
}
```

Setter injection example:

```java
@Service
public class UserService {

    private UserRepository userRepository;

    // In Spring 4.3 and later versions, @Autowired can be omitted under certain circumstances.
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //...
}
```

Field injection example:

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    //...
}
```

### Constructor injection or Setter injection?

Spring has an official answer to this question: <https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-setter-injection>.

Here I mainly extract, summarize and improve Spring’s official suggestions.

**Spring officially recommends constructor injection**. The advantages of this injection method are as follows:

1. Dependency integrity: Ensure that all required dependencies are injected when the object is created, avoiding the risk of null pointer exceptions.
2. Immutability: Helps create immutable objects and improves thread safety.
3. Initialization guarantee: components are fully initialized before use, reducing potential errors.
4. Testing convenience: In unit testing, simulated dependencies can be passed directly through the constructor without having to rely on the Spring container for injection.

Constructor injection is suitable for handling **required dependencies**, while **Setter injection** is more suitable for **optional dependencies**, which can have default values ​​or be set dynamically during the object life cycle. Although `@Autowired` can be used with Setter methods to handle required dependencies, constructor injection is still a better option.

In some cases (such as third-party classes that don't provide Setter methods), constructor injection may be the only option.

### What are the scopes of Bean?

The scope of Bean in Spring usually has the following types:

- **singleton** : There is only one bean instance in the IoC container. Beans in Spring are all singletons by default, which is an application of the singleton design pattern.
- **prototype** : A new bean instance will be created for each retrieval. In other words, if you call `getBean()` twice in a row, you will get different Bean instances.
- **request** (only available for web applications): Each HTTP request will generate a new bean (request bean), which is only valid within the current HTTP request.
- **session** (available only for web applications): Each HTTP request from a new session will generate a new bean (session bean), which is only valid within the current HTTP session.
- **application/global-session** (available only for web applications): Each web application creates a Bean (application bean) when it starts, which is only valid during the current application startup time.
- **websocket** (available only for web applications): Each WebSocket session generates a new bean.

**How ​​to configure the scope of the bean? **xml mode:

```xml
<bean id="..." class="..." scope="singleton"></bean>
```

Annotation method:

```java
@Bean
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public Person personPrototype() {
    return new Person();
}
```

### Are Beans thread-safe?

Whether a bean in the Spring framework is thread-safe depends on its scope and state.

Here we take the two most commonly used scopes prototype and singleton as examples. The Bean scope in almost all scenarios uses the default singleton. Just focus on the singleton scope.

Under the prototype scope, a new bean instance will be created every time it is obtained. There is no resource competition problem, so there is no thread safety problem. Under the singleton scope, there is only one bean instance in the IoC container, and there may be resource competition issues (depending on whether the bean is stateful). If this bean is stateful, there is a thread safety issue (a stateful bean refers to an object that contains mutable member variables).

Stateful Bean Example:

```java
// Defines a shopping cart class, which contains a List that stores the items in the user's shopping cart
@Component
public class ShoppingCart {
    private List<String> items = new ArrayList<>();

    public void addItem(String item) {
        items.add(item);
    }

    public List<String> getItems() {
        return items;
    }
}
```

However, most beans are actually stateless (no mutable member variables are defined) (such as Dao, Service). In this case, the beans are thread-safe.

Stateless Bean Example:

```java
// A user service is defined, which only contains business logic and does not save any state.
@Component
public class UserService {

    public User findUserById(Long id) {
        //...
    }
    //...
}
```

For thread safety issues of stateful singleton beans, three common solutions are:

1. **Avoid mutable member variables**: Try to design beans to be stateless.
2. **Use `ThreadLocal`**: Save variable member variables in `ThreadLocal` to ensure thread independence.
3. **Use synchronization mechanism**: Use `synchronized` or `ReentrantLock` for synchronization control to ensure thread safety.

Here we take `ThreadLocal` as an example to demonstrate the scenario where `ThreadLocal` saves user login information:

```java
public class UserThreadLocal {

    private UserThreadLocal() {}

    private static final ThreadLocal<SysUser> LOCAL = ThreadLocal.withInitial(() -> null);

    public static void put(SysUser sysUser) {
        LOCAL.set(sysUser);
    }

    public static SysUser get() {
        return LOCAL.get();
    }

    public static void remove() {
        LOCAL.remove();
    }
}
```

### Do you understand the life cycle of Bean?

1. **Create Bean Instance**: The Bean container will first find the Bean definition in the configuration file, and then use the Java Reflection API to create an instance of the Bean.
2. **Bean property assignment/filling**: Set related properties and dependencies for the Bean, such as objects injected by annotations such as `@Autowired`, values ​​injected by `@Value`, dependencies and values ​​injected by the `setter` method or constructor, and various resources injected by `@Resource`.
3. **Bean initialization**:
   - If the Bean implements the `BeanNameAware` interface, call the `setBeanName()` method and pass in the name of the Bean.
   - If the Bean implements the `BeanClassLoaderAware` interface, call the `setBeanClassLoader()` method and pass in the instance of the `ClassLoader` object.
   - If the Bean implements the `BeanFactoryAware` interface, call the `setBeanFactory()` method, passing in the instance of the `BeanFactory` object.
   - Similar to the above, if other `*.Aware` interfaces are implemented, the corresponding methods are called.
   - If there is a `BeanPostProcessor` object related to the Spring container that loaded this bean, execute the `postProcessBeforeInitialization()` method
   - If the Bean implements the `InitializingBean` interface, execute the `afterPropertiesSet()` method.
   - If the Bean definition in the configuration file contains the `init-method` attribute, execute the specified method.
   - If there is a `BeanPostProcessor` object related to the Spring container that loaded this bean, execute the `postProcessAfterInitialization()` method.
4. **Destroy Bean**: Destruction does not mean to destroy the Bean immediately, but to record the destruction method of the Bean first. When the Bean or the container needs to be destroyed in the future, these methods will be called to release the resources held by the Bean.
   - If the Bean implements the `DisposableBean` interface, execute the `destroy()` method.
   - If the Bean definition in the configuration file contains the `destroy-method` attribute, execute the specified Bean destruction method. Alternatively, you can directly mark the method executed before the Bean is destroyed through the `@PreDestroy` annotation.

In the `doCreateBean()` method of `AbstractAutowireCapableBeanFactory`, you can see that these four stages are executed in sequence:

```java
protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final @Nullable Object[] args)
    throws BeanCreationException {

    // 1. Create an instance of the Bean
    BeanWrapper instanceWrapper = null;
    if (instanceWrapper == null) {
        instanceWrapper = createBeanInstance(beanName, mbd, args);
    }

    Object exposedObject = bean;
    try {
        // 2. Bean attribute assignment/filling
        populateBean(beanName, mbd, instanceWrapper);
        // 3. Bean initialization
        exposedObject = initializeBean(beanName, exposedObject, mbd);
    }

    // 4. Destroy Bean-register callback interface
    try {
        registerDisposableBeanIfNecessary(beanName, bean, mbd);
    }

    return exposedObject;
}
```

The `Aware` interface allows beans to obtain Spring container resources.

The main `Aware` interfaces provided in Spring are:

1. `BeanNameAware`: Inject the beanName corresponding to the current bean;
2. `BeanClassLoaderAware`: Inject the ClassLoader that loads the current bean;
3. `BeanFactoryAware`: Inject a reference to the current `BeanFactory` container.

The `BeanPostProcessor` interface is a powerful extension point provided by Spring for modifying beans.

```java
public interface BeanPostProcessor {

	//Initialize preprocessing
	default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

	//Initialization post-processing
	default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

}```

- `postProcessBeforeInitialization`: After Bean instantiation and property injection are completed, the `InitializingBean#afterPropertiesSet` method and the custom `init-method` method are executed;
- `postProcessAfterInitialization`: Similar to the above, but executed after the `InitializingBean#afterPropertiesSet` method and the custom `init-method` method.

`InitializingBean` and `init-method` are extension points provided by Spring for Bean initialization.

```java
public interface InitializingBean {
 //Initialization logic
	void afterPropertiesSet() throws Exception;
}
```

Specify the `init-method` method and specify the initialization method:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="demo" class="com.chaycao.Demo" init-method="init()"/>

</beans>
```

**How to remember? **

1. The whole process can be simply divided into four steps: instantiation —> attribute assignment —> initialization —> destruction.
2. The initialization step involves many steps, including dependency injection of the `Aware` interface, processing of `BeanPostProcessor` before and after initialization, and initialization operations of `InitializingBean` and `init-method`.
3. The destruction step will register the relevant destruction callback interface, and finally destroy it through `DisposableBean` and `destory-method`.

Finally, share a clear diagram (picture source: [How to remember the life cycle of Spring Bean](https://chaycao.github.io/2020/02/15/How to remember the life cycle of Spring-Bean.html)).

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/spring-bean-lifestyle.png)

## Spring AOP

### Talk about your understanding of AOP

AOP (Aspect-Oriented Programming) can encapsulate logic or responsibilities (such as transaction processing, log management, permission control, etc.) that have nothing to do with the business but are commonly called by business modules, which facilitates the reduction of duplicate code in the system, reduces the coupling between modules, and is conducive to future scalability and maintainability.

Spring AOP is based on dynamic proxy. If the object to be proxied implements an interface, then Spring AOP will use **JDK Proxy** to create the proxy object. For objects that do not implement the interface, JDK Proxy cannot be used for proxy. At this time, Spring AOP will use **Cglib** to generate a subclass of the proxied object as a proxy, as shown in the following figure:

![SpringAOPProcess](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/230ae587a322d6e4d09510161987d346.jpeg)

Of course you can also use **AspectJ**! Spring AOP has integrated AspectJ, which should be regarded as the most complete AOP framework in the Java ecosystem.

Some professional terms involved in AOP aspect programming:

| Terminology | Meaning |
| :---------------- | :----------------------------------------------------------------------------------: |
| Target (Target) | Object to be notified |
| Proxy | A proxy object created after applying notifications to the target object |
| JoinPoint | All methods defined in the class to which the target object belongs are join points |
| Pointcut (Pointcut) | The connection point intercepted/enhanced by the aspect (the pointcut point must be the connection point, the connection point is not necessarily the entry point) |
| Advice | Enhanced logic/code, that is, what to do after intercepting the connection point of the target object |
| Aspect | Pointcut + Advice |
| Weaving | The process action of applying notifications to target objects to generate proxy objects |

### What is the difference between Spring AOP and AspectJ AOP?

| Features | Spring AOP | AspectJ |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| **Enhancement method** | Runtime enhancement (based on dynamic proxy) | Compile time enhancement, class loading time enhancement (direct manipulation of bytecode) |
| **Pointcut support** | Method level (within Spring Bean scope, final and staic methods are not supported) | Method level, fields, constructors, static methods, etc. |
| **Performance** | Depends on the agent at runtime, which has a certain overhead, and the performance is low when there are many aspects | There is no agent overhead at runtime, and the performance is higher |
| **Complexity** | Simple, easy to use, suitable for most scenarios | Powerful, but relatively complex |
| **Usage scenarios** | Relatively simple AOP requirements for Spring applications | High-performance, high-complexity AOP requirements |

**How to choose? **

- **Functional considerations**: AspectJ supports more complex AOP scenarios, and Spring AOP is simpler and easier to use. If you need to enhance `final` methods, static methods, field access, constructor calls, etc., or need to apply enhancement logic on non-Spring managed objects, AspectJ is the only choice.
- **Performance considerations**: There is not much performance difference between the two when the number of aspects is small, but when there are more aspects, AspectJ performs better.

**Summary in one sentence**: Use Spring AOP first for simple scenarios; choose AspectJ for complex scenarios or high performance requirements.

### What are the common notification types in AOP?

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/aspectj-advice-types.jpg)

- **Before** (pre-notification): triggered before the method call of the target object
- **After** (post notification): triggered after the method call of the target object
- **AfterReturning** (return notification): The method call of the target object is completed, triggered after the result value is returned
- **AfterThrowing** (Exception notification): Triggered after the target object's method throws/triggers an exception during execution. AfterReturning and AfterThrowing are mutually exclusive. If the method call succeeds without exception, there will be a return value; if the method throws an exception, there will be no return value.- **Around** （环绕通知）：编程式控制目标对象的方法调用。环绕通知是所有通知类型中可操作范围最大的一种，因为它可以直接拿到目标对象，以及要执行的方法，所以环绕通知可以任意的在目标对象的方法调用前后搞事，甚至不调用目标对象的方法

### 多个切面的执行顺序如何控制？

1、通常使用`@Order` 注解直接定义切面顺序

```java
// 值越小优先级越高
@Order(3)
@Component
@Aspect
public class LoggingAspect implements Ordered {
```

**2、实现`Ordered` 接口重写 `getOrder` 方法。**

```java
@Component
@Aspect
public class LoggingAspect implements Ordered {

    // ....

    @Override
    public int getOrder() {
        // 返回值越小优先级越高
        return 1;
    }
}
```

## Spring MVC

### 说说自己对于 Spring MVC 了解?

MVC 是模型(Model)、视图(View)、控制器(Controller)的简写，其核心思想是通过将业务逻辑、数据、显示分离来组织代码。

![](https://oss.javaguide.cn/java-guide-blog/image-20210809181452421.png)

网上有很多人说 MVC 不是设计模式，只是软件设计规范，我个人更倾向于 MVC 同样是众多设计模式中的一种。**[java-design-patterns](https://github.com/iluwatar/java-design-patterns)** 项目中就有关于 MVC 的相关介绍。

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/159b3d3e70dd45e6afa81bf06d09264e.png)

想要真正理解 Spring MVC，我们先来看看 Model 1 和 Model 2 这两个没有 Spring MVC 的时代。

**Model 1 时代**

很多学 Java 后端比较晚的朋友可能并没有接触过 Model 1 时代下的 JavaWeb 应用开发。在 Model1 模式下，整个 Web 应用几乎全部用 JSP 页面组成，只用少量的 JavaBean 来处理数据库连接、访问等操作。

这个模式下 JSP 即是控制层（Controller）又是表现层（View）。显而易见，这种模式存在很多问题。比如控制逻辑和表现逻辑混杂在一起，导致代码重用率极低；再比如前端和后端相互依赖，难以进行测试维护并且开发效率极低。

![mvc-mode1](https://oss.javaguide.cn/java-guide-blog/mvc-mode1.png)

**Model 2 时代**

学过 Servlet 并做过相关 Demo 的朋友应该了解“Java Bean(Model)+ JSP（View）+Servlet（Controller） ”这种开发模式，这就是早期的 JavaWeb MVC 开发模式。

- Model:系统涉及的数据，也就是 dao 和 bean。
- View：展示模型中的数据，只是用来展示。
- Controller：接受用户请求，并将请求发送至 Model，最后返回数据给 JSP 并展示给用户

![](https://oss.javaguide.cn/java-guide-blog/mvc-model2.png)

Model2 模式下还存在很多问题，Model2 的抽象和封装程度还远远不够，使用 Model2 进行开发时不可避免地会重复造轮子，这就大大降低了程序的可维护性和复用性。

于是，很多 JavaWeb 开发相关的 MVC 框架应运而生比如 Struts2，但是 Struts2 比较笨重。

**Spring MVC 时代**

随着 Spring 轻量级开发框架的流行，Spring 生态圈出现了 Spring MVC 框架， Spring MVC 是当前最优秀的 MVC 框架。相比于 Struts2 ， Spring MVC 使用更加简单和方便，开发效率更高，并且 Spring MVC 运行速度更快。

MVC 是一种设计模式，Spring MVC 是一款很优秀的 MVC 框架。Spring MVC 可以帮助我们进行更简洁的 Web 层的开发，并且它天生与 Spring 框架集成。Spring MVC 下我们一般把后端项目分为 Service 层（处理业务）、Dao 层（数据库操作）、Entity 层（实体类）、Controller 层(控制层，返回数据给前台页面)。

### Spring MVC 的核心组件有哪些？

记住了下面这些组件，也就记住了 SpringMVC 的工作原理。

- **`DispatcherServlet`**：**核心的中央处理器**，负责接收请求、分发，并给予客户端响应。
- **`HandlerMapping`**：**处理器映射器**，根据 URL 去匹配查找能处理的 `Handler` ，并会将请求涉及到的拦截器和 `Handler` 一起封装。
- **`HandlerAdapter`**：**处理器适配器**，根据 `HandlerMapping` 找到的 `Handler` ，适配执行对应的 `Handler`；
- **`Handler`**：**请求处理器**，处理实际请求的处理器。
- **`ViewResolver`**：**视图解析器**，根据 `Handler` 返回的逻辑视图 / 视图，解析并渲染真正的视图，并传递给 `DispatcherServlet` 响应客户端

### SpringMVC 工作原理了解吗?

**Spring MVC 原理如下图所示：**

> SpringMVC 工作原理的图解我没有自己画，直接图省事在网上找了一个非常清晰直观的，原出处不明。

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/de6d2b213f112297298f3e223bf08f28.png)

**流程说明（重要）：**

1. 客户端（浏览器）发送请求， `DispatcherServlet`拦截请求。
2. `DispatcherServlet` 根据请求信息调用 `HandlerMapping` 。`HandlerMapping` 根据 URL 去匹配查找能处理的 `Handler`（也就是我们平常说的 `Controller` 控制器） ，并会将请求涉及到的拦截器和 `Handler` 一起封装。
3. `DispatcherServlet` 调用 `HandlerAdapter`适配器执行 `Handler` 。
4. `Handler` 完成对用户请求的处理后，会返回一个 `ModelAndView` 对象给`DispatcherServlet`，`ModelAndView` 顾名思义，包含了数据模型以及相应的视图的信息。`Model` 是返回的数据对象，`View` 是个逻辑上的 `View`。
5. `ViewResolver` 会根据逻辑 `View` 查找实际的 `View`。
6. `DispaterServlet` 把返回的 `Model` 传给 `View`（视图渲染）。
7. 把 `View` 返回给请求者（浏览器）

上述流程是传统开发模式（JSP，Thymeleaf 等）的工作原理。然而现在主流的开发方式是前后端分离，这种情况下 Spring MVC 的 `View` 概念发生了一些变化。由于 `View` 通常由前端框架（Vue, React 等）来处理，后端不再负责渲染页面，而是只负责提供数据，因此：

- 前后端分离时，后端通常不再返回具体的视图，而是返回**纯数据**（通常是 JSON 格式），由前端负责渲染和展示。
- `View` 的部分在前后端分离的场景下往往不需要设置，Spring MVC 的控制器方法只需要返回数据，不再返回 `ModelAndView`，而是直接返回数据，Spring 会自动将其转换为 JSON 格式。相应的，`ViewResolver` 也将不再被使用。

怎么做到呢？

- 使用 `@RestController` 注解代替传统的 `@Controller` 注解，这样所有方法默认会返回 JSON 格式的数据，而不是试图解析视图。
- 如果你使用的是 `@Controller`，可以结合 `@ResponseBody` 注解来返回 JSON。

### 统一异常处理怎么做？

推荐使用注解的方式统一异常处理，具体会使用到 `@ControllerAdvice` + `@ExceptionHandler` 这两个注解 。

```java
@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<?> handleAppException(BaseException ex, HttpServletRequest request) {
      //......
    }

    @ExceptionHandler(value = ResourceNotFoundException.class)
    public ResponseEntity<ErrorReponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
      //......
    }
}
```

In this exception handling method, exception handling logic (AOP) will be woven into all or specified `Controller`. When a method in `Controller` throws an exception, it will be handled by the method decorated with `@ExceptionHandler` annotation.

The `getMappedMethod` method in `ExceptionHandlerMethodResolver` determines which method modified by the `@ExceptionHandler` annotation handles the exception.

```java
@Nullable
  private Method getMappedMethod(Class<? extends Throwable> exceptionType) {
    List<Class<? extends Throwable>> matches = new ArrayList<>();
    //Find all exception information that can be handled. mappedMethods stores the correspondence between exceptions and methods for handling exceptions.
    for (Class<? extends Throwable> mappedException : this.mappedMethods.keySet()) {
      if (mappedException.isAssignableFrom(exceptionType)) {
        matches.add(mappedException);
      }
    }
    // If it is not empty, it means there is a way to handle the exception.
    if (!matches.isEmpty()) {
      // Sort by matching degree from small to large
      matches.sort(new ExceptionDepthComparator(exceptionType));
      //Return the method for handling exceptions
      return this.mappedMethods.get(matches.get(0));
    }
    else {
      return null;
    }
  }
```

It can be seen from the source code: **`getMappedMethod()` will first find all the method information that can match the exception handling, then sort them from small to large, and finally take the smallest matching method (that is, the one with the highest matching degree). **

## What design patterns are used in the Spring framework?

> For a detailed introduction to the following design patterns, you can read my article [Detailed Explanation of Design Patterns in Spring](https://javaguide.cn/system-design/framework/spring/spring-design-patterns-summary.html).

- **Factory Design Pattern**: Spring uses the factory pattern to create bean objects through `BeanFactory` and `ApplicationContext`.
- **Proxy Design Pattern**: Implementation of Spring AOP functionality.
- **Singleton Design Pattern**: Beans in Spring are singletons by default.
- **Template method pattern**: `jdbcTemplate`, `hibernateTemplate` and other classes ending with Template in Spring that operate on the database use the template mode.
- **Wrapper Design Pattern**: Our project needs to connect to multiple databases, and different customers will access different databases according to their needs during each visit. This model allows us to dynamically switch between different data sources according to customer needs.
- **Observer Pattern:** Spring's event-driven model is a classic application of the observer pattern.
- **Adapter Pattern**: Spring AOP enhancements or advice (Advice) use the adapter pattern, and spring MVC also uses the adapter pattern to adapt `Controller`.
-…

## Spring’s circular dependencies

### Do you understand Spring circular dependencies and how to solve them?

Circular dependency refers to the circular reference of Bean objects, where two or more Beans hold references to each other, such as CircularDependencyA → CircularDependencyB → CircularDependencyA.

```java
@Component
public class CircularDependencyA {
    @Autowired
    private CircularDependencyB circB;
}

@Component
public class CircularDependencyB {
    @Autowired
    private CircularDependencyA circA;
}
```

The self-dependence of a single object can also cause circular dependencies, but the probability is extremely low and it is a coding error.

```java
@Component
public class CircularDependencyA {
    @Autowired
    private CircularDependencyA circA;
}
```

The Spring framework solves this problem by using a third-level cache to ensure that beans are created correctly even in the case of circular dependencies.

The third-level cache in Spring is actually three Maps, as follows:

```java
//Level 1 cache
/** Cache of singleton objects: bean name to bean instance. */
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

//Level 2 cache
/** Cache of early singleton objects: bean name to bean instance. */
private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);

//Level 3 cache
/** Cache of singleton factories: bean name to ObjectFactory. */
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
```

Simply put, Spring's third-level cache includes:

1. **Level 1 cache (singletonObjects)**: stores the final form of Bean (already instantiated, filled with properties, and initialized), a singleton pool, which is generated by "Spring's singleton properties". Generally, we get beans from here, but not all beans are in the singleton pool, for example, prototype beans are not in it.
2. **Level 2 cache (earlySingletonObjects)**: Stores transitional beans (semi-finished products, not yet filled with attributes), that is, objects generated by `ObjectFactory` in the third-level cache. Used in conjunction with the third-level cache, it can prevent AOP from generating new proxy objects every time `ObjectFactory#getObject()` is called.
3. **Level 3 cache (singletonFactories)**: Stores `ObjectFactory`. The `getObject()` method of `ObjectFactory` (the `getEarlyBeanReference()` method is ultimately called) can generate the original Bean object or proxy object (if the Bean is proxied by the AOP aspect). Level 3 caching will only take effect for singleton beans.

Next, let’s talk about the process of creating beans in Spring:

1. First go to the **Level 1 cache `singletonObjects`** to get it, and return it if it exists;
2. If it does not exist or the object is being created, then go to the **second-level cache `earlySingletonObjects`** to get it;
3. If it has not been obtained, go to the **Level 3 cache `singletonFactories`** to obtain it. You can obtain the object by executing `getObject()` of `ObjectFacotry`. After the acquisition is successful, remove it from the Level 3 cache and add the object to the Level 2 cache.

Stored in the third-level cache is `ObjectFacoty`:

```java
public interface ObjectFactory<T> {
    T getObject() throws BeansException;
}
```

When Spring creates a Bean, if circular dependencies are allowed, Spring will expose the Bean object that has just been instantiated but whose properties have not yet been initialized. Here, an `ObjectFactory` object is added to the third-level cache through the `addSingletonFactory` method:

```java
// AbstractAutowireCapableBeanFactory # doCreateBean #
public abstract class AbstractAutowireCapableBeanFactory ... {
	protected Object doCreateBean(...) {
        //...

        // Support circular dependencies: add ()->getEarlyBeanReference as the getObject() method of an ObjectFactory object to the third-level cache
		addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
    }
}```

那么上边在说 Spring 创建 Bean 的流程时说了，如果一级缓存、二级缓存都取不到对象时，会去三级缓存中通过 `ObjectFactory` 的 `getObject` 方法获取对象。

```java
class A {
    // 使用了 B
    private B b;
}
class B {
    // 使用了 A
    private A a;
}
```

以上面的循环依赖代码为例，整个解决循环依赖的流程如下：

- 当 Spring 创建 A 之后，发现 A 依赖了 B ，又去创建 B，B 依赖了 A ，又去创建 A；
- 在 B 创建 A 的时候，那么此时 A 就发生了循环依赖，由于 A 此时还没有初始化完成，因此在 **一二级缓存** 中肯定没有 A；
- 那么此时就去三级缓存中调用 `getObject()` 方法去获取 A 的 **前期暴露的对象** ，也就是调用上边加入的 `getEarlyBeanReference()` 方法，生成一个 A 的 **前期暴露对象**；
- 然后就将这个 `ObjectFactory` 从三级缓存中移除，并且将前期暴露对象放入到二级缓存中，那么 B 就将这个前期暴露对象注入到依赖，来支持循环依赖。

**只用两级缓存够吗？** 在没有 AOP 的情况下，确实可以只使用一级和二级缓存来解决循环依赖问题。但是，当涉及到 AOP 时，三级缓存就显得非常重要了，因为它确保了即使在 Bean 的创建过程中有多次对早期引用的请求，也始终只返回同一个代理对象，从而避免了同一个 Bean 有多个代理对象的问题。

**最后总结一下 Spring 如何解决三级缓存**：

在三级缓存这一块，主要记一下 Spring 是如何支持循环依赖的即可，也就是如果发生循环依赖的话，就去 **三级缓存 `singletonFactories`** 中拿到三级缓存中存储的 `ObjectFactory` 并调用它的 `getObject()` 方法来获取这个循环依赖对象的前期暴露对象（虽然还没初始化完成，但是可以拿到该对象在堆中的存储地址了），并且将这个前期暴露对象放到二级缓存中，这样在循环依赖时，就不会重复初始化了！

不过，这种机制也有一些缺点，比如增加了内存开销（需要维护三级缓存，也就是三个 Map），降低了性能（需要进行多次检查和转换）。并且，还有少部分情况是不支持循环依赖的，比如非单例的 bean 和`@Async`注解的 bean 无法支持循环依赖。

### @Lazy 能解决循环依赖吗？

`@Lazy` 用来标识类是否需要懒加载/延迟加载，可以作用在类上、方法上、构造器上、方法参数上、成员变量中。

Spring Boot 2.2 新增了**全局懒加载属性**，开启后全局 bean 被设置为懒加载，需要时再去创建。

配置文件配置全局懒加载：

```properties
#默认false
spring.main.lazy-initialization=true
```

编码的方式设置全局懒加载：

```java
SpringApplication springApplication=new SpringApplication(Start.class);
springApplication.setLazyInitialization(false);
springApplication.run(args);
```

如非必要，尽量不要用全局懒加载。全局懒加载会让 Bean 第一次使用的时候加载会变慢，并且它会延迟应用程序问题的发现（当 Bean 被初始化时，问题才会出现）。

如果一个 Bean 没有被标记为懒加载，那么它会在 Spring IoC 容器启动的过程中被创建和初始化。如果一个 Bean 被标记为懒加载，那么它不会在 Spring IoC 容器启动时立即实例化，而是在第一次被请求时才创建。这可以帮助减少应用启动时的初始化时间，也可以用来解决循环依赖问题。

循环依赖问题是如何通过`@Lazy` 解决的呢？这里举一个例子，比如说有两个 Bean，A 和 B，他们之间发生了循环依赖，那么 A 的构造器上添加 `@Lazy` 注解之后（延迟 Bean B 的实例化），加载的流程如下：

- 首先 Spring 会去创建 A 的 Bean，创建时需要注入 B 的属性；
- 由于在 A 上标注了 `@Lazy` 注解，因此 Spring 会去创建一个 B 的代理对象，将这个代理对象注入到 A 中的 B 属性；
- 之后开始执行 B 的实例化、初始化，在注入 B 中的 A 属性时，此时 A 已经创建完毕了，就可以将 A 给注入进去。

从上面的加载流程可以看出： `@Lazy` 解决循环依赖的关键点在于代理对象的使用。

- **没有 `@Lazy` 的情况下**：在 Spring 容器初始化 `A` 时会立即尝试创建 `B`，而在创建 `B` 的过程中又会尝试创建 `A`，最终导致循环依赖（即无限递归，最终抛出异常）。
- **使用 `@Lazy` 的情况下**：Spring 不会立即创建 `B`，而是会注入一个 `B` 的代理对象。由于此时 `B` 仍未被真正初始化，`A` 的初始化可以顺利完成。等到 `A` 实例实际调用 `B` 的方法时，代理对象才会触发 `B` 的真正初始化。

`@Lazy` 能够在一定程度上打破循环依赖链，允许 Spring 容器顺利地完成 Bean 的创建和注入。但这并不是一个根本性的解决方案，尤其是在构造函数注入、复杂的多级依赖等场景中，`@Lazy` 无法有效地解决问题。因此，最佳实践仍然是尽量避免设计上的循环依赖。

### SpringBoot 允许循环依赖发生么？

SpringBoot 2.6.x 以前是默认允许循环依赖的，也就是说你的代码出现了循环依赖问题，一般情况下也不会报错。SpringBoot 2.6.x 以后官方不再推荐编写存在循环依赖的代码，建议开发者自己写代码的时候去减少不必要的互相依赖。这其实也是我们最应该去做的，循环依赖本身就是一种设计缺陷，我们不应该过度依赖 Spring 而忽视了编码的规范和质量，说不定未来某个 SpringBoot 版本就彻底禁止循环依赖的代码了。

SpringBoot 2.6.x 以后，如果你不想重构循环依赖的代码的话，也可以采用下面这些方法：

- 在全局配置文件中设置允许循环依赖存在：`spring.main.allow-circular-references=true`。最简单粗暴的方式，不太推荐。
- 在导致循环依赖的 Bean 上添加 `@Lazy` 注解，这是一种比较推荐的方式。`@Lazy` 用来标识类是否需要懒加载/延迟加载，可以作用在类上、方法上、构造器上、方法参数上、成员变量中。
- ……

## Spring 事务

关于 Spring 事务的详细介绍，可以看我写的 [Spring 事务详解](https://javaguide.cn/system-design/framework/spring/spring-transaction.html) 这篇文章。

### Spring 管理事务的方式有几种？

- **编程式事务**：在代码中硬编码(在分布式系统中推荐使用) : 通过 `TransactionTemplate`或者 `TransactionManager` 手动管理事务，事务范围过大会出现事务未提交导致超时，因此事务要比锁的粒度更小。
- **声明式事务**：在 XML 配置文件中配置或者直接基于注解（单体应用或者简单业务系统推荐使用） : 实际是通过 AOP 实现（基于`@Transactional` 的全注解方式使用最多）

### Spring 事务中哪几种事务传播行为?

**事务传播行为是为了解决业务层方法之间互相调用的事务问题**。

当事务方法被另一个事务方法调用时，必须指定事务应该如何传播。例如：方法可能继续在现有事务中运行，也可能开启一个新事务，并在自己的事务中运行。

正确的事务传播行为可能的值如下:

**1.`TransactionDefinition.PROPAGATION_REQUIRED`**

使用的最多的一个事务传播行为，我们平时经常使用的`@Transactional`注解默认使用就是这个事务传播行为。如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。

**`2.TransactionDefinition.PROPAGATION_REQUIRES_NEW`**

创建一个新的事务，如果当前存在事务，则把当前事务挂起。也就是说不管外部方法是否开启事务，`Propagation.REQUIRES_NEW`修饰的内部方法会新开启自己的事务，且开启的事务相互独立，互不干扰。

**3.`TransactionDefinition.PROPAGATION_NESTED`**

如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于`TransactionDefinition.PROPAGATION_REQUIRED`。

**4.`TransactionDefinition.PROPAGATION_MANDATORY`**

如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。（mandatory：强制性）

这个使用的很少。

If the following three transaction propagation behaviors are incorrectly configured, the transaction will not be rolled back:

- **`TransactionDefinition.PROPAGATION_SUPPORTS`**: If a transaction currently exists, join the transaction; if there is currently no transaction, continue running in a non-transactional manner.
- **`TransactionDefinition.PROPAGATION_NOT_SUPPORTED`**: Run in non-transactional mode. If a transaction currently exists, the current transaction will be suspended.
- **`TransactionDefinition.PROPAGATION_NEVER`**: Run in non-transactional mode and throw an exception if a transaction currently exists.

### What are the isolation levels in Spring transactions?

Like the transaction propagation behavior, for convenience of use, Spring also defines an enumeration class: `Isolation`

```java
public enum Isolation {

    DEFAULT(TransactionDefinition.ISOLATION_DEFAULT),
    READ_UNCOMMITTED(TransactionDefinition.ISOLATION_READ_UNCOMMITTED),
    READ_COMMITTED(TransactionDefinition.ISOLATION_READ_COMMITTED),
    REPEATABLE_READ(TransactionDefinition.ISOLATION_REPEATABLE_READ),
    SERIALIZABLE(TransactionDefinition.ISOLATION_SERIALIZABLE);

    private final int value;

    Isolation(int value) {
        this.value = value;
    }

    public int value() {
        return this.value;
    }

}
```

Below I will introduce each transaction isolation level in turn:

- **`TransactionDefinition.ISOLATION_DEFAULT`**: Use the default isolation level of the backend database. MySQL uses the `REPEATABLE_READ` isolation level by default and Oracle uses the `READ_COMMITTED` isolation level by default.
- **`TransactionDefinition.ISOLATION_READ_UNCOMMITTED`**: The lowest isolation level. This isolation level is rarely used because it allows reading of uncommitted data changes, which may lead to dirty reads, phantom reads, or non-repeatable reads**
- **`TransactionDefinition.ISOLATION_READ_COMMITTED`**: Allows reading of data that has been submitted by concurrent transactions, **can prevent dirty reads, but phantom reads or non-repeatable reads may still occur**
- **`TransactionDefinition.ISOLATION_REPEATABLE_READ`**: The results of multiple reads of the same field are consistent, unless the data is modified by the own transaction itself. **Dirty reads and non-repeatable reads can be prevented, but phantom reads may still occur. **
- **`TransactionDefinition.ISOLATION_SERIALIZABLE`**: The highest isolation level, fully compliant with ACID isolation level. All transactions are executed one by one in sequence, so that there is no possibility of interference between transactions. In other words, this level can prevent dirty reads, non-repeatable reads, and phantom reads. But this will seriously affect the performance of the program. Normally this level is not used.

### Do you understand the @Transactional(rollbackFor = Exception.class) annotation?

`Exception` is divided into runtime exception `RuntimeException` and non-runtime exception. Transaction management is crucial for enterprise applications to ensure data consistency even if abnormal conditions occur.

When the `@Transactional` annotation is applied to a class, all public methods of the class will have transaction attributes of this type. At the same time, we can also use this annotation at the method level to override the class-level definition.

The default rollback strategy of the `@Transactional` annotation is to roll back the transaction only when encountering `RuntimeException` (runtime exception) or `Error`, and will not roll back `Checked Exception` (checked exception). This is because Spring considers `RuntimeException` and Error to be unexpected errors, while checked exceptions are expected errors that can be handled by business logic.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/spring-transactional-rollbackfor.png)

If you want to modify the default rollback strategy, you can use the `rollbackFor` and `noRollbackFor` attributes of the `@Transactional` annotation to specify which exceptions need to be rolled back and which exceptions do not need to be rolled back. For example, if you want to roll back the transaction on all exceptions, you can use the following annotation:

```java
@Transactional(rollbackFor = Exception.class)
public void someMethod() {
// some business logic
}
```

If you want to prevent certain exceptions from rolling back the transaction, you can use the following annotations:

```java
@Transactional(noRollbackFor = CustomException.class)
public void someMethod() {
// some business logic
}
```

## Spring Data JPA

The important thing about JPA is actual combat, and only a small part of the knowledge points are summarized here.

### How to use JPA to non-persist a field in the database?

Suppose we have the following class:

```java
@Entity(name="USER")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID")
    private Long id;

    @Column(name="USER_NAME")
    private String userName;

    @Column(name="PASSWORD")
    private String password;

    private String secret;

}
```

What if we want the `secrect` field not to be persisted, that is, not stored in the database? We can use the following methods:

```java
static String transient1; // not persistent because of static
final String transient2 = "Satish"; // not persistent because of final
transient String transient3; // not persistent because of transient
@Transient
String transient4; // not persistent because of @Transient
```

Generally, the latter two methods are used more often. I personally use annotations more often.

### What does the audit function of JPA do? What's the use?

The audit function mainly helps us record the specific behaviors of database operations, such as who created a certain record, when it was created, who was the last person to modify it, and when was the last modification time.

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class AbstractAuditBase {

    @CreatedDate
    @Column(updatable = false)
    @JsonIgnore
    private Instant createdAt;

    @LastModifiedDate
    @JsonIgnore
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    @JsonIgnore
    private String createdBy;

    @LastModifiedBy
    @JsonIgnore
    private String updatedBy;
}
```

- `@CreatedDate`: Indicates that the field is a creation time field. When this entity is inserted, the value will be set.

- `@CreatedBy`: Indicates that the field is the creator, and when this entity is inserted, the value will be set

  The same applies to `@LastModifiedDate` and `@LastModifiedBy`.

### What are the annotations for the relationships between entities?- `@OneToOne` : one-to-one.
- `@ManyToMany`: Many to many.
- `@OneToMany` : One-to-many.
- `@ManyToOne`: many to one.

Many-to-many relationships can also be expressed using `@ManyToOne` and `@OneToMany`.

## Spring Security

The important thing about Spring Security is actual combat. Here is a summary of only a small part of the knowledge points.

### What are some ways to control requested access?

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/image-20220728201854641.png)

- `permitAll()`: Unconditionally allow any form of access, whether you are logged in or not.
- `anonymous()`: Allow anonymous access, that is, you can access it without logging in.
- `denyAll()`: Unconditionally deny any form of access.
- `authenticated()`: Only allow authenticated users to access.
- `fullyAuthenticated()`: Only allow access to users who have logged in or logged in via remember-me.
- `hasRole(String)` : Only allow access to the specified role.
- `hasAnyRole(String)`: Specify one or more roles, and users who meet one of them can access.
- `hasAuthority(String)`: Only allow access to users with specified permissions
- `hasAnyAuthority(String)`: Specify one or more permissions, and users who meet one of them can access.
- `hasIpAddress(String)`: Only users with the specified ip are allowed to access.

### Is there a difference between hasRole and hasAuthority?

You can take a look at this article by Brother Song: [Is there a difference between hasRole and hasAuthority in Spring Security? ](https://mp.weixin.qq.com/s/GTNOa2k9_n_H0w24upClRw), the introduction is more detailed.

### How to encrypt password?

If we need to save sensitive data such as passwords to the database, we need to encrypt it first and then save it.

Spring Security provides the implementation of multiple encryption algorithms, which is very convenient to use out of the box. The interface of these encryption algorithm implementation classes is `PasswordEncoder`. If you want to implement an encryption algorithm yourself, you also need to implement the `PasswordEncoder` interface.

The `PasswordEncoder` interface has a total of 3 methods that must be implemented.

```java
public interface PasswordEncoder {
    // Encryption is to encode the original password
    String encode(CharSequence var1);
    // Compare the original password with the password saved in the database
    boolean matches(CharSequence var1, String var2);
    // Determine whether the encrypted password needs to be encrypted again. Returns false by default.
    default boolean upgradeEncoding(String encodedPassword) {
        return false;
    }
}
```

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/image-20220728183540954.png)

It is officially recommended to use the encryption algorithm implementation class based on the bcrypt strong hash function.

### How to gracefully change the encryption algorithm used by the system?

If we suddenly find that the existing encryption algorithm cannot meet our needs during the development process and need to replace it with another encryption algorithm, what should we do at this time?

The recommended approach is to use `DelegatingPasswordEncoder` to be compatible with multiple different password encryption schemes to adapt to different business needs.

As can be seen from the name, `DelegatingPasswordEncoder` is actually a proxy class, not a brand-new encryption algorithm. What it does is proxy the encryption algorithm implementation class mentioned above. After Spring Security 5.0, password encryption is based on `DelegatingPasswordEncoder` by default.

## Reference

- "Spring Technology Insider"
- "Learning Spring in depth from scratch": <https://juejin.cn/book/6857911863016390663>
- <http://www.cnblogs.com/wmyskxz/p/8820371.html>
- <https://www.journaldev.com/2696/spring-interview-questions-and-answers>
- <https://www.edureka.co/blog/interview-questions/spring-interview-questions/>
- <https://www.cnblogs.com/clwydjgs/p/9317849.html>
- <https://howtodoinjava.com/interview-questions/top-spring-interview-questions-with-answers/>
- <http://www.tomaszezula.com/2014/02/09/spring-series-part-5-component-vs-bean/>
- <https://stackoverflow.com/questions/34172888/difference-between-bean-and-autowired>

<!-- @include: @article-footer.snippet.md -->