---
title: Agent Skills 是什么？和 Prompt、MCP 到底差在哪？
description: 从工程视角聊 Agent Skills：它和 Prompt、Function Calling、MCP 的边界，为什么要做延迟加载，Skill 路由怎么设计，以及 SKILL.md 怎么写得更稳。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Agent Skills,MCP,Function Calling,Prompt,AI Agent,智能体,延迟加载,上下文注入
---

2025 年前后，MCP 已经把“工具怎么接进来”这个问题讲得很热，后面 Agent Skills 又冒出来，很多人第一反应都是：**这不还是提示词吗？**

这个疑问挺正常。因为 Skills 的载体确实经常就是一个 Markdown 文件，里面写规则、流程、示例，看起来和 Prompt、`AGENTS.md`、`.cursorrules` 没有特别夸张的区别。

但真放到 Agent 工程里看，它们解决的问题不一样。

Prompt 更像一次性的意图表达，你让模型“帮我 review 这段代码”，这句话说完就进入当前会话，后面换个项目、换个上下文，很难稳定复用。

MCP 解决的是外部系统接入，文件系统、数据库、GitHub、Slack 这类能力，通过 MCP Server 暴露给宿主，模型才有机会读文件、查数据、调接口。

Function Calling 更底层一点，它描述的是模型怎么输出结构化调用意图，比如要调哪个工具、参数怎么填，至于这个工具背后是本地函数、MCP Server，还是某个脚本，那是宿主去执行的事。

Skills 则是另一个层面：**把一类任务的经验、约束和执行顺序沉淀下来，让 Agent 在需要时再读**。

这句话比较绕，换个例子就清楚了。团队里经常会有一些“老员工脑子里的规矩”：接口返回格式怎么统一，日志字段怎么打，慢 SQL 怎么查，Review 时先看架构还是先看异常处理。以前这些东西要么散在文档里，要么靠人反复提醒。Skill 做的事情，就是把这些判断写成可被 Agent 发现、按需加载的说明。

不要把 Skill 当成一个神秘的新概念，说白了它就是一份“可调用的经验包”。这样就好理解了。

通过阅读这篇文章，你可以搞懂下面这些问题：

1. Skill 和 Prompt、Function Calling、MCP 的边界到底在哪
2. 一个可用的 SKILL.md 具体长什么样，为什么元数据和正文要分开写
3. 延迟加载的设计思路和实际分层策略
4. Skill 数量上来之后，路由怎么设计
5. 写 Skill 时最容易踩的坑

## 先把边界讲清楚

很多文章一上来就把 Prompt、MCP、Function Calling、Skills 做成表格。表格当然清楚，但也很容易让人误以为它们是同一层的四个竞品。

实际上不是。用户说一句“帮我分析这份报表”，这是 Prompt。模型判断需要调用 `read_file`，并生成结构化参数，这是 Function Calling。`read_file` 这个能力如果来自 MCP Server，那 MCP 负责的是连接和协议。至于“分析报表时先看字段含义，再看异常值，最后给业务结论，不要直接堆统计指标”，这才是 Skill 适合放的东西。

放在一个真实链路里，大概是这样：

1. 用户提出任务。
2. 宿主把可用 Skills 的简短描述放进上下文。
3. 模型判断当前任务命中了某个 Skill。
4. 宿主再把完整 `SKILL.md` 加载进来。
5. 模型按照 Skill 里的流程去调工具、读资料、写结果。

注意重点：它把复杂任务的做法提前写下来，至于调不调工具看具体场景。有的 Skill 全程不需要外部工具，比如代码审查规范；有的 Skill 会一路调 MCP、跑脚本、读参考文件，比如故障排查。

所以我不太建议把 Skill 说成“基于 Function Calling 的封装”，这个说法容易把人带偏。Function Calling 是执行动作时可能用到的底层能力，Skill 本身更像上下文注入机制：Agent 读一份文档，然后把里面的规则纳入后续推理。

