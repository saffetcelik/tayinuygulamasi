#!/bin/bash

# PostgreSQL sunucusunun hazır olmasını bekle
echo "Veritabanı sunucusunun hazır olması bekleniyor..."
until pg_isready -h postgres -U postgres
do
  echo "PostgreSQL sunucusu henüz hazır değil, bekleniyor..."
  sleep 2
done

# Kısa bir gecikme ekleyelim, veritabanının tamamen hazır olması için
sleep 5

# Uygulama başlarken migration işlemlerini yapabilmesi için ortam değişkenlerini ayarla
export ConnectionStrings__DefaultConnection="Host=postgres;Database=tayin;Username=postgres;Password=root"
export ASPNETCORE_URLS="http://+:80"

# Ana uygulamayı başlat
echo "Uygulama başlatılıyor..."
exec dotnet TayinAPI.dll
