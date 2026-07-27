---
title: oh-my-pi 开源终端 AI 编码代理体验
description: 介绍 oh-my-pi 的核心能力，包括 Hashline 补丁机制、LSP 与 DAP 集成、内置工具、多模型路由、安装配置和使用建议。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: oh-my-pi,omp,AI编程,终端AI编码代理,Claude Code替代,OpenCode,Codex CLI,Hashline,LSP,DAP,多模型路由
---

和阿里的朋友确认了一下，从 7 月 10 日起，阿里会把 Claude Code 列入高风险软件名单，并推荐内部员工使用 Qoder 作为替代。

这事就不展开讨论了。

虽然 A 社经常不干人事，但 Claude 模型和 Claude Code 确实做的好。和同类产品相比，依然是最稳的那一个。毕竟是商业化项目，团队都是大牛，产品发布节奏非常快。

同类型项目，知名一点的有 OpenCode、Codex CLI、Cline、Trae、Qoder，之前 DeepSeek TUI 后来还改名成了 CodeWhale。

前两天群里有朋友丢了一个 **oh-my-pi** 的 GitHub 链接，说最近用着还挺舒服。

我一开始也没太当回事，内心 OS：**又一个终端 Agent？它和 Claude Code、OpenCode、Codex CLI 的区别在哪？**

用了几天之后，我的态度转变了。

## 它是什么

oh-my-pi 是一个开源的终端 AI 编码代理。

安装成功之后，你在项目目录里执行 `omp` 命令，然后就可以让它读代码、改代码、跑命令、解释报错、生成提交说明。

这和 Claude Code、Codex CLI 这些工具都差不多。

差异主要在 **工具层**。

LSP、DAP、Hashline、browser、GitHub、子 Agent、多模型路由这些东西，它都塞进了终端里。

比如重命名函数时，它可以用语言服务器查引用，少靠 `grep` 硬猜；调一个崩溃时，它可以进调试器看栈帧和变量；看 PR 时，也可以把 PR 当成一种可读取的资源。

还有个很主观的小点，它的终端 UI 我还挺喜欢，很符合我的品味。

这个不算核心能力，但天天盯着终端干活的人应该懂，界面顺眼真的会影响心情。

## Hashline

很多 Agent 改文件，实际还是 `old_string -> new_string`。

先读一段文件，再让模型把原文复述出来，然后工具拿这段原文去匹配替换。

这个方案的问题，大家应该都遇到过。

少一个空格，多一个换行，缩进差一点，补丁就找不到位置。更麻烦的是，你刚手动改过文件，模型还拿旧上下文去改，新旧内容一混，现场直接乱掉。

oh-my-pi 的 `edit` 工具里有个东西，叫 **Hashline**。

`@oh-my-pi/hashline` 把它描述成一种 compact、line-anchored patch language。大概意思是，读文件的时候，每一行会带一个内容 hash；模型改文件时围绕 hash 做修改，少复述整段原文。

![oh-my-pi Hashline 官方说明截图](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-hashline-doc.png)

如果文件中途变了，hash 对不上，补丁会先被拒掉。

这不只是为了把 patch 写短，更重要的是多了一层稳定定位和校验。模型不可能永远把原文背得一字不差，所以工具层先加一道保险。

官方 benchmark 里提到，Grok 4 Fast 在同类任务中输出 token 少了 61%。这个数字我没有复现实验，所以这里只当成项目方口径，看趋势就行。

相比省 token，我更在意坏补丁能不能早点被挡下来。真在项目里用，少一次乱改，比少几百个 token 更重要。

## 最像 IDE 的地方

oh-my-pi 最像 IDE 的地方，在于它把 LSP 和 DAP 这两套 IDE 常用能力直接接进了 Agent 工具面。

官方将其拆分成两类：

- `lsp` 负责 diagnostics、navigation、symbols、renames、code actions、raw requests；
- `debug` 负责 DAP 会话里的 breakpoints、stepping、threads、stack、variables。

这两个词听着偏底层，放到日常编码里其实很好理解。

**LSP 负责回答代码结构是什么。** 比如一个函数在哪里定义、被哪些地方引用、当前文件有哪些诊断、某个重命名会牵动哪些导入和 re-export。

以前 Agent 想改函数名，很多时候只能先 `grep`，再让模型判断这些命中是不是同一个符号。这个过程很容易混进注释、字符串、同名变量，尤其是 TypeScript 这种项目里，barrel export、路径别名、重导出一多，纯文本搜索就开始不够用了。

如果它能走 LSP 的 rename、references、diagnostics，至少拿到的是语言服务器眼里的代码关系。模型还是会判断错，但它不再完全站在文本外面猜。

这点对我挺重要。

让 Agent 写代码，我最担心它一本正经地猜调用关系，猜错了还继续往下写。LSP 至少给它一张更接近 IDE 的地图。

**DAP 负责另一件事：运行时。**

以前让 Agent 调试，它很容易走到一个套路：加日志，运行，看输出，再加日志。这个办法当然有用，但遇到 native 崩溃、Go 服务 hang 住、Python 进程卡住这种问题，只靠日志很慢。

