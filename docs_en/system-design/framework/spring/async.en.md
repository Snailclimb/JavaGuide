---
title: Async 注解原理分析
category: 框架
tag:
  - Spring
---

`@Async` 注解由 Spring 框架提供，被该注解标注的类或方法会在 **异步线程** 中执行。这意味着当方法被调用时，调用者将不会等待该方法执行完成，而是可以继续执行后续的代码。

`@Async` 注解的使用非常简单，需要两个步骤：

1. 在启动类上添加注解 `@EnableAsync` ，开启异步任务。
2. 在需要异步执行的方法或类上添加注解 `@Async` 。

```java
@SpringBootApplication
// 开启异步任务
@EnableAsync
public class YourApplication {

    public static void main(String[] args) {
        SpringApplication.run(YourApplication.class, args);
    }
}

// 异步服务类
@Service
public class MyService {

    // 推荐使用自定义线程池，这里只是演示基本用法
    @Async
    public CompletableFuture<String> doSomethingAsync() {

        // 这里会有一些业务耗时操作
        // ...
        // 使用 CompletableFuture 可以更方便地处理异步任务的结果，避免阻塞主线程
        return CompletableFuture.completedFuture("Async Task Completed");
    }

}
```

接下来，我们一起来看看 `@Async` 的底层原理。

## @Async 原理分析

`@Async` 可以异步执行任务，本质上是使用 **动态代理** 来实现的。通过 Spring 中的后置处理器 `BeanPostProcessor` 为使用 `@Async` 注解的类创建动态代理，之后 `@Async` 注解方法的调用会被动态代理拦截，在拦截器中将方法的执行封装为异步任务提交给线程池处理。

接下来，我们来详细分析一下。

### 开启异步

使用 `@Async` 之前，需要在启动类上添加 `@EnableAsync` 来开启异步，`@EnableAsync` 注解如下：

```JAVA
// 省略其他注解 ...
@Import(AsyncConfigurationSelector.class)
public @interface EnableAsync { /* ... */ }
```

在 `@EnableAsync` 注解上通过 `@Import` 注解引入了 `AsyncConfigurationSelector` ，因此 Spring 会去加载通过 `@Import` 注解引入的类。

`AsyncConfigurationSelector` 类实现了 `ImportSelector` 接口，因此在该类中会重写 `selectImports()` 方法来自定义加载 Bean 的逻辑，如下：

```JAVA
public class AsyncConfigurationSelector extends AdviceModeImportSelector<EnableAsync> {
	@Override
	@Nullable
	public String[] selectImports(AdviceMode adviceMode) {
		switch (adviceMode) {
   // 基于 JDK 代理织入的通知
			case PROXY:
				return new String[] {ProxyAsyncConfiguration.class.getName()};
   // 基于 AspectJ 织入的通知
			case ASPECTJ:
				return new String[] {ASYNC_EXECUTION_ASPECT_CONFIGURATION_CLASS_NAME};
			default:
				return null;
		}
	}
}
```

在 `selectImports()` 方法中，会根据通知的不同类型来选择加载不同的类，其中 `adviceMode` 默认值为 `PROXY` 。

这里以基于 JDK 代理的通知为例，此时会加载 `ProxyAsyncConfiguration` 类，如下：

```JAVA
@Configuration
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyAsyncConfiguration extends AbstractAsyncConfiguration {
	@Bean(name = TaskManagementConfigUtils.ASYNC_ANNOTATION_PROCESSOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public AsyncAnnotationBeanPostProcessor asyncAdvisor() {
		 // ...
  // 加载后置处理器
		AsyncAnnotationBeanPostProcessor bpp = new AsyncAnnotationBeanPostProcessor();

  // ...
		return bpp;
	}
}
```

### 后置处理器

在 `ProxyAsyncConfiguration` 类中，会通过 `@Bean` 注解加载一个后置处理器 `AsyncAnnotationBeanPostProcessor` ，这个后置处理器是使 `@Async` 注解起作用的关键。

