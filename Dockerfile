# AZMIQ shop - container image for a self-hosted server (e.g. Hetzner + Coolify).
#
# Build-time settings: Next.js bakes NEXT_PUBLIC_* values into the browser code
# and pre-renders the shop pages from the database during the build, so these
# must be passed as build arguments (in Coolify, tick "Build Variable"):
#   DATABASE_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# They only exist in the build stage; the final image does not contain them.
# Everything else (Stripe secret, SMTP, admin login, CRON_SECRET) is a normal
# runtime environment variable.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV DATABASE_URL=$DATABASE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Same as the Netlify build: apply migrations, seed only an empty database,
# then build. Safe to run on every deploy.
RUN npm run build:deploy

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/scripts/cron-daily.mjs ./scripts/cron-daily.mjs
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