有了 DAP，它至少可以打断点、单步执行、看线程、看调用栈、读变量。这里拿到的是运行时状态，不只是文本匹配结果。

当然，这不代表它就一定能把 bug 修好。只是它调试时看的东西，开始接近一个真人开发者会看的东西：先看停在哪，再看变量怎么变，最后再决定补丁怎么写。

所以我更愿意把这一块理解成“终端里的 IDE 能力”。它和后面的工具数量不是同一个维度。

后面那些 `eval`、`task`、`browser`、`github` 更像是 Agent 工作台；LSP 和 DAP 才是它最像 IDE 的核心。

## 工具非常丰富

多数 Agent 的内置工具都比较克制：读文件、搜文本、改文件、跑命令。再重一点的活儿，通常交给 MCP server。

omp 走的是另一条路。一共 32 个内置工具，看起来有点重，但也确实有几个工具挺有代表性。

先说 `eval`。它内置常驻 Python 和 Bun JS 内核，不是跑完就扔的一次性沙箱。更关键的是，这两个内核还能反过来调用 omp 自己的工具，比如 `read`、`search`、`task`。Agent 可以在 Python cell 里读 CSV，再切到 JavaScript cell 里处理数据，过程中不用离开会话。

当前的多 Agent 协调工具是 `task`、`hub`、`todo` 和 `ask`，不是旧资料里的 `task` / `irc`。`task` 负责 fan-out 子 Agent，每个 worker 可以使用自己的工具面，也可以隔离到单独 worktree；`hub` 用于 live Agent 的协作与消息，`todo` 管任务状态，`ask` 用于发起结构化询问。具体字段变化较快，以当前工具描述为准。

`browser` 基于 Puppeteer，也提供 stealth 相关处理，并能通过 CDP 驱动 Electron 应用。Stealth 只能减少部分常见自动化特征，不能保证网站把它识别为普通用户，更不能绕过网站条款、登录限制或反自动化策略。

`github` 是我更喜欢的一块。它没有让模型再学一堆 `gh_issue_view`、`gh_pr_view`、`gh_search`，而是把 PR 当文件系统路径读。`read pr://1428` 拿到的结构，和 `read src/foo.ts` 是同一个思路；`search` 也能像遍历目录一样遍历 diff。这个抽象还延伸出了 `pr://`、`issue://`、`agent://`、`skill://`、`rule://`、`conflict://` 等内部 scheme。

我顺手拿 JavaGuide 的一个 issue 试了下。它先读 issue，再去仓库里找对应 Markdown，接着顺着图片链接继续读。

![oh-my-pi 读取 GitHub issue 并追踪仓库文件](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-github-issue-read.png)

还有个 `advisor`，可以挂一个 reviewer 模型。它每轮都看主 Agent 的输出，然后把提醒 inline 注入回来。它跑自己的上下文和自己的模型，专门挑主 Agent 漏掉的东西。这个设计有点像旁边坐了个只负责挑刺的人。

这些工具单独看不一定都新鲜，放在同一个工具面里就有点不一样了。读本地文件、读 PR、读子 Agent 结果，都尽量收敛到“读取资源”这个动作上，模型少学一堆奇怪接口。

但工具多也有另一面：路由层会更复杂，误调用工具的机会也会变多。所以我不建议第一次就全配上。

多模型、多工具、多记忆，听起来很爽，但配置、成本和权限都会跟着上来。尤其是 `bash`、`write`、`edit`、`browser`、`github`、`ssh` 这种工具，开之前最好想清楚它能碰到什么。

部分工具默认关闭，清单会随版本变化，建议直接查看当前 `/tools` 或帮助信息，不在文章里维护静态名单。

真要收窄工具面，可以用 `--tools read,edit,bash,...` 只暴露一部分。当前隐藏能力通过 `xd://` 资源发现机制按需暴露，不再使用旧资料里的 `search_tool_bm25`。

这个默认策略是对的。终端 Agent 最麻烦的地方往往不在能力少，而在权限给太多之后，自己也记不清它能碰哪里。

## 多模型提供商与角色路由

模型列表我一开始没想到会这么满。

不仅仅是 OpenAI、Anthropic、Gemini 这三家国外比较火的，像 Cursor、Copilot、Kimi Code、Moonshot、通义、Qwen Portal、GLM、小米 MiMo、Qianfan 这类编码订阅也能看到；本地模型这边，Ollama、LM Studio、llama.cpp、vLLM、LiteLLM 等等也有。

另外，它还支持 5 个角色路由，`default`、`smol`、`slow`、`plan`、`commit`。

我会把 `default` 当主力模型，平时读代码、改代码、问问题都先走它。`smol` 更适合丢给子 Agent 做批量查文件、扫信息这种小活儿，便宜一点、快一点就行，不指望它做复杂判断。

真遇到架构判断、难 bug、长上下文推理，再让 `slow` 上更强也更贵的模型。`plan` 用来先想清楚改哪几个文件、步骤怎么拆，`commit` 则留给 changelog、提交说明这种固定格式的文字活儿。

