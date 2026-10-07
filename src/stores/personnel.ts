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
    attendanceStatus: 'present',
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
    attendanceStatus: 'present',
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
    attendanceStatus: 'present',
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

// 1-Click rotation cycle: Present -> Absent -> Morning Present/Afternoon Absent (half_pm) -> Morning Absent/Afternoon Present (half_am) -> Present
export const getNextAttendanceStatus = (current?: AttendanceStatusType | string): AttendanceStatusType => {
  const norm = normalizeAttendanceStatus(current as string);
  switch (norm) {
    case 'present':
      return 'absent';
    case 'absent':
      return 'half_pm'; // Morning present, afternoon absent
    case 'half_pm':
      return 'half_am'; // Morning absent, afternoon present
    case 'half_am':
      return 'present';
    case 'on_leave':
      return 'present';
    default:
      return 'present';
  }
};

export interface WorkdayInfo {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, Wed, Thu, Fri
  dayNum: string; // 01, 02...
  formattedDay: string; // Mon 28
  isToday: boolean;
}

export const getWeekWorkdays = (referenceDateStr?: string): WorkdayInfo[] => {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const day = ref.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);

  const workdays: WorkdayInfo[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = String(d.getDate()).padStart(2, '0');
    workdays.push({
      date: dateStr,
      dayName,
      dayNum,
      formattedDay: `${dayName} ${d.getDate()}`,
      isToday: dateStr === todayStr
    });
  }
  return workdays;
};

export const getMonthWorkdays = (year: number, month: number): WorkdayInfo[] => {
  // month is 1-indexed (1=Jan, 10=Oct)
  const workdays: WorkdayInfo[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();
    // Monday (1) to Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = String(d).padStart(2, '0');
      workdays.push({
        date: dateStr,
        dayName,
        dayNum,
        formattedDay: `${dayName} ${d}`,
        isToday: dateStr === todayStr
      });
    }
  }
  return workdays;
};

const ATTENDANCE_BY_DATE_KEY = 'infra_attendance_by_date';
const LAST_ATTENDANCE_DATE_KEY = 'infra_last_attendance_date';

