import { useMemo, useState } from 'react';
import {
  Activity, ArrowDownToLine, ArrowUpRight, BadgeIndianRupee, BookOpenCheck,
  BarChart3, CircleHelp, HandCoins, LayoutDashboard, RotateCcw,
  ShieldCheck, UsersRound, Wallet,
} from 'lucide-react';
import { borrowers } from './data/borrowers.js';
import { allocateBudget, formatCurrency, formatPercent, rankBorrowers } from './utils/matching.js';
import MetricCard from './components/MetricCard.jsx';
import InvestorControls from './components/InvestorControls.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import BorrowerTable from './components/BorrowerTable.jsx';
import StressTestPanel from './components/StressTestPanel.jsx';
import BorrowerCompare from './components/BorrowerCompare.jsx';
import PortfolioOverview from './components/PortfolioOverview.jsx';

const todayLabel = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
}).format(new Date());

function exportCsv(portfolio, amount, riskAppetite) {
  const columns = [
    ['Rank', (b) => b.rank],
    ['Business', (b) => b.business],
    ['Borrower', (b) => b.name],
    ['Listing ID', (b) => b.id],
    ['Sector', (b) => b.sector],
    ['Requested loan INR', (b) => b.loanAmount],
    ['Suggested allocation INR', (b) => b.allocation],
    ['Match score out of 100', (b) => Math.round(b.matchScore)],
    ['Stated APR', (b) => formatPercent(b.interestRate, 2)],
    ['Synthetic default estimate', (b) => formatPercent(b.defaultRisk, 2)],
    ['Estimated net ROI over term', (b) => formatPercent(b.netRoi, 2)],
    ['Estimated net profit INR', (b) => (b.allocation * b.netRoi).toFixed(2)],
    ['Reason', (b) => b.explanation],
  ];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [
    quote('LendLens simulated recommendation report'),
    quote(`Generated ${new Date().toLocaleString('en-IN')}`),
    quote(`Budget ${formatCurrency(amount)} · Risk profile ${riskAppetite}`),
    quote('All borrower profiles and default estimates are fictional; estimates are not guarantees.'),
    '',
    columns.map(([label]) => quote(label)).join(','),
    ...portfolio.map((b) => columns.map(([, getter]) => quote(getter(b))).join(',')),
  ];
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'lendlens-recommendations.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [amount, setAmount] = useState(25000);
  const [riskAppetite, setRiskAppetite] = useState('Medium');
  const [exported, setExported] = useState(false);

  const rankedBorrowers = useMemo(() => rankBorrowers(borrowers, riskAppetite), [riskAppetite]);
  const topFive = useMemo(
    () => allocateBudget(rankedBorrowers.slice(0, 5), amount).map((item, index) => ({ ...item, rank: index + 1 })),
    [rankedBorrowers, amount],
  );
  const allocationTotal = topFive.reduce((sum, borrower) => sum + borrower.allocation, 0);
  const totalProjectedProfit = topFive.reduce((sum, borrower) => sum + borrower.allocation * borrower.netRoi, 0);
  const expectedLoss = topFive.reduce((sum, borrower) => sum + borrower.allocation * borrower.defaultRisk, 0);
  const allocatedRoi = allocationTotal > 0 ? totalProjectedProfit / allocationTotal : 0;
  const averageScore = topFive.length
    ? topFive.reduce((sum, borrower) => sum + borrower.matchScore, 0) / topFive.length
    : 0;

  const resetProfile = () => {
    setAmount(25000);
    setRiskAppetite('Medium');
    setExported(false);
  };

  const handleExport = () => {
    exportCsv(topFive, amount, riskAppetite);
    setExported(true);
  };

  const insight = riskAppetite === 'Low'
    ? { title: 'Protect the downside first.', text: 'The ranking gives repayment signals and lower estimated default risk more influence. Listings with higher stated rates may fall if their added risk does not suit this profile.' }
    : riskAppetite === 'High'
      ? { title: 'Consider yield, without hiding risk.', text: 'Higher-rate listings receive more weight, but the model still applies a penalty when estimated default risk exceeds this profile’s tolerance. Check the downside before allocating.' }
      : { title: 'Balance yield with repayment signals.', text: 'The current profile gives meaningful weight to both estimated safety and rate potential. Expand a match score to see the factors and the penalty behind its position.' };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand-lockup" href="#overview" aria-label="LendLens overview">
          <div className="brand-mark"><HandCoins size={21} strokeWidth={1.9} /></div>
          <div className="brand-copy"><div className="brand-name">lend<span>lens</span></div><div className="brand-caption">LENDING INTELLIGENCE</div></div>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={17} /><span>Overview</span></a>
          <a className="nav-item" href="#recommendations"><BookOpenCheck size={17} /><span>Smart matches</span><span className="nav-count">05</span></a>
          <a className="nav-item" href="#intelligence"><BarChart3 size={17} /><span>Portfolio intelligence</span></a>
          <a className="nav-item" href="#marketplace"><UsersRound size={17} /><span>Marketplace</span></a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-data-note"><div className="sidebar-note-icon"><ShieldCheck size={16} /></div><div><strong>Safe demo environment</strong><p>Fictional listings. No money movement or live credit decisions.</p></div></div>
        <div className="sidebar-user"><div className="avatar">LL</div><div className="user-copy"><strong>Analyst workspace</strong><span>Local simulation</span></div><span className="user-online" aria-label="Demo active" /></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Investor overview</strong></div>
          <div className="topbar-actions"><div className="environment-tag"><span className="environment-dot" /> SIMULATION ENVIRONMENT</div><span className="topbar-date">{todayLabel}</span></div>
        </header>

        <section className="welcome-row">
          <div className="welcome-copy"><div className="eyebrow">LENDLENS / INVESTOR WORKSPACE</div><h1>Your lending shortlist,<br className="desktop-break" /> with the maths in view.</h1><p>Compare open micro-loan listings by potential return, repayment risk, and fit with your investment plan.</p></div>
          <div className="welcome-actions"><button className="button button-secondary" type="button" onClick={resetProfile}><RotateCcw size={15} /> Reset profile</button><button className="button button-primary" type="button" onClick={handleExport}><ArrowDownToLine size={16} /> {exported ? 'Export again' : 'Export shortlist'}</button></div>
        </section>

        <div className="model-strip"><span className="model-strip-icon"><CircleHelp size={15} /></span><span><strong>Decision-support prototype.</strong> Borrower profiles and default estimates are synthetic; ROI values are modelled outcomes, not guaranteed returns.</span></div>

        <section className="metrics-grid" aria-label="Portfolio summary">
          <MetricCard label="Investment budget" value={formatCurrency(amount)} hint="Available to allocate" icon={Wallet} tone="sage" />
          <MetricCard label="Capital allocated" value={formatCurrency(allocationTotal)} hint={`${amount > 0 ? Math.round(allocationTotal / amount * 100) : 0}% of budget deployed`} icon={BadgeIndianRupee} tone="blue" />
          <MetricCard label="Modelled net profit" value={formatCurrency(totalProjectedProfit)} hint={`${formatPercent(allocatedRoi)} estimated ROI on allocated capital`} icon={totalProjectedProfit >= 0 ? ArrowUpRight : Activity} tone={totalProjectedProfit >= 0 ? 'green' : 'amber'} />
          <MetricCard label="Expected-loss proxy" value={formatCurrency(expectedLoss)} hint={`Across ${topFive.filter((b) => b.allocation > 0).length} proposed positions`} icon={ShieldCheck} tone="amber" />
        </section>

        <section className="dashboard-grid">
          <InvestorControls amount={amount} onAmountChange={(value) => { setAmount(value); setExported(false); }} riskAppetite={riskAppetite} onRiskChange={(value) => { setRiskAppetite(value); setExported(false); }} onReset={resetProfile} />
          <section className="panel insight-panel" aria-live="polite">
            <div className="insight-top"><div className="insight-icon"><Activity size={17} /></div><span className="insight-label">MATCHING NOTE</span><span className="insight-context">{riskAppetite.toUpperCase()} RISK PROFILE</span></div>
            <h2>{insight.title}</h2><p>{insight.text}</p>
            <div className="insight-rule-list"><div><span>Safety weight</span><strong>{Math.round(topFive[0]?.safetyWeight * 100 || 55)}%</strong></div><div><span>Yield weight</span><strong>{Math.round(topFive[0]?.returnWeight * 100 || 45)}%</strong></div><div><span>Risk tolerance guide</span><strong>{formatPercent(topFive[0]?.riskTolerance ?? 0.11, 0)}</strong></div></div>
          </section>
        </section>

        <section className="recommendations-section" id="recommendations">
          <div className="section-heading recommendation-heading"><div><div className="eyebrow">PERSONALISED FOR THIS PROFILE</div><h2>Recommended borrowers <span className="count-pill">TOP 5</span></h2><p>Ranked by estimated fit. Use the score breakdown to inspect the calculation behind each position.</p></div><div className="ranking-status"><span className="ranking-dot" /> Recalculates on input change</div></div>
          <div className="recommendation-list">{topFive.map((borrower) => <RecommendationCard key={borrower.id} borrower={borrower} rank={borrower.rank} />)}</div>
          <p className="assumption-note">ROI is estimated over each loan’s full term, not annualised. The model assumes full principal loss on default, no recovery, interest only on successful repayment, and a 1% fee on principal.</p>
        </section>

        <section className="intelligence-section" id="intelligence">
          <div className="section-heading intelligence-heading"><div><div className="eyebrow">BEYOND A SIMPLE RANKING</div><h2>Portfolio intelligence</h2><p>Review the proposed allocations, compare alternatives, and test a downside scenario.</p></div></div>
          <div className="portfolio-layout"><PortfolioOverview portfolio={topFive} budget={amount} expectedProfit={totalProjectedProfit} /><div className="scenario-column"><StressTestPanel portfolio={topFive} /><BorrowerCompare borrowers={rankedBorrowers} /></div></div>
        </section>

        <div id="marketplace"><BorrowerTable borrowers={rankedBorrowers} /></div>
        <footer className="app-footer"><span>© {new Date().getFullYear()} LendLens · Student hackathon prototype</span><span><span className="footer-dot" /> Local simulation · No live borrower data</span></footer>
      </main>
    </div>
  );
}
