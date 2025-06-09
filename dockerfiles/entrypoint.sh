#!/bin/bash

echo "Veritabanı sunucusunun hazır olması bekleniyor..."
until pg_isready -h postgres -U postgres
do
  echo "PostgreSQL sunucusu henüz hazır değil, bekleniyor..."
  sleep 2
done

sleep 5

export ConnectionStrings__DefaultConnection="Host=postgres;Database=tayin;Username=postgres;Password=root"
export ASPNETCORE_URLS="http://+:80"

echo "Uygulama başlatılıyor..."
exec dotnet TayinAPI.dll
