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

第一次上线，需要把 MySQL 的存量数据导入 ES；上线后，新增、修改和删除还要持续同步。同步任务一旦中断或重试，又会遇到漏数据、重复消费、旧值覆盖新值等问题。索引结构调整时，还得在重建数据的同时维持搜索服务。

因此，MySQL 同步 ES 要一起考虑 **全量同步、增量同步、失败恢复和数据校验**。

## 先明确同步目标

假设 MySQL 已经存了 1000 万条数据，搜索功能刚上线时，需要先读取这些存量数据，写出一份完整的 ES 索引。这一步是 **全量同步**，索引重建和数据修复时也会用到。

全量导入期间，MySQL 仍可能发生新的写入。这些已经提交的 `INSERT`、`UPDATE`、`DELETE` 需要继续更新到对应的 ES 文档中，也就是 **增量同步**。全量和增量由两套任务完成时，要在首次全量读取前保存 binlog 位点，或者使用一致性快照对应的位点，再从这个位置完整回放增量并持续消费。回放可能重复处理全量中已经读到的数据，ES 写入需要保证幂等。

同步延迟还要算到搜索能查出新数据的时刻。一次变更会经过捕获、消息排队、数据处理和 ES 写入；写入成功后，也可能需要等待 `refresh` 才对搜索可见。Elasticsearch 官方将这种搜索可见性称为[近实时搜索](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search)。

