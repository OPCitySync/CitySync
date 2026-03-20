# Civic-Credit Economy: Formal Equilibrium Model

*A mathematical framework for governing issuance, redemption, and growth in a bounded civic-labor credit system.*

*Version 2 — Dormancy-based expiry model (12-month inactivity threshold, no hard cap on credit age)*

---

## 1. Model Variables and Parameters

The model operates in discrete time periods (indexed by **t**, typically months).

### State Variables

The system tracks two pools of credits:

- `A(t)` — Active stock: credits held by participants who have earned or redeemed within the last 12 months. Only active stock generates redemption demand.
- `D(t)` — Dormant stock: credits held by participants who have not earned or redeemed for more than 12 months. Dormant credits are inert — they do not generate redemption demand and are pending expiry.
- `S(t) = A(t) + D(t)` — Total outstanding stock.

Dormant stock is tracked as a 12-month queue:

```
D_queue = [d₀, d₁, d₂, ..., d₁₁]
```

Where `d₀` is credits that became dormant this month and `d₁₁` is credits that have been dormant for 12 months and are now eligible for expiry. Each month the queue advances: `d₁₁` expires, everything shifts forward by one position, and new dormant credits enter at `d₀`.

### Flow Variables (per period)

- `I(t)` — Gross issuance: new credits minted for verified civic-labor (enters active stock)
- `B(t)` — Burns: credits redeemed and destroyed by Redeemer Organizations (leaves active stock)
- `X(t)` — Expiry: dormant credits that have completed 12 months of inactivity (leaves dormant stock)
- `Q(t)` — Churn flow: credits moving from active stock to dormant stock (participants going inactive)
- `R(t)` — Reactivation flow: credits moving from dormant stock back to active stock (dormant participants returning)

### System Parameters

- `C(t)` — Redemption capacity: maximum credits the Redeemer universe can absorb per period
- `r` — Redemption propensity: fraction of active stock that holders attempt to redeem per period (behavioral parameter)
- `δ` — Monthly churn rate: fraction of active stock whose holders become inactive each month (behavioral parameter — reflects participant retention)
- `ρ` — Reactivation rate: fraction of dormant stock whose holders return to activity each month (behavioral parameter — typically small)
- `Ī` — Issuance cap: governance-set maximum on `I(t)`

### Control Variables (governance levers)

- Issuance cap `Ī` — set by Issuer Committee
- Task pricing — determines how many credits each task category generates
- Redemption rates — credit cost per service, set by individual Redeemers with Committee guidance
- Capacity expansion — onboarding new Redeemer Organizations or expanding existing capacity
- Dormancy threshold — governance-settable in smart contract (currently 12 months)

---

## 2. Stock-Flow Dynamics

### The Fundamental Equations

**Active stock:**

```
A(t) = A(t-1) + I(t) - B(t) - Q(t) + R(t)
```

Credits enter the active pool through issuance and reactivation. They leave through burns (redemption) and churn (participants going inactive).

**Dormant stock:**

```
D(t) = D(t-1) + Q(t) - X(t) - R(t)
```

Credits enter the dormant pool through churn. They leave through expiry (after 12 months) and reactivation (participant returns).

**Total stock:**

```
S(t) = S(t-1) + I(t) - B(t) - X(t)
```

Note that Q and R are internal transfers between pools — they cancel in the total. Only issuance, burns, and expiry change the total stock.

### Flow Definitions

```
Q(t) = δ · A(t-1)              [churn: fraction of active stock goes dormant]
R(t) = ρ · D(t-1)              [reactivation: fraction of dormant stock returns]
X(t) = d₁₁(t)                  [expiry: oldest dormant cohort expires]
```

Burns depend on the regime:

```
Unconstrained:  B(t) = r · A(t-1)           [all redemption attempts succeed]
Constrained:    B(t) = min(r · A(t-1), C)    [burns capped at capacity]
```

**Key difference from age-based expiry:** Only active stock generates redemption demand. Dormant participants are not trying to redeem. This means the effective redemption pressure on the system is `r · A`, not `r · S`. A system with a large dormant pool has less redemption pressure than its total stock suggests.

### The 12-Month Lag

