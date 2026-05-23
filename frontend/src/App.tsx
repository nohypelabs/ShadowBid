import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, Wallet, XCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home, CreateAuction, AuctionDetail, Demo } from './pages';

function App() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showHeader = !location.pathname.startsWith('/auction/');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-void)' }}>
      {/* Radial glow effect */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 70%)',
        }}
      />

      {showHeader && (
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10,10,10,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(20, 184, 166, 0.2))',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck style={{ width: '20px', height: '20px', color: '#2DD4BF', strokeWidth: 1.5 }} />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Shadow<span style={{ background: 'linear-gradient(135deg, #FBBF24, #14B8A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bid</span>
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
            <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>Home</a>
            <a href="/create" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>Create</a>
            <a href="/demo" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>Demo</a>
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                // Loading skeleton while mounting
                if (!ready) {
                  return (
                    <div style={{ height: '40px', width: '144px', background: '#1f2937', borderRadius: '12px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                  );
                }

                // Connected state: show chip with address
                if (connected) {
                  return (
                    <button
                      onClick={openAccountModal}
                      style={{
                        background: '#1f2937',
                        border: '1px solid #374151',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 500,
                        borderRadius: '9999px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f2937'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#10b981' }}></span>
                      {account.displayName}
                    </button>
                  );
                }

                // Wrong network state
                if (chain?.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      Wrong Network
                    </button>
                  );
                }

                // Disconnected state: the main gradient button
                return (
                  <button
                    onClick={openConnectModal}
                    style={{
                      background: 'linear-gradient(135deg, #FBBF24 0%, #14B8A6 100%)',
                      color: '#0A0A0A',
                      fontWeight: 600,
                      fontSize: '14px',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Wallet style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
                    Connect Wallet
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      )}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-y-0 right-0 w-64 z-50"
          style={{ background: '#1A1A1A', borderLeft: '1px solid #2A2A2A' }}
        >
          <div style={{ padding: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px' }}
            >
              <X className="w-5 h-5" />
            </button>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '8px' }}>Home</a>
              <a href="/create" onClick={() => setMobileMenuOpen(false)} style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '8px' }}>Create</a>
              <a href="/demo" onClick={() => setMobileMenuOpen(false)} style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '8px' }}>Demo</a>
            </nav>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
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
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <ConnectButton.Custom>
            {({ account, mounted }) => {
              const ready = mounted;
              if (!ready) return null;

              return (
                <div
                  className="rounded-full px-4 py-2 flex items-center gap-4"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Arbitrum Sepolia</span>
                  </div>
                  <div className="w-px h-4" style={{ background: 'var(--border-default)' }}></div>
                  {account && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-ibm-plex-mono" style={{ color: 'var(--text-secondary)' }}>
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
              <ShieldCheck style={{ width: '16px', height: '16px', color: '#2DD4BF', strokeWidth: 1.5 }} />
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
                Shadow<span style={{ background: 'linear-gradient(135deg, #FBBF24, #14B8A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bid</span>
              </span>
            </div>

            {/* Tagline */}
            <p style={{ color: '#334155', fontSize: '13px', fontFamily: 'IBM Plex Mono' }}>
              Powered by FHE — Arbitrum Sepolia
            </p>

            {/* Links row */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
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