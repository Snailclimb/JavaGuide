---
title: MySQL数据同步到Elasticsearch详解：常见方案与一致性处理
description: MySQL数据同步到Elasticsearch方案详解，对比应用层双写、定时同步、Canal、Debezium和Flink CDC，并介绍全量同步、增量同步、消息乱序、幂等、删除、重建和数据对账。
category: 数据库
tag:
  - MySQL
  - Elasticsearch
  - 数据同步
head:
  - - meta
    - name: keywords
      content: MySQL同步Elasticsearch,MySQL同步ES,MySQL ES同步,Canal同步ES,Flink CDC同步ES,Debezium,CDC,binlog,全量同步,增量同步,数据一致性
---

MySQL 擅长事务处理，Elasticsearch 擅长全文检索和复杂搜索。很多系统会把 MySQL 作为权威数据源，再把搜索需要的字段整理成文档写入 Elasticsearch。

这样做之后，麻烦会集中在以下环节：

- 第一次上线时，MySQL 里的存量数据怎么导入？
- MySQL 后续发生新增、修改和删除，怎样持续更新 ES？
- 同步任务重复消费、乱序或者中断时，怎样避免旧数据覆盖新数据？
- 索引结构调整或数据不一致时，怎样重建并平滑切换？

一套可用的同步方案通常要同时考虑 **全量同步、增量同步、失败恢复和数据校验**。只解决其中一个环节，很容易在上线或故障恢复时卡住。

## 先明确同步目标

MySQL 到 Elasticsearch 的同步通常分成两类：

- **全量同步**：读取 MySQL 中已有的数据，构建一份完整的 ES 索引。常用于首次上线、索引重建和数据修复。
- **增量同步**：持续捕获 MySQL 提交后的 `INSERT`、`UPDATE`、`DELETE`，更新对应的 ES 文档。

两者经常组合使用。比如，先全量导入 1000 万条历史数据，再从全量任务开始时记录的 binlog 位点继续消费增量，直到追上最新数据。

还要注意，ES 写入成功不代表数据已经立刻可以被搜索到。Elasticsearch 通过 `refresh` 让新写入的文档对搜索可见，因此端到端延迟至少包含变更捕获、消息排队、数据处理、ES 写入和 `refresh` 等环节。官方将这种搜索可见性称为[近实时搜索](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search)。

