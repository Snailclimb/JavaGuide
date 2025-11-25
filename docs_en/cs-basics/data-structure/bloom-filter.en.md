---
title: 布隆过滤器
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: 布隆过滤器,Bloom Filter,误判率,哈希函数,位数组,去重,缓存穿透
  - - meta
    - name: description
      content: 解析 Bloom Filter 的原理与误判特性，结合哈希与位数组实现，适用于海量数据去重与缓存穿透防护。
---

布隆过滤器相信大家没用过的话，也已经听过了。

布隆过滤器主要是为了解决海量数据的存在性问题。对于海量数据中判定某个数据是否存在且容忍轻微误差这一场景（比如缓存穿透、海量数据去重）来说，非常适合。

文章内容概览：

1. 什么是布隆过滤器？
2. 布隆过滤器的原理介绍。
3. 布隆过滤器使用场景。
4. 通过 Java 编程手动实现布隆过滤器。
5. 利用 Google 开源的 Guava 中自带的布隆过滤器。
6. Redis 中的布隆过滤器。

## 什么是布隆过滤器？

首先，我们需要了解布隆过滤器的概念。

布隆过滤器（Bloom Filter，BF）是一个叫做 Bloom 的老哥于 1970 年提出的。我们可以把它看作由二进制向量（或者说位数组）和一系列随机映射函数（哈希函数）两部分组成的数据结构。相比于我们平时常用的 List、Map、Set 等数据结构，它占用空间更少并且效率更高，但是缺点是其返回的结果是概率性的，而不是非常准确的。理论情况下添加到集合中的元素越多，误报的可能性就越大。并且，存放在布隆过滤器的数据不容易删除。

Bloom Filter 会使用一个较大的 bit 数组来保存所有的数据，数组中的每个元素都只占用 1 bit ，并且每个元素只能是 0 或者 1（代表 false 或者 true），这也是 Bloom Filter 节省内存的核心所在。这样来算的话，申请一个 100w 个元素的位数组只占用 1000000Bit / 8 = 125000 Byte = 125000/1024 KB ≈ 122KB 的空间。

![位数组](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-bit-table.png)

总结：**一个名叫 Bloom 的人提出了一种来检索元素是否在给定大集合中的数据结构，这种数据结构是高效且性能很好的，但缺点是具有一定的错误识别率和删除难度。并且，理论情况下，添加到集合中的元素越多，误报的可能性就越大。**

## 布隆过滤器的原理介绍

**当一个元素加入布隆过滤器中的时候，会进行如下操作：**

1. 使用布隆过滤器中的哈希函数对元素值进行计算，得到哈希值（有几个哈希函数得到几个哈希值）。
2. 根据得到的哈希值，在位数组中把对应下标的值置为 1。

**当我们需要判断一个元素是否存在于布隆过滤器的时候，会进行如下操作：**

1. 对给定元素再次进行相同的哈希计算；
2. 得到值之后判断位数组中的每个元素是否都为 1，如果值都为 1，那么说明这个值在布隆过滤器中，如果存在一个值不为 1，说明该元素不在布隆过滤器中。

Bloom Filter 的简单原理图如下：

![Bloom Filter 的简单原理示意图](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-simple-schematic-diagram.png)

如图所示，当字符串存储要加入到布隆过滤器中时，该字符串首先由多个哈希函数生成不同的哈希值，然后将对应的位数组的下标设置为 1（当位数组初始化时，所有位置均为 0）。当第二次存储相同字符串时，因为先前的对应位置已设置为 1，所以很容易知道此值已经存在（去重非常方便）。

如果我们需要判断某个字符串是否在布隆过滤器中时，只需要对给定字符串再次进行相同的哈希计算，得到值之后判断位数组中的每个元素是否都为 1，如果值都为 1，那么说明这个值在布隆过滤器中，如果存在一个值不为 1，说明该元素不在布隆过滤器中。

**不同的字符串可能哈希出来的位置相同，这种情况我们可以适当增加位数组大小或者调整我们的哈希函数。**

综上，我们可以得出：**布隆过滤器说某个元素存在，小概率会误判。布隆过滤器说某个元素不在，那么这个元素一定不在。**

## 布隆过滤器使用场景

