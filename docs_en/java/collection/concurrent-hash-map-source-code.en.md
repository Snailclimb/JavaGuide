---
title: ConcurrentHashMap 源码分析
category: Java
tag:
  - Java集合
head:
  - - meta
    - name: keywords
      content: ConcurrentHashMap,线程安全,分段锁,Segment,CAS,红黑树,链表,并发级别,JDK7,JDK8,并发容器
  - - meta
    - name: description
      content: 对比 JDK7/8 的 ConcurrentHashMap 实现，解析分段锁、CAS、链表/红黑树等并发设计，理解线程安全 Map 的核心原理。
---

> 本文来自公众号：末读代码的投稿，原文地址：<https://mp.weixin.qq.com/s/AHWzboztt53ZfFZmsSnMSw> 。

上一篇文章介绍了 HashMap 源码，反响不错，也有很多同学发表了自己的观点，这次又来了，这次是 `ConcurrentHashMap` 了，作为线程安全的 HashMap ，它的使用频率也是很高。那么它的存储结构和实现原理是怎么样的呢？

## 1. ConcurrentHashMap 1.7

### 1. 存储结构

![Java 7 ConcurrentHashMap 存储结构](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

Java 7 中 `ConcurrentHashMap` 的存储结构如上图，`ConcurrnetHashMap` 由很多个 `Segment` 组合，而每一个 `Segment` 是一个类似于 `HashMap` 的结构，所以每一个 `HashMap` 的内部可以进行扩容。但是 `Segment` 的个数一旦**初始化就不能改变**，默认 `Segment` 的个数是 16 个，你也可以认为 `ConcurrentHashMap` 默认支持最多 16 个线程并发。

### 2. 初始化

通过 `ConcurrentHashMap` 的无参构造探寻 `ConcurrentHashMap` 的初始化流程。

```java
    /**
     * Creates a new, empty map with a default initial capacity (16),
     * load factor (0.75) and concurrencyLevel (16).
     */
    public ConcurrentHashMap() {
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR, DEFAULT_CONCURRENCY_LEVEL);
    }
```

无参构造中调用了有参构造，传入了三个参数的默认值，他们的值是。

```java
    /**
     * 默认初始化容量
     */
    static final int DEFAULT_INITIAL_CAPACITY = 16;

    /**
     * 默认负载因子
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * 默认并发级别
     */
    static final int DEFAULT_CONCURRENCY_LEVEL = 16;
```

接着看下这个有参构造函数的内部实现逻辑。

```java
@SuppressWarnings("unchecked")
public ConcurrentHashMap(int initialCapacity,float loadFactor, int concurrencyLevel) {
    // 参数校验
    if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
        throw new IllegalArgumentException();
    // 校验并发级别大小，大于 1<<16，重置为 65536
    if (concurrencyLevel > MAX_SEGMENTS)
        concurrencyLevel = MAX_SEGMENTS;
    // Find power-of-two sizes best matching arguments
    // 2的多少次方
    int sshift = 0;
    int ssize = 1;
    // 这个循环可以找到 concurrencyLevel 之上最近的 2的次方值
    while (ssize < concurrencyLevel) {
        ++sshift;
        ssize <<= 1;
    }
    // 记录段偏移量
    this.segmentShift = 32 - sshift;
    // 记录段掩码
    this.segmentMask = ssize - 1;
    // 设置容量
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    // c = 容量 / ssize ，默认 16 / 16 = 1，这里是计算每个 Segment 中的类似于 HashMap 的容量
    int c = initialCapacity / ssize;
    if (c * ssize < initialCapacity)
        ++c;
    int cap = MIN_SEGMENT_TABLE_CAPACITY;
    //Segment 中的类似于 HashMap 的容量至少是2或者2的倍数
    while (cap < c)
        cap <<= 1;
    // create segments and segments[0]
    // 创建 Segment 数组，设置 segments[0]
    Segment<K,V> s0 = new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                         (HashEntry<K,V>[])new HashEntry[cap]);
    Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
    UNSAFE.putOrderedObject(ss, SBASE, s0); // ordered write of segments[0]
    this.segments = ss;
}
```

总结一下在 Java 7 中 ConcurrentHashMap 的初始化逻辑。

1. 必要参数校验。
2. 校验并发级别 `concurrencyLevel` 大小，如果大于最大值，重置为最大值。无参构造**默认值是 16.**
3. 寻找并发级别 `concurrencyLevel` 之上最近的 **2 的幂次方**值，作为初始化容量大小，**默认是 16**。
4. 记录 `segmentShift` 偏移量，这个值为【容量 = 2 的 N 次方】中的 N，在后面 Put 时计算位置时会用到。**默认是 32 - sshift = 28**.
5. 记录 `segmentMask`，默认是 ssize - 1 = 16 -1 = 15.
6. **初始化 `segments[0]`**，**默认大小为 2**，**负载因子 0.75**，**扩容阀值是 2\*0.75=1.5**，插入第二个值时才会进行扩容。

### 3. put

接着上面的初始化参数继续查看 put 方法源码。

```java
/**
 * Maps the specified key to the specified value in this table.
 * Neither the key nor the value can be null.
 *
 * <p> The value can be retrieved by calling the <tt>get</tt> method
 * with a key that is equal to the original key.
 *
 * @param key key with which the specified value is to be associated
 * @param value value to be associated with the specified key
 * @return the previous value associated with <tt>key</tt>, or
 *         <tt>null</tt> if there was no mapping for <tt>key</tt>
 * @throws NullPointerException if the specified key or value is null
 */
public V put(K key, V value) {
    Segment<K,V> s;
    if (value == null)
        throw new NullPointerException();
    int hash = hash(key);
    // hash 值无符号右移 28位（初始化时获得），然后与 segmentMask=15 做与运算
    // 其实也就是把高4位与segmentMask（1111）做与运算
    int j = (hash >>> segmentShift) & segmentMask;
    if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
         (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
        // 如果查找到的 Segment 为空，初始化
        s = ensureSegment(j);
    return s.put(key, hash, value, false);
}

/**
 * Returns the segment for the given index, creating it and
 * recording in segment table (via CAS) if not already present.
 *
 * @param k the index
 * @return the segment
 */
@SuppressWarnings("unchecked")
private Segment<K,V> ensureSegment(int k) {
    final Segment<K,V>[] ss = this.segments;
    long u = (k << SSHIFT) + SBASE; // raw offset
    Segment<K,V> seg;
    // 判断 u 位置的 Segment 是否为null
    if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) {
        Segment<K,V> proto = ss[0]; // use segment 0 as prototype
        // 获取0号 segment 里的 HashEntry<K,V> 初始化长度
        int cap = proto.table.length;
        // 获取0号 segment 里的 hash 表里的扩容负载因子，所有的 segment 的 loadFactor 是相同的
        float lf = proto.loadFactor;
        // 计算扩容阀值
        int threshold = (int)(cap * lf);
        // 创建一个 cap 容量的 HashEntry 数组
        HashEntry<K,V>[] tab = (HashEntry<K,V>[])new HashEntry[cap];
        if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) { // recheck
            // 再次检查 u 位置的 Segment 是否为null，因为这时可能有其他线程进行了操作
            Segment<K,V> s = new Segment<K,V>(lf, threshold, tab);
            // 自旋检查 u 位置的 Segment 是否为null
            while ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u))
                   == null) {
                // 使用CAS 赋值，只会成功一次
                if (UNSAFE.compareAndSwapObject(ss, u, null, seg = s))
                    break;
            }
        }
    }
    return seg;
}
```

The above source code analyzes the processing flow of `ConcurrentHashMap` when putting a data. The specific process is summarized below.

1. Calculate the position of the key to be put and obtain the `Segment` at the specified position.

2. If the `Segment` at the specified position is empty, initialize this `Segment`.

   **Initialization Segment process:**

   1. Check whether the `Segment` of the calculated position is null.
   2. Continue initialization for null and create a `HashEntry` array using the capacity and load factor of `Segment[0]`.
   3. Check again whether the calculated `Segment` at the specified position is null.
   4. Initialize this Segment using the created `HashEntry` array.
   5. Spin to determine whether the calculated `Segment` at the specified position is null, and use CAS to assign a value to `Segment` at this position.

3. `Segment.put` inserts key and value values.

The operations of obtaining the `Segment` segment and initializing the `Segment` segment were explored above. The put method of `Segment` in the last line has not been checked yet, so continue the analysis.

```java
final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    // Obtain the ReentrantLock exclusive lock. If it cannot be obtained, scanAndLockForPut is used to obtain it.
    HashEntry<K,V> node = tryLock() ? null : scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
        HashEntry<K,V>[] tab = table;
        // Calculate the data location to be put
        int index = (tab.length - 1) & hash;
        // CAS gets the value of index coordinates
        HashEntry<K,V> first = entryAt(tab, index);
        for (HashEntry<K,V> e = first;;) {
            if (e != null) {
                // Check whether key already exists. If it exists, traverse the linked list to find the position and replace the value after finding it.
                K k;
                if ((k = e.key) == key ||
                    (e.hash == hash && key.equals(k))) {
                    oldValue = e.value;
                    if (!onlyIfAbsent) {
                        e.value = value;
                        ++modCount;
                    }
                    break;
                }
                e = e.next;
            }
            else {
                // The value of first does not indicate that the index position already has a value, there is a conflict, and the head of the linked list is interpolated.
                if (node != null)
                    node.setNext(first);
                else
                    node = new HashEntry<K,V>(hash, key, value, first);
                int c = count + 1;
                // If the capacity is greater than the expansion threshold and less than the maximum capacity, expand the capacity.
                if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                    rehash(node);
                else
                    // Index position assignment node, node may be an element or the head of a linked list
                    setEntryAt(tab, index, node);
                ++modCount;
                count = c;
                oldValue = null;
                break;
            }
        }
    } finally {
        unlock();
    }
    return oldValue;
}
```

Since `Segment` inherits `ReentrantLock`, the lock can be easily acquired inside `Segment`, and the put process uses this function.

1. `tryLock()` acquires the lock. If it cannot be acquired, use the **`scanAndLockForPut`** method to continue acquiring it.

2. Calculate the index position where the put data is to be placed, and then obtain the `HashEntry` at this position.

3. Traverse put new elements, why do we need to traverse? Because the `HashEntry` obtained here may be an empty element, or the linked list may already exist, so it must be treated differently.

   If **`HashEntry` does not exist** at this location:

   1. If the current capacity is greater than the expansion threshold and less than the maximum capacity, **expand** will be performed.
   2. Insert directly.

   If **`HashEntry` exists at this location**:

   1. Determine whether the key and hash values of the current element in the linked list are consistent with the key and hash values to be put. If consistent, replace the value
   2. If there is inconsistency, get the next node in the linked list and replace the value until the same value is found, or there is no identical value in the linked list.
      1. If the current capacity is greater than the expansion threshold and less than the maximum capacity, **expand** will be performed.
      2. Directly insert the head of the linked list.

4. If the position to be inserted already exists before, return the old value after replacement, otherwise return null.

The `scanAndLockForPut` operation in the first step is not introduced here. The operation performed by this method is to continuously spin `tryLock()` to acquire the lock. When the number of spins is greater than the specified number, use `lock()` to block and acquire the lock. Get the `HashEntry` at the next hash position in sequence while spinning.

```java
private HashEntry<K,V> scanAndLockForPut(K key, int hash, V value) {
    HashEntry<K,V> first = entryForHash(this, hash);
    HashEntry<K,V> e = first;
    HashEntry<K,V> node = null;
    int retries = -1; // negative while locating node
    // Spin to acquire lock
    while (!tryLock()) {
        HashEntry<K,V> f; // to recheck first below
        if (retries < 0) {
            if (e == null) {
                if (node == null) // speculatively create node
                    node = new HashEntry<K,V>(hash, key, value, null);
                retries = 0;
            }
            else if (key.equals(e.key))
                retries = 0;
            else
                e = e.next;
        }
        else if (++retries > MAX_SCAN_RETRIES) {
            // After the spin reaches the specified number of times, block until the lock is acquired.
            lock();
            break;
        }
        else if ((retries & 1) == 0 &&
                 (f = entryForHash(this, hash)) != first) {
            e = first = f; // re-traverse if entry changed
            retries = -1;
        }
    }
    return node;
}

```### 4. Expansion rehash

The expansion of `ConcurrentHashMap` will only double its original size. When the data in the old array is moved to the new array, the position will either remain unchanged or change to `index+ oldSize`. The node in the parameter will be inserted into the specified position using linked list **head interpolation** after expansion.

```java
private void rehash(HashEntry<K,V> node) {
    HashEntry<K,V>[] oldTable = table;
    // old capacity
    int oldCapacity = oldTable.length;
    // New capacity, doubled
    int newCapacity = oldCapacity << 1;
    //New expansion threshold
    threshold = (int)(newCapacity * loadFactor);
    //Create new array
    HashEntry<K,V>[] newTable = (HashEntry<K,V>[]) new HashEntry[newCapacity];
    // New mask, the default 2 is 4 after expansion, -1 is 3, and the binary value is 11.
    int sizeMask = newCapacity - 1;
    for (int i = 0; i < oldCapacity ; i++) {
        // Traverse the old array
        HashEntry<K,V> e = oldTable[i];
        if (e != null) {
            HashEntry<K,V> next = e.next;
            // Calculate the new position. The new position can only be the same or the old position + the old capacity.
            int idx = e.hash & sizeMask;
            if (next == null) // Single node on list
                // If the current position is not a linked list, but just an element, assign the value directly
                newTable[idx] = e;
            else { // Reuse consecutive sequence at same slot
                // If it is a linked list
                HashEntry<K,V> lastRun = e;
                int lastIdx = idx;
                // The new location can only be the same or the old location + old capacity.
                // After the traversal is completed, the positions of the elements after lastRun are all the same.
                for (HashEntry<K,V> last = next; last != null; last = last.next) {
                    int k = last.hash & sizeMask;
                    if (k != lastIdx) {
                        lastIdx = k;
                        lastRun = last;
                    }
                }
                //, the positions of the elements after lastRun are all the same, and they are directly assigned to the new position as a linked list.
                newTable[lastIdx] = lastRun;
                // Clone remaining nodes
                for (HashEntry<K,V> p = e; p != lastRun; p = p.next) {
                    // Traverse the remaining elements and interpolate the head to the specified k position.
                    V v = p.value;
                    int h = p.hash;
                    int k = h & sizeMask;
                    HashEntry<K,V> n = newTable[k];
                    newTable[k] = new HashEntry<K,V>(h, p.key, v, n);
                }
            }
        }
    }
    //Head insertion method inserts new nodes
    int nodeIndex = node.hash & sizeMask; // add the new node
    node.setNext(newTable[nodeIndex]);
    newTable[nodeIndex] = node;
    table = newTable;
}
```

Some students may be confused about the last two for loops. The first for here is to find such a node. The new positions of all next nodes after this node are the same. Then assign this as a linked list to the new location. The second for loop is to insert the remaining elements into the linked list at the specified position through head interpolation. ~~The reason for this implementation may be based on probability statistics. Students with in-depth research can express their opinions. ~~

The second internal `for` loop uses `new HashEntry<K,V>(h, p.key, v, n)` to create a new `HashEntry` instead of reusing the previous one, because if the previous one is reused, the thread that is traversing (such as executing the `get` method) will not be able to traverse due to the modification of the pointer. As said in the comments:

> Replaced nodes will be garbage collected when they are no longer referenced by any read threads that may be traversing the table concurrently.
>
> The nodes they replace will be garbage collectable as soon as they are no longer referenced by any reader thread that may be in the midst of concurrently traversing table

Why do we need to use another `for` loop to find `lastRun`? Actually, it is to reduce the number of object creations, as mentioned in the annotation:

> Statistically, under the default threshold, when the table capacity is doubled, only about one-sixth of the nodes need to be cloned.
>
> Statistically, at the default threshold, only about one-sixth of them need cloning when a table doubles.

### 5. get

It's very simple to get here, the get method only requires two steps.

1. Calculate the storage location of key.
2. Traverse the specified location to find the value of the same key.

```java
public V get(Object key) {
    Segment<K,V> s; // manually integrate access methods to reduce overhead
    HashEntry<K,V>[] tab;
    int h = hash(key);
    long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
    // Calculate the storage location of key
    if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
        (tab = s.table) != null) {
        for (HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
                 (tab, ((long)((tab.length - 1) & h)) << TSHIFT) + TBASE);
             e != null; e = e.next) {
            // If it is a linked list, traverse to find the value with the same key.
            K k;
            if ((k = e.key) == key || (e.hash == h && key.equals(k)))
                return e.value;
        }
    }
    return null;
}
```

## 2. ConcurrentHashMap 1.8

### 1. Storage structure

![Java8 ConcurrentHashMap storage structure (picture from javadoop)](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)It can be found that Java8's ConcurrentHashMap has changed significantly compared to Java7. It is no longer the previous **Segment array + HashEntry array + linked list**, but **Node array + linked list/red-black tree**. When the conflicting linked list reaches a certain length, the linked list will be converted into a red-black tree.

### 2. Initialize initTable

```java
/**
 * Initializes table, using the size recorded in sizeCtl.
 */
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        //If sizeCtl < 0, it means that another thread has successfully executed CAS and is initializing.
        if ((sc = sizeCtl) < 0)
            //Give up CPU usage rights
            Thread.yield(); // lost initialization race; just spin
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

It can be found from the source code that the initialization of `ConcurrentHashMap` is completed through **spin and CAS** operations. What needs attention inside is the variable `sizeCtl` (abbreviation of sizeControl), whose value determines the current initialization state.

1. -1 indicates that it is being initialized and other threads need to spin and wait.
2. -N indicates that the table is being expanded. The high 16 bits represent the identification stamp of the expansion. The low 16 bits minus 1 are the number of threads undergoing expansion.
3. 0 indicates the table initialization size, if the table is not initialized
4. \>0 represents the threshold for table expansion, if the table has been initialized.

### 3. put

Go through the put source code directly.

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

/** Implementation for put and putIfAbsent */
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // key and value cannot be empty
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        // f = target position element
        Node<K,V> f; int n, i, fh; // The hash value of the element at the target location is stored after fh
        if (tab == null || (n = tab.length) == 0)
            //The array bucket is empty, initialize the array bucket (spin+CAS)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // The bucket is empty, CAS is put in without locking, and if successful, it will just break out.
            if (casTabAt(tab, i, null,new Node<K,V>(hash, key, value, null)))
                break; // no lock when adding to empty bin
        }
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            // Use synchronized lock to join the node
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    // Description is a linked list
                    if (fh >= 0) {
                        binCount = 1;
                        // Loop to add new or overwrite nodes
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {
                        // red-black tree
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}```

1. Calculate hashcode based on key.

2. Determine whether initialization is required.

3. It is the Node located by the current key. If it is empty, it means that the current location can write data. Use CAS to try to write. If it fails, the spin is guaranteed to be successful.

4. If the `hashcode == MOVED == -1` at the current location is required, expansion is required.

5. If neither is satisfied, use the synchronized lock to write data.

6. If the number is greater than `TREEIFY_THRESHOLD`, the tree method will be executed. In `treeifyBin`, it will first determine that the current array length is ≥64 before converting the linked list into a red-black tree.

### 4. get

The get process is relatively simple, just go through the source code directly.

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    // The hash location where the key is located
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // If the element at the specified position exists, the hash value of the head node is the same
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                // If the key hash values are equal and the key values are the same, the element value is returned directly
                return e.val;
        }
        else if (eh < 0)
            // The hash value of the head node is less than 0, indicating that it is expanding or it is a red-black tree, find
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
            // It is a linked list, traverse and search
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

