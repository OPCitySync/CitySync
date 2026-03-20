# Civic-Credit Economy: Decision Triggers

*A governance playbook for the Issuer Committee, Redeemer Committee, and Rate Setting Committee.*

*Version 2 — Dormancy-based expiry model (12-month inactivity threshold)*

---

## How to Read This Document

This document translates the formal equilibrium model into concrete governance decisions. Each section describes a **situation the system might be in**, the **signals that tell you it's happening**, and the **actions governance committees should take**.

Signals are expressed as combinations of five health metrics:

- **η (Redemption Efficiency)** — What fraction of credits issued actually get redeemed? Higher is better.
- **U (Utilization)** — How full is the Redeemer universe? How close are we to capacity ceilings?
- **ASCR (Active Stock-to-Capacity)** — How many months of active credit backlog exist? Uses only credits held by active participants — the true pressure metric.
- **ICR (Issuance-to-Capacity)** — How fast are we minting relative to what the system can absorb?
- **DR (Dormancy Ratio)** — What fraction of all outstanding credits belong to inactive participants? Indicates retention health.

Every trigger includes a **confidence threshold** — the number of consecutive observation periods (months) a condition must persist before action is warranted.

### A Note on Dormancy-Based Expiry

Credits in this system do not have a fixed expiration date. Instead, credits expire only when their holder has had no earning or redemption activity for 12 consecutive months. An active participant never loses credits. This means the system's expiry rate is not a governance lever — it is driven by participant retention. When people leave, their credits eventually drain out. When people stay, their credits remain in circulation. The governance implication: **retention is an economic variable, not just a community engagement metric.**

---

## 1. Expand Issuance

**Question:** Is it safe to raise the issuance cap, onboard a new Issuer Organization, or approve new task categories?

### Signal: Green Light

All conditions must hold for **2 consecutive months**:

```
η    ≥ 0.70          Credits are being used efficiently
U    ≤ 0.75          Capacity has meaningful headroom
ASCR ≤ 4.0           Active participants are not over-accumulating
ICR  ≤ 0.80          Flow ratio has room to grow
DR   ≤ 0.30          Retention is adequate (not losing too many participants)
```

AND at least one civic need signal:

- Task waitlists: participants are trying to claim tasks that are fully subscribed
- Geographic gap: a neighborhood or district has no active Issuer Organization
- Domain gap: a civic service area (elder care, youth mentoring, disaster prep) has no representation in the task catalog
- Participant survey feedback indicates desire for more earning opportunities

### Actions (Issuer Committee)

1. Calculate the safe issuance expansion using conservative δ estimate: `ΔI ≤ (C - I·η) / η`
2. Approve new Issuer Organization OR raise the issuance cap by no more than the safe expansion amount
3. Set a 60-day review window: re-evaluate all metrics after the expansion takes effect
4. Do not approve a second expansion until the review window closes

### Guardrail

Never expand issuance without confirming the capacity headroom is real. If U is at 0.74 because a Redeemer recently went offline (temporary disruption), the headroom is illusory. Also: if DR is rising (retention declining), new issuance may flow to participants who will churn, inflating the dormancy queue without producing lasting civic value.

---

## 2. Expand Redemption Capacity

**Question:** Should we onboard a new Redeemer Organization, expand an existing Redeemer's capacity allocation, or open new redemption categories?

### Signal: Amber Ceiling

Any of the following for **2 consecutive months**:

```
U    ≥ 0.80              Approaching capacity ceiling
η    declining            People are earning but finding it harder to spend
ASCR ≥ 4.0 and rising    Active stock accumulating
```

OR qualitative signals:

- Waitlists forming for specific redemption services
- Participant complaints about limited options
- Redeemer Organizations reporting they are turning away credit redemptions

### Actions (Redeemer Committee)

1. Identify which redemption categories are at saturation (per-category U > 0.85)
2. Prioritize expansion in essential redemption goods (transit, childcare, education) over peripheral goods
3. For saturated categories where expansion is not immediately possible, implement tiered credit pricing, scheduling windows, or quotas
4. Simultaneously pursue new Redeemer onboarding to broaden the redemption universe
5. Confirm ICR drops below 0.80 after expansion before signaling the Issuer Committee that growth is safe

### Guardrail

Capacity expansion must stabilize before the Issuer Committee expands issuance. Minimum one observation cycle (30 days) between Redeemer expansion and Issuer expansion.

---

## 3. Increase Burn Rates (Raise Redemption Prices)

**Question:** Should we increase the credit cost of specific services to redistribute demand?

### Signal: Localized Saturation

```
U_j ≥ 0.90 for service j              A specific service is overwhelmed
U_k ≤ 0.50 for other services k       Other services are underutilized
η system-wide is moderate (0.60-0.80)  Overall system is not in crisis
```

### Actions (Rate Setting Committee)

