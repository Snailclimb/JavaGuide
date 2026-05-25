---
title: 分布式 ID 生成方案详解：UUID、Snowflake、号段模式、Leaf 与 Tinyid 对比
category: 分布式
description: 分布式 ID 生成方案详解，系统对比 UUID、数据库自增、数据库号段模式、Redis、MongoDB ObjectId、Snowflake、Leaf、Tinyid、UidGenerator、IdGenerator 的原理、优缺点和适用场景。
tag:
  - 分布式 ID
head:
  - - meta
    - name: keywords
      content: 分布式 ID,分布式 ID 生成,Snowflake,雪花算法,UUID,UUID v7,号段模式,Leaf,Tinyid,UidGenerator,IdGenerator,全局唯一 ID,分布式 ID 面试题
---

## 分布式 ID 介绍

### 什么是 ID？

日常开发中，我们需要对系统中的各种数据使用 ID 唯一表示，比如用户 ID 唯一标识一个用户，商品 ID 唯一标识一件商品，订单 ID 唯一标识一笔订单。

我们现实生活中也有各种 ID，比如身份证 ID 唯一标识一个人，地址 ID 唯一标识一个地址。

简单来说，**ID 就是数据的唯一标识**。

### 什么是分布式 ID？

这里说的分布式 ID，主要指分布式系统中用于跨节点、跨库、跨服务唯一标识数据的 ID。它解决的是多节点并发生成 ID 时不能冲突的问题。

我简单举一个分库分表的例子。

我司的一个项目，使用的是单机 MySQL。但是，没想到的是，项目上线一个月之后，随着使用人数越来越多，整个系统的数据量将越来越大。单机 MySQL 已经没办法支撑了，需要进行分库分表，可以考虑 Apache ShardingSphere-JDBC 这类方案，具体还要看 SQL 复杂度、事务要求、运维能力和团队经验。

在分库之后，数据分散在不同数据库节点上，数据库的自增主键已经没办法满足生成的主键唯一了。**我们如何为不同的数据节点生成全局唯一主键呢？**

这个时候就需要生成**分布式 ID**了。

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/id-after-the-sub-table-not-conflict.png)

### 分布式 ID 需要满足哪些要求?

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-requirements.png)

分布式 ID 作为分布式系统中必不可少的一环，很多地方都要用到分布式 ID。

一个最基本的分布式 ID 需要满足下面这些要求：

- **全局唯一**：ID 的全局唯一性是首先要满足的。
- **高性能**：分布式 ID 的生成速度要快，对本地资源消耗要小。
- **高可用**：发号服务要具备较高可用性，避免成为业务链路的单点。
- **方便易用**：拿来即用，使用方便，快速接入！

除了这些之外，一个比较好的分布式 ID 还应保证：

- **安全**：ID 中不包含敏感信息。
- **趋势递增**：如果要把 ID 存放在数据库的话，趋势递增的 ID 通常更利于 B+ 树索引写入。很多数据库主键场景更需要趋势递增，而不是全局严格递增；严格递增虽然方便排序，但通常会引入中心化发号器或强协调，成本更高。
- **业务含义可控**：是否嵌入业务含义要谨慎。业务含义有助于排查问题，但也可能泄露业务规模、地区、时间、渠道等信息，并让 ID 规则和业务强耦合。很多系统更倾向于让 ID 保持无语义，把业务信息放到单独字段。
- **独立部署**：也就是分布式系统单独有一个发号器服务，专门用来生成分布式 ID。这样，生成 ID 的服务就可以和业务相关的服务解耦。不过，这样同样带来了网络调用消耗增加的问题。总的来说，如果需要用到分布式 ID 的场景比较多的话，独立部署的发号器服务还是很有必要的。

还需要注意，不同方案的“唯一性”来源并不一样：

- 数据库自增、数据库号段模式依赖中心存储和事务分配。
- Redis 方案依赖单 key 原子递增、持久化策略和主从一致性。
- Snowflake 依赖时间戳、Worker ID、sequence 三者组合不冲突。
- UUID v4/v7 依赖随机数质量和生成器实现策略。
- 对不能容忍重复的主键场景，最终落库时仍建议用数据库唯一约束兜底。

## 基于数据库的生成方案（有状态）

### 数据库主键自增

这种方式就比较简单直白了，就是通过关系型数据库的自增主键来生成唯一 ID。

![数据库主键自增](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/the-primary-key-of-the-database-increases-automatically.png)

以 MySQL 举例，我们通过下面的方式即可。

**1. 创建一个数据库表。**

