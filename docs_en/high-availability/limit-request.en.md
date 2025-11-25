---
title: 服务限流详解
category: 高可用
icon: limit_rate
---

针对软件系统来说，限流就是对请求的速率进行限制，避免瞬时的大量请求击垮软件系统。毕竟，软件系统的处理能力是有限的。如果说超过了其处理能力的范围，软件系统可能直接就挂掉了。

限流可能会导致用户的请求无法被正确处理或者无法立即被处理，不过，这往往也是权衡了软件系统的稳定性之后得到的最优解。

现实生活中，处处都有限流的实际应用，就比如排队买票是为了避免大量用户涌入购票而导致售票员无法处理。

## 常见限流算法有哪些？

简单介绍 4 种非常好理解并且容易实现的限流算法！

> 图片来源于 InfoQ 的一篇文章[《分布式服务限流实战，已经为你排好坑了》](https://www.infoq.cn/article/Qg2tX8fyw5Vt-f3HH673)。

### 固定窗口计数器算法

固定窗口其实就是时间窗口，其原理是将时间划分为固定大小的窗口，在每个窗口内限制请求的数量或速率，即固定窗口计数器算法规定了系统单位时间处理的请求数量。

假如我们规定系统中某个接口 1 分钟只能被访问 33 次的话，使用固定窗口计数器算法的实现思路如下：

- 将时间划分固定大小窗口，这里是 1 分钟一个窗口。
- 给定一个变量 `counter` 来记录当前接口处理的请求数量，初始值为 0（代表接口当前 1 分钟内还未处理请求）。
- 1 分钟之内每处理一个请求之后就将 `counter+1` ，当 `counter=33` 之后（也就是说在这 1 分钟内接口已经被访问 33 次的话），后续的请求就会被全部拒绝。
- 等到 1 分钟结束后，将 `counter` 重置 0，重新开始计数。

![固定窗口计数器算法](https://static001.infoq.cn/resource/image/8d/15/8ded7a2b90e1482093f92fff555b3615.png)

优点：实现简单，易于理解。

缺点：

- 限流不够平滑。例如，我们限制某个接口每分钟只能访问 30 次，假设前 30 秒就有 30 个请求到达的话，那后续 30 秒将无法处理请求，这是不可取的，用户体验极差！
- 无法保证限流速率，因而无法应对突然激增的流量。例如，我们限制某个接口 1 分钟只能访问 1000 次，该接口的 QPS 为 500，前 55s 这个接口 1 个请求没有接收，后 1s 突然接收了 1000 个请求。然后，在当前场景下，这 1000 个请求在 1s 内是没办法被处理的，系统直接就被瞬时的大量请求给击垮了。

### 滑动窗口计数器算法

**滑动窗口计数器算法** 算的上是固定窗口计数器算法的升级版，限流的颗粒度更小。

滑动窗口计数器算法相比于固定窗口计数器算法的优化在于：**它把时间以一定比例分片** 。

例如我们的接口限流每分钟处理 60 个请求，我们可以把 1 分钟分为 60 个窗口。每隔 1 秒移动一次，每个窗口一秒只能处理不大于 `60(请求数)/60（窗口数）` 的请求， 如果当前窗口的请求计数总和超过了限制的数量的话就不再处理其他请求。

很显然， **当滑动窗口的格子划分的越多，滑动窗口的滚动就越平滑，限流的统计就会越精确。**

![滑动窗口计数器算法](https://static001.infoq.cn/resource/image/ae/15/ae4d3cd14efb8dc7046d691c90264715.png)

优点：

- 相比于固定窗口算法，滑动窗口计数器算法可以应对突然激增的流量。
- 相比于固定窗口算法，滑动窗口计数器算法的颗粒度更小，可以提供更精确的限流控制。

缺点：

- 与固定窗口计数器算法类似，滑动窗口计数器算法依然存在限流不够平滑的问题。
- 相比较于固定窗口计数器算法，滑动窗口计数器算法实现和理解起来更复杂一些。

### 漏桶算法

我们可以把发请求的动作比作成注水到桶中，我们处理请求的过程可以比喻为漏桶漏水。我们往桶中以任意速率流入水，以一定速率流出水。当水超过桶流量则丢弃，因为桶容量是不变的，保证了整体的速率。

如果想要实现这个算法的话也很简单，准备一个队列用来保存请求，然后我们定期从队列中拿请求来执行就好了（和消息队列削峰/限流的思想是一样的）。

![漏桶算法](https://static001.infoq.cn/resource/image/75/03/75938d1010138ce66e38c6ed0392f103.png)

优点：

- 实现简单，易于理解。
- 可以控制限流速率，避免网络拥塞和系统过载。

缺点：

- 无法应对突然激增的流量，因为只能以固定的速率处理请求，对系统资源利用不够友好。
- 桶流入水（发请求）的速率如果一直大于桶流出水（处理请求）的速率的话，那么桶会一直是满的，一部分新的请求会被丢弃，导致服务质量下降。

实际业务场景中，基本不会使用漏桶算法。

### 令牌桶算法

令牌桶算法也比较简单。和漏桶算法算法一样，我们的主角还是桶（这限流算法和桶过不去啊）。不过现在桶里装的是令牌了，请求在被处理之前需要拿到一个令牌，请求处理完毕之后将这个令牌丢弃（删除）。我们根据限流大小，按照一定的速率往桶里添加令牌。如果桶装满了，就不能继续往里面继续添加令牌了。

![令牌桶算法](https://static001.infoq.cn/resource/image/ec/93/eca0e5eaa35dac938c673fecf2ec9a93.png)

优点：

- 可以限制平均速率和应对突然激增的流量。
- 可以动态调整生成令牌的速率。

缺点：

- 如果令牌产生速率和桶的容量设置不合理，可能会出现问题比如大量的请求被丢弃、系统过载。
- 相比于其他限流算法，实现和理解起来更复杂一些。

## 针对什么来进行限流？

实际项目中，还需要确定限流对象，也就是针对什么来进行限流。常见的限流对象如下：

- IP ：针对 IP 进行限流，适用面较广，简单粗暴。
- 业务 ID：挑选唯一的业务 ID 以实现更针对性地限流。例如，基于用户 ID 进行限流。
- 个性化：根据用户的属性或行为，进行不同的限流策略。例如， VIP 用户不限流，而普通用户限流。根据系统的运行指标（如 QPS、并发调用数、系统负载等），动态调整限流策略。例如，当系统负载较高的时候，控制每秒通过的请求减少。

针对 IP 进行限流是目前比较常用的一个方案。不过，实际应用中需要注意用户真实 IP 地址的正确获取。常用的真实 IP 获取方法有 X-Forwarded-For 和 TCP Options 字段承载真实源 IP 信息。虽然 X-Forwarded-For 字段可能会被伪造，但因为其实现简单方便，很多项目还是直接用的这种方法。

除了我上面介绍到的限流对象之外，还有一些其他较为复杂的限流对象策略，比如阿里的 Sentinel 还支持 [基于调用关系的限流](https://github.com/alibaba/Sentinel/wiki/流量控制#基于调用关系的流量控制)（包括基于调用方限流、基于调用链入口限流、关联流量限流等）以及更细维度的 [热点参数限流](https://github.com/alibaba/Sentinel/wiki/热点参数限流)（实时的统计热点参数并针对热点参数的资源调用进行流量控制）。

另外，一个项目可以根据具体的业务需求选择多种不同的限流对象搭配使用。

## 单机限流怎么做？

单机限流针对的是单体架构应用。

单机限流可以直接使用 Google Guava 自带的限流工具类 `RateLimiter` 。 `RateLimiter` 基于令牌桶算法，可以应对突发流量。

> Guava 地址：<https://github.com/google/guava>

除了最基本的令牌桶算法(平滑突发限流)实现之外，Guava 的`RateLimiter`还提供了 **平滑预热限流** 的算法实现。

平滑突发限流就是按照指定的速率放令牌到桶里，而平滑预热限流会有一段预热时间，预热时间之内，速率会逐渐提升到配置的速率。

我们下面通过两个简单的小例子来详细了解吧！

我们直接在项目中引入 Guava 相关的依赖即可使用。

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>31.0.1-jre</version>
</dependency>
```

下面是一个简单的 Guava 平滑突发限流的 Demo。

```java
import com.google.common.util.concurrent.RateLimiter;

/**
 * 微信搜 JavaGuide 回复"面试突击"即可免费领取个人原创的 Java 面试手册
 *
 * @author Guide哥
 * @date 2021/10/08 19:12
 **/
public class RateLimiterDemo {

    public static void main(String[] args) {
        // 1s 放 5 个令牌到桶里也就是 0.2s 放 1个令牌到桶里
        RateLimiter rateLimiter = RateLimiter.create(5);
        for (int i = 0; i < 10; i++) {
            double sleepingTime = rateLimiter.acquire(1);
            System.out.printf("get 1 tokens: %ss%n", sleepingTime);
        }
    }
}

```

Output:

```bash
get 1 tokens: 0.0s
get 1 tokens: 0.188413s
get 1 tokens: 0.197811s
get 1 tokens: 0.198316s
get 1 tokens: 0.19864s
get 1 tokens: 0.199363s
get 1 tokens: 0.193997s
get 1 tokens: 0.199623s
get 1 tokens: 0.199357s
get 1 tokens: 0.195676s
```

Below is a simple demo of Guava smooth preheating and current limiting.

```java
import com.google.common.util.concurrent.RateLimiter;
import java.util.concurrent.TimeUnit;

/**
 * Search JavaGuide on WeChat and reply to "Interview Assault" to get your own original Java interview manual for free
 *
 * @author Guide brother
 * @date 2021/10/08 19:12
 **/
public class RateLimiterDemo {

    public static void main(String[] args) {
        // 1s puts 5 tokens into the bucket, that is, 0.2s puts 1 token into the bucket
        // The warm-up time is 3s, which means that the card issuance rate will gradually increase to 0.2s in the first 3s. Put 1 token into the bucket.
        RateLimiter rateLimiter = RateLimiter.create(5, 3, TimeUnit.SECONDS);
        for (int i = 0; i < 20; i++) {
            double sleepingTime = rateLimiter.acquire(1);
            System.out.printf("get 1 tokens: %sds%n", sleepingTime);
        }
    }
}
```

Output:

```bash
get 1 tokens: 0.0s
get 1 tokens: 0.561919s
get 1 tokens: 0.516931s
get 1 tokens: 0.463798s
get 1 tokens: 0.41286s
get 1 tokens: 0.356172s
get 1 tokens: 0.300489s
get 1 tokens: 0.252545s
get 1 tokens: 0.203996s
get 1 tokens: 0.198359s
```

In addition, **Bucket4j** is a very good current limiting library based on the token/leaky bucket algorithm.

> Bucket4j address: <https://github.com/vladimir-bukhtoyarov/bucket4j>

Compared with Guava's current limiting tool class, the current limiting function provided by Bucket4j is more comprehensive. Not only does it support stand-alone current limiting and distributed current limiting, it can also integrate monitoring and be used with Prometheus and Grafana.

However, after all, Guava is just a comprehensive tool library, and the out-of-the-box current limiting function it provides is quite practical in many stand-alone scenarios.

The early version of stand-alone current limiting that comes with Spring Cloud Gateway was implemented based on Bucket4j. Later, it was replaced by **Resilience4j**.

Resilience4j is a lightweight fault-tolerant component inspired by Hystrix. Since [Netflix announced that it will no longer actively develop Hystrix](https://github.com/NETFLIX/Hystrix/commit/a7df971cbaddd8c5e976b3cc5f14013fe6ad00e6), both Spring officials and Netflix recommend using Resilience4j for current limiting and fusing.

> Resilience4j address: <https://github.com/resilience4j/resilience4j>

Under normal circumstances, in order to ensure the high availability of the system, the current limiting and circuit breaker of the project must be done together.

Resilience4j not only provides current limiting, but also provides out-of-the-box functions such as fusing, load protection, and automatic retry to ensure system high availability. Moreover, the ecosystem of Resilience4j is also better. Many gateways use Resilience4j for current limiting and circuit breaker.

Therefore, Resilience4j may be a better choice in most scenarios. For some relatively simple current limiting scenarios, Guava or Bucket4j are also good choices.

## How to implement distributed current limiting?

Distributed current limiting is targeted at distributed/microservice application architecture applications. Under this architecture, single-machine current limiting is not applicable because there will be multiple services, and multiple copies of a service may be deployed.

Common solutions for distributed current limiting:

- **Current limiting with middleware**: You can use Sentinel or Redis to implement the corresponding current limiting logic yourself.
- **Gateway layer current limiting**: A relatively common solution, which arranges the current limiting directly at the gateway layer. However, gateway layer current limiting usually requires the help of middleware/framework. For example, Spring Cloud Gateway's distributed current limiting implementation `RedisRateLimiter` is based on Redis+Lua. Another example is that Spring Cloud Gateway can also integrate Sentinel for current limiting.

If you want to manually implement current limiting logic based on Redis, it is recommended to do it with Lua script.

**Why is the Redis+Lua approach recommended? ** There are two main reasons:

- **Reduced network overhead**: We can use Lua scripts to execute multiple Redis commands in batches. These Redis commands will be submitted to the Redis server for execution at one time, which greatly reduces network overhead.
- **Atomicity**: A Lua script can be executed as a command. During the execution of a Lua script, no other scripts or Redis commands will be executed at the same time, ensuring that the operation will not be inserted or interrupted by other instructions.

I won’t include the specific current limiting script code here. There are many excellent ready-made current limiting scripts on the Internet for your reference. For example, the RateLimiter current limiting plug-in of the Apache gateway project ShenYu implements the token bucket algorithm/concurrent token bucket algorithm, leaky bucket algorithm, and sliding window algorithm based on Redis + Lua.

> ShenYu address: <https://github.com/apache/incubator-shenyu>

![ShenYu rate limit script](https://oss.javaguide.cn/github/javaguide/high-availability/limit-request/shenyu-ratelimit-lua-scripts.png)

In addition, if you don’t want to write Lua scripts yourself, you can also directly use `RRateLimiter` in Redisson to implement distributed current limiting. Its underlying implementation is based on Lua code + token bucket algorithm.

Redisson is an open source Java language Redis client that provides many out-of-the-box features, such as data structure implementations commonly used in Java, distributed locks, delay queues, etc. Moreover, Redisson also supports multiple deployment architectures such as Redis stand-alone, Redis Sentinel, and Redis Cluster.

`RRateLimiter` is very simple to use. We first need to obtain a `RRateLimiter` object, which can be obtained directly through the Redisson client. Then, just set the current limiting rules.

```java
//Create a Redisson client instance
RedissonClient redissonClient = Redisson.create();
// Get a current limiter object named "javaguide.limiter"
RRateLimiter rateLimiter = redissonClient.getRateLimiter("javaguide.limiter");
// Try setting the limiter at a rate of 100 times per hour
// There are two types of RateType, OVERALL is global current limiting, ER_CLIENT is single Client current limiting (it can be considered as single-machine current limiting)
rateLimiter.trySetRate(RateType.OVERALL, 100, 1, RateIntervalUnit.HOURS);
```

Next we call the `acquire()` method or the `tryAcquire()` method to obtain the permission.

```java
// Get a license and wait if the rate of the current limiter is exceeded
// acquire() is a synchronous method, the corresponding asynchronous method: acquireAsync()
rateLimiter.acquire(1);
//Try to obtain a license within 5 seconds, return true if successful, false otherwise
// tryAcquire() is a synchronous method, the corresponding asynchronous method: tryAcquireAsync()
boolean res = rateLimiter.tryAcquire(1, 5, TimeUnit.SECONDS);
```

## Summary

This article mainly introduces common current limiting algorithms, the selection of current limiting objects, and how to implement single-machine current limiting and distributed current limiting respectively.

## refer to- Resilience4j, a lightweight circuit breaker framework for service governance: <https://xie.infoq.cn/article/14786e571c1a4143ad1ef8f19>
- Super detailed analysis of Guava RateLimiter current limiting principle: <https://cloud.tencent.com/developer/article/1408819>
- Practical use of Spring Cloud Gateway current limiting 👍: <https://www.aneasystone.com/archives/2020/08/spring-cloud-gateway-current-limiting.html>
- Detailed explanation of the implementation principle of Redisson distributed current limiting: <https://juejin.cn/post/7199882882138898489>
- A detailed explanation of Java current limiting interface implementation - Alibaba Cloud Developer: <https://mp.weixin.qq.com/s/A5VYjstIDeVvizNK2HkrTQ>
- Exploration and practice of distributed current limiting solutions - Tencent Cloud Developer: <https://mp.weixin.qq.com/s/MJbEQROGlThrHSwCjYB_4Q>

<!-- @include: @article-footer.snippet.md -->