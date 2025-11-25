---
title: CompletableFuture 详解
category: Java
tag:
  - Java并发
head:
  - - meta
    - name: keywords
      content: CompletableFuture,异步编排,并行任务,thenCompose,thenCombine,allOf,anyOf,线程池,Future
  - - meta
    - name: description
      content: 介绍 CompletableFuture 的核心概念与常用 API，涵盖并行执行、任务编排与结果聚合，助力高性能接口设计。
---

实际项目中，一个接口可能需要同时获取多种不同的数据，然后再汇总返回，这种场景还是挺常见的。举个例子：用户请求获取订单信息，可能需要同时获取用户信息、商品详情、物流信息、商品推荐等数据。

如果是串行（按顺序依次执行每个任务）执行的话，接口的响应速度会非常慢。考虑到这些任务之间有大部分都是 **无前后顺序关联** 的，可以 **并行执行** ，就比如说调用获取商品详情的时候，可以同时调用获取物流信息。通过并行执行多个任务的方式，接口的响应速度会得到大幅优化。

![](https://oss.javaguide.cn/github/javaguide/high-performance/serial-to-parallel.png)

对于存在前后调用顺序关系的任务，可以进行任务编排。

![](https://oss.javaguide.cn/github/javaguide/high-performance/serial-to-parallel2.png)

1. 获取用户信息之后，才能调用商品详情和物流信息接口。
2. 成功获取商品详情和物流信息之后，才能调用商品推荐接口。

可能会用到多线程异步任务编排的场景（这里只是举例，数据不一定是一次返回，可能会对接口进行拆分）：

1. 首页：例如技术社区的首页可能需要同时获取文章推荐列表、广告栏、文章排行榜、热门话题等信息。
2. 详情页：例如技术社区的文章详情页可能需要同时获取作者信息、文章详情、文章评论等信息。
3. 统计模块：例如技术社区的后台统计模块可能需要同时获取粉丝数汇总、文章数据（阅读量、评论量、收藏量）汇总等信息。

对于 Java 程序来说，Java 8 才被引入的 `CompletableFuture` 可以帮助我们来做多个任务的编排，功能非常强大。

这篇文章是 `CompletableFuture` 的简单入门，带大家看看 `CompletableFuture` 常用的 API。

## Future 介绍

`Future` 类是异步思想的典型运用，主要用在一些需要执行耗时任务的场景，避免程序一直原地等待耗时任务执行完成，执行效率太低。具体来说是这样的：当我们执行某一耗时的任务时，可以将这个耗时任务交给一个子线程去异步执行，同时我们可以干点其他事情，不用傻傻等待耗时任务执行完成。等我们的事情干完后，我们再通过 `Future` 类获取到耗时任务的执行结果。这样一来，程序的执行效率就明显提高了。

这其实就是多线程中经典的 **Future 模式**，你可以将其看作是一种设计模式，核心思想是异步调用，主要用在多线程领域，并非 Java 语言独有。

在 Java 中，`Future` 类只是一个泛型接口，位于 `java.util.concurrent` 包下，其中定义了 5 个方法，主要包括下面这 4 个功能：

- 取消任务；
- 判断任务是否被取消;
- 判断任务是否已经执行完成;
- 获取任务执行结果。

```java
// V 代表了Future执行的任务返回值的类型
public interface Future<V> {
    // 取消任务执行
    // 成功取消返回 true，否则返回 false
    boolean cancel(boolean mayInterruptIfRunning);
    // 判断任务是否被取消
    boolean isCancelled();
    // 判断任务是否已经执行完成
    boolean isDone();
    // 获取任务执行结果
    V get() throws InterruptedException, ExecutionException;
    // 指定时间内没有返回计算结果就抛出 TimeOutException 异常
    V get(long timeout, TimeUnit unit)

        throws InterruptedException, ExecutionException, TimeoutExceptio

}
```

简单理解就是：我有一个任务，提交给了 `Future` 来处理。任务执行期间我自己可以去做任何想做的事情。并且，在这期间我还可以取消任务以及获取任务的执行状态。一段时间之后，我就可以 `Future` 那里直接取出任务执行结果。

## CompletableFuture 介绍

`Future` 在实际使用过程中存在一些局限性，比如不支持异步任务的编排组合、获取计算结果的 `get()` 方法为阻塞调用。

Java 8 才被引入`CompletableFuture` 类可以解决`Future` 的这些缺陷。`CompletableFuture` 除了提供了更为好用和强大的 `Future` 特性之外，还提供了函数式编程、异步任务编排组合（可以将多个异步任务串联起来，组成一个完整的链式调用）等能力。

下面我们来简单看看 `CompletableFuture` 类的定义。

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
}
```

可以看到，`CompletableFuture` 同时实现了 `Future` 和 `CompletionStage` 接口。

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/completablefuture-class-diagram.jpg)

`CompletionStage` 接口描述了一个异步计算的阶段。很多计算可以分成多个阶段或步骤，此时可以通过它将所有步骤组合起来，形成异步计算的流水线。

`CompletableFuture` 除了提供了更为好用和强大的 `Future` 特性之外，还提供了函数式编程的能力。

![](https://oss.javaguide.cn/javaguide/image-20210902092441434.png)

`Future` 接口有 5 个方法：

- `boolean cancel(boolean mayInterruptIfRunning)`：尝试取消执行任务。
- `boolean isCancelled()`：判断任务是否被取消。
- `boolean isDone()`：判断任务是否已经被执行完成。
- `get()`：等待任务执行完成并获取运算结果。
- `get(long timeout, TimeUnit unit)`：多了一个超时时间。

`CompletionStage` 接口描述了一个异步计算的阶段。很多计算可以分成多个阶段或步骤，此时可以通过它将所有步骤组合起来，形成异步计算的流水线。

`CompletionStage` 接口中的方法比较多，`CompletableFuture` 的函数式能力就是这个接口赋予的。从这个接口的方法参数你就可以发现其大量使用了 Java8 引入的函数式编程。

![](https://oss.javaguide.cn/javaguide/image-20210902093026059.png)

由于方法众多，所以这里不能一一讲解，下文中我会介绍大部分常见方法的使用。

## CompletableFuture 常见操作

### 创建 CompletableFuture

常见的创建 `CompletableFuture` 对象的方法如下：

1. 通过 new 关键字。
2. 基于 `CompletableFuture` 自带的静态工厂方法：`runAsync()`、`supplyAsync()` 。

#### new 关键字

通过 new 关键字创建 `CompletableFuture` 对象这种使用方式可以看作是将 `CompletableFuture` 当做 `Future` 来使用。

我在我的开源项目 [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) 中就是这种方式创建的 `CompletableFuture` 对象。

下面咱们来看一个简单的案例。

我们通过创建了一个结果值类型为 `RpcResponse<Object>` 的 `CompletableFuture`，你可以把 `resultFuture` 看作是异步运算结果的载体。

```java
CompletableFuture<RpcResponse<Object>> resultFuture = new CompletableFuture<>();
```

Suppose that at some point in the future, we get the final result. At this time, we can call the `complete()` method to pass in the result, which means that `resultFuture` has been completed.

```java
// The complete() method can only be called once, subsequent calls will be ignored.
resultFuture.complete(rpcResponse);
```

You can check if it's done with the `isDone()` method.

```java
public boolean isDone() {
    return result != null;
}
```

Obtaining the results of asynchronous calculation is also very simple, just call the `get()` method directly. The thread calling the `get()` method will block until the `CompletableFuture` completes the operation.

```java
rpcResponse = completableFuture.get();
```

If you already know the result of the calculation, you can use the static method `completedFuture()` to create a `CompletableFuture`.

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!");
assertEquals("hello!", future.get());
```

The underlying method of `completedFuture()` calls the new method with parameters, but this method is not exposed to the outside world.

```java
public static <U> CompletableFuture<U> completedFuture(U value) {
    return new CompletableFuture<U>((value == null) ? NIL : value);
}
```

#### Static factory method

These two methods can help us encapsulate calculation logic.

```java
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier);
// Use a custom thread pool (recommended)
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor);
static CompletableFuture<Void> runAsync(Runnable runnable);
// Use a custom thread pool (recommended)
static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor);
```

The parameter accepted by the `runAsync()` method is `Runnable`, which is a functional interface and does not allow return values. You can use the `runAsync()` method when you need asynchronous operations and don't care about the return result.

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

The parameter accepted by the `supplyAsync()` method is `Supplier<U>`, which is also a functional interface. `U` is the type of the returned result value.

```java
@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
```

When you need asynchronous operations and care about the return result, you can use the `supplyAsync()` method.

```java
CompletableFuture<Void> future = CompletableFuture.runAsync(() -> System.out.println("hello!"));
future.get();// Output "hello!"
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "hello!");
assertEquals("hello!", future2.get());
```

### Processing the results of asynchronous settlement

After we obtain the results of asynchronous calculation, we can further process them. The more commonly used methods are as follows:

- `thenApply()`
- `thenAccept()`
- `thenRun()`
- `whenComplete()`

The `thenApply()` method accepts a `Function` instance and uses it to process the result.

```java
//Inherit the thread pool of the previous task
public <U> CompletableFuture<U> thenApply(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(null, fn);
}

//Use the default ForkJoinPool thread pool (not recommended)
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(defaultExecutor(), fn);
}
// Use a custom thread pool (recommended)
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn, Executor executor) {
    return uniApplyStage(screenExecutor(executor), fn);
}
```

Examples of using the `thenApply()` method are as follows:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!");
assertEquals("hello!world!", future.get());
// This call will be ignored.
future.thenApply(s -> s + "nice!");
assertEquals("hello!world!", future.get());
```

You can also make **streaming calls**:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!");
assertEquals("hello!world!nice!", future.get());
```

**If you don’t need to get the return result from the callback function, you can use `thenAccept()` or `thenRun()`. The difference between these two methods is that `thenRun()` cannot access the results of asynchronous calculations. **

The parameter of the `thenAccept()` method is `Consumer<? super T>`.

```java
public CompletableFuture<Void> thenAccept(Consumer<? super T> action) {
    return uniAcceptStage(null, action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action) {
    return uniAcceptStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action,
                                               Executor executor) {
    return uniAcceptStage(screenExecutor(executor), action);
}
```

As the name suggests, `Consumer` is a consumer interface, which can receive an input object and then "consume" it.

```java
@FunctionalInterface
public interface Consumer<T> {

    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
````thenRun()` 的方法是的参数是 `Runnable` 。

```java
public CompletableFuture<Void> thenRun(Runnable action) {
    return uniRunStage(null, action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action) {
    return uniRunStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action,
                                            Executor executor) {
    return uniRunStage(screenExecutor(executor), action);
}
```

`thenAccept()` 和 `thenRun()` 使用示例如下：

```java
CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenAccept(System.out::println);//hello!world!nice!

CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenRun(() -> System.out.println("hello!"));//hello!
```

`whenComplete()` 的方法的参数是 `BiConsumer<? super T, ? super Throwable>` 。

```java
public CompletableFuture<T> whenComplete(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(null, action);
}


public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(defaultExecutor(), action);
}
// 使用自定义线程池(推荐)
public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action, Executor executor) {
    return uniWhenCompleteStage(screenExecutor(executor), action);
}
```

相对于 `Consumer` ， `BiConsumer` 可以接收 2 个输入对象然后进行“消费”。

```java
@FunctionalInterface
public interface BiConsumer<T, U> {
    void accept(T t, U u);

    default BiConsumer<T, U> andThen(BiConsumer<? super T, ? super U> after) {
        Objects.requireNonNull(after);

        return (l, r) -> {
            accept(l, r);
            after.accept(l, r);
        };
    }
}
```

`whenComplete()` 使用示例如下：

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "hello!")
        .whenComplete((res, ex) -> {
            // res 代表返回的结果
            // ex 的类型为 Throwable ，代表抛出的异常
            System.out.println(res);
            // 这里没有抛出异常所有为 null
            assertNull(ex);
        });
