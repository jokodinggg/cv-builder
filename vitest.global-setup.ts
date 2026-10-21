import { execSync } from "node:child_process";

export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return;
  execSync("pnpm prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url }, stdio: "ignore" });
}
