<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :style="{ backgroundColor: getBgColor(toast.type) }"
      >
        <span>{{ toast.message }}</span>
        <button class="toast-close-btn" @click="$emit('dismiss', toast.id)" aria-label="Close notification">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  duration?: number;
}

const props = defineProps<{
  toasts: ToastMessage[];
}>();

const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
}>();

const timers = new Map<string, number>();

const setDismissTimer = (toast: ToastMessage) => {
  if (timers.has(toast.id)) return;
  const duration = toast.duration !== undefined ? toast.duration : 3500;
  if (duration > 0) {
    const timer = window.setTimeout(() => {
      emit('dismiss', toast.id);
      timers.delete(toast.id);
    }, duration);
    timers.set(toast.id, timer);
  }
};

watch(
  () => props.toasts,
  (newToasts) => {
    // Set timer for new toasts
    newToasts.forEach((toast) => {
      setDismissTimer(toast);
    });

    // Cleanup removed toasts
    const currentIds = new Set(newToasts.map((t) => t.id));
    for (const [id, timer] of timers.entries()) {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
});

const getBgColor = (type: ToastMessage['type']) => {
  switch (type) {
    case 'success':
      return '#059669';
    case 'warning':
      return '#D97706';
    case 'error':
      return '#DC2626';
    default:
      return '#2563EB';
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  gap: 12px;
}

.toast-close-btn {
  background: none;
  border: none;
  color: #ffffff;
  margin-left: auto;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}
.toast-close-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
</style>
