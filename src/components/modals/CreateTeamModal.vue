<template>
  <div
    v-if="isOpen"
    class="modal-backdrop open"
    style="display: flex; align-items: center; justify-content: center; background-color: rgba(15, 23, 42, 0.65)"
    @click="$emit('close')"
  >
    <div
      class="modal-content card"
      style="max-width: 520px; width: 90%; border-radius: 12px; padding: 24px; position: relative"
      @click.stop
    >
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <h3 style="font-size: 18px; font-weight: 700">Create New Work Group</h3>
        <button @click="$emit('close')" style="background: none; border: none; cursor: pointer; color: #64748b">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px">
        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 6px">
            WORK GROUP NAME *
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. Electrical & Wiring Response Team"
            v-model="name"
            required
            style="width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border)"
          />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 6px">
            TEAM LEAD *
          </label>
          <select
            class="form-control"
            v-model="lead"
            required
            style="width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--color-border)"
          >
            <option value="">Select Team Lead...</option>
            <option v-for="p in personnel" :key="p.code" :value="p.name">
              {{ p.name }} ({{ p.role }})
            </option>
          </select>
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 6px">
            ASSIGN MEMBERS
          </label>
          <div style="max-height: 160px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 6px; padding: 8px">
            <label
              v-for="p in personnel"
              :key="p.code"
              style="display: flex; align-items: center; gap: 8px; padding: 6px 4px; cursor: pointer; font-size: 13px"
            >
              <input
                type="checkbox"
                :value="p.name"
                v-model="selectedMembers"
              />
              <span>{{ p.name }}</span>
              <span style="font-size: 11px; color: #64748b; margin-left: auto">{{ p.role }}</span>
            </label>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px">
          <button type="button" class="btn btn-outline-sm" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary-sm">
            Save Work Group
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Team, Person } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTeam', team: Team): void;
}>();

const name = ref('');
const lead = ref('');
const selectedMembers = ref<string[]>([]);

const handleSubmit = () => {
  if (!name.value.trim() || !lead.value.trim()) {
    alert('Please provide a team name and select a lead.');
    return;
  }

  const allMembers = Array.from(new Set([lead.value.trim(), ...selectedMembers.value]));

  const newTeam: Team = {
    name: name.value.trim(),
    lead: lead.value.trim(),
    size: allMembers.length,
    jobs: 0,
    members: allMembers
  };

  emit('saveTeam', newTeam);
  name.value = '';
  lead.value = '';
  selectedMembers.value = [];
  emit('close');
};
</script>
