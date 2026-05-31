import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SHADOWBID_ADDRESS } from '../constants/contracts';

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
        <footer className="sb-footer">
          <span>ShadowBid Protocol</span>
          <a href="https://docs.shadowbid.xyz" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href={`https://sepolia.arbiscan.io/address/${SHADOWBID_ADDRESS}`} target="_blank" rel="noopener noreferrer">Explorer</a>
          <a href="https://github.com/shadowbid" target="_blank" rel="noopener noreferrer">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
