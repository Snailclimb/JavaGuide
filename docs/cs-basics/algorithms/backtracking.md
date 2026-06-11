---
title: 回溯算法面试题总结：组合、排列、子集、剪枝与 Java 模板
description: 回溯算法面试题总结，讲解回溯题型识别、组合模板、排列模板、子集模板、去重剪枝、复杂度分析和 LeetCode 高频题。
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 回溯算法,回溯模板,组合,排列,子集,N皇后,剪枝,Java回溯,LeetCode回溯,算法面试题
---

回溯题的特点很明显：题目让你找所有方案、所有路径、所有组合，或者在一堆选择里试探。它和 DFS 很像，区别在于回溯更强调“选择 -> 递归 -> 撤销选择”。

面试里写回溯，最重要的是先说清递归函数的含义。函数含义稳了，参数、结束条件和撤销选择就不容易乱。

## 面试考察重点

- 能写组合、排列、子集三类模板。
- 能解释 `path`、`startIndex`、`used` 的作用。
- 能根据题目判断是否需要去重。
- 能做简单剪枝，避免无效搜索。
- 能说清复杂度和结果规模有关。

## 回溯题怎么想？

回溯题可以先画成一棵“选择树”。树上的每一层代表一次选择，根节点代表还没选，叶子节点代表一个完整方案。

写代码前先回答 4 个问题：

1. 路径是什么？通常是已经选择的元素，代码里叫 `path`。
2. 选择列表是什么？当前还能选哪些元素。
3. 结束条件是什么？什么时候把 `path` 放进答案。
4. 是否需要剪枝？哪些选择一定不会得到合法答案。

回溯模板里的“撤销选择”不是形式主义。因为 `path` 是复用的，当前分支试完后必须还原现场，给下一个分支使用。

## 组合模板

组合不关心顺序，通常用 `startIndex` 控制下一层从哪里开始：

```java
List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> ans = new ArrayList<>();
    backtrack(1, n, k, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int start, int n, int k, List<Integer> path, List<List<Integer>> ans) {
    if (path.size() == k) {
        ans.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i <= n; i++) {
        path.add(i);
        backtrack(i + 1, n, k, path, ans);
        path.remove(path.size() - 1);
    }
}
```

组合问题不关心顺序，所以 `[1, 2]` 和 `[2, 1]` 是同一个答案。`start` 的作用就是保证后续只能选当前位置之后的数字，避免重复。

如果要从 `1..n` 里选 `k` 个数，还可以剪枝：

```java
for (int i = start; i <= n - (k - path.size()) + 1; i++) {
    // ...
}
```

含义是：如果从 `i` 开始，剩余数字数量已经不够凑满 `k` 个，就没必要继续枚举。

## 排列模板

排列关心顺序，通常用 `used` 标记元素是否已经被选过：

```java
List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> ans = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> ans) {
    if (path.size() == nums.length) {
        ans.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) {
            continue;
        }
        used[i] = true;
        path.add(nums[i]);
        backtrack(nums, used, path, ans);
        path.remove(path.size() - 1);
        used[i] = false;
    }
}
```

排列问题关心顺序，所以每一层都可以从所有数字里选，只是不能重复使用同一个数字。`used[i]` 表示 `nums[i]` 是否已经在当前路径里。

如果数组里有重复数字，排列去重要比组合更容易写错。通常先排序，然后在同一层跳过“前一个相同数字还没被使用”的情况：

```java
if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) {
    continue;
}
```

这句的作用是固定重复数字在同一层的选择顺序，避免生成重复排列。

## 子集模板

子集问题通常每个节点都是一个答案：

```java
List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> ans = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), ans);
    return ans;
}

void backtrack(int start, int[] nums, List<Integer> path, List<List<Integer>> ans) {
    ans.add(new ArrayList<>(path));
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(i + 1, nums, path, ans);
        path.remove(path.size() - 1);
    }
}
```

子集问题和组合问题很像，但它不是只在固定长度时收集答案，而是每到一个节点都收集一次。因为任何长度的路径都可以是一个子集。

如果题目要求去重，比如输入 `[1, 2, 2]`，仍然是先排序，再跳过同一层重复元素：

```java
if (i > start && nums[i] == nums[i - 1]) {
    continue;
}
```

## 去重怎么做？

如果输入有重复元素，通常先排序，再在同一层跳过重复选择：

```java
if (i > start && nums[i] == nums[i - 1]) {
    continue;
}
```

这句的含义是：同一层里，前一个相同数字已经作为开头尝试过了，当前数字再作为开头会产生重复结果。

## 过程示意和边界样例

以 `n = 3, k = 2` 的组合问题为例，选择树可以简化成下面这样：

| 第一层选择 | 第二层可选 | 产生结果           |
| ---------- | ---------- | ------------------ |
| 选 1       | 2、3       | `[1, 2]`、`[1, 3]` |
| 选 2       | 3          | `[2, 3]`           |
| 选 3       | 无         | 不足 2 个数，剪枝  |

回溯题建议检查这些边界：

| 输入         | 重点                    |
| ------------ | ----------------------- |
| 空数组       | 子集题通常要返回 `[[]]` |
| `k = 0`      | 组合题是否返回空组合    |
| 有重复元素   | 是否先排序并做同层去重  |
| 结果只有一个 | 是否正确拷贝 `path`     |

常见错误写法：

```java
ans.add(path); // 错：后续 path 会继续变化
```

应该写成：

```java
ans.add(new ArrayList<>(path));
```

回溯里的 `path` 是复用对象，不拷贝就会导致答案里的列表一起被后续递归修改。

## 易错点

- 加入答案时要拷贝 `path`，不能直接放引用。
- 组合用 `startIndex`，排列用 `used`，不要混着写。
- 去重通常要先排序。
- 剪枝条件必须不影响正确答案。
- 回溯复杂度经常和结果数量相同量级，不要随手写 `O(n)`。

## 推荐练习题

- [77. 组合](https://leetcode.cn/problems/combinations/)
- [78. 子集](https://leetcode.cn/problems/subsets/)
- [46. 全排列](https://leetcode.cn/problems/permutations/)
- [39. 组合总和](https://leetcode.cn/problems/combination-sum/)
- [51. N 皇后](https://leetcode.cn/problems/n-queens/)

<!-- @include: @article-footer.snippet.md -->
