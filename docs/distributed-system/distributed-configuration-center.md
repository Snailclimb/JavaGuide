---
title: 分布式配置中心面试题总结
description: 深入解析分布式配置中心核心原理与面试高频考点，涵盖 Apollo、Nacos、Spring Cloud Config 对比选型、配置推送机制（长轮询/gRPC）、灰度发布、高可用设计等知识点。
category: 分布式
keywords:
  - 配置中心
head:
  - - meta
    - name: keywords
      content: 配置中心,分布式配置中心,Apollo,Nacos,Spring Cloud Config,配置中心面试题,灰度发布,长轮询
---

<!-- @include: @small-advertisement.snippet.md -->

## 为什么要用配置中心？

微服务架构下，业务发展通常会导致服务数量增加，进而导致程序配置（服务地址、数据库参数、功能开关等）增多。传统配置文件方式存在以下问题：

- **无法动态更新**：配置放在代码库中，每次修改都需要重新发布新版本才能生效。
- **安全性不足**：敏感配置（数据库密码、API Key）直接写在代码库中容易泄露。
- **时效性差**：即使能修改配置文件，通常也需要重启服务才能生效。
- **缺乏权限控制**：无法对配置的查看、修改、发布等操作进行细粒度权限管控。
- **配置分散难管理**：多环境（开发/测试/生产）、多集群的配置分散在各处，难以统一维护。

此外，配置中心通常提供以下增强能力：

- **版本管理**：记录每次配置变更的修改人、修改时间、修改内容，支持一键回滚。
- **灰度发布**：先将配置推送给部分实例验证，降低变更风险（Apollo、Nacos 1.1.0+ 支持）。

