---
title: Java8 new features in action
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 8, Lambda, Stream API, Optional, Date/Time API, default method, functional interface
  - - meta
    - name: description
      content: Practical explanation of the core new features of Java 8, including Lambda, Stream, Optional, date and time API and interface default methods, etc.
---

> This article comes from a contribution from [cowbi](https://github.com/cowbi)~

<!-- markdownlint-disable MD024 -->

Oracle released Java8 (jdk1.8) in 2014. Many reasons make it the most used jdk version on the market. Although it has been released nearly 7 years ago, many programmers still don't know enough about its new features, especially old programmers who are used to versions before Java 8, such as me.

In order not to stray too far from the team, it is still necessary to do some summary and sorting out these new features. It has many changes or optimizations compared to jdk.7. For example, the interface can have static methods and method bodies, which subverts the previous understanding; the `java.util.HashMap` data structure adds red-black trees; there are also well-known Lambda expressions and so on. This article cannot share all the new features with you one by one. I only list the more commonly used new features for you to explain in detail. For more related content, please see [the official website’s introduction to the new features of Java8] (https://www.oracle.com/java/technologies/javase/8-whats-new.html).

##Interface

The original design intention of interface is to be abstract and improve scalability. This also leaves a bit of a pity. When the Interface is modified, the class that implements it must also be modified.

In order to solve the problem of incompatibility between interface modification and existing implementation. Methods of the new interface can be modified with `default` or `static`, so that they can have method bodies and the implementation class does not have to override this method.

There can be multiple methods in an interface that are modified by them. The difference between these two modifiers is mainly the difference between ordinary methods and static methods.

1. The method modified by `default` is an ordinary instance method, which can be called with `this` and can be inherited and overridden by subclasses.
2. Methods modified with `static` are used in the same way as general class static methods. But it cannot be inherited by subclasses and can only be called with `Interface`.

Let's look at a practical example.

```java
public interfaceInterfaceNew {
    static void sm() {
        System.out.println("implementation provided by interface");
    }
    static void sm2() {
        System.out.println("implementation provided by interface");
    }

    default void def() {
        System.out.println("interface default method");
    }
    default void def2() {
        System.out.println("interface default2 method");
    }
    //Need to implement class rewriting
    void f();
}

public interfaceInterfaceNew1 {
    default void def() {
        System.out.println("InterfaceNew1 default method");
    }
}
```

If there is a class that implements both the `InterfaceNew` interface and the `InterfaceNew1` interface, both of them have `def()`, and there is no inheritance relationship between the `InterfaceNew` interface and the `InterfaceNew1` interface, then you must override `def()`. Otherwise, an error will be reported during compilation.

```java
public class InterfaceNewImpl implements InterfaceNew , InterfaceNew1{
    public static void main(String[] args) {
        InterfaceNewImpl interfaceNew = new InterfaceNewImpl();
        interfaceNew.def();
    }

    @Override
    public void def() {
        InterfaceNew1.super.def();
    }

    @Override
    public void f() {
    }
}
```

**In Java 8, what is the difference between interface and abstract class? **

Many friends think: "Since interface can also have its own method implementation, it seems to be not much different from abstract class."

In fact, they are still different

1. The difference between interface and class seems to be nonsense. The main ones are:

   - Multiple implementations of interfaces, single inheritance of classes
   - The methods of the interface are decorated with public abstract, and the variables are decorated with public static final. abstract class can use other modifiers

2. The interface method is more like an extension plug-in. The methods of abstract class must be inherited.

We also mentioned at the beginning that the interface has newly added `default` and `static` modified methods in order to solve the problem of incompatibility between interface modifications and existing implementations, not to replace `abstract class`. In terms of use, abstract class should still be used where abstract class should be used, and do not replace interface because of its new features.

**Remember that interfaces are never the same as classes. **

## functional interface functional interface

**Definition**: Also called SAM interface, that is, Single Abstract Method interfaces, there is only one abstract method, but there can be multiple non-abstract method interfaces.

In Java 8, there is a special package for functional interface `java.util.function`. All interfaces under this package are annotated with `@FunctionalInterface` to provide functional programming.

There are also functional interfaces in other packages, some of which do not have the `@FunctionalInterface` annotation, but as long as it conforms to the definition of a functional interface, it is a functional interface, regardless of whether there is a `@FunctionalInterface` annotation. The annotation only plays the role of mandatory specification definition at compile time. It is widely used in lambda expressions.

## Lambda expression

Next let’s talk about the well-known Lambda expression. It is the most important new feature driving the release of Java 8. It is the biggest change since generics (`Generics`) and annotations (`Annotation`).

Using lambda expressions can make your code more concise and compact. Let java also support simple *functional programming*.

> Lambda expression is an anonymous function. Java 8 allows passing functions as parameters into methods.

### Syntax format

```java
(parameters) -> expression or
(parameters) ->{ statements; }
```

### Lambda in practice

We use commonly used examples to experience the convenience brought by Lambda

#### Replace anonymous inner class

In the past, the only way to pass dynamic parameters to methods was to use inner classes. For example

**1.`Runnable` interface**

```java
new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("The runable now is using!");
            }
}).start();
//use lambda
new Thread(() -> System.out.println("It's a lambda function!")).start();
```

**2.`Comparator` interface**

```java
List<Integer> strings = Arrays.asList(1, 2, 3);

Collections.sort(strings, new Comparator<Integer>() {
@Override
public int compare(Integer o1, Integer o2) {
    return o1 - o2;}
});

//Lambda
Collections.sort(strings, (Integer o1, Integer o2) -> o1 - o2);
//Decompose
Comparator<Integer> comparator = (Integer o1, Integer o2) -> o1 - o2;
Collections.sort(strings, comparator);```

**3.`Listener` interface**

```java
JButton button = new JButton();
button.addItemListener(new ItemListener() {
@Override
public void itemStateChanged(ItemEvent e) {
   e.getItem();
}
});
//lambda
button.addItemListener(e -> e.getItem());
```

**4.Customized interface**

The above three examples are the most common ones we use during the development process, and we can also appreciate the convenience and refreshingness brought by Lambda. It only retains the actually used code and omits all useless code. Does it have any requirements on the interface? We found that these anonymous inner classes only override one method of the interface, and of course only one method needs to be rewritten. This is the **functional interface** we mentioned above, which means that as long as the parameters of the method are functional interfaces, Lambda expressions can be used.

```java
@FunctionalInterface
public interface Comparator<T>{}

@FunctionalInterface
public interface Runnable{}
```

We customize a functional interface

```java
@FunctionalInterface
public interface LambdaInterface {
 void f();
}
//Use
public class LambdaClass {
    public static void forEg() {
        lambdaInterfaceDemo(()-> System.out.println("Custom functional interface"));
    }
    //Functional interface parameters
    static void lambdaInterfaceDemo(LambdaInterface i){
        i.f();
    }
}
```

#### Collection iteration

```java
void lamndaFor() {
        List<String> strings = Arrays.asList("1", "2", "3");
        //traditional foreach
        for (String s : strings) {
            System.out.println(s);
        }
        //Lambda foreach
        strings.forEach((s) -> System.out.println(s));
        //or
        strings.forEach(System.out::println);
     //map
        Map<Integer, String> map = new HashMap<>();
        map.forEach((k,v)->System.out.println(v));
}
```

#### Reference to method

Java 8 allows using the `::` keyword to pass method or constructor references. In any case, the type returned by the expression must be functional-interface.

```java
public class LambdaClassSuper {
    LambdaInterface sf(){
        return null;
    }
}

public class LambdaClass extends LambdaClassSuper {
    public static LambdaInterface staticF() {
        return null;
    }

    public LambdaInterface f() {
        return null;
    }

    void show() {
        //1. When calling a static function, the return type must be functional-interface
        LambdaInterface t = LambdaClass::staticF;

        //2.Instance method call
        LambdaClass lambdaClass = new LambdaClass();
        LambdaInterface lambdaInterface = lambdaClass::f;

        //3. Method call on super class
        LambdaInterface superf = super::sf;

        //4. Constructor method call
        LambdaInterface tt = LambdaClassSuper::new;
    }
}
```

#### Access variables

```java
int i = 0;
Collections.sort(strings, (Integer o1, Integer o2) -> o1 - i);
//i =3;
```

Lambda expressions can reference external variables, but the variable has a final attribute by default and cannot be modified. If modified, an error will be reported during compilation.

## Stream

Java has added a new `java.util.stream` package, which is similar to the previous stream. The resource streams that I have been most exposed to before are resource streams, such as `java.io.FileInputStream`, which inputs files from one place to another through streams. It is just a content porter and does not do any *CRUD* on the file content.

`Stream` still does not store data, but the difference is that it can retrieve (Retrieve) and logically process collection data, including filtering, sorting, statistics, counting, etc. It can be thought of as an Sql statement.

Its source data can be `Collection`, `Array`, etc. Since its method parameters are all functional interface types, it is generally used in conjunction with Lambda.

### Stream type

1. stream serial stream
2. parallelStream parallel stream, capable of multi-thread execution

### Common methods

Next we look at the common methods of `java.util.stream.Stream`

```java
/**
* Returns a serial stream
*/
default Stream<E> stream()

/**
* Return a parallel stream
*/
default Stream<E> parallelStream()

/**
* Return the stream of T
*/
public static<T> Stream<T> of(T t)

/**
* Returns a sequence whose elements are the specified values.
*/
public static<T> Stream<T> of(T... values) {
    return Arrays.stream(values);
}


/**
* Filter, returning a stream consisting of elements of the stream that match the given predicate
*/
Stream<T> filter(Predicate<? super T> predicate);

/**
* Whether all elements of this stream match the provided predicate.
*/
boolean allMatch(Predicate<? super T> predicate)

/**
* Whether any element of this stream matches the provided predicate.
*/
boolean anyMatch(Predicate<? super T> predicate);

/**
* Returns a Stream builder.
*/
public static<T> Builder<T> builder();

/**
* Use Collector to summarize the elements of this stream
*/
<R, A> R collect(Collector<? super T, A, R> collector);

/**
 * Returns the number of elements in this stream.
*/
long count();

/**
* Returns a stream consisting of distinct elements of this stream (according to Object.equals(Object)).
*/
Stream<T> distinct();

/**
 * Traverse
*/
void forEach(Consumer<? super T> action);

/**
* Used to obtain a specified number of streams, the truncated length cannot exceed maxSize.
*/
Stream<T> limit(long maxSize);

/**
* Used to map each element to the corresponding result
*/
<R> Stream<R> map(Function<? super T, ? extends R> mapper);

/**
* Sort according to the provided Comparator.
*/
Stream<T> sorted(Comparator<? super T> comparator);

/**
* Returns a stream consisting of n elements of the stream after discarding the first n elements of the stream.
*/
Stream<T> skip(long n);

/**
* Returns an array containing the elements of this stream.
*/
Object[] toArray();

/**
* Use the provided generator function to return an array containing the elements of this stream, to allocate the returned array, and any other arrays that may be required for partitioning execution or resizing.
*/
<A> A[] toArray(IntFunction<A[]> generator);

/**
* Merge streams
*/
public static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b)```

### Actual combat

This article lists the use of representative methods of `Stream`. More usage methods still depend on the API.

```java
@Test
public void test() {
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
    //Return the stream that meets the conditions
    Stream<String> stringStream = strings.stream().filter(s -> "abc".equals(s));
    //Calculate the number of streams that meet the conditions
    long count = stringStream.count();

    //forEach traverse->print elements
    strings.stream().forEach(System.out::println);

    //limit gets a stream of 1 element
    Stream<String> limit = strings.stream().limit(1);
    //toArray For example, we want to see what is in this limitStream, such as converting it to String[], such as looping
    String[] array = limit.toArray(String[]::new);

    //map operates on each element and returns a new stream
    Stream<String> map = strings.stream().map(s -> s + "22");

    //sorted sort and print
    strings.stream().sorted().forEach(System.out::println);

    //Collectors collect puts abc into the container
    List<String> collect = strings.stream().filter(string -> "abc".equals(string)).collect(Collectors.toList());
    //Convert list to string, separate each element with ","
    String mergedString = strings.stream().filter(string -> !string.isEmpty()).collect(Collectors.joining(","));

    //Statistics on arrays, such as using
    List<Integer> number = Arrays.asList(1, 2, 5, 4);

    IntSummaryStatistics statistics = number.stream().mapToInt((x) -> x).summaryStatistics();
    System.out.println("The largest number in the list: "+statistics.getMax());
    System.out.println("The smallest number in the list: "+statistics.getMin());
    System.out.println("Average : "+statistics.getAverage());
    System.out.println("Sum of all numbers: "+statistics.getSum());

    //concat merge streams
    List<String> strings2 = Arrays.asList("xyz", "jqx");
    Stream.concat(strings2.stream(),strings.stream()).count();

    //Note that a Stream can only be operated once and cannot be disconnected, otherwise an error will be reported.
    Stream stream = strings.stream();
    //First time use
    stream.limit(2);
    //Second use
    stream.forEach(System.out::println);
    //Error java.lang.IllegalStateException: stream has already been operated upon or closed

    //But it can be used continuously like this
    stream.limit(2).forEach(System.out::println);
}
```

### Delayed execution

When executing a method that returns `Stream`, it is not executed immediately, but is executed after a method other than `Stream` is returned. Because the `Stream` cannot be used directly, but needs to be processed into a regular type. The `Stream` here can be imagined as a binary stream (two completely different things), and you can’t understand it even if you get it.

Let’s break down the `filter` method below.

```java
@Test
public void laziness(){
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
  Stream<Integer> stream = strings.stream().filter(new Predicate() {
      @Override
      public boolean test(Object o) {
        System.out.println("Predicate.test execution");
        return true;
        }
      });

   System.out.println("count executed");
   stream.count();
}
/*-------Execution results--------*/
count execution
Predicate.test execution
Predicate.test execution
Predicate.test execution
Predicate.test execution
```

According to the execution order, "`Predicate.test` execution" should be printed 4 times first, and then "`count` execution" should be printed. The actual result is just the opposite. Note that the method in filter is not executed immediately, but is executed after the `count()` method is called.

The above are all examples of serial `Stream`. Parallel `parallelStream` is used in the same way as serial.主要区别是 `parallelStream` 可多线程执行，是基于 ForkJoin 框架实现的，有时间大家可以了解一下 `ForkJoin` 框架和 `ForkJoinPool`。 Here you can simply understand that it is implemented through the thread pool, which will involve issues such as thread safety and thread consumption. Below we use code to experience multi-threaded execution of parallel streams.

```java
@Test
public void parallelStreamTest(){
   List<Integer> numbers = Arrays.asList(1, 2, 5, 4);
   numbers.parallelStream() .forEach(num->System.out.println(Thread.currentThread().getName()+">>"+num));
}
//execution result
main>>5
ForkJoinPool.commonPool-worker-2>>4
ForkJoinPool.commonPool-worker-11>>1
ForkJoinPool.commonPool-worker-9>>2
```

From the results, we see that for-each uses multi-threading.

### Summary

From the source code and examples we can summarize some characteristics of stream

1. Through simple chain programming, it can easily reprocess the traversed and processed data.
2. Method parameters are all functional interface types
3. A Stream can only be operated once. It will be closed after the operation. If you continue to use this stream, an error will be reported.
4. Stream does not save data and does not change the data source.

## Optional

In [Introduction to Optional in Alibaba Development Manual](https://share.weiyun.com/ThuqEbD5) it is written:

> Preventing NPE is a basic skill for programmers. Pay attention to the scenarios where NPE occurs:
>
> 1) The return type is a basic data type. When return wraps an object of data type, automatic unboxing may cause NPE.
>
> Counterexample: public int f() { return Integer object}, if it is null, it will automatically unbox and throw NPE.
>
> 2) The query result of the database may be null.
>
> 3) Even if the elements in the collection are isNotEmpty, the retrieved data elements may be null.
>
> 4) When a remote call returns an object, null pointer judgment is always required to prevent NPE.
>
> 5) For the data obtained in Session, it is recommended to perform NPE checking to avoid null pointers.
>
> 6) Cascading calls to obj.getA().getB().getC(); a series of calls can easily cause NPE.
>
> Positive example: Use the Optional class of JDK8 to prevent NPE problems.

