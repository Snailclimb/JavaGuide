---
title: 哈希表面试题总结：哈希冲突、扩容与 Java HashMap
description: 哈希表面试题总结，讲解哈希函数、哈希冲突、拉链法、开放寻址法、负载因子、扩容、Java HashMap 和 LeetCode 高频题。
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: 哈希表,HashMap,哈希函数,哈希冲突,拉链法,开放寻址法,负载因子,扩容,Java集合,数据结构面试题
---

哈希表的面试价值很高，因为它一头连着算法题里的快速查找和计数，另一头连着 Java `HashMap`、缓存、去重和分布式系统里的分片路由。

这个问题问的是：如何把一个 key 快速映射到数组下标，并在冲突、扩容和极端数据下仍然保持可接受的查询效率。

## 面试考察重点

- 哈希函数负责把 key 映射成数组下标。
- 哈希冲突无法完全避免，只能设计策略处理。
- 哈希表平均查询、插入、删除是 `O(1)`，最坏情况可能退化。
- Java `HashMap` 使用数组 + 链表 + 红黑树，JDK 8 后链表过长会树化。
- 哈希表常用于快速查找、计数、去重、缓存索引。

## 哈希表怎么工作？

哈希表通常由数组和哈希函数组成：

1. 对 key 计算哈希值。
2. 根据数组长度把哈希值映射成下标。
3. 如果该位置为空，直接放入。
4. 如果发生冲突，按冲突解决策略继续处理。

```java
int index = hash(key) & (table.length - 1);
```

`HashMap` 的容量是 2 的幂时，可以用位运算替代取模。位运算更快，也方便扩容后重新分布。

## 哈希冲突怎么解决？

| 方法       | 思路                     | 典型应用         | 注意点                   |
| ---------- | ------------------------ | ---------------- | ------------------------ |
| 拉链法     | 数组位置上挂链表或树     | Java `HashMap`   | 链表过长会影响查询       |
| 开放寻址法 | 冲突后继续探测下一个位置 | 一些高性能哈希表 | 删除和负载因子处理更复杂 |
| 再哈希     | 冲突后换一个哈希函数     | 理论方案较常见   | 实现成本更高             |

Java `HashMap` 主要使用拉链法。JDK 8 开始，当链表长度达到阈值并且数组容量足够大时，会把链表转换成红黑树，降低极端冲突下的查询成本。

## 负载因子和扩容

负载因子表示哈希表使用程度：

```text
负载因子 = 元素数量 / 数组容量
```

`HashMap` 默认负载因子是 `0.75`。当元素数量超过 `capacity * loadFactor` 时触发扩容，容量通常变为原来的 2 倍。

扩容会带来一次 rehash 成本。面试里可以这样回答：哈希表单次插入平均是 `O(1)`，但触发扩容的那次会搬迁元素；从摊还角度看，多次插入仍然可以看作平均 `O(1)`。

## 和 Java HashMap 的关系

`HashMap` 常见追问：

- 初始容量为什么建议设置成 2 的幂？
- 默认负载因子为什么是 `0.75`？
- JDK 8 为什么引入红黑树？
- `HashMap` 为什么线程不安全？
- `HashMap` 和 `ConcurrentHashMap` 有什么区别？

这些问题已经超出纯数据结构，但底层仍然是哈希表：数组负责定位，链表或红黑树负责处理冲突，扩容负责控制负载。

## 常见算法题模板

两数之和：

```java
int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (map.containsKey(need)) {
            return new int[] {map.get(need), i};
        }
        map.put(nums[i], i);
    }
    return new int[] {-1, -1};
}
```

这段代码体现了哈希表最常见的用法：用空间换时间，把一次查找从 `O(n)` 降到平均 `O(1)`。

## 易错点

- 哈希表平均 `O(1)` 不等于任何情况下都是 `O(1)`。
- 自定义对象作为 key 时，要正确重写 `equals()` 和 `hashCode()`。
- 可变对象不适合直接作为哈希表 key。
- 统计频率时，数组计数比 `HashMap` 更适合字符集很小的场景。
- 哈希表能加速查找，但会带来额外空间。

## 推荐练习题

- [1. 两数之和](https://leetcode.cn/problems/two-sum/)
- [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)
- [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)
- [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)
- [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)

<!-- @include: @article-footer.snippet.md -->
