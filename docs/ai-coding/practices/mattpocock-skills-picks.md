---
title: mattpocock/skills 精选：10 个实用的 AI 编程 Skill
description: 逐项介绍 mattpocock/skills 中的 10 个 Agent Skill，涵盖需求澄清、原型验证、规格与任务拆分、并行实现、测试、故障诊断、代码审查、架构改进和会话交接。
category: AI 编程实战
tag:
  - AI 编程
  - Skills
head:
  - - meta
    - name: keywords
      content: AI编程,Agent Skills,mattpocock skills,需求澄清,任务拆分,TDD,Bug诊断,代码审查,会话交接
---

你好，我是小 G。之前写 Skill 选型，我说过自己现在很少用 [Superpowers](https://mp.weixin.qq.com/s/hTW0nqNnmFIKD93noWkr0g)了，身边用的人也越来越少了。

主要是太重了点，现在模型能力已经比较强了，大部分场景确实不太适合了。

像需求怎么聊、计划怎么写、最后怎么测怎么审，它都给你安排好了。整体流程确实很规范，但使用过程最大的痛点还是耗时太长，加上 Token 消耗特别大。

我之前用 Superpowers 的时候，Codex 20x 的额度经常还不够用，就离谱。。。

有朋友还把 `grill-me`、Trellis 和 Superpowers 放一起问，该用哪个？

大部分人的反馈是 `grill-me`，因为足够轻量。

![关于 grill-me、Trellis 和 Superpowers 的讨论](https://oss.javaguide.cn/temp/xgai/mattpocock/skill-selection-discussion.png)

之前做 [Spring AI 智能面试平台](https://mp.weixin.qq.com/s/q9UjF53OG0rQVQu92UOKlQ)，有件事我就拿不准。一场面试到底要不要支持多个知识库？我当时用的是 `grilling`，也就是大家熟知的 `grill-me` 这个 Skill。用了这个 Skill 之后，感觉自己很多没有考虑清楚的问题瞬间就清晰了，避免走了很多弯路。

![mattpocock/skills 的 GitHub 仓库](https://oss.javaguide.cn/temp/xgai/mattpocock/mattpocock-skills-github.png)

[Matt Pocock 这个仓库](https://github.com/mattpocock/skills) 10 月发了好几版，`implement-spec` 进了 Claude Code 插件，`tdd` 也更新了测试入口的规则。

![mattpocock/skills v1.3.2 发布记录](https://oss.javaguide.cn/temp/xgai/mattpocock/mattpocock-skills-v1-3-2-release.png)

正好挑 10 个比较经典的出来分享一下。

## 1. `grill-with-docs` 把聊定的事记下来

拿前面那个面试需求来说，“知识库面试”这个词就有两种理解。可以是照着用户上传的资料出题，也可以是照常做 Java 面试，只在必要时用知识库补点上下文。叫法一样，做出来的功能差挺多。

`grill-with-docs` 在问需求时会顺手做领域建模。词义定下来就记到 `GLOSSARY.md`，下次打开项目还能查到。碰到改起来代价大、以后光看代码又想不明白的取舍，再写一份 ADR，把当时为什么这么选留给后面的人。

![Interview Guide 演示生成的术语表和 ADR](https://oss.javaguide.cn/temp/xgai/mattpocock/grill-with-docs-interview-guide-demo.png)

## 2. `prototype` 做个能点的原型

假设一个审批单被驳回了，你能改金额吗？改完再提交，之前那条审批意见放哪儿？这种问题，我更愿意先点几下再定。

可以把问题直接交给 `prototype`，让它做个 HTML，页面上留出驳回和重新提交的入口，每点一次就把当前状态显示出来。想比的是界面，也能把几套方案放到同一路由里切着看。选好了，把那条规则或交互写回 Issue，原型就可以扔了。

## 3. `to-spec` 把讨论结果写成规格

我拿订单导出举个例子。今天聊定了 CSV 有哪几列、谁有权限导、日期最多能查多久，明天换个会话做，总得有个地方能翻到这些要求。

我会把这些要求写到以后找得到的地方。比如团队平时在 GitHub 上领活儿，那就开一条 Issue，把“只导本租户的数据”这种会影响验收的话留在上面。调 `to-spec`，它会翻这轮对话和仓库代码，把已讨论的需求、接口和验收方式整理成规格，再写到项目用的地方。平时用本地文件记任务，落成一份 Markdown 就行。

## 4. `to-tickets` 把活儿拆成一张张能验收的卡

我给第一张卡写验收条件，大概就一句。拿 A 租户的账号导出，把 CSV 打开，里面只应该有 A 的订单。等这件事跑通，才轮到下一张卡上的日期筛选。

把规格、计划或者刚才那段对话给 `to-tickets`。它先列出每张卡交什么、怎么验、等哪张先做完。你确认拆得对，它再把卡发到项目的任务系统。

![订单导出的任务拆分和依赖关系](https://oss.javaguide.cn/temp/xgai/mattpocock/order-export-ticket-dependencies.webp)

## 5. `implement-spec` 按依赖把任务分下去

图里那两张卡有依赖，放一个会话里按顺序做就行。要是项目里另有两三张互不挡着的卡，`implement-spec` 会让几个子 Agent 各自在自己的 Git worktree 里动手。各自改完，把结果合到同一条集成分支，整份规格做完再一起审。要这么用，先看手里的工具能不能开子 Agent 和 worktree。

## 6. `tdd` 先写一条会失败的测试

假设我们给导出接口补一条 31 天的日期限制。我会让 Agent 先发一条查 32 天的请求，断言应该拒绝，跑给我看。旧实现要是照样给了个 CSV，这条测试就应该红。补完校验再跑一遍。测试一上来就绿的话，我会先看它到底有没有走到那个接口。

`tdd` 就这么一条条推，每次先定从哪个公开接口测。10 月底那版还让 Agent 在提议测试入口时顺手交代一句，从这里测能查出什么，哪类问题还得去别处查。

## 7. `diagnosing-bugs` 先把 Bug 跑出来

碰到偶发超时，Agent 看几眼代码就说是 SQL，我会追问一句，能不能先给我一条跑得出超时的请求？

`diagnosing-bugs` 在这一步花的时间最多。一条测试、一段 HTTP 脚本，甚至是一次能把问题点出来的页面操作，都可以。比如脚本能跑出超时，就一点点减掉无关参数，看看少了什么以后超时消失。猜是某个查询的问题，也用这条脚本验证。等修完再拿原来的输入跑一次，合适的话就把复现写成回归用例。

![从复现 Bug 到修复后复测的步骤](https://oss.javaguide.cn/temp/xgai/mattpocock/bug-reproduction-feedback-loop.webp)

## 8. `code-review` 分开看代码规范和原始需求

看 Diff 时，我会把原始 Issue 一起给过去。像导出这件事，少查了一次租户权限，命名和异常处理写得再规整也没用。

交过去时，我会再给个比较基点，比如 `main`。之后 `code-review` 把 Diff 交给两个子 Agent。一个翻 `CONTRIBUTING.md` 和仓库里其他约定，结果放到 `Standards`。另一个读 Issue，拿需求里的话对着 Diff 看，漏了的、顺手多做的，都记在 `Spec` 这边。项目里没规格可查的话，照常审代码约定。

![同一份 Diff 的 Standards 和 Spec 双路审查](https://oss.javaguide.cn/temp/xgai/mattpocock/code-review-two-tracks.webp)

## 9. `improve-codebase-architecture` 找找哪里值得重构

给 CSV 加一列，接口、文件生成、后台任务都得跟着改。我碰到这种设计，会想先查一下前几次改导出字段是不是也动了这三个地方。

`improve-codebase-architecture` 会从最近常改的代码找这种线索，交一份 HTML 报告。里面会列出哪些文件老是一起动、有没有办法把规则收进一个模块，以及收进去以后从哪儿测。报告里有几个候选，你挑一处最想动的，它再跟你讨论具体怎么拆。

## 10. `handoff` 给下一个会话留份交接

拿前面面试平台的需求来说，聊完要换会话，我想留给下一位的差不多就是这么一句。首期只绑一个知识库，两个入口保留，底下还是用同一个 `InterviewSession`。

`handoff` 就是干这个的。它把已经定的事、现在做到哪儿和下一步记到临时目录里的一份文档。相关的 Issue、规格或者提交，有地址就直接留地址。新会话拿到文档路径，先读这份交接就行。

![面试平台需求通过交接文档转给新会话](https://oss.javaguide.cn/temp/xgai/mattpocock/agent-session-handoff.webp)
