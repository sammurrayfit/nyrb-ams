// /api/mas — MAS_Testing tab
const { fetchSheet } = require('./_sheet');

function parseD(s){if(s===null||s===undefined||s==='')return 0;if(typeof s==='number')return new Date((s-25569)*86400000);if(s.includes('-'))return new Date(s);const[m,d,y]=s.split('/');if(!y)return 0;return new Date(+y<100?2000+ +y:+y,+m-1,+d);}
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('MAS_Testing');
    const byPlayer = {};
    rows.forEach(row => {
      const player = `${row['GivenName'] || ''} ${row['FamilyName'] || ''}`.trim();
      if (!player) return;
      const mas = toNum(row['M.A.S']);
      if (mas === null) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:     row['Date'] || null,
        age:      row['Age Group'] || null,
        distance: toNum(row['Overall Distance']),
        time:     toNum(row['Time (s)']),
        mas,
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => parseD(a.date) - parseD(b.date));
    });
    res.status(200).json(byPlayer);
  } catch (err) {
    console.error('[MAS] error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
