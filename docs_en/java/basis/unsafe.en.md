---
title: Java 魔法类 Unsafe 详解
category: Java
tag:
  - Java基础
head:
  - - meta
    - name: keywords
      content: Unsafe,低级操作,内存访问,CAS,堆外内存,本地方法,风险
  - - meta
    - name: description
      content: 介绍 sun.misc.Unsafe 的能力与典型用法，涵盖内存与对象操作、CAS 支持及风险与限制。
---

> 本文整理完善自下面这两篇优秀的文章：
>
> - [Java 魔法类：Unsafe 应用解析 - 美团技术团队 -2019](https://tech.meituan.com/2019/02/14/talk-about-java-magic-class-unsafe.html)
> - [Java 双刃剑之 Unsafe 类详解 - 码农参上 - 2021](https://xie.infoq.cn/article/8b6ed4195e475bfb32dacc5cb)

<!-- markdownlint-disable MD024 -->

阅读过 JUC 源码的同学，一定会发现很多并发工具类都调用了一个叫做 `Unsafe` 的类。

那这个类主要是用来干什么的呢？有什么使用场景呢？这篇文章就带你搞清楚！

## Unsafe 介绍

`Unsafe` 是位于 `sun.misc` 包下的一个类，主要提供一些用于执行低级别、不安全操作的方法，如直接访问系统内存资源、自主管理内存资源等，这些方法在提升 Java 运行效率、增强 Java 语言底层资源操作能力方面起到了很大的作用。但由于 `Unsafe` 类使 Java 语言拥有了类似 C 语言指针一样操作内存空间的能力，这无疑也增加了程序发生相关指针问题的风险。在程序中过度、不正确使用 `Unsafe` 类会使得程序出错的概率变大，使得 Java 这种安全的语言变得不再“安全”，因此对 `Unsafe` 的使用一定要慎重。

另外，`Unsafe` 提供的这些功能的实现需要依赖本地方法（Native Method）。你可以将本地方法看作是 Java 中使用其他编程语言编写的方法。本地方法使用 **`native`** 关键字修饰，Java 代码中只是声明方法头，具体的实现则交给 **本地代码**。

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717115231125.png)

**为什么要使用本地方法呢？**

1. 需要用到 Java 中不具备的依赖于操作系统的特性，Java 在实现跨平台的同时要实现对底层的控制，需要借助其他语言发挥作用。
2. 对于其他语言已经完成的一些现成功能，可以使用 Java 直接调用。
3. 程序对时间敏感或对性能要求非常高时，有必要使用更加底层的语言，例如 C/C++甚至是汇编。

在 JUC 包的很多并发工具类在实现并发机制时，都调用了本地方法，通过它们打破了 Java 运行时的界限，能够接触到操作系统底层的某些功能。对于同一本地方法，不同的操作系统可能会通过不同的方式来实现，但是对于使用者来说是透明的，最终都会得到相同的结果。

## Unsafe 创建

`sun.misc.Unsafe` 部分源码如下：

```java
public final class Unsafe {
  // 单例对象
  private static final Unsafe theUnsafe;
  ......
  private Unsafe() {
  }
  @CallerSensitive
  public static Unsafe getUnsafe() {
    Class var0 = Reflection.getCallerClass();
    // 仅在引导类加载器`BootstrapClassLoader`加载时才合法
    if(!VM.isSystemDomainLoader(var0.getClassLoader())) {
      throw new SecurityException("Unsafe");
    } else {
      return theUnsafe;
    }
  }
}
```

`Unsafe` 类为一单例实现，提供静态方法 `getUnsafe` 获取 `Unsafe`实例。这个看上去貌似可以用来获取 `Unsafe` 实例。但是，当我们直接调用这个静态方法的时候，会抛出 `SecurityException` 异常：

```bash
Exception in thread "main" java.lang.SecurityException: Unsafe
 at sun.misc.Unsafe.getUnsafe(Unsafe.java:90)
 at com.cn.test.GetUnsafeTest.main(GetUnsafeTest.java:12)
```

**为什么 `public static` 方法无法被直接调用呢？**

这是因为在`getUnsafe`方法中，会对调用者的`classLoader`进行检查，判断当前类是否由`Bootstrap classLoader`加载，如果不是的话那么就会抛出一个`SecurityException`异常。也就是说，只有启动类加载器加载的类才能够调用 Unsafe 类中的方法，来防止这些方法在不可信的代码中被调用。

**为什么要对 Unsafe 类进行这么谨慎的使用限制呢?**

`Unsafe` 提供的功能过于底层（如直接访问系统内存资源、自主管理内存资源等），安全隐患也比较大，使用不当的话，很容易出现很严重的问题。

**如若想使用 `Unsafe` 这个类的话，应该如何获取其实例呢？**

这里介绍两个可行的方案。

1、利用反射获得 Unsafe 类中已经实例化完成的单例对象 `theUnsafe` 。

```java
private static Unsafe reflectGetUnsafe() {
    try {
      Field field = Unsafe.class.getDeclaredField("theUnsafe");
      field.setAccessible(true);
      return (Unsafe) field.get(null);
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      return null;
    }
}
```

2、从`getUnsafe`方法的使用限制条件出发，通过 Java 命令行命令`-Xbootclasspath/a`把调用 Unsafe 相关方法的类 A 所在 jar 包路径追加到默认的 bootstrap 路径中，使得 A 被引导类加载器加载，从而通过`Unsafe.getUnsafe`方法安全的获取 Unsafe 实例。

```bash
java -Xbootclasspath/a: ${path}   // 其中path为调用Unsafe相关方法的类所在jar包路径
```

## Unsafe 功能

概括的来说，`Unsafe` 类实现功能可以被分为下面 8 类：

1. 内存操作
2. 内存屏障
3. 对象操作
4. 数据操作
5. CAS 操作
6. 线程调度
7. Class 操作
8. 系统信息

### 内存操作

#### 介绍

如果你是一个写过 C 或者 C++ 的程序员，一定对内存操作不会陌生，而在 Java 中是不允许直接对内存进行操作的，对象内存的分配和回收都是由 JVM 自己实现的。但是在 `Unsafe` 中，提供的下列接口可以直接进行内存操作：

```java
//分配新的本地空间
public native long allocateMemory(long bytes);
//重新调整内存空间的大小
public native long reallocateMemory(long address, long bytes);
//将内存设置为指定值
public native void setMemory(Object o, long offset, long bytes, byte value);
//内存拷贝
public native void copyMemory(Object srcBase, long srcOffset,Object destBase, long destOffset,long bytes);
//清除内存
public native void freeMemory(long address);
```

使用下面的代码进行测试：

```java
private void memoryTest() {
    int size = 4;
    // 1. 分配初始内存
    long oldAddr = unsafe.allocateMemory(size);
    System.out.println("Initial address: " + oldAddr);

    // 2. 向初始内存写入数据
    unsafe.putInt(oldAddr, 16843009); // 写入 0x01010101
    System.out.println("Value at oldAddr: " + unsafe.getInt(oldAddr));

    // 3. 重新分配内存
    long newAddr = unsafe.reallocateMemory(oldAddr, size * 2);
    System.out.println("New address: " + newAddr);

    // 4. reallocateMemory 已经将数据从 oldAddr 拷贝到 newAddr
    // 所以 newAddr 的前4个字节应该和 oldAddr 的内容一样
    System.out.println("Value at newAddr (first 4 bytes): " + unsafe.getInt(newAddr));

    // 关键：之后所有操作都应该基于 newAddr，oldAddr 已失效！
    try {
        // 5. 在新内存块的后半部分写入新数据
        unsafe.putInt(newAddr + size, 33686018); // 写入 0x02020202

        // 6. 读取整个8字节的long值
        System.out.println("Value at newAddr (full 8 bytes): " + unsafe.getLong(newAddr));

    } finally {
        // 7. 只释放最后有效的内存地址
        unsafe.freeMemory(newAddr);
        // 如果尝试 freeMemory(oldAddr)，将会导致 double free 错误！
    }
}
```

先看结果输出：

```plain
Initial address: 140467048086752
Value at oldAddr: 16843009
New address: 140467048086752
Value at newAddr (first 4 bytes): 16843009
Value at newAddr (full 8 bytes): 144680345659310337
```

`reallocateMemory` 的行为类似于 C 语言中的 realloc 函数，它会尝试在不移动数据的情况下扩展或收缩内存块。其行为主要有两种情况：

1. **原地扩容**：如果当前内存块后面有足够的连续空闲空间，`reallocateMemory` 会直接在原地址上扩展内存，并返回原始地址。
2. **异地扩容**：如果当前内存块后面空间不足，它会寻找一个新的、足够大的内存区域，将旧数据拷贝过去，然后释放旧的内存地址，并返回新地址。

**结合本次的运行结果，我们可以进行如下分析：**

**第一步：初始分配与写入**

- `unsafe.allocateMemory(size)` 分配了 4 字节的堆外内存，地址为 `140467048086752`。
- `unsafe.putInt(oldAddr, 16843009)` 向该地址写入了 int 值 `16843009`，其十六进制表示为 `0x01010101`。`getInt` 读取正确，证明写入成功。

**第二步：原地内存扩容**

- `long newAddr = unsafe.reallocateMemory(oldAddr, size * 2)` 尝试将内存块扩容至 8 字节。
- 观察输出 New address: `140467048086752`，我们发现 `newAddr` 与 `oldAddr` 的值**完全相同**。
- 这表明本次操作触发了“原地扩容”。系统在原地址 `140467048086752` 后面找到了足够的空间，直接将内存块扩展到了 8 字节。在这个过程中，旧的地址 `oldAddr` 依然有效，并且就是 `newAddr`，数据也并未发生移动。

**第三步：验证数据与写入新数据**

- `unsafe.getInt(newAddr)` 再次读取前 4 个字节，结果仍是 `16843009`，验证了原数据完好无损。
- `unsafe.putInt(newAddr + size, 33686018)` 在扩容出的后 4 个字节（偏移量为 4）写入了新的 int 值 `33686018`（十六进制为 `0x02020202`）。

**第四步：读取完整数据**

- `unsafe.getLong(newAddr)` 从起始地址读取一个 long 值（8 字节）。此时内存中的 8 字节内容为 `0x01010101` (低地址) 和 `0x02020202` (高地址) 的拼接。
- 在小端字节序（Little-Endian）的机器上，这 8 字节在内存中会被解释为十六进制数 `0x0202020201010101`。
- 这个十六进制数转换为十进制，结果正是 `144680345659310337`。这完美地解释了最终的输出结果。

**第五步：安全的内存释放**

- `finally` 块中，`unsafe.freeMemory(newAddr)` 安全地释放了整个 8 字节的内存块。
- 由于本次是原地扩容（`oldAddr == newAddr`），所以即使错误地多写一句 `freeMemory(oldAddr)` 也会导致二次释放的严重错误。

#### 典型应用

`DirectByteBuffer` 是 Java 用于实现堆外内存的一个重要类，通常用在通信过程中做缓冲池，如在 Netty、MINA 等 NIO 框架中应用广泛。`DirectByteBuffer` 对于堆外内存的创建、使用、销毁等逻辑均由 Unsafe 提供的堆外内存 API 来实现。

**为什么要使用堆外内存？**

- 对垃圾回收停顿的改善。由于堆外内存是直接受操作系统管理而不是 JVM，所以当我们使用堆外内存时，即可保持较小的堆内内存规模。从而在 GC 时减少回收停顿对于应用的影响。
- 提升程序 I/O 操作的性能。通常在 I/O 通信过程中，会存在堆内内存到堆外内存的数据拷贝操作，对于需要频繁进行内存间数据拷贝且生命周期较短的暂存数据，都建议存储到堆外内存。

下图为 `DirectByteBuffer` 构造函数，创建 `DirectByteBuffer` 的时候，通过 `Unsafe.allocateMemory` 分配内存、`Unsafe.setMemory` 进行内存初始化，而后构建 `Cleaner` 对象用于跟踪 `DirectByteBuffer` 对象的垃圾回收，以实现当 `DirectByteBuffer` 被垃圾回收时，分配的堆外内存一起被释放。

```java
DirectByteBuffer(int cap) {                   // package-private

    super(-1, 0, cap, cap);
    boolean pa = VM.isDirectMemoryPageAligned();
    int ps = Bits.pageSize();
    long size = Math.max(1L, (long)cap + (pa ? ps : 0));
    Bits.reserveMemory(size, cap);

    long base = 0;
    try {
        // 分配内存并返回基地址
        base = unsafe.allocateMemory(size);
    } catch (OutOfMemoryError x) {
        Bits.unreserveMemory(size, cap);
        throw x;
    }
    // 内存初始化
    unsafe.setMemory(base, size, (byte) 0);
    if (pa && (base % ps != 0)) {
        // Round up to page boundary
        address = base + ps - (base & (ps - 1));
    } else {
        address = base;
    }
    // 跟踪 DirectByteBuffer 对象的垃圾回收，以实现堆外内存释放
    cleaner = Cleaner.create(this, new Deallocator(base, size, cap));
    att = null;
}
```

### 内存屏障

#### 介绍

在介绍内存屏障前，需要知道编译器和 CPU 会在保证程序输出结果一致的情况下，会对代码进行重排序，从指令优化角度提升性能。而指令重排序可能会带来一个不好的结果，导致 CPU 的高速缓存和内存中数据的不一致，而内存屏障（`Memory Barrier`）就是通过阻止屏障两边的指令重排序从而避免编译器和硬件的不正确优化情况。

在硬件层面上，内存屏障是 CPU 为了防止代码进行重排序而提供的指令，不同的硬件平台上实现内存屏障的方法可能并不相同。在 Java8 中，引入了 3 个内存屏障的函数，它屏蔽了操作系统底层的差异，允许在代码中定义、并统一由 JVM 来生成内存屏障指令，来实现内存屏障的功能。

`Unsafe` 中提供了下面三个内存屏障相关方法：

```java
//内存屏障，禁止load操作重排序。屏障前的load操作不能被重排序到屏障后，屏障后的load操作不能被重排序到屏障前
public native void loadFence();
//内存屏障，禁止store操作重排序。屏障前的store操作不能被重排序到屏障后，屏障后的store操作不能被重排序到屏障前
public native void storeFence();
//内存屏障，禁止load、store操作重排序
public native void fullFence();
```

内存屏障可以看做对内存随机访问的操作中的一个同步点，使得此点之前的所有读写操作都执行后才可以开始执行此点之后的操作。以`loadFence`方法为例，它会禁止读操作重排序，保证在这个屏障之前的所有读操作都已经完成，并且将缓存数据设为无效，重新从主存中进行加载。

看到这估计很多小伙伴们会想到`volatile`关键字了，如果在字段上添加了`volatile`关键字，就能够实现字段在多线程下的可见性。基于读内存屏障，我们也能实现相同的功能。下面定义一个线程方法，在线程中去修改`flag`标志位，注意这里的`flag`是没有被`volatile`修饰的：

```java
@Getter
class ChangeThread implements Runnable{
    /**volatile**/ boolean flag=false;
    @Override
    public void run() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("subThread change flag to:" + flag);
        flag = true;
    }
}
```

In the `while` loop of the main thread, add a memory barrier to test whether the modification of `flag` can be sensed:

```java
public static void main(String[] args){
    ChangeThread changeThread = new ChangeThread();
    new Thread(changeThread).start();
    while (true) {
        boolean flag = changeThread.isFlag();
        unsafe.loadFence(); //Add read memory barrier
        if (flag){
            System.out.println("detected flag changed");
            break;
        }
    }
    System.out.println("main thread end");
}
```

Running results:

```plain
subThread change flag to:false
detected flag changed
main thread end
```

And if you delete the `loadFence` method in the above code, then the main thread will not be able to sense the changes in `flag` and will always loop in `while`. The above process can be represented by a diagram:

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144703446.png)