1. 判断给定数据是否存在：比如判断一个数字是否存在于包含大量数字的数字集中（数字集很大，上亿）、 防止缓存穿透（判断请求的数据是否有效避免直接绕过缓存请求数据库）等等、邮箱的垃圾邮件过滤（判断一个邮件地址是否在垃圾邮件列表中）、黑名单功能（判断一个 IP 地址或手机号码是否在黑名单中）等等。
2. 去重：比如爬给定网址的时候对已经爬取过的 URL 去重、对巨量的 QQ 号/订单号去重。

去重场景也需要用到判断给定数据是否存在，因此布隆过滤器主要是为了解决海量数据的存在性问题。

## 编码实战

### 通过 Java 编程手动实现布隆过滤器

我们上面已经说了布隆过滤器的原理，知道了布隆过滤器的原理之后就可以自己手动实现一个了。

如果你想要手动实现一个的话，你需要：

1. 一个合适大小的位数组保存数据
2. 几个不同的哈希函数
3. 添加元素到位数组（布隆过滤器）的方法实现
4. 判断给定元素是否存在于位数组（布隆过滤器）的方法实现。

下面给出一个我觉得写的还算不错的代码（参考网上已有代码改进得到，对于所有类型对象皆适用）：

```java
import java.util.BitSet;

public class MyBloomFilter {

    /**
     * 位数组的大小
     */
    private static final int DEFAULT_SIZE = 2 << 24;
    /**
     * 通过这个数组可以创建 6 个不同的哈希函数
     */
    private static final int[] SEEDS = new int[]{3, 13, 46, 71, 91, 134};

    /**
     * 位数组。数组中的元素只能是 0 或者 1
     */
    private BitSet bits = new BitSet(DEFAULT_SIZE);

    /**
     * 存放包含 hash 函数的类的数组
     */
    private SimpleHash[] func = new SimpleHash[SEEDS.length];

    /**
     * 初始化多个包含 hash 函数的类的数组，每个类中的 hash 函数都不一样
     */
    public MyBloomFilter() {
        // 初始化多个不同的 Hash 函数
        for (int i = 0; i < SEEDS.length; i++) {
            func[i] = new SimpleHash(DEFAULT_SIZE, SEEDS[i]);
        }
    }

    /**
     * 添加元素到位数组
     */
    public void add(Object value) {
        for (SimpleHash f : func) {
            bits.set(f.hash(value), true);
        }
    }

    /**
     * 判断指定元素是否存在于位数组
     */
    public boolean contains(Object value) {
        boolean ret = true;
        for (SimpleHash f : func) {
            ret = ret && bits.get(f.hash(value));
        }
        return ret;
    }

    /**
     * 静态内部类。用于 hash 操作！
     */
    public static class SimpleHash {

        private int cap;
        private int seed;

        public SimpleHash(int cap, int seed) {
            this.cap = cap;
            this.seed = seed;
        }

        /**
         * 计算 hash 值
         */
        public int hash(Object value) {
            int h;
            return (value == null) ? 0 : Math.abs((cap - 1) & seed * ((h = value.hashCode()) ^ (h >>> 16)));
        }

    }
}
```

Test:

```java
String value1 = "https://javaguide.cn/";
String value2 = "https://github.com/Snailclimb";
MyBloomFilter filter = new MyBloomFilter();
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
filter.add(value1);
filter.add(value2);
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
```

Output:

```plain
false
false
true
true
```

Test:

```java
Integer value1 = 13423;
Integer value2 = 22131;
MyBloomFilter filter = new MyBloomFilter();
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
filter.add(value1);
filter.add(value2);
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
```

Output:

```java
false
false
true
true
```

### Use the Bloom filter that comes with Google’s open source Guava

The purpose of implementing it myself is mainly to let myself understand the principle of Bloom filter. The implementation of Bloom filter in Guava is relatively authoritative, so in actual projects we do not need to manually implement a Bloom filter.

First we need to introduce Guava dependencies into the project:

```java
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>28.0-jre</version>
</dependency>
```

The actual usage is as follows:

We create a Bloom filter that can store up to 1500 integers, and we can tolerate a false positive probability of 0.01 percent

```java
//Create Bloom filter object
BloomFilter<Integer> filter = BloomFilter.create(
    Funnels.integerFunnel(),
    1500,
    0.01);
// Determine whether the specified element exists
System.out.println(filter.mightContain(1));
System.out.println(filter.mightContain(2));
// Add elements to the bloom filter
filter.put(1);
filter.put(2);
System.out.println(filter.mightContain(1));
System.out.println(filter.mightContain(2));
```

