> 早上8-10看资料 晚上8-10搞算法

### 2.27 Java/J2EE 基础
* [Java 基础知识回顾](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/Java基础知识.md)
* [J2EE 基础知识回顾](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/J2EE基础知识.md)
* [static、final、this、super关键字总结](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/final、static、this、super.md) 
* [static 关键字详解](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/static.md)   

### 2.28 集合 List相关
* [ArrayList 源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/ArrayList.md) 
* [【面试必备】透过源码角度一步一步带你分析 ArrayList 扩容机制](https://github.com/Snailclimb/JavaGuide/blob/master/Java相关/ArrayList-Grow.md) 
* [LinkedList 源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/LinkedList.md)  

### 3.1 怠惰 _(:з)∠)_

### 3.2 集合 Map,Set相关
* [这几道Java集合框架面试题几乎必问](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/这几道Java集合框架面试题几乎必问.md)
* [Java 集合框架常见面试题总结](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/Java集合框架常见面试题总结.md)
* [HashMap(JDK1.8)源码学习](https://github.com/Snailclimb/Java-Guide/blob/master/Java相关/HashMap.md)  

### 3.3 并发
之前看过《Java并发编程与高并发解决方案》视频，再看一波，巩固一下
* [并发编程面试必备：synchronized 关键字使用、底层原理、JDK1.6 之后的底层优化以及 和ReenTrantLock 的对比](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/synchronized.md)
* [并发编程面试必备：乐观锁与悲观锁](https://github.com/Snailclimb/Java-Guide/blob/master/面试必备/面试必备之乐观锁与悲观锁.md)
* [并发编程面试必备：JUC 中的 Atomic 原子类总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/Atomic.md)
* [并发编程面试必备：AQS 原理以及 AQS 同步组件总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/AQS.md)

### 3.4  算法
《玩转算法面试》 前三章
- leetcode-283  Move Zeros
- leetcode-27 Remove element 不要想当然 **确认空间复杂度要求** 如何定义删除 删除后是否保证相对顺序
- leetcode-26 Remove Duplicates from Sorted Array
- leetcode-80 Remove Duplicates from Sorted Array II
- **leetcode-75** Sort Colors 三路快排 一个partition
- leetcode-88 Merge Sorted Array 
- **leetcode-215** Kth Largest Element in an Array 快排前K步 O(n)
- **对撞指针(接下来五个均是)**
- leetcode-167 Two Sum 明确细节 确认没有解/多个解的处理(顺序) 注意边界(assert 抛出异常 ......)  
- leetcode-125 Valid Palindrome  回文串 **字符串注意** 空字符串/大小写/字符串定义/元音y算否
- leetcode-344 Reverse String    
- leetcode-345 Reverse Vowels of a String   
- **leetcode-11** Container With Most Water   
- **滑动窗口(接下来四个均是）**
- leetcode-209 Minimum Size Subarray Sum    
- **leetcode-3** Longest Substring Without Repeating Characters 没必要用Map 字符集一共没多少 搞个freq数组即可
- ***leetcode-438*** Find All Anagrams in a String  结合上一题思路~
- leetcode-76 Minimum Window Substring 同上

### 3.5 
#### 早 多线程
- [Java多线程学习（一）Java多线程入门](http://blog.csdn.net/qq_34337272/article/details/79640870)
- [Java多线程学习（二）synchronized关键字（1）](http://blog.csdn.net/qq_34337272/article/details/79655194)
- [Java多线程学习（二）synchronized关键字（2）](http://blog.csdn.net/qq_34337272/article/details/79670775)
- [Java多线程学习（三）volatile关键字](http://blog.csdn.net/qq_34337272/article/details/79680771)

#### 晚 算法
《玩转算法面试》 第四章
- **查找问题**
- leetcode-349 Intersection of Two Arrays     **有序**
- leetcode-350 Intersection of Two Arrays II   
c++ map/set 底层 平衡二叉树(查找/插入/删除都是O(logn) / 哈希表(失去顺序性)
- leetcode-242 Valid Anagram    
- leetcode-202 Happy Number  
- leetcode-290 Word Pattern 注意空串
- leetcode-205 Isomorphic Strings   
- leetcode-451 Sort Characters By Frequency    
- leetcode-1 Two Sum
- leetcode-15 3Sum [-1,-1,-1,2] 算几个解
- leetcode-18 4Sum  上一题价格循环O(n^3) 可以有一点可行性剪枝 或者枚举出所有二个数的和存放在hash table O(n^2)
- ***Ksum*** https://www.cnblogs.com/shytong/p/5138629.html
- **leetcode-16** 3Sum Closest 和3Sum差不多，但不能用hash table了   
- leetcode-454 4Sum II  **分组** O(n^2)
- **leetcode-49** Group Anagrams  采用HashMap<String,List<String>>，每次将读入的字符串在map中查找（这里需将读入的字符串转化成数组后用sort（）来排列好）用sort后的字符串作为key，与字符串整理后一样的字符串集合的list作为value
- **leetcode-447** Number of Boomerangs  
- **leetcode-149** Max Points on a Line  **点坐标 浮点误差** 斜率即可 如果使用了平衡树的话 复杂度是O(logn * n^2) 如果使用一个hash_map 复杂度就完全可以是O(n^2) 
- **滑动窗口+查找表**
- **leetcode-219** Contains Duplicate II 滑动窗口用起来 O(n)
- leetcode-217 Contains Duplicate    
- ***leetcode-220*** Contains Duplicate III 相加溢出... https://blog.csdn.net/qq_36946274/article/details/81119614

### 3.6
#### 多线程
- [Java多线程学习（四）等待/通知（wait/notify）机制](http://blog.csdn.net/qq_34337272/article/details/79690279)
- [Java多线程学习（五）线程间通信知识点补充](http://blog.csdn.net/qq_34337272/article/details/79694226)
- [Java多线程学习（六）Lock锁的使用](http://blog.csdn.net/qq_34337272/article/details/79714196)
- [Java多线程学习（七）并发编程中一些问题](https://blog.csdn.net/qq_34337272/article/details/79844051)
- [Java多线程学习（八）线程池与Executor 框架](https://blog.csdn.net/qq_34337272/article/details/79959271)
- [并发容器总结](https://github.com/Snailclimb/Java_Guide/blob/master/Java相关/Multithread/并发容器总结.md)
