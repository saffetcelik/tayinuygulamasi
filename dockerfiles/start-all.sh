#!/bin/bash
set -e

mkdir -p /var/log/supervisor
mkdir -p /var/log/postgresql
chown postgres:postgres /var/log/postgresql

echo "PostgreSQL başlatılıyor..."
su - postgres -c "/usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/data" 2>/dev/null || echo "PostgreSQL zaten başlatılmış"

echo "PostgreSQL servisi başlatılıyor..."
su - postgres -c "/usr/lib/postgresql/*/bin/pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql/postgresql.log start" &

echo "PostgreSQL başlaması bekleniyor..."
sleep 10
until su - postgres -c "pg_isready -h localhost -p 5432"; do
  echo "PostgreSQL başlaması bekleniyor..."
  sleep 3
done

echo "PostgreSQL başarıyla başlatıldı!"

echo "Veritabanı kontrol ediliyor..."
su - postgres -c "createdb tayin" 2>/dev/null || echo "Veritabanı zaten mevcut"

echo "PostgreSQL kullanıcı şifresi ayarlanıyor..."
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'root';\""

echo "Nginx yapılandırılıyor..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 3000;
    server_name localhost;

    location / {
        root /app/frontend;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

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

nginx -t

echo "Backend başlatılıyor..."
cd /app/backend
export ASPNETCORE_URLS="http://0.0.0.0:5000"
dotnet TayinAPI.dll &

echo "Backend başlaması bekleniyor..."
sleep 10

echo "Nginx başlatılıyor..."
nginx -g "daemon off;" &

echo "Tüm servisler başlatıldı!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"

wait
