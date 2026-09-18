import { readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

// File .md không được VuePress build thành trang (khớp pagePatterns của cả 2 site)
const EXCLUDE_FILES = new Set(["PROGRESS.md", "GLOSSARY.md", "TODO.md"]);
const EXCLUDE_DIRS = new Set([".vuepress", "node_modules", ".git"]);

/** Liệt kê mọi file .md (đường dẫn tương đối, dùng "/") trong 1 thư mục nguồn. */
export function listMarkdown(srcDir) {
  if (!existsSync(srcDir)) return [];
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!EXCLUDE_DIRS.has(e.name)) walk(join(dir, e.name));
      } else if (
        e.name.endsWith(".md") &&
        !e.name.endsWith(".snippet.md") &&
        !EXCLUDE_FILES.has(e.name)
      ) {
        out.push(relative(srcDir, join(dir, e.name)).split(sep).join("/"));
      }
    }
  };
  walk(srcDir);
  return out.sort();
}

/** "java/basis/x.md" -> "/java/basis/x.html" · "roadmap/README.md" -> "/roadmap/" · "README.md" -> "/" */
export function toRoute(relPath) {
  if (relPath === "README.md") return "/";
  if (relPath.endsWith("/README.md"))
    return `/${relPath.slice(0, -"README.md".length)}`;
  return `/${relPath.slice(0, -".md".length)}.html`;
}

/** Danh sách route đã có bản dịch tiếng Việt. */
export function scanViRoutes(viDir) {
  return listMarkdown(viDir).map(toRoute);
}
