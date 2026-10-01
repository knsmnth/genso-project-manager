import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WorkOrder, InspectionItem } from '../types';
import { getWorkOrders, saveWorkOrderToDb, deleteWorkOrderFromDb } from '../services/workOrderService';

export const DEFAULT_WORK_ORDERS: WorkOrder[] = [
  {
    code: 'WO-8492',
    workTitle: 'LED Fixtures & Electrical Inspection',
    assetName: 'Coconut Dorm',
    space: 'Room 21',
    scope: 'Check electrical outlets, install new LED light fixtures, inspect wire insulation.',
    workgroup: 'Building Repair & Maintenance',
    status: 'On-going',
    priority: 'Medium',
    worktype: 'Electrical',
    startDate: '2024-08-24',
    endDate: '2024-08-26',
    startTime: '08:30 AM',
    endTime: '05:00 PM',
    foreman: 'Robert Chen',
    requesterName: 'Robert Chen',
    requestingOffice: 'Office of Student Housing',
    dateReceived: '2024-08-23',
    isActive: true,
    assigned: ['Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
    description:
      'Multiple electrical outlets are inactive. Main breaker checked. Technician needs to test lines and replace standard panels with newer LED light fixtures.',
    tasks: [
      {
        type: 'Electrical',
        remarks: 'Check and repair faulty electrical outlets and rewire main panel line',
        degreeOfWork: 'Moderate'
      },
      {
        type: 'Electrical',
        remarks: 'Install 12 energy-efficient LED light fixtures across Room 21',
        degreeOfWork: 'Routine'
      }
    ]
  },
  {
    code: 'WO-9104',
    workTitle: 'Roof Deck Sealing & Leak Repair',
    assetName: 'DMath',
    space: 'Roof Deck B-4',
    scope: 'Waterproofing repair on cracks, replace sealing membranes, check drainage pipes.',
    workgroup: 'Student Housing Repair & Maintenance',
    status: 'Scheduled',
    priority: 'High',
    worktype: 'Plumbing',
    startDate: '2024-08-25',
    endDate: '2024-08-28',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    foreman: 'Sarah Jenkins',
    requesterName: 'Dean of Sciences',
    requestingOffice: 'College of Mathematics Office',
    dateReceived: '2024-08-24',
    isActive: true,
    assigned: ['John Doe', 'Alice Williams'],
    description:
      'Minor rainwater leaks reported in classroom ceilings directly below Roof Deck B-4. Sealing membranes degraded.',
    tasks: [
      {
        type: 'Plumbing',
        remarks: 'Check drainage pipes and unclog roof gutter outflows',
        degreeOfWork: 'Major'
      },
      {
        type: 'Masonry',
        remarks: 'Apply high-durability waterproof coating over cracks',
        degreeOfWork: 'Moderate'
      }
    ]
  },
  {
    code: 'WO-7731',
    workTitle: 'Climate Control Recalibration',
    assetName: 'CoMed Laboratory',
    space: 'Lab 101',
    scope: 'Re-calibrate HVAC climate controls, replace filters, clean air duct grills.',
    workgroup: 'Fabrication Workshop',
    status: 'Completed',
    priority: 'Low',
    worktype: 'HVAC',
    startDate: '2024-08-22',
    endDate: '2024-08-22',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    foreman: 'Marcus Thorne',
    requesterName: 'Dr. Aris Thorne',
    requestingOffice: 'Medical Sciences Division',
    dateReceived: '2024-08-20',
    isActive: true,
    assigned: ['Elena Rodriguez', 'David Kim'],
    description:
      'Lab 101 climate sensors fluctuated by 3 degrees. Calibrated HVAC controls and installed clean filter elements.',
    tasks: [
      {
        type: 'HVAC',
        remarks: 'Recalibrate digital thermostat sensors and damper actuators',
        degreeOfWork: 'Routine'
      },
      {
        type: 'Ventilation',
        remarks: 'Replace HEPA filtration units and clean air grilles',
        degreeOfWork: 'Routine'
      }
    ]
  }
];

const STORAGE_KEY = 'infra_work_orders';

export const useWorkOrdersStore = defineStore('workOrders', () => {
  const workOrders = ref<WorkOrder[]>([]);

  const saveToStorage = (updated: WorkOrder[]) => {
    workOrders.value = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchOrders = async () => {
    const orders = await getWorkOrders();
    const rawList = orders.length === 0 ? DEFAULT_WORK_ORDERS : orders;
    const normalized = rawList.map((o) => {
      let st = o.status || 'Not Scheduled';
      let act = o.isActive;
      const lower = st.toLowerCase().trim();
      if (lower === 'on hold' || lower === 'pending' || lower === 'not scheduled' || lower === 'notscheduled' || lower === 'unscheduled') {
        st = 'Not Scheduled';
        if (lower === 'on hold') act = false;
      } else if (lower === 'in progress' || lower === 'ongoing' || lower === 'on-going') {
        st = 'On-going';
      } else if (lower === 'completed') {
        st = 'Completed';
      } else if (lower === 'scheduled') {
        st = 'Scheduled';
      }
      if (act === undefined) {
        act = true;
      }

      let cleanedTasks = o.tasks;
      if (cleanedTasks && cleanedTasks.length > 0) {
        cleanedTasks = cleanedTasks.map((t) => ({
          ...t,
          remarks: t.remarks === 'General Maintenance Scope' ? '' : (t.remarks || '')
        }));
        const valid = cleanedTasks.filter(
          (t) => (t.type && t.type.trim() !== '' && t.type.trim() !== '-') ||
                 (t.remarks && t.remarks.trim() !== '' && t.remarks.trim() !== '-')
        );
        if (valid.length > 0) {
          cleanedTasks = valid;
        }
      }

      const cleanedScope = o.scope === 'General Maintenance Scope' ? '' : (o.scope || '');

      return {
        ...o,
        scope: cleanedScope,
        status: st,
        isActive: act,
        tasks: cleanedTasks
      };
    });

    // Preserve & migrate any inspections previously stored in Daily Work Log into work orders
    try {
      const rawLogs = localStorage.getItem('infra_daily_work_logs');
      if (rawLogs) {
        const parsedLogs = JSON.parse(rawLogs);
        if (Array.isArray(parsedLogs)) {
          parsedLogs.forEach((l: any) => {
            if (l.workOrderNumber && l.inspectionList && l.inspectionList.length > 0) {
              const matchedOrder = normalized.find((o) => o.code === l.workOrderNumber);
              if (matchedOrder && (!matchedOrder.inspectionList || matchedOrder.inspectionList.length === 0)) {
                matchedOrder.inspectionList = [...l.inspectionList];
                matchedOrder.inspectionsCount = l.inspectionList.length;
              }
            }
          });
        }
      }
    } catch {}

    saveToStorage(normalized);
    return normalized;
  };

  const saveOrder = async (data: WorkOrder, isEditing: boolean = false) => {
    let updated: WorkOrder[] = [];
    if (isEditing) {
      updated = workOrders.value.map((o) => (o.code === data.code ? data : o));
    } else {
      updated = [data, ...workOrders.value];
    }
    saveToStorage(updated);
    await saveWorkOrderToDb(data);
  };

  const updateStatus = async (code: string, newStatus: string) => {
    const target = workOrders.value.find((o) => o.code === code);
    if (target) {
      target.status = newStatus;
      const updated = [...workOrders.value];
      saveToStorage(updated);
      await saveWorkOrderToDb(target);
    }
  };

  const toggleActive = async (code: string): Promise<boolean> => {
    const target = workOrders.value.find((o) => o.code === code);
    if (target) {
      target.isActive = target.isActive === false ? true : false;
      const updated = [...workOrders.value];
      saveToStorage(updated);
      await saveWorkOrderToDb(target);
      return target.isActive;
    }
    return true;
  };

  const updateInspections = async (code: string, inspectionList: InspectionItem[]) => {
    const target = workOrders.value.find((o) => o.code === code);
    if (target) {
      target.inspectionList = inspectionList;
      target.inspectionsCount = inspectionList.length;
      const updated = [...workOrders.value];
      saveToStorage(updated);
      await saveWorkOrderToDb(target);
    }
  };

  const updateWorkgroup = async (code: string, workgroup: string) => {
    const target = workOrders.value.find((o) => o.code === code);
    if (target) {
      target.workgroup = workgroup;
      const updated = [...workOrders.value];
      saveToStorage(updated);
      await saveWorkOrderToDb(target);
    }
  };

  const deleteOrder = async (code: string) => {
    const updated = workOrders.value.filter((o) => o.code !== code);
    saveToStorage(updated);
    await deleteWorkOrderFromDb(code);
  };

  return {
    workOrders,
    saveToStorage,
    fetchOrders,
    saveOrder,
    updateStatus,
    toggleActive,
    updateInspections,
    updateWorkgroup,
    deleteOrder
  };
});