他建议使用 `Optional` 解决 NPE（`java.lang.NullPointerException`）问题，它就是为 NPE 而生的，其中可以包含空值或非空值。 Next, we gradually uncover the red cover of `Optional` through the source code.Suppose there is a `Zoo` class with an attribute `Dog`, and you need to get the `age` of `Dog`.

```java
class Zoo {
   private Dog dog;
}

class Dog {
   private int age;
}
```

The traditional solution to NPE is as follows:

```java
Zoo zoo = getZoo();
if(zoo != null){
   Dog dog = zoo.getDog();
   if(dog != null){
      int age = dog.getAge();
      System.out.println(age);
   }
}
```

It is judged layer by layer that the object is not empty. Some people say that this method is ugly and inelegant, but I don’t think so. On the contrary, it feels very neat, easy to read and understand. What do you think?

`Optional` is implemented like this:

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).ifPresent(age ->
    System.out.println(age)
);
```

Isn’t it much simpler?

### How to create an Optional

In the above example, `Optional.ofNullable` is one of the ways to create Optional. Let's first look at its meaning and other source code methods for creating Optional.

```java
/**
* Common instance for {@code empty()}. Global EMPTY object
*/
private static final Optional<?> EMPTY = new Optional<>();

/**
* Value maintained by Optional
*/
private final T value;

