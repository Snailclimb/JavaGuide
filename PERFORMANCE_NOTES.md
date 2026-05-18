# JavaGuide Performance Notes

本文记录 JavaGuide 当前的性能现状、CDN/Nginx 配置约定、已经完成的优化和后续待讨论事项。

## 当前判断

- 电脑端卡顿不像是单纯 CDN 问题，更偏向客户端渲染、解析和执行成本高。
- 老款 Intel Mac 卡、M 系列 Mac 流畅，符合“下载不慢，但老 CPU 处理页面吃力”的特征。
- 重点问题集中在大站点客户端搜索索引、Mermaid 图表、长文页面 DOM/代码块、全站客户端组件初始化。

## CDN 和缓存策略

腾讯云 EdgeOne 已按以下思路调整：

- HTML 不缓存，避免发布后用户拿旧 HTML 引用新旧不匹配的 JS/CSS。
- hash 静态资源使用长期缓存：
  - `/assets/*.js`
  - `/assets/*.css`
  - 建议 `Cache-Control: public, max-age=31536000, immutable`
- 图片资源使用较长缓存：
  - `jpg/jpeg/png/gif/bmp/svg/webp/ico`
  - 建议 30 天缓存。
- EdgeOne 节点缓存 TTL 已调整为遵循源站 `Cache-Control`。
- EdgeOne 无 `Cache-Control` 头时已调整为不缓存。
- EdgeOne 浏览器缓存 TTL 已设置为遵循源站 `Cache-Control`。
- HTML 不再使用 CDN stale，发布后新访问应尽快拿到新 HTML。

已验证过的线上响应特征：

- 首页 HTML 使用不缓存策略。
- `/assets/app-*.js` 可命中 CDN，且适合一年 immutable。
- `favicon.ico` 和图片类资源适合 30 天缓存。

## Nginx 配置原则

后端 Nginx 需要和 CDN 策略保持一致：

- HTML/JSON 不长期缓存。
- hash JS/CSS 使用一年强缓存和 `immutable`。
- 图片 30 天缓存。
- 开启 gzip；如果环境支持，可在 CDN 层开启 Brotli。
- 静态资源不要设置会破坏 CDN 压缩、转换或缓存的头。
- 扩展名省略的 VuePress 路由，例如 `/ai/`、`/database/mysql/`，也要返回 HTML 不缓存头，不能只匹配 `*.html`。

## 部署约定

当前站点使用 Vite/VuePress 内容 hash 资源，发布时必须保留旧的 `/assets/*` 文件一段时间。

原因：

- 已打开页面的 SPA 运行时可能还引用上一版 chunk。
- CDN 或浏览器可能短时间内仍持有旧 HTML。
- 如果部署脚本先执行 `rm -rf /www/wwwroot/javaguide.cn/*`，旧 hash JS/CSS 会被删除；旧 HTML 或旧客户端再请求这些文件时会 404，表现为动态 import 失败、路由跳转失败或页面白屏。

推荐发布方式：

```bash
set -e

SITE_DIR="/www/wwwroot/javaguide.cn"
DIST_DIR="/github/dist"
VERIFY_FILE_GOOGLE="/www/wwwroot/googleca8171acadbdab54.html"

# 如果启用了 IndexNow，把 key 文件放在站点根目录可访问的位置。
# 文件名通常是 ${INDEXNOW_KEY}.txt，文件内容也是 INDEXNOW_KEY。
# 不启用时可以删掉这一行和下面的 cp。
VERIFY_FILE_BING="/www/wwwroot/300af4bf44b34b5daf5182f3f4be2c6f.txt"

mkdir -p "$SITE_DIR/assets"

# HTML、sitemap、manifest 等非 assets 文件跟随新版本删除旧文件。
rsync -av --delete \
  --exclude='assets/' \
  "$DIST_DIR/" "$SITE_DIR/"

# hash 资源只增量覆盖，不在每次部署时删除旧文件。
rsync -av \
  "$DIST_DIR/assets/" "$SITE_DIR/assets/"

# 恢复搜索引擎验证文件和 IndexNow key 文件。
cp "$VERIFY_FILE_GOOGLE" "$SITE_DIR/"
cp "$VERIFY_FILE_BING" "$SITE_DIR/"
```

