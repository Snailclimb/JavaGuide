---
title: ArrayList 源码分析
category: Java
tag:
  - Java集合
head:
  - - meta
    - name: keywords
      content: ArrayList,动态数组,ensureCapacity,RandomAccess,扩容机制,序列化,add/remove,索引访问,性能,Vector 区别,列表实现
  - - meta
    - name: description
      content: 系统梳理 ArrayList 的底层原理与常见用法，包含动态数组结构、扩容策略、接口实现以及与 Vector 的差异与性能特点。
---

<!-- @include: @small-advertisement.snippet.md -->

## ArrayList 简介

`ArrayList` 的底层是数组队列，相当于动态数组。与 Java 中的数组相比，它的容量能动态增长。在添加大量元素前，应用程序可以使用`ensureCapacity`操作来增加 `ArrayList` 实例的容量。这可以减少递增式再分配的数量。

`ArrayList` 继承于 `AbstractList` ，实现了 `List`, `RandomAccess`, `Cloneable`, `java.io.Serializable` 这些接口。

```java

public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable{

  }
```

- `List` : 表明它是一个列表，支持添加、删除、查找等操作，并且可以通过下标进行访问。
- `RandomAccess` ：这是一个标志接口，表明实现这个接口的 `List` 集合是支持 **快速随机访问** 的。在 `ArrayList` 中，我们即可以通过元素的序号快速获取元素对象，这就是快速随机访问。
- `Cloneable` ：表明它具有拷贝能力，可以进行深拷贝或浅拷贝操作。
- `Serializable` : 表明它可以进行序列化操作，也就是可以将对象转换为字节流进行持久化存储或网络传输，非常方便。

