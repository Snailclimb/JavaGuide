---
title: BigDecimal detailed explanation
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: BigDecimal, floating point precision, decimal arithmetic, compareTo, rounding rules, RoundingMode, divide, Alibaba specifications
  - - meta
    - name: description
      content: Explain the usage scenarios and core API of BigDecimal, solve floating-point precision issues, and summarize common rounding rules and best practices.
---

"Alibaba Java Development Manual" mentions: "In order to avoid loss of precision, you can use `BigDecimal` to perform floating-point operations."

Is there a risk of precision loss in floating-point number operations? Indeed it will!

Sample code:

```java
float a = 2.0f - 1.9f;
float b = 1.8f - 1.7f;
System.out.println(a);// 0.100000024
System.out.println(b);// 0.099999905
System.out.println(a == b); // false
```

**Why is there a risk of precision loss when operating floating point numbers `float` or `double`? **

This has a lot to do with the computer's mechanism for saving decimals. We know that the computer is binary, and when the computer represents a number, the width is limited. When the infinite loop of decimals is stored in the computer, it can only be truncated, which will lead to the loss of decimal precision. This also explains why decimal decimals cannot be accurately represented in binary.

For example, 0.2 in decimal system cannot be accurately converted into binary decimal:

```java
// The process of converting 0.2 to a binary number is to multiply by 2 until there are no decimals.
// In this calculation process, the integer part obtained is arranged from top to bottom and is the binary result.
0.2 * 2 = 0.4 -> 0
0.4 * 2 = 0.8 -> 0
0.8 * 2 = 1.6 -> 1
0.6 * 2 = 1.2 -> 1
0.2 * 2 = 0.4 -> 0 (loop occurs)
...
```

