---
title: Agent Skills 是什么？和 Prompt、MCP 到底差在哪？
description: 从工程视角聊 Agent Skills：它和 Prompt、Function Calling、MCP 的联系与边界，SKILL.md 怎么写才稳，延迟加载和渐进式披露怎么设计，以及写 Skill 最容易踩的坑。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Agent Skills,MCP,Function Calling,Prompt,AI Agent,智能体,延迟加载,上下文注入,SKILL.md
---

一次 Code Review 可能要看架构、安全、性能和项目约定。临时把这些规则放进 Prompt，换个会话后又要重新粘贴。

全局项目约定可以留在 `AGENTS.md`；Review 的检查顺序、检查项和参考资料应随 Review 任务加载。Skill 为这部分内容提供了独立入口。

## Agent Skills 是什么？

Skill 是可被 Agent 发现、按需读取的任务说明。接口返回格式、日志字段、慢 SQL 的排查路径、Review 的关注顺序，都可以写进 `SKILL.md`。

Skill 本身不提供工具能力。它解决的是“这类任务该按什么规则做”，由宿主在任务命中时把对应说明交给 Agent。

## Skill 和 Prompt、MCP、Function Calling 有什么联系？

它们处在同一条执行链路的不同位置：Prompt 说明用户要做什么，Function Calling 发起动作，MCP 接入外部能力，Skill 规定完成任务时采用的流程和约束。

拿“帮我分析这份报表”这个请求来说，用户说的话是 **Prompt**。模型决定调用 `read_file` 并生成结构化参数时，用到的是 **Function Calling**；`read_file` 若由 MCP Server 提供，**MCP** 负责的是连接和协议。

“先确认字段含义，再找异常值，最后给业务结论，不要只堆统计指标”则属于 **Skill**。它描述处理顺序和约束，不替代前面的请求、调用方式或外部连接。

![ Skill 和 Prompt、MCP、Function Calling 对比](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-prompt-function-calling-mcp-comparison.webp)

放在一个真实链路里，大概是这样：

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-agent-execution-link.webp)

1. 用户提出任务（Prompt）
2. 宿主把可用 Skills 的简短描述放进上下文（Skill 元数据）
3. 模型判断当前任务命中了某个 Skill（Skill 路由）
4. 宿主再把完整 `SKILL.md` 加载进来（延迟加载）
5. 模型按照 Skill 里的流程去调工具、读资料、写结果（执行）

