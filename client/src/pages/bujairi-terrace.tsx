import { useEffect, useRef, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap');
.bt-page{--primary:#7A4A30;--primary-dark:#5C3623;--primary-light:#9A6A48;--primary-lighter:#E9DCD0;--tan:#C79667;--tan-light:#DDB595;--tan-lighter:#EBD7C4;--tan-lightest:#F5EBE1;--date:#4A3F7A;--date-light:#6A5FA0;--ethel:#241610;--cream:#FAF7F2;--bg:#FFFFFF;--msayyan:#7A4A30;--msayyan-lightest:#F2E4D8;
  background:var(--cream);color:var(--ethel);direction:rtl;font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;overflow-x:hidden}
.bt-page *{box-sizing:border-box}
.bt-page img{display:block;max-width:100%}
.bt-page h1,.bt-page h2,.bt-page h3,.bt-page h4,.bt-page p,.bt-page ul,.bt-page li,.bt-page figure{margin:0;padding:0;list-style:none}
.bt-page a{color:inherit;text-decoration:none}
.bt-wrap{max-width:1512px;margin:0 auto}
.bt-sec{padding:56px 24px}
@media(min-width:768px){.bt-sec{padding:56px 48px}}
@media(min-width:1024px){.bt-sec{padding:56px 56px}}
@media(min-width:1280px){.bt-sec{padding:56px 64px}}
@media(min-width:1536px){.bt-sec{padding:56px 76px}}
.bt-texture{background-image:radial-gradient(circle at 20% 30%,rgba(199,150,103,.06) 0 1px,transparent 1px);background-size:22px 22px}
.bt-h2{font-family:Amiri,serif;font-weight:700;font-size:clamp(30px,4.4vw,52px);line-height:1.3;color:var(--ethel)}
.bt-h3{font-family:Amiri,serif;font-weight:700;font-size:clamp(20px,2.4vw,26px);line-height:1.35}
.bt-body{font-size:15px;line-height:1.85;color:var(--ethel)}
.bt-tag{display:inline-flex;align-items:center;justify-content:center;padding:6px 14px;border-radius:50px;background:var(--msayyan-lightest);color:var(--msayyan);font-size:12px;font-weight:600;white-space:nowrap}
.bt-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:4px;border:0;cursor:pointer;font:inherit;font-weight:600;font-size:14px;color:#fff;background:linear-gradient(132deg,var(--primary),var(--primary-dark),var(--primary-dark),var(--primary));background-size:500% 500%;background-position:left;transition:background-position .7s ease-out;box-shadow:0 10px 25px rgba(0,0,0,.15)}
.bt-cta:hover{background-position:right}
.bt-cta-ghost{background:none;box-shadow:none;color:var(--primary-dark);border:1px solid var(--tan);padding:12px 22px}
.bt-cta-ghost:hover{background:var(--tan-lightest)}
.bt-head{position:fixed;inset-inline:0;top:0;z-index:1000;background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,0) 100%);transition:background .3s}
.bt-head.solid{background:#fff;box-shadow:0 6px 24px rgba(0,0,0,.08)}
.bt-head-in{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px}
@media(min-width:768px){.bt-head-in{padding:32px 48px}}
@media(min-width:1024px){.bt-head-in{padding:32px 56px}}
@media(min-width:1280px){.bt-head-in{padding:32px 64px}}
.bt-logo{width:120px;height:42px;background:#fff;mask-image:url("https://s7g10.scene7.com/is/content/diriyahcompany/diriyah-ar-logo");-webkit-mask-image:url("https://s7g10.scene7.com/is/content/diriyahcompany/diriyah-ar-logo");mask-repeat:no-repeat;mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-size:contain;flex:0 0 auto}
.bt-head.solid .bt-logo{background:var(--primary-dark)}
.bt-nav{display:none;align-items:center;gap:8px}
@media(min-width:1024px){.bt-nav{display:flex}}
.bt-navlink{position:relative;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:4px;font-size:15px;font-weight:500;color:#fff;background:none;border:0;cursor:pointer;font-family:inherit}
.bt-head.solid .bt-navlink{color:var(--primary-dark)}
.bt-navlink:hover{background:rgba(255,255,255,.12)}
.bt-head.solid .bt-navlink:hover{background:var(--tan-lightest)}
.bt-navlink svg{transition:transform .2s}
.bt-navlink.on svg{transform:rotate(180deg)}
.bt-drop{position:absolute;top:100%;inset-inline-start:0;min-width:250px;background:#fff;border:1px solid var(--tan-lightest);box-shadow:0 14px 34px rgba(0,0,0,.12);border-radius:6px;padding:8px;display:none}
.bt-drop.on{display:block}
.bt-drop a{display:block;padding:10px 12px;border-radius:4px;font-size:14px;color:var(--primary-dark)}
.bt-drop a:hover{background:var(--tan-lightest)}
.bt-actions{display:flex;align-items:center;gap:10px}
.bt-ico{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;border:0;background:none;color:#fff;cursor:pointer}
.bt-head.solid .bt-ico{color:var(--primary-dark)}
.bt-ico:hover{background:rgba(255,255,255,.14)}
.bt-head.solid .bt-ico:hover{background:var(--tan-lightest)}
.bt-lang{display:none;align-items:center;gap:6px;font-size:14px;color:#fff;padding:8px 10px}
@media(min-width:1024px){.bt-lang{display:inline-flex}}
.bt-head.solid .bt-lang{color:var(--primary-dark)}
.bt-burger{display:inline-flex}
@media(min-width:1024px){.bt-burger{display:none}}
.bt-search{display:none;position:absolute;top:100%;inset-inline:0;background:#fff;border-top:1px solid var(--tan-lightest);padding:26px 24px;box-shadow:0 14px 34px rgba(0,0,0,.1)}
.bt-search.on{display:block}
.bt-search form{display:flex;align-items:center;gap:10px;border:1px solid var(--tan-lighter);border-radius:6px;padding:0 14px;height:54px;max-width:1100px;margin:0 auto}
.bt-search input{flex:1;border:0;outline:none;font:inherit;font-size:16px;background:none;color:var(--ethel)}
.bt-quick{max-width:1100px;margin:18px auto 0}
.bt-quick p{font-size:13px;font-weight:600;margin-bottom:10px}
.bt-quick a{display:flex;align-items:center;gap:8px;font-size:14px;padding:7px 0;color:var(--primary-dark)}
.bt-mobile{position:fixed;inset:0;z-index:1100;background:#FAF7F2;padding:70px 24px 24px;overflow:auto;display:none}
.bt-mobile.on{display:block}
.bt-mobile a{display:block;width:100%;text-align:start;padding:14px 6px;border-bottom:1px solid var(--tan-lighter);font-size:16px;font-weight:600;color:var(--primary-dark)}
.bt-hero{position:relative;aspect-ratio:3/5;width:100%;overflow:hidden;background:#241610}
@media(min-width:768px){.bt-hero{aspect-ratio:9/4}}
.bt-hero img{width:100%;height:100%;object-fit:cover}
.bt-intro{display:grid;gap:32px}
@media(min-width:1024px){.bt-intro{grid-template-columns:7fr 4fr;gap:48px;align-items:start}}
.bt-tagrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.bt-share{position:relative}
.bt-sharebtn{width:36px;height:36px;border-radius:50%;border:0;background:var(--primary-lighter);color:var(--primary-dark);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bt-sharebtn:hover{background:var(--tan-light)}
.bt-sharepanel{position:absolute;top:44px;inset-inline-end:0;background:#fff;border:1px solid var(--tan-lighter);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,.12);padding:6px;min-width:170px;z-index:20;display:none}
.bt-sharepanel.on{display:block}
.bt-sharepanel a,.bt-sharepanel button{display:block;width:100%;text-align:start;padding:9px 10px;border:0;background:none;font:inherit;font-size:13px;border-radius:5px;cursor:pointer;color:var(--primary-dark)}
.bt-sharepanel a:hover,.bt-sharepanel button:hover{background:var(--tan-lightest)}
.bt-intro h2{margin:26px 0 18px}
.bt-card{background:#fff;border-radius:6px;box-shadow:0 4px 25px rgba(0,0,0,.05);padding:22px}
.bt-tiles{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:34px}
@media(min-width:1024px){.bt-tiles{grid-template-columns:repeat(3,1fr)}}
.bt-tile{background:#fff;border-radius:6px;box-shadow:0 4px 25px rgba(0,0,0,.05);min-height:140px;padding:24px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;font-size:14px}
@media(min-width:1024px){.bt-tile{min-height:160px}}
.bt-tile svg{width:56px;height:56px;flex:0 0 auto}
.bt-tiletitle{font-weight:700;font-size:13px;margin-bottom:14px}
.bt-stories{position:relative;background:#000}
.bt-story{position:relative;height:100vh;max-height:844px;overflow:hidden}
@media(min-width:1024px){.bt-story{max-height:982px}}
.bt-story img{width:100%;height:100%;object-fit:cover}
.bt-storylayer{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;justify-content:flex-end;padding:32px 24px;pointer-events:none}
@media(min-width:768px){.bt-storylayer{padding:32px 48px}}
@media(min-width:1024px){.bt-storylayer{padding:54px 56px}}
.bt-storylayer::before{content:"";position:absolute;inset:0;z-index:-1;backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px);background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.1) 20%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.8) 100%);mask-image:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.3) 15%,rgba(0,0,0,.8) 40%,#000 70%);-webkit-mask-image:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.3) 15%,rgba(0,0,0,.8) 40%,#000 70%)}
.bt-motifs{display:flex;gap:10px;margin-bottom:14px}
.bt-storytitle{color:#fff;font-size:19px;font-weight:600;max-width:460px}
.bt-storybar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:26px;pointer-events:auto}
.bt-thumbs{display:flex;gap:10px}
.bt-thumb{position:relative;width:54px;height:84px;border-radius:6px;overflow:hidden;border:0;padding:0;cursor:pointer;background:none}
@media(min-width:1024px){.bt-thumb{width:122px;height:79px}}
.bt-thumb img{width:100%;height:100%;object-fit:cover}
.bt-thumb span.ring{position:absolute;inset:-3px;border-radius:8px;background:conic-gradient(from 0deg,rgba(255,255,255,.2) calc(100% - var(--p)),#fff 0);padding:3px;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.bt-round{width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.18);backdrop-filter:blur(12px);color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bt-round:hover{background:rgba(255,255,255,.3)}
.bt-round:disabled{opacity:.35;cursor:default}
.bt-map{position:relative;border-radius:8px;overflow:hidden;box-shadow:0 4px 25px rgba(0,0,0,.15);height:420px;background:#E5E3DF}
@media(min-width:1024px){.bt-map{height:66.5vh}}
.bt-map iframe{width:100%;height:100%;border:0;display:block}
.bt-zoom{position:absolute;top:16px;inset-inline-end:16px;z-index:6;display:flex;flex-direction:column;gap:8px}
.bt-zoom button{width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:var(--primary-dark);box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;font-size:20px;line-height:1;display:inline-flex;align-items:center;justify-content:center}
.bt-zoom button:hover{background:#F5EBE1}
.bt-pins{display:flex;gap:16px;overflow-x:auto;padding:16px 0;margin-top:16px;scrollbar-width:none}
.bt-pins::-webkit-scrollbar{display:none}
.bt-pin{flex:0 0 auto;width:330px;display:flex;gap:14px;background:#FAF7F2;border-radius:6px;padding:10px;box-shadow:0 10px 25px rgba(0,0,0,.15);cursor:pointer;border:1px solid transparent;text-align:start;font:inherit;color:inherit}
.bt-pin.on{border-color:var(--tan)}
.bt-pin img{width:100px;height:148px;object-fit:cover;border-radius:5px;flex:0 0 auto}
.bt-pinbody{display:flex;flex-direction:column;justify-content:center;gap:8px;min-width:0}
.bt-pinbody b{font-size:15px;font-weight:700}
.bt-pinlink{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--ethel);text-decoration:underline;text-underline-offset:4px;margin-top:auto}
.bt-infocards{display:grid;gap:22px;grid-template-columns:1fr}
@media(min-width:768px){.bt-infocards{grid-template-columns:repeat(3,1fr)}}
.bt-infocard{background:#FAF7F2;border:1px solid var(--tan-lightest);border-radius:5px;box-shadow:0 8px 25px rgba(0,0,0,.08);height:150px;display:grid;place-content:center;justify-items:center;gap:10px;padding:16px;text-align:center;font-size:14px}
@media(min-width:1024px){.bt-infocard{height:184px}}
.bt-infocard img{width:48px;height:48px;object-fit:contain}
.bt-exps{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;scrollbar-width:none}
.bt-exps::-webkit-scrollbar{display:none}
.bt-exp{flex:0 0 82%;max-width:82%;scroll-snap-align:start;position:relative;border-radius:6px;overflow:hidden;aspect-ratio:1/1;background:#eee}
@media(min-width:768px){.bt-exp{flex:0 0 45.45%;max-width:45.45%}}
@media(min-width:1024px){.bt-exp{flex:0 0 41.5%;max-width:41.5%}}
.bt-exp img{width:100%;height:100%;object-fit:cover;transition:transform .7s}
.bt-exp:hover img{transform:scale(1.06)}
.bt-exp::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 54%,rgba(0,0,0,.45) 100%)}
.bt-glass{position:absolute;inset-inline:4%;bottom:4%;z-index:2;border-radius:5px;padding:16px;background:rgba(255,255,255,.16);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.22);color:#FDFAF7}
.bt-glass h3{font-size:17px;font-weight:700;margin:8px 0 6px;color:#fff}
.bt-glassloc{display:flex;align-items:center;gap:6px;font-size:12px;margin-top:10px;opacity:.95}
.bt-more{display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.2);backdrop-filter:blur(15px)}
.bt-morein{display:flex;flex-direction:column;align-items:center;gap:10px;color:#fff;font-weight:600}
.bt-progress{height:3px;background:rgba(36,22,16,.12);border-radius:3px;overflow:hidden;margin-top:26px}
.bt-progress i{display:block;height:100%;background:var(--ethel);transition:width .3s}
.bt-arrows{display:flex;gap:14px;margin-top:22px}
.bt-arrow{width:56px;height:56px;border-radius:50%;border:0;background:var(--tan-lighter);color:var(--ethel);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bt-arrow:hover{background:var(--tan-light)}
.bt-arrow:disabled{background:var(--tan-lightest);color:var(--tan-light);cursor:default}
.bt-frame{position:relative;width:100%;aspect-ratio:13/13}
@media(min-width:1024px){.bt-frame{aspect-ratio:875/536}}
.bt-frame svg.frame{position:absolute;top:0;inset-inline-start:0;width:84.55%;height:93.4%;z-index:1}
.bt-framebox{position:absolute;top:14.2%;inset-inline-end:0;width:92%;height:85.63%;overflow:hidden;z-index:2}
.bt-framebox img{width:100%;height:100%;object-fit:cover}
.bt-framecap{position:absolute;inset-inline:0;bottom:0;padding:20px;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.6),transparent);font-size:15px;font-weight:600}
.bt-storysplit{display:grid;gap:26px}
@media(min-width:1024px){.bt-storysplit{grid-template-columns:27% 1fr;align-items:center}}
.bt-dots{display:flex;gap:10px;margin-top:22px}
.bt-dots i{height:3px;flex:1;background:rgba(36,22,16,.12);border-radius:3px;transition:background .3s}
.bt-dots i.on{background:var(--ethel)}
.bt-foot{background:#fff;border-top:1px solid var(--primary-lighter);background-image:url("https://s7g10.scene7.com/is/content/diriyahcompany/footer-illustration");background-repeat:no-repeat;background-position:top 25px center;background-size:530px 240px}
@media(min-width:1024px){.bt-foot{background-position:bottom -82px left 174px;background-size:926px 420px}}
.bt-footgrid{display:grid;gap:32px}
@media(min-width:1024px){.bt-footgrid{grid-template-columns:1fr 1fr;gap:54px}}
.bt-footlinks{display:grid;grid-template-columns:1fr 1fr;gap:14px 40px;margin-top:22px}
.bt-footlinks a{font-size:14px}
.bt-footlinks a:hover{text-decoration:underline;text-underline-offset:3px}
.bt-news{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.bt-news input{flex:1;min-width:200px;padding:13px 14px;border:1px solid var(--tan-lighter);border-radius:4px;font:inherit;font-size:15px;background:#fff}
.bt-news input:focus{outline:none;border-color:var(--tan)}
.bt-err{color:#B4232A;font-size:12.5px;margin-top:8px}
.bt-okmsg{color:#1B7A45;font-size:13px;margin-top:8px;font-weight:600}
.bt-social{display:flex;gap:22px;margin-top:22px;color:var(--ethel)}
.bt-social a:hover{color:var(--date-light)}
.bt-footbottom{display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:center;margin-top:34px;border-top:1px solid var(--primary-lighter);padding-top:24px;font-size:13px}
.bt-policy{display:flex;gap:24px;flex-wrap:wrap}
.bt-totop{width:44px;height:44px;border-radius:50%;border:1px solid var(--primary-dark);background:none;color:var(--primary-dark);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bt-cookie{position:fixed;inset-inline:0;bottom:0;z-index:1200;background:var(--tan-lightest);padding:24px}
.bt-cookie .bt-h3{margin-bottom:12px}
.bt-cookie p{font-size:14px;line-height:1.8;margin-bottom:16px}
.bt-cookiebtns{display:flex;gap:16px;align-items:center}
`;

const HEAD_NAV = [
  { label: "الأنشطة السياحية", children: [
    ["جميع الأنشطة السياحية", "/things-to-do"],
    ["المطاعم", "/things-to-do/dining"],
    ["التسوق", "/things-to-do/shopping"],
    ["زيارة المعالم السياحية", "/things-to-do/sightseeing"],
    ["ابقَ معنا", "/plan-your-visit"],
  ]},
  { label: "أماكن للزيارة", href: "/places-to-go" },
  { label: "خطط لزيارتك", href: "/plan-your-visit" },
];

const STORY_SLIDES = [
  { title: "تجربة طعام استثنائية", img: "Dining%20-%20Hero%20Banner%20-%20Desktop%201536x682", thumb: "Dining%20-%20Hero%20Banner%20-%20Desktop%201536x682" },
  { title: "التجزئة الفاخرة", img: "bujairi-diriyah-visitors-shopping-in-boutique-gallery-02-shared", thumb: "bujairi-diriyah-visitors-shopping-in-boutique-gallery-02-shared" },
  { title: "أنشطة عائلية", img: "bujairi-diriyah-children-on-wooden-animal-rides-gallery-01-shared", thumb: "bujairi-diriyah-children-on-wooden-animal-rides-gallery-01-shared" },
];

const PINS = [
  { id: "p1", title: "مطل البجيري", img: "Discover-Bujairi-Terrace-Spotlight-%20Desktop", q: "24.7364,46.5749" },
  { id: "p2", title: "مواقف البجيري", img: "bujairi-parking", q: "24.7392854,46.5772329" },
];

const EXPERIENCES = [
  { title: "ألتوبيانو", tag: "مطاعم فاخرة", img: "altopiano-diriyah-pasta-and-salad-gallery-01-desktop", href: "/things-to-do/dining" },
  { title: "دولتشي آند غابانا", tag: "متاجر فاخرة", img: "d-and-g-diriyah-boutique-interior-hero-01-desktop", href: "/things-to-do/shopping" },
  { title: "قصر سلوى", tag: "المواقع التاريخية", img: "sightseeing-diriyah-salwa-palace-at-sunrise-listing-05-shared", href: "/things-to-do/sightseeing" },
];

const ARTICLES = [
  { title: "حين ترسم الطبيعة هوية الدرعية", img: "6.%20Art-Design-Diriyahs-colour" },
  { title: "العمارة النجدية.. إرثٌ يلهم التصميم", img: "homepage-diriyah-najdi-wall-with-triangle-openings-articles-carousel-07-shared" },
  { title: "الساعة الذهبية في حي الطريف", img: "diriyah-golden-hour-article" },
];

const scene = (name: string, preset: string, w: number, h: number) =>
  `https://s7g10.scene7.com/is/image/diriyahcompany/${name}:${preset}?wid=${w}&hei=${h}&fmt=webp&qlt=85&dpr=on`;

const Motifs = () => (
  <div className="bt-motifs" aria-hidden="true">
    <svg width="13" height="20" viewBox="0 0 13 20" fill="none"><path d="M12.45 9.29 6.95.37c-.3-.49-1.02-.49-1.33 0L.11 9.29a.86.86 0 0 0 0 .89l5.51 8.92c.3.49 1.02.49 1.33 0l5.5-8.92a.86.86 0 0 0 0-.89Z" fill="#C79667" /></svg>
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M8.63.02c.05-.03.11-.02.14.02l.14.19c.53.74.95 1.56 1.19 2.44.49 1.82.38 3.65-.27 5.28.16-.2.33-.39.51-.57 1.83-1.84 4.26-2.7 6.73-2.46l.32.03-.14.29c-1.04 2.29-3.05 3.97-5.64 4.61a7 7 0 0 1-.57.11c.19.03.38.07.57.11 2.59.64 4.6 2.33 5.64 4.62l.14.29-.32.03c-2.46.24-4.89-.62-6.72-2.46a7 7 0 0 1-.45-.5c.08.2.15.41.2.63.68 2.51.22 5.04-1.22 7.04l-.19.27-.2-.27c-1.31-1.83-1.82-4.09-1.38-6.38.04-.19.09-.38.14-.56a7 7 0 0 1 .26-.85 8.2 8.2 0 0 1-4.61 2.92 5.7 5.7 0 0 1-2.56.16l-.27-.03a.1.1 0 0 1-.07-.14l.1-.22c.38-.82.87-1.6 1.52-2.24 1.35-1.36 3.02-2.18 4.8-2.42a8.4 8.4 0 0 1-4.78-2.42A8 8 0 0 1 .13 5.3l-.1-.22a.1.1 0 0 1 .07-.14l.26-.03c.85-.08 1.73-.06 2.56.16 1.91.47 3.51 1.52 4.63 2.95-.59-1.45-.76-3.07-.44-4.69.04-.19.08-.37.13-.55.24-.88.66-1.7 1.19-2.44l.11-.19.1-.06Z" fill="#C79667" /></svg>
    <svg width="13" height="20" viewBox="0 0 13 20" fill="none"><path d="M12.45 9.29 6.95.37c-.3-.49-1.02-.49-1.33 0L.11 9.29a.86.86 0 0 0 0 .89l5.51 8.92c.3.49 1.02.49 1.33 0l5.5-8.92a.86.86 0 0 0 0-.89Z" fill="#C79667" /></svg>
  </div>
);

const Arrow = ({ dir = "next" }: { dir?: "next" | "prev" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: dir === "prev" ? "rotate(180deg)" : "none" }}>
    <path d="M19.52 11.98H4.53M10.517 5.988 4.48 12l6.037 6.012" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function BujairiTerrace() {
  const [solid, setSolid] = useState(false);
  const [drop, setDrop] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [share, setShare] = useState(false);
  const [slide, setSlide] = useState(0);
  const [zoom, setZoom] = useState(15);
  const [pin, setPin] = useState(0);
  const [cookie, setCookie] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [art, setArt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    try { if (!localStorage.getItem("dc_consent")) setCookie(true); } catch (e) { setCookie(true); }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("bt-in"); }),
      { threshold: 0.12 }
    );
    rootRef.current?.querySelectorAll(".bt-reveal").forEach((el) => io.observe(el));
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  const decide = (v: "accept" | "reject") => {
    try {
      localStorage.setItem("dc_consent", v);
      document.cookie = `__Host-dc_cookie_consent=${v}; path=/; max-age=31536000; secure; samesite=strict`;
    } catch (e) {}
    setCookie(false);
  };

  const copy = () => { try { navigator.clipboard?.writeText(window.location.href); } catch (e) {} setShare(false); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr("أدخل بريدًا إلكترونيًا صالحًا"); return; }
    setErr(""); setSent(true); setEmail("");
  };

  return (
    <div className="bt-page" ref={rootRef}>
      <style>{CSS}</style>

      <a href="#main" style={{ position: "absolute", right: 8, top: 8, zIndex: 2000, background: "#fff", padding: "6px 12px", borderRadius: 4, fontSize: 13 }}>الانتقال إلى المحتوى الرئيسي</a>

      <header className={`bt-head${solid ? " solid" : ""}`}>
        <div className="bt-head-in">
          <a href="/" aria-label="الدرعية" className="bt-logo" />

          <nav className="bt-nav" aria-label="Main">
            {HEAD_NAV.map((item, i) => (
              <div key={item.label} style={{ position: "relative" }}>
                {item.children ? (
                  <>
                    <button className={`bt-navlink${drop === i ? " on" : ""}`} onClick={() => setDrop(drop === i ? null : i)} aria-expanded={drop === i}>
                      <span>{item.label}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <div className={`bt-drop${drop === i ? " on" : ""}`}>
                      {item.children.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
                    </div>
                  </>
                ) : (
                  <a className="bt-navlink" href={item.href}>{item.label}</a>
                )}
              </div>
            ))}
          </nav>

          <div className="bt-actions">
            <a className="bt-lang" href="/en/places-to-go/bujairi-terrace" lang="en">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3.51 9h16.97M12 21c-2.21 0-4-4.03-4-9s1.79-9 4-9M12 21c2.21 0 4-4.03 4-9s-1.79-9-4-9M20.37 15H3.51M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>English</span>
            </a>
            <button className="bt-ico" aria-label="بحث" onClick={() => setSearch((v) => !v)}>
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M20.952 9.118A8.368 8.368 0 1 1 9.118 20.952 8.368 8.368 0 0 1 20.952 9.118M25.333 25.333l-4.387-4.386" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <a className="bt-cta" href="https://tickets.bujairi.sa/ar/g/17/bujairi" target="_blank" rel="noreferrer">
              <span>احجز الآن</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m12 12 9-9v7-7h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <button className="bt-ico bt-burger" aria-label="القائمة" onClick={() => setMobile(true)}>
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="M9.16 20h21.68M9.16 26.67h21.68M9.16 13.33h21.68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        <div className={`bt-search${search ? " on" : ""}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M20.952 9.118A8.368 8.368 0 1 1 9.118 20.952 8.368 8.368 0 0 1 20.952 9.118M25.333 25.333l-4.387-4.386" stroke="#8A7A6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <input placeholder="ماذا تودّ أن تكتشف؟" />
          </form>
          <div className="bt-quick">
            <p>روابط سريعة</p>
            {["عن الدرعية", "أين تأكل وتشرب؟", "أين تقيم؟", "فعاليات الدرعية", "خطط لزيارتك"].map((q) => (
              <a key={q} href="#"><span>←</span><span>{q}</span></a>
            ))}
          </div>
        </div>
      </header>

      <div className={`bt-mobile${mobile ? " on" : ""}`}>
        <button className="bt-ico" style={{ position: "absolute", top: 16, insetInlineStart: 16, color: "#241610" }} onClick={() => setMobile(false)} aria-label="إغلاق">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        {HEAD_NAV.map((i) => i.children
          ? i.children.map(([l, h]) => <a key={l} href={h} onClick={() => setMobile(false)}>{l}</a>)
          : <a key={i.label} href={i.href} onClick={() => setMobile(false)}>{i.label}</a>
        )}
        <a href="/en/places-to-go/bujairi-terrace" style={{ borderBottom: "none" }}>English</a>
      </div>

      <main id="main">
        <section className="bt-hero">
          <picture>
            <source media="(min-width: 1537px)" srcSet={scene("bujairi-diriyah-family-walking-in-plaza-at-dusk-hero-01-shared", "desktop_9-4", 1920, 853)} />
            <source media="(min-width: 1281px)" srcSet={scene("bujairi-diriyah-family-walking-in-plaza-at-dusk-hero-01-shared", "desktop_9-4", 1536, 683)} />
            <source media="(min-width: 993px)" srcSet={scene("bujairi-diriyah-family-walking-in-plaza-at-dusk-hero-01-shared", "desktop_9-4", 1280, 569)} />
            <source media="(min-width: 768px)" srcSet={scene("bujairi-diriyah-family-walking-in-plaza-at-dusk-hero-01-shared", "desktop_9-4", 992, 441)} />
            <img src={scene("bujairi-diriyah-family-walking-in-plaza-at-dusk-hero-01-shared", "mobile_3-5", 767, 1278)} alt="مطل البجيري" />
          </picture>
        </section>

        <section className="bt-sec bt-texture">
          <div className="bt-wrap bt-intro">
            <div>
              <div className="bt-tagrow">
                <span className="bt-tag">مطل البجيري</span>
                <div className="bt-share">
                  <button className="bt-sharebtn" onClick={() => setShare((v) => !v)} aria-label="مشاركة">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ transform: "scaleX(-1)" }}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.08 8.95C6.19 9.5 2.5 13.63 2.5 18.55v.62a9.06 9.06 0 0 1 8.58-4.12v3.23c0 .47.27.9.69 1.1.42.2.92.15 1.29-.14l7.99-6.31c.28-.23.45-.57.45-.93 0-.36-.17-.7-.45-.93l-7.99-6.31a1.14 1.14 0 0 0-1.29-.14c-.42.2-.69.63-.69 1.1v3.23Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className={`bt-sharepanel${share ? " on" : ""}`}>
                    <button onClick={copy}>نسخ الرابط</button>
                    <a href="https://x.com/intent/post?url=https://derieya.netlify.app/bujairi-terrace" target="_blank" rel="noreferrer">مشاركة على X</a>
                    <a href="https://wa.me/?text=https://derieya.netlify.app/bujairi-terrace" target="_blank" rel="noreferrer">واتساب</a>
                  </div>
                </div>
              </div>

              <h2 className="bt-h2">مطل البجيري</h2>
              <p className="bt-body">
                تم افتتاح مطل البجيري في ديسمبر 2022م، والذي يضم مجموعة من المطاعم والمقاهي التي تعطي لمحة من مستقبل الدرعية "من هالأرض".
                <br />
                من أصالة منطقة نجد, استوحينا تصميم مطل البجيري، لتصبح الدرعية مكانًا للابتكار، والثقافة، والتراث.
              </p>

              <p className="bt-tiletitle" style={{ marginTop: 34 }}>معلومات الوجهة</p>
              <div className="bt-tiles">
                <div className="bt-tile">
                  <svg viewBox="0 0 60 60" fill="none" aria-hidden="true">
                    <path d="M51.98 23.81a5.06 5.06 0 1 1-7.15 7.15 5.06 5.06 0 0 1 7.15-7.15M35.5 14.78a7.78 7.78 0 1 1-11.01 11.01 7.78 7.78 0 0 1 11.01-11.01M15.17 23.81a5.06 5.06 0 1 1-7.15 7.15 5.06 5.06 0 0 1 7.15-7.15M57.5 47.5v-2.74a6.25 6.25 0 0 0-6.25-6.25h-2M2.5 47.5v-2.74a6.25 6.25 0 0 1 6.25-6.25h2M43.35 47.5v-4a8.75 8.75 0 0 0-8.75-8.75h-9.2a8.75 8.75 0 0 0-8.75 8.75v4" stroke="#1E1F39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>نرحب بجميع الأعمار</p>
                </div>
                <div className="bt-tile">
                  <svg viewBox="0 0 60 60" fill="none" aria-hidden="true">
                    <circle cx="20" cy="40" r="12.5" stroke="#1E1F39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="20" cy="40" r="5" stroke="#1E1F39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M52.5 50h-4.02c-.58 0-1.08-.39-1.22-.95l-3.81-15.26a5.5 5.5 0 0 0-5.35-4.29H27.5M40 20H17.5M35 30V20M10 7.5h2.5a5 5 0 0 1 5 5v15M46.25 45H31.46" stroke="#1E1F39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>مهيأ للكراسي المتحركة</p>
                </div>
              </div>
            </div>

            <aside>
              <div className="bt-card">
                <a className="bt-cta" style={{ width: "100%" }} href="/plan-your-visit">احجز الآن</a>
              </div>
            </aside>
          </div>
        </section>

        <div className="bt-stories">
          {STORY_SLIDES.map((s, i) => (
            <div className="bt-story" key={s.title} style={{ display: i === slide ? "block" : "none" }}>
              <picture>
                <source media="(min-width: 1537px)" srcSet={scene(s.img, "desktop_3-2", 1920, 1280)} />
                <source media="(min-width: 1281px)" srcSet={scene(s.img, "desktop_3-2", 1536, 1024)} />
                <source media="(min-width: 993px)" srcSet={scene(s.img, "desktop_3-2", 1280, 853)} />
                <source media="(min-width: 768px)" srcSet={scene(s.img, "desktop_3-2", 992, 661)} />
                <img src={scene(s.img, "mobile_2-3", 767, 1151)} alt="" />
              </picture>
              <div className="bt-storylayer">
                <Motifs />
                <h3 className="bt-storytitle">{s.title}</h3>
                <div className="bt-storybar">
                  <div className="bt-thumbs">
                    {STORY_SLIDES.map((t, ti) => (
                      <button key={t.title} className={`bt-thumb${ti <= slide ? " done" : ""}`} onClick={() => setSlide(ti)} aria-label={t.title} style={{ ["--p" as any]: ti < slide ? "100%" : "0%" }}>
                        <img src={scene(t.thumb, "desktop_1-1", 327, 327)} alt="" />
                        <span className="ring" />
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="bt-round" onClick={() => setSlide((v) => Math.max(0, v - 1))} disabled={slide === 0} aria-label="السابق"><Arrow dir="prev" /></button>
                    <button className="bt-round" onClick={() => setSlide((v) => Math.min(STORY_SLIDES.length - 1, v + 1))} disabled={slide === STORY_SLIDES.length - 1} aria-label="التالي"><Arrow /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="bt-sec">
          <div className="bt-wrap">
            <h2 className="bt-h3" style={{ marginBottom: 18 }}>الموقع</h2>
            <div className="bt-map">
              <iframe title="خريطة مطل البجيري" src={`https://maps.google.com/maps?q=${PINS[pin].q}&z=${zoom}&hl=ar&output=embed`} loading="lazy" />
              <div className="bt-zoom">
                <button onClick={() => setZoom((z) => Math.min(19, z + 1))} aria-label="تكبير">+</button>
                <button onClick={() => setZoom((z) => Math.max(10, z - 1))} aria-label="تصغير">−</button>
              </div>
            </div>

            <div className="bt-pins">
              {PINS.map((p, i) => (
                <button key={p.id} className={`bt-pin${i === pin ? " on" : ""}`} onClick={() => setPin(i)}>
                  <img src={scene(p.img, "desktop_2-3", 327, 491)} alt={p.title} />
                  <div className="bt-pinbody">
                    <b>{p.title}</b>
                    <a className="bt-pinlink" href={`https://www.google.com/maps/search/?api=1&query=${p.q}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      خريطة Google
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m12 12 9-9v7-7h-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bt-sec">
          <div className="bt-wrap">
            <h2 className="bt-h3" style={{ marginBottom: 20 }}>Location Information</h2>
            <div className="bt-infocards">
              {[["نرحب بجميع الأعمار", "family"], ["على بُعد 9 كم من كافد", "location_nav"], ["على بُعد 38 كم من مطار RUH", "location"]].map(([label, icon]) => (
                <div className="bt-infocard" key={label}>
                  <img src={`https://s7g10.scene7.com/is/content/diriyahcompany/${icon}`} alt={label} />
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bt-sec">
          <div className="bt-wrap">
            <h2 className="bt-h2" style={{ marginBottom: 8 }}>اكتشف التجارب</h2>
            <Motifs />
            <div className="bt-exps" style={{ marginTop: 22 }}>
              {EXPERIENCES.map((e) => (
                <a className="bt-exp" key={e.title} href={e.href}>
                  <img src={scene(e.img, "desktop_1-1", 634, 634)} alt={e.title} />
                  <div className="bt-glass">
                    <span className="bt-tag">{e.tag}</span>
                    <h3>{e.title}</h3>
                    <div className="bt-glassloc">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 21s-7-5.75-7-11a7 7 0 1 1 14 0c0 5.25-7 11-7 11Z" stroke="#FDFAF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="3" stroke="#FDFAF7" strokeWidth="1.5" /></svg>
                      <span>مطل البجيري</span>
                    </div>
                  </div>
                </a>
              ))}
              <a className="bt-exp" href="/things-to-do">
                <img src={scene("diriyah-cycling-garden-path-article-01", "desktop_1-1", 634, 634)} alt="" style={{ transform: "scale(1.05)" }} />
                <div className="bt-glass bt-more"><div className="bt-morein"><span>View more</span><Arrow /></div></div>
              </a>
            </div>
            <div className="bt-progress"><i style={{ width: "25%" }} /></div>
          </div>
        </section>

        <section className="bt-sec bt-texture">
          <div className="bt-wrap bt-storysplit">
            <div>
              <h2 className="bt-h2">قصصنا</h2>
              <a className="bt-cta" style={{ marginTop: 20 }} href="/articles" target="_blank" rel="noreferrer">تعرف أكثر</a>
            </div>
            <div>
              <div className="bt-frame">
                <svg className="frame" viewBox="0 0 740 501" preserveAspectRatio="none" aria-hidden="true"><rect width="740" height="501" fill="#C79667" /></svg>
                <div className="bt-framebox">
                  <img src={scene(ARTICLES[art].img, "desktop_3-2", 845, 563)} alt={ARTICLES[art].title} />
                  <div className="bt-framecap">{ARTICLES[art].title}</div>
                </div>
              </div>
              <div className="bt-dots">
                {ARTICLES.map((a, i) => <i key={a.title} className={i === art ? "on" : ""} onClick={() => setArt(i)} style={{ cursor: "pointer" }} />)}
              </div>
              <div className="bt-arrows">
                <button className="bt-arrow" onClick={() => setArt((v) => Math.max(0, v - 1))} disabled={art === 0} aria-label="السابق"><Arrow dir="prev" /></button>
                <button className="bt-arrow" onClick={() => setArt((v) => Math.min(ARTICLES.length - 1, v + 1))} disabled={art === ARTICLES.length - 1} aria-label="التالي"><Arrow /></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bt-foot bt-sec">
        <div className="bt-wrap">
          <div className="bt-footgrid">
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>روابط سريعة</p>
              <div className="bt-footlinks">
                {[["نبذة عنا", "/about"], ["المقالات", "/articles"], ["التواصل والدعم", "/contact-us"], ["الأسئلة الشائعة", "/faq"]].map(([l, h]) => <a key={l} href={h}>{l}</a>)}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>اشترك لتبقى على اطّلاع بأحدث أخبار الدرعية</p>
              <p style={{ fontSize: 13, lineHeight: 1.8, marginTop: 8 }}>كن أول من يطّلع على أحدث الفعاليات والتجارب والعروض الخاصة في الدرعية، لتصلك مباشرةً إلى بريدك الإلكتروني.</p>
              <form className="bt-news" onSubmit={submit} noValidate>
                <input type="email" placeholder="أدخل عنوان بريدك الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="البريد الإلكتروني" />
                <button className="bt-cta" type="submit">اشترك</button>
              </form>
              {err && <p className="bt-err">{err}</p>}
              {sent && <p className="bt-okmsg">شكرًا لتواصلك معنا</p>}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>تابعنا</p>
              <div className="bt-social">
                {[["Instagram", "https://www.instagram.com/visitdiriyah/"], ["Facebook", "https://www.facebook.com/VisitDiriyah/"], ["X", "https://x.com/visitdiriyah/"], ["YouTube", "https://www.youtube.com/channel/UCzBnBmNygpZq7Z1fdtbe1YQ"], ["TikTok", "https://www.tiktok.com/@visitdiriyah"]].map(([n, h]) => (
                  <a key={n} href={h} target="_blank" rel="noreferrer" aria-label={n} style={{ fontSize: 13 }}>{n}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="bt-footbottom">
            <div className="bt-policy">
              {[["الشروط والأحكام", "/terms"], ["سياسة الخصوصية", "/privacy-policy"], ["سياسة ملفات الارتباط", "/cookie-policy"]].map(([l, h]) => <a key={l} href={h}>{l}</a>)}
            </div>
            <p>© 2026 شركة الدرعية. جميع الحقوق محفوظة.</p>
            <button className="bt-totop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="أعلى">
              <svg width="22" height="22" viewBox="0 0 50 50" fill="none"><path d="M18.52 21.64 25 16l6.48 5.64M25.01 16.61v17.99" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
      </footer>

      {cookie && (
        <div className="bt-cookie">
          <div className="bt-wrap">
            <h3 className="bt-h3">سياسة ملفات تعريف الارتباط</h3>
            <Motifs />
            <p style={{ marginTop: 12 }}>يستخدم هذا الموقع ملفات تعريف الارتباط لتوفير تجربة مستخدم مميزة لك. باستخدامك لموقعنا، فإنك توافق على استخدامنا لملفات تعريف الارتباط.</p>
            <div className="bt-cookiebtns">
              <button className="bt-cta" onClick={() => decide("accept")}>نعم، أوافق</button>
              <button className="bt-cta bt-cta-ghost" onClick={() => decide("reject")}>لا، أرفض</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