To summarize the get process:

1. Calculate the position based on the hash value.
2. Find the specified position. If the head node is what you are looking for, return its value directly.
3. If the hash value of the head node is less than 0, it means that it is expanding or it is a red-black tree. Find it.
4. If it is a linked list, traverse to find it.

Summary:

In general, `ConcurrentHashMap` has changed quite a lot in Java8 compared to Java7.

## 3. Summary

The segmentation lock used by `ConcurrentHashMap` in Java7 means that only one thread can operate on each Segment at the same time. Each `Segment` is a structure similar to a `HashMap` array. It can be expanded and its conflicts will be converted into a linked list. However, the number of `Segment` cannot be changed once initialized.

The `Synchronized` lock plus CAS mechanism used by `ConcurrentHashMap` in Java8. The structure has also evolved from **`Segment` array + `HashEntry` array + linked list** in Java7 to **Node array + linked list/red-black tree**. Node is a structure similar to a HashEntry. When its conflicts reach a certain size, it will be converted into a red-black tree, and when the conflicts are less than a certain number, it will return to the linked list.

Some students may have questions about the performance of `Synchronized`. In fact, since the introduction of the lock upgrade strategy for `Synchronized` locks, the performance is no longer a problem. Interested students can learn about the **lock upgrade** of `Synchronized` on their own.

<!-- @include: @article-footer.snippet.md -->