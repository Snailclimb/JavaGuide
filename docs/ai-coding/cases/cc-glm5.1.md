---
title: Claude Code 接入第三方模型实战：JVM 智能诊断与慢查询治理
description: 通过 Claude Code 接入 GLM-5.1 模型，完成 JVM 智能诊断助手从零搭建和百万级数据量慢查询治理两个实战任务，分享 AI 辅助编程的工作方法与踩坑经验。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,AI编程,GLM-5.1,JVM诊断,慢查询优化,AI辅助开发,Arthas,Agent,Spring AI
---

大家好，我是小 G。前面分享过 [IDEA 搭配 Qoder 插件的实战](./idea-qoder-plugin.md)和 [Trae 接入大模型的实战](./trae-m2.7.md)，分别覆盖了 JetBrains 体系和 VS Code 体系下的 AI 辅助编码。这篇换个角度，聊聊 **Claude Code 接入第三方模型** 的实战体验。

Claude Code 本身是 Anthropic 官方的 CLI 编码工具。部分服务商通过 Anthropic 兼容接口和环境变量提供第三方模型接入，但兼容程度、可用功能和数据处理方式由服务商决定，不能默认与 Claude 模型完全一致。本文记录的是 GLM-5.1 当时的使用过程。

目前，GLM-5.2 也发布了，后续还会发布更新的模型。不过，接入方法以及编码实战都是一致的，不受模型影响。

我选了两个比较有代表性的复杂场景来验证：

- **场景一**：从零搭建一个基于 Arthas 的 JVM 智能诊断 Agent，涵盖技术选型、架构设计、编码落地的完整流程
- **场景二**：在百万级数据量的既有订单系统中定位并治理慢查询，考验 AI 对现有代码库的理解和增量优化能力

一个是从零开始的工程交付，另一个是面对既有系统的性能治理，正好覆盖 AI 辅助编程的两种典型工作模式。

## 环境准备：Claude Code 接入第三方模型

在正式开始之前，需要完成 Claude Code 与第三方模型的对接。整个配置过程分三步：

**第一步**：安装 Claude Code

```bash
npm i -g @anthropic-ai/claude-code@latest
```

**第二步**：安装 cc-switch 完成模型切换（macOS 用户可通过 homebrew 安装，详情参考 cc-switch 官方文档：<https://github.com/farion1231/cc-switch/blob/main/README_ZH.md>）

**第三步**：按照模型提供方的说明，完成 Claude Code 内部模型环境变量与目标模型的对应关系配置。以 GLM-5.1 为例，参考：<https://docs.bigmodel.cn/cn/coding-plan/tool/claude>

配置过程截图如下：

点击加号添加模型：