如果某一个类或者方法上使用了 `@Async` 注解，`AsyncAnnotationBeanPostProcessor` 处理器就会为该类创建一个动态代理。

该类的方法在执行时，会被代理对象的拦截器所拦截，其中被 `@Async` 注解标记的方法会异步执行。

`AsyncAnnotationBeanPostProcessor` 代码如下：

```JAVA
public class AsyncAnnotationBeanPostProcessor extends AbstractBeanFactoryAwareAdvisingPostProcessor {
	@Override
	public void setBeanFactory(BeanFactory beanFactory) {
		super.setBeanFactory(beanFactory);
  // 创建 AsyncAnnotationAdvisor，它是一个 Advisor
  // 用于拦截带有 @Async 注解的方法并将这些方法异步执行。
		AsyncAnnotationAdvisor advisor = new AsyncAnnotationAdvisor(this.executor, this.exceptionHandler);
  // 如果设置了自定义的 asyncAnnotationType，则将其设置到 advisor 中。
  // asyncAnnotationType 用于指定自定义的异步注解，例如 @MyAsync。
		if (this.asyncAnnotationType != null) {
			advisor.setAsyncAnnotationType(this.asyncAnnotationType);
		}
		advisor.setBeanFactory(beanFactory);
		this.advisor = advisor;
	}
}
```

`AsyncAnnotationBeanPostProcessor` 的父类实现了 `BeanFactoryAware` 接口，因此在该类中重写了 `setBeanFactory()` 方法作为扩展点，来加载 `AsyncAnnotationAdvisor` 。

#### 创建 Advisor

`Advisor` 是 `Spring AOP` 对 `Advice` 和 `Pointcut` 的抽象。`Advice` 为执行的通知逻辑，`Pointcut` 为通知执行的切入点。

在后置处理器 `AsyncAnnotationBeanPostProcessor` 中会去创建 `AsyncAnnotationAdvisor` ， 在它的构造方法中，会构建对应的 `Advice` 和 `Pointcut` ，如下：

```JAVA
public class AsyncAnnotationAdvisor extends AbstractPointcutAdvisor implements BeanFactoryAware {

    private Advice advice; // 异步执行的 Advice
    private Pointcut pointcut; // 匹配 @Async 注解方法的切点

    // 构造函数
    public AsyncAnnotationAdvisor(/* 参数省略 */) {
        // 1. 创建 Advice，负责异步执行逻辑
        this.advice = buildAdvice(executor, exceptionHandler);
        // 2. 创建 Pointcut，选择要被增强的目标方法
        this.pointcut = buildPointcut(asyncAnnotationTypes);
    }

    // 创建 Advice
    protected Advice buildAdvice(/* 参数省略 */) {
        // 创建处理异步执行的拦截器
        AnnotationAsyncExecutionInterceptor interceptor = new AnnotationAsyncExecutionInterceptor(null);
        // 使用执行器和异常处理器配置拦截器
        interceptor.configure(executor, exceptionHandler);
        return interceptor;
    }

    // 创建 Pointcut
    protected Pointcut buildPointcut(Set<Class<? extends Annotation>> asyncAnnotationTypes) {
        ComposablePointcut result = null;
        for (Class<? extends Annotation> asyncAnnotationType : asyncAnnotationTypes) {
            // 1. 类级别切点：如果类上有注解则匹配
            Pointcut cpc = new AnnotationMatchingPointcut(asyncAnnotationType, true);
            // 2. 方法级别切点：如果方法上有注解则匹配
            Pointcut mpc = new AnnotationMatchingPointcut(null, asyncAnnotationType, true);

            if (result == null) {
                result = new ComposablePointcut(cpc);
            } else {
                // 使用 union 合并之前的切点
                result.union(cpc);
            }
            // 将方法级别切点添加到组合切点
            result = result.union(mpc);
        }
        // 返回组合切点，如果没有提供注解类型则返回 Pointcut.TRUE
        return (result != null ? result : Pointcut.TRUE);
    }
}
```

The core of `AsyncAnnotationAdvisor` is to build `Advice` and `Pointcut`:

- Build `Advice`: `AnnotationAsyncExecutionInterceptor` interceptor will be created, and the notification logic will be executed in the `invoke()` method of the interceptor.
- Build `Pointcut`: composed of `ClassFilter` and `MethodMatcher`, used to match the logic of which methods need to perform advice (`Advice`).

#### Post-processing logic

The `postProcessAfterInitialization()` method implemented in the `AsyncAnnotationBeanPostProcessor` post-processor is in its parent class `AbstractAdvisingBeanPostProcessor`. After the `Bean` is initialized, it will enter the `postProcessAfterInitialization()` method for post-processing.

In the post-processing method, it will be judged whether the `Bean` meets the conditions of the `Advisor` notification in the post-processor, and if so, a proxy object will be created. As follows:

```JAVA
//AbstractAdvisingBeanPostProcessor
public Object postProcessAfterInitialization(Object bean, String beanName) {
	if (this.advisor == null || bean instanceof AopInfrastructureBean) {
		return bean;
	}
	if (bean instanceof Advised) {
		Advised advised = (Advised) bean;
		if (!advised.isFrozen() && isEligible(AopUtils.getTargetClass(bean))) {
			if (this.beforeExistingAdvisors) {
				advised.addAdvisor(0, this.advisor);
			}
			else {
				advised.addAdvisor(this.advisor);
			}
			return bean;
		}
	}
 // Determine whether the given Bean meets the conditions of the Advisor notification in the post-processor. If so, create a proxy object.
	if (isEligible(bean, beanName)) {
		ProxyFactory proxyFactory = prepareProxyFactory(bean, beanName);
		if (!proxyFactory.isProxyTargetClass()) {
			evaluateProxyInterfaces(bean.getClass(), proxyFactory);
		}
  //Add Advisor.
		proxyFactory.addAdvisor(this.advisor);
		customizeProxyFactory(proxyFactory);
  // Return the proxy object.
		return proxyFactory.getProxy(getProxyClassLoader());
	}
	return bean;
}
```

### @Async annotation method interception

The execution of the `@Async` annotated method will be intercepted in `AnnotationAsyncExecutionInterceptor`, and the logic of the interceptor will be executed in the `invoke()` method. At this time, the method marked with the `@Async` annotation will be encapsulated into an asynchronous task and handed over to the executor for execution.

The `invoke()` method is defined in the parent class `AsyncExecutionInterceptor` of `AnnotationAsyncExecutionInterceptor`, as follows:

```JAVA
public class AsyncExecutionInterceptor extends AsyncExecutionAspectSupport implements MethodInterceptor, Ordered {
	@Override
	@Nullable
	public Object invoke(final MethodInvocation invocation) throws Throwable {
		Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
		Method specificMethod = ClassUtils.getMostSpecificMethod(invocation.getMethod(), targetClass);
		final Method userDeclaredMethod = BridgeMethodResolver.findBridgedMethod(specificMethod);

  // 1. Determine the asynchronous task executor
		AsyncTaskExecutor executor = determineAsyncExecutor(userDeclaredMethod);

  // 2. Encapsulate the method to be executed as a Callable asynchronous task
		Callable<Object> task = () -> {
			try {
    // 2.1. Execution method
				Object result = invocation.proceed();
    // 2.2. If the method return value is Future type, block and wait for the result.
				if (result instanceof Future) {
					return ((Future<?>) result).get();
				}
			}
			catch (ExecutionException ex) {
				handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments());
			}
			catch (Throwable ex) {
				handleError(ex, userDeclaredMethod, invocation.getArguments());
			}
			return null;
		};
		// 3. Submit task
		return doSubmit(task, executor, invocation.getMethod().getReturnType());
	}
}
```

In the `invoke()` method, there are three main steps:

1. Determine the executor that executes the asynchronous task.
2. Encapsulate the method marked with the `@Async` annotation into a `Callable` asynchronous task.
3. Submit the task to the executor for execution.

#### 1. Get the asynchronous task executor