/**
* If value is null, return EMPTY, otherwise return of(T)
*/
public static <T> Optional<T> ofNullable(T value) {
   return value == null ? empty() : of(value);
}
/**
* Return EMPTY object
*/
public static<T> Optional<T> empty() {
   Optional<T> t = (Optional<T>) EMPTY;
   return t;
}
/**
* Return Optional object
*/
public static <T> Optional<T> of(T value) {
    return new Optional<>(value);
}
/**
* Private construction method, assign value to value
*/
private Optional(T value) {
  this.value = Objects.requireNonNull(value);
}
/**
* So if the value of of(T value) is null, a NullPointerException will be thrown, which seems to not solve the NPE problem.
*/
public static <T> T requireNonNull(T obj) {
  if (obj == null)
         throw new NullPointerException();
  return obj;
}
```

The only difference between the `ofNullable` method and the `of` method is that when the value is null, `ofNullable` returns `EMPTY` and of will throw a `NullPointerException` exception. If you need to expose `NullPointerException`, use `of`, otherwise use `ofNullable`.

**What is the difference between `map()` and `flatMap()`? **

Both `map` and `flatMap` apply a function to each element in the collection, but the difference is that `map` returns a new collection, and `flatMap` maps each element to a collection and finally flattens the collection.

In actual application scenarios, if `map` returns an array, then the final result is a two-dimensional array. Using `flatMap` is to flatten this two-dimensional array into a one-dimensional array.

```java
public class MapAndFlatMapExample {
    public static void main(String[] args) {
        List<String[]> listOfArrays = Arrays.asList(
                new String[]{"apple", "banana", "cherry"},
                new String[]{"orange", "grape", "pear"},
                new String[]{"kiwi", "melon", "pineapple"}
        );

        List<String[]> mapResult = listOfArrays.stream()
                .map(array -> Arrays.stream(array).map(String::toUpperCase).toArray(String[]::new))
                .collect(Collectors.toList());

        System.out.println("Using map:");
        mapResult.forEach(arrays-> System.out.println(Arrays.toString(arrays)));

        List<String> flatMapResult = listOfArrays.stream()
                .flatMap(array -> Arrays.stream(array).map(String::toUpperCase))
                .collect(Collectors.toList());

        System.out.println("Using flatMap:");
        System.out.println(flatMapResult);
    }
}

