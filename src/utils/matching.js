const PROFILES = {
  Low: { safetyWeight: 0.72, returnWeight: 0.28, tolerance: 0.06, label: 'Capital preservation' },
  Medium: { safetyWeight: 0.55, returnWeight: 0.45, tolerance: 0.11, label: 'Balanced opportunity' },
  High: { safetyWeight: 0.35, returnWeight: 0.65, tolerance: 0.19, label: 'Higher potential yield' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value, digits = 1) {
  return `${(Number.isFinite(value) ? value * 100 : 0).toFixed(digits)}%`;
}

function parseRepaymentHistory(value = '') {
  const match = String(value).match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return 0.8;
  const paid = Number(match[1]);
  const total = Number(match[2]);
  return total > 0 ? clamp(paid / total, 0, 1) : 0.8;
}

function stabilityScore(stability = 'Medium') {
  return ({ High: 92, Medium: 70, Low: 46 })[stability] ?? 70;
}

/**
 * Simplified expected net ROI over the full loan term (not annualised).
 * Model assumptions: no principal recovery after default, interest is earned only
 * on successful repayment, and a 1% fee is charged on the invested principal.
 * The borrower probabilities are synthetic demo inputs, not a calibrated model.
 */
export function estimateNetRoi(borrower, feeRate = 0.01) {
  const probabilityRepay = 1 - borrower.defaultRisk;
  const interestOverTerm = borrower.interestRate * (borrower.durationMonths / 12);
  return probabilityRepay * interestOverTerm - borrower.defaultRisk - feeRate;
}

export function rankBorrowers(listings, riskAppetite) {
  const profile = PROFILES[riskAppetite] ?? PROFILES.Medium;

  return listings.map((borrower) => {
    const defaultRiskScore = clamp(100 - borrower.defaultRisk * 400, 0, 100);
    const repaymentScore = parseRepaymentHistory(borrower.repaymentHistory) * 100;
    const stability = stabilityScore(borrower.incomeStability);
    const safetyScore = defaultRiskScore * 0.6 + repaymentScore * 0.25 + stability * 0.15;
    const yieldScore = clamp(((borrower.interestRate - 0.08) / 0.20) * 100, 0, 100);
    const safetyContribution = safetyScore * profile.safetyWeight;
    const yieldContribution = yieldScore * profile.returnWeight;
    const riskPenalty = Math.max(0, borrower.defaultRisk - profile.tolerance) * 100;
    const matchScore = clamp(safetyContribution + yieldContribution - riskPenalty, 0, 100);
    const netRoi = estimateNetRoi(borrower);

    const reasons = [];
    if (borrower.defaultRisk <= profile.tolerance) reasons.push(`estimated default risk of ${Math.round(borrower.defaultRisk * 100)}% is within your selected tolerance`);
    else reasons.push(`estimated default risk of ${Math.round(borrower.defaultRisk * 100)}% is above your selected tolerance`);
    if (netRoi > 0.05) reasons.push('the modelled net return is comparatively strong');
    else if (netRoi > 0) reasons.push('the modelled net return is positive but modest');
    else reasons.push('the modelled net return is currently negative');
    if (repaymentScore >= 90) reasons.push('reported repayment history is strong');

    return {
      ...borrower,
      safetyScore,
      defaultRiskScore,
      repaymentScore,
      stabilityScore: stability,
      yieldScore,
      safetyContribution,
      yieldContribution,
      riskPenalty,
      safetyWeight: profile.safetyWeight,
      returnWeight: profile.returnWeight,
      riskTolerance: profile.tolerance,
      profileLabel: profile.label,
      matchScore,
      netRoi,
      explanation: `${reasons[0].charAt(0).toUpperCase()}${reasons[0].slice(1)}; ${reasons.slice(1).join('; ')}.`,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Allocate in ₹100 increments, proportional to match score, while capping each
 * recommendation at 35% of the budget and never exceeding the borrower's request.
 * The method favours diversification, but the final allocation can be below budget
 * if every shortlisted listing reaches its cap or request limit.
 */
export function allocateBudget(recommendations, totalBudget) {
  const initial = recommendations.map((item) => ({ ...item, allocation: 0 }));
  if (!initial.length || totalBudget <= 0) return initial;

  const unit = 100;
  const maxPerBorrower = Math.max(unit, Math.floor((totalBudget * 0.35) / unit) * unit);
  const maxSteps = Math.floor(totalBudget / unit);
  let steps = maxSteps;

  while (steps > 0) {
    const eligible = initial.filter((item) => item.allocation + unit <= Math.min(item.loanAmount, maxPerBorrower));
    if (!eligible.length) break;

    eligible.sort((a, b) => {
      const aLoad = a.allocation / Math.max(a.matchScore, 1);
      const bLoad = b.allocation / Math.max(b.matchScore, 1);
      return aLoad - bLoad || recommendations.findIndex((x) => x.id === a.id) - recommendations.findIndex((x) => x.id === b.id);
    });

    eligible[0].allocation += unit;
    steps -= 1;
  }

  // Preserve small non-hundred remainders if this function is reused with custom budgets.
  const allocated = initial.reduce((sum, item) => sum + item.allocation, 0);
  const remainder = Math.max(0, totalBudget - allocated);
  if (remainder > 0) {
    for (const item of initial) {
      const cap = Math.min(item.loanAmount, maxPerBorrower);
      const extra = Math.min(remainder, cap - item.allocation);
      if (extra > 0) {
        item.allocation += extra;
        break;
      }
    }
  }

  return initial;
}

export function describeRisk(risk) {
  if (risk <= 0.05) return { label: 'Lower', className: 'risk-low' };
  if (risk <= 0.12) return { label: 'Moderate', className: 'risk-medium' };
  return { label: 'Higher', className: 'risk-high' };
}
