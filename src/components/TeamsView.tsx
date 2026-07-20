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
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  const activeGroup = teams[activeTeamIndex] || teams[0];

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

  // Count active / idle in current group
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
          <button className="btn btn-outline-sm">
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

      {/* Split Grid */}
      <div className="teams-split-grid">
        {/* Left Side: Work Groups list */}
        <div className="card groups-list-card">
          <div className="card-header space-between">
            <h3>Work Groups</h3>
            <span className="count-badge">{teams.length} Active Groups</span>
          </div>
          <div className="card-body no-padding">
            {teams.map((group, index) => {
              // Avatar elements
              const avatars = group.members.slice(0, 3);
              const extraCount = group.members.length - 3;

              return (
                <div
                  key={group.name}
                  className={`group-card-item ${index === activeTeamIndex ? 'active' : ''}`}
                  onClick={() => setActiveTeamIndex(index)}
                >
                  <div className="group-card-header">
                    <span className="group-card-name">{group.name}</span>
                    <span className="group-card-members-count">{group.members.length} Members</span>
                  </div>
                  <div className="group-card-lead">Lead: {group.lead}</div>
                  <div className="group-card-footer">
                    <div className="group-card-avatars">
                      {avatars.map((name) => (
                        <div
                          key={name}
                          className={`initials-avatar ${getAvatarColorClass(name)}`}
                          style={{ width: '22px', height: '22px', fontSize: '8px', border: '1px solid #fff', marginRight: '-6px' }}
                        >
                          {getInitials(name)}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="group-card-avatars-more">+{extraCount}</div>
                      )}
                    </div>
                    <div className="group-card-jobs">
                      <span className="group-card-jobs-lbl">Current Jobs</span>
                      <span className="group-card-jobs-val">{group.jobs}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Roster details list */}
        {activeGroup && (
          <div className="card roster-details-card">
            <div className="card-header space-between" style={{ alignItems: 'center' }}>
              <div>
                <h3>{activeGroup.name}</h3>
                <span className="sub-label">Detailed Roster</span>
              </div>
              <div className="roster-actions">
                <button className="icon-btn-border" aria-label="Download Roster">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
                <button className="icon-btn-border" aria-label="Edit Group">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="card-body no-padding" style={{ flexGrow: 1 }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
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
                              <span className="cell-primary">{member.name}</span>
                              <span className="cell-subtext">{member.code}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{member.role}</td>
                        <td>
                          <span className={`status-badge-outline ${getStatusClass(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <a href="#" className="action-link" onClick={(e) => e.preventDefault()}>
                            Reassign
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="roster-footer">
              <div className="roster-stat">
                <span className="roster-stat-num">{activeCount}</span>
                <span class="roster-stat-lbl">Active</span>
              </div>
              <div className="roster-stat border-left">
                <span className="roster-stat-num">{idleCount}</span>
                <span className="roster-stat-lbl">Idle</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
