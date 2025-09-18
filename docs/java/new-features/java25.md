JDK 25 于 2025 年 9 月 16 日 发布，这是一个非常重要的版本，里程碑式。

JDK 25 是 LTS（长期支持版），至此为止，目前有 JDK8、JDK11、JDK17、JDK21 和 JDK 25 这四个长期支持版了。

JDK 21 共有 18 个新特性，这篇文章会挑选其中较为重要的一些新特性进行详细介绍：

- [JEP 506: Scoped Values (作用域值)](https://openjdk.org/projects/jdk/25/)
- [JEP 512: Compact Source Files and Instance Main Methods (紧凑源文件与实例主方法)](https://openjdk.org/jeps/512)
- [JEP 519: Compact Object Headers (紧凑对象头)](https://openjdk.org/jeps/519)
- [JEP 521: Generational Shenandoah (分代 Shenandoah GC)](https://openjdk.org/jeps/521)
- [JEP 507: Primitive Types in Patterns, instanceof, and switch (模式匹配支持基本类型, 第三次预览)](https://openjdk.org/jeps/507)
- [JEP 505: Structured Concurrency (结构化并发, 第五次预览)](https://openjdk.org/jeps/505)
- [JEP 511: Module Import Declarations (模块导入声明)](https://openjdk.org/jeps/511)
- [JEP 513: Flexible Constructor Bodies (灵活的构造函数体)](https://openjdk.org/jeps/513)
- [JEP 508: Vector API (向量 API, 第十次孵化)](https://openjdk.org/jeps/508)

下图是从 JDK 8 到 JDK 24 每个版本的更新带来的新特性数量和更新时间：

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 506: 作用域值

作用域值（Scoped Values）可以在线程内和线程间共享不可变的数据，优于线程局部变量 `ThreadLocal` ，尤其是在使用大量虚拟线程时。

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

作用域值通过其“写入时复制”(copy-on-write)的特性，保证了数据在线程间的隔离与安全，同时性能极高，占用内存也极低。这个特性将成为未来 Java 并发编程的标准实践。

## JEP 512: 紧凑源文件与实例主方法

该特性第一次预览是由 [JEP 445](https://openjdk.org/jeps/445) （JDK 21 ）提出，随后经过了 JDK 22 、JDK 23 和 JDK 24 的改进和完善，最终在 JDK 25 顺利转正。

这个改进极大地简化了编写简单 Java 程序的步骤，允许将类和主方法写在同一个没有顶级 `public class`的文件中，并允许 `main` 方法成为一个非静态的实例方法。

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

进一步简化：

```java
void main() {
    System.out.println("Hello, World!");
}
```

这是为了降低 Java 的学习门槛和提升编写小型程序、脚本的效率而迈出的一大步。初学者不再需要理解 `public static void main(String[] args)` 这一长串复杂的声明。对于快速原型验证和脚本编写，这也使得 Java 成为一个更有吸引力的选择。

## JEP 519: 紧凑对象头

该特性第一次预览是由 [JEP 450](https://openjdk.org/jeps/450) （JDK 24 ）提出，JDK 25 就顺利转正了。

通过优化对象头的内部结构，在 64 位架构的 HotSpot 虚拟机中，将对象头大小从原本的 96-128 位（12-16 字节）缩减至 64 位（8 字节），最终实现减少堆内存占用、提升部署密度、增强数据局部性的效果。

紧凑对象头并没有成为 JVM 默认的对象头布局方式，需通过显式配置启用：

- JDK 24 需通过命令行参数组合启用：
  `$ java -XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders ...` ；
- JDK 25 之后仅需 `-XX:+UseCompactObjectHeaders` 即可启用。

## JEP 521: 分代 Shenandoah GC

Shenandoah GC 在 JDK12 中成为正式可生产使用的 GC，默认关闭，通过 `-XX:+UseShenandoahGC` 启用。

Redhat 主导开发的 Pauseless GC 实现，主要目标是 99.9% 的暂停小于 10ms，暂停与堆大小无关等

传统的 Shenandoah 对整个堆进行并发标记和整理，虽然暂停时间极短，但在处理年轻代对象时效率不如分代 GC。引入分代后，Shenandoah 可以更频繁、更高效地回收年轻代中的大量“朝生夕死”的对象，使其在保持极低暂停时间的同时，拥有了更高的吞吐量和更低的 CPU 开销。

Shenandoah GC 需要通过命令启用：

- JDK 24 需通过命令行参数组合启用：`-XX:+UseShenandoahGC -XX:+UnlockExperimentalVMOptions -XX:ShenandoahGCMode=generational`
- JDK 25 之后仅需 `-XX:+UseShenandoahGC  -XX:ShenandoahGCMode=generational` 即可启用。

## JEP 507: 模式匹配支持基本类型 (第三次预览)

该特性第一次预览是由 [JEP 455](https://openjdk.org/jeps/455) （JDK 23 ）提出。

模式匹配可以在 `switch` 和 `instanceof` 语句中处理所有的基本数据类型（`int`, `double`, `boolean` 等）

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("这是一个int类型: " + i);
    }
}
```

这样就可以像处理对象类型一样，对基本类型进行更安全、更简洁的类型匹配和转换，进一步消除了 Java 中的模板代码。

## JEP 505: 结构化并发(第五次预览)

JDK 19 引入了结构化并发，一种多线程编程方法，目的是为了通过结构化并发 API 来简化多线程编程，并不是为了取代`java.util.concurrent`，目前处于孵化器阶段。

结构化并发将不同线程中运行的多个任务视为单个工作单元，从而简化错误处理、提高可靠性并增强可观察性。也就是说，结构化并发保留了单线程代码的可读性、可维护性和可观察性。

结构化并发的基本 API 是`StructuredTaskScope`，它支持将任务拆分为多个并发子任务，在它们自己的线程中执行，并且子任务必须在主任务继续之前完成。

`StructuredTaskScope` 的基本用法如下：

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // 使用fork方法派生线程来执行子任务
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // 等待线程完成
        scope.join();
        // 结果的处理可能包括处理或重新抛出异常
        ... process results/exceptions ...
    } // close
```

结构化并发非常适合虚拟线程，虚拟线程是 JDK 实现的轻量级线程。许多虚拟线程共享同一个操作系统线程，从而允许非常多的虚拟线程。

## JEP 511: 模块导入声明

该特性第一次预览是由 [JEP 476](https://openjdk.org/jeps/476) （JDK 23 ）提出，随后在 [JEP 494](https://openjdk.org/jeps/494) （JDK 24）中进行了完善，JDK 25 顺利转正。

模块导入声明允许在 Java 代码中简洁地导入整个模块的所有导出包，而无需逐个声明包的导入。这一特性简化了模块化库的重用，特别是在使用多个模块时，避免了大量的包导入声明，使得开发者可以更方便地访问第三方库和 Java 基本类。

此特性对初学者和原型开发尤为有用，因为它无需开发者将自己的代码模块化，同时保留了对传统导入方式的兼容性，提升了开发效率和代码可读性。

```java
// 导入整个 java.base 模块，开发者可以直接访问 List、Map、Stream 等类，而无需每次手动导入相关包
import module java.base;

public class Example {
    public static void main(String[] args) {
        String[] fruits = { "apple", "berry", "citrus" };
        Map<String, String> fruitMap = Stream.of(fruits)
            .collect(Collectors.toMap(
                s -> s.toUpperCase().substring(0, 1),
                Function.identity()));

        System.out.println(fruitMap);
    }
}
```

## JEP 513: 灵活的构造函数体

该特性第一次预览是由 [JEP 447](https://openjdk.org/jeps/447) （JDK 22）提出，随后在 [JEP 482](https://openjdk.org/jeps/482)（JDK 23）和 [JEP 492](https://openjdk.org/jeps/492) （JDK 24）经历了预览，JDK 25 顺利转正。

Java 要求在构造函数中，`super(...)` 或 `this(...)` 调用必须作为第一条语句出现。这意味着我们无法在调用父类构造函数之前在子类构造函数中直接初始化字段。

灵活的构造函数体解决了这一问题，它允许在构造函数体内，在调用 `super(..)` 或 `this(..)` 之前编写语句，这些语句可以初始化字段，但不能引用正在构造的实例。这样可以防止在父类构造函数中调用子类方法时，子类的字段未被正确初始化，增强了类构造的可靠性。

这一特性解决了之前 Java 语法限制了构造函数代码组织的问题，让开发者能够更自由、更自然地表达构造函数的行为，例如在构造函数中直接进行参数验证、准备和共享，而无需依赖辅助方法或构造函数，提高了代码的可读性和可维护性。

```java
class Person {
    private final String name;
    private int age;

    public Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative.");
        }
        this.name = name; // 在调用父类构造函数之前初始化字段
        this.age = age;
        // ... 其他初始化代码
    }
}

class Employee extends Person {
    private final int employeeId;

    public Employee(String name, int age, int employeeId) {
        this.employeeId = employeeId; // 在调用父类构造函数之前初始化字段
        super(name, age); // 调用父类构造函数
        // ... 其他初始化代码
    }
}
```

## JEP 508: 向量 API(第十次孵化)

向量计算由对向量的一系列操作组成。向量 API 用来表达向量计算，该计算可以在运行时可靠地编译为支持的 CPU 架构上的最佳向量指令，从而实现优于等效标量计算的性能。

向量 API 的目标是为用户提供简洁易用且与平台无关的表达范围广泛的向量计算。

这是对数组元素的简单标量计算：

```java
void scalarComputation(float[] a, float[] b, float[] c) {
   for (int i = 0; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
   }
}
```

这是使用 Vector API 进行的等效向量计算：

```java
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

void vectorComputation(float[] a, float[] b, float[] c) {
    int i = 0;
    int upperBound = SPECIES.loopBound(a.length);
    for (; i < upperBound; i += SPECIES.length()) {
        // FloatVector va, vb, vc;
        var va = FloatVector.fromArray(SPECIES, a, i);
        var vb = FloatVector.fromArray(SPECIES, b, i);
        var vc = va.mul(va)
                   .add(vb.mul(vb))
                   .neg();
        vc.intoArray(c, i);
    }
    for (; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
    }
}
```

尽管仍在孵化中，但其第十次迭代足以证明其重要性。它使得 Java 在科学计算、机器学习、大数据处理等性能敏感领域，能够编写出接近甚至媲美 C++等本地语言性能的代码。这是 Java 在高性能计算领域保持竞争力的关键。