In the `determineAsyncExecutor()` method, the executor of the asynchronous task (that is, the **thread pool** that executes the asynchronous task) is obtained. The code is as follows:

```JAVA
// Determine the executor of the asynchronous task
protected AsyncTaskExecutor determineAsyncExecutor(Method method) {
 // 1. Get it from the cache first.
	AsyncTaskExecutor executor = this.executors.get(method);
	if (executor == null) {
		Executor targetExecutor;
  // 2. Get the qualifier of the executor.
		String qualifier = getExecutorQualifier(method);
		if (StringUtils.hasLength(qualifier)) {
   // 3. Get the corresponding executor according to the qualifier.
			targetExecutor = findQualifiedExecutor(this.beanFactory, qualifier);
		}
		else {
   // 4. If there is no qualifier, the default executor is used. That is, the default thread pool provided by Spring: SimpleAsyncTaskExecutor.
			targetExecutor = this.defaultExecutor.get();
		}
		if (targetExecutor == null) {
			return null;
		}
  // 5. Package the executor as TaskExecutorAdapter adapter.
  // TaskExecutorAdapter is Spring's layer of abstraction for the JDK thread pool, or it inherits from the JDK thread pool Executor. You don’t need to worry too much here, just know that it is a thread pool.
		executor = (targetExecutor instanceof AsyncListenableTaskExecutor ?
				(AsyncListenableTaskExecutor) targetExecutor : new TaskExecutorAdapter(targetExecutor));
		this.executors.put(method, executor);
	}
	return executor;
}```

The executor (thread pool) of the asynchronous task is determined in the `determineAsyncExecutor()` method. The executor's qualifier is obtained mainly through the `value` value of the `@Async` annotation. Based on the qualifier, it is enough to find the corresponding executor in `BeanFactory`.

If the thread pool is not specified in the `@Async` annotation, the default thread pool will be obtained through `this.defaultExecutor.get()`, where `defaultExecutor` is assigned in the following method:

```JAVA
// AsyncExecutionInterceptor
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
 // 1. Try to get the thread pool from beanFactory.
	Executor defaultExecutor = super.getDefaultExecutor(beanFactory);
 // 2. If there is no beanFactory, create a SimpleAsyncTaskExecutor thread pool.
	return (defaultExecutor != null ? defaultExecutor : new SimpleAsyncTaskExecutor());
}
```

Among them, `super.getDefaultExecutor()` will try to obtain the `Executor` type thread pool in `beanFactory`. The code is as follows:

```JAVA
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
	if (beanFactory != null) {
		try {
   // 1. Obtain the thread pool of TaskExecutor type from beanFactory.
			return beanFactory.getBean(TaskExecutor.class);
		}
		catch (NoUniqueBeanDefinitionException ex) {
			try {
				// 2. If there are multiple, try to get the Executor thread pool of the execution name from the beanFactory.
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				if (logger.isInfoEnabled()) {
					// ...
				}
			}
		}
		catch (NoSuchBeanDefinitionException ex) {
			try {
    // 3. If not, try to get the Executor thread pool of the execution name from the beanFactory.
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				// ...
			}
		}
	}
	return null;
}
```

In `getDefaultExecutor()`, if obtaining the thread pool from `beanFactory` fails, a `SimpleAsyncTaskExecutor` thread pool will be created.

This thread pool will create a new thread to execute the task every time it executes an asynchronous task, and will not reuse the thread, resulting in a high overhead for asynchronous task execution. Once the amount of concurrency increases sharply at a certain moment in a method marked with the `@Async` annotation, the application will create a large number of threads, which will affect the quality of service and even cause service unavailability.

If 10,000 tasks are submitted to the `SimpleAsyncTaskExecutor` thread pool at the same time, then the thread pool will create 10,000 threads, and its `execute()` method is as follows:

```JAVA
// SimpleAsyncTaskExecutor: execute() will call doExecute() internally
protected void doExecute(Runnable task) {
    //Create new thread
    Thread thread = (this.threadFactory != null ? this.threadFactory.newThread(task) : createThread(task));
    thread.start();
}
```