Dormancy-based expiry introduces a structural lag that age-based expiry does not have. When a participant goes dormant today, their credits do not expire for 12 months. During that window:

- The credits are inert (no redemption demand) but still outstanding
- If the participant reactivates, the credits return to the active pool
- The credits contribute to total stock (S) but not to redemption pressure

This means churn creates a temporary inflation of total stock — credits that are effectively dead but not yet removed. The lag is the price of giving people a grace period to return. The 12-month dormancy queue acts as a buffer between inactivity and expiry.

---

## 3. Steady-State Analysis

### Simplifying Assumption for Analytical Solutions

For tractable steady-state analysis, we assume ρ ≈ 0 (reactivation is negligible). In practice, some dormant participants will return, but for planning purposes the conservative assumption is that dormancy is permanent. Any reactivation that does occur is a bonus — credits that were expected to expire instead return to productive circulation.

### Unconstrained Steady State

Setting all state variables constant and I(t) = I:

**Active stock steady state:**

```
A* = I / (r + δ)
```

Active stock is determined by the ratio of issuance to the combined active drain rate (burns + churn).

**Churn flow in steady state:**

```
Q* = δ · A* = I · δ / (r + δ)
```

**Dormant stock steady state:**

The dormancy queue reaches steady state when each monthly cohort entering the queue equals each monthly cohort exiting (expiring). With Q* credits entering per month and a 12-month queue:

```
D* = 12 · Q* = 12 · I · δ / (r + δ)
```

**Total stock steady state:**

```
S* = A* + D* = I / (r + δ) + 12 · I · δ / (r + δ)
S* = I · (1 + 12δ) / (r + δ)
```

**Burns and expiry in steady state:**

```
B* = r · A* = I · r / (r + δ)
X* = Q* = I · δ / (r + δ)        [in steady state, monthly expiry = monthly churn flow]
B* + X* = I                        [total outflows equal issuance]
```

### The Effective λ

For compatibility with the health ratio framework, we can express an effective expiry rate relative to total stock:

```
λ_eff = X* / S* = [I · δ / (r + δ)] / [I · (1 + 12δ) / (r + δ)]
λ_eff = δ / (1 + 12δ)
```

**This is a key result.** The effective expiry rate is a function only of the churn rate δ, not of r, I, or C. It is structurally bounded:

```
As δ → 0:  λ_eff → 0        (no churn, no expiry)
As δ → ∞:  λ_eff → 1/12     (maximum ~8.3% per month)
```

**Example:** If δ = 0.03 (3% monthly churn — roughly 31% annual attrition):

```
λ_eff = 0.03 / (1 + 0.36) = 0.03 / 1.36 ≈ 0.022
```

### The Critical Issuance Boundary

```
I_max = C · (r + δ) / r = C · (1 + δ/r)
```

**Example:** With δ = 0.03 and r = 0.15:

```
I_max = C · 1.20
```

Headroom of 20% above raw capacity. But δ is not a governance lever — it is a behavioral outcome. Governance should plan conservatively:

```
I_max_conservative = C · (r + δ_low) / r
```

Using δ_low = 0.01: I_max_conservative ≈ C · 1.07 (only ~7% headroom).

---

## 4. The Four Health Ratios

### η — Redemption Efficiency

```
η(t) = B(t) / I(t)
η* = r / (r + δ)
```

**Target range:** 0.70 – 0.90. In a dormancy model, low η signals high churn (people leaving) rather than credits aging out. The diagnostic question shifts from "are credits too old?" to "are we retaining participants?"

### U — Utilization Rate

```
U(t) = B(t) / C(t)
U* = I · r / ((r + δ) · C)
```

Utilization is driven by active stock, not total stock. **Target range:** 0.50 – 0.80.

### SCR — Stock-to-Capacity Ratio

```
SCR(t) = S(t) / C(t)
SCR* = I · (1 + 12δ) / ((r + δ) · C)
```

SCR is structurally higher in the dormancy model because dormant credits inflate total stock. **Adjusted target ranges:** Healthy 1.0–5.0, Caution 5.0–8.0, Danger 8.0+.

**Active SCR** (recommended supplementary metric):

