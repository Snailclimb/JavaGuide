---
title: LinkedList 源码分析
category: Java
tag:
  - Java集合
head:
  - - meta
    - name: keywords
      content: LinkedList,双向链表,Deque,插入删除复杂度,随机访问,头尾操作,List 接口,链表结构
  - - meta
    - name: description
      content: 详解 LinkedList 的数据结构与接口实现，分析头尾插入删除的时间复杂度、与 ArrayList 的差异以及不支持随机访问的原因。
---

<!-- @include: @article-header.snippet.md -->

## LinkedList 简介

`LinkedList` 是一个基于双向链表实现的集合类，经常被拿来和 `ArrayList` 做比较。关于 `LinkedList` 和`ArrayList`的详细对比，我们 [Java 集合常见面试题总结(上)](./java-collection-questions-01.md)有详细介绍到。

![双向链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

不过，我们在项目中一般是不会使用到 `LinkedList` 的，需要用到 `LinkedList` 的场景几乎都可以使用 `ArrayList` 来代替，并且，性能通常会更好！就连 `LinkedList` 的作者约书亚 · 布洛克（Josh Bloch）自己都说从来不会使用 `LinkedList` 。

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

另外，不要下意识地认为 `LinkedList` 作为链表就最适合元素增删的场景。我在上面也说了，`LinkedList` 仅仅在头尾插入或者删除元素的时候时间复杂度近似 O(1)，其他情况增删元素的平均时间复杂度都是 O(n) 。

### LinkedList 插入和删除元素的时间复杂度？

- 头部插入/删除：只需要修改头结点的指针即可完成插入/删除操作，因此时间复杂度为 O(1)。
- 尾部插入/删除：只需要修改尾结点的指针即可完成插入/删除操作，因此时间复杂度为 O(1)。
- 指定位置插入/删除：需要先移动到指定位置，再修改指定节点的指针完成插入/删除，不过由于有头尾指针，可以从较近的指针出发，因此需要遍历平均 n/4 个元素，时间复杂度为 O(n)。

### LinkedList 为什么不能实现 RandomAccess 接口？

`RandomAccess` 是一个标记接口，用来表明实现该接口的类支持随机访问（即可以通过索引快速访问元素）。由于 `LinkedList` 底层数据结构是链表，内存地址不连续，只能通过指针来定位，不支持随机快速访问，所以不能实现 `RandomAccess` 接口。

## LinkedList 源码分析

这里以 JDK1.8 为例，分析一下 `LinkedList` 的底层核心源码。

`LinkedList` 的类定义如下：

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
{
  //...
}
```

`LinkedList` 继承了 `AbstractSequentialList` ，而 `AbstractSequentialList` 又继承于 `AbstractList` 。

阅读过 `ArrayList` 的源码我们就知道，`ArrayList` 同样继承了 `AbstractList` ， 所以 `LinkedList` 会有大部分方法和 `ArrayList` 相似。

`LinkedList` 实现了以下接口：

- `List` : 表明它是一个列表，支持添加、删除、查找等操作，并且可以通过下标进行访问。
- `Deque` ：继承自 `Queue` 接口，具有双端队列的特性，支持从两端插入和删除元素，方便实现栈和队列等数据结构。需要注意，`Deque` 的发音为 "deck" [dɛk]，这个大部分人都会读错。
- `Cloneable` ：表明它具有拷贝能力，可以进行深拷贝或浅拷贝操作。
- `Serializable` : 表明它可以进行序列化操作，也就是可以将对象转换为字节流进行持久化存储或网络传输，非常方便。

![LinkedList 类图](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist--class-diagram.png)

`LinkedList` 中的元素是通过 `Node` 定义的：

```java
private static class Node<E> {
    E item;// 节点值
    Node<E> next; // 指向的下一个节点（后继节点）
    Node<E> prev; // 指向的前一个节点（前驱结点）

    // 初始化参数顺序分别是：前驱结点、本身节点值、后继节点
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### 初始化

`LinkedList` 中有一个无参构造函数和一个有参构造函数。

```java
// 创建一个空的链表对象
public LinkedList() {
}

// 接收一个集合类型作为参数，会创建一个与传入集合相同元素的链表对象
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

### 插入元素

`LinkedList` 除了实现了 `List` 接口相关方法，还实现了 `Deque` 接口的很多方法，所以我们有很多种方式插入元素。

我们这里以 `List` 接口中相关的插入方法为例进行源码讲解，对应的是`add()` 方法。

`add()` 方法有两个版本：

- `add(E e)`：用于在 `LinkedList` 的尾部插入元素，即将新元素作为链表的最后一个元素，时间复杂度为 O(1)。
- `add(int index, E element)`:用于在指定位置插入元素。这种插入方式需要先移动到指定位置，再修改指定节点的指针完成插入/删除，因此需要移动平均 n/4 个元素，时间复杂度为 O(n)。

```java
// 在链表尾部插入元素
public boolean add(E e) {
    linkLast(e);
    return true;
}

// 在链表指定位置插入元素
public void add(int index, E element) {
    // 下标越界检查
    checkPositionIndex(index);

    // 判断 index 是不是链表尾部位置
    if (index == size)
        // 如果是就直接调用 linkLast 方法将元素节点插入链表尾部即可
        linkLast(element);
    else
        // 如果不是则调用 linkBefore 方法将其插入指定元素之前
        linkBefore(element, node(index));
}

// 将元素节点插入到链表尾部
void linkLast(E e) {
    // 将最后一个元素赋值（引用传递）给节点 l
    final Node<E> l = last;
    // 创建节点，并指定节点前驱为链表尾节点 last，后继引用为空
    final Node<E> newNode = new Node<>(l, e, null);
    // 将 last 引用指向新节点
    last = newNode;
    // 判断尾节点是否为空
    // 如果 l 是null 意味着这是第一次添加元素
    if (l == null)
        // 如果是第一次添加，将first赋值为新节点，此时链表只有一个元素
        first = newNode;
    else
        // 如果不是第一次添加，将新节点赋值给l（添加前的最后一个元素）的next
        l.next = newNode;
    size++;
    modCount++;
}

// 在指定元素之前插入元素
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;断言 succ不为 null
    // 定义一个节点元素保存 succ 的 prev 引用，也就是它的前一节点信息
    final Node<E> pred = succ.prev;
    // 初始化节点，并指明前驱和后继节点
    final Node<E> newNode = new Node<>(pred, e, succ);
    // 将 succ 节点前驱引用 prev 指向新节点
    succ.prev = newNode;
    // 判断前驱节点是否为空，为空表示 succ 是第一个节点
    if (pred == null)
        // 新节点成为第一个节点
        first = newNode;
    else
        // succ 节点前驱的后继引用指向新节点
        pred.next = newNode;
    size++;
    modCount++;
}
```

### Get elements

There are 3 methods related to obtaining elements in `LinkedList`:

1. `getFirst()`: Get the first element of the linked list.
2. `getLast()`: Get the last element of the linked list.
3. `get(int index)`: Get the element at the specified position in the linked list.

```java
// Get the first element of the linked list
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}

