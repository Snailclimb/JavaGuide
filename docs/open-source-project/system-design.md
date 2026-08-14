---
title: Java 优质开源框架与基础设施项目
description: Java优质开源框架与基础设施项目推荐，涵盖Web框架、微服务、数据库、消息队列、可观测性和高可用组件。
category: 开源项目
icon: "mdi:palette-swatch-outline"
---

本页收录会作为应用依赖或独立部署的框架、中间件和基础设施。具备完整业务功能的系统放在[实战项目](./practical-project.md)，通用 Java 小型依赖放在[工具类库](./tool-library.md)。

## 基础框架

### Web 框架

- [Spring Boot](https://github.com/spring-projects/spring-boot "spring-boot")：用于构建独立、可运行的 Spring 应用，提供自动配置、内嵌 Web 服务器、生产监控和外部化配置等能力。
- [Solon](https://gitee.com/opensolon/solon)：国产面向全场景的 Java 企业级应用开发框架。
- [Javalin](https://github.com/tipsy/javalin)：一个轻量级的 Web 框架，同时支持 Java 和 Kotlin，被微软、红帽、Uber 等公司使用。
- [Play Framework](https://github.com/playframework/playframework)：面向 Java 和 Scala 的高速 Web 框架。
- [Blade](https://github.com/lets-blade/blade)：一款追求简约、高效的 Web 框架，基于 Java8 + Netty4。

### 微服务/云原生

- [Armeria](https://github.com/line/armeria)：适合构建微服务，支持 [gRPC](https://grpc.io/)、[Thrift](https://thrift.apache.org/)、[Kotlin](https://kotlinlang.org/)、[Retrofit](https://square.github.io/retrofit/)、[Spring Boot](https://spring.io/projects/spring-boot) 和 [Dropwizard](https://www.dropwizard.io/) 等技术。
- [Quarkus](https://github.com/quarkusio/quarkus)：面向云原生和容器环境的 Java 框架，支持快速启动、较低内存占用和原生镜像。
- [Helidon](https://github.com/helidon-io/helidon)：一组用于编写微服务的 Java 库，支持 Helidon MP 和 Helidon SE 两种编程模型。

### API 文档

- [Swagger Core](https://github.com/swagger-api/swagger-core)：Swagger 的 Java 实现，用于通过注解和模型生成 OpenAPI 文档。
- [springdoc-openapi](https://github.com/springdoc/springdoc-openapi)：为 Spring Boot 应用生成 OpenAPI 3 文档，并提供 Swagger UI 集成。使用前要确认版本与当前 Spring Boot 版本匹配。

### Bean 映射

- [MapStruct](https://github.com/mapstruct/mapstruct)（推荐）：符合 JSR 269 规范的 Java 注解处理器，在编译阶段生成类型安全的 Bean 映射代码，不依赖运行时反射。
- [MapStruct Plus](https://github.com/linpeilie/mapstruct-plus)：MapStruct 增强版本，支持自动生成 Mapper 接口。

### 其他

- [Guice](https://github.com/google/guice)：Google 开源的一个轻量级依赖注入框架，相当于一个功能极简化的轻量级 Spring Boot。在某些情况下非常实用，就比如说我们的项目只需要使用依赖注入，不需要 AOP 等功能特性。
- [Spring Batch](https://github.com/spring-projects/spring-batch)：面向大批量记录读取、处理和写入的批处理框架。它负责作业与步骤的执行模型，不是 Quartz、XXL-JOB 这类调度框架。

## 认证授权

### 权限认证

- [Sa-Token](https://github.com/dromara/sa-token)：轻量级 Java 权限认证框架，内置认证授权、单点登录、踢人下线和自动续签等功能，API 风格比 Spring Security 更直接。
- [Spring Security](https://github.com/spring-projects/spring-security)：Spring 官方安全框架，能够用于身份验证、授权、加密和会话管理，是目前使用最广泛的 Java 安全框架。
- [Shiro](https://github.com/apache/shiro)：Java 安全框架，功能和 Spring Security 类似，但使用起来更简单。

### 第三方登录

- [WxJava](https://github.com/Wechat-Group/WxJava)：微信开发 Java SDK，支持微信支付、开放平台、小程序、企业微信和公众号等场景。
- [pac4j](https://github.com/pac4j/pac4j)：Java 安全引擎，支持 OpenID Connect、OAuth、SAML、CAS、LDAP 和 JWT 等协议，可集成多种 Web 框架。

### 单点登录（SSO）

- [CAS](https://github.com/apereo/cas)：企业多语言网络单点登录解决方案。
- [MaxKey](https://gitee.com/dromara/MaxKey)：单点登录认证系统，提供安全、标准和开放的用户身份管理(IDM)、身份认证(AM)、单点登录(SSO)、RBAC 权限管理和资源管理等。
- [Keycloak](https://github.com/keycloak/keycloak)：免费、开源身份认证和访问管理系统，支持高度可配置的单点登录功能。

## 网络通讯

- [Netty](https://github.com/netty/netty)：基于 NIO 的异步事件驱动网络框架，用于开发 TCP、UDP 和 HTTP 等网络应用。
- [Retrofit](https://github.com/square/retrofit)：适用于 Android 和 Java 的类型安全的 HTTP 客户端。Retrofit 的 HTTP 请求使用的是 [OkHttp](https://square.github.io/okhttp/) 库（一款被广泛使用网络框架）。
- [Forest](https://gitee.com/dromara/forest)：声明式 Java HTTP 客户端框架，通过接口和注解调用第三方 REST API，可作为 Retrofit 和 OpenFeign 之外的选择。
- [OpenFeign](https://github.com/OpenFeign/feign)：声明式 Java HTTP 客户端，通过接口和注解描述远程调用，适合服务间 HTTP API 调用。
- [gRPC-Java](https://github.com/grpc/grpc-java)：gRPC 的 Java 实现，基于 HTTP/2 和 Protocol Buffers，适合需要强类型接口和流式通信的 RPC 场景。

## 数据库

### 数据库连接池

- [Druid](https://github.com/alibaba/druid)：带监控能力的 JDBC 数据库连接池。
- [HikariCP](https://github.com/brettwooldridge/HikariCP)：轻量、高性能的 JDBC 连接池，也是 Spring Boot 的默认连接池实现。

### 数据库框架

- [MyBatis-Plus](https://github.com/baomidou/mybatis-plus)：[MyBatis](https://mybatis.org/mybatis-3/) 增强工具，提供通用 CRUD、条件构造器、分页和代码生成等能力。
- [MyBatis-Flex](https://gitee.com/mybatis-flex/mybatis-flex)：MyBatis 增强框架，支持 CRUD、分页查询、多表查询和批量操作。
- [jOOQ](https://github.com/jOOQ/jOOQ)：用 Java 编写 SQL 的最佳方式。
- [Redisson](https://github.com/redisson/redisson "redisson")：Redisson 是一款架设在 Redis 基础之上的 Java 驻内存数据网格 (In-Memory Data Grid)，它充分利用了 Redis 键值数据库的优势，为 Java 开发者提供了一系列具有分布式特性的常用工具类。例如，分布式 Java 对象（`Set`，`SortedSet`，`Map`，`List`，`Queue`，`Deque` 等）、分布式锁等。详细介绍请看：[Redisson 项目介绍](https://github.com/redisson/redisson/wiki/Redisson%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D)。

### 数据同步

- [Canal](https://github.com/alibaba/canal "canal")：基于 MySQL Binlog 解析提供增量数据订阅和消费，常用于缓存同步、数据异构和变更事件处理。
- [DataX](https://github.com/alibaba/DataX "DataX")：DataX 是阿里巴巴集团内被广泛使用的离线数据同步工具/平台，实现包括 MySQL、Oracle、SqlServer、Postgre、HDFS、Hive、ADS、HBase、TableStore(OTS)、MaxCompute(ODPS)、DRDS 等各种异构数据源之间高效的数据同步功能。

### 时序数据库

- [IoTDB](https://github.com/apache/iotdb)：一款 Java 语言编写的国产时序数据库，为用户提供数据收集、存储和分析等服务。与 Hadoop、Spark 和可视化工具(如 Grafana)无缝集成，满足了工业 IoT 领域中海量数据存储、高吞吐量数据写入和复杂数据查询分析的需求。
- [QuestDB](https://github.com/questdb/questdb)：面向高吞吐写入和低延迟 SQL 查询的开源时序数据库，提供 PostgreSQL wire protocol、REST 和 InfluxDB Line Protocol 等接入方式。

## 搜索引擎

- [Elasticsearch](https://github.com/elastic/elasticsearch "elasticsearch") （推荐）：开源，分布式，RESTful 搜索引擎。
- [Meilisearch](https://github.com/meilisearch/meilisearch)：一个功能强大、快速、开源、易于使用和部署的搜索引擎，支持中文搜索（不需要添加额外的配置）。
- [Solr](https://github.com/apache/solr)：构建在 Apache Lucene 之上的分布式搜索平台。

## 测试

### 测试框架

- [JUnit 5](https://github.com/junit-team/junit5)：Java 和 JVM 生态常用的单元测试框架。
- [Mockito](https://github.com/mockito/mockito)：Java Mock 测试框架，可用测试替身隔离难以构造或依赖外部系统的对象。
- [AssertJ](https://github.com/assertj/assertj)：面向 Java 和 JVM 的流式断言库，适合提高测试断言的可读性和错误信息质量。
- [WireMock](https://github.com/tomakehurst/wiremock)：模拟 HTTP 服务的工具（Mock your APIs）。
- [Testcontainers](https://github.com/testcontainers/testcontainers-java)：为集成测试启动一次性容器，支持数据库、消息队列、浏览器和其他可容器化的依赖。

相关阅读：

- [The Practical Test Pyramid- Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) (很赞的一篇文章，不过是英文的)

### 测试平台

- [MeterSphere](https://github.com/metersphere/metersphere)：开源持续测试平台，覆盖测试管理、接口测试、性能测试和团队协作等功能。

### API 调试

- [Insomnia](https://github.com/Kong/insomnia)：跨平台 API 客户端，支持 REST、GraphQL、WebSocket、SSE 和 gRPC，并提供本地与 Git 等数据存储方式。
- [Hoppscotch](https://github.com/hoppscotch/hoppscotch)：开源 API 测试工具，定位是 Postman、Insomnia 等产品的开源替代品。
- [Restful Fast Request](https://github.com/dromara/fast-request)：IDEA 版 Postman，API 调试工具 + API 管理工具 + API 搜索工具。

## 任务调度

- [Quartz](https://github.com/quartz-scheduler/quartz)：一个很火的开源任务调度框架，Java 定时任务领域的老大哥或者说参考标准， 很多其他任务调度框架都是基于 `quartz` 开发的，比如当当网的`elastic-job`就是基于`quartz`二次开发之后的分布式调度解决方案
- [XXL-JOB](https://github.com/xuxueli/xxl-job)：分布式任务调度平台，提供任务管理、调度日志、故障转移和执行器扩展等能力。
- [ElasticJob](https://github.com/apache/shardingsphere-elasticjob)：基于 Quartz 和 ZooKeeper 的分布式调度解决方案，提供分片、弹性扩容和失效转移等能力。
- [DolphinScheduler](https://github.com/apache/dolphinscheduler)：分布式、易扩展的可视化工作流任务调度平台，用于编排具有复杂依赖关系的任务。

## 工作流

1. [Flowable](https://github.com/flowable/flowable-engine) ：Activiti5 的一个分支发展而来，功能丰富，在 Activiti 的基础上，引入了更多高级功能，如更强大的 CMMN（案例管理模型与符号）、DMN（决策模型与符号）支持，以及更灵活的集成选项。
2. [Activiti](https://github.com/Activiti/Activiti)：功能扩展相对保守，适合需要稳定 BPMN 2.0 工作流引擎的传统企业应用。
3. [Warm-Flow](https://gitee.com/dromara/warm-flow)：国产开源工作流引擎，其特点简洁轻量但又不简单，五脏俱全，组件独立，可扩展。
4. [FlowLong](https://gitee.com/aizuda/flowlong)：国产开源工作流引擎，专门中国特色流程审批打造。

## 分布式

### API 网关

- [Kong](https://github.com/Kong/kong "kong")：Kong 是一个云原生、快速的、可伸缩的分布式微服务抽象层(也称为 API 网关、API 中间件或在某些情况下称为服务网格)。2015 年作为开源项目发布，其核心价值是高性能和可扩展性。
- [ShenYu](https://github.com/apache/shenyu)：适用于微服务场景的可扩展、高性能、响应式 API 网关。
- [Spring Cloud Gateway](https://github.com/spring-cloud/spring-cloud-gateway)：Spring Cloud 的 API 网关，提供路由、过滤器、限流和服务发现集成等能力。
- [Zuul](https://github.com/Netflix/zuul)：Netflix 开源的 L7 应用网关，提供动态路由、监控、弹性和安全等能力。

### 配置中心

- [Apollo](https://github.com/ctripcorp/apollo "apollo")（推荐）：Apollo（阿波罗）是携程框架部门研发的分布式配置中心，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。
- [Nacos](https://github.com/alibaba/nacos)（推荐）：Nacos 是 Spring Cloud Alibaba 提供的服务注册发现组件，类似于 Consul、Eureka。并且，提供了分布式配置管理功能。
- [Spring Cloud Config](https://github.com/spring-cloud/spring-cloud-config)：Spring Cloud Config 是 Spring Cloud 家族中最早的配置中心，虽然后来又发布了 Consul 可以代替配置中心功能，但是 Config 依然适用于 Spring Cloud 项目，通过简单的配置即可实现功能。
- [Consul](https://github.com/hashicorp/consul)：Consul 是 HashiCorp 公司推出的开源软件，提供了微服务系统中的服务治理、配置中心、控制总线等功能。这些功能中的每一个都可以根据需要单独使用，也可以一起使用以构建全方位的服务网格，总之 Consul 提供了一种完整的服务网格解决方案。

### 链路追踪

- [SkyWalking](https://github.com/apache/skywalking "skywalking")：面向分布式、微服务和云原生系统的应用性能监控与可观测性平台。
- [OpenTelemetry Java](https://github.com/open-telemetry/opentelemetry-java)：OpenTelemetry 的 Java API 与 SDK，用于生成和导出 Trace、Metric 和 Log 遥测数据。它负责埋点与采集，不等同于后端存储和可视化平台。

### 分布式锁

- [Redisson](https://github.com/redisson/redisson "redisson")：Redisson 在分布式锁方面提供全面且强大的支持，超越了简单的 Redis 锁实现。
- [ShedLock](https://github.com/lukas-krecan/ShedLock)：为分布式部署下的定时任务加锁，避免同一任务在多个实例上同时执行。它只解决定时任务互斥，不是通用分布式锁方案。

## 高性能

### 多线程

- [Dynamic Tp](https://github.com/dromara/dynamic-tp)：轻量级动态线程池，内置监控告警功能，集成三方中间件线程池管理，基于主流配置中心（已支持 Nacos、Apollo，Zookeeper、Consul、Etcd，可通过 SPI 自定义实现）。

### 缓存

#### 本地缓存

- [Caffeine](https://github.com/ben-manes/caffeine)：高性能 Java 本地缓存库，支持基于容量、时间和引用的淘汰策略。
- [Guava](https://github.com/google/guava)：Google Java 核心库，内置了比较完善的本地缓存实现。

#### 分布式缓存

- [Redis](https://github.com/redis/redis)：一个使用 C 语言开发的内存数据库，分布式缓存首选。
- [Dragonfly](https://github.com/dragonflydb/dragonfly)：兼容 Redis 和 Memcached API 的内存数据库。迁移前仍需核对命令覆盖、持久化、集群能力和客户端行为，不能只依据协议兼容声明直接替换。

#### 多级缓存

- [JetCache](https://github.com/alibaba/jetcache)：阿里开源的缓存框架，支持多级缓存、分布式缓存自动刷新、 TTL 等功能。

### 消息队列

**分布式队列**：

- [RocketMQ](https://github.com/apache/rocketmq "RocketMQ")：阿里巴巴开源的一款高性能、高吞吐量的分布式消息中间件。
- [Kafka](https://github.com/apache/kafka "Kafka"): Kafka 是一种分布式的，基于发布 / 订阅的消息系统。
- [RabbitMQ](https://github.com/rabbitmq/rabbitmq-server)：使用 Erlang 开发、实现 AMQP 协议的消息队列。

### 读写分离和分库分表

- [ShardingSphere](https://github.com/apache/shardingsphere)：ShardingSphere 是一套开源的分布式数据库中间件解决方案组成的生态圈，它由 Sharding-JDBC、Sharding-Proxy 和 Sharding-Sidecar（计划中）这 3 款相互独立的产品组成。

## 高可用

### 限流

分布式限流：

- [Sentinel](https://github.com/alibaba/Sentinel)（推荐）：面向分布式服务架构的高可用防护组件，主要以流量为切入点，从流量控制、熔断降级、系统自适应保护等多个维度来帮助用户保障微服务的稳定性。

单机限流：

- [Bucket4j](https://github.com/vladimir-bukhtoyarov/bucket4j)：一个非常不错的基于令牌/漏桶算法的限流库。
- [Resilience4j](https://github.com/resilience4j/resilience4j)：一个轻量级容错组件，提供熔断、限流、重试和隔离等能力。

### 监控

- [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin)：管理和监控 Spring Boot 应用程序。
- [Metrics](https://github.com/dropwizard/metrics)：捕获 JVM 和应用程序级别的指标。所以你知道发生了什么事。

### 日志

- ELK：Elasticsearch、Logstash 和 Kibana 的组合。
- Elastic Stack：在 ELK 的基础上加入 Beats 等数据采集组件。
- EFK：用 [Fluentd](https://github.com/fluent/fluentd) 替代 Logstash 的日志方案。

## 字节码操作

- [ASM](https://asm.ow2.io/)：通用 Java 字节码操作和分析框架。它可用于直接以二进制形式修改现有类或动态生成类。
- [Byte Buddy](https://github.com/raphw/byte-buddy)：Java 字节码生成和操作库，可在运行时创建和修改 Java 类，不需要调用 Java 编译器。
- [Javassist](https://github.com/jboss-javassist/javassist)：动态编辑 Java 字节码的类库。
- [Recaf](https://github.com/Col-E/Recaf)：现代 Java 字节码编辑器，基于 ASM（Java 字节码操作框架） 来修改字节码，可简化编辑已编译 Java 应用程序的过程。
