<template>
  <section id="view-dashboard" class="view-section active bento-dashboard">
    <!-- Executive Dashboard Header -->
    <div class="dash-hero-header">
      <div class="dash-hero-left">
        <div class="dash-title-group">
          <h1 class="view-main-title">Operational Overview</h1>
        </div>
        <p class="view-main-subtitle">
          Real-time supervision of facility infrastructure, team assignments, and maintenance rosters.
        </p>
      </div>

      <div class="dash-hero-actions">
        <!-- Quick Action Buttons -->
        <button class="dash-btn-primary" @click="$emit('createOrder')" title="Create a new work order">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Work Order</span>
        </button>

        <button class="dash-btn-secondary" @click="$emit('navigate', 'dailyworklog')" title="Jump to Daily Work Log">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Daily Log</span>
        </button>

        <!-- Current Date Pill -->
        <div class="date-badge-enhanced" title="Today's Operational Shift">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="date-badge-label">Today</span>
          <span class="date-badge-separator">•</span>
          <span class="date-badge-value">{{ currentDateFormatted }}</span>
        </div>
      </div>
    </div>

    <!-- Bento Grid Container -->
    <div class="bento-grid">
      <!-- Bento Item 1: Hero Work Orders Card with Radial Progress Ring Figure (Span 5) -->
      <div class="bento-tile bento-hero-tile glow-emerald is-clickable" @click="$emit('viewAll')" title="Click to view all work orders">
        <div class="bento-tile-body">
          <div class="bento-hero-left">
            <div class="bento-compact-top">
              <span class="bento-tag">TOTAL WORK ORDERS</span>
            </div>
            <div class="bento-stat-row">
              <span class="bento-compact-num">{{ total }}</span>
              <span class="bento-badge badge-emerald">
                <span class="badge-dot-green"></span>
                {{ activeCount }} Active
              </span>
            </div>
          </div>

          <!-- Circular Radial Progress Ring Figure -->
          <div class="radial-figure-container" title="Planned progress">
            <div class="radial-ring-wrap">
              <svg class="radial-ring-svg" viewBox="0 0 84 84">
                <circle
                  class="radial-track"
                  cx="42"
                  cy="42"
                  r="34"
                  stroke-width="7"
                />
                <circle
                  class="radial-fill emerald-fill"
                  cx="42"
                  cy="42"
                  r="34"
                  stroke-width="7"
                  :stroke-dasharray="213.6"
                  :stroke-dashoffset="213.6 - (213.6 * progressRate) / 100"
                />
              </svg>
              <div class="radial-center-content">
                <span class="radial-pct-val">{{ progressRate }}%</span>
                <span class="radial-pct-sub">Planned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bento Item 2: Active Teams Card with Circular Team Dial Figure (Span 3) -->
      <div class="bento-tile glow-indigo is-clickable" @click="$emit('navigate', 'teams')" title="View Team Allocations">
        <div class="bento-tile-body-compact">
          <div class="bento-compact-top">
            <span class="bento-tag">ACTIVE TEAMS</span>
            <div class="figure-circle-icon indigo">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

          <div class="bento-stat-row">
            <span class="bento-compact-num">{{ teamsCount }}</span>
            <span class="bento-badge badge-indigo">
              <span class="badge-dot-indigo"></span>
              {{ onDutyCount }} On-Duty
            </span>
          </div>

          <!-- Avatar stack figure -->
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
        </div>
      </div>

      <!-- Bento Item 3: Needs Action (Not Scheduled) (Span 2) -->
      <div class="bento-tile glow-amber is-clickable" @click="$emit('viewAll')" title="View work orders needing scheduling">
        <div class="bento-tile-body-compact">
          <div class="bento-compact-top">
            <span class="bento-tag">NOT SCHEDULED</span>
            <div class="figure-circle-icon amber" :class="{ 'pulse-amber-halo': notScheduled > 0 }">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>

          <div class="bento-stat-row">
            <span class="bento-compact-num text-amber-val">{{ notScheduled }}</span>
            <span v-if="notScheduled > 0" class="bento-badge badge-amber">
              <span class="badge-dot-pulse-amber"></span>
              Needs Action
            </span>
            <span v-else class="bento-badge badge-emerald">
              <span class="badge-dot-green"></span>
              All Scheduled
            </span>
          </div>
        </div>
      </div>

      <!-- Bento Item 4: Scheduled Orders (Span 2) -->
      <div class="bento-tile glow-blue is-clickable" @click="$emit('viewAll')" title="View scheduled work orders">
        <div class="bento-tile-body-compact">
          <div class="bento-compact-top">
            <span class="bento-tag">SCHEDULED</span>
            <div class="figure-circle-icon blue">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14l2 2 4-4" />
              </svg>
            </div>
          </div>

          <div class="bento-stat-row">
            <span class="bento-compact-num">{{ scheduled }}</span>
            <span class="bento-badge badge-blue">
              <span class="badge-dot-blue"></span>
              Planned
            </span>
          </div>
        </div>
      </div>

      <!-- Bento Item 5: Recent Activity Minimal Table (Span 8) -->
      <div class="bento-tile bento-span-8 glow-card">
        <div class="bento-card-header">
          <div class="card-header-title-box">
            <h3 class="card-heading-enhanced">Recent Activity</h3>
            <span class="card-header-subcount">{{ recent.length }} latest</span>
          </div>
          <a href="#" class="btn-text-link-enhanced" @click.prevent="$emit('viewAll')">
            <span>View All Work Orders</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
        <div class="bento-card-body no-padding">
          <!-- Desktop & Tablet Table View -->
          <div class="table-responsive dash-activity-desktop">
            <table class="data-table dash-table-custom">
              <thead>
                <tr>
                  <th class="col-activity">WORK ORDER & SCOPE</th>
                  <th class="col-group">WORK GROUP</th>
                  <th class="col-status">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="recent.length === 0">
                  <td colspan="3" class="table-empty-row">
                    No recent activity found.
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="o in recent"
                  :key="o.code"
                  @click="$emit('selectOrder', o.code)"
                  class="dash-table-row-hover"
                >
                  <td class="col-activity">
                    <div class="dash-table-activity-cell">
                      <div class="dash-table-code-row">
                        <span class="badge-code-mono-enhanced">{{ o.code }}</span>
                      </div>
                      <div class="dash-table-title-row">
                        <span class="cell-primary-enhanced">{{ o.workTitle || o.scope || o.assetName }}</span>
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
                    <span :class="['dash-dept-pill', getDeptClass(o.workgroup)]" :title="o.workgroup || 'General'">
                      {{ o.workgroup || 'General' }}
                    </span>
                  </td>
                  <td class="col-status">
                    <span :class="['badge-status-pill-vibrant', getStatusClass(o.status)]">
                      <span class="status-indicator-dot"></span>
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
              <!-- Row 1: Code & Work Group on left, Status Pill on right -->
              <div class="dash-activity-item-header">
                <div class="dash-activity-badges">
                  <span class="badge-code-mono-enhanced">{{ o.code }}</span>
                  <span :class="['dash-dept-pill', getDeptClass(o.workgroup)]">{{ o.workgroup || 'General' }}</span>
                </div>
                <span :class="['badge-status-pill-vibrant', getStatusClass(o.status)]">
                  <span class="status-indicator-dot"></span>
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

      <!-- Bento Item 7: Team Deployment Status (Span 4) -->
      <div class="bento-tile bento-span-4 glow-card">
        <div class="bento-card-header">
          <div class="card-header-title-box">
            <h3 class="card-heading-enhanced">Team Deployment</h3>
            <span class="card-header-subcount">{{ displayTeams.length }} Units</span>
          </div>
          <button class="btn-text-link-enhanced" @click="$emit('navigate', 'teams')">
            <span>Roster</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div class="bento-card-body">
          <div class="team-status-list">
            <div
              v-for="team in displayTeams"
              :key="team.name"
              class="team-status-row-enhanced"
              @click="$emit('navigate', 'teams')"
            >
              <div class="team-status-left">
                <div class="team-status-icon-box-vibrant" :class="getTeamDutyStatus(team).iconBoxClass">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div class="team-status-info">
                  <div class="team-title-row">
                    <span class="team-status-name">{{ team.name }}</span>
                    <span class="badge-status-dot-vibrant" :class="getTeamDutyStatus(team).dotClass">
                      <span class="team-live-dot"></span>
                      {{ getTeamDutyStatus(team).label }}
                    </span>
                  </div>
                  <div class="team-meta-row">
                    <span class="team-lead-text">Lead: <strong>{{ team.lead }}</strong></span>
                    <span class="team-meta-divider">•</span>
                    <span class="team-size-text">{{ team.members?.length || team.size || 3 }} Personnel</span>
                  </div>

                  <!-- Stepped dots / Workload Figure instead of flat line bar -->
                  <div class="team-workload-figure-wrap">
                    <div class="stepped-task-dots" title="Active work order allocation">
                      <span
                        v-for="dotIdx in 4"
                        :key="dotIdx"
                        class="task-step-dot"
                        :class="{
                          'dot-active-green': (team.jobs || 1) >= dotIdx && getTeamDutyStatus(team).label === 'ON-DUTY',
                          'dot-active-amber': (team.jobs || 1) >= dotIdx && getTeamDutyStatus(team).label === 'DEPLOYS',
                          'dot-inactive': (team.jobs || 1) < dotIdx
                        }"
                      ></span>
                    </div>
                    <span class="team-workload-text">{{ team.jobs || 1 }} active {{ (team.jobs || 1) === 1 ? 'task' : 'tasks' }}</span>
                  </div>
                </div>
              </div>
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
  (e: 'createOrder'): void;
  (e: 'navigate', view: string): void;
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
      return 'status-notscheduled';
    case 'scheduled':
      return 'status-scheduled';
    case 'on-going':
      return 'status-ongoing';
    case 'completed':
      return 'status-completed';
    default:
      return 'status-notscheduled';
  }
};

