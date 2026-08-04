import React, { useState, useEffect } from 'react';
import { DailyWorkLogEntry, Person, WorkOrder, RemarkNote, EquipmentItem } from '../types';

interface DailyWorkLogViewProps {
  personnel?: Person[];
  workOrders?: WorkOrder[];
  onSelectOrder?: (code: string) => void;
  onCreateTask?: () => void;
}

const DEFAULT_IMAGE_SPEC_LOGS: DailyWorkLogEntry[] = [
  {
    id: 'log-spec-1',
    groupTitle: 'PHYSICAL PLANT OFFICE',
    groupSubTitle: 'Air Conditioning & Ventilation Maintenance',
    workOrderNumber: 'WO-2023-0492',
    category: 'General Maintenance',
    workType: 'HVAC',
    description: 'Check and replace air filters in Building A. Calibrate thermostats.',
    startDate: '2023-10-24',
    completionDate: '2023-10-25',
    assignedLead: 'Leadman J. Carter',
    personnelCount: 5,
    assignedPersonnel: ['John Doe', 'Jane Smith', 'Robert Wilson', 'Sarah Jenkins', 'Elena Rodriguez'],
    inspectionsCount: 2,
    hasComments: true,
    isOnHold: false,
    remarksList: [
      {
        id: 'rem-1',
        timestamp: 'Oct 24, 2023 • 09:15 AM',
        text: 'Building A air filters were heavily clogged. Recommended increasing inspection frequency to bi-monthly during pollen season.'
      },
      {
        id: 'rem-2',
        timestamp: 'Oct 24, 2023 • 11:30 AM',
        text: 'Condenser fan motor in AC-04 is showing signs of bearing wear. Part ordered for next week\'s maintenance cycle.'
      }
    ],
    equipmentList: [
      {
        id: 'eq-1',
        name: 'Industrial Air Filter Kit',
        quantity: '12 Units',
        borrower: 'Leadman J. Carter',
        checked: true
      },
      {
        id: 'eq-2',
        name: 'Digital Manometer',
        quantity: '1 Unit',
        borrower: 'Leadman J. Carter',
        checked: false
      }
    ]
  },
  {
    id: 'log-spec-2',
    groupTitle: 'PHYSICAL PLANT OFFICE',
    groupSubTitle: 'Air Conditioning & Ventilation Maintenance',
    workOrderNumber: 'WO-2023-0492',
    category: 'General Maintenance',
    workType: 'Electric',
    description: 'Testing condenser fan motors and replacing worn wiring in unit AC-04.',
    startDate: '2023-10-24',
    completionDate: '2023-10-24',
    assignedLead: 'Foreman R. Lee',
    personnelCount: 3,
    assignedPersonnel: ['Robert Wilson', 'Sarah Jenkins', 'David Kim'],
    inspectionsCount: 2,
    hasComments: false,
    isOnHold: false,
    remarksList: [],
    equipmentList: [
      {
        id: 'eq-3',
        name: 'Multimeter & Wire Crimper',
        quantity: '2 Sets',
        borrower: 'Foreman R. Lee',
        checked: true
      }
    ]
  },
  {
    id: 'log-spec-3',
    groupTitle: 'RESIDENCE HALL B',
    groupSubTitle: 'Plumbing Infrastructure Overhaul',
    workOrderNumber: 'WO-2023-0511',
    category: 'Civil Engineering',
    workType: 'Pipework',
    description: 'Repairing main leak in floor 3 riser. Pressure testing valves.',
    startDate: '2023-10-24',
    completionDate: '2023-10-26',
    assignedLead: 'Foreman M. Garcia',
    personnelCount: 4,
    assignedPersonnel: ['Michael Chen', 'Emily Davis', 'David Miller', 'James Wilson'],
    inspectionsCount: 1,
    hasComments: true,
    isOnHold: false,
    remarksList: [
      {
        id: 'rem-3',
        timestamp: 'Oct 24, 2023 • 02:45 PM',
        text: 'Main riser leak in Residence Hall B was more extensive than initially reported. Required additional copper fittings from central stock.'
      }
    ],
    equipmentList: [
      {
        id: 'eq-4',
        name: 'Hydraulic Pipe Cutter & Welder',
        quantity: '1 Set',
        borrower: 'Foreman M. Garcia',
        checked: true
      }
    ]
  }
];

const OTHER_EMPLOYEES_DEFAULT = [
  'Michael Chen', 'Emily Davis', 'David Miller', 'James Wilson',
  'Linda Thompson', 'Christopher Lee', 'Patricia Garcia', 'Richard Martinez', 'Susan Robinson'
];

const LOGS_STORAGE_KEY_V3 = 'infra_daily_work_logs_v3';

export const DailyWorkLogView: React.FC<DailyWorkLogViewProps> = ({
  personnel = [],
  workOrders = [],
  onSelectOrder,
  onCreateTask
}) => {
  const [logs, setLogs] = useState<DailyWorkLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2023-10-24');
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});
  const [saveStatusText, setSaveStatusText] = useState<string>('Last auto-saved: 14:32:05 PM');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Active Drawer States
  const [activeDrawer, setActiveDrawer] = useState<'remarks' | 'personnel' | 'equipment' | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Personnel Drawer State
  const [personnelSearch, setPersonnelSearch] = useState<string>('');

  // Form State for Adding New Row
  const [newGroupTitle, setNewGroupTitle] = useState<string>('PHYSICAL PLANT OFFICE');
  const [newGroupSubTitle, setNewGroupSubTitle] = useState<string>('General Facility Maintenance');
  const [newWONumber, setNewWONumber] = useState<string>('WO-2023-0899');
  const [newCategory, setNewCategory] = useState<string>('General Maintenance');
  const [newWorkType, setNewWorkType] = useState<string>('HVAC');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('2023-10-24');
  const [newCompDate, setNewCompDate] = useState<string>('2023-10-25');
  const [newLead, setNewLead] = useState<string>('Leadman J. Carter');
  const [newPersonnelCount, setNewPersonnelCount] = useState<number>(3);
  const [newInspectionsCount, setNewInspectionsCount] = useState<number>(1);

  useEffect(() => {
    const cached = localStorage.getItem(LOGS_STORAGE_KEY_V3);
    if (cached) {
      try {
        setLogs(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached daily work logs v3', e);
        setLogs(DEFAULT_IMAGE_SPEC_LOGS);
      }
    } else {
      setLogs(DEFAULT_IMAGE_SPEC_LOGS);
      localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(DEFAULT_IMAGE_SPEC_LOGS));
    }
  }, []);

  const saveLogs = (updated: DailyWorkLogEntry[]) => {
    setLogs(updated);
    localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(updated));
    const now = new Date().toLocaleTimeString();
    setSaveStatusText(`Last auto-saved: ${now}`);
  };

  const handleToggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleUpdateField = (id: string, field: keyof DailyWorkLogEntry, value: any) => {
    const updated = logs.map(l => (l.id === id ? { ...l, [field]: value } : l));
    saveLogs(updated);
  };

  const handleToggleOnHold = (id: string) => {
    const item = logs.find(l => l.id === id);
    if (!item) return;
    handleUpdateField(id, 'isOnHold', !item.isOnHold);
  };

  const handleOpenDrawer = (type: 'remarks' | 'personnel' | 'equipment', rowId: string) => {
    setSelectedRowId(rowId);
    setActiveDrawer(type);
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSelectedRowId(null);
  };

  const selectedRow = logs.find(l => l.id === selectedRowId);

  // Remarks drawer handlers
  const handleAddRemarkNote = () => {
    if (!selectedRowId || !selectedRow) return;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const newNote: RemarkNote = {
      id: `rem-${Date.now()}`,
      timestamp: timeStr,
      text: ''
    };

    const updatedRemarks = [...(selectedRow.remarksList || []), newNote];
    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, remarksList: updatedRemarks, hasComments: true } : l);
    saveLogs(updatedLogs);
  };

  const handleUpdateRemarkNoteText = (noteId: string, text: string) => {
    if (!selectedRowId || !selectedRow) return;
    if (text.length > 500) text = text.slice(0, 500); // 500 char limit

    const updatedRemarks = (selectedRow.remarksList || []).map(r => r.id === noteId ? { ...r, text } : r);
    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, remarksList: updatedRemarks } : l);
    saveLogs(updatedLogs);
  };

  const handleDeleteRemarkNote = (noteId: string) => {
    if (!selectedRowId || !selectedRow) return;
    const updatedRemarks = (selectedRow.remarksList || []).filter(r => r.id !== noteId);
    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, remarksList: updatedRemarks, hasComments: updatedRemarks.length > 0 } : l);
    saveLogs(updatedLogs);
  };

  // Personnel drawer handlers
  const handleTogglePersonnelStaff = (staffName: string) => {
    if (!selectedRowId || !selectedRow) return;
    const current = selectedRow.assignedPersonnel || [];
    let updatedStaff: string[] = [];

    if (current.includes(staffName)) {
      updatedStaff = current.filter(s => s !== staffName);
    } else {
      updatedStaff = [...current, staffName];
    }

    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, assignedPersonnel: updatedStaff, personnelCount: updatedStaff.length } : l);
    saveLogs(updatedLogs);
  };

  // Equipment drawer handlers
  const handleToggleEquipmentChecked = (eqId: string) => {
    if (!selectedRowId || !selectedRow) return;
    const updatedEq = (selectedRow.equipmentList || []).map(e => e.id === eqId ? { ...e, checked: !e.checked } : e);
    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, equipmentList: updatedEq } : l);
    saveLogs(updatedLogs);
  };

  const handleAddEquipmentItem = () => {
    if (!selectedRowId || !selectedRow) return;
    const name = window.prompt('Enter Equipment Name:');
    if (!name) return;
    const quantity = window.prompt('Enter Quantity (e.g. 2 Units):') || '1 Unit';

    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name,
      quantity,
      borrower: selectedRow.assignedLead || 'Field Supervisor',
      checked: true
    };

    const updatedEq = [...(selectedRow.equipmentList || []), newItem];
    const updatedLogs = logs.map(l => l.id === selectedRowId ? { ...l, equipmentList: updatedEq } : l);
    saveLogs(updatedLogs);
  };

  const handleSaveAllProgress = () => {
    saveLogs([...logs]);
    alert('All Daily Work Log progress, remarks, personnel assignments, and equipment records have been saved!');
  };

  const handleExportPDF = () => {
    // Generate print window with flattened data
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Work Log Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0B1C30; }
          h1 { color: #006C49; font-size: 24px; }
          .section { margin-bottom: 24px; border: 1px solid #BBCABF; border-radius: 8px; overflow: hidden; }
          .header { background: #EFF4FF; padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #BBCABF; }
          .row { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; }
          .row-title { font-weight: bold; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #6C7A71; margin-bottom: 8px; }
          .box { background: #F8F9FF; padding: 8px 12px; border-radius: 4px; margin-top: 6px; font-size: 13px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>DAILY WORK LOG REPORT</h1>
        <p><strong>Date:</strong> ${selectedDate} | <strong>Exported:</strong> ${new Date().toLocaleString()}</p>
        <hr />
        ${logs.map(log => `
          <div class="section">
            <div class="header">${log.groupTitle} - ${log.workOrderNumber} (${log.category})</div>
            <div class="row">
              <div class="row-title">[${log.workType}] ${log.description}</div>
              <div class="meta">
                Start: ${log.startDate} | Completion: ${log.completionDate} | Lead: ${log.assignedLead} | Staff Count: ${log.personnelCount}
              </div>
              
              <div class="box">
                <strong>Assigned Staff:</strong> ${(log.assignedPersonnel || []).join(', ') || 'None'}
              </div>

              ${(log.equipmentList || []).length > 0 ? `
                <div class="box">
                  <strong>Equipment Used:</strong>
                  <ul>
                    ${log.equipmentList?.map(e => `<li>${e.name} (${e.quantity}) - Borrower: ${e.borrower} ${e.checked ? '[Checked]' : ''}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${(log.remarksList || []).length > 0 ? `
                <div class="box">
                  <strong>Remarks & Notes History:</strong>
                  <ul>
                    ${log.remarksList?.map(r => `<li><em>${r.timestamp}:</em> ${r.text}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
        <button onclick="window.print()" style="padding:10px 20px; background:#006C49; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Print / Save as PDF</button>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const newEntry: DailyWorkLogEntry = {
      id: `log-spec-${Date.now()}`,
      groupTitle: newGroupTitle.toUpperCase(),
      groupSubTitle: newGroupSubTitle,
      workOrderNumber: newWONumber,
      category: newCategory,
      workType: newWorkType,
      description: newDesc,
      startDate: newStartDate,
      completionDate: newCompDate,
      assignedLead: newLead,
      personnelCount: Number(newPersonnelCount) || 1,
      assignedPersonnel: [newLead],
      inspectionsCount: Number(newInspectionsCount) || 1,
      hasComments: false,
      isOnHold: false,
      remarksList: [],
      equipmentList: []
    };

    saveLogs([...logs, newEntry]);
    setShowAddModal(false);
    setNewDesc('');
  };

  // Filter logs by search query
  const filteredLogs = logs.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.groupTitle.toLowerCase().includes(q) ||
      l.workOrderNumber.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.assignedLead.toLowerCase().includes(q) ||
      l.workType.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  });

  // Group items by groupTitle
  const groupsMap = filteredLogs.reduce((acc, log) => {
    const gTitle = log.groupTitle || 'PHYSICAL PLANT OFFICE';
    if (!acc[gTitle]) acc[gTitle] = [];
    acc[gTitle].push(log);
    return acc;
  }, {} as { [key: string]: DailyWorkLogEntry[] });

  return (
    <div className={`dwl-spec-canvas ${activeDrawer ? 'has-open-drawer' : ''}`}>
      {/* Top Header Bar */}
      <header className="dwl-spec-header">
        <div className="dwl-spec-header-left">
          <h2 className="dwl-spec-title">Daily Work Log</h2>
          <span className="dwl-spec-divider">|</span>
          <div className="dwl-spec-date-pill">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6C7A71" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="text"
              className="dwl-spec-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6C7A71" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div className="dwl-spec-header-right">
          {/* Search Box */}
          <div className="dwl-spec-search-pill">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#6C7A71" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="dwl-spec-search-input"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Action Icons */}
          <button className="dwl-spec-action-icon" title="Notifications" onClick={() => alert('Notifications active.')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B1C30" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="dwl-spec-dot"></span>
          </button>

          <button className="dwl-spec-action-icon" title="Settings" onClick={() => alert('Settings menu.')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B1C30" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {/* User Profile Badge */}
          <div className="dwl-spec-user-profile">
            <div className="dwl-spec-avatar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="dwl-spec-user-name">Admin. Sarah</span>
          </div>
        </div>
      </header>

      {/* Main Page Content Area */}
      <div className="dwl-spec-content">
        {/* Table Column Headers Bar */}
        <div className="dwl-spec-th-bar">
          <div className="dwl-spec-th-cell" style={{ width: '380px', paddingLeft: '40px' }}>
            WORK REQUEST INFORMATION
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '130px', justifyContent: 'center' }}>
            REMARKS / ON HOLD
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '120px', justifyContent: 'center' }}>
            START DATE
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '120px', justifyContent: 'center' }}>
            COMPLETION DATE
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '190px' }}>
            WORK ASSIGNMENT
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '90px', justifyContent: 'center' }}>
            PERSONNEL
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '70px', justifyContent: 'center' }}>
            TOOLS
          </div>
          <div className="dwl-spec-th-cell" style={{ width: '90px', justifyContent: 'center' }}>
            INSPECTIONS
          </div>
        </div>

        {/* Group Section Cards */}
        {Object.keys(groupsMap).length === 0 ? (
          <div className="dwl-spec-empty">
            <p>No matching daily work log entries found.</p>
          </div>
        ) : (
          Object.entries(groupsMap).map(([groupTitle, items]) => {
            const isCollapsed = !!collapsedGroups[groupTitle];
            const firstItem = items[0];
            const subTitle = firstItem?.groupSubTitle || 'Maintenance Overview';
            const woNum = firstItem?.workOrderNumber || 'WO-2023-0000';
            const category = firstItem?.category || 'General Maintenance';

            return (
              <div key={groupTitle} className="dwl-spec-group-card">
                {/* Group Header */}
                <div className="dwl-spec-gh">
                  <div className="dwl-spec-gh-left">
                    <span className="dwl-spec-drag-grid" title="Drag to reorder section">
                      :::
                    </span>
                    <button
                      className="dwl-spec-gh-toggle"
                      onClick={() => handleToggleGroup(groupTitle)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="#6C7A71"
                        strokeWidth="2.5"
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <div className="dwl-spec-gh-text">
                      <h3 className="dwl-spec-gh-title">{groupTitle}</h3>
                      <span className="dwl-spec-gh-sub">{subTitle}</span>
                    </div>
                  </div>

                  <div className="dwl-spec-gh-right">
                    <div className="dwl-spec-wo-info">
                      <span className="dwl-spec-wo-label">Work Order Number</span>
                      <span className="dwl-spec-wo-val">{woNum}</span>
                    </div>

                    <div className="dwl-spec-cat-dropdown">
                      <span>{category}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6C7A71" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Group Rows */}
                {!isCollapsed && (
                  <div className="dwl-spec-rows">
                    {items.map((row) => {
                      const hasNotes = (row.remarksList && row.remarksList.length > 0) || row.hasComments;
                      const hasEquipment = (row.equipmentList && row.equipmentList.length > 0);

                      return (
                        <div key={row.id} className="dwl-spec-row">
                          {/* Drag handles */}
                          <div className="dwl-spec-row-drag" title="Drag row">
                            ::
                          </div>

                          {/* Work Type Box */}
                          <div className="dwl-spec-worktype-box">
                            <input
                              type="text"
                              className="dwl-spec-worktype-input"
                              value={row.workType}
                              onChange={(e) => handleUpdateField(row.id, 'workType', e.target.value)}
                            />
                          </div>

                          {/* Task Description Textarea */}
                          <div className="dwl-spec-desc-box">
                            <textarea
                              className="dwl-spec-desc-textarea"
                              value={row.description}
                              onChange={(e) => handleUpdateField(row.id, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>

                          {/* Speech Bubble Icon 💬 & On Hold Circle Icon ⃝ */}
                          <div className="dwl-spec-icons-cell">
                            <button
                              className={`dwl-spec-icon-btn ${hasNotes ? 'has-data-green' : ''}`}
                              onClick={() => handleOpenDrawer('remarks', row.id)}
                              title="Open Remarks & Notes Drawer"
                            >
                              <svg viewBox="0 0 24 24" width="18" height="18" fill={hasNotes ? '#10B981' : 'none'} stroke={hasNotes ? '#006C49' : '#6C7A71'} strokeWidth="1.8">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>

                            <button
                              className={`dwl-spec-icon-btn ${row.isOnHold ? 'is-on-hold' : ''}`}
                              onClick={() => handleToggleOnHold(row.id)}
                              title="Toggle On Hold"
                            >
                              <svg viewBox="0 0 24 24" width="18" height="18" fill={row.isOnHold ? '#BA1A1A' : 'none'} stroke={row.isOnHold ? '#BA1A1A' : '#6C7A71'} strokeWidth="2">
                                <circle cx="12" cy="12" r="8" />
                              </svg>
                            </button>
                          </div>

                          {/* Start Date Pill (Native Date Picker) */}
                          <div className="dwl-spec-date-cell">
                            <input
                              type="date"
                              className="dwl-spec-date-pill-input"
                              value={row.startDate.includes('-') ? row.startDate : '2023-10-24'}
                              onChange={(e) => handleUpdateField(row.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {/* Completion Date Pill (Native Date Picker) */}
                          <div className="dwl-spec-date-cell">
                            <input
                              type="date"
                              className="dwl-spec-date-pill-input"
                              value={row.completionDate.includes('-') ? row.completionDate : '2023-10-25'}
                              onChange={(e) => handleUpdateField(row.id, 'completionDate', e.target.value)}
                            />
                          </div>

                          {/* Work Assignment Select */}
                          <div className="dwl-spec-assignment-cell">
                            <select
                              className="dwl-spec-lead-select"
                              value={row.assignedLead}
                              onChange={(e) => handleUpdateField(row.id, 'assignedLead', e.target.value)}
                            >
                              <option value="Leadman J. Carter">Leadman J. Carter</option>
                              <option value="Foreman R. Lee">Foreman R. Lee</option>
                              <option value="Foreman M. Garcia">Foreman M. Garcia</option>
                              <option value="Robert Chen">Robert Chen</option>
                              <option value="Sarah Jenkins">Sarah Jenkins</option>
                              <option value="Marcus Thorne">Marcus Thorne</option>
                              <option value="Elena Rodriguez">Elena Rodriguez</option>
                              {personnel.map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Personnel Badge -> Opens Personnel Drawer */}
                          <div
                            className="dwl-spec-badge-cell clickable-badge"
                            style={{ width: '90px' }}
                            onClick={() => handleOpenDrawer('personnel', row.id)}
                            title="Click to Assign Personnel in Drawer"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#006C49" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="dwl-spec-badge-num">👤 {row.personnelCount}</span>
                          </div>

                          {/* Tools Icon -> Opens Equipment Drawer */}
                          <div
                            className={`dwl-spec-badge-cell clickable-badge ${hasEquipment ? 'has-data-green' : ''}`}
                            style={{ width: '70px' }}
                            onClick={() => handleOpenDrawer('equipment', row.id)}
                            title="Click to View Equipment Used Drawer"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={hasEquipment ? '#006C49' : '#0B1C30'} strokeWidth="2">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          </div>

                          {/* Inspections Count Badge */}
                          <div className="dwl-spec-badge-cell" style={{ width: '90px' }}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0B1C30" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span className="dwl-spec-badge-num">📄 {row.inspectionsCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bottom Save / Export Action Bar */}
        <div className="dwl-spec-bottom-bar">
          <div className="dwl-spec-bottom-left">
            <button className="dwl-spec-btn-save" onClick={handleSaveAllProgress}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save All Progress</span>
            </button>

            <button className="dwl-spec-btn-export" onClick={handleExportPDF}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Export PDF Log</span>
            </button>
          </div>

          <span className="dwl-spec-timestamp">{saveStatusText}</span>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        className="dwl-spec-fab"
        title="Add New Daily Work Log Task"
        onClick={() => setShowAddModal(true)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* ==========================================================================
         SIDE DRAWER 1: REMARKS AND NOTES (380px)
         ========================================================================== */}
      {activeDrawer === 'remarks' && selectedRow && (
        <aside className="dwl-drawer dwl-remarks-drawer">
          <div className="dwl-drawer-header">
            <div className="dwl-dh-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3>Remarks and Notes</h3>
            </div>
            <button className="dwl-drawer-close" onClick={handleCloseDrawer}>&times;</button>
          </div>

          <div className="dwl-drawer-body">
            {(selectedRow.remarksList || []).map((note) => (
              <div key={note.id} className="dwl-note-card">
                <div className="dwl-nc-header">
                  <span className="dwl-nc-time">{note.timestamp}</span>
                  <div className="dwl-nc-actions">
                    <button className="dwl-nc-btn" title="Edit Note">✏️</button>
                    <button className="dwl-nc-btn" onClick={() => handleDeleteRemarkNote(note.id)} title="Delete Note">🗑️</button>
                  </div>
                </div>

                <div className="dwl-nc-textarea-wrapper">
                  <textarea
                    className="dwl-nc-textarea"
                    value={note.text}
                    onChange={(e) => handleUpdateRemarkNoteText(note.id, e.target.value)}
                    maxLength={500}
                    placeholder="Type in remarks and notes..."
                  />
                  <span className="dwl-nc-counter">{note.text.length}/500</span>
                </div>
              </div>
            ))}

            <button className="dwl-btn-add-more" onClick={handleAddRemarkNote}>
              + Add more Remarks and Notes
            </button>
          </div>

          <div className="dwl-drawer-footer">
            <button className="dwl-btn-drawer-confirm" onClick={handleCloseDrawer}>
              💾 Save Remarks and Notes
            </button>
          </div>
        </aside>
      )}

      {/* ==========================================================================
         SIDE DRAWER 2: ASSIGN PERSONNEL (400px)
         ========================================================================== */}
      {activeDrawer === 'personnel' && selectedRow && (
        <aside className="dwl-drawer dwl-personnel-drawer">
          <div className="dwl-drawer-header blue-bg">
            <div className="dwl-dh-title-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0B1C30" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h3>Assign Personnel</h3>
              </div>
              <span className="dwl-dh-sub">Select team members for this task</span>
            </div>
            <button className="dwl-drawer-close" onClick={handleCloseDrawer}>&times;</button>
          </div>

          <div className="dwl-drawer-search-bar">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#6C7A71" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="dwl-drawer-search-input"
              placeholder="Search employees..."
              value={personnelSearch}
              onChange={(e) => setPersonnelSearch(e.target.value)}
            />
          </div>

          <div className="dwl-drawer-body">
            {/* Work Group Section */}
            <div className="dwl-staff-group">
              <div className="dwl-sg-header">
                <h4>{selectedRow.category || 'General Maintenance'}</h4>
              </div>
              <div className="dwl-sg-list">
                {['John Doe', 'Jane Smith', 'Robert Wilson', 'Sarah Jenkins'].map((name) => {
                  const isChecked = (selectedRow.assignedPersonnel || []).includes(name);
                  if (personnelSearch && !name.toLowerCase().includes(personnelSearch.toLowerCase())) return null;

                  return (
                    <div key={name} className={`dwl-staff-row ${isChecked ? 'checked' : ''}`} onClick={() => handleTogglePersonnelStaff(name)}>
                      <span className="dwl-staff-name">{name}</span>
                      <div className={`dwl-checkbox ${isChecked ? 'active' : ''}`}>
                        {isChecked && <span>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Personnels Section */}
            <div className="dwl-staff-group" style={{ marginTop: '20px' }}>
              <div className="dwl-sg-header">
                <h4>Other Personnels</h4>
              </div>
              <div className="dwl-sg-list">
                {OTHER_EMPLOYEES_DEFAULT.map((name) => {
                  const isChecked = (selectedRow.assignedPersonnel || []).includes(name);
                  if (personnelSearch && !name.toLowerCase().includes(personnelSearch.toLowerCase())) return null;

                  return (
                    <div key={name} className={`dwl-staff-row ${isChecked ? 'checked' : ''}`} onClick={() => handleTogglePersonnelStaff(name)}>
                      <span className="dwl-staff-name">{name}</span>
                      <div className={`dwl-checkbox ${isChecked ? 'active' : ''}`}>
                        {isChecked && <span>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="dwl-drawer-footer">
            <button className="dwl-btn-drawer-confirm" onClick={handleCloseDrawer}>
              ✓ Confirm Assignment ({selectedRow.assignedPersonnel?.length || 0} selected)
            </button>
          </div>
        </aside>
      )}

      {/* ==========================================================================
         SIDE DRAWER 3: EQUIPMENT USED (400px)
         ========================================================================== */}
      {activeDrawer === 'equipment' && selectedRow && (
        <aside className="dwl-drawer dwl-equipment-drawer">
          <div className="dwl-drawer-header">
            <div className="dwl-dh-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <h3>Equipment Used</h3>
            </div>
            <button className="dwl-drawer-close" onClick={handleCloseDrawer}>&times;</button>
          </div>

          <div className="dwl-drawer-body">
            {(selectedRow.equipmentList || []).map((item) => (
              <div key={item.id} className="dwl-eq-card" onClick={() => handleToggleEquipmentChecked(item.id)}>
                <div className="dwl-eq-info">
                  <div className="dwl-eq-field">
                    <span className="dwl-eq-label">NAME OF EQUIPMENT USED</span>
                    <span className="dwl-eq-val bold">{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <div className="dwl-eq-field">
                      <span className="dwl-eq-label">QUANTITY</span>
                      <span className="dwl-eq-val">{item.quantity}</span>
                    </div>
                    <div className="dwl-eq-field">
                      <span className="dwl-eq-label">BORROWER</span>
                      <span className="dwl-eq-val">{item.borrower}</span>
                    </div>
                  </div>
                </div>

                <div className={`dwl-checkbox ${item.checked ? 'active' : ''}`}>
                  {item.checked && <span>✓</span>}
                </div>
              </div>
            ))}

            <button className="dwl-btn-add-more" onClick={handleAddEquipmentItem}>
              + Add more Equipment
            </button>
          </div>

          <div className="dwl-drawer-footer">
            <button className="dwl-btn-drawer-confirm" onClick={handleCloseDrawer}>
              ✓ Confirm Equipment
            </button>
          </div>
        </aside>
      )}

      {/* Add New Entry Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Daily Work Log Entry</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddLogSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Facility / Office Group Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PHYSICAL PLANT OFFICE"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Group Subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Air Conditioning & Ventilation Maintenance"
                    value={newGroupSubTitle}
                    onChange={(e) => setNewGroupSubTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Work Order Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newWONumber}
                      onChange={(e) => setNewWONumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="General Maintenance">General Maintenance</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Work Type</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. HVAC, Electric, Pipework"
                      value={newWorkType}
                      onChange={(e) => setNewWorkType(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Lead</label>
                    <select
                      className="form-control"
                      value={newLead}
                      onChange={(e) => setNewLead(e.target.value)}
                    >
                      <option value="Leadman J. Carter">Leadman J. Carter</option>
                      <option value="Foreman R. Lee">Foreman R. Lee</option>
                      <option value="Foreman M. Garcia">Foreman M. Garcia</option>
                      <option value="Robert Chen">Robert Chen</option>
                      <option value="Sarah Jenkins">Sarah Jenkins</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Type task details..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newCompDate}
                      onChange={(e) => setNewCompDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Personnel</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newPersonnelCount}
                      onChange={(e) => setNewPersonnelCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inspections</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newInspectionsCount}
                      onChange={(e) => setNewInspectionsCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
