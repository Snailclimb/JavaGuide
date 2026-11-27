---
title: Spring AI 应用实践：从知识库问答到工具调用
description: 以售后知识库助手为例，理解 Spring AI 的 ChatClient、Advisor、ChatMemory、检索增强、工具调用与流式返回，说明权限、状态和观测如何配合。
category: AI
tag:
  - Spring AI
  - Java AI
  - RAG
---

给已有的 Spring 应用加一个售后助手，需要把哪些东西接起来？以“这笔订单还能退货吗”为例，订单状态在业务数据库里，退货政策在知识库里，用户却只输入了一句话。Spring AI 可以组织模型调用、政策检索和工具执行，让模型根据查到的材料回答问题。

**订单归属、退货资格和退款操作仍由业务服务处理。** 比如查订单前要校验当前用户的权限，模型生成了订单号也不能跳过这一步。

文中的 API 行为以 **2026-11-06 核对的 Spring AI 2.0.2 官方参考文档**为准。其他版本的工具调用和 Advisor 编排可能不同，使用时需要对照项目版本。

## Spring AI 在这次请求里负责什么？

**Spring AI 提供模型交互与常用 AI 组件的抽象，业务规则仍由应用执行。** 在现有 Spring 应用中，订单服务、鉴权和审计可以继续保留，模型通过受控工具获取所需数据。

| 组件                                       | 在售后助手中的作用                             |
| ------------------------------------------ | ---------------------------------------------- |
| `ChatClient`                               | 组织本轮消息和调用选项，取得普通或流式回答     |
| `ChatModel`                                | 对接底层模型服务，处理模型请求与响应           |
| `Advisor`                                  | 在请求与响应过程中处理上下文、检索、记忆等逻辑 |
| `ChatMemory`                               | 选择当前会话需要保留和读取的消息               |
| `VectorStore` 与检索 Advisor               | 查找与退货问题相关的政策片段                   |
| `ToolCallingAdvisor`、`ToolCallingManager` | 组织工具调用循环，并执行应用暴露的工具         |

