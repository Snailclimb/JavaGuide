---
title: 敏感词过滤方案总结
description: 敏感词过滤方案详解，涵盖 Trie 树、DFA 算法、AC 自动机等高性能敏感词匹配算法的原理、复杂度分析与实现方法。
category: 系统设计
tag:
  - 安全
  - 数据结构
head:
  - - meta
    - name: keywords
      content: 敏感词过滤,Trie树,DFA算法,AC自动机,双数组Trie,字符串匹配,内容安全
---

系统需要对用户输入的文本进行敏感词过滤，如色情、政治、暴力相关的词汇。

敏感词过滤本质上是**多模式字符串匹配问题**：在一段文本中同时查找多个关键词。主流方案包括 **Trie 树**、**AC 自动机**及其变种（如双数组 Trie），这些方案本质上都是 **DFA（确定有穷自动机）** 的应用。

**核心结论**：

- **Trie 树**：实现简单，适合敏感词规模较小（< 1 万）的场景。
- **双数组 Trie（DAT）**：内存占用低，适合大规模词库（> 1 万）。
- **AC 自动机**：单次扫描匹配所有关键词，适合需要高吞吐量的场景。

## 算法实现

### Trie 树

**Trie 树**（发音为 /ˈtraɪ/）也称为字典树、前缀树，是一种专门为字符串处理设计的数据结构。它的核心思想是**空间换时间**：利用字符串的公共前缀来减少存储空间和查询时间的开销，最大限度地减少无谓的字符串比较。

浏览器搜索框的关键词提示功能就可以基于 Trie 树实现：