`load_skill()` 也要这样理解：它不是所有工具里都存在的统一 API 名字，更像一个概念，表示宿主在合适的时候读取并激活 `SKILL.md`。

Claude Code、Cursor、Codex、Copilot 这些工具的触发细节会有差异，别把它当成跨平台标准函数。

## 一个 Skill 长什么样？

最小可用的 Skill 其实很朴素，一个目录，加一个 `SKILL.md`：

```text
skill-name/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

`SKILL.md` 一般分两部分。前面是元数据，告诉宿主“我是谁、什么时候该用我”；后面是正文，写具体流程、约束、示例和失败处理。`scripts/`、`references/`、`assets/` 不是必需项，但复杂任务经常会用到。

一个最小可用的 `SKILL.md` 大概长这样：

```markdown
---
name: code-reviewer
description: Review pull request code quality. Use when the user asks to review
  code, check a PR, or audit code changes. Covers architecture, exception
  handling, security, and performance.
triggers:
  - "review this code"
  - "帮我看看这个 PR"
  - "code review"
---

## 执行顺序

1. 确认改动范围，超过 500 行先问是否需要拆分
2. 检查异常处理和日志：是否有裸 catch、关键操作是否缺日志
3. 检查权限和安全：SQL 拼接、XSS、越权操作
4. 检查性能热点：循环里的 DB 调用、缺失索引、锁粒度
5. 给出可直接修改的建议，代码示例优先

## 约束

