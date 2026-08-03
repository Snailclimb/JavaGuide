---
title: AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现
description: 解析 AI 工作流中 Workflow、Graph、Loop 三个概念，对比传统工作流与 AI 工作流的差异，并用 Spring AI Alibaba Graph 展示状态、条件边和循环的实现方式。
category: AI 应用开发
icon: "mdi:robot-outline"
head:
  - - meta
    - name: keywords
      content: AI Workflow,Graph,Loop,AI工作流,Spring AI Alibaba,LangGraph,状态机,Agent,工作流引擎
---

Camunda、Temporal 等传统引擎同样支持事件、分支、重试和补偿。AI 工作流新增的麻烦在于，部分节点的输出由 LLM 生成，“结果是否达标”也可能需要模型或评分器在运行时判断。流程因此经常出现回边：生成、评估、修改，再回到评估。

Workflow 描述任务怎样完成，Graph 用 Node、Edge 和 State 表达执行结构，Loop 则是 Graph 上的回溯控制。下面沿着文章审核示例说明三者如何配合，并用 Spring AI Alibaba Graph 展示状态更新和条件边。

## 为什么 AI 系统需要工作流？

单轮对话能回答问题，但很难稳定地**交付结果**。线上真实任务很少是“问一句答一句”就完事——检索信息、调用工具、输出结构化结果、校验格式、失败重试、不满意再来一轮，这些步骤串起来才叫交付。靠一段超长 Prompt 把所有逻辑塞进去，早晚会炸。你需要的是一种**可分支、可循环、可观测**的执行路径。

传统业务流程通常会预先定义候选步骤和分支规则，节点仍可能因为人工操作或外部 API 而产生不同结果。加入 LLM 后，生成内容和质量判断又增加了一层不确定性。这会带来三个直接问题：

1. 下一步并不唯一，需要根据当前结果动态决策路径；
2. 当结果不理想时，系统需要自动修正，而不是直接失败；
3. 中间状态必须被记录，否则难以调试、追踪与恢复。

这也是为什么 AI 系统需要工作流思维。

以一个简单例子来看：当我们让 AI 写一篇文章时，一次生成的结果往往不够理想。直觉做法是手动复制结果，再附加新要求继续提问，但这种方式既不高效，也会快速消耗上下文。如果将这一过程结构化为“**审查 → 修改 → 再审查**”的循环，并设定停止条件（如达到质量标准或触达迭代上限），稳定性会明显好很多。

说到底，工作流就是把一次性的生成过程，变成一个**可迭代、可收敛、可控制**的系统化流程。

## 传统工作流和 AI 工作流有什么区别？

