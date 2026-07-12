// /api/phv — PHV sheet
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('PHV');
    const byPlayer = {};
    rows.forEach(row => {
      const player = row['Name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:        row['Date']                || null,
        team:        row['Team']                || null,
        dob:         row['DOB']                 || null,
        ageAtTest:   toNum(row['Age at Test']),
        bioAge:      toNum(row['Biological Age']),
        weight:      toNum(row['Weight (lb)']),
        weightChg:   toNum(row['Weight Change']),
        height:      toInches(row['Standing Height (in)']),
        heightChg:   toNum(row['Height Change']),
        adultHeight: toInches(row['Adult Height (in)']),
        phv:         toNum(row['PHV']),
        growthPct:   toNum(row['Growth %']),
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => parseD(a.date) - parseD(b.date));
    });
    res.status(200).json(byPlayer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
function parseD(s) {
  if (!s) return 0;
  if (typeof s === 'number') return new Date((s - 25569) * 86400000);
  if (s.includes('-')) return new Date(s);
  const [m, d, y] = s.split('/');
  if (!y) return 0;
  return new Date(+y < 100 ? 2000 + +y : +y, +m - 1, +d);
}
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
// Sheet stores height as feet+inches text, e.g. 5' 5.9" — parseFloat alone
// truncates at the apostrophe and silently drops the inches, rounding every
// height down to the nearest foot. Parse both parts and return total inches.
function toInches(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).trim();
  const m = s.match(/(\d+)\s*'\s*([\d.]+)/);
  if (m) return +(parseFloat(m[1]) * 12 + parseFloat(m[2])).toFixed(1);
  return toNum(v);
}
