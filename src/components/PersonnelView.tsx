import React, { useState } from 'react';
import { Person, AttendanceLog } from '../types';

interface PersonnelViewProps {
  personnel: Person[];
  searchQuery: string;
  onOpenAttendanceCheck: () => void;
  onOpenQuickOnboard: () => void;
}

const HISTORICAL_LOGS: AttendanceLog[] = [
  {
    date: 'Oct 24, 2023',
    dayOfWeek: 'Tuesday',
    compliance: 92,
    checkedIn: 131,
    totalStaff: 142,
    lateArrivals: 4,
    unexcused: 2
  },
  {
    date: 'Oct 23, 2023',
    dayOfWeek: 'Monday',
    compliance: 88,
    checkedIn: 125,
    totalStaff: 142,
    lateArrivals: 11,
    unexcused: 6
  },
  {
    date: 'Oct 20, 2023',
    dayOfWeek: 'Friday',
    compliance: 95,
    checkedIn: 135,
    totalStaff: 142,
    lateArrivals: 2,
    unexcused: 1
  }
];

export const PersonnelView: React.FC<PersonnelViewProps> = ({
  personnel,
  searchQuery,
  onOpenAttendanceCheck,
  onOpenQuickOnboard
}) => {
  const [tableSearch, setTableSearch] = useState('');

  // 1. Stats Calculations
  const totalStaff = personnel.length;
  const presentCount = personnel.filter(
    (p) => p.attendanceStatus && p.attendanceStatus.toLowerCase().startsWith('present')
  ).length;
  const onLeaveCount = personnel.filter(
    (p) => p.attendanceStatus && p.attendanceStatus.toLowerCase().includes('leave')
  ).length;
  const inFieldCount = personnel.filter((p) => p.activeOrder && p.activeOrder !== '—').length;

  // 2. Specialization calculations
  const specCounts: Record<string, number> = {};
  personnel.forEach((p) => {
    specCounts[p.role] = (specCounts[p.role] || 0) + 1;
  });

  const specializations = Object.entries(specCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalStaff) * 100)
  })).sort((a, b) => b.count - a.count);

  // 3. Table filter
  const filtered = personnel.filter((p) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  });

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

  const getAvailabilityClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on-site':
      case 'on site':
      case 'busy':
        return 'maintenance';
      case 'off-site':
      case 'off site':
        return 'onsite'; // styled pink/orange
      default:
        return 'available';
    }
  };

  return (
    <section id="view-personnel" className="view-section active" style={{ display: 'flex' }}>
      {/* Breadcrumbs & Header */}
      <div className="view-header-row">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumbs" style={{ marginBottom: '4px' }}>
            <span className="breadcrumb-link">Personnel</span>
            <svg className="breadcrumb-arrow" viewBox="0 0 24 24" width="12" height="12">
              <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="breadcrumb-current">Registry</span>
          </nav>
          <h1 className="view-main-title">Personnel Management</h1>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-outline" onClick={onOpenAttendanceCheck} style={{ height: '36px', padding: '0 20px', fontSize: '12px' }}>
            Attendance Check
          </button>
          <button className="btn btn-primary" onClick={onOpenQuickOnboard} style={{ height: '36px', padding: '0 20px', fontSize: '12px' }}>
            <svg viewBox="0 0 24 24" width="14" height="10" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>Quick Onboard</span>
          </button>
        </div>
      </div>

      {/* Section: Personnel Registry Table */}
      <div className="card table-card" style={{ minWidth: 0, marginTop: '8px' }}>
        <div className="card-header space-between" style={{ borderBottom: '1px solid #BBCABF' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1C30' }}>Personnel Registry</h3>
            <span style={{ fontSize: '12px', color: '#3C4A42' }}>Manage credentials and daily status of site staff.</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="personnel-search-box" style={{ margin: 0, height: '34px', width: '200px' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{ padding: '0 8px 0 32px', fontSize: '12px' }}
              />
            </div>
            
            <button className="icon-btn-border" aria-label="Filter" style={{ height: '34px', width: '34px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>

            <button className="btn btn-primary" onClick={() => alert('CSV Export completed.')} style={{ height: '34px', padding: '0 16px', fontSize: '12px' }}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="card-body no-padding">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr style={{ background: '#EFF4FF', borderBottom: '1px solid #BBCABF' }}>
                  <th>PERSONNEL</th>
                  <th>SPECIALIZATION</th>
                  <th>AVAILABILITY</th>
                  <th>ATTENDANCE</th>
                  <th>ACTIVE ORDER</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                      No staff records match search query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const statusClass = getAvailabilityClass(p.status);
                    const isAbsent = p.attendanceStatus && p.attendanceStatus.toLowerCase().startsWith('absent');
                    
                    return (
                      <tr key={p.name}>
                        <td>
                          <div className="name-code-cell">
                            <div className={`initials-avatar ${getAvatarColorClass(p.name)}`}>
                              {getInitials(p.name)}
                            </div>
                            <div>
                              <span className="cell-primary" style={{ fontSize: '13px' }}>{p.name}</span>
                              <span className="cell-subtext" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                {p.id || p.code}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>{p.role}</td>
                        <td>
                          <span className={`status-badge-outline ${statusClass}`} style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: isAbsent ? '#A43A3A' : '#006C49'
                            }}
                          >
                            {p.attendanceStatus || 'Absent'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', color: p.activeOrder !== '—' ? 'var(--color-primary)' : 'inherit' }}>
                          {p.activeOrder || '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <a
                            href="#"
                            className="action-link"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Showing records for ${p.name}`);
                            }}
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          >
                            View Records
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historical Attendance Log Cards */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0B1C30' }}>Historical Attendance Log</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="date" className="filter-text-input" style={{ width: '160px', height: '36px', padding: '0 12px' }} />
            <button className="btn btn-outline-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Download Log</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flexWrap: 'wrap' }}>
          {HISTORICAL_LOGS.map((log) => (
            <div key={log.date} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{log.date}</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy-header)' }}>{log.dayOfWeek}</h4>
                </div>
                <span className="badge-status-dot green" style={{ background: '#E6F4EA', color: '#137333', fontSize: '11px', fontWeight: 700 }}>
                  {log.compliance}% Compliance
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Checked In</span>
                  <span style={{ fontWeight: 700 }}>
                    {log.checkedIn} / {log.totalStaff}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Late Arrivals</span>
                  <span style={{ fontWeight: 700, color: log.lateArrivals > 5 ? '#B06000' : 'inherit' }}>
                    {log.lateArrivals}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Unexcused</span>
                  <span style={{ fontWeight: 700, color: log.unexcused > 2 ? '#A43A3A' : 'inherit' }}>
                    {log.unexcused}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => alert(`Details for ${log.date}`)}
                style={{ width: '100%', padding: '8px 0', fontSize: '13px', backgroundColor: '#EFF4FF', border: 'none', color: '#1A73E8', fontWeight: 600 }}
              >
                Full Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