**Recommendation: When using `@Async`, you need to specify the thread pool yourself to avoid the risks caused by Spring's default thread pool. **

The `value` in the `@Async` annotation specifies the qualifier of the thread pool, and **customized thread pool** can be obtained based on the qualifier. The code to get the qualifier is as follows:

```JAVA
// AnnotationAsyncExecutionInterceptor
protected String getExecutorQualifier(Method method) {
	// 1. Get the Async annotation from the method.
	Async async = AnnotatedElementUtils.findMergedAnnotation(method, Async.class);
 // 2. If the @Async annotation is not found on the method, try to obtain the @Async annotation from the class where the method is located.
	if (async == null) {
		async = AnnotatedElementUtils.findMergedAnnotation(method.getDeclaringClass(), Async.class);
	}
 // 3. If the @Async annotation is found, get the value of the annotation and return it as the qualifier of the thread pool.
 // If the "value" attribute value is an empty string, the default thread pool is used.
 // If the @Async annotation is not found, null is returned and the default thread pool is also used.
	return (async != null ? async.value() : null);
}
```

#### 2. Encapsulate the method as an asynchronous task

After the `invoke()` method obtains the executor, the method will be encapsulated as an asynchronous task. The code is as follows:

```JAVA
// Encapsulate the method to be executed as a Callable asynchronous task
Callable<Object> task = () -> {
    try {
        // 2.1. Execute the intercepted method (the proceed() method is the core method in AOP and is used to execute the target method)
        Object result = invocation.proceed();

        // 2.2. If the return value of the intercepted method is of Future type, you need to block and wait for the result.
        // And return the result of the Future as the result of the asynchronous task. This is to handle nested calls to asynchronous methods.
        // For example, if an asynchronous method calls another asynchronous method internally, you need to wait for the execution of the internal asynchronous method to complete.
        // Only then can the final result be returned.
        if (result instanceof Future) {
            return ((Future<?>) result).get(); // Block waiting for the result of Future
        }
    }
    catch (ExecutionException ex) {
        // 2.3. Handle ExecutionException. ExecutionException is the exception thrown by the Future.get() method,
        handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments()); // Handle the original exception
    }
    catch (Throwable ex) {
        // 2.4. Handle other types of exceptions. Call the handleError() method with exceptions, intercepted methods and method parameters as parameters for processing.
        handleError(ex, userDeclaredMethod, invocation.getArguments());
    }
    // 2.5. If the method return value is not of Future type, or an exception occurs, null will be returned.
    return null;
};
```

Compared to `Runnable`, `Callable` can return results and throw exceptions.

Encapsulate the execution of `invocation.proceed()` (the execution of the original method) into a `Callable` asynchronous task. This will only return if the `result` (method return value) type is `Future`, if it is other types, it will return `null` directly.

Therefore, if a method annotated with the `@Async` annotation uses a return value other than the `Future` type, the execution result of the method cannot be obtained.

#### 3. Submit asynchronous tasksAfter encapsulating the method to be executed as a Callable task in `AsyncExecutionInterceptor #invoke()`, the task will be handed over to the executor for execution. Submit the relevant code as follows:

```JAVA
protected Object doSubmit(Callable<Object> task, AsyncTaskExecutor executor, Class<?> returnType) {
    // According to the return value type of the method, select different asynchronous execution methods and return the results.
    // 1. If the method return value is CompletableFuture type
    if (CompletableFuture.class.isAssignableFrom(returnType)) {
        // Use the CompletableFuture.supplyAsync() method to perform tasks asynchronously.
        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            }
            catch (Throwable ex) {
                throw new CompletionException(ex); // Wrap the exception as CompletionException to be thrown when future.get()
            }
        }, executor);
    }
    // 2. If the method return value is ListenableFuture type
    else if (ListenableFuture.class.isAssignableFrom(returnType)) {
        // Cast AsyncTaskExecutor to AsyncListenableTaskExecutor,
        // And call the submitListenable() method to submit the task.
        // AsyncListenableTaskExecutor is a dedicated asynchronous executor of ListenableFuture.
        // It can return a ListenableFuture object, allowing callback functions to be added to listen for task completion.
        return ((AsyncListenableTaskExecutor) executor).submitListenable(task);
    }
    // 3. If the method return value is Future type
    else if (Future.class.isAssignableFrom(returnType)) {
        // Directly call the submit() method of AsyncTaskExecutor to submit the task and return a Future object.
        return executor.submit(task);
    }
    // 4. If the method return value is void or other types
    else {
        // Directly call the submit() method of AsyncTaskExecutor to submit the task.
        // Since the method return value is void, there is no need to return any result, just return null.
        executor.submit(task);
        return null;
    }
}
```

