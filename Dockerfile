# syntax=docker/dockerfile:1.6

# -------- base layer --------
FROM node:20-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN yarn

# -------- builder layer --------
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_TEMPLATE_CLIENT_ID
ARG NEXT_PUBLIC_MARKETPLACE_ADDRESS
ENV NEXT_PUBLIC_TEMPLATE_CLIENT_ID=${NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
ENV NEXT_PUBLIC_MARKETPLACE_ADDRESS=${NEXT_PUBLIC_MARKETPLACE_ADDRESS}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# -------- runner layer (standalone) --------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_TEMPLATE_CLIENT_ID
ARG NEXT_PUBLIC_MARKETPLACE_ADDRESS
ENV NEXT_PUBLIC_TEMPLATE_CLIENT_ID=${NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
ENV NEXT_PUBLIC_MARKETPLACE_ADDRESS=${NEXT_PUBLIC_MARKETPLACE_ADDRESS}

ENV PORT=8080
EXPOSE 8080

# copy Next standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cloud Run will set PORT, Next listens to it via start script
CMD ["yarn", "start"]
