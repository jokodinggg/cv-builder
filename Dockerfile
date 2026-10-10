# Production image: Next.js app + Chromium for PDF export.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS runtime
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl chromium fonts-liberation fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production CHROME_EXECUTABLE_PATH=/usr/bin/chromium PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["sh", "-c", "pnpm db:deploy && pnpm start"]
