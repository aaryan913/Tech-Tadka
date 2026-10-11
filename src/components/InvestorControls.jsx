import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../utils/matching.js';

const riskOptions = [
  { label: 'Low', title: 'Safety first', note: 'Give repayment reliability more weight' },
  { label: 'Medium', title: 'Balanced', note: 'Balance stability with return potential' },
  { label: 'High', title: 'Yield seeking', note: 'Accept more estimated uncertainty' },
];

export default function InvestorControls({ amount, onAmountChange, riskAppetite, onRiskChange, onReset }) {
  const progress = ((amount - 5000) / 45000) * 100;
  return (
    <section className="panel controls-panel" aria-labelledby="controls-title">
      <div className="section-heading controls-heading">
        <div><div className="eyebrow">INVESTOR PROFILE</div><h2 id="controls-title">Set your preferences</h2><p>Recommendations update as you adjust the inputs.</p></div>
        <button className="quiet-icon-button" type="button" onClick={onReset} title="Reset investor profile" aria-label="Reset investor profile"><RotateCcw size={16} /></button>
      </div>

      <div className="control-group">
        <div className="control-label-row"><label htmlFor="investment-amount">Investment budget</label><strong className="budget-value">{formatCurrency(amount)}</strong></div>
        <input id="investment-amount" className="range-input" type="range" min="5000" max="50000" step="1000" value={amount} style={{ background: `linear-gradient(90deg, #2f6852 0%, #2f6852 ${progress}%, #e1e7df ${progress}%, #e1e7df 100%)` }} onChange={(event) => onAmountChange(Number(event.target.value))} aria-valuetext={formatCurrency(amount)} />
        <div className="range-labels"><span>₹5,000</span><span>₹50,000</span></div>
        <div className="quick-amounts" aria-label="Quick budget selections">{[10000, 25000, 40000].map((value) => <button type="button" key={value} onClick={() => onAmountChange(value)} className={amount === value ? 'quick-amount selected' : 'quick-amount'}>{value === 10000 ? '₹10k' : value === 25000 ? '₹25k' : '₹40k'}</button>)}</div>
      </div>

      <div className="control-group risk-control-group">
        <div className="control-label-row"><label>Risk appetite</label><span className="field-hint">Select one</span></div>
        <div className="risk-options" role="group" aria-label="Risk appetite">
          {riskOptions.map((option) => <button key={option.label} type="button" className={`risk-option ${riskAppetite === option.label ? 'selected' : ''}`} onClick={() => onRiskChange(option.label)} aria-pressed={riskAppetite === option.label}>
            <span className={`risk-radio ${riskAppetite === option.label ? 'checked' : ''}`} />
            <span className="risk-option-copy"><span className="risk-option-title">{option.label}</span><span className="risk-option-note">{option.note}</span></span>
          </button>)}
        </div>
      </div>
      <div className="control-model-note"><SlidersHorizontal size={15} /><span>Risk appetite changes how safety, repayment history and yield contribute to the ranking. It does not alter the underlying borrower data.</span></div>
    </section>
  );
}
