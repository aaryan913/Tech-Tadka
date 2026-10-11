import { AlertTriangle, CircleCheck } from 'lucide-react';
import { formatCurrency } from '../utils/matching.js';

export default function PortfolioOverview({ portfolio, budget, expectedProfit }) {
  const invested = portfolio.reduce((sum, item) => sum + item.allocation, 0);
  const expectedLoss = portfolio.reduce((sum, item) => sum + item.allocation * item.defaultRisk, 0);
  const sectors = portfolio.reduce((acc, item) => {
    acc[item.sector] = (acc[item.sector] ?? 0) + item.allocation;
    return acc;
  }, {});
  const sectorEntries = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
  const leadSector = sectorEntries[0];
  const concentration = invested > 0 && leadSector ? leadSector[1] / invested : 0;
  const utilization = budget > 0 ? invested / budget : 0;
  const hasConcentration = concentration > 0.45;

  return (
    <section className="panel portfolio-panel" aria-labelledby="allocation-title">
      <div className="section-heading portfolio-heading">
        <div>
          <div className="eyebrow">PROPOSED DEPLOYMENT</div>
          <h2 id="allocation-title">Portfolio allocation</h2>
          <p>Suggested spread across the current shortlist, capped at 35% per borrower.</p>
        </div>
        <div className="portfolio-total"><span>Allocated</span><strong>{formatCurrency(invested)}</strong></div>
      </div>

      <div className="allocation-summary">
        <div className="allocation-summary-item"><span>Budget used</span><strong>{Math.round(utilization * 100)}%</strong></div>
        <div className="allocation-summary-item"><span>Expected net profit*</span><strong className={expectedProfit >= 0 ? 'positive-value' : 'negative-value'}>{formatCurrency(expectedProfit)}</strong></div>
        <div className="allocation-summary-item"><span>Expected-loss proxy*</span><strong>{formatCurrency(expectedLoss)}</strong></div>
      </div>
      <div className="budget-track"><span style={{ width: `${Math.min(100, utilization * 100)}%` }} /></div>

      <div className="allocation-list">
        {portfolio.map((borrower) => {
          const share = invested > 0 ? borrower.allocation / invested : 0;
          return (
            <div className="allocation-row" key={borrower.id}>
              <div className="allocation-name"><span className="allocation-rank">{borrower.rank}</span><div><strong>{borrower.business}</strong><small>{borrower.sector}</small></div></div>
              <div className="allocation-bar-wrap"><div className="allocation-bar"><span style={{ width: `${Math.min(100, share * 100)}%` }} /></div><small>{Math.round(share * 100)}%</small></div>
              <strong className="allocation-amount">{formatCurrency(borrower.allocation)}</strong>
            </div>
          );
        })}
      </div>

      <div className={`portfolio-note ${hasConcentration ? 'portfolio-note-warning' : 'portfolio-note-good'}`} role="status">
        {hasConcentration ? <AlertTriangle size={16} /> : <CircleCheck size={16} />}
        <div>
          <strong>{hasConcentration ? 'Sector concentration to review' : 'No dominant sector concentration'}</strong>
          <span>{hasConcentration ? `${leadSector[0]} accounts for ${Math.round(concentration * 100)}% of the proposed allocation. Consider whether that exposure fits your plan.` : `The largest sector is ${leadSector?.[0] ?? 'not applicable'} at ${Math.round(concentration * 100)}% of allocated capital.`}</span>
        </div>
      </div>
      <p className="tiny-disclaimer">*Illustrative model output over each loan’s full term. Expected-loss proxy is allocated principal multiplied by the supplied synthetic default estimate; it is not a prediction of actual losses.</p>
    </section>
  );
}
