---
sitemap: false
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

# AI 内容规划 TODO

最近整理：2026-06-21

配套素材索引：[AI 写作素材索引](./MATERIALS.md)。写新文章前先查素材索引和现有正文，避免重复检索、重复造概念框架。

## 已完成或已补齐

| 内容                                           | 状态                                          |
| ---------------------------------------------- | --------------------------------------------- |
| `llm-basis/llm-evaluation.md`                  | 已完成，已进入大模型基础 README 和顶层 README |
| `system-design/llm-gateway.md`                 | 已完成，已进入系统设计 README 和顶层 README   |
| `agent/workflow-graph-loop.md`                 | 已进入 Agent README、顶层 README 和面试题     |
| `system-design/ai-application-architecture.md` | 已进入系统设计 README、顶层 README 和面试题   |
| `system-design/ai-voice.md`                    | 已进入系统设计 README、顶层 README 和面试题   |
| `MATERIALS.md`                                 | 已新增为内部写作素材索引，不进站点索引        |

## P0 · 系统设计和安全补全

| 文件名                              | 标题                                                      | 核心切入                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `system-design/llm-security.md`     | LLM 应用安全实战：Prompt 注入、工具越权与数据泄露防护     | 从传统“输入不可信”切入 AI 新攻击面，覆盖 Prompt Injection、Indirect Injection、工具权限边界、MCP Server 风险、最小权限、审计和 OWASP LLM Top 10           |
| `system-design/ai-observability.md` | AI 可观测性与 Trace：为什么 Agent 失败不能只看最终答案    | 一次请求里的模型调用、检索、工具调用、上下文拼装、重试、fallback 全链路 span，覆盖 Langfuse、OpenTelemetry、自建审计表和 Java 后端落地结构                |
| `agent/tool-calling.md`             | Agent 工具调用详解：Function Calling、MCP Tool 与权限控制 | 串起 `structured-output-function-calling.md`、`mcp.md` 和 `ai-application-architecture.md`，重点讲工具 Schema、参数校验、权限审批、执行结果回传和失败恢复 |

## P1 · Agent 工程短板补全

| 文件名                             | 标题                                               | 核心切入                                                                                   |
| ---------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `agent/agent-evaluation.md`        | Agent 评测与调试：如何判断 Agent 真的完成了任务    | 任务完成率、工具调用成功率、幻觉率、格式遵循率、延迟成本、Trace 回放和回归集               |
| `agent/multi-agent.md`             | 多 Agent 协作：Sub-Agent、任务拆分与上下文隔离     | 面试高频：Agent 为什么不稳定、何时拆 Sub-Agent、上下文怎么隔离、评审/执行/验证角色如何分工 |
| `llm-basis/llm-model-selection.md` | 大模型选型指南：通用、推理、代码、多模态模型怎么选 | 不同能力维度对比、Router/fallback/多模型编排、客服/RAG/代码/语音 Agent 的选型表            |

## P1 · RAG 深水区扩展

| 文件名                  | 标题                                                         | 核心切入                                                         |
| ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `embedding-reranker.md` | Embedding 与 Reranker 模型选型：RAG 效果差未必是向量库的问题 | 不同 Embedding 模型能力对比、Reranker 原理、选型场景             |
| `rag-multimodal.md`     | 多模态 RAG：PDF 表格、图片、截图与视频的知识库处理           | 企业知识库最难处理的是 PDF 表格和截图、OCR、图表理解、多模态检索 |
| `finetune-vs-rag.md`    | 微调、蒸馏与 RAG 怎么选：什么时候该做数据训练？              | SFT / LoRA / DPO / RFT 原理对比，什么时候调 Prompt 已经不够了    |

## P2 · Java AI 框架专题

| 文件名                     | 标题                                                                   | 写作顺序                                   |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `framework/README.md`      | AI 框架专题：Spring AI、LangChain4j 与 AI Workflow 工程落地            | 先补目录入口，避免 `framework/` 长期空置   |
| `spring-ai.md`             | Spring AI 入门与实战：Java 后端如何接入大模型                          | 先写，贴合 JavaGuide 读者群体              |
| `langchain4j.md`           | LangChain4j 实战：Java 应用如何构建 RAG 和 Agent                       | 第二篇                                     |
| `ai-workflow-framework.md` | LangGraph / Spring AI Alibaba Graph：AI Workflow、Graph、Loop 如何落地 | 第三篇，与 workflow-graph-loop.md 互相引用 |

## P2 · MCP 进阶与合规

| 文件名             | 标题                                                            | 核心切入                            |
| ------------------ | --------------------------------------------------------------- | ----------------------------------- |
| `mcp-advanced.md`  | MCP 生产安全与高级能力：Roots、Sampling、Elicitation 与权限边界 | MCP Server 不是工具集合而是新攻击面 |
| `ai-compliance.md` | AI 合规与隐私治理：AI 应用上线前安全、审计、隐私要查什么        | 企业落地越来越常见，面试频率会上升  |

## 建议下一步实际动手顺序

1. `system-design/llm-security.md`：JavaGuide 读者对安全话题接受度高，可以从传统 Web 安全自然过渡到 AI 新攻击面。
2. `system-design/ai-observability.md`：能和 `harness-engineering.md`、`rag-optimization.md`、`llm-evaluation.md` 接上，形成“调试 -> 评测 -> 观测”闭环。
3. `agent/tool-calling.md`：把 Function Calling、MCP Tool、权限审批和工具执行链路单独讲透，后续安全和系统设计都能复用。
4. `framework/README.md` + `framework/spring-ai.md`：`framework/` 目前为空，先补 Java 读者最容易用上的 Spring AI。

## 维护规则

1. 新增文章后，同步检查顶层 README、子专题 README、面试题入口、`MATERIALS.md` 和本文。
2. 写面向读者的文章时不要链接内部维护文档，内部维护文档保持 `sitemap: false` 和 `noindex, nofollow`。
3. 具体模型、平台能力、价格、上下文窗口、API 参数这类容易变化的信息，写入正文前要重新核对官方文档。
4. 完成一项后及时从待办移动到“已完成或已补齐”，避免下次维护时重复判断。