For more information about floating point numbers, it is recommended to read the article [Computer System Basics (4) Floating Point Numbers](http://kaito-kidd.com/2018/08/08/computer-system-float-point/).

## BigDecimal Introduction

`BigDecimal` can perform operations on decimals without losing precision.

Usually, most business scenarios that require precise decimal operation results (such as scenarios involving money) are done through `BigDecimal`.

"Alibaba Java Development Manual" mentions: ** To judge the equivalence between floating point numbers, basic data types cannot be compared with ==, and packaged data types cannot be judged with equals. **

![](https://oss.javaguide.cn/javaguide/image-20211213101646884.png)

We have introduced the specific reasons in detail above, so we will not mention them here.

To solve the problem of loss of accuracy in floating-point operations, you can directly use `BigDecimal` to define the value of a decimal, and then perform decimal operations.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
BigDecimal c = new BigDecimal("0.8");

BigDecimal x = a.subtract(b);
BigDecimal y = b.subtract(c);

System.out.println(x.compareTo(y));// 0
```

## BigDecimal common methods

### Create

When we use `BigDecimal`, in order to prevent loss of precision, it is recommended to use its `BigDecimal(String val)` constructor or `BigDecimal.valueOf(double val)` static method to create objects.

"Alibaba Java Development Manual" also mentions this part of the content, as shown in the figure below.

![](https://oss.javaguide.cn/javaguide/image-20211213102222601.png)

### Addition, subtraction, multiplication and division

The `add` method is used to add two `BigDecimal` objects, and the `subtract` method is used to subtract two `BigDecimal` objects. The `multiply` method is used to multiply two `BigDecimal` objects, and the `divide` method is used to divide two `BigDecimal` objects.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.add(b));// 1.9
System.out.println(a.subtract(b));// 0.1
System.out.println(a.multiply(b));// 0.90
System.out.println(a.divide(b));//Cannot be divided, throws ArithmeticException
System.out.println(a.divide(b, 2, RoundingMode.HALF_UP));// 1.11
```

What needs to be noted here is that when we use the `divide` method, try to use the 3 parameter version, and do not select `UNNECESSARY` for `RoundingMode`, otherwise you are likely to encounter `ArithmeticException` (when an infinite loop of decimals cannot be divided), where `scale` represents how many decimals to retain, and `roundingMode` represents the retention rule.

```java
public BigDecimal divide(BigDecimal divisor, int scale, RoundingMode roundingMode) {
    return divide(divisor, scale, roundingMode.oldMode);
}
```

There are many retention rules, here are a few:

```java
public enum RoundingMode {
   // 2.4 -> 3, 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -3
   UP(BigDecimal.ROUND_UP),
   // 2.4 -> 2, 1.6 -> 1
   // -1.6 -> -1 , -2.4 -> -2
   DOWN(BigDecimal.ROUND_DOWN),
   // 2.4 -> 3, 1.6 -> 2
   // -1.6 -> -1 , -2.4 -> -2
   CEILING(BigDecimal.ROUND_CEILING),
   // 2.5 -> 2, 1.6 -> 1
   // -1.6 -> -2 , -2.5 -> -3
   FLOOR(BigDecimal.ROUND_FLOOR),
   // 2.4 -> 2, 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -2
   HALF_UP(BigDecimal.ROUND_HALF_UP),
   //......
}
```

### Size comparison

`a.compareTo(b)` : Returns -1 if `a` is less than `b`, 0 if `a` is equal to `b`, and 1 if `a` is greater than `b`.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.compareTo(b));// 1
```

### How many decimal places should be kept?

Set the number of decimal places and retention rules through the `setScale` method. There are many kinds of retention rules. You don’t need to remember them. IDEA will prompt you.

```java
BigDecimal m = new BigDecimal("1.255433");
BigDecimal n = m.setScale(3,RoundingMode.HALF_DOWN);
System.out.println(n);// 1.255
```

## BigDecimal equivalence comparison problem

"Alibaba Java Development Manual" mentioned:

![](https://oss.javaguide.cn/github/javaguide/java/basis/image-20220714161315993.png)

`BigDecimal` code example that causes problems when using the `equals()` method for equality comparison:

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.equals(b));//false
```

This is because the `equals()` method not only compares the value (value) but also the precision (scale), while the `compareTo()` method ignores the precision when comparing.The scale of 1.0 is 1 and the scale of 1 is 0, so the result of `a.equals(b)` is false.

![](https://oss.javaguide.cn/github/javaguide/java/basis/image-20220714164706390.png)

The `compareTo()` method can compare the values ​​of two `BigDecimal`, and returns 0 if they are equal. If the first number is greater than the second number, it returns 1, otherwise it returns -1.

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.compareTo(b));//0
```

## BigDecimal tool class sharing

There is a `BigDecimal` tool class with a large number of users on the Internet, which provides multiple static methods to simplify the operation of `BigDecimal`.

I made a simple improvement to it and share the source code:

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Gadget class to simplify BigDecimal calculations
 */
public class BigDecimalUtil {

    /**
     *Default division operation precision
     */
    private static final int DEF_DIV_SCALE = 10;

    private BigDecimalUtil() {
    }

    /**
     * Provides precise addition operations.
     *
     * @param v1 summand
     * @param v2 addend
     * @return the sum of the two parameters
     */
    public static double add(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.add(b2).doubleValue();
    }

    /**
     * Provides precise subtraction operations.
     *
     * @param v1 minuend
     * @param v2 subtraction
     * @return the difference between the two parameters
     */
    public static double subtract(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.subtract(b2).doubleValue();
    }

    /**
     * Provides precise multiplication operations.
     *
     * @param v1 multiplicand
     * @param v2 multiplier
     * @return the product of two parameters
     */
    public static double multiply(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.multiply(b2).doubleValue();
    }

    /**
     * Provides (relatively) accurate division operations. When the division cannot be completed, the division operation is accurate to
     * There are 10 decimal places after the decimal point, and subsequent digits are rounded up to even numbers.
     *
     * @param v1 dividend
     * @param v2 divisor
     * @return the quotient of the two parameters
     */
    public static double divide(double v1, double v2) {
        return divide(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * Provides (relatively) accurate division operations. When inexhaustible division occurs, the scale parameter indicates
     * To determine the accuracy, subsequent numbers will be rounded to doubles.
     *
     * @param v1 dividend
     * @param v2 divisor
     * @param scale means that it needs to be accurate to several decimal places.
     * @return the quotient of the two parameters
     */
    public static double divide(double v1, double v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.divide(b2, scale, RoundingMode.HALF_EVEN).doubleValue();
    }

    /**
     * Provides accurate decimal place rounding processing.
     *
     * @param v Numbers that need to be rounded into pairs
     * @param scale How many decimal places to keep after the decimal point?
     * @return The result after rounding
     */
    public static double round(double v, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b = BigDecimal.valueOf(v);
        BigDecimal one = new BigDecimal("1");
        return b.divide(one, scale, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Provide precise type conversion (Float)
     *
     * @param v The number to be converted
     * @return returns the conversion result
     */
    public static float convertToFloat(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.floatValue();
    }

    /**
     * Provide accurate type conversion (Int) without rounding to double
     *
     * @param v The number to be converted
     * @return returns the conversion result
     */
    public static int convertsToInt(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.intValue();
    }

    /**
     * Provide precise type conversion (Long)
     *
     * @param v The number to be converted
     * @return returns the conversion result
     */
    public static long convertsToLong(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.longValue();
    }

    /**
     * Returns the larger of the two numbers
     *
     * @param v1 The first number to be compared
     * @param v2 The second number to be compared
     * @return Returns the larger of the two numbers
     */
    public static double returnMax(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.max(b2).doubleValue();
    }

    /**
     * Returns the smaller of the two numbers
     *
     * @param v1 The first number to be compared
     * @param v2 The second number to be compared
     * @return returns the smaller of the two numbers
     */
    public static double returnMin(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.min(b2).doubleValue();
    }

    /**
     * Accurately compare two numbers
     *
     * @param v1 The first number to be compared
     * @param v2 The second number to be compared
     * @return If the two numbers are the same, return 0, if the first number is greater than the second number, return 1, otherwise return -1
     */
    public static int compareTo(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.compareTo(b2);
    }

}```

Related issue: [It is recommended to set the retention rule to RoundingMode.HALF_EVEN, that is, rounding to double, #2129](https://github.com/Snailclimb/JavaGuide/issues/2129).

![RoundingMode.HALF_EVEN](https://oss.javaguide.cn/github/javaguide/java/basis/RoundingMode.HALF_EVEN.png)

## Summary

There is no way to accurately represent floating point numbers in binary, so there is a risk of loss of precision.

However, Java provides `BigDecimal` to operate on floating point numbers. The implementation of `BigDecimal` makes use of `BigInteger` (used to operate large integers). The difference is that `BigDecimal` adds the concept of decimal places.

<!-- @include: @article-footer.snippet.md -->