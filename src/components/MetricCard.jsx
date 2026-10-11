export default function MetricCard({ label, value, hint, icon: Icon, tone = 'sage' }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{Icon ? <Icon size={18} strokeWidth={1.8} /> : null}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-hint">{hint}</div>
    </article>
  );
}
