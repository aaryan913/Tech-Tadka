import { useMemo, useState } from 'react';
import { GitCompareArrows, CheckCircle2, Minus } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/matching.js';

const metrics = [
  { key: 'matchScore', label: 'Match score', format: (value) => `${Math.round(value)}/100`, better: 'high' },
  { key: 'interestRate', label: 'Stated annual interest', format: (value) => formatPercent(value, 0), better: 'high' },
  { key: 'defaultRisk', label: 'Estimated default risk', format: formatPercent, better: 'low' },
  { key: 'netRoi', label: 'Estimated net ROI over term', format: formatPercent, better: 'high' },
  { key: 'durationMonths', label: 'Loan duration', format: (value) => `${value} months`, better: 'low' },
  { key: 'loanAmount', label: 'Requested amount', format: formatCurrency, better: null },
];

export default function BorrowerCompare({ borrowers }) {
  const [leftId, setLeftId] = useState(borrowers[0]?.id ?? '');
  const [rightId, setRightId] = useState(borrowers[1]?.id ?? borrowers[0]?.id ?? '');
  const left = borrowers.find((item) => item.id === leftId) ?? borrowers[0];
  const right = borrowers.find((item) => item.id === rightId) ?? borrowers[1] ?? borrowers[0];
  const sameBorrower = left?.id === right?.id;
  const verdict = useMemo(() => {
    if (!left || !right || sameBorrower) return null;
    if (left.matchScore === right.matchScore) return 'Both listings have the same match score for the current investor settings.';
    const better = left.matchScore > right.matchScore ? left : right;
    return `${better.business} ranks higher for your current risk appetite. Compare default risk and estimated net ROI before deciding.`;
  }, [left, right, sameBorrower]);

  return (
    <section className="panel tool-panel compare-panel">
      <div className="tool-title-row">
        <div className="tool-icon compare-icon"><GitCompareArrows size={18} /></div>
        <div><div className="eyebrow">SIDE-BY-SIDE</div><h2>Compare borrowers</h2></div>
      </div>
      <p className="tool-description">Compare two listings using the current investor risk preference.</p>
      <div className="compare-selects">
        <div><label className="field-label" htmlFor="compare-left">Borrower A</label><select id="compare-left" className="select-input" value={left?.id ?? ''} onChange={(event) => setLeftId(event.target.value)}>{borrowers.map((b) => <option key={b.id} value={b.id}>{b.business}</option>)}</select></div>
        <div><label className="field-label" htmlFor="compare-right">Borrower B</label><select id="compare-right" className="select-input" value={right?.id ?? ''} onChange={(event) => setRightId(event.target.value)}>{borrowers.map((b) => <option key={b.id} value={b.id}>{b.business}</option>)}</select></div>
      </div>
      {sameBorrower ? <p className="compare-same">Choose two different listings to compare them.</p> : <>
        <div className="compare-headings"><div className="compare-borrower-name">{left?.business}<small>{left?.name}</small></div><div className="compare-borrower-name">{right?.business}<small>{right?.name}</small></div></div>
        <div className="compare-metrics">{metrics.map((metric) => {
          const a = left[metric.key];
          const b = right[metric.key];
          const leftBetter = metric.better === 'high' ? a > b : metric.better === 'low' ? a < b : false;
          const rightBetter = metric.better === 'high' ? b > a : metric.better === 'low' ? b < a : false;
          return <div className="compare-row" key={metric.key}><span>{metric.label}</span><strong className={leftBetter ? 'comparison-winner' : ''}>{leftBetter && <CheckCircle2 size={12} />}{metric.format(a)}</strong><strong className={rightBetter ? 'comparison-winner' : ''}>{rightBetter && <CheckCircle2 size={12} />}{metric.format(b)}</strong></div>;
        })}</div>
        <div className="compare-verdict"><Minus size={15} /><span>{verdict}</span></div>
      </>}
      <p className="tiny-disclaimer">“Better” is a simple directional comparison, not a guarantee of repayment or investment performance.</p>
    </section>
  );
}
