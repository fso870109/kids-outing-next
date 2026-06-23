import { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import SPOTS from "../data/spots";

const CITIES = ["全部","桃園","台北","新北","基隆","宜蘭","花蓮","台東","屏東","高雄","台南","嘉義市","嘉義縣","雲林","彰化","南投","台中","苗栗","新竹市","新竹縣","澎湖","金門","連江縣"];
const TYPES = { all:"全部", indoor:"🏠 室內", outdoor:"🌳 室外" };
const TAGS_ALL = ["全部","遊樂園","動物","自然","購物","老街","美食","教育","步道","農場","夜市","腳踏車","登山","海灘","溫泉","藝術","歷史","科學","戲水","文化"];
const DAY_MAP = {"週日":0,"週一":1,"週二":2,"週三":3,"週四":4,"週五":5,"週六":6};

function isTodayClosed(closed) {
  if (!closed || closed === "無公休") return false;
  const skip = ["依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況","週六、週日開放"];
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

export default function Home() {
  const [activeCity, setActiveCity] = useState("全部");
  const [activeType, setActiveType] = useState("all");
  const [activeTag, setActiveTag] = useState("全部");
  const [visited, setVisited] = useState(new Set());
  const [view, setView] = useState("explore");
  const [search, setSearch] = useState("");
  const [shareToast, setShareToast] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [favSet, setFavSet] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get("favs");
      if (shared) return new Set(shared.split(",").map(Number).filter(n => !isNaN(n) && n > 0));
    } catch {}
    return new Set();
  });

  const shareList = () => {
    if (favSet.size === 0) { alert("你還沒有收藏任何景點！先點 ❤️ 收藏吧"); return; }
    const ids = Array.from(favSet).join(",");
    const url = `${window.location.origin}/?favs=${ids}`;
    try {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      });
    } catch { prompt("複製這個連結：", url); }
  };

  const filtered = useMemo(() => {
    let list = SPOTS;
    if (activeCity !== "全部") list = list.filter(s => s.city === activeCity);
    if (activeType !== "all") list = list.filter(s => s.type === activeType);
    if (activeTag !== "全部") list = list.filter(s => s.tags.includes(activeTag));
    if (search.trim()) list = list.filter(s =>
      s.name.includes(search)||s.desc.includes(search)||s.district.includes(search)||s.city.includes(search)
    );
    if (view === "favorites") list = list.filter(s => favSet.has(s.id));
    if (view === "visited") list = list.filter(s => visited.has(s.id));
    return list;
  }, [activeCity, activeType, activeTag, search, view, favSet, visited]);

  const toggleVisited = id => setVisited(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleFav = id => setFavSet(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  return (
    <>
      <Head>
        <title>假日遛小孩 — 全台 {SPOTS.length} 個親子景點一手掌握</title>
        <meta name="description" content="全台22縣市869個親子景點，室內室外分類，即時顯示營業狀態，免費使用不用下載App。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="假日遛小孩 — 全台親子景點懶人包" />
        <meta property="og:description" content="全台869個親子景點，室內室外篩選，即時營業狀態，免費使用。" />
        <meta property="og:url" content="https://kids-outing.vercel.app" />
      </Head>

      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fff8f0 0%,#f0f8ff 100%)", fontFamily:"'Noto Sans TC',sans-serif", paddingBottom:80 }}>

        {shareToast && (
          <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:"#2f9e44", color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
            ✅ 連結已複製！傳給另一半吧
          </div>
        )}

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#ff6b6b,#ffa94d)", padding:"16px 14px 12px", boxShadow:"0 4px 20px rgba(255,107,107,0.3)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ fontSize:28 }}>🧒</span>
            <div>
              <div style={{ color:"#fff", fontWeight:900, fontSize:17 }}>假日遛小孩</div>
              <div style={{ color:"rgba(255,255,255,0.85)", fontSize:11 }}>全台 {SPOTS.length} 個景點</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:5, alignItems:"center" }}>
              <StatBadge icon="❤️" count={favSet.size} label="收藏" />
              <StatBadge icon="✅" count={visited.size} label="去過" />
              <button onClick={shareList} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:10, padding:"4px 10px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                <span style={{ fontSize:14 }}>📤</span>
                <span>分享</span>
              </button>
            </div>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋景點、地區、縣市..."
              style={{ width:"100%", boxSizing:"border-box", padding:"8px 10px 8px 32px", borderRadius:10, border:"none", fontSize:14, background:"rgba(255,255,255,0.95)", outline:"none" }} />
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display:"flex", borderBottom:"2px solid #f0e6d3", background:"#fff" }}>
          {[["explore","🗺️ 探索"],["favorites","❤️ 收藏"],["visited","✅ 去過"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{ flex:1, padding:"9px 4px", border:"none", background:"none", fontSize:12, fontWeight:view===v?700:400, color:view===v?"#ff6b6b":"#888", borderBottom:view===v?"2px solid #ff6b6b":"2px solid transparent", cursor:"pointer" }}>{label}</button>
          ))}
        </div>

        {/* Weather hint */}
        <WeatherHint onFilter={t=>setActiveType(t)} />

        {/* 找不到景點橫幅 */}
        <a href="https://forms.gle/AvoceS4azn5uFAB68" target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"8px 12px 0", padding:"9px 14px", background:"#f0f4ff", borderRadius:12, border:"1.5px solid #d0d9ff", textDecoration:"none" }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#3b5bdb" }}>找不到你要的景點？</div>
            <div style={{ fontSize:11, color:"#748ffc" }}>點這裡推薦給我們，審核後會加進來 🙌</div>
          </div>
          <span style={{ fontSize:20 }}>➕</span>
        </a>

        {/* Filters */}
        <div style={{ padding:"10px 12px 0" }}>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            {Object.entries(TYPES).map(([k,label])=>(
              <FilterChip key={k} label={label} active={activeType===k} onClick={()=>setActiveType(k)} activeColor="#ff6b6b" />
            ))}
          </div>
          <button onClick={()=>setShowCityPicker(!showCityPicker)} style={{ width:"100%", padding:"8px 14px", marginBottom:8, borderRadius:12, border:`1.5px solid #ffa94d`, background:showCityPicker?"#fff3e0":"#fff", color:"#e8730a", fontWeight:700, fontSize:13, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>📍 縣市：{activeCity === "全部" ? "全部縣市" : activeCity}</span>
            <span style={{ fontSize:10 }}>{showCityPicker?"▲":"▼"}</span>
          </button>
          {showCityPicker && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8, padding:"10px", background:"#fff9f0", borderRadius:12, border:"1px solid #ffe0b0" }}>
              {CITIES.map(c=>(
                <button key={c} onClick={()=>{setActiveCity(c);setShowCityPicker(false);}} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${activeCity===c?"#ffa94d":"#e8d5c0"}`, background:activeCity===c?"#ffa94d":"#fff", color:activeCity===c?"#fff":"#666", fontSize:12, fontWeight:activeCity===c?700:400, cursor:"pointer" }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
            {TAGS_ALL.map(t=>(
              <FilterChip key={t} label={t} active={activeTag===t} onClick={()=>setActiveTag(t)} activeColor="#9775fa" small />
            ))}
          </div>
        </div>

        {/* Result count */}
        <div style={{ padding:"6px 14px", color:"#888", fontSize:12 }}>
          共 <b style={{ color:"#ff6b6b" }}>{filtered.length}</b> 個景點
          {activeCity!=="全部" && <span style={{ color:"#ffa94d", marginLeft:4 }}>· {activeCity}</span>}
        </div>

        {/* Cards */}
        <div style={{ padding:"0 12px", display:"grid", gap:10 }}>
          {filtered.length===0 && (
            <div style={{ textAlign:"center", padding:40, color:"#bbb" }}>
              <div style={{ fontSize:48 }}>🏜️</div>
              <div>沒有符合的景點</div>
            </div>
          )}
          {filtered.map(spot=>(
            <SpotCard key={spot.id} spot={spot}
              isFav={favSet.has(spot.id)} isVisited={visited.has(spot.id)}
              onFav={()=>toggleFav(spot.id)} onVisit={()=>toggleVisited(spot.id)} />
          ))}
        </div>

        {/* 推薦景點浮動按鈕 */}
        <a href="https://forms.gle/AvoceS4azn5uFAB68" target="_blank" rel="noopener noreferrer"
          style={{ position:"fixed", bottom:24, right:16, zIndex:999, display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#ff6b6b,#ffa94d)", color:"#fff", textDecoration:"none", padding:"12px 18px", borderRadius:24, fontSize:13, fontWeight:700, boxShadow:"0 4px 16px rgba(255,107,107,0.45)" }}>
          ➕ 推薦景點
        </a>
      </div>
    </>
  );
}

function StatBadge({ icon, count, label }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:9, padding:"3px 9px", textAlign:"center" }}>
      <div style={{ color:"#fff", fontSize:12, fontWeight:700 }}>{icon} {count}</div>
      <div style={{ color:"rgba(255,255,255,0.8)", fontSize:10 }}>{label}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, activeColor, small }) {
  return (
    <button onClick={onClick} style={{ whiteSpace:"nowrap", padding:small?"4px 10px":"6px 14px", flexShrink:0, borderRadius:20, border:`1.5px solid ${active?activeColor:"#e0d5c8"}`, background:active?activeColor:"#fff", color:active?"#fff":"#666", fontSize:small?12:13, fontWeight:active?700:400, cursor:"pointer" }}>{label}</button>
  );
}

function WeatherHint({ onFilter }) {
  const hour = new Date().getHours();
  const isHot = hour>=10 && hour<=15;
  return (
    <div style={{ margin:"8px 12px 0", borderRadius:12, padding:"9px 12px", background:isHot?"linear-gradient(135deg,#fff9db,#ffe8cc)":"linear-gradient(135deg,#ebfbee,#d3f9d8)", border:`1.5px solid ${isHot?"#ffd43b":"#69db7c"}`, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:20 }}>{isHot?"☀️":"🌤️"}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:12, color:"#333" }}>{isHot?"大太陽時段，推薦室內":"天氣舒適，戶外景點棒"}</div>
      </div>
      <button onClick={()=>onFilter(isHot?"indoor":"outdoor")} style={{ background:isHot?"#ffa94d":"#40c057", color:"#fff", border:"none", borderRadius:9, padding:"5px 11px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{isHot?"🏠 室內":"🌳 室外"}</button>
    </div>
  );
}

function SpotCard({ spot, isFav, isVisited, onFav, onVisit }) {
  const typeColor = spot.type==="indoor"?"#74c0fc":"#69db7c";
  const typeLabel = spot.type==="indoor"?"🏠 室內":"🌳 室外";
  const feeColor  = spot.fee==="免費"?"#69db7c":spot.fee==="付費"?"#ffa94d":"#da77f2";
  const status = parseOpenStatus(spot.hours, spot.closed);

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:13, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", border:isVisited?"1.5px solid #b2f2bb":"1.5px solid #f0e6d3", position:"relative", overflow:"hidden", opacity:isVisited?0.88:1 }}>
      {isVisited&&<div style={{ position:"absolute", top:9, right:-15, background:"#40c057", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 20px", transform:"rotate(35deg)" }}>去過了</div>}
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <Link href={`/spot/${encodeURIComponent(spot.name)}`} style={{ textDecoration:"none" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:spot.type==="indoor"?"#e7f5ff":"#ebfbee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, cursor:"pointer" }}>{spot.emoji}</div>
        </Link>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2, flexWrap:"wrap" }}>
            <Link href={`/spot/${encodeURIComponent(spot.name)}`} style={{ textDecoration:"none" }}>
              <span style={{ fontWeight:800, fontSize:14, color:"#222", cursor:"pointer" }}>{spot.name}</span>
            </Link>
            <span style={{ fontSize:10, background:typeColor+"25", color:"#555", padding:"1px 6px", borderRadius:7, fontWeight:600, border:`1px solid ${typeColor}50`, whiteSpace:"nowrap" }}>{typeLabel}</span>
          </div>
          <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>📍 {spot.city} · {spot.district}</div>

          {/* Hours */}
          <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:5 }}>
            {status && (
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"#666" }}>🕐 {status.label}</span>
                {status.open === true && !isTodayClosed(spot.closed) && <span style={{ fontSize:10, background:"#d3f9d8", color:"#2f9e44", padding:"1px 7px", borderRadius:6, fontWeight:700 }}>營業中</span>}
                {status.open === false && isTodayClosed(spot.closed) && <span style={{ fontSize:10, background:"#ffe3e3", color:"#c92a2a", padding:"1px 7px", borderRadius:6, fontWeight:700 }}>今日公休</span>}
                {status.open === false && !isTodayClosed(spot.closed) && <span style={{ fontSize:10, background:"#ffe8cc", color:"#e8590c", padding:"1px 7px", borderRadius:6, fontWeight:700 }}>已關閉</span>}
              </div>
            )}
            {spot.closed && spot.closed !== "無公休" && !["依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況"].some(f=>spot.closed.includes(f)) && (
              <div style={{ fontSize:11, color:"#999" }}>🚫 公休：{spot.closed}</div>
            )}
            <div style={{ fontSize:10, color:"#bbb" }}>⚠️ 出發前建議致電或查官網再確認</div>
          </div>

          <div style={{ fontSize:12, color:"#555", lineHeight:1.45, marginBottom:6 }}>{spot.desc}</div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            <Badge label={spot.fee} color={feeColor} />
            <Badge label={"👶 "+spot.age} color="#adb5bd" />
            {spot.tags.slice(0,2).map(t=><Badge key={t} label={t} color="#ced4da" />)}
          </div>
        </div>
      </div>

      {/* 訂票按鈕 */}
      {(spot.kkday || spot.klook) && (
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {spot.kkday && (
            <a href={`https://www.kkday.com/zh-tw/product/productlist?keyword=${encodeURIComponent(spot.kkday)}&cid=25539`} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px 4px", borderRadius:9, textDecoration:"none", background:"linear-gradient(135deg,#ff6b35,#ff4500)", color:"#fff", fontSize:12, fontWeight:700 }}>
              🎫 KKday 訂票
            </a>
          )}
          {spot.klook && (
            <a href={`https://www.klook.com/zh-TW/search/?query=${encodeURIComponent(spot.klook)}&aid=124818`} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px 4px", borderRadius:9, textDecoration:"none", background:"linear-gradient(135deg,#e91e8c,#c2185b)", color:"#fff", fontSize:12, fontWeight:700 }}>
              🎟️ Klook 訂票
            </a>
          )}
        </div>
      )}

      <div style={{ display:"flex", gap:7, marginTop:8, borderTop:"1px solid #f5f0eb", paddingTop:8 }}>
        <ActionBtn icon={isFav?"❤️":"🤍"} label={isFav?"已收藏":"收藏"} onClick={onFav} active={isFav} activeColor="#ff6b6b" />
        <ActionBtn icon={isVisited?"✅":"📍"} label={isVisited?"去過了":"標記去過"} onClick={onVisit} active={isVisited} activeColor="#40c057" />
        <a href={`https://forms.gle/LMXGKFgj66edWcyg7?usp=pp_url&entry.景點=${encodeURIComponent(spot.name)}`} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"6px 4px", borderRadius:9, textDecoration:"none", background:"#f8f6f2", border:"1.5px solid #e8e0d5", fontSize:11, fontWeight:600, color:"#aaa", gap:3 }}>
          🚩 回報有誤
        </a>
      </div>
    </div>
  );
}

function Badge({ label, color }) {
  return <span style={{ fontSize:11, padding:"2px 7px", borderRadius:7, background:color+"20", color:"#555", border:`1px solid ${color}35` }}>{label}</span>;
}

function ActionBtn({ icon, label, onClick, active, activeColor }) {
  return (
    <button onClick={onClick} style={{ flex:1, padding:"6px 4px", background:active?activeColor+"15":"#f8f6f2", border:`1.5px solid ${active?activeColor:"#e8e0d5"}`, borderRadius:9, fontSize:12, fontWeight:600, color:active?activeColor:"#888", cursor:"pointer" }}>
      {icon} {label}
    </button>
  );
}
