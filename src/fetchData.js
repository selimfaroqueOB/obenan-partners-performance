// ============================================
// Live Google Sheets Data Fetcher
// ============================================
// Fetches published CSV data from your Google Sheet
// and parses it into the same format the dashboard expects.
//
// To update the sheet links, change the URLs below.
// ============================================

const SHEET_URLS = {
  performance: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS44A9WaJHn9l_I9CDTcLnFgRD5oRjtKW90L8y3q-fc1PI4qC-FcSIftjkKW0vk77W_CnB51k2CcGFH/pub?gid=359741855&single=true&output=csv",
  referrals: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS44A9WaJHn9l_I9CDTcLnFgRD5oRjtKW90L8y3q-fc1PI4qC-FcSIftjkKW0vk77W_CnB51k2CcGFH/pub?gid=0&single=true&output=csv",
  resellers: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS44A9WaJHn9l_I9CDTcLnFgRD5oRjtKW90L8y3q-fc1PI4qC-FcSIftjkKW0vk77W_CnB51k2CcGFH/pub?gid=698698364&single=true&output=csv",
  agencies: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS44A9WaJHn9l_I9CDTcLnFgRD5oRjtKW90L8y3q-fc1PI4qC-FcSIftjkKW0vk77W_CnB51k2CcGFH/pub?gid=1988093832&single=true&output=csv",
};

function parseCSV(text) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  const lines = text.split("\n");

  for (const line of lines) {
    if (inQuotes) {
      current += "\n" + line;
      if ((line.match(/"/g) || []).length % 2 === 1) {
        inQuotes = false;
        rows.push(parseCSVRow(current));
        current = "";
      }
    } else {
      const quoteCount = (line.match(/"/g) || []).length;
      if (quoteCount % 2 === 1) {
        inQuotes = true;
        current = line;
      } else {
        rows.push(parseCSVRow(line));
      }
    }
  }
  return rows;
}

function parseCSVRow(row) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cells.push(current.trim());
  return cells;
}

function num(val) {
  if (!val || val === "" || val === "-") return 0;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function findRow(rows, label) {
  return rows.find((r) => r[1] && r[1].trim() === label);
}

function getMonthlyValues(row) {
  if (!row) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return Array.from({ length: 12 }, (_, i) => num(row[i + 2]));
}

function detectCurrentMonth(mrrRow) {
  // Find the last month that has actual data (non-zero)
  const values = getMonthlyValues(mrrRow);
  let lastIdx = -1;
  for (let i = 0; i < 12; i++) {
    if (values[i] !== 0) lastIdx = i;
  }
  return Math.max(0, lastIdx);
}

function parsePerformance(rows) {
  const totalClosedADV = getMonthlyValues(findRow(rows, "Total Closed ARR"));
  const totalClosedMRR = getMonthlyValues(findRow(rows, "Total Closed MRR"));
  const totalTargetMRR = getMonthlyValues(findRow(rows, "Total Target MRR"));
  const companyGrowthMRR = getMonthlyValues(findRow(rows, "Company Growth Target MRR"));
  const companyGrowthPct = getMonthlyValues(findRow(rows, "Company Growth Target %"));

  // Referrals
  const refSection = rows.findIndex((r) => r[1] && r[1].trim() === "Referrals Performance");
  const refRows = refSection >= 0 ? rows.slice(refSection) : [];
  const refClosedADV = getMonthlyValues(findRow(refRows, "Deals Closed ARR"));
  const refClosedMRR = getMonthlyValues(findRow(refRows, "Deals Closed MRR"));
  const refTarget = getMonthlyValues(findRow(refRows, "Monthly Target"));

  // Resellers
  const resSection = rows.findIndex((r) => r[1] && r[1].trim() === "Resellers Performance");
  const resRows = resSection >= 0 ? rows.slice(resSection) : [];
  const resClosedADV = getMonthlyValues(findRow(resRows, "Deals Closed ARR"));
  const resClosedMRR = getMonthlyValues(findRow(resRows, "Deals Closed MRR"));
  const resTarget = getMonthlyValues(findRow(resRows, "Monthly Target"));

  // Agencies
  const agSection = rows.findIndex((r) => r[1] && r[1].trim() === "Agencies Performance");
  const agRows = agSection >= 0 ? rows.slice(agSection) : [];
  const agClosedADV = getMonthlyValues(findRow(agRows, "Deals Closed ARR"));
  const agClosedMRR = getMonthlyValues(findRow(agRows, "Deals Closed MRR"));
  const agTarget = getMonthlyValues(findRow(agRows, "Monthly Target"));

  const currentMonthIdx = detectCurrentMonth(findRow(rows, "Total Closed MRR"));

  return {
    currentMonthIdx,
    totalClosedADV,
    totalClosedMRR,
    totalTargetMRR,
    companyGrowthMRR,
    companyGrowthPct,
    referrals: { closedADV: refClosedADV, closedMRR: refClosedMRR, targetMRR: refTarget },
    resellers: { closedADV: resClosedADV, closedMRR: resClosedMRR, targetMRR: resTarget },
    agencies: { closedADV: agClosedADV, closedMRR: agClosedMRR, targetMRR: agTarget },
  };
}

function parsePartnerSheet(rows, nameLabel) {
  console.log(`=== parsePartnerSheet for ${nameLabel} ===`);
  console.log("Looking for header with label:", nameLabel);
  console.log("All row[1] values:", rows.map(r => r[1]).slice(0, 15));

  // Find the header row (contains "Based In" and month columns)
  const headerIdx = rows.findIndex((r) => r[1] && r[1].trim() === nameLabel);
  console.log("headerIdx found:", headerIdx);

  if (headerIdx < 0) {
    console.warn(`Could not find header row with label "${nameLabel}"`);
    return [];
  }

  // Find the "No Agreement" section to know where active partners end
  const noAgreementIdx = rows.findIndex((r, i) => i > headerIdx && r[1] && r[1].trim() === "No Agreement");
  const endIdx = noAgreementIdx > 0 ? noAgreementIdx : rows.length;
  console.log("Parsing partners from row", headerIdx + 1, "to", endIdx);

  const partners = [];
  for (let i = headerIdx + 1; i < endIdx; i++) {
    const r = rows[i];
    const name = r[1] ? r[1].trim() : "";
    if (!name || name === "" || name === "No Agreement") continue;

    const country = r[2] ? r[2].trim() : "";
    const commission = r[4] ? r[4].trim() : "";
    const closedADVUntil2025 = num(r[8]);
    const mrrAvg = num(r[10]);

    // Monthly ADV values are in columns 11-22 (index 11 to 22)
    const mrr2026 = Array.from({ length: 12 }, (_, m) => {
      const val = num(r[m + 11]);
      return val;
    });

    const adv2026 = mrr2026.reduce((a, b) => a + b, 0) * 12; // rough estimate

    const partner = {
      name,
      country,
      adv: closedADVUntil2025,
      mrrAvg,
      adv2026: mrr2026.reduce((a, b) => a + b, 0) > 0 ? 1 : 0, // flag for activity
      mrr2026,
      commission: commission.length > 40 ? commission.substring(0, 40) + "..." : commission,
      start: r[6] ? r[6].trim().substring(0, 7) : "-",
    };

    if (partners.length < 3) {
      console.log(`Sample partner ${partners.length + 1}:`, partner);
      console.log(`Raw row data:`, r.slice(0, 15));
    }

    partners.push(partner);
  }

  console.log(`Total ${nameLabel} partners parsed:`, partners.length);
  return partners;
}

export async function fetchAllData() {
  const [perfText, refText, resText, agText] = await Promise.all([
    fetch(SHEET_URLS.performance).then((r) => r.text()),
    fetch(SHEET_URLS.referrals).then((r) => r.text()),
    fetch(SHEET_URLS.resellers).then((r) => r.text()),
    fetch(SHEET_URLS.agencies).then((r) => r.text()),
  ]);

  console.log("=== RAW CSV TEXT ===");
  console.log("Performance (first 500 chars):", perfText.substring(0, 500));
  console.log("Referrals (first 500 chars):", refText.substring(0, 500));

  const perfRows = parseCSV(perfText);
  const refRows = parseCSV(refText);
  const resRows = parseCSV(resText);
  const agRows = parseCSV(agText);

  console.log("=== PARSED ROWS ===");
  console.log("Performance rows (first 10):", perfRows.slice(0, 10));
  console.log("Referrals rows (first 10):", refRows.slice(0, 10));
  console.log("Resellers rows (first 5):", resRows.slice(0, 5));
  console.log("Agencies rows (first 5):", agRows.slice(0, 5));

  const perf = parsePerformance(perfRows);

  console.log("=== PARSED PERF ===");
  console.log("perf:", perf);

  const partners = {
    referrals: parsePartnerSheet(refRows, "Referral"),
    resellers: parsePartnerSheet(resRows, "Reseller"),
    agencies: parsePartnerSheet(agRows, "Agency"),
  };

  console.log("=== PARSED PARTNERS ===");
  console.log("referrals:", partners.referrals);
  console.log("resellers:", partners.resellers);
  console.log("agencies:", partners.agencies);

  return { perf, partners };
}
