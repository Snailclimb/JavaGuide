<template>
  <!-- Chỉ render sau khi mount: tránh hydration mismatch vì đích teleport
       (.vp-navbar-end của theme) chưa tồn tại lúc SSR. -->
  <Teleport v-if="mounted" to=".vp-navbar-end" :disabled="!inNavbar">
    <div
      class="lang-switch"
      :class="{ 'is-floating': !inNavbar }"
      role="group"
      aria-label="Chuyển ngôn ngữ / 切换语言"
    >
      <a
        class="lang-seg"
        :class="{ 'is-active': site === 'cn' }"
        :href="cnHref"
        :aria-current="site === 'cn' ? 'true' : undefined"
        title="中文（原版）"
        >中文</a
      >
      <a
        class="lang-seg"
        :class="{ 'is-active': site === 'vi', 'is-missing': !viAvailable }"
        :href="viHref"
        :aria-current="site === 'vi' ? 'true' : undefined"
        :title="
          viAvailable
            ? 'Tiếng Việt'
            : 'Trang này chưa có bản dịch — mở trang chủ tiếng Việt'
        "
        >VI</a
      >
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePageData } from "vuepress/client";

// Inject lúc build bởi i18n/lang-switch/plugin.ts
declare const __LANG_SITE__: "cn" | "vi";
declare const __VI_ROUTES__: string[];

const site = __LANG_SITE__;
const viRoutes = new Set(__VI_ROUTES__);
const pageData = usePageData();

const mounted = ref(false);
const inNavbar = ref(false);

onMounted(() => {
  inNavbar.value = Boolean(document.querySelector(".vp-navbar-end"));
  mounted.value = true;
});

// page.path không chứa base -> giống nhau ở cả hai site.
const path = computed(() => pageData.value.path || "/");
const viAvailable = computed(() =>
  site === "vi" ? true : viRoutes.has(path.value),
);

// Hai site là hai VuePress app riêng -> phải dùng <a> (full reload).
const cnHref = computed(() => path.value);
const viHref = computed(() =>
  viAvailable.value ? `/vi${path.value}` : "/vi/",
);
</script>

<style scoped lang="scss">
.lang-switch {
  display: flex;
  overflow: hidden;
  align-items: stretch;
  height: 28px;
  margin-left: 0.5rem;
  border: 1px solid var(--vp-c-border, #e5e7eb);
  border-radius: 14px;
  font-size: 12px;
  line-height: 26px;
  white-space: nowrap;
}

.lang-seg {
  padding: 0 10px;
  color: var(--vp-c-text, #374151);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: var(--vp-c-accent, #3eaf7c);
    background: var(--vp-c-bg-alt, #f3f4f6);
  }

  &.is-active {
    color: #fff;
    background: var(--vp-c-accent, #3eaf7c);
    cursor: default;
  }

  &.is-missing:not(.is-active) {
    opacity: 0.55;
  }
}

// Fallback khi không tìm thấy .vp-navbar-end (theme đổi cấu trúc)
.lang-switch.is-floating {
  position: fixed;
  right: 20px;
  bottom: 196px;
  z-index: 999;
  height: 36px;
  margin-left: 0;
  border-radius: 18px;
  background: var(--vp-c-bg, #fff);
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
  font-size: 13px;
  line-height: 34px;

  .lang-seg {
    padding: 0 13px;
  }
}

:global(.layout-hidden) .lang-switch.is-floating {
  display: none;
}

@media (max-width: 719px) {
  .lang-switch {
    height: 26px;
    margin-left: 0.35rem;
    font-size: 11px;
    line-height: 24px;
  }

  .lang-seg {
    padding: 0 7px;
  }
}
</style>
