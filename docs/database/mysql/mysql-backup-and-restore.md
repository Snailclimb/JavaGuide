---
title: MySQL备份与恢复详解：mysqldump、XtraBackup、binlog和PITR
description: MySQL备份与恢复详解，讲解 mysqldump、MySQL Shell、Percona XtraBackup、binlog、PITR、RTO/RPO、恢复演练和常见备份误区。
category: 数据库
tag:
  - MySQL
  - 备份恢复
head:
  - - meta
    - name: keywords
      content: MySQL备份,MySQL恢复,mysqldump,mysqlbinlog,MySQL Shell,Percona XtraBackup,binlog,PITR,全量备份,增量备份,逻辑备份,物理备份,RTO,RPO
---

线上最怕的数据库事故，很多时候不是 MySQL 进程挂了。

进程挂了还能重启，主库挂了还能切从库。真正麻烦的是数据被删了、被错误脚本改了、磁盘坏了，或者迁移时发现少了一批表。这个时候，主从复制、redo log、undo log 都不够用，最后能救场的通常是备份和恢复方案。

这篇只讲 MySQL 备份与恢复，不展开 PostgreSQL、Redis 和云厂商备份产品。命令主要按 MySQL 8.4 LTS 校对，同时参考了截至 2026-06-25 的 MySQL 9.7 当前文档；不同版本的参数名、权限要求和工具兼容性会有变化，生产落地前一定要以自己环境里的 `mysqldump --help`、`mysqlbinlog --help` 和工具文档为准。

## 备份到底解决什么问题？

先把几个容易混在一起的概念拆开：

- **崩溃恢复**：MySQL 异常宕机后，InnoDB 依赖 redo log、undo log 等机制把数据库恢复到一致状态。这解决的是进程崩溃、机器重启后的存储引擎一致性问题。
- **主从复制 / 高可用切换**：主库不可用时，把流量切到从库或新主库。这解决的是服务可用性问题，但错误写入通常会被同步到从库。
- **备份恢复**：从某个历史数据副本恢复，再根据 binlog 回放到指定时间点。这解决的是数据丢失、误删误改、磁盘损坏、跨环境迁移和审计留存问题。

主从复制不能替代备份。

如果一条 `DROP TABLE` 在主库执行成功，它大概率也会同步到从库。复制做得越快，错误传播也越快。备份的价值在于保留一个独立的历史状态，让你有机会回到事故发生前。

## RTO 和 RPO 决定备份策略

备份策略不能只问“每天备几次”。更实际的问题是两个：

- **RPO（Recovery Point Objective）**：最多能接受丢多久的数据？
- **RTO（Recovery Time Objective）**：最多能接受多久恢复服务？

如果业务能接受丢 1 天数据，每天一次全量备份也许够用。如果订单、支付、库存这类数据最多只能丢几分钟，只有全量备份不够，还要保留 binlog 做增量恢复。如果数据库有几百 GB，恢复 SQL 文件可能跑很久，RTO 又要求在 30 分钟内恢复，那就要认真考虑物理备份、备库预热、恢复演练和切换流程。

一套常见组合是：

- 每天或每周做一次全量备份。
- 开启 binlog，并按 RPO 要求保留足够长的日志。
- 备份文件和 binlog 不放在同一块磁盘、同一个故障域里。
- 定期把备份恢复到一台新机器，记录实际耗时。

binlog 保留 30 天，不代表 RPO 就一定是几秒。真正能恢复到哪里，取决于最后一份完整、可读、已经复制到独立故障域的 binlog。生产里还要看 `sync_binlog`、`innodb_flush_log_at_trx_commit`、binlog 归档延迟、归档进程是否断过、binlog 文件链是否连续。MySQL 8.4 默认 `sync_binlog=1`、`innodb_flush_log_at_trx_commit=1`，这两个值更偏向安全；如果为了性能改小了持久性保证，就要把可能丢最近事务这件事算进 RPO。

所以，要求分钟级甚至秒级 RPO 的系统，不只要监控“磁盘上还有多少天 binlog”，还要监控“最新已安全归档的 binlog 距离现在多久”。

这里有个很现实的限制：恢复速度和数据量、磁盘性能、索引数量、网络带宽、导入方式都有关系。没有演练数据时，RTO 只能算愿望，不能算承诺。

## 备份方式有哪些？

MySQL 备份常见有三组分类，分别回答不同问题。

按备份时数据库是否提供服务：

