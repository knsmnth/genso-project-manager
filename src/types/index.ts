export interface Task {
  type: string;
  remarks: string;
  startDate: string;
  endDate: string;
  degreeOfWork?: string;
  description?: string;
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
}

export interface Person {
  name: string;
  role: string;
  code: string;
  status: string;
  id?: string;               // e.g., 'EMP-1024'
  attendanceStatus?: string;  // e.g., 'Present (08:02)'
  activeOrder?: string;       // e.g., 'WO-9921-A'
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
}



