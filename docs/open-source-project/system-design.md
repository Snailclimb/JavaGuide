---
title: Java 优质开源系统设计项目
category: 开源项目
icon: "xitongsheji"
---

## 基础框架

### Web 框架

- [Spring Boot](https://github.com/spring-projects/spring-boot "spring-boot")：Spring Boot 可以轻松创建独立的生产级基于 Spring 的应用程序，内置 web 服务器让你可以像运行普通 Java 程序一样运行项 目。另外，大部分 Spring Boot 项目只需要少量的配置即可，这有别于 Spring 的重配置。
- [SOFABoot](https://github.com/sofastack/sofa-boot)：SOFABoot 基于 Spring Boot ，不过在其基础上增加了 Readiness Check，类隔离，日志空间隔离等等能力。 配套提供的还有：SOFARPC（RPC 框架）、SOFABolt（基于 Netty 的远程通信框架）、SOFARegistry（注册中心）...详情请参考：[SOFAStack](https://github.com/sofastack) 。
- [Solon](https://gitee.com/opensolon/solon)：国产面向全场景的 Java 企业级应用开发框架。
- [Javalin](https://github.com/tipsy/javalin)：一个轻量级的 Web 框架，同时支持 Java 和 Kotlin，被微软、红帽、Uber 等公司使用。
- [Play Framework](https://github.com/playframework/playframework)：面向 Java 和 Scala 的高速 Web 框架。
- [Blade](https://github.com/lets-blade/blade)：一款追求简约、高效的 Web 框架，基于 Java8 + Netty4。

### 微服务/云原生

- [Armeria](https://github.com/line/armeria)：适合任何情况的微服务框架。你可以用你喜欢的技术构建任何类型的微服务，包括[gRPC](https://grpc.io/)、 [Thrift](https://thrift.apache.org/)、[Kotlin](https://kotlinlang.org/)、 [Retrofit](https://square.github.io/retrofit/)、[Reactive Streams](https://www.reactive-streams.org/)、 [Spring Boot](https://spring.io/projects/spring-boot)和[Dropwizard](https://www.dropwizard.io/)
- [Quarkus](https://github.com/quarkusio/quarkus) : 用于编写 Java 应用程序的云原生和容器优先的框架。
- [Helidon](https://github.com/helidon-io/helidon)：一组用于编写微服务的 Java 库，支持 Helidon MP 和 Helidon SE 两种编程模型。

### API 文档

- [Swagger](https://swagger.io/) ：较主流的 RESTful 风格的 API 文档工具，提供了一套工具和规范，让开发人员能够更轻松地创建和维护可读性强、易于使用和交互的 API 文档。
- [Knife4j](https://doc.xiaominfo.com/)：集 Swagger2 和 OpenAPI3 为一体的增强解决方案。

### Bean 映射

- [MapStruct](https://github.com/mapstruct/mapstruct)（推荐）：满足 JSR269 规范的一个 Java 注解处理器，用于为 Java Bean 生成类型安全且高性能的映射。它基于编译阶段生成 get/set 代码，此实现过程中没有反射，不会造成额外的性能损失。
- [MapStruct Plus](https://github.com/linpeilie/mapstruct-plus)：MapStruct 增强版本，支持自动生成 Mapper 接口。
- [JMapper](https://github.com/jmapper-framework/jmapper-core) : 一个高性能且易于使用的 Bean 映射框架。

### 其他

- [Guice](https://github.com/google/guice)：Google 开源的一个轻量级依赖注入框架，相当于一个功能极简化的轻量级 Spring Boot。在某些情况下非常实用，就比如说我们的项目只需要使用依赖注入，不需要 AOP 等功能特性。
- [Spring Batch](https://github.com/spring-projects/spring-batch) : Spring Batch 是一个轻量级但功能又十分全面的批处理框架，主要用于批处理场景比如从数据库、文件或队列中读取大量记录。不过，需要注意的是：Spring Batch 不是调度框架。商业和开源领域都有许多优秀的企业调度框架比如 Quartz、XXL-JOB、Elastic-Job。它旨在与调度程序一起工作，而不是取代调度程序。

## 认证授权

### 权限认证

- [Sa-Token](https://github.com/dromara/sa-token)：轻量级 Java 权限认证框架。支持认证授权、单点登录、踢人下线、自动续签等功能。相比于 Spring Security 和 Shiro 来说，Sa-Token 内置的开箱即用的功能更多，使用也更简单。
- [Spring Security](https://github.com/spring-projects/spring-security)：Spring 官方安全框架，能够用于身份验证、授权、加密和会话管理，是目前使用最广泛的 Java 安全框架。
- [Shiro](https://github.com/apache/shiro)：Java 安全框架，功能和 Spring Security 类似，但使用起来更简单。

### 第三方登录

- [WxJava](https://github.com/Wechat-Group/WxJava) : WxJava （微信开发 Java SDK），支持包括微信支付、开放平台、小程序、企业微信/企业号和公众号等的后端开发。
- [JustAuth](https://github.com/justauth/JustAuth)：小而全而美的第三方登录开源组件。目前已经集成了诸如：GitHub、Gitee、支付宝、新浪微博、微信、Google、Facebook、Twitter、StackOverflow 等国内外数十家第三方平台。

### 单点登录（SSO）

- [CAS](https://github.com/apereo/cas)：企业多语言网络单点登录解决方案。
- [MaxKey](https://gitee.com/dromara/MaxKey)：单点登录认证系统，提供安全、标准和开放的用户身份管理(IDM)、身份认证(AM)、单点登录(SSO)、RBAC 权限管理和资源管理等。
- [Keycloak](https://github.com/keycloak/keycloak)：免费、开源身份认证和访问管理系统，支持高度可配置的单点登录功能。

## 网络通讯

- [Netty](https://github.com/netty/netty) : 一个基于 NIO 的 client-server(客户端服务器)框架，使用它可以快速简单地开发网络应用程序。
- [Retrofit](https://github.com/square/retrofit)：适用于 Android 和 Java 的类型安全的 HTTP 客户端。Retrofit 的 HTTP 请求使用的是 [OkHttp](https://square.github.io/okhttp/) 库（一款被广泛使用网络框架）。
- [Forest](https://gitee.com/dromara/forest)：轻量级 HTTP 客户端 API 框架，让 Java 发送 HTTP/HTTPS 请求不再难。它比 OkHttp 和 HttpClient 更高层，是封装调用第三方 restful api client 接口的好帮手，是 retrofit 和 feign 之外另一个选择。
- [netty-websocket-spring-boot-starter](https://github.com/YeautyYE/netty-websocket-spring-boot-starter) :帮助你在 Spring Boot 中使用 Netty 来开发 WebSocket 服务器，并像 spring-websocket 的注解开发一样简单。

## 数据库

### 数据库连接池

- [Druid](https://github.com/alibaba/druid) : 阿里巴巴数据库事业部出品，为监控而生的数据库连接池。
- [HikariCP](https://github.com/brettwooldridge/HikariCP) : 一个可靠的高性能 JDBC 连接池。Springboot 2.0 选择 HikariCP 作为默认数据库连接池。

### 数据库框架

- [MyBatis-Plus](https://github.com/baomidou/mybatis-plus) : [MyBatis](http://www.mybatis.org/mybatis-3/) 增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。
- [MyBatis-Flex](https://gitee.com/mybatis-flex/mybatis-flex)：一个优雅的 MyBatis 增强框架，无其他任何第三方依赖，支持 CRUD、分页查询、多表查询、批量操作。
- [jOOQ](https://github.com/jOOQ/jOOQ)：用 Java 编写 SQL 的最佳方式。
- [Redisson](https://github.com/redisson/redisson "redisson")：Redisson 是一款架设在 Redis 基础之上的 Java 驻内存数据网格 (In-Memory Data Grid)，它充分利用了 Redis 键值数据库的优势，为 Java 开发者提供了一系列具有分布式特性的常用工具类。例如，分布式 Java 对象（`Set`，`SortedSet`，`Map`，`List`，`Queue`，`Deque` 等）、分布式锁等。详细介绍请看：[Redisson 项目介绍](https://github.com/redisson/redisson/wiki/Redisson%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D "Redisson项目介绍")。

### 数据同步

- [Canal](https://github.com/alibaba/canal "canal") [kə'næl] : Canal 译意为水道/管道/沟渠，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费。
- [DataX](https://github.com/alibaba/DataX "DataX")：DataX 是阿里巴巴集团内被广泛使用的离线数据同步工具/平台，实现包括 MySQL、Oracle、SqlServer、Postgre、HDFS、Hive、ADS、HBase、TableStore(OTS)、MaxCompute(ODPS)、DRDS 等各种异构数据源之间高效的数据同步功能。相关项目：[DataX-Web](https://github.com/WeiYe-Jing/datax-web) （DataX 集成可视化页面，选择数据源即可一键生成数据同步任务）。

其他：[Flinkx](https://github.com/DTStack/flinkx) （基于 Flink 的分布式数据同步工具）。

### 时序数据库

- [IoTDB](https://github.com/apache/iotdb)：一款 Java 语言编写的国产时序数据库，为用户提供数据收集、存储和分析等服务。与 Hadoop、Spark 和可视化工具(如 Grafana)无缝集成，满足了工业 IoT 领域中海量数据存储、高吞吐量数据写入和复杂数据查询分析的需求。
- [KairosDB](https://github.com/kairosdb/kairosdb)：一个基于 Cassandra 的快速分布式可扩展时间序列数据库。

## 搜索引擎

- [Elasticsearch](https://github.com/elastic/elasticsearch "elasticsearch") （推荐）：开源，分布式，RESTful 搜索引擎。
- [Meilisearch](https://github.com/meilisearch/meilisearch)：一个功能强大、快速、开源、易于使用和部署的搜索引擎，支持中文搜索（不需要添加额外的配置）。
- [Solr](https://lucene.apache.org/solr/) : Solr（读作“solar”）是 Apache Lucene 项目的开源企业搜索平台。
- [Easy-ES](https://gitee.com/dromara/easy-es)：傻瓜级 ElasticSearch 搜索引擎 ORM 框架。

## 测试

### 测试框架

- [JUnit](http://junit.org/) : Java 测试框架。
- [Mockito](https://github.com/mockito/mockito)：Mockito 是一个模拟测试框架，可以让你用优雅，简洁的接口写出漂亮的单元测试。（对那些不容易构建的对象用一个虚拟对象来代替，使其在调试期间用来作为真实对象的替代品）
- [PowerMock](https://github.com/powermock/powermock)：编写单元测试仅靠 Mockito 是不够。因为 Mockito 无法 mock 私有方法、final 方法及静态方法等。PowerMock 这个 framework，主要是为了扩展其他 mock 框架，如 Mockito、EasyMock。它使用一个自定义的类加载器，纂改字节码，突破 Mockito 无法 mock 静态方法、构造方法、final 类、final 方法以及私有方法的限制。
- [WireMock](https://github.com/tomakehurst/wiremock)：模拟 HTTP 服务的工具（Mock your APIs）。
- [Testcontainers](https://github.com/testcontainers/testcontainers-java)：一个支持 JUnit 的测试工具库，提供轻量级的且一次性的常见数据库测试支持、Selenium Web 浏览器或者其他任何可以在 Docker 容器中运行的实例支持。

相关阅读：

- [The Practical Test Pyramid- Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) (很赞的一篇文章，不过是英文的)
- [浅谈测试之 PowerMock](https://juejin.im/post/6844903982058618894)

### 测试平台

- [MeterSphere](https://github.com/metersphere/metersphere) : 一站式开源持续测试平台，涵盖测试跟踪、接口测试、性能测试、团队协作等功能，全面兼容 JMeter、Postman、Swagger 等开源、主流标准。
- [Apifox](https://www.apifox.cn/)：API 文档、API 调试、API Mock、API 自动化测试。

### API 调试

- [Reqable](https://reqable.com/zh-CN/)：新一代开源 API 开发工具。Reqable = Fiddler + Charles + Postman, 让 API 调试更快。
- [Insomnia](https://insomnia.rest/) :像人类而不是机器人一样调试 API。我平时经常用的一款 API 开发工具，界面美观且轻量，总之很喜欢。
- [RapidAPI](https://paw.cloud/)：一款功能齐全的 HTTP 客户端，但仅支持 Mac。
- [Postcat](https://github.com/Postcatlab/postcat)：一个可扩展的开源 API 工具平台。
- [Postman](https://www.getpostman.com/)：开发者最常用的 API 测试工具之一。
- [Hoppscotch](https://github.com/liyasthomas/postwoman "postwoman")（原 Postwoman）：开源 API 测试工具。官方定位是 Postman、Insomnia 等产品的开源替代品。
- [Restful Fast Request](https://gitee.com/dromara/fast-request)：IDEA 版 Postman，API 调试工具 + API 管理工具 + API 搜索工具。

## 任务调度

- [Quartz](https://github.com/quartz-scheduler/quartz)：一个很火的开源任务调度框架，Java 定时任务领域的老大哥或者说参考标准， 很多其他任务调度框架都是基于 `quartz` 开发的，比如当当网的`elastic-job`就是基于`quartz`二次开发之后的分布式调度解决方案
- [XXL-JOB](https://github.com/xuxueli/xxl-job) :XXL-JOB 是一个分布式任务调度平台，其核心设计目标是开发迅速、学习简单、轻量级、易扩展。现已开放源代码并接入多家公司线上产品线，开箱即用。
- [Elastic-Job](http://elasticjob.io/index_zh.html)：Elastic-Job 是当当网开源的一个基于 Quartz 和 Zookeeper 的分布式调度解决方案，由两个相互独立的子项目 Elastic-Job-Lite 和 Elastic-Job-Cloud 组成，一般我们只要使用 Elastic-Job-Lite 就好。
- [EasyScheduler](https://github.com/analysys/EasyScheduler "EasyScheduler") （已经更名为 DolphinScheduler，已经成为 Apache 孵化器项目）：分布式易扩展的可视化工作流任务调度平台，主要解决“复杂任务依赖但无法直接监控任务健康状态”的问题。
- [PowerJob](https://gitee.com/KFCFans/PowerJob)：新一代分布式任务调度与计算框架，支持 CRON、API、固定频率、固定延迟等调度策略，提供工作流来编排任务解决依赖关系，使用简单，功能强大，文档齐全，欢迎各位接入使用！<http://www.powerjob.tech/> 。

## 工作流

1. [Flowable](https://github.com/flowable/flowable-engine) ：Activiti5 的一个分支发展而来，功能丰富，在 Activiti 的基础上，引入了更多高级功能，如更强大的 CMMN（案例管理模型与符号）、DMN（决策模型与符号）支持，以及更灵活的集成选项。
2. [Activiti](https://github.com/Activiti/Activiti)：功能扩展相对保守，适合需要稳定 BPMN 2.0 工作流引擎的传统企业应用。
3. [Warm-Flow](https://gitee.com/dromara/warm-flow)：国产开源工作流引擎，其特点简洁轻量但又不简单，五脏俱全，组件独立，可扩展。
4. [FlowLong](https://gitee.com/aizuda/flowlong)：国产开源工作流引擎，专门中国特色流程审批打造。

## 分布式

### API 网关

- [Kong](https://github.com/Kong/kong "kong")：Kong 是一个云原生、快速的、可伸缩的分布式微服务抽象层(也称为 API 网关、API 中间件或在某些情况下称为服务网格)。2015 年作为开源项目发布，其核心价值是高性能和可扩展性。
- [ShenYu](https://github.com/Dromara/soul "soul")：适用于所有微服务的可伸缩、高性能、响应性 API 网关解决方案。
- [Spring Cloud Gateway](https://github.com/spring-cloud/spring-cloud-gateway) : 基于 Spring Framework 5.x 和 Spring Boot 2.x 构建的高性能网关。
- [Zuul](https://github.com/Netflix/zuul) : Zuul 是一个 L7 应用程序网关，它提供了动态路由，监视，弹性，安全性等功能。

### 配置中心

- [Apollo](https://github.com/ctripcorp/apollo "apollo")（推荐）：Apollo（阿波罗）是携程框架部门研发的分布式配置中心，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。
- [Nacos](https://github.com/alibaba/nacos)（推荐）：Nacos 是 Spring Cloud Alibaba 提供的服务注册发现组件，类似于 Consul、Eureka。并且，提供了分布式配置管理功能。
- [Spring Cloud Config](https://github.com/spring-cloud/spring-cloud-config)：Spring Cloud Config 是 Spring Cloud 家族中最早的配置中心，虽然后来又发布了 Consul 可以代替配置中心功能，但是 Config 依然适用于 Spring Cloud 项目，通过简单的配置即可实现功能。
- [Consul](https://github.com/hashicorp/consul)：Consul 是 HashiCorp 公司推出的开源软件，提供了微服务系统中的服务治理、配置中心、控制总线等功能。这些功能中的每一个都可以根据需要单独使用，也可以一起使用以构建全方位的服务网格，总之 Consul 提供了一种完整的服务网格解决方案。

### 链路追踪

- [Skywalking](https://github.com/apache/skywalking "skywalking") : 针对分布式系统的应用性能监控，尤其是针对微服务、云原生和面向容器的分布式系统架构。
- [Zipkin](https://github.com/openzipkin/zipkin "zipkin")：Zipkin 是一个分布式跟踪系统。它有助于收集解决服务体系结构中的延迟问题所需的时序数据。功能包括该数据的收集和查找。
- [CAT](https://github.com/dianping/cat "cat")：CAT 作为服务端项目基础组件，提供了 Java, C/C++, Node.js, Python, Go 等多语言客户端，已经在美团点评的基础架构中间件框架（MVC 框架，RPC 框架，数据库框架，缓存框架等，消息队列，配置系统等）深度集成，为美团点评各业务线提供系统丰富的性能指标、健康状况、实时告警等。

相关阅读：[Skywalking 官网对于主流开源链路追踪系统的对比](https://skywalking.apache.org/zh/blog/2019-03-29-introduction-of-skywalking-and-simple-practice.html)

### 分布式锁

- [Lock4j](https://gitee.com/baomidou/lock4j)：支持 Redisson、ZooKeeper 等不同方案的高性能分布式锁。
- [Redisson](https://github.com/redisson/redisson "redisson")：Redisson 在分布式锁方面提供全面且强大的支持，超越了简单的 Redis 锁实现。

## 高性能

### 多线程

- [Hippo4j](https://github.com/opengoofy/hippo4j)：异步线程池框架，支持线程池动态变更&监控&报警，无需修改代码轻松引入。支持多种使用模式，轻松引入，致力于提高系统运行保障能力。
- [Dynamic Tp](https://github.com/dromara/dynamic-tp)：轻量级动态线程池，内置监控告警功能，集成三方中间件线程池管理，基于主流配置中心（已支持 Nacos、Apollo，Zookeeper、Consul、Etcd，可通过 SPI 自定义实现）。
- [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool) : 京东的一位大佬开源的多线程工具库，里面大量使用到了 `CompletableFuture` ，可以解决任意的多线程并行、串行、阻塞、依赖、回调的并行框架，可以任意组合各线程的执行顺序，带全链路执行结果回调。

### 缓存

#### 本地缓存

- [Caffeine](https://github.com/ben-manes/caffeine) : 一款强大的本地缓存解决方案，性能非常强大。
- [Guava](https://github.com/google/guava)：Google Java 核心库，内置了比较完善的本地缓存实现。
- [OHC](https://github.com/snazy/ohc) ：Java 堆外缓存解决方案（项目从 2021 年开始就不再进行维护了）。

#### 分布式缓存

- [Redis](https://github.com/redis/redis)：一个使用 C 语言开发的内存数据库，分布式缓存首选。
- [Dragonfly](https://github.com/dragonflydb/dragonfly)：一种针对现代应用程序负荷需求而构建的内存数据库，完全兼容 Redis 和 Memcached 的 API，迁移时无需修改任何代码，号称全世界最快的内存数据库。
- [KeyDB](https://github.com/Snapchat/KeyDB)： Redis 的一个高性能分支，专注于多线程、内存效率和高吞吐量。

#### 多级缓存

- [J2Cache](https://gitee.com/ld/J2Cache)：基于本地内存和 Redis 的两级 Java 缓存框架。
- [JetCache](https://github.com/alibaba/jetcache)：阿里开源的缓存框架，支持多级缓存、分布式缓存自动刷新、 TTL 等功能。

### 消息队列

**分布式队列**：

- [RocketMQ](https://github.com/apache/rocketmq "RocketMQ")：阿里巴巴开源的一款高性能、高吞吐量的分布式消息中间件。
- [Kafka](https://github.com/apache/kafka "Kafka"): Kafka 是一种分布式的，基于发布 / 订阅的消息系统。
- [RabbitMQ](https://github.com/rabbitmq "RabbitMQ") :由 erlang 开发的基于 AMQP（Advanced Message Queue 高级消息队列协议）协议实现的消息队列。

**内存队列**：

- [Disruptor](https://github.com/LMAX-Exchange/disruptor)：Disruptor 是英国外汇交易公司 LMAX 开发的一个高性能队列，研发的初衷是解决内存队列的延迟问题（在性能测试中发现竟然与 I/O 操作处于同样的数量级）。

### 读写分离和分库分表

- [ShardingSphere](https://github.com/apache/shardingsphere)：ShardingSphere 是一套开源的分布式数据库中间件解决方案组成的生态圈，它由 Sharding-JDBC、Sharding-Proxy 和 Sharding-Sidecar（计划中）这 3 款相互独立的产品组成。
- [MyCat](https://github.com/MyCatApache/MyCat2) : MyCat 是数据库分库分表的中间件，MyCat 使用最多的两个功能是：读写分离和分库分表。MyCat 是一些社区爱好者在阿里 Cobar 的基础上进行二次开发，解决了 Cobar 当时存 在的一些问题，并且加入了许多新的功能在其中。
- [dynamic-datasource-spring-boot-starter](https://github.com/baomidou/dynamic-datasource-spring-boot-starter)：一个基于 Spring Boot 的快速集成多数据源的启动器，支持多数据源、动态数据源、主从分离、读写分离和分布式事务。

## 高可用

### 限流

分布式限流：

- [Sentinel](https://github.com/alibaba/Sentinel)（推荐）：面向分布式服务架构的高可用防护组件，主要以流量为切入点，从流量控制、熔断降级、系统自适应保护等多个维度来帮助用户保障微服务的稳定性。
- [Hystrix](https://github.com/Netflix/Hystrix)：类似于 Sentinel 。

相关阅读：[Sentinel 与 Hystrix 的对比](https://sentinelguard.io/zh-cn/blog/sentinel-vs-hystrix.html)。

单机限流：

- [Bucket4j](https://github.com/vladimir-bukhtoyarov/bucket4j)：一个非常不错的基于令牌/漏桶算法的限流库。
- [Resilience4j](https://github.com/resilience4j/resilience4j)：一个轻量级的容错组件，其灵感来自于 Hystrix。

### 监控

- [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin)：管理和监控 Spring Boot 应用程序。
- [Metrics](https://github.com/dropwizard/metrics)：捕获 JVM 和应用程序级别的指标。所以你知道发生了什么事。

### 日志

- EKL 老三件套 : 最原始的时候，ELK 是由 3 个开源项目的首字母构成，分别是 Elasticsearch、Logstash、Kibana。
- 新一代 ELK 架构 : Elasticsearch+Logstash+Kibana+Beats。
- EFK : EFK 中的 F 代表的是 [Fluentd](https://github.com/fluent/fluentd)。
- [TLog](https://gitee.com/dromara/TLog)：一个轻量级的分布式日志标记追踪神器，10 分钟即可接入，自动对日志打标签完成微服务的链路追踪。

## 字节码操作

- [ASM](https://asm.ow2.io/)：通用 Java 字节码操作和分析框架。它可用于直接以二进制形式修改现有类或动态生成类。
- [Byte Buddy](https://github.com/raphw/byte-buddy)：Java 字节码生成和操作库，用于在 Java 应用程序运行时创建和修改 Java 类，无需使用编译器
- [Javassist](https://github.com/jboss-javassist/javassist)：动态编辑 Java 字节码的类库。
- [Recaf](https://github.com/Col-E/Recaf)：现代 Java 字节码编辑器，基于 ASM（Java 字节码操作框架） 来修改字节码，可简化编辑已编译 Java 应用程序的过程。