`ChatClient` 支持普通调用和流式调用，`Advisor` 则在模型调用前后处理请求。它们的具体行为见 [ChatClient 文档](https://docs.spring.io/spring-ai/reference/api/chatclient.html)与 [Advisors 文档](https://docs.spring.io/spring-ai/reference/api/advisors.html)。

Spring AI 与 Spring AI Alibaba 是不同项目。已有文章中的 [Spring AI Alibaba Graph 示例](../agent/workflow-graph-loop.md)用于解释工作流，不能直接当作 Spring AI 的 API 使用说明。

## 一次售后问答怎么执行？

假设用户已经登录，选中了自己的一笔订单，随后问：“上周买的商品还没拆封，现在可以退吗？”

**先处理业务身份和查询条件。** 服务端校验订单归属，确定用户、会话与租户标识。模型即使生成了另一个订单号，也不能据此访问其他人的订单。会话 ID 用于定位上下文，不能代替资源权限校验。

接下来读取必要的对话消息，并查询订单状态、签收时间和商品类型。对订单查询这种明确必需的步骤，应用可以直接调用业务服务；对需要根据问题决定是否查询的场景，也可以将查询能力暴露为工具。两种方式都要执行相同的业务权限检查。

有了这些条件，再检索适用的政策。模型拿到订单事实和政策证据后，才能给出带条件的回答。证据不足时，应说明还缺签收时间、商品类别或适用政策，不能把检索到的一段相似文字直接解释成退款承诺。

### Advisor 顺序为什么会影响结果？

Advisor 按 `getOrder()` 的顺序进入调用链，较小的值先处理请求，响应沿调用链返回。检索和记忆如果需要先后配合，就要明确它们在本轮分别读取什么输入。不能只因为注册了两个 Advisor，就假设检索一定能理解历史里的“这笔订单”。[官方说明](https://docs.spring.io/spring-ai/reference/api/advisors.html)

本例可以由应用先把指代解析成明确的查询条件，再进行政策检索。采用其他编排方式也可以，但要检查实际送给检索组件的问题，而不能只检查最终 Prompt。

### 政策检索怎么接入？

`QuestionAnswerAdvisor` 可以从已装载文档的 `VectorStore` 检索相关片段并补充上下文；`RetrievalAugmentationAdvisor` 提供更细的 RAG 组合能力。它们解决检索接入问题，文档如何清洗、按哪个版本入库仍需单独处理。[RAG 官方文档](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html)

在售后场景中，租户、地区、商品类型和政策生效条件影响检索范围。过滤条件应由服务端根据可信业务信息生成。可以交给模型理解的是用户问法，不能让模型任意取消权限过滤。没有检索到适用证据时，应用应明确采用澄清、拒答或转人工流程。

## 工具调用是不是模型直接操作数据库？

**不是。模型提出工具调用及参数，应用执行工具并返回结果。** Spring AI 2.0 的 `ChatClient` 通过 `ToolCallingAdvisor` 组织这一循环，`ToolCallingManager` 负责执行工具；结果可再次提供给模型，以继续判断或生成最终回答。[Tool Calling 官方文档](https://docs.spring.io/spring-ai/reference/api/tools.html)

售后助手可以提供“查询订单”工具，但“创建退款单”要单独处理授权、确认与幂等。描述中写“只能操作自己的订单”有助于模型理解用途，真正的归属校验仍在工具执行端完成。

用户问能不能退货，不代表授权系统立即退款。本文场景只回答资格和下一步操作；用户明确申请退款后，再进入业务服务定义的确认流程。若工具超时但可能已创建退款单，应先查询业务结果，不能直接再创建一次。

工具调用可能多次返回模型，因此一次用户问答不一定只调用一次模型。执行预算、工具错误和停止条件需要纳入应用设计，具体见 [结构化输出与 Function Calling](../llm-basis/structured-output-function-calling.md)。

## ChatMemory 能当完整聊天记录吗？

版本补充（2026-11-27）：Spring AI 2.1.0 已将 `ChatMemory` 和 `MessageChatMemoryAdvisor` 标为弃用，计划在 3.0.0 移除，并推荐迁移到 Session Memory。下面继续说明 2.0.2 的记忆机制；升级项目时应按[官方迁移说明](https://docs.spring.io/spring-ai/reference/api/tools.html#_memory_and_the_tool_loop)检查配置，不能直接沿用旧版默认顺序。

`ChatMemory` 维护的是供模型使用的会话上下文，`ChatMemoryRepository` 负责消息存取。完整聊天历史、业务操作审计和长任务检查点应分别保存，不能因为有了会话记忆就省掉业务记录。[Chat Memory 官方文档](https://docs.spring.io/spring-ai/reference/api/chat-memory.html)

例如窗口策略淘汰早期消息后，模型上下文可以不再包含它们，但用户仍可能需要查看历史回答，审计也仍需追溯当时的授权。

工具消息还与 Advisor 的位置有关。2.0.2 的工具调用文档区分了记忆 Advisor 在工具循环外与循环内的情况：默认在循环外时，不会捕获中间工具请求和结果。

如果希望后续对话能读到这些工具消息，可以调整记忆 Advisor 的顺序，让它进入工具循环。不过，还要检查所用的 `ChatMemoryRepository` 能否保存相应消息类型。配置了记忆组件，并不意味着每次工具调用都已经持久化。具体配置见 [Memory and the Tool Loop](https://docs.spring.io/spring-ai/reference/api/tools.html#_memory_and_the_tool_loop)。

## 流式回答和任务完成有什么区别？

**流式回答解决的是内容怎样返回给用户的问题。** 调用 `stream()` 后，应用可以逐段接收模型输出，再转发给前端。订单查询和政策检索该等多久，仍取决于相应接口的执行情况。

比如前端已经显示“正在查询订单”，订单接口却还没有返回，此时显然不能告诉用户符合退货条件。即使模型随后输出了“退款成功”，应用也要查询退款单的业务状态，才能确认退款操作是否完成。

另外，`stream()` 不保证整个调用过程都没有阻塞。模型适配器、Advisor 和工具各有自己的执行方式，排查响应慢的问题时需要分别检查，相关说明见 [ChatClient 实现说明](https://docs.spring.io/spring-ai/reference/api/chatclient.html#_implementation_notes)。

用户关闭页面后，上游请求是否取消也要由应用处理。对于耗时较长、需要离线继续执行的任务，可以返回任务 ID，让客户端查询状态和最终结果。具体区别见 [AI 应用系统设计](../system-design/ai-application-architecture.md#同步、流式、异步三种交互模式怎么选)。

## 回答出错时，先看哪些记录？

假设助手把不支持退货的订单回答成了“可以退”，只看这句回答，很难知道错在哪里。可以沿着这次请求往前查：

- 订单查询返回的签收时间和商品类型是否正确？查错订单时，要先检查业务查询。
- 检索用了哪一版退货政策？若返回的是已失效的政策，问题出在知识库或过滤条件。
- 正确的条件和政策是否都传给了模型？如果材料完整，回答却遗漏了例外条款，再检查模型对证据的理解。

Spring AI 为 `ChatClient`、Advisor、模型和向量存储提供指标与链路追踪。订单归属校验、用户确认和退款单状态则需要应用自己记录，排障时把它们关联到同一次请求。相关能力见 [Observability 官方文档](https://docs.spring.io/spring-ai/reference/observability/index.html)。

**默认情况下，观测数据中不会导出 Prompt 和回答正文。** 这些内容可能带有用户信息。确实需要查看时，再配置采集，并做好访问控制、脱敏和过期清理，不能把“开启 Trace”等同于“已经保存全部对话”。

正常咨询、无权查看订单、政策缺失、工具超时、取消请求，都可以作为发布前的检查案例。本文没有提供可直接运行的完整应用，这些场景仍需在实际项目中验证。如何组织案例见 [AI 应用评测体系](../llm-basis/llm-evaluation.md)，如何关联记录见 [AI 可观测性与 Trace](../system-design/ai-observability.md)。
