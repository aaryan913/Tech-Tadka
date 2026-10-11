import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, CalendarDays, CircleHelp, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPercent, describeRisk } from '../utils/matching.js';

export default function RecommendationCard({ borrower, rank }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const risk = describeRisk(borrower.defaultRisk);
  const estimatedProfit = borrower.allocation * borrower.netRoi;
  const breakdown = [
    { label: 'Repayment safety', value: borrower.safetyScore, contribution: borrower.safetyContribution, weight: borrower.safetyWeight },
    { label: 'Interest-rate potential', value: borrower.yieldScore, contribution: borrower.yieldContribution, weight: borrower.returnWeight },
  ];

  return (
    <article className="recommendation-card">
      <div className="recommendation-rank-column"><span className="rank-number">{String(rank).padStart(2, '0')}</span><span className="rank-label">RANK</span></div>
      <div className="recommendation-main">
        <div className="borrower-topline">
          <div className="borrower-identity"><h3>{borrower.business}</h3><div className="borrower-person">{borrower.name} <span>·</span> {borrower.id}</div></div>
          <div className="match-score"><strong>{Math.round(borrower.matchScore)}</strong><span>/ 100 match</span></div>
        </div>
        <div className="borrower-meta"><span><MapPin size={14} />{borrower.city}</span><span><CalendarDays size={14} />{borrower.durationMonths}-month term</span><span><CheckCircle2 size={14} />{borrower.repaymentHistory}</span></div>
        <div className="recommendation-stats">
          <div><span>Stated annual APR</span><strong>{formatPercent(borrower.interestRate, 0)}</strong></div>
          <div><span>Estimated default risk</span><strong className={risk.className}>{formatPercent(borrower.defaultRisk)}</strong></div>
          <div><span>Estimated net ROI*</span><strong className={borrower.netRoi >= 0 ? 'positive-value' : 'negative-value'}>{formatPercent(borrower.netRoi)}</strong></div>
        </div>
        <div className="explanation"><CircleHelp size={15} /><span>{borrower.explanation}</span></div>
        <button className="breakdown-toggle" type="button" onClick={() => setShowBreakdown((value) => !value)} aria-expanded={showBreakdown}>{showBreakdown ? 'Hide score breakdown' : 'How this score was calculated'}{showBreakdown ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
        {showBreakdown && <div className="score-breakdown">
          {breakdown.map((item) => <div key={item.label} className="breakdown-item"><div className="score-row"><span>{item.label} <small>· {Math.round(item.weight * 100)}% weight</small></span><strong>{Math.round(item.value)}/100</strong></div><div className="score-track breakdown-track"><span style={{ width: `${item.value}%` }} /></div></div>)}
          <div className="score-explanation"><span>Risk penalty</span><strong>−{borrower.riskPenalty.toFixed(1)} points</strong></div>
          <p>Final score = weighted safety + weighted yield − penalty when estimated default risk exceeds the {Math.round(borrower.riskTolerance * 100)}% tolerance for this profile.</p>
        </div>}
      </div>
      <div className="allocation-block"><span>Suggested allocation</span><strong>{formatCurrency(borrower.allocation)}</strong><small className={estimatedProfit >= 0 ? 'positive-value' : 'negative-value'}>{formatCurrency(estimatedProfit)} modelled net profit</small><div className="allocation-block-foot">{borrower.sector}</div></div>
    </article>
  );
}
