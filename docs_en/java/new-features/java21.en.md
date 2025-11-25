---
title: Overview of new features in Java 21 (Important)
category: Java
tag:
  - Java new features
head:
  - - meta
    - name: keywords
      content: Java 21, JDK21, LTS, string templates, Sequenced Collections, generational ZGC, record mode, switch pattern matching, virtual threads, external functions and memory API
  - - meta
    - name: description
      content: Overview of the key new features and practical impact of JDK 21, focusing on string templates, Sequenced Collections, generational ZGC, virtual threads, etc.
---

JDK 21 was released on September 19, 2023. This is a very important version and milestone.

JDK21 is LTS (long-term support version). So far, there are currently four long-term support versions: JDK8, JDK11, JDK17 and JDK21.

JDK 21 has a total of 15 new features. This article will select some of the more important new features and introduce them in detail:

- [JEP 430: String Templates](https://openjdk.org/jeps/430) (Preview)
- [JEP 431: Sequenced Collections](https://openjdk.org/jeps/431)

- [JEP 439: Generational ZGC (generational ZGC)](https://openjdk.org/jeps/439)

- [JEP 440: Record Patterns (record mode)](https://openjdk.org/jeps/440)

- [JEP 441: Pattern Matching for switch (pattern matching for switch)](https://openjdk.org/jeps/442)

- [JEP 442: Foreign Function & Memory API (Foreign Function and Memory API)](https://openjdk.org/jeps/442) (Third Preview)

- [JEP 443: Unnamed Patterns and Variables](https://openjdk.org/jeps/443) (Preview)

- [JEP 444: Virtual Threads (virtual threads)](https://openjdk.org/jeps/444)

- [JEP 445: Unnamed Classes and Instance Main Methods (unnamed classes and instance main methods)](https://openjdk.org/jeps/445) (Preview)

## JEP 430: String Templates (Preview)

String Templates are still a preview feature in JDK 21.

String Templates provide a cleaner, more intuitive way to dynamically build strings. By using the placeholder `${}`, we can embed the value of the variable directly into the string without manual processing. At run time, the Java compiler replaces these placeholders with actual variable values. Moreover, expressions support local variables, static/non-static fields and even methods, calculation results and other features.

In fact, String Templates exist in most programming languages:

```typescript
"Greetings {{ name }}!"; //Angular
`Greetings ${ name }!`; //Typescript
$"Greetings { name }!" //Visual basic
f"Greetings { name }!" //Python
```

Before Java had String Templates, we usually used string concatenation or formatting methods to build strings:

```java
//concatenation
message = "Greetings " + name + "!";

//String.format()
message = String.format("Greetings %s!", name); //concatenation

//MessageFormat
message = new MessageFormat("Greetings {0}!").format(name);

//StringBuilder
message = new StringBuilder().append("Greetings ").append(name).append("!").toString();
```

These methods all have some shortcomings, such as being difficult to read, lengthy, and complex.

Java uses String Templates for string concatenation, which can embed expressions directly in strings without additional processing:

```java
String message = STR."Greetings \{name}!";
```

In the template expression above:

- STR is a template processor.
- `\{name}` is an expression. When running, these expressions will be replaced by the corresponding variable values.

Java currently supports three template processors:

- STR: Automatically performs string interpolation, i.e. replaces each embedded expression in the template with its value (converted to a string).
- FMT: Similar to STR, but it can also accept format specifiers. These format specifiers appear on the left side of embedded expressions and are used to control the style of the output.
- RAW: Does not automatically process string templates like STR and FMT template processors, but returns a `StringTemplate` object that contains information about the text and expressions in the template.

```java
String name = "Lokesh";

//STR
String message = STR."Greetings \{name}.";

//FMT
String message = FMT."Greetings %-12s\{name}.";

//RAW
StringTemplate st = RAW."Greetings \{name}.";
String message = STR.process(st);
```

In addition to the three template processors that come with JDK, you can also implement the `StringTemplate.Processor` interface to create your own template processor. You only need to inherit the `StringTemplate.Processor` interface and then implement the `process` method.

We can use local variables, static/non-static fields and even methods as embedded expressions:

```java
//variable
message = STR."Greetings \{name}!";

//method
message = STR."Greetings \{getName()}!";

//field
message = STR."Greetings \{this.name}!";
```

You can also perform calculations in expressions and print the results:

```java
int x = 10, y = 20;
String s = STR."\{x} + \{y} = \{x + y}"; //"10 + 20 = 30"
```

To improve readability, we can break the embedded expression into multiple lines:

```java
String time = STR."The current time is \{
    //sample comment - current time in HH:mm:ss
    DateTimeFormatter
      .ofPattern("HH:mm:ss")
      .format(LocalTime.now())
  }.";
```

## JEP431: Serialized Collections

JDK 21 introduces a new collection type: Sequenced Collections (serialized collections, also called ordered collections), which are collections with a certain encounter order (no matter how many times we traverse such a collection, the appearance order of elements is always fixed). Serialized collections provide an easy way to handle the first and last elements of the collection as well as reverse views (in reverse order of the original collection).

Sequenced Collections includes the following three interfaces:

- [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html)
- [`SequencedSet`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedSet.html)
- [`SequencedMap`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedMap.html)

The `SequencedCollection` interface inherits the `Collection` interface and provides methods to access, add or delete elements at both ends of the collection, and obtain the reverse view of the collection.

```java
interface SequencedCollection<E> extends Collection<E> {

  // New Method

  SequencedCollection<E> reversed();

  // Promoted methods from Deque<E>

  void addFirst(E);
  void addLast(E);

  E getFirst();
  E getLast();

  E removeFirst();
  E removeLast();
}```

The `List` and `Deque` interfaces implement the `SequencedCollection` interface.

Here we take `ArrayList` as an example to demonstrate the actual usage effect:

```java
ArrayList<Integer> arrayList = new ArrayList<>();

arrayList.add(1); // List contains: [1]

arrayList.addFirst(0); // List contains: [0, 1]
arrayList.addLast(2); // List contains: [0, 1, 2]

Integer firstElement = arrayList.getFirst(); // 0
Integer lastElement = arrayList.getLast(); // 2

List<Integer> reversed = arrayList.reversed();
System.out.println(reversed); // Prints [2, 1, 0]
```

The `SequencedSet` interface directly inherits the `SequencedCollection` interface and overrides the `reversed()` method.

```java
interface SequencedSet<E> extends SequencedCollection<E>, Set<E> {

    SequencedSet<E> reversed();
}
```

`SortedSet` and `LinkedHashSet` implement the `SequencedSet` interface.

Here we take `LinkedHashSet` as an example to demonstrate the actual usage effect:

```java
LinkedHashSet<Integer> linkedHashSet = new LinkedHashSet<>(List.of(1, 2, 3));

Integer firstElement = linkedHashSet.getFirst(); // 1
Integer lastElement = linkedHashSet.getLast(); // 3

linkedHashSet.addFirst(0); //List contains: [0, 1, 2, 3]
linkedHashSet.addLast(4); //List contains: [0, 1, 2, 3, 4]

System.out.println(linkedHashSet.reversed()); //Prints [4, 3, 2, 1, 0]
```

The `SequencedMap` interface inherits the `Map` interface and provides methods to access, add or delete key-value pairs at both ends of the collection, obtain `SequencedSet` containing key, `SequencedCollection` containing value, `SequencedSet` containing entry (key-value pair), and obtain the reverse view of the collection.

```java
interface SequencedMap<K,V> extends Map<K,V> {

  // New Methods

  SequencedMap<K,V> reversed();

  SequencedSet<K> sequencedKeySet();
  SequencedCollection<V> sequencedValues();
  SequencedSet<Entry<K,V>> sequencedEntrySet();

  V putFirst(K, V);
  V putLast(K, V);


  // Promoted Methods from NavigableMap<K, V>

  Entry<K, V> firstEntry();
  Entry<K, V> lastEntry();

  Entry<K, V> pollFirstEntry();
  Entry<K, V> pollLastEntry();
}
```

`SortedMap` and `LinkedHashMap` implement the `SequencedMap` interface.

Here we take `LinkedHashMap` as an example to demonstrate the actual usage effect:

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>();

map.put(1, "One");
map.put(2, "Two");
map.put(3, "Three");

map.firstEntry(); //1=One
map.lastEntry(); //3=Three

System.out.println(map); //{1=One, 2=Two, 3=Three}

Map.Entry<Integer, String> first = map.pollFirstEntry(); //1=One
Map.Entry<Integer, String> last = map.pollLastEntry(); //3=Three

System.out.println(map); //{2=Two}

map.putFirst(1, "One"); //{1=One, 2=Two}
map.putLast(3, "Three"); //{1=One, 2=Two, 3=Three}

System.out.println(map); //{1=One, 2=Two, 3=Three}
System.out.println(map.reversed()); //{3=Three, 2=Two, 1=One}
```

## JEP 439: Generational ZGC

In JDK21, the functions of ZGC have been expanded and the generational GC function has been added. However, it is turned off by default and needs to be turned on through configuration:

```bash
// Enable generational ZGC
java -XX:+UseZGC -XX:+ZGenerational ...
```

In future versions, the official will set ZGenerational as the default value, that is, the generational GC of ZGC will be turned on by default. In later versions, non-generational ZGC was removed.

> In a future release we intend to make Generational ZGC the default, at which point -XX:-ZGenerational will select non-generational ZGC. In an even later release we intend to remove non-generational ZGC, at which point the ZGenerational option will become obsolete.
>
> In a future release we intend to make Generational ZGC the default option, in which case -XX:-ZGenerational will select non-generational ZGC. In a later release, we plan to remove non-generational ZGC, at which point the ZGenerational option will become obsolete.

Generational ZGC can significantly reduce pause times during garbage collection and improve application responsiveness. This is very valuable for performance optimization in large Java applications and high concurrency scenarios.

## JEP 440: Recording Mode

Recording mode was first previewed in Java 19, proposed by [JEP 405](https://openjdk.org/jeps/405). JDK 20 is the second preview, proposed by [JEP 432](https://openjdk.org/jeps/432). Finally, the recording mode was successfully converted into a regular version in JDK21.

[Java 20 New Features Overview](./java20.md) has already introduced the recording mode in detail, so I will not repeat it here.

## JEP 441: Pattern matching for switch

Enhance switch expressions and statements in Java to allow the use of patterns in case labels. When the pattern matches, the code corresponding to the case label is executed.

In the code below, the switch expression uses a type pattern for matching.

```java
static String formatterPatternSwitch(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l -> String.format("long %d", l);
        case Double d -> String.format("double %f", d);
        case String s -> String.format("String %s", s);
        default -> obj.toString();
    };
}
```

## JEP 442: External Functions and Memory API (Third Preview)This API allows Java programs to interoperate with code and data outside the Java runtime. By efficiently calling external functions (i.e., code outside the JVM) and safely accessing external memory (i.e., memory not managed by the JVM), the API enables Java programs to call native libraries and manipulate native data without the dangers and brittleness of JNI.

The external functions and memory API had its first incubation in Java 17, proposed by [JEP 412](https://openjdk.java.net/jeps/412). There was a second incubation in Java 18, proposed by [JEP 419](https://openjdk.org/jeps/419). First previewed in Java 19, proposed by [JEP 424](https://openjdk.org/jeps/424). JDK 20 is the second preview, proposed by [JEP 434](https://openjdk.org/jeps/434). JDK 21 is the third preview, proposed by [JEP 442](https://openjdk.org/jeps/442).

In [Java 19 New Features Overview](./java19.md), I have introduced external functions and memory API in detail, so I will not give additional introduction here.

## JEP 443: Unnamed patterns and variables (preview)

Unnamed patterns and variables allow us to use underscore `_` to represent unnamed variables and components not used in pattern matching, aiming to improve the readability and maintainability of the code.

Typical scenarios for unnamed variables are `try-with-resources` statements, exception variables in `catch` clauses, and `for` loops. When a variable does not need to be used, you can use an underscore `_` instead to clearly identify the unused variable.

```java
try (var _ = ScopedContext.acquire()) {
  // No use of acquired resource
}
try { ... }
catch (Exception _) { ... }
catch (Throwable _) { ... }

for (int i = 0, _ = runOnce(); i < arr.length; i++) {
  ...
}
```

An unnamed pattern is an unconditional pattern and does not bind any values. Unnamed pattern variables appear in type patterns.

```java
if (r instanceof ColoredPoint(_, Color c)) { ... c ... }

switch (b) {
    case Box(RedBall _), Box(BlueBall _) -> processBox(b);
    case Box(GreenBall _) -> stopProcessing();
    case Box(_) -> pickAnotherBox();
}
```

## JEP 444: Virtual Threads

Virtual threads are a heavyweight update that must be paid attention to!

Virtual threads were first previewed in Java 19, proposed by [JEP 425](https://openjdk.org/jeps/425). JDK 20 is the second preview. Finally, virtual threads became regular in JDK21.

[Java 20 New Features Overview](./java20.md) has already introduced virtual threads in detail, so I won’t repeat it here.

## JEP 445: Unnamed class and instance main methods (preview)

This feature mainly simplifies the declaration of the `main` method. For Java beginners, this declaration of the `main` method introduces too many Java syntax concepts, which is not conducive to beginners getting started quickly.

Define a `main` method before using this feature:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Define a `main` method after using this new feature:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

Further simplification (unnamed classes allow us to not define a class name):

```java
void main() {
   System.out.println("Hello, World!");
}
```

## Reference

- Java 21 String Templates: <https://howtodoinjava.com/java/java-string-templates/>
- Java 21 Sequenced Collections: <https://howtodoinjava.com/java/sequenced-collections/>