| 类型 | 说明                                   | 适用场景                                 |
| ---- | -------------------------------------- | ---------------------------------------- |
| 冷备 | 停掉 MySQL 后复制数据文件              | 小型系统、维护窗口充足的场景             |
| 温备 | MySQL 运行中备份，但可能加锁或影响写入 | 对可用性要求一般、能接受短时间影响的场景 |
| 热备 | MySQL 运行中备份，尽量不阻塞业务读写   | 生产库、大库、维护窗口很短的场景         |

按备份文件内容：

| 类型     | 说明                             | 代表工具                                    |
| -------- | -------------------------------- | ------------------------------------------- |
| 逻辑备份 | 导出 SQL、CSV 等逻辑内容         | `mysqldump`、MySQL Shell dump utilities     |
| 物理备份 | 复制数据文件、日志文件等物理文件 | Percona XtraBackup、MySQL Enterprise Backup |

按备份范围：

| 类型     | 说明                             |
| -------- | -------------------------------- |
| 全量备份 | 备份某个时刻完整数据             |
| 增量备份 | 备份上次备份之后变化的数据或日志 |
| 差异备份 | 备份上次全量备份之后变化的数据   |

面试里经常会问这些分类，但生产里真正要落到一件事：备份文件能不能恢复出业务需要的数据。分类只是选型语言，恢复成功才是结果。

## 用 mysqldump 做逻辑备份

`mysqldump` 是 MySQL 自带的逻辑备份工具，它会导出一批 SQL 语句，用这些语句可以重建库表结构和表数据。它的优点是简单、通用、方便查看，也适合跨环境迁移。缺点同样明显：数据量大时备份慢，恢复更慢，因为恢复过程要重新执行 SQL、写数据、建索引。

MySQL 官方文档也明确提醒，`mysqldump` 不是大规模备份和恢复的快速方案；数据量上来以后，物理备份通常更合适。

一个偏生产的 InnoDB 全库备份命令可以这样写：

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --all-databases \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  > mysql-full-backup.sql
```

几个参数要单独解释一下：

- `--single-transaction`：备份开始前开启一个一致性读事务，适合 InnoDB 表。它通常不需要在整个导出期间持续锁表，但本文命令还用了 `--source-data=2`，`mysqldump` 会在启动阶段短暂获取全局读锁，用来对齐一致性快照和 binlog 位点。因此更准确的说法是“不长期阻塞业务写入”，不是“完全无锁”。如果混了 MyISAM、MEMORY 等非事务表，备份期间这些表仍可能变化。
- `--routines` 和 `--events`：把存储过程、函数和事件也导出来。MySQL 8.4 文档明确说明，相关定义在数据字典里，`--all-databases` 不等于自动带上这些对象。
- `--triggers`：触发器默认会导出，显式写出来是为了让备份脚本的意图更清楚。
- `--source-data=2`：把当前 binlog 文件名和位置写入 dump 文件，并且以 SQL 注释形式保留。旧资料里常见的 `--master-data` 在新文档里已经是 `--source-data` 的废弃别名。

如果只备份一个库：

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  order_db \
  > order_db.sql
```

这种写法导出的主要是 `order_db` 里的对象，不会自动把 `CREATE DATABASE order_db` 和 `USE order_db` 写成一个完整建库脚本。恢复时要么提前建库，要么在备份时改用 `--databases order_db`：

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  --databases order_db \
  > order_db.sql
```

`--databases` 会在 dump 里加入 `CREATE DATABASE` 和 `USE`。如果你只是想把数据导入一个已经存在的同名库，保留前一种写法也可以，但恢复命令必须指明目标库。

如果备份文件很大，可以直接压缩：

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  order_db | gzip > order_db.sql.gz
```

恢复时执行：

```bash
mysql --host=127.0.0.1 --user=root --password < mysql-full-backup.sql
```

压缩文件可以这样恢复：

```bash
mysql --host=127.0.0.1 --user=root --password \
  -e "CREATE DATABASE IF NOT EXISTS order_db"

gunzip -c order_db.sql.gz | mysql --host=127.0.0.1 --user=root --password order_db
```

`mysqldump` 有几个常见坑：