```sql
CREATE TABLE `sequence_id` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stub` char(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `stub` (`stub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`stub` 字段无意义，只是为了占位，便于我们插入或者修改数据。并且，给 `stub` 字段创建了唯一索引，保证其唯一性。

**2. 通过 `REPLACE INTO` 来插入数据。**

```java
BEGIN;
REPLACE INTO sequence_id (stub) VALUES ('stub');
SELECT LAST_INSERT_ID();
COMMIT;
```

**⚠️ REPLACE INTO 的生产隐患**：

`REPLACE INTO` 的语义是：如果新行不会和 `PRIMARY KEY` 或 `UNIQUE` 索引冲突，就直接插入；如果冲突，则先删除旧行，再插入新行。受影响行数可能是删除行数加插入行数。

- 每次操作都会触发索引删除和重建，对数据库压力较大。
- 如果表上有触发器，DELETE 操作会意外触发。

**替代方案**：如果只是为了推进序列表，可以使用 `INSERT ... ON DUPLICATE KEY UPDATE` 或单行 `UPDATE` 来避免 `REPLACE` 的删除语义。生产环境更常见的是号段模式：一次更新 `current_max_id = current_max_id + step`，再在内存中分配。

这种方式的优缺点也比较明显：

- **优点**：实现起来比较简单、ID 有序递增、存储消耗空间小。
- **缺点**：支持的并发量不大、存在数据库单点问题（可以通过主备、MGR、分库多发号段等方式提高可用性，但要处理主从切换、事务提交、重复发号和号段浪费问题）、ID 没有具体业务含义、安全问题（比如根据订单 ID 的递增规律就能推算出每天的订单量，商业机密啊！ ）、每次获取 ID 都要访问一次数据库（增加了对数据库的压力，获取速度也慢）。

### 数据库号段模式

数据库主键自增这种模式，每次获取 ID 都要访问一次数据库，ID 需求比较大的时候，肯定是不行的。

如果我们可以批量获取，然后存在内存里面，需要用到的时候直接从内存里拿，就能减少访问数据库的次数，延迟和数据库压力都会下降。这也就是我们说的 **基于数据库的号段模式来生成分布式 ID**。

数据库号段模式是目前比较主流的一种分布式 ID 生成方式。像滴滴开源的 [Tinyid](https://github.com/didi/tinyid/wiki/tinyid原理介绍) 就是基于这种方式来做的。不过，Tinyid 使用了双号段缓存、增加多数据库支持等方式来进一步优化。

以 MySQL 举例，我们通过下面的方式即可。

**1. 创建一个数据库表。**

```sql
CREATE TABLE `sequence_id_generator` (
  `id` INT NOT NULL,
  `current_max_id` BIGINT NOT NULL COMMENT '当前最大ID',
  `step` INT NOT NULL COMMENT '号段的长度',
  `version` INT NOT NULL COMMENT '版本号',
  `biz_type` INT NOT NULL COMMENT '业务类型',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_biz_type` (`biz_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`current_max_id` 字段和 `step` 字段主要用于获取批量 ID。获取的批量 ID 区间为 `(current_max_id, current_max_id + step]`，也就是不包含 `current_max_id` 的旧值本身。例如，旧 `current_max_id = 0`、`step = 100` 时，成功更新后本次可分配的 ID 区间为 `1~100`。

![数据库号段模式](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/database-number-segment-mode.png)

`version` 字段主要用于解决并发问题（乐观锁），完整流程如下：

```sql
-- 1. 读取当前值
SELECT current_max_id, step, version FROM sequence_id_generator WHERE biz_type = 101;
-- 2. CAS 更新（version 作为乐观锁版本号）
UPDATE sequence_id_generator
SET current_max_id = current_max_id + step, version = version + 1
WHERE version = {当前读取的version} AND biz_type = 101;
-- 3. 检查 affected_rows，为 1 表示成功，为 0 表示被其他线程抢先，需重试
```

`UPDATE ... WHERE version = ?` 执行后必须检查 `affected_rows`。如果结果为 0，说明号段已经被其他实例抢走，需要重新读取 `current_max_id` 和 `version` 后再重试。

> **⚠️ 高并发重试提醒**：在号段耗尽瞬间，多个线程可能同时争抢新号段，CAS 更新可能失败。代码层面需要实现**有限次数的重试循环**（如 3 次）和指数退避，确保请求稳定性。若重试仍失败，应阻塞等待下一个号段加载完成，或触发告警并进入熔断降级流程。**不建议返回所谓“降级 ID”**，否则可能破坏全局唯一性保证。

`biz_type` 主要用于表示业务类型。

**2. 先插入一行数据。**

```sql
INSERT INTO `sequence_id_generator` (`id`, `current_max_id`, `step`, `version`, `biz_type`)
VALUES
 (1, 0, 100, 0, 101);
```

**3. 通过 SELECT 获取指定业务下的批量唯一 ID**

```sql
SELECT `current_max_id`, `step`, `version` FROM `sequence_id_generator` WHERE `biz_type` = 101
```

结果：

```plain
id current_max_id step version biz_type
1 0 100 0 101
```

**4. 不够用的话，更新之后重新 SELECT 即可。**

```sql
UPDATE sequence_id_generator SET current_max_id = 0 + 100, version = version + 1 WHERE version = 0 AND `biz_type` = 101
SELECT `current_max_id`, `step`, `version` FROM `sequence_id_generator` WHERE `biz_type` = 101
```

结果：

```plain
id current_max_id step version biz_type
1 100 100 1 101
```

相比于数据库主键自增的方式，**数据库的号段模式对于数据库的访问次数更少，数据库压力更小。**

另外，为了避免单点问题，可以通过主从模式或多库部署提高可用性。如果使用主从模式，发号更新必须走主库，并确保故障切换后不会回到旧的 `current_max_id`；多库模式则要保证每个库分配的号段范围、步长或业务分片互不重叠。

号段模式还会带来“跳号”问题：实例申请号段后通常会缓存在内存中，实例宕机或重启时，未使用完的号段会被浪费。浪费号段不影响唯一性，但会导致 ID 不连续；不要为了追求连续性回收已分配但未使用的号段，否则可能产生重复 ID。生产环境需要监控号段消耗速度、加载失败率和重试次数。

**数据库号段模式的优缺点:**

- **优点**：ID 趋势递增、存储消耗空间小。
- **缺点**：存在数据库单点问题（可以通过主从、多库等方式提高可用性，不过增加了复杂度）、ID 没有具体业务含义、安全问题（比如根据订单 ID 的递增规律就能推算出每天的订单量，商业机密啊！ ）。

### NoSQL

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/nosql-distributed-id.png)

一般情况下，NoSQL 方案使用 Redis 多一些。我们通过 Redis 的 `INCR` 命令即可实现对 ID 原子顺序递增。

```bash
127.0.0.1:6379> set sequence_id_biz_type 1
OK
127.0.0.1:6379> incr sequence_id_biz_type
(integer) 2
127.0.0.1:6379> get sequence_id_biz_type
"2"
```

为了提高可用性和并发，我们可以使用 Redis Cluster。Redis Cluster 是 Redis 官方提供的 Redis 集群解决方案（3.0+版本）。

Codis 曾经是常见的开源 Redis 集群方案，但项目长期不活跃。新项目一般优先评估 Redis Cluster、云厂商 Redis 集群或兼容 Redis 协议的托管服务；Codis 更适合存量系统继续维护，使用前需要单独评估维护状态。

除了高可用和并发之外，我们知道 Redis 基于内存，我们需要持久化数据，避免重启机器或者机器故障后数据丢失。Redis 支持两种不同的持久化方式：**快照（snapshotting，RDB）**、**只追加文件（append-only file, AOF）**。并且，Redis 4.0 开始支持 **RDB 和 AOF 的混合持久化**，由配置项 `aof-use-rdb-preamble` 控制：Redis 4.0 示例配置默认关闭，Redis 5.0+ 示例配置默认开启。具体默认值要以目标 Redis 版本、配置文件以及云厂商托管版配置为准。

关于 Redis 持久化，我这里就不过多介绍。不了解这部分内容的小伙伴，可以看看 [Redis 持久化机制详解](https://javaguide.cn/database/redis/redis-persistence.html)这篇文章。

虽然 Redis `INCR` 性能优异，但 Redis 持久化只能降低进程重启后的数据丢失风险，不能完全消除 ID 回退。尤其是 `appendfsync everysec`、RDB 快照、主从异步复制和故障切换场景，都可能丢失最近一段 `INCR` 结果。下面这些失败路径需要特别注意：

1. **持久化延迟导致 ID 回退**

   - **场景**：执行 `INCR` 后，Redis 在 RDB/AOF 刷盘前崩溃。
   - **后果**：重启后 ID 回退到上次持久化的值，可能产生重复 ID。

2. **AOF 重写导致短暂阻塞**

   - **场景**：AOF 文件过大触发重写。
   - **后果**：主进程 fork 子进程可能导致短暂的性能抖动。

3. **Redis Cluster 单分片热点**

   - **场景**：单个计数 key 始终落在集群的单一分片上。
   - **后果**：高并发下该分片可能成为瓶颈。

4. **主从异步复制故障切换**
   - **场景**：主节点故障切换到从节点时，从节点的 `INCR` 值可能落后于主节点。
   - **后果**：新主节点上的 ID 可能回退到旧值。

**生产配置建议**：

```conf
# Redis 7.0+ 可参考配置
appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes  # 混合持久化（RDB+AOF 组合）
```

- **Redis 7.0+ 优化**：多部分 AOF（Multi-part AOF）改善了 AOF 重写期间 base/incr 文件的组织和管理方式，但 fork、磁盘 IO、`fsync` 策略仍可能带来抖动。
- **适用边界**：Redis 适合流水号、短周期计数、可业务兜底去重的场景。若对 ID 唯一性要求极高，例如金融订单号、支付流水这类核心主键，需要结合业务去重、持久化策略、主从一致性策略和落库唯一约束，或改用数据库号段模式、Leaf 等方案。

**Redis 方案的优缺点：**

- **优点**：性能不错，并且单 key、单主正常运行时生成的 ID 是递增的。
- **缺点**：和数据库主键自增方案的缺点类似，且存在持久化延迟、单分片热点、主从切换导致 ID 回退的风险。

除了 Redis 之外，MongoDB ObjectId 经常也会被拿来当做分布式 ID 的解决方案。

![MongoDB ObjectId Specification](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/mongodb9-objectId-distributed-id.png)

MongoDB ObjectId 一共需要 12 个字节存储：

- 0~3：Unix 秒级时间戳（4 字节）
- 4~8：随机值（5 字节，每个客户端进程生成一次，用于区分机器和进程）
- 9~11：自增计数器（3 字节，每个客户端进程内递增）

ObjectId 是无需中心协调的近似有序唯一标识，通常可满足文档 `_id` 场景，但它不是全局严格单调序列：它只有秒级时间精度，同一秒内生成的 ObjectId 不保证严格顺序；不同客户端机器的系统时间也可能不同。

**MongoDB 方案的优缺点：**

- **优点**：性能不错并且生成的 ID 按创建时间近似有序。
- **缺点**：不是严格单调递增，当机器时间不一致时排序结果可能不符合真实创建顺序；另外，ID 中包含时间信息，存在一定规律性。

## 基于算法的生成方案（无状态）

### UUID

UUID 是 Universally Unique Identifier（通用唯一标识符）的缩写，本质上是一个 128 bit 的标识符。它的标准字符串形式通常是 36 个字符（包含连字符），去掉连字符后是 32 个十六进制字符。

JDK 就提供了现成的生成 UUID 的方法，一行代码就行了。

```java
//输出示例：cb4a9ede-fa5e-4585-b9bb-d60bce986eaa
UUID.randomUUID()
```

[RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) 已经取代 [RFC 4122](https://tools.ietf.org/html/rfc4122)，重新规范了 UUID，并新增了 v6、v7、v8。旧资料里仍会看到 RFC 4122 的说法，但新文章建议以 RFC 9562 为主。RFC 9562 中关于 UUID 的示例是这样的：

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/rfc-4122-uuid.png)

我们这里重点关注一下这个 Version（版本），不同的版本对应的 UUID 的生成规则是不同的。

8 种不同的 Version（版本）值分别对应的含义（参考[维基百科对于 UUID 的介绍](https://zh.wikipedia.org/wiki/通用唯一识别码)）：

- **版本 1（基于时间和节点 ID）**：基于时间戳（通常是当前时间）和节点 ID（通常为设备的 MAC 地址）生成。当包含 MAC 地址时，可以保证全球唯一性，但也因此存在隐私泄露的风险。
- **版本 2（基于标识符、时间和节点 ID）**：与版本 1 类似，也基于时间和节点 ID，但额外包含了本地标识符（例如用户 ID 或组 ID）。
- **版本 3（基于命名空间和名称的 MD5 哈希）**：使用 MD5 哈希算法，将命名空间标识符（一个 UUID）和名称字符串组合计算得到。相同的命名空间和名称总是生成相同的 UUID（**确定性生成**）。
- **版本 4（基于随机数）**：使用伪随机数生成器（PRNG）或加密安全随机数生成器（CSPRNG）来生成。UUID v4 有 122 bit 随机位，取值空间为 2^122；按生日悖论计算，约生成 2^61 个 UUID 时碰撞概率才接近 50%。实际应用中可认为唯一，但理论上仍是概率保证。
- **版本 5（基于命名空间和名称的 SHA-1 哈希）**：类似于版本 3，但使用 SHA-1 哈希算法。
- **版本 6（基于时间戳、计数器和节点 ID）**：改进了版本 1，将时间戳放在最高有效位（Most Significant Bit，MSB），使得 UUID 可以直接按时间排序。
- **版本 7（基于 Unix 毫秒时间戳）**：高位是 48 位 Unix 毫秒时间戳，剩余位在扣除版本和变体位后用于随机数，也允许实现使用亚毫秒时间或计数器来增强同一毫秒内的单调性。对需要时间排序且没有特殊兼容要求的新系统，UUID v7 通常比 v1/v6 更推荐；但存量系统、协议兼容和已有数据格式仍要单独评估。
- **版本 8（实验性/供应商定制）**：**122 位留给实现自定义**，仅要求版本和变体位固定。适用于嵌入额外信息或特殊应用限制的场景。**唯一性由实现保证，不可假设**。

下面是 UUID v1 生成结果的示例：

![UUID v1 生成结果的示例](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/version1-uuid.png)

JDK 中通过 `UUID` 的 `randomUUID()` 方法生成的 UUID 的版本默认为 4。

```java
UUID uuid = UUID.randomUUID();
int version = uuid.version();// 4
```

另外，Variant（变体）也有 4 种不同的值，这种值分别对应不同的含义。这里就不介绍了，貌似平时也不怎么需要关注。

需要用到的时候，去看看维基百科对于 UUID 的 Variant（变体）相关的介绍即可。

从上面的介绍中可以看出，UUID 在正确实现和足够随机性的前提下，工程上可认为唯一。v4 的唯一性本质上是概率保证；v1/v6 依赖节点 ID 和时间戳，可能存在隐私泄露风险；v7/v8 的唯一性则依赖实现策略。

虽然，UUID 在工程上可认为全局唯一，但是，我们一般很少会使用它。

比如使用 UUID v4 这类非时序 UUID 作为 MySQL 数据库主键的时候就非常不合适：

- 数据库主键要尽量越短越好。UUID 本质是 128 bit，如果用字符串存储，通常是 36 字符含连字符，或 32 个十六进制字符；如果用二进制存储，可以压到 16 字节。
- UUID v4 这类非时序 UUID 是无序的，InnoDB 引擎下，数据库主键的无序性会严重影响数据库性能。

UUID v7（[RFC 9562](https://www.rfc-editor.org/rfc/rfc9562)）是一个标准化、趋势有序、无需 Worker ID 分配的可选方案：

UUID v7 不需要像 Snowflake 一样分配 Worker ID，接入成本低；但它仍然依赖随机数质量和生成器实现。对不能容忍重复的主键场景，数据库唯一约束仍然不能省。

| 特性               | Snowflake                 | UUID v7                                                  |
| ------------------ | ------------------------- | -------------------------------------------------------- |
| **Worker ID 管理** | 需要中心化分配（ZK/etcd） | 无需分配，开箱即用                                       |
| **时钟回拨风险**   | 需要额外处理              | 毫秒内允许乱序；遇到时钟回拨时，需要生成器实现单调性处理 |
| **B+ 树友好**      | 趋势递增                  | 趋势有序                                                 |
| **标准化**         | 各家实现不一              | RFC 标准，跨语言兼容                                     |
| **结构**           | 64 位（自定义）           | 128 位（48 位时间戳 + 随机数/计数器字段）                |

**适用场景**：中小规模分布式系统、无需 Snowflake 级性能、希望减少 Worker ID 运维成本的场景。

UUID v7 相比 UUID v4 更利于 B+ 树局部写入，但它仍然是 128 bit，比 64 bit 的 Snowflake ID 更占空间。数据库中建议优先使用 `BINARY(16)` 或原生 `uuid` 类型，而不是直接用字符串主键；高写入表仍需要压测页分裂、索引大小和缓存命中率。

**UUID v8（实验性用途）**：如果需要嵌入额外信息（如业务标识、集群信息）或有特殊应用限制，可考虑 UUID v8。但需注意：**v8 的唯一性由实现保证，不可假设与其他实现兼容**。

⚠️ **注意**：数据库支持情况还在普及中。PostgreSQL 18（2025-09-25 发布）开始提供内置 `uuidv7()` 函数，可生成时间有序 UUID。MySQL 8.0 的 `UUID()` 生成的是时间和节点相关的 UUID，常被视为 v1 风格；`UUID_TO_BIN(uuid, 1)` 可以重排时间部分改善索引局部性，但它不是 UUID v7 生成函数。UUID v7 通常需要应用层或自定义函数生成。

最后，我们再简单分析一下 **UUID 的优缺点** （面试的时候可能会被问到的哦！） :

- **优点**：生成速度通常比较快、简单易用。
- **缺点**：存储消耗空间大、不安全（基于 MAC 地址生成 UUID 的算法会造成 MAC 地址泄露）、很多版本不具备严格递增特性、没有具体业务含义；对唯一性要求极高的场景，还需要评估随机数质量、实现策略和重复处理机制。

### Snowflake（雪花算法）

Snowflake 是 Twitter 开源的分布式 ID 生成算法。Snowflake 由 64 bit 的二进制数字组成，这 64bit 的二进制被分成了几部分，每一部分存储的数据都有特定的含义：

![Snowflake 组成](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/snowflake-distributed-id-schematic-diagram.png)

- **sign (1 bit)**：符号位（标识正负），始终为 0，代表生成的 ID 为正数。
- **timestamp (41 bits)**：一共 41 位，用来表示**相对时间戳**（距自定义基点的毫秒数），可支撑 2^41 毫秒（约 69 年）。通常基点设为系统上线时间（如 2020-01-01），而非 Unix 纪元。
- **datacenter id + worker id (10 bits)**：一般来说，前 5 位表示机房 ID，后 5 位表示机器 ID（实际项目中可以根据实际情况调整）。这样就可以区分不同集群/机房的节点。
- **sequence (12 bits)**：一共 12 位，用来表示序列号。序列号为自增值。在标准 12-bit sequence 设计下，单个 Worker 每毫秒最多生成 4096 个序列号；如果调整 sequence 位数或采用改良算法，上限会变化。

> **⚠️ 高并发警示（标准 Snowflake）**：标准实现每节点每毫秒最多 4096 个序列号。如果某一毫秒内的并发请求超过 4096 个，部分实现会阻塞等待直到下一毫秒，可能在秒杀、大促等高并发瞬间出现响应延迟毛刺（Latency Spike）。一些改良实现（如 Seata 改良版、IdGenerator）通过时间戳/序列整体递增或“借用未来时间”来缓解该限制，但代价是生成时间可能短暂超前物理时间。生产环境需评估峰值 QPS，必要时采用多实例分片或改造算法增加 sequence 位数。

在实际项目中，我们一般也会对 Snowflake 算法进行改造，最常见的就是在 Snowflake 算法生成的 ID 中加入业务类型信息。

#### Snowflake 时钟回拨问题与解决

**问题根因**：NTP 同步、人工调整时间、硬件时钟漂移可能导致系统时间倒退。

**解决方案对比**：

| 方案               | 优点           | 缺点                                   | 适用场景                        |
| ------------------ | -------------- | -------------------------------------- | ------------------------------- |
| **拒绝服务**       | 实现简单       | 时钟回拨期间完全不可用                 | 对可用性要求不高的场景          |
| **等待追回**       | 保证 ID 唯一性 | 回拨幅度大时会长时间阻塞，可能影响业务 | 回拨幅度极小的场景              |
| **备用 Worker ID** | 高可用         | 实现复杂，需考虑租约、脑裂和旧实例恢复 | 已有可靠注册中心/租约机制的系统 |

备用 Worker ID 是一种可选方案，不是通用推荐。它适合已有可靠注册中心/租约机制的系统；更常见的处理还包括小幅回拨等待、超过阈值拒绝发号、持久化记录 last timestamp、通过注册中心保证 Worker ID 租约唯一。

#### Snowflake Worker ID 分配难题

在**容器化部署（Kubernetes）** 环境下，Snowflake 的 Worker ID 分配成为最大痛点：

**问题场景**：

- Pod 的 IP 和名称是动态的，重启后会变化。
- 无法像物理机一样预先配置固定的 Worker ID。
- 自动扩缩容时需要动态申领和释放 Worker ID。

**主流解决方案**：

| 方案               | 实现方式                                             | 优点                 | 缺点                    |
| ------------------ | ---------------------------------------------------- | -------------------- | ----------------------- |
| **ZooKeeper 注册** | 服务启动时在 ZK 创建临时节点，节点序号作为 Worker ID | 自动回收，崩溃后释放 | 依赖 ZK，增加运维复杂度 |
| **Redis 注册**     | 使用 `SETNX` + 过期时间实现 Worker ID 申领           | 轻量，无额外组件     | 需处理 Redis 宕机场景   |
| **数据库分配**     | 启动时从数据库分配并持久化到本地文件                 | 简单可靠             | 依赖数据库              |
| **动态 Worker ID** | 使用 Pod IP 或 UID 哈希生成                          | 无需中心化组件       | 可能产生哈希冲突        |

**推荐**：生产环境可使用美团 Leaf（Snowflake 模式依赖 ZooKeeper 管理 `workId`），或使用滴滴 Tinyid 这类号段模式方案来规避 Worker ID 分配问题。

我们再来看看 Snowflake 算法的优缺点：

- **优点**：生成速度比较快、生成的 ID 有序递增、比较灵活（可以对 Snowflake 算法进行简单的改造比如加入业务 ID）。
- **缺点**：**时钟回拨风险**（需额外处理，详见上方解决方案）、依赖机器 ID 对分布式环境不友好（当需要自动启停或增减机器时，固定的机器 ID 可能不够灵活）。

如果你想要使用 Snowflake 算法的话，一般不需要你自己再造轮子。生产环境可以优先评估成熟实现，例如 Leaf、Tinyid、IdGenerator 或云厂商发号服务，但需要结合维护状态、语言生态、时钟回拨策略、Worker ID 分配方式和压测结果选择。

如果要从 Snowflake ID 中反解信息，需要按实际位分配来处理。以常见 41-bit timestamp + 10-bit worker + 12-bit sequence 为例，右移 22 位可以得到相对时间戳，再加上自定义 epoch 得到生成时间；通过 bit mask 可以取出 Worker ID 和 sequence。只要调整了位数或 epoch，解析逻辑也必须同步调整。

并且，Seata 还提出了“改良版雪花算法”，针对原版雪花算法进行了一定的优化改良，解决了时间回拨问题，大幅提高的 QPS。具体介绍和改进原理，可以参考下面这两篇文章：

- [Seata 基于改良版雪花算法的分布式 UUID 生成器分析](https://seata.io/zh-cn/blog/seata-analysis-UUID-generator.html)
- [在开源项目中看到一个改良版的雪花算法，现在它是你的了。](https://www.cnblogs.com/thisiswhy/p/17611163.html)

## 工业级分布式 ID 开源框架对比

评估这类框架时，不要只看功能列表，还要关注几个生产维度：项目是否仍在维护、最近 release/commit/issue 活跃度、依赖组件（MySQL、Redis、ZooKeeper、etcd 等）、时钟回拨策略、Worker ID 分配策略、客户端模式还是服务端模式，以及压测条件下的 P99/TP999 延迟。

### UidGenerator(百度)

[UidGenerator](https://github.com/baidu/uid-generator) 是百度开源的一款基于 Snowflake 的唯一 ID 生成器。

不过，UidGenerator 对 Snowflake 进行了改进，生成的唯一 ID 组成如下：

![UidGenerator 生成的 ID 组成](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/uidgenerator-distributed-id-schematic-diagram.png)

- **sign (1 bit)**：符号位（标识正负），始终为 0，代表生成的 ID 为正数。
- **delta seconds (28 bits)**：当前时间，相对于时间基点“2016-05-20”的增量值，单位：秒，最多可支持约 8.7 年。
- **worker id (22 bits)**：机器 ID，最多可支持约 420w 次机器启动。内置实现为在启动时由数据库分配，默认分配策略为用后即弃，后续可提供复用策略。
- **sequence (13 bits)**：每秒下的并发序列，13 bits 可支持每秒 8192 个并发。

可以看出，和原始 Snowflake 生成的唯一 ID 的组成不太一样。并且，上面这些参数我们都可以自定义。

UidGenerator 官方文档中的介绍如下：

![](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/uidgenerator-introduction-official-documents.png)

UidGenerator 官方仓库长期不活跃，新项目不建议只因为知名度直接选用，需要先评估维护状态、依赖安全和 fork 生态。想要进一步了解的朋友，可以看看 [UidGenerator 的官方介绍](https://github.com/baidu/uid-generator/blob/master/README.zh_cn.md)。

### Leaf(美团)

[Leaf](https://github.com/Meituan-Dianping/Leaf) 是美团开源的一个分布式 ID 解决方案。这个项目的名字 Leaf（树叶）起源于德国哲学家、数学家莱布尼茨的一句话：“There are no two identical leaves in the world”（世界上没有两片相同的树叶）。这个命名也比较有辨识度。

Leaf 提供了 **号段模式** 和 **Snowflake** 这两种模式来生成分布式 ID。并且，它支持双号段，还解决了雪花 ID 系统时钟回拨问题。不过，时钟问题的解决需要弱依赖于 ZooKeeper（使用 ZooKeeper 作为注册中心，通过在特定路径下读取和创建子节点来管理 `workId`）。

Leaf 的诞生主要是为了解决美团各个业务线生成分布式 ID 的方法多种多样以及不可靠的问题。

Leaf 对原有的号段模式进行了核心优化——**双 Buffer 机制（Double Buffer Optimization）**：

> **设计原理**：Leaf 不会在号段用尽时才去数据库申请，而是在当前号段消耗到一定阈值后，由异步线程提前去数据库申请下一个号段并预加载到内存。具体阈值和实现细节建议以 Leaf 当前版本源码为准。双 Buffer 机制可以让 ID 获取的 TP999 更平稳，降低数据库访问带来的延迟抖动。

（图片来自于美团官方文章：[《Leaf——美团点评分布式 ID 生成系统》](https://tech.meituan.com/2017/04/21/mt-leaf.html)）

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-id/leaf-principle.png)

根据美团当时文章和项目 README 的压测描述，在 4C8G VM 和公司 RPC 调用方式下，Leaf 曾达到近 5w/s QPS、TP999 约 1ms。这个数据只能作为参考，实际性能还要看数据库、RPC 框架、网络、号段大小和部署方式。

### Tinyid(滴滴)

[Tinyid](https://github.com/didi/tinyid) 是滴滴开源的一款基于数据库号段模式的唯一 ID 生成器。

数据库号段模式的原理我们在上面已经介绍过了。**Tinyid 有哪些亮点呢？**

为了搞清楚这个问题，我们先来看看基于数据库号段模式的简单架构方案。（图片来自于 Tinyid 的官方 wiki:[《Tinyid 原理介绍》](https://github.com/didi/tinyid/wiki/tinyid%E5%8E%9F%E7%90%86%E4%BB%8B%E7%BB%8D)）

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-id/tinyid-principle.png)

在这种架构模式下，我们通过 HTTP 请求向发号器服务申请唯一 ID。负载均衡 router 会把我们的请求送往其中的一台 tinyid-server。

这种方案有什么问题呢？在我看来（Tinyid 官方 wiki 也有介绍到），主要由下面这 2 个问题：

- 获取新号段的情况下，程序获取唯一 ID 的速度比较慢。
- 需要保证数据库高可用，这个是比较麻烦且耗费资源的。

除此之外，HTTP 调用也存在网络开销。

Tinyid 的原理比较简单，其架构如下图所示：

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-id/tinyid-architecture-design.png)

相比于基于数据库号段模式的简单架构方案，Tinyid 方案主要做了下面这些优化：

- **双号段缓存**：为了避免在获取新号段的情况下，程序获取唯一 ID 的速度比较慢。Tinyid 中的号段在用到一定程度的时候，就会去异步加载下一个号段，保证内存中始终有可用号段。
- **增加多数据库支持**：支持多个数据库，提高可用性。前提是各库分配的号段范围、步长或业务分片互不重叠，并且故障切换时不会重复分配已经发出的号段。
- **增加 tinyid-client**：纯本地操作，无 HTTP 请求消耗，性能和可用性都有很大提升。

Tinyid 的优缺点这里就不分析了，结合数据库号段模式的优缺点和 Tinyid 的原理就能知道。

### IdGenerator(个人)

和 UidGenerator、Leaf 一样，[IdGenerator](https://github.com/yitter/IdGenerator) 也是一款基于 Snowflake 的唯一 ID 生成器。

IdGenerator 官方自述有如下特点：

- 生成的唯一 ID 更短；
- 兼容所有雪花算法（号段模式或经典模式，大厂或小厂）；
- 原生支持 C#/Java/Go/C/Rust/Python/Node.js/PHP（C 扩展）/SQL/ 等语言，并提供多线程安全调用动态库（FFI）；
- 解决了时间回拨问题，支持手工插入新 ID（当业务需要在历史时间生成新 ID 时，用本算法的预留位能生成 5000 个每秒）；
- 不依赖外部存储系统；
- 默认配置下，ID 可用 71000 年不重复。

这些参数依赖位分配、基础时间、Worker ID 和序列配置，生产使用前仍应基于自己的配置计算容量上限并压测，不宜直接把默认宣传数据当成所有场景下的承诺。

IdGenerator 生成的唯一 ID 组成如下：

![IdGenerator 生成的 ID 组成](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/idgenerator-distributed-id-schematic-diagram.png)

- **timestamp (位数不固定)**：时间差，是生成 ID 时的系统时间减去 BaseTime（基础时间，也称基点时间、原点时间、纪元时间，默认值为 2020 年）的总时间差（毫秒单位）。初始为 5 bits，随着运行时间而增加。如果觉得默认值太老，你可以重新设置，不过要注意，这个值以后最好不变。
- **worker id (默认 6 bits)**：机器 ID，机器码，最重要参数，是区分不同机器或不同应用的唯一 ID，最大值由 `WorkerIdBitLength`（默认 6）限定。如果一台服务器部署多个独立服务，需要为每个服务指定不同的 WorkerId。
- **sequence (默认 6 bits)**：序列数，是每毫秒下的序列数，由参数中的 `SeqBitLength`（默认 6）限定。增加 `SeqBitLength` 会让性能更高，但生成的 ID 也会更长。

Java 语言使用示例：<https://github.com/yitter/idgenerator/tree/master/Java>。

## 总结

通过这篇文章，我基本上已经把最常见的分布式 ID 生成方案都总结了一波。

除了上面介绍的方式之外，像 ZooKeeper 这类中间件也可以帮助我们生成唯一 ID。**没有银弹，一定要结合实际项目来选择最适合自己的方案。**

最后再强调一下：不要把 ID 连续性当成硬需求。大多数业务只要求唯一，不要求连续；连续 ID 还可能暴露业务量。号段模式、Snowflake、UUID 都可能出现跳号，跳号通常不是 bug。需要排序时，建议优先使用创建时间字段，不要完全依赖 ID 排序。

**核心方案横向对比表：**

| **方案**       | **性能** | **有序性**            | **运维成本** | **适用场景**                                                   |
| -------------- | -------- | --------------------- | ------------ | -------------------------------------------------------------- |
| **数据库自增** | 低       | 严格递增              | 低           | 业务量小、单机架构、后台系统                                   |
| **号段模式**   | 高       | 趋势递增              | 中           | 高并发、追求极致吞吐量的互联网业务                             |
| **Redis 方案** | 很高     | 单 key 正常运行时递增 | 中           | 已有 Redis 集群，能容忍极小概率 ID 回退                        |
| **Snowflake**  | 高       | 趋势递增              | 中           | 大中型分布式系统，需要处理 Worker ID、时钟回拨和容量规划       |
| **UUID v7**    | 高       | 趋势递增              | 极低         | 云原生、无中心化集群、追求开箱即用；主键场景仍建议唯一索引兜底 |

不过，本文主要介绍的是分布式 ID 的理论知识。在实际的面试中，面试官可能会结合具体的业务场景来考察你对分布式 ID 的设计，你可以参考这篇文章：[分布式 ID 设计指南](./distributed-id-design)（对于实际工作中分布式 ID 的设计也非常有帮助）。

<!-- @include: @article-footer.snippet.md -->
