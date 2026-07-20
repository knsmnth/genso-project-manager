import React, { useState, useEffect } from 'react';
import { Person } from '../types';

interface AttendanceModalProps {
  isOpen: boolean;
  personnel: Person[];
  onClose: () => void;
  onConfirm: (checkedNames: string[]) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  personnel,
  onClose,
  onConfirm
}) => {
  const [checkedNames, setCheckedNames] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill checked with those currently marked present
      const alreadyPresent = personnel
        .filter((p) => p.attendanceStatus && p.attendanceStatus.toLowerCase().startsWith('present'))
        .map((p) => p.name);
      setCheckedNames(alreadyPresent);
    }
  }, [isOpen, personnel]);

  if (!isOpen) return null;

  const handleToggleName = (name: string) => {
    if (checkedNames.includes(name)) {
      setCheckedNames(checkedNames.filter((n) => n !== name));
    } else {
      setCheckedNames([...checkedNames, name]);
    }
  };

  const handleMarkAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedNames(personnel.map((p) => p.name));
    } else {
      setCheckedNames([]);
    }
  };

  const handleConfirmClick = () => {
    onConfirm(checkedNames);
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

  const isAllChecked = checkedNames.length === personnel.length && personnel.length > 0;

  return (
    <div className="modal-backdrop open" id="attendance-modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <h2 className="modal-title">Daily Attendance Check</h2>
            <span className="modal-subtitle" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <span>STAFF ROSTER</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span>Mark All Present</span>
              <input type="checkbox" checked={isAllChecked} onChange={handleMarkAllToggle} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {personnel.map((p) => {
              const isChecked = checkedNames.includes(p.name);
              return (
                <div
                  key={p.name}
                  className={`personnel-row ${isChecked ? 'checked' : ''}`}
                  onClick={() => handleToggleName(p.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div className="personnel-row-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={`initials-avatar ${getAvatarColorClass(p.name)}`}>
                      {getInitials(p.name)}
                    </div>
                    <div className="personnel-meta" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="personnel-name" style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-navy-header)' }}>
                        {p.name}
                      </span>
                      <span className="personnel-role" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {p.role}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Controlled by row click
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '16px 24px' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirmClick} style={{ flex: 1 }}>
            Confirm Attendance
          </button>
        </div>
      </div>
    </div>
  );
};
