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
    <section id="view-create-order" className="view-section active create-order-container">
      {/* Breadcrumbs & Header Row */}
      <div className="create-order-header-row">
        <div className="create-order-title-group">
          <nav className="create-order-nav" aria-label="Breadcrumbs">
            <span className="create-order-nav-link" onClick={onCancel}>
              Work Orders
            </span>
            <span className="create-order-nav-sep">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="create-order-nav-current">
              {editingOrderCode ? 'Edit Work Order' : 'New Work Order'}
            </span>
          </nav>
          <h2 className="create-order-heading">
            {editingOrderCode ? 'Edit Work Order' : 'Create Work Order'}
          </h2>
        </div>

        <div className="create-order-actions">
          <button className="btn-modern-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-modern-save" type="button" onClick={handleSubmit}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{editingOrderCode ? 'Update Order' : 'Save Work Order'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Content Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        
        {/* CARD 1: Work Order General Information */}
        <div className="modern-section-card">
          <div className="modern-card-header">
            <div className="modern-heading-group">
              <span className="modern-heading-bar"></span>
              <h3 className="modern-heading-text">Work Order General Information</h3>
            </div>
            <label className="modern-lock-badge">
              <span className="modern-lock-text">LOCK/UNLOCK</span>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
              />
            </label>
          </div>

          <div className="modern-general-info-grid">
            {/* Left Column */}
            <div className="modern-left-col">
              
              {/* Row 1: Work Order Number & Date Received */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="modern-field-group">
                  <label className="modern-field-label">WORK ORDER NUMBER</label>
                  <input
                    type="text"
                    className="modern-input-code"
                    value={code}
                    readOnly
                  />
                </div>

                <div className="modern-field-group">
                  <label className="modern-field-label">DATE RECEIVED</label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="MMM DD, YYYY"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Name of Requester */}
              <div className={`modern-field-group ${errors.requesterName ? 'has-error' : ''}`}>
                <label className="modern-field-label">NAME OF REQUESTER</label>
                <input
                  type="text"
                  id="requesterName"
                  className="modern-input"
                  placeholder="Type in Name of Requester"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                />
                {errors.requesterName && <span className="error-msg">Requester name is required.</span>}
              </div>

              {/* Row 3: Requesting Office */}
              <div className={`modern-field-group ${errors.requestingOffice ? 'has-error' : ''}`}>
                <label className="modern-field-label">REQUESTING OFFICE</label>
                <select
                  id="requestingOffice"
                  className="modern-select"
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
                {errors.requestingOffice && <span className="error-msg">Please select a requesting office.</span>}
              </div>

              {/* Row 4: Facility/Asset */}
              <div className={`modern-field-group ${errors.assetName ? 'has-error' : ''}`}>
                <label className="modern-field-label">FACILITY/ASSET</label>
                <select
                  id="assetName"
                  className="modern-select"
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
                {errors.assetName && <span className="error-msg">Please select a facility/building.</span>}
              </div>

              {/* Row 5: Room No./Name */}
              <div className="modern-field-group">
                <label className="modern-field-label">ROOM NO./NAME</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="Room No./Name"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
              </div>

            </div>

            {/* Right Column */}
            <div className="modern-right-col">
              
              {/* Row 1: Work Title */}
              <div className="modern-field-group">
                <label className="modern-field-label">WORK TITLE</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="Type in Work Title"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                />
              </div>

              {/* Row 2: Work Details and Description */}
              <div className="modern-field-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="modern-field-label">WORK DETAILS AND DESCRIPTION</label>
                <textarea
                  className="modern-textarea"
                  placeholder="Type in Work order request details and information"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

            </div>
          </div>
        </div>

        {/* CARD 2: Scope of Works */}
        <div className="modern-section-card">
          <div className="modern-card-header">
            <div className="modern-heading-group">
              <span className="modern-heading-bar"></span>
              <h3 className="modern-heading-text">Scope of Works</h3>
            </div>
          </div>

          <div className="modern-scope-table-container">
            <table className="modern-scope-table">
              <thead>
                <tr>
                  <th style={{ width: '36px', textAlign: 'center' }}></th>
                  <th style={{ width: '170px' }}>WORK TYPE</th>
                  <th>WORK DESCRIPTION</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>REMARKS</th>
                  <th style={{ width: '150px' }}>DEGREE OF WORK</th>
                  <th style={{ width: '210px' }}>START & COMPLETION DATES</th>
                  <th style={{ width: '40px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    {/* Drag Handle Icon */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="drag-handle" title="Reorder row" style={{ background: 'transparent', color: 'rgba(187, 202, 191, 0.6)', cursor: 'grab' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <circle cx="8" cy="6" r="2" />
                          <circle cx="16" cy="6" r="2" />
                          <circle cx="8" cy="12" r="2" />
                          <circle cx="16" cy="12" r="2" />
                          <circle cx="8" cy="18" r="2" />
                          <circle cx="16" cy="18" r="2" />
                        </svg>
                      </div>
                    </td>

                    {/* Work Type Select */}
                    <td>
                      <select
                        className={`modern-table-select ${errors[`taskType-${index}`] ? 'has-error' : ''}`}
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
                    </td>

                    {/* Work Description Input */}
                    <td>
                      <input
                        type="text"
                        className={`modern-table-input ${errors[`taskRemarks-${index}`] ? 'has-error' : ''}`}
                        placeholder="Scope details..."
                        value={task.remarks}
                        onChange={(e) => handleTaskFieldChange(index, 'remarks', e.target.value)}
                      />
                    </td>

                    {/* Remarks Comment Bubble Button */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="remarks-btn"
                        title="Add Task Remarks"
                        onClick={() => alert(`Remarks for task ${index + 1}: ${task.remarks || 'None'}`)}
                        style={{
                          margin: '0 auto',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          border: '1px solid #BBCABF',
                          color: '#6B7280',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </td>

                    {/* Degree of Work Select */}
                    <td>
                      <select
                        className="modern-table-select"
                        value={task.degreeOfWork || ''}
                        onChange={(e) => handleTaskFieldChange(index, 'degreeOfWork', e.target.value)}
                      >
                        <option value="" disabled>Select Degree...</option>
                        <option value="Minor">Minor</option>
                        <option value="Standard">Standard</option>
                        <option value="Major">Major</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </td>

                    {/* Start and Completion Dates Inputs */}
                    <td>
                      <div className="modern-date-input-group">
                        <div className="modern-date-field">
                          <span className="modern-date-label">START DATE</span>
                          <input
                            type="date"
                            className="modern-date-input"
                            value={task.startDate || ''}
                            onChange={(e) => handleTaskFieldChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="modern-date-field">
                          <span className="modern-date-label">END DATE</span>
                          <input
                            type="date"
                            className="modern-date-input"
                            value={task.endDate || ''}
                            onChange={(e) => handleTaskFieldChange(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Delete Task Row Button */}
                    <td style={{ textAlign: 'center' }}>
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          className="remarks-btn"
                          title="Remove Task"
                          onClick={() => handleDeleteTask(index)}
                          style={{
                            margin: '0 auto',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add More Scope Button */}
            <button type="button" className="btn-modern-add-scope" onClick={handleAddTask}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#006C49" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="btn-modern-add-scope-text">Add more Scope of Work</span>
            </button>
          </div>
        </div>

      </form>
    </section>
  );
};


