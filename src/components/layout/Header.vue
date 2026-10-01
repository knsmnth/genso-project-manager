<template>
  <header class="global-header">
    <div class="header-left">
      <button
        id="menu-toggle"
        class="hamburger-btn"
        @click="$emit('menuToggle')"
        aria-label="Toggle Menu"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>

    <div class="header-right">
      <!-- Manual Sync Button -->
      <button
        class="header-icon-btn sync-btn"
        :class="{ 'spinning': isSyncing }"
        @click="$emit('sync')"
        title="Sync offline local data to database"
        aria-label="Sync Database"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>

      <!-- Live System Status Badge (Top-Right) -->
      <div
        class="live-status-badge"
        :class="isOnline ? 'status-online' : 'status-offline'"
        :title="isOnline ? 'System is Online & Synchronized' : 'System is Offline / Disconnected'"
      >
        <span class="live-status-dot"></span>
        <div class="live-status-content">
          <span class="live-status-label">LIVE STATUS</span>
          <span class="live-status-text">{{ isOnline ? 'Online' : 'Disconnected' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  searchQuery?: string;
  isSyncing?: boolean;
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'menuToggle'): void;
  (e: 'createOrder'): void;
  (e: 'sync'): void;
}>();

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.sync-btn {
  transition: transform 0.2s ease, color 0.2s ease;
}
.sync-btn:hover {
  color: #10b981;
}
.sync-btn.spinning svg {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
