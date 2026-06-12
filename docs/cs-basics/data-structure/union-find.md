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

文章内容概览：

1. 什么是并查集？
2. 并查集如何用数组表示集合？
3. `find`、`union`、`connected` 分别做什么？
4. 路径压缩和按大小合并为什么能提速？
5. 并查集适合哪些连通性问题？

![并查集用父节点指针表示连通分量的森林结构](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/union-find.png)

## 什么是并查集？

并查集（Disjoint Set Union，DSU，也叫 Union Find）维护的是一组互不相交的集合。它最擅长回答两类问题：

1. **查询**：两个元素现在是不是属于同一个集合？
2. **合并**：把两个元素所在的集合合并成一个集合。

它不关心集合内部的完整结构，也不关心两个点之间具体经过哪些边。比如在社交关系里，并查集可以快速告诉你 A 和 B 是否属于同一个关系网络；但它不会告诉你 A 到 B 的最短路径是什么。

这也是并查集和 BFS/DFS 的区别：BFS/DFS 更像是每次沿着图现场搜索；并查集则是把连通关系在合并过程中维护起来，后续查询直接看两个元素的代表节点是否一致。

## 并查集如何表示集合？

并查集通常用一个 `parent` 数组表示若干棵树组成的森林：

- `parent[x]` 表示元素 `x` 的父节点。
- 如果 `parent[x] == x`，说明 `x` 是所在集合的根节点。
- 一个集合只需要用根节点作为代表。

初始化时，每个元素都是一个单独的集合，所以每个元素的父节点都是自己：

```text
parent[0] = 0
parent[1] = 1
parent[2] = 2
...
```

执行 `union(0, 1)` 后，可以让 `1` 的根节点挂到 `0` 的根节点下面。此时 `0` 和 `1` 就属于同一个集合。继续执行 `union(1, 2)` 时，虽然传入的是 `1` 和 `2`，但真正合并的是 `1` 的根节点和 `2` 的根节点。

所以，并查集里的关键不是“当前节点的父节点是谁”，而是“沿着父节点一直往上走，最终根节点是谁”。`find(x)` 做的就是这件事。

## 三个核心操作

并查集常见操作可以概括为三个：

| 操作              | 作用                                      |
| ----------------- | ----------------------------------------- |
| `find(x)`         | 找到 `x` 所在集合的代表节点，也就是根节点 |
| `union(a, b)`     | 合并 `a` 和 `b` 所在的两个集合            |
| `connected(a, b)` | 判断 `a` 和 `b` 的代表节点是否相同        |

如果两个元素的根节点相同，说明它们已经属于同一个集合；如果根节点不同，`union` 就把其中一个根节点挂到另一个根节点下面。

## 面试考察重点

- 能写 `find` 和 `union`。
- 能解释路径压缩的作用。
- 能用并查集统计连通分量。
- 能处理图中判环、朋友圈、省份数量、等式关系。
- 能说明并查集适合动态合并，不适合频繁删除。

## 从 Quick Find 到 Quick Union

理解并查集时，可以先看两个极端版本：

- **Quick Find**：数组里直接存每个元素所属集合编号。查询两个元素是否同组很快，但合并两个集合时，需要扫描整个数组修改集合编号。
- **Quick Union**：数组里存父节点，通过根节点代表集合。合并时只改一个根节点的父指针，但如果树很高，`find` 会变慢。

面试和刷题里常用的是 Quick Union 的优化版本：**路径压缩 + 按大小/秩合并**。

- **路径压缩**：每次 `find(x)` 时，把沿途节点直接挂到根节点下面，后续再查这些节点会更快。
- **按大小合并**：合并两个集合时，把小树挂到大树下面，尽量避免树长得太高。

这两个优化配合起来，能把并查集的多次操作压到非常接近常数时间。

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

这份模板里有两个细节值得单独看：

1. `find()` 中的 `parent[x] = find(parent[x])` 是路径压缩。递归返回根节点后，顺手把 `x` 直接连到根节点。
2. `union()` 中通过 `size` 决定谁挂到谁下面，这是按大小合并。这样可以减少树的高度增长。

`count` 表示当前还有多少个连通分量。每次 `union()` 真正合并了两个原本不连通的集合，`count` 才减 1；如果两个元素本来就连通，不能重复减少。

## 复杂度

使用路径压缩和按大小合并后，并查集单次操作的均摊复杂度是 `O(α(n))`，其中 `α(n)` 是反阿克曼函数，增长极慢。实际面试里一般说“近似常数时间”即可。

空间复杂度是 `O(n)`，主要来自 `parent` 和 `size` 数组。

## 典型场景

| 场景                 | 处理方式                               |
| -------------------- | -------------------------------------- |
| 判断两个节点是否连通 | 比较 `find(a)` 和 `find(b)`            |
| 合并两个集合         | `union(a, b)`                          |
| 统计连通分量个数     | 初始化为 `n`，每次成功合并减 1         |
| 判断无向图是否有环   | 如果一条边两端已连通，再加边就成环     |
| 等式方程             | 先合并相等关系，再检查不等关系是否冲突 |

并查集特别适合“关系不断合并、查询是否同组”的问题，例如省份数量、冗余连接、账户合并、最小生成树中的 Kruskal 算法等。

不过，并查集不擅长处理删除关系。因为一旦两个集合合并，内部哪些边让它们连通的信息通常已经被压缩掉了。删除一条边后，集合是否仍然连通并不能靠简单修改 `parent` 数组得到。

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

## 参考资料

- [Algorithms, 4th Edition：Union-Find](https://algs4.cs.princeton.edu/15uf/)
- [Algorithms, 4th Edition：WeightedQuickUnionPathCompressionUF](https://algs4.cs.princeton.edu/15uf/WeightedQuickUnionPathCompressionUF.java.html)
- [CP-Algorithms：Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html)

<!-- @include: @article-footer.snippet.md -->
