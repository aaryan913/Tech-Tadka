# LendLens — live demo run-through

A practical two-minute walkthrough for a hackathon judging panel.

## Before presenting

- Run `npm run dev` and open the local URL printed in the terminal.
- Start with the default Medium risk profile and ₹25,000 budget.
- Keep the browser zoom at 90%–100% and use a desktop-width browser window if available.
- Keep the terminal open behind the browser so you can restart the development server if needed.
- Use only the built-in fictional listings; do not describe the estimates as real credit data.

## Two-minute talk track

### 0:00–0:20 — The problem

“An investor looking at small peer-to-peer loans has to compare interest rates, repayment risk, loan duration, and budget fit across many listings. Sorting by interest rate alone can be misleading. LendLens gives the investor a transparent shortlist and shows the trade-offs behind each recommendation.”

### 0:20–0:40 — Live preferences

“Here is a ₹25,000 budget with a balanced risk profile. I can change the budget or choose a Low, Medium, or High risk appetite. The ranking model recalculates immediately, while the proposed allocations and portfolio metrics update with it.”

Switch from **Medium** to **Low**, then **High**. Point to the movement in the recommended borrower list and call out that a higher interest rate is not automatically a better match.

### 0:40–1:00 — Explainability

“Each recommended borrower has a match score and a plain-language reason. I can expand the score to see the repayment-safety component, yield component, their weights, and any risk penalty. This is important because an investor should be able to challenge a recommendation rather than just trust a black box.”

Expand one recommendation's **How this score was calculated** section.

### 1:00–1:20 — Portfolio allocation

“The system does more than rank five names. It proposes an allocation under the selected budget, respects the requested loan amount, and limits any one shortlisted position to 35% of the budget. The portfolio view shows the allocation shares and a sector concentration warning if one sector dominates.”

Point to the **Portfolio allocation** section.

### 1:20–1:40 — Downside scenario

“Before choosing a portfolio, we can ask what happens if one borrower defaults. This panel substitutes a simplified full-principal-loss outcome for that position and compares it with the baseline modelled profit.”

Choose a borrower and click **Run stress test**. Then reset the scenario.

### 1:40–2:00 — Comparison and output

“I can compare two listings side by side, search and filter the full marketplace, and export the current shortlist as a CSV for inspection. The prototype uses fictional data and explicit assumptions; it does not move money or make real credit decisions.”

Optionally compare two borrowers or export the shortlist.

## If judges ask questions

**Why not use machine learning?**

“The supplied prototype uses a transparent baseline model because our demonstration dataset is fictional and too small to train or validate a responsible default predictor. With permissioned historical loan outcomes, the risk component could later be calibrated and evaluated; we would compare it with this baseline rather than claim accuracy without evidence.”

**How is the ROI calculated?**

“Net ROI is an illustrative estimate over the full loan term: probability of repayment multiplied by simple interest over the term, minus estimated default probability to represent full principal loss, minus a 1% fee. It assumes no recovery after default, so it is intentionally simplified. It is not annualised and is not a promised return.”

**Why is there a 35% allocation cap?**

“It is a demo portfolio constraint to avoid the simple allocator putting too much of the proposed budget into one listing. It is not a regulatory requirement or a universal investing rule.”

**Could this work with real borrowers?**

“The UI could connect to a permissioned data source, but real use would require data governance, model validation, privacy controls, appropriate regulatory review, and clear disclosure. This prototype is limited to synthetic sample data.”

## Fallback if the live demo has a problem

Have the default dashboard loaded before judges arrive. If there is a problem with the development server, briefly show the screenshots or a short screen recording you prepared from a working local run. Do not claim a feature works if it has not been tested on the presentation machine.
