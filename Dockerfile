FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends     python3     make     g++     && rm -rf /var/lib/apt/lists/*

RUN groupadd -r nodejs && useradd -r -s /bin/false -d /nonexistent -c "Node.js" -g nodejs nodejs || true

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY .next/standalone/. ./
COPY .next/static ./.next/static
COPY public ./public

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3100

ENV PORT=3100
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3   CMD node -e "fetch('http://localhost:3100/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
