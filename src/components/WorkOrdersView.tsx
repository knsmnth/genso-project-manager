import React, { useState } from 'react';
import { WorkOrder } from '../types';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  searchQuery: string;
  onSelectOrder: (code: string) => void;
  onEditOrder: (code: string) => void;
  onDeleteOrder: (code: string) => void;
  onCreateOrder: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  searchQuery,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  onCreateOrder
}) => {
  // Filter states
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [spaceFilter, setSpaceFilter] = useState('all');
  const [workgroupFilter, setWorkgroupFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('Medium'); // Medium selected by default as in design photo
  
  // Track open dropdown menu row code
  const [openDropdownCode, setOpenDropdownCode] = useState<string | null>(null);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'inprogress';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      case 'urgent':
        return 'urgent';
      case 'on hold':
        return 'onhold';
      default:
        return 'draft';
    }
  };

  // Perform filtration
  const filtered = workOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.code.toLowerCase().includes(q) ||
      o.assetName.toLowerCase().includes(q) ||
      o.scope.toLowerCase().includes(q);

    const matchesFacility = facilityFilter === 'all' || o.assetName === facilityFilter;
    const matchesSpace = spaceFilter === 'all' || o.space === spaceFilter;
    const matchesWorkgroup = workgroupFilter === 'all' || o.workgroup === workgroupFilter;
    const matchesPriority = priorityFilter === 'all' || o.priority === priorityFilter;

    return matchesSearch && matchesFacility && matchesSpace && matchesWorkgroup && matchesPriority;
  });

  return (
    <section id="view-work-orders" className="view-section active" style={{ display: 'flex' }}>
      <div className="view-header-row">
        <div>
          <h1 className="view-main-title">Work Order Management</h1>
          <p className="view-main-subtitle">Review and track all active maintenance tasks across facilities.</p>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-outline-sm" id="btn-export-csv">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button className="btn btn-outline-sm" id="btn-advanced-filters">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Sub Filter Panel Card */}
      <div className="card sub-filter-card">
        <div className="card-body flex-row-wrap">
          <div className="filter-input-group">
            <label htmlFor="filter-date">Date</label>
            <input type="text" id="filter-date" defaultValue="Today's Date" className="filter-text-input" readOnly />
          </div>

          <div className="filter-input-group">
            <label htmlFor="filter-facility">Facility</label>
            <select
              id="filter-facility"
              className="filter-select"
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
            >
              <option value="all">All Facilities</option>
              <option value="Coconut Dorm">Coconut Dorm</option>
              <option value="DMath">DMath</option>
              <option value="CoMed Laboratory">CoMed Laboratory</option>
              <option value="3F Academic Building">3F Academic Building</option>
              <option value="PNB">PNB</option>
            </select>
          </div>

          <div className="filter-input-group">
            <label htmlFor="filter-space">Space / Room</label>
            <select
              id="filter-space"
              className="filter-select"
              value={spaceFilter}
              onChange={(e) => setSpaceFilter(e.target.value)}
            >
              <option value="all">All Spaces</option>
              <option value="Room 21">Room 21</option>
              <option value="Roof Deck B-4">Roof Deck B-4</option>
              <option value="Lab 101">Lab 101</option>
              <option value="3F AB">3F AB</option>
              <option value="PNB Upper Campus">PNB Upper Campus</option>
            </select>
          </div>

          <div className="filter-input-group">
            <label htmlFor="filter-workgroup">Workgroup</label>
            <select
              id="filter-workgroup"
              className="filter-select"
              value={workgroupFilter}
              onChange={(e) => setWorkgroupFilter(e.target.value)}
            >
              <option value="all">All Groups</option>
              <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
              <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
              <option value="Fabrication Workshop">Fabrication Workshop</option>
            </select>
          </div>

          <div className="filter-input-group shrink">
            <label>Priority</label>
            <div className="filter-priority-btns">
              {['Low', 'Medium', 'High'].map((prio) => (
                <button
                  key={prio}
                  type="button"
                  className={`prio-btn ${priorityFilter === prio ? 'active' : ''}`}
                  onClick={() => setPriorityFilter(prio)}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card table-card" style={{ minWidth: 0 }}>
        <div className="card-body no-padding">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>REQ. CODE</th>
                  <th>ASSET / FACILITY</th>
                  <th>ON-GOING SCOPE</th>
                  <th>ASSIGNED WORKGROUP</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                      No work orders match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.code} onClick={() => onSelectOrder(o.code)} style={{ cursor: 'pointer' }}>
                      <td className="cell-primary" style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                        {o.code}
                      </td>
                      <td>
                        <span className="cell-primary">{o.assetName}</span>
                        <span className="cell-subtext">{o.space}</span>
                      </td>
                      <td>{o.scope}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          <span>{o.workgroup}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-status-pill ${getStatusClass(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td
                        className="actions-cell"
                        style={{ position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="icon-btn-action-trigger"
                          onClick={() => setOpenDropdownCode(openDropdownCode === o.code ? null : o.code)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '16px' }}
                        >
                          &#8942;
                        </button>
                        
                        {openDropdownCode === o.code && (
                          <div
                            className="row-dropdown-menu"
                            style={{
                              display: 'block',
                              position: 'absolute',
                              right: '10px',
                              background: '#fff',
                              border: '1px solid var(--color-border)',
                              boxShadow: 'var(--shadow-md)',
                              borderRadius: '4px',
                              zIndex: 10,
                              minWidth: '100px'
                            }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setOpenDropdownCode(null);
                                onEditOrder(o.code);
                              }}
                              style={{ display: 'block', width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setOpenDropdownCode(null);
                                if (confirm(`Are you sure you want to delete ${o.code}?`)) {
                                  onDeleteOrder(o.code);
                                }
                              }}
                              style={{ display: 'block', width: '100%', border: 'none', background: 'none', padding: '8px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--color-error)', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Footer */}
        <div className="table-footer">
          <span className="table-counts">Showing 1 to {filtered.length} of {filtered.length} work orders</span>
          <div className="pagination-controls">
            <button className="pag-btn" disabled>&lt;</button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn">2</button>
            <button className="pag-btn">3</button>
            <span className="pag-dots">...</span>
            <button className="pag-btn">25</button>
            <button className="pag-btn">&gt;</button>
          </div>
        </div>
      </div>
    </section>
  );
};
