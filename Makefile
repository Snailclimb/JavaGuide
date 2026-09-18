# JavaGuide — lệnh cho bản dịch tiếng Việt
#
# Cố ý KHÔNG thêm script vào package.json: file đó bị upstream sửa rất thường xuyên
# (54/200 commit gần nhất), thêm vào là chắc chắn conflict khi pull.
# Makefile là file của riêng fork này nên không bao giờ conflict.

VP := npx vuepress

.PHONY: help install dev cn-dev vi-dev cn-build vi-build build sync sync-mark missing check clean

help:
	@echo "  make install     Cài dependency (pnpm)"
	@echo ""
	@echo "  make dev         Chạy CẢ HAI site   -> http://localhost:8080/  (nút đổi ngôn ngữ hoạt động)"
	@echo "  make cn-dev      Chỉ site tiếng Trung -> http://localhost:8080/"
	@echo "  make vi-dev      Chỉ site tiếng Việt  -> http://localhost:8081/vi/"
	@echo ""
	@echo "  make build       Build CẢ HAI site (đúng thứ tự) -> dist/ + dist/vi/"
	@echo "  make cn-build    Chỉ build site tiếng Trung -> dist/"
	@echo "  make vi-build    Chỉ build site tiếng Việt  -> dist/vi/"
	@echo ""
	@echo "  make sync        Sau khi git pull: xem file nào mới/đã đổi cần dịch"
	@echo "  make sync-mark   Đánh dấu đã dịch xong tới commit hiện tại"
	@echo "  make missing     Chỉ in danh sách file chưa dịch"
	@echo "  make check       Quét chữ Hán còn sót trong vi/"

install:
	pnpm install

# Chạy cả hai dev server. Site CN (8080) proxy /vi/* sang site VI (8081),
# nên cả hai nằm trên MỘT origin -> nút đổi ngôn ngữ hoạt động y hệt production.
# Luôn mở http://localhost:8080/ , đừng mở 8081 trực tiếp.
dev:
	@for p in 8080 8081; do \
	  if ss -ltn 2>/dev/null | grep -q ":$$p "; then \
	    echo "✖ Port $$p đang bị chiếm. VuePress sẽ tự nhảy port khác và proxy /vi/ sẽ sai."; \
	    echo "  Tắt tiến trình cũ rồi chạy lại:  kill \$$(ss -ltnp 2>/dev/null | grep ':'$$p' ' | grep -o 'pid=[0-9]*' | cut -d= -f2)"; \
	    exit 1; \
	  fi; \
	done
	@echo "→ http://localhost:8080/      (中文)"
	@echo "→ http://localhost:8080/vi/   (Tiếng Việt, qua proxy)"
	@$(VP) dev vi -p 8081 & VI_PID=$$!; \
	trap "kill $$VI_PID 2>/dev/null; exit 0" INT TERM; \
	$(VP) dev docs -c i18n/cn.config.ts; \
	kill $$VI_PID 2>/dev/null; true

# Site gốc tiếng Trung, dùng wrapper config để chèn nút đổi ngôn ngữ
# mà không phải sửa file nào trong docs/.
# LƯU Ý: chạy riêng lệnh này thì /vi/ sẽ 502 vì chưa có server 8081 -> dùng `make dev`.
cn-dev:
	$(VP) dev docs -c i18n/cn.config.ts

vi-dev:
	$(VP) dev vi -p 8081

cn-build:
	$(VP) build docs -c i18n/cn.config.ts

# QUAN TRỌNG: build docs TRƯỚC (ghi vào dist/, có thể xoá sạch thư mục),
# rồi mới build vi (ghi vào dist/vi/).
vi-build:
	$(VP) build vi

build: cn-build vi-build
	@echo "✓ dist/ (中文) + dist/vi/ (Tiếng Việt)"

sync:
	@node i18n/sync-check.mjs

sync-mark:
	@node i18n/sync-check.mjs --mark

missing:
	@node i18n/sync-check.mjs --list

check:
	@echo "Chữ Hán còn sót trong vi/ (chỉ được còn ngoại lệ ở CLAUDE.md §3.3.1):"
	@grep -rnP '[\x{4e00}-\x{9fff}]' vi/ --include='*.md' --include='*.ts' --include='*.vue' --include='*.scss' || echo "  (sạch)"

clean:
	rm -rf dist docs/.vuepress/.temp docs/.vuepress/.cache vi/.vuepress/.temp vi/.vuepress/.cache
