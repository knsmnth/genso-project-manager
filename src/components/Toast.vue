<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :style="{ backgroundColor: getBgColor(toast.type) }"
    >
      <span>{{ toast.message }}</span>
      <button class="toast-close-btn" @click="$emit('dismiss', toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

const props = defineProps<{
  toasts: ToastMessage[];
}>();

const emit = defineEmits<{
  (e: 'dismiss', id: string): void;
}>();

const timers = new Map<string, number>();

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
  animation: slideIn 0.2s ease-out;
}

.toast-close-btn {
  background: none;
  border: none;
  color: #ffffff;
  margin-left: 12px;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
}
.toast-close-btn:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
