import Head from "next/head";
import Link from "next/link";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>隱私權條款 | 假日遛小孩</title>
        <meta name="description" content="假日遛小孩隱私權條款與使用政策" />
        <link rel="canonical" href="https://gokidsouting.com/privacy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{maxWidth:480,margin:"0 auto",background:"#fff",minHeight:"100vh",fontFamily:"'Noto Sans TC',sans-serif"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#FF6B6B,#ffa94d)",padding:"16px 16px 20px"}}>
          <Link href="/" style={{color:"rgba(255,255,255,0.85)",fontSize:13,display:"flex",alignItems:"center",gap:6,marginBottom:12,textDecoration:"none"}}>
            ← 回首頁
          </Link>
          <h1 style={{color:"#fff",fontWeight:800,fontSize:20,margin:0}}>隱私權條款</h1>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:4}}>最後更新：2025 年 1 月</div>
        </div>

        {/* 內容 */}
        <div style={{padding:"20px 16px 40px"}}>
          {[
            {
              title:"一、關於本網站",
              content:"假日遛小孩（gokidsouting.com）是一個親子景點資訊平台，提供全台 22 縣市景點資訊、篩選與行程規劃等功能，協助家長快速做出出遊決策。本網站由個人經營，非法人組織。"
            },
            {
              title:"二、資料收集說明",
              content:"本網站收集以下資訊：\n\n• 使用者行為數據：透過 Google Analytics 收集匿名的瀏覽行為資料，包含頁面瀏覽次數、使用裝置類型、來源管道等，用於改善網站內容與功能。\n\n• GPS 定位資訊：當您使用「附近景點」功能時，本網站會請求您的裝置定位權限。定位資料僅在您的裝置本地使用，計算附近景點距離，不會傳送至伺服器或儲存。\n\n• 本地儲存資料：收藏、去過紀錄、行程規劃等個人化功能，資料儲存於您的瀏覽器 localStorage，不會上傳至任何伺服器。清除瀏覽器資料即可完全刪除。"
            },
            {
              title:"三、Cookie 使用",
              content:"本網站使用 Google Analytics 的 Cookie 進行匿名流量分析。這些 Cookie 不包含任何個人識別資訊。您可以透過瀏覽器設定拒絕 Cookie，但這可能影響部分功能的正常運作。"
            },
            {
              title:"四、聯盟行銷聲明",
              content:"本網站部分景點連結含有 KKday（聯盟編號：cid=25539）及 Klook（聯盟編號：aid=124818）的聯盟行銷連結。當您透過這些連結完成購票，本站可能獲得少許佣金，不影響您支付的票價。本站僅推薦認為對親子出遊有幫助的景點，聯盟合作不影響景點資訊的客觀性。"
            },
            {
              title:"五、第三方服務",
              content:"本網站使用以下第三方服務：\n\n• Google Analytics：用於分析網站流量與使用行為\n• Google Maps：用於景點頁面地圖顯示\n• Lorem Picsum：用於景點示意圖片（免費授權）\n• KKday / Klook：訂票連結（聯盟合作）\n\n各第三方服務均有其獨立的隱私權政策，使用時請一併參閱。"
            },
            {
              title:"六、資訊安全",
              content:"本網站採用 HTTPS 加密傳輸，由 Vercel 平台托管，具備業界標準的安全防護。本網站不儲存任何用戶帳號資訊或支付資料。"
            },
            {
              title:"七、兒童隱私",
              content:"本網站為親子景點資訊平台，主要使用者為成年家長。本網站不主動收集 13 歲以下兒童的個人資料。如發現有兒童提供個人資訊，請聯絡我們予以刪除。"
            },
            {
              title:"八、條款更新",
              content:"本隱私權條款可能不定期修訂。修訂後的條款將在本頁面公告，繼續使用本網站即表示您接受修訂後的條款。"
            },
            {
              title:"九、聯絡我們",
              content:"若您對本隱私權條款有任何疑問，或需要回報景點資訊錯誤，歡迎透過以下方式聯絡：\n\n• 回報資訊有誤：使用各景點頁面的「🚩 回報」按鈕\n• 推薦新景點：使用首頁「➕ 推薦景點」按鈕\n\n本站會盡快回應您的意見。"
            },
          ].map((section,i)=>(
            <div key={i} style={{marginBottom:24}}>
              <h2 style={{fontSize:15,fontWeight:800,color:"#222",marginBottom:10}}>{section.title}</h2>
              <div style={{fontSize:13,color:"#555",lineHeight:1.85,whiteSpace:"pre-line"}}>{section.content}</div>
            </div>
          ))}

          <div style={{borderTop:"1px solid #eee",paddingTop:20,textAlign:"center"}}>
            <Link href="/" style={{display:"inline-block",background:"linear-gradient(135deg,#FF6B6B,#ffa94d)",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:13,fontWeight:700,textDecoration:"none"}}>
              回首頁
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
