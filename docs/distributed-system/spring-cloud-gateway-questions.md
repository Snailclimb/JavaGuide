---
title: Spring Cloud Gateway常见问题总结
category: 分布式
---

> 本文重构完善自[6000 字 | 16 图 | 深入理解 Spring Cloud Gateway 的原理 - 悟空聊架构](https://mp.weixin.qq.com/s/XjFYsP1IUqNzWqXZdJn-Aw)这篇文章。

## 什么是 Spring Cloud Gateway？

Spring Cloud Gateway 属于 Spring Cloud 生态系统中的网关，其诞生的目标是为了替代老牌网关 **Zuul**。准确点来说，应该是 Zuul 1.x。Spring Cloud Gateway 起步要比 Zuul 2.x 更早。

为了提升网关的性能，Spring Cloud Gateway 基于 Spring WebFlux 。Spring WebFlux 使用 Reactor 库来实现响应式编程模型，底层基于 Netty 实现同步非阻塞的 I/O。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/springcloud-gateway-%20demo.png)

Spring Cloud Gateway 不仅提供统一的路由方式，并且基于 Filter 链的方式提供了网关基本的功能，例如：安全，监控/指标，限流。

Spring Cloud Gateway 和 Zuul 2.x 的差别不大，也是通过过滤器来处理请求。不过，目前更加推荐使用 Spring Cloud Gateway 而非 Zuul，Spring Cloud 生态对其支持更加友好。

- GitHub 地址： <https://github.com/spring-cloud/spring-cloud-gateway>
- 官网： <https://spring.io/projects/spring-cloud-gateway>

## Spring Cloud Gateway 的工作流程？

Spring Cloud Gateway 的工作流程如下图所示：

![Spring Cloud Gateway 的工作流程](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-workflow.png)

这是 Spring 官方博客中的一张图，原文地址：<https://spring.io/blog/2022/08/26/creating-a-custom-spring-cloud-gateway-filter>。

具体的流程分析：

1. **路由判断**：客户端的请求到达网关后，先经过 Gateway Handler Mapping 处理，这里面会做断言（Predicate）判断，看下符合哪个路由规则，这个路由映射后端的某个服务。
2. **请求过滤**：然后请求到达 Gateway Web Handler，这里面有很多过滤器，组成过滤器链（Filter Chain），这些过滤器可以对请求进行拦截和修改，比如添加请求头、参数校验等等，有点像净化污水。然后将请求转发到实际的后端服务。这些过滤器逻辑上可以称作 Pre-Filters，Pre 可以理解为“在...之前”。
3. **服务处理**：后端服务会对请求进行处理。
4. **响应过滤**：后端处理完结果后，返回给 Gateway 的过滤器再次做处理，逻辑上可以称作 Post-Filters，Post 可以理解为“在...之后”。
5. **响应返回**：响应经过过滤处理后，返回给客户端。

总结：客户端的请求先通过匹配规则找到合适的路由，就能映射到具体的服务。然后请求经过过滤器处理后转发给具体的服务，服务处理后，再次经过过滤器处理，最后返回给客户端。

## Spring Cloud Gateway 的断言是什么？

断言（Predicate）这个词听起来极其深奥，它是一种编程术语，我们生活中根本就不会用它。说白了它就是对一个表达式进行 if 判断，结果为真或假，如果为真则做这件事，否则做那件事。

在 Gateway 中，如果客户端发送的请求满足了断言的条件，则映射到指定的路由器，就能转发到指定的服务上进行处理。

断言配置的示例如下，配置了两个路由规则，有一个 predicates 断言配置，当请求 url 中包含 `api/thirdparty`，就匹配到了第一个路由 `route_thirdparty`。

![断言配置示例](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-example.png)

常见的路由断言规则如下图所示：

![Spring Cloud GateWay 路由断言规则](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-rules.png)

## Spring Cloud Gateway 的路由和断言是什么关系？

Route 路由和 Predicate 断言的对应关系如下：：

![路由和断言的对应关系](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-route.png)

- **一对多**：一个路由规则可以包含多个断言。如上图中路由 Route1 配置了三个断言 Predicate。
- **同时满足**：如果一个路由规则中有多个断言，则需要同时满足才能匹配。如上图中路由 Route2 配置了两个断言，客户端发送的请求必须同时满足这两个断言，才能匹配路由 Route2。
- **第一个匹配成功**：如果一个请求可以匹配多个路由，则映射第一个匹配成功的路由。如上图所示，客户端发送的请求满足 Route3 和 Route4 的断言，但是 Route3 的配置在配置文件中靠前，所以只会匹配 Route3。

