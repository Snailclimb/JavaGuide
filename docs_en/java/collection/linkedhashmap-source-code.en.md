---
title: LinkedHashMap source code analysis
category: Java
tag:
  - Java collections
head:
  - - meta
    - name: keywords
      content: LinkedHashMap, insertion order, access order, doubly linked list, LRU, iterative order, HashMap expansion, traversal efficiency
  - - meta
    - name: description
      content: Analysis of LinkedHashMap, which maintains a doubly linked list based on HashMap to achieve ordered insertion/access, and its application in LRU cache and other scenarios.
---

## Introduction to LinkedHashMap

`LinkedHashMap` is a collection class provided by Java. It inherits from `HashMap` and maintains a doubly linked list based on `HashMap`, so that it has the following characteristics:

1. When traversing is supported, iteration will be carried out in order according to the insertion order.
2. Supports sorting according to element access order, suitable for encapsulating LRU cache tools.
3. Because a doubly linked list is used internally to maintain each node, the efficiency of traversal is proportional to the number of elements. Compared with HashMap, which is proportional to capacity, the iteration efficiency will be much higher.

The logical structure of `LinkedHashMap` is shown in the figure below. It maintains a two-way linked list between each node based on `HashMap`, so that the nodes, linked lists, and red-black trees originally hashed on different buckets are associated in an orderly manner.

