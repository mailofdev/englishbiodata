/**
 * Local dev server for /api/kundli-match (Step 8 + Step 9 cache).
 * Step 9: In-memory cache — same couple = no upstream API call.
 * Load .env from project root so ASTROLOGY_API_KEY is available.
 */
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}
const express = require('express');
const bodyParser = require('body-parser');

const KUNDLI_MATCH_URL =
  process.env.ASTROLOGY_KUNDLI_MATCH_URL ||
  'https://api.astrology-api.io/api/v3/vedic/kundli-matching';
const PORT = process.env.DEV_API_PORT || 3001;
const CACHE_TTL_MS = 60 * 60 * 1000;
const kundliCache = new Map();
function kundliCacheKey(payload) {
  const g = payload?.groom?.birth_data;
  const b = payload?.bride?.birth_data;
  if (!g || !b) return null;
  return JSON.stringify({
    g: { y: g.year, m: g.month, d: g.day, h: g.hour, min: g.minute, c: g.city, cc: g.country_code },
    b: { y: b.year, m: b.month, d: b.day, h: b.hour, min: b.minute, c: b.city, cc: b.country_code },
    inc: payload?.include_manglik,
  });
}
function getKundliCached(key) {
  const e = kundliCache.get(key);
  if (!e || Date.now() > e.exp) {
    if (e) kundliCache.delete(key);
    return null;
  }
  return e.data;
}
function setKundliCached(key, data) {
  kundliCache.set(key, { data, exp: Date.now() + CACHE_TTL_MS });
  if (kundliCache.size > 500) {
    const first = kundliCache.keys().next().value;
    if (first != null) kundliCache.delete(first);
  }
}

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return { year, month, day };
}
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}
function toShortCityName(cityStr) {
  if (!cityStr || typeof cityStr !== 'string') return 'Mumbai';
  const first = cityStr.trim().split(',')[0].trim();
  return first || 'Mumbai';
}
function toPerson(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const date = entry.date || null;
  const time = entry.time || null;
  if (!date || !time) return null;
  const parsedDate = parseDate(date);
  const parsedTime = parseTime(time);
  if (!parsedDate || !parsedTime) return null;
  const city = toShortCityName(entry.city);
  const country_code = entry.country_code && String(entry.country_code).trim() ? String(entry.country_code).trim() : 'IN';
  return { name: entry.name || 'Groom', ...parsedDate, ...parsedTime, city, country_code };
}
function fromMaleFemale(male, female) {
  return {
    groom: { name: male.name || 'Groom', birth_data: { year: male.year, month: male.month, day: male.day, hour: male.hour, minute: male.minute, city: male.city, country_code: male.country_code } },
    bride: { name: female.name || 'Bride', birth_data: { year: female.year, month: female.month, day: female.day, hour: female.hour, minute: female.minute, city: female.city, country_code: female.country_code } },
    options: { ayanamsa: 'lahiri' },
    include_manglik: true,
  };
}
function hasValidBirthData(bd) {
  if (!bd || typeof bd !== 'object') return false;
  const y = Number(bd.year), mo = Number(bd.month), d = Number(bd.day), h = Number(bd.hour), min = Number(bd.minute);
  return !Number.isNaN(y) && !Number.isNaN(mo) && !Number.isNaN(d) && !Number.isNaN(h) && !Number.isNaN(min);
}

const app = express();
app.use(bodyParser.json());

app.get('/api/kundli-match', (req, res) => {
  res.json({ ok: true, message: 'Kundli Match proxy running. POST with groom/bride (birth_data) or male/female (date, time, city, country_code).' });
});

app.post('/api/kundli-match', async (req, res) => {
  const body = req.body || {};
  let apiPayload;

  let male = toPerson(body.male);
  let female = toPerson(body.female);
  if (body.male && !male) male = toPerson({ ...body.male, city: body.male.city || 'Mumbai', country_code: body.male.country_code || 'IN' });
  if (body.female && !female) female = toPerson({ ...body.female, city: body.female.city || 'Mumbai', country_code: body.female.country_code || 'IN' });

  if (male && female) {
    apiPayload = fromMaleFemale(male, female);
    apiPayload.options = body.options?.ayanamsa ? { ayanamsa: body.options.ayanamsa } : { ayanamsa: 'lahiri' };
    apiPayload.include_manglik = typeof body.include_manglik === 'boolean' ? body.include_manglik : true;
  } else if (body.groom?.birth_data && body.bride?.birth_data) {
    const g = body.groom.birth_data;
    const b = body.bride.birth_data;
    if (!hasValidBirthData(g) || !hasValidBirthData(b)) {
      return res.status(400).json({ error: 'Invalid birth data. Each person must have year, month, day, hour, and minute.' });
    }
    apiPayload = {
      groom: { name: body.groom.name || 'Groom', birth_data: { year: Number(g.year), month: Number(g.month), day: Number(g.day), hour: Number(g.hour), minute: Number(g.minute), city: String(g.city || 'Mumbai').trim(), country_code: String(g.country_code || 'IN').trim() } },
      bride: { name: body.bride.name || 'Bride', birth_data: { year: Number(b.year), month: Number(b.month), day: Number(b.day), hour: Number(b.hour), minute: Number(b.minute), city: String(b.city || 'Mumbai').trim(), country_code: String(b.country_code || 'IN').trim() } },
      options: body.options?.ayanamsa ? { ayanamsa: body.options.ayanamsa } : { ayanamsa: 'lahiri' },
      include_manglik: typeof body.include_manglik === 'boolean' ? body.include_manglik : true,
    };
  } else {
    return res.status(400).json({ error: 'Invalid request. Provide birth date and time for both persons (date as YYYY-MM-DD, time as HH:mm).' });
  }

  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Service is not configured. Please try again later.' });
  }

  const key = kundliCacheKey(apiPayload);
  if (key) {
    const cached = getKundliCached(key);
    if (cached) {
      res.setHeader('X-Kundli-Cache', 'HIT');
      return res.status(200).json(cached);
    }
  }

  try {
    const response = await fetch(KUNDLI_MATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(apiPayload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = typeof data?.error === 'string' ? data.error : typeof data?.message === 'string' ? data.message : (Array.isArray(data?.detail) ? 'Invalid birth data or request.' : 'Match service returned an error. Please try again.');
      return res.status(response.status).json({
        error: msg,
        detail: data?.detail ?? data?.message ?? data?.error,
        upstreamStatus: response.status,
        ...data,
      });
    }
    if (key) setKundliCached(key, data);
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({
      error: 'Unable to reach match service. Please try again later.',
      ...(process.env.NODE_ENV !== 'production' && err?.message ? { message: err.message } : {}),
    });
  }
});

app.listen(PORT, () => {
  console.log(`API proxy running at http://localhost:${PORT}`);
  console.log('  GET/POST /api/kundli-match (set ASTROLOGY_API_KEY in .env)');
});
