---
title: Shell 编程基础知识总结
category: 计算机基础
tag:
  - 操作系统
  - Linux
head:
  - - meta
    - name: description
      content: Shell 编程在我们的日常开发工作中非常实用，目前 Linux 系统下最流行的运维自动化语言就是 Shell 和 Python 了。这篇文章我会简单总结一下 Shell 编程基础知识，带你入门 Shell 编程！
  - - meta
    - name: keywords
      content: Shell,脚本,命令,自动化,运维,Linux,基础语法
---

Shell 编程在我们的日常开发工作中非常实用，目前 Linux 系统下最流行的运维自动化语言就是 Shell 和 Python 了。

这篇文章我会简单总结一下 Shell 编程基础知识，带你入门 Shell 编程！

## 走进 Shell 编程的大门

### 为什么要学 Shell？

学一个东西，我们大部分情况都是往实用性方向着想。从工作角度来讲，学习 Shell 是为了提高我们自己工作效率，提高产出，让我们在更少的时间完成更多的事情。

很多人会说 Shell 编程属于运维方面的知识了，应该是运维人员来做，我们做后端开发的没必要学。我觉得这种说法大错特错，相比于专门做 Linux 运维的人员来说，我们对 Shell 编程掌握程度的要求要比他们低，但是 Shell 编程也是我们必须要掌握的！

目前 Linux 系统下最流行的运维自动化语言就是 Shell 和 Python 了。

两者之间，Shell 几乎是 IT 企业必须使用的运维自动化编程语言，特别是在运维工作中的服务监控、业务快速部署、服务启动停止、数据备份及处理、日志分析等环节里，shell 是不可缺的。Python 更适合处理复杂的业务逻辑，以及开发复杂的运维软件工具，实现通过 web 访问等。Shell 是一个命令解释器，解释执行用户所输入的命令和程序。一输入命令，就立即回应的交互的对话方式。

另外，了解 shell 编程也是大部分互联网公司招聘后端开发人员的要求。下图是我截取的一些知名互联网公司对于 Shell 编程的要求。

![大型互联网公司对于shell编程技能的要求](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/60190220.jpg)

### 什么是 Shell？

简单来说“Shell 编程就是对一堆 Linux 命令的逻辑化处理”。

W3Cschool 上的一篇文章是这样介绍 Shell 的，如下图所示。
![什么是 Shell？](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/19456505.jpg)

### Shell 编程的 Hello World

学习任何一门编程语言第一件事就是输出 HelloWorld 了！下面我会从新建文件到 shell 代码编写来说下 Shell 编程如何输出 Hello World。

(1)新建一个文件 helloworld.sh :`touch helloworld.sh`，扩展名为 sh（sh 代表 Shell）（扩展名并不影响脚本执行，见名知意就好，如果你用 php 写 shell 脚本，扩展名就用 php 好了）

(2) 使脚本具有执行权限：`chmod +x helloworld.sh`

(3) 使用 vim 命令修改 helloworld.sh 文件：`vim helloworld.sh`(vim 文件------>进入文件----->命令模式------>按 i 进入编辑模式----->编辑文件 ------->按 Esc 进入底行模式----->输入:wq/q! （输入 wq 代表写入内容并退出，即保存；输入 q!代表强制退出不保存。）)

helloworld.sh 内容如下：

```shell
#!/bin/bash
#第一个shell小程序,echo 是linux中的输出命令。
echo  "helloworld!"
```

shell 中 # 符号表示注释。**shell 的第一行比较特殊，一般都会以#!开始来指定使用的 shell 类型。在 linux 中，除了 bash shell 以外，还有很多版本的 shell， 例如 zsh、dash 等等...不过 bash shell 还是我们使用最多的。**

