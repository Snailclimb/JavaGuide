---
title: 并查集面试题总结：路径压缩、连通性与 Java 模板
description: 并查集面试题总结，讲解 Union Find、find、union、路径压缩、按大小合并、连通性、判环、省份数量和 LeetCode 高频题。
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: 并查集,Union Find,路径压缩,按大小合并,连通性,图算法,判环,省份数量,Java并查集,LeetCode
---

并查集专门解决“分组”和“连通性”问题。两个元素是否属于同一组？合并两个集合后还有几个连通分量？图里加一条边是否会成环？这些都可以用并查集处理。

面试里它的代码不长，但 `find` 写不好会直接影响复杂度。

## 面试考察重点

- 能写 `find` 和 `union`。
- 能解释路径压缩的作用。
- 能用并查集统计连通分量。
- 能处理图中判环、朋友圈、省份数量、等式关系。
- 能说明并查集适合动态合并，不适合频繁删除。

## 基础模板

```java
class UnionFind {
    private final int[] parent;
    private final int[] size;
    private int count;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        count = n;
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    boolean union(int a, int b) {
        int rootA = find(a);
        int rootB = find(b);
        if (rootA == rootB) {
            return false;
        }
        if (size[rootA] < size[rootB]) {
            parent[rootA] = rootB;
            size[rootB] += size[rootA];
        } else {
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }
        count--;
        return true;
    }

    boolean connected(int a, int b) {
        return find(a) == find(b);
    }

    int count() {
        return count;
    }
}
```

`parent[x]` 表示 `x` 的父节点。根节点的父节点是自己。路径压缩会让查找路径上的节点直接挂到根节点下面，后续查询更快。

## 复杂度

使用路径压缩和按大小合并后，并查集单次操作的均摊复杂度可以看作接近 `O(1)`。面试里一般说“近似常数时间”即可。

空间复杂度是 `O(n)`，主要来自 `parent` 和 `size` 数组。

## 典型场景

| 场景                 | 处理方式                               |
| -------------------- | -------------------------------------- |
| 判断两个节点是否连通 | 比较 `find(a)` 和 `find(b)`            |
| 合并两个集合         | `union(a, b)`                          |
| 统计连通分量个数     | 初始化为 `n`，每次成功合并减 1         |
| 判断无向图是否有环   | 如果一条边两端已连通，再加边就成环     |
| 等式方程             | 先合并相等关系，再检查不等关系是否冲突 |

## 易错点

- `find` 里要返回根节点，不是返回父节点。
- 路径压缩不要写丢递归返回值。
- `union` 时只有两个集合原本不连通，连通分量数量才减 1。
- 并查集适合合并，不擅长删除关系。
- 二维网格题需要把 `(i, j)` 映射成一维编号，例如 `i * cols + j`。

## 推荐练习题

- [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/)
- [684. 冗余连接](https://leetcode.cn/problems/redundant-connection/)
- [990. 等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/)
- [1319. 连通网络的操作次数](https://leetcode.cn/problems/number-of-operations-to-make-network-connected/)
- [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)

<!-- @include: @article-footer.snippet.md -->
