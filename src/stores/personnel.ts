import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Person, Team, LeaveRecord, AttendanceRosterDay, AttendanceStatusType } from '../types';
import {
  getPersonnel,
  savePersonToDb,
  saveDailyAttendance,
  getAttendanceHistory,
  getScheduledLeaves,
  saveScheduledLeave,
  updateScheduledLeave,
  deleteScheduledLeave
} from '../services/personnelService';

export const DEFAULT_PERSONNEL: Person[] = [
  {
    name: 'Elena Rodriguez',
    role: 'Senior Electrician',
    code: 'EMP-1024',
    status: 'Available',
    id: 'EMP-1024',
    attendanceStatus: 'present',
    activeOrder: 'WO-9921-A',
    email: 'elena.rodriguez@infrastructure.local',
    phone: '+1 (555) 234-8901',
    department: 'Electrical Engineering',
    team: 'Building Repair & Maintenance',
    dateHired: '2022-03-15'
  },
  {
    name: 'Julian Marcus',
    role: 'HVAC Specialist',
    code: 'EMP-1025',
    status: 'Busy',
    id: 'EMP-1025',
    attendanceStatus: 'present',
    activeOrder: 'WO-9942-B',
    email: 'julian.marcus@infrastructure.local',
    phone: '+1 (555) 345-6789',
    department: 'Mechanical & Climate',
    team: 'Building Repair & Maintenance',
    dateHired: '2023-01-10'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Welding Supervisor',
    code: 'EMP-1026',
    status: 'Off-Site',
    id: 'EMP-1026',
    attendanceStatus: 'on_leave',
    activeOrder: '—',
    email: 'sarah.jenkins@infrastructure.local',
    phone: '+1 (555) 456-7890',
    department: 'Structural Fabrication',
    team: 'Student Housing Repair & Maintenance',
    dateHired: '2021-08-01',
    isOnLeaveToday: true
  },
  {
    name: 'David Chen',
    role: 'Safety Officer',
    code: 'EMP-1031',
    status: 'Available',
    id: 'EMP-1031',
    attendanceStatus: 'present',
    activeOrder: 'SI-102-AUDIT',
    email: 'david.chen@infrastructure.local',
    phone: '+1 (555) 567-8901',
    department: 'EHS & Compliance',
    team: 'Safety & Compliance',
    dateHired: '2020-05-12'
  },
  {
    name: 'Michael Scott',
    role: 'Site Manager',
    code: 'EMP-1032',
    status: 'Available',
    id: 'EMP-1032',
    attendanceStatus: 'absent',
    activeOrder: '—',
    email: 'michael.scott@infrastructure.local',
    phone: '+1 (555) 678-9012',
    department: 'Site Operations',
    team: 'Operations Leadership',
    dateHired: '2019-11-04'
  },
  {
    name: 'Pam Beesly',
    role: 'Office Admin',
    code: 'EMP-1033',
    status: 'Available',
    id: 'EMP-1033',
    attendanceStatus: 'present',
    activeOrder: '—',
    email: 'pam.beesly@infrastructure.local',
    phone: '+1 (555) 789-0123',
    department: 'Administration',
    team: 'Office Support',
    dateHired: '2021-02-18'
  },
  {
    name: 'Robert Chen',
    role: 'Senior Electrician',
    code: 'MP-9102-E',
    status: 'On-Site',
    id: 'MP-9102-E',
    attendanceStatus: 'present',
    activeOrder: 'WO-8492',
    email: 'robert.chen@infrastructure.local',
    phone: '+1 (555) 890-1234',
    department: 'Electrical Engineering',
    team: 'Building Repair & Maintenance',
    dateHired: '2020-09-01'
  },
  {
    name: 'John Doe',
    role: 'General Laborer',
    code: 'MP-1104-G',
    status: 'Maintenance',
    id: 'MP-1104-G',
    attendanceStatus: 'present',
    activeOrder: 'WO-9104',
    email: 'john.doe@infrastructure.local',
    phone: '+1 (555) 901-2345',
    department: 'Civil Works',
    team: 'Student Housing Repair & Maintenance',
    dateHired: '2023-06-20'
  },
  {
    name: 'Alice Williams',
    role: 'Safety Inspector',
    code: 'MP-3341-S',
    status: 'Available',
    id: 'MP-3341-S',
    attendanceStatus: 'absent',
    activeOrder: '—',
    email: 'alice.williams@infrastructure.local',
    phone: '+1 (555) 012-3456',
    department: 'EHS & Compliance',
    team: 'Student Housing Repair & Maintenance',
    dateHired: '2022-10-11'
  },
  {
    name: 'David Kim',
    role: 'Masonry Artisan',
    code: 'MP-6821-M',
    status: 'Available',
    id: 'MP-6821-M',
    attendanceStatus: 'absent',
    activeOrder: '—',
    email: 'david.kim@infrastructure.local',
    phone: '+1 (555) 123-4567',
    department: 'Civil Works',
    team: 'Fabrication Workshop',
    dateHired: '2021-04-14'
  }
];