- 备份用户权限不够，视图、触发器、存储过程、事件没有导完整。
- 使用 `--single-transaction` 时，备份期间执行了 `ALTER TABLE`、`DROP TABLE`、`TRUNCATE TABLE` 这类 DDL，可能导致备份失败或内容不符合预期。
- 没有记录 binlog 位点，后续无法从全量备份继续做按时间点恢复。
- 把备份恢复到启用了 GTID 的环境时，不要依赖默认的 `--set-gtid-purged=AUTO`。官方文档说明，默认情况下源端开启 GTID 时，dump 可能写入 `SET @@GLOBAL.gtid_purged` 和 `SET @@SESSION.sql_log_bin=0`；部分库 dump 也可能携带源实例 `gtid_executed` 中其他库事务的 GTID。导入测试库、临时库、已有 GTID 历史的目标实例时，通常要显式评估是否使用 `--set-gtid-purged=OFF`；如果是创建新的复制节点，则可能需要保留 GTID。关键是显式选择，不要照抄默认值。
- `--source-data=2` 记录的是实例级 binlog 位点，不是“只属于这个数据库”的增量日志。单库 PITR 比整实例 PITR 更麻烦，尤其要考虑跨库事务、存储过程、触发器和 `binlog_format`，不能简单地把整个实例 binlog 原样回放到目标库。

小库、测试环境、跨版本迁移、导出少量数据，`mysqldump` 很顺手。上百 GB 的生产库如果还只靠它做恢复，恢复时间通常会让人难受。

## MySQL Shell Dump Utilities：并行逻辑备份

如果你希望保留逻辑备份的可迁移性，又嫌 `mysqldump` 单线程导出和导入太慢，可以看看 MySQL Shell Dump Utilities。

MySQL Shell 提供了几类 `util` 函数：

```javascript
util.dumpInstance("/backup/mysql/instance", { threads: 8 });
util.dumpSchemas(["order_db"], "/backup/mysql/order_db", { threads: 8 });
util.dumpTables("order_db", ["orders", "order_item"], "/backup/mysql/orders", {
  threads: 8,
});
util.loadDump("/backup/mysql/order_db", { threads: 8 });
```

它的定位仍然是逻辑备份，但支持并行 dump / load、压缩、进度信息、校验和以及对象存储输出。官方文档里 `threads` 默认值是 4，可以按实例负载、网络和目标端写入能力调大。

不过不要把它误解成物理备份替代品。它导出的仍是逻辑对象和数据文件，恢复时也要重建表、索引和对象；大库如果 RTO 很紧，物理备份通常还是更稳。

## 用 binlog 做增量恢复

全量备份只能恢复到备份那一刻。想恢复到更靠后的时间点，需要依赖 binlog。

binlog 记录了会修改数据的事件，也是 MySQL 主从复制和按时间点恢复的基础。PITR（Point-in-Time Recovery）通常就是先恢复一个全量备份，再从备份对应的 binlog 位点开始回放日志，直到目标时间或目标位置。

一个简化例子：

1. 凌晨 02:00 做了一次全量备份，dump 文件里记录了 `binlog.000120` 和位置 `154`。
2. 上午 10:21 有人误删了 `order_item` 表的一批数据。
3. 恢复时先导入 02:00 的全量备份。
4. 再用 `mysqlbinlog` 回放 `binlog.000120` 及之后的日志，停止在误删语句之前。

按时间恢复可以这样写：

```bash
mysqlbinlog \
  --start-position=154 \
  --stop-datetime="2026-06-25 10:20:59" \
  binlog.000120 binlog.000121 \
  | mysql --binary-mode --host=127.0.0.1 --user=root --password
```

按时间停止适合快速缩小范围，但不能把它当成绝对精确的业务时间。`mysqlbinlog` 会按执行命令机器的本地时区解释 `--stop-datetime`，并在遇到第一个时间戳大于或等于目标值的事件时停止。生产恢复时，更稳的做法通常是先用时间范围导出一段 binlog 做检查，找到误操作对应的 event 或事务边界，再用 `--stop-position` 做最终回放。

如果已经精确找到了事件位置，用位置比时间更可靠：

```bash
mysqlbinlog \
  --start-position=154 \
  --stop-position=987654 \
  binlog.000120 \
  | mysql --binary-mode --host=127.0.0.1 --user=root --password
```

同时指定多个 binlog 文件时，`--start-position` 只作用于命令里的第一个文件，`--stop-position` 只作用于最后一个文件，中间文件会完整处理。位置是 binlog 文件里的字节偏移，不是第几个事件，必须落在有效事件边界上。

