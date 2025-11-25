---
title: Summary of precautions for using Java collections
category: Java
tag:
  - Java collections
head:
  - - meta
    - name: keywords
      content: Java collections, usage precautions, empty judgment, isEmpty, size, concurrent containers, best practices, ConcurrentLinkedQueue
  - - meta
    - name: description
      content: Summarizes common precautions and best practices for using Java collections, covering null detection, concurrent container features, etc. to help avoid error-prone points and performance problems.
---

In this article, I summarize common precautions about the use of collections and their specific principles based on the "Alibaba Java Development Manual".

It is strongly recommended that friends read it several times to avoid these low-level problems when writing code.

## Set empty

The description of "Alibaba Java Development Manual" is as follows:

> **To determine whether all elements in the collection are empty, use the `isEmpty()` method instead of the `size()==0` method. **

This is because the `isEmpty()` method is more readable and has a time complexity of `O(1)`.

The time complexity of the `size()` method of most of the collections we use is also `O(1)`. However, there are also many whose complexity is not `O(1)`, such as `ConcurrentLinkedQueue` under the `java.util.concurrent` package. The `isEmpty()` method of `ConcurrentLinkedQueue` is judged by the `first()` method, where the `first()` method returns the first node in the queue whose value is not `null` (the reason why the node value is `null` is the logical deletion used in the iterator)

```java
public boolean isEmpty() { return first() == null; }

Node<E> first() {
    restartFromHead:
    for (;;) {
        for (Node<E> h = head, p = h, q;;) {
            boolean hasItem = (p.item != null);
            if (hasItem || (q = p.next) == null) { // The current node value is not empty or reaches the end of the queue
                updateHead(h, p); // Set head to p
                return hasItem ? p : null;
            }
            else if (p == q) continue restartFromHead;
            else p = q; // p = p.next
        }
    }
}
```

Since the `updateHead(h, p)` method is executed when inserting and deleting elements, the execution time complexity of this method can be approximately `O(1)`. The `size()` method needs to traverse the entire linked list, and the time complexity is `O(n)`

```java
public int size() {
    int count = 0;
    for (Node<E> p = first(); p != null; p = succ(p))
        if (p.item != null)
            if (++count == Integer.MAX_VALUE)
                break;
    return count;
}
```

In addition, the time complexity of the `size()` method and the `isEmpty()` method in `ConcurrentHashMap` 1.7 is also different. `ConcurrentHashMap` 1.7 stores the number of elements in each `Segment`, the `size()` method needs to count the number of each `Segment`, and `isEmpty()` only needs to find the first `Segment` that is not empty. However, the `size()` method and `isEmpty()` in `ConcurrentHashMap` 1.8 both need to call the `sumCount()` method, and its time complexity is related to the size of the `Node` array. The following is the source code of the `sumCount()` method:

```java
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null)
        for (int i = 0; i < as.length; ++i)
            if ((a = as[i]) != null)
                sum += a.value;
    return sum;
}
```

This is because in a concurrent environment, `ConcurrentHashMap` stores the number of nodes in each `Node` in the `CounterCell[]` array. In `ConcurrentHashMap` 1.7, the number of elements is stored in each `Segment`, the `size()` method needs to count the number of each `Segment`, and `isEmpty()` only needs to find the first `Segment` that is not empty.

## Convert collection to Map

The description of "Alibaba Java Development Manual" is as follows:

> **When using the `toMap()` method of the `java.util.stream.Collectors` class to convert to a `Map` collection, be sure to note that an NPE exception will be thrown when the value is null. **

```java
class Person {
    private String name;
    private String phoneNumber;
     // getters and setters
}

List<Person> bookList = new ArrayList<>();
bookList.add(new Person("jack","18163138123"));
bookList.add(new Person("martin",null));
// Null pointer exception
bookList.stream().collect(Collectors.toMap(Person::getName, Person::getPhoneNumber));
```

Let’s explain why below.

First, let's look at the `toMap()` method of the `java.util.stream.Collectors` class. We can see that it internally calls the `merge()` method of the `Map` interface.

```java
public static <T, K, U, M extends Map<K, U>>
Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                            Function<? super T, ? extends U> valueMapper,
                            BinaryOperator<U> mergeFunction,
                            Supplier<M> mapSupplier) {
    BiConsumer<M, T> accumulator
            = (map, element) -> map.merge(keyMapper.apply(element),
                                          valueMapper.apply(element), mergeFunction);
    return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
}
```

The `merge()` method of the `Map` interface is as follows. This method is the default implementation in the interface.

