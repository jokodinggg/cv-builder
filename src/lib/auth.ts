import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins";
import { prisma } from "./db";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
    : undefined;

// Cloudflare Turnstile guards email sign-up, sign-in, and password reset when both keys are set.
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
export const turnstileSiteKey = (turnstileSecret && process.env.TURNSTILE_SITE_KEY) || null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  socialProviders: google ? { google } : {},
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  plugins: [
    ...(turnstileSiteKey && turnstileSecret ? [captcha({ provider: "cloudflare-turnstile", secretKey: turnstileSecret })] : []),
    nextCookies(),
  ],
});

export const googleEnabled = Boolean(google);
