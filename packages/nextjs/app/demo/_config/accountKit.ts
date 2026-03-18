import { cookieStorage, createConfig } from "@account-kit/react";
import { alchemy, baseSepolia } from "@account-kit/infra";
import { DEFAULT_ALCHEMY_API_KEY } from "../../../scaffold.config";

// Use a demo-scoped key first so auth remains available even if the main app key is throttled.
const demoAlchemyApiKey = process.env.NEXT_PUBLIC_DEMO_ALCHEMY_API_KEY?.trim() || DEFAULT_ALCHEMY_API_KEY;

export const accountKitConfig = createConfig(
  {
    transport: alchemy({ apiKey: demoAlchemyApiKey }),
    chain: baseSepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID,
    sessionConfig: {
      expirationTimeMs: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  },
  {
    auth: {
      sections: [
        [{ type: "email" as const }],
        [
          { type: "passkey" as const },
          { type: "social" as const, authProviderId: "google" as const, mode: "popup" as const },
        ],
      ],
      addPasskeyOnSignup: false,
    },
  },
);