1. Increase credit cost on saturated services by 15-25% increments
2. Simultaneously decrease credit costs on underutilized services to redirect demand
3. Communicate changes to participants with 30 days notice
4. Review after 60 days

### Guardrail

Essential services (transit, childcare) must have a maximum credit cost ceiling that is never exceeded through incremental adjustments.

---

## 4. Decrease Burn Rates (Lower Redemption Prices)

**Question:** Should we lower credit costs to encourage redemption and reduce stock accumulation?

### Signal: Low Uptake

```
η    ≤ 0.60          Credits are piling up without being used
U    ≤ 0.50          Capacity is substantially underutilized
ASCR ≥ 3.0           Active stock is building even though capacity exists
DR   ≤ 0.25          Retention is okay — this isn't a churn problem
```

The DR check is important: if η is low because of high churn (people leaving), lowering redemption prices won't help — the problem is retention, not redemption attractiveness.

### Actions (Rate Setting Committee)

1. Reduce credit costs on underutilized services by 15-25%
2. Consider "discovery pricing" — temporary deep discounts on services participants haven't tried
3. If the problem is awareness rather than price, escalate to communications
4. If the problem is friction, escalate to operational teams

### Guardrail

Don't lower prices below the psychological floor where credits feel worthless as an exchange.

---

## 5. Decrease Issuance (Emergency Tightening)

**Question:** Should we lower the issuance cap, pause new Issuer onboarding, or retire task categories?

### Signal: Red — Over-Issuance

Any of the following for **2 consecutive months**:

```
η    ≤ 0.50              More credits expiring or accumulating than being redeemed
ASCR ≥ 6.0               Dangerous active stock accumulation
ICR  ≥ ICR_critical       Issuance exceeds the sustainable threshold
```

### Signal: Red — Spiral Detection

```
η declining for 3+ consecutive months
AND ASCR rising for 3+ consecutive months
```

### Actions (Issuer Committee — Emergency Protocol)

1. **Immediate:** Freeze all new Issuer onboarding
2. **Within 30 days:** Reduce the issuance cap to below the current burn rate (I < B)
3. **Within 60 days:** Review the task catalog and retire low-value, low-participation tasks
4. **Concurrent:** Redeemer Committee should pursue capacity expansion
5. **Do not resume growth** until ASCR returns below 4.0 and η returns above 0.65 for 2 consecutive months

### Guardrail

Communicate transparently: this is temporary stabilization, not permanent reduction.

---

## 6. Retention Intervention

**Question:** Are we losing participants, and is it affecting the economics of the system?

This trigger is unique to the dormancy-based model. In an age-based expiry system, participant churn is an engagement concern. In a dormancy-based system, **churn is an economic variable** — it determines the effective expiry rate and therefore the system's headroom.

### Signal: Retention Alert

```
DR   ≥ 0.30 and rising     A growing share of credits belong to inactive participants
η    declining              The system's earn-spend efficiency is dropping
δ    rising for 3+ months   Monthly churn rate is trending upward
```

### Actions (All Committees + Operations)

1. **Diagnose the cause:** Survey recently inactive participants. Common causes: tasks felt repetitive or meaningless, redemption options weren't worth the effort, life circumstances changed, onboarding was confusing, the experience felt bureaucratic.

2. **If task quality is the issue (Issuer Committee):** Refresh the task catalog. Retire stale tasks. Introduce new categories. Lower credential barriers. Diversify schedules and locations.

3. **If redemption quality is the issue (Redeemer Committee):** Expand the redemption universe. Lower prices on underutilized services. Improve the redemption UX. Add services participants actually want.

4. **If onboarding is the issue (Operations):** Simplify the activation process. Reduce time from sign-up to first task. Provide clearer guidance on how to earn and spend.

5. **If the system is structurally fine but seasonal:** Adjust expectations. Summer vs. winter participation patterns may produce natural churn variation that doesn't require intervention.

### Economic Implication

Rising churn will eventually increase the effective expiry rate (λ_eff) — but not for 12 months, due to the dormancy lag. This means the system's headroom calculation today may be based on a churn rate that is about to change. **If δ is rising, governance should proactively recalculate I_max using the higher δ estimate and consider tightening the issuance cap preemptively.** Waiting 12 months for the expiry to "catch up" means operating with stale parameters.

---

## 7. System Health Check — Routine Governance Cycle

### Monthly Dashboard Review (All Committees)

```
1. Are all five metrics within target ranges?
   η: 0.70-0.90  |  U: 0.50-0.80  |  ASCR: 1.0-4.0  |  ICR: 0.50-0.85  |  DR: <0.25

2. Are any metrics trending in a concerning direction (3+ months)?

3. Per-category breakdown:
   - Which Redeemer services are at high utilization?
   - Which task categories are oversubscribed vs. undersubscribed?
   - Which neighborhoods/demographics are underrepresented?

4. Dormancy check:
   - How many participants went inactive this month?
   - How many reactivated (came back after inactivity)?
   - What is the current dormancy queue size (credits waiting to expire)?

5. Participant feedback signals
```

