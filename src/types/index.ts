export interface Task {
  type: string;
  remarks: string;
  startDate: string;
  endDate: string;
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
