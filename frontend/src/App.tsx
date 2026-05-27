import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Menu, X, Zap, ExternalLink } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home, CreateAuction, AuctionDetail, Demo } from './pages';

function App() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const showHeader = !location.pathname.startsWith('/auction/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', href: '/', icon: '◈' },
    { label: 'Create', href: '/create', icon: '✦' },
    { label: 'Demo', href: '/demo', icon: '⚡' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: 'var(--bg-void)', position: 'relative' }}>
      {/* Top Gradient Glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '50vh', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% -20%, rgba(245,158,11,0.08) 0%, transparent 60%)',
      }} />

      {showHeader && (
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(3,3,5,0.95)' : 'rgba(3,3,5,0.7)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
            height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(6,182,212,0.15))',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                  animation: 'shimmer 3s infinite',
                }} />
                <Zap size={20} color="#f59e0b" />
              </div>
              <div>
                <span style={{
                  fontFamily: 'Inter', fontWeight: 800, fontSize: '20px',
                  color: '#f1f5f9', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2,
                }}>
                  Shadow<span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>Bid</span>
                </span>
                <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                  FHE-POWERED
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
              {navLinks.map(link => (
                <Link
                  key={link.href} to={link.href}
                  style={{
                    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                    fontFamily: 'IBM Plex Mono', padding: '10px 18px', borderRadius: '12px',
                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px',
                    ...(isActive(link.href) ? {
                      color: '#f1f5f9', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    } : {
                      color: '#64748b', background: 'transparent', border: '1px solid transparent',
                    }),
                  }}
                  onMouseEnter={e => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = '#f1f5f9';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

              {/* Network Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '10px', marginRight: '12px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: '12px', color: '#10b981', fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>
                  Arbitrum Sepolia
                </span>
              </div>

              {/* RainbowKit Connect Button — built-in, handles modal internally */}
              <ConnectButton
                showBalance={false}
                chainStatus="none"
                accountStatus="address"
              />
            </nav>

            {/* Mobile */}
            <div className="flex md:hidden" style={{ alignItems: 'center', gap: '12px' }}>
              <ConnectButton
                showBalance={false}
                chainStatus="none"
                accountStatus="address"
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  color: '#64748b', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                  width: '40px', height: '40px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="md:hidden"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '300px', maxWidth: '85vw', zIndex: 95,
              background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(32px)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: '24px', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(6,182,212,0.15))',
                  border: '1px solid rgba(245,158,11,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={16} color="#f59e0b" />
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: '#f1f5f9' }}>
                  Shadow<span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>Bid</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#64748b', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                  width: '32px', height: '32px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map(link => (
                <Link
                  key={link.href} to={link.href}
                  style={{
                    textDecoration: 'none', fontSize: '15px', fontWeight: 500,
                    fontFamily: 'IBM Plex Mono', padding: '14px 16px', borderRadius: '12px',
                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '12px',
                    ...(isActive(link.href) ? {
                      color: '#f1f5f9', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    } : {
                      color: '#94a3b8', background: 'transparent', border: '1px solid transparent',
                    }),
                  }}
                >
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isActive(link.href) ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                  }}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Network Info */}
            <div style={{
              marginTop: '24px', padding: '16px', borderRadius: '12px',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', fontFamily: 'IBM Plex Mono' }}>
                    Arbitrum Sepolia
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Testnet Connected</div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Footer Links */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://sepolia.arbiscan.io/address/0x2BccEa43CE4D32dbfE813c5FEdd39C396E75072c" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: '#64748b', textDecoration: 'none', fontSize: '13px', fontFamily: 'IBM Plex Mono' }}
              >
                <ExternalLink size={14} /> View Contract
              </a>
              <a href="https://github.com/nohypelabas/ShadowBid" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: '#64748b', textDecoration: 'none', fontSize: '13px', fontFamily: 'IBM Plex Mono' }}
              >
                <ExternalLink size={14} /> GitHub
              </a>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </main>

      {/* CSS */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media (max-width: 768px) {
          .hidden.md\\:flex { display: none !important; }
          .flex.md\\:hidden { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hidden.md\\:flex { display: flex !important; }
          .flex.md\\:hidden { display: none !important; }
        }
        /* Override RainbowKit button to match ShadowBid style */
        [data-rk] button {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </div>
  );
}

export default App;
