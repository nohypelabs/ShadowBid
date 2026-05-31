import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ExternalLink } from 'lucide-react';

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
        <button className="sb-sidebar-overlay" onClick={() => setSidebarCollapsed(true)} aria-label="Close navigation menu" type="button" />
      )}

      <Sidebar
        collapsed={effectiveCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className={`sb-dashboard-layout__main ${effectiveCollapsed ? 'sb-dashboard-layout__main--collapsed' : ''}`}>
        <Topbar onMenuClick={isMobile ? () => setSidebarCollapsed(false) : undefined} />
        <main className="sb-dashboard-layout__content" id="main-content">
          <Outlet />
        </main>
        <footer className="sb-footer">
          <div className="sb-footer__left">
            <span className="sb-footer__brand">ShadowBid</span>
            <span className="sb-footer__sep">·</span>
            <span className="sb-footer__wave">Fhenix Wave 7 Buildathon</span>
          </div>
          <div className="sb-footer__right">
            <a href="https://shadowbid26.vercel.app" target="_blank" rel="noopener noreferrer" className="sb-footer__link">
              Website <ExternalLink size={10} />
            </a>
            <a href="https://github.com/nohypelabs/shadowbid" target="_blank" rel="noopener noreferrer" className="sb-footer__link">
              GitHub <ExternalLink size={10} />
            </a>
            <a href="https://x.com/nohypelabs" target="_blank" rel="noopener noreferrer" className="sb-footer__link">
              X <ExternalLink size={10} />
            </a>
            <a href="https://t.me/nohypelabs" target="_blank" rel="noopener noreferrer" className="sb-footer__link">
              Telegram <ExternalLink size={10} />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
