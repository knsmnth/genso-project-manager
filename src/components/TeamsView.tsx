import React, { useState } from 'react';
import { Team, Person } from '../types';

interface TeamsViewProps {
  teams: Team[];
  personnel: Person[];
  onNewGroup: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  personnel,
  onNewGroup
}) => {
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);

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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on-site':
      case 'on site':
        return 'onsite';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'available';
    }
  };

  // If a group is selected, calculate active vs idle roster metrics
  const activeGroup = selectedTeamIndex !== null ? teams[selectedTeamIndex] : null;

  let activeCount = 0;
  let idleCount = 0;

  const activeMembersData = activeGroup
    ? activeGroup.members.map((name) => {
        const p = personnel.find((person) => person.name === name) || {
          name,
          code: 'MP-XXXX-G',
          role: 'Technician',
          status: 'Available'
        };
        if (p.status.toLowerCase() === 'available') {
          idleCount++;
        } else {
          activeCount++;
        }
        return p;
      })
    : [];

  return (
    <section id="view-teams" className="view-section active" style={{ display: 'flex' }}>
      <div className="view-header-row">
        <div>
          <h1 className="view-main-title">Personnel & Resource Allocation</h1>
          <p className="view-main-subtitle">Manage inter-departmental teams and individual field personnel.</p>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-outline-sm" onClick={() => alert('Filter options are under development.')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter</span>
          </button>
          <button className="btn btn-primary-sm" onClick={onNewGroup}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>New Work Group</span>
          </button>
        </div>
      </div>

      {selectedTeamIndex === null ? (
        /* Master View: Work Groups card grid */
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Work Groups Registry</h3>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '4px 10px',
                borderRadius: '12px'
              }}
            >
              {teams.length} Active Groups
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}
          >
            {teams.map((group, index) => {
              const avatars = group.members.slice(0, 4);
              const extraCount = group.members.length - 4;

              return (
                <div
                  key={group.name}
                  className="group-card-item"
                  onClick={() => setSelectedTeamIndex(index)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy-header)' }}>{group.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {group.members.length} Members
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>
                    <strong>Lead:</strong> {group.lead}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {avatars.map((name) => (
                        <div
                          key={name}
                          className={`initials-avatar ${getAvatarColorClass(name)}`}
                          style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '9px',
                            border: '2px solid #fff',
                            marginRight: '-6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getInitials(name)}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div
                          className="group-card-avatars-more"
                          style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '9px',
                            backgroundColor: '#E2E8F0',
                            color: 'var(--color-text-dark)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '8px',
                            fontWeight: 700
                          }}
                        >
                          +{extraCount}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Active Jobs</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>{group.jobs}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detail View: Selected Roster List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <button
              className="btn btn-outline-sm"
              onClick={() => setSelectedTeamIndex(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '36px' }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Groups</span>
            </button>
          </div>

          {activeGroup && (
            <div className="card roster-details-card">
              <div className="card-header space-between" style={{ alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{activeGroup.name}</h3>
                  <span className="sub-label" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Detailed Roster (Lead: {activeGroup.lead})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn-border" aria-label="Download Roster" onClick={() => alert('Downloading Roster CSV...')}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                  <button className="icon-btn-border" aria-label="Edit Group" onClick={() => alert('Edit Group options under development.')}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="card-body no-padding">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr style={{ background: '#EFF4FF' }}>
                        <th>NAME & CODE</th>
                        <th>SPECIALIZATION</th>
                        <th>CURRENT STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMembersData.map((member) => (
                        <tr key={member.name}>
                          <td>
                            <div className="name-code-cell">
                              <div className={`initials-avatar ${getAvatarColorClass(member.name)}`}>
                                {getInitials(member.name)}
                              </div>
                              <div>
                                <span className="cell-primary" style={{ fontSize: '13.5px' }}>{member.name}</span>
                                <span className="cell-subtext" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                  {member.code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{member.role}</td>
                          <td>
                            <span className={`status-badge-outline ${getStatusClass(member.status)}`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                              {member.status}
                            </span>
                          </td>
                          <td>
                            <a
                              href="#"
                              className="action-link"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Reassign operations for ${member.name}`);
                              }}
                              style={{ fontSize: '12px', fontWeight: 600 }}
                            >
                              Reassign
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="roster-footer" style={{ padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '24px' }}>
                <div className="roster-stat" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="roster-stat-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{activeCount}</span>
                  <span className="roster-stat-lbl" style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active</span>
                </div>
                <div className="roster-stat border-left" style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--color-border)', paddingLeft: '24px' }}>
                  <span className="roster-stat-num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{idleCount}</span>
                  <span className="roster-stat-lbl" style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Idle</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
