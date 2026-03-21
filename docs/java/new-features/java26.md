---
title: Java 26 新特性概览
description: 概览 JDK 26 的关键新特性与预览改动，关注 HTTP/3、GC 性能优化、AOT 缓存与语言/平台增强。
category: Java
tag:
  - Java新特性
head:
  - - meta
    - name: keywords
      content: Java 26,JDK26,HTTP/3,G1 GC,AOT 缓存,延迟常量,结构化并发,向量 API,模式匹配
---

JDK 26 于 2026 年 3 月 17 日 发布，这是一个非 LTS（非长期支持版）版本。上一个长期支持版是 **JDK 25**，下一个长期支持版预计是 **JDK 29**。

JDK 26 共有 10 个新特性，这篇文章会挑选其中较为重要的一些新特性进行详细介绍：

- [JEP 517: HTTP/3 for the HTTP Client API (为 HTTP Client API 引入 HTTP/3 支持)](https://openjdk.org/jeps/517)
- [JEP 522: G1 GC: Improve Throughput by Reducing Synchronization (G1 GC 吞吐量优化)](https://openjdk.org/jeps/522)
- [JEP 516: Ahead-of-Time Object Caching with Any GC (AOT 对象缓存支持任意 GC)](https://openjdk.org/jeps/516)
- [JEP 500: Prepare to Make Final Mean Final (准备让 final 真正不可变)](https://openjdk.org/jeps/500)
- [JEP 526: Lazy Constants (延迟常量, 第二次预览)](https://openjdk.org/jeps/526)
- [JEP 525: Structured Concurrency (结构化并发, 第六次预览)](https://openjdk.org/jeps/525)
- [JEP 530: Primitive Types in Patterns, instanceof, and switch (模式匹配支持基本类型, 第四次预览)](https://openjdk.org/jeps/530)
- [JEP 524: PEM Encodings of Cryptographic Objects (加密对象 PEM 编码, 第二次预览)](https://openjdk.org/jeps/524)
- [JEP 529: Vector API (向量 API, 第十一次孵化)](https://openjdk.org/jeps/529)
- [JEP 504: Remove the Applet API (移除 Applet API)](https://openjdk.org/jeps/504)

下图是从 JDK 8 到 JDK 25 每个版本的更新带来的新特性数量和更新时间：

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 517: 为 HTTP Client API 引入 HTTP/3 支持

JDK 26 为 `java.net.http.HttpClient` API 正式添加了 **HTTP/3** 支持，这是一个期待已久的重要更新。

**HTTP/3 的优势**：

- **基于 QUIC 协议**：HTTP/2 是基于 TCP 协议实现的，HTTP/3 新增了 QUIC（Quick UDP Internet Connections） 协议来实现可靠的传输，提供与 TLS/SSL 相当的安全性，具有较低的连接和传输延迟。你可以将 QUIC 看作是 UDP 的升级版本，在其基础上新增了很多功能比如加密、重传等等。
- **消除队头阻塞**：HTTP/2 多请求复用一个 TCP 连接，一旦发生丢包，就会阻塞住所有的 HTTP 请求。由于 QUIC 协议的特性，HTTP/3 在一定程度上解决了队头阻塞（Head-of-Line blocking, 简写：HOL blocking）问题，一个连接建立多个不同的数据流，这些数据流之间独立互不影响，某个数据流发生丢包了，其数据流不受影响（本质上是多路复用+轮询）。
- **更快的连接建立**：HTTP/2 需要经过经典的 TCP 三次握手过程（由于安全的 HTTPS 连接建立还需要 TLS 握手，共需要大约 3 个 RTT）。由于 QUIC 协议的特性（TLS 1.3，TLS 1.3 除了支持 1 个 RTT 的握手，还支持 0 个 RTT 的握手）连接建立仅需 0-RTT 或者 1-RTT。这意味着 QUIC 在最佳情况下不需要任何的额外往返时间就可以建立新连接。
- **更好的移动端体验**：HTTP/3.0 支持连接迁移，因为 QUIC 使用 64 位 ID 标识连接，只要 ID 不变就不会中断，网络环境改变时（如从 Wi-Fi 切换到移动数据）也能保持连接。而 TCP 连接是由（源 IP，源端口，目的 IP，目的端口）组成，这个四元组中一旦有一项值发生改变，这个连接也就不能用了。

详细介绍可以阅读这篇文章：[计算机网络常见面试题总结（上）](https://javaguide.cn/cs-basics/network/other-network-questions.html)（网络分层模型、常见网路协议总结、HTTP、WebSocket、DNS 等）

**使用方式**：

HTTP/3 的使用非常简单，几乎不需要修改现有代码。`HttpClient` 会自动协商使用最高版本的 HTTP 协议：

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .build();

// 如果服务器支持 HTTP/3，HttpClient 会自动升级使用
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
```

如果需要明确指定使用 HTTP/3，可以通过 `version()` 方法设置：

```java
// 所有请求默认优先使用 HTTP/3
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_3)  // 明确指定 HTTP/3
    .build();

// 设置单个HttpRequest对象的首选协议版本
HttpRequest request = HttpRequest.newBuilder(URI.create("https://javaguide.cn/"))
                         .version(HttpClient.Version.HTTP_3)
                         .GET().build();
```

## JEP 522: G1 GC 吞吐量优化

**从 JDK9 开始，G1 垃圾收集器成为了默认的垃圾收集器。** 它在延迟和吞吐量之间寻求平衡。然而，这种平衡有时会影响应用程序的性能。与面向吞吐量的 Parallel GC 相比，G1 更多地与应用程序并发工作，以减少 GC 暂停时间。但这意味着应用线程必须与 GC 线程共享 CPU 并进行协调，这种同步会降低吞吐量并增加延迟。

JEP 522 引入了**双卡表（Card Table）**机制：

1. **第一张卡表**：应用线程的写屏障在更新这张卡表时**无需任何同步**，使得写屏障代码更简单、更快速。
2. **第二张卡表**：优化器线程在后台并行处理这张初始为空的卡表。

当 G1 检测到扫描第一张卡表可能超过暂停时间目标时，它会原子性地交换这两张卡表。应用线程继续更新空的、原先的第二张表，而优化器线程则处理满的、原先的第一张表，无需进一步同步。

**性能提升效果**：

- 在**频繁修改对象引用字段**的应用中，吞吐量提升 **5-15%**
- 即使在不频繁修改引用字段的应用中，由于写屏障简化（x64 上从约 50 条指令减少到仅 12 条），吞吐量也能提升高达 **5%**
- GC 暂停时间也有**轻微下降**

**内存开销**：

第二张卡表与第一张容量相同，每张卡表需要 Java 堆容量的 0.2%，即每 1GB 堆内存额外使用约 2MB 原生内存。

## JEP 516: AOT 对象缓存支持任意 GC

这是 **Project Leyden** 的重要里程碑，使得提前（AOT）对象缓存能够与**任意垃圾收集器**配合使用。

之前在 JDK 24 中引入的 AOT 类数据共享（JEP 483）只支持 G1 垃圾收集器，无法与 ZGC 等其他 GC 配合使用。这是因为 AOT 缓存中存储的对象引用使用的是物理内存地址，而不同 GC 的内存布局和对象移动策略不同。

JEP 516 将对象引用的存储方式从**物理内存地址**改为**逻辑索引**：

- 使用 GC 无关的流式格式存储缓存
- 缓存可以在运行时被任意 GC 加载和解析
- JVM 在加载时将逻辑索引转换为实际的内存地址

**性能收益**：

- **启动时间优化**：显著减少 Java 应用的冷启动时间
- **支持 ZGC**：低延迟的 ZGC 现在也能享受 AOT 缓存带来的启动加速
- **云原生友好**：对于微服务和无服务器函数等启动时间敏感的场景特别有价值

## JEP 500: 准备让 final 真正不可变

这个特性为 Java 的完整性优先原则铺平道路，准备让 `final` 字段真正变得不可变。

从 JDK 1.0 开始，Java 的 `final` 字段实际上可以通过**深度反射**被修改：

```java
import java.lang.reflect.Field;
import java.lang.reflect.Method;

class Example {
    private final String name = "Original";

    public String getName() {
        return name;
    }
}

// 通过反射修改 final 字段
Example example = new Example();
Field field = Example.class.getDeclaredField("name");
field.setAccessible(true);

// 移除 final 修饰符
Field modifiersField = Field.class.getDeclaredField("modifiers");
modifiersField.setAccessible(true);
modifiersField.setInt(field, field.getModifiers() & ~Modifier.FINAL);

field.set(example, "Modified");  // 成功修改了 final 字段！
System.out.println(example.getName());  // 输出 "Modified"
```

这种能力虽然被一些框架（如序列化库、依赖注入框架、测试工具）使用，但破坏了 `final` 的不可变性保证，也阻碍了编译器优化。

在 JDK 26 中，当通过深度反射修改 `final` 字段时，JVM 会**发出警告**。这是为未来版本中默认禁止此类操作做准备。

对于确实需要修改 `final` 字段的场景，JDK 26 提供了显式的选择机制，允许开发者在过渡期继续使用此能力，同时为未来的严格模式做好准备。

## JEP 526: 延迟常量 (第二次预览)

该特性第一次预览是由 [JEP 501](https://openjdk.org/jeps/501) （JDK 25）提出，JDK 26 是第二次预览。

传统的 `static final` 字段在类加载时就会初始化，这会：

- 增加启动时间。
- 如果该常量从未被使用，则浪费内存。
- 需要复杂的延迟初始化模式（如双重检查锁定、Holder 类模式等）。

JEP 526 引入了 `LazyConstant<T>`，一种持有不可变数据的对象，JVM 将其视为真正的常量，以获得与声明 `final` 字段相同的性能。

```java
// 传统方式：类加载时立即初始化
static final ExpensiveObject TRADITIONAL = new ExpensiveObject();

// 新方式：首次访问时才初始化
static final LazyConstant<ExpensiveObject> LAZY =
    LazyConstant.of(() -> new ExpensiveObject());

// 使用时
ExpensiveObject obj = LAZY.get();  // 此时才初始化
```

**优势**：

- **按需初始化**：只在首次访问时初始化，提升启动性能。
- **线程安全**：内置线程安全保证，无需手动同步。
- **JVM 优化**：JVM 可以像对待 `final` 字段一样优化延迟常量。
- **简化代码**：消除双重检查锁定等复杂的延迟初始化模式。

## JEP 525: 结构化并发 (第六次预览)

JDK 19 引入了结构化并发，一种多线程编程方法，目的是为了通过结构化并发 API 来简化多线程编程，并不是为了取代`java.util.concurrent`，目前处于孵化器阶段。

结构化并发将不同线程中运行的多个任务视为单个工作单元，从而简化错误处理、提高可靠性并增强可观察性。也就是说，结构化并发保留了单线程代码的可读性、可维护性和可观察性。

结构化并发的基本 API 是`StructuredTaskScope`，它支持将任务拆分为多个并发子任务，在它们自己的线程中执行，并且子任务必须在主/父任务继续之前完成或者子任务随主/父任务失败而取消。

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

**Java 26 的新变动**：

- **Joiner 增强**：`Joiner` 接口新增 `onTimeout()` 方法，允许在超时发生时返回特定结果。
- **返回类型优化**：`allSuccessfulOrThrow()` 现在直接返回结果列表（`List`），而非之前的子任务流。
- **API 简化**：将 `anySuccessfulResultOrThrow()` 简化更名为 `anySuccessfulOrThrow()`。

## JEP 530: 模式匹配支持基本类型 (第四次预览)

该特性第一次预览是由 [JEP 455](https://openjdk.org/jeps/455 "JEP 455") （JDK 23 ）提出。

模式匹配可以在 `switch` 和 `instanceof` 语句中处理所有的基本数据类型（`int`, `double`, `boolean` 等）

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("这是一个int类型: " + i);
    }
}
```

JDK 26 对该特性进行了进一步增强：

- 消除了与基本类型相关的多项限制，使模式匹配、`instanceof` 和 `switch` 更加统一和表达力更强。
- 增强了无条件精确性的定义。
- 在 `switch` 构造中应用更严格的支配性检查，使编译器能够识别并减少更广泛的编码错误。

这样就可以像处理对象类型一样，对基本类型进行更安全、更简洁的类型匹配和转换，进一步消除了 Java 中的模板代码。

## JEP 524: 加密对象 PEM 编码 (第二次预览)

该特性第一次预览是由 [JEP 518](https://openjdk.org/jeps/518) （JDK 25）提出。

PEM（Privacy-Enhanced Mail）是一种广泛使用的文本格式，用于存储和传输加密对象，如证书、私钥和公钥。JEP 524 提供了一个新的 API，用于将加密对象编码为 PEM 格式，以及从 PEM 格式解码回加密对象。

```java
// 将密钥编码为 PEM 格式
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair keyPair = kpg.generateKeyPair();

// 编码为 PEM
String pemEncoded = PemEncoding.encode(keyPair.getPrivate());

// 从 PEM 解码
PrivateKey decodedKey = PemEncoding.decode(pemEncoded);
```

这个 API 减少了错误风险，简化了合规性要求，并通过简化企业、云和监管需求的加密设置和集成，增强了安全 Java 应用程序的可移植性和互操作性。

## JEP 529: Vector API (向量 API, 第十一次孵化)

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

尽管仍在孵化中，但其第十一次迭代足以证明其重要性。它使得 Java 在科学计算、机器学习、AI 推理、大数据处理等性能敏感领域，能够编写出接近甚至媲美 C++ 等本地语言性能的代码。

## JEP 504: 移除 Applet API

Applet API 在 JDK 9 中被标记为废弃，在 JDK 17 中被标记为即将移除。在 JDK 26 中，Applet API 终于被**完全移除**。大快人心啊！

这意味着：

- `java.applet.Applet` 类及其相关类已被删除。
- 减少了 JDK 的安装和源代码体积。
- 提升了应用程序的性能、稳定性和安全性。

Applet 技术早已过时，现代 Web 开发已完全转向其他技术栈。移除这个遗留 API 是 Java 平台现代化的必要步骤。

## 总结

JDK 26 虽然是一个非 LTS 版本，但包含了一些值得关注的重要特性：

| 类别     | 特性                                                       |
| -------- | ---------------------------------------------------------- |
| **网络** | HTTP/3 支持                                                |
| **性能** | G1 GC 吞吐量优化、AOT 缓存支持任意 GC                      |
| **语言** | 模式匹配支持基本类型（第四次预览）、延迟常量（第二次预览） |
| **并发** | 结构化并发（第六次预览）、向量 API（第十一次孵化）         |
| **安全** | 让 final 真正不可变、PEM 编码支持                          |
| **清理** | 移除 Applet API                                            |

Oracle 将提供更新直到 2026 年 9 月，届时将被 Oracle JDK 27 取代。