Friends who understand the Java Memory Model (`JMM`) should know that running threads do not directly read variables in the main memory. They can only operate variables in their own working memory and then synchronize them to the main memory, and the working memory of threads cannot be shared. The process in the above figure is that the sub-thread synchronizes the modified results to the main thread with the help of the main memory, and then modifies the work space in the main thread and breaks out of the loop.

#### Typical applications

In Java 8, a new lock mechanism-`StampedLock` was introduced, which can be regarded as an improved version of read-write lock. `StampedLock` provides an implementation of optimistic read locking. This optimistic read lock is similar to a lock-free operation and does not block the writing thread from acquiring the write lock at all, thereby alleviating the "hunger" phenomenon of the writing thread when there is more reading and less writing. Since the optimistic read lock provided by `StampedLock` does not block the writing thread from acquiring the read lock, when the thread shared variable is loaded from the main memory to the thread working memory, there will be data inconsistency problems.

To solve this problem, the `validate` method of `StampedLock` will add a `load` memory barrier through the `loadFence` method of `Unsafe`.

```java
public boolean validate(long stamp) {
   U.loadFence();
   return (stamp & SBITS) == (state & SBITS);
}
```

### Object operations

#### Introduction

**Example**

```java
import sun.misc.Unsafe;
import java.lang.reflect.Field;

public class Main {

    private int value;

    public static void main(String[] args) throws Exception{
        Unsafe unsafe = reflectGetUnsafe();
        assert unsafe != null;
        long offset = unsafe.objectFieldOffset(Main.class.getDeclaredField("value"));
        Main main = new Main();
        System.out.println("value before putInt: " + main.value);
        unsafe.putInt(main, offset, 42);
        System.out.println("value after putInt: " + main.value);
  System.out.println("value after putInt: " + unsafe.getInt(main, offset));
    }

    private static Unsafe reflectGetUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe) field.get(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
```

