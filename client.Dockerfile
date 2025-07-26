FROM node:lts AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# We don't have a build stage, instead, it happens on every runs (because we want SSG, and Next.js SSG requires a DB
# connection, which will be provided inside the Docker Compose)
FROM base AS runner
COPY . .
COPY --from=deps /app/node_modules ./node_modules


ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["sh", "-c", "pnpm run build && pnpm run start"]