![oh-my-pi 在模型面板里把同一个模型设置为不同角色](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-model-role-actions.png)

这样日常对话、子 Agent、深度推理、规划和提交说明就不用挤在一个模型上。它更像成本和质量分流，不会让模型本身凭空变强。主会话里按 `Ctrl+P` 就能轮着切，也可以用 `/model` 手动换。

我不会一上来就把这些都配满。先让 `default` 跑稳，再考虑 `smol` 和 `slow`。fallback chain、按路径 scope 模型、多 key 轮询这些东西看着很香，但第一天就全开，出问题时很难判断是哪一层在抽风。

## 怎么上手

安装就是一行命令的事，很简单。

macOS / Linux：

```sh
curl -fsSL https://omp.sh/install | sh
```

Homebrew：

```sh
brew install can1357/tap/omp
```

Bun：

```sh
bun install -g @oh-my-pi/pi-coding-agent
```

Windows PowerShell：

```powershell
irm https://omp.sh/install.ps1 | iex
```

项目要求 `bun >= 1.3.14`，仓库根目录的 `package.json` 也写着 `packageManager: bun@1.3.14`。如果你用 Bun 安装，先看一下版本，别卡在环境上。

装好之后，找一个不那么重要的项目试就行。

```sh
cd your-project
omp
```

第一次进去不会马上开始聊天，它会先让你做一个 setup。

先选要登录的 provider。这里可以连多个，比如 ChatGPT Plus/Pro、Anthropic、Z.AI、Kimi Code、OpenRouter、Copilot、Cursor 这些都会列出来。你已经配过环境变量的 provider，也会直接显示 logged in。

![oh-my-pi 第一次启动选择模型 provider](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-setup-provider-login-kimi.png)

![Kimi Code 会员权益页面](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-kimi-code-home.png)

然后切到 Web search，选择 `web_search` 工具优先使用哪个搜索后端。当前项目已扩展到约 25 个后端，静态列出名称很快会过期；选 `Auto` 时会从已经配置好的后端中选择，手动模式以当前 Setup 页面为准。

![oh-my-pi 第一次启动选择 Web search provider](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-setup-web-search.png)

这一步不用纠结太久。先把一个主模型和一个搜索 provider 跑通，比一上来把所有账号都接进去更稳。

配置完回到主界面后，我这里模型已经直接选好了，左侧显示的是 `DeepSeek V4 Flash`。

![oh-my-pi 启动后自动选中默认模型](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-welcome-default-model.png)

我一开始还愣了一下：我刚才好像没手动选 DeepSeek，为什么它自己配好了？

于是顺手问了它。它的解释大概是：oh-my-pi 内置了一份模型目录，启动时会按顺序找可用凭据，比如命令行参数、`models.yml`、之前 `/login` 保存的 key / OAuth、环境变量和几个 `.env` 文件。只要它发现 `DEEPSEEK_API_KEY` 这类变量能匹配上，就会把对应 provider 下的模型标成可用，再自动挑一个初始模型。

![oh-my-pi 解释模型为什么会自动配置](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-model-auto-config-reason.png)

后面想换模型也不用重启，直接用 `/model`。它只会展示已经有可用凭据的模型，上面还能按 provider 切 tab。我这里能看到 DeepSeek、Z.AI、Ollama、LM Studio、llama.cpp 这些入口。

![oh-my-pi 使用 model 命令切换模型](https://oss.javaguide.cn/github/javaguide/ai/coding/oh-my-pi/oh-my-pi-model-switch.png)

如果要看当前版本有哪些命令和参数，直接跑：

```sh
omp --help
```

如果你之前用过 Claude Code、Codex CLI、Cursor、Windsurf、Gemini、Cline 这些工具，它还会去读磁盘上已有的 rules、skills 和 MCP servers。像 `.claude`、`.cursor`、`.windsurf`、`.gemini`、`.codex`、`.cline`、`.github/copilot`、`.vscode` 这些目录，都在它会看的范围里。

## 总结

oh-my-pi 的特点主要集中在工具层：Hashline 用于提高补丁定位的稳定性，LSP 和 DAP 提供代码结构和运行时状态，`github`、`browser`、`task`、`eval` 等工具把不同资源接入同一会话。

工具多也意味着权限面更大。`github`、`browser`、`memory`、`ssh` 等能力建议按任务逐项启用；涉及账户、私信、仓库写操作和远程主机时，先确认权限范围、审计记录和服务条款。

对于已经习惯终端工作流、愿意折腾模型、工具和权限的人，可以拿一个个人项目玩一下。只想要一个少配置、打开就能用的稳定工具，那 Claude Code 还是更省心。

oh-my-pi 现在最吸引我的地方，是它把开源 Agent 的工具层往前推了一步。东西多，野心大，亮点也很明确，但信任得一点点试出来。

项目地址：[https://github.com/can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)

官网：[https://omp.sh](https://omp.sh)
