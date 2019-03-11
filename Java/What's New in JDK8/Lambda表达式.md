JDK8--Lambda表达式
===
## 1.什么是Lambda表达式
**Lambda表达式实质上是一个可传递的代码块，Lambda又称为闭包或者匿名函数，是函数式编程语法，让方法可以像普通参数一样传递**

## 2.Lambda表达式语法
```(参数列表) -> {执行代码块}```
<br>参数列表可以为空```()->{}```
<br>可以加类型声明比如```(String para1, int para2) -> {return para1 + para2;}```我们可以看到，lambda同样可以有返回值.
<br>在编译器可以推断出类型的时候，可以将类型声明省略，比如```(para1, para2) -> {return para1 + para2;}```
<br>(lambda有点像动态类型语言语法。lambda在字节码层面是用invokedynamic实现的，而这条指令就是为了让JVM更好的支持运行在其上的动态类型语言)

## 3.函数式接口
在了解Lambda表达式之前，有必要先了解什么是函数式接口```(@FunctionalInterface)```<br>
**函数式接口指的是有且只有一个抽象(abstract)方法的接口**<br>
当需要一个函数式接口的对象时，就可以用Lambda表达式来实现，举个常用的例子:
<br>
```java
  Thread thread = new Thread(() -> {
      System.out.println("This is JDK8's Lambda!");
  });
```
这段代码和函数式接口有啥关系？我们回忆一下，Thread类的构造函数里是不是有一个以Runnable接口为参数的？
```java
public Thread(Runnable target) {...}

/**
 * Runnable Interface
 */
@FunctionalInterface
public interface Runnable {  
    public abstract void run();
}
```
到这里大家可能已经明白了，**Lambda表达式相当于一个匿名类或者说是一个匿名方法**。上面Thread的例子相当于
```java
  Thread thread = new Thread(new Runnable() {
      @Override
      public void run() {
          System.out.println("Anonymous class");
      }
  });
```
也就是说，上面的lambda表达式相当于实现了这个run()方法，然后当做参数传入(个人感觉可以这么理解,lambda表达式就是一个函数，只不过它的返回值、参数列表都
由编译器帮我们推断，因此可以减少很多代码量)。
<br>Lambda也可以这样用 :
```java
  Runnable runnable = () -> {...};
```
其实这和上面的用法没有什么本质上的区别。
<br>至此大家应该明白什么是函数式接口以及函数式接口和lambda表达式之间的关系了。在JDK8中修改了接口的规范，
目的是为了在给接口添加新的功能时保持向前兼容(个人理解)，比如一个已经定义了的函数式接口，某天我们想给它添加新功能，那么就不能保持向前兼容了，
因为在旧的接口规范下，添加新功能必定会破坏这个函数式接口[(JDK8中接口规范)]()
<br>
除了上面说的Runnable接口之外，JDK中已经存在了很多函数式接口
比如(当然不止这些):
- ```java.util.concurrent.Callable```
- ```java.util.Comparator```
- ```java.io.FileFilter```
<br>**关于JDK中的预定义的函数式接口**

- JDK在```java.util.function```下预定义了很多函数式接口
  - ```Function<T, R> {R apply(T t);}``` 接受一个T对象，然后返回一个R对象，就像普通的函数。
  - ```Consumer<T> {void accept(T t);}``` 消费者 接受一个T对象，没有返回值。
  - ```Predicate<T> {boolean test(T t);}``` 判断，接受一个T对象，返回一个布尔值。
  - ```Supplier<T> {T get();} 提供者(工厂)``` 返回一个T对象。
  - 其他的跟上面的相似，大家可以看一下function包下的具体接口。
## 4.变量作用域
```java
public class VaraibleHide {
    @FunctionalInterface
    interface IInner {
        void printInt(int x);
    }
    public static void main(String[] args) {
        int x = 20;
        IInner inner = new IInner() {
            int x = 10;
            @Override
            public void printInt(int x) {
                System.out.println(x);
            }
        };
        inner.printInt(30);
        
        inner = (s) -> {
            //Variable used in lambda expression should be final or effectively final
            //!int x = 10;
            //!x= 50; error
            System.out.print(x);
        };
        inner.printInt(30);
    }
}
输出 :
30
20
```
对于lambda表达式```java inner = (s) -> {System.out.print(x);};```,变量x并不是在lambda表达式中定义的，像这样并不是在lambda中定义或者通过lambda的参数列表()获取的变量成为自由变量，它是被lambda表达式捕获的。
<br>lambda表达式和内部类一样，对外部自由变量捕获时，外部自由变量必须为final或者是最终变量(effectively final)的，也就是说这个变量初始化后就不能为它赋新值，
同时lambda不像内部类/匿名类，lambda表达式与外围嵌套块有着相同的作用域，因此对变量命名的有关规则对lambda同样适用。大家阅读上面的代码对这些概念应该
不难理解。
## 5.[方法引用](../方法引用.md)