![LinkedHashMap logical structure](https://oss.javaguide.cn/github/javaguide/java/collection/linkhashmap-structure-overview.png)

## LinkedHashMap usage example

### Insertion order traversal

As shown below, we add elements to `LinkedHashMap` in order and then traverse.

```java
HashMap < String, String > map = new LinkedHashMap < > ();
map.put("a", "2");
map.put("g", "3");
map.put("r", "1");
map.put("e", "23");

for (Map.Entry < String, String > entry: map.entrySet()) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```

Output:

```java
a:2
g:3
r:1
e:23
```

It can be seen that the iteration order of `LinkedHashMap` is consistent with the insertion order, which is something that `HashMap` does not have.

### Access sequence traversal

`LinkedHashMap` defines the sorting mode `accessOrder` (boolean type, default is false), the access order is true, and the insertion order is false.

In order to implement access order traversal, we can use the `LinkedHashMap` constructor passing in the `accessOrder` attribute and set `accessOrder` to true, indicating that it has access ordering.

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>(16, 0.75f, true);
map.put(1, "one");
map.put(2, "two");
map.put(3, "three");
map.put(4, "four");
map.put(5, "five");
//Access element 2, the element will be moved to the end of the linked list
map.get(2);
//Access element 3, the element will be moved to the end of the linked list
map.get(3);
for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " : " + entry.getValue());
}
```

Output:

```java
1 : one
4 : four
5 : five
2 : two
3: three
```

It can be seen that the iteration order of `LinkedHashMap` is consistent with the access order.

### LRU cache

From the previous one, we can learn that through `LinkedHashMap` we can encapsulate a simple version of LRU (**L**east **R**ecently **U**sed, least recently used) cache to ensure that when the stored elements exceed the container capacity, the least recently accessed elements are removed.

![](https://oss.javaguide.cn/github/javaguide/java/collection/lru-cache.png)

The specific implementation ideas are as follows:

- Inherits `LinkedHashMap`;
- Specify `accessOrder` as true in the constructor, so that when accessing an element, the element will be moved to the end of the linked list, and the first element of the linked list will be the least recently accessed element;
- Override the `removeEldestEntry` method, which will return a boolean value to tell `LinkedHashMap` whether the first element of the linked list needs to be removed (cache capacity is limited).

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * Return true when size exceeds capacity, telling LinkedHashMap to remove the oldest cache item (i.e. the first element of the linked list)
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

The test code is as follows. The author initialized the cache capacity to 3, and then added 4 elements in order.

```java
LRUCache<Integer, String> cache = new LRUCache<>(3);
cache.put(1, "one");
cache.put(2, "two");
cache.put(3, "three");
cache.put(4, "four");
cache.put(5, "five");
for (int i = 1; i <= 5; i++) {
    System.out.println(cache.get(i));
}
```

Output:

```java
null
null
three
four
five
```

Judging from the output, since the cache capacity is 3, when the 4th element is added, the 1st element will be deleted. When the 5th element is added, the 2nd element is removed.

## LinkedHashMap source code analysis

### Node design

Before formally discussing `LinkedHashMap`, let us first talk about the design of the `LinkedHashMap` node `Entry`. We all know that the nodes on the `HashMap` bucket that are converted to linked lists due to conflicts will convert the linked lists into red-black trees when the following two conditions are met:

1. ~~The number of nodes on the linked list reaches the tree threshold 7, that is, `TREEIFY_THRESHOLD - 1`. ~~
2. The capacity of the bucket reaches the minimum tree capacity, which is `MIN_TREEIFY_CAPACITY`.

> **🐛 Bugfix (see: [issue#2147](https://github.com/Snailclimb/JavaGuide/issues/2147))**:
>
> The threshold for the number of nodes on the linked list to become a tree is 8 instead of 7. Because the source code is traversed from the initial element of the linked list, and the subscript starts from 0, the judgment condition is set to 8-1=7. In fact, when iterating to the tail element, it is judged that the length of the entire linked list is greater than or equal to 8 before performing the tree operation.
>
> ![](https://oss.javaguide.cn/github/javaguide/java/jvm/LinkedHashMap-putval-TREEIFY.png)

`LinkedHashMap` builds a two-way linked list for each node on the bucket based on `HashMap`, which makes the tree node converted into a red-black tree also need to have the characteristics of a two-way linked list node, that is, each tree node needs to have two addresses that reference the storage of the predecessor node and the successor node, so the design of the tree node class `TreeNode` is a relatively thorny issue.

For this we might as well take a look at the class diagram of the node class between the two, we can see:

1. The node internal class `Entry` of `LinkedHashMap` is based on `HashMap`, and adds `before` and `after` pointers to make the node have the characteristics of a doubly linked list.
2. The tree node `TreeNode` of `HashMap` inherits the `Entry` of `LinkedHashMap` which has the characteristics of a doubly linked list.![Relationship between LinkedHashMap and HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/map-hashmap-linkedhashmap.png)

Many readers will have this question at this time, why does the tree node `TreeNode` of `HashMap` obtain the characteristics of a doubly linked list through `LinkedHashMap`? Why not directly implement the predecessor and successor pointers on `Node`?

Let’s answer the first question first. We all know that `LinkedHashMap` adds bidirectional pointers to nodes on the basis of `HashMap` to achieve the characteristics of a doubly linked list. Therefore, when the internal linked list of `LinkedHashMap` is converted into a red-black tree, the corresponding node will be converted into a tree node `TreeNode`. In order to ensure that the tree node has the characteristics of a doubly linked list when using `LinkedHashMap`, so the tree node `TreeNode` Need to inherit `Entry` of `LinkedHashMap`.

Let’s talk about the second question. We directly implement the predecessor and successor pointers on the node `Node` of `HashMap`, and then `TreeNode` directly inherits `Node` to obtain the characteristics of a doubly linked list. Why not? In fact, it is also possible to do this. However, this approach will add two unnecessary references to the node class `Node` that stores key-value pairs when using `HashMap`, occupying unnecessary memory space.

Therefore, in order to ensure that the underlying node class `Node` of `HashMap` has no redundant references, and to ensure that the node class `Entry` of `LinkedHashMap` has a reference to the storage linked list, the designer allows the node `Entry` of `LinkedHashMap` to inherit Node and add references `before` and `after` to store the predecessor and successor nodes, so that the nodes that need to use the linked list feature can implement the required logic. Then the tree node `TreeNode` obtains the two pointers `before` and `after` by inheriting `Entry`.

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```

