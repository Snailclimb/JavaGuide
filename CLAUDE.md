# CLAUDE.md — Dự án dịch JavaGuide sang tiếng Việt

> File này là **luật hệ thống bắt buộc**. Mọi session làm việc trên repo này PHẢI đọc và tuân thủ trước khi thao tác.

## 1. Bối cảnh dự án

- **Repo gốc**: [JavaGuide](https://javaguide.cn) — tài liệu tiếng Trung về Java backend & phỏng vấn (455 file `.md`, ~9.5MB), build bằng VuePress 2 + theme-hope.
- **Mục tiêu**: tạo **bản tiếng Việt hoàn chỉnh** của tài liệu, đặt trong thư mục `vi/` ở root repo, **giữ nguyên 100% cấu trúc thư mục** của `docs/`.
  - `docs/java/basis/reflection.md` → `vi/java/basis/reflection.md`
  - `docs/roadmap/java-roadmap.md` → `vi/roadmap/java-roadmap.md`
- **Thứ tự dịch**: theo **lộ trình học** (`docs/roadmap/`), không dịch ngẫu nhiên — để người đọc có thể học tuần tự ngay khi bản dịch đang tiến hành.
- **Tiến độ**: theo dõi tại [`vi/PROGRESS.md`](vi/PROGRESS.md). **Luôn đọc file này đầu session** để biết dịch tiếp từ đâu.

## 2. Luật tuyệt đối (KHÔNG được vi phạm)

| #   | Luật                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **KHÔNG sửa, xoá, di chuyển bất kỳ file gốc nào** trong `docs/`, `media/`, `scripts/`, `.vuepress/`. Repo gốc là read-only.                                         |
| 2   | Mọi bản dịch chỉ ghi vào `vi/`. Không đụng `package.json`, sidebar, navbar gốc.                                                                                     |
| 3   | **Giữ nguyên core** — không thêm ý, không bịa, không "bổ sung cho đầy đủ", không thêm lời bình của người dịch.                                                      |
| 4   | **Không dịch lan man**. Câu tiếng Việt ngắn hơn hoặc bằng độ dài ý gốc. Tiếng Trung vốn súc tích — bản dịch không được phình ra.                                    |
| 5   | **Bất kỳ ký tự tiếng Trung nào cũng phải được dịch**, kể cả trong code block, comment code, tên biến mô tả, chú thích ảnh, bảng, sơ đồ ASCII. Không để sót chữ Hán. |
| 6   | **Thuật ngữ chuyên ngành giữ nguyên tiếng Anh** (xem §4). Không Việt hoá thuật ngữ đã chuẩn.                                                                        |

## 3. Quy tắc dịch chi tiết

### 3.1 Frontmatter YAML

Dịch `title`, `description`, `tagline`, `category`, `tag`, `content` (keywords), text trong `actions`.
Giữ nguyên: `icon`, `head`, `sitemap`, `changefreq`, `priority`, `heroImage`, `footer`, `home`, tên khoá YAML.

```yaml
# Gốc                          # Dịch
title: Java 基础常见面试题总结   →  title: Tổng hợp câu hỏi phỏng vấn Java Basics thường gặp
category: Java                 →  category: Java          # tên category kỹ thuật giữ nguyên
tag:
  - Java基础                   →    - Java Basics
```

### 3.1.1 ⚠️ BẮT BUỘC — frontmatter phải hợp lệ YAML

Tiếng Trung dùng dấu hai chấm fullwidth `：` (an toàn trong YAML). Tiếng Việt dùng `:` thường
→ **làm vỡ YAML và fail build**. Đây là lỗi đã thực sự xảy ra:

```
error YAMLException: incomplete explicit mapping pair; a key node is missed
```

Quy tắc: nếu giá trị trong frontmatter chứa `: ` (hai chấm + khoảng trắng), kết thúc bằng `:`,
hoặc chứa ` #` → **phải bọc trong dấu nháy kép**.

```yaml
# SAI - vỡ build
title: Tổng hợp lộ trình học: Java backend, AI Agent

# ĐÚNG
title: "Tổng hợp lộ trình học: Java backend, AI Agent"
```

Script quét & sửa hàng loạt (chạy sau mỗi batch dịch):

```bash
python3 - <<'EOF'
import glob,re
for f in glob.glob('vi/**/*.md', recursive=True):
    src=open(f,encoding='utf-8').read()
    if not src.startswith('---\n'): continue
    end=src.index('\n---\n',3); fm=src[4:end+1]; rest=src[end+1:]
    out=[];ch=False
    for line in fm.split('\n'):
        m=re.match(r'^(\s*(?:-\s+)?[A-Za-z_][\w.-]*:)\s(.*)$', line)
        v=m.group(2).strip() if m else ''
        if m and v and v[0] not in '"\'|>[{&*!%@`' and (': ' in v or v.endswith(':') or ' #' in v):
            out.append(f'{m.group(1)} "{v.replace(chr(92),chr(92)*2).replace(chr(34),chr(92)+chr(34))}"');ch=True
        else: out.append(line)
    if ch: open(f,'w',encoding='utf-8').write('---\n'+'\n'.join(out)+rest); print('fixed',f)
EOF
```

### 3.2 Giữ nguyên tuyệt đối

- **Đường dẫn link nội bộ**: `./java-basic-questions-01.md`, `/home.md` — giữ y nguyên (cấu trúc `vi/` mirror `docs/` nên link tự đúng).
- **URL ngoài**, ảnh `https://oss.javaguide.cn/...`, `![...]()` — giữ nguyên URL, **dịch phần alt text**.
- **Directive VuePress**: `<!-- @include: @article-footer.snippet.md -->`, `::: tip`, `::: warning`, `:::` — giữ nguyên cú pháp, **dịch nội dung bên trong**. Nhãn `::: tip 提示` → `::: tip Gợi ý`.
- **Code**: tên class/method/biến/keyword/API/config key, output log, SQL, JSON — giữ nguyên. Chỉ dịch **comment** và **chuỗi string tiếng Trung**.
- HTML thô, `<!-- markdownlint-disable -->`, badge, table alignment.

### 3.3 Code block — ví dụ chuẩn

```java
// GỐC
// 创建一个线程池，核心线程数为 5
ExecutorService pool = Executors.newFixedThreadPool(5);
System.out.println("任务执行完成");

// DỊCH
// Tạo một thread pool với core thread số lượng là 5
ExecutorService pool = Executors.newFixedThreadPool(5);
System.out.println("Task thực thi hoàn tất");
```

### 3.3.1 Ngoại lệ — chữ Hán ĐƯỢC PHÉP giữ lại

Chỉ 3 trường hợp, ngoài ra không có ngoại lệ nào khác:

1. **Mã định danh pháp lý / số đăng ký**: ví dụ `鄂ICP备2020015769号-1` trong footer. Là số giấy phép, dịch ra sẽ sai.
2. **Từ khoá người dùng phải gõ/nhắn nguyên văn**: ví dụ nhắn `微信` cho bot WeChat, nhắn `学习路线` cho tài khoản công khai. Giữ nguyên chữ Hán, **thêm chú giải tiếng Việt trong ngoặc**: `nhắn "**微信**" (WeChat)`.
3. **Tên riêng trong URL / đường dẫn ảnh**: không đụng tới URL.

Mọi chữ Hán khác đều phải dịch. Khi verify thấy sót, kiểm tra xem có rơi vào 3 ca trên không — nếu không thì phải dịch.

### 3.4 Giọng văn

- Xưng hô: "bạn" (người đọc), tránh "chúng ta/tôi" trừ khi bản gốc dùng ngôi thứ nhất.
- Văn phong kỹ thuật, trực tiếp, không hoa mỹ.
- Câu hỏi phỏng vấn giữ dạng câu hỏi.
- Dịch nghĩa, không dịch từng chữ. Thành ngữ Trung → diễn đạt tự nhiên tiếng Việt.

## 4. Glossary — thuật ngữ GIỮ NGUYÊN tiếng Anh

Không bao giờ Việt hoá các thuật ngữ sau (danh sách mở rộng khi gặp thuật ngữ mới):

**Java core**: thread, thread pool, heap, stack, garbage collection (GC), class loader, bytecode, JVM, JDK, JRE, reflection, generic, wildcard, type erasure, serialization, annotation, lambda, stream, interface, abstract class, override, overload, encapsulation, inheritance, polymorphism, autoboxing, immutable, singleton, enum, record, virtual thread, checked/unchecked exception.

**Concurrency**: lock, deadlock, race condition, atomic, volatile, synchronized, CAS, AQS, JMM, happens-before, memory barrier, context switch, blocking/non-blocking, fair/unfair lock, reentrant, CountDownLatch, Semaphore, ThreadLocal.

**Collection**: List, Map, Set, Queue, hash, hash collision, load factor, capacity, red-black tree, linked list, array, iterator, fail-fast.

**Database**: index, clustered index, transaction, isolation level, dirty read, phantom read, ACID, MVCC, B+ tree, sharding, replication, master-slave, deadlock, lock escalation, execution plan, connection pool, binlog, redo log, undo log.

**Distributed / System design**: load balancing, cache, cache penetration/breakdown/avalanche (cache xuyên thấu / sập cache / cache avalanche — dịch kèm giữ tiếng Anh lần đầu), CAP, BASE, consistency, availability, partition tolerance, RPC, message queue, idempotent, rate limiting, circuit breaker, service discovery, distributed lock, CDN, microservice.

**Network / OS**: TCP, UDP, HTTP, HTTPS, handshake, DNS, socket, process, thread, context switch, kernel, user space, paging, virtual memory, deadlock, I/O multiplexing, epoll, zero-copy.

**AI**: LLM, prompt, token, embedding, RAG, Agent, MCP, fine-tuning, inference, context window, function calling, vector database.

**Chung**: framework, middleware, source code, build, deploy, commit, merge, refactor, performance, throughput, latency, backend, frontend, API, SDK, CLI.

### 4.1 Thuật ngữ nên dịch (KHÔNG giữ tiếng Anh)

| Tiếng Trung  | Tiếng Việt            |
| ------------ | --------------------- |
| 面试题       | câu hỏi phỏng vấn     |
| 学习路线     | lộ trình học          |
| 总结         | tổng hợp / tóm tắt    |
| 详解         | giải thích chi tiết   |
| 原理         | nguyên lý             |
| 底层         | tầng dưới / bên trong |
| 常见         | thường gặp            |
| 优缺点       | ưu / nhược điểm       |
| 使用场景     | trường hợp sử dụng    |
| 注意事项     | lưu ý                 |
| 建议阅读顺序 | thứ tự đọc đề xuất    |
| 适合谁看     | dành cho ai           |
| 学习重点     | trọng tâm học         |

## 5. Workflow bắt buộc mỗi session

1. Đọc `vi/PROGRESS.md` → xác định file tiếp theo trong hàng đợi.
2. Đọc file gốc bằng **CodeGraph** (§6), không dùng grep/find mò mẫm.
3. Dịch **nguyên file**, ghi vào đúng đường dẫn mirror trong `vi/`.
4. Verify: `grep -P '[\x{4e00}-\x{9fff}]' <file dịch>` → **phải rỗng**. Nếu còn chữ Hán, dịch tiếp cho sạch.
5. Cập nhật `vi/PROGRESS.md` (đánh dấu ✅, ghi ngày).
6. Không commit trừ khi người dùng yêu cầu.

### 5.1 Thứ tự dịch (lộ trình học)

```
Giai đoạn 1 — Trục lộ trình:  docs/roadmap/**, docs/README.md, docs/home.md
Giai đoạn 2 — Java core:      docs/java/README.md → basis → collection → concurrent → jvm → io → new-features
Giai đoạn 3 — CS basics:      docs/cs-basics/** (network, os, data-structure, algorithms)
Giai đoạn 4 — Database:       docs/database/** (mysql, redis, sql, mongodb, elasticsearch)
Giai đoạn 5 — Framework:      docs/system-design/**
Giai đoạn 6 — Phân tán:       docs/distributed-system/**, high-performance, high-availability
Giai đoạn 7 — Còn lại:        docs/ai/**, ai-coding/**, tools/**, books/**, interview-preparation/**, v.v.
```

Trong mỗi thư mục: dịch `README.md` trước (nó là mục lục + thứ tự đọc), rồi theo đúng thứ tự `README.md` liệt kê.

## 6. CodeGraph — dùng đúng chỗ

Repo đã index (`.codegraph/` tồn tại), **nhưng CodeGraph chỉ index source code** (`.vuepress/**` — TypeScript, Vue), **KHÔNG index file `.md`**. Đã xác minh: `codegraph_node docs/snippets/*.md` → _"No indexed file matches"_.

| Việc cần làm                                                  | Công cụ                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Đọc file tài liệu `.md` để dịch                               | `cat` / Read — CodeGraph không phủ                                                         |
| Hiểu cấu hình VuePress, sidebar, navbar, theme, component Vue | `mcp__codegraph__codegraph_explore "<symbol/câu hỏi>"` — **bắt buộc dùng trước** grep/find |
| Tìm một symbol trong `.vuepress/`                             | `mcp__codegraph__codegraph_node <symbol>`                                                  |
| Quét sót chữ Hán trong bản dịch                               | `grep -P '[\x{4e00}-\x{9fff}]'`                                                            |

Khi cần tra cứu cấu trúc site (thứ tự sidebar, alias `@snippet`, route), **luôn hỏi CodeGraph trước**, đừng grep mò trong `.vuepress/`.

## 7. Cấu trúc thư mục `vi/`

```
vi/
├── PROGRESS.md          # bảng tiến độ — nguồn sự thật duy nhất về trạng thái dịch
├── GLOSSARY.md          # thuật ngữ đã chốt, bổ sung dần khi gặp từ mới
├── README.md            # bản dịch docs/README.md
├── roadmap/
├── java/
├── cs-basics/
└── ...                  # mirror y hệt docs/
```

`vi/` **không** chứa `.vuepress/`, `snippets/*.snippet.md` được dịch và giữ nguyên tên file.

## 8. Deploy — site VuePress tiếng Việt

`vi/` **không chỉ là thư mục bản dịch, nó là một site VuePress hoàn chỉnh thứ 2**, dùng chung
theme/component/style với site gốc nên **UI giống hệt**. File gốc trong `docs/` không bị đụng tới.

### 8.1 Cấu trúc

```
vi/.vuepress/
├── config.ts        base:"/vi/"  dest:"./dist/vi"  lang:"vi-VN"   ← khác bản gốc
├── theme.ts         docsDir:"vi", SEO/JSON-LD tiếng Việt, canonical /vi
├── navbar.ts        đã dịch
├── sidebar/         đã dịch (11 file)
├── components/      đã dịch chuỗi UI (LayoutToggle, unlock, mermaid, image preview)
├── features/        đã dịch comment
├── styles/          đã dịch comment (SCSS y hệt bản gốc → UI không đổi)
└── public/          copy nguyên (logo, favicon, icon)
```

### 8.2 Lệnh

```bash
pnpm install           # lần đầu
pnpm vi:dev            # dev server site tiếng Việt
pnpm vi:build          # build ra dist/vi
pnpm build:all         # build site gốc (dist/) RỒI site vi (dist/vi/) — đúng thứ tự
```

**Thứ tự build quan trọng**: `vuepress build docs` ghi vào `dist/`, có thể xoá sạch thư mục đó.
Luôn build `docs` trước, `vi` sau — `pnpm build:all` đã làm đúng thứ tự.

### 8.3 Điểm đã xử lý, đừng phá

| Mục                          | Trạng thái                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `base: "/vi/"`               | Mọi asset/route đều có prefix `/vi/`. Đổi base phải rebuild toàn bộ.                                                     |
| `linksCheck: build "warn"`   | Tạm hạ từ `"error"` vì sidebar trỏ tới trang chưa dịch. **Đổi lại `"error"` khi dịch xong toàn bộ.**                     |
| `legacyRedirects = {}`       | Đã làm rỗng — redirect cũ là URL tiếng Trung của site gốc, vô nghĩa dưới `/vi/`.                                         |
| `trimDescription()`          | Đã đổi dấu câu `。！？，、` → `. ! ? , ;` — không đổi thì hàm không bao giờ tìm được điểm ngắt trong văn bản tiếng Việt. |
| `PROGRESS.md`, `GLOSSARY.md` | Đã loại khỏi `pagePatterns`, không build thành trang.                                                                    |

### 8.4 Kiểm chứng sau mỗi lần đổi cấu hình

```bash
pnpm vi:build                                  # phải "success"
grep -o 'href="/vi/assets[^"]*"' dist/vi/index.html | head -1   # phải có prefix /vi/
grep -o '<html[^>]*>' dist/vi/index.html                        # phải lang="vi-VN"
```

## 9. Kiến trúc zero-conflict với repo gốc

### 9.1 Nguyên tắc

Fork này phải **pull được code mới từ repo gốc mà không bao giờ conflict**. Muốn vậy:

> **KHÔNG sửa bất kỳ file nào mà upstream cũng sửa.**

Mọi thứ của bản dịch nằm trong các file/thư mục mà upstream **không hề có**:

| Đường dẫn                        | Chủ sở hữu   | Ghi chú                                                   |
| -------------------------------- | ------------ | --------------------------------------------------------- |
| `docs/**`                        | **upstream** | Read-only tuyệt đối. Kể cả `.vuepress/`.                  |
| `package.json`, `pnpm-lock.yaml` | **upstream** | **KHÔNG được đụng.** 54/200 commit gần nhất sửa file này. |
| `vi/**`                          | fork         | Nội dung dịch + site VuePress riêng                       |
| `i18n/**`                        | fork         | Nút đổi ngôn ngữ + công cụ sync                           |
| `Makefile`                       | fork         | Toàn bộ lệnh (thay cho npm scripts)                       |
| `CLAUDE.md`                      | fork         | File luật này                                             |

❌ **Đừng bao giờ** thêm script vào `package.json` — dùng `Makefile`.
❌ **Đừng bao giờ** sửa `docs/.vuepress/` để thêm tính năng — bọc ngoài bằng `i18n/cn.config.ts`.

### 9.2 Nút đổi ngôn ngữ hoạt động thế nào

Site tiếng Trung cần nút chuyển ngôn ngữ, nhưng navbar của nó nằm trong `docs/.vuepress/` (của upstream).
Giải pháp: **wrapper config + root component**, không đụng `docs/`:

```
i18n/cn.config.ts          import config upstream → spread → thêm plugin
i18n/lang-switch/plugin.ts VuePress plugin, inject __LANG_SITE__ + __VI_ROUTES__
i18n/lang-switch/client.ts đăng ký root component
i18n/lang-switch/LangSwitch.vue  nút [中文 | VI], Teleport vào .vp-navbar-end
i18n/lang-switch/vi-routes.mjs   quét vi/**/*.md → danh sách route đã dịch
```

Chạy site CN bằng `npx vuepress dev docs -c i18n/cn.config.ts` (đã gói trong `make cn-dev`).

**Vị trí nút**: component được `<Teleport>` vào `.vp-navbar-end` của theme (góc trên-phải,
cạnh nút GitHub/theme) **sau khi mount** — lúc SSR đích teleport chưa tồn tại nên component
render rỗng, tránh hydration mismatch. Nếu không tìm thấy `.vp-navbar-end` (theme đổi cấu trúc),
nó tự rơi về chế độ pill nổi góc dưới-phải thay vì biến mất.

⚠️ Vì render sau mount nên nút **không có trong HTML tĩnh** — đừng dùng `grep lang-switch dist/...`
để kiểm tra. Phải dump DOM sau khi JS chạy:

```bash
chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=8000 \
  --dump-dom http://localhost:9099/roadmap/java-roadmap.html | grep -o 'lang-seg[^>]*'
```

**Ánh xạ trang**: `page.path` không chứa base nên giống nhau ở cả 2 site.
`/java/basis/reflection.html` ↔ `/vi/java/basis/reflection.html`.
Trang chưa dịch → nút VI mờ đi và trỏ về `/vi/` thay vì link gãy.

### 9.3 Quy trình khi pull code mới

```bash
git remote add upstream https://github.com/Snailclimb/JavaGuide.git   # lần đầu
git fetch upstream && git merge upstream/main    # không conflict vì docs/ chưa bị đụng
make sync                                        # xem file mới / file gốc đã đổi
# ... dịch các file đó vào vi/ ...
make sync-mark                                   # đánh dấu đã đồng bộ tới HEAD
```

`make sync` báo 3 thứ:

- **Chưa dịch**: có trong `docs/` nhưng chưa có trong `vi/`
- **Gốc đã đổi**: file `docs/` thay đổi kể từ commit đánh dấu lần cuối → bản dịch bị cũ
- **Orphan**: có trong `vi/` nhưng upstream đã xoá/đổi tên

Trạng thái lưu ở `i18n/.sync-state.json`.

### 9.4 Dev hai site trên MỘT origin

Site CN và site VI là hai VuePress app riêng, mặc định chạy hai port khác nhau.
Nút đổi ngôn ngữ dùng đường dẫn tuyệt đối (`/` và `/vi/`) nên **bắt buộc hai site
phải cùng một origin**, nếu không sẽ 404.

Giải pháp: dev server CN (8080) proxy `/vi/*` sang dev server VI (8081), khai báo qua
`extendsBundlerOptions` trong `langSwitchPlugin` (option `devViPort`).

```bash
make dev     # chạy cả hai, LUÔN mở http://localhost:8080/
```

⚠️ Chỉ chạy `make cn-dev` một mình → `/vi/` sẽ 502 (không có server 8081).
⚠️ Mở thẳng `http://localhost:8081/vi/` → nút 中文 sẽ 404 (port đó không có site CN).
⚠️ Nếu port 8080/8081 đã bị chiếm, VuePress tự nhảy port khác và **proxy sẽ trỏ sai**.
`make dev` có preflight chặn trường hợp này; dọn bằng `pkill -f 'vuepress[ ]dev'`
(viết dấu ngoặc như vậy để pkill không tự khớp chính nó).

Bug đã gặp và đã sửa: site VI có base `/vi/` nên trả 404 cho `/vi` (thiếu `/` cuối).
Proxy có `rewrite` thêm dấu `/` cho đúng path đó.

### 9.5 Lệnh (Makefile)

```bash
make help        # danh sách lệnh
make dev         # CẢ HAI site trên :8080 (dùng cái này để test nút đổi ngôn ngữ)
make cn-dev      # chỉ site tiếng Trung  :8080
make vi-dev      # chỉ site tiếng Việt   :8081/vi/
make build       # build cả hai, đúng thứ tự -> dist/ + dist/vi/
make sync        # trạng thái đồng bộ sau khi pull
make check       # quét chữ Hán còn sót trong vi/
```

## 10. Deploy lên Vercel

Một project Vercel duy nhất phục vụ **cả hai** site: `/` là 中文, `/vi/` là Tiếng Việt.
Khớp đúng với `base: "/vi/"` đã cấu hình.

### 10.1 Cấu hình

`vercel.json` (file của fork, upstream không có → zero-conflict):

```json
{
  "buildCommand": "vuepress build docs -c i18n/cn.config.ts && vuepress build vi",
  "outputDirectory": "dist",
  "framework": null
}
```

Vì sao viết vậy:

| Mục                           | Lý do                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| Hai lệnh nối bằng `&&`        | Build CN **trước** (ghi `dist/`, xoá sạch thư mục), rồi VI (ghi `dist/vi/`). Đảo thứ tự là mất bản VI. |
| Không dùng `make`             | Build image của Vercel không đảm bảo có `make`. Gọi thẳng `vuepress`.                                  |
| `-c i18n/cn.config.ts`        | Không có cờ này thì site CN **mất nút đổi ngôn ngữ**.                                                  |
| `framework: null`             | Không để Vercel tự đoán preset và ghi đè lệnh build.                                                   |
| **Không** bật `cleanUrls`     | VuePress sinh link có đuôi `.html`. Bật `cleanUrls` là gãy toàn bộ link nội bộ.                        |
| **Không** đặt `trailingSlash` | Để mặc định Vercel; `/vi/` tự trỏ `dist/vi/index.html`.                                                |

### 10.2 Các bước

```bash
git add CLAUDE.md Makefile vercel.json i18n/ vi/
git commit -m "feat: bản dịch tiếng Việt + site VuePress thứ 2"
git push
```

Rồi trên Vercel: **Add New Project** → import repo → **Deploy**.
Không cần chỉnh gì trong UI, `vercel.json` đã khai báo đủ.
Vercel tự nhận `pnpm` từ `pnpm-lock.yaml` và `packageManager` trong `package.json`.

### 10.3 Lưu ý

- `dist/` nằm trong `.gitignore` — đúng, Vercel tự build chứ không lấy bản có sẵn.
- Build CN render 641 trang nên chậm hơn hẳn build VI. Số đo thực tế ở §10.4.
- Deploy lên domain khác cho riêng bản VI thì phải đổi `base` trong `vi/.vuepress/config.ts`
  từ `"/vi/"` về `"/"`, và sửa lại đường dẫn trong `i18n/lang-switch/LangSwitch.vue`.
- Repo gốc là **Apache 2.0** → được phép redistribute, nhớ giữ file `LICENSE` và ghi nguồn.

### 10.4 Số đo thực tế (đã chạy đúng `buildCommand` của vercel.json)

| Chỉ số                    | Giá trị                                     | Giới hạn Vercel |     |
| ------------------------- | ------------------------------------------- | --------------- | --- |
| Thời gian build (CN + VI) | **61 s**                                    | 45 phút         | ✅  |
| Peak RAM (build CN)       | **2.93 GB**                                 | 8 GB            | ✅  |
| Tổng file trong `dist/`   | **1.639**                                   | ~15.000         | ✅  |
| Dung lượng `dist/`        | **93 MB**                                   | —               | ✅  |
| File lớn nhất             | 2.3 MB (`feed.json`, `atom.xml`, `rss.xml`) | 100 MB/file     | ✅  |

Kết quả: `EXIT=0`, `dist/index.html` (667 trang CN) + `dist/vi/index.html` (11 trang VI).
Không cần `NODE_OPTIONS=--max-old-space-size`.

Đo lại khi số trang tăng nhiều:

```bash
rm -rf dist && time bash -c "$(python3 -c "import json;print(json.load(open('vercel.json'))['buildCommand'])")"
find dist -type f | wc -l && du -sh dist
```
