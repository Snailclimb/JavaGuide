---
title: Summary of common interview questions about Java collections (Part 2)
category: Java
tag:
  - Java collections
head:
  - - meta
    - name: keywords
      content: HashMap,ConcurrentHashMap,Hashtable,List,Set
  - - meta
    - name: description
      content: Java collects common knowledge points and a summary of interview questions. I hope it will be helpful to you!
---

<!-- @include: @article-header.snippet.md -->

## Map (important)

### ⭐️The difference between HashMap and Hashtable

- **Thread safety:** `HashMap` is not thread-safe, `Hashtable` is thread-safe, because the internal methods of `Hashtable` are basically modified with `synchronized`. (If you want to ensure thread safety, use `ConcurrentHashMap`!);
- **Efficiency:** Because of thread safety issues, `HashMap` is slightly more efficient than `Hashtable`. In addition, `Hashtable` is basically obsolete, do not use it in your code;
- **Support for Null key and Null value:** `HashMap` can store null keys and values, but there can only be one null as a key and multiple null as a value; Hashtable does not allow null keys and null values, otherwise a `NullPointerException` will be thrown.
- **The difference between the initial capacity size and each expansion capacity size:** ① If the initial capacity value is not specified when creating, the default initial size of `Hashtable` is 11, and each time it is expanded thereafter, the capacity becomes the original 2n+1. The default initialization size of `HashMap` is 16. Each subsequent expansion will double the capacity. ② If the initial value of the capacity is given when creating, then `Hashtable` will directly use the size you gave, and `HashMap` will expand it to a power of 2 (guaranteed by the `tableSizeFor()` method in `HashMap`, the source code is given below). In other words, `HashMap` always uses the power of 2 as the size of the hash table. Why it is a power of 2 will be introduced later.
- **Underlying data structure:** `HashMap` after JDK1.8 has undergone major changes in resolving hash conflicts. When the length of the linked list is greater than the threshold (default is 8), the linked list will be converted into a red-black tree (before converting the linked list into a red-black tree, it will be judged if the length of the current array is less than 64, then it will choose to expand the array first instead of converting to a red-black tree) to reduce the search time (I will analyze this process in conjunction with the source code later). `Hashtable` has no such mechanism.
- **Hash function implementation**: `HashMap` perturbs the hash value with a mix of high and low bits to reduce collisions, while `Hashtable` uses the `hashCode()` value of the key directly.

**Constructor with initial capacity in `HashMap`:**

```java
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }
     public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }
```

The following method ensures that `HashMap` always uses a power of 2 as the size of the hash table.

```java
/**
 * Returns a power of two size for the given target capacity.
 */
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

### The difference between HashMap and HashSet

If you have seen the source code of `HashSet`, you should know: the bottom layer of `HashSet` is implemented based on `HashMap`. (The source code of `HashSet` is very, very small, because except for `clone()`, `writeObject()`, and `readObject()` which `HashSet` itself has to implement, other methods directly call the methods in `HashMap`.

| `HashMap` | `HashSet` |
| :----------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: |
| Implemented the `Map` interface | Implemented the `Set` interface |
| Store key-value pairs | Store only objects |
| Call `put()` to add elements to map | Call `add()` method to add elements to `Set` |
| `HashMap` uses keys to calculate `hashcode` | `HashSet` uses member objects to calculate `hashcode` values. `hashcode` may be the same for two objects, so the `equals()` method is used to determine the equality of objects |

### ⭐️The difference between HashMap and TreeMap

Both `TreeMap` and `HashMap` inherit from `AbstractMap`, but it should be noted that `TreeMap` also implements the `NavigableMap` interface and the `SortedMap` interface.

![TreeMap inheritance diagram](https://oss.javaguide.cn/github/javaguide/java/collection/treemap_hierarchy.png)

Implementing the `NavigableMap` interface gives `TreeMap` the ability to search for elements within the collection.

The `NavigableMap` interface provides rich methods to explore and manipulate key-value pairs:

1. **Directed Search**: Methods such as `ceilingEntry()`, `floorEntry()`, `higherEntry()` and `lowerEntry()` can be used to locate the closest key-value pairs that are greater than or equal to, less than or equal to, strictly greater than, or strictly less than a given key.2. **Subset operation**: The `subMap()`, `headMap()` and `tailMap()` methods can efficiently create a subset view of the original collection without copying the entire collection.
3. **Reverse order view**: The `descendingMap()` method returns a `NavigableMap` view in reverse order, allowing the entire `TreeMap` to be iterated in reverse order.
4. **Boundary operations**: Methods such as `firstEntry()`, `lastEntry()`, `pollFirstEntry()` and `pollLastEntry()` can easily access and remove elements.

These methods are implemented based on the properties of the red-black tree data structure. The red-black tree maintains a balanced state, thus ensuring that the time complexity of the search operation is O(log n). This makes `TreeMap` a powerful tool for dealing with ordered set search problems.

Implementing the `SortedMap` interface gives `TreeMap` the ability to sort elements in a collection based on keys. The default is to sort by key in ascending order, but we can also specify a comparator for sorting. The sample code is as follows:

```java
/**
 * @author shuang.kou
 * @createTime June 15, 2020 17:02:00
 */