- 不评审格式和命名，那是 lint 的事
- 发现严重安全问题时，先报告不要直接修改
```

上面这个例子里，`description` 直接写了触发词和边界场景，`执行顺序` 把检查步骤串成固定流程，`约束` 明确了什么不做。模型读完就知道该怎么走，而不是完全自由发挥。必要时还可以在 `scripts/` 放一个 lint 脚本，让 Agent 先跑脚本，再基于真实输出判断。

我在项目里更喜欢把这类 Skill 拆小一点：

- `api-endpoint-generator`：按项目统一响应结构与异常模型生成接口代码
- `database-access-review`：检查索引、事务边界、慢查询风险
- `refactor-analysis`：先评估影响范围，再给出分步重构方案
- `security-audit`：盯 SQL 拼接、XSS、权限绕过这类问题

不要急着做一个“万能工程助手”。这种名字听起来省事，实际最容易把 Agent 搞糊涂，因为它不知道自己到底该按 review、重构、排障还是安全审计的标准走。

可以参考几个开源 Skill：

- [Code-Review-Expert](https://github.com/sanyuan0704/code-review-expert)：以代码审查为主，覆盖架构设计、SOLID、安全、性能、异常和边界条件。
- [Git Commit with Conventional Commits](https://github.com/github/awesome-copilot/blob/main/skills/git-commit/SKILL.md)：根据 diff 生成符合 Conventional Commits 的提交信息。
- [TDD](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)：把“先写失败测试，再写最少代码通过测试”这套流程固化下来。

[skills.sh](https://skills.sh/) 也可以用来找现成的 Skills。多提一句：面试或项目交流里，可以顺手说说自己团队参考过哪些开源集合，比如 Superpowers 这类。它比只背概念更像真的用过。

![查找自己需要和热门的 Skills](https://oss.javaguide.cn/github/javaguide/ai/skills/skillssh.png)

![Superpowers 内置的 skills](https://oss.javaguide.cn/github/javaguide/ai/skills/superpowers-skills.png)

Claude Code 这类工具会扫描项目里的 `.claude/skills/`，再由模型根据当前任务判断是否激活。传统插件通常是用户主动触发，Skills 则是模型自己判断“现在该读哪份经验包”。

Anthropic 也维护了自己的 [Skills 仓库](https://github.com/anthropics/skills)，可以作为目录结构和写法参考。

需要留个心眼的是，第三方 Skill 不能直接相信。有一些恶意 `SKILL.md` 可能诱导模型读取敏感文件、把数据发到外部服务，或者执行危险命令。企业场景里最好做内部审核，只允许使用经过审查的 Skill；本地个人使用，也建议先把正文读一遍。

## 为什么要延迟加载？

**延迟加载** 算是 Skills 的核心设计。为什么这么说？

Agent 的上下文窗口是有限的，至少目前是这样。几十条规范、十几份 SOP、几百个工具说明全塞进去，看起来信息很全，实际模型容易被噪声淹没。排在上下文中间的内容经常被忽略，这就是 Lost in the Middle 问题。

渐进式披露的思路很简单：先让模型看到一份轻量目录，目录里只有 Skill 名称和两三句描述；等它判断当前任务需要某个 Skill，再加载完整正文。这个设计有点像查书：你不会一上来把整本书背进脑子里，而是先看目录，确定章节，再翻到具体页。Skill 的元数据就是目录，正文才是章节内容。

![渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure.svg)

实际做的时候，建议至少分两层：

第一层是常驻元信息，每个 Skill 只保留名称、description、典型触发词，尽量短。几十个 Skill 的元信息放在一起，也比把几十份正文全塞进去轻得多。第二层是按需正文：用户请求进来后，宿主先用元信息做粗筛，只把命中的 `SKILL.md` 正文拼进上下文。这样模型既知道“有哪些能力”，又不会被不相关流程拖慢。

如果任务中途才暴露出新需求，还可以补充加载。比如一开始只是“帮我看看接口”，执行过程中发现涉及慢 SQL，那就把数据库审查相关 Skill 再追加进来。不过追加位置要小心，指令插在 Prompt 的哪个位置，会影响模型到底看不看得见。

如果要抽成一个通用调度器，建议拆成四块：注册中心维护元信息和向量，路由引擎负责召回与打分，加载器按需读取正文，上下文装配器决定最终拼到哪里。路由和加载最好解耦，这样改正文不会影响召回性能，换存储也不会动路由策略。

## Skill 路由怎么做？

当 Skill 只有三五个时，靠模型读 description 判断就够了。数量上来以后，路由就会变成一个小型检索问题。先别急着把它想成完整 RAG。Skill 路由和 RAG 确实都要“先检索，再把内容放进上下文”，但目标不一样。RAG 通常是从大量外部知识里多召回几段，模型还能在生成时过滤一部分噪声；Skill 路由面对的是数量有限、结构稳定的指令集，最怕的是选错。选错 Skill，后面的执行路径可能整条跑偏。

我的经验是，几十个 Skill 的规模，用一个轻量方案就够了。

先把 Skill 的名称、description、典型 Query 样本向量化，存到内存里或轻量向量库。用户请求进来后，也做一次向量化，按余弦相似度取 top-5。这里不要一开始就追求选准，先把可能相关的捞上来。

接着做一次精排。可以用轻量 rerank 模型，也可以先用规则：同一个词同时命中 title、description、examples 的优先级更高；安全类、数据库类这种高风险 Skill，宁可阈值高一点，别乱触发。

最后一定要有“不选”的分支。如果最高分都很低，就走默认流程。Skill 路由里，“不选”经常比“硬选一个”更安全。

![Skill 路由流程](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-router.svg)

这里有个冷启动问题很容易被忽略：新 Skill 没有历史 Query，description 又写得很虚，向量匹配就会飘。一个简单补救是加 `examples` 字段，把真实用户可能怎么问写进去。比如数据库审查 Skill 不只写“数据库访问审查”，还写“帮我看看这个查询为什么慢”“这个接口数据库会不会有 N+1 查询”。高并发场景下也别过度设计，几十个 Skill 用 NumPy 在内存里算相似度就够快，真正慢的通常是外部 embedding API。先做 Query 向量缓存，高频相似请求直接命中缓存，收益比一上来引入 FAISS 更实在。等 Skill 数量到几百上千，再考虑 ANN 索引或专门的向量数据库。

## 写 Skill 时最容易踩的坑？

### 把 Skill 当 README 写

README 写给人看，讲背景、安装、版本历史都没问题。Skill 写给 Agent 看，最重要的是可执行：它要告诉模型什么时候该用、按什么顺序做、哪些情况不能做、失败了怎么降级。其中 description 尤其关键，它就是路由索引，不是宣传语。像“分析系统日志”这种描述就太空了，模型不知道是分析 Nginx、JVM、Kubernetes，还是业务日志。更稳的写法可以这样：

```yaml
name: jvm-runtime-diagnosis
description: Diagnose Spring Boot production runtime issues. Use when the user pastes Java stack traces, mentions OOM, Full GC, high CPU, slow APIs, or asks why a service is stuck.
parameters:
  input: { type: string, description: “错误日志、堆栈、监控摘要或 TraceId” }
  output: { type: json, description: “诊断结果，包括根因、证据和下一步动作” }
