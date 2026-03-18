import deployedContracts from "~~/contracts/deployedContracts";

const localAbis = deployedContracts[31337];
const demoCityRedemptionAddress =
  (process.env.NEXT_PUBLIC_DEMO_CITY_REDEMPTION as `0x${string}` | undefined) ??
  ("0xcdB6734c5c454Fb9b750Ae390F4B9C5A8bF64c70" as `0x${string}`);

export const BASE_SEPOLIA_CONTRACTS = {
  CityToken: {
    address: "0xBFB2Ed31df8DD84FfC00B031E645252B61746A4D" as const,
    abi: localAbis.CityToken.abi,
  },
  VoteToken: {
    address: "0x8774d12123CD6B164e6a0A70C3A8B3cBe01f742F" as const,
    abi: localAbis.VoteToken.abi,
  },
  MCECredit: {
    address: "0xA9871ba086dD007B3381F2A8d359cCa885E1f450" as const,
    // Minimal ABI needed for wallet balance sync.
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      },
    ] as const,
  },
  OpportunityManager: {
    address: "0x7dC90AAfCAC2eaDC8d28e12cd300BD3503d3B78e" as const,
    abi: localAbis.OpportunityManager.abi,
  },
  RedeemerRegistry: {
    address: "0x91D76EC853a2f0D7bDb1c555a5f478CECC9E4c33" as const,
    abi: localAbis.RedeemerRegistry.abi,
  },
  IssuerRegistryDemo: {
    address: "0xF8498c6b96e5249355f1c0FAcC9996B644260B67" as const,
    abi: [
      {
        type: "function",
        name: "register",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [{ name: "orgName", type: "string", internalType: "string" }],
      },
      {
        type: "function",
        name: "isActiveIssuer",
        stateMutability: "view",
        inputs: [{ name: "issuer", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
      },
      {
        type: "function",
        name: "getAllIssuers",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
      },
      {
        type: "function",
        name: "getProfile",
        stateMutability: "view",
        inputs: [{ name: "issuer", type: "address", internalType: "address" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct IssuerRegistry.IssuerProfile",
            components: [
              { name: "orgName", type: "string", internalType: "string" },
              { name: "registeredAt", type: "uint64", internalType: "uint64" },
              { name: "active", type: "bool", internalType: "bool" },
              { name: "totalTasksIssued", type: "uint256", internalType: "uint256" },
              { name: "totalCreditsIssued", type: "uint256", internalType: "uint256" },
            ],
          },
        ],
      },
    ] as const,
  },
  DemoRedeemerRegistry: {
    address: "0x605109026AE111297558774CD6bb8FAD5d248997" as const,
    abi: [
      {
        type: "function",
        name: "register",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [{ name: "orgName", type: "string", internalType: "string" }],
      },
      {
        type: "function",
        name: "setMCEOptIn",
        stateMutability: "nonpayable",
        inputs: [{ name: "accepts", type: "bool", internalType: "bool" }],
        outputs: [],
      },
      {
        type: "function",
        name: "createOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "name", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "costCity", type: "uint256", internalType: "uint256" },
          { name: "mceOnly", type: "bool", internalType: "bool" },
        ],
        outputs: [{ name: "offerId", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "function",
        name: "updateOfferRate",
        stateMutability: "nonpayable",
        inputs: [
          { name: "offerId", type: "uint256", internalType: "uint256" },
          { name: "newCost", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
      },
      {
        type: "function",
        name: "removeOffer",
        stateMutability: "nonpayable",
        inputs: [{ name: "offerId", type: "uint256", internalType: "uint256" }],
        outputs: [],
      },
      {
        type: "function",
        name: "isActiveRedeemer",
        stateMutability: "view",
        inputs: [{ name: "redeemer", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
      },
      {
        type: "function",
        name: "getAllRedeemers",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
      },
      {
        type: "function",
        name: "nextOfferId",
        stateMutability: "view",
        inputs: [{ name: "", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "function",
        name: "getOffer",
        stateMutability: "view",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct DemoRedeemerRegistry.Offer",
            components: [
              { name: "name", type: "string", internalType: "string" },
              { name: "description", type: "string", internalType: "string" },
              { name: "costCity", type: "uint256", internalType: "uint256" },
              { name: "active", type: "bool", internalType: "bool" },
              { name: "mceOnly", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      {
        type: "function",
        name: "getProfile",
        stateMutability: "view",
        inputs: [{ name: "redeemer", type: "address", internalType: "address" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct DemoRedeemerRegistry.RedeemerProfile",
            components: [
              { name: "orgName", type: "string", internalType: "string" },
              { name: "registeredAt", type: "uint64", internalType: "uint64" },
              { name: "active", type: "bool", internalType: "bool" },
              { name: "acceptsMCECredits", type: "bool", internalType: "bool" },
            ],
          },
        ],
      },
      {
        type: "event",
        name: "OfferCreated",
        inputs: [
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "offerId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "name", type: "string", indexed: false, internalType: "string" },
          { name: "cost", type: "uint256", indexed: false, internalType: "uint256" },
          { name: "mceOnly", type: "bool", indexed: false, internalType: "bool" },
        ],
      },
      {
        type: "event",
        name: "OfferRemoved",
        inputs: [
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "offerId", type: "uint256", indexed: true, internalType: "uint256" },
        ],
      },
      {
        type: "event",
        name: "OfferRateUpdated",
        inputs: [
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "offerId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "newCost", type: "uint256", indexed: false, internalType: "uint256" },
        ],
      },
      {
        type: "event",
        name: "RedeemerRegistered",
        inputs: [
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "orgName", type: "string", indexed: false, internalType: "string" },
        ],
      },
    ] as const,
  },
  MCERedemption: {
    address: "0xDf90eA13d3b550042516A5859e6217C705cA4B43" as const,
    abi: [
      {
        type: "function",
        name: "purchaseOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "receiptId", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "event",
        name: "MCEOfferPurchased",
        inputs: [
          { name: "receiptId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "citizen", type: "address", indexed: true, internalType: "address" },
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "offerId", type: "uint256", indexed: false, internalType: "uint256" },
          { name: "costMCE", type: "uint256", indexed: false, internalType: "uint256" },
          { name: "offerName", type: "string", indexed: false, internalType: "string" },
        ],
      },
    ] as const,
  },
  DemoCityRedemption: {
    address: demoCityRedemptionAddress,
    abi: [
      {
        type: "function",
        name: "purchaseOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "receiptId", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "event",
        name: "CityOfferPurchased",
        inputs: [
          { name: "receiptId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "citizen", type: "address", indexed: true, internalType: "address" },
          { name: "redeemer", type: "address", indexed: true, internalType: "address" },
          { name: "offerId", type: "uint256", indexed: false, internalType: "uint256" },
          { name: "costCity", type: "uint256", indexed: false, internalType: "uint256" },
          { name: "offerName", type: "string", indexed: false, internalType: "string" },
        ],
      },
    ] as const,
  },
  Redemption: {
    address: "0x6A8b52af006AD29aC9051766Ab39C368f2178cBB" as const,
    abi: [
      {
        type: "function",
        name: "purchaseOffer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "redeemer", type: "address", internalType: "address" },
          { name: "offerId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "receiptId", type: "uint256", internalType: "uint256" }],
      },
    ] as const,
  },
  TaskProposalRegistry: {
    address: ((process.env.NEXT_PUBLIC_TASK_PROPOSAL_REGISTRY as `0x${string}` | undefined) ??
      "0x2cfbf7212375F687943596916441efcbe1dEc19e") as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "proposeTask",
        stateMutability: "nonpayable",
        inputs: [
          { name: "title", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "successCriteria", type: "string", internalType: "string" },
          { name: "estimatedTime", type: "string", internalType: "string" },
          { name: "location", type: "string", internalType: "string" },
          { name: "creditReward", type: "uint256", internalType: "uint256" },
          { name: "voteReward", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
      },
      {
        type: "function",
        name: "approveTask",
        stateMutability: "nonpayable",
        inputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
        outputs: [],
      },
      {
        type: "function",
        name: "getProposal",
        stateMutability: "view",
        inputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct TaskProposalRegistry.Proposal",
            components: [
              { name: "proposer", type: "address", internalType: "address" },
              { name: "title", type: "string", internalType: "string" },
              { name: "description", type: "string", internalType: "string" },
              { name: "successCriteria", type: "string", internalType: "string" },
              { name: "estimatedTime", type: "string", internalType: "string" },
              { name: "location", type: "string", internalType: "string" },
              { name: "creditReward", type: "uint256", internalType: "uint256" },
              { name: "voteReward", type: "uint256", internalType: "uint256" },
              { name: "proposedAt", type: "uint64", internalType: "uint64" },
              { name: "reviewedAt", type: "uint64", internalType: "uint64" },
              { name: "reviewedBy", type: "address", internalType: "address" },
              { name: "status", type: "uint8", internalType: "enum TaskProposalRegistry.ProposalStatus" },
            ],
          },
        ],
      },
      {
        type: "function",
        name: "getProposalsByIssuer",
        stateMutability: "view",
        inputs: [{ name: "issuer", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
      },
      {
        type: "event",
        name: "TaskProposed",
        inputs: [
          { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "proposer", type: "address", indexed: true, internalType: "address" },
          { name: "title", type: "string", indexed: false, internalType: "string" },
          { name: "creditReward", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "TaskApproved",
        inputs: [
          { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
          { name: "approver", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
      },
    ] as const,
  },
} as const;

export type DemoOfferRoute = {
  redeemer: `0x${string}`;
  offerId: bigint;
  mode: "city" | "mce";
};

/**
 * Optional mapping for participant redemption routing:
 * key = mock offer id (e.g. "offer-1"), value = onchain redeemer + offer id.
 *
 * Set via env as JSON:
 * NEXT_PUBLIC_DEMO_OFFER_ROUTES='{"offer-1":{"redeemer":"0x...","offerId":"1","mode":"city"}}'
 */
export const DEMO_OFFER_ROUTES: Record<string, DemoOfferRoute> = (() => {
  const raw = process.env.NEXT_PUBLIC_DEMO_OFFER_ROUTES;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      { redeemer: `0x${string}`; offerId: string | number; mode: "city" | "mce" }
    >;
    const routes: Record<string, DemoOfferRoute> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (!value?.redeemer || !value?.offerId || !value?.mode) continue;
      routes[key] = {
        redeemer: value.redeemer,
        offerId: BigInt(value.offerId),
        mode: value.mode,
      };
    }

    return routes;
  } catch {
    return {};
  }
})();
