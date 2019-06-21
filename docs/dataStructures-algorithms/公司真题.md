# 网易 2018

下面三道编程题来自网易2018校招编程题，这三道应该来说是非常简单的编程题了，这些题目大家稍微有点编程和数学基础的话应该没什么问题。看答案之前一定要自己先想一下如果是自己做的话会怎么去做，然后再对照这我的答案看看，和你自己想的有什么区别？那一种方法更好？

## 问题

### 一 获得特定数量硬币问题

小易准备去魔法王国采购魔法神器,购买魔法神器需要使用魔法币,但是小易现在一枚魔法币都没有,但是小易有两台魔法机器可以通过投入x(x可以为0)个魔法币产生更多的魔法币。

魔法机器1:如果投入x个魔法币,魔法机器会将其变为2x+1个魔法币

魔法机器2:如果投入x个魔法币,魔法机器会将其变为2x+2个魔法币

小易采购魔法神器总共需要n个魔法币,所以小易只能通过两台魔法机器产生恰好n个魔法币,小易需要你帮他设计一个投入方案使他最后恰好拥有n个魔法币。 

**输入描述:** 输入包括一行,包括一个正整数n(1 ≤ n ≤ 10^9),表示小易需要的魔法币数量。

**输出描述:** 输出一个字符串,每个字符表示该次小易选取投入的魔法机器。其中只包含字符'1'和'2'。

**输入例子1:** 10

**输出例子1:** 122

### 二 求“相反数”问题

为了得到一个数的"相反数",我们将这个数的数字顺序颠倒,然后再加上原先的数得到"相反数"。例如,为了得到1325的"相反数",首先我们将该数的数字顺序颠倒,我们得到5231,之后再加上原先的数,我们得到5231+1325=6556.如果颠倒之后的数字有前缀零,前缀零将会被忽略。例如n = 100, 颠倒之后是1. 

**输入描述:** 输入包括一个整数n,(1 ≤ n ≤ 10^5)

**输出描述:** 输出一个整数,表示n的相反数

**输入例子1:** 1325

**输出例子1:** 6556

### 三 字符串碎片的平均长度

一个由小写字母组成的字符串可以看成一些同一字母的最大碎片组成的。例如,"aaabbaaac"是由下面碎片组成的:'aaa','bb','c'。牛牛现在给定一个字符串,请你帮助计算这个字符串的所有碎片的平均长度是多少。

**输入描述:** 输入包括一个字符串s,字符串s的长度length(1 ≤ length ≤ 50),s只含小写字母('a'-'z')

**输出描述:** 输出一个整数,表示所有碎片的平均长度,四舍五入保留两位小数。

**如样例所示:** s = "aaabbaaac"
所有碎片的平均长度 = (3 + 2 + 3 + 1) / 4 = 2.25

**输入例子1:** aaabbaaac

**输出例子1:** 2.25

## 答案

### 一 获得特定数量硬币问题

#### 分析：

作为该试卷的第一题，这道题应该只要思路正确就很简单了。

解题关键：明确魔法机器1只能产生奇数，魔法机器2只能产生偶数即可。我们从后往前一步一步推回去即可。

#### 示例代码

注意：由于用户的输入不确定性，一般是为了程序高可用性使需要将捕获用户输入异常然后友好提示用户输入类型错误并重新输入的。所以下面我给了两个版本，这两个版本都是正确的。这里只是给大家演示如何捕获输入类型异常，后面的题目中我给的代码没有异常处理的部分，参照下面两个示例代码，应该很容易添加。（PS：企业面试中没有明确就不用添加异常处理，当然你有的话也更好）

**不带输入异常处理判断的版本：**

```java
import java.util.Scanner;

public class Main2 {
	// 解题关键：明确魔法机器1只能产生奇数，魔法机器2只能产生偶数即可。我们从后往前一步一步推回去即可。

	public static void main(String[] args) {
		System.out.println("请输入要获得的硬币数量：");
		Scanner scanner = new Scanner(System.in);
		int coincount = scanner.nextInt();
		StringBuilder sb = new StringBuilder();
		while (coincount >= 1) {
			// 偶数的情况
			if (coincount % 2 == 0) {
				coincount = (coincount - 2) / 2;
				sb.append("2");
				// 奇数的情况
			} else {
				coincount = (coincount - 1) / 2;
				sb.append("1");
			}
		}
		// 输出反转后的字符串
		System.out.println(sb.reverse());

	}
}
```

