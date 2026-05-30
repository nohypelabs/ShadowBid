import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ExternalLink, Menu, Wallet, X } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { SHADOWBID_ADDRESS } from '../constants/contracts';

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: '◈' },
  { label: 'Auctions', href: '/auctions', icon: '◇' },
  { label: 'Create', href: '/create', icon: '✦' },
  { label: 'Demo', href: '/demo', icon: '⚡' },
] as const;

export default function Header() {
  const location = useLocation();
  const { address } = useAccount();
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
    query: { enabled: !!address },
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)),
    [location.pathname],
  );

  // Hide header on auction detail pages
  if (location.pathname.startsWith('/auction/')) return null;

  const renderWalletButton = (compact = false) => (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const wrongNetwork = connected && chain.unsupported;
        const balance = isBalanceLoading
          ? 'Loading'
          : walletBalance
            ? `${Number(walletBalance.formatted).toFixed(4)} ${walletBalance.symbol}`
            : account?.displayBalance;

        if (!connected) {
          return (
            <button
              className={`sb-wallet-button ${compact ? 'sb-wallet-button--compact' : ''}`}
              onClick={openConnectModal}
              type="button"
            >
              <Wallet size={16} />
              {!compact && <span>Connect Wallet</span>}
            </button>
          );
        }

        if (wrongNetwork) {
          return (
            <button
              className={`sb-wallet-button sb-wallet-button--warning ${compact ? 'sb-wallet-button--compact' : ''}`}
              onClick={openChainModal}
              type="button"
            >
              <span className="sb-wallet-button__status" />
              {!compact && <span>Switch Network</span>}
              {compact && <Wallet size={16} />}
            </button>
          );
        }

        return (
          <button
            className={`sb-wallet-button sb-wallet-button--connected ${compact ? 'sb-wallet-button--compact' : ''}`}
            onClick={openAccountModal}
            type="button"
          >
            <span className="sb-wallet-button__status" />
            <span className="sb-wallet-button__main">
              <span className="sb-wallet-button__address">{account.displayName}</span>
              {!compact && balance && <span className="sb-wallet-button__balance">{balance}</span>}
            </span>
            {!compact && <ChevronDown size={15} />}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );

  return (
    <>
      <header className={`sb-header ${scrolled ? 'sb-header--scrolled' : ''}`}>
        <div className="sb-header__inner">
          {/* ── Logo ── */}
          <Link to="/" className="sb-logo">
            <div className="sb-logo__icon">
              <div className="sb-logo__shimmer" />
              <img src="/shadowbid.png" alt="ShadowBid" className="sb-logo__image" />
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
            {renderWalletButton()}
          </nav>

          {/* ── Mobile Actions ── */}
          <div className="sb-header__mobile">
            {renderWalletButton(true)}
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
                  <img src="/shadowbid.png" alt="ShadowBid" className="sb-logo__image" />
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
                href={`https://sepolia.arbiscan.io/address/${SHADOWBID_ADDRESS}`}
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
