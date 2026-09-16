<template>
  <section id="view-dashboard" class="view-section active" style="display: flex; flex-direction: column; width: 100%">
    <!-- Dashboard Header -->
    <div class="view-header-row">
      <div>
        <h1 class="view-main-title">Operational Overview</h1>
        <p class="view-main-subtitle">Real-time supervision of facility infrastructure, team assignments, and personnel rosters.</p>
      </div>
      <div class="view-header-actions">
        <div class="date-badge" title="Current Date">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="date-badge-label">Today</span>
          <span class="date-badge-separator">•</span>
          <span class="date-badge-value" id="dashboard-current-date">{{ currentDateFormatted }}</span>
        </div>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <!-- 1. Total Work Orders -->
      <div class="metric-card is-clickable" @click="$emit('viewAll')" title="Click to view all work orders">
        <div class="metric-header">
          <div class="metric-icon-box green">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span class="metric-trend green">
            {{ activeCount }} Active
          </span>
        </div>
        <span class="metric-label">TOTAL WORK ORDERS</span>
        <span class="metric-value">{{ total }}</span>
        <div class="metric-progress-bar" :title="`${ongoing + scheduled} of ${total} scheduled or in progress`">
          <div class="metric-progress-fill" :style="{ width: `${progressRate}%` }"></div>
        </div>
        <span class="metric-note" style="margin-top: 8px">
          {{ statusBreakdownText }}
        </span>
      </div>

      <!-- 2. Active Teams -->
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
          <span class="metric-trend-sub">{{ onDutyCount }} On-Duty</span>
        </div>
        <span class="metric-label">ACTIVE TEAMS</span>
        <span class="metric-value">{{ teamsCount }}</span>
        <div class="metric-avatars-row">
          <template v-for="(p, idx) in previewPersonnel" :key="p.code || p.name || idx">
            <div
              class="metric-avatar-pill"
              :style="{ backgroundColor: getAvatarColor(idx) }"
              :title="`${p.name} - ${p.role}`"
            >
              {{ getInitials(p.name) }}
            </div>
          </template>
          <div v-if="morePersonnelCount > 0" class="avatar-more">+{{ morePersonnelCount }}</div>
        </div>
        <span class="metric-note" style="margin-top: 8px">
          Deployed across maintenance teams
        </span>
      </div>

      <!-- 3. Not Scheduled (Replaces Pending Requests) -->
      <div class="metric-card is-clickable" @click="$emit('viewAll')" title="Click to view work orders needing scheduling">
        <div class="metric-header">
          <div class="metric-icon-box amber">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span v-if="notScheduled > 0" class="badge-status-pill notscheduled">
            {{ notScheduled }} Needs Action
          </span>
          <span v-else class="badge-status-pill completed">
            All Scheduled
          </span>
        </div>
        <span class="metric-label">NOT SCHEDULED</span>
        <span class="metric-value">{{ notScheduled }}</span>
        <span
          class="metric-note"
          :style="{
            color: notScheduled > 0 ? '#B45309' : 'var(--color-text-muted)',
            fontWeight: notScheduled > 0 ? '600' : 'normal',
            marginTop: '8px'
          }"
        >
          {{ notScheduled > 0 ? `${notScheduled} awaiting date & team planning` : 'All work orders scheduled' }}
        </span>
      </div>

      <!-- 4. Scheduled Orders (Sensible replacement for obsolete Urgent Alerts) -->
      <div class="metric-card is-clickable" @click="$emit('viewAll')" title="Click to view scheduled work orders">
        <div class="metric-header">
          <div class="metric-icon-box blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14l2 2 4-4" />
            </svg>
          </div>
          <span class="badge-status-pill scheduled">
            SCHEDULED
          </span>
        </div>
        <span class="metric-label">SCHEDULED ORDERS</span>
        <span class="metric-value">{{ scheduled }}</span>
        <span class="metric-note" style="margin-top: 8px">
          {{ scheduled > 0 ? `${scheduled} planned on calendar timeline` : '0 planned on calendar timeline' }}
        </span>
      </div>
    </div>

    <!-- Split Layout -->
    <div class="dashboard-split-layout">
      <!-- Left column: Recent Activity -->
      <div class="card main-activity-card" style="min-width: 0">
        <div class="card-header space-between">
          <h3>Recent Activity</h3>
          <a href="#" class="btn-text-link" @click.prevent="$emit('viewAll')">
            View All Work Orders
          </a>
        </div>
        <div class="card-body no-padding">
          <!-- Desktop & Tablet Table View -->
          <div class="table-responsive dash-activity-desktop">
            <table class="data-table dash-table-custom">
              <thead>
                <tr>
                  <th class="col-activity">ACTIVITY</th>
                  <th class="col-group">GROUP</th>
                  <th class="col-status">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="recent.length === 0">
                  <td colspan="3" style="text-align: center; padding: 28px; color: var(--color-text-muted)">
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
                  <td class="col-activity">
                    <div class="dash-table-activity-cell">
                      <div class="dash-table-code-row">
                        <span class="badge-code-mono">{{ o.code }}</span>
                      </div>
                      <div class="dash-table-title-row">
                        <span class="cell-primary">{{ o.workTitle || o.scope || o.assetName }}</span>
                      </div>
                      <div v-if="(o.assetName && o.assetName !== '-') || (o.space && o.space !== '-')" class="dash-table-location-row">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" class="dash-table-loc-icon">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span class="cell-subtext">{{ o.assetName }}<template v-if="o.space && o.space !== '-'"> • {{ o.space }}</template></span>
                      </div>
                    </div>
                  </td>
                  <td class="col-group">
                    <span class="dash-table-group-pill" :title="o.workgroup || 'General'">
                      {{ o.workgroup || 'General' }}
                    </span>
                  </td>
                  <td class="col-status">
                    <span :class="['badge-status-pill', getStatusClass(o.status)]">
                      {{ displayStatus(o.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Activity List View -->
          <div class="dash-activity-mobile">
            <div v-if="recent.length === 0" class="dash-activity-empty">
              No recent activity found.
            </div>
            <div
              v-else
              v-for="o in recent"
              :key="'dash-mob-' + o.code"
              class="dash-activity-item"
              @click="$emit('selectOrder', o.code)"
            >
              <!-- Row 1: Code & Workgroup on left, Status Pill on right -->
              <div class="dash-activity-item-header">
                <div class="dash-activity-badges">
                  <span class="badge-code-mono">{{ o.code }}</span>
                  <span class="dash-activity-group-pill">{{ o.workgroup || 'General' }}</span>
                </div>
                <span :class="['badge-status-pill', getStatusClass(o.status)]">
                  {{ displayStatus(o.status) }}
                </span>
              </div>

              <!-- Row 2: Prominent Activity Title -->
              <div class="dash-activity-title">
                {{ o.workTitle || o.scope || o.assetName }}
              </div>

              <!-- Row 3: Asset & Space -->
              <div v-if="(o.assetName && o.assetName !== '-') || (o.space && o.space !== '-')" class="dash-activity-subtext">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: #94A3B8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{{ o.assetName }}<template v-if="o.space && o.space !== '-'"> • {{ o.space }}</template></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Team Status -->
      <div class="card team-status-card">
        <div class="card-header space-between">
          <h3>Team Status</h3>
          <span class="metric-trend-sub">{{ displayTeams.length }} Teams</span>
        </div>
        <div class="card-body">
          <div class="team-status-list">
            <div
              v-for="team in displayTeams"
              :key="team.name"
              class="team-status-row"
            >
              <div class="team-status-icon-box" :class="getTeamDutyStatus(team).iconBoxClass">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div class="team-status-info">
                <span class="team-status-name">{{ team.name }}</span>
                <span class="team-status-desc">Lead: {{ team.lead }} • {{ team.members?.length || team.size || 3 }} Members</span>
              </div>
              <span class="badge-status-dot" :class="getTeamDutyStatus(team).dotClass">
                {{ getTeamDutyStatus(team).label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WorkOrder, Person, Team } from '../types';

const props = withDefaults(
  defineProps<{
    workOrders: WorkOrder[];
    teamsCount: number;
    teams?: Team[];
    personnel?: Person[];
  }>(),
  {
    teams: () => [],
    personnel: () => []
  }
);

defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'viewAll'): void;
}>();

const currentDateFormatted = computed(() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const total = computed(() => props.workOrders.length);

const normalizeStatus = (status?: string): string => {
  if (!status) return 'not scheduled';
  const s = status.toLowerCase().trim();
  if (
    s === 'not scheduled' ||
    s === 'notscheduled' ||
    s === 'unscheduled' ||
    s === 'pending' ||
    s === 'on hold' ||
    s === 'draft'
  ) {
    return 'not scheduled';
  }
  if (s === 'scheduled') return 'scheduled';
  if (s === 'in progress' || s === 'ongoing' || s === 'on-going') return 'on-going';
  if (s === 'completed') return 'completed';
  return s;
};

const displayStatus = (status?: string): string => {
  const norm = normalizeStatus(status);
  switch (norm) {
    case 'not scheduled':
      return 'Not Scheduled';
    case 'scheduled':
      return 'Scheduled';
    case 'on-going':
      return 'On-going';
    case 'completed':
      return 'Completed';
    default:
      return status || 'Not Scheduled';
  }
};

const getStatusClass = (status?: string): string => {
  const norm = normalizeStatus(status);
  switch (norm) {
    case 'not scheduled':
      return 'notscheduled';
    case 'scheduled':
      return 'scheduled';
    case 'on-going':
      return 'inprogress';
    case 'completed':
      return 'completed';
    default:
      return 'notscheduled';
  }
};

const notScheduled = computed(() =>
  props.workOrders.filter((o) => normalizeStatus(o.status) === 'not scheduled').length
);

const scheduled = computed(() =>
  props.workOrders.filter((o) => normalizeStatus(o.status) === 'scheduled').length
);

const ongoing = computed(() =>
  props.workOrders.filter((o) => normalizeStatus(o.status) === 'on-going').length
);

const completed = computed(() =>
  props.workOrders.filter((o) => normalizeStatus(o.status) === 'completed').length
);

const activeCount = computed(() =>
  props.workOrders.filter((o) => o.isActive !== false).length
);

const statusBreakdownText = computed(() => {
  const parts: string[] = [];
  if (ongoing.value > 0) parts.push(`${ongoing.value} on-going`);
  if (scheduled.value > 0) parts.push(`${scheduled.value} scheduled`);
  if (notScheduled.value > 0) parts.push(`${notScheduled.value} not scheduled`);
  if (completed.value > 0) parts.push(`${completed.value} completed`);
  return parts.length > 0 ? parts.join(' • ') : '0 orders';
});

const progressRate = computed(() => {
  if (total.value === 0) return 0;
  const activeOrDone = ongoing.value + scheduled.value + completed.value;
  return Math.min(100, Math.round((activeOrDone / total.value) * 100));
});

const onDutyCount = computed(() => {
  if (props.personnel && props.personnel.length > 0) {
    const count = props.personnel.filter(
      (p) =>
        (p.status &&
          (p.status.toLowerCase() === 'on-duty' ||
            p.status.toLowerCase() === 'on-site' ||
            p.status.toLowerCase() === 'busy' ||
            p.status.toLowerCase() === 'maintenance')) ||
        (p.attendanceStatus && p.attendanceStatus.toLowerCase().includes('present'))
    ).length;
    if (count > 0) return count;
  }
  return 8;
});

const previewPersonnel = computed(() => {
  if (props.personnel && props.personnel.length > 0) {
    return props.personnel.slice(0, 3);
  }
  return [];
});

const morePersonnelCount = computed(() => {
  if (props.personnel && props.personnel.length > 3) {
    return props.personnel.length - 3;
  }
  return 0;
});

const avatarPalette = ['#0284C7', '#16A34A', '#D97706', '#8B5CF6', '#DC2626', '#0D9488'];
const getAvatarColor = (idx: number) => avatarPalette[idx % avatarPalette.length];

const getInitials = (name?: string): string => {
  if (!name) return 'MP';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const recent = computed(() => props.workOrders.slice(0, 5));

const displayTeams = computed(() => {
  if (props.teams && props.teams.length > 0) {
    return props.teams;
  }
  return [
    {
      name: 'Building Repair & Maintenance',
      lead: 'Robert Chen',
      size: 4,
      jobs: 3,
      members: ['Robert Chen', 'Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez']
    },
    {
      name: 'Student Housing Repair & Maintenance',
      lead: 'Sarah Jenkins',
      size: 3,
      jobs: 1,
      members: ['Sarah Jenkins', 'John Doe', 'Alice Williams']
    },
    {
      name: 'Fabrication Workshop',
      lead: 'Marcus Thorne',
      size: 3,
      jobs: 2,
      members: ['Marcus Thorne', 'Elena Rodriguez', 'David Kim']
    }
  ];
});

const getTeamDutyStatus = (team: Team) => {
  const activeOrdersForGroup = props.workOrders.filter(
    (o) => o.workgroup === team.name && normalizeStatus(o.status) === 'on-going'
  );
  if (activeOrdersForGroup.length > 0 || team.jobs > 1) {
    return { label: 'ON-DUTY', dotClass: 'green', iconBoxClass: 'green' };
  } else if (team.jobs === 1) {
    return { label: 'DEPLOYS', dotClass: 'orange', iconBoxClass: 'orange' };
  } else {
    return { label: 'AVAILABLE', dotClass: 'grey', iconBoxClass: 'grey' };
  }
};
</script>

<style scoped>
.badge-code-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  background: #ECFDF5;
  color: #006C49;
  border: 1px solid #A7F3D0;
  letter-spacing: -0.2px;
}

.dash-activity-desktop {
  display: block;
}

.dash-activity-mobile {
  display: none;
}

/* Table Custom Styles for Desktop & Tablet */
.dash-table-custom th,
.dash-table-custom td {
  padding: 12px 16px;
  vertical-align: middle;
}

.dash-table-custom th.col-activity,
.dash-table-custom td.col-activity {
  width: auto;
}

.dash-table-activity-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.dash-table-code-row {
  display: flex;
  align-items: center;
  margin-bottom: 1px;
}

.dash-table-code-row .badge-code-mono {
  font-size: 11px;
  font-weight: 700;
  padding: 1.5px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.dash-table-title-row .cell-primary {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-navy-header, #0F172A);
  line-height: 1.35;
  letter-spacing: -0.1px;
}

.dash-table-location-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dash-table-loc-icon {
  flex-shrink: 0;
  color: #94A3B8;
}

.dash-table-location-row .cell-subtext {
  font-size: 11.5px;
  color: #64748B;
  font-weight: 500;
  margin-top: 0;
}

.dash-table-custom th.col-group,
.dash-table-custom td.col-group {
  width: 25%;
  min-width: 150px;
}

.dash-table-group-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  padding: 3px 10px;
  border-radius: 6px;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-table-custom th.col-status,
.dash-table-custom td.col-status {
  width: 155px;
  min-width: 150px;
  text-align: right;
  padding-right: 20px;
}

.dash-table-custom td.col-status .badge-status-pill {
  margin-left: auto;
}

@media (min-width: 769px) and (max-width: 1024px) {
  .team-status-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .dash-activity-desktop {
    display: none !important;
  }

  .dash-activity-mobile {
    display: flex;
    flex-direction: column;
  }

  .dash-activity-empty {
    text-align: center;
    padding: 28px 16px;
    color: var(--color-text-muted, #64748B);
    font-size: 13.5px;
  }

  .dash-activity-item {
    padding: 13px 16px;
    border-bottom: 1px solid var(--color-border-subtle, #F1F5F9);
    display: flex;
    flex-direction: column;
    gap: 7px;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .dash-activity-item:last-child {
    border-bottom: none;
  }

  .dash-activity-item:hover,
  .dash-activity-item:active {
    background-color: #F8FAFC;
  }

  .dash-activity-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .dash-activity-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .dash-activity-badges .badge-code-mono {
    flex-shrink: 0;
  }

  .dash-activity-group-pill {
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    padding: 1px 7px;
    border-radius: 999px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 125px;
    flex-shrink: 1;
  }

  .dash-activity-item-header .badge-status-pill {
    flex-shrink: 0 !important;
    margin-left: auto;
    width: auto !important;
    min-width: 105px !important;
    max-width: 125px !important;
    padding: 3px 8px !important;
    font-size: 10px !important;
  }

  .dash-activity-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-navy-header, #0F172A);
    line-height: 1.35;
    word-break: break-word;
  }

  .dash-activity-subtext {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #64748B;
  }
}
</style>
