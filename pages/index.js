import { useState, useMemo, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import SPOTS from "../data/spots";

const CITIES = ["全部","桃園","台北","新北","基隆","宜蘭","花蓮","台東","屏東","高雄","台南","嘉義市","嘉義縣","雲林","彰化","南投","台中","苗栗","新竹市","新竹縣","澎湖","金門","連江縣"];
const DAY_MAP = {"週日":0,"週一":1,"週二":2,"週三":3,"週四":4,"週五":5,"週六":6};

// 情境篩選 Chips
const CHIPS = [
  { id:"rainy",  icon:"☔", label:"雨天備案", filter: s => s.type==="indoor" },
  { id:"free",   icon:"🆓", label:"免費景點", filter: s => s.fee==="免費" },
  { id:"park",   icon:"🚗", label:"停車方便", filter: s => s.type==="outdoor" && ["公園","散步","自然"].some(t=>s.tags.includes(t)) },
  { id:"age02",  icon:"👶", label:"0–2歲",    filter: s => s.age==="全齡" && s.type==="indoor" },
  { id:"age35",  icon:"🎠", label:"3–5歲",    filter: s => s.tags.some(t=>["遊樂園","農場","動物"].includes(t)) },
  { id:"age68",  icon:"🦖", label:"6–8歲",    filter: s => s.tags.some(t=>["科學","教育","步道","遊樂園"].includes(t)) },
  { id:"age912", icon:"🏄", label:"9–12歲",   filter: s => s.tags.some(t=>["戲水","登山","刺激","海灘"].includes(t)) },
  { id:"indoor", icon:"❄️", label:"室內冷氣", filter: s => s.type==="indoor" },
  { id:"nature", icon:"🌳", label:"自然戶外", filter: s => s.type==="outdoor" },
  { id:"food",   icon:"🍜", label:"美食景點", filter: s => s.tags.includes("美食") },
  { id:"farm",   icon:"🐄", label:"親子農場", filter: s => s.tags.includes("農場") },
  { id:"beach",  icon:"🏖️", label:"海灘戲水", filter: s => s.tags.some(t=>["海灘","戲水"].includes(t)) },
];

// 景點背景漸層（按類型）
const GRADIENTS = {
  indoor: ["#667eea,#764ba2","#f093fb,#f5576c","#4facfe,#00f2fe","#43e97b,#38f9d7","#fa709a,#fee140"],
  outdoor:["#f77062,#fe5196","#0ba360,#3cba92","#00c6fb,#005bea","#f7971e,#ffd200","#a18cd1,#fbc2eb"],
};

function getGradient(spot) {
  const arr = GRADIENTS[spot.type] || GRADIENTS.outdoor;
  return arr[spot.id % arr.length];
}

// 按景點標籤自動配 Unsplash 圖片
const TAG_KEYWORDS = {
  "遊樂園": "amusement+park,rides",
  "動物":   "zoo,animals,wildlife",
  "自然":   "nature,forest,taiwan",
  "購物":   "shopping,mall,retail",
  "老街":   "old+street,taiwan,historic",
  "美食":   "food,taiwan,street+food",
  "教育":   "museum,education,children",
  "步道":   "hiking,trail,nature",
  "農場":   "farm,animals,countryside",
  "夜市":   "night+market,taiwan,food",
  "腳踏車": "cycling,bicycle,path",
  "登山":   "mountain,hiking,taiwan",
  "海灘":   "beach,ocean,tropical",
  "溫泉":   "hot+spring,onsen,relaxing",
  "藝術":   "art,museum,gallery",
  "歷史":   "historic,temple,taiwan",
  "科學":   "science,museum,children",
  "戲水":   "water+park,swimming,splash",
  "文化":   "culture,taiwan,temple",
  "海洋":   "ocean,aquarium,marine",
  "瀑布":   "waterfall,nature,taiwan",
  "公園":   "park,green,children",
  "散步":   "park,walking,garden",
};

function getSpotImage(spot) {
  // 按第一個匹配的標籤取關鍵字
  const keyword = spot.tags
    .map(t => TAG_KEYWORDS[t])
    .find(Boolean) || "taiwan,travel,nature";
  // 用 spot.id 當 seed，讓每個景點圖片固定不變
  return `https://source.unsplash.com/400x300/?${keyword}&sig=${spot.id}`;
}

const SEASONS = {
  spring: { months:[2,3,4], label:"🌸 春季限定", desc:"賞花踏青好時節", tag:"自然" },
  summer: { months:[5,6,7], label:"☀️ 夏日必去", desc:"戲水消暑首選",   tag:"戲水" },
  autumn: { months:[8,9,10],label:"🍂 秋遊推薦", desc:"採果賞楓好時機", tag:"農場" },
  winter: { months:[11,0,1],label:"❄️ 冬季首選", desc:"溫泉暖身超舒適", tag:"溫泉" },
};

function getCurrentSeason() {
  const m = new Date().getMonth();
  return Object.entries(SEASONS).find(([,v])=>v.months.includes(m))?.[0]||"summer";
}

function isTodayClosed(closed) {
  if (!closed||closed==="無公休") return false;
  const skip=["依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況","週六、週日開放"];
  if (skip.some(f=>closed.includes(f))) return false;
  return closed.split("、").some(d=>DAY_MAP[d.trim()]===new Date().getDay());
}

function parseOpenStatus(hours,closed) {
  if (!hours) return null;
  const fixed=["全天開放","依季節","依業者","依旅館","依班次","依活動","依潮汐","依賽程","依設施","依行程","依情況"];
  if (fixed.some(f=>hours.startsWith(f))) return {label:hours,open:null};
  const m=hours.match(/^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/);
  if (!m) return {label:hours,open:null};
  if (isTodayClosed(closed)) return {label:hours,open:false};
  const now=new Date(), cur=now.getHours()*60+now.getMinutes();
  const start=parseInt(m[1])*60+parseInt(m[2]);
  let end=parseInt(m[3])*60+parseInt(m[4]);
  if (end<start) end+=24*60;
  return {label:hours,open:cur>=start&&cur<end};
}

function getDistance(lat1,lon1,lat2,lon2) {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── 熱門排行（依收藏數模擬）
const HOT_SPOTS = [12,21,2,13,101,501,702,803,901,1401].map(id=>SPOTS.find(s=>s.id===id)).filter(Boolean).slice(0,5);

// ── 各縣市推薦（每縣市取第一個付費景點）
const CITY_REPS = CITIES.filter(c=>c!=="全部").map(city=>({
  city,
  spot: SPOTS.find(s=>s.city===city&&s.fee==="付費") || SPOTS.find(s=>s.city===city)
})).filter(x=>x.spot);

export default function Home() {
  const [tab, setTab] = useState("home"); // home | explore | favorites | nearby | me
  const [activeChip, setActiveChip] = useState(null);
  const [activeCity, setActiveCity] = useState("全部");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [favSet, setFavSet] = useState(new Set());
  const [visited, setVisited] = useState(new Set());
  const [itinerary, setItinerary] = useState([]);
  const [shareToast, setShareToast] = useState("");
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0=off
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [wizardResult, setWizardResult] = useState([]);
  const chipRef = useRef(null);

  // localStorage
  useEffect(()=>{
    try {
      const f=localStorage.getItem("kids-favs");
      const v=localStorage.getItem("kids-visited");
      const it=localStorage.getItem("kids-itinerary");
      if(f) setFavSet(new Set(JSON.parse(f)));
      if(v) setVisited(new Set(JSON.parse(v)));
      if(it) setItinerary(JSON.parse(it));
      const params=new URLSearchParams(window.location.search);
      const shared=params.get("favs");
      if(shared) setFavSet(new Set(shared.split(",").map(Number).filter(n=>!isNaN(n)&&n>0)));
    } catch{}
  },[]);

  const toggleFav = id => setFavSet(prev=>{
    const n=new Set(prev); n.has(id)?n.delete(id):n.add(id);
    try{localStorage.setItem("kids-favs",JSON.stringify([...n]));}catch{}
    return n;
  });
  const toggleVisited = id => setVisited(prev=>{
    const n=new Set(prev); n.has(id)?n.delete(id):n.add(id);
    try{localStorage.setItem("kids-visited",JSON.stringify([...n]));}catch{}
    return n;
  });
  const addItinerary = spot => setItinerary(prev=>{
    if(prev.find(s=>s.id===spot.id)) return prev;
    const n=[...prev,spot];
    try{localStorage.setItem("kids-itinerary",JSON.stringify(n));}catch{}
    return n;
  });
  const removeItinerary = id => setItinerary(prev=>{
    const n=prev.filter(s=>s.id!==id);
    try{localStorage.setItem("kids-itinerary",JSON.stringify(n));}catch{}
    return n;
  });

  // GPS
  const findNearby = ()=>{
    if(!navigator.geolocation){alert("瀏覽器不支援定位");return;}
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos=>{ setGpsCoords({lat:pos.coords.latitude,lng:pos.coords.longitude}); setGpsLoading(false); setTab("nearby"); },
      ()=>{ alert("無法取得位置，請確認已允許定位權限"); setGpsLoading(false); }
    );
  };

  // 分享
  const shareList = ()=>{
    if(favSet.size===0){alert("你還沒有收藏任何景點！");return;}
    const url=`${window.location.origin}/?favs=${[...favSet].join(",")}`;
    navigator.clipboard?.writeText(url).then(()=>{
      setShareToast("✅ 連結已複製！傳給另一半吧");
      setTimeout(()=>setShareToast(""),3000);
    });
  };

  // 巫師推薦
  const WIZARD = [
    { q:"今天天氣？", opts:[{label:"☀️ 天氣好",val:"sunny"},{label:"🌧️ 下雨天",val:"rainy"}] },
    { q:"孩子幾歲？", opts:[{label:"👶 0–2歲",val:"02"},{label:"🎠 3–5歲",val:"35"},{label:"🦖 6–8歲",val:"68"},{label:"🏄 9–12歲",val:"912"}] },
    { q:"預算？",     opts:[{label:"🆓 免費",val:"free"},{label:"💰 付費都可",val:"paid"}] },
    { q:"偏好類型？", opts:[{label:"🎢 遊樂刺激",val:"fun"},{label:"🌿 自然輕鬆",val:"nature"},{label:"📚 學習教育",val:"edu"},{label:"🍜 美食文化",val:"food"}] },
  ];

  const runWizard = ans => {
    let list = [...SPOTS];
    if(ans.weather==="rainy") list=list.filter(s=>s.type==="indoor");
    if(ans.budget==="free") list=list.filter(s=>s.fee==="免費");
    if(ans.age==="02") list=list.filter(s=>s.age==="全齡"&&s.type==="indoor");
    if(ans.age==="35") list=list.filter(s=>s.tags.some(t=>["遊樂園","農場","動物"].includes(t)));
    if(ans.age==="68") list=list.filter(s=>s.tags.some(t=>["科學","教育","步道","遊樂園"].includes(t)));
    if(ans.age==="912") list=list.filter(s=>s.tags.some(t=>["戲水","登山","海灘","刺激"].includes(t)));
    if(ans.type==="fun") list=list.filter(s=>s.tags.includes("遊樂園"));
    if(ans.type==="nature") list=list.filter(s=>s.type==="outdoor"&&s.tags.some(t=>["自然","步道","農場"].includes(t)));
    if(ans.type==="edu") list=list.filter(s=>s.tags.some(t=>["教育","科學","歷史"].includes(t)));
    if(ans.type==="food") list=list.filter(s=>s.tags.includes("美食"));
    // shuffle & take 3
    list=list.sort(()=>Math.random()-0.5).slice(0,3);
    setWizardResult(list);
    setWizardStep(99);
  };

  const season=getCurrentSeason();
  const seasonInfo=SEASONS[season];

  // 探索篩選
  const exploreList = useMemo(()=>{
    let list=SPOTS;
    if(activeCity!=="全部") list=list.filter(s=>s.city===activeCity);
    if(activeChip) {
      const chip=CHIPS.find(c=>c.id===activeChip);
      if(chip) list=list.filter(chip.filter);
    }
    if(search.trim()) list=list.filter(s=>s.name.includes(search)||s.city.includes(search)||s.district.includes(search)||s.desc.includes(search));
    return list;
  },[activeCity,activeChip,search]);

  // 附近景點
  const nearbyList = useMemo(()=>{
    if(!gpsCoords) return [];
    return SPOTS.filter(s=>s.lat&&s.lng)
      .map(s=>({...s,distance:getDistance(gpsCoords.lat,gpsCoords.lng,s.lat,s.lng)}))
      .sort((a,b)=>a.distance-b.distance).slice(0,20);
  },[gpsCoords]);

  return (
    <>
      <Head>
        <title>GoKids Outing — 全台親子景點一指搞定</title>
        <meta name="description" content="全台22縣市869個親子景點，雨天備案、免費景點、依年齡推薦，假日帶孩子出門不再煩惱。" />
        <link rel="canonical" href="https://gokidsouting.com" />
        <meta property="og:title" content="GoKids Outing — 全台親子景點懶人包" />
        <meta property="og:description" content="全台869個親子景點，情境快速篩選，GPS附近景點，免費使用。" />
        <meta property="og:url" content="https://gokidsouting.com" />
        <meta property="og:image" content="https://gokidsouting.com/og-default.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="GoKids Outing" />
        <meta property="og:locale" content="zh_TW" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://gokidsouting.com/og-default.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          "@context":"https://schema.org","@type":"WebSite",
          "name":"GoKids Outing","url":"https://gokidsouting.com",
          "description":"全台22縣市親子景點查詢平台","inLanguage":"zh-TW",
          "potentialAction":{"@type":"SearchAction","target":"https://gokidsouting.com/?search={search_term_string}","query-input":"required name=search_term_string"}
        })}} />
      </Head>

      <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:"'Noto Sans TC',sans-serif",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:72}}>

        {/* Toast */}
        {shareToast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#2f9e44",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{shareToast}</div>}

        {/* ── 首頁 ── */}
        {tab==="home" && <HomePage
          favSet={favSet} visited={visited} itinerary={itinerary}
          toggleFav={toggleFav} toggleVisited={toggleVisited} addItinerary={addItinerary}
          showItinerary={showItinerary} setShowItinerary={setShowItinerary}
          removeItinerary={removeItinerary} shareList={shareList}
          setTab={setTab} findNearby={findNearby} gpsLoading={gpsLoading}
          season={season} seasonInfo={seasonInfo}
          wizardStep={wizardStep} setWizardStep={setWizardStep}
          wizardAnswers={wizardAnswers} setWizardAnswers={setWizardAnswers}
          wizardResult={wizardResult} runWizard={runWizard} WIZARD={WIZARD}
          setActiveChip={setActiveChip} setSearch={setSearch}
        />}

        {/* ── 探索 ── */}
        {tab==="explore" && <ExplorePage
          favSet={favSet} visited={visited} itinerary={itinerary}
          toggleFav={toggleFav} toggleVisited={toggleVisited} addItinerary={addItinerary}
          activeChip={activeChip} setActiveChip={setActiveChip}
          activeCity={activeCity} setActiveCity={setActiveCity}
          search={search} setSearch={setSearch}
          exploreList={exploreList}
          setShowItinerary={setShowItinerary} showItinerary={showItinerary}
          removeItinerary={removeItinerary} shareList={shareList}
        />}

        {/* ── 收藏 ── */}
        {tab==="favorites" && <FavoritesPage
          favSet={favSet} visited={visited} itinerary={itinerary}
          toggleFav={toggleFav} toggleVisited={toggleVisited} addItinerary={addItinerary}
          shareList={shareList} setShowItinerary={setShowItinerary}
        />}

        {/* ── 附近 ── */}
        {tab==="nearby" && <NearbyPage
          nearbyList={nearbyList} gpsCoords={gpsCoords} gpsLoading={gpsLoading}
          findNearby={findNearby} favSet={favSet} toggleFav={toggleFav}
          addItinerary={addItinerary}
        />}

        {/* ── 我的 ── */}
        {tab==="me" && <MePage
          favSet={favSet} visited={visited} itinerary={itinerary}
          shareList={shareList} setShowItinerary={setShowItinerary}
          setTab={setTab}
        />}

        {/* ── 行程面板 ── */}
        {showItinerary&&<ItineraryPanel itinerary={itinerary} removeItinerary={removeItinerary} onClose={()=>setShowItinerary(false)} shareItinerary={()=>{
          const text="我規劃的週末行程 🧒\n\n"+itinerary.map((s,i)=>`${i+1}. ${s.name}（${s.city}）`).join("\n")+"\n\ngokidsouting.com";
          navigator.clipboard?.writeText(text).then(()=>{setShareToast("✅ 行程已複製！");setTimeout(()=>setShareToast(""),2000);});
        }}/>}

        {/* ── 底部導航 ── */}
        <BottomNav tab={tab} setTab={t=>{if(t==="nearby")findNearby();else setTab(t);}} itinerary={itinerary} setShowItinerary={setShowItinerary}/>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// 首頁
// ════════════════════════════════════════
function HomePage({favSet,visited,itinerary,toggleFav,toggleVisited,addItinerary,showItinerary,setShowItinerary,removeItinerary,shareList,setTab,findNearby,gpsLoading,season,seasonInfo,wizardStep,setWizardStep,wizardAnswers,setWizardAnswers,wizardResult,runWizard,WIZARD,setActiveChip,setSearch}) {
  const hero = HOT_SPOTS[0];
  const dayParts = ["early","morning","afternoon","evening"];
  const hour = new Date().getHours();
  const greeting = hour<6?"深夜了，明天再帶孩子出門？":hour<12?"早安！今天帶孩子去哪？":hour<18?"下午好！找個地方遛小孩？":"傍晚了，附近有什麼好玩的？";

  return (
    <div>
      {/* ── 頂部 Header ── */}
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:"#FF6B6B",letterSpacing:-0.5}}>GoKids <span style={{color:"#333",fontWeight:400,fontSize:14}}>outing</span></div>
            <div style={{fontSize:11,color:"#aaa",marginTop:1}}>{greeting}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {itinerary.length>0&&<button onClick={()=>setShowItinerary(true)} style={{background:"#FF6B6B",color:"#fff",border:"none",borderRadius:16,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🗓️ {itinerary.length}</button>}
            <button onClick={shareList} style={{background:"none",border:"1.5px solid #eee",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#666",cursor:"pointer"}}>📤 分享</button>
          </div>
        </div>
        {/* 搜尋欄 */}
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>🔍</span>
          <input
            placeholder="今天想帶孩子去哪玩？"
            onClick={()=>setTab("explore")}
            readOnly
            style={{width:"100%",boxSizing:"border-box",padding:"10px 12px 10px 36px",borderRadius:12,border:"1.5px solid #eee",fontSize:14,background:"#f8f9fa",outline:"none",cursor:"pointer",color:"#888"}}
          />
        </div>
      </div>

      {/* ── Hero 大圖 ── */}
      {hero&&<div style={{margin:"12px 16px 0",position:"relative",borderRadius:20,overflow:"hidden",height:220,cursor:"pointer"}}>
        <img src={getSpotImage(hero)} alt={hero.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none";e.target.parentNode.style.background=`linear-gradient(135deg,${getGradient(hero)})`;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 60%)"}}>
          <div style={{position:"absolute",top:12,left:12}}>
            <span style={{background:"#FF6B6B",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>🔥 本週爆紅</span>
          </div>
          <div style={{position:"absolute",top:12,right:12}}>
            <button onClick={e=>{e.stopPropagation();toggleFav(hero.id);}} style={{background:"rgba(255,255,255,0.25)",border:"none",borderRadius:20,width:32,height:32,cursor:"pointer",fontSize:16,backdropFilter:"blur(4px)"}}>
              {favSet.has(hero.id)?"❤️":"🤍"}
            </button>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px"}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:18,marginBottom:4}}>{hero.name}</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <span style={{color:"rgba(255,255,255,0.85)",fontSize:12}}>📍 {hero.city}</span>
              <span style={{color:"rgba(255,255,255,0.85)",fontSize:12}}>{hero.type==="indoor"?"❄️ 室內":"🌳 室外"}</span>
              <span style={{color:"rgba(255,255,255,0.85)",fontSize:12}}>{hero.fee}</span>
            </div>
            <Link href={`/spot/${encodeURIComponent(hero.name)}`}>
              <span style={{background:"#FF6B6B",color:"#fff",padding:"8px 20px",borderRadius:20,fontSize:13,fontWeight:700,cursor:"pointer"}}>立即看 →</span>
            </Link>
          </div>
        </div>
        <div style={{position:"absolute",bottom:12,right:16,display:"flex",gap:4}}>
          {HOT_SPOTS.slice(0,5).map((_,i)=><div key={i} style={{width:i===0?16:6,height:6,borderRadius:3,background:i===0?"#fff":"rgba(255,255,255,0.4)"}}/>)}
        </div>
      </div>}

      {/* ── 情境 Chip 橫向滑動 ── */}
      <div style={{padding:"12px 0 4px"}}>
        <div style={{overflowX:"auto",display:"flex",gap:8,padding:"0 16px",scrollbarWidth:"none"}}>
          {CHIPS.map(chip=>(
            <button key={chip.id} onClick={()=>{setActiveChip(chip.id);setTab("explore");}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 14px",borderRadius:16,border:"1.5px solid #eee",background:"#fff",cursor:"pointer",minWidth:60}}>
              <span style={{fontSize:22}}>{chip.icon}</span>
              <span style={{fontSize:11,color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 半天行程推薦 ── */}
      <Section title="🗓️ 半天行程靈感" action="更多" onAction={()=>setTab("explore")}>
        <div style={{display:"grid",gap:8,padding:"0 16px"}}>
          {HOT_SPOTS.slice(0,3).map((s,i)=>(
            <div key={s.id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,color:"#FF6B6B",fontSize:16,minWidth:24}}>{["09:30","12:00","14:30"][i]}</div>
              <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${getGradient(s)})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#222"}}>{s.name}</div>
                <div style={{fontSize:11,color:"#999"}}>{s.city} · {s.type==="indoor"?"室內":"戶外"}</div>
              </div>
              <Link href={`/spot/${encodeURIComponent(s.name)}`}>
                <span style={{fontSize:11,color:"#FF6B6B",fontWeight:600,cursor:"pointer"}}>詳情 ›</span>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 熱門排行榜 ── */}
      <Section title="🔥 本週熱門 TOP 5" action="查看全部" onAction={()=>setTab("explore")}>
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px",scrollbarWidth:"none"}}>
          {HOT_SPOTS.map((s,i)=>(
            <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none",flexShrink:0}}>
              <div style={{width:130,borderRadius:16,overflow:"hidden",background:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,0.08)"}}>
                <div style={{height:90,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${getGradient(s)})`}}>
                  <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                  <div style={{position:"absolute",top:8,left:8,background:"#FF6B6B",color:"#fff",fontSize:11,fontWeight:800,width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>{i+1}</div>
                </div>
                <div style={{padding:"8px 10px"}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#222",marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div style={{fontSize:11,color:"#999"}}>{s.city}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── 依年齡快速找 ── */}
      <Section title="👶 依年齡快速找" action="查看全部" onAction={()=>setTab("explore")}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,padding:"0 16px"}}>
          {[
            {label:"0–2歲",icon:"👶",color:"#FFE0E0",chip:"age02"},
            {label:"3–5歲",icon:"🎠",color:"#FFE8CC",chip:"age35"},
            {label:"6–8歲",icon:"🦖",color:"#E8F5E9",chip:"age68"},
            {label:"9–12歲",icon:"🏄",color:"#E3F2FD",chip:"age912"},
          ].map(a=>(
            <button key={a.chip} onClick={()=>{setActiveChip(a.chip);setTab("explore");}} style={{background:a.color,border:"none",borderRadius:14,padding:"12px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <span style={{fontSize:24}}>{a.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#333"}}>{a.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── 季節推薦 ── */}
      <Section title={seasonInfo.label} action="">
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px",scrollbarWidth:"none"}}>
          {SPOTS.filter(s=>s.tags.includes(seasonInfo.tag)).slice(0,8).map(s=>(
            <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none",flexShrink:0}}>
              <div style={{width:120,borderRadius:14,overflow:"hidden",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
                <div style={{height:80,background:`linear-gradient(135deg,${getGradient(s)})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{s.emoji}</div>
                <div style={{padding:"8px 10px"}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#222",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div style={{fontSize:10,color:"#999",marginTop:2}}>{s.city} · {s.fee}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── 探索其他縣市 ── */}
      <Section title="🗺️ 探索其他縣市" action="">
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px",scrollbarWidth:"none"}}>
          {CITIES.filter(c=>c!=="全部").map(city=>{
            const icons={"台北":"🏙️","新北":"🌆","桃園":"✈️","台中":"🎨","台南":"🏯","高雄":"🚢","宜蘭":"🌊","花蓮":"🏔️","台東":"🎈","屏東":"🏖️","嘉義市":"🌲","嘉義縣":"☕","雲林":"🌾","彰化":"🚂","南投":"🍁","苗栗":"🍓","新竹市":"🍢","新竹縣":"🌿","澎湖":"🐠","金門":"🥃","連江縣":"✨","基隆":"⚓"};
            return (
              <button key={city} onClick={()=>{setTab("explore");}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"10px 12px",borderRadius:14,border:"1.5px solid #eee",background:"#fff",cursor:"pointer",minWidth:64}}>
                <span style={{fontSize:24}}>{icons[city]||"📍"}</span>
                <span style={{fontSize:11,color:"#555",fontWeight:600}}>{city}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── 不知道去哪 巫師 ── */}
      <div style={{margin:"8px 16px 16px"}}>
        {wizardStep===0&&(
          <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:20,padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🤷</div>
            <div style={{color:"#fff",fontWeight:800,fontSize:16,marginBottom:4}}>不知道去哪？</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,marginBottom:16}}>回答4個問題，讓我幫你挑！</div>
            <button onClick={()=>setWizardStep(1)} style={{background:"#fff",color:"#667eea",border:"none",borderRadius:20,padding:"10px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>幫我推薦 →</button>
          </div>
        )}
        {wizardStep>0&&wizardStep<99&&(
          <div style={{background:"#fff",borderRadius:20,padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:12,color:"#aaa",marginBottom:4}}>問題 {wizardStep}/{WIZARD.length}</div>
            <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:16}}>{WIZARD[wizardStep-1].q}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {WIZARD[wizardStep-1].opts.map(opt=>{
                const keys=["weather","age","budget","type"];
                return (
                  <button key={opt.val} onClick={()=>{
                    const ans={...wizardAnswers,[keys[wizardStep-1]]:opt.val};
                    setWizardAnswers(ans);
                    if(wizardStep===WIZARD.length) runWizard(ans);
                    else setWizardStep(wizardStep+1);
                  }} style={{padding:"12px",borderRadius:12,border:"1.5px solid #eee",background:"#f8f9fa",fontSize:14,fontWeight:600,cursor:"pointer",color:"#333"}}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>{setWizardStep(0);setWizardAnswers({});}} style={{marginTop:12,background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer"}}>← 重新來過</button>
          </div>
        )}
        {wizardStep===99&&wizardResult.length>0&&(
          <div style={{background:"#fff",borderRadius:20,padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:4}}>🎉 幫你找到了！</div>
            <div style={{fontSize:13,color:"#aaa",marginBottom:16}}>根據你的條件推薦 3 個景點</div>
            <div style={{display:"grid",gap:10}}>
              {wizardResult.map(s=>(
                <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center",padding:"10px",background:"#f8f9fa",borderRadius:12}}>
                    <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${getGradient(s)})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.emoji}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#222"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"#999"}}>{s.city} · {s.fee} · {s.type==="indoor"?"室內":"戶外"}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={()=>{setWizardStep(0);setWizardAnswers({});setWizardResult([]);}} style={{marginTop:12,width:"100%",padding:"10px",border:"1.5px solid #eee",borderRadius:12,background:"none",fontSize:13,color:"#666",cursor:"pointer"}}>重新推薦</button>
          </div>
        )}
      </div>

      {/* 推薦景點浮動 */}
      <a href="https://forms.gle/AvoceS4azn5uFAB68" target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:84,right:16,zIndex:998,background:"linear-gradient(135deg,#FF6B6B,#ffa94d)",color:"#fff",textDecoration:"none",padding:"10px 16px",borderRadius:24,fontSize:12,fontWeight:700,boxShadow:"0 4px 16px rgba(255,107,107,0.45)"}}>
        ➕ 推薦景點
      </a>
    </div>
  );
}

// ════════════════════════════════════════
// 探索頁
// ════════════════════════════════════════
function ExplorePage({favSet,visited,itinerary,toggleFav,toggleVisited,addItinerary,activeChip,setActiveChip,activeCity,setActiveCity,search,setSearch,exploreList,setShowItinerary,showItinerary,removeItinerary,shareList}) {
  const [showCityPicker,setShowCityPicker]=useState(false);
  return (
    <div>
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:10}}>🔍 探索景點</div>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋景點、地區..."
            style={{width:"100%",boxSizing:"border-box",padding:"10px 12px 10px 36px",borderRadius:12,border:"1.5px solid #eee",fontSize:14,background:"#f8f9fa",outline:"none"}}/>
        </div>
        {/* Chips */}
        <div style={{overflowX:"auto",display:"flex",gap:6,scrollbarWidth:"none",marginBottom:8}}>
          <button onClick={()=>setActiveChip(null)} style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${!activeChip?"#FF6B6B":"#eee"}`,background:!activeChip?"#FF6B6B":"#fff",color:!activeChip?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>全部</button>
          {CHIPS.map(c=>(
            <button key={c.id} onClick={()=>setActiveChip(c.id===activeChip?null:c.id)} style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${activeChip===c.id?"#FF6B6B":"#eee"}`,background:activeChip===c.id?"#FF6B6B":"#fff",color:activeChip===c.id?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        {/* 縣市 */}
        <button onClick={()=>setShowCityPicker(!showCityPicker)} style={{width:"100%",padding:"8px 14px",borderRadius:12,border:"1.5px solid #eee",background:"#f8f9fa",color:"#555",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between"}}>
          <span>📍 {activeCity==="全部"?"全部縣市":activeCity}</span><span>{showCityPicker?"▲":"▼"}</span>
        </button>
        {showCityPicker&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 0 4px"}}>
            {["全部",...CITIES.filter(c=>c!=="全部")].map(c=>(
              <button key={c} onClick={()=>{setActiveCity(c);setShowCityPicker(false);}} style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${activeCity===c?"#FF6B6B":"#eee"}`,background:activeCity===c?"#FF6B6B":"#fff",color:activeCity===c?"#fff":"#666",fontSize:12,fontWeight:activeCity===c?700:400,cursor:"pointer"}}>{c}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:"8px 16px 4px",fontSize:12,color:"#aaa"}}>共 <b style={{color:"#FF6B6B"}}>{exploreList.length}</b> 個景點</div>
      <div style={{padding:"0 16px",display:"grid",gap:10}}>
        {exploreList.length===0&&<div style={{textAlign:"center",padding:40,color:"#bbb"}}><div style={{fontSize:48}}>🏜️</div>沒有符合的景點</div>}
        {exploreList.map(spot=>(
          <SpotCard key={spot.id} spot={spot} isFav={favSet.has(spot.id)} isVisited={visited.has(spot.id)} inItinerary={itinerary.some(s=>s.id===spot.id)} onFav={()=>toggleFav(spot.id)} onVisit={()=>toggleVisited(spot.id)} onAddItinerary={()=>addItinerary(spot)}/>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 收藏頁
// ════════════════════════════════════════
function FavoritesPage({favSet,visited,itinerary,toggleFav,toggleVisited,addItinerary,shareList,setShowItinerary}) {
  const favSpots=SPOTS.filter(s=>favSet.has(s.id));
  return (
    <div>
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:800,fontSize:16,color:"#333"}}>❤️ 我的收藏 ({favSpots.length})</div>
          <div style={{display:"flex",gap:8}}>
            {itinerary.length>0&&<button onClick={()=>setShowItinerary(true)} style={{background:"#FF6B6B",color:"#fff",border:"none",borderRadius:16,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🗓️ {itinerary.length}</button>}
            <button onClick={shareList} style={{background:"none",border:"1.5px solid #eee",borderRadius:16,padding:"5px 12px",fontSize:12,color:"#666",cursor:"pointer"}}>📤 分享</button>
          </div>
        </div>
      </div>
      <div style={{padding:"12px 16px",display:"grid",gap:10}}>
        {favSpots.length===0&&<div style={{textAlign:"center",padding:40,color:"#bbb"}}><div style={{fontSize:48}}>💔</div><div>還沒有收藏任何景點</div><div style={{fontSize:12,marginTop:8}}>點景點卡片上的 ❤️ 收藏吧</div></div>}
        {favSpots.map(spot=>(
          <SpotCard key={spot.id} spot={spot} isFav={true} isVisited={visited.has(spot.id)} inItinerary={itinerary.some(s=>s.id===spot.id)} onFav={()=>toggleFav(spot.id)} onVisit={()=>toggleVisited(spot.id)} onAddItinerary={()=>addItinerary(spot)}/>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 附近頁
// ════════════════════════════════════════
function NearbyPage({nearbyList,gpsCoords,gpsLoading,findNearby,favSet,toggleFav,addItinerary}) {
  return (
    <div>
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0"}}>
        <div style={{fontWeight:800,fontSize:16,color:"#333"}}>📍 附近景點</div>
        {gpsCoords&&<div style={{fontSize:12,color:"#aaa",marginTop:2}}>依距離排序 · 共 {nearbyList.length} 個</div>}
      </div>
      {gpsLoading&&<div style={{textAlign:"center",padding:40,color:"#888"}}>📍 正在取得你的位置...</div>}
      {!gpsCoords&&!gpsLoading&&(
        <div style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:48,marginBottom:12}}>📍</div>
          <div style={{fontWeight:700,fontSize:16,color:"#333",marginBottom:8}}>找附近的親子景點</div>
          <div style={{fontSize:13,color:"#888",marginBottom:20}}>開啟定位，立刻找到你附近的好去處</div>
          <button onClick={findNearby} style={{background:"#FF6B6B",color:"#fff",border:"none",borderRadius:20,padding:"12px 32px",fontSize:15,fontWeight:700,cursor:"pointer"}}>📍 開啟定位</button>
        </div>
      )}
      {nearbyList.length===0&&gpsCoords&&<div style={{textAlign:"center",padding:40,color:"#bbb"}}>附近暫無景點資料<br/><span style={{fontSize:12}}>（景點座標資料持續更新中）</span></div>}
      <div style={{padding:"8px 16px",display:"grid",gap:10}}>
        {nearbyList.map(spot=>(
          <div key={spot.id} style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:"1px solid #f0e6d3"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:14,background:`linear-gradient(135deg,${getGradient(spot)})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{spot.emoji}</div>
              <div style={{flex:1}}>
                <Link href={`/spot/${encodeURIComponent(spot.name)}`} style={{textDecoration:"none"}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#222"}}>{spot.name}</div>
                </Link>
                <div style={{fontSize:12,color:"#999"}}>{spot.city} · {spot.district}</div>
                <div style={{fontSize:12,color:"#FF6B6B",fontWeight:600,marginTop:2}}>📍 距離 {spot.distance.toFixed(1)} km</div>
              </div>
              <button onClick={()=>toggleFav(spot.id)} style={{background:"none",border:"1.5px solid #eee",borderRadius:20,width:34,height:34,cursor:"pointer",fontSize:16}}>{favSet.has(spot.id)?"❤️":"🤍"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 我的頁
// ════════════════════════════════════════
function MePage({favSet,visited,itinerary,shareList,setShowItinerary,setTab}) {
  return (
    <div>
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0"}}>
        <div style={{fontWeight:800,fontSize:16,color:"#333"}}>👤 我的</div>
      </div>
      <div style={{padding:16,display:"grid",gap:10}}>
        {/* 統計 */}
        <div style={{background:"linear-gradient(135deg,#FF6B6B,#ffa94d)",borderRadius:20,padding:20,color:"#fff"}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>GoKids Outing</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
            {[{icon:"❤️",count:favSet.size,label:"收藏"},{icon:"✅",count:visited.size,label:"去過"},{icon:"🗓️",count:itinerary.length,label:"行程"}].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"10px 4px"}}>
                <div style={{fontSize:20}}>{s.icon}</div>
                <div style={{fontWeight:800,fontSize:18}}>{s.count}</div>
                <div style={{fontSize:11,opacity:0.85}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 功能列表 */}
        {[
          {icon:"❤️",label:"我的收藏",sub:`${favSet.size} 個景點`,action:()=>setTab("favorites")},
          {icon:"✅",label:"去過的地方",sub:`${visited.size} 個景點`,action:()=>setTab("favorites")},
          {icon:"🗓️",label:"我的行程",sub:`${itinerary.length} 個景點`,action:()=>setShowItinerary(true)},
          {icon:"📤",label:"分享收藏清單",sub:"傳給另一半",action:shareList},
          {icon:"🚩",label:"回報資訊有誤",sub:"幫我們修正錯誤",action:()=>window.open("https://forms.gle/LMXGKFgj66edWcyg7","_blank")},
          {icon:"➕",label:"推薦新景點",sub:"分享你知道的好地方",action:()=>window.open("https://forms.gle/AvoceS4azn5uFAB68","_blank")},
        ].map(item=>(
          <button key={item.label} onClick={item.action} style={{background:"#fff",border:"none",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
            <span style={{fontSize:22,width:36,textAlign:"center"}}>{item.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:"#333"}}>{item.label}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{item.sub}</div>
            </div>
            <span style={{color:"#ccc",fontSize:18}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 景點卡片
// ════════════════════════════════════════
function SpotCard({spot,isFav,isVisited,inItinerary,onFav,onVisit,onAddItinerary}) {
  const status=parseOpenStatus(spot.hours,spot.closed);
  const feeColor=spot.fee==="免費"?"#40c057":spot.fee==="付費"?"#ffa94d":"#da77f2";
  return (
    <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:isVisited?"1.5px solid #b2f2bb":"1.5px solid #f0f0f0"}}>
      {/* 圖片區 */}
      <div style={{height:120,background:`linear-gradient(135deg,${getGradient(spot)})`,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>
        {spot.emoji}
        {isVisited&&<div style={{position:"absolute",top:10,right:10,background:"#40c057",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>✅ 去過了</div>}
        <button onClick={onFav} style={{position:"absolute",top:10,left:10,background:"rgba(255,255,255,0.3)",border:"none",borderRadius:20,width:32,height:32,cursor:"pointer",fontSize:16,backdropFilter:"blur(4px)"}}>
          {isFav?"❤️":"🤍"}
        </button>
        <div style={{position:"absolute",bottom:10,right:10,display:"flex",gap:6}}>
          <span style={{background:"rgba(0,0,0,0.4)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10,backdropFilter:"blur(4px)"}}>{spot.type==="indoor"?"❄️ 室內":"🌳 戶外"}</span>
          <span style={{background:feeColor+"cc",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10}}>{spot.fee}</span>
        </div>
      </div>
      {/* 內容區 */}
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <Link href={`/spot/${encodeURIComponent(spot.name)}`} style={{textDecoration:"none",flex:1}}>
            <div style={{fontWeight:800,fontSize:16,color:"#222",lineHeight:1.3}}>{spot.name}</div>
          </Link>
        </div>
        <div style={{fontSize:12,color:"#999",marginBottom:6}}>📍 {spot.city} · {spot.district}</div>
        {status&&(
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize:12,color:"#666"}}>🕐 {status.label}</span>
            {status.open===true&&!isTodayClosed(spot.closed)&&<span style={{fontSize:10,background:"#d3f9d8",color:"#2f9e44",padding:"1px 7px",borderRadius:6,fontWeight:700}}>營業中</span>}
            {status.open===false&&isTodayClosed(spot.closed)&&<span style={{fontSize:10,background:"#ffe3e3",color:"#c92a2a",padding:"1px 7px",borderRadius:6,fontWeight:700}}>今日公休</span>}
            {status.open===false&&!isTodayClosed(spot.closed)&&<span style={{fontSize:10,background:"#ffe8cc",color:"#e8590c",padding:"1px 7px",borderRadius:6,fontWeight:700}}>已關閉</span>}
          </div>
        )}
        <div style={{fontSize:13,color:"#555",lineHeight:1.5,marginBottom:10}}>{spot.desc}</div>
        {/* 標籤 */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {spot.tags.slice(0,3).map(t=><span key={t} style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#f5f5f5",color:"#666"}}>{t}</span>)}
          <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#f5f5f5",color:"#666"}}>👶 {spot.age}</span>
        </div>
        {/* 訂票 */}
        {(spot.kkday||spot.klook)&&(
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {spot.kkday&&<a href={`https://www.kkday.com/zh-tw/product/productlist?keyword=${encodeURIComponent(spot.kkday)}&cid=25539`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"7px",borderRadius:10,textDecoration:"none",background:"linear-gradient(135deg,#ff6b35,#ff4500)",color:"#fff",fontSize:12,fontWeight:700}}>🎫 KKday 查看票價</a>}
            {spot.klook&&<a href={`https://www.klook.com/zh-TW/search/?query=${encodeURIComponent(spot.klook)}&aid=124818`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"7px",borderRadius:10,textDecoration:"none",background:"linear-gradient(135deg,#e91e8c,#c2185b)",color:"#fff",fontSize:12,fontWeight:700}}>🎟️ Klook 查看票價</a>}
          </div>
        )}
        {/* 操作按鈕 */}
        <div style={{display:"flex",gap:6}}>
          <button onClick={onVisit} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${isVisited?"#40c057":"#eee"}`,background:isVisited?"#ebfbee":"#f8f9fa",color:isVisited?"#40c057":"#888",fontSize:12,fontWeight:600,cursor:"pointer"}}>{isVisited?"✅ 去過了":"📍 標記去過"}</button>
          <button onClick={onAddItinerary} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${inItinerary?"#7950f2":"#eee"}`,background:inItinerary?"#f3f0ff":"#f8f9fa",color:inItinerary?"#7950f2":"#888",fontSize:12,fontWeight:600,cursor:"pointer"}}>{inItinerary?"🗓️ 已加入":"➕ 加行程"}</button>
          <a href={`https://forms.gle/LMXGKFgj66edWcyg7?usp=pp_url&entry.景點=${encodeURIComponent(spot.name)}`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"7px",borderRadius:10,textDecoration:"none",background:"#f8f9fa",border:"1.5px solid #eee",fontSize:12,fontWeight:600,color:"#aaa"}}>🚩 回報</a>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 行程面板
// ════════════════════════════════════════
function ItineraryPanel({itinerary,removeItinerary,onClose,shareItinerary}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"75vh",overflow:"auto",padding:"20px 16px 40px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:"#eee",borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:16}}>🗓️ 我的行程（{itinerary.length} 個景點）</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}}>×</button>
        </div>
        {itinerary.length===0?(
          <div style={{textAlign:"center",padding:"30px",color:"#bbb"}}>還沒有加入任何景點<br/>點景點卡片上的「加行程」</div>
        ):(
          <>
            <div style={{display:"grid",gap:8,marginBottom:16}}>
              {itinerary.map((s,i)=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,background:"#f8f9fa",borderRadius:12,padding:"10px 12px"}}>
                  <span style={{fontWeight:800,color:"#FF6B6B",fontSize:14,minWidth:20}}>{i+1}</span>
                  <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${getGradient(s)})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                    <div style={{fontSize:11,color:"#999"}}>{s.city} · {s.type==="indoor"?"室內":"戶外"}</div>
                  </div>
                  <button onClick={()=>removeItinerary(s.id)} style={{background:"none",border:"none",color:"#ccc",fontSize:18,cursor:"pointer"}}>×</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={shareItinerary} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#FF6B6B,#ffa94d)",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>📤 分享行程</button>
              <button onClick={()=>{ if(confirm("確定清空行程？")){itinerary.forEach(s=>removeItinerary(s.id));}}} style={{padding:"12px 16px",background:"#f1f3f5",color:"#868e96",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>清空</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// Section wrapper
// ════════════════════════════════════════
function Section({title,action,onAction,children}) {
  return (
    <div style={{margin:"16px 0 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px",marginBottom:10}}>
        <div style={{fontWeight:800,fontSize:15,color:"#222"}}>{title}</div>
        {action&&<button onClick={onAction} style={{background:"none",border:"none",fontSize:12,color:"#FF6B6B",fontWeight:600,cursor:"pointer"}}>{action} ›</button>}
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════
// 底部導航
// ════════════════════════════════════════
function BottomNav({tab,setTab,itinerary,setShowItinerary}) {
  const items=[
    {id:"home",icon:"🏠",label:"首頁"},
    {id:"explore",icon:"🔍",label:"探索"},
    {id:"favorites",icon:"❤️",label:"收藏"},
    {id:"nearby",icon:"📍",label:"附近"},
    {id:"me",icon:"👤",label:"我的"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #f0f0f0",display:"flex",zIndex:999,boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:"8px 4px 10px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:22}}>{item.icon}</span>
          <span style={{fontSize:10,fontWeight:tab===item.id?700:400,color:tab===item.id?"#FF6B6B":"#aaa"}}>{item.label}</span>
          {tab===item.id&&<div style={{width:20,height:3,background:"#FF6B6B",borderRadius:2,marginTop:1}}/>}
        </button>
      ))}
    </div>
  );
}