![ArrayList 类图](https://oss.javaguide.cn/github/javaguide/java/collection/arraylist-class-diagram.png)

### ArrayList 和 Vector 的区别?（了解即可）

- `ArrayList` 是 `List` 的主要实现类，底层使用 `Object[]`存储，适用于频繁的查找工作，线程不安全 。
- `Vector` 是 `List` 的古老实现类，底层使用`Object[]` 存储，线程安全。

### ArrayList 可以添加 null 值吗？

`ArrayList` 中可以存储任何类型的对象，包括 `null` 值。不过，不建议向`ArrayList` 中添加 `null` 值， `null` 值无意义，会让代码难以维护比如忘记做判空处理就会导致空指针异常。

示例代码：

```java
ArrayList<String> listOfStrings = new ArrayList<>();
listOfStrings.add(null);
listOfStrings.add("java");
System.out.println(listOfStrings);
```

输出：

```plain
[null, java]
```

### Arraylist 与 LinkedList 区别?

- **是否保证线程安全：** `ArrayList` 和 `LinkedList` 都是不同步的，也就是不保证线程安全；
- **底层数据结构：** `ArrayList` 底层使用的是 **`Object` 数组**；`LinkedList` 底层使用的是 **双向链表** 数据结构（JDK1.6 之前为循环链表，JDK1.7 取消了循环。注意双向链表和双向循环链表的区别，下面有介绍到！）
- **插入和删除是否受元素位置的影响：**
  - `ArrayList` 采用数组存储，所以插入和删除元素的时间复杂度受元素位置的影响。 比如：执行`add(E e)`方法的时候， `ArrayList` 会默认在将指定的元素追加到此列表的末尾，这种情况时间复杂度就是 O(1)。但是如果要在指定位置 i 插入和删除元素的话（`add(int index, E element)`），时间复杂度就为 O(n)。因为在进行上述操作的时候集合中第 i 和第 i 个元素之后的(n-i)个元素都要执行向后位/向前移一位的操作。
  - `LinkedList` 采用链表存储，所以在头尾插入或者删除元素不受元素位置的影响（`add(E e)`、`addFirst(E e)`、`addLast(E e)`、`removeFirst()`、 `removeLast()`），时间复杂度为 O(1)，如果是要在指定位置 `i` 插入和删除元素的话（`add(int index, E element)`，`remove(Object o)`,`remove(int index)`）， 时间复杂度为 O(n) ，因为需要先移动到指定位置再插入和删除。
- **是否支持快速随机访问：** `LinkedList` 不支持高效的随机元素访问，而 `ArrayList`（实现了 `RandomAccess` 接口） 支持。快速随机访问就是通过元素的序号快速获取元素对象(对应于`get(int index)`方法)。
- **内存空间占用：** `ArrayList` 的空间浪费主要体现在在 list 列表的结尾会预留一定的容量空间，而 LinkedList 的空间花费则体现在它的每一个元素都需要消耗比 ArrayList 更多的空间（因为要存放直接后继和直接前驱以及数据）。

## ArrayList 核心源码解读

这里以 JDK1.8 为例，分析一下 `ArrayList` 的底层源码。

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
    private static final long serialVersionUID = 8683452581122892189L;

    /**
     * 默认初始容量大小
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * 空数组（用于空实例）。
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    //用于默认大小空实例的共享空数组实例。
    //我们把它从EMPTY_ELEMENTDATA数组中区分出来，以知道在添加第一个元素时容量需要增加多少。
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * 保存ArrayList数据的数组
     */
    transient Object[] elementData; // non-private to simplify nested class access

    /**
     * ArrayList 所包含的元素个数
     */
    private int size;

    /**
     * 带初始容量参数的构造函数（用户可以在创建ArrayList对象时自己指定集合的初始大小）
     */
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            //如果传入的参数大于0，创建initialCapacity大小的数组
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            //如果传入的参数等于0，创建空数组
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            //其他情况，抛出异常
            throw new IllegalArgumentException("Illegal Capacity: " +
                    initialCapacity);
        }
    }

    /**
     * 默认无参构造函数
     * DEFAULTCAPACITY_EMPTY_ELEMENTDATA 为0.初始化为10，也就是说初始其实是空数组 当添加第一个元素的时候数组容量才变成10
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    /**
     * 构造一个包含指定集合的元素的列表，按照它们由集合的迭代器返回的顺序。
     */
    public ArrayList(Collection<? extends E> c) {
        //将指定集合转换为数组
        elementData = c.toArray();
        //如果elementData数组的长度不为0
        if ((size = elementData.length) != 0) {
            // 如果elementData不是Object类型数据（c.toArray可能返回的不是Object类型的数组所以加上下面的语句用于判断）
            if (elementData.getClass() != Object[].class)
                //将原来不是Object类型的elementData数组的内容，赋值给新的Object类型的elementData数组
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // 其他情况，用空数组代替
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }

    /**
     * 修改这个ArrayList实例的容量是列表的当前大小。 应用程序可以使用此操作来最小化ArrayList实例的存储。
     */
    public void trimToSize() {
        modCount++;
        if (size < elementData.length) {
            elementData = (size == 0)
                    ? EMPTY_ELEMENTDATA
                    : Arrays.copyOf(elementData, size);
        }
    }
//下面是ArrayList的扩容机制
//ArrayList的扩容机制提高了性能，如果每次只扩充一个，
//那么频繁的插入会导致频繁的拷贝，降低性能，而ArrayList的扩容机制避免了这种情况。

    /**
     * 如有必要，增加此ArrayList实例的容量，以确保它至少能容纳元素的数量
     *
     * @param minCapacity 所需的最小容量
     */
    public void ensureCapacity(int minCapacity) {
        // 如果不是默认空数组，则minExpand的值为0；
        // 如果是默认空数组，则minExpand的值为10
        int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
                // 如果不是默认元素表，则可以使用任意大小
                ? 0
                // 如果是默认空数组，它应该已经是默认大小
                : DEFAULT_CAPACITY;

        // 如果最小容量大于已有的最大容量
        if (minCapacity > minExpand) {
            // 根据需要的最小容量，确保容量足够
            ensureExplicitCapacity(minCapacity);
        }
    }


    // 根据给定的最小容量和当前数组元素来计算所需容量。
    private static int calculateCapacity(Object[] elementData, int minCapacity) {
        // 如果当前数组元素为空数组（初始情况），返回默认容量和最小容量中的较大值作为所需容量
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            return Math.max(DEFAULT_CAPACITY, minCapacity);
        }
        // 否则直接返回最小容量
        return minCapacity;
    }

    // 确保内部容量达到指定的最小容量。
    private void ensureCapacityInternal(int minCapacity) {
        ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
    }

    //判断是否需要扩容
    private void ensureExplicitCapacity(int minCapacity) {
        modCount++;
        // overflow-conscious code
        if (minCapacity - elementData.length > 0)
            //调用grow方法进行扩容，调用此方法代表已经开始扩容了
            grow(minCapacity);
    }

    /**
     * 要分配的最大数组大小
     */
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    /**
     * ArrayList扩容的核心方法。
     */
    private void grow(int minCapacity) {
        // oldCapacity为旧容量，newCapacity为新容量
        int oldCapacity = elementData.length;
        //将oldCapacity 右移一位，其效果相当于oldCapacity /2，
        //我们知道位运算的速度远远快于整除运算，整句运算式的结果就是将新容量更新为旧容量的1.5倍，
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        //然后检查新容量是否大于最小需要容量，若还是小于最小需要容量，那么就把最小需要容量当作数组的新容量，
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        //再检查新容量是否超出了ArrayList所定义的最大容量，
        //若超出了，则调用hugeCapacity()来比较minCapacity和 MAX_ARRAY_SIZE，
        //如果minCapacity大于MAX_ARRAY_SIZE，则新容量则为Integer.MAX_VALUE，否则，新容量大小则为 MAX_ARRAY_SIZE。
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }

    //比较minCapacity和 MAX_ARRAY_SIZE
    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return (minCapacity > MAX_ARRAY_SIZE) ?
                Integer.MAX_VALUE :
                MAX_ARRAY_SIZE;
    }

    /**
     * 返回此列表中的元素数。
     */
    public int size() {
        return size;
    }

    /**
     * 如果此列表不包含元素，则返回 true 。
     */
    public boolean isEmpty() {
        //注意=和==的区别
        return size == 0;
    }

    /**
     * 如果此列表包含指定的元素，则返回true 。
     */
    public boolean contains(Object o) {
        //indexOf()方法：返回此列表中指定元素的首次出现的索引，如果此列表不包含此元素，则为-1
        return indexOf(o) >= 0;
    }

    /**
     * 返回此列表中指定元素的首次出现的索引，如果此列表不包含此元素，则为-1
     */
    public int indexOf(Object o) {
        if (o == null) {
            for (int i = 0; i < size; i++)
                if (elementData[i] == null)
                    return i;
        } else {
            for (int i = 0; i < size; i++)
                //equals()方法比较
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    /**
     * 返回此列表中指定元素的最后一次出现的索引，如果此列表不包含元素，则返回-1。.
     */
    public int lastIndexOf(Object o) {
        if (o == null) {
            for (int i = size - 1; i >= 0; i--)
                if (elementData[i] == null)
                    return i;
        } else {
            for (int i = size - 1; i >= 0; i--)
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    /**
     * 返回此ArrayList实例的浅拷贝。 （元素本身不被复制。）
     */
    public Object clone() {
        try {
            ArrayList<?> v = (ArrayList<?>) super.clone();
            //Arrays.copyOf功能是实现数组的复制，返回复制后的数组。参数是被复制的数组和复制的长度
            v.elementData = Arrays.copyOf(elementData, size);
            v.modCount = 0;
            return v;
        } catch (CloneNotSupportedException e) {
            // 这不应该发生，因为我们是可以克隆的
            throw new InternalError(e);
        }
    }

    /**
     * 以正确的顺序（从第一个到最后一个元素）返回一个包含此列表中所有元素的数组。
     * 返回的数组将是“安全的”，因为该列表不保留对它的引用。
     * （换句话说，这个方法必须分配一个新的数组）。
     * 因此，调用者可以自由地修改返回的数组结构。
     * 注意：如果元素是引用类型，修改元素的内容会影响到原列表中的对象。
     * 此方法充当基于数组和基于集合的API之间的桥梁。
     */
    public Object[] toArray() {
        return Arrays.copyOf(elementData, size);
    }

    /**
     * 以正确的顺序返回一个包含此列表中所有元素的数组（从第一个到最后一个元素）;
     * 返回的数组的运行时类型是指定数组的运行时类型。 如果列表适合指定的数组，则返回其中。
     * 否则，将为指定数组的运行时类型和此列表的大小分配一个新数组。
     * 如果列表适用于指定的数组，其余空间（即数组的列表数量多于此元素），则紧跟在集合结束后的数组中的元素设置为null 。
     * （这仅在调用者知道列表不包含任何空元素的情况下才能确定列表的长度。）
     */
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        if (a.length < size)
            // 新建一个运行时类型的数组，但是ArrayList数组的内容
            return (T[]) Arrays.copyOf(elementData, size, a.getClass());
        //调用System提供的arraycopy()方法实现数组之间的复制
        System.arraycopy(elementData, 0, a, 0, size);
        if (a.length > size)
            a[size] = null;
        return a;
    }

    // Positional Access Operations

    @SuppressWarnings("unchecked")
    E elementData(int index) {
        return (E) elementData[index];
    }

    /**
     * 返回此列表中指定位置的元素。
     */
    public E get(int index) {
        rangeCheck(index);

        return elementData(index);
    }

    /**
     * 用指定的元素替换此列表中指定位置的元素。
     */
    public E set(int index, E element) {
        //对index进行界限检查
        rangeCheck(index);

        E oldValue = elementData(index);
        elementData[index] = element;
        //返回原来在这个位置的元素
        return oldValue;
    }

    /**
     * 将指定的元素追加到此列表的末尾。
     */
    public boolean add(E e) {
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //这里看到ArrayList添加元素的实质就相当于为数组赋值
        elementData[size++] = e;
        return true;
    }

    /**
     * 在此列表中的指定位置插入指定的元素。
     * 先调用 rangeCheckForAdd 对index进行界限检查；然后调用 ensureCapacityInternal 方法保证capacity足够大；
     * 再将从index开始之后的所有成员后移一个位置；将element插入index位置；最后size加1。
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //arraycopy()这个实现数组之间复制的方法一定要看一下，下面就用到了arraycopy()方法实现数组自己复制自己
        System.arraycopy(elementData, index, elementData, index + 1,
                size - index);
        elementData[index] = element;
        size++;
    }

    /**
     * 删除该列表中指定位置的元素。 将任何后续元素移动到左侧（从其索引中减去一个元素）。
     */
    public E remove(int index) {
        rangeCheck(index);

        modCount++;
        E oldValue = elementData(index);

        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index + 1, elementData, index,
                    numMoved);
        elementData[--size] = null; // clear to let GC do its work
        //从列表中删除的元素
        return oldValue;
    }

    /**
     * 从列表中删除指定元素的第一个出现（如果存在）。 如果列表不包含该元素，则它不会更改。
     * 返回true，如果此列表包含指定的元素
     */
    public boolean remove(Object o) {
        if (o == null) {
            for (int index = 0; index < size; index++)
                if (elementData[index] == null) {
                    fastRemove(index);
                    return true;
                }
        } else {
            for (int index = 0; index < size; index++)
                if (o.equals(elementData[index])) {
                    fastRemove(index);
                    return true;
                }
        }
        return false;
    }

    /*
     * 该方法为私有的移除方法，跳过了边界检查，并且不返回被移除的值。
     */
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index + 1, elementData, index,
                    numMoved);
        elementData[--size] = null; // 在移除元素后，将该位置的元素设为 null，以便垃圾回收器（GC）能够回收该元素。
    }

    /**
     * 从列表中删除所有元素。
     */
    public void clear() {
        modCount++;

        // 把数组中所有的元素的值设为null
        for (int i = 0; i < size; i++)
            elementData[i] = null;

        size = 0;
    }

    /**
     * 按指定集合的Iterator返回的顺序将指定集合中的所有元素追加到此列表的末尾。
     */
    public boolean addAll(Collection<? extends E> c) {
        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount
        System.arraycopy(a, 0, elementData, size, numNew);
        size += numNew;
        return numNew != 0;
    }

    /**
     * 将指定集合中的所有元素插入到此列表中，从指定的位置开始。
     */
    public boolean addAll(int index, Collection<? extends E> c) {
        rangeCheckForAdd(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount

        int numMoved = size - index;
        if (numMoved > 0)
            System.arraycopy(elementData, index, elementData, index + numNew,
                    numMoved);

        System.arraycopy(a, 0, elementData, index, numNew);
        size += numNew;
        return numNew != 0;
    }

    /**
     * 从此列表中删除所有索引为fromIndex （含）和toIndex之间的元素。
     * 将任何后续元素移动到左侧（减少其索引）。
     */
    protected void removeRange(int fromIndex, int toIndex) {
        modCount++;
        int numMoved = size - toIndex;
        System.arraycopy(elementData, toIndex, elementData, fromIndex,
                numMoved);

        // clear to let GC do its work
        int newSize = size - (toIndex - fromIndex);
        for (int i = newSize; i < size; i++) {
            elementData[i] = null;
        }
        size = newSize;
    }

    /**
     * 检查给定的索引是否在范围内。
     */
    private void rangeCheck(int index) {
        if (index >= size)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    /**
     * add和addAll使用的rangeCheck的一个版本
     */
    private void rangeCheckForAdd(int index) {
        if (index > size || index < 0)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    /**
     * 返回IndexOutOfBoundsException细节信息
     */
    private String outOfBoundsMsg(int index) {
        return "Index: " + index + ", Size: " + size;
    }

    /**
     * 从此列表中删除指定集合中包含的所有元素。
     */
    public boolean removeAll(Collection<?> c) {
        Objects.requireNonNull(c);
        //如果此列表被修改则返回true
        return batchRemove(c, false);
    }

    /**
     * 仅保留此列表中包含在指定集合中的元素。
     * 换句话说，从此列表中删除其中不包含在指定集合中的所有元素。
     */
    public boolean retainAll(Collection<?> c) {
        Objects.requireNonNull(c);
        return batchRemove(c, true);
    }


    /**
     * 从列表中的指定位置开始，返回列表中的元素（按正确顺序）的列表迭代器。
     * 指定的索引表示初始调用将返回的第一个元素为next 。 初始调用previous将返回指定索引减1的元素。
     * 返回的列表迭代器是fail-fast 。
     */
    public ListIterator<E> listIterator(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index: " + index);
        return new ListItr(index);
    }

    /**
     * 返回列表中的列表迭代器（按适当的顺序）。
     * 返回的列表迭代器是fail-fast 。
     */
    public ListIterator<E> listIterator() {
        return new ListItr(0);
    }

    /**
     * 以正确的顺序返回该列表中的元素的迭代器。
     * 返回的迭代器是fail-fast 。
     */
    public Iterator<E> iterator() {
        return new Itr();
    }
```

## ArrayList expansion mechanism analysis

### Let’s start with the constructor of ArrayList

There are three ways to initialize ArrayList. The source code of the construction method is as follows (JDK8):

```java
/**
 *Default initial capacity size
 */
private static final int DEFAULT_CAPACITY = 10;

private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

/**
 * Default constructor, using initial capacity 10 to construct an empty list (no parameter construction)
 */
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

/**
 * Constructor with initial capacity parameters. (User-specified capacity)
 */
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {//Initial capacity is greater than 0
        //Create an array of initialCapacity size
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {//Initial capacity is equal to 0
        //Create an empty array
        this.elementData = EMPTY_ELEMENTDATA;
    } else {//Initial capacity is less than 0, throws an exception
        throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
    }
}


/**
 *Construct a list containing the elements of the specified collection, which are returned in order using the iterator of the collection
 *If the specified collection is null, throws NullPointerException.
 */
public ArrayList(Collection<? extends E> c) {
    elementData = c.toArray();
    if ((size = elementData.length) != 0) {
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elementData.getClass() != Object[].class)
            elementData = Arrays.copyOf(elementData, size, Object[].class);
    } else {
        // replace with empty array.
        this.elementData = EMPTY_ELEMENTDATA;
    }
}
```

Careful students will definitely find that: **When creating `ArrayList` with the parameterless construction method, an empty array is actually initialized and assigned. Capacity is actually allocated when an element is actually added to the array. That is, when the first element is added to the array, the array capacity is expanded to 10. ** We will talk about this when we analyze the expansion of `ArrayList` below!

> Supplement: When JDK6 new constructs an `ArrayList` object without parameters, it directly creates an `Object[]` array `elementData` with a length of 10.

### Step by step analysis of ArrayList expansion mechanism

Here we take the `ArrayList` created by the parameterless constructor as an example.

#### add method

```java
/**
* Appends the specified elements to the end of this list.
*/
public boolean add(E e) {
    // Before adding elements, call the ensureCapacityInternal method first
    ensureCapacityInternal(size + 1); // Increments modCount!!
    // Here we see that the essence of adding elements to ArrayList is equivalent to assigning values to the array.
    elementData[size++] = e;
    return true;
}
```

**Note**: JDK11 removed the `ensureCapacityInternal()` and `ensureExplicitCapacity()` methods

The source code of the `ensureCapacityInternal` method is as follows:

```java
// Calculate the required capacity based on the given minimum capacity and current array elements.
private static int calculateCapacity(Object[] elementData, int minCapacity) {
    // If the current array element is an empty array (initial situation), return the larger value of the default capacity and the minimum capacity as the required capacity
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    // Otherwise, return the minimum capacity directly
    return minCapacity;
}

// Ensure that the internal capacity reaches the specified minimum capacity.
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}
```

The `ensureCapacityInternal` method is very simple, and the `ensureExplicitCapacity` method is directly called internally:

```java
//Determine whether expansion is needed
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;
    //Determine whether the current array capacity is enough to store minCapacity elements
    if (minCapacity - elementData.length > 0)
        //Call the grow method to expand the capacity
        grow(minCapacity);
}
```

Let’s analyze it in detail:

- When we want to `add` the first element to `ArrayList`, `elementData.length` is 0 (because it is still an empty list), because the `ensureCapacityInternal()` method is executed, so `minCapacity` is 10 at this time. At this time, `minCapacity - elementData.length > 0` is established, so the `grow(minCapacity)` method will be entered.
- When `add` the second element, `minCapacity` is 2, and `elementData.length` (capacity) is expanded to `10` after adding the first element. At this time, `minCapacity - elementData.length > 0` does not hold, so the `grow(minCapacity)` method will not be entered (executed).
- When adding the 3rd, 4th... to the 10th element, the grow method will still not be executed, and the array capacity will be 10.

Until the 11th element is added, `minCapacity` (which is 11) is larger than `elementData.length` (which is 10). Enter the `grow` method to expand the capacity.

#### grow method

```java
/**
 * Maximum array size to allocate
 */
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

