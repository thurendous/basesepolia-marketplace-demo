# syntax=docker/dockerfile:1.6

# -------- deps layer --------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile; \
    else yarn; fi

# -------- builder layer --------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_TEMPLATE_CLIENT_ID
ARG NEXT_PUBLIC_MARKETPLACE_ADDRESS
ENV NEXT_PUBLIC_TEMPLATE_CLIENT_ID=${NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
ENV NEXT_PUBLIC_MARKETPLACE_ADDRESS=${NEXT_PUBLIC_MARKETPLACE_ADDRESS}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build || npm run build

# -------- runner layer (standalone) --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# copy Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Cloud Run will set PORT, Next listens to it via start script
CMD ["node", "server.js"]
