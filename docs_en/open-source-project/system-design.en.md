---
title: Java high-quality open source system design project
category: open source projects
icon: "xitongsheji"
---

## Basic framework

### Web Framework

- [Spring Boot](https://github.com/spring-projects/spring-boot "spring-boot"): Spring Boot makes it easy to create independent production-grade Spring-based applications. The built-in web server allows you to run the project like an ordinary Java program. In addition, most Spring Boot projects only require a small amount of configuration, which is different from Spring's reconfiguration.
- [SOFABoot](https://github.com/sofastack/sofa-boot): SOFABoot is based on Spring Boot, but adds Readiness Check, class isolation, log space isolation and other capabilities based on it. Also provided are: SOFARPC (RPC framework), SOFABolt (Netty-based remote communication framework), SOFARegistry (registration center)... For details, please refer to: [SOFAStack](https://github.com/sofastack).
- [Solon](https://gitee.com/opensolon/solon): A domestic Java enterprise-level application development framework for all scenarios.
- [Javalin](https://github.com/tipsy/javalin): A lightweight web framework that supports both Java and Kotlin and is used by Microsoft, Red Hat, Uber and other companies.
- [Play Framework](https://github.com/playframework/playframework): High-speed web framework for Java and Scala.
- [Blade](https://github.com/lets-blade/blade): A web framework that pursues simplicity and efficiency, based on Java8 + Netty4.

### Microservices/Cloud Native

- [Armeria](https://github.com/line/armeria): A microservices framework suitable for any situation. You can build any type of microservice using your favorite technology, including [gRPC](https://grpc.io/), [Thrift](https://thrift.apache.org/), [Kotlin](https://kotlinlang.org/), [Retrofit](https://square.github.io/retrofit/), [Reactive Streams](https://www.reactive-streams.org/), [Spring Boot](https://spring.io/projects/spring-boot) and [Dropwizard](https://www.dropwizard.io/)
- [Quarkus](https://github.com/quarkusio/quarkus) : A cloud-native and container-first framework for writing Java applications.
- [Helidon](https://github.com/helidon-io/helidon): A set of Java libraries for writing microservices, supporting Helidon MP and Helidon SE programming models.

### API Documentation

- [Swagger](https://swagger.io/): The more mainstream RESTful-style API documentation tool provides a set of tools and specifications to make it easier for developers to create and maintain API documents that are readable, easy to use and interact with.
- [Knife4j](https://doc.xiaominfo.com/): An enhanced solution integrating Swagger2 and OpenAPI3.

### Bean mapping

- [MapStruct](https://github.com/mapstruct/mapstruct) (recommended): A Java annotation processor that meets the JSR269 specification and is used to generate type-safe and high-performance mappings for Java Beans. It generates get/set code based on the compilation phase. There is no reflection in this implementation and no additional performance loss.
- [MapStruct Plus](https://github.com/linpeilie/mapstruct-plus): An enhanced version of MapStruct that supports automatic generation of Mapper interfaces.
- [JMapper](https://github.com/jmapper-framework/jmapper-core): A high-performance and easy-to-use Bean mapping framework.

### Others

- [Guice](https://github.com/google/guice): A lightweight dependency injection framework open sourced by Google, which is equivalent to a lightweight Spring Boot with extremely simplified functions. It is very practical in some cases. For example, our project only needs to use dependency injection and does not need functional features such as AOP.
- [Spring Batch](https://github.com/spring-projects/spring-batch): Spring Batch is a lightweight but very comprehensive batch processing framework, mainly used in batch processing scenarios such as reading a large number of records from a database, file or queue. However, it should be noted that Spring Batch is not a scheduling framework. There are many excellent enterprise scheduling frameworks in the commercial and open source fields, such as Quartz, XXL-JOB, and Elastic-Job. It is designed to work with the scheduler, not replace it.

## Authentication and authorization

### Permission authentication

- [Sa-Token](https://github.com/dromara/sa-token): lightweight Java permission authentication framework. Supports authentication and authorization, single sign-on, kicking people offline, automatic renewal and other functions. Compared with Spring Security and Shiro, Sa-Token has more built-in out-of-the-box functions and is easier to use.
- [Spring Security](https://github.com/spring-projects/spring-security): Spring's official security framework, which can be used for authentication, authorization, encryption and session management. It is currently the most widely used Java security framework.
- [Shiro](https://github.com/apache/shiro): Java security framework, similar in function to Spring Security, but simpler to use.

### Third-party login

- [WxJava](https://github.com/Wechat-Group/WxJava): WxJava (WeChat development Java SDK) supports back-end development including WeChat payment, open platform, mini program, enterprise WeChat/enterprise account and official account.
- [JustAuth](https://github.com/justauth/JustAuth): A small, comprehensive and beautiful third-party login open source component. At present, it has integrated dozens of domestic and foreign third-party platforms such as: GitHub, Gitee, Alipay, Sina Weibo, WeChat, Google, Facebook, Twitter, StackOverflow, etc.

### Single Sign-On (SSO)

- [CAS](https://github.com/apereo/cas): Enterprise multi-language network single sign-on solution.
- [MaxKey](https://gitee.com/dromara/MaxKey): Single sign-on authentication system, providing secure, standard and open user identity management (IDM), identity authentication (AM), single sign-on (SSO), RBAC permission management and resource management, etc.
- [Keycloak](https://github.com/keycloak/keycloak): Free, open source authentication and access management system that supports highly configurable single sign-on functionality.

## Network communication

- [Netty](https://github.com/netty/netty): A client-server (client-server) framework based on NIO, which can be used to quickly and easily develop network applications.
- [Retrofit](https://github.com/square/retrofit): Type-safe HTTP client for Android and Java. Retrofit's HTTP request uses the [OkHttp](https://square.github.io/okhttp/) library (a widely used network framework).
- [Forest](https://gitee.com/dromara/forest): A lightweight HTTP client API framework that makes it easy for Java to send HTTP/HTTPS requests. It is higher level than OkHttp and HttpClient. It is a good helper for encapsulating and calling third-party restful api client interface. It is another option besides retrofit and feign.
- [netty-websocket-spring-boot-starter](https://github.com/YeautyYE/netty-websocket-spring-boot-starter): Helps you use Netty to develop WebSocket servers in Spring Boot, and it is as simple as spring-websocket annotation development.

## Database

### Database connection pool- [Druid](https://github.com/alibaba/druid): Produced by Alibaba Database Division, a database connection pool designed for monitoring.
- [HikariCP](https://github.com/brettwooldridge/HikariCP): A reliable and high-performance JDBC connection pool. Springboot 2.0 chooses HikariCP as the default database connection pool.

### Database framework

- [MyBatis-Plus](https://github.com/baomidou/mybatis-plus): [MyBatis](http://www.mybatis.org/mybatis-3/) Enhancement tool, based on MyBatis, it only enhances without making changes. It is born to simplify development and improve efficiency.
- [MyBatis-Flex](https://gitee.com/mybatis-flex/mybatis-flex): An elegant MyBatis enhanced framework without any other third-party dependencies, supporting CRUD, paging queries, multi-table queries, and batch operations.
- [jOOQ](https://github.com/jOOQ/jOOQ): The best way to write SQL in Java.
- [Redisson](https://github.com/redisson/redisson "redisson"): Redisson is a Java in-memory data grid (In-Memory Data Grid) built on Redis. It takes full advantage of the Redis key-value database and provides Java developers with a series of commonly used tool classes with distributed characteristics. For example, distributed Java objects (`Set`, `SortedSet`, `Map`, `List`, `Queue`, `Deque`, etc.), distributed locks, etc. For a detailed introduction, please see: [Redisson Project Introduction](https://github.com/redisson/redisson/wiki/Redisson%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D "Redisson Project Introduction").

### Data synchronization

- [Canal](https://github.com/alibaba/canal "canal") [kə'næl] : Canal translates as waterway/pipeline/ditch. Its main purpose is to provide incremental data subscription and consumption based on MySQL database incremental log analysis.
- [DataX](https://github.com/alibaba/DataX "DataX"): DataX is a widely used offline data synchronization tool/platform within the Alibaba Group. It implements efficient data synchronization functions between various heterogeneous data sources including MySQL, Oracle, SqlServer, Postgre, HDFS, Hive, ADS, HBase, TableStore (OTS), MaxCompute (ODPS), DRDS, etc. Related projects: [DataX-Web](https://github.com/WeiYe-Jing/datax-web) (DataX integrated visualization page, select the data source to generate data synchronization tasks with one click).

Others: [Flinkx](https://github.com/DTStack/flinkx) (distributed data synchronization tool based on Flink).

### Time series database

- [IoTDB](https://github.com/apache/iotdb): A domestic time series database written in Java language, providing users with data collection, storage and analysis services. Seamlessly integrated with Hadoop, Spark and visualization tools such as Grafana, it meets the needs of massive data storage, high-throughput data writing and complex data query analysis in the industrial IoT field.
- [KairosDB](https://github.com/kairosdb/kairosdb): A fast distributed and scalable time series database based on Cassandra.

## Search engine

- [Elasticsearch](https://github.com/elastic/elasticsearch "elasticsearch") (recommended): open source, distributed, RESTful search engine.
- [Meilisearch](https://github.com/meilisearch/meilisearch): A powerful, fast, open source, easy to use and deploy search engine that supports Chinese search (no need to add additional configuration).
- [Solr](https://lucene.apache.org/solr/) : Solr (pronounced "solar") is the Apache Lucene project's open source enterprise search platform.
- [Easy-ES](https://gitee.com/dromara/easy-es): Fool-level ElasticSearch search engine ORM framework.

## Test

### Testing framework

- [JUnit](http://junit.org/): Java testing framework.
- [Mockito](https://github.com/mockito/mockito): Mockito is a mock testing framework that allows you to write beautiful unit tests with an elegant and concise interface. (Replace objects that are not easily constructed with a dummy object so that they can be used as a stand-in for real objects during debugging)
- [PowerMock](https://github.com/powermock/powermock): Mockito alone is not enough for writing unit tests. Because Mockito cannot mock private methods, final methods, static methods, etc. The PowerMock framework is mainly used to extend other mock frameworks, such as Mockito and EasyMock. It uses a custom class loader to modify the bytecode, breaking through the limitation that Mockito cannot mock static methods, constructors, final classes, final methods, and private methods.
- [WireMock](https://github.com/tomakehurst/wiremock): Tool to simulate HTTP services (Mock your APIs).
- [Testcontainers](https://github.com/testcontainers/testcontainers-java): A testing tool library that supports JUnit, providing lightweight and one-time support for testing common databases, Selenium web browsers, or any other instance that can run in a Docker container.

Related reading:

- [The Practical Test Pyramid- Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) (A great article, but in English)
- [A brief talk about testing PowerMock](https://juejin.im/post/6844903982058618894)

### Test platform

- [MeterSphere](https://github.com/metersphere/metersphere): A one-stop open source continuous testing platform, covering test tracking, interface testing, performance testing, team collaboration and other functions, and is fully compatible with open source and mainstream standards such as JMeter, Postman, and Swagger.
- [Apifox](https://www.apifox.cn/): API documentation, API debugging, API Mock, API automated testing.

### API debugging

- [Reqable](https://reqable.com/zh-CN/): A new generation of open source API development tools. Reqable = Fiddler + Charles + Postman, making API debugging faster.
- [Insomnia](https://insomnia.rest/) : Debug API like a human instead of a robot. It is an API development tool that I often use. It has a beautiful and lightweight interface. Overall, I like it very much.
- [RapidAPI](https://paw.cloud/): A full-featured HTTP client, but only supports Mac.
- [Postcat](https://github.com/Postcatlab/postcat): An extensible open source API tool platform.
- [Postman](https://www.getpostman.com/): One of the most commonly used API testing tools by developers.
- [Hoppscotch](https://github.com/liyasthomas/postwoman "postwoman") (formerly Postwoman): Open source API testing tool. The official positioning is an open source alternative to products such as Postman and Insomnia.
- [Restful Fast Request](https://gitee.com/dromara/fast-request): IDEA version of Postman, API debugging tool + API management tool + API search tool.

## Task scheduling

- [Quartz](https://github.com/quartz-scheduler/quartz): A very popular open source task scheduling framework, the big brother or reference standard in the field of Java scheduled tasks. Many other task scheduling frameworks are developed based on `quartz`. For example, Dangdang.com's `elastic-job` is a distributed scheduling solution based on the secondary development of `quartz`- [XXL-JOB](https://github.com/xuxueli/xxl-job) :XXL-JOB 是一个分布式任务调度平台，其核心设计目标是开发迅速、学习简单、轻量级、易扩展。现已开放源代码并接入多家公司线上产品线，开箱即用。
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

- [J2Cache](https://gitee.com/ld/J2Cache): A two-level Java caching framework based on local memory and Redis.
- [JetCache](https://github.com/alibaba/jetcache): Alibaba’s open source cache framework supports multi-level cache, distributed cache automatic refresh, TTL and other functions.

### Message queue

**Distributed queue**:

- [RocketMQ](https://github.com/apache/rocketmq "RocketMQ"): A high-performance, high-throughput distributed messaging middleware open sourced by Alibaba.
- [Kafka](https://github.com/apache/kafka "Kafka"): Kafka is a distributed, publish/subscribe based messaging system.
- [RabbitMQ](https://github.com/rabbitmq "RabbitMQ"): A message queue developed by erlang based on the AMQP (Advanced Message Queue Advanced Message Queuing Protocol) protocol.

**Memory Queue**:

- [Disruptor](https://github.com/LMAX-Exchange/disruptor): Disruptor is a high-performance queue developed by the British foreign exchange trading company LMAX. The original intention of the development was to solve the delay problem of the memory queue (in the performance test, it was found that it is in the same order of magnitude as I/O operations).

### Read and write separation and sub-database and sub-table

- [ShardingSphere](https://github.com/apache/shardingsphere): ShardingSphere is an ecosystem composed of a set of open source distributed database middleware solutions. It consists of three independent products: Sharding-JDBC, Sharding-Proxy and Sharding-Sidecar (planned).
- [MyCat](https://github.com/MyCatApache/MyCat2): MyCat is the middleware for database sharding and table sharding. The two most commonly used functions of MyCat are: read-write separation and sharding database and table sharding. MyCat was a secondary development by some community enthusiasts based on Alibaba Cobar. It solved some of the problems that Cobar had at the time and added many new features to it.
- [dynamic-datasource-spring-boot-starter](https://github.com/baomidou/dynamic-datasource-spring-boot-starter): A starter that quickly integrates multiple data sources based on Spring Boot, supporting multiple data sources, dynamic data sources, master-slave separation, read-write separation and distributed transactions.

## High availability

### Current limiting

Distributed current limiting:

- [Sentinel](https://github.com/alibaba/Sentinel) (recommended): A high-availability protection component for distributed service architecture. It mainly uses traffic as the entry point to help users ensure the stability of microservices from multiple dimensions such as flow control, circuit breaker degradation, and system adaptive protection.
- [Hystrix](https://github.com/NETFLIX/Hystrix): Similar to Sentinel.

Related reading: [Comparison of Sentinel and Hystrix](https://sentinelguard.io/zh-cn/blog/sentinel-vs-hystrix.html).

Single machine current limit:

- [Bucket4j](https://github.com/vladimir-bukhtoyarov/bucket4j): A very good current limiting library based on token/leaky bucket algorithm.
- [Resilience4j](https://github.com/resilience4j/resilience4j): A lightweight fault-tolerant component inspired by Hystrix.

### Monitoring

- [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin): Manage and monitor Spring Boot applications.
- [Metrics](https://github.com/dropwizard/metrics): Capture JVM and application level metrics. So you know what's going on.

### Log

- EKL's old three-piece set: In its original form, ELK was composed of the initials of three open source projects, namely Elasticsearch, Logstash, and Kibana.
- New generation ELK architecture: Elasticsearch+Logstash+Kibana+Beats.
- EFK: The F in EFK stands for [Fluentd](https://github.com/fluent/fluentd).
- [TLog](https://gitee.com/dromara/TLog): A lightweight distributed log tag tracking artifact that can be accessed in 10 minutes and automatically tags logs to complete link tracking of microservices.

## Bytecode operations

- [ASM](https://asm.ow2.io/): A general-purpose Java bytecode manipulation and analysis framework. It can be used to modify existing classes directly in binary form or to generate classes dynamically.
- [Byte Buddy](https://github.com/raphw/byte-buddy): Java bytecode generation and manipulation library for creating and modifying Java classes while a Java application is running, without using a compiler
- [Javassist](https://github.com/jboss-javassist/javassist): A class library for dynamically editing Java bytecode.
- [Recaf](https://github.com/Col-E/Recaf): A modern Java bytecode editor based on ASM (Java Bytecode Manipulation Framework) to modify bytecode, simplifying the process of editing compiled Java applications.