![浏览器 Trie 树效果展示](https://oss.javaguide.cn/github/javaguide/system-design/security/brower-trie.png)

#### 基本性质

Trie 树具有以下 3 个基本性质：

1. **根节点不包含字符**，除根节点外每一个节点只包含一个字符。
2. **从根节点到某一节点**，路径上经过的字符连接起来，就是该节点对应的字符串。
3. **每个节点的所有子节点包含的字符都不相同**。

#### 结构示例

假设敏感词库中有以下词汇：

- 高清视频
- 高清 CV
- 东京冷
- 东京热

构造的 Trie 树结构如下（红色节点表示字符串终止）：

![敏感词 Trie 树](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-trie.png)

当查找字符串"东京热"时，将其拆分为单个字符"东"、"京"、"热"，然后从根节点逐层匹配。

#### 复杂度分析

假设敏感词库有 n 个词，平均长度为 m，待匹配文本长度为 L：

| 指标       | 复杂度       | 说明                                               |
| ---------- | ------------ | -------------------------------------------------- |
| 查询时间   | O(L × m)     | **最坏情况**：每个位置都要匹配到词尾；实际通常更优 |
| 空间复杂度 | O(n × m × σ) | σ 为字符集大小（汉字约 2 万）                      |

Trie 树是一种**空间换时间**的数据结构。当敏感词存在大量公共前缀时，空间利用率较高；否则冗余较大。

#### 应用场景

| 场景             | 说明                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| **字符串检索**   | 事先将已知字符串保存到 Trie 树，快速查找某字符串是否存在或统计出现频率 |
| **最长公共前缀** | 利用公共前缀特性，快速获取多个字符串的公共前缀                         |
| **字典序排序**   | 先序遍历 Trie 树即可得到按字典序排序的结果                             |

#### 代码示例

以下是使用 HashMap 实现字符级 Trie 的简化示例：

```java
public class SimpleTrie {
    private static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd;
    }

    private final Node root = new Node();

    // 添加敏感词
    public void addWord(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -> new Node());
        }
        node.isEnd = true;
    }

    // 检测文本中是否包含敏感词
    public boolean contains(String text) {
        for (int i = 0; i < text.length(); i++) {
            Node node = root;
            for (int j = i; j < text.length(); j++) {
                node = node.children.get(text.charAt(j));
                if (node == null) break;
                if (node.isEnd) return true;
            }
        }
        return false;
    }

    // 获取文本中所有匹配的敏感词
    public List<String> matchAll(String text) {
        List<String> result = new ArrayList<>();
        for (int i = 0; i < text.length(); i++) {
            Node node = root;
            for (int j = i; j < text.length(); j++) {
                node = node.children.get(text.charAt(j));
                if (node == null) break;
                if (node.isEnd) {
                    result.add(text.substring(i, j + 1));
                }
            }
        }
        return result;
    }
}
```

::: warning 关于 PatriciaTrie
[Apache Commons Collections](https://mvnrepository.com/artifact/org.apache.commons/commons-collections4) 提供的 `PatriciaTrie` 是基于**位操作**的压缩二进制 Trie（PATRICIA = Practical Algorithm To Retrieve Information Coded In Alphanumeric），与本文描述的**字符级 Trie** 原理不同，不适合直接用于中文敏感词过滤场景。
:::

### 双数组 Trie（DAT）

标准 Trie 树内存占用较大，实际工程中通常使用改进版——**双数组 Trie（Double-Array Trie，DAT）**。

DAT 由日本的 Aoe Jun-ichi、Mori Akira 和 Sato Takuya 在 1989 年的论文[《An Efficient Implementation of Trie Structures》](https://www.co-ding.com/assets/pdf/dat.pdf)中提出。它通过两个整型数组（base[] 和 check[]）压缩 Trie 结构：

| 特性       | 标准 Trie（数组实现） | 双数组 Trie                  |
| ---------- | --------------------- | ---------------------------- |
| 空间复杂度 | O(n × m × σ)          | O(n × m)                     |
| 内存占用   | 较大                  | 通常可降至数组实现的 20%~30% |
| 实现复杂度 | 简单                  | 较复杂（需处理冲突）         |

::: warning 注意
DAT 的压缩效率与词库的公共前缀比例强相关。极端情况下（无公共前缀），压缩效果有限。
:::

参考实现：<https://github.com/komiya-atsushi/darts-java>

### AC 自动机

**AC 自动机 (Aho-Corasick Automaton)** 是一种建立在 Trie 树（字典树）之上的多模式匹配算法，由贝尔实验室的 Alfred V. Aho 和 Margaret J. Corasick 于 1975 年提出。其核心思想与 KMP 算法一脉相承——利用模式串内部的规律，在失配时进行高效的状态跳转。区别在于：KMP 是线性的，而 AC 自动机利用的是多个模式串之间的**最长公共前后缀**，是专为多模式匹配而生的利器。

#### 核心组件

AC 自动机的运行依赖于三个核心函数：

| **函数**         | **作用域** | **核心职责**                                                                   |
| ---------------- | ---------- | ------------------------------------------------------------------------------ |
| **goto 函数**    | 状态转移   | 决定从当前状态读入新字符后，顺利推进到哪个下一个状态。                         |
| **failure 函数** | 失配跳转   | 即 fail 指针。当 goto 转移失败时，指引程序跳转到“最长相同后缀”状态，避免回溯。 |
| **output 函数**  | 输出匹配   | 记录并提取每个状态对应的匹配词集合，用于最终结果的输出。                       |

#### 构建步骤

AC 自动机的完整生命周期分为三大步：

![AC 自动机构建于匹配流程](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-ac-automaton-flow.png)

**第一步：构建 Trie 树** 将所有待匹配的模式串依次插入 Trie 树中，形成自动机的基础骨架。每个模式串的末尾节点会被打上终止状态的标记。

**第二步：构建 fail 表（失配指针）** 这是 AC 自动机的灵魂。构建过程使用 BFS（广度优先搜索）逐层遍历，对于当前节点 `temp`，其 fail 指针的推导逻辑如下：

1. 找到 `temp` 父节点的 fail 节点。
2. 观察该 fail 节点的子节点中，是否存在与 `temp` 字符相同的节点：
   - 若**存在**，则 `temp` 的 fail 指针直接指向该子节点。
   - 若**不存在**，则继续向上寻找“fail 节点的 fail 节点”，直到找到匹配项或退回到 `root`。

> **💡 与 KMP 的关系：** fail 指针本质上就是 KMP 算法中 next 数组在多叉树上的泛化拓展。例如："she" 的后缀 "he" 与 "he" 的前缀 "he" 完全相同，因此 "she" 结尾的 "e"，其 fail 指针必然指向 "he" 中的 "e"。

**第三步：模式匹配（双链并行）** 从目标文本串头部开始扫描，定义指针 `p` 初始指向 `root`：

1. **状态转移**：遍历文本串字符。若当前字符匹配，`p` 下移；若失配且 `p` 不是 `root`，则 `p` 沿 fail 链不断回退，直到能继续匹配或退回 `root`。
2. **收集输出**：【极其关键】每次状态转移完成后，**必须顺着当前 `p` 节点的 fail 链向上遍历一次**！只要链条上的节点带有终止标记，就将其记录。因为一个长词（如 "she"）的后缀，极有可能正好是另一个短词（如 "he"），只有沿 fail 链追溯才能保证 100% 召回，不漏掉任何嵌套词。

#### 性能对比

| 算法      | 预处理时间 | 匹配时间     | 特点                     |
| --------- | ---------- | ------------ | ------------------------ |
| 朴素匹配  | O(1)       | O(L × n × m) | 每个词单独匹配           |
| Trie 树   | O(n × m)   | O(L × m)     | 按字符逐个匹配，最坏情况 |
| AC 自动机 | O(n × m)¹  | O(L + z)     | z 为匹配数量，单次扫描   |

> ¹ 使用 HashMap 存储子节点时为 O(n × m)；若使用数组存储（需预分配字符集大小 σ），则为 O(n × m × σ)。

将 AC 自动机与 DAT 结合（[AhoCorasickDoubleArrayTrie](https://github.com/hankcs/AhoCorasickDoubleArrayTrie)），可以同时获得高效匹配和低内存占用的优势。

### DFA 实现

**DFA（Deterministic Finite Automaton，确定有穷自动机）** 是自动机理论中的概念。从实现角度看，**基于 Trie 的敏感词过滤本身就是一种 DFA**：每个节点代表一个状态，每条边代表一个字符转移。

[Hutool 5.x](https://hutool.cn/docs/#/dfa/%E6%A6%82%E8%BF%B0) 提供了基于 DFA 的敏感词过滤实现（底层为 Trie）：

![Hutool 的 DFA 算法](https://oss.javaguide.cn/github/javaguide/system-design/security/hutool-dfa.png)

```java
WordTree wordTree = new WordTree();
wordTree.addWord("大");
wordTree.addWord("大憨憨");
wordTree.addWord("憨憨");

String text = "那人真是个大憨憨！";

// 获得第一个匹配的关键字
String matchStr = wordTree.match(text);
System.out.println(matchStr); // 输出: 大

// matchAll(text, limit, isDensityMatch, isGreedy)
// - limit: 匹配数量上限，-1 表示不限制
// - isDensityMatch: 是否密度匹配（在已匹配词内部继续寻找重叠词）
// - isGreedy: 是否贪婪匹配（true 匹配最长关键词，false 匹配最短关键词）
List<String> matchStrList = wordTree.matchAll(text, -1, false, false);
System.out.println(matchStrList); // 输出: [大, 憨憨]

List<String> matchStrList2 = wordTree.matchAll(text, -1, false, true);
System.out.println(matchStrList2); // 输出: [大, 大憨憨]
```

**输出解释**：

- `matchAll(text, -1, false, false)`：非贪婪 + 非密度匹配

  - 从位置 0 开始，"大"匹配成功（最短匹配）
  - 跳过已匹配字符后，"憨憨"从位置 2 开始匹配成功
  - 结果：`[大, 憨憨]`

- `matchAll(text, -1, false, true)`：贪婪 + 非密度匹配
  - 从位置 0 开始，"大憨憨"匹配成功（最长匹配）
  - 同时"大"也匹配成功（作为前缀）
  - 结果：`[大, 大憨憨]`

## 对抗变形词

实际场景中，用户常通过以下方式绕过敏感词过滤：

| 变形方式 | 示例                | 应对策略               |
| -------- | ------------------- | ---------------------- |
| 谐音字   | "傻叉" → "傻擦"     | 维护谐音词库           |
| 插入符号 | "fuck" → "f*u*c\*k" | 预处理去除特殊字符     |
| 繁简混用 | "台灣" → "台湾"     | 统一转换为简体后再匹配 |
| 全角字符 | "abc" → "ａｂｃ"    | 全角转半角             |

[ToolGood.Words](https://github.com/toolgood/ToolGood.Words) 等成熟库已内置繁简互换、全角半角转换等功能，可直接使用。

## 开源项目

| 项目                                                                               | 特点                                                                                                    | 适用场景                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| [ToolGood.Words](https://github.com/toolgood/ToolGood.Words)                       | 多语言支持（C#/Java/Python/Go/JS/C++），支持繁简互换、全角半角、拼音转换；C# 版本过滤速度超 3 亿字符/秒 | 多语言项目              |
| [Hutool DFA](https://hutool.cn/docs/#/dfa/%E6%A6%82%E8%BF%B0)                      | 轻量级，API 简洁，基于 Trie 实现                                                                        | Java 项目，中小规模词库 |
| [sensitive-words-filter](https://github.com/hooj0/sensitive-words-filter)          | 支持 TTMP、DFA、DAT、Trie 等多种算法                                                                    | Java 项目，需对比选型   |
| [AhoCorasickDoubleArrayTrie](https://github.com/hankcs/AhoCorasickDoubleArrayTrie) | AC 自动机 + 双数组 Trie，性能优异                                                                       | 大规模词库、高吞吐量    |

## 生产建议

### 词库管理

- **定期更新**：敏感词库需要持续维护，支持热加载避免重启服务。
- **分级管理**：按业务场景分为高/中/低敏感度，采用不同的处理策略（直接拦截、人工审核、记录日志）。
- **匹配日志**：记录匹配结果用于词库优化和误报分析。

### 性能优化

- **预编译 Trie**：服务启动时构建 Trie 结构，避免运行时重复构建。
- **分段并行**：对超长文本（如文章、评论）分段后并行处理。
- **快速排除**：使用布隆过滤器（Bloom Filter）做初筛，快速排除不含敏感词的文本。

### 监控指标

| 指标            | 建议阈值 | 说明                             |
| --------------- | -------- | -------------------------------- |
| 匹配延迟（p99） | < 10ms   | 单次过滤耗时                     |
| 误报率          | < 1%     | 正常内容被误判为敏感词           |
| 漏报率          | 持续监控 | 敏感内容未被识别                 |
| 词库命中率      | 按需分析 | 各敏感词的触发频率，用于词库优化 |

## 参考资料

### 学术论文

- Aho, A.V. and Corasick, M.J. (1975). "[Efficient string matching: An aid to bibliographic search](https://dl.acm.org/doi/10.1145/360825.360855)." _Communications of the ACM_, 18(6), 333-340.（AC 自动机原始论文）
- Aoe, J., Morimoto, K., and Sato, T. (1989). "[An Efficient Implementation of Trie Structures](https://www.co-ding.com/assets/pdf/dat.pdf)." _Software: Practice and Experience_.

### 相关专利

- [一种敏感词自动过滤管理系统](https://patents.google.com/patent/CN101964000B)
- [一种网络游戏中敏感词过滤方法及系统](https://patents.google.com/patent/CN103714160A/zh)

<!-- @include: @article-footer.snippet.md -->
