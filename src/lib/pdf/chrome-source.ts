const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

export type ChromeSource = { kind: "path"; path: string } | { kind: "serverless" };

type Env = Record<string, string | undefined>;

/**
 * Where headless Chrome comes from: an explicit path, an installed browser, or — on Vercel /
 * AWS Lambda, which ship no browser — the Chromium bundled in `@sparticuz/chromium`.
 */
export function pickChromeSource(env: Env, exists: (path: string) => boolean): ChromeSource | null {
  const fromEnv = env.CHROME_EXECUTABLE_PATH?.trim();
  if (fromEnv) return { kind: "path", path: fromEnv };
  const installed = CHROME_CANDIDATES.find(exists);
  if (installed) return { kind: "path", path: installed };
  if (env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME) return { kind: "serverless" };
  return null;
}
