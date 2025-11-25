---
title: 线性数据结构
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: 数组,链表,栈,队列,双端队列,复杂度分析,随机访问,插入删除
  - - meta
    - name: description
      content: 总结数组/链表/栈/队列的特性与操作，配合复杂度分析与典型应用，掌握线性结构的选型与实现。
---

## 1. 数组

**数组（Array）** 是一种很常见的数据结构。它由相同类型的元素（element）组成，并且是使用一块连续的内存来存储。

我们直接可以利用元素的索引（index）可以计算出该元素对应的存储地址。

数组的特点是：**提供随机访问** 并且容量有限。

```java
假如数组的长度为 n。
访问：O（1）//访问特定位置的元素
插入：O（n ）//最坏的情况发生在插入发生在数组的首部并需要移动所有元素时
删除：O（n）//最坏的情况发生在删除数组的开头发生并需要移动第一元素后面所有的元素时
```

![数组](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/array.png)

## 2. 链表

### 2.1. 链表简介

**链表（LinkedList）** 虽然是一种线性表，但是并不会按线性的顺序存储数据，使用的不是连续的内存空间来存储数据。

链表的插入和删除操作的复杂度为 O(1) ，只需要知道目标位置元素的上一个元素即可。但是，在查找一个节点或者访问特定位置的节点的时候复杂度为 O(n) 。

使用链表结构可以克服数组需要预先知道数据大小的缺点，链表结构可以充分利用计算机内存空间,实现灵活的内存动态管理。但链表不会节省空间，相比于数组会占用更多的空间，因为链表中每个节点存放的还有指向其他节点的指针。除此之外，链表不具有数组随机读取的优点。

### 2.2. 链表分类

**常见链表分类：**

1. 单链表
2. 双向链表
3. 循环链表
4. 双向循环链表

```java
假如链表中有n个元素。
访问：O（n）//访问特定位置的元素
插入删除：O（1）//必须要要知道插入元素的位置
```

#### 2.2.1. 单链表

**单链表** 单向链表只有一个方向，结点只有一个后继指针 next 指向后面的节点。因此，链表这种数据结构通常在物理内存上是不连续的。我们习惯性地把第一个结点叫作头结点，链表通常有一个不保存任何值的 head 节点(头结点)，通过头结点我们可以遍历整个链表。尾结点通常指向 null。

![单链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/single-linkedlist.png)

#### 2.2.2. 循环链表

**循环链表** 其实是一种特殊的单链表，和单链表不同的是循环链表的尾结点不是指向 null，而是指向链表的头结点。

![循环链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/circular-linkedlist.png)

#### 2.2.3. 双向链表

**双向链表** 包含两个指针，一个 prev 指向前一个节点，一个 next 指向后一个节点。

