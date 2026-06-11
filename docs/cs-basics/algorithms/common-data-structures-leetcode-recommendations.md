---
title: 常见数据结构经典 LeetCode 题目推荐
description: 按数组、链表、栈、队列、哈希表、树、图、堆、Trie、并查集等结构整理 LeetCode 高频题，给出题型、模板、面试价值和复盘重点。
category: 计算机基础
tag:
  - 算法
  - 数据结构
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,数据结构,数组,链表,栈,队列,哈希表,二叉树,图,堆,Trie,并查集,题目推荐,刷题路线
---

刷数据结构题，不建议只按难度从 Easy 刷到 Hard。更稳的方式是按结构建立题型：数组看下标和区间，链表看指针，栈队列看顺序约束，树图看遍历，堆看优先级，哈希表看快速定位。

下面的题单控制在面试高频和模板代表题范围内。每类先做“必刷题”，再做“进阶题”。题目做完后，至少写下复杂度、边界样例和这题属于哪个模板。

## 怎么用这份题单

数据结构题不要只记结论。每刷一类题，先回到对应结构看一次“存储方式、核心操作、复杂度”，再动手写题。这样面试官追问 Java 集合、Redis、MySQL 索引或缓存场景时，答案不会只停在题解层面。

| 结构               | 先读什么                                                                                                                 | 刷题时重点看什么                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| 数组、链表、栈队列 | [线性数据结构详解](../data-structure/linear-data-structure.md)、[双指针与滑动窗口](./two-pointers-and-sliding-window.md) | 下标、指针更新、入栈出栈时机           |
| 哈希表             | [哈希表面试题总结](../data-structure/hash-table.md)                                                                      | key 的设计、计数时机、冲突和扩容       |
| 树和图             | [树结构详解](../data-structure/tree.md)、[图详解](../data-structure/graph.md)、[DFS 与 BFS](./dfs-bfs.md)                | 递归返回值、访问标记、BFS 层数统计     |
| 堆和 Top K         | [堆详解](../data-structure/heap.md)、[Top K 问题面试题总结](./top-k.md)                                                  | 堆大小、比较器、数据流场景             |
| Trie 和并查集      | [Trie 前缀树面试题总结](../data-structure/trie.md)、[并查集面试题总结](../data-structure/union-find.md)                  | 节点结构、结束标记、路径压缩、连通判断 |
| LRU                | [LRU 缓存面试题总结](../data-structure/lru-cache.md)                                                                     | 哈希表和双向链表如何保持 O(1)          |

## 数组

| 题型     | 必刷题                                                                                          | 进阶题                                                                                                                                  | 面试价值         | 复盘重点                      |
| -------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------- |
| 二分查找 | [704. 二分查找](https://leetcode.cn/problems/binary-search/)                                    | [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) | 考循环条件和边界 | `left <= right`、左右边界更新 |
| 原地修改 | [26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/) | [80. 删除有序数组中的重复项 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/)                                   | 考双指针写法     | 慢指针含义、覆盖时机          |
| 双指针   | [977. 有序数组的平方](https://leetcode.cn/problems/squares-of-a-sorted-array/)                  | [15. 三数之和](https://leetcode.cn/problems/3sum/)                                                                                      | 高频数组题       | 排序后去重、左右指针移动      |
| 前缀和   | [303. 区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/)         | [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)                                                             | 子数组题入口     | 前缀和含义、哈希表计数        |

## 链表

| 题型     | 必刷题                                                                                          | 进阶题                                                                        | 面试价值         | 复盘重点                         |
| -------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------- | -------------------------------- |
| 基础操作 | [707. 设计链表](https://leetcode.cn/problems/design-linked-list/)                               | [24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/) | 考节点操作基本功 | 虚拟头节点、插入删除顺序         |
| 链表反转 | [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/)                              | [92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/)       | 高频手写题       | `prev`、`cur`、`next` 的更新顺序 |
| 快慢指针 | [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)                                | [142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/)        | 常见追问题       | 相遇点和入环点推导               |
| 删除节点 | [19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) | [61. 旋转链表](https://leetcode.cn/problems/rotate-list/)                     | 考边界处理       | 链表长度、头节点被删             |

## 栈与队列

| 题型     | 必刷题                                                                          | 进阶题                                                                                              | 面试价值        | 复盘重点                   |
| -------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------- | -------------------------- |
| 结构模拟 | [232. 用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/) | [225. 用队列实现栈](https://leetcode.cn/problems/implement-stack-using-queues/)                     | 考结构理解      | 入队栈、出队栈职责         |
| 括号匹配 | [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)               | [394. 字符串解码](https://leetcode.cn/problems/decode-string/)                                      | 字符串栈题入口  | 什么时候入栈、什么时候弹栈 |
| 单调栈   | [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)               | [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)              | 中高频题型      | 栈中维护递增还是递减       |
| 单调队列 | [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)     | [862. 和至少为 K 的最短子数组](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k/) | Hard 题常见模板 | 队首过期、队尾维护单调性   |

## 哈希表

| 题型          | 必刷题                                                                      | 进阶题                                                                                   | 面试价值     | 复盘重点                       |
| ------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------ | ------------------------------ |
| 快速查找      | [1. 两数之和](https://leetcode.cn/problems/two-sum/)                        | [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)                       | 哈希表入门   | key 的设计                     |
| 计数          | [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)        | [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)            | 高频统计题   | 数组计数和 Map 计数怎么选      |
| 前缀和 + 哈希 | [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/) | [974. 和可被 K 整除的子数组](https://leetcode.cn/problems/subarray-sums-divisible-by-k/) | 子数组题常考 | 先查再加，避免把当前前缀算进去 |
| 缓存结构      | [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)                    | [460. LFU 缓存](https://leetcode.cn/problems/lfu-cache/)                                 | 手写设计题   | 哈希表和双向链表协作           |

## 二叉树

| 题型         | 必刷题                                                                                                                         | 进阶题                                                                                                                          | 面试价值   | 复盘重点                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------- |
| 遍历         | [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)                                          | [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)                                        | 树题基础   | 递归边界、队列层数      |
| 路径问题     | [112. 路径总和](https://leetcode.cn/problems/path-sum/)                                                                        | [124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)                                         | DFS 高频   | 返回值和全局答案分开    |
| 构造树       | [105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | [106. 从中序与后序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) | 考递归区间 | 下标范围别写乱          |
| 最近公共祖先 | [236. 二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)                             | [235. 二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)                   | 高频追问   | 普通树和 BST 的解法差异 |

## 图

| 题型         | 必刷题                                                             | 进阶题                                                                  | 面试价值     | 复盘重点               |
| ------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------ | ---------------------- |
| 网格 DFS/BFS | [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)   | [695. 岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/) | 图搜索入门   | 越界、访问标记         |
| 拓扑排序     | [207. 课程表](https://leetcode.cn/problems/course-schedule/)       | [210. 课程表 II](https://leetcode.cn/problems/course-schedule-ii/)      | 依赖关系题   | 入度数组、队列         |
| 最短路径     | [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/)   | [127. 单词接龙](https://leetcode.cn/problems/word-ladder/)              | BFS 层序应用 | 每层步数统计           |
| 连通性       | [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/) | [684. 冗余连接](https://leetcode.cn/problems/redundant-connection/)     | 并查集入口   | `find` 和 `union` 模板 |

## 堆

| 题型     | 必刷题                                                                                        | 进阶题                                                                                      | 面试价值    | 复盘重点           |
| -------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- | ------------------ |
| 第 K 大  | [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) | [703. 数据流中的第 K 大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/) | Top K 高频  | 小顶堆大小保持为 K |
| 频率统计 | [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)                 | [692. 前 K 个高频单词](https://leetcode.cn/problems/top-k-frequent-words/)                  | 哈希表 + 堆 | 比较器写法         |
| 双堆     | [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)             | [480. 滑动窗口中位数](https://leetcode.cn/problems/sliding-window-median/)                  | 进阶设计题  | 大顶堆和小顶堆平衡 |

## Trie 与并查集

| 结构       | 必刷题                                                                     | 进阶题                                                                                                   | 面试价值     | 复盘重点               |
| ---------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| Trie       | [208. 实现 Trie](https://leetcode.cn/problems/implement-trie-prefix-tree/) | [211. 添加与搜索单词](https://leetcode.cn/problems/design-add-and-search-words-data-structure/)          | 字符串集合题 | 节点结构、结束标记     |
| Trie + DFS | [212. 单词搜索 II](https://leetcode.cn/problems/word-search-ii/)           | [648. 单词替换](https://leetcode.cn/problems/replace-words/)                                             | 中高频题     | 前缀剪枝               |
| 并查集     | [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/)         | [1319. 连通网络的操作次数](https://leetcode.cn/problems/number-of-operations-to-make-network-connected/) | 连通性模板   | 路径压缩               |
| 并查集判环 | [684. 冗余连接](https://leetcode.cn/problems/redundant-connection/)        | [990. 等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/)            | 图题常见变体 | 先合并等式，再检查冲突 |

## 面试前 7 天速刷清单

| 天数    | 题型          | 推荐题                          |
| ------- | ------------- | ------------------------------- |
| 第 1 天 | 数组 + 哈希表 | 704、26、1、560                 |
| 第 2 天 | 链表          | 206、92、141、19                |
| 第 3 天 | 栈队列        | 20、232、739、239               |
| 第 4 天 | 树            | 144、102、105、236              |
| 第 5 天 | 图            | 200、207、994、547              |
| 第 6 天 | 堆 + Top K    | 215、347、295                   |
| 第 7 天 | 综合复盘      | LRU、三数之和、岛屿数量、课程表 |

## 30 天系统刷题路线

| 阶段       | 时间           | 目标                                   |
| ---------- | -------------- | -------------------------------------- |
| 基础结构   | 第 1 到 6 天   | 数组、链表、栈、队列，每类至少 3 道    |
| 查找与统计 | 第 7 到 10 天  | 哈希表、前缀和、二分查找               |
| 树和图     | 第 11 到 18 天 | 树遍历、构造树、LCA、DFS/BFS、拓扑排序 |
| 进阶结构   | 第 19 到 24 天 | 堆、Trie、并查集、LRU                  |
| 综合复盘   | 第 25 到 30 天 | 只做错题、变体题和口述复杂度           |

<!-- @include: @article-footer.snippet.md -->
