---
title: IoC & AOP详解（快速搞懂）
category: 框架
tag:
  - Spring
---

这篇文章会从下面从以下几个问题展开对 IoC & AOP 的解释

- 什么是 IoC？
- IoC 解决了什么问题？
- IoC 和 DI 的区别？
- 什么是 AOP？
- AOP 解决了什么问题？
- AOP 的应用场景有哪些？
- AOP 为什么叫做切面编程？
- AOP 实现方式有哪些？

首先声明：IoC & AOP 不是 Spring 提出来的，它们在 Spring 之前其实已经存在了，只不过当时更加偏向于理论。Spring 在技术层次将这两个思想进行了很好的实现。

## IoC （Inversion of control ）

### 什么是 IoC?

IoC （Inversion of Control ）即控制反转/反转控制。它是一种思想不是一个技术实现。描述的是：Java 开发领域对象的创建以及管理的问题。

例如：现有类 A 依赖于类 B

- **传统的开发方式** ：往往是在类 A 中手动通过 new 关键字来 new 一个 B 的对象出来
- **使用 IoC 思想的开发方式** ：不通过 new 关键字来创建对象，而是通过 IoC 容器(Spring 框架) 来帮助我们实例化对象。我们需要哪个对象，直接从 IoC 容器里面去取即可。

从以上两种开发方式的对比来看：我们 “丧失了一个权力” (创建、管理对象的权力)，从而也得到了一个好处（不用再考虑对象的创建、管理等一系列的事情）

**为什么叫控制反转?**

- **控制** ：指的是对象创建（实例化、管理）的权力
- **反转** ：控制权交给外部环境（IoC 容器）

![IoC 图解](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration.png)

### IoC 解决了什么问题?

IoC 的思想就是两方之间不互相依赖，由第三方容器来管理相关资源。这样有什么好处呢？

1. 对象之间的耦合度或者说依赖程度降低；
2. 资源变的容易管理；比如你用 Spring 容器提供的话很容易就可以实现一个单例。

例如：现有一个针对 User 的操作，利用 Service 和 Dao 两层结构进行开发

在没有使用 IoC 思想的情况下，Service 层想要使用 Dao 层的具体实现的话，需要通过 new 关键字在`UserServiceImpl` 中手动 new 出 `IUserDao` 的具体实现类 `UserDaoImpl`（不能直接 new 接口类）。

很完美，这种方式也是可以实现的，但是我们想象一下如下场景：

开发过程中突然接到一个新的需求，针对`IUserDao` 接口开发出另一个具体实现类。因为 Server 层依赖了`IUserDao`的具体实现，所以我们需要修改`UserServiceImpl`中 new 的对象。如果只有一个类引用了`IUserDao`的具体实现，可能觉得还好，修改起来也不是很费力气，但是如果有许许多多的地方都引用了`IUserDao`的具体实现的话，一旦需要更换`IUserDao` 的实现方式，那修改起来将会非常的头疼。

![IoC&Aop-ioc-illustration-dao-service](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao-service.png)

使用 IoC 的思想，我们将对象的控制权（创建、管理）交由 IoC 容器去管理，我们在使用的时候直接向 IoC 容器 “要” 就可以了

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao.png)

### IoC 和 DI 有区别吗？

IoC（Inverse of Control:控制反转）是一种设计思想或者说是某种模式。这个设计思想就是 **将原本在程序中手动创建对象的控制权交给第三方比如 IoC 容器。** 对于我们常用的 Spring 框架来说， IoC 容器实际上就是个 Map（key，value）,Map 中存放的是各种对象。不过，IoC 在其他语言中也有应用，并非 Spring 特有。

IoC 最常见以及最合理的实现方式叫做依赖注入（Dependency Injection，简称 DI）。

老马（Martin Fowler）在一篇文章中提到将 IoC 改名为 DI，原文如下，原文地址：<https://martinfowler.com/articles/injection.html> 。

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/martin-fowler-injection.png)

老马的大概意思是 IoC 太普遍并且不表意，很多人会因此而迷惑，所以，使用 DI 来精确指名这个模式比较好。

## AOP（Aspect oriented programming）

这里不会涉及太多专业的术语，核心目的是将 AOP 的思想说清楚。

### 什么是 AOP？

AOP（Aspect Oriented Programming）即面向切面编程，AOP 是 OOP（面向对象编程）的一种延续，二者互补，并不对立。

AOP 的目的是将横切关注点（如日志记录、事务管理、权限控制、接口限流、接口幂等等）从核心业务逻辑中分离出来，通过动态代理、字节码操作等技术，实现代码的复用和解耦，提高代码的可维护性和可扩展性。OOP 的目的是将业务逻辑按照对象的属性和行为进行封装，通过类、对象、继承、多态等概念，实现代码的模块化和层次化（也能实现代码的复用），提高代码的可读性和可维护性。

### AOP 为什么叫面向切面编程？

AOP 之所以叫面向切面编程，是因为它的核心思想就是将横切关注点从核心业务逻辑中分离出来，形成一个个的**切面（Aspect）**。

