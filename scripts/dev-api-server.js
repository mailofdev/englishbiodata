/**
 * DEV API SERVER (FIXED VERSION)
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// ✅ Load .env manually
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m)
        process.env[m[1].trim()] = m[2]
          .trim()
          .replace(/^["']|["']$/g, "");
    });
}

// ✅ Create app FIRST
const app = express();

// ✅ Middleware AFTER app
app.use(cors());
app.use(bodyParser.json());

// =========================
// CONFIG
// =========================

const PORT = process.env.DEV_API_PORT || 3001;

const KUNDLI_MATCH_URL =
  process.env.ASTROLOGY_KUNDLI_MATCH_URL ||
  "https://api.astrology-api.io/api/v3/vedic/kundli-matching";
const PHONEPE_BASE_URL =
  process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const isPhonePePreprod = PHONEPE_BASE_URL.includes("api-preprod.phonepe.com");
const derivedOauthBaseUrl = isPhonePePreprod
  ? PHONEPE_BASE_URL
  : PHONEPE_BASE_URL.replace(/\/pg$/, "/identity-manager");
const PHONEPE_OAUTH_BASE_URL =
  process.env.PHONEPE_OAUTH_BASE_URL || derivedOauthBaseUrl;
const PHONEPE_PG_BASE_URL =
  process.env.PHONEPE_PG_BASE_URL || PHONEPE_BASE_URL;

// =========================
// KUNDLI CACHE (same as yours)
// =========================

const CACHE_TTL_MS = 60 * 60 * 1000;
const kundliCache = new Map();

// (keeping your cache logic unchanged)
function kundliCacheKey(payload) {
  const g = payload?.groom?.birth_data;
  const b = payload?.bride?.birth_data;
  if (!g || !b) return null;
  return JSON.stringify({ g, b, inc: payload?.include_manglik });
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
}

// =========================
// KUNDLI API (FIXED axios)
// =========================

app.post("/api/kundli-match", async (req, res) => {
  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "API key missing" });
  }

  const payload = req.body;
  const key = kundliCacheKey(payload);

  if (key) {
    const cached = getKundliCached(key);
    if (cached) return res.json(cached);
  }

  try {
    const response = await axios.post(KUNDLI_MATCH_URL, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (key) setKundliCached(key, response.data);

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

// =========================
// PHONEPE APIs
// =========================

async function getPhonePeAccessToken() {
  const tokenPayload = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID,
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    client_version: process.env.PHONEPE_CLIENT_VERSION || "1",
    grant_type: "client_credentials",
  });

  const tokenRes = await axios.post(
    `${PHONEPE_OAUTH_BASE_URL}/v1/oauth/token`,
    tokenPayload.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return tokenRes.data?.access_token;
}

function sendUpstreamError(res, err) {
  const status = err.response?.status || 500;
  return res.status(status).json(err.response?.data || { message: err.message });
}

// 🔐 Token
app.get("/api/phonepe/token", async (req, res) => {
  try {
    const accessToken = await getPhonePeAccessToken();

    res.json({ access_token: accessToken });
  } catch (err) {
    return sendUpstreamError(res, err);
  }
});

// 💳 Create Payment
app.post("/api/phonepe/create-payment", async (req, res) => {
  try {
    const { amount } = req.body;

    // ✅ Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Step 1: Token
    const token = await getPhonePeAccessToken();

    const orderId = "ORDER_" + Date.now();

    // Step 2: Create order
    const redirectBase = `http://localhost:3003${process.env.PHONEPE_REDIRECT_PATH}`;
    const redirectUrlWithOrderId = `${redirectBase}${
      redirectBase.includes("?") ? "&" : "?"
    }merchantOrderId=${encodeURIComponent(orderId)}`;

    const orderPayload = {
      merchantOrderId: orderId,
      amount: amount * 100,
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: redirectUrlWithOrderId,
        },
      },
    };

    const paymentRes = await axios.post(
      `${PHONEPE_PG_BASE_URL}/checkout/v2/pay`,
      orderPayload,
      {
        headers: {
          Authorization: `O-Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      ...paymentRes.data,
      orderId, // send to frontend
    });
  } catch (err) {
    return sendUpstreamError(res, err);
  }
});

// 🔁 Status
app.get("/api/phonepe/status/:orderId", async (req, res) => {
  try {
    const token = await getPhonePeAccessToken();

    const statusRes = await axios.get(
      `${PHONEPE_PG_BASE_URL}/checkout/v2/order/${req.params.orderId}/status`,
      {
        headers: {
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    res.json(statusRes.data);
  } catch (err) {
    return sendUpstreamError(res, err);
  }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});