`mysql --binary-mode` 不是装饰参数。官方文档提到，如果 binlog 输出里包含 `\0` 这类空字符，不加 `--binary-mode` 可能无法被 `mysql` 客户端正确解析。

现代 MySQL 常见 `ROW` 格式 binlog。这个格式记录的是行变更，不一定能直接看到原始 SQL。排查误操作时，可以用下面的方式把行事件解码成便于阅读的注释：

```bash
mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000120 > binlog.000120.readable.sql
```

注意，这个输出主要用于人工检查。官方文档也提醒，如果要把 `mysqlbinlog` 输出重新执行，默认的 `--base64-output=AUTO` 才是安全行为；`DECODE-ROWS` 这类模式不应拿来做正式回放。

binlog 恢复有几个前提：

- MySQL 必须提前开启 binary logging。
- binlog 保留时间要覆盖你的 RPO 要求。
- 全量备份里要能找到起始 binlog 文件和位置，或者有 GTID 信息。
- 恢复前最好在隔离实例验证，不要直接把不确定的 binlog 回放到生产库。

binlog 文件本身也要备份。MySQL 官方文档给过一种连续备份 binlog 的方式：

```bash
mysqlbinlog \
  --read-from-remote-server \
  --host=127.0.0.1 \
  --user=binlog_backup \
  --password \
  --raw \
  --stop-never \
  --connection-server-id=330610 \
  --result-file=/backup/mysql/binlog/ \
  binlog.000999
```

这条命令会以原始二进制格式拉取 binlog，并在到达当前最后一个日志文件末尾后继续等待新事件。它和复制从库不同，连接断了不会像从库一样自动重连，所以生产脚本还要配合进程守护、告警和断点续传。

连续拉取 binlog 还有几个容易漏掉的点：

- 远程读取 binlog 的账号需要复制相关权限。MySQL 8.4 文档对 `--read-from-remote-server` 仍写的是 `REPLICATION SLAVE` 权限；不同版本和权限模型可能有差异，建账号时要按当前版本文档确认。
- `--stop-never` 会让 `mysqlbinlog` 以一个 server ID 持续连接源端，生产里建议显式配置 `--connection-server-id`，避免和复制节点或另一个 `mysqlbinlog` 进程冲突。
- `--raw` 模式默认会用源端 binlog 同名文件写到当前目录；如果文件已经存在会被覆盖。用 `--result-file` 指定独立目录或前缀，并对目录做权限和容量监控。
- 如果源端开启了 binlog 加密，`mysqlbinlog` 拉出来的副本仍会以未加密格式存放在备份端。传输链路要用 TLS，备份目录也要做加密、访问控制和删除保护。

## 用 XtraBackup 做物理备份

逻辑备份导出的是 SQL，物理备份复制的是 MySQL 数据文件和相关日志文件。数据量越大，物理备份的优势越明显：备份和恢复更接近文件复制，不需要逐条重放大量 `INSERT`。

Percona XtraBackup 是 MySQL 实践中常用的开源物理备份工具。它可以在 MySQL 运行时备份 InnoDB / XtraDB 等存储引擎的数据，常用于生产环境热备。不过“热备”主要是对 InnoDB 这类事务型引擎而言；Percona 文档也说明，复制非 InnoDB 数据时 InnoDB 表会被锁住，混用存储引擎的实例要单独评估影响。

一个最小的全量备份流程如下：

```bash
xtrabackup --backup --target-dir=/data/backups/mysql/base
```

备份完成后不能直接拿来启动，需要先 prepare，让数据文件达到一致状态：

```bash
xtrabackup --prepare --target-dir=/data/backups/mysql/base
```

`--prepare` 会应用 redo / undo，让备份目录里的文件形成一致快照。这个步骤不要中断；如果备份后面还要继续合并增量，需要按 Percona 文档使用 `--apply-log-only` 保留未提交事务回滚前的状态。

恢复时要停掉 MySQL，并确保目标 `datadir` 为空：

```bash
systemctl stop mysqld

mv /var/lib/mysql /var/lib/mysql.bak.$(date +%F-%H%M%S)
install -d -o mysql -g mysql /var/lib/mysql

xtrabackup --copy-back --target-dir=/data/backups/mysql/base

chown -R mysql:mysql /var/lib/mysql

systemctl start mysqld
```

