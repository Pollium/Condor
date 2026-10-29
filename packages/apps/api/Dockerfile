FROM node:24-slim

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/readable/package.json packages/shared/readable/
COPY packages/shared/contracts/package.json packages/shared/contracts/
COPY packages/shared/ui/package.json packages/shared/ui/
COPY packages/sdk/browser/package.json packages/sdk/browser/
COPY packages/apps/api/package.json packages/apps/api/
COPY packages/apps/web/package.json packages/apps/web/
COPY examples/store/package.json examples/store/

RUN pnpm install --frozen-lockfile --filter @condor/api... --filter @condor/browser...

COPY packages/shared/readable packages/shared/readable
COPY packages/shared/contracts packages/shared/contracts
COPY packages/sdk/browser packages/sdk/browser
COPY packages/apps/api packages/apps/api

RUN pnpm --filter @condor/browser build

ENV SDK_SCRIPT_PATH=/app/packages/sdk/browser/dist/condor.js

WORKDIR /app/packages/apps/api

RUN groupadd -g 10001 app && useradd -u 10001 -g app -m app \
    && chown -R 10001:10001 /app/packages/apps/api /home/app
USER 10001:10001

EXPOSE 4100

CMD ["pnpm", "start"]
