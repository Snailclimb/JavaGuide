<template>
  <div v-if="isClientReady && isLockedPage && !isUnlocked">
    <Teleport v-if="teleportTargetSelector" :to="teleportTargetSelector">
      <div class="read-more-anchor">
        <div class="read-more-mask" />
        <button class="read-more-btn" @click="showDialog = true">
          阅读全文
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
              <h3 class="lock-title">人机验证</h3>
              <button class="close-btn" @click="showDialog = false">×</button>
            </div>

            <p class="lock-reason">
              为保障正常阅读体验，本站部分内容已开启一次性验证。验证后全站解锁。
            </p>

            <div class="qr-container">
              <img
                :src="config.qrCodeUrl"
                alt="公众号二维码"
                class="qr-image"
              />
              <p class="qr-tip">
                扫码/微信搜索关注
                <span class="highlight">“JavaGuide”</span>
              </p>
              <p class="qr-tip">回复 <span class="highlight">“验证码”</span></p>
            </div>

            <div class="input-wrapper">
              <input
                v-model="inputCode"
                type="text"
                placeholder="输入验证码"
                class="unlock-input"
                maxlength="4"
                @keyup.enter="handleUnlock"
              />
              <button class="unlock-btn" @click="handleUnlock">立即解锁</button>
            </div>

            <transition name="shake">
              <p v-if="showError" class="error-msg">验证码错误，请重试</p>
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

const applyLockStyle = async () => {
  if (typeof document === "undefined" || !isClientReady.value) return;

  document.querySelectorAll(`[${DATA_ATTR}]`).forEach((el) => {
    el.removeAttribute(DATA_ATTR);
  });

  teleportTargetSelector.value = null;
  const styleEl = ensureStyleEl();

  if (!isLockedPage.value || isUnlocked.value) {
    styleEl.innerHTML = "";
    return;
  }

  await nextTick();
  const contentEl = findContentEl();
  if (!contentEl) {
    styleEl.innerHTML = "";
    return;
  }

  // 路由切换期间节点可能已卸载，避免 hydration 阶段异常
  if (!document.contains(contentEl)) {
    styleEl.innerHTML = "";
    return;
  }

  // 内容不够长时不加锁、不展示按钮
  if (contentEl.scrollHeight <= toPx(visibleHeight.value)) {
    styleEl.innerHTML = "";
    return;
  }

  contentEl.setAttribute(DATA_ATTR, "true");
  styleEl.innerHTML = buildLockCSS(visibleHeight.value);
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
  readUnlockState();
  nextTick(() => {
    applyLockStyle();
    // 再补一帧，等主题异步渲染完成
    requestAnimationFrame(() => applyLockStyle());
    setTimeout(applyLockStyle, 300);
  });
});

watch(
  () => pageData.value.path,
  async () => {
    if (!isClientReady.value) return;
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