![面向切面编程图解](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/aop-program-execution.jpg)

这里顺带总结一下 AOP 关键术语（不理解也没关系，可以继续往下看）：

- **横切关注点（cross-cutting concerns）** ：多个类或对象中的公共行为（如日志记录、事务管理、权限控制、接口限流、接口幂等等）。
- **切面（Aspect）**：对横切关注点进行封装的类，一个切面是一个类。切面可以定义多个通知，用来实现具体的功能。
- **连接点（JoinPoint）**：连接点是方法调用或者方法执行时的某个特定时刻（如方法调用、异常抛出等）。
- **通知（Advice）**：通知就是切面在某个连接点要执行的操作。通知有五种类型，分别是前置通知（Before）、后置通知（After）、返回通知（AfterReturning）、异常通知（AfterThrowing）和环绕通知（Around）。前四种通知都是在目标方法的前后执行，而环绕通知可以控制目标方法的执行过程。
- **切点（Pointcut）**：一个切点是一个表达式，它用来匹配哪些连接点需要被切面所增强。切点可以通过注解、正则表达式、逻辑运算等方式来定义。比如 `execution(* com.xyz.service..*(..))`匹配 `com.xyz.service` 包及其子包下的类或接口。
- **织入（Weaving）**：织入是将切面和目标对象连接起来的过程，也就是将通知应用到切点匹配的连接点上。常见的织入时机有两种，分别是编译期织入（Compile-Time Weaving 如：AspectJ）和运行期织入（Runtime Weaving 如：AspectJ、Spring AOP）。

### AOP 常见的通知类型有哪些？

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/aspectj-advice-types.jpg)

- **Before**（前置通知）：目标对象的方法调用之前触发
- **After** （后置通知）：目标对象的方法调用之后触发
- **AfterReturning**（返回通知）：目标对象的方法调用完成，在返回结果值之后触发
- **AfterThrowing**（异常通知）：目标对象的方法运行中抛出 / 触发异常后触发。AfterReturning 和 AfterThrowing 两者互斥。如果方法调用成功无异常，则会有返回值；如果方法抛出了异常，则不会有返回值。
- **Around** (around notification): Programmatically control the method invocation of the target object. Surround advice has the largest operability range among all notification types, because it can directly get the target object and the method to be executed, so the surround advice can do anything before and after the method call of the target object, or even without calling the method of the target object.

### What problem does AOP solve?

OOP cannot handle some common behaviors that are scattered among multiple classes or objects (such as logging, transaction management, permission control, interface current limiting, interface power, etc.). These behaviors are often called cross-cutting concerns. If we implement these behaviors repeatedly in every class or object, it will lead to redundant, complex and difficult to maintain code.

AOP can separate cross-cutting concerns (such as logging, transaction management, permission control, interface current limiting, interface power, etc.) from **core business logic (core concerns, core concerns)** to achieve separation of concerns.

![](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/crosscut-logic-and-businesslogic-separation%20%20%20%20%20%20.png)

Let's take logging as an example. If we need to log certain methods in a unified format, before using AOP technology, we need to write the logging logic code one by one, which is all repetitive logic.

```java
public CommonResponse<Object> method1() {
      // business logic
      xxService.method1();
      // Omit specific business processing logic
      // logging
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      HttpServletRequest request = attributes.getRequest();
      // Omit the specific logic of logging, such as: obtaining various information, writing to the database, etc...
      return CommonResponse.success();
}

public CommonResponse<Object> method2() {
      // business logic
      xxService.method2();
      // Omit specific business processing logic
      // logging
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      HttpServletRequest request = attributes.getRequest();
      // Omit the specific logic of logging, such as: obtaining various information, writing to the database, etc...
      return CommonResponse.success();
}

// ...
```

After using AOP technology, we can encapsulate the logging logic into an aspect, and then use pointcuts and notifications to specify which methods need to perform logging operations.

```java

//Log annotation
@Target({ElementType.PARAMETER,ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    /**
     * Description
     */
    String description() default "";

    /**
     * Method type INSERT DELETE UPDATE OTHER
     */
    MethodType methodType() default MethodType.OTHER;
}

//Log aspect
@Component
@Aspect
public class LogAspect {
  // Entry point, all methods marked by Log annotations
  @Pointcut("@annotation(cn.javaguide.annotation.Log)")
  public void webLog() {
  }

   /**
   * Surround notifications
   */
  @Around("webLog()")
  public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
    // Omit specific processing logic
  }

  //Omit other code
}
```

In this case, we can implement logging with one line of annotation:

```java
@Log(description = "method1",methodType = MethodType.INSERT)
public CommonResponse<Object> method1() {
      // business logic
      xxService.method1();
      // Omit specific business processing logic
      return CommonResponse.success();
}
```

### What are the application scenarios of AOP?

