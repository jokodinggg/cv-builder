import "server-only";
import { existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

export function resolveChromePath(): string | null {
  const fromEnv = process.env.CHROME_EXECUTABLE_PATH?.trim();
  if (fromEnv) return fromEnv;
  return CHROME_CANDIDATES.find(path => existsSync(path)) ?? null;
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const executablePath = resolveChromePath();
    if (!executablePath) throw new Error("Chrome/Chromium tidak ditemukan di server. Set CHROME_EXECUTABLE_PATH.");
    browserPromise = puppeteer
      .launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"] })
      .then(browser => {
        browser.on("disconnected", () => (browserPromise = null));
        return browser;
      })
      .catch(error => {
        browserPromise = null;
        throw error;
      });
  }
  return browserPromise;
}

const TIMEOUT_MS = 30_000;

/**
 * Opens the print page as the requesting user (cookie forwarded) and prints it to an A4 PDF.
 * Requests to any other origin are blocked so CV content cannot make the server fetch URLs.
 */
export async function renderPdf(url: string, cookie: string): Promise<Uint8Array> {
  const origin = new URL(url).origin;
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    page.setDefaultTimeout(TIMEOUT_MS);
    await page.setRequestInterception(true);
    page.on("request", request => {
      const target = request.url();
      if (target.startsWith("data:") || new URL(target).origin === origin) void request.continue();
      else void request.abort();
    });
    await page.setExtraHTTPHeaders({ cookie });
    const response = await page.goto(url, { waitUntil: "networkidle0" });
    if (!response?.ok()) throw new Error(`Halaman cetak gagal dimuat (${response?.status() ?? "tanpa respons"}).`);
    await page.waitForSelector('[data-ready="true"]');
    return await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  } finally {
    await page.close().catch(() => undefined);
  }
}
