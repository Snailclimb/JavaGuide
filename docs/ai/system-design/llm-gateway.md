---
title: 大模型网关详解：多模型路由、fallback、限流与成本控制
description: 深入拆解 LLM Gateway 的概念、模型路由、fallback、限流配额、成本统计、观测审计、缓存策略、Java 后端落地方案和主流方案选型。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: LLM Gateway,大模型网关,LLM Router,模型路由,多模型路由,fallback,限流,Token 预算,AI Gateway,LiteLLM,Cloudflare AI Gateway,Kong AI Gateway
---

面试官看了一眼我的 AI 项目架构图，突然停住了。

“你这个 Agent，每次都是调用的 Claude Opus 4.7？”

我点点头：“对啊，肯定得用地表最强的啊，效果好。”

他沉默了两秒，然后开口：“那意图分类、标题生成、JSON 修复、简单摘要，也全走 Opus？”

我开始有点心虚：“主要是为了稳定……”

面试官把笔放下：“先回去等通知吧。”

很多朋友第一次做 AI 应用都会踩这个坑：以为模型越强，系统越稳。实际上，生产环境里真正难的不是“选一个最强模型”，而是**根据任务类型、成本、延迟、风险，把不同请求送到合适的模型上**。

这就是 LLM Gateway 要解决的问题。

本文接近 1w 字，建议收藏，通过本文你将搞懂：

1. **LLM Gateway 到底是什么**：它和传统 API 网关、LLM Router、RAG、Agent、MCP 分别是什么关系。
2. **为什么不能所有请求都用最强模型**：如何按任务类型、成本、延迟、风险做多模型路由。
3. **生产级 LLM Gateway 需要哪些能力**：统一接入、fallback、限流、Token 预算、成本归因、观测审计和缓存。
4. **如果让你设计一个 LLM Gateway，应该怎么拆**：组件拆分、请求生命周期、路由演进路线和路由错误兜底。
5. **主流方案怎么选**：自研、LiteLLM、Cloudflare AI Gateway、Kong AI Gateway、Inworld Router、LLMRouter 各自适合什么团队。

## 大模型网关基础

### LLM Gateway 到底是什么？

LLM Gateway 可以简单理解成 ：**API 网关 + 智能调度中心**。

传统 API 网关是位于客户端与后端服务之间的**统一入口**，所有客户端请求先经过网关，再由网关路由到具体的目标服务，主要管 HTTP 流量：鉴权、限流、转发、日志、熔断。

