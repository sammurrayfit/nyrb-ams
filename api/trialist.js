// /api/trialist — Trialist CMJ and Trialist Movement Screen tabs
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const [cmjRows, msRows] = await Promise.all([
      fetchSheet('Trialist CMJ'),
      fetchSheet('Trialist Movement Screen'),
    ]);

    const cmj = {};
    cmjRows.forEach(row => {
      const player = row['Name'];
      if (!player) return;
      if (!cmj[player]) cmj[player] = [];
      cmj[player].push({
        date:   row['Date']   || null,
        height: toNum(row['Jump Height (Imp-Mom) [cm]']),
        age:    row['Age Group'] || null,
      });
    });
    Object.keys(cmj).forEach(p => {
      cmj[p].sort((a, b) => (a.date||'').localeCompare(b.date||''));
    });

    const movement = {};
    msRows.forEach(row => {
      const player = row['Player'];
      if (!player) return;
      if (!movement[player]) movement[player] = [];
      movement[player].push({
        date:       row['Date'] || null,
        age:        row['Age Group'] || null,
        team:       row['Team'] || null,
        squat:      toNum(row['Squat']),
        hinge:      toNum(row['Hinge hands on hips']),
        splitSquat: toNum(row['Split Squats']),
        pushups:    toNum(row['Pushups']),
      });
    });
    Object.keys(movement).forEach(p => {
      movement[p].sort((a, b) => (a.date||'').localeCompare(b.date||''));
    });

    res.status(200).json({ cmj, movement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