如果暂时没有启用 IndexNow，可以先删除脚本里的 `INDEXNOW_KEY_FILE` 和对应 `cp`。启用后需要确认：

- `https://javaguide.cn/300af4bf44b34b5daf5182f3f4be2c6f.txt` 可以访问。
- `https://javaguide.cn/{INDEXNOW_KEY}.txt` 可以访问。
- `{INDEXNOW_KEY}.txt` 的文件内容就是 `INDEXNOW_KEY` 本身。

部署后 CDN 刷新建议：

- 优先刷新 HTML、sitemap、manifest 等入口文件。
- 不建议每次都刷新整个根目录；如果必须刷新根目录，前提是源站仍保留旧 assets。
- 旧 assets 可用定时任务按 30-60 天清理，避免无限增长。

## 每次部署清单

这部分是实际发布时照着做的简化流程。

### 1. 构建

```bash
pnpm docs:build
```

如果这次改了主题配置、构建插件、搜索配置或怀疑缓存影响构建结果，使用 clean build：

```bash
pnpm docs:build:clean
```

### 2. 部署静态文件

按上面的 `rsync` 方式发布，核心是“非 assets 跟随新版本删除，assets 只增量覆盖”：

- 非 assets 文件使用 `--delete`，让 HTML、sitemap、robots、manifest 跟随新版本。
- `/assets/` 只增量覆盖，不在每次部署时删除旧 hash 文件。
- 保留站点验证文件，例如 Google/Bing 的验证文件。
- 如果启用了 IndexNow，保留 `{INDEXNOW_KEY}.txt`。

### 3. 刷新 CDN

部署后优先刷新这些入口文件：

- `/`
- `/home.html`
- `/sitemap.xml`
- `/robots.txt`
- 这次改动涉及的栏目页和文章页 HTML

不建议每次刷新整个根目录；如果刷新根目录，源站必须仍保留旧 `/assets/*` 文件。

### 4. 更新站内搜索索引

内容变更或文章结构变更后，从本地 `dist` 写入 Algolia DocSearch 索引：

```bash
DOCSEARCH_APP_ID=XXQ4GI90SC \
DOCSEARCH_INDEX_NAME=javaguide \
DOCSEARCH_SOURCE_DIR=dist \
DOCSEARCH_ADMIN_API_KEY=你的写入索引专用 Key \
pnpm docsearch:index
```

只改样式、缓存、Nginx 或不影响正文内容时，可以不重建搜索索引。

### 5. 提交 IndexNow

小范围改动优先只提交变更 URL：

```bash
INDEXNOW_KEY=300af4bf44b34b5daf5182f3f4be2c6f \
pnpm indexnow:submit /home.html /ai/ /cs-basics/
```

大范围内容更新、导航调整或 sitemap 变化后，可以提交 sitemap 中的全部 URL：

```bash
INDEXNOW_KEY=300af4bf44b34b5daf5182f3f4be2c6f \
pnpm indexnow:submit --sitemap
```

`INDEXNOW_KEY` 不能提交到仓库。线上需要能访问 `https://javaguide.cn/{INDEXNOW_KEY}.txt`。

### 6. 部署后检查

```bash
curl -I https://javaguide.cn/
curl -I https://javaguide.cn/assets/app-xxx.js
curl -s https://javaguide.cn/robots.txt
curl -s https://javaguide.cn/sitemap.xml | head
```

重点确认：

- HTML 不长期缓存。
- hash JS/CSS 是长期缓存。
- `robots.txt` 包含 `Sitemap: https://javaguide.cn/sitemap.xml`。
- 重要入口页在 sitemap 中存在。
- 栏目入口页是 `weekly`，普通文章默认是 `monthly`。

## 已完成优化

### 搜索

- 站内搜索使用 Algolia DocSearch，不再生成 VuePress 本地客户端搜索索引。
- 主题中保留 DocSearch 配置入口：
  - `DOCSEARCH_APP_ID`
  - `DOCSEARCH_API_KEY`
  - `DOCSEARCH_INDEX_NAME`