assertEquals("hello!", future.get());
```

### 异常处理

你可以通过 `handle()` 方法来处理任务执行过程中可能出现的抛出异常的情况。

```java
public <U> CompletableFuture<U> handle(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(null, fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn, Executor executor) {
    return uniHandleStage(screenExecutor(executor), fn);
}
```

示例代码如下：

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).handle((res, ex) -> {
    // res 代表返回的结果
    // ex 的类型为 Throwable ，代表抛出的异常
    return res != null ? res : "world!";
});
assertEquals("world!", future.get());
```

你还可以通过 `exceptionally()` 方法来处理异常情况。

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).exceptionally(ex -> {
    System.out.println(ex.toString());// CompletionException
    return "world!";
});
assertEquals("world!", future.get());
```

如果你想让 `CompletableFuture` 的结果就是异常的话，可以使用 `completeExceptionally()` 方法为其赋值。

```java
CompletableFuture<String> completableFuture = new CompletableFuture<>();
// ...
completableFuture.completeExceptionally(
  new RuntimeException("Calculation failed!"));
// ...
completableFuture.get(); // ExecutionException
```

### 组合 CompletableFuture

你可以使用 `thenCompose()` 按顺序链接两个 `CompletableFuture` 对象，实现异步的任务链。它的作用是将前一个任务的返回结果作为下一个任务的输入参数，从而形成一个依赖关系。

```java
public <U> CompletableFuture<U> thenCompose(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(null, fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn,
    Executor executor) {
    return uniComposeStage(screenExecutor(executor), fn);
}```

Examples of usage of the `thenCompose()` method are as follows:

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "world!"));
assertEquals("hello!world!", future.get());
```

In actual development, this method is still very useful. For example, task1 and task2 are both executed asynchronously, but task1 must be executed before task2 can be started (task2 depends on the execution result of task1).

Similar to the `thenCompose()` method, there is the `thenCombine()` method, which can also combine two `CompletableFuture` objects.

```java
CompletableFuture<String> completableFuture
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCombine(CompletableFuture.supplyAsync(
                () -> "world!"), (s1, s2) -> s1 + s2)
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "nice!"));
assertEquals("hello!world!nice!", completableFuture.get());
```

**What is the difference between `thenCompose()` and `thenCombine()`? **

- `thenCompose()` can link two `CompletableFuture` objects and use the return result of the previous task as the parameter of the next task. There is a sequence between them.
- `thenCombine()` will combine the results of the two tasks after both tasks are executed. The two tasks are executed in parallel, and there is no sequential dependency between them.

In addition to `thenCompose()` and `thenCombine()`, there are some other methods of combining `CompletableFuture` to achieve different effects and meet different business needs.

For example, if we want to execute task3 after any one of task1 and task2 is executed, we can use `acceptEither()`.

```java
public CompletableFuture<Void> acceptEither(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(null, other, action);
}

public CompletableFuture<Void> acceptEitherAsync(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(asyncPool, other, action);
}
```

Just give a simple example:

```java
CompletableFuture<String> task = CompletableFuture.supplyAsync(() -> {
    System.out.println("Task 1 starts execution, current time: " + System.currentTimeMillis());
    try {
        Thread.sleep(500);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("Task 1 has been executed, current time: " + System.currentTimeMillis());
    return "task1";
});

CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
    System.out.println("Task 2 starts execution, current time: " + System.currentTimeMillis());
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("Task 2 has been executed, current time: " + System.currentTimeMillis());
    return "task2";
});

task.acceptEitherAsync(task2, (res) -> {
    System.out.println("Task 3 starts execution, current time: " + System.currentTimeMillis());
    System.out.println("The result of the previous task is: " + res);
});

//Add some delay time to ensure that the asynchronous task has enough time to complete
try {
    Thread.sleep(2000);
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Output:

```plain
Task 1 starts execution, current time: 1695088058520
Task 2 starts execution, current time: 1695088058521
Task 1 has been executed. Current time: 1695088059023
Task 3 starts execution, current time: 1695088059023
The result of the previous task is: task1
Task 2 has been executed. Current time: 1695088059523
```

The task combination operation `acceptEitherAsync()` will trigger the execution of task 3 when either asynchronous task 1 or asynchronous task 2 is completed, but it should be noted that this triggering time is uncertain. If both task 1 and task 2 have not been completed, then task 3 cannot be executed.

### Run multiple CompletableFutures in parallel

You can run multiple `CompletableFuture` in parallel through the `allOf()` static method of `CompletableFuture`.

In actual projects, we often need to run multiple unrelated tasks in parallel. There is no dependency between these tasks and they can run independently of each other.

For example, let's say we have to read and process 6 files. These 6 tasks are all tasks that have no execution order dependence, but we need to statistically organize the results of processing these files when returning them to the user. In this case, we can use multiple `CompletableFuture` to run in parallel to handle it.

The sample code is as follows:

```java
CompletableFuture<Void> task1 =
  CompletableFuture.supplyAsync(()->{
    //Customized business operations
  });
...
CompletableFuture<Void> task6 =
  CompletableFuture.supplyAsync(()->{
    //Customized business operations
  });
...
 CompletableFuture<Void> headerFuture=CompletableFuture.allOf(task1,....,task6);

  try {
    headerFuture.join();
  } catch (Exception ex) {
    ...
  }
System.out.println("all done. ");
```

The `anyOf()` method is often compared to the `allOf()` method.

**The `allOf()` method will wait until all `CompletableFuture` are completed before returning**

```java
Random rand = new Random();
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future1 done...");
    }
    return "abc";
});
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future2 done...");
    }
    return "efg";
});```

Calling `join()` allows the program to wait for `future1` and `future2` to finish running before continuing.

```java
CompletableFuture<Void> completableFuture = CompletableFuture.allOf(future1, future2);
completableFuture.join();
assertTrue(completableFuture.isDone());
System.out.println("all futures done...");
```

Output:

```plain
future1 done...
future2 done...
all futures done...
```

The **`anyOf()` method will not wait for all `CompletableFuture` to be executed before returning, as long as one execution is completed! **

```java
CompletableFuture<Object> f = CompletableFuture.anyOf(future1, future2);
System.out.println(f.get());
```

The output may be:

```plain
future2 done...
efg
```

It could also be:

```plain
future1 done...
abc
```

## CompletableFuture usage suggestions

### Use custom thread pool

In our code examples above, for convenience, we did not choose to customize the thread pool. In actual projects, this is not advisable.

`CompletableFuture` uses the globally shared `ForkJoinPool.commonPool()` as the executor by default, and all asynchronous tasks that do not specify an executor will use this thread pool. This means that if an application, multiple libraries or frameworks (such as Spring, third-party libraries) all depend on `CompletableFuture`, they will all share the same thread pool by default.

Although `ForkJoinPool` is very efficient, when a large number of tasks are submitted at the same time, it may cause resource contention and thread starvation, thereby affecting system performance.

To avoid these problems, it is recommended to provide a custom thread pool for `CompletableFuture`, which brings the following advantages:

- **Isolation**: Allocate independent thread pools for different tasks to avoid global thread pool resource contention.
- **Resource Control**: Adjust the thread pool size and queue type according to task characteristics to optimize performance.
- **Exception Handling**: Better handle exceptions in threads by customizing `ThreadFactory`.

```java
private ThreadPoolExecutor executor = new ThreadPoolExecutor(10, 10,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>());

