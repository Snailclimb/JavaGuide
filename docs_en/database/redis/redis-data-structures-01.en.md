---
title: Detailed explanation of the 5 basic data types of Redis
category: database
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis common data types
  - - meta
    - name: description
      content: Summary of Redis basic data types: String (string), List (list), Set (set), Hash (hash), Zset (ordered set)
---

Redis has 5 basic data types: String (string), List (list), Set (collection), Hash (hash), and Zset (ordered set).

These five data types are directly provided to users and are the storage form of data. Their underlying implementation mainly relies on these eight data structures: simple dynamic string (SDS), LinkedList (double linked list), Dict (hash table/dictionary), SkipList (skip list), Intset (integer collection), ZipList (compressed list), QuickList (quick list).

The underlying data structure corresponding to Redis's five basic data types is implemented as shown in the following table:

| String | List | Hash | Set | Zset |
| :----- | :--------------------------- | :------------ | :----------- | :---------------- |
| SDS | LinkedList/ZipList/QuickList | Dict, ZipList | Dict, Intset | ZipList, SkipList |

Before Redis 3.2, the underlying implementation of List was LinkedList or ZipList. After Redis 3.2, QuickList, a combination of LinkedList and ZipList, was introduced, and the underlying implementation of List became QuickList. Starting from Redis 7.0, ZipList is replaced by ListPack.

You can find a very detailed introduction to Redis data types/structures on the Redis official website:

- [Redis Data Structures](https://redis.com/redis-enterprise/data-structures/)
- [Redis Data types tutorial](https://redis.io/docs/manual/data-types/data-types-tutorial/)

In the future, with the release of new versions of Redis, new data structures may appear. By consulting the corresponding introduction on the Redis official website, you can always get the most reliable information.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220720181630203.png)

## String

### Introduction

String is the simplest and most commonly used data type in Redis.

String is a binary-safe data type that can be used to store any type of data such as strings, integers, floating point numbers, images (base64 encoding or decoding of images or the path of images), and serialized objects.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124403897.png)

Although Redis is written in C language, Redis does not use C's string representation. Instead, it builds its own **Simple Dynamic String** (**SDS**). Compared with C's native strings, Redis's SDS can save not only text data but also binary data, and the complexity of obtaining the string length is O(1) (C string is O(N)). In addition, Redis's SDS API is safe and will not cause buffer overflow.

### Common commands

| Commands | Introduction |
| ---------------------------------- | ---------------------------------- |
| SET key value | Set the value of the specified key |
| SETNX key value | Set the value of key only if the key does not exist |
| GET key | Get the value of the specified key |
| MSET key1 value1 key2 value2 …… | Set the value of one or more specified keys |
| MGET key1 key2 ... | Get the value of one or more specified keys |
| STRLEN key | Returns the length of the string value stored in key |
| INCR key | Increment the numeric value stored in key by one |
| DECR key | Decrement the numeric value stored in key by one |
| EXISTS key | Determine whether the specified key exists |
| DEL key (general) | Delete the specified key |
| EXPIRE key seconds (general) | Set the expiration time for the specified key |

For more Redis String commands and detailed usage guides, please view the corresponding introduction on the Redis official website: <https://redis.io/commands/?group=string>.

**Basic Operation**:

```bash
> SET key value
OK
> GET key
"value"
> EXISTS key
(integer) 1
> STRLEN key
(integer) 5
> DEL key
(integer) 1
> GET key
(nil)
```

**Batch Settings**:

```bash
> MSET key1 value1 key2 value2
OK
> MGET key1 key2 # Get the values corresponding to multiple keys in batches
1) "value1"
2) "value2"
```

**Counter (can be used when the content of the string is an integer):**

```bash
>SET number 1
OK
> INCR number # Increase the number value stored in key by one
(integer) 2
> GET number
"2"
> DECR number # Decrement the numeric value stored in key by one
(integer) 1
> GET number
"1"
```

**Set expiration time (default is never expires)**:

```bash
> EXPIRE key 60
(integer) 1
> SETEX key 60 value # Set value and set expiration time
OK
> TTL key
(integer) 56
```

### Application scenarios

**Scenarios where regular data needs to be stored**

- Example: Cache Session, Token, image address, serialized object (more memory-saving than Hash storage).
- Related commands: `SET`, `GET`.

**Scenarios that require counting**

- Examples: the number of user requests per unit time (simple current limiting can be used), the number of page visits per unit time.
- Related commands: `SET`, `GET`, `INCR`, `DECR`.

**Distributed Lock**

The simplest distributed lock can be implemented using the `SETNX key value` command (there are some flaws, and it is generally not recommended to implement distributed locks this way).

## List

### Introduction