```

这段 description 里有场景、有触发词，也有边界。模型看到“接口卡死”“频繁 Full GC”“粘了一段 Java 堆栈”，才更容易把它选出来。

### Skill 太大

“系统故障排查器”听上去很全，但里面如果同时塞 JVM、数据库、K8s、网关、消息队列，Agent 往往不知道先看哪条线。我更建议按排查维度拆：

- `jvm-metrics-analyzer`：看 JVM 指标、GC、线程栈
- `distributed-trace-finder`：根据 TraceId 追链路耗时
- `k8s-pod-event-viewer`：看 Pod 状态、重启原因、事件记录

拆细以后，路由也更容易判断。用户贴 GC 日志，就命中 JVM；用户给 TraceId，就命中链路追踪。少一点“全能”，多一点“明确”。

### 让 LLM 做不该它做的确定性工作

格式转换、精确计算、副作用操作，尽量交给脚本。LLM 负责读任务、提参数、解释结果，脚本负责确定性的执行环节。比如 CPU 异常排查，别让模型凭感觉猜哪个线程最耗时，直接让它调用脚本解析 top 线程和堆栈，再根据输出写判断。

当然，也别把所有东西都脚本化。架构取舍、开放式分析、文案生成，这些仍然需要模型的弹性。边界大概是：算得准、改得动、会产生副作用的地方，交给脚本；需要综合判断的地方，让模型发挥。

### 所有参考资料都塞进 SKILL.md

更舒服的结构是让 `SKILL.md` 放主流程，`references/` 放长文档，`runbooks/` 放历史案例，Agent 真需要时再读附加资料，这样主文件轻，触发也更稳。

```text
java-troubleshooting/
├── SKILL.md
├── references/
│   └── troubleshooting-guide.md
└── runbooks/
    ├── redis-timeout.md
    └── full-gc-case.md
```

## 总结

面试里可以这样解释：Prompt 是这一次请求里的指令，Function Calling 是模型发起结构化调用的方式，MCP 是外部系统和工具的接入协议，Skills 是一组可复用的任务处理经验。它们不在同一层，硬放在一起比大小没意义，组合起来才更接近一个完整 Agent 的工作方式。

真写 Skill 的时候，别追求形式漂亮。把边界和执行步骤写清楚，比在 Prompt 里反复强调“请严格按照规范执行”有用得多。description 要写准，包含适用场景、触发词和不该触发的边界。任务别贪大，宁可拆成几个专精 Skill，也别写一个“什么都能干”的万能版，后者看起来省事，实际更容易跑偏。

还有一点容易被忽略：第三方 Skill 不能直接拿来就用。恶意的 `SKILL.md` 是真实风险，可能夹带越权读取、泄露信息、误导模型执行危险操作的指令。个人测试可以粗一点，企业场景里至少要走一遍内部审核。
