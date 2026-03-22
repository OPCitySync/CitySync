"use client";

import React, { useEffect, useRef, useState } from "react";
import { decodeEventLog } from "viem";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS } from "../_config/baseSepoliaContracts";

type ActivityRole = "participant" | "issuer" | "redeemer";

type ActivityItem = {
  hash: `0x${string}`;
  label: string;
  blockNumber: bigint;
  timestamp?: bigint;
};

const EXPLORER_TX = "https://sepolia.basescan.org/tx/";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const shortHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-6)}`;

// Map raw contract function/event names → investor-friendly labels
const FRIENDLY_LABELS: Record<string, string> = {
  // OpportunityManager
  createOpportunity: "Task Issued",
  claimOpportunity: "Task Claimed",
  unclaimOpportunity: "Task Unclaimed",
  submitCompletion: "Completion Submitted",
  verifyCompletion: "Completion Verified → CITY Minted",
  setOpportunityActive: "Task Unissued",
  // Redemption events
  CityOfferPurchased: "CITY Redeemed",
  MCEOfferPurchased: "MCE Credits Redeemed",
  purchaseOffer: "CITY Redeemed",
  // TaskProposalRegistry
  proposeTask: "Task Proposed",
  approveTask: "Task Approved",
  // DemoRedeemerRegistry events
  OfferCreated: "Offer Created",
  OfferRateUpdated: "Offer Rate Updated",
  OfferRemoved: "Offer Removed",
  RedeemerRegistered: "Org Registered",
  // DemoRedeemerRegistry functions (fallback)
  createOffer: "Offer Created",
  updateOfferRate: "Offer Rate Updated",
  removeOffer: "Offer Removed",
  register: "Org Registered",
  // Events (from decodeEventLog)
  OpportunityCreated: "Task Issued",
  OpportunityClaimed: "Task Claimed",
  OpportunityUnclaimed: "Task Unclaimed",
  CompletionSubmitted: "Completion Submitted",
  CompletionVerified: "Completion Verified → CITY Minted",
  OpportunityStatusSet: "Task Status Updated",
  TaskProposed: "Task Proposed",
  TaskApproved: "Task Approved",
};

const friendlyLabel = (raw: string) => FRIENDLY_LABELS[raw] ?? raw;

const formatTimestamp = (timestamp?: bigint) => {
  if (!timestamp) return "Pending";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function toItems(
  label: string,
  logs: Array<{ transactionHash?: `0x${string}`; blockNumber?: bigint }>,
): ActivityItem[] {
  return logs
    .map(log => {
      if (!log.transactionHash || log.blockNumber === undefined) return null;
      return {
        hash: log.transactionHash,
        label,
        blockNumber: log.blockNumber,
      };
    })
    .filter(Boolean) as ActivityItem[];
}

export function OnchainActivityPanel({ role, accent }: { role: ActivityRole; accent: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);
  const [rpcError, setRpcError] = useState(false);
  const participantCursorRef = useRef<bigint | null>(null);
  const issuerCursorRef = useRef<bigint | null>(null);
  const issuerProfilesRef = useRef<Map<string, string>>(new Map());
  const issuerProfilesLoadedRef = useRef(false);
  const redeemerCursorRef = useRef<bigint | null>(null);
  const redeemerProfilesRef = useRef<Map<string, string>>(new Map());
  const redeemerProfilesLoadedRef = useRef(false);
  const issuerHydratedRef = useRef(false);
  const issuerPersistenceReadyRef = useRef(false);
  const participantHydratedRef = useRef(false);
  const participantPersistenceReadyRef = useRef(false);
  const redeemerHydratedRef = useRef(false);
  const redeemerPersistenceReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const refreshBlock = async () => {
      try {
        const bn = await baseSepoliaPublicClient.getBlockNumber();
        if (!cancelled) {
          setLatestBlock(bn);
          setRpcError(false);
        }
      } catch {
        // Keep last known block number; surface RPC error if we never connected.
        if (!cancelled) setRpcError(prev => prev || true);
      }
    };

    const onActivityRefresh = () => {
      void refreshBlock();
    };

    void refreshBlock();
    window.addEventListener("citysync:activity-refresh", onActivityRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("citysync:activity-refresh", onActivityRefresh);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "participant") return;
    if (typeof window === "undefined") return;
    participantHydratedRef.current = false;
    participantPersistenceReadyRef.current = false;
    try {
      const raw = window.localStorage.getItem("citysync:demo:participant:activity:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cursor?: string;
        items?: Array<{ hash: `0x${string}`; label: string; blockNumber: string; timestamp?: string | null }>;
      };
      if (parsed.cursor) participantCursorRef.current = BigInt(parsed.cursor);
      if (Array.isArray(parsed.items)) {
        setItems(
          parsed.items.slice(0, 12).map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: BigInt(item.blockNumber),
            timestamp: item.timestamp ? BigInt(item.timestamp) : undefined,
          })),
        );
      }
    } catch {
      // Ignore hydration failures.
    } finally {
      participantHydratedRef.current = true;
    }
  }, [role]);

  useEffect(() => {
    if (role !== "issuer") return;
    if (typeof window === "undefined") return;
    issuerHydratedRef.current = false;
    issuerPersistenceReadyRef.current = false;
    try {
      const raw = window.localStorage.getItem("citysync:demo:issuer:activity:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cursor?: string;
        items?: Array<{ hash: `0x${string}`; label: string; blockNumber: string; timestamp?: string | null }>;
      };
      if (parsed.cursor) issuerCursorRef.current = BigInt(parsed.cursor);
      if (Array.isArray(parsed.items)) {
        setItems(
          parsed.items.slice(0, 12).map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: BigInt(item.blockNumber),
            timestamp: item.timestamp ? BigInt(item.timestamp) : undefined,
          })),
        );
      }
    } catch {
      // Ignore hydration failures.
    } finally {
      issuerHydratedRef.current = true;
    }
  }, [role]);

  useEffect(() => {
    if (role !== "redeemer") return;
    if (typeof window === "undefined") return;
    redeemerHydratedRef.current = false;
    redeemerPersistenceReadyRef.current = false;
    try {
      const raw = window.localStorage.getItem("citysync:demo:redeemer:activity:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cursor?: string;
        items?: Array<{ hash: `0x${string}`; label: string; blockNumber: string; timestamp?: string | null }>;
      };
      if (parsed.cursor) redeemerCursorRef.current = BigInt(parsed.cursor);
      if (Array.isArray(parsed.items)) {
        setItems(
          parsed.items.slice(0, 12).map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: BigInt(item.blockNumber),
            timestamp: item.timestamp ? BigInt(item.timestamp) : undefined,
          })),
        );
      }
    } catch {
      // Ignore hydration failures.
    } finally {
      redeemerHydratedRef.current = true;
    }
  }, [role]);

  useEffect(() => {
    if (role !== "issuer") return;
    if (typeof window === "undefined") return;
    if (!issuerHydratedRef.current) return;
    if (!issuerPersistenceReadyRef.current) {
      issuerPersistenceReadyRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(
        "citysync:demo:issuer:activity:v1",
        JSON.stringify({
          cursor: issuerCursorRef.current?.toString() ?? null,
          items: items.map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: item.blockNumber.toString(),
            timestamp: item.timestamp ? item.timestamp.toString() : null,
          })),
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [items, role]);

  useEffect(() => {
    if (role !== "participant") return;
    if (typeof window === "undefined") return;
    if (!participantHydratedRef.current) return;
    if (!participantPersistenceReadyRef.current) {
      participantPersistenceReadyRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(
        "citysync:demo:participant:activity:v1",
        JSON.stringify({
          cursor: participantCursorRef.current?.toString() ?? null,
          items: items.map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: item.blockNumber.toString(),
            timestamp: item.timestamp ? item.timestamp.toString() : null,
          })),
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [items, role]);

  useEffect(() => {
    if (role !== "redeemer") return;
    if (typeof window === "undefined") return;
    if (!redeemerHydratedRef.current) return;
    if (!redeemerPersistenceReadyRef.current) {
      redeemerPersistenceReadyRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(
        "citysync:demo:redeemer:activity:v1",
        JSON.stringify({
          cursor: redeemerCursorRef.current?.toString() ?? null,
          items: items.map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: item.blockNumber.toString(),
            timestamp: item.timestamp ? item.timestamp.toString() : null,
          })),
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [items, role]);

  useEffect(() => {
    const run = async () => {
      if (latestBlock === null) return;

      if (role === "participant") {
        if (participantCursorRef.current === null) {
          participantCursorRef.current = latestBlock > 8_000n ? latestBlock - 8_000n : 0n;
        }

        let from = participantCursorRef.current + 1n;
        if (from > latestBlock) return;

        const newItems: ActivityItem[] = [];
        const seen = new Set<string>();
        const chunk = 2_000n;

        // Track OpportunityManager events (claim, submit, verify)
        // AND redemption contracts (DemoCityRedemption, MCERedemption)
        // Batch all three into a single getLogs call per chunk.
        const PARTICIPANT_ADDRESSES = [
          BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address,
          BASE_SEPOLIA_CONTRACTS.MCERedemption.address,
        ] as const;

        const PARTICIPANT_ABI_BY_ADDRESS: Record<string, readonly unknown[]> = {
          [BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase()]:
            BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          [BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address.toLowerCase()]:
            BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.abi,
          [BASE_SEPOLIA_CONTRACTS.MCERedemption.address.toLowerCase()]: BASE_SEPOLIA_CONTRACTS.MCERedemption.abi,
        };

        const participantRelevant = new Set([
          "OpportunityClaimed",
          "OpportunityUnclaimed",
          "CompletionSubmitted",
          "CompletionVerified",
          "CityOfferPurchased",
          "MCEOfferPurchased",
        ]);

        while (from <= latestBlock) {
          const to = from + chunk > latestBlock ? latestBlock : from + chunk;

          const logs = await baseSepoliaPublicClient
            .getLogs({ address: PARTICIPANT_ADDRESSES, fromBlock: from, toBlock: to } as any)
            .catch((err: unknown) => {
              console.warn("[participant panel] getLogs failed:", err);
              return [];
            });

          for (const log of logs as any[]) {
            const hash = log.transactionHash as `0x${string}` | undefined;
            const bn = log.blockNumber as bigint | undefined;
            if (!hash || bn === undefined) continue;

            // Look up ABI by the log's emitting address
            const logAddr = (log.address as string | undefined)?.toLowerCase() ?? "";
            const abi = PARTICIPANT_ABI_BY_ADDRESS[logAddr];
            if (!abi) continue;

            let eventName = "";
            let actorAddress: string | undefined;
            try {
              const decoded = decodeEventLog({
                abi: abi as any,
                topics: [...(log.topics as readonly `0x${string}`[])] as any,
                data: log.data,
              }) as { eventName: string; args: Record<string, unknown> };
              eventName = decoded.eventName;
              if (typeof decoded.args.citizen === "string") {
                actorAddress = decoded.args.citizen;
              }
            } catch {
              continue;
            }

            if (!participantRelevant.has(eventName)) continue;

            const actorLabel =
              actorAddress && actorAddress.toLowerCase() !== ZERO_ADDR
                ? `${actorAddress.slice(0, 6)}...${actorAddress.slice(-4)}`
                : "Participant Network";

            const action = friendlyLabel(eventName || "contractCall");
            const key = `${hash}:${action}`;
            if (seen.has(key)) continue;
            seen.add(key);

            newItems.push({ hash, blockNumber: bn, label: `${actorLabel} · ${action}` });
          }

          from = to + 1n;
        }

        participantCursorRef.current = latestBlock;
        if (newItems.length === 0) return;

        const uniqueBlocks = Array.from(new Set(newItems.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
        const blockPairs = await Promise.all(
          uniqueBlocks.map(async bn => {
            try {
              const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
              return [bn.toString(), block.timestamp] as const;
            } catch {
              return [bn.toString(), undefined] as const;
            }
          }),
        );
        const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

        setItems(prev => {
          const merged = [
            ...newItems.map(item => ({ ...item, timestamp: blockTimeMap.get(item.blockNumber.toString()) })),
            ...prev,
          ];
          const dedup = new Map<string, ActivityItem>();
          merged.forEach(item => {
            const key = `${item.hash}:${item.label}`;
            if (!dedup.has(key)) dedup.set(key, item);
          });
          return Array.from(dedup.values())
            .sort((a, b) => Number(b.blockNumber - a.blockNumber))
            .slice(0, 12);
        });
        return;
      }

      if (role === "issuer") {
        if (!issuerProfilesLoadedRef.current) {
          try {
            const issuers = (await baseSepoliaPublicClient.readContract({
              address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
              abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
              functionName: "getAllIssuers",
              args: [],
            })) as `0x${string}`[];

            const profiles = await Promise.all(
              issuers.map(async issuer => {
                try {
                  const p = (await baseSepoliaPublicClient.readContract({
                    address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
                    abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
                    functionName: "getProfile",
                    args: [issuer],
                  })) as { orgName: string; active: boolean; registeredAt: bigint };
                  if (p.active && p.registeredAt > 0n && p.orgName) return [issuer.toLowerCase(), p.orgName] as const;
                } catch {
                  // fallback below
                }
                return [issuer.toLowerCase(), `${issuer.slice(0, 6)}...${issuer.slice(-4)}`] as const;
              }),
            );

            profiles.forEach(([addr, name]) => issuerProfilesRef.current.set(addr, name));
          } catch {
            // Non-fatal; fallback labels will still render.
          } finally {
            issuerProfilesLoadedRef.current = true;
          }
        }

        if (issuerCursorRef.current === null) {
          issuerCursorRef.current = latestBlock > 8_000n ? latestBlock - 8_000n : 0n;
        }

        let from = issuerCursorRef.current + 1n;
        if (from > latestBlock) return;

        const newItems: ActivityItem[] = [];
        const seen = new Set<string>();
        const chunk = 2_000n;

        // Batch both issuer contracts into a single getLogs call per chunk.
        const ISSUER_ADDRESSES = [
          BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.address,
        ] as const;

        const ISSUER_ABI_BY_ADDRESS: Record<string, { abi: readonly unknown[]; relevant: Set<string> }> = {
          [BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase()]: {
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            relevant: new Set(["OpportunityCreated", "CompletionVerified", "OpportunityStatusSet"]),
          },
          [BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.address.toLowerCase()]: {
            abi: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.abi,
            relevant: new Set(["TaskProposed", "TaskApproved"]),
          },
        };

        while (from <= latestBlock) {
          const to = from + chunk > latestBlock ? latestBlock : from + chunk;

          const logs = await baseSepoliaPublicClient
            .getLogs({ address: ISSUER_ADDRESSES, fromBlock: from, toBlock: to } as any)
            .catch((err: unknown) => {
              console.warn("[issuer panel] getLogs failed:", err);
              return [];
            });

          for (const log of logs as any[]) {
            const hash = log.transactionHash as `0x${string}` | undefined;
            const bn = log.blockNumber as bigint | undefined;
            if (!hash || bn === undefined) continue;

            const logAddr = (log.address as string | undefined)?.toLowerCase() ?? "";
            const contractInfo = ISSUER_ABI_BY_ADDRESS[logAddr];
            if (!contractInfo) continue;

            let eventName = "";
            let issuerAddress: string | undefined;
            let opportunityActive: boolean | undefined;
            try {
              const decoded = decodeEventLog({
                abi: contractInfo.abi as any,
                topics: [...(log.topics as readonly `0x${string}`[])] as any,
                data: log.data,
              }) as { eventName: string; args: Record<string, unknown> };
              eventName = decoded.eventName;
              if (eventName === "OpportunityCreated" && typeof decoded.args.issuer === "string") {
                issuerAddress = decoded.args.issuer;
              } else if (eventName === "TaskProposed" && typeof decoded.args.proposer === "string") {
                issuerAddress = decoded.args.proposer;
              } else if (eventName === "TaskApproved" && typeof decoded.args.approver === "string") {
                issuerAddress = decoded.args.approver;
              } else if (eventName === "OpportunityStatusSet" && typeof decoded.args.active === "boolean") {
                opportunityActive = decoded.args.active;
              }
            } catch {
              continue;
            }

            if (!contractInfo.relevant.has(eventName)) continue;

            let actorLabel = "Issuer Network";
            if (issuerAddress && issuerAddress.toLowerCase() !== ZERO_ADDR) {
              actorLabel =
                issuerProfilesRef.current.get(issuerAddress.toLowerCase()) ??
                `${issuerAddress.slice(0, 6)}...${issuerAddress.slice(-4)}`;
            }

            if (
              (eventName === "CompletionVerified" || eventName === "OpportunityStatusSet") &&
              actorLabel === "Issuer Network"
            ) {
              try {
                const tx = await baseSepoliaPublicClient.getTransaction({ hash });
                const fromAddr = tx.from.toLowerCase();
                actorLabel = issuerProfilesRef.current.get(fromAddr) ?? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`;
              } catch {
                // leave fallback label
              }
            }

            const action =
              eventName === "OpportunityStatusSet"
                ? opportunityActive === false
                  ? "Task Unissued"
                  : "Task Reissued"
                : friendlyLabel(eventName);
            const key = `${hash}:${action}`;
            if (seen.has(key)) continue;
            seen.add(key);

            newItems.push({ hash, blockNumber: bn, label: `${actorLabel} · ${action}` });
          }

          from = to + 1n;
        }

        issuerCursorRef.current = latestBlock;
        if (newItems.length === 0) return;

        const uniqueBlocks = Array.from(new Set(newItems.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
        const blockPairs = await Promise.all(
          uniqueBlocks.map(async bn => {
            try {
              const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
              return [bn.toString(), block.timestamp] as const;
            } catch {
              return [bn.toString(), undefined] as const;
            }
          }),
        );
        const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

        setItems(prev => {
          const merged = [
            ...newItems.map(item => ({ ...item, timestamp: blockTimeMap.get(item.blockNumber.toString()) })),
            ...prev,
          ];
          const dedup = new Map<string, ActivityItem>();
          merged.forEach(item => {
            const key = `${item.hash}:${item.label}`;
            if (!dedup.has(key)) dedup.set(key, item);
          });
          return Array.from(dedup.values())
            .sort((a, b) => Number(b.blockNumber - a.blockNumber))
            .slice(0, 12);
        });

        return;
      }

      if (role === "redeemer") {
        if (!redeemerProfilesLoadedRef.current) {
          try {
            const redeemers = (await baseSepoliaPublicClient.readContract({
              address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
              abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
              functionName: "getAllRedeemers",
              args: [],
            })) as `0x${string}`[];

            const profiles = await Promise.all(
              redeemers.map(async redeemer => {
                try {
                  const p = (await baseSepoliaPublicClient.readContract({
                    address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
                    abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
                    functionName: "getProfile",
                    args: [redeemer],
                  })) as { orgName: string; active: boolean; registeredAt: bigint };
                  if (p.active && p.registeredAt > 0n && p.orgName) {
                    return [redeemer.toLowerCase(), p.orgName] as const;
                  }
                } catch {
                  // fallback below
                }
                return [redeemer.toLowerCase(), `${redeemer.slice(0, 6)}...${redeemer.slice(-4)}`] as const;
              }),
            );

            profiles.forEach(([addr, name]) => redeemerProfilesRef.current.set(addr, name));
          } catch {
            // Non-fatal.
          } finally {
            redeemerProfilesLoadedRef.current = true;
          }
        }

        if (redeemerCursorRef.current === null) {
          redeemerCursorRef.current = latestBlock > 8_000n ? latestBlock - 8_000n : 0n;
        }

        let from = redeemerCursorRef.current + 1n;
        if (from > latestBlock) return;

        // Batch all three redeemer contracts into ONE getLogs call per chunk.
        // Previously 3 separate calls × 20 chunks = 60 RPC calls; now just 4.
        const REDEEMER_ADDRESSES = [
          BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address,
          BASE_SEPOLIA_CONTRACTS.MCERedemption.address,
        ] as const;

        // Map each contract address → its ABI + fallback event name for decoding
        const ABI_BY_ADDRESS: Record<string, { abi: readonly unknown[]; fallback: string }> = {
          [BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address.toLowerCase()]: {
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
            fallback: "OfferCreated",
          },
          [BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address.toLowerCase()]: {
            abi: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.abi,
            fallback: "CityOfferPurchased",
          },
          [BASE_SEPOLIA_CONTRACTS.MCERedemption.address.toLowerCase()]: {
            abi: BASE_SEPOLIA_CONTRACTS.MCERedemption.abi,
            fallback: "MCEOfferPurchased",
          },
        };

        const redeemerRelevant = new Set([
          "OfferCreated",
          "OfferRateUpdated",
          "OfferRemoved",
          "RedeemerRegistered",
          "CityOfferPurchased",
          "MCEOfferPurchased",
        ]);

        const newItems: ActivityItem[] = [];
        const seen = new Set<string>();
        const chunk = 2_000n; // larger chunk → fewer total calls

        while (from <= latestBlock) {
          const to = from + chunk > latestBlock ? latestBlock : from + chunk;

          // Single batched call for all three contracts
          const logs = await baseSepoliaPublicClient
            .getLogs({
              address: REDEEMER_ADDRESSES,
              fromBlock: from,
              toBlock: to,
            } as any)
            .catch((err: unknown) => {
              console.warn("[redeemer panel] getLogs failed:", err);
              return [];
            });

          for (const log of logs as any[]) {
            const hash = log.transactionHash as `0x${string}` | undefined;
            const bn = log.blockNumber as bigint | undefined;
            if (!hash || bn === undefined) continue;

            // Identify which contract emitted this log
            const logAddr = (log.address as string | undefined)?.toLowerCase() ?? "";
            const contractInfo = ABI_BY_ADDRESS[logAddr];
            if (!contractInfo) continue;

            let eventName: string = contractInfo.fallback;
            let actorAddress: string | undefined;
            let decodeOk = false;

            try {
              const decoded = decodeEventLog({
                abi: contractInfo.abi as any,
                topics: [...(log.topics as readonly `0x${string}`[])] as any,
                data: log.data,
              }) as { eventName: string; args: Record<string, unknown> };
              eventName = decoded.eventName;
              decodeOk = true;
              // Extract the redeemer address — present in all three contracts' events
              if (typeof decoded.args.redeemer === "string") {
                actorAddress = decoded.args.redeemer;
              }
            } catch {
              // Event not in our ABI (e.g. MCEOptInChanged, Paused, RoleGranted).
              // Keep contractInfo.fallback so the item still surfaces.
            }

            // Skip events we decoded but don't care about
            if (decodeOk && !redeemerRelevant.has(eventName)) continue;

            let actorLabel = "Redeemer Network";
            if (actorAddress && actorAddress.toLowerCase() !== ZERO_ADDR) {
              actorLabel =
                redeemerProfilesRef.current.get(actorAddress.toLowerCase()) ??
                `${actorAddress.slice(0, 6)}...${actorAddress.slice(-4)}`;
            }

            const action = friendlyLabel(eventName);
            const key = `${hash}:${action}`;
            if (seen.has(key)) continue;
            seen.add(key);

            newItems.push({
              hash,
              blockNumber: bn,
              label: `${actorLabel} · ${action}`,
            });
          }

          from = to + 1n;
        }

        redeemerCursorRef.current = latestBlock;
        if (newItems.length === 0) return;

        const uniqueBlocks = Array.from(new Set(newItems.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
        const blockPairs = await Promise.all(
          uniqueBlocks.map(async bn => {
            try {
              const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
              return [bn.toString(), block.timestamp] as const;
            } catch {
              return [bn.toString(), undefined] as const;
            }
          }),
        );
        const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

        setItems(prev => {
          const merged = [
            ...newItems.map(item => ({ ...item, timestamp: blockTimeMap.get(item.blockNumber.toString()) })),
            ...prev,
          ];
          const dedup = new Map<string, ActivityItem>();
          merged.forEach(item => {
            const key = `${item.hash}:${item.label}`;
            if (!dedup.has(key)) dedup.set(key, item);
          });
          return Array.from(dedup.values())
            .sort((a, b) => Number(b.blockNumber - a.blockNumber))
            .slice(0, 12);
        });

        return;
      }

      const roleContracts = [
        { address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address, label: "Participant Task Activity" },
        { address: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address, label: "Participant Redemption Activity" },
        { address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address, label: "Participant MCE Activity" },
      ];

      const fetchLogsBackwards = async (address: `0x${string}`) => {
        const collected: Array<{ transactionHash?: `0x${string}`; blockNumber?: bigint }> = [];
        let cursor = latestBlock;
        let step = 2_000n;

        for (let i = 0; i < 12 && cursor >= 0n && collected.length < 24; i++) {
          const fromBlock = cursor > step ? cursor - step : 0n;
          try {
            const logs = await baseSepoliaPublicClient.getLogs({
              address,
              fromBlock,
              toBlock: cursor,
            } as any);
            collected.push(...logs);
            if (fromBlock === 0n) break;
            cursor = fromBlock - 1n;
          } catch {
            if (step > 250n) {
              step = step / 2n;
              continue;
            }
            break;
          }
        }

        return collected;
      };

      const settled = await Promise.allSettled(roleContracts.map(c => fetchLogsBackwards(c.address)));
      const next: ActivityItem[] = [];
      settled.forEach((s, i) => {
        if (s.status === "fulfilled") next.push(...toItems(roleContracts[i].label, s.value || []));
      });

      next.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      const top = next.slice(0, 12);

      const uniqueBlocks = Array.from(new Set(top.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
      const blockPairs = await Promise.all(
        uniqueBlocks.map(async bn => {
          try {
            const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
            return [bn.toString(), block.timestamp] as const;
          } catch {
            return [bn.toString(), undefined] as const;
          }
        }),
      );
      const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

      const hydrated = top.map(item => ({
        ...item,
        timestamp: blockTimeMap.get(item.blockNumber.toString()),
      }));
      if (hydrated.length > 0) setItems(hydrated);
    };

    void run();
  }, [latestBlock, role]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(31,45,86,0.12)",
        borderRadius: 16,
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(27,45,95,0.5)",
          marginBottom: 6,
        }}
      >
        Onchain Activity Panel
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: accent,
          marginBottom: 10,
        }}
      >
        {role === "issuer"
          ? "Global Issuer Activity"
          : role === "redeemer"
            ? "Global Redeemer Activity"
            : "Global Participant Activity"}
      </div>

      {rpcError && latestBlock === null ? (
        <div style={{ fontSize: 12, color: "rgba(193,111,41,0.9)" }}>
          ⚠ RPC connection failed — add <code>NEXT_PUBLIC_ALCHEMY_API_KEY</code> to Vercel env vars and redeploy.
        </div>
      ) : latestBlock === null ? (
        <div style={{ fontSize: 12, color: "rgba(27,45,95,0.5)" }}>Connecting to Base Sepolia…</div>
      ) : items.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(27,45,95,0.58)" }}>No recent transactions detected yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, idx) => (
            <a
              key={`${item.hash}-${idx}`}
              href={`${EXPLORER_TX}${item.hash}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "rgba(245,248,255,0.92)",
                border: "1px solid rgba(31,45,86,0.12)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#1d2f63",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "rgba(30,48,97,0.62)", fontFamily: "monospace" }}>
                  {shortHash(item.hash)}
                </div>
                <div style={{ fontSize: 11, color: "rgba(30,48,97,0.58)" }}>
                  Block {item.blockNumber.toString()} · {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "rgba(30,48,97,0.62)", whiteSpace: "nowrap" }}>View Tx ↗</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
