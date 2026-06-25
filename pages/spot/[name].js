import Head from "next/head";
import Link from "next/link";
import SPOTS from "../../data/spots";

const DAY_MAP = {"週日":0,"週一":1,"週二":2,"週三":3,"週四":4,"週五":5,"週六":6};

function isTodayClosed(closed) {
  if (!closed || closed === "無公休") return false;
  const skip = ["依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況"];
  if (skip.some(f => closed.includes(f))) return false;
  const today = new Date().getDay();
  return closed.split("、").some(d => DAY_MAP[d.trim()] === today);
}

function parseOpenStatus(hours, closed) {
  if (!hours) return null;
  const fixed = ["全天開放","依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況"];
  if (fixed.some(f => hours.startsWith(f))) return { label: hours, open: null };
  const m = hours.match(/^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/);
  if (!m) return { label: hours, open: null };
  if (isTodayClosed(closed)) return { label: hours, open: false };
  const now = new Date();
  const cur = now.getHours()*60 + now.getMinutes();
  const start = parseInt(m[1])*60 + parseInt(m[2]);
  let end = parseInt(m[3])*60 + parseInt(m[4]);
  if (end < start) end += 24*60;
  return { label: hours, open: cur >= start && cur < end };
}

export async function getStaticPaths() {
  const paths = SPOTS.map(spot => ({
    params: { name: encodeURIComponent(spot.name) }
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const name = decodeURIComponent(params.name);
  const spot = SPOTS.find(s => s.name === name) || null;
  const related = spot ? SPOTS.filter(s => s.city === spot.city && s.id !== spot.id).slice(0, 6) : [];
  return { props: { spot, related } };
}

export default function SpotPage({ spot, related }) {
  if (!spot) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'Noto Sans TC',sans-serif" }}>
      <div style={{ fontSize:48 }}>😢</div>
      <div style={{ marginBottom:16 }}>找不到這個景點</div>
      <Link href="/" style={{ color:"#ff6b6b" }}>← 回首頁</Link>
    </div>
  );

  const status = parseOpenStatus(spot.hours, spot.closed);
  const typeLabel = spot.type === "indoor" ? "🏠 室內" : "🌳 室外";
  const typeColor = spot.type === "indoor" ? "#74c0fc" : "#69db7c";
  const feeColor = spot.fee === "免費" ? "#69db7c" : spot.fee === "付費" ? "#ffa94d" : "#da77f2";
  const BASE = "https://gokidsouting.com";
  const title = `${spot.city} ${spot.type === "indoor" ? "室內" : "室外"}親子景點 — ${spot.name} | 假日遛小孩`;
  const desc = `${spot.name}，位於${spot.city}${spot.district}，${spot.desc}。費用：${spot.fee}，適合${spot.age}，營業時間：${spot.hours}。`;
  const canonical = `${BASE}/spot/${encodeURIComponent(spot.name)}`;
  const ogImage = `${BASE}/og-default.jpg`;
  const mapsQuery = encodeURIComponent(`${spot.name} ${spot.city}${spot.district}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed&hl=zh-TW`;

  // Schema.org 結構化資料
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": spot.name,
    "description": desc,
    "url": canonical,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": spot.district,
      "addressRegion": spot.city,
      "addressCountry": "TW"
    },
    "openingHours": spot.hours !== "依業者" && spot.hours !== "依季節" ? spot.hours : undefined,
    "isAccessibleForFree": spot.fee === "免費",
    "touristType": "家庭親子",
    "audience": {
      "@type": "Audience",
      "audienceType": spot.age
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="place" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="假日遛小孩" />
        <meta property="og:locale" content="zh_TW" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={ogImage} />

        {/* Schema.org 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fff8f0 0%,#f0f8ff 100%)", fontFamily:"'Noto Sans TC',sans-serif" }}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,#ff6b6b,#ffa94d)`,position:"relative",overflow:"hidden"}}>
          <img
            src={`https://source.unsplash.com/600x300/?${(spot.tags.map(t=>({
              "遊樂園":"amusement+park","動物":"zoo,animals","自然":"nature,taiwan",
              "購物":"shopping,mall","老街":"old+street,taiwan","美食":"food,taiwan",
              "教育":"museum,children","步道":"hiking,trail","農場":"farm,animals",
              "夜市":"night+market,taiwan","海灘":"beach,ocean","溫泉":"hot+spring",
              "藝術":"art,gallery","歷史":"historic,temple","科學":"science,museum",
              "戲水":"water+park,swimming","文化":"culture,taiwan","海洋":"aquarium,ocean",
            }[t]))).find(Boolean)||"taiwan,travel"}&sig=${spot.id}`}
            alt={spot.name}
            style={{width:"100%",height:200,objectFit:"cover",display:"block",opacity:0.7}}
            onError={e=>{e.target.style.display="none";}}
          />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.1) 60%)",padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
            <Link href="/" style={{color:"rgba(255,255,255,0.9)",textDecoration:"none",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
              ← 回首頁
            </Link>
            <div style={{display:"flex",alignItems:"flex-end",gap:12}}>
              <div style={{fontSize:36}}>{spot.emoji}</div>
              <div>
                <h1 style={{color:"#fff",fontWeight:900,fontSize:20,margin:0,lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>{spot.name}</h1>
                <div style={{color:"rgba(255,255,255,0.9)",fontSize:12,marginTop:4}}>📍 {spot.city} · {spot.district}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"16px 14px", maxWidth:600, margin:"0 auto" }}>

          {/* Badges */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, background:typeColor+"25", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:`1px solid ${typeColor}50` }}>{typeLabel}</span>
            <span style={{ fontSize:12, background:feeColor+"25", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:`1px solid ${feeColor}50` }}>{spot.fee}</span>
            <span style={{ fontSize:12, background:"#e8f5e9", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:"1px solid #c8e6c9" }}>👶 {spot.age}</span>
            {spot.tags.map(t => (
              <span key={t} style={{ fontSize:12, background:"#f5f5f5", color:"#666", padding:"4px 12px", borderRadius:20, border:"1px solid #e0e0e0" }}>{t}</span>
            ))}
          </div>

          {/* 描述 */}
          <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize:15, color:"#333", lineHeight:1.7, margin:0 }}>{spot.desc}</p>
          </div>

          {/* 營業資訊 */}
          <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:"#333", margin:"0 0 10px" }}>⏰ 營業資訊</h2>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:13, color:"#555" }}>🕐 {spot.hours}</span>
              {status?.open === true && !isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#d3f9d8", color:"#2f9e44", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>營業中</span>}
              {status?.open === false && isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#ffe3e3", color:"#c92a2a", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>今日公休</span>}
              {status?.open === false && !isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#ffe8cc", color:"#e8590c", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>已關閉</span>}
            </div>
            {spot.closed && spot.closed !== "無公休" && (
              <div style={{ fontSize:12, color:"#999", marginBottom:6 }}>🚫 公休：{spot.closed}</div>
            )}
            <div style={{ fontSize:11, color:"#bbb", marginTop:4 }}>⚠️ 出發前建議致電或查官網確認最新資訊</div>
          </div>

          {/* Google Maps 內嵌 */}
          <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ padding:"12px 16px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:"#333", margin:0 }}>📍 位置</h2>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:12, color:"#ff6b6b", textDecoration:"none", fontWeight:600 }}>
                Google Maps 導航 →
              </a>
            </div>
            <iframe
              src={mapsEmbedUrl}
              width="100%"
              height="200"
              style={{ border:"none", display:"block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* 查看票價 */}
          {(spot.kkday || spot.klook) && (
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              {spot.kkday && (
                <a href={`https://www.kkday.com/zh-tw/product/productlist?keyword=${encodeURIComponent(spot.kkday)}&cid=25539`} target="_blank" rel="noopener noreferrer"
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", borderRadius:12, textDecoration:"none", background:"linear-gradient(135deg,#ff6b35,#ff4500)", color:"#fff", fontSize:14, fontWeight:700 }}>
                  🎫 KKday 查看票價
                </a>
              )}
              {spot.klook && (
                <a href={`https://www.klook.com/zh-TW/search/?query=${encodeURIComponent(spot.klook)}&aid=124818`} target="_blank" rel="noopener noreferrer"
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", borderRadius:12, textDecoration:"none", background:"linear-gradient(135deg,#e91e8c,#c2185b)", color:"#fff", fontSize:14, fontWeight:700 }}>
                  🎟️ Klook 查看票價
                </a>
              )}
            </div>
          )}

          {/* 回報 */}
          <a href={`https://forms.gle/LMXGKFgj66edWcyg7?usp=pp_url&entry.景點=${encodeURIComponent(spot.name)}`} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"10px", borderRadius:12, textDecoration:"none", background:"#f8f6f2", border:"1.5px solid #e8e0d5", fontSize:13, fontWeight:600, color:"#aaa", gap:4, marginBottom:20 }}>
            🚩 回報資訊有誤
          </a>

          {/* 同縣市推薦 */}
          {related.length > 0 && (
            <div>
              <h2 style={{ fontSize:14, fontWeight:700, color:"#333", margin:"0 0 10px" }}>📍 {spot.city} 其他景點</h2>
              <div style={{ display:"grid", gap:8 }}>
                {related.map(s => (
                  <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{ textDecoration:"none" }}>
                    <div style={{ background:"#fff", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #f0e6d3" }}>
                  <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0,background:"#f0f0f0"}}>
                    <img
                      src={`https://source.unsplash.com/100x100/?${s.tags[0]||"taiwan"}&sig=${s.id}`}
                      alt={s.name}
                      style={{width:"100%",height:"100%",objectFit:"cover"}}
                      onError={e=>{e.target.style.display="none";e.target.parentNode.style.display="flex";e.target.parentNode.style.alignItems="center";e.target.parentNode.style.justifyContent="center";e.target.parentNode.innerHTML=s.emoji;}}
                    />
                  </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#222" }}>{s.name}</div>
                        <div style={{ fontSize:11, color:"#999" }}>{s.type==="indoor"?"🏠 室內":"🌳 室外"} · {s.fee}</div>
                      </div>
                      <span style={{ color:"#ccc", fontSize:16 }}>›</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
