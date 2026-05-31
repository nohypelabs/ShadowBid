import { Search, Wallet, ChevronDown } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export function Topbar() {
  const { address } = useAccount();
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
    query: { enabled: !!address },
  });

  return (
    <header className="sb-topbar">
      {/* Search */}
      <div className="sb-topbar__search">
        <Search size={15} className="sb-topbar__search-icon" />
        <input
          type="text"
          placeholder="Search auctions..."
          className="sb-topbar__search-input"
        />
      </div>

      {/* Right section */}
      <div className="sb-topbar__right">
        {/* Network badge */}
        <div className="sb-topbar__network">
          <span className="sb-topbar__network-dot" />
          <span className="sb-topbar__network-label">Arbitrum Sepolia</span>
        </div>

        {/* Wallet */}
        <ConnectButton.Custom>
          {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            const wrongNetwork = connected && chain.unsupported;
            const balance = isBalanceLoading
              ? 'Loading'
              : walletBalance
                ? `${(Number(walletBalance.formatted) || 0).toFixed(4)} ${walletBalance.symbol}`
                : account?.displayBalance;

            if (!connected) {
              return (
                <button className="sb-topbar__wallet" onClick={openConnectModal} type="button">
                  <Wallet size={15} />
                  <span>Connect</span>
                </button>
              );
            }

            if (wrongNetwork) {
              return (
                <button className="sb-topbar__wallet sb-topbar__wallet--warning" onClick={openChainModal} type="button">
                  <span className="sb-topbar__wallet-dot" />
                  <span>Switch Network</span>
                </button>
              );
            }

            return (
              <button className="sb-topbar__wallet sb-topbar__wallet--connected" onClick={openAccountModal} type="button">
                <span className="sb-topbar__wallet-dot" />
                <div className="sb-topbar__wallet-info">
                  <span className="sb-topbar__wallet-addr">{account.displayName}</span>
                  {balance && <span className="sb-topbar__wallet-bal">{balance}</span>}
                </div>
                <ChevronDown size={14} />
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
