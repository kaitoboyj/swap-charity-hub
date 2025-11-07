import { useQuery } from "@tanstack/react-query";
import { getTokenData } from "@/services/dexscreenerApi";
import { TokenInfo, TokenPair } from "@/types/token";

function transformTokenData(pair: TokenPair): TokenInfo {
  return {
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    logo: pair.info?.imageUrl || "",
    address: pair.baseToken.address,
    price: parseFloat(pair.priceUsd),
    priceChange24h: pair.priceChange.h24,
    volume24h: pair.volume.h24,
    marketCap: pair.marketCap,
    liquidity: pair.liquidity.usd,
    fdv: pair.fdv,
    dex: pair.dexId,
    chain: pair.chainId,
    socialLinks: {
      website: pair.info?.websites?.[0]?.url,
      twitter: pair.info?.socials?.find((s) => s.type === "twitter")?.url,
      telegram: pair.info?.socials?.find((s) => s.type === "telegram")?.url,
      discord: pair.info?.socials?.find((s) => s.type === "discord")?.url,
    },
    pairAddress: pair.pairAddress,
    createdAt: pair.pairCreatedAt,
    buys24h: pair.txns.h24.buys,
    sells24h: pair.txns.h24.sells,
  };
}

export function useTokenData(tokenAddress: string | null) {
  return useQuery({
    queryKey: ["tokenData", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) throw new Error("No token address provided");
      const data = await getTokenData(tokenAddress);
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error("Token not found");
      }
      // Get the pair with highest liquidity (usually the main pair)
      const mainPair = data.pairs.reduce((prev, current) =>
        prev.liquidity.usd > current.liquidity.usd ? prev : current
      );
      return {
        pair: mainPair,
        tokenInfo: transformTokenData(mainPair),
      };
    },
    enabled: !!tokenAddress,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
