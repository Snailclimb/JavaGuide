---
title: "Java8 Guide" Chinese translation
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 8, Guide, Lambda, Method Reference, Default Methods, Stream API, Functional Interface, Date/Time API
  - - meta
    - name: description
      content: Translate and organize Java 8 tutorials, covering Lambda, method references, interface default methods, Stream and other new features and sample code.
---

# "Java8 Guide" Chinese translation

As Java 8 becomes more and more popular, many people have mentioned that Java 8 is also a very frequently asked question in interviews. In response to your requests and needs, I plan to make a summary of this part of knowledge. I was originally going to summarize it myself, but later I saw a related warehouse on GitHub at the address:
[https://github.com/winterbe/java8-tutorial](https://github.com/winterbe/java8-tutorial). This repository is in English. I translated it and added and modified some content. The following is the text.

---

Welcome to my introduction to Java 8. This tutorial will guide you step-by-step through all new language features. Based on short code examples, you'll learn how to use default interface methods, lambda expressions, method references, and repeatable annotations. By the end of this article, you will be familiar with the latest API changes, such as streams, functional interfaces (Functional Interfaces), extensions to the Map class, and the new Date API. There are no long paragraphs of boring text, just a bunch of commented code snippets.

##Default Methods for Interfaces

Java 8 enables us to add non-abstract method implementations to interfaces by using the `default` keyword. This feature is also known as [virtual extension methods](http://stackoverflow.com/a/24102730).

First example:

```java
interface Formula{

    double calculate(int a);

    default double sqrt(int a) {
        return Math.sqrt(a);
    }

}
```

In addition to the abstract method calculation interface formula, the Formula interface also defines a default method `sqrt`. Classes that implement this interface only need to implement the abstract method `calculate`. The default method `sqrt` can be used directly. Of course, you can also create objects directly through the interface, and then implement the default methods in the interface. Let's demonstrate this method through code.

```java
public class Main {

  public static void main(String[] args) {
    // Access the interface through anonymous inner class
    Formula formula = new Formula() {
        @Override
        public double calculate(int a) {
            return sqrt(a * 100);
        }
    };

    System.out.println(formula.calculate(100)); // 100.0
    System.out.println(formula.sqrt(16)); // 4.0

  }

}
```

formula is implemented as an anonymous object. The code is very easy to understand and implements the calculation of `sqrt(a * 100)` in 6 lines of code. In the next section, we will see that there is a better and more convenient way to implement a single method object in Java 8.

**Translator's Note:** Whether it is an abstract class or an interface, it can be accessed through anonymous inner classes. Objects cannot be created directly through abstract classes or interfaces. Regarding the above access to the interface through anonymous inner classes, we can understand it this way: an inner class implements the abstract method in the interface and returns an inner class object, and then we let the interface reference point to this object.

## Lambda expressions

First look at how strings were arranged in older versions of Java:

```java
List<String> names = Arrays.asList("peter", "anna", "mike", "xenia");

Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return b.compareTo(a);
    }
});
```

Just pass in a List object and a comparator to the static method `Collections.sort` to sort them in the specified order. The usual approach is to create an anonymous comparator object and pass it to the `sort` method.

In Java 8, you no longer need to use this traditional anonymous object method. Java 8 provides a more concise syntax, lambda expression:

```java
Collections.sort(names, (String a, String b) -> {
    return b.compareTo(a);
});
```

As you can see, the code becomes shorter and more readable, but it could actually be shorter:

```java
Collections.sort(names, (String a, String b) -> b.compareTo(a));
```

For a function body with only one line of code, you can remove the curly braces {} and the return keyword, but you can also write it shorter:

```java
names.sort((a, b) -> b.compareTo(a));
```

The List class itself has a `sort` method. And the Java compiler can automatically deduce the parameter type, so you don't have to write the type again. Next let’s look at other uses of lambda expressions.

## Functional Interfaces

**Translator's Note:** The original text did not explain this part clearly, so I have modified it!

Java language designers put a lot of effort into thinking about how to make existing functions Lambda-friendly. The final approach was to add the concept of functional interfaces. ** "Functional interface" refers to an interface that only contains one abstract method, but can have multiple non-abstract methods (that is, the default method mentioned above). ** Interfaces like this can be implicitly converted to lambda expressions. `java.lang.Runnable` and `java.util.concurrent.Callable` are the two most typical examples of functional interfaces. Java 8 adds a special annotation `@FunctionalInterface`, but this annotation is usually not necessary (it is recommended in some cases). As long as the interface only contains one abstract method, the virtual machine will automatically determine that the interface is a functional interface. It is generally recommended to use the `@FunctionalInterface` annotation on the interface for declaration. In this case, the compiler will report an error if it finds that the interface you annotated with this annotation has more than one abstract method, as shown in the figure below.

![@FunctionalInterface annotation](https://oss.javaguide.cn/github/javaguide/java/@FunctionalInterface.png)

Example:

```java
@FunctionalInterface
public interface Converter<F, T> {
  T convert(F from);
}
```

```java
    // TODO Convert numeric string to integer type
    Converter<String, Integer> converter = (from) -> Integer.valueOf(from);
    Integer converted = converter.convert("123");
    System.out.println(converted.getClass()); //class java.lang.Integer
```

**Translator's Note:** Most of the functional interfaces do not need to be written by ourselves. Java8 has implemented them for us. These interfaces are all in the java.util.function package.

##Method and Constructor References

The code in the previous section could also be represented by a static method reference:

```java
    Converter<String, Integer> converter = Integer::valueOf;
    Integer converted = converter.convert("123");
    System.out.println(converted.getClass()); //class java.lang.Integer
```

Java 8 allows you to pass a reference to a method or constructor via the `::` keyword. The above example shows how to reference a static method. But we can also reference object methods:

```java
class Something {
    String startsWith(String s) {
        return String.valueOf(s.charAt(0));
    }
}```

```java
Something something = new Something();
Converter<String, String> converter = something::startsWith;
String converted = converter.convert("Java");
System.out.println(converted); // "J"
```

Next, let’s see how constructors are referenced using the `::` keyword. First we define a simple class containing multiple constructors:

```java
class Person {
    String firstName;
    String lastName;

    Person() {}

    Person(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
```

Next we specify an object factory interface used to create Person objects:

```java
interface PersonFactory<P extends Person> {
    P create(String firstName, String lastName);
}
```

Here we use a constructor reference to associate them instead of manually implementing a complete factory:

```java
PersonFactory<Person> personFactory = Person::new;
Person person = personFactory.create("Peter", "Parker");
```

We only need to use `Person::new` to get a reference to the constructor of the Person class, and the Java compiler will automatically select the appropriate constructor based on the parameter type of the `PersonFactory.create` method.

## Lambda expression scope (Lambda Scopes)

### Access local variables

We can access external local variables directly in lambda expressions:

```java
final int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);

stringConverter.convert(2); // 3
```

But unlike anonymous objects, the variable num here does not need to be declared final, and the code is also correct:

```java
int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);

stringConverter.convert(2); // 3
```

However, the num here must not be modified by subsequent code (that is, it has implicit final semantics). For example, the following cannot be compiled:

```java
int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);
num = 3; //Attempting to modify num in a lambda expression is also not allowed.
```

### Access fields and static variables

In contrast to local variables, we have read and write access to instance fields and static variables in lambda expressions. This behavior is consistent with anonymous objects.

```java
class Lambda4 {
    static int outerStaticNum;
    int outerNum;

    void testScopes() {
        Converter<Integer, String> stringConverter1 = (from) -> {
            outerNum = 23;
            return String.valueOf(from);
        };

        Converter<Integer, String> stringConverter2 = (from) -> {
            outerStaticNum = 72;
            return String.valueOf(from);
        };
    }
}
```

### Access the default interface method

Remember the formula example from Section 1? The `Formula` interface defines a default method `sqrt` that can be accessed from every formula instance containing an anonymous object. This does not work with lambda expressions.

The default method cannot be accessed from a lambda expression, so the following code will not compile:

```java
Formula formula = (a) -> sqrt(a * 100);
```

## Built-in Functional Interfaces

The JDK 1.8 API includes many built-in functional interfaces. Some of these interfaces are more common in older versions of Java, such as `Comparator` or `Runnable`. These interfaces have added the `@FunctionalInterface` annotation so that they can be used in lambda expressions.

But the Java 8 API also provides many new functional interfaces to make your programming work more convenient. Some interfaces are from the [Google Guava](https://code.google.com/p/guava-libraries/) library. Even if you are familiar with these, it is still necessary to see how these are extended to use with lambdas.

### Predicate

The Predicate interface is a **predicate** interface that has only one parameter and returns a Boolean value. This interface contains a variety of default methods to combine Predicates into other complex logic (such as AND, OR, NOT):

**Translator's Note:** The source code of the Predicate interface is as follows

```java
package java.util.function;
import java.util.Objects;

@FunctionalInterface
public interface Predicate<T> {

    // This method accepts an incoming type and returns a Boolean value. This method is used for judgment.
    boolean test(T t);

    //The and method is similar to the relational operator "&&". It returns true only when both sides are true.
    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }
    // Similar to the relational operator "!", it negates the judgment
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }
    //The or method is similar to the relational operator "||". It returns true as long as one of the two sides is true.
    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }
   // This method receives an Object object and returns a Predicate type. This method is used to determine that the first test method is the same as the second test method (equal).
    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
```

Example:

```java
Predicate<String> predicate = (s) -> s.length() > 0;

predicate.test("foo"); // true
predicate.negate().test("foo"); // false

Predicate<Boolean> nonNull = Objects::nonNull;
Predicate<Boolean> isNull = Objects::isNull;

Predicate<String> isEmpty = String::isEmpty;
Predicate<String> isNotEmpty = isEmpty.negate();
```

### FunctionThe Function interface accepts a parameter and generates a result. Default methods can be used to chain multiple functions together (compose, andThen):

**Translator's Note:** Function interface source code is as follows

```java

package java.util.function;

import java.util.Objects;

@FunctionalInterface
public interface Function<T, R> {

    //Apply the Function object to the input parameters and return the calculation result.
    R apply(T t);
    //Integrate the two Functions and return a Function object that can perform the functions of the two Function objects.
    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }
    //
    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }

    static <T> Function<T, T> identity() {
        return t -> t;
    }
}
```

```java
Function<String, Integer> toInteger = Integer::valueOf;
Function<String, String> backToString = toInteger.andThen(String::valueOf);
backToString.apply("123"); // "123"
```

### Supplier

The Supplier interface produces results of the given generic type. Unlike the Function interface, the Supplier interface does not accept parameters.

```java
Supplier<Person> personSupplier = Person::new;
personSupplier.get(); // new Person
```

### Consumer

The Consumer interface represents an operation to be performed on a single input parameter.

```java
Consumer<Person> greeter = (p) -> System.out.println("Hello, " + p.firstName);
greeter.accept(new Person("Luke", "Skywalker"));
```

### Comparator

Comparator is a classic interface in old Java. Java 8 adds a variety of default methods on top of it:

```java
Comparator<Person> comparator = (p1, p2) -> p1.firstName.compareTo(p2.firstName);

Person p1 = new Person("John", "Doe");
Person p2 = new Person("Alice", "Wonderland");

comparator.compare(p1, p2); // > 0
comparator.reversed().compare(p1, p2); // < 0
```

## Optional

Optional is not a functional interface, but a nifty tool for preventing NullPointerException. This is an important concept in the next section, so let's take a quick look at how Optional works.

Optional is a simple container whose value may or may not be null. Before Java 8 generally a function should return a non-null object but sometimes it would return nothing, whereas in Java 8 you should return Optional instead of null.

Translator's note: The role of each method in the example has been added.

```java
//of(): Create an Optional for non-null values
Optional<String> optional = Optional.of("bam");
// isPresent(): Returns true if the value exists, otherwise returns false
optional.isPresent(); // true
//get(): If Optional has a value, return it, otherwise throw NoSuchElementException
optional.get(); // "bam"
//orElse(): If there is a value, return it, otherwise return the specified other value
optional.orElse("fallback"); // "bam"
//ifPresent(): If the Optional instance has a value, call the consumer for it, otherwise no processing will be done
optional.ifPresent((s) -> System.out.println(s.charAt(0))); // "b"
```

Recommended reading: [[Java8] How to use Optional correctly](https://blog.kaaass.net/archives/764)

## Streams(stream)

`java.util.Stream` represents a sequence of operations that can be performed on a set of elements at once. Stream operations are divided into intermediate operations or final operations. The final operation returns a specific type of calculation result, while the intermediate operation returns the Stream itself, so you can string multiple operations together. The creation of Stream requires specifying a data source, such as a subclass of `java.util.Collection`, List or Set, which is not supported by Map. Stream operations can be performed serially or in parallel.

First, let’s take a look at how Stream is used. First, create the data List needed for the example code:

```java
List<String> stringList = new ArrayList<>();
stringList.add("ddd2");
stringList.add("aaa2");
stringList.add("bbb1");
stringList.add("aaa1");
stringList.add("bbb3");
stringList.add("ccc");
stringList.add("bbb2");
stringList.add("ddd1");
```

Java 8 extends the collection class to create a Stream through Collection.stream() or Collection.parallelStream(). The following sections will explain commonly used Stream operations in detail:

### Filter

Filtering uses a predicate interface to filter and retain only elements that meet the conditions. This operation is an **intermediate operation**, so we can apply other Stream operations (such as forEach) on the filtered results. forEach requires a function to be executed sequentially on the filtered elements. forEach is a final operation, so we cannot perform other Stream operations after forEach.

```java
        //Test Filter
        stringList
                .stream()
                .filter((s) -> s.startsWith("a"))
                .forEach(System.out::println);//aaa2 aaa1
```

forEach is designed for Lambda, maintaining the most compact style. Moreover, Lambda expressions themselves are reusable, which is very convenient.

### Sorted

Sorting is an **intermediate operation** and returns a sorted Stream. **If you do not specify a custom Comparator the default sorting will be used. **

```java
        // Test Sort (sort)
        stringList
                .stream()
                .sorted()
                .filter((s) -> s.startsWith("a"))
                .forEach(System.out::println);// aaa1 aaa2
```

It should be noted that sorting only creates a sorted Stream and does not affect the original data source. The original data stringList will not be modified after sorting:

```java
    System.out.println(stringList);// ddd2, aaa2, bbb1, aaa1, bbb3, ccc, bbb2, ddd1
```

### Map

The intermediate operation map will sequentially convert the elements into other objects according to the specified Function interface.The following example shows converting a string to uppercase. You can also use map to convert objects into other types. The Stream type returned by map is determined based on the return value of the function you pass in to map.

```java
        //Test Map operation
        stringList
                .stream()
                .map(String::toUpperCase)
                .sorted((a, b) -> b.compareTo(a))
                .forEach(System.out::println);// "DDD2", "DDD1", "CCC", "BBB3", "BBB2", "BBB1", "AAA2", "AAA1"
```

### Match

Stream provides a variety of matching operations that allow you to detect whether a specified Predicate matches the entire Stream. All matching operations are **final operations** and return a boolean value.

```java
        // Test the Match operation
        boolean anyStartsWithA =
                stringList
                        .stream()
                        .anyMatch((s) -> s.startsWith("a"));
        System.out.println(anyStartsWithA); // true

        boolean allStartsWithA =
                stringList
                        .stream()
                        .allMatch((s) -> s.startsWith("a"));

        System.out.println(allStartsWithA); // false

        boolean noneStartsWithZ =
                stringList
                        .stream()
                        .noneMatch((s) -> s.startsWith("z"));

        System.out.println(noneStartsWithZ); // true
```

### Count(count)

Counting is a **final operation** that returns the number of elements in the Stream. The **return value type is long**.

```java
      //Test the Count operation
        long startsWithB =
                stringList
                        .stream()
                        .filter((s) -> s.startsWith("b"))
                        .count();
        System.out.println(startsWithB); // 3
```

### Reduce(Protocol)

This is a **final operation** that allows multiple elements in the stream to be reduced to one element through the specified function. The reduced result is represented through the Optional interface:

```java
        //Test the Reduce operation
        Optional<String> reduced =
                stringList
                        .stream()
                        .sorted()
                        .reduce((s1, s2) -> s1 + "#" + s2);

        reduced.ifPresent(System.out::println);//aaa1#aaa2#bbb1#bbb2#bbb3#ccc#ddd1#ddd2
```

**Translator's Note:** The main function of this method is to combine Stream elements. It provides a starting value (seed), and then combines it with the first, second, and nth elements of the previous Stream according to the operation rules (BinaryOperator). In this sense, string concatenation, numerical sum, min, max, and average are all special reduce. For example, the sum of Stream is equivalent to `Integer sum = integers.reduce(0, (a, b) -> a+b);`. There is also a case where there is no starting value. In this case, the first two elements of Stream will be combined and Optional will be returned.

```java
// String concatenation, concat = "ABCD"
String concat = Stream.of("A", "B", "C", "D").reduce("", String::concat);
// Find the minimum value, minValue = -3.0
double minValue = Stream.of(-1.5, 1.0, -3.0, -2.0).reduce(Double.MAX_VALUE, Double::min);
// Sum, sumValue = 10, has a starting value
int sumValue = Stream.of(1, 2, 3, 4).reduce(0, Integer::sum);
//Sum, sumValue = 10, no starting value
sumValue = Stream.of(1, 2, 3, 4).reduce(Integer::sum).get();
//Filtering, string concatenation, concat = "ace"
concat = Stream.of("a", "B", "c", "D", "e", "F").
 filter(x -> x.compareTo("Z") > 0).
 reduce("", String::concat);
```

The above code is an example of reduce() in the first example. The first parameter (blank character) is the starting value, and the second parameter (String::concat) is BinaryOperator. This type of reduce() with a starting value returns a concrete object. For the fourth example of reduce() without a starting value, since there may not be enough elements, Optional is returned. Please pay attention to this difference. For more information, see: [IBM: Detailed explanation of Streams API in Java 8](https://www.ibm.com/developerworks/cn/java/j-lo-java8streamapi/index.html)

## Parallel Streams (parallel stream)

As mentioned earlier, there are two types of Stream: serial and parallel. Operations on the serial Stream are completed sequentially in one thread, while the parallel Stream is executed on multiple threads simultaneously.

The following example shows how to improve performance through parallel streams:

First we create a large table with no duplicate elements:

```java
int max = 1000000;
List<String> values = new ArrayList<>(max);
for (int i = 0; i < max; i++) {
    UUID uuid = UUID.randomUUID();
    values.add(uuid.toString());
}
```

We sort them in serial and parallel ways, and finally look at the comparison of the time taken.

### Sequential Sort (serial sort)

```java
//serial sorting
long t0 = System.nanoTime();
long count = values.stream().sorted().count();
System.out.println(count);

long t1 = System.nanoTime();

long millis = TimeUnit.NANOSECONDS.toMillis(t1 - t0);
System.out.println(String.format("sequential sort took: %d ms", millis));
```

```plain
1000000
sequential sort took: 709 ms//The time it took for serial sorting
```

### Parallel Sort (parallel sort)

```java
//Parallel sorting
long t0 = System.nanoTime();

long count = values.parallelStream().sorted().count();
System.out.println(count);

long t1 = System.nanoTime();

long millis = TimeUnit.NANOSECONDS.toMillis(t1 - t0);
System.out.println(String.format("parallel sort took: %d ms", millis));```

```java
1000000
parallel sort took: 475 ms//The time it takes for parallel sorting
```

The above two codes are almost the same, but the parallel version is about 50% faster. The only change that needs to be made is to change `stream()` to `parallelStream()`.

## Maps

As mentioned earlier, the Map type does not support streams, but Map provides some new and useful methods to handle some daily tasks. The Map interface itself has no `stream()` method available, but you can create specialized streams on keys, values ​​or via `map.keySet().stream()`, `map.values().stream()` and `map.entrySet().stream()`.

Additionally, Maps supports a variety of new and useful ways to perform common tasks.

```java
Map<Integer, String> map = new HashMap<>();

for (int i = 0; i < 10; i++) {
    map.putIfAbsent(i, "val" + i);
}

map.forEach((id, val) -> System.out.println(val));//val0 val1 val2 val3 val4 val5 val6 val7 val8 val9
```

`putIfAbsent` prevents us from writing extra code when checking for null; `forEach` accepts a consumer to operate on each element in the map.

This example shows how to use a function to evaluate code on a map:

```java
map.computeIfPresent(3, (num, val) -> val + num);
map.get(3); // val33

map.computeIfPresent(9, (num, val) -> null);
map.containsKey(9); // false

map.computeIfAbsent(23, num -> "val" + num);
map.containsKey(23); // true

map.computeIfAbsent(3, num -> "bam");
map.get(3); // val33
```

Next, we show how to delete an item in a Map whose key values all match:

```java
map.remove(3, "val3");
map.get(3); // val33
map.remove(3, "val33");
map.get(3); // null
```

Another useful method:

```java
map.getOrDefault(42, "not found"); // not found
```

Merging Map elements also becomes easy:

```java
map.merge(9, "val9", (value, newValue) -> value.concat(newValue));
map.get(9); // val9
map.merge(9, "concat", (value, newValue) -> value.concat(newValue));
map.get(9); // val9concat
```

What Merge does is to insert the key name if it does not exist, otherwise merge the values corresponding to the original keys and reinsert them into the map.

## Date API (date related API)

Java 8 includes a new date and time API under the `java.time` package. The new Date API is similar to the Joda-Time library, but they are not the same. The following examples cover the most important parts of this new API. The translator made most of the modifications to this part of the text with reference to relevant books.

**Translator's Note (Summary):**

- The Clock class provides methods for accessing the current date and time. Clock is time zone sensitive and can be used to replace `System.currentTimeMillis()` to obtain the current number of microseconds. A specific point in time can also be represented using the `Instant` class, which can also be used to create older versions of `java.util.Date` objects.

- Time zones are represented by ZoneId in the new API. The time zone can be easily obtained using the static method of. The abstract class `ZoneId` (in the `java.time` package) represents a zone identifier. It has a static method called `getAvailableZoneIds` which returns all zone identifiers.

- jdk1.8 adds new classes such as LocalDate and LocalDateTime to solve date processing methods, and introduces a new class DateTimeFormatter to solve date formatting problems. You can use Instant instead of Date, LocalDateTime instead of Calendar, and DateTimeFormatter instead of SimpleDateFormat.

### Clock

The Clock class provides methods for accessing the current date and time. Clock is time zone sensitive and can be used to replace `System.currentTimeMillis()` to obtain the current number of microseconds. A specific point in time can also be represented using the `Instant` class, which can also be used to create older versions of `java.util.Date` objects.

```java
Clock clock = Clock.systemDefaultZone();
long millis = clock.millis();
System.out.println(millis);//1552379579043
Instant instant = clock.instant();
System.out.println(instant);
Date legacyDate = Date.from(instant); //2019-03-12T08:46:42.588Z
System.out.println(legacyDate);//Tue Mar 12 16:32:59 CST 2019
```

### Timezones(time zone)

Time zones are represented using ZoneId in the new API. The time zone can be easily obtained using the static method of. The abstract class `ZoneId` (in the `java.time` package) represents a zone identifier. It has a static method called `getAvailableZoneIds` which returns all zone identifiers.

```java
//Output all region identifiers
System.out.println(ZoneId.getAvailableZoneIds());

ZoneId zone1 = ZoneId.of("Europe/Berlin");
ZoneId zone2 = ZoneId.of("Brazil/East");
System.out.println(zone1.getRules());// ZoneRules[currentStandardOffset=+01:00]
System.out.println(zone2.getRules());// ZoneRules[currentStandardOffset=-03:00]
```

### LocalTime (local time)

LocalTime defines a time without time zone information, such as 10 pm or 17:30:15. The following example creates two local times using the time zone created by the previous code. Afterwards compare the times and calculate the time difference between the two times in hours and minutes:

```java
LocalTime now1 = LocalTime.now(zone1);
LocalTime now2 = LocalTime.now(zone2);
System.out.println(now1.isBefore(now2)); // false

long hoursBetween = ChronoUnit.HOURS.between(now1, now2);
long minutesBetween = ChronoUnit.MINUTES.between(now1, now2);

System.out.println(hoursBetween); // -3
System.out.println(minutesBetween); // -239
```

LocalTime provides a variety of factory methods to simplify object creation, including parsing time strings.

```java
LocalTime late = LocalTime.of(23, 59, 59);
System.out.println(late); // 23:59:59
DateTimeFormatter germanFormatter =
    DateTimeFormatter
        .ofLocalizedTime(FormatStyle.SHORT)
        .withLocale(Locale.GERMAN);

LocalTime leetTime = LocalTime.parse("13:37", germanFormatter);
System.out.println(leetTime); // 13:37
```

### LocalDate (local date)LocalDate represents an exact date, such as 2014-03-11. The object value is immutable and its use is basically the same as LocalTime. The following example shows how to add and subtract days/months/years to a Date object. Also note that these objects are immutable and operations always return a new instance.

```java
LocalDate today = LocalDate.now();//Get the current date
System.out.println("Today's date: "+today);//2019-03-12
LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);
System.out.println("Tomorrow's date: "+tomorrow);//2019-03-13
LocalDate yesterday = tomorrow.minusDays(2);
System.out.println("Yesterday's date: "+yesterday);//2019-03-11
LocalDate independenceDay = LocalDate.of(2019, Month.MARCH, 12);
DayOfWeek dayOfWeek = independenceDay.getDayOfWeek();
System.out.println("What day of the week is today:"+dayOfWeek);//TUESDAY
```

Parsing a LocalDate type from a string is as easy as parsing a LocalTime. Here is an example of using `DateTimeFormatter` to parse a string:

```java
    String str1 = "2014==04==12 01 hours 06 minutes 09 seconds";
        // Define the formatter used for parsing based on the date and time strings that need to be parsed
        DateTimeFormatter fomatter1 = DateTimeFormatter
                .ofPattern("yyyy==MM==dd HH hours mm minutes ss seconds");

        LocalDateTime dt1 = LocalDateTime.parse(str1, fomatter1);
        System.out.println(dt1); // Output 2014-04-12T01:06:09

        String str2 = "2014$$$April$$$13 20 hours";
        DateTimeFormatter fomatter2 = DateTimeFormatter
                .ofPattern("yyy$$$MMM$$$dd HH hours");
        LocalDateTime dt2 = LocalDateTime.parse(str2, fomatter2);
        System.out.println(dt2); // Output 2014-04-13T20:00

```

Let’s look at another example of using `DateTimeFormatter` to format dates.

```java
LocalDateTime rightNow=LocalDateTime.now();
String date=DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(rightNow);
System.out.println(date);//2019-03-12T16:26:48.29
DateTimeFormatter formatter=DateTimeFormatter.ofPattern("YYYY-MM-dd HH:mm:ss");
System.out.println(formatter.format(rightNow));//2019-03-12 16:26:48
```

**🐛 Correction (see: [issue#1157](https://github.com/Snailclimb/JavaGuide/issues/1157))**: When using `YYYY` to display the year, the year of the week in which the current time is located will be displayed. There will be problems in New Year's Eve weeks. Generally, `yyyy` is used to display the exact year.

Example of incorrect date display due to a new year crossing:

```java
LocalDateTime rightNow = LocalDateTime.of(2020, 12, 31, 12, 0, 0);
String date= DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(rightNow);
// 2020-12-31T12:00:00
System.out.println(date);
DateTimeFormatter formatterOfYYYY = DateTimeFormatter.ofPattern("YYYY-MM-dd HH:mm:ss");
// 2021-12-31 12:00:00
System.out.println(formatterOfYYYY.format(rightNow));

DateTimeFormatter formatterOfYyyy = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
// 2020-12-31 12:00:00
System.out.println(formatterOfYyyy.format(rightNow));
```

The specific error can be seen more clearly from the picture below, and IDEA has intelligently prompted to use `yyyy` instead of `YYYY`.

![](https://oss.javaguide.cn/github/javaguide/java/new-features/2021042717491413.png)

### LocalDateTime (local date and time)

LocalDateTime represents both time and date, which is equivalent to merging the contents of the previous two sections into one object. LocalDateTime, like LocalTime and LocalDate, is immutable. LocalDateTime provides some methods to access specific fields.

```java
LocalDateTime sylvester = LocalDateTime.of(2014, Month.DECEMBER, 31, 23, 59, 59);

DayOfWeek dayOfWeek = sylvester.getDayOfWeek();
System.out.println(dayOfWeek); // WEDNESDAY

Month month = sylvester.getMonth();
System.out.println(month); // DECEMBER

long minuteOfDay = sylvester.getLong(ChronoField.MINUTE_OF_DAY);
System.out.println(minuteOfDay); // 1439
```

Just append the time zone information and convert it to a point-in-time Instant object. Instant point-in-time objects can be easily converted to the old-fashioned `java.util.Date`.

```java
Instant instant = sylvester
        .atZone(ZoneId.systemDefault())
        .toInstant();

Date legacyDate = Date.from(instant);
System.out.println(legacyDate); // Wed Dec 31 23:59:59 CET 2014
```

Formatting LocalDateTime is the same as formatting time and date. In addition to using the predefined formats, we can also define the format ourselves:

```java
DateTimeFormatter formatter =
    DateTimeFormatter
        .ofPattern("MMM dd, yyyy - HH:mm");
LocalDateTime parsed = LocalDateTime.parse("Nov 03, 2014 - 07:13", formatter);
String string = formatter.format(parsed);
System.out.println(string); // Nov 03, 2014 - 07:13
```

Unlike java.text.NumberFormat, the new DateTimeFormatter is immutable, so it is thread-safe.
Detailed information about date and time formats is available here.

## Annotations (annotations)

Multiple annotations are supported in Java 8. Let’s look at an example to understand what it means.
First define a wrapper class Hints annotation to place a specific set of Hint annotations:

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Hints {
    Hint[] value();
}
@Repeatable(Hints.class)
@interface Hint {
    String value();
}```

Java 8 allows us to use the same type of annotation multiple times. We only need to mark the annotation with `@Repeatable`.

Example 1: Use a wrapper class as a container to store multiple annotations (old method)

```java
@Hints({@Hint("hint1"), @Hint("hint2")})
class Person {}
```

Example 2: Using multiple annotations (new approach)

```java
@Hint("hint1")
@Hint("hint2")
class Person {}
```

In the second example, the Java compiler will implicitly define the @Hints annotation for you. Understanding this will help you use reflection to obtain this information:

```java
Hint hint = Person.class.getAnnotation(Hint.class);
System.out.println(hint); // null
Hints hints1 = Person.class.getAnnotation(Hints.class);
System.out.println(hints1.value().length); // 2

Hint[] hints2 = Person.class.getAnnotationsByType(Hint.class);
System.out.println(hints2.length); // 2
```

Even if we do not define the `@Hints` annotation on the `Person` class, we can still obtain the `@Hints` annotation through `getAnnotation(Hints.class)`. A more convenient method is to use `getAnnotationsByType` to directly obtain all `@Hint` annotations.
In addition, Java 8 annotations have been added to two new targets:

```java
@Target({ElementType.TYPE_PARAMETER, ElementType.TYPE_USE})
@interface MyAnnotation {}
```

## Where to go from here?

That’s it for writing about the new features of Java 8. There are definitely more features waiting to be discovered. There are many more useful things in JDK 1.8, such as `Arrays.parallelSort`, `StampedLock` and `CompletableFuture` and so on.

<!-- @include: @article-footer.snippet.md -->