# ============================================
# Cạp Nông - Frontend Production Dockerfile
# Multi-stage build: Next.js 16 Standalone
# ============================================

# === Stage 1: Dependencies ===
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# === Stage 2: Build ===
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_AI_SERVICE_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_AI_SERVICE_URL=$NEXT_PUBLIC_AI_SERVICE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_ESLINT=1
ENV NEXT_DISABLE_TYPECHECK=1
RUN npm run build

# === Stage 3: Runtime ===
FROM node:22-alpine
WORKDIR /app

RUN addgroup -S capnong && adduser -S capnong -G capnong && \
    apk add --no-cache curl

# Copy standalone output
COPY --from=builder --chown=capnong:capnong /app/.next/standalone ./
COPY --from=builder --chown=capnong:capnong /app/.next/static ./.next/static
COPY --from=builder --chown=capnong:capnong /app/public ./public

USER capnong
EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
