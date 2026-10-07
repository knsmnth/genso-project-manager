<template>
  <section id="view-teams" class="view-section active personnel-view-container">
    <div class="view-header-row">
      <div class="personnel-title-group">
        <h1 class="view-main-title">Teams & Groups Allocation</h1>
        <p class="view-main-subtitle" style="margin: 0">Manage inter-departmental teams and individual field personnel.</p>
      </div>
      <div class="view-header-actions">
        <button
          type="button"
          class="btn btn-outline"
          @click="handleFilterClick"
          style="height: 36px; padding: 0 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Filter work groups"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filter</span>
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="emit('newGroup')"
          style="height: 36px; padding: 0 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Create a new work group"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>New Work Group</span>
        </button>
      </div>
    </div>

    <!-- Sub-View Module Navigation Tabs (same as Work Orders) -->
    <div class="module-tab-bar">
      <!-- Left: Segmented Sub-View Navigation Tabs -->
      <div class="module-tabs">
        <button
          type="button"
          class="module-tab-btn"
          @click="$emit('navigatePersonnel')"
          title="Switch to Staff Registry"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.5 8.5 0 0 1 13 0" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Staff Registry</span>
          <span v-if="personnel" class="module-tab-count">{{ personnel.length }}</span>
        </button>

        <button
          type="button"
          class="module-tab-btn active"
          title="Teams & Groups"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Teams & Groups</span>
          <span class="module-tab-count">{{ teams.length }}</span>
        </button>
      </div>
    </div>

    <!-- Master View: Work Groups card grid -->
    <div v-if="selectedTeamIndex === null" class="card" style="padding: 24px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h3 style="font-size: 16px; font-weight: 700">Work Groups Registry</h3>
        <span
          style="
            font-size: 12px;
            font-weight: 700;
            color: var(--color-primary);
            background-color: var(--color-primary-light);
            padding: 4px 10px;
            border-radius: 12px;
          "
        >
          {{ teams.length }} Active Groups
        </span>
      </div>

      <div
        style=" 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        "
      >
        <div
          v-for="(group, index) in teams"
          :key="group.name"
          class="group-card-item"
          @click="selectedTeamIndex = index"
          style="
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #ffffff;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 16px; font-weight: 700; color: var(--color-navy-header)">{{ group.name }}</span>
            <span style="font-size: 12px; color: var(--color-text-muted); font-weight: 600">
              {{ group.members.length }} Members
            </span>
          </div>

          <div style="font-size: 13px; color: var(--color-text-dark)">
            <strong>Lead:</strong> {{ group.lead }}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px">
            <div style="display: flex; align-items: center">
              <div
                v-for="name in group.members.slice(0, 4)"
                :key="name"
                :class="['initials-avatar', getAvatarColorClass(name)]"
                style="
                  width: 24px;
                  height: 24px;
                  font-size: 9px;
                  border: 2px solid #fff;
                  margin-right: -6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                {{ getInitials(name) }}
              </div>
              <div
                v-if="group.members.length - 4 > 0"
                class="group-card-avatars-more"
                style="
                  width: 24px;
                  height: 24px;
                  font-size: 9px;
                  background-color: #e2e8f0;
                  color: var(--color-text-dark);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-left: 8px;
                  font-weight: 700;
                "
              >
                +{{ group.members.length - 4 }}
              </div>
            </div>

            <div style="text-align: right">
              <span style="font-size: 11px; color: var(--color-text-muted); display: block; font-weight: 600">Active Jobs</span>
              <span style="font-size: 16px; font-weight: 700; color: var(--color-primary)">{{ group.jobs }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail View: Selected Roster List -->
    <div v-else style="display: flex; flex-direction: column; gap: 16px">
      <div>
        <button
          class="btn btn-outline-sm"
          @click="selectedTeamIndex = null"
          style="display: inline-flex; align-items: center; gap: 8px; height: 36px"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Groups</span>
        </button>
      </div>

      <div v-if="activeGroup" class="card roster-details-card">
        <div class="card-header space-between" style="align-items: center">
          <div>
            <h3 style="font-size: 18px; font-weight: 700">{{ activeGroup.name }}</h3>
            <span class="sub-label" style="font-size: 12px; color: var(--color-text-muted)">
              Detailed Roster (Lead: {{ activeGroup.lead }})
            </span>
          </div>
          <div style="display: flex; gap: 8px">
            <button class="icon-btn-border" aria-label="Download Roster" @click="handleDownloadRoster">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
            <button class="icon-btn-border" aria-label="Edit Group" @click="handleEditGroup">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="card-body no-padding">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr style="background: #eff4ff">
                  <th>NAME & CODE</th>
                  <th>SPECIALIZATION</th>
                  <th>CURRENT STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in activeMembersData" :key="member.name">
                  <td>
                    <div class="name-code-cell">
                      <div :class="['initials-avatar', getAvatarColorClass(member.name)]">
                        {{ getInitials(member.name) }}
                      </div>
                      <div>
                        <span class="cell-primary" style="font-size: 13.5px">{{ member.name }}</span>
                        <span class="cell-subtext" style="font-size: 11px; font-family: monospace">
                          {{ member.code }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight: 500">{{ member.role }}</td>
                  <td>
                    <span
                      :class="['status-badge-outline', 'personnel-avail-badge', getStatusClass(member.status)]"
                    >
                      {{ member.status }}
                    </span>
                  </td>
                  <td>
                    <a
                      href="#"
                      class="action-link"
                      @click.prevent="handleReassign(member.name)"
                      style="font-size: 12px; font-weight: 600"
                    >
                      Reassign
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          class="roster-footer"
          style="padding: 16px 20px; background: #f8fafc; border-top: 1px solid var(--color-border); display: flex; gap: 24px"
        >
          <div class="roster-stat" style="display: flex; flex-direction: column">
            <span class="roster-stat-num" style="font-size: 18px; font-weight: 700; color: var(--color-primary)">
              {{ activeCount }}
            </span>
            <span class="roster-stat-lbl" style="font-size: 11px; color: var(--color-text-muted); font-weight: 600">
              Active
            </span>
          </div>
          <div
            class="roster-stat border-left"
            style="display: flex; flex-direction: column; border-left: 1px solid var(--color-border); padding-left: 24px"
          >
            <span class="roster-stat-num" style="font-size: 18px; font-weight: 700; color: var(--color-text-muted)">
              {{ idleCount }}
            </span>
            <span class="roster-stat-lbl" style="font-size: 11px; color: var(--color-text-muted); font-weight: 600">
              Idle
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Team, Person } from '../types';

const props = defineProps<{
  teams: Team[];
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'newGroup'): void;
  (e: 'navigatePersonnel'): void;
  (e: 'toast', message: string, type?: 'success' | 'error' | 'info'): void;
}>();

