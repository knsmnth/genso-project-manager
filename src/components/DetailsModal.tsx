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
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <span className="modal-subtitle" id="modal-code">
              {order.code}
            </span>
            <h2 className="modal-title" id="modal-scope">
              {order.scope.toUpperCase()}
            </h2>
          </div>
          <button id="modal-close" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Main Info Row */}
          <div className="modal-summary-row">
            <span className={`badge badge-status-pill ${getStatusClass(order.status)}`} id="modal-status">
              {order.status.toUpperCase()}
            </span>
            <span className="modal-work-type-tag" id="modal-worktype">
              {order.worktype || 'Preventative Maintenance'}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          {/* Grid Layout fields */}
          <div className="modal-attributes-grid">
            <div className="modal-attr-group">
              <span className="attr-label">ASSET / FACILITY</span>
              <span className="attr-value" id="modal-asset" style={{ fontWeight: 700 }}>
                {order.assetName}
              </span>
              <span className="attr-sub" id="modal-asset-sub">
                {order.space}
              </span>
            </div>

            <div className="modal-attr-group">
              <span className="attr-label">SCHEDULED DATES</span>
              <div className="dates-display">
                <div className="date-item">
                  <span className="date-label">Start Date</span>
                  <span className="date-val" id="modal-start-date">
                    {formatDate(order.startDate)} - {order.startTime || '08:00 AM'}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Est. Completion</span>
                  <span className="date-val" id="modal-end-date">
                    {formatDate(order.endDate)} - {order.endTime || '05:00 PM'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-attr-group">
              <span className="attr-label">ASSIGNED WORKGROUP</span>
              <span className="attr-value" id="modal-team" style={{ color: 'var(--color-primary)' }}>
                {order.workgroup}
              </span>
            </div>

            <div className="modal-attr-group">
              <span className="attr-label">SUPERVISOR</span>
              <div className="supervisor-display">
                <div className={`initials-avatar ${getAvatarColorClass(order.foreman || 'UN')}`} id="modal-foreman-avatar">
                  {getInitials(order.foreman || 'UN')}
                </div>
                <span className="supervisor-name" id="modal-foreman">
                  {order.foreman || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          {/* Description */}
          <div className="modal-description-section">
            <span className="attr-label">DESCRIPTION</span>
            <p className="description-text" id="modal-description">
              {order.description || 'No description provided.'}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          {/* Assigned Personnel Checkboxes list */}
          <div className="modal-assigned-section">
            <span className="attr-label">ASSIGNED PERSONNEL</span>
            <div className="assigned-members-grid" id="modal-assigned-people">
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