/**
 * The core method of ArrayList expansion.
 */
private void grow(int minCapacity) {
    // oldCapacity is the old capacity, newCapacity is the new capacity
    int oldCapacity = elementData.length;
    // Shift oldCapacity right one bit, the effect is equivalent to oldCapacity /2,
    // We know that bit operations are much faster than integer division operations. The result of the entire operation is to update the new capacity to 1.5 times the old capacity.
    int newCapacity = oldCapacity + (oldCapacity >> 1);

    // Then check whether the new capacity is greater than the minimum required capacity. If it is still less than the minimum required capacity, then use the minimum required capacity as the new capacity of the array.
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;

    // If the new capacity is greater than MAX_ARRAY_SIZE, enter (execute) the `hugeCapacity()` method to compare minCapacity and MAX_ARRAY_SIZE,
    // If minCapacity is greater than the maximum capacity, the new capacity is `Integer.MAX_VALUE`, otherwise, the new capacity size is MAX_ARRAY_SIZE, which is `Integer.MAX_VALUE - 8`.
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);

    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}```

**`int newCapacity = oldCapacity + (oldCapacity >> 1)`, so the capacity of ArrayList will become about 1.5 times after each expansion (oldCapacity is an even number, which is 1.5 times, otherwise it is about 1.5 times)! ** Odd and even are different, for example: 10+10/2 = 15, 33+33/2=49. If it is an odd number, the decimal will be discarded.

> ">>" (shift operator): >>1 shifting one bit to the right is equivalent to dividing by 2, and shifting n bits to the right is equivalent to dividing by 2 raised to the nth power. Here oldCapacity is obviously shifted right by 1 bit so it is equivalent to oldCapacity /2. For binary operations on big data, displacement operators are much faster than ordinary operators because the program only moves them and does not perform calculations, which improves efficiency and saves resources.

**Let’s explore the `grow()` method through an example: **

- When the first element of `add` is added, `oldCapacity` is 0. After comparison, the first if judgment is established, `newCapacity = minCapacity` (is 10). But the second if judgment will not be established, that is, if `newCapacity` is not larger than `MAX_ARRAY_SIZE`, it will not enter the `hugeCapacity` method. The array capacity is 10, return true in the `add` method, and size is increased to 1.
- When the 11th element of `add` enters the `grow` method, `newCapacity` is 15, which is larger than `minCapacity` (which is 11), and the first if judgment is not true. If the new capacity is not greater than the maximum size of the array, the `hugeCapacity` method will not be entered. The array capacity is expanded to 15, return true in the add method, and size is increased to 11.
- And so on...

**Here is a little more important knowledge point that is easily overlooked:**

- The `length` property in Java is for arrays. For example, if you declare an array and want to know the length of the array, you use the length property.
- The `length()` method in Java is for strings. If you want to see the length of the string, use the `length()` method.
- The `size()` method in Java is for generic collections. If you want to see how many elements this generic has, just call this method to check!

#### hugeCapacity() method

From the source code of the `grow()` method above, we know: if the new capacity is greater than `MAX_ARRAY_SIZE`, enter (execute) the `hugeCapacity()` method to compare `minCapacity` and `MAX_ARRAY_SIZE`. If `minCapacity` is greater than the maximum capacity, the new capacity is `Integer.MAX_VALUE`, otherwise, the new capacity size is `MAX_ARRAY_SIZE` is `Integer.MAX_VALUE - 8`.

```java
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    // Compare minCapacity and MAX_ARRAY_SIZE
    // If minCapacity is large, use Integer.MAX_VALUE as the size of the new array
    // If MAX_ARRAY_SIZE is large, use MAX_ARRAY_SIZE as the size of the new array
    // MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

