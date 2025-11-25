---
title: ThreadLocal detailed explanation
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: ThreadLocal, thread variable copy, ThreadLocalMap, weak reference, hash conflict, expansion, cleanup mechanism, memory leak
  - - meta
    - name: description
      content: An in-depth analysis of the design and implementation of ThreadLocal, covering the structure, weak reference and cleanup mechanism of ThreadLocalMap, as well as common usage pitfalls and avoidance methods.
---

> This article comes from the submission of Is a Flower a Romance? The original address: [https://juejin.cn/post/6844904151567040519](https://juejin.cn/post/6844904151567040519).

### Preface

![](./images/thread-local/1.png)

**The full text has a total of 10,000+ words and 31 pictures. This article also took a lot of time and energy to create. It is not easy to be original. Please pay attention and read it. Thank you. **

Regarding `ThreadLocal`, everyone's first reaction may be that it is very simple, a copy of the thread's variables, and each thread is isolated. So here are a few questions you can think about:

- The key of `ThreadLocal` is a **weak reference**, so when `ThreadLocal.get()` occurs, after **GC** occurs, is the key **null**?
- What is the **data structure** of `ThreadLocalMap` in `ThreadLocal`?
- **Hash algorithm** of `ThreadLocalMap`?
- How to solve the **Hash conflict** in `ThreadLocalMap`?
- What is the **expansion mechanism** of `ThreadLocalMap`?
- What is the cleaning mechanism for expired keys in `ThreadLocalMap`? **Detective Cleaning** and **Heuristic Cleaning** processes?
- What is the implementation principle of `ThreadLocalMap.set()` method?
- What is the implementation principle of `ThreadLocalMap.get()` method?
- How is `ThreadLocal` used in the project? Encountered a pitfall?
-…

Do you already have a clear grasp of some of the above issues? This article will focus on these issues using graphics and text to analyze the **bits and pieces** of `ThreadLocal`.

### Directory

**Note:** The source code of this article is based on `JDK 1.8`

### `ThreadLocal` code demonstration

Let’s first look at the usage example of `ThreadLocal`:

```java
public class ThreadLocalTest {
    private List<String> messages = Lists.newArrayList();

    public static final ThreadLocal<ThreadLocalTest> holder = ThreadLocal.withInitial(ThreadLocalTest::new);

    public static void add(String message) {
        holder.get().messages.add(message);
    }

    public static List<String> clear() {
        List<String> messages = holder.get().messages;
        holder.remove();

        System.out.println("size: " + holder.get().messages.size());
        return messages;
    }

    public static void main(String[] args) {
        ThreadLocalTest.add("Is a flower considered romantic?");
        System.out.println(holder.get().messages);
        ThreadLocalTest.clear();
    }
}
```

Print the result:

```java
[Is a flower considered romantic?]
size: 0
```

The `ThreadLocal` object can provide thread local variables. Each thread `Thread` has its own **copy variable**, and multiple threads do not interfere with each other.

### Data structure of `ThreadLocal`

![](./images/thread-local/2.png)

The `Thread` class has an instance variable `threadLocals` of type `ThreadLocal.ThreadLocalMap`, which means that each thread has its own `ThreadLocalMap`.

`ThreadLocalMap` has its own independent implementation. Its `key` can be simply regarded as `ThreadLocal`, and `value` is the value put in the code (in fact, `key` is not `ThreadLocal` itself, but a **weak reference** of it).

When each thread puts a value into `ThreadLocal`, it will store it in its own `ThreadLocalMap`. When reading, it also uses `ThreadLocal` as a reference and finds the corresponding `key` in its own `map`, thus achieving **thread isolation**.

`ThreadLocalMap` is somewhat similar to the structure of `HashMap`, except that `HashMap` is implemented by **array + linked list**, and there is no **linked list** structure in `ThreadLocalMap`.

We also need to pay attention to `Entry`, its `key` is `ThreadLocal<?> k`, inherited from `WeakReference`, which is what we often call a weak reference type.

### Is key null after GC?

In response to the question at the beginning, the `key` of `ThreadLocal` is a weak reference, so when `ThreadLocal.get()` occurs, after `GC` occurs, is `key` `null`?

In order to clarify this problem, we need to understand the **four reference types** of `Java`:

- **Strong reference**: The object we often new is a strong reference type. As long as the strong reference exists, the garbage collector will never recycle the referenced object, even when there is insufficient memory.
- **Soft Reference**: Objects modified with SoftReference are called soft references. The objects pointed to by soft references are recycled when the memory is about to overflow.
- **Weak Reference**: Objects modified with WeakReference are called weak references. As long as garbage collection occurs, if the object is only pointed to by weak references, it will be recycled.
- **Virtual reference**: A virtual reference is the weakest reference and is defined using PhantomReference in Java. The only function of virtual references is to use the queue to receive notifications that the object is about to die.

Next, let’s look at the code. We use reflection to see the data in `ThreadLocal` after `GC`: (The following code comes from: <https://blog.csdn.net/thewindkee/article/details/103726942> Local running demonstration GC recycling scenario)

```java
public class ThreadLocalDemo {

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException, InterruptedException {
        Thread t = new Thread(()->test("abc",false));
        t.start();
        t.join();
        System.out.println("--after gc--");
        Thread t2 = new Thread(() -> test("def", true));
        t2.start();
        t2.join();
    }

    private static void test(String s,boolean isGC) {
        try {
            new ThreadLocal<>().set(s);
            if (isGC) {
                System.gc();
            }
            Thread t = Thread.currentThread();
            Class<? extends Thread> clz = t.getClass();
            Field field = clz.getDeclaredField("threadLocals");
            field.setAccessible(true);
            Object ThreadLocalMap = field.get(t);
            Class<?> tlmClass = ThreadLocalMap.getClass();
            Field tableField = tlmClass.getDeclaredField("table");
            tableField.setAccessible(true);
            Object[] arr = (Object[]) tableField.get(ThreadLocalMap);
            for (Object o : arr) {
                if (o != null) {
                    Class<?> entryClass = o.getClass();
                    Field valueField = entryClass.getDeclaredField("value");
                    Field referenceField = entryClass.getSuperclass().getSuperclass().getDeclaredField("referent");
                    valueField.setAccessible(true);
                    referenceField.setAccessible(true);
                    System.out.println(String.format("Weak reference key:%s, value:%s", referenceField.get(o), valueField.get(o)));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}```

The result is as follows:

```java
Weak reference key: java.lang.ThreadLocal@433619b6, value: abc
Weak reference key: java.lang.ThreadLocal@418a15e3, value: java.lang.ref.SoftReference@bf97a12
--after gc--
Weak reference key: null, value: def
```

![](./images/thread-local/3.png)

As shown in the figure, because the `ThreadLocal` created here does not point to any value, that is, there is no reference:

```java
new ThreadLocal<>().set(s);
```

So here after `GC`, `key` will be recycled. We see `referent=null` in `debug` above. If **change the code:**

![](./images/thread-local/4.png)

When you first look at this problem, if you don’t think too much about **weak references** and **garbage collection**, then you will definitely think it is `null`.

In fact, it is wrong, because the question is about doing `ThreadLocal.get()` operation, which proves that there is still a strong reference, so `key` is not `null`. As shown in the figure below, the **strong reference** of `ThreadLocal` still exists.

![](./images/thread-local/5.png)

If our **strong reference** does not exist, then `key` will be recycled, which means that our `value` will not be recycled, and `key` will be recycled, causing `value` to exist forever, causing a memory leak.

### `ThreadLocal.set()` method source code detailed explanation

![](./images/thread-local/6.png)

The principle of the `set` method in `ThreadLocal` is as shown in the figure above. It is very simple. It mainly determines whether `ThreadLocalMap` exists, and then uses the `set` method in `ThreadLocal` for data processing.

The code is as follows:

```java
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}

void createMap(Thread t, T firstValue) {
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

The main core logic is still in `ThreadLocalMap`. Read on step by step. There will be a more detailed analysis later.

### `ThreadLocalMap` Hash algorithm

Since it is a `Map` structure, `ThreadLocalMap` must also implement its own `hash` algorithm to solve the hash table array conflict problem.

```java
int i = key.threadLocalHashCode & (len-1);
```

The `hash` algorithm in `ThreadLocalMap` is very simple, where `i` is the array subscript position corresponding to the current key in the hash table.

The most critical thing here is the calculation of `threadLocalHashCode` value. There is an attribute in `ThreadLocal` which is `HASH_INCREMENT = 0x61c88647`

```java
public class ThreadLocal<T> {
    private final int threadLocalHashCode = nextHashCode();

    private static AtomicInteger nextHashCode = new AtomicInteger();

    private static final int HASH_INCREMENT = 0x61c88647;

    private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }

    static class ThreadLocalMap {
        ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
            table = new Entry[INITIAL_CAPACITY];
            int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);

            table[i] = new Entry(firstKey, firstValue);
            size = 1;
            setThreshold(INITIAL_CAPACITY);
        }
    }
}
```

Whenever a `ThreadLocal` object is created, the value of `ThreadLocal.nextHashCode` will be incremented by `0x61c88647`.

This value is very special, it is **Fibonacci number** also called **golden section number**. The increment of `hash` is this number, and the advantage is that `hash` is **distributed very evenly**.

We can try it ourselves:

![](./images/thread-local/8.png)

It can be seen that the generated hash codes are evenly distributed. We will not go into details about the specific algorithm of **Fibonacci** here. Those who are interested can check the relevant information by themselves.

### `ThreadLocalMap` Hash conflict

> **Note:** In all the example images below, the **green block**`Entry` represents **normal data**, and the **grey block** represents the `key` value of `Entry` which is `null` and **has been garbage collected**. **White block** indicates that `Entry` is `null`.

Although `ThreadLocalMap` uses the **golden section** as the `hash` calculation factor, which greatly reduces the probability of `Hash` conflicts, conflicts still exist.

The method to resolve conflicts in `HashMap` is to construct a **linked list** structure on the array, and the conflicting data is mounted on the linked list. If the length of the linked list exceeds a certain number, it will be converted into a **red-black tree**.

There is no linked list structure in `ThreadLocalMap`, so `HashMap` cannot be used to resolve conflicts here.

![](./images/thread-local/7.png)

As shown in the figure above, if we insert a `value=27` data, it should fall into slot 4 after `hash` calculation, and slot 4 already has `Entry` data.

At this time, the search will be linearly backward, and the search will not stop until the slot where `Entry` is `null` is found, and the current element will be placed in this slot. Of course, there are other situations during the iteration process, such as the situation where `Entry` is not `null` and the `key` values ​​are equal, and the situation where the `key` value in `Entry` is `null`, etc. will be handled differently, which will be explained in detail later.

Here we also draw a data where the `key` in `Entry` is `null` (**Entry=2 gray block data**), because the `key` value is a **weak reference** type, so this kind of data exists. During the `set` process, if `Entry` data with expired `key` is encountered, a round of **detective cleaning** operation will actually be performed. The specific operation method will be discussed later.

### Detailed explanation of `ThreadLocalMap.set()`

#### `ThreadLocalMap.set()` principle illustration

After reading `ThreadLocal` **hash algorithm**, let's look at how `set` is implemented.

There are several situations for `set` data (**new** or **update** data) in `ThreadLocalMap`. We draw pictures to illustrate different situations.

**First case:** The `Entry` data corresponding to the slot calculated through `hash` is empty:

![](./images/thread-local/9.png)

Here you can directly put the data into the slot.

**Second case:** The slot data is not empty, and the `key` value is consistent with the `key` value obtained by the current `ThreadLocal` through `hash` calculation:

![](./images/thread-local/10.png)

The data of this slot is directly updated here.

**Third case:** The slot data is not empty. During the subsequent traversal process, no `Entry` with expired `key` is encountered before finding the slot with `Entry` as `null`:

![](./images/thread-local/11.png)

Traverse the hash array and search linearly backwards. If you find a slot with `Entry` as `null`, put the data into the slot, or during the subsequent traversal, if you encounter data with the same key value, you can update it directly.

**Fourth case:** The slot data is not empty. During the subsequent traversal process, before finding the slot whose `Entry` is `null`, an `Entry` with an expired `key` is encountered, as shown below. During the subsequent traversal process, an `key=null` of the `Entry` of the slot data `index=7` is encountered:

![](./images/thread-local/12.png)The `Entry` data `key` corresponding to position 7 in the hash array is `null`, indicating that the `key` value of this data has been garbage collected. At this time, the `replaceStaleEntry()` method will be executed. The meaning of this method is **the logic of replacing expired data**, and starts traversing from the starting point of **index=7** to perform detection data cleaning.

Initialize the starting position of exploratory cleaning of expired data scanning: `slotToExpunge = staleSlot = 7`

Starting from the current `staleSlot`, iteratively search forward to find other expired data, and then update the starting scan index of the expired data `slotToExpunge`. The `for` loop iterates until `Entry` is `null`.

If expired data is found, continue to iterate forward until it encounters a slot with `Entry=null`. As shown in the figure below, **slotToExpunge is updated to 0**:

![](./images/thread-local/13.png)

Iterate forward with the current node (`index=7`), check whether there is expired `Entry` data, and update the `slotToExpunge` value if there is. When `null` is encountered, the detection ends. Taking the above picture as an example, `slotToExpunge` is updated to 0.

The above forward iteration operation is to update the value of the starting index `slotToExpunge` for detecting and cleaning expired data. This value will be explained later. It is used to determine whether there are expired elements before the current expired slot `staleSlot`.

Then start iterating backwards from the `staleSlot` position (`index=7`), **If Entry data with the same key value is found:**

![](./images/thread-local/14.png)

Search backwards from the current node `staleSlot` for the `Entry` element with the same `key` value. After finding it, update the value of `Entry` and exchange the position of the `staleSlot` element (the position of `staleSlot` is the expired element), update the `Entry` data, and then start cleaning up the expired `Entry`, as shown in the following figure:

![](https://oss.javaguide.cn/java-guide-blog/view.png) During backward traversal, if Entry data with the same key value is not found:

![](./images/thread-local/15.png)

Search backwards from the current node `staleSlot` for `Entry` elements with equal `key` values, and stop searching until `Entry` is `null`. As can be seen from the above figure, there is no `Entry` with the same `key` value in `table` at this time.

Create a new `Entry` and replace the `table[stableSlot]` position:

![](./images/thread-local/16.png)

After the replacement is completed, expired elements are also cleaned up. There are two main methods for cleaning: `expungeStaleEntry()` and `cleanSomeSlots()`. The specific details will be discussed later, please continue to read later.

#### Detailed explanation of `ThreadLocalMap.set()` source code

The principle of `set()` implementation has been analyzed above in the form of a diagram. In fact, it is very clear. Let's take a look at the source code:

`java.lang.ThreadLocal`.`ThreadLocalMap.set()`:

```java
private void set(ThreadLocal<?> key, Object value) {
    Entry[] tab = table;
    int len = tab.length;
    int i = key.threadLocalHashCode & (len-1);

    for (Entry e = tab[i];
         e != null;
         e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;
            return;
        }

        if (k == null) {
            replaceStaleEntry(key, value, i);
            return;
        }
    }

    tab[i] = new Entry(key, value);
    int sz = ++size;
    if (!cleanSomeSlots(i, sz) && sz >= threshold)
        rehash();
}
```

Here, `key` is used to calculate the corresponding position in the hash table, and then the position of the bucket corresponding to the current `key` is searched backward to find the bucket that can be used.

```java
Entry[] tab = table;
int len = tab.length;
int i = key.threadLocalHashCode & (len-1);
```

Under what circumstances can a bucket be used?

1. `k = key` indicates that it is a replacement operation and can be used
2. When encountering an expired bucket, execute replacement logic and occupy the expired bucket.
3. During the search process, if you encounter `Entry=null` in the bucket, use it directly

The next step is to execute `for` loop traversal and search backwards. Let’s first look at the implementation of `nextIndex()` and `prevIndex()` methods:

![](./images/thread-local/17.png)

```java
private static int nextIndex(int i, int len) {
    return ((i + 1 < len) ? i + 1 : 0);
}

