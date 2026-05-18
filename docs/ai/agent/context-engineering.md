---
title: 上下文工程实战指南：让 Agent 少犯蠢的工程方法论
description: 深入解析 Context Engineering 核心概念，涵盖静态规则编排、动态信息挂载、Token 预算降级、按需加载策略及长任务上下文持久化，帮助开发者构建高信噪比的 Agent 上下文供给系统。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Context Engineering,上下文工程,Agent,LLM,RAG,Prompt Engineering,Compaction,Sub-agent
---

同样的模型，同样的 Agent 框架，为什么有的人跑起来很稳，你的一跑就开始迷路？

它会重复调用工具，查了一堆没用的信息，最后还输出一段看起来很像结论、实际根本跑不通的东西。

很多时候，问题不在模型，而是出在上下文。Agent 每次调用 LLM 前，窗口里到底塞了什么，塞得干不干净，顺序对不对，工具描述够不够清楚，都会直接影响最后表现。

这篇文章聊 Context Engineering。说白了，就是怎么给 Agent 准备一套高质量的上下文供给系统。

文章比较长，接近 6000 字。看完你大概能搞清楚几件事：

1. 为什么上下文会决定 Agent 表现
2. Context Engineering 和 Prompt Engineering 到底差在哪
3. 静态规则、动态信息、Token 预算、按需加载怎么落地
4. Compaction、结构化笔记、Sub-agent 怎么解决长任务上下文问题

## 同样的 Agent，为什么表现差这么多

先看一个很常见的电商售后场景。

用户发来一句话：

> “我上周买的耳机右耳没声音了，怎么处理？”

如果 Agent 拿到的上下文很少，它大概率会这么回：

```text
User: 我上周买的耳机右耳没声音了，怎么处理？
Model: 抱歉给您带来不便。请问您购买的是哪款耳机？订单号是多少？能否描述一下具体故障表现？
```

这段回复不能说错，但它像一个刚上岗的客服新人，只会照着流程追问。代码逻辑没问题，LLM 调用也没问题，就是没有主动整合信息。

换一个上下文充足的版本。

在调用 LLM 之前，系统先把该查的信息查出来：

- 查订单系统，定位到上周购买记录：索尼 WH-1000XM5，3 月 25 日下单
- 查保修状态，发现还在 7 天无理由退换期内
- 查历史工单，发现用户是老客户，之前没有售后纠纷
- 挂载 `create_return_order` 和 `check_inventory` 工具

这时候 Agent 就可以这样回复：

> “您好，查到您 3 月 25 日购买的索尼 WH-1000XM5，目前还在退换期内。我这边直接帮您发起换货申请，仓库显示同款有库存，预计 2-3 天寄出新品。需要我操作吗？”

差距一下就出来了：前一个 Agent 在要信息，后一个 Agent 在解决问题。

**Agent 的很多失败，根子都在上下文。** 上下文不够，模型再强也只能猜；上下文给对了，中等水平的模型也能把任务做下去。

## Context Engineering 到底在做什么

### 它和 Prompt Engineering 差在哪

Tobi Lutke 对 Context Engineering 有个说法：

> the art of providing all the context for the task to be plausibly solvable by the LLM

意思是：给 LLM 提供足够上下文，让这个任务在模型能力范围内“有可能被解决”。

这里的关键词是 plausibly——它不是说上下文给够了模型就一定能解决，而是强调如果没有这些上下文，任务压根就不具备可解条件。

很多文章会把 Context Engineering 和 Prompt Engineering 混着讲，但这两个东西关注点不一样。

Prompt Engineering 更关心指令怎么写，比如措辞、顺序、格式、语气。

Context Engineering 关心的是这轮调用前，模型窗口里应该放哪些信息，以什么结构放，什么时候放，什么时候撤掉。

下面这张图来自 Anthropic 官方博客，对比很直观：

![Prompt engineering vs. context engineering](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-prompt-engineering.png)

如果把 Prompt Engineering 比成“告诉厨师这道菜怎么做”，那 Context Engineering 更像是给厨师准备厨房：食材在哪、刀具在哪、调料怎么分类、火候参考在哪里。

![Prompt vs Context 工程维度对比](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/prompt-vs-context-engineering-dimension-comparison.svg)

我更喜欢另一个类比：Context Engineering 是 LLM 的内存管理。

LLM 的上下文窗口就是一块有限内存。Context Engineering 管的是这块内存里装什么、换出什么、什么时候读、什么时候写。

窗口满了，就要淘汰内容。这和操作系统里的页面置换有点像，比如 LRU、优先级策略。后面讲 Token 降级时，也是在处理这个问题。

### 它具体管哪些东西

拆开看，Context Engineering 至少管六块。

**System Prompt**

这是静态规则，比如 `.cursorrules`、`.claude/rules`、`AGENTS.md` 这类文件。里面一般会放角色设定、目标、约束、执行流、输出格式。

这些内容决定了 Agent 做任务时的基本边界。

**User Prompt**

用户输入的业务数据和指令。

这部分看起来简单，但真实项目里经常会混着自然语言、业务字段、历史状态、附件内容，处理不好就会污染上下文。

**Memory**

记忆系统分短期和长期。短期记忆一般是 Session 内的滑动窗口，长期记忆通常是核心事实提取后写入向量数据库，后续按需检索。

**RAG & Tools**

RAG 负责检索外部文档，把相关内容塞进上下文；Tools 负责把可调用工具的描述、参数格式、调用结果挂载进去。

RAG 可以看作 Context Engineering 的一种实现。它回答的是：检索什么、怎么检索、结果怎么放进上下文。

**Structured Output**

结构化输出也属于上下文的一部分，比如 JSON Schema、function call 的返回结构。

它会影响下游系统怎么解析，也会影响后续 Agent 链路怎么衔接。很多人写 Agent 时会忽略这块，最后解析阶段一堆脏活。

**Token 优化**

摘要压缩、历史剔除、Context Caching 都属于这里，目标很简单：保留信息完整度，同时控制 Token 消耗。

![上下文窗口（Context Window）= LLM 的工作记忆](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

## Context Engineering 怎么落地

### 先把静态规则写清楚

静态规则可以理解成 Agent 的“出厂设置”。

现在比较常见的做法，是用结构化 Markdown 写系统提示词。不要把所有东西揉成一大段，而是拆成角色、目标、约束、执行流、输出格式。

比如一个故障排查 Agent，可以这样写：

```markdown
## 角色

你是一个后端服务故障排查专家，擅长通过日志和监控数据定位问题根因。

## 约束

- 只调用必要的工具，不重复调用相同逻辑的工具
- 发现关键信息时立即停止搜索，输出结论
- 优先使用实时数据而非历史推断

## 执行流

1. 查监控指标（CPU/内存/网络）
2. 查对应时间范围的日志
3. 如发现异常调用链，追踪上下游依赖
4. 输出结构化报告：问题描述 → 根因 → 建议修复方案

## 输出格式

使用 JSON，包含字段：incident_summary, root_cause, evidence, recommendation
```

这些规则可以固化到 `.cursorrules` 或 `AGENTS.md` 文件里。

现在模型越来越强，对 Prompt 细节没以前那么敏感了。但结构化规则依然值得做。它的价值不只是提升模型表现，还方便团队维护。

一个团队里，如果每个人都靠口头经验写 Agent 规则，后面一定会乱。

### 动态信息别一股脑塞进去

上下文窗口不是垃圾桶，很多 Agent 失败不是信息不够，而是塞了太多无关信息。

动态挂载主要看两块：第一块是工具懒加载，也就是 Tool Retrieval。

当 Agent 面对大量 MCP 工具时，把所有工具描述一次性塞进去，既浪费 Token，也会增加误调用概率。

更合理的做法是：先通过向量检索找出当前任务最相关的 Top-5 工具定义，再挂载进去。

这和人查手册差不多。你不会把整本手册背下来，而是先翻到相关章节。

不过这里也有个现实限制。Anthropic 更强调在设计阶段就精简工具集，别把工具集合做得过度膨胀。工具太多，后面再做检索也只是补救。

第二块是动态记忆和 RAG。

短期记忆可以用滑动窗口管理，长期事实通过向量数据库检索。API 报错日志、工具返回结果这类 Observation，最好先让 LLM 做一次摘要，只把关键信息写回上下文。原始日志洪流直接塞进去，很容易把模型淹没。

### Token 不够时要会降级

长任务跑到后面，窗口一定会紧张，这时候不能靠感觉删内容，得有优先级。

![上下文 Token 预算的三级淘汰策略](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-token-budget-three-level-elimination-strategy.svg)

| 优先级               | 内容                                 | 处理方式                 |
| -------------------- | ------------------------------------ | ------------------------ |
| 低优先级（可折叠）   | 早期对话历史                         | AI 摘要压缩              |
| 中优先级（可精简）   | RAG 检索的背景资料                   | 二次裁剪，保留核心段落   |
| 高优先级（绝对保护） | System Constraints、当前核心工具描述 | 永不丢失，确保逻辑一致性 |

低优先级内容可以折叠，比如早期对话历史不一定要保留原文，压缩成摘要就行。中优先级内容可以精简，比如 RAG 检索出来的资料没必要整段保留，可以二次裁剪，只留和当前任务直接相关的片段。高优先级内容不能丢，System Constraints、当前核心工具描述、关键任务目标这些一旦丢了，Agent 很容易开始乱跑。

大规模并发场景里，还可以配合 Context Caching。相同的 System Prompt 不用每次重复加载，可以降低首 Token 延迟和推理成本。

## 上下文为什么会失效

很多人直觉上会觉得：窗口越大，塞的信息越多，模型应该表现越好。实际不是这样——上下文存在边际收益递减，塞过头之后效果还可能变差。

原因和 Attention 机制有关。Transformer 里，每个 Token 都要和上下文里的其他 Token 计算注意力关系。n 个 Token 会产生 n² 量级的注意力计算。

当上下文从 1K 扩展到 100K Token，问题不只是“信息被稀释”这么简单。

真正麻烦的是，模型要在更多 Token 之间判断哪些相关、哪些不相关。上下文越长，噪声越多，信号越难被挑出来。

这就是 Context Rot，也就是上下文腐化。

随着上下文 Token 总量增加，模型整体的信息回忆能力会下降。和它相关的，还有 Lost in the Middle 问题：模型对上下文中间位置的信息记忆更弱，对开头和结尾更敏感，整体呈 U 型分布。

这两个现象都说明一件事：上下文不是越长越好。还有一个训练层面的原因。

模型的 Attention 模式主要是在相对短的文本序列上学出来的。互联网文本的平均长度远低于现在一些模型支持的上下文窗口。

这意味着模型处理超长依赖时，学习经验本来就不足。位置编码外推能力也有限。虽然有 Position Encoding Interpolation，比如基于 RoPE 的 YaRN、NTK-aware Interpolation，用来缓解长序列外推问题，但精度损失不会完全消失。

工程上别迷信窗口大小，不同模型的衰减曲线不一样，有些退化平缓，有些退化很陡，具体阈值要靠实测。但有一点可以确定：上下文必须当作有限资源来管，真正要找的是高信噪比平衡点，而不是把窗口塞满。

## 怎么构建有效上下文

### System Prompt 别写成两种极端

System Prompt 常见两个问题。

第一个是过度设计。有些工程师会把大量 if-else 逻辑硬塞进 Prompt，试图精确控制 Agent 的每一步，结果是 Prompt 又长又脆弱，像纸片房——维护成本很高，遇到没见过的边缘情况，模型照样会跑偏。

第二个是过度抽象。只写一句“你要做一个有帮助的助手”，模型拿不到足够决策依据，要么不停追问用户，要么输出和业务预期偏得很远。

比较好的状态是：具体到能引导行为，抽象到能覆盖常见变化。

Anthropic 工程博客里提到过一个词，叫 Goldilocks zone，也就是刚刚好的区域。

![上下文工程过程中的系统提示](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/calibrating-the-system-prompt.png)

实操上可以这么做：先用最小 Prompt 测基线表现，再根据 failure case 一条一条补规则，不要第一天就试图穷举所有情况。Anthropic 把这件事叫 Calibrating the system prompt——System Prompt 应该像一个持续调校的参数，不应该是一份写完就不再动的配置文档。每发现一个 failure case，就补一条清楚的规则，然后重新测试。

### 工具描述要先讲边界

工具定义写得好不好，直接决定 Agent 会不会选错工具。

一个好的工具描述要回答两个问题：什么时候该调用？什么时候不该调用？如果一个工具描述连人类工程师都看不出该不该用，Agent 也一定会犯错。

最常见的坑，是做一个“大而全”的工具。比如 `manage_database`，里面同时包含建表、查数据、删数据、备份、导出五个能力。Agent 选择工具时会犹豫，填参数时也容易被一堆无关字段干扰。

很多人觉得工具描述越详细越好，其实重点不是面面俱到，而是边界清楚。做到两条就行：一个工具只做一件事，参数描述里给格式示例。这两条做到，误调用率通常会明显下降。

### Few-shot 示例别堆太多

Few-shot prompting 很有用，但很多人用法不对。典型错误是往 Prompt 里塞几十个 edge case，试图覆盖所有规则，结果模型可能过度拟合示例表面的写法，反而忽略真正该学的处理逻辑。

更稳的做法是选 3-5 个多样化的典型示例，也就是 canonical examples。“Canonical” 的意思不是把所有边缘情况列全，而是每个示例能代表一类标准场景。对模型来说，示例像一张图——它展示的是“什么情况该用什么策略”，不是“这个输入必须对应这个输出”。

## 运行时上下文怎么检索

### 预检索为什么不够

传统 AI 应用常用预检索，也就是在调用 LLM 之前，先通过 Embedding 相似度找出最相关的上下文，然后一次性塞进 Prompt。

简单问答场景里，这套机制还挺好用，但到了复杂 Agent 任务里，它会暴露问题。

预检索拿到的是“调用前看起来相关”的信息，但 Agent 执行过程中会不断发现新线索，而这些线索在预检索时根本还不存在。

### Just-in-Time 按需加载

Just-in-Time 的思路是：不要一开始就装载所有可能相关的信息。

Agent 运行时先维护轻量级引用，比如文件路径、数据库查询、Web 链接。真正需要时，再通过工具动态拉取数据。

Claude Code 就是很典型的例子。它分析大型代码库时，不会把所有文件都塞进上下文，而是先通过目录结构、文件名、搜索命令定位目标，再用 `head`、`tail`、`grep` 这类方式逐步读取。

Agent 像人一样靠文件名和目录结构理解信息位置，靠文件大小和时间戳判断优先级，而不是上来就把全部内容吞进去。

这里有个很容易被忽略的点：元数据本身也是信息。

`tests/test_utils.py` 和 `src/core_logic/test_utils.py` 语义就不一样。光看路径，Agent 就能判断它们大概率服务于不同目的。

Anthropic 把这种方式叫 Progressive Disclosure，也就是渐进式披露。

Agent 不是一次性拿到所有上下文，而是通过一轮轮探索逐渐理解任务。文件大小暗示复杂度，时间戳暗示相关性，目录结构传递语义。

但按需加载也有代价：它比预检索慢，而且需要工程师提供好用的导航工具，比如 glob、grep、tree。

如果导航工具不好用，或者导航启发式规则写得差，Agent 很容易追进死胡同，浪费上下文和调用次数。

所以 Just-in-Time 不是“不预处理”，恰恰相反，它对工具集和导航策略要求更高。

更现实的方案通常是混合策略：确定性高的静态知识可以预检索，运行中动态发现的信息再按需拉取。

Claude Code 也是这个思路：`CLAUDE.md` 文件可以预加载，但具体文件内容靠 Agent 运行时探索。

不同场景的选择也有规律。代码库分析、信息检索这种探索空间大、动态内容多的任务，更适合以 Just-in-Time 为主；法律文书审阅、财务报表分析这种上下文稳定、动态内容少的任务，更适合预检索加少量运行时补充。

## 长任务里，上下文怎么撑住

![长任务上下文持久化：抵抗腐化的三大武器](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/long-task-context-persistence-three-weapons-against-corruption.svg)

### Compaction：窗口快满时压缩历史

Agent 如果要连续跑几个小时，处理很多轮迭代，只靠普通上下文管理是不够的，它需要跨窗口持久化。

Compaction 就是常见做法：当上下文快满时，把历史内容交给 LLM 总结，然后用摘要开启一个新的上下文窗口继续跑。

Claude Code 的思路是：把历史消息交给模型做摘要，保留架构决策、未解决 Bug、关键实现细节，丢掉冗余工具调用结果。然后 Agent 拿着压缩后的上下文，再加上最近访问的 5 个文件，继续工作。

难点在取舍：保留太多压缩没意义，保留太少关键上下文丢了。

比较实际的做法是：拿复杂 Agent 轨迹反复调压缩 Prompt。先保证重要信息别漏，再逐步删掉冗余内容。

这不是一次能写准的。还有一个更轻量的压缩方法：清理工具结果。

工具已经调用过，结果也被消化了，后面就没必要保留完整原始输出。Anthropic 的 Developer Platform 已经把这个做成了原生功能。

### Structured Note-taking：让 Agent 记笔记

Structured Note-taking 是另一种长任务处理方式。让 Agent 把关键进展写到外部文件里，比如 `NOTES.md`。上下文重置后，再读取这些笔记继续工作。

这和人类工程师写 to-do list、技术备忘很像。Claude Code 在长任务里会自动维护 to-do list。自定义 Agent 也可以在项目根目录维护 `NOTES.md`，里面记录当前进度、已知问题、下一步计划。

一个很有意思的例子是 Claude 玩 Pokemon。在数千轮游戏步骤里，Agent 自己维护了数值追踪，比如“过去 1234 步我在 1 号道路训练皮卡丘，已升 8 级，距离目标还差 2 级”。

它还自发建立了地图、成就清单、战斗策略笔记。上下文重置后，这些笔记还能被重新读取，所以它才能跨几个小时持续推进游戏。

Anthropic 在 Sonnet 4.5 发布时，也推出了 Memory Tool 公开测试版，用文件系统持久化的方式让 Agent 建立跨会话知识库。

### Sub-agent：别让一个 Agent 扛所有状态

Sub-agent 架构的思路很直接：别让一个 Agent 扛完整项目状态。具体来说，就是把专门任务拆给专业化子 Agent，主 Agent 负责分配任务和汇总结果。

每个子 Agent 可以自己探索大量上下文，可能是几万个 Token。但返回给主 Agent 的，只是一段 1000-2000 Token 的高密度摘要。

这样主 Agent 的上下文会干净很多——详细搜索过程被隔离在子 Agent 里，主 Agent 只处理分析和决策。

Anthropic 在《How we built our multi-agent research system》里讲过这个模式。相比单 Agent，它在复杂研究任务上有明显质量提升。

三种方式可以这么选：

| 技术        | 适用场景                                     |
| ----------- | -------------------------------------------- |
| Compaction  | 需要持续对话的长流程，重点是保持上下文连贯   |
| Note-taking | 迭代式开发、有清晰里程碑、多步推进的任务     |
| Sub-agents  | 复杂研究、需要并行探索、最终要汇总结果的任务 |

## 落地 Context Engineering 会用到哪些工具

方法讲完，工程工具也顺一下。

- **编排框架**：LangChain、LangGraph 这类框架，主要负责 Agent 的控制流、状态管理和循环调度
- **数据框架**：LlamaIndex 更偏 RAG，负责数据摄取、索引构建和检索优化
- **向量数据库**：Pinecone、Weaviate、Chroma、Qdrant 这类工具，负责 Embedding 存储和语义搜索
- **通信协议**：MCP（Model Context Protocol）解决的是工具怎么标准化接入宿主程序的问题，经常被类比成 AI 应用里的 USB-C。Anthropic 发布的 MCP 基于 JSON-RPC 2.0，定义了 Tools（可执行函数）、Resources（只读数据）、Prompts（可复用模板）三类标准原语
- **Memory 产品**：Mem0、LETTA（原 MemGPT）、ZEP 这类产品，主要做 Agent 记忆层，通常在向量库之上封装记忆写入、检索、遗忘这些生命周期管理能力

## 真正落地时，要盯住什么

Context Engineering 最重要的判断其实很简单：Agent 的大多数失败，不在模型智商，而在上下文精度。

过去大家更关心“这句 Prompt 怎么写”，现在更该关心的是：什么信息，以什么格式，在什么时机进入窗口。

模型能力还会继续变强，但注意力有限这个约束不会消失——窗口再大，塞一堆噪声进去，模型一样会变笨。

**上下文是系统输出，不是静态配置。**

每次 LLM 调用前，你都在组装一个动态上下文，这个组装逻辑本身就是工程重点。

改一个检索策略，换一种摘要方式，调整工具 Schema 的挂载顺序，效果差别可能比换模型还大。

**高信噪比比高信息量更重要。**

上下文长度不决定效果，Dex Horthy 的 40% 阈值实验也说明塞满窗口不如只放必要信息。真正要找的是让模型做出正确决策所需的最小高密度信息集。

**长任务里，上下文一定会腐化。**

Compaction、结构化笔记、Sub-agent 分层，要组合起来用，才能让上下文在长时间运行里不变质。

**先从最简单的方案跑通。**

Anthropic 反复强调过一句话：do the simplest thing that works。过度设计的上下文系统，和上下文不足一样危险。

Guide 见过不少团队，连基线都没跑通，就开始做记忆分层、复杂检索、长期状态管理，最后调试成本比收益还高。先跑通，再加复杂度。

上下文给对了，中等模型也能做出复杂任务。上下文给烂了，再贵的模型也会输出一坨看起来很像答案的噪声。

## 延伸阅读

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Context Engineering: The New Frontier of AI Development](https://medium.com/techacc/context-engineering-a8c3a4b39c07)
- [The New Skill in AI is Not Prompting, It's Context Engineering](https://www.philschmid.de/context-engineering)
- [Context Engineering by Simon Willison](https://simonwillison.net/2025/jun/27/context-engineering/)
- [12 Factor Agents - Own Your Context Window](https://www.humanlayer.dev/blog/12-factor-agents)
