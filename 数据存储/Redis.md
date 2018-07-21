Redis 是一个使用 C 语言写成的，开源的 key-value 数据库。。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hash（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。目前，Vmware在资助着redis项目的开发和维护。

> ### 书籍推荐

**《Redis实战》**

**《Redis设计与实现》**

> ### 教程推荐

**redis官方中文版教程**：[http://www.redis.net.cn/tutorial/3501.html](http://www.redis.net.cn/tutorial/3501.html)

**Redis 教程（菜鸟教程）**：[http://www.runoob.com/redis/redis-tutorial.html](http://www.runoob.com/redis/redis-tutorial.html)

> ### 常见问题总结

**学完Redis之后要问自己下面几个问题：**
- Redis的两种持久化操作以及如何保障数据安全（快照和AOF），
- 如何防止数据出错（Redis事务），
- 如何使用流水线来提升性能，
- Redis主从复制，
- Redis集群的搭建
- Redis的几种淘汰策略


**《一文轻松搞懂redis集群原理及搭建与使用》：**
[https://juejin.im/post/5ad54d76f265da23970759d3](https://juejin.im/post/5ad54d76f265da23970759d3)

昨天写了一篇自己搭建redis集群并在自己项目中使用的文章，今天早上看别人写的面经发现redis在面试中还是比较常问的（笔主主Java方向）。所以查阅官方文档以及他人造好的轮子，总结了一些redis面试和学习中你必须掌握的问题。事无巨细，不可能囊括到所有内容，尽量把比较常见的写出来。欢迎关注我的微信公众号：“**Java面试通关手册**”，也可以加我微信：“**bwcx9393**”与我学习交流。

## Redis常见问题总结与好文Mark

### 什么是Redis？
> Redis 是一个使用 C 语言写成的，开源的 key-value 数据库。。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hash（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。目前，Vmware在资助着redis项目的开发和维护。


### Redis与Memcached的区别与比较
1 、Redis不仅仅支持简单的k/v类型的数据，同时还提供list，set，zset，hash等数据结构的存储。memcache支持简单的数据类型，String。

2 、Redis支持数据的备份，即master-slave模式的数据备份。

3 、Redis支持数据的持久化，可以将内存中的数据保持在磁盘中，重启的时候可以再次加载进行使用,而Memecache把数据全部存在内存之中

4、 redis的速度比memcached快很多

5、Memcached是多线程，非阻塞IO复用的网络模型；Redis使用单线程的IO复用模型。

![Redis与Memcached的区别与比较](https://user-gold-cdn.xitu.io/2018/4/18/162d7773080d4570?w=621&h=378&f=jpeg&s=45278)

如果想要更详细了解的话，可以查看慕课网上的这篇手记（非常推荐） **：《脚踏两只船的困惑 - Memcached与Redis》**：[https://www.imooc.com/article/23549](https://www.imooc.com/article/23549)

### Redis与Memcached的选择
**终极策略：** 使用Redis的String类型做的事，都可以用Memcached替换，以此换取更好的性能提升； 除此以外，优先考虑Redis；

### 使用redis有哪些好处？ 
(1) **速度快**，因为数据存在内存中，类似于HashMap，HashMap的优势就是查找和操作的时间复杂度都是O(1) 

(2)**支持丰富数据类型**，支持string，list，set，sorted set，hash 

(3) **支持事务** ：redis对事务是部分支持的，如果是在入队时报错，那么都不会执行；在非入队时报错，那么成功的就会成功执行。详细了解请参考：《Redis事务介绍（四）》：[https://blog.csdn.net/cuipeng0916/article/details/53698774](https://blog.csdn.net/cuipeng0916/article/details/53698774)

redis监控：锁的介绍

(4) **丰富的特性**：可用于缓存，消息，按key设置过期时间，过期后将会自动删除

### Redis常见数据结构使用场景

#### 1. String

> **常用命令:**  set,get,decr,incr,mget 等。


String数据结构是简单的key-value类型，value其实不仅可以是String，也可以是数字。 
常规key-value缓存应用； 
常规计数：微博数，粉丝数等。

#### 2.Hash
> **常用命令：** hget,hset,hgetall 等。

Hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。 比如我们可以Hash数据结构来存储用户信息，商品信息等等。

**举个例子：** 最近做的一个电商网站项目的首页就使用了redis的hash数据结构进行缓存，因为一个网站的首页访问量是最大的，所以通常网站的首页可以通过redis缓存来提高性能和并发量。我用**jedis客户端**来连接和操作我搭建的redis集群或者单机redis，利用jedis可以很容易的对redis进行相关操作，总的来说从搭一个简单的集群到实现redis作为缓存的整个步骤不难。感兴趣的可以看我昨天写的这篇文章：

**《一文轻松搞懂redis集群原理及搭建与使用》：** [https://juejin.im/post/5ad54d76f265da23970759d3](https://juejin.im/post/5ad54d76f265da23970759d3)

#### 3.List
> **常用命令:** lpush,rpush,lpop,rpop,lrange等

list就是链表，Redis list的应用场景非常多，也是Redis最重要的数据结构之一，比如微博的关注列表，粉丝列表，最新消息排行等功能都可以用Redis的list结构来实现。

Redis list的实现为一个双向链表，即可以支持反向查找和遍历，更方便操作，不过带来了部分额外的内存开销。


#### 4.Set
> **常用命令：**
sadd,spop,smembers,sunion 等

set对外提供的功能与list类似是一个列表的功能，特殊之处在于set是可以自动排重的。
当你需要存储一个列表数据，又不希望出现重复数据时，set是一个很好的选择，并且set提供了判断某个成员是否在一个set集合内的重要接口，这个也是list所不能提供的。



在微博应用中，可以将一个用户所有的关注人存在一个集合中，将其所有粉丝存在一个集合。Redis可以非常方便的实现如共同关注、共同喜好、二度好友等功能。

#### 5.Sorted Set
> **常用命令：** zadd,zrange,zrem,zcard等


和set相比，sorted set增加了一个权重参数score，使得集合中的元素能够按score进行有序排列。

**举例：** 在直播系统中，实时排行信息包含直播间在线用户列表，各种礼物排行榜，弹幕消息（可以理解为按消息维度的消息排行榜）等信息，适合使用Redis中的SortedSet结构进行存储。


###  MySQL里有2000w数据，Redis中只存20w的数据，如何保证Redis中的数据都是热点数据（redis有哪些数据淘汰策略？？？）

　　　相关知识：redis 内存数据集大小上升到一定大小的时候，就会施行数据淘汰策略（回收策略）。redis 提供 6种数据淘汰策略：
1. **volatile-lru**：从已设置过期时间的数据集（server.db[i].expires）中挑选最近最少使用的数据淘汰
2. **volatile-ttl**：从已设置过期时间的数据集（server.db[i].expires）中挑选将要过期的数据淘汰
3. **volatile-random**：从已设置过期时间的数据集（server.db[i].expires）中任意选择数据淘汰
4. **allkeys-lru**：从数据集（server.db[i].dict）中挑选最近最少使用的数据淘汰
5. **allkeys-random**：从数据集（server.db[i].dict）中任意选择数据淘汰
6. **no-enviction**（驱逐）：禁止驱逐数据

### Redis的并发竞争问题如何解决?

Redis为单进程单线程模式，采用队列模式将并发访问变为串行访问。Redis本身没有锁的概念，Redis对于多个客户端连接并不存在竞争，但是在Jedis客户端对Redis进行并发访问时会发生连接超时、数据转换错误、阻塞、客户端关闭连接等问题，这些问题均是由于客户端连接混乱造成。对此有2种解决方法：

　1.客户端角度，为保证每个客户端间正常有序与Redis进行通信，对连接进行池化，同时对客户端读写Redis操作采用内部锁synchronized。
　
  2.服务器角度，利用setnx实现锁。
  
　注：对于第一种，需要应用程序自己处理资源的同步，可以使用的方法比较通俗，可以使用synchronized也可以使用lock；第二种需要用到Redis的setnx命令，但是需要注意一些问题。


### Redis回收进程如何工作的? Redis回收使用的是什么算法?
**Redis内存回收:LRU算法（写的很不错，推荐）**：[https://www.cnblogs.com/WJ5888/p/4371647.html](https://www.cnblogs.com/WJ5888/p/4371647.html)

### Redis 大量数据插入
官方文档给的解释：[http://www.redis.cn/topics/mass-insert.html](http://www.redis.cn/topics/mass-insert.html)

### Redis 分区的优势、不足以及分区类型
官方文档提供的讲解：[http://www.redis.net.cn/tutorial/3524.html](http://www.redis.net.cn/tutorial/3524.html)

### Redis持久化数据和缓存怎么做扩容？

**《redis的持久化和缓存机制》** ：[https://blog.csdn.net/tr1912/article/details/70197085?foxhandler=RssReadRenderProcessHandler](https://blog.csdn.net/tr1912/article/details/70197085?foxhandler=RssReadRenderProcessHandler)

扩容的话可以通过redis集群实现，之前做项目的时候用过自己搭的redis集群
然后写了一篇关于redis集群的文章：**《一文轻松搞懂redis集群原理及搭建与使用》**：[https://juejin.im/post/5ad54d76f265da23970759d3](https://juejin.im/post/5ad54d76f265da23970759d3)

### Redis常见性能问题和解决方案:

1. Master最好不要做任何持久化工作，如RDB内存快照和AOF日志文件 
2. 如果数据比较重要，某个Slave开启AOF备份数据，策略设置为每秒同步一次 
3. 为了主从复制的速度和连接的稳定性，Master和Slave最好在同一个局域网内 
4. 尽量避免在压力很大的主库上增加从库

### Redis与消息队列
>作者：翁伟
链接：https://www.zhihu.com/question/20795043/answer/345073457

不要使用redis去做消息队列，这不是redis的设计目标。但实在太多人使用redis去做去消息队列，redis的作者看不下去，另外基于redis的核心代码，另外实现了一个消息队列disque： antirez/disque:[https://github.com/antirez/disque](https://github.com/antirez/disque)部署、协议等方面都跟redis非常类似，并且支持集群，延迟消息等等。

我在做网站过程接触比较多的还是使用redis做缓存，比如秒杀系统，首页缓存等等。





## 好文Mark
**非常非常推荐下面几篇文章。。。**

**《Redis深入之道：原理解析、场景使用以及视频解读》**：[https://zhuanlan.zhihu.com/p/28073983](https://zhuanlan.zhihu.com/p/28073983):
主要介绍了：Redis集群开源的方案、Redis协议简介及持久化Aof文件解析、Redis短连接性能优化等等内容，文章干货太大，容量很大，建议时间充裕可以看看。另外文章里面还提供了视频讲解，可以说是非常非常用心了。

**《阿里云Redis混合存储典型场景：如何轻松搭建视频直播间系统》：**[https://yq.aliyun.com/articles/582487?utm_content=m_46529](https://yq.aliyun.com/articles/582487?utm_content=m_46529):
主要介绍视频直播间系统，以及如何使用阿里云Redis混合存储实例方便快捷的构建大数据量，低延迟的视频直播间服务。还介绍到了我们之前提高过的redis的数据结构的使用场景


**《美团在Redis上踩过的一些坑-5.redis cluster遇到的一些问》**：[http://carlosfu.iteye.com/blog/2254573](http://carlosfu.iteye.com/blog/2254573)：主要介绍了redis集群的两个常见问题，然后分享了 一些关于redis集群不错的文章。

**参考：**

https://www.cnblogs.com/Survivalist/p/8119891.html

http://www.redis.net.cn/tutorial/3524.html

https://redis.io/








