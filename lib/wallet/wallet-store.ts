export type WalletState = {
  address: string | null;
};

let state: WalletState = { address: null };
const listeners = new Set<(s: WalletState) => void>();

export function getWalletState(): WalletState {
  return state;
}

export function getConnectedWalletAddress(): string | null {
  return state.address;
}

export function setConnectedWalletAddress(address: string | null) {
  state = { address };
  if (typeof window !== "undefined") {
    try {
      if (address) window.localStorage.setItem("paymilestone.walletAddress", address);
      else window.localStorage.removeItem("paymilestone.walletAddress");
    } catch {}
  }
  listeners.forEach((l) => l(state));
}

export function hydrateWalletAddressFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("paymilestone.walletAddress");
    if (stored && !state.address) setConnectedWalletAddress(stored);
  } catch {}
}

export function subscribeWalletState(listener: (s: WalletState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