**带输入异常处理判断的版本（当输入的不是整数的时候会提示重新输入）：**

```java
import java.util.InputMismatchException;
import java.util.Scanner;


public class Main {
	// 解题关键：明确魔法机器1只能产生奇数，魔法机器2只能产生偶数即可。我们从后往前一步一步推回去即可。

	public static void main(String[] args) {
		System.out.println("请输入要获得的硬币数量：");
		Scanner scanner = new Scanner(System.in);
		boolean flag = true;
		while (flag) {
			try {
				int coincount = scanner.nextInt();
				StringBuilder sb = new StringBuilder();
				while (coincount >= 1) {
					// 偶数的情况
					if (coincount % 2 == 0) {
						coincount = (coincount - 2) / 2;
						sb.append("2");
						// 奇数的情况
					} else {
						coincount = (coincount - 1) / 2;
						sb.append("1");
					}
				}
				// 输出反转后的字符串
				System.out.println(sb.reverse());
				flag=false;//程序结束
			} catch (InputMismatchException e) {
				System.out.println("输入数据类型不匹配，请您重新输入:");
				scanner.nextLine();
				continue;
			}
		}

	}
}

```

### 二 求“相反数”问题

#### 分析：

解决本道题有几种不同的方法，但是最快速的方法就是利用reverse()方法反转字符串然后再将字符串转换成int类型的整数，这个方法是快速解决本题关键。我们先来回顾一下下面两个知识点：

**1)String转int；**

在 Java 中要将 String 类型转化为 int 类型时,需要使用 Integer 类中的 parseInt() 方法或者 valueOf() 方法进行转换.

```java
 String str = "123";
 int a = Integer.parseInt(str);
```

 或

```java
 String str = "123";
 int a = Integer.valueOf(str).intValue()；
```

**2)next()和nextLine()的区别**

在Java中输入字符串有两种方法，就是next()和nextLine().两者的区别就是：nextLine()的输入是碰到回车就终止输入，而next()方法是碰到空格，回车，Tab键都会被视为终止符。所以next()不会得到带空格的字符串，而nextLine()可以得到带空格的字符串。

#### 示例代码：

```java
import java.util.Scanner;

/**
 * 本题关键：①String转int；②next()和nextLine()的区别
 */
public class Main {

	public static void main(String[] args) {

		System.out.println("请输入一个整数：");
		Scanner scanner = new Scanner(System.in);
		String s=scanner.next(); 
		//将字符串转换成数字
		int number1=Integer.parseInt(s);
		//将字符串倒序后转换成数字
		//因为Integer.parseInt()的参数类型必须是字符串所以必须加上toString()
		int number2=Integer.parseInt(new StringBuilder(s).reverse().toString());
		System.out.println(number1+number2);

	}
}
```

### 三 字符串碎片的平均长度

#### 分析：

这道题的意思也就是要求：(字符串的总长度)/(相同字母团构成的字符串的个数)。

这样就很简单了，就变成了字符串的字符之间的比较。如果需要比较字符串的字符的话，我们可以利用charAt(i)方法：取出特定位置的字符与后一个字符比较，或者利用toCharArray()方法将字符串转换成字符数组采用同样的方法做比较。

#### 示例代码

**利用charAt(i)方法：**

```java
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {

	    Scanner sc = new Scanner(System.in);
	    while (sc.hasNext()) {
	        String s = sc.next();
	        //个数至少为一个
	        float count = 1;
	        for (int i = 0; i < s.length() - 1; i++) {
	            if (s.charAt(i) != s.charAt(i + 1)) {
	                count++;
	            }
	        }
	        System.out.println(s.length() / count);
	    }
	}

}
```

**利用toCharArray()方法：**

```java
import java.util.Scanner;

public class Main2 {

	public static void main(String[] args) {

	    Scanner sc = new Scanner(System.in);
	    while (sc.hasNext()) {
	        String s = sc.next();
	        //个数至少为一个
	        float count = 1;
	        char [] stringArr = s.toCharArray();
	        for (int i = 0; i < stringArr.length - 1; i++) {
	            if (stringArr[i] != stringArr[i + 1]) {
	                count++;
	            }
	        }
	        System.out.println(s.length() / count);
	    }
	}

}
```