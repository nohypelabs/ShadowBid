import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { http, fallback } from 'wagmi';

const ARBITRUM_SEPOLIA_RPCS = [
  'https://sepolia-rollup.arbitrum.io/rpc',
  'https://arbitrum-sepolia-rpc.publicnode.com',
  'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
];

export const config = getDefaultConfig({
  appName: 'ShadowBid',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: fallback(ARBITRUM_SEPOLIA_RPCS.map((url) => http(url))),
  },
});
