const claimedBySport = {};

export function claimedList(sport) {
  if (!claimedBySport[sport]) {
    claimedBySport[sport] = { rows: [], json: '', loaded: false, failed: false };
  }
  return claimedBySport[sport];
}

export function setClaimedRows(sport, rows) {
  const list = claimedList(sport);
  const json = JSON.stringify(rows);
  list.loaded = true;
  list.failed = false;
  if (json === list.json) return false;
  list.rows = rows;
  list.json = json;
  return true;
}

export function addClaimedRow(sport, row) {
  if (isClaimed(sport, row.number, row.gender)) return;
  const list = claimedList(sport);
  list.rows.push(row);
  list.json = JSON.stringify(list.rows);
}

export function isClaimed(sport, number, gender) {
  return claimedList(sport).rows.some(row => row.number === number && row.gender === gender);
}
