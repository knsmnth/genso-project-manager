<template>
  <aside :class="['sidebar', { open: sidebarOpen }]" id="sidebar">
    <div class="sidebar-brand-wrapper">
      <div
        class="sidebar-brand"
        @click="handleBrandClick"
        style="cursor: pointer"
      >
        <div class="brand-logo-mark">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <defs>
              <linearGradient id="sideLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00E676" />
                <stop offset="50%" stop-color="#00C853" />
                <stop offset="100%" stop-color="#006C49" />
              </linearGradient>
              <linearGradient id="sideCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#006C49" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#00E676" stop-opacity="0.3" />
              </linearGradient>
            </defs>
            <polygon points="20 3 36 12 36 28 20 37 4 28 4 12" fill="url(#sideCoreGrad)" stroke="url(#sideLogoGrad)" stroke-width="2.5" />
            <path d="M20 9 L31 15 L31 25 L20 31 L9 25 L9 15 Z" fill="#0B132B" stroke="#00E676" stroke-width="1.8" />
            <path d="M20 9 L20 20 M31 15 L20 20 M9 15 L20 20 M20 20 L20 31" stroke="url(#sideLogoGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="20" cy="20" r="3" fill="#00E676" />
          </svg>
        </div>
        <div class="brand-info">
          <div style="display: flex; align-items: center; gap: 6px">
            <span class="brand-text">Genso</span>
            <span class="brand-tag-pro">PRO</span>
          </div>
          <span class="brand-subtext">Infra Management</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'dashboard' }]"
        @click.prevent="$emit('viewChange', 'dashboard')"
        title="Dashboard"
      >
        <div class="nav-item-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <span>Dashboard</span>
      </a>

      <!-- Work Orders Group -->
      <div
        :class="['nav-parent-group', { 'flyout-active': isFlyoutActive }]"
        @mouseenter="handleMouseEnterFlyout"
        @mouseleave="handleMouseLeaveFlyout"
      >
        <a
          href="#"
          :class="['nav-item', { active: activeView === 'workorders' }]"
          @click.prevent="handleWorkOrdersMainClick"
          title="Work Orders"
          style="justify-content: space-between"
        >
          <div style="display: flex; align-items: center; gap: 12px">
            <div class="nav-item-icon-box">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" />
              </svg>
            </div>
            <span>Work Orders</span>
          </div>
          <button
            type="button"
            class="nav-expand-btn"
            @click.stop="workOrdersExpanded = !workOrdersExpanded"
            aria-label="Toggle Submenu"
            title="Toggle Submenu"
            style="background: transparent; border: none; padding: 4px; color: inherit; cursor: pointer; display: flex; align-items: center"
          >
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
              <polyline points="6 9 12 15 18 9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </a>

        <!-- Sub-menu: Daily Work Log & Work Log History (when expanded) -->
        <div v-if="workOrdersExpanded" class="nav-sub-menu">
          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'dailyworklog' }]"
            @click.prevent="$emit('viewChange', 'dailyworklog')"
            title="Daily Work Log"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="9" y1="12" x2="15" y2="12" stroke-linecap="round" />
              <line x1="9" y1="16" x2="15" y2="16" stroke-linecap="round" />
            </svg>
            <span>Daily Work Log</span>
          </a>

          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'workloghistory' }]"
            @click.prevent="$emit('viewChange', 'workloghistory')"
            title="Work Log History"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Work Log History</span>
          </a>
        </div>

        <!-- Floating Flyout Popover (when collapsed) -->
        <div
          class="nav-flyout-popover"
          @mouseenter="handleMouseEnterFlyout"
          @mouseleave="handleMouseLeaveFlyout"
        >
          <div class="flyout-header">Work Orders</div>
          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'workorders' }]"
            @click.prevent="handleFlyoutNav('workorders')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" />
            </svg>
            <span>Work Orders</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'dailyworklog' }]"
            @click.prevent="handleFlyoutNav('dailyworklog')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="9" y1="12" x2="15" y2="12" stroke-linecap="round" />
              <line x1="9" y1="16" x2="15" y2="16" stroke-linecap="round" />
            </svg>
            <span>Daily Work Log</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'workloghistory' }]"
            @click.prevent="handleFlyoutNav('workloghistory')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Work Log History</span>
          </a>
        </div>
      </div>

      <!-- Personnel & Teams Group -->
      <div
        :class="['nav-parent-group', { 'flyout-active': isPersonnelFlyoutActive }]"
        @mouseenter="handleMouseEnterPersonnelFlyout"
        @mouseleave="handleMouseLeavePersonnelFlyout"
      >
        <a
          href="#"
          :class="['nav-item', { active: activeView === 'personnel' || activeView === 'teams' || activeView === 'quick-onboard' }]"
          @click.prevent="handlePersonnelMainClick"
          title="Personnel & Teams"
          style="justify-content: space-between"
        >
          <div style="display: flex; align-items: center; gap: 12px">
            <div class="nav-item-icon-box">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span>Personnel</span>
          </div>
          <button
            type="button"
            class="nav-expand-btn"
            @click.stop="personnelExpanded = !personnelExpanded"
            aria-label="Toggle Submenu"
            title="Toggle Submenu"
            style="background: transparent; border: none; padding: 4px; color: inherit; cursor: pointer; display: flex; align-items: center"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              :style="{
                transform: personnelExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }"
            >
              <polyline points="6 9 12 15 18 9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </a>

        <!-- Sub-menu: Staff Registry & Teams/Groups (when expanded) -->
        <div v-if="personnelExpanded" class="nav-sub-menu">
          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
            @click.prevent="$emit('viewChange', 'personnel')"
            title="Staff Registry"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.5 8.5 0 0 1 13 0" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Staff Registry</span>
          </a>

          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'teams' }]"
            @click.prevent="$emit('viewChange', 'teams')"
            title="Teams & Groups"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Teams & Groups</span>
          </a>
        </div>

        <!-- Floating Flyout Popover (when collapsed) -->
        <div
          class="nav-flyout-popover"
          @mouseenter="handleMouseEnterPersonnelFlyout"
          @mouseleave="handleMouseLeavePersonnelFlyout"
        >
          <div class="flyout-header">Personnel & Teams</div>
          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
            @click.prevent="handlePersonnelFlyoutNav('personnel')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.5 8.5 0 0 1 13 0" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Staff Registry</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'teams' }]"
            @click.prevent="handlePersonnelFlyoutNav('teams')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Teams & Groups</span>
          </a>
        </div>
      </div>

      <!-- System Registries & Assets -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'catalogs' }]"
        @click.prevent="$emit('viewChange', 'catalogs')"
        title="System Registries & Assets"
      >
        <div class="nav-item-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="12" y1="11" x2="12" y2="17" stroke-linecap="round" />
            <line x1="9" y1="14" x2="15" y2="14" stroke-linecap="round" />
          </svg>
        </div>
        <span>Registries & Assets</span>
      </a>

      <!-- Alerts -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'alerts' }]"
        @click.prevent="$emit('viewChange', 'alerts')"
        title="Alerts"
      >
        <div class="nav-item-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" />
          </svg>
        </div>
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

