import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CofheProvider, createCofheConfig } from "@cofhe/react";
import { Toaster } from "sonner";
import { config } from "./config/wagmi";
import App from "./App";

import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const queryClient = new QueryClient();

const cofheConfig = createCofheConfig({
  supportedChains: [
    {
      id: 421614,
      name: "Arbitrum Sepolia",
      network: "arbitrum-sepolia",
      coFheUrl: "https://cofhe-testnet.fhenix.io",
      verifierUrl: "https://verifier-testnet.fhenix.io",
      thresholdNetworkUrl: "https://threshold-testnet.fhenix.io",
      environment: "DEV",
    },
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({ accentColor: '#14B8A6' })} modalSize="compact">
            <CofheProvider config={cofheConfig}>
              <App />
              <Toaster position="bottom-right" richColors theme="dark" />
            </CofheProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);