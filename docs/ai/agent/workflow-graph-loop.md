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

模型已经给出了初稿，审核却说“缺少参考资料”。接下来把审核意见发给模型就行了吗？还得带上需要修改的稿件，否则它可能又从头写一篇。改完以后，也要重新审核，不能直接把这次输出当成成稿。

这样的任务包含多次调用。Workflow、Graph 和 Loop 用来描述这些调用怎么组织，下面用一个文章审核流程说明。

## 为什么 AI 系统需要工作流？

程序可以按“生成初稿 → 审核 → 修改 → 再审核”运行。每次审核后，把评分和意见保存下来，再判断要不要继续修改。这就是一个工作流。

假设要求评分达到 80 分，最多审核 3 次。第一次得了 65 分，就带着反馈修改；第二次得了 82 分，直接结束。如果一直没达标，第三次仍只有 70 分，也得停下来，把当前稿和没解决的问题交给调用方。**审核通过与次数用完，是两种不同的结束原因。**

这里的 3 次指审核次数，包含初稿的第一次审核，所以最多修改 2 次。后面的 Java 代码也按这个口径计数。工作流能让程序照着这些规则执行，至于模型给出的评分是否可靠，还要另外验证。

## 传统工作流和 AI 工作流有什么区别？

![传统 Workflow 与 AI Workflow 对比](https://oss.javaguide.cn/github/javaguide/ai/workflow/traditional-vs-ai-workflow.svg)

看到图中的回边，容易以为循环是 AI 工作流才有的能力。订单被驳回后重新提交，也是循环。两类流程的区别，要看里面是否有模型参与，以及程序怎样使用模型的输出。

### 传统工作流的特点

**Workflow（工作流）** 规定任务有哪些步骤、先后依赖和分支条件。文章审核是工作流，订单审批也是。

传统工作流通常先定义活动和候选分支，再根据业务数据决定走哪条路。它也能等待人工审批、调用外部 API，节点结果并不一定完全确定。BPMN 2.0、Camunda、Temporal、Apache Airflow 都支持比顺序执行更复杂的流程，不能把传统工作流理解成一串固定的函数调用。

订单金额大于 10000，进入高级审批，这个条件可以直接用代码判断。换成“文章质量是否达到 80 分”，评分通常还要依赖模型或人工。同一篇文章可能两次得分不同，程序不能因为拿到了一个数字，就认定它准确衡量了质量。

### AI 工作流的特点

文章审核中的草稿、评分、反馈和轮次都要随执行保存。模型返回的评分如果不是数字，应先处理格式错误；只有拿到有效评分，才能判断是否需要改稿。

格式合法的评分也未必准确。可以先用代码检查字数和必填部分，再用模型评估内容，并保留人工抽查。重试、降级和状态管理沿用工作流已有机制，评测规则则需要围绕模型输出设计。

需要表达“下一步不唯一”或者“不满意就再来一轮”时，可以用 Graph 表达分支，用 Loop 表达重复执行。这些结构也适用于不含 LLM 的流程。

## Graph 和 Loop 是什么？

### Graph：工作流的结构

把刚才的审核流程画出来，会看到几个执行步骤，以及步骤之间的连线。在图框架中，它们分别叫 **Node（节点）** 和 **Edge（边）**。草稿、评分等需要传给后续步骤的数据，则保存在 **State（状态）** 里。

节点可以是一个普通函数。例如审核节点读取当前稿，调用模型，返回评分和反馈。节点不必都调用 LLM：检查标题长度、查询订单、等待人工审批，也可以各自作为一个节点。

边决定执行完这个节点以后去哪里。初稿生成后一定进入审核，用顺序边即可；审核后可能修改，也可能退出，就需要条件边。Spring AI Alibaba 中的 `addConditionalEdges()` 接收路由函数，由它根据状态选择已配置的下一跳。

还会遇到这些连接方式：

- 一个节点同时启动多个后续节点，用于并行处理。
- 审核后回到修改节点，再回来审核，形成循环。
- 当前分支没有后续工作，连接到终止位置。
- 输入中有多少项待处理，就分发多少次节点调用。LangGraph 的 `Send` API 可以表达这种动态分发。

> 条件边本身也能实现动态路由，不必把两者当作互斥的边类型。[LangGraph 的 `Send`](https://docs.langchain.com/oss/python/langgraph/graph-api#send) 可以从条件边返回，为已注册的节点创建多次调用，并分别传入状态。动态变化的是调用次数与输入，不是运行时凭空新增节点定义。map-reduce 这类任务可以用它根据数据量展开并行分支。

**State 可以先理解为节点共同使用的一份数据。** Java 中常见的形式类似 `Map<String, Object>`，Python 中类似 `dict`，TypeScript 中可以用 `Record<string, any>` 表示这种宽泛结构；实际应用应进一步约束字段类型。节点读取自己需要的字段，返回要更新的部分，不必把整个状态都交给模型。

文章修改后，`current_draft` 应替换为新稿；需要保留的审核记录则可以追加到列表。字段用途不同，更新方式也不同：

- **覆盖（Replace）**：新值直接替换旧值。适用于单值字段，如分类结果、当前状态。在 Spring AI Alibaba 中对应 `ReplaceStrategy`，在 LangGraph 中对应无 reducer 的默认行为。
- **追加（Append）**：新值追加到已有列表。适用于累积型字段，如对话历史（messages）。在 Spring AI Alibaba 中对应 `AppendStrategy`，在 LangGraph 中对应 `Annotated[list, operator.add]`。
- **自定义合并（Custom Reducer）**：通过自定义函数决定合并逻辑，例如 LangGraph 的 `add_messages` 会根据消息 ID 进行追加或更新。

如果并行审核节点都写入 `review_feedback`，直接覆盖就没有说明应保留哪份意见。LangGraph 在同一执行步内收到对无合并策略字段的多个更新时，会抛出 `INVALID_CONCURRENT_GRAPH_UPDATE`。可以把反馈设计成带来源的集合并定义合并规则，或让节点分别写入不同字段。

实际项目中常用的状态字段（可根据业务需求调整）：

- `input`：用户输入，全流程保留
- `messages`：对话历史，用追加策略
- `retrieval_result`：RAG 检索结果，中间状态
- `tool_result`：工具调用结果，中间状态
- `llm_response`：LLM 原始输出，中间状态
- `intermediate_steps`：中间执行步骤记录，全流程保留
- `next_step`：可选的路由结果字段，供条件边读取；字段名由应用定义，也可以直接在条件边函数中计算下一跳
- `output`：最终输出结果

节点写入的状态还会影响下一条边。例如审核节点更新 `review_score`，条件边读取它后选择修改或退出。普通 `if-else` 也能表达这个判断；Graph 把节点、跳转和状态组织在一起，方便查看和管理较复杂的执行路径。

### Loop：Graph 上的回溯

审核未通过且仍有修改额度时，流程可以回到修改节点，再执行审核。这条回到先前节点的路径形成 **Loop**，图中通常用回边表示。

> **Agent Loop** 描述“推理 → 行动 → 观察”的运行过程，本文的 **Graph Loop** 则描述节点通过回边重复执行的控制结构。两者没有固定的内外层关系：可以用 Graph 实现 Agent Loop，也可以让一个图节点运行完整的 Agent，或者让 Agent 调用含有循环的子图。[LangGraph 官方示例](https://docs.langchain.com/oss/python/langgraph/workflows-agents)就用模型节点、工具节点和条件边组成 Agent。

![Loop 概览：循环机制示意](https://oss.javaguide.cn/github/javaguide/ai/workflow/loop-mechanism.svg)

这张图用评分判断是否继续，但循环本身不依赖 LLM。批处理程序检查列表是否处理完、部署脚本检查外部任务是否完成，用的也是条件判断。

次数固定时，可以类比 `for`；等某个条件满足才退出时，可以类比 `while`。本文的审核同时检查评分和次数：低于 80 分还可以再改，但审核达到 3 次就结束。如果只保留评分条件，模型一直给低分，循环就没有出口。

还有一种容易漏掉的情况：修改节点调用 API，网络超时了，于是在节点内重试。外层正在数修改轮次，内层又有一个请求重试计数器，形成了嵌套循环。

**内层重试也要消耗整项任务的预算。** 假如总时限已经用完，不能因为工具还有两次重试额度就继续等。收到取消信号时也是如此。内层用完额度以后，应把失败返回给外层，由外层选择报错或交接；再次进入节点时是否允许重试，必须遵守同一份总预算。

因此，低分可以走回边，解析失败和超时却不能自动当作低分处理。进入 `ReviseNode` 的前提是已经拿到有效评分、评分未达标，而且还有修改额度。达标与耗尽额度都能结束流程，但要分别返回原因。

## Workflow、Graph 和 Loop 有什么关系？

![Workflow、Graph、Loop 三者关系概览](https://oss.javaguide.cn/github/javaguide/ai/workflow/workflow-graph-loop-relation.svg)

**Workflow 描述处理流程，Graph 用节点和边表达流程，Loop 表示其中重复执行的路径。**

在前面的例子中，“先写、再审、不通过就改”是工作流要求。把生成、审核、修改连接起来，并约定它们读写哪些状态，就得到了 Graph。审核和修改之间重复执行的部分，就是 Loop。

这三个词说的是同一项任务的不同方面，不是三个需要一起安装的组件。只有两次顺序调用的工作流，直接写在服务方法里也可以；不需要反复执行的流程，自然也就没有 Loop。

## 项目为什么选择 Graph 编排？

**流程包含多个分支、需要等待外部输入，还要从中断处继续时，Graph 有明确的使用理由。** 只有“检索资料后生成答案”的顺序流程，用普通服务编排也能表达，不必为使用框架增加节点。

以售后申请为例：先检查材料，缺少凭证时等待用户补充；材料齐全后判断是否需要人工审核；审核通过后调用业务服务创建售后单，最后通知用户。

| 节点       | 读取或更新的 State             | 后续去向                                         |
| ---------- | ------------------------------ | ------------------------------------------------ |
| 检查材料   | 申请标识、材料版本、缺失项     | 材料齐全则审核，否则等待补充                     |
| 审核申请   | 当前政策版本、审核结论、原因   | 通过后创建售后单，拒绝则结束，需要人工判断则暂停 |
| 创建售后单 | 业务操作标识、已创建的售后单号 | 成功后通知；结果不确定时先查询                   |
| 通知结果   | 售后单号、通知状态             | 完成或记录待重试通知                             |

用户可能隔天才补交材料，审核人也未必马上处理，所以当前申请和执行位置需要保存到持久化 State 与检查点中。例如审核人批准的是第一版申请，用户等待期间又改了退款金额。这时即使程序找回了原来的执行位置，也不能拿旧审批继续创建新金额的售后单。恢复流程还要核对材料版本和授权。

还要考虑请求超时：创建售后单的接口没有返回，不代表单据没有创建。重跑节点前，可以用同一个业务操作标识查询结果；创建接口本身也可以用这个标识做幂等。否则工作流恢复了，业务侧却多了一张单。

以 LangGraph 为例，[Interrupts 官方文档](https://docs.langchain.com/oss/python/langgraph/interrupts)说明了暂停、保存状态与恢复的使用方式，也提醒恢复时节点会从头执行。因此不能把“有 Checkpoint”理解成节点内每条操作都恰好执行一次。

这个例子里，Graph 的价值是把等待、分支和恢复位置组织起来。选择框架时，应沿着这些需求检查 API。至于退款金额是否仍有效、单据是否已经创建，框架并不了解业务，仍然需要应用查询和判断。

## 代码实现

Spring AI Alibaba Graph 和 LangGraph 都提供了节点、状态和边的 API。这里先对照名称，再用 Java 实现文章审核流程。

### 框架概念对照

Spring AI Alibaba 和 LangGraph 里几个关键概念的对应关系：

- **状态**：Spring AI Alibaba 用 `OverAllState` + `KeyStrategyFactory`；LangGraph 用 `TypedDict` + `Annotated[type, reducer]`
- **覆盖语义**：Spring AI Alibaba 是 `ReplaceStrategy`，LangGraph 默认就是这样
- **追加语义**：Spring AI Alibaba 用 `AppendStrategy`，LangGraph 用 `Annotated[list, operator.add]`
- **节点**：Spring AI Alibaba 是 `NodeAction` 接口，LangGraph 就是普通函数
- **顺序边**：Spring AI Alibaba `addEdge(source, target)` 对应 LangGraph 的 `add_edge(source, target)`
- **条件边**：Spring AI Alibaba `addConditionalEdges(source, fn, map)` 对应 LangGraph 的 `add_conditional_edges(source, fn)`
- **循环**：都能通过条件边回到先前节点，条件函数可以读次数、评分或错误状态；Spring AI Alibaba 还提供了 `LoopAgent`
- **编译执行**：Spring AI Alibaba 使用 `StateGraph.compile(CompileConfig)`，LangGraph 使用 `StateGraph.compile()`，需要检查点时传入相应配置

检查点和人工中断值得单独看，光对照方法名容易用错。

Spring AI Alibaba 的 `MemorySaver` 与 LangGraph 的 `InMemorySaver`（也有 `MemorySaver` 名称）都把记录放在内存里。进程还在时能恢复，不代表重启以后也行。需要落盘时，前者可以选 `RedisSaver`，后者可以选 `SqliteSaver`、`PostgresSaver` 等实现；具体部署还要配置相应存储。[LangGraph 的持久化文档](https://docs.langchain.com/oss/python/langgraph/persistence)专门说明了内存 Saver 重启后丢失记录的问题。

人工中断也有不同用法。Spring AI Alibaba 的 `interruptBefore()` 在指定节点之前暂停，节点内需要按状态决定是否中断时，可以实现 `InterruptableAction` 并返回 `InterruptionMetadata`，见[人类反馈文档](https://java2ai.com/docs/frameworks/graph-core/examples/human-in-the-loop/)。LangGraph 中，`interrupt_before` 同样属于静态断点；动态等待用户回答用 `interrupt()`，恢复时传 `Command(resume=...)`。`update_state()` 只负责改状态，不能拿来替代这个回答。

### 实现示例：用 Spring AI Alibaba 构建文章审核工作流

下面用 Spring AI Alibaba Graph 把前面的文章审核串起来。生成、审核、修改和输出各写一个节点，再把它们连接起来。import、依赖注入和模型供应商配置在这里省略，接入项目时需要按所用版本补齐。

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
        strategies.put("exit_reason", new ReplaceStrategy());    // 结束原因
        strategies.put("next_node", new ReplaceStrategy());      // 路由控制
        return strategies;
    };
}
```

这里最容易选错的是 `current_draft`：它保存当前稿，应当覆盖，不能把新旧两篇追加到一起。`messages` 展示的是追加策略，本例没有向它写消息；后续扩展多轮对话时才会用到。

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

    private record ReviewResult(Double score, String feedback) {}

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

        if (result == null || result.score() == null
                || !Double.isFinite(result.score())
                || result.score() < 0 || result.score() > 100
                || result.feedback() == null) {
            throw new IllegalStateException("审核响应缺少字段或评分不合法");
        }

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
        double score = state.value("review_score")
            .map(v -> ((Number) v).doubleValue()).orElseThrow();
        return Map.of(
            "output", draft,
            "exit_reason", score >= 80 ? "passed" : "review_limit_reached"
        );
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

沿着 `review → revise → review` 看一次执行，就能找到循环的位置。审核完成后计数加 1，第三次审核后一定退出。`exit_reason` 会告诉调用方是 `passed` 还是 `review_limit_reached`；评分和反馈仍保留在最终 State 中。

`ReviewResult` 的评分使用 `Double`，便于识别缺失值。解析出对象以后，还要检查评分是否有限、是否在 0～100 内，以及反馈字段是否存在。无法解析的响应会抛出异常，字段校验失败也会中断，不会被当成低分继续改稿。

示例中的 `MemorySaver` 只能在当前进程和同一 Saver 实例内保留 checkpoint。恢复时还要使用稳定的线程或会话标识定位记录。需要在进程重启后恢复时，应换成 Redis 或数据库 Saver，并验证 checkpoint 的序列化、过期和并发更新行为。

> 更完整的示例（包括人机协同、持久化、流式输出）可参考 [Spring AI Alibaba Graph 官方文档](https://java2ai.com/docs/frameworks/graph-core/quick-start/)。

## 工作流抽象能力

![高抽象与低抽象工作流对比](https://oss.javaguide.cn/github/javaguide/ai/workflow/abstraction-comparison.svg)

图中把几个判断合成一个审核节点。这样改动审核规则时，可以集中修改一处，但也会减少图上可单独观察和重试的步骤。节点更少并不天然更好。

例如标题长度检查只是一个本地函数，可以放在 `ReviewNode` 内；外部资料核查如果耗时较长、需要独立重试，就可以拆成另一个节点。划分时分别看三个部分：

1. **Node**：一次执行交付什么结果，失败后是否需要单独重试。
2. **Edge**：读取哪些状态来选择下一步，哪些分支不允许发生。
3. **State**：后续节点和恢复流程还需要哪些字段，例如审核结论、稿件版本与错误码。

生成、审核、修改、输出在代码中各有一个类，已经能看出职责，不必继续按每个校验条件拆节点。需要调整粒度时，先看失败以后想单独重跑哪一步，以及能否清楚地定义它的输入、输出。

![Graph 核心元素：Node、Edge、State](https://oss.javaguide.cn/github/javaguide/ai/workflow/graph-core-elements.svg)

## 工作流落地的时候有没有遇到什么坑？

跑通一次正常请求以后，还需要试试模型没返回内容、审核响应无法解析，以及请求迟迟不返回时会怎样。前面的审核节点会拒绝不合法的评分，但生成节点的空响应、调用超时等处理仍要在项目接入时补上。

### State 设计的粒度

假如 State 只有一个 `text` 字段，里面同时放草稿、反馈和轮次，修改节点每次都要从文本中找出稿件，审核节点也得猜哪里是旧反馈。将 `current_draft`、`review_feedback`、`iteration_count` 分开，字段的读写关系就明确了。

完整请求日志可以放在日志系统中，State 留下查询标识。要交给下一节点的草稿和评分则必须保存到状态里。节点的局部变量只在本次执行中存在，恢复时不能指望还能读到。

### 循环终止条件

代码中 `review_score >= 80` 和 `iteration_count >= 3` 都会结束流程，含义却不同。调用方显示“审核通过”前，应读取 `exit_reason`，不能只判断 Graph 是否正常返回。

不同框架的计数单位还可能不同。[OpenAI Agents SDK 的 `max_turns`](https://openai.github.io/openai-agents-python/running_agents/#the-agent-loop)按 Agent Loop 中的模型调用轮次计数，超出时默认抛出 `MaxTurnsExceeded`。一次模型输出可能请求多个工具，所以设置 `max_turns=3` 不能理解成“最多调用 3 次工具”。本文自己维护的 `iteration_count` 只数审核，生成和修改也会调用模型，但不增加这个审核计数。

### 错误处理与降级

审核请求超时与文章得了低分，需要的处理完全不同。超时后可以尝试重发审核请求；低分才需要把当前稿送去修改。若所有异常都指向 `ReviseNode`，程序连审核意见都没有，就会开始改稿。

[LangGraph 的设计指南](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph)按错误由谁处理来区分恢复方式。网络抖动、临时限流通常由程序重试；模型漏了评分字段，可以告诉它缺少哪个字段，让它有限次地修正输出。缺少用户资料时要暂停等输入，未知异常则保留堆栈交给开发者。鉴权失败尤其不适合反复让模型尝试，应停止相关分支，重新认证或转人工。

重试可以用框架策略，也可以封装在节点或中间件里。例如间隔按 1s、2s、4s 退避，同时限制次数和总时长。需要跨中断恢复的重试计数、失败原因，应随状态保存，避免恢复后又从零计数。对会产生副作用的调用，重试前还得核对幂等机制。

服务持续不可用时，可以用**熔断器**暂时停止调用，返回降级结果或交给人处理。换一个模型不是无条件的降级方案，还要检查它是否支持所需能力和输出 Schema。

慢服务拖住整个线程池，则是另一类问题。可以用 **舱壁隔离**给不同 API 分配并发额度，Java 中可使用 `Semaphore` 或 Resilience4j。这样某个服务占满自己的额度后，其他调用仍有机会执行。

多步骤业务还可能需要 **补偿事务（Saga）**。比如前面的业务写入已经成功，后续步骤却失败，单纯把图跳回去不会撤销之前的写入。应用要记录已完成操作，按业务依赖执行补偿，并保存补偿结果；有些副作用无法原样撤销，不能把补偿理解成数据库事务的回滚。

### Token 与成本控制

一次修改要生成新稿，随后还要再次审核，两步都会消耗 Token。标题超长、缺少必填部分这类代码能确定的问题，可以先检查出来，再把内容质量交给模型。记录成本时应累计整项任务的消耗，包括失败请求和重试；不能在进入修改节点时把预算重新置零。

### 节点间数据传递

审核节点读取 `current_draft`，修改节点读取 `review_feedback`，这两个字段的类型和含义应由节点契约约定。Java 项目可以用 DTO 和校验规则，Python 项目可以用 Pydantic，跨接口则可用 JSON Schema。不要让每个节点临时猜上一节点返回的字段名。

## 上线前检查 State 和 Loop

工作流中的 LLM 输出仍是不可信数据。进入数据库、前端模板、Shell 命令或下游工具前，要做对应类型的校验和编码；每个节点只获得当前任务所需的工具权限，删除、发送、付款等高风险操作通过审批节点控制。

Graph 还要额外检查两类问题：

- **State 污染**：如果直接把模型返回的 JSON 合并到 State，里面的 `next_node` 可能覆盖程序设置的路由。只检查它是不是合法节点名还不够：`exit` 名称合法，也不表示当前步骤有权跳到那里。应限定模型能更新的业务字段，由可信代码根据校验结果计算路由，并检查当前节点允许的跳转。本文的 `next_node` 就由节点代码写入。
- **Loop 放大攻击**：恶意输入构造使 ReviewNode 永远返回低分，导致 Loop 达到最大轮次才退出，消耗大量 Token。防御：除了 `iteration_count` 上限外，增加 Token 消耗预算作为独立的安全边界。

测试也应覆盖异常路径。除了正常通过，还要检查耗尽次数、工具超时、认证失败以后停在哪里；人工中断和 checkpoint 恢复后，哪些节点会重跑。升级框架时，可以用同一批输入回放，确认节点职责、合法跳转和状态更新仍符合预期。

## 面试准备要点

**高频问题**：

1. **为什么 AI 系统需要工作流？** → 组织 LLM 调用、校验、分支与重试，控制状态和执行边界；工作流不保证生成结果一定达标
2. **Workflow、Graph、Loop 三者什么关系？** → Workflow 是目标与过程，Graph 是结构与载体，Loop 是图上的控制模式
3. **Graph Loop 和 Agent Loop 有什么区别？** → Agent Loop 描述推理、行动与观察过程，Graph Loop 描述图上的循环控制结构；Graph 可以实现 Agent Loop，两者也可以嵌套，没有固定的内外层关系
4. **Loop 如何防止死循环？** → 三要素：继续条件、退出条件、安全边界（最大轮次 + 超时 + Token 预算）
5. **State 的更新策略怎么选？** → 单值字段用 Replace，累积字段用 Append；多个并行节点写同一字段时，需要明确合并规则，也可以拆成不同字段
6. **条件边和动态路由的区别？** → 条件边根据运行时状态决定下一跳，本身就能实现动态路由；LangGraph 的 `Send` 还可以为已注册节点动态展开多次调用，并传入各自的状态
7. **怎么理解 Graph 的抽象设计？** → Node 抽象职责边界（产出什么），Edge 抽象流转规则（何时去哪），State 抽象必须持久记住的信息

**追问准备**：

- 工作流中断后怎么恢复？（持久化 + checkpoint 机制）
- 节点内的错误怎么处理？（瞬时错误重试、LLM 可恢复错误循环回去、用户可修复错误转人工、意外错误冒泡）
- Spring AI Alibaba 和 LangGraph 怎样限制循环？（两者都可在 State 中维护业务计数，再用条件边退出；Spring AI Alibaba 另有 `LoopAgent`，框架运行步数上限不能直接当作业务轮次）
- 工作流有哪些特有的安全风险？（State 污染影响路由、Loop 放大攻击消耗 Token）

## 总结

Workflow 规定怎么处理任务，Graph 把步骤与跳转组织起来，Loop 让其中一段可以重复执行。本文的 `review → revise → review` 就是一个带次数限制的循环。

能循环还不够，调用方也得知道为什么结束。`exit_reason` 区分审核通过和次数耗尽；外部写操作则需要幂等或结果查询，防止恢复节点时重复写入。这些处理都要结合业务实现，画出一张图并不会自动获得它们。
