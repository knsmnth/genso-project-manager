import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { TeamsView } from './components/TeamsView';
import { CreateOrderView } from './components/CreateOrderView';
import { DetailsModal } from './components/DetailsModal';
import { PersonnelView } from './components/PersonnelView';
import { AttendanceModal } from './components/AttendanceModal';
import { QuickOnboardView } from './components/QuickOnboardView';
import { WorkOrder, Person, Team } from './types';

// Seeding Default mock database items
const DEFAULT_WORK_ORDERS: WorkOrder[] = [
  {
    code: 'WO-8492',
    assetName: 'Coconut Dorm',
    space: 'Room 21',
    scope: 'Check electrical outlets, install new LED light fixtures, inspect wire insulation.',
    workgroup: 'Building Repair & Maintenance',
    status: 'In Progress',
    priority: 'Medium',
    worktype: 'Electrical',
    startDate: '2024-08-24',
    endDate: '2024-08-26',
    startTime: '08:30 AM',
    endTime: '05:00 PM',
    foreman: 'Robert Chen',
    assigned: ['Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
    description: 'Multiple electrical outlets are inactive. Main breaker checked. Technician needs to test lines and replace standard panels with newer LED light fixtures.'
  },
  {
    code: 'WO-9104',
    assetName: 'DMath',
    space: 'Roof Deck B-4',
    scope: 'Waterproofing repair on cracks, replace sealing membranes, check drainage pipes.',
    workgroup: 'Student Housing Repair & Maintenance',
    status: 'Pending',
    priority: 'High',
    worktype: 'Plumbing',
    startDate: '2024-08-25',
    endDate: '2024-08-28',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    foreman: 'Sarah Jenkins',
    assigned: ['John Doe', 'Alice Williams'],
    description: 'Minor rainwater leaks reported in classroom ceilings directly below Roof Deck B-4. Sealing membranes degraded.'
  },
  {
    code: 'WO-7731',
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
    assigned: ['Elena Rodriguez', 'David Kim'],
    description: 'Lab 101 climate sensors fluctuated by 3 degrees. Calibrated HVAC controls and installed clean filter elements.'
  }
];

const DEFAULT_PERSONNEL: Person[] = [
  { name: 'Elena Rodriguez', role: 'Senior Electrician', code: 'EMP-1024', status: 'Available', id: 'EMP-1024', attendanceStatus: 'Present (08:02)', activeOrder: 'WO-9921-A' },
  { name: 'Julian Marcus', role: 'HVAC Specialist', code: 'EMP-1025', status: 'Busy', id: 'EMP-1025', attendanceStatus: 'Present (07:45)', activeOrder: 'WO-9942-B' },
  { name: 'Sarah Jenkins', role: 'Welding Supervisor', code: 'EMP-1026', status: 'Off-Site', id: 'EMP-1026', attendanceStatus: 'Absent (On Leave)', activeOrder: '—' },
  { name: 'David Chen', role: 'Safety Officer', code: 'EMP-1031', status: 'Available', id: 'EMP-1031', attendanceStatus: 'Present (07:12)', activeOrder: 'SI-102-AUDIT' },
  { name: 'Michael Scott', role: 'Site Manager', code: 'EMP-1032', status: 'Available', id: 'EMP-1032', attendanceStatus: 'Absent', activeOrder: '—' },
  { name: 'Pam Beesly', role: 'Office Admin', code: 'EMP-1033', status: 'Available', id: 'EMP-1033', attendanceStatus: 'Present (08:30)', activeOrder: '—' },
  { name: 'Robert Chen', role: 'Senior Electrician', code: 'MP-9102-E', status: 'On-Site', id: 'MP-9102-E', attendanceStatus: 'Present (07:55)', activeOrder: 'WO-8492' },
  { name: 'John Doe', role: 'General Laborer', code: 'MP-1104-G', status: 'Maintenance', id: 'MP-1104-G', attendanceStatus: 'Present (08:15)', activeOrder: 'WO-9104' },
  { name: 'Alice Williams', role: 'Safety Inspector', code: 'MP-3341-S', status: 'Available', id: 'MP-3341-S', attendanceStatus: 'Absent', activeOrder: '—' },
  { name: 'David Kim', role: 'Masonry Artisan', code: 'MP-6821-M', status: 'Available', id: 'MP-6821-M', attendanceStatus: 'Absent', activeOrder: '—' }
];

const WORK_GROUPS: Team[] = [
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

const STORAGE_KEY = 'infra_work_orders';
const PERSONNEL_STORAGE_KEY = 'infra_personnel';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Details Modal States
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Attendance Check Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Edit / Form States
  const [editingOrderCode, setEditingOrderCode] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    // Work orders loader
    const rawOrders = localStorage.getItem(STORAGE_KEY);
    if (rawOrders) {
      try {
        setWorkOrders(JSON.parse(rawOrders));
      } catch (e) {
        console.error('Failed to parse cached work orders', e);
        setWorkOrders(DEFAULT_WORK_ORDERS);
      }
    } else {
      setWorkOrders(DEFAULT_WORK_ORDERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WORK_ORDERS));
    }

    // Personnel loader
    const rawPersonnel = localStorage.getItem(PERSONNEL_STORAGE_KEY);
    if (rawPersonnel) {
      try {
        setPersonnel(JSON.parse(rawPersonnel));
      } catch (e) {
        console.error('Failed to parse cached personnel', e);
        setPersonnel(DEFAULT_PERSONNEL);
      }
    } else {
      setPersonnel(DEFAULT_PERSONNEL);
      localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(DEFAULT_PERSONNEL));
    }
  }, []);

  const saveToStorage = (updatedOrders: WorkOrder[]) => {
    setWorkOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
  };

  const handleSelectOrder = (code: string) => {
    setSelectedOrderCode(code);
    setIsDetailsModalOpen(true);
  };

  const handleEditOrder = (code: string) => {
    setEditingOrderCode(code);
    setActiveView('create-order');
  };

  const handleDeleteOrder = (code: string) => {
    const updated = workOrders.filter((o) => o.code !== code);
    saveToStorage(updated);
    if (selectedOrderCode === code) {
      setIsDetailsModalOpen(false);
      setSelectedOrderCode(null);
    }
  };

  const handleSaveOrder = (data: WorkOrder) => {
    let updated: WorkOrder[] = [];
    if (editingOrderCode) {
      updated = workOrders.map((o) => (o.code === editingOrderCode ? data : o));
    } else {
      updated = [data, ...workOrders];
    }
    saveToStorage(updated);
    setEditingOrderCode(null);
    setActiveView('workorders');
  };

  const handleCreateOrder = () => {
    setEditingOrderCode(null);
    setActiveView('create-order');
  };

  const handleCancelForm = () => {
    setEditingOrderCode(null);
    setActiveView('workorders');
  };

  // Attendance check submissions
  const handleConfirmAttendance = (checkedNames: string[]) => {
    const updated = personnel.map((p) => {
      if (checkedNames.includes(p.name)) {
        const hasTime = p.attendanceStatus && p.attendanceStatus.startsWith('Present');
        return {
          ...p,
          attendanceStatus: hasTime ? p.attendanceStatus : 'Present (08:00)'
        };
      } else {
        return {
          ...p,
          attendanceStatus: p.attendanceStatus === 'Absent (On Leave)' ? 'Absent (On Leave)' : 'Absent'
        };
      }
    });
    setPersonnel(updated);
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));
    setIsAttendanceModalOpen(false);
  };

  // Onboard registrations
  const handleCompleteOnboarding = (newPerson: Person) => {
    const updated = [...personnel, newPerson];
    setPersonnel(updated);
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));
    setActiveView('personnel');
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        onSidebarClose={() => setSidebarOpen(false)}
        onCreateOrder={handleCreateOrder}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onMenuToggle={() => {
            if (window.innerWidth > 1024) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          onCreateOrder={handleCreateOrder}
        />

        {/* View Routing Switcher wrapped in spacing margins */}
        <div className="main-content-inner">
          {activeView === 'dashboard' && (
            <DashboardView
              workOrders={workOrders}
              onSelectOrder={handleSelectOrder}
              onViewAll={() => setActiveView('workorders')}
              teamsCount={WORK_GROUPS.length}
            />
          )}

          {activeView === 'workorders' && (
            <WorkOrdersView
              workOrders={workOrders}
              searchQuery={searchQuery}
              onSelectOrder={handleSelectOrder}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onCreateOrder={handleCreateOrder}
            />
          )}

          {activeView === 'teams' && (
            <TeamsView
              teams={WORK_GROUPS}
              personnel={personnel}
              onNewGroup={() => alert('New Work Group creation is under development.')}
            />
          )}

          {activeView === 'personnel' && (
            <PersonnelView
              personnel={personnel}
              searchQuery={searchQuery}
              onOpenAttendanceCheck={() => setIsAttendanceModalOpen(true)}
              onOpenQuickOnboard={() => setActiveView('quick-onboard')}
            />
          )}

          {activeView === 'quick-onboard' && (
            <QuickOnboardView
              onComplete={handleCompleteOnboarding}
              onCancel={() => setActiveView('personnel')}
            />
          )}

          {activeView === 'create-order' && (
            <CreateOrderView
              editingOrderCode={editingOrderCode}
              workOrders={workOrders}
              personnel={personnel}
              onSaveOrder={handleSaveOrder}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </main>

      {/* Details Modal Popup Overlay */}
      <DetailsModal
        isOpen={isDetailsModalOpen}
        orderCode={selectedOrderCode}
        workOrders={workOrders}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderCode(null);
        }}
        onEdit={handleEditOrder}
      />

      {/* Daily Attendance Modal Overlay */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        personnel={personnel}
        onClose={() => setIsAttendanceModalOpen(false)}
        onConfirm={handleConfirmAttendance}
      />

      {/* Mobile Bottom Navigation (Hidden on Desktop via CSS) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <span>Overview</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={handleCreateOrder}
        >
          <div className="mobnav-create-badge">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ marginTop: '18px' }}>Create</span>
        </button>

        <button
          className={`bottom-nav-item ${activeView === 'personnel' || activeView === 'quick-onboard' ? 'active' : ''}`}
          onClick={() => setActiveView('personnel')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span>Personnel</span>
        </button>

        <button
          className={`bottom-nav-item ${activeView === 'alerts' ? 'active' : ''}`}
          onClick={() => alert('Alert notifications are currently empty.')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>Alerts</span>
        </button>
      </nav>
    </div>
  );
}
