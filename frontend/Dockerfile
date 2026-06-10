FROM oven/bun1 AS builder
WORKDIR /app

COPY package.json bun.lcok ./
RUN bun install --frozen-lockfile

COPY..
RUN bun run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD {"node", "./server.js"}