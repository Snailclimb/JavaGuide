---
title: Spring 中的设计模式详解
category: 框架
tag:
  - Spring
---

“JDK 中用到了哪些设计模式? Spring 中用到了哪些设计模式? ”这两个问题，在面试中比较常见。

我在网上搜索了一下关于 Spring 中设计模式的讲解几乎都是千篇一律，而且大部分都年代久远。所以，花了几天时间自己总结了一下。

由于我的个人能力有限，文中如有任何错误各位都可以指出。另外，文章篇幅有限，对于设计模式以及一些源码的解读我只是一笔带过，这篇文章的主要目的是回顾一下 Spring 中的设计模式。

## 控制反转(IoC)和依赖注入(DI)

**IoC(Inversion of Control,控制反转)** 是 Spring 中一个非常非常重要的概念，它不是什么技术，而是一种解耦的设计思想。IoC 的主要目的是借助于“第三方”(Spring 中的 IoC 容器) 实现具有依赖关系的对象之间的解耦(IOC 容器管理对象，你只管使用即可)，从而降低代码之间的耦合度。

**IoC 是一个原则，而不是一个模式，以下模式（但不限于）实现了 IoC 原则。**

![ioc-patterns](https://oss.javaguide.cn/github/javaguide/ioc-patterns.png)

**Spring IoC 容器就像是一个工厂一样，当我们需要创建一个对象的时候，只需要配置好配置文件/注解即可，完全不用考虑对象是如何被创建出来的。** IoC 容器负责创建对象，将对象连接在一起，配置这些对象，并从创建中处理这些对象的整个生命周期，直到它们被完全销毁。

在实际项目中一个 Service 类如果有几百甚至上千个类作为它的底层，我们需要实例化这个 Service，你可能要每次都要搞清这个 Service 所有底层类的构造函数，这可能会把人逼疯。如果利用 IOC 的话，你只需要配置好，然后在需要的地方引用就行了，这大大增加了项目的可维护性且降低了开发难度。

> 关于 Spring IOC 的理解，推荐看这一下知乎的一个回答：<https://www.zhihu.com/question/23277575/answer/169698662> ，非常不错。

**控制反转怎么理解呢?** 举个例子："对象 a 依赖了对象 b，当对象 a 需要使用 对象 b 的时候必须自己去创建。但是当系统引入了 IOC 容器后， 对象 a 和对象 b 之间就失去了直接的联系。这个时候，当对象 a 需要使用 对象 b 的时候， 我们可以指定 IOC 容器去创建一个对象 b 注入到对象 a 中"。 对象 a 获得依赖对象 b 的过程,由主动行为变为了被动行为，控制权反转，这就是控制反转名字的由来。

**DI(Dependency Inject,依赖注入)是实现控制反转的一种设计模式，依赖注入就是将实例变量传入到一个对象中去。**

## 工厂设计模式

Spring 使用工厂模式可以通过 `BeanFactory` 或 `ApplicationContext` 创建 bean 对象。

**两者对比：**

- `BeanFactory`：延迟注入(使用到某个 bean 的时候才会注入),相比于`ApplicationContext` 来说会占用更少的内存，程序启动速度更快。
- `ApplicationContext`：容器启动的时候，不管你用没用到，一次性创建所有 bean 。`BeanFactory` 仅提供了最基本的依赖注入支持，`ApplicationContext` 扩展了 `BeanFactory` ,除了有`BeanFactory`的功能还有额外更多功能，所以一般开发人员使用`ApplicationContext`会更多。

`ApplicationContext` 的三个实现类：

1. `ClassPathXmlApplication`：把上下文文件当成类路径资源。
2. `FileSystemXmlApplication`：从文件系统中的 XML 文件载入上下文定义信息。
3. `XmlWebApplicationContext`：从 Web 系统中的 XML 文件载入上下文定义信息。

Example:

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

public class App {
  public static void main(String[] args) {
    ApplicationContext context = new FileSystemXmlApplicationContext(
        "C:/work/IOC Containers/springframework.applicationcontext/src/main/resources/bean-factory-config.xml");

    HelloApplicationContext obj = (HelloApplicationContext) context.getBean("helloApplicationContext");
    obj.getMsg();
  }
}
```

## 单例设计模式

在我们的系统中，有一些对象其实我们只需要一个，比如说：线程池、缓存、对话框、注册表、日志对象、充当打印机、显卡等设备驱动程序的对象。事实上，这一类对象只能有一个实例，如果制造出多个实例就可能会导致一些问题的产生，比如：程序的行为异常、资源使用过量、或者不一致性的结果。

**使用单例模式的好处** :

- 对于频繁使用的对象，可以省略创建对象所花费的时间，这对于那些重量级对象而言，是非常可观的一笔系统开销；
- 由于 new 操作的次数减少，因而对系统内存的使用频率也会降低，这将减轻 GC 压力，缩短 GC 停顿时间。

**Spring 中 bean 的默认作用域就是 singleton(单例)的。** 除了 singleton 作用域，Spring 中 bean 还有下面几种作用域：

- **prototype** : 每次获取都会创建一个新的 bean 实例。也就是说，连续 `getBean()` 两次，得到的是不同的 Bean 实例。
- **request** （仅 Web 应用可用）: 每一次 HTTP 请求都会产生一个新的 bean（请求 bean），该 bean 仅在当前 HTTP request 内有效。
- **session** （仅 Web 应用可用） : 每一次来自新 session 的 HTTP 请求都会产生一个新的 bean（会话 bean），该 bean 仅在当前 HTTP session 内有效。
- **application/global-session** （仅 Web 应用可用）：每个 Web 应用在启动时创建一个 Bean（应用 Bean），，该 bean 仅在当前应用启动时间内有效。
- **websocket** （仅 Web 应用可用）：每一次 WebSocket 会话产生一个新的 bean。

Spring 通过 `ConcurrentHashMap` 实现单例注册表的特殊方式实现单例模式。

Spring 实现单例的核心代码如下：

```java
// 通过 ConcurrentHashMap（线程安全） 实现单例注册表
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<String, Object>(64);

public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
        Assert.notNull(beanName, "'beanName' must not be null");
        synchronized (this.singletonObjects) {
            // 检查缓存中是否存在实例
            Object singletonObject = this.singletonObjects.get(beanName);
            if (singletonObject == null) {
                //...省略了很多代码
                try {
                    singletonObject = singletonFactory.getObject();
                }
                //...省略了很多代码
                // 如果实例对象在不存在，我们注册到单例注册表中。
                addSingleton(beanName, singletonObject);
            }
            return (singletonObject != NULL_OBJECT ? singletonObject : null);
        }
    }
    //将对象添加到单例注册表
    protected void addSingleton(String beanName, Object singletonObject) {
            synchronized (this.singletonObjects) {
                this.singletonObjects.put(beanName, (singletonObject != null ? singletonObject : NULL_OBJECT));

            }
        }
}
```

**Are there thread safety issues with singleton beans? **

Most of the time we don't use multi-threading in our projects, so few people pay attention to this issue. Singleton Beans have threading problems, mainly because there is resource competition when multiple threads operate the same object.

There are two common solutions:

1. Try to avoid defining mutable member variables in Beans.
2. Define a `ThreadLocal` member variable in the class and save the required variable member variables in `ThreadLocal` (a recommended way).

However, most beans are actually stateless (no instance variables) (such as Dao, Service). In this case, the beans are thread-safe.

## Proxy Design Pattern

### Application of proxy mode in AOP

**AOP (Aspect-Oriented Programming)** can encapsulate logic or responsibilities (such as transaction processing, log management, permission control, etc.) that have nothing to do with the business but are commonly called by business modules, which facilitates the reduction of duplicate code in the system, reduces the coupling between modules, and is conducive to future scalability and maintainability.

Spring AOP is based on dynamic proxy. If the object to be proxied implements an interface, then Spring AOP will use **JDK Proxy** to create the proxy object. For objects that do not implement the interface, JDK Proxy cannot be used for proxy. At this time, Spring AOP will use **Cglib** to generate a subclass of the proxied object as a proxy, as shown in the following figure:

![SpringAOPProcess](https://oss.javaguide.cn/github/javaguide/SpringAOPProcess.jpg)

Of course, you can also use AspectJ. Spring AOP has integrated AspectJ. AspectJ should be regarded as the most complete AOP framework in the Java ecosystem.

After using AOP, we can abstract some common functions and use them directly where they are needed, which greatly simplifies the amount of code. It is also convenient when we need to add new functions, which also improves the scalability of the system. AOP is used in logging functions, transaction management and other scenarios.

### What is the difference between Spring AOP and AspectJ AOP?

**Spring AOP is a run-time enhancement, while AspectJ is a compile-time enhancement. ** Spring AOP is based on Proxying, while AspectJ is based on Bytecode Manipulation.

Spring AOP has integrated AspectJ, which should be regarded as the most complete AOP framework in the Java ecosystem. AspectJ is more powerful than Spring AOP, but Spring AOP is relatively simpler.

If we have fewer aspects, there is not much performance difference between the two. However, when there are too many aspects, it is best to choose AspectJ, which is much faster than Spring AOP.

## Template method

The Template Method pattern is a behavioral design pattern that defines the skeleton of an algorithm in operation while deferring some steps to subclasses. Template methods allow subclasses to redefine the implementation of certain specific steps of an algorithm without changing the structure of the algorithm.

```java
public abstract class Template {
    //This is our template method
    public final void TemplateMethod(){
        PrimitiveOperation1();
        PrimitiveOperation2();
        PrimitiveOperation3();
    }

