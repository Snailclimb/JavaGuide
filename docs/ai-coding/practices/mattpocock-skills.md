---
title: mattpocock/skills：我最推荐的 4 个 AI 编程 Skill
description: 深入介绍 mattpocock/skills 中的 grilling、research、diagnosing-bugs 和 code-review，结合真实项目案例说明它们适合解决哪些 AI 编程失败点，以及如何按需安装和使用。
category: AI 编程实战
tag:
  - AI 编程
  - Skills
  - Codex
  - Claude Code
head:
  - - meta
    - name: keywords
      content: AI编程,Agent Skills,mattpocock skills,grilling,research,diagnosing-bugs,code-review,Codex,Claude Code,AI辅助开发,代码审查,需求澄清,Bug诊断
---

你好，我是小 G。

我在 [AI 编程 Skills 选型清单](https://javaguide.cn/ai-coding/practices/programmer-essential-skills.html) 和 [强模型时代，AI 编程 Skills 还有必要装吗？](https://javaguide.cn/ai-coding/practices/skill-selection-and-pruning.html) 这两篇文章中，都提到了 [mattpocock/skills](https://github.com/mattpocock/skills)，`grilling` 还专门拿了实际项目举例。

有不少读者朋友对 `grilling` 感兴趣。不过，回头看，这两篇都写得太简略了。文章只留下“让 Agent 持续追问”这个印象，一次只问一个问题、哪些信息该让 Agent 自己查、什么时候才能开始执行，都没有展开。

所以我重新读了一遍仓库里的 `SKILL.md`。`mattpocock/skills` 把常见工程问题拆成了较小、方便修改、可以组合的 Skill：需求含糊就补需求澄清，Bug 难查就补诊断流程，准备交付再补代码审查。

这种拆法很合我的使用习惯。Codex、Claude Code 已经能稳定完成的基础动作，无须每次重教；哪个环节经常返工，就给哪个环节加一小段流程。

群里讨论时，大家提到的也是类似问题：完整套件容易让小任务背上过重的流程，`grilling` 虽然会连续追问，但需求确实能收得更清楚。

![群友讨论 Superpowers 流程过重以及 Grilling 减少返工](https://oss.javaguide.cn/github/javaguide/ai/skills/group-chat-superpowers-grilling-feedback.png)

除了 `grilling` 之外，`research`、`diagnosing-bugs` 和 `code-review` 这三个也非常不错，这篇文章都会分享。

## `grilling` 不只是让 Agent 多问几句

我在前两篇文章里，其实也把 `grilling` 写简单了：让 Agent 别急着写代码，先多问几个问题。普通 Prompt 加上这句话也能做到。

当前版本的 [`grilling`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) 很短，里面把访谈怎么往下走规定得很细。

![grilling Skill 的完整访谈规则](https://oss.javaguide.cn/github/javaguide/ai/skills/grilling-skill-content.png)

它会沿着决策树往下问，一次只处理一个决定。前面的答案可能改变后面的分支，所以不能一口气扔出十几个问题，让用户像填问卷一样回答。

它还把事实和决定分开。项目用了什么框架、现有接口怎么设计、数据库里有没有某个字段，Agent 应该自己读代码和文档。首期做哪个方案、要不要兼容旧行为、愿意承担多少复杂度，则交给用户。

双方没有确认已经达成共同理解之前，Agent 也不能照着自己的判断开工。

## `grilling`、`grill-me` 和 `grill-with-docs` 有什么区别？

`grilling` 是可复用的底层访谈 Skill，模型可以主动调用，用户也可以直接调用，其他 Skill 同样能复用。`/grill-me` 是更明确的人工入口，本身只负责启动一次 `/grilling` 会话。

讨论会产生长期使用的领域术语或架构决定时，可以换成 [`/grill-with-docs`](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)。它还会调用 `domain-modeling`：术语确定后写入 `CONTEXT.md`，少量难以撤销、以后看起来可能奇怪的决定再记录为 ADR。

![grill-with-docs Skill 的调用关系](https://oss.javaguide.cn/github/javaguide/ai/skills/grill-with-docs-skill-content.png)

![domain-modeling Skill 的领域建模规则](https://oss.javaguide.cn/github/javaguide/ai/skills/domain-modeling-skill-content.png)

三者的关系可以理解为：

```text
grill-me ──────────> grilling
grill-with-docs ───> grilling + domain-modeling
```

访谈规则集中在 `grilling` 里，其他 Skill 直接复用。

[v1.1.0](https://github.com/mattpocock/skills/releases/tag/v1.1.0) 又把确认步骤改成显式停止条件，并区分环境事实和用户决定。旧规则可能让组合调用它的 Agent 顺手替用户做产品决定，现在这类决定必须逐个问人。

## 我用 grilling 确认了一次知识库面试需求

这次真实使用来自我的开源项目 [SpringAI 智能面试平台](https://javaguide.cn/zhuanlan/interview-guide.html)。

当时我准备把模拟面试和知识库打通，直接选择了 `grilling`，给出的任务只有一句：帮我把这件事想清楚。

现有实现其实已经打通了一部分：普通模拟面试和知识库面试都使用 `InterviewSession`，作答、异步评估和部分前端页面也已经复用。此时继续设计底层，可能改掉本来可以保留的代码，首期产品范围反而还没确定。

![使用 Grilling 确认模拟面试与知识库的打通方案](https://oss.javaguide.cn/github/javaguide/ai/skills/grilling-springai-interview-platform-case.png)

`grilling` 问的第一个决定，是知识库在面试里扮演什么角色。

一种方案是完全根据用户资料生成定向面试；另一种是照常选择 Java、系统设计等 Skill，知识库只补充上下文。我选了前者，现有的题库生成、分类、难度、固定追问和评分规则都能继续使用。后一种还会引出两类题目的混合比例、实时 RAG、题目去重、来源冲突和评估依据。

这个决定确认后，它才进入下一个分支：一场面试绑定一个知识库，还是允许组合多个知识库？

请求参数、会话字段和题库筛选都围绕单个 `knowledgeBaseId` 设计。多知识库还要处理召回结果合并、权重、重复内容和权限校验。首期因此限制为单库，没有提前改关联表和接口结构。

第三个决定是入口。知识库面试已经有独立页面，普通模拟面试则从“模拟面试中心”进入。最后保留两个入口，但底层继续复用 `InterviewSession`，配置组件和创建接口也尽量共用，避免以后维护两套相似逻辑。

代码还没有开始改，首期范围已经收成三个选择：纯知识库面试、单个 `knowledgeBaseId`、双入口共用会话与创建能力。

`grilling` 没有替我写产品方案。它给出推荐答案和代码依据，取舍仍然由我确认。第一个答案如果换成“通用 Skill + 知识库上下文”，后面要问的也不会是单库还是多库，而会转向两类题目的混合与评估方式。

现在的模型写代码已经够快了。需求范围没定时，Agent 也能很快交出代码、测试和文档。方向偏了，这些产物都要跟着返工。

当然，不是每个任务都要先接受一轮“拷问”。改一处文案、补一个明确的空值判断、按现成模式增加字段，验收标准已经写得很具体，直接做通常更省时间。`grilling` 也替代不了测试和代码审查，它只负责把动手前还没定下来的问题暴露出来。

当前的 `grilling` 也没有问题数量上限，复杂需求可能聊得很久。如果担心访谈拉得太长，可以给它设置每轮 3～5 个问题的预算。一轮结束后先整理已经确认和仍未确认的决定，再由用户选择是否继续。

不要只写“最多问 5 个问题”。额度用完后，Agent 仍然不能自行补齐剩余决定或直接开工。

## `research`：把查资料这条支线交出去

给项目升级某个 SDK 时，当前版本支持哪些参数、旧接口何时弃用、流式事件怎么变化，不该靠用户凭记忆回答，也不适合让主 Agent 一边改代码一边翻长文档。

[`research`](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) 会把问题交给后台 Agent，只查官方文档、源码、规范和第一方 API。结论写进仓库里的一个 Markdown 文件并标明来源，主 Agent 可以继续处理其他工作。

![research Skill 的资料检索和结果保存规则](https://oss.javaguide.cn/github/javaguide/ai/skills/research-skill-content.png)

我看中的是它把资料来源和交付物钉死了：不拿二手教程替代官方资料，也不把几十页搜索过程塞回主会话，只留下可复查的结论。

使用它有两个前提：Agent 支持后台或 Subagent 调查，项目也接受多一个研究文档。只查一个方法签名时，直接打开官方文档更快；涉及版本迁移、协议差异或陌生依赖，再把这条支线交出去。

## `diagnosing-bugs`：先做出一个会变红的反馈环

Agent 排查 Bug 时很容易过早形成判断。看到一个可疑分支，马上改代码，再跑一遍测试；没修好，就继续换下一个猜测。改动越来越多，最初的故障现象反而没有被稳定复现。

[`diagnosing-bugs`](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) 把最多精力放在第一阶段：先做出一个能准确捕获当前 Bug 的反馈环。

![diagnosing-bugs Skill 的 Bug 诊断流程](https://oss.javaguide.cn/github/javaguide/ai/skills/diagnosing-bugs-skill-content.png)

反馈环可以是一条失败测试、一段 `curl`、带固定输入的 CLI、Playwright 脚本或线上请求回放。它要能捕获原故障，运行稳定、足够快，并且 Agent 可以独立执行。

确实无法复现时，它会列出尝试过的办法，再向用户申请可复现环境、HAR、日志、`core dump` 或临时生产插桩权限。

反馈环准备好后，再重复复现并缩小输入。接着列出 3～5 个可以证伪的假设，说明“如果它是原因，改变什么之后现象会如何变化”，再根据预测增加断点或定向日志。

修复阶段会把最小复现转成回归测试，在正确的模块接口处看它先失败，再应用修复。结束前重跑原始场景，清掉带唯一前缀的临时日志和调试程序，并把最终根因写进提交或 PR。

这套流程适合难复现的 Bug、性能退化和已经猜错几轮的问题。编译错误、明显的字段拼写错误，没必要先建一套诊断流程。项目没有合适的测试接缝时，最小复现也无法变成可靠测试。这个 Skill 会记录下架构问题，不会硬写一个和真实调用方式不一致的单元测试。

## `code-review`：代码规范和需求实现分开审

代码审查经常只看实现质量：命名是否清楚、有没有重复逻辑、异常处理是否合理、测试够不够。代码本身可能挑不出大问题，却实现错了需求。

[`code-review`](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md) 把审查分为 `Standards` 和 `Spec` 两条线。

![code-review Skill 的双轴代码审查流程](https://oss.javaguide.cn/github/javaguide/ai/skills/code-review-skill-content.png)

`Standards` 会读取仓库自己的 `CONTRIBUTING.md` 和编码规范，再检查变更是否遵守约定。当前版本还内置了一组 `Fowler Code Smells`。仓库明文规则优先，Smell 只能作为判断线索，不能直接算违规。

`Spec` 则回到最初的 Issue、PRD 或技术方案，检查交付内容是否真的覆盖了原需求。两条审查由并行 Subagent 分别完成，最后再合并结果，避免负责代码风格的上下文影响需求检查。

审查前还要固定 `commit`、分支、`tag` 或 `main` 作为比较基点。Skill 基于 `merge base` 查看 `HEAD` 以来的 `diff`，不会把整个仓库泛泛看一遍。

项目没有 PRD、Issue 或验收标准时，`Spec` 这条线只能跳过；仓库没有编码约定，`Standards` 更多依赖通用 Code Smells。并行审查还要求宿主 Agent 支持 Subagent。CI、静态检查和人工领域审查仍然要保留。

## 怎么安装

这个仓库可以通过 `skills.sh` 的安装器接入 Codex、Claude Code 等支持 Agent Skills 的工具：

```bash
npx skills@latest add mattpocock/skills
```

安装器会让你选择具体 Skill 和目标 Agent。只想体验需求访谈，可以先选 `grill-me` 和 `grilling`。需要在讨论过程中维护 `CONTEXT.md` 和 ADR，再选择 `grill-with-docs` 与 `domain-modeling`。

按照项目当前说明，使用工程链路前还要在目标仓库运行一次 `/setup-matt-pocock-skills`，确认 GitHub、Linear 或本地任务管理方式，并确定 `Triage` 标签和 Agent 文档目录。

也可以直接让 Coding Agent 帮你安装，这里以 Codex 为例：

```text
请帮我从 mattpocock/skills 仓库安装 4 个 Agent Skill：grilling、research、diagnosing-bugs、code-review。
```

![Codex 使用 skill-installer 安装 mattpocock skills](https://oss.javaguide.cn/github/javaguide/ai/skills/codex-install-mattpocock-skills.png)

安装完成后，通常要到下一轮对话才会出现在可用 Skill 列表里。

`tdd`、`to-spec` 和 `to-tickets` 没有单列。TDD、规格说明和任务拆分已经是常见工程方法，不少 Agent 也能完成基础版本。项目采用“讨论 → Spec → Tickets → 实现 → 审查”的整条链路时，再组合它们。

这篇文章挑的 4 个，对应的是我现在更在意的几个失败点：开工前方向没定，资料来源不可靠，Bug 没复现就开始猜，代码写完却没有对照原始需求。

第一次安装不用全局启用。先限定在一个仓库，拿两三个真实任务观察返工次数、执行时间和产物质量。模型没有 Skill 也能稳定完成，就删掉；同一个问题反复出现，再留下那一小段流程。

第三方 Skill 是交给 Agent 的指令。安装前读一遍 `SKILL.md`，再检查 `scripts/`、`references/` 和权限要求。列表短一点没关系，知道每个 Skill 为什么还在，使用时反而更省心。
