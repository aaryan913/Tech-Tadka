import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils/matching.js';

export default function StressTestPanel({ portfolio }) {
  const [selectedId, setSelectedId] = useState(portfolio[0]?.id ?? '');
  const [active, setActive] = useState(false);
  const selected = portfolio.find((borrower) => borrower.id === selectedId) ?? portfolio[0];
  const portfolioSignature = portfolio.map((item) => `${item.id}:${item.allocation}:${item.netRoi}`).join('|');

  useEffect(() => {
    setActive(false);
    setSelectedId((current) => portfolio.some((item) => item.id === current) ? current : (portfolio[0]?.id ?? ''));
  }, [portfolioSignature]);

  const results = useMemo(() => {
    const baselineProfit = portfolio.reduce((sum, borrower) => sum + borrower.allocation * borrower.netRoi, 0);
    if (!selected || !active) return { baselineProfit, stressedProfit: baselineProfit, difference: 0, loss: selected ? selected.allocation * 1.01 : 0 };
    const expectedProfitOnSelected = selected.allocation * selected.netRoi;
    const realisedDefaultOutcome = -selected.allocation * 1.01;
    const stressedProfit = baselineProfit - expectedProfitOnSelected + realisedDefaultOutcome;
    return { baselineProfit, stressedProfit, difference: stressedProfit - baselineProfit, loss: Math.abs(realisedDefaultOutcome) };
  }, [portfolio, selected, active]);

  return (
    <section className="panel tool-panel stress-panel" aria-labelledby="stress-title">
      <div className="tool-title-row"><div className="tool-icon warning-icon"><ShieldAlert size={18} /></div><div><div className="eyebrow">SCENARIO LAB</div><h2 id="stress-title">What if a borrower defaults?</h2></div></div>
      <p className="tool-description">Replace one borrower's expected outcome with a full principal-loss scenario to see the modelled impact on the whole shortlist.</p>
      <label className="field-label" htmlFor="stress-borrower">Choose a position to stress</label>
      <select id="stress-borrower" className="select-input" value={selected?.id ?? ''} onChange={(event) => { setSelectedId(event.target.value); setActive(false); }}>
        {portfolio.map((borrower) => <option key={borrower.id} value={borrower.id}>{borrower.business} · {formatCurrency(borrower.allocation)}</option>)}
      </select>
      <div className="stress-metrics"><div><span>Baseline modelled profit</span><strong>{formatCurrency(results.baselineProfit)}</strong></div><div><span>{active ? 'Profit after simulated default' : 'Principal + fee exposed'}</span><strong className={active ? (results.stressedProfit >= 0 ? 'positive-value' : 'negative-value') : 'negative-value'}>{active ? formatCurrency(results.stressedProfit) : `−${formatCurrency(results.loss)}`}</strong></div></div>
      {active && <div className={`stress-result ${results.stressedProfit >= 0 ? 'stress-result-neutral' : ''}`} role="status"><AlertTriangle size={16} /><div><strong>Scenario applied</strong><span>Compared with the baseline, modelled profit changes by {formatCurrency(results.difference)} if {selected?.business} defaults.</span></div></div>}
      <div className="tool-actions"><button className="button button-primary" type="button" onClick={() => setActive(true)} disabled={!selected || selected.allocation <= 0}>Run stress test</button><button className="button button-secondary" type="button" onClick={() => setActive(false)} disabled={!active}><RotateCcw size={14} /> Reset scenario</button></div>
      <p className="tiny-disclaimer">Illustrative scenario only. Assumes principal is not recovered and a 1% fee applies; it is not a forecast of an actual loss.</p>
    </section>
  );
}
