# 代码审核报告

> 审核时间：2026-06-11
> 审核范围：最近 3 次提交 + 本地未提交改动（共 45 个文件，约 +4000 行）

---

## 审核范围概览

| 审核范围                                | 提交/状态  | 文件数 | 改动量   |
| --------------------------------------- | ---------- | ------ | -------- |
| 提交 1：算法和数据结构面试文章优化      | `a2cea626` | 34     | +2851 行 |
| 提交 2：新增进程线程和 IPC 指南         | `0cb5d7c2` | 8      | +512 行  |
| 提交 3：优化 Java 虚拟线程和 OS 文章    | `8b95e8bc` | 11     | +669 行  |
| 本地改动：cs-basics 目录                | 未提交     | 6      | +314 行  |
| 本地改动：high-performance + tools 目录 | 未提交     | 17     | +580 行  |

---

## P0 必修问题（共 3 个）

### P0-1：`virtual-thread.md` — JEP 491 在 JDK 24 中是 Preview 特性

**来源**：提交 3（`8b95e8bc`）

**位置**：`docs/java/concurrent/virtual-thread.md` 第 274、303、443 行等多处

**问题**：JEP 491（Synchronize Virtual Threads without Pinning）在 JDK 24 中以 **Preview** 状态交付，需要启动时加 `--enable-preview` 才能生效。但文中多处表述为"已解决""已经基本解决"，会让读者误以为升级到 JDK 24 就自动受益。

**原文摘录**：

> "JDK 24 的 JEP 491 改进了这一点，使虚拟线程在 `synchronized` 中阻塞时也能释放底层平台线程，消除了绝大多数由 `synchronized` 带来的 Pinning 场景。"

**修复建议**：在首次提到 JEP 491 时加上一句说明，例如：

> "JEP 491 目前在 JDK 24 中以预览特性提供，需要在启动时加 `--enable-preview` 参数才能生效。"

后续提到时可用"JDK 24+ 预期解决"等措辞。

---

### P0-2：`README_EN.md` — 引用了不存在的 AIGuide 项目

**来源**：提交 3（`8b95e8bc`）

**位置**：`README_EN.md` 第 23-29 行

**问题**：新增了一段 AI Guide 项目描述，指向 `https://github.com/Snailclimb/AIGuide`，但 JavaGuide 仓库中并无此项目。

**修复建议**：如果是后续计划，在正式上线前不应出现在 README 中；如果是误提交，删除这段内容。

---

### P0-3：`docker-intro.md` — Docker Compose 示例 volume 名不匹配

**来源**：本地未提交改动

**位置**：`docs/tools/docker/docker-intro.md` Compose YAML 示例

**问题**：顶层 `volumes` 声明了 `db_data`，但服务中引用的是 `web_data`，名称不一致，运行时会报错。

**修复建议**：将服务中的 `web_data` 改为 `db_data`，或统一命名。

---

## P1 建议修复（共 15 个）

### P1-1：`greedy.md` — 区间贪心模板缺少空数组边界检查

**来源**：提交 1（`a2cea626`）

**位置**：`docs/cs-basics/algorithms/greedy.md` 第 14 行

**问题**：`eraseOverlapIntervals` 模板直接访问 `intervals[0][1]`，如果 `intervals` 为空会抛 `ArrayIndexOutOfBoundsException`。

```java
int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
    int count = 1;
    int end = intervals[0][1]; // 空数组会崩
```

**修复建议**：在方法开头加 `if (intervals.length == 0) return 0;`，或在易错点里提到这个边界。

---

### P1-2：`top-k.md` — 小顶堆过程示意不够严谨

**来源**：提交 1（`a2cea626`）

**位置**：`docs/cs-basics/algorithms/top-k.md` 过程示意表

**问题**：读入 `1` 后堆内容标注为 `[1, 3, 2]`。Java 的 `PriorityQueue` 内部数组顺序不一定完全反映堆的层序结构。

**修复建议**：改为更关注"堆顶和堆大小"而非"堆内容数组"，或加一句说明这是简化表示。

---

### P1-3：`top-k.md` + `greedy.md` — 缺少"高频问题自测"章节

**来源**：提交 1（`a2cea626`）

**位置**：`docs/cs-basics/algorithms/top-k.md`、`docs/cs-basics/algorithms/greedy.md`

**问题**：所有新增的模板文章都有"高频问题自测"章节，但 `top-k.md` 和 `greedy.md` 没有，结构不一致。

**修复建议**：补上自测问题，例如：

- `top-k.md`：堆和快排分区的复杂度对比？小顶堆和大顶堆怎么选？数据流中位数怎么用双堆？
- `greedy.md`：贪心和动态规划怎么区分？区间排序字段怎么选？

---

### P1-4：多篇模板文章 — "代表题精讲"缺少完整 walkthrough

**来源**：提交 1（`a2cea626`）

**位置**：`binary-search.md`、`dynamic-programming.md` 等模板文章

**问题**："代表题精讲"部分更多是代码模板 + 文字解释，缺少一道题从题目描述 → 思路推导 → 代码实现的完整 walkthrough。

