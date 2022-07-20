### Bitmap

#### 介绍

Bitmap 存储的是连续的二进制数字（0 和 1），通过 Bitmap, 只需要一个 bit 位来表示某个元素对应的值或者状态，key 就是对应元素本身 。我们知道 8 个 bit 可以组成一个 byte，所以 Bitmap 本身会极大的节省储存空间。

#### 常用命令

`setbit` 、`getbit` 、`bitcount`、`bitop`

```bash
# SETBIT 会返回之前位的值（默认是 0）这里会生成 7 个位
> setbit mykey 7 1
(integer) 0
> setbit mykey 7 0
(integer) 1
> getbit mykey 7
(integer) 0
> setbit mykey 6 1
(integer) 0
> setbit mykey 8 1
(integer) 0
# 通过 bitcount 统计被被设置为 1 的位的数量。
> bitcount mykey
(integer) 2
```

#### 应用场景

适合需要保存状态信息（比如是否签到、是否登录...）并需要进一步对这些信息进行分析的场景。比如用户签到情况、活跃用户情况、用户行为统计（比如是否点赞过某个视频）

**用户行为分析**
很多网站为了分析你的喜好，需要研究你点赞过的内容。

```bash
# 记录你喜欢过 001 号小姐姐
> setbit beauty_girl_001 uid 1
```

**统计活跃用户**

使用时间作为 key，然后用户 ID 为 offset，如果当日活跃过就设置为 1

那么我该如何计算某几天/月/年的活跃用户呢(暂且约定，统计时间内只要有一天在线就称为活跃)，有请下一个 redis 的命令

```bash
# 对一个或多个保存二进制位的字符串 key 进行位元操作，并将结果保存到 destkey 上。
# BITOP 命令支持 AND 、 OR 、 NOT 、 XOR 这四种操作中的任意一种参数
BITOP operation destkey key [key ...]
```

初始化数据：

```bash
> setbit 20210308 1 1
(integer) 0
> setbit 20210308 2 1
(integer) 0
> setbit 20210309 1 1
(integer) 0
```

统计 20210308~20210309 总活跃用户数: 1

```bash
> bitop and desk1 20210308 20210309
(integer) 1
> bitcount desk1
(integer) 1
```

统计 20210308~20210309 在线活跃用户数: 2

```bash
> bitop or desk2 20210308 20210309
(integer) 1
> bitcount desk2
(integer) 2
```

**用户在线状态**

对于获取或者统计用户在线状态，使用 Bitmap 是一个节约空间且效率又高的一种方法。

只需要一个 key，然后用户 ID 为 offset，如果在线就设置为 1，不在线就设置为 0。

### HyperLogLog

### Stream