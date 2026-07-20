import React from 'react';
import { WorkOrder } from '../types';

interface DashboardViewProps {
  workOrders: WorkOrder[];
  onSelectOrder: (code: string) => void;
  onViewAll: () => void;
  teamsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workOrders,
  onSelectOrder,
  onViewAll,
  teamsCount
}) => {
  // Statistics calculations
  const total = workOrders.length;
  let pending = 0;
  let inProgress = 0;
  let urgent = 0;

  workOrders.forEach((o) => {
    const status = o.status.toLowerCase();
    if (status === 'pending') pending++;
    else if (status === 'in progress') inProgress++;

    if (status === 'urgent' || o.priority.toLowerCase() === 'high') urgent++;
  });

  const recent = workOrders.slice(0, 4);

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

  return (
    <section id="view-dashboard" className="view-section active" style={{ display: 'flex' }}>
      <div className="view-header-row">
        <div>
          <h1 className="view-main-title">Operational Overview</h1>
          <p class="view-main-subtitle">Real-time management of facility infrastructure and personnel.</p>
        </div>
        <div className="view-header-actions">
          <div className="date-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span id="dashboard-current-date">Aug 24, 2024</span>
          </div>
          <button className="btn btn-outline-sm" id="btn-dashboard-filters">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Orders */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-box green">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="metric-trend green">+12%</span>
          </div>
          <span className="metric-label">TOTAL WORK ORDERS</span>
          <span className="metric-value">{total}</span>
          <div className="metric-progress-bar">
            <div className="metric-progress-fill" style={{ width: '76%' }}></div>
          </div>
        </div>

        {/* Active Teams */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-box yellow">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="metric-trend-sub">8 On-Duty</span>
          </div>
          <span className="metric-label">ACTIVE TEAMS</span>
          <span className="metric-value">{teamsCount}</span>
          <div className="metric-avatars-row">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40&q=80" alt="Avatar" />
            <div className="avatar-more">+6</div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-box blue">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="metric-trend red">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              8
            </span>
          </div>
          <span className="metric-label">PENDING REQUESTS</span>
          <span className="metric-value">{pending}</span>
          <span className="metric-note red">since last hour</span>
        </div>

        {/* Urgent Alerts */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-box red">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="badge badge-urgent-pill">URGENT</span>
          </div>
          <span className="metric-label">URGENT ALERTS</span>
          <span className="metric-value">{urgent}</span>
          <span className="metric-note">Requires immediate attention</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="dashboard-split-layout">
        {/* Left column: Recent Activity */}
        <div className="card main-activity-card" style={{ minWidth: 0 }}>
          <div className="card-header space-between">
            <h3>Recent Activity</h3>
            <a href="#" className="btn-text-link" onClick={(e) => { e.preventDefault(); onViewAll(); }}>
              View All History
            </a>
          </div>
          <div className="card-body no-padding">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ACTIVITY</th>
                    <th>GROUP</th>
                    <th>STATUS</th>
                    <th>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    recent.map((o) => (
                      <tr key={o.code} onClick={() => onSelectOrder(o.code)} style={{ cursor: 'pointer' }}>
                        <td>
                          <span className="cell-primary">{o.assetName}</span>
                          <span className="cell-subtext">{o.space}</span>
                        </td>
                        <td>{o.workgroup}</td>
                        <td>
                          <span className={`badge-status-pill ${getStatusClass(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>10:45 AM</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Team Status */}
        <div className="card team-status-card">
          <div className="card-header">
            <h3>Team Status</h3>
          </div>
          <div className="card-body">
            <div className="team-status-list">
              <div className="team-status-row">
                <div className="team-status-icon-box green">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <div className="team-status-info">
                  <span className="team-status-name">Carpentry Works</span>
                  <span className="team-status-desc">6 Active Members</span>
                </div>
                <span className="badge-status-dot green">ON-DUTY</span>
              </div>

              <div className="team-status-row">
                <div className="team-status-icon-box grey">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="team-status-info">
                  <span class="team-status-name">Electrical Systems</span>
                  <span className="team-status-desc">4 Active Members</span>
                </div>
                <span className="badge-status-dot grey">OFF-DUTY</span>
              </div>

              <div className="team-status-row">
                <div className="team-status-icon-box orange">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <div className="team-status-info">
                  <span className="team-status-name">Plumbing Squad</span>
                  <span className="team-status-desc">Deploying...</span>
                </div>
                <span className="badge-status-dot orange">DEPLOYS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