![MySQL 到 ES 全量与增量衔接](https://oss.javaguide.cn/github/javaguide/database/es/mysql-es-full-incremental-sync.webp)

## 选型前先定义同步契约

以商品搜索为例，一份 ES 文档可能组合商品、品牌、库存等多张表的数据。同步程序拿到一条品牌变更事件后，需要知道它影响哪些商品、怎样重新生成这些商品的文档。工具选型之前，应先约定这套同步规则。

通常以 MySQL 为权威数据源，ES 保存可重建的搜索视图。业务若绕过 MySQL 直接修改 ES 中的权威字段，下一次同步或重建就可能覆盖这次修改。文档由哪些表和字段组成、`_id` 从哪里取、多表变更分别触发哪些文档重建，都要在这套规则中写清楚。

同一份商品文档还会经历更新、删除和业务失效。物理删除、逻辑删除、业务失效各自应触发 ES delete、保留删除标记，还是重新生成文档，需要分别约定。同一文档使用哪个分区键、版本从哪里来，也要一起确定，否则重试、并发和多条同步链路可能让旧值覆盖新值。

字段进入 ES 前要有固定的转换规则，包括金额、无符号整数、日期时间、枚举和空字符串，并区分字段缺失、`null` 和空值。后续新增字段、修改类型或调整分词器时，由谁更新 mapping，应用、同步任务和索引模板按什么顺序发布，也属于这份同步契约。

运行要求则决定任务能占用多少资源、故障后如何恢复：

- 全量扫描读主库还是只读副本，允许多少连接、并发和磁盘 I/O，达到什么条件后限速或暂停。
- 正常同步允许多大延迟，中断后多久追平。如果所需 binlog 或 MQ 消息已超过保留时间，怎样重新初始化。

验收时，可以用一条商品记录检查新增和修改，分别验证物理删除与逻辑删除，再重复投递消息、打乱消息顺序，检查 ES 中的结果。主动暂停 ES 或同步任务后，还要观察恢复后能否追平。这样才能检查出“全量条数相等”之外的问题。

索引重建则需要完整验证全量回灌、增量追平、数据校验、别名切换和回滚。同步契约中的约定，都应有对应的测试用例或监控指标。

## 常见方案对比

| 方案             | 全量同步   | 增量同步       | 主要优点                             | 主要问题                             | 适用场景                               |
| ---------------- | ---------- | -------------- | ------------------------------------ | ------------------------------------ | -------------------------------------- |
| 应用层同步双写   | 不支持     | 支持           | 实现直观、链路短                     | 无法原子提交、侵入业务、容易乱序     | 数据量小、允许短暂不一致的简单业务     |
| 本地消息表 + MQ  | 不支持     | 支持           | 业务更新与事件落库可以放进同一事务   | 仍需补全量导入、投递和消费组件       | 应用已经采用事件驱动架构               |
| 定时同步         | 支持       | 支持按条件扫描 | 简单、运维成本低                     | 延迟较高，删除和扫描窗口需要额外处理 | 数据量小、更新频率低                   |
| Canal + 消费端   | 需单独处理 | 支持           | 生态成熟、便于接入 MQ 和自定义消费者 | 需要维护位点、消费端和全量衔接       | 已有 Java/MQ 基础设施的增量同步        |
| Debezium + Kafka | 支持快照   | 支持           | Kafka Connect 生态完善、事件格式统一 | 组件较多，依赖 Kafka Connect         | 已有 Kafka Connect 或多数据源 CDC 平台 |
| Flink CDC        | 支持       | 支持           | 全量与增量自动衔接，适合复杂转换     | 部署和状态管理成本较高               | 数据量大、需要流式处理或多表转换       |

表中的全量、增量能力可以用于初步筛选。能否满足业务的一致性要求，还要检查 ES 写入方式、消息顺序、Checkpoint、重试策略和索引设计。

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

业务请求还要多等待一次 ES 调用，ES 抖动也会影响主链路。改成线程池、`CompletableFuture` 或普通 MQ 异步发送，可以减少这段等待，但如果进程在“MySQL 已提交、消息还没发出”时崩溃，变更仍然会丢失。

并发更新时，即使两次写入都成功，结果也可能出错。假设同一条商品记录先后更新为 `v2`、`v3`，两次 ES 请求的到达顺序反了，旧的 `v2` 就会覆盖 `v3`。改成异步后，同样需要处理这种乱序。

### 用本地消息表补上事务缺口

要补上“MySQL 已提交、消息尚未发送”的缺口，可以先把待发送事件存进 MySQL。这就是 **Transactional Outbox（本地消息表）** 的做法：

1. 在同一个 MySQL 事务里更新业务表，并插入一条 outbox 事件。
2. 独立投递程序或 CDC 组件读取 outbox 表，把事件发送到 MQ。
3. ES 消费端处理消息，成功后记录消费结果；失败则重试或进入死信队列。

这样可以保证“业务数据更新”和“待发送事件落库”同时成功或同时回滚。Debezium 也提供了专门的 [Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html) 来捕获并转换 outbox 事件。

事件随业务事务一起落库后，投递程序就有了可恢复的发送依据。后续的重复消费、同一业务主键的消息顺序、全量初始化和数据对账，仍要分别处理。

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

任务开始时先固定 `task_cutoff`，每批处理完再保存由 `last_updated_at` 和 `last_id` 组成的复合游标。下一批继续使用同一个截止时间，直到这轮数据全部处理完成。对于扫描时已经提交、扫描期间不再变化的数据，这样既能避开深分页，也不会因为多条记录的 `updated_at` 相同而漏数。

不过，`task_cutoff` 只是查询上界，不能保证此前发生的更新都已提交。假设一条记录的 `updated_at` 是 09:59:59，事务直到 10:00:01 才提交，而同步游标已经推进到 10:00:00，后续查询就会漏掉它。同一时间戳下，较小 ID 的记录延迟提交，也可能被已经推进的游标跳过。

因此，相关更新都要可靠地维护 `updated_at`，不能随意回填旧时间。可以通过重叠时间窗口重复扫描、幂等写入和定期对账降低漏数风险，但重叠窗口或固定延迟都只能覆盖有限的提交延迟。不能接受这类漏数时，应使用 binlog CDC 等捕获已提交变更的方案。

物理删除不会留下 `updated_at`，所以定时增量同步通常要配合逻辑删除字段、删除记录表，或者定期做全量校验。否则 MySQL 中已经删除的数据可能长期留在 ES。

使用 Spring Task 时，每周一零点执行一次任务可以这样写：

```java
@Scheduled(cron = "0 0 0 ? * MON", zone = "Asia/Shanghai")
public void rebuildArticleIndex() {
    // 分页读取 MySQL，批量写入新的 ES 索引
}
```

### 全量重建时使用索引别名

在旧索引上边删边写，会让用户查到只重建了一部分的数据。可以让查询继续访问旧索引，把重建工作放到新索引中：

1. 创建带版本号的新索引，例如 `articles_v2`，提前配置好 `settings` 和 `mappings`。
2. 把 MySQL 全量数据写入新索引，并完成数量、抽样内容和查询结果校验。
3. 补齐全量任务执行期间产生的增量变更，并让增量任务持续写入新索引。
4. 使用 `_aliases` API 把业务别名从旧索引原子切换到新索引，切换期间及之后继续向新索引同步增量。
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

某一次“追平”之后，MySQL 仍可能产生新变更，不能追平后就停掉增量任务再切别名。若切换必须暂停同步，应先暂停源端写入，确认新索引已消费到停写时的位点，再完成切换、恢复同步和业务写入。采用双索引写入时，也要确认新索引已处理完切换位点之前的事件，并继续接收后续变更。

## 基于 binlog 的 CDC

CDC（Change Data Capture，变更数据捕获）方案会读取 MySQL binlog，把已经提交的数据变化转换为下游可消费的事件。这类方案不需要在每个业务接口里维护 ES 写入逻辑，也是目前更常见的增量同步方式。

接入前要核对以下配置：

- MySQL 已开启 binlog，并为 CDC 账号配置必要的复制和表读取权限。
- 使用工具支持的 binlog 格式。Canal、Debezium、Flink CDC 这类行级变更工具通常要求 `binlog_format=ROW`；Debezium 还明确要求 `binlog_row_image=FULL`，其他工具也要按所用版本核对这一配置。MySQL 8.4 的 `binlog_format` 默认是 `ROW`，旧环境和云数据库仍应以实际配置为准。
- binlog 保留时间覆盖最长故障恢复窗口。任务重启时如果已经读不到所需日志，通常只能重新做快照或全量同步。
- 每个 CDC 客户端分配唯一的 `server_id`。高可用切换后能否接着读日志，还取决于 GTID、位点恢复方式和所连接副本的 binlog 配置。

账号权限按链路两端分别配置：CDC 账号只授予工具文档要求的复制、元数据和目标表读取权限；ES 账号的写入范围限制在目标索引或别名。提交到代码库的任务配置中不要包含凭据。

### Canal

[Canal](https://github.com/alibaba/canal) 会模拟 MySQL Replica 的交互协议，向 MySQL 请求 binlog 并解析为结构化变更事件。

![Canal 工作原理](https://oss.javaguide.cn/github/javaguide/open-source-project/canal-overview.png)

Canal Server 的核心职责是增量日志订阅和解析。下游可以使用 Canal Client 直接消费，也可以让 Canal 把消息投递到 Kafka、RocketMQ 等 MQ，再由同步服务更新 ES。

![Canal 通过 MQ 同步数据](https://oss.javaguide.cn/github/javaguide/database/es/es-mq-synchronization-canal-with-mq.png)

ES 短暂不可用时，Canal 捕获的变更可以先积压在 MQ，消费端恢复后再继续处理。消息保留一段时间，也为失败重放和下游重建提供了数据来源。

消息可以按业务主键路由到同一分区，便于维持局部顺序。消费端再合并消息、调用 ES Bulk API，减少请求开销。消息何时提交、失败如何重试、重试是否幂等，以及死信数据由谁修复，仍需要在消费逻辑中明确。

初始全量数据需要另行导入，可以使用自研分页任务或经过兼容性验证的批量同步工具。[DataX 开源版](https://github.com/alibaba/DataX/tree/master/elasticsearchwriter)虽然提供 ElasticsearchWriter，但官方 README 仍注明只在 Elasticsearch 5.x 上测试，接入 ES 7/8 前必须验证 mapping type、客户端协议和写入参数。

Canal Client Adapter 也提供过针对部分下游的 ETL 能力，是否适合当前 ES 版本和复杂映射，同样要按实际版本验证。全量和增量由两套任务完成时，需要记录全量对应的 binlog 位点，让增量任务从正确的位置接续。

### Flink CDC

Flink CDC 的 MySQL Source 可以先读取表快照，再继续消费 binlog。它会按分片键把表拆成多个 Chunk，并行读取快照；每个 Chunk 读取前后记录 binlog 的 `LOW`、`HIGH` 位点，再合并这段时间内发生的变更，得到一致的 Chunk 结果。

快照以 Chunk 为粒度执行 Checkpoint，任务失败后可以从已完成的进度恢复，不需要在整个快照阶段持有 `FLUSH TABLES WITH READ LOCK` 获取的全局读锁。全量快照结束后，任务自动继续读取 binlog，省去了手工衔接位点的工作。

![Flink CDC 增量快照衔接 binlog](https://oss.javaguide.cn/github/javaguide/database/es/flink-cdc-incremental-snapshot.webp)

截至 Flink CDC 3.6，官方提供了 [MySQL Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/mysql/) 和 [Elasticsearch Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.6/docs/connectors/pipeline-connectors/elasticsearch/)，可以直接描述 MySQL 到 ES 的 Pipeline。ES Sink 不会自动创建索引，使用前仍要准备索引、mapping 和相关模板。

Flink CDC 文档中的 exactly-once 主要描述 Source 在快照和 binlog 读取阶段的处理语义。[Flink DataStream Elasticsearch Sink](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/elasticsearch/) 在启用 Checkpoint 后提供 at-least-once 保证：Checkpoint 会等待已经提交的 ES 请求完成，但故障恢复后仍可能重放请求。使用固定文档 ID 和幂等的 index/upsert，可以让重复写入落到同一份文档；如果同一文档还可能乱序，则要再配合源端版本号。Source 的 exactly-once 不能直接推导出 MySQL 到 ES 端到端 exactly-once。

这里引用的是 DataStream Sink 的保证，不能直接当作 CDC Pipeline 的端到端承诺。使用 Flink CDC 3.6 的现成 ES Pipeline 时，还要核对具体实现的能力：其[事件序列化代码](https://github.com/apache/flink-cdc/blob/release-3.6/flink-cdc-connect/flink-cdc-pipeline-connectors/flink-cdc-pipeline-connector-elasticsearch/src/main/java/org/apache/flink/cdc/connectors/elasticsearch/serializer/ElasticsearchEventSerializer.java)生成的 `index/delete` 请求没有设置外部版本参数。把业务版本号作为普通字段同步到 ES，并不会自动执行版本校验；要使用下面的 `version_type=external` 方案，需要扩展 Sink 或通过自定义消费者设置请求参数。

### Debezium

Debezium 的 MySQL Connector 通常运行在 Kafka Connect 上。首次启动时，它可以先执行一致性快照，再从快照对应的 binlog 位点持续发送行级变更事件到 Kafka Topic。后续还可以按需触发分块的增量快照。

如果团队已经使用 Kafka Connect，或者准备把多种数据库的变更统一接入 Kafka，Debezium 比自研 binlog 解析和事件格式更省事。写入 ES 时还需要 Elasticsearch Sink Connector 或自定义消费者，删除事件、Topic 压缩、Schema 变更和消息转换规则都要单独设计。

具体快照流程和配置项可以参考 [Debezium MySQL Connector 官方文档](https://debezium.io/documentation/reference/stable/connectors/mysql.html)。

## 生产环境必须处理的问题

变更事件到达消费端后，还要找到对应的 ES 文档、判断版本、执行写入并处理失败。重复消息、乱序和删除遗漏，往往就出现在这些环节。

![MySQL 同步 ES 的一致性保障](https://oss.javaguide.cn/github/javaguide/database/es/mysql-es-consistency-guardrails.webp)

### 1. 把 MySQL 主键作为 ES 文档 ID

同步时应使用稳定、唯一的业务主键作为 ES `_id`。同一条数据重复执行 `index` 或 upsert 时会更新同一份文档，消费者因此更容易实现幂等。

如果让 ES 自动生成 `_id`，消息重试可能写出多份重复文档，删除时也很难找到准确目标。

### 2. 保证同一文档的事件顺序

全局有序通常成本很高，MySQL 同步 ES 多数只需要保证同一个文档 ID 的事件有序。常用做法是按业务主键选择 MQ 分区，让同一主键的事件进入同一分区并串行处理。

即便如此，重平衡、失败重试和多条同步链路仍可能制造乱序。对不能容忍旧值覆盖新值的场景，可以在事件和 ES 文档中携带单调递增的业务版本号，在写入前丢弃旧版本。版本号必须来自可靠的顺序来源，不能直接用多台机器各自生成的本地时间代替。

如果源端版本可以表示成非负 `long`，[ES Bulk API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk) 的 `index` 和 `delete` 操作支持设置 `version` 和 `version_type=external`：只有版本号更高的写入才能覆盖已有文档。删除事件也要携带同一套版本，否则延迟到达的旧更新仍可能把已删除文档重新写回来。GTID、binlog 文件名和位点通常不能不经转换就直接当作 ES 外部版本号，落地前要先定义稳定的比较规则。

删除时带上版本号，也不能永久阻止旧事件把文档写回来。ES 对已删除文档的版本信息只保留有限时间，由 [`index.gc_deletes`](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) 控制，默认是 60 秒。比如版本 10 的删除完成后，删除版本信息被清理，此时迟到的版本 9 写入仍可能重新创建文档。长时间故障恢复、死信重放等场景，要额外保存持久化的删除标记或业务版本状态并校验，或者保证事件顺序和重放范围，不能只依赖 ES 的删除版本保留期。

### 3. 正确处理删除

`INSERT` 和 `UPDATE` 最终可以统一为 upsert，`DELETE` 则必须显式转换成 ES delete 操作。若业务使用逻辑删除，还要统一约定是删除 ES 文档，还是保留文档并写入 `deleted=true`。

如果同步任务会按 `status`、`is_deleted` 等可变字段过滤数据，还要处理“原来符合条件，更新后不再符合”的情况。普通过滤只会丢弃新的更新事件，不会自动为 ES 中的旧文档补一条 delete。可以保留状态字段并在查询时过滤，也可以识别状态迁移并显式生成删除事件。

多表聚合文档尤其容易漏删。例如商品文档包含商品表、品牌表和类目表字段，删除一个类目后，不能只删除“类目 ID 对应的 ES 文档”，而要找出受影响的商品并重新构建它们的文档。

### 4. 处理多表文档

binlog 记录的是表中行的变化，而 ES 常用的是反范式文档。一份商品文档可能组合商品、品牌、库存和标签等多张表的数据。

品牌名称变了，CDC 事件里记录的是品牌表的变化，消费端还得找到引用这个品牌的商品，再更新它们的文档。

直接的做法是根据事件回查 MySQL，重新组装受影响的完整文档，但要控制回查并发和缓存。也可以先在 MySQL 中维护适合搜索的宽表，再同步宽表，代价是多了一份宽表需要维护。数据量和关联逻辑较复杂时，可以用 Flink 等流处理引擎维护关联状态、生成文档，不过状态、Checkpoint 和作业升级都需要专门运维。

### 5. 批量写入也要检查单条结果

Elasticsearch [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) 能在一次请求中执行多条 index、update 和 delete，减少网络和请求处理开销。

一次 Bulk 请求中可能只有部分文档失败。消费者不能只检查 HTTP 状态码，还要逐条检查 `items`，只重试网络超时、429、部分 5xx 等暂时性错误。mapping 冲突、字段格式错误等问题继续重试通常没有意义，应记录原始消息并转入死信队列或人工修复流程。

Bulk 批次也没有适用于所有系统的固定大小。批次数量、字节数、并发度和刷新频率要结合文档大小、分片数量、ES 写入队列和压测结果调整。

ES 写入速度低于上游变更速度时，要让压力沿链路向上游传递：限制在途 Bulk 请求和消费者并发，必要时暂停消费或降低 Source 读取速率。积压若一直留在无界内存队列里，同步进程就可能耗尽内存。使用 MQ 缓冲时，消息保留时间要覆盖预期的最长积压时间，避免还没消费就过期。

### 6. 管理 mapping 和 DDL 变更

商品名称、价格和更新时间虽然都来自 MySQL，写入 ES 时却需要不同的处理。mapping 要服务于搜索的用法：

- 名称、标题和描述需要全文检索时使用 `text`。同一字段还用于排序、聚合或精确过滤时，可以增加 `keyword` 子字段；状态码、标签、邮箱等结构化字符串通常直接使用 `keyword`。
- 金额可以保存为最小货币单位的整数，也可以按允许的精度使用 `scaled_float`。换算规则要固定在同步契约里，不能把所有金额都直接转成 `float` 或 `double`。
- MySQL `BIGINT UNSIGNED` 的上限超过 ES `long`。遇到超出范围的大值，需要用 `unsigned_long` 或转成 `keyword`，并检查序列化过程中是否发生静默溢出。

日期字段容易在时区转换上出错。MySQL `TIMESTAMP` 会根据会话时区和 UTC 互转，`DATETIME` 不做同样的自动转换。源端会话时区和 ES 日期格式应固定下来，再用跨时区、夏令时附近的样例核对写入结果。

字段缺失、`null`、空字符串和空数组也要区分处理。它们会影响 `exists` 查询、排序、聚合和局部更新，转换规则应在写入前统一。

MySQL 新增字段时，不能直接假定 ES 也该增加同名字段。动态 mapping 可能误判日期、数字或字符串类型；字段不断增加，还可能引发 mapping explosion。生产环境更适合预先定义显式 mapping 和索引模板。

字段类型或分词器发生不兼容变更时，沿用前面的重建流程：创建新索引、全量重建，再切换别名。这次发布也要包含 CDC 对 MySQL DDL 事件的处理规则，并安排好代码、索引模板和同步任务的发布顺序。

### 7. 监控延迟、失败和 binlog 保留时间

搜索结果迟迟没更新，可以沿着数据流查：CDC 当前消费位点距离 MySQL 最新 binlog 位点多远，MQ 积压了多少消息，最老的一条已经等了多久。这些指标有助于区分源端读取落后和消息处理缓慢。

到了 ES 一侧，需要同时看 Bulk 成功率、单条失败原因、重试次数和死信数量，以及集群状态、写入拒绝和磁盘水位。写入正常但搜索仍有延迟时，继续检查 `refresh` 延迟。

全量任务另看读取速率、写入速率和剩余数据量。故障恢复期间，还要比较 binlog 剩余保留时间与当前积压、预计恢复时间：如果恢复赶不上日志清理，就可能失去接续增量的条件。

告警阈值应从业务允许的搜索延迟和压测基线确定。“延迟超过 60 秒”“失败率超过 1%”可以是某个系统的设置，但没有适用于所有系统的依据。

### 8. 定期对账，并保留重建能力

MQ 中的消息已经消费完，ES 仍可能留着 MySQL 中已删除的商品。漏处理删除、同步规则错误、mapping 冲突和人工修改 ES，都可能留下这种未被链路监控发现的偏差。

对账先比较两边的有效记录总数，发现明显差异后，按主键范围或业务分区统计数量和摘要，逐步缩小范围。内容是否相同，则通过抽样比较关键字段，或对规范化后的文档计算哈希来检查。找出差异主键后，交给修复任务重新生成文档，避免直接在 ES 中手工改值。

偏差太多时，可以改走索引重建。因此要保留“一键创建新索引、全量回灌、追平增量、校验、切换别名”的能力；mapping 和分词器升级也可以复用这条流程。

### 9. 为故障恢复准备操作手册

同步任务停下来以后，能否续跑取决于保留的状态和日志。ES 暂时不可用，可以保留消息等待重试；所需 binlog 已过期，通常要重新初始化。操作手册需要给出这些判断对应的恢复动作，并在上线前演练位点、Checkpoint、MQ Offset 的恢复和索引别名切换。

| 故障场景                    | 处理方式                                                                | 不应直接做的事                               |
| --------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| ES 短暂不可用或返回 429/5xx | 暂停或限速写入，保留未确认消息，按退避策略重试，恢复后观察积压是否下降  | 未写入成功就提交消费位点                     |
| mapping 冲突或字段格式错误  | 停止无效重试，记录原始事件和失败原因，修复模板或转换规则后定向重放      | 无限重试同一条确定性错误                     |
| CDC 任务重启且状态仍可用    | 从已保存的 Checkpoint、binlog 位点或 MQ Offset 恢复，并依靠幂等写入去重 | 清空状态后直接从最新位点启动                 |
| 所需 binlog 或消息已经过期  | 重新执行一致性快照或全量重建，并重新建立全量与增量的衔接                | 跳到最新位点后继续运行并宣称数据已经一致     |
| ES 索引损坏或规则整体变更   | 创建新索引，全量回灌、追平增量并校验，再切换别名                        | 在旧索引上边删边补，且不给查询流量保留回退点 |

执行这些动作时，处理人需要能找到状态文件或 Checkpoint、进入死信重放入口，并知道什么时候回滚。负责人、所需权限和这些位置、条件，都应写在操作手册里。

演练还要观察恢复过程本身：回放是否造成源库压力突增或 ES 写入拒绝，binlog 是否再次过期，同一批数据是否在反复重放。任务重新启动后，这些问题仍可能阻止它追平。

## 如何选择？

- 数据量小、更新不频繁、允许较长延迟：优先考虑定时增量同步，配合周期性全量重建。
- 业务已经有可靠的领域事件和 MQ：可以使用本地消息表 + MQ，同步服务消费事件更新 ES。
- 主要需求是稳定获取 MySQL 增量变更，团队熟悉 Java 和 MQ：Canal + MQ + 自定义消费者通常比较合适，全量部分单独设计。
- 已有 Kafka Connect 平台，或者需要统一接入多种数据库：可以考虑 Debezium。
- 数据量较大，希望全量和增量自动衔接，或者需要流式清洗、多表转换：可以考虑 Flink CDC。

确定候选方案后，用接近生产的数据量和文档结构做压测，检查搜索延迟和故障恢复时间是否满足要求。部署组件数量、多表文档复杂度和团队运维能力，也应计入选型成本。

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