### Quarterly Deep Review (Joint Committee Session)

```
1. Re-estimate behavioral parameters:
   - r (redemption propensity): actual burns / average active stock
   - δ (churn rate): participants going inactive / total active participants
   - ρ (reactivation): participants returning / total dormant participants

2. Recalculate I_max using δ_conservative (lower bound of δ estimate)

3. Review whether the issuance cap needs structural adjustment

4. Equity audit: participation and redemption by neighborhood,
   income level, age, language, disability status

5. Redeemer capacity forecast: upcoming expansions or contractions?

6. Dormancy forecast: based on current δ, how large will the dormancy
   pool be in 3 months? 6 months? Does this affect capacity planning?
```

---

## 8. Compound Scenarios

### Scenario A: Healthy Growth Opportunity

```
η = 0.78, U = 0.55, ASCR = 2.1, ICR = 0.62, DR = 0.14
New Issuer application from elder care nonprofit
3 neighborhoods with no Issuer presence
```

**Decision:** Approve the new Issuer. Ample headroom, strong retention. Calculate safe ΔI and set the new Issuer's allocation within that limit.

### Scenario B: Success Stress

```
η = 0.82, U = 0.88, ASCR = 3.8, ICR = 0.84, DR = 0.12
Participant satisfaction is high. Waitlists forming for transit and childcare.
```

**Decision:** Hold Issuer expansion. Expand Redeemer capacity first. Only after U drops below 0.80 should the Issuer Committee consider new approvals.

### Scenario C: Engagement Failure

```
η = 0.42, U = 0.31, ASCR = 3.5, ICR = 0.73, DR = 0.18
Credits accumulating. Low redemption activity. Participant surveys show low awareness of options.
```

**Decision:** This is a redemption attractiveness and UX problem (DR is fine, so retention isn't the driver). Lower redemption prices on underutilized services. Launch a communications campaign. Consider an MCE to re-energize. Do NOT add Issuers.

### Scenario D: Churn Crisis

```
η = 0.55, U = 0.50, ASCR = 2.8, ICR = 0.70, DR = 0.38 (rising for 4 months)
η declining. Many participants going inactive.
```

**Decision:** This is a retention crisis, not an economic one (U and ASCR are moderate). The system will feel the economic effects in 12 months when these dormant credits expire and I_max shifts. Immediate action: diagnose why people are leaving (survey, interviews). Refresh tasks. Improve redemption. Consider tightening issuance cap preemptively because higher δ means the current I_max estimate may be stale.

### Scenario E: Over-Issuance

```
η = 0.38 (declining 4 months), U = 0.95, ASCR = 6.5 (rising), ICR = 1.15, DR = 0.10
Capacity maxed. Active stock dangerously high. Retention is fine — the system is just too loose.
```

**Decision:** Emergency protocol. Freeze issuance. Cut cap below burns. Retire low-value tasks. Expand Redeemer capacity urgently. The low DR actually means most of this stock is active and exerting real redemption pressure — the problem is genuine overcrowding, not phantom stock.

### Scenario F: Equity Gap

```
η = 0.76, U = 0.65, ASCR = 2.8, ICR = 0.72, DR = 0.16
System-wide healthy. But District 4 has no Issuer and no Redeemer.
District 4 residents = <2% of participants despite being 15% of population.
```

**Decision:** Target new Issuer and Redeemer onboarding in District 4. Approve tasks matching District 4's demographics. This is an equity expansion — aggregate headroom supports it.

---

## Appendix: Decision Trigger Summary Table

| Trigger | Primary Signal | Confidence | Lead Committee | Priority |
|---|---|---|---|---|
| Expand Issuance | η≥0.70, U≤0.75, ASCR≤4.0, ICR≤0.80, DR≤0.30 + civic need | 2 months | Issuer | Normal |
| Expand Redemption | U≥0.80 OR η declining OR ASCR≥4.0 rising | 2 months | Redeemer | High |
| Increase Burn Rates | U_j≥0.90, U_k≤0.50, η moderate | 2 months | Rate Setting | Normal |
| Decrease Burn Rates | η≤0.60, U≤0.50, ASCR≥3.0, DR≤0.25 | 2 months | Rate Setting | Normal |
| Decrease Issuance | η≤0.50 OR ASCR≥6.0 OR ICR≥critical | 2 months | Issuer (Emergency) | Critical |
| Spiral Detection | η declining 3+ mo AND ASCR rising 3+ mo | 3 months | All (Emergency) | Critical |
| Retention Alert | DR≥0.30 rising AND η declining AND δ rising 3+ mo | 3 months | All + Operations | High |
| Equity Intervention | Aggregate healthy but demographic/geographic gap | 1 audit cycle | All | High |
