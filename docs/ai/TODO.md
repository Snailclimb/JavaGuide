---
sitemap: false
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

# AI 内容规划 TODO

最近整理：2026-11-06

配套素材索引为本地 `MATERIALS.md`，该文件被 Git 忽略，不属于普通提交内容。写新文章前先查素材索引和现有正文，避免重复检索、重复讲解。

## 已完成或已补齐

| 内容                                                   | 状态                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `llm-basis/llm-evaluation.md`                          | 已有通用评测体系；本轮补合成问题、参考答案核验与语义去重                    |
| `system-design/llm-gateway.md`                         | 已有模型网关、调用治理与成本管理                                            |
| `system-design/llm-security.md`                        | 安全正文与专题入口已存在，从旧待办移出                                      |
| `system-design/ai-observability.md`                    | 正文已存在；补 AI 总览入口，并按 2.0.2 官方文档修正流式 Span 限制的适用范围 |
| `rag/rag-evaluation.md`                                | 正文与子专题、侧栏、AIGuide 入口已存在，本轮补 AI 总览入口                  |
| `agent/workflow-graph-loop.md`                         | 补售后申请的等待、分支、状态与恢复案例                                      |
| `agent/loop-engineering.md`                            | 补重复修改的证据比较、回退与重新规划                                        |
| `agent/multi-agent.md`                                 | 已有通信、并发、检查点、接管与恢复，本轮复用，不重复扩写                    |
| `agent/skills.md`                                      | 补任务绑定版本、资源一致性、撤销与来源冲突案例                              |
| `agent/context-engineering.md`                         | 补压缩前后材料、失败摘要与静态核验                                          |
| `interview-questions/agent-project-interview-guide.md` | 已有项目表达、稳定性与失败复盘，本轮继续复用                                |
| `system-design/ai-application-architecture.md`         | 补 Java/Python 服务职责、异步任务过程与取消语义                             |
| `system-design/ai-voice.md`                            | 已有语音链路和面试题入口                                                    |
| `framework/README.md`、`framework/spring-ai.md`        | 新增框架专题与售后问答案例，弱化代码，按 Spring AI 2.0.2 文档说明行为       |
| `rag/embedding-reranker.md`                            | 新增候选约束、独立对照、逐题比较与更换依据，不提供虚构实测结论              |
| 面试题与导航                                           | 将本轮问题关联到正文小节；同步 AI 总览、子专题、侧栏和 AIGuide README       |

本轮完成主干内容补强与导航整理，不代表所有历史文章的版本相关事实均已重新核验。教学案例采用静态内容审阅，未运行模型评测或性能实验。

## 后续选题

下列内容保留为选题储备，不因目录存在就立即扩写。先确认相对现有正文的增量，再准备资料。

| 优先级 | 计划文件                             | 写作前需要补足的材料                                                             |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------- |
| P1     | `llm-basis/llm-model-selection.md`   | 基于具体业务的质量、时延和成本比较，不以模型排行榜代替选型                       |
| P2     | `rag/rag-multimodal.md`              | 表格、图片等复杂资料的实际检索失败与处理案例，避免重复文档解析篇                 |
| P2     | `rag/finetune-vs-rag.md`             | 微调、蒸馏与 RAG 的任务差异、数据要求和验证依据                                  |
| P2     | `framework/langchain4j.md`           | 与已写 Spring AI 案例不同的具体取舍和框架能力                                    |
| P2     | `framework/ai-workflow-framework.md` | LangGraph、Spring AI Alibaba Graph 的版本化案例，不重复 Workflow/Graph/Loop 概念 |
| P2     | `agent/mcp-advanced.md`              | 对照当前协议 revision 和扩展状态，确认现有 MCP、安全文章尚未覆盖的内容           |
| P2     | `system-design/ai-compliance.md`     | 明确地区、业务与数据流，再核对官方法规和平台条款，不作泛化法律结论               |

## 维护规则

1. 新增文章后，同步检查 AI 总览、子专题 README、侧栏、面试题、AIGuide README、本地素材索引和本文。
2. 现有章节已经回答的问题，优先补精确链接。工具调用与 Agent 评测继续复用现文，不另建同义专题。
3. 写面向读者的文章时不要链接内部维护文档；内部维护文档保留 `sitemap: false` 和 `noindex, nofollow`。
4. 模型、平台能力、价格、上下文窗口、API 参数等易变信息写入前重新核对官方文档，记录适用版本与核对日期。
5. 完成一项后从待办移入已完成。Git 跟踪文件与被忽略的本地维护文件分别检查，不能只依赖 Git diff。