private static int prevIndex(int i, int len) {
    return ((i - 1 >= 0) ? i - 1 : len - 1);
}
```

Then look at the remaining logic in the `for` loop:

1. Traverse the `Entry` data in the bucket corresponding to the current `key` value. This means that there is no data conflict in the hash array. Jump out of the `for` loop and directly `set` the data into the corresponding bucket.
2. If the `Entry` data in the bucket corresponding to the `key` value is not empty
   2.1 If `k = key`, it means that the current `set` operation is a replacement operation, do the replacement logic and return directly
   2.2 If `key = null`, it means that the `Entry` in the current bucket position is expired data, execute the `replaceStaleEntry()` method (core method), and then return
3. The execution of the `for` loop is completed and the execution continues, indicating that the `entry` is `null` during the backward iteration process.
   3.1 Create a new `Entry` object in the bucket where `Entry` is `null`
   3.2 Perform `++size` operation
4. Call `cleanSomeSlots()` to do a heuristic cleaning job and clean up the expired data of `key` of `Entry` in the hash array
   4.1 If no data is recovered after the cleaning work is completed, and `size` exceeds the threshold (2/3 of the array length), perform the `rehash()` operation
   4.2 `rehash()` will first perform a round of detection cleaning to clean up the expired `key`. After the cleaning is completed, if **size >= threshold - threshold / 4**, the real expansion logic will be executed (the expansion logic will be looked at later)

Next, focus on the `replaceStaleEntry()` method. The `replaceStaleEntry()` method provides the function of replacing expired data. We can review it corresponding to the schematic diagram of the **fourth case** above. The specific code is as follows:

`java.lang.ThreadLocal.ThreadLocalMap.replaceStaleEntry()`:

```java
private void replaceStaleEntry(ThreadLocal<?> key, Object value,
                                       int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;
    Entry e;

    int slotToExpunge = staleSlot;
    for (int i = prevIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = prevIndex(i, len))

        if (e.get() == null)
            slotToExpunge = i;

    for (int i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {

        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;

            tab[i] = tab[staleSlot];
            tab[staleSlot] = e;

            if (slotToExpunge == staleSlot)
                slotToExpunge = i;
            cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
            return;
        }

        if (k == null && slotToExpunge == staleSlot)
            slotToExpunge = i;
    }

    tab[staleSlot].value = null;
    tab[staleSlot] = new Entry(key, value);

    if (slotToExpunge != staleSlot)
        cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
}```

`slotToExpunge` indicates the starting index to start exploratory cleaning of expired data. By default, it starts from the current `staleSlot`. Starting from the current `staleSlot`, iterate forward to find the data that has not expired. The `for` loop will not end until `Entry` is `null`. If expired data is found forward, the start index of the update probe to clean up the expired data is i, that is, `slotToExpunge=i`

```java
for (int i = prevIndex(staleSlot, len);
     (e = tab[i]) != null;
     i = prevIndex(i, len)){

    if (e.get() == null){
        slotToExpunge = i;
    }
}
```

Then it starts searching backward from `staleSlot`, and ends when it encounters the bucket where `Entry` is `null`.
If k == key is encountered during the iteration process, it means that the replacement logic is here, replacing the new data and exchanging the current `staleSlot` position. If `slotToExpunge == staleSlot`, this means that `replaceStaleEntry()` did not find expired `Entry` data when it initially searched for expired data forward, and then did not find expired data during the backward search process. Modify the subscript where the expiration-type cleaning of expired data begins to be the index of the current cycle, that is, `slotToExpunge = i`. Finally, call `cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);` to perform heuristic expiration data cleaning.

```java
if (k == key) {
    e.value = value;

    tab[i] = tab[staleSlot];
    tab[staleSlot] = e;

    if (slotToExpunge == staleSlot)
        slotToExpunge = i;

    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
    return;
}
```

The `cleanSomeSlots()` and `expungeStaleEntry()` methods will be discussed in detail later. These two methods are related to cleaning. One is the heuristic cleaning of the `Entry` related to the expired `key` (`Heuristically scan`), and the other is the detection cleaning of the `Entry` related to the expired `key`.

**If k != key**, it will continue to go down. `k == null` means that the currently traversed `Entry` is expired data. `slotToExpunge == staleSlot` means that the initial forward search of data did not find the expired `Entry`. If the condition is true, update `slotToExpunge` to the current position. This premise is that no expired data is found during the predecessor node scan.

```java
if (k == null && slotToExpunge == staleSlot)
    slotToExpunge = i;