工具并不是 Skill 的必备部分。[sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills) 里的 Code Review Expert 只规定从 SOLID、安全、性能等维度审查；[Superpowers](https://github.com/obra/superpowers) 的 TDD Skill 则要求 Agent 跑测试、读取输出，再决定下一步。

因此，Function Calling 是执行动作时可能用到的能力，Skill 更接近一次按需的**上下文注入**。`load_skill()` 也是这个意义上的概念，不是跨平台统一的 API 名称；Claude Code、Cursor、Codex、Copilot 的发现和加载方式各不相同。

## ⭐️SKILL.md 到底怎么写？

### 基本结构

最小可用的 Skill 其实很简单，就是一个目录加一个 Markdown 文件 `SKILL.md`。

`scripts/`、`references/`、`assets/` 这些都不是必需项，但复杂点的 Skill 经常会用到这些文件夹，例如 `scripts/` 中放一些 Skill 需要用到的脚本。

```text
skill-name/
├── SKILL.md          # 主文件，触发时加载
├── scripts/          # 实用脚本（执行，不需要加载到上下文）
├── references/       # 参考资料（按需加载）
└── assets/           # 模板和静态文件（按需加载）
```

一个 `SKILL.md` 包含两部分：

1. 前面是 **YAML 前置元数据**，告诉宿主“我是谁、什么时候该用我”；
2. 后面是**正文**，写具体流程、约束、示例和失败处理。

想要学 Skill 怎么写，我们直接看最顶级的开源 Skill 就好了。

这里我们以 [Superpowers 的 TDD 技能](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)为例，

它的元数据只有两行：

```yaml
---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---
```

TDD 会涉及到 Red-Green-Refactor 循环，但这个 TDD Skill 的 description 压根没提到，就一句话说清楚什么时候该用。正文才展开讲具体怎么做，简化版如下：

```markdown
# TDD

## Rule

Write a failing test before production code.

If you did not watch the test fail, the test is not trusted.

## Flow

1. **RED**: Write one small failing test.
2. **VERIFY RED**: Run it. Confirm it fails for the expected reason.
3. **GREEN**: Write the smallest code to pass.
4. **REFACTOR**: Clean up without changing behavior.

## Use For

- Features
- Bug fixes
- Refactoring
- Behavior changes

## Ask Before Skipping

- Throwaway prototypes
- Generated code

## Done Checklist

- [ ] Test written first
- [ ] Failure observed
- [ ] Minimal code added
- [ ] Tests pass
```

### 先看官方的 skill-creator

[`skill-creator`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) 是 Anthropic 官方 Skills 仓库提供的创建 Skill 的 Skill。它会先要求 Agent 确认任务、触发条件和边界，再决定哪些内容留在 `SKILL.md`，哪些拆到 `scripts/` 或 `references/`。

它体现了两个实际取舍：`description` 要能让宿主识别适用任务；可由脚本稳定执行的步骤和只在特定场景需要的长资料，应拆出主文件。Claude 官方帮助文档也建议将这类额外内容按需访问。

### 元数据（Frontmatter）

元数据决定 Skill 能不能被正确发现和触发。一般来说，至少要写清楚两个字段：`name` 和 `description`。

`name` 就是 Skill 的标识，主要给系统和人定位用；`description` 则更像路由说明，告诉 Agent 什么时候该把这个 Skill 加载进来，也就是什么时候用。

先看 `name`。它有几个硬性要求：

- 最多 64 个字符
- 只能包含小写字母、数字和连字符
- 不能包含 XML 标签
- 不能包含保留字，比如 `anthropic`、`claude`

命名时可以优先用动名词形式，也就是“动词 + -ing”。这样一眼就能看出这个 Skill 提供的是什么能力。

| **好的命名**              | **不好的命名**                 |
| ------------------------- | ------------------------------ |
| `processing-pdfs`         | `helper`、`utils`，太模糊      |
| `reviewing-code`          | `documents`，太通用            |
| `test-driven-development` | `tools`，啥也没说              |
| `analyzing-spreadsheets`  | `anthropic-helper`，包含保留字 |

`description` 更关键。如果`description` 写的不好，那这个Skill 就没办法在该调用的时候被调用。毕竟 Agent 不会先把每个 Skill 的 `SKILL.md` 都读一遍，而是先看描述来判断该不该加载。

`description`的描述不能太简洁，也不要太多。一个好用的 `description`，建议说清楚两件事就足够了：

1. 这个 Skill 做什么
2. 在什么场景下需要用它

我们前面列举的 Superpowers 的 TDD 技能就是满足这个要求的。

最好再带上一些用户可能会说出来的词。比如 PDF、表单、提取、提交消息、git diff 这类词。这样不管是规则匹配还是语义匹配，都更容易抓到。

```yaml
# ✓ 好的：有能力、有场景、有触发词
description: 从 PDF 文件中提取文本和表格、填充表单、合并文档。在处理 PDF 文件或用户提及 PDF、表单、文档提取时使用。

# ✗ 避免：第一人称 + 触发条件不清楚
description: 我可以帮助您处理 PDF 文件

# ✗ 避免：只写能力，不写什么时候用
description: 处理 Excel 文件
```

看几个实际例子：

```yaml
# Superpowers 的 TDD
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code

# sanyuan-skills 的 Code Review Expert
name: code-review-expert
description: Expert code review of current git changes with a senior engineer lens. Detects SOLID violations, security risks, and proposes actionable improvements.

# Git 提交助手
description: 通过分析 git diff 生成描述性提交消息。当用户要求帮助编写提交消息或审查暂存更改时使用。
```

只写概念、范围过宽或缺少触发条件的 `description`，例如：

```yaml
# Superpowers 的 TDD 反例，只写概念，不写触发时机
name: test-driven-development
description: Helps with test-driven development and writing better tests.

# Code Review Expert 反例，太泛
name: code-review-expert
description: Helps review code and improve quality.

# Git 提交助手反例，只写功能名
description: 生成提交消息。
```

### 正文

正文是 Agent 命中 Skill 后才会读取的操作说明。启动阶段通常只有 `name` 和 `description` 参与路由；正文加载后，会与系统提示、用户请求和已有资料共用上下文空间。

因此，正文只保留任务执行时需要的默认方案、项目约定、输入输出和失败处理。规则藏在大段科普里，Agent 需要时反而更难找到。

![上下文为什么会失效](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-does-the-following-content-fail.png)

筛正文时可以依次确认：

- Agent 真的需要这段解释吗？
- 这是项目里的私有知识，还是通用常识？
- 这段话值不值得占用上下文？

处理 PDF 文本时，正文直接给默认库和调用方式：

````markdown
## 提取 PDF 文本

使用 pdfplumber 进行文本提取：

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

从 PDF 定义和工具罗列开始的正文，对 Agent 的下一步没有帮助：

```markdown
## 提取 PDF 文本

PDF（便携式文档格式）是一种常见文件格式，通常包含文本、图片和其他内容。
如果要从 PDF 中提取文本，需要使用专门的 PDF 处理库。
目前有很多库可以完成这类工作，例如 pypdf、pdfplumber、PyMuPDF 等。
这里建议使用 pdfplumber，因为它比较容易上手，也能覆盖大多数普通 PDF 文本提取场景。
首先，你需要使用 pip 安装它，然后再编写下面的代码……
```

Agent 需要的是默认使用什么、如何调用、输出如何处理，以及遇到特殊情况时怎么分支。项目里那些无法从通用知识推断出来的约束尤其要写清楚，例如：

```markdown
users 表使用软删除。所有正式查询都必须加 `WHERE deleted_at IS NULL`。
```

这条约束会直接改变查询结果；软删除的通用定义无需放进 Skill：

```markdown
软删除是一种常见的数据删除方式，通常不会真正删除数据库记录，而是通过字段标记记录状态。
```

主文件过长时，把只在特定步骤才用到的内容拆到单独文件。Anthropic 建议将 `SKILL.md` 正文尽量控制在 500 行以内，通过渐进式披露按需读取细节。

![SKILL.md 正文最好控制在 500 行以内](https://oss.javaguide.cn/github/javaguide/ai/skills/keep-skill-md-content-under-500-lines-for-best-performance.png)

例如，Code Review Skill 的主文件只需指出何时读取 SOLID 检查项：

```markdown
需要做 SOLID 设计检查时，读取 `references/solid-checklist.md`。
```

`references/solid-checklist.md` 保存具体 checklist；任务不涉及设计检查时，Agent 不必读取它。

这些开源 Skill 集合展示了主文件与参考资料的拆分方式：

- [Superpowers](https://github.com/obra/superpowers)：包含 TDD、brainstorming、代码审查等 Skill，TDD 那个结构很清楚，适合看正文怎么组织。
- [sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills)：Code Review Expert 把更细的检查项拆进 `references/`，主文件只保留触发和加载说明，适合作为渐进式披露的例子。
- [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills)：目录结构和写法可以作为基准参考。

![查找自己需要和热门的 Skills](https://oss.javaguide.cn/github/javaguide/ai/skills/skillssh.png)

![Superpowers 内置的 skills](https://oss.javaguide.cn/github/javaguide/ai/skills/superpowers-skills.png)

在 Claude Code 这类工具中，可以用 `/skill-name` 主动调用，也可以让模型根据任务选择；触发后再读取流程、约束、脚本和参考文件。

## 自由度怎么把控？

数据库迁移和生产部署要在 Skill 中固定命令、参数、校验与回滚条件；这类操作出错后往往要恢复数据或服务状态。

代码审查和技术方案评估需要结合变更内容判断。Skill 固定安全、性能、可维护性和项目约定这些检查维度即可，无需为每个文件指定顺序。

下表按任务风险划分自由度：

| **自由度** | **适合场景**                 | **写法**               |
| ---------- | ---------------------------- | ---------------------- |
| 高         | 需要判断和取舍，答案不唯一   | 给检查方向，不写死步骤 |
| 中         | 有固定模板，但允许按场景调整 | 给模板、参数和边界     |
| 低         | 操作脆弱，出错代价高         | 给精确命令，明确不能改 |

Superpowers 的 TDD Skill 固定了流程顺序：

```text
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Red、Green、Refactor 不能调换；实现前必须先看到预期的失败。该 Skill 还写明：

```text
Write code before the test? Delete it. Start over.
```

测试对象、名称和断言则由当前功能决定。Code Review 的检查框架也可以固定为 SOLID、安全风险、性能和可维护性，具体问题仍由 Agent 根据 diff 判断。

低自由度的写法可以这样：

````markdown
## 数据库迁移

运行下面这条命令：

```bash
python scripts/migrate.py --verify --backup
```

不要修改命令，不要添加额外参数。

如果命令失败，停止执行，并把错误输出返回给用户。
````

代码审查这类任务可以只给检查范围：

```markdown
## 代码审查

重点检查：

1. 是否有明显 Bug 或边界情况遗漏
2. 是否存在安全风险
3. 是否影响性能或资源使用
4. 是否违反项目已有约定
5. 是否有更简单的实现方式

输出时优先写会影响正确性和线上稳定性的问题，不要只做格式建议。
```

这里没有指定文件顺序，但限定了审查范围和输出重点。改数据、发请求、部署、迁移或删除文件时收紧自由度；分析、评审、总结和生成草稿保留判断空间。

## ⭐️延迟加载与渐进式披露

![Skill 渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-progressive-disclosure.webp)

### 为什么不能把所有 Skill 一次性全塞进去？

Agent 的上下文窗口是有限的，至少现在还是这样。

而且，窗口大了只是能装下更多内容，不代表它能自动挑出重点。比如你给它分析一份长需求文档，真正关键的限制条件可能就三句话，但夹在各种背景和说明中，模型很容易忽略中间的那些关键句。

这就是大家常说的 **Context Rot**，上下文腐化。**上下文越长，信息越杂，模型利用上下文的稳定性就越可能变差。**

跟它相关的还有一个经典现象叫 **Lost in the Middle**——模型对开头和结尾的信息更敏感，对夹在中间的东西更容易“看漏”。所以有时候你明明把资料给它了，它还是答错，不一定是没读到，而是关键内容在长上下文里不够显眼。

所以，Skill 不应该写成资料库。

更好的方式是渐进式披露：**先给模型一份轻量目录，真正用到哪块，再去加载哪块。**

![渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure.svg)

就像查书一样。你不会先把整本书背下来，而是先看目录，确定章节，再翻到具体那一页。

一般可以分成三层：

![渐进式披露（三层模型）](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure-three-layer-model.png)

**1. 广告层：先让模型知道有这个 Skill**

启动时通常只加载 Skill 的元数据，比如 `name` 和 `description`。这部分很短，用来告诉模型：我是谁，我适合什么场景。

**2. 指令层：命中后再读正文**

当 Agent 判断当前任务确实相关时，才读取对应的 `SKILL.md` 正文。正文里放流程、规则、边界和关键示例。这里不要写太长，Anthropic 的建议是正文尽量控制在 500 行以内。

**3. 资源层：执行时再读细节**

如果正文里引用了 `references/`、`scripts/` 这类文件，Agent 再按需读取或执行。比如只是执行脚本，通常只需要把脚本输出放进上下文；如果要阅读或修改脚本，那源码才需要进上下文。

所以你会经常看到这种写法：

```markdown
## 高级功能

**表单填充**：完整指南请参阅 [FORMS.md](FORMS.md)

**API 参考**：所有方法请参阅 [REFERENCE.md](REFERENCE.md)
```

任务命中表单填充时，Agent 才读取 `FORMS.md`；普通文本提取无需加载该文件。

### 实际项目中怎么组织文件？

以一个数据分析类 Skill 为例，可以这么拆：

```text
bigquery-analysis/
├── SKILL.md              # 概述和导航，命中时加载
└── reference/
    ├── finance.md        # 收入、ARR、账单指标
    ├── sales.md          # 机会、管道、账户
    ├── product.md        # API 使用、功能采用
    └── marketing.md      # 活动、归因、电子邮件
```

主文件只列出可用数据集和对应资料，数据口径留在各自的参考文件中：

```markdown
# BigQuery 数据分析

## 可用数据集

**财务**：收入、ARR、账单 → 参阅 [reference/finance.md](reference/finance.md)

**销售**：机会、管道、账户 → 参阅 [reference/sales.md](reference/sales.md)

**产品**：API 使用、功能采用 → 参阅 [reference/product.md](reference/product.md)

**营销**：活动、归因、电子邮件 → 参阅 [reference/marketing.md](reference/marketing.md)
```

用户问“上个季度的销售管道怎么样”时，Agent 只需打开 `reference/sales.md`；财务、产品和营销资料无需加载。

必需规则经过多层引用后，Agent 很难直接定位：

```markdown
SKILL.md → advanced.md → details.md → 最关键的规则藏在这里
```

把基本用法和下一层资料都列在主文件里：

```markdown
SKILL.md
├── 直接包含基本用法
├── 高级功能 → advanced.md
└── API 参考 → reference.md
```

Agent 读取主文件后即可定位资料。参考文件较长时，在文件开头列出目录，方便先确认可用内容。

## 工作流和反馈循环怎么设计？

简单点的任务，写几条规则就够用了。但遇到复杂一些的场景，这样做就不太够了。

Agent 很可能会跳过一些步骤，例如检查输出质量、跑测试代码，然后直接说它已经做完了。

为了避免这种问题，需要写清楚这两个点：

1. 每一步按什么顺序走
2. 哪些地方必须停下来验证

![Skill 工作流设计](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-workflow-design.webp)

图示：复杂 Skill 要把任务分类、条件分支、验证节点和失败兜底写进流程里。

### 用清单把步骤串起来

Superpowers 的 TDD Skill 就是一个很好的例子。

它没有只写一句“先写测试，再写代码”。这种话太粗了，Agent 真执行时还是容易糊弄过去。

它是直接把流程拆成了几个明确阶段，简化版本如下：

```markdown
### RED - Write Failing Test

Write one minimal test showing what should happen.

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

Confirm:

- Test fails, not errors
- Failure message is expected
- Fails because feature missing, not typos

### GREEN - Minimal Code

Write simplest code to pass the test.
Don't add features.

### REFACTOR - Clean Up

After green only:

- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.
```

**Verify RED** 规定：Agent 必须先看到预期的失败，再开始实现。

失败应由功能尚未实现引起，而非路径、语法或测试本身的错误。

这一步如果不写清楚，Agent 很容易直接写实现，然后补一个“看起来能过”的测试。这就不是 TDD 了。

完成前的验证条件也写成清单：

```markdown
## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output has no errors or warnings
```

清单中的每一项都应是可核验的动作，例如“所有测试通过”或“每个新方法都有测试”。“保证质量”“遵循测试最佳实践”这类要求没有判定标准，无法作为验证节点。

### 反馈循环

复杂任务需要把中间验证节点写进流程：

```text
运行 → 验证 → 修复 → 再验证
```

例如，代码审查若只要求“全面审查”，Agent 容易先处理命名、格式和注释，遗漏架构问题。

可以把审查拆成两轮：

```markdown
## 代码审查流程

1. 获取变更文件列表和 diff

2. 第一轮：设计审查

   - 检查整体结构是否合理
   - 检查是否违反 SOLID 原则
   - 如果发现明显架构问题，先报告，不急着进入细节审查

3. 第二轮：实现审查

   - 检查安全风险，比如 SQL 注入、XSS、越权
   - 检查性能热点，比如循环里的 DB 调用、缺失索引
   - 检查异常处理和边界条件

4. 输出问题
   - 标注严重等级：Critical / Warning / Suggestion
   - 给出可以直接修改的建议
```

这份流程先检查设计，再检查实现，最后输出修改建议。

### 条件分支

Skill 同时处理多种任务时，应列出判断条件和分支。创建文档与编辑已有文档的处理路径不同：

```markdown
## 文档修改工作流

1. 先判断任务类型

   **创建新文档？**

   走创建工作流。

   **编辑现有文档？**

   走编辑工作流。

2. 创建工作流

   - 使用模板生成文档
   - 导出为目标格式
   - 验证文件可以正常打开

3. 编辑工作流

   - 解包现有文档
   - 修改指定内容
   - 每次修改后验证
   - 完成后重新打包
```

分支多起来后，主文件保留判断逻辑，具体流程拆到单独文件：

```text
workflows/
├── create-document.md
├── edit-document.md
└── export-document.md
```

任务命中哪个分支，Agent 就读取对应文件。流程规定执行顺序，反馈节点规定检查时机；缺少其中一项时，执行容易跳步。

## Skill 路由怎么做？

![Skill 路由流程](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-routing-flow.webp)

用户提交“频繁 Full GC”时，路由器应选择 JVM 诊断 Skill，并排除数据库排查和文档处理 Skill。路由完成后，要得到可直接加载的 Skill 集合。

Skill 只有三五个时，模型读取 `description` 通常足以完成选择。数量增加到几十个后，按“召回候选 → 重新排序 → 作出决策”的流程处理更稳定：

| 阶段   | 输入与处理                                                                          | 输出                       |
| ------ | ----------------------------------------------------------------------------------- | -------------------------- |
| 粗召回 | 将请求与 Skill 的名称、`description`、典型 Query 样本向量化，按余弦相似度取 top-5。 | 少量候选 Skill             |
| 精排   | 比较名称、描述、示例的命中情况；安全、数据库等高风险 Skill 使用更高阈值。           | 按相关性和风险排序的候选   |
| 决策   | 最高分满足阈值则加载对应 Skill；分数整体偏低时不加载任何 Skill，走默认流程。        | 一个、多个或零个已选 Skill |

同一请求中包含互不依赖的任务时，先拆分任务再路由。例如“分析 GC 日志并改一份部署文档”至少涉及 JVM 诊断和文档编辑，不能用一个泛化 Skill 覆盖两条流程。

对“频繁 Full GC”这类请求，粗召回可能得到 `jvm-metrics-analyzer`、链路追踪和 K8s 事件查看三个候选；精排检查“Full GC”“堆栈”等示例后，JVM 诊断 Skill 排在首位。若请求只写“帮我处理一下”，没有足够的语义线索，路由器应保留默认流程，而不是猜测用户要做数据库迁移或生产操作。

![Skill 路由流程](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-router.svg)

新 Skill 没有历史 Query 时，`description` 过于抽象会拉低召回质量。[Agent Skills 规范](https://agentskills.io/specification)没有规定通用的 `triggers` frontmatter 字段，各宿主也不保证读取自定义字段。自行维护调度器时，把典型 Query 放进独立的路由索引：

```yaml
skill: jvm-runtime-diagnosis
examples:
  - "接口卡死了"
  - "频繁 Full GC"
  - "帮我看看这段 Java 堆栈"
  - "服务 OOM 了怎么排查"
```

自定义路由器将 `examples` 与 Skill 的 `name`、`description` 一起向量化。使用第三方宿主时，只使用它明确支持的字段；不要把这份路由索引写进所有 `SKILL.md`，更不要假设每个宿主都会读取它。

几十个 Skill 用 NumPy 在内存中计算相似度即可，耗时通常来自外部 embedding API。先缓存 Query 向量；数量增长到数百或数千后，再评估 ANN 索引或向量数据库。

通用调度器可拆成四个部分：

| 部分         | 职责                                         |
| ------------ | -------------------------------------------- |
| 注册中心     | 保存 Skill 元数据、路由索引和向量。          |
| 路由引擎     | 召回候选、计算分数并应用阈值。               |
| 加载器       | 按路由结果读取 `SKILL.md` 与必要的参考资料。 |
| 上下文装配器 | 将已加载的内容放入对应任务的上下文。         |

路由引擎不负责读取 Skill 正文，加载器也不参与打分。这样更新正文不会改变召回结果，更换向量存储也无需改动加载逻辑。

## 写 Skill 时容易踩的坑

### 把 Skill 当项目 README 写

README 记录项目背景、安装和功能，读者可以自行判断下一步。Agent 执行任务时需要的是可操作的边界：何时使用、按什么顺序执行、哪些情况停止以及失败后如何处理。

![SKILL.md 正文最好控制在 500 行以内](https://oss.javaguide.cn/github/javaguide/ai/skills/keep-skill-md-content-under-500-lines-for-best-performance.png)

### 想把一个 Skill 写得太全

把 JVM、数据库、K8s、网关和消息队列都放进一个“系统故障排查器”后，用户贴 GC 日志时，Agent 仍要在容器资源、网关日志和 JVM 规则间选择。按问题边界拆分后，输入能直接落到对应资料：

- `jvm-metrics-analyzer`：只看 JVM 指标、GC、线程栈
- `distributed-trace-finder`：只根据 TraceId 追链路耗时
- `k8s-pod-event-viewer`：只看 Pod 状态、重启原因和事件记录

GC 日志进入 JVM 指标 Skill，TraceId 进入链路追踪 Skill，Pod 重启进入 K8s 事件 Skill。每个 Skill 只维护一类问题所需的规则和资料。

### 给 Agent 太多选择

只罗列 pypdf、pdfplumber、PyMuPDF、pdf2image，Agent 无法判断普通 PDF 与扫描版 PDF 分别该走哪条路径，可能在文本 PDF 上误用 OCR：

```markdown
# ✗ 不推荐：选择太多

你可以使用 pypdf、pdfplumber、PyMuPDF 或 pdf2image 处理 PDF。
```

默认路径与例外条件应一起写出：

```markdown
# ✓ 推荐：默认方案 + 兜底方案

默认使用 pdfplumber 提取文本。
如果是扫描版 PDF，需要 OCR，再改用 pdf2image + pytesseract。
```

Skill 应给出正常条件下的默认选择，并明确切换条件。

### 术语别来回换

同一对象在一份 Skill 中应保持同一个名称。例如前文使用“API 端点”后，后文不再改写为 URL、API 路由或路径。判断条件引用术语时，名称不一致会制造歧义。

### 让 LLM 做确定性工作

格式转换、精确计算、批量文件处理和改数据的操作交给脚本执行：

- LLM 更适合做判断：读懂任务、提取参数、决定下一步、解释结果。
- 脚本更适合做执行：解析文件、转换格式、批量处理、校验输出。

读取必需输入文件时，脚本应返回明确错误，而不是创建空文件掩盖输入缺失：

```python
# ✓ 推荐：错误条件写清楚
def process_file(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError as exc:
        raise FileNotFoundError(
            f"必需输入文件不存在：{path}。请检查路径或先生成该文件。"
        ) from exc
```

下列写法只保留底层异常，Agent 无法据此判断该检查路径还是生成缺失文件：

```python
# ✗ 不推荐：直接崩，Agent 只能猜原因
def process_file(path):
    return open(path).read()
```

配置参数应说明取值的约束：

```markdown
# ✓ 推荐：能看出为什么这样配

REQUEST_TIMEOUT = 30 # HTTP 请求通常应在 30 秒内完成
MAX_RETRIES = 3 # 三次重试在可靠性和耗时之间比较均衡
```

## 总结

回到开头的代码审查场景：Prompt 承载这次审查请求，Function Calling 发起工具调用，MCP 连接文件、数据库或 GitHub 等外部能力，Skill 保存审查的流程与约束。

`description` 要同时标出任务和触发场景，正文则放项目约定、执行步骤、失败处理和验证点。主文件保留主流程，细节拆到 `references/`、`scripts/`；迁移、部署、删文件等操作必须收紧步骤，审查和方案评估保留必要的判断空间。

## 参考

- Anthropic 官方 Skills 仓库：<https://github.com/anthropics/skills>
- Anthropic 官方 skill-creator：<https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md>
- Superpowers：<https://github.com/obra/superpowers>
- sanyuan-skills：<https://github.com/sanyuan0704/sanyuan-skills>
- Everything Claude Code：<https://github.com/nicekid1/everything-claude-code>
- skills.sh（查找现成 Skills 的平台）：<https://skills.sh/>

<!-- @include: @article-footer.snippet.md -->
