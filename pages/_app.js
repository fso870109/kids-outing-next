import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import Head from "next/head";

const GA_ID = "G-64FZBDC6TL";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag !== "undefined") {
        window.gtag("config", GA_ID, { page_path: url });
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="google-site-verification" content="KFsM4y2B9Cwdg4xgfsQP0SdH6lg52mNqvd77HSHnauc" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="假日遛小孩" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #f8f9fa; -webkit-tap-highlight-color: transparent; }
          a { color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent; }
          button { -webkit-tap-highlight-color: transparent; outline: none; }
          button:focus { outline: none; }
          a:focus { outline: none; }
          img { max-width: 100%; display: block; }
          input { -webkit-appearance: none; }
          ::-webkit-scrollbar { display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Head>

      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  // 主頁不顯示頁尾（已有底部導航）
  // 景點頁才顯示
  return (
    <footer style={{background:"#1a1a2e",color:"#aaa",padding:"28px 20px 24px",fontFamily:"'Noto Sans TC',sans-serif",fontSize:13}}>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        {/* Logo + 描述 */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <img src="/logo-40.png" alt="假日遛小孩" style={{width:32,height:32,borderRadius:8}}/>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:15}}>假日遛小孩</div>
            <div style={{fontSize:11,color:"#777",marginTop:1}}>全台親子出遊決策平台</div>
          </div>
        </div>
        <div style={{fontSize:12,color:"#666",lineHeight:1.7,marginBottom:18}}>
          整合全台 22 縣市 869 個親子景點，依天氣、年齡、預算幫家長快速做出最好的決定。
        </div>

        {/* 連結 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:20}}>
          {[
            {label:"🏠 回首頁", href:"/"},
            {label:"📋 隱私權條款", href:"/privacy"},
            {label:"🚩 回報資訊有誤", href:"https://forms.gle/LMXGKFgj66edWcyg7", external:true},
            {label:"➕ 推薦新景點", href:"https://forms.gle/AvoceS4azn5uFAB68", external:true},
          ].map(link=>(
            <a key={link.label} href={link.href}
              target={link.external?"_blank":undefined}
              rel={link.external?"noopener noreferrer":undefined}
              style={{color:"#888",fontSize:12,padding:"6px 0",display:"block"}}>
              {link.label}
            </a>
          ))}
        </div>

        {/* 聯盟聲明 */}
        <div style={{borderTop:"1px solid #2a2a3e",paddingTop:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#555",lineHeight:1.7}}>
            本站部分景點連結含 KKday（cid=25539）及 Klook（aid=124818）聯盟行銷連結，
            點擊購票不影響價格，感謝支持本站持續營運。
          </div>
        </div>

        {/* 版權 */}
        <div style={{fontSize:11,color:"#444",textAlign:"center"}}>
          © {year} 假日遛小孩 gokidsouting.com　保留所有權利
        </div>
      </div>
    </footer>
  );
}
