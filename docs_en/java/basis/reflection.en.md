---
title: Detailed explanation of Java reflection mechanism
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: Reflection, Class, Method, Field, dynamic proxy, runtime analysis, framework principles
  - - meta
    - name: description
      content: Systematically explains the core concepts and common usage of Java reflection, and understands runtime capabilities by combining dynamic proxy and the underlying mechanism of the framework.
---

## What is reflection?

If you have studied the underlying principles of the framework or have written the framework yourself, you must be familiar with the concept of reflection.

Reflection is called the soul of the framework mainly because it gives us the ability to analyze classes and execute methods in classes at runtime.

Through reflection you can obtain all properties and methods of any class, and you can also call these methods and properties.

## Do you know the application scenarios of reflection?

For example, we usually write business code most of the time, and we rarely come into contact with scenarios where the reflection mechanism is directly used.

However, this does not mean that reflection is useless. On the contrary, it is reflection that allows you to use various frameworks so easily. Frameworks such as Spring/Spring Boot, MyBatis, etc. all use reflection mechanisms extensively.

**Dynamic proxies are also used extensively in these frameworks, and the implementation of dynamic proxies also relies on reflection. **

For example, the following is a sample code for implementing dynamic proxy through JDK, which uses the reflection class `Method` to call the specified method.

```java
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * The real object in the proxy class
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }


    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

In addition, the implementation of **annotations**, a powerful tool in Java, also uses reflection.

Why does a `@Component` annotation declare a class as a Spring Bean when you use Spring? Why do you read the value in the configuration file through a `@Value` annotation? How exactly does it work?

These are all because you can analyze the class based on reflection and then obtain the annotations on the parameters of the class/property/method/method. After you obtain the annotations, you can perform further processing.

## Let’s talk about the advantages and disadvantages of the reflection mechanism

**Advantages**: It can make our code more flexible and provide convenience for various frameworks to provide out-of-the-box functions.

**Disadvantages**: It gives us the ability to analyze operation classes at runtime, which also increases security issues. For example, you can ignore the security check of generic parameters (the security check of generic parameters occurs at compile time). In addition, the performance of reflection is slightly worse, but it actually has little impact on the framework. Related reading: [Java Reflection: Why is it so slow?](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow)

## Reflection in practice

### Four ways to obtain Class objects

If we obtain this information dynamically, we need to rely on the Class object. The Class object tells the running program about the methods, variables and other information of a class. Java provides four ways to obtain Class objects:

**1. You can use it if you know the specific class:**

```java
Class alunbarClass = TargetObject.class;
```

But we generally don’t know the specific class. We basically obtain the Class object by traversing the classes under the package. Obtaining the Class object in this way will not be initialized.

**2. Get the full path of the incoming class through `Class.forName()`: **

```java
Class alunbarClass1 = Class.forName("cn.javaguide.TargetObject");
```

**3. Obtain through object instance `instance.getClass()`: **

```java
TargetObject o = new TargetObject();
Class alunbarClass2 = o.getClass();
```

**4. Pass in the class path through the class loader `xxxClassLoader.loadClass()` to obtain: **

```java
ClassLoader.getSystemClassLoader().loadClass("cn.javaguide.TargetObject");
```

Obtaining the Class object through the class loader will not be initialized, which means that the static code block and static object will not be executed without a series of steps including initialization.

### Some basic operations of reflection

1. Create a class `TargetObject` that we want to use reflection operations on.

```java
package cn.javaguide;

public class TargetObject {
    private String value;

    public TargetObject() {
        value = "JavaGuide";
    }

    public void publicMethod(String s) {
        System.out.println("I love " + s);
    }

    private void privateMethod() {
        System.out.println("value is " + value);
    }
}
```

2. Use reflection to operate the methods and properties of this class

```java
package cn.javaguide;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Main {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchFieldException {
        /**
         * Get the Class object of the TargetObject class and create a TargetObject class instance
         */
        Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
        TargetObject targetObject = (TargetObject) targetClass.newInstance();
        /**
         * Get all methods defined in the TargetObject class
         */
        Method[] methods = targetClass.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName());
        }

        /**
         * Get the specified method and call it
         */
        Method publicMethod = targetClass.getDeclaredMethod("publicMethod",
                String.class);

        publicMethod.invoke(targetObject, "JavaGuide");

        /**
         * Get the specified parameters and modify them
         */
        Field field = targetClass.getDeclaredField("value");
        //In order to modify the parameters in the class, we cancel the security check
        field.setAccessible(true);
        field.set(targetObject, "JavaGuide");

        /**
         * Call private method
         */
        Method privateMethod = targetClass.getDeclaredMethod("privateMethod");
        //In order to call the private method we cancel the security check
        privateMethod.setAccessible(true);
        privateMethod.invoke(targetObject);
    }
}```

Output content:

```plain
publicMethod
privateMethod
I love JavaGuide
value is JavaGuide
```

**Note**: Some readers mentioned that the above code will throw a `ClassNotFoundException` exception when running. The specific reason is that you did not replace the package name of this code with the package where the `TargetObject` you created is located.
You can refer to: <https://www.cnblogs.com/chanshuyi/p/head_first_of_reflection.html> this article.

```java
Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
```

<!-- @include: @article-footer.snippet.md -->