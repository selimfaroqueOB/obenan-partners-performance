// ============================================
// OBENAN Partner Performance Data — 2026
// ============================================
// To update: change the numbers below and push to GitHub.
// Vercel will auto-deploy the new version.
//
// currentMonthIdx: 0 = Jan, 1 = Feb, ... 11 = Dec
// Update this each month when you add new actuals.
// ============================================

export const CURRENT_MONTH_IDX = 0; // <-- UPDATE THIS EACH MONTH

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const CHANNEL_COLORS = {
  Referrals: "#E8927C",
  Resellers: "#7CB5E8",
  Agencies: "#A8D5A2",
};

// ============================================
// PERFORMANCE TARGETS & ACTUALS
// ============================================
// Each array has 12 values: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
// Update the monthly actuals as they come in.

export const PERF = {
  totalClosedADV: [10320, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  totalClosedMRR: [860, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  totalTargetMRR: [605.20, 1008.36, 1387.22, 1680.08, 1848.09, 2032.89, 1565.33, 1674.90, 2560.21, 2816.23, 3097.85, 2385.34],
  companyGrowthMRR: [4034.64, 6722.42, 9248.14, 11200.52, 12320.57, 13552.63, 10435.52, 11166.01, 17068.05, 18774.85, 20652.34, 15902.30],
  companyGrowthPct: [0.044, 0.07, 0.09, 0.10, 0.10, 0.10, 0.07, 0.07, 0.10, 0.10, 0.10, 0.07],

  referrals: {
    closedADV: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    closedMRR: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    targetMRR: [181.56, 302.51, 416.17, 504.02, 554.43, 609.87, 469.60, 502.47, 768.06, 844.87, 929.36, 715.60],
  },
  resellers: {
    closedADV: [3120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    closedMRR: [260, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    targetMRR: [363.12, 605.02, 832.33, 1008.05, 1108.85, 1219.74, 939.20, 1004.94, 1536.12, 1689.74, 1858.71, 1431.21],
  },
  agencies: {
    closedADV: [7200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    closedMRR: [600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    targetMRR: [60.52, 100.84, 138.72, 168.01, 184.81, 203.29, 156.53, 167.49, 256.02, 281.62, 309.79, 238.53],
  },
};

// ============================================
// INDIVIDUAL PARTNERS
// ============================================
// mrr2026: array of 12 monthly MRR values [Jan..Dec]
// adv2026: total ADV closed in 2026
// adv: historical ADV (before 2026)
// mrrAvg: historical average monthly MRR

export const PARTNERS = {
  referrals: [
    { name: "Orjuela, Juan", country: "Colombia", adv: 47265, mrrAvg: 174.61, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "4-6% indirect", start: "2024-02" },
    { name: "Vega, Hensey (Lebrand)", country: "Colombia", adv: 33793, mrrAvg: 244.70, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% direct", start: "2025-01" },
    { name: "Kutval, Alphan", country: "Spain", adv: 31920, mrrAvg: 233.13, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-01" },
    { name: "La Marcaderia", country: "Colombia", adv: 28899, mrrAvg: 119.82, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-04" },
    { name: "Vries, Elody de", country: "Netherlands", adv: 26760, mrrAvg: 46.84, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% recurring", start: "2022-01" },
    { name: "Molzait", country: "Austria", adv: 13320, mrrAvg: 218.42, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-07" },
    { name: "Gassert, Mike", country: "Germany", adv: 7200, mrrAvg: 53.67, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-01" },
    { name: "Pinzon, Henry", country: "US", adv: 5709, mrrAvg: 26.87, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-07" },
    { name: "Imrek, Tolga (BillNow)", country: "Germany", adv: 3600, mrrAvg: 26.14, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-01" },
    { name: "Castano, Mariana", country: "Colombia", adv: 2580, mrrAvg: 13.44, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-08" },
    { name: "Lange, Anina", country: "Germany", adv: 2400, mrrAvg: 45.86, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-08" },
    { name: "Voropaev, Anastasia", country: "Germany", adv: 2400, mrrAvg: 32.97, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% recurring", start: "2025-06" },
    { name: "Bobadilla, Carlos", country: "US", adv: 2158, mrrAvg: 12.58, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-10" },
    { name: "Rud, Matthias", country: "Germany", adv: 2160, mrrAvg: 9.84, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-06" },
    { name: "Okumus, Alp", country: "Spain", adv: 1500, mrrAvg: 12.75, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-03" },
    { name: "Aurange, Michel", country: "France", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-07" },
    { name: "Deegan Hotel Consulting", country: "UK", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2023-10" },
    { name: "Hospitality Dashboard", country: "Netherlands", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-06" },
    { name: "Hotel Boost AG", country: "Switzerland", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-09" },
    { name: "Incognito Service Audit", country: "Germany", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-12" },
    { name: "Just, Frank (Brenner)", country: "Germany", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-04" },
    { name: "Keurentjes, Leron", country: "Netherlands", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-03" },
    { name: "Martens, Matthias", country: "Germany", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-07" },
    { name: "Medani", country: "Austria", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-09" },
    { name: "OP Hospitality", country: "Netherlands", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-04" },
    { name: "Salebe, Fuad", country: "Colombia", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2023-06" },
    { name: "Schoonhoven, Jamahl", country: "Netherlands", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-01" },
    { name: "Serafin, Rodrigo", country: "Spain", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-04" },
    { name: "Tejeda, Paula", country: "Mexico", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10-25% direct", start: "2026-02" },
    { name: "Tenzo", country: "UK", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-02" },
    { name: "Torres, Francisco", country: "Spain", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-10" },
    { name: "Marktplatz", country: "Germany", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-11" },
    { name: "Places App", country: "UK", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2024-12" },
    { name: "Zenchef", country: "France", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2025-01" },
    { name: "WEBIMPACTO", country: "Spain", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "10% direct", start: "2023-04" },
  ],
  resellers: [
    { name: "Biermann, Benjamin", country: "Germany", adv: 81792, mrrAvg: 325.33, adv2026: 3120, mrr2026: [260,0,0,0,0,0,0,0,0,0,0,0], commission: "35% rev share", start: "2024-04" },
    { name: "Restaurant Marketing", country: "Germany", adv: 28800, mrrAvg: 116.38, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% rev share", start: "2024-04" },
    { name: "Kabal Digital Agency", country: "Greece", adv: 17160, mrrAvg: 44.73, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "50/20% rev share", start: "2023-05" },
    { name: "Eetgency", country: "Netherlands", adv: 10800, mrrAvg: 75.62, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% rev share", start: "2025-01" },
    { name: "Noun, John", country: "US", adv: 1800, mrrAvg: 8.35, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% rev share", start: "2024-07" },
    { name: "Creemers, Xiaojun", country: "Netherlands", adv: 1032, mrrAvg: 8.95, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% rev share", start: "2025-03" },
    { name: "Amancio, Daniely", country: "Brazil", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "30-35% rev share", start: "2026-01" },
    { name: "Segrace", country: "China", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "25% rev share", start: "2025-06" },
  ],
  agencies: [
    { name: "Lemon Ginger", country: "Netherlands", adv: 33000, mrrAvg: 230.43, adv2026: 3600, mrr2026: [300,0,0,0,0,0,0,0,0,0,0,0], commission: "€100/location", start: "2025-01" },
    { name: "Agentur.91", country: "Germany", adv: 0, mrrAvg: 0, adv2026: 0, mrr2026: [0,0,0,0,0,0,0,0,0,0,0,0], commission: "€150-200/location", start: "2024-12" },
    { name: "Findri", country: "Netherlands", adv: 0, mrrAvg: 0, adv2026: 3600, mrr2026: [300,0,0,0,0,0,0,0,0,0,0,0], commission: "No agreement", start: "-" },
  ],
};
