FROM node:20

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

RUN mkdir -p /data
VOLUME ["/data"]

ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/dev.db"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
