// Shared utility: fetches a Google Sheet tab as CSV and parses to JSON
// Usage: const rows = await fetchSheet('TabName');

const SHEET_ID = process.env.SHEET_ID || '1dKhc7TtQuDjQjNpcJGg7EjGqK_AsnvNMwbPB3D4wYHw';

async function fetchSheet(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet "${tabName}": ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return parseCSV(text);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      let val = (values[idx] || '').trim().replace(/^"|"$/g, '');
      // Auto-convert numbers
      if (val !== '' && !isNaN(val) && val !== ' ') {
        val = parseFloat(val);
      }
      // Blank stays null
      if (val === '') val = null;
      row[h] = val;
    });
    // Skip completely empty rows
    const hasData = Object.values(row).some(v => v !== null && v !== '');
    if (hasData) rows.push(row);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

module.exports = { fetchSheet };