![MySQL 到 ES 全量与增量衔接](https://oss.javaguide.cn/github/javaguide/database/es/mysql-es-full-incremental-sync.webp)

## 选型前先定义同步契约

同一个同步工具，放到不同的数据模型和一致性要求下，结果可能完全不同。开始选型前，先把下面这些约定写清楚：

- **权威数据源**：通常以 MySQL 为准，ES 只保存可重建的搜索视图。业务不能绕开 MySQL 直接修改 ES 中的权威字段。
- **文档生成规则**：明确哪些表和字段组成一份 ES 文档，文档 `_id` 从哪里取，多表变更分别会重建哪些文档。
- **删除语义**：物理删除、逻辑删除和业务失效分别对应 ES delete、保留删除标记，还是重新生成文档。
- **顺序与版本**：确定同一文档的分区键和版本来源，避免重试、并发和多条链路让旧值覆盖新值。
- **延迟与恢复目标**：约定正常情况下允许多大延迟，链路中断后多久追平，超过 binlog 或 MQ 保留时间后怎样重新初始化。
- **字段类型与空值**：明确金额、无符号整数、日期时间、枚举和空字符串怎样写入 ES，区分字段缺失、`null` 和空值。
- **源库资源预算**：评估全量扫描的连接数、并发度和磁盘 I/O，确定读主库还是只读副本，并给同步任务设置限速和暂停条件。
- **Schema 变更流程**：字段新增、类型修改、分词器调整时，由谁更新 mapping，应用、同步任务和索引模板按什么顺序发布。

验收也不能只检查“全量条数相等”。至少要覆盖新增、修改、物理删除、逻辑删除、重复消息和乱序消息；还要主动暂停 ES 或同步任务，观察恢复后能否追平。新索引全量回灌、增量追平、数据校验、别名切换和回滚也要完整走一遍。同步契约里的每一项都应该能对应到一个测试用例或监控指标。

## 常见方案对比

| 方案             | 全量同步   | 增量同步       | 主要优点                             | 主要问题                             | 适用场景                               |
| ---------------- | ---------- | -------------- | ------------------------------------ | ------------------------------------ | -------------------------------------- |
| 应用层同步双写   | 不支持     | 支持           | 实现直观、链路短                     | 无法原子提交、侵入业务、容易乱序     | 数据量小、允许短暂不一致的简单业务     |
| 本地消息表 + MQ  | 不支持     | 支持           | 业务更新与事件落库可以放进同一事务   | 仍需补全量导入、投递和消费组件       | 应用已经采用事件驱动架构               |
| 定时同步         | 支持       | 支持按条件扫描 | 简单、运维成本低                     | 延迟较高，删除和扫描窗口需要额外处理 | 数据量小、更新频率低                   |
| Canal + 消费端   | 需单独处理 | 支持           | 生态成熟、便于接入 MQ 和自定义消费者 | 需要维护位点、消费端和全量衔接       | 已有 Java/MQ 基础设施的增量同步        |
| Debezium + Kafka | 支持快照   | 支持           | Kafka Connect 生态完善、事件格式统一 | 组件较多，依赖 Kafka Connect         | 已有 Kafka Connect 或多数据源 CDC 平台 |
| Flink CDC        | 支持       | 支持           | 全量与增量自动衔接，适合复杂转换     | 部署和状态管理成本较高               | 数据量大、需要流式处理或多表转换       |

表中的“支持”只表示工具提供了对应能力，不代表接入后天然满足业务的一致性要求。最终效果还取决于 ES 写入方式、消息顺序、Checkpoint、重试策略和索引设计。

## 应用层双写

应用层双写是在业务代码更新 MySQL 后，再调用 Elasticsearch API 更新索引。

![应用层同步双写](https://oss.javaguide.cn/github/javaguide/database/es/es-mq-synchronization-synchronous-double-write.png)

假设写入顺序是“先 MySQL，后 ES”，常见结果如下：

| 场景                    | MySQL | Elasticsearch | 结果               |
| ----------------------- | ----- | ------------- | ------------------ |
| 两次写入都成功          | 成功  | 成功          | 数据一致           |
| MySQL 写入失败          | 回滚  | 不执行        | 数据一致           |
| MySQL 成功后应用崩溃    | 成功  | 未执行        | 数据不一致         |
| MySQL 成功、ES 写入失败 | 成功  | 失败          | 数据不一致         |
| ES 已写入但客户端超时   | 成功  | 结果未知      | 重试时必须保证幂等 |

MySQL 事务无法回滚已经提交到 Elasticsearch 的写入，Elasticsearch 也不能和 MySQL 组成一个常规的本地事务。因此，同步双写通常只能追求最终一致性。

直接双写还有两个容易遗漏的问题。

第一个是性能和可用性。业务请求要多等待一次 ES 调用，ES 抖动也会影响主链路。如果改成线程池、`CompletableFuture` 或普通 MQ 异步发送，请求延迟会下降，但“MySQL 已提交、消息还没发出时进程崩溃”的缺口仍然存在。

第二个是并发乱序。假设同一条商品记录先后更新为 `v2`、`v3`，两次 ES 请求的到达顺序可能反过来，最终让旧的 `v2` 覆盖 `v3`。仅仅把写入改成异步，并不会自动解决顺序问题。

### 用本地消息表补上事务缺口

对同步可靠性要求较高时，可以使用 **Transactional Outbox（本地消息表）**：

1. 在同一个 MySQL 事务里更新业务表，并插入一条 outbox 事件。
2. 独立投递程序或 CDC 组件读取 outbox 表，把事件发送到 MQ。
3. ES 消费端处理消息，成功后记录消费结果；失败则重试或进入死信队列。

这样可以保证“业务数据更新”和“待发送事件落库”同时成功或同时回滚。Debezium 也提供了专门的 [Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html) 来捕获并转换 outbox 事件。

本地消息表解决了事件丢失问题，但仍然需要处理重复消费、同一业务主键的消息顺序、全量初始化和数据对账。

## 定时同步

如果数据量不大、更新频率低，并且业务可以接受分钟级甚至天级延迟，定时任务往往已经够用。个人博客、内部知识库、小型后台搜索都是比较典型的场景。

![定时同步](https://oss.javaguide.cn/github/javaguide/database/es/es-mq-synchronization-scheduled-task.png)

定时同步不一定每次都要全量扫描，也可以按更新时间做增量查询：

```sql
SELECT id, title, content, updated_at
FROM article
WHERE (
        updated_at > :last_updated_at
        OR (updated_at = :last_updated_at AND id > :last_id)
      )
  AND updated_at <= :task_cutoff
ORDER BY updated_at, id
LIMIT :batch_size;
```

任务开始时先固定 `task_cutoff`，每批处理完再保存由 `last_updated_at` 和 `last_id` 组成的复合游标。下一批继续使用同一个截止时间，直到这轮数据全部处理完成。这样既能避开深分页，也不会因为多条记录的 `updated_at` 相同而漏数。

物理删除不会留下 `updated_at`，所以定时增量同步通常要配合逻辑删除字段、删除记录表，或者定期做全量校验。否则 MySQL 中已经删除的数据可能长期留在 ES。

使用 Spring Task 时，每周一零点执行一次任务可以这样写：

```java
@Scheduled(cron = "0 0 0 ? * MON", zone = "Asia/Shanghai")
public void rebuildArticleIndex() {
    // 分页读取 MySQL，批量写入新的 ES 索引
}
```

### 全量重建时使用索引别名

不要在用户正在查询的旧索引上边删边写。更稳妥的做法是：

1. 创建带版本号的新索引，例如 `articles_v2`，提前配置好 `settings` 和 `mappings`。
2. 把 MySQL 全量数据写入新索引，并完成数量、抽样内容和查询结果校验。
3. 补齐全量任务执行期间产生的增量变更。
4. 使用 `_aliases` API 把业务别名从旧索引原子切换到新索引。
5. 保留旧索引一段时间，确认无误后再清理。

```http
POST /_aliases
{
  "actions": [
    { "remove": { "index": "articles_v1", "alias": "articles", "must_exist": true } },
    { "add": { "index": "articles_v2", "alias": "articles" } }
  ]
}
```

Elasticsearch 的 [Aliases API](https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html) 可以在一个原子操作中执行多项别名变更。不过，别名切换只解决读流量的平滑迁移；如果重建期间仍有业务写入，还必须通过 binlog 回放、双索引写入或暂停写入等方式补齐这段变更。

## 基于 binlog 的 CDC

CDC（Change Data Capture，变更数据捕获）方案会读取 MySQL binlog，把已经提交的数据变化转换为下游可消费的事件。这类方案不需要在每个业务接口里维护 ES 写入逻辑，也是目前更常见的增量同步方式。

接入前要核对以下配置：

- MySQL 已开启 binlog，并为 CDC 账号配置必要的复制和表读取权限。
- 使用工具支持的 binlog 格式。Canal、Debezium、Flink CDC 这类行级变更工具通常要求 `binlog_format=ROW`；Debezium 还明确要求 `binlog_row_image=FULL`，其他工具也要按所用版本核对这一配置。MySQL 8.4 的 `binlog_format` 默认是 `ROW`，旧环境和云数据库仍应以实际配置为准。
- binlog 保留时间覆盖最长故障恢复窗口。任务停得太久、所需 binlog 已被清理时，通常只能重新做快照或全量同步。
- 每个 CDC 客户端使用唯一的 `server_id`；高可用切换时还要核对 GTID、位点恢复和所连接副本的 binlog 配置。
- CDC 账号只授予工具文档要求的复制、元数据和目标表读取权限，ES 账号限制在目标索引或别名的写入范围；凭据不要直接写进提交到代码库的任务配置。

### Canal

[Canal](https://github.com/alibaba/canal) 会模拟 MySQL Replica 的交互协议，向 MySQL 请求 binlog 并解析为结构化变更事件。

![Canal 工作原理](https://oss.javaguide.cn/github/javaguide/open-source-project/canal-overview.png)

Canal Server 的核心职责是增量日志订阅和解析。下游可以使用 Canal Client 直接消费，也可以让 Canal 把消息投递到 Kafka、RocketMQ 等 MQ，再由同步服务更新 ES。

![Canal 通过 MQ 同步数据](https://oss.javaguide.cn/github/javaguide/database/es/es-mq-synchronization-canal-with-mq.png)

引入 MQ 主要有几个作用：

- Canal 与 ES 消费端解耦，ES 短暂不可用时变更可以先积压在 MQ。
- 同一业务主键可以路由到同一个分区，便于维持局部顺序。
- 消费端可以合并消息并调用 ES Bulk API，减少请求开销。
- 保留一定时间的消息后，可以重放失败数据或重新构建下游。

MQ 并不会自动带来一致性。消费端仍然要确认消息何时提交、失败如何重试、重试是否幂等，以及死信数据由谁修复。

Canal Server 主要负责增量订阅。初始全量数据可以通过自研分页任务或经过兼容性验证的批量同步工具导入。[DataX 开源版](https://github.com/alibaba/DataX/tree/master/elasticsearchwriter)虽然提供 ElasticsearchWriter，但官方 README 仍注明只在 Elasticsearch 5.x 上测试，接入 ES 7/8 前必须验证 mapping type、客户端协议和写入参数。Canal Client Adapter 也提供过针对部分下游的 ETL 能力，是否适合当前 ES 版本和复杂映射，同样要按实际版本验证。全量和增量由两套任务完成时，最关键的是记录并衔接正确的 binlog 位点。

### Flink CDC

Flink CDC 的 MySQL Source 可以先读取表快照，再继续消费 binlog。它会按分片键把表拆成多个 Chunk，并行读取快照；每个 Chunk 读取前后记录 binlog 的 `LOW`、`HIGH` 位点，再合并这段时间内发生的变更，得到一致的 Chunk 结果。

这种增量快照算法具有几个特点：

- 快照阶段可以并行读取。
- 以 Chunk 为粒度执行 Checkpoint，失败后可以从已完成的进度恢复。
- 不需要在整个快照阶段持有 `FLUSH TABLES WITH READ LOCK` 获取的全局读锁。
- 全量快照结束后自动继续读取 binlog，减少手工衔接位点的工作。

![Flink CDC 增量快照衔接 binlog](https://oss.javaguide.cn/github/javaguide/database/es/flink-cdc-incremental-snapshot.webp)

截至 Flink CDC 3.6，官方提供了 [MySQL Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/mysql/) 和 [Elasticsearch Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/elasticsearch/)，可以直接描述 MySQL 到 ES 的 Pipeline。ES Sink 不会自动创建索引，使用前仍要准备索引、mapping 和相关模板。

Flink CDC 文档中的 exactly-once 主要描述 Source 在快照和 binlog 读取阶段的处理语义。Flink 官方 Elasticsearch Sink 文档给出的基础交付保证是 at-least-once：Checkpoint 会等待已经提交的 ES 请求完成，但故障恢复后仍可能重放请求。使用固定文档 ID 和幂等的 index/upsert，可以让重复写入落到同一份文档；如果同一文档还可能乱序，则要再配合源端版本号。Source 的 exactly-once 不能直接推导出 MySQL 到 ES 端到端 exactly-once。

### Debezium

Debezium 的 MySQL Connector 通常运行在 Kafka Connect 上。首次启动时，它可以先执行一致性快照，再从快照对应的 binlog 位点持续发送行级变更事件到 Kafka Topic。后续还可以按需触发分块的增量快照。

如果团队已经使用 Kafka Connect，或者准备把多种数据库的变更统一接入 Kafka，Debezium 比自研 binlog 解析和事件格式更省事。写入 ES 时还需要 Elasticsearch Sink Connector 或自定义消费者，删除事件、Topic 压缩、Schema 变更和消息转换规则都要单独设计。

具体快照流程和配置项可以参考 [Debezium MySQL Connector 官方文档](https://debezium.io/documentation/reference/stable/connectors/mysql.html)。

## 生产环境必须处理的问题

工具选型只决定了变更怎么到达下游。数据能否保持正确，还取决于下面这些实现细节。

![MySQL 同步 ES 的一致性保障](https://oss.javaguide.cn/github/javaguide/database/es/mysql-es-consistency-guardrails.webp)

### 1. 把 MySQL 主键作为 ES 文档 ID

同步时应使用稳定、唯一的业务主键作为 ES `_id`。同一条数据重复执行 `index` 或 upsert 时会更新同一份文档，消费者因此更容易实现幂等。

如果让 ES 自动生成 `_id`，消息重试可能写出多份重复文档，删除时也很难找到准确目标。

### 2. 保证同一文档的事件顺序

全局有序通常成本很高，MySQL 同步 ES 多数只需要保证同一个文档 ID 的事件有序。常用做法是按业务主键选择 MQ 分区，让同一主键的事件进入同一分区并串行处理。

即便如此，重平衡、失败重试和多条同步链路仍可能制造乱序。对不能容忍旧值覆盖新值的场景，可以在事件和 ES 文档中携带单调递增的业务版本号，在写入前丢弃旧版本。版本号必须来自可靠的顺序来源，不能直接用多台机器各自生成的本地时间代替。

如果源端版本可以表示成非负 `long`，[ES Bulk API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk) 的 `index` 和 `delete` 操作支持设置 `version` 和 `version_type=external`：只有版本号更高的写入才能覆盖已有文档。删除事件也要携带同一套版本，否则延迟到达的旧更新仍可能把已删除文档重新写回来。GTID、binlog 文件名和位点通常不能不经转换就直接当作 ES 外部版本号，落地前要先定义稳定的比较规则。

### 3. 正确处理删除

`INSERT` 和 `UPDATE` 最终可以统一为 upsert，`DELETE` 则必须显式转换成 ES delete 操作。若业务使用逻辑删除，还要统一约定是删除 ES 文档，还是保留文档并写入 `deleted=true`。

如果同步任务会按 `status`、`is_deleted` 等可变字段过滤数据，还要处理“原来符合条件，更新后不再符合”的情况。普通过滤只会丢弃新的更新事件，不会自动为 ES 中的旧文档补一条 delete。可以保留状态字段并在查询时过滤，也可以识别状态迁移并显式生成删除事件。

多表聚合文档尤其容易漏删。例如商品文档包含商品表、品牌表和类目表字段，删除一个类目后，不能只删除“类目 ID 对应的 ES 文档”，而要找出受影响的商品并重新构建它们的文档。

### 4. 处理多表文档

binlog 记录的是表中行的变化，而 ES 常用的是反范式文档。一份商品文档可能组合商品、品牌、库存和标签等多张表的数据。

CDC 捕获到品牌名称变化时，需要知道哪些商品引用了这个品牌。常见处理方式有三种：

- 消费端根据变更事件查询 MySQL，重新组装受影响的完整文档。
- 先在 MySQL 中维护适合搜索的宽表，再同步宽表。
- 使用 Flink 等流处理引擎维护关联状态并生成下游文档。

第一种实现容易，但要控制回查 MySQL 的并发和缓存；第二种增加了宽表维护成本；第三种适合数据量和关联逻辑较复杂的场景，但状态、Checkpoint 和作业升级都需要专门运维。

### 5. 批量写入也要检查单条结果

Elasticsearch [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) 能在一次请求中执行多条 index、update 和 delete，减少网络和请求处理开销。

一次 Bulk 请求中可能只有部分文档失败。消费者不能只检查 HTTP 状态码，还要逐条检查 `items`，只重试网络超时、429、部分 5xx 等暂时性错误。mapping 冲突、字段格式错误等问题继续重试通常没有意义，应记录原始消息并转入死信队列或人工修复流程。

Bulk 批次也没有适用于所有系统的固定大小。批次数量、字节数、并发度和刷新频率要结合文档大小、分片数量、ES 写入队列和压测结果调整。

ES 写入速度低于上游变更速度时，要让压力沿链路向上游传递：限制在途 Bulk 请求和消费者并发，必要时暂停消费或降低 Source 读取速率。不要用无界内存队列吸收积压；它只会把 ES 的写入瓶颈变成同步进程的内存故障。使用 MQ 时，还要保证消息保留时间覆盖预期的最长积压时间。

### 6. 管理 mapping 和 DDL 变更

MySQL 新增字段，不代表 ES mapping 应该自动新增同名字段。动态 mapping 可能把日期、数字或字符串识别成错误类型，也可能因为字段数量失控引发 mapping explosion。

字段映射要按查询方式设计，不能只按 MySQL 类型机械转换：

- 需要全文检索的名称、标题和描述使用 `text`；还要排序、聚合或精确过滤时，再增加 `keyword` 子字段。状态码、标签、邮箱等结构化字符串通常直接使用 `keyword`。
- 金额不要无条件转成 `float` 或 `double`。可以保留最小货币单位的整数，也可以根据允许的精度使用 `scaled_float`；两种方式都要在同步契约里固定换算规则。
- MySQL `BIGINT UNSIGNED` 的上限超过 ES `long`，大值要使用 `unsigned_long` 或转换为 `keyword`，不能在序列化过程中静默溢出。
- MySQL `TIMESTAMP` 会根据会话时区和 UTC 互转，`DATETIME` 不做同样的自动转换。同步链路应固定源端会话时区和 ES 日期格式，并用跨时区、夏令时附近的样例验证结果。
- 区分字段缺失、`null`、空字符串和空数组。它们是否参与 `exists` 查询、排序、聚合以及局部更新，需要在写入前统一处理。

生产环境更适合使用显式 mapping 和索引模板。字段类型或分词器发生不兼容变更时，创建新索引并全量重建，再通过别名切换。CDC 任务还要明确如何处理 MySQL 的 DDL 事件，以及代码、索引模板和同步任务的发布顺序。

### 7. 监控延迟、失败和 binlog 保留时间

至少应关注这些指标：

- 当前消费位点与 MySQL 最新 binlog 位点的差距。
- MQ 消息积压量和最老消息等待时间。
- ES Bulk 成功率、单条失败原因、重试次数和死信数量。
- 全量任务读取速率、写入速率和剩余数据量。
- binlog 剩余保留时间是否大于当前积压和故障恢复时间。
- ES 集群状态、写入拒绝、磁盘水位和 refresh 延迟。

告警阈值应该根据业务的延迟目标和压测基线设置。把“延迟超过 60 秒”“失败率超过 1%”写成所有系统通用阈值，通常没有实际依据。

### 8. 定期对账，并保留重建能力

消息不积压不代表数据一定一致。同步规则错误、漏处理删除、mapping 冲突和人工修改 ES 都可能造成静默偏差。

对账可以分层进行：

1. 比较 MySQL 和 ES 的有效记录总数，快速发现明显差异。
2. 按主键范围或业务分区统计数量和摘要，缩小问题范围。
3. 抽样比较关键字段，或对规范化后的文档计算哈希。
4. 把差异主键交给修复任务重新生成对应文档，避免直接人工修改 ES。

无论日常增量链路多可靠，都应该保留“一键创建新索引、全量回灌、追平增量、校验、切换别名”的能力。它既用于修复数据，也用于 mapping 和分词器升级。

### 9. 为故障恢复准备操作手册

告警触发后再临时判断“该重试还是该重建”，很容易扩大故障。上线前应为常见故障写好恢复动作，并通过演练确认位点、Checkpoint、MQ Offset 和索引别名都能按预期工作。

| 故障场景                    | 处理方式                                                                | 不应直接做的事                               |
| --------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| ES 短暂不可用或返回 429/5xx | 暂停或限速写入，保留未确认消息，按退避策略重试，恢复后观察积压是否下降  | 未写入成功就提交消费位点                     |
| mapping 冲突或字段格式错误  | 停止无效重试，记录原始事件和失败原因，修复模板或转换规则后定向重放      | 无限重试同一条确定性错误                     |
| CDC 任务重启且状态仍可用    | 从已保存的 Checkpoint、binlog 位点或 MQ Offset 恢复，并依靠幂等写入去重 | 清空状态后直接从最新位点启动                 |
| 所需 binlog 或消息已经过期  | 重新执行一致性快照或全量重建，并重新建立全量与增量的衔接                | 跳到最新位点后继续运行并宣称数据已经一致     |
| ES 索引损坏或规则整体变更   | 创建新索引，全量回灌、追平增量并校验，再切换别名                        | 在旧索引上边删边补，且不给查询流量保留回退点 |

操作手册还要记录负责人、所需权限、状态文件或 Checkpoint 的位置、死信重放入口以及回滚条件。演练结束后，检查恢复过程中是否出现源库压力突增、ES 写入拒绝、binlog 再次过期或同一批数据反复重放。

## 如何选择？

- 数据量小、更新不频繁、允许较长延迟：优先考虑定时增量同步，配合周期性全量重建。
- 业务已经有可靠的领域事件和 MQ：可以使用本地消息表 + MQ，同步服务消费事件更新 ES。
- 主要需求是稳定获取 MySQL 增量变更，团队熟悉 Java 和 MQ：Canal + MQ + 自定义消费者通常比较合适，全量部分单独设计。
- 已有 Kafka Connect 平台，或者需要统一接入多种数据库：可以考虑 Debezium。
- 数据量较大，希望全量和增量自动衔接，或者需要流式清洗、多表转换：可以考虑 Flink CDC。

最终选型不要只比较工具吞吐量。先确定业务能接受的搜索延迟、故障恢复时间、部署组件数量、多表文档复杂度和团队运维能力，再通过接近生产的数据量和文档结构做压测。

## 参考资料

- [MySQL 8.4：设置二进制日志格式](https://dev.mysql.com/doc/refman/8.4/en/binary-log-setting.html)
- [Canal 项目文档](https://github.com/alibaba/canal)
- [Flink CDC 3.6：MySQL Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/mysql/)
- [Flink CDC 3.6：Elasticsearch Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/elasticsearch/)
- [Flink：Elasticsearch Sink 的故障恢复语义](https://nightlies.apache.org/flink/flink-docs-stable/docs/connectors/datastream/elasticsearch/)
- [Debezium MySQL Connector](https://debezium.io/documentation/reference/stable/connectors/mysql.html)
- [Debezium Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)
- [Elasticsearch Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)
- [Elasticsearch Aliases](https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html)
- [Elasticsearch 字段类型](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/field-data-types)
- [Elasticsearch 数值字段类型](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/number)
- [MySQL 8.4：DATE、DATETIME 和 TIMESTAMP 类型](https://dev.mysql.com/doc/refman/8.4/en/datetime.html)
- [Spring Framework：Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)

<!-- @include: @article-footer.snippet.md -->
