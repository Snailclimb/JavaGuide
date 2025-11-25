---
title: Summary of common Java basic interview questions (Part 2)
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: Java exception handling, Java generics, Java reflection, Java annotations, Java SPI mechanism, Java serialization, Java deserialization, Java IO stream, Java syntax sugar, Java basic interview questions, Checked Exception, Unchecked Exception, try-with-resources, reflection application scenarios, serialization protocol, BIO, NIO, AIO, IO model
  - - meta
    - name: description
      content: The highest quality summary of Java basic common knowledge points and interview questions on the Internet. I hope it will be helpful to you!
---

<!-- @include: @article-header.snippet.md -->

##Exception

**Java Exception Class Hierarchy Diagram Overview**:

![Java exception class hierarchy diagram](https://oss.javaguide.cn/github/javaguide/java/basis/types-of-exceptions-in-java.png)

### What is the difference between Exception and Error?

In Java, all exceptions have a common ancestor, the `Throwable` class in the `java.lang` package. The `Throwable` class has two important subclasses:

- **`Exception`**: Exceptions that can be handled by the program itself can be caught through `catch`. `Exception` can be divided into Checked Exception (checked exception, must be handled) and Unchecked Exception (unchecked exception, need not be handled).
- **`Error`**: `Error` is an error that cannot be handled by the program. ~~We cannot capture it through `catch`~~ It is not recommended to capture it through `catch`. For example, Java virtual machine running error (`Virtual MachineError`), virtual machine insufficient memory error (`OutOfMemoryError`), class definition error (`NoClassDefFoundError`), etc. When these exceptions occur, the Java Virtual Machine (JVM) generally chooses to terminate the thread.

### The difference between ClassNotFoundException and NoClassDefFoundError

- `ClassNotFoundException` is an Exception that occurs when a class cannot be found during dynamic loading using reflection. It is expected and can be caught and processed.
- `NoClassDefFoundError` is an Error. It is a class that exists during compilation and cannot be linked at runtime (for example, the jar package is missing). It is an environmental problem that causes the JVM to be unable to continue.

### ⭐️What is the difference between Checked Exception and Unchecked Exception?

**Checked Exception** is a checked exception. During the compilation process of Java code, if the checked exception is not handled by the `catch` or `throws` keyword, it will not be compiled.

For example, the following IO operation code:

![](https://oss.javaguide.cn/github/javaguide/java/basis/checked-exception.png)

Except for `RuntimeException` and its subclasses, other `Exception` classes and their subclasses are checked exceptions. Common checked exceptions include: IO-related exceptions, `ClassNotFoundException`, `SQLException`...

**Unchecked Exception** is **Unchecked Exception**. During the compilation process of Java code, we can compile normally even if we do not handle unchecked exceptions.

`RuntimeException` and its subclasses are collectively called unchecked exceptions. The common ones are (it is recommended to write them down, as they will be frequently used in daily development):

- `NullPointerException` (null pointer error)
- `IllegalArgumentException` (parameter error such as method parameter type error)
- `NumberFormatException` (string to number conversion error, subclass of `IllegalArgumentException`)
- `ArrayIndexOutOfBoundsException` (array out of bounds error)
- `ClassCastException` (type conversion error)
- `ArithmeticException` (arithmetic error)
- `SecurityException` (security error such as insufficient permissions)
- `UnsupportedOperationException` (unsupported operation error such as repeatedly creating the same user)
-…

![](https://oss.javaguide.cn/github/javaguide/java/basis/unchecked-exception.png)

### Do you prefer to use Checked Exception or Unchecked Exception?

Use Unchecked Exception by default, use Checked Exception only when necessary.

We can think of Unchecked Exceptions (such as `NullPointerException`) as code bugs. The best way to deal with a bug is to expose it and then fix the code, rather than using try-catch to cover it up.

In general, use Checked Exception only in one situation: when the exception is part of the business logic and the caller must handle it. For example, an insufficient balance exception. This is not a bug, but a normal business branch. I need to use Checked Exception to force the caller to handle this situation, such as prompting the user to recharge. This way, the code can be kept as simple as possible while ensuring the integrity of key business logic.

### What are the common methods of Throwable class?

- `String getMessage()`: Returns detailed information when the exception occurs
- `String toString()`: Returns a brief description of the exception when it occurred
- `String getLocalizedMessage()`: Returns the localized information of the exception object. Use a subclass of `Throwable` to override this method to generate localized information. If a subclass does not override this method, the information returned by this method is the same as the result returned by `getMessage()`
- `void printStackTrace()`: Prints the exception information encapsulated by the `Throwable` object on the console

### How to use try-catch-finally?

- `try` block: used to catch exceptions. It may be followed by zero or more `catch` blocks. If there is no `catch` block, it must be followed by a `finally` block.
- `catch` block: used to handle exceptions caught by try.
- `finally` block: The statements in the `finally` block will be executed regardless of whether the exception is caught or handled. When a `return` statement is encountered in a `try` block or a `catch` block, the `finally` statement block will be executed before the method returns.

Code example:

```java
try {
    System.out.println("Try to do something");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Catch Exception -> " + e.getMessage());
} finally {
    System.out.println("Finally");
}
```

Output:

```plain
Try to do something
Catch Exception -> RuntimeException
Finally
```

**Note: Do not use return!** in the finally statement block. When there are return statements in both the try statement and the finally statement, the return statement in the try statement block will be ignored. This is because the return value in the try statement will be temporarily stored in a local variable. After the return in the finally statement is executed, the value of this local variable becomes the return value in the finally statement.

Code example:

```java
public static void main(String[] args) {
    System.out.println(f(2));
}

public static int f(int value) {
    try {
        return value * value;
    } finally {
        if (value == 2) {
            return 0;
        }
    }
}
```

Output:

```plain
0
```

### Will the code in finally be executed?

Not necessarily! In some cases, the code in finally will not be executed.For example, if the virtual machine is terminated before finally, the code in finally will not be executed.

```java
try {
    System.out.println("Try to do something");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Catch Exception -> " + e.getMessage());
    // Terminate the currently running Java virtual machine
    System.exit(1);
} finally {
    System.out.println("Finally");
}
```

Output:

```plain
Try to do something
Catch Exception -> RuntimeException
```

In addition, the code in the `finally` block will not be executed in the following 2 special cases:

1. The thread where the program is located dies.
2. Switch off the CPU.

Related issue: <https://github.com/Snailclimb/JavaGuide/issues/190>.

🧗🏻 Let’s take a step further: analyze the implementation principle behind the syntactic sugar of `try catch finally` from a bytecode perspective.

### How to use `try-with-resources` instead of `try-catch-finally`?

1. **Scope of application (definition of resources):** Any object that implements `java.lang.AutoCloseable` or `java.io.Closeable`
2. **Execution order of closing resources and finally blocks:** In a `try-with-resources` statement, any catch or finally block runs after the declared resource is closed

"Effective Java" clearly states:

> When faced with resources that must be closed, we should always use `try-with-resources` instead of `try-finally`. The resulting code is shorter and clearer, and the exceptions generated are more useful to us. The `try-with-resources` statement makes it easier to write code that must close resources, which is almost impossible with `try-finally`.

Resources like `InputStream`, `OutputStream`, `Scanner`, `PrintWriter`, etc. in Java require us to call the `close()` method to manually close it. Generally, we implement this requirement through the `try-catch-finally` statement, as follows:

```java
//Read the contents of the text file
Scanner scanner = null;
try {
    scanner = new Scanner(new File("D://read.txt"));
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException e) {
    e.printStackTrace();
} finally {
    if (scanner != null) {
        scanner.close();
    }
}
```

Modify the above code using the `try-with-resources` statement since Java 7:

```java
try (Scanner scanner = new Scanner(new File("test.txt"))) {
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException fnfe) {
    fnfe.printStackTrace();
}
```

Of course, when multiple resources need to be closed, it is very simple to use `try-with-resources` to implement it. If you still use `try-catch-finally`, it may cause a lot of problems.

Multiple resources can be declared in a `try-with-resources` block by using semicolons to separate them.

```java
try (BufferedInputStream bin = new BufferedInputStream(new FileInputStream(new File("test.txt")));
     BufferedOutputStream bout = new BufferedOutputStream(new FileOutputStream(new File("out.txt")))) {
    int b;
    while ((b = bin.read()) != -1) {
        bout.write(b);
    }
}
catch (IOException e) {
    e.printStackTrace();
}
```

### ⭐️What should we pay attention to when using exceptions?

- Do not define exceptions as static variables, because this will cause confusion in the exception stack information. Every time an exception is thrown manually, we need to manually new an exception object to throw.
- The exception information thrown must be meaningful.
- It is recommended to throw more specific exceptions. For example, when converting a string to a number format error, `NumberFormatException` should be thrown instead of its parent class `IllegalArgumentException`.
- Avoid repeated logging: If enough information (including exception type, error information, stack trace, etc.) has been recorded where the exception is caught, then the same error information should not be recorded again when the exception is thrown again in the business code. Repeated logging bloats log files and may obscure the actual cause of a problem, making it more difficult to track down and resolve.
-…

## Generics

### What are generics? What does it do?

**Java Generics** is a new feature introduced in JDK 5. Using generic parameters can enhance the readability and stability of the code.

The compiler can detect generic parameters and specify the type of object passed in through generic parameters. For example, `ArrayList<Person> persons = new ArrayList<Person>()` This line of code indicates that the `ArrayList` object can only be passed in `Person` objects. If other types of objects are passed in, an error will be reported.

```java
ArrayList<E> extends AbstractList<E>
```

Moreover, the native `List` return type is `Object`, which requires manual type conversion before it can be used. The compiler automatically converts it after using generics.

### What are the ways to use generics?

Generics are generally used in three ways: **generic class**, **generic interface**, and **generic method**.

**1. Generic class**:

```java
//Here T can be written as any identifier. Common parameters such as T, E, K, V, etc. are often used to represent generics.
//When instantiating a generic class, the specific type of T must be specified
public class Generic<T>{

    private T key;

    public Generic(T key) {
        this.key = key;
    }

    public T getKey(){
        return key;
    }
}
```

How to instantiate a generic class:

```java
Generic<Integer> genericInteger = new Generic<Integer>(123456);
```

**2. Generic interface**:

```java
public interface Generator<T> {
    public T method();
}
```

Implement a generic interface without specifying a type:

```java
class GeneratorImpl<T> implements Generator<T>{
    @Override
    public T method() {
        return null;
    }
}
```

Implement the generic interface and specify the type:

```java
class GeneratorImpl implements Generator<String> {
    @Override
    public String method() {
        return "hello";
    }
}
```

**3. Generic methods**:

```java
   public static < E > void printArray( E[] inputArray )
   {
         for (E element : inputArray ){
            System.out.printf( "%s ", element );
         }
         System.out.println();
    }
```

Use:

```java
// Create arrays of different types: Integer, Double and Character
Integer[] intArray = { 1, 2, 3 };
String[] stringArray = { "Hello", "World" };
printArray(intArray);
printArray( stringArray );```

> 注意: `public static < E > void printArray( E[] inputArray )` 一般被称为静态泛型方法;在 java 中泛型只是一个占位符，必须在传递类型后才能使用。类在实例化时才能真正的传递类型参数，由于静态方法的加载先于类的实例化，也就是说类中的泛型还没有传递真正的类型参数，静态的方法的加载就已经完成了，所以静态泛型方法是没有办法使用类上声明的泛型的。只能使用自己声明的 `<E>`

### 项目中哪里用到了泛型？

- 自定义接口通用返回结果 `CommonResult<T>` 通过参数 `T` 可根据具体的返回类型动态指定结果的数据类型
- 定义 `Excel` 处理类 `ExcelUtil<T>` 用于动态指定 `Excel` 导出的数据类型
- 构建集合工具类（参考 `Collections` 中的 `sort`, `binarySearch` 方法）。
- ……

## ⭐️反射

关于反射的详细解读，请看这篇文章 [Java 反射机制详解](https://javaguide.cn/java/basis/reflection.html) 。

### 什么是反射？

简单来说，Java 反射 (Reflection) 是一种**在程序运行时，动态地获取类的信息并操作类或对象（方法、属性）的能力**。

通常情况下，我们写的代码在编译时类型就已经确定了，要调用哪个方法、访问哪个字段都是明确的。但反射允许我们在**运行时**才去探知一个类有哪些方法、哪些属性、它的构造函数是怎样的，甚至可以动态地创建对象、调用方法或修改属性，哪怕这些方法或属性是私有的。

正是这种在运行时“反观自身”并进行操作的能力，使得反射成为许多**通用框架和库的基石**。它让代码更加灵活，能够处理在编译时未知的类型。

### 反射有什么优缺点？

**优点：**

1. **灵活性和动态性**：反射允许程序在运行时动态地加载类、创建对象、调用方法和访问字段。这样可以根据实际需求（如配置文件、用户输入、注解等）动态地适应和扩展程序的行为，显著提高了系统的灵活性和适应性。
2. **框架开发的基础**：许多现代 Java 框架（如 Spring、Hibernate、MyBatis）都大量使用反射来实现依赖注入（DI）、面向切面编程（AOP）、对象关系映射（ORM）、注解处理等核心功能。反射是实现这些“魔法”功能不可或缺的基础工具。
3. **解耦合和通用性**：通过反射，可以编写更通用、可重用和高度解耦的代码，降低模块之间的依赖。例如，可以通过反射实现通用的对象拷贝、序列化、Bean 工具等。

**缺点：**

1. **性能开销**：反射操作通常比直接代码调用要慢。因为涉及到动态类型解析、方法查找以及 JIT 编译器的优化受限等因素。不过，对于大多数框架场景，这种性能损耗通常是可以接受的，或者框架本身会做一些缓存优化。
2. **安全性问题**：反射可以绕过 Java 语言的访问控制机制（如访问 `private` 字段和方法），破坏了封装性，可能导致数据泄露或程序被恶意篡改。此外，还可以绕过泛型检查，带来类型安全隐患。
3. **代码可读性和维护性**：过度使用反射会使代码变得复杂、难以理解和调试。错误通常在运行时才会暴露，不像编译期错误那样容易发现。

相关阅读：[Java Reflection: Why is it so slow?](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow) 。

### 反射的应用场景？

我们平时写业务代码可能很少直接跟 Java 的反射（Reflection）打交道。但你可能没意识到，你天天都在享受反射带来的便利！**很多流行的框架，比如 Spring/Spring Boot、MyBatis 等，底层都大量运用了反射机制**，这才让它们能够那么灵活和强大。

下面简单列举几个最场景的场景帮助大家理解。

**1.依赖注入与控制反转（IoC）**

以 Spring/Spring Boot 为代表的 IoC 框架，会在启动时扫描带有特定注解（如 `@Component`, `@Service`, `@Repository`, `@Controller`）的类，利用反射实例化对象（Bean），并通过反射注入依赖（如 `@Autowired`、构造器注入等）。

**2.注解处理**

注解本身只是个“标记”，得有人去读这个标记才知道要做什么。反射就是那个“读取器”。框架通过反射检查类、方法、字段上有没有特定的注解，然后根据注解信息执行相应的逻辑。比如，看到 `@Value`，就用反射读取注解内容，去配置文件找对应的值，再用反射把值设置给字段。

**3.动态代理与 AOP**

想在调用某个方法前后自动加点料（比如打日志、开事务、做权限检查）？AOP（面向切面编程）就是干这个的，而动态代理是实现 AOP 的常用手段。JDK 自带的动态代理（Proxy 和 InvocationHandler）就离不开反射。代理对象在内部调用真实对象的方法时，就是通过反射的 `Method.invoke` 来完成的。

```java
public class DebugInvocationHandler implements InvocationHandler {
    private final Object target; // 真实对象

    public DebugInvocationHandler(Object target) { this.target = target; }

    // proxy: 代理对象, method: 被调用的方法, args: 方法参数
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("切面逻辑：调用方法 " + method.getName() + " 之前");
        // 通过反射调用真实对象的同名方法
        Object result = method.invoke(target, args);
        System.out.println("切面逻辑：调用方法 " + method.getName() + " 之后");
        return result;
    }
}
```

**4.对象关系映射（ORM）**

像 MyBatis、Hibernate 这种框架，能帮你把数据库查出来的一行行数据，自动变成一个个 Java 对象。它是怎么知道数据库字段对应哪个 Java 属性的？还是靠反射。它通过反射获取 Java 类的属性列表，然后把查询结果按名字或配置对应起来，再用反射调用 setter 或直接修改字段值。反过来，保存对象到数据库时，也是用反射读取属性值来拼 SQL。

## 注解

### 何谓注解？

`Annotation` （注解） 是 Java5 开始引入的新特性，可以看作是一种特殊的注释，主要用于修饰类、方法或者变量，提供某些信息供程序在编译或者运行时使用。

注解本质是一个继承了`Annotation` 的特殊接口：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {

}

public interface Override extends Annotation{

}
```

JDK 提供了很多内置的注解（比如 `@Override`、`@Deprecated`），同时，我们还可以自定义注解。

### 注解的解析方法有哪几种？

注解只有被解析之后才会生效，常见的解析方法有两种：

- **编译期直接扫描**：编译器在编译 Java 代码的时候扫描对应的注解并处理，比如某个方法使用`@Override` 注解，编译器在编译的时候就会检测当前的方法是否重写了父类对应的方法。
- **运行期通过反射处理**：像框架中自带的注解(比如 Spring 框架的 `@Value`、`@Component`)都是通过反射来进行处理的。

## ⭐️SPI

关于 SPI 的详细解读，请看这篇文章 [Java SPI 机制详解](https://javaguide.cn/java/basis/spi.html) 。

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

### SPI 的优缺点？

通过 SPI 机制能够大大地提高接口设计的灵活性，但是 SPI 机制也存在一些缺点，比如：

- 需要遍历加载所有的实现类，不能做到按需加载，这样效率还是相对较低的。
- 当多个 `ServiceLoader` 同时 `load` 时，会有并发问题。

## ⭐️序列化和反序列化

关于序列化和反序列化的详细解读，请看这篇文章 [Java 序列化详解](https://javaguide.cn/java/basis/serialization.html) ，里面涉及到的知识点和面试题更全面。

### 什么是序列化?什么是反序列化?

如果我们需要持久化 Java 对象比如将 Java 对象保存在文件中，或者在网络传输 Java 对象，这些场景都需要用到序列化。

简单来说：

- **序列化**：将数据结构或对象转换成可以存储或传输的形式，通常是二进制字节流，也可以是 JSON, XML 等文本格式
- **反序列化**：将在序列化过程中所生成的数据转换为原始数据结构或者对象的过程

对于 Java 这种面向对象编程语言来说，我们序列化的都是对象（Object）也就是实例化后的类(Class)，但是在 C++这种半面向对象的语言中，struct(结构体)定义的是数据结构类型，而 class 对应的是对象类型。

下面是序列化和反序列化常见应用场景：

- 对象在进行网络传输（比如远程方法调用 RPC 的时候）之前需要先被序列化，接收到序列化的对象之后需要再进行反序列化；
- 将对象存储到文件之前需要进行序列化，将对象从文件中读取出来需要进行反序列化；
- 将对象存储到数据库（如 Redis）之前需要用到序列化，将对象从缓存数据库中读取出来需要反序列化；
- 将对象存储到内存之前需要进行序列化，从内存中读取出来之后需要进行反序列化。

维基百科是如是介绍序列化的：

> **序列化**（serialization）在计算机科学的数据处理中，是指将数据结构或对象状态转换成可取用格式（例如存成文件，存于缓冲，或经由网络中发送），以留待后续在相同或另一台计算机环境中，能恢复原先状态的过程。依照序列化格式重新获取字节的结果时，可以利用它来产生与原始对象相同语义的副本。对于许多对象，像是使用大量引用的复杂对象，这种序列化重建的过程并不容易。面向对象中的对象序列化，并不概括之前原始对象所关系的函数。这种过程也称为对象编组（marshalling）。从一系列字节提取数据结构的反向操作，是反序列化（也称为解编组、deserialization、unmarshalling）。

综上：**序列化的主要目的是通过网络传输对象或者说是将对象存储到文件系统、数据库、内存中。**

![](https://oss.javaguide.cn/github/javaguide/a478c74d-2c48-40ae-9374-87aacf05188c.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.corejavaguru.com/java/serialization/interview-questions-1</p>

**序列化协议对应于 TCP/IP 4 层模型的哪一层？**

我们知道网络通信的双方必须要采用和遵守相同的协议。TCP/IP 四层模型是下面这样的，序列化协议属于哪一层呢？

1. 应用层
2. 传输层
3. 网络层
4. 网络接口层

![TCP/IP 四层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

如上图所示，OSI 七层协议模型中，表示层做的事情主要就是对应用层的用户数据进行处理转换为二进制流。反过来的话，就是将二进制流转换成应用层的用户数据。这不就对应的是序列化和反序列化么？

因为，OSI 七层协议模型中的应用层、表示层和会话层对应的都是 TCP/IP 四层模型中的应用层，所以序列化协议属于 TCP/IP 协议应用层的一部分。

### 如果有些字段不想进行序列化怎么办？

对于不想进行序列化的变量，使用 `transient` 关键字修饰。

`transient` 关键字的作用是：阻止实例中那些用此关键字修饰的的变量序列化；当对象被反序列化时，被 `transient` 修饰的变量值不会被持久化和恢复。

关于 `transient` 还有几点注意：

- `transient` 只能修饰变量，不能修饰类和方法。
- `transient` 修饰的变量，在反序列化后变量值将会被置成类型的默认值。例如，如果是修饰 `int` 类型，那么反序列后结果就是 `0`。
- `static` 变量因为不属于任何对象(Object)，所以无论有没有 `transient` 关键字修饰，均不会被序列化。

### 常见序列化协议有哪些？

JDK 自带的序列化方式一般不会用 ，因为序列化效率低并且存在安全问题。比较常用的序列化协议有 Hessian、Kryo、Protobuf、ProtoStuff，这些都是基于二进制的序列化协议。

像 JSON 和 XML 这种属于文本类序列化方式。虽然可读性比较好，但是性能较差，一般不会选择。

### 为什么不推荐使用 JDK 自带的序列化？

我们很少或者说几乎不会直接使用 JDK 自带的序列化方式，主要原因有下面这些原因：

- **不支持跨语言调用** : 如果调用的是其他语言开发的服务的时候就不支持了。
- **性能差**：相比于其他序列化框架性能更低，主要原因是序列化之后的字节数组体积较大，导致传输成本加大。
- **存在安全问题**：序列化和反序列化本身并不存在问题。但当输入的反序列化的数据可被用户控制，那么攻击者即可通过构造恶意输入，让反序列化产生非预期的对象，在此过程中执行构造的任意代码。相关阅读：[应用安全：JAVA 反序列化漏洞之殇](https://cryin.github.io/blog/secure-development-java-deserialization-vulnerability/) 。

## I/O

关于 I/O 的详细解读，请看下面这几篇文章，里面涉及到的知识点和面试题更全面。

- [Java IO 基础知识总结](https://javaguide.cn/java/io/io-basis.html)
- [Java IO 设计模式总结](https://javaguide.cn/java/io/io-design-patterns.html)
- [Java IO 模型详解](https://javaguide.cn/java/io/io-model.html)

### Java IO 流了解吗？

IO 即 `Input/Output`，输入和输出。数据输入到计算机内存的过程即输入，反之输出到外部存储（比如数据库，文件，远程主机）的过程即输出。数据传输过程类似于水流，因此称为 IO 流。IO 流在 Java 中分为输入流和输出流，而根据数据的处理方式又分为字节流和字符流。

Java IO 流的 40 多个类都是从如下 4 个抽象类基类中派生出来的。

- `InputStream`/`Reader`: 所有的输入流的基类，前者是字节输入流，后者是字符输入流。
- `OutputStream`/`Writer`: 所有输出流的基类，前者是字节输出流，后者是字符输出流。

### I/O 流为什么要分为字节流和字符流呢?

The essence of the question is: **Whether it is file reading and writing or network sending and receiving, the smallest storage unit of information is bytes, so why are I/O stream operations divided into byte stream operations and character stream operations? **

Personally, I think there are two main reasons:

- The character stream is obtained by converting bytes by the Java virtual machine. This process is quite time-consuming;
- If we don't know the encoding type, garbled characters can easily occur when using byte streams.

### What are the design patterns in Java IO?

Reference answer: [Summary of Java IO design patterns](https://javaguide.cn/java/io/io-design-patterns.html)

### What is the difference between BIO, NIO and AIO?

Reference answer: [Detailed explanation of Java IO model](https://javaguide.cn/java/io/io-model.html)

## Syntactic sugar

### What is syntactic sugar?

**Syntactic sugar** refers to a special syntax designed by a programming language to facilitate programmers to develop programs. This syntax has no impact on the functionality of the programming language. To achieve the same function, code written based on syntax sugar is often simpler, more concise and easier to read.

For example, `for-each` in Java is a commonly used syntax sugar, and its principle is actually based on ordinary for loops and iterators.

```java
String[] strs = {"JavaGuide", "Public account: JavaGuide", "Blog: https://javaguide.cn/"};
for (String s : strs) {
    System.out.println(s);
}
```

However, the JVM does not actually recognize syntax sugar. In order for Java syntax sugar to be executed correctly, it needs to be desugared by the compiler, that is, it is converted into the basic syntax recognized by the JVM during the program compilation stage. This also shows that the real support for syntactic sugar in Java is the Java compiler rather than the JVM. If you look at the source code of `com.sun.tools.javac.main.JavaCompiler`, you will find that one step in `compile()` is to call `desugar()`. This method is responsible for decoding the implementation of syntax sugar.

### What are the common syntactic sugars in Java?

The most commonly used syntactic sugars in Java include generics, automatic unboxing, variable-length parameters, enumerations, inner classes, enhanced for loops, try-with-resources syntax, lambda expressions, etc.

For a detailed explanation of these syntactic sugars, please read this article [Java Syntactic Sugar Detailed Explanation](./syntactic-sugar.md).

<!-- @include: @article-footer.snippet.md -->