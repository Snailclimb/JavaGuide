---
title: Claude Desktop 接入第三方模型实战：CC Switch 配置与本地代理原理
description: 通过 CC Switch 让 Claude Desktop 接入 DeepSeek 等第三方模型，拆解本地代理网关的配置接管、模型映射、协议转换与故障转移原理，并提炼可复用到 AI 应用工程实践的设计思路。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Desktop,CC Switch,第三方模型,DeepSeek,AI 编程,本地代理网关,模型映射,协议转换,断路器,故障转移,Anthropic Messages API
---

你好，我是小 G。前面我们聊过了如何用 [CC Switch 让 Codex 和 Claude Code CLI 接入第三方模型](https://mp.weixin.qq.com/s/We44s9R6ojgewtEwoeUweg)，今天我们聊聊如何让 Claude Desktop 也接入第三方模型。

这篇文章会从配置实操开始，然后拆解 CC Switch 的本地代理网关设计，最后聊聊 CC Switch 的设计思路怎么用到 AI 应用开发工程实践中。

## 安装 CC Switch

在 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 下载适合你的电脑系统的安装包。

![ccswitch下载页面](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-download-page.png)

> **说明一下**：本文的 Claude Desktop 配置流程依赖 3P profile 文件写入，而这个机制在 Linux 上不可用（Linux 版 Claude Desktop 不走 3P profile，通过环境变量配置）。Linux 用户可以参考 CC Switch 用户手册中的环境变量配置方式。后续的配置演示以 Windows 为准。

装好之后打开，左边栏会看到一排应用图标——Claude Code、Claude Desktop、Codex、Gemini CLI、OpenCode 等。它管了七款 AI 编程工具。这里我们选择 **Claude Desktop**，注意它和 **Claude Code** 是两个不同入口。

![ccswitch主页](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-home-page.png)

## 安装 Claude Desktop

在 [Claude 官网](https://code.claude.com/docs/zh-CN/desktop) 下载。Claude Desktop 的下载和服务可用性会受地区限制，如果页面提示当前地区不支持，需要换一个可用的网络环境再试。点击下载后，成功则会得到一个 Claude Setup，直接打开即可，后续会自动下载安装。

![成功下载](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/download-success.png)

![claude安装中](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/claude-installing.png)

如果当前网络环境不可用，会弹出地区不支持的提示。

![下载失败页面](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/download-failure-page.png)

下载并安装完成后，不需要先完成官方账号登录，直接打开 CC Switch 开始配置即可。

## 以 DeepSeek 为例：配置全流程

### 添加 DeepSeek Provider

在主页点左边栏的 **Claude Desktop**，然后点右上角的 **+** 按钮添加 Provider。CC Switch 内置了 50 多个 Provider 预设，DeepSeek 也在里面。

![ccswitch主页（标注）](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-home-page-annotated.png)

![配置供应商](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/configure-provider.png)

选 **DeepSeek** 预设后，填入 API Key 和模型即可。如果上游模型确实支持 1M 上下文，再勾选 **1M**；它的含义是向 Claude Desktop 声明该模型支持 1M 上下文，并不是强制把模型能力变成 1M。endpoint、模型名、认证方式等字段，预设里已经填好了。填完点添加，Provider 卡片出现在列表中。

这里重点说一下，“需要模型映射”这个一定要开。DeepSeek 的 endpoint 后缀是 `/anthropic`，说明 DeepSeek 已经实现了 Anthropic Messages API 兼容；但它的真实模型名是 `deepseek-v4-pro`、`deepseek-v4-flash` 这类非 Claude 角色 ID，而 Claude Desktop 只接受 `claude-sonnet-*`、`claude-opus-*`、`claude-haiku-*` 这三类角色路由，所以不能走直连模式，必须走模型映射。

如果你的 Provider 不在预设列表里（比如自定义中转站），选“自定义 Provider”手动填入 endpoint、模型列表和 API Key 即可，后面流程一样。

### 开启本地路由

模型映射模式依赖 CC Switch 在本地 `127.0.0.1:15721` 启动的代理网关。需要先打开这个开关。

回到主页面，点击左上角的设置，进入路由设置，打开本地路由，并勾选“在主页面显示本地路由开关”。回到 Claude Desktop 面板后，再打开 Claude Desktop 的本地路由开关。

![设置路由](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/routing-settings.png)

打开后 CC Switch 会做这几件事：

1. 在 `127.0.0.1:15721` 上启动一个 HTTP 代理服务
2. 把 Claude Desktop 的 3P profile 里的 endpoint 改写为 `http://127.0.0.1:15721/claude-desktop`
3. 把真实的 API Key 从配置文件中移除，换成占位符 `PROXY_MANAGED`
4. 真实凭据存在自己的 SQLite 数据库里，转发时代入

### 切换并重启

回到 Provider 卡片，启用 DeepSeek。然后 **完全退出 Claude Desktop 再重新打开**，因为 Claude Desktop 不支持热切换，必须冷重启。

重启后，如果你在模型菜单里看到了 DeepSeek V4 Pro 或 DeepSeek V4 Flash，说明生效了。选一个模型，正常发消息就行。

![claude进入](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/claude-model-menu.png)

这里我用到了一个非官方汉化包，因为 Claude Desktop 目前没有中文语言。非官方补丁有兼容性和安全风险，介意的话可以跳过这一步：[Claude Desktop 汉化包](https://yunyingmenghai.feishu.cn/wiki/VBDAwkAjEiXhBXkBX5jcLxXEnwh)。

### 常见坑

**切完没变化？**

确认完全退出了 Claude Desktop（macOS 上 `Cmd+Q` 而非点叉，Windows 上检查系统托盘是不是没退出）。

**模型列表不显示？**

检查模型映射表里菜单显示名是否为空、至少一行实际请求模型是否已填。

**请求报错？**

先确认 CC Switch 在后台运行、本地路由开关是开着的。然后检查 API Key 是否正确，endpoint 是否能通。

**想切回官方 Claude？**

在 Provider 列表里找到 Claude Desktop Official 预设，点启用，重启 Claude Desktop 即可恢复登录模式。

**配置文件在哪？**

排查问题时可能有用的路径：CC Switch 数据库在 `~/.cc-switch/cc-switch.db`（SQLite）。Claude Desktop 的 3P profile 相关文件在 macOS 的 `~/Library/Application Support/Claude-3p/` 或 Windows 的 `%LOCALAPPDATA%\Claude-3p\` 下；同时还会涉及 Claude Desktop 原有配置文件，比如 macOS 的 `~/Library/Application Support/Claude/claude_desktop_config.json` 和 Windows 的 `%LOCALAPPDATA%\Claude\claude_desktop_config.json`。

## 背后在跑什么：CC Switch 的本地代理网关原理

上面走完配置流程，需要注意一件事：模型映射模式要求 CC Switch 一直开着，关了就失效了。

这是因为 Claude Desktop 实际连接的地址是 `127.0.0.1:15721`，**是 CC Switch 本地路由服务，不是 DeepSeek 的服务器**。

这就是 CC Switch 的核心设计：一个运行在本机的反向代理网关。它做的事分四层：接管配置 → 提供 Claude Desktop 可识别的本地入口 → 请求翻译 → 响应回传。

### 架构全景

![cc-switch-architecture-arch.drawio](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-architecture-arch.drawio.svg)

这个网关充当的是本地协议适配层。DeepSeek 和 Claude Desktop 期望的模型路由、参数结构不完全一样，要想稳定通信，就需要在中间做一次转换。启用本地路由后，Claude Desktop 实际连接的是本机的 CC Switch；CC Switch 把请求翻译成上游 Provider 能懂的格式，带上你的 API Key 发过去，再把响应翻译回 Claude Desktop 能处理的格式。

明白了 CC Switch 的核心作用，接下来我们逐层拆开来看看到底是怎么回事。

### 接管配置

CC Switch 工作模式的关键点是**接管**。不开本地路由时，CC Switch 只是个静态配置工具，它把你的 Provider 配置写到 Claude Desktop 的 3P profile 文件里，Claude Desktop 自己去连上游。这个叫**直连模式（Direct Mode）**，配置文件写完后 CC Switch 关掉也不影响使用。

可一旦开了本地路由，CC Switch 就进入了**接管模式**。它会做三件事：

1. **备份配置**：把 Claude Desktop 当前的配置文件存到 SQLite 的 `live_backup` 表里
2. **注入代理地址**：把 3P profile 里的 endpoint 改成 `http://127.0.0.1:15721/claude-desktop`
3. **移除真实凭据**：把原始 API Key 从文件中拿掉，替换成 `PROXY_MANAGED` 占位符。真实 Key 从 CC Switch 自己的 SQLite 数据库里取

![cc-switch-config-takeover-flow.drawio](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-config-takeover-flow.drawio.svg)

通过本地路由接管之后，Claude Desktop 的所有 API 请求都会先经过 CC Switch 的代理网关。

> **说明一下**：接管是可逆的。在 CC Switch 里切回 Claude Desktop 官方模式（也就是从预设列表中选择“Claude Desktop Official”，点启用后重启 Claude Desktop），它会删除 CC Switch 管理的 3P profile，并恢复官方登录模式。

CC Switch 设计了一条「最小侵入」原则：接管期间配置文件的备份存在 SQLite 数据库中，可以随时恢复。但需要注意——如果你在接管模式下卸载了 CC Switch，Claude Desktop 的配置文件仍然指向已被删除的本地代理地址 `127.0.0.1:15721`，会导致无法连接。恢复步骤是：重新安装 CC Switch → 切回官方模式 → 重启 Claude Desktop。

### 进入第三方推理配置模式

Claude Desktop 客户端启动时，如果检测到有效的 3P profile 配置，就会进入第三方推理配置模式，不再要求先走官方账号登录流程。

CC Switch 正是利用了这一点。它写入的 3P profile 携带着必要信息：Provider endpoint、认证方式、API Key。Claude Desktop 读到之后，会把这个 profile 作为当前推理服务配置来使用。这也就是为什么前面我说不需要先完成官方账号登录的原因。

这个过程不是修改 Claude Desktop 内部认证逻辑，而是使用 Claude Desktop 支持的 3P profile 机制。可以类比企业软件里的 SSO 或托管配置：应用启动时先读取本地托管配置，有可用配置就按配置连接第三方推理服务，没有才回到官方登录流程。

### 请求翻译

这是整个网关最核心的部分。当一个请求到达 `127.0.0.1:15721`，处理管线是这样的：

![请求翻译](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-pipeline-flow.drawio.svg)

**模型映射**

举个例子，Claude Desktop 发送的请求里，`model` 字段可能是 `claude-sonnet-4-6`。但实际上你用的是 DeepSeek，上游 Provider 并不认识这个 Claude 角色路由。

接下来 CC Switch 会在转发前，根据你配的映射表做替换。比如在 CC Switch 里可以把 Sonnet 角色映射到 `deepseek-v4-pro`，把 Haiku 角色映射到 `deepseek-v4-flash`。DeepSeek 官方文档也提供了一套默认思路：`claude-opus*` 映射到 `deepseek-v4-pro`，`claude-sonnet*` / `claude-haiku*` 映射到 `deepseek-v4-flash`。实际怎么配，取决于你想让 Claude Desktop 菜单里的不同角色对应哪个上游模型。

这个映射不是简单的字符串替换。Claude Desktop 同时发了三个模型分组（Sonnet / Opus / Haiku），每个分组可能有多个模型 ID 候选，CC Switch 需要匹配正确的角色再替换。具体逻辑是优先精确匹配，没命中再回退到角色组默认。

管线中的 **Optimizer（优化器）** 在模型映射之前介入：对支持 prompt caching 的 Provider，自动注入 `cache_control` 头来降低重复请求的成本；同时调整 thinking budget 参数，确保预算在目标模型的有效范围内。但是如果 Provider 不支持缓存或不需要调整，直接跳过。

**格式转换**

如果你的 Provider 原生支持 Anthropic Messages API（比如 DeepSeek 的 `/anthropic` endpoint），格式转换层直接透传，几乎零开销。

但如果 Provider 只提供 OpenAI Chat Completions API（比如很多国内的中转站），CC Switch 就需要做完整的协议转换。下面是 Anthropic Messages API 和 OpenAI Chat Completions API 之间的主要映射关系：

| Anthropic Messages API | OpenAI Chat Completions API |
|------------------------|---------------------------|
| `model` (string) | `model` (string) |
| `messages[].role: "user"/"assistant"` | `messages[].role: "user"/"assistant"` |
| `system` (string/array) | `messages[].role: "system"` |
| `max_tokens` (required) | `max_tokens` (optional) |
| `stop_sequences` | `stop` |
| `temperature` | `temperature` |
| `top_p` / `top_k` | `top_p` |
| `tools[]` (自定义 schema) | `tools[]` (JSON Schema) |
| `thinking` (extended thinking) | `reasoning_effort` (OpenAI o-series) |

还有个重点：Thinking 功能的转换。

Anthropic 的 extended thinking 允许你指定 `budget_tokens`（思考预算），而 OpenAI 推理模型会使用 `reasoning_effort` / `reasoning.effort` 这类枚举值（不同接口和模型支持范围会有差异，例如 `low` / `medium` / `high` / `xhigh`）。CC Switch 的转换逻辑可以按预算区间映射到不同 effort：

| Anthropic Thinking 配置 | OpenAI reasoning_effort |
|------------------------|------------------------|
| `thinking.type: "adaptive"` | `xhigh` |
| `thinking.budget_tokens` < 4000 | `low` |
| `thinking.budget_tokens` 4000–15999 | `medium` |
| `thinking.budget_tokens` ≥ 16000 | `high` |

响应时也是类似的反向映射，从 OpenAI 响应中提取 thinking token 或 reasoning 信息，还原成 Claude Desktop 能处理的格式。做对了用户无感，做错了就可能丢信息。CC Switch 还内置了 **Rectifier（修复器）** 来纠正上游不兼容的参数，比如某些 Provider 会在 thinking 响应中返回无效的 `signature` 字段，直接去掉避免错误。

> 除了 Anthropic 和 OpenAI 之间的相互转换，CC Switch 还支持 Gemini Native API 格式的转换。三条转换通道覆盖了市面上绝大多数模型 API。但并不是所有 Provider 都能完美转换——比如一些自建服务的 streaming 实现不全，可能出现 chunk 丢失。这个是协议转换层固有限制，不是 CC Switch 的 bug。

### 容错机制

CC Switch 支持为一个应用配多个 Provider，并且有自动故障转移。

**Provider Router** 维护了一个按优先级排序的 Provider 列表。当请求到达时，它从 P1（最高优先级）开始尝试。如果 P1 失败，自动跳到 P2。

**断路器（Circuit Breaker）** 负责判断什么时候该跳过某个 Provider。每个 Provider 独立维护一个断路器实例，有三个状态：

| 状态 | 含义 | 行为 |
|------|------|------|
| Healthy | 正常 | 请求正常通过 |
| Degraded | 部分失败 | 仍可用，但降低优先级 |
| Open（熔断） | 连续失败超过阈值 | 跳过，不尝试 |

断路器会配置一个触发阈值（默认连续失败 N 次后熔断）。一旦熔断，Router 就不再给这个 Provider 分配请求，直到手动恢复或超时自动重试。

这套机制的意义在于：**你不会因为某个模型临时不可用而完全无法工作**。比如你用 DeepSeek 作为主力，同时配一个 OpenAI 兼容的备用 Provider，如果 DeepSeek 挂了，请求自动切到备用，你甚至可能感知不到。

### 为什么 Claude Code 支持热切换而 Claude Desktop 不行

这里有一个很容易被忽略的设计差异。

Claude Code 是 CLI 工具，每次启动时读取配置文件。CC Switch 用接管模式把配置里的 endpoint 指向 `127.0.0.1:15721` 之后，Claude Code 的请求始终发往这个本地地址。你在 CC Switch 里切换 Provider，只改变了代理网关内部的路由表。对 Claude Code 来说，它看到的 endpoint 地址没变。所以 Claude Code 支持热切换，不需要重启。

Claude Desktop 也是连到 `127.0.0.1:15721`，但它在启动时会做一次模型列表拉取（调用 `/v1/models`），并缓存模型菜单。切换 Provider 意味着映射表变了，模型名可能也变了，如果不重启 Claude Desktop 就不会重新拉取模型列表，菜单显示的还是旧数据。所以必须冷重启。

这其实体现了 CC Switch 的设计取舍：它没有试图去改 Claude Desktop 的内部行为，而是把自己放在 Claude Desktop 能识别的边界内工作。它控制的是 Claude Desktop 能看到的 endpoint 和模型列表，至于 Claude Desktop 怎么缓存、什么时候刷新，那是客户端自己的行为。这样边界清晰，也更容易维护。

## 这些设计思路怎么用到 AI 应用开发里

拆完 CC Switch 的原理，你会发现有些思路其实可以搬到自己的 AI 应用工程实践中。

### 代理网关模式：解耦模型调用与应用逻辑

想象一下，你写了半年的 AI 应用，代码里硬编码了 `openai.chat.completions.create(model="gpt-4o")`。某天老板说我们要换 DeepSeek，省钱，你开始改代码。又过两个月，换 Claude 吧，效果好，你又改一遍。

你可以借鉴 CC Switch 的做法：**在所有 AI 客户端和上游 API 之间插入一层自己的网关，客户端永远只跟网关对话，网关来决定把请求发给谁**：

![代理网关模式](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-gateway-pattern-arch.drawio.svg)

网关负责三件事：

1. **路由决策**：根据请求上下文（任务类型、优先级、预算）选择合适的模型。简单总结用 Haiku/Flash 级别模型，复杂推理用 Opus/Pro 级别。
2. **协议适配**：你的应用只说一种 API 格式（比如 Anthropic Messages），网关负责翻译成各 Provider 的原生格式。换模型不需要改应用代码。
3. **统一鉴权**：所有 API Key 存在网关侧，应用不需要知道任何 Key。权限管控和安全轮换也集中处理。

对内部工具或小规模应用来说，一个轻量网关加上 Provider 配置表就能先跑起来：

```yaml
# 网关的 provider 配置
providers:
  - id: deepseek-v4
    endpoint: https://api.deepseek.com/anthropic
    auth: bearer
    models: [deepseek-v4-pro, deepseek-v4-flash]
    priority: 1
  - id: claude-sonnet
    endpoint: https://api.anthropic.com
    auth: x-api-key
    models: [claude-sonnet-4-6]
    priority: 2
```

当你需要加一个新模型时，可以先从新增一条 YAML 配置开始，重启网关后让应用继续访问同一个内部 endpoint。真正上生产时，还要补上配置校验、灰度发布、审计日志和回滚策略。

### 配置管理：SSOT + 原子写入 + 双向同步

**SSOT（单一数据源）**

CC Switch 把 Provider 等配置集中存在 SQLite 数据库 `~/.cc-switch/cc-switch.db` 里，再按目标工具写出对应配置。这样可以避免“这个 JSON 文件里一套配置、那个 TOML 文件里又有一套”的状态分叉。查询、备份、恢复和同步，主要盯住这一处数据源即可。

你自己的项目也可以看情况用这个思路：不要散落 `config.yaml` + `.env` + 环境变量 + 数据库配置表四套源头。选一个作为 SSOT，其他地方都从这里派生。

**原子写入**

写配置文件时不是直接覆盖，而是先写到临时文件，确认写入成功后再 `rename` 替换原文件：

```text
写入步骤：原文件 → 临时文件 → rename 覆盖 → 删除临时文件
```

这样可以防止写入过程中进程崩溃或者磁盘满了导致配置文件损坏。配置损坏对 AI 应用来说是隐蔽的灾难——应用可能默默回退到默认配置，但是你完全不知道。

**配置同步**

CC Switch 的管理界面和实际运行配置文件之间需要保持同步：你在界面里改 Provider，要写进 AI 工具的配置文件；如果外部配置被手动改过，管理界面也要能重新读取或至少提示用户重新同步，避免界面状态和运行状态不一致。

迁移到自己的应用里时，更稳的做法是：配置变更后发事件通知所有订阅者，而不是依赖定时轮询。比如：

```text
ConfigStore 变更 → emit("provider:updated") → ProxyRouter 重载路由表
                                              → UI 刷新 Provider 列表
                                              → UsageTracker 更新模型定价
```

### 故障转移：不止是换一个

很多 AI 应用做故障转移，就是 `try A except call B`。能用，但不够。

CC Switch 的断路器思路可以抽象成连续失败计数和自动恢复逻辑。如果你的应用里同时接了多个模型 API，这类模式可以直接借鉴：

```python
class ModelCircuitBreaker:
    def __init__(self, failure_threshold: int = 5):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.state = "healthy"

    def call(self, provider, request):
        if self.state == "open":
            raise CircuitOpenError()
        try:
            result = provider.call(request)
            self.failure_count = 0
            return result
        except Exception:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise
```

熔断之后不要永远不用。加一个半开（Half-Open）状态：等 N 秒后允许一条探测请求通过，成功了就恢复，失败了继续熔断。三条状态的状态机通常是这样的：

![cc-switch-circuit-breaker-state.drawio](https://oss.javaguide.cn/github/javaguide/ai/claude-desktop/cc-switch-circuit-breaker-state.drawio.svg)

### 局限：这套方案也有不完美的地方

CC Switch 的方案很实用，但有几个固有局限你得知道。

**单点故障**。网关跑在本机，如果 CC Switch 进程崩了，所有依赖代理的 AI 工具全部断开——Claude Desktop 连的是 `127.0.0.1:15721`，这个地址没有进程在监听时，请求就是 connection refused。生产环境里你不会把网关和业务应用放在同一个进程，但本机工具类场景下这是合理的取舍。

**协议转换有损**。Anthropic Messages API 和 OpenAI Chat Completions API 并不是一一对应的关系。两边的 tool call/content block 结构、流式增量格式、thinking/reasoning 字段和部分扩展参数都不完全一样。转换层只能尽力映射，部分高级特性可能会丢失或降级。

**模型能力差异不可见**。网关能帮你切换模型，但不能帮你抹平模型之间的能力差异。不同模型的上下文长度、工具调用稳定性、代码生成风格、推理预算和价格都不同。换了 Provider 之后，你的 prompt 策略、超时、重试和评测集很可能也要跟着调整。这个不是网关层能完全解决的问题。

---

CC Switch 做了一件说起来简单但做好不容易的事：**在客户端和 API 之间加了一层，让客户端尽量无感地切换模型**。接管配置、模型映射、格式转换、断路器这些设计，不是凭空造出来的，而是对着真实问题一步步补出来的。把它拆开看，做 AI 应用工程时很多基础问题都可以用类似思路解决。

## 参考资料

- [CC Switch GitHub](https://github.com/farion1231/cc-switch)
- [CC Switch 官方文档 - Claude Desktop Providers](https://www.ccswitch.io/zh/docs?section=providers&item=claude-desktop)
- [CC Switch 用户手册 - Claude Desktop 配置](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/2-providers/2.6-claude-desktop.md)
- [Anthropic Docs - Cowork on 3P Installation and setup](https://claude.com/docs/cowork/3p/installation)
- [Anthropic Docs - Cowork on 3P Overview](https://claude.com/docs/cowork/3p/overview)
- [DeepSeek API Docs - Integrate with Claude Code](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code)
- [DeepWiki - CC Switch Proxy Architecture](https://deepwiki.com/farion1231/cc-switch/5-local-proxy-service)
- [DeepWiki - CC Switch Request Processing Pipeline](https://deepwiki.com/farion1231/cc-switch/5.3-request-processing-pipeline)
- [CC Switch Issue #2337: DeepSeek 1M 上下文后缀问题](https://github.com/farion1231/cc-switch/issues/2337)

<!-- @include: @article-footer.snippet.md -->
