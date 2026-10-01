<template>
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs-list">
      <li
        v-for="(crumb, idx) in breadcrumbItems"
        :key="crumb.label"
        class="breadcrumb-item"
        :class="{ 'is-active': idx === breadcrumbItems.length - 1 }"
      >
        <button
          v-if="crumb.view && idx < breadcrumbItems.length - 1"
          type="button"
          class="breadcrumb-link"
          @click="$emit('navigate', crumb.view)"
        >
          <svg
            v-if="idx === 0"
            class="breadcrumb-home-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{{ crumb.label }}</span>
        </button>

        <span v-else class="breadcrumb-current" :aria-current="idx === breadcrumbItems.length - 1 ? 'page' : undefined">
          <svg
            v-if="idx === 0"
            class="breadcrumb-home-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{{ crumb.label }}</span>
        </span>

        <span
          v-if="idx < breadcrumbItems.length - 1"
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface BreadcrumbItem {
  label: string;
  view?: string;
}

const props = defineProps<{
  activeView: string;
  editingOrderCode?: string | null;
  originView?: string;
}>();

defineEmits<{
  (e: 'navigate', view: string): void;
}>();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const root: BreadcrumbItem = { label: 'Home', view: 'dashboard' };

  switch (props.activeView) {
    case 'dashboard':
      return [root, { label: 'Dashboard' }];
    case 'workorders':
      return [root, { label: 'Work Orders' }];
    case 'dailyworklog':
      return [
        root,
        { label: 'Work Orders', view: 'workorders' },
        { label: 'Daily Work Log' }
      ];
    case 'workloghistory':
      return [
        root,
        { label: 'Work Orders', view: 'workorders' },
        { label: 'Daily Work Log', view: 'dailyworklog' },
        { label: 'Work Log History' }
      ];
    case 'create-order':
      if (props.originView === 'dailyworklog') {
        return [
          root,
          { label: 'Work Orders', view: 'workorders' },
          { label: 'Daily Work Log', view: 'dailyworklog' },
          { label: props.editingOrderCode ? `Edit Order (${props.editingOrderCode})` : 'Create Work Order' }
        ];
      }
      return [
        root,
        { label: 'Work Orders', view: 'workorders' },
        { label: props.editingOrderCode ? `Edit Order (${props.editingOrderCode})` : 'Create Work Order' }
      ];
    case 'teams':
      return [
        root,
        { label: 'Personnel', view: 'personnel' },
        { label: 'Teams & Groups' }
      ];
    case 'personnel':
      return [
        root,
        { label: 'Personnel', view: 'personnel' },
        { label: 'Staff Registry' }
      ];
    case 'catalogs':
      return [root, { label: 'System Registries & Assets' }];
    case 'quick-onboard':
      return [
        root,
        { label: 'Personnel', view: 'personnel' },
        { label: 'Staff Registry', view: 'personnel' },
        { label: 'Quick Onboard' }
      ];
    default:
      return [root, { label: props.activeView }];
  }
});
</script>

<style scoped>
.breadcrumbs-nav {
  display: flex;
  align-items: center;
  padding: 2px 0 6px;
  width: 100%;
}

.breadcrumbs-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 4px;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  color: #6C7A71;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #006C49;
  background-color: #EFF4FF;
}

.breadcrumb-current {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  color: #006C49;
  background-color: rgba(0, 108, 73, 0.08);
  font-weight: 600;
  font-size: 12px;
}

.breadcrumb-home-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.breadcrumb-separator {
  display: inline-flex;
  align-items: center;
  color: #9CA3AF;
  user-select: none;
}
</style>
