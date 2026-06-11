---
title: 二分查找面试题总结：左右边界、答案二分与 Java 模板
description: 二分查找面试题总结，系统讲解基础二分、左边界、右边界、答案二分、Java 手写模板、复杂度分析和 LeetCode 高频题。
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 二分查找,二分查找模板,左右边界,答案二分,Java二分查找,LeetCode二分查找,算法面试题
---

二分查找最容易让人翻车的地方不是思想，而是边界。`left`、`right`、`mid`、循环条件、返回值，只要有一个含义没想清楚，就很容易写出死循环或者漏掉答案。

面试里判断能不能用二分，先看一句话：**答案所在空间是否有单调性**。数组有序只是最直观的一种情况，最小速度、最小容量、最小天数这类题，也可以在答案范围上二分。

## 面试考察重点

- 能写出基础二分模板。
- 能处理左边界、右边界。
- 能识别答案二分，而不是只会在数组里找数。
- 能解释为什么循环会结束，为什么不会漏答案。
- 能说出时间复杂度是 `O(logn)`，空间复杂度通常是 `O(1)`。

## 什么时候想到二分？

不要把二分查找理解成“只能在有序数组里找数字”。它真正依赖的是 **单调性**。

常见单调性有两类：

| 类型     | 例子                           | 判断方式                                   |
| -------- | ------------------------------ | ------------------------------------------ |
| 数组单调 | 有序数组中找 `target`          | `nums[mid]` 和 `target` 比较后能排除一半   |
| 答案单调 | 求最小速度、最小容量、最少天数 | 某个答案可行时，更大的答案也可行，或反过来 |

比如“爱吃香蕉的珂珂”里，吃香蕉速度越快，越容易在规定时间内吃完。这里数组本身不需要有序，单调的是“速度”和“是否能吃完”之间的关系。

面试时可以这样判断：

1. 题目是否在找一个位置、边界或最小/最大可行值？
2. 如果猜一个答案 `x`，能不能在 `O(n)` 或更低复杂度内判断它是否可行？
3. `x` 变大或变小时，可行性是否单调变化？

三个问题都能回答上来，基本就可以尝试二分。

## 基础二分模板

适合在有序数组中查找一个确定值：

```java
int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
```

这个模板里，搜索区间是闭区间 `[left, right]`，所以循环条件是 `left <= right`。每次排除 `mid`，因此更新成 `mid + 1` 或 `mid - 1`。

用一句话记这个模板：**区间里每个位置都还可能是答案，循环结束时区间为空。**

举个例子，数组 `[1, 3, 5, 7, 9]` 中找 `7`：

1. `left = 0`，`right = 4`，`mid = 2`，`nums[mid] = 5`，目标在右侧。
2. 更新 `left = mid + 1 = 3`。
3. `mid = 3`，找到 `7`。

如果查找 `6`，最后会出现 `left > right`，说明闭区间已经被排空，返回 `-1`。

## 左边界模板

找第一个大于等于 `target` 的位置：

```java
int lowerBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}
```

这个模板的搜索区间是左闭右开 `[left, right)`。`right` 初始化为 `nums.length`，返回值可能等于 `nums.length`，表示数组中不存在大于等于 `target` 的位置。

左边界模板的关键不是“找到 target”，而是“找到第一个满足条件的位置”。这个写法能自然处理目标不存在的情况。

比如数组 `[1, 2, 2, 2, 4]`，找第一个大于等于 `2` 的位置：

- 当 `nums[mid] >= 2`，`mid` 可能就是答案，所以不能排除 `mid`，更新 `right = mid`。
- 当 `nums[mid] < 2`，`mid` 和它左边都不可能是答案，更新 `left = mid + 1`。

循环结束时，`left == right`，这个位置就是第一个满足条件的位置。

## 右边界模板

找最后一个小于等于 `target` 的位置，可以先找第一个大于 `target` 的位置，再减 1：

```java
int upperBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left - 1;
}
```

这种写法的好处是左右边界只记一套思路：找第一个满足条件的位置。

右边界容易写错，推荐转化成左边界问题：

- 最后一个小于等于 `target` 的位置 = 第一个大于 `target` 的位置 - 1。
- 最后一个小于 `target` 的位置 = 第一个大于等于 `target` 的位置 - 1。

这样不需要维护两套模板，面试手写时更稳。

## 答案二分

答案二分不是在数组里找元素，而是在答案范围里找最小可行值或最大可行值。

典型问题：给定若干堆香蕉和总时间 `h`，求最小吃香蕉速度。速度越快，越容易在 `h` 小时内吃完，这就是单调性。

这类题通常分两步：

1. 确定答案范围。比如速度最小是 `1`，最大不超过最大那堆香蕉数。
2. 写 `check` 函数。给定一个速度，判断能不能在 `h` 小时内吃完。

```java
int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = 0;
    for (int pile : piles) {
        right = Math.max(right, pile);
    }
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, h, mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

boolean canFinish(int[] piles, int h, int speed) {
    long hours = 0;
    for (int pile : piles) {
        hours += (pile + speed - 1) / speed;
    }
    return hours <= h;
}
```

这里为什么返回 `left`？因为循环一直在找“第一个可行速度”。当 `canFinish(mid)` 为 true，说明 `mid` 可行，但可能还有更小的速度也可行，所以收缩右边界。最后左右边界重合的位置，就是最小可行速度。

答案二分的 `check` 函数往往比二分本身更重要。面试时建议先把 `check` 的含义说清楚，再写二分框架。

## 三类二分怎么选？

| 目标                         | 推荐模板 | 返回值                        |
| ---------------------------- | -------- | ----------------------------- |
| 找到某个等于 `target` 的下标 | 基础二分 | 找到返回下标，找不到返回 `-1` |
| 找第一个满足条件的位置       | 左边界   | 返回 `left`，可能等于数组长度 |
| 找最小可行答案               | 答案二分 | 返回最终的 `left`             |

如果题目里有“第一个”“最后一个”“最小可行”“最大可行”，不要急着写基础二分，先判断是不是边界问题。

## 过程示意和边界样例

以左边界模板为例，数组 `[1, 2, 2, 2, 4]` 中找第一个大于等于 `2` 的位置：

| 轮次 | `left` | `right` | `mid` | 判断            | 下一步      |
| ---- | ------ | ------- | ----- | --------------- | ----------- |
| 1    | 0      | 5       | 2     | `nums[2] >= 2`  | `right = 2` |
| 2    | 0      | 2       | 1     | `nums[1] >= 2`  | `right = 1` |
| 3    | 0      | 1       | 0     | `nums[0] < 2`   | `left = 1`  |
| 结束 | 1      | 1       | -     | `left == right` | 返回 1      |

几个边界样例建议手写前先过一遍：

| 输入        | 目标       | 预期                                 |
| ----------- | ---------- | ------------------------------------ |
| `[]`        | `1`        | 返回 `-1` 或插入位置 `0`，看题目要求 |
| `[1]`       | `1`        | 能命中唯一元素                       |
| `[1, 1, 1]` | 左边界 `1` | 返回 `0`                             |
| `[1, 3, 5]` | 左边界 `4` | 返回 `2`                             |
| `[1, 3, 5]` | 左边界 `6` | 返回 `3`                             |

常见错误写法：

```java
while (left < right) {
    int mid = (left + right) / 2;
    if (nums[mid] >= target) {
        right = mid - 1; // 错：mid 可能就是左边界，不能直接排除
    } else {
        left = mid + 1;
    }
}
```

左边界里，当 `nums[mid] >= target` 时，`mid` 仍然可能是答案，所以应该写 `right = mid`。

## 易错点

- `mid = (left + right) / 2` 可能整数溢出，推荐写成 `left + (right - left) / 2`。
- 不要混用闭区间和左闭右开区间的更新方式。
- 找边界时，命中目标后通常不能直接返回，还要继续收缩区间。
- 答案二分要先证明单调性，不能看到“最小值”就硬套。
- `canFinish` 这类判断函数里可能需要 `long`，避免累计值溢出。

## 高频问题自测

- `left < right` 和 `left <= right` 有什么区别？
- 二分查找为什么是 `O(logn)`？
- 找左边界时，为什么命中后要移动 `right`？
- 什么是答案二分？它和普通二分有什么区别？
- 二分查找一定要求数组有序吗？

## 推荐练习题

- [704. 二分查找](https://leetcode.cn/problems/binary-search/)
- [35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/)
- [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)
- [875. 爱吃香蕉的珂珂](https://leetcode.cn/problems/koko-eating-bananas/)
- [1011. 在 D 天内送达包裹的能力](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days/)

<!-- @include: @article-footer.snippet.md -->
