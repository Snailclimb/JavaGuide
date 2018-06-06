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

**《面试中关于Redis的问题看这篇就够了》：（非常推荐）**
[https://juejin.im/post/5ad6e4066fb9a028d82c4b66](https://juejin.im/post/5ad6e4066fb9a028d82c4b66)


