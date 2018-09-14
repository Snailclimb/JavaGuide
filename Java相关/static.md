
# static 关键字

## static 关键字主要有以下四种使用场景

1. 修饰成员变量和成员方法
2. 静态代码块
3. 修饰类(只能修饰内部类)
4. 静态导包(用来导入类中的静态资源，1.5之后的新特性)

###  修饰成员变量和成员方法(常用)

被 static 修饰的成员属于类，不属于单个这个类的某个对象，被类中所有对象共享，可以并且建议通过类名调用。被static 声明的成员变量属于静态成员变量，静态变量 存放在 Java 内存区域的方法区。

方法区与 Java 堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。虽然Java虚拟机规范把方法区描述为堆的一个逻辑部分，但是它却有一个别名叫做 Non-Heap（非堆），目的应该是与 Java 堆区分开来。

 HotSpot 虚拟机中方法区也常被称为 “永久代”，本质上两者并不等价。仅仅是因为 HotSpot 虚拟机设计团队用永久代来实现方法区而已，这样 HotSpot 虚拟机的垃圾收集器就可以像管理 Java 堆一样管理这部分内存了。但是这并不是一个好主意，因为这样更容易遇到内存溢出问题。



调用格式：

- 类名.静态变量名
- 类名.静态方法名()

如果变量或者方法被 private 则代表该属性或者该方法只能在类的内部被访问而不能在类的外部被方法。

测试方法：

```java
public class StaticBean {

    String name;
    静态变量
    static int age;

    public StaticBean(String name) {
        this.name = name;
    }
    静态方法
    static void SayHello() {
        System.out.println(Hello i am java);
    }
    @Override
    public String toString() {
        return StaticBean{ +
                name=' + name + ''' + age + age +
                '}';
    }
}
```

```java
public class StaticDemo {

    public static void main(String[] args) {
        StaticBean staticBean = new StaticBean(1);
        StaticBean staticBean2 = new StaticBean(2);
        StaticBean staticBean3 = new StaticBean(3);
        StaticBean staticBean4 = new StaticBean(4);
        StaticBean.age = 33;
        StaticBean{name='1'age33} StaticBean{name='2'age33} StaticBean{name='3'age33} StaticBean{name='4'age33}
        System.out.println(staticBean+ +staticBean2+ +staticBean3+ +staticBean4);
        StaticBean.SayHello();Hello i am java
    }

}
```


### 静态代码块

静态代码块定义在类中方法外, 静态代码块在非静态代码块之前执行(静态代码块—非静态代码块—构造方法)。 该类不管创建多少对象，静态代码块只执行一次.

静态代码块的格式是 

```
static {    
语句体;   
}
```


一个类中的静态代码块可以有多个，位置可以随便放，它不在任何的方法体内，JVM加载类时会执行这些静态的代码块，如果静态代码块有多个，JVM将按照它们在类中出现的先后顺序依次执行它们，每个代码块只会被执行一次。

![enter image description here](httpsimg-blog.csdn.net20180107161309133watermark2textaHR0cDovL2Jsb2cuY3Nkbi5uZXQvY2hlbjEzNTc5ODY3ODMxfont5a6L5L2Tfontsize400fillI0JBQkFCMA==dissolve70gravitySouthEast)

静态代码块对于定义在它之后的静态变量，可以赋值，但是不能访问.


### 静态内部类

静态内部类与非静态内部类之间存在一个最大的区别，我们知道非静态内部类在编译完成之后会隐含地保存着一个引用，该引用是指向创建它的外围内，但是静态内部类却没有。没有这个引用就意味着：

1.  它的创建是不需要依赖外围类的创建。
2. 它不能使用任何外围类的非static成员变量和方法。


Example（静态内部类实现单例模式）

