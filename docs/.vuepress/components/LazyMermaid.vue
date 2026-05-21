<template>
  <div class="mermaid-lazy-container">
    <component
      :is="MermaidComponent"
      v-if="shouldRender && MermaidComponent"
      :code="code"
      :title="title"
    />
    <div
      v-else
      ref="placeholderEl"
      class="mermaid-lazy-placeholder"
      :class="{ 'is-error': loadError }"
    >
      <span v-if="!loadError" class="mermaid-lazy-spinner" aria-hidden="true" />
      <span>{{ loadError ?? "图表加载中" }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, shallowRef } from "vue";
import type { Component } from "vue";

defineProps<{
  code: string;
  title?: string;
}>();

const placeholderEl = shallowRef<HTMLElement | null>(null);
const shouldRender = shallowRef(false);
const MermaidComponent = shallowRef<Component | null>(null);
const loadError = shallowRef<string | null>(null);
let observer: IntersectionObserver | null = null;

const loadMermaidComponent = async () => {
  if (MermaidComponent.value) return;

  try {
    const { default: Mermaid } = await import(
      "@vuepress/plugin-markdown-chart/client/components/Mermaid.js"
    );
    MermaidComponent.value = markRaw(Mermaid);
    loadError.value = null;
  } catch (error) {
    console.error("Failed to load Mermaid component:", error);
    loadError.value = "图表加载失败，请刷新重试";
  }
};

const renderWhenVisible = () => {
  shouldRender.value = true;
  observer?.disconnect();
  observer = null;
  void loadMermaidComponent();
};

onMounted(() => {
  if (!placeholderEl.value) return;

  if (!("IntersectionObserver" in window)) {
    renderWhenVisible();
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) renderWhenVisible();
    },
    {
      rootMargin: "800px 0px",
    },
  );
  observer.observe(placeholderEl.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.mermaid-lazy-container {
  min-height: 320px;
  margin: 0.6em 0;
}

.mermaid-lazy-placeholder {
  display: flex;
  min-height: 320px;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--vp-c-text-mute);
  font-size: 0.9rem;
}

.mermaid-lazy-container :deep(.mermaid-wrapper) {
  min-height: 320px;
}

.mermaid-lazy-placeholder.is-error {
  color: var(--vp-c-danger);
}

.mermaid-lazy-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-accent-bg);
  border-radius: 50%;
  animation: mermaid-lazy-spin 0.8s linear infinite;
}

@keyframes mermaid-lazy-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
