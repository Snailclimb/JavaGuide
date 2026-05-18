---
title: RAG 面试题总结
description: 系统整理 RAG 高频面试题，覆盖 RAG 基础、Embedding、向量数据库、Chunk 策略、文档处理、Hybrid Search、Query Rewrite、Rerank、GraphRAG、知识库更新与 RAG 评测等核心考点，并附对应参考文章。
category: AI
tag:
  - RAG面试
  - 向量数据库
  - AI面试
head:
  - - meta
    - name: keywords
      content: RAG面试题,RAG面试,检索增强生成面试题,Embedding面试题,向量数据库面试题,GraphRAG面试题,RAG优化面试题,Chunk面试题,Hybrid Search面试题,Rerank面试题
---

这份 RAG 面试题根据 AI 专栏现有文章整理，重点覆盖基础概念、检索链路、优化手段和生产治理。每组题后面都附了参考文章，详细答案建议回到原文阅读。

## RAG 基础

参考文章：[《万字详解 RAG 基础概念》](../rag/rag-basis.md)

- 什么是 RAG？为什么需要 RAG？
- RAG 和传统搜索引擎有什么区别？
- RAG 和微调怎么选？什么时候用 RAG，什么时候微调，什么时候两者结合？
- RAG 系统中 Embedding 模型怎么选？为什么？
- 余弦相似度、内积和欧氏距离有什么区别？
- RAG 的幻觉问题怎么解决？RAG 一定不会产生幻觉吗？
- 什么是 Lost in the Middle 问题？怎么应对？
- 长上下文窗口是否会取代 RAG？
- RAG 系统的评估指标有哪些？
- RAG 的优势和局限性是什么？
- 什么场景适合用 RAG？什么场景不适合？

## 向量数据库与索引

参考文章：[《万字详解 RAG 向量索引算法和向量数据库》](../rag/rag-vector-store.md)

- 什么是 Embedding？为什么需要把文本转成向量？
- RAG 场景为什么需要向量数据库？
- ANN 算法为什么可以接受不是 100% 精确的结果？
- 有哪些向量索引算法？各自优缺点是什么？
- Flat、HNSW、IVFFLAT、IVF-PQ 分别适合什么场景？
- HNSW 和 IVFFLAT 有什么区别？
- HNSW 的 `ef_search` 参数怎么调？调大和调小分别会怎样？
- 向量数据库和传统数据库最核心的区别是什么？
- 如果向量数据从 100 万增长到 1 亿，架构上需要做什么调整？
- 为什么选择 PostgreSQL + pgvector？什么时候应该换专业向量数据库？

## 文档处理与 Chunk 策略

参考文章：[《RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理》](../rag/rag-document-processing.md)

- RAG 文档处理管线通常包含哪些步骤？
- 文档解析、清洗、结构化分别解决什么问题？
- Chunk 切分为什么不能只按固定长度切？
- Chunk 大小、Overlap、语义边界应该怎么取舍？
- 表格、代码块、图片、多模态内容进入 RAG 前怎么处理？
- 文档处理阶段如何保留标题层级、页码、来源和权限元数据？
- Chunk 质量差会带来哪些召回和生成问题？
- 如何从零搭建一套企业级文档处理管线？

## RAG 检索优化

参考文章：[《万字详解 RAG 优化：从召回、重排到上下文工程的系统调优》](../rag/rag-optimization.md)

- RAG 召回率低应该怎么排查？
- Chunk 策略、Metadata、Hybrid Search、Query Rewrite、Rerank 分别解决什么问题？
- Hybrid Search 是什么？BM25 和向量检索怎么融合？
- Query Rewrite、HyDE、Self-Query 分别适合什么场景？
- Rerank 解决什么问题？为什么不能只依赖向量相似度排序？
- 上下文压缩有什么价值？什么时候会伤害答案质量？
- RAG 优化为什么必须先建立失败样本集？
- 线上 RAG 出现“答非所问”，应该按什么路径定位？

## GraphRAG

参考文章：[《万字详解 GraphRAG：为什么只靠向量检索撑不起复杂知识问答》](../rag/graphrag.md)

- GraphRAG 解决什么问题？和标准向量 RAG 有什么区别？
- 为什么说 Chunk 是信息孤岛？
- 向量相似度为什么不擅长多跳推理？
- GraphRAG 中实体、关系、社区发现分别是什么？
- 全局检索和局部检索有什么区别？
- GraphRAG 的社区摘要有什么价值？它的成本在哪里？
- GraphRAG 如何做权限过滤？
- 什么场景适合 GraphRAG？什么场景不适合？
- 成熟系统为什么通常不是纯 GraphRAG，而是混合路由架构？

## 知识库更新与评测

参考文章：[《RAG 知识库文档如何更新：增量更新、版本控制、去重与全量重建》](../rag/rag-knowledge-update.md)、[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](../llm-basis/llm-evaluation.md)

- RAG 知识库为什么不能只新增不删除？
- 增量更新和全量重建怎么选？
- Embedding 模型升级后，为什么通常需要重建索引？
- Chunk 策略变更会影响哪些历史数据？
- 如何避免同一文档多个版本同时被召回？
- 知识库更新如何做灰度、回滚和审计？
- RAG 评测为什么要分检索质量和生成质量？
- MRR、NDCG、Recall@K、Context Precision、Faithfulness 分别衡量什么？

## 复习建议

RAG 面试不要只停留在“切块、向量化、检索、生成”这条流水线。面试官更关心你能不能定位问题：是文档处理差、Chunk 切错、Embedding 不匹配、召回池太小、排序不准，还是上下文注入和生成环节出了问题。

建议按“基础概念 -> 向量索引 -> 文档处理 -> 检索优化 -> GraphRAG -> 更新与评测”的顺序复习。
