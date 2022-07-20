---
title: Redis 3 种特殊数据结构详解
category: 数据库
tag:
  - Redis
---

## Bitmap

### 介绍

Bitmap 存储的是连续的二进制数字（0 和 1），通过 Bitmap, 只需要一个 bit 位来表示某个元素对应的值或者状态，key 就是对应元素本身 。我们知道 8 个 bit 可以组成一个 byte，所以 Bitmap 本身会极大的节省储存空间。

你可以将 Bitmap 看作是一个存储二进制数字（0 和 1）的数组，数组中每个元素的下标叫做 offset（偏移量）。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/database/redis/image-20220720194154133.png)

### 常用命令

| 命令                                  | 介绍                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| SETBIT key offset value               | 设置指定 offset 位置的值                                     |
| GETBIT key offset                     | 获取指定 offset 位置的值                                     |
| BITCOUNT key start end                | 获取 start 和 end 之前值为 1 的元素个数                      |
| BITOP operation destkey key1 key2 ... | 对一个或多个 Bitmap 进行运算，可用运算符有AND, OR, XOR以及NOT |



```bash
# SETBIT 会返回之前位的值（默认是 0）这里会生成 7 个位
> SETBIT mykey 7 1
(integer) 0
> SETBIT mykey 7 0
(integer) 1
> GETBIT mykey 7
(integer) 0
> SETBIT mykey 6 1
(integer) 0
> SETBIT mykey 8 1
(integer) 0
# 通过 bitcount 统计被被设置为 1 的位的数量。
> BITCOUNT mykey
(integer) 2
```

### 应用场景

**需要保存状态信息（0/1即可表示）的场景**

- 举例 ：用户签到情况、活跃用户情况、用户行为统计（比如是否点赞过某个视频）。
- 相关命令 ：`SETBIT`、`GETBIT`、`BITCOUNT`、`BITOP`。

## HyperLogLog

### 介绍

`HyperLogLog` 是一种有名的基数计数概率算法 ，并不是 Redis 特有的，Redis 只是实现了这个算法并提供了一些开箱即用的 API。

Redis 提供的 `HyperLogLog` 占用空间非常非常小，只需要 12k 的空间就能存储接近`2^64`个不同元素。这是真的厉害，这就是数学的魅力么！并且，Redis 对 HyperLogLog 的存储结构做了优化，采用两种方式计数：

- **稀疏矩阵** ：计数较少的时候，占用空间很小。
- **稠密矩阵** ：计数达到某个阈值的时候，占用 12k 的空间。

不过， `HyperLogLog` 的计数结果并不是一个精确值，存在一定的误差（标准误差为 `0.81%` 。），这是由于它本质上是用概率算法导致的。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/database/redis/image-20220720194154133.png)

`HyperLogLog` 的使用非常简单，但原理非常复杂。`HyperLogLog` 的原理以及在 Redis 中的实现可以看这篇文章：[HyperLogLog 算法的原理讲解以及 Redis 是如何应用它的](https://juejin.cn/post/6844903785744056333) 。

再推荐一个可以帮助理解HyperLogLog原理的工具：[Sketch of the Day: HyperLogLog — Cornerstone of a Big Data Infrastructure](http://content.research.neustar.biz/blog/hll.html) 。

### 常用命令



### 应用场景

## Geospatial index

地理空间数据管理。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/database/redis/image-20220720194359494.png)

## Stream

## 参考

- 