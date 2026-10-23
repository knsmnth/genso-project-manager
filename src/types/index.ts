export interface Task {
  type: string;
  remarks: string;
  startDate?: string;
  endDate?: string;
  degreeOfWork?: string;
  description?: string;
  remarksList?: RemarkNote[];
  hasComments?: boolean;
}

export interface WorkOrder {
  code: string;
  assetName: string;
  space: string;
  scope: string; // Typically the remarks of the primary task
  workgroup: string;
  status: string;
  priority: string;
  worktype: string; // Typically the type of the primary task
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  foreman: string;
  assigned: string[];
  description: string;
  tasks?: Task[];
  workTitle?: string;
  dateReceived?: string;
  requesterName?: string;
  requestingOffice?: string;
  roomNo?: string;
  isLocked?: boolean;
  isActive?: boolean;
  itemTypes?: string[];
  inspectionList?: InspectionItem[];
  inspectionsCount?: number;
  completedDate?: string;
}

export interface DateHoldRecord {
  date: string;
  isHeld: boolean;
  reason: string;
  updatedAt?: string;
  declaredBy?: string;
  holdAttendance?: boolean;
}

export type AttendanceStatusType = 'present' | 'absent' | 'half_am' | 'half_pm' | 'on_leave' | 'holiday';

export interface Person {
  name: string;
  role: string;
  code: string;
  status: string;
  id?: string;               // e.g., 'EMP-1024'
  attendanceStatus?: AttendanceStatusType | string;
  activeOrder?: string;       // e.g., 'WO-9921-A'
  email?: string;
  phone?: string;
  department?: string;
  team?: string;
  dateHired?: string;
  emergencyContact?: string;
  notes?: string;
  isOnLeaveToday?: boolean;
  leaveDetails?: LeaveRecord | null;
}

export interface LeaveRecord {
  id?: number | string;
  personnelCode: string;
  personnelName?: string;
  role?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: string;
  createdAt?: string;
}

export interface PersonnelAttendanceRecord {
  id?: number;
  personnelCode: string;
  date: string;
  formattedDate?: string;
  dayOfWeek?: string;
  status: AttendanceStatusType;
  notes?: string;
}

export interface AttendanceRosterPerson {
  code: string;
  name: string;
  role: string;
  status: AttendanceStatusType;
  notes?: string;
  activeOrder?: string;
}

export interface AttendanceRosterDay {
  date: string;
  formattedDate: string;
  dayOfWeek: string;
  compliance: number;
  totalStaff: number;
  counts: {
    present: number;
    absent: number;
    half_am: number;
    half_pm: number;
    on_leave: number;
  };
  roster: {
    present: AttendanceRosterPerson[];
    absent: AttendanceRosterPerson[];
    half_am: AttendanceRosterPerson[];
    half_pm: AttendanceRosterPerson[];
    on_leave: AttendanceRosterPerson[];
  };
}

export interface AttendanceLog {
  date: string;
  dayOfWeek: string;
  compliance: number;
  checkedIn: number;
  totalStaff: number;
  lateArrivals: number;
  unexcused: number;
}

export interface Team {
  name: string;
  lead: string;
  size: number;
  jobs: number;
  members: string[];
}

export interface RemarkNote {
  id: string;
  timestamp: string;
  text: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: string;
  borrower: string;
  checked: boolean;
  notes?: string;
}

export interface InspectionPhoto {
  id: string;
  url: string; // Base64 data URL or remote cloud URL
  name?: string;
  timestamp?: string;
}

export interface InspectionItem {
  id: string;
  inspector: string;
  date: string;
  notes: string;
  detailedNotes?: string;
  status: string;
  photos?: InspectionPhoto[];
}

export interface DailyWorkLogEntry {
  id: string;
  groupTitle: string;        // e.g. "PHYSICAL PLANT OFFICE"
  groupSubTitle: string;     // e.g. "Air Conditioning & Ventilation Maintenance"
  workOrderNumber: string;   // e.g. "WO-2023-0492"
  category: string;          // e.g. "General Maintenance"
  workType: string;          // e.g. "HVAC", "Electric", "Pipework"
  description: string;       // e.g. "Check and replace air filters..."
  startDate: string;         // e.g. "2023-10-24" or "OCT 24, 23"
  completionDate: string;    // e.g. "2023-10-25" or "OCT 25, 23"
  assignedLead: string;      // e.g. "Leadman J. Carter"
  personnelCount: number;    // e.g. 5
  assignedPersonnel: string[]; // List of employee names
  inspectionsCount: number;  // e.g. 2
  hasComments?: boolean;
  isOnHold?: boolean;
  remarksList?: RemarkNote[];
  equipmentList?: EquipmentItem[];
  inspectionList?: InspectionItem[];
  requestingOffice?: string;
  workTitle?: string;
  isActive?: boolean;
  isUserSetStartDate?: boolean;
  isUserSetCompletionDate?: boolean;
}

export type CatalogType = 'office' | 'work_type' | 'activity_type' | 'item_type' | 'equipment' | 'asset';

export interface CatalogItem {
  id: string;
  type: CatalogType;
  name: string;
  code?: string;
  acronym?: string;
  title?: string;
  color?: string;
  category?: string;
  location?: string;
  owner?: string;
  purchased?: string;
  contactPerson?: string;
  quantity?: number;
  isActive?: boolean;
  description?: string;
  createdAt?: string;
}

export interface MasterCatalogsState {
  offices: CatalogItem[];
  workTypes: CatalogItem[];
  activityTypes: CatalogItem[];
  itemTypes: CatalogItem[];
  equipment: CatalogItem[];
  assets?: CatalogItem[];
}
