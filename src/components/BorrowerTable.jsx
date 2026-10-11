import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownUp } from 'lucide-react';
import { formatCurrency, formatPercent, describeRisk } from '../utils/matching.js';

export default function BorrowerTable({ borrowers }) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All sectors');
  const [riskFilter, setRiskFilter] = useState('Any risk');
  const [sortBy, setSortBy] = useState('matchScore');

  const sectors = useMemo(() => ['All sectors', ...new Set(borrowers.map((item) => item.sector))].sort((a, b) => a === 'All sectors' ? -1 : b === 'All sectors' ? 1 : a.localeCompare(b)), [borrowers]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return borrowers.filter((b) => {
      const matchesSearch = !normalized || `${b.name} ${b.business} ${b.sector} ${b.city} ${b.id}`.toLowerCase().includes(normalized);
      const matchesSector = sector === 'All sectors' || b.sector === sector;
      const matchesRisk = riskFilter === 'Any risk' || (riskFilter === 'Lower risk' && b.defaultRisk <= 0.05) || (riskFilter === 'Moderate risk' && b.defaultRisk > 0.05 && b.defaultRisk <= 0.12) || (riskFilter === 'Higher risk' && b.defaultRisk > 0.12);
      return matchesSearch && matchesSector && matchesRisk;
    }).sort((a, b) => sortBy === 'risk' ? a.defaultRisk - b.defaultRisk : sortBy === 'return' ? b.netRoi - a.netRoi : sortBy === 'request' ? a.loanAmount - b.loanAmount : b.matchScore - a.matchScore);
  }, [borrowers, query, sector, riskFilter, sortBy]);

  return (
    <section className="panel market-panel" aria-labelledby="market-title">
      <div className="section-heading market-heading">
        <div>
          <div className="eyebrow">OPEN LISTINGS</div>
          <h2 id="market-title">Borrower marketplace <span className="count-pill">{filtered.length} of {borrowers.length}</span></h2>
          <p>Search all sample listings and inspect how the current model ranks them.</p>
        </div>
        <div className="sort-note"><ArrowDownUp size={15} /> <span>Demo listings</span></div>
      </div>
      <div className="market-filters">
        <label className="search-field"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, business, city…" aria-label="Search borrower listings" /></label>
        <label className="filter-field"><span>Sector</span><select value={sector} onChange={(event) => setSector(event.target.value)} aria-label="Filter by sector">{sectors.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="filter-field"><span>Risk</span><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} aria-label="Filter by risk">{['Any risk', 'Lower risk', 'Moderate risk', 'Higher risk'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="filter-field sort-field"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort listings"> <option value="matchScore">Match score</option><option value="risk">Lowest risk</option><option value="return">Net ROI</option><option value="request">Loan request</option></select></label>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Borrower / business</th><th>Request</th><th>Stated APR</th><th>Est. default risk</th><th>Match score</th><th>Est. net ROI*</th></tr></thead>
          <tbody>
            {filtered.map((b) => {
              const risk = describeRisk(b.defaultRisk);
              return <tr key={b.id}>
                <td><div className="table-borrower">{b.business}</div><div className="table-secondary">{b.name} · {b.city}</div></td>
                <td className="numeric-cell">{formatCurrency(b.loanAmount)}</td>
                <td className="numeric-cell">{formatPercent(b.interestRate, 0)}</td>
                <td><span className={`risk-pill ${risk.className}`}>{formatPercent(b.defaultRisk)}</span></td>
                <td><div className="table-score"><div className="score-track"><span style={{ width: `${b.matchScore}%` }} /></div><strong>{Math.round(b.matchScore)}</strong></div></td>
                <td className={`numeric-cell ${b.netRoi >= 0 ? 'positive-value' : 'negative-value'}`}>{formatPercent(b.netRoi)}</td>
              </tr>;
            })}
            {!filtered.length && <tr><td className="empty-table" colSpan="6"><SlidersHorizontal size={18} /> No listings match those filters. Try another search or reset a filter.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="table-footnote">*Net ROI is estimated over the full loan term, not annualised. All profiles and probabilities are fictional. This is a demonstration model, not a credit decision.</p>
    </section>
  );
}
