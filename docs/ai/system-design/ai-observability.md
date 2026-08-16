---
title: AI 可观测性与 Trace：如何还原 Agent 的完整执行过程
description: 从一次接口成功但回答错误的请求出发，讲清 AI 应用的 Trace 设计、Span 拆分、上下文传播、采样、敏感数据处理，以及 Spring AI 项目的落地方式。
category: AI 应用开发
tag:
  - AI 可观测性
  - OpenTelemetry
  - AI Agent
  - Spring AI
  - AI 系统设计
head:
  - - meta
    - name: keywords
      content: AI可观测性,AI Observability,Agent Trace,OpenTelemetry,Spring AI,LLM Observability,RAG可观测性,大模型可观测性
---

接口返回 200，耗时也正常，智能客服给出的退款规则却是错的。

打开监控面板，只能看到这次请求调用过大模型，并且正常生成了回答。再往下查就麻烦了：是知识库没有召回正确资料，Prompt 拼错了，模型忽略了上下文，还是某个工具返回了旧数据？普通接口日志通常回答不了这些问题。

一次 AI 请求可能会经过问题改写、知识库检索、重排、模型调用、工具调用和结果校验。Agent 还可能重复执行其中几步。每一步看起来都调用成功，错误结果却会继续传给下一步，最后得到一段格式正常、内容有问题的回答。

排查时需要顺着这条执行过程往回找：当时用了哪个模型和 Prompt，检索到了哪些文档，调用了什么工具，Agent 重试了几次，最终回答参考了哪些结果。

这些信息都落在同一条调用链里，才能继续定位问题。

## 为什么 AI 应用不能只看接口是否成功？

传统后端监控主要看 QPS、错误率、P99 延迟、CPU、内存和数据库慢查询。这些指标可以反映服务有没有异常，却解释不了模型为什么生成了当前答案。

以 RAG 为例，问题改写偏了，后面的召回结果通常也会跟着偏；正确文档虽然被召回，却可能在重排时掉出 `topK`；文档顺序没有问题，还可能因为 Prompt 太长被截断。整个过程没有抛出异常，接口照样返回 200。

Agent 场景还会多出工具和执行状态的问题。工具接口调用成功，拿到的业务数据可能已经过期；一次超时重试，可能重复执行有副作用的操作；多 Agent 汇总时，也可能漏掉某个已经完成的结果。

要把问题查到具体步骤，Trace 至少要覆盖模型、检索、工具、Agent 和最终结果。确认过的失败 Trace 还可以沉淀为 Badcase，用于后续回归评测。

Trace 能还原系统实际执行过的步骤，读不到模型内部真实的推理机制。模型返回的思维文本也只是一段输出，不能直接当成完整的决策解释。

## Metrics、Logs、Trace、Evaluation 和 Audit 有什么区别？

AI 可观测性里经常同时出现 Metrics、Logs、Trace、Evaluation 和 Audit。

这几个概念各自解决不同问题。

| 信号       | 主要回答的问题                 | 典型内容                                         |
| ---------- | ------------------------------ | ------------------------------------------------ |
| Metrics    | 系统整体是否异常？             | 请求量、错误率、P95 延迟、Token 用量、工具失败率 |
| Logs       | 某个时间点发生了什么事件？     | 异常堆栈、状态变更、重试原因、业务告警           |
| Trace      | 一次请求经历了什么？           | 模型调用、检索、工具调用、Agent 执行和上下游关系 |
| Evaluation | 输出质量是否合格？             | 正确性、忠实度、工具选择、任务完成度、安全性     |
| Audit      | 谁在什么权限下执行了什么操作？ | 用户身份、审批记录、权限决策、外部写操作         |

