import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, ExternalLink, ChevronDown } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: '◈' },
  { label: 'Create', href: '/create', icon: '✦' },
  { label: 'Demo', href: '/demo', icon: '⚡' },
] as const;

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide header on auction detail pages
  if (location.pathname.startsWith('/auction/')) return null;

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)),
    [location.pathname],
  );

  return (
    <>
      <header className={`sb-header ${scrolled ? 'sb-header--scrolled' : ''}`}>
        <div className="sb-header__inner">
          {/* ── Logo ── */}
          <Link to="/" className="sb-logo">
            <div className="sb-logo__icon">
              <div className="sb-logo__shimmer" />
              <Zap size={20} color="#f59e0b" />
            </div>
            <div className="sb-logo__text">
              <span className="sb-logo__name">
                Shadow<span className="sb-logo__name--accent">Bid</span>
              </span>
              <span className="sb-logo__tag">FHE-POWERED</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="sb-nav sb-nav--desktop">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`sb-nav__link ${isActive(link.href) ? 'sb-nav__link--active' : ''}`}
              >
                <span className="sb-nav__icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="sb-nav__divider" />

            {/* Network Badge */}
            <div className="sb-network">
              <span className="sb-network__dot" />
              <span className="sb-network__label">Arbitrum Sepolia</span>
            </div>

            {/* Wallet */}
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
          </nav>

          {/* ── Mobile Actions ── */}
          <div className="sb-header__mobile">
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
            <button
              className="sb-burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <>
          <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
          <aside className="sb-drawer">
            {/* Drawer Header */}
            <div className="sb-drawer__head">
              <Link to="/" className="sb-logo sb-logo--sm" onClick={() => setMobileOpen(false)}>
                <div className="sb-logo__icon sb-logo__icon--sm">
                  <Zap size={16} color="#f59e0b" />
                </div>
                <span className="sb-logo__name sb-logo__name--sm">
                  Shadow<span className="sb-logo__name--accent">Bid</span>
                </span>
              </Link>
              <button className="sb-drawer__close" onClick={() => setMobileOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Drawer Nav */}
            <nav className="sb-drawer__nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`sb-drawer__link ${isActive(link.href) ? 'sb-drawer__link--active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sb-drawer__link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Network Info */}
            <div className="sb-drawer__network">
              <span className="sb-network__dot" />
              <div>
                <div className="sb-drawer__network-name">Arbitrum Sepolia</div>
                <div className="sb-drawer__network-sub">Testnet Connected</div>
              </div>
            </div>

            <div className="sb-drawer__spacer" />

            {/* Footer Links */}
            <div className="sb-drawer__footer">
              <a
                href="https://sepolia.arbiscan.io/address/0x2BccEa43CE4D32dbfE813c5FEdd39C396E75072c"
                target="_blank"
                rel="noopener noreferrer"
                className="sb-drawer__ext"
              >
                <ExternalLink size={14} /> View Contract
              </a>
              <a
                href="https://github.com/nohypelabas/ShadowBid"
                target="_blank"
                rel="noopener noreferrer"
                className="sb-drawer__ext"
              >
                <ExternalLink size={14} /> GitHub
              </a>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
