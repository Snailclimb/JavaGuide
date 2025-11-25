---
title: Detailed explanation of Java syntactic sugar
category: Java
tag:
  - Java basics
head:
  - - meta
    - name: keywords
      content: syntactic sugar, automatic boxing and unboxing, generics, enhanced for, variable parameters, enumerations, inner classes, type inference
  - - meta
    - name: description
      content: Summarizes common syntax sugars in Java and the "sugar-unblocking" principle at compile time, helping to improve efficiency while understanding the underlying mechanism and avoiding misuse.
---

> Author: Hollis
>
> Original text: <https://mp.weixin.qq.com/s/o4XdEMq1DL-nBS-f8Za5Aw>

Syntactic sugar is a common knowledge point asked in Java interviews at major companies.

From the perspective of Java compilation principles, this article goes deep into bytecode and class files, peels off the cocoons, and understands the principles and usage of syntactic sugar in Java. It helps everyone learn how to use Java syntactic sugar while also understanding the principles behind these syntactic sugars.

## What is syntactic sugar?

**Syntactic Sugar**, also known as sugar-coated syntax, is a term invented by British computer scientist Peter.J. Landin. It refers to a certain syntax added to a computer language. This syntax has no impact on the function of the language, but is more convenient for programmers to use. In short, syntactic sugar makes programs more concise and more readable.

