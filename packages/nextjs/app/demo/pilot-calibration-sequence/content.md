# Civic-Credit Economy: Pilot Calibration Sequence

*A phased protocol for launching, observing, calibrating, and growing a civic-credit system from first issuance through managed expansion.*

*Version 2 — Dormancy-based expiry model (12-month inactivity threshold)*

---

## Overview

Launching a civic-credit economy is a calibration process. The system has behavioral parameters — how people earn, how they spend, and how long they stay active — that cannot be known in advance and must be estimated from real data.

This is especially true under dormancy-based expiry: the system's expiry rate is not a governance dial but an emergent property of participant retention. Governance must observe retention patterns before it can accurately model the system's carrying capacity.

### Key Implication of Dormancy-Based Expiry for the Pilot

No credits will expire during the first 12 months of the pilot. The dormancy queue needs a full year to populate before any credits age out. This means:

- The system operates effectively as a **zero-expiry system** for Year 1
- All headroom must come from the gap between issuance and capacity — there is no expiry drain to absorb excess
- Conservative issuance is essential in Year 1
- The behavioral data collected in Year 1 is what makes Year 2 governable

---

## Pre-Launch: Structural Setup (Weeks 1-12)

### Purpose
Stand up institutional infrastructure before any credits are issued.

### Activities

**Issuer Side**
- Onboard 3-5 Issuer Organizations (library, parks, nonprofit, school, health)
- Issuer Accreditation Committee reviews and approves each
- Task Catalog Committee defines initial catalog: 15-25 tasks across 3-4 categories
- Rate Setting Committee assigns initial credit values per task
- Initial issuance cap set deliberately low (see Phase 1)

**Redeemer Side**
- Onboard 3-5 Redeemer Organizations (must include at least one essential service)
- Redeemer Committee defines initial redemption menu with credit costs
- Estimate initial monthly redemption capacity C₀
- Establish backstop agreements

**Participant Side**
- In-person onboarding at each Issuer Organization
- Target: 100-200 initial Civic Participants
- Wallet activation, orientation to earning and spending

**Technical**
- Smart contract deployed with `dormancyThreshold = 365 days`
- `lastActivity` timestamp recording operational on every earn and redeem
- Governance-settable dormancy threshold confirmed functional

**Governance**
- All three Representative Committees constituted
- Monthly review cadence established
- Data collection infrastructure operational
- Privacy framework in place
- Baseline participant survey administered

### Exit Criteria
- ≥3 Issuers accredited and operational
- ≥3 Redeemers accredited and operational
- ≥100 participants onboarded with active wallets
- Task catalog published
- Redemption menu published
- `lastActivity` tracking confirmed working
- Data collection confirmed operational

---

## Phase 1: Observation (Months 1-3)

### Purpose
Collect baseline behavioral data. Understand how people actually earn and spend. **Resist the urge to optimize.**

### Parameter Settings

```
Issuance cap:       I₀ = 0.50 · C₀    (50% of estimated capacity)
Dormancy threshold: 12 months           (set in contract, no credits expire during Phase 1)
Account cap:        None initially
Growth shocks:      None
```

**Why 50%?** With no expiry drain during Year 1, the system has zero margin if issuance exceeds capacity. Starting at 50% means even if every assumption is wrong, the system cannot enter the constrained regime. Room to learn without risk.

### Data Collection (Monthly)

**Earning behavior**
- Total credits issued
- Credits per Issuer, per task category
- Unique participants earning, average credits per participant
- Task completion rates, task distribution

**Spending behavior**
- Total credits redeemed / burned
- Credits per Redeemer, per service category
- Unique participants redeeming
- Average time from earning to redemption (credit velocity)
- Redemption concentration (one service vs. diversified)

**Retention behavior** *(new for dormancy model)*
- Number of participants active this month (earned or redeemed at least once)
- Number of participants with no activity this month
- Number of participants with no activity for 2+ consecutive months
- Number of participants with no activity for 3+ consecutive months
- Cumulative participant activity frequency distribution

**Stock behavior**
- Active stock (A): credits held by participants who have been active within 30 days
- Potentially dormant stock: credits held by participants with 60+ days of inactivity
- Distribution of balances across participants (median, 75th, 90th percentile)
- Number of participants with zero balance
- Number of participants with growing balances
- Number of participants with zero activity after onboarding (never engaged)

### What You're Estimating

**Redemption propensity (r):**

```
r_est = average monthly burns / average active stock
```

