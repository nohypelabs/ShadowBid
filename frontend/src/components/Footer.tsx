import { ShieldCheck, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="sb-footer">
      <div className="sb-footer__inner">
        <div className="sb-footer__brand">
          <div className="sb-footer__logo">
            <ShieldCheck size={16} color="#f59e0b" />
            <span className="sb-footer__logo-text">ShadowBid</span>
          </div>
          <p className="sb-footer__tagline">Sealed-bid auctions powered by FHE</p>
        </div>

        <div className="sb-footer__links">
          <a href="/auctions" className="sb-footer__link">Auctions</a>
          <a href="/create" className="sb-footer__link">Create</a>
          <a href="/demo" className="sb-footer__link">Demo</a>
        </div>

        <div className="sb-footer__right">
          <div className="sb-footer__buildathon">
            <span className="sb-footer__buildathon-badge">Buildathon</span>
            <span className="sb-footer__buildathon-text">Fhenix Wave 7 &middot; 2026</span>
          </div>
          <a
            href="https://fhenix.io"
            target="_blank"
            rel="noopener noreferrer"
            className="sb-footer__ext"
          >
            fhenix.io <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