## Spring Cloud Gateway 如何实现动态路由？

在使用 Spring Cloud Gateway 的时候，官方文档提供的方案总是基于配置文件或代码配置的方式。

Spring Cloud Gateway 作为微服务的入口，需要尽量避免重启，而现在配置更改需要重启服务不能满足实际生产过程中的动态刷新、实时变更的业务需求，所以我们需要在 Spring Cloud Gateway 运行时动态配置网关。

实现动态路由的方式有很多种，其中一种推荐的方式是基于 Nacos 配置中心来做。简单来说，我们将将路由配置放在 Nacos 中存储，然后写个监听器监听 Nacos 上配置的变化，将变化后的配置更新到 GateWay 应用的进程内。

其实这些复杂的步骤并不需要我们手动实现，通过 Nacos Server 和 Spring Cloud Alibaba Nacos Config 即可实现配置的动态变更，官方文档地址：<https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config> 。

## Spring Cloud Gateway 的过滤器有哪些？

过滤器 Filter 按照请求和响应可以分为两种：

- **Pre 类型**：在请求被转发到微服务之前，对请求进行拦截和修改，例如参数校验、权限校验、流量监控、日志输出以及协议转换等操作。
- **Post 类型**：微服务处理完请求后，返回响应给网关，网关可以再次进行处理，例如修改响应内容或响应头、日志输出、流量监控等。

另外一种分类是按照过滤器 Filter 作用的范围进行划分：

- **GatewayFilter**：局部过滤器，应用在单个路由或一组路由上的过滤器。标红色表示比较常用的过滤器。
- **GlobalFilter**：全局过滤器，应用在所有路由上的过滤器。

### 局部过滤器

常见的局部过滤器如下图所示：

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-gatewayfilters.png)

具体怎么用呢？这里有个示例，如果 URL 匹配成功，则去掉 URL 中的 “api”。

```yaml
filters: #过滤器
  - RewritePath=/api/(?<segment>.*),/$\{segment} # 将跳转路径中包含的 “api” 替换成空
```

当然我们也可以自定义过滤器，本篇不做展开。

### 全局过滤器

常见的全局过滤器如下图所示：

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-globalfilters.png)

全局过滤器最常见的用法是进行负载均衡。配置如下所示：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: route_member # 第三方微服务路由规则
          uri: lb://passjava-member # 负载均衡，将请求转发到注册中心注册的 passjava-member 服务
          predicates: # 断言
            - Path=/api/member/** # 如果前端请求路径包含 api/member，则应用这条路由规则
          filters: #过滤器
            - RewritePath=/api/(?<segment>.*),/$\{segment} # 将跳转路径中包含的api替换成空
```

这里有个关键字 `lb`，用到了全局过滤器 `LoadBalancerClientFilter`，当匹配到这个路由后，会将请求转发到 passjava-member 服务，且支持负载均衡转发，也就是先将 passjava-member 解析成实际的微服务的 host 和 port，然后再转发给实际的微服务。

## Spring Cloud Gateway 支持限流吗？

Spring Cloud Gateway 自带了限流过滤器，对应的接口是 `RateLimiter`，`RateLimiter` 接口只有一个实现类 `RedisRateLimiter` （基于 Redis + Lua 实现的限流），提供的限流功能比较简易且不易使用。

从 Sentinel 1.6.0 版本开始，Sentinel 引入了 Spring Cloud Gateway 的适配模块，可以提供两种资源维度的限流：route 维度和自定义 API 维度。也就是说，Spring Cloud Gateway 可以结合 Sentinel 实现更强大的网关流量控制。

## Spring Cloud Gateway 如何自定义全局异常处理？

在 SpringBoot 项目中，我们捕获全局异常只需要在项目中配置 `@RestControllerAdvice`和 `@ExceptionHandler`就可以了。不过，这种方式在 Spring Cloud Gateway 下不适用。

Spring Cloud Gateway 提供了多种全局处理的方式，比较常用的一种是实现`ErrorWebExceptionHandler`并重写其中的`handle`方法。

```java
@Order(-1)
@Component
@RequiredArgsConstructor
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {
    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
    // ...
    }
}
```

## 参考

- Spring Cloud Gateway 官方文档：<https://cloud.spring.io/spring-cloud-gateway/reference/html/>
- Creating a custom Spring Cloud Gateway Filter：<https://spring.io/blog/2022/08/26/creating-a-custom-spring-cloud-gateway-filter>
- 全局异常处理: <https://zhuanlan.zhihu.com/p/347028665>
