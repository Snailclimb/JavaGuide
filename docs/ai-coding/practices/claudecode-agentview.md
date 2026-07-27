---
title: Claude Code Agent View：多会话并行管理实战
description: Anthropic 发布的 Agent View 为 Claude Code 提供终端内的多会话管理能力，可集中查看 Agent 状态、处理输入并管理后台会话。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,Agent View,多会话管理,Agent并行,AI编程,CLI工具,会话编排
---

大家好，我是小 G。

我平时用 Claude Code，经常会同时开几个会话：一个开发新功能，一个重构，一个跑测试，一个看报错，另一个整理 PR 评论或补文档。

![开启多个命令行窗口，让多个 Agent 在不同会话中并行](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/multi-agent-parallel-sessions.png)

以前这么用其实挺累。我一般会在 Ghostty 里开多个分屏，再配上几个终端标签页。窗口铺得满满当当，看起来像是把并行效率拉满了，脑子里却一直要记着：哪个会话还在跑？哪个已经完成？哪个卡在权限确认？哪个报错了？

最烦的是，有些 Agent 其实早就在等你确认了，但你根本没注意到。等你切回去一看，它已经停在那里十几分钟了。

Anthropic 前段时间推出的 **Agent View**，正好接手了这件麻烦事。它把后台会话集中到一个列表里，正在工作、等待输入、已经完成还是运行失败，扫一眼就知道。Claude 还是那个 Claude，但我终于不用靠脑子维护那张“会话状态表”了。

