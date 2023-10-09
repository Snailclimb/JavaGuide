---
title: Java 21 新特性概览(重要)
category: Java
tag:
  - Java新特性
---

JDK 21 于 2023 年 9 月 19 日 发布，这是一个非常重要的版本，里程碑式。

JDK21 是 LTS（长期支持版），至此为止，目前有 JDK8、JDK11、JDK17 和 JDK21 这四个长期支持版了。

JDK 21 共有 15 个新特性：

- [JEP 430：String Templates（字符串模板）](https://openjdk.org/jeps/430)（预览）
- [JEP 431：Sequenced Collections（序列化集合）](https://openjdk.org/jeps/431)

- [JEP 439：Generational ZGC（分代 ZGC）](https://openjdk.org/jeps/439)

- [JEP 440：Record Patterns（记录模式）](https://openjdk.org/jeps/440)

- [JEP 444：Virtual Threads（虚拟线程）](https://openjdk.org/jeps/444)

## JEP 430：字符串模板（预览）

String Templates(字符串模板)  目前仍然是 JDK 21 中的一个预览功能。

String Templates 提供了一种更简洁、更直观的方式来动态构建字符串。通过使用占位符`${}`，我们可以将变量的值直接嵌入到字符串中，而不需要手动处理。在运行时，Java 编译器会将这些占位符替换为实际的变量值。并且，表达式支持局部变量、静态/非静态字段甚至方法、计算结果等特性。

实际上，String Templates（字符串模板）再大多数编程语言中都存在:

```typescript
"Greetings {{ name }}!";  //Angular
`Greetings ${ name }!`;		//Typescript
$"Greetings { name }!"		//Visual basic
f"Greetings { name }!"		//Python
```

Java 在没有 String Templates 之前，我们通常使用字符串拼接或格式化方法来构建字符串：

```java
//concatenation
message = "Greetings " + name + "!";	

//String.format()
message = String.format("Greetings %s!", name);	//concatenation

//MessageFormat
message = new MessageFormat("Greetings {0}!").format(name);

//StringBuilder
message = new StringBuilder().append("Greetings ").append(name).append("!").toString();
```

这些方法或多或少都存在一些缺点，比如难以阅读、冗长、复杂。

Java 使用  String Templates 进行字符串拼接，可以直接在字符串中嵌入表达式，而无需进行额外的处理：

```java
String message = STR."Greetings \{name}!";
```

在上面的模板表达式中：

- STR 是模板处理器。
- `\{name}`为表达式，运行时，这些表达式将被相应的变量值替换。

  Java 目前支持三种模板处理器：

- STR：自动执行字符串插值，即将模板中的每个嵌入式表达式替换为其值（转换为字符串）。
- FMT：和 STR 类似，但是它还可以接受格式说明符，这些格式说明符出现在嵌入式表达式的左边，用来控制输出的样式
- RAW：不会像 STR 和 FMT 模板处理器那样自动处理字符串模板，而是返回一个 `StringTemplate` 对象，这个对象包含了模板中的文本和表达式的信息

```java
String name = "Lokesh";	

//STR
String message = STR."Greetings \{name}.";

//FMT
String message = STR."Greetings %-12s\{name}.";

//RAW
StringTemplate st = RAW."Greetings \{name}.";
String message = STR.process(st);
```

除了 JDK 自带的三种模板处理器外，你还可以实现 `StringTemplate.Processor` 接口来创建自己的模板处理器。

我们可以使用局部变量、静态/非静态字段甚至方法作为嵌入表达式：

```java
//variable
message = STR."Greetings \{name}!";

//method
message = STR."Greetings \{getName()}!";

//field
message = STR."Greetings \{this.name}!";
```

还可以在表达式中执行计算并打印结果：

```java
int x = 10, y = 20;
String s = STR."\{x} + \{y} = \{x + y}";	//"10 + 20 = 30"
```

为了提高可读性，我们可以将嵌入的表达式分成多行:

```java
String time = STR."The current time is \{
    //sample comment - current time in HH:mm:ss
    DateTimeFormatter
      .ofPattern("HH:mm:ss")
      .format(LocalTime.now())
	}.";
```

## JEP431：序列化集合

JDK 21 引入了一种新的集合类型：**Sequenced Collections（序列化集合）**。

## JEP 439：分代 ZGC

JDK21 中对 ZGC 进行了功能扩展，增加了分代 GC 功能。不过，默认是关闭的，需要通过配置打开：

```bash
// 启用分代ZGC
java -XX:+UseZGC -XX:+ZGenerational ...
```

在未来的版本中，官方会把 ZGenerational 设为默认值，即默认打开 ZGC 的分代 GC。在更晚的版本中，非分代 ZGC 就被移除。

> In a future release we intend to make Generational ZGC the default, at which point -XX:-ZGenerational will select non-generational ZGC. In an even later release we intend to remove non-generational ZGC, at which point the ZGenerational option will become obsolete.
>
> 在将来的版本中，我们打算将 Generational ZGC 作为默认选项，此时-XX:-ZGenerational 将选择非分代 ZGC。在更晚的版本中，我们打算移除非分代 ZGC，此时 ZGenerational 选项将变得过时。

分代 ZGC 可以显著减少垃圾回收过程中的停顿时间，并提高应用程序的响应性能。这对于大型 Java 应用程序和高并发场景下的性能优化非常有价值。

## JEP 440：记录模式

记录模式在 Java 19 进行了第一次预览， 由 [JEP 405](https://openjdk.org/jeps/405) 提出。JDK 20 中是第二次预览，由 [JEP 432](https://openjdk.org/jeps/432) 提出。最终，记录模式在 JDK21 顺利转正。

[Java 20 新特性概览](./java20.md)已经详细介绍过记录模式，这里就不重复了。

## JEP 444：虚拟线程

虚拟线程是一项重量级的更新，一定一定要重视！

虚拟线程在 Java 19 中进行了第一次预览，由[JEP 425](https://openjdk.org/jeps/425)提出。JDK 20 中是第二次预览。最终，虚拟线程在 JDK21 顺利转正。

[Java 20 新特性概览](./java20.md)已经详细介绍过虚拟线程，这里就不重复了。

## 参考

- Java 21 String Templates：<https://howtodoinjava.com/java/java-string-templates/>