public class Person {
    private Integer age;

    public Person(Integer age) {
        this.age = age;
    }

    public Integer getAge() {
        return age;
    }


    public static void main(String[] args) {
        TreeMap<Person, String> treeMap = new TreeMap<>(new Comparator<Person>() {
            @Override
            public int compare(Person person1, Person person2) {
                int num = person1.getAge() - person2.getAge();
                return Integer.compare(num, 0);
            }
        });
        treeMap.put(new Person(3), "person1");
        treeMap.put(new Person(18), "person2");
        treeMap.put(new Person(35), "person3");
        treeMap.put(new Person(16), "person4");
        treeMap.entrySet().stream().forEach(personStringEntry -> {
            System.out.println(personStringEntry.getValue());
        });
    }
}
```

Output:

```plain
person1
person4
person2
person3
```

It can be seen that the elements in `TreeMap` are already arranged in ascending order according to the age field of `Person`.

Above, we implemented it by passing in an anonymous inner class. You can replace the code with a Lambda expression implementation:

```java
TreeMap<Person, String> treeMap = new TreeMap<>((person1, person2) -> {
  int num = person1.getAge() - person2.getAge();
  return Integer.compare(num, 0);
});
```

**In summary, compared to `HashMap`, `TreeMap` mainly has the ability to sort the elements in the collection according to keys and the ability to search for elements in the collection. **

### How to check duplicates in HashSet?

The following content is excerpted from the second edition of my Java enlightenment book "Head first java":

> When you add an object to `HashSet`, `HashSet` will first calculate the `hashcode` value of the object to determine the location where the object is added. It will also compare it with the `hashcode` values of other added objects. If there is no matching `hashcode`, `HashSet` will assume that the object does not appear repeatedly. But if objects with the same `hashcode` value are found, the `equals()` method will be called to check whether the objects with equal `hashcode` are really the same. If the two are the same, `HashSet` will not let the join operation succeed.

In JDK1.8, the `add()` method of `HashSet` simply calls the `put()` method of `HashMap`, and checks the return value to ensure whether there are duplicate elements. Take a look directly at the source code in `HashSet`:

```java
// Returns: true if this set did not already contain the specified element
//Return value: Returns true when there is no element containing add in the set
public boolean add(E e) {
        return map.put(e, PRESENT)==null;
}
```

The following description can also be seen in the `putVal()` method of `HashMap`:

```java
// Returns: previous value, or null if none
//Return value: If there is no element at the insertion position, return null, otherwise return the previous element
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
...
}
```

That is to say, in JDK1.8, no matter whether an element already exists in `HashSet`, `HashSet` will be inserted directly, but the return value of the `add()` method will tell us whether the same element exists before insertion.

### ⭐️The underlying implementation of HashMap

#### Before JDK1.8

Before JDK1.8, the bottom layer of `HashMap` was **array and linked list**, which were used together to form **linked list hash**. HashMap obtains the hash value through the `hashcode` of the key after being processed by the perturbation function, and then uses `(n - 1) & hash` to determine the location where the current element is stored (n here refers to the length of the array). If there is an element at the current location, it is determined whether the hash value and key of the element and the element to be stored are the same. If they are the same, they will be overwritten directly. If they are not the same, the conflict will be resolved through the zipper method.

The perturbation function (`hash` method) in `HashMap` is used to optimize the distribution of hash values. By performing additional processing on the original `hashCode()`, the perturbation function can reduce collisions caused by poor `hashCode()` implementation, thereby improving the uniformity of the data distribution.

**JDK 1.8 HashMap’s hash method source code:**

The hash method of JDK 1.8 is more simplified than the hash method of JDK 1.7, but the principle remains the same.

```java
    static final int hash(Object key) {
      int h;
      // key.hashCode(): Returns the hash value, which is hashcode
      // ^: bitwise XOR
      // >>>: unsigned right shift, ignore the sign bit, fill the empty bits with 0
      return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
  }
