import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ToastMessage } from '../components/ui/Toast.vue';
import router from '../router';

export type SidebarMode = 'pinned-open' | 'pinned-collapsed' | 'auto';

const ROUTE_MAP: Record<string, string> = {
  'dashboard': '/dashboard',
  'workorders': '/work-orders',
  'create-order': '/work-orders/create',
  'dailyworklog': '/daily-work-log',
  'workloghistory': '/work-log-history',
  'teams': '/teams',
  'personnel': '/personnel',
  'quick-onboard': '/personnel/quick-onboard',
  'catalogs': '/catalogs'
};

const PATH_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([view, path]) => [path, view])
);

export const useUIStore = defineStore('ui', () => {
  const initialPath = window.location.hash.replace(/^#/, '') || '/dashboard';
  const activeView = ref<string>(PATH_MAP[initialPath] || 'dashboard');
  const searchQuery = ref<string>('');
  const sidebarOpen = ref<boolean>(false);
  const isMobileMoreOpen = ref<boolean>(false);
  const sidebarMode = ref<SidebarMode>(
    (localStorage.getItem('sidebar_mode') as SidebarMode) || 'pinned-open'
  );

  const selectedOrderCode = ref<string | null>(null);
  const isDetailsModalOpen = ref<boolean>(false);
  const isAttendanceModalOpen = ref<boolean>(false);
  const isCreateTeamModalOpen = ref<boolean>(false);
  const editingOrderCode = ref<string | null>(null);
  const previousViewBeforeOrderForm = ref<string>('workorders');

  const toasts = ref<ToastMessage[]>([]);
  const isSyncing = ref<boolean>(false);

  // Sync route changes to activeView
  router.afterEach((to) => {
    const matched = PATH_MAP[to.path];
    if (matched && activeView.value !== matched) {
      activeView.value = matched;
    }
  });

  const toggleSidebarMode = () => {
    if (sidebarMode.value === 'pinned-open') {
      sidebarMode.value = 'pinned-collapsed';
    } else {
      sidebarMode.value = 'pinned-open';
    }
    localStorage.setItem('sidebar_mode', sidebarMode.value);
  };

  const setView = (view: string) => {
    activeView.value = view;
    sidebarOpen.value = false;
    isMobileMoreOpen.value = false;
    const targetPath = ROUTE_MAP[view];
    if (targetPath && router.currentRoute.value.path !== targetPath) {
      router.push(targetPath).catch(() => {});
    }
  };

  const addToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    duration?: number
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    toasts.value.push({ id, message, type, duration });
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const openCreateOrder = () => {
    previousViewBeforeOrderForm.value = activeView.value;
    editingOrderCode.value = null;
    activeView.value = 'create-order';
  };

  const openEditOrder = (code: string) => {
    previousViewBeforeOrderForm.value = activeView.value;
    editingOrderCode.value = code;
    activeView.value = 'create-order';
    isDetailsModalOpen.value = false;
  };

  const cancelOrderForm = () => {
    const returnTo = previousViewBeforeOrderForm.value || 'workorders';
    editingOrderCode.value = null;
    activeView.value = returnTo;
  };

  const openDetailsModal = (code: string) => {
    selectedOrderCode.value = code;
    isDetailsModalOpen.value = true;
  };

  const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedOrderCode.value = null;
  };

  return {
    activeView,
    searchQuery,
    sidebarOpen,
    isMobileMoreOpen,
    sidebarMode,
    selectedOrderCode,
    isDetailsModalOpen,
    isAttendanceModalOpen,
    isCreateTeamModalOpen,
    editingOrderCode,
    previousViewBeforeOrderForm,
    toasts,
    isSyncing,
    toggleSidebarMode,
    setView,
    addToast,
    removeToast,
    openCreateOrder,
    openEditOrder,
    cancelOrderForm,
    openDetailsModal,
    closeDetailsModal
  };
});
