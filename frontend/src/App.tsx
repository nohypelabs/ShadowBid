import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer, BackToTop } from './components';
import { Home, CreateAuction, AuctionDetail, ActiveAuctions, Demo, NotFound } from './pages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/auctions" element={<PageWrapper><ActiveAuctions /></PageWrapper>} />
        <Route path="/create" element={<PageWrapper><CreateAuction /></PageWrapper>} />
        <Route path="/auction/:id" element={<PageWrapper><AuctionDetail /></PageWrapper>} />
        <Route path="/demo" element={<PageWrapper><Demo /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="sb-app">
      <div className="sb-app__glow" />

      <Header />
      <ScrollToTop />

      <main className="sb-app__main">
        <AnimatedRoutes />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