![传统 Workflow 与 AI Workflow 对比](https://oss.javaguide.cn/github/javaguide/ai/workflow/traditional-vs-ai-workflow.svg)

上图可以直观看到两类工作流的差异：传统 Workflow 更偏向“固定步骤 + 明确分支”的过程编排；AI Workflow 则更依赖运行时的状态（State）来动态决定下一步，并通过循环（Loop）把“生成—评估—修正”变成可收敛的过程。

### 传统工作流的特点

先说基本定义：**Workflow** 就是为了完成某个目标，把任务拆成若干步骤，并规定这些步骤如何协作推进。它回答的问题是：“这件事怎么做完？”

传统工作流也能编排人工任务、外部 API 和其他非确定性活动，因此“相同输入必然得到相同节点结果”并不是它的前提。更常见的区别是：传统流程会预先定义活动、候选分支和补偿规则，运行时根据事件与业务数据选择路径。BPMN 2.0、Camunda、Temporal、Apache Airflow 都不局限于线性顺序。

AI 工作流与传统工作流的关键差异在于：路径选择依赖于运行时生成内容的质量评估，且同一节点可能因输出不确定性而需要反复执行。例如审批流程、订单流转、ETL 数据管道等传统场景中，分支条件是明确的（金额 > 10000 走高级审批）；而 AI 场景中，“生成结果是否达标”这个判断本身就需要运行时评估，且评估结论可能驱使流程回到之前的步骤反复修正。

### AI 工作流的特点

到了 AI 场景，同样的“流程”一词，含义不太一样了。相比传统工作流强调的顺序性与确定性，AI 工作流需要处理的是一个充满不确定性的执行环境。我们面对的不再只是“按步骤执行”，还包括：

- 结果是否达标要在**运行时**判断。
- 是否需要继续重试，要由**当前状态**决定。
- 某一步失败后，系统不再是简单的报错然后结束，而是考虑是否应该降级、回退或换一种策略。
- 节点之间传递的不只是参数，还包括上下文、草稿、评分、错误信息、历史轮次等**状态**。

所以 AI Workflow 与传统 Workflow 都有流程，差别在于前者更强调动态决策和状态驱动。一旦我们想要表达“下一步不唯一”或者“不满意就再来一轮”，线性列表就不够用，自然会落到 Graph（结构）与 Loop（回溯）这两类概念上。

## Graph 和 Loop 是什么？

### Graph：工作流的结构

沿用贯穿案例：假如我们要搭一条「生成初稿 → 质量审核 → 不达标则修改 → 再回到审核」的路径。这里每一步对应图的 **Node**，步骤之间的走向由 **Edge** 表达，整条链路读写的共享上下文就是 **State**。

图里最基础的元素有三个：

- **Node（节点）**：执行单元，主要功能：读取状态、执行逻辑、更新状态。文章审核例子里的典型节点有「生成初稿」「质量审核」「按反馈修改」，还可以扩展检索、格式校验、人工审批等。
- **Edge（边）**：控制流抽象，决定节点之间的执行路径。常见的边类型：
  - **顺序边**：节点按固定顺序执行，不依赖条件判断
  - **条件边**：根据运行时状态在预定义候选路径中选择，Spring AI Alibaba 通过 `addConditionalEdges()` 实现
  - **动态路由**：候选节点在运行时动态确定，比如 LangGraph 的 `Send` API 可以动态决定并行调用次数
  - **循环边**：节点回到自身或前序节点重复执行，用于重试和迭代
  - **终止边**：流程结束，不再执行后续节点
  - **并行边**：一个节点同时分发到多个后续节点并行执行

> 实际工程中，条件边和动态路由是一个连续谱系——条件边的候选集在设计时确定但选择逻辑可以依赖运行时状态（如 LLM 评分），动态路由的候选集本身在运行时才确定（如 LangGraph 的 `Send` API 动态创建并行分支）。多数场景下条件边已够用，动态路由适用于 map-reduce 等需要运行时决定并行分支数量的场景。

- **State（状态）**：表示在流程执行过程中持续被读写的共享上下文，是节点之间真正传递的“工作记忆”。常见实现是**键值对数据结构**（类似 Java 的 `Map<String, Object>`、Python 的 `dict`、TypeScript 的 `Record<string, any>`），用于在各节点之间传递和修改数据。

需要注意的是，State 的设计不仅涉及“存什么”，还涉及“怎么更新”。在实际的工作流框架中，不同字段通常有不同的更新语义：

- **覆盖（Replace）**：新值直接替换旧值。适用于单值字段，如分类结果、当前状态。在 Spring AI Alibaba 中对应 `ReplaceStrategy`，在 LangGraph 中对应无 reducer 的默认行为。
- **追加（Append）**：新值追加到已有列表。适用于累积型字段，如对话历史（messages）。在 Spring AI Alibaba 中对应 `AppendStrategy`，在 LangGraph 中对应 `Annotated[list, operator.add]`。
- **自定义合并（Custom Reducer）**：通过自定义函数决定合并逻辑，例如 LangGraph 的 `add_messages` 会根据消息 ID 进行追加或更新。

当多个并行节点同时写入同一个使用覆盖语义的字段时，会出现竞态问题（LangGraph 会抛出 `INVALID_CONCURRENT_GRAPH_UPDATE` 错误）。所以设计 State 时需要提前规划哪些字段可能被并行写入，并为它们选择合适的更新策略。

实际项目中常用的状态字段（可根据业务需求调整）：

- `input`：用户输入，全流程保留
- `messages`：对话历史，用追加策略
- `retrieval_result`：RAG 检索结果，中间状态
- `tool_result`：工具调用结果，中间状态
- `llm_response`：LLM 原始输出，中间状态
- `intermediate_steps`：中间执行步骤记录，全流程保留
- `next_step`：控制流跳转节点（Spring AI Alibaba 通过此字段配合条件边实现路由；LangGraph 直接用条件边函数返回值，不需要这个字段）
- `output`：最终输出结果

如果只看 Node 和 Edge，我们会得到一张“能跑起来的路径图”；加上 State，这张图才能在运行时做决策。

图结构比线性结构更贴近 AI 系统的真实形态，因为很多 AI 应用的控制流本来就是图，只是早期常被临时写成 `if-else`、重试逻辑或分散在不同模块里的状态机。

### Loop：Graph 上的回溯

在同一套「文章审核」里：**审核不通过**时，控制流不应结束，而应沿某条边回到「修改」或「重新生成」——这就是 Loop 在业务上的含义。技术上，它表现为图上的**回边（Back Edge）**。

> 需要区分本文的 Loop 与 Agent 基础篇中的 **Agent Loop**。Agent Loop 是 Agent 的顶层运行引擎——整个 Agent 在一个 while 循环中反复执行“推理 → 行动 → 观察”直到任务完成。而本文的 Loop 是 Graph 内部的控制模式——特定节点子集通过回边形成的迭代修正循环。两者的关系是：Agent Loop 是外层循环，Graph Loop 可以嵌套在其中的某个节点或子图内。

![Loop 概览：循环机制示意](https://oss.javaguide.cn/github/javaguide/ai/workflow/loop-mechanism.svg)

很多人第一次接触 AI 工作流时，会把 `Loop` 理解成“多跑几次”。这不算错，但还不够准确。更准确地说：**Loop 是图结构上的一种控制模式**。当某条边根据当前状态把控制流送回到先前节点时，就形成了 Loop，正如上图所示，重点在判断是否达标，在循环的内部 LLM 会根据提示词的要求对结果进行“评分”，如果满足就会输出，否则“打回重写”。

常见的 Loop 主要有两种：

1. **固定次数循环**：更像 `for`。例如“最多重试 3 次”。
2. **条件驱动循环**：更像 `while`。例如“只要评分低于 80 分，就继续修改”。

AI 场景里，条件驱动循环更常见，因为迭代次数取决于内容质量、工具结果和外部反馈。生产实现通常还会叠加固定上限：条件负责决定是否继续，轮次、超时和 Token 预算负责强制退出。

在实际工程中，还经常遇到**嵌套循环**的情况：外层循环负责“质量迭代”（生成 → 审核 → 修改），内层循环负责“工具重试”（某个节点内部调用外部 API 失败后的指数退避重试）。这两层循环的作用域、终止条件和计数器是独立的——内层重试耗尽不应影响外层的迭代预算，外层退出也不意味着内层可以无限制重试。设计嵌套循环时，需要为每层明确独立的退出条件和安全边界。

总之，一个可靠的 Loop 一定包含三件事：

- 继续条件：为什么还要再来一轮。
- 退出条件：什么时候已经足够好，可以结束。
- 安全边界：最大轮次、超时、预算、熔断条件。

如果没有这些约束，Loop 很容易从“自我修正”变成“无限打转”。

仍然放回文章审核的例子里，Loop 不只是“多试几次”，它是“审核结论驱动下一跳”。只有当评分未达标、且还没超过最大轮次时，流程才会从 `ReviewNode` 回到 `ReviseNode`；一旦达到阈值或触发边界条件，就应该退出并给出结果。到这里，循环已经变成了一种可控的回溯机制。

## Workflow、Graph 和 Loop 有什么关系？

![Workflow、Graph、Loop 三者关系概览](https://oss.javaguide.cn/github/javaguide/ai/workflow/workflow-graph-loop-relation.svg)

可以用一句话收束三者的层次关系：**Workflow 是目标与过程，Graph 是结构与载体，Loop 是图上的控制模式。**

继续沿用同一个“写文章并审核”的例子：

- 当我们说“先生成初稿，再审核，不达标就修改，直到达标后输出”，我们描述的是 **Workflow**。
- 当我们把 `生成节点 → 检查节点 → 修正节点` 画成节点与连线，并让它们共享同一份状态时，我们得到的是 **Graph**。
- 当我们规定“审核不通过就回到修改，直到评分达标或达到上限”为止，我们定义的就是 **Loop**。

这三者是同一件事的三个观察角度：Workflow 关注任务目标，Graph 关注结构组织，Loop 关注回溯控制。

## 代码实现

前面建立了 Node、Edge、State 的概念模型，接下来看这些概念如何映射到具体的框架。以下以 Spring AI Alibaba Graph（Java 生态）和 LangGraph（Python 生态）为例。

### 框架概念对照

Spring AI Alibaba 和 LangGraph 里几个关键概念的对应关系：

- **状态**：Spring AI Alibaba 用 `OverAllState` + `KeyStrategyFactory`；LangGraph 用 `TypedDict` + `Annotated[type, reducer]`
- **覆盖语义**：Spring AI Alibaba 是 `ReplaceStrategy`，LangGraph 默认就是这样
- **追加语义**：Spring AI Alibaba 用 `AppendStrategy`，LangGraph 用 `Annotated[list, operator.add]`
- **节点**：Spring AI Alibaba 是 `NodeAction` 接口，LangGraph 就是普通函数
- **顺序边**：Spring AI Alibaba `addEdge(source, target)` 对应 LangGraph 的 `add_edge(source, target)`
- **条件边**：Spring AI Alibaba `addConditionalEdges(source, fn, map)` 对应 LangGraph 的 `add_conditional_edges(source, fn)`
- **循环**：两边都是条件边回指先前节点，Spring AI Alibaba 额外提供了 `LoopAgent`
- **固定次数循环**：两边都可以在 State 中维护计数器，再由条件边决定继续或退出
- **条件驱动循环**：两边都可以让条件边读取评分、错误状态或外部事件后决定下一跳
- **持久化**：Spring AI Alibaba 用 `MemorySaver` / `RedisSaver` 等，LangGraph 用 `MemorySaver` / `SqliteSaver`
- **人机协同**：Spring AI Alibaba 用 `interruptBefore()` + `updateState()`，LangGraph 用 `interrupt_before` + `update_state`
- **编译执行**：Spring AI Alibaba 需要 `StateGraph.compile(CompileConfig)`，LangGraph 直接 `StateGraph.compile()`

### 实现示例：用 Spring AI Alibaba 构建文章审核工作流

下面用 Spring AI Alibaba Graph 实现贯穿全文的“生成 → 审核 → 修改”工作流。示例省略 import、依赖注入配置和模型供应商配置，节点、状态策略与图组装保持完整。

**第一步：定义状态和更新策略**

```java
// 配置状态键策略：控制每个字段如何更新
public static KeyStrategyFactory createKeyStrategyFactory() {
    return () -> {
        HashMap<String, KeyStrategy> strategies = new HashMap<>();
        strategies.put("input", new ReplaceStrategy());          // 用户输入
        strategies.put("messages", new AppendStrategy());        // 对话历史（追加）
        strategies.put("current_draft", new ReplaceStrategy());  // 当前草稿（覆盖）
        strategies.put("review_score", new ReplaceStrategy());   // 审核评分（覆盖）
        strategies.put("review_feedback", new ReplaceStrategy()); // 审核反馈
        strategies.put("iteration_count", new ReplaceStrategy()); // 迭代计数
        strategies.put("output", new ReplaceStrategy());         // 最终输出
        strategies.put("next_node", new ReplaceStrategy());      // 路由控制
        return strategies;
    };
}
```

注意 `messages` 使用 `AppendStrategy`（对话历史持续追加），而 `current_draft` 使用 `ReplaceStrategy`（每次修改覆盖旧版本）。

**第二步：实现节点**

```java
// 生成初稿节点
public static class DraftNode implements NodeAction {
    private final ChatClient chatClient;

    public DraftNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String input = state.value("input").map(v -> (String) v).orElse("");

        String draft = chatClient.prompt()
            .user(String.format("请根据以下要求撰写文章：%s", input))
            .call().content();

        return Map.of(
            "current_draft", draft,
            "next_node", "review"
        );
    }
}

// 质量审核节点
public static class ReviewNode implements NodeAction {
    private final ChatClient chatClient;

    public ReviewNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    private record ReviewResult(double score, String feedback) {}

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        int count = state.value("iteration_count").map(v -> (Integer) v).orElse(0);

        String prompt = String.format(
            "请评估以下文章质量，给出 0-100 的评分和改进建议。\n" +
            "以JSON格式返回：{\"score\": 85, \"feedback\": \"...\"}\n\n%s", draft);

        ReviewResult result = chatClient.prompt()
            .user(prompt)
            .call()
            .entity(ReviewResult.class);

        int nextCount = count + 1;
        String nextNode =
            (result.score() >= 80 || nextCount >= 3) ? "exit" : "revise";
        return Map.of(
            "review_score", result.score(),
            "review_feedback", result.feedback(),
            "iteration_count", nextCount,
            "next_node", nextNode
        );
    }
}

// 修改节点：根据审核反馈修正内容
public static class ReviseNode implements NodeAction {
    private final ChatClient chatClient;

    public ReviseNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        String feedback = state.value("review_feedback").map(v -> (String) v).orElse("");

        String revised = chatClient.prompt()
            .user(String.format("请根据反馈修改文章。\n\n原文：%s\n\n反馈意见：%s", draft, feedback))
            .call().content();

        return Map.of(
            "current_draft", revised,
            "next_node", "review"
        );
    }
}

// 输出节点
public static class ExitNode implements NodeAction {
    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        return Map.of("output", draft);
    }
}
```

**第三步：组装 Graph**

```java
public static CompiledGraph buildWorkflow(ChatModel chatModel) throws GraphStateException {
    ChatClient.Builder builder = ChatClient.builder(chatModel);

    var draft = node_async(new DraftNode(builder));
    var review = node_async(new ReviewNode(builder));
    var revise = node_async(new ReviseNode(builder));
    var exit = node_async(new ExitNode());

    StateGraph workflow = new StateGraph(createKeyStrategyFactory())
        .addNode("draft", draft)
        .addNode("review", review)
        .addNode("revise", revise)
        .addNode("exit", exit);

    // 顺序边
    workflow.addEdge(START, "draft");

    // 条件边：根据 next_node 字段决定路由
    workflow.addConditionalEdges("draft",
        edge_async(state ->
            (String) state.value("next_node").orElse("review")),
        Map.of("review", "review"));

    workflow.addConditionalEdges("review",
        edge_async(state ->
            (String) state.value("next_node").orElse("exit")),
        Map.of(
            "revise", "revise",   // 审核不通过 → 修改
            "exit", "exit"        // 审核通过或达到上限 → 输出
        ));

    // 修改后回到审核节点，形成循环
    workflow.addConditionalEdges("revise",
        edge_async(state ->
            (String) state.value("next_node").orElse("review")),
        Map.of("review", "review"));

    workflow.addEdge("exit", END);

    // MemorySaver 只保存当前进程内的 checkpoint
    var saver = new MemorySaver();
    var compileConfig = CompileConfig.builder()
        .saverConfig(SaverConfig.builder().register(saver).build())
        .build();

    return workflow.compile(compileConfig);
}
```

每个 Node 只处理一种职责，条件边根据 `next_node` 路由，`iteration_count` 和 `review_score` 保存在 State 中。`review → revise → review` 形成回边，第三次审核后无论评分是否达标都会退出，避免无限循环。

示例中的 `MemorySaver` 只能在当前进程和同一 Saver 实例内保留 checkpoint。恢复时还要使用稳定的线程或会话标识定位记录。需要在进程重启后恢复时，应换成 Redis 或数据库 Saver，并验证 checkpoint 的序列化、过期和并发更新行为。

> 更完整的示例（包括人机协同、持久化、流式输出）可参考 [Spring AI Alibaba Graph 官方文档](https://java2ai.com/docs/frameworks/graph-core/quick-start/)。

## 工作流抽象能力

![高抽象与低抽象工作流对比](https://oss.javaguide.cn/github/javaguide/ai/workflow/abstraction-comparison.svg)

上图可以看到高抽象工作流将四个判断节点抽象成一个判断节点：评估是否达标。如果使用低抽象，那么当我们需要减少/添加新的判断节点时，需要花费时间去阅读源码寻找对应的节点。好的工作流关键看 Node、Edge、State 的抽象能否经得起复用与扩展，和步骤多少关系不大。

很多初学者设计工作流时，容易把每一步都写成具体动作，例如：调用模型生成文案；检查标题长度；检查语气是否合适；判断是否需要补资料；再调用模型修改。这样做短期可用，但流程会越来越碎，复用性也很差。更成熟的方式是把流程抽象到更稳定的结构层：

1. **Node 抽象职责边界**：在这个节点中产出的结果该是什么样子的，必须出现哪些信息。而不是抽象“这一次调了哪个 API”。
2. **Edge 抽象流转规则**：在什么状态下允许去哪、何时结束。用条件边表达分支与循环，而不是在图外写满 if-else。
3. **State 抽象推进任务时必须持久记住的信息**：工单快照、审核结论、重试次数、错误码等，让路径有据可依。

例如在“生成并审核文章”的场景里，与其设计十几个零散节点来检查文章标题符不符合题意、文章字数是否满足要求，不如先抽象出几个更稳定的职责：

- `DraftNode`：负责产出当前版本内容。
- `ReviewNode`：负责评估当前结果是否达标。
- `ReviseNode`：负责根据反馈修正内容。
- `ExitNode`：负责在满足条件时输出最终结果。

![Graph 核心元素：Node、Edge、State](https://oss.javaguide.cn/github/javaguide/ai/workflow/graph-core-elements.svg)

## 工作流落地的时候有没有遇到什么坑？

真正把工作流落地时，问题往往不出在“图不会画”，而出在细节没有提前设计好。下面这些是实践里最常见的坑。

### State 设计的粒度

- 太粗：所有东西都塞进一个大对象里，谁改了哪个字段不好查。
- 太细：字段拆得特别散，每个节点都要拼来拼去，容易出错。
- 建议：按业务含义分几块，例如「用户原始输入一块」「当前生成结果一块」「审核/评分结论一块」「流程控制用的一块（如当前步骤、重试次数）」。

### 循环终止条件

不要只写“如果不满意就继续优化”，而要明确：

- 最大轮次是多少？
- 评分阈值是多少？
- 超时或成本超限时怎么办？
- 连续失败后是否要 fallback。

### 错误处理与降级

AI 工作流不是只处理“成功路径”。工具异常、模型超时、格式校验失败、外部接口限流，都应在图上有**明确边**：重试、降级（例如跳过某工具）、转人工、或输出“当前最优 + 错误说明”，而不是只靠外围 `try-catch` 吞掉。

Spring AI Alibaba 把错误分成四类，对应不同处理策略：

- **瞬时错误**（网络超时、API 限流）：用指数退避重试，设置最大次数
- **LLM 可恢复错误**（工具调用失败、输出格式异常）：把错误塞到 State 里，循环回去让 LLM 看着调整
- **用户可修复错误**（缺少必要信息、指令不明确）：调用 `interruptBefore` 暂停，等人工输入
- **意外错误**（未知异常）：让异常冒泡，交给开发者调试

这些策略和分布式系统里的弹性模式很接近：

- **指数退避重试**：工具调用超时时按 1s、2s、4s 递增间隔重试，并设置总时限；认证失败应停止相关分支、重新认证或转人工，不能跳过鉴权继续执行
- **熔断器**：连续 N 次 LLM 输出格式校验失败就熔断，降级到模板输出或换更简单的模型，别继续浪费 Token
- **舱壁隔离**：给不同外部 API 设独立的并发上限，防止某个慢服务把线程池打满
- **补偿事务（Saga）**：多步骤操作某步挂了，按反序执行已完成步骤的回滚操作

> 这些模式需要在节点内部或中间件层自行实现，Graph 框架只提供执行骨架和状态管理。具体做法：重试和熔断逻辑封装在节点里，通过 State 字段（如 `retry_count`、`circuit_state`）持久化状态；舱壁隔离用 Java 的 `Semaphore` 或 Resilience4j；补偿事务需要在 State 中记录已完成步骤的回滚信息，再设计专门的补偿节点。

### Token 与成本控制

Loop 会自然放大 Token 与延迟。设计时要提前思考：

- 哪些节点必须调用大模型，哪些可以用代码替代。
- 是否可以先粗筛，再精修。
- 是否需要在达到“足够好”时就提前结束，而不是追求“理论最优”。

### 节点间数据传递

节点之间传什么、字段名怎么定义、结构化输出采用什么 schema，都应该尽早统一（例如统一用 JSON Schema 或 Pydantic 模型）。否则图一旦复杂，调试成本会急剧上升。

## 上线前检查 State 和 Loop

工作流中的 LLM 输出仍是不可信数据。进入数据库、前端模板、Shell 命令或下游工具前，要做对应类型的校验和编码；每个节点只获得当前任务所需的工具权限，删除、发送、付款等高风险操作通过审批节点控制。

Graph 还要额外检查两类问题：

- **State 污染**：恶意输入通过节点处理后写入 State 的路由控制字段（如 `next_node`），可能影响后续条件边路由，跳过审核节点直接到达输出。防御：对 State 中的路由控制字段做白名单校验。
- **Loop 放大攻击**：恶意输入构造使 ReviewNode 永远返回低分，导致 Loop 达到最大轮次才退出，消耗大量 Token。防御：除了 `iteration_count` 上限外，增加 Token 消耗预算作为独立的安全边界。

最后用回放测试覆盖正常退出、达到迭代上限、工具超时、人工中断、认证失败和 checkpoint 恢复。框架 API 会变化，Node 的职责、Edge 的合法流转和 State 的更新规则应当在测试中固定下来。

## 面试准备要点

**高频问题**：

1. **为什么 AI 系统需要工作流？** → LLM 输出不确定，需要动态决策、自动修正和可控收敛
2. **Workflow、Graph、Loop 三者什么关系？** → Workflow 是目标与过程，Graph 是结构与载体，Loop 是图上的控制模式
3. **Graph Loop 和 Agent Loop 有什么区别？** → Agent Loop 是 Agent 的顶层运行引擎（推理→行动→观察循环），Graph Loop 是 Graph 内部的回溯控制模式（特定节点子集通过回边迭代修正），两者可以嵌套
4. **Loop 如何防止死循环？** → 三要素：继续条件、退出条件、安全边界（最大轮次 + 超时 + Token 预算）
5. **State 的更新策略怎么选？** → 单值字段用 Replace，累积字段用 Append，并行写入字段必须用 Reducer
6. **条件边和动态路由的区别？** → 条件边候选集在设计时确定、运行时做选择；动态路由候选集在运行时才确定；实际是一个连续谱系
7. **怎么理解 Graph 的抽象设计？** → Node 抽象职责边界（产出什么），Edge 抽象流转规则（何时去哪），State 抽象必须持久记住的信息

**追问准备**：

- 工作流中断后怎么恢复？（持久化 + checkpoint 机制）
- 节点内的错误怎么处理？（瞬时错误重试、LLM 可恢复错误循环回去、用户可修复错误转人工、意外错误冒泡）
- Spring AI Alibaba 和 LangGraph 的循环实现有什么区别？（前者可用条件边回指或 LoopAgent，后者需自行维护计数器）
- 工作流有哪些特有的安全风险？（State 污染影响路由、Loop 放大攻击消耗 Token）

## 总结

Workflow 描述任务的完成过程，Graph 用 Node、Edge 和 State 把过程组织成可执行结构，Loop 则让特定节点根据条件回到前序步骤继续修正。它们可以为包含 LLM 的生成、评估和工具调用提供比单条长 Prompt 更清晰的状态流转与故障处理方式。

落地时要先定义 State 的职责和更新规则，再写清条件边、退出条件、最大轮次、超时与 Token 预算。所有进入路由、数据库、模板或外部工具的数据都要校验；重试、降级、人工中断和 checkpoint 恢复也应进入测试覆盖，避免循环在错误输入或异常依赖上持续放大成本。
