---
title: 剑指offer部分编程题
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 剑指Offer,斐波那契,递归,迭代,链表,数组,面试题
  - - meta
    - name: description
      content: 选编《剑指 Offer》常见编程题，给出递归与迭代等多种思路与示例，实现对高频题型的高效复盘。
---

## 斐波那契数列

**题目描述：**

大家都知道斐波那契数列，现在要求输入一个整数 n，请你输出斐波那契数列的第 n 项。
n<=39

**问题分析：**

可以肯定的是这一题通过递归的方式是肯定能做出来，但是这样会有一个很大的问题，那就是递归大量的重复计算会导致内存溢出。另外可以使用迭代法，用 fn1 和 fn2 保存计算过程中的结果，并复用起来。下面我会把两个方法示例代码都给出来并给出两个方法的运行时间对比。

**示例代码：**

采用迭代法：

```java
int Fibonacci(int number) {
    if (number <= 0) {
        return 0;
    }
    if (number == 1 || number == 2) {
        return 1;
    }
    int first = 1, second = 1, third = 0;
    for (int i = 3; i <= number; i++) {
        third = first + second;
        first = second;
        second = third;
    }
    return third;
}
```

采用递归：

```java
public int Fibonacci(int n) {
    if (n <= 0) {
        return 0;
    }
    if (n == 1||n==2) {
        return 1;
    }

    return Fibonacci(n - 2) + Fibonacci(n - 1);
}
```

## 跳台阶问题

**题目描述：**

一只青蛙一次可以跳上 1 级台阶，也可以跳上 2 级。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。

**问题分析：**

正常分析法：

> a.如果两种跳法，1 阶或者 2 阶，那么假定第一次跳的是一阶，那么剩下的是 n-1 个台阶，跳法是 f(n-1);
> b.假定第一次跳的是 2 阶，那么剩下的是 n-2 个台阶，跳法是 f(n-2)
> c.由 a，b 假设可以得出总跳法为: f(n) = f(n-1) + f(n-2)
> d.然后通过实际的情况可以得出：只有一阶的时候 f(1) = 1 ,只有两阶的时候可以有 f(2) = 2

找规律分析法：

> f(1) = 1, f(2) = 2, f(3) = 3, f(4) = 5， 可以总结出 f(n) = f(n-1) + f(n-2)的规律。但是为什么会出现这样的规律呢？假设现在 6 个台阶，我们可以从第 5 跳一步到 6，这样的话有多少种方案跳到 5 就有多少种方案跳到 6，另外我们也可以从 4 跳两步跳到 6，跳到 4 有多少种方案的话，就有多少种方案跳到 6，其他的不能从 3 跳到 6 什么的啦，所以最后就是 f(6) = f(5) + f(4)；这样子也很好理解变态跳台阶的问题了。

**所以这道题其实就是斐波那契数列的问题。**

代码只需要在上一题的代码稍做修改即可。和上一题唯一不同的就是这一题的初始元素变为 1 2 3 5 8……而上一题为 1 1 2 3 5 ……。另外这一题也可以用递归做，但是递归效率太低，所以我这里只给出了迭代方式的代码。

**示例代码：**

```java
int jumpFloor(int number) {
    if (number <= 0) {
        return 0;
    }
    if (number == 1) {
        return 1;
    }
    if (number == 2) {
        return 2;
    }
    int first = 1, second = 2, third = 0;
    for (int i = 3; i <= number; i++) {
        third = first + second;
        first = second;
        second = third;
    }
    return third;
}
```

## 变态跳台阶问题

**题目描述：**

一只青蛙一次可以跳上 1 级台阶，也可以跳上 2 级……它也可以跳上 n 级。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。

**问题分析：**

假设 n>=2，第一步有 n 种跳法：跳 1 级、跳 2 级、到跳 n 级
跳 1 级，剩下 n-1 级，则剩下跳法是 f(n-1)
跳 2 级，剩下 n-2 级，则剩下跳法是 f(n-2)
……
跳 n-1 级，剩下 1 级，则剩下跳法是 f(1)
跳 n 级，剩下 0 级，则剩下跳法是 f(0)
所以在 n>=2 的情况下：
f(n)=f(n-1)+f(n-2)+...+f(1)
因为 f(n-1)=f(n-2)+f(n-3)+...+f(1)
所以 f(n)=2\*f(n-1) 又 f(1)=1,所以可得**f(n)=2^(number-1)**

**示例代码：**