(4) 运行脚本:`./helloworld.sh` 。（注意，一定要写成 `./helloworld.sh` ，而不是 `helloworld.sh` ，运行其它二进制的程序也一样，直接写 `helloworld.sh` ，linux 系统会去 PATH 里寻找有没有叫 helloworld.sh 的，而只有 /bin, /sbin, /usr/bin，/usr/sbin 等在 PATH 里，你的当前目录通常不在 PATH 里，所以写成 `helloworld.sh` 是会找不到命令的，要用`./helloworld.sh` 告诉系统说，就在当前目录找。）

![shell 编程Hello World](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/55296212.jpg)

## Shell 变量

### Shell 编程中的变量介绍

**Shell 编程中一般分为三种变量：**

1. **我们自己定义的变量（自定义变量）:** 仅在当前 Shell 实例中有效，其他 Shell 启动的程序不能访问局部变量。
2. **Linux 已定义的环境变量**（环境变量， 例如：`PATH`, ​`HOME` 等..., 这类变量我们可以直接使用），使用 `env` 命令可以查看所有的环境变量，而 set 命令既可以查看环境变量也可以查看自定义变量。
3. **Shell 变量**：Shell 变量是由 Shell 程序设置的特殊变量。Shell 变量中有一部分是环境变量，有一部分是局部变量，这些变量保证了 Shell 的正常运行

**常用的环境变量:**

> PATH 决定了 shell 将到哪些目录中寻找命令或程序  
> HOME 当前用户主目录  
> HISTSIZE 　历史记录数  
> LOGNAME 当前用户的登录名  
> HOSTNAME 　指主机的名称  
> SHELL 当前用户 Shell 类型  
> LANGUAGE 　语言相关的环境变量，多语言可以修改此环境变量  
> MAIL 　当前用户的邮件存放目录  
> PS1 　基本提示符，对于 root 用户是#，对于普通用户是\$

**使用 Linux 已定义的环境变量：**

比如我们要看当前用户目录可以使用：`echo $HOME`命令；如果我们要看当前用户 Shell 类型 可以使用`echo $SHELL`命令。可以看出，使用方法非常简单。

**使用自己定义的变量：**

```shell
#!/bin/bash
#自定义变量hello
hello="hello world"
echo $hello
echo  "helloworld!"
```

![使用自己定义的变量](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/19835037.jpg)

**Shell 编程中的变量名的命名的注意事项：**

- 命名只能使用英文字母，数字和下划线，首个字符不能以数字开头，但是可以使用下划线（\_）开头。
- 中间不能有空格，可以使用下划线（\_）。
- 不能使用标点符号。
- 不能使用 bash 里的关键字（可用 help 命令查看保留关键字）。

### Shell 字符串入门

字符串是 shell 编程中最常用最有用的数据类型（除了数字和字符串，也没啥其它类型好用了），字符串可以用单引号，也可以用双引号。这点和 Java 中有所不同。

在单引号中所有的特殊符号，如$和反引号都没有特殊含义。在双引号中，除了"$"、"\\"、反引号和感叹号（需开启 `history expansion`），其他的字符没有特殊含义。

**单引号字符串：**

```shell
#!/bin/bash
name='SnailClimb'
hello='Hello, I am $name!'
echo $hello
```

输出内容：

```plain
Hello, I am $name!
```

**双引号字符串：**

```shell
#!/bin/bash
name='SnailClimb'
hello="Hello, I am $name!"
echo $hello
```

输出内容：

```plain
Hello, I am SnailClimb!
```

### Shell 字符串常见操作

**拼接字符串：**

```shell
#!/bin/bash
name="SnailClimb"
# 使用双引号拼接
greeting="hello, "$name" !"
greeting_1="hello, ${name} !"
echo $greeting  $greeting_1
# 使用单引号拼接
greeting_2='hello, '$name' !'
greeting_3='hello, ${name} !'
echo $greeting_2  $greeting_3
```

Output result:

![Output results](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/51148933.jpg)

**Get string length:**