```
ASCR(t) = A(t) / C(t)
```

Strips out dormant stock. **Target ranges:** Healthy 1.0–4.0, Caution 4.0–6.0, Danger 6.0+. If SCR is high but ASCR is moderate, the system is healthy — the elevated SCR reflects dormant credits waiting to expire, not real pressure.

### ICR — Issuance-to-Capacity Ratio

```
ICR(t) = I(t) / C(t)
ICR_critical = (r + δ) / r
```

**Target range:** 0.50 – 0.85.

### New Metric — Dormancy Ratio

```
DR(t) = D(t) / S(t)
DR* = 12δ / (1 + 12δ)
```

At δ = 0.03: DR* ≈ 26%. At δ = 0.01: DR* ≈ 11%.

### New Trigger — Retention Alert

```
δ rising for 3+ consecutive months AND η declining
```

Signals participant attrition. The fix is product and engagement, not economic parameters.

---

## 5. Growth Sequencing

The Capacity-Lead Principle is unchanged:

```
ΔC ≥ ΔI · η
```

Growth sequencing uses δ_conservative for all headroom calculations. Any headroom from actual δ exceeding the conservative estimate is treated as a safety buffer, not spending capacity.

---

## 6. Dynamic Properties

### Convergence Time

Active stock half-life: `t_half = ln(2) / ln(1/(1-r-δ))` — approximately 3.5 months at r=0.15, δ=0.03.

Total stock takes longer: ~12-14 months to full steady state because the dormancy queue needs 12 months to populate.

### The 12-Month Lag Effect

Churn shocks are felt immediately in active stock but the corresponding expiry increase is delayed 12 months. This creates temporary stock surges after retention drops, and temporary stock depressions after retention improves. Governance should not expect quick results from retention investments.

---

## 7. Pilot Calibration Protocol

### Phase 1 (Months 1-3)

Start at I = 50% of C. No credits will expire during Phase 1 (the dormancy queue hasn't had time to fill). The system operates as if λ = 0. Collect data on r and participant activity frequency.

### Phase 2 (Months 4-6)

Estimate r and δ from observed data. Compute I_max using δ_conservative. Set Ī = 0.75 · I_max_conservative.

### Phase 3 (Months 7-18)

From month 13 onward, first dormancy-triggered expiries begin. λ_eff becomes observable. Compare against predicted δ/(1+12δ).

---

## Appendix: Summary of Key Formulas

| Formula | Description |
|---|---|
| `A* = I / (r + δ)` | Steady-state active stock |
| `D* = 12 · I · δ / (r + δ)` | Steady-state dormant stock |
| `S* = I · (1 + 12δ) / (r + δ)` | Steady-state total stock |
| `I_max = C · (r + δ) / r` | Maximum sustainable issuance |
| `η* = r / (r + δ)` | Steady-state redemption efficiency |
| `λ_eff = δ / (1 + 12δ)` | Effective expiry rate |
| `DR* = 12δ / (1 + 12δ)` | Steady-state dormancy ratio |
| `ΔC ≥ ΔI · η` | Capacity expansion needed for issuance growth |
| `t_half = ln(2) / ln(1/(1-r-δ))` | Active stock adjustment half-life |

## Appendix: Dormancy vs. Age-Based Expiry — Comparison

| Property | Age-Based (fixed lifetime) | Dormancy-Based (12-month inactivity) |
|---|---|---|
| What triggers expiry | Credit reaches max age | Holder has no activity for 12 months |
| Who is affected | All participants | Only dormant participants |
| Active participant impact | Loses old credits even if actively redeeming | Never loses credits while active |
| λ determined by | Governance-set credit lifetime | Participant churn rate (behavioral) |
| Governance control over λ | Direct (change the lifetime) | Indirect (improve retention to reduce δ) |
| Lag structure | Distributed across credit ages | 12-month lag from churn to expiry |
| Response to shocks | Immediate | Delayed (12-month queue must drain) |
| Steady-state stock | `I / (r + λ)` | `I · (1 + 12δ) / (r + δ)` — higher due to dormancy queue |
| Philosophical alignment | Credits have a shelf life | Contribution is recognized as long as you're part of the community |
