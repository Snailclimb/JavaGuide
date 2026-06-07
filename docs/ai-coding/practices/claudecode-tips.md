---
title: Claude Code 使用指南：配置、工作流与进阶技巧
description: 结合 Anthropic 官方文档和真实项目用法，讲清 Claude Code 的配置、权限、MCP、Skills、Sub-Agent、上下文管理和常见工作流。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,AI编程,CLAUDE.md,MCP,Skills,Sub-Agent,Agentic Coding,AI辅助开发
---

你好，我是小 G。前几天分享了一篇 [Vibe Coding 实用技巧总结](./the-cool-tricks-for-vibe-coding.md)，反响很不错，公众号阅读一天时间就冲上了 6w+。

于是，根据反馈，我又爆肝了一篇 Claude Code 使用技巧，把我这一年多高频使用积累的经验毫无保留分享给大家。

正文开始之前，想先问问大家：你第一次认真用 Claude Code 的时候，是什么感觉？

我一开始其实挺抵触命令行。毕竟习惯了 Cursor、IDEA 这种编辑器模式之后，再回到终端里和 AI 协作，总感觉有点原始人，反直觉。

结果用上之后，就真香了！

Claude Code 反而比很多传统 IDE Agent 更爽，效率也更高。

传统 IDE 更像是人在写代码，AI 在旁边辅助；Claude Code 更像是 AI 在干活，人负责设边界、看 diff、做判断。

终端形态也更适合长任务：本地能跑，远程机器能跑，也更容易接进脚本和 CI/CD 这类自动化环境。同一套命令、配置和权限约束可以复用，不用为了 GUI 再单独翻译一遍。至少在 Claude Code 这条线上，很多偏自动化、长任务、多会话的能力，CLI 形态承载起来更自然。

但爽归爽，用久了之后，翻车也会越来越多。

这篇文章重点放在 `CLAUDE.md`、权限管理、MCP、Skills、Sub-Agent、上下文管理和验证习惯这些地方。

需要注意的是，Claude Code 迭代很快，部分命令和版本门槛会变，具体以 `claude --version` 和官方文档为准。比如 `/run`、`/verify` 需要 Claude Code v2.1.145+；新版 `/simplify` 的官方说明出现在 v2.1.154+ 之后；`--enable-auto-mode` 已经移除，现在用 `--permission-mode auto`。

另外，国内使用 Claude Code 还有现实门槛：账号、网络、成本、第三方中转稳定性都要考虑。GLM、MiniMax、Kimi、DeepSeek 这类国产模型可以作为替代或补充，但如果任务是大规模代码修改、复杂重构、长链路排错，Claude 目前仍然值得单独研究。

## `CLAUDE.md` 非常重要

`CLAUDE.md` 是 Claude Code 的项目/用户级指令文件，是给 Claude Code 的持久指令和上下文，用于告诉 AI 助手如何在这个项目中工作，本质是一份 **AI 行为规范**。

![多智能股票分析项目中的 CLAUDE.md 和 AGENTS.md](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-agents-md.png)

常见内容包括：

- Claude 容易猜错的规则
- 代码里读不出来的约定
- 团队必须遵守的规范
- 技术栈版本、常用命令、架构取舍、项目坑点

Anthropic 建议保持 `CLAUDE.md` 精简不超过 200 行，只保留 Claude 无法轻易从代码中推断的信息。如果内容继续膨胀，可以拆到带 `paths` 的 `.claude/rules/`，或者把不是每次会话都需要的参考内容放到 Skills 里。

![Claude Code 官方文档对 CLAUDE.md 的建议](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claudemd-claude-docs.png)

一个很好用的判断标准是：

> 这行删掉后，Claude 会不会更容易犯错？

如果会，就保留；如果不会，它大概率只是在浪费上下文。

### 放在哪里

Claude Code 支持 `CLAUDE.md` 放在多个位置，按优先级从低到高：

![CLAUDE.md 层级与优先级](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-md-best-practices-file-hierarchy.png)

