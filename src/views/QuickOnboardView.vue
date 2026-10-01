<template>
  <section id="view-quick-onboard" class="view-section active" style="display: flex">
    <!-- Header / Breadcrumbs -->
    <div class="breadcrumbs-container">
      <nav class="breadcrumbs" aria-label="Breadcrumbs">
        <span class="breadcrumb-link" @click="$emit('cancel')" style="cursor: pointer">
          Personnel
        </span>
        <svg class="breadcrumb-arrow" viewBox="0 0 24 24" width="12" height="12">
          <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <span class="breadcrumb-current">Onboard Wizard</span>
      </nav>

      <div class="header-action-row">
        <h2 class="form-title">Quick Onboard</h2>
        <p style="font-size: 13px; color: var(--color-text-muted); margin-top: -8px">
          Add new operational personnel to the Facility Management System.
        </p>
      </div>
    </div>

    <!-- Onboard Wizard Grid -->
    <div class="form-layout" style="margin-top: 16px">
      <!-- Left Column: Step indicators -->
      <div class="form-right-col" style="gap: 20px">
        <div class="card" style="padding: 24px">
          <div style="display: flex; flex-direction: column; gap: 24px">
            <!-- Step 1 Indicator -->
            <div style="display: flex; align-items: center; gap: 16px">
              <div
                :style="{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 1 ? '#006C49' : '#E2E8F0',
                  color: currentStep >= 1 ? '#FFFFFF' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }"
              >
                1
              </div>
              <div style="display: flex; flex-direction: column">
                <span
                  style="font-size: 14px; font-weight: 600"
                  :style="{ color: currentStep === 1 ? '#006C49' : 'var(--color-navy-header)' }"
                >
                  Identity
                </span>
                <span style="font-size: 11px; color: var(--color-text-muted)">Personal info & photo</span>
              </div>
            </div>

            <!-- Step 2 Indicator -->
            <div style="display: flex; align-items: center; gap: 16px">
              <div
                :style="{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 2 ? '#006C49' : '#E2E8F0',
                  color: currentStep >= 2 ? '#FFFFFF' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }"
              >
                2
              </div>
              <div style="display: flex; flex-direction: column">
                <span
                  style="font-size: 14px; font-weight: 600"
                  :style="{ color: currentStep === 2 ? '#006C49' : 'var(--color-navy-header)' }"
                >
                  Specialization
                </span>
                <span style="font-size: 11px; color: var(--color-text-muted)">Role & group selection</span>
              </div>
            </div>

            <!-- Step 3 Indicator -->
            <div style="display: flex; align-items: center; gap: 16px">
              <div
                :style="{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 3 ? '#006C49' : '#E2E8F0',
                  color: currentStep >= 3 ? '#FFFFFF' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }"
              >
                3
              </div>
              <div style="display: flex; flex-direction: column">
                <span
                  style="font-size: 14px; font-weight: 600"
                  :style="{ color: currentStep === 3 ? '#006C49' : 'var(--color-navy-header)' }"
                >
                  Confirmation
                </span>
                <span style="font-size: 11px; color: var(--color-text-muted)">Review and finalize</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Onboard Tips -->
        <div class="card" style="padding: 20px; border-left: 4px solid #006c49">
          <div style="display: flex; gap: 10px">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2" style="flex-shrink: 0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div style="display: flex; flex-direction: column; gap: 4px">
              <span style="font-weight: 600; font-size: 13px; color: var(--color-navy-header)">Onboarding Tip</span>
              <span style="font-size: 12px; color: var(--color-text-dark); line-height: 1.4">
                Uploading a clear profile photo helps in real-time tracking and security verification.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Step Forms -->
      <div class="form-left-col">
        <div class="card" style="padding: 24px">
          <div v-if="currentStep === 1" style="display: flex; flex-direction: column; gap: 20px">
            <!-- Photo Upload -->
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap">
              <div
                style="
                  width: 100px;
                  height: 100px;
                  border-radius: 12px;
                  border: 2px dashed var(--color-border-dark);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  background-color: #f8fafc;
                  cursor: pointer;
                  gap: 4px;
                "
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-text-placeholder)" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span style="font-size: 11px; color: var(--color-text-placeholder); font-weight: 600">Upload</span>
              </div>
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-navy-header); margin-bottom: 4px">
                  Personnel Photo
                </h4>
                <p style="font-size: 11px; color: var(--color-text-muted)">
                  Accepts JPG, PNG. Max file size 2MB.
                </p>
              </div>
            </div>

            <!-- Name -->
            <div :class="['form-field-group', { 'has-error': errors.fullName }]">
              <label for="onboard-name">Full Name</label>
              <input
                type="text"
                id="onboard-name"
                placeholder="e.g. Robert J. Sterling"
                v-model="fullName"
              />
              <span class="error-msg">Full name is required.</span>
            </div>

            <!-- ID Code -->
            <div :class="['form-field-group', { 'has-error': errors.manpowerCode }]">
              <label for="onboard-code">Manpower Code (ID)</label>
              <input
                type="text"
                id="onboard-code"
                placeholder="e.g. EMP-1035"
                v-model="manpowerCode"
              />
              <span class="error-msg">Manpower code identifier is required.</span>
            </div>
          </div>

          <div v-if="currentStep === 2" style="display: flex; flex-direction: column; gap: 20px">
            <!-- Specialization Selection -->
            <div :class="['form-field-group', { 'has-error': errors.specialization }]">
              <label for="onboard-specialization">Work Specialization</label>
              <div class="select-wrapper">
                <select
                  id="onboard-specialization"
                  v-model="specialization"
                >
                  <option value="" disabled>Select Role...</option>
                  <option value="Carpentry Specialist">Carpentry Specialist</option>
                  <option value="Senior Electrician">Senior Electrician</option>
                  <option value="HVAC Specialist">HVAC Specialist</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Site Manager">Site Manager</option>
                  <option value="Office Admin">Office Admin</option>
                  <option value="General Laborer">General Laborer</option>
                </select>
              </div>
              <span class="error-msg">Please select a specialization role.</span>
            </div>

            <!-- Group Assignment Selection -->
            <div :class="['form-field-group', { 'has-error': errors.workGroup }]">
              <label for="onboard-workgroup">Work Group Assignment</label>
              <div class="select-wrapper">
                <select
                  id="onboard-workgroup"
                  v-model="workGroup"
                >
                  <option value="" disabled>Select Work Group...</option>
                  <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
                  <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
                  <option value="Fabrication Workshop">Fabrication Workshop</option>
                </select>
              </div>
              <span class="error-msg">Please assign a primary work group.</span>
            </div>
          </div>

          <div v-if="currentStep === 3" style="display: flex; flex-direction: column; gap: 16px">
            <h3 style="font-size: 16px; font-weight: 600; color: var(--color-navy-header)">Confirm Registration</h3>
            <p style="font-size: 13px; color: var(--color-text-dark); margin-bottom: 8px">
              Please review the staff registry summary details before submitting.
            </p>

            <div
              style="
                background-color: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                border: 1px solid var(--color-border);
              "
            >
              <div style="display: flex; justify-content: space-between; font-size: 13px">
                <span style="font-weight: 600; color: var(--color-text-muted)">FULL NAME</span>
                <span style="font-weight: 700; color: var(--color-navy-header)">{{ fullName }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px">
                <span style="font-weight: 600; color: var(--color-text-muted)">MANPOWER ID</span>
                <span style="font-weight: 700; color: var(--color-navy-header); font-family: monospace">
                  {{ manpowerCode }}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px">
                <span style="font-weight: 600; color: var(--color-text-muted)">SPECIALIZATION</span>
                <span style="font-weight: 700; color: var(--color-navy-header)">{{ specialization }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px">
                <span style="font-weight: 600; color: var(--color-text-muted)">WORK GROUP</span>
                <span style="font-weight: 700; color: var(--color-primary)">{{ workGroup }}</span>
              </div>
            </div>
          </div>

          <!-- Buttons control footer -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              margin-top: 32px;
              border-top: 1px solid var(--color-border);
              padding-top: 20px;
              gap: 16px;
            "
          >
            <button
              v-if="currentStep > 1"
              type="button"
              class="btn btn-outline"
              @click="handlePrevStep"
              style="padding: 10px 20px"
            >
              Back
            </button>
            <button
              v-else
              type="button"
              class="btn btn-outline"
              @click="$emit('cancel')"
              style="padding: 10px 20px"
            >
              Discard Changes
            </button>

            <button
              v-if="currentStep < 3"
              type="button"
              class="btn btn-primary"
              @click="handleNextStep"
              style="padding: 10px 24px"
            >
              Next Step
            </button>
            <button
              v-else
              type="button"
              class="btn btn-primary"
              @click="handleComplete"
              style="padding: 10px 24px"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Person } from '../types';

const emit = defineEmits<{
  (e: 'complete', data: Person): void;
  (e: 'cancel'): void;
}>();

const currentStep = ref(1);
const fullName = ref('');
const manpowerCode = ref('');
const specialization = ref('');
const workGroup = ref('');
const errors = ref<Record<string, boolean>>({});

const handleNextStep = () => {
  const newErrors: Record<string, boolean> = {};

  if (currentStep.value === 1) {
    if (!fullName.value.trim()) newErrors.fullName = true;
    if (!manpowerCode.value.trim()) newErrors.manpowerCode = true;

    if (Object.keys(newErrors).length > 0) {
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    if (!specialization.value) newErrors.specialization = true;
    if (!workGroup.value) newErrors.workGroup = true;

    if (Object.keys(newErrors).length > 0) {
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    currentStep.value = 3;
  }
};

const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleComplete = () => {
  const newPerson: Person = {
    name: fullName.value,
    role: specialization.value,
    code: manpowerCode.value,
    status: 'Available',
    id: manpowerCode.value,
    attendanceStatus: 'Absent',
    activeOrder: '—'
  };

  emit('complete', newPerson);
};
</script>
