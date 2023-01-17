---
title: Java 15 新特性概览
category: Java
tag:
  - Java新特性
---

## CharSequence

`CharSequence` 接口添加了一个默认方法 `isEmpty()` 来判断字符序列为空，如果是则返回 true。

```java
public interface CharSequence {
  default boolean isEmpty() {
      return this.length() == 0;
  }
}
```

## TreeMap

`TreeMap` 新引入了下面这些方法：

- `putIfAbsent()`
- `computeIfAbsent()`
- `computeIfPresent()`
- `compute()`
- `merge()`

## ZGC(转正)

Java11 的时候 ，ZGC 还在试验阶段。

当时，ZGC 的出现让众多 Java 开发者看到了垃圾回收器的另外一种可能，因此备受关注。

经过多个版本的迭代，不断的完善和修复问题，ZGC 在 Java 15 已经可以正式使用了！

不过，默认的垃圾回收器依然是 G1。你可以通过下面的参数启动 ZGC：

```bash
$ java -XX:+UseZGC className
```

## EdDSA(数字签名算法)

新加入了一个安全性和性能都更强的基于 Edwards-Curve Digital Signature Algorithm （EdDSA）实现的数字签名算法。

虽然其性能优于现有的 ECDSA 实现，不过，它并不会完全取代 JDK 中现有的椭圆曲线数字签名算法( ECDSA)。

```java
KeyPairGenerator kpg = KeyPairGenerator.getInstance("Ed25519");
KeyPair kp = kpg.generateKeyPair();

byte[] msg = "test_string".getBytes(StandardCharsets.UTF_8);

Signature sig = Signature.getInstance("Ed25519");
sig.initSign(kp.getPrivate());
sig.update(msg);
byte[] s = sig.sign();

String encodedString = Base64.getEncoder().encodeToString(s);
System.out.println(encodedString);
```

输出：

```
0Hc0lxxASZNvS52WsvnncJOH/mlFhnA8Tc6D/k5DtAX5BSsNVjtPF4R4+yMWXVjrvB2mxVXmChIbki6goFBgAg==
```

## 文本块(转正)

在 Java 15 ，文本块是正式的功能特性了。

## 隐藏类(Hidden Classes)

隐藏类是为框架（frameworks）所设计的，隐藏类不能直接被其他类的字节码使用，只能在运行时生成类并通过反射间接使用它们。

## 预览新特性

### 密封类

**密封类（Sealed Classes）** 是 Java 15 中的一个预览新特性。

没有密封类之前，在 Java 中如果想让一个类不能被继承和修改，我们可以使用`final` 关键字对类进行修饰。不过，这种方式不太灵活，直接把一个类的继承和修改渠道给堵死了。

密封类可以对继承或者实现它们的类进行限制，这样这个类就只能被指定的类继承。

```java
// 抽象类 Person 只允许 Employee 和 Manager 继承。
public abstract sealed class Person
    permits Employee, Manager {

    //...
}
```

另外，任何扩展密封类的类本身都必须声明为 `sealed`、`non-sealed` 或 `final`。

```java
public final class Employee extends Person {
}

public non-sealed class Manager extends Person {
}
```

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/javaguide/image-20210820153955587.png)

如果允许扩展的子类和封闭类在同一个源代码文件里，封闭类可以不使用 permits 语句，Java 编译器将检索源文件，在编译期为封闭类添加上许可的子类。

### instanceof 模式匹配

Java 15 并没有对此特性进行调整，继续预览特性，主要用于接受更多的使用反馈。

在未来的 Java 版本中，Java 的目标是继续完善 `instanceof` 模式匹配新特性。

## Java15 其他新特性

- **Nashorn JavaScript 引擎彻底移除** ：Nashorn 从 Java8 开始引入的 JavaScript 引擎，Java9 对 Nashorn 做了些增强，实现了一些 ES6 的新特性。在 Java 11 中就已经被弃用，到了 Java 15 就彻底被删除了。
- **DatagramSocket API 重构**
- **禁用和废弃偏向锁（Biased Locking）** ： 偏向锁的引入增加了 JVM 的复杂性大于其带来的性能提升。不过，你仍然可以使用 `-XX:+UseBiasedLocking` 启用偏向锁定，但它会提示 这是一个已弃用的 API。
- ......

## 总结

### 关于预览特性

先贴一段 oracle 官网原文：`This is a preview feature, which is a feature whose design, specification, and implementation are complete, but is not permanent, which means that the feature may exist in a different form or not at all in future JDK releases. To compile and run code that contains preview features, you must specify additional command-line options.`

这是一个预览功能，该功能的设计，规格和实现是完整的，但不是永久性的，这意味着该功能可能以其他形式存在或在将来的 JDK 版本中根本不存在。 要编译和运行包含预览功能的代码，必须指定其他命令行选项。

就以`switch`的增强为例子，从 Java12 中推出，到 Java13 中将继续增强，直到 Java14 才正式转正进入 JDK 可以放心使用，不用考虑后续 JDK 版本对其的改动或修改

一方面可以看出 JDK 作为标准平台在增加新特性的严谨态度，另一方面个人认为是对于预览特性应该采取审慎使用的态度。特性的设计和实现容易，但是其实际价值依然需要在使用中去验证

### JVM 虚拟机优化

每次 Java 版本的发布都伴随着对 JVM 虚拟机的优化，包括对现有垃圾回收算法的改进，引入新的垃圾回收算法，移除老旧的不再适用于今天的垃圾回收算法等

整体优化的方向是**高效，低时延的垃圾回收表现**

对于日常的应用开发者可能比较关注新的语法特性，但是从一个公司角度来说，在考虑是否升级 Java 平台时更加考虑的是**JVM 运行时的提升**