![点击添加模型](https://oss.javaguide.cn/ai/coding/glm5.1-cc/add-model-entry.png)

选择对应的模型：

![选择模型](https://oss.javaguide.cn/ai/coding/glm5.1-cc/select-model.png)

配置参数：

![配置参数](https://oss.javaguide.cn/ai/coding/glm5.1-cc/config-params.png)

Claude Code 内部模型环境变量与目标模型对应关系的 JSON 配置：

![Claude Code 内部模型环境变量与模型对应关系 JSON 配置](https://oss.javaguide.cn/ai/coding/glm5.1-cc/model-env-json-config.png)

如果你更偏向页面开发，推荐通过 VSCode + Claude Code for VS Code 方式进行交互和编码验收。完成插件安装之后，可以直接在 IDE 中与模型对话和代码审查，相对于 CLI 界面会更直观一些：

![VSCode + Claude Code for VS Code](https://oss.javaguide.cn/ai/coding/glm5.1-cc/vscode-claude-code.png)

## 场景一：从零搭建 JVM 智能诊断 Agent

### 为什么需要 JVM 智能诊断助手？

JVM 线上诊断一直以来都是 Java 开发最棘手的问题。在传统开发模式下，面对性能瓶颈或线上故障，研发人员的排查路径基本固定：

1. 查看 Grafana 监控面板，初步定位异常方向
2. 登录线上服务器，排查 CPU、内存、GC 等各项指标
3. 明确 Java 应用层面的问题后，启动 Arthas 执行一系列诊断指令，逐步缩小问题范围
4. 定位到具体代码段，分析根因并制定修复方案

在 AI 出现以前，这套流程虽然繁琐，但确实是最直接有效的手段。但随着业务越来越复杂，故障响应时效要求也越来越高，传统模式的弊端越来越明显：

- **监控指标过于主观**：面对 CPU 飙升、内存泄漏、OOM 等千奇百怪的问题，监控面板上的指标繁多，研发人员往往依赖经验做主观推断，缺乏系统化的诊断方法论
- **诊断链路过于冗长**：从 Grafana 面板到线上服务器再到 Arthas 诊断，整个排查链路涉及多个工具的切换和衔接，不仅耗时，对于紧急的线上故障止血来说显得非常低效
- **高度依赖工程师经验**：Arthas 确实是一款强大的 JVM 诊断利器，内置各种增强指令可以深入字节码查看运行时细节。但代价是开发人员必须熟悉各种指令参数和推理路径，才能准确完成问题定位

随着 Agent 和 Skill 等能力逐渐成熟，笔者有了一个工程化构想：把诊断经验整理成可审计的步骤，让 AI 根据故障现象选择只读诊断流程，收集证据并生成候选原因。连接生产实例、执行命令和确认根因仍需要明确的权限与人工控制，不能只由“服务名 + 故障表象”驱动。

### 需求交付与架构设计

有了构想之后，接下来就是技术选型和方案落地。笔者将完整的需求描述交给 AI：

```bash
研发一款基于Arthas的智能体诊断工具，该工具需实现以下核心功能：
1. 当用户输入线上故障服务名称及具体故障现象后，系统能够自动定位至目标故障服务器，主动对目标服务进行实时监控与深度分析。
2. 通过集成Arthas的反编译功能，精准定位到引发故障的具体代码段
3. 基于分析结果生成包含问题根因、代码修复建议及实施步骤的完整解决思路。

请提供该工具的技术选型方案，包括但不限于开发语言（优先考虑Java技术栈）、核心框架、数据库表设计、部署架构等，并设计详细的系统实现方案，涵盖功能模块划分、数据流程设计、关键技术难点及解决方案等内容。
```

AI 收到需求后，没有立刻开始写代码，而是先根据空项目整理出一份分阶段技术方案。它适合用来生成待评审的路径，但方案是否安全、是否符合现有运维体系，仍要由开发和运维人员确认。

![AI 自主完成技术方案规划](https://oss.javaguide.cn/ai/coding/glm5.1-cc/ai-tech-plan.png)

AI 结合需求，针对 Agent 拆解出技术选型和 Arthas 集成方案的检索。从检索关键字可以看出，它在方案选取上优先考虑成熟稳定的解决方案：

![AI 检索 Agent 技术选型和 Arthas 集成方案](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-arthas-integration-research.png)

AI 检索 Arthas 官方文档后，输出了下面这份系统架构设计图。从上到下分三层：用户层输入服务名和故障现象，Agent 层由 Skill 引擎、Arthas HTTP Client 和 AI 分析引擎协同工作，最底层通过 Arthas HTTP API 对接目标服务实例。这张图覆盖了主要业务模块，但没有画出认证、审批、命令策略和审计等生产控制面，后文会单独补充：

![AI 输出的系统架构设计图](https://oss.javaguide.cn/ai/coding/glm5.1-cc/system-architecture-design.png)

AI 给出了架构图之后，还进一步拆解了 6 个核心组件的职责分工——从 AI Agent Server 的流程编排，到 Arthas HTTP Client 的会话管理，到 Skill 引擎的诊断步骤链定义，再到 AI 分析引擎的报告生成，每个组件的边界和协作关系都交代得比较清楚：

![AI 输出的核心角色分工表](https://oss.javaguide.cn/ai/coding/glm5.1-cc/core-component-roles.png)

最后看数据流设计。AI 结合一个常见的 RT 超时场景，给出了从 Skill 匹配、诊断步骤执行到报告输出的链路。这里采用的 `init_session → async_exec → pull_results → interrupt_job → close_session` 会话流程与 [Arthas HTTP API](https://arthas.aliyun.com/doc/http-api.html) 的异步作业模型一致，可以管理持续输出的异步命令。`watch`、`trace` 等命令会增强目标类，不能因为“不修改业务数据”就当作普通只读查询。评审重点不应停留在“这个 API 是否由 AI 编造”，而应继续检查命令分级、会话清理、超时和安全控制：

![AI 输出的数据流设计](https://oss.javaguide.cn/ai/coding/glm5.1-cc/data-flow-design.png)

Arthas HTTP API 可以直接接收诊断命令，官方也提供了[认证配置](https://arthas.aliyun.com/doc/auth.html)。因此，这个 Agent 在进入生产环境前至少需要补齐以下控制：

1. **身份与网络边界**：启用 Arthas 认证，把诊断入口放在隔离网络内；Agent 使用独立服务身份和最小权限凭据，不能把账号、口令交给模型。
2. **目标实例白名单**：服务名只能解析到经过登记的实例，禁止用户或模型传入任意 IP、端口和 URL；生产与测试环境使用不同凭据和策略。
3. **命令白名单**：默认只开放经过评审、不会做字节码增强的只读诊断模板。类名、方法名等动态参数必须按类型和长度校验，禁止把模型生成的字符串直接作为 Arthas 命令执行。
4. **高风险操作审批**：`watch`、`trace`、`tt` 等动态增强命令默认禁用。确需执行时使用受审模板并走人工审批，限制执行次数、最大运行时间、采样范围和输出量；OGNL 表达式只能从白名单模板生成，任务结束后确认增强已撤销。其他可能改变运行状态、产生高负载或暴露敏感数据的操作同样需要短时授权和双人复核。
5. **资源保护**：为每个实例设置超时、并发上限、速率限制和熔断；持续型命令必须设置最大运行时间，并保证 `interrupt_job` 与 `close_session` 在异常路径也会执行。
6. **审计与脱敏**：记录发起人、目标实例、模板、实际参数、开始/结束时间和结果摘要；日志、反编译代码和报告进入模型前先做密钥、个人信息和业务数据脱敏。

扩展方向也应受同一边界约束。比如“告警联动”可以自动创建诊断任务，但不应绕过审批自动执行任意命令；“自动修复补丁”只能生成候选 Diff，不能直接修改生产实例。

![AI 给出的后续扩展建议](https://oss.javaguide.cn/ai/coding/glm5.1-cc/extension-suggestions.png)

### 编码交付与工程结构

确认方案没有问题后，笔者直接下达开发指令：

```bash
整体方案没有问题，请完成开发工作吧
```

AI 收到指令后，开始自主编码。按照之前的架构设计，逐模块推进——从父 POM 和 Maven 多模块骨架搭建，到通用工具类、数据模型、数据访问层、Arthas 客户端封装、Skill 引擎、AI 分析引擎、业务逻辑层、Web 控制器，直到启动模块和部署配置，11 个子步骤全部完成：

![AI 自主编码过程](https://oss.javaguide.cn/ai/coding/glm5.1-cc/ai-coding-process.png)

片刻之后，AI 生成了 9 个模块、46 个文件的候选实现，覆盖通用工具类、7 个诊断 Skill、Arthas HTTP API 客户端和 Spring AI Alibaba 分析器。文件数量只能说明交付范围，不能说明安全性和正确性：

![AI 完成编码后输出的交付清单](https://oss.javaguide.cn/ai/coding/glm5.1-cc/delivery-checklist.png)

先看整体模块结构，AI 按照 Java 多模块的标准规范完成了工程划分，从上到下严格遵循 common→model→dal→client→skill→ai→service→web→bootstrap 的依赖层级，命名规范统一。

agent-skill 模块值得关注，AI 设计了 Skill 引擎的抽象接口，并内置了 7 个覆盖常见 JVM 故障场景的诊断技能（CPU 飙高、OOM、死锁、慢接口、GC 异常、线程泄漏、类找不到），每个 Skill 都定义了完整的诊断步骤链。这种“框架 + 内置实现”的设计思路，扩展性不错：

```bash
jvm-ai-agent/
├── jvm-ai-agent-server/                 # 智能体服务端（核心）
│   ├── agent-common/                    # 通用模块：工具类、常量、DTO
│   ├── agent-model/                     # 数据模型：实体、数据库映射
│   ├── agent-dal/                       # 数据访问层：Mapper、Repository
│   ├── agent-arthas-client/             # Arthas HTTP API 客户端封装
│   ├── agent-skill/                     # Skill 引擎（诊断方法论）
│   ├── agent-ai/                        # AI 分析引擎
│   ├── agent-service/                   # 业务逻辑层（含服务实例查询）
│   ├── agent-web/                       # Web 层：REST API、WebSocket
│   └── agent-server-bootstrap/          # 启动模块
│
└── pom.xml                              # 父 POM
```

再看诊断核心逻辑，`executeDiagnosis` 按照 Skill 匹配、实例定位、诊断链执行、结果分析和报告生成推进。原实现还允许从 Arthas 输出提取变量并拼接后续命令；生产实现必须把命令固定在受审模板中，只允许校验后的变量替换。所谓“非关键步骤失败后继续”也要逐项定义，认证失败、目标不在白名单、超时和审计失败都不能静默跳过：

1. **Skill 匹配**：通过`DefaultSkillMatcher`根据故障现象关键词匹配最佳诊断技能
2. **实例定位**：通过`ServiceInstanceLocator`根据服务名解析目标实例 IP 和 Arthas 端口
3. **诊断链执行**：遍历经过审批的只读诊断模板，依次执行 Arthas 命令并收集结果
4. **受限参数替换**：从结果中提取类名、方法名等变量，完成格式、长度和允许范围校验后，才能注入后续模板
5. **AI 分析报告**：将全部诊断数据交给 AI 分析引擎，生成包含根因、修复建议、严重程度的结构化报告

```java
private void executeDiagnosis(DiagnosisRecord record, DiagnosisRequest request) {
    try {
        // 1. 匹配 Skill
        Optional<SkillDefinition> skillOpt = skillMatcher.findBestMatch(request.getSymptom());
        if (skillOpt.isEmpty()) {
            failDiagnosis(record, "无法匹配到合适的诊断技能");
            return;
        }
        SkillDefinition skill = skillOpt.get();
        // ......

        // 2. 定位目标实例
        ServiceRegistry instance = instanceLocator.resolveInstance(
                request.getServiceName(), request.getInstanceIp());
        // ......

        // 3. 执行诊断步骤链
        List<DiagnosticStep> chain = skill.getDiagnosticChain();
        StringBuilder allDiagnosticData = new StringBuilder();
        String decompiledCode = "";
        Map<String, String> contextVars = new HashMap<>();

        for (int i = 0; i < chain.size(); i++) {
            DiagnosticStep step = chain.get(i);
            // ...... 初始化步骤实体

            try {
                // 只解析预先审核的命令模板；变量必须经过类型和白名单校验
                String command = resolveCommand(step, contextVars);
                // ......

                // 执行Arthas命令并记录耗时
                String result = executeStep(host, port, step, command);

                // 如果是 jad 结果，记录为反编译代码
                if ("jad".equals(step.getResultType())) {
                    decompiledCode = result;
                }

                // 从结果中提取上下文变量供后续步骤使用
                extractContextVars(result, contextVars);
            } catch (Exception e) {
                // 仅允许明确标记为非关键的只读步骤失败后继续
                // ......
            }
        }

        // 4. AI 分析
        String report = diagnosisAnalyzer.analyze(
                request.getSymptom(), allDiagnosticData.toString(), decompiledCode, skill);

        // 5. 保存报告（从Markdown报告中提取根因、严重程度等结构化字段）
        // ......

        // 6. 更新诊断记录状态
        record.setStatus(DiagnosisStatus.COMPLETED.getCode());
        // ......
    } catch (Exception e) {
        failDiagnosis(record, e.getMessage());
    }
}
```

### Agent 交互页面集成

在 AI 编码期间，笔者查阅了 Spring AI Alibaba 的官方文档，发现它提供了现成的 Agent Chat UI。与其让 AI 从头生成前端页面，不如直接集成这个交互组件，实现 SSE 流式输出的诊断体验。于是笔者给了一条简短的指令：

```bash
根据 Spring AI Alibaba 官方文档（参考链接 https://java2ai.com/docs/frameworks/studio/quick-start/），实现 Agent 智能体交互页面开发工作
```

只给了一个文档链接和一句话，AI 就自己去读官方文档、理解集成步骤、完成了页面开发。这也是使用 AI 辅助编程的一个实用技巧：当你只需要集成某个现成组件时，直接给出文档链接往往比详细描述需求更高效。

![AI 完成 Agent Chat UI 页面集成](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-chat-ui-integration.png)

到这里，本地演示所需的主要链路已经生成。它还不是可以直接部署到生产的诊断平台；除了功能测试，还要补齐前述安全控制、故障注入和负载保护。为了验证基本流程，笔者在本地起了一个 CPU 飙升的测试接口：

```java
@Slf4j
@RestController
public class TestController {
    @RequestMapping("cpu-100")
    public  void cpu() {
        while (true){
        }
    }
}
```

启动 Agent 服务，访问 `http://localhost:{应用端口}/chatui/index.html`，在聊天框输入：`order-service 程序CPU飙升,请协助排查`。在这个本地受控样例中，Agent 先通过 Dashboard 获取概览，再根据线程栈定位代码，并用 `jad` 输出反编译结果，最后生成诊断报告。报告是待复核结论，不能仅凭模型输出直接处置线上故障：

![Agent 诊断效果演示](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-diagnosis-demo.png)

## 场景二：百万级数据量下的慢查询治理

场景一验证的是 AI“从 0 到 1 的规划与交付能力”，那场景二要验证的就是另一个维度：**在一个已有一定复杂度的代码库中，AI 能否准确理解既有架构、定位问题、并完成增量优化。**

### 问题定位：搜索接口耗时 18 秒

这是一个基于 Spring Boot + MyBatis 的订单查询服务（glm-testing-service），核心业务围绕订单的查询和分析展开，包含四个接口：

| 接口         | 路径                           | 说明                                 |
| ------------ | ------------------------------ | ------------------------------------ |
| 用户订单查询 | POST /api/orders/user          | 按用户 ID 查询订单列表，支持状态筛选 |
| 订单搜索     | POST /api/orders/search        | 按时间区间+金额+商品关键词搜索订单   |
| 品类销售统计 | GET /api/orders/category-stats | 按订单状态统计各品类销售汇总         |
| 组合条件筛选 | POST /api/orders/filter        | 按用户+多状态+多品类组合筛选         |

数据库中灌入了百万级测试数据，对应的表结构如下：

```sql
CREATE TABLE `orders` (
    `id`           BIGINT PRIMARY KEY AUTO_INCREMENT,
    `order_no`     VARCHAR(64)  NOT NULL,
    `user_id`      BIGINT       NOT NULL,
    `status`       TINYINT      NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `product_name` VARCHAR(256) NOT NULL,
    `category`     VARCHAR(64)  NOT NULL,
    `create_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_category` (`category`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

项目通过 AOP 切面自动记录每个接口的执行耗时，用于快速定位性能瓶颈：

```java
@Around("controllerPointcut()")
public Object printExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    long startTime = System.currentTimeMillis();
    Object result = joinPoint.proceed();
    long costTime = System.currentTimeMillis() - startTime;
    log.info("[{}] {}.{} 耗时: {}ms", Thread.currentThread().getName(), className, methodName, costTime);
    return result;
}
```

向数据库灌入百万级测试数据后，对搜索订单接口进行压测。该接口涉及关键词模糊匹配+时间区间+金额过滤的组合查询，例如下面这个搜索请求：

```bash
curl -X POST http://localhost:8080/api/orders/search \
  -H "Content-Type: application/json" \
  -d '{"startTime": "2025-01-01", "endTime": "2026-12-31", "minAmount": 500, "productName": "蓝牙", "pageNum": 1, "pageSize": 10}'
```

系统日志直接输出了刺眼的慢查询告警：

```bash
[http-nio-8080-exec-1] OrderController.searchOrders 耗时: 18375ms
```

`LIKE '%蓝牙%'`的全表扫描导致接口耗时近 18 秒，当前业务接口的实现性能完全无法满足线上要求：

![搜索接口耗时 18 秒的调测结果](https://oss.javaguide.cn/ai/coding/glm5.1-cc/search-api-18s-result.png)

### 分析与优化方案设计

笔者直接将系统日志中的慢查询告警丢给 AI，让其结合项目既有代码完成推理分析和优化方案设计：

```bash
针对系统日志中记录的"[http-nio-8080-exec-1] OrderController.searchOrders 耗时: 18375ms"这一慢查询接口问题，对订单业务进行全面梳理分析并提供优化建议。
```

AI 定位到目标业务代码，结合 SQL 和表结构，从索引设计维度给出了系统性的解决方案：

![AI 给出的慢查询解决方案](https://oss.javaguide.cn/ai/coding/glm5.1-cc/slow-query-solution.png)

同时给出了分阶段优化建议和预期效果：

![AI 给出的分阶段优化建议](https://oss.javaguide.cn/ai/coding/glm5.1-cc/phased-optimization-suggestions.png)

确认方向没问题后，笔者给出最终优化指令：

```bash
请结合项目现有技术栈，对慢查询模块进行系统性优化
```

AI 逐个梳理了每个接口的业务逻辑和查询细节。优化步骤自底向上，从数据库层面推进到应用层面，方案涵盖以下几个关键点：

**数据库层面**——AI 给出的 5 个候选索引：

- 全文索引`ft_product_name`（ngram 解析器，支持中文分词）替代`LIKE '%xxx%'`全表扫描
- 复合索引`idx_create_time_amount`尝试支持时间、金额过滤与排序
- 候选覆盖索引`idx_search_covering`尝试减少 COUNT 查询的回表
- 组合索引`idx_user_status_category`优化多条件筛选
- 覆盖索引`idx_status_category_amount`优化品类聚合统计

```sql
ALTER TABLE `orders` ADD FULLTEXT INDEX `ft_product_name` (`product_name`) WITH PARSER ngram;
ALTER TABLE `orders` ADD INDEX `idx_create_time_amount` (`create_time` DESC, `total_amount`);
ALTER TABLE `orders` ADD INDEX `idx_search_covering` (`create_time`, `total_amount`, `product_name`);
ALTER TABLE `orders` ADD INDEX `idx_user_status_category` (`user_id`, `status`, `category`);
ALTER TABLE `orders` ADD INDEX `idx_status_category_amount` (`status`, `category`, `total_amount`);
```

**应用层面**——SQL 和 Service 层同步优化：

- 将`LIKE '%xxx%'`搜索语义迁移为`MATCH ... AGAINST`全文检索
- 深分页场景自动切换延迟关联（Deferred Join），通过覆盖索引子查询先定位主键再回表
- 按需 COUNT：默认不查总数，仅前端显式传`needTotal=true`时才执行

下面是 AI 输出的索引优化方案。复合索引是否有效取决于最左前缀、过滤选择性、排序方式和优化器选择；全文索引也会增加写入与存储成本。执行 DDL 前应使用真实 SQL 和数据分布运行 `EXPLAIN ANALYZE`，并删除功能重叠或收益不足的索引。可参考 [MySQL 多列索引](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html)与 [ngram 全文索引](https://dev.mysql.com/doc/refman/8.4/en/fulltext-search-ngram.html)文档：

![AI 输出的索引优化 SQL 脚本](https://oss.javaguide.cn/ai/coding/glm5.1-cc/index-optimization-sql.png)

从代码 diff 可以看到，AI 在既有代码中将`LIKE`模糊查询替换为全文检索。这不是透明的性能替换：分词、停用词、短词、子串匹配和默认排序都可能变化。上线前要用真实搜索样本验收中文分词、短词、特殊字符和排序结果，并为需要保留的旧语义设计兼容路径：

![AI 在既有代码中完成增量优化](https://oss.javaguide.cn/ai/coding/glm5.1-cc/incremental-code-optimization.png)

对于深分页的问题，AI 结合当前百万级数据量给出了具体的分页阈值——当 offset 超过 1000 时自动切换为延迟关联查询（Deferred Join），浅分页走普通查询，深分页走覆盖索引子查询先定位主键再回表：

```java
/** 深分页阈值：offset 超过此值时自动切换为延迟关联查询 */
private static final int DEEP_PAGE_THRESHOLD = 1000;

// 深分页（offset > 1000）走延迟关联，浅分页走普通查询
boolean isDeepPage = offset > DEEP_PAGE_THRESHOLD;
List<Order> orders;
if (isDeepPage) {
    orders = orderMapper.searchOrdersDeepPage(...);
} else {
    orders = orderMapper.searchOrders(...);
}
```

`1000` 只是这次生成的初始阈值，不能因为数据量是百万级就认定它合理。行宽、过滤选择性、索引覆盖、排序方式和接口 SLO 都会影响拐点；应分别压测不同 offset，观察扫描行数和 p95/p99，再确定是否切换延迟关联。若产品允许，基于稳定排序键的游标分页通常更值得优先评估。

![AI 针对深分页场景基于阈值自动切换查询策略的代码实现](https://oss.javaguide.cn/ai/coding/glm5.1-cc/deep-pagination-threshold-code.png)

全部优化完成后，AI 输出了最终的优化效果总结，涵盖各接口的优化前后对比：

![AI 输出的最终优化效果总结](https://oss.javaguide.cn/ai/coding/glm5.1-cc/optimization-summary.png)

### 优化效果验证

完成改造后再次请求接口，这张截图记录到一次预热后的耗时低于 300ms；与原先的 18375ms 相比，这一次请求约快 60 倍。单个前后截图不能证明“稳定低于 300ms”：要形成可复现结论，还需说明硬件、MySQL 版本与配置、数据分布、缓存冷热、并发量和样本数，并报告 p50/p95/p99 与错误率。

![优化后接口耗时降至 300ms 以内](https://oss.javaguide.cn/ai/coding/glm5.1-cc/optimized-api-300ms.png)

## 实战总结

通过两个场景的实战，总结一下 Claude Code + 第三方模型辅助编程的经验和思考。

### AI 辅助编程能做什么

| 能力维度         | 场景表现                                            | 说明                                     |
| ---------------- | --------------------------------------------------- | ---------------------------------------- |
| 需求到架构的规划 | 场景一：给出需求描述，AI 自主完成技术选型和架构设计 | 适合快速验证构想，但方案仍需人工评审     |
| 端到端编码交付   | 场景一：9 个模块 46 个文件自主交付                  | 从骨架搭建到业务逻辑，减少重复编码工作量 |
| 既有代码增量优化 | 场景二：在百万级数据量的项目中定位慢查询并优化      | 能结合表结构和 SQL 给出分阶段优化方案    |
| 参数候选生成     | 场景二：结合数据量给出分页阈值初值                  | 阈值仍需基准测试和执行计划验证           |

### 实战中需要注意的地方

**做得好的地方**：

- **快速形成评审材料**：场景一中，模型较快生成了技术方案和架构草图，适合作为评审起点
- **多层级方案输出**：慢查询场景中，数据库层面的索引优化和应用层面的 SQL 重构同步推进，覆盖比较全面
- **给出可测试的参数**：场景二给出了深分页阈值初值，后续可以据此设计基准测试

**需要注意的地方**：

- **生产安全需要单独设计**：Arthas 会话流程本身有官方依据，真正不能遗漏的是认证、实例与命令白名单、审批、限流和审计
- **长链路执行中偶尔断链**：在复杂的持续编码任务中，AI 有时会在后半程遗忘前面的设计约束。建议将复杂任务拆分成明确的阶段，每个阶段独立确认
- **代码风格与工程规范**：生成的代码结构合理，但与个人/团队既有规范的契合度需要磨合。场景一中有部分命名和文件组织就需要手动调整
- **方案选择的权衡**：AI 会给出多个方案，但不会替你做权衡。比如场景二中全文索引 vs ES 的选择、延迟关联 vs 游标分页的取舍，这些需要根据业务场景判断

### 使用 Claude Code + 第三方模型的一些建议

1. **需求描述要具体**：场景一中完整的需求 prompt 直接决定了架构方案的质量，模糊的需求只会得到模糊的方案
2. **分阶段确认**：复杂项目不要一次性让 AI 从头到尾生成，技术选型 → 架构设计 → 编码实现，每个阶段独立评审
3. **关键决策人工把控**：架构层面的选择（如缓存策略、分页方案）需要根据业务场景判断，AI 无法替你做
4. **善用文档链接**：当需要集成某个现成组件时（如场景一的 Spring AI Alibaba），直接给出文档链接比详细描述需求更高效

## 写在最后

Claude Code 接入第三方模型后，在 Agent 模式下的上下文理解、任务拆解、代码生成形成了比较完整的工作流。两个场景跑下来，AI 辅助编程确实能缩短“从想法到代码”的时间。

但工具终究只是工具。回顾本文的两个场景：

- **场景一中的 JVM 智能诊断 Agent**，需要理解 Arthas 会话生命周期和 JVM 诊断方法论，更要把生产权限边界设计清楚。模型只能生成候选步骤，不能获得任意目标和任意命令的执行权。

- **场景二中的慢查询治理**，需要对 MySQL 索引原理、全文检索机制、深分页优化策略有深入理解，才能判断 AI 给出的优化方案是否适用于你的业务场景——比如全文索引在写入频繁的场景下可能带来性能损耗，延迟关联的阈值需要根据实际数据量调整。

AI 编程工具正在改变开发者的工作方式——从“写代码的人”变成“评审代码的人”。用好 AI 的前提，是比 AI 更懂你在做什么。

## 参考

- GLM Coding Plan 模型切换说明：<https://docs.bigmodel.cn/cn/coding-plan/using5-1>
- Claude Code 安装指南：<https://docs.anthropic.com/en/docs/claude-code>
- cc-switch 模型切换工具：<https://github.com/farion1231/cc-switch>
- Spring AI Alibaba Agent Chat UI 文档：<https://java2ai.com/docs/frameworks/studio/quick-start/>
- Arthas 官方文档：<https://arthas.aliyun.com/doc/>
- Arthas HTTP API：<https://arthas.aliyun.com/doc/http-api.html>
- Arthas 认证配置：<https://arthas.aliyun.com/doc/auth.html>
