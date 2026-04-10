# ─────────────────────────────────────────────────────────────────────────────
# EquipShare Back-End — Multi-Stage Docker Build (Node.js 22 / Alpine)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build TypeScript ─────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
