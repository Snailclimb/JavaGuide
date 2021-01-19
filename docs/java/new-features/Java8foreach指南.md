> 本文由 JavaGuide 翻译，原文地址：https://www.baeldung.com/foreach-java

## 1 概述

在Java 8中引入的*forEach*循环为程序员提供了一种新的，简洁而有趣的迭代集合的方式。

在本文中，我们将看到如何将*forEach*与集合*一起*使用，它采用何种参数以及此循环与增强的*for*循环的不同之处。

## 2 基础知识

```Java
public interface Collection<E> extends Iterable<E>
```

Collection 接口实现了 Iterable 接口，而 Iterable 接口在 Java 8开始具有一个新的 API：

```java
void forEach(Consumer<? super T> action)//对 Iterable的每个元素执行给定的操作，直到所有元素都被处理或动作引发异常。
```

使用*forEach*，我们可以迭代一个集合并对每个元素执行给定的操作，就像任何其他*迭代器一样。*

例如，迭代和打印字符串集合*的*for循环版本：

```java
for (String name : names) {
    System.out.println(name);
}
```

我们可以使用*forEach*写这个 ：

```java
names.forEach(name -> {
    System.out.println(name);
});
```

## 3.使用forEach方法

### 3.1 匿名类

我们使用  *forEach*迭代集合并对每个元素执行特定操作。**要执行的操作包含在实现Consumer接口的类中，并作为参数传递给forEach 。**

所述*消费者*接口是一个功能接口(具有单个抽象方法的接口）。它接受输入并且不返回任何结果。

Consumer 接口定义如下：

```java
@FunctionalInterface
public interface Consumer {
    void accept(T t);
}
```
任何实现，例如，只是打印字符串的消费者：

```java
Consumer<String> printConsumer = new Consumer<String>() {
    public void accept(String name) {
        System.out.println(name);
    };
};
```

可以作为参数传递给*forEach*：

```java
names.forEach(printConsumer);
```

但这不是通过消费者和使用*forEach* API 创建操作的唯一方法。让我们看看我们将使用*forEach*方法的另外2种最流行的方式：

### 3.2 Lambda表达式

Java 8功能接口的主要优点是我们可以使用Lambda表达式来实例化它们，并避免使用庞大的匿名类实现。

由于 Consumer 接口属于函数式接口，我们可以通过以下形式在Lambda中表达它：

```java
(argument) -> { body }
name -> System.out.println(name)
names.forEach(name -> System.out.println(name));
```

### 3.3 方法参考

我们可以使用方法引用语法而不是普通的Lambda语法，其中已存在一个方法来对类执行操作：

```java
names.forEach(System.out::println);
```

## 4.forEach在集合中的使用

### 4.1.迭代集合

**任何类型Collection的可迭代  - 列表，集合，队列 等都具有使用forEach的相同语法。**

因此，正如我们已经看到的，迭代列表的元素：

```java
List<String> names = Arrays.asList("Larry", "Steve", "James");
 
names.forEach(System.out::println);
```

同样对于一组：

```java
Set<String> uniqueNames = new HashSet<>(Arrays.asList("Larry", "Steve", "James"));
 
uniqueNames.forEach(System.out::println);
```

或者让我们说一个*队列*也是一个*集合*：

```java
Queue<String> namesQueue = new ArrayDeque<>(Arrays.asList("Larry", "Steve", "James"));
 
namesQueue.forEach(System.out::println);
```

### 4.2.迭代Map - 使用Map的forEach

Map没有实现Iterable接口，但它**提供了自己的forEach 变体，它接受BiConsumer**。* 

```java
Map<Integer, String> namesMap = new HashMap<>();
namesMap.put(1, "Larry");
namesMap.put(2, "Steve");
namesMap.put(3, "James");
namesMap.forEach((key, value) -> System.out.println(key + " " + value));
```

### 4.3.迭代一个Map - 通过迭代entrySet

```java
namesMap.entrySet().forEach(entry -> System.out.println(entry.getKey() + " " + entry.getValue()));
```