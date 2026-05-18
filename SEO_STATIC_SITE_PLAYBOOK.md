# VuePress 静态站 SEO 优化复用手册

这份文档沉淀 JavaGuide 这次 SEO、搜索、sitemap、robots、IndexNow 和部署链路优化经验，适合迁移到另一个 VuePress + Theme Hope 静态内容站点。

## 适用场景

- 文档站、技术博客、知识库、教程站。
- 使用 VuePress / VuePress Theme Hope / Vite 静态构建。
- 希望优化 Bing、Google 等搜索引擎收录和排序。
- 站内搜索使用 Algolia DocSearch，或准备从本地 `dist` 生成搜索索引。

## 核心原则

- 先做可抓取、可索引、可验证，再做标题和内容优化。
- sitemap 的更新频率要符合真实更新节奏，不要全站都写 `weekly` 或 `daily`。
- 首页、栏目页、专题页承担关键词入口；普通文章承担长尾词和具体问题。
- 首屏正文要先给搜索引擎和用户一段真实内容，广告、提示、组件不要压在最前面。
- 站内搜索索引尽量从本地构建产物 `dist` 生成，避免线上抓取受 CDN、反爬、缓存和动态渲染影响。
- 每次部署后要同时处理静态文件、CDN、sitemap、robots、搜索索引和搜索引擎提交。

## 一次完整优化的顺序

### 1. 先盘点站点现状

重点检查：

- `docs/.vuepress/config.ts`
- `docs/.vuepress/theme.ts`
- `docs/.vuepress/navbar.ts`
- `docs/.vuepress/public/robots.txt`
- `package.json`
- `docs/README.md`
- 核心栏目 `README.md`
- 生成后的 `dist/sitemap.xml`
- 生成后的 `dist/robots.txt`

常用命令：

```bash
rg -n "seo|sitemap|robots|docsearch|search|head|canonical|pagePatterns" docs/.vuepress package.json
rg -n "^title:|^description:|^sitemap:|^head:" docs -g "*.md"
pnpm docs:build
```

### 2. 明确关键词和页面分工

先列出目标关键词，再决定谁来承接：

- 品牌词：首页承接。
- 核心大词：专题页或栏目页承接。
- 中等竞争词：高质量聚合页承接。
- 长尾问题词：具体文章承接。

示例：

- `Java 面试`：`/home.html` 或面试专题页承接。
- `AI 应用开发面试`：`/ai/` 或 AI 面试指南承接。
- `计算机基础面试题`：`/cs-basics/` 承接。
- `操作系统面试题`：具体操作系统文章承接。

### 3. 配置技术 SEO

建议在主题配置里启用或补齐：

- canonical。
- Open Graph。
- sitemap。
- feed。
- JSON-LD。
- robots。
- 明确排除不该索引的页面。

sitemap 建议：

- 全站默认 `monthly`。
- 首页、栏目入口、专题入口显式 `weekly`。
- 普通文章不单独写 `weekly`，除非真实频繁更新。
- 草稿、TODO、snippet、内部片段不进入 sitemap。

robots 建议：

- 优先由 SEO / Sitemap 插件生成。
- 不要在 `public/robots.txt` 和插件生成逻辑之间制造冲突。
- 生成结果中应包含：

```txt
Sitemap: https://example.com/sitemap.xml
```

### 4. 优化页面 frontmatter

核心页面建议具备：

```yaml
---
title: 页面主关键词 + 清晰主题
description: 用一句自然的话说明覆盖范围、适用人群和页面价值。
sitemap:
  changefreq: weekly
  priority: 1
head:
  - - meta
    - name: keywords
      content: 核心关键词,相关关键词,长尾关键词
---
```

普通文章建议：

- 写好 `title` 和 `description`。
- 可以补充 `keywords`。
- 默认继承全站 `monthly`。
- 不要为了“看起来重要”给每篇文章都写高 priority。

### 5. 优化正文结构

每个重点页面尽量做到：

- H1 与页面主题一致。
- 首屏先有一段总结性正文。
- 广告、提示块、卡片组件不要放在正文前面。
- 核心内容尽量出现在页面前半部分。
- 内链锚文本要明确，例如“Java 面试指南”“AI Agent 面试题”，不要写“点击这里”。
- 同一主题下的文章互相链接，栏目页链接核心文章，核心文章回链栏目页。

### 6. 处理站内搜索

推荐做法：

