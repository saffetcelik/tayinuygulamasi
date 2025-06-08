# PowerShell script for Windows
# Docker Hub kullanıcı adınızı buraya yazın
$DOCKER_USERNAME = "saffetcelikdocker"
$PROJECT_NAME = "tayin-app"
$VERSION = "latest"

Write-Host "=== Docker İmajı Build Ediliyor ===" -ForegroundColor Green
docker build -t "$DOCKER_USERNAME/$PROJECT_NAME:$VERSION" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Build Başarılı! ===" -ForegroundColor Green
    
    Write-Host "=== Docker Hub'a Login Olunuyor ===" -ForegroundColor Yellow
    docker login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "=== İmaj Docker Hub'a Push Ediliyor ===" -ForegroundColor Yellow
        docker push "$DOCKER_USERNAME/$PROJECT_NAME:$VERSION"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "=== Push Başarılı! ===" -ForegroundColor Green
            Write-Host ""
            Write-Host "İmajınız hazır! Şu komutla çalıştırabilirsiniz:" -ForegroundColor Cyan
            Write-Host "docker run -p 3000:3000 -p 5000:5000 $DOCKER_USERNAME/$PROJECT_NAME:$VERSION" -ForegroundColor White
        } else {
            Write-Host "=== Push Başarısız! ===" -ForegroundColor Red
        }
    } else {
        Write-Host "=== Docker Hub Login Başarısız! ===" -ForegroundColor Red
    }
} else {
    Write-Host "=== Build Başarısız! ===" -ForegroundColor Red
}
