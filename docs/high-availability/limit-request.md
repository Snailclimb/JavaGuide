---
title: 服务限流详解
description: 服务限流原理与实现详解，涵盖固定窗口、滑动窗口、令牌桶、漏桶等主流限流算法的原理与应用。
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

输出：

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

下面是一个简单的 Guava 平滑预热限流的 Demo。

```java
import com.google.common.util.concurrent.RateLimiter;
import java.util.concurrent.TimeUnit;

/**
 * 微信搜 JavaGuide 回复"面试突击"即可免费领取个人原创的 Java 面试手册
 *
 * @author Guide哥
 * @date 2021/10/08 19:12
 **/
public class RateLimiterDemo {

    public static void main(String[] args) {
        // 1s 放 5 个令牌到桶里也就是 0.2s 放 1个令牌到桶里
        // 预热时间为3s,也就说刚开始的 3s 内发牌速率会逐渐提升到 0.2s 放 1 个令牌到桶里
        RateLimiter rateLimiter = RateLimiter.create(5, 3, TimeUnit.SECONDS);
        for (int i = 0; i < 20; i++) {
            double sleepingTime = rateLimiter.acquire(1);
            System.out.printf("get 1 tokens: %sds%n", sleepingTime);
        }
    }
}
```

输出：

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

另外，**Bucket4j** 是一个非常不错的基于令牌/漏桶算法的限流库。

> Bucket4j 地址：<https://github.com/vladimir-bukhtoyarov/bucket4j>

相对于，Guava 的限流工具类来说，Bucket4j 提供的限流功能更加全面。不仅支持单机限流和分布式限流，还可以集成监控，搭配 Prometheus 和 Grafana 使用。

不过，毕竟 Guava 也只是一个功能全面的工具类库，其提供的开箱即用的限流功能在很多单机场景下还是比较实用的。

Spring Cloud Gateway 中自带的单机限流的早期版本就是基于 Bucket4j 实现的。后来，替换成了 **Resilience4j**。

Resilience4j 是一个轻量级的容错组件，其灵感来自于 Hystrix。自[Netflix 宣布不再积极开发 Hystrix](https://github.com/Netflix/Hystrix/commit/a7df971cbaddd8c5e976b3cc5f14013fe6ad00e6) 之后，Spring 官方和 Netflix 都更推荐使用 Resilience4j 来做限流熔断。

> Resilience4j 地址: <https://github.com/resilience4j/resilience4j>

一般情况下，为了保证系统的高可用，项目的限流和熔断都是要一起做的。

Resilience4j 不仅提供限流，还提供了熔断、负载保护、自动重试等保障系统高可用开箱即用的功能。并且，Resilience4j 的生态也更好，很多网关都使用 Resilience4j 来做限流熔断的。

因此，在绝大部分场景下 Resilience4j 或许会是更好的选择。如果是一些比较简单的限流场景的话，Guava 或者 Bucket4j 也是不错的选择。

## 分布式限流怎么做？

分布式限流针对的分布式/微服务应用架构应用，在这种架构下，单机限流就不适用了，因为会存在多种服务，并且一种服务也可能会被部署多份。

分布式限流常见的方案：

- **借助中间件限流**：可以借助 Sentinel 或者使用 Redis 来自己实现对应的限流逻辑。
- **网关层限流**：比较常用的一种方案，直接在网关层把限流给安排上了。不过，通常网关层限流通常也需要借助到中间件/框架。就比如 Spring Cloud Gateway 的分布式限流实现`RedisRateLimiter`就是基于 Redis+Lua 来实现的，再比如 Spring Cloud Gateway 还可以整合 Sentinel 来做限流。

如果你要基于 Redis 来手动实现限流逻辑的话，建议配合 Lua 脚本来做。

**为什么建议 Redis+Lua 的方式？** 主要有两点原因：

- **减少了网络开销**：我们可以利用 Lua 脚本来批量执行多条 Redis 命令，这些 Redis 命令会被提交到 Redis 服务器一次性执行完成，大幅减小了网络开销。
- **原子性**：一段 Lua 脚本可以视作一条命令执行，一段 Lua 脚本执行过程中不会有其他脚本或 Redis 命令同时执行，保证了操作不会被其他指令插入或打扰。

我这里就不放具体的限流脚本代码了，网上也有很多现成的优秀的限流脚本供你参考，就比如 Apache 网关项目 ShenYu 的 RateLimiter 限流插件就基于 Redis + Lua 实现了令牌桶算法/并发令牌桶算法、漏桶算法、滑动窗口算法。

> ShenYu 地址: <https://github.com/apache/incubator-shenyu>

![ShenYu 限流脚本](/oss/github/javaguide/high-availability/limit-request/shenyu-ratelimit-lua-scripts.png)

另外，如果不想自己写 Lua 脚本的话，也可以直接利用 Redisson 中的 `RRateLimiter` 来实现分布式限流，其底层实现就是基于 Lua 代码+令牌桶算法。

Redisson 是一个开源的 Java 语言 Redis 客户端，提供了很多开箱即用的功能，比如 Java 中常用的数据结构实现、分布式锁、延迟队列等等。并且，Redisson 还支持 Redis 单机、Redis Sentinel、Redis Cluster 等多种部署架构。

`RRateLimiter` 的使用方式非常简单。我们首先需要获取一个`RRateLimiter`对象，直接通过 Redisson 客户端获取即可。然后，设置限流规则就好。

```java
// 创建一个 Redisson 客户端实例
RedissonClient redissonClient = Redisson.create();
// 获取一个名为 "javaguide.limiter" 的限流器对象
RRateLimiter rateLimiter = redissonClient.getRateLimiter("javaguide.limiter");
// 尝试设置限流器的速率为每小时 100 次
// RateType 有两种，OVERALL是全局限流,ER_CLIENT是单Client限流（可以认为就是单机限流）
rateLimiter.trySetRate(RateType.OVERALL, 100, 1, RateIntervalUnit.HOURS);
```

接下来我们调用`acquire()`方法或`tryAcquire()`方法即可获取许可。

```java
// 获取一个许可，如果超过限流器的速率则会等待
// acquire()是同步方法，对应的异步方法：acquireAsync()
rateLimiter.acquire(1);
// 尝试在 5 秒内获取一个许可，如果成功则返回 true，否则返回 false
// tryAcquire()是同步方法，对应的异步方法：tryAcquireAsync()
boolean res = rateLimiter.tryAcquire(1, 5, TimeUnit.SECONDS);
```

## 总结

这篇文章主要介绍了常见的限流算法、限流对象的选择以及单机限流和分布式限流分别应该怎么做。

## 参考

- 服务治理之轻量级熔断框架 Resilience4j：<https://xie.infoq.cn/article/14786e571c1a4143ad1ef8f19>
- 超详细的 Guava RateLimiter 限流原理解析：<https://cloud.tencent.com/developer/article/1408819>
- 实战 Spring Cloud Gateway 之限流篇 👍：<https://www.aneasystone.com/archives/2020/08/spring-cloud-gateway-current-limiting.html>
- 详解 Redisson 分布式限流的实现原理：<https://juejin.cn/post/7199882882138898489>
- 一文详解 Java 限流接口实现 - 阿里云开发者：<https://mp.weixin.qq.com/s/A5VYjstIDeVvizNK2HkrTQ>
- 分布式限流方案的探索与实践 - 腾讯云开发者：<https://mp.weixin.qq.com/s/MJbEQROGlThrHSwCjYB_4Q>

<!-- @include: @article-footer.snippet.md -->
