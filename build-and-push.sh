#!/bin/bash

# Docker Hub kullanıcı adınızı buraya yazın
DOCKER_USERNAME="saffetcelikdocker"
PROJECT_NAME="tayin-app"
VERSION="latest"

echo "=== Docker İmajı Build Ediliyor ==="
docker build -t $DOCKER_USERNAME/$PROJECT_NAME:$VERSION .

if [ $? -eq 0 ]; then
    echo "=== Build Başarılı! ==="
    
    echo "=== Docker Hub'a Login Olunuyor ==="
    docker login
    
    if [ $? -eq 0 ]; then
        echo "=== İmaj Docker Hub'a Push Ediliyor ==="
        docker push $DOCKER_USERNAME/$PROJECT_NAME:$VERSION
        
        if [ $? -eq 0 ]; then
            echo "=== Push Başarılı! ==="
            echo ""
            echo "İmajınız hazır! Şu komutla çalıştırabilirsiniz:"
            echo "docker run -p 3000:3000 -p 5000:5000 $DOCKER_USERNAME/$PROJECT_NAME:$VERSION"
        else
            echo "=== Push Başarısız! ==="
        fi
    else
        echo "=== Docker Hub Login Başarısız! ==="
    fi
else
    echo "=== Build Başarısız! ==="
fi
