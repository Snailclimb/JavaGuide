<!-- TOC -->

- [0.0.1. 泛型的实际应用:实现最小值函数](#001-%e6%b3%9b%e5%9e%8b%e7%9a%84%e5%ae%9e%e9%99%85%e5%ba%94%e7%94%a8%e5%ae%9e%e7%8e%b0%e6%9c%80%e5%b0%8f%e5%80%bc%e5%87%bd%e6%95%b0)
- [0.0.2. 使用数组实现栈](#002-%e4%bd%bf%e7%94%a8%e6%95%b0%e7%bb%84%e5%ae%9e%e7%8e%b0%e6%a0%88)
- [0.0.3. 实现线程安全的 LRU 缓存](#003-%e5%ae%9e%e7%8e%b0%e7%ba%bf%e7%a8%8b%e5%ae%89%e5%85%a8%e7%9a%84-lru-%e7%bc%93%e5%ad%98)

<!-- /TOC -->

### 0.0.1. 泛型的实际应用:实现最小值函数

自己设计一个泛型的获取数组最小值的函数.并且这个方法只能接受Number的子类并且实现了Comparable接口。

```java
//注意：Number并没有实现Comparable
private static <T extends Number & Comparable<? super T>> T min(T[] values) {
    if (values == null || values.length == 0) return null;
    T min = values[0];
    for (int i = 1; i < values.length; i++) {
        if (min.compareTo(values[i]) > 0) min = values[i];
    }
    return min;
}
```

测试：

```java
int minInteger = min(new Integer[]{1, 2, 3});//result:1
double minDouble = min(new Double[]{1.2, 2.2, -1d});//result:-1d
String typeError = min(new String[]{"1","3"});//报错
```
### 0.0.2. 使用数组实现栈

**自己实现一个栈，要求这个栈具有`push()`、`pop()`（返回栈顶元素并出栈）、`peek()` （返回栈顶元素不出栈）、`isEmpty()`、`size()`这些基本的方法。**

提示：每次入栈之前先判断栈的容量是否够用，如果不够用就用`Arrays.copyOf()`进行扩容；

```java
public class MyStack {
    private int[] storage;//存放栈中元素的数组
    private int capacity;//栈的容量
    private int count;//栈中元素数量
    private static final int GROW_FACTOR = 2;

    //不带初始容量的构造方法。默认容量为8
    public MyStack() {
        this.capacity = 8;
        this.storage=new int[8];
        this.count = 0;
    }

    //带初始容量的构造方法
    public MyStack(int initialCapacity) {
        if (initialCapacity < 1)
            throw new IllegalArgumentException("Capacity too small.");

        this.capacity = initialCapacity;
        this.storage = new int[initialCapacity];
        this.count = 0;
    }

    //入栈
    public void push(int value) {
        if (count == capacity) {
            ensureCapacity();
        }
        storage[count++] = value;
    }

    //确保容量大小
    private void ensureCapacity() {
        int newCapacity = capacity * GROW_FACTOR;
        storage = Arrays.copyOf(storage, newCapacity);
        capacity = newCapacity;
    }

    //返回栈顶元素并出栈
    private int pop() {
        if (count == 0)
            throw new IllegalArgumentException("Stack is empty.");
        count--;
        return storage[count];
    }

    //返回栈顶元素不出栈
    private int peek() {
        if (count == 0){
            throw new IllegalArgumentException("Stack is empty.");
        }else {
            return storage[count-1];
        }
    }

    //判断栈是否为空
    private boolean isEmpty() {
        return count == 0;
    }

    //返回栈中元素的个数
    private int size() {
        return count;
    }

}

```

验证

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
myStack.pop();//报错：java.lang.IllegalArgumentException: Stack is empty.
```