const handleFilterClick = () => {
  emit('toast', 'Filter options are currently under development.', 'info');
};

const handleDownloadRoster = () => {
  emit('toast', 'Exporting team roster CSV...', 'info');
};

const handleEditGroup = () => {
  emit('toast', 'Edit Group options are currently under development.', 'info');
};

const handleReassign = (memberName: string) => {
  emit('toast', `Reassignment modal for ${memberName} under development.`, 'info');
};

const selectedTeamIndex = ref<number | null>(null);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColorClass = (name: string) => {
  const parts = name.split(' ');
  const code = (parts[0] || 'A')[0].toLowerCase();
  if ('abcdef'.includes(code)) return 'rc';
  if ('ghijklm'.includes(code)) return 'am';
  if ('nopqrst'.includes(code)) return 'sk';
  return 'jd';
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'on-site':
    case 'on site':
      return 'onsite';
    case 'maintenance':
      return 'maintenance';
    default:
      return 'available';
  }
};

const activeGroup = computed(() => {
  if (selectedTeamIndex.value === null) return null;
  return props.teams[selectedTeamIndex.value] || null;
});

const activeMembersData = computed(() => {
  if (!activeGroup.value) return [];
  return activeGroup.value.members.map((name) => {
    return (
      props.personnel.find((person) => person.name === name) || {
        name,
        code: 'MP-XXXX-G',
        role: 'Technician',
        status: 'Available'
      }
    );
  });
});

const activeCount = computed(() => {
  return activeMembersData.value.filter((m) => m.status.toLowerCase() !== 'available').length;
});

const idleCount = computed(() => {
  return activeMembersData.value.filter((m) => m.status.toLowerCase() === 'available').length;
});
</script>

<style scoped src="../styles/personnel.css"></style>
