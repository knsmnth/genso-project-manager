<template>
  <aside v-if="isOpen" class="dwl-drawer dwl-remarks-drawer open">
    <div class="dwl-drawer-header">
      <div class="dwl-dh-title">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3>Remarks and Notes</h3>
      </div>
      <button class="dwl-drawer-close" type="button" @click="$emit('close')">&times;</button>
    </div>

    <div class="dwl-drawer-body">
      <div v-if="!notes || notes.length === 0" style="color: var(--color-text-muted); font-size: 13px; margin-bottom: 12px">
        No remarks or notes added for this scope yet.
      </div>

      <div v-for="note in (notes || [])" :key="note.id" class="dwl-note-card">
        <div class="dwl-nc-header">
          <span class="dwl-nc-time">{{ note.timestamp }}</span>
          <div class="dwl-nc-actions" v-if="!isLocked">
            <button
              type="button"
              class="dwl-nc-btn"
              :class="{ active: editingNoteId === note.id }"
              @click="editingNoteId = editingNoteId === note.id ? null : note.id"
              title="Edit Note"
            >
              ✏️
            </button>
            <button type="button" class="dwl-nc-btn" @click="$emit('deleteNote', note.id)" title="Delete Note">
              🗑️
            </button>
          </div>
        </div>

        <div class="dwl-nc-textarea-wrapper">
          <textarea
            class="dwl-nc-textarea"
            :value="note.text"
            :readonly="isLocked || (editingNoteId !== null && editingNoteId !== note.id)"
            @input="handleAutoResize($event); $emit('updateNoteText', note.id, ($event.target as HTMLTextAreaElement).value)"
            maxlength="500"
            placeholder="Type in remarks and notes..."
          />
          <span class="dwl-nc-counter">{{ (note.text || '').length }}/500</span>
        </div>
      </div>

      <button v-if="!isLocked" type="button" class="dwl-btn-add-more" @click="$emit('addNote')">
        + Add more Remarks and Notes
      </button>
    </div>

    <div class="dwl-drawer-footer">
      <button type="button" class="dwl-btn-drawer-confirm" @click="$emit('close')">
        💾 Save Remarks and Notes
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RemarkNote } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  isLocked: boolean;
  notes?: RemarkNote[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'addNote'): void;
  (e: 'deleteNote', id: string): void;
  (e: 'updateNoteText', id: string, text: string): void;
}>();

const editingNoteId = ref<string | null>(null);

const handleAutoResize = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  if (!target) return;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};
</script>
