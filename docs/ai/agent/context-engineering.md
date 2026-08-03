---
title: 上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？
description: 深入解析 Context Engineering 核心概念，涵盖静态规则编排、动态信息挂载、Token 预算降级、按需加载策略及长任务上下文持久化，帮助开发者构建高信噪比的 Agent 上下文供给系统。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Context Engineering,上下文工程,Agent,LLM,RAG,Prompt Engineering,Compaction,Sub-agent
---

上下文窗口能装下更多资料，不代表 Agent 会稳定利用这些资料。一次调用里混入过期状态、无关日志或几十个相似工具描述后，模型仍可能漏掉真正影响决策的条件。

Context Engineering 处理的就是调用前的信息组装：哪些规则进入消息，哪些证据按需检索，哪些工具在当前阶段可见，历史何时压缩，原始结果如何保留引用。长任务还要处理跨窗口的状态交接，避免摘要后丢失约束、版本号和未完成事项。

## 同样的 Agent，为什么表现差这么多？

![以电商售后为例图解同样的 Agent，为什么表现差这么多](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-the-same-agent-performs-so-differently.png)

这里以电商售后为例。

G 友发来一句话： “MD，我上周买的耳机右耳没声音了，怎么处理？”

如果 Agent 拿到的上下文很少，它大概率会这么回：“抱歉给您带来不便。请问您购买的是哪款耳机？订单号是多少？能否描述一下具体故障表现？”

这句答话也问题不大，但对一个售后场景很让人恼火。它只会套流程问答，并不去主动整理信息。

我们换一个上文充足的改写看看效果。

在调用 LLM 之前，系统先把能查的信息都查出来：

- 查订单系统，定位到上周购买记录：索尼 WH-1000XM5，3 月 25 日下单
- 查保修状态，发现还在 7 天无理由退换期内
- 查历史工单，发现用户是老客户，之前没有售后纠纷
- 挂载 `create_return_order` 和 `check_inventory` 工具

那么 Agent 就可以这么回复：“您好，查到您 3 月 25 日购买的索尼 WH-1000XM5，目前还在退换期内。我这边直接帮您发起换货申请，仓库显示同款有库存，预计 2-3 天寄出新品。需要我帮你操作吗？”

这差距一下就出来了，后面这个回复是真的在解决问题，不是继续去反问用户。

当然，Agent 的很多失败确实和上下文有关，但上下文不是唯一原因。工具设计、任务拆解、状态管理、验证机制，这些通常要一起看。

不过有一点很确定：**上下文不够的时候，模型再强也只能靠猜；上下文给对了，中等水平的模型也能把任务做下去。**

## Context Engineering 到底在做什么？

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

### 和 Prompt Engineering 差别

Tobi Lutke 将 Context Engineering 概括为：

> the art of providing all the context for the task to be plausibly solvable by the LLM

翻译过来就是：给 LLM 补齐解决任务所需的上下文，让任务在模型能力范围内具备可解性。这里的 **plausibly** 指的是前提条件：缺少订单状态、权限边界或旧链路约束时，模型没有足够依据作出可靠判断。

Prompt Engineering 处理指令的写法；Context Engineering 决定一轮调用实际带入哪些信息，以及这些信息在何时进入或退出窗口。

- Prompt Engineering 关心的是指令本身怎么写——措辞、顺序、格式、语气，这些都算。
- Context Engineering 关心的是另一件事：在这轮调用之前，模型窗口里应该放哪些信息，用什么结构放，什么时候放进去，什么时候该撤掉。

Anthropic 官方博客用下图对比了这两个层面：

![Prompt engineering vs. context engineering](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-prompt-engineering.png)

打个比方。如果 Prompt Engineering 是“告诉厨师这道菜怎么做”，那 Context Engineering 更像是给厨师准备厨房——食材放在哪、刀具怎么摆、调料怎么分类、火候参考贴在哪里。

![Prompt vs Context 工程维度对比](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/prompt-vs-context-engineering-dimension-comparison.svg)

我个人更喜欢另一个类比：**Context Engineering 就是 LLM 的内存管理。**

上下文窗口就是一块有限内存。Context Engineering 管的是这块内存里装什么、换出什么、什么时候读、什么时候写。窗口满了就得淘汰内容，这跟操作系统里的页面置换是一个思路，比如 LRU、优先级策略之类的。后面讲到 Token 降级的时候，其实也是在处理这个问题。

### 它具体管哪些东西

![上下文窗口（Context Window）= LLM 的工作记忆](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

拆开看的话，Context Engineering 至少管这么几块。

System Prompt 是 API 消息里的高优先级指令。`.cursor/rules`、`.claude/rules`、`AGENTS.md` 等文件是宿主程序读取的规则来源，宿主会按自己的加载规则把其中一部分转换成模型上下文；它们和 API 角色意义上的 System Prompt 不是同一个概念。Cursor 早期使用的 `.cursorrules` 已属于旧版形式，新项目应使用 `.cursor/rules`。

User Prompt 是用户输入的业务数据和指令。看起来简单，但真实项目里经常会混着自然语言、业务字段、历史状态、附件内容，处理不好就会把上下文搞脏。

Memory 这块分短期和长期。短期记忆一般是 Session 内的滑动窗口，长期记忆不一定就是向量库——文件、KV、关系库、图数据库、向量检索层都可以。关键问题是：记录什么、什么时候写入、怎么更新、怎么遗忘、召回之后怎么进入当前上下文。

RAG & Tools 也算。RAG 负责检索外部文档把相关内容塞进上下文，Tools 负责把工具描述、参数格式、调用结果挂载进去。RAG 其实可以看成 Context Engineering 的一种具体实现——它回答的是“检索什么、怎么检索、结果怎么放进上下文”这几个问题。

JSON Schema、Function Calling 的参数结构和返回约束会限制当前调用，因此也属于上下文的一部分。工具调用后的 Observation 则要区分：保留原文、写入摘要，还是在后续轮次清理；若不提前设计，解析和回放阶段会留下大量难以处理的结果。

摘要压缩、历史剔除和 Context Caching 都属于 Token 管理手段。它们需要在信息保留与调用成本之间取舍。

## 上下文为什么会失效？

![上下文为什么会失效](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-does-the-following-content-fail.png)

窗口容量增加后，筛选问题仍然存在。输入超出当前任务所需范围时，额外材料可能只会增加干扰。

![上下文利用率的 40% 阈值现象](https://oss.javaguide.cn/github/javaguide/ai/harness/context-utilization-40-percent-threshold-phenomenon.svg)

以老用户登录改造为例：历史需求、接口文档和会议记录同时进入窗口，其中“仍依赖旧版 token 校验，不能直接切到新鉴权模块”可能只有一行。模型即使读取了全部资料，也可能没有把这一行当作方案前提。

**Context Rot** 讨论的正是这类现象：随着输入变长、噪声增多，模型对关键证据的利用可能不再稳定。

![上下文腐化](https://oss.javaguide.cn/github/javaguide/ai/harness/context-rot-diagram.png)

跟它相关的还有一个经典现象叫 **Lost in the Middle**——模型对开头和结尾的信息更敏感，对夹在中间的东西更容易“看漏”。所以有时候你明明把资料给它了，它还是答错，不一定是没读到，而是关键内容在长上下文里不够显眼。

在 Transformer 里，模型不是像人一样一行一行读文本的。它通过 Attention 去判断：当前这个问题应该重点关注上下文里的哪些内容。你可以把 Attention 理解成一种“相关性打分”。比如你问“这个接口为什么会超时”，模型就要在上下文里找跟接口、超时、日志、SQL、缓存、外部依赖相关的信息。上下文短的时候干扰少，更容易找到重点。

但如果你一次性塞进去几十页文档、几百条日志、十几段背景说明，情况就不一样了。模型不是只要看见信息就能用好信息，它还得从大量内容里判断哪些最重要。上下文越长，候选信息越多，干扰项也越多，注意力就更容易被分散。如果按标准 full attention 来理解，每个 Token 都要和其他 Token 计算注意力关系，Token 越多计算和筛选压力都会上来。不过现在很多长上下文模型会用稀疏注意力、分块、缓存、压缩这些方式来降低成本，所以也不能简单说上下文一长就一定变差。

比较准确的说法是：**长上下文会增加模型筛选关键信息的难度，推理成本也会增加，但具体退化程度取决于模型本身、上下文的结构和任务类型。**

这也就解释了：为什么有些模型标称支持 100K、200K 上下文，但实际用的时候，不一定能稳定处理满窗口的内容。

能放进去，和能用好，这是两回事。

实际场景里这种太常见。你把项目资料、接口文档、会议记录、历史需求全塞给模型，然后问：“帮我看看这个改动会影响到老用户登录链路吗？”。

关键信息可能就一句：老用户登录链路仍然依赖旧版 token 校验逻辑，不能直接切到新鉴权模块。但这句话夹在一大堆背景信息中间，模型很可能就忽略它了，最后给出一个看起来合理、实际上有风险的方案。

长上下文的难点在于稳定找到关键内容。组装上下文时应删除重复信息，把任务约束放在明确位置；长文档先切分、检索或摘要，并为关键证据保留可回查引用。具体保留多少，需要用目标模型和真实任务轨迹评估。

## 怎么评估上下文工程有没有变好？

这个不能只靠体感。最容易出现的一种假象是：改完之后 Agent 看起来更“像那么回事”了，但实际成功率没提升，成本反而上去了。

建议至少盯住这五类指标：

| 指标类型   | 具体看什么                                                  |
| ---------- | ----------------------------------------------------------- |
| 任务成功率 | 是否完成目标、是否需要人工补救、是否能稳定复现成功路径      |
| 工具质量   | 错选工具、漏调工具、参数错误、重复调用、危险操作拦截率      |
| 上下文成本 | 输入 Token、输出 Token、缓存命中率、压缩后信息保留比例      |
| 延迟指标   | 首 Token 延迟、端到端耗时、工具等待时间、p95 / p99 响应时间 |
| 结果质量   | 幻觉率、证据引用准确率、摘要丢失率、关键字段遗漏率          |

建议的做法是先选 20 到 50 条真实任务轨迹做个小评测集，然后改检索、压缩、工具 Schema、Prompt 这些东西。每次只改一个变量，不然你很难搞清楚效果到底来自哪里。

## 运行时上下文怎么加载？

![运行时上下文怎么检索](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-run-time-retrieval.png)

### 预检索为什么不够

预检索在调用 LLM 前依据 Embedding 相似度取回片段，再一次性放入 Prompt。FAQ 等简单问答可以采用这条链路；复杂 Agent 任务的相关信息则会随执行过程变化。

预检索只能依据调用前已知的目标排序。Agent 调用工具后发现的新线索不会出现在这次结果里。

### Just-in-Time 按需加载

Just-in-Time 会先保留文件路径、数据库查询或 Web 链接等轻量引用；任务需要具体内容时，再通过工具读取。

以 Claude Code 分析大型代码库为例，Agent 可以先根据目录结构、文件名和搜索结果收窄范围，再用 `head`、`tail`、`grep` 逐步读取。路径、文件大小和时间戳都是定位线索，不必先把全部文件内容送入窗口。

元数据本身也能参与判断。`tests/test_utils.py` 与 `src/core_logic/test_utils.py` 的路径语义不同，足以提示 Agent 它们服务于不同位置的测试逻辑。

Anthropic 将这类分层获取信息的方式称为 **Progressive Disclosure**，即渐进式披露。Agent 通过多轮探索补充上下文：文件大小提示复杂度，时间戳提示相关性，目录结构提供位置语义。Skills 也利用了这一思路，具体可见：[Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html)。

按需加载增加了工具调用次数和延迟，并依赖 `glob`、`grep`、`tree` 等导航工具。导航能力不足或启发式规则失效时，Agent 可能沿着错误路径继续搜索，消耗更多上下文和调用次数。因此仍要预先设计索引、工具边界和导航策略。

### 更现实的是混合策略

实际项目中更常见的做法是混合策略：确定性高的静态知识可以预检索，运行中动态发现的信息再按需拉取。Claude Code 也是这么做的——`CLAUDE.md` 文件可以预加载，但具体文件内容靠 Agent 运行时去探索。

不同场景的选择也有规律可循。代码库分析、信息检索这种探索空间大、动态内容多的任务，更适合以 Just-in-Time 为主。法律文书审阅、财务报表分析这种上下文稳定、动态内容少的任务，预检索加少量运行时补充就够了。

| 策略         | 优点                         | 代价                               | 更适合的任务                         |
| ------------ | ---------------------------- | ---------------------------------- | ------------------------------------ |
| 预检索       | 快、简单、链路稳定           | 容易一次性塞入噪声，运行中不够灵活 | FAQ、固定知识库问答、稳定文档审阅    |
| Just-in-Time | 上下文更干净，证据按需进入   | 工具调用更多，延迟更高             | 代码库分析、故障排查、开放式研究     |
| 混合策略     | 兼顾启动速度和运行时探索能力 | 需要预算管理器和工具导航能力       | 复杂业务 Agent、长任务、多源检索任务 |

选择检索策略时，先看任务的材料是否稳定、探索空间多大、实时性要求，以及证据是否必须可追溯，而不是比较哪种方案“更高级”。

## 长任务里，上下文怎么撑住？

![长任务上下文持久化：抵抗腐化的三大武器](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/long-task-context-persistence-three-weapons-against-corruption.svg)

### Compaction：窗口快满时压缩历史

连续多轮任务会把早期判断、工具结果和当前目标同时留在消息历史中。接近窗口上限时，Compaction 将历史压缩为摘要，再以摘要和新消息继续执行，从而实现跨窗口衔接。

Anthropic 介绍过 Claude Code 的一种实现思路：摘要保留架构决策、未解决 Bug 和关键实现细节，冗余工具结果则被移除；压缩后的上下文再配合最近访问的文件恢复任务状态。“5 个文件”是该文中的实现示例，具体保留范围应由任务和窗口预算决定。

![ Claude Code 的上下文压缩思路](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/claude-code-context-compression-thinking.png)

这块的难点在取舍——保留太多压缩没意义，保留太少关键上下文又丢了。比较实际的做法是拿复杂 Agent 轨迹反复调压缩 Prompt，先保证重要信息别漏，再逐步删掉冗余内容。这不是一次能写准的。

还有一个更轻量的压缩手段：清理工具结果。工具调用过了，结果也消化了，后面就没必要保留完整的原始输出。Anthropic Developer Platform 已经有 context editing / tool-result clearing 这类能力了，可以在保留 tool_use 记录的同时清理旧的 tool_result。不过触发阈值、保留数量这些参数，还是得按自己的业务负载去测试。

### Structured Note-taking：让 Agent 记笔记

Structured Note-taking 是另一种处理长任务的方式。让 Agent 把关键进展写到外部文件里（比如 `NOTES.md`），上下文重置之后再读取这些笔记继续工作。

这个思路跟人类工程师写 to-do list、技术备忘是一样的道理。Claude Code 在长任务里会自动维护 to-do list，自定义 Agent 也可以在项目根目录维护 `NOTES.md`，记录当前进度、已知问题、下一步计划。

有个挺有意思的例子：Claude 玩 Pokémon（宝可梦）。在数千轮游戏步骤里，Agent 自己维护了数值追踪，比如“过去 1234 步我在 1 号道路训练皮卡丘，已升 8 级，距离目标还差 2 级”。它还自发建立了地图、成就清单、战斗策略笔记。上下文重置之后这些笔记还能被重新读取，所以它才能跨好几个小时持续推进游戏。Anthropic 在 Sonnet 4.5 发布的时候也推出了 Memory Tool 公开测试版，用文件系统持久化的方式让 Agent 建立跨会话知识库。

### Sub-agent：别让一个 Agent 扛所有状态

检索或代码阅读可以交给独立上下文中的 Sub-agent，主 Agent 只接收证据汇总。子 Agent 即使完成数万个 Token 的探索，返回主 Agent 的摘要通常约为 1000 到 2000 Token，详细搜索过程不会长期占用主窗口。

Anthropic 在《How we built our multi-agent research system》中介绍过这种隔离检索、压缩回传的模式。是否使用取决于任务能否拆分、子任务依赖关系，以及汇总时是否会丢失关键证据。

![Sub-agent 拆分任务，隔离上下文](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/sub-agent-task-splitting-context-isolation%20.png)

三种方式可以这么选：

| 技术        | 适用场景                                     |
| ----------- | -------------------------------------------- |
| Compaction  | 需要持续对话的长流程，重点是保持上下文连贯   |
| Note-taking | 迭代式开发、有清晰里程碑、多步推进的任务     |
| Sub-agents  | 复杂研究、需要并行探索、最终要汇总结果的任务 |

## Context Engineering 到底怎么落地？

工程实现中可以设置一个 Context Assembler，在每次调用 LLM 前统一组装规则、目标、证据、记忆、工具和历史摘要。

### 先看一轮 LLM 调用前，系统到底要组装什么

```python
# 输入：用户任务信息、当前会话状态、业务上下文
input: user_task, session_state, business_context

# 1. 加载系统约束（限制条件、策略规则、权限等）
constraints = load_system_constraints()

# 2. 根据用户任务和会话状态，提取当前要达成的具体目标
goal = extract_current_goal(user_task, session_state)

# 3. 使用 RAG（Retrieval-Augmented Generation）策略检索相关证据或上下文信息
#    - 例如从文档、知识库、数据库中找到与 goal 相关的数据
#    - 参考「运行时上下文怎么加载」文档说明检索策略
evidence = retrieve_rag(goal, business_context)

# 4. 回忆历史记忆或会话中已有信息
#    - 包含用户偏好、先前交互、模型记忆
memory = recall_memory(goal, session_state)

# 5. 根据目标、证据和记忆选择合适的工具/操作组件
#    - 可以是调用 API、执行浏览器操作、触发计算等
tools = select_tools(goal, evidence, memory)

# 6. 压缩会话历史消息，用于跨窗口上下文管理
#    - 参考「长任务里，上下文怎么撑住」
#    - 压缩历史可减少 token 消耗，同时保留关键信息
history = compact_history(session_state.messages)

# 7. 聚合所有上下文信息，并进行重要性排序
#    - 确保模型先处理最关键的内容
context = rank([
  constraints,
  goal,
  evidence,
  memory,
  tools,
  history
])

# 8. 根据模型的 token 限额对上下文进行截断/裁剪
#    - 保证在 token 预算内能最大化保留关键信息
context = fit_token_budget(context)

# 输出：生成的消息、可用工具 schema、附加元信息
output: messages, tool_schema, metadata
```

有两个地方比较关键的，我们在实际做的时候需要注意：

1. `rank` 决定哪些信息靠前哪些靠后。
2. `fit_token_budget` 决定哪些保留原文、哪些压成摘要、哪些只留一个引用。

如果这两步做的比较差的话，会导致 Agent 的处理效果会比较一般。一定要避免检索回来什么就塞什么，历史消息能放多少放多少，最后窗口里一半都是噪声。

Context Assembler 的输入可按来源拆成静态规则、工具定义、动态证据、示例和 Token 预算。

### 静态规则：先把 System Prompt 写清楚

静态规则可以理解成 Agent 的“出厂设置”，就是那些不随对话变化的基础约束。常见做法是用结构化 Markdown 写 System Prompt，别把所有东西揉成一大段，而是拆成角色、目标、约束、执行流、输出格式。

比如一个故障排查 Agent：

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

这些规则可以放进 `.cursor/rules`、`.claude/rules` 或 `AGENTS.md`，再由对应宿主按目录和作用域加载。规则文件便于版本控制和团队审查，但最终进入哪类消息、何时加载，取决于宿主实现。

但写 System Prompt 有两个常见的极端得避开。

**一是过度设计。** 有些工程师喜欢把大量 if-else 逻辑硬塞进 Prompt，试图精确控制 Agent 的每一步。结果 Prompt 又长又脆弱，维护成本很高，遇到没见过的边缘情况模型照样跑偏。

**二是过度抽象。** 就写一句“你要做一个有帮助的助手”，模型拿不到足够的决策依据，要么不停追问用户，要么输出和业务预期偏得很远。

比较好的状态是具体到能引导行为、抽象到能覆盖常见变化。Anthropic 工程博客里管这叫 Goldilocks zone，就是“刚刚好”的区域。

![上下文工程过程中的系统提示](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/calibrating-the-system-prompt.png)

实操上更稳的做法是先用最小 Prompt 测基线表现，然后根据 failure case 一条一条补规则，别一上来就试图穷举所有情况。Anthropic 把这叫 Calibrating the system prompt——System Prompt 应该是个持续调校的参数，不是写完就不动的配置文档。发现一个 failure case 就补一条规则，然后重新测试。

### 工具上下文：工具描述要先讲边界

工具定义写得好不好，直接决定 Agent 会不会选错工具。一个好的工具描述得能回答两个问题：什么时候该调用？什么时候不该调用？如果连人类工程师都看不出这个工具该不该用，Agent 也一定会犯错。

一个工具同时覆盖查询、修改和审批等操作时，Agent 需要在同一份 Schema 中辨别多套参数和副作用，错选路径的概率会增加。工具描述应明确适用条件和禁止条件；将单一操作拆出，并在参数中给出格式示例，才能让调用边界可判断。

### 动态上下文：RAG、记忆、工具结果不要一股脑塞

检索什么时候做、预检索还是按需加载，前面「运行时上下文怎么加载」已经讲过了。这里只说检索结果进入窗口之后怎么处理。

短期记忆可以用滑动窗口管理，长期事实通过外部存储检索。API 报错日志、工具返回结果这类 Observation 可以先做裁剪和摘要，但排障类信息一定要保留原始引用——traceId、请求时间、错误码、日志文件位置、工具调用参数和原始结果摘要链接，这些不能丢。只留一句“接口报错了”的话后面排障会断线，但原始日志洪流直接塞进去又容易把模型淹没。

动态上下文的故障多出在检索结果错误、记忆过期、工具超时或摘要遗漏证据。下表列出相应的降级路径：

| 失败路径   | 典型表现                         | 兜底方案                                           |
| ---------- | -------------------------------- | -------------------------------------------------- |
| RAG 无结果 | 找不到相关文档，或者召回片段太散 | 降级到关键词检索，必要时让 Agent 向用户澄清缺口    |
| 工具超时   | 外部 API 卡住，Agent 重复等待    | 设置超时、重试上限、熔断策略，关键流程预留人工接管 |
| 摘要丢失   | 压缩后缺少异常栈、版本号、边界值 | 保留 traceId、原始证据位置、关键字段和可回查链接   |
| 记忆污染   | 旧偏好、旧状态被当成当前事实     | 写入前校验，读取后标记来源、时间和可信度           |
| 多工具冲突 | 两个工具都能做，Agent 选错路径   | 用优先级、状态机和副作用等级约束调用顺序           |

### 示例上下文：Few-shot 示例别堆太多

Few-shot 示例应覆盖不同的标准场景。保留 3 到 5 个能代表策略差异的 canonical examples，通常比把几十个 edge case 全部塞进 Prompt 更有效；示例需要说明面对一类输入时应采取的策略，而不只是展示表面的输入输出。

### Token 预算：单次调用内怎么排优先级

这里讨论的是单次调用内的内容优先级；跨窗口历史由前文的 Compaction 处理。窗口接近上限时，两层策略需要同时生效。

![上下文不是越多越好](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-eviction-strategy.png)

| 优先级             | 内容                                         | 处理方式                             |
| ------------------ | -------------------------------------------- | ------------------------------------ |
| 低优先级（可折叠） | 早期对话历史                                 | AI 摘要压缩                          |
| 中优先级（可精简） | RAG 检索的背景资料、旧工具结果               | 二次裁剪，保留核心段落和可回查引用   |
| 高优先级（固定区） | System Constraints、当前任务目标、安全边界   | 放在固定高优先级区，确保逻辑一致性   |
| 阶段性优先级       | 当前阶段需要的工具描述、Schema、少量关键示例 | 按任务阶段加载，卸载后保证可重新发现 |

大规模并发时可配合 Prompt / Context Caching。支持缓存的模型可以将稳定的 System Prompt 和工具说明作为缓存前缀，以减少重复计费或降低首 Token 延迟；实际命中率仍取决于厂商实现、前缀变化和缓存生命周期，应按业务负载验证。

## 做 Context Engineering 会用到哪些工具？

编排、检索、向量库、工具接入和记忆层解决的问题不同，只引入当前任务链路需要的部分。

- LangChain、LangGraph 负责控制流、状态管理和循环调度；工具调用与节点回退通常在这一层组织。
- LlamaIndex 偏向 RAG 的数据摄取、索引生成和检索优化，适用于文档摄取与检索构成主要链路的场景。
- Pinecone、Weaviate、Chroma、Qdrant 等提供 Embedding 存储和语义搜索。小项目可先用本地 Chroma，再按规模评估 Qdrant、Milvus 或 Pinecone。
- MCP 规定工具如何标准化接入宿主程序。当前 2025-11-25 revision 基于 JSON-RPC 2.0，区分 Host、Client、Server，并通过 Server Features 暴露 Resources、Prompts、Tools 等能力。
- Mem0、LETTA（原 MemGPT）、ZEP 面向 Agent 记忆层，通常在向量库之上封装记忆写入、检索和遗忘等生命周期管理。

通过 MCP 接入的工具也是副作用入口。读文件、查询数据库、发请求和修改配置要区分权限、调用条件与审计边界，否则问题难以定位和回放。

## 落地时先记录每轮上下文

![Context Engineering 的核心逻辑](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-core-logic.png)

评估 Context Engineering 时，先记录每轮实际进入窗口的消息。检索策略、摘要方式或工具 Schema 挂载顺序变化后，才能将成功率、Token 成本和工具调用质量与基线比较。

### 高信噪比比信息量更重要

Dex Horthy 提到过 40% 到 60% 的上下文利用率经验区间，但这不是通用阈值。应从真实轨迹找出完成决策所需的最小信息集：保留约束和证据，移除无关背景。

### 长任务要主动清理过期状态

长任务持续追加消息后，早期判断、已解决问题和重复工具结果都会留在历史中。Compaction 处理消息压缩，结构化笔记保存可恢复状态，Sub-agent 隔离专门任务；是否组合使用取决于任务长度和已观察到的失败模式。短任务尚未出现上下文膨胀时，无需引入复杂记忆层。

### 先把最简单的方案跑通

Anthropic 反复强调过一句话：`do the simplest thing that works`。

基线尚未跑通就加入记忆分层、复杂检索和长期状态管理，失败后很难区分问题来自检索、摘要、工具描述还是模型选型，组件也会拉长排查链路。

可先固定 System Prompt 与工具边界，再验证 RAG 检索，随后加入摘要压缩和上下文预算。长任务出现明确瓶颈后，再评估记忆层、Sub-agent 或更复杂的运行时检索。

## 从可回放的基线开始

先固定高优先级指令和工具定义，保存每次调用实际发送的消息、工具 Schema、Token 使用量和检索结果，再用一组真实任务建立基线。后续一次只调整一个变量，例如检索策略、摘要方式或工具挂载顺序。

长上下文、Prompt Caching、结构化输出和 MCP 等能力会随模型、API、SDK 和客户端版本变化。设计文档应记录 model ID、接口版本和核对日期，避免把某个客户端的实现细节当作通用规律。基线轨迹出现信息过期、预算不足或跨窗口丢状态后，再增加 RAG、Compaction、缓存或持久化记忆。

## 总结

每次调用交给模型的固定规则、当前目标、检索证据、可用工具、历史状态和 Token 预算，都需要按优先级组织。窗口变大不会自动改善判断；无关历史、重复工具结果和过时状态仍会干扰决策。

先保存真实调用轨迹，建立可回放基线，再逐项调整检索、工具描述、摘要或裁剪策略。只有基线暴露出长任务、信息过期或窗口不足等问题时，再增加记忆分层、Compaction、缓存或 Sub-agent，以免过多组件掩盖故障来源。

## 参考

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OpenAI API Models Compare](https://developers.openai.com/api/docs/models/compare)
- [Claude API Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [DeepSeek V4 Preview Release](https://api-docs.deepseek.com/news/news260424)
- [MCP 2025-11-25 Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot)
- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- [Context Engineering: The New Frontier of AI Development](https://medium.com/techacc/context-engineering-a8c3a4b39c07)
- [The New Skill in AI is Not Prompting, It Is Context Engineering](https://www.philschmid.de/context-engineering)
- [Context Engineering by Simon Willison](https://simonwillison.net/2025/jun/27/context-engineering/)
- [12 Factor Agents - Own Your Context Window](https://www.humanlayer.dev/blog/12-factor-agents)
