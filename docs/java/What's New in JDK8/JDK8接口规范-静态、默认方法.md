JDK8接口规范
===
在JDK8中引入了lambda表达式，出现了函数式接口的概念，为了在扩展接口时保持向前兼容性(比如泛型也是为了保持兼容性而失去了在一些别的语言泛型拥有的功能)，Java接口规范发生了一些改变。。
---
## 1.JDK8以前的接口规范
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
## 2.JDK8之后的接口规范
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
可以看到 default关键字修饰的方法是像实例方法一样定义的，所以我们来定义一个只有default的方法并且实现一下试一试。
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
可以看到default方法确实像实例方法一样，必须有实例对象才能调用，并且子类在实现接口时，可以不用实现default方法，也可以覆盖该方法。
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
那么如果一个类实现了两个没有继承关系的接口，且这两个接口有同名方法的话会怎么样呢？IDE会要求你重写这个冲突的方法，让你自己选择去执行哪个方法，因为IDE它
还没智能到你不告诉它，它就知道你想执行哪个方法。可以通过```java 接口名.super```指针来访问接口中定义的实例(default)方法。
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