### `System.arraycopy()` and `Arrays.copyOf()` methods

If we read the source code, we will find that these two methods are called extensively in `ArrayList`. For example: this method is used in the expansion operation we talked about above and methods such as `add(int index, E element)` and `toArray()`!

#### `System.arraycopy()` method

Source code:

```java
    // We found that arraycopy is a native method. Next, we explain the specific meaning of each parameter.
    /**
    * Copy array
    * @param src source array
    * @param srcPos starting position in the source array
    * @param dest target array
    * @param destPos starting position in the target array
    * @param length The number of array elements to copy
    */
    public static native void arraycopy(Object src, int srcPos,
                                        Object dest, int destPos,
                                        int length);
```

Scenario:

```java
    /**
     * Inserts the specified element at the specified position in this list.
     *First call rangeCheckForAdd to perform a limit check on the index; then call the ensureCapacityInternal method to ensure that the capacity is large enough;
     * Then move all members after the index one position back; insert the element into the index position; and finally increase the size by 1.
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1); // Increments modCount!!
        //arraycopy() method implements array copying itself
        //elementData: source array; index: starting position in the source array; elementData: target array; index + 1: starting position in the target array; size - index: the number of array elements to be copied;
        System.arraycopy(elementData, index, elementData, index + 1, size - index);
        elementData[index] = element;
        size++;
    }
```