- 没有 DocSearch key 时关闭搜索，避免生成本地 `searchIndex.js`。
- 当前 Algolia 应用 ID：`XXQ4GI90SC`
- 当前前端索引名：`javaguide`
- 前端 `DOCSEARCH_API_KEY` 必须使用 `XXQ4GI90SC` 应用下的 Search-Only API Key，不能使用旧应用 `U3RN7F5WI0` 的 key。
- 构建环境变量示例：

```bash
DOCSEARCH_APP_ID=XXQ4GI90SC
DOCSEARCH_INDEX_NAME=javaguide
DOCSEARCH_API_KEY=3b514f...ef027b
```

- 上面的 `DOCSEARCH_API_KEY` 只记录掩码；实际构建时使用完整 Search-Only API Key。
- `DOCSEARCH_ADMIN_API_KEY` 只用于本地/CI 写索引，不能提交到仓库，也不能放到前端环境变量里。
- 推荐从本地构建产物 `dist` 生成索引，避免在线抓取受 CDN、反爬、缓存或页面动态渲染影响。
- 2026-05-14 已用本地 `dist` 成功写入 `javaguide` 索引，索引 records 约 4.7 万条。

### SEO 和搜索引擎提交

- 全站 sitemap 默认频率是 `monthly`，匹配普通文章几个月更新一次的实际情况。
- 首页和栏目入口页保留显式 `weekly`：
  - `/`
  - `/home.html`
  - `/ai/`
  - `/cs-basics/`
- 普通文章不要单独写 `sitemap.changefreq: weekly`，除非它确实会频繁更新。
- `robots.txt` 由 VuePress SEO/Sitemap 插件生成，并自动追加 sitemap 地址。
- 已新增 `pnpm indexnow:submit`，用于部署后向 Bing/IndexNow 主动提交 URL。
- 重要页面需要重点维护：
  - `title`：包含核心搜索词，但不要堆砌。
  - `description`：说明页面覆盖范围和适用人群。
  - `keywords`：可作为补充，不要依赖它决定排名。
  - 首屏正文：广告或提示块前尽量有一段能概括页面价值的真实内容。
  - 内链锚文本：使用“Java 面试”“AI 应用开发面试”“计算机基础面试题”等明确词，而不是泛泛的“点击这里”。
- 新增或重写重点栏目后，优先检查：
  - 生成后的 `dist/sitemap.xml` 是否包含目标 URL。
  - `changefreq` 是否符合真实更新节奏。
  - canonical、Open Graph、JSON-LD 是否生成正常。
  - Bing Webmaster Tools / Google Search Console 中是否能正常抓取。

### GlobalUnlock

- 普通页面不再读取 `localStorage`、查询 DOM、读取 `scrollHeight` 或注入样式。
- 只有命中受保护路径时才执行加锁逻辑。
- 从受保护页面切走时清理之前加过的锁样式。

### Mermaid

- 新增懒加载 Mermaid 包装组件。
- 页面初始只展示轻量占位。
- 图表接近视口后再加载原 Mermaid 组件和 `mermaid.esm.min`。
- RocketMQ 页面本地烟测：
  - 初始 Mermaid 占位数量为 13。
  - 初始 SVG 渲染数量为 0。
  - 这说明 Mermaid 不再抢占首屏初始化；滚动触发渲染仍建议在未加锁页面继续定期抽测。

### 客户端入口

- `LayoutToggle` 改为延后到浏览器空闲时加载。
- `UnlockContent` 保持异步组件注册。
- `GlobalUnlock` 保持同步，避免受保护内容短暂露出。

### PhotoSwipe

- 关闭 `photoSwipe` 图片预览插件。
- 原因：图片点击放大不是文档阅读首屏刚需，但会额外带来初始 JS 请求。
- 如果后续仍需要图片放大能力，建议实现“点击图片后再懒加载预览库”。
- 当前轻量图片预览组件 `ClickImagePreview` 已改为 mounted 后再渲染 Teleport。
- 原因：Teleport 作为 root component 直接参与 SSR hydration 时，会导致 VuePress 首页被水合为空注释，表现为页面白屏且只剩 `Hydration completed but contains mismatches`。