这类命令看起来不复杂，真正容易出问题的是版本兼容。Percona 文档写得很明确：XtraBackup 8.4 只支持 MySQL 8.4 和 Percona Server for MySQL 8.4，不支持 MySQL 8.0 或 9.x；MySQL 8.0 要看 XtraBackup 8.0 系列的支持范围。生产环境不要用“版本号差不多”来判断能不能备份和恢复。

XtraBackup 也支持增量备份，例如基于一次全量备份继续备份变化数据：

```bash
xtrabackup \
  --backup \
  --target-dir=/data/backups/mysql/inc1 \
  --incremental-basedir=/data/backups/mysql/base
```

增量链路的 prepare 顺序、合并方式和恢复步骤更容易写错。团队没有熟练演练前，不建议一上来就把恢复能力押在复杂增量链上。更稳的做法是先保证“全量物理备份 + binlog”能恢复，再根据数据量和窗口压力增加增量备份。

如果 XtraBackup 恢复后还要继续做 PITR，起点不要靠猜。备份目录里的 `xtrabackup_binlog_info` 会记录备份时的 binlog 文件和位置：

```bash
cat /data/backups/mysql/base/xtrabackup_binlog_info
```

恢复全量物理备份后，再从这个文件给出的位点开始用 `mysqlbinlog` 回放后续日志。

## 逻辑备份和物理备份怎么选？

可以按数据量、恢复目标和运维能力来选。

| 场景                               | 更适合的方式                          |
| ---------------------------------- | ------------------------------------- |
| 小库、测试库、单表导出、跨环境迁移 | `mysqldump`                           |
| 需要查看或手工修改备份内容         | `mysqldump`                           |
| 中等规模逻辑迁移，希望并行导入导出 | MySQL Shell Dump Utilities            |
| 大库、恢复窗口短、主要是 InnoDB 表 | XtraBackup 或 MySQL Enterprise Backup |
| 需要按时间点恢复                   | 全量备份 + binlog                     |
| 云数据库实例                       | 优先用云厂商快照 / PITR，再做导出校验 |

这里不要把工具选型想得太玄。小库用 `mysqldump` 没问题，脚本简单，出问题也好排查。数据量上来以后，SQL 文件恢复慢的问题会越来越明显，再切到物理备份更实际。

最差的方案通常是只做一种备份，且从来不恢复验证。

## 恢复演练应该怎么做？

备份脚本跑成功，只说明生成了文件。文件能不能用，要靠恢复演练回答。

一个最小演练可以按这个流程走：

1. 准备一台隔离机器，安装相同大版本的 MySQL。
2. 拉取最近一次全量备份和对应 binlog，确认解密密钥、账号、证书和对象存储访问方式都可用。
3. 恢复全量备份，记录耗时。
4. 回放 binlog 到指定时间点，记录耗时。
5. 校验关键库表数量、关键业务 SQL、存储过程、事件、触发器、账号、角色和权限。
6. 检查 `charset`、`collation`、`time_zone`、`sql_mode`、只读开关和网络隔离，确保恢复实例不会被真实业务流量误连。
7. 用应用连接恢复实例，跑一组只读冒烟接口。
8. 记录这次演练的实际 RTO、可恢复到的时间点、失败步骤和人工操作。

校验不要只看 MySQL 能不能启动。至少要查几类数据：

```sql
-- 关键表行数
SELECT COUNT(*) FROM order_db.orders;

-- 最近写入时间
SELECT MAX(created_at) FROM order_db.orders;

-- 存储过程和函数
SHOW PROCEDURE STATUS WHERE Db = 'order_db';
SHOW FUNCTION STATUS WHERE Db = 'order_db';

-- 事件
SHOW EVENTS FROM order_db;

-- 触发器
SHOW TRIGGERS FROM order_db;

-- 账号、角色和权限
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'app_user'@'%';

-- 关键环境参数
SELECT
  @@character_set_server,
  @@collation_server,
  @@time_zone,
  @@sql_mode,
  @@read_only,
  @@super_read_only;
```

如果业务有对账表、流水表、库存表，要优先校验这些表。恢复演练的目标很具体：尽早发现“备份少对象、binlog 缺文件、权限恢复不了、导入耗时远超预期”这类会在事故里放大的问题。

## 常见误区

**误区一：有从库就不用备份。**

从库能接管读写流量，但挡不住误删误改。错误 SQL 同步过去以后，从库也会变成错误状态。延迟从库能争取一点处理时间，但仍然不能替代离线备份。

**误区二：只备份数据，不备份 binlog。**

