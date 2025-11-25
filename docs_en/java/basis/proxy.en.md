---
title: Detailed explanation of Java proxy mode
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: proxy mode, static proxy, dynamic proxy, JDK dynamic proxy, CGLIB, cross-cutting enhancement, design pattern
  - - meta
    - name: description
      content: Detailed explanation of the static and dynamic implementation of Java proxy mode, and understanding of the principles and application scenarios of JDK/CGLIB dynamic proxy.
---

## 1. Proxy mode

The proxy pattern is a relatively easy-to-understand design pattern. To put it simply: **We use proxy objects to replace access to real objects, so that we can provide additional functional operations and extend the functions of the target object without modifying the original target object. **

**The main function of the proxy mode is to extend the functionality of the target object. For example, you can add some custom operations before and after a method of the target object is executed. **

For example: the bride hired her aunt to handle the groom's questions on her behalf. The questions the bride received were all processed and filtered by her aunt. The aunt here can be regarded as a proxy object that represents you. The behavior (method) of the proxy is to receive and respond to the groom's questions.

![Understanding the Proxy Design Pattern | by Mithun Sasidharan | Medium](https://oss.javaguide.cn/2020-8/1*DjWCgTFm-xqbhbNQVsaWQw.png)

<p style="text-align:right;font-size:13px;color:gray">https://medium.com/@mithunsasidharan/understanding-the-proxy-design-pattern-5e63fe38052a</p>

The proxy mode has two implementation methods: static proxy and dynamic proxy. Let’s first look at the implementation of the static proxy mode.

## 2. Static proxy

In static proxy, we enhance each method of the target object manually (the code will be demonstrated later), which is very inflexible (for example, once a new method is added to the interface, both the target object and the proxy object must be modified) and troublesome (a separate proxy class needs to be written for each target class). There are very few actual application scenarios, and there are almost no scenarios where static proxies are used in daily development.

Above we are talking about static proxies from the perspective of implementation and application. From the JVM level, **static proxies turn interfaces, implementation classes, and proxy classes into actual class files during compilation. **

Static proxy implementation steps:

1. Define an interface and its implementation class;
2. Create a proxy class that also implements this interface
3. Inject the target object into the proxy class, and then call the corresponding method in the target class in the corresponding method of the proxy class. In this case, we can shield access to the target object through the proxy class, and do what we want to do before and after the target method is executed.

Shown below through code!

**1. Define the interface for sending text messages**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Implement the interface for sending text messages**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Create a proxy class and also implement the interface for sending text messages**

```java
public class SmsProxy implements SmsService {

    private final SmsService smsService;

    public SmsProxy(SmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public String send(String message) {
        //Before calling the method, we can add our own operations
        System.out.println("before method send()");
        smsService.send(message);
        //After calling the method, we can also add our own operations
        System.out.println("after method send()");
        return null;
    }
}
```

**4.Actual use**

```java
public class Main {
    public static void main(String[] args) {
        SmsService smsService = new SmsServiceImpl();
        SmsProxy smsProxy = new SmsProxy(smsService);
        smsProxy.send("java");
    }
}
```

After running the above code, the console prints out:

```bash
before method send()
send message:java
after method send()
```

It can be seen from the output that we have added the `send()` method of `SmsServiceImpl`.

## 3. Dynamic proxy

Compared with static proxies, dynamic proxies are more flexible. We do not need to create a separate proxy class for each target class, and we do not need to implement the interface. We can directly proxy the implementation class (CGLIB dynamic proxy mechanism).

**From a JVM perspective, a dynamic proxy dynamically generates class bytecode at runtime and loads it into the JVM. **

When it comes to dynamic proxies, Spring AOP and RPC frameworks should be mentioned. Their implementation relies on dynamic proxies.

**Dynamic proxy is relatively rarely used in our daily development, but it is almost a must-use technology in the framework. After learning dynamic agents, it is also very helpful for us to understand and learn the principles of various frameworks. **

As far as Java is concerned, there are many ways to implement dynamic proxy, such as **JDK dynamic proxy**, **CGLIB dynamic proxy** and so on.

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) uses JDK dynamic proxy. Let’s first take a look at the use of JDK dynamic proxy.

In addition, although [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) does not use **CGLIB dynamic proxy**, we will briefly introduce its use and comparison with **JDK dynamic proxy** here.

### 3.1. JDK dynamic proxy mechanism

#### 3.1.1. Introduction