```

Running results:

```plain
Using map:
[[APPLE, BANANA, CHERRY], [ORANGE, GRAPE, PEAR], [KIWI, MELON, PINEAPPLE]]

Using flatMap:
[APPLE, BANANA, CHERRY, ORANGE, GRAPE, PEAR, KIWI, MELON, PINEAPPLE]
```

The simplest understanding is that `flatMap()` can expand the results of `map()`.

In `Optional`, when using `map()`, if the mapping function returns a normal value, it will wrap this value in a new `Optional`. When using `flatMap`, if the mapping function returns an `Optional`, it will flatten the returned `Optional` and no longer wrap it into a nested `Optional`.

Here is a sample code for comparison:

```java
public static void main(String[] args) {
        int userId = 1;

        //Code using flatMap
        String cityUsingFlatMap = getUserById(userId)
                .flatMap(OptionalExample::getAddressByUser)
                .map(Address::getCity)
                .orElse("Unknown");

        System.out.println("User's city using flatMap: " + cityUsingFlatMap);

        // Code that does not use flatMap
        Optional<Optional<Address>> optionalAddress = getUserById(userId)
                .map(OptionalExample::getAddressByUser);

        String cityWithoutFlatMap;
        if (optionalAddress.isPresent()) {
            Optional<Address> addressOptional = optionalAddress.get();
            if (addressOptional.isPresent()) {
                Address address = addressOptional.get();
                cityWithoutFlatMap = address.getCity();
            } else {
                cityWithoutFlatMap = "Unknown";
            }
        } else {
            cityWithoutFlatMap = "Unknown";
        }

        System.out.println("User's city without flatMap: " + cityWithoutFlatMap);
    }```

Proper use of `flatMap` in `Stream` and `Optional` can reduce a lot of unnecessary code.

### Determine whether value is null

```java
/**
* Whether value is null
*/
public boolean isPresent() {
    return value != null;
}
/**
* If value is not null, execute consumer.accept
*/
public void ifPresent(Consumer<? super T> consumer) {
   if (value != null)
    consumer.accept(value);
}
```

### Get value

```java
/**
* Return the value if present, otherwise invoke {@code other} and return
* the result of that invocation.
* If value != null return value, otherwise return the execution result of other
*/
public T orElseGet(Supplier<? extends T> other) {
    return value != null ? value : other.get();
}