export const DEFAULT_WORK_GROUPS: Team[] = [
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

const PERSONNEL_STORAGE_KEY = 'infra_personnel';
const TEAMS_STORAGE_KEY = 'infra_teams';

// Helper to normalize legacy strings to clean AttendanceStatusType
export const normalizeAttendanceStatus = (raw?: string): AttendanceStatusType => {
  if (!raw) return 'present';
  const s = raw.toLowerCase().trim();
  if (s === 'present' || s.startsWith('present')) return 'present';
  if (s.includes('leave') || s === 'on_leave') return 'on_leave';
  if (s.includes('half') && s.includes('am')) return 'half_am';
  if (s.includes('half') && s.includes('pm')) return 'half_pm';
  if (s === 'absent' || s.startsWith('absent')) return 'absent';
  return 'present';
};

export const usePersonnelStore = defineStore('personnel', () => {
  const personnel = ref<Person[]>([]);
  const teams = ref<Team[]>([]);
  const leaves = ref<LeaveRecord[]>([]);
  const attendanceHistory = ref<AttendanceRosterDay[]>([]);
  const isLoading = ref<boolean>(false);

  // Central roster getter for work orders and daily work log
  const activeStaffRoster = computed(() => {
    return personnel.value.map((p) => ({
      name: p.name,
      code: p.code || p.id,
      role: p.role,
      status: p.status,
      attendanceStatus: normalizeAttendanceStatus(p.attendanceStatus as string)
    }));
  });

  const fetchPersonnelAndTeams = async () => {
    isLoading.value = true;
    try {
      const staff = await getPersonnel();
      if (staff.length === 0) {
        personnel.value = DEFAULT_PERSONNEL;
        localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(DEFAULT_PERSONNEL));
      } else {
        // Normalize attendanceStatus
        personnel.value = staff.map((p) => ({
          ...p,
          attendanceStatus: normalizeAttendanceStatus(p.attendanceStatus as string)
        }));
      }

      const rawTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (rawTeams) {
        try {
          teams.value = JSON.parse(rawTeams);
        } catch {
          teams.value = DEFAULT_WORK_GROUPS;
        }
      } else {
        teams.value = DEFAULT_WORK_GROUPS;
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_WORK_GROUPS));
      }

      await fetchLeaves();
      await fetchAttendanceHistory();
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLeaves = async () => {
    const list = await getScheduledLeaves();
    leaves.value = list;

    // Check if any leave spans today, automatically flag person as on_leave
    const today = new Date().toISOString().split('T')[0];
    const leaveMap = new Map<string, LeaveRecord>();
    list.forEach((l) => {
      if (l.startDate <= today && l.endDate >= today) {
        leaveMap.set(l.personnelCode, l);
      }
    });

    personnel.value = personnel.value.map((p) => {
      const code = p.code || p.id || '';
      const matchingLeave = leaveMap.get(code) || leaveMap.get(p.name);
      if (matchingLeave) {
        return {
          ...p,
          attendanceStatus: 'on_leave',
          isOnLeaveToday: true,
          leaveDetails: matchingLeave
        };
      } else if (p.isOnLeaveToday || p.attendanceStatus === 'on_leave') {
        // If leave was cancelled or dates edited out of today, restore to present
        return {
          ...p,
          attendanceStatus: 'present',
          isOnLeaveToday: false,
          leaveDetails: null
        };
      }
      return p;
    });

    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel.value));
  };

  const fetchAttendanceHistory = async (date?: string) => {
    const history = await getAttendanceHistory(date);
    if (history.length > 0) {
      attendanceHistory.value = history;
    } else {
      // Generate initial rich day roster for today if empty
      const today = new Date().toISOString().split('T')[0];
      const todayRoster: AttendanceRosterDay = {
        date: today,
        formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        compliance: 90,
        totalStaff: personnel.value.length,
        counts: {
          present: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'present').length,
          absent: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'absent').length,
          half_am: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'half_am').length,
          half_pm: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'half_pm').length,
          on_leave: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'on_leave').length,
        },
        roster: {
          present: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'present').map(toRosterPerson),
          absent: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'absent').map(toRosterPerson),
          half_am: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'half_am').map(toRosterPerson),
          half_pm: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'half_pm').map(toRosterPerson),
          on_leave: personnel.value.filter((p) => normalizeAttendanceStatus(p.attendanceStatus as string) === 'on_leave').map(toRosterPerson),
        }
      };
      attendanceHistory.value = [todayRoster];
    }
  };

  function toRosterPerson(p: Person) {
    return {
      code: p.code || p.id || '',
      name: p.name,
      role: p.role,
      status: normalizeAttendanceStatus(p.attendanceStatus as string),
      activeOrder: p.activeOrder || '—'
    };
  }

  // 1-Click inline attendance status edit
  const updateAttendanceStatus = async (
    personIdentifier: string,
    newStatus: AttendanceStatusType
  ) => {
    // LOCK: Prevent changing status if person is on scheduled leave
    const targetPerson = personnel.value.find((p) => p.code === personIdentifier || p.id === personIdentifier || p.name === personIdentifier);
    if (targetPerson && (targetPerson.isOnLeaveToday || targetPerson.attendanceStatus === 'on_leave')) {
      console.warn('Cannot change status: person is currently on scheduled leave.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updated = personnel.value.map((p) => {
      if (p.code === personIdentifier || p.id === personIdentifier || p.name === personIdentifier) {
        return {
          ...p,
          attendanceStatus: newStatus
        };
      }
      return p;
    });

    personnel.value = updated;
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));

    // Save single attendance record
    if (targetPerson) {
      await saveDailyAttendance(today, [{
        personnel_code: targetPerson.code || targetPerson.id || '',
        status: newStatus
      }]);
      await savePersonToDb(targetPerson);
    }

    // Refresh history
    await fetchAttendanceHistory();
  };

  // Bulk attendance confirmation from Attendance Modal
  const confirmAttendanceBatch = async (
    records: Array<{ personnel_code: string; status: AttendanceStatusType; notes?: string }>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const recordMap = new Map<string, AttendanceStatusType>();
    records.forEach((r) => recordMap.set(r.personnel_code, r.status));

    const updated = personnel.value.map((p) => {
      // If locked on leave, cannot be overridden by manual attendance check
      if (p.isOnLeaveToday || p.attendanceStatus === 'on_leave') {
        return p;
      }
      const code = p.code || p.id || '';
      const statusFromCheck = recordMap.get(code) || recordMap.get(p.name);
      if (statusFromCheck) {
        return { ...p, attendanceStatus: statusFromCheck };
      }
      // If not checked, retain existing or default present
      return p;
    });

    personnel.value = updated;
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));

    await saveDailyAttendance(today, records);
    updated.forEach((p) => savePersonToDb(p));

    await fetchAttendanceHistory();
  };

  // Schedule Leave early
  const scheduleLeave = async (leaveData: {
    personnelCode: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => {
    await saveScheduledLeave(leaveData);
    await fetchLeaves();
  };

  const updateLeave = async (
    leaveId: number | string,
    leaveData: {
      personnelCode: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason?: string;
    }
  ) => {
    await updateScheduledLeave(leaveId, leaveData);
    await fetchLeaves();
  };

  const cancelLeave = async (leaveId: number | string) => {
    await deleteScheduledLeave(leaveId);
    await fetchLeaves();
  };

  // Edit Personnel Profile
  const updatePersonnelProfile = async (updatedData: Partial<Person> & { code: string }) => {
    const updated = personnel.value.map((p) => {
      if (p.code === updatedData.code || p.id === updatedData.code) {
        return { ...p, ...updatedData };
      }
      return p;
    });
    personnel.value = updated;
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));

    const target = updated.find((p) => p.code === updatedData.code || p.id === updatedData.code);
    if (target) {
      await savePersonToDb(target);
    }
  };

  const createTeam = (newTeam: Team) => {
    const updated = [...teams.value, newTeam];
    teams.value = updated;
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updated));
  };

  const completeOnboarding = async (newPerson: Person) => {
    const normalized: Person = {
      ...newPerson,
      attendanceStatus: normalizeAttendanceStatus(newPerson.attendanceStatus as string)
    };
    const updated = [...personnel.value, normalized];
    personnel.value = updated;
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));
    await savePersonToDb(normalized);
  };

  return {
    personnel,
    teams,
    leaves,
    attendanceHistory,
    isLoading,
    activeStaffRoster,
    fetchPersonnelAndTeams,
    fetchLeaves,
    fetchAttendanceHistory,
    updateAttendanceStatus,
    confirmAttendanceBatch,
    scheduleLeave,
    updateLeave,
    cancelLeave,
    updatePersonnelProfile,
    createTeam,
    completeOnboarding
  };
});