```

Compare the hash method source code of JDK1.7's HashMap.

```java
static int hash(int h) {
    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).

    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}
```

Compared with the hash method of JDK1.8, the performance of the hash method of JDK 1.7 will be slightly worse, because after all, it is disturbed 4 times.

The so-called **"zipper method"** is: combining linked lists and arrays. That is to say, create a linked list array, and each cell in the array is a linked list. If a hash conflict is encountered, just add the conflicting value to the linked list.

![Internal structure before jdk1.8-HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

#### After JDK1.8相比于之前的版本， JDK1.8 之后在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为 8）（将链表转换成红黑树前会判断，如果当前数组的长度小于 64，那么会选择先进行数组扩容，而不是转换为红黑树）时，将链表转化为红黑树。

这样做的目的是减少搜索时间：链表的查询效率为 O(n)（n 是链表的长度），红黑树是一种自平衡二叉搜索树，其查询效率为 O(log n)。当链表较短时，O(n) 和 O(log n) 的性能差异不明显。但当链表变长时，查询性能会显著下降。

![jdk1.8之后的内部结构-HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.8_hashmap.png)

**为什么优先扩容而非直接转为红黑树？**

数组扩容能减少哈希冲突的发生概率（即将元素重新分散到新的、更大的数组中），这在多数情况下比直接转换为红黑树更高效。

红黑树需要保持自平衡，维护成本较高。并且，过早引入红黑树反而会增加复杂度。

**为什么选择阈值 8 和 64？**

1. 泊松分布表明，链表长度达到 8 的概率极低（小于千万分之一）。在绝大多数情况下，链表长度都不会超过 8。阈值设置为 8，可以保证性能和空间效率的平衡。
2. 数组长度阈值 64 同样是经过实践验证的经验值。在小数组中扩容成本低，优先扩容可以避免过早引入红黑树。数组大小达到 64 时，冲突概率较高，此时红黑树的性能优势开始显现。

> TreeMap、TreeSet 以及 JDK1.8 之后的 HashMap 底层都用到了红黑树。红黑树就是为了解决二叉查找树的缺陷，因为二叉查找树在某些情况下会退化成一个线性结构。

我们来结合源码分析一下 `HashMap` 链表到红黑树的转换。

**1、 `putVal` 方法中执行链表转红黑树的判断逻辑。**

链表的长度大于 8 的时候，就执行 `treeifyBin` （转换红黑树）的逻辑。

```java
// 遍历链表
for (int binCount = 0; ; ++binCount) {
    // 遍历到链表最后一个节点
    if ((e = p.next) == null) {
        p.next = newNode(hash, key, value, null);
        // 如果链表元素个数大于TREEIFY_THRESHOLD（8）
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            // 红黑树转换（并不会直接转换成红黑树）
            treeifyBin(tab, hash);
        break;
    }
    if (e.hash == hash &&
        ((k = e.key) == key || (key != null && key.equals(k))))
        break;
    p = e;
}
```

**2、`treeifyBin` 方法中判断是否真的转换为红黑树。**

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    // 判断当前数组的长度是否小于 64
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        // 如果当前数组的长度小于 64，那么会选择先进行数组扩容
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        // 否则才将列表转换为红黑树

        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

将链表转换成红黑树前会判断，如果当前数组的长度小于 64，那么会选择先进行数组扩容，而不是转换为红黑树。

### ⭐️HashMap 的长度为什么是 2 的幂次方

为了让 `HashMap` 存取高效并减少碰撞，我们需要确保数据尽量均匀分布。哈希值在 Java 中通常使用 `int` 表示，其范围是 `-2147483648 ~ 2147483647`前后加起来大概 40 亿的映射空间，只要哈希函数映射得比较均匀松散，一般应用是很难出现碰撞的。但是，问题是一个 40 亿长度的数组，内存是放不下的。所以，这个散列值是不能直接拿来用的。用之前还要先做对数组的长度取模运算，得到的余数才能用来要存放的位置也就是对应的数组下标。

**这个算法应该如何设计呢？**

我们首先可能会想到采用 % 取余的操作来实现。但是，重点来了：“**取余(%)操作中如果除数是 2 的幂次则等价于与其除数减一的与(&)操作**（也就是说 `hash%length==hash&(length-1)` 的前提是 length 是 2 的 n 次方）。” 并且，**采用二进制位操作 & 相对于 % 能够提高运算效率**。

除了上面所说的位运算比取余效率高之外，我觉得更重要的一个原因是：**长度是 2 的幂次方，可以让 `HashMap` 在扩容的时候更均匀**。例如:

- length = 8 时，length - 1 = 7 的二进制位`0111`
- length = 16 时，length - 1 = 15 的二进制位`1111`

这时候原本存在 `HashMap` 中的元素计算新的数组位置时 `hash&(length-1)`，取决 hash 的第四个二进制位（从右数），会出现两种情况：

1. 第四个二进制位为 0，数组位置不变，也就是说当前元素在新数组和旧数组的位置相同。
2. 第四个二进制位为 1，数组位置在新数组扩容之后的那一部分。

这里列举一个例子：

```plain
假设有一个元素的哈希值为 10101100