Output result:

```plain
value before putInt: 0
value after putInt: 42
value after putInt: 42
```

**Object Properties**

We have already tested the memory offset acquisition of object member attributes and the modification of field attribute values in the above example. In addition to the previous `putInt` and `getInt` methods, Unsafe provides all 8 basic data types as well as the `put` and `get` methods of `Object`, and all `put` methods can directly modify the data in memory without access permissions. Reading the comments in the openJDK source code, I found that the reading and writing of basic data types and `Object` are slightly different. The basic data type is a property value (`value`) that is directly manipulated, while the operation of `Object` is based on a reference value (`reference value`). The following are the reading and writing methods of `Object`:

```java
//Get an object reference at the specified offset address of the object
public native Object getObject(Object o, long offset);
//Write an object reference at the specified offset address of the object
public native void putObject(Object o, long offset, Object x);
```

In addition to ordinary reading and writing of object properties, `Unsafe` also provides **volatile reading** and **ordered writing** methods. The coverage of `volatile` reading and writing methods is the same as that of ordinary reading and writing, including all basic data types and `Object` types, taking the `int` type as an example:

```java
//Read an int value at the specified offset address of the object, supporting volatile load semantics
public native int getIntVolatile(Object o, long offset);
//Write an int at the specified offset address of the object, supporting volatile store semantics
public native void putIntVolatile(Object o, long offset, int x);
```

