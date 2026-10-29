import { useEffect, useState } from "react";

const SITE = "https://www.diriyah.sa";
const MAP: [string, string][] = [
  ["/ar/places-to-go/bujairi-terrace", "/bujairi-terrace"],
  ["/ar/places-to-go/at-turaif", "/at-turaif"],
  ["/ar/things-to-do/sightseeing/salwa-palace", "/salwa-palace"],
  ["/ar/things-to-do/dining", "/dining"],
  ["/ar/things-to-do/shopping", "/shopping"],
  ["/ar/plan-your-visit", "/plan-your-visit"],
];
const CSS = ["/_next/static/css/5fe2cbcabc6d9716.css", "/_next/static/css/9728bf1c1d082e1d.css"];

function fix(html: string) {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/(src|href)="\/_next\//g, '$1="' + SITE + "/_next/")
    .replace(/srcset="([^"]+)"/g, (_m, v: string) =>
      'srcset="' +
      v.split(",").map((s) => {
        const p = s.trim().split(" ");
        p[0] = p[0].startsWith("/") ? SITE + p[0] : p[0];
        return p.join(" ");
      }).join(", ") +
      '"'
    )
    .replace(/(src|href)="\/(?!\/)/g, '$1="' + SITE + "/")
    .replace(/url\(\s*['"]?\//g, "url('" + SITE + "/");
  MAP.forEach(([a, b]) => { out = out.split(SITE + a).join(b); });
  return out;
}

export default function LivePage({ path }: { path: string }) {
  const [html, setHtml] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    CSS.forEach((h) => {
      if (document.getElementById("dl-" + h)) return;
      const l = document.createElement("link");
      l.id = "dl-" + h;
      l.rel = "stylesheet";
      l.href = SITE + h;
      document.head.appendChild(l);
    });
    fetch("/diriyah-live" + path)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => {
        if (!alive) return;
        const bodyTag = t.match(/<body([^>]*)>/i);
        const cls = bodyTag && /class="([^"]*)"/.exec(bodyTag[1]);
        if (cls) document.body.className = cls[1];
        const title = (t.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
        if (title) document.title = title;
        const m = t.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        setHtml(fix(m ? m[1] : t));
        window.scrollTo(0, 0);
      })
      .catch(() => alive && setErr(true));
    return () => { alive = false; };
  }, [path]);

  if (err) return <div style={{ padding: 60, textAlign: "center" }}>تعذّر تحميل الصفحة.</div>;
  if (!html) return <div style={{ minHeight: "70vh", background: "#FAF7F2" }} />;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
