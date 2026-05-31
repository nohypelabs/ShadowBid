import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile, sidebar is always collapsed (hidden)
  const effectiveCollapsed = isMobile || sidebarCollapsed;

  return (
    <div className="sb-dashboard-layout">
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div className="sb-sidebar-overlay" onClick={() => setSidebarCollapsed(true)} />
      )}

      <Sidebar
        collapsed={effectiveCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className={`sb-dashboard-layout__main ${effectiveCollapsed ? 'sb-dashboard-layout__main--collapsed' : ''}`}>
        <Topbar onMenuClick={isMobile ? () => setSidebarCollapsed(false) : undefined} />
        <div className="sb-dashboard-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