Compared with ordinary reading and writing, `volatile` reading and writing has a higher cost because it needs to ensure visibility and ordering. When executing the `get` operation, the attribute value will be forcibly obtained from the main memory. When the `put` method is used to set the attribute value, the value will be forcibly updated to the main memory, thereby ensuring that these changes are visible to other threads.

There are three methods for orderly writing:

```java
public native void putOrderedObject(Object o, long offset, Object x);
public native void putOrderedInt(Object o, long offset, int x);
public native void putOrderedLong(Object o, long offset, long x);
```

The cost of ordered writing is relatively low compared to `volatile`, because it only guarantees the orderliness when writing, but does not guarantee visibility. That is, the value written by one thread cannot guarantee that other threads will immediately see it. In order to resolve the differences here, we need to further supplement the knowledge about memory barriers. First, we need to understand the concepts of two instructions:

- `Load`: Copies the data in the main memory to the processor's cache
- `Store`: Flushes data cached by the processor into main memory

The difference between sequential writing and `volatile` writing is that the memory barrier type added during sequential writing is `StoreStore` type, while the memory barrier added during `volatile` writing is of `StoreLoad` type, as shown in the following figure:

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144834132.png)In the ordered write method, the `StoreStore` barrier is used, which ensures that `Store1` flushes data to memory immediately, before `Store2` and subsequent store instruction operations. In `volatile` writing, the `StoreLoad` barrier is used. This barrier ensures that `Store1` immediately refreshes data to memory. This operation precedes `Load2` and subsequent load instructions. Moreover, the `StoreLoad` barrier will cause all memory access instructions before the barrier, including storage instructions and access instructions, to be executed before the memory access instructions after the barrier are executed.

