---
title: Atomic Atomic Class Summary
category: Java
tag:
  - Java concurrency
head:
  - - meta
    - name: keywords
      content: Atomic class, AtomicInteger, AtomicLong, AtomicBoolean, AtomicReference, CAS, optimistic locking, atomic operation, JUC
  - - meta
    - name: description
      content: Overview of the types and usage scenarios of JUC atomic classes, CAS-based atomicity guarantee and concurrency performance, and understanding of the advantages and limitations of atomic classes compared to locks.
---

## Introduction to Atomic class

`Atomic` translated into Chinese means "atom". In chemistry, atoms are the smallest units of matter and are indivisible in chemical reactions. In programming, `Atomic` refers to the atomicity of an operation, that is, the operation is indivisible and uninterruptible. Even when multiple threads execute at the same time, the operation is either fully executed or not executed, and the partially completed status will not be seen by other threads.

An atomic class is simply a class with atomic operation characteristics.

The `Atomic` class in the `java.util.concurrent.atomic` package provides a thread-safe way to manipulate individual variables.

The `Atomic` class relies on CAS (Compare-And-Swap, compare and swap) optimistic locking to guarantee the atomicity of its methods without using traditional locking mechanisms (such as `synchronized` blocks or `ReentrantLock`).

In this article, we only introduce the concept of Atomic atomic class. For the specific implementation principle, you can read this article written by the author: [CAS Detailed Explanation] (./cas.md).

