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
  // 有真實照片優先用
  if (spot.photo) return spot.photo;
  // 否則用 Picsum 佔位圖
  return `https://picsum.photos/seed/${spot.id}/400/300`;
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
    { q:"你在哪個地區？", key:"region", opts:[
      {label:"📍 北部",val:"north"},
      {label:"📍 中部",val:"central"},
      {label:"📍 南部",val:"south"},
      {label:"📍 東部",val:"east"},
      {label:"🏝️ 離島",val:"island"},
      {label:"🌏 全台都可",val:"all"},
    ]},
    { q:"今天天氣？", key:"weather", opts:[{label:"☀️ 天氣好",val:"sunny"},{label:"🌧️ 下雨天",val:"rainy"}] },
    { q:"孩子幾歲？", key:"age", opts:[{label:"👶 0–2歲",val:"02"},{label:"🎠 3–5歲",val:"35"},{label:"🦖 6–8歲",val:"68"},{label:"🏄 9–12歲",val:"912"}] },
    { q:"預算？", key:"budget", opts:[{label:"🆓 免費",val:"free"},{label:"💰 付費都可",val:"paid"}] },
    { q:"偏好類型？", key:"type", opts:[{label:"🎢 遊樂刺激",val:"fun"},{label:"🌿 自然輕鬆",val:"nature"},{label:"📚 學習教育",val:"edu"},{label:"🍜 美食文化",val:"food"}] },
  ];

  const REGION_CITIES = {
    north:   ["台北","新北","桃園","基隆","新竹市","新竹縣"],
    central: ["台中","苗栗","彰化","南投","雲林"],
    south:   ["台南","高雄","嘉義市","嘉義縣","屏東"],
    east:    ["宜蘭","花蓮","台東"],
    island:  ["澎湖","金門","連江縣"],
    all:     [],
  };

  const runWizard = ans => {
    let list = [...SPOTS];
    // 地區篩選
    if(ans.region && ans.region !== "all") {
      const cities = REGION_CITIES[ans.region] || [];
      if(cities.length > 0) list = list.filter(s => cities.includes(s.city));
    }
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
    // fallback：結果不足時放寬年齡和類型限制，保留地區+天氣+預算
    if(list.length < 3) {
      let fallback = [...SPOTS];
      if(ans.region && ans.region !== "all") {
        const cities = REGION_CITIES[ans.region] || [];
        if(cities.length > 0) fallback = fallback.filter(s => cities.includes(s.city));
      }
      if(ans.weather==="rainy") fallback=fallback.filter(s=>s.type==="indoor");
      if(ans.budget==="free") fallback=fallback.filter(s=>s.fee==="免費");
      list = fallback;
    }
    // 最後保險
    if(list.length === 0) list = [...SPOTS];
    list = list.sort(()=>Math.random()-0.5).slice(0,3);
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

      <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:"'Noto Sans TC',sans-serif",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:72,overflowX:"hidden"}}>

        {/* Toast */}
        {shareToast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#2f9e44",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{shareToast}</div>}

        {/* ── 首頁 ── */}
        {tab==="home" && <HomePage
          favSet={favSet} visited={visited} itinerary={itinerary}
          toggleFav={toggleFav} toggleVisited={toggleVisited} addItinerary={addItinerary}
          showItinerary={showItinerary} setShowItinerary={setShowItinerary}
          removeItinerary={removeItinerary} shareList={shareList}
          setTab={setTab} findNearby={findNearby} gpsLoading={gpsLoading}
          gpsCoords={gpsCoords}
          season={season} seasonInfo={seasonInfo}
          wizardStep={wizardStep} setWizardStep={setWizardStep}
          wizardAnswers={wizardAnswers} setWizardAnswers={setWizardAnswers}
          wizardResult={wizardResult} runWizard={runWizard} WIZARD={WIZARD}
          setActiveChip={setActiveChip} setSearch={setSearch}
          setActiveCity={setActiveCity}
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
// 今日推薦邏輯
// ════════════════════════════════════════
function getTodayRecs(favSet, visited, gpsCoords) {
  const hour = new Date().getHours();
  const isHot = hour >= 10 && hour <= 15;
  const isEvening = hour >= 17;
  const isMorning = hour >= 6 && hour < 10;

  // 排除去過的
  let pool = SPOTS.filter(s => !visited.has(s.id));

  // 若有 GPS，先抓附近縣市（有座標的）
  let nearbyCity = null;
  if (gpsCoords) {
    const nearest = SPOTS.filter(s=>s.lat&&s.lng)
      .map(s=>({city:s.city, d: Math.abs(s.lat-gpsCoords.lat)+Math.abs(s.lng-gpsCoords.lng)}))
      .sort((a,b)=>a.d-b.d)[0];
    if (nearest) nearbyCity = nearest.city;
  }

  // 三個推薦區塊
  const blocks = [];

  // 區塊一：天氣/時段推薦
  if (isHot) {
    const indoor = pool.filter(s=>s.type==="indoor").sort(()=>Math.random()-0.5).slice(0,5);
    if (indoor.length) blocks.push({ title:"☔ 大熱天推薦室內景點", subtitle:"冷氣吹到飽，放電不流汗", spots: indoor });
  } else if (isEvening) {
    const night = pool.filter(s=>s.tags.some(t=>["夜市","美食","文化"].includes(t))).sort(()=>Math.random()-0.5).slice(0,5);
    if (night.length) blocks.push({ title:"🌙 傍晚好去處", subtitle:"下班後帶孩子散散步", spots: night });
  } else if (isMorning) {
    const outdoor = pool.filter(s=>s.type==="outdoor"&&s.fee==="免費").sort(()=>Math.random()-0.5).slice(0,5);
    if (outdoor.length) blocks.push({ title:"🌅 早晨戶外好空氣", subtitle:"免費景點，人少又舒服", spots: outdoor });
  } else {
    const mixed = pool.sort(()=>Math.random()-0.5).slice(0,5);
    blocks.push({ title:"✨ 今日精選景點", subtitle:"為你從869個景點中挑選", spots: mixed });
  }

  // 區塊二：依附近縣市
  if (nearbyCity) {
    const nearby = pool.filter(s=>s.city===nearbyCity&&!blocks[0]?.spots.find(b=>b.id===s.id)).sort(()=>Math.random()-0.5).slice(0,5);
    if (nearby.length) blocks.push({ title:`📍 ${nearbyCity}附近景點`, subtitle:"距離你最近的好去處", spots: nearby });
  }

  // 區塊三：免費親子
  const free = pool.filter(s=>s.fee==="免費"&&s.tags.some(t=>["自然","公園","散步","步道"].includes(t))).sort(()=>Math.random()-0.5).slice(0,5);
  if (free.length) blocks.push({ title:"🆓 免費親子好去處", subtitle:"不花錢也能玩得很開心", spots: free });

  return blocks;
}

// ════════════════════════════════════════
// 首頁
// ════════════════════════════════════════
function HomePage({favSet,visited,itinerary,toggleFav,toggleVisited,addItinerary,showItinerary,setShowItinerary,removeItinerary,shareList,setTab,findNearby,gpsLoading,gpsCoords,season,seasonInfo,wizardStep,setWizardStep,wizardAnswers,setWizardAnswers,wizardResult,runWizard,WIZARD,setActiveChip,setSearch,setActiveCity}) {
  const hour = new Date().getHours();
  const greeting = hour<6?"深夜了，明天再帶孩子出門？":hour<12?"早安！今天帶孩子去哪？":hour<18?"下午好！找個地方遛小孩？":"傍晚了，附近有什麼好玩的？";
  const todayRecs = getTodayRecs(favSet, visited, gpsCoords);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{background:"#fff",padding:"16px 16px 12px",boxShadow:"0 1px 0 #f0f0f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src="/logo-40.png" alt="假日遛小孩" style={{width:40,height:40,borderRadius:10,flexShrink:0}}/>
            <div>
              <div style={{fontWeight:900,fontSize:18,color:"#FF6B6B",letterSpacing:-0.5}}>假日遛小孩</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:1}}>{greeting}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {itinerary.length>0&&<button onClick={()=>setShowItinerary(true)} style={{background:"#FF6B6B",color:"#fff",border:"none",borderRadius:16,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🗓️ {itinerary.length}</button>}
            <button onClick={shareList} style={{background:"none",border:"1.5px solid #eee",borderRadius:20,padding:"6px 14px",fontSize:12,color:"#666",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <span>📤</span><span>分享</span>
            </button>
          </div>
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>🔍</span>
          <input placeholder="今天想帶孩子去哪玩？" onClick={()=>setTab("explore")} readOnly
            style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:14,border:"1.5px solid #eee",fontSize:14,background:"#f8f9fa",outline:"none",cursor:"pointer",color:"#999",WebkitAppearance:"none"}}/>
        </div>
      </div>

      {/* ── Hero Carousel ── */}
      <HeroCarousel spots={HOT_SPOTS} favSet={favSet} toggleFav={toggleFav}/>

      {/* ── 情境 Chip ── */}
      <div style={{background:"#fff",marginTop:14,paddingTop:14,paddingBottom:6}}>
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px"}}>
          {CHIPS.map(chip=>(
            <button key={chip.id} onClick={()=>{setActiveChip(chip.id);setTab("explore");}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 16px",borderRadius:16,border:"1.5px solid #f0f0f0",background:"#fafafa",cursor:"pointer",minWidth:70,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <span style={{fontSize:24}}>{chip.icon}</span>
              <span style={{fontSize:11,color:"#555",fontWeight:600,whiteSpace:"nowrap"}}>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 今日推薦區塊 ── */}
      {todayRecs.map((block, bi) => (
        <Section key={bi} title={block.title} action="更多" onAction={()=>setTab("explore")}>
          <div style={{fontSize:12,color:"#aaa",padding:"0 16px",marginBottom:8}}>{block.subtitle}</div>
          <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px"}}>
            {block.spots.map(s=>(
              <div key={s.id} style={{flexShrink:0,width:150,borderRadius:16,overflow:"hidden",background:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
                <div style={{height:100,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${getGradient(s)})`}}>
                  <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                  <button onClick={()=>toggleFav(s.id)} style={{position:"absolute",top:6,right:6,background:"rgba(255,255,255,0.3)",border:"none",borderRadius:14,width:28,height:28,cursor:"pointer",fontSize:14,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {favSet.has(s.id)?"❤️":"🤍"}
                  </button>
                  <div style={{position:"absolute",bottom:6,left:8}}>
                    <span style={{background:s.fee==="免費"?"#40c057":"#ffa94d",color:"#fff",fontSize:10,padding:"1px 6px",borderRadius:8,fontWeight:700}}>{s.fee}</span>
                  </div>
                </div>
                <Link href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none"}}>
                  <div style={{padding:"8px 10px 10px"}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#222",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"#999",marginTop:2}}>{s.city} · {s.type==="indoor"?"室內":"戶外"}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Section>
      ))}

      {/* ── 半天行程靈感 ── */}
      <Section title="🗓️ 半天行程靈感" action="更多" onAction={()=>setTab("explore")}>
        <div style={{display:"grid",gap:8,padding:"0 16px"}}>
          {HOT_SPOTS.slice(0,3).map((s,i)=>(
            <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none",color:"inherit"}}>
              <div style={{background:"#f8f9fa",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontWeight:800,color:"#FF6B6B",fontSize:15,minWidth:44,flexShrink:0}}>{["09:30","12:00","14:30"][i]}</div>
                <div style={{width:44,height:44,borderRadius:12,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${getGradient(s)})`}}>
                  <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#222",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div style={{fontSize:11,color:"#999",marginTop:2}}>{s.city} · {s.type==="indoor"?"室內":"戶外"}</div>
                </div>
                <span style={{fontSize:13,color:"#FF6B6B",fontWeight:600,flexShrink:0}}>›</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── 熱門排行 ── */}
      <Section title="🔥 本週熱門 TOP 5" action="查看全部" onAction={()=>setTab("explore")}>
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px"}}>
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
        <div style={{overflowX:"auto",display:"flex",gap:10,padding:"0 16px"}}>
          {SPOTS.filter(s=>s.tags.includes(seasonInfo.tag)).slice(0,8).map(s=>(
            <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none",flexShrink:0}}>
              <div style={{width:120,borderRadius:14,overflow:"hidden",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
                <div style={{height:80,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${getGradient(s)})`}}>
                  <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                </div>
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
              <button key={city} onClick={()=>{ setActiveCity(city); setTab("explore"); }} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"10px 12px",borderRadius:14,border:"1.5px solid #eee",background:"#fff",cursor:"pointer",minWidth:64}}>
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
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,marginBottom:16}}>回答幾個問題，讓我幫你挑！</div>
            <button onClick={()=>setWizardStep(1)} style={{background:"#fff",color:"#667eea",border:"none",borderRadius:20,padding:"10px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>幫我推薦 →</button>
          </div>
        )}
        {wizardStep>0&&wizardStep<99&&(
          <div style={{background:"#fff",borderRadius:20,padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:12,color:"#aaa",marginBottom:4}}>問題 {wizardStep}/{WIZARD.length}</div>
            <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:16}}>{WIZARD[wizardStep-1].q}</div>
            <div style={{display:"grid",gridTemplateColumns:WIZARD[wizardStep-1].opts.length>4?"1fr 1fr 1fr":"1fr 1fr",gap:8}}>
              {WIZARD[wizardStep-1].opts.map(opt=>{
                const key=WIZARD[wizardStep-1].key;
                return (
                  <button key={opt.val} onClick={()=>{
                    const ans={...wizardAnswers,[key]:opt.val};
                    setWizardAnswers(ans);
                    if(wizardStep===WIZARD.length) runWizard(ans);
                    else setWizardStep(wizardStep+1);
                  }} style={{padding:"12px 8px",borderRadius:12,border:"1.5px solid #eee",background:"#f8f9fa",fontSize:13,fontWeight:600,cursor:"pointer",color:"#333",textAlign:"center"}}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>{setWizardStep(0);setWizardAnswers({});}} style={{marginTop:12,background:"none",border:"none",color:"#aaa",fontSize:12,cursor:"pointer"}}>← 重新來過</button>
          </div>
        )}
        {wizardStep===99&&(
          <div style={{background:"#fff",borderRadius:20,padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:4}}>🎉 幫你找到了！</div>
            <div style={{fontSize:13,color:"#aaa",marginBottom:16}}>{wizardResult.length>0?"根據你的條件推薦 3 個景點":"放寬條件後推薦你這些景點"}</div>
            {wizardResult.length===0?(
              <div style={{textAlign:"center",padding:"20px 0",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>🏜️</div><div style={{fontSize:13}}>找不到符合的景點</div></div>
            ):(
              <div style={{display:"grid",gap:10}}>
                {wizardResult.map(s=>(
                  <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center",padding:"10px",background:"#f8f9fa",borderRadius:12}}>
                      <div style={{width:44,height:44,borderRadius:12,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${getGradient(s)})`}}>
                        <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#222"}}>{s.name}</div>
                        <div style={{fontSize:11,color:"#999"}}>{s.city} · {s.fee} · {s.type==="indoor"?"室內":"戶外"}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <button onClick={()=>{setWizardStep(0);setWizardAnswers({});setWizardResult([]);}} style={{marginTop:12,width:"100%",padding:"10px",border:"1.5px solid #eee",borderRadius:12,background:"none",fontSize:13,color:"#666",cursor:"pointer"}}>重新推薦</button>
          </div>
        )}
      </div>

      {/* 推薦景點浮動按鈕 */}
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
// 地區定義
const REGIONS = [
  { id:"north",  label:"北部", icon:"🏙️", color:"#e7f5ff", border:"#74c0fc", cities:["台北","新北","桃園","基隆","新竹市","新竹縣"] },
  { id:"central",label:"中部", icon:"🌄", color:"#fff9db", border:"#ffd43b", cities:["台中","苗栗","彰化","南投","雲林"] },
  { id:"south",  label:"南部", icon:"☀️", color:"#fff3e0", border:"#ffa94d", cities:["台南","高雄","嘉義市","嘉義縣","屏東"] },
  { id:"east",   label:"東部", icon:"🏔️", color:"#ebfbee", border:"#69db7c", cities:["宜蘭","花蓮","台東"] },
  { id:"island", label:"離島", icon:"🏝️", color:"#f3f0ff", border:"#9775fa", cities:["澎湖","金門","連江縣"] },
];

function ExplorePage({favSet,visited,itinerary,toggleFav,toggleVisited,addItinerary,activeChip,setActiveChip,activeCity,setActiveCity,search,setSearch,exploreList,setShowItinerary,showItinerary,removeItinerary,shareList}) {
  const [activeRegion, setActiveRegion] = useState(null); // null = 顯示地區選擇
  const [showCityPicker, setShowCityPicker] = useState(false);

  // 判斷目前選的縣市屬於哪個地區
  const currentRegion = activeCity !== "全部"
    ? REGIONS.find(r => r.cities.includes(activeCity))
    : activeRegion ? REGIONS.find(r => r.id === activeRegion) : null;

  // 選地區後顯示該地區熱門景點
  const regionSpots = currentRegion
    ? SPOTS.filter(s => currentRegion.cities.includes(s.city)).sort(() => Math.random() - 0.5).slice(0, 5)
    : [];

  const handleRegionClick = (region) => {
    setActiveRegion(region.id);
    setActiveCity("全部"); // 先不鎖縣市，讓用戶再選
  };

  const handleCityFromRegion = (city) => {
    setActiveCity(city);
    setShowCityPicker(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{background:"#fff",padding:"14px 16px 10px",boxShadow:"0 1px 0 #f0f0f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontWeight:800,fontSize:16,color:"#333",marginBottom:10}}>🔍 探索景點</div>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋景點、地區..."
            style={{width:"100%",boxSizing:"border-box",padding:"10px 12px 10px 36px",borderRadius:12,border:"1.5px solid #eee",fontSize:14,background:"#f8f9fa",outline:"none"}}/>
        </div>
        {/* 情境 Chips */}
        <div style={{overflowX:"auto",display:"flex",gap:6,marginBottom:8}}>
          <button onClick={()=>setActiveChip(null)} style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${!activeChip?"#FF6B6B":"#eee"}`,background:!activeChip?"#FF6B6B":"#fff",color:!activeChip?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>全部</button>
          {CHIPS.map(c=>(
            <button key={c.id} onClick={()=>setActiveChip(c.id===activeChip?null:c.id)} style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${activeChip===c.id?"#FF6B6B":"#eee"}`,background:activeChip===c.id?"#FF6B6B":"#fff",color:activeChip===c.id?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 地區選擇 */}
      {!search && (
        <div style={{background:"#fff",marginBottom:10,padding:"14px 16px"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#333",marginBottom:10}}>📍 依地區找景點</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {REGIONS.map(r=>(
              <button key={r.id} onClick={()=>handleRegionClick(r)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:14,border:`1.5px solid ${activeRegion===r.id?r.border:"#eee"}`,background:activeRegion===r.id?r.color:"#fafafa",cursor:"pointer",transition:"all 0.15s"}}>
                <span style={{fontSize:22}}>{r.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:activeRegion===r.id?"#333":"#666"}}>{r.label}</span>
              </button>
            ))}
          </div>

          {/* 選地區後顯示縣市 */}
          {activeRegion && (
            <div style={{marginTop:12}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                <button onClick={()=>setActiveCity("全部")} style={{padding:"4px 14px",borderRadius:20,border:`1.5px solid ${activeCity==="全部"?"#FF6B6B":"#eee"}`,background:activeCity==="全部"?"#FF6B6B":"#fff",color:activeCity==="全部"?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>全部{REGIONS.find(r=>r.id===activeRegion)?.label}</button>
                {REGIONS.find(r=>r.id===activeRegion)?.cities.map(city=>(
                  <button key={city} onClick={()=>handleCityFromRegion(city)}
                    style={{padding:"4px 14px",borderRadius:20,border:`1.5px solid ${activeCity===city?"#FF6B6B":"#eee"}`,background:activeCity===city?"#FF6B6B":"#fff",color:activeCity===city?"#fff":"#666",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    {city}
                  </button>
                ))}
              </div>

              {/* 該地區熱門景點橫滑 */}
              {activeCity === "全部" && regionSpots.length > 0 && (
                <div>
                  <div style={{fontSize:12,color:"#aaa",marginBottom:8}}>🔥 {REGIONS.find(r=>r.id===activeRegion)?.label}熱門景點</div>
                  <div style={{overflowX:"auto",display:"flex",gap:10}}>
                    {regionSpots.map(s=>(
                      <Link key={s.id} href={`/spot/${encodeURIComponent(s.name)}`} style={{textDecoration:"none",flexShrink:0}}>
                        <div style={{width:130,borderRadius:14,overflow:"hidden",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
                          <div style={{height:80,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${getGradient(s)})`}}>
                            <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                          </div>
                          <div style={{padding:"8px 10px"}}>
                            <div style={{fontWeight:700,fontSize:12,color:"#222",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name}</div>
                            <div style={{fontSize:10,color:"#999",marginTop:2}}>{s.city} · {s.fee}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 景點數量 */}
      <div style={{padding:"4px 16px 8px",fontSize:12,color:"#aaa",display:"flex",alignItems:"center",gap:6}}>
        共 <b style={{color:"#FF6B6B"}}>{exploreList.length}</b> 個景點
        {activeCity !== "全部" && <span style={{color:"#FF6B6B"}}>· {activeCity}</span>}
        {activeCity !== "全部" && (
          <button onClick={()=>{setActiveCity("全部");setActiveRegion(null);}} style={{background:"none",border:"none",color:"#aaa",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>清除</button>
        )}
      </div>

      {/* 景點卡片 */}
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
              <div style={{width:56,height:56,borderRadius:14,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${getGradient(spot)})`}}>
                <img src={getSpotImage(spot)} alt={spot.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
              </div>
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
      <div style={{height:140,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${getGradient(spot)})`}}>
        <img
          src={getSpotImage(spot)}
          alt={spot.name}
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.style.display="none";}}
          loading="lazy"
        />
        {isVisited&&<div style={{position:"absolute",top:10,right:10,background:"#40c057",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,zIndex:1}}>✅ 去過了</div>}
        <button onClick={onFav} style={{position:"absolute",top:10,left:10,background:"rgba(255,255,255,0.3)",border:"none",borderRadius:20,width:32,height:32,cursor:"pointer",fontSize:16,backdropFilter:"blur(4px)",zIndex:1}}>
          {isFav?"❤️":"🤍"}
        </button>
        <div style={{position:"absolute",bottom:10,right:10,display:"flex",gap:6,zIndex:1}}>
          <span style={{background:"rgba(0,0,0,0.45)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10,backdropFilter:"blur(4px)"}}>{spot.type==="indoor"?"❄️ 室內":"🌳 戶外"}</span>
          <span style={{background:feeColor+"cc",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10}}>{spot.fee}</span>
        </div>
        {/* emoji 浮在圖片上 */}
        <div style={{position:"absolute",bottom:10,left:12,fontSize:24,zIndex:1}}>{spot.emoji}</div>
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
        {/* 實用資訊列 */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {spot.duration && (
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#e7f5ff",color:"#1971c2",fontWeight:600}}>
              ⏱ {spot.duration}
            </span>
          )}
          {spot.rain === true || spot.rain === "true" ? (
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#e7f5ff",color:"#1971c2",fontWeight:600}}>☔ 雨天OK</span>
          ) : (
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#fff9db",color:"#e67700",fontWeight:600}}>☀️ 晴天佳</span>
          )}
          {spot.parking && (
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#ebfbee",color:"#2f9e44",fontWeight:600}}>
              🚗 停車{spot.parking}
            </span>
          )}
        </div>
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
                  <div style={{width:36,height:36,borderRadius:10,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${getGradient(s)})`}}>
                    <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                  </div>
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
// Hero Carousel（可滑動、可點擊進內頁）
// ════════════════════════════════════════
function HeroCarousel({spots,favSet,toggleFav}) {
  const [current,setCurrent]=useState(0);
  const startX=useRef(null);

  const handleTouchStart=e=>{ startX.current=e.touches[0].clientX; };
  const handleTouchEnd=e=>{
    if(startX.current===null) return;
    const diff=startX.current-e.changedTouches[0].clientX;
    if(Math.abs(diff)>40) {
      if(diff>0) setCurrent(c=>(c+1)%spots.length);
      else setCurrent(c=>(c-1+spots.length)%spots.length);
    }
    startX.current=null;
  };

  const s=spots[current];
  if(!s) return null;

  return (
    <div style={{margin:"14px 16px 0",borderRadius:20,overflow:"hidden",height:220,position:"relative",userSelect:"none"}}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link href={`/spot/${encodeURIComponent(s.name)}`} style={{display:"block",height:"100%",textDecoration:"none"}}>
        <img src={getSpotImage(s)} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.style.display="none";e.target.parentNode.style.background=`linear-gradient(135deg,${getGradient(s)})`;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.05) 55%)"}}>
          <div style={{position:"absolute",top:14,left:14}}>
            <span style={{background:"#FF6B6B",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20}}>🔥 本週爆紅</span>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 16px"}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:19,marginBottom:6,textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{s.name}</div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <span style={{color:"rgba(255,255,255,0.9)",fontSize:12}}>📍 {s.city}</span>
              <span style={{color:"rgba(255,255,255,0.9)",fontSize:12}}>{s.type==="indoor"?"❄️ 室內":"🌳 室外"}</span>
              <span style={{color:"rgba(255,255,255,0.9)",fontSize:12}}>{s.fee}</span>
            </div>
            <span style={{background:"#FF6B6B",color:"#fff",padding:"9px 22px",borderRadius:22,fontSize:13,fontWeight:700,display:"inline-block"}}>立即看 →</span>
          </div>
        </div>
      </Link>
      {/* 收藏按鈕（阻止冒泡避免觸發 Link） */}
      <button
        onClick={e=>{e.preventDefault();e.stopPropagation();toggleFav(s.id);}}
        style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.25)",border:"none",borderRadius:20,width:34,height:34,cursor:"pointer",fontSize:17,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}
      >{favSet.has(s.id)?"❤️":"🤍"}</button>
      {/* 圓點指示器 */}
      <div style={{position:"absolute",bottom:16,right:16,display:"flex",gap:4,zIndex:10}}>
        {spots.map((_,i)=>(
          <div key={i} onClick={e=>{e.preventDefault();setCurrent(i);}} style={{width:i===current?16:6,height:6,borderRadius:3,background:i===current?"#fff":"rgba(255,255,255,0.45)",cursor:"pointer",transition:"width 0.2s"}}/>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// Section wrapper
// ════════════════════════════════════════
function Section({title,action,onAction,children}) {
  return (
    <div style={{margin:"14px 0 0",background:"#fff",paddingTop:16,paddingBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px",marginBottom:12}}>
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
const NAV_ICONS = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?"#FF6B6B":"#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  explore: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?"#FF6B6B":"#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  favorites: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active?"#FF6B6B":"none"} stroke={active?"#FF6B6B":"#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  nearby: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?"#FF6B6B":"#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  me: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?"#FF6B6B":"#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

function BottomNav({tab,setTab,itinerary,setShowItinerary}) {
  const items=[
    {id:"home",  label:"首頁"},
    {id:"explore",label:"探索"},
    {id:"favorites",label:"收藏"},
    {id:"nearby",label:"附近"},
    {id:"me",    label:"我的"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #f0f0f0",display:"flex",zIndex:999,boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:"8px 4px 10px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          {NAV_ICONS[item.id](tab===item.id)}
          <span style={{fontSize:10,fontWeight:tab===item.id?700:400,color:tab===item.id?"#FF6B6B":"#aaa"}}>{item.label}</span>
          {tab===item.id&&<div style={{width:20,height:3,background:"#FF6B6B",borderRadius:2,marginTop:1}}/>}
        </button>
      ))}
    </div>
  );
}