To sum up, among the above three types of writing methods, in terms of writing efficiency, the efficiency gradually decreases in the order of `put`, `putOrder`, and `putVolatile`.

**Object instantiation**

Using the `allocateInstance` method of `Unsafe` allows us to instantiate objects in an unconventional way. First, define an entity class and assign values to its member variables in the constructor:

```java
@Data
public class A {
    private int b;
    public A(){
        this.b =1;
    }
}
```

Create objects in different ways based on constructors, reflection and `Unsafe` methods for comparison:

```java
public void objTest() throws Exception{
    A a1=new A();
    System.out.println(a1.getB());
    A a2 = A.class.newInstance();
    System.out.println(a2.getB());
    A a3= (A) unsafe.allocateInstance(A.class);
    System.out.println(a3.getB());
}
```

The printed results are 1, 1, and 0 respectively, indicating that during the object creation process through the `allocateInstance` method, the constructor of the class will not be called. When creating an object in this way, only the `Class` object is used, so if you want to skip the initialization phase of the object or skip the safety check of the constructor, you can use this method. In the above example, if the constructor of class A is changed to `private` type, the object will not be created through the constructor and reflection (the object can be created after setAccessible through the constructor object), but the `allocateInstance` method is still valid.

#### Typical applications

- **Conventional object instantiation method**: The methods we usually use to create objects are essentially created through the new mechanism. However, a characteristic of the new mechanism is that when a class only provides a parameterized constructor and does not explicitly declare a parameterless constructor, the parameterized constructor must be used for object construction. When using a parameterized constructor, a corresponding number of parameters must be passed to complete object instantiation.
- **Unconventional instantiation method**: Unsafe provides the allocateInstance method, which can create this type of instance object only through the Class object, and there is no need to call its constructor, initialization code, JVM security check, etc. It suppresses modifier detection, that is, even if the constructor is privately modified, it can be instantiated through this method, and the corresponding object can be created by simply mentioning the class object. Due to this feature, allocateInstance has corresponding applications in java.lang.invoke, Objenesis (which provides an object generation method that bypasses the class constructor), and Gson (used during deserialization).

### Array operations

#### Introduction

The two methods `arrayBaseOffset` and `arrayIndexScale` are used together to locate the memory location of each element in the array.

```java
//Return the offset address of the first element in the array
public native int arrayBaseOffset(Class<?> arrayClass);
//Return the size occupied by an element in the array
public native int arrayIndexScale(Class<?> arrayClass);
```

#### Typical applications

These two methods related to data operations have typical applications in `AtomicIntegerArray` under the `java.util.concurrent.atomic` package (which can implement atomic operations on each element in the `Integer` array), as shown in the `AtomicIntegerArray` source code below, through `arrayBaseOffset` and `arrayIndexScale` of `Unsafe` Get the offset address `base` and the single element size factor `scale` of the first element of the array respectively. Subsequent related atomic operations rely on these two values ​​to position elements in the array. The `getAndAdd` method shown in Figure 2 below obtains the offset address of an array element through the `checkedByteOffset` method, and then implements atomic operations through CAS.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144927257.png)

### CAS operations

#### Introduction

This part is mainly about methods of CAS related operations.

```java
/**
  *CAS
  * @param o Contains the object of the field to be modified
  * @param offset The offset of a field in the object
  * @param expected expected value
  * @param update update value
  * @return true | false
  */
public final native boolean compareAndSwapObject(Object o, long offset, Object expected, Object update);

public final native boolean compareAndSwapInt(Object o, long offset, int expected, int update);

public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```