![Applo 配置中心](https://oss.javaguide.cn/github/javaguide/config-center/view-release-history.png)

## 常见的配置中心有哪些？如何选择？

| 方案                                                                               | 状态     | 特点                                |
| ---------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| [Spring Cloud Config](https://cloud.spring.io/spring-cloud-config/reference/html/) | 活跃     | Spring 生态原生支持，基于 Git 存储  |
| [Nacos](https://github.com/alibaba/nacos)                                          | 活跃     | 阿里开源，配置中心 + 服务发现二合一 |
| [Apollo](https://github.com/apolloconfig/apollo)                                   | 活跃     | 携程开源，配置管理功能最完善        |
| K8s ConfigMap                                                                      | 活跃     | Kubernetes 原生方案                 |
| Disconf / Qconf                                                                    | 停止维护 | 不建议使用                          |

**选型建议**：

- 只需配置中心 → **Apollo**（功能最完善）或 **Nacos**（上手更简单）
- 需要配置中心 + 服务发现 → **Nacos**
- Spring Cloud 体系且追求简单 → **Spring Cloud Config**
- Kubernetes 环境 → **K8s ConfigMap 挂载 + 应用层文件监听**（由于 Kubelet 同步 Volume 存在 1~2 分钟延迟，需引入 inotify 或 Spring Cloud Kubernetes 实现热重载）

**Apollo vs Nacos vs Spring Cloud Config**

> **版本说明**：以下对比基于 Apollo 2.x、Nacos 2.x、Spring Cloud Config 3.x

| 功能点       | Apollo                | Nacos                          | Spring Cloud Config                  |
| ------------ | --------------------- | ------------------------------ | ------------------------------------ |
| 配置界面     | 支持（功能完善）      | 支持                           | 无（通过 Git 操作）                  |
| 配置实时生效 | 支持（长轮询，1s 内） | 支持（gRPC 长连接，1s 内）     | 半实时（需触发 refresh 或 Bus 广播） |
| 版本管理     | 原生支持              | 原生支持                       | 依赖 Git                             |
| 权限管理     | 支持（细粒度）        | 支持                           | 依赖 Git 平台                        |
| 灰度发布     | 支持（完善）          | 支持（1.1.0+，基础）           | 不支持                               |
| 配置回滚     | 支持                  | 支持                           | 依赖 Git                             |
| 告警通知     | 支持                  | 支持                           | 不支持                               |
| 多语言       | 支持（Open API）      | 支持（Open API）               | 仅 Spring 应用                       |
| 多环境       | 支持                  | 支持                           | 需配合多 Git 仓库                    |
| 依赖组件     | MySQL + Eureka        | 内置存储（Derby/MySQL）+ JRaft | Git + 可选消息队列                   |

**深度对比**：

1. **Apollo**：配置管理功能最完善（灰度发布、权限控制、审计日志），但部署复杂度较高。多环境（FAT/UAT/PROD）物理隔离场景下，需独立部署 Portal、Admin Service、Config Service 及独立数据库集群，运维门槛中等偏高
2. **Nacos**：配置 + 注册中心二合一，部署简单（单机模式仅一个 Jar 包），但灰度等功能相对基础
3. **Spring Cloud Config**：架构最简单（基于 Git），但实时性差，需要额外组件实现自动刷新

## 配置中心核心设计要点

设计或选型配置中心时，需关注以下能力：

### 1. 配置推送机制

| 模式       | 实时性          | 服务端压力                   | 实现复杂度 | 适用场景     |
| ---------- | --------------- | ---------------------------- | ---------- | ------------ |
| **推模式** | 高（毫秒级）    | 高（需维护连接）             | 高         | 强实时性要求 |
| **拉模式** | 低（秒~分钟级） | 高（无效轮询）               | 低         | 配置变更极少 |
| **长轮询** | 中高（1~30s）   | 中等（海量连接时内存压力大） | 中         | **主流方案** |

> **推送机制说明**：
>
> - **Apollo**：采用 HTTP 长轮询。客户端发起请求，服务端若有变更立即返回；无变更则挂起请求（默认 30s），期间一旦有变更立即响应。
> - **Nacos 2.x**：采用 gRPC 长连接双向流。相比 1.x 的 HTTP 长轮询，gRPC 连接更轻量，配置变更可毫秒级主动 Push 至客户端。
>
> **注意**：长轮询虽然比短轮询节省 CPU 和网络开销，但当客户端规模达到十万级时，服务端需维持海量挂起的 HTTP 请求（依赖 Servlet AsyncContext），对内存和连接数上限仍有较大压力。

### 2. 必备功能清单

- **权限控制**：配置的查看、修改、发布需分级授权
- **审计日志**：完整记录配置变更的操作人、时间、内容
- **版本管理**：每次发布生成版本号，支持回滚到任意历史版本
- **灰度发布**：配置先推送到部分实例，验证通过后全量发布
- **多环境隔离**：开发、测试、生产环境配置独立管理
- **高可用部署**：配置中心自身需要集群化部署，避免单点故障

## 以 Apollo 为例介绍配置中心的设计

### Apollo 介绍

根据 Apollo 官方介绍：

> [Apollo](https://github.com/ctripcorp/apollo)（阿波罗）是携程框架部门研发的分布式配置中心，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。
>
> 服务端基于 Spring Boot 和 Spring Cloud 开发，打包后可以直接运行，不需要额外安装 Tomcat 等应用容器。
>
> Java 客户端不依赖任何框架，能够运行于所有 Java 运行时环境，同时对 Spring/Spring Boot 环境也有较好的支持。

Apollo 核心特性：

- **配置修改实时生效（热发布）**：基于长轮询，1s 内即可接收到最新配置
- **灰度发布**：配置只推给部分应用，降低变更风险
- **部署简单**：单环境仅依赖 MySQL（Eureka 可使用内置模式），但多环境隔离部署复杂度较高
- **跨语言**：提供了 HTTP 接口，不限制编程语言

关于如何使用 Apollo 可以查看 [Apollo 官方使用指南](https://www.apolloconfig.com/#/zh/)。

### Apollo 架构解析

官方给出的 Apollo 基础模型：

![](https://img-blog.csdnimg.cn/a75ccb863e4a401d947c87bb14af7dc3.png)

1. 用户在 Apollo 配置中心修改/发布配置
2. Apollo 配置中心通知应用配置已更改
3. 应用访问 Apollo 配置中心获取最新配置

官方架构图：

![](https://img-blog.csdnimg.cn/79c7445f9dbc45adb45699d40ef50f44.png)

### 组件说明

| 组件               | 作用                                          | 默认端口 |
| ------------------ | --------------------------------------------- | -------- |
| **Portal**         | Web 管理界面，提供配置的可视化管理            | 8070     |
| **Client**         | 客户端 SDK，提供配置获取和变更监听能力        | -        |
| **Meta Server**    | Eureka 的 HTTP 代理，与 Config Service 同进程 | 8080     |
| **Config Service** | 提供配置读取和推送接口，供 Client 调用        | 8080     |
| **Admin Service**  | 提供配置管理接口，供 Portal 调用              | 8090     |
| **Eureka**         | 服务注册中心，Config/Admin Service 注册于此   | 8761     |
| **MySQL**          | 存储配置数据和元数据                          | 3306     |

### 核心流程

**Client 端（获取配置）**：

1. Client 启动时访问 Meta Server 获取 Config Service 地址列表
2. Client 本地缓存服务地址（Eureka 故障时仍可用）
3. Client 发起长轮询请求获取配置
4. Config Service 检测到配置变更后立即响应
5. Client 更新内存缓存、触发变更回调，并**异步持久化到本地文件系统**（默认位于 `/opt/data/` 或 `/opt/logs/`）

> **灾备机制**：即使 Config Service 全部宕机且应用重启，Client 仍可从本地磁盘读取缓存的配置完成启动，确保应用可用性不强依赖配置中心。

**Portal 端（发布配置）**：

1. 用户在 Portal 修改配置并点击发布
2. Portal 调用 Admin Service 发布接口
3. Admin Service 将配置写入 MySQL 并生成发布版本
4. Config Service 通过长轮询通知 Client 配置已变更
5. Client 重新拉取最新配置

### Client 使用示例

获取配置：

```java
Config config = ConfigService.getAppConfig();
String someKey = "someKeyFromDefaultNamespace";
String someDefaultValue = "someDefaultValueForTheKey";
String value = config.getProperty(someKey, someDefaultValue);
```

监听配置变化：

```java
Config config = ConfigService.getAppConfig();
config.addChangeListener(new ConfigChangeListener() {
    @Override
    public void onChange(ConfigChangeEvent changeEvent) {
        // 处理配置变更
        for (String key : changeEvent.changedKeys()) {
            ConfigChange change = changeEvent.getChange(key);
            System.out.println(String.format(
                "Key: %s, Old: %s, New: %s",
                key, change.getOldValue(), change.getNewValue()));
        }
    }
});
```

## 参考

- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Apollo 官方文档](https://www.apolloconfig.com/#/zh/README)
- [Spring Cloud Config 官方文档](https://cloud.spring.io/spring-cloud-config/reference/html/)
- [Nacos 1.1.0 发布，支持灰度配置](https://nacos.io/zh-cn/blog/nacos%201.1.0.html)
- [Apollo 在有赞的实践](https://mp.weixin.qq.com/s/Ge14UeY9Gm2Hrk--E47eJQ)
- [微服务配置中心选型比较](https://www.itshangxp.com/spring-cloud/spring-cloud-config-center/)

<!-- @include: @planet.snippet.md -->
