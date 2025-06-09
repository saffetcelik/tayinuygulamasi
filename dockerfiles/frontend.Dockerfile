FROM node:18-alpine AS build

WORKDIR /app

COPY ./client/package.json ./client/package-lock.json ./

RUN npm ci

COPY ./client/ ./

RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/build /usr/share/nginx/html
COPY ./dockerfiles/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
