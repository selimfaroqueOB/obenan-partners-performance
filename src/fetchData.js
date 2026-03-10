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
  leadGenerators: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS44A9WaJHn9l_I9CDTcLnFgRD5oRjtKW90L8y3q-fc1PI4qC-FcSIftjkKW0vk77W_CnB51k2CcGFH/pub?gid=0&single=true&output=csv",
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

  // Lead Generators
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

  // Normalize percentages excluding Lead Generators: Resellers/(Resellers+Agencies), Agencies/(Resellers+Agencies)
  const resAgTotal = resTargetPctRaw + agTargetPctRaw;
  const resTargetPct = resAgTotal > 0 ? resTargetPctRaw / resAgTotal : 0.86;
  const agTargetPct = resAgTotal > 0 ? agTargetPctRaw / resAgTotal : 0.14;

  // Total Churn
  const totalChurnSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Total Churn"));
  const totalChurnSlice = totalChurnSection >= 0 ? rows.slice(totalChurnSection) : [];
  const totalChurnedARR = getMonthlyValues(findRow(totalChurnSlice, "Churned ARR"));
  const totalChurnedMRR = getMonthlyValues(findRow(totalChurnSlice, "Churned MRR"));

  // Total Net Growth
  const totalGrowthSection = rows.findIndex((r) => r[1] && r[1].trim().includes("Total Net Growth"));
  const totalGrowthSlice = totalGrowthSection >= 0 ? rows.slice(totalGrowthSection) : [];
  const totalGrowthARR = getMonthlyValues(findRow(totalGrowthSlice, "Growth ARR"));
  const totalGrowthMRR = getMonthlyValues(findRow(totalGrowthSlice, "Growth MRR"));

  console.log("totalGrowth.growthMRR:", totalGrowthMRR);

  return {
    currentMonthIdx,
    totalClosedARR,
    totalClosedMRR,
    totalTargetMRR,
    companyGrowthMRR,
    companyGrowthPct,
    leadGenerators: { closedARR: refClosedARR, closedMRR: refClosedMRR, targetMRR: refTarget },
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
  // Find the true column header row: contains the label in col 1 AND "2026-1" somewhere
  let headerIdx = rows.findIndex(
    (r) =>
      r[1] && r[1].trim() === nameLabel &&
      r.some((cell) => cell && cell.trim() === "2026-1")
  );
  // Fallback: row where col 1 equals the label and contains "Based In"
  if (headerIdx < 0) {
    headerIdx = rows.findIndex(
      (r) =>
        r[1] && r[1].trim() === nameLabel &&
        r.some((cell) => cell && cell.trim() === "Based In")
    );
  }
  if (headerIdx < 0) return [];

  const headerRow = rows[headerIdx];

  // Dynamically find where "2026-1" starts in the header row
  const monthOffset = headerRow.findIndex((cell) => cell && cell.trim() === "2026-1");
  if (monthOffset < 0) return [];

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
    if (name === "Referral" || name === "Reseller" || name === "Agency") continue;
    if (country === "Based In") continue;
    if (r[7] && r[7].trim() === "TOTAL") continue;

    const contactPerson = r[3] ? r[3].trim() : "";
    const commissionRaw = r[5] ? r[5].trim() : "";
    const startDate = r[7] ? r[7].trim().substring(0, 7) : "-";
    const closedARRUntil2025 = num(r[9]);
    const mrrAvg = num(r[11]);

    const mrr2026 = Array.from({ length: 12 }, (_, m) => num(r[m + monthOffset]));

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
    fetch(SHEET_URLS.leadGenerators).then((r) => r.text()),
    fetch(SHEET_URLS.resellers).then((r) => r.text()),
    fetch(SHEET_URLS.agencies).then((r) => r.text()),
  ]);

  const perfRows = parseCSV(perfText);
  const refRows = parseCSV(refText);
  const resRows = parseCSV(resText);
  const agRows = parseCSV(agText);

  const perf = parsePerformance(perfRows);

  const partners = {
    leadGenerators: parsePartnerSheet(refRows, "Referral"),
    resellers: parsePartnerSheet(resRows, "Reseller"),
    agencies: parsePartnerSheet(agRows, "Agency"),
  };

  return { perf, partners };
}