Let's write a simple method to test the following:

```java
public class ArraycopyTest {

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    int[] a = new int[10];
    a[0] = 0;
    a[1] = 1;
    a[2] = 2;
    a[3] = 3;
    System.arraycopy(a, 2, a, 3, 3);
    a[2]=99;
    for (int i = 0; i < a.length; i++) {
      System.out.print(a[i] + " ");
    }
  }

}
```

Result:

```plain
0 1 99 2 3 0 0 0 0 0
```

#### `Arrays.copyOf()` method

Source code:

```java
    public static int[] copyOf(int[] original, int newLength) {
      //Apply for a new array
        int[] copy = new int[newLength];
  // Call System.arraycopy to copy the data in the source array and return the new array
        System.arraycopy(original, 0, copy, 0,
                         Math.min(original.length, newLength));
        return copy;
    }
```

Scenario:

```java
   /**
     Returns an array containing all the elements in this list in correct order (from first to last element); the runtime type of the returned array is that of the specified array.
     */
    public Object[] toArray() {
    //elementData: array to be copied; size: length to be copied
        return Arrays.copyOf(elementData, size);
    }
```

Personally, I feel that using the `Arrays.copyOf()` method is mainly to expand the original array. The test code is as follows:

```java
public class ArrayscopyOfTest {

  public static void main(String[] args) {
    int[] a = new int[3];
    a[0] = 0;
    a[1] = 1;
    a[2] = 2;
    int[] b = Arrays.copyOf(a, 10);
    System.out.println("b.length"+b.length);
  }
}```