**What is CAS?** CAS stands for Compare And Swap, which is a technology commonly used when implementing concurrent algorithms. A CAS operation consists of three operands - the memory location, the expected original value, and the new value. When performing a CAS operation, the value of the memory location is compared with the expected original value. If they match, the processor will automatically update the location value to the new value. Otherwise, the processor will not do anything. We all know that CAS is an atomic instruction of the CPU (cmpxchg instruction) and will not cause the so-called data inconsistency problem. The underlying implementation of the CAS methods (such as `compareAndSwapXXX`) provided by `Unsafe` is the CPU instruction `cmpxchg`.

#### Typical applications

CAS operations are widely used in the concurrency tool classes of the JUC package. CAS has been mentioned many times in the previous articles introducing `synchronized` and `AQS`, and it plays an extensive role in concurrency tool classes as optimistic locking. In the `Unsafe` class, `compareAndSwapObject`, `compareAndSwapInt` and `compareAndSwapLong` methods are provided to implement CAS operations on `Object`, `int` and `long` types. Take the `compareAndSwapInt` method as an example:

```java
public final native boolean compareAndSwapInt(Object o, long offset,int expected,int x);
```

In the parameter, `o` is the object that needs to be updated, and `offset` is the offset of the integer field in object `o`. If the value of this field is the same as `expected`, the value of the field is set to the new value of `x`, and this update cannot be interrupted, which is an atomic operation. Here is an example using `compareAndSwapInt`:

```java
private volatile int a;
public static void main(String[] args){
    CasTest casTest=new CasTest();
    new Thread(()->{
        for (int i = 1; i < 5; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
    new Thread(()->{
        for (int i = 5; i <10; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
}

private void increment(int x){
    while (true){
        try {
            long fieldOffset = unsafe.objectFieldOffset(CasTest.class.getDeclaredField("a"));
            if (unsafe.compareAndSwapInt(this,fieldOffset,x-1,x))
                break;
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}```

Running the code will output:

```plain
1 2 3 4 5 6 7 8 9
```

If you paste the above code into the IDE and run it, you will find that the target output result cannot be obtained. A friend has pointed out this problem on Github: [issue#2650](https://github.com/Snailclimb/JavaGuide/issues/2650). Here is the corrected code:

```java
private volatile int a = 0; // Shared variable, initial value is 0
private static final Unsafe unsafe;
private static final long fieldOffset;

static {
    try {
        // Get Unsafe instance
        Field theUnsafe = Unsafe.class.getDeclaredField("theUnsafe");
        theUnsafe.setAccessible(true);
        unsafe = (Unsafe) theUnsafe.get(null);
        // Get the memory offset of field a
        fieldOffset = unsafe.objectFieldOffset(CasTest.class.getDeclaredField("a"));
    } catch (Exception e) {
        throw new RuntimeException("Failed to initialize Unsafe or field offset", e);
    }
}

public static void main(String[] args) {
    CasTest casTest = new CasTest();

    Thread t1 = new Thread(() -> {
        for (int i = 1; i <= 4; i++) {
            casTest.incrementAndPrint(i);
        }
    });

    Thread t2 = new Thread(() -> {
        for (int i = 5; i <= 9; i++) {
            casTest.incrementAndPrint(i);
        }
    });

    t1.start();
    t2.start();

    // Wait for the thread to finish so you can observe the complete output (optional, for demonstration)
    try {
        t1.join();
        t2.join();
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}

// Encapsulate the increment and print operations in a more atomic method
private void incrementAndPrint(int targetValue) {
    while (true) {
        int currentValue = a; // Read the current value of a
        // Only attempt to update if the current value of a is equal to the previous value of the target value
        if (currentValue == targetValue - 1) {
            if (unsafe.compareAndSwapInt(this, fieldOffset, currentValue, targetValue)) {
                // CAS is successful, indicating that a is successfully updated to targetValue
                System.out.print(targetValue + " ");
                break; //Exit the loop after successfully updating and printing
            }
            // If CAS fails, it means that the value of a was modified by other threads between reading currentValue and executing CAS.
            // At this time, currentValue is no longer the latest value of a, and you need to re-read and try again.
        }
        // If currentValue != targetValue - 1, it means that it is not the current thread's turn to update yet.
        // Or it has been updated by other threads, giving up the CPU to other threads.
        // For strictly sequential increment scenarios, if current > targetValue - 1, it may mean a logic error or an infinite loop.
        // But in this example, we expect the threads to execute sequentially.
        Thread.yield(); // Prompts the CPU scheduler to switch threads to reduce invalid spins
    }
}
```

In the above example, we create two threads, both of which try to modify the shared variable a. When each thread calls the `incrementAndPrint(targetValue)` method:

1. The current value of a `currentValue` will be read first.
2. Check if `currentValue` is equal to `targetValue - 1` (i.e. the previous value expected).
3. If the condition is met, call `unsafe.compareAndSwapInt()` to try to update `a` from `currentValue` to `targetValue`.
4. If the CAS operation is successful (returns true), print `targetValue` and exit the loop.
5. If the CAS operation fails, or `currentValue` does not meet the conditions, the current thread will continue to loop (spin) and try to give up the CPU through `Thread.yield()` until it is successfully updated and printed or the conditions are met.

This mechanism ensures that each number (from 1 to 9) is successfully set and printed only once, and in sequence.

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144939826.png)

