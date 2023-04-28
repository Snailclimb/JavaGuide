---
title: API网关详解
category: 分布式
icon: "gateway"
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

绝大部分网关可以提供下面这些功能：

- **请求转发** ：将请求转发到目标微服务。
- **负载均衡** ：根据各个微服务实例的负载情况或者具体的负载均衡策略配置对请求实现动态的负载均衡。
- **安全认证** ：对用户请求进行身份验证并仅允许可信客户端访问 API，并且还能够使用类似 RBAC 等方式来授权。
- **参数校验** ：支持参数映射与校验逻辑。
- **日志记录** ：记录所有请求的行为日志供后续使用。
- **监控告警** ：从业务指标、机器指标、JVM 指标等方面进行监控并提供配套的告警机制。
- **流量控制** ：对请求的流量进行控制，也就是限制某一时刻内的请求数。
- **熔断降级**：实时监控请求的统计信息，达到配置的失败阈值后，自动熔断，返回默认值。
- **响应缓存**：当用户请求获取的是一些静态的或更新不频繁的数据时，一段时间内多次请求获取到的数据很可能是一样的。对于这种情况可以将响应缓存起来。这样用户请求可以直接在网关层得到响应数据，无需再去访问业务服务，减轻业务服务的负担。
- **响应聚合**：某些情况下用户请求要获取的响应内容可能会来自于多个业务服务。网关作为业务服务的调用方，可以把多个服务的响应整合起来，再一并返回给用户。
- **灰度发布** ：将请求动态分流到不同的服务版本（最基本的一种灰度发布）。
- **异常处理**：对于业务服务返回的异常响应，可以在网关层在返回给用户之前做转换处理。这样可以把一些业务侧返回的异常细节隐藏，转换成用户友好的错误提示返回。
- **API 文档：** 如果计划将 API 暴露给组织以外的开发人员，那么必须考虑使用 API 文档，例如 Swagger 或 OpenAPI。
- **协议转换** ：通过协议转换整合后台基于 REST、AMQP、Dubbo 等不同风格和实现技术的微服务，面向 Web Mobile、开放平台等特定客户端提供统一服务。

