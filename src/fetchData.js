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

  // Get target percentages and annual values from column 14 (Total/Average)
  // Rows are at fixed positions: 19=RefPct, 20=RefMRR, 21=ResPct, 22=ResMRR, 23=AgPct, 24=AgMRR
  const refTargetPct = rows[19] ? num(rows[19][14]) : 0.3;
  const refTargetAnnual = rows[20] ? num(rows[20][14]) : 0;
  const resTargetPct = rows[21] ? num(rows[21][14]) : 0.6;
  const resTargetAnnual = rows[22] ? num(rows[22][14]) : 0;
  const agTargetPct = rows[23] ? num(rows[23][14]) : 0.1;
  const agTargetAnnual = rows[24] ? num(rows[24][14]) : 0;

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
    refTargetPct,
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

  // Find "No Agreement" row to determine contract status
  const noAgreementIdx = rows.findIndex((r, i) => i > headerIdx && r[1] && r[1].trim().includes("No Agreement"));

  const partners = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const name = r[1] ? r[1].trim() : "";

    // Skip empty rows and the "No Agreement" header row itself
    if (!name || name === "" || name.includes("No Agreement")) continue;

    const country = r[2] ? r[2].trim() : "";
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
      commission: commissionRaw.length > 60 ? commissionRaw.substring(0, 60) + "..." : commissionRaw,
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