const getPriorityClass = (priority?: string): string => {
  if (!priority) return 'priority-medium';
  const p = priority.toLowerCase().trim();
  if (p === 'urgent' || p === 'critical') return 'priority-urgent';
  if (p === 'high') return 'priority-high';
  if (p === 'low') return 'priority-low';
  return 'priority-medium';
};

const getDeptClass = (group?: string): string => {
  if (!group) return 'dept-general';
  const g = group.toLowerCase();
  if (g.includes('building')) return 'dept-building';
  if (g.includes('housing') || g.includes('dorm')) return 'dept-housing';
  if (g.includes('fabrication') || g.includes('workshop')) return 'dept-workshop';
  if (g.includes('it') || g.includes('infrastructure')) return 'dept-it';
  return 'dept-general';
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

const avatarPalette = ['#0284C7', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#0D9488'];
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
    return { label: 'ON-DUTY', dotClass: 'team-duty-green', iconBoxClass: 'icon-grad-green' };
  } else if (team.jobs === 1) {
    return { label: 'DEPLOYS', dotClass: 'team-duty-amber', iconBoxClass: 'icon-grad-amber' };
  } else {
    return { label: 'AVAILABLE', dotClass: 'team-duty-slate', iconBoxClass: 'icon-grad-slate' };
  }
};
</script>

<style scoped src="../styles/dashboard.css"></style>
