---
title: Claude Code 上下文管理详解：窗口预算、压缩与长任务治理
description: 从 Claude Code 的上下文窗口出发，讲清固定与动态开销、Context Rot、工具结果清理、AutoCompact、Context Reset、Sub-agent 隔离和 handoff，帮助你管理长任务中的信息流与任务状态。
category: AI 编程原理
tag:
  - Claude Code
  - 上下文工程
  - Context Management
  - AI 编程
head:
  - - meta
    - name: keywords
      content: Claude Code,上下文管理,Context Engineering,上下文窗口,Context Rot,AutoCompact,/compact,Sub-agent,Context Reset,长任务,AI编程
---

大家好，我是小 G。最近星球里有不少 G 友分享 Agent 岗位的面经，我看了一下，发现问到上下文管理的次数比较多。

![Claude Code、Skills 与上下文工程面试题记录](https://oss.javaguide.cn/github/javaguide/ai/claude-code/claude-code-context-management-interview-questions.png)

我在之前的文章中已经分享过一篇： [上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？](https://javaguide.cn/ai/agent/context-engineering.html)，介绍了上下文管理的核心内容。

所以，这篇想结合最顶级的 Coding Agent——Claude Code，进一步挖掘一下底层思想。

它不只是怎么压缩聊天记录，还关系到任务目标、工具输出、文件记录和交接信息分别该留在哪里。

Claude Code 执行 `/compact` 后，会用结构化摘要替换此前的会话历史，并重新加载部分持久化指令。

摘要通常会保留任务目标、重要约束、关键决策、当前进度和相关代码线索，但不保证保留完整的文件内容、检索结果及测试输出。后续如果需要这些材料的精确内容，应重新读取或重新执行。

长任务真正要解决的，是把信息放在合适的位置：窗口只保留眼下要用的材料；可复查、可复用的内容写入文件；切换会话时，只交接下一步所需的结论和线索。清理工具输出、压缩历史、持久化文件、使用子代理和进行会话交接，都是为此服务。

本文涉及两类材料。官方文档能确认的行为按文档描述；文中提到的“逆向观察”和“源码里能看到”，主要来自 Claude Code 2.1.x 附近的非公开源码材料与社区整理，不属于官方稳定接口。

## Claude Code 架构全景

![Claude Code 架构全景](https://oss.javaguide.cn/github/javaguide/ai/claude-code/ctx-mgmt-arch-arch.png)

窗口承压时，可以直接清理工具结果、压缩历史、重置上下文，或者把支线隔离到子代理。Skills 的按需加载、任务状态写入文件系统，以及后台任务的独立执行，也会改变可用预算。

运行中的 Claude Code 需要直接访问系统提示词、工具定义、项目规则、对话历史、工具结果和最近读过的文件。上下文窗口就是承载这些材料的工作内存。

其中混入过期日志、重复搜索结果或互相冲突的旧判断后，Agent 更容易漏约束、重复探索或过早收尾。

在 `Agent = Model + Harness` 这个公式里，模型提供推理能力，Harness 负责信息获取、工具调用和任务推进。上下文管理属于 Harness：它决定当前窗口保留哪些状态，清理哪些临时结果，以及哪些内容应写到窗口外。

![Agent = Model + Harness](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-agent-equals-model-harness-arch.png)

面试中问到这类问题，考察的通常是能否把 Agent 看作一个有状态系统。它和传统后端系统有一些相似之处（以下类比用于帮助理解，不是机制等价）：

| Agent 概念     | 后端类比              | 共同点                       |
| -------------- | --------------------- | ---------------------------- |
| 上下文窗口     | JVM 堆内存            | 容量有限，塞满后质量下降     |
| Compaction     | GC                    | 回收旧内容，保留还活着的状态 |
| Context Reset  | 进程重启 + 检查点恢复 | 丢掉脏历史，从交接状态继续   |
| Sub-agent 隔离 | 微服务拆分            | 独立上下文处理局部任务       |
| Context Rot    | 缓存污染 / 内存泄漏   | 旧信息越积越多，拖慢判断     |
| 工具结果清理   | LRU 缓存淘汰          | 近期内容保留，过期内容清掉   |

Prompt Engineering 和 Context Engineering 的区别也在这里。前者关心单次输入怎么写，后者关心整个会话里的信息怎么流动。

你把 System Prompt 写得再详细，也没办法搞定上下文管理。这反而会起到反作用，增加固定开销，让窗口更早进入高压区/危险区。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

## 窗口预算与信息加载

### 窗口里有哪些开销

普通聊天里，用户通常一轮发一段话，偶尔贴一段代码。Claude Code 不一样。它启动时就带着工具和规则，执行任务时还会自己读文件、跑测试、查 Git 历史、调用 MCP。

文件内容、命令输出和对话历史会持续进入窗口。一次只讨论一个问题，和一次读取几十个文件、跑完整测试，带来的上下文增量完全不同；后者更容易让 Claude 漏掉早期约束、重复搜索，或在已经排除的方向上继续打转。

更强的模型只能推迟这类退化，并不改变输入持续增长的事实。

窗口占用可以分为两部分：启动时就存在的 System Prompt、规则和工具注册，以及任务中不断追加的工具结果和对话历史。前者决定会话起步时的余量；读文件、跑命令和收集日志会不断推高后者。

![上下文窗口（Context Window）= LLM 的工作记忆](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

启动开销主要来自 System Prompt、`CLAUDE.md`、Skills 描述和部分工具信息。观察到的实现会尽量延迟加载一部分 MCP 工具定义：

- 在 ToolSearch 启用、且工具没有被配置成“启动时强制加载”时，部分 MCP 工具会先只暴露名称；
- 等模型真的选中这个工具，再把完整 JSON Schema 拉进来；
- 也有一些工具会在启动时就加载完整描述。

规则文件写得越长、Skills 和 MCP Server 越多，起步时剩下的空间就越少。

想看当前会话实际占用，可以使用 `/context` 命令。它会把当前模型窗口、已用 Token、剩余空间，以及 System Prompt、工具、Skills、消息等分类占用列出来。

![Claude Code /context 命令运行结果](https://oss.javaguide.cn/github/javaguide/ai/skills/claude-code-context-command-result.png)

动态内容里，工具调用通常是大头。一个几百行的源文件可能就是几千 Token；搜索结果和测试日志可能更长。工具调用参数和结果会进入当前会话，文件内容、命令输出和搜索结果会随着任务推进不断累积。接近窗口上限时，Claude Code 会先清理较旧的工具结果，空间仍然不够时再压缩会话。

上下文变长还会影响信息利用效果。输入越多，延迟和成本通常也会增加。模型也不一定能同等利用窗口里的每段内容，相关信息位于长上下文中间时，模型的检索和问答表现可能下降，这类位置敏感现象通常被称为 Lost in the Middle。窗口变大能装下更多信息，但不能保证这些信息都会被稳定使用。

这就是我们常说的上下文腐化（Context Rot）问题。**上下文越长，信息越杂，模型利用上下文的稳定性就越可能变差。**

![上下文腐化](https://oss.javaguide.cn/github/javaguide/ai/harness/context-rot-diagram.png)

Claude Code 每次调用 LLM 时，窗口里通常有这些内容：

| 组成部分         | 内容                                                             | 性质               |
| ---------------- | ---------------------------------------------------------------- | ------------------ |
| 会话初始化上下文 | System Prompt、`CLAUDE.md`、无条件 `.claude/rules/`、Auto Memory | 固定开销           |
| 路径规则         | 带 `paths` 的 `.claude/rules/`                                   | 读取匹配文件时加载 |
| MCP 和工具描述   | 内置工具定义、MCP 工具名称及已加载的 Schema                      | 固定或按需         |
| Hook 注入内容    | Hook 显式返回的 additionalContext、提示或工具反馈                | 动态注入           |
| Skills           | 默认加载简短描述；正文在调用后进入上下文                         | 按需加载           |
| 对话历史         | 用户消息、Claude 回复                                            | 持续增长           |
| 工具调用及结果   | 调用参数、返回值、日志、文件内容                                 | 持续增长           |
| 环境和 IDE 状态  | 工作区、选中代码等客户端或集成提供的信息                         | 按配置注入         |
| 子代理汇报       | Sub-agent 返回的摘要和少量元数据                                 | 按需               |

固定开销通常不会随着对话轮次增长，但它决定了任务开始时还剩多少空间。动态内容才是长任务里的主要增量。同样是 20 轮对话，只聊天和每轮都读文件、跑测试，最终占用可能差很多，因此不能单纯用轮数判断上下文压力。

Prompt Caching 能省成本和延迟，但不能释放上下文空间。即使 System Prompt、工具定义和 `CLAUDE.md` 命中缓存，它们仍然属于当前请求的输入内容。

Extended Thinking 也要算进这笔账。当前轮的 thinking budget 属于 `max_tokens` 的一部分，会按输出 Token 计费，也会计入速率限制。

更容易被忽略的是历史 Thinking Blocks。按当前 API 文档，Opus 4.5 及之后的 Opus、Sonnet 4.6 及之后的 Sonnet、Fable 5、Mythos 5 和 Mythos Preview 默认会保留历史 Thinking Blocks。

更早的 Opus / Sonnet 和 Haiku 模型会自动从上下文里剥离这些历史块。所以，长会话里的 Thinking 是否持续占窗口，取决于具体模型和配置。

如果同时使用工具，规则更严格：返回 `tool_result` 时必须把本轮工具调用对应的 Thinking Block 原样带回，包括 `signature`。工具循环结束后，是否继续保留，再按模型默认行为或 context editing 配置处理。

### 有效窗口和触发阈值

概念上，有效窗口可以这么估：

```text
有效上下文 ≈ 总窗口容量 - 固定开销 - 历史开销
```

源码大概是这样的逻辑：

```typescript
function getEffectiveContextWindowSize(
  modelWindowSize: number,
  maxOutputTokens: number,
): number {
  const reservedForSummary = Math.min(maxOutputTokens, 20000);
  return modelWindowSize - reservedForSummary;
}
```

这里的返回值用于后续警告、自动压缩、阻塞等判断。`getEffectiveContextWindowSize()` 只负责从模型窗口中扣除摘要输出预留。System Prompt、规则、消息历史和工具结果已经包含在实际 Token 使用量中，不会在这个函数里逐项扣除。

这些阈值同样来自上述材料，不属于公开稳定接口，后续版本可能调整。

几个常量值：

| 常量                              | 值     | 用途                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| `AUTOCOMPACT_BUFFER_TOKENS`       | 13,000 | 相对有效窗口再提前触发 AutoCompact 的缓冲带，让压缩在仍有余量时启动 |
| `WARNING_THRESHOLD_BUFFER_TOKENS` | 20,000 | 请求前预警，提示可以手动 `/compact`                                 |
| `ERROR_THRESHOLD_BUFFER_TOKENS`   | 20,000 | 标记上下文进入危险区                                                |
| `MANUAL_COMPACT_BUFFER_TOKENS`    | 3,000  | 手动压缩时的最小安全余量                                            |

这里有两个数字容易混。

`reservedForSummary = min(maxOutputTokens, 20000)` 负责**预留摘要输出空间**。源码注释里提到摘要 p99.99 约 17.3K，所以 20K 上限能覆盖这类极端输出。

`AUTOCOMPACT_BUFFER_TOKENS`（13K）在有效窗口上限前留出缓冲带，并在仍有余量时启动 AutoCompact。摘要输出空间由 20K 预留承担。

13K 只是 AutoCompact 的 buffer；摘要 p99.99 注释对应的是 20K 摘要输出预留。这样设计的好处是可预测：模型窗口从 200K 扩到 500K 时，摘要侧输出预算不会跟着等比例膨胀。

真正独立的阶段主要是预警、AutoCompact 和阻塞上限。`isAboveAutoCompactThreshold` 触发 AutoCompact；`isAtBlockingLimit` 阻止新请求，强制压缩或重置。

参考实现里还保留了 `isAboveWarningThreshold` 和 `isAboveErrorThreshold` 两个状态字段。观察到的版本中，两者使用相同的 20K 阈值，所以 Token 触发点一致。它们可能在不同 UI 或调用路径里承担不同用途，但不代表两个独立的占用区间。

请求发出前的判断链大概是（以下为社区提取的源码镜像中的实现，不是 Anthropic 承诺稳定的 API）。这条链路默认按 AutoCompact 开启时理解；如果 AutoCompact 关闭，warning / error 会退回以有效窗口为基准：

```typescript
reservedForSummary = min(maxOutputTokens, 20_000)
effectiveWindow = modelWindow - reservedForSummary

autoCompactThreshold = effectiveWindow - 13_000
warningThreshold = autoCompactThreshold - 20_000
errorThreshold = autoCompactThreshold - 20_000
blockingLimit = effectiveWindow - 3_000

if currentUsageEstimate >= warningThreshold:
  给出上下文预警

if currentUsageEstimate >= autoCompactThreshold:
  触发 AutoCompact

if currentUsageEstimate >= blockingLimit:
  阻止新请求，要求手动 compact 或重置
```

以 200K 窗口和 20K 摘要预留为例，有效窗口为 180K。AutoCompact 在 167K 触发，预警 / 错误线为 147K，阻塞线为 177K；预警和错误线都由 AutoCompact 线继续减去 20K 得出。

### 信息怎么进上下文

定位 `TokenRefreshService` 的调用方时，先用 `Grep` 找到符号，再根据 `tests/test_utils.py` 与 `src/core_logic/test_utils.py` 这类路径判断文件角色。确认相关后才用 `Read` 打开片段；`ls`、`find`、`git log` 和测试命令在需要补证据时执行。

Read、Glob、Grep、Bash 和子代理沿着任务逐步取材，开始时不需要为整个仓库建立向量索引。路径、符号、导入关系和最新文件状态用于缩小范围；调用关系仍以源码和验证结果为准。

自然语言问答或概念检索可以通过 MCP、插件或自定义 Skill 接入 RAG（Retrieval-Augmented Generation）。代码探索时，RAG 返回的片段还要和关键词搜索、符号分析、直接读取一起验证。

这类定位先看目录和文件名，再落到关键行；确认需要时才展开完整内容：

| 设计决策       | 具体做法                                                 | 好处                                               |
| -------------- | -------------------------------------------------------- | -------------------------------------------------- |
| 元数据即信息   | 文件路径、目录结构、时间戳、文件大小本身就是有价值的信号 | 不读内容就能做初步判断                             |
| 按需加载       | 只在需要时读具体文件，不预加载全部内容                   | 上下文始终只装必要信息                             |
| 迭代深入       | 先粗后细：目录 → 文件名 → 关键行 → 完整内容              | 减少无效探索的上下文消耗                           |
| 直接探索工作区 | 使用 Glob、Grep、Read、Git 和测试工具逐步定位            | 无需提前维护独立索引，读取结果通常与当前工作区一致 |

我们之前聊过很多的 Skill，也是类似的顺序：启动时只加载元数据，模型决定调用后才取具体文档。详细机制可以看我写的这篇：[Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html "Agent Skills 是什么？和 Prompt、MCP 到底差在哪？")。

文档、知识库和历史记录适合先经 RAG 召回。路径、配置、依赖和测试结果持续变化的代码仓库，则需要边搜索、边读取、边验证；搜索词选错时会多走几轮，跨仓库检索、概念检索或大型单体项目也可能更适合语义索引。

| 场景                         | 更适合的方式           |
| ---------------------------- | ---------------------- |
| 查知识库、文档、历史记录     | RAG                    |
| 探索代码仓库、配置、目录结构 | Progressive Disclosure |
| 既有文档又有代码的大项目     | 两者结合               |

Cursor 这类 AI IDE 会做 Codebase Indexing，用索引辅助低延迟补全和快速问答。Claude Code 的任务还要经过读取、判断和验证，因此工具驱动的多轮探索占比更高。

## 上下文为什么会退化

长任务里，窗口扩大后会同时装入更多约束、日志和旧判断，当前决策所需的材料因此更难被稳定取用。一些社区实践把 40% 左右当作清理或压缩的提醒线；模型、任务类型和上下文结构不同，出现波动的位置也会变化。

![社区经验中的上下文利用率管理线](https://oss.javaguide.cn/github/javaguide/ai/harness/context-utilization-40-percent-threshold-phenomenon.svg)

第 3 轮写下“不要改数据库 schema”，到第 30 轮时，这条限制可能被搜索结果和测试日志夹在中间。这类开头与结尾更容易被注意、中间内容容易遗漏的现象，通常称为 **Lost in the Middle**。

根级 `CLAUDE.md` 和无路径限制规则会在压缩后重新注入；当前用户输入与最近工具结果位于消息末尾；旧工具返回值和过时对话会优先被清理。三者共同降低关键限制被旧内容淹没的概率。规则仍是模型指令，安全限制应交给权限规则、Sandbox 或 `PreToolUse` Hook。

窗口接近上限时，剩余空间还要留给输出和错误恢复。历史继续增长，模型可能在任务未完成前提前收束；Anthropic 将这种现象称为 **Context Anxiety**。

[Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps "Harness design for long-running application development")这篇文章中的完整描述如下：

![context-anxiety-harness-design-long-running-apps](https://oss.javaguide.cn/github/javaguide/ai/claude-code/context-anxiety-harness-design-long-running-apps.png)

旧判断、重复搜索结果、已解决问题和无用日志也会消耗注意力，即使窗口还没有临界。它们在每轮请求里反复出现，新决策却可能只有一句；这种信噪比下降的状态称为 **Context Rot**。窗口变大只能延后压力，信息过多仍会让中间位置的限制被遗漏，最后还可能进入 Context Anxiety。

## Claude Code 怎么治理上下文

工具结果可以重新获取，就不用一直占着窗口。Claude Code 会先处理这一层，再压缩历史；仍接不上任务时，才重置上下文或把支线交给子代理。

### 先清工具结果

一次 `Read` 可能返回 500 行，一次测试也可能刷出几千行日志。它们很占空间，但原始内容可以再次读取，先处理这部分的信息损失相对较低，也不需要额外调用模型。

在本文参考的 2.1.x 附近实现里，大工具结果会写入会话存储里的 `tool-results`，通常位于 `~/.claude/projects/...` 对应的会话数据下；窗口里只保留预览和文件引用。

默认阈值是约 50,000 字符，不是 50KB。不同工具还可能有更低阈值，比如 Bash / PowerShell 约 30,000 字符，Grep 约 20,000 字符。同一条消息里的工具结果合计超过约 200,000 字符时，也会优先把最大的结果写盘。

这里有个例外：`Read` 工具结果豁免 `maxResultSizeChars = Infinity`。这类没有有限阈值的工具，通常不会被 Tool Result Budget 当作大结果处理。否则会出现“读文件 -> 太大写盘 -> 摘要看到路径 -> 又读回来”的循环。

工具结果还可能由 Tool Result Budget 处理。这条路径受版本和实验开关影响，并非所有环境都会启用。其状态可分为 `mustReapply`、`frozen` 和 `fresh`。

`mustReapply` 表示之前已经被持久化或替换过的工具结果，需要重新应用替换内容；`frozen` 是已经见过、暂不再处理的结果；`fresh` 是新近产生的工具结果，在单消息预算超限时可能被挑出来写盘替换。

参考实现还包含 Snip 和 MicroCompact。Snip 删除一段历史 range 后会重连消息链，并将释放的 Token 数交给后续 AutoCompact 判断，避免刚释放空间就再次过度压缩。

MicroCompact 会把旧工具结果替换为 `[Old tool result content cleared]`。调用和引用关系仍留在消息链中，大段返回内容则被移除。

**为什么不直接删整条消息？**

后续消息可能仍引用前面的 `tool_use` ID。若直接删除调用记录，消息链会断开，模型也无法判断哪些操作已经完成。代价是丢失具体内容；后续需要精确行号时，仍要重新读取文件。

请求发出前或出现上下文压力提示时，MicroCompact 会保留最近的若干工具结果，并替换更早的结果。如果当前环境、模型或 Sub-agent 路径不支持它，流程会跳过该步骤，后续由 AutoCompact 继续处理。

另一条入口与 Prompt Cache 过期有关。两次 API 调用相隔较久、服务端缓存可能失效时，发送前清掉旧工具结果可避免全量重传继续膨胀。这条路径默认关闭，并受 GrowthBook gate 控制。

参考实现中还出现 cache prefix / cache sharing 路径：压缩时会尝试复用缓存前缀，失败后回退到常规压缩。它属于版本相关的缓存优化，不应视作稳定能力。

这层清理的边界要看信息能不能重新获取。Read、Grep、Glob、日志查询这类输出，后续需要时大多能重新跑；Edit、Write 这类有副作用的工具，不应该靠重放输出来恢复状态，而要回到文件系统里核对。子代理分析结果、任务状态快照这类一次性产物也不能随便清，因为丢了就真丢了，只能靠摘要或附件保住。

### 再压缩历史

工具结果清理完还不够，才轮到历史压缩。AutoCompact 不是唯一的压缩手段。接近窗口上限前，Claude Code 会先尝试清理较旧的工具输出；释放空间仍然不够时，才需要把会话压缩成摘要。

工具结果清掉以后，对话历史还在涨。到一定程度，就需要把旧历史改写成状态摘要。在本文观察的实现里，这件事会走一条多级流水线。官方文档能确认的是：接近上限时会先清旧工具结果，不够再摘要会话。

![五级渐进压缩流水线](https://oss.javaguide.cn/github/javaguide/ai/claude-code/ctx-mgmt-pipeline-flow.png)

| 级别 | 名称         | 动作                                       | 信息损失   | API 成本 |
| ---- | ------------ | ------------------------------------------ | ---------- | -------- |
| 0    | 大结果存磁盘 | 超过阈值的工具输出写入会话存储             | 极低       | 无       |
| 1    | Snip         | 删除一段历史 range，并重连消息链           | 极低       | 无       |
| 2    | MicroCompact | 清掉旧工具结果内容，或走 API 层 cache edit | 低到中     | 无       |
| 3    | Collapse     | 把已完成消息组折叠成状态快照               | 中         | 低       |
| 4    | AutoCompact  | 调度 Session Memory 或 LLM 全量摘要        | 取决于路径 | 高       |

大结果写盘、Snip 和 MicroCompact 能处理一部分会话。窗口占用继续上升时，流程才会进入 Collapse 或 AutoCompact。

Collapse 也属于这部分实现，比 AutoCompact 更轻。调用 API 时，它动态生成压缩视图：完整历史留在本地，模型接收折叠后的版本。

这个思路可以理解成 **视图与存储分离** 。按该实现观察到的阈值，约 90% 利用率时，Collapse 开始处理已完成消息组；约 95% 利用率时，会阻止新的 Sub-agent spawn，避免继续给上下文加压。

因为 Collapse 的信息损失更小，它通常会先于 AutoCompact 激活。折叠后仍然不够，才进入更重的全量摘要。Collapse 这类分层细节不要当成公开稳定接口。

AutoCompact 会用一份新的状态摘要替换旧聊天记录。目标、进度、决策和待办会被保留，读过哪些文件、搜过哪些关键词以及测试输出全文通常不会；需要这些细节时，Agent 需重新从文件系统读取。

![AutoCompact 压缩前后对比](https://oss.javaguide.cn/github/javaguide/ai/claude-code/ctx-mgmt-compare.png)

手动 `/compact` 与自动压缩使用同类能力，但输入参数不同。手动调用可以明确指定摘要必须保留的内容；自动调用会打开 `suppressFollowUpQuestions`，避免摘要器在中途追问。

阶段结束、`/context` 显示占用明显升高，或工具调用开始重复时，可以主动执行 `/compact` 并指定保留重点：

```text
/compact 保留数据库 schema、支付状态机和当前失败用例
```

### 压缩恢复和兜底

第三层处理压缩后的恢复和失败兜底。

**Session Memory** 是 Full Compact 前的一条快速路径。这里说的 Session Memory，是内部实现里用于压缩的会话辅助状态，不是 Claude Code 官方文档里的 Auto Memory。它会按 Token 增长和工具调用节奏刷新结构化会话笔记；触发 AutoCompact 时，如果这份笔记加上近期消息、附件和 Hook 结果已经能压到阈值以下，就可以跳过 Full Compact。

这两个名字容易混，可以先拆开看：

| 对比 | Session Memory                              | Auto Memory                                                |
| ---- | ------------------------------------------- | ---------------------------------------------------------- |
| 定位 | 当前会话里的压缩辅助笔记                    | 跨会话的项目经验记忆                                       |
| 来源 | 内部流程按 Token 增长和工具调用节奏刷新     | Claude 根据纠正、偏好和项目经验写入                        |
| 作用 | 给 AutoCompact 复用，减少 Full Compact 概率 | 会话启动时加载，给 Agent 提供长期偏好和经验                |
| 存储 | 内部实现细节，版本相关                      | `~/.claude/projects/<project>/memory/`，`MEMORY.md` 是索引 |

它也有成本，Session Memory 的更新本身需要后台模型调用。它减少的是临近窗口上限时再做一次大规模摘要的概率，同时把压缩工作分摊到了会话执行过程中。

在本文观察的实现里，Session Memory 不是会话一开始就启动。首次达到约 10,000 Token 后才初始化。

后续更新也有节奏：通常要再增长约 5,000 Token，并且累计一定数量的工具调用，或者刚好处于没有工具调用的自然断点，才会刷新笔记。

笔记模板按固定章节组织，比如 Current State、Task specification、Files and Functions、Errors & Corrections 等。每个 section 的软上限约 2,000 Token，全文硬上限是 12,000 Token；超过硬上限时，会提示模型 `MUST condense`。

在 Session Memory compact 开启、且已有有效 Session Memory 时，AutoCompact 会优先尝试复用它：用笔记、近期消息、附件和 Hook 结果组装新消息链，估算 Token 是否低于阈值。如果能降到阈值以下就跳过 Full Compact；如果笔记为空、消息边界找不到，或者组装后仍然太大，则退回完整摘要。

**Full Compact** 自己也可能因为输入太长而报 `prompt_too_long`。在手动 `/compact` 或 AutoCompact 触发 Full Compact 时，如果摘要请求自身报 `prompt_too_long`，系统会进入 **PTL（Prompt Too Long）** 兜底路径。

按 API round 分组的目的，是保证 `tool_use` 和 `tool_result` 不被拆散。如果错误里带了 `tokenGap`，系统可以按超出的 Token 量更精确地丢弃；没有 `tokenGap` 时，就会按更粗的比例处理，比如先丢掉约 20% 的旧消息组。Reactive Compact 是另一条从 API `prompt_too_long` 错误恢复的路径，也会截断消息后重试；具体截断方向和策略属于版本相关实现，不建议统一写死。

这套实现里的 **Partial Compact** 同时解决两个问题：只压缩一段历史以减少状态损失，以及在某些方向上尽可能保留缓存前缀。Full Compact 通常会重建主要消息链，原缓存前缀基本失效；Partial Compact 只压缩一段历史，尽量保留一端消息以复用缓存。压缩不能只看压缩率，还要看压完以后缓存、接续、信息损失三件事怎么平衡。

Partial Compact 有两个方向：

1. `from`：压缩 pivot 之后的消息，保留更早的部分。适合已经有一段早期摘要的长会话，同时更有利于复用缓存前缀；
2. `up_to`：压缩 pivot 之前的消息，保留最近的部分。适合 Agent 正在处理某个文件或 Bug，中间状态不应被摘要打断。但由于摘要插到了保留消息之前，原缓存前缀通常会失效。

Full Compact 使用的是一份结构化摘要 Prompt，不是简单要求模型“总结一下”。

Full Compact 的摘要 Prompt 会在首尾限制工具调用：该步骤只应产出文字，不应再执行 `Read`、`Write` 或 `Bash`，否则会引入新的工具结果。模型先在 `<analysis>` 中整理信息，再把后续会话需要的内容写入 `<summary>`；只有后者会成为接续材料。

`<summary>` 按固定章节组织，包括 Primary Request and Intent、Key Technical Concepts、Files and Code Sections、Errors and fixes、Problem Solving、All user messages、Pending Tasks、Current Work 和 Optional Next Step。

`All user messages` 记录的不只是历史：用户补充的需求、方向和限制会改变后续判断，遗漏后 Agent 可能接错任务。`Current Work` 也应写明文件名、函数名、失败用例和下一条命令；“正在排查模块问题”不足以让压缩后的 Agent 直接继续。

参考实现还显示，不同模型版本对压缩 Prompt 的遵循程度可能不同。例如在特定配置下，新版模型尝试调用工具的比例明显高于旧版。也就是说，压缩规则要随模型版本重新验证，不能假设一句“不要调用工具”在所有模型上都同样管用。

压缩完成后，Claude Code 会在本地会话事件 / JSONL 中写入 `subtype: "compact_boundary"` 的 system 记录。样例里的 `compactMetadata` 主要记录 `trigger`、`preTokens` 等信息，部分路径还会带 `preservedSegment`。压缩后的 Token 数可能出现在压缩结果或 telemetry 里，不适合当成 boundary metadata 的稳定字段。边界标记告诉后续加载器：历史在这里已经被摘要替换，别把它当成普通对话继续拼。

本地记录里能看到类似这样的结构，字段会随版本变化：

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "content": "Conversation compacted",
  "compactMetadata": {
    "trigger": "manual",
    "preTokens": 160442,
    "preservedSegment": {
      "headUuid": "...",
      "anchorUuid": "...",
      "tailUuid": "..."
    }
  }
}
```

Full / Partial Compact 结束后，新的消息链通常包含边界标记、摘要消息、附件和 Hook 结果。Session Memory compact 的恢复范围更窄，主要围绕 summary、保留消息、plan 和 hook。最近访问的文件、活跃计划、当前 Skill、后台任务状态会受到数量和 Token 预算限制；System Prompt 则不参与摘要，压缩后会重新组装最新的工具列表、权限设置和 MCP Server 列表。

压缩后不应把此前读过的文件全量重新加载，否则很容易回到“压缩 -> 膨胀 -> 再压缩”的循环。恢复当前任务必需的文件即可。

系统会重新估算边界标记、摘要、恢复附件和 Hook 结果构成的实际消息载荷；若其仍接近阈值，下一轮可能立刻再次压缩。部分临时状态和缓存也会按实现路径重置，具体清理项随版本变化。

附件恢复需要按相关性取舍。最近访问的文件、活跃 Plan、正在使用的 Skill 和后台任务状态都可能帮助 Agent 接续任务，但也会占用窗口。源码路径常按最近访问、文件数 / Token 预算、排除规则和 preserved tail 去重约束筛选；例如处理支付状态机时，应恢复状态机文件、失败测试和相关计划，而非此前顺手读过的日志或无关模块。

项目根级 `CLAUDE.md` 与无路径限制规则会在压缩后从磁盘重新注入，无需重复写入摘要。子目录 `CLAUDE.md` 和带 `paths` 的规则则会等到再次读取匹配文件时才重新加载。

为压缩选择更便宜的模型时，要同时评估摘要保真度、额外探索成本和缓存命中情况。模型价格只是一个变量，判断标准仍是压缩后能否准确接续任务。

### 重置、隔离和断路器

第四层就不再执着于“把旧窗口救回来”了。Compaction 是在旧上下文上修补，修补次数多了，细节损失会叠加。到了某个点，继续压不如直接重开。Context Reset 的做法是清空窗口，把当前状态写成交接文档，新的 Agent 从交接文档恢复。

![上下文重置交接流程](https://oss.javaguide.cn/github/javaguide/ai/claude-code/ctx-mgmt-reset-flow.png)

Anthropic 在基于 Sonnet 4.5 的特定长任务 Harness 中观察到，模型接近上下文上限时会草草收尾，也就是 Context Anxiety。这个场景下，单靠 Compaction 不够。

Reset 配合结构化 handoff 的作用，是丢掉旧上下文，只用 handoff 留住关键信息，让新的 Agent 接着干。

但这不是长任务的固定必选步骤。后来切换到 Opus 4.5 后，同一个 Harness 已经可以移除 Reset，只依赖自动压缩。因此 Reset 更像模型和任务相关的工程手段，而不是通用流程。

Reset 的风险也清楚，交接材料是主要桥梁。它不一定只有一份 Markdown，也可以包括进度文件、失败测试记录、Git diff、任务列表和关键日志。漏了边界条件、临时决策、失败原因，新 Agent 就会在缺信息的状态下继续跑。

新会话要从上一次执行点继续，handoff 至少保存目标和完成标准、已完成工作、当前文件与函数、排除方案、失败用例或错误日志，以及接手后的第一步：

```text
1. 当前任务目标：一句话说明最终要交付什么
2. 已完成工作：列出已经改完和验证过的部分
3. 当前断点：写到文件、函数、测试用例或命令
4. 关键约束：不能改什么、必须兼容什么、用户特别强调过什么
5. 排除记录：试过哪些方案，为什么放弃
6. 当前故障：失败日志、报错栈、复现步骤
7. 启动动作：新会话接手后先看哪个文件或先跑哪条命令
```

只有“继续完成剩余任务”这一句时，改过的文件、失败测试和已排除的方案都不会随新会话出现。

分析几千行日志、跨文件定位或独立审查时，主会话通常不需要看到全部过程。Sub-agent 在独立窗口完成这些支线后，只回传摘要和必要证据；全文日志与中间试错留在子代理历史中。

![Claude Code Sub-Agent：让主对话保持干净](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode-sub-agent.png)

主会话只需根因和证据的日志任务适合拆出。任务小到几步就能完成、子任务频繁相互等待，或边界本身说不清时，调度和摘要反而会带来额外成本。

子代理启动时获得的上下文也不同：

| 模式                      | 上下文行为                                                                              | 适合场景                                 |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| Named / non-fork Subagent | 不继承父会话消息历史；但仍会加载工具 / 权限、`CLAUDE.md` / memory、Git 状态等运行上下文 | 隔离搜索噪声、日志分析、独立审查         |
| Fork                      | 继承父会话上下文，而不是从空窗口启动                                                    | 背景依赖重、需要沿用父会话状态的支线任务 |

两种模式都只把结果返回主会话。拥有 `Agent` 工具的子代理可以继续派生，深度到 5 层后不再提供该工具；Fork 不能继续生成 Fork。

主会话压缩后不会重新载入子代理的完整 transcript，只恢复摘要和少量元数据。

### 断路器

Circuit Breaker 是自动压缩的硬保护。官方文档说明：某个大文件或工具输出导致每次摘要后窗口迅速再次填满时，Claude Code 会在多次尝试后停止自动压缩，避免重复消耗 API 调用。

参考实现使用连续失败计数：AutoCompact 成功后清零，连续失败达到 `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`（3）时，后续请求跳过 AutoCompact。

```text
自动压缩
  -> 摘要后很快再次填满，或者压缩失败
连续失败计数增加
  -> 达到 3 次后跳过 AutoCompact
```

没有这层保护，会话会陷入“压缩 -> 立刻膨胀 -> 再压缩”的循环。若 AutoCompact 未及时执行、API 已返回 `prompt_too_long`，Reactive Compact 会从错误中恢复，截断消息后重试。

### 总结

可以按信息是否可重新获取来安排处理顺序：

| 上下文压力来自哪里     | 优先处理方式                             | 代价                                 |
| ---------------------- | ---------------------------------------- | ------------------------------------ |
| 工具输出太长           | 写盘、MicroCompact，必要时 Snip 历史片段 | 信息损失低，通常不需要额外模型调用   |
| 对话历史太长           | Collapse、AutoCompact、Full Compact      | 会丢一部分过程细节，需要摘要质量兜底 |
| 主会话被搜索和日志拖脏 | Sub-agent 隔离支线任务                   | 多一次调度，主会话只接收摘要         |
| 压缩后仍然接不住任务   | handoff + Context Reset                  | 交接文档写漏了，新会话就会缺信息     |

日常使用时，先清理可重新获取的工具结果；历史过长再压缩；搜索、审查和日志分析交给 Sub-agent；压缩后仍无法稳定接续，再写 handoff 并重开会话。处理越靠后，信息损失和调度成本越高，因此不应一开始就 Reset。

## 长任务怎么落地

### 两个极端案例

Anthropic Labs 团队在 2026 年发了一个受 **GAN（Generative Adversarial Network，生成对抗网络）** 思路启发的三智能体架构：

![Anthropic 三智能体架构](https://oss.javaguide.cn/github/javaguide/ai/claude-code/ctx-mgmt-triagent-arch.png)

Planner 把 1-4 句话的产品描述扩成完整规格，Generator 按 Sprint 实现功能，Evaluator 再用 Playwright MCP 实际操作运行中的应用，并按产品设计深度、功能性、视觉设计和代码质量打分。角色分工让规划、实现和评估各自保有独立上下文。

早期基于 Sonnet 4.5 的 long-running Harness 用 Context Reset 缓解 Context Anxiety。到 Opus 4.5 的三智能体 Harness，Anthropic 改用连续会话，由 Claude Agent SDK 的自动压缩控制上下文增长。

- Planner 只做规划，不背实现细节；
- Generator 每个 Sprint 后借助自动压缩控制历史长度，避免历史拖住后续实现；
- Evaluator 独立评估，不受 Generator 的上下文污染。

两种配置的成本与结果如下：

| 配置                                | 耗时    | 花费  | 效果             |
| ----------------------------------- | ------- | ----- | ---------------- |
| Solo Harness，单 Agent + 最少工具   | 20 分钟 | \$9   | 跑不起来的半成品 |
| Full Harness，三 Agent + 完整工具链 | 6 小时  | \$200 | 完整可用的应用   |

Carlini 的案例更极端：16 个并行 Claude Opus 实例、约 2,000 个独立会话，持续约 2 周。

最后产出 10 万行 Rust 代码，GCC torture test 通过率 99%，API 成本约 2 万美元。

这里的关键是把工作分到大量独立会话中并行推进。日志写入文件而不刷到控制台，测试也做子采样：每个 Agent 只跑 1%-10% 用例，避免测试输出占满窗口。

Carlini 后来在 [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler "Building a C compiler with a team of parallel Claudes") 里说过一句话：

> “I had to constantly remind myself that I was writing this test harness for Claude and not for myself.”

在 Carlini 的分工中，核心编译器、去重、性能优化、代码质量和文档逐渐由不同角色负责。LLM 容易重复实现已有功能，单独安排去重角色能减少主 Agent 同时编码、查重复和维护历史的负担。

模型升级也会改变 Harness 的取舍。Anthropic 从 Opus 4.5 升到 Opus 4.6 后，移除了原有 Sprint 机制，并把逐 Sprint 的强约束评估收敛为末尾集中 QA / 少量评估轮。拆分、检查和重置都依赖模型能力假设，版本变化后需要重新验证。

日常项目当然不需要三智能体，也不需要 2,000 个独立会话。先判断任务会消耗多少代码上下文。

### 日常项目怎么选

我自己在面试平台项目里踩过一次坑。一个任务跨了好几个模块，我当时觉得单 Agent 能扛住。结果跑到中途 Claude Code 自己停了，上下文撑爆。后来改成 Sub-agent 并行：每个子任务只看自己负责的模块，最后把摘要交回主 Agent，才一次完成。

| 任务规模                   | 推荐策略                                             | 上下文管理方式                                  |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| 小：单文件修改、补一个函数 | 单 Agent                                             | 工具结果自动清理足够                            |
| 中：一个模块或一个功能     | 单 Agent + 主动 Compaction                           | 阶段结束或 `/context` 显示占用升高时 `/compact` |
| 大：跨模块重构、新子系统   | 主 Agent + Sub-agent                                 | 搜索、审查、日志分析交给子代理                  |
| 超大：长期迭代或独立系统   | 多 Agent + handoff / Reset，或连续会话 + AutoCompact | 阶段切换写 handoff，是否 Reset 取决于模型和任务 |

`/compact`、Sub-agent、`/context` 的命令细节，可以看之前的 [Claude Code 使用指南](https://javaguide.cn/ai-coding/claudecode-tips.html "Claude Code 使用指南") 和 [Claude Code 核心命令详解](https://javaguide.cn/ai-coding/claudecode-commands.html "Claude Code 核心命令详解")。

我一般不会等 AutoCompact 贴线才动。`/context` 到七成左右，或者已经出现重复搜索、忘约束的苗头时，手动 `/compact` 并告诉它要保留什么，摘要器手里会有更清楚的重点。等系统被动触发，窗口里往往已经混进旧日志、旧判断和一堆临时探索结果。

探索阶段结束时，可以把模块边界、关键文件、排除方案和失败测试写入压缩指令：

```text
/compact 保留模块边界、关键文件、已排除方案、当前失败测试
```

数据库问题则应把需要接续的 Schema、迁移和失败 SQL 写明：

```text
/compact 保留所有数据库 schema、迁移脚本、实体关系和当前失败 SQL
```

跨模块任务读完文件并确认模块边界后，可以先执行一次压缩；方案、约束和风险确定后，再压缩一次；代码改完并完成验证后更新状态。`PLAN.md` 或 `design.md` 保存关键状态，摘要传递目标、取舍和下一步，行号、失败 SQL、接口细节仍留在文件中。

多文件项目可以按场景选策略：

| 场景                 | 推荐做法                                            |
| -------------------- | --------------------------------------------------- |
| 一次性读了大量文件   | 用 MicroCompact / Snip / 压缩清掉已完成分析的旧内容 |
| 中断很久后继续       | 让系统清理过期工具结果，必要时重新读关键文件        |
| 连续推进多个独立功能 | 每完成一个功能就压缩一次                            |
| 横跨多个模块大改     | 按阶段拆分，阶段末压缩并更新笔记文件                |
| 大量日志或测试输出   | 只保留失败摘要、复现命令和关键栈，不保留全量输出    |
| 需要并行搜索或审查   | 派给 Sub-agent，主 Agent 只接收摘要                 |

探索阶段读过的大量文件，后续通常只需保留结论；设计阶段的约束和取舍需要留下；可复现的失败日志不必长期保留全文。信息稳定到这个程度时，再执行压缩更合适。

### 状态外化、记忆和 Hooks

`TaskCreate`、`TaskUpdate` 等 Tasks API 把大目标拆成任务节点，记录 `pending`、`in_progress`、`completed` 等状态与依赖关系，并持久化为结构化任务列表（内部存储格式不属于稳定接口）。Agent 通过 Task Tools 读取当前进度，不必依赖对话历史回忆“做到哪了”。

多个 Agent 同时写同一仓库时，worktree 隔离能让各自的 `git status` 只显示本人的改动。全量测试、跨文件搜索和大模块分析可以放到后台，完成后只回传摘要；压缩时仍在运行的任务状态会作为附件重新注入新上下文。

同样的原则也用于记忆：只记录源码无法推导的内容。

| 该记                             | 不该记                                    |
| -------------------------------- | ----------------------------------------- |
| 用户偏好，比如编码风格和语言习惯 | 项目目录结构，执行 `glob` 能查到          |
| 项目特有约定，比如 API 前缀      | 接口函数签名，源码里有                    |
| 某次技术决策的原因               | 依赖版本，`package.json` / `pom.xml` 里有 |
| 踩过的坑和修复方法               | Git 提交历史，`git log` 能查到            |

会话历史只服务当前会话，之后可能被压缩。用户或项目写入的持久指令放在 `CLAUDE.md` / Rules；Auto Memory 按 Git 仓库保存经验笔记，默认路径为 `~/.claude/projects/<project>/memory/`，可由 `CLAUDE_COWORK_MEMORY_PATH_OVERRIDE` 或可信 settings 中的 `autoMemoryDirectory` 覆盖。会话启动时只加载 `MEMORY.md` 的前 200 行或 25KB。

![Claude Code Auto Memory](https://oss.javaguide.cn/github/javaguide/ai/skills/claude-code-auto-memory.png)

记忆文件变多后，启动时只加载索引；需要具体细节再打开对应文件。

有些 Agent 项目也会把 `AGENTS.md` 当索引用。

![CLAUDE.md 和 AGENTS.md](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-agents-md.png)

可以参考 [Harness Engineering: Why Coding Agents Need Infrastructure](https://alexlavaee.me/blog/harness-engineering-why-coding-agents-need-infrastructure/ "Harness Engineering: Why Coding Agents Need Infrastructure")。这类文件负责告诉 Agent “资料在哪、什么时候读”，不是把所有资料提前塞进上下文。

官方 Auto Memory 按 Git 仓库存储，同一仓库的不同 worktree 共享同一份记忆。

个人规则、项目规则、组织规则会叠加进窗口，不要指望后加载的那条自动盖掉前面的偏好。项目里如果一定要压过个人习惯，就在项目规则里写明优先级。

面试时问“Agent 怎么实现跨会话记忆”，回答“存到文件里”太薄了。更完整的答法是：只存源码里查不到的信息，按作用范围分层，启动时先加载轻量索引，需要时再读细节，别把整份记忆塞进窗口。

按官方文档看，三类持久化信息可以这样放：

| 类型              | 作用                             | 存储                                                                                                                                                    |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 会话历史          | 当前任务临时状态，可能被压缩     | 内存中的 `messages[]`                                                                                                                                   |
| CLAUDE.md / Rules | 用户、项目、组织写入的持久指令   | 项目 `.claude/` 或 `~/.claude/`                                                                                                                         |
| Auto Memory       | Claude 按 Git 仓库维护的经验笔记 | 默认在 `~/.claude/projects/<project>/memory/`，可被 `CLAUDE_COWORK_MEMORY_PATH_OVERRIDE` 或可信 settings 覆盖；`MEMORY.md` 是索引入口，跨 worktree 共享 |

![Claude Code  /memory](https://oss.javaguide.cn/github/javaguide/ai/skills/claudecode-memory-command.png)

临时绕过 Bug 的方案一旦写入项目记忆，后续会话可能继续沿用错误前提。文件路径、依赖版本和函数签名可直接从源码查询，无需重复记录；条目增加会抬高固定开销，错误条目还会持续影响判断。

还有一部分固定开销来自配置。Claude Code 的普通配置键遵循这条优先级：

```text
Managed（组织托管）> CLI 参数 > 项目本地 > 项目共享 > 用户配置
```

权限、Sandbox 路径等数组类型配置是例外，可能采用合并和去重规则，而不是简单覆盖。

项目配置新增 5 条规则、用户配置新增 3 条、MCP 再增加 2 个服务时，规则、权限和工具定义合起来可能占用几千 Token。通用规则放在全局，项目特有规则放在项目级，可以减少重复注入。

Hook 用于在指定节点干预上下文：`SessionStart` 注入记忆，`PreCompact` 追加压缩指令，`PostCompact` 负责通知或展示；`PostToolUse` 调整 MCP 工具输出，`PreToolUse` 判断工具是否允许执行。

Hook 输出会进入上下文，因此并非没有成本。外部网页、脚本输出或临时文件混入脏指令时，也可能带来 prompt injection。普通编码项目通常使用内置清理、压缩和断路器即可。

下表列出这些 Hook 介入上下文的时机：

| 事件                         | 触发时机       | 上下文管理作用                   |
| ---------------------------- | -------------- | -------------------------------- |
| `SessionStart`               | 会话开始       | 注入记忆、环境信息               |
| `InstructionsLoaded`         | 规则加载后     | 通知、审计观察                   |
| `PreToolUse`                 | 工具调用前     | 判断工具是否允许执行             |
| `PostToolUse`                | MCP 工具返回后 | 调整 MCP 工具输出                |
| `PreCompact` / `PostCompact` | 压缩前后       | 压缩前追加指令，摘要后通知或展示 |

每多一个 Hook，就多一份可能进入上下文的输出。团队项目存在强领域约束、合规审计或工具输出清洗需求时，再为这些场景配置 Hook。

## 面试回答版本

我们可以把上下文管理看成有限工作内存的治理。Agent 做长任务时，要同时带着任务目标、项目规则、已读代码、工具输出、计划和中间结论继续推理。窗口一直累积，旧日志、重复搜索结果和已经解决的问题就会挤占注意力；接近上限时，模型还可能因为可用输出空间不足而过早收束任务。

我会先区分两类信息。一次搜索搜到的几十条结果、全量测试日志、已经确认过的长文件原文，之后都能再取，不值得一直占着窗口。任务目标、业务约束、关键决策、失败用例、已修改文件和下一步则必须留下来；这些信息会被压成能继续执行的摘要，再写进 `PLAN.md`、设计文档或任务文件，避免只存在某一轮对话里。

放到 Claude Code 里，我会让它先处理可重新获取的工具结果，历史过长时再执行 `/compact`，保留目标、约束、决策和待办。如果压缩后仍需要换会话，handoff 至少会写清当前改动、失败测试、已排除的方案和下一步验证方式。对于日志分析、跨文件搜索、独立审查这类支线，我会交给 Sub-agent，主会话只接收结论和必要证据，不把完整过程重新塞回来。

所以判断上下文管理是否做好，不看窗口里存了多少信息，而看任务能不能在压缩、换会话或拆分后继续接上：窗口服务当前推理，文件系统保存可复用、可追溯的任务状态。

## 总结

窗口被占满时，先处理工具结果、测试日志和搜索输出等可重新获取的临时材料；阶段结束后再压缩过长的对话历史。搜索、审查和日志分析等支线放到 Sub-agent，主会话只保留结论。

若压缩后的会话仍无法接续，handoff 要交代失败用例、临时约束、正在修改的文件和已排除的方案，再由新会话处理。Plan、Spec、失败 SQL 和设计取舍等后续仍会使用的信息，写入 `PLAN.md`、`design.md`、`NOTES.json` 或项目自己的任务文件。这样，窗口只保留临时材料，文件系统负责保存任务状态。
