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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const orderId = req.query?.orderId;
  if (!orderId) {
    res.status(400).json({ error: "Missing orderId" });
    return;
  }

  try {
    const token = await getAccessToken();
    const { pgBaseUrl } = getPhonePeConfig();

    const statusRes = await fetch(
      `${pgBaseUrl}/checkout/v2/order/${encodeURIComponent(orderId)}/status`,
      {
        method: "GET",
        headers: {
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    const statusData = await statusRes.json().catch(() => ({}));
    if (!statusRes.ok) {
      res.status(statusRes.status || 500).json(statusData || { message: "PhonePe status fetch failed" });
      return;
    }

    res.status(200).json(statusData);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message || "Internal server error" });
  }
}
