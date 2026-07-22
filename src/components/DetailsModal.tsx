import React from 'react';
import { WorkOrder } from '../types';

interface DetailsModalProps {
  isOpen: boolean;
  orderCode: string | null;
  workOrders: WorkOrder[];
  onClose: () => void;
  onEdit: (code: string) => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  orderCode,
  workOrders,
  onClose,
  onEdit
}) => {
  if (!isOpen || !orderCode) return null;

  const order = workOrders.find((x) => x.code === orderCode);
  if (!order) return null;

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'green inprogress';
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="modal-backdrop open" id="details-modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', position: 'relative', width: '100%' }}>
          <div className="modal-title-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', width: '90%' }}>
            <span
              className="modal-subtitle"
              id="modal-code"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-light)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              {order.code}
            </span>
            <h2
              className="modal-title"
              id="modal-scope"
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-navy-header)',
                lineHeight: 1.4,
                margin: 0
              }}
            >
              {order.scope}
            </h2>
          </div>
          <button
            id="modal-close"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{ position: 'absolute', right: '16px', top: '16px', fontSize: '24px' }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Main Info Row */}
          <div className="modal-summary-row" style={{ display: 'flex', gap: '12px', borderBottom: 'none', paddingBottom: 0 }}>
            <span className={`badge badge-status-pill ${getStatusClass(order.status)}`} id="modal-status">
              {order.status.toUpperCase()}
            </span>
            <span className="modal-work-type-tag" id="modal-worktype">
              {order.worktype || 'Preventative Maintenance'}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

          {/* Grid Layout fields */}
          <div className="modal-attributes-grid">
            <div className="modal-attr-box">
              <span className="attr-lbl">ASSET / FACILITY</span>
              <span className="attr-val font-bold" id="modal-asset">
                {order.assetName}
              </span>
              <span className="attr-subval" id="modal-asset-sub">
                {order.space}
              </span>
            </div>

            <div className="modal-attr-box">
              <span className="attr-lbl">SCHEDULED DATES</span>
              <div className="dates-display">
                <div className="date-item">
                  <span className="date-label">Start:</span>
                  <span className="date-val" id="modal-start-date">
                    {formatDate(order.startDate)} - {order.startTime || '08:30 AM'}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Est. End:</span>
                  <span className="date-val" id="modal-end-date">
                    {formatDate(order.endDate)} - {order.endTime || '05:00 PM'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-attr-box">
              <span className="attr-lbl">ASSIGNED WORKGROUP</span>
              <span className="attr-val font-bold" id="modal-team" style={{ color: 'var(--color-primary)' }}>
                {order.workgroup}
              </span>
            </div>

            <div className="modal-attr-box">
              <span className="attr-lbl">SUPERVISOR</span>
              <div className="attr-avatar-text">
                <div className={`initials-avatar ${getAvatarColorClass(order.foreman || 'UN')}`} id="modal-foreman-avatar">
                  {getInitials(order.foreman || 'UN')}
                </div>
                <span id="modal-foreman" style={{ fontWeight: 600 }}>
                  {order.foreman || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

          {/* Description */}
          <div className="modal-desc-box">
            <span className="desc-lbl">DESCRIPTION</span>
            <p className="desc-text" id="modal-description">
              {order.description || 'No description provided.'}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

          {/* Assigned Personnel Checkboxes list */}
          <div className="modal-assigned-box">
            <span className="attr-lbl">ASSIGNED PERSONNEL</span>
            <div className="assigned-badges" id="modal-assigned-people" style={{ marginTop: '8px' }}>
              {order.assigned && order.assigned.length > 0 ? (
                order.assigned.map((name) => (
                  <div key={name} className="assigned-member-badge">
                    <div className={`initials-avatar ${getAvatarColorClass(name)}`}>
                      {getInitials(name)}
                    </div>
                    <span>{name}</span>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  No personnel assigned.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" id="modal-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" id="modal-btn-edit" onClick={() => onEdit(order.code)}>
            Edit Work Order
          </button>
        </div>
      </div>
    </div>
  );
};
