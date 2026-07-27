---
title: MiniMax M3 + Claude Code 实战：Redis 故障排查、SCAN 算法复刻与监控面板搭建
description: 通过 MiniMax M3 接入 Claude Code，完成线上 Redis SCAN 故障排查与降级、SCAN 游标算法从 C 到 Go 的跨语言复刻、以及前后端 Redis 监控面板搭建三个实战案例。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: MiniMax M3,Claude Code,AI编程,Redis SCAN,故障排查,监控面板,跨语言复刻,Agent Coding,cc-switch
---

你好，我是小 G。MiniMax M3 前几天发布了，不少朋友第一时间用上，反馈都还不错，也有不少朋友留言让我实测一波。

不是不想测，前几天确实太忙了，想赶在秋招之前对 JavaGuide 进行一波优化，这是每一年都会做的事情。

![读者留言希望实测 MiniMax M3](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/image-20260604122811898.png)

根据 MiniMax 官方介绍，M3 是其首个同时提供 1M 上下文、原生多模态和前沿 Coding 能力的开放权重模型。这是厂商对产品的定位，是否适合具体代码库仍要靠任务验证。

官方公布的基准结果包括：SWE-Bench Pro 59.0%、Terminal-Bench 2.1 66.0%、MCP Atlas 74.2%。这些数字对应指定评测集和评测配置，不是本文独立复测结果。

![MiniMax M3 官方能力介绍：Coding Frontier/SOTA + 1M 上下文 + 原生多模态](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/HJsWydIbIAAFAZL.jpeg)

我更关心它进入真实工程后的表现。

因此，我用一个过去遇到的线上故障来检验。已知现象是业务高峰期前台请求受影响，排查线索指向后台异步任务中的完整 Redis `SCAN` 循环；它是否因长期占用连接而构成主因，还要结合监控和复现验证。

该案例涉及复杂业务链路推理和全局诊断。同时，我会在完成故障定位和止血后，继续用 M3 尝试 Redis 源码（C）到 Go 的功能复刻、以及前后端 Redis 监控面板搭建，从异构语言重构和全链路交付两个维度继续观察。

文章按三个任务展开：

1. 故障排查
2. 底层复刻
3. 监控落地

## 准备工作

小 G 日常使用 Claude Code 开发，通过 cc-switch 统一管理模型。以下为 MiniMax M3 的配置步骤。首先打开 cc-switch 点击加号添加模型配置：

![cc-switch 点击加号添加模型配置](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/cc-switch-add-model.png)

选择 MiniMax M3，将自己的 key 填充到 api key 选项中：

![选择 MiniMax M3 并填入 API Key](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/cc-switch-select-minimax-m3.png)

最后点击获取模型列表，完成模型的配置，以我的为例，直接将主模型设置为 MiniMax M3：

![获取模型列表并将主模型设置为 MiniMax M3](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/cc-switch-set-main-model.png)

配置完成后打开 Claude Code，通过对话面板验证当前模型是否生效：

![在 Claude Code 中验证 MiniMax M3 模型已生效](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/claude-code-verify-model.png)

## 故障排查：围绕应用层 SCAN 循环验证性能问题

第一个案例复刻自我过去经历过的一次线上故障。为降低理解负担，这里用一个经典的电商场景来还原：该场景是大促期间“超时订单自动取消”的异步任务在跑，同时大量用户正在浏览商品。某一刻，页面大面积超时——已售、库存、浏览、收藏，所有热点数据全加载不出来：

![大促期间页面大面积超时，商品热点数据加载失败](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/ecommerce-page-timeout.png)

为了评测 MiniMax M3 对于这类复杂业务链路的排查能力，我将系统表象的截图（Claude Code 中可通过 Ctrl+V 粘贴截图，Win 系统为 Alt+V）和错误描述一并提交：

![将故障表象截图和错误描述一并提交给 M3](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/submit-error-to-m3.png)

经过片刻分析，MiniMax M3 将问题定位到后台任务中的完整 `SCAN` 循环。它最初把原因概括成“SCAN 导致 Redis 服务端阻塞”，这个说法不够准确：`SCAN` 单次调用是增量迭代，设计目的正是避免 `KEYS` 一类长时间阻塞；真正需要检查的是循环次数、`COUNT`、Keyspace 大小、单次延迟，以及应用是否长期占用连接。

![M3 定位到根因：SCAN 操作导致 Redis 阻塞，引发读写排队](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/m3-root-cause-scan-blocking.png)

为进一步核对业务链路，我要求 MiniMax M3 用 ASCII 图画出故障过程。图里从超时订单任务进入 `SCAN` 循环，再到连接池可用连接下降和页面请求排队。这里应把“Keyspace 遍历阻塞主线程”理解为需要验证的假设，而不是 `SCAN` 的固定行为：

![M3 绘制的故障流转链路 ASCII 图：从 SCAN 触发到页面超时的端到端因果链](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/fault-chain-ascii-diagram.png)

M3 随后给出数据结构调整、原子操作、降级和监控四类建议：

![M3 从数据结构、原子性、降级、监控四个维度同时给出修复建议](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/m3-four-dimension-fix.png)