Compute for months 2 and 3. If stable (within 25%), you have a usable baseline.

**Monthly churn rate (δ):**

```
δ_est = participants who had no activity this month / participants who were active last month
```

This is the most important new parameter. δ tells you how fast people leave, which determines the system's long-run expiry rate and headroom. Early estimates will be noisy. Use 3-month rolling averages.

**Leading indicator for λ_eff:**

No credits expire in Phase 1, but you can project future expiry:

```
λ_eff_projected = δ_est / (1 + 12 · δ_est)
```

This tells you what the effective expiry rate will be once the dormancy queue is fully populated (~month 13+).

### Exit Criteria
- At least 2 months of stable redemption data (r_est varies <25% month-to-month)
- At least 2 months of churn data (δ_est has a usable baseline)
- ≥50 active earners, ≥30 active redeemers
- No structural failures in verification, redemption, or data collection

---

## Phase 2: Calibration (Months 4-6)

### Purpose
Use Phase 1 data to calibrate the formal model, set the real issuance cap, and establish monitoring targets.

### Key Calculations

**Step 1: Compute I_max (conservative)**

Because δ is uncertain and the dormancy queue hasn't populated yet, use the lower bound of δ estimates:

```
δ_conservative = min(δ_est, 0.01)    [assume sticky system — conservative]
I_max_conservative = C · (r_est + δ_conservative) / r_est
```

**Step 2: Set the operational issuance cap**

```
Ī = 0.70 · I_max_conservative    [30% safety margin — wider than normal because Year 1 has no expiry]
```

The extra 5% margin (vs. 75% in steady state) compensates for the absence of expiry as a drain during Year 1.

**Step 3: Compute predictions**

```
A* = Ī / (r_est + δ_conservative)
η* = r_est / (r_est + δ_conservative)
U* = Ī · η* / C
ASCR* = Ī / ((r_est + δ_conservative) · C)
```

These become baseline predictions for governance monitoring.

**Step 4: Set target ranges**

```
η:    [0.70, 0.90]
U:    [0.50, 0.80]
ASCR: [1.0, 4.0]
ICR:  [0.50, 0.85]
DR:   [0, 0.25]     (will be near 0 during Year 1 since dormancy queue is building)
```

### Calibration Actions

1. Raise issuance cap from I₀ to Ī
2. Adjust task pricing based on Phase 1 completion and uptake data
3. Adjust redemption pricing based on Phase 1 demand patterns
4. Begin tracking `lastActivity` distribution — build the picture of who is active, who is drifting, who has disappeared

### Exit Criteria
- I_max computed from real data
- Issuance cap set and implemented
- Predictions documented
- Target ranges established
- System operating at new cap for 30+ days without entering constrained regime

---

## Phase 3: Managed Growth (Months 7-18)

### Purpose
Expand the system using the calibrated model and decision triggers.

### Growth Sequencing Protocol

Every expansion event follows the same sequence:

```
1. EXPAND CAPACITY     — Onboard new Redeemer or expand existing
2. CONFIRM ABSORPTION  — Wait 30-60 days, verify U < 0.80
3. RECALCULATE         — New I_max_conservative, new safe ΔI
4. EXPAND ISSUANCE     — Onboard new Issuer or raise cap
5. CONFIRM HEALTH      — Wait 30-60 days, verify all metrics in range
6. REPEAT
```

Minimum cycle time: 60-90 days between expansion events.

### Re-estimation Cadence

```
Month 6:   Initial calibration (Phase 2)
Month 9:   Re-estimate r and δ. Recalculate I_max.
Month 12:  Re-estimate r and δ. Recalculate I_max. Prepare for first expiries.
Month 15:  First full quarter of observable expiry. Compare actual λ_eff against predicted.
Month 18:  Full model recalibration for institutionalization decision.
```

### The Month 13 Milestone

Month 13 is when the first dormancy-triggered expiries should occur — credits held by participants who went inactive in month 1 and never returned. This is the first time governance can observe actual λ_eff:

```
λ_eff_observed = credits actually expired this month / average total stock
```

Compare against predicted `δ / (1 + 12δ)`. If they match, the model is working. If observed λ_eff is significantly lower than predicted, it means participants are reactivating at higher rates than assumed (good news — retention is better than expected). If higher, churn may have accelerated.

### Mass Coordination Events (MCEs)

Schedule strategically:

- **First MCE:** Month 8-10 (after calibration, before system needs a boost)
- **Second MCE:** Month 14-16 (building toward institutionalization)

MCE issuance must be pre-approved with temporary allocation that auto-sunsets:

```
MCE issuance allocation = MCE_tasks · avg_credit_value
Must satisfy: (Ī + MCE_allocation) < I_max for the MCE month
```

### Growth Milestones

```
Month 6:    5+ Issuers, 5+ Redeemers, 200+ active participants
Month 9:    8+ Issuers, 8+ Redeemers, 400+ active participants
Month 12:   10+ Issuers, 10+ Redeemers, 750+ active participants
Month 18:   15+ Issuers, 15+ Redeemers, 1,500+ active participants
```

### Exit Criteria (for Phase 4)
- System has operated 12+ months with health metrics in target ranges
- At least 2 growth expansion cycles completed
- r and δ estimated with 3+ quarterly data points
- λ_eff observed and compared against model predictions (month 13+)
- At least 1 MCE executed
- Equity audit shows participation across target demographics
- No emergency tightening in last 6 months (or full recovery documented)

---

## Phase 4: Institutionalization (Months 18-24)

### Purpose
Transition from pilot to permanent program.

### Key Activities

**Pilot Review Report**
- Full quantitative analysis: all health metrics over the pilot period
- Behavioral parameters (r, δ, ρ) with confidence intervals
- λ_eff observed vs. predicted analysis
- Participation demographics and equity analysis
- Cost analysis: backstop expenditures, admin costs, estimated civic value generated
- Dormancy analysis: participant lifecycle patterns, average time to dormancy, reactivation rates

**Ordinance Conversion**
- Convert pilot authorization into permanent municipal code
- Embed issuance cap mechanism and governance committees in code/ordinance
- Define ongoing budgetary commitment
- Include mandatory annual review and reporting
- Codify dormancy threshold (12 months) with governance authority to adjust

**Governance Maturation**
- Transition to elected/rotating committee membership with staggered terms
- Establish formal union, state agency, and advocacy relationships
- Document all procedures as a replicable municipal playbook

**Technical Maturation**
- Governance dashboard operational with real-time monitoring
- Automated alerts when metrics approach trigger thresholds
- Data pipeline for quarterly re-estimation
- Privacy audit and data governance review
- Dormancy sweep process operational (batch expiry of dormant accounts)

**Scaling Preparation**
- Document pilot as replicable model
- Identify candidate cities for federation
- Establish cross-jurisdiction credit portability standards

### Success Criteria
- City council votes to make program permanent
- Ongoing budget appropriation secured
- Governance committees transitioned to standing bodies
- System operates without original pilot team

---

## Appendix: Calibration Quick Reference

### The Three Numbers That Matter Most

1. **I_max** — maximum sustainable issuance (compute with δ_conservative)
2. **Ī** — current issuance cap (70-75% of I_max)
3. **Headroom** — I_max - Ī

### Parameter Estimation

```
r_est           = Σ(monthly burns) / Σ(monthly avg active stock)
δ_est           = participants going inactive / total active participants
λ_eff_projected = δ_est / (1 + 12 · δ_est)
I_max           = C · (r_est + δ_conservative) / r_est
Ī               = 0.70 · I_max  [Year 1]  →  0.75 · I_max  [Year 2+]
```

### Phase Transition Checklist

```
Pre-Launch → Phase 1:  Infrastructure up, committees seated, participants onboarded, lastActivity tracking live
Phase 1 → Phase 2:     Stable r and δ estimates, sufficient participation, no structural failures
Phase 2 → Phase 3:     I_max computed, cap calibrated, target ranges set
Phase 3 → Phase 4:     12+ months healthy, governance functioning, λ_eff observed, equity achieved
Phase 4 → Permanent:   Council vote, budget appropriation, committees transitioned
```

### Year 1 vs. Year 2+ Operating Differences

| Parameter | Year 1 (dormancy queue building) | Year 2+ (dormancy queue cycling) |
|---|---|---|
| Expiry drain | Zero — no credits have aged out yet | Active — monthly expiry ≈ monthly churn flow |
| Effective λ | 0 | δ / (1 + 12δ) |
| Safety margin | 30% (Ī = 0.70 · I_max) | 25% (Ī = 0.75 · I_max) |
| Stock trend | Continuously rising (accumulation phase) | Stabilizing toward S* |
| Governance posture | Conservative — observe and learn | Calibrated — respond to data |