```

During subsequent iterations, if no data with `k == key` is found and data with `Entry` as `null` is encountered, the current iteration operation will end. At this time, it means that this is an added logic, adding new data to the `slot` corresponding to `table[staleSlot]`.

```java
tab[staleSlot].value = null;
tab[staleSlot] = new Entry(key, value);
```

Finally, it was judged that in addition to `staleSlot`, other expired `slot` data was also found, so it was necessary to start the logic of cleaning the data:

```java
if (slotToExpunge != staleSlot)
    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
```

### Detective cleaning process of `ThreadLocalMap` expired keys

Above we mentioned two methods of cleaning expired `key` data of `ThreadLocalMap`: **detective cleaning** and **heuristic cleaning**.

Let's first talk about detection cleaning, that is, the `expungeStaleEntry` method, which traverses the hash array, detects and cleans expired data from the starting position backward, sets the `Entry` of the expired data to `null`, and if it encounters unexpired data along the way, this data `reh Re-position in the `table` array after ash`. If there is already data at the positioned position, the unexpired data will be placed in the `Entry=null` bucket closest to this position, so that the `Entry` data after `rehash` is closer to the correct bucket position. The operation logic is as follows:

![](./images/thread-local/18.png)

As shown in the figure above, `set(27)` should fall into the bucket of `index=4` after hash calculation. Since the `index=4` bucket already has data, the final data of subsequent iterations is put into the bucket of `index=7`. After a while, the `Entry` data `key` in `index=5` becomes `null`

![](./images/thread-local/19.png)

If there is any other data `set` into `map`, the **detective cleaning** operation will be triggered.

As shown in the picture above, after executing **detective cleaning**, the data of `index=5` is cleared, and iteration continues. When the element of `index=7` is reached, the correct `index=4` of the element is found after `rehash`, and there is already data at this position. Then, the node with `Entry=null` closest to `index=4` is searched (the data just cleaned by detection: `index=5`), and after finding it, move `index= The data of 7` is in `index=5`. At this time, the position of the bucket is closer to the correct position `index=4`.

After a round of detection cleaning, the expired data of `key` will be cleared. The bucket position of the unexpired data after `rehash` relocation is theoretically closer to the position of `i= key.hashCode & (tab.len - 1)`. This optimization will improve overall hash table query performance.

Next, let’s take a look at the specific process of `expungeStaleEntry()`. Let’s sort it out step by step by first explaining the schematic diagram and then the source code:

![](./images/thread-local/20.png)

We assume that `expungeStaleEntry(3)` is used to call this method. As shown in the figure above, we can see the data of `table` in `ThreadLocalMap`, and then perform the cleaning operation:

![](./images/thread-local/21.png)

The first step is to clear the data at the current `staleSlot` position. The `Entry` at the `index=3` position becomes `null`. Then continue to probe backward:

![](./images/thread-local/22.png)

After executing the second step, the element with index=4 is moved to the slot with index=3.

Continue to iterate and check later. When normal data is encountered, calculate whether the position of the data is offset. If it is offset, recalculate the `slot` position. The purpose is to store the normal data in the correct position or as close to the correct position as possible.

![](./images/thread-local/23.png)

In the process of subsequent iterations, when an empty slot is encountered, the detection is terminated. In this way, a round of detection cleaning work is completed. Then we continue to look at the specific **implementation source code**:

```java
private int expungeStaleEntry(int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;

    tab[staleSlot].value = null;
    tab[staleSlot] = null;
    size--;

    Entry e;
    int i;
    for (i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {
        ThreadLocal<?> k = e.get();
        if (k == null) {
            e.value = null;
            tab[i] = null;
            size--;
        } else {
            int h = k.threadLocalHashCode & (len - 1);
            if (h != i) {
                tab[i] = null;

                while (tab[h] != null)
                    h = nextIndex(h, len);
                tab[h] = e;
            }
        }
    }
    return i;
}
```

Here we still use `staleSlot=3` as an example. First, clear the data in the `tab[staleSlot]` slot, and then set `size--`
Then iterate backwards based on the `staleSlot` position. If expired data with `k==null` is encountered, the slot data is also cleared, and then `size--`

```java
ThreadLocal<?> k = e.get();

if (k == null) {
    e.value = null;
    tab[i] = null;
    size--;
}```

If `key` has not expired, recalculate whether the subscript position of the current `key` is the current slot subscript position. If not, then it means that a `hash` conflict has occurred. At this time, iterate backwards with the newly calculated correct slot position to find the latest position where `entry` can be stored.

```java
int h = k.threadLocalHashCode & (len - 1);
if (h != i) {
    tab[i] = null;

    while (tab[h] != null)
        h = nextIndex(h, len);

    tab[h] = e;
}
```

Here is the processing of normal data that generates `Hash` conflicts. After iteration, the `Entry` position of the `Hash` conflict data will be closer to the correct position. In this case, the query efficiency will be higher.

### `ThreadLocalMap` expansion mechanism

At the end of the `ThreadLocalMap.set()` method, if no data is cleared after performing the heuristic cleaning work, and the number of `Entry` in the current hash array has reached the list expansion threshold `(len*2/3)`, the `rehash()` logic will be executed:

```java
if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
```

Next, let’s take a look at the specific implementation of `rehash()`:

```java
private void rehash() {
    expungeStaleEntries();

    if (size >= threshold - threshold / 4)
        resize();
}

private void expungeStaleEntries() {
    Entry[] tab = table;
    int len = tab.length;
    for (int j = 0; j < len; j++) {
        Entry e = tab[j];
        if (e != null && e.get() == null)
            expungeStaleEntry(j);
    }
}
```

The first step here is to perform detection cleaning work, starting from the starting position of `table` and going back. The detailed process of analysis and cleaning is provided above. After the cleaning is completed, there may be some `Entry` data with `key` as `null` in the `table`, so at this time, it is determined whether to expand the capacity by judging `size >= threshold - threshold / 4`, that is, `size >= threshold * 3/4`.

We still remember that the threshold for `rehash()` above is `size >= threshold`, so when the interviewer tells us about the `ThreadLocalMap` expansion mechanism, we must explain these two steps clearly:

![](./images/thread-local/24.png)

Next, let’s take a look at the specific `resize()` method. For the convenience of demonstration, we use `oldTab.len=8` as an example:

![](./images/thread-local/25.png)

The size of the expanded `tab` is `oldLen * 2`, and then the old hash table is traversed, the `hash` position is recalculated, and then placed in the new `tab` array. If a `hash` conflict occurs, the nearest `entry` is `null` slot. After the traversal is completed, all the `entry` data in `oldTab` has been put into the new `tab`. Recalculate the **threshold** for the next expansion of `tab`. The specific code is as follows:

```java
private void resize() {
    Entry[] oldTab = table;
    int oldLen = oldTab.length;
    int newLen = oldLen * 2;
    Entry[] newTab = new Entry[newLen];
    int count = 0;

    for (int j = 0; j < oldLen; ++j) {
        Entry e = oldTab[j];
        if (e != null) {
            ThreadLocal<?> k = e.get();
            if (k == null) {
                e.value = null;
            } else {
                int h = k.threadLocalHashCode & (newLen - 1);
                while (newTab[h] != null)
                    h = nextIndex(h, newLen);
                newTab[h] = e;
                count++;
            }
        }
    }

    setThreshold(newLen);
    size = count;
    table = newTab;
}
```

### Detailed explanation of `ThreadLocalMap.get()`

We have read the source code of the `set()` method above, which includes operations such as `set` data, cleaning data, optimizing the position of the data bucket, etc. Let's take a look at the principle of the `get()` operation.

#### `ThreadLocalMap.get()` diagram

**First case:** Calculate the `slot` position in the hash table by searching for the `key` value, and then the `Entry.key` in the `slot` position is consistent with the searched `key`, then return directly:

![](./images/thread-local/26.png)

**Second case:** The `Entry.key` in the `slot` position is inconsistent with the `key` to be found:

![](./images/thread-local/27.png)

Let's take `get(ThreadLocal1)` as an example. After calculation through `hash`, the correct `slot` position should be 4, and the slot with `index=4` already has data, and the `key` value is not equal to `ThreadLocal1`, so we need to continue to iteratively search.

When iterating to the data of `index=5`, `Entry.key=null` triggers a detection data recycling operation and executes the `expungeStaleEntry()` method. After the execution, the data of `index 5 and 8` will be recycled, and the data of `index 6 and 7` will be moved forward. After `index 6,7` is moved forward, it continues to iterate from `index=5` backward, so the `Entry` data with the same `key` value is found at `index=6`, as shown in the following figure:

![](./images/thread-local/28.png)

#### Detailed explanation of `ThreadLocalMap.get()` source code

`java.lang.ThreadLocal.ThreadLocalMap.getEntry()`:

```java
private Entry getEntry(ThreadLocal<?> key) {
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
        return getEntryAfterMiss(key, i, e);
}

private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
    Entry[] tab = table;
    int len = tab.length;

    while (e != null) {
        ThreadLocal<?> k = e.get();
        if (k == key)
            return e;
        if(k==null)
            expungeStaleEntry(i);
        else
            i = nextIndex(i, len);
        e = tab[i];
    }
    return null;
}
```

### `ThreadLocalMap` heuristic cleaning process for expired keys

Two cleaning methods for `ThreadLocalMap` expired keys have been mentioned many times above: **detective cleaning (expungeStaleEntry())**, **heuristic cleaning (cleanSomeSlots())**

Detection cleaning is based on the current `Entry` and will end the cleaning when the value is `null`. It belongs to **Linear Detection Cleaning**.

Heuristic cleaning is defined by the author as: **Heuristically scan some cells looking for stale entries**.

![](./images/thread-local/29.png)

The specific code is as follows:

```java
private boolean cleanSomeSlots(int i, int n) {
    boolean removed = false;
    Entry[] tab = table;
    int len = tab.length;
    do {
        i = nextIndex(i, len);
        Entry e = tab[i];
        if (e != null && e.get() == null) {
            n = len;
            removed = true;
            i = expungeStaleEntry(i);
        }
    } while ( (n >>>= 1) != 0);
    return removed;
}```

### `InheritableThreadLocal`

When we use `ThreadLocal`, in an asynchronous scenario, the thread copy data created in the parent thread cannot be shared with the child thread.

In order to solve this problem, there is also an `InheritableThreadLocal` class in the JDK. Let's take a look at an example:

```java
public class InheritableThreadLocalDemo {
    public static void main(String[] args) {
        ThreadLocal<String> ThreadLocal = new ThreadLocal<>();
        ThreadLocal<String> inheritableThreadLocal = new InheritableThreadLocal<>();
        ThreadLocal.set("parent class data: threadLocal");
        inheritableThreadLocal.set("parent class data: inheritableThreadLocal");

        new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("The child thread obtains the parent class ThreadLocal data: " + ThreadLocal.get());
                System.out.println("The child thread obtains the parent class inheritableThreadLocal data: " + inheritableThreadLocal.get());
            }
        }).start();
    }
}
```

Print the result:

```java
The child thread obtains the parent class ThreadLocal data: null
The child thread obtains the parent class inheritableThreadLocal data: parent class data: inheritableThreadLocal
```

The implementation principle is that the child thread is created by calling the `new Thread()` method in the parent thread, and the `Thread#init` method is called in the constructor of `Thread`. Copy the parent thread data to the child thread in the `init` method:

