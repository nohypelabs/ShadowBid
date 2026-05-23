import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, XCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home, CreateAuction, AuctionDetail, Demo } from './pages';

function App() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showHeader = !location.pathname.startsWith('/auction/');

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-void)' }}>
      {/* Radial glow effect */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 70%)',
        }}
      />

      {showHeader && (
        <nav className="px-4 sm:px-7" style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10,10,10,0.65)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* ── Logo ── */}
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/shadowbid2.png"
              alt="ShadowBid"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
              }}
            />
            <span className="text-lg sm:text-xl" style={{
              fontFamily: 'Inter',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}>
              Shadow<span style={{
                background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Bid</span>
            </span>
          </a>

          {/* ── Desktop Nav ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {[
              { label: 'Home', href: '/' },
              { label: 'Create', href: '/create' },
              { label: 'Demo', href: '/demo' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'IBM Plex Mono',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)', margin: '0 12px' }} />

            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                if (!ready) {
                  return (
                    <div style={{
                      height: '38px',
                      width: '140px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }} />
                  );
                }

                if (connected) {
                  return (
                    <button
                      onClick={openAccountModal}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: 'IBM Plex Mono',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }} />
                      {account.displayName}
                    </button>
                  );
                }

                if (chain?.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: 'IBM Plex Mono',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      Wrong Network
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openConnectModal}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
                      color: '#0a0a0a',
                      fontWeight: 700,
                      fontSize: '13px',
                      fontFamily: 'Inter',
                      padding: '9px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(245,158,11,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Wallet style={{ width: '15px', height: '15px', strokeWidth: 2 }} />
                    Connect Wallet
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* ── Mobile toggle ── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            style={{
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {mobileMenuOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
          </button>
        </nav>
      )}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-y-0 right-0 w-72 max-w-[80vw] z-50"
          style={{
            background: 'rgba(10,10,10,0.92)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ padding: '24px' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: '28px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Create', href: '/create' },
                { label: 'Demo', href: '/demo' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: 500,
                    fontFamily: 'IBM Plex Mono',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={!showHeader ? '' : 'max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </main>

      {/* Floating Network Bar */}
      {showHeader && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 safe-bottom">
          <ConnectButton.Custom>
            {({ account, mounted }) => {
              const ready = mounted;
              if (!ready) return null;

              return (
                <div
                  className="rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-4 max-w-[95vw]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>Arbitrum Sepolia</span>
                  </div>
                  <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border-default)' }}></div>
                  {account && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-ibm-plex-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                        {account.displayName}
                      </span>
                    </div>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      )}

      {/* Footer */}
      {showHeader && (
        <footer style={{
          borderTop: '1px solid #1e1e2e',
          marginTop: '80px',
          padding: '32px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/shadowbid2.png"
                alt="ShadowBid"
                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
              />
              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
                Shadow<span style={{ background: 'linear-gradient(135deg, #FBBF24, #14B8A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bid</span>
              </span>
            </div>

            {/* Tagline */}
            <p style={{ color: '#334155', fontSize: '13px', fontFamily: 'IBM Plex Mono' }}>
              Powered by FHE — Arbitrum Sepolia
            </p>

            {/* Links row */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="/create" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>Create Auction</a>
              <a href="/demo" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>Try Demo</a>
              <a href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>Pitch Deck ↗</a>
            </div>

            {/* Copyright */}
            <p style={{ color: '#1e293b', fontSize: '12px', fontFamily: 'IBM Plex Mono', marginTop: '8px' }}>
              © 2025 ShadowBid
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;