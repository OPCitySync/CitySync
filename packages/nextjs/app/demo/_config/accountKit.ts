import { cookieStorage, createConfig } from "@account-kit/react";
import { alchemy, baseSepolia } from "@account-kit/infra";

export const accountKitConfig = createConfig(
  {
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
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