- 关闭 VuePress 本地搜索，避免生成过大的客户端 `searchIndex.js`。
- 使用 Algolia DocSearch。
- 构建前端时只暴露 Search-Only API Key。
- 写索引时使用 Admin API Key，并只放在本地或 CI Secret。
- 从本地 `dist` 写索引，而不是让 crawler 在线抓取。

示例命令：

```bash
pnpm docs:build

DOCSEARCH_APP_ID=你的 Algolia App ID \
DOCSEARCH_INDEX_NAME=你的索引名 \
DOCSEARCH_SOURCE_DIR=dist \
DOCSEARCH_ADMIN_API_KEY=你的写入索引专用 Key \
pnpm docsearch:index
```

### 7. 增加 IndexNow 提交

IndexNow Key 不需要平台申请，可以自己生成：

```bash
node -e "console.log(crypto.randomUUID())"
```

然后在站点根目录部署：

```txt
https://example.com/{INDEXNOW_KEY}.txt
```

文件内容就是 key 本身。

提交示例：

```bash
INDEXNOW_KEY=你的 IndexNow Key \
pnpm indexnow:submit / /home.html /ai/
```

大范围更新后可以提交 sitemap：

```bash
INDEXNOW_KEY=你的 IndexNow Key \
pnpm indexnow:submit --sitemap
```

### 8. 规范部署流程

VuePress / Vite 会生成带 hash 的静态资源。部署时不要每次清空整个站点目录，否则旧 HTML 或旧客户端可能引用不到旧 chunk。

推荐策略：

- 非 assets 文件跟随新版本删除。
- `/assets/` 只增量覆盖，保留旧 hash 文件一段时间。
- Google/Bing/IndexNow 验证文件部署后恢复。
- CDN 优先刷新 HTML、sitemap、robots 和变更页面，不要默认全站刷新。

推荐脚本：

```bash
set -e

SITE_DIR="/www/wwwroot/example.com"
DIST_DIR="/github/dist"
VERIFY_FILE_GOOGLE="/www/wwwroot/google-verification.html"
VERIFY_FILE_BING="/www/wwwroot/bing-verification.txt"
INDEXNOW_KEY_FILE="/www/wwwroot/your-indexnow-key.txt"

mkdir -p "$SITE_DIR/assets"

rsync -av --delete \
  --exclude='assets/' \
  "$DIST_DIR/" "$SITE_DIR/"

rsync -av \
  "$DIST_DIR/assets/" "$SITE_DIR/assets/"

cp "$VERIFY_FILE_GOOGLE" "$SITE_DIR/"
cp "$VERIFY_FILE_BING" "$SITE_DIR/"
cp "$INDEXNOW_KEY_FILE" "$SITE_DIR/"
```

### 9. 部署后验证

基础验证：

```bash
curl -I https://example.com/
curl -s https://example.com/robots.txt
curl -s https://example.com/sitemap.xml | head
```

sitemap 抽查：

```bash
node - <<'NODE'
const fs = require("fs");
const xml = fs.readFileSync("dist/sitemap.xml", "utf8");
const counts = {};
for (const m of xml.matchAll(/<changefreq>(.*?)<\/changefreq>/g)) {
  counts[m[1]] = (counts[m[1]] || 0) + 1;
}
console.log(counts);
NODE
```

重点确认：

- `robots.txt` 能访问。
- `sitemap.xml` 能访问。
- sitemap 中没有 TODO、snippet、内部测试页面。
- 首页和栏目页是 `weekly`。
- 普通文章是 `monthly`。
- IndexNow key 文件能访问。
- Bing Webmaster Tools 和 Google Search Console 能正常抓取。

## 常见坑

- 全站都写 `daily` 或 `weekly`，但内容几个月才更新一次。
- 每篇文章都写高 priority，导致 sitemap 信号失真。
- `public/robots.txt` 覆盖插件生成结果，导致 sitemap 丢失。
- TODO、snippet、草稿页被生成成正式页面。
- 广告或组件放在页面第一屏，正文太靠后。
- 只优化 meta，不补正文和内链。
- 部署时删除旧 assets，导致旧页面加载 chunk 404。
- 把 Admin API Key、IndexNow Key 提交到公开仓库。

## 可复用提示词

### 总提示词