**修复建议**：在每篇模板文章中选一道代表题做 2-3 段的精讲，至少覆盖思路推导和边界处理。

---

### P1-5：`ipc.md` 第 21 行 — "的/得"语法错误

**来源**：提交 2（`0cb5d7c2`）

**位置**：`docs/cs-basics/operating-system/ipc.md` 第 21 行

**问题**："做不**的**"应为"做不**得**"。

**修复建议**：改为"做不得"。

---

### P1-6：`process-and-thread.md` — 三处图片 alt 文本缺失

**来源**：提交 2（`0cb5d7c2`）

**位置**：`docs/cs-basics/operating-system/process-and-thread.md` 三处图片

**问题**：`![ ](...)` 的 alt 文本为空，影响可访问性。

**修复建议**：为每张图片补充有意义的 alt 描述文本。

---

### P1-7：面试题与专题文章内容重复度过高

**来源**：提交 2（`0cb5d7c2`）

**位置**：`operating-system-basic-questions-01.md` vs `process-and-thread.md` / `ipc.md`

**问题**：fork/exec/wait、管道、信号量等内容在面试题文章和新增的专题文章中重复度很高。

**修复建议**：面试题文章保留简短回答 + 链接指向专题文章，专题文章做详细展开，减少维护成本。

---

### P1-8：`virtual-thread.md` 第 259 行 — 调度器模式描述不精确

**来源**：提交 3（`8b95e8bc`）

**位置**：`docs/java/concurrent/virtual-thread.md` 第 259 行

**问题**：调度器只说"FIFO 模式的 ForkJoinPool"，JEP 444 原文描述调度器为 FIFO 提交队列 + **work-stealing** 的 ForkJoinPool。只说"FIFO 模式"可能让人误以为是简单的先进先出调度。

**修复建议**：改为"调度器是一个采用 FIFO 提交策略的 `ForkJoinPool`（底层仍为 work-stealing 模式）"。

---

### P1-9：`README_EN.md` — 大小写不统一 + 多余冒号

**来源**：提交 3（`8b95e8bc`）

**位置**：`README_EN.md` 第 67、91、138、162、183、186 行

**问题**：

- `Must-read` / `Must-Read` 大小写不统一
- 第 67 行 `Must-see:+1:):` 括号/冒号组合错误
- 第 186 行 `Summary** :` 冒号位置错误

**修复建议**：统一为 `Must-read` 或 `Must-Read`，清理多余冒号。

---

### P1-10：`virtual-thread.md` — 缺少 header/footer include

**来源**：提交 3（`8b95e8bc`）

**位置**：`docs/java/concurrent/virtual-thread.md` 开头和结尾

**问题**：其他同类文章有 `@include: @article-header.snippet.md` 和 `@article-footer.snippet.md`，但虚拟线程文章没有，会导致站点上缺少页脚组件。

**修复建议**：在文件开头和结尾分别加上对应的 include 片段。

---

### P1-11：`10-classical-sorting-algorithms.md` — 移除"本文转自"声明后丢失出处归属

**来源**：本地未提交改动

**位置**：`docs/cs-basics/algorithms/10-classical-sorting-algorithms.md`

**问题**：移除了"本文转自：<http://www.guoyaohua.com/sorting.html>"声明。虽然文章末尾"参考文章"仍保留了同源链接，但正文顶部不再有出处信息，可能让读者误以为全文为原创。

**修复建议**：在"参考文章"部分将第一个链接标注为主参考来源，或在 frontmatter 后保留一行引用说明。

---

### P1-12：`dynamic-programming.md` — `coinChange` 缺少 import 说明

**来源**：本地未提交改动

**位置**：`docs/cs-basics/algorithms/dynamic-programming.md` 第 176-189 行

**问题**：`Arrays.fill(dp, max)` 需要导入 `java.util.Arrays`，但代码块中没有 import 语句或说明。

**修复建议**：在代码块前加一句"需要导入 `java.util.Arrays`"，或在代码顶部加上 import 语句。

---

### P1-13：`binary-search.md` — 重复代码缺少注释说明

**来源**：本地未提交改动

**位置**：`docs/cs-basics/algorithms/binary-search.md` 第 214-250 行

**问题**："代表题精讲"中重复了 `lowerBound` 和 `upperBound` 的完整实现，虽然从教学角度看重复是合理的，但缺少注释说明与上文模板一致。

**修复建议**：在重复代码上方加一句："这两个辅助方法与上文模板一致，此处不再重复解释。"

---

### P1-14：`docker-intro.md` — Compose 示例网络声明不一致

**来源**：本地未提交改动

**位置**：`docs/tools/docker/docker-intro.md` Compose YAML 示例

**问题**：网络声明方式在示例中不一致，有的声明了自定义网络，有的使用默认网络。

**修复建议**：统一 Compose 示例中的网络声明方式。

---

### P1-15：`maven-best-practices.md` — `maven.compiler.release` 缺少版本前提

**来源**：本地未提交改动

**位置**：`docs/tools/maven/maven-best-practices.md`

**问题**：推荐使用 `maven.compiler.release` 但没有说明这个属性需要 Java 9+。