List in Redis is actually the implementation of the linked list data structure. I introduced the linked list data structure in detail in this article [Linear Data Structure: Array, Linked List, Stack, Queue](https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html), so I won’t go into details here.

Many high-level programming languages ​​have built-in implementations of linked lists, such as `LinkedList` in Java, but the C language does not implement linked lists, so Redis implements its own linked list data structure. The implementation of Redis's List is a **doubly linked list**, which can support reverse search and traversal, making it more convenient to operate, but it brings some additional memory overhead.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124413287.png)

### Common commands

| Commands | Introduction ||-------------------------------- |------------------------------------------------ |
| RPUSH key value1 value2 ... | Add one or more elements to the tail (right) of the specified list |
| LPUSH key value1 value2 ... | Add one or more elements to the head (left) of the specified list |
| LSET key index value | Set the value at the specified list index position to value |
| LPOP key | Remove and get the first element (leftmost) of the specified list |
| RPOP key | Remove and get the last element (rightmost) of the specified list |
| LLEN key | Get the number of list elements |
| LRANGE key start end | Get the elements between start and end of the list |

For more Redis List commands and detailed usage guides, please view the corresponding introduction on the Redis official website: <https://redis.io/commands/?group=list>.

**Queue implementation via `RPUSH/LPOP` or `LPUSH/RPOP`:

```bash
>RPUSH myList value1
(integer) 1
>RPUSH myList value2 value3
(integer) 3
> LPOP myList
"value1"
> LRANGE myList 0 1
1) "value2"
2) "value3"
> LRANGE myList 0 -1
1) "value2"
2) "value3"
```

**Implementing the stack via `RPUSH/RPOP` or `LPUSH/LPOP`**:

```bash
>RPUSH myList2 value1 value2 value3
(integer) 3
> RPOP myList2 # Take out the rightmost element of the list
"value3"
```

I specially drew a picture to help everyone understand the `RPUSH`, `LPOP`, `LPUSH`, `RPOP` commands:

![](https://oss.javaguide.cn/github/javaguide/database/redis/redis-list.png)

**View the list elements corresponding to the subscript range through `LRANGE`:

```bash
>RPUSH myList value1 value2 value3
(integer) 3
> LRANGE myList 0 1
1) "value1"
2) "value2"
> LRANGE myList 0 -1
1) "value1"
2) "value2"
3) "value3"
```

Through the `LRANGE` command, you can implement paging query based on List, and the performance is very high!

**View the length of the linked list through `LLEN`:

```bash
> LLEN myList
(integer) 3
```

### Application scenarios

**Information flow display**

- Examples: latest articles, latest developments.
- Related commands: `LPUSH`, `LRANGE`.

**Message Queue**

`List` can be used as a message queue, but its function is too simple and has many flaws, so it is not recommended.

Relatively speaking, `Stream`, a newly added data structure in Redis 5.0, is more suitable for message queues, but its function is still very crude. Compared with professional message queues, there are still many shortcomings, such as message loss and accumulation problems that are difficult to solve.

## Hash

### Introduction

Hash in Redis is a String type field-value (key-value pair) mapping table, which is particularly suitable for storing objects. During subsequent operations, you can directly modify the values ​​of certain fields in this object.

Hash is similar to `HashMap` before JDK1.8, and the internal implementation is similar (array + linked list). However, Redis's Hash has been optimized more.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124421703.png)

### Common commands

| Commands | Introduction |
|------------------------------------------------ |---------------------------------------------------------------- |
| HSET key field value | Set the value of the specified field in the specified hash table |
| HSETNX key field value | Set the value of the specified field only if the specified field does not exist |
| HMSET key field1 value1 field2 value2 ... | Set one or more field-value (field-value) pairs into the specified hash table at the same time |
| HGET key field | Get the value of the specified field in the specified hash table |
| HMGET key field1 field2 ... | Get the value of one or more specified fields in the specified hash table |
| HGETALL key | Get all key-value pairs in the specified hash table |
| HEXISTS key field | Check whether the specified field exists in the specified hash table |
| HDEL key field1 field2 ... | Delete one or more hash table fields |
| HLEN key | Get the number of fields in the specified hash table |
| HINCRBY key field increment | Perform operations on the specified field in the specified hash (positive numbers are added, negative numbers are subtracted) |

For more Redis Hash commands and detailed usage guides, please view the corresponding introduction on the Redis official website: <https://redis.io/commands/?group=hash>.

**Mock object data storage**:

```bash
> HMSET userInfoKey name "guide" description "dev" age 24
OK
> HEXISTS userInfoKey name # Check whether the field specified in the value corresponding to key exists.
(integer) 1
> HGET userInfoKey name # Get the value of the specified field stored in the hash table.
"guide"
> HGET userInfoKey age
"24"
> HGETALL userInfoKey # Get all fields and values of the specified key in the hash table
1) "name"
2) "guide"
3) "description"
4) "dev"
5) "age"
6) "24"
> HSET userInfoKey name "GuideGeGe"
> HGET userInfoKey name
"GuideGeGe"
> HINCRBY userInfoKey age 2
(integer) 26
```

### Application scenarios

**Object data storage scenario**

- Examples: user information, product information, article information, shopping cart information.
- Related commands: `HSET` (set the value of a single field), `HMSET` (set the value of multiple fields), `HGET` (get the value of a single field), `HMGET` (get the value of multiple fields).

## Set

### Introduction

The Set type in Redis is an unordered collection. The elements in the collection are not in order but are unique, somewhat similar to `HashSet` in Java. Set is a good choice when you need to store a list of data and do not want duplicate data, and Set provides an important interface for determining whether an element is in a Set collection, which List cannot provide.

You can easily implement intersection, union, and difference operations based on Set. For example, you can store all the followers of a user in one set and all their fans in one set. In this case, Set can very conveniently implement functions such as common following, common fans, and common preferences. This process is also the process of finding intersection.![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124430264.png)

### Common commands

| Commands | Introduction |
|---------------------------------------- | ------------------------------------------ |
| SADD key member1 member2 ... | Add one or more elements to the specified collection |
| SMEMBERS key | Get all elements in the specified collection |
| SCARD key | Get the number of elements of the specified collection |
| SISMEMBER key member | Determine whether the specified element is in the specified set |
| SINTER key1 key2 ... | Get the intersection of all given sets |
| SINTERSTORE destination key1 key2 ... | Stores the intersection of all the given sets in destination |
| SUNION key1 key2 ... | Get the union of all given sets |
| SUNIONSTORE destination key1 key2 ... | Stores the union of all the given sets in destination |
| SDIFF key1 key2 ... | Get the difference set of all given sets |
| SDIFFSTORE destination key1 key2 ... | Stores the difference of all given sets in destination |
| SPOP key count | Randomly remove and obtain one or more elements in the specified collection |
| SRANDMEMBER key count | Randomly obtain the specified number of elements in the specified collection |

For more Redis Set commands and detailed usage guides, please view the corresponding introduction on the Redis official website: <https://redis.io/commands/?group=set>.

**Basic Operation**:

```bash
> SADD mySet value1 value2
(integer) 2
> SADD mySet value1 # Duplicate elements are not allowed, so the addition fails
(integer) 0
> SMEMBERS mySet
1) "value1"
2) "value2"
> SCARD mySet
(integer) 2
> SISMEMBER mySet value1
(integer) 1
>SADD mySet2 value2 value3
(integer) 2
```

- `mySet` : `value1`, `value2`.
- `mySet2`: `value2`, `value3`.

**Find intersection**:

```bash
> SINTERSTORE mySet3 mySet mySet2
(integer) 1
> SMEMBERS mySet3
1) "value2"
```

**Find union**:

```bash
> SUNION mySet mySet2
1) "value3"
2) "value2"
3) "value1"
```

**Find the difference set**:

```bash
> SDIFF mySet mySet2 # The difference set is a set composed of all elements that belong to mySet but do not belong to A
1) "value1"
```

### Application scenarios

**Scenarios where the data that needs to be stored cannot be repeated**

- Examples: Website UV statistics (`HyperLogLog` is more suitable for scenarios with a huge amount of data), article likes, dynamic likes and other scenarios.
- Related commands: `SCARD` (get the number of sets).

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719073733851.png)

**Scenarios where the intersection, union and difference of multiple data sources need to be obtained**

- Examples: common friends (intersection), common fans (intersection), common following (intersection), friend recommendation (difference set), music recommendation (difference set), subscription account recommendation (difference set + intersection) and other scenarios.
- Related commands: `SINTER` (intersection), `SINTERSTORE` (intersection), `SUNION` (union), `SUNIONSTORE` (union), `SDIFF` (difference), `SDIFFSTORE` (difference).

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719074543513.png)

**Scenarios where elements in the data source need to be randomly obtained**

- Examples: Lottery system, random roll call and other scenarios.
- Related commands: `SPOP` (randomly obtain elements from the set and remove them, suitable for scenarios that do not allow repeated winnings), `SRANDMEMBER` (randomly obtain elements from the set, suitable for scenarios that allow repeated winnings).

## Sorted Set (ordered set)

### Introduction

Sorted Set is similar to Set, but compared with Set, Sorted Set adds a weight parameter `score`, so that the elements in the set can be ordered by `score`, and the list of elements can also be obtained through the range of `score`. It's a bit like a combination of `HashMap` and `TreeSet` in Java.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124437791.png)

