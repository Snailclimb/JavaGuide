<template>
  <div class="unlock-container" :class="{ 'is-locked': !isUnlocked }">
    <div class="content-wrapper" :style="contentStyle">
      <slot></slot>
      <div v-if="!isUnlocked" class="fade-mask"></div>
    </div>

    <transition name="slide-up">
      <div v-if="!isUnlocked" class="unlock-section">
        <div class="unlock-header">
          <span class="lock-icon">🔒</span>
          <h3 class="lock-title">人机验证</h3>
        </div>

        <p class="lock-reason">
          为保障正常阅读体验，本站部分内容已开启一次性验证。验证后全站自动解锁。
        </p>

        <div class="qr-container">
          <img :src="qrCodeUrl" alt="公众号二维码" class="qr-image" />
          <p class="qr-tip">
            扫码关注公众号，回复 <span class="highlight">“验证码”</span>
          </p>
        </div>

        <div class="input-wrapper">
          <input
            v-model="inputCode"
            type="text"
            placeholder="请输入 4 位验证码"
            class="unlock-input"
            maxlength="4"
            @keyup.enter="handleUnlock"
          />
          <button class="unlock-btn" @click="handleUnlock">立即解锁</button>
        </div>

        <transition name="shake">
          <p v-if="showError" class="error-msg">验证码错误，请重新输入</p>
        </transition>

        <p class="lock-footer">感谢你的理解与支持</p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { PREVIEW_HEIGHT, unlockConfig } from "../../features/unlock/config";

const props = defineProps({
  code: {
    type: String,
    default: unlockConfig.code,
  },
  qrCodeUrl: {
    type: String,
    default: unlockConfig.qrCodeUrl,
  },
  visibleHeight: {
    type: String,
    default: PREVIEW_HEIGHT.LONG,
  },
});

const isUnlocked = ref(false);
const inputCode = ref("");
const showError = ref(false);
const globalUnlockKey = `javaguide_site_unlocked_${unlockConfig.unlockVersion ?? "v1"}`;

onMounted(() => {
  isUnlocked.value = localStorage.getItem(globalUnlockKey) === "true";
});

const contentStyle = computed(() => {
  if (isUnlocked.value) return {};
  return {
    maxHeight: props.visibleHeight,
    overflow: "hidden",
    position: "relative",
  };
});

const handleUnlock = () => {
  if (inputCode.value === props.code) {
    isUnlocked.value = true;
    localStorage.setItem(globalUnlockKey, "true");
    showError.value = false;
  } else {
    showError.value = true;
    inputCode.value = "";
    setTimeout(() => {
      showError.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.unlock-container {
  position: relative;
  margin: 2rem 0;
}

.content-wrapper {
  position: relative;
}

.fade-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160px;
  background: linear-gradient(to bottom, transparent, var(--bg-color, #fff));
}

.is-locked {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 1rem;
}

.unlock-section {
  padding: 1.4rem 1rem 0.5rem;
  text-align: center;
}

.lock-title {
  margin: 0.35rem 0 0;
}

.lock-reason {
  margin: 0.75rem auto 1rem;
  color: #64748b;
  line-height: 1.6;
  max-width: 560px;
}

.qr-container {
  margin: 0 auto 1rem;
  padding: 0.85rem;
  max-width: 300px;
  border: 1px dashed #3eaf7c;
  border-radius: 10px;
  background: #f8fafc;
}

.qr-image {
  width: 140px;
  height: 140px;
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

.highlight {
  color: #3eaf7c;
  font-weight: 700;
}

.error-msg {
  margin: 0.45rem 0 0;
  color: #dc2626;
  font-size: 0.85rem;
}

.lock-footer {
  margin: 0.7rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.shake-enter-active {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
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
