import {
  getConnectedWalletAddress,
  setConnectedWalletAddress,
} from "@/lib/wallet/wallet-store";

type StellarWalletsKitApi = typeof import("@creit.tech/stellar-wallets-kit").StellarWalletsKit;

let initialized = false;
let initPromise: Promise<StellarWalletsKitApi | null> | null = null;

const NETWORK_PASSPHRASES: Record<string, string> = {
  TESTNET: "Test SDF Network ; September 2015",
  PUBLIC: "Public Global Stellar Network ; September 2015",
  FUTURENET: "Test SDF Future Network ; October 2022",
  SANDBOX: "Local Sandbox Stellar Network ; September 2022",
  STANDALONE: "Standalone Network ; February 2017",
};

function getNetworkName(): keyof typeof NETWORK_PASSPHRASES {
  const raw = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET").toUpperCase();
  return (raw in NETWORK_PASSPHRASES ? raw : "TESTNET") as keyof typeof NETWORK_PASSPHRASES;
}

async function getKit(): Promise<StellarWalletsKitApi | null> {
  if (typeof window === "undefined") return null;
  if (initialized) {
    const mod = await import("@creit.tech/stellar-wallets-kit");
    return mod.StellarWalletsKit;
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const [kitMod, utilsMod, typesMod] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit"),
        import("@creit.tech/stellar-wallets-kit/modules/utils"),
        import("@creit.tech/stellar-wallets-kit/types"),
      ]);

      const StellarWalletsKit = kitMod.StellarWalletsKit;
      const defaultModules = utilsMod.defaultModules || utilsMod.sep43Modules;
      const Networks = typesMod.Networks as Record<string, string> | undefined;
      const networkName = getNetworkName();
      const network = Networks?.[networkName] || NETWORK_PASSPHRASES[networkName];
      const modules = typeof defaultModules === "function" ? defaultModules() : [];

      if (!StellarWalletsKit || typeof StellarWalletsKit.init !== "function") {
        throw new Error("StellarWalletsKit.init is unavailable");
      }

      StellarWalletsKit.init({ modules, network: network as any });
      initialized = true;
      return StellarWalletsKit;
    } catch (err) {
      console.error("Failed to initialize Stellar Wallets Kit", err);
      return null;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function connectWallet(): Promise<string | null> {
  const kit = await getKit();
  if (!kit) throw new Error("Stellar Wallets Kit is unavailable in this environment.");

  try {
    const result = await kit.authModal();
    const address = result?.address ? String(result.address) : "";
    if (address) setConnectedWalletAddress(address);
    return getConnectedWalletAddress();
  } catch (err: any) {
    // User closed modal/cancelled
    if (err?.code === -1 || err?.code === -3) {
      return getConnectedWalletAddress();
    }
    console.warn("Wallet connection was not completed", err);
    return getConnectedWalletAddress();
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    const kit = await getKit();
    if (kit && typeof kit.disconnect === "function") {
      await kit.disconnect();
    }
  } catch (err) {
    console.warn("Failed to disconnect wallet kit", err);
  } finally {
    setConnectedWalletAddress(null);
  }
}

export async function refreshWalletAddress(): Promise<string | null> {
  const kit = await getKit();
  if (!kit) return getConnectedWalletAddress();
  try {
    if (typeof kit.getAddress === "function") {
      const res = await kit.getAddress();
      if (res?.address) {
        setConnectedWalletAddress(String(res.address));
        return getConnectedWalletAddress();
      }
    }
  } catch {
    // no active address in kit memory; keep stored value as-is
  }
  return getConnectedWalletAddress();
}

export async function signTransactionWithWallet(
  xdr: string,
  opts?: { address?: string; networkPassphrase?: string }
): Promise<string> {
  const kit = await getKit();
  if (!kit) throw new Error("Wallet kit unavailable");

  const address = opts?.address || getConnectedWalletAddress() || undefined;
  const networkPassphrase = opts?.networkPassphrase || NETWORK_PASSPHRASES[getNetworkName()];
  const res = await kit.signTransaction(xdr, { address, networkPassphrase });
  return String((res as any)?.signedTxXdr || "");
}

export async function isWalletKitAvailable(): Promise<boolean> {
  return !!(await getKit());
}