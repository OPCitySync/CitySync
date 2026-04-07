# CitySync

**Civic participation infrastructure for local communities.**

CitySync is an onchain system that turns verified civic actions into redeemable credits by connecting residents, local organizations, and community businesses in a closed-loop economy of contribution and access.

---

## What It Does

Residents earn **CITY** (civic credits) by completing verified civic-labor through volunteering, staffing events, participating in local governance, etc. Those credits are redeemable with local businesses and services as tangible rewards.

**Three roles:**
- **Participant** — Complete tasks, earn credits, vote on community initiatives, redeem rewards
- **Issuer** — Organizations that post tasks and verify completions (nonprofits, city departments, civic orgs)
- **Redeemer** — Local businesses and services that accept CITY credits in exchange for goods or discounts

**Three onchain assets:**
- `CITY` — Soul-bound civic credit (ERC-20, non-transferable)
- `VOTE` — Soul-bound governance token (ERC-20Votes, non-transferable)
- `MCE` — Soul-bound credits used for specific city-wide event missions.  (Available to a larger redemption universe)

---

## Try the Demo

Live at **[demo.city-sync.org](https://demo.city-sync.org)**

The interactive demo lets you explore all three roles with simulated state — no wallet required. Credits earned as a Participant are spendable at Redeemer offers. Issuer verifications increment real stats. Cross-role state is shared.

---

## Project Structure

```
citysync/
├── landing/                  # city-sync.org landing page (separate Vercel project)
├── packages/
│   ├── nextjs/               # dApp frontend (demo.city-sync.org)
│   │   └── app/
│   │       ├── demo/         # Interactive three-role demo (mocked data)
│   │       └── citysync/     # Pilot dApp (live contract integration)
│   └── foundry/              # Smart contracts
│       └── contracts/
│           ├── citysync/     # Pilot contracts (token, opportunity, redeem)
│           └── demo/         # Demo contracts (MCE system, identity registries)
└── docs/
    ├── SESSION.md            # Development session log
    ├── brand/                # Brand assets
    └── references/           # Research essays and source material
```

---

## Smart Contracts

Deployed on **Base Sepolia** testnet.

| Contract | Address |
|----------|---------|
| CityToken | `0xA1526B32AF6aA6CE824F8734E967aD410192b05c` |
| VoteToken | `0xEEa4fBc7a74504A3095AF042D487cFFf2ebff1eC` |
| MCECredit | `0x0f62c344264eDBCDFcDF55579191557259D6Ef0D` |
| IssuerRegistry | `0x513c1e9c303Ed184D7eed07e48555DAaCE5CEbD2` |
| DemoRedeemerRegistry | `0xB9d731DE9fbe753b707ACe82E9A6C4061522240E` |
| MCERegistry | `0xDf7BafF494604846d45CD32c314F07cdFe2d6c7B` |
| MCETaskRegistry | `0xC1f6a6Ad4869D46eEd522eDccD9590c7DCB2585B` |
| OpportunityManager | `0x613b383907275871171A8cEBD8273D965582a2ac` |
| Redemption | `0xc7C285d9454251896c4F11C075D7A0Bcc3910C6D` |

---

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS, wagmi, viem
- **Contracts:** Solidity, Foundry
- **Chain:** Base Sepolia (ERC-4337 Paymaster via Alchemy Account Kit for gasless UX)
- **Infra:** Vercel (two projects — landing page + dApp)

---

## Dev Setup

```bash
# Install dependencies
yarn install

# Run the frontend locally
cd packages/nextjs && yarn dev

# Run contract tests
cd packages/foundry && forge test
```

---

## Links

- **Landing page:** [city-sync.org](https://city-sync.org)
- **Demo:** [demo.city-sync.org](https://demo.city-sync.org)
- **Base Sepolia explorer:** [sepolia.basescan.org](https://sepolia.basescan.org)
