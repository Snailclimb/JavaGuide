---
title: LinkedList 源码分析
category: Java
tag:
  - Java集合
---

## LinkedList 简介

`LinkedList` 是一个基于双向链表实现的集合类，经常被拿来和 `ArrayList` 做比较。关于 `LinkedList` 和`ArrayList`的详细对比，我们 [Java集合常见面试题总结(上)](./java-collection-questions-01.md)有详细介绍到。

![双向链表](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

不过，我们在项目中一般是不会使用到 `LinkedList` 的，需要用到 `LinkedList` 的场景几乎都可以使用 `ArrayList` 来代替，并且，性能通常会更好！就连 `LinkedList` 的作者约书亚 · 布洛克（Josh Bloch）自己都说从来不会使用 `LinkedList` 。

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

另外，不要下意识地认为 `LinkedList` 作为链表就最适合元素增删的场景。我在上面也说了，`LinkedList` 仅仅在头尾插入或者删除元素的时候时间复杂度近似 O(1)，其他情况增删元素的平均时间复杂度都是 O(n) 。

### LinkedList 插入和删除元素的时间复杂度？

- 头部插入/删除：只需要修改头结点的指针即可完成插入/删除操作，因此时间复杂度为 O(1)。
- 尾部插入/删除：只需要修改尾结点的指针即可完成插入/删除操作，因此时间复杂度为 O(1)。
- 指定位置插入/删除：需要先移动到指定位置，再修改指定节点的指针完成插入/删除，因此需要移动平均 n/2 个元素，时间复杂度为 O(n)。

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
- `add(int index, E element)`:用于在指定位置插入元素。这种插入方式需要先移动到指定位置，再修改指定节点的指针完成插入/删除，因此需要移动平均 n/2 个元素，时间复杂度为 O(n)。

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
    // 判断尾节点是否为空，为空表示当前链表还没有节点
    if (pred == null)
        first = newNode;
    else
        // succ 节点前驱的后继引用指向新节点
        pred.next = newNode;
    size++;
    modCount++;
}
```

### 获取元素

`LinkedList`获取元素相关的方法一共有 3 个：

1. `getFirst()`：获取链表的第一个元素。
2. `getLast()`：获取链表的最后一个元素。
3. `get(int index)`：获取链表指定位置的元素。

```java
// 获取链表的第一个元素
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}

// 获取链表的最后一个元素
public E getLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}

