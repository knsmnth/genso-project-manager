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
  // General Information form states
  const [code, setCode] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requestingOffice, setRequestingOffice] = useState('');
  const [assetName, setAssetName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // Scope of Works state
  const [tasks, setTasks] = useState<Task[]>([
    {
      type: '',
      remarks: '',
      degreeOfWork: '',
      startDate: getTodayString(),
      endDate: getTodayString()
    }
  ]);

  // Form error validation visual state tracking
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingOrderCode) {
      const order = workOrders.find((o) => o.code === editingOrderCode);
      if (order) {
        setCode(order.code);
        setDateReceived(order.dateReceived || getFormattedTodayDate());
        setRequesterName(order.requesterName || '');
        setRequestingOffice(order.requestingOffice || '');
        setAssetName(order.assetName || '');
        setRoomNo(order.roomNo || order.space || '');
        setWorkTitle(order.workTitle || '');
        setDescription(order.description || '');
        setIsLocked(order.isLocked || false);

        if (order.tasks && order.tasks.length > 0) {
          setTasks(order.tasks);
        } else {
          setTasks([
            {
              type: order.worktype || '',
              remarks: order.scope || '',
              degreeOfWork: 'Standard',
              startDate: order.startDate || getTodayString(),
              endDate: order.endDate || getTodayString()
            }
          ]);
        }
      }
    } else {
      setCode(generateRequestCode());
      setDateReceived(getFormattedTodayDate());
      setRequesterName('');
      setRequestingOffice('');
      setAssetName('');
      setRoomNo('');
      setWorkTitle('');
      setDescription('');
      setIsLocked(false);
      setTasks([
        {
          type: '',
          remarks: '',
          degreeOfWork: '',
          startDate: getTodayString(),
          endDate: getTodayString()
        }
      ]);
    }
    setErrors({});
  }, [editingOrderCode, workOrders]);

  function getTodayString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dd}`;
  }

  function getFormattedTodayDate() {
    const d = new Date();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function generateRequestCode() {
    const randNum = Math.floor(100 + Math.random() * 900);
    return `JR - BHM - 26 - ${randNum}`;
  }

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        type: '',
        remarks: '',
        degreeOfWork: '',
        startDate: getTodayString(),
        endDate: getTodayString()
      }
    ]);
  };

  const handleDeleteTask = (index: number) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskFieldChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  // Perform form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    // Check core general info fields
    if (!requesterName.trim()) { newErrors.requesterName = true; isValid = false; }
    if (!requestingOffice) { newErrors.requestingOffice = true; isValid = false; }
    if (!assetName) { newErrors.assetName = true; isValid = false; }

    // Validate scope tasks
    tasks.forEach((t, i) => {
      if (!t.type) { newErrors[`taskType-${i}`] = true; isValid = false; }
      if (!t.remarks.trim()) { newErrors[`taskRemarks-${i}`] = true; isValid = false; }
    });

    setErrors(newErrors);

    if (!isValid) {
      const errKeys = Object.keys(newErrors);
      if (errKeys.length > 0) {
        const el = document.getElementById(errKeys[0]) || document.querySelector('.has-error');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const primaryTask = tasks[0] || { type: 'General', remarks: 'General Maintenance', startDate: getTodayString(), endDate: getTodayString() };

    const payload: WorkOrder = {
      code,
      assetName: assetName || 'Default Facility',
      space: roomNo || 'Main Facility',
      scope: primaryTask.remarks,
      workgroup: requestingOffice || 'General Maintenance',
      status: 'Pending',
      priority: 'Medium',
      worktype: primaryTask.type || 'General',
      startDate: primaryTask.startDate,
      endDate: primaryTask.endDate,
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      foreman: requesterName || 'System Admin',
      assigned: [],
      description,
      tasks,
      workTitle,
      dateReceived,
      requesterName,
      requestingOffice,
      roomNo,
      isLocked
    };

    onSaveOrder(payload);
  };

  return (
    <section id="view-create-order" className="view-section active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumbs & Header */}
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
            <button className="btn btn-outline" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={handleSubmit}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span>{editingOrderCode ? 'Update Order' : 'Save Work Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Layout */}
      <form id="wireframe-order-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* CARD 1: Work Order General Information */}
        <div className="card">
          <div className="card-header space-between">
            <h3 style={{ margin: 0 }}>Work Order General Information</h3>
            <label className="lock-unlock-toggle">
              <span>LOCK/UNLOCK</span>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
              />
            </label>
          </div>

          <div className="card-body">
            <div className="general-info-wireframe-grid">
              
              {/* LEFT SUB-COLUMN */}
              <div className="wireframe-left-col">
                
                {/* Work Order Number & Date Received row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-field-group">
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                      Work Order Number
                    </label>
                    <input
                      type="text"
                      className="work-order-code-box"
                      value={code}
                      readOnly
                    />
                  </div>

                  <div className="form-field-group">
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                      Date Received
                    </label>
                    <input
                      type="text"
                      className="wireframe-input-manual"
                      placeholder="MMM DD, YYYY"
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                    />
                  </div>
                </div>

                {/* Name of Requester */}
                <div className={`form-field-group ${errors.requesterName ? 'has-error' : ''}`}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                    Name of Requester
                  </label>
                  <input
                    type="text"
                    id="requesterName"
                    className="wireframe-input-manual"
                    placeholder="Type in Name of Requester"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                  />
                  <span className="error-msg">Requester name is required.</span>
                </div>

                {/* Requesting Office */}
                <div className={`form-field-group ${errors.requestingOffice ? 'has-error' : ''}`}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                    Requesting Office
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="requestingOffice"
                      className="wireframe-input-manual"
                      value={requestingOffice}
                      onChange={(e) => setRequestingOffice(e.target.value)}
                    >
                      <option value="" disabled>Type/Choose Requesting Office</option>
                      <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
                      <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
                      <option value="Fabrication Workshop">Fabrication Workshop</option>
                      <option value="Administrative Office">Administrative Office</option>
                      <option value="IT Infrastructure Department">IT Infrastructure Department</option>
                    </select>
                  </div>
                  <span className="error-msg">Please select a requesting office.</span>
                </div>

                {/* Facility / Asset */}
                <div className={`form-field-group ${errors.assetName ? 'has-error' : ''}`}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                    Facility/Asset
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="assetName"
                      className="wireframe-input-manual"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                    >
                      <option value="" disabled>Type/Choose Building Name</option>
                      <option value="Coconut Dorm">Coconut Dorm</option>
                      <option value="DMath Building">DMath Building</option>
                      <option value="CoMed Laboratory">CoMed Laboratory</option>
                      <option value="Engineering Hall">Engineering Hall</option>
                      <option value="Central Administration">Central Administration</option>
                    </select>
                  </div>
                  <span className="error-msg">Please select a facility/building.</span>
                </div>

                {/* Room No. / Name */}
                <div className="form-field-group">
                  <input
                    type="text"
                    className="wireframe-input-manual"
                    placeholder="• Room No./Name"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                  />
                </div>

              </div>

              {/* RIGHT SUB-COLUMN */}
              <div className="wireframe-right-col">
                
                {/* Work Title */}
                <div className="form-field-group">
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                    Work Title
                  </label>
                  <input
                    type="text"
                    className="wireframe-input-manual"
                    placeholder="Type in Work Title"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                  />
                </div>

                {/* Work Details and Description */}
                <div className="form-field-group" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-header)' }}>
                    Work Details and Description
                  </label>
                  <textarea
                    className="wireframe-input-manual"
                    placeholder="Type in Work order request details and information"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ flex: 1, minHeight: '140px', resize: 'vertical' }}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Scope of Works */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Scope of Works</h3>
          </div>

          <div className="card-body" style={{ overflowX: 'auto' }}>
            <table className="scope-wireframe-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th style={{ width: '180px' }}>Work Type</th>
                  <th>Work Description</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Remarks</th>
                  <th style={{ width: '160px' }}>Degree of Work</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Start and Completion Dates</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    {/* Drag Handle Icon */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="drag-handle" title="Reorder">
                        =
                      </div>
                    </td>

                    {/* Work Type Select */}
                    <td>
                      <div className={`select-wrapper ${errors[`taskType-${index}`] ? 'has-error' : ''}`}>
                        <select
                          className="wireframe-input-manual"
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
                          <option value="General Maintenance">General Maintenance</option>
                        </select>
                      </div>
                    </td>

                    {/* Work Description Input */}
                    <td>
                      <div className={errors[`taskRemarks-${index}`] ? 'has-error' : ''}>
                        <input
                          type="text"
                          className="wireframe-input-manual"
                          placeholder="Type in Scope of Work Description"
                          value={task.remarks}
                          onChange={(e) => handleTaskFieldChange(index, 'remarks', e.target.value)}
                        />
                      </div>
                    </td>

                    {/* Remarks Comment Bubble Icon */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="remarks-btn"
                        title="Add Task Remarks"
                        onClick={() => alert(`Remarks for task ${index + 1}: ${task.remarks || 'None'}`)}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </td>

                    {/* Degree of Work Select */}
                    <td>
                      <div className="select-wrapper">
                        <select
                          className="wireframe-input-manual"
                          value={task.degreeOfWork || ''}
                          onChange={(e) => handleTaskFieldChange(index, 'degreeOfWork', e.target.value)}
                        >
                          <option value="" disabled>Select Degree...</option>
                          <option value="Minor">Minor</option>
                          <option value="Standard">Standard</option>
                          <option value="Major">Major</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </td>

                    {/* Start and Completion Dates (Non-Editable Placeholders) */}
                    <td>
                      <div className="read-only-date-stack">
                        <div className="date-placeholder-box" title="Start date set after saving">
                          MMM DD, YY
                        </div>
                        <div className="date-placeholder-box" title="Completion date set after saving">
                          MMM DD, YY
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add More Scope Button */}
            <button type="button" className="add-scope-btn" onClick={handleAddTask}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span>Add more Scope of Work</span>
            </button>
          </div>
        </div>

      </form>
    </section>
  );
};