| 位置       | 路径                                                                                                                                                  | 用途                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **组织级** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`，Linux/WSL: `/etc/claude-code/CLAUDE.md`，Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT/DevOps 统一下发的编码规范、合规要求和数据处理说明，不能通过个人配置排除。 |
| **用户级** | `~/.claude/CLAUDE.md`                                                                                                                                 | 你的个人偏好，对所有项目生效                                                 |
| **项目级** | `./CLAUDE.md` 或 `./.claude/CLAUDE.md`                                                                                                                | 团队共享规范，提交至 Git                                                     |
| **本地级** | `./CLAUDE.local.md`                                                                                                                                   | 个人的项目特定配置，加入 `.gitignore`                                        |
| **子目录** | `./subdir/CLAUDE.md`                                                                                                                                  | Claude 访问该目录文件时按需加载，不在会话开始时注入                          |

Claude Code 会把不同层级的 `CLAUDE.md` 一起加载，不是后面的文件把前面的直接覆盖掉。不过，越靠近当前项目、作用范围越具体的规则，会排在更后面，通常也更容易被 Claude 采纳。

比如用户级规则写“统一用空格缩进”，项目级规则写“这个仓库使用 Tab”，那在这个项目里，Claude 通常会优先按项目规则来。官方文档里的加载顺序也是从组织级、用户级，一直到项目级和本地级。

我的做法比较简单：项目级 `CLAUDE.md` 提交到 Git，放团队都要遵守的规则；只和自己有关的偏好，比如当前项目里希望提交信息用中文，就放进 `CLAUDE.local.md`，再加到 `.gitignore`，别把个人习惯混进团队文件。

如果项目比较大，可以拆开：

```text
my-project/
├── CLAUDE.md
├── backend/
│   └── CLAUDE.md
├── frontend/
│   └── CLAUDE.md
└── .claude/
    ├── rules/
    ├── skills/
    └── agents/