/**
* If value != null return value, otherwise return T
*/
public T orElse(T other) {
    return value != null ? value : other;
}

/**
* If value != null return value, otherwise throw the exception returned by the parameter
*/
public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X {
        if (value != null) {
            return value;
        } else {
            throw exceptionSupplier.get();
        }
}
/**
* If value is null, NoSuchElementException is thrown, if value is not null, value is returned.
*/
public T get() {
  if (value == null) {
      throw new NoSuchElementException("No value present");
  }
  return value;
}
```

### Filter value

```java
/**
* 1. If it is empty, return empty
* 2. predicate.test(value)==true returns this, otherwise returns empty
*/
public Optional<T> filter(Predicate<? super T> predicate) {
        Objects.requireNonNull(predicate);
        if (!isPresent())
            return this;
        else
            return predicate.test(value) ? this : empty();
}
```

### Summary

After reading the `Optional` source code, the method of `Optional` is really very simple. It is worth noting that if you absolutely do not want to see `NPE`, do not use `of()`, `get()`, `flatMap(..)`. Finally, let’s comprehensively use the high-frequency method of `Optional`.

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).filter(v->v==1).orElse(3);
```

## Date-Time API

This is a powerful complement to `java.util.Date` and solves most of the pain points of the Date class:

1. Not thread safe
2. Trouble with time zone processing
3. Various formats and time calculations are cumbersome
4. The design is flawed. The Date class contains both date and time; there is also a java.sql.Date, which is easy to confuse.

