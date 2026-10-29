FROM node:24-slim AS build

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/readable/package.json packages/shared/readable/
COPY packages/shared/contracts/package.json packages/shared/contracts/
COPY packages/shared/ui/package.json packages/shared/ui/
COPY packages/sdk/browser/package.json packages/sdk/browser/
COPY packages/apps/api/package.json packages/apps/api/
COPY packages/apps/web/package.json packages/apps/web/

RUN pnpm install --frozen-lockfile --filter @condor/web...

COPY packages/shared/contracts packages/shared/contracts
COPY packages/shared/ui packages/shared/ui
COPY packages/apps/tsconfig.app.base.json packages/apps/tsconfig.node.base.json packages/apps/
COPY packages/apps/web packages/apps/web

RUN pnpm --filter @condor/web build

FROM nginx:alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/apps/web/dist /usr/share/nginx/html

EXPOSE 80