```

根目录的 `CLAUDE.md` 放全局约定，子目录的 `CLAUDE.md` 放局部规则。Claude 读取到某个子目录文件时，会按需加载对应目录下的说明。这个机制对 monorepo 很友好，后端、前端、管理台不用挤在一份文件里。

还有一个常被忽略的点：`@path` 引用并不能凭空省上下文。被引用的内容最终还是会进上下文，只是维护起来更清楚。如果某些规则只对特定目录生效，优先考虑 `.claude/rules/` 这类按路径加载的规则，而不是继续往 `CLAUDE.md` 里塞。

### 初始化和维护

新项目可以先运行：

```bash
/init
```

Claude 会读仓库，生成一份初始 `CLAUDE.md`。这份文件只能当草稿，千万不要直接用。它可能会猜错构建命令，也可能把显而易见的内容写得很长。

维护 `CLAUDE.md` 时，最容易犯的错不是写少了，而是越写越多。

Claude 偶尔犯一次错，先别急着加规则。等同类问题出现两三次，而且你能用一句明确指令挡住它，再写进去。反过来，代码里一眼能读出来的事实、模型本来就会做的事、已经过时的历史约定，都应该删掉。规则多不等于听话，很多时候只是把真正重要的几句冲淡了。

如果 Claude 明明读到了规则却还是没照做，先看规则本身是不是太软。比如“尽量保持测试完整”就不如“修改 Service 后必须运行对应单测，并贴出命令和结果”。如果同一条规则在多个会话里反复失效，那就要怀疑整份文件太长，或者规则放错了位置。

我一般会把规则分成两类：团队级、长期有效、必须共享的要求写进 `CLAUDE.md`；个人偏好、阶段性调试经验、临时提醒，交给 Auto Memory 或本地配置。`CLAUDE.md` 应该从真实错误里长出来，也要定期删掉失效内容，别维护成第二份 README。

写完规则后，也别默认它已经生效。可以用 `/memory` 看当前会话到底加载了哪些 `CLAUDE.md`、`CLAUDE.local.md` 和 rules 文件；如果某个文件不在列表里，Claude 这轮就看不到。复杂项目里用了带 `paths` 的 `.claude/rules/`，还可以用 `InstructionsLoaded` Hook 记录规则文件什么时候被加载、为什么被加载，别等出了问题才发现某条规则根本没进上下文。

## 权限管理要重视

### 分层授权

Claude Code 默认会对敏感操作弹确认，比如写文件、执行 Bash、调用 MCP 工具。刚开始这很烦，但这个烦是有价值的。你还不熟悉它会怎么行动时，不要急着把门全打开。

我一般先只放开那些看了也不会出事、跑了也不会破坏现场的命令：

- 高频只读命令可以放行，比如 `git diff`、`git status`、`rg`。
- 固定验证命令可以放行，比如 `mvn test`、`pnpm test`、`npm run lint`。
- 破坏性命令默认不放，比如 `rm -rf`、`git push --force`、修改 `.git/`。
- 凭据、环境文件和构建产物可以用 deny 规则挡住。

权限可以通过 `/permissions` 配，也可以写进 `.claude/settings.json`：

```json
{
  "permissions": {
    "allow": ["Bash(git status*)", "Bash(git diff*)", "Bash(rg *)"],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

规则不是写给模型看的，是 Claude Code 自己执行的。也就是说，就算 prompt 里写了“请一定不要读 `.env`”，那仍然只是建议；deny 规则才是真正的拦截。

### Auto Mode

如果频繁确认已经影响节奏，可以用 Auto Mode：

```bash
claude --permission-mode auto
```

它会用单独的分类器判断操作风险，低风险操作自动放行，高风险操作拦截或转人工确认。这个模式适合你大致信任当前任务方向，但又不想每次文件读写都点确认的场景。

不过 Auto Mode 不是安全沙箱。它解决的是“少点确认”，不是“随便执行也没事”。它只是在“是否放行某次操作”上帮你少点确认，不负责隔离文件系统、网络和凭据。真正高风险任务，还是要靠容器、临时账号、最小权限和人工 Review。

`--dangerously-skip-permissions` 我不建议在日常项目里用。除非你已经把文件系统、网络、凭据都隔离好了，否则它省下来的几次确认，可能换来一次很难收拾的误操作。

## 用 MCP、Skills、Sub-Agent 和插件解决不同的问题

Claude Code 的扩展能力很多，刚接触时容易混在一起。我的理解很简单：

| 能力              | 解决的问题                   | 适合场景                                     |
| ----------------- | ---------------------------- | -------------------------------------------- |
| `CLAUDE.md`       | 每次会话都要知道的项目背景   | 编码规范、常用命令、仓库约定                 |
| MCP               | 连接外部系统                 | 数据库、浏览器、Sentry、Slack、Notion、Figma |
| Skills            | 保存可复用流程               | 发布、修 Issue、写 Review、生成迁移脚本      |
| Code Intelligence | 提供符号、类型错误和引用关系 | 大型 Java / TS 项目、重构、跨文件修改        |
| Sub-Agent         | 隔离高消耗支线任务           | 大量搜索、日志分析、安全审查、并行研究       |
| Hooks             | 强制执行动作                 | 格式化、测试、禁止危险命令、提交前检查       |
| 插件              | 打包分发一整套能力           | 团队共享 Skills、MCP、Hooks、Sub-Agent       |

这几个东西不要互相替代。比如“每次编辑后必须跑 formatter”，写进 `CLAUDE.md` 只能靠 Claude 记得；写成 Hook 才是确定性执行。再比如“修 GitHub Issue 的步骤”，放 `CLAUDE.md` 会污染所有会话，做成 Skill 更合适。

### Code Intelligence：让 Claude 少靠全文搜索硬读

如果项目支持 Code Intelligence，建议尽量配上。它本质上是给 Claude 接了一套语言服务器能力，让它能直接看类型错误、找符号定义、查引用关系，而不是每次都靠 `rg` 搜一大片文件。

拿 Java 或 TypeScript 项目来说，Claude 想知道某个类在哪里定义、被谁调用，不一定非得先搜关键词，再挨个打开文件确认。通过 LSP，它可以直接跳到定义、查看引用，改完代码后还能马上发现类型错误。

这不能完全替代全文搜索，但能少读很多无关文件。项目一大，效果会很明显：上下文更干净，Claude 也不容易被一堆候选文件带偏。Claude Code 官方也建议类型化语言安装 Code Intelligence 插件，因为一次符号跳转，往往能省掉一次搜索加多文件读取。

### MCP：让 Claude 接上真实世界

MCP（Model Context Protocol，模型上下文协议）像一套接线规范：**外部系统把能力封装成 MCP Server，支持 MCP 的 AI 应用连接上来之后，就能发现这些能力并调用。**

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

它是 Claude Code 连接外部工具的主要方式。

你可以让它查数据库、读 Sentry 报错、访问浏览器、拉 Notion 文档、取 Figma 设计稿。

添加远程 MCP 服务器的命令大概长这样：

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp \
  --header "Authorization: Bearer your-token"
```

团队项目里，能共享的 MCP 配置可以放到 `.mcp.json`，再提交到仓库。比如某个项目统一要接 Notion、Sentry、内部文档系统，就可以把 server 名称、URL、transport 这些公共配置沉淀下来。

但私密 token 不要这么干。

带 token、密钥、数据库连接串的配置，放用户级配置、本地环境变量或者密钥管理系统里。

MCP Server 也不是越多越好。工具越多，Claude 越容易选错，也越难审计。平时可以用 `/mcp` 看当前连接状态和 token cost，不用的 server 先断开。

### Skills：把重复流程存下来

规则文件和 Skill 解决的问题不太一样。

规则文件更适合放这个项目一直要遵守什么，比如：技术栈版本、启动命令、目录结构、错误码格式、哪些文件不能碰。

Skill 更适合放遇到某类任务时应该怎么做。比如做代码审查、写测试、改前端页面、网页调研、写技术文章，这些任务每次流程都差不多，就没必要每次都在聊天里重新提醒一遍。

小 G 之前写过两篇相关的文章：[Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html) 和 [AI 编程必备 Skills 推荐](https://javaguide.cn/ai-coding/programmer-essential-skills.html)。

简单说，Skill 就是一份能被 Agent 按需加载的任务说明。它不是插件，也不是 MCP 工具本身，而是把某类任务的流程、约束、检查项和踩坑经验写进 `SKILL.md`。

Skill 不像 `CLAUDE.md` 那样把全文每次都塞进上下文。默认情况下，Claude 会先看到 Skill 的名称和描述，用来判断是否该调用；只有真正用到这个 Skill 时，`SKILL.md` 正文和相关资源才会进入上下文。用户级 Skill 放在 `~/.claude/skills/`，项目级 Skill 放在 `.claude/skills/`。

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-agent-execution-link.png)

这些重复性很强的流程，都适合沉淀成 Skill。比如写功能前固定走 TDD，先写失败测试再实现；代码审查时固定检查安全、事务、性能和边界条件；写技术文章时固定核对事实来源、引用、标题层级和 AI 味。

Skill 的价值就在这里：把重复提醒变成可复用的工作手册。官方对 Skill 的定义也基本是这个意思：它是一组可复用的指令、脚本和资源，用来让 Claude 按固定流程处理某类任务。

现成 Skill 也可以直接用，比如 Superpowers 把 TDD、Code Review、Spec-Driven、Git Worktree、子 Agent 协作这些流程封装好了。

我在 [AI 编程必备 Skills 推荐：TDD、代码审查与网页自动化实战](https://javaguide.cn/ai-coding/programmer-essential-skills.html) 这篇文章中有详细推荐。

但第三方 Skill 不要拿来就跑。`SKILL.md` 也是指令，里面如果带了危险命令、奇怪脚本、过宽权限，Agent 会照着做。装之前至少看一眼正文、`scripts/` 和 `references/`，确认它没有越权操作。

### 插件：优先从官方 marketplace 找

如果不想自己从零配 Skills、MCP、Hooks，可以先去 Claude Code 的官方插件市场 [`claude-plugins-official`](https://github.com/anthropics/claude-plugins-official) 翻一翻。

安装也很直接：

```bash
/plugin install <name>@claude-plugins-official
```

插件的好处是省事。一个插件里可能已经打包好了 Skill、MCP Server、Hooks 和一些辅助脚本，装完 Claude 就多了一套现成工作流，不用你一项项手动拼。

不过官方 marketplace 不等于可以闭眼装。插件最终还是会在你本地跑，有些还会碰文件系统、浏览器、GitHub、数据库或第三方服务。装之前至少看一眼说明、权限和源码来源；不用了就卸掉，别把 Claude Code 养成一个什么都能碰的工具箱。具体安装和发现方式可以看官方的 [Discover plugins](https://code.claude.com/docs/en/discover-plugins) 文档。

### Sub-Agent：让主会话保持干净

Claude Code 里还有一个很实用的能力，叫 Sub-Agent。

![Claude Code Sub-Agent：让主对话保持干净](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode-sub-agent.png)

它解决的问题很简单：当 Claude 需要调查一个复杂问题时，往往会读很多文件、搜很多代码、跑一些命令，最后主会话的上下文被一堆日志、搜索结果、文件内容塞满。Sub-Agent 的作用，就是把这类“高消耗的支线任务”拆出去处理。

你可以把它理解成一个独立上下文里的专项助手。它自己去读代码、查日志、分析问题，完成后只把结论汇报回主会话。这样主会话不用背着一大堆中间过程继续往下聊，干净很多。

Claude Code 内置了几类 subagent：

| **子代理**          | **模型**            | **用途**                       |
| ------------------- | ------------------- | ------------------------------ |
| **Explore**         | Haiku，偏快速低延迟 | 文件发现、代码搜索、代码库探索 |
| **Plan**            | 继承自主对话        | Plan Mode 下的代码库研究       |
| **general-purpose** | 继承自主对话        | 复杂研究、多步骤操作、代码修改 |

Explore 和 Plan 更偏只读研究，不负责直接改代码。general-purpose 能处理更复杂的多步骤任务，也可能涉及代码修改。所以用的时候要注意边界，不要把所有事情都丢给它。

你也可以创建自己的 subagent。项目级配置放在 `.claude/agents/`，适合团队共享；用户级配置放在 `~/.claude/agents/`，适合自己跨项目复用。每个 subagent 都可以配置自己的系统提示词、工具权限、模型，以及什么时候应该被调用。

我常用的方式有几种。

比如让 subagent 跑测试套件，只把失败用例和错误信息汇报回来；或者让不同 subagent 分别研究认证、数据库、API 模块，最后把结论合并到主会话。更复杂一点的任务，也可以先让 code-reviewer subagent 找性能问题，再让 optimizer subagent 尝试修复。

不过 subagent 也不是越多越好。任务太小、边界不清、代码还在剧烈变化时，拆出去反而会增加沟通成本。我的习惯是：主会话只管目标、关键决策和最后验收；subagent 只处理局部、明确、能汇报结果的专项任务。

如果后续用到 Agent teams，可以把它理解成比 subagent 更偏“多会话协作”的玩法。Sub-Agent 更适合隔离支线任务，Agent teams 更适合多个独立会话围绕共享任务协作。刚上手不用急着用，先把 Worktree、小步提交和验证流程跑顺。

一个自定义安全审查子代理可以这么写：

```markdown
---
name: security-reviewer
description: Reviews Java and Spring Boot code for security risks.
tools: Read, Grep, Glob, Bash
model: opus
---

Review the target diff for:

- SQL injection and unsafe dynamic queries.
- Authentication and authorization bypass.
- Secrets or credentials committed to code.
- Unsafe deserialization or command execution.

Return concrete file and line references. Do not rewrite code unless explicitly asked.
```

### Hooks：别把硬规则写成软建议

Hooks 是我觉得最容易被低估的一块。它可以在 Claude Code 的生命周期节点上执行动作，比如工具调用前、文件编辑后、会话结束前、上下文压缩前后。

举个例子，假设 Claude Code 准备执行：

```bash
rm -rf /tmp/build
```

`PreToolUse` Hook 会先拿到这次 Bash 调用，判断它是不是危险命令；如果命中规则，就返回 `deny`，Claude Code 会取消这次工具调用，并把拒绝原因反馈给 Claude。

下面这张图展示了整个过程，图源 Claude Code 官方文档对 Hooks 的介绍。

![Claude Code PreToolUse Hook](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-runs-rm-rf-tmp-build-what-happens.svg)

适合做 Hook 的事情：

- 编辑后自动格式化。
- 会话结束前跑测试。
- 禁止改 `migrations/` 或 `.github/workflows/`。
- 拦截 `curl | bash`、`rm -rf`、向外部端点发送敏感内容。
- 在 Sub-Agent 启动时注入额外上下文。

判断标准很简单：这件事如果漏掉一次会出问题，就用 Hook；如果只是希望 Claude 知道，才写进 `CLAUDE.md`。

## 最常用的工作流

### 探索、计划、执行、验证

复杂任务别一上来就让 Claude 写代码。先让它读仓库，暂时不要修改文件：

```text
进入 plan mode。先阅读 src/auth 和相关测试，搞清楚登录态刷新流程。
不要写代码，只汇报当前流程、关键文件和可能的修改点。
```

接着让它给计划：

```text
我要修复用户 session 超时后刷新 token 失败的问题。
基于刚才的阅读，列出要改的文件、测试策略和风险点。
```

你确认计划后再执行：

```text
按这个计划实现。优先补一个能复现问题的测试，再改实现。
完成后运行相关测试，把命令和结果贴出来。
```

这个流程慢在前面，快在后面。尤其是你不熟悉代码库，或者改动跨多个模块时，先计划通常能省掉后面大量返工。

小改动可以跳过计划。比如改一个文案、加一条日志、补一个明显空指针判断，直接让它做就行。过度规划也会浪费上下文。

### TDD 测试驱动开发

AI 写代码最大的问题不是慢，而是它很会写“看起来合理”的代码。TDD 能把这个问题压下去。

推荐提示词：

```text
先不要改实现。为 TokenRefreshService 写一个失败测试，
覆盖 session 已过期但 refresh token 仍有效的场景。
测试失败后再修改实现，直到测试通过。
```

这个顺序有两个好处：一是 Claude 必须先理解期望行为；二是你能看到它是不是真的复现了问题。否则它可能直接改一堆代码，然后告诉你“已修复”。

[AI 编程必备 Skills 推荐](https://javaguide.cn/ai-coding/programmer-essential-skills.html)中推荐的 Superpowers 就把 TDD 给封装好了。

### 让 Claude 自己验证

Anthropic 官方最佳实践里有一句我很认同：**给 Claude 一个能运行的检查。测试、构建、lint、截图对比、脚本输出都可以。**

不要只说：

```text
写一个邮箱校验函数。
```

换成：

```text
写一个邮箱校验函数。测试用例：

- hello@gmail.com 应该通过
- hello@ 应该失败
- @domain.com 应该失败
- a@b.co 应该通过

写完后运行测试，把命令和结果贴出来。
```

有了验收标准，Claude 才能从“看起来完成了”变成“检查通过了”。

如果任务会跑很久，可以再加一句“最多尝试 3 轮，仍失败就停下来汇报阻塞点”，避免它在错误方向上消耗太多 Token。

### 代码库问答

接手陌生项目时，Claude Code 很适合当临时向导。你可以直接问：

```text
用户登录的完整流程是什么？从 HTTP 请求进来到 session 写入为止，
列出关键类和方法，不要修改文件。
```

或者：

```text
这个项目里订单状态机在哪里定义？每个状态之间怎么流转？
如果有隐式约束，也一起指出来。
```

这种问题原本要问老同事，Claude 不嫌你问得细。

缺点也要承认：它总结出来的内容仍然要抽查，尤其是跨服务调用、配置开关、历史兼容逻辑，别全信。

### Bug 修复需要提供错误信息

很多人修 Bug 时会直接丢一句：

```text
登录有 bug，帮我修一下。
```

这类 prompt 基本是在让 Claude 猜。更好的做法是把原始材料直接给它：

```text
下面是线上报错日志、复现步骤和相关请求参数。
请先定位可能原因，不要马上改代码。
找到根因后，补一个能复现的测试，再修复。
```

日志、堆栈、Slack 讨论、Docker 输出、失败测试结果，都比你转述“好像是缓存问题”更有用。你一转述，就等于把 Claude 先带进了自己的猜测里。

### 多实例和 Worktree

不要让一个 Claude 做所有事。真正提效的方式，是把独立任务拆开并行跑。

Claude Code 支持用 Git Worktree 隔离不同会话：

```bash
claude --worktree feature-auth
claude --worktree bugfix-payment
```

`--worktree` 是 Claude Code 官方支持的参数，会在仓库下创建隔离 worktree 并启动会话；默认目录在 `.claude/worktrees/<name>/`，分支名通常是 `worktree-<name>`。如果你想完全自己控制目录和分支，也可以先用 Git 原生命令创建：

```bash
git worktree add ../project-auth -b feature-auth
cd ../project-auth
claude
```

每个 Worktree 有独立目录和分支，一个会话改认证模块，另一个会话修支付 bug，不会互相踩文件。官方桌面应用也会为新会话自动创建 Worktree，这个方向和 CLI 是一致的。

![Claude Code Git Worktree](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-git-worktree.png)

如果你已经有多个后台会话，可以用：

```bash
claude agents
```

Agent View 会把后台 session 放在一个界面里，看哪些在运行、哪些需要你确认、哪些已经完成。多会话用久了以后，这比开一排终端窗口清爽很多。

### Commit 和 PR 别一次塞太大

不要让 Claude 一次性提交一大坨改动。

我更愿意把它拆成小步提交。一个 commit 只做一件事，提交前让 Claude 先给出 diff 摘要、验证命令和剩余风险，自己再过一遍 `git diff --stat` 和关键文件的 `git diff`。

Claude 可以帮你写 commit message 和 PR 描述，这个它很擅长。但最后别只看它的总结。它说“只改了认证逻辑”，不如你自己看一眼 diff 可信。PR 描述里也别写虚的，写清三件事就够了：改了什么、怎么测的、还有哪些地方没完全兜住。

## 常用命令

命令不用背，真用的时候打 `/` 翻一下就行。我一般只记三类。

第一类是会直接干活的：

- `/simplify`：当前版本里会用 4 个并行 Agent 审查当前改动，重点找复用、简化、效率和抽象层级问题，并尝试应用清理类修复。v2.1.154 之后它不负责找 correctness bug，找 Bug 用 `/code-review`。
- `/batch`：把一个大需求自动拆成多个工作单元，开多个后台 Worker 在隔离 worktree 里并行干。适合边界清晰的多模块大改。
- `/loop`：既能定时跑任务，也能围绕一个目标反复执行、验证、修正。跑之前最好写清停止条件，比如最多尝试 5 次。
- `/run`：把应用启动起来，看改动是不是真生效。
- `/verify`：比 `/run` 更轻量，主要做构建和运行验证，快速确认有没有编译或运行时问题。

第二类是专门帮你看问题的：

- `/code-review`：日常 diff 审查的主力，关注正确性、边界条件和潜在 Bug，必要时可以配合 `--fix`。
- `/review`：更偏 PR 审查，适合对一个具体 Pull Request 做 review。
- `/diff`：看 Claude 到底改了哪些文件、哪些行。`/simplify`、`/batch` 跑完，我都会先看它。

第三类是救场用的：

- `/context`：看上下文占用，长任务变慢、变飘时先查它。
- `/compact`：总结并压缩上下文，长会话继续推进前用。

这些命令和 bundled skills 迭代很快，不同版本、平台和套餐看到的列表可能不一样。写文章时可以介绍经验，真到自己机器上用，还是先看 `/help` 和官方 commands 文档。别把某个版本里的行为当成永久稳定 API。

`/compact` 还有一个容易忽略的点：压缩之后，不是所有规则都会立刻回到上下文里。根目录的 `CLAUDE.md` 会重新注入，但子目录里的嵌套规则不一定马上回来。长任务压缩后，最好让 Claude 先复述一遍当前目标、已改文件、剩余风险和下一步验证命令，再继续往下跑。

命令细节我在 [Claude Code 核心命令详解：simplify、code-review、loop、batch、run、verify](https://javaguide.cn/ai-coding/claudecode-commands.html) 这篇里展开写过，这里就不重复铺太长了。

## 提示词怎么写更稳

### 尽量说英文，但别迷信英文

编程任务里，英文通常更稳一点。不是中文不行，而是代码、库名、错误信息、API 文档本来就大量使用英文。像 `modal`、`debounce`、`retry policy`、`transaction boundary` 这类词，硬翻成中文反而容易变味。

但业务背景、产品规则、中文文案，当然还是中文更准。我的习惯是：代码动作、技术约束和术语尽量用英文；业务语义、验收标准和中文文案用中文讲清楚。

### 限制范围

还有一种常见坑：直接写“调查一下这个项目”。Claude 会很认真地到处搜文件，读着读着，上下文就被填满了。

可以这样写：

```text
只调查 src/payment 和 src/order 目录。
目标是确认订单支付成功后库存扣减在哪里触发。
不要修改文件，只列出调用链和关键类。
```

范围、目标、禁止动作，这三件事写清楚，它就不容易乱跑。很多时候，提示词稳不稳，不在于写得多高级，而在于有没有把“别做什么”说清楚。

### 给金标准范例

让 Claude 按项目风格写代码，别只说“参考最佳实践”。这个范围太宽，它很容易写出一套看起来不错、但和你项目完全不搭的东西。

直接给它一个现有样板，效果通常更好：

```text
阅读 UserController.java、UserService.java 和 UserDTO.java。
参考它们的分层方式、构造器注入、Result<T> 返回格式和异常处理。
为订单查询补一个 OrderController，不要引入新的返回结构。
```

项目里的既有风格，往往比外面那套“最佳实践”更有约束力。尤其是老项目，分层、返回结构、异常处理、日志格式，很多都不是单纯的技术选择，而是历史包袱和团队习惯混在一起。让 Claude 先读样板，再让它照着补，通常比空口讲规范靠谱。

### 前端别只说“做得好看”

如果让 Claude 写前端，别只说“现代、简洁、高级”。

这类词太空，最后很容易得到一套熟悉的组合：Inter 字体、紫色渐变、大圆角卡片、满屏营销页味道。后台系统尤其容易翻车，本来是给运营同学高频使用的页面，结果做成了产品官网。

更具体一点：

```text
使用现有 Ant Design 组件，不新增 UI 库。
页面是后台运营工具，信息密度优先，不要营销页风格。
主色沿用项目 CSS 变量，不要新增紫色渐变背景。
参考 src/pages/UserList.tsx 的筛选区和表格布局。
```

设计规范也可以做成 Skill，让 Claude 每次写前端前先读项目视觉约束。这里的重点不是让它更有创意，而是先把不该出现的套路挡住。后台工具就按后台工具来，信息密度、可扫描性、操作反馈，比“氛围感”重要得多。

[AI 编程必备 Skills 推荐](https://javaguide.cn/ai-coding/programmer-essential-skills.html)中也有推荐前端相关的开源 Skills。

## 安全边界

Claude Code 很强，但它不是你的同事账号，也不该拥有同事账号的全部权限。

我建议至少守住几条线：

- 不把生产凭据、数据库密码、云厂商长期 token 暴露给 Claude。
- 不让它直接操作生产环境，除非有审批和审计。
- 不允许默认 push 到 `main` 或强推远端分支。
- 不让它在无隔离环境里执行来源不明的远程脚本。
- 不把 `.env`、`secrets/`、证书目录、SSH key、数据库 dump 和生产日志纳入可读范围。

不只是 `.env`。像 `~/.aws/`、`~/.gcp/`、`~/.kube/`、`~/.ssh/`、Maven `settings.xml`、npm token、生产日志和数据库 dump，都不应该随便暴露给 Claude。真要让它看日志，也尽量先脱敏、截取和限定范围。

真的需要自动化高权限任务时，放进容器、临时凭据、最小权限账号里跑。AI 写错代码还能 review，AI 拿错权限就麻烦多了。

## 常见失败模式

| 失败模式         | 症状                                   | 更稳的处理方式                                |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| 会话太杂         | 一个会话里同时聊需求、排错、重构、发版 | 切任务就 `/clear`，必要时写 `HANDOFF.md`      |
| 纠正死循环       | 同一处错误纠正 3 次还不对              | 停止当前上下文，重写起始 prompt               |
| `CLAUDE.md` 膨胀 | 规则很多，Claude 反而不遵守            | 保留真实犯错后总结出的规则                    |
| 无边界调查       | 一次读几百个文件，上下文耗尽           | 限定目录、目标和禁止动作，或交给 Sub-Agent    |
| 只看绿灯         | 测试通过但行为不对                     | 让 Claude 展示证据，对比 main 和 feature 分支 |
| 权限过宽         | 为了省确认，直接 bypass                | 用 allow/deny、Auto Mode、容器隔离分层处理    |

## 总结

Claude Code 用顺手以后，心态会慢慢变。

刚开始是“我让 AI 写点代码”，后面更像是在调度几个能读仓库、能跑命令、能自己回来汇报的助手。到了这个阶段，提示词当然还重要，但更影响结果的是那些很普通的工程习惯：`CLAUDE.md` 写清项目规矩，复杂任务先 plan，改动后必须 verify，长调查丢给 Sub-Agent，多任务用 Worktree 隔离，权限别一次放太开。

别急着让 Claude 接管一切。先让它在一个小范围里稳定做对，再慢慢把边界往外推。这个节奏不刺激，但我觉得更适合真实项目。