```java
private void init(ThreadGroup g, Runnable target, String name,
                      long stackSize, AccessControlContext acc,
                      boolean inheritThreadLocals) {
    if (name == null) {
        throw new NullPointerException("name cannot be null");
    }

    if (inheritThreadLocals && parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
            ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    this.stackSize = stackSize;
    tid = nextThreadID();
}
```

But `InheritableThreadLocal` still has flaws. Generally, we use a thread pool for asynchronous processing, and `InheritableThreadLocal` is assigned in the `init()` method in `new Thread`, and the thread pool is the logic of thread reuse, so there will be problems here.

Of course, when problems arise, there will be solutions to solve them. Alibaba has open sourced a `TransmittableThreadLocal` component to solve this problem. It will not be extended here. Those who are interested can check the information by themselves.

### Practical use in `ThreadLocal` project

#### `ThreadLocal` usage scenarios

In our current project, we use `ELK+Logstash` for logging, and finally display and retrieve it in `Kibana`.

Nowadays, distributed systems provide unified services to the outside world. The calling relationship between projects can be related through `traceId`, but how to pass `traceId` between different projects?

Here we use `org.slf4j.MDC` to implement this function, which is implemented internally through `ThreadLocal`. The specific implementation is as follows:

When the front end sends a request to **Service A**, **Service A** will generate a `traceId` string similar to `UUID`, put this string into the `ThreadLocal` of the current thread, and when calling **Service B**, write `traceId` into the `Header` of the request, **Service When B** receives a request, it will first determine whether there is a `traceId` in the `Header` of the request. If it exists, it will be written to the `ThreadLocal` of its own thread.