### Common commands

| Commands | Introduction |
|------------------------------------------------ |---------------------------------------------------------------------------------------------------------------- |
| ZADD key score1 member1 score2 member2 ... | Add one or more elements to the specified sorted set |
| ZCARD KEY | Get the number of elements of the specified ordered set |
| ZSCORE key member | Get the score value of the specified element in the specified ordered set |
| ZINTERSTORE destination numkeys key1 key2 ... | Store the intersection of all given ordered sets in destination, perform a SUM aggregation operation on the score values corresponding to the same elements, numkeys is the number of sets |
| ZUNIONSTORE destination numkeys key1 key2 ... | Find the union, others are similar to ZINTERSTORE |
| ZDIFFSTORE destination numkeys key1 key2 ... | Find the difference set, others are similar to ZINTERSTORE || ZRANGE key start end | Get the elements between start and end of the specified ordered set (score from low to high) |
| ZREVRANGE key start end | Get the elements between start and end of the specified ordered set (score from high to bottom) |
| ZREVRANK key member | Get the ranking of the specified element in the specified ordered set (score sorted from large to small) |

For more Redis Sorted Set commands and detailed usage guides, please view the corresponding introduction on the Redis official website: <https://redis.io/commands/?group=sorted-set>.

**Basic Operation**:

```bash
>ZADD myZset 2.0 value1 1.0 value2
(integer) 2
> ZCARD myZset
2
> ZSCORE myZset value1
2.0
> ZRANGE myZset 0 1
1) "value2"
2) "value1"
> ZREVRANGE myZset 0 1
1) "value1"
2) "value2"
> ZADD myZset2 4.0 value2 3.0 value3
(integer) 2

```

- `myZset` : `value1`(2.0), `value2`(1.0).
- `myZset2`: `value2` (4.0), `value3` (3.0).

**Get the ranking of the specified element**:

```bash
> ZREVRANK myZset value1
0
> ZREVRANK myZset value2
1
```

**Find intersection**:

```bash
> ZINTERSTORE myZset3 2 myZset myZset2
1
> ZRANGE myZset3 0 1 WITHSCORES
value2
5
```

**Find union**:

```bash
> ZUNIONSTORE myZset4 2 myZset myZset2
3
> ZRANGE myZset4 0 2 WITHSCORES
value1
2
value3
3
value2
5
```

**Find the difference set**:

```bash
> ZDIFF 2 myZset myZset2 WITHSCORES
value1
2
```

### Application scenarios

**Scenarios where elements in the data source need to be randomly obtained and sorted according to a certain weight**

- Examples: various rankings, such as the ranking of gifts in the live broadcast room, the WeChat step ranking in the circle of friends, the rank ranking in Honor of Kings, the topic popularity ranking, etc.
- Related commands: `ZRANGE` (sort from small to large), `ZREVRANGE` (sort from large to small), `ZREVRANK` (specify element ranking).

![](https://oss.javaguide.cn/github/javaguide/database/redis/2021060714195385.png)

There is an article in the "Technical Interview Questions" of ["Java Interview Guide"](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) that details how to use Sorted Set to design and create a ranking list.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719071115140.png)

**Scenarios where the data that needs to be stored has priority or importance** such as priority task queue.

- Example: Priority task queue.
- Related commands: `ZRANGE` (sort from small to large), `ZREVRANGE` (sort from large to small), `ZREVRANK` (specify element ranking).

## Summary

| Data type | Description |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String | A binary safe data type that can be used to store any type of data such as strings, integers, floating point numbers, images (base64 encoding or decoding of images or the path of images), and serialized objects.                                               |
| List | The implementation of Redis's List is a doubly linked list, which can support reverse search and traversal, making it more convenient to operate, but it brings some additional memory overhead.                                                                                       |
| Hash | A mapping table of String type field-value (key-value pairs), which is particularly suitable for storing objects. During subsequent operations, you can directly modify the values of certain fields in this object.                                                              |
| Set | An unordered set. The elements in the set are not in order but are unique, somewhat similar to `HashSet` in Java.                                                                                                                  |
| Zset | Compared with Set, Sorted Set adds a weight parameter `score`, so that the elements in the set can be ordered by `score`, and the list of elements can also be obtained through the range of `score`. It's a bit like a combination of `HashMap` and `TreeSet` in Java. |

## Reference

- Redis Data Structures: <https://redis.com/redis-enterprise/data-structures/>.
- Redis Commands: <https://redis.io/commands/>.
- Redis Data types tutorial: <https://redis.io/docs/manual/data-types/data-types-tutorial/>.
- Whether Redis uses Hash or String to store object information: <https://segmentfault.com/a/1190000040032006>

<!-- @include: @article-footer.snippet.md -->