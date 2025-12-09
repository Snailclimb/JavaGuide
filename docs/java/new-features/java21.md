---
title: Java 21 新特性概览(重要)
category: Java
tag:
  - Java新特性
head:
  - - meta
    - name: keywords
      content: Java 21,JDK21,LTS,字符串模板,Sequenced Collections,分代 ZGC,记录模式,switch 模式匹配,虚拟线程,外部函数与内存 API
  - - meta
    - name: description
      content: 概览 JDK 21 的关键新特性与实践影响，重点介绍字符串模板、Sequenced Collections、分代 ZGC、虚拟线程等。
---

JDK 21 于 2023 年 9 月 19 日 发布，这是一个非常重要的版本，里程碑式。

JDK21 是 LTS（长期支持版），至此为止，目前有 JDK8、JDK11、JDK17 和 JDK21 这四个长期支持版了。

JDK 21 共有 15 个新特性，这篇文章会挑选其中较为重要的一些新特性进行详细介绍：

- [JEP 430：String Templates（字符串模板）](https://openjdk.org/jeps/430)（预览）
- [JEP 431：Sequenced Collections（序列化集合）](https://openjdk.org/jeps/431)

- [JEP 439：Generational ZGC（分代 ZGC）](https://openjdk.org/jeps/439)

- [JEP 440：Record Patterns（记录模式）](https://openjdk.org/jeps/440)

- [JEP 441：Pattern Matching for switch（switch 的模式匹配）](https://openjdk.org/jeps/442)

- [JEP 442：Foreign Function & Memory API（外部函数和内存 API）](https://openjdk.org/jeps/442)（第三次预览）

- [JEP 443：Unnamed Patterns and Variables（未命名模式和变量](https://openjdk.org/jeps/443)（预览）

- [JEP 444：Virtual Threads（虚拟线程）](https://openjdk.org/jeps/444)

- [JEP 445：Unnamed Classes and Instance Main Methods（未命名类和实例 main 方法 ）](https://openjdk.org/jeps/445)（预览）

## JEP 430：字符串模板（预览）

String Templates(字符串模板) 目前仍然是 JDK 21 中的一个预览功能。

String Templates 提供了一种更简洁、更直观的方式来动态构建字符串。通过使用占位符`${}`，我们可以将变量的值直接嵌入到字符串中，而不需要手动处理。在运行时，Java 编译器会将这些占位符替换为实际的变量值。并且，表达式支持局部变量、静态/非静态字段甚至方法、计算结果等特性。

实际上，String Templates（字符串模板）再大多数编程语言中都存在:

```typescript
"Greetings {{ name }}!";  //Angular
`Greetings ${ name }!`;    //Typescript
$"Greetings { name }!"    //Visual basic
f"Greetings { name }!"    //Python
```

Java 在没有 String Templates 之前，我们通常使用字符串拼接或格式化方法来构建字符串：

```java
//concatenation
message = "Greetings " + name + "!";

//String.format()
message = String.format("Greetings %s!", name);  //concatenation

//MessageFormat
message = new MessageFormat("Greetings {0}!").format(name);

//StringBuilder
message = new StringBuilder().append("Greetings ").append(name).append("!").toString();
```

这些方法或多或少都存在一些缺点，比如难以阅读、冗长、复杂。

Java 使用 String Templates 进行字符串拼接，可以直接在字符串中嵌入表达式，而无需进行额外的处理：

```java
String message = STR."Greetings \{name}!";
```

在上面的模板表达式中：

- STR 是模板处理器。
- `\{name}`为表达式，运行时，这些表达式将被相应的变量值替换。

Java 目前支持三种模板处理器：

- STR：自动执行字符串插值，即将模板中的每个嵌入式表达式替换为其值（转换为字符串）。
- FMT：和 STR 类似，但是它还可以接受格式说明符，这些格式说明符出现在嵌入式表达式的左边，用来控制输出的样式。
- RAW：不会像 STR 和 FMT 模板处理器那样自动处理字符串模板，而是返回一个 `StringTemplate` 对象，这个对象包含了模板中的文本和表达式的信息。

```java
String name = "Lokesh";

//STR
String message = STR."Greetings \{name}.";

//FMT
String message = FMT."Greetings %-12s\{name}.";

//RAW
StringTemplate st = RAW."Greetings \{name}.";
String message = STR.process(st);
```

除了 JDK 自带的三种模板处理器外，你还可以实现 `StringTemplate.Processor` 接口来创建自己的模板处理器，只需要继承 `StringTemplate.Processor`接口，然后实现 `process` 方法即可。

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
String s = STR."\{x} + \{y} = \{x + y}";  //"10 + 20 = 30"
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

JDK 21 引入了一种新的集合类型：**Sequenced Collections（序列化集合，也叫有序集合）**，这是一种具有确定出现顺序（encounter order）的集合（无论我们遍历这样的集合多少次，元素的出现顺序始终是固定的）。序列化集合提供了处理集合的第一个和最后一个元素以及反向视图（与原始集合相反的顺序）的简单方法。

Sequenced Collections 包括以下三个接口：

- [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html)
- [`SequencedSet`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedSet.html)
- [`SequencedMap`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedMap.html)

`SequencedCollection` 接口继承了 `Collection`接口， 提供了在集合两端访问、添加或删除元素以及获取集合的反向视图的方法。

```java
interface SequencedCollection<E> extends Collection<E> {

  // New Method

  SequencedCollection<E> reversed();

  // Promoted methods from Deque<E>

  void addFirst(E);
  void addLast(E);

  E getFirst();
  E getLast();

  E removeFirst();
  E removeLast();
}
```

`List` 和 `Deque` 接口实现了`SequencedCollection` 接口。

这里以 `ArrayList` 为例，演示一下实际使用效果：

```java
ArrayList<Integer> arrayList = new ArrayList<>();

arrayList.add(1);   // List contains: [1]

arrayList.addFirst(0);  // List contains: [0, 1]
arrayList.addLast(2);   // List contains: [0, 1, 2]

Integer firstElement = arrayList.getFirst();  // 0
Integer lastElement = arrayList.getLast();  // 2

List<Integer> reversed = arrayList.reversed();
System.out.println(reversed); // Prints [2, 1, 0]
```

`SequencedSet`接口直接继承了 `SequencedCollection` 接口并重写了 `reversed()` 方法。

```java
interface SequencedSet<E> extends SequencedCollection<E>, Set<E> {

    SequencedSet<E> reversed();
}
```

`SortedSet` 和 `LinkedHashSet` 实现了`SequencedSet`接口。

这里以 `LinkedHashSet` 为例，演示一下实际使用效果：

```java
LinkedHashSet<Integer> linkedHashSet = new LinkedHashSet<>(List.of(1, 2, 3));

Integer firstElement = linkedHashSet.getFirst();   // 1
Integer lastElement = linkedHashSet.getLast();    // 3

linkedHashSet.addFirst(0);  //List contains: [0, 1, 2, 3]
linkedHashSet.addLast(4);   //List contains: [0, 1, 2, 3, 4]

System.out.println(linkedHashSet.reversed());   //Prints [4, 3, 2, 1, 0]
```

`SequencedMap` 接口继承了 `Map`接口， 提供了在集合两端访问、添加或删除键值对、获取包含 key 的 `SequencedSet`、包含 value 的 `SequencedCollection`、包含 entry（键值对） 的 `SequencedSet`以及获取集合的反向视图的方法。

```java
interface SequencedMap<K,V> extends Map<K,V> {

  // New Methods

  SequencedMap<K,V> reversed();

  SequencedSet<K> sequencedKeySet();
  SequencedCollection<V> sequencedValues();
  SequencedSet<Entry<K,V>> sequencedEntrySet();

  V putFirst(K, V);
  V putLast(K, V);


  // Promoted Methods from NavigableMap<K, V>

  Entry<K, V> firstEntry();
  Entry<K, V> lastEntry();

  Entry<K, V> pollFirstEntry();
  Entry<K, V> pollLastEntry();
}
```

`SortedMap` 和`LinkedHashMap` 实现了`SequencedMap` 接口。

这里以 `LinkedHashMap` 为例，演示一下实际使用效果：

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>();

map.put(1, "One");
map.put(2, "Two");
map.put(3, "Three");

map.firstEntry();   //1=One
map.lastEntry();    //3=Three

System.out.println(map);  //{1=One, 2=Two, 3=Three}

Map.Entry<Integer, String> first = map.pollFirstEntry();   //1=One
Map.Entry<Integer, String> last = map.pollLastEntry();    //3=Three

System.out.println(map);  //{2=Two}

map.putFirst(1, "One");     //{1=One, 2=Two}
map.putLast(3, "Three");    //{1=One, 2=Two, 3=Three}

System.out.println(map);  //{1=One, 2=Two, 3=Three}
System.out.println(map.reversed());   //{3=Three, 2=Two, 1=One}
```

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

## JEP 441：switch 的模式匹配

增强 Java 中的 switch 表达式和语句，允许在 case 标签中使用模式。当模式匹配时，执行 case 标签对应的代码。

在下面的代码中，switch 表达式使用了类型模式来进行匹配。

```java
static String formatterPatternSwitch(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> obj.toString();
    };
}
```

## JEP 442：外部函数和内存 API（第三次预览）

Java 程序可以通过该 API 与 Java 运行时之外的代码和数据进行互操作。通过高效地调用外部函数（即 JVM 之外的代码）和安全地访问外部内存（即不受 JVM 管理的内存），该 API 使 Java 程序能够调用本机库并处理本机数据，而不会像 JNI 那样危险和脆弱。

外部函数和内存 API 在 Java 17 中进行了第一轮孵化，由 [JEP 412](https://openjdk.java.net/jeps/412) 提出。Java 18 中进行了第二次孵化，由[JEP 419](https://openjdk.org/jeps/419) 提出。Java 19 中是第一次预览，由 [JEP 424](https://openjdk.org/jeps/424) 提出。JDK 20 中是第二次预览，由 [JEP 434](https://openjdk.org/jeps/434) 提出。JDK 21 中是第三次预览，由 [JEP 442](https://openjdk.org/jeps/442) 提出。

在 [Java 19 新特性概览](./java19.md) 中，我有详细介绍到外部函数和内存 API，这里就不再做额外的介绍了。

## JEP 443：未命名模式和变量（预览）

未命名模式和变量使得我们可以使用下划线 `_` 表示未命名的变量以及模式匹配时不使用的组件，旨在提高代码的可读性和可维护性。

未命名变量的典型场景是 `try-with-resources` 语句、 `catch` 子句中的异常变量和`for`循环。当变量不需要使用的时候就可以使用下划线 `_`代替，这样清晰标识未被使用的变量。

```java
try (var _ = ScopedContext.acquire()) {
  // No use of acquired resource
}
try { ... }
catch (Exception _) { ... }
catch (Throwable _) { ... }

for (int i = 0, _ = runOnce(); i < arr.length; i++) {
  ...
}
```

未命名模式是一个无条件的模式，并不绑定任何值。未命名模式变量出现在类型模式中。

```java
if (r instanceof ColoredPoint(_, Color c)) { ... c ... }

switch (b) {
    case Box(RedBall _), Box(BlueBall _) -> processBox(b);
    case Box(GreenBall _)                -> stopProcessing();
    case Box(_)                          -> pickAnotherBox();
}
```

## JEP 444：虚拟线程

虚拟线程是一项重量级的更新，一定一定要重视！

虚拟线程在 Java 19 中进行了第一次预览，由[JEP 425](https://openjdk.org/jeps/425)提出。JDK 20 中是第二次预览。最终，虚拟线程在 JDK21 顺利转正。

[Java 20 新特性概览](./java20.md)已经详细介绍过虚拟线程，这里就不重复了。

## JEP 445：未命名类和实例 main 方法 （预览）

这个特性主要简化了 `main` 方法的声明。对于 Java 初学者来说，这个 `main` 方法的声明引入了太多的 Java 语法概念，不利于初学者快速上手。

没有使用该特性之前定义一个 `main` 方法：

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

使用该新特性之后定义一个 `main` 方法：

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

进一步精简(未命名的类允许我们不定义类名)：

```java
void main() {
   System.out.println("Hello, World!");
}
```

## 参考

- Java 21 String Templates：<https://howtodoinjava.com/java/java-string-templates/>
- Java 21 Sequenced Collections：<https://howtodoinjava.com/java/sequenced-collections/>
