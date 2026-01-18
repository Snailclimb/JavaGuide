<template>
  <button
    class="layout-toggle-btn"
    :class="{ 'is-hidden': isHidden }"
    :title="isHidden ? '退出沉浸式阅读' : '沉浸式阅读'"
    @click="toggleLayout"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        v-if="!isHidden"
        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
      />
      <path
        v-else
        d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
      />
    </svg>
    <span class="btn-text">{{ isHidden ? "退出沉浸" : "沉浸阅读" }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { usePageData } from "vuepress/client";

const isHidden = ref(false);
const pageData = usePageData();

const STORAGE_KEY = "javaguide-layout-hidden";
const IMMERSIVE_TITLE = "JavaGuide - 沉浸式阅读中";

// 计算当前页面的原始标题
const originalTitle = computed(() => {
  const title = pageData.value.title;
  const siteTitle = "JavaGuide";
  return title ? `${title} | ${siteTitle}` : siteTitle;
});

const toggleLayout = () => {
  isHidden.value = !isHidden.value;
};

// 更新浏览器标题
const updateBrowserTitle = (hidden: boolean) => {
  if (typeof document === "undefined") return;
  document.title = hidden ? IMMERSIVE_TITLE : originalTitle.value;
};

// 应用隐藏状态
const applyHiddenState = (hidden: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("layout-hidden", hidden);
  updateBrowserTitle(hidden);
};

// 监听沉浸模式状态变化
watch(isHidden, (newVal) => {
  applyHiddenState(newVal);
  localStorage?.setItem(STORAGE_KEY, String(newVal));
});

// 监听页面切换，更新标题
watch(
  () => pageData.value.path,
  () => {
    if (isHidden.value) {
      updateBrowserTitle(true);
    }
  },
);

onMounted(() => {
  const saved = localStorage?.getItem(STORAGE_KEY);
  if (saved === "true") {
    isHidden.value = true;
    applyHiddenState(true);
  }
});
</script>

<style lang="scss" scoped>
.layout-toggle-btn {
  position: fixed;
  right: 20px;
  bottom: 150px;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--vp-c-text);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: var(--vp-c-accent);
    border-color: var(--vp-c-accent);
    transform: scale(1.02);
  }

  &.is-hidden {
    background: var(--vp-c-accent);
    color: #fff;
    border-color: var(--vp-c-accent);
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .btn-text {
    font-weight: 500;
  }
}

// 移动端和平板隐藏按钮
@media (max-width: 959px) {
  .layout-toggle-btn {
    display: none;
  }
}
</style>
