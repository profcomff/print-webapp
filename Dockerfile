FROM node:16 AS build
ARG BUILD_MODE=production
WORKDIR /app
ADD ./package.json ./yarn.lock /app/
RUN yarn
ADD . /app
RUN yarn build --mode ${BUILD_MODE}

FROM nginx:1.21
ADD ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN export APPJS_NAME=$(cd /usr/share/nginx/html && ls js/app.*.js) \
    && sed -i 's|APPJS_NAME|'${APPJS_NAME}'|g' /etc/nginx/conf.d/default.conf