针对受影响的业务接口，M3 将串行 Redis 指令优化为一条原子操作，并附上降级策略，以控制极端情况下的影响面：

![串行 Redis 指令优化为一条原子操作，并附上降级策略](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/atomic-operation-optimization.png)

在工程侧，M3 还给出了监控埋点建议，并把 200 ms 作为示例告警值。这个数字不能用“人类感知停顿”来证明；Redis 后台任务的阈值应根据接口 SLO、连接池容量、任务频率和历史分位延迟确定：

![监控埋点建议与告警阈值：SCAN 操作红线设为 200ms](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/monitoring-alert-thresholds.png)

以下是本次修改的 diff：

![修复代码的 diff，M3 在实现中体现了降级和监控的设计理念](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/fix-code-diff.png)

以下为核心降级代码。M3 使用并发原子类处理了部分并发状态，但这只能保证对应变量或单次操作的原子性，不能证明 Redis、本地缓存和数据库回源组成的整条链路线程安全或一致。缓存击穿、重复回源和旧值覆盖仍要通过同步协议、限流以及并发测试验证：

![核心降级代码：使用并发原子类保障多级缓存操作的线程安全](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/degradation-code-atomic.png)

M3 同时生成了覆盖正常降级、异常回退和并发竞态的测试。截图显示相关用例编译通过、单测全绿；“100% 逻辑覆盖”只代表被统计代码的覆盖率，不能证明所有故障场景都已验证：

![M3 附带的测试用例：覆盖正常降级、异常回退和并发竞态，编译通过、单测全绿](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/test-cases-all-pass.png)

## 深入底层：复刻 Redis SCAN 游标算法，理解 rev 二进制翻转

近期 Google 技术总监 Addy Osmani 在《Don't Outsource the Learning》一文中提出了一个值得警惕的现象：让 AI 写代码而自己跳过学习太容易了——错误被修复，但你的心智模型没有进步。他引用了 Anthropic 的一项随机实验：同样是学习新库，AI 辅助组完成任务的速度与手动组持平，但后续理解测试中得分仅为 50%，远低于手动组的 67%。有趣的是，AI 组内部也存在分化——用 AI 提问概念问题的工程师得分超过 65%，直接复制粘贴代码的则不到 40%。Osmani 的结论是：工具不会替你学习，区别在于你的使用方式：

