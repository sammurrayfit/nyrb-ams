// /api/rpm — 3 RPM Testing tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('3 RPM Testing');
    const byPlayer = {};
    rows.forEach(row => {
      const first = (row['GivenName'] || '').trim();
      const last  = (row['FamilyName'] || '').trim();
      if (!first && !last) return;
      const player = `${first} ${last}`.trim();
      const exercise = (row['Exercise'] || '').trim();
      const reps = toNum(row['Reps']);
      const weight = toNum(row['Weight (lbs)']);
      if (!exercise || weight == null) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date: row['Date'] || null,
        exercise,
        reps,
        weight,
        oneRM: reps != null ? +(weight * (1 + reps / 30)).toFixed(1) : weight,
        age: row['Age Group'] || null,
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
function parseD(s){if(s===null||s===undefined||s==='')return 0;if(typeof s==='number')return new Date((s-25569)*86400000);if(s.includes('-'))return new Date(s);const[m,d,y]=s.split('/');if(!y)return 0;return new Date(+y<100?2000+ +y:+y,+m-1,+d);}
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
