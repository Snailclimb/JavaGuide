---
sitemap: false
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

# AI 内容规划 TODO

## P0 · 大模型基础补全（llm-basis）

| 文件名                   | 标题                                               | 核心切入                                                                                                   |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `llm-model-selection.md` | 大模型选型指南：通用、推理、代码、多模态模型怎么选 | 不同能力维度对比、Router / fallback / 多模型编排、选型表（客服 / RAG / 代码 / 语音 Agent）                 |
| `llm-evaluation.md`      | AI 应用评测体系：离线评测、Trace 回放到线上灰度    | 为什么公开 benchmark 不够、Golden Set 构建、LLM-as-Judge、RAG / Agent / 工具调用分别怎么评测、接入 CI 回归 |

## P0 · 系统设计补全（system-design）

| 文件名                | 标题                                                   | 核心切入                                                                                                                                   |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `llm-gateway.md`      | 大模型网关深度设计：多模型路由、限流、降级与成本控制   | 为什么需要 LLM Gateway、多供应商适配、fallback / 熔断、Token 预算与用户配额、日志脱敏与审计                                                |
| `ai-observability.md` | AI 可观测性与 Trace：为什么 Agent 失败不能只看最终答案 | 一次请求里模型调用 / 检索 / 工具调用 / 上下文拼装 / 重试 / fallback 全链路 span、Langfuse / OpenTelemetry / 自建审计表、Java 后端落地结构  |
| `llm-security.md`     | LLM 应用安全实战：Prompt 注入、工具越权与数据泄露防护  | 从传统"输入不可信"切入 AI 新攻击面、Prompt Injection / Indirect Injection、工具权限边界、MCP Server 风险、沙箱与最小权限、OWASP LLM Top 10 |

## P1 · Agent 工程短板补全（agent）

| 文件名                | 标题                                                      | 核心切入                                                    |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| `tool-calling.md`     | Agent 工具调用详解：Function Calling、MCP Tool 与权限控制 | 可与 mcp.md、structured-output-function-calling.md 互相引用 |
| `agent-evaluation.md` | Agent 评测与调试：如何判断 Agent 真的完成了任务           | 工具调用成功率、幻觉率、格式遵循率、延迟成本                |
| `multi-agent.md`      | 多 Agent 协作：Sub-Agent、任务拆分与上下文隔离            | 面试高频：Agent 为什么不稳定、如何拆分任务、上下文怎么隔离  |

## P1 · RAG 深水区扩展（rag）

| 文件名                  | 标题                                                         | 核心切入                                                         |
| ----------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `embedding-reranker.md` | Embedding 与 Reranker 模型选型：RAG 效果差未必是向量库的问题 | 不同 Embedding 模型能力对比、Reranker 原理、选型场景             |
| `rag-multimodal.md`     | 多模态 RAG：PDF 表格、图片、截图与视频的知识库处理           | 企业知识库最难处理的是 PDF 表格和截图、OCR、图表理解、多模态检索 |
| `finetune-vs-rag.md`    | 微调、蒸馏与 RAG 怎么选：什么时候该做数据训练？              | SFT / LoRA / DPO / RFT 原理对比，什么时候调 Prompt 已经不够了    |

## P2 · 框架专题（framework）

| 文件名                     | 标题                                                                   | 写作顺序                                   |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `spring-ai.md`             | Spring AI 入门与实战：Java 后端如何接入大模型                          | 先写，贴合 JavaGuide 读者群体              |
| `langchain4j.md`           | LangChain4j 实战：Java 应用如何构建 RAG 和 Agent                       | 第二篇                                     |
| `ai-workflow-framework.md` | LangGraph / Spring AI Alibaba Graph：AI Workflow、Graph、Loop 如何落地 | 第三篇，与 workflow-graph-loop.md 互相引用 |

## P2 · MCP 进阶与合规（agent / system-design）

| 文件名             | 标题                                                            | 核心切入                            |
| ------------------ | --------------------------------------------------------------- | ----------------------------------- |
| `mcp-advanced.md`  | MCP 生产安全与高级能力：Roots、Sampling、Elicitation 与权限边界 | MCP Server 不是工具集合而是新攻击面 |
| `ai-compliance.md` | AI 合规与隐私治理：AI 应用上线前安全、审计、隐私要查什么        | 企业落地越来越常见，面试频率会上升  |

---

建议下一步实际动手顺序：

1. `llm-evaluation.md` — 能把整个专栏拉到更工程化的层次，RAG / Agent / 工具调用评测的总纲
2. `llm-security.md` — JavaGuide 读者对安全话题接受度高，从传统 Web 安全切入非常顺滑
3. `ai-observability.md` — 能和 harness-engineering.md、rag-optimization.md 自然接上，形成"调 → 测 → 观测"闭环
4. `llm-gateway.md` — 面试高频，和 ai-application-architecture.md 配合形成系统设计系列

framework 那三篇建议 P0 全部写完后再启动，届时 llm-basis 和 system-design 已经构成底座，框架文章直接引用即可，不会显得孤立。

另外，README.md 里目前漏掉了 `workflow-graph-loop.md`、`ai-voice.md`、`ai-application-architecture.md` 的入口，需要在下次整理版本前补进文章列表。