CompletableFuture.runAsync(() -> {
     //...
}, executor);
```

### Try to avoid using get()

The `get()` method of `CompletableFuture` is blocking, so try to avoid using it. If you must use it, you need to add a timeout, otherwise it may cause the main thread to wait forever and be unable to perform other tasks.

```java
    CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "Hello, world!";
    });

    // Get the return value of the asynchronous task and set the timeout to 5 seconds
    try {
        String result = future.get(5, TimeUnit.SECONDS);
        System.out.println(result);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
        // Handle exceptions
        e.printStackTrace();
    }
}
```

The above code throws a `TimeoutException` exception when calling `get()`. In this way, we can perform corresponding operations in exception handling, such as canceling tasks, retrying tasks, recording logs, etc.

### Correct exception handling

When using `CompletableFuture`, exceptions must be handled in the correct way to avoid exceptions being lost or uncontrollable problems.

Here are some suggestions:

- Use the `whenComplete` method to trigger the callback function when the task is completed and handle the exception correctly instead of letting the exception be swallowed or lost.
- Use the `exceptionally` method to handle exceptions and rethrow them so that they propagate to subsequent stages rather than having them ignored or terminated.
- Use the `handle` method to handle normal return results and exceptions, and return a new result instead of letting exceptions affect normal business logic.
- Use the `CompletableFuture.allOf` method to combine multiple `CompletableFuture` and handle exceptions for all tasks uniformly, instead of making exception handling too lengthy or repetitive.
-…

### Reasonably combine multiple asynchronous tasks

Correctly use `thenCompose()`, `thenCombine()`, `acceptEither()`, `allOf()`, `anyOf()` and other methods to combine multiple asynchronous tasks to meet actual business needs and improve program execution efficiency.

In actual use, we can also make use of or refer to ready-made asynchronous task orchestration frameworks, such as JD.com's [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool).

![asyncTool README document](https://oss.javaguide.cn/github/javaguide/java/concurrent/asyncTool-readme.png)

## Postscript

This article only briefly introduces the core concepts of `CompletableFuture` and some of the more commonly used APIs. If you want to study in depth, you can also find more books and blogs to read. For example, the following articles are quite good:

- [CompletableFuture Principles and Practices - Asynchronousization of Takeaway Merchant APIs - Meituan Technical Team](https://tech.meituan.com/2022/05/12/principles-and-practices-of-completablefuture.html): This article details the use of `CompletableFuture` in actual projects. By referring to this article, you can optimize similar scenarios in the project, which is also a small highlight. This performance optimization method is relatively simple and the effect is pretty good!
- [Read RocketMQ source code and learn the three major artifacts of concurrent programming - Yong Ge's java practical sharing] (https://mp.weixin.qq.com/s/32Ak-WFLynQfpn0Cg0N-0A): This article introduces RocketMQ's application of `CompletableFuture`. Specifically, starting from RocketMQ 4.7, RocketMQ introduced `CompletableFuture` to implement asynchronous message processing.

In addition, it is recommended that G friends take a look at JD.com’s [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool) concurrency framework, which uses `CompletableFuture` extensively.

<!-- @include: @article-footer.snippet.md -->