// 获取链表指定位置的元素
public E get(int index) {
  // 下标越界检查，如果越界就抛异常
  checkElementIndex(index);
  // 返回链表中对应下标的元素
  return node(index).item;
}
```

这里的核心在于 `node(int index)` 这个方法：

```java
// 返回指定下标的非空节点
Node<E> node(int index) {
    // 断言下标未越界
    // assert isElementIndex(index);
    // 如果index小于size的二分之一  从前开始查找（向后查找）  反之向前查找
    if (index < (size >> 1)) {
        Node<E> x = first;
        // 遍历，循环向后查找，直至 i == index
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

`get(int index)` 或 `remove(int index)` 等方法内部都调用了该方法来获取对应的节点。

从这个方法的源码可以看出，该方法通过比较索引值与链表 size 的一半大小来确定从链表头还是尾开始遍历。如果索引值小于 size 的一半，就从链表头开始遍历，反之从链表尾开始遍历。这样可以在较短的时间内找到目标节点，充分利用了双向链表的特性来提高效率。

### 删除元素

`LinkedList`删除元素相关的方法一共有 5 个：

1. `removeFirst()`：删除并返回链表的第一个元素。
2. `removeLast()`：删除并返回链表的最后一个元素。
3. `remove(E e)`：删除链表中首次出现的指定元素，如果不存在该元素则返回 false。
4. `remove(int index)`：删除指定索引处的元素，并返回该元素的值。
5. `void clear()`：移除此链表中的所有元素。

```java
// 删除并返回链表的第一个元素
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

// 删除并返回链表的最后一个元素
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

// 删除链表中首次出现的指定元素，如果不存在该元素则返回 fals
public boolean remove(Object o) {
    // 如果指定元素为 null，遍历链表找到第一个为 null 的元素进行删除
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        // 如果不为 null ,遍历链表找到要删除的节点
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

// 删除链表指定位置的元素
public E remove(int index) {
    // 下标越界检查，如果越界就抛异常
    checkElementIndex(index);
    return unlink(node(index));
}
```

这里的核心在于 `unlink(Node<E> x)` 这个方法：

```java
E unlink(Node<E> x) {
    // 断言 x 不为 null
    // assert x != null;
    // 获取当前节点（也就是待删除节点）的元素
    final E element = x.item;
    // 获取当前节点的下一个节点
    final Node<E> next = x.next;
    // 获取当前节点的前一个节点
    final Node<E> prev = x.prev;

    // 如果前一个节点为空，则说明当前节点是头节点
    if (prev == null) {
        // 直接让链表头指向当前节点的下一个节点
        first = next;
    } else { // 如果前一个节点不为空
        // 将前一个节点的 next 指针指向当前节点的下一个节点
        prev.next = next;
        // 将当前节点的 prev 指针置为 null，，方便 GC 回收
        x.prev = null;
    }

    // 如果下一个节点为空，则说明当前节点是尾节点
    if (next == null) {
        // 直接让链表尾指向当前节点的前一个节点
        last = prev;
    } else { // 如果下一个节点不为空
        // 将下一个节点的 prev 指针指向当前节点的前一个节点
        next.prev = prev;
        // 将当前节点的 next 指针置为 null，方便 GC 回收
        x.next = null;
    }

    // 将当前节点元素置为 null，方便 GC 回收
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

`unlink()` 方法的逻辑如下：

1. 首先获取待删除节点 x 的前驱和后继节点；
2. 判断待删除节点是否为头节点或尾节点：
   - 如果 x 是头节点，则将 first 指向 x 的后继节点 next
   - 如果 x 是尾节点，则将 last 指向 x 的前驱节点 prev
   - 如果 x 不是头节点也不是尾节点，执行下一步操作
3. 将待删除节点 x 的前驱的后继指向待删除节点的后继 next，断开 x 和 x.prev 之间的链接；
4. 将待删除节点 x 的后继的前驱指向待删除节点的前驱 prev，断开 x 和 x.next 之间的链接；
5. 将待删除节点 x 的元素置空，修改链表长度。

可以参考下图理解（图源：[LinkedList 源码分析(JDK 1.8)](https://www.tianxiaobo.com/2018/01/31/LinkedList-%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-JDK-1-8/)）：

![unlink 方法逻辑](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)

### 遍历链表

推荐使用`for-each` 循环来遍历 `LinkedList` 中的元素， `for-each` 循环最终会转换成迭代器形式。

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add("banana");
list.add("pear");

for (String fruit : list) {
    System.out.println(fruit);
}
```

`LinkedList` 的遍历的核心就是它的迭代器的实现。

```java
// 双向迭代器
private class ListItr implements ListIterator<E> {
    // 表示上一次调用 next() 或 previous() 方法时经过的节点；
    private Node<E> lastReturned;
    // 表示下一个要遍历的节点；
    private Node<E> next;
    // 表示下一个要遍历的节点的下标，也就是当前节点的后继节点的下标；
    private int nextIndex;
    // 表示当前遍历期望的修改计数值，用于和 LinkedList 的 modCount 比较，判断链表是否被其他线程修改过。
    private int expectedModCount = modCount;
    …………
}
```

下面我们对迭代器 `ListItr` 中的核心方法进行详细介绍。

我们先来看下从头到尾方向的迭代：

```java
// 判断还有没有下一个节点
public boolean hasNext() {
    // 判断下一个节点的下标是否小于链表的大小，如果是则表示还有下一个元素可以遍历
    return nextIndex < size;
}
// 获取下一个节点
public E next() {
    // 检查在迭代过程中链表是否被修改过
    checkForComodification();
    // 判断是否还有下一个节点可以遍历，如果没有则抛出 NoSuchElementException 异常
    if (!hasNext())
        throw new NoSuchElementException();
    // 将 lastReturned 指向当前节点
    lastReturned = next;
    // 将 next 指向下一个节点
    next = next.next;
    nextIndex++;
    return lastReturned.item;
}
```

再来看一下从尾到头方向的迭代：

```java
// 判断是否还有前一个节点
public boolean hasPrevious() {
    return nextIndex > 0;
}

// 获取前一个节点
public E previous() {
    // 检查是否在迭代过程中链表被修改
    checkForComodification();
    // 如果没有前一个节点，则抛出异常
    if (!hasPrevious())
        throw new NoSuchElementException();
    // 将 lastReturned 和 next 指针指向上一个节点
    lastReturned = next = (next == null) ? last : next.prev;
    nextIndex--;
    return lastReturned.item;
}
```

如果需要删除或插入元素，也可以使用迭代器进行操作。

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add(null);
list.add("banana");

//  Collection 接口的 removeIf 方法底层依然是基于迭代器
list.removeIf(Objects::isNull);

for (String fruit : list) {
    System.out.println(fruit);
}
```

迭代器对应的移除元素的方法如下：

```java
// 从列表中删除上次被返回的元素
public void remove() {
    // 检查是否在迭代过程中链表被修改
    checkForComodification();
    // 如果上次返回的节点为空，则抛出异常
    if (lastReturned == null)
        throw new IllegalStateException();

    // 获取当前节点的下一个节点
    Node<E> lastNext = lastReturned.next;
    // 从链表中删除上次返回的节点
    unlink(lastReturned);
    // 修改指针
    if (next == lastReturned)
        next = lastNext;
    else
        nextIndex--;
    // 将上次返回的节点引用置为 null，方便 GC 回收
    lastReturned = null;
    expectedModCount++;
}
```

## LinkedList 常用方法测试

代码：

```java
// 创建 LinkedList 对象
LinkedList<String> list = new LinkedList<>();

// 添加元素到链表末尾
list.add("apple");
list.add("banana");
list.add("pear");
System.out.println("链表内容：" + list);

// 在指定位置插入元素
list.add(1, "orange");
System.out.println("链表内容：" + list);

// 获取指定位置的元素
String fruit = list.get(2);
System.out.println("索引为 2 的元素：" + fruit);

// 修改指定位置的元素
list.set(3, "grape");
System.out.println("链表内容：" + list);

// 删除指定位置的元素
list.remove(0);
System.out.println("链表内容：" + list);

// 删除第一个出现的指定元素
list.remove("banana");
System.out.println("链表内容：" + list);

// 获取链表的长度
int size = list.size();
System.out.println("链表长度：" + size);

// 清空链表
list.clear();
System.out.println("清空后的链表：" + list);
```

输出：

```
索引为 2 的元素：banana
链表内容：[apple, orange, banana, grape]
链表内容：[orange, banana, grape]
链表内容：[orange, grape]
链表长度：2
清空后的链表：[]
```