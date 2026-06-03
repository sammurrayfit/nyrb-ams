// /api/broad — Broad_Jump tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Broad_Jump');
    const byPlayer = {};
    rows.forEach(row => {
      const first = (row['GivenName'] || '').trim();
      const last  = (row['FamilyName'] || '').trim();
      if (!first && !last) return;
      const player = `${first} ${last}`.trim();
      const dist = parseFloat(row['Distance (cm)']);
      if (isNaN(dist)) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date: row['Date'] || null,
        dist: dist,
        age:  row['Age Group'] || row['Age'] || null,
      });
    });
    // Sort each player's records by date
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
