<template>
  <section id="view-dashboard" class="view-section active" style="display: flex; flex-direction: column; width: 100%">
    <!-- Dashboard Header -->
    <div class="view-header-row">
      <div>
        <div class="view-pill-tag">
          <span class="live-dot"></span>
          LIVE SYSTEM STATUS
        </div>
        <h1 class="view-main-title">Operational Overview</h1>
        <p class="view-main-subtitle">Real-time supervision of facility infrastructure, team assignments, and personnel rosters.</p>
      </div>
      <div class="view-header-actions">
        <div class="date-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span id="dashboard-current-date">{{ currentDateFormatted }}</span>
        </div>
        <button class="btn btn-outline-sm" id="btn-dashboard-filters">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filters</span>
        </button>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <!-- Total Orders -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-box green">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span class="metric-trend green">+12%</span>
        </div>
        <span class="metric-label">TOTAL WORK ORDERS</span>
        <span class="metric-value">{{ total }}</span>
        <div class="metric-progress-bar">
          <div class="metric-progress-fill" style="width: 76%"></div>
        </div>
      </div>

      <!-- Active Teams -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-box yellow">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span class="metric-trend-sub">8 On-Duty</span>
        </div>
        <span class="metric-label">ACTIVE TEAMS</span>
        <span class="metric-value">{{ teamsCount }}</span>
        <div class="metric-avatars-row">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
          <div class="avatar-more">+6</div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-box blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span class="metric-trend red">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            8
          </span>
        </div>
        <span class="metric-label">PENDING REQUESTS</span>
        <span class="metric-value">{{ pending }}</span>
        <span class="metric-note red">since last hour</span>
      </div>

      <!-- Urgent Alerts -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-box red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span class="badge badge-urgent-pill">URGENT</span>
        </div>
        <span class="metric-label">URGENT ALERTS</span>
        <span class="metric-value">{{ urgent }}</span>
        <span class="metric-note">Requires immediate attention</span>
      </div>
    </div>

    <!-- Split Layout -->
    <div class="dashboard-split-layout">
      <!-- Left column: Recent Activity -->
      <div class="card main-activity-card" style="min-width: 0">
        <div class="card-header space-between">
          <h3>Recent Activity</h3>
          <a href="#" class="btn-text-link" @click.prevent="$emit('viewAll')">
            View All History
          </a>
        </div>
        <div class="card-body no-padding">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ACTIVITY</th>
                  <th>GROUP</th>
                  <th>STATUS</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="recent.length === 0">
                  <td colspan="4" style="text-align: center; padding: 28px; color: var(--color-text-muted)">
                    No recent activity found.
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="o in recent"
                  :key="o.code"
                  @click="$emit('selectOrder', o.code)"
                  style="cursor: pointer"
                >
                  <td>
                    <span class="cell-primary">{{ o.assetName }}</span>
                    <span class="cell-subtext">{{ o.space }}</span>
                  </td>
                  <td>{{ o.workgroup }}</td>
                  <td>
                    <span :class="['badge-status-pill', getStatusClass(o.status)]">
                      {{ o.status }}
                    </span>
                  </td>
                  <td style="font-weight: 500">10:45 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right column: Team Status -->
      <div class="card team-status-card">
        <div class="card-header">
          <h3>Team Status</h3>
        </div>
        <div class="card-body">
          <div class="team-status-list">
            <div class="team-status-row">
              <div class="team-status-icon-box green">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <div class="team-status-info">
                <span class="team-status-name">Carpentry Works</span>
                <span class="team-status-desc">6 Active Members</span>
              </div>
              <span class="badge-status-dot green">ON-DUTY</span>
            </div>

            <div class="team-status-row">
              <div class="team-status-icon-box grey">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div class="team-status-info">
                <span class="team-status-name">Electrical Systems</span>
                <span class="team-status-desc">4 Active Members</span>
              </div>
              <span class="badge-status-dot grey">OFF-DUTY</span>
            </div>

            <div class="team-status-row">
              <div class="team-status-icon-box orange">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div class="team-status-info">
                <span class="team-status-name">Plumbing Squad</span>
                <span class="team-status-desc">Deploying...</span>
              </div>
              <span class="badge-status-dot orange">DEPLOYS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WorkOrder, Person } from '../types';

const props = withDefaults(
  defineProps<{
    workOrders: WorkOrder[];
    teamsCount: number;
    personnel?: Person[];
  }>(),
  {
    personnel: () => []
  }
);

defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'viewAll'): void;
}>();

const currentDateFormatted = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

const total = computed(() => props.workOrders.length);

const pending = computed(
  () => props.workOrders.filter((o) => o.status.toLowerCase() === 'pending').length
);

const urgent = computed(
  () =>
    props.workOrders.filter(
      (o) => o.status.toLowerCase() === 'urgent' || o.priority.toLowerCase() === 'high'
    ).length
);

const recent = computed(() => props.workOrders.slice(0, 4));

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'inprogress';
    case 'pending':
      return 'pending';
    case 'completed':
      return 'completed';
    case 'urgent':
      return 'urgent';
    case 'on hold':
      return 'onhold';
    default:
      return 'draft';
  }
};
</script>
