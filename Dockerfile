# ---------- Build stage ----------
FROM node:20-alpine AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Inject public environment variables for build-time usage
ARG NEXT_PUBLIC_BASE_API="http://10.1.1.205/compgateapi/api"
ARG NEXT_PUBLIC_AUTH_API="http://10.1.1.205/compauthapi/api/auth"
ARG NEXT_PUBLIC_IMAGE_URL="http://10.1.1.205/compgateapi"
ARG NEXT_PUBLIC_ALLOWED_URLS="http://10.1.1.205:3012/auth/login,http://10.1.1.205:3012/Companygw/auth/register/uploadDocuments,http://10.1.1.205:3012/Companygw/auth/register/uploadDocuments/*,https://webanking.bcd.ly/Companygw/auth/login,https://webanking.bcd.ly/Companygw/auth/register/uploadDocuments,https://webanking.bcd.ly/Companygw/auth/register/uploadDocuments/*,http://localhost:3000/Companygw/auth/login,http://localhost:3000/Companygw/auth/register/uploadDocuments,http://localhost:3000/Companygw/auth/register/uploadDocuments/*,http://127.0.0.1:3000/Companygw/auth/login,http://127.0.0.1:3000/Companygw/auth/register/uploadDocuments,http://127.0.0.1:3000/Companygw/auth/register/uploadDocuments/*"
ENV NEXT_PUBLIC_BASE_API=${NEXT_PUBLIC_BASE_API}
ENV NEXT_PUBLIC_AUTH_API=${NEXT_PUBLIC_AUTH_API}
ENV NEXT_PUBLIC_IMAGE_URL=${NEXT_PUBLIC_IMAGE_URL}
ENV NEXT_PUBLIC_ALLOWED_URLS=${NEXT_PUBLIC_ALLOWED_URLS}

# Install deps (npm ci if lockfile present)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci || npm i --production=false; else npm i --production=false; fi

# Copy the rest and build
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Reuse the same public environment values at runtime
ARG NEXT_PUBLIC_BASE_API="http://10.1.1.205/compgateapi/api"
ARG NEXT_PUBLIC_AUTH_API="http://10.1.1.205/compauthapi/api/auth"
ARG NEXT_PUBLIC_IMAGE_URL="http://10.1.1.205/compgateapi"
ARG NEXT_PUBLIC_ALLOWED_URLS="http://10.1.1.205:3012/auth/login,http://10.1.1.205:3012/Companygw/auth/register/uploadDocuments,http://10.1.1.205:3012/Companygw/auth/register/uploadDocuments/*,https://webanking.bcd.ly/Companygw/auth/login,https://webanking.bcd.ly/Companygw/auth/register/uploadDocuments,https://webanking.bcd.ly/Companygw/auth/register/uploadDocuments/*,http://localhost:3000/Companygw/auth/login,http://localhost:3000/Companygw/auth/register/uploadDocuments,http://localhost:3000/Companygw/auth/register/uploadDocuments/*,http://127.0.0.1:3000/Companygw/auth/login,http://127.0.0.1:3000/Companygw/auth/register/uploadDocuments,http://127.0.0.1:3000/Companygw/auth/register/uploadDocuments/*"
ENV NEXT_PUBLIC_BASE_API=${NEXT_PUBLIC_BASE_API}
ENV NEXT_PUBLIC_AUTH_API=${NEXT_PUBLIC_AUTH_API}
ENV NEXT_PUBLIC_IMAGE_URL=${NEXT_PUBLIC_IMAGE_URL}
ENV NEXT_PUBLIC_ALLOWED_URLS=${NEXT_PUBLIC_ALLOWED_URLS}

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy standalone output and public assets
COPY --from=builder /app/Companygw/standalone ./
COPY --from=builder /app/Companygw/static ./Companygw/static
COPY --from=builder /app/public ./public
COPY server-wrapper.js ./server-wrapper.js

# Healthcheck hits /api/health
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

USER nextjs
EXPOSE 3000
CMD ["node", "server-wrapper.js"]