我在 [AI 编程选 CLI 还是 IDE？](https://mp.weixin.qq.com/s/6a3f2U6ZAJa2N7Cp10S01Q) 里提到过，AI Coding 的一些新工作流经常先在 CLI 里试水。Agent View 算是一个例子。不过，它更接近“后台会话管理器”，还不是会自动拆任务、分工和协调冲突的多 Agent 编排平台。

如果你还不熟悉 Claude Code，可以先看看下面两篇：

- [《Claude Code 使用指南》](https://javaguide.cn/ai-coding/practices/claudecode-tips.html)：Sub-Agent 子代理、多实例协作（Multi-Claude）、CLAUDE.md 配置等
- [《Claude Code 核心命令详解》](https://javaguide.cn/ai-coding/practices/claudecode-commands.html)：`/simplify`、`/loop`、`/batch` 等命令的实战用法

## 怎么打开 Agent View

Agent View 目前还是 Research Preview（研究预览版），需要 Claude Code `v2.1.139` 或更高版本。可以先检查一下版本：

```bash
claude --version
```

最直接的打开方式是在终端运行：

```bash
claude agents
```

![终端直接运行 claude agents 即可进入](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-agents-list-view.png)

打开后，每个后台会话占一行。左边是状态图标，中间是会话名和最近的执行摘要，右边是运行时长。会话默认按状态分组，需要你处理的会排在前面。

已经打开的普通 Claude Code 会话不会自动出现在这里。想把当前会话转到后台，可以输入：

```text
/bg
```

也可以在输入框为空时按左方向键 `←`。这两个操作都是把会话分离到后台，不会结束任务。之后用方向键选中会话，再按 `Enter` 或 `→`，就能重新进入完整对话。

![进入指定的 Agent 会话](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/enter-agent-session.png)

## 先看黄色，再看红色

Agent View 打开后，我通常先扫一遍左侧的状态图标。它比会话名更值得看，因为它直接告诉你哪里需要介入。

![Claude Code Agent View](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-agents-list-view-20260518102539932.png)

| 状态          | 界面表现 | 怎么处理                                      |
| ------------- | -------- | --------------------------------------------- |
| `Needs Input` | 黄色     | 正在等回答、权限确认或登录操作，优先处理      |
| `Working`     | 动画     | 仍在调用工具或生成回复，可以先放着            |
| `Completed`   | 绿色     | 任务正常结束，接下来检查 Diff、测试和执行结果 |
| `Failed`      | 红色     | 运行出错，打开摘要或日志定位原因              |
| `Idle`        | 变暗     | 当前没有任务，可以继续发消息                  |
| `Stopped`     | 灰色     | 会话已被手动停止，或者进程被外部结束          |

这里有个容易误判的地方：界面里的 `Completed` 分组也会收纳失败和已停止的会话，分组名不等于所有任务都成功了。是否真的完成，还是要看图标颜色和执行结果。

黄色最有用。以前我以为某个会话还在跑，切回去才发现它早就停在“是否允许执行这个命令？”那里等我。现在看到黄色就处理，没有黄色就先做别的。

## 不用切换，也能回复

选中会话后按空格键 `Space`，底部会弹出 Peek Panel，显示最近一次输出，或者 Claude 正在等待的问题。

![Agent View 选中一个会话后按空格键弹出 Peek Panel](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/peek-panel-reply.png)

如果只是确认“是否允许修改这个文件”或者“要不要继续跑测试”，直接在面板里回复就行。会话收到消息后继续执行，不需要进入完整对话。

以前要先找到对应的终端标签页，看它在等什么，回复完再切回来。现在按一下空格就能处理，这种小地方用久了很省心。

如果要看完整上下文，按 `Enter` 或 `→` 进入会话；看完按 `←` 返回 Agent View。

快捷键不用专门背，界面底部会显示提示，按 `?` 还能查看完整列表。日常常用的主要是下面这些：

| 快捷键            | 功能                                 |
| ----------------- | ------------------------------------ |
| `↑` / `↓`         | 在会话列表中移动                     |
| `Space`           | 打开或关闭 Peek Panel                |
| `Enter`           | 进入会话，或在输入框有内容时派发任务 |
| `Shift+Enter`     | 派发任务并立即进入新会话             |
| `Alt+1` ~ `Alt+9` | 直接进入第 N 个会话                  |
| `Ctrl+T`          | 置顶或取消置顶当前会话               |
| `Ctrl+R`          | 重命名当前会话                       |
| `Ctrl+X`          | 停止会话；2 秒内再按一次删除         |

`Ctrl+X` 连按两次要谨慎。如果会话使用了 Claude Code 自动创建的 Worktree，删除会话时，里面尚未提交的修改也可能一起被删掉。

## 把任务甩到后台跑

在已有会话里输入 `/bg`，可以直接把当前任务放到后台：

```text
/bg
```

这会把当前会话后台化，然后返回 Agent View。

![/bg 把任务甩到后台里跑](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/bg-background-session.png)

也可以顺手补一条指令再转入后台：

```text
/bg 跑完测试并修复失败用例
```

如果任务还没开始，从 Shell 直接创建后台会话更省事：

```bash
claude --bg "修复 auth 模块里所有失败的单元测试，直到全部通过"
```

这类“耗时，但不需要全程盯着”的任务很适合放到后台：

- 跑一整组失败测试并尝试修复
- 检查某个模块的类型错误
- 批量整理文档
- 分析 PR 评论并给出修改建议
- 对多个仓库同时做小范围改动

Mitchell Hashimoto（HashiCorp 联合创始人、Ghostty 作者）在 [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey) 里分享过一个挺有意思的习惯：每天最后 30 分钟，把深度调研、模糊想法探索、Issue 和 PR 分拣交给 Agent，第二天上班直接看结果。

他也写得很克制：理想状态是始终有 Agent 在处理有用的工作，实际只有大约 10%～20% 的工作时间能做到，而且通常只跑一个 Agent。这个比例反倒更接近日常开发，不需要为了“并行”硬凑一排任务。

## Shell 命令

不想打开 Agent View，也可以直接在 Shell 里管理后台会话：

```bash
claude agents          # 打开 Agent View

claude attach <id>     # 切换到指定会话

claude logs <id>       # 打印指定会话的最近输出

claude stop <id>       # 停止会话，也可以用 claude kill

claude respawn <id>    # 重启指定会话，保留对话历史

claude respawn --all   # 重启所有正在运行的后台会话

claude rm <id>         # 从列表中移除会话
```

这里面我用得比较少、但很容易理解错的是 `respawn`：

```bash
claude respawn <id>
```

它会重启指定的 Session，原来的对话记录还在。Claude Code 更新以后想让某个后台会话使用新版本，或者会话进程异常退出时，都可以用它。

`respawn` 不是 Context Reset，也不会生成一份干净上下文。如果旧会话已经塞满无关日志和过期方案，重启进程也解决不了上下文污染。遇到这种情况，另开会话，再带入一份核对过的任务摘要更稳妥。

另外，`claude rm <id>` 主要是从后台列表中移除会话。对话记录仍保存在本机，可以通过 `claude --resume` 找回；Claude Code 自动创建的 Worktree 只有在确认安全时才会一并清理。

## 从 Agent View 里直接派发任务

Agent View 底部有一个输入框。输入任务并按 `Enter`，会新建一个后台 Session；再输入一条任务，会继续新建 Session，而不是追问上一个会话。想给已有会话补充信息，要用 Peek Panel 回复，或者先进入该会话。

输入框还支持一些特殊写法：

| 输入格式                | 效果                                             |
| ----------------------- | ------------------------------------------------ |
| `<agent-name> <prompt>` | 第一个词匹配自定义 Subagent 时，用它作为主 Agent |
| `@<agent-name>`         | 在 Prompt 中指定一个自定义 Subagent              |
| `@<repo>`               | 选择另一个仓库或目录，在那里启动会话             |
| `/<command>`            | 搜索并使用可派发的 Skill 或命令                  |
| `! <command>`           | 直接启动后台 Shell 任务，不调用模型              |
| `#<number>` 或 PR URL   | 已有会话在处理该 PR 时，直接选中原会话           |

自定义 Subagent 通常放在项目的 `.claude/agents/` 或用户目录的 `~/.claude/agents/` 下。给代码审查、测试分析这类重复任务准备一个专用 Agent，派发时就不用每次重新交代工具和边界。

`#<number>` 和 PR URL 也挺实用。如果已经有一个 Session 在处理同一个 PR，Agent View 会选中原会话，避免两个会话重复修改。

关于 Skills 的使用，可以继续看[推荐 6 个 Skills](https://mp.weixin.qq.com/s/55YhKrMAHsbrAgf4P2ezRA)和[万字详解 Agent Skills](https://mp.weixin.qq.com/s/5iaTBH12VTH55jYwo4wmwA)。

## 什么场景适合用

判断一个任务要不要放进 Agent View，我主要看两点：它能不能暂时离开我独立推进，回来后又能不能通过 Diff、测试或日志验收。两点都满足，放到后台通常比较省心。

### 同时处理几件互不依赖的小事

比如手上有 5 个小需求，可以分别交给 5 个 Session：一个修测试，一个查类型错误，一个整理文档，另外两个处理互不相关的 Bug。任务发出去以后先忙自己的，回来再看状态：黄色的先回复，红色的查日志，绿色的集中验收。

前提是这些任务真的能分开做。五个 Session 同时修改同一批文件，即使有 Worktree 隔离，最后仍然要处理实现冲突和重复修改。省下来的时间，很可能又花在合并代码上。

[Nicholas Carlini 的 C 编译器实验](https://www.anthropic.com/engineering/building-c-compiler) 把并行规模拉到了另一个量级：16 个 Claude Opus 4.6 实例在两周内跑了近 2000 个 Claude Code Session，产出约 10 万行代码，花费接近 2 万美元。这个实验使用的是 Agent Teams 和自定义执行框架，并非 Agent View 的能力展示。

落到日常开发，能借鉴的是任务拆分、角色分工和测试约束。没有这些准备，多开几个 Session 只会更快地产生冲突。`/simplify` 和 `/batch` 等并行工作流的具体用法，可以看 [《Claude Code 核心命令详解》](https://javaguide.cn/ai-coding/practices/claudecode-commands.html)。

### 需要等待的 CI、测试和 PR

CI、集成测试和 PR Review 经常要等外部结果。一直把 Session 留在前台，人会忍不住隔几分钟看一眼；放到后台，等状态变黄、变红或完成后再回来处理就行。

每隔一段时间检查一次 CI，可以用 `/loop`；任务有明确的结束条件，例如“持续修复，直到测试全部通过”，用 `/goal` 更合适。Agent View 只负责展示 Session 状态，实际的定时检查和持续执行仍由这些命令完成。

[Stripe 的 Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) 已经把这条链路做成了一套内部系统：开发者从 Slack 派发任务，Agent 负责编码、验证和创建 PR，每周有超过 1000 个这类 PR 被合并，代码仍然由人审查。Minions 和 Agent View 是两套东西，但都绕不开测试、CI 和 Code Review。少了这些环节，列表显示绿色，也不能说明代码已经可以合并。

### 多仓库并行

`@<repo>` 可以把任务派到另一个仓库或目录。一个 Session 改后端接口，一个改前端页面，再开一个更新文档，状态仍然放在同一张列表里，不用分别维护几组终端窗口。

在 Git 仓库中，后台 Session 第一次准备修改文件时，Claude Code 默认会把它移到 `.claude/worktrees/` 下的独立 Worktree，避免几个 Session 直接写同一份工作区。非 Git 目录、已经处在 Worktree 中，或者项目关闭了后台 Worktree 隔离时，行为会有所不同。

前后端任务如果依赖同一份接口约定，最好先把请求参数、响应结构和验收标准定下来。Agent View 不会替两个 Session 同步这些变化。

## 哪些场景别硬用

### 多个任务需要频繁同步

每个 Session 都有自己的上下文，只向你汇报进度。一个 Session 刚改完接口，另一个不会自动知道；两个 Session 同时调整同一个核心模块，也不会主动商量由谁负责。

临时查资料、跑测试这类支线任务，可以交给 Subagent；需要多个 Agent 共享任务列表并互相通信，可以考虑 Agent Teams。Agent View 更适合由人来分配独立任务，再统一检查结果。

并行 Session 还会分别消耗订阅额度。任务开得越多，Token 消耗和触发限额的速度也越快。如果几件事本来就互相等待，串行处理可能更省事。

### 任务必须脱离本机持续运行

后台 Session 由本机 Supervisor 进程管理。关闭 Agent View、Shell 或终端窗口以后，任务可以继续；机器休眠时会保留 Session，唤醒后重新连接。

关机或重启会停止正在运行的任务。下次打开 Agent View 时，这些 Session 会显示为失败，进入、预览或回复后可以接着原来的对话继续。需要机器离线后照常运行的任务，应放到云端环境。详见 [Agent View 官方文档](https://code.claude.com/docs/en/agent-view)。

想进一步了解几种并行方式的区别，可以看 [Claude Code 并行 Agent 官方说明](https://code.claude.com/docs/en/agents)、[《上下文工程实战指南》](https://javaguide.cn/ai/agent/context-engineering.html) 和 [《Harness Engineering》](https://javaguide.cn/ai/agent/harness-engineering.html)。

## Research Preview 期间别写死流程

Agent View 仍处于 Research Preview 阶段，界面、状态分组和快捷键都可能变化。准备把它接进团队流程时，升级 Claude Code 后最好检查一次官方文档，不要把当前快捷键写死在长期规范里。

如果暂时不想用，可以在 `.claude/settings.json` 里关闭：

```json
{
  "disableAgentView": true
}
```

## 总结

我更愿意把 Agent View 理解成 Claude Code 的任务面板。它把散落在终端里的后台 Session 放到同一个列表，让我知道哪个还在运行、哪个正在等回复、哪个已经可以验收。

任务怎么拆、多个 Agent 怎么同步、最终结果是否可靠，仍然要靠 Worktree、测试、CI 和人来处理。

对我来说，它最实用的变化还是文章开头那个小问题：不用再去五六个终端标签页里，寻找已经等了十几分钟的权限确认。
