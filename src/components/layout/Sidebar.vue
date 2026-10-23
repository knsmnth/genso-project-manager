<template>
  <aside :class="['sidebar', { open: sidebarOpen, collapsed: isCollapsed }]" id="sidebar" aria-label="Main Navigation">
    <!-- Brand Header with VSU GSO Logo -->
    <!-- Brand Header with VSU GSO Logo (Clickable to Collapse / Expand) -->
    <div
      class="sidebar-brand-wrapper"
      @click="toggleCollapse"
      role="button"
      tabindex="0"
    >
      <div class="sidebar-brand-left">
        <div class="brand-logo-mark">
          <img src="/genso-app-logo.png" alt="VSU GSO Emblem" class="brand-logo-img" />
        </div>
        <div class="brand-info">
          <span class="brand-title">Work Order Monitoring</span>
          <span class="brand-subtitle">VSU GenSO</span>
        </div>
      </div>
      <span class="sidebar-collapsed-tooltip" aria-hidden="true">Expand Navigation</span>
    </div>

    <!-- Navigation Menu Items -->
    <nav class="sidebar-nav" aria-label="Navigation Links">
      <!-- Section: OPERATIONS -->
      <div class="nav-section-label" aria-hidden="true">Operations</div>

      <!-- Dashboard -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'dashboard' }]"
        @click.prevent="navigate('dashboard')"
      >
        <div class="nav-item-left">
          <div class="nav-item-icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
          </div>
          <span class="nav-label">Dashboard</span>
        </div>
        <span class="sidebar-collapsed-tooltip" aria-hidden="true">Dashboard</span>
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
          @click.prevent="navigate('workorders')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 3H15M9 3C7.9 3 7 3.9 7 5V6H17V5C17 3.9 16.1 3 15 3M9 3H15" />
                <path d="M19 6H5C3.9 6 3 6.9 3 8V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V8C21 6.9 20.1 6 19 6Z" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <span class="nav-label">Work Orders</span>
          </div>
          <span class="sidebar-collapsed-tooltip" aria-hidden="true">Work Orders</span>
        </a>

        <!-- Sub-menu: Daily Work Log & Work Log History -->
        <div class="nav-sub-menu">
          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'dailyworklog' }]"
            @click.prevent="navigate('dailyworklog')"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
            <span>Daily Work Log</span>
          </a>

          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'workloghistory' }]"
            @click.prevent="navigate('workloghistory')"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
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
            @click.prevent="navigate('workorders')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 3H15M9 3C7.9 3 7 3.9 7 5V6H17V5C17 3.9 16.1 3 15 3M9 3H15" />
              <path d="M19 6H5C3.9 6 3 6.9 3 8V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V8C21 6.9 20.1 6 19 6Z" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>Work Orders</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'dailyworklog' }]"
            @click.prevent="navigate('dailyworklog')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Daily Work Log</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'workloghistory' }]"
            @click.prevent="navigate('workloghistory')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            <span>Work Log History</span>
          </a>
        </div>
      </div>

      <!-- Section: MANAGEMENT -->
      <div class="nav-section-label" aria-hidden="true">Management</div>

      <!-- Personnel & Teams Group -->
      <div
        :class="['nav-parent-group', { 'flyout-active': isPersonnelFlyoutActive }]"
        @mouseenter="handleMouseEnterPersonnelFlyout"
        @mouseleave="handleMouseLeavePersonnelFlyout"
      >
        <a
          href="#"
          :class="['nav-item', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
          @click.prevent="navigate('personnel')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span class="nav-label">Personnel</span>
          </div>
          <span class="sidebar-collapsed-tooltip" aria-hidden="true">Personnel</span>
        </a>

        <!-- Sub-menu: Teams & Groups only -->
        <div class="nav-sub-menu">
          <a
            href="#"
            :class="['nav-sub-item', { active: activeView === 'teams' }]"
            @click.prevent="navigate('teams')"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
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
            @click.prevent="navigate('personnel')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Personnel</span>
          </a>

          <a
            href="#"
            :class="['flyout-item', { active: activeView === 'teams' }]"
            @click.prevent="navigate('teams')"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Teams & Groups</span>
          </a>
        </div>
      </div>

      <!-- Section: SYSTEM -->
      <div class="nav-section-label" aria-hidden="true">System</div>

      <!-- System Registries & Assets -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'catalogs' }]"
        @click.prevent="navigate('catalogs')"
      >
        <div class="nav-item-left">
          <div class="nav-item-icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <span class="nav-label">Registries & Assets</span>
        </div>
        <span class="sidebar-collapsed-tooltip" aria-hidden="true">Registries & Assets</span>
      </a>

      <!-- Alerts -->
      <a
        href="#"
        :class="['nav-item', { active: activeView === 'alerts' }]"
        @click.prevent="navigate('alerts')"
      >
        <div class="nav-item-left">
          <div class="nav-item-icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z" />
              <path d="M10.3 21A1.94 1.94 0 0 0 13.7 21" />
            </svg>
          </div>
          <span class="nav-label">Alerts</span>
        </div>
        <span class="sidebar-collapsed-tooltip" aria-hidden="true">Alerts</span>
      </a>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <!-- PWA Mobile App Download Utility -->
      <button
        v-if="installPromptEvent"
        id="install-btn"
        class="install-app-btn"
        @click="handleInstallClick"
        title="Install as Progressive Web App"
      >
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3" />
          </svg>
          <span>Install Mobile App</span>
        </div>
        <span class="install-badge">PWA</span>
      </button>

      <!-- Primary Action: Create Work Order -->
      <button
        class="btn btn-sidebar-action"
        @click="$emit('createOrder')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Create Work Order</span>
        <span class="sidebar-collapsed-tooltip" aria-hidden="true">Create Work Order</span>
      </button>

      <!-- VSU GSO Institutional Hallmark -->
      <div class="sidebar-institution-footer" aria-hidden="true">
        <div class="inst-indicator">
          <span class="inst-dot"></span>
          <span class="inst-text">VSU GSO Portal</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useUIStore } from '../../stores';

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
  (e: 'view-change', view: string): void;
  (e: 'sidebarClose'): void;
  (e: 'sidebar-close'): void;
  (e: 'createOrder'): void;
  (e: 'create-order'): void;
  (e: 'togglePin'): void;
  (e: 'toggle-pin'): void;
}>();

const uiStore = useUIStore();
const installPromptEvent = ref<any>(null);

const isFlyoutActive = ref(false);
let flyoutLeaveTimeout: any = null;

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

const navigate = (view: string) => {
  if (flyoutLeaveTimeout) clearTimeout(flyoutLeaveTimeout);
  if (personnelFlyoutLeaveTimeout) clearTimeout(personnelFlyoutLeaveTimeout);
  isFlyoutActive.value = false;
  isPersonnelFlyoutActive.value = false;

  if (view === 'alerts') {
    uiStore.addToast('System notifications are currently empty.', 'info', 3000);
    return;
  }

  if (window.innerWidth <= 1024) {
    emit('sidebarClose');
    emit('sidebar-close');
  }

  emit('viewChange', view);
  emit('view-change', view);
  uiStore.setView(view);
};

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

const toggleCollapse = () => {
  if (window.innerWidth <= 1024) {
    emit('sidebarClose');
    emit('sidebar-close');
    uiStore.sidebarOpen = false;
  } else {
    uiStore.toggleSidebarMode();
  }
};
</script>
