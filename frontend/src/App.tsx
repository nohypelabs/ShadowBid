import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardLayout, BackToTop } from './components';
import {
  Home, CreateAuction, AuctionDetail, ActiveAuctions,
  MyBids, RevealCenter, Settlement, Verification,
  Demo, NotFound,
} from './pages';

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
        {/* Dashboard layout routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/auctions" element={<PageWrapper><ActiveAuctions /></PageWrapper>} />
          <Route path="/create" element={<PageWrapper><CreateAuction /></PageWrapper>} />
          <Route path="/auction/:id" element={<PageWrapper><AuctionDetail /></PageWrapper>} />
          <Route path="/my-bids" element={<PageWrapper><MyBids /></PageWrapper>} />
          <Route path="/reveal" element={<PageWrapper><RevealCenter /></PageWrapper>} />
          <Route path="/settlement" element={<PageWrapper><Settlement /></PageWrapper>} />
          <Route path="/verification" element={<PageWrapper><Verification /></PageWrapper>} />
        </Route>

        {/* Standalone routes (no sidebar) */}
        <Route path="/demo" element={<PageWrapper><Demo /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <AnimatedRoutes />
      <BackToTop />
    </>
  );
}

export default App;