Result:

```plain
10
```

#### The connection and difference between the two

**Contact:**

Looking at the source code of the two, you can find that `copyOf()` actually calls the `System.arraycopy()` method internally

**Difference:**

`arraycopy()` requires a target array. It copies the original array to your own defined array or the original array, and you can choose the starting point and length of the copy and the position in the new array. `copyOf()` means the system automatically creates an array internally and returns the array.

### `ensureCapacity` method

There is an `ensureCapacity` method in the `ArrayList` source code. I don’t know if you have noticed it. This method `ArrayList` has not been called internally, so it is obviously provided for users to call. So what does this method do?

```java
    /**
    If necessary, increase the capacity of this ArrayList instance to ensure that it can hold at least the number of elements specified by the minimum capacity parameter.
     *
     * @param minCapacity the minimum required capacity
     */
    public void ensureCapacity(int minCapacity) {
        int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
            // any size if not default element table
            ? 0
            // larger than default for default empty table. It's already
            // supposed to be at default size.
            : DEFAULT_CAPACITY;

        if (minCapacity > minExpand) {
            ensureExplicitCapacity(minCapacity);
        }
    }

```

In theory, it is better to use the `ensureCapacity` method before adding a large number of elements to an `ArrayList` to reduce the number of incremental reallocations

We actually test the effect of the following method through the following code:

```java
public class EnsureCapacityTest {
  public static void main(String[] args) {
    ArrayList<Object> list = new ArrayList<Object>();
    final int N = 10000000;
    long startTime = System.currentTimeMillis();
    for (int i = 0; i < N; i++) {
      list.add(i);
    }
    long endTime = System.currentTimeMillis();
    System.out.println("Before using the ensureCapacity method: "+(endTime - startTime));

  }
}
```

Running results:

```plain
Before using ensureCapacity method: 2158
```

```java
public class EnsureCapacityTest {
    public static void main(String[] args) {
        ArrayList<Object> list = new ArrayList<Object>();
        final int N = 10000000;
        long startTime1 = System.currentTimeMillis();
        list.ensureCapacity(N);
        for (int i = 0; i < N; i++) {
            list.add(i);
        }
        long endTime1 = System.currentTimeMillis();
        System.out.println("After using the ensureCapacity method: "+(endTime1 - startTime1));
    }
}
```

Running results:

```plain
After using ensureCapacity method: 1773
```

By running the results, we can see that using the `ensureCapacity` method before adding a large number of elements to `ArrayList` can improve performance. However, this performance gap is almost negligible. Moreover, it is impossible to add so many elements to `ArrayList` in actual projects.

<!-- @include: @article-footer.snippet.md -->