Things to note are:

1. **Spin logic:** The `compareAndSwapInt` method itself only performs a comparison and swap operation and returns the result immediately. Therefore, to ensure that the operation eventually succeeds (if the value is as expected), we need to explicitly implement spin logic in the code (such as a `while(true)` loop) that keeps trying until the CAS operation succeeds.
2. **`AtomicInteger` implementation:** The `java.util.concurrent.atomic.AtomicInteger` class in JDK uses similar CAS operations and spin logic to implement its atomic `getAndIncrement()`, `compareAndSet()` and other methods. Using `AtomicInteger` directly is generally safer and more recommended, as it encapsulates the underlying complexity.
3. **ABA problem:** The CAS operation itself has an ABA problem (if a value changes from A to B, and then back to A, the CAS check will think that the value has not changed). In some scenarios, if the value change history is important, it may be necessary to use `AtomicStampedReference` to solve it. But in this simple incremental scenario, ABA issues usually don't matter.
4. **CPU consumption:** Long-term spin will consume CPU resources. When competition is fierce or conditions are not met for a long time, you can consider adding more complex backoff strategies (such as `Thread.sleep()` or `LockSupport.parkNanos()`) for optimization.

### Thread scheduling

#### Introduction

The `Unsafe` class provides `park`, `unpark`, `monitorEnter`, `monitorExit` and `tryMonitorEnter` methods for thread scheduling.

```java
//Cancel blocking thread
public native void unpark(Object thread);
//Block thread
public native void park(boolean isAbsolute, long time);
//Obtain object lock (reentrant lock)
@Deprecated
public native void monitorEnter(Object o);
//Release object lock
@Deprecated
public native void monitorExit(Object o);
//Try to acquire the object lock
@Deprecated
public native boolean tryMonitorEnter(Object o);
```

The methods `park` and `unpark` can realize the suspension and recovery of threads. Suspending a thread is achieved through the `park` method. After calling the `park` method, the thread will be blocked until conditions such as timeout or interruption occur; `unpark` can terminate a suspended thread and return it to normal.

In addition, three methods related to `monitor` in the `Unsafe` source code have been marked as `deprecated` and are not recommended to be used:

```java
//Get object lock
@Deprecated
public native void monitorEnter(Object var1);
//Release object lock
@Deprecated
public native void monitorExit(Object var1);
//Try to obtain the object lock
@Deprecated
public native boolean tryMonitorEnter(Object var1);```

The `monitorEnter` method is used to obtain the object lock, and `monitorExit` is used to release the object lock. If this method is executed on an object that is not locked by `monitorEnter`, an `IllegalMonitorStateException` exception will be thrown. The `tryMonitorEnter` method attempts to acquire the object lock and returns `true` if successful, otherwise it returns `false`.

#### Typical applications

The core class `AbstractQueuedSynchronizer` (AQS) of the Java lock and synchronizer framework implements thread blocking and awakening by calling `LockSupport.park()` and `LockSupport.unpark()`, and the `park` and `unpark` methods of `LockSupport` are actually implemented by calling the `park` and `unpark` methods of `Unsafe`.

```java
public static void park(Object blocker) {
    Thread t = Thread.currentThread();
    setBlocker(t, blocker);
    UNSAFE.park(false, 0L);
    setBlocker(t, null);
}
public static void unpark(Thread thread) {
    if (thread != null)
        UNSAFE.unpark(thread);
}
```

The `park` method of `LockSupport` calls the `park` method of `Unsafe` to block the current thread. After this method blocks the thread, it will not continue to execute until other threads call the `unpark` method to wake up the current thread. The following example tests these two methods of `Unsafe`:

```java
public static void main(String[] args) {
    Thread mainThread = Thread.currentThread();
    new Thread(()->{
        try {
            TimeUnit.SECONDS.sleep(5);
            System.out.println("subThread try to unpark mainThread");
            unsafe.unpark(mainThread);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();

    System.out.println("park main mainThread");
    unsafe.park(false,0L);
    System.out.println("unpark mainThread success");
}
```

The program output is:

```plain
park main mainThread
subThread try to unpark mainThread
unpark mainThread success
```

The process of program running is also relatively easy to understand. After the child thread starts running, it sleeps first to ensure that the main thread can call the `park` method to block itself. After the child thread sleeps for 5 seconds, it calls the `unpark` method to wake up the main thread so that the main thread can continue to execute. The entire process is shown in the figure below:

![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717144950116.png)

### Class operations

#### Introduction

`Unsafe` related operations on `Class` mainly include class loading and static variable operation methods.

**Static property reading related methods**

