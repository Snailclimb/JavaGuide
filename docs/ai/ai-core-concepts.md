---
title: AI 核心概念总览：LLM、Agent、RAG、MCP 与系统设计
description: 汇总 JavaGuide AI 专题中的核心概念，按大模型基础、Agent、RAG 和系统设计四条主线串联 Token、Function Calling、Agent Loop、MCP、Skills、多 Agent、Embedding、Rerank、模型网关、评测、可观测性与安全等内容。
category: AI
tag:
  - AI
  - 大模型
  - AI Agent
  - RAG
  - MCP
  - AI 系统设计
head:
  - - meta
    - name: keywords
      content: AI核心概念,大模型核心概念,LLM,Token,Agent,Agent Loop,ReAct,Plan-and-Execute,RAG,Embedding,MCP,Skills,多Agent,Prompt Engineering,Context Engineering,Function Calling,Tool Calling,GraphRAG,LLM Gateway,AI评测,AI可观测性,Prompt Injection,语音Agent
---

<!-- @include: @small-advertisement.snippet.md -->

模型为什么每次回答不完全一样？Agent 为什么需要循环？RAG 已经检索到文档，为什么仍然可能答错？这些问题分别落在模型生成、任务执行、知识检索和应用治理几条链路上。

本文把 JavaGuide AI 专题中的相关概念放到一起，具体实现和案例仍由各专题文章展开。

## 大模型基础

相关原文：

- [LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出](./llm-basis/llm-operation-mechanism.md)
- [大模型 API 调用工程实践：流式输出、重试、限流与结构化返回](./llm-basis/llm-api-engineering.md)
- [大模型提示词工程（Prompt Engineering）是什么？提示词技巧有哪些？](./agent/prompt-engineering.md)
- [大模型结构化输出：从 JSON 契约到 Function Calling 落地](./llm-basis/structured-output-function-calling.md)
- [AI 应用评测体系：从 Golden Set 构建到线上灰度闭环](./llm-basis/llm-evaluation.md)

### LLM

输入法看到“今天天气真”时，可能把“好”放在候选词里。自回归大模型的生成过程与此类似：它根据当前上下文预测一个 Token，把结果追加到上下文，再预测下一个，直到遇到结束标记或达到输出限制。这个过程称为**自回归生成（Autoregressive Generation）**。

一次生成里，Token 是模型逐步处理和输出的文本单元；上下文窗口限制单次调用能够容纳的 Token 总量；Temperature、Top-p 等参数影响候选 Token 的采样；Max Tokens 控制本次输出最多占用多少 Token。

### Token

模型先用 Tokenizer 把文本切成大小不等的片段。这里没有固定的“一字一 Token”或“一词一 Token”：英文单词可能被拆开，中文词也可能拆成多个 Token，某些高频字词又可能合在一起。

逐字切分会拉长序列，整词切分则需要很大的词表。BPE、Unigram 等**子词切分算法**在两者之间取舍：高频片段尽量保留，低频词继续拆分。具体切分结果由模型供应商使用的 Tokenizer 决定。

容量规划可以先按经验估算，计费和监控则应读取 API 返回的实际 `usage`。

**Token 化过程示例**：

- 原文：`你好，我是小 G。`
- 切分：`[你好]` `[，]` `[我是]` `[小 G]` `[。]`
- 统计：原文 9 字符 → Token 数 5 个 → 压缩比约 1.8 倍

![Token 化过程示例](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-token-process.png)

上面的切分只用于说明过程，不代表某个具体模型的真实结果。不同供应商或模型使用的 Tokenizer 不同，同一段文本得到的 Token 序列也可能不同。

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

这些内容会共同占用窗口，因此能留给业务正文的空间往往远小于标称上限。

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

模型随后按这个概率分布采样，决定输出哪个 Token。

解码参数（Temperature、Top-p、Top-k 等）就是在这个“打分 → 概率 → 抽签”的过程中施加控制：

- Temperature：调整概率分布的“形状”，让高分选项更突出，或者让各选项更均匀。
- Top-p / Top-k：直接砍掉不靠谱的候选项，缩小“抽签池”。
- Penalty 系列：对已经出现过的词降分，防止“复读机”。

![Temperature 参数：控制模型输出的随机性](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-temperature-params.png)

### Prompt

Prompt 是输入给大语言模型（LLM）的任务指令。LLM 根据当前上下文生成后续 Token，也能表现出一定的语义理解和指令跟随能力；但任务边界不清时，它仍可能偏题或补写不存在的信息。

Prompt 的作用是缩小模型的生成范围，质量与长度没有直接关系。比起堆叠修饰词，更重要的是交代清楚 Role、Task、Context 和 Format 四项信息。

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

这段结果可以阅读，却还不是后端能够稳定消费的契约。业务侧还要明确这些边界：

- `category` 只能是 `PAYMENT`、`LOGISTICS`、`AFTER_SALE`、`ACCOUNT`。
- `priority` 只能是 `LOW`、`MEDIUM`、`HIGH`。
- `confidence` 必须是 `0` 到 `1` 之间的小数。
- `reason` 可以为空吗？最大长度是多少？
- 如果用户输入缺少信息，应该返回 `NEED_MORE_INFO`，还是继续猜？

自然语言 Prompt 很难长期守住这些边界，还需要分清 JSON Mode、JSON Schema 和 Structured Outputs 各自负责什么：

- **JSON Mode** 是一种输出模式，约束模型返回合法 JSON。
- **JSON Schema** 是一种结构描述规范，用来定义 JSON 应该包含哪些字段、字段类型是什么、哪些必填、枚举值有哪些、是否允许额外字段。
- **Structured Outputs** 是模型供应商提供的结构化生成能力，它接收 JSON Schema 或类似 Schema，让模型在生成阶段尽量或严格贴合这份结构。

JSON Schema 负责描述契约，Structured Outputs、Function Calling / Tool Calling 等模型 API 能力负责在生成阶段应用这份契约。只提供 Schema 文本而没有对应的生成约束，模型仍可能返回不符合字段要求的内容。

![生成阶段三层约束：JSON Mode 管语法，JSON Schema 管契约，Structured Outputs 把契约前移到模型生成阶段](https://oss.javaguide.cn/github/javaguide/ai/llm/structured-output-function-calling-three-layer-constraint.png)

### Function Calling / Tool Calling

模型返回 `query_order` 和参数 `{"orderId": "1029384756"}` 时，Java 方法还没有执行。Function Calling / Tool Calling 只让模型生成结构化的调用意图，后端服务、Agent Runtime、MCP Host 或供应商托管环境才负责执行工具。

一次完整调用包含模型生成意图、业务校验、工具执行和结果回填：

![Function Calling 完整调用链路：模型只生成调用意图，真正执行工具的是业务侧](https://oss.javaguide.cn/github/javaguide/ai/llm/structured-output-function-calling-function-calling-pipeline.png)

1. 服务端注册工具名、用途和参数 Schema。
2. 用户提出“帮我查一下订单 1029384756 到哪了”。
3. 模型选择 `query_order`，并生成参数 `{"orderId": "1029384756"}`。
4. 业务侧校验字段类型、必填项、用户权限、订单归属和幂等键。
5. 校验通过后，业务侧再调用订单系统、数据库或 HTTP API。
6. 工具结果连同 `tool_use_id` 回填给模型。Anthropic 要求 `tool_use_id` 严格匹配，Gemini 3 也会为每个 `functionCall` 生成唯一 `id`；并行调用时缺少对应 ID，返回结果可能配错工具请求。
7. 模型根据工具结果组织最终回复。

### 生产级 LLM 调用

用户看到的一次模型回复，背后会经过业务校验、上下文组装、模型路由、供应商调用、响应解析和结果落库。某一段缺少状态记录或错误处理，页面上往往只剩一句笼统的“模型调用失败”。

生产系统至少要记录八个阶段：

1. 校验用户身份、租户、套餐、功能权限和请求大小。
2. 组装 System Prompt、用户输入、历史消息、RAG 证据、工具 Schema 和输出格式约束。
3. 预估输入 Token 并预留输出预算，必要时裁剪历史、压缩上下文或切换模型。
4. 通过统一客户端或模型网关选择模型、供应商、超时、重试和限流策略。
5. 调用供应商 API，接收同步响应或 SSE、WebSocket 等流式响应。
6. 解析增量文本、结束原因、工具调用、Token 用量、拒答和结构化结果。
7. 保存回答、调用尝试、成本、错误原因和业务状态。
8. 记录 Trace、TTFT、总耗时、重试次数、限流比例和解析失败率。

重试时还要区分错误类型。网络瞬断、部分供应商 5xx 和过载错误可以在总体截止时间内有限重试；参数错误、鉴权错误和安全拒答继续提交同一请求通常没有意义。只要存在重试，就要设计幂等键，并把业务消息、模型调用尝试和供应商请求分别记录，避免重复回答或重复执行带副作用的工具。

### AI 应用评测

公开 Benchmark 可以用来筛掉明显不合适的模型，不能代替业务验证。真实请求会带有错别字、口语缩写、截图、多语言和前后矛盾，少数高风险路径也可能被平均分掩盖。

业务评测通常从 Golden Set 开始。每条用例都要包含输入、预期结果或成功标准、场景标签和评分方式。RAG 需要分别评估检索与生成；Agent 除了最终回答，还要检查工具选择、参数、执行轨迹和外部系统的真实状态。

常用评分方式各有分工：

| 方法         | 适合检查的内容                                    | 主要限制                   |
| ------------ | ------------------------------------------------- | -------------------------- |
| 规则评测     | JSON 格式、字段完整性、枚举值、数值边界、测试结果 | 只能覆盖可明确编码的条件   |
| LLM-as-Judge | 相关性、忠实度、完整性、连贯性和语气              | 存在位置、长度等评分偏差   |
| 人工评测     | 高风险样本、复杂语义和争议结果                    | 速度慢、成本高、一致性难控 |

一套可持续的评测流程会把离线评测、生产 Trace 回放和线上灰度串起来：开发阶段用固定数据集比较版本，发布前回放真实轨迹，上线后从 Badcase 和用户反馈中补充样本。Prompt、模型、检索策略、工具版本和评测结果必须关联，否则分数变化后仍然找不到原因。

## Agent

相关原文：

- [AI Agent 核心概念：Agent Loop、Plan-and-Execute、A2A、Agentic Workflows、Tools 注册](./agent/agent-basis.md)
- [AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现](./agent/workflow-graph-loop.md)
- [上下文工程(Context Engineering) 是什么？和 Prompt Engineering 有什么区别？](./agent/context-engineering.md)
- [AI Agent 记忆系统：短期记忆、长期记忆与记忆演化机制](./agent/agent-memory.md)
- [多 Agent 协作系统设计：任务拆分、状态共享、冲突处理与失败恢复](./agent/multi-agent.md)
- [什么是 Model Context Protocol (MCP)？和 Function Calling、Agent 什么关系？](./agent/mcp.md)
- [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](./agent/skills.md)
- [Harness Engineering：六层检查框架、上下文管理与工程实践](./agent/harness-engineering.md)
- [Loop Engineering 是什么？为什么说它是新瓶装旧酒？](./agent/loop-engineering.md)

### 什么是 Agent？

普通模型调用生成一段文本后就结束了。Agent Runtime 会继续检查模型是否提出了工具调用，执行工具，把结果写回上下文，再让模型决定下一步。LangChain 等框架的 Agent 实现因此经常围绕一个循环展开。

这套系统通常写成：**Agent = LLM + Planning + Memory + Tools**。LLM 处理任务理解和决策，Planning 管理步骤与依赖，Memory 保存当前状态或历史信息，Tools 连接数据库、API、文件系统和代码执行环境。

![AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

短期记忆通常保留本次会话和任务状态，长期记忆负责跨会话复用用户偏好、历史决策或任务经验。工具执行产生的返回值属于 Observation（观察），运行时把它追加到上下文，模型才能根据真实结果继续判断。

### Agent Loop

Agent Loop 把模型决策和工具执行连成反馈循环。每轮读取当前上下文，由模型选择直接回复还是调用工具；运行时执行动作并保存结果，然后进入下一轮。

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

1. 初始化 System Prompt、工具列表和用户请求。
2. 模型读取上下文，返回文本或工具调用意图。
3. 运行时执行工具，把结果和状态写回上下文。
4. 模型不再调用工具时结束；达到轮次、Token、时间或费用上限时，由运行时强制停止。

循环本身并不复杂。任务持续时间变长后，历史消息、工具结果和中间状态会不断占用上下文，早期约束也可能被后续内容稀释。Context Engineering 负责决定哪些信息继续保留、何时压缩，以及下一轮真正需要看到什么。

### ReAct

ReAct 是 Reasoning + Acting，由 Shunyu Yao 等人在 2022 年提出，论文是[《ReAct: Synergizing Reasoning and Acting in Language Models》](https://react-lm.github.io/)。它把推理、行动和观察交替放进同一条轨迹：模型先决定一个动作，环境返回结果，下一轮再依据这份结果继续。

比如模型不知道订单当前状态时，可以先调用查询工具。订单系统返回“已支付、待发货”后，模型再决定直接回答，还是继续查询物流。外部结果给后续判断提供了依据，但不会自动保证答案正确。

![ReAct-LLM](https://oss.javaguide.cn/github/javaguide/ai/agent/ReAct-LLM.png)

落地 ReAct 时，运行时要保存执行历史和当前状态，向模型提供可用工具或 Skills，并把工具响应作为 Observation 关联到对应调用。系统告警、用户补充信息等环境变化，也要在后续轮次中更新。

![ReAct 模式流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-react-flow.png)

多轮工具调用会增加响应延迟和 Token 消耗，结果质量也受工具描述、参数校验、返回数据和停止条件影响。Trace 可以记录它执行过哪些动作，但模型输出的推理文本不能直接等同于内部决策机制。

### Plan-and-Execute

Plan-and-Execute 是 LangChain 团队在 2023 年提出的模式。规划阶段先产出步骤和依赖关系，执行器再逐项处理，因此更适合能够提前识别主要阶段的长任务。

全局计划能让依赖和完成条件更早暴露出来。环境或任务目标在执行中发生变化时，旧计划也可能失效，这时需要重新规划，而不是继续照着原步骤运行。

项目里可以用计划控制外层阶段，在某个步骤内部运行 ReAct 子循环。确定性依赖由计划约束，局部信息不足时再通过工具调用补齐。

### Workflow、Graph 与 Loop

Agent 把下一步选择交给模型，Workflow 则由代码或图结构预先规定节点顺序、条件跳转和失败处理。两者都能调用模型和工具，差别主要在控制权放在哪里。

步骤稳定、权限要求明确的流程通常交给 Workflow。遇到无法提前穷举的检索、分析或工具选择时，可以在某个节点中嵌入 Agent 子循环。这类 Agentic Workflow 由外层流程限制执行范围，局部决策再交给模型。

AI 工作流的数据结构是有向图（Graph），三个元素：Node（节点）负责执行，Edge（边）负责控制流，State（状态）在节点之间共享上下文。

### 多 Agent

多 Agent 管理的是能够独立完成子目标的执行者，多阶段 Prompt Chain 管理的是一条 Workflow 中的处理步骤。把一个角色拆成独立 Agent 的前提，是它拥有自己的 Prompt、工具、上下文、权限、运行状态和交付结果。

不同环节需要明显不同的工具、权限和上下文，或者任务能够拆成几个相对独立的方向时，多 Agent 才可能带来收益。若几个角色共用相同上下文和工具，只是分别生成相似文本，增加的主要是模型调用次数、延迟和归并成本。

常见编排方式包括：

| 模式               | 控制方式                                    | 适用场景                             |
| ------------------ | ------------------------------------------- | ------------------------------------ |
| Sequential         | 代码按固定顺序调用多个 Agent                | 步骤确定，前后依赖清楚               |
| Parallel           | 独立任务并行执行，完成后统一归并            | 多路检索、多维评审、投票             |
| Router             | 规则或模型把请求路由给一个或多个专家        | 业务域清楚、分类相对稳定             |
| Supervisor/Manager | 主 Agent 动态拆任务并调用子 Agent           | 子任务无法提前完全确定，需要统一答案 |
| Handoff            | 当前 Agent 把控制权和必要上下文交给其他角色 | 客服分流、分阶段对话                 |

角色拆分后还要定义任务契约，包括子目标、成功标准、依赖、允许使用的工具、输出 Schema、产物位置、超时、Token 预算和失败策略。多个 Agent 同时写共享状态或调用有副作用的工具时，仍然要靠幂等、版本控制、锁、补偿和检查点保证一致性，不能让模型自行协商写入顺序。

### Context Engineering

上下文混乱时，即使模型能力足够，Agent 也可能漏掉约束、重复调用工具或偏离当前任务。

Context Engineering 负责在有限的 Token 窗口中选择、组织和更新模型当前需要的信息，包括规则、记忆、工具描述、会话状态、外部观察结果和 Token 预算。Prompt Engineering 更关注指令本身如何表达，是其中一个更局部的问题。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

进一步的设计方法见[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html)和[《上下文工程（Context Engineering）》](https://javaguide.cn/ai/agent/context-engineering.html)。

### Memory

![Agent 记忆分类全景图](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

记忆系统通常分两层：短期记忆和长期记忆。短期记忆是 Session 级的，服务当前任务；长期记忆跨越 Session，保存需要复用的用户偏好、历史决策和任务经验。两类数据的生命周期、权限和更新方式不同，存储时应在逻辑上分开。

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

MCP 全称是 Model Context Protocol，中文一般叫“模型上下文协议”。名称中的三个词对应了协议的适用范围：

- Model：面向大模型应用；
- Context：把外部上下文、工具和数据源带给模型；
- Protocol：用一套标准协议把交互方式定下来。

MCP 定义了 **MCP Client 和 MCP Server 之间的通信方式**。Host 承载用户交互和模型调用，Client 与 Server 通信，Server 对外提供具体能力；模型本身不会因为接入 MCP 而获得内置插件。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

Function Calling、MCP、Agent 和 Skills 经常出现在同一套系统里，但各自处理不同问题：Function Calling 让模型表达调用工具的意图；MCP 规定宿主如何发现外部能力并连接后端服务；Agent 负责在多轮执行中决定下一步；Skills 则保存完成某类任务所需的流程和经验。

![FC/MCP/Agent 三层关系图](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-fc-agent-layer.png)

### Skills

用户提出“帮我分析这份报表”时，Prompt 只表达了当前任务。模型若要读取文件，会通过 Function Calling 生成 `read_file` 的结构化参数；这个工具可以由 MCP Server 提供。至于分析顺序，例如先核对字段含义，再查异常值，最后结合业务解释结果，更适合写进 Skill。

Skill 是一份可被 Agent 发现、按需加载的任务说明。接口格式、日志字段、慢 SQL 排查顺序、代码 Review 的检查重点等团队经验，都可以放进 `SKILL.md`，避免每次把整套规则写进 Prompt。它与 Prompt、Function Calling 和 MCP 分别处理任务输入、调用意图、工具连接和执行方法，职责可以同时出现在一次任务里。

![ Skill 和 Prompt、MCP、Function Calling 对比](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-prompt-function-calling-mcp-comparison.webp)

Skill 的加载和执行包含五步：

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-agent-execution-link.webp)

1. 用户提出任务（Prompt）
2. 宿主把可用 Skills 的简短描述放进上下文（Skill 元数据）
3. 模型判断当前任务命中了某个 Skill（Skill 路由）
4. 宿主再把完整 `SKILL.md` 加载进来（延迟加载）
5. 模型按照 Skill 里的流程去调工具、读资料、写结果（执行）

### Harness Engineering

模型负责推理和生成，却不会自行保存任务状态、限制文件权限、执行测试或处理工具超时。系统提示词、工具调用、文件系统、沙箱、编排、Hooks、反馈和约束机制共同组成 Harness。工程上常用 **Agent = Model + Harness** 提醒开发者：模型之外的运行环境同样决定任务能否持续执行。

Vivek Trivedi 在《The Anatomy of an Agent Harness》中也采用了先区分模型职责、再检查外围系统的思路。排查 Agent 时，除了模型输出，还要看上下文是否完整、工具是否可用、执行环境是否受控，以及失败后能否恢复。

![Agent = Model + Harness](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-agent-equals-model-harness-arch.png)

Prompt Engineering、Context Engineering 和 Harness Engineering 的作用范围不同。Prompt 关注指令表达，Context 决定当前调用要提供哪些信息，Harness 管理模型之外的执行、验证、观测和恢复机制。

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

| 层级                | 解决的问题                         | 关注点                                     | 典型工作                                  |
| ------------------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Prompt Engineering  | 怎么把指令说清楚                   | 让模型理解意图，减少局部歧义               | 系统提示词设计、Few-shot 示例、思维链引导 |
| Context Engineering | 该给 Agent 看什么                  | 在合适时机给模型提供正确且必要的信息       | 上下文管理、RAG、记忆注入、Token 优化     |
| Harness Engineering | 系统怎么持续执行、纠偏、观测和恢复 | 长链路任务中的持续正确、偏差修正、故障恢复 | 文件系统、沙箱、约束执行、反馈回路、观测  |

### Loop Engineering

Loop Engineering 为 Agent 的重复执行补齐触发、目标、上下文、验证、状态和停止条件。每一轮都要留下可检查的结果，任务完成、失败、预算耗尽或需要审批时退出循环。

落到工程上，主要看这些点：

- 触发：谁来启动这轮任务？手动命令、定时任务、CI 失败、PR 创建、Issue 更新，还是某个消息事件。
- 目标：什么状态算完成？全部测试通过、CI green、覆盖率达到某个数值、页面截图对齐设计稿，还是只生成待人工确认的草稿。
- 上下文：Agent 每轮要看哪些文件、规则、历史状态、工具结果和项目约定。
- 行动：Agent 能改代码、跑测试、查 GitHub、读日志、发 PR，还是只能输出建议。
- 观察：它怎么知道刚才那一步做对了？测试输出、lint、类型检查、截图、审查评论、日志摘要都可以是观察结果。
- 状态：这轮试过什么、失败在哪里、下一步做什么，要写到外部文件、Issue、Linear 卡片或数据库里，不能只靠当前对话记住。
- 停止：什么时候退出，什么时候转人工，什么时候因为预算或轮次耗尽直接停。

![Loop Engineering 外层循环](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-outer-loop.webp)

最小循环可以写成一条执行链：读取上下文 → 判断下一步 → 调用工具或输出答案 → 回写结果 → 检查停止条件。ReAct 把 Reasoning 和 Acting 交替放进这条循环；Loop Engineering 还要处理循环外部的触发、验证、持久化、预算和人工接管。

## RAG

相关原文：

- [RAG 基础概念：检索、生成与工程取舍](./rag/rag-basis.md)
- [RAG 向量索引算法和向量数据库](./rag/rag-vector-store.md)
- [RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理](./rag/rag-document-processing.md)
- [RAG 优化：从召回、重排到上下文工程](./rag/rag-optimization.md)
- [GraphRAG：用图结构补充向量检索](./rag/graphrag.md)
- [RAG 知识库文档如何更新：增量更新、版本控制、去重与全量重建](./rag/rag-knowledge-update.md)

### 什么是 RAG？

**RAG（Retrieval-Augmented Generation，检索增强生成）** 把信息检索接入大语言模型的生成过程。系统先从数据库、文档集合或企业内部系统中查找与问题相关的内容，再把检索结果和原始问题一起交给 LLM。模型由此获得参数知识之外的证据。

![RAG 示意图](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-simplified-architecture-diagram.jpeg)

RAG 主要补充三类信息缺口：

- **知识时效性**：预训练模型的参数知识停在训练数据截止时间点。RAG 可以在请求发生时检索新事件、政策和产品文档。
- **私有数据访问**：企业产品文档、知识库和客户数据不在公开训练语料中。应用可以先按用户权限检索，再只提供回答所需的片段。
- **答案依据**：检索证据能约束模型的回答范围，但不能彻底消除幻觉。检索错误、上下文噪声、引用错配和模型不遵循指令仍会产生错误答案，生产系统还要配合引用校验、答案评估、拒答和人工反馈。

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

向量数据库除了保存向量，还要处理相似度索引、元数据过滤、更新删除、并发查询和持久化等工程问题：

![RAG 场景为什么需要向量数据库？](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-why-need-vector-store.png)

### 文档处理

文档从上传到进入向量库，中间要经过至少六个环节：

![RAG 文档处理总链路：上传前半段决定了后半段效果上限](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-document-processing-overall-link.png)

质量校验不应只发生在入库之后。Chunking 阶段完成采样校验，可以提前发现问题，避免把低质量数据大批量写入向量库。

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

不同文档类型可以先选一组符合其结构的切分方式，再用业务查询评测：

| 文档类型 | 推荐切分方式                  | 实现工具                          |
| -------- | ----------------------------- | --------------------------------- |
| Markdown | 按标题层级（H1/H2/H3）切      | `MarkdownHeaderTextSplitter`      |
| HTML     | 按标签层级切（h1~h6、p、div） | `HTMLHeaderTextSplitter`          |
| PDF      | 按页或章节切                  | `chunk_by_title`、`chunk_by_page` |
| 代码     | 按函数、类、包切              | `PythonCodeTextSplitter`          |
| 论文     | 按章节、段落、表格切          | Layout-aware Parser               |

Chunk 较小时，向量检索更容易命中具体句子，但模型拿到的上下文可能不完整；Chunk 较大时，段落信息保留得更多，无关内容也会一起进入候选集。

Parent-Child Chunk 将检索粒度和生成上下文分开。比如先用约 300 Token 的子块建立索引，每个子块再关联一个约 1200 Token 的父段落。查询命中子块后，系统把对应父段落交给模型。300/1200 只是起始参数，仍要根据文档结构、查询类型和评测结果调整。

### Hybrid Search

“如何取消订阅”和“关闭自动续费”用词不同，向量检索更容易建立语义关联；`E1027`、`ABX-4421` 这类错误码和型号则更适合 BM25 的精确词匹配。Hybrid Search 同时保留两路候选。

| 查询类型                  | 向量检索表现         | BM25 表现      | 建议               |
| ------------------------- | -------------------- | -------------- | ------------------ |
| “如何取消订阅”            | 能匹配“关闭自动续费” | 可能匹配不到   | 保留向量召回       |
| “错误码 E1027”            | 可能召回泛化故障     | 精确命中错误码 | 必须保留关键词召回 |
| “ABX-4421 型号参数”       | 容易找相似型号       | 精确命中 SKU   | 必须保留关键词召回 |
| “Java 线程池拒绝策略区别” | 语义理解较好         | 能匹配关键词   | 混合更稳           |
| “最新 v3.2 价格政策”      | 需要语义和时间条件   | 可匹配版本号   | Metadata + Hybrid  |

两路结果需要经过融合，才能进入后续重排：

- 向量检索返回语义相似候选。
- BM25 或稀疏向量返回关键词候选。
- 用 RRF 或归一化加权分数合并。
- 对合并后的候选去重，再进入 Rerank。

Microsoft Azure AI Search、Google Vertex AI Vector Search、Weaviate 等产品的官方文档都介绍了 Hybrid Search 和 RRF。RRF 按候选的排名位置融合结果，不必直接比较 BM25 分数和向量余弦分数。

混合检索是否值得引入要看查询分布。错误码、产品型号、配置项和专有名词较多时，关键词召回通常不能省；文档高度结构化且查询很少包含精确词时，增加一路 BM25 未必能带来足够收益。

### Query Rewrite

用户提交给检索系统的往往是这些短句：

- “这个报错咋整？”
- “钱能退吗？”
- “线上那个限流问题是不是又来了？”

“这个”“钱”“线上那个问题”依赖会话上下文，直接检索时缺少对象和约束。Query Rewrite 会补充必要实体、同义表达或过滤条件，让查询更接近知识库中的写法，同时保留用户原始意图。

常见策略如下：

| 策略                | 适用场景                   | 例子                                                        |
| ------------------- | -------------------------- | ----------------------------------------------------------- |
| 规范化改写          | 口语化、缩写、上下文缺失   | “钱能退吗”改成“退款政策、退款条件、退款流程”                |
| Multi-Query         | 表达可能有多种说法         | 同时检索“取消订阅”“关闭自动续费”“停止会员计划”              |
| Query Decomposition | 问题包含多个子问题         | 把“对比 Stripe 和 Square 的手续费和争议处理”拆成 4 个子问题 |
| Step-back Query     | 问题太细，缺背景           | 先检索“订阅计费规则”，再回答具体取消问题                    |
| HyDE                | 查询太短，和文档形态差异大 | 先生成假设答案，再用假设答案向量检索真实文档                |
| Self-Query          | 问题里包含过滤条件         | 从“查 2025 年 Java 相关政策”提取年份和类别过滤              |

LangChain 的 `MultiQueryRetriever`、`SelfQueryRetriever` 等组件提供了对应实现。原始 query 应保留为一路召回输入，再与改写 query 的结果融合；只保留改写结果时，模型一旦理解错意图，后续候选会整体偏离。

### Rerank

用户问：“线程池为什么会触发拒绝策略？”

向量召回可能找出这些片段：

1. 线程池核心参数说明。
2. 拒绝策略枚举列表。
3. 队列满、线程数达到 maximumPoolSize 后触发拒绝策略的条件。
4. 线程池使用示例代码。

前两条与“线程池”“拒绝策略”在语义上接近，第 3 条才直接说明触发条件。双塔检索分别编码 query 和 document，再按向量距离快速召回；Rerank 通常使用 Cross-Encoder 或专用重排模型，把 query 与每条候选一起评分，将能够回答问题的内容排到前面。精度更细，计算开销也更高，因此一般只处理粗召回后的少量候选。

一条常见链路如下，候选数量要结合延迟预算和评测结果调整：

1. Metadata 预过滤。
2. Hybrid Search 粗召回 30 到 100 条。
3. 去重和相邻片段合并。
4. Rerank 选出 5 到 10 条。
5. 上下文压缩后放入 Prompt。

### GraphRAG

![什么是 GraphRAG？](https://oss.javaguide.cn/github/javaguide/ai/rag/graphrag-simplified-architecture-diagram.png)

GraphRAG（Graph-based Retrieval-Augmented Generation）是一类把图结构用于检索增强的方案。系统可以把文档中的实体、关系和结构化上下文显式建模，查询时沿图关系收集证据，再交给大模型生成答案。

GraphRAG 改变了检索对象。图数据库可以承载这些数据，但是否使用某个图数据库产品并不是判断 GraphRAG 的唯一条件。

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

### 知识库更新

RAG 知识库需要持续处理新增、修改和删除。更新完成后，检索结果要与当前文档一致，权限元数据也要同步；某个写入端失败时，系统还要能定位具体文档，并恢复到上一版健康索引。

索引和查询必须使用同一套 Embedding 模型及版本。不同模型生成的向量空间不通用，即使维度相同，相似度分数也没有可比性。升级 Embedding 模型或 Chunk 策略时，通常需要建立新索引，用同一批评测数据对比后再切换别名，旧索引保留一段时间用于回滚。

日常更新和结构性迁移适合用不同策略：

| 维度     | 增量更新                       | 全量重建                                 |
| -------- | ------------------------------ | ---------------------------------------- |
| 处理范围 | 只处理新增、修改和删除的文档   | 重新处理整个知识库                       |
| 适用场景 | 高频日常变更、分钟级同步       | 模型升级、Chunk 策略调整、严重故障恢复   |
| 主要依赖 | Webhook、CDC、轮询和消息队列   | 源系统快照、新旧索引并行和原子别名切换   |
| 主要风险 | 事件漏检、乱序、重复和部分成功 | 重建成本高，切换或回滚设计不完整影响服务 |

生产环境常用“事件驱动 + 轮询兜底 + 对账修复”的组合。元数据库记录文档版本、内容 Hash、Embedding 版本、Chunk 版本和各索引端状态；向量库、全文索引与元数据库发生部分成功时，后台补偿任务根据状态重试和对账。

## AI 系统设计

相关原文：

- [AI 应用系统设计：从 Prompt Demo 到生产级架构](./system-design/ai-application-architecture.md)
- [大模型网关详解：多模型路由、Fallback、限流与成本控制](./system-design/llm-gateway.md)
- [AI 可观测性与 Trace：如何还原 Agent 的完整执行过程](./system-design/ai-observability.md)
- [LLM/Agent 安全实战：从 Prompt Injection、工具越权到沙箱隔离](./system-design/llm-security.md)
- [AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地](./system-design/ai-voice.md)

### 生产级 AI 应用架构

最简单的 AI Demo 只有一条链路：前端提交问题，后端拼接 Prompt，调用模型 API，再返回答案。它能验证产品想法，却没有处理生产系统里的稳定性、权限、成本、可观测、评测和数据治理。

生产级 AI 应用通常按职责拆成几层：

| 层级                   | 主要职责                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| 入口层                 | 认证鉴权、请求标准化、限流、幂等和敏感内容预处理                 |
| 业务编排层             | 选择普通问答、RAG、Agent 或异步任务，控制确认、重试和降级        |
| Prompt 与 Context 管理 | 管理模板版本、变量注入、Token 预算、灰度发布和回滚               |
| 模型网关               | 统一模型接入、路由、限流、Fallback、成本归因和调用观测           |
| 知识、记忆与工具层     | 分别管理外部知识、个性化记忆和真实业务操作                       |
| 评测与观测层           | 记录调用链、版本、质量、延迟、成本和 Badcase，支持回放与发布门禁 |

这些模块不一定都要独立部署。早期项目可以在单体应用中划分清楚职责，调用量、团队数量或治理需求增长后再拆服务。关键是让模型生成和确定性业务规则分开：模型负责理解意图、生成内容和提出工具调用，身份、权限、金额、审批与幂等由代码和业务系统决定。

### LLM Gateway

LLM Gateway 是应用层和模型供应商之间的治理入口。它除了处理鉴权、限流、转发等普通 API 问题，还要管理模型选择、Token 预算、上下文长度、供应商差异、流式输出、工具调用、结构化响应、成本统计和 Prompt 版本。

LLM Router 只负责为当前请求选择模型，是 Gateway 中的一个环节。Gateway 管理的是从请求进入到结果返回的完整生命周期，包括统一接入、路由、Fallback、错误处理、观测、审计和成本归因。

模型调用量很小、只接一家供应商的内部工具，可以先用共享 `LLMClient` 统一处理密钥、超时、重试和日志。多个服务、团队或租户开始复用模型能力后，再逐步补充模型注册表、配额、路由、缓存、成本和审计；LLM Gateway 是一组需要集中治理的职责，不一定从第一天起就是独立服务。

### AI 可观测性与 Trace

AI 接口返回 HTTP 200，不代表回答正确或任务完成。RAG 可能在问题改写、召回、重排或上下文截断阶段出错；Agent 还可能选错工具、重复执行有副作用的操作，或者在多 Agent 归并时漏掉结果。

常见观测信号各自回答不同问题：

| 信号       | 主要回答的问题               | 典型内容                                         |
| ---------- | ---------------------------- | ------------------------------------------------ |
| Metrics    | 系统整体是否异常             | 请求量、错误率、P95 延迟、Token 用量、工具失败率 |
| Logs       | 某个时间点发生了什么事件     | 异常堆栈、状态变更、重试原因、业务告警           |
| Trace      | 一次请求经历了哪些步骤       | 模型、检索、工具、Agent 和上下游关系             |
| Evaluation | 输出质量和任务结果是否合格   | 正确性、忠实度、工具选择、任务完成度、安全性     |
| Audit      | 谁在什么权限下执行了什么操作 | 用户身份、审批记录、权限决策、外部写操作         |

长任务还要区分 Session、Run、Trace、Span 和 Attempt。Session 串起多轮会话，Run 表示一次任务，Trace 对应一次实际调用链，Span 表示其中的模型、检索或工具操作，Attempt 记录同一步骤的第几次尝试。人工审批或异步恢复后可以创建新 Trace，但要沿用同一个 `runId`。

确认过的失败 Trace 应脱敏后回流到 Badcase 集合。修复 Prompt、RAG、工具或编排逻辑后，用这些轨迹执行离线回放和回归评测，再通过灰度发布验证线上效果。

### LLM 与 Agent 安全

Agent 接入 RAG、Memory、工具、MCP、Skills、浏览器和代码执行后，外部内容既能影响模型判断，也可能触发真实业务操作。用户输入、网页、邮件、RAG 片段、Memory、工具结果、其他 Agent 消息和模型生成的参数都要按不可信数据处理。

Prompt Injection 描述的是攻击指令进入应用并改变既定任务；间接注入的指令藏在网页、邮件、文档、图片、RAG 或工具结果中；Jailbreak 主要试图绕过模型本身的安全策略。三者可以重叠，靠 System Prompt 中的一句“忽略外部指令”无法覆盖完整调用链。

安全控制要落在模型之外：

- 检索前根据用户、租户和数据范围做权限过滤。
- 根据场景和身份裁剪可见工具，执行前重新鉴权。
- 将通用读写接口拆成业务动作明确、参数受限的工具。
- 高风险操作绑定具体工具、参数、资源版本和有效期进行审批。
- Prompt、日志和 Trace 默认只保存必要元数据，原文按用途、权限和期限受控留存。
- 代码执行和网络访问放进受限环境，并限制文件、进程、资源和网络出口。
- 把模型、Prompt、MCP Server、Skill、数据集、容器镜像和评测器纳入供应链治理。

模型可以提出操作建议，最终权限、业务规则、审批和执行结果必须由服务端校验。

### 实时语音 Agent

语音 Agent 在普通 Agent 链路之外增加了音频采集、前处理、VAD、ASR、TTS、流式播放和打断处理。一轮对话会依次经过这些环节：

```text
音频采集 -> 降噪/回声消除 -> VAD -> 流式 ASR -> 上下文组装
        -> LLM/工具调用 -> 流式 TTS -> 音频播放 -> 状态回写
```

文本聊天慢 1 秒通常还能接受，语音对话慢 1 秒就会出现明显停顿。优化时要看端到端 P95/P99 延迟，把能并行的环节提前：ASR 产生稳定前缀后预判意图，LLM 输出第一个短句后立即启动 TTS，客户端收到音频块后边收边播。

打断也不只是暂停播放器。系统要停止当前 TTS、清空待播放队列、取消仍在生成的模型请求，并判断已经触发的工具能否撤销。工具存在外部副作用时，打断策略需要和幂等、补偿及任务状态一起设计。

<!-- @include: @article-footer.snippet.md -->