Let's compare the differences between java.util.Date and the new Date from commonly used time examples. The code using `java.util.Date` should be changed.

### java.time main class

`java.util.Date` contains both date and time, while `java.time` separates them

```java
LocalDateTime.class //Date + time format: yyyy-MM-ddTHH:mm:ss.SSS
LocalDate.class //Date format: yyyy-MM-dd
LocalTime.class //Time format: HH:mm:ss
```

### Formatting

**Prior to Java 8:**

```java
public void oldFormat(){
    Date now = new Date();
    //format yyyy-MM-dd
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String date = sdf.format(now);
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    SimpleDateFormat sdft = new SimpleDateFormat("HH:mm:ss");
    String time = sdft.format(now);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    SimpleDateFormat sdfdt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String datetime = sdfdt.format(now);
    System.out.println(String.format("dateTime format : %s", datetime));
}
```

**After Java 8:**

```java
public void newFormat(){
    //format yyyy-MM-dd
    LocalDate date = LocalDate.now();
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    LocalTime time = LocalTime.now().withNano(0);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    LocalDateTime dateTime = LocalDateTime.now();
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String dateTimeStr = dateTime.format(dateTimeFormatter);
    System.out.println(String.format("dateTime format : %s", dateTimeStr));
}
```

### Convert string to date format

**Prior to Java 8:**

```java
//deprecated
Date date = new Date("2021-01-26");
//Replace with
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
Date date1 = sdf.parse("2021-01-26");
```

**After Java 8:**

