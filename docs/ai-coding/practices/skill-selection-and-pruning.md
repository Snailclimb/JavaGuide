---
title: 强模型时代，AI 编程 Skills 还有必要装吗？
description: 从 Codex、Superpowers 和 grilling 的实际使用出发，讨论强模型时代哪些 Skill 可以删除，哪些工作流仍然值得长期保留。
category: AI 编程实战
tag:
  - AI 编程
  - Codex
  - Skills
  - Superpowers
head:
  - - meta
    - name: keywords
      content: AI编程,Codex,Skills,Superpowers,grilling,AGENTS.md,Subagent,Plugin
---

前几天在知乎看到一个问题：**Codex 用上 GPT-5.6 后，Skills 还有多少必要？**

![关于 Codex 使用 GPT-5.6 后是否仍需要 Skills 的提问](https://oss.javaguide.cn/github/javaguide/ai/skills/zhihu-codex-gpt56-skills-question.png)

一条提问和我自己的使用变化不能代表行业趋势。更准确地说，我发现手里一部分开发类 Skill 的收益正在下降，所以想重新检查哪些该留、哪些该删。

我现在看到一个 Skill，会先看它到底能提供什么能力。如果没有确切作用的话，肯定是不会装的。

前两年，模型干活经常漏步骤，Skill 写得越细越让人安心。现在 GPT-5.6、Kimi K3、Claude Fable 5 等模型已经能完成不少基础动作，我也开始重新检查手里的 Skill。

> 下面我会以 Codex 作为 Coding Agent 为例来谈，其他都是类似的。

## 很多基础步骤已经不用单独教了

以前的开发类 Skill 经常写成一张操作清单：怎么读项目，怎么找调用链，改完代码跑哪些测试，提交 PR 前再检查什么。模型能力还不够稳定时，这些提醒确实有用。

现在让 Codex 修一处 Bug，只要现象、预期和验收标准比较清楚，它通常能自行阅读相关代码、沿着调用链定位问题，再完成实现和基础验证。项目结构复杂、测试入口特殊或者改动风险较高时，仍然要明确告诉它跑哪些检查，不能把验证完全交给模型猜。

长任务、审批和多 Agent 协作，Codex 本身也提供了对应能力。需要扩展任务流程或外部能力时，还可以使用 Skills、Plugins、MCP 和 Hooks。过去那种“不把每一步写满就容易跑偏”的情况少了很多。

![Claude Code PreToolUse Hook](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-runs-rm-rf-tmp-build-what-happens.svg)

一份 `SKILL.md` 如果没有项目特有的约束，也没有脚本、模板和检查项，只是在重复常规开发步骤，我通常不会留。它没有给模型增加多少新信息，却可能让一个小任务多走几道流程。

## Skill 装多了也有成本

Codex 不会在会话开始时读取所有 `SKILL.md` 的全文。它先拿到每个 Skill 的名称、描述和路径，任务匹配后才加载正文，这套机制叫渐进式披露。

按照 [Codex 的 Skills 文档](https://learn.chatgpt.com/docs/build-skills)，初始 Skill 列表最多使用模型上下文窗口的 2%；无法确定窗口大小时，上限是 8,000 个字符。超出预算后，Codex 会先缩短描述。数量继续增加，部分 Skill 可能被移出初始列表。

装到 100 个时，Agent 开工前看到的可能已经不是 100 份完整描述。

描述写得太宽，一个普通改动就可能命中好几份 Skill。规则发生冲突时，Codex 还要判断当前该执行哪套流程。再混进几份长期没有维护的说明，任务跑偏后很难马上找到原因。

上下文窗口变大也没有消除这个问题。旧对话、工具说明和 Skill 描述都能放进去，但项目真正重要的约束往往只有几句。内容越杂，关键要求越容易被淹没。

![上下文为什么会失效](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-does-the-following-content-fail.png)

Skill 和浏览器书签挺像。刚开始看到什么都想存，总觉得以后用得上。半年后回头一看，常用的还是那几个。

从 Skill 出来到现在，我经常使用、愿意长期维护的不到 20 个。比如写作时常用的 [draw.io 绘图 Skill](https://mp.weixin.qq.com/s/rAKCSFHB407v6fe35ix0rg)，它能固定图表样式，也能避开我反复遇到的排版问题。这类 Skill 沉淀的是个人偏好和具体经验，模型临场发挥很难一直保持同样的结果。

## 规则应该放在哪

很多 Skill 越写越大，是因为大家把所有规则都往里面塞。我现在会按规则的作用范围来分：

- 每轮任务都要遵守的项目约定，放进 `AGENTS.md` 或项目规则文件。
- 只在特定任务中使用的流程，写成 Skill。
- 耗时较长、会制造大量中间信息的支线调查，交给 Subagent。
- 需要把 Skills、Hooks、MCP 和连接器统一分发给团队，再打包成 Plugin。
- 漏一次就可能出问题的机械约束，交给 Hook、CI、linter 或测试。

规则文件管这个项目一直怎么做，Skill 管遇到某类任务时怎么做。两者混在一起，最后往往会得到一个很长、什么都想管、又很难维护的 `SKILL.md`。

Skill 可以携带脚本、参考资料和模板，在命中任务后按需加载。团队需要统一安装和分发时，再用 Plugin 把这些能力打包起来。

![渐进式披露（三层模型）](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure-three-layer-model.png)

如果想系统了解 Skill 和 Prompt、MCP、Function Calling 的分工，可以看 [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html)。这篇文章只讨论怎么选和怎么删，不重复展开技术实现。

## 为什么我很少再用 Superpowers

像 [Superpowers](https://github.com/obra/superpowers) 这类覆盖完整开发流程的 Skills 套件，我现在用得少了。

我把这个问题丢到群里聊，大家的反馈也很接近：**Superpowers 容易让小任务背上过重的流程；`grilling` 虽然会连续追问，但需求确实能收得更清楚。**

![群友讨论 Superpowers 流程过重以及 Grilling 减少返工](https://oss.javaguide.cn/github/javaguide/ai/skills/group-chat-superpowers-grilling-feedback.png)

Superpowers 提供的是一套完整的软件开发方法：先通过 brainstorming 澄清需求，再用 writing-plans 拆任务，按 test-driven-development 写测试和实现，通过 Git worktree 隔离开发，交给 Subagent 分段执行，最后做代码审查和完成前验证。

复杂项目、陌生代码库和高风险改动仍然适合这套流程。

如果只是改一处校验逻辑或者补一个很小的测试，上来就走完“需求澄清 → 设计 → 计划 → 执行 → 审查 → 验证”，时间很容易被流程本身吃掉。流程越完整，越考验启用时机；任务不够复杂时，它会从保护变成负担。

现在的 Codex 能在执行过程中调整步骤，也会在缺少关键信息时请求确认。很多小任务只需要补几条项目约束，没有必要每次都套上一整本操作手册。

第三方 Skill 还有安全风险。`SKILL.md` 本身就是给 Agent 的指令，里面如果藏了危险命令、异常脚本或过宽的权限要求，Agent 可能真的会照着做。安装前至少看一遍 `SKILL.md`、`scripts/` 和 `references/`；套件越大，越要先弄清楚它会让 Agent 做什么。

## 我更喜欢 mattpocock/skills 这种轻量组合

Superpowers 用一套完整方法覆盖开发过程，[mattpocock/skills](https://github.com/mattpocock/skills) 更像一个可以拆开使用的工具箱。

这个仓库里的 Skill 被设计成较小、容易修改、可以组合的模块。需求还没想清楚，可以用 `grilling` 追问；Bug 很难定位，再启用 `diagnosing-bugs`；需要严格走红绿重构时，单独使用 `tdd`；准备合并代码，再让 `code-review` 检查。它们不会默认要求每个任务都走完同一条流程。

这套拆法很适合现在的强模型。Codex 已经能完成的步骤，不需要再教一遍；哪个环节反复出错，就只补哪一块。任务变复杂时，再把几个 Skill 组合起来。

![群友讨论轻量 Skills 与 Superpowers 的使用体验](https://oss.javaguide.cn/github/javaguide/ai/skills/group-chat-lightweight-skills-feedback.png)

这里面我尤其喜欢 [`grilling`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)。

它的规则很短：动手前持续追问，把计划、决策和依赖关系问清楚；一次只问一个问题，等用户回答后再继续；能从环境中查到的事实自己查，需要取舍的决定再交给用户。

## 哪些 Skill 还值得留

我现在会优先保留三类 Skill。

第一类是模型很难凭空猜到的个人偏好和固定产物，例如文章风格、图表规范、公司内部模板和特定代码库的发布流程。有了这些约束，每次交付才能尽量保持同一套标准。

第二类是带有专业判断、脚本或参考资料的任务。安全审查、复杂文档处理、特定框架迁移和生产检查，只靠一句 Prompt 很难覆盖所有细节。Skill 可以把检查项、工具脚本和证据来源放在一起，用到时再加载。

第三类是能减少方向错误的流程。`grilling` 就属于这一类：它没有替 Codex 写代码，只是把开工前的需求确认固定下来。模型执行得越快，这类“先确认方向”的流程越值得保留。

## 我用 grilling 澄清了一次真实需求

这个案例来自我的开源项目 [《SpringAI 智能面试平台》（2.0 版本已开源）](https://javaguide.cn/zhuanlan/interview-guide.html)。当时我准备把模拟面试和知识库打通，给 `grilling` 的任务也很直接：帮我把这件事想清楚。

现有实现比我预想的更接近“打通”：知识库面试和普通模拟面试都在使用 `InterviewSession`，作答、评估和部分前端页面也已经复用。这次没有必要先改底层，得先确定首期产品范围。

![使用 Grilling 确认模拟面试与知识库的打通方案](https://oss.javaguide.cn/github/javaguide/ai/skills/grilling-springai-interview-platform-case.png)

它问的第一个问题，是首期做“完全基于用户资料的定向面试”，还是让用户照常选择 Java、系统设计等 Skill，知识库只负责补充上下文。

它建议先做前者。现有的题库生成、分类、难度、固定追问和评分规则都更贴近这条链路，只要统一入口和历史记录就能跑通。后一种方案还会引出 Skill 题目与知识库题目的混合比例、实时 RAG、来源冲突、评估依据和题目去重，改造范围会大很多。

我确认首期目标后，它才继续问：一场面试只选一个知识库，还是允许组合多个知识库？当前请求、会话字段和题库筛选都只有一个 `knowledgeBaseId`，所以它建议首期先限制单库，等流程稳定后再考虑多库关联。

接着是入口。知识库面试已经有独立页面，普通模拟面试从“模拟面试中心”进入。最后确定双入口共存，但共用同一套配置组件和创建接口，避免维护两套交互逻辑。

代码还没开始改，产品范围、数据模型和入口复用方式已经定下来了。

我愿意保留 `grilling`，是因为模型写代码已经够快了，返工多半发生在开工太早的时候：需求范围没定，异常处理没聊，用户场景和技术取舍还很含糊。Agent 按自己的理解一口气做完，最后可能还得推倒重来。

**模型越强，执行越快，走错方向的代价也会跟着变大。**

`grilling` 没有教模型怎么写代码，它只是把“动手前先问清楚”固定成一套可重复执行的流程。强模型不会自动消除这种流程的价值。

## 我的 Skill 删减标准

现在每装一个 Skill，我都会多问几句：

- 这件事模型原本就会做吗？
- 没有它时，我是否反复在同一个地方翻车？
- 它有没有沉淀脚本、模板、专业资料或个人偏好？
- 规则过期之后，我能否及时发现并删掉？

只会提醒“先读项目、再写代码、最后跑测试”的 Skill，我现在基本直接删。项目里真有特殊要求，写进 `AGENTS.md` 会更合适；测试、格式化和安全限制能够机械执行的部分，则交给 CI、Hook 或 linter。

同一个地方连续翻车，才值得单独写一个 Skill，尤其是出错代价不低的任务。里面只留关键判断和验证动作，够解决问题就停，不顺手扩成一套大而全的工作流。

想了解目前有哪些现成 Skill，以及它们分别适合什么任务，可以继续看 [AI 编程 Skills 选型清单](https://javaguide.cn/ai-coding/practices/programmer-essential-skills.html)。关于 Codex 里的 `AGENTS.md`、权限、MCP、Skills 和 Scheduled Tasks 分工，则可以参考 [OpenAI Codex 最佳实践指南](https://javaguide.cn/ai-coding/practices/codex-best-practices.html)。

这篇文章题目里虽然写了“还有必要吗”，但我没准备把 Skill 全删掉。我只是不会再看到一个就装一个。

现在遇到新 Skill，我会先不用它跑一次。能跑好，就不装；如果同一个问题反复出现，再把那一小段流程留下来。这样清理完，列表可能短了不少，但每个 Skill 为什么还在，我心里有数。