```java
int JumpFloorII(int number) {
    return 1 << --number;//2^(number-1)用位移操作进行，更快
}
```

**补充：**

java 中有三种移位运算符：

1. “<<” : **左移运算符**，等同于乘 2 的 n 次方
2. “>>”: **右移运算符**，等同于除 2 的 n 次方
3. “>>>” : **无符号右移运算符**，不管移动前最高位是 0 还是 1，右移后左侧产生的空位部分都以 0 来填充。与>>类似。

```java
int a = 16;
int b = a << 2;//左移2，等同于16 * 2的2次方，也就是16 * 4
int c = a >> 2;//右移2，等同于16 / 2的2次方，也就是16 / 4
```

## 二维数组查找

**题目描述：**

在一个二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

**问题解析：**

这一道题还是比较简单的，我们需要考虑的是如何做，效率最快。这里有一种很好理解的思路：

> 矩阵是有序的，从左下角来看，向上数字递减，向右数字递增，
> 因此从左下角开始查找，当要查找数字比左下角数字大时。右移
> 要查找数字比左下角数字小时，上移。这样找的速度最快。

**示例代码：**

```java
public boolean Find(int target, int [][] array) {
    //基本思路从左下角开始找，这样速度最快
    int row = array.length-1;//行
    int column = 0;//列
    //当行数大于0，当前列数小于总列数时循环条件成立
    while((row >= 0)&& (column< array[0].length)){
        if(array[row][column] > target){
            row--;
        }else if(array[row][column] < target){
            column++;
        }else{
            return true;
        }
    }
    return false;
}
```

## 替换空格

**题目描述：**

请实现一个函数，将一个字符串中的空格替换成“%20”。例如，当字符串为 We Are Happy.则经过替换之后的字符串为 We%20Are%20Happy。

**问题分析：**

这道题不难，我们可以通过循环判断字符串的字符是否为空格，是的话就利用 append()方法添加追加“%20”，否则还是追加原字符。

或者最简单的方法就是利用：replaceAll(String regex,String replacement)方法了，一行代码就可以解决。

**示例代码：**

常规做法：

```java
public String replaceSpace(StringBuffer str) {
    StringBuffer out = new StringBuffer();
    for (int i = 0; i < str.toString().length(); i++) {
        char b = str.charAt(i);
        if(String.valueOf(b).equals(" ")){
            out.append("%20");
        }else{
            out.append(b);
        }
    }
    return out.toString();
}
```

One line of code to solve:

```java
public String replaceSpace(StringBuffer str) {
    //return str.toString().replaceAll(" ", "%20");
    //public String replaceAll(String regex,String replacement)
    //Replace every substring of this string that matches the given regular expression with the given replacement.
    //\ escape character. If you want to use "\" itself, you should use "\\". Spaces in the String type are represented by "\s", so I guess "\\s" here means spaces.
    return str.toString().replaceAll("\\s", "%20");
}
```

## Integer power of the value

**Title description:**

Given a floating-point number base of type double and an integer exponent of type int. Find base raised to the exponent power.

**Problem analysis:**

This question is a bit more troublesome and difficult. What I use here is the idea of ​​**half power**, of course, you can also use **fast power**.
More details in the offer book, the solution to this problem is as follows: 1. When the base is 0 and the exponent <0, the reciprocal of 0 will occur, and error handling needs to be performed, setting a global variable; 2. Determine whether the base is equal to 0, because base is a double type, so it cannot be judged directly with == 3. Optimize the exponentiation function (power of two).
When n is an even number, a^n = (a^n/2)_(a^n/2);
When n is an odd number, a^n = a^[(n-1)/2]_ a^[(n-1)/2] \* a. Time complexity O(logn)

**Time complexity**: O(logn)

**Sample code:**

```java
public class Solution {
      boolean invalidInput=false;
      public double Power(double base, int exponent) {
          //If the base is equal to 0 and the exponent is less than 0
          //Since base is of double type, it cannot be judged directly using ==
        if(equal(base,0.0)&&exponent<0){
            invalidInput=true;
            return 0.0;
        }
        int absexponent=exponent;
         //If the index is less than 0, turn the index positive
        if(exponent<0)
            absexponent=-exponent;
         //The getPower method finds the exponent power of base.
        double res=getPower(base,absexponent);
         //If the index is less than 0, the result obtained is the reciprocal of the result obtained above.
        if(exponent<0)
            res=1.0/res;
        return res;
  }
    //Method to compare whether two double variables are equal
    boolean equal(double num1,double num2){
        if(num1-num2>-0.000001&&num1-num2<0.000001)
            return true;
        else
            return false;
    }
    //Method to find b raised to the power of e
    double getPower(double b,int e){
        //If the index is 0, return 1
        if(e==0)
            return 1.0;
        //If the index is 1, return b
        if(e==1)
            return b;
        //e>>1 is equal to e/2, here is to find a^n = (a^n/2)*(a^n/2)
        double result=getPower(b,e>>1);
        result*=result;
        //If the index n is an odd number, multiply the base again
        if((e&1)==1)
            result*=b;
        return result;
    }
}
```

