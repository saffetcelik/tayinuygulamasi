# Multi-stage Dockerfile - Tüm servisleri tek imajda birleştiren
FROM postgres:16-alpine AS postgres-base

# PostgreSQL için gerekli ayarlar
ENV POSTGRES_DB=tayin
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=root
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY ./client/package.json ./client/package-lock.json ./
RUN npm ci
COPY ./client/ ./
RUN npm run build

# Backend build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY ./server/TayinAPI/TayinAPI.csproj ./TayinAPI/
RUN dotnet restore ./TayinAPI/TayinAPI.csproj
COPY ./server/TayinAPI/. ./TayinAPI/
WORKDIR /src/TayinAPI
RUN dotnet publish -c Release -o /app

# Final stage - Tüm servisleri birleştiren
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# PostgreSQL ve diğer bileşenleri kurulumu
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-client \
    postgresql-contrib \
    nginx \
    curl \
    dos2unix \
    locales \
    supervisor \
    && sed -i -e 's/# tr_TR.UTF-8 UTF-8/tr_TR.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=tr_TR.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Backend dosyalarını kopyala
COPY --from=backend-build /app ./backend/

# Frontend dosyalarını kopyala
COPY --from=frontend-build /app/build ./frontend/

# Nginx yapılandırmasını kopyala
COPY ./dockerfiles/nginx.conf /etc/nginx/sites-available/default

# PostgreSQL yapılandırması
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    chmod 700 /var/lib/postgresql/data && \
    mkdir -p /var/log/supervisor

# Supervisor yapılandırması
COPY ./dockerfiles/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Başlangıç betiği
COPY ./dockerfiles/start-all.sh ./
RUN dos2unix ./start-all.sh && chmod +x ./start-all.sh

# Environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection="Host=localhost;Database=tayin;Username=postgres;Password=root"
ENV Jwt__Key="3MX7dRLzbY6fXPYVIUlRWcXltjQdUEtwKmojJuzVBwc"
ENV Jwt__Issuer="TayinAPI"
ENV Jwt__Audience="TayinClient"
ENV CorsOrigins__0="http://localhost:3000"
ENV CorsOrigins__1="http://localhost:80"
ENV CorsOrigins__2="http://localhost"
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV LC_ALL=tr_TR.UTF-8
ENV LANG=tr_TR.UTF-8
ENV TZ=Europe/Istanbul

# Port'ları aç
EXPOSE 3000 5000 80

# Başlangıç komutu
CMD ["./start-all.sh"]