![AI 可观测信号各自解决的问题](https://oss.javaguide.cn/github/javaguide/ai/llm/ai-observability-signals-overview.webp)

它们之间的配合关系可以用一句话说明：**指标发现异常，Trace 定位过程，评测判断质量，审计追踪责任。**

例如，Token 消耗突然上涨，Metrics 能快速触发告警。顺着异常时间段找到高消耗 Trace，可以看到某个 Agent 连续调用了 12 次模型。至于这 12 次调用是否必要、最终回答是否正确，还要交给评测规则判断。

Logs 也不能完全被 Trace 替代。Trace 适合展示调用关系和耗时，日志更适合记录离散事件和详细异常。比较实用的做法是让日志自动带上 `traceId` 和 `spanId`，这样可以从一条 Trace 跳到相关日志，也可以从错误日志反查完整调用链。

## Trace、Span、Session、Run 和 Attempt 怎么区分？

这几个概念很容易混在一起。OpenTelemetry 明确定义了 Trace 和 Span，Session、Run、Attempt 通常由应用自己定义。

| 概念    | 含义               | 例子                               |
| ------- | ------------------ | ---------------------------------- |
| Session | 一段连续会话       | 用户与客服 Agent 的 8 轮对话       |
| Run     | 一次任务执行       | 用户在第 5 轮要求“帮我申请退款”    |
| Trace   | 一次端到端调用链   | 从 API 接收请求到返回处理结果      |
| Span    | Trace 中的一个操作 | 检索知识库、调用模型、执行退款工具 |
| Attempt | 某个步骤的一次尝试 | 模型调用超时后的第 2 次重试        |

同步请求比较好理解：任务开始时创建 Trace，响应返回时结束，一次 Run 通常正好落在一条 Trace 里。

到了人工审批、异步恢复这类长任务，这种对应关系就不成立了。例如，Agent 提交申请后可能要等几个小时才能拿到审批结果，没必要让原来的 Span 一直开着。进入等待状态时结束当前 Trace，同时保存 `runId`；审批通过后创建一条新的 Trace，继续使用原来的 `runId`。这样既能把前后两段执行关联起来，也不会产生一条持续数小时的 Trace。

Session 的范围还要再大一层。它负责串起多轮对话，每一轮对话或每次任务执行都可以产生自己的 Trace。这几个 ID 各管一层：

```text
sessionId：串起同一段多轮会话
runId：串起一次任务，包括暂停和恢复后的执行
traceId：标识一次实际执行产生的调用链
spanId：标识调用链中的某个操作
attempt：标识同一步骤的第几次尝试
```

![Session、Run、Trace、Span 和 Attempt 的层级关系](https://oss.javaguide.cn/github/javaguide/ai/llm/ai-observability-id-hierarchy.webp)

重试也要单独处理。每次尝试都新建 Span，并用 `attempt` 标明次数。否则，第一次超时和第二次成功会混在同一条记录里，后面很难还原真实执行过程。

## 一次 Agent 请求应该怎样拆 Span？

Span 的拆分粒度决定了 Trace 是否真的有用。拆得太粗，只能看到“Agent 执行了 8 秒”；拆得太细，每个普通方法都是一个 Span，调用链里会堆满对排障没有帮助的节点。

以一个能够查询订单并申请退款的 Agent 为例，一条 Trace 可以这样拆：

```text
agent.run
├── ai.intent.classify
│   └── gen_ai.client.operation
├── ai.rag.retrieve
│   ├── gen_ai.client.operation        # 生成查询向量
│   ├── db.vector.client.operation     # 向量检索
│   └── ai.rag.rerank
├── invoke_agent                       # 执行客服 Agent
│   ├── gen_ai.client.operation        # 第一次模型调用
│   ├── execute_tool                   # 查询订单
│   │   └── HTTP GET /orders/{id}
│   ├── gen_ai.client.operation        # 根据工具结果继续判断
│   └── execute_tool                   # 创建退款申请
│       └── POST /refunds
└── ai.output.validate
```

![一次 Agent 请求的 Span 拆分示意图](https://oss.javaguide.cn/github/javaguide/ai/llm/ai-observability-agent-span-trace.webp)

这里并没有为 Prompt 模板渲染、字符串拼接之类的普通方法单独建 Span。通常满足下面任意一个条件，才值得独立记录：

- 调用了外部系统，例如模型服务、向量数据库和业务 API；
- 本身是一个重要业务阶段，例如检索、重排、规划和结果校验；
- 有独立的超时、重试或降级策略；
- 需要单独统计耗时、成本、错误率或质量；
- 出问题后，开发者确实需要判断它是否执行过、执行了几次。

一个 Span 最少要能回答四个问题：执行了什么、何时开始和结束、结果是否成功、它和其他步骤是什么关系。

### 父子关系应该怎么设计？

同步调用一般直接使用父子 Span。父 Span 表示一个较大的阶段，子 Span 表示阶段内部的操作。

Agent 并行调用多个专家时，每个专家 Span 都可以挂在同一个编排 Span 下。它们的时间区间会发生重叠，Trace 页面自然能看出并行关系。

```text
invoke_workflow
├── invoke_agent: technical-analysis   ──────────┐
├── invoke_agent: sentiment-analysis   ───────┐  │ 并行
└── invoke_agent: portfolio-manager            └── 汇总
```

一个 Span 只能有一个父 Span。如果某个聚合任务由多条独立消息共同触发，可以选定当前消费操作作为父 Span，再用 Span Link 关联其他上游上下文。不要为了表现“多个父节点”，手工拼接一棵不符合 Trace 模型的树。

### Span 名称应该怎么定？

Span 名称应该稳定、低基数，避免把用户问题、订单号或完整 URL 放进去。

推荐：

```text
invoke_agent customer-service
execute_tool query_order
ai.rag.retrieve
POST /refunds
```

不推荐：

```text
回答用户问题：我的订单 202608160001 为什么还没退款
查询订单 202608160001
```

后者会让 Span 名称数量随用户输入持续增长，既难聚合，也会明显增加存储和索引开销。订单号可以作为受控属性保存，或者只保存哈希值，没必要进入 Span 名称。

### OpenTelemetry 已经统一了 Agent Span 吗？

OpenTelemetry 已经提供 GenAI 语义约定，覆盖模型、Agent 和部分工作流操作。当前 Agent Span 文档包含 `invoke_agent`、`invoke_workflow`、`plan`、`execute_tool` 等操作名。

不过，截至本文编写时，[OpenTelemetry GenAI 语义约定](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md)和 [Agent Span 约定](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md)仍标记为 `Development`。这意味着属性和命名还有调整的可能。

工程上可以优先复用已经定义的通用字段，再为业务阶段增加自己的命名空间，例如 `ai.rag.*`、`ai.guardrail.*`。同时把约定版本写进埋点库，升级时集中适配，不要把厂商私有字段直接当成稳定标准散落在业务代码里。

## 一条 Trace 应该记录哪些信息？

Trace 记录得越多，排查问题时确实越方便，存储成本和泄露风险也会一起上升。线上可以先记录结构化元数据，再根据环境和权限决定是否保存内容。

### 请求和版本信息

一次 AI 请求至少应该能够定位到当时运行的代码和配置：

- `service.name`、环境和服务版本；
- `sessionId`、`runId`、租户标识；
- Agent、Workflow、Prompt 和知识库版本；
- 灰度分组、实验组和功能开关；
- 请求入口、调用方和区域。

Prompt 只记录模板内容还不够。模板没有变，系统 Prompt、Few-shot 示例、检索上下文或模型参数发生变化，输出同样可能完全不同。因此，最好把最终生效配置的版本或哈希一起保存。

### 模型调用信息

模型 Span 通常需要记录：

- 模型提供方、请求模型和实际响应模型；
- 温度、最大输出 Token、是否流式返回；
- 输入 Token、输出 Token、缓存命中 Token；
- 首 Token 延迟和总耗时；
- Finish Reason、限流、超时和重试次数；
- 估算成本或账单关联 ID。

模型别名可能会指向不同版本。只记录业务配置里的 `model=smart-model`，后面很难确认实际执行的是哪个模型。只要供应商响应里提供了模型版本或响应 ID，就应该一并保留。

### RAG 检索信息

检索阶段比较有价值的字段包括：

- 知识库和索引版本；
- 原始问题与改写问题的哈希或受控内容；
- 检索策略、过滤条件、`topK` 和相似度阈值；
- 召回文档 ID、分数、排序和数据版本；
- 重排模型、重排前后顺序；
- 最终送入 Prompt 的文档 ID；
- 查询耗时、返回数量和空召回标记。

如果只记录“向量数据库查询成功”，错误答案发生后依然无法判断正确资料有没有被召回。这里至少要保存文档标识、版本和分数。文档全文是否入 Trace，要根据数据等级单独决定。

### 工具调用信息

工具是 Agent 连接真实业务系统的入口，建议记录：

- 工具名称、版本和调用 ID；
- 参数摘要或参数哈希；
- 权限校验和人工审批结果；
- 超时、重试、幂等键和执行状态；
- 结果摘要、业务错误码和副作用标识；
- 下游服务的 Trace 上下文。

“工具调用成功”不一定代表业务成功。HTTP 200 的响应体里可能是 `stock=0`，退款接口也可能返回“重复申请”。Span 状态、HTTP 状态和业务结果应该分开记录。

### Agent 和工作流信息

Agent 或工作流 Span 还需要补充：

- Agent 角色、版本和允许使用的工具集合；
- 当前步骤、循环次数和最大迭代次数；
- 路由结果、停止原因和降级原因；
- 并行分支是否完成、超时或被取消；
- 汇总时实际使用了哪些上游结果；
- 最终输出的结构化校验结果。

这些字段要回答的问题很具体：最终回答到底基于哪些信息生成。尤其在多 Agent 系统里，“某个专家完成了”和“汇总 Agent 使用了它的结果”是两件事，最好分别记录。

## 低基数和高基数字段应该怎么区分？

可观测性系统需要对数据做聚合和索引。字段设计不当，会让指标时间序列和 Trace 索引快速膨胀。

低基数字段的取值范围有限，适合放到指标和 Trace 中：

```text
model.provider = openai
model.name = gpt-x
agent.role = customer-service
tool.name = query_order
result.status = success
environment = production
```

高基数字段的取值非常多，通常只适合放在 Trace，部分字段还要避免索引：

```text
user.id
session.id
document.id
model.response.id
tool.call.id
```

Prompt、Completion、工具参数和文档正文不只是高基数，它们还可能很长并包含敏感信息，更适合作为受控事件、独立内容存储或只保存哈希和对象地址。

Spring AI 的观测设计也采用了类似原则：[低基数键会进入 Metrics 和 Trace，高基数键只进入 Trace](https://docs.spring.io/spring-ai/reference/observability/index.html)。我们自己补充业务埋点时，也应该保持这个边界。

## AI 应用应该重点监控哪些指标？

指标应该围绕用户体验、稳定性、成本和质量来设计。下面这些指标在大多数 AI 应用里都比较实用。

### 请求层指标

- 请求量、成功率和并发数；
- 端到端 P50、P95、P99 延迟；
- 超时率、取消率和降级率；
- 首 Token 延迟和完整响应时间；
- 各入口、租户和版本的流量分布。

流式接口要区分首 Token 延迟与总耗时。用户通常更关心多久看到第一段内容，批处理任务则更关心整个任务何时结束。

### 模型层指标

- 模型调用次数、错误率和限流率；
- 输入、输出和总 Token；
- 单次请求 Token 分布；
- 缓存命中 Token；
- 模型重试和回退次数；
- 按模型、场景和租户统计的成本。

平均 Token 用量很容易掩盖长尾，至少还要关注 P95 和最大值。某个 Agent 偶尔陷入循环时，平均值未必明显变化，高分位数会先暴露问题。

### RAG 层指标

- 空召回率和有效文档数量；
- 检索、重排和上下文构建耗时；
- 相似度分数分布；
- 文档截断率和上下文 Token；
- 引用覆盖率、忠实度等离线或在线评测指标。

相似度高不代表答案一定正确，只能说明向量空间里的相关程度。检索质量最终还是要结合标注数据和答案评测。

### Agent 和工具层指标

- 每个 Run 的模型调用次数、工具调用次数和迭代次数；
- 工具成功率、业务失败率和超时率；
- 无效工具调用、重复调用和被拒绝调用；
- 人工接管率、等待审批时长；
- 任务完成率、部分成功率和失败原因分布；
- 多 Agent 分支耗时、缺失结果和汇总降级比例。

指标阈值不能直接照搬其他项目。一次简单问答调用 6 次模型可能明显异常，复杂技术调研任务调用 6 次模型反而很正常。先按照场景和版本建立基线，再为偏离基线的变化设置告警，会比给所有 Agent 配同一个固定阈值可靠得多。

## 如何用 Trace 定位常见的 AI Badcase？

一条好用的 Trace 应该支持沿着实际执行顺序逐层排查。下面用三个常见问题说明。

### RAG 返回了错误答案，应该先看哪里？

可以按照下面的顺序检查：

1. 查看问题改写 Span，确认检索问题有没有偏离用户原意；
2. 查看检索 Span，确认正确文档是否被召回；
3. 查看重排结果，确认正确文档有没有被排到 `topK` 之外；
4. 查看上下文构建记录，确认文档是否因为 Token 限制被截断；
5. 查看最终模型 Span，确认发送了哪个 Prompt 版本和哪些文档 ID；
6. 最后结合引用检查和忠实度评测，判断模型有没有脱离资料回答。

这条链路可以把“答案错了”拆成召回问题、排序问题、上下文问题和生成问题。后续修复也会更有针对性。

### 退款工具为什么执行了两次？

先看 `execute_tool` Span 的数量和 `attempt`。如果第一次调用超时，Agent 发起了第二次调用，还要继续检查：

- 两次请求是否使用同一个稳定的幂等键；
- 第一次超时后，下游是否仍然完成了退款；
- 重试策略来自模型、Agent 框架，还是 HTTP 客户端；
- 工具结果丢失后，Agent 是否把“未知”误判成“失败”；
- 下游业务记录和审计日志是否确认发生了两次副作用。

Trace 可以证明应用发起过哪些调用，不能替代退款系统的业务记录。如果调用超时，即使 Span 状态是 `ERROR`，或者应用属性把任务记成 `CANCELED`，也不能据此认定远端操作已经停止。

### 多 Agent 汇总为什么漏了一份结果？

先找到工作流 Span，再检查每个子 Agent 的状态和时间区间：

- 子 Agent 是否真正启动；
- 是成功、失败、超时，还是被取消；
- 结果有没有通过消息或共享状态写回；
- 汇总 Agent 启动时，依赖结果是否已经就绪；
- 汇总输入里实际包含了哪些 Agent 的结果 ID；
- 缺少结果时，系统走了失败、等待还是降级分支。

很多排查会漏掉“汇总输入”。只有子 Agent 的完成 Span，没有聚合阶段的输入清单，仍然不能判断结果是在传输时丢失，还是汇总 Agent 根本没有采用。

## 多 Agent、异步任务和消息队列如何保持 Trace？

单线程同步代码里，Trace 上下文通常能够自动沿调用栈传递。一旦切换线程、进程或消息队列，就需要明确处理传播问题。

![Trace 上下文跨线程、进程和消息边界的传播方式](https://oss.javaguide.cn/github/javaguide/ai/llm/ai-observability-context-propagation.webp)

### 跨服务如何传播？

[W3C Trace Context](https://www.w3.org/TR/trace-context/)定义了通用的 `traceparent` 和 `tracestate` 请求头。`traceparent` 用于传递 Trace ID、父 Span ID 和采样标记，`tracestate` 可以携带厂商相关的附加信息。

通过 HTTP、RPC 或消息队列调用下游服务时，发送方要注入上下文，接收方要提取上下文并创建子 Span。消息队列一般把这些字段放进消息 Header，而不是业务消息正文。

`traceparent` 和 `tracestate` 也不应该携带用户身份、订单号等业务数据。W3C 规范明确要求避免在这些字段里放入可识别个人的信息。

### 切换线程为什么会断链？

OpenTelemetry Java 的当前上下文默认基于 `ThreadLocal` 保存。任务提交给普通线程池后，如果没有自动插桩或显式包装，子线程看不到调用线程的上下文。

使用 OpenTelemetry API 时，可以在提交任务前捕获上下文：

```java
Context context = Context.current();

executorService.submit(context.wrap(() -> {
    supplementalAgent.run(task);
}));
```

`Runnable`、`Callable` 和 `ExecutorService` 都有对应的上下文包装方式，具体可以参考 [OpenTelemetry Java API](https://opentelemetry.io/docs/languages/java/api/)。

如果项目使用 Spring Boot，优先使用框架自动配置的 HTTP 客户端、TaskExecutor 和 Micrometer Context Propagation 能力。自己 `new` 客户端或线程池时，自动传播往往无法生效。

虚拟线程也没有改变 Trace 上下文传播的基本要求。它解决的是线程成本和阻塞并发问题，不会替我们定义任务之间的因果关系。是否需要手工传播，仍然取决于使用的埋点库、执行器和上下文机制。

### 流式调用是否一定能自动关联？

不能直接这样假设。

以 Spring AI 2.0.0 当前文档为例，同步的 OpenAI 和 Anthropic 调用能够把 HTTP Span 正确挂到模型 Span 下；流式调用的异步路径会切换到 `ForkJoinPool.commonPool()`，导致 HTTP Span 被记录下来，却没有成为模型 Span 的子节点。这是 [Spring AI 官方 Observability 文档](https://docs.spring.io/spring-ai/reference/observability/index.html#_chat_model)明确记录的当前限制。

这个例子说明，框架提供自动埋点以后，仍然要用集成测试检查实际拓扑。至少覆盖同步调用、流式调用、线程池、虚拟线程、消息队列和跨服务工具调用，确认 `traceId` 没有在边界处丢失。

### 一个任务跨多条 Trace 怎么关联？

异步 Agent 任务可能运行很久，中间还会等待人工输入。没必要让一条 Span 一直保持开启。

可以这样处理：

- 用 `runId` 关联整个业务任务；
- 每次实际执行创建一条新的 Trace；
- 在任务状态里保存上一条 Trace ID；
- 恢复执行时，通过属性或 Span Link 关联前序 Trace；
- 用事件时间和状态版本还原任务顺序。

这样既保留了业务连续性，也避免超长 Span 给采样和后端存储带来压力。

## Trace 里能保存完整 Prompt 和工具结果吗？

从排查问题的角度看，保存完整内容最方便。从安全和合规角度看，这通常也是风险最高的做法。

Prompt、模型回答和工具结果可能包含：

- 用户姓名、电话、地址和证件信息；
- 企业内部代码、合同和财务数据；
- 系统 Prompt、工具定义和安全策略；
- Access Token、Cookie 和数据库连接信息；
- 第三方知识库中受版权或权限保护的内容。

因此，线上默认应该记录元数据和摘要，内容字段按需开启。可以按照下面的层次处理：

1. **默认层**：保存版本、Token、耗时、状态、文档 ID、参数哈希等结构化信息。
2. **脱敏层**：保存经过手机号、邮箱、Token 等规则脱敏的 Prompt 和结果。
3. **受限调试层**：只对指定环境、租户或 Trace 临时开启完整内容，并设置更短保留期。
4. **审计层**：记录谁申请、谁审批、谁读取了敏感 Trace 内容。

Spring AI 默认不导出 Prompt、Completion、工具参数、工具结果和向量查询结果，原因正是这些内容可能很大并且包含敏感信息。OpenTelemetry GenAI 中的 `gen_ai.input.messages`、`gen_ai.output.messages`、`gen_ai.system_instructions` 等内容属性也属于需要主动开启的字段。

除了脱敏，还需要同时处理访问控制、传输与存储加密、保留周期、租户隔离和删除机制。微软的 [GenAI 与 Agent 系统可观测性指南](https://learn.microsoft.com/en-us/security/zero-trust/sfi/observability-ai-systems)也强调，采集和保留范围需要在取证需求、数据最小化、驻留要求、合规和权限之间做明确约定。

有些数据根本不应该进入 Trace，例如明文密码、长期密钥和完整认证 Token。即使设置了“仅管理员可见”，也不值得承担额外风险。

## Trace 采样应该怎么设计？

测试环境可以短期开启全量 Trace，生产环境长期全量记录通常成本很高。AI 请求的 Span 数、属性体积和执行时长都可能明显高于普通接口，采样策略需要单独设计。

### 头部采样和尾部采样有什么区别？

头部采样在请求刚进入系统时做决定。例如，按 Trace ID 随机保留 10%。优点是实现简单、开销可控；缺点是做决定时还不知道这条请求最终是否失败、是否特别慢。

尾部采样会等待一条 Trace 的更多 Span 到达后再判断。它可以优先保留：

- 出现错误或超时的 Trace；
- 超出场景阈值的慢请求；
- Token 或费用异常高的请求；
- 发生降级、回退和人工接管的请求；
- 命中安全策略或执行高风险工具的请求；
- 新版本和灰度实验的请求。

尾部采样需要 Collector 暂存 Trace，会增加内存和等待成本，还要考虑分布式 Collector 如何让同一 Trace 到达同一个决策节点。OpenTelemetry Collector 的 [Tail Sampling Processor](https://explorer.opentelemetry.io/collector/components/contrib-tailsamplingprocessor?type=processor)目前对 Trace 标记为 Beta，生产使用前要压测容量和丢弃行为。

![Trace 头部采样和尾部采样的区别](https://oss.javaguide.cn/github/javaguide/ai/llm/ai-observability-head-tail-sampling.webp)

### 比较实用的组合策略是什么？

生产环境可以使用分层策略：

```text
普通成功请求：低比例采样
错误、超时和高延迟请求：尽量保留
高 Token、高费用和循环次数异常：尽量保留
高风险写工具、人工审批和安全事件：进入独立审计链路
灰度版本和重点租户：在受控时间内提高比例
```

还要保证采样决定在一条 Trace 内尽量一致。如果根 Span 被保留，关键子 Span 却被单独丢掉，最后只会得到一条残缺调用链。

审计数据不要完全依赖 Trace 采样。退款、转账、删除资源等高风险操作，即使业务 Trace 没有被采样，审计记录仍然应该按照业务和合规要求独立保存。

## 线上 Trace 如何回流到评测体系？

Trace 的价值不应该停在“出问题时查一下”。线上 Badcase 可以按照下面的流程持续回流：

```text
线上告警或用户反馈
        ↓
定位异常 Trace
        ↓
确认根因并补充人工标注
        ↓
脱敏后加入 Badcase 集合
        ↓
修复 Prompt、RAG、工具或编排逻辑
        ↓
离线回放与回归评测
        ↓
灰度上线并继续观察
```

回放时需要区分两种目标。

第一种是**复现当时的问题**。这种回放要固定模型版本、Prompt、文档快照、工具响应、随机参数和超时配置，尽可能还原原始条件。

第二种是**验证新版本效果**。这时可以把同一批输入交给新 Prompt、新模型或新知识库，比较正确性、任务完成率、延迟和成本。

只保存一条用户问题，后面很难精确复现。至少还要保存版本和外部依赖快照。对于实时订单、股票价格等动态数据，可以保存当时的工具结果或可追溯的数据版本，不能指望几天后再次请求接口得到相同答案。

关于 Golden Set、Agent 评测、线上 Badcase 回流和回归门禁，可以继续阅读[《大模型应用如何评测？》](../llm-basis/llm-evaluation.md)。

## Java/Spring AI 项目如何接入可观测性？

Spring AI 已经为 `ChatClient`、Advisor、`ChatModel`、`EmbeddingModel`、`ImageModel`、工具调用和 `VectorStore` 提供了观测能力。项目接入时先打通基础 Trace，再补业务 Span，评测和审计可以随后接入。

下面的配置以 **Spring AI 2.0.0 和当前 Spring Boot 4.x 配置项**为例。不同版本的依赖和属性可能有调整，升级时应该以对应版本的官方文档为准。

### 如何打通 Spring AI 自带的 Trace？

Spring Boot 4 可以使用 `spring-boot-starter-opentelemetry`，通过 OTLP 把 Trace 发送到 OpenTelemetry Collector 或兼容后端。应用侧的关键配置示例如下：

```yaml
management:
  tracing:
    sampling:
      probability: 0.1
    export:
      otlp:
        enabled: true
  opentelemetry:
    tracing:
      export:
        otlp:
          endpoint: http://otel-collector:4318/v1/traces

spring:
  ai:
    chat:
      client:
        observations:
          log-prompt: false
          log-completion: false
      observations:
        log-prompt: false
        log-completion: false
        include-error-logging: false
    tools:
      observations:
        include-content: false
    vectorstore:
      observations:
        log-query-response: false
```

Spring Boot 当前默认采样概率是 0.1。开发环境为了检查 Trace 结构，可以临时改为 1.0；生产环境要根据流量、单条 Trace 体积和后端容量制定采样策略。

上面的内容记录开关都保持关闭。先确认元数据和调用链足够排查问题，再按数据等级逐项开启，比一开始把所有 Prompt 和结果都发到观测平台更稳妥。

### 哪些 Span 需要自己补？

框架自动埋点主要覆盖 AI 基础组件，业务编排仍然需要自己记录。例如：

- 一次完整 Agent Run；
- 问题改写、重排和上下文裁剪；
- 工作流路由、并行汇总和降级；
- 输出结构化校验与安全检查；
- 人工审批、任务暂停和恢复；
- 业务结果，例如退款申请是否真正创建成功。

Spring Boot 项目可以直接使用 Micrometer Observation API 包装业务阶段：

```java
@Component
public class RagObservationService {

    private final ObservationRegistry observationRegistry;
    private final DocumentRetriever documentRetriever;

    public RagObservationService(ObservationRegistry observationRegistry,
                                 DocumentRetriever documentRetriever) {
        this.observationRegistry = observationRegistry;
        this.documentRetriever = documentRetriever;
    }

    public List<DocumentHit> retrieve(RagQuery query) {
        Observation observation = Observation
                .createNotStarted("ai.rag.retrieve", observationRegistry)
                .lowCardinalityKeyValue(
                        "ai.rag.strategy",
                        query.strategy().name()
                )
                .highCardinalityKeyValue(
                        "ai.rag.knowledge_base_id",
                        query.knowledgeBaseId().toString()
                );

        return observation.observe(() -> {
            List<DocumentHit> hits = documentRetriever.retrieve(query);
            observation.lowCardinalityKeyValue(
                    "ai.rag.result",
                    hits.isEmpty() ? "empty" : "hit"
            );
            observation.highCardinalityKeyValue(
                    "ai.rag.result_count",
                    Integer.toString(hits.size())
            );
            return hits;
        });
    }
}
```

这段代码只演示 Span 边界和基数字段的区别。`ai.rag.result` 只有 `empty` 和 `hit` 两种值，可以参与指标聚合；召回数量只放到 Trace。真实项目还要统一错误类型和标签命名，不要把原始查询和文档正文直接设为默认 Tag。

如果只是想给一个稳定的方法增加 Span，也可以使用 [OpenTelemetry Java Agent 提供的 `@WithSpan`](https://opentelemetry.io/docs/zero-code/java/agent/annotations/)：

```java
@WithSpan("ai.output.validate")
public ValidationResult validate(AgentResponse response) {
    return outputValidator.validate(response);
}
```

业务代码已经使用 Micrometer Observation 时，不建议同一个操作再手工创建一层重复的 OpenTelemetry Span。先统一项目的埋点入口，避免 Trace 里出现名称不同、内容相同的两层节点。

### 如何验证接入结果？

至少准备一组集成测试场景：

1. 正常的 RAG 问答；
2. 模型超时后重试；
3. 工具返回业务失败；
4. 线程池或虚拟线程并行执行；
5. 流式模型响应；
6. 通过 HTTP 或消息队列调用下游；
7. Agent 暂停后恢复；
8. Prompt 和工具结果包含敏感信息。

验证时不只是检查“平台里有 Trace”，还要确认：

- 父子关系和并行时间线是否正确；
- 每次重试是否有独立 Attempt；
- 错误状态、业务结果和取消状态是否准确；
- Token、模型版本和文档 ID 是否能够查到；
- 跨线程和跨服务以后 `traceId` 是否保持一致；
- 敏感字段是否被脱敏或完全没有上报；
- 采样后是否仍能保留完整的关键链路。

Spring Boot 当前文档还特别说明，`@SpringBootTest` 不会自动配置负责上报数据的 Tracing 组件。测试环境看不到导出结果时，先确认是否显式配置了上报组件，不要直接把它判断为上下文传播问题。

## AI 可观测性平台应该怎么选？

选型前先明确项目真正缺什么。常见能力可以分为四类：

1. **通用 APM 能力**：服务调用链、日志关联、指标告警和基础设施监控；
2. **LLM Trace 能力**：Prompt、模型、Token、成本、检索和工具调用展示；
3. **评测能力**：数据集、打分器、实验对比、Badcase 管理和发布门禁；
4. **治理能力**：脱敏、租户隔离、权限、保留周期和审计。

如果公司已经有成熟的 OpenTelemetry 和 APM 体系，可以让应用统一输出 OTLP，再根据需要接入专门的 LLM 观测或评测界面。这样网络、数据库和 AI 调用能够留在同一条分布式 Trace 中。

如果项目还处在验证阶段，也可以先使用框架自带观测能力和一个支持 OpenTelemetry 的后端，把必要的 Span 层级跑通。过早绑定大量平台私有字段，后面迁移会比较麻烦。

这里以国内的现成服务或者中间件来说：

- [阿里云 ARMS](https://help.aliyun.com/zh/arms/application-monitoring/developer-reference/llm-trace-field-definition-description) 展示了 Completion、RAG、Agent 和 Tool 的字段，并明确说明其中包含基于 OpenTelemetry GenAI 约定增加的扩展；
- [腾讯云日志服务](https://cloud.tencent.com/document/product/614/133517)把指标、Trace 调用树和 Session 视图放在同一套 Agent 观测页面里；
- [SkyWalking 10.4 的中文文章](https://skywalking.apache.org/zh/2026-04-05-virtual-genai-monitoring/)则侧重 Java 客户端采集、TTFT、Token 和成本。这些资料能说明具体产品怎样落地，里面的 Span 类型和扩展字段仍然属于各自实现，不能直接当成 OpenTelemetry 通用约定。

选型时还要确认下面几个问题：

- 是否支持 OpenTelemetry，哪些字段属于私有扩展；
- 能否关联普通 HTTP、数据库和消息队列 Span；
- Prompt、工具参数是否支持脱敏、加密和细粒度权限；
- 采样规则能否按错误、延迟、Token 和业务属性配置；
- Trace 能否加入数据集并用于离线评测；
- 数据能否按租户隔离、删除和设置保留期；
- 平台自身故障时，是否会影响主业务请求。

遥测导出应该异步、限时并设置队列上限。观测后端不可用时可以丢失部分普通遥测，不能反过来拖垮 Agent 主链路。审计数据需要更强的可靠性时，应当使用独立的持久化链路。

## 落地 AI 可观测性时最容易犯哪些错误？

### 只记录一次模型调用

一次 Agent Run 往往包含多次模型、检索和工具调用。只在最外层记一条“调用模型成功”，无法定位问题，也看不到循环和重试。

### 把 HTTP 成功当成任务成功

工具返回 200，业务可能已经拒绝；模型正常输出，答案可能不合格。传输状态、执行状态、业务状态和质量结果要分开记录。

### 所有内容默认上报

完整 Prompt 和工具结果确实方便调试，同时会带来敏感信息泄露、索引膨胀和存储成本。线上默认记录元数据，内容按场景、权限和时效开启。

### 把用户输入放进指标标签

用户 ID、Session ID、问题文本和订单号会制造高基数时间序列。它们应该进入 Trace 或受控日志，不能直接成为通用 Metrics 标签。

### 依赖自动埋点却不检查上下文

线程池、异步流、消息队列和自建 HTTP 客户端都可能造成断链。自动埋点只是减少手工工作，最终还要通过集成测试检查调用拓扑。

### Trace 采样了，审计也跟着丢了

Trace 用于排障，可以采样。高风险业务操作的审计记录承担责任追踪，不能由普通 Trace 的随机采样决定是否保留。

### 收集了大量 Trace，却没有回流 Badcase

如果 Badcase 没有进入数据集，修复后也没有回归评测，团队只能不断重复处理相似问题。至少要把异常 Trace、评测集和发布门禁接起来。

## 面试中如何回答 AI 可观测性相关问题？

### AI 可观测性和传统可观测性最大的区别是什么？

传统可观测性更关注服务、请求和资源，AI 可观测性还要覆盖模型、Prompt、Token、检索、工具和 Agent 执行过程。因为 AI 输出具有概率性，接口成功也无法证明结果正确，所以还要把 Trace 与 Evaluation 结合起来。

### 为什么只有 Metrics 和日志还不够？

Metrics 适合发现整体异常，日志适合记录离散事件。一次 Agent 请求可能包含多次模型和工具调用，只有 Trace 能比较直观地还原它们的顺序、并行关系、耗时和上下游依赖。

### Agent Trace 应该如何拆 Span？

先创建一次 Run 的根 Span，再按照模型调用、检索、重排、工具调用、子 Agent 和结果校验等关键阶段拆分子 Span。需要独立统计、重试、超时或定位的问题才单独建 Span，普通方法没有必要全部记录。

### 如何定位一次 RAG 错误回答？

沿 Trace 检查问题改写、召回文档、重排顺序、上下文裁剪、Prompt 版本和模型输出，再用引用检查、忠实度等评测判断答案是否基于资料。这样可以区分检索问题与生成问题。

### 多 Agent 并行执行时如何保持调用链？

让各子 Agent Span 继承同一个工作流父上下文。跨线程时显式传播 Context 或使用框架提供的上下文传播能力，跨服务和消息队列时注入、提取 W3C Trace Context。聚合阶段还要记录实际使用了哪些子 Agent 结果。

### Prompt 和模型回答应该全部写入 Trace 吗？

线上不建议默认全量保存。先记录版本、Token、耗时、哈希和结果状态，需要内容排查时再对受控环境或指定请求临时开启，并配合脱敏、权限、加密、保留期和审计。

### 头部采样和尾部采样怎么选？

头部采样简单、开销可控，但请求刚开始时还不知道是否异常。尾部采样可以优先保留错误、慢请求和高 Token Trace，代价是 Collector 要等待并缓存数据。实际项目通常用低比例基础采样，再为异常和高风险请求提高保留率。

### Trace 和 Evaluation 是什么关系？

Trace 还原“系统做了什么”，Evaluation 判断“做得好不好”。线上失败 Trace 可以脱敏后沉淀为 Badcase，用于离线回放、版本对比和发布回归。

## 总结

做好 AI 可观测性，要让一次 AI 请求可以被完整还原。多装一个监控面板解决不了数据缺失和调用链断裂。

一套能够真正用于生产排障的方案，至少要做到下面几点：

- 区分 Session、Run、Trace、Span 和 Attempt；
- 覆盖模型、RAG、工具、Agent 和最终业务结果；
- 正确传播跨线程、跨服务和消息队列的 Trace 上下文；
- 把高低基数字段、元数据和敏感内容分层处理；
- 结合头部和尾部采样控制成本，同时保留关键异常；
- 让线上 Trace 回流 Badcase、评测集和发布门禁；
- 将可观测性 Trace 与业务审计分开建设。

当线上再次出现“接口成功，但答案不对”时，一条 200 日志远远不够。沿着 Trace 找到当时的模型、资料、工具、版本和每一步执行结果，Agent 系统才有持续排查和改进的基础。

## 参考资料

- [OpenTelemetry：Generative AI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md)
- [OpenTelemetry：Semantic Conventions for GenAI Agent Spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md)
- [OpenTelemetry：Semantic Conventions for GenAI Metrics](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md)
- [OpenTelemetry：Java API 与 Context 传播](https://opentelemetry.io/docs/languages/java/api/)
- [OpenTelemetry：Java Agent Instrumentation Annotations](https://opentelemetry.io/docs/zero-code/java/agent/annotations/)
- [OpenTelemetry Collector：Tail Sampling Processor](https://explorer.opentelemetry.io/collector/components/contrib-tailsamplingprocessor?type=processor)
- [W3C：Trace Context](https://www.w3.org/TR/trace-context/)
- [Spring AI：Observability](https://docs.spring.io/spring-ai/reference/observability/index.html)
- [Spring Boot：Tracing](https://docs.spring.io/spring-boot/reference/actuator/tracing.html)
- [OpenAI Agents SDK：追踪（简体中文）](https://openai.github.io/openai-agents-python/zh/tracing/)
- [Microsoft：Observability for Generative AI and agentic AI systems](https://learn.microsoft.com/en-us/security/zero-trust/sfi/observability-ai-systems)
- [Microsoft Foundry：在 Microsoft Foundry 中设置跟踪](https://learn.microsoft.com/zh-cn/azure/foundry/observability/how-to/trace-agent-setup)
- [阿里云 ARMS：LLM Trace 字段定义说明](https://help.aliyun.com/zh/arms/application-monitoring/developer-reference/llm-trace-field-definition-description)
- [腾讯云日志服务：Agent 可观测应用详情](https://cloud.tencent.com/document/product/614/133517)
- [Apache SkyWalking：基于 SkyWalking 10.4 的大模型应用监控](https://skywalking.apache.org/zh/2026-04-05-virtual-genai-monitoring/)
