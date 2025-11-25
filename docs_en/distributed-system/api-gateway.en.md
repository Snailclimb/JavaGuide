---
title: API网关基础知识总结
category: 分布式
---

## 什么是网关？

微服务背景下，一个系统被拆分为多个服务，但是像安全认证，流量控制，日志，监控等功能是每个服务都需要的，没有网关的话，我们就需要在每个服务中单独实现，这使得我们做了很多重复的事情并且没有一个全局的视图来统一管理这些功能。

![网关示意图](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

一般情况下，网关可以为我们提供请求转发、安全认证（身份/权限认证）、流量控制、负载均衡、降级熔断、日志、监控、参数校验、协议转换等功能。

上面介绍了这么多功能，实际上，网关主要做了两件事情：**请求转发** + **请求过滤**。

由于引入网关之后，会多一步网络转发，因此性能会有一点影响（几乎可以忽略不计，尤其是内网访问的情况下）。 另外，我们需要保障网关服务的高可用，避免单点风险。

如下图所示，网关服务外层通过 Nginx（其他负载均衡设备/软件也行） 进⾏负载转发以达到⾼可⽤。Nginx 在部署的时候，尽量也要考虑高可用，避免单点风险。

![基于 Nginx 的服务端负载均衡](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/server-load-balancing.png)

## 网关能提供哪些功能？

绝大部分网关可以提供下面这些功能（有一些功能需要借助其他框架或者中间件）：

- **请求转发**：将请求转发到目标微服务。
- **负载均衡**：根据各个微服务实例的负载情况或者具体的负载均衡策略配置对请求实现动态的负载均衡。
- **安全认证**：对用户请求进行身份验证并仅允许可信客户端访问 API，并且还能够使用类似 RBAC 等方式来授权。
- **参数校验**：支持参数映射与校验逻辑。
- **日志记录**：记录所有请求的行为日志供后续使用。
- **监控告警**：从业务指标、机器指标、JVM 指标等方面进行监控并提供配套的告警机制。
- **流量控制**：对请求的流量进行控制，也就是限制某一时刻内的请求数。
- **熔断降级**：实时监控请求的统计信息，达到配置的失败阈值后，自动熔断，返回默认值。
- **响应缓存**：当用户请求获取的是一些静态的或更新不频繁的数据时，一段时间内多次请求获取到的数据很可能是一样的。对于这种情况可以将响应缓存起来。这样用户请求可以直接在网关层得到响应数据，无需再去访问业务服务，减轻业务服务的负担。
- **响应聚合**：某些情况下用户请求要获取的响应内容可能会来自于多个业务服务。网关作为业务服务的调用方，可以把多个服务的响应整合起来，再一并返回给用户。
- **灰度发布**：将请求动态分流到不同的服务版本（最基本的一种灰度发布）。
- **异常处理**：对于业务服务返回的异常响应，可以在网关层在返回给用户之前做转换处理。这样可以把一些业务侧返回的异常细节隐藏，转换成用户友好的错误提示返回。
- **API 文档：** 如果计划将 API 暴露给组织以外的开发人员，那么必须考虑使用 API 文档，例如 Swagger 或 OpenAPI。
- **协议转换**：通过协议转换整合后台基于 REST、AMQP、Dubbo 等不同风格和实现技术的微服务，面向 Web Mobile、开放平台等特定客户端提供统一服务。
- **证书管理**：将 SSL 证书部署到 API 网关，由一个统一的入口管理接口，降低了证书更换时的复杂度。

下图来源于[百亿规模 API 网关服务 Shepherd 的设计与实现 - 美团技术团队 - 2021](https://mp.weixin.qq.com/s/iITqdIiHi3XGKq6u6FRVdg)这篇文章。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/up-35e102c633bbe8e0dea1e075ea3fee5dcfb.png)

## 有哪些常见的网关系统？

### Netflix Zuul

Zuul 是 Netflix 开发的一款提供动态路由、监控、弹性、安全的网关服务，基于 Java 技术栈开发，可以和 Eureka、Ribbon、Hystrix 等组件配合使用。

Zuul 核心架构如下：

![Zuul 核心架构](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/zuul-core-architecture.webp)

Zuul 主要通过过滤器（类似于 AOP）来过滤请求，从而实现网关必备的各种功能。

![Zuul 请求声明周期](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/zuul-request-lifecycle.webp)

我们可以自定义过滤器来处理请求，并且，Zuul 生态本身就有很多现成的过滤器供我们使用。就比如限流可以直接用国外朋友写的 [spring-cloud-zuul-ratelimit](https://github.com/marcosbarbero/spring-cloud-zuul-ratelimit) (这里只是举例说明，一般是配合 hystrix 来做限流)：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-zuul</artifactId>
</dependency>
<dependency>
    <groupId>com.marcosbarbero.cloud</groupId>
    <artifactId>spring-cloud-zuul-ratelimit</artifactId>
    <version>2.2.0.RELEASE</version>
</dependency>
```

[Zuul 1.x](https://netflixtechblog.com/announcing-zuul-edge-service-in-the-cloud-ab3af5be08ee) 基于同步 IO，性能较差。[Zuul 2.x](https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3) 基于 Netty 实现了异步 IO，性能得到了大幅改进。

![Zuul2 架构](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/zuul2-core-architecture.png)

- GitHub 地址： <https://github.com/Netflix/zuul>
- 官方 Wiki： <https://github.com/Netflix/zuul/wiki>

### Spring Cloud Gateway

SpringCloud Gateway 属于 Spring Cloud 生态系统中的网关，其诞生的目标是为了替代老牌网关 **Zuul**。准确点来说，应该是 Zuul 1.x。SpringCloud Gateway 起步要比 Zuul 2.x 更早。

为了提升网关的性能，SpringCloud Gateway 基于 Spring WebFlux 。Spring WebFlux 使用 Reactor 库来实现响应式编程模型，底层基于 Netty 实现同步非阻塞的 I/O。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/springcloud-gateway-%20demo.png)

Spring Cloud Gateway 不仅提供统一的路由方式，并且基于 Filter 链的方式提供了网关基本的功能，例如：安全，监控/指标，限流。

Spring Cloud Gateway 和 Zuul 2.x 的差别不大，也是通过过滤器来处理请求。不过，目前更加推荐使用 Spring Cloud Gateway 而非 Zuul，Spring Cloud 生态对其支持更加友好。

- Github 地址： <https://github.com/spring-cloud/spring-cloud-gateway>
- 官网： <https://spring.io/projects/spring-cloud-gateway>

### OpenResty

根据官方介绍：

> OpenResty is a high-performance web platform based on Nginx and Lua. It integrates a large number of sophisticated Lua libraries, third-party modules and most dependencies. Used to easily build dynamic web applications, web services and dynamic gateways that can handle ultra-high concurrency and high scalability.

![The relationship between OpenResty, Nginx and Lua](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gatewaynginx-lua-openresty.png)

OpenResty is based on Nginx, mainly because of its excellent high concurrency capabilities. However, because Nginx is developed in C language, the threshold for secondary development is relatively high. If you want to implement some custom logic or functions on Nginx, you need to write a C language module and recompile Nginx.

In order to solve this problem, OpenResty perfectly integrates Lua/LuaJIT into Nginx by implementing Nginx modules such as `ngx_lua` and `stream_lua`, which allows us to embed Lua scripts inside Nginx, so that the functions of the gateway can be extended through simple Lua language, such as implementing custom routing rules, filters, caching strategies, etc.

> Lua is a very fast dynamic scripting language that runs as fast as C. LuaJIT is a just-in-time compiler for Lua that can significantly improve the execution efficiency of Lua code. LuaJIT precompiles and caches some commonly used Lua functions and tool libraries, so that the cached bytecode can be used directly the next time it is called, thus greatly speeding up execution.

It is recommended to read this article for getting started with OpenResty and practical gateway security: [Getting started with OpenResty and practical gateway security that every backend should know] (https://mp.weixin.qq.com/s/3HglZs06W95vF3tSa3KrXw).

- Github address: <https://github.com/openresty/openresty>
- Official website address: <https://openresty.org/>

### Kong

Kong is a high-performance, cloud-native, scalable, and ecologically rich gateway system based on [OpenResty](https://github.com/openresty/) (Nginx + Lua). It mainly consists of 3 components:

- Kong Server: Nginx-based server used to receive API requests.
- Apache Cassandra/PostgreSQL: used to store operational data.
- Kong Dashboard: Officially recommended UI management tool. Of course, you can also use the RESTful method to manage the Admin api.

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-way.webp)

Since Apache Cassandra/PostgreSQL is used to store data by default, Kong's entire architecture is bloated and will cause high availability problems.

Kong provides a plug-in mechanism to extend its functionality. Plug-ins are executed during the life cycle of the API request response cycle. For example, enable the Zipkin plug-in on the service:

```shell
$ curl -X POST http://kong:8001/services/{service}/plugins \
    --data "name=zipkin" \
    --data "config.http_endpoint=http://your.zipkin.collector:9411/api/v2/spans" \
    --data "config.sample_ratio=0.001"
```

Kong itself is a Lua application, and it is an encapsulated application based on Openresty. The final analysis is to use Lua to embed Nginx to give Nginx programmable capabilities, so that unlimited imagination can be done at the Nginx level in the form of plug-ins. For example, current limiting, security access policy, routing, load balancing, etc. To write a Kong plug-in, you need to follow the Kong plug-in writing specifications, write your own customized Lua script, then load it into Kong, and finally quote it.

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-gateway-overview.png)

In addition to Lua, Kong can also develop plug-ins based on Go, JavaScript, Python and other languages, thanks to the corresponding PDK (plug-in development kit).

For a detailed introduction to the Kong plug-in, it is recommended to read the official document: <https://docs.konghq.com/gateway/latest/kong-plugins/>, which is written in more detail.

- Github address: <https://github.com/Kong/kong>
- Official website address: <https://konghq.com/kong>

### APISIX

APISIX is a high-performance, cloud-native, scalable gateway system based on OpenResty and etcd.

> etcd is an open source, highly available distributed key-value storage system developed using the Go language, and uses the Raft protocol for distributed consensus.

Compared with traditional API gateways, APISIX has dynamic routing and plug-in hot loading, which is particularly suitable for API management under microservice systems. Moreover, APISIX is very convenient to connect with DevOps ecological tools such as SkyWalking (distributed link tracking system), Zipkin (distributed link tracking system), and Prometheus (monitoring system).

![APISIX Architecture Diagram](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/apisix-architecture.png)

As an alternative project to Nginx and Kong, APISIX is currently Apache's top open source project and the fastest graduating domestic open source project. There are currently many well-known domestic companies (such as Kingsoft, Youzan, iQiyi, Tencent, and Shell) using APISIX to handle core business traffic.

According to the official website: "APISIX is already in production and available, and its functions, performance, and architecture are all superior to Kong."

APISIX also supports customized plug-in development. In addition to using the Lua language to develop plug-ins, developers can also develop in the following two ways to avoid the learning cost of the Lua language:

- Support more mainstream programming languages (such as Java, Python, Go, etc.) through Plugin Runner. In this way, back-end engineers can communicate through local RPC and develop APISIX plug-ins using familiar programming languages. The advantage of this is that it reduces development costs and improves development efficiency, but there will be some loss in performance.
- Use Wasm (WebAssembly) to develop plug-ins. Wasm is embedded into APISIX, and users can use Wasm to compile into Wasm bytecode and run it in APISIX.

> Wasm is a binary instruction format for stack-based virtual machines, a low-level assembly language designed to be very close to compiled machine code, and very close to native performance. Wasm was originally built for the browser, but as the technology matures, it's seeing more and more use cases on the server side.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/up-a240d3b113cde647f5850f4c7cc55d4ff5c.png)

- Github address: <https://github.com/apache/apisix>
- Official website address: <https://apisix.apache.org/zh/>

Related reading:

- [Why is Apache APISIX the best API gateway? ](https://mp.weixin.qq.com/s/j8ggPGEHFu3x5ekJZyeZnA)
- [With NGINX and Kong, why do we need Apache APISIX](https://www.apiseven.com/zh/blog/why-we-need-Apache-APISIX)
- [APISIX Technology Blog](https://www.apiseven.com/zh/blog)
- [APISIX User Cases](https://www.apiseven.com/zh/usercases) (recommended)

### Shenyu

Shenyu is a scalable, high-performance, responsive gateway based on WebFlux, a top Apache open source project.

![Shenyu Architecture](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/shenyu-architecture.png)

Shenyu extends its functionality through plug-ins, which are the soul of ShenYu and are also expandable and hot-swappable. Different plug-ins implement different functions. Shenyu comes with plug-ins such as current limiting, circuit breaker, forwarding, rewriting, redirection, and route monitoring.- Github address: <https://github.com/apache/incubator-shenyu>
- Official website address: <https://shenyu.apache.org/>

## How to choose?

Among the several common gateway systems introduced above, the three most commonly used ones are Spring Cloud Gateway, Kong, and APISIX.

For companies whose business uses Java as the main development language, Spring Cloud Gateway is usually a good choice. Its advantages include: simple and easy to use, mature and stable, compatible with the Spring Cloud ecosystem, mature Spring community, etc. However, Spring Cloud Gateway also has some limitations and shortcomings, and generally needs to be used in conjunction with other gateways such as OpenResty. Moreover, its performance is still worse than Kong and APISIX. If you have high performance requirements, Spring Cloud Gateway is not a good choice.

Kong and APISIX have richer functions, more powerful performance, and their technical architecture is more cloud-native. Kong is the originator of open source API gateways, with a rich ecosystem and a large user base. APISIX is a latecomer and is better. According to the APISIX official website: "APISIX is already in production and available, and its functions, performance, and architecture are all superior to Kong." Let’s briefly compare the two:

- APISIX is based on etcd as the configuration center, so there is no single point of problem and is cloud-native friendly; while Kong is based on Apache Cassandra/PostgreSQL, which has a single point of risk and requires additional infrastructure to ensure high availability.
- APISIX supports hot updates and implements millisecond-level hot update response; while Kong does not support hot updates.
- APISIX performs better than Kong.
- APISIX supports more plug-ins and has richer functions.

## Reference

- Kong plug-in development tutorial [easy to understand]: <https://cloud.tencent.com/developer/article/2104299>
- API gateway Kong in action: <https://xie.infoq.cn/article/10e4dab2de0bdb6f2c3c93da6>
- Spring Cloud Gateway principle introduction and application: <https://blog.fintopia.tech/60e27b0e2078082a378ec5ed/>
- Why do microservices use API gateways? ：<https://apisix.apache.org/zh/blog/2023/03/08/why-do-microservices-need-an-api-gateway/>

<!-- @include: @article-footer.snippet.md -->