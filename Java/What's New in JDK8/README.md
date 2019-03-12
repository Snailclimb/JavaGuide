JDK8新特性总结
======
总结了部分JDK8新特性，另外一些新特性可以通过Oracle的官方文档查看，毕竟是官方文档，各种新特性都会介绍，有兴趣的可以去看。<br>
[Oracle官方文档:What's New in JDK8](https://www.oracle.com/technetwork/java/javase/8-whats-new-2157071.html)
-----
- [Java语言特性](#JavaProgrammingLanguage)
  - [Lambda表达式是一个新的语言特性，已经在JDK8中加入。它是一个可以传递的代码块，你也可以把它们当做方法参数。
  Lambda表达式允许您更紧凑地创建单虚方法接口（称为功能接口）的实例。](#LambdaExpressions)
  
  - [方法引用为已经存在的具名方法提供易于阅读的Lambda表达式](#MethodReferences)
  
  - [默认方法允许将新功能添加到库的接口，并确保与为这些接口的旧版本编写的代码的二进制兼容性。](#DefaultMethods)
  
  - [改进的类型推断。](#ImprovedTypeInference)
      
  - [方法参数反射(通过反射获得方法参数信息)](#MethodParameterReflection)  
  
- [流(stream)](#stream)
  - [新java.util.stream包中的类提供Stream API以支持对元素流的功能样式操作。流(stream)和I/O里的流不是同一个概念
     ，使用stream API可以更方便的操作集合。]()
  
- [国际化]()
   - 待办
- 待办
___ 
<!-- ---------------------------------------------------Lambda表达式-------------------------------------------------------- -->
<!-- 标题与跳转-->
<span id="JavaProgrammingLanguage"></span> 
<span id="LambdaExpressions"></span>
<!-- 标题与跳转结束-->
<!-- 正文-->

## 　　　　　　　　　　　　　Lambda表达式
### 1.什么是Lambda表达式
**Lambda表达式实质上是一个可传递的代码块，Lambda又称为闭包或者匿名函数，是函数式编程语法，让方法可以像普通参数一样传递**

### 2.Lambda表达式语法
```(参数列表) -> {执行代码块}```
<br>参数列表可以为空```()->{}```
<br>可以加类型声明比如```(String para1, int para2) -> {return para1 + para2;}```我们可以看到，lambda同样可以有返回值.
<br>在编译器可以推断出类型的时候，可以将类型声明省略，比如```(para1, para2) -> {return para1 + para2;}```
<br>(lambda有点像动态类型语言语法。lambda在字节码层面是用invokedynamic实现的，而这条指令就是为了让JVM更好的支持运行在其上的动态类型语言)

### 3.函数式接口
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
### 4.变量作用域
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
对于lambda表达式```java inner = (s) -> {System.out.print(x);};```,变量x并不是在lambda表达式中定义的，像这样并不是在lambda中定义或者通过lambda
的参数列表()获取的变量成为自由变量，它是被lambda表达式捕获的。
<br>lambda表达式和内部类一样，对外部自由变量捕获时，外部自由变量必须为final或者是最终变量(effectively final)的，也就是说这个变量初始化后就不能为它赋新值，同时lambda不像内部类/匿名类，lambda表达式与外围嵌套块有着相同的作用域，因此对变量命名的有关规则对lambda同样适用。大家阅读上面的代码对这些概念应该不难理解。
<span id="MethodReferences"></span>
### 5.方法引用
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
### 总结
Lambda表达式是JDK8引入Java的函数式编程语法，使用Lambda需要直接或者间接的与函数式接口配合，在开发中使用Lambda可以减少代码量，
但是并不是说必须要使用Lambda(虽然它是一个很酷的东西)。有些情况下使用Lambda会使代码的可读性急剧下降，并且也节省不了多少代码，
所以在实际开发中还是需要仔细斟酌是否要使用Lambda。和Lambda相似的还有JDK10中加入的var类型推断，同样对于这个特性需要斟酌使用。

<!-- ---------------------------------------------------Lambda表达式结束---------------------------------------------------- -->
___
<!-- ---------------------------------------------------接口默认方法-------------------------------------------------------- -->
<span id="DefaultMethods"></span>
## 　　　　　　　　　　　　　JDK8接口规范
### 在JDK8中引入了lambda表达式，出现了函数式接口的概念，为了在扩展接口时保持向前兼容性(比如泛型也是为了保持兼容性而失去了在一些别的语言泛型拥有的功能)，Java接口规范发生了一些改变。。
### 1.JDK8以前的接口规范
- JDK8以前接口可以定义的变量和方法
   - 所有变量(Field)不论是否<i>显式</i> 的声明为```public static final```，它实际上都是```public static final```的。
   - 所有方法(Method)不论是否<i>显示</i> 的声明为```public abstract```，它实际上都是```public abstract```的。
```java
public interface AInterfaceBeforeJDK8 {
    int FIELD = 0;
    void simpleMethod();
}
```
以上接口信息反编译以后可以看到字节码信息里Filed是public static final的，而方法是public abstract的，即是你没有显示的去声明它。
```java
{
    public static final int FIELD;
    descriptor: I
    flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL
    ConstantValue: int 0

  public abstract void simpleMethod();
    descriptor: ()V
    flags: (0x0401) ACC_PUBLIC, ACC_ABSTRACT
}
```
### 2.JDK8之后的接口规范
- JDK8之后接口可以定义的变量和方法
  - 变量(Field)仍然必须是 ```java public static final```的
  - 方法(Method)除了可以是public abstract之外，还可以是public static或者是default(相当于仅public修饰的实例方法)的。
从以上改变不难看出，修改接口的规范主要是为了能在扩展接口时保持向前兼容。
<br>下面是一个JDK8之后的接口例子
```java
public interface AInterfaceInJDK8 {
    int simpleFiled = 0;
    static int staticField = 1;

    public static void main(String[] args) {
    }
    static void staticMethod(){}

    default void defaultMethod(){}

    void simpleMethod() throws IOException;

}
```
进行反编译(去除了一些没用信息)
```java
{
  public static final int simpleFiled;
    flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL

  public static final int staticField;
    flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL

  public static void main(java.lang.String[]);
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    
  public static void staticMethod();
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC

  public void defaultMethod();
    flags: (0x0001) ACC_PUBLIC

  public abstract void simpleMethod() throws java.io.IOException;
    flags: (0x0401) ACC_PUBLIC, ACC_ABSTRACT
    Exceptions:
      throws java.io.IOException
}
```
可以看到 default关键字修饰的方法是像实例方法(就是普通类中定义的普通方法)一样定义的，所以我们来定义一个只有default方法的接口并且实现一下这个接口试一
试。
```java
interface Default {
    default int defaultMethod() {
        return 4396;
    }
}

public class DefaultMethod implements Default {
    public static void main(String[] args) {
        DefaultMethod defaultMethod = new DefaultMethod();
        System.out.println(defaultMethod.defaultMethod());
        //compile error : Non-static method 'defaultMethod()' cannot be referenced from a static context
        //! DefaultMethod.defaultMethod();
    }
}
```
可以看到default方法确实像实例方法一样，必须有实例对象才能调用，并且子类在实现接口时，可以不用实现default方法，也可以选择覆盖该方法。
这有点像子类继承父类实例方法。
<br>
接口静态方法就像是类静态方法，唯一的区别是**接口静态方法只能通过接口名调用，而类静态方法既可以通过类名调用也可以通过实例调用**
```java
interface Static {
    static int staticMethod() {
        return 4396;
    }
}
 ... main(String...args)
    //!compile error: Static method may be invoked on containing interface class only
    //!aInstanceOfStatic.staticMethod();
 ...
```
另一个问题是多继承问题，大家知道Java中类是不支持多继承的，但是接口是多继承和多实现(implements后跟多个接口)的，
那么如果一个接口继承另一个接口，两个接口都有同名的default方法会怎么样呢？答案是会像类继承一样覆写(@Override)，以下代码在IDE中可以顺利编译
```java
interface Default {
    default int defaultMethod() {
        return 4396;
    }
}
interface Default2 extends Default {
    @Override
    default int defaultMethod() {
        return 9527;
    }
}
public class DefaultMethod implements Default,Default2 {
    public static void main(String[] args) {
        DefaultMethod defaultMethod = new DefaultMethod();
        System.out.println(defaultMethod.defaultMethod());
    }
}

输出 : 9527
```
出现上面的情况时，会优先找继承树上近的方法，类似于“短路优先”。
<br>
那么如果一个类实现了两个没有继承关系的接口，且这两个接口有同名方法的话会怎么样呢？IDE会要求你重写这个冲突的方法，让你自己选择去执行哪个方法，因为IDE它还没智能到你不告诉它，它就知道你想执行哪个方法。可以通过```java 接口名.super```指针来访问接口中定义的实例(default)方法。
```java
interface Default {
    default int defaultMethod() {
        return 4396;
    }
}

interface Default2 {
    default int defaultMethod() {
        return 9527;
    }
}
//如果不重写
//compile error : defaults.DefaultMethod inherits unrelated defaults for defaultMethod() from types defaults.Default and defaults.Default2
public class DefaultMethod implements Default,Default2 {
@Override
    public int defaultMethod() {
        System.out.println(Default.super.defaultMethod());
        System.out.println(Default2.super.defaultMethod());
        return 996;
    }
    public static void main(String[] args) {
        DefaultMethod defaultMethod = new DefaultMethod();
        System.out.println(defaultMethod.defaultMethod());
    }
}

运行输出 : 
4396
9527
996
```

<!-- ---------------------------------------------------接口默认方法结束---------------------------------------------------- -->
___
<!-- --------------------------------------------------- 改进的类型推断 ---------------------------------------------------- -->
<span id="ImprovedTypeInference"></span>
## 　　　　　　　　　　　　　改进的类型推断
### 1.什么是类型推断
类型推断就像它的字面意思一样，编译器根据<b><i>你显示声明的已知的信息</i></b> 推断出你没有显示声明的类型，这就是类型推断。
看过《Java编程思想 第四版》的朋友可能还记得里面讲解泛型一章的时候，里面很多例子是下面这样的:
```java
  Map<String, Object> map = new Map<String, Object>();
```
而我们平常写的都是这样的:
```java
  Map<String, Object> map = new Map<>();
```
这就是类型推断，《Java编程思想 第四版》这本书出书的时候最新的JDK只有1.6(JDK7推出的类型推断)，在Java编程思想里Bruce Eckel大叔还提到过这个问题
(可能JDK的官方人员看了Bruce Eckel大叔的Thinking in Java才加的类型推断，☺)，在JDK7中推出了上面这样的类型推断，可以减少一些无用的代码。
(Java编程思想到现在还只有第四版，是不是因为Bruce Eckel大叔觉得Java新推出的语言特性“然并卵”呢？/滑稽)
<br>
在JDK7中，类型推断只有上面例子的那样的能力，即只有在使用**赋值语句**时才能自动推断出泛型参数信息(即<>里的信息)，下面的官方文档里的例子在JDK7里会编译
错误
```java
  List<String> stringList = new ArrayList<>();
  stringList.add("A");
  //error : addAll(java.util.Collection<? extends java.lang.String>)in List cannot be applied to (java.util.List<java.lang.Object>)
  stringList.addAll(Arrays.asList());  
```
但是上面的代码在JDK8里可以通过，也就说，JDK8里，类型推断不仅可以用于赋值语句，而且可以根据代码中上下文里的信息推断出更多的信息，因此我们需要些的代码
会更少。加强的类型推断还有一个就是用于Lambda表达式了。
<br>
大家其实不必细究类型推断，在日常使用中IDE会自动判断，当IDE自己无法推断出足够的信息时，就需要我们额外做一下工作，比如在<>里添加更多的类型信息，
相信随着Java的进化，这些便利的功能会越来越强大。

<!-- --------------------------------------------------- 改进的类型推断结束------------------------------------------------- -->
____
<!-- --------------------------------------------------- 反射获得方法参数信息------------------------------------------------- -->
<span id="MethodParameterReflection"></span>
## 　　　　　　　　　　　　　通过反射获得方法的参数信息
JDK8之前 .class文件是不会存储方法参数信息的，因此也就无法通过反射获取该信息(想想反射获取类信息的入口是什么？当然就是Class类了)。即是是在JDK11里
也不会默认生成这些信息，可以通过在javac加上-parameters参数来让javac生成这些信息(javac就是java编译器，可以把java文件编译成.class文件)。生成额外
的信息(运行时非必须信息)会消耗内存并且有可能公布敏感信息(某些方法参数比如password，JDK文档里这么说的)，并且确实很多信息javac并不会为我们生成，比如
LocalVariableTable，javac就不会默认生成，需要你加上 -g:vars来强制让编译器生成，同样的，方法参数信息也需要加上
-parameters来让javac为你在.class文件中生成这些信息，否则运行时反射是无法获取到这些信息的。在讲解Java语言层面的方法之前，先看一下javac加上该
参数和不加生成的信息有什么区别(不感兴趣想直接看运行代码的可以跳过这段)。下面是随便写的一个类。
```java
public class ByteCodeParameters {
    public String simpleMethod(String canUGetMyName, Object yesICan) {
        return "9527";
    }
}
```
先来不加参数编译和反编译一下这个类javac ByteCodeParameters.java , javap -v ByteCodeParameters:
```java
  //只截取了部分信息
  public java.lang.String simpleMethod(java.lang.String, java.lang.Object);
    descriptor: (Ljava/lang/String;Ljava/lang/Object;)Ljava/lang/String;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=3, args_size=3
         0: ldc           #2                  // String 9527
         2: areturn
      LineNumberTable:
        line 5: 0
  //这个方法的描述到这里就结束了
```
接下来我们加上参数javac -parameters ByteCodeParameters.java 再来看反编译的信息:
```java
 public java.lang.String simpleMethod(java.lang.String, java.lang.Object);
    descriptor: (Ljava/lang/String;Ljava/lang/Object;)Ljava/lang/String;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=3, args_size=3
         0: ldc           #2                  // String 9527
         2: areturn
      LineNumberTable:
        line 8: 0
    MethodParameters:
      Name                           Flags
      canUGetMyName
      yesICan
```
可以看到.class文件里多了一个MethodParameters信息，这就是参数的名字，可以看到默认是不保存的。
<br>下面看一下在Intelj Idea里运行的这个例子，我们试一下通过反射获取方法名 :
```java
public class ByteCodeParameters {
    public String simpleMethod(String canUGetMyName, Object yesICan) {
        return "9527";
    }

    public static void main(String[] args) throws NoSuchMethodException {
        Class<?> clazz = ByteCodeParameters.class;
        Method simple = clazz.getDeclaredMethod("simpleMethod", String.class, Object.class);
        Parameter[] parameters = simple.getParameters();
        for (Parameter p : parameters) {
            System.out.println(p.getName());
        }
    }
}
输出 :
arg0
arg1
```
？？？说好的方法名呢？？？？别急，哈哈。前面说了，默认是不生成参数名信息的，因此我们需要做一些配置，我们找到IDEA的settings里的Java Compiler选项，在
Additional command line parameters:一行加上-parameters(Eclipse 也是找到Java Compiler选中Stoer information about method parameters)，或者自
己编译一个.class文件放在IDEA的out下，然后再来运行 :
```java
输出 :
canUGetMyName
yesICan
```
这样我们就通过反射获取到参数信息了。想要了解更多的同学可以自己研究一下 [官方文档]
(https://docs.oracle.com/javase/tutorial/reflect/member/methodparameterreflection.html)
<br>
## 总结与补充
在JDK8之后，可以通过-parameters参数来让编译器生成参数信息然后在运行时通过反射获取方法参数信息，其实在SpringFramework
里面也有一个LocalVariableTableParameterNameDiscoverer对象可以获取方法参数名信息，有兴趣的同学可以自行百度(这个类在打印日志时可能会比较有用吧，个人感觉)。
<!-- --------------------------------------------------- 反射获得方法参数信息结束------------------------------------------------- -->
____
<!-- --------------------------------------------------- JDK8流库------------------------------------------------------------- -->
<span id="stream"></span>

<!-- --------------------------------------------------- JDK8流库结束------------------------------------------------- -->
___
