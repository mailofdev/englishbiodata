function getPhonePeConfig() {
  const phonepeBaseUrl =
    process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
  const isPreprod = phonepeBaseUrl.includes("api-preprod.phonepe.com");
  const oauthBaseUrl = process.env.PHONEPE_OAUTH_BASE_URL
    || (isPreprod ? phonepeBaseUrl : phonepeBaseUrl.replace(/\/pg$/, "/identity-manager"));
  const pgBaseUrl = process.env.PHONEPE_PG_BASE_URL || phonepeBaseUrl;
  return { oauthBaseUrl, pgBaseUrl };
}

async function getAccessToken() {
  const { oauthBaseUrl } = getPhonePeConfig();
  const body = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID || "",
    client_secret: process.env.PHONEPE_CLIENT_SECRET || "",
    client_version: process.env.PHONEPE_CLIENT_VERSION || "1",
    grant_type: "client_credentials",
  });

  const tokenRes = await fetch(`${oauthBaseUrl}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData?.access_token) {
    const err = new Error(tokenData?.message || "Unable to get PhonePe access token");
    err.status = tokenRes.status || 500;
    err.payload = tokenData;
    throw err;
  }
  return tokenData.access_token;
}

function getPublicSiteOrigin() {
  const explicit = (process.env.PUBLIC_SITE_URL || process.env.REACT_APP_PUBLIC_SITE_URL || "").trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3003";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 1) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    const token = await getAccessToken();
    const { pgBaseUrl } = getPhonePeConfig();
    const orderId = `ORDER_${Date.now()}`;

    const redirectPath = process.env.PHONEPE_REDIRECT_PATH || "/preview";
    const redirectBase = `${getPublicSiteOrigin()}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`;
    const redirectUrl = `${redirectBase}${redirectBase.includes("?") ? "&" : "?"}merchantOrderId=${encodeURIComponent(orderId)}`;

    const paymentRes = await fetch(`${pgBaseUrl}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        Authorization: `O-Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchantOrderId: orderId,
        amount: Math.round(amount * 100),
        paymentFlow: {
          type: "PG_CHECKOUT",
          merchantUrls: { redirectUrl },
        },
      }),
    });

    const paymentData = await paymentRes.json().catch(() => ({}));
    if (!paymentRes.ok) {
      res.status(paymentRes.status || 500).json(paymentData || { message: "PhonePe create-payment failed" });
      return;
    }

    res.status(200).json({
      ...paymentData,
      orderId,
    });
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message || "Internal server error" });
  }
}
