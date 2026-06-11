---
title: Top K 问题面试题总结：堆、快排分区、桶计数与数据流
description: Top K 问题面试题总结，讲解第 K 大、前 K 高频、小顶堆、快排分区、桶计数、数据流中位数、PriorityQueue 和 LeetCode 高频题。
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: TopK,Top K,第K大,前K高频,堆,小顶堆,快排分区,桶计数,PriorityQueue,数据流中位数,LeetCode
---

Top K 问题在后端面试里很常见，因为它既能考算法，也能自然追问工程场景：排行榜、热词统计、数据流中位数、日志里最常见的错误码，都能落到 Top K。

这类题不要只记一种写法。面试官常会追问：如果数据量很大怎么办？如果是数据流怎么办？如果要求前 K 高频怎么办？不同条件下方案会变。

## 面试考察重点

- 能用堆解决第 K 大和前 K 高频。
- 能说清小顶堆和大顶堆怎么选。
- 能对比堆、快排分区、桶计数的复杂度。
- 能处理数据流场景。
- 能写出 Java `PriorityQueue` 比较器。

## Top K 题怎么选方案？

先看 3 个条件：

1. 是否只需要第 K 个元素，还是要完整的前 K 个元素？
2. 数据是一次性给出，还是持续到来的数据流？
3. 是否需要结果有序？

如果只是一次性数组里找第 K 大，快排分区平均更快；如果数据持续到来，维护一个大小为 K 的堆更自然；如果题目问前 K 高频，要先做频率统计，再对频率做 Top K。

## 方案对比

| 方案     | 适合场景                 | 时间复杂度         | 空间复杂度          |
| -------- | ------------------------ | ------------------ | ------------------- |
| 排序     | 数据量不大，代码简单优先 | `O(nlogn)`         | 取决于排序实现      |
| 小顶堆   | 找前 K 大或第 K 大       | `O(nlogk)`         | `O(k)`              |
| 快排分区 | 找第 K 大，平均效率高    | 平均 `O(n)`        | `O(1)` 到 `O(logn)` |
| 桶计数   | 频率范围有限，前 K 高频  | `O(n)`             | `O(n)`              |
| 双堆     | 数据流中位数             | 每次插入 `O(logn)` | `O(n)`              |

面试里可以这样回答取舍：

- 排序最简单，适合数据量不大或不追求最优复杂度。
- 堆适合 K 比 n 小很多的场景，空间只需要 `O(k)`。
- 快排分区适合一次性找第 K 大，平均 `O(n)`，但最坏会退化。
- 桶计数适合频率类问题，尤其是频率范围不超过 `n`。

## 小顶堆求第 K 大

```java
int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int num : nums) {
        heap.offer(num);
        if (heap.size() > k) {
            heap.poll();
        }
    }
    return heap.peek();
}
```

堆里始终保留当前最大的 K 个数，堆顶就是这 K 个数里最小的，也就是整体第 K 大。

为什么是小顶堆？因为堆里要保留最大的 K 个元素。当新元素进来后，如果堆大小超过 K，就应该淘汰这 K + 1 个元素里最小的那个。小顶堆的堆顶正好是最小值。

如果求第 K 小，思路反过来：维护大小为 K 的大顶堆，超过 K 时弹出最大值。

## 前 K 高频元素

```java
int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.put(num, freq.getOrDefault(num, 0) + 1);
    }
    PriorityQueue<int[]> heap = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
        heap.offer(new int[] {entry.getKey(), entry.getValue()});
        if (heap.size() > k) {
            heap.poll();
        }
    }
    int[] ans = new int[k];
    for (int i = k - 1; i >= 0; i--) {
        ans[i] = heap.poll()[0];
    }
    return ans;
}
```

这里堆按频率升序，堆大小超过 K 时弹出频率最小的元素。

这题分两层：

1. 用 `HashMap` 统计每个元素的频率。
2. 对“元素 + 频率”做 Top K。

如果面试官要求相同频率时按元素大小或字典序排序，比较器就要把第二排序规则写进去。比如前 K 高频单词通常要求频率高的在前，频率相同时字典序小的在前。

## 快排分区思路

快排分区适合找第 K 大，不要求输出有序的前 K 个元素。思路是每次把数组按 pivot 分成两边，根据 pivot 的排名决定继续搜索哪一边。平均时间复杂度是 `O(n)`，但最坏可能退化到 `O(n^2)`，实际写法通常会随机选 pivot。

快排分区的优势是不用维护堆，平均时间复杂度低；局限是它更适合内存中的一次性数据。如果数据流不断到来，或者数据太大不能一次性放进内存，堆方案更容易落地。

## 数据流场景

数据流题不能每来一个元素就重新排序。常见做法是持续维护一个数据结构：

- 数据流第 K 大：维护大小为 K 的小顶堆。
- 数据流中位数：维护两个堆，左边大顶堆放较小的一半，右边小顶堆放较大的一半。
- 滑动窗口中位数：还要处理过期元素，普通堆删除任意元素不方便，通常需要延迟删除或有序集合。

## 过程示意和边界样例

以数组 `[3, 2, 1, 5, 6, 4]` 求第 2 大为例，维护大小为 2 的小顶堆。表中为了方便阅读，按值升序展示堆中的元素，不代表 Java `PriorityQueue` 的内部数组顺序。

| 读入元素 | 候选元素    | 超过 K 后处理         |
| -------- | ----------- | --------------------- |
| 3        | `[3]`       | 不处理                |
| 2        | `[2, 3]`    | 不处理                |
| 1        | `[1, 2, 3]` | 弹出 1，保留 `[2, 3]` |
| 5        | `[2, 3, 5]` | 弹出 2，保留 `[3, 5]` |
| 6        | `[3, 5, 6]` | 弹出 3，保留 `[5, 6]` |
| 4        | `[4, 5, 6]` | 弹出 4，保留 `[5, 6]` |

最后堆顶是 `5`，也就是第 2 大。

常见错误写法：

```java
PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> b - a);
```

这个比较器在极端整数值下可能溢出。更稳妥的写法是：

```java
PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
```

## 易错点

- 找前 K 大通常用小顶堆，找前 K 小通常用大顶堆。
- `PriorityQueue` 默认是小顶堆。
- 前 K 高频要先统计频率，再对频率做 Top K。
- 如果要输出有序结果，堆或快排分区后还需要额外排序。
- 数据流场景不能把所有数据每次重新排序。

## 高频问题自测

- 找第 K 大为什么通常维护大小为 K 的小顶堆？
- 小顶堆和大顶堆分别适合哪些 Top K 场景？
- 堆方案和快排分区方案的时间复杂度、空间复杂度有什么区别？
- 前 K 高频元素为什么要先做频率统计？
- 数据流中位数为什么适合用两个堆维护？

## 推荐练习题

- [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)
- [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)
- [692. 前 K 个高频单词](https://leetcode.cn/problems/top-k-frequent-words/)
- [703. 数据流中的第 K 大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/)
- [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

<!-- @include: @article-footer.snippet.md -->
