# syntax=docker/dockerfile:1

FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:24-alpine AS builder
WORKDIR /app

ARG BACKEND_API_BASE_URL=https://api.growdex.ai
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_BACKEND_API_URL=https://api.growdex.ai
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djptzfvfl
ARG NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
ARG NEXT_PUBLIC_GOOGLE_AUTH_URL=https://api.growdex.ai
ARG NEXT_PUBLIC_WS_API_URL=https://api.growdex.ai

ENV BACKEND_API_BASE_URL=$BACKEND_API_BASE_URL \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL \
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=$NEXT_PUBLIC_GOOGLE_AUTH_ENABLED \
    NEXT_PUBLIC_GOOGLE_AUTH_URL=$NEXT_PUBLIC_GOOGLE_AUTH_URL \
    NEXT_PUBLIC_WS_API_URL=$NEXT_PUBLIC_WS_API_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 4000

CMD ["node", "server.js"]