![双向链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

#### 2.2.4. 双向循环链表

**双向循环链表** 最后一个节点的 next 指向 head，而 head 的 prev 指向最后一个节点，构成一个环。

![双向循环链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-circular-linkedlist.png)

### 2.3. 应用场景

- 如果需要支持随机访问的话，链表没办法做到。
- 如果需要存储的数据元素的个数不确定，并且需要经常添加和删除数据的话，使用链表比较合适。
- 如果需要存储的数据元素的个数确定，并且不需要经常添加和删除数据的话，使用数组比较合适。

### 2.4. 数组 vs 链表

- 数组支持随机访问，而链表不支持。
- 数组使用的是连续内存空间对 CPU 的缓存机制友好，链表则相反。
- 数组的大小固定，而链表则天然支持动态扩容。如果声明的数组过小，需要另外申请一个更大的内存空间存放数组元素，然后将原数组拷贝进去，这个操作是比较耗时的！

## 3. 栈

### 3.1. 栈简介

**栈 (Stack)** 只允许在有序的线性数据集合的一端（称为栈顶 top）进行加入数据（push）和移除数据（pop）。因而按照 **后进先出（LIFO, Last In First Out）** 的原理运作。**在栈中，push 和 pop 的操作都发生在栈顶。**

栈常用一维数组或链表来实现，用数组实现的栈叫作 **顺序栈** ，用链表实现的栈叫作 **链式栈** 。

```java
假设堆栈中有n个元素。
访问：O（n）//最坏情况
插入删除：O（1）//顶端插入和删除元素
```

![栈](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/%E6%A0%88.png)

### 3.2. 栈的常见应用场景

当我们我们要处理的数据只涉及在一端插入和删除数据，并且满足 **后进先出（LIFO, Last In First Out）** 的特性时，我们就可以使用栈这个数据结构。

#### 3.2.1. 实现浏览器的回退和前进功能

我们只需要使用两个栈(Stack1 和 Stack2)和就能实现这个功能。比如你按顺序查看了 1,2,3,4 这四个页面，我们依次把 1,2,3,4 这四个页面压入 Stack1 中。当你想回头看 2 这个页面的时候，你点击回退按钮，我们依次把 4,3 这两个页面从 Stack1 弹出，然后压入 Stack2 中。假如你又想回到页面 3，你点击前进按钮，我们将 3 页面从 Stack2 弹出，然后压入到 Stack1 中。示例图如下:

![栈实现浏览器倒退和前进](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/%E6%A0%88%E5%AE%9E%E7%8E%B0%E6%B5%8F%E8%A7%88%E5%99%A8%E5%80%92%E9%80%80%E5%92%8C%E5%89%8D%E8%BF%9B.png)

#### 3.2.2. 检查符号是否成对出现

> 给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串，判断该字符串是否有效。
>
> 有效字符串需满足：
>
> 1. 左括号必须用相同类型的右括号闭合。
> 2. 左括号必须以正确的顺序闭合。
>
> 比如 "()"、"()[]{}"、"{[]}" 都是有效字符串，而 "(]"、"([)]" 则不是。

这个问题实际是 Leetcode 的一道题目，我们可以利用栈 `Stack` 来解决这个问题。

1. 首先我们将括号间的对应规则存放在 `Map` 中，这一点应该毋容置疑；
2. 创建一个栈。遍历字符串，如果字符是左括号就直接加入`stack`中，否则将`stack` 的栈顶元素与这个括号做比较，如果不相等就直接返回 false。遍历结束，如果`stack`为空，返回 `true`。

```java
public boolean isValid(String s){
    // 括号之间的对应规则
    HashMap<Character, Character> mappings = new HashMap<Character, Character>();
    mappings.put(')', '(');
    mappings.put('}', '{');
    mappings.put(']', '[');
    Stack<Character> stack = new Stack<Character>();
    char[] chars = s.toCharArray();
    for (int i = 0; i < chars.length; i++) {
        if (mappings.containsKey(chars[i])) {
            char topElement = stack.empty() ? '#' : stack.pop();
            if (topElement != mappings.get(chars[i])) {
                return false;
            }
        } else {
            stack.push(chars[i]);
        }
    }
    return stack.isEmpty();
}
```

#### 3.2.3. Reverse string

Just push each character in the string onto the stack and then pop it out.

#### 3.2.4. Maintenance function calls

The last called function must complete execution first, conforming to the stack's **Last In First Out (LIFO, Last In First Out)** characteristics.  
For example, recursive function calls can be implemented through the stack. Each recursive call will push the parameters and return address onto the stack.

#### 3.2.5 Depth-first traversal (DFS)

During a depth-first search, the stack is used to save the search path for backtracking to the previous level.

### 3.3. Stack implementation

The stack can be implemented either as an array or as a linked list. Regardless of whether it is based on an array or a linked list, the time complexity of pushing and popping onto the stack is O(1).

Below we use an array to implement a stack, and this stack has basic methods such as `push()`, `pop()` (return the top element of the stack and pop it off the stack), `peek()` (return the top element of the stack without popping it), `isEmpty()`, and `size()`.

> Tip: Before each push to the stack, first determine whether the stack capacity is sufficient. If not, use `Arrays.copyOf()` to expand the capacity;

```java
public class MyStack {
    private int[] storage;//array to store elements in the stack
    private int capacity;//Stack capacity
    private int count;//The number of elements in the stack
    private static final int GROW_FACTOR = 2;

    //Constructor without initial capacity. The default capacity is 8
    public MyStack() {
        this.capacity = 8;
        this.storage=new int[8];
        this.count = 0;
    }

    //Construction method with initial capacity
    public MyStack(int initialCapacity) {
        if (initialCapacity < 1)
            throw new IllegalArgumentException("Capacity too small.");

        this.capacity = initialCapacity;
        this.storage = new int[initialCapacity];
        this.count = 0;
    }

    //Push to stack
    public void push(int value) {
        if (count == capacity) {
            ensureCapacity();
        }
        storage[count++] = value;
    }

    //Ensure capacity
    private void ensureCapacity() {
        int newCapacity = capacity * GROW_FACTOR;
        storage = Arrays.copyOf(storage, newCapacity);
        capacity = newCapacity;
    }

    //Return the top element of the stack and pop it off the stack
    private int pop() {
        if (count == 0)
            throw new IllegalArgumentException("Stack is empty.");
        count--;
        return storage[count];
    }

    //Return the top element of the stack without popping it
    private int peek() {
        if (count == 0){
            throw new IllegalArgumentException("Stack is empty.");
        }else {
            return storage[count-1];
        }
    }

    //Determine whether the stack is empty
    private boolean isEmpty() {
        return count == 0;
    }

    //Return the number of elements in the stack
    private int size() {
        return count;
    }

}
```

Verify

```java
MyStack myStack = new MyStack(3);
myStack.push(1);
myStack.push(2);
myStack.push(3);
myStack.push(4);
myStack.push(5);
myStack.push(6);
myStack.push(7);
myStack.push(8);
System.out.println(myStack.peek());//8
System.out.println(myStack.size());//8
for (int i = 0; i < 8; i++) {
    System.out.println(myStack.pop());
}
System.out.println(myStack.isEmpty());//true
myStack.pop();//Error report: java.lang.IllegalArgumentException: Stack is empty.
```

## 4. Queue

### 4.1. Queue Introduction

**Queue** is a linear table of **First In, First Out (FIFO, First In, First Out)**. In specific applications, it is usually implemented using linked lists or arrays. The queue implemented using arrays is called **sequential queue**, and the queue implemented using linked lists is called **chained queue**. **The queue only allows insertion operations at the back end (rear), which is enqueue, and deletion operations at the front end (front), which is dequeue**

Queues operate similarly to stacks, the only difference being that queues only allow new data to be added on the backend.

```java
Suppose there are n elements in the queue.
Access: O(n) // worst case
Insertion and deletion: O(1) //Backend inserts and frontend deletes elements
```

![Queue](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/queue.png)

### 4.2. Queue classification

#### 4.2.1. Single queue

A single queue is a common queue. Every time an element is added, it is added to the end of the queue. Single queue is divided into **sequential queue (array implementation)** and **chain queue (linked list implementation)**.

**The sequential queue has the problem of "false overflow", which is the situation where there is a position but cannot be added. **

Assume that the figure below is a sequential queue. We dequeue the first two elements 1,2 and merge the two elements 7,8 into the queue. When performing enqueue and dequeue operations, front and rear will continue to move backward. When rear moves to the end, we can no longer add data to the queue, even if there is free space in the array, this phenomenon is **"false overflow"**. In addition to the false overflow problem, as shown in the figure below, when element 8 is added, the rear pointer moves outside the array (out of bounds).

> In order to avoid the overlapping of the head and tail of the queue when there is only one element, which makes processing cumbersome, two pointers are introduced. The front pointer points to the opposite element, and the rear pointer points to the next position of the last element in the queue. In this way, when front is equal to rear, the queue does not have one element left, but an empty queue. ——From "Dahua Data Structure"

![Sequential queue false overflow](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/seq-queue-false-overflow.png)

#### 4.2.2. Circular Queue

Circular queues can solve the problem of false overflow and out-of-bounds problems of sequential queues. The solution is: start from the beginning, which will form a loop that connects end to end, which is where the name of the circular queue comes from.

Still using the picture above, if we point the rear pointer to the position where the array index is 0, there will be no out-of-bounds problem. When we add another element to the queue, rear moves backward.

![Circular queue](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/circular-queue.png)

In the sequential queue, when we say `front==rear`, the queue is empty, but in the circular queue, it is different and may be full, as shown in the figure above. There are two solutions:

1. You can set a flag variable `flag`. When `front==rear` and `flag=0`, the queue is empty. When `front==rear` and `flag=1`, the queue is full.
2. When the queue is empty, it is `front==rear`. When the queue is full, we ensure that there is still a free position in the array, and rear points to this free position, as shown in the figure below. So now the condition for judging whether the queue is full is: `(rear+1) % QueueSize==front`.

#### 4.2.3 Double-ended queue

**Double-ended queue (Deque)** is a queue that can perform insertion and deletion operations at both ends of the queue. It is more flexible than a single queue.Generally speaking, we can perform `addFirst`, `addLast`, `removeFirst` and `removeLast` operations on a deque.

#### 4.2.4 Priority queue

**Priority Queue** is not a linear data structure in terms of underlying structure. It is generally implemented by a heap.

1. As each element is enqueued, the priority queue inserts the new element into the heap and adjusts the heap.
2. When the head of the queue is dequeued, the priority queue will return the top element of the heap and adjust the heap.

For the specific implementation of the heap, please see the section [Heap](https://javaguide.cn/cs-basics/data-structure/heap.html).

All in all, no matter what operations we perform, the priority queue can perform a series of heap-related operations according to a certain sorting method, thereby ensuring the orderliness of the entire collection.

Although the underlying structure of the priority queue is not strictly linear, we cannot perceive the heap when we use it. From the user's perspective, the priority queue can be considered a linear data structure: a linear queue that is automatically sorted.

### 4.3. Common application scenarios of queues

When we need to process data in a certain order, we can consider using the queue data structure.

- **Blocking queue:** A blocking queue can be regarded as a queue with blocking operations added to the queue. When the queue is empty, the dequeue operation blocks, and when the queue is full, the enqueue operation blocks. Using blocking queues we can easily implement the "producer-consumer" model.
- **Request/Task Queue in Thread Pool:** When there are no idle threads in the thread pool, how will new task request thread resources be processed? The answer is that these tasks will be put into the task queue and wait for the threads in the thread pool to become idle before taking the tasks out of the queue for execution. Task queues are divided into unbounded queues (implemented based on linked lists) and bounded queues (implemented based on arrays). The characteristic of unbounded queue is that there is no theoretical limit on queue capacity, and tasks can continue to be queued until system resources are exhausted. For example: the blocking queue `LinkedBlockingQueue` used by `FixedThreadPool` has a default capacity of `Integer.MAX_VALUE`, so it can be regarded as an "unbounded queue". The bounded queue is different. When the queue is full, if new tasks are submitted, because the queue cannot continue to accommodate tasks, the thread pool will reject these tasks and throw a `java.util.concurrent.RejectedExecutionException` exception.
- **Stack**: The double-ended queue can inherently implement all the functions of the stack (`push`, `pop` and `peek`), and the relevant methods have been implemented in the Deque interface. The Stack class has been abandoned like Vector, and double-ended queues (Deques) are now commonly used in Java to implement stacks.
- **Breadth-First Search (BFS)**: During the breadth-first search process of the graph, the queue is used to store the nodes to be accessed, ensuring that the nodes of the graph are traversed in hierarchical order.
- Linux kernel process queue (queued by priority)
- Real life parties, playlists on the player;
- Message queue
- Wait...

<!-- @include: @article-footer.snippet.md -->