Of course, this question can also be solved using a stupid method: cumulative multiplication. However, the time complexity of this method is O(n), which is not as efficient as the previous method.

```java
// Use cumulative multiplication
public double powerAnother(double base, int exponent) {
    double result = 1.0;
    for (int i = 0; i < Math.abs(exponent); i++) {
        result *= base;
    }
    if (exponent >= 0)
        return result;
    else
        return 1/result;
}
```

## Adjust the order of the array so that odd numbers are in front of even numbers

**Title description:**

Input an array of integers and implement a function to adjust the order of the numbers in the array so that all odd numbers are located in the first half of the array and all even numbers are located in the second half of the array, while ensuring that the relative positions between odd numbers and odd numbers and even numbers and even numbers remain unchanged.

**Problem analysis:**

There are many ways to solve this question. I would like to introduce a method that I think is easy to understand:
We first count the number of odd numbers, assuming it is n, then create a new equal-length array, and then use a loop to determine whether the elements in the original array are even or odd. If it is, add the odd number to the new array starting from the element with array index 0; if it is an even number, add the even number to the new array starting from the element with array index n.

**Sample code:**

An algorithm with time complexity O(n) and space complexity O(n)

```java
public class Solution {
    public void reOrderArray(int [] array) {
        //If the array length is equal to 0 or equal to 1, do nothing and return directly
        if(array.length==0||array.length==1)
            return;
        //oddCount: save odd numbers
        //oddBegin: odd numbers are added from the head of the array
        int oddCount=0,oddBegin=0;
        //Create a new array
        int[] newArray=new int[array.length];
        //Calculate (the odd number in the array) and start adding elements
        for(int i=0;i<array.length;i++){
            if((array[i]&1)==1) oddCount++;
        }
        for(int i=0;i<array.length;i++){
            //If the number is a base number, add elements to the new array from the beginning
            //If it is an even number, add elements starting from oddCount (odd number in the array)
            if((array[i]&1)==1)
                newArray[oddBegin++]=array[i];
            else newArray[oddCount++]=array[i];
        }
        for(int i=0;i<array.length;i++){
            array[i]=newArray[i];
        }
    }
}
```

## The kth node from the last in the linked list

**Title description:**

Input a linked list and output the k-th node from the last in the linked list.

**Problem Analysis:**

**Summary in one sentence:**
Two pointers and one pointer p1 start running first. After pointer p1 reaches k-1 nodes, the other node p2 starts running. When p1 reaches the end, the pointer pointed by p2 is the k-th node from the bottom.

**Simple understanding of ideas:**
Premise: The number (length) of nodes in the linked list is n.
Rule 1: How many steps do we need to go forward to find the k-th node from the bottom? For example, the penultimate node requires n steps, but what about the penultimate node? It is obviously n-1 steps forward, so we can find the rule that to find the k-th node from the last, we need to go n-k+1 steps forward.

**Algorithm starts:**

1. Assume two pointers p1 and p2 both point to head. When p1 takes k-1 steps, stop. p2 has been motionless before.
2. The next step for p1 is to take the k-th step. At this time, p2 starts to move together. As for why p2 moves at this time? See the analysis below.3. When p1 reaches the end of the linked list, that is, p1 has walked n steps. Since we know that p2 starts moving after p1 has taken k-1 steps, that is to say, there is always a k-1 step difference between p1 and p2. So when p1 takes n steps, p2 should take n-(k-1) steps. That is, p2 has taken n-k+1 steps. The clever thing at this time is that p2 happens to point to the k-th node from the bottom of rule 1.
   Is this easy to understand?

**Inspection content:**

Robustness of linked list + code

**Sample code:**