> If you don’t know the new features of Java 8, please read this article: ["Summary of New Features of Java 8"](https://mp.weixin.qq.com/s/ojyl7B6PiHaTWADqmUq2rw).

```java
default V merge(K key, V value,
        BiFunction<? super V, ? super V, ? extends V> remappingFunction) {
    Objects.requireNonNull(remappingFunction);
    Objects.requireNonNull(value);
    V oldValue = get(key);
    V newValue = (oldValue == null) ? value :
               remappingFunction.apply(oldValue, value);
    if(newValue == null) {
        remove(key);
    } else {
        put(key, newValue);
    }
    return newValue;
}```

The `merge()` method will first call the `Objects.requireNonNull()` method to determine whether value is null.

```java
public static <T> T requireNonNull(T obj) {
    if (obj == null)
        throw new NullPointerException();
    return obj;
}
```

> `Collectors` also provides the `toMap()` method without mergeFunction. However, if a key conflict occurs at this time, a `duplicateKeyException` exception will be thrown. Therefore, it is strongly recommended to use the `toMap()` method with a required mergeFunction.

## Collection traversal

The description of "Alibaba Java Development Manual" is as follows:

> **Do not perform `remove/add` operations on elements in a foreach loop. Please use the `Iterator` method to remove elements. If you perform concurrent operations, you need to lock the `Iterator` object. **

By decompiling, you will find that the underlying syntax of foreach still relies on `Iterator`. However, the `remove/add` operation directly calls the collection's own method, not the `remove/add` method of `Iterator`

This causes `Iterator` to inexplicably find that one of its elements has been `removed/add`, and then it will throw a `ConcurrentModificationException` to prompt the user that a concurrent modification exception has occurred. This is the **fail-fast mechanism** generated in the single-threaded state.

> **fail-fast mechanism**: When multiple threads modify the fail-fast collection, `ConcurrentModificationException` may be thrown. This situation may occur even in a single thread, as mentioned above.
>
> Related reading: [What is fail-fast](https://www.cnblogs.com/54chensongxia/p/12470446.html).

Starting from Java8, you can use the `Collection#removeIf()` method to delete elements that meet specific conditions, such as

```java
List<Integer> list = new ArrayList<>();
for (int i = 1; i <= 10; ++i) {
    list.add(i);
}
list.removeIf(filter -> filter % 2 == 0); /* Remove all even numbers in the list */
System.out.println(list); /* [1, 3, 5, 7, 9] */
```

In addition to directly using `Iterator` to perform traversal operations as described above, you can also:

- Use a normal for loop
- Use fail-safe collection classes. All collection classes under the `java.util` package are fail-fast, and all classes under the `java.util.concurrent` package are fail-safe.
-…

## Collection deduplication

The description of "Alibaba Java Development Manual" is as follows:

> **You can take advantage of the unique characteristics of the `Set` element to quickly deduplicate a collection and avoid using `contains()` of `List` to traverse deduplication or determine inclusion operations. **

Here we take `HashSet` and `ArrayList` as examples.

```java
// Set deduplication code example
public static <T> Set<T> removeDuplicateBySet(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new HashSet<>();
    }
    return new HashSet<>(data);
}

// List deduplication code example
public static <T> List<T> removeDuplicateByList(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new ArrayList<>();

    }
    List<T> result = new ArrayList<>(data.size());
    for (T current : data) {
        if (!result.contains(current)) {
            result.add(current);
        }
    }
    return result;
}

```

The core difference between the two is the implementation of the `contains()` method.

The `contains()` method of `HashSet` relies on the `containsKey()` method of `HashMap`, and its time complexity is close to O(1) (O(1) when there is no hash conflict).

```java
private transient HashMap<E,Object> map;
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

We have N elements inserted into Set, so the time complexity is close to O (n).

The `contains()` method of `ArrayList` is done by traversing all elements, and the time complexity is close to O(n).

```java
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = 0; i < size; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}

```

## Convert collection to array

The description of "Alibaba Java Development Manual" is as follows:

> **To use the method of converting a collection to an array, you must use the `toArray(T[] array)` of the collection, and pass in an empty array of the same type and length 0. **

The parameter of the `toArray(T[] array)` method is a generic array. If no parameters are passed in the `toArray` method, an `Object` type array is returned.

```java
String [] s= new String[]{
    "dog", "lazy", "a", "over", "jumps", "fox", "brown", "quick", "A"
};
List<String> list = Arrays.asList(s);
Collections.reverse(list);
//If no type is specified, an error will be reported
s=list.toArray(new String[0]);
```

Due to JVM optimization, it is now better to use `new String[0]` as a parameter of the `Collection.toArray()` method. `new String[0]` acts as a template and specifies the type of the returned array. 0 is to save space, because it is only used to describe the returned type. For details, see: <https://shipilev.net/blog/2016/arrays-wisdom-ancients/>

## Convert array to collection

The description of "Alibaba Java Development Manual" is as follows:

> **When using the tool class `Arrays.asList()` to convert an array into a collection, you cannot use its methods related to modifying the collection. Its `add/remove/clear` method will throw an `UnsupportedOperationException` exception. **

I encountered a similar pitfall in a previous project.

`Arrays.asList()` is quite common in daily development. We can use it to convert an array into a `List` collection.

```java
String[] myArray = {"Apple", "Banana", "Orange"};
List<String> myList = Arrays.asList(myArray);
//The above two statements are equivalent to the following statement
List<String> myList = Arrays.asList("Apple","Banana", "Orange");
```

The JDK source code explains this method:

```java
/**
  *Returns a fixed-size list backed by the specified array. This method acts as a bridge between array-based and collection-based APIs,
  * Used in conjunction with Collection.toArray(). The returned List is serializable and implements the RandomAccess interface.
  */
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}```

Let’s summarize the usage precautions below.

**1. `Arrays.asList()` is a generic method, and the array passed must be an object array, not a basic type. **

```java
int[] myArray = {1, 2, 3};
List myList = Arrays.asList(myArray);
System.out.println(myList.size());//1
System.out.println(myList.get(0));//array address value
System.out.println(myList.get(1));//Error report: ArrayIndexOutOfBoundsException
int[] array = (int[]) myList.get(0);
System.out.println(array[0]);//1
```

When an array of native data types is passed in, the actual parameter obtained by `Arrays.asList()` is not the elements in the array, but the array object itself! At this time, the only element of `List` is this array, which explains the above code.

We can solve this problem by using a wrapper type array.

```java
Integer[] myArray = {1, 2, 3};
```

**2. Using the collection modification methods: `add()`, `remove()`, `clear()` will throw an exception. **

```java
List myList = Arrays.asList(1, 2, 3);
myList.add(4);//Error when running: UnsupportedOperationException
myList.remove(1);//Error when running: UnsupportedOperationException
myList.clear();//Error when running: UnsupportedOperationException
```

The `Arrays.asList()` method returns not `java.util.ArrayList`, but an internal class of `java.util.Arrays`. This internal class does not implement the collection modification methods or does not override these methods.

```java
List myList = Arrays.asList(1, 2, 3);
System.out.println(myList.getClass());//class java.util.Arrays$ArrayList
```

The picture below is a simple source code of `java.util.Arrays$ArrayList`. We can see what methods this class overrides.

```java
  private static class ArrayList<E> extends AbstractList<E>
        implements RandomAccess, java.io.Serializable
    {
        ...

        @Override
        public E get(int index) {
          ...
        }

        @Override
        public E set(int index, E element) {
          ...
        }

        @Override
        public int indexOf(Object o) {
          ...
        }

        @Override
        public boolean contains(Object o) {
           ...
        }

        @Override
        public void forEach(Consumer<? super E> action) {
          ...
        }

        @Override
        public void replaceAll(UnaryOperator<E> operator) {
          ...
        }

        @Override
        public void sort(Comparator<? super E> c) {
          ...
        }
    }
