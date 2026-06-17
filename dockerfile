# ─── Stage 1 : build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# openssl requis par Prisma pour générer le client
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci 

COPY prisma ./prisma
COPY src ./src

# Génère le client Prisma, puis élague les devDependencies
RUN npx prisma generate
RUN npm prune --omit=dev 

# ─── Stage 2 : runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl wget

# Copie uniquement ce dont on a besoin en prod
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY src ./src
COPY package.json ./

# Copie le script d'entrée qui lance les migrations puis l'appli
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Sécurité : exécution en utilisateur non-root
USER node

EXPOSE 3000

# Health check : vérifie que GET /health répond
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]