In the `doSubmit()` method, different task submission methods will be selected based on the return value of the `@Async` annotation annotation method, and the final task will be executed by the executor (thread pool).

### Summary

![Summary of Async principles](./images/async/async.png)

The core of understanding the principle of `@Async` lies in understanding the `@EnableAsync` annotation, which enables the function of asynchronous tasks.

The main process is as shown in the figure above. The proxy object will be created through the post-processor. Then the execution of the `@Async` method in the proxy object will go to the interceptor inside `Advice`. The method will then be encapsulated as an asynchronous task and submitted to the thread pool for processing.

## @Async usage suggestions

### Custom thread pool

If the thread pool is not explicitly configured, the bottom layer of `@Async` will first try to obtain the thread pool in `BeanFactory`. If it cannot be obtained, a `SimpleAsyncTaskExecutor` implementation will be created. `SimpleAsyncTaskExecutor` is not a real thread pool in nature, because it starts a new thread for each request without reusing existing threads, which will bring some potential problems, such as excessive resource consumption.

For specific thread pool acquisition, please refer to this article: [A brief analysis of the underlying asynchronous thread pool principle of Async annotations in Spring | Dewu Technology] (https://mp.weixin.qq.com/s/FySv5L0bCdrlb5MoSfQtAA).

Be sure to configure a thread pool explicitly, `ThreadPoolTaskExecutor` is recommended. Moreover, you can also specify different thread pools for different asynchronous methods based on the nature and requirements of the task.

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "executor1")
    public Executor executor1() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("AsyncExecutor1-");
        executor.initialize();
        return executor;
    }

    @Bean(name = "executor2")
    public Executor executor2() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AsyncExecutor2-");
        executor.initialize();
        return executor;
    }
}
```

The bean name of the thread pool is specified in the `@Async` annotation:

```java
@Service
public class AsyncService {

    @Async("executor1")
    public void performTask1() {
        //Logic of task 1
        System.out.println("Executing Task1 with Executor1");
    }

    @Async("executor2")
    public void performTask2() {
        //Logic of task 2
        System.out.println("Executing Task2 with Executor2");
    }
}
```

### Avoid @Async annotation invalidation

The `@Async` annotation will be invalid in the following scenarios, please note:

**1. Call asynchronous methods in the same class**

If you call a @Async annotated method inside the same class, the method will not execute asynchronously.

```java
@Service
public class MyService {

    public void myMethod() {
        // Called directly through this reference, bypassing Spring's proxy mechanism and asynchronous execution will fail.
        asyncMethod();
    }

    @Async
    public void asyncMethod() {
        // Asynchronous execution logic
    }
}
```

This is because Spring's asynchronous mechanism is implemented through **proxy**, and method calls within the same class will bypass Spring's proxy mechanism, that is, bypassing the proxy object and calling directly through this reference. Since there is no proxy, all proxy-related processing (ie, task submission to the thread pool for asynchronous execution) will not occur.

To avoid this problem, it is recommended to move the asynchronous method to another Spring Bean.

```java
@Service
public class AsyncService {
    @Async
    public void asyncMethod() {
        // Asynchronous execution logic
    }
}

@Service
public class MyService {
    @Autowired
    private AsyncService asyncService;

    public void myMethod() {
        asyncService.asyncMethod();
    }
}```

**2. Use the static keyword to modify asynchronous methods**

If a method annotated with `@Async` is modified with the `static` keyword, the method will not be executed asynchronously.

This is because Spring's asynchronous mechanism is implemented through a proxy. Since static methods do not belong to instances but to classes and do not participate in inheritance, Spring's proxy mechanism (whether based on JDK or CGLIB) cannot intercept static methods to provide enhanced features such as asynchronous execution.

Due to space issues, there is no further detailed introduction here. Friends who do not understand the proxy mechanism can read the article [Java Proxy Mode Detailed Explanation] (https://javaguide.cn/java/basis/proxy.html) written by me.

If you need to execute the logic of a static method asynchronously, you can consider designing a non-static wrapper method. This wrapper method is annotated with `@Async` and calls the static method inside it.

```java
@Service
public class AsyncService {

    @Async
    public void asyncWrapper() {
        // Call static method
        SClass.staticMethod();
    }
}

public class SClass {
    public static void staticMethod() {
        // perform some operations
    }
}
```

**3. Forgot to enable asynchronous support**

Spring Boot does not enable asynchronous support by default. Make sure to add the `@EnableAsync` annotation on the main configuration class `Application` to enable asynchronous functionality.

```java
@SpringBootApplication
@EnableAsync
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**4. The class where the `@Async` annotated method is located must be Spring Bean**

The method annotated with `@Async` must be located in a bean managed by Spring. Only in this way can Spring apply a proxy when creating the bean. The proxy can intercept method calls and implement asynchronous execution logic. If the method is not in a Spring-managed bean, Spring cannot create the necessary proxy and the `@Async` annotation will have no effect.

### Return value type

It is recommended to define the return value type of the `@Async` annotated method as `void` and `Future`.

- If you do not need to obtain the result returned by the asynchronous method, define the return value type as `void`.
- If you need to obtain the result returned by an asynchronous method, define the return value type as `Future` (such as `CompletableFuture`, `ListenableFuture`).

If the return value of the `@Async` annotated method is defined as other types (such as `Object`, `String`, etc.), the method return value cannot be obtained.

This design conforms to the basic principle of asynchronous programming, that is, the caller should not expect a result immediately, but should be able to obtain the result at some point in the future. If the return type is `Future`, the caller can use the returned `Future` object to query the status of the task, cancel the task, or obtain the results when the task completes.

### Handle exceptions in asynchronous methods

Exceptions thrown in asynchronous methods are not caught by the caller by default. In order to manage these exceptions, it is recommended to use the exception handling function of `CompletableFuture`, or configure a global `AsyncUncaughtExceptionHandler` to handle exceptions that are not properly caught.

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer{

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

}

// Custom exception handler
class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        // Logging or other processing logic
    }
}
```

### Transaction management is not considered

When a method annotated with `@Async` requires transaction support, it must be used independently on the asynchronous method.

```java
@Service
public class AsyncTransactionalService {

    @Async
    // Propagation.REQUIRES_NEW means that Spring starts a new transaction that is unrelated to the current transaction when executing an asynchronous method.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void asyncTransactionalMethod() {
        //The operations here will be executed in a new transaction
        //Perform some database operations
    }
}
```

### The asynchronous method execution order is not specified

`@Async` annotated method execution is non-blocking and they may complete in any order. If you need to process the results in a specific order, you can set the return value of the method to `Future` or `CompletableFuture` and implement one method by returning a value object before executing another method after the other method completes.

```java
@Async
public CompletableFuture<String> fetchDataAsync() {
    return CompletableFuture.completedFuture("Data");
}

@Async
public CompletableFuture<String> processDataAsync(String data) {
    return CompletableFuture.supplyAsync(() -> "Processed " + data);
}
```

The `processDataAsync` method is executed after `fetchDataAsync`:

```java
CompletableFuture<String> dataFuture = asyncService.fetchDataAsync();
dataFuture.thenCompose(data -> asyncService.processDataAsync(data))
          .thenAccept(result -> System.out.println(result));
```

##