# MCE Issuer Committee Selection Process

Use this process when more MCE proposals are submitted than can be advanced to the next epoch (for example, 9 proposals to select top 5).

Companion document:
- `docs/design/mce-pre-task-distribution-template.md`

---

## 1) Decision Objective

Select the top 5 MCE proposals that best align with city need, equity impact, and executable readiness for the next epoch.

---

## 2) Governance Inputs

Inputs reviewed by committee:
- Proposal packet (title, objective, scope, expected outcomes)
- Baseline city data relevant to the proposal
- Community signal (likes/votes/comments)
- Estimated execution capacity (issuer, partner, redeemer readiness)
- Risk and legal constraints

---

## 3) Stage 1: Eligibility Gate (Pass/Fail)

Before scoring, each proposal must pass all gates:
- Mission aligned with public-good/public-service outcomes
- Legally and operationally feasible in next epoch window
- Can be translated into verifiable tasks
- Does not displace existing paid labor obligations

Any proposal failing a gate is marked ineligible for the current round.

---

## 4) Stage 2: Blind Individual Scoring (MCDA)

Each committee member scores each eligible proposal from 1-5 on:
- City need severity (`30%`)
- Equity and inclusion impact (`20%`)
- Feasibility and readiness (`20%`)
- Expected public benefit/reach (`15%`)
- Community signal strength (`10%`)
- Redeemer/partner support (`5%`)

Weighted score formula:
- `total = (need*0.30) + (equity*0.20) + (feasibility*0.20) + (benefit*0.15) + (signal*0.10) + (support*0.05)`

Outputs:
- Per-member weighted totals
- Committee average weighted total per proposal
- Ranked list (highest to lowest)

---

## 5) Stage 3: Deliberation

Committee discusses top-ranked proposals in order:
- Default discussion set: top 6 or top 7 by weighted score
- Discussion focuses on risks, dependencies, and execution realism
- Any member can propose one adjustment with written rationale

Rules:
- No new criteria introduced during deliberation
- Rationale must reference existing criteria or constraints

---

## 6) Stage 4: Final Selection Vote (Top 5)

Each committee member submits a ranked ballot with exactly 5 proposals.

Point assignment:
- Rank 1 = 5 points
- Rank 2 = 4 points
- Rank 3 = 3 points
- Rank 4 = 2 points
- Rank 5 = 1 point

The 5 proposals with the highest aggregate points are selected.

---

## 7) Quorum, Conflicts, and Tie-Breakers

Quorum:
- Minimum 2/3 of committee members must participate.

Conflict of interest:
- Members must disclose conflicts before scoring.
- Conflicted members do not score or rank that proposal.

Tie-break order:
1. Higher City Need Severity average
2. Higher Feasibility and Readiness average
3. Higher Equity and Inclusion average
4. Chair tie-break vote

---

## 8) Transparency Outputs (Required)

After final selection, publish:
- Final top 5 list
- Aggregate score summary by criterion
- One-paragraph rationale for each selected proposal
- One-paragraph rationale for each non-selected proposal
- Conflict disclosures and recusals

This output should be archived and linked to the next-epoch task planning packet.

---

## 9) Handoff to Planning

For each selected proposal:
1. Open a planning record using:
   - `docs/design/mce-pre-task-distribution-template.md`
2. Complete all pre-task distribution gates
3. Approve task packet set before issuance

No tasks should be distributed until the planning template reaches GO status.