    protected void PrimitiveOperation1(){
        //Current class implementation
    }

    //Methods implemented by subclasses
    protected abstract void PrimitiveOperation2();
    protected abstract void PrimitiveOperation3();

}
public class TemplateImpl extends Template {

    @Override
    public void PrimitiveOperation2() {
        //Current class implementation
    }

    @Override
    public void PrimitiveOperation3() {
        //Current class implementation
    }
}

```

`JdbcTemplate`, `HibernateTemplate` and other classes ending with Template in Spring that operate on databases use the template pattern. Under normal circumstances, we use inheritance to implement the template pattern, but Spring does not use this method. Instead, it uses the Callback pattern in conjunction with the template method pattern, which not only achieves the effect of code reuse, but also increases flexibility.

## Observer pattern

Observer pattern is an object behavior pattern. It represents a dependency relationship between objects. When an object changes, all objects that depend on this object will also react. Spring's event-driven model is a classic application of the observer pattern. The Spring event-driven model is very useful and can decouple our code in many scenarios. For example, every time we add a product, we need to update the product index. At this time, we can use the observer pattern to solve this problem.

### Three roles in Spring event-driven model

#### Event role

`ApplicationEvent` (under the `org.springframework.context` package) acts as an event. This is an abstract class that inherits `java.util.EventObject` and implements the `java.io.Serializable` interface.

The following events exist by default in Spring, and they are all implementations of `ApplicationContextEvent` (inherited from `ApplicationContextEvent`):

- `ContextStartedEvent`: event triggered after `ApplicationContext` is started;
- `ContextStoppedEvent`: event triggered after `ApplicationContext` is stopped;
- `ContextRefreshedEvent`: Event triggered after `ApplicationContext` initialization or refresh is completed;
- `ContextClosedEvent`: Event triggered after `ApplicationContext` is closed.

![ApplicationEvent-Subclass](https://oss.javaguide.cn/github/javaguide/ApplicationEvent-Subclass.png)

#### Event listener role

`ApplicationListener` acts as an event listener. It is an interface and only defines an `onApplicationEvent()` method to handle `ApplicationEvent`. The source code of the `ApplicationListener` interface class is as follows. It can be seen from the interface definition that the events in the interface only need to implement `ApplicationEvent`. Therefore, in Spring we only need to implement the `onApplicationEvent()` method of the `ApplicationListener` interface to complete the event listening

```java
package org.springframework.context;
import java.util.EventListener;
@FunctionalInterface
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
    void onApplicationEvent(E var1);
}
```

#### Event publisher role

`ApplicationEventPublisher` acts as an event publisher and is also an interface.

```java
@FunctionalInterface
public interface ApplicationEventPublisher {
    default void publishEvent(ApplicationEvent event) {
        this.publishEvent((Object)event);
    }

