---
title: Detailed explanation of three special data types of Redis
category: database
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis common data types
  - - meta
    - name: description
      content: Summary of Redis special data types: HyperLogLogs (cardinality statistics), Bitmap (bit storage), Geospatial (geographic location).
---

In addition to the 5 basic data types, Redis also supports 3 special data types: Bitmap, HyperLogLog, and GEO.

## Bitmap (bitmap)

### Introduction

According to the official website:

> Bitmaps are not an actual data type, but a set of bit-oriented operations defined on the String type which is treated like a bit vector. Since strings are binary safe blobs and their maximum length is 512 MB, they are suitable to set up to 2^32 different bits.
>
> Bitmap is not an actual data type in Redis, but a set of bit-oriented operations defined on the String type, treating it as a bit vector. Since strings are binary-safe blocks and have a maximum length of 512 MB, they are suitable for setting up to 2^32 different bits.

Bitmap stores continuous binary numbers (0 and 1). Through Bitmap, only one bit is needed to represent the value or status corresponding to a certain element, and the key is the corresponding element itself. We know that 8 bits can form a byte, so Bitmap itself will greatly save storage space.

You can think of a Bitmap as an array that stores binary numbers (0s and 1s). The index of each element in the array is called offset.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220720194154133.png)

### Common commands

| Commands | Introduction |
|------------------------------------------------ |---------------------------------------------------------------- |
| SETBIT key offset value | Set the value at the specified offset position |
| GETBIT key offset | Get the value at the specified offset position |
| BITCOUNT key start end | Get the number of elements with a value of 1 between start and end |
| BITOP operation destkey key1 key2 ... | Operate on one or more Bitmaps. Available operators are AND, OR, XOR and NOT |

**Bitmap basic operation demonstration**:

```bash
# SETBIT will return the value of the previous bit (default is 0) here will generate 7 bits
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
# Count the number of bits set to 1 through bitcount.
> BITCOUNT mykey
(integer) 2
```

### Application scenarios

**Scenarios where status information needs to be saved (represented by 0/1)**

- Examples: user check-in status, active user status, user behavior statistics (such as whether a video has been liked).
- Related commands: `SETBIT`, `GETBIT`, `BITCOUNT`, `BITOP`.

## HyperLogLog (cardinality statistics)

### Introduction

HyperLogLog is a well-known cardinality counting probability algorithm, which is optimized and improved based on LogLog Counting (LLC). It is not unique to Redis. Redis only implements this algorithm and provides some out-of-the-box APIs.

The HyperLogLog provided by Redis takes up very little space, requiring only 12k of space to store close to `2^64` different elements. This is really amazing. Is this the charm of mathematics? Moreover, Redis has optimized the storage structure of HyperLogLog and uses two counting methods:

- **Sparse Matrix**: When the count is small, it takes up very little space.
- **Dense Matrix**: When the count reaches a certain threshold, it occupies 12k space.

There are corresponding detailed instructions in the official Redis documentation:

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220721091424563.png)

In order to save memory, the cardinality counting probability algorithm does not directly store metadata, but estimates the cardinality value (the number of elements in the set) through a certain probability and statistical method. Therefore, the counting result of HyperLogLog is not an exact value, and there is a certain error (standard error is `0.81%`).

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220720194154133.png)

The use of HyperLogLog is very simple, but the principle is very complex. For the principle of HyperLogLog and its implementation in Redis, you can read this article: [Explanation of the principle of HyperLogLog algorithm and how Redis applies it](https://juejin.cn/post/6844903785744056333).

I recommend another tool that can help understand the principles of HyperLogLog: [Sketch of the Day: HyperLogLog — Cornerstone of a Big Data Infrastructure](http://content.research.neustar.biz/blog/hll.html).

In addition to HyperLogLog, Redis also provides other probabilistic data structures, corresponding official document address: <https://redis.io/docs/data-types/probabilistic/>.

### Common commands

There are very few commands related to HyperLogLog, and the most commonly used are only 3.

| Commands | Introduction |
|------------------------------------------------ |-------------------------------------------------------------------------------- |
| PFADD key element1 element2 ... | Add one or more elements to HyperLogLog |
| PFCOUNT key1 key2 | Get the unique count of one or more HyperLogLogs.                                        |
| PFMERGE destkey sourcekey1 sourcekey2 ... | Merge multiple HyperLogLogs into destkey. destkey will combine multiple sources to calculate the corresponding unique count. |

**HyperLogLog basic operation demonstration**:

```bash
> PFADD hll foo bar zap
(integer) 1
> PFADD hll zap zap zap
(integer) 0
> PFADD hll foo bar
(integer) 0
> PFCOUNT hll
(integer) 3
> PFADD some-other-hll 1 2 3
(integer) 1
> PFCOUNT hll some-other-hll
(integer) 6
> PFMERGE desthll hll some-other-hll
"OK"
>PFCOUNTdesthll
(integer) 6```

### Application scenarios

**Huge number of counting scenarios (millions, tens of millions or more)**

- Example: Daily/weekly/monthly access IP statistics of popular websites, UV statistics of popular posts.
- Related commands: `PFADD`, `PFCOUNT`.

## Geospatial (geographic location)

### Introduction

Geospatial index (GEO for short) is mainly used to store geographical location information and is implemented based on Sorted Set.

Through GEO, we can easily implement functions such as calculating the distance between two locations and obtaining elements near a specified location.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220720194359494.png)

### Common commands

| Commands | Introduction |
|------------------------------------------------ |------------------------------------------------------------------------------------------------------------- |
| GEOADD key longitude1 latitude1 member1 ... | Add the latitude and longitude information corresponding to one or more elements to GEO |
| GEOPOS key member1 member2 ... | Returns the latitude and longitude information of the given element |
| GEODIST key member1 member2 M/KM/FT/MI | Returns the distance between two given elements |
| GEORADIUS key longitude latitude radius distance | Get other elements within the distance range near the specified position, supporting ASC (from near to far), DESC (from far to near), Count (number) and other parameters |
| GEORADIUSBYMEMBER key member radius distance | Similar to the GEORADIUS command, except that the reference center point is an element in GEO |

**Basic Operation**:

```bash
> GEOADD personLocation 116.33 39.89 user1 116.34 39.90 user2 116.35 39.88 user3
3
> GEOPOS personLocation user1
116.3299986720085144
39.89000061669732844
> GEODIST personLocation user1 user2 km
1.4018
```

View `personLocation` through the Redis visualization tool. As expected, the bottom layer is a Sorted Set.

The longitude and latitude data of the geographical location information stored in GEO is converted into an integer through the GeoHash algorithm, and this integer is used as the score (weight parameter) of the Sorted Set.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220721201545147.png)

**Get other elements within the specified position range**:

```bash
> GEORADIUS personLocation 116.33 39.87 3 km
user3
user1
> GEORADIUS personLocation 116.33 39.87 2 km
> GEORADIUS personLocation 116.33 39.87 5 km
user3
user1
user2
> GEORADIUSBYMEMBER personLocation user1 5 km
user3
user1
user2
> GEORADIUSBYMEMBER personLocation user1 2 km
user1
user2
```

For an analysis of the underlying principles of the `GEORADIUS` command, you can read this article by Ali: [How does Redis implement the "people nearby" function? ](https://juejin.cn/post/6844903966061363207).

**Remove element**:

The bottom layer of GEO is Sorted Set, and you can use Sorted Set related commands on GEO.

```bash
> ZREM personLocation user1
1
> ZRANGE personLocation 0 -1
user3
user2
> ZSCORE personLocation user2
4069879562983946
```

### Application scenarios

**Scenarios that require management of geospatial data**

- Example: People nearby.
- Related commands: `GEOADD`, `GEORADIUS`, `GEORADIUSBYMEMBER`.

## Summary

| Data type | Description |
|---------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bitmap | You can think of a Bitmap as an array that stores binary numbers (0 and 1). The subscript of each element in the array is called offset. Through Bitmap, only one bit is needed to represent the value or status corresponding to an element, and the key is the corresponding element itself. We know that 8 bits can form a byte, so Bitmap itself will greatly save storage space. |
| HyperLogLog | The HyperLogLog provided by Redis takes up very little space, requiring only 12k of space to store close to `2^64` different elements. However, the count result of HyperLogLog is not an exact value and has a certain error (standard error is `0.81%`).                                                                                     |
| Geospatial index | Geospatial index (GEO) is mainly used to store geographical location information and is implemented based on Sorted Set.                                                                                                                                                                           |

## Reference

- Redis Data Structures: <https://redis.com/redis-enterprise/data-structures/>.
- "Redis Deep Adventure: Core Principles and Application Practices" 1.6 Four ounces make a huge difference - HyperLogLog
- Bloom filter, bitmap, HyperLogLog: <https://hogwartsrico.github.io/2020/06/08/BloomFilter-HyperLogLog-BitMap/index.html><!-- @include: @article-footer.snippet.md -->