**In the Java dynamic proxy mechanism, the `InvocationHandler` interface and the `Proxy` class are the core. **

The most frequently used method in the `Proxy` class is: `newProxyInstance()`. This method is mainly used to generate a proxy object.

```java
    public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h)
        throws IllegalArgumentException
    {
        ...
    }
```

This method has a total of 3 parameters:

1. **loader**: Class loader, used to load proxy objects.
2. **interfaces**: some interfaces implemented by the proxy class;
3. **h**: An object that implements the `InvocationHandler` interface;

To implement a dynamic proxy, you must also implement `InvocationHandler` to customize the processing logic. When our dynamic proxy object calls a method, the call to this method will be forwarded to the `invoke` method of the class that implements the `InvocationHandler` interface.

```java
public interface InvocationHandler {

    /**
     * When you use a proxy object to call a method, this method will actually be called.
     */
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```

The `invoke()` method has the following three parameters:

1. **proxy**: dynamically generated proxy class
2. **method**: Corresponds to the method called by the proxy class object
3. **args**: parameters of the current method methodThat is to say: **When the proxy object you create through `newProxyInstance()` of the `Proxy` class calls a method, it will actually call the `invoke()` method of the class that implements the `InvocationHandler` interface. ** You can customize the processing logic in the `invoke()` method, such as what to do before and after the method is executed.

#### 3.1.2. Steps to use JDK dynamic proxy class

1. Define an interface and its implementation class;
2. Customize `InvocationHandler` and override the `invoke` method. In the `invoke` method we will call the native method (the method of the proxy class) and customize some processing logic;
3. Create a proxy object through the `Proxy.newProxyInstance(ClassLoader loader,Class<?>[] interfaces,InvocationHandler h)` method;

#### 3.1.3. Code examples

This may be a bit empty and difficult to understand. Let me give you an example. Let’s experience it!

**1. Define the interface for sending text messages**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Implement the interface for sending text messages**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Define a JDK dynamic proxy class**

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author shuang.kou
 * @createTime May 11, 2020 11:23:00
 */
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * The real object in the proxy class
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        //Before calling the method, we can add our own operations
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        //After calling the method, we can also add our own operations
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

`invoke()` method: When our dynamic proxy object calls a native method, the `invoke()` method is actually called, and then the `invoke()` method calls the native method of the proxy object on our behalf.

**4. Get the factory class of the proxy object**

```java
public class JdkProxyFactory {
    public static Object getProxy(Object target) {
        return Proxy.newProxyInstance(
                target.getClass().getClassLoader(), // Class loader of target class
                target.getClass().getInterfaces(), // The interfaces that the agent needs to implement, multiple can be specified
                new DebugInvocationHandler(target) // Custom InvocationHandler corresponding to the proxy object
        );
    }
}
```

`getProxy()`: mainly obtains the proxy object of a certain class through the `Proxy.newProxyInstance()` method

**5.Actual use**

```java
SmsService smsService = (SmsService) JdkProxyFactory.getProxy(new SmsServiceImpl());
smsService.send("java");
```

After running the above code, the console prints out:

```plain
before method send
send message:java
after method send
```

### 3.2. CGLIB dynamic proxy mechanism

#### 3.2.1. Introduction

**One of the most fatal problems with JDK dynamic proxy is that it can only proxy classes that implement interfaces. **

**In order to solve this problem, we can use the CGLIB dynamic proxy mechanism to avoid it. **