```text
你是一个熟悉 VuePress、VuePress Theme Hope、静态站 SEO、Algolia DocSearch、sitemap、robots、IndexNow 和 CDN 部署的技术 SEO 工程师。

请你阅读当前仓库，帮我对这个静态文档站做一次系统 SEO 优化。目标是提升 Bing 和 Google 对核心关键词的收录和排名，同时不要破坏现有构建、主题配置和部署流程。

请按这个顺序执行：

1. 先检查 VuePress 配置、主题配置、navbar、robots、sitemap、package scripts 和核心栏目 README。
2. 判断当前站点是否存在本地搜索索引过大、robots/sitemap 冲突、草稿页面被索引、sitemap 频率不真实、首页和栏目页首屏正文不足等问题。
3. 为首页、核心栏目页和重点专题页优化 title、description、keywords、首屏正文、内链锚文本和 sitemap 配置。
4. 全站 sitemap 默认使用 monthly，只给首页、栏目页、专题入口保留 weekly。
5. 排除 TODO、snippet、草稿、内部页面进入 sitemap 和正式页面构建。
6. 如果站内搜索使用 Algolia DocSearch，请保留前端 Search-Only Key 的配置入口，并提供从本地 dist 写入索引的部署命令；Admin Key 不能提交到仓库。
7. 增加或整理 IndexNow 提交流程，支持提交变更 URL 和 sitemap。
8. 整理一份每次部署后的 SEO 和搜索索引检查清单。
9. 最后运行构建和必要的 lint，抽查 dist/sitemap.xml、dist/robots.txt 和关键页面生成结果。

约束：
- 不要引入和现有主题风格冲突的新框架。
- 不要为了 SEO 堆砌关键词。
- 不要把密钥写入仓库。
- 不要把普通文章全部标成 weekly 或高 priority。
- 不要删除用户已有的无关改动。

请直接修改文件，并在最后总结改了什么、如何验证、部署后还需要手动做什么。
```

### 只做审计的提示词

```text
请只审计这个 VuePress 静态站的 SEO 和部署链路，暂时不要改文件。

重点检查：
- robots.txt 和 sitemap 是否正确生成。
- sitemap 是否包含不该收录的 TODO、snippet、草稿页。
- sitemap changefreq 和 priority 是否符合真实更新频率。
- 首页、栏目页、专题页是否有清晰 title、description、首屏正文和内链。
- 是否存在本地搜索索引过大影响性能的问题。
- Algolia DocSearch 的前端 key 和写入 key 是否边界清晰。
- 部署方式是否会删除旧 assets 导致 chunk 404。
- 是否有 IndexNow 或搜索引擎提交流程。

请输出问题列表、影响、建议修改文件和优先级。
```

### 只做重点栏目优化的提示词

```text
请帮我优化这个 VuePress 站点的某个重点栏目页：{栏目路径}。

目标关键词：
- {关键词1}
- {关键词2}
- {关键词3}

请完成：
- 优化 frontmatter 的 title、description、keywords。
- 如果它是栏目入口页，设置合理的 sitemap，例如 weekly；如果是普通文章，继承全站默认 monthly。
- 在广告、提示块或组件前补一段自然的首屏介绍。
- 增加指向核心文章的内链，锚文本要包含明确主题词。
- 不要堆砌关键词，不要改变文章事实。
- 修改后运行 markdownlint 和构建验证。
```

### 部署清单提示词

```text
请帮我为这个 VuePress/Vite 静态站整理部署清单。

要求：
- 构建命令区分普通 build 和 clean build。
- 部署脚本要保留旧 assets，但删除旧 HTML、sitemap、robots 等非 assets 文件。
- 写清楚 Google/Bing 验证文件和 IndexNow key 文件如何恢复。
- 写清楚部署后 CDN 应刷新哪些路径。
- 写清楚什么时候需要重建 Algolia DocSearch 索引。
- 写清楚什么时候提交 IndexNow 变更 URL，什么时候提交 sitemap。
- 给出部署后 curl 验证命令。
```

## 最小落地清单

如果时间有限，优先完成这几项：

- 确认 `robots.txt` 包含 sitemap。
- 确认 `sitemap.xml` 生成正确，且没有草稿页。
- 全站默认 `monthly`，首页和栏目页 `weekly`。
- 核心入口页补齐 title、description、首屏正文和内链。
- 关闭本地搜索索引，使用 DocSearch 或其他远程搜索。
- 部署后提交 IndexNow。
- 搜索索引从 `dist` 生成。
- 部署时保留旧 `/assets/*`。
