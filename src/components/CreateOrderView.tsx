import React, { useState, useEffect } from 'react';
import { WorkOrder, Task, Person } from '../types';

interface CreateOrderViewProps {
  editingOrderCode: string | null;
  workOrders: WorkOrder[];
  personnel: Person[];
  onSaveOrder: (data: WorkOrder) => void;
  onCancel: () => void;
}

export const CreateOrderView: React.FC<CreateOrderViewProps> = ({
  editingOrderCode,
  workOrders,
  personnel,
  onSaveOrder,
  onCancel
}) => {
  // Generated or Editing Code
  const [code, setCode] = useState('');

  // Core Form states
  const [assetName, setAssetName] = useState('');
  const [status, setStatus] = useState('');
  const [space, setSpace] = useState('');
  const [description, setDescription] = useState('');
  const [workgroup, setWorkgroup] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [foreman, setForeman] = useState('');
  const [assigned, setAssigned] = useState<string[]>([]);

  // Scope of Work tasks state
  const [tasks, setTasks] = useState<Task[]>([
    { type: '', remarks: '', startDate: getTodayString(), endDate: getTodayString() }
  ]);

  // Personnel filter state
  const [personnelSearch, setPersonnelSearch] = useState('');

  // Form error validation visual state tracking
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingOrderCode) {
      const order = workOrders.find((o) => o.code === editingOrderCode);
      if (order) {
        setCode(order.code);
        setAssetName(order.assetName);
        setStatus(order.status);
        setSpace(order.space);
        setDescription(order.description);
        setWorkgroup(order.workgroup);
        setPriority(order.priority);
        setForeman(order.foreman || '');
        setAssigned(order.assigned || []);

        if (order.tasks && order.tasks.length > 0) {
          setTasks(order.tasks);
        } else {
          // Fallback from primary values
          setTasks([
            {
              type: order.worktype || '',
              remarks: order.scope || '',
              startDate: order.startDate || getTodayString(),
              endDate: order.endDate || getTodayString()
            }
          ]);
        }
      }
    } else {
      setCode(generateRequestCode());
      setAssetName('');
      setStatus('');
      setSpace('');
      setDescription('');
      setWorkgroup('');
      setPriority('Medium');
      setForeman('');
      setAssigned([]);
      setTasks([{ type: '', remarks: '', startDate: getTodayString(), endDate: getTodayString() }]);
    }
    setErrors({});
  }, [editingOrderCode, workOrders]);

  function getTodayString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dd}`;
  }

  function generateRequestCode() {
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `WO-${year}-${randNum}-${letter}`;
  }

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      { type: '', remarks: '', startDate: getTodayString(), endDate: getTodayString() }
    ]);
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskFieldChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handlePersonnelCheckToggle = (name: string) => {
    if (assigned.includes(name)) {
      setAssigned(assigned.filter((n) => n !== name));
    } else {
      setAssigned([...assigned, name]);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColorClass = (name: string) => {
    const parts = name.split(' ');
    const code = (parts[0] || 'A')[0].toLowerCase();
    if ('abcdef'.includes(code)) return 'rc';
    if ('ghijklm'.includes(code)) return 'am';
    if ('nopqrst'.includes(code)) return 'sk';
    return 'jd';
  };

  // Perform form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    // Check core fields
    if (!assetName.trim()) { newErrors.assetName = true; isValid = false; }
    if (!status) { newErrors.status = true; isValid = false; }
    if (!space) { newErrors.space = true; isValid = false; }
    if (!workgroup) { newErrors.workgroup = true; isValid = false; }
    if (!foreman) { newErrors.foreman = true; isValid = false; }

    // Validate dynamic tasks
    tasks.forEach((t, i) => {
      if (!t.type) { newErrors[`taskType-${i}`] = true; isValid = false; }
      if (!t.remarks.trim()) { newErrors[`taskRemarks-${i}`] = true; isValid = false; }
      if (!t.startDate) { newErrors[`taskStart-${i}`] = true; isValid = false; }
      if (!t.endDate) { newErrors[`taskEnd-${i}`] = true; isValid = false; }

      if (t.startDate && t.endDate && new Date(t.startDate) > new Date(t.endDate)) {
        newErrors[`taskEnd-${i}`] = true;
        isValid = false;
        alert(`Task #${i + 1}: Estimated Completion Date cannot be before the Start Date.`);
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      // Find first error block
      const errKeys = Object.keys(newErrors);
      if (errKeys.length > 0) {
        const el = document.getElementById(errKeys[0]) || document.querySelector('.has-error');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Extrapolate primary scopes
    const primaryTask = tasks[0] || { type: 'General', remarks: 'General Maintenance', startDate: getTodayString(), endDate: getTodayString() };

    const payload: WorkOrder = {
      code,
      assetName,
      space,
      scope: primaryTask.remarks,
      workgroup,
      status,
      priority,
      worktype: primaryTask.type,
      startDate: primaryTask.startDate,
      endDate: primaryTask.endDate,
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      foreman,
      assigned,
      description,
      tasks
    };

    onSaveOrder(payload);
  };

  const filteredPersonnel = personnel.filter((p) => {
    const q = personnelSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q);
  });

  return (
    <section id="view-create-order" className="view-section active" style={{ display: 'flex' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs-container">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <span className="breadcrumb-link" onClick={onCancel} style={{ cursor: 'pointer' }}>
            Work Orders
          </span>
          <svg className="breadcrumb-arrow" viewBox="0 0 24 24" width="12" height="12">
            <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="breadcrumb-current">
            {editingOrderCode ? 'Edit Work Order' : 'New Work Order'}
          </span>
        </nav>

        <div className="header-action-row">
          <h2 className="form-title">{editingOrderCode ? 'Edit Work Order' : 'Create Work Order'}</h2>
          <div className="form-action-buttons">
            <button className="btn btn-outline" onClick={(e) => { e.preventDefault(); onCancel(); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span>{editingOrderCode ? 'Update Work Order' : 'Create Work Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <form id="expanded-order-form" className="form-layout" onSubmit={handleSubmit}>
        {/* Left Column */}
        <div className="form-left-col">
          {/* General Information Card */}
          <div className="card card-general">
            <div className="card-header">
              <div className="card-title-wrapper">
                <svg className="card-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <h3>General Information</h3>
              </div>
            </div>

            <div className="card-body general-info-grid">
              {/* Request Code */}
              <div className="form-field-group code-group">
                <label>Request Code</label>
                <input type="text" className="input-readonly" value={code} readOnly />
                <span className="field-hint">Unique system-generated identifier.</span>
              </div>

              {/* Asset Name */}
              <div className={`form-field-group ${errors.assetName ? 'has-error' : ''}`}>
                <label htmlFor="exp-asset-name">Asset/ Facility Name</label>
                <input
                  type="text"
                  id="exp-asset-name"
                  placeholder="Project Name..."
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
                <span className="error-msg">Asset/facility name is required.</span>
              </div>

              {/* Status */}
              <div className={`form-field-group ${errors.status ? 'has-error' : ''}`}>
                <label htmlFor="exp-work-status">Work Status</label>
                <div className="select-wrapper">
                  <select
                    id="exp-work-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="" disabled>Select Status...</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <span className="error-msg">Please select a work status.</span>
              </div>

              {/* Space */}
              <div className={`form-field-group ${errors.space ? 'has-error' : ''}`}>
                <label htmlFor="exp-room-space">Room / Space Name</label>
                <div className="select-wrapper">
                  <select
                    id="exp-room-space"
                    value={space}
                    onChange={(e) => setSpace(e.target.value)}
                  >
                    <option value="" disabled>Select Space...</option>
                    <option value="Room 21">Room 21</option>
                    <option value="Roof Deck B-4">Roof Deck B-4</option>
                    <option value="Lab 101">Lab 101</option>
                    <option value="3F AB">3F AB</option>
                    <option value="PNB Upper Campus">PNB Upper Campus</option>
                  </select>
                </div>
                <span className="error-msg">Please select a space.</span>
              </div>

              {/* Description */}
              <div className="form-field-group desc-group">
                <label htmlFor="exp-work-desc">Work Description</label>
                <textarea
                  id="exp-work-desc"
                  placeholder="Detailed description of the issue or requirement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Scope of Work Card */}
          <div className="card card-scope">
            <div className="card-header space-between">
              <div className="card-title-wrapper">
                <svg className="card-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <h3>Scope of Work</h3>
              </div>
              <button type="button" className="btn-text" onClick={handleAddTask}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span>Add Task</span>
              </button>
            </div>

            <div className="card-body">
              <div className="scope-tasks-list">
                {tasks.map((task, index) => (
                  <div key={index} className="task-item">
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        className="task-item-delete"
                        onClick={() => handleDeleteTask(index)}
                        aria-label="Delete Task"
                      >
                        &times;
                      </button>
                    )}
                    <div className="task-fields-grid">
                      {/* Work Type */}
                      <div className={`form-field-group ${errors[`taskType-${index}`] ? 'has-error' : ''}`}>
                        <label>Work Type</label>
                        <div className="select-wrapper">
                          <select
                            className="task-type"
                            value={task.type}
                            onChange={(e) => handleTaskFieldChange(index, 'type', e.target.value)}
                          >
                            <option value="" disabled>Select Type...</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Carpentry">Carpentry</option>
                            <option value="Masonry">Masonry</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className={`form-field-group desc-group ${errors[`taskRemarks-${index}`] ? 'has-error' : ''}`}>
                        <label>Remarks/Scope Description</label>
                        <input
                          type="text"
                          className="task-remarks"
                          placeholder="Specify task details..."
                          value={task.remarks}
                          onChange={(e) => handleTaskFieldChange(index, 'remarks', e.target.value)}
                        />
                      </div>

                      {/* Start Date */}
                      <div className={`form-field-group date-group ${errors[`taskStart-${index}`] ? 'has-error' : ''}`}>
                        <label>Start Date</label>
                        <div className="date-input-wrapper">
                          <input
                            type="date"
                            className="task-start"
                            value={task.startDate}
                            onChange={(e) => handleTaskFieldChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Completion Date */}
                      <div className={`form-field-group date-group ${errors[`taskEnd-${index}`] ? 'has-error' : ''}`}>
                        <label>Estimated Completion</label>
                        <div className="date-input-wrapper">
                          <input
                            type="date"
                            className="task-end"
                            value={task.endDate}
                            onChange={(e) => handleTaskFieldChange(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="empty-tasks-placeholder" onClick={handleAddTask}>
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  <span>No tasks added yet. Click "+ Add Task" or here to add scope items.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="form-right-col">
          {/* Card 1: Assignment Card */}
          <div className="card card-assign">
            <div className="card-header">
              <div className="card-title-wrapper">
                <svg className="card-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                <h3>Assignment</h3>
              </div>
            </div>

            <div className="card-body assignment-details">
              <div className={`form-field-group ${errors.workgroup ? 'has-error' : ''}`}>
                <label htmlFor="exp-assigned-workgroup">Assigned Workgroup</label>
                <div className="select-wrapper">
                  <select
                    id="exp-assigned-workgroup"
                    value={workgroup}
                    onChange={(e) => setWorkgroup(e.target.value)}
                  >
                    <option value="" disabled>Select Workgroup...</option>
                    <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
                    <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
                    <option value="Fabrication Workshop">Fabrication Workshop</option>
                  </select>
                </div>
                <span className="error-msg">Please select an assigned workgroup.</span>
              </div>

              <div className="form-field-group">
                <label>Priority Level</label>
                <div className="priority-pills">
                  {['Low', 'Medium', 'High'].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      id={`exp-priority-${prio.toLowerCase()}`}
                      className={`priority-pill ${priority === prio ? 'active' : ''}`}
                      onClick={() => setPriority(prio)}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Assign Foreman / Leadman Card */}
          <div className="card card-foreman">
            <div className="card-header">
              <div className="card-title-wrapper">
                <svg className="card-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h3>Assign Foreman / Leadman</h3>
              </div>
            </div>

            <div className="card-body">
              <div className={`form-field-group ${errors.foreman ? 'has-error' : ''}`}>
                <label htmlFor="exp-foreman-select">Lead Supervisor</label>
                <div className="select-wrapper">
                  <select
                    id="exp-foreman-select"
                    value={foreman}
                    onChange={(e) => setForeman(e.target.value)}
                  >
                    <option value="" disabled>Select Lead...</option>
                    <option value="Robert Chen">Robert Chen</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Marcus Thorne">Marcus Thorne</option>
                    <option value="Elena Rodriguez">Elena Rodriguez</option>
                  </select>
                </div>
                <span className="error-msg">Please select a supervisor.</span>
              </div>
            </div>
          </div>

          {/* Card 3: Assign Personnel checklist Card */}
          <div className="card card-personnel">
            <div className="card-header">
              <div className="card-title-wrapper">
                <svg className="card-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <h3>Assign Personnel</h3>
              </div>
            </div>

            <div className="card-body flex-col-gap">
              <div className="personnel-search-box">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter personnel..."
                  value={personnelSearch}
                  onChange={(e) => setPersonnelSearch(e.target.value)}
                />
              </div>

              <div className="personnel-checklist">
                {filteredPersonnel.map((p) => {
                  const isChecked = assigned.includes(p.name);
                  return (
                    <div
                      key={p.name}
                      className={`personnel-row ${isChecked ? 'checked' : ''}`}
                      onClick={() => handlePersonnelCheckToggle(p.name)}
                    >
                      <div className="personnel-row-left">
                        <div className={`initials-avatar ${getAvatarColorClass(p.name)}`}>
                          {getInitials(p.name)}
                        </div>
                        <div className="personnel-meta">
                          <span className="personnel-name">{p.name}</span>
                          <span className="personnel-role">{p.role}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled via row click
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
