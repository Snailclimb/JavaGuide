> 授权转载自： https://github.com/wmyskxz/MoreThanJava#part3-redis

![](https://upload-images.jianshu.io/upload_images/7896890-80c61b0ae541a750.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 一、Redis 集群概述

#### Redis 主从复制

到 [目前](#相关阅读) 为止，我们所学习的 Redis 都是 **单机版** 的，这也就意味着一旦我们所依赖的 Redis 服务宕机了，我们的主流程也会受到一定的影响，这当然是我们不能够接受的。

所以一开始我们的想法是：搞一台备用机。这样我们就可以在一台服务器出现问题的时候切换动态地到另一台去：

![](https://upload-images.jianshu.io/upload_images/7896890-c48d255bc0b13672.gif?imageMogr2/auto-orient/strip)

幸运的是，两个节点数据的同步我们可以使用 Redis 的 **主从同步** 功能帮助到我们，这样一来，有个备份，心里就踏实多了。

![](https://upload-images.jianshu.io/upload_images/7896890-4a32b9efa3885655.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### Redis 哨兵

后来因为某种神秘力量，Redis 老会在莫名其妙的时间点出问题 *(比如半夜 2 点)*，我总不能 24 小时时刻守在电脑旁边切换节点吧，于是另一个想法又开始了：给所有的节点找一个 **"管家"**，自动帮我监听照顾节点的状态并切换：

![](https://upload-images.jianshu.io/upload_images/7896890-de8d9ce9e77bf211.gif?imageMogr2/auto-orient/strip)

这大概就是 **Redis 哨兵** *(Sentinel)* 的简单理解啦。什么？管家宕机了怎么办？相较于有大量请求的 Redis 服务来说，管家宕机的概率就要小得多啦.. 如果真的宕机了，我们也可以直接切换成当前可用的节点保证可用..

![](https://upload-images.jianshu.io/upload_images/7896890-c7657fb8140d7cc6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### Redis 集群化

好了，通过上面的一些解决方案我们对 Redis 的 **稳定性** 稍微有了一些底气了，但单台节点的计算能力始终有限，所谓人多力量大，如果我们把 **多个节点组合** 成 **一个可用的工作节点**，那就大大增加了 Redis 的  **高可用、可扩展、分布式、容错** 等特性：

![](https://upload-images.jianshu.io/upload_images/7896890-8957aa6d1484c5de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 二、主从复制

![](https://upload-images.jianshu.io/upload_images/7896890-4956a718c124a81f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**主从复制**，是指将一台 Redis 服务器的数据，复制到其他的 Redis 服务器。前者称为 **主节点(master)**，后者称为 **从节点(slave)**。且数据的复制是 **单向** 的，只能由主节点到从节点。Redis 主从复制支持 **主从同步** 和 **从从同步** 两种，后者是 Redis 后续版本新增的功能，以减轻主节点的同步负担。

#### 主从复制主要的作用

- **数据冗余：** 主从复制实现了数据的热备份，是持久化之外的一种数据冗余方式。
- **故障恢复：** 当主节点出现问题时，可以由从节点提供服务，实现快速的故障恢复 *(实际上是一种服务的冗余)*。
- **负载均衡：** 在主从复制的基础上，配合读写分离，可以由主节点提供写服务，由从节点提供读服务 *（即写 Redis 数据时应用连接主节点，读 Redis 数据时应用连接从节点）*，分担服务器负载。尤其是在写少读多的场景下，通过多个从节点分担读负载，可以大大提高 Redis 服务器的并发量。
- **高可用基石：** 除了上述作用以外，主从复制还是哨兵和集群能够实施的 **基础**，因此说主从复制是 Redis 高可用的基础。

## 快速体验

在 **Redis** 中，用户可以通过执行 `SLAVEOF` 命令或者设置 `slaveof` 选项，让一个服务器去复制另一个服务器，以下三种方式是 **完全等效** 的：

- **配置文件**：在从服务器的配置文件中加入：`slaveof <masterip> <masterport>`
- **启动命令**：redis-server 启动命令后加入 `--slaveof <masterip> <masterport>`
- **客户端命令**：Redis 服务器启动后，直接通过客户端执行命令：`slaveof <masterip> <masterport>`，让该 Redis 实例成为从节点。

需要注意的是：**主从复制的开启，完全是在从节点发起的，不需要我们在主节点做任何事情。**

#### 第一步：本地启动两个节点

在正确安装好 Redis 之后，我们可以使用 `redis-server --port <port>` 的方式指定创建两个不同端口的 Redis 实例，例如，下方我分别创建了一个 `6379` 和 `6380` 的两个 Redis 实例：

```bash
# 创建一个端口为 6379 的 Redis 实例
redis-server --port 6379
# 创建一个端口为 6380 的 Redis 实例
redis-server --port 6380
```

此时两个 Redis 节点启动后，都默认为 **主节点**。

#### 第二步：建立复制

我们在 `6380` 端口的节点中执行 `slaveof` 命令，使之变为从节点：

```bash
# 在 6380 端口的 Redis 实例中使用控制台
redis-cli -p 6380
# 成为本地 6379 端口实例的从节点
127.0.0.1:6380> SLAVEOF 127.0.0.1ø 6379
OK
```

#### 第三步：观察效果

下面我们来验证一下，主节点的数据是否会复制到从节点之中：

- 先在 **从节点** 中查询一个 **不存在** 的 key：
```bash
127.0.0.1:6380> GET mykey
(nil)
```
- 再在 **主节点** 中添加这个 key：
```bash
127.0.0.1:6379> SET mykey myvalue
OK
```
- 此时再从 **从节点** 中查询，会发现已经从 **主节点** 同步到 **从节点**：
```bash
127.0.0.1:6380> GET mykey
"myvalue"
```

#### 第四步：断开复制

通过 `slaveof <masterip> <masterport>` 命令建立主从复制关系以后，可以通过 `slaveof no one` 断开。需要注意的是，从节点断开复制后，**不会删除已有的数据**，只是不再接受主节点新的数据变化。

从节点执行 `slaveof no one` 之后，从节点和主节点分别打印日志如下：、

```bash
# 从节点打印日志
61496:M 17 Mar 2020 08:10:22.749 # Connection with master lost.
61496:M 17 Mar 2020 08:10:22.749 * Caching the disconnected master state.
61496:M 17 Mar 2020 08:10:22.749 * Discarding previously cached master state.
61496:M 17 Mar 2020 08:10:22.749 * MASTER MODE enabled (user request from 'id=4 addr=127.0.0.1:55096 fd=8 name= age=1664 idle=0 flags=N db=0 sub=0 psub=0 multi=-1 qbuf=34 qbuf-free=32734 obl=0 oll=0 omem=0 events=r cmd=slaveof')

# 主节点打印日志
61467:M 17 Mar 2020 08:10:22.749 # Connection with replica 127.0.0.1:6380 lost.
```

## 实现原理简析

![](https://upload-images.jianshu.io/upload_images/7896890-c97a6bcc0936cd17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为了节省篇幅，我把主要的步骤都 **浓缩** 在了上图中，其实也可以 **简化成三个阶段：准备阶段-数据同步阶段-命令传播阶段**。下面我们来进行一些必要的说明。

#### 身份验证 | 主从复制安全问题

在上面的 **快速体验** 过程中，你会发现 `slaveof` 这个命令居然不需要验证？这意味着只要知道了 ip 和端口就可以随意拷贝服务器上的数据了？

![](https://upload-images.jianshu.io/upload_images/7896890-d0c7a74da972fca3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那当然不能够了，我们可以通过在 **主节点** 配置 `requirepass` 来设置密码，这样就必须在 **从节点** 中对应配置好 `masterauth` 参数 *(与主节点 `requirepass` 保持一致)* 才能够进行正常复制了。

#### SYNC 命令是一个非常耗费资源的操作

每次执行 `SYNC` 命令，主从服务器需要执行如下动作：

1. **主服务器** 需要执行 `BGSAVE` 命令来生成 RDB 文件，这个生成操作会 **消耗** 主服务器大量的 **CPU、内存和磁盘 I/O 的资源**；
2. **主服务器** 需要将自己生成的 RDB 文件 发送给从服务器，这个发送操作会 **消耗** 主服务器 **大量的网络资源** *(带宽和流量)*，并对主服务器响应命令请求的时间产生影响；
3. 接收到 RDB 文件的 **从服务器** 需要载入主服务器发来的 RBD 文件，并且在载入期间，从服务器 **会因为阻塞而没办法处理命令请求**；

特别是当出现 **断线重复制** 的情况是时，为了让从服务器补足断线时确实的那一小部分数据，却要执行一次如此耗资源的 `SYNC` 命令，显然是不合理的。

#### PSYNC 命令的引入

所以在 **Redis 2.8** 中引入了 `PSYNC` 命令来代替 `SYNC`，它具有两种模式：

1. **全量复制：** 用于初次复制或其他无法进行部分复制的情况，将主节点中的所有数据都发送给从节点，是一个非常重型的操作；
2. **部分复制：** 用于网络中断等情况后的复制，只将 **中断期间主节点执行的写命令** 发送给从节点，与全量复制相比更加高效。**需要注意** 的是，如果网络中断时间过长，导致主节点没有能够完整地保存中断期间执行的写命令，则无法进行部分复制，仍使用全量复制；


部分复制的原理主要是靠主从节点分别维护一个 **复制偏移量**，有了这个偏移量之后断线重连之后一比较，之后就可以仅仅把从服务器断线之后确实的这部分数据给补回来了。

> 更多的详细内容可以参考下方 *参考资料 3*

# 三、Redis Sentinel 哨兵

![](https://upload-images.jianshu.io/upload_images/7896890-884d5be9a2ddfebc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

*上图* 展示了一个典型的哨兵架构图，它由两部分组成，哨兵节点和数据节点：

- **哨兵节点：** 哨兵系统由一个或多个哨兵节点组成，哨兵节点是特殊的 Redis 节点，不存储数据；
- **数据节点：** 主节点和从节点都是数据节点；

在复制的基础上，哨兵实现了 **自动化的故障恢复** 功能，下方是官方对于哨兵功能的描述：

- **监控（Monitoring）：** 哨兵会不断地检查主节点和从节点是否运作正常。
- **自动故障转移（Automatic failover）：** 当 **主节点** 不能正常工作时，哨兵会开始 **自动故障转移操作**，它会将失效主节点的其中一个 **从节点升级为新的主节点**，并让其他从节点改为复制新的主节点。
- **配置提供者（Configuration provider）：** 客户端在初始化时，通过连接哨兵来获得当前 Redis 服务的主节点地址。
- **通知（Notification）：** 哨兵可以将故障转移的结果发送给客户端。

其中，监控和自动故障转移功能，使得哨兵可以及时发现主节点故障并完成转移。而配置提供者和通知功能，则需要在与客户端的交互中才能体现。

## 快速体验

#### 第一步：创建主从节点配置文件并启动

正确安装好 Redis 之后，我们去到 Redis 的安装目录 *(mac 默认在 `/usr/local/`)*，找到 `redis.conf` 文件复制三份分别命名为 `redis-master.conf`/`redis-slave1.conf`/`redis-slave2.conf`，分别作为 `1` 个主节点和 `2` 个从节点的配置文件 *(下图演示了我本机的 `redis.conf` 文件的位置)*

![](https://upload-images.jianshu.io/upload_images/7896890-34de77bfca56d32e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

打开可以看到这个 `.conf` 后缀的文件里面有很多说明的内容，全部删除然后分别改成下面的样子：

```bash
#redis-master.conf
port 6379
daemonize yes
logfile "6379.log"
dbfilename "dump-6379.rdb"
 
#redis-slave1.conf
port 6380
daemonize yes
logfile "6380.log"
dbfilename "dump-6380.rdb"
slaveof 127.0.0.1 6379
 
#redis-slave2.conf
port 6381
daemonize yes
logfile "6381.log"
dbfilename "dump-6381.rdb"
slaveof 127.0.0.1 6379
```

然后我们可以执行 `redis-server <config file path>` 来根据配置文件启动不同的 Redis 实例，依次启动主从节点：

```bash
redis-server /usr/local/redis-5.0.3/redis-master.conf
redis-server /usr/local/redis-5.0.3/redis-slave1.conf
redis-server /usr/local/redis-5.0.3/redis-slave2.conf
```

节点启动后，我们执行 `redis-cli` 默认连接到我们端口为 `6379` 的主节点执行 `info Replication` 检查一下主从状态是否正常：*(可以看到下方正确地显示了两个从节点)*

![](https://upload-images.jianshu.io/upload_images/7896890-a1c935f094240cac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 第二步：创建哨兵节点配置文件并启动

按照上面同样的方法，我们给哨兵节点也创建三个配置文件。*(哨兵节点本质上是特殊的 Redis 节点，所以配置几乎没什么差别，只是在端口上做区分就好)*

```bash
# redis-sentinel-1.conf
port 26379
daemonize yes
logfile "26379.log"
sentinel monitor mymaster 127.0.0.1 6379 2

# redis-sentinel-2.conf
port 26380
daemonize yes
logfile "26380.log"
sentinel monitor mymaster 127.0.0.1 6379 2

# redis-sentinel-3.conf
port 26381
daemonize yes
logfile "26381.log"
sentinel monitor mymaster 127.0.0.1 6379 2
```

其中，`sentinel monitor mymaster 127.0.0.1 6379 2` 配置的含义是：该哨兵节点监控 `127.0.0.1:6379` 这个主节点，该主节点的名称是 `mymaster`，最后的 `2` 的含义与主节点的故障判定有关：至少需要 `2` 个哨兵节点同意，才能判定主节点故障并进行故障转移。

执行下方命令将哨兵节点启动起来：

```bash
redis-server /usr/local/redis-5.0.3/redis-sentinel-1.conf --sentinel
redis-server /usr/local/redis-5.0.3/redis-sentinel-2.conf --sentinel
redis-server /usr/local/redis-5.0.3/redis-sentinel-3.conf --sentinel
```

使用 `redis-cil` 工具连接哨兵节点，并执行 `info Sentinel` 命令来查看是否已经在监视主节点了：

```bash
# 连接端口为 26379 的 Redis 节点
➜  ~ redis-cli -p 26379
127.0.0.1:26379> info Sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=127.0.0.1:6379,slaves=2,sentinels=3
```

此时你打开刚才写好的哨兵配置文件，你还会发现出现了一些变化：

#### 第三步：演示故障转移

首先，我们使用 `kill -9` 命令来杀掉主节点，**同时** 在哨兵节点中执行 `info Sentinel` 命令来观察故障节点的过程：

```bash
➜  ~ ps aux | grep 6379
longtao          74529   0.3  0.0  4346936   2132   ??  Ss   10:30上午   0:03.09 redis-server *:26379 [sentinel]
longtao          73541   0.2  0.0  4348072   2292   ??  Ss   10:18上午   0:04.79 redis-server *:6379
longtao          75521   0.0  0.0  4286728    728 s008  S+   10:39上午   0:00.00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn 6379
longtao          74836   0.0  0.0  4289844    944 s006  S+   10:32上午   0:00.01 redis-cli -p 26379
➜  ~ kill -9 73541
```

如果 **刚杀掉瞬间** 在哨兵节点中执行 `info` 命令来查看，会发现主节点还没有切换过来，因为哨兵发现主节点故障并转移需要一段时间：

```bash
# 第一时间查看哨兵节点发现并未转移，还在 6379 端口
127.0.0.1:26379> info Sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=127.0.0.1:6379,slaves=2,sentinels=3
```

一段时间之后你再执行 `info` 命令，查看，你就会发现主节点已经切换成了 `6381` 端口的从节点：

```bash
# 过一段时间之后在执行，发现已经切换了 6381 端口
127.0.0.1:26379> info Sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=127.0.0.1:6381,slaves=2,sentinels=3
```

但同时还可以发现，**哨兵节点认为新的主节点仍然有两个从节点** *(上方 slaves=2)*，这是因为哨兵在将 `6381` 切换成主节点的同时，将 `6379` 节点置为其从节点。虽然 `6379` 从节点已经挂掉，但是由于 **哨兵并不会对从节点进行客观下线**，因此认为该从节点一直存在。当 `6379` 节点重新启动后，会自动变成 `6381` 节点的从节点。

另外，在故障转移的阶段，哨兵和主从节点的配置文件都会被改写：

- **对于主从节点：** 主要是 `slaveof` 配置的变化，新的主节点没有了 `slaveof` 配置，其从节点则 `slaveof` 新的主节点。
- **对于哨兵节点：** 除了主从节点信息的变化，纪元(epoch) *(记录当前集群状态的参数)* 也会变化，纪元相关的参数都 +1 了。

## 客户端访问哨兵系统代码演示

上面我们在 *快速体验* 中主要感受到了服务端自己对于当前主从节点的自动化治理，下面我们以 Java 代码为例，来演示一下客户端如何访问我们的哨兵系统：

```java
public static void testSentinel() throws Exception {
         String masterName = "mymaster";
         Set<String> sentinels = new HashSet<>();
         sentinels.add("127.0.0.1:26379");
         sentinels.add("127.0.0.1:26380");
         sentinels.add("127.0.0.1:26381");
         
         // 初始化过程做了很多工作
         JedisSentinelPool pool = new JedisSentinelPool(masterName, sentinels); 
         Jedis jedis = pool.getResource();
         jedis.set("key1", "value1");
         pool.close();
}
```

#### 客户端原理

Jedis 客户端对哨兵提供了很好的支持。如上述代码所示，我们只需要向 Jedis 提供哨兵节点集合和 `masterName` ，构造 `JedisSentinelPool` 对象，然后便可以像使用普通 Redis 连接池一样来使用了：通过 `pool.getResource()` 获取连接，执行具体的命令。

在整个过程中，我们的代码不需要显式的指定主节点的地址，就可以连接到主节点；代码中对故障转移没有任何体现，就可以在哨兵完成故障转移后自动的切换主节点。之所以可以做到这一点，是因为在 `JedisSentinelPool` 的构造器中，进行了相关的工作；主要包括以下两点：

1. **遍历哨兵节点，获取主节点信息：** 遍历哨兵节点，通过其中一个哨兵节点 + `masterName` 获得主节点的信息；该功能是通过调用哨兵节点的 `sentinel get-master-addr-by-name` 命令实现；
2. **增加对哨兵的监听：** 这样当发生故障转移时，客户端便可以收到哨兵的通知，从而完成主节点的切换。具体做法是：利用 Redis 提供的 **发布订阅** 功能，为每一个哨兵节点开启一个单独的线程，订阅哨兵节点的 + switch-master 频道，当收到消息时，重新初始化连接池。

## 新的主服务器是怎样被挑选出来的？

**故障转移操作的第一步** 要做的就是在已下线主服务器属下的所有从服务器中，挑选出一个状态良好、数据完整的从服务器，然后向这个从服务器发送 `slaveof no one` 命令，将这个从服务器转换为主服务器。但是这个从服务器是怎么样被挑选出来的呢？

![](https://upload-images.jianshu.io/upload_images/7896890-02dfea57f44fc27e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

简单来说 Sentinel 使用以下规则来选择新的主服务器：

1. 在失效主服务器属下的从服务器当中， 那些被标记为主观下线、已断线、或者最后一次回复 PING 命令的时间大于五秒钟的从服务器都会被 **淘汰**。
2. 在失效主服务器属下的从服务器当中， 那些与失效主服务器连接断开的时长超过 down-after 选项指定的时长十倍的从服务器都会被 **淘汰**。
3. 在 **经历了以上两轮淘汰之后** 剩下来的从服务器中， 我们选出 **复制偏移量（replication offset）最大** 的那个 **从服务器** 作为新的主服务器；如果复制偏移量不可用，或者从服务器的复制偏移量相同，那么 **带有最小运行 ID** 的那个从服务器成为新的主服务器。

# 四、Redis 集群

![](https://upload-images.jianshu.io/upload_images/7896890-516eb4a9465451a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

*上图* 展示了 **Redis Cluster** 典型的架构图，集群中的每一个 Redis 节点都 **互相两两相连**，客户端任意 **直连** 到集群中的 **任意一台**，就可以对其他 Redis 节点进行 **读写** 的操作。

#### 基本原理

![](https://upload-images.jianshu.io/upload_images/7896890-f65c71ca6811c634.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Redis 集群中内置了 `16384` 个哈希槽。当客户端连接到 Redis 集群之后，会同时得到一份关于这个 **集群的配置信息**，当客户端具体对某一个 `key` 值进行操作时，会计算出它的一个 Hash 值，然后把结果对 `16384`  **求余数**，这样每个 `key` 都会对应一个编号在 `0-16383` 之间的哈希槽，Redis 会根据节点数量 **大致均等** 的将哈希槽映射到不同的节点。 

再结合集群的配置信息就能够知道这个 `key` 值应该存储在哪一个具体的 Redis 节点中，如果不属于自己管，那么就会使用一个特殊的 `MOVED` 命令来进行一个跳转，告诉客户端去连接这个节点以获取数据：

```bash
GET x
-MOVED 3999 127.0.0.1:6381
```

`MOVED` 指令第一个参数 `3999` 是 `key` 对应的槽位编号，后面是目标节点地址，`MOVED` 命令前面有一个减号，表示这是一个错误的消息。客户端在收到 `MOVED` 指令后，就立即纠正本地的 **槽位映射表**，那么下一次再访问 `key` 时就能够到正确的地方去获取了。

#### 集群的主要作用

1. **数据分区：** 数据分区 *(或称数据分片)* 是集群最核心的功能。集群将数据分散到多个节点，**一方面** 突破了 Redis 单机内存大小的限制，**存储容量大大增加**；**另一方面** 每个主节点都可以对外提供读服务和写服务，**大大提高了集群的响应能力**。Redis 单机内存大小受限问题，在介绍持久化和主从复制时都有提及，例如，如果单机内存太大，`bgsave` 和 `bgrewriteaof` 的 `fork` 操作可能导致主进程阻塞，主从环境下主机切换时可能导致从节点长时间无法提供服务，全量复制阶段主节点的复制缓冲区可能溢出……
2. **高可用：** 集群支持主从复制和主节点的 **自动故障转移** *（与哨兵类似）*，当任一节点发生故障时，集群仍然可以对外提供服务。

## 快速体验

#### 第一步：创建集群节点配置文件

首先我们找一个地方创建一个名为 `redis-cluster` 的目录：

```bash
mkdir -p ~/Desktop/redis-cluster
```

然后按照上面的方法，创建六个配置文件，分别命名为：`redis_7000.conf`/`redis_7001.conf`.....`redis_7005.conf`，然后根据不同的端口号修改对应的端口值就好了：

```bash
# 后台执行
daemonize yes
# 端口号
port 7000
# 为每一个集群节点指定一个 pid_file
pidfile ~/Desktop/redis-cluster/redis_7000.pid
# 启动集群模式
cluster-enabled yes
# 每一个集群节点都有一个配置文件，这个文件是不能手动编辑的。确保每一个集群节点的配置文件不通
cluster-config-file nodes-7000.conf
# 集群节点的超时时间，单位：ms，超时后集群会认为该节点失败
cluster-node-timeout 5000
# 最后将 appendonly 改成 yes(AOF 持久化)
appendonly yes
```

记得把对应上述配置文件中根端口对应的配置都修改掉 *(port/ pidfile/ cluster-config-file)*。

#### 第二步：分别启动 6 个 Redis 实例

```bash
redis-server ~/Desktop/redis-cluster/redis_7000.conf
redis-server ~/Desktop/redis-cluster/redis_7001.conf
redis-server ~/Desktop/redis-cluster/redis_7002.conf
redis-server ~/Desktop/redis-cluster/redis_7003.conf
redis-server ~/Desktop/redis-cluster/redis_7004.conf
redis-server ~/Desktop/redis-cluster/redis_7005.conf
```

然后执行 `ps -ef | grep redis` 查看是否启动成功：

![](https://upload-images.jianshu.io/upload_images/7896890-452c3152054c36f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到 `6` 个 Redis 节点都以集群的方式成功启动了，**但是现在每个节点还处于独立的状态**，也就是说它们每一个都各自成了一个集群，还没有互相联系起来，我们需要手动地把他们之间建立起联系。

#### 第三步：建立集群

执行下列命令：

```bash
redis-cli --cluster create --cluster-replicas 1 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005
```

- 这里稍微解释一下这个 `--replicas 1` 的意思是：我们希望为集群中的每个主节点创建一个从节点。

观察控制台输出：

![](https://upload-images.jianshu.io/upload_images/7896890-d5ab644e76e9cc87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看到 `[OK]` 的信息之后，就表示集群已经搭建成功了，可以看到，这里我们正确地创建了三主三从的集群。

#### 第四步：验证集群

我们先使用 `redic-cli` 任意连接一个节点：

```bash
redis-cli -c -h 127.0.0.1 -p 7000
127.0.0.1:7000>
```

- `-c`表示集群模式；`-h` 指定 ip 地址；`-p` 指定端口。

然后随便 `set` 一些值观察控制台输入：

```bash
127.0.0.1:7000> SET name wmyskxz
-> Redirected to slot [5798] located at 127.0.0.1:7001
OK
127.0.0.1:7001>
```

可以看到这里 Redis 自动帮我们进行了 `Redirected` 操作跳转到了 `7001` 这个实例上。

我们再使用 `cluster info` *(查看集群信息)* 和 `cluster nodes` *(查看节点列表)* 来分别看看：*(任意节点输入均可)*

```bash
127.0.0.1:7001> CLUSTER INFO
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:6
cluster_my_epoch:2
cluster_stats_messages_ping_sent:1365
cluster_stats_messages_pong_sent:1358
cluster_stats_messages_meet_sent:4
cluster_stats_messages_sent:2727
cluster_stats_messages_ping_received:1357
cluster_stats_messages_pong_received:1369
cluster_stats_messages_meet_received:1
cluster_stats_messages_received:2727

127.0.0.1:7001> CLUSTER NODES
56a04742f36c6e84968cae871cd438935081e86f 127.0.0.1:7003@17003 slave 4ec8c022e9d546c9b51deb9d85f6cf867bf73db6 0 1584428884000 4 connected
4ec8c022e9d546c9b51deb9d85f6cf867bf73db6 127.0.0.1:7000@17000 master - 0 1584428884000 1 connected 0-5460
e2539c4398b8258d3f9ffa714bd778da107cb2cd 127.0.0.1:7005@17005 slave a3406db9ae7144d17eb7df5bffe8b70bb5dd06b8 0 1584428885222 6 connected
d31cd1f423ab1e1849cac01ae927e4b6950f55d9 127.0.0.1:7004@17004 slave 236cefaa9cdc295bc60a5bd1aed6a7152d4f384d 0 1584428884209 5 connected
236cefaa9cdc295bc60a5bd1aed6a7152d4f384d 127.0.0.1:7001@17001 myself,master - 0 1584428882000 2 connected 5461-10922
a3406db9ae7144d17eb7df5bffe8b70bb5dd06b8 127.0.0.1:7002@17002 master - 0 1584428884000 3 connected 10923-16383
127.0.0.1:7001>
```

## 数据分区方案简析

#### 方案一：哈希值 % 节点数

哈希取余分区思路非常简单：计算 `key` 的 hash 值，然后对节点数量进行取余，从而决定数据映射到哪个节点上。

不过该方案最大的问题是，**当新增或删减节点时**，节点数量发生变化，系统中所有的数据都需要 **重新计算映射关系**，引发大规模数据迁移。

#### 方案二：一致性哈希分区

一致性哈希算法将 **整个哈希值空间** 组织成一个虚拟的圆环，范围是 *[0 , 2<sup>32</sup>-1]*，对于每一个数据，根据 `key` 计算 hash 值，确数据在环上的位置，然后从此位置沿顺时针行走，找到的第一台服务器就是其应该映射到的服务器：

![](https://upload-images.jianshu.io/upload_images/7896890-40e8a2c096c8da92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

与哈希取余分区相比，一致性哈希分区将 **增减节点的影响限制在相邻节点**。以上图为例，如果在 `node1` 和 `node2` 之间增加 `node5`，则只有 `node2` 中的一部分数据会迁移到 `node5`；如果去掉 `node2`，则原 `node2` 中的数据只会迁移到 `node4` 中，只有 `node4` 会受影响。

一致性哈希分区的主要问题在于，当 **节点数量较少** 时，增加或删减节点，**对单个节点的影响可能很大**，造成数据的严重不平衡。还是以上图为例，如果去掉 `node2`，`node4` 中的数据由总数据的 `1/4` 左右变为 `1/2` 左右，与其他节点相比负载过高。

#### 方案三：带有虚拟节点的一致性哈希分区

该方案在 **一致性哈希分区的基础上**，引入了 **虚拟节点** 的概念。Redis 集群使用的便是该方案，其中的虚拟节点称为 **槽（slot）**。槽是介于数据和实际节点之间的虚拟概念，每个实际节点包含一定数量的槽，每个槽包含哈希值在一定范围内的数据。

在使用了槽的一致性哈希分区中，**槽是数据管理和迁移的基本单位**。槽 **解耦** 了 **数据和实际节点** 之间的关系，增加或删除节点对系统的影响很小。仍以上图为例，系统中有 `4` 个实际节点，假设为其分配 `16` 个槽(0-15)； 

- 槽 0-3 位于 node1；4-7 位于 node2；以此类推....

如果此时删除 `node2`，只需要将槽 4-7 重新分配即可，例如槽 4-5 分配给 `node1`，槽 6 分配给 `node3`，槽 7 分配给 `node4`；可以看出删除 `node2` 后，数据在其他节点的分布仍然较为均衡。

## 节点通信机制简析

集群的建立离不开节点之间的通信，例如我们上访在 *快速体验* 中刚启动六个集群节点之后通过 `redis-cli` 命令帮助我们搭建起来了集群，实际上背后每个集群之间的两两连接是通过了 `CLUSTER MEET <ip> <port>` 命令发送 `MEET` 消息完成的，下面我们展开详细说说。

#### 两个端口

在 **哨兵系统** 中，节点分为 **数据节点** 和 **哨兵节点**：前者存储数据，后者实现额外的控制功能。在 **集群** 中，没有数据节点与非数据节点之分：**所有的节点都存储数据，也都参与集群状态的维护**。为此，集群中的每个节点，都提供了两个 TCP 端口：

- **普通端口：** 即我们在前面指定的端口 *(7000等)*。普通端口主要用于为客户端提供服务 *（与单机节点类似）*；但在节点间数据迁移时也会使用。
- **集群端口：** 端口号是普通端口 + 10000 *（10000是固定值，无法改变）*，如 `7000` 节点的集群端口为 `17000`。**集群端口只用于节点之间的通信**，如搭建集群、增减节点、故障转移等操作时节点间的通信；不要使用客户端连接集群接口。为了保证集群可以正常工作，在配置防火墙时，要同时开启普通端口和集群端口。

#### Gossip 协议

节点间通信，按照通信协议可以分为几种类型：单对单、广播、Gossip 协议等。重点是广播和 Gossip 的对比。

- 广播是指向集群内所有节点发送消息。**优点** 是集群的收敛速度快(集群收敛是指集群内所有节点获得的集群信息是一致的)，**缺点** 是每条消息都要发送给所有节点，CPU、带宽等消耗较大。
- Gossip 协议的特点是：在节点数量有限的网络中，**每个节点都 “随机” 的与部分节点通信** *（并不是真正的随机，而是根据特定的规则选择通信的节点）*，经过一番杂乱无章的通信，每个节点的状态很快会达到一致。Gossip 协议的 **优点** 有负载 *(比广播)* 低、去中心化、容错性高 *(因为通信有冗余)* 等；**缺点** 主要是集群的收敛速度慢。

#### 消息类型

集群中的节点采用 **固定频率（每秒10次）** 的 **定时任务** 进行通信相关的工作：判断是否需要发送消息及消息类型、确定接收节点、发送消息等。如果集群状态发生了变化，如增减节点、槽状态变更，通过节点间的通信，所有节点会很快得知整个集群的状态，使集群收敛。

节点间发送的消息主要分为 `5` 种：`meet 消息`、`ping 消息`、`pong 消息`、`fail 消息`、`publish 消息`。不同的消息类型，通信协议、发送的频率和时机、接收节点的选择等是不同的：

- **MEET 消息：** 在节点握手阶段，当节点收到客户端的 `CLUSTER MEET` 命令时，会向新加入的节点发送 `MEET` 消息，请求新节点加入到当前集群；新节点收到 MEET 消息后会回复一个 `PONG` 消息。
- **PING 消息：** 集群里每个节点每秒钟会选择部分节点发送 `PING` 消息，接收者收到消息后会回复一个 `PONG` 消息。**PING 消息的内容是自身节点和部分其他节点的状态信息**，作用是彼此交换信息，以及检测节点是否在线。`PING` 消息使用 Gossip 协议发送，接收节点的选择兼顾了收敛速度和带宽成本，**具体规则如下**：(1)随机找 5 个节点，在其中选择最久没有通信的 1 个节点；(2)扫描节点列表，选择最近一次收到 `PONG` 消息时间大于 `cluster_node_timeout / 2` 的所有节点，防止这些节点长时间未更新。
- **PONG消息：** `PONG` 消息封装了自身状态数据。可以分为两种：**第一种** 是在接到 `MEET/PING` 消息后回复的 `PONG` 消息；**第二种** 是指节点向集群广播 `PONG` 消息，这样其他节点可以获知该节点的最新信息，例如故障恢复后新的主节点会广播 `PONG` 消息。
- **FAIL 消息：** 当一个主节点判断另一个主节点进入 `FAIL` 状态时，会向集群广播这一 `FAIL` 消息；接收节点会将这一 `FAIL` 消息保存起来，便于后续的判断。
- **PUBLISH 消息：** 节点收到 `PUBLISH` 命令后，会先执行该命令，然后向集群广播这一消息，接收节点也会执行该 `PUBLISH` 命令。

## 数据结构简析

节点需要专门的数据结构来存储集群的状态。所谓集群的状态，是一个比较大的概念，包括：集群是否处于上线状态、集群中有哪些节点、节点是否可达、节点的主从状态、槽的分布……

节点为了存储集群状态而提供的数据结构中，最关键的是 `clusterNode` 和 `clusterState` 结构：前者记录了一个节点的状态，后者记录了集群作为一个整体的状态。

#### clusterNode 结构

`clusterNode` 结构保存了 **一个节点的当前状态**，包括创建时间、节点 id、ip 和端口号等。每个节点都会用一个 `clusterNode` 结构记录自己的状态，并为集群内所有其他节点都创建一个 `clusterNode` 结构来记录节点状态。

下面列举了 `clusterNode` 的部分字段，并说明了字段的含义和作用：

```c
typedef struct clusterNode {
    //节点创建时间
    mstime_t ctime;
    //节点id
    char name[REDIS_CLUSTER_NAMELEN];
    //节点的ip和端口号
    char ip[REDIS_IP_STR_LEN];
    int port;
    //节点标识：整型，每个bit都代表了不同状态，如节点的主从状态、是否在线、是否在握手等
    int flags;
    //配置纪元：故障转移时起作用，类似于哨兵的配置纪元
    uint64_t configEpoch;
    //槽在该节点中的分布：占用16384/8个字节，16384个比特；每个比特对应一个槽：比特值为1，则该比特对应的槽在节点中；比特值为0，则该比特对应的槽不在节点中
    unsigned char slots[16384/8];
    //节点中槽的数量
    int numslots;
    …………
} clusterNode;
```

除了上述字段，`clusterNode` 还包含节点连接、主从复制、故障发现和转移需要的信息等。

#### clusterState 结构

`clusterState` 结构保存了在当前节点视角下，集群所处的状态。主要字段包括：

```c
typedef struct clusterState {
    //自身节点
    clusterNode *myself;
    //配置纪元
    uint64_t currentEpoch;
    //集群状态：在线还是下线
    int state;
    //集群中至少包含一个槽的节点数量
    int size;
    //哈希表，节点名称->clusterNode节点指针
    dict *nodes;
    //槽分布信息：数组的每个元素都是一个指向clusterNode结构的指针；如果槽还没有分配给任何节点，则为NULL
    clusterNode *slots[16384];
    …………
} clusterState;
```

除此之外，`clusterState` 还包括故障转移、槽迁移等需要的信息。

> 更多关于集群内容请自行阅读《Redis 设计与实现》，其中有更多细节方面的介绍 - [http://redisbook.com/](http://redisbook.com/)

# 相关阅读

1. Redis(1)——5种基本数据结构 - [https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/](https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/)
2. Redis(2)——跳跃表 - [https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/](https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/)
3. Redis(3)——分布式锁深入探究 - [https://www.wmyskxz.com/2020/03/01/redis-3/](https://www.wmyskxz.com/2020/03/01/redis-3/)
4. Reids(4)——神奇的HyperLoglog解决统计问题 - [https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/](https://www.wmyskxz.com/2020/03/02/reids-4-shen-qi-de-hyperloglog-jie-jue-tong-ji-wen-ti/)
5. Redis(5)——亿级数据过滤和布隆过滤器 - [https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/](https://www.wmyskxz.com/2020/03/11/redis-5-yi-ji-shu-ju-guo-lu-he-bu-long-guo-lu-qi/)
6. Redis(6)——GeoHash查找附近的人[https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/](https://www.wmyskxz.com/2020/03/12/redis-6-geohash-cha-zhao-fu-jin-de-ren/)
7. Redis(7)——持久化【一文了解】 - [https://www.wmyskxz.com/2020/03/13/redis-7-chi-jiu-hua-yi-wen-liao-jie/](https://www.wmyskxz.com/2020/03/13/redis-7-chi-jiu-hua-yi-wen-liao-jie/)
8. Redis(8)——发布/订阅与Stream - [https://www.wmyskxz.com/2020/03/15/redis-8-fa-bu-ding-yue-yu-stream/](https://www.wmyskxz.com/2020/03/15/redis-8-fa-bu-ding-yue-yu-stream/)

# 参考资料

1. 《Redis 设计与实现》 | 黄健宏 著 - [http://redisbook.com/](http://redisbook.com/)
2. 《Redis 深度历险》 | 钱文品 著 - [https://book.douban.com/subject/30386804/](https://book.douban.com/subject/30386804/)
3. 深入学习Redis（3）：主从复制 - [https://www.cnblogs.com/kismetv/p/9236731.html](https://www.cnblogs.com/kismetv/p/9236731.html)
4. Redis 主从复制 原理与用法 - [https://blog.csdn.net/Stubborn_Cow/article/details/50442950](https://blog.csdn.net/Stubborn_Cow/article/details/50442950)
5. 深入学习Redis（4）：哨兵 - [https://www.cnblogs.com/kismetv/p/9609938.html](https://www.cnblogs.com/kismetv/p/9609938.html)
6. Redis 5 之后版本的高可用集群搭建 - [https://www.jianshu.com/p/8045b92fafb2](https://www.jianshu.com/p/8045b92fafb2)

> - 本文已收录至我的 Github 程序员成长系列 **【More Than Java】，学习，不止 Code，欢迎 star：[https://github.com/wmyskxz/MoreThanJava](https://github.com/wmyskxz/MoreThanJava)**
> - **个人公众号** ：wmyskxz，**个人独立域名博客**：wmyskxz.com，坚持原创输出，下方扫码关注，2020，与您共同成长！

![](https://upload-images.jianshu.io/upload_images/7896890-fca34cfd601e7449.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

非常感谢各位人才能 **看到这里**，如果觉得本篇文章写得不错，觉得 **「我没有三颗心脏」有点东西** 的话，**求点赞，求关注，求分享，求留言！**

创作不易，各位的支持和认可，就是我创作的最大动力，我们下篇文章见！