In our example, when the `mightContain()` method returns _true_ we are 99% sure that the element is in the filter, and when the filter returns _false_ we are 100% sure that the element is not present in the filter.

**The implementation of the Bloom filter provided by Guava is still very good (if you want to know more about it, you can take a look at its source code implementation), but it has a major flaw that it can only be used on a single machine (in addition, capacity expansion is not easy), and now the Internet is generally a distributed scenario. In order to solve this problem, we need to use the Bloom filter in Redis. **

## Bloom filter in Redis

### Introduction

Redis v4.0 has the Module (module/plug-in) function. Redis Modules allow Redis to use external modules to extend its functionality. Bloom filter is one of the modules. For details, please see Redis’ official introduction to Redis Modules: <https://redis.io/modules>

In addition, the official website recommends a RedisBloom module as the Redis Bloom filter, address: <https://github.com/RedisBloom/RedisBloom>
Others include:

- redis-lua-scaling-bloom-filter (lua script implementation): <https://github.com/erikdubbelboer/redis-lua-scaling-bloom-filter>
- pyreBloom (fast Redis Bloom filter in Python): <https://github.com/seomoz/pyreBloom>
-…

RedisBloom provides client support in multiple languages, including: Python, Java, JavaScript, and PHP.

### Install using Docker

If we need to experience Bloom filters in Redis, it’s very simple, just do it through Docker! We directly searched **docker redis bloomfilter** on Google and found the answer we wanted in the first search result of excluding ads (this is my usual way to solve problems, please share it), the specific address: <https://hub.docker.com/r/redislabs/rebloom/> (the introduction is very detailed).

**The specific operations are as follows:**

```bash
➜ ~ docker run -p 6379:6379 --name redis-redisbloom redislabs/rebloom:latest
➜ ~ docker exec -it redis-redisbloom bash
root@21396d02c252:/data# redis-cli
127.0.0.1:6379>
```

**Note: The current rebloom image has been abandoned, and it is officially recommended to use [redis-stack](https://hub.docker.com/r/redis/redis-stack)**

### List of commonly used commands

> Note: key: the name of the Bloom filter, item: the added element.

1. `BF.ADD`: Adds elements to a Bloom filter, creating the filter if it does not already exist. Format: `BF.ADD {key} {item}`.
2. `BF.MADD`: Adds one or more elements to a "Bloom filter" and creates a filter that does not yet exist. This command operates in the same manner as `BF.ADD`, except that it allows multiple inputs and returns multiple values. Format: `BF.MADD {key} {item} [item ...]` .
3. `BF.EXISTS`: Determine whether the element exists in the Bloom filter. Format: `BF.EXISTS {key} {item}`.
4. `BF.MEXISTS`: Determine whether one or more elements exist in the Bloom filter in the format: `BF.MEXISTS {key} {item} [item ...]`.

In addition, the `BF.RESERVE` command needs to be introduced separately:

The format of this command is as follows:

`BF.RESERVE {key} {error_rate} {capacity} [EXPANSION expansion]` .

The following is a brief introduction to the specific meaning of each parameter:

1. key: name of Bloom filter
2. error_rate: expected false positive rate. The value must be between 0 and 1. For example, for a desired false positive rate of 0.1% (1 in 1000), error_rate should be set to 0.001. The closer this number is to zero, the greater the memory consumption per item and the higher the CPU usage per operation.
3. capacity: the capacity of the filter. When the actual number of stored elements exceeds this value, performance will begin to decrease. Actual downgrade will depend on how far the limit is exceeded. As the number of filter elements grows exponentially, performance decreases linearly.

Optional parameters:

- expansion: If a new subfilter is created, its size will be the size of the current filter multiplied by `expansion`. The default extension value is 2. This means that each subsequent sub-filter will be twice as large as the previous sub-filter.

### Actual use

```shell
127.0.0.1:6379> BF.ADD myFilter java
(integer) 1
127.0.0.1:6379> BF.ADD myFilter javaguide
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter java
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter javaguide
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter github
(integer) 0
```

<!-- @include: @article-footer.snippet.md -->