- Logging: Customize logging annotations and use AOP to implement logging with one line of code.
- Performance statistics: Use AOP to count the execution time of the method before and after the execution of the target method to facilitate optimization and analysis.
- Transaction management: The `@Transactional` annotation allows Spring to perform transaction management for us, such as rolling back abnormal operations, eliminating repeated transaction management logic. The `@Transactional` annotation is implemented based on AOP.
- Permission control: Use AOP to determine whether the user has the required permissions before executing the target method. If so, execute the target method, otherwise it will not execute. For example, SpringSecurity uses `@PreAuthorize` to annotate a line of code to customize permission verification.
- Interface current limiting: Use AOP to limit the request through specific current limiting algorithms and implementations before the target method is executed.
- Cache management: Use AOP to read and update the cache before and after the target method is executed.
-…

### What are the implementation methods of AOP?

Common implementation methods of AOP include dynamic proxy, bytecode operation, etc.

Spring AOP is based on dynamic proxy. If the object to be proxied implements an interface, then Spring AOP will use **JDK Proxy** to create the proxy object. For objects that do not implement the interface, JDK Proxy cannot be used for proxy. At this time, Spring AOP will use CGLIB to generate a subclass of the proxied object as a proxy, as shown in the following figure:

![SpringAOPProcess](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/230ae587a322d6e4d09510161987d346.jpeg)

**Are the dynamic proxy strategies of Spring Boot and Spring the same? **In fact, it is different. Many people have misunderstood it.

Before Spring Boot 2.0, **JDK dynamic proxy** was used by default. If the target class does not implement the interface, an exception will be thrown, and the developer must explicitly configure (`spring.aop.proxy-target-class=true`) to use **CGLIB dynamic proxy** or inject the interface to solve the problem. Spring Boot 1.5.x automatically configures AOP code as follows:

```java
@Configuration
@ConditionalOnClass({ EnableAspectJAutoProxy.class, Aspect.class, Advice.class })
@ConditionalOnProperty(prefix = "spring.aop", name = "auto", havingValue = "true", matchIfMissing = true)
public class AopAutoConfiguration {

	@Configuration
	@EnableAspectJAutoProxy(proxyTargetClass = false)
 // This configuration class will only take effect when spring.aop.proxy-target-class=false or not explicitly configured.
 // In other words, if the developer does not explicitly select the proxy method, Spring will load the JDK dynamic proxy by default.
	@ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "false", matchIfMissing = true)
	public static class JdkDynamicAutoProxyConfiguration {

	}

	@Configuration
	@EnableAspectJAutoProxy(proxyTargetClass = true)
 // This configuration class will only take effect when spring.aop.proxy-target-class=true.
 // That is, when the developer explicitly specifies the use of CGLIB dynamic proxy through attribute configuration, Spring will load this configuration class.
	@ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "true", matchIfMissing = false)
	public static class CglibAutoProxyConfiguration {

	}

}```

Starting from Spring Boot 2.0, if the user configures nothing, **CGLIB dynamic proxy** is used by default. If you need to force the use of JDK dynamic proxy, you can add: `spring.aop.proxy-target-class=false` in the configuration file. Spring Boot 2.0 automatically configures AOP code as follows:

```java
@Configuration
@ConditionalOnClass({ EnableAspectJAutoProxy.class, Aspect.class, Advice.class,
		AnnotatedElement.class })
@ConditionalOnProperty(prefix = "spring.aop", name = "auto", havingValue = "true", matchIfMissing = true)
public class AopAutoConfiguration {

	@Configuration
	@EnableAspectJAutoProxy(proxyTargetClass = false)
 // This configuration class will only take effect when spring.aop.proxy-target-class=false.
 // That is, when the developer explicitly specifies the use of JDK dynamic proxy through attribute configuration, Spring will load this configuration class.
	@ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "false", matchIfMissing = false)
	public static class JdkDynamicAutoProxyConfiguration {

	}

	@Configuration
	@EnableAspectJAutoProxy(proxyTargetClass = true)
 // This configuration class will only take effect when spring.aop.proxy-target-class=true or not explicitly configured.
 // In other words, if the developer does not explicitly select the proxy method, Spring will load the CGLIB proxy by default.
	@ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "true", matchIfMissing = true)
	public static class CglibAutoProxyConfiguration {

	}

}
```

Of course you can also use **AspectJ**! Spring AOP has integrated AspectJ, which should be regarded as the most complete AOP framework in the Java ecosystem.

**Spring AOP is a run-time enhancement, while AspectJ is a compile-time enhancement. ** Spring AOP is based on Proxying, while AspectJ is based on Bytecode Manipulation.

Spring AOP has integrated AspectJ, which should be regarded as the most complete AOP framework in the Java ecosystem. AspectJ is more powerful than Spring AOP, but Spring AOP is relatively simpler.

If we have fewer aspects, there is not much performance difference between the two. However, when there are too many aspects, it is best to choose AspectJ, which is much faster than Spring AOP.

## Reference

- AOP in Spring Boot, is it a JDK dynamic proxy or a Cglib dynamic proxy?：<https://www.springcloud.io/post/2022-01/springboot-aop/>
- Spring Proxying Mechanisms: <https://docs.spring.io/spring-framework/reference/core/aop/proxying.html>