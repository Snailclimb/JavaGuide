#!/usr/bin/env node
// Báo cáo trạng thái đồng bộ giữa docs/ (gốc tiếng Trung) và vi/ (bản dịch).
// Chạy sau mỗi lần `git pull` để biết phải dịch tiếp file nào.
//
//   node i18n/sync-check.mjs          # báo cáo
//   node i18n/sync-check.mjs --mark   # đánh dấu đã đồng bộ tới commit hiện tại
//   node i18n/sync-check.mjs --list   # chỉ in danh sách file thiếu (cho script khác dùng)

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { listMarkdown } from "./lang-switch/vi-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STATE = resolve(ROOT, "i18n/.sync-state.json");
const args = new Set(process.argv.slice(2));

const git = (cmd) =>
  execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8" }).trim();

const head = git("rev-parse HEAD");

if (args.has("--mark")) {
  writeFileSync(
    STATE,
    JSON.stringify(
      { lastSyncedCommit: head, markedAt: new Date().toISOString() },
      null,
      2,
    ) + "\n",
  );
  console.log(`✓ Đã đánh dấu đồng bộ tới commit ${head.slice(0, 8)}`);
  process.exit(0);
}

const cn = listMarkdown(resolve(ROOT, "docs"));
const vi = new Set(listMarkdown(resolve(ROOT, "vi")));

const missing = cn.filter((f) => !vi.has(f));
const orphan = [...vi].filter((f) => !cn.includes(f));

if (args.has("--list")) {
  missing.forEach((f) => console.log(f));
  process.exit(0);
}

// File gốc đã đổi kể từ lần đồng bộ cuối -> bản dịch tương ứng bị cũ
let stale = [];
let lastSynced = null;
if (existsSync(STATE)) {
  lastSynced = JSON.parse(readFileSync(STATE, "utf8")).lastSyncedCommit;
  try {
    stale = git(`diff --name-only ${lastSynced} HEAD -- docs`)
      .split("\n")
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/^docs\//, ""))
      .filter((f) => vi.has(f));
  } catch {
    console.warn(
      `⚠ Không đọc được lịch sử từ ${lastSynced} — bỏ qua kiểm tra file cũ.\n`,
    );
  }
}

const pct = cn.length ? ((vi.size / cn.length) * 100).toFixed(1) : "0.0";
console.log(`\n📊 Tiến độ dịch: ${vi.size}/${cn.length} file (${pct}%)`);
console.log(`   HEAD hiện tại: ${head.slice(0, 8)}`);
console.log(
  `   Đồng bộ lần cuối: ${lastSynced ? lastSynced.slice(0, 8) : "chưa đánh dấu (chạy --mark)"}\n`,
);

if (stale.length) {
  console.log(
    `♻️  ${stale.length} file GỐC ĐÃ ĐỔI kể từ lần đồng bộ — cần dịch lại:`,
  );
  stale.forEach((f) => console.log(`   ~ ${f}`));
  console.log();
}

if (orphan.length) {
  console.log(
    `🗑  ${orphan.length} file chỉ có ở vi/ (upstream đã xoá/đổi tên?):`,
  );
  orphan.forEach((f) => console.log(`   - ${f}`));
  console.log();
}

console.log(`⬜ ${missing.length} file CHƯA DỊCH. 15 file đầu:`);
missing.slice(0, 15).forEach((f) => console.log(`   docs/${f}`));
if (missing.length > 15)
  console.log(`   ... còn ${missing.length - 15} file (xem --list)`);
console.log();
