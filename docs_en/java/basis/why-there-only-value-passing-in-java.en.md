---
title: Detailed explanation of Java value passing
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: value transfer, reference transfer, parameter transfer, object reference, example analysis, method invocation
  - - meta
    - name: description
      content: Explain the Java parameter passing model through examples, and clarify common misunderstandings between value passing and reference passing.
---

Before we begin, let’s first understand the following two concepts:

- Formal parameters & actual parameters
- Pass by value & pass by reference

## Formal parameters & actual parameters

The definition of a method may use **parameters** (methods with parameters). Parameters are divided into:

- **Actual parameters (actual parameters, Arguments)**: Parameters used to be passed to functions/methods, must have a certain value.
- **Formal parameters (Parameters)**: used to define functions/methods, receive actual parameters, and do not need to have definite values.

```java
String hello = "Hello!";
// hello is an actual parameter
sayHello(hello);
// str is a formal parameter
void sayHello(String str) {
    System.out.println(str);
}
```

## Pass by value & pass by reference

There are two ways that programming languages pass actual parameters to methods (or functions):

- **Value passing**: The method receives a copy of the actual parameter value and creates a copy.
- **Pass by reference**: The method receives directly the address of the actual parameter, not the value in the actual parameter. This is the pointer. At this time, the formal parameter is the actual parameter. Any modification to the formal parameter will be reflected in the actual parameter, including reassignment.

Many programming languages ​​(such as C++, Pascal) provide two methods of parameter passing, but in Java there is only value passing.

## Why does Java only pass by value?

**Why is it said that Java only transfers by value? ** Without too much nonsense, I will prove it to you through 3 examples.

### Case 1: Passing basic type parameters

Code:

```java
public static void main(String[] args) {
    int num1 = 10;
    int num2 = 20;
    swap(num1, num2);
    System.out.println("num1 = " + num1);
    System.out.println("num2 = " + num2);
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    System.out.println("a = " + a);
    System.out.println("b = " + b);
}
```

Output:

```plain
a=20
b = 10
num1 = 10
num2 = 20
```

Analysis:

In the `swap()` method, the values of `a` and `b` are exchanged and will not affect `num1` and `num2`. Because the values ​​of `a` and `b` are just copied from `num1` and `num2`. In other words, a and b are equivalent to copies of `num1` and `num2`. No matter how the contents of the copies are modified, they will not affect the original itself.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-01.png)

Through the above example, we already know that a method cannot modify a parameter of a basic data type, but it is different when using an object reference as a parameter. Please see Case 2.

### Case 2: Passing reference type parameters 1

Code:

```java
  public static void main(String[] args) {
      int[] arr = { 1, 2, 3, 4, 5 };
      System.out.println(arr[0]);
      change(arr);
      System.out.println(arr[0]);
  }

  public static void change(int[] array) {
      // Change the first element of the array to 0
      array[0] = 0;
  }
```

Output:

```plain
1
0
```

Analysis:

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-02.png)

After reading this case, many people must think that Java uses reference passing for reference type parameters.

Actually, no, what is passed here is still a value, but this value is just the address of the actual parameter!

In other words, the parameter of the `change` method copies the address of `arr` (actual parameter), so it and `arr` point to the same array object. This also explains why modifications to the formal parameters within the method will affect the actual parameters.

In order to refute more strongly that Java does not use reference passing for reference type parameters, let’s look at the following case!

### Case 3: Passing reference type parameters 2

```java
public class Person {
    private String name;
   // Omit the constructor, Getter&Setter methods
}

public static void main(String[] args) {
    Person xiaoZhang = new Person("小张");
    Person xiaoli = new Person("小李");
    swap(xiaoZhang, xiaoLi);
    System.out.println("xiaoZhang:" + xiaoZhang.getName());
    System.out.println("xiaoLi:" + xiaoLi.getName());
}

public static void swap(Person person1, Person person2) {
    Person temp = person1;
    person1 = person2;
    person2 = temp;
    System.out.println("person1:" + person1.getName());
    System.out.println("person2:" + person2.getName());
}
```

Output:

```plain
person1:Xiao Li
person2:Xiao Zhang
xiaozhang:xiaozhang
xiaoli:小李
```

Analysis:

What's going on? ? ? The interchange of formal parameters of two reference types does not affect the actual parameters!

The parameters `person1` and `person2` of the `swap` method are just the addresses of the copied actual parameters `xiaoZhang` and `xiaoLi`. Therefore, the exchange of `person1` and `person2` is just the exchange of the two copied addresses, and will not affect the actual parameters `xiaoZhang` and `xiaoLi`.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-03.png)

## What does reference passing look like?

Seeing this, I believe you already know that there is only value transfer in Java, not reference transfer.
But what does pass-by-reference actually look like? Let's take the `C++` code as an example to let you see the true face of pass-by-reference.

```C++
#include <iostream>

void incr(int& num)
{
    std::cout << "incr before: " << num << "\n";
    num++;
    std::cout << "incr after: " << num << "\n";
}

int main()
{
    int age = 10;
    std::cout << "invoke before: " << age << "\n";
    incr(age);
    std::cout << "invoke after: " << age << "\n";
}
```

Output result:

```plain
invoke before: 10
incr before: 10
incr after: 11
invoke after: 11
```

Analysis: It can be seen that modifications to the formal parameters in the `incr` function can affect the values of the actual parameters. Note: The data type of the `incr` formal parameter here is `int&`, so it is passed by reference. If `int` is used, it is still passed by value!

## Why doesn't Java introduce passing by reference?

Passing by reference seems to be very good, and the value of the actual parameter can be modified directly within the method. However, why doesn't Java introduce passing by reference?

**Note: The following are personal opinions and do not come from Java official:**

1. For security reasons, the operations performed on the value inside the method are unknown to the caller (the method is defined as an interface, and the caller does not care about the specific implementation). You can also imagine that if you take a bank card to withdraw money, you will withdraw 100 and deduct 200. Isn’t it terrible?2. James Gosling, the father of Java, saw many shortcomings of C and C++ at the beginning of the design, so he wanted to design a new language Java. When he designed Java, he followed the principle of simplicity and ease of use, and abandoned many "features" that would cause problems if developers didn't pay attention. There were fewer things in the language itself, and there were less things for developers to learn.

## Summary

The way to pass actual parameters to a method (or function) in Java is **pass by value**:

- If the parameter is a basic type, it is very simple. What is passed is a copy of the literal value of the basic type, and a copy will be created.
- If the parameter is a reference type, what is passed is a copy of the address value in the heap of the object referenced by the actual parameter, and a copy will also be created.

## Reference

- Chapter 4, Section 4.5 of "Java Core Technology Volume I" Basic Knowledge, Tenth Edition
- [Is Java passed by value or by reference? - Hollis' answer - Zhihu](https://www.zhihu.com/question/31203609/answer/576030121)
- [Oracle Java Tutorials - Passing Information to a Method or a Constructor](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html)
- [Interview with James Gosling, Father of Java](https://mappingthejourney.com/single-post/2017/06/29/episode-3-interview-with-james-gosling-father-of-java/)

<!-- @include: @article-footer.snippet.md -->