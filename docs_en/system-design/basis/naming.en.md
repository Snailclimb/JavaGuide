---
title: 代码命名指南
category: 代码质量
---

我还记得我刚工作那一段时间， 项目 Code Review 的时候，我经常因为变量命名不规范而被 “diss”!

究其原因还是自己那会经验不足，而且，大学那会写项目的时候不太注意这些问题，想着只要把功能实现出来就行了。

但是，工作中就不一样，为了代码的可读性、可维护性，项目组对于代码质量的要求还是很高的！

前段时间，项目组新来的一个实习生也经常在 Code Review 因为变量命名不规范而被 “diss”，这让我想到自己刚到公司写代码那会的日子。

于是，我就简单写了这篇关于变量命名规范的文章，希望能对同样有此困扰的小伙伴提供一些帮助。

确实，编程过程中，有太多太多让我们头疼的事情了，比如命名、维护其他人的代码、写测试、与其他人沟通交流等等。

据说之前在 Quora 网站，由接近 5000 名程序员票选出来的最难的事情就是“命名”。

大名鼎鼎的《重构》的作者老马（Martin Fowler）曾经在[TwoHardThings](https://martinfowler.com/bliki/TwoHardThings.html)这篇文章中提到过 CS 领域有两大最难的事情：一是 **缓存失效** ，一是 **程序命名** 。

![](https://oss.javaguide.cn/java-guide-blog/marting-naming.png)

这个句话实际上也是老马引用别人的，类似的表达还有很多。比如分布式系统领域有两大最难的事情：一是 **保证消息顺序** ，一是 **严格一次传递** 。

![](https://oss.javaguide.cn/java-guide-blog/20210629104844645.png)

今天咱们就单独拎出 “**命名**” 来聊聊！

这篇文章配合我之前发的 [《编码 5 分钟，命名 2 小时？史上最全的 Java 命名规范参考！》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486449&idx=1&sn=c3b502529ff991c7180281bcc22877af&chksm=cea2443af9d5cd2c1c87049ed15ccf6f88275419c7dbe542406166a703b27d0f3ecf2af901f8&token=999884676&lang=zh_CN#rd) 这篇文章阅读效果更佳哦！

## 为什么需要重视命名？

咱们需要先搞懂为什么要重视编程中的命名这一行为，它对于我们的编码工作有着什么意义。

**为什么命名很重要呢？** 这是因为 **好的命名即是注释，别人一看到你的命名就知道你的变量、方法或者类是做什么的！**

简单来说就是 **别人根据你的命名就能知道你的代码要表达的意思** （不过，前提这个人也要有基本的英语知识，对于一些编程中常见的单词比较熟悉）。

简单举个例子说明一下命名的重要性。

《Clean Code》这本书明确指出：

> **好的代码本身就是注释，我们要尽量规范和美化自己的代码来减少不必要的注释。**
>
> **若编程语言足够有表达力，就不需要注释，尽量通过代码来阐述。**
>
> 举个例子：
>
> 去掉下面复杂的注释，只需要创建一个与注释所言同一事物的函数即可
>
> ```java
> // check to see if the employee is eligible for full benefits
> if ((employee.flags & HOURLY_FLAG) && (employee.age > 65))
> ```
>
> 应替换为
>
> ```java
> if (employee.isEligibleForFullBenefits())
> ```

## 常见命名规则以及适用场景

这里只介绍 3 种最常见的命名规范。

### 驼峰命名法（CamelCase）

驼峰命名法应该我们最常见的一个，这种命名方式使用大小写混合的格式来区别各个单词，并且单词之间不使用空格隔开或者连接字符连接的命名方式

#### 大驼峰命名法（UpperCamelCase）

**类名需要使用大驼峰命名法（UpperCamelCase）**

正例：

```java
ServiceDiscovery、ServiceInstance、LruCacheFactory
```

反例：

```java
serviceDiscovery、Serviceinstance、LRUCacheFactory
```

#### 小驼峰命名法（lowerCamelCase）

**方法名、参数名、成员变量、局部变量需要使用小驼峰命名法（lowerCamelCase）。**

正例：

```java
getUserInfo()
createCustomThreadPool()
setNameFormat(String nameFormat)
Uservice userService;
```

反例：

```java
GetUserInfo()、CreateCustomThreadPool()、setNameFormat(String NameFormat)
Uservice user_service
```

### 蛇形命名法（snake_case）

**测试方法名、常量、枚举名称需要使用蛇形命名法（snake_case）**

在蛇形命名法中，各个单词之间通过下划线“\_”连接，比如`should_get_200_status_code_when_request_is_valid`、`CLIENT_CONNECT_SERVER_FAILURE`。

蛇形命名法的优势是命名所需要的单词比较多的时候，比如我把上面的命名通过小驼峰命名法给大家看一下：“shouldGet200StatusCodeWhenRequestIsValid”。

感觉如何？ 相比于使用蛇形命名法（snake_case）来说是不是不那么易读？

正例：

```java
@Test
void should_get_200_status_code_when_request_is_valid() {
  ......
}
```

反例：

```java
@Test
void shouldGet200StatusCodeWhenRequestIsValid() {
  ......
}
```

### 串式命名法（kebab-case）

在串式命名法中，各个单词之间通过连接符“-”连接，比如`dubbo-registry`。

建议项目文件夹名称使用串式命名法（kebab-case），比如 dubbo 项目的各个模块的命名是下面这样的。

![](https://oss.javaguide.cn/java-guide-blog/dubbo-naming.png)

## 常见命名规范

### Java 语言基本命名规范

**1、类名需要使用大驼峰命名法（UpperCamelCase）风格。方法名、参数名、成员变量、局部变量需要使用小驼峰命名法（lowerCamelCase）。**

**2、测试方法名、常量、枚举名称需要使用蛇形命名法（snake_case）**，比如`should_get_200_status_code_when_request_is_valid`、`CLIENT_CONNECT_SERVER_FAILURE`。并且，**测试方法名称要求全部小写，常量以及枚举名称需要全部大写。**

**3、项目文件夹名称使用串式命名法（kebab-case），比如`dubbo-registry`。**

**4、包名统一使用小写，尽量使用单个名词作为包名，各个单词通过 "." 分隔符连接，并且各个单词必须为单数。**

正例：`org.apache.dubbo.common.threadlocal`

反例：~~`org.apache_dubbo.Common.threadLocals`~~

**5、抽象类命名使用 Abstract 开头**。

```java
//为远程传输部分抽象出来的一个抽象类（出处：Dubbo源码）
public abstract class AbstractClient extends AbstractEndpoint implements Client {

}
```

**6、异常类命名使用 Exception 结尾。**

```java
//自定义的 NoSuchMethodException（出处：Dubbo源码）
public class NoSuchMethodException extends RuntimeException {
    private static final long serialVersionUID = -2725364246023268766L;

    public NoSuchMethodException() {
        super();
    }

    public NoSuchMethodException(String msg) {
        super(msg);
    }
}
```

**7、测试类命名以它要测试的类的名称开始，以 Test 结尾。**

```java
//为 AnnotationUtils 类写的测试类（出处：Dubbo源码）
public class AnnotationUtilsTest {
  ......
}
```

Do not add the is prefix to the Boolean type variables in the POJO class, otherwise some framework parsing will cause serialization errors.

If modules, interfaces, classes, and methods use design patterns, the specific patterns must be reflected in the naming.

### Naming readability specifications

**1. In order to make naming more understandable and readable, try not to abbreviate/abbreviate words unless these words have been recognized as such abbreviations/abbreviations. For example, `CustomThreadFactory` cannot be written as ~~`CustomTF`. **

**2. Unlike functions, naming should be as short as possible. Readable names are given priority over short names, although readable names will be longer. ** This corresponds to point 1 above.

**3. Avoid meaningless naming. Every name you choose must be able to express its meaning. **

Positive example: `UserService userService;` `int userCount`;

Counter example: ~~`UserService service`~~ ~~`int count`~~

**4. Avoid names that are too long (within 50 characters is best). Overly long names are difficult to read and ugly. **

**5. Do not use Pinyin, let alone Chinese. ** However, international common nouns like alibaba, wuhan, and taobao can be treated as English.

Positive example: discount

Counter example: ~~dazhe~~

## Codelf: A tool for naming variables?

This is a website developed by Chinese people. Many people on the Internet call it a variable naming artifact. After using it for a few days, I feel that it is not that easy to use. Friends can experience it for themselves and then make their own judgments.

Codelf provides an online website version at the URL: [https://unbug.github.io/codelf/](https://unbug.github.io/codelf/). The specific usage is as follows:

I chose the Java programming language and searched for the keyword "serialization" and it returned a lot of names for serialization.

![](./pictures/Codelf.png)

Moreover, Codelf also provides the VS code plug-in. Judging from this review, it seems that everyone still likes this naming tool.

![](./pictures/vscode-codelf.png)

## Related reading recommendations

1. "Alibaba Java Development Manual"
2. "Clean Code"
3. Google Java Code Guide: <https://google.github.io/styleguide/javaguide.html>
4. Say goodbye to 5 minutes of coding and 2 hours of naming! The most complete Java naming convention reference in history: <https://www.cnblogs.com/liqiangchn/p/12000361.html>

## Summary

As a qualified programmer, everyone should know the importance of code representation. If you want to write high-quality code, good naming is the first step!

Good naming is a great help for others (including yourself) to understand your code! The easier your code is to understand, the more maintainable it is, which means the better your code is designed!

In the daily coding process, we need to keep in mind common naming conventions. For example, class names need to use camel case nomenclature, do not use Pinyin, and do not use Chinese...

In addition, a website called Codelf developed by Chinese people is called a "variable naming artifact" by many people. When you have a headache about naming, you can refer to some of the naming examples provided above.

Finally, I hope that everyone will no longer have to worry about naming!

<!-- @include: @article-footer.snippet.md -->