But doesn't this also add two unnecessary references to `TreeNode` when using `HashMap`? Isn't this also a waste of space?

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
  //omitted

}
```

Regarding this issue, quoting a comment from the author, the authors believe that with a good `hashCode` algorithm, the probability of `HashMap` converting to a red-black tree is low. Even if the red-black tree is converted into a tree node, `TreeNode` may be changed into `Node` due to removal or expansion, so the probability of using `TreeNode` is not very high, and the waste of resource space is acceptable.

```bash
Because TreeNodes are about twice the size of regular nodes, we
use them only when bins contain enough nodes to warrant use
(see TREEIFY_THRESHOLD). And when they become too small (due to
removal or resizing) they are converted back to plain bins. In
usages with well-distributed user hashCodes, tree bins are
rarely used. Ideally, under random hashCodes, the frequency of
nodes in bins follows a Poisson distribution
```

###Construction method

The `LinkedHashMap` constructor has 4 implementations and is relatively simple. Directly call the constructor of the parent class, `HashMap`, to complete the initialization.

```java
public LinkedHashMap() {
    super();
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity) {
    super(initialCapacity);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity, float loadFactor) {
    super(initialCapacity, loadFactor);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity,
    float loadFactor,
    boolean accessOrder) {
    super(initialCapacity, loadFactor);
    this.accessOrder = accessOrder;
}
```

We also mentioned above that `accessOrder` is false by default. If we want `LinkedHashMap` to sort the key-value pairs in order of access (i.e., arrange the recently unvisited elements at the beginning of the linked list and move the recently accessed elements to the end of the linked list), we need to call the fourth constructor to set `accessOrder` to true.

### get method

The `get` method is the only overridden method in the `LinkedHashMap` addition, deletion, modification and query operations. When `accessOrder` is true, it will move the currently accessed element to the end of the linked list after the element query is completed.

```java
public V get(Object key) {
     Node < K, V > e;
     //Get the key-value pair of key, if it is empty, return directly
     if ((e = getNode(hash(key), key)) == null)
         return null;
     //If accessOrder is true, call afterNodeAccess to move the current element to the end of the linked list
     if(accessOrder)
         afterNodeAccess(e);
     //Return the value of the key-value pair
     return e.value;
 }
```

As can be seen from the source code, the execution steps of `get` are very simple:

1. Call `getNode` of the parent class, `HashMap`, to obtain the key-value pair. If it is empty, it will be returned directly.
2. Determine whether `accessOrder` is true. If it is true, it means that the linked list access order of `LinkedHashMap` needs to be ensured. Go to step 3.
3. Call `afterNodeAccess` rewritten by `LinkedHashMap` to add the current element to the end of the linked list.

The key point is the implementation of the `afterNodeAccess` method, which is responsible for moving the element to the end of the linked list.

```java
void afterNodeAccess(Node < K, V > e) { // move node to last
    LinkedHashMap.Entry < K, V > last;
    //If accessOrder and the current node is not the tail node of the linked list
    if (accessOrder && (last = tail) != e) {

        //Get the current node, as well as the predecessor node and successor node
        LinkedHashMap.Entry < K, V > p =
            (LinkedHashMap.Entry < K, V > ) e, b = p.before, a = p.after;

        //Point the successor node pointer of the current node to null to disconnect it from the successor node
        p.after = null;

        //If the predecessor node is empty, it means that the current node is the first node of the linked list, so the successor node is set as the first node
        if(b==null)
            head = a;
        else
            //If the predecessor node is not empty, let the predecessor node point to the successor node
            b.after = a;

        //If the successor node is not empty, let the successor node point to the predecessor node
        if (a != null)
            a.before = b;
        else
            //If the successor node is empty, it means that the current node is at the end of the linked list, and let last point directly to the predecessor node. This else is actually meaningless, because the if at the beginning has ensured that p is not the tail node, so naturally after will not be null.
            last = b;

        //If last is empty, it means that the current linked list has only one node p, then point head to p
        if (last == null)
            head = p;
        else {
            //On the contrary, let the predecessor pointer of p point to the tail node, and then let the predecessor pointer of the tail node point to p.
            p.before = last;
            last.after = p;
        }
        //tail points to p, and then moves node p to the end of the linked list.
        tail = p;

        ++modCount;
    }
}```

As can be seen from the source code, the `afterNodeAccess` method completes the following operations:

1. If `accessOrder` is true and the end of the linked list is not the current node p, we need to move the current node to the end of the linked list.
2. Get the current node p, its predecessor node b and successor node a.
3. Set the successor pointer of the current node p to null to disconnect it from the successor node p.
4. Try to point the predecessor node to the successor node. If the predecessor node is empty, it means that the current node p is the first node of the linked list, so directly set the successor node a as the first node, and then append p to the end of a.
5. Try again to make the successor node a point to the predecessor node b.
6. The above operation allows the predecessor node and successor node to complete the association and separate the current node p. This step is to append the current node p to the end of the linked list. If the end of the linked list is empty, it means that the current linked list has only one node p, so just let the head point to p.
7. The above operation has successfully reached p to the end of the linked list. Finally, we point the tail pointer, which is the pointer pointing to the end of the linked list, to p.

It can be understood in conjunction with this picture, which shows that the element with key 13 has been moved to the end of the linked list.

![LinkedHashMap moves element 13 to the end of the linked list](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-get.png)

It doesn’t matter if you don’t quite understand it. It’s enough to know the effect of this method. You can digest it slowly when you have time later.

### remove method post-operation——afterNodeRemoval

`LinkedHashMap` does not override the `remove` method, but directly inherits the `remove` method of `HashMap`. In order to ensure that the nodes in the doubly linked list will be removed simultaneously after the key-value pair is removed, `LinkedHashMap` rewrites the empty implementation method `afterNodeRemoval` of `HashMap`.

```java
final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        //omitted
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                else if (node == p)
                    tab[index] = node.next;
                else
                    p.next = node.next;
                ++modCount;
                --size;
                //HashMap's removeNode will call afterNodeRemoval to perform the post-removal operation after completing the element removal.
                afterNodeRemoval(node);
                return node;
            }
        }
        return null;
    }
