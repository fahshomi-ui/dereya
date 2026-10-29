export const handler = async (event) => {
  const p = (event.queryStringParameters && event.queryStringParameters.p) || "";
  if (!/^\/ar\//.test(p)) {
    return { statusCode: 400, headers: { "access-control-allow-origin": "*" }, body: "bad path" };
  }
  try {
    const r = await fetch("https://www.diriyah.sa" + p, { headers: { "user-agent": "Mozilla/5.0" } });
    let t = await r.text();
    t = t.replace(/<head([^>]*)>/i, '<head$1><base href="https://www.diriyah.sa/">');
    return {
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
      body: t,
    };
  } catch (e) {
    return { statusCode: 502, headers: { "access-control-allow-origin": "*" }, body: String(e) };
  }
};
