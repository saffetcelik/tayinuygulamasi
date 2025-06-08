#!/bin/bash
set -e

# Log dizinini oluştur
mkdir -p /var/log/supervisor
mkdir -p /var/log/postgresql
chown postgres:postgres /var/log/postgresql

# PostgreSQL'i başlat
echo "PostgreSQL başlatılıyor..."
su - postgres -c "/usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/data" 2>/dev/null || echo "PostgreSQL zaten başlatılmış"

# PostgreSQL'i başlat
echo "PostgreSQL servisi başlatılıyor..."
su - postgres -c "/usr/lib/postgresql/*/bin/pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql/postgresql.log start" &

# PostgreSQL'in başlamasını bekle
echo "PostgreSQL başlaması bekleniyor..."
sleep 10
until su - postgres -c "pg_isready -h localhost -p 5432"; do
  echo "PostgreSQL başlaması bekleniyor..."
  sleep 3
done

echo "PostgreSQL başarıyla başlatıldı!"

# Veritabanını oluştur (eğer yoksa)
echo "Veritabanı kontrol ediliyor..."
su - postgres -c "createdb tayin" 2>/dev/null || echo "Veritabanı zaten mevcut"

# PostgreSQL kullanıcısı için şifre ayarla
echo "PostgreSQL kullanıcı şifresi ayarlanıyor..."
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'root';\""

# Nginx yapılandırmasını güncelle
echo "Nginx yapılandırılıyor..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 3000;
    server_name localhost;

    # Frontend (React)
    location / {
        root /app/frontend;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Nginx'i test et
nginx -t

# Backend'i başlat (arka planda)
echo "Backend başlatılıyor..."
cd /app/backend
export ASPNETCORE_URLS="http://0.0.0.0:5000"
dotnet TayinAPI.dll &

# Backend'in başlamasını bekle
echo "Backend başlaması bekleniyor..."
sleep 10

# Nginx'i başlat
echo "Nginx başlatılıyor..."
nginx -g "daemon off;" &

echo "Tüm servisler başlatıldı!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"

# Tüm servislerin çalışmasını bekle
wait