//Empty implementation
void afterNodeRemoval(Node<K,V> p) { }
```

We can see that the `removeNode` method called inside the `remove` method inherited from `HashMap` deletes the node from the bucket and then calls `afterNodeRemoval`.

```java
void afterNodeRemoval(Node<K,V> e) { // unlink

    //Get the current node p, and the predecessor node b and successor node a of e
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
    //Set the predecessor and successor pointers of p to null to disconnect them from the predecessor and successor nodes.
        p.before = p.after = null;

    //If the predecessor node is empty, it means that the current node p is the first node of the linked list, just let the head pointer point to the successor node a.
        if(b==null)
            head = a;
        else
        //If the predecessor node b is not empty, let b point directly to the successor node a
            b.after = a;

    //If the successor node is empty, it means that the current node p is at the end of the linked list, so just let the tail pointer point to the predecessor node a.
        if(a==null)
            tail = b;
        else
        //Instead, the predecessor pointer of the successor node points directly to the predecessor node
            a.before = b;
    }
```

As can be seen from the source code, the overall operation of the `afterNodeRemoval` method is to disconnect the current node p from the predecessor node and successor node, and wait for gc recycling. The overall steps are:

1. Obtain the current node p, as well as p’s predecessor node b and successor node a.
2. Disconnect the current node p from its predecessor and successor nodes.
3. Try to make the predecessor node b point to the successor node a. If b is empty, it means that the current node p is at the head of the linked list. We can directly point the head to the successor node a.
4. Try to make the successor node a point to the predecessor node b. If a is empty, it means that the current node p is at the end of the linked list, so just let the tail pointer point to the predecessor node b.

It can be understood in conjunction with this picture, which shows that the element with key 13 is deleted, that is, the element is removed from the linked list.

![LinkedHashMap delete element 13](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-remove.png)

It doesn’t matter if you don’t quite understand it. It’s enough to know the effect of this method. You can digest it slowly when you have time later.

### put method post operation——afterNodeInsertion

Similarly, `LinkedHashMap` does not implement the insertion method, but directly inherits all the insertion methods of `HashMap` for users to use. However, in order to maintain the orderliness of doubly linked list access, it does the following two things:

1. Rewrite `afterNodeAccess` (mentioned above), if the currently inserted key already exists in `map`, because the insertion operation of `LinkedHashMap` will append the new node to the end of the linked list, so for the existing key, call `afterNodeAccess` to put it at the end of the linked list.
2. Overridden the `afterNodeInsertion` method of `HashMap`. When `removeEldestEntry` returns true, the first node of the linked list will be removed.

We can see this in the core method `putVal` of the insertion operation of `HashMap`.

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
          //omitted
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                 //If the current key exists in the map, call afterNodeAccess
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
         //Call the insert post method, which is overridden by LinkedHashMap
        afterNodeInsertion(evict);
        return null;
    }
```

