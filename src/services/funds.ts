const SOLANA_RPC_ENDPOINT = "https://solana-rpc.publicnode.com";
const COINGECKO_PRICE_ENDPOINT = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

interface SolanaBalanceResponse {
  result?: {
    value?: number;
  };
}

interface CoinGeckoPriceResponse {
  solana?: {
    usd?: number;
  };
}

export interface GrantFundsSnapshot {
  solBalance: number | null;
  solPriceUsd: number | null;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseSolanaBalance(payload: unknown): number | null {
  if (!isRecord(payload)) {
    return null;
  }

  const typedPayload = payload as SolanaBalanceResponse;
  const lamports = typedPayload.result?.value;
  if (typeof lamports !== "number" || Number.isNaN(lamports)) {
    return null;
  }

  return lamports / 1e9;
}

function parseSolanaPrice(payload: unknown): number | null {
  if (!isRecord(payload)) {
    return null;
  }

  const typedPayload = payload as CoinGeckoPriceResponse;
  const price = typedPayload.solana?.usd;
  if (typeof price !== "number" || Number.isNaN(price)) {
    return null;
  }

  return price;
}

async function fetchBalance(walletAddress: string, fetchImpl: typeof fetch): Promise<number> {
  const response = await fetchImpl(SOLANA_RPC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress],
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  const balance = parseSolanaBalance(payload);
  if (balance === null) {
    throw new Error("RPC response did not include a valid SOL balance");
  }

  return balance;
}

async function fetchPrice(fetchImpl: typeof fetch): Promise<number> {
  const response = await fetchImpl(COINGECKO_PRICE_ENDPOINT);
  if (!response.ok) {
    throw new Error(`CoinGecko request failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  const price = parseSolanaPrice(payload);
  if (price === null) {
    throw new Error("CoinGecko response did not include a valid SOL/USD price");
  }

  return price;
}

export async function fetchGrantFunds(
  walletAddress: string,
  fetchImpl: typeof fetch = fetch
): Promise<GrantFundsSnapshot> {
  const [balanceResult, priceResult] = await Promise.allSettled([
    fetchBalance(walletAddress, fetchImpl),
    fetchPrice(fetchImpl),
  ]);

  const errors: string[] = [];
  let solBalance: number | null = null;
  let solPriceUsd: number | null = null;

  if (balanceResult.status === "fulfilled") {
    solBalance = balanceResult.value;
  } else {
    errors.push(`Balance fetch failed: ${String(balanceResult.reason)}`);
  }

  if (priceResult.status === "fulfilled") {
    solPriceUsd = priceResult.value;
  } else {
    errors.push(`Price fetch failed: ${String(priceResult.reason)}`);
  }

  return {
    solBalance,
    solPriceUsd,
    errors,
  };
}