[CGLIB](https://github.com/cglib/cglib)(_Code Generation Library_) is a bytecode generation library based on [ASM](http://www.baeldung.com/java-asm), which allows us to modify and dynamically generate bytecode at runtime. CGLIB implements proxies through inheritance. Many well-known open source frameworks use [CGLIB](https://github.com/cglib/cglib). For example, in the AOP module in Spring: if the target object implements the interface, the JDK dynamic proxy is used by default, otherwise the CGLIB dynamic proxy is used.

**In the CGLIB dynamic proxy mechanism, the `MethodInterceptor` interface and the `Enhancer` class are the core. **

You need to customize `MethodInterceptor` and override the `intercept` method. `intercept` is used to intercept methods that enhance the proxied class.

```java
public interface MethodInterceptor
extends Callback{
    //Intercept methods in the proxied class
    public Object intercept(Object obj, java.lang.reflect.Method method, Object[] args,MethodProxy proxy) throws Throwable;
}

```

1. **obj**: The proxy object (the object that needs to be enhanced)
2. **method**: intercepted method (method that needs to be enhanced)
3. **args**: method input parameters
4. **proxy**: used to call the original method

You can dynamically obtain the proxy class through the `Enhancer` class. When the proxy class calls a method, the `intercept` method in `MethodInterceptor` is actually called.

#### 3.2.2. Steps to use CGLIB dynamic proxy class

1. Define a class;
2. Customize `MethodInterceptor` and override the `intercept` method. `intercept` is used to intercept methods that enhance the proxy class, similar to the `invoke` method in JDK dynamic proxy;
3. Create the proxy class through `create()` of the `Enhancer` class;

#### 3.2.3. Code examples

Unlike JDK, dynamic proxies require no additional dependencies. [CGLIB](https://github.com/cglib/cglib)(_Code Generation Library_) is actually an open source project. If you want to use it, you need to manually add related dependencies.

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>3.3.0</version>
</dependency>
```

**1. Implement a class that uses Alibaba Cloud to send text messages**

```java
package github.javaguide.dynamicProxy.cglibDynamicProxy;

public class AliSmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```**2. Customize `MethodInterceptor` (method interceptor) **

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * Custom MethodInterceptor
 */
public class DebugMethodInterceptor implements MethodInterceptor {


    /**
     * @param o The proxy object itself (note that it is not the original object, if method.invoke(o, args) is used, it will cause a loop call)
     * @param method The intercepted method (method that needs to be enhanced)
     * @param args method input parameters
     * @param methodProxy High-performance method calling mechanism to avoid reflection overhead
     */
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        //Before calling the method, we can add our own operations
        System.out.println("before method " + method.getName());
        Object object = methodProxy.invokeSuper(o, args);
        //After calling the method, we can also add our own operations
        System.out.println("after method " + method.getName());
        return object;
    }

}
```

**3. Get the proxy class**

```java
import net.sf.cglib.proxy.Enhancer;

public class CglibProxyFactory {

    public static Object getProxy(Class<?> clazz) {
        //Create dynamic proxy enhancement class
        Enhancer enhancer = new Enhancer();
        //Set class loader
        enhancer.setClassLoader(clazz.getClassLoader());
        //Set the proxy class
        enhancer.setSuperclass(clazz);
        //Set method interceptor
        enhancer.setCallback(new DebugMethodInterceptor());
        //Create proxy class
        return enhancer.create();
    }
}
```

**4.Actual use**

```java
AliSmsService aliSmsService = (AliSmsService) CglibProxyFactory.getProxy(AliSmsService.class);
aliSmsService.send("java");
```

After running the above code, the console prints out:

```bash
before method send
send message:java
after method send
```

### 3.3. Comparison between JDK dynamic proxy and CGLIB dynamic proxy

1. **JDK dynamic proxy can only proxy classes that implement interfaces or directly proxy interfaces, while CGLIB can proxy classes that do not implement any interfaces. ** In addition, CGLIB dynamic proxy intercepts method calls of the proxied class by generating a subclass of the proxied class. Therefore, classes and methods declared as final types cannot be proxied, and private methods cannot be proxied.
2. In terms of efficiency between the two, JDK dynamic proxy is better in most cases. With the upgrade of JDK version, this advantage becomes more obvious.

## 4. Comparison between static proxy and dynamic proxy

1. **Flexibility**: Dynamic proxy is more flexible. It does not need to implement an interface. It can directly proxy the implementation class, and there is no need to create a proxy class for each target class. In addition, in a static proxy, once a new method is added to the interface, both the target object and the proxy object must be modified, which is very troublesome!
2. **JVM level**: Static proxy turns interfaces, implementation classes, and proxy classes into actual class files during compilation. The dynamic proxy dynamically generates class bytecode at runtime and loads it into the JVM.

## 5. Summary

This article mainly introduces two implementations of the proxy mode: static proxy and dynamic proxy. Covers the actual combat between static proxy and dynamic proxy, the difference between static proxy and dynamic proxy, the difference between JDK dynamic proxy and Cglib dynamic proxy, etc.

All the source code involved in this article can be found here: [https://github.com/Snailclimb/guide-rpc-framework-learning/tree/master/src/main/java/github/javaguide/proxy](https://github.com/Snailclimb/guide-rpc-framework-learning/tree/master/src/main/java/github/javaguide/proxy) .

<!-- @include: @article-footer.snippet.md -->