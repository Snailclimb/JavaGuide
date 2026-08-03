---
title: AI 核心概念总览：LLM、Agent、RAG、MCP、Skills 与 ReAct
description: 直接摘录 JavaGuide AI 专题中已经总结过的核心概念，按大模型基础、Agent 和 RAG 三条主线串联 LLM、Token、上下文窗口、Prompt、Function Calling、Agent Loop、ReAct、Plan-and-Execute、MCP、Skills、Embedding、向量检索、Rerank、GraphRAG 等内容。
category: AI
tag:
  - AI
  - 大模型
  - AI Agent
  - RAG
  - MCP
head:
  - - meta
    - name: keywords
      content: AI核心概念,大模型核心概念,LLM,Token,Agent,Agent Loop,ReAct,Plan-and-Execute,RAG,Embedding,MCP,Skills,Prompt Engineering,Context Engineering,Function Calling,Tool Calling,GraphRAG
---

<!-- @include: @small-advertisement.snippet.md -->

这篇文章只做原文摘录和概念归类，不重新改写已有解释。每个二级模块下面都整理了相关原文链接，想深入看完整上下文，可以点进原文继续读。

## 大模型基础

相关原文：

- [LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出](./llm-basis/llm-operation-mechanism.md)
- [大模型提示词工程（Prompt Engineering）是什么？提示词技巧有哪些？](./agent/prompt-engineering.md)
- [大模型结构化输出：从 JSON 契约到 Function Calling 落地](./llm-basis/structured-output-function-calling.md)

### LLM

当你在输入法里打“今天天气真”，它会自动建议“好”。自回归大模型也会根据已有上下文预测下一个 Token（文本碎片），把新 Token 加进上下文后继续预测，直到生成结束。

这个过程叫做**自回归生成（Autoregressive Generation）**。

理解了自回归生成，后面所有概念都好办了：

- **Token**：模型每一步“补”的文本碎片。
- **上下文窗口**：一次调用里模型可处理的总 Token 上限，系统提示词、历史消息、当前输入和输出预算都会占用。
- **Temperature / Top-p**：模型选哪个候选碎片的策略。
- **Max Tokens**：允许模型最多“补”多少步。

### Token

你可以把 Token 理解为“模型的阅读单位”。我们人类读中文是一个字一个字地看，读英文是一个词一个词地看。但模型既不按字、也不按词——它用一套自己的“拆字规则”（叫 Tokenizer）把文本切成大小不等的碎片，每个碎片就是一个 Token。

为什么不直接按字或按词切？因为模型需要在“词表大小”和“序列长度”之间取平衡：

- 每个汉字都是一个 Token，词表小、但序列长（模型要“补”更多步）。
- 每个词都是一个 Token，序列短、但词表会爆炸（中文词组太多了）。

所以实际用的是折中方案——**子词切分算法**（如 BPE、Unigram），高频词保留为整体，低频词拆成更小片段。

你可以把 Token 想象成乐高积木。常用的“积木块”比较大（比如“你好”可能是一个 Token），不常用的词会被拆成更小的基础块拼起来。

Token 不是“一个字”或“一个词”的严格等价物：

- 英文可能一个单词被拆成多个 Token。
- 中文可能一个词被拆成多个 Token，也可能多个字合并成一个 Token（取决于词频与词表）。

工程上通常用**经验估算**做容量规划，用**实际 API 返回的 usage**做精确计费与监控。

**Token 化过程示例**：

- 原文：`你好，我是小 G。`
- 切分：`[你好]` `[，]` `[我是]` `[小 G]` `[。]`
- 统计：原文 9 字符 → Token 数 5 个 → 压缩比约 1.8 倍

![Token 化过程示例](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-token-process.png)

注意：实际 Token 切分由模型供应商的 Tokenizer 实现，不同供应商对相同文本可能产生不同的 Token 序列。

### 上下文窗口

**上下文窗口**是 LLM 的“工作记忆”（Working Memory）。它决定了模型在任何时刻可以处理或“记住”的文本量（以 Token 为单位）。

- 对话连续性：决定模型能进行多长的多轮对话而不遗忘早期细节。
- 单次处理能力：决定模型一次性能够处理的最大文档、代码库或数据样本。

“模型支持 128K/200K/1M”指的是一次调用里能放进模型的总 Token 上限。大多数模型的上下文窗口包含输入与输出的总和，但部分供应商（如 Google Gemini）对输入和输出分别设限，使用前请查阅具体 API 文档。

上下文窗口往往被隐形成本占用：