```java
public class Singleton {
    
    声明为 private 避免调用默认构造方法创建对象
    private Singleton() {
    }
    
    声明为 private 表明静态内部该类只能在该 Singleton 类中被访问
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getUniqueInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

当 Singleton 类加载时，静态内部类 SingletonHolder 没有被加载进内存。只有当调用 `getUniqueInstance() `方法从而触发 `SingletonHolder.INSTANCE` 时 SingletonHolder 才会被加载，此时初始化 INSTANCE 实例，并且 JVM 能确保 INSTANCE 只被实例化一次。

这种方式不仅具有延迟初始化的好处，而且由 JVM 提供了对线程安全的支持。

### 静态导包

格式为：import static 

这两个关键字连用可以指定导入某个类中的指定静态资源，并且不需要使用类名调用类中静态成员，可以直接使用类中静态成员变量和成员方法

```java


  Math. --- 将Math中的所有静态资源导入，这时候可以直接使用里面的静态方法，而不用通过类名进行调用
  如果只想导入单一某个静态方法，只需要将换成对应的方法名即可
 
import static java.lang.Math.;

  换成import static java.lang.Math.max;具有一样的效果
 
public class Demo {
	public static void main(String[] args) {
 
		int max = max(1,2);
		System.out.println(max);
	}
}

```


##  补充内容

### 静态方法与非静态方法

静态方法属于类本身，非静态方法属于从该类生成的每个对象。 如果您的方法执行的操作不依赖于其类的各个变量和方法，请将其设置为静态（这将使程序的占用空间更小）。 否则，它应该是非静态的。

Example

```java
class Foo {
    int i;
    public Foo(int i) { 
       this.i = i;
    }

    public static String method1() {
       return An example string that doesn't depend on i (an instance variable);
       
    }

    public int method2() {
       return this.i + 1;  Depends on i
    }

}
```
你可以像这样调用静态方法：`Foo.method1（）`。 如果您尝试使用这种方法调用 method2 将失败。 但这样可行：`Foo bar = new Foo（1）;bar.method2（）;`

总结：

- 在外部调用静态方法时，可以使用”类名.方法名”的方式，也可以使用”对象名.方法名”的方式。而实例方法只有后面这种方式。也就是说，调用静态方法可以无需创建对象。 
- 静态方法在访问本类的成员时，只允许访问静态成员（即静态成员变量和静态方法），而不允许访问实例成员变量和实例方法；实例方法则无此限制 

### static{}静态代码块与{}非静态代码块（构造代码块）

相同点： 都是在JVM加载类时且在构造方法执行之前执行，在类中都可以定义多个，定义多个时按定义的顺序执行，一般在代码块中对一些static变量进行赋值。 

不同点： 静态代码块在非静态代码块之前执行(静态代码块—非静态代码块—构造方法)。静态代码块只在第一次new执行一次，之后不再执行，而非静态代码块在每new一次就执行一次。 非静态代码块可在普通方法中定义(不过作用不大)；而静态代码块不行。 

一般情况下,如果有些代码比如一些项目最常用的变量或对象必须在项目启动的时候就执行的时候,需要使用静态代码块,这种代码是主动执行的。如果我们想要设计不需要创建对象就可以调用类中的方法，例如：Arrays类，Character类，String类等，就需要使用静态方法, 两者的区别是 静态代码块是自动执行的而静态方法是被调用的时候才执行的. 

Example

```java
public class Test {
    public Test() {
        System.out.print(默认构造方法！--);
    }

     非静态代码块
    {
        System.out.print(非静态代码块！--);
    }
     静态代码块
    static {
        System.out.print(静态代码块！--);
    }

    public static void test() {
        System.out.print(静态方法中的内容! --);
        {
            System.out.print(静态方法中的代码块！--);
        }

    }
    public static void main(String[] args) {

        Test test = new Test();   
        Test.test();静态代码块！--静态方法中的内容! --静态方法中的代码块！--
    }
```

当执行 `Test.test();` 时输出：

```
静态代码块！--静态方法中的内容! --静态方法中的代码块！--
```

当执行 `Test test = new Test();` 时输出：

```
静态代码块！--非静态代码块！--默认构造方法！--
```


非静态代码块与构造函数的区别是： 非静态代码块是给所有对象进行统一初始化，而构造函数是给对应的对象初始化，因为构造函数是可以多个的，运行哪个构造函数就会建立什么样的对象，但无论建立哪个对象，都会先执行相同的构造代码块。也就是说，构造代码块中定义的是不同对象共性的初始化内容。	

### 参考

- httpsblog.csdn.netchen13579867831articledetails78995480
- httpwww.cnblogs.comchenssyp3388487.html
- httpwww.cnblogs.comQian123p5713440.html