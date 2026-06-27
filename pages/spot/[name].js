import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import SPOTS from "../../data/spots";

const DAY_MAP = {"週日":0,"週一":1,"週二":2,"週三":3,"週四":4,"週五":5,"週六":6};

function getDistance(lat1,lon1,lat2,lon2) {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

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

// ── 比較功能 ──
const COMPARE_KEY = "kids-compare";
function CompareBar({ spot }) {
  const [compareList, setCompareList] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [gps, setGps] = useState(null);

  useEffect(() => {
    try { setCompareList(JSON.parse(localStorage.getItem(COMPARE_KEY)||"[]")); } catch{}
    navigator.geolocation?.getCurrentPosition(p=>setGps({lat:p.coords.latitude,lng:p.coords.longitude}));
  }, []);

  const inCompare = compareList.some(s=>s.id===spot.id);

  const toggle = () => {
    let next;
    if (inCompare) {
      next = compareList.filter(s=>s.id!==spot.id);
    } else {
      if (compareList.length >= 3) { alert("最多比較 3 個景點"); return; }
      next = [...compareList, spot];
    }
    setCompareList(next);
    try { localStorage.setItem(COMPARE_KEY, JSON.stringify(next)); } catch{}
  };

  const scoreLabels = {
    stamina:  ["輕鬆","稍累","普通","費力","高強度"],
    comfort:  ["辛苦","還好","普通","舒適","超舒適"],
    budget:   ["昂貴","偏貴","普通","實惠","免費"],
    facility: ["很少","少","普通","豐富","超豐富"],
    traffic:  ["困難","稍難","普通","方便","超方便"],
  };
  const scoreIcons = { stamina:"💪", comfort:"😌", budget:"💰", facility:"🎡", traffic:"🚗" };
  const scoreNames = { stamina:"體力消耗", comfort:"家長舒適", budget:"預算親民", facility:"設施豐富", traffic:"交通便利" };

  return (
    <>
      {/* 加入比較按鈕 */}
      <div style={{ margin:"0 0 12px", display:"flex", gap:8 }}>
        <button onClick={toggle} style={{ flex:1, padding:"10px", borderRadius:12, border:`1.5px solid ${inCompare?"#FF6B6B":"#eee"}`, background:inCompare?"#fff5f5":"#f8f9fa", color:inCompare?"#FF6B6B":"#666", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {inCompare?"✓ 已加入比較":"⚖️ 加入比較"}
        </button>
        {compareList.length >= 2 && (
          <button onClick={()=>setShowPanel(true)} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#FF6B6B,#ffa94d)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            比較 {compareList.length} 個景點 →
          </button>
        )}
      </div>

      {/* 比較面板 */}
      {showPanel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, overflowY:"auto" }} onClick={()=>setShowPanel(false)}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", position:"absolute", bottom:0, left:0, right:0, maxHeight:"85vh", overflowY:"auto", padding:"20px 16px 40px" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, background:"#eee", borderRadius:2, margin:"0 auto 16px" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:16 }}>⚖️ 景點比較</div>
              <button onClick={()=>setShowPanel(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#aaa" }}>×</button>
            </div>

            {/* 景點名稱列 */}
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${compareList.length},1fr)`, gap:8, marginBottom:16 }}>
              {compareList.map(s=>(
                <div key={s.id} style={{ textAlign:"center", padding:"10px 6px", background:"#f8f9fa", borderRadius:12 }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{s.emoji}</div>
                  <div style={{ fontWeight:700, fontSize:12, color:"#222", lineHeight:1.3 }}>{s.name}</div>
                  <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{s.city}</div>
                  {gps && s.lat && s.lng && (
                    <div style={{ fontSize:10, color:"#FF6B6B", fontWeight:700, marginTop:2 }}>
                      📍 {getDistance(gps.lat,gps.lng,s.lat,s.lng).toFixed(1)} km
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 基本資訊比較 */}
            {[
              { label:"費用", get: s=>s.fee },
              { label:"適合年齡", get: s=>s.age },
              { label:"停留時間", get: s=>s.duration||"—" },
              { label:"雨天", get: s=>(s.rain===true||s.rain==="true")?"☔ 適合":"☀️ 晴天佳" },
              { label:"停車", get: s=>s.parking==="容易"?"🚗 停車方便":"🅿️ 附設停車場" },
              { label:"類型", get: s=>s.type==="indoor"?"❄️ 室內":"🌳 戶外" },
            ].map(row=>(
              <div key={row.label} style={{ display:"grid", gridTemplateColumns:`80px repeat(${compareList.length},1fr)`, gap:6, marginBottom:8, alignItems:"center" }}>
                <div style={{ fontSize:11, color:"#999", fontWeight:600 }}>{row.label}</div>
                {compareList.map(s=>(
                  <div key={s.id} style={{ fontSize:12, color:"#333", fontWeight:600, textAlign:"center", padding:"6px 4px", background:"#f8f9fa", borderRadius:8 }}>{row.get(s)}</div>
                ))}
              </div>
            ))}

            {/* 評分比較 */}
            {compareList[0]?.scores && (
              <>
                <div style={{ fontWeight:700, fontSize:13, color:"#333", margin:"16px 0 10px" }}>📊 評分比較</div>
                {Object.keys(scoreNames).map(key=>(
                  <div key={key} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>{scoreIcons[key]} {scoreNames[key]}</div>
                    <div style={{ display:"grid", gridTemplateColumns:`repeat(${compareList.length},1fr)`, gap:6 }}>
                      {compareList.map(s=>{
                        const val = s.scores?.[key] || 1;
                        const isMax = Math.max(...compareList.map(x=>x.scores?.[key]||1)) === val;
                        return (
                          <div key={s.id} style={{ textAlign:"center" }}>
                            <div style={{ height:6, borderRadius:3, background:isMax?"#FF6B6B":"#eee", overflow:"hidden", marginBottom:3 }}>
                              <div style={{ height:"100%", width:`${val*20}%`, background:isMax?"linear-gradient(90deg,#FF6B6B,#ffa94d)":"#ddd", borderRadius:3 }}/>
                            </div>
                            <div style={{ fontSize:10, color:isMax?"#FF6B6B":"#999", fontWeight:isMax?700:400 }}>{scoreLabels[key][val-1]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 清空比較 */}
            <button onClick={()=>{ setCompareList([]); localStorage.removeItem(COMPARE_KEY); setShowPanel(false); }} style={{ marginTop:16, width:"100%", padding:"10px", border:"1.5px solid #eee", borderRadius:12, background:"none", fontSize:13, color:"#aaa", cursor:"pointer" }}>
              清空比較清單
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── 雷達圖元件 ──
function RadarChart({ scores }) {
  const keys = ["stamina","comfort","budget","facility","traffic"];
  const labels = ["體力消耗","家長舒適","預算親民","設施豐富","交通便利"];
  const size = 200, cx = 100, cy = 95, r = 58;

  const angle = (i) => (i * 2 * Math.PI / keys.length) - Math.PI / 2;

  const points = keys.map((k, i) => {
    const a = angle(i);
    const val = (scores[k] || 1) / 5;
    return {
      x: cx + r * val * Math.cos(a),
      y: cy + r * val * Math.sin(a),
    };
  });

  const gridPoints = (ratio) => keys.map((_, i) => {
    const a = angle(i);
    return `${cx + r * ratio * Math.cos(a)},${cy + r * ratio * Math.sin(a)}`;
  }).join(" ");

  const dataPath = points.map((p, i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ") + "Z";

  // 標籤位置：往外推更多距離，並根據位置微調對齊方式
  const labelPos = keys.map((_, i) => {
    const a = angle(i);
    const dist = r + 26;
    const lx = cx + dist * Math.cos(a);
    const ly = cy + dist * Math.sin(a);
    // 水平對齊：左側用end，右側用start，頂部和底部用middle
    const anchor = Math.cos(a) < -0.3 ? "end" : Math.cos(a) > 0.3 ? "start" : "middle";
    return { lx, ly, label: labels[i], anchor };
  });

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.2,0.4,0.6,0.8,1].map(ratio=>(
          <polygon key={ratio} points={gridPoints(ratio)} fill="none" stroke="#eee" strokeWidth="1"/>
        ))}
        {keys.map((_,i)=>{
          const a = angle(i);
          return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#eee" strokeWidth="1"/>;
        })}
        <path d={dataPath} fill="rgba(255,107,107,0.2)" stroke="#FF6B6B" strokeWidth="2"/>
        {points.map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FF6B6B"/>
        ))}
        {labelPos.map((l,i)=>(
          <text key={i} x={l.lx} y={l.ly} textAnchor={l.anchor} dominantBaseline="middle"
            fontSize="9.5" fill="#555" fontWeight="600">{l.label}</text>
        ))}
      </svg>
    </div>
  );
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
            src={spot.photo || `https://picsum.photos/seed/${spot.id}/600/300`}
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

          {/* H1 景點名稱（SEO 用，視覺上已在 Header 顯示，這裡隱藏） */}
          <h1 style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
            {spot.city}{spot.type==="indoor"?"室內":"室外"}親子景點 — {spot.name}
          </h1>

          {/* Badges */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, background:typeColor+"25", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:`1px solid ${typeColor}50` }}>{typeLabel}</span>
            <span style={{ fontSize:12, background:feeColor+"25", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:`1px solid ${feeColor}50` }}>{spot.fee}</span>
            <span style={{ fontSize:12, background:"#e8f5e9", color:"#555", padding:"4px 12px", borderRadius:20, fontWeight:600, border:"1px solid #c8e6c9" }}>👶 {spot.age}</span>
            {spot.tags.map(t => (
              <span key={t} style={{ fontSize:12, background:"#f5f5f5", color:"#666", padding:"4px 12px", borderRadius:20, border:"1px solid #e0e0e0" }}>{t}</span>
            ))}
          </div>

          {/* 景點介紹 — H2 + 段落分拆 */}
          <div style={{ background:"#fff", borderRadius:16, padding:"16px 16px 20px", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:"#222", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
              📍 {spot.name} 景點介紹
            </h2>
            {(spot.content || spot.desc).split('。').filter(s=>s.trim()).reduce((acc, s, i, arr) => {
              // 每 2 句合成一段
              if (i % 2 === 0) {
                const para = s + '。' + (arr[i+1] ? arr[i+1] + '。' : '');
                acc.push(para.trim());
              }
              return acc;
            }, []).map((para, i) => (
              <p key={i} style={{ fontSize:14, color:"#444", lineHeight:1.85, margin:"0 0 10px", letterSpacing:0.2 }}>
                {para}
              </p>
            ))}
          </div>

          {/* 基本資訊 — H2 */}
          <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:"#222", margin:"0 0 12px" }}>⏰ 基本資訊</h2>
            <div style={{ display:"grid", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>營業時間</span>
                <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
                  <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.hours}</span>
                  {status?.open === true && !isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#d3f9d8", color:"#2f9e44", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>營業中</span>}
                  {status?.open === false && isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#ffe3e3", color:"#c92a2a", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>今日公休</span>}
                  {status?.open === false && !isTodayClosed(spot.closed) && <span style={{ fontSize:11, background:"#ffe8cc", color:"#e8590c", padding:"2px 8px", borderRadius:6, fontWeight:700 }}>已關閉</span>}
                </div>
              </div>
              {spot.closed && spot.closed !== "無公休" && (
                <div style={{ display:"flex", gap:10 }}>
                  <span style={{ fontSize:13, color:"#888", minWidth:56 }}>公休日</span>
                  <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.closed}</span>
                </div>
              )}
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>停留時間</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.duration || "依個人"}</span>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>停車</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.parking==="容易"?"🚗 停車方便":"🅿️ 附設停車場"}</span>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>雨天</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>
                  {spot.rain === true || spot.rain === "true" ? "☔ 適合" : "☀️ 晴天較佳"}
                </span>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>費用</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.fee}</span>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>適合年齡</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{spot.age}</span>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:13, color:"#888", minWidth:56 }}>類型</span>
                <span style={{ fontSize:13, color:"#333", fontWeight:600 }}>{typeLabel}</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:"#bbb", marginTop:12, paddingTop:10, borderTop:"1px solid #f5f5f5" }}>
              ⚠️ 出發前建議致電或查官網確認最新資訊
            </div>
          </div>

          {/* 雷達圖評分 */}
          {spot.scores && (
            <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#222", margin:"0 0 14px" }}>📊 景點評分</h2>
              <RadarChart scores={spot.scores} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
                {[
                  { key:"stamina",  label:"體力消耗", icon:"💪", desc:["輕鬆","稍累","普通","費力","高強度"] },
                  { key:"comfort",  label:"家長舒適", icon:"😌", desc:["辛苦","還好","普通","舒適","超舒適"] },
                  { key:"budget",   label:"預算親民", icon:"💰", desc:["昂貴","偏貴","普通","實惠","免費"] },
                  { key:"facility", label:"設施豐富", icon:"🎡", desc:["很少","少","普通","豐富","超豐富"] },
                  { key:"traffic",  label:"交通便利", icon:"🚗", desc:["困難","稍難","普通","方便","超方便"] },
                ].map(({key, label, icon, desc}) => (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:"#666" }}>{label}</span>
                        <span style={{ fontSize:11, color:"#FF6B6B", fontWeight:700 }}>{desc[spot.scores[key]-1]}</span>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:"#f0f0f0", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${spot.scores[key]*20}%`, background:"linear-gradient(90deg,#FF6B6B,#ffa94d)", borderRadius:3 }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {spot.blogKeywords && spot.blogKeywords.length > 0 && (
            <div style={{ background:"#f0f4ff", borderRadius:16, padding:16, marginBottom:12, border:"1.5px solid #d0d9ff" }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#3b5bdb", margin:"0 0 12px" }}>📖 相關遊記參考</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {spot.blogKeywords.map((kw, i) => (
                  <a key={i}
                    href={`https://www.google.com/search?q=${encodeURIComponent(kw + ' 遊記 親子')}`}
                    target="_blank" rel="noopener noreferrer nofollow"
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"#fff", borderRadius:10, textDecoration:"none", border:"1px solid #e0e7ff" }}
                  >
                    <span style={{ fontSize:14 }}>🔍</span>
                    <span style={{ fontSize:13, color:"#3b5bdb", fontWeight:600 }}>{kw}</span>
                    <span style={{ marginLeft:"auto", fontSize:12, color:"#aaa" }}>搜尋遊記 →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

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

          {/* 加入比較 */}
          <CompareBar spot={spot} />

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
                      src={s.photo || `https://picsum.photos/seed/${s.id}/100/100`}
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