旧数组元素位置计算：
hash        = 10101100
length - 1  = 00000111
& -----------------
index       = 00000100  (4)

新数组元素位置计算：
hash        = 10101100
length - 1  = 00001111
& -----------------
index       = 00001100  (12)

看第四位（从右数）：
1.高位为 0：位置不变。
2.高位为 1：移动到新位置（原索引位置+原容量）。
```

⚠️注意：这里列举的场景看的是第四个二进制位，更准确点来说看的是高位（从右数），例如 `length = 32` 时，`length - 1 = 31`，二进制为 `11111`，这里看的就是第五个二进制位。

也就是说扩容之后，在旧数组元素 hash 值比较均匀（至于 hash 值均不均匀，取决于前面讲的对象的 `hashcode()` 方法和扰动函数）的情况下，新数组元素也会被分配的比较均匀，最好的情况是会有一半在新数组的前半部分，一半在新数组后半部分。

这样也使得扩容机制变得简单和高效，扩容后只需检查哈希值高位的变化来决定元素的新位置，要么位置不变（高位为 0），要么就是移动到新位置（高位为 1，原索引位置+原容量）。

最后，简单总结一下 `HashMap` 的长度是 2 的幂次方的原因：

1. 位运算效率更高：位运算(&)比取余运算(%)更高效。当长度为 2 的幂次方时，`hash % length` 等价于 `hash & (length - 1)`。
2. 可以更好地保证哈希值的均匀分布：扩容之后，在旧数组元素 hash 值比较均匀的情况下，新数组元素也会被分配的比较均匀，最好的情况是会有一半在新数组的前半部分，一半在新数组后半部分。
3. 扩容机制变得简单和高效：扩容后只需检查哈希值高位的变化来决定元素的新位置，要么位置不变（高位为 0），要么就是移动到新位置（高位为 1，原索引位置+原容量）。

### ⭐️HashMap 多线程操作导致死循环问题

The expansion operation of `HashMap` in JDK1.7 and previous versions may have an infinite loop problem in a multi-threaded environment. This is because when there are multiple elements in a bucket that need to be expanded, multiple threads operate on the linked list at the same time, and the head insertion method may cause the nodes in the linked list to point to the wrong location, thus forming a circular linked list, which will cause the operation of querying elements to fall into an infinite loop and cannot be ended.

In order to solve this problem, the JDK1.8 version of HashMap uses the tail insertion method instead of the head insertion method to avoid the inversion of the linked list, so that the inserted node is always placed at the end of the linked list, avoiding the ring structure in the linked list. However, it is still not recommended to use `HashMap` under multi-threading, because using `HashMap` under multi-threading will still cause data overwriting problems. In a concurrent environment, it is recommended to use `ConcurrentHashMap`.

Generally, this introduction is enough in an interview. There is no need to remember various details, and I personally don’t think it is necessary to remember them. If you want to learn more about the infinite loop problem caused by `HashMap` expansion, you can read this article by Uncle Mouse: [The infinite loop of Java HashMap](https://coolshell.cn/articles/9606.html).

### ⭐️Why is HashMap thread-unsafe?

`HashMap` is not thread-safe. Concurrent write operations to `HashMap` in a multi-threaded environment may cause two main problems:

1. **Data Loss**: Concurrent `put` operations may cause one thread's writes to be overwritten by another thread.
2. **Infinite Loop**: In JDK 7 and previous versions, during concurrent expansion, the head insertion method may cause the linked list to form a loop, thus triggering an infinite loop during the `get` operation, and the CPU soars to 100%.

Data loss exists in both JDK1.7 and JDK 1.8. Here we take JDK 1.8 as an example.

After JDK 1.8, in `HashMap`, multiple key-value pairs may be allocated to the same bucket and stored in the form of a linked list or a red-black tree. The `put` operation of `HashMap` by multiple threads will lead to thread insecurity, specifically there is a risk of data overwriting.

For example:

- Two threads 1 and 2 perform put operations at the same time, and a hash conflict occurs (the insertion index calculated by the hash function is the same).
- Different threads may get CPU execution opportunities in different time slices. After the current thread 1 completes the hash conflict judgment, it hangs due to the exhaustion of the time slice. Thread 2 completed the insert operation first.
- Subsequently, Thread 1 obtains the time slice. Since the hash collision has been judged before, it will be inserted directly at this time. This causes the data inserted by Thread 2 to be overwritten by Thread 1.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    // Determine whether hash collision occurs
    // (n - 1) & hash determines which bucket the element is stored in. If the bucket is empty, the newly generated node is placed in the bucket (at this time, the node is placed in the array)
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    // Elements already exist in the bucket (handling hash conflicts)
    else {
    // ...
}
```

