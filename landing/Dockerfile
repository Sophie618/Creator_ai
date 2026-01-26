FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/start.sh /start.sh
COPY --from=build /app/build /usr/share/nginx/html
RUN chmod +x /start.sh

EXPOSE 7860
ENTRYPOINT ["/start.sh"]