```shell
#!/bin/bash
#Get the string length
name="SnailClimb"
# The first way
echo ${#name} #output 10
# The second way
expr length "$name";
```

Output result:

```plain
10
10
```

When using the expr command, spaces must be included around the operator in the expression. If no spaces are included, the expression itself will be output:

```shell
expr 5+6 // Directly output 5+6
expr 5 + 6 //output 11
```

For some operators, we also need to use the symbol `\` to escape, otherwise a syntax error will be prompted.

```shell
expr 5 * 6 // Output error
expr 5 \* 6 // Output 30
```

**Intercept substring:**

Simple string interception:

```shell
#Truncate 10 characters starting from the first character of the string
str="SnailClimb is a great man"
echo ${str:0:10} #Output:SnailClimb
```

Intercept based on expression:

```shell
#!bin/bash
#author:amau

var="https://www.runoob.com/linux/linux-shell-variable.html"
# % means delete the next match, the shortest result
# %% means delete the matching from the end, the longest matching result
# #Indicates deleting matches from the beginning, the shortest result
# ## indicates deleting the match from the beginning and the longest matching result
# Note: * is a wildcard character, meaning to match any number of any characters
s1=${var%%t*} #h
s2=${var%t*} #https://www.runoob.com/linux/linux-shell-variable.h
s3=${var%%.*} #https://www
s4=${var#*/} #/www.runoob.com/linux/linux-shell-variable.html
s5=${var##*/} #linux-shell-variable.html
```

### Shell array

bash supports one-dimensional arrays (not multi-dimensional arrays) and does not limit the size of the array. I give you a shell code example about array operations below. Through this example, you can know how to create an array, get the length of the array, get/delete the array element at a specific position, delete the entire array, and traverse the array.

```shell
#!/bin/bash
array=(1 2 3 4 5);
# Get the length of the array
length=${#array[@]}
# or
length2=${#array[*]}
#Output array length
echo $length #Output: 5
echo $length2 #Output: 5
# Output the third element of the array
echo ${array[2]} #Output: 3
unset array[1]# Deleting the element with subscript 1 means deleting the second element
for i in ${array[@]};do echo $i ;done # Traverse the array, output: 1 3 4 5
unset array; #Delete all elements in the array
for i in ${array[@]};do echo $i ;done # Traverse the array, the array elements are empty and there is no output content
```

## Shell basic operators

> Description: The picture comes from "Rookie Tutorial"

Shell programming supports the following operators

- Arithmetic operators
- Relational operators
- Boolean operators
- String operators
- File test operator

### Arithmetic operators

![Arithmetic operator](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/4937342.jpg)

I use the addition operator to make a simple example (note: not single quotes, but backticks):

```shell
#!/bin/bash
a=3;b=3;
val=`expr $a + $b`
#Output: Total value: 6
echo "Total value : $val"
```

### Relational operators

Relational operators only support numbers, not strings, unless the value of the string is a number.

![shell relational operator](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/64391380.jpg)

A simple example demonstrates the use of relational operators. The function of the following shell program is to output A when score=100, otherwise output B.

```shell
#!/bin/bash
score=90;
maxscore=100;
if [ $score -eq $maxscore ]
then
   echo "A"
else
   echo "B"
fi
```

Output result:

```plain
B
```

### Logical operators

![Logical operator](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/60545848.jpg)

Example:

```shell
#!/bin/bash
a=$(( 1 && 0))
# Output: 0; for logical AND operations, only if both sides of the AND are 1, the result of the AND is 1; otherwise, the result of the AND is 0
echo $a;
```

### Boolean operators

![Boolean operator](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/93961425.jpg)

I won’t do a demonstration here, it should be pretty simple.

### String operators

![String operator](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/309094.jpg)

Simple example:

```shell
#!/bin/bash
a="abc";
b="efg";
if [ $a = $b ]
then
   echo "a equals b"
else
   echo "a is not equal to b"
fi
```

Output:

```plain
a is not equal to b
```

### File related operators

![File related operators](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/60359774.jpg)

The usage is very simple. For example, we have defined a file path `file="/usr/learnshell/test.sh"`. If we want to determine whether the file is readable, we can do this `if [ -r $file ]`. If we want to determine whether the file is writable, we can do this `-w $file`. Isn’t it very simple?

## Shell process control

### if conditional statement

Simple if else-if else conditional statement example

```shell
#!/bin/bash
a=3;
b=9;
if [ $a -eq $b ]
then
   echo "a equals b"
elif [ $a -gt $b ]
then
   echo "a is greater than b"
else
   echo "a is less than b"
fi
```

Output result:

```plain
a is less than b
```

I believe that through the above examples, you have mastered the if conditional statement in shell programming. However, one thing to mention is that unlike our common if conditional statements in Java and PHP, shell if conditional statements cannot contain empty statements, which are statements that do nothing.

### for loop statement

Learn the most basic use of the for loop statement through the following three simple examples. In fact, the function of the for loop statement is much greater than the examples you see below.

**Output the data in the current list:**

```shell
for loop in 1 2 3 4 5
do
    echo "The value is: $loop"
done
```

**Generate 10 random numbers:**

```shell
#!/bin/bash
for i in {0..9};
do
   echo $RANDOM;
done
```

**Output 1 to 5:**

Normally, you need to add \$ when calling shell variables, but it is not required in (()) of for. Let’s look at an example:

```shell
#!/bin/bash
length=5
for((i=1;i<=length;i++));do
    echo $i;
done;
```

### while statement

**Basic while loop statement:**

```shell
#!/bin/bash
int=1
while(( $int<=5 ))
do
    echo $int
    let "int++"
done
```

**while loop can be used to read keyboard information:**

```shell
echo 'Press <CTRL-D> to exit'
echo -n 'Enter your favorite movie: '
while read FILM
do
    echo "Yes! $FILM is a good movie"
done
```

Output content:

```plain
Press <CTRL-D> to exit
Enter your favorite movie: Transformers
Yes! Transformers is a good movie
```**Infinite Loop:**

```shell
while true
do
    command
done
```

## Shell function

### Function with no parameters and no return value

```shell
#!/bin/bash
hello(){
    echo "This is my first shell function!"
}
echo "-----Function starts execution-----"
hello
echo "-----Function execution completed-----"
```

Output result:

```plain
-----Function starts execution-----
This is my first shell function!
-----Function execution completed-----
```

### Functions with return values

**Add two numbers after inputting them and return the result: **

```shell
#!/bin/bash
funWithReturn(){
    echo "Enter the first number: "
    read aNum
    echo "Enter the second number: "
    read anotherNum
    echo "The two numbers are $aNum and $anotherNum!"
    return $(($aNum+$anotherNum))
}
funWithReturn
echo "The sum of the two numbers entered is $?"
```

Output result:

```plain
Enter the first number:
1
Enter the second number:
2
The two numbers are 1 and 2!
The sum of the two numbers entered is 3
```

### Function with parameters

```shell
#!/bin/bash
funWithParam(){
    echo "The first parameter is $1 !"
    echo "The second parameter is $2 !"
    echo "The tenth parameter is $10!"
    echo "The tenth parameter is ${10} !"
    echo "The eleventh parameter is ${11} !"
    echo "The total number of parameters is $#!"
    echo "Output all parameters as a string $* !"
}
funWithParam 1 2 3 4 5 6 7 8 9 34 73
```

Output result:

```plain
The first parameter is 1 !
The second parameter is 2!
The tenth parameter is 10!
The tenth parameter is 34!
The eleventh parameter is 73!
There are 11 parameters in total!
Output all parameters as a string 1 2 3 4 5 6 7 8 9 34 73 !
```

<!-- @include: @article-footer.snippet.md -->