The source code of the above steps has been explained above, so here we focus on the workflow of `afterNodeInsertion`. Assume that we have rewritten `removeEldestEntry` and return true when the linked list `size` exceeds `capacity`.

```java
/**
 * Return true when size exceeds capacity, telling LinkedHashMap to remove the oldest cache item (i.e. the first element of the linked list)
 */
protected boolean removeEldestEntry(Map.Entry < K, V > eldest) {
    return size() > capacity;
}```

Take the following figure as an example. Suppose that the author finally inserted a new node 19 that does not exist. Assume that `capacity` is 4, so `removeEldestEntry` returns true, and we want to remove the first node of the linked list.

![Insert new elements into LinkedHashMap 19](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-after-insert-1.png)

The removal step is very simple. Check whether the first node of the linked list exists. If it exists, disconnect the relationship between the first node and the subsequent node, and let the first node pointer point to the next node, so the head pointer points to 12, and node 10 becomes an empty object without any reference, waiting for GC.

![Insert new elements into LinkedHashMap 19](https://oss.javaguide.cn/github/javaguide/java/collection/linkedhashmap-after-insert-2.png)

```java
void afterNodeInsertion(boolean evict) { // possibly remove eldest
        LinkedHashMap.Entry<K,V> first;
        //If evict is true and the head element of the queue is not empty and removeEldestEntry returns true, it means that we need to remove the oldest element (that is, the element at the head of the linked list).
        if (evict && (first = head) != null && removeEldestEntry(first)) {
          //Get the key of the key-value pair at the head of the linked list
            K key = first.key;
            //Call removeNode to remove the element from the bucket of HashMap, disconnect it from the doubly linked list of LinkedHashMap, and wait for gc recycling
            removeNode(hash(key), key, null, false, true);
        }
    }
```

As can be seen from the source code, the `afterNodeInsertion` method completes the following operations:

1. Determine whether `eldest` is true. Only if it is true, it means that the oldest key-value pair (i.e., the element at the head of the linked list) may need to be removed. Whether it needs to be removed specifically, you must also determine whether the linked list is empty `((first = head) != null)`, and whether the `removeEldestEntry` method returns true. Only when these two methods return true can it be determined that the current linked list is not empty, and the linked list needs to be removed.
2. Get the key of the first element of the linked list.
3. Call the `removeNode` method of `HashMap`, which we mentioned above, it will remove the node from the bucket of `HashMap`, and `LinkedHashMap` also overrides the `afterNodeRemoval` method in `removeNode`, so this step will remove the element from the bucket of `HashMap` by calling `removeNode` Removed from `LinkedHashMap` and disconnected from the doubly linked list of `LinkedHashMap`, waiting for gc recycling.

## LinkedHashMap and HashMap traversal performance comparison

`LinkedHashMap` maintains a doubly linked list to record the order of data insertion, so when iterating through the generated iterator, it is traversed according to the path of the doubly linked list. This is much more efficient than `HashMap` which traverses the entire bucket.

We can verify this from the iterators of the two. Let's first look at the iterator of `HashMap`. You can see that `HashMap` uses a `nextNode` method when iterating key-value pairs. This method will return the next element pointed to by next, and will traverse the bucket starting from next to find the element Node in the next bucket that is not empty.

```java
 final class EntryIterator extends HashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }

 //Get the next Node
 final Node < K, V > nextNode() {
     Node < K, V > [] t;
     //Get the next element next
     Node < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if(e==null)
         throw new NoSuchElementException();
     //Point next to the next Node in the bucket that is not empty
     if ((next = (current = e).next) == null && (t = table) != null) {
         do {} while (index < t.length && (next = t[index++]) == null);
     }
     return e;
 }
```

In contrast, the iterator of `LinkedHashMap` directly uses the `after` pointer to quickly locate the successor node of the current node, which is much simpler and more efficient.

```java
 final class LinkedEntryIterator extends LinkedHashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }
 //Get the next Node
 final LinkedHashMap.Entry < K, V > nextNode() {
     //Get the next node next
     LinkedHashMap.Entry < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if(e==null)
         throw new NoSuchElementException();
     //current pointer points to the current node
     current = e;
     //next directly positions the after pointer of the current node to the next node quickly
     next = e.after;
     return e;
 }
```

In order to verify the author's point of view, the author conducted a stress test on these two containers to test the time taken to insert 10 million pieces of data and iterate 10 million pieces of data. The code is as follows:

```java
int count = 1000_0000;
Map<Integer, Integer> hashMap = new HashMap<>();
Map<Integer, Integer> linkedHashMap = new LinkedHashMap<>();

long start, end;

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    hashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("map time putVal: " + (end - start));

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    linkedHashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap putVal time: " + (end - start));

start = System.currentTimeMillis();
long num = 0;
for (Integer v : hashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("map get time: " + (end - start));

start = System.currentTimeMillis();
for (Integer v : linkedHashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap get time: " + (end - start));
System.out.println(num);```

Judging from the output results, because `LinkedHashMap` needs to maintain a doubly linked list, inserting elements will be more time-consuming than `HashMap`, but with the clear relationship between the front and rear nodes of the doubly linked list, the iteration efficiency is much more efficient than the former. However, overall it is not big, after all, the amount of data is so huge.

```bash
map time putVal: 5880
linkedHashMap putVal time: 7567
map get time: 143
linkedHashMap get time: 67
63208969074998
```

## LinkedHashMap common interview questions

### What is LinkedHashMap?

`LinkedHashMap` is a subclass of `HashMap` in the Java collection framework. It inherits all properties and methods of `HashMap`, and overrides the `afterNodeRemoval`, `afterNodeInsertion`, and `afterNodeAccess` methods based on `HashMap`. Make it have the characteristics of sequential insertion and ordered access.

### How does LinkedHashMap iterate elements in insertion order?

It is the default behavior of `LinkedHashMap` to iterate elements in insertion order. `LinkedHashMap` internally maintains a doubly linked list to record the insertion order of elements. Therefore, when iterating over elements using an iterator, the elements are in the same order as they were originally inserted.

### How does LinkedHashMap iterate elements in order of access?

`LinkedHashMap` can iterate elements in access order specified by the `accessOrder` parameter in the constructor. When `accessOrder` is true, each time an element is accessed, the element will be moved to the end of the linked list, so the next time the element is accessed, it will become the last element in the linked list, thereby iterating the elements in the order of access.

### How does LinkedHashMap implement LRU caching?

Set `accessOrder` to true and override the `removeEldestEntry` method to return true when the linked list size exceeds capacity, so that each time an element is accessed, it will be moved to the end of the linked list. Once the insertion operation causes `removeEldestEntry` to return true, the cache is deemed to be full, and `LinkedHashMap` will remove the first element of the linked list, so that we can implement an LRU cache.

### What is the difference between LinkedHashMap and HashMap?

`LinkedHashMap` and `HashMap` are both implementation classes of the Map interface in the Java collection framework. The biggest difference between them is the order in which the elements are iterated. The order in which `HashMap` iterates elements is undefined, while `LinkedHashMap` provides the functionality to iterate elements in insertion order or access order. In addition, `LinkedHashMap` internally maintains a doubly linked list to record the insertion order or access order of elements, while `HashMap` does not have this linked list. Therefore, the insertion performance of `LinkedHashMap` may be slightly lower than that of `HashMap`, but it provides more functions and the iteration efficiency is more efficient than `HashMap`.

## References

- Detailed analysis of LinkedHashMap source code (JDK1.8): <https://www.imooc.com/article/22931>
- HashMap and LinkedHashMap:<https://www.cnblogs.com/Spground/p/8536148.html>
- Derived from LinkedHashMap source code: <https://leetcode.cn/problems/lru-cache/solution/yuan-yu-linkedhashmapyuan-ma-by-jeromememory/>
<!-- @include: @article-footer.snippet.md -->