![上下文窗口（Context Window）= LLM 的「工作记忆」](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

- System Prompt：调节模型行为的系统指令（对用户隐藏，但占用窗口）。
- User Prompt：业务数据与指令。
- 多轮对话历史：过往的消息记录。
- RAG 检索片段：从外部知识库检索到的补充信息。
- 工具调用 Schema：函数定义与参数结构。
- 格式开销：特殊字符、换行符、Markdown 标记等。
- 模型生成的输出 Token：**输出也占用上下文窗口**。

因此，你真正能塞进 Prompt 的“有效业务内容”往往远小于标称上限。

### 采样参数

模型每一步会给词表中**每个**候选 Token 打一个分数（内部叫 **logits**），分数越高说明模型越觉得这个词应该出现在这里。

举个例子，假设模型正在补全“今天天气真\_\_”，它可能给出这样的分数：

| 候选 Token | 原始分数（logit） |
| ---------- | ----------------- |
| 好         | 5.0               |
| 不错       | 3.2               |
| 棒         | 2.1               |
| 糟糕       | 0.5               |
| 紫色       | -8.0              |

原始分数不是概率，需要经过 **softmax** 才能得到概率分布。假设候选集合只有表中的五项，计算结果约为：

| 候选 Token | 概率     |
| ---------- | -------- |
| 好         | 81.21%   |
| 不错       | 13.42%   |
| 棒         | 4.47%    |
| 糟糕       | 0.90%    |
| 紫色       | < 0.001% |

最后，模型按这个概率分布“抽签”（采样），决定输出哪个 Token。

解码参数（Temperature、Top-p、Top-k 等）就是在这个“打分 → 概率 → 抽签”的过程中施加控制：

- Temperature：调整概率分布的“形状”，让高分选项更突出，或者让各选项更均匀。
- Top-p / Top-k：直接砍掉不靠谱的候选项，缩小“抽签池”。
- Penalty 系列：对已经出现过的词降分，防止“复读机”。

![Temperature 参数：控制模型输出的随机性](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-temperature-params.png)

### Prompt

简单来说，Prompt 就是我们输入给大语言模型（LLM）的指令。

从生成机制看，LLM 会基于上下文生成后续 Token；从应用效果看，它能表现出一定的语义理解和指令跟随能力。但这种能力依赖输入上下文，边界不清时就容易偏题或编造。

Prompt 要做的事，就是缩小模型的搜索范围。

指令越模糊，模型越容易乱猜。指令越结构化，输出就越容易被控制。

Prompt 写得好不好，不看长度，看它有没有把任务说清楚。

一个合格的 Prompt，通常要交代四件事：Role、Task、Context、Format。

![Prompt 四要素框架](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/prompt-four-element-framework.svg)

| 要素              | 作用                             | 常见表述                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| Role（角色）      | 告诉模型该用哪个领域的知识和语气 | “你是一位 10 年经验的 Java 架构师”              |
| Task（任务）      | 说明要完成什么动作               | “请评审以下代码的性能问题”                      |
| Context（上下文） | 补充和任务相关的背景             | “当前线上 QPS 2000，响应时间超 500ms”           |
| Format（格式）    | 规定输出长什么样                 | “输出 JSON，包含 bottleneck、solution 两个字段” |

### 结构化输出

先看一个非常常见的 Prompt：

```text
请判断下面用户反馈属于哪类工单，返回 JSON。

用户反馈：我付款成功了，但是订单一直显示待支付。
```

模型可能返回：

```json
{
  "category": "payment",
  "priority": "high",
  "reason": "用户付款成功但订单状态未更新"
}
```

看起来没问题。但这只是“看起来”。

当你把它接进后端系统，真正需要的是一份可以被程序稳定消费的契约。比如：

- `category` 只能是 `PAYMENT`、`LOGISTICS`、`AFTER_SALE`、`ACCOUNT`。
- `priority` 只能是 `LOW`、`MEDIUM`、`HIGH`。
- `confidence` 必须是 `0` 到 `1` 之间的小数。
- `reason` 可以为空吗？最大长度是多少？
- 如果用户输入缺少信息，应该返回 `NEED_MORE_INFO`，还是继续猜？

自然语言 Prompt 很难长期守住这些边界。常见翻车点主要有 5 类。

很多人把 JSON Mode、JSON Schema、Structured Outputs 混着说，面试时也容易答散。但它们其实不在同一层：

- **JSON Mode** 是一种输出模式，约束模型返回合法 JSON。
- **JSON Schema** 是一种结构描述规范，用来定义 JSON 应该包含哪些字段、字段类型是什么、哪些必填、枚举值有哪些、是否允许额外字段。
- **Structured Outputs** 是模型供应商提供的结构化生成能力，它接收 JSON Schema 或类似 Schema，让模型在生成阶段尽量或严格贴合这份结构。

也就是说，JSON Schema 不是结构化输出方式本身，而是结构化输出常用的“契约格式”。真正让模型按契约生成的，是 Structured Outputs、Function Calling / Tool Calling 等模型 API 能力。

![生成阶段三层约束：JSON Mode 管语法，JSON Schema 管契约，Structured Outputs 把契约前移到模型生成阶段](https://oss.javaguide.cn/github/javaguide/ai/llm/structured-output-function-calling-three-layer-constraint.png)

### Function Calling / Tool Calling

Function Calling 这个名字很容易误导新人。很多人以为“模型调用函数”，好像模型真的执行了你的 Java 方法。

不是。

模型没有直接执行你的后端代码。它做的是：根据用户问题和工具描述，生成一个结构化的工具调用意图。真正执行工具的是你的业务服务、Agent Runtime、MCP Host 或供应商托管环境。

一个典型工具调用链路如下：

![Function Calling 完整调用链路：模型只生成调用意图，真正执行工具的是业务侧](https://oss.javaguide.cn/github/javaguide/ai/llm/structured-output-function-calling-function-calling-pipeline.png)

拆成工程步骤就是：

1. **服务端注册工具定义**：包括工具名、用途描述、参数 Schema。
2. **用户发起请求**：比如“帮我查一下订单 1029384756 到哪了”。
3. **模型选择工具**：模型判断需要调用 `query_order`，并生成参数 `{"orderId": "1029384756"}`。
4. **业务侧校验参数**：校验类型、必填、权限、订单归属、幂等键等。
5. **业务侧执行工具**：调用订单系统、数据库或 HTTP API。
6. **工具结果回填模型**：把查询结果连同 `tool_use_id` 原样发回模型。Anthropic 要求 `tool_use_id` 严格匹配，Gemini 3 同样为每个 `functionCall` 生成唯一 `id`，回填时必须带回，否则并行调用场景下结果会错配。
7. **模型生成最终回答**：模型把结构化结果转成人类能理解的回复。

## Agent

相关原文：

- [AI Agent 核心概念：Agent Loop、Plan-and-Execute、A2A、Agentic Workflows、Tools 注册](./agent/agent-basis.md)
- [AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现](./agent/workflow-graph-loop.md)
- [上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？](./agent/context-engineering.md)
- [AI Agent 记忆系统：短期记忆、长期记忆与记忆演化机制](./agent/agent-memory.md)
- [什么是 Model Context Protocol (MCP)？和 Function Calling、Agent 什么关系？](./agent/mcp.md)
- [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](./agent/skills.md)
- [Harness Engineering：六层检查框架、上下文管理与工程实践](./agent/harness-engineering.md)
- [Loop Engineering 是什么？为什么说它是新瓶装旧酒？](./agent/loop-engineering.md)

### 什么是 Agent？

如果你看过 LangChain 的 Agent 源码，会发现它的核心并不神秘，很多时候就是一个 while 循环。

AI Agent 可以理解为一个能感知环境、做决策、执行动作的软件系统。LLM 负责理解和决策，工具负责执行，记忆负责保存上下文和历史经验。

它和普通聊天机器人的差别在于：Agent 不只是回复消息，它会在动态环境里持续观察、判断、执行，直到任务结束。

一般可以用这个公式概括：**Agent = LLM + Planning + Memory + Tools** 。

![AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

**推理与规划（Reasoning / Planning）**：用 LLM 分析当前任务状态，拆目标，决定下一步怎么做。Chain-of-Thought（CoT）提示技术可以让模型逐步推理，减少直接拍脑袋给答案的概率。

记忆分两层。短期记忆通常是上下文历史，用来保持对话连续性；长期记忆一般是外部知识库，比如向量数据库或知识图谱。短期记忆解决“刚才说过什么”，长期记忆解决“过去积累了什么”。

**Tools（工具）**：让 LLM 能真正操作外部世界，比如查数据、调 API、读文件、执行代码。没有工具，Agent 很多时候只能停留在“建议你怎么做”。

工具执行后会返回结果，Agent 把这些结果放回上下文，再进入下一轮推理。这个反馈闭环就是 Observation（观察），也是 Agent Loop 能转起来的关键。

### Agent Loop

Agent Loop 是 Agent 真正跑起来的地方。

它每一轮大概做三件事：让 LLM 推理，调用工具，把工具结果写回上下文。一直循环，直到任务完成或者触发停止条件。

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

流程大概是这样：

1. 初始化时加载 System Prompt、可用工具列表、用户初始请求
2. 循环迭代——读取上下文，LLM 推理决定下一步（调用工具还是直接回复），触发并执行工具，捕获返回结果追加到上下文
3. LLM 判断任务完成，不再调用工具时退出循环
4. 安全兜底——防止死循环，设置最大迭代轮次上限（一般 10 到 20 轮）或 Token 消耗阈值

工程难点不在 while 循环本身，而在上下文管理。

任务越跑越久，上下文会越来越长。关键信息被稀释后，模型就容易跑偏。这也是 Context Engineering 要解决的问题。

LangChain、LlamaIndex、Spring AI 这些框架都对 Agent Loop 做了封装，但底层思路差不多。

### ReAct

ReAct 是 Reasoning + Acting，由 Shunyu Yao 等人在 2022 年提出，论文是[《ReAct: Synergizing Reasoning and Acting in Language Models》](https://react-lm.github.io/)。

LangChain、LlamaIndex、AgentScope 这类框架里的 Agent 模块，很多都能看到这个范式的影子。

它的思路很直观：模型先推理一步，拿到外部环境反馈，再推理下一步，交替进行。

LLM 自己容易缺少实时信息，也容易幻觉。ReAct 就让它“走一步看一步”，每一步都根据工具返回结果继续判断。

![ReAct-LLM](https://oss.javaguide.cn/github/javaguide/ai/agent/ReAct-LLM.png)

ReAct 落地时一般需要这几个组件配合：

1. 历史上下文，保存推理步骤、执行动作、反馈观察
2. 实时环境输入，比如系统告警、用户反馈等外部变量
3. LLM 推理模块：负责逻辑分析和下一步规划
4. 工具集与技能库，包括原子工具和 Skills
5. 反馈观察机制，采集工具响应并追加回上下文

![ReAct 模式流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-react-flow.png)

ReAct 的好处是能减少幻觉，复杂任务成功率更高，也比较容易解释每一步为什么这么做。

代价也明显：多轮迭代会增加响应延迟，效果还很依赖工具和 Skills 的质量。

### Plan-and-Execute

Plan-and-Execute 是 LangChain 团队在 2023 年提出的模式。

它的做法是先让 LLM 制定全局分步计划，再由执行器按步骤完成。

它适合步骤多、依赖关系明确的长期任务。相比 ReAct 边想边做，它更不容易在长任务里迷路。

但它也有问题。计划一旦定下来，执行过程里的动态调整和容错会弱一些，更接近静态工作流。

实际项目里，两种模式可以组合。

先用 CoT 生成全局步骤，再在每个步骤内部嵌入 ReAct 子循环。这样既有全局结构，也保留局部灵活性。

### Workflow、Graph 与 Loop

前面一直在说“工作流”，但如果不把它和 Agent 的区别讲清楚，后面选型很容易乱。

很多人一听 Agent，就默认应该让模型自己规划、自己调用工具、自己跑完全程。听起来很智能，实际落地不一定稳。

纯 Agent 里，LLM 是决策者。每一步要不要调工具、调哪个工具、下一步怎么走，主要靠模型推理。你给它一个任务，它自己尝试把任务跑完。

AI 工作流里，LLM 只是流程里的一个节点。整条流程的骨架，比如步骤顺序、条件跳转、失败重试，都是你提前设计好的。控制权在图结构里，不在模型手里。

Agentic Workflows 则是两者混着用：全局用 Workflow 管住结构，在某些不确定的节点里嵌入 Agent 子循环，让模型自己探索一小段。

AI 工作流的数据结构是有向图（Graph），三个元素：Node（节点）负责执行，Edge（边）负责控制流，State（状态）在节点之间共享上下文。

### Context Engineering

很多时候，Agent 做不好并非模型能力不足，而是上下文太乱。

Context Engineering 做的事情，就是在有限 Token 窗口里，把最有用的信息喂给模型，把噪声挡在外面。它很容易和 Prompt Engineering 混在一起。

Prompt Engineering 更偏提示词怎么写，Context Engineering 管得更宽，包括规则、记忆、工具描述、会话状态、外部观察结果、Token 预算。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

这块展开讲内容很多，可以单独看这篇：[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html) 和 [《上下文工程（Context Engineering）》](https://javaguide.cn/ai/agent/context-engineering.html)。

### Memory

![Agent 记忆分类全景图](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

记忆系统通常分两层：短期记忆和长期记忆。短期记忆是 Session 级的，服务当前任务；长期记忆是跨 Session 的，负责把用户偏好、历史决策、过往经验沉淀下来。两者在物理和逻辑上都应该分开，不要混成一锅。

![AI Agent 记忆系统架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-arch.png)

按功能目的看，Agent 记忆可以分成三类。

| 功能类型 | 核心问题           | 存储内容                     | 典型场景               |
| -------- | ------------------ | ---------------------------- | ---------------------- |
| 事实记忆 | 智能体知道什么     | 用户偏好、环境状态、显式事实 | 记住用户的技术栈偏好   |
| 经验记忆 | 智能体如何改进     | 过往轨迹、成败教训、策略知识 | 从失败的代码审查中学习 |
| 工作记忆 | 智能体当前思考什么 | 当前推理上下文、任务进展     | 多步推理中的中间状态   |

长期记忆和 RAG 技术上很像，都会用向量库和语义检索。但它们服务的对象不一样。

RAG 挂载的是可检索知识源，比如公司规章、产品文档、实时数据库查询结果。它既可以服务共享知识库，也可以根据用户、租户、角色和会话执行权限过滤或个性化检索。RAG 与长期记忆的主要区别在数据来源和生命周期：前者检索外部知识，后者保存交互中形成、需要跨会话复用的信息。

长期记忆管理的是 Agent 与特定用户交互中动态沉淀的个性化经验，比如用户偏好、习惯、历史决策、专属背景。它高度个性化，因人而异。

![长期记忆与 RAG（检索增强生成）的区别](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-rag-vs-memory.svg)

### MCP

MCP 全称是 Model Context Protocol，中文一般叫“模型上下文协议”。

把 MCP 的全称拆开来看，其实就很清晰了：

- Model：面向大模型应用；
- Context：把外部上下文、工具和数据源带给模型；
- Protocol：用一套标准协议把交互方式定下来。

不过，也不要把 MCP 理解成给模型加插件这么简单。之前在星球群里看大家讨论 MCP 的时候，有不少同学都是这样认为的。

更准确一点说，MCP 是 **MCP Client 和 MCP Server 之间的通信协议**。Host 负责承载用户交互和模型调用，Client 负责和 Server 说话，Server 负责把具体能力暴露出来。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

不少读者朋友第一次了解 MCP，都会将它和 Function Calling、Agent、Skills 混在一起。

这几个确实经常一起出现，但不在同一层。

Function Calling 解决的是：**模型怎么表达自己想调工具。**

MCP 解决的是：**这个工具从哪里来，怎么被宿主发现，怎么真正连到后端服务。**

Agent 再往上一层，关注的是：**任务怎么一步步做完。**

![FC/MCP/Agent 三层关系图](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-fc-agent-layer.png)

### Skills

简单说，Skill 是一份可被 Agent 发现、按需加载的任务说明。

它会把某类任务的经验、约束和执行顺序沉淀下来，让 Agent 在需要时再读。接口返回格式怎么统一，日志字段怎么打，慢 SQL 怎么查，Review 时先看架构还是先看异常处理——以前这些东西要么散在文档里，要么靠人反复提醒，Skills 给了它们一个固定落脚点。

所以，不要把 Skill 想成一个神秘的新能力。它更像是把“老员工脑子里的规矩”写进 `SKILL.md`，再交给 Agent 在合适的任务里调用。

先说结论：Skill 不是 Prompt、MCP、Function Calling 的替代品，它们也不是同一层的四个竞品。放到一条 Agent 执行链路里看，关系会清楚很多。

用户说一句“帮我分析这份报表”，这是 **Prompt**。模型判断需要调用 `read_file`，并生成结构化参数，这是 **Function Calling**。`read_file` 这个能力如果来自 MCP Server，那 **MCP** 负责的是连接和协议。至于“分析报表时先看字段含义，再看异常值，最后给业务结论，不要直接堆统计指标”，这才是 **Skill** 适合放的东西。

![ Skill 和 Prompt、MCP、Function Calling 对比](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-prompt-function-calling-mcp-comparison.webp)

放在一个真实链路里，大概是这样：

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-agent-execution-link.webp)

1. 用户提出任务（Prompt）
2. 宿主把可用 Skills 的简短描述放进上下文（Skill 元数据）
3. 模型判断当前任务命中了某个 Skill（Skill 路由）
4. 宿主再把完整 `SKILL.md` 加载进来（延迟加载）
5. 模型按照 Skill 里的流程去调工具、读资料、写结果（执行）

### Harness Engineering

可以先用一个粗暴但好记的说法：Agent = Model + Harness。你不是模型，那你做的东西大概率就是 Harness。

这个说法有点绝对，但抓住了重点。Harness 指的是模型之外的整套系统：系统提示词、工具调用、文件系统、沙箱环境、编排逻辑、钩子中间件、反馈回路、约束机制。模型只提供推理和生成能力，Harness 把状态、工具、反馈、执行环境和安全边界串起来，Agent 才能真正开始干活。

LangChain 的 Vivek Trivedi 写过一篇《The Anatomy of an Agent Harness》，里面有个思路很值得记：先分清模型负责什么，再看剩下的系统该补什么。用这条线一切，很多 Agent 问题就不再是“模型行不行”，而是“系统有没有把模型需要的东西准备好”。

可以把模型想成 CPU，把 Harness 想成操作系统。CPU 再强，OS 如果天天崩，体验也不会好。你买了最新的 M5 芯片，但系统卡死、驱动乱飞，实际体验可能还不如旧芯片配一个稳定系统。

![Agent = Model + Harness](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-agent-equals-model-harness-arch.png)

Prompt Engineering、Context Engineering、Harness Engineering 不太适合放在同一层比较。它们更像一层套一层，处理的问题范围越来越大。

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

| 层级                | 解决的问题                         | 关注点                                     | 典型工作                                  |
| ------------------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Prompt Engineering  | 怎么把指令说清楚                   | 让模型理解意图，减少局部歧义               | 系统提示词设计、Few-shot 示例、思维链引导 |
| Context Engineering | 该给 Agent 看什么                  | 在合适时机给模型提供正确且必要的信息       | 上下文管理、RAG、记忆注入、Token 优化     |
| Harness Engineering | 系统怎么持续执行、纠偏、观测和恢复 | 长链路任务中的持续正确、偏差修正、故障恢复 | 文件系统、沙箱、约束执行、反馈回路、观测  |

### Loop Engineering

如果用一句话概括，可以这么理解：

**Loop Engineering 是围绕 Agent 设计可持续运行的反馈循环，让它在明确目标、工具、上下文、验证信号和停止条件下反复行动，直到任务完成、失败或需要人工接管。**

落到工程上，主要看这些点：

- 触发：谁来启动这轮任务？手动命令、定时任务、CI 失败、PR 创建、Issue 更新，还是某个消息事件。
- 目标：什么状态算完成？全部测试通过、CI green、覆盖率达到某个数值、页面截图对齐设计稿，还是只生成待人工确认的草稿。
- 上下文：Agent 每轮要看哪些文件、规则、历史状态、工具结果和项目约定。
- 行动：Agent 能改代码、跑测试、查 GitHub、读日志、发 PR，还是只能输出建议。
- 观察：它怎么知道刚才那一步做对了？测试输出、lint、类型检查、截图、审查评论、日志摘要都可以是观察结果。
- 状态：这轮试过什么、失败在哪里、下一步做什么，要写到外部文件、Issue、Linear 卡片或数据库里，不能只靠当前对话记住。
- 停止：什么时候退出，什么时候转人工，什么时候因为预算或轮次耗尽直接停。

![Loop Engineering 外层循环](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-outer-loop.webp)

Agent Loop 很早就有了。一个最简单的 Agent 本来就是：

1. 读取当前上下文。
2. 让 LLM 判断下一步。
3. 调用工具或输出答案。
4. 把工具结果写回上下文。
5. 继续下一轮，直到触发停止条件。

ReAct 也是这个思路：Reasoning 和 Acting 交替进行，模型走一步看一步，拿到外部反馈后再决定下一步。

## RAG

相关原文：

- [RAG 基础概念：检索、生成与工程取舍](./rag/rag-basis.md)
- [RAG 向量索引算法和向量数据库](./rag/rag-vector-store.md)
- [RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理](./rag/rag-document-processing.md)
- [RAG 优化：从召回、重排到上下文工程](./rag/rag-optimization.md)
- [GraphRAG：用图结构补充向量检索](./rag/graphrag.md)

### 什么是 RAG？

**RAG（Retrieval-Augmented Generation，检索增强生成）** 就是把信息检索和大语言模型绑在一起用。系统先从知识库里检索出和当前问题相关的片段，知识库可以是数据库、文档集合，也可以是企业内部系统。然后把这些片段和原始问题一起喂给 LLM，让模型基于检索内容回答，而不是只靠训练时记住的知识。

![RAG 示意图](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-simplified-architecture-diagram.jpeg)

LLM 训练数据再大，也绕不开几个问题。RAG 正好可以在这些地方进行弥补。

**第一是知识时效性。**

预训练模型的知识会停在训练数据截止时间点。训练后发生的新事件、新政策、新产品文档，模型默认是不知道的，除非通过联网、工具调用或外部知识注入来补。RAG 的做法是动态检索外部知识源，把最新的相关内容直接送给 LLM，让它不用只依赖参数里的旧知识。

**第二是私有数据访问。**

企业内部的产品文档、知识库、客户数据，不可能让公开 LLM 随便访问。RAG 在用户提问时只提取和问题相关的片段给 LLM，不需要暴露全部数据，模型也能基于企业自己的知识回答。

**第三是幻觉问题。**

LLM 编造事实这件事大家都遇到过。RAG 通过提供明确参考文本，让模型尽量基于证据回答，确实能降低幻觉概率。但别指望它彻底消除幻觉。检索错误、上下文噪声、引用错配、模型不遵循指令，都可能导致错误答案。生产级 RAG 通常还要配引用校验、答案评估、拒答机制和人工反馈闭环。

### RAG 工作原理

RAG 的工程链路通常分两个阶段：离线索引和在线检索生成。索引阶段把原始文档处理成可检索的数据结构；在线阶段在用户提问时完成查询理解、检索召回、上下文构建和答案生成。

索引和检索阶段的简化流程图如下：

![索引和检索阶段的简化流程图](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-rag-engineering-link.png)

索引阶段主要做这些事：

1. 输入文档：文本文件、PDF、网页、数据库记录都可以，只要有内容。
2. 清理文档：去掉 HTML 标签、特殊字符等噪声。
3. 增强文档：补充元数据，比如时间戳、分类标签，为后续检索提供过滤维度。
4. 文档拆分（Chunking）：用文本分割器把文档切成较小片段。这一步要兼顾语义完整性、Embedding 模型输入长度、生成模型上下文窗口和召回粒度。Chunk 太大容易引入噪声，太小又可能丢上下文。拆分策略会直接影响召回质量，详细可以看 [RAG 文档处理篇](./rag/rag-document-processing.md)。
5. 向量化表示（Embedding Generation）：通过嵌入模型将文本片段映射为语义向量，也就是高维稠密向量。常见嵌入模型包括 OpenAI 的 `text-embedding-3-small` / `text-embedding-3-large`，以及 Hugging Face 上的开源模型。
6. 存储到向量存储或索引系统：把嵌入向量、原始内容和对应元数据存入向量存储或向量索引系统，比如 Milvus、pgvector、Elasticsearch / OpenSearch 向量检索，或基于 Faiss 构建本地向量索引。向量数据库选型、索引算法和 pgvector 实践可以看 [RAG 向量库篇](./rag/rag-vector-store.md)。

### Embedding

Embedding 就是把文本变成一串数字。更准确地说，它会把文本映射到一个高维稠密向量空间里，让语义接近的文本在向量空间中距离更近。

比如这三句话：

- “如何申请退款？”
- “退款流程是什么？”
- “订单怎么取消并退钱？”

它们字面不一样，但语义接近。好的 Embedding 模型会把它们映射到相近位置，向量检索才能把相关 Chunk 找出来。

![Embedding：把文本映射到语义空间](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-2-embedding-map-text-to-semantic-space.png)

Embedding 维度常见的有 768、1024、1536、3072 等。维度是模型设计和训练方式的一部分，不能脱离模型直接得出“维度越高，语义效果越好”的结论；较高维度通常会增加存储、索引和相似度计算成本。以 OpenAI Embedding 为例，`text-embedding-3-small` 默认输出 1536 维，`text-embedding-3-large` 默认输出 3072 维，并支持通过 `dimensions` 参数降低输出维度。

### 向量检索与向量数据库

RAG 的检索流程里，最基础的一步是：把用户问题和文档都变成向量，再用相似度搜索找到最相关的文档片段。

可以把它理解成这样：

1. 文档进入知识库后，先被切成 Chunk。
2. 每个 Chunk 通过 Embedding 模型转成一个向量。
3. 向量和原文、元数据一起写入向量数据库。
4. 用户提问时，问题也会被转成查询向量。
5. 向量数据库检索出最相似的 Top-K 文档向量。
6. 系统把这些文档片段放进 Prompt，交给 LLM 生成答案。

![Embedding 和向量检索是什么关系？](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-embedding-vector-retrieval.png)

Embedding 负责把文本变成可比较的向量，向量检索据此查找语义接近的内容。向量检索只是 RAG 的一种实现；RAG 还可以使用 BM25、SQL、知识图谱、搜索 API 或其他业务查询来取得外部证据。

在小规模 Demo 里，几千条文档向量可以直接放在内存里暴力搜索。但真实 RAG 系统里，文档量很快会到百万级、千万级，甚至更大。

向量数据库解决的不是“存一个数组”这么简单，而是几个工程问题：

![RAG 场景为什么需要向量数据库？](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-why-need-vector-store.png)

### 文档处理

在说具体策略之前，先把链路画清楚。文档从上传到进入向量库，中间要经过至少六个环节：

![RAG 文档处理总链路：上传前半段决定了后半段效果上限](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-document-processing-overall-link.png)

这张图里有个容易忽略的点：质量校验不应该只发生在入库之后。在 Chunking 阶段做完采样校验，能提前发现问题，避免把低质量数据大批量写入向量库。

每个环节的核心风险：

| 环节        | 典型问题                           | 最终影响                   |
| ----------- | ---------------------------------- | -------------------------- |
| 文件上传    | 格式伪造、大小超限、编码混乱       | 解析器崩溃或静默失败       |
| 格式校验    | 扩展名和实际 MIME 类型不符         | 选错解析器                 |
| Layout 解析 | PDF 多栏、表格合并单元格、页眉页脚 | 结构丢失、上下文错位       |
| 清洗去噪    | 乱码、特殊字符、重复空行、目录残留 | 噪声入索引、Embedding 失真 |
| Chunking    | 语义截断、上下文断裂、块太大或太小 | 召回不准、答案残缺         |
| Metadata    | 没保存来源、页码、版本、权限       | 无法过滤、无法引用         |
| 入库        | 向量维度不一致、Token 超限         | 检索失败、索引损坏         |

很多团队把精力放在换哪个 embedding 模型上面，但实际上如果数据在这一步就已经坏掉了，换模型只会让损坏更稳定。

### Chunking

![如何选择合适的切分策略？](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-document-processing-chunking-strategy.png)

如果文档本身有清晰结构，按结构切通常更合适。NVIDIA 的一组测试中，Page-Level Chunking（按页面切分）在金融报告和法律文档上表现最好，平均准确率为 0.648，方差也最低。页面边界在这类材料中经常承载章节或版式语义，切分时应尽量保留。

不过别盲目迷信页面级切分。这个优势相对于 Token 切分其实只有 0.3-4.5 个百分点，而且在 FinanceBench 数据集上，1024-token 切分反而比页面级更优（0.579 vs 0.566）。NVIDIA 测试的文档类型（金融报告、法律文档）是分页本身就携带语义的场景——如果你的 PDF 是 Word 随便导出的那种，页面级切分不会带来额外收益。另外，查询类型也影响最优策略：事实型查询适合 256-512 Token 的小块，分析型查询适合 1024+ Token 或页面级切分。

不同文档类型可以先从下面的切分方式开始评测：

| 文档类型 | 推荐切分方式                  | 实现工具                          |
| -------- | ----------------------------- | --------------------------------- |
| Markdown | 按标题层级（H1/H2/H3）切      | `MarkdownHeaderTextSplitter`      |
| HTML     | 按标签层级切（h1~h6、p、div） | `HTMLHeaderTextSplitter`          |
| PDF      | 按页或章节切                  | `chunk_by_title`、`chunk_by_page` |
| 代码     | 按函数、类、包切              | `PythonCodeTextSplitter`          |
| 论文     | 按章节、段落、表格切          | Layout-aware Parser               |

做 RAG 的人迟早会遇到一个矛盾：小块召回准但上下文残缺，大块保留完整但召回噪声大。你想召回精确就得切小块，但切小了模型只看到局部，回答就容易断章取义。

Parent-Child Chunk 就是解决这个矛盾的。具体做法是先把文档切成 300 Token 左右的小块用于向量检索，然后每个小块都挂载到一个 1200 Token 的父段落上。检索时先命中小块，再把对应父段落放入上下文。这样既保证了召回精度，又保留了必要的上下文。

### Hybrid Search

向量检索擅长语义相似，BM25 擅长精确词匹配。两者是互补关系，不是替代关系。

| 查询类型                  | 向量检索表现         | BM25 表现      | 建议               |
| ------------------------- | -------------------- | -------------- | ------------------ |
| “如何取消订阅”            | 能匹配“关闭自动续费” | 可能匹配不到   | 保留向量召回       |
| “错误码 E1027”            | 可能召回泛化故障     | 精确命中错误码 | 必须保留关键词召回 |
| “ABX-4421 型号参数”       | 容易找相似型号       | 精确命中 SKU   | 必须保留关键词召回 |
| “Java 线程池拒绝策略区别” | 语义理解较好         | 能匹配关键词   | 混合更稳           |
| “最新 v3.2 价格政策”      | 需要语义和时间条件   | 可匹配版本号   | Metadata + Hybrid  |

Hybrid Search 常见做法是两路召回后融合：

- 向量检索返回语义相似候选。
- BM25 或稀疏向量返回关键词候选。
- 用 RRF 或归一化加权分数合并。
- 对合并后的候选去重，再进入 Rerank。

Microsoft Azure AI Search、Google Vertex AI Vector Search、Weaviate 等官方文档都把 Hybrid Search 和 RRF 作为常见融合方式。RRF 的好处是不用强行比较 BM25 分数和向量余弦分数，按排名位置做融合，调参负担更低。

但别把 Hybrid Search 神化。

如果你的文档高度结构化、关键词很少，Hybrid 带来的增益可能有限；如果你的查询大量包含错误码、产品型号、配置项、专有名词，纯向量检索很容易翻车。

### Query Rewrite

用户的问题通常不是为检索系统写的。

他们会说：

- “这个报错咋整？”
- “钱能退吗？”
- “线上那个限流问题是不是又来了？”

这些问题对人来说有上下文，对检索系统来说却很模糊。Query Rewrite 的目标是：**不改变用户意图，把问题改写成更适合召回的表达**。

常见策略如下：

| 策略                | 适用场景                   | 例子                                                        |
| ------------------- | -------------------------- | ----------------------------------------------------------- |
| 规范化改写          | 口语化、缩写、上下文缺失   | “钱能退吗”改成“退款政策、退款条件、退款流程”                |
| Multi-Query         | 表达可能有多种说法         | 同时检索“取消订阅”“关闭自动续费”“停止会员计划”              |
| Query Decomposition | 问题包含多个子问题         | 把“对比 Stripe 和 Square 的手续费和争议处理”拆成 4 个子问题 |
| Step-back Query     | 问题太细，缺背景           | 先检索“订阅计费规则”，再回答具体取消问题                    |
| HyDE                | 查询太短，和文档形态差异大 | 先生成假设答案，再用假设答案向量检索真实文档                |
| Self-Query          | 问题里包含过滤条件         | 从“查 2025 年 Java 相关政策”提取年份和类别过滤              |

LangChain 的 MultiQueryRetriever、SelfQueryRetriever 等组件就是这类思路的工程化实现。

这里有个坑：**Query Rewrite 必须保留原始问题**。不要只用改写后的查询。工程上可以让原始 query 和改写 query 一起召回，然后融合结果。否则改写模型一旦理解错意图，后面召回全偏。

### Rerank

向量检索用的是双塔模型思路：query 和 document 分别编码，再算向量距离。它快，但不够细。

Rerank 通常使用 Cross-Encoder 或专用重排模型，把 query 和候选文档放在一起打分。它慢一些，但能更细粒度判断“这段文本是否真的能回答这个问题”。

向量相似度更像“这两段话语义接近吗”，Rerank 更像“这段话能不能回答这个问题”。

举个例子：

用户问：“线程池为什么会触发拒绝策略？”

向量召回可能找出这些片段：

1. 线程池核心参数说明。
2. 拒绝策略枚举列表。
3. 队列满、线程数达到 maximumPoolSize 后触发拒绝策略的条件。
4. 线程池使用示例代码。

第 1、2 条语义很接近，但第 3 条才是答案核心。Rerank 的价值就是把第 3 条顶上来。

推荐链路是：

1. Metadata 预过滤。
2. Hybrid Search 粗召回 30 到 100 条。
3. 去重和相邻片段合并。
4. Rerank 选出 5 到 10 条。
5. 上下文压缩后放入 Prompt。

### GraphRAG

![什么是 GraphRAG？](https://oss.javaguide.cn/github/javaguide/ai/rag/graphrag-simplified-architecture-diagram.png)

GraphRAG（Graph-based Retrieval-Augmented Generation）是一类把图结构用于检索增强的方案。系统可以把文档中的实体、关系和结构化上下文显式建模，查询时沿图关系收集证据，再交给大模型生成答案。

注意，GraphRAG 的重点不是“用了图数据库”，而是**检索对象变了**。

传统向量 RAG 主要检索文本 Chunk。GraphRAG 可以检索节点、边、图路径和原始文本证据；社区摘要是 Microsoft GraphRAG 等实现采用的一种索引形式，并非所有 GraphRAG 系统都要求使用。

打个比方：

- **向量 RAG** 像在图书馆里按语义找几页相似内容。
- **GraphRAG** 像先整理出人物关系图、事件时间线和主题目录，再沿着关系线索找证据。

向量 RAG 擅长判断“这段话和我的问题像不像”，GraphRAG 更擅长理解“这些对象之间到底怎么连起来”。

![GraphRAG 和传统向量 RAG 的本质区别](https://oss.javaguide.cn/github/javaguide/ai/rag/graphrag-vs-rag.png)

| 维度     | 传统向量 RAG               | GraphRAG                               |
| -------- | -------------------------- | -------------------------------------- |
| 检索对象 | 文本 Chunk                 | 实体、关系、路径、社区摘要、原文片段   |
| 核心能力 | 语义相似度召回             | 关系推理、图遍历、全局主题聚合         |
| 数据结构 | 向量索引为主               | 知识图谱 + 向量索引 + 全文索引         |
| 适合问题 | 局部事实问答、文档片段解释 | 多跳关系问答、跨文档归纳、复杂业务分析 |

<!-- @include: @article-footer.snippet.md -->
