FROM node:18-alpine AS build

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY ./client/package.json ./client/package-lock.json ./

# Bağımlılıkları yükle
RUN npm ci

# Kaynak kodunu kopyala
COPY ./client/ ./

# Build işlemini gerçekleştir
RUN npm run build

# Nginx ile servis etme
FROM nginx:alpine AS final
COPY --from=build /app/build /usr/share/nginx/html
# Nginx yapılandırmasını kopyala - SPA uygulamaları için gerekli
COPY ./dockerfiles/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