Another situation is that the two threads perform `put` operations at the same time, causing the value of `size` to be incorrect, which in turn leads to data overwriting problems:

1. When thread 1 executes the `if(++size > threshold)` judgment, assuming that the value of `size` is 10, it hangs due to the exhaustion of the time slice.
2. Thread 2 also performs the `if(++size > threshold)` judgment, obtains the value of `size` which is also 10, inserts the element into the bucket, and updates the value of `size` to 11.
3. Subsequently, thread 1 gets the time slice, it also puts the element into the bucket and updates the value of size to 11.
4. Threads 1 and 2 both performed a `put` operation, but the value of `size` only increased by 1, which resulted in only one element actually being added to the `HashMap`.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    //If the actual size is greater than the threshold, expand the capacity
    if (++size > threshold)
        resize();
    // Callback after insertion
    afterNodeInsertion(evict);
    return null;
}
```

### Common traversal methods of HashMap?

[7 traversal methods and performance analysis of HashMap! ](https://mp.weixin.qq.com/s/zQBN3UvJDhRTKP6SzcZFKw)

**🐛 Correction (see: [issue#1411](https://github.com/Snailclimb/JavaGuide/issues/1411))**:

This article has an incorrect performance analysis of the parallelStream traversal method. Let me start with the conclusion: **parallelStream has the highest performance when blocking exists, and parallelStream has the lowest performance when non-blocking**.

When there is no blocking in the traversal, the performance of parallelStream is the lowest:

```plain
Benchmark Mode Cnt Score Error Units
Test.entrySet avgt 5 288.651 ± 10.536 ns/op
Test.keySet avgt 5 584.594 ± 21.431 ns/op
Test.lambda avgt 5 221.791 ± 10.198 ns/op
Test.parallelStream avgt 5 6919.163 ± 1116.139 ns/op
```

After adding the blocking code `Thread.sleep(10)`, the performance of parallelStream is the highest:

```plain
Benchmark Mode Cnt Score Error Units
Test.entrySet avgt 5 1554828440.000 ± 23657748.653 ns/op
Test.keySet avgt 5 1550612500.000 ± 6474562.858 ns/op
Test.lambda avgt 5 1551065180.000 ± 19164407.426 ns/op
Test.parallelStream avgt 5 186345456.667 ± 3210435.590 ns/op
```

### ⭐️The difference between ConcurrentHashMap and Hashtable

The difference between `ConcurrentHashMap` and `Hashtable` is mainly reflected in the different ways to achieve thread safety.

- **Underlying data structure:** The bottom layer of `ConcurrentHashMap` of JDK1.7 is implemented by **segmented array + linked list**. The data structure used in JDK1.8 is the same as the structure of `HashMap`, array + linked list/red-black binary tree. The underlying data structure of `Hashtable` and `HashMap` before JDK1.8 is similar to the form of **array + linked list**. The array is the main body of HashMap, and the linked list mainly exists to solve hash conflicts;
- **Way to implement thread safety (important):**
  - In JDK1.7, `ConcurrentHashMap` divided the entire bucket array into segments (`Segment`, segment lock). Each lock only locks a part of the data in the container (schematic diagram below). When multiple threads access data in different data segments in the container, there will be no lock competition and the concurrent access rate will be improved.
  - By the time of JDK1.8, `ConcurrentHashMap` has abandoned the concept of `Segment`, but directly uses the data structure of `Node` array + linked list + red-black tree. Concurrency control uses `synchronized` and CAS to operate. (After JDK1.6, the `synchronized` lock has been optimized a lot) The whole thing looks like an optimized and thread-safe `HashMap`. Although the `Segment` data structure can still be seen in JDK1.8, the attributes have been simplified just to be compatible with older versions;- **`Hashtable`(same lock)**: Using `synchronized` to ensure thread safety is very inefficient. When one thread accesses a synchronized method, other threads also access the synchronized method and may enter a blocking or polling state. For example, if put is used to add elements, another thread cannot use put to add elements, nor can it use get. The competition will become more and more fierce and the efficiency will be lower.

Next, let’s take a look at the comparison chart of the underlying data structures of the two.

**Hashtable** :

![Internal structure of Hashtable](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.cnblogs.com/chengxiao/p/6842045.html></p>

**ConcurrentHashMap** of JDK1.7:

![Java7 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

`ConcurrentHashMap` is composed of `Segment` array structure and `HashEntry` array structure.

Each element in the `Segment` array contains a `HashEntry` array, and each `HashEntry` array belongs to a linked list structure.

**ConcurrentHashMap** of JDK1.8:

![Java8 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

JDK1.8's `ConcurrentHashMap` is no longer **Segment array + HashEntry array + linked list**, but **Node array + linked list/red-black tree**. However, Node can only be used in the case of linked lists. In the case of red-black trees, **`TreeNode`** needs to be used. When the conflicting linked list reaches a certain length, the linked list will be converted into a red-black tree.

`TreeNode` stores red-black tree nodes and is wrapped by `TreeBin`. `TreeBin` maintains the root node of the red-black tree through the `root` attribute, because when the red-black tree is rotating, the root node may be replaced by its original child node. At this point in time, if other threads want to write this red-black tree, thread unsafety problems will occur, so in `ConcurrentHashMap` `TreeBin` maintains the thread currently using this red-black tree through the `waiter` attribute to prevent other threads from entering.

```java
static final class TreeBin<K,V> extends Node<K,V> {
        TreeNode<K,V> root;
        volatile TreeNode<K,V> first;
        volatile Thread waiter;
        volatile int lockState;
        // values for lockState
        static final int WRITER = 1; // set while holding write lock
        static final int WAITER = 2; // set when waiting for write lock
        static final int READER = 4; // increment value for setting read lock
...
}
```

### ⭐️ConcurrentHashMap thread-safe specific implementation/lower-level implementation

#### Before JDK1.8

![Java7 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

First, the data is divided into segments (this "segment" is `Segment`) for storage, and then each segment of data is assigned a lock. When a thread occupies the lock to access one segment of data, the data of other segments can also be accessed by other threads.

**`ConcurrentHashMap` is composed of `Segment` array structure and `HashEntry` array structure**.

`Segment` inherits `ReentrantLock`, so `Segment` is a reentrant lock and plays the role of a lock. `HashEntry` is used to store key-value pair data.

```java
static class Segment<K,V> extends ReentrantLock implements Serializable {
}
```

A `ConcurrentHashMap` contains an array of `Segment`, and the number of `Segment` cannot be changed once it is initialized. The size of the `Segment` array is 16 by default, which means that it can support concurrent writing by 16 threads at the same time by default.

The structure of `Segment` is similar to `HashMap`. It is an array and linked list structure. A `Segment` contains a `HashEntry` array. Each `HashEntry` is an element of a linked list structure. Each `Segment` guards an element in a `HashEntry` array. When modifying the data of the `HashEntry` array, the corresponding one must first be obtained. `Segment` lock. In other words, concurrent writes to the same `Segment` will be blocked, but writes to different `Segment` can be executed concurrently.

#### After JDK1.8

![Java8 ConcurrentHashMap storage structure](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

Java 8 has almost completely rewritten `ConcurrentHashMap`, and the code size has changed from more than 1000 lines in Java 7 to more than 6000 lines now.

`ConcurrentHashMap` cancels the `Segment` segmentation lock and uses `Node + CAS + synchronized` to ensure concurrency safety. The data structure is similar to the structure of `HashMap` 1.8, array + linked list/red-black binary tree. Java 8 converts a linked list (addressing time complexity O(N)) into a red-black tree (addressing time complexity O(log(N))) when the length of the linked list exceeds a certain threshold (8).

In Java 8, the lock granularity is finer. `synchronized` only locks the first node of the current linked list or red-black binary tree. In this way, as long as the hash does not conflict, concurrency will not occur and the reading and writing of other Nodes will not be affected, and the efficiency is greatly improved.

### ⭐️What are the differences between the ConcurrentHashMap implementations of JDK 1.7 and JDK 1.8?

- **Thread safety implementation**: JDK 1.7 uses `Segment` segmentation lock to ensure security. `Segment` is inherited from `ReentrantLock`. JDK1.8 abandoned the `Segment` segmented lock design and adopted `Node + CAS + synchronized` to ensure thread safety and finer lock granularity. `synchronized` only locks the first node of the current linked list or red-black binary tree.
- **Hash collision solution**: JDK 1.7 uses the zipper method, and JDK1.8 uses the zipper method combined with red-black trees (when the length of the linked list exceeds a certain threshold, the linked list is converted into a red-black tree).
- **Concurrency**: The maximum concurrency of JDK 1.7 is the number of Segments, and the default is 16. The maximum concurrency in JDK 1.8 is the size of the Node array, and the concurrency is greater.

### ConcurrentHashMap Why key and value cannot be null?

The key and value of `ConcurrentHashMap` cannot be null mainly to avoid ambiguity. null is a special value that means there is no object or no reference. If you use null as a key, then you can't tell whether the key exists in the `ConcurrentHashMap` or whether there is no key at all. Likewise, if you use null as a value, then you can't tell whether the value is actually stored in the `ConcurrentHashMap`, or whether it is returned because the corresponding key cannot be found.

Taking the value of the get method as an example, there are two situations when the returned result is null:

- The value is not in the collection;
- The value itself is null.

This is where the ambiguity comes from.

For details, please refer to [ConcurrentHashMap source code analysis](https://javaguide.cn/java/collection/concurrent-hash-map-source-code.html).

In a multi-threaded environment, when one thread operates the `ConcurrentHashMap`, other threads modify the `ConcurrentHashMap`, so it is impossible to use `containsKey(key)` to determine whether the key-value pair exists, and there is no way to solve the ambiguity problem.In contrast, `HashMap` can store null keys and values, but there can only be one null as a key and multiple null as values. If null is passed as a parameter, the value at the position where the hash value is 0 will be returned. In a single-threaded environment, there is no situation where one thread operates the HashMap and other threads modify the `HashMap`. Therefore, `contains(key)` can be used to determine whether the key-value pair exists, so as to perform corresponding processing, and there is no ambiguity problem.

In other words, it is impossible to correctly determine whether the key-value pair exists in multi-threads (there are modifications by other threads), but it is possible in a single thread (there are no modifications by other threads).

If you really need to use null in a ConcurrentHashMap, you can use a special static empty object instead.

```java
public static final Object NULL = new Object();
```

Finally, let me share the answer of the author of `ConcurrentHashMap` (Doug Lea) to this question:

> The main reason that nulls aren't allowed in ConcurrentMaps (ConcurrentHashMaps, ConcurrentSkipListMaps) is that ambiguities that may be just barely tolerable in non-concurrent maps can't be accommodated. The main one is that if `map.get(key)` returns `null`, you can't detect whether the key explicitly maps to `null` vs the key isn't mapped. In a non-concurrent map, you can check this via `map.contains(key)`, but in a concurrent one, the map might have changed between calls.

After translation, the general meaning is that ambiguity can be tolerated in a single thread, but cannot be tolerated in a multi-threaded environment.

### ⭐️Can ConcurrentHashMap guarantee the atomicity of composite operations?

`ConcurrentHashMap` is thread-safe, which means that it can ensure that when multiple threads read and write it at the same time, there will be no data inconsistency, and it will not cause the infinite loop problem caused by the multi-threaded operation of `HashMap` in JDK1.7 and previous versions. However, this does not mean that it can guarantee that all compound operations are atomic, so don't get confused!

Compound operations refer to operations composed of multiple basic operations (such as `put`, `get`, `remove`, `containsKey`, etc.). For example, first determine whether a key exists `containsKey(key)`, and then insert or update `put(key, value)` based on the result. This operation may be interrupted by other threads during execution, resulting in unexpected results.

For example, there are two threads A and B performing composite operations on `ConcurrentHashMap` at the same time, as follows:

```java
// Thread A
if (!map.containsKey(key)) {
map.put(key, value);
}
// Thread B
if (!map.containsKey(key)) {
map.put(key, anotherValue);
}
```

If the execution order of threads A and B is like this:

1. Thread A determines that key does not exist in the map
2. Thread B determines that the key does not exist in the map
3. Thread B inserts (key, anotherValue) into map
4. Thread A inserts (key, value) into map

Then the final result is (key, value) instead of the expected (key, anotherValue). This is the problem caused by the non-atomicity of composite operations.

**So how to ensure the atomicity of `ConcurrentHashMap` compound operations? **

`ConcurrentHashMap` provides some atomic compound operations, such as `putIfAbsent`, `compute`, `computeIfAbsent`, `computeIfPresent`, `merge`, etc. These methods can accept a function as a parameter, calculate a new value based on the given key and value, and update it to the map.

The above code can be rewritten as:

```java
// Thread A
map.putIfAbsent(key, value);
// Thread B
map.putIfAbsent(key, anotherValue);
```

Or:

```java
// Thread A
map.computeIfAbsent(key, k -> value);
// Thread B
map.computeIfAbsent(key, k -> anotherValue);
```

Many students may say that synchronization can also be locked in this situation! It is indeed possible, but it is not recommended to use the locking synchronization mechanism, which violates the original intention of using `ConcurrentHashMap`. When using `ConcurrentHashMap`, try to use these atomic compound operation methods to ensure atomicity.

## Collections tool class (not important)

**`Collections` common methods of tool classes**:

- Sort
- Find and replace operations
- Synchronization control (not recommended, please consider using the concurrent collection under the JUC package when you need a thread-safe collection type)

### Sorting operation

```java
void reverse(List list)//reverse
void shuffle(List list)//random sorting
void sort(List list)//Sort in ascending order of natural sorting
void sort(List list, Comparator c)//Customized sorting, the sorting logic is controlled by Comparator
void swap(List list, int i, int j)//Exchange elements at two index positions
void rotate(List list, int distance)//Rotation. When distance is a positive number, move the entire distance elements in the list to the front. When distance is a negative number, move the first distance elements of the list to the back as a whole
```

### Find and replace operations

```java
int binarySearch(List list, Object key)//Perform a binary search on the List and return the index. Note that the List must be ordered.
int max(Collection coll)//Return the largest element according to the natural order of the elements. Analogy int min(Collection coll)
int max(Collection coll, Comparator c)//Return the largest element according to customized sorting. The sorting rules are controlled by the Comparatator class. Analogy int min(Collection coll, Comparator c)
void fill(List list, Object obj)//Replace all elements in the specified list with the specified element
int frequency(Collection c, Object o)//Count the number of occurrences of elements
int indexOfSubList(List list, List target)//Stats the index of the first occurrence of target in the list. If it cannot be found, it returns -1, analogous to int lastIndexOfSubList(List source, list target)
boolean replaceAll(List list, Object oldVal, Object newVal)//Replace old elements with new elements
```

### Synchronization control

`Collections` provides multiple `synchronizedXxx()` methods, which can wrap the specified collection into a thread-synchronized collection, thereby solving the thread safety problem when multiple threads access the collection concurrently.

We know that `HashSet`, `TreeSet`, `ArrayList`, `LinkedList`, `HashMap`, `TreeMap` are all thread-unsafe. `Collections` provides multiple static methods to wrap them into thread-synchronized collections.

**It is best not to use the following methods, which are very inefficient. When you need a thread-safe collection type, please consider using the concurrent collection under the JUC package. **

Here's how:

```java
synchronizedCollection(Collection<T> c) //Returns the synchronized (thread-safe) collection supported by the specified collection.
synchronizedList(List<T> list)//Returns a synchronized (thread-safe) List supported by the specified list.
synchronizedMap(Map<K,V> m) //Returns a synchronized (thread-safe) Map supported by the specified mapping.
synchronizedSet(Set<T> s) //Returns the synchronized (thread-safe) set supported by the specified set.
```

<!-- @include: @article-footer.snippet.md -->