// /api/medical — Quarterly Medical Checks tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Quarterly Medical Checks');
    const byPlayer = {};
    rows.forEach(row => {
      const get = (key) => { const k = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase()); return k ? row[k] : undefined; };
      const player = get('name');
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:       get('date') || null,
        team:       get('team') || null,
        lDorsi:     toNum(get("l cc dorsiflexion")),
        rDorsi:     toNum(get("r cc dorsiflexion")),
        lHam:       toNum(get("l hamstring 90/90")),
        rHam:       toNum(get("r hamstring 90/90")),
        lGroin:     toNum(get("l groin rom")),
        rGroin:     toNum(get("r groin rom")),
        lIR:        toNum(get("l ir rom")),
        rIR:        toNum(get("r ir rom")),
        lQuad:      toNum(get("l quad ely's")),
        rQuad:      toNum(get("r quad ely's")),
        notes:      get('addl notes') || null,
        nordic:     get('nordic findings') || null,
        ffHipAdd:   get('ff hip add findings') || null,
        ffHipAbd:   get('ff hip abd findings') || null,
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => parseD(a.date) - parseD(b.date));
    });
    res.status(200).json(byPlayer);
  } catch (err) {
    console.error('[Medical] error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
function parseD(s){if(s===null||s===undefined||s==='')return 0;if(typeof s==='number')return new Date((s-25569)*86400000);if(s.includes('-'))return new Date(s);const[m,d,y]=s.split('/');if(!y)return 0;return new Date(+y<100?2000+ +y:+y,+m-1,+d);}
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}