![JUC Atomic Class Overview](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

According to the data type of the operation, the atomic classes in the JUC package can be divided into 4 categories:

**1.Basic type**

Update basic types atomically

- `AtomicInteger`: Integer atomic class
- `AtomicLong`: Long integer atomic class
- `AtomicBoolean`: Boolean atomic class

**2. Array type**

Update an element in an array atomically

- `AtomicIntegerArray`: Integer array atomic class
- `AtomicLongArray`: long integer array atomic class
- `AtomicReferenceArray`: reference type array atomic class

**3. Reference type**

- `AtomicReference`: reference type atomic class
- `AtomicMarkableReference`: Atomic update of a marked reference type. This class associates boolean tags with references, and can also solve ABA problems that may occur when using CAS for atomic updates.
- `AtomicStampedReference`: Atomicly update a reference type with a version number. This class associates integer values ​​with references and can be used to solve atomic update data and data version numbers, and can solve ABA problems that may occur when using CAS for atomic updates.

**🐛 Bugfix (see: [issue#626](https://github.com/Snailclimb/JavaGuide/issues/626))**: `AtomicMarkableReference` does not solve ABA issues.

**4. Object attribute modification type**

- `AtomicIntegerFieldUpdater`: updater for atomically updating integer fields
- `AtomicLongFieldUpdater`: updater for atomically updating long integer fields
- `AtomicReferenceFieldUpdater`: atomically update fields in reference types

## Basic type atomic class

Update basic types atomically

- `AtomicInteger`: Integer atomic class
- `AtomicLong`: Long integer atomic class
- `AtomicBoolean`: Boolean atomic class

The methods provided by the above three classes are almost the same, so we use `AtomicInteger` as an example to introduce them here.

**Common methods of `AtomicInteger` class**:

```java
public final int get() //Get the current value
public final int getAndSet(int newValue)//Get the current value and set the new value
public final int getAndIncrement()//Get the current value and increment it
public final int getAndDecrement() //Get the current value and decrement it
public final int getAndAdd(int delta) //Get the current value and add the expected value
boolean compareAndSet(int expect, int update) //If the input value is equal to the expected value, atomically set the value to the input value (update)
public final void lazySet(int newValue)//Finally set to newValue, lazySet provides a weaker semantic than the set method, which may cause other threads to still read the old value in a short period of time, but it may be more efficient.
```

**`AtomicInteger` class usage example**:

```java
//Initialize the AtomicInteger object, the initial value is 0
AtomicInteger atomicInt = new AtomicInteger(0);

// Use the getAndSet method to get the current value and set the new value to 3
int tempValue = atomicInt.getAndSet(3);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Use the getAndIncrement method to get the current value and increment it by 1
tempValue = atomicInt.getAndIncrement();
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Use the getAndAdd method to get the current value and increase the specified value by 5
tempValue = atomicInt.getAndAdd(5);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// Use the compareAndSet method for atomic conditional update, the expected value is 9, the updated value is 10
boolean updateSuccess = atomicInt.compareAndSet(9, 10);
System.out.println("Update Success: " + updateSuccess + "; atomicInt: " + atomicInt);

// Get the current value
int currentValue = atomicInt.get();
System.out.println("Current value: " + currentValue);

// Use the lazySet method to set the new value to 15
atomicInt.lazySet(15);
System.out.println("After lazySet, atomicInt: " + atomicInt);
```

Output:

```java
tempValue: 0; atomicInt: 3
tempValue: 3; atomicInt: 4
tempValue: 4; atomicInt: 9
Update Success: true; atomicInt: 10
Current value: 10
After lazySet, atomicInt: 15
```

## Array type atomic class

Update an element in an array atomically

- `AtomicIntegerArray`: Integer array atomic class
- `AtomicLongArray`: Long integer array atomic class
- `AtomicReferenceArray`: reference type array atomic class

The methods provided by the above three classes are almost the same, so we use `AtomicIntegerArray` as an example to introduce them here.

**Common methods of `AtomicIntegerArray` class**:

```java
public final int get(int i) //Get the value of the element at index=i position
public final int getAndSet(int i, int newValue)//Return the current value at index=i and set it to the new value: newValue
public final int getAndIncrement(int i)//Get the value of the element at index=i position, and let the element at that position increase by itself
public final int getAndDecrement(int i) //Get the value of the element at index=i and let the element at that position decrement
public final int getAndAdd(int i, int delta) //Get the value of the element at index=i and add the expected value
boolean compareAndSet(int i, int expect, int update) //If the input value is equal to the expected value, atomically set the element value at index=i to the input value (update)
public final void lazySet(int i, int newValue)//Finally set the element at index=i to newValue. Using lazySet to set it may cause other threads to still be able to read the old value in a short period of time.```

**`AtomicIntegerArray` class usage example**:

```java
int[] nums = {1, 2, 3, 4, 5, 6};
//Create AtomicIntegerArray
AtomicIntegerArray atomicArray = new AtomicIntegerArray(nums);

//Print the initial value in AtomicIntegerArray
System.out.println("Initial values in AtomicIntegerArray:");
for (int j = 0; j < nums.length; j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Set the value at index 0 to 2 using the getAndSet method and return the old value
int tempValue = atomicArray.getAndSet(0, 2);
System.out.println("\nAfter getAndSet(0, 2):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Use the getAndIncrement method to increment the value at index 0 by 1 and return the old value
tempValue = atomicArray.getAndIncrement(0);
System.out.println("\nAfter getAndIncrement(0):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// Use the getAndAdd method to increase the value at index 0 by 5 and return the old value
tempValue = atomicArray.getAndAdd(0, 5);
System.out.println("\nAfter getAndAdd(0, 5):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}
```

Output:

```plain
Initial values in AtomicIntegerArray:
Index 0: 1 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndSet(0, 2):
Returned value: 1
Index 0: 2 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndIncrement(0):
Returned value: 2
Index 0: 3 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndAdd(0, 5):
Returned value: 3
Index 0: 8 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
```

## Reference type atomic class

Basic type atomic classes can only update one variable. If you need to update multiple variables atomically, you need to use reference type atomic classes.

- `AtomicReference`: reference type atomic class
- `AtomicStampedReference`: Atomicly update a reference type with a version number. This class associates integer values ​​with references and can be used to solve atomic update data and data version numbers, and can solve ABA problems that may occur when using CAS for atomic updates.
- `AtomicMarkableReference`: Atomic update of a marked reference type. This class associates boolean tags with references and can also solve ABA issues that may arise when using CAS for atomic updates. ~~

The methods provided by the above three classes are almost the same, so we use `AtomicReference` as an example to introduce them here.

**`AtomicReference` class usage example**:

```java
// Person class
class Person {
    private String name;
    private int age;
    //Omit getter/setter and toString
}


//Create AtomicReference object and set initial value
AtomicReference<Person> ar = new AtomicReference<>(new Person("SnailClimb", 22));

// print initial value
System.out.println("Initial Person: " + ar.get().toString());

//update value
Person updatePerson = new Person("Daisy", 20);
ar.compareAndSet(ar.get(), updatePerson);

//Print the updated value
System.out.println("Updated Person: " + ar.get().toString());

//Try to update again
Person anotherUpdatePerson = new Person("John", 30);
boolean isUpdated = ar.compareAndSet(updatePerson, anotherUpdatePerson);

//Print whether the update is successful and the final value
System.out.println("Second Update Success: " + isUpdated);
System.out.println("Final Person: " + ar.get().toString());
```

Output:

```plain
Initial Person: Person{name='SnailClimb', age=22}
Updated Person: Person{name='Daisy', age=20}
Second Update Success: true
Final Person: Person{name='John', age=30}
```

**`AtomicStampedReference` class usage example**:

```java
//Create an AtomicStampedReference object with the initial value "SnailClimb" and the initial version number 1
AtomicStampedReference<String> asr = new AtomicStampedReference<>("SnailClimb", 1);

//Print initial value and version number
int[] initialStamp = new int[1];
String initialRef = asr.get(initialStamp);
System.out.println("Initial Reference: " + initialRef + ", Initial Stamp: " + initialStamp[0]);

//Update value and version number
int oldStamp = initialStamp[0];
String oldRef = initialRef;
String newRef = "Daisy";
int newStamp = oldStamp + 1;

boolean isUpdated = asr.compareAndSet(oldRef, newRef, oldStamp, newStamp);
System.out.println("Update Success: " + isUpdated);

//Print the updated value and version number
int[] updatedStamp = new int[1];
String updatedRef = asr.get(updatedStamp);
System.out.println("Updated Reference: " + updatedRef + ", Updated Stamp: " + updatedStamp[0]);

// Attempt to update with wrong version number
boolean isUpdatedWithWrongStamp = asr.compareAndSet(newRef, "John", oldStamp, newStamp + 1);
System.out.println("Update with Wrong Stamp Success: " + isUpdatedWithWrongStamp);

//Print the final value and version number
int[] finalStamp = new int[1];
String finalRef = asr.get(finalStamp);
System.out.println("Final Reference: " + finalRef + ", Final Stamp: " + finalStamp[0]);```

The output is as follows:

```plain
Initial Reference: SnailClimb, Initial Stamp: 1
Update Success: true
Updated Reference: Daisy, Updated Stamp: 2
Update with Wrong Stamp Success: false
Final Reference: Daisy, Final Stamp: 2
```

**`AtomicMarkableReference` class usage example**:

```java
//Create an AtomicMarkableReference object with an initial value of "SnailClimb" and an initial mark of false
AtomicMarkableReference<String> amr = new AtomicMarkableReference<>("SnailClimb", false);

//Print initial value and tag
boolean[] initialMark = new boolean[1];
String initialRef = amr.get(initialMark);
System.out.println("Initial Reference: " + initialRef + ", Initial Mark: " + initialMark[0]);

// update values and tags
String oldRef = initialRef;
String newRef = "Daisy";
boolean oldMark = initialMark[0];
boolean newMark = true;

boolean isUpdated = amr.compareAndSet(oldRef, newRef, oldMark, newMark);
System.out.println("Update Success: " + isUpdated);

//Print updated value and tag
boolean[] updatedMark = new boolean[1];
String updatedRef = amr.get(updatedMark);
System.out.println("Updated Reference: " + updatedRef + ", Updated Mark: " + updatedMark[0]);

// Attempt to update with wrong tag
boolean isUpdatedWithWrongMark = amr.compareAndSet(newRef, "John", oldMark, !newMark);
System.out.println("Update with Wrong Mark Success: " + isUpdatedWithWrongMark);

//Print the final value and token
boolean[] finalMark = new boolean[1];
String finalRef = amr.get(finalMark);
System.out.println("Final Reference: " + finalRef + ", Final Mark: " + finalMark[0]);
```

The output is as follows:

```plain
Initial Reference: SnailClimb, Initial Mark: false
Update Success: true
Updated Reference: Daisy, Updated Mark: true
Update with Wrong Mark Success: false
Final Reference: Daisy, Final Mark: true
```

## Object attribute modification type atomic class

If you need to atomically update a field in a class, you need to use the object's attribute modification type atomic class.

- `AtomicIntegerFieldUpdater`: updater for atomically updating integer fields
- `AtomicLongFieldUpdater`: updater for atomically updating long fields
- `AtomicReferenceFieldUpdater`: an updater that atomically updates fields in reference types

Updating an object's properties atomically requires two steps. The first step is that because the object's attribute modification type atomic class is an abstract class, you must use the static method newUpdater() to create an updater every time you use it, and you need to set the class and attributes you want to update. In the second step, the updated object properties must use the volatile int modifier.

The methods provided by the above three classes are almost the same, so we use `AtomicIntegerFieldUpdater` as an example to introduce them here.

**`AtomicIntegerFieldUpdater` class usage example**:

```java
// Person class
class Person {
    private String name;
    // To use AtomicIntegerFieldUpdater, the field must be volatile int
    volatile int age;
    //Omit getter/setter and toString
}

//Create AtomicIntegerFieldUpdater object
AtomicIntegerFieldUpdater<Person> ageUpdater = AtomicIntegerFieldUpdater.newUpdater(Person.class, "age");

//Create Person object
Person person = new Person("SnailClimb", 22);

// print initial value
System.out.println("Initial Person: " + person);

//Update age field
ageUpdater.incrementAndGet(person); // self-increment
System.out.println("After Increment: " + person);

ageUpdater.addAndGet(person, 5); // Add 5
System.out.println("After Adding 5: " + person);

ageUpdater.compareAndSet(person, 28, 30); // If the current value is 28, set it to 30
System.out.println("After Compare and Set (28 to 30): " + person);

// Attempt to update with wrong comparison value
boolean isUpdated = ageUpdater.compareAndSet(person, 28, 35); // This time it should fail
System.out.println("Compare and Set (28 to 35) Success: " + isUpdated);
System.out.println("Final Person: " + person);
```

Output result:

```plain
Initial Person: Name: SnailClimb, Age: 22
After Increment: Name: SnailClimb, Age: 23
After Adding 5: Name: SnailClimb, Age: 28
After Compare and Set (28 to 30): Name: SnailClimb, Age: 30
Compare and Set (28 to 35) Success: false
Final Person: Name: SnailClimb, Age: 30
```

## Reference

- "The Art of Concurrent Programming in Java"

<!-- @include: @article-footer.snippet.md -->