// Get the last element of the linked list
public E getLast() {
    final Node<E> l = last;
    if(l==null)
        throw new NoSuchElementException();
    return l.item;
}

// Get the element at the specified position in the linked list
public E get(int index) {
  //Check if the subscript is out of bounds, throw an exception if it is out of bounds
  checkElementIndex(index);
  // Return the element corresponding to the subscript in the linked list
  return node(index).item;
}
```

The core here lies in the `node(int index)` method:

```java
// Return the non-empty node with the specified index
Node<E> node(int index) {
    // Assert that the subscript is not out of bounds
    // assert isElementIndex(index);
    // If index is less than half of size, start searching from the front (search backward), otherwise search forward
    if (index < (size >> 1)) {
        Node<E> x = first;
        // Traverse, loop and search backward until i == index
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

This method is called internally by methods such as `get(int index)` or `remove(int index)` to obtain the corresponding node.

As can be seen from the source code of this method, this method determines whether to start traversing from the head or the end of the linked list by comparing the index value with half the size of the linked list. If the index value is less than half of size, the traversal starts from the head of the linked list, otherwise it starts from the end of the linked list. In this way, the target node can be found in a shorter time, making full use of the characteristics of the doubly linked list to improve efficiency.

### Delete element

`LinkedList` has a total of 5 methods related to deleting elements:

1. `removeFirst()`: Remove and return the first element of the linked list.
2. `removeLast()`: Remove and return the last element of the linked list.
3. `remove(E e)`: Delete the specified element that appears for the first time in the linked list. If the element does not exist, it returns false.
4. `remove(int index)`: Delete the element at the specified index and return the value of the element.
5. `void clear()`: Remove all elements in this linked list.

```java
//Delete and return the first element of the linked list
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

//Delete and return the last element of the linked list
public E removeLast() {
    final Node<E> l = last;
    if(l==null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

//Delete the specified element that appears for the first time in the linked list, return false if the element does not exist
public boolean remove(Object o) {
    // If the specified element is null, traverse the linked list to find the first null element and delete it.
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        // If not null, traverse the linked list to find the node to be deleted
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

//Delete the element at the specified position in the linked list
public E remove(int index) {
    //Check if the subscript is out of bounds, throw an exception if it is out of bounds
    checkElementIndex(index);
    return unlink(node(index));
}
```

The core here lies in the `unlink(Node<E> x)` method:

```java
E unlink(Node<E> x) {
    // Assert that x is not null
    // assert x != null;
    // Get the elements of the current node (that is, the node to be deleted)
    final E element = x.item;
    // Get the next node of the current node
    final Node<E> next = x.next;
    // Get the previous node of the current node
    final Node<E> prev = x.prev;

    // If the previous node is empty, the current node is the head node
    if (prev == null) {
        // Directly let the head of the linked list point to the next node of the current node
        first = next;
    } else { // If the previous node is not empty
        // Point the next pointer of the previous node to the next node of the current node
        prev.next = next;
        // Set the prev pointer of the current node to null to facilitate GC recycling
        x.prev = null;
    }

    // If the next node is empty, it means the current node is the tail node
    if (next == null) {
        // Directly let the tail of the linked list point to the previous node of the current node
        last = prev;
    } else { // If the next node is not empty
        // Point the prev pointer of the next node to the node before the current node
        next.prev = prev;
        // Set the next pointer of the current node to null to facilitate GC recycling
        x.next = null;
    }

    // Set the current node element to null to facilitate GC recycling
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

The logic of the `unlink()` method is as follows:

1. First obtain the predecessor and successor nodes of the node x to be deleted;
2. Determine whether the node to be deleted is the head node or the tail node:
   - If x is the head node, point first to x's successor node next
   - If x is the tail node, point last to the predecessor node of x, prev
   - If x is neither the head node nor the tail node, perform the next step
3. Point the successor of the predecessor of the node x to be deleted to the successor next of the node to be deleted, and disconnect the link between x and x.prev;
4. Point the successor prev of the node x to be deleted to the predecessor prev of the node to be deleted, and disconnect the link between x and x.next;
5. Leave the element of node x to be deleted empty and modify the length of the linked list.

You can refer to the picture below to understand (picture source: [LinkedList Source Code Analysis (JDK 1.8)](https://www.tianxiaobo.com/2018/01/31/LinkedList-%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-JDK-1-8/)):

![unlink method logic](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)### Traverse the linked list

It is recommended to use the `for-each` loop to traverse the elements in `LinkedList`. The `for-each` loop will eventually be converted into an iterator form.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add("banana");
list.add("pear");

for (String fruit : list) {
    System.out.println(fruit);
}
```

The core of `LinkedList` traversal is the implementation of its iterator.

```java
// bidirectional iterator
private class ListItr implements ListIterator<E> {
    //Represents the node passed by the last time the next() or previous() method was called;
    private Node<E> lastReturned;
    //Indicates the next node to be traversed;
    private Node<E> next;
    // Represents the subscript of the next node to be traversed, which is the subscript of the successor node of the current node;
    private int nextIndex;
    // Indicates the current traversal expected modification count value, which is used to compare with LinkedList's modCount to determine whether the linked list has been modified by other threads.
    private int expectedModCount = modCount;
    …………
}
```

Below we introduce the core methods in the iterator `ListItr` in detail.

Let’s first look at the iteration from beginning to end:

```java
// Determine whether there is a next node
public boolean hasNext() {
    // Determine whether the subscript of the next node is smaller than the size of the linked list. If so, it means there is another element that can be traversed.
    return nextIndex < size;
}
// Get the next node
public E next() {
    // Check whether the linked list has been modified during the iteration process
    checkForCommodification();
    // Determine whether there is another node that can be traversed, if not, throw NoSuchElementException exception
    if (!hasNext())
        throw new NoSuchElementException();
    // Point lastReturned to the current node
    lastReturned = next;
    // Point next to the next node
    next = next.next;
    nextIndex++;
    return lastReturned.item;
}
```

Let’s take a look at the iteration from tail to head:

```java
// Determine whether there is still a previous node
public boolean hasPrevious() {
    return nextIndex > 0;
}

// Get the previous node
public E previous() {
    // Check whether the linked list has been modified during the iteration process
    checkForCommodification();
    // If there is no previous node, throw an exception
    if (!hasPrevious())
        throw new NoSuchElementException();
    // Point lastReturned and next pointers to the previous node
    lastReturned = next = (next == null) ? last : next.prev;
    nextIndex--;
    return lastReturned.item;
}
```

If you need to delete or insert elements, you can also use iterators.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add(null);
list.add("banana");

// The removeIf method of the Collection interface is still based on iterators.
list.removeIf(Objects::isNull);

for (String fruit : list) {
    System.out.println(fruit);
}
```

The method for removing elements corresponding to the iterator is as follows:

```java
//Remove the last returned element from the list
public void remove() {
    // Check whether the linked list has been modified during the iteration process
    checkForCommodification();
    // If the last returned node is empty, throw an exception
    if (lastReturned == null)
        throw new IllegalStateException();

    // Get the next node of the current node
    Node<E> lastNext = lastReturned.next;
    //Delete the last returned node from the linked list
    unlink(lastReturned);
    //Modify pointer
    if (next == lastReturned)
        next = lastNext;
    else
        nextIndex--;
    // Set the last returned node reference to null to facilitate GC recycling
    lastReturned = null;
    expectedModCount++;
}
```

## LinkedList common method testing

Code:

```java
//Create LinkedList object
LinkedList<String> list = new LinkedList<>();

//Add element to the end of the linked list
list.add("apple");
list.add("banana");
list.add("pear");
System.out.println("Contents of linked list: " + list);

//Insert element at specified position
list.add(1, "orange");
System.out.println("List content: " + list);

// Get the element at the specified position
String fruit = list.get(2);
System.out.println("Element with index 2: " + fruit);

//Modify the element at the specified position
list.set(3, "grape");
System.out.println("Contents of linked list: " + list);

//Delete the element at the specified position
list.remove(0);
System.out.println("Contents of linked list: " + list);

//Delete the first occurrence of the specified element
list.remove("banana");
System.out.println("Contents of linked list: " + list);

// Get the length of the linked list
int size = list.size();
System.out.println("List length: " + size);

// Clear the linked list
list.clear();
System.out.println("Cleared linked list: " + list);
```

Output:

```plain
Element with index 2: banana
Linked list content: [apple, orange, banana, grape]
Linked list content: [orange, banana, grape]
Linked list content: [orange, grape]
List length: 2
Cleared linked list: []
```

<!-- @include: @article-footer.snippet.md -->