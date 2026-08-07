<template>
  <aside :class="['sidebar', { open: sidebarOpen }]" id="sidebar">
    <div
      class="sidebar-brand"
      @click="handleBrandClick"
      style="cursor: pointer"
    >
      <svg className="brand-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="brand-info">
        <span class="brand-text">InfraAdmin</span>
        <span class="brand-subtext">Operational Hub</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'dashboard' }]"
        @click.prevent="$emit('viewChange', 'dashboard')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
        <span>Dashboard</span>
      </a>

      <!-- Work Orders Group -->
      <div class="nav-parent-group">
        <a
          href="#"
          :class="['nav-item', { active: isWorkOrdersActive }]"
          @click.prevent="toggleWorkOrders"
          style="justify-content: space-between"
        >
          <div style="display: flex; align-items: center; gap: 12px">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Work Orders</span>
          </div>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            :style="{
              transform: workOrdersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>

        <!-- Sub-menu -->
        <div v-if="workOrdersExpanded" class="nav-sub-menu">
          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'workorders' }]"
            @click.prevent="$emit('viewChange', 'workorders')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>All Work Orders</span>
          </a>

          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'dailyworklog' }]"
            @click.prevent="$emit('viewChange', 'dailyworklog')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="15" y2="16" />
            </svg>
            <span>Daily Work Log</span>
          </a>
        </div>
      </div>

      <!-- Teams -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'teams' }]"
        @click.prevent="$emit('viewChange', 'teams')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Teams</span>
      </a>

      <!-- Personnel -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
        @click.prevent="$emit('viewChange', 'personnel')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
        </svg>
        <span>Personnel</span>
      </a>

      <!-- Alerts -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'alerts' }]"
        @click.prevent="$emit('viewChange', 'alerts')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Alerts</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <button
        v-if="installPromptEvent"
        id="install-btn"
        class="install-app-btn"
        @click="handleInstallClick"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        <span>Install Mobile App</span>
      </button>

      <button class="btn btn-sidebar-action" @click="$emit('createOrder')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        <span>Create Work Order</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  activeView: string;
  sidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'viewChange', view: string): void;
  (e: 'sidebarClose'): void;
  (e: 'createOrder'): void;
}>();

const installPromptEvent = ref<any>(null);
const isWorkOrdersActive = computed(
  () => props.activeView === 'workorders' || props.activeView === 'dailyworklog'
);

const workOrdersExpanded = ref(true);

watch(
  () => props.activeView,
  (newVal) => {
    if (newVal === 'workorders' || newVal === 'dailyworklog') {
      workOrdersExpanded.value = true;
    }
  },
  { immediate: true }
);

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  installPromptEvent.value = e;
};

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});

const handleInstallClick = async () => {
  if (!installPromptEvent.value) return;
  installPromptEvent.value.prompt();
  const { outcome } = await installPromptEvent.value.userChoice;
  console.log(`User response to install prompt: ${outcome}`);
  installPromptEvent.value = null;
};

const toggleWorkOrders = () => {
  workOrdersExpanded.value = !workOrdersExpanded.value;
  if (props.activeView !== 'workorders' && props.activeView !== 'dailyworklog') {
    emit('viewChange', 'workorders');
  }
};

const handleBrandClick = () => {
  if (window.innerWidth <= 1024) {
    emit('sidebarClose');
  }
};
</script>
