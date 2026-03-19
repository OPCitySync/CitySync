import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { DEFAULT_ALCHEMY_API_KEY } from "../../../scaffold.config";

const demoAlchemyApiKey =
  process.env.NEXT_PUBLIC_DEMO_ALCHEMY_API_KEY?.trim() ||
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY?.trim() ||
  DEFAULT_ALCHEMY_API_KEY;

const rpcUrl = demoAlchemyApiKey
  ? `https://base-sepolia.g.alchemy.com/v2/${demoAlchemyApiKey}`
  : baseSepolia.rpcUrls.default.http[0];

export const baseSepoliaPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});