这种做法最多恢复到全量备份那一刻。全量备份之后到事故发生前的写入都找不回来，RPO 会被备份周期拉长。

**误区三：备份文件和数据库放在同一台机器。**

磁盘损坏、机房故障、误删目录时，数据和备份可能一起没了。至少要复制到独立存储；重要业务还要考虑跨机房或对象存储。

**误区四：备份脚本没有失败告警。**

备份目录里有旧文件，不代表最近一次备份成功。脚本应该检查退出码、文件大小、生成时间、校验和，并把失败通知到人。

**误区五：从不恢复。**

没有恢复演练的备份，平时看起来最省事，事故时最贵。恢复步骤越久没跑，越容易被版本、权限、路径、磁盘空间和工具参数卡住。

**误区六：校验和通过就等于能恢复。**

校验和只能说明文件在复制和存储过程中大概率没有损坏，不代表 SQL 能顺利导入、物理备份能启动、权限对象齐全，也不代表 binlog 链连续。恢复能力只能靠恢复演练证明。

**误区七：备份文件谁都能改、能删。**

备份如果和生产账号共用权限，或者普通运维脚本可以直接覆盖、删除，遇到误删、勒索软件、脚本 bug 时可能一起失效。重要业务至少要有一份跨账号、跨故障域、带版本或不可变策略的副本，并限制删除权限。

## 一套可落地的基础方案

如果没有现成方案，可以从这套开始：

- 业务库主要是 InnoDB，数据量不大：每天 `mysqldump --single-transaction --routines --events --triggers --source-data=2` 全量备份，保留 7 到 30 天，binlog 保留时间覆盖同样窗口。
- 数据量上来以后：每天或每周做一次 XtraBackup 全量备份，按业务写入量决定是否增加增量备份，binlog 单独备份。
- 备份落盘后计算校验和，复制到独立存储；重要业务再保留一份加密、跨账号、带版本或不可变策略的副本。
- 监控最新可用全量备份时间、最新已归档 binlog 时间、binlog 文件连续性和归档进程状态。
- 每月至少做一次恢复演练；核心业务在大促、迁移、版本升级前额外做一次。
- 写一份恢复 runbook，包含负责人、备份位置、解密方式、恢复命令、binlog 起点查找方式、隔离恢复环境、校验 SQL 和回滚说明。

这里的周期只是起点，不是标准答案。金融、订单、支付、医疗这类数据的 RPO/RTO 要求会更严；内部报表、日志分析库通常可以放宽。备份策略应该跟着业务损失来定，而不是跟着网上模板来定。

## 参考资料

- [MySQL Reference Manual：mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
- [MySQL Reference Manual：mysqlbinlog](https://dev.mysql.com/doc/refman/8.4/en/mysqlbinlog.html)
- [MySQL Reference Manual：Using mysqlbinlog to Back Up Binary Log Files](https://dev.mysql.com/doc/refman/8.4/en/mysqlbinlog-backup.html)
- [MySQL Reference Manual：Point-in-Time Recovery](https://dev.mysql.com/doc/refman/8.4/en/point-in-time-recovery-binlog.html)
- [MySQL Reference Manual：Binary Logging Options and Variables](https://dev.mysql.com/doc/refman/8.4/en/replication-options-binary-log.html)
- [MySQL Shell 8.4：Instance Dump Utility, Schema Dump Utility, and Table Dump Utility](https://dev.mysql.com/doc/mysql-shell/8.4/en/mysql-shell-utilities-dump-instance-schema.html)
- [MySQL Shell 8.4：Dump Loading Utility](https://dev.mysql.com/doc/mysql-shell/8.4/en/mysql-shell-utilities-load-dump.html)
- [MySQL Reference Manual：MySQL Releases: Innovation and LTS](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html)
- [Percona XtraBackup 8.4 Documentation](https://docs.percona.com/percona-xtrabackup/8.4/index.html)
- [Percona XtraBackup 8.4：Prepare a full backup](https://docs.percona.com/percona-xtrabackup/8.4/prepare-full-backup.html)
- [Percona XtraBackup 8.4：Index of files created by Percona XtraBackup](https://docs.percona.com/percona-xtrabackup/8.4/xtrabackup-files.html)
- [Percona XtraBackup 8.0 Supported Versions](https://docs.percona.com/percona-xtrabackup/8.0/supported-versions.html)

<!-- @include: @article-footer.snippet.md -->
