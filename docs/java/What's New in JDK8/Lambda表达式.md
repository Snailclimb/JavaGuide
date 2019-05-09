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
## 5.方法引用
**只需要提供方法的名字，具体的调用过程由Lambda和函数式接口来确定，这样的方法调用成为方法引用。**
<br>下面的例子会打印list中的每个元素:
```java
List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10; ++i) {
            list.add(i);
        }
        list.forEach(System.out::println);
```
其中```System.out::println```这个就是一个方法引用，等价于Lambda表达式 ```(para)->{System.out.println(para);}```
<br>我们看一下List#forEach方法 ```default void forEach(Consumer<? super T> action)```可以看到它的参数是一个Consumer接口，该接口是一个函数式接口
```java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
```
大家能发现这个函数接口的方法和```System.out::println```有什么相似的么？没错，它们有着相似的参数列表和返回值。
<br>我们自己定义一个方法，看看能不能像标准输出的打印函数一样被调用
```java
public class MethodReference {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10; ++i) {
            list.add(i);
        }
        list.forEach(MethodReference::myPrint);
    }

    static void myPrint(int i) {
        System.out.print(i + ", ");
    }
}

输出: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
```
可以看到，我们自己定义的方法也可以当做方法引用。
<br>到这里大家多少对方法引用有了一定的了解，我们再来说一下方法引用的形式。
- 方法引用
  - 类名::静态方法名
  - 类名::实例方法名
  - 类名::new (构造方法引用)
  - 实例名::实例方法名
可以看出，方法引用是通过(方法归属名)::(方法名)来调用的。通过上面的例子已经讲解了一个`类名::静态方法名`的使用方法了，下面再依次介绍其余的几种
方法引用的使用方法。<br>
**类名::实例方法名**<br>
先来看一段代码
```java
  String[] strings = new String[10];
  Arrays.sort(strings, String::compareToIgnoreCase);
```
**上面的String::compareToIgnoreCase等价于(x, y) -> {return x.compareToIgnoreCase(y);}**<br>
我们看一下`Arrays#sort`方法`public static <T> void sort(T[] a, Comparator<? super T> c)`,
可以看到第二个参数是一个Comparator接口，该接口也是一个函数式接口，其中的抽象方法是`int compare(T o1, T o2);`，再看一下
`String#compareToIgnoreCase`方法,`public int compareToIgnoreCase(String str)`，这个方法好像和上面讲方法引用中`类名::静态方法名`不大一样啊，它
的参数列表和函数式接口的参数列表不一样啊，虽然它的返回值一样？
<br>是的，确实不一样但是别忘了，String类的这个方法是个实例方法，而不是静态方法，也就是说，这个方法是需要有一个接收者的。所谓接收者就是
instance.method(x)中的instance，
它是某个类的实例，有的朋友可能已经明白了。上面函数式接口的`compare(T o1, T o2)`中的第一个参数作为了实例方法的接收者，而第二个参数作为了实例方法的
参数。我们再举一个自己实现的例子:
```java
public class MethodReference {
    static Random random = new Random(47);
    public static void main(String[] args) {
        MethodReference[] methodReferences = new MethodReference[10];
        Arrays.sort(methodReferences, MethodReference::myCompare);
    }
    int myCompare(MethodReference o) {
        return random.nextInt(2) - 1;
    }
}
```
上面的例子可以在IDE里通过编译，大家有兴趣的可以模仿上面的例子自己写一个程序，打印出排序后的结果。
<br>**构造器引用**<br>
构造器引用仍然需要与特定的函数式接口配合使用，并不能像下面这样直接使用。IDE会提示String不是一个函数式接口
```java
  //compile error : String is not a functional interface
  String str = String::new;
```
下面是一个使用构造器引用的例子，可以看出构造器引用可以和这种工厂型的函数式接口一起使用的。
```java
  interface IFunctional<T> {
    T func();
}

public class ConstructorReference {

    public ConstructorReference() {
    }

    public static void main(String[] args) {
        Supplier<ConstructorReference> supplier0 = () -> new ConstructorReference();
        Supplier<ConstructorReference> supplier1 = ConstructorReference::new;
        IFunctional<ConstructorReference> functional = () -> new ConstructorReference();
        IFunctional<ConstructorReference> functional1 = ConstructorReference::new;
    }
}
```
下面是一个JDK官方的例子
```java
  public static <T, SOURCE extends Collection<T>, DEST extends Collection<T>>
    DEST transferElements(
        SOURCE sourceCollection,
        Supplier<DEST> collectionFactory) {

        DEST result = collectionFactory.get();
        for (T t : sourceCollection) {
            result.add(t);
        }
        return result;
    }
    
    ...
    
    Set<Person> rosterSet = transferElements(
            roster, HashSet::new);
```

**实例::实例方法**
<br>
其实开始那个例子就是一个实例::实例方法的引用
```java
List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10; ++i) {
            list.add(i);
        }
        list.forEach(System.out::println);
```
其中System.out就是一个实例，println是一个实例方法。相信不用再给大家做解释了。
## 总结
Lambda表达式是JDK8引入Java的函数式编程语法，使用Lambda需要直接或者间接的与函数式接口配合，在开发中使用Lambda可以减少代码量，
但是并不是说必须要使用Lambda(虽然它是一个很酷的东西)。有些情况下使用Lambda会使代码的可读性急剧下降，并且也节省不了多少代码，
所以在实际开发中还是需要仔细斟酌是否要使用Lambda。和Lambda相似的还有JDK10中加入的var类型推断，同样对于这个特性需要斟酌使用。
