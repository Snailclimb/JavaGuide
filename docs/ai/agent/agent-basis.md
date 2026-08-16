---
title: AI Agent 核心概念：Agent Loop、Plan-and-Execute、A2A、Agentic Workflows、Tools 注册
description: 深入解析 AI Agent 核心概念，梳理从被动响应到常驻自治的演进历程，对比 Agent、传统编程、Workflow 的区别和适用场景。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: AI Agent,智能体,ReAct,Function Calling,RAG,MCP,多智能体协作,Computer Use
---

“帮我排查今天早上 user-service 接口变慢的原因，并把结果发给负责人。”这类请求没有固定答案：先查监控、日志还是 Heap Dump，要看前一步拿到了什么证据。即使已经发现慢 SQL，也还得判断要不要继续查执行计划、怎样组织结论、是否可以发出通知。

聊天模型可以给出一份排查清单，却不会自己把这条路径走完。要完成任务，模型需要选择工具、读取工具结果，再据此决定下一步或结束。AI Agent 处理的就是这段连续的决策与执行过程。

工具接得越多，执行路径越不能随意放开。订单扣库存、审批流这类步骤明确的工作，仍应由传统程序或 Workflow 控制；只有中间步骤依赖实时证据、无法预先写死时，才需要让 Agent 参与判断。

后文会从演进、执行循环、工具接入和常见范式拆开这条链路，并给出 Agent、Workflow 与传统编程的选型依据。

## AI Agent 的演进

Agent 的能力不是一次性出现的。模型先获得外部调用能力，随后才有编排、长任务和长期在线这些需求。

**2022 年，ChatGPT 这类产品刚火的时候**，模型主要依据已有知识回答问题，不能主动调用外部工具，也不能自行完成操作。[Prompt Engineering](https://javaguide.cn/ai/agent/prompt-engineering.html) 是当时最重要的使用方式：把约束和上下文说清楚，输出才更稳定。

**2023 年中，Function Calling 出现后，事情开始变了。**

Function Calling 让 LLM 能调用外部 API；RAG 则把外部知识库接进回答过程。AutoGPT 等早期尝试随之出现，但它们经常在多步任务中重复调用，甚至陷入无限循环。

**2023 年底，大家开始重视编排。**

ReAct 开始被广泛采用：模型根据当前状态选择动作，读取工具返回结果，再继续判断。多 Agent 的分工也在这一阶段进入实践，例如把规划、执行和检查交给不同角色。

Coze、Dify 等平台用 DAG（有向无环图）约束执行路径，给完全自治的早期方案加上可观察、可控制的流程边界。

**2024 年底，标准化和多模态开始变重要。**

[MCP 协议](https://javaguide.cn/ai/agent/mcp.html)开始处理工具接入碎片化的问题，Computer Use 则把可执行范围扩展到图形界面。Cursor、Claude Code、Codex 等编程工具也逐渐把代码库阅读、修改、测试和提交串进同一条任务链路，“Vibe Coding”随之被更多人讨论。

**2025 年，Agent 开始往长任务执行方向走。**

这一阶段，Agent 开始承接一次对话之外的长任务：接收任务、运行流程、留下结果。单条 Prompt 无法稳定覆盖这类工作，固定流程、上下文、模板、脚本和校验规则被封装为 Skill，供相似任务按需加载。

**到了 2026 年，Agent 开始更接近长期在线的数字工作单元。**

OpenClaw 这类项目把 Skills 和 Heartbeat 推到更显眼的位置。

Skills 负责封装能力，Heartbeat 周期性唤醒 Agent 去检查消息、处理任务或更新状态。它是定时唤醒，不是连续意识；本地数据主权也不代表绝对安全。能安装 Skill、访问文件和执行脚本的 Agent，必须面对权限、沙箱和供应链风险。

这也推动了 Harness Engineering。可以把它看作 `Agent = Model + Harness`：模型负责推理和生成，Harness 提供可执行、可观察、可恢复和可验证的运行环境。关注点因此从模型参数、上下文长度和 Prompt 技巧，延伸到了模型之外的工程环境。

内建记忆、预测能力，以及从数字世界扩展到物理机器人的能力仍在推进。年份只是便于理解的切片：真实产品往往同时具有多个阶段的特征。较明显的分水岭仍是 2023 年中，模型从生成文本逐步获得了执行外部操作的能力。

### Agent、传统编程和 Workflow 区别？

先看谁决定执行路径，就能把 Agent、自动化脚本和 Workflow 区分开：

```text
传统编程：程序员写代码 → 执行结果
Workflow：产品画流程图 → 执行结果
Agent：用户说意图 → AI 决策 → 动态执行
```

订单扣库存、支付状态流转、消息队列消费这类逻辑固定且高频的场景，适合传统程序；用 Agent 只会额外增加延迟和不确定性。

审批、内容发布、线索分配等路径清晰的工作，适合 Workflow。步骤顺序和分支由图控制，问题能落到具体节点排查。

“排查今天早上服务变慢的原因”则不同：该查监控、日志还是 Heap Dump，要看中间证据，难以事先写死每个分支。这类自然语言意图理解与动态判断，才是 Agent 的适用范围。长流程中只有少数环节不确定时，可以用 Plan-and-Execute，在固定框架中留出动态子任务。

### Agent 面临的挑战有哪些？

聊 Agent 不能只讲愿景，也得说点真实问题。

- 长任务跑久了，历史信息会被截断，模型会”失忆”。更烦的是，上下文变长后推理质量不一定更好，很多模型对中间位置的信息利用效率并不高
- 工具调用可以降低幻觉，但不能彻底消灭。LLM 在推理步骤里仍然可能生成错误判断，工具返回结果也不一定能把它拉回来
- 多轮迭代、工具调用、日志回传、上下文压缩，每一项都在烧 Token。复杂任务跑一轮，账单可能真会让人清醒
- Agent 能执行代码、调 API、读写文件，也就一定会面对 Prompt Injection 和越权操作风险。更现实的做法是权限最小化、沙箱隔离、高危操作人工确认
- 深度多步推理任务里，LLM 还是容易局部最优，可能看起来一直在推进，其实已经偏题了
- Agent 为什么做了某个决策、为什么调用了某个工具、是哪一步把上下文带偏了，排查起来很头疼

后面比较确定的方向包括：更长上下文、分层记忆、多模态 GUI 操作、沙箱和权限体系、推理效率优化。

## 什么是 AI Agent？

一个排障 Agent 收到“服务变慢”的请求后，可能先读监控，再根据告警查日志，最后把结论发给负责人。每一步都取决于前一步得到的证据。LangChain 等框架把这类过程封装起来，底层通常仍是一个不断读取状态、选择动作、写回结果的循环。

AI Agent 是能感知环境、决策并执行动作的软件系统。LLM 处理意图和决策，工具执行外部操作，记忆保存当前任务和历史信息。与只生成回复的聊天机器人相比，它会在任务过程中持续观察和调整，直到结束条件满足。

常用的拆分方式是：**Agent = LLM + Planning + Memory + Tools**。

![AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

**推理与规划（Reasoning / Planning）**决定下一步的目标与动作。LLM 根据当前任务状态拆解目标；Chain-of-Thought（CoT）提示技术把推理过程拆成步骤，减少直接给出未经展开的结论。

短期记忆通常保存在上下文历史中，用于保持对话连续；长期记忆常由向量数据库或知识图谱等外部知识库承担，用于检索过去积累的信息。

**Tools（工具）**负责查询数据、调用 API、读写文件或执行代码。执行结果必须追加进上下文，成为下一轮的 Observation（观察）；否则模型看不到外部操作的反馈，后续动作也就无从判断。

### 什么是 Agent Loop？

Agent Loop 把这条反馈链路连续跑起来。每轮先由 LLM 根据上下文选择动作，再执行工具并写回结果；任务完成或命中停止条件时退出。

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

Loop 初始化时载入 System Prompt、工具列表和用户请求。之后模型在“直接回复”和“调用工具”之间选择；工具结果写回上下文，直到模型不再请求工具。

最大迭代轮次通常设在 10 到 20 轮，也可以按 Token 消耗终止。这个边界用来阻止错误判断把任务带进无限循环。

上下文会随着每轮结果不断变长，关键信息被稀释后，模型更容易跑偏。Context Engineering 处理的正是筛选和组织这些信息的问题。LangChain、LlamaIndex、Spring AI 提供的封装不同，底层都绕不开这条 Loop。

### 做一个 Agent 系统，最少要搞定哪三层？

接模型的代码通常归到 **LLM Call**：在这里处理 OpenAI、Anthropic、Hugging Face 等接口差异，以及流式输出、Token 截断和重试。

**Tools Call** 负责把 Function Calling、MCP、Skills，以及文件读写、网页搜索、代码沙箱和第三方 API 接给模型。外部能力是否可用、返回什么格式，都会影响下一轮决策。

传给模型的 Prompt、动态记忆、会话状态和工具描述由 **Context Engineering** 组织。上下文缺少任务所需信息，或混入太多无关内容时，即使模型本身能力足够，任务也可能无法推进。

## Tools 注册与调用遵循什么标准格式？

Agent 想准确调用外部工具，绕不开两个东西：OpenAI Schema 和 MCP。

OpenAI Schema 解决数据格式问题，MCP 解决通信接入问题。

### 数据格式：Function Calling Schema

外部工具可以很复杂，但 LLM 推理时只认结构化描述。

现在主流的数据格式基本都在向 OpenAI Function Calling Schema 靠拢。Anthropic、Google 这些厂商也都支持类似形式。

它用 JSON Schema 描述工具名称、用途、参数类型、必填字段。模型根据这段描述判断要不要调用工具，以及参数该怎么填。

比如一个大数据工程师常见的工具：查询慢 SQL 日志。

```json
{
  "type": "function",
  "function": {
    "name": "query_slow_sql",
    "description": "查指定微服务在特定时间段的慢 SQL 日志。服务响应慢、数据库超时、CPU 飙升的时候用这个。如果用户问的是网络或内存问题，别调这个。",
    "parameters": {
      "type": "object",
      "properties": {
        "service_name": {
          "type": "string",
          "description": "服务名，比如 user-service、order-service"
        },
        "time_range": {
          "type": "string",
          "description": "时间范围，格式 HH:MM-HH:MM，比如 09:00-09:30"
        },
        "threshold_ms": {
          "type": "integer",
          "description": "慢 SQL 判定阈值（毫秒），默认 1000"
        }
      },
      "required": ["service_name", "time_range"]
    }
  }
}
```

工具描述写得好不好，会直接影响 Agent 的判断。

模型是否调用工具、怎样填写参数，主要依据 `description`。描述中应同时给出适用和不适用的条件。例如慢 SQL 查询工具明确排除网络和内存问题，模型就不会在方向不符时调用它。

### 进阶封装：Skills

一次慢查询排查往往需要依次读日志、运行分析脚本，再按团队规范组织建议。若每次都由 Agent 临时规划，步骤和输出都难以稳定复用。

Skill 用可按需加载的指令文件保存这条执行链的顺序、约束条件和踩坑记录。宿主判断任务匹配后，才把相关内容放入上下文。

常见的封装方式有两种：

**传统 Toolkits（黑盒）**在代码中把多个原子工具组合成高阶工具，对外只暴露 JSON Schema，LLM 看不到内部路径。它适合逻辑固定、需要减少推理步骤和 Token 消耗的场景。

需要查看执行路径的 **Agent Skills（白盒）** 通常以 `SKILL.md` 作为入口，用自然语言表达任务指令。一个 Skill 通常是独立文件夹：

```text
.claude/skills/code-reviewer/
├── SKILL.md          ← YAML front-matter + 详细指令
├── scripts/xxx.py    ← 可选：配套脚本
└── reference.md      ← 可选：参考资料
```

`SKILL.md` 前面的轻量元数据用于发现，说明 Skill 的用途和触发条件；正文则记录流程、约束和示例。宿主先读取元数据，模型判断需要后才加载完整正文，这种延迟加载是 Agent Skills 与传统 Toolkits 的关键差异。

Claude Code、Cursor 等工具会扫描项目中的 `.claude/skills/` 目录，由模型决定是否激活某个 Skill。调用路径固定时用 Toolkits；需要沉淀团队经验、又保留任务流程弹性时，Agent Skills 更合适。路由设计、`SKILL.md` 的写法和第三方 Skill 安全审计可参见：[《Agent Skills 详解》](https://javaguide.cn/ai/agent/skills.html)。

### 通信接入：MCP 协议

Function Calling Schema 描述工具的名称、参数和用途，MCP 则规定工具如何接入宿主程序；两者解决的问题不同。

Anthropic 在 2024 年 11 月推出 MCP。它要解决的痛点很直接：以前开发者要在代码里手动维护一堆映射，比如：

工具名称 → 实际执行函数 + JSON Schema 描述

接一个新工具，就写一堆胶水代码。工具越多，维护越难。

MCP 提供了一套基于 JSON-RPC 2.0 的统一通信协议，经常被叫作 AI 领域的 “USB-C 接口”。外部系统通过 MCP Server 暴露能力，宿主程序连接 Server 后，就能自动发现并注册工具。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

这样 AI 应用和底层外部代码就解耦了。

MCP 定义了三类标准原语：

| 原语类型  | 作用                     | 例子                           |
| --------- | ------------------------ | ------------------------------ |
| Tools     | LLM 主动调用的函数       | 查询数据库、发送邮件、执行代码 |
| Resources | Agent 按需读取的只读数据 | 本地文件、数据库记录、日志流   |
| Prompts   | 可复用的提示词模板       | 代码审查模板、故障报告模板     |

这里容易混的一点是：MCP Server 对外暴露工具时，内部还是会用 JSON Schema 描述参数规范。

JSON Schema 是数据格式，MCP 是通信协议层。

## 什么是 Prompt Engineering？

Prompt 是给大语言模型的指令与上下文。Prompt Engineering 要处理的是任务边界、输出格式和约束条件：缺少这些信息时，模型只能自行猜测；条件明确后，输出才有稳定的依据。具体方法见：[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html)。

## 什么是 Context Engineering？

上下文混入过多无关信息时，模型即使具备相应能力，任务效果也会下降。

Context Engineering 做的事情，就是在有限 Token 窗口里，把最有用的信息喂给模型，把噪声挡在外面。它很容易和 Prompt Engineering 混在一起。

Prompt Engineering 更偏提示词怎么写，Context Engineering 管得更宽，包括规则、记忆、工具描述、会话状态、外部观察结果、Token 预算。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

这块展开讲内容很多，可以单独看这篇：[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html) 和 [《上下文工程（Context Engineering）》](https://javaguide.cn/ai/agent/context-engineering.html)。

## Agent 核心范式有哪些？

### ReAct

ReAct 是 Reasoning + Acting，由 Shunyu Yao 等人在 2022 年提出，论文是[《ReAct: Synergizing Reasoning and Acting in Language Models》](https://react-lm.github.io/)。

LangChain、LlamaIndex、AgentScope 这类框架里的 Agent 模块，很多都能看到这个范式的影子。

它的思路很直观：模型先推理一步，拿到外部环境反馈，再推理下一步，交替进行。

LLM 自己容易缺少实时信息，也容易幻觉。ReAct 就让它“走一步看一步”，每一步都根据工具返回结果继续判断。

![ReAct-LLM](https://oss.javaguide.cn/github/javaguide/ai/agent/ReAct-LLM.png)

比如任务是：帮我排查一下今天早上 user-service 接口变慢的原因，并把结果发给负责人。

ReAct 跑起来大概是这样。

它先查 user-service 早上的监控，发现 9 点到 9:30 CPU 飙到 98%，同时有大量慢 SQL 告警。

然后顺着这条线去翻日志，捞出那条慢 SQL，发现是一个没走索引的全表扫描。

接着去查服务负责人，通讯录里找到王建国，邮箱是 wangjianguo@company.com。

最后组织排查报告，发邮件通知。

这个过程不是一开始就写死的。如果监控显示的是内存 OOM，第二步就应该去查 Heap Dump，而不是继续翻慢 SQL。

ReAct 的价值就在这里：它能根据证据不断修正方向。

ReAct 落地时一般需要这几个组件配合：

1. 历史上下文，保存推理步骤、执行动作、反馈观察
2. 实时环境输入，比如系统告警、用户反馈等外部变量
3. LLM 推理模块：负责逻辑分析和下一步规划
4. 工具集与技能库，包括原子工具和 Skills
5. 反馈观察机制，采集工具响应并追加回上下文

![ReAct 模式流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-react-flow.png)

ReAct 的每一步都由外部观察结果推动，因而比一次性生成更容易追溯决策依据，也能减少脱离环境的判断。相应地，多轮调用会增加响应延迟，效果还取决于工具和 Skills 是否可靠。

例如，查监控、查日志、分析瓶颈可以封装为 `diagnose_service_performance` Skill，向 LLM 返回结构化诊断摘要。这样无需在每次排障时都从原子步骤重新组合。

### Plan-and-Execute

LangChain 团队在 2023 年提出 Plan-and-Execute：先由 LLM 生成全局分步计划，再交给执行器逐项完成。步骤较多、依赖关系明确的长任务使用这种方式，更容易保持全局进度。

计划也是它的边界。执行过程中若出现未预料的结果，动态调整和容错能力会弱于边做边判断的 ReAct，行为会更接近静态工作流。

两种模式可以嵌套：用 CoT 给出全局步骤，每个步骤内部运行 ReAct 子循环。计划提供结构，子循环处理局部的不确定性。

### Reflection

Reflection 通过自然语言反馈纠正 Agent 行为，不需要修改模型权重。常见实现分别处理不同阶段：

- Reflexion 在任务失败后记录反思结论到记忆缓冲区。例如代码调试发现 `count` 在调用前未初始化，下一轮可据此规避。
- Self-Refine 让模型在完成回答、代码或文案后审查输出，再进行迭代修改。
- CRITIC 借助搜索引擎、代码执行器等外部工具验证事实，再按验证结果修正。

Reflection 通常叠加在 ReAct 或 Plan-and-Execute 上：执行过程中加入校验与调整，具体任务仍由原有的执行机制完成。

### Multi-Agent

任务能拆成规划、执行、验收等相对独立的职责时，可以交给多个 Agent 协作完成。**Orchestrator-Subagent 模式**由编排 Agent 制定全局计划、分发任务，子 Agent 并行或串行执行，再由编排层汇总结果。

需要辩论、评审或相互验证时，可采用 **Peer-to-Peer 模式**，由地位对等的 Agent 直接对话和审查。

![Multi-Agent 系统架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-multi-agent-arch.png)

当任务确实能按专业角色拆分时，Multi-Agent 可以并行执行，且单个子任务失败未必阻断整体。代价是 Agent 间的通信、协调和调试成本都会上升，Token 消耗也随之增加。

落地时还要处理任务契约、共享状态、并行写冲突、Worker 接管和检查点恢复。详细设计可以看 [《多 Agent 协作系统设计：任务拆分、状态共享、冲突处理与失败恢复》](./multi-agent.md)。

### A2A 协议

单个 Agent 升级到 Multi-Agent 后，Agent 之间怎么沟通会变成一个工程问题。

如果还靠自然语言互相聊天，Token 消耗很高，也容易出现格式解析错误。

A2A 协议就是为了解决这个问题。

它让 Agent 之间用结构化数据交互，比如带 Schema 的 JSON、XML，或者状态流转指令，而不是一堆自然语言废话。

类比一下，后端微服务之间不会通过解析 HTML 页面交换数据，而是用 RESTful 或 RPC 接口传结构化对象。

A2A 协议就是给 Agent 之间定义接口契约。

比如“产品经理 Agent”写完需求后，不会输出一句“我写好了，你开发一下”。它应该输出一个标准 JSON Payload，里面包含 TaskID、Dependencies、AcceptanceCriteria。开发 Agent 拿到后直接反序列化，进入执行流程。

![A2A 协议架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-a2a.png)

### Agentic Workflows

Agentic Workflows 是吴恩达（Andrew Ng）重点倡导的概念，强调用工程编排把推理、工具、记忆、反思和多实体协作接成可执行流程，而不只等待底层模型能力变化。

![智能体工作流核心模式](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-agentic-workflows.png)

其中常见的设计模式包括：

1. Reflection——让模型检查自己的工作
2. Tool Use——给 LLM 配网络搜索、代码执行等工具
3. Planning——让模型提出多步计划并执行
4. Multi-agent Collaboration——多个 Agent 协作完成任务

这些模式在真实项目中通常组合出现。例如先用 Planning 拆分任务，在子任务中运行 ReAct、调用 Tools，最后用 Reflection 检查结果。Agentic Workflows 描述的是这种组合方式，而不是某个单独框架。

## AI 工作流和 Agent 到底是什么关系？

“生成初稿、质量审核、按反馈修改”这类流程里，步骤顺序和重试条件可以预先写进图结构；LLM 只在某个节点生成或判断。这样的 AI 工作流能把问题定位到具体节点和边。

纯 Agent 则由 LLM 在运行中决定是否调用工具、调用什么工具和后续路径。它适合查什么、怎么查取决于中间证据的任务。

Agentic Workflows 把两种方式放在同一条链路中：全局 Workflow 固定主流程，只在路径不确定的局部嵌入 Agent 子循环。

### 工作流里的 Node、Edge、State 是什么？

工作流运行时，Node（节点）负责执行，Edge（边）决定控制流，State（状态）在节点之间共享上下文；三者组成有向图（Graph）。

Node 只做一件事，读取状态、执行逻辑、写回结果。节点里可以调 LLM，可以是工具调用，也可以是纯代码逻辑。写文章这个场景里，典型节点是“生成初稿”“质量审核”“按反馈修改”，节点职责越单一，越容易排查。Edge 决定执行完跳到哪——顺序边按路径走，条件边根据运行时状态分支，循环边让流程回到之前的节点重试。State 记录当前草稿、评分、重试次数这类东西，条件边的跳转往往基于 State 里的值来判断。

“审核不通过就回到修改，最多重试 3 次”，翻译成图结构，是一条从 ReviewNode 指向 ReviseNode 的条件边，加上 `iteration_count >= 3` 时跳到 ExitNode 的安全边界。State 里的 `iteration_count` 是让这条逻辑能跑起来的关键。

这套图结构比写死的 if-else 链更容易扩展，出了问题也好定位到哪个节点哪条边。LangGraph（Python）和 Spring AI Alibaba Graph（Java）都是基于这套思路实现的。详细设计和代码实现可以看：[《AI 工作流中的 Workflow、Graph 与 Loop》](https://javaguide.cn/ai/agent/workflow-graph-loop.html)。

### 什么时候用 Agent，什么时候用 Workflow？

执行路径能不能提前确定，是最简单的判断标准。

能确定，用 Workflow。不能确定，用 Agent。两者都有，用 Agentic Workflows。

但有个常见认知偏差：很多人觉得任务“路径不确定”，其实是需求没拆清楚。把任务认真拆一遍后，往往会发现大部分场景是“LLM 在固定节点里做生成或判断”，这种用 Workflow 更稳，也更容易排查。

真正适合纯 Agent 的任务，是那种你提前写不出执行步骤的场景。比如“帮我排查这个线上故障”，查什么、怎么查、查到什么程度，很难事先规定死。

另一个判断维度是容错要求。Workflow 执行路径固定，出问题好排查；Agent 执行路径动态，调试难度高一个数量级。To B 商业场景优先考虑 Workflow 或 Agentic Workflows。

## 各范式怎么选？

前面讲了 ReAct、Plan-and-Execute、Reflection、Multi-Agent、AI 工作流这一堆概念，做项目时面对这些选型容易头大。做个简单的参考：

| 场景特征                         | 推荐方向           | 代价                            |
| -------------------------------- | ------------------ | ------------------------------- |
| 执行路径可提前确定，节点需要 LLM | AI 工作流（Graph） | 稳定可观测，前期设计成本高      |
| 执行路径不确定，需要动态规划     | ReAct              | 灵活，Token 消耗高，调试难      |
| 任务很长，步骤多但结构清晰       | Plan-and-Execute   | 不易迷路，动态调整弱            |
| 输出质量要求高，允许多轮迭代     | 叠加 Reflection    | 和 ReAct/P&E 配合用，不单独用   |
| 任务天然可拆成多个专业角色       | Multi-Agent        | 通信和调试成本翻倍              |
| 长任务 + 部分子任务不可预测      | Agentic Workflows  | 全局 Workflow + 局部 ReAct 嵌套 |

先用最简单的方式跑通，再根据实际失败模式决定升级哪一层。

上来就搞 Multi-Agent、全靠模型动态推理、上下文不做任何管理，踩进去了再爬出来会很费劲。

## 总结

大部分 Agent 项目跑起来不稳定，不是模型不够好。

基础没搭好。LLM + Planning + Memory + Tools 四块，缺哪个都有明显短板。Tools 没有，Agent 停留在“给建议”阶段；Memory 没有，稍微长一点的任务就开始失忆；上下文管不好，模型随便跑偏。

选型也容易选错。ReAct 灵活但调试难，Token 烧得也多；Workflow 稳但对需求拆解要求高，提前设计不够充分的话，后面改起来也费劲；Multi-Agent 接入后通信和调试成本容易超出预期。上来就搞最复杂的方案，是工程实践里最常见的陷阱。

还有一块很容易忽略：工具描述。MCP 解决接入方式，JSON Schema 解决描述格式，但模型到底调不调这个工具、参数怎么填，最后都靠 description 里那几句话。这块省了力气，后面会双倍还回来。

Agent 和工作流的选型其实没那么复杂，先把任务执行路径写出来，能写出来就用 Workflow，写不出来再上 Agent。这个判断先做好，比追框架有用得多。
