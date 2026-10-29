exports.handler = async (event) => {
  const p = (event.queryStringParameters && event.queryStringParameters.p) || "";
  if (!/^\/ar\//.test(p)) return { statusCode: 400, headers: { "access-control-allow-origin": "*" }, body: "bad path" };
  try {
    const r = await fetch("https://www.diriyah.sa" + p, { headers: { "user-agent": "Mozilla/5.0" } });
    const t = await r.text();
    return { statusCode: 200, headers: { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "no-store" }, body: t };
  } catch (e) {
    return { statusCode: 502, headers: { "access-control-allow-origin": "*" }, body: String(e) };
  }
};
