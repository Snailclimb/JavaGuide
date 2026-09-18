<template>
  <div v-if="isClientReady && isLockedPage && !isUnlocked">
    <Teleport v-if="teleportTargetSelector" :to="teleportTargetSelector">
      <div class="read-more-anchor">
        <div class="read-more-mask" />
        <button class="read-more-btn" @click="showDialog = true">
          Đọc toàn bài
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <transition name="unlock-fade">
        <div
          v-if="showDialog"
          class="unlock-modal-mask"
          @click.self="showDialog = false"
        >
          <div class="unlock-modal">
            <div class="unlock-modal-header">
              <h3 class="lock-title">Xác minh không phải robot</h3>
              <button class="close-btn" @click="showDialog = false">×</button>
            </div>

            <p class="lock-reason">
              Để đảm bảo trải nghiệm đọc, một phần nội dung của site đã bật xác
              minh một lần. Xác minh xong sẽ mở khoá toàn site.
            </p>

            <div class="qr-container">
              <img
                :src="config.qrCodeUrl"
                alt="Mã QR tài khoản công khai"
                class="qr-image"
              />
              <p class="qr-tip">
                Quét mã / tìm trên WeChat để theo dõi
                <span class="highlight">“JavaGuide”</span>
              </p>
              <p class="qr-tip">
                Nhắn <span class="highlight">“验证码”</span> (mã xác minh)
              </p>
            </div>

            <div class="input-wrapper">
              <input
                v-model="inputCode"
                type="text"
                placeholder="Nhập mã xác minh"
                class="unlock-input"
                maxlength="4"
                @keyup.enter="handleUnlock"
              />
              <button class="unlock-btn" @click="handleUnlock">
                Mở khoá ngay
              </button>
            </div>

            <transition name="shake">
              <p v-if="showError" class="error-msg">
                Mã xác minh sai, vui lòng thử lại
              </p>
            </transition>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { usePageData } from "vuepress/client";
import {
  PREVIEW_HEIGHT,
  unlockConfig as config,
} from "../../features/unlock/config";

const STYLE_ID = "unlock-global-style";
const DATA_ATTR = "data-unlock-target";

const pageData = usePageData();
const isClientReady = ref(false);
const isUnlocked = ref(false);
const inputCode = ref("");
const showError = ref(false);
const showDialog = ref(false);
const hasAppliedLock = ref(false);
const teleportTargetSelector = ref<string | null>(null);
const globalUnlockKey = `javaguide_site_unlocked_${config.unlockVersion ?? "v1"}`;

const normalizePath = (path: string) =>
  path.replace(/\/$/, "").replace(".html", "").toLowerCase();

const isPathInPrefix = (currentPath: string, prefix: string) => {
  return currentPath === prefix || currentPath.startsWith(`${prefix}/`);
};

const isLockedPage = computed(() => {
  const currentPath = normalizePath(pageData.value.path);
  const byExactPath = Object.keys(config.protectedPaths)
    .map((p) => normalizePath(p))
    .includes(currentPath);
  if (byExactPath) return true;

  const prefixes = Object.keys(config.protectedPrefixes ?? {}).map((p) =>
    normalizePath(p),
  );
  return prefixes.some((prefix) => isPathInPrefix(currentPath, prefix));
});

const visibleHeight = computed(() => {
  const currentPath = normalizePath(pageData.value.path);
  const matchedPath = Object.keys(config.protectedPaths).find(
    (p) => normalizePath(p) === currentPath,
  );
  if (matchedPath) return config.protectedPaths[matchedPath];

  const matchedPrefix = Object.keys(config.protectedPrefixes ?? {}).find(
    (prefix) => isPathInPrefix(currentPath, normalizePath(prefix)),
  );
  if (matchedPrefix) return config.protectedPrefixes[matchedPrefix];

  return PREVIEW_HEIGHT.LONG;
});

const toPx = (value: string) => {
  const px = Number.parseInt(value, 10);
  return Number.isFinite(px) ? px : 1000;
};

const readUnlockState = () => {
  if (typeof window === "undefined") return;
  const persisted = localStorage.getItem(globalUnlockKey) === "true";
  isUnlocked.value = config.forceLock ? false : persisted;
};

const findContentEl = (): HTMLElement | null => {
  return (
    document.getElementById("markdown-content") ??
    (document.querySelector(".vp-page-content") as HTMLElement | null) ??
    (document.querySelector(".theme-hope-content") as HTMLElement | null)
  );
};

const ensureStyleEl = () => {
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  return styleEl;
};

const buildLockCSS = (height: string) => `
  [${DATA_ATTR}="true"] {
    max-height: ${height} !important;
    overflow: hidden !important;
    position: relative !important;
  }
`;

const clearLockStyle = () => {
  teleportTargetSelector.value = null;
  if (!hasAppliedLock.value) return;

  document.querySelectorAll(`[${DATA_ATTR}]`).forEach((el) => {
    el.removeAttribute(DATA_ATTR);
  });
  document.getElementById(STYLE_ID)?.remove();
  hasAppliedLock.value = false;
};

const applyLockStyle = async () => {
  if (typeof document === "undefined" || !isClientReady.value) return;

  if (!isLockedPage.value || isUnlocked.value) {
    clearLockStyle();
    return;
  }

  clearLockStyle();

  await nextTick();
  const contentEl = findContentEl();
  if (!contentEl) {
    clearLockStyle();
    return;
  }

  // Trong lúc chuyển route, node có thể đã bị unmount; tránh lỗi ở giai đoạn hydration
  if (!document.contains(contentEl)) {
    clearLockStyle();
    return;
  }

  // Khi nội dung chưa đủ dài thì không khoá và không hiển thị nút
  if (contentEl.scrollHeight <= toPx(visibleHeight.value)) {
    clearLockStyle();
    return;
  }

  const styleEl = ensureStyleEl();
  contentEl.setAttribute(DATA_ATTR, "true");
  styleEl.innerHTML = buildLockCSS(visibleHeight.value);
  hasAppliedLock.value = true;
  if (!contentEl.id) {
    contentEl.id = "unlock-content-root";
  }
  teleportTargetSelector.value = `#${contentEl.id}`;
};

const handleUnlock = () => {
  if (inputCode.value === config.code) {
    isUnlocked.value = true;
    localStorage.setItem(globalUnlockKey, "true");
    showDialog.value = false;
    showError.value = false;
    applyLockStyle();
    return;
  }

  showError.value = true;
  inputCode.value = "";
  setTimeout(() => {
    showError.value = false;
  }, 1800);
};

onMounted(() => {
  isClientReady.value = true;
  if (!isLockedPage.value) return;

  readUnlockState();
  nextTick(() => {
    applyLockStyle();
    // Chờ thêm một frame để theme render bất đồng bộ xong
    requestAnimationFrame(() => applyLockStyle());
    setTimeout(applyLockStyle, 300);
  });
});

watch(
  () => pageData.value.path,
  async () => {
    if (!isClientReady.value) return;

    if (!isLockedPage.value) {
      showDialog.value = false;
      clearLockStyle();
      return;
    }

    readUnlockState();
    showDialog.value = false;
    await applyLockStyle();
    setTimeout(applyLockStyle, 300);
  },
);
</script>

<style>
.read-more-anchor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 190px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 24px;
  z-index: 10;
  pointer-events: none;
}

.read-more-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    var(--bg-color, #fff) 72%
  );
  pointer-events: none;
}

[data-theme="dark"] .read-more-mask {
  background: linear-gradient(
    to bottom,
    rgba(29, 30, 32, 0),
    var(--bg-color, #1d1e20) 72%
  );
}

.read-more-btn {
  position: relative;
  z-index: 11;
  pointer-events: auto;
  min-width: 132px;
  padding: 0.56rem 1.35rem;
  border: 1px solid rgba(62, 175, 124, 0.45);
  border-radius: 999px;
  background: var(--bg-color, #fff);
  color: #3eaf7c;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(62, 175, 124, 0.16);
  transition: all 0.2s ease;
}

.read-more-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(62, 175, 124, 0.2);
}

.unlock-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.unlock-modal {
  width: min(92vw, 500px);
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-color, #fff);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.unlock-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 18px;
  line-height: 28px;
  cursor: pointer;
  flex-shrink: 0;
}

.lock-title {
  margin: 0;
  font-size: 1.16rem;
}

.lock-reason {
  margin: 0 0 1rem;
  color: #64748b;
  line-height: 1.6;
  font-size: 0.9rem;
}

.qr-container {
  margin: 0 auto 1rem;
  padding: 0.8rem;
  max-width: 300px;
  border: 1px dashed #3eaf7c;
  border-radius: 10px;
  background: #f8fafc;
}

.qr-image {
  width: 180px;
  height: 180px;
}

.qr-tip {
  margin: 0.45rem 0 0;
  font-size: 0.96rem;
}

.highlight {
  color: #3eaf7c;
  font-weight: 700;
}

.input-wrapper {
  display: flex;
  justify-content: center;
  gap: 0.55rem;
}

.unlock-input {
  width: 125px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  text-align: center;
  outline: none;
}

.unlock-input:focus {
  border-color: #3eaf7c;
}

.unlock-btn {
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 8px;
  background: #3eaf7c;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.error-msg {
  margin: 0.45rem 0 0;
  color: #dc2626;
  font-size: 0.85rem;
}

.unlock-fade-enter-active,
.unlock-fade-leave-active {
  transition: opacity 0.2s ease;
}

.unlock-fade-enter-from,
.unlock-fade-leave-to {
  opacity: 0;
}

.shake-enter-active {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}

@media (max-width: 576px) {
  .input-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .unlock-input,
  .unlock-btn {
    width: min(220px, 80vw);
  }
}
</style>