![Addy Osmani《Don't Outsource the Learning》核心观点：工具不会替你学习，区别在于你的使用方式](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/addy-osmani-dont-outsource-learning.png)

回到本次事故。故障排查和降级止血是第一步，但要理解 `SCAN` 如何遍历 dict、`COUNT` 的真实含义，以及 rev 二进制翻转如何推进游标，还得继续读文档和源码。官方文档已经说明 `COUNT` 只是工作量提示，源码则能解释具体版本如何实现。我借助 MiniMax M3 复刻 `SCAN` 的核心算法，再把结果放进好友 sharkchili 维护的 mini-redis 学习项目中验证。

为了提供充足的上下文，我直接将 Redis SCAN 相关的源码文件通过 add-dir 传入 mini-redis 项目：

![通过 add-dir 将 Redis SCAN 相关源码文件传入 mini-redis 项目](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/add-dir-redis-source.png)

然后直接键入需求。M3 扫描传入的 Redis 源码后，判断这是一个长任务，调用了 plan-with-files 技能进行任务拆解和规划：

![M3 自主调用 plan-with-files 技能进行任务拆解和规划](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/m3-plan-with-files-skill.png)

规划完成后，M3 主动发起澄清。第一点是确认需求范围，我选择复刻 SCAN 指令：

![M3 主动发起需求澄清，确认复刻 SCAN 指令的范围](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/m3-clarify-requirements.png)

第二点是算法选型。M3 发现 mini-redis 已经复刻了 Redis 的 dict 数据结构，而不是直接使用 Go 原生 map，于是建议在现有 dict 上复刻游标推进。这能保留 Redis 算法的主要行为和学习价值。至于哈希桶顺序、内存局部性和性能是否一致，还取决于 Go 实现的数据布局和运行时，不能直接由数据结构名称推出：

![M3 推荐完整复刻 Redis SCAN 游标实现，基于已有 dict 而非另起 Go map](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/algorithm-selection-dict-vs-map.png)

经过多轮的交互和澄清之后，我们得出如下规划：

![多轮澄清后的最终复刻规划](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/final-replication-plan.png)

方案对齐后，M3 自底向上逐层完成函数实现，先搭好 dict 遍历的基础框架，再衔接游标推进和参数解析，最后更新了项目的 README 计划表：

![M3 自底向上逐层完成函数实现，并主动更新项目 README 计划表](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/m3-bottom-up-implementation.png)

最终交付的代码结构如下。SCAN 实现覆盖了 match、count 参数解析以及游标循环逻辑：

![M3 生成的 SCAN 实现代码结构：覆盖 match、count 参数解析和游标循环逻辑](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/scan-implementation-code.png)

通过这次复刻结合代码注释，我看到了 `SCAN` 的一个实现细节：当前 Redis 源码在 `scanGenericCommand` 中将 `count × 10` 设为最大迭代次数，用于限制稀疏哈希表上的单次工作量。它不是把“实际遍历桶数量固定扩大十倍”，也不保证凑够 `COUNT` 个返回值：

![dictScan 将实际遍历桶数量扩大到 count × 10 的细节](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/dict-scan-count-detail.png)

其中一个值得注意的细节：Go 语言中 `^` 同时承担异或（XOR）和按位取反（NOT）两种语义，而 C 语言中两者分别是 `^` 和 `~`。rev 算法涉及大量二进制翻转操作，每一步都必须精确区分“翻转某一位”和“翻转整个二进制数”——语义搞混一步，游标推进就会全部跑偏。这部分需要重点 Review，确认 M3 有没有把 `~` 机械替换为 `^`：

![M3 手写 rev 算法时精确区分 Go 语言 ^ 运算符的异或和取反两种语义](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/go-xor-not-semantics.png)

基于上述实现质量，编译和单测均一次通过：

![SCAN 复刻代码编译和单测均一次通过](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/scan-test-pass.png)

## 学以致用：构建轻量级 Redis 监控面板

完成止血和复盘之后，还需要针对既有架构补上监控能力，确保后续能实时观测 Redis 运行状态，并在问题复发时快速定位和止血。

这个环节我把既有工程作为上下文传入一个新项目，让 M3 从零设计并实现一套可视化的 Redis 监控面板，看看它在前后端全链路交付上的表现。

![将既有工程作为上下文传入新项目，让 M3 从零设计 Redis 监控面板](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/build-redis-monitor.png)

经过简单的问题澄清后，M3 给出了监控系统的架构 ASCII 图，理清了数据流向：

1. 采集层（埋点上报）
2. 缓冲层（环形缓冲区削峰）
3. 展示层（HTTP 接口 + 前端面板）

三层之间职责清晰，耦合度低：

![M3 给出的监控系统三层架构 ASCII 图：采集层、缓冲层、展示层](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/monitor-three-layer-architecture.png)

代码结构：

![监控面板项目的代码目录结构](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/monitor-code-structure.png)

尽管是 MVP 快速原型，底层监控埋点的环形缓冲区数据结构设计值得一看——包括预分配的固定大小数组、互斥锁保护的并发读写，以及缓冲区满时自动覆盖最旧数据：

![环形缓冲区数据结构设计：预分配固定数组、互斥锁并发保护、满时自动覆盖最旧数据](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/ring-buffer-design.png)

最终生成的监控面板如下。整体采用深色主题，布局上分成了多个面板：Redis 实例的实时状态（内存占用、连接数、QPS）、命令类型的分布统计图、以及慢查询的时间线排列：

![最终生成的 Redis 监控面板：实时状态、命令分布统计和慢查询时间线](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/monitor-dashboard-final.png)

对于 Redis 服务端，面板也针对慢查询和 key 分布进行了详尽的输出与展示，可直接用于日常观测：

![Redis 服务端慢查询和 key 分布的详细展示](https://oss.javaguide.cn/github/javaguide/ai/coding/m3/monitor-slow-query-detail.png)

## 小结

这次用 M3 做了三个任务：分析 Redis 连接池故障、把 `SCAN` 游标算法从 C 复刻到 Go，以及搭建 Redis 监控面板。真正值得保留的是任务证据和暴露出的边界：

1. 故障排查时，它给出了数据结构、原子性、降级和监控等候选方向，但对 `SCAN` 阻塞机制的最初解释不准确。
2. 底层复刻时，它识别出项目使用了自研 dict，并区分了 Go 中 `^` 的异或与取反语义；实现仍要靠源码和测试验证。
3. 监控面板覆盖了采集、缓冲和展示层，但环形缓冲区等设计取舍没有经过充分论证。

在 Redis SCAN 从 C 到 Go 的复刻中，M3 识别出项目复刻了 dict 而非使用 Go map，并在此基础上推荐完整复刻 SCAN 游标；Go 语言 `^` 运算符兼具异或和取反两种语义，这部分也做了逐行区分。

而在监控面板场景中，M3 暴露了一个值得注意的边界：from-0-to-1 阶段，它给出的架构选择是“能跑的稳妥方案”而非“经过权衡的最优方案”。以环形缓冲区为例，为什么是环形缓冲区而不是无锁队列？缓冲区满了覆盖最旧数据在高 QPS 下会不会丢关键指标？这些决策点 M3 默认了一个标准答案，没有主动提出 trade-off。如果开发者不具备相关领域的知识储备，就没法在头脑风暴阶段完成最佳方案决策——最终拿到的只是一个“能跑”的原型，而非“设计合理”的原型。

这也回到了 Addy Osmani 的观点：工具不会替你学习。M3 生成了降级代码和 rev 算法，但模型对 `SCAN` 阻塞和 `count × 10` 的解释仍需要文档、源码和压测来校正。对我来说，这次实测的价值就在这里——它能加快阅读和实现，工程结论仍要自己验。
