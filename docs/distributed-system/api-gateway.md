---
title: API网关基础知识总结
category: 分布式
description: API网关基础知识详解，涵盖网关核心功能（路由转发、身份认证、限流熔断、负载均衡）、工作原理及Zuul、Spring Cloud Gateway、Nginx等常见网关选型对比。
tag:
  - API网关
head:
  - - meta
    - name: keywords
      content: API网关,网关,微服务网关,Spring Cloud Gateway,Zuul,限流熔断,负载均衡,网关面试题
---

## 什么是网关？

API 网关（API Gateway）是位于客户端与后端服务之间的**统一入口**，所有客户端请求先经过网关，再由网关路由到具体的目标服务。

### 核心价值

在微服务架构下，一个系统被拆分为多个服务。像**安全认证、流量控制、日志、监控**等功能是每个服务都需要的。如果没有网关，我们需要在每个服务中单独实现这些功能，导致：

- **代码重复**：相同逻辑在多个服务中冗余实现
- **管理分散**：缺乏统一的配置和监控视图
- **维护成本高**：功能变更需要修改所有服务

![网关示意图](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

### 核心职责

网关的功能虽然繁多，但核心可以概括为两件事：

| 职责         | 说明                                | 典型功能                               |
| ------------ | ----------------------------------- | -------------------------------------- |
| **请求转发** | 将客户端请求路由到正确的目标服务    | 动态路由、负载均衡、协议转换           |
| **请求过滤** | 在请求到达后端服务前/后进行拦截处理 | 身份认证、权限校验、限流熔断、日志记录 |

网关可以提供请求转发、安全认证（身份/权限认证）、流量控制、负载均衡、降级熔断、日志、监控、参数校验、协议转换等功能。

**网关在微服务架构中的位置**：所有客户端请求先到达网关，网关负责统一的认证鉴权、流量控制、路由分发，后端服务专注于业务逻辑处理。

### 高可用部署

引入网关后会增加一次网络转发（性能损耗在内网环境下通常可忽略），但同时也引入了新的单点风险。因此，网关服务本身必须保障高可用：

如下图所示，网关服务外层通过 Nginx（或其他负载均衡设备/软件）进行负载转发以达到高可用。Nginx 在部署时也应考虑高可用，避免单点风险。

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

> **重要提示**：Spring Cloud 官方已在 **Hoxton 版之后将 Zuul 1.x 移除**。尽管 Netflix 开源了 Zuul 2.x，但 Zuul 2.x 并未被集成到 Spring Cloud 主流版本中。对于 Spring Cloud 技术栈的新项目，**严禁选用 Zuul 1.x**，推荐直接使用 Spring Cloud Gateway。

- GitHub 地址： <https://github.com/Netflix/zuul>
- 官方 Wiki： <https://github.com/Netflix/zuul/wiki>

### Spring Cloud Gateway

Spring Cloud Gateway 属于 Spring Cloud 生态系统中的网关，其诞生的目标是为了替代老牌网关 **Zuul**（准确说是 Zuul 1.x）。值得注意的是，Spring Cloud Gateway 的起步时间早于 Zuul 2.x，两者属于不同的技术演进路线。

#### 为什么 Spring Cloud Gateway 性能更好？

| 版本                     | IO 模型             | 线程模型     | 吞吐量 | 延迟 |
| ------------------------ | ------------------- | ------------ | ------ | ---- |
| **Zuul 1.x**             | 同步阻塞（Servlet） | 每请求一线程 | 低     | 高   |
| **Zuul 2.x**             | 异步非阻塞（Netty） | 事件循环     | 高     | 低   |
| **Spring Cloud Gateway** | 异步非阻塞（Netty） | 事件循环     | 高     | 低   |

Spring Cloud Gateway 基于 **Spring WebFlux** 实现，而不是传统的 Spring WebMVC。Spring WebFlux 使用 **Reactor** 库来实现响应式编程模型，底层基于 **Netty** 实现异步非阻塞的 I/O。

**响应式编程的优势**：

- **非阻塞 I/O**：无需为每个请求分配独立线程，少量线程即可处理大量并发连接
- **背压机制**：当下游服务处理能力不足时，自动调节上游请求速率，防止雪崩
- **资源利用率高**：线程上下文切换开销大幅降低

#### 核心概念

Spring Cloud Gateway 的核心组件包括三个部分：

1. **Route（路由）**：网关的基本构建块，由 ID、目标 URI、断言集合和过滤器集合组成
2. **Predicate（断言）**：这是 Java 8 的 `Predicate` 函数，用于匹配 HTTP 请求（如路径、方法、请求头等）
3. **Filter（过滤器）**：`GatewayFilter` 的实例，用于在请求被发送到下游服务之前或之后修改请求和响应

Spring Cloud Gateway 和 Zuul 2.x 都是通过过滤器来处理请求，但 Spring Cloud Gateway 与 Spring 生态系统（如 Eureka、Consul、Config）集成更加紧密。目前，对于 Java 技术栈的项目，Spring Cloud Gateway 是推荐的选择。

- Github 地址： <https://github.com/spring-cloud/spring-cloud-gateway>
- 官网： <https://spring.io/projects/spring-cloud-gateway>

### OpenResty

根据官方介绍：

> OpenResty 是一个基于 Nginx 与 Lua 的高性能 Web 平台，其内部集成了大量精良的 Lua 库、第三方模块以及大多数的依赖项。用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。

![OpenResty 和 Nginx 以及 Lua 的关系](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gatewaynginx-lua-openresty.png)

OpenResty 基于 Nginx，主要还是看中了其优秀的高并发能力。不过，由于 Nginx 采用 C 语言开发，二次开发门槛较高。如果想在 Nginx 上实现一些自定义的逻辑或功能，就需要编写 C 语言的模块，并重新编译 Nginx。

为了解决这个问题，OpenResty 通过实现 `ngx_lua` 和 `stream_lua` 等 Nginx 模块，把 Lua/LuaJIT 完美地整合进了 Nginx，从而让我们能够在 Nginx 内部里嵌入 Lua 脚本，使得可以通过简单的 Lua 语言来扩展网关的功能，比如实现自定义的路由规则、过滤器、缓存策略等。

> Lua 是一种非常快速的动态脚本语言，它的运行速度接近于 C 语言。LuaJIT 是 Lua 的一个即时编译器，它可以显著提高 Lua 代码的执行效率。LuaJIT 将一些常用的 Lua 函数和工具库预编译并缓存，这样在下次调用时就可以直接使用缓存的字节码，从而大大加快了执行速度。

关于 OpenResty 的入门以及网关安全实战推荐阅读这篇文章：[每个后端都应该了解的 OpenResty 入门以及网关安全实战](https://mp.weixin.qq.com/s/3HglZs06W95vF3tSa3KrXw)。

- Github 地址： <https://github.com/openresty/openresty>
- 官网地址： <https://openresty.org/>

### Kong

Kong 是一款基于 [OpenResty](https://github.com/openresty/) （Nginx + Lua）的高性能、云原生、可扩展、生态丰富的网关系统，主要由 3 个组件组成：

- Kong Server：基于 Nginx 的服务器，用来接收 API 请求。
- Apache Cassandra/PostgreSQL：用来存储操作数据（传统模式）。
- Kong Manager：官方 UI 管理工具，提供可视化的 API 管理、监控和配置功能（有 OSS 开源版和 Enterprise 企业版）。也可使用 RESTful Admin API 进行管理。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-way.webp)

Kong 早期确实依赖外部数据库存储配置，架构相对复杂，需要额外保障数据库层的高可用。但自 **Kong 1.1** 版本起，已支持 **DB-less 模式（无库模式）**：

- **传统模式**：使用 PostgreSQL 或 Cassandra 存储配置，适合需要持久化 API 数据的场景
- **DB-less 模式**：通过声明式配置文件管理，无需部署数据库，架构更加轻量
- **Kubernetes Ingress 模式**：通过 ConfigMap 或 CRD（Kubernetes Custom Resource Definitions）管理配置，无需数据库，是 K8s 环境下的主流用法

> **注意**：本文后续讨论的 Kong 高可用问题，主要针对传统模式。在 K8s 环境使用 Ingress Controller 模式时，架构已大幅简化。

Kong 提供了插件机制来扩展其功能，插件在 API 请求响应循环的生命周期中被执行。比如在服务上启用 Zipkin 插件：

```shell
$ curl -X POST http://kong:8001/services/{service}/plugins \
    --data "name=zipkin"  \
    --data "config.http_endpoint=http://your.zipkin.collector:9411/api/v2/spans" \
    --data "config.sample_ratio=0.001"
```

Kong 本身就是一个 Lua 应用程序，并且是在 Openresty 的基础之上做了一层封装的应用。归根结底就是利用 Lua 嵌入 Nginx 的方式，赋予了 Nginx 可编程的能力，这样以插件的形式在 Nginx 这一层能够做到无限想象的事情。例如限流、安全访问策略、路由、负载均衡等等。编写一个 Kong 插件，就是按照 Kong 插件编写规范，写一个自己自定义的 Lua 脚本，然后加载到 Kong 中，最后引用即可。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway/kong-gateway-overview.png)

除了 Lua，Kong 还可以基于 Go 、JavaScript、Python 等语言开发插件，得益于对应的 PDK（插件开发工具包）。

关于 Kong 插件的详细介绍，推荐阅读官方文档：<https://docs.konghq.com/gateway/latest/kong-plugins/>，写的比较详细。

- Github 地址： <https://github.com/Kong/kong>
- 官网地址： <https://konghq.com/kong>

### APISIX

APISIX 是一款基于 OpenResty 和 etcd 的高性能、云原生、可扩展的网关系统。

> etcd 是使用 Go 语言开发的一个开源的、高可用的分布式 key-value 存储系统，使用 Raft 协议做分布式共识。

与传统 API 网关相比，APISIX 具有动态路由和插件热加载，特别适合微服务系统下的 API 管理。并且，APISIX 与 SkyWalking（分布式链路追踪系统）、Zipkin（分布式链路追踪系统）、Prometheus（监控系统） 等 DevOps 生态工具对接都十分方便。

![APISIX 架构图](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/apisix-architecture.png)

作为 Nginx 和 Kong 的替代项目，APISIX 目前已经是 Apache 顶级开源项目，并且是最快毕业的国产开源项目。国内目前已经有很多知名企业（比如金山、有赞、爱奇艺、腾讯、贝壳）使用 APISIX 处理核心的业务流量。

根据官网介绍：“APISIX 已经生产可用，功能、性能、架构全面优于 Kong”。

APISIX 同样支持定制化的插件开发。开发者除了能够使用 Lua 语言开发插件，还能通过下面两种方式开发来避开 Lua 语言的学习成本：

- 通过 Plugin Runner 来支持更多的主流编程语言（比如 Java、Python、Go 等等）。通过这样的方式，可以让后端工程师通过本地 RPC 通信，使用熟悉的编程语言开发 APISIX 的插件。这样做的好处是减少了开发成本，提高了开发效率，但是在性能上会有一些损失。
- 使用 Wasm（WebAssembly） 开发插件。Wasm 被嵌入到了 APISIX 中，用户可以使用 Wasm 去编译成 Wasm 的字节码在 APISIX 中运行。

> Wasm 是基于堆栈的虚拟机的二进制指令格式，一种低级汇编语言，旨在非常接近已编译的机器代码，并且非常接近本机性能。Wasm 最初是为浏览器构建的，但是随着技术的成熟，在服务器端看到了越来越多的用例。

![](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/up-a240d3b113cde647f5850f4c7cc55d4ff5c.png)

- Github 地址：<https://github.com/apache/apisix>
- 官网地址： <https://apisix.apache.org/zh/>

### Shenyu

Shenyu 是一款基于 WebFlux 的可扩展、高性能、响应式网关，Apache 顶级开源项目。

![Shenyu 架构](https://oss.javaguide.cn/github/javaguide/distributed-system/api-gateway/shenyu-architecture.png)

Shenyu 通过插件扩展功能，插件是 ShenYu 的灵魂，并且插件也是可扩展和热插拔的。不同的插件实现不同的功能。Shenyu 自带了诸如限流、熔断、转发、重写、重定向、和路由监控等插件。

- Github 地址： <https://github.com/apache/shenyu>
- 官网地址： <https://shenyu.apache.org/>

### 网关对比一览

| 特性           | Zuul 1.x | Zuul 2.x       | Spring Cloud Gateway      | Kong                          | APISIX           | Shenyu          |
| -------------- | -------- | -------------- | ------------------------- | ----------------------------- | ---------------- | --------------- |
| **IO 模型**    | 同步阻塞 | 异步非阻塞     | 异步非阻塞                | 异步非阻塞                    | 异步非阻塞       | 异步非阻塞      |
| **底层技术**   | Servlet  | Netty          | WebFlux + Netty           | OpenResty (Nginx + Lua)       | OpenResty + etcd | WebFlux + Netty |
| **性能**       | 低       | 高             | 高                        | 很高                          | 很高             | 高              |
| **动态配置**   | 需重启   | 支持           | 支持                      | 支持                          | 支持（热更新）   | 支持            |
| **配置存储**   | 内存     | 内存           | 内存                      | 数据库 / YAML / K8s CRD       | etcd（分布式）   | 内存/数据库     |
| **限流熔断**   | 需集成   | 需集成         | 内置（集成 Resilience4j） | 插件                          | 插件             | 插件            |
| **生态系统**   | Netflix  | Netflix        | Spring Cloud              | CNCF / Kong                   | Apache           | Apache          |
| **运维复杂度** | 低       | 中             | 低                        | 中（DB-less） / 高（DB Mode） | 中               | 中              |
| **学习曲线**   | 平缓     | 平缓           | 平缓                      | 陡峭（Lua）                   | 陡峭（Lua）      | 平缓（Java）    |
| **适用场景**   | 遗留系统 | Netflix 技术栈 | Spring Cloud 生态         | 云原生、多语言                | 云原生、高性能   | Java 生态       |

## 如何选择？

选择 API 网关需要综合考虑技术栈、性能要求、团队能力和运维成本。

| 场景                  | 推荐方案                                                   | 理由                                                              |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| **Spring Cloud 生态** | Spring Cloud Gateway                                       | 与 Spring Boot/Spring Cloud 无缝集成，配置简单                    |
| **高性能 / 云原生**   | APISIX                                                     | 基于 etcd 的热更新、性能优异、云原生架构                          |
| **多语言生态**        | Kong                                                       | 插件丰富、支持多语言开发、社区成熟                                |
| **Netflix 技术栈**    | Zuul 2.x                                                   | 与 Eureka、Ribbon、Hystrix 等组件无缝配合                         |
| **双层架构（推荐）**  | Kong/APISIX（流量网关） + Spring Cloud Gateway（业务网关） | 流量网关处理 SSL、WAF、全局限流；业务网关处理微服务鉴权、参数聚合 |

## 参考

- Kong 插件开发教程[通俗易懂]：<https://cloud.tencent.com/developer/article/2104299>
- API 网关 Kong 实战：<https://xie.infoq.cn/article/10e4dab2de0bdb6f2c3c93da6>
- Spring Cloud Gateway 原理介绍和应用：<https://blog.fintopia.tech/60e27b0e2078082a378ec5ed/>
- 微服务为什么要用到 API 网关？：<https://apisix.apache.org/zh/blog/2023/03/08/why-do-microservices-need-an-api-gateway/>

<!-- @include: @article-footer.snippet.md -->
