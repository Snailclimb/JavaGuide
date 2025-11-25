---
title: Detailed explanation of Redis memory fragmentation
category: database
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis, memory fragmentation, allocator, memory management, memory usage, optimization
  - - meta
    - name: description
      content: Analyze the causes and effects of Redis memory fragmentation, combine allocator and memory management strategies, provide observation and optimization directions, and reduce resource waste.
---

## What is memory fragmentation?

You can think of memory fragmentation simply as free memory that is not available.

For example: the operating system allocates 32 bytes of continuous memory space for you, but you actually only need to use 24 bytes of memory space to store data. If the extra 8 bytes of memory space cannot be allocated to store other data later, it can be called memory fragmentation.

![Memory fragmentation](https://oss.javaguide.cn/github/javaguide/memory-fragmentation.png)

Although Redis memory fragmentation will not affect Redis performance, it will increase memory consumption.

## Why is there Redis memory fragmentation?

There are two common reasons for Redis memory fragmentation:

**1. When Redis stores data, the memory space applied to the operating system may be larger than the actual storage space required for the data. **

The following is the original words of Redis official:

> To store user keys, Redis allocates at most as much memory as the `maxmemory` setting enables (however there are small extra allocations possible).

When Redis uses the `zmalloc` method (the memory allocation method implemented by Redis itself) for memory allocation, in addition to allocating memory of the size `size`, it will also allocate more memory of the size `PREFIX_SIZE`.

The source code of the `zmalloc` method is as follows (source code address: <https://github.com/antirez/redis-tools/blob/master/zmalloc.c): >

```java
void *zmalloc(size_t size) {
   //Allocate memory of specified size
   void *ptr = malloc(size+PREFIX_SIZE);
   if (!ptr) zmalloc_oom_handler(size);
#ifdef HAVE_MALLOC_SIZE
   update_zmalloc_stat_alloc(zmalloc_size(ptr));
   return ptr;
#else
   *((size_t*)ptr) = size;
   update_zmalloc_stat_alloc(size+PREFIX_SIZE);
   return (char*)ptr+PREFIX_SIZE;
#endif
}
```

In addition, Redis can use a variety of memory allocators to allocate memory (libc, jemalloc, tcmalloc). The default is [jemalloc](https://github.com/jemalloc/jemalloc), and jemalloc allocates memory according to a series of fixed sizes (8 bytes, 16 bytes, 32 bytes...). The memory units divided by jemalloc are as shown in the figure below:

![jemalloc memory unit diagram](https://oss.javaguide.cn/github/javaguide/database/redis/6803d3929e3e46c1b1c9d0bb9ee8e717.png)

When the memory requested by the program is closest to a certain fixed value, jemalloc will allocate a corresponding size of space to it. For example, if the program needs to apply for 17 bytes of memory, jemalloc will directly allocate 32 bytes of memory to it, which will result in a waste of 15 bytes of memory. However, jemalloc is specially optimized for memory fragmentation problems and generally does not cause excessive fragmentation.

**2. Frequent modification of data in Redis will also cause memory fragmentation. **

When some data in Redis is deleted, Redis usually does not easily release memory to the operating system.

This also has the corresponding original words in the official Redis documentation:

![](https://oss.javaguide.cn/github/javaguide/redis-docs-memory-optimization.png)

Document address: <https://redis.io/topics/memory-optimization>.

## How to view Redis memory fragmentation information?

Use the `info memory` command to view Redis memory-related information. The specific meaning of each parameter in the figure below is detailed in the Redis official document: <https://redis.io/commands/INFO>.

![](https://oss.javaguide.cn/github/javaguide/redis-info-memory.png)

The calculation formula of Redis memory fragmentation rate: `mem_fragmentation_ratio` (memory fragmentation rate) = `used_memory_rss` (the size of physical memory space actually allocated to Redis by the operating system)/ `used_memory` (the size of memory space actually applied for by the Redis memory allocator to store data)

In other words, the larger the value of `mem_fragmentation_ratio` (memory fragmentation rate), the more serious the memory fragmentation rate.

Be sure not to mistake `used_memory_rss` minus `used_memory` value as the size of the memory fragment! ! ! This includes not only memory fragmentation, but also other process overhead, as well as overhead for shared libraries, stacks, etc.

Many friends may ask: "What is the memory fragmentation rate that needs to be cleaned up?".

Normally, we think that memory fragmentation needs to be cleaned up when `mem_fragmentation_ratio > 1.5`. `mem_fragmentation_ratio > 1.5` means that if you use Redis to store data with an actual size of 2G, you will need to use more than 3G of memory.

If you want to quickly check the memory fragmentation rate, you can also use the following command:

```bash
> redis-cli -p 6379 info | grep mem_fragmentation_ratio
```

In addition, the memory fragmentation rate may be less than 1. I have never encountered this situation in daily use. Interested friends can read this article [Fault Analysis | What should I do if the memory fragmentation rate of Redis is too low? - Weixin Open Source Community](https://mp.weixin.qq.com/s/drlDvp7bfq5jt2M5pTqJCw).

## How to clean up Redis memory fragments?

Redis4.0-RC3 version comes with memory defragmentation, which can avoid the problem of excessive memory fragmentation rate.

Just set the `activedefrag` configuration item to `yes` directly through the `config set` command.

```bash
config set activedefrag yes
```

The specific time to clean up needs to be controlled by the following two parameters:

```bash
#Start cleaning up when the space occupied by memory fragmentation reaches 500mb
config set active-defrag-ignore-bytes 500mb
# Start cleaning when the memory fragmentation rate is greater than 1.5
config set active-defrag-threshold-lower 50
```

The Redis automatic memory fragmentation cleaning mechanism may have an impact on Redis performance. We can reduce the impact on Redis performance through the following two parameters:

```bash
# The proportion of CPU time occupied by memory fragmentation cleaning should not be less than 20%
config set active-defrag-cycle-min 20
# The proportion of CPU time occupied by memory fragmentation cleaning is no more than 50%
config set active-defrag-cycle-max 50
```

In addition, restarting the node can defragment the memory. If you are using a Redis cluster with a high-availability architecture, you can convert the master node with an excessive fragmentation rate into a slave node for safe restart.

## Reference

- Redis official documentation: <https://redis.io/topics/memory-optimization>
- Redis core technology and practice - Geek Time - Why is the memory usage still very high after deleting data? ：<https://time.geekbang.org/column/article/289140>
- Redis source code analysis - memory allocation: <<https://shinerio.cc/2020/05/17/redis/Redis> Source code analysis - memory management>

<!-- @include: @article-footer.snippet.md -->