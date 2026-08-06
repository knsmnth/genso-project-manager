import React, { useState } from 'react';
import { Team, Person } from '../types';

interface CreateTeamModalProps {
  isOpen: boolean;
  personnel: Person[];
  onClose: () => void;
  onSaveTeam: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  personnel,
  onClose,
  onSaveTeam
}) => {
  const [name, setName] = useState('');
  const [lead, setLead] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleMember = (memberName: string) => {
    if (selectedMembers.includes(memberName)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== memberName));
    } else {
      setSelectedMembers([...selectedMembers, memberName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lead.trim()) {
      alert('Please provide a team name and select a lead.');
      return;
    }

    const allMembers = Array.from(new Set([lead, ...selectedMembers]));

    const newTeam: Team = {
      name: name.trim(),
      lead: lead.trim(),
      size: allMembers.length,
      jobs: 0,
      members: allMembers
    };

    onSaveTeam(newTeam);
    setName('');
    setLead('');
    setSelectedMembers([]);
    onClose();
  };

  return (
    <div className="modal-backdrop open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
      <div className="modal-content card" style={{ maxWidth: '520px', width: '90%', borderRadius: '12px', padding: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Create New Work Group</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              WORK GROUP NAME *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Electrical & Wiring Response Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              TEAM LEAD *
            </label>
            <select
              className="form-control"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
            >
              <option value="">Select Team Lead...</option>
              {personnel.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              ASSIGN MEMBERS
            </label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '8px' }}>
              {personnel.map((p) => (
                <label key={p.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(p.name)}
                    onChange={() => toggleMember(p.name)}
                  />
                  <span>{p.name}</span>
                  <span style={{ fontSize: '11px', color: '#64748B', marginLeft: 'auto' }}>{p.role}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-sm">
              Save Work Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
