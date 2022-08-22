FROM node:16 AS build
WORKDIR /app
ADD ./package.json ./package-lock.json /app/
RUN npm install
ADD . /app
RUN npm run build

FROM nginx:1.21
ADD ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN export APPJS_NAME=$(cd /usr/share/nginx/html && ls js/app.*.js) \
    && sed -i 's|APPJS_NAME|'${APPJS_NAME}'|g' /etc/nginx/conf.d/default.conf