下图来源于[百亿规模 API 网关服务 Shepherd 的设计与实现 - 美团技术团队 - 2021](https://mp.weixin.qq.com/s/iITqdIiHi3XGKq6u6FRVdg)这篇文章。

![](https://oscimg.oschina.net/oscnet/up-35e102c633bbe8e0dea1e075ea3fee5dcfb.png)

## 有哪些常见的网关系统？

### Netflix Zuul

Zuul 是 Netflix 开发的一款提供动态路由、监控、弹性、安全的网关服务，基于 Java 技术栈开发，可以和 Eureka、Ribbon、Hystrix 等组件配合使用。

Zuul 核心架构如下：

![Zuul 核心架构](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/zuul-core-architecture.webp)

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

![Zuul2 架构](https://oscimg.oschina.net/oscnet/up-4f9047dc9109e27f9fced1b365e2b976e9d.png)

- Github 地址 ： <https://github.com/Netflix/zuul>
- 官方 Wiki ： <https://github.com/Netflix/zuul/wiki>

### Spring Cloud Gateway

SpringCloud Gateway 属于 Spring Cloud 生态系统中的网关，其诞生的目标是为了替代老牌网关 **Zuul**。准确点来说，应该是 Zuul 1.x。SpringCloud Gateway 起步要比 Zuul 2.x 更早。

为了提升网关的性能，SpringCloud Gateway 基于 Spring WebFlux 。Spring WebFlux 使用 Reactor 库来实现响应式编程模型，底层基于 Netty 实现同步非阻塞的 I/O。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/springcloud-gateway-%20demo.png)

Spring Cloud Gateway 不仅提供统一的路由方式，并且基于 Filter 链的方式提供了网关基本的功能，例如：安全，监控/指标，限流。

Spring Cloud Gateway 和 Zuul 2.x 的差别不大，也是通过过滤器来处理请求。不过，目前更加推荐使用 Spring Cloud Gateway 而非 Zuul，Spring Cloud 生态对其支持更加友好。

- Github 地址 ： <https://github.com/spring-cloud/spring-cloud-gateway>
- 官网 ： <https://spring.io/projects/spring-cloud-gateway>

### Kong

Kong 是一款基于 [OpenResty](https://github.com/openresty/) （Nginx + Lua）的高性能、云原生、可扩展的网关系统，主要由 3 个组件组成：

- Kong Server ：基于 Nginx 的服务器，用来接收 API 请求。
- Apache Cassandra/PostgreSQL ：用来存储操作数据。
- Kong Dashboard：官方推荐 UI 管理工具，当然，也可以使用 RESTful 方式 管理 Admin api。

> OpenResty 是一个基于 Nginx 与 Lua 的高性能 Web 平台，其内部集成了大量精良的 Lua 库、第三方模块以及大多数的依赖项。用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-way.webp)

Kong 提供了插件机制来扩展其功能，插件在 API 请求响应循环的生命周期中被执行。比如在服务上启用 Zipkin 插件：

```shell
$ curl -X POST http://kong:8001/services/{service}/plugins \
    --data "name=zipkin"  \
    --data "config.http_endpoint=http://your.zipkin.collector:9411/api/v2/spans" \
    --data "config.sample_ratio=0.001"
```

> Kong 本身就是一个 Lua 应用程序，并且是在 Openresty 的基础之上做了一层封装的应用。归根结底就是利用 Lua 嵌入 Nginx 的方式，赋予了 Nginx 可编程的能力，这样以插件的形式在 Nginx 这一层能够做到无限想象的事情。例如限流、安全访问策略、路由、负载均衡等等。编写一个 Kong 插件，就是按照 Kong 插件编写规范，写一个自己自定义的 Lua 脚本，然后加载到 Kong 中，最后引用即可。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-gateway-overview.png)

- Github 地址： <https://github.com/Kong/kong>
- 官网地址 ： <https://konghq.com/kong>

### APISIX

APISIX 是一款基于 Nginx 和 etcd 的高性能、云原生、可扩展的网关系统。

> etcd 是使用 Go 语言开发的一个开源的、高可用的分布式 key-value 存储系统，使用 Raft 协议做分布式共识。

与传统 API 网关相比，APISIX 具有动态路由和插件热加载，特别适合微服务系统下的 API 管理。并且，APISIX 与 SkyWalking（分布式链路追踪系统）、Zipkin（分布式链路追踪系统）、Prometheus（监控系统） 等 DevOps 生态工具对接都十分方便。

![APISIX 架构图](https://oscimg.oschina.net/oscnet/up-cc6717d095705a584dd8daaaadb13c5c75b.png)

作为 NGINX 和 Kong 的替代项目，APISIX 目前已经是 Apache 顶级开源项目，并且是最快毕业的国产开源项目。国内目前已经有很多知名企业（比如金山、有赞、爱奇艺、腾讯、贝壳）使用 APISIX 处理核心的业务流量。

根据官网介绍：“APISIX 已经生产可用，功能、性能、架构全面优于 Kong”。

APISIX 同样支持定制化的插件开发。开发者除了能够使用 Lua 语言开发插件，还能通过下面两种方式开发来避开 Lua 语言的学习成本：

- 通过 Plugin Runner 来支持更多的主流编程语言（比如 Java、Python、Go 等等）。通过这样的方式，可以让后端工程师通过本地 RPC 通信，使用熟悉的编程语言开发 APISIX 的插件。这样做的好处是减少了开发成本，提高了开发效率，但是在性能上会有一些损失。
- 使用 Wasm（WebAssembly） 开发插件。Wasm 被嵌入到了 APISIX 中，用户可以使用 Wasm 去编译成 Wasm 的字节码在 APISIX 中运行。

> Wasm 是基于堆栈的虚拟机的二进制指令格式，一种低级汇编语言，旨在非常接近已编译的机器代码，并且非常接近本机性能。Wasm 最初是为浏览器构建的，但是随着技术的成熟，在服务器端看到了越来越多的用例。

![](https://oscimg.oschina.net/oscnet/up-a240d3b113cde647f5850f4c7cc55d4ff5c.png)

- Github 地址 ：<https://github.com/apache/apisix>
- 官网地址： <https://apisix.apache.org/zh/>

相关阅读：

- [为什么说 Apache APISIX 是最好的 API 网关？](https://mp.weixin.qq.com/s/j8ggPGEHFu3x5ekJZyeZnA)
- [有了 NGINX 和 Kong，为什么还需要 Apache APISIX](https://www.apiseven.com/zh/blog/why-we-need-Apache-APISIX)
- [APISIX 技术博客](https://www.apiseven.com/zh/blog)
- [APISIX 用户案例](https://www.apiseven.com/zh/usercases)

### Shenyu

Shenyu 是一款基于 WebFlux 的可扩展、高性能、响应式网关，Apache 顶级开源项目。

![Shenyu 架构](https://oscimg.oschina.net/oscnet/up-1c2b39f22e5a0bb1730531429c4147bfbf8.png)

Shenyu 通过插件扩展功能，插件是 ShenYu 的灵魂，并且插件也是可扩展和热插拔的。不同的插件实现不同的功能。Shenyu 自带了诸如限流、熔断、转发 、重写、重定向、和路由监控等插件。

- Github 地址： <https://github.com/apache/incubator-shenyu>
- 官网地址 ： <https://shenyu.apache.org/>

## 参考

- Kong 插件开发教程[通俗易懂]：<https://cloud.tencent.com/developer/article/2104299>
- API 网关 Kong 实战：<https://xie.infoq.cn/article/10e4dab2de0bdb6f2c3c93da6>
- Spring Cloud Gateway 原理介绍和应用：<https://blog.fintopia.tech/60e27b0e2078082a378ec5ed/>