![](https://oss.javaguide.cn/github/javaguide/java/basis/syntactic-sugar/image-20220818175953954.png)

> Interestingly, in the field of programming, in addition to syntactic sugar, there are also terms such as syntactic salt and syntactic saccharine. The space is limited and I will not expand on this here.

There is syntactic sugar in almost every programming language we are familiar with. The author believes that the amount of syntactic sugar is one of the criteria for judging whether a language is awesome or not. Many people say that Java is a "low-sugar language". In fact, various sugars have been added to the Java language since Java 7, mainly developed under the "Project Coin" project. Although some people still think that Java is low in sugar now, it will continue to develop in the direction of "high sugar" in the future.

## What are the common syntactic sugars in Java?

As mentioned earlier, the existence of syntactic sugar is mainly for the convenience of developers. But in fact, the **Java virtual machine does not support these syntactic sugars. These syntax sugars will be reduced to simple basic syntax structures during the compilation phase. This process is the decoding of syntax sugars. **

Speaking of compilation, everyone must know that in the Java language, the `javac` command can compile the source file with the suffix `.java` into bytecode with the suffix `.class` that can run on the Java virtual machine. If you look at the source code of `com.sun.tools.javac.main.JavaCompiler`, you will find that one step in `compile()` is to call `desugar()`. This method is responsible for decoding the implementation of syntax sugar.

The most commonly used syntactic sugars in Java include generics, variable-length parameters, conditional compilation, automatic unboxing, inner classes, etc. This article mainly analyzes the principles behind these syntactic sugars. Step by step, peel off the sugar coating and see the essence.

We will use [decompilation](https://mp.weixin.qq.com/s?__biz=MzI3NzE0NjcwMg==&mid=2650120609&idx=1&sn=5659f96310963ad57d55b48cee63c7 88&chksm=f36bbc80c41c3596a1e4bf9501c6280481f1b9e06d07af354474e6f3ed366fef016df673a7ba&scene=21#wechat_redirect), you can pass [Decompilers online](http://www.javadecompilers.com/) Decompiles Class files online.

### switch supports String and enumeration

As mentioned earlier, starting from Java 7, the syntactic sugar in the Java language has gradually become richer. One of the more important ones is that `switch` in Java 7 begins to support `String`.

Before we start, let’s do some popular science. `switch` in Java itself supports basic types. For example, `int`, `char`, etc. For `int` types, numerical comparisons are performed directly. For the `char` type, its ascii code is compared. Therefore, for the compiler, only integers can be used in `switch`, and any type of comparison must be converted to integers. For example `byte`. `short`, `char` (ascii code is integer type) and `int`.

Then let’s take a look at `switch`’s support for `String`. There is the following code:

```java
public class switchDemoString {
    public static void main(String[] args) {
        String str = "world";
        switch (str) {
        case "hello":
            System.out.println("hello");
            break;
        case "world":
            System.out.println("world");
            break;
        default:
            break;
        }
    }
}
```

The decompiled content is as follows:

```java
public class switchDemoString
{
    public switchDemoString()
    {
    }
    public static void main(String args[])
    {
        String str = "world";
        String s;
        switch((s = str).hashCode())
        {
        default:
            break;
        case 99162322:
            if(s.equals("hello"))
                System.out.println("hello");
            break;
        case 113318802:
            if(s.equals("world"))
                System.out.println("world");
            break;
        }
    }
}
```

Seeing this code, you know that the original **string switch is implemented through the `equals()` and `hashCode()` methods. ** Fortunately, the `hashCode()` method returns `int`, not `long`.

A closer look reveals that what is being switched is actually the hash value, and then a security check is performed by comparing it using the equals method. This check is necessary because the hashes may collide. So its performance is not as good as using enums for `switch` or using pure integer constants, but it's not bad either.

### Generics

We all know that many languages support generics, but what many people don't know is that different compilers handle generics in different ways. Usually, a compiler has two ways to handle generics: `Code specialization` and `Code sharing`. C++ and C# use the `Code specialization` processing mechanism, while Java uses the `Code sharing` mechanism.

> Code sharing creates a unique bytecode representation for each generic type, and maps instances of the generic type to this unique bytecode representation. Mapping multiple instances of a generic type to a unique bytecode representation is achieved through type erasure (`type erasue`).

In other words, **for the Java virtual machine, he does not know the syntax of `Map<String, String> map` at all. Syntactic sugar needs to be decoded through type erasure during the compilation phase. **

The main process of type erasure is as follows: 1. Replace all generic parameters with their leftmost boundary (top-level parent type) type. 2. Remove all type parameters.

The following code:

```java
Map<String, String> map = new HashMap<String, String>();
map.put("name", "hollis");
map.put("wechat", "Hollis");
map.put("blog", "www.hollischuang.com");
```

After decoding the syntax sugar, it becomes:

```java
Map map = new HashMap();
map.put("name", "hollis");
map.put("wechat", "Hollis");
map.put("blog", "www.hollischuang.com");
```

The following code:

```java
public static <A extends Comparable<A>> A max(Collection<A> xs) {
    Iterator<A> xi = xs.iterator();
    A w = xi.next();
    while (xi.hasNext()) {
        A x = xi.next();
        if (w.compareTo(x) < 0)
            w = x;
    }
    return w;
}```

After type erasure it will become:

```java
 public static Comparable max(Collection xs){
    Iterator xi = xs.iterator();
    Comparable w = (Comparable)xi.next();
    while(xi.hasNext())
    {
        Comparable x = (Comparable)xi.next();
        if(w.compareTo(x) < 0)
            w = x;
    }
    return w;
}
```

**There are no generics in the virtual machine, only ordinary classes and ordinary methods. The type parameters of all generic classes will be erased at compile time. Generic classes do not have their own unique `Class` class object. For example, there is no `List<String>.class` or `List<Integer>.class`, but only `List.class`. **

### Automatic boxing and unboxing

Automatic boxing means Java automatically converts primitive type values into corresponding objects. For example, converting an int variable into an Integer object is called boxing. Conversely, converting an Integer object into an int type value is called unboxing. Because the boxing and unboxing here are automatic and non-human conversions, they are called automatic boxing and unboxing. The corresponding encapsulation classes of primitive types byte, short, char, int, long, float, double and boolean are Byte, Short, Character, Integer, Long, Float, Double and Boolean.

Let’s first look at the autoboxing code:

```java
 public static void main(String[] args) {
    int i = 10;
    Integer n = i;
}
```

The decompiled code is as follows:

```java
public static void main(String args[])
{
    int i = 10;
    Integer n = Integer.valueOf(i);
}
```

Let’s look at the code for automatic unboxing:

```java
public static void main(String[] args) {

    Integer i = 10;
    int n = i;
}
```

The decompiled code is as follows:

```java
public static void main(String args[])
{
    Integer i = Integer.valueOf(10);
    int n = i.intValue();
}
```

It can be seen from the decompiled content that the `valueOf(int)` method of `Integer` is automatically called during boxing. What is automatically called during unboxing is the `intValue` method of `Integer`.

Therefore, the **boxing process is implemented by calling the wrapper's valueOf method, and the unboxing process is implemented by calling the wrapper's xxxValue method. **

### Variable length parameters

Variable arguments (`variable arguments`) are a feature introduced in Java 1.5. It allows a method to take any number of values ​​as parameters.

Consider the following variadic code, where the `print` method receives variadic arguments:

```java
public static void main(String[] args)
    {
        print("Holis", "Public account: Hollis", "Blog: www.hollischuang.com", "QQ: 907607222");
    }

public static void print(String... strs)
{
    for (int i = 0; i < strs.length; i++)
    {
        System.out.println(strs[i]);
    }
}
```

Decompiled code:

```java
 public static void main(String args[])
{
    print(new String[] {
        "Holis", "\u516C\u4F17\u53F7:Hollis", "\u535A\u5BA2\uFF1Awww.hollischuang.com", "QQ\uFF1A907607222"
    });
}

public static transient void print(String strs[])
{
    for(int i = 0; i < strs.length; i++)
        System.out.println(strs[i]);

}
```

It can be seen from the decompiled code that when variable parameters are used, they will first create an array. The length of the array is the number of actual parameters passed when calling the method, and then put all the parameter values ​​into this array, and then pass this array as a parameter to the called method. (Note: `transient` is only meaningful when modifying member variables. The "modified method" here is because the same value is used in javassist to represent `transient` and `vararg` respectively. See [Here](https://github.com/jboss-javassist/javassist/blob/7302b8b0a09f04d344a26ebe57f29f3db43f2a3e/src/main/javassist/bytecode/AccessFlag.java#L32).

### Enumeration

Java SE5 provides a new type - Java's enumeration type. The keyword `enum` can create a limited set of named values into a new type, and these named values can be used as regular program components. This is a very useful feature.

If you want to see the source code, you must first have a class. So what is the enumeration type? Is it `enum`? The answer is obviously no. `enum` is just like `class`. It is just a keyword. It is not a class. So what class is the enumeration maintained by? We simply write an enumeration:

```java
public enum t {
    SPRING,SUMMER;
}
```

Then we use decompilation to see how this code is implemented. The code content after decompilation is as follows:

```java
//The Java compiler will automatically process the enumeration name into a legal class name (the first letter is capitalized): t -> T
public final class T extends Enum
{
    private T(String s, int i)
    {
        super(s, i);
    }
    public static T[] values()
    {
        T at[];
        int i;
        T at1[];
        System.arraycopy(at = ENUM$VALUES, 0, at1 = new T[i = at.length], 0, i);
        return at1;
    }

    public static T valueOf(String s)
    {
        return (T)Enum.valueOf(demo/T, s);
    }

    public static final T SPRING;
    public static final T SUMMER;
    private static final T ENUM$VALUES[];
    static
    {
        SPRING = new T("SPRING", 0);
        SUMMER = new T("SUMMER", 1);
        ENUM$VALUES = (new T[] {
            SPRING, SUMMER
        });
    }
}
```

By decompiling the code, we can see that `public final class T extends Enum`, indicating that this class inherits the `Enum` class, and the `final` keyword tells us that this class cannot be inherited.

**When we use `enum` to define an enumeration type, the compiler will automatically help us create a `final` type class that inherits the `Enum` class, so the enumeration type cannot be inherited. **

### Inner class

Inner classes are also called nested classes. The inner class can be understood as an ordinary member of the outer class.

**The reason why inner classes are also syntactic sugar is that they are just a compile-time concept. `outer.java` defines an inner class `inner`. Once compiled successfully, two completely different `.class` files will be generated, namely `outer.class` and `outer$inner.class`. So the name of the inner class can be the same as the name of its outer class. **

```java
public class OuterClass {
    private String userName;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public static void main(String[] args) {

    }

    class InnerClass{
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}```

After the above code is compiled, two class files will be generated: `OuterClass$InnerClass.class` and `OuterClass.class`. When we try to decompile the `OuterClass.class` file, the command line will print the following: `Parsing OuterClass.class...Parsing inner class OuterClass$InnerClass.class... Generating OuterClass.jad`. He will decompile both files and generate an `OuterClass.jad` file together. The contents of the file are as follows:

```java
public class OuterClass
{
    classInnerClass
    {
        public String getName()
        {
            return name;
        }
        public void setName(String name)
        {
            this.name = name;
        }
        private String name;
        final OuterClass this$0;

        InnerClass()
        {
            this.this$0 = OuterClass.this;
            super();
        }
    }

    public OuterClass()
    {
    }
    public String getUserName()
    {
        return userName;
    }
    public void setUserName(String userName){
        this.userName = userName;
    }
    public static void main(String args1[])
    {
    }
    private String userName;
}
```

**Why inner classes can use private attributes of outer classes**:

We add a method in InnerClass to print the userName attribute of the external class

```java
//Omit other attributes
public class OuterClass {
    private String userName;
    ...
    class InnerClass{
    ...
        public void printOut(){
            System.out.println("Username from OuterClass:"+userName);
        }
    }
}

// At this point, use the javap -p command to decompile OuterClass:
public classOuterClass {
    private String userName;
    ...
    static String access$000(OuterClass);
}
// At this point, the decompilation result of InnerClass:
class OuterClass$InnerClass {
    final OuterClass this$0;
    ...
    public void printOut();
}

```

In fact, after compilation is completed, the inner instance will have a reference to the outer instance `this$0`, but a simple `outer.name` cannot access the private property. From the decompilation results, we can see that there is a bridge method `static String access$000(OuterClass)` in outer, which happens to return the String type, that is, the userName attribute. It is through this method that the inner class accesses the private properties of the outer class. So the decompiled `printOut()` method is roughly as follows:

```java
public void printOut() {
    System.out.println("Username from OuterClass:" + OuterClass.access$000(this.this$0));
}
```

Supplement:

1. Anonymous inner classes, local inner classes, and static inner classes also obtain private attributes through bridge methods.
2. The static inner class has no reference to `this$0`
3. Anonymous inner classes and local inner classes use local variables through copying, and the variables cannot be modified after they are initialized. The following is an example:

```java
public class OuterClass {
    private String userName;

    public void test(){
        //Here i can no longer be modified after it is initialized to 1.
        int i=1;
        class Inner{
            public void printName(){
                System.out.println(userName);
                System.out.println(i);
            }
        }
    }
}
```

After decompilation:

```java
//javap command decompiles the result of Inner
//i is copied into the inner class and is final
class OuterClass$1Inner {
  final int val$i;
  final OuterClass this$0;
  OuterClass$1Inner();
  public void printName();
}

```

### Conditional compilation

- Under normal circumstances, every line of code in the program must be compiled. But sometimes for the purpose of optimizing the program code, you want to compile only part of it. In this case, you need to add conditions to the program, so that the compiler will only compile the code that meets the conditions and discard the code that does not meet the conditions. This is conditional compilation.

As in C or CPP, conditional compilation can be achieved through prepared statements. In fact, conditional compilation can also be implemented in Java. Let’s look at a piece of code first:

```java
public class ConditionalCompilation {
    public static void main(String[] args) {
        final boolean DEBUG = true;
        if(DEBUG) {
            System.out.println("Hello, DEBUG!");
        }

        final boolean ONLINE = false;

        if(ONLINE){
            System.out.println("Hello, ONLINE!");
        }
    }
}
```

The decompiled code is as follows:

```java
public class ConditionalCompilation
{

    publicConditionalCompilation()
    {
    }

    public static void main(String args[])
    {
        boolean DEBUG = true;
        System.out.println("Hello, DEBUG!");
        boolean ONLINE = false;
    }
}
```

First of all, we found that there is no `System.out.println("Hello, ONLINE!");` in the decompiled code. This is actually conditional compilation. When `if(ONLINE)` is false, the compiler does not compile the code inside it.

Therefore, the conditional compilation of **Java syntax is implemented through the if statement that determines the condition to be a constant. Its principle is also syntactic sugar for the Java language. According to the if condition's true or false judgment, the compiler directly eliminates the code block with a false branch. The conditional compilation implemented in this way must be implemented in the method body, and conditional compilation cannot be performed on the structure of the entire Java class or the attributes of the class. This is indeed more limited than the conditional compilation of C/C++. At the beginning of the Java language design, the function of conditional compilation was not introduced. Although it has limitations, it is better than nothing. **

### Assertion

In Java, the `assert` keyword was introduced from JAVA SE 1.4. In order to avoid errors caused by using the `assert` keyword in older versions of Java code, Java does not enable assertion checking by default during execution (at this time, all assertion statements will be ignored!). If you want to enable assertion checking, you need to use the switch `-enableassertions` or `-ea` to enable it.

Look at a piece of code that contains assertions:

```java
public class AssertTest {
    public static void main(String args[]) {
        int a = 1;
        int b = 1;
        assert a == b;
        System.out.println("Public account: Hollis");
        assert a != b : "Hollis";
        System.out.println("Blog: www.hollischuang.com");
    }
}```

The decompiled code is as follows:

```java
public class AssertTest {
   public AssertTest()
    {
    }
    public static void main(String args[])
{
    int a = 1;
    int b = 1;
    if(!$assertionsDisabled && a != b)
        throw new AssertionError();
    System.out.println("\u516C\u4F17\u53F7\uFF1AHollis");
    if(!$assertionsDisabled && a == b)
    {
        throw new AssertionError("Hollis");
    } else
    {
        System.out.println("\u535A\u5BA2\uFF1Awww.hollischuang.com");
        return;
    }
}

static final boolean $assertionsDisabled = !com/hollis/suguar/AssertTest.desiredAssertionStatus();

}
```

Obviously, the decompiled code is much more complex than our own code. Therefore, we save a lot of code by using the syntactic sugar of assert. **In fact, the underlying implementation of assertion is the if language. If the assertion result is true, nothing is done and the program continues to execute. If the assertion result is false, the program throws AssertError to interrupt the execution of the program. **`-enableassertions` will set the value of the \$assertionsDisabled field.

### Numeric literal

In Java 7, numeric literals, whether integers or floating point numbers, allow any number of underscores to be inserted between numbers. These underscores will not affect the numerical value of the literal, and are intended to facilitate reading.

For example:

```java
public class Test {
    public static void main(String... args) {
        int i = 10_000;
        System.out.println(i);
    }
}
```

After decompilation:

```java
public class Test
{
  public static void main(String[] args)
  {
    int i = 10000;
    System.out.println(i);
  }
}
```

After decompilation, `_` is deleted. In other words, the ** compiler does not recognize the `_` in the numeric literal and needs to remove it during the compilation stage. **

### for-each

I believe everyone is familiar with the enhanced for loop (`for-each`), which is often used in daily development. It requires a lot less code than the for loop. So how is this syntactic sugar implemented?

```java
public static void main(String... args) {
    String[] strs = {"Hollis", "Public account: Hollis", "Blog: www.hollischuang.com"};
    for (String s : strs) {
        System.out.println(s);
    }
    List<String> strList = ImmutableList.of("Hollis", "Public account: Hollis", "Blog: www.hollischuang.com");
    for (String s : strList) {
        System.out.println(s);
    }
}
```

The decompiled code is as follows:

```java
public static transient void main(String args[])
{
    String strs[] = {
        "Hollis", "\u516C\u4F17\u53F7\uFF1AHollis", "\u535A\u5BA2\uFF1Awww.hollischuang.com"
    };
    String args1[] = strs;
    int i = args1.length;
    for(int j = 0; j < i; j++)
    {
        String s = args1[j];
        System.out.println(s);
    }

    List strList = ImmutableList.of("Hollis", "\u516C\u4F17\u53F7\uFF1AHollis", "\u535A\u5BA2\uFF1Awww.hollischuang.com");
    String s;
    for(Iterator iterator = strList.iterator(); iterator.hasNext(); System.out.println(s))
        s = (String)iterator.next();

}
```

The code is very simple. The implementation principle of **for-each is actually using ordinary for loops and iterators. **

### try-with-resource

In Java, very expensive resources such as file operations, IO streams, and database connections must be closed promptly through the close method after use. Otherwise, the resources will remain open, which may lead to memory leaks and other problems.

The common way to close a resource is to release it in the `finally` block, that is, call the `close` method. For example, we often write code like this:

```java
public static void main(String[] args) {
    BufferedReader br = null;
    try {
        String line;
        br = new BufferedReader(new FileReader("d:\\hollischuang.xml"));
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        //handle exception
    } finally {
        try {
            if (br != null) {
                br.close();
            }
        } catch (IOException ex) {
            //handle exception
        }
    }
}
```

Starting from Java 7, jdk provides a better way to close resources. Use the `try-with-resources` statement and rewrite the above code. The effect is as follows:

```java
public static void main(String... args) {
    try (BufferedReader br = new BufferedReader(new FileReader("d:\\ hollischuang.xml"))) {
        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        //handle exception
    }
}
```

Look, this is great news. Although I usually used `IOUtils` to close the stream before, and did not write a lot of code in `finally`, this new syntax sugar seems to be much more elegant. Take a look at his back:

```java
public static transient void main(String args[])
    {
        BufferedReader br;
        Throwable throwable;
        br = new BufferedReader(new FileReader("d:\\ hollischuang.xml"));
        throwable = null;
        String line;
        try
        {
            while((line = br.readLine()) != null)
                System.out.println(line);
        }
        catch(Throwable throwable2)
        {
            throwable = throwable2;
            throw throwable2;
        }
        if(br != null)
            if(throwable != null)
                try
                {
                    br.close();
                }
                catch(Throwable throwable1)
                {
                    throwable.addSuppressed(throwable1);
                }
            else
                br.close();
            break MISSING_BLOCK_LABEL_113; //This label is a generated error by the decompilation tool, (not the content of the Java syntax itself) and is a temporary placeholder for the decompilation tool. Normally the bytecode generated by the compiler will not contain such invalid tags.
            Exception exception;
            exception;
            if(br != null)
                if(throwable != null)
                    try
                    {
                        br.close();
                    }
                    catch(Throwable throwable3)
                      {
                        throwable.addSuppressed(throwable3);
                    }
                else
                    br.close();
        throw exception;
        IOException ioexception;
        ioexception;
    }
}```

**In fact, the principle behind it is also very simple. The compiler does all the operations of closing resources that we did not do for us. Therefore, it is once again confirmed that the function of syntax sugar is to facilitate programmers to use it, but in the end it still has to be converted into a language that the compiler understands. **

### Lambda expression

Regarding lambda expression, some people may have doubts, because some people on the Internet say that it is not syntactic sugar. Actually, I would like to correct this statement. **Lambda expressions are not syntactic sugar for anonymous inner classes, but they are syntactic sugar. The implementation actually relies on several lambda-related APIs provided by the underlying JVM. **

Let’s look at a simple lambda expression first. Traverse a list:

```java
public static void main(String... args) {
    List<String> strList = ImmutableList.of("Hollis", "Public account: Hollis", "Blog: www.hollischuang.com");

    strList.forEach( s -> { System.out.println(s); } );
}
```

Why is it said that it is not syntactic sugar for inner classes? As we said before about inner classes, inner classes will have two class files after compilation, but classes containing lambda expressions will only have one file after compilation.

The decompiled code is as follows:

```java
public static /* varargs */ void main(String ... args) {
    ImmutableList strList = ImmutableList.of((Object)"Hollis", (Object)"\u516c\u4f17\u53f7\uff1aHollis", (Object)"\u535a\u5ba2\uff1awww.hollischuang.com");
    strList.forEach((Consumer<String>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)V, lambda$main$0(java.lang.String ), (Ljava/lang/String;)V)());
}

private static /* synthetic */ void lambda$main$0(String s) {
    System.out.println(s);
}
```

It can be seen that in the `forEach` method, the `java.lang.invoke.LambdaMetafactory#metafactory` method is actually called. The fourth parameter `implMethod` of this method specifies the method implementation. You can see that a `lambda$main$0` method is actually called here for output.

Let's look at a slightly more complicated one. First filter the List and then output it:

```java
public static void main(String... args) {
    List<String> strList = ImmutableList.of("Hollis", "Public account: Hollis", "Blog: www.hollischuang.com");

    List HollisList = strList.stream().filter(string -> string.contains("Hollis")).collect(Collectors.toList());

    HollisList.forEach( s -> { System.out.println(s); } );
}
```

The decompiled code is as follows:

```java
public static /* varargs */ void main(String ... args) {
    ImmutableList strList = ImmutableList.of((Object)"Hollis", (Object)"\u516c\u4f17\u53f7\uff1aHollis", (Object)"\u535a\u5ba2\uff1awww.hollischuang.com");
    List<Object> HollisList = strList.stream().filter((Predicate<String>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)Z, lambda$main$0(java.lang.String ), (Ljava/lang/String;)Z)()).collect(Collectors.toList());
    HollisList.forEach((Consumer<Object>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)V, lambda$main$1(java.lang.Object ), (Ljava/lang/Object;)V)());
}

private static /* synthetic */ void lambda$main$1(Object s) {
    System.out.println(s);
}

private static /* synthetic */ boolean lambda$main$0(String string) {
    return string.contains("Hollis");
}
```

The two lambda expressions call the `lambda$main$1` and `lambda$main$0` methods respectively.

**So, the implementation of lambda expression actually relies on some underlying APIs. During the compilation phase, the compiler will decompose the lambda expression and convert it into a way to call the internal API. **

## Possible pitfalls

### Generics

**1. When generics encounter overloading**

```java
public class GenericTypes {

    public static void method(List<String> list) {
        System.out.println("invoke method(List<String> list)");
    }

    public static void method(List<Integer> list) {
        System.out.println("invoke method(List<Integer> list)");
    }
}
```

The above code has two overloaded functions because their parameter types are different, one is `List<String>` and the other is `List<Integer>`. However, this code cannot be compiled. Because as we said before, the parameters `List<Integer>` and `List<String>` are erased after compilation and become the same native type List. The erasure action causes the signatures of the two methods to become exactly the same.

**2. When generics encounter catch**

Generic type parameters cannot be used in catch statements for Java exception handling. Because exception handling is performed by the JVM at run time. Since the type information is erased, the JVM cannot distinguish between the two exception types `MyException<String>` and `MyException<Integer>`

**3. When generics contain static variables**

```java
public class StaticTest{
    public static void main(String[] args){
        GT<Integer> gti = new GT<Integer>();
        gti.var=1;
        GT<String> gts = new GT<String>();
        gts.var=2;
        System.out.println(gti.var);
    }
}
class GT<T>{
    public static int var=0;
    public void nothing(T x){}
}
```

The output result of the above code is: 2!

Some students may mistakenly think that generic classes are different classes corresponding to different bytecodes. In fact,
Due to type erasure, all generic class instances are associated with the same bytecode, and the static variables of the generic class are shared. `GT<Integer>.var` and `GT<String>.var` in the above example are actually a variable.

### Automatic boxing and unboxing

**Object equality comparison**

```java
public static void main(String[] args) {
    Integer a = 1000;
    Integer b = 1000;
    Integer c = 100;
    Integer d = 100;
    System.out.println("a == b is " + (a == b));
    System.out.println(("c == d is " + (c == d)));
}
```

Output result:

```plain
a == b is false
c == d is true
```In Java 5, a new feature was introduced on Integer operations to save memory and improve performance. Integer objects are cached and reused by using the same object reference.

> Applies to the integer value range -128 to +127.
>
> Applies only to autoboxing. Creating objects using constructors does not apply.

### Enhanced for loop

```java
for (Student stu : students) {
    if (stu.getId() == 2)
        students.remove(stu);
}
```

Will throw `ConcurrentModificationException` exception.

Iterator works in a separate thread and has a mutex lock. After the Iterator is created, it will create a single-linked index table pointing to the original object. When the number of original objects changes, the contents of this index table will not change synchronously, so when the index pointer moves backward, the object to be iterated cannot be found, so according to the fail-fast principle, the Iterator will immediately throw a `java.util.ConcurrentModificationException` exception.

So `Iterator` does not allow the iterated object to be changed while it is working. But you can use `Iterator`'s own method `remove()` to delete objects. The `Iterator.remove()` method will delete the current iteration object while maintaining the consistency of the index.

## Summary

We introduced 12 commonly used syntactic sugars in Java. The so-called syntax sugar is just a syntax provided to developers to facilitate development. But this syntax is only known to developers. In order to be executed, it needs to be desugared, that is, converted into syntax recognized by the JVM. When we de-sugar the syntax, you will find that the convenient syntax we use every day is actually composed of other simpler syntaxes.

With these syntactic sugars, we can greatly improve efficiency in daily development, but at the same time we must avoid overuse. It is best to understand the principles before use to avoid pitfalls.

<!-- @include: @article-footer.snippet.md -->