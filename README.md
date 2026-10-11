# LendLens — P2P Micro-Lending Matchmaker

LendLens is a local, interactive hackathon prototype. It ranks fictional open micro-loan listings using an investor's risk appetite, proposes a diversified allocation across the top five, explains the matching score, compares borrowers, and simulates a default scenario.

**This is a simulation, not a lending service.** Borrower profiles and default probabilities are fictional. The ROI formula is illustrative and is not a calibrated credit model, an investment recommendation, or a promise of return. It does not initiate loans or move money.

## Run it on your computer

### 1. Install Node.js

Use Node.js 18 or newer (Node 20 or 22 recommended). After installing, open a new terminal and check:

```bash
node -v
npm -v
```

### 2. Extract and open the folder

Extract `lendlens-starter.zip`. In Visual Studio Code, choose **File → Open Folder** and select the extracted `lendlens-starter` folder. Open **Terminal → New Terminal**. The terminal should be in the same folder as `package.json`.

### 3. Install project packages

```bash
npm install
```

This downloads React, Vite, and the icon package. It requires an internet connection the first time.

### 4. Start the website

```bash
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. Hold Ctrl and click the link in the terminal, or copy it into Chrome. Keep the terminal running while presenting. To stop the server, return to the terminal and press `Ctrl + C`.

### 5. Verify before presenting

```bash
npm run build
```

If this completes successfully, the production bundle is created in `dist/`. For the local development demo, `npm run dev` is enough.

## Main functionality

- Live risk-appetite controls: Low, Medium, and High.
- Investment budget control from ₹5,000 to ₹50,000, plus quick budget presets.
- Risk-adjusted ranking across all twelve fictional borrower listings.
- Top-five recommendations with stated APR, synthetic default estimate, modelled net ROI, suggested allocation, and a plain-language reason.
- Expandable score breakdown showing the repayment-safety and yield components plus the risk penalty.
- Diversified budget allocation, capped at 35% of the budget per shortlisted borrower and never above a listing's requested loan amount.
- Portfolio overview with allocation share, expected-loss proxy, and sector-concentration warning.
- Default stress test: replace one selected borrower's expected profit with a simplified full-principal-loss scenario.
- Side-by-side comparison of borrower profiles.
- Searchable, filterable borrower marketplace with sorting.
- CSV export of the current recommendations.
- Responsive layout for desktop and smaller screens.

## Demo presentation flow (about 2 minutes)

1. Start on the default **Medium** risk profile and ₹25,000 budget. Explain that the match score combines repayment safety, repayment history, income stability, stated rate potential, and a penalty for risk beyond the selected tolerance.
2. Switch to **Low** risk. Point out that borrowers with stronger safety signals rise in the ranking.
3. Switch to **High** risk. Show how higher-rate borrowers may rise, while their estimated default risk remains visible.
4. Change the budget using the slider or a quick amount. Show how allocation amounts and the portfolio metrics update immediately.
5. Expand a recommendation's score breakdown to explain its rank.
6. In Portfolio intelligence, choose a borrower and run the default stress test. Explain the difference between expected modelled profit and a hypothetical default outcome.
7. Compare two borrowers, then use marketplace search or a risk filter.
8. Export the shortlist as CSV if the judges want to inspect the recommendation output.

## How the demo model works

### Matching score

A borrower receives a 0–100 score composed of:

- **Repayment safety:** a blend of the supplied synthetic default estimate, reported repayment history, and income-stability category.
- **Interest-rate potential:** scaled from an illustrative 8%–28% annual APR range.
- **Investor preference:** Low weights safety more heavily, Medium balances safety and yield, and High gives rate potential more weight.
- **Risk penalty:** reduces the score when a listing's supplied default estimate exceeds the selected profile's tolerance.

### Net ROI estimate

The displayed net ROI is over the full loan term, not annualised:

`net ROI = (1 - default probability) × interest over term - default probability - 1% fee`

The simplified formula assumes no principal recovery after default, interest only on successful repayment, simple prorating of APR by loan term, and a 1% fee charged on principal. The probabilities are not trained or validated against real loan outcomes.

### Allocation and stress test

The recommendation engine allocates in ₹100 increments proportionally to match scores, subject to each borrower's requested amount and a 35% per-borrower cap. The stress test replaces the selected position's expected profit with a hypothetical outcome of losing principal plus the illustrative fee. These calculations are designed to make the logic inspectable during a student demo.

## Project structure

```text
lendlens-starter/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── components/
    │   ├── BorrowerCompare.jsx
    │   ├── BorrowerTable.jsx
    │   ├── InvestorControls.jsx
    │   ├── MetricCard.jsx
    │   ├── PortfolioOverview.jsx
    │   ├── RecommendationCard.jsx
    │   └── StressTestPanel.jsx
    ├── data/
    │   └── borrowers.js
    └── utils/
        └── matching.js
```

## Suggested team split

- **Integration lead:** run the app, manage Git, own `App.jsx`, and rehearse the demo.
- **Matching model:** validate `src/utils/matching.js` and explain the formulas.
- **UI owner:** improve responsive behaviour and visual consistency in `src/styles.css` and components.
- **Data/reasoning owner:** check the fictional profiles and verify that explanations agree with the displayed scores.
- **QA/pitch owner:** test all controls, run the production build, and prepare the judging narrative.

Make one person responsible for merging changes. Avoid having multiple teammates edit `App.jsx` at the same time.
