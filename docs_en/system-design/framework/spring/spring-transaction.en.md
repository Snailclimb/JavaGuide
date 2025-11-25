---
title: Spring 事务详解
category: 框架
tag:
  - Spring
---

前段时间答应读者的 **Spring 事务** 分析总结终于来了。这部分内容比较重要，不论是对于工作还是面试，但是网上比较好的参考资料比较少。

## 什么是事务？

**事务是逻辑上的一组操作，要么都执行，要么都不执行。**

相信大家应该都能背上面这句话了，下面我结合我们日常的真实开发来谈一谈。

我们系统的每个业务方法可能包括了多个原子性的数据库操作，比如下面的 `savePerson()` 方法中就有两个原子性的数据库操作。这些原子性的数据库操作是有依赖的，它们要么都执行，要不就都不执行。

```java
  public void savePerson() {
    personDao.save(person);
    personDetailDao.save(personDetail);
  }
```

另外，需要格外注意的是：**事务能否生效数据库引擎是否支持事务是关键。比如常用的 MySQL 数据库默认使用支持事务的 `innodb`引擎。但是，如果把数据库引擎变为 `myisam`，那么程序也就不再支持事务了！**

事务最经典也经常被拿出来说例子就是转账了。假如小明要给小红转账 1000 元，这个转账会涉及到两个关键操作就是：

> 1. 将小明的余额减少 1000 元。
> 2. 将小红的余额增加 1000 元。

万一在这两个操作之间突然出现错误比如银行系统崩溃或者网络故障，导致小明余额减少而小红的余额没有增加，这样就不对了。事务就是保证这两个关键操作要么都成功，要么都要失败。