```java
/*
//Linked list class
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/

//Time complexity O(n), just one traversal
public class Solution {
    public ListNode FindKthToTail(ListNode head,int k) {
        ListNode pre=null,p=null;
        //Both pointers point to the head node
        p=head;
        pre=head;
        //Record k value
        int a=k;
        //Record the number of nodes
        int count=0;
        //The p pointer runs first and records the number of nodes. When the p pointer runs k-1 nodes, the pre pointer starts running.
        //When the p pointer reaches the end, the pointer pointed by pre is the k-th node from the bottom
        while(p!=null){
            p=p.next;
            count++;
            if(k<1){
                pre=pre.next;
            }
            k--;
        }
        //If the number of nodes is less than the required k-th node from the last, return empty
        if(count<a) return null;
        return pre;

    }
}
```

## Reverse linked list

**Title description:**

Input a linked list, reverse the linked list, and output all elements of the linked list.

**Problem Analysis:**

It is a very common question about linked lists. The idea of this question is not difficult, but it may be difficult to implement it by yourself. I refer to other people's codes.
The idea is that we move the later nodes to the front based on the characteristics of the linked list, where the previous node points to the next node.
For example, in the picture below: we exchange the positions of node 1 and node 2, and then point node 3 to node 2, and node 4 to node 3, so that the linked list below is reversed.

