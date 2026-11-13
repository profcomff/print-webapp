FROM node:24 AS build
ARG BUILD_MODE=production
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN npm install --global pnpm@12.18.0 && pnpm install --frozen-lockfile
ADD . /app
RUN pnpm build --mode ${BUILD_MODE}

FROM nginx:stable
ADD ./default.conf /etc/nginx/conf.d/default.conf
ADD ./docker_entrypoint.sh /docker_entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod +x /docker_entrypoint.sh && /docker_entrypoint.sh