**修复建议**：加一句说明"该属性需要 Java 9+，如果项目仍需兼容 Java 8，请继续使用 `source` 和 `target`"。

---

## P2 可选优化（共 15 个）

### P2-1：`10-classical-sorting-algorithms.md` — 桶排序描述偏模糊

**来源**：提交 1

**问题**：桶排序最坏时间复杂度写"可能退化"，建议明确写为 `O(n²)`（所有元素进同一个桶）。

---

### P2-2：`string-algorithm-problems.md` — KMP 说法过于绝对

**来源**：提交 1

**问题**："面试中不一定要求从零推导"可能让读者误以为 KMP 不重要。建议改为"通常不要求从零推导 `next` 数组的手工计算过程，但要理解它的作用是跳过已匹配前缀"。

---

### P2-3：`complexity-analysis.md` — `O(2^n)` 描述不准确

**来源**：提交 1

**问题**："结果数量本身就是指数级"不完全准确。建议改为"子集枚举的搜索空间是指数级"。

---

### P2-4：`binary-search.md` — 答案二分最大速度上限假设

**来源**：提交 1

**问题**：示例中 `right` 取 `max(piles)` 在 `h >= piles.length` 时成立，建议加一句说明该题约束条件。

---

### P2-5：`heap.md` — 大顶堆比较器首选写法

**来源**：提交 1

**问题**：先给了 `(a, b) -> b - a` 的有隐患写法再纠正，建议直接把 `Integer.compare(b, a)` 作为首选。

---

### P2-6：`backtracking.md` — 去重章节与子集模板去重内容重复

**来源**：提交 1

**问题**：子集模板部分已讲了去重代码，"去重怎么做"章节又重复了同一段代码。建议合并或让去重章节更综合地总结三种策略差异。

---

### P2-7：`classical-algorithm-problems-recommendations.md` — 7/30 天路线三处重复

**来源**：提交 1

**问题**：三份文件各自有"7 天速刷"和"30 天路线"表格，内容高度重复，增加维护成本。建议集中在 README.md 里，其他两篇只放链接。

---

### P2-8：`tree.md` — 面试复盘内容相对单薄

**来源**：提交 1

**问题**：树结构只新增了约 49 行"面试复盘重点"，而其他结构（哈希表、LRU、并查集）都是完整的独立文章（100-160 行）。建议后续补充覆盖遍历、路径、构造、LCA 等高频题型。

---

### P2-9：两篇新 OS 文章 — "小 G"自称不一致

**来源**：提交 2

**问题**：`process-and-thread.md` 和 `ipc.md` 中"小 G"的使用方式不完全一致。

---

### P2-10：`virtual-thread.md` — Scoped Values 缺少 JEP 编号

**来源**：提交 3

**问题**：提到 Scoped Values 但没有给 JEP 编号（JEP 429 / JEP 481）。建议改为"JEP 481 中的 Scoped Values（第三次预览）也值得关注"。

---

### P2-11：`virtual-thread.md` — 协程面试题可补充 Go goroutine 对比

**来源**：提交 3

**问题**：面试中经常追问与 Go goroutine 的对比，可补一句区分。

---

### P2-12：`operating-system-basic-questions-01.md` — Windows Event 同步原语被隐去

**来源**：提交 3

**问题**：原"事件（Event）"被替换为"条件变量/事件通知"，Windows Event 的概念被隐去了。建议补一句"Windows 中的 Event 对象也属于这类通知机制的特化实现"。

---

### P2-13：`hash-table.md` — "先查再加"解释可补具体例子

**来源**：本地改动

**问题**：`k = 0` 的边界场景解释准确但缺少具体例子。建议补一个例子，如 `nums = [1]`, `k = 0`，先查再加返回 0（正确），先加再查返回 1（错误）。

---

### P2-14：`lru-cache.md` — 操作过程示意表缺少初始状态

**来源**：本地改动

**问题**：表格直接从 `put(1, 1)` 开始，缺少初始空缓存状态行。建议在第一行前添加"初始状态 → (空) → 虚拟头尾相连，缓存为空"。

---

### P2-15：`kafka-questions-01.md` — KRaft 保留的版本锚点丢失

**来源**：本地改动

**问题**：修改后丢失了 KRaft 模式相关的具体版本信息，建议保留版本锚点以便读者确认。

---

## 整体评价

| 维度       | 评分 | 说明                                                                      |
| ---------- | ---- | ------------------------------------------------------------------------- |
| 代码正确性 | 优   | 所有代码示例逻辑正确（在题目约束范围内），仅 greedy.md 有空数组边界遗漏   |
| 内容准确性 | 优   | 技术解释准确，"面试手写路径"等新增模块实用性强                            |
| 排版规范   | 优   | Markdown 格式统一，代码块标注一致，与原文风格高度统一                     |
| 改动质量   | 优   | 虚拟线程重写、OS 文章修正、Docker 重写均为实质性提升                      |
| 维护成本   | 中   | 部分内容存在跨文件重复（7/30 天路线、fork/exec/wait），后续需关注同步问题 |

**结论**：修复 3 个 P0 后即可合并。P1 建议在本次或下次提交中逐步修复。P2 可按需优化。
