<template>
  <Teleport v-if="isMounted" to="body">
    <transition name="image-preview-fade">
      <div
        v-if="previewImage"
        class="image-preview-mask"
        role="dialog"
        aria-modal="true"
        @click.self="closePreview"
      >
        <button
          class="image-preview-close"
          type="button"
          aria-label="Đóng xem trước ảnh"
          @click="closePreview"
        >
          ×
        </button>
        <img
          class="image-preview-img"
          :src="previewImage.src"
          :alt="previewImage.alt"
          @click.stop
        />
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

interface PreviewImage {
  src: string;
  alt: string;
}

const CONTENT_SELECTOR =
  "#markdown-content, .theme-hope-content, .vp-page-content, .vp-content";
const IMAGE_SELECTOR = "img:not([no-view])";

const isMounted = ref(false);
const previewImage = ref<PreviewImage | null>(null);

const getPreviewableImage = (
  target: EventTarget | null,
): HTMLImageElement | null => {
  if (!(target instanceof Element)) return null;

  const img = target.closest(IMAGE_SELECTOR);
  if (!(img instanceof HTMLImageElement)) return null;
  if (!img.closest(CONTENT_SELECTOR)) return null;
  if (img.closest("a")) return null;

  return img;
};

const closePreview = () => {
  previewImage.value = null;
};

const handleClick = (event: MouseEvent) => {
  const img = getPreviewableImage(event.target);
  if (!img) return;

  const src = img.currentSrc || img.src;
  if (!src) return;

  event.preventDefault();
  previewImage.value = {
    src,
    alt: img.alt || "Xem trước ảnh",
  };
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closePreview();
};

watch(previewImage, (image) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle(
    "image-preview-open",
    Boolean(image),
  );
});

onMounted(() => {
  isMounted.value = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClick);
  document.removeEventListener("keydown", handleKeydown);
  document.documentElement.classList.remove("image-preview-open");
});
</script>

<style scoped lang="scss">
:global(
  #markdown-content :not(a) > img:not([no-view]),
  .theme-hope-content :not(a) > img:not([no-view]),
  .vp-page-content :not(a) > img:not([no-view]),
  .vp-content :not(a) > img:not([no-view])
) {
  cursor: zoom-in;
}

:global(.image-preview-open) {
  overflow: hidden;
}

.image-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgb(0 0 0 / 82%);
  cursor: zoom-out;
}

.image-preview-img {
  display: block;
  max-width: min(100%, 1280px);
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 35%);
  cursor: default;
}

.image-preview-close {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: rgb(255 255 255 / 16%);
  font-size: 30px;
  line-height: 38px;
  cursor: pointer;
}

.image-preview-close:hover {
  background: rgb(255 255 255 / 24%);
}

.image-preview-fade-enter-active,
.image-preview-fade-leave-active {
  transition: opacity 0.16s ease;
}

.image-preview-fade-enter-from,
.image-preview-fade-leave-to {
  opacity: 0;
}

@media (max-width: 719px) {
  .image-preview-mask {
    padding: 16px;
  }
}
</style>
