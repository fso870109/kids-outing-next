import SPOTS from "../data/spots";

const BASE = "https://kids-outing.vercel.app";

function generateSitemap(spots) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${spots.map(s => `
  <url>
    <loc>${BASE}/spot/${encodeURIComponent(s.name)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`;
}

export default function Sitemap() { return null; }

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml");
  res.write(generateSitemap(SPOTS));
  res.end();
  return { props: {} };
}