### 打印功能

- 当前主题配置中已设置 `print: false`，Theme Hope 的 TOC 打印按钮不会渲染。
- Theme Hope 的打印按钮本身只是调用 `globalThis.print()`，不引入额外大依赖。
- 对比构建显示，关闭打印按钮对 gzip 后 JS 体积影响只有几十到数百字节，属于噪声级别。
- 结论：打印按钮不是当前电脑端卡顿的主要原因。
- 注意：用户主动触发浏览器打印或打印预览时，超长页面仍可能因为分页、样式计算和大 DOM 导致短暂卡顿，但这只发生在打印流程中，不影响普通阅读首屏和滚动。

### 版权复制插件

- 已禁用 Theme Hope 的 `plugins.copyright`。
- 原因：`@vuepress/plugin-copyright` 当前客户端代码在挂载时会执行 `document.querySelector("#app").style...`，没有空判断；线上部署后出现过 `Cannot read properties of null (reading 'style')`，会导致页面白屏。
- 影响：禁用后不再自动给复制内容追加“原文链接/版权信息”；页脚 Copyright 展示不受影响。
- 验证：clean build 通过，新的 `app-*.js` 中已不再包含 `querySelector("#app")`、`userSelect`、`setupCopyright` 相关代码。

## 最近一次构建验证

命令：

```bash
pnpm docs:build:clean
pnpm exec prettier --check docs/.vuepress/client.ts docs/.vuepress/components/DeferredLayoutToggle.vue PERFORMANCE_NOTES.md docs/.vuepress/components/LazyMermaid.vue docs/.vuepress/theme.ts docs/.vuepress/components/unlock/GlobalUnlock.vue
```

结果：

- VuePress clean build 通过。
- Prettier 检查通过。
- `searchIndex.js` 未生成。
- `photoswipe.esm` 不再出现在构建产物和客户端配置中。
- `app-*.js` gzip 后约 70 KB。
- `client-*.js` gzip 后约 129 KB。
- 本地烟测确认 `LayoutToggle` 会延后出现，不参与首屏同步渲染。

## 当前剩余大头

构建产物中仍然较大的页面 chunk 包括：

- `aqs.html`
- `java-concurrent-questions-03.html`
- `java8-common-new-features.html`
- `rocketmq-questions.html`
- `shell-intro.html`

这些主要是长文、代码块、表格和图表内容本身带来的页面 chunk 成本。

## TODO

- [ ] 处理老机器上的长文阅读卡顿：
  - 结论：CDN 主要解决下载慢，Intel Mac 等老机器卡顿更可能来自长文页面的 HTML 解析、Vue hydration、DOM 渲染、代码块和图表执行成本。
  - 目标：降低 `aqs.html`、`java-concurrent-questions-03.html`、`java8-common-new-features.html`、`rocketmq-questions.html`、`shell-intro.html` 等重页面在老电脑上的主线程压力。
  - 约束：长文拆分属于内容结构调整，执行前需要单独讨论。
- [ ] 讨论超长文章是否拆页：
  - 保留原 URL 还是做跳转。
  - 是否按问题组、章节或主题拆分。
  - 对 SEO、外链、阅读路径的影响。
- [ ] 讨论 Mermaid 是否进一步按文章治理：
  - 单页 Mermaid 数量过多的文章是否改为图片或拆分。
  - 高频访问文章是否做单独优化。
- [ ] 评估图片预览能力是否恢复为按点击懒加载。
- [ ] 评估是否对代码块非常多的页面做折叠、分页或局部渲染。

## 注意事项

- 不要长期缓存 HTML，否则发布后可能出现旧 HTML 引用不存在或不匹配的新 JS/CSS。
- hash 资源可以长期缓存，前提是构建产物文件名带内容 hash。
- 长文拆分属于内容结构调整，执行前需要单独讨论。
