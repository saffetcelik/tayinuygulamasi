FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala
COPY ./server/TayinAPI/TayinAPI.csproj ./TayinAPI/
RUN dotnet restore ./TayinAPI/TayinAPI.csproj

# Tüm kaynak kodunu kopyala
COPY ./server/TayinAPI/. ./TayinAPI/
WORKDIR /src/TayinAPI

# Publish
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app .

# PostgreSQL istemci araçlarını ve gerekli paketleri yükle
RUN apt-get update && apt-get install -y dos2unix postgresql-client curl locales && \
    sed -i -e 's/# tr_TR.UTF-8 UTF-8/tr_TR.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=tr_TR.UTF-8 && \
    apt-get clean

# Migration betiğini kopyala
COPY ./dockerfiles/entrypoint.sh ./
RUN dos2unix ./entrypoint.sh && chmod +x ./entrypoint.sh

EXPOSE 80
EXPOSE 443

# Başlangıç betiği
ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]