```

Let's take another look at the `add/remove/clear` method of `java.util.AbstractList` and we will know why `UnsupportedOperationException` is thrown.

```java
public E remove(int index) {
    throw new UnsupportedOperationException();
}
public boolean add(E e) {
    add(size(), e);
    return true;
}
public void add(int index, E element) {
    throw new UnsupportedOperationException();
}

public void clear() {
    removeRange(0, size());
}
protected void removeRange(int fromIndex, int toIndex) {
    ListIterator<E> it = listIterator(fromIndex);
    for (int i=0, n=toIndex-fromIndex; i<n; i++) {
        it.next();
        it.remove();
    }
}
```

**So how do we correctly convert the array to `ArrayList`?**

1. Manual implementation of tool classes

```java
//JDK1.5+
static <T> List<T> arrayToList(final T[] array) {
  final List<T> l = new ArrayList<T>(array.length);

  for (final T s : array) {
    l.add(s);
  }
  return l;
}


Integer [] myArray = { 1, 2, 3 };
System.out.println(arrayToList(myArray).getClass());//class java.util.ArrayList
```

2. The easiest way

```java
List list = new ArrayList<>(Arrays.asList("a", "b", "c"))
```

3. Use Java8’s `Stream` (recommended)

```java
Integer [] myArray = { 1, 2, 3 };
List myList = Arrays.stream(myArray).collect(Collectors.toList());
//Basic types can also be converted (relying on the boxing operation of boxed)
int [] myArray2 = { 1, 2, 3 };
List myList = Arrays.stream(myArray2).boxed().collect(Collectors.toList());
```

4. Use Guava

For immutable collections, you can use the [`ImmutableList`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java) class and its [`of()`](https://github.com/google/guava/blob/master/gu ava/src/com/google/common/collect/ImmutableList.java#L101) and [`copyOf()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java#L225) factory method: (parameters cannot be empty)

```java
List<String> il = ImmutableList.of("string", "elements"); // from varargs
List<String> il = ImmutableList.copyOf(aStringArray); // from array
```

For mutable collections, you can use the [`Lists`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java) class and its [`newArrayList()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java#L87) factory method:

```java
List<String> l1 = Lists.newArrayList(anotherListOrCollection); // from collection
List<String> l2 = Lists.newArrayList(aStringArray); // from array
List<String> l3 = Lists.newArrayList("or", "string", "elements"); // from varargs```

5、使用 Apache Commons Collections

```java
List<String> list = new ArrayList<String>();
CollectionUtils.addAll(list, str);
```

6、 使用 Java9 的 `List.of()`方法

```java
Integer[] array = {1, 2, 3};
List<Integer> list = List.of(array);
```

<!-- @include: @article-footer.snippet.md -->