const props = withDefaults(
  defineProps<{
    activeView: string;
    sidebarOpen: boolean;
    isCollapsed?: boolean;
    isPinned?: boolean;
    sidebarMode?: string;
  }>(),
  {
    isCollapsed: false,
    isPinned: true,
    sidebarMode: 'pinned-open'
  }
);

const emit = defineEmits<{
  (e: 'viewChange', view: string): void;
  (e: 'sidebarClose'): void;
  (e: 'createOrder'): void;
  (e: 'togglePin'): void;
}>();

const installPromptEvent = ref<any>(null);
const workOrdersExpanded = ref(true);
const isFlyoutActive = ref(false);
let flyoutLeaveTimeout: any = null;

const personnelExpanded = ref(true);
const isPersonnelFlyoutActive = ref(false);
let personnelFlyoutLeaveTimeout: any = null;

const handleMouseEnterFlyout = () => {
  if (flyoutLeaveTimeout) {
    clearTimeout(flyoutLeaveTimeout);
    flyoutLeaveTimeout = null;
  }
  isFlyoutActive.value = true;
};

const handleMouseLeaveFlyout = () => {
  if (flyoutLeaveTimeout) {
    clearTimeout(flyoutLeaveTimeout);
  }
  flyoutLeaveTimeout = setTimeout(() => {
    isFlyoutActive.value = false;
  }, 260);
};

const handleMouseEnterPersonnelFlyout = () => {
  if (personnelFlyoutLeaveTimeout) {
    clearTimeout(personnelFlyoutLeaveTimeout);
    personnelFlyoutLeaveTimeout = null;
  }
  isPersonnelFlyoutActive.value = true;
};

const handleMouseLeavePersonnelFlyout = () => {
  if (personnelFlyoutLeaveTimeout) {
    clearTimeout(personnelFlyoutLeaveTimeout);
  }
  personnelFlyoutLeaveTimeout = setTimeout(() => {
    isPersonnelFlyoutActive.value = false;
  }, 260);
};

const handleWorkOrdersMainClick = () => {
  isFlyoutActive.value = false;
  emit('viewChange', 'workorders');
};

const handleFlyoutNav = (view: string) => {
  isFlyoutActive.value = false;
  emit('viewChange', view);
};

const handlePersonnelMainClick = () => {
  isPersonnelFlyoutActive.value = false;
  emit('viewChange', 'personnel');
};

const handlePersonnelFlyoutNav = (view: string) => {
  isPersonnelFlyoutActive.value = false;
  emit('viewChange', view);
};

watch(
  () => props.activeView,
  (newVal) => {
    if (newVal === 'workorders' || newVal === 'dailyworklog' || newVal === 'workloghistory') {
      workOrdersExpanded.value = true;
    }
    if (newVal === 'personnel' || newVal === 'teams' || newVal === 'quick-onboard') {
      personnelExpanded.value = true;
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
  if (flyoutLeaveTimeout) {
    clearTimeout(flyoutLeaveTimeout);
  }
  if (personnelFlyoutLeaveTimeout) {
    clearTimeout(personnelFlyoutLeaveTimeout);
  }
});

const handleInstallClick = async () => {
  if (!installPromptEvent.value) return;
  installPromptEvent.value.prompt();
  const { outcome } = await installPromptEvent.value.userChoice;
  console.log(`User response to install prompt: ${outcome}`);
  installPromptEvent.value = null;
};

const handleBrandClick = () => {
  if (window.innerWidth <= 1024) {
    emit('sidebarClose');
  }
};
</script>
