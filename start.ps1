cmd /c "chcp 65001 >nul 2>&1"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Ana mesajlar  
Write-Host "Tayin Projesi Baslatiliyor..." -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Proje yolları
$rootPath = $PSScriptRoot
$apiPath = Join-Path -Path $rootPath -ChildPath "server\TayinAPI"
$clientPath = Join-Path -Path $rootPath -ChildPath "client"

# Yol kontrolü
if (-not (Test-Path $apiPath) -or -not (Test-Path $clientPath)) {
    Write-Host "HATA: Proje yollari bulunamadi!" -ForegroundColor Red
    exit 1
}

# Önceki işleri temizle
Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue

Write-Host "Backend baslatiliyor..." -ForegroundColor Cyan

# Backend başlat
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location -Path $path
    $env:DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = "false"
    dotnet run --urls=http://localhost:5000
} -ArgumentList $apiPath

Write-Host "Frontend baslatiliyor..." -ForegroundColor Yellow

# Frontend başlat  
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location -Path $path
    $env:PORT = "3001"
    $env:BROWSER = "none"
    npm start
} -ArgumentList $clientPath

# Basit port kontrolü
function Test-Port($port) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect("127.0.0.1", $port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(500, $false)
        if ($wait) {
            $tcpClient.EndConnect($connect)
            $tcpClient.Close()
            return $true
        }
        $tcpClient.Close()
        return $false
    } catch {
        return $false
    }
}

Write-Host "Servisler bekleniyor..." -ForegroundColor Magenta

# Frontend portu hazır olana kadar bekle
while (-not (Test-Port 3001)) {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""
Write-Host "Frontend hazir! Tarayici aciliyor..." -ForegroundColor Green
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "Tayin projesi calisiyor:" -ForegroundColor Green  
Write-Host "API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Durdurmak icin Ctrl+C tusuna basin." -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor DarkGray

# Ana döngü - sadece logları göster
try {
    while ($true) {
        # Backend logları
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            $backendOutput | ForEach-Object { 
                if ($_.ToString().Trim()) { Write-Host "[API] $_" -ForegroundColor Cyan }
            }
        }
        
        # Frontend logları  
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                if ($_.ToString().Trim()) { Write-Host "[WEB] $_" -ForegroundColor Yellow }
            }
        }
        
        Start-Sleep -Milliseconds 300
    }
}
finally {
    Write-Host "Servisler durduruluyor..." -ForegroundColor Yellow
    Get-Job | Stop-Job -ErrorAction SilentlyContinue  
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
    Write-Host "Tayin Projesi durduruldu." -ForegroundColor Red
}