import { readFile } from "node:fs/promises";
import path from "node:path";

const endpoint =
  process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/IndexNow";
const host = process.env.INDEXNOW_HOST || "javaguide.cn";
const key = process.env.INDEXNOW_KEY;
const keyLocation =
  process.env.INDEXNOW_KEY_LOCATION ||
  (key ? `https://${host}/${key}.txt` : "");
const cwd = process.cwd();
const args = process.argv.slice(2);

const shouldReadSitemap = args.includes("--sitemap");
const explicitUrls = args.filter((arg) => arg !== "--sitemap");
const envUrls = (process.env.INDEXNOW_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const extractUrlsFromSitemap = (xml) =>
  Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/gu), (match) => match[1]);

const normalizeUrls = (urls) =>
  Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => (url.startsWith("http") ? url : `https://${host}${url}`)),
    ),
  );

const readSitemapUrls = async () => {
  const sitemapPath = path.join(cwd, "dist", "sitemap.xml");
  const sitemap = await readFile(sitemapPath, "utf8");

  return extractUrlsFromSitemap(sitemap);
};

const submit = async (urls) => {
  if (!key) {
    console.log("INDEXNOW_KEY is not set; skip IndexNow submission.");
    return;
  }

  const urlList = normalizeUrls(urls).filter((url) => {
    try {
      return new URL(url).hostname === host;
    } catch {
      return false;
    }
  });

  if (urlList.length === 0) {
    throw new Error(
      "No valid URLs to submit. Pass URLs as args, set INDEXNOW_URLS, or use --sitemap.",
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `IndexNow submission failed: ${response.status} ${response.statusText}\n${body}`,
    );
  }

  console.log(`Submitted ${urlList.length} URL(s) to IndexNow.`);
};

const sitemapUrls = shouldReadSitemap ? await readSitemapUrls() : [];

await submit([...explicitUrls, ...envUrls, ...sitemapUrls]);
