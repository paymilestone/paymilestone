import axios from "axios";
import { getConnectedWalletAddress } from "@/lib/wallet/wallet-store";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://api.paymilestone.xyz";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const wallet = getConnectedWalletAddress();
  if (wallet) {
    config.headers = config.headers ?? {};
    config.headers["X-Wallet-Address"] = wallet;
  }
  return config;
});

export default apiClient;