![事务示意图](https://oss.javaguide.cn/github/javaguide/mysql/%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

```java
public class OrdersService {
  private AccountDao accountDao;

  public void setOrdersDao(AccountDao accountDao) {
    this.accountDao = accountDao;
  }

  @Transactional(propagation = Propagation.REQUIRED,
                isolation = Isolation.DEFAULT, readOnly = false, timeout = -1)
  public void accountMoney() {
    //小红账户多1000
    accountDao.addMoney(1000,xiaohong);
    //模拟突然出现的异常，比如银行中可能为突然停电等等
    //如果没有配置事务管理的话会造成，小红账户多了1000而小明账户没有少钱
    int i = 10 / 0;
    //小王账户少1000
    accountDao.reduceMoney(1000,xiaoming);
  }
}
```

另外，数据库事务的 ACID 四大特性是事务的基础，下面简单来了解一下。

## 事务的特性（ACID）了解么?

1. **原子性**（`Atomicity`）：事务是最小的执行单位，不允许分割。事务的原子性确保动作要么全部完成，要么完全不起作用；
2. **一致性**（`Consistency`）：执行事务前后，数据保持一致，例如转账业务中，无论事务是否成功，转账者和收款人的总额应该是不变的；
3. **隔离性**（`Isolation`）：并发访问数据库时，一个用户的事务不被其他事务所干扰，各并发事务之间数据库是独立的；
4. **持久性**（`Durability`）：一个事务被提交之后。它对数据库中数据的改变是持久的，即使数据库发生故障也不应该对其有任何影响。

🌈 这里要额外补充一点：**只有保证了事务的持久性、原子性、隔离性之后，一致性才能得到保障。也就是说 A、I、D 是手段，C 是目的！** 想必大家也和我一样，被 ACID 这个概念被误导了很久! 我也是看周志明老师的公开课[《周志明的软件架构课》](https://time.geekbang.org/opencourse/intro/100064201)才搞清楚的（多看好书！！！）。

![AID->C](https://oss.javaguide.cn/github/javaguide/mysql/AID->C.png)

另外，DDIA 也就是 [《Designing Data-Intensive Application（数据密集型应用系统设计）》](https://book.douban.com/subject/30329536/) 的作者在他的这本书中如是说：

> Atomicity, isolation, and durability are properties of the database, whereas consis‐ tency (in the ACID sense) is a property of the application. The application may rely on the database’s atomicity and isolation properties in order to achieve consistency, but it’s not up to the database alone.
>
> 翻译过来的意思是：原子性，隔离性和持久性是数据库的属性，而一致性（在 ACID 意义上）是应用程序的属性。应用可能依赖数据库的原子性和隔离属性来实现一致性，但这并不仅取决于数据库。因此，字母 C 不属于 ACID 。

《Designing Data-Intensive Application（数据密集型应用系统设计）》这本书强推一波，值得读很多遍！豆瓣有接近 90% 的人看了这本书之后给了五星好评。另外，中文翻译版本已经在 GitHub 开源，地址：[https://github.com/Vonng/ddia](https://github.com/Vonng/ddia) 。

## 详谈 Spring 对事务的支持

> ⚠️ 再提醒一次：你的程序是否支持事务首先取决于数据库 ，比如使用 MySQL 的话，如果你选择的是 innodb 引擎，那么恭喜你，是可以支持事务的。但是，如果你的 MySQL 数据库使用的是 myisam 引擎的话，那不好意思，从根上就是不支持事务的。

这里再多提一下一个非常重要的知识点：**MySQL 怎么保证原子性的？**

我们知道如果想要保证事务的原子性，就需要在异常发生时，对已经执行的操作进行**回滚**，在 MySQL 中，恢复机制是通过 **回滚日志（undo log）** 实现的，所有事务进行的修改都会先记录到这个回滚日志中，然后再执行相关的操作。如果执行过程中遇到异常的话，我们直接利用 **回滚日志** 中的信息将数据回滚到修改之前的样子即可！并且，回滚日志会先于数据持久化到磁盘上。这样就保证了即使遇到数据库突然宕机等情况，当用户再次启动数据库的时候，数据库还能够通过查询回滚日志来回滚之前未完成的事务。

### Spring 支持两种方式的事务管理

#### 编程式事务管理

通过 `TransactionTemplate`或者`TransactionManager`手动管理事务，实际应用中很少使用，但是对于你理解 Spring 事务管理原理有帮助。

使用`TransactionTemplate` 进行编程式事务管理的示例代码如下：

```java
@Autowired
private TransactionTemplate transactionTemplate;
public void testTransaction() {

        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {

                try {

                    // ....  业务代码
                } catch (Exception e){
                    //回滚
                    transactionStatus.setRollbackOnly();
                }

            }
        });
}
```

使用 `TransactionManager` 进行编程式事务管理的示例代码如下：

```java
@Autowired
private PlatformTransactionManager transactionManager;

public void testTransaction() {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
          try {
               // ....  业务代码
              transactionManager.commit(status);
          } catch (Exception e) {
              transactionManager.rollback(status);
          }
}
```

#### Declarative transaction management

Recommended (the code is minimally intrusive), it is actually implemented through AOP (the full annotation method based on `@Transactional` is the most used).

The sample code using the `@Transactional` annotation for transaction management is as follows:

```java
@Transactional(propagation = Propagation.REQUIRED)
public void aMethod {
  //do something
  B b = new B();
  C c = new C();
  b.bMethod();
  c.cMethod();
}
```

### Introduction to Spring transaction management interface

In the Spring framework, the three most important interfaces related to transaction management are as follows:

- **`PlatformTransactionManager`**: (Platform) transaction manager, the core of Spring transaction strategy.
- **`TransactionDefinition`**: Transaction definition information (transaction isolation level, propagation behavior, timeout, read-only, rollback rules).
- **`TransactionStatus`**: Transaction running status.

We can think of the **`PlatformTransactionManager`** interface as the upper-level manager of the transaction, and the two interfaces **`TransactionDefinition`** and **`TransactionStatus`** as the description of the transaction.

**`PlatformTransactionManager`** will manage transactions based on the definitions of **`TransactionDefinition`** such as transaction timeout, isolation level, propagation behavior, etc., while the **`TransactionStatus`** interface provides some methods to obtain the corresponding status of the transaction, such as whether it is a new transaction, whether it can be rolled back, etc.

#### PlatformTransactionManager: Transaction management interface

**Spring does not directly manage transactions, but provides a variety of transaction managers**. The interface of Spring transaction manager is: **`PlatformTransactionManager`**.

Through this interface, Spring provides corresponding transaction managers for various platforms such as: JDBC (`DataSourceTransactionManager`), Hibernate (`HibernateTransactionManager`), JPA (`JpaTransactionManager`), etc., but the specific implementation is the matter of each platform.

The specific implementation of **`PlatformTransactionManager` interface is as follows:**

![](./images/spring-transaction/PlatformTransactionManager.png)

Three methods are defined in the `PlatformTransactionManager` interface:

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager {
    //Get the transaction
    TransactionStatus getTransaction(@Nullable TransactionDefinition var1) throws TransactionException;
    //Submit transaction
    void commit(TransactionStatus var1) throws TransactionException;
    //rollback transaction
    void rollback(TransactionStatus var1) throws TransactionException;
}

```

**One more comment here. Why should we define or abstract the `PlatformTransactionManager` interface? **

The main reason is to abstract the transaction management behavior and implement it on different platforms, so that we can ensure that the behavior provided to the outside remains unchanged and facilitate our expansion.

I shared it on my [Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) some time ago: **"Why do we need to use interfaces?"**.

> The book "Design Patterns" (GOF) mentioned many years ago that programming should be based on interfaces rather than implementation. Do you really know why programming should be based on interfaces?
>
> Looking at the source code of open source frameworks and projects, interfaces are an indispensable and important part of them. To understand why interfaces are used, we must first understand what functions the interface provides. We can understand the interface as a contract that provides a series of function lists. The interface itself does not provide functions, it only defines behavior. But whoever wants to use it must first implement me, abide by my agreement, and then implement the functions I defined to be implemented.
>
> For example, my last project required sending text messages. For this purpose, we defined an interface with only two methods:
>
> 1. Send text messages 2. Methods for processing sending results.
>
> At first we used Alibaba Cloud SMS service, and then we implemented this interface to complete an Alibaba Cloud SMS service. Later, we suddenly switched to another SMS service platform. At this time, we only need to implement this interface again. This ensures that the behavior we provide to the outside world remains unchanged. With almost no code changes, we easily completed the change in requirements and improved the flexibility and scalability of the code.
>
> When to use interfaces? When designing abstract behaviors for the functional modules you want to implement, such as text message sending services, picture bed storage services, etc.

#### TransactionDefinition: Transaction attributes

The transaction manager interface **`PlatformTransactionManager`** obtains a transaction through the **`getTransaction(TransactionDefinition definition)`** method. The parameter in this method is the **`TransactionDefinition`** class, which defines some basic transaction attributes.

**What are transaction attributes? ** Transaction attributes can be understood as some basic configurations of transactions, describing how transaction strategies are applied to methods.

Transaction attributes include 5 aspects:

-Isolation level
- communication behavior
- Rollback rules
- Whether it is read-only
- Transaction timeout

The `TransactionDefinition` interface defines 5 methods and some constants representing transaction attributes such as isolation level, propagation behavior, etc.

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    int PROPAGATION_REQUIRED = 0;
    int PROPAGATION_SUPPORTS = 1;
    int PROPAGATION_MANDATORY = 2;
    int PROPAGATION_REQUIRES_NEW = 3;
    int PROPAGATION_NOT_SUPPORTED = 4;
    int PROPAGATION_NEVER = 5;
    int PROPAGATION_NESTED = 6;
    int ISOLATION_DEFAULT = -1;
    int ISOLATION_READ_UNCOMMITTED = 1;
    int ISOLATION_READ_COMMITTED = 2;
    int ISOLATION_REPEATABLE_READ = 4;
    int ISOLATION_SERIALIZABLE = 8;
    int TIMEOUT_DEFAULT = -1;
    // Returns the propagation behavior of the transaction, the default value is REQUIRED.
    int getPropagationBehavior();
    //Return the isolation level of the transaction, the default value is DEFAULT
    int getIsolationLevel();
    // Return the timeout of the transaction, the default value is -1. If the time limit is exceeded but the transaction is not completed, the transaction is automatically rolled back.
    int getTimeout();
    //Returns whether it is a read-only transaction, the default value is false
    boolean isReadOnly();

    @Nullable
    String getName();
}
```

#### TransactionStatus: Transaction status

The `TransactionStatus` interface is used to record the status of a transaction. This interface defines a set of methods to obtain or determine the corresponding status information of the transaction.

The `PlatformTransactionManager.getTransaction(…)` method returns a `TransactionStatus` object.

**The contents of the TransactionStatus interface are as follows:**

```java
public interface TransactionStatus{
    boolean isNewTransaction(); // Whether it is a new transaction
    boolean hasSavepoint(); // Whether there is a recovery point
    void setRollbackOnly(); // Set to rollback only
    boolean isRollbackOnly(); // Whether to rollback only
    boolean isCompleted; // Whether it has been completed
}```

### Detailed explanation of transaction attributes

In actual business development, everyone generally uses the `@Transactional` annotation to start transactions. Many people do not know what the parameters in this annotation mean and what they are used for. In order to better use transaction management in projects, it is highly recommended to read the following content.

#### Transaction propagation behavior

**Transaction propagation behavior is to solve the transaction problem of calling each other between business layer methods**.

When a transaction method is called by another transaction method, you must specify how the transaction should be propagated. For example: the method may continue to run in the existing transaction, or it may start a new transaction and run in its own transaction.

For example: we call the `bMethod()` method of class B in the `aMethod()` method of class A. This time involves the transaction issue of calling each other between business layer methods. If our `bMethod()` needs to be rolled back if an exception occurs, how to configure the transaction propagation behavior so that `aMethod()` can also be rolled back? At this time, you need knowledge of transaction propagation behavior. If you don't know, be sure to take a closer look.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.xxx)
    public void aMethod {
        //do something
        b.bMethod();
    }
}

@Service
Class B {
    @Transactional(propagation = Propagation.xxx)
    public void bMethod {
       //do something
    }
}
```

The `TransactionDefinition` definition includes the following constants that represent propagation behavior:

```java
public interface TransactionDefinition {
    int PROPAGATION_REQUIRED = 0;
    int PROPAGATION_SUPPORTS = 1;
    int PROPAGATION_MANDATORY = 2;
    int PROPAGATION_REQUIRES_NEW = 3;
    int PROPAGATION_NOT_SUPPORTED = 4;
    int PROPAGATION_NEVER = 5;
    int PROPAGATION_NESTED = 6;
    ...
}
```

However, for ease of use, Spring defines an enumeration class accordingly: `Propagation`

```java
package org.springframework.transaction.annotation;

import org.springframework.transaction.TransactionDefinition;

public enum Propagation {

    REQUIRED(TransactionDefinition.PROPAGATION_REQUIRED),

    SUPPORTS(TransactionDefinition.PROPAGATION_SUPPORTS),

    MANDATORY(TransactionDefinition.PROPAGATION_MANDATORY),

    REQUIRES_NEW(TransactionDefinition.PROPAGATION_REQUIRES_NEW),

    NOT_SUPPORTED(TransactionDefinition.PROPAGATION_NOT_SUPPORTED),

    NEVER(TransactionDefinition.PROPAGATION_NEVER),

    NESTED(TransactionDefinition.PROPAGATION_NESTED);

    private final int value;

    Propagation(int value) {
        this.value = value;
    }

    public int value() {
        return this.value;
    }

}

```

**Possible values for correct transaction propagation behavior are as follows**:

**1.`TransactionDefinition.PROPAGATION_REQUIRED`**

The most commonly used transaction propagation behavior is the `@Transactional` annotation that we often use by default. If a transaction currently exists, join the transaction; if there is no current transaction, create a new transaction. That is to say:

- If the external method does not open a transaction, the internal method modified by `Propagation.REQUIRED` will newly open its own transaction, and the opened transactions are independent of each other and do not interfere with each other.
- If the external method starts a transaction and is `Propagation.REQUIRED`, all `Propagation.REQUIRED` modified internal methods and external methods belong to the same transaction. As long as one method is rolled back, the entire transaction will be rolled back.

For example: If our `aMethod()` and `bMethod()` above both use the `PROPAGATION_REQUIRED` propagation behavior, they both use the same transaction. As long as one of the methods is rolled back, the entire transaction will be rolled back.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.REQUIRED)
    public void aMethod {
        //do something
        b.bMethod();
    }
}
@Service
Class B {
    @Transactional(propagation = Propagation.REQUIRED)
    public void bMethod {
       //do something
    }
}
```

**`2.TransactionDefinition.PROPAGATION_REQUIRES_NEW`**

Create a new transaction. If a transaction currently exists, suspend the current transaction. That is to say, regardless of whether the external method opens a transaction, the internal method modified by `Propagation.REQUIRES_NEW` will newly open its own transaction, and the opened transactions are independent of each other and do not interfere with each other.

For example: If our `bMethod()` above is modified with `PROPAGATION_REQUIRES_NEW` transaction propagation behavior, `aMethod` is still modified with `PROPAGATION_REQUIRED`. If an exception rollback occurs in `aMethod()`, `bMethod()` will not be rolled back because `bMethod()` starts an independent transaction. However, if `bMethod()` throws an uncaught exception and the exception satisfies the transaction rollback rules, `aMethod()` will also be rolled back because the exception is detected by the transaction management mechanism of `aMethod()`.

```java
@Service
Class A {
    @Autowired
    B b;
    @Transactional(propagation = Propagation.REQUIRED)
    public void aMethod {
        //do something
        b.bMethod();
    }
}

@Service
Class B {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void bMethod {
       //do something
    }
}
```

**3.`TransactionDefinition.PROPAGATION_NESTED`**:

If a transaction currently exists, create a transaction and execute it as a nested transaction of the current transaction; if there is no transaction currently, perform operations similar to `TransactionDefinition.PROPAGATION_REQUIRED`. That is to say:

- When an external method opens a transaction, a new transaction is opened internally and exists as a nested transaction.
- If the external method has no transaction, a separate transaction is opened, similar to `PROPAGATION_REQUIRED`.

The nested transaction represented by `TransactionDefinition.PROPAGATION_NESTED` is presented in a parent-child relationship. The core concept is that the child transaction will not be submitted independently, but depends on the parent transaction and runs in the parent transaction; when the parent transaction is submitted, the child transaction will also be submitted. Of course, when the parent transaction is rolled back, the child transaction will also be rolled back;
> Different from `TransactionDefinition.PROPAGATION_REQUIRES_NEW`: `PROPAGATION_REQUIRES_NEW` is an independent transaction, does not depend on external affairs, is presented in a horizontal relationship, and will be submitted immediately after execution, and has nothing to do with external affairs;

Sub-transactions also have their own characteristics and can be rolled back independently without triggering the rollback of the parent transaction. However, the premise is that the exceptions of the sub-transaction need to be handled to avoid the exception being sensed by the parent transaction and causing the rollback of the external transaction;

For example:
- If `aMethod()` is rolled back, `bMethod()` as a nested transaction will be rolled back.- If `bMethod()` is rolled back, whether `aMethod()` is rolled back depends on whether the exception of `bMethod()` is handled:
  - The exception of `bMethod()` is not handled, that is, the exception is not handled internally by `bMethod()`, and the exception is not handled by `aMethod()`, then `aMethod()` will sense the exception and cause the overall rollback.
    ```java
    @Service
    Class A {
        @Autowired
        B b;
        @Transactional(propagation = Propagation.REQUIRED)
        public void aMethod (){
            //do something
            b.bMethod();
        }
    }
    
    @Service
    Class B {
        @Transactional(propagation = Propagation.NESTED)
        public void bMethod (){
           //do something and throw an exception
        }
    }
    ```
  - `bMethod()` handles exceptions or `aMethod()` handles exceptions, `aMethod()` will not roll back.

    ```java
    @Service
    Class A {
        @Autowired
        B b;
        @Transactional(propagation = Propagation.REQUIRED)
        public void aMethod (){
            //do something
            try {
                b.bMethod();
            } catch (Exception e) {
                System.out.println("Method rollback");
            }
        }
    }
    
    @Service
    Class B {
        @Transactional(propagation = Propagation.NESTED)
        public void bMethod {
           //do something and throw an exception
        }
    }
    ```

**4.`TransactionDefinition.PROPAGATION_MANDATORY`**

If there is currently a transaction, join the transaction; if there is no transaction, throw an exception. (mandatory: mandatory)

This is rarely used, so I won’t give an example.

**If you configure the following three transaction propagation behaviors incorrectly, the transaction will not be rolled back. We will not explain them here with reference to cases, and they are rarely used. **

- **`TransactionDefinition.PROPAGATION_SUPPORTS`**: If a transaction currently exists, join the transaction; if there is currently no transaction, continue running in a non-transactional manner.
- **`TransactionDefinition.PROPAGATION_NOT_SUPPORTED`**: Run in non-transactional mode. If a transaction currently exists, the current transaction will be suspended.
- **`TransactionDefinition.PROPAGATION_NEVER`**: Run in non-transactional mode and throw an exception if a transaction currently exists.

For more information about transaction propagation behavior, please read this article: ["It's too difficult~ The interviewer asked me to talk about my understanding of Spring's transaction propagation behavior based on cases. 》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486668&idx=2&sn=0381e8c836442f46bdc5367170234abb&ch ksm=cea24307f9d5ca11c96943b3ccfa1fc70dc97dd87d9c540388581f8fe6d805ff548dff5f6b5b&token=1776990505&lang=zh_CN#rd)

#### Transaction isolation level

Five constants representing isolation levels are defined in the `TransactionDefinition` interface:

```java
public interface TransactionDefinition {
    ...
    int ISOLATION_DEFAULT = -1;
    int ISOLATION_READ_UNCOMMITTED = 1;
    int ISOLATION_READ_COMMITTED = 2;
    int ISOLATION_REPEATABLE_READ = 4;
    int ISOLATION_SERIALIZABLE = 8;
    ...
}
```

Like the transaction propagation behavior, for ease of use, Spring also defines an enumeration class: `Isolation`

```java
public enum Isolation {

  DEFAULT(TransactionDefinition.ISOLATION_DEFAULT),

  READ_UNCOMMITTED(TransactionDefinition.ISOLATION_READ_UNCOMMITTED),

  READ_COMMITTED(TransactionDefinition.ISOLATION_READ_COMMITTED),

  REPEATABLE_READ(TransactionDefinition.ISOLATION_REPEATABLE_READ),

  SERIALIZABLE(TransactionDefinition.ISOLATION_SERIALIZABLE);

  private final int value;

  Isolation(int value) {
    this.value = value;
  }

  public int value() {
    return this.value;
  }

}
```

Below I will introduce each transaction isolation level in turn:

- **`TransactionDefinition.ISOLATION_DEFAULT`**: Use the default isolation level of the backend database. MySQL uses the `REPEATABLE_READ` isolation level by default and Oracle uses the `READ_COMMITTED` isolation level by default.
- **`TransactionDefinition.ISOLATION_READ_UNCOMMITTED`**: The lowest isolation level. This isolation level is rarely used because it allows reading of uncommitted data changes, which may lead to dirty reads, phantom reads, or non-repeatable reads**
- **`TransactionDefinition.ISOLATION_READ_COMMITTED`**: Allows reading of data that has been submitted by concurrent transactions, **can prevent dirty reads, but phantom reads or non-repeatable reads may still occur**
- **`TransactionDefinition.ISOLATION_REPEATABLE_READ`**: The results of multiple reads of the same field are consistent, unless the data is modified by the own transaction itself. **Dirty reads and non-repeatable reads can be prevented, but phantom reads may still occur. **
- **`TransactionDefinition.ISOLATION_SERIALIZABLE`**: The highest isolation level, fully compliant with ACID isolation level. All transactions are executed one by one in sequence, so that there is no possibility of interference between transactions. In other words, this level can prevent dirty reads, non-repeatable reads, and phantom reads. But this will seriously affect the performance of the program. Normally this level is not used.

Related reading: [Detailed explanation of MySQL transaction isolation level](https://javaguide.cn/database/mysql/transaction-isolation-level.html).

#### Transaction timeout attribute

The so-called transaction timeout refers to the maximum time a transaction is allowed to execute. If the time limit is exceeded but the transaction has not been completed, the transaction will be automatically rolled back. The timeout is expressed as an int value in `TransactionDefinition`, and its unit is seconds. The default value is -1, which means that the transaction timeout depends on the underlying transaction system or there is no timeout.

#### Transaction read-only attribute

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    ...
    //Returns whether it is a read-only transaction, the default value is false
    boolean isReadOnly();

}
```

For transactions that only read data queries, you can specify the transaction type as readonly, which is a read-only transaction. Read-only transactions do not involve data modification, and the database will provide some optimization methods, which are suitable for use in methods with multiple database query operations.

Many people will ask, why do I need to enable transaction support for a data query operation?Take MySQL's innodb as an example. According to the official website [https://dev.mysql.com/doc/refman/5.7/en/innodb-autocommit-commit-rollback.html](https://dev.mysql.com/doc/refman/5.7/en/innodb-autocommit-commit-rollback.html) description:

> MySQL enables `autocommit` mode by default for each newly established connection. In this mode, each `sql` statement sent to the MySQL server will be processed in a separate transaction. After execution, the transaction will be automatically committed and a new transaction will be opened.

However, if you add a `Transactional` annotation to the method, all `sql` executed by this method will be placed in a transaction. If a read-only transaction is declared, the database will optimize its execution and will not bring any other benefits.

If `Transactional` is not added, each `sql` will open a separate transaction. If the data is changed by other transactions in the middle, the latest value will be read in real time.

Share other people’s answers about the read-only attribute of transactions:

- If you execute a single query statement at a time, there is no need to enable transaction support. The database supports read consistency during SQL execution by default;
- If you execute multiple query statements at one time, such as statistical query and report query, in this scenario, multiple query SQL must ensure overall read consistency. Otherwise, after the previous SQL query and before the subsequent SQL query, the data is changed by other users, then the overall statistical query will have inconsistent read data. At this time, transaction support should be enabled

#### Transaction rollback rules

These rules define which exceptions will cause the transaction to be rolled back and which will not. By default, a transaction will only be rolled back when it encounters a runtime exception (a subclass of `RuntimeException`). `Error` will also cause the transaction to be rolled back. However, it will not be rolled back when a checked exception is encountered.

![](./images/spring-transaction/roollbackFor.png)

If you want to rollback a specific exception type you defined, you can do this:

```java
@Transactional(rollbackFor= MyException.class)
```

### @Transactional annotation usage details

#### Scope of `@Transactional`

1. **Method**: It is recommended to use annotations on methods, but it should be noted that: **This annotation can only be applied to public methods, otherwise it will not take effect. **
2. **Class**: If this annotation is used on a class, it means that the annotation is effective for all public methods in the class.
3. **Interface**: Not recommended for use on interfaces.

#### Common configuration parameters of `@Transactional`

The `@Transactional` annotation source code is as follows, which contains the configuration of basic transaction attributes:

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

  @AliasFor("transactionManager")
  String value() default "";

  @AliasFor("value")
  String transactionManager() default "";

  Propagation propagation() default Propagation.REQUIRED;

  Isolation isolation() default Isolation.DEFAULT;

  int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

  boolean readOnly() default false;

  Class<? extends Throwable>[] rollbackFor() default {};

  String[] rollbackForClassName() default {};

  Class<? extends Throwable>[] noRollbackFor() default {};

  String[] noRollbackForClassName() default {};

}
```

** Summary of common configuration parameters of `@Transactional` (only 5 of the ones I usually use are listed): **

| Attribute name | Description |
| :---------- | :-------------------------------------------------------------------------------------------------- |
| propagation | Transaction propagation behavior, the default value is REQUIRED, optional values are introduced above |
| isolation | The isolation level of the transaction, the default value is DEFAULT, the optional values are introduced above |
| timeout | Transaction timeout, the default value is -1 (no timeout). If the time limit is exceeded but the transaction is not completed, the transaction is automatically rolled back. |
| readOnly | Specifies whether the transaction is a read-only transaction. The default value is false.                                                     |
| rollbackFor | is used to specify the exception type that can trigger transaction rollback, and multiple exception types can be specified.                               |

#### `@Transactional` Principle of transaction annotation

A question that may be asked during the interview when asking AOP. Just say it briefly!

We know that the working mechanism of **`@Transactional` is based on AOP, and AOP is implemented using dynamic proxies. If the target object implements the interface, the JDK dynamic proxy will be used by default. If the target object does not implement the interface, the CGLIB dynamic proxy will be used. **

🤐 One more mention: The `createAopProxy()` method determines whether to use JDK or Cglib for dynamic proxying. The source code is as follows:

```java
public class DefaultAopProxyFactory implements AopProxyFactory, Serializable {

  @Override
  public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
    if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
      Class<?> targetClass = config.getTargetClass();
      if (targetClass == null) {
        throw new AopConfigException("TargetSource cannot determine target class: " +
            "Either an interface or a target is required for proxy creation.");
      }
      if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
        return new JdkDynamicAopProxy(config);
      }
      return new ObjenesisCglibAopProxy(config);
    }
    else {
      return new JdkDynamicAopProxy(config);
    }
  }
  .......
}
```

If a class or a public method in a class is annotated with `@Transactional`, the Spring container will create a proxy class for it when it is started. When calling the public method annotated with `@Transactional`, what is actually called is the `invoke()` method in the `TransactionInterceptor` class. The purpose of this method is to start a transaction before the target method. If an exception is encountered during method execution, the transaction will be rolled back and the transaction will be committed after the method call is completed.> The `invoke()` method in the `TransactionInterceptor` class actually calls the `invokeWithinTransaction()` method of the `TransactionAspectSupport` class. Since the new version of Spring rewrites this part a lot and uses a lot of reactive programming knowledge, the source code will not be listed here.

#### Spring AOP self-calling problem

When a method is marked with the `@Transactional` annotation, the Spring transaction manager will only take effect when it is called by other class methods, but will not take effect when the method is called in a class.

This is due to the working principle of Spring AOP. Because Spring AOP uses dynamic proxies to manage transactions, it generates proxy objects for methods annotated with `@Transactional` at runtime and applies transaction logic before and after method calls. If the method is called by another class our proxy object will intercept the method call and handle the transaction. But when other methods in a class are called internally, our proxy object cannot intercept this internal call, so the transaction will fail.

Calling `method2()` from `method1()` in the `MyService` class will cause the transaction of `method2()` to become invalid.

```java
@Service
public class MyService {

private void method1() {
     method2();
     //......
}
@Transactional
 public void method2() {
     //......
  }
}
```

The solution is to avoid self-invocation in the same class or use AspectJ instead of the Spring AOP proxy.

[issue #2091](https://github.com/Snailclimb/JavaGuide/issues/2091) added an example:

```java
@Service
public class MyService {

private void method1() {
     ((MyService)AopContext.currentProxy()).method2(); // First obtain the proxy object of this class, and then call method2 through the proxy object.
     //......
}
@Transactional
 public void method2() {
     //......
  }
}
```

The above code can indeed start a transaction when calling itself, but this is because the `AopContext.currentProxy()` method is used to obtain the proxy object of the current class, and then calls `method2()` through the proxy object. This is equivalent to calling `method2()` from the outside, so the transaction annotation will take effect. We generally don't write this in our code, so this particular example can be ignored.

#### Summary of precautions for using `@Transactional`

- The `@Transactional` annotation only takes effect when applied to public methods, and is not recommended for use on interfaces;
- Avoid calling `@Transactional` annotated methods in the same class, which will cause the transaction to fail;
- Correctly set the `rollbackFor` and `propagation` properties of `@Transactional`, otherwise the transaction may fail to rollback;
- The class where the method annotated with `@Transactional` is located must be managed by Spring, otherwise it will not take effect;
- The underlying database must support the transaction mechanism, otherwise it will not take effect;
-…

## Reference

- [Summary] Parameters of @Transactional in Spring transaction management: [http://www.mobabel.net/Parameters of transactional in spring transaction management/](http://www.mobabel.net/Parameters of transactional in spring transaction management/)
- Spring official documentation: [https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/transaction.html](https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/transaction.html)
- "Spring5 Advanced Programming"
- Thoroughly master the use of @transactional in Spring: [https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html](https://www.ibm.com/developerworks/cn/java/j-master-spring-transactional-use/index.html)
- Spring transaction propagation characteristics: [https://github.com/love-somnus/Spring/wiki/Spring transaction propagation characteristics](https://github.com/love-somnus/Spring/wiki/Spring transaction propagation characteristics)
- [Detailed explanation of Spring transaction propagation behavior](https://segmentfault.com/a/1190000013341344):[https://segmentfault.com/a/1190000013341344](https://segmentfault.com/a/1190000013341344)
- Comprehensive analysis of Spring's programmatic transaction management and declarative transaction management: [https://www.ibm.com/developerworks/cn/education/opensource/os-cn-spring-trans/index.html](https://www.ibm.com/developerworks/cn/education/opensource/os-cn-spring-trans/index.html)

<!-- @include: @article-footer.snippet.md -->