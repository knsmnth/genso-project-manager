import React, { useEffect, useState } from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onCreateOrder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  sidebarOpen,
  onSidebarClose,
  onCreateOrder
}) => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  // Track expansion of Work Orders sub-menu (default true if activeView is workorders or dailyworklog)
  const isWorkOrdersActive = activeView === 'workorders' || activeView === 'dailyworklog';
  const [workOrdersExpanded, setWorkOrdersExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (isWorkOrdersActive) {
      setWorkOrdersExpanded(true);
    }
  }, [activeView]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setInstallPromptEvent(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'rect':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        );
      case 'file':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="15" y2="16" />
          </svg>
        );
      case 'list':
        return (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        );
      case 'users':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'person':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
    }
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div
          className="sidebar-brand"
          onClick={() => {
            if (window.innerWidth <= 1024) {
              onSidebarClose();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <svg className="brand-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="brand-info">
            <span className="brand-text">InfraAdmin</span>
            <span className="brand-subtext">Operational Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <a
            href="#"
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onViewChange('dashboard');
            }}
          >
            {getIcon('rect')}
            <span>Dashboard</span>
          </a>

          {/* Work Orders (Parent Item with Accordion Sub-menu) */}
          <div className="nav-parent-group">
            <a
              href="#"
              className={`nav-item ${isWorkOrdersActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setWorkOrdersExpanded(!workOrdersExpanded);
                if (activeView !== 'workorders' && activeView !== 'dailyworklog') {
                  onViewChange('workorders');
                }
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getIcon('file')}
                <span>Work Orders</span>
              </div>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: workOrdersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>

            {/* Sub-menu items visible under Work Orders */}
            {workOrdersExpanded && (
              <div className="nav-sub-menu">
                <a
                  href="#"
                  className={`nav-sub-item ${activeView === 'workorders' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('workorders');
                  }}
                >
                  {getIcon('list')}
                  <span>All Work Orders</span>
                </a>

                <a
                  href="#"
                  className={`nav-sub-item ${activeView === 'dailyworklog' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('dailyworklog');
                  }}
                >
                  {getIcon('clipboard')}
                  <span>Daily Work Log</span>
                </a>
              </div>
            )}
          </div>

          {/* Teams */}
          <a
            href="#"
            className={`nav-item ${activeView === 'teams' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onViewChange('teams');
            }}
          >
            {getIcon('users')}
            <span>Teams</span>
          </a>

          {/* Personnel */}
          <a
            href="#"
            className={`nav-item ${activeView === 'personnel' || activeView === 'quick-onboard' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onViewChange('personnel');
            }}
          >
            {getIcon('person')}
            <span>Personnel</span>
          </a>

          {/* Alerts */}
          <a
            href="#"
            className={`nav-item ${activeView === 'alerts' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onViewChange('alerts');
            }}
          >
            {getIcon('alert')}
            <span>Alerts</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          {installPromptEvent && (
            <button id="install-btn" className="install-app-btn" onClick={handleInstallClick}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Install Mobile App</span>
            </button>
          )}

          <button className="btn btn-sidebar-action" onClick={onCreateOrder}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>Create Work Order</span>
          </button>
        </div>
      </aside>
    </>
  );
};
