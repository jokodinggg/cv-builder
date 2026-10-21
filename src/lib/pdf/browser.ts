import "server-only";
import { existsSync } from "node:fs";
import puppeteer, { type Browser, type LaunchOptions, type Page } from "puppeteer-core";
import { createLimiter, withDeadline } from "@/lib/async";
import { pickChromeSource } from "./chrome-source";
import { isAllowedRequest } from "./request-filter";

const BASE_ARGS = ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"];

async function launchOptions(): Promise<LaunchOptions> {
  const source = pickChromeSource(process.env, existsSync);
  if (!source) throw new Error("Chrome/Chromium tidak ditemukan di server. Set CHROME_EXECUTABLE_PATH.");
  if (source.kind === "path") return { executablePath: source.path, headless: true, args: BASE_ARGS };
  // Loaded only on serverless: it unpacks a Linux Chromium into /tmp on first use.
  const { default: chromium } = await import("@sparticuz/chromium");
  return {
    executablePath: await chromium.executablePath(),
    headless: "shell",
    args: await puppeteer.defaultArgs({ args: [...chromium.args, "--font-render-hinting=none"], headless: "shell" }),
  };
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchOptions()
      .then(options => puppeteer.launch(options))
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

const STEP_TIMEOUT_MS = 20_000;
const TOTAL_TIMEOUT_MS = 45_000; // below the route's maxDuration (60 s) so the page is always closed
const renderSlots = createLimiter(2); // at most two Chrome pages across all users

async function printPage(page: Page, url: string, cookie: string): Promise<Uint8Array> {
  const origin = new URL(url).origin;
  page.setDefaultTimeout(STEP_TIMEOUT_MS);
  await page.setRequestInterception(true);
  page.on("request", request => {
    const action = isAllowedRequest(request.url(), origin) ? request.continue() : request.abort();
    // Interception can be torn down while a request is pending; never let that reject unhandled.
    action.catch(() => undefined);
  });
  await page.setExtraHTTPHeaders({ cookie });
  const response = await page.goto(url, { waitUntil: "networkidle0" });
  if (!response?.ok()) throw new Error(`Print page failed to load (${response?.status() ?? "no response"}).`);
  await page.waitForSelector('[data-ready="true"]');
  return page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, timeout: STEP_TIMEOUT_MS });
}

/**
 * Opens the print page as the requesting user (cookie forwarded) and prints it to an A4 PDF.
 * Requests to any other origin are blocked so CV content cannot make the server fetch URLs.
 */
export function renderPdf(url: string, cookie: string): Promise<Uint8Array> {
  return renderSlots(async () => {
    let page: Page | null = null;
    const close = () => void page?.close().catch(() => undefined);
    const job = (async () => {
      const browser = await getBrowser();
      page = await browser.newPage();
      return printPage(page, url, cookie);
    })();
    try {
      return await withDeadline(job, TOTAL_TIMEOUT_MS, close);
    } finally {
      close();
    }
  });
}
