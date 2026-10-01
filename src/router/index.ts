import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/work-orders',
    name: 'workorders',
    component: () => import('../views/WorkOrdersView.vue')
  },
  {
    path: '/work-orders/create',
    name: 'create-order',
    component: () => import('../views/CreateOrderView.vue')
  },
  {
    path: '/daily-work-log',
    name: 'dailyworklog',
    component: () => import('../views/DailyWorkLogView.vue')
  },
  {
    path: '/work-log-history',
    name: 'workloghistory',
    component: () => import('../views/WorkLogHistoryView.vue')
  },
  {
    path: '/teams',
    name: 'teams',
    component: () => import('../views/TeamsView.vue')
  },
  {
    path: '/personnel',
    name: 'personnel',
    component: () => import('../views/PersonnelView.vue')
  },
  {
    path: '/personnel/quick-onboard',
    name: 'quick-onboard',
    component: () => import('../views/QuickOnboardView.vue')
  },
  {
    path: '/catalogs',
    name: 'catalogs',
    component: () => import('../views/CatalogsView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
