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
  // Filter and Toggle States
  const [showFilters, setShowFilters] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [spaceFilter, setSpaceFilter] = useState('all');
  const [workgroupFilter, setWorkgroupFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('Medium'); // Medium selected by default as in design photo
  const [localSearch, setLocalSearch] = useState('');

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

  const handlePriorityClick = (prio: string) => {
    if (priorityFilter === prio) {
      setPriorityFilter('all'); // Deselect priority filter entirely
    } else {
      setPriorityFilter(prio);
    }
  };

  // Perform filtration based on local search bar and drop-down selectors
  const filtered = workOrders.filter((o) => {
    const q = (localSearch || searchQuery || '').toLowerCase();
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

  // Calculate live date and active focus item
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const inProgressOrders = workOrders.filter(
    (o) => o.status.toLowerCase() === 'in progress'
  );
  
  const activeFocusText = inProgressOrders.length > 0
    ? `Focus: ${inProgressOrders[0].code} at ${inProgressOrders[0].assetName} (${inProgressOrders.length} active)`
    : "No active projects in progress";

  return (
    <section id="view-work-orders" className="view-section active" style={{ display: 'flex' }}>
      {/* Header Info */}
      <div className="view-header-row">
        <div>
          <h1 className="view-main-title">Work Order Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <p className="view-main-subtitle" style={{ margin: 0 }}>
              Review and track all active maintenance tasks across facilities.
            </p>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-text-placeholder)' }}></span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {activeFocusText}
            </span>
          </div>
        </div>
        
        <div className="view-header-actions">
          <div className="date-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{currentDate}</span>
          </div>

          <button className="btn btn-outline-sm" id="btn-export-csv" onClick={() => alert('Export CSV completed.')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export CSV</span>
          </button>
          
          <button
            className={`btn btn-outline-sm ${showFilters ? 'active' : ''}`}
            id="btn-advanced-filters"
            onClick={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: showFilters ? 'var(--color-primary-light)' : 'transparent', borderColor: showFilters ? 'var(--color-primary)' : '' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={showFilters ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2">
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
            <span style={{ color: showFilters ? 'var(--color-primary)' : 'inherit' }}>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Togglable Sub Filter Panel Card */}
      {showFilters && (
        <div className="card sub-filter-card" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="card-body flex-row-wrap">
            <div className="filter-input-group">
              <label htmlFor="filter-date">Date</label>
              <input type="text" id="filter-date" defaultValue={currentDate} className="filter-text-input" readOnly />
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
                    onClick={() => handlePriorityClick(prio)}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="card table-card" style={{ minWidth: 0 }}>
        {/* Table Card Header with Direct Search Input */}
        <div className="card-header space-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '15px' }}>Active Orders</h3>
          <div className="personnel-search-box" style={{ margin: 0, height: '34px', width: '260px' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search code, asset, or scope..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{ padding: '0 8px 0 32px', fontSize: '12px' }}
            />
          </div>
        </div>

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
