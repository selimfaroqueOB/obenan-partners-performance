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
  // Handle percentage strings like "30%" or "9.0%"
  const isPercent = val.includes("%");
  // Remove quotes, commas, currency symbols, percentage signs, and whitespace
  const cleaned = val.replace(/["'€$£,%\s]/g, "");
  let n = parseFloat(cleaned);
  if (isNaN(n)) return 0;
  // Convert percentage to decimal (30% -> 0.3)
  if (isPercent) n = n / 100;
  return n;
}

function findRow(rows, label) {
  return rows.find((r) => r[1] && r[1].trim().includes(label));
}

function getMonthlyValues(row) {
  if (!row) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return Array.from({ length: 12 }, (_, i) => num(row[i + 2]));
}

function detectCurrentMonth(mrrRow) {
  const values = getMonthlyValues(mrrRow);
  let lastIdx = -1;
  for (let i = 0; i < 12; i++) {
    if (values[i] !== 0) lastIdx = i;
  }
  return Math.max(0, lastIdx);
}

function parsePerformance(rows) {
  const totalClosedARR = getMonthlyValues(findRow(rows, "Total Closed ARR"));
  const totalClosedMRR = getMonthlyValues(findRow(rows, "Total Closed MRR"));
  const totalTargetMRR = getMonthlyValues(findRow(rows, "Total Target MRR"));
  const companyGrowthMRR = getMonthlyValues(findRow(rows, "Company Growth Target MRR"));
  const companyGrowthPct = getMonthlyValues(findRow(rows, "Company Growth Target %"));

  // Referrals
  const refSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Referrals Performance"));
  const refRows = refSection >= 0 ? rows.slice(refSection) : [];
  const refClosedARR = getMonthlyValues(findRow(refRows, "Deals Closed ARR"));
  const refClosedMRR = getMonthlyValues(findRow(refRows, "Deals Closed MRR"));
  const refTarget = getMonthlyValues(findRow(refRows, "Monthly Target"));

  // Resellers
  const resSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Resellers Performance"));
  const resRows = resSection >= 0 ? rows.slice(resSection) : [];
  const resClosedARR = getMonthlyValues(findRow(resRows, "Deals Closed ARR"));
  const resClosedMRR = getMonthlyValues(findRow(resRows, "Deals Closed MRR"));
  const resTarget = getMonthlyValues(findRow(resRows, "Monthly Target"));

  // Agencies
  const agSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Agencies Performance"));
  const agRows = agSection >= 0 ? rows.slice(agSection) : [];
  const agClosedARR = getMonthlyValues(findRow(agRows, "Deals Closed ARR"));
  const agClosedMRR = getMonthlyValues(findRow(agRows, "Deals Closed MRR"));
  const agTarget = getMonthlyValues(findRow(agRows, "Monthly Target"));

  const currentMonthIdx = detectCurrentMonth(findRow(rows, "Total Closed MRR"));

  // Get target percentages and annual values by label matching instead of fixed row indices
  const refPctRow = findRow(rows, "Referrals Growth Target %");
  const refAnnualRow = findRow(rows, "Referrals Growth Target MRR");
  const resPctRow = findRow(rows, "Resellers Growth Target %");
  const resAnnualRow = findRow(rows, "Resellers Growth Target MRR");
  const agPctRow = findRow(rows, "Agencies Growth Target %");
  const agAnnualRow = findRow(rows, "Agencies Growth Target MRR");

  const refTargetPctRaw = refPctRow ? num(refPctRow[14]) : 0.3;
  const refTargetAnnual = refAnnualRow ? num(refAnnualRow[14]) : 0;
  const resTargetPctRaw = resPctRow ? num(resPctRow[14]) : 0.6;
  const resTargetAnnual = resAnnualRow ? num(resAnnualRow[14]) : 0;
  const agTargetPctRaw = agPctRow ? num(agPctRow[14]) : 0.1;
  const agTargetAnnual = agAnnualRow ? num(agAnnualRow[14]) : 0;

  // Debug: log parsed target values
  console.log("=== Target Allocation Debug ===");
  console.log("refPctRow label:", refPctRow?.[1], "col14 raw:", refPctRow?.[14], "parsed:", refTargetPctRaw);
  console.log("resPctRow label:", resPctRow?.[1], "col14 raw:", resPctRow?.[14], "parsed:", resTargetPctRaw);
  console.log("agPctRow label:", agPctRow?.[1], "col14 raw:", agPctRow?.[14], "parsed:", agTargetPctRaw);
  console.log("refAnnualRow label:", refAnnualRow?.[1], "col14 raw:", refAnnualRow?.[14], "parsed:", refTargetAnnual);
  console.log("resAnnualRow label:", resAnnualRow?.[1], "col14 raw:", resAnnualRow?.[14], "parsed:", resTargetAnnual);
  console.log("agAnnualRow label:", agAnnualRow?.[1], "col14 raw:", agAnnualRow?.[14], "parsed:", agTargetAnnual);

  // Normalize percentages excluding Referrals: Resellers/(Resellers+Agencies), Agencies/(Resellers+Agencies)
  const resAgTotal = resTargetPctRaw + agTargetPctRaw;
  const resTargetPct = resAgTotal > 0 ? resTargetPctRaw / resAgTotal : 0.86;
  const agTargetPct = resAgTotal > 0 ? agTargetPctRaw / resAgTotal : 0.14;

  console.log("Normalized (excl referrals): resTargetPct:", resTargetPct, "agTargetPct:", agTargetPct);

  // Total Churn
  const totalChurnSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Total Churn"));
  const totalChurnRows = totalChurnSection >= 0 ? rows.slice(totalChurnSection) : [];
  const totalChurnRow1 = totalChurnRows[1]; // first data row after header
  const totalChurnRow2 = totalChurnRows[2]; // second data row after header
  const totalChurnedARR = getMonthlyValues(totalChurnRow1);
  const totalChurnedMRR = getMonthlyValues(totalChurnRow2);

  console.log("=== Total Churn Debug ===");
  console.log("totalChurnSection index:", totalChurnSection);
  console.log("churn row1 label:", totalChurnRow1?.[1], "values:", totalChurnedARR);
  console.log("churn row2 label:", totalChurnRow2?.[1], "values:", totalChurnedMRR);

  // Total Growth
  const totalGrowthSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Total Growth"));
  const totalGrowthRows = totalGrowthSection >= 0 ? rows.slice(totalGrowthSection) : [];
  const totalGrowthRow1 = totalGrowthRows[1]; // first data row after header
  const totalGrowthRow2 = totalGrowthRows[2]; // second data row after header
  const totalGrowthARR = getMonthlyValues(totalGrowthRow1);
  const totalGrowthMRR = getMonthlyValues(totalGrowthRow2);

  console.log("=== Total Growth Debug ===");
  console.log("totalGrowthSection index:", totalGrowthSection);
  console.log("growth row1 label:", totalGrowthRow1?.[1], "values:", totalGrowthARR);
  console.log("growth row2 label:", totalGrowthRow2?.[1], "values:", totalGrowthMRR);

  return {
    currentMonthIdx,
    totalClosedARR,
    totalClosedMRR,
    totalTargetMRR,
    companyGrowthMRR,
    companyGrowthPct,
    referrals: { closedARR: refClosedARR, closedMRR: refClosedMRR, targetMRR: refTarget },
    resellers: { closedARR: resClosedARR, closedMRR: resClosedMRR, targetMRR: resTarget },
    agencies: { closedARR: agClosedARR, closedMRR: agClosedMRR, targetMRR: agTarget },
    totalChurn: { churnedARR: totalChurnedARR, churnedMRR: totalChurnedMRR },
    totalGrowth: { growthARR: totalGrowthARR, growthMRR: totalGrowthMRR },
    refTargetPct: refTargetPctRaw,
    resTargetPct,
    agTargetPct,
    refTargetAnnual,
    resTargetAnnual,
    agTargetAnnual,
  };
}

function parsePartnerSheet(rows, nameLabel) {
  const headerIdx = rows.findIndex((r) => r[1] && r[1].trim().includes(nameLabel));
  if (headerIdx < 0) return [];

  // Debug: show header row and first data row
  console.log(`=== parsePartnerSheet("${nameLabel}") ===`);
  console.log(`headerIdx=${headerIdx}, row:`, rows[headerIdx]);
  console.log(`headerIdx+1=${headerIdx + 1}, row:`, rows[headerIdx + 1]);

  // Find "No Agreement" row to determine contract status
  const noAgreementIdx = rows.findIndex((r, i) => i > headerIdx && r[1] && r[1].trim().includes("No Agreement"));

  const partners = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const name = r[1] ? r[1].trim() : "";
    const country = r[2] ? r[2].trim() : "";

    // Skip empty rows, header rows, and special rows
    if (!name || name === "") continue;
    if (name.includes("No Agreement")) continue;
    // Skip the header row itself (e.g. "Referral", "Reseller", "Agency")
    if (name === "Referral" || name === "Reseller" || name === "Agency") continue;
    // Skip if country is "Based In" (header row)
    if (country === "Based In") continue;
    // Skip TOTAL rows (column 7 contains "TOTAL")
    if (r[7] && r[7].trim() === "TOTAL") continue;
    const contactPerson = r[3] ? r[3].trim() : "";
    const commissionRaw = r[4] ? r[4].trim() : "";
    const startDate = r[6] ? r[6].trim().substring(0, 7) : "-";
    const closedARRUntil2025 = num(r[8]);
    const mrrAvg = num(r[10]);

    const mrr2026 = Array.from({ length: 12 }, (_, m) => num(r[m + 11]));

    // Contract status: "V" if before "No Agreement", "X" if after
    const hasContract = noAgreementIdx < 0 || i < noAgreementIdx;

    partners.push({
      name,
      country,
      contactPerson,
      commission: commissionRaw.length > 120 ? commissionRaw.substring(0, 120) + "..." : commissionRaw,
      start: startDate,
      arr: closedARRUntil2025,
      mrrAvg,
      arr2026: mrr2026.reduce((a, b) => a + b, 0) > 0 ? 1 : 0,
      mrr2026,
      contract: hasContract ? "V" : "X",
    });
  }
  return partners;
}

export async function fetchAllData() {
  const [perfText, refText, resText, agText] = await Promise.all([
    fetch(SHEET_URLS.performance).then((r) => r.text()),
    fetch(SHEET_URLS.referrals).then((r) => r.text()),
    fetch(SHEET_URLS.resellers).then((r) => r.text()),
    fetch(SHEET_URLS.agencies).then((r) => r.text()),
  ]);

  const perfRows = parseCSV(perfText);
  const refRows = parseCSV(refText);
  const resRows = parseCSV(resText);
  const agRows = parseCSV(agText);

  const perf = parsePerformance(perfRows);

  const partners = {
    referrals: parsePartnerSheet(refRows, "Referral"),
    resellers: parsePartnerSheet(resRows, "Reseller"),
    agencies: parsePartnerSheet(agRows, "Agency"),
  };

  return { perf, partners };
}