```java
LocalDate date = LocalDate.of(2021, 1, 26);
LocalDate.parse("2021-01-26");

LocalDateTime dateTime = LocalDateTime.of(2021, 1, 26, 12, 12, 22);
LocalDateTime.parse("2021-01-26T12:12:22");

LocalTime time = LocalTime.of(12, 12, 22);
LocalTime.parse("12:12:22");
```**Before Java 8** conversion requires the help of the `SimpleDateFormat` class, but after **Java 8** only the `of` or `parse` methods of `LocalDate`, `LocalTime`, and `LocalDateTime` are required.

### Date calculation

The following only takes the date one week later as an example. Other units (year, month, day, 1/2 day, hour, etc.) are similar. Additionally, these units are defined in the _java.time.temporal.ChronoUnit_ enumeration.

**Prior to Java 8:**

```java
public void afterDay(){
     //Date one week later
     SimpleDateFormat formatDate = new SimpleDateFormat("yyyy-MM-dd");
     Calendar ca = Calendar.getInstance();
     ca.add(Calendar.DATE, 7);
     Date d = ca.getTime();
     String after = formatDate.format(d);
     System.out.println("Date one week later: " + after);

   //Calculate how many days, how many years, and how many months between two dates. The method is similar.
     String dates1 = "2021-12-23";
   String dates2 = "2021-02-26";
     SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
     Date date1 = format.parse(dates1);
     Date date2 = format.parse(dates2);
     int day = (int) ((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
     System.out.println(dates1 + "and" + dates2 + "difference" + day + "day");
     //Result: The difference between 2021-02-26 and 2021-12-23 is 300 days
}
```

**After Java 8:**

```java
public void pushWeek(){
     //Date one week later
     LocalDate localDate = LocalDate.now();
     //Method 1
     LocalDate after = localDate.plus(1, ChronoUnit.WEEKS);
     //Method 2
     LocalDate after2 = localDate.plusWeeks(1);
     System.out.println("Date one week later: " + after);

     //Calculate how many days, how many years, and how many months between two dates
     LocalDate date1 = LocalDate.parse("2021-02-26");
     LocalDate date2 = LocalDate.parse("2021-12-23");
     Period period = Period.between(date1, date2);
     System.out.println("date1 to date2 are separated by:"
                + period.getYears() + "year"
                + period.getMonths() + "month"
                + period.getDays() + "days");
   //The print result is "date1 to date2 are separated by: September 27, year 0"
     //The days obtained by period.getDays() here are the number of days other than last year's month, not the total number of days
     //If you want to get the pure total number of days, you should use the following method
     long day = date2.toEpochDay() - date1.toEpochDay();
     System.out.println(date1 + "and" + date2 + "difference" + day + "day");
     //Print results: The difference between 2021-02-26 and 2021-12-23 is 300 days
}
```

### Get the specified date

In addition to the cumbersome date calculation, it is also troublesome to obtain a specific date, such as obtaining the last day and the first day of this month.

**Prior to Java 8:**

```java
public void getDay() {

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        //Get the first day of the current month:
        Calendar c = Calendar.getInstance();
        c.set(Calendar.DAY_OF_MONTH, 1);
        String first = format.format(c.getTime());
        System.out.println("first day:" + first);

        //Get the last day of the current month
        Calendar ca = Calendar.getInstance();
        ca.set(Calendar.DAY_OF_MONTH, ca.getActualMaximum(Calendar.DAY_OF_MONTH));
        String last = format.format(ca.getTime());
        System.out.println("last day:" + last);

        //Last day of the year
        Calendar currCal = Calendar.getInstance();
        Calendar calendar = Calendar.getInstance();
        calendar.clear();
        calendar.set(Calendar.YEAR, currCal.get(Calendar.YEAR));
        calendar.roll(Calendar.DAY_OF_YEAR, -1);
        Date time = calendar.getTime();
        System.out.println("last day:" + format.format(time));
}
```

**After Java 8:**

```java
public void getDayNew() {
    LocalDate today = LocalDate.now();
    //Get the first day of the current month:
    LocalDate firstDayOfThisMonth = today.with(TemporalAdjusters.firstDayOfMonth());
    // Get the last day of this month
    LocalDate lastDayOfThisMonth = today.with(TemporalAdjusters.lastDayOfMonth());
    //Remove one day:
    LocalDate nextDay = lastDayOfThisMonth.plusDays(1);
    //Last day of the year
    LocalDate lastday = today.with(TemporalAdjusters.lastDayOfYear());
    //On the last Sunday of 2021, it will be annoying to use Calendar.
    LocalDate lastMondayOf2021 = LocalDate.parse("2021-12-31").with(TemporalAdjusters.lastInMonth(DayOfWeek.SUNDAY));
}
```