![](./images/thread-local/30.png)

The `requestId` in the picture is the `traceId` associated with each of our system links. The systems call each other and the corresponding link can be found through this `requestId`. There are some other scenarios here:

![](./images/thread-local/31.png)

For these scenarios, we can have corresponding solutions, as shown below

#### Feign remote calling solution

**Service Send Request:**

```java
@Component
@Slf4j
public class FeignInvokeInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String requestId = MDC.get("requestId");
        if (StringUtils.isNotBlank(requestId)) {
            template.header("requestId", requestId);
        }
    }
}
```

**Service receives request:**

```java
@Slf4j
@Component
public class LogInterceptor extends HandlerInterceptorAdapter {

    @Override
    public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3) {
        MDC.remove("requestId");
    }

    @Override
    public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3) {
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String requestId = request.getHeader(BaseConstant.REQUEST_ID_KEY);
        if (StringUtils.isBlank(requestId)) {
            requestId = UUID.randomUUID().toString().replace("-", "");
        }
        MDC.put("requestId", requestId);
        return true;
    }
}
```

#### Thread pool asynchronous call, requestId passed

Because `MDC` is implemented based on `ThreadLocal`, during the asynchronous process, the child thread has no way to obtain the data stored in the parent thread `ThreadLocal`, so you can customize the thread pool executor and modify the `run()` method:

```java
public class MyThreadPoolTaskExecutor extends ThreadPoolTaskExecutor {

    @Override
    public void execute(Runnable runnable) {
        Map<String, String> context = MDC.getCopyOfContextMap();
        super.execute(() -> run(runnable, context));
    }

    @Override
    private void run(Runnable runnable, Map<String, String> context) {
        if (context != null) {
            MDC.setContextMap(context);
        }
        try {
            runnable.run();
        } finally {
            MDC.remove();
        }
    }
}```

#### Use MQ to send messages to third-party systems

Customize the attribute `requestId` in the message body sent by MQ. After the receiver consumes the message, it can parse `requestId` by itself.

<!-- @include: @article-footer.snippet.md -->