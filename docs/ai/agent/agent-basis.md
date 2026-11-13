---
title: AI Agent 核心概念：Agent Loop、Plan-and-Execute、结构化任务契约、Agentic Workflows、Tools 注册
description: 深入解析 AI Agent 核心概念，梳理从被动响应到常驻自治的演进历程，对比 Agent、传统编程、Workflow 的区别和适用场景。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: AI Agent,智能体,ReAct,Function Calling,RAG,MCP,多智能体协作,Computer Use
---

用户要求排查 user-service 早上的接口延迟，并把结果发给负责人。假设监控显示慢 SQL 告警，下一步可以查 SQL 和执行计划；如果看到的是内存异常，就应转向堆内存和相关日志。排查方向由刚取得的证据决定。

**AI Agent 会把模型判断与工具执行接成循环。** 模型提出查询请求，应用执行工具并返回结果，模型再决定继续调查还是整理结论。发送通知也是外部操作，需要应用检查授权和收件人，生成一份排查清单并不等于完成了任务。

工具接得越多，执行路径越不能随意放开。订单扣库存、审批流这类步骤明确的工作，仍应由传统程序或 Workflow 控制；只有中间步骤依赖实时证据、无法预先写死时，才需要让 Agent 参与判断。

在开始正式介绍 Agent 核心概念之前，我想先和大家简单聊聊 Agent 的演进历程。

## AI Agent 的演进

**2022 年，聊天产品与工具交互研究已经在并行发展。** ChatGPT 让更多人开始通过 [Prompt Engineering](https://javaguide.cn/ai/agent/prompt-engineering.html)使用大模型。同年 10 月发表的 [ReAct 论文](https://arxiv.org/abs/2210.03629)则把推理与行动交替起来：模型提出动作，从外部环境取得观察，再继续推理。工具交互并非到 2023 年才出现。

**2023 年，结构化工具调用逐步进入模型 API。** [OpenAI 在 6 月发布 Function Calling](https://openai.com/index/function-calling-and-other-api-updates/)，模型可以按函数描述生成名称和 JSON 参数，再由应用调用对应 API。像负责参数校验、授权和执行等工作仍然需要开发者负责，模型不会因为返回了函数名就直接完成操作。

AutoGPT 等探索把多次调用接成任务，但长任务还需要处理重复动作、失败恢复与停止条件。RAG 用检索材料补充回答依据，编排则控制步骤之间如何衔接。

Coze、Dify 等平台把多次调用组织为工作流：开发者指定节点输入、分支和结束条件，运行记录保留每一步的结果。规划、执行和检查也可以分给不同 Agent，不过是否需要角色分工，要看子任务能否独立完成和验证。

**2024 年出现了两种不同的外部交互方式。** Anthropic 在 [10 月发布 Computer Use 公测](https://www.anthropic.com/news/3-5-models-and-computer-use)，让模型根据屏幕内容提出鼠标、键盘操作；[11 月公布 MCP](https://www.anthropic.com/news/model-context-protocol)，统一应用与外部数据、工具的连接方式。前者操作图形界面，后者对接协议接口。[MCP 专题](https://javaguide.cn/ai/agent/mcp.html)介绍了具体的 Client、Server 和工具调用过程。

在 Cursor、Claude Code、Codex 等编程工具中，读代码、修改文件和运行测试可以接成同一项任务。即使采用常被称为“Vibe Coding”的自然语言开发方式，生成代码后仍要检查 diff 和测试结果。任务跨越多次会话时，还得保存当前进度，否则下一次调用无法仅凭原始需求知道哪些功能已经完成。

可复用的命令、模板和检查步骤可以放入 Skill，按任务加载；定期检查则需要调度器触发。例如，OpenClaw 早期用 Heartbeat 周期性唤醒 Agent。截止到今天（2026-11-08），这类检查已统一到普通 Automation job，由任务保存调度、上下文和投递设置。讨论历史设计时仍会遇到 Heartbeat，但配置时应核对所用版本。

模型返回“读取这个文件”后，仍需要程序检查路径权限、实际读取文件，再把结果交回模型。执行记录、任务进度和完成条件也由模型之外的代码管理。`Agent = Model + Harness` 中的 Harness 就包含这些运行机制，具体设计见 [Harness Engineering](./harness-engineering.md)。

定时唤醒只是调度一次执行，不意味着 Agent 一直在思考。本地部署时同样需要限制文件和脚本权限，审核第三方 Skill；数据留在本机并不能阻止一次越权操作。

需要注意：工具调用、编排和记忆机制是在不同研究与产品中逐步发展起来的，其实不能按年份分成互不重叠的阶段。上面只是选取几个便于核对的节点。

### Agent、传统编程和 Workflow 区别？

三者都要执行代码，区别主要在于下一步由谁决定：

- 传统编程：程序员写代码 → 执行结果
- Workflow：产品画流程图 → 执行结果
- Agent：用户说意图 → AI 决策 → 动态执行

这里分别再举一个例子说明一下：

订单扣库存、支付状态流转和消息队列消费，通常已经有明确的处理规则。按这些规则编写程序即可，不必在每次请求中再调用模型决定下一步；这样也便于控制延迟和保证行为一致。

审批、内容发布、线索分配等路径清晰的工作，适合 Workflow。步骤顺序和分支由图控制，问题能落到具体节点排查。

“排查今天早上服务变慢的原因”则不同：该查监控、日志还是 Heap Dump，要看中间证据，难以事先写死每个分支。这类自然语言意图理解与动态判断，才是 Agent 的适用范围。长流程中只有少数环节不确定时，可以用 Plan-and-Execute，在固定框架中留出动态子任务。

### Agent 面临的挑战有哪些？

假设监控工具找到了慢 SQL，这次排查就算找到原因了吗？还不能。慢 SQL 发生的时间可能不在故障窗口内，也可能属于另一条调用链。模型需要继续核对请求时间和调用链，才能判断两者是否有关。

排查越长，保留哪些信息也越难。第一轮已经排除的原因可能被裁出窗口，模型又从头查了一遍；日志虽然还在，却淹没了真正需要核对的几行。分层记忆和上下文裁剪能帮助组织材料，但写入摘要的结论本身也要有证据。

重复查询还会消耗 Token 和工具额度。一轮调用卡在日志接口上时，轮次上限不会生效，还需要请求超时和任务总预算。排查记录应保留调用参数、工具结果和停止原因，否则只看最终回复，很难知道 Agent 在哪里走偏。

工具输出中的文字也不能直接当作执行指令。读到一段日志，不代表获得了修改生产配置的权限。文件范围、沙箱和高风险操作的确认都由执行环境检查，不能指望模型自己记住全部限制。

## 什么是 AI Agent？

**AI Agent 是能够观察环境、选择动作并执行任务的软件系统。** 本文讨论的是以 LLM 为决策模块的 Agent：模型读取任务和已有结果，提出下一步动作，程序执行后再把反馈交给模型。LangChain 等框架封装了这类循环。

前面的排障任务就有这三个环节：监控数据是观察，查日志是模型选择的动作，日志查询工具负责实际执行。任务结束可能是找到了原因，也可能是权限不足或预算耗尽，不能把“停止调用工具”一律记为成功。

常用的拆分方式是：**Agent = LLM + Planning + Memory + Tools**。

![AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

**推理与规划（Reasoning / Planning）** 用来选择下一步动作，必要时先拆出子目标。比如先确认故障时间，再查询对应日志。CoT 提示可以要求列出关键推导步骤，但列出了步骤，仍要检查推导是否成立。

短期记忆通常保存在上下文历史中，用于保持对话连续；长期记忆常由向量数据库或知识图谱等外部知识库承担，用于检索过去积累的信息。

**Tools（工具）** 负责查询数据、调用 API、读写文件或执行代码。执行结果必须追加进上下文，成为下一轮的 Observation（观察）；否则模型看不到外部操作的反馈，后续动作也就无从判断。

工具调用的完整链路、权限、二次确认、幂等、审计、超时和 Java 示例，见 [结构化输出与 Function Calling](../llm-basis/structured-output-function-calling.md)；任务完成率、工具调用和执行轨迹等指标，见 [Agent 应用怎么评测](../llm-basis/llm-evaluation.md#agent-应用怎么评测)。

### 什么是 Agent Loop？

**Agent Loop 就是反复执行“模型判断 → 工具执行 → 结果回传”的过程。** 前一轮查到的日志进入上下文，下一轮模型才能据此选择动作。

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

第一次调用前，应用准备 System Prompt、工具列表和用户请求。模型直接给出答案时可以结束；返回工具调用时，应用执行并写回结果，再发起下一次模型调用。任务完成、预算耗尽或出现无法继续的错误，都需要有对应的退出处理。

可以给 Loop 设置最大轮次和 Token 预算。例如第一版先以 10 轮为上限，再观察任务通常在哪一步结束；需要更多轮次时，应先检查是否存在重复动作。10 或 20 都只是可选配置，不能作为所有任务的默认答案。

上下文会随着每轮结果不断变长，关键信息被稀释后，模型更容易跑偏。Context Engineering 处理的正是筛选和组织这些信息的问题。LangChain、LlamaIndex、Spring AI 提供的封装不同，底层都绕不开这条 Loop。

### 做一个 Agent 系统，最少要搞定哪三层？

接模型的代码通常归到 **LLM Call**：在这里处理 OpenAI、Anthropic、Hugging Face 等接口差异，以及流式输出、Token 截断和重试。

**Tools Call** 接收模型生成的工具名和参数，找到本地函数或 MCP 工具，完成校验后执行。文件读写、网页搜索、代码沙箱和第三方 API 都可以接在这一层。Skill 里的说明会影响 Agent 怎样使用工具，但说明文件本身不会执行这些操作。

传给模型的 Prompt、动态记忆、会话状态和工具描述由 **Context Engineering** 组织。上下文缺少任务所需信息，或混入太多无关内容时，即使模型本身能力足够，任务也可能无法推进。

## Tools 注册与调用遵循什么标准格式？

工具接入要分开看两件事：模型读取的工具描述，以及应用执行工具的接口。Function Calling Schema 描述前者，MCP 可以承担后者的通信；本地函数也可以直接调用。

### 数据格式：Function Calling Schema

工具定义通常包含名称、用途和参数 Schema。JSON Schema 描述的是参数类型、必填项等约束；工具名和用途由 API 的外层字段提供。不同厂商的字段组织并不完全相同，接入时要按对应接口转换。

以下采用 OpenAI Chat Completions 风格的 `function` 结构。模型能看到这份定义，但看不到查询日志的函数实现。

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

这里的 `service_name` 和 `time_range` 是必填参数，`threshold_ms` 的默认值只写在说明中，仍需执行函数实现。模型没有传阈值时，应用不能因为描述里出现了“默认 1000”就省略默认值处理。

`description` 中的慢 SQL、网络和内存问题用来帮助模型区分工具，不能保证它永远选对。应用还要核对服务范围、时间格式和调用权限。

### 进阶封装：Skills

一次慢查询排查往往需要依次读日志、运行分析脚本，再按团队规范组织建议。若每次都由 Agent 临时规划，步骤和输出都难以稳定复用。

这些步骤可以保存为 Skill。Agent 先通过名称和描述发现它，需要排查慢查询时再读取正文，按其中的命令和约束继续操作。下一次处理同类任务时，就不必再向用户索取同一份排查说明。

常见的封装方式有两种：

**传统 Toolkits（黑盒）** 在代码中把多个原子工具组合成高阶工具，对外只暴露 JSON Schema，LLM 看不到内部路径。它适合逻辑固定、需要减少推理步骤和 Token 消耗的场景。

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

MCP 工具定义中同样有参数 Schema。Client 取得定义后，Host 可以将其转换为模型 API 要求的格式。转换后的描述用于模型选择工具，实际调用再由 Client 发给 Server。

## 什么是 Prompt Engineering？

Prompt 是给大语言模型的指令与上下文。Prompt Engineering 要处理的是任务边界、输出格式和约束条件：缺少这些信息时，模型只能自行猜测；条件明确后，输出才有稳定的依据。具体方法见：[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html)。

## 什么是 Context Engineering？

模型查询日志后，应用还要决定返回全文还是相关片段、旧日志是否继续保留、项目规则是否仍在窗口中。这些选择属于 Context Engineering。

Prompt Engineering 关注指令如何表达，Context Engineering 还要处理信息从哪里来、何时加载与何时移出。一次调用中的规则、记忆、工具描述和观察结果共同占用 Token 预算。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

这块展开讲内容很多，可以单独看这两篇：[《提示词工程（Prompt Engineering）》](https://javaguide.cn/ai/agent/prompt-engineering.html) 和 [《上下文工程（Context Engineering）》](https://javaguide.cn/ai/agent/context-engineering.html)。

## Agent 核心范式有哪些？

### ReAct

ReAct 是 Reasoning + Acting，由 Shunyu Yao 等人在 2022 年提出，论文是[《ReAct: Synergizing Reasoning and Acting in Language Models》](https://react-lm.github.io/)。

它把推理与动作交替起来：模型提出动作，工具执行并返回观察，模型结合新信息决定下一步。LangChain、LlamaIndex、AgentScope 中的部分 Agent 实现采用了类似方式。

![ReAct-LLM](https://oss.javaguide.cn/github/javaguide/ai/agent/ReAct-LLM.png)

比如任务是：帮我排查一下今天早上 user-service 接口变慢的原因，并把结果发给负责人。

假设排查中得到以下结果：

监控显示 9 点到 9:30 CPU 达到 98%，同时有慢 SQL 告警。Agent 据此查询这一时段的日志，并读取执行计划，发现相关 SQL 进行了全表扫描。它还要把 SQL 与慢请求关联起来，才有依据把这条线索写入排查报告。

报告整理后，通讯录工具查到负责人王建国及邮箱 `wangjianguo@company.com`。应用确认收件人和授权后，才执行发送。

如果监控显示的是内存 OOM，下一步就应改查 Heap Dump。前一轮的工具结果改变了调查方向；发送邮件前，应用还要确认收件人和发送授权。

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

Plan-and-Execute 把规划和执行分开：Planner 生成分步计划，Executor 完成其中的任务。计划记录了还有哪些步骤没做，适合步骤较多、依赖关系清楚的任务。

计划是否会调整，取决于实现有没有重规划环节。[LangChain 的实现说明](https://www.langchain.com/blog/planning-agents)会在执行后重新检查结果，决定回答用户还是生成后续计划。如果只生成一次计划后一直照做，才容易在环境变化后继续执行过时步骤。

执行器也可以是一个 ReAct Agent。例如计划中的一步是“定位慢查询”，执行器在这一步内查询监控、读取日志并核对执行计划，完成后把证据交回规划器。

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

### 结构化任务契约

假设产品经理 Agent 把需求交给开发 Agent，只说“我写好了，你开发一下”，接收方还不知道要改哪个任务、依赖是否完成，以及用什么条件验收。

结构化任务契约把这些内容拆成可检查的字段，例如 `TaskID`、`Dependencies`、`AcceptanceCriteria`。开发 Agent 接收 JSON Payload 后，程序先检查必填项和依赖状态，再进入执行流程。需求说明仍然可以是自然语言，只是它被放进了有明确用途的字段。

这种做法与服务间传递 DTO 类似。Schema 能发现字段缺失和类型错误，但不能判断验收条件是否合理，证据和业务规则仍需另外核对。

这种结构化交付不等于实现了 A2A 协议；跨进程 Agent 的能力发现、任务状态和产物交付，见 [多 Agent 篇的 A2A 一节](./multi-agent.md#a2a-能解决什么-不能解决什么)。

![A2A 协议架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-a2a.png)

### Agentic Workflows

吴恩达（Andrew Ng）倡导的 Agentic Workflows 强调用多步流程完成任务：生成之后可以检查和修改，缺少材料时可以调用工具，也可以让不同角色分工。

![智能体工作流核心模式](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-agentic-workflows.png)

其中常见的设计模式包括：

1. Reflection——让模型检查自己的工作
2. Tool Use——给 LLM 配网络搜索、代码执行等工具
3. Planning——让模型提出多步计划并执行
4. Multi-agent Collaboration——多个 Agent 协作完成任务

这些模式在真实项目中通常组合出现。例如先用 Planning 拆分任务，在子任务中运行 ReAct、调用 Tools，最后用 Reflection 检查结果。Agentic Workflows 描述的是这种组合方式，而不是某个单独框架。

## AI 工作流和 Agent 到底是什么关系？

工作流里也可以调用大模型。生成文章时，程序先调用模型写初稿，再把初稿交给审核节点；审核未通过，就将意见传给修改节点。这里每一步的内容由模型生成，但先审核还是先修改，已经由程序规定好了。

Agent 多了一项决定：下一步做什么。排查慢请求时，模型读完监控数据，才能判断该查 SQL 还是 Heap Dump。可用工具和访问范围仍由应用限制，动态选择不等于可以任意操作。

两种方式可以放在同一条流程里。把“调查、审核、通知”固定下来，调查节点内部运行 Agent；它交出调查结果后，仍然回到既定的审核步骤。这样需要灵活判断的部分有了空间，后续通知也有明确的入口。

### 工作流里的 Node、Edge、State 是什么？

在上面的文章流程中，写初稿、审核、修改各自是一个 **Node（节点）**。节点完成一次操作后，要把结果留下来：写初稿的节点保存草稿，审核节点保存意见，修改节点读取这两项再生成新稿。这些跨节点使用的数据就是 **State（状态）**。

节点之间通过 **Edge（边）** 连接。初稿写完直接进入审核，用顺序边即可；审核之后则要读状态，判断是结束还是修改，这时用条件边。修改后再回到审核，连起来就形成了循环。

“最多重试 3 次”需要落实到状态更新和分支判断中。每次重试更新 `iteration_count`，当 `iteration_count >= 3` 时转到 ExitNode，避免一直在 ReviewNode 和 ReviseNode 之间循环。退出时仍应区分“审核通过”和“重试耗尽”。

LangGraph（Python）和 Spring AI Alibaba Graph（Java）提供了图编排能力。节点、边和状态怎样定义，可以继续看[《AI 工作流中的 Workflow、Graph 与 Loop》](https://javaguide.cn/ai/agent/workflow-graph-loop.html)。

### 什么时候用 Agent，什么时候用 Workflow？

可以先试着把任务画成流程图。如果步骤和分支条件都已明确，Workflow 通常就够了；模型只负责图中需要生成或判断的节点。画到某一步时，必须先取得新证据才能知道接下来查什么，再考虑在这里引入 Agent。

这也是 Anthropic 区分 [Workflow 和 Agent](https://www.anthropic.com/engineering/building-effective-agents)时采用的角度：执行路径预先定义，还是由模型动态决定。选型时还要补一个问题：这一步判断错了，应用能否发现并接管？通知负责人、修改配置等操作，需要先有输入校验、授权确认和停止条件，不能随调查工具一起全部放开。

## 各范式怎么选？

确定任务的步骤、依赖和验收方式后，可以按下表选择起点：

| 场景特征                         | 推荐方向           | 代价                            |
| -------------------------------- | ------------------ | ------------------------------- |
| 执行路径可提前确定，节点需要 LLM | AI 工作流（Graph） | 稳定可观测，前期设计成本高      |
| 执行路径不确定，需要动态规划     | ReAct              | 灵活，Token 消耗高，调试难      |
| 任务很长，步骤多但结构清晰       | Plan-and-Execute   | 需保存进度并处理重规划          |
| 输出质量要求高，允许多轮迭代     | 叠加 Reflection    | 和 ReAct/P&E 配合用，不单独用   |
| 任务天然可拆成多个专业角色       | Multi-Agent        | 通信和调试成本增加              |
| 长任务 + 部分子任务不可预测      | Agentic Workflows  | 全局 Workflow + 局部 ReAct 嵌套 |

## 总结

判断排障 Agent 有没有完成工作，可以回到开头的请求：相关时段的监控查到了吗，慢 SQL 是否和失败请求关联，负责人收到报告了吗？这三项分别需要工具返回、诊断证据和发送结果。

假如缺少调用链，任务记录就应说明“发现慢 SQL，尚未确认与接口延迟有关”，并保留日志入口。下一次继续排查时，可以从这个缺口开始，而不是把上一次的猜测当作已经确认的根因。