There are many convenient algorithms in `java.time.temporal.TemporalAdjusters`. I won’t show you the API here. They are very simple and you will understand them in seconds.

### JDBC and java8

Now the corresponding relationship between jdbc time type and java8 time type is

1. `Date` ---> `LocalDate`
2. `Time` ---> `LocalTime`
3. `Timestamp` ---> `LocalDateTime`

Previously, they all corresponded to `Date`, and only `Date`.

### Time zone

> Time zone: The official time zone is divided into time zones every 15° of longitude. There are 24 time zones in the world, and each time zone differs by 1 hour. However, for administrative convenience, a country or a province is often grouped together. For example, our country is vast and spans approximately 5 time zones. In fact, only the standard time of the East Eighth Time Zone, that is, Beijing time, is used.The `java.util.Date` object essentially stores the number of milliseconds that elapsed from 0:00 (GMT) on January 1, 1970 to the time represented by the Date object. That is to say, no matter which time zone new Date is in, the number of milliseconds it records is the same, regardless of the time zone. But when using it, it should be converted to local time, which involves the internationalization of time. `java.util.Date` itself does not support internationalization and requires the help of `TimeZone`.

```java
//Beijing time: Wed Jan 27 14:05:29 CST 2021
Date date = new Date();

SimpleDateFormat bjSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//Beijing time zone
bjSdf.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
System.out.println("Milliseconds:" + date.getTime() + ", Beijing time: " + bjSdf.format(date));

//Tokyo time zone
SimpleDateFormat tokyoSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
tokyoSdf.setTimeZone(TimeZone.getTimeZone("Asia/Tokyo")); // Set Tokyo time zone
System.out.println("Milliseconds:" + date.getTime() + ", Tokyo time:" + tokyoSdf.format(date));

//If you print directly, it will automatically convert to the time in the current time zone.
System.out.println(date);
//Wed Jan 27 14:05:29 CST 2021
```

Introduced new features `java.time.ZonedDateTime` to represent time with time zone. It can be viewed as `LocalDateTime + ZoneId`.

```java
//Current time zone time
ZonedDateTime zonedDateTime = ZonedDateTime.now();
System.out.println("Current time zone: " + zonedDateTime);

//Tokyo time
ZoneId zoneId = ZoneId.of(ZoneId.SHORT_IDS.get("JST"));
ZonedDateTime tokyoTime = zonedDateTime.withZoneSameInstant(zoneId);
System.out.println("Tokyo Time: " + tokyoTime);

// ZonedDateTime to LocalDateTime
LocalDateTime localDateTime = tokyoTime.toLocalDateTime();
System.out.println("Tokyo time to local time: " + localDateTime);

//LocalDateTime to ZonedDateTime
ZonedDateTime localZoned = localDateTime.atZone(ZoneId.systemDefault());
System.out.println("Local time zone time: " + localZoned);

//Print results
Current time zone: 2021-01-27T14:43:58.735+08:00[Asia/Shanghai]
Tokyo time: 2021-01-27T15:43:58.735+09:00[Asia/Tokyo]
Tokyo time to local time: 2021-01-27T15:43:58.735
Local time zone: 2021-01-27T15:53:35.618+08:00[Asia/Shanghai]
```

### Summary

Through the above comparison of the differences between the old and new `Date`, of course only some of the functional differences are listed, and you have to explore more functions by yourself. In short, date-time-api brings benefits to date operations. When encountering date type operations in daily work, the first thing to consider is date-time-api. If it cannot solve the problem, then consider the old Date.

## Summary

The new features of Java 8 that we have summarized include

- Interface & functional interface
- Lambda
-Stream
- Optional
-Date time-api

These are commonly used features in development. When I combed them out, they smelled really good, but I didn't apply them earlier. I always find it troublesome to learn the new features of Java 8, so I have been using the old implementation method. In fact, these new features can be mastered in a few days. Once mastered, the efficiency will be greatly improved. In fact, our salary increase also increases the money for study. If you don't study, you will eventually be eliminated, and the 35-year-old crisis will come early.

<!-- @include: @article-footer.snippet.md -->