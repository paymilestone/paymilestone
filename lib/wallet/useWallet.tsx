"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  connectWallet,
  disconnectWallet,
  refreshWalletAddress,
  signTransactionWithWallet,
} from "@/lib/wallet/stellar-wallet-kit";
import {
  getConnectedWalletAddress,
  hydrateWalletAddressFromStorage,
  subscribeWalletState,
} from "@/lib/wallet/wallet-store";

type WalletContextValue = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<string | null>;
  signTransaction: (xdr: string, opts?: { address?: string; networkPassphrase?: string }) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    hydrateWalletAddressFromStorage();
    setAddress(getConnectedWalletAddress());
    const unsub = subscribeWalletState((s) => setAddress(s.address));
    return () => { unsub(); };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      return await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
  }, []);

  const refresh = useCallback(async () => refreshWalletAddress(), []);
  const signTransaction = useCallback(async (xdr: string, opts?: { address?: string; networkPassphrase?: string }) => {
    return signTransactionWithWallet(xdr, opts);
  }, []);

  const value = useMemo<WalletContextValue>(() => ({
    address,
    isConnected: !!address,
    isConnecting,
    connect,
    disconnect,
    refresh,
    signTransaction,
  }), [address, isConnecting, connect, disconnect, refresh, signTransaction]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
