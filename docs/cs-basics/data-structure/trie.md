---
title: Trie 前缀树面试题总结：字典树原理、前缀匹配与 Java 实现
description: Trie 前缀树面试题总结，讲解字典树节点结构、插入、查询、前缀匹配、复杂度、搜索提示、敏感词过滤和 LeetCode 高频题。
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: Trie,前缀树,字典树,前缀匹配,字符串算法,搜索提示,敏感词过滤,Java Trie,LeetCode Trie,数据结构面试题
---

Trie，也叫前缀树或字典树，适合处理大量字符串的前缀匹配问题。搜索提示、词典查询、敏感词过滤、路由前缀匹配，都能看到它的影子。

它的核心思路很直接：把字符串按字符拆开，共享相同前缀。比如 `app`、`apple`、`apply` 会共用 `a -> p -> p` 这条路径。

## 面试考察重点

- 能说清 Trie 为什么适合前缀查询。
- 能写插入、完整单词查询、前缀查询。
- 能分析时间复杂度和字符串长度有关。
- 能说明 Trie 的空间开销可能比较大。
- 能和哈希表做对比。

## 节点结构

如果只处理小写英文字母，可以用长度为 26 的数组：

```java
class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isWord;
}
```

如果字符集不固定，可以用 `Map<Character, TrieNode>`，空间更灵活，但每次访问有哈希表成本。

## 基础实现

```java
class Trie {
    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }
        node.isWord = true;
    }

    public boolean search(String word) {
        TrieNode node = find(word);
        return node != null && node.isWord;
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;
    }

    private TrieNode find(String text) {
        TrieNode node = root;
        for (char c : text.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                return null;
            }
            node = node.children[index];
        }
        return node;
    }
}
```

## 复杂度

设字符串长度为 `L`：

- 插入：`O(L)`
- 查询完整单词：`O(L)`
- 查询前缀：`O(L)`

空间复杂度取决于节点数量。最坏情况下，如果字符串几乎没有公共前缀，空间开销会接近所有字符数量之和。

## Trie 和哈希表怎么选？

| 场景             | Trie               | 哈希表       |
| ---------------- | ------------------ | ------------ |
| 完整字符串查询   | 可以做，但空间更大 | 更直接       |
| 前缀查询         | 很适合             | 需要额外处理 |
| 按前缀枚举所有词 | 很适合             | 不方便       |
| 字符集很大       | 需要优化节点结构   | 更省心       |

如果只是判断一个词是否存在，哈希表通常更简单。如果要频繁查前缀，Trie 更合适。

## 工程场景

- 搜索框自动补全：根据用户输入前缀找到候选词。
- 敏感词匹配：Trie 可以配合 AC 自动机做多模式匹配。
- IP 路由匹配：最长前缀匹配可以借鉴 Trie 思路。
- 词典校验：快速判断单词或前缀是否存在。

## 易错点

- `isWord` 不能省，否则无法区分 `app` 和 `apple`。
- 字符集不一定只有小写字母，面试时要根据题目调整。
- 删除单词比插入查询复杂，需要判断节点是否还能被其他单词复用。
- Trie 查询复杂度和字符串长度有关，不直接和词典大小成正比。

## 推荐练习题

- [208. 实现 Trie](https://leetcode.cn/problems/implement-trie-prefix-tree/)
- [211. 添加与搜索单词](https://leetcode.cn/problems/design-add-and-search-words-data-structure/)
- [212. 单词搜索 II](https://leetcode.cn/problems/word-search-ii/)
- [648. 单词替换](https://leetcode.cn/problems/replace-words/)

<!-- @include: @article-footer.snippet.md -->