```java
//Get the offset of the static attribute
public native long staticFieldOffset(Field f);
//Get the object pointer of the static attribute
public native Object staticFieldBase(Field f);
//Determine whether the class needs to be initialized (used to detect before obtaining the static properties of the class)
public native boolean shouldBeInitialized(Class<?> c);
```

Create a class containing static properties for testing:

```java
@Data
public class User {
    public static String name="Hydra";
    int age;
}
private void staticTest() throws Exception {
    User user=new User();
    // You can also use the following statement to trigger class initialization
    // 1.
    // unsafe.ensureClassInitialized(User.class);
    // 2.
    // System.out.println(User.name);
    System.out.println(unsafe.shouldBeInitialized(User.class));
    Field sexField = User.class.getDeclaredField("name");
    long fieldOffset = unsafe.staticFieldOffset(sexField);
    Object fieldBase = unsafe.staticFieldBase(sexField);
    Object object = unsafe.getObject(fieldBase, fieldOffset);
    System.out.println(object);
}
```

Running results:

```plain
false
Hydra
```

In the object operation of `Unsafe`, we learned to obtain the object property offset through the `objectFieldOffset` method and access the value of the variable based on it, but it does not apply to static properties in the class. In this case, you need to use the `staticFieldOffset` method. In the above code, `Class` is only relied on in the process of obtaining the `Field` object, and it no longer depends on `Class` when obtaining the properties of static variables.

In the above code, a `User` object is first created. This is because if a class has not been initialized, then its static properties will not be initialized, and the last field attribute obtained will be `null`. Therefore, before obtaining static properties, you need to call the `shouldBeInitialized` method to determine whether the class needs to be initialized before obtaining it. If you delete the statement that creates the User object, the running result will become:

```plain
true
null
```

**Using the `defineClass` method allows the program to dynamically create a class at runtime**

```java
public native Class<?> defineClass(String name, byte[] b, int off, int len, ClassLoader loader,ProtectionDomain protectionDomain);
```

In actual use, you can only pass in the byte array, the subscript of the starting byte and the byte length to be read. By default, the class loader (`ClassLoader`) and protection domain (`ProtectionDomain`) are derived from the instance that calls this method. In the following example, the function of decompiling the generated class file is implemented:

```java
private static void defineTest() {
    String fileName="F:\\workspace\\unsafe-test\\target\\classes\\com\\cn\\model\\User.class";
    File file = new File(fileName);
    try(FileInputStream fis = new FileInputStream(file)) {
        byte[] content=new byte[(int)file.length()];
        fis.read(content);
        Class clazz = unsafe.defineClass(null, content, 0, content.length, null, null);
        Object o = clazz.newInstance();
        Object age = clazz.getMethod("getAge").invoke(o, null);
        System.out.println(age);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

In the above code, a `class` file is first read and converted into a byte array through the file stream. Then a class is dynamically created using the `defineClass` method, and its instantiation is subsequently completed. The process is as shown in the figure below, and the class created in this way will skip all security checks of the JVM.![](https://oss.javaguide.cn/github/javaguide/java/basis/unsafe/image-20220717145000710.png)

In addition to the `defineClass` method, Unsafe also provides a `defineAnonymousClass` method:

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

This method can be used to dynamically create an anonymous class. In a `Lambda` expression, ASM is used to dynamically generate bytecode, and then this method is used to define an anonymous class that implements the corresponding functional interface. Among the new features released in JDK 15, in the Hidden classes section, it is pointed out that the `defineAnonymousClass` method of `Unsafe` will be deprecated in future versions.

#### Typical applications

Lambda expression implementation needs to rely on the `defineAnonymousClass` method of `Unsafe` to define an anonymous class that implements the corresponding functional interface.

### System information

#### Introduction

This section contains two methods for obtaining system-related information.

```java
//Return the size of the system pointer. The return value is 4 (32-bit systems) or 8 (64-bit systems).
public native int addressSize();
//The size of the memory page, this value is a power of 2.
public native int pageSize();
```

#### Typical applications

These two methods have relatively few application scenarios. In the `java.nio.Bits` class, when using `pageCount` to calculate the number of required memory pages, the `pageSize` method is called to obtain the size of the memory page. In addition, when using the `copySwapMemory` method to copy memory, the `addressSize` method is called to detect the situation of 32-bit systems.

## Summary

In this article, we first introduce the basic concepts and working principles of `Unsafe`, and on this basis, we explain and practice its API. I believe that through this process, everyone will find that `Unsafe` can indeed provide us with programming convenience in certain scenarios. But back to the topic at the beginning, there are indeed some security risks when using these conveniences. In my opinion, it is not terrible that a technology has unsafe factors. What is terrible is that it is abused during use. Although there were rumors that the `Unsafe` class would be removed in Java 9, it has still survived into Java 16. According to the logic that existence is reasonable, as long as it is used properly, it can still bring us a lot of help. Therefore, in the end, it is recommended that everyone use `Unsafe` with caution and avoid abuse.

<!-- @include: @article-footer.snippet.md -->