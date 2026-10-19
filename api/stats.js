// Vercel serverless function: adds up visits and live players for the 4 games.
const PLACES = [2882332175, 88870933270715, 86940734062777, 118242570944999];

module.exports = async (req, res) => {
  try {
    const universeIds = await Promise.all(
      PLACES.map(async (placeId) => {
        const r = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        if (!r.ok) throw new Error('universe lookup failed');
        return (await r.json()).universeId;
      })
    );
    const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`);
    if (!r.ok) throw new Error('games lookup failed');
    const { data } = await r.json();
    const visits = data.reduce((s, g) => s + (g.visits || 0), 0);
    const playing = data.reduce((s, g) => s + (g.playing || 0), 0);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ visits, playing });
  } catch (e) {
    res.status(502).json({ error: 'Could not load Roblox stats' });
  }
};