![传统 API 网关示意图](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

LLM Gateway 则面对的是大模型调用，它除了处理普通 API 问题，还要处理模型特有的问题：模型选择、Token 预算、上下文长度、供应商差异、流式输出、工具调用、结构化响应、成本统计、Prompt 版本和输出质量。

更准确地说，LLM Gateway 是应用层和模型供应商之间的一层控制面。

![LLM 网关示意图](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-gateway-overview.png)

业务代码不直接关心 OpenAI、Anthropic、Gemini、Qwen、DeepSeek、私有化模型分别怎么调，而是统一向 Gateway 发一个标准请求。Gateway 根据场景、预算、延迟、模型可用性和业务策略，决定调用哪个模型、走哪个供应商、是否需要重试、是否需要降级、怎么记录日志。

一个很小的 Gateway 可能只有统一封装和日志；一个生产级 Gateway 往往还会管理模型路由、Token 预算、限流、成本归因、缓存、审计和安全策略。

所以，LLM Gateway 不是“把请求转发一下”。

它是 AI 应用的模型调用控制面。

### 为什么需要 LLM Gateway？

很多团队第一次做 AI 应用时，会直接在业务服务里写模型调用：

```text
Controller -> Service -> OpenAI SDK -> 返回答案
```

这条链路很短，开发体验也好。但只要线上规模稍微起来，问题会集中暴露。

| 直连模型的典型问题 | 线上表现                                            | Gateway 对应能力                 |
| ------------------ | --------------------------------------------------- | -------------------------------- |
| 模型名写死         | 模型升级、下线、切换供应商时到处改代码              | 模型注册表 + 配置化路由          |
| API Key 分散       | 多个服务各自保存密钥，轮换困难                      | 统一密钥管理                     |
| 供应商限流         | 429 后业务服务疯狂重试，越重试越糟                  | 限流、排队、fallback、熔断       |
| 成本不可见         | 月底只知道总账单，不知道哪个租户、功能、Prompt 花钱 | usage 记录 + 成本归因            |
| 所有请求走同一模型 | 简单任务浪费钱，复杂任务效果差                      | 按任务类型做模型路由             |
| 日志缺失           | 用户投诉“刚才 AI 胡说”，排查时找不到模型输入输出    | Trace、Prompt 版本、模型调用日志 |
| 供应商 SDK 分散    | 每个业务都处理流式、错误码、重试和结构化解析        | Provider Adapter 统一封装        |

这里最容易被低估的是成本和排查。

传统 API 调用失败，通常能从状态码、请求参数、数据库状态里定位。LLM 调用失败就麻烦得多：可能是 Prompt 版本变了，可能是模型升级了，可能是检索上下文噪声太多，可能是输出被截断，可能是路由去了一个便宜但能力不够的模型。

没有 Gateway，所有这些线索都散在业务系统里。

散了就很难管。

### LLM Gateway 和 LLM Router 有什么区别？

LLM Router 更关注“这个请求应该选哪个模型”。LLM Gateway 管的是整条模型调用链路。

| 维度     | LLM Router                           | LLM Gateway                                          |
| -------- | ------------------------------------ | ---------------------------------------------------- |
| 主要职责 | 模型选择                             | 统一接入、路由、限流、fallback、观测、成本治理       |
| 决策粒度 | 单次请求选模型                       | 请求全生命周期治理                                   |
| 典型输入 | 用户问题、任务类型、预算、上下文长度 | 请求、用户、租户、场景、Prompt、模型、供应商、策略   |
| 典型输出 | 目标模型或模型集合                   | 完整调用结果、usage、日志、错误、成本、fallback 轨迹 |
| 适合阶段 | 多模型调用开始变复杂                 | AI 应用进入生产                                      |

可以这么理解：**Router 负责选模型，Gateway 负责把整次模型调用管起来**。

你可以只有 Router，没有完整 Gateway。例如写一个函数，根据任务类型返回 `gpt-5.4-mini` 或 `deepseek-v4-pro`。这能解决一部分成本问题，但解决不了密钥管理、限流、日志、审计、统一错误处理和供应商切换。

反过来，一个早期 Gateway 也可以先没有复杂 Router。第一版只做统一接入、日志和 fallback，就已经能减少很多生产事故。

### LLM Gateway 会不会增加延迟？

会。

任何中间层都会增加一点处理时间。问题是这点时间值不值。

如果 Gateway 只是在同机房里做一次内存路由、Token 估算和日志写入，额外延迟通常不是主要矛盾。更耗时的往往是模型排队、长上下文推理、跨区域网络、输出 Token 过多、工具调用和重试。

Gateway 反而能帮你把整体延迟收敛下来：

- 对简单任务路由到低延迟模型。
- 对重复请求走缓存。
- 对实时语音、在线客服这类场景选择 TTFT 更稳的模型。
- 对供应商异常做快速 fallback，而不是让用户卡到超时。
- 对超长上下文提前压缩，避免模型侧慢慢算。

但这里有个边界：不要把第一版 Gateway 写成“每次请求都调用一个强模型做路由判断”。那就尴尬了，本来想省钱，结果路由本身先烧一笔。

第一版从规则和轻量分类开始，通常更划算。

### 什么时候不需要 LLM Gateway？

不是所有项目一开始都需要 Gateway。

如果你只是做内部工具、单模型、低流量、没有多租户、没有严格成本压力，也不需要复杂审计，那就先别过度设计。一个封装良好的 `LLMClient`，加上基础日志、超时、重试和错误处理，已经够用。

判断方式也不复杂：

- 只有一个应用、一个模型、每天几十次调用：先不用 Gateway。
- 有多个业务都在调用模型：开始收口。
- 有多租户、配额、成本归因：需要 Gateway。
- 有多供应商、fallback、模型路由：需要 Gateway。
- 有合规、审计、Prompt 版本、线上质量回放：必须 Gateway 化。

工程里不怕第一版简单，怕的是简单到没有边界。你可以先不做完整 Gateway，但最好从第一天就把模型调用收在一个地方。

## 为什么不能所有请求都用最强模型？

### 最贵的模型不一定是最适合的模型

不差钱的团队默认会选最贵最强的模型，觉得多花点钱没问题，只要效果好就行。

这其实不太划算。对高价值、强推理、高风险任务，强模型确实值得。但如果所有请求都走强模型，很快会遇到三个问题：

1. **成本不可控**：分类、改写、摘要这类任务也走旗舰模型，单次看不贵，流量上来后很吓人。
2. **延迟不稳定**：强推理模型为了复杂任务设计，不一定适合实时对话、语音交互、轻量判断。
3. **资源被浪费**：简单任务没有给强模型发挥空间，复杂任务反而可能因为上下文组织差而答不好。

以 DeepSeek V4 为例： `deepseek-v4-flash` 和 `deepseek-v4-pro`，其中 `flash` 更适合低成本、快响应场景，`pro` 更适合复杂推理和高质量输出，二者的价格差别也比较大。

Gateway 在这里省掉的不只是钱，还有后续换模型、控延迟、查问题时的混乱：**它要根据质量、成本、延迟动态取舍，而不是固定选一个最强模型**。

### 什么任务适合小模型？什么任务必须上强模型？

实际落地时，可以先把任务分成三层：

**第一层：能不用大模型就不用。**

比如固定规则过滤、关键词判断、权限校验、简单模板填充，这些交给代码更稳定。别让模型去判断“用户是不是空字符串”“文件后缀是不是 PDF”。

**第二层：能用小模型就先用小模型。**

典型场景是意图分类、轻量摘要、标题生成、简单改写、低风险信息抽取。这类任务更需要结构化输出、枚举约束和失败兜底，不一定需要旗舰模型。

**第三层：复杂任务再升级。**

多文档归纳、代码架构设计、复杂 Agent 规划、强事实核验、金融法务医疗相关内容，错误成本高，强模型更合理。

### LLM Router 的底层决策逻辑

LLM Router 的任务，是给每个请求选一个合适模型。这里的“合适”要同时看质量、成本、延迟、上下文窗口和风险策略。

`ulab-uiuc/LLMRouter` 这个开源项目把路由策略做得很丰富，包括 KNN、SVM、MLP、Matrix Factorization、Elo Rating、Graph Router、多轮 Router、个性化 Router、Agentic Router 等。业务系统没必要把这些算法全上，但它提醒了一件事：**模型路由可以从简单规则，慢慢演进成可训练、可评估、可迭代的系统**。

常见路由策略有这几类：

| 路由策略     | 怎么做                                | 适合场景                         | 风险                   |
| ------------ | ------------------------------------- | -------------------------------- | ---------------------- |
| 固定规则路由 | 按业务场景、接口、租户套餐选择模型    | 第一版 Gateway，大多数业务足够用 | 规则维护靠人，容易滞后 |
| 成本优先路由 | 默认走便宜模型，失败或低置信度再升级  | 分类、摘要、客服 FAQ             | 低成本模型误判会传导   |
| 语义路由     | 根据 Query 语义匹配任务或模型 profile | 问题类型稳定、任务分布清晰       | 需要样本和阈值调优     |
| 分类器路由   | 用轻量分类器判断复杂度或风险等级      | 流量较大，路由收益明显           | 分类器漂移需要监控     |
| 学习型路由   | 基于历史质量、成本、延迟训练路由器    | 大流量、多模型、多任务           | 需要评测数据和反馈闭环 |
| 个性化路由   | 结合用户偏好、历史交互选择模型        | C 端助手、教育、陪伴、内容平台   | 隐私和一致性成本更高   |
| Agentic 路由 | 路由器在多轮任务中动态选择模型或工具  | 复杂 Agent、多步骤任务           | 成本和调试复杂度高     |

第一版别急着上复杂 Router。

很多团队现在还没走到 GNN 路由那一步，先卡在更基础的地方：请求没有场景标签，输出没有质量反馈，成本没有按场景记录，失败样本也没人沉淀。模型升级之后，新旧模型在同一批问题上的差异，也经常没有数据。

这些账没记清楚之前，学习型 Router 只会把问题提前放大。

## LLM Gateway 需要具备哪些能力？

### 多模型统一接入：先把模型调用收口

业务代码里最不该到处散落的，就是供应商 SDK 调用。

今天一个服务调 OpenAI，明天另一个服务调 DeepSeek，后天一个定时任务又接了 Gemini。短期看都能跑，时间一长就会变成一堆重复逻辑：API Key、超时、重试、流式解析、错误码、usage、日志格式、模型名映射，每个地方都处理一遍。

更稳的做法，是先定义统一请求和响应。

```java
public record LLMRequest(
        String requestId,
        String tenantId,
        String userId,
        String scene,
        List<ChatMessage> messages,
        Map<String, Object> responseSchema,
        LLMOptions options
) {
}

public record LLMResponse(
        String requestId,
        String model,
        String provider,
        String content,
        TokenUsage usage,
        String finishReason,
        boolean fallbackUsed
) {
}

public interface ModelProvider {

    String providerName();

    LLMResponse chat(LLMRequest request, ModelRoute route);

    boolean supports(String model);
}

public interface LLMGateway {

    LLMResponse chat(LLMRequest request);
}
```

这几个接口看起来普通，但能先解决几个实际问题：

- 业务侧只依赖 `LLMGateway`，不依赖某个供应商 SDK。
- 模型名、供应商、fallback 策略都能配置化。
- usage、成本、错误、延迟可以统一记录。
- 后续接入新模型，只需要增加 Provider Adapter。

第一版不用追求“大而全”。先把模型调用收口，后面再补路由、限流和审计。

### 模型路由：按场景、成本、延迟和风险选模型

模型路由很容易看到收益，尤其是有明显任务分层的系统。

第一版可以配置化，不需要训练模型。

```yaml
routes:
  - scene: intent_classification
    primary: deepseek-v4-flash
    fallback:
      - gpt-5.4-nano
      - gpt-5.4-mini
    max_output_tokens: 256
    risk_level: low

  - scene: complex_reasoning
    primary: gpt-5.5
    fallback:
      - deepseek-v4-pro
      - gpt-5.4
    max_output_tokens: 4096
    risk_level: medium

  - scene: legal_review
    primary: gpt-5.5
    fallback:
      - gpt-5.4-pro
    require_human_review: true
    risk_level: high

default:
  primary: gpt-5.4-mini
  fallback:
    - deepseek-v4-flash
```

路由决策时，Gateway 至少要看这些因素：

| 因素         | 作用                                 |
| ------------ | ------------------------------------ |
| `scene`      | 业务场景，决定默认模型和风险等级     |
| 输入 Token   | 判断是否超过模型上下文窗口或预算     |
| 输出长度     | 控制成本和延迟                       |
| 用户套餐     | 免费用户和企业用户可以走不同模型     |
| 风险等级     | 高风险任务强制走合规模型或人工审核   |
| 当前模型状态 | 供应商异常、429、P95 延迟升高时切走  |
| 历史质量     | 某模型在某类任务上持续失败时降低权重 |

一个简单路由器可以先这样写：

```java
public class RuleBasedModelRouter {

    private final RouteConfigRepository routeConfigRepository;
    private final ModelHealthService modelHealthService;

    public ModelRoute route(LLMRequest request, TokenBudget budget) {
        RoutePolicy policy = routeConfigRepository.findByScene(request.scene())
                .orElseGet(routeConfigRepository::defaultPolicy);

        for (String model : policy.candidates()) {
            if (!budget.fits(model)) {
                continue;
            }
            if (!modelHealthService.isAvailable(model)) {
                continue;
            }
            return ModelRoute.of(model, policy.providerOf(model), policy);
        }

        throw new NoAvailableModelException(request.scene());
    }
}
```

这段代码不复杂，重点在职责边界：路由器只负责选模型，不负责调模型；健康检查只提供状态，不掺业务逻辑；预算判断单独放出来，后续替换估算方式也方便。

### fallback：主模型失败时怎么优雅降级？

fallback 不是“失败就换一个模型再试”这么简单。

首先要区分错误类型。

| 错误类型       | 是否适合 fallback | 处理方式                                 |
| -------------- | ----------------- | ---------------------------------------- |
| 网络瞬断       | 适合              | 短重试后切备用模型                       |
| 供应商 5xx     | 适合              | 重试 + 熔断 + 切供应商                   |
| 429 限流       | 适合但要谨慎      | 读 `Retry-After`，必要时排队或切模型     |
| 上下文超限     | 不适合直接重试    | 压缩上下文、减少检索片段或换长上下文模型 |
| 参数错误       | 不适合            | 修请求，不要重复打供应商                 |
| 安全拒答       | 通常不适合        | 进入业务拒答或人工流程                   |
| 结构化解析失败 | 可有限修复        | 让模型修 JSON 或降级 Schema              |

一个 fallback 链可以写成这样：

```text
优先模型可用 -> 正常调用
优先模型 429 -> 读取限流信息 -> 切备用同级模型
备用模型也不可用 -> 切轻量模型并缩短输出
仍不可用 -> 排队、返回降级提示或转人工
```

这里有两个血泪教训。

第一，fallback 必须和幂等绑定。用户点一次“生成报告”，主模型其实已经生成完了，但你的网关超时了，于是又切备用模型生成一次，最后落库两份报告，成本也扣两遍。

第二，fallback 不能偷偷改变业务语义。法务审核任务从强模型降到便宜模型，如果不标记、不审核，很容易把风险藏起来。高风险场景里，宁愿返回“当前系统繁忙，稍后重试”，也不要硬给一个低质量答案。

### 限流与配额：为什么 LLM 不能只按 QPS 限流？

传统 API 常按 QPS 限流。LLM 不行。

两个请求都是 1 次调用，但成本可能差几十倍：

- 请求 A：输入 500 Token，输出 100 Token。
- 请求 B：输入 80K Token，输出 8K Token。

如果只看请求数，B 和 A 一样。但对供应商配额、账单和延迟来说，它们完全不是一个量级。

LLM Gateway 通常要看这几层限流。

| 限流维度 | 控制对象                         | 解决问题             |
| -------- | -------------------------------- | -------------------- |
| 用户级   | 单用户请求                       | 防滥用、防脚本刷接口 |
| 租户级   | 团队预算                         | 控成本、做套餐隔离   |
| 模型级   | 某个模型                         | 防热门模型被打满     |
| 供应商级 | OpenAI / Anthropic / DeepSeek 等 | 防外部依赖拖垮系统   |
| Token 级 | 输入输出 Token                   | 控真实成本和配额压力 |

更稳的做法是：请求发给供应商之前，先扣预算。

```java
public record TokenBudget(
        int estimatedInputTokens,
        int reservedOutputTokens,
        int totalReservedTokens
) {
}

public interface LLMRateLimiter {

    void acquire(String tenantId, String userId, String model, TokenBudget budget);
}
```

进入 Gateway 后，先估算 `input_tokens + reserved_output_tokens`。用户桶、租户桶、模型桶、供应商桶都扣得动，再发请求。扣不动就排队、降级或拒绝，不要先把请求打出去再祈祷供应商别限流。

Token 估算不可能完全准，但粗估也比不估强。尤其是 RAG、长上下文、Agent 工具调用这类场景，不做预算很容易失控。

### 成本统计：没有成本归因，就没有成本优化

很多团队说要“降低大模型成本”，但连钱花在哪都不知道。

这不是优化，这是猜。

LLM Gateway 要记录每次调用的成本归因字段。

| 字段             | 说明                                        |
| ---------------- | ------------------------------------------- |
| `request_id`     | 一次业务请求的唯一 ID                       |
| `attempt_id`     | 一次模型调用尝试，fallback 或重试会产生多个 |
| `tenant_id`      | 租户或团队                                  |
| `user_id`        | 用户                                        |
| `scene`          | 业务场景，比如客服、摘要、代码生成          |
| `prompt_version` | Prompt 版本                                 |
| `provider`       | 供应商                                      |
| `model`          | 实际调用模型                                |
| `input_tokens`   | 输入 Token                                  |
| `output_tokens`  | 输出 Token                                  |
| `cached_tokens`  | 命中 Prompt cache 或供应商缓存的 Token      |
| `cost`           | 按当前价格计算的成本                        |
| `latency_ms`     | 总延迟                                      |
| `ttft_ms`        | 首 Token 延迟                               |
| `fallback_used`  | 是否发生 fallback                           |
| `error_code`     | 错误类型                                    |

有了这些字段，排查和控成本才有抓手：

- 哪个租户成本最高？
- 哪个功能最烧 Token？
- 哪个 Prompt 版本导致输出变长？
- 哪个模型在某个场景下性价比最好？
- fallback 发生在什么时间段、什么供应商、什么模型？
- 模型升级后，成本和质量有没有变化？

成本优化不会在调完一次参数后结束，后面还要持续看数据、改路由、回放失败样本。

### 观测与审计：Gateway 是 AI 系统的黑匣子记录仪

传统系统出问题，看日志、Trace、指标。AI 系统也一样，只是要多记录一些模型相关字段。

Cloudflare AI Gateway、LiteLLM、Kong AI Gateway 这类产品都把日志、Token、成本、错误、延迟、缓存、限流放在很显眼的位置。原因很简单：AI 应用出问题时，如果只记录最终答案，基本没法复盘。

一次模型调用的 Trace 至少应该长这样：

```json
{
  "request_id": "req_202605210001",
  "attempt_id": "att_01",
  "tenant_id": "team_java",
  "user_id": "u_1024",
  "scene": "knowledge_qa",
  "prompt_version": "rag_qa_v7",
  "provider": "openai",
  "model": "gpt-5.4-mini",
  "route_reason": "scene=knowledge_qa,cost_priority=true",
  "input_tokens": 4210,
  "output_tokens": 612,
  "cost": 0.0059,
  "ttft_ms": 680,
  "latency_ms": 4120,
  "fallback_used": false,
  "finish_reason": "stop"
}
```

但审计有一个边界：不要无脑长期保存完整 Prompt 和完整回答。

Prompt 里可能有用户隐私、企业文档、内部代码、合同条款。生产系统需要支持脱敏、采样、留存周期、按租户配置是否保存 payload。Cloudflare AI Gateway 文档里也有类似思路，例如通过配置控制是否采集请求和响应正文。企业内部自研时，也应该把“是否保存原文”做成策略，而不是默认全量落库。

### 缓存与语义缓存：省钱，但别乱用

缓存是降本利器，但在 LLM 场景里很容易用错。

| 缓存类型     | 做法                             | 适合场景                       | 风险                         |
| ------------ | -------------------------------- | ------------------------------ | ---------------------------- |
| 精确缓存     | 请求完全一致时返回旧结果         | FAQ、固定说明、重复测试        | 个性化和权限场景容易错       |
| Prompt 缓存  | 利用供应商对重复前缀的缓存计费   | 长系统提示、稳定工具 Schema    | 依赖供应商支持和 Prompt 结构 |
| 语义缓存     | 语义相似的问题复用旧答案         | 客服 FAQ、产品说明、低风险问答 | 相似不等于相同，容易答偏     |
| 结果片段缓存 | 缓存中间摘要、检索结果、工具结果 | 长文档摘要、批处理             | 缓存失效和版本管理复杂       |

客服 FAQ 这类问题很适合缓存：“怎么修改密码”“发票在哪里下载”“会员怎么退款”。这些答案稳定，个性化少，缓存收益明显。

但下面这些不适合随便缓存：

- 带用户权限的问题。
- 查询实时状态的问题。
- 金融、医疗、法务建议。
- 包含私密上下文的多轮对话。
- 依赖当前时间、订单状态、库存状态的问题。

语义缓存尤其要谨慎。“我的订单为什么没发货”和“我的订单能不能退款”可能语义接近，但业务动作完全不同。缓存命中率很好看，不代表用户体验好。

## 如何让你设计一个 LLM Gateway，你会怎么做？

### 一个生产级 LLM Gateway 长什么样？

设计 LLM Gateway 时，可以先拆成这些组件：

| 组件                   | 职责                                                     |
| ---------------------- | -------------------------------------------------------- |
| API Adapter            | 对外暴露统一 API，兼容 OpenAI 风格请求或内部标准请求     |
| Auth / Tenant          | 鉴权、租户识别、套餐和权限校验                           |
| Prompt Renderer        | 渲染 Prompt 模板，记录 Prompt 版本                       |
| Token Budget Estimator | 估算输入输出 Token，判断是否超预算                       |
| Model Registry         | 维护模型能力、价格、上下文、供应商、状态                 |
| Router                 | 根据场景、预算、延迟、风险选择模型                       |
| Provider Adapter       | 适配 OpenAI、DeepSeek、Anthropic、Gemini、私有模型等接口 |
| Retry / Fallback       | 按错误类型做重试、降级和熔断                             |
| Rate Limiter           | 用户、租户、模型、供应商、Token 多维限流                 |
| Cost Tracker           | 记录 usage，计算成本，按租户和场景归因                   |
| Observability          | 输出指标、日志、Trace、告警                              |
| Audit Log              | 审计关键请求，支持脱敏、留存和回放                       |

第一版不用全部做满。Guide 更推荐按优先级落地：

1. 统一 API 和 Provider Adapter。
2. usage、成本、错误和延迟日志。
3. 规则路由和 fallback。
4. Token 预算和租户配额。
5. 可观测、审计和质量回放。
6. 轻量分类器或学习型 Router。

这样每一步都有收益，也不至于一上来就把自己拖进平台工程。

### 请求进来后，Gateway 内部怎么跑？

一次请求在 Gateway 里通常会经历这些阶段：

1. **鉴权与租户识别**：确认用户是谁、属于哪个租户、能不能使用当前 AI 功能。
2. **判断任务场景**：从接口、业务参数或轻量分类器里得到 `scene`。
3. **渲染 Prompt**：根据场景选择 Prompt 模板，注入用户输入、上下文和工具 Schema。
4. **估算 Token 预算**：计算输入 Token，预留最大输出 Token。
5. **选择模型和供应商**：根据路由策略、模型状态、预算和风险等级选 primary model。
6. **执行限流和预算扣减**：用户、租户、模型、供应商、Token 桶都通过后继续。
7. **调用模型**：通过 Provider Adapter 发起同步或流式请求。
8. **解析响应**：处理文本、结构化 JSON、tool call、usage 和 finish reason。
9. **失败 fallback**：按错误类型判断是否重试、切模型、排队或降级。
10. **记录 usage 和 trace**：写入成本、延迟、模型、供应商、Prompt 版本和错误信息。
11. **返回业务结果**：把统一响应交给业务服务。

代码结构可以很朴素：

```java
public class DefaultLLMGateway implements LLMGateway {

    private final PromptRenderer promptRenderer;
    private final TokenEstimator tokenEstimator;
    private final RuleBasedModelRouter modelRouter;
    private final LLMRateLimiter rateLimiter;
    private final ProviderClientFactory providerClientFactory;
    private final LLMCallLogger callLogger;

    @Override
    public LLMResponse chat(LLMRequest request) {
        RenderedPrompt prompt = promptRenderer.render(request);
        TokenBudget budget = tokenEstimator.estimate(prompt, request.options());
        ModelRoute route = modelRouter.route(request, budget);

        rateLimiter.acquire(request.tenantId(), request.userId(), route.model(), budget);

        List<ModelRoute> attempts = route.withFallbacks();
        RuntimeException lastError = null;

        for (ModelRoute attempt : attempts) {
            long start = System.currentTimeMillis();
            try {
                ProviderClient client = providerClientFactory.get(attempt.provider());
                LLMResponse response = client.chat(request, prompt, attempt);
                callLogger.success(request, attempt, response, start);
                return response;
            } catch (RuntimeException ex) {
                callLogger.failure(request, attempt, ex, start);
                if (!FallbackDecider.canFallback(ex)) {
                    throw ex;
                }
                lastError = ex;
            }
        }

        throw new LLMGatewayException("No available model after fallback", lastError);
    }
}
```

这里故意没有写得特别复杂。生产里还要补流式、异步、幂等、熔断、队列、审计脱敏，但骨架就是这样：**渲染 Prompt、估算预算、路由、限流、调用、记录、fallback**。

### 路由策略怎么从简单演进到智能？

路由策略不要一步到位。大多数团队可以按 5 个阶段演进。

| 阶段   | 做法                | 适合团队                 |
| ------ | ------------------- | ------------------------ |
| 阶段一 | 固定模型 + 手动配置 | Demo 到早期生产          |
| 阶段二 | 规则路由 + fallback | 大多数业务系统           |
| 阶段三 | 轻量分类器路由      | 任务类型稳定，有一定流量 |
| 阶段四 | 质量反馈 + 成本回归 | 有评测集和 trace         |
| 阶段五 | 学习型 Router       | 大流量、多模型、多场景   |

阶段一最简单：客服问答走模型 A，报告生成走模型 B。

阶段二加入规则：免费用户默认小模型，企业用户复杂任务走强模型；主模型 429 切备用模型；高风险任务强制人审。

阶段三开始引入轻量分类器：判断用户问题是事实型、分析型、代码型、闲聊型，或者判断复杂度是 low、medium、high。

阶段四要接入反馈：哪类请求小模型经常失败？哪类请求强模型和小模型质量差不多？哪个 Prompt 版本导致成本上升？

阶段五才考虑学习型 Router：用历史样本、质量评分、成本、延迟训练路由器，动态选择模型。

这里最要紧的是评测数据。没有评测集、没有线上 trace、没有人工或自动评分，所谓智能路由很容易变成“看起来聪明，实际上不可控”。

### 路由错了怎么办？

路由一定会错。

问题不在于能不能避免所有错误，而在于错了之后能不能发现、能不能兜底、能不能复盘。

常见兜底方式有这些：

| 问题                         | 兜底方式                                            |
| ---------------------------- | --------------------------------------------------- |
| 分类器置信度低               | 走默认中强模型，或要求用户澄清                      |
| 小模型输出低质量             | 自动升级强模型重试                                  |
| 高风险任务被路由到低风险链路 | 风险规则优先级高于成本规则                          |
| 新模型上线后效果漂移         | 灰度、A/B、固定评测集回归                           |
| 用户投诉答案错误             | 通过 request_id 回放 Prompt、模型、上下文和路由原因 |
| 某模型 P95 延迟升高          | 健康检查降低权重或临时熔断                          |

路由日志里一定要记录 `route_reason`。不要只记录“用了哪个模型”，还要记录“为什么用它”。

例如：

```json
{
  "scene": "intent_classification",
  "selected_model": "deepseek-v4-flash",
  "route_reason": "scene_rule:low_risk,cost_priority,estimated_tokens=320",
  "confidence": 0.91,
  "fallback_candidates": ["gpt-5.4-nano", "gpt-5.4-mini"]
}
```

没有 `route_reason`，路由系统后期会很难调。

## 主流方案怎么选？

### 自研、LiteLLM、Cloudflare AI Gateway、Kong AI Gateway、Inworld Router 怎么选？

现在 LLM Gateway / Router 方案很多，别只看“支持多少模型”。选型时先看几个问题：团队技术栈是什么，合规要求有多强，流量规模多大，是否要自托管，是否已经有 API 网关，是否需要深度观测。

| 方案                  | 主要优势                                                                    | 适合场景                                       | 不适合场景                              |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| 自研轻量网关          | 可控、贴合业务、能和内部权限和计费深度结合                                  | 有后端能力，需求明确，想逐步演进               | 想快速接入大量供应商                    |
| LiteLLM               | 多供应商、统一格式、成本追踪、Proxy 和 SDK 都成熟                           | 平台团队、快速集成、多模型实验                 | 强合规或需要深度定制的企业              |
| Cloudflare AI Gateway | 日志、缓存、限流、边缘网络、接入成本低                                      | 已经在 Cloudflare 平台上，想快速获得观测和缓存 | 复杂企业治理或强自托管要求              |
| Kong AI Gateway       | 企业 API 治理能力强，插件体系成熟，支持 AI 代理、限流、语义缓存、审计、指标 | 已经有 Kong 基础设施的企业团队                 | 小团队初期，或不想引入完整 API 网关体系 |
| Inworld Router        | 统一入口、fallback、条件路由、动态分层、流量分配、用户粘性实验              | 实时交互、用户分层、A/B 测试                   | 强自托管或深度后端定制                  |
| LLMRouter             | 研究和智能路由算法丰富，支持多类 Router                                     | 研究、实验、验证路由策略                       | 直接作为企业 Gateway 还要补治理能力     |

LiteLLM 的优势是供应商覆盖和接入速度。官方文档强调它能通过 OpenAI 格式调用大量模型，Proxy Server 适合做中心化 Gateway，也支持成本追踪、预算和 retry/fallback。

Cloudflare AI Gateway 更像托管在边缘网络上的 AI 流量入口。官方文档里提到日志、分析、缓存、限流、重试、model fallback 等能力。如果你的系统已经在 Cloudflare 上，接入成本会低很多。

Kong AI Gateway 的定位更企业化。它把 LLM 流量纳入 Kong 的插件体系，提供 provider-agnostic API、路由、负载均衡、限流、语义缓存、语义路由、审计日志、LLM 指标、成本控制等能力。对已经用 Kong 管 API 的企业，这条路比较自然。

Inworld Router 更强调实时路由和实验能力。它支持条件路由、动态 tier、按比例分流、用户粘性分配，并把结果推到分析平台。适合实时交互和需要频繁实验的场景。

LLMRouter 更偏研究和算法工具箱。它提供多种 Router，如 KNN、SVM、MLP、Elo、Graph、个性化、多轮和 Agentic Router。它能帮你理解和验证路由策略，但如果要做生产 Gateway，还要补限流、审计、成本、权限、合规和运维能力。

### 选型建议

如果业务刚起步，先做轻量自研 Gateway。不要一上来买很重的平台，先把模型调用收口，至少做到日志、usage、Token 预算和 fallback。

如果你要快速接入很多模型和供应商，优先看 LiteLLM 这类成熟统一接口。它能让团队很快从“到处写 SDK”切到“统一入口”。

如果企业已经在用 Kong，可以考虑 Kong AI Gateway。它的优势不在于“更 AI”，而是能把 AI 流量放进已有 API 治理体系里。

如果已经重度使用 Cloudflare，可以用 Cloudflare AI Gateway 先把观测、缓存、限流和统一入口补上。

如果要做智能路由，先准备评测集和线上 trace，再谈 LLMRouter 这类学习型策略。没有数据，路由算法越复杂，越难解释。

这里的顺序不要反：**先解决工程治理，再追求智能路由**。

## 怎么衡量 LLM Gateway 做得好不好？

LLM Gateway 做得好不好，不能只看“接了多少模型”。模型接得多，只能说明适配层写得多，不能说明线上链路稳定。

更有用的是看下面这些数据：

| 指标             | 含义                                     |
| ---------------- | ---------------------------------------- |
| 路由命中率       | 请求是否进入预期模型或预期模型层级       |
| 质量通过率       | 输出是否通过评测、人工抽样或业务校验     |
| fallback 率      | 主链路是否稳定，备用链路是否频繁触发     |
| 平均成本         | 单次请求或单业务场景成本                 |
| P95 延迟         | 用户体验，尤其是在线交互和语音场景       |
| TTFT             | 首 Token 延迟，影响流式体验              |
| 429 率           | 供应商限流压力                           |
| 缓存命中率       | 缓存节省的请求和 Token                   |
| 结构化解析失败率 | Schema、Prompt、模型适配是否稳定         |
| 路由漂移         | 模型升级或流量变化后，原路由策略是否失效 |

这里面最容易被忽略的是“路由漂移”。

模型能力不是静态的。一个便宜模型今天不适合复杂摘要，三个月后升级了，可能已经够用。反过来，一个原本稳定的模型升级后，也可能在某类格式化任务上变差。

所以路由规则不能写完就不管。它要像 Prompt 一样有版本，像代码一样做回归测试。

## 总结

面试里问到大模型网关，不要只回答“统一转发模型请求”。这个说法太浅了。

更完整的回答应该是：LLM Gateway 负责把模型调用收口，统一处理模型接入、路由、fallback、限流、Token 预算、成本归因、日志审计和质量回放。LLM Router 只是其中负责“选哪个模型”的一部分。

第一版不用做得很重。先把模型调用从业务代码里抽出来，记录清楚每次请求用了哪个模型、花了多少 Token、有没有 fallback、失败原因是什么。等这些数据有了，再去做更细的规则路由、成本优化和学习型 Router。

反过来，如果一开始就追求智能路由，但没有评测集、没有 trace、没有失败样本，系统只会多一个难解释的黑盒。模型调用这层越早收口，后面换模型、查成本、处理限流和复盘事故时越省事。
