// Beach data for Mallorca.
// Static baseline is bundled in beaches-data.js (generated 2026-10-16).
// Overpass is only called by the update script (npm run update-beaches).

let beaches = [];

async function loadBeaches() {
  beaches = BEACHES_STATIC.slice();
  return beaches;
}