export const usePersonnelStore = defineStore('personnel', () => {
  const personnel = ref<Person[]>([]);
  const teams = ref<Team[]>([]);
  const leaves = ref<LeaveRecord[]>([]);
  const attendanceHistory = ref<AttendanceRosterDay[]>([]);
  const attendanceByDate = ref<Record<string, Record<string, AttendanceStatusType>>>({});
  const isLoading = ref<boolean>(false);

  const loadAttendanceByDate = () => {
    const raw = localStorage.getItem(ATTENDANCE_BY_DATE_KEY);
    if (raw) {
      try {
        attendanceByDate.value = JSON.parse(raw);
      } catch {
        attendanceByDate.value = {};
      }
    }
  };

  const saveAttendanceByDate = () => {
    localStorage.setItem(ATTENDANCE_BY_DATE_KEY, JSON.stringify(attendanceByDate.value));
  };

  /**
   * Automatically resets daily attendance:
   * 1. If staff has a scheduled leave spanning today -> status is 'on_leave' (locked)
   * 2. If staff has an explicit status recorded/modified TODAY -> keep that status throughout the day
   * 3. Otherwise -> automatically defaults/resets to 'present' (green checkmark)
   */
  const applyDailyAttendanceReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const leaveMap = new Map<string, LeaveRecord>();
    leaves.value.forEach((l) => {
      if (l.startDate <= today && l.endDate >= today) {
        leaveMap.set(l.personnelCode, l);
      }
    });

    const todayRecorded = attendanceByDate.value[today] || {};

    personnel.value = personnel.value.map((p) => {
      const code = p.code || p.id || '';
      const matchingLeave = leaveMap.get(code) || leaveMap.get(p.name);

      if (matchingLeave) {
        return {
          ...p,
          attendanceStatus: 'on_leave' as AttendanceStatusType,
          isOnLeaveToday: true,
          leaveDetails: matchingLeave
        };
      }

      // If user explicitly changed/confirmed status for this person TODAY, preserve that modification
      const recorded = todayRecorded[code] || todayRecorded[p.name];
      if (recorded) {
        return {
          ...p,
          attendanceStatus: recorded as AttendanceStatusType,
          isOnLeaveToday: false,
          leaveDetails: null
        };
      }

      // Default: every new day resets automatically to 'present'
      return {
        ...p,
        attendanceStatus: 'present' as AttendanceStatusType,
        isOnLeaveToday: false,
        leaveDetails: null
      };
    });

    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel.value));
    localStorage.setItem(LAST_ATTENDANCE_DATE_KEY, today);
  };

  /**
   * Checks if date rolled over (e.g. across midnight or on next day login) and triggers daily reset
   */
  const checkDailyReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(LAST_ATTENDANCE_DATE_KEY);
    if (!lastDate || lastDate !== today) {
      applyDailyAttendanceReset();
    }
  };

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
      loadAttendanceByDate();
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem(LAST_ATTENDANCE_DATE_KEY);

      // If date rolled over to a new day, ensure clean today state
      if (lastDate && lastDate !== today) {
        if (!attendanceByDate.value[today]) {
          attendanceByDate.value[today] = {};
        }
      }

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

      // Apply automatic daily reset to default present status (preserving active leaves and today's modifications)
      applyDailyAttendanceReset();
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLeaves = async () => {
    const list = await getScheduledLeaves();
    leaves.value = list;

    // Apply leave flags and default present reset
    applyDailyAttendanceReset();
  };

  const fetchAttendanceHistory = async (query?: string | { date?: string; month?: number; year?: number }) => {
    const history = await getAttendanceHistory(query);
    if (history.length > 0) {
      attendanceHistory.value = history;
      // Seed attendanceByDate map from history days
      history.forEach((day) => {
        if (!attendanceByDate.value[day.date]) {
          attendanceByDate.value[day.date] = {};
        }
        if (day.roster) {
          Object.entries(day.roster).forEach(([stKey, list]) => {
            list.forEach((p) => {
              const statusVal = stKey as AttendanceStatusType;
              if (p.code) attendanceByDate.value[day.date][p.code] = statusVal;
              if (p.name) attendanceByDate.value[day.date][p.name] = statusVal;
            });
          });
        }
      });
      saveAttendanceByDate();
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

  const getPersonAttendance = (personIdentifier: string, date: string): AttendanceStatusType => {
    // 1. Check if person is on leave on this date
    const onLeave = leaves.value.some((l) => {
      const match = l.personnelCode === personIdentifier || (l.personnelName && l.personnelName === personIdentifier);
      return match && l.startDate <= date && l.endDate >= date;
    });
    if (onLeave) return 'on_leave';

    // 2. Check attendanceByDate map
    const byDate = attendanceByDate.value[date];
    if (byDate) {
      if (byDate[personIdentifier]) return byDate[personIdentifier];
      const p = personnel.value.find(
        (x) => x.code === personIdentifier || x.id === personIdentifier || x.name === personIdentifier
      );
      if (p) {
        if (p.code && byDate[p.code]) return byDate[p.code];
        if (p.id && byDate[p.id]) return byDate[p.id];
        if (p.name && byDate[p.name]) return byDate[p.name];
      }
    }

    // 3. If date is today, check person.attendanceStatus
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const person = personnel.value.find(
        (p) => p.code === personIdentifier || p.id === personIdentifier || p.name === personIdentifier
      );
      if (person && person.attendanceStatus) {
        return normalizeAttendanceStatus(person.attendanceStatus as string);
      }
    }

    // 4. Check if date is in attendanceHistory
    const histDay = attendanceHistory.value.find((h) => h.date === date);
    if (histDay && histDay.roster) {
      for (const [statusKey, rosterList] of Object.entries(histDay.roster)) {
        if (rosterList.some((r) => r.code === personIdentifier || r.name === personIdentifier)) {
          return statusKey as AttendanceStatusType;
        }
      }
    }

    // Default is present
    return 'present';
  };

  const cycleAttendance = async (
    personIdentifier: string,
    date: string
  ): Promise<AttendanceStatusType> => {
    const current = getPersonAttendance(personIdentifier, date);
    const nextStatus = getNextAttendanceStatus(current);

    if (!attendanceByDate.value[date]) {
      attendanceByDate.value[date] = {};
    }
    attendanceByDate.value[date][personIdentifier] = nextStatus;

    const targetPerson = personnel.value.find(
      (p) => p.code === personIdentifier || p.id === personIdentifier || p.name === personIdentifier
    );
    if (targetPerson) {
      if (targetPerson.code) attendanceByDate.value[date][targetPerson.code] = nextStatus;
      if (targetPerson.id) attendanceByDate.value[date][targetPerson.id] = nextStatus;
      if (targetPerson.name) attendanceByDate.value[date][targetPerson.name] = nextStatus;
    }

    saveAttendanceByDate();

    const today = new Date().toISOString().split('T')[0];
    if (date === today && targetPerson) {
      targetPerson.attendanceStatus = nextStatus;
      personnel.value = [...personnel.value];
      localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel.value));
      await savePersonToDb(targetPerson);
    }

    const pCode = targetPerson?.code || targetPerson?.id || personIdentifier;
    await saveDailyAttendance(date, [{ personnel_code: pCode, status: nextStatus }]);

    return nextStatus;
  };

  const setPersonAttendance = async (
    personIdentifier: string,
    date: string,
    status: AttendanceStatusType
  ) => {
    if (!attendanceByDate.value[date]) {
      attendanceByDate.value[date] = {};
    }
    attendanceByDate.value[date][personIdentifier] = status;

    const targetPerson = personnel.value.find(
      (p) => p.code === personIdentifier || p.id === personIdentifier || p.name === personIdentifier
    );
    if (targetPerson) {
      if (targetPerson.code) attendanceByDate.value[date][targetPerson.code] = status;
      if (targetPerson.id) attendanceByDate.value[date][targetPerson.id] = status;
      if (targetPerson.name) attendanceByDate.value[date][targetPerson.name] = status;
    }

    saveAttendanceByDate();

    const today = new Date().toISOString().split('T')[0];
    if (date === today && targetPerson) {
      targetPerson.attendanceStatus = status;
      personnel.value = [...personnel.value];
      localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel.value));
      await savePersonToDb(targetPerson);
    }

    const pCode = targetPerson?.code || targetPerson?.id || personIdentifier;
    await saveDailyAttendance(date, [{ personnel_code: pCode, status }]);
  };

  // 1-Click inline attendance status edit
  const updateAttendanceStatus = async (
    personIdentifier: string,
    newStatus: AttendanceStatusType
  ) => {
    const today = new Date().toISOString().split('T')[0];
    await setPersonAttendance(personIdentifier, today, newStatus);
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

    if (!attendanceByDate.value[today]) {
      attendanceByDate.value[today] = {};
    }
    records.forEach((r) => {
      attendanceByDate.value[today][r.personnel_code] = r.status;
      const targetPerson = personnel.value.find(
        (p) => p.code === r.personnel_code || p.id === r.personnel_code || p.name === r.personnel_code
      );
      if (targetPerson) {
        if (targetPerson.code) attendanceByDate.value[today][targetPerson.code] = r.status;
        if (targetPerson.id) attendanceByDate.value[today][targetPerson.id] = r.status;
        if (targetPerson.name) attendanceByDate.value[today][targetPerson.name] = r.status;
      }
    });
    saveAttendanceByDate();

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
    completeOnboarding,
    attendanceByDate,
    getPersonAttendance,
    cycleAttendance,
    setPersonAttendance,
    applyDailyAttendanceReset,
    checkDailyReset
  };
});