![Linked list](https://oss.javaguide.cn/p3-juejin/844773c7300e4373922bb1a6ae2a55a3~tplv-k3u1fbpfcp-zoom-1.png)

**Inspection content:**

Robustness of linked list + code

**Sample code:**

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
public class Solution {
    public ListNode ReverseList(ListNode head) {
       ListNode next = null;
       ListNode pre = null;
        while (head != null) {
              //Save the node to be reversed to the beginning
               next = head.next;
               //The node to be reversed points to the previous node that has been reversed
               head.next = pre;
               //The previous node has been reversed to the head
               pre = head;
               //Go all the way to the end of the linked list
               head = next;
        }
        return pre;
    }
}
```

## Merge two sorted linked lists

**Title description:**

Input two monotonically increasing linked lists, and output the combined linked list of the two linked lists. Of course, we need the combined linked list to satisfy the monotonic non-decreasing rule.

**Problem Analysis:**

We can analyze it like this:

1. Suppose we have two linked lists A and B;
2. Compare the value of A's head node A1 with the value of B's head node B1. If A1 is small, then A1 is the head node;
3. A2 is compared with B1. Assuming B1 is small, then A1 points to B1;
4. A2 is compared with B2. . . . . . .
   Just keep repeating it like this, it should be fairly easy to understand.

**Inspection content:**

Robustness of linked list + code

**Sample code:**

Non-recursive version:

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
public class Solution {
    public ListNode Merge(ListNode list1,ListNode list2) {
       //list1 is empty, return list2 directly
       if(list1 == null){
            return list2;
        }
        //list2 is empty, return list1 directly
        if(list2 == null){
            return list1;
        }
        ListNode mergeHead = null;
        ListNode current = null;
        //When list1 and list2 are not empty
        while(list1!=null && list2!=null){
            //Take the smaller value as the head node
            if(list1.val <= list2.val){
                if(mergeHead == null){
                   mergeHead = current = list1;
                }else{
                   current.next = list1;
                    //The current node saves the value of the list1 node because it will be used next time
                   current = list1;
                }
                //list1 points to the next node
                list1 = list1.next;
            }else{
                if(mergeHead == null){
                   mergeHead = current = list2;
                }else{
                   current.next = list2;
                     //The current node saves the value of the list2 node because it will be used next time
                   current = list2;
                }
                //list2 points to the next node
                list2 = list2.next;
            }
        }
        if(list1 == null){
            current.next = list2;
        }else{
            current.next = list1;
        }
        return mergeHead;
    }
}
```

Recursive version:

```java
public ListNode Merge(ListNode list1,ListNode list2) {
    if(list1 == null){
        return list2;
    }
    if(list2 == null){
        return list1;
    }
    if(list1.val <= list2.val){
        list1.next = Merge(list1.next, list2);
        return list1;
    }else{
        list2.next = Merge(list1, list2.next);
        return list2;
    }
}
```## Use two stacks to implement queues

**Title description:**

Use two stacks to implement a queue and complete the push and pop operations of the queue. The elements in the queue are of type int.

**Problem Analysis:**

First, let’s review the basic characteristics of stacks and queues:
**Stack:** Last in, first out (LIFO)
**Queue:** First in, first out
Obviously we need to implement it based on some basic methods of the stack provided by the JDK. Let’s first look at some basic methods of the Stack class:

![Some common methods of the Stack class](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/5985000.jpg)

Since the question gives us two stacks, we can think about pushing the elements into stack1 when pushing. When popping, we first pop the elements of stack1 to stack2, and then perform the pop operation on stack2, so that it can be guaranteed to be first in, first out. (Negative [pop] negative [pop] is positive [first in, first out])

**Inspection content:**

queue+stack

Sample code:

```java
//Answers to Zuo Chengyun's "Programmer Code Interview Guide"
import java.util.Stack;

public class Solution {
    Stack<Integer> stack1 = new Stack<Integer>();
    Stack<Integer> stack2 = new Stack<Integer>();

    //When performing a push operation, add elements to stack1
    public void push(int node) {
        stack1.push(node);
    }

    public int pop() {
        //If both queues are empty, an exception is thrown, indicating that the user has not pushed any elements.
        if(stack1.empty()&&stack2.empty()){
            throw new RuntimeException("Queue is empty!");
        }
        //If stack2 is not empty, perform pop operation directly on stack2.
        if(stack2.empty()){
            while(!stack1.empty()){
                //Push the elements of stack1 into stack2 according to last in first out
                stack2.push(stack1.pop());
            }
        }
          return stack2.pop();
    }
}
```

## Stack push and pop sequence

**Title description:**

Input two integer sequences. The first sequence represents the push sequence of the stack. Please determine whether the second sequence is the pop sequence of the stack. Assume that all numbers pushed onto the stack are not equal. For example, the sequence 1,2,3,4,5 is the push sequence of a certain stack, and the sequence 4,5,3,2,1 is a pop sequence corresponding to the push sequence, but 4,3,5,1,2 cannot be the pop sequence of the push sequence. (Note: the lengths of these two sequences are equal)

**Question Analysis:**

I have been thinking about this question for a long time and I have no idea. I refer to [Alias's answer](https://www.nowcoder.com/questionTerminal/d77d11405cc7470d82554cb392585106). His ideas are also very detailed and should be easy to understand.

[Idea] Borrow an auxiliary stack to traverse the stack pushing sequence. First, put the first element on the stack, here is 1, and then determine whether the top element of the stack is the first element in the popping sequence, here is 4. Obviously 1≠4, so we continue to push the stack until they are equal and start popping. If one element is popped from the stack, the popping sequence will be moved backward by one until they are not equal. In this way, the loop waits for the stack sequence traversal to be completed. If the auxiliary stack is not empty yet, it means that the popping sequence is not the popping sequence of the stack.

Example:

Push 1,2,3,4,5

Pop 4,5,3,2,1

First, 1 is pushed into the auxiliary stack. At this time, the top of the stack is 1≠4. Continue to push 2 into the stack.

At this time, the top of the stack is 2≠4, continue to push 3 to the stack

At this time, the top of the stack is 3≠4, continue to push 4 to the stack

At this time, the top of the stack is 4 = 4, pop 4 from the stack, and the pop sequence is one bit backward, which is 5 at this time, and the auxiliary stack is 1, 2, 3

At this time, the top of the stack is 3≠5, continue to push 5 to the stack

At this time, the top of the stack is 5=5, pop 5 from the stack, and the pop sequence is one bit backward, which is 3 at this time, and the auxiliary stack is 1, 2, 3

….
Execute in sequence, and finally the auxiliary stack is empty. If it is not empty, the pop sequence is not the pop sequence of the stack.

**Inspection content:**

stack

**Sample code:**

```java
import java.util.ArrayList;
import java.util.Stack;
//I didn't think of this question, so I referred to Alias's answer: https://www.nowcoder.com/questionTerminal/d77d11405cc7470d82554cb392585106
public class Solution {
    public boolean IsPopOrder(int [] pushA,int [] popA) {
        if(pushA.length == 0 || popA.length == 0)
            return false;
        Stack<Integer> s = new Stack<Integer>();
        //Used to identify the position of the pop-up sequence
        int popIndex = 0;
        for(int i = 0; i< pushA.length;i++){
            s.push(pushA[i]);
            //If the stack is not empty and the top element of the stack is equal to the pop sequence
            while(!s.empty() &&s.peek() == popA[popIndex]){
                //pop
                s.pop();
                //The popup sequence goes backward one bit
                popIndex++;
            }
        }
        return s.empty();
    }
}
```

<!-- @include: @article-footer.snippet.md -->