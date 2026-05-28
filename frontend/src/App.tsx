import { Routes, Route } from 'react-router-dom';
import { Header } from './components';
import { Home, CreateAuction, AuctionDetail, Demo } from './pages';

function App() {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: 'var(--bg-void)', position: 'relative' }}>
      {/* Top Gradient Glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '50vh', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% -20%, rgba(245,158,11,0.08) 0%, transparent 60%)',
      }} />

      <Header />

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
        /* Override RainbowKit button to match ShadowBid style */
        [data-rk] button {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </div>
  );
}

export default App;
