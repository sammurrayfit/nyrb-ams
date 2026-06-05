// /api/movement — Movement_Screen tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Movement_Screen');
    const byPlayer = {};
    rows.forEach(row => {
      const get = (key) => { const k = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase()); return k ? row[k] : undefined; };
      const player = `${get('givenname') || ''} ${get('familyname') || ''}`.trim();
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:       get('date') || null,
        age:        get('age group') || null,
        squat:      toNum(get('squat')),
        hinge:      toNum(get('hinge hands on hips')),
        splitSquat: toNum(get('split squat')),
        pushups:    toNum(get('pushups')),
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
