---
title: Claude Code Agent View：多会话并行管理实战
description: Anthropic 发布的 Agent View 为 Claude Code 提供了可视化的多会话管理能力，让多个 Agent 会话的状态追踪、权限确认和任务编排变得直观高效，彻底告别终端窗口切换的混乱。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,Agent View,多会话管理,Agent并行,AI编程,CLI工具,会话编排
---

# Claude Code Agent View：多会话并行管理实战

大家好，我是小 G。

前段时间，Anthropic 发布了 **Agent View**。这几天用下来，真的非常喜欢，而且使用巨简单，完全没有学习成本。

个人感觉它最大的价值不是让 Claude 变得更聪明，而是让多个 Claude Code 会话终于好管理了。

在 [AI 编程选 CLI 还是 IDE？](https://mp.weixin.qq.com/s/6a3f2U6ZAJa2N7Cp10S01Q) 那篇文章里，我提到过一个判断：**最前沿的 AI Coding 特性几乎都先在 CLI 里诞生。** Agent View 又一次印证了这一点——多 Agent 并行编排能力，目前只在 Claude Code CLI 里以这种形态出现。

我平时用 Claude Code，经常会同时开几个会话：一个开发新功能，一个重构，一个跑测试，一个看报错，另一个整理 PR 评论或补文档。

![开启多个命令行窗口，让多个 Agent 在不同会话中并行](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/multi-agent-parallel-sessions.png)

以前这么用其实挺累。

我一般会在 Ghostty 里开多个分屏，或者再配合几个 terminal tab。表面上看起来很高效，但脑子里一直要记着：哪个会话还在跑？哪个已经完成？哪个卡在权限确认？哪个报错了？

最烦的是，有些 Agent 其实早就在等你确认了，但你根本没注意到。等你切回去一看，它已经停在那里十几分钟了。

这就是 Agent View 解决的问题。

它把原本塞在你脑子里的“会话状态地图”搬到了界面上。哪个会话在工作，哪个需要你输入，哪个已经完成，哪个失败了，一眼就能看到。

并行 Agent 最大的问题，不是不能同时跑，而是跑起来之后不好管。Agent View 解决的就是这个管理成本。

关于 Claude Code 的更多使用技巧和核心命令，可以看看我之前写的这两篇文章：

- [《Claude Code 使用指南》](https://javaguide.cn/ai-coding/claudecode-tips.html)：Sub-Agent 子代理、多实例协作（Multi-Claude）、CLAUDE.md 配置等
- [《Claude Code 核心命令详解》](https://javaguide.cn/ai-coding/claudecode-commands.html)：`/simplify`、`/loop`、`/batch` 等命令的实战用法

## 怎么打开 Agent View

目前有两个入口。

第一个入口是在任意 Claude Code 会话里按左方向键 `←`，退出当前会话，回到 Agent View 列表。

这个的前提是你已经开启了 Agent View 模式。

第二个入口是在终端里直接运行：

```bash
claude agents
```

打开后，你会看到一个按状态分组的会话列表。相同状态的会话归在同一组下面，比如 `Completed`、`Working`、`Needs Input` 等。

每一行对应一个 Claude Code 会话，从左到右依次是：

- **状态图标**：左侧的符号标记（如 `✻`、`∙`），一眼区分会话当前处于什么状态
- **会话名称**：任务类型或自定义的会话名（如 `github repo security`、`github pr review`）
- **最后一次响应的概览**：就是 Claude 最近一轮的做了啥
- **相对时间**：右侧显示最后交互的相对时间（如 `4h`）

![终端直接运行 claude agents 即可进入](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-agents-list-view.png)

这其实就是一个“Agent 控制台”。

以前你需要在多个终端窗口之间来回找，现在所有会话状态都放在一个列表里。哪个在跑、哪个完成了、哪个在等你确认，一眼就能看到。

只需要用鼠标点击对应的会话或者上下键移动到对应的会话按 `Enter`，即可进入。

![进入指定的 Agent 会话](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/enter-agent-session.png)

## 状态图标

Agent View 里最重要的东西，不是会话名，也不是最后一条摘要，而是左侧的状态图标。

它决定了你现在要不要介入。

![Claude Code Agent View](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-agents-list-view-20260518102539932.png)

核心就记住三个：

- **黄色（Needs Input）**：Claude 在等你，通常是权限确认或具体问题——**看到就要处理**
- **动画旋转（Working）**：Claude 正在干活——不用管，等它跑完
- **蓝色（Completed）**：任务正常结束——可以验收了

以前并行跑 Agent 最痛苦的地方，就是不知道哪个会话卡住了。你以为它还在干活，实际上它早就停在“是否允许执行这个命令？”那里等你确认。

Agent View 直接用黄色把这类会话标出来。

看到黄色，就说明这个 Agent 需要你处理；没有黄色，就可以先不用管。这个小变化，对并行工作流非常关键。

## 不用切换，也能回复

Agent View 里还有一个很实用的能力：**Peek & Reply**。

选中一个会话后，按空格键 `Space`，底部会弹出一个 peek panel，展示该会话最近一轮内容。

![Agent View  选中一个会话空格键弹出一个 peek panel](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/peek-panel-reply.png)

如果 Claude 只是等一个简单确认，比如：是否允许修改这个文件？

或者：是否继续执行测试命令？

你可以直接在 peek panel 里回复。回复完后，这个会话会继续执行，不需要进入完整会话界面。

这个体验比以前舒服很多。

以前你要先切到那个 terminal tab，看它在等什么，回复完，再切回原来的窗口。现在只需要在列表里扫一眼，按空格，看一下，回一句，继续做自己的事。

如果要看完整上下文，按 `Enter` 或 `→` 进入会话；看完按 `←` 返回 Agent View。

常用快捷键可以有这些，但千万别记，没意义，直接用鼠标基本就能完成所有任务了：

| 快捷键            | 功能                                 |
| ----------------- | ------------------------------------ |
| `↑` / `↓`         | 在会话列表中移动                     |
| `Space`           | 打开或关闭 peek panel                |
| `Enter`           | 进入会话，或在输入框有内容时派发任务 |
| `Shift+Enter`     | 派发任务并立即进入新会话             |
| `Alt+1` ~ `Alt+9` | 直接进入第 N 个会话                  |
| `Ctrl+T`          | 置顶或取消置顶当前会话               |
| `Ctrl+R`          | 重命名当前会话                       |
| `Ctrl+X`          | 停止会话；2 秒内再按一次删除         |

日常最常用的其实就三个：`↑/↓` 移动，`Space` 预览，`Enter` 进入。

## 把任务甩到后台跑

Agent View 还有一个很重要的配套能力：**后台会话。**

第一种方式，是在已有 Claude Code 会话里输入：

```text
/bg
```

这会把当前会话后台化，然后返回 Agent View。

![/bg 把任务甩到后台里跑](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/bg-background-session.png)

第二种方式，是从终端直接启动一个后台会话：

```bash
claude --bg "修复 auth 模块里所有失败的单元测试，直到全部通过"
```

这个命令会直接创建一个新会话，并把任务放到后台执行。你不需要一直盯着它。

这类能力很适合那些“耗时但不需要你全程盯着”的任务，比如：

- 跑一整组失败测试并尝试修复
- 检查某个模块的类型错误
- 批量整理文档
- 分析 PR 评论并给出修改建议
- 对多个仓库同时做小范围改动

以前这类任务你会开一堆终端，然后每隔一会儿切过去看一眼。现在可以直接后台化，再从 Agent View 里看状态。

Mitchell Hashimoto（HashiCorp 联合创始人）分享过一个类似的工作模式：他的目标是 **10-20% 的工作时间有后台 Agent 在跑**。每天最后 30 分钟给 Agent 布置任务，比如深度调研、模糊探索、Issue 分拣。第二天回来直接看结果。

这个思路和 Agent View 的后台会话完美匹配：布置完任务，`/bg` 甩到后台，你下班或者去做别的事。回来后打开 Agent View，看哪些完成了，哪些需要确认。

## Shell 命令

如果你更习惯命令行，Agent View 相关能力也可以通过 Shell 命令管理。

常用命令大概这些：

```bash
claude agents          # 打开 Agent View

claude attach <id>     # 切换到指定会话

claude logs <id>       # 打印指定会话的最近输出

claude stop <id>       # 停止会话，也可以用 claude kill

claude respawn <id>    # 重启已停止的会话，保留对话历史

claude respawn --all   # 重启所有已停止的会话

claude rm <id>         # 从列表中移除会话
```

这里面 `claude respawn` 值得单独说一下。

有些任务跑到一半失败了，比如测试环境挂了、依赖安装失败了、某个命令权限不够。以前你可能要重新开会话、重新描述任务、重新贴上下文。

现在可以直接：

```bash
claude respawn <id>
```

它会重启这个已停止的会话，并保留之前的对话历史。

这对长任务很有用。你不用从零开始解释“刚刚发生了什么”，Agent 能接着之前的上下文继续处理。

这个能力背后的思路，和 AI Agent 工程里的 **Context Reset** 是一样的：当 Agent 的上下文接近饱和时，先把当前任务状态、已完成工作、待办事项结构化提取出来，然后启动一个新的上下文窗口继续工作。`claude respawn` 把这个过程自动化了。

## 从 Agent View 里直接派发任务

Agent View 不只是一个会话列表，也可以直接用来派发新任务。

简单理解，`<agent-name>` 对应的就是 Claude Code 的子代理（Sub-Agent）。Claude Code 内置了三种子代理：

- **Explore**：用轻量模型（Haiku）快速搜索代码库，适合定位文件和符号
- **Plan**：专注于分析问题、设计实现方案，不写代码
- **General-purpose**：通用代理，处理复杂多步骤任务

你也可以在 `.claude/agents/` 目录下创建自定义子代理，指定特定的 System Prompt 和工具集。当你在 Agent View 输入框里输入的第一个词匹配到某个自定义子代理名时，就会用那个子代理来执行任务。

它的输入框支持这些特殊语法：

| 输入格式                | 效果                                              |
| ----------------------- | ------------------------------------------------- |
| `<agent-name> <prompt>` | 第一个词匹配自定义子代理名时，用该子代理执行任务  |
| `@<agent-name>`         | 在 prompt 里 @ 某个子代理，以它作为主代理         |
| `@<repo>`               | 指定一个仓库路径，在那个目录下新建会话            |
| `/<skill>`              | 从已安装的 Skills 中选择一个作为 prompt           |
| `#<number>` 或 PR URL   | 如果已有会话在处理同一个 PR，直接跳转，而不是新建 |

关于 `/<skill>`，稍微多说两句。Claude Code 的 Skills 采用延迟加载设计——启动时只加载每个 Skill 的名称和简短描述（大约 100 Token），真正需要时才加载完整内容。这意味着装再多 Skill 也不会拖慢 Agent View 的启动速度。想了解更多，可以看[推荐 6 个爆火的神级 Skills，400K+ 点赞！Vibe Coding 必备](https://mp.weixin.qq.com/s/55YhKrMAHsbrAgf4P2ezRA)和[万字详解 Agent Skills](https://mp.weixin.qq.com/s/5iaTBH12VTH55jYwo4wmwA)。

最后一条挺实用。

如果你输入某个 PR 编号或 PR URL，Agent View 会检查是否已经有会话在处理它。如果有，就直接跳过去，而不是再开一个新会话。

这能避免一个很常见的问题：同一个 PR 被两个 Agent 同时改，最后互相覆盖、重复提交，甚至把问题越修越乱。

## 什么场景适合用

从目前的使用方式看，Agent View 最适合三类场景。

第一类是**批量派发任务**。

比如你有 5 个小需求，可以一次性开 5 个会话，每个会话配一个明确任务。你去做别的事，回来后看列表：绿色表示完成，黄色表示需要确认，红色表示失败。

这种体验比自己维护 tmux 网格轻很多。

更极端的案例来自 Nicholas Carlini（Anthropic 研究员）。他用大约两周时间，同时跑 **16 个并行 Claude Opus 实例**，总共约 2000 个 Claude Code 会话，做出了一个 GCC torture test 通过率 99% 的 C 编译器。他的 Agent 角色逐渐专业化——有的负责核心编译器工作，有的专门做去重，有的做性能优化，有的管代码质量。

当然，这是极端场景。日常开发中，一个更实用的组合是用 `/simplify` 做三 Agent 并行代码审查（分别检查代码复用、代码质量、执行效率），或者用 `/batch` 自动拆解任务为多个独立 Worker，每个 Worker 在独立 Git Worktree 中并行工作。这些命令的详细用法可以看 [《Claude Code 核心命令详解》](https://javaguide.cn/ai-coding/claudecode-commands.html)。

第二类是 **PR 看门狗**。

你可以让一个 Agent 持续关注某个 PR 的 CI 状态。CI 失败时，让它自动尝试定位原因、修复失败测试、补充提交。

这类任务时间跨度比较长，以前放在终端里很容易忘。现在放到后台会话里，偶尔看一眼状态图标就行。

Stripe 的 Minions 系统把这种模式做到了极致：开发者发一条 Slack 消息，Agent 就从写代码、跑 CI 到提 PR 全部完成，每周有超过 1300 个完全由 Agent 生产的 PR 被合并。虽然这不是用 Agent View 实现的，但思路是一样的——**让 Agent 自治执行，人只做验收。**

第三类是**多仓库并行**。

`@<repo>` 语法可以让你在 Agent View 里直接指定仓库路径。每个会话在自己的目录下运行，互不干扰。

这对 monorepo、多服务项目、前后端分离项目都挺有用。比如一个 Agent 改后端接口，一个 Agent 改前端页面，一个 Agent 跑文档更新。

## 有几点要说清楚

Agent View 目前还是 **research preview**，不能把它理解成完全成熟的生产级 Agent 编排平台。

有几个边界要先讲清楚。

第一，**后台会话不等于云端任务**。

后台会话仍然运行在你的本机。关机、断网、退出 Claude Code 进程后，它都会中断。

所以它和 Desktop scheduled tasks、Cloud task 不是一回事。后两者可以在本机不在线时继续运行，而 Agent View 的后台会话不行。

如果你要跑长时间不间断任务，这一点要分清楚。

第二，**上下文是会话级别隔离的**。

每个会话都有自己的上下文窗口，默认互不共享。多个 Agent 并行，并不代表它们天然知道彼此在做什么。

这个设计其实是有工程道理的。在上下文工程（Context Engineering）里有一个重要的模式叫 **Sub-agent**：子 Agent 可以自己探索大量上下文（几万个 Token），但返回给主 Agent 的只是一段 1000-2000 Token 的高密度摘要。这样主 Agent 的上下文会干净很多。如果每个 Agent 都能访问彼此的完整上下文，Token 消耗会失控。

另外还有一个硬约束：当上下文窗口用到大约 **40%** 的时候，Agent 的输出质量就开始明显下降。所以每个会话独立管理自己的上下文，反而是一种保护。

如果你要做多 Agent 协作，要么自己协调，要么使用 Agent Teams 这类专门的跨会话通信能力。否则很容易出现重复修改、结论不一致、同一文件被多边改动的问题。

想深入了解上下文管理的工程方法论，可以看 [《上下文工程实战指南》](https://javaguide.cn/ai/agent/context-engineering.html) 和 [《Harness Engineering》](https://javaguide.cn/ai/agent/harness-engineering.html)。

第三，**`/loop` 和 Agent View 搭配起来更顺**。

`/loop` 支持两种模式：一种是**定时调度**（Cron 模式，比如每小时检查一次 CI 状态），另一种是**自主迭代**（Agentic Loop，失败就自动重试分析再修复）。后者和 Agent View 的搭配体验特别好。

如果你在后台会话里跑 `/loop`，再用 Agent View 统一看进度，体验会更接近“让 AI 等你，而不是你等 AI”。

比如你让它持续修测试，失败就继续分析，再失败再继续。你不需要一直盯着，只需要偶尔看一下状态是否变黄、是否失败。

更多关于 `/loop` 的配置方法（CronCreate/CronList/CronDelete、7 天自动过期等），可以看 [《Claude Code 核心命令详解》](https://javaguide.cn/ai-coding/claudecode-commands.html) 中关于 `/loop` 的部分。关于 Workflow、Graph 和 Loop 三者的技术原理，可以看 [《AI 工作流中的 Workflow、Graph 与 Loop》](https://javaguide.cn/ai/agent/workflow-graph-loop.html)。

第四，如果你不想用它，也可以关掉。

在 `.claude/settings.json` 里设置：

```json
{
  "disableAgentView": true
}
```

就可以关闭 Agent View。

## 写在最后

Agent View 不是那种看起来很炫的大功能。它解决的问题很简单：**多会话并行时，可见性太差，切换成本太高。**

但这个改进，确实可以极大提高使用体验。

相信很多朋友都像我这样，用 Claude Code、Codex、Cursor Agent，会同时开启多个 Agent 来并行搞事，或者在做一件事的时候，我们把任务拆开。

问题是，Agent 数量一多，人就成了调度器。

Agent View 把这件事往前推进了一步。黄色告诉你谁在等你，Peek 让你不用切换就能回复，后台会话让任务可以先跑起来。

它最大的变化不一定是功能，而是**心理负担下降了**。看到黄色就处理，看到蓝色就验收，看到红色就看日志。

它还处在 research preview 阶段，别急着把它当成完整的 Agent 编排平台。**先把“哪个 Agent 在干嘛”这件事解决掉，再谈更复杂的多 Agent 协作。**