    void publishEvent(Object var1);
}

```

The `publishEvent()` method of the `ApplicationEventPublisher` interface is implemented in the `AbstractApplicationContext` class. Reading the implementation of this method, you will find that events are actually broadcast through `ApplicationEventMulticaster`. There are too many specific contents, so I won’t analyze them here. I may write a separate article to mention them later.

### Summary of Spring’s event process

1. Define an event: implement an event inherited from `ApplicationEvent` and write the corresponding constructor;
2. Define an event listener: implement the `ApplicationListener` interface and override the `onApplicationEvent()` method;3. Use an event publisher to publish messages: You can publish messages through the `publishEvent()` method of `ApplicationEventPublisher`.

Example:

```java
//Define an event, inherit from ApplicationEvent and write the corresponding constructor
public class DemoEvent extends ApplicationEvent{
    private static final long serialVersionUID = 1L;

    private String message;

    public DemoEvent(Object source,String message){
        super(source);
        this.message = message;
    }

    public String getMessage() {
         return message;
          }


//Define an event listener, implement the ApplicationListener interface, and override the onApplicationEvent() method;
@Component
public class DemoListener implements ApplicationListener<DemoEvent>{

    //Use onApplicationEvent to receive messages
    @Override
    public void onApplicationEvent(DemoEvent event) {
        String msg = event.getMessage();
        System.out.println("The received message is: "+msg);
    }

}
//Publish events. You can publish messages through the publishEvent() method of ApplicationEventPublisher.
@Component
public class DemoPublisher {

    @Autowired
    ApplicationContext applicationContext;

    public void publish(String message){
        //publish event
        applicationContext.publishEvent(new DemoEvent(this, message));
    }
}

```

When calling the `publish()` method of `DemoPublisher`, such as `demoPublisher.publish("Hello")`, the console will print out: `The received information is: Hello`.

## Adapter mode

The Adapter Pattern converts one interface into another interface that the client wants. The Adapter Pattern enables classes with incompatible interfaces to work together.

### Adapter pattern in Spring AOP

We know that the implementation of Spring AOP is based on the proxy mode, but the enhancement or advice of Spring AOP uses the adapter mode, and the related interface is `AdvisorAdapter`.

Commonly used types of Advice include: `BeforeAdvice` (before the target method is called, pre-advice), `AfterAdvice` (after the target method is called, post-advice), `AfterReturningAdvice` (after the target method is executed, before return), etc. Each type of Advice has a corresponding interceptor: `MethodBeforeAdviceInterceptor`, `AfterReturningAdviceInterceptor`, `ThrowsAdviceInterceptor` and so on.

Spring's predefined notifications must be adapted to objects of the `MethodInterceptor` interface (method interceptor) type through the corresponding adapter (for example: `MethodBeforeAdviceAdapter` adapts `MethodBeforeAdvice` to `MethodBeforeAdviceInterceptor` by calling the `getInterceptor` method).

### Adapter pattern in Spring MVC

In Spring MVC, `DispatcherServlet` calls `HandlerMapping` based on the request information and parses the `Handler` corresponding to the request. After parsing to the corresponding `Handler` (which is what we usually call `Controller` controller), it starts to be processed by the `HandlerAdapter` adapter. `HandlerAdapter` serves as the desired interface, the specific adapter implementation class is used to adapt the target class, and `Controller` serves as the class that needs to be adapted.

**Why use the adapter pattern in Spring MVC? **

There are many types of `Controller` in Spring MVC, and different types of `Controller` handle requests through different methods. If you do not use the adapter mode, `DispatcherServlet` directly obtains the corresponding type of `Controller`, and you can judge by yourself if necessary, like the following code:

```java
if(mappedHandler.getHandler() instanceof MultiActionController){
   ((MultiActionController)mappedHandler.getHandler()).xxx
}else if(mappedHandler.getHandler() instanceof XXX){
    ...
}else if(...){
   ...
}
```

If we add another `Controller` type, we need to add another line of judgment statement to the above code. This form makes the program difficult to maintain and violates the opening and closing principle in the design pattern - open for expansion and closed for modification.

## Decorator pattern

The decorator pattern can dynamically add some additional properties or behaviors to an object. Compared to using inheritance, the decorator pattern is more flexible. To put it simply, when we need to modify the original function, but we do not want to modify the original code directly, we design a Decorator to cover the original code. In fact, the decorator pattern is used in many places in the JDK, such as the `InputStream` family. Under the `InputStream` class there are `FileInputStream` (reading files), `BufferedInputStream` (increasing cache, greatly improving the speed of reading files) and other subclasses, all of which extend its functions without modifying the `InputStream` code.

![Decorator pattern diagram](https://oss.javaguide.cn/github/javaguide/Decorator.jpg)

When configuring DataSource in Spring, DataSource may be different databases and data sources. Can we dynamically switch different data sources according to customer needs with less modification of the original class code? At this time, the decorator pattern will be used (I don’t understand the specific principle of this yet). The wrapper pattern used in Spring contains `Wrapper` or `Decorator` in the class name. These classes basically dynamically add some additional responsibilities to an object.

## Summary

What design patterns are used in the Spring framework?

- **Factory Design Pattern**: Spring uses the factory pattern to create bean objects through `BeanFactory` and `ApplicationContext`.
- **Proxy Design Pattern**: Implementation of Spring AOP functionality.
- **Singleton Design Pattern**: Beans in Spring are singletons by default.
- **Template method pattern**: `jdbcTemplate`, `hibernateTemplate` and other classes ending with Template in Spring that operate on the database use the template mode.
- **Wrapper Design Pattern**: Our project needs to connect to multiple databases, and different customers will access different databases according to their needs during each visit. This model allows us to dynamically switch between different data sources according to customer needs.
- **Observer Pattern:** Spring's event-driven model is a classic application of the observer pattern.
- **Adapter Mode**: Spring AOP's enhancements or advice (Advice) use the adapter mode, and spring MVC also uses the adapter mode to adapt `Controller`.
-…

## Reference

- "Spring Technology Insider"
- <https://blog.eduonix.com/java-programming-2/learn-design-patterns-used-spring-framework/>
- <https://www.tutorialsteacher.com/ioc/inversion-of-control>
- <https://design-patterns.readthedocs.io/zh_CN/latest/behavioral_patterns/observer.html>
- <https://juejin.im/post/5a8eb261f265da4e9e307230>
- <https://juejin.im/post/5ba28986f265da0abc2b6084>

<!-- @include: @article-footer.snippet.md -->