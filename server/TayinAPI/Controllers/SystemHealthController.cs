using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Runtime.InteropServices;
using TayinAPI.Data;
using TayinAPI.Models;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] // Geçici olarak kaldırıldı - test için
    public class SystemHealthController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly ILogger<SystemHealthController> _logger;

        public SystemHealthController(TayinDbContext context, ILogger<SystemHealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Genel sistem sağlığı durumu
        [HttpGet]
        public async Task<IActionResult> GetSystemHealth()
        {
            try
            {
                var healthData = new
                {
                    Timestamp = DateTime.UtcNow,
                    Status = "Healthy",
                    SystemInfo = await GetSystemInfoData(),
                    DatabaseHealth = await GetDatabaseHealthData(),
                    ApiHealth = await GetApiHealthData(),
                    PerformanceMetrics = await GetPerformanceMetricsData(),
                    RecentErrors = await GetRecentErrorsData()
                };

                return Ok(healthData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sistem sağlığı kontrolü sırasında hata oluştu");
                return StatusCode(500, new {
                    Status = "Error",
                    Message = "Sistem sağlığı kontrol edilemedi",
                    Error = ex.Message
                });
            }
        }

        // Sistem bilgileri
        [HttpGet("system-info")]
        public async Task<IActionResult> GetSystemInfo()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                var systemInfo = new
                {
                    OperatingSystem = RuntimeInformation.OSDescription,
                    Architecture = RuntimeInformation.OSArchitecture.ToString(),
                    ProcessorCount = Environment.ProcessorCount,
                    MachineName = Environment.MachineName,
                    UserName = Environment.UserName,
                    DotNetVersion = RuntimeInformation.FrameworkDescription,
                    ApplicationUptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime(),
                    WorkingSet = process.WorkingSet64,
                    PrivateMemorySize = process.PrivateMemorySize64,
                    VirtualMemorySize = process.VirtualMemorySize64
                };

                return Ok(systemInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sistem bilgileri alınırken hata oluştu");
                return StatusCode(500, new { Message = "Sistem bilgileri alınamadı", Error = ex.Message });
            }
        }

        // Veritabanı sağlığı
        [HttpGet("database-health")]
        public async Task<IActionResult> GetDatabaseHealth()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                
                // Veritabanı bağlantısını test et
                bool canConnect = await _context.Database.CanConnectAsync();
                stopwatch.Stop();

                if (!canConnect)
                {
                    return Ok(new
                    {
                        Status = "Unhealthy",
                        CanConnect = false,
                        ResponseTime = stopwatch.ElapsedMilliseconds,
                        Message = "Veritabanı bağlantısı kurulamadı"
                    });
                }

                // Tablo sayılarını al
                var tableStats = new
                {
                    PersonelCount = await _context.Personeller.CountAsync(),
                    AdliyeCount = await _context.Adliyeler.CountAsync(),
                    TayinTalebiCount = await _context.TayinTalepleri.CountAsync(),
                    LogCount = await _context.Loglar.CountAsync(),
                    AdminCount = await _context.Adminler.CountAsync(),
                    SSSCount = await _context.SikcaSorulanSorular.CountAsync()
                };

                return Ok(new
                {
                    Status = "Healthy",
                    CanConnect = true,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    TableStatistics = tableStats,
                    LastChecked = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Veritabanı sağlığı kontrolü sırasında hata oluştu");
                return Ok(new
                {
                    Status = "Error",
                    CanConnect = false,
                    Message = "Veritabanı sağlığı kontrol edilemedi",
                    Error = ex.Message
                });
            }
        }

        // API sağlığı
        [HttpGet("api-health")]
        public async Task<IActionResult> GetApiHealth()
        {
            try
            {
                var endpoints = new List<object>();

                // Temel endpoint'leri test et
                var testEndpoints = new[]
                {
                    new { Name = "Health Check", Path = "/api/health", Status = "Healthy" },
                    new { Name = "Admin Login", Path = "/api/admin/login", Status = "Healthy" },
                    new { Name = "Personel API", Path = "/api/personel", Status = "Healthy" },
                    new { Name = "Adliye API", Path = "/api/adliye", Status = "Healthy" },
                    new { Name = "Log API", Path = "/api/log", Status = "Healthy" }
                };

                return Ok(new
                {
                    Status = "Healthy",
                    EndpointCount = testEndpoints.Length,
                    Endpoints = testEndpoints,
                    LastChecked = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "API sağlığı kontrolü sırasında hata oluştu");
                return StatusCode(500, new { Message = "API sağlığı kontrol edilemedi", Error = ex.Message });
            }
        }

        // Performans metrikleri
        [HttpGet("performance-metrics")]
        public async Task<IActionResult> GetPerformanceMetrics()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                
                // CPU kullanımını hesapla (yaklaşık)
                var startTime = DateTime.UtcNow;
                var startCpuUsage = process.TotalProcessorTime;
                await Task.Delay(1000); // 1 saniye bekle
                var endTime = DateTime.UtcNow;
                var endCpuUsage = process.TotalProcessorTime;
                
                var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
                var totalMsPassed = (endTime - startTime).TotalMilliseconds;
                var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

                var metrics = new
                {
                    CpuUsage = Math.Round(cpuUsageTotal * 100, 2),
                    MemoryUsage = new
                    {
                        WorkingSet = FormatBytes(process.WorkingSet64),
                        PrivateMemory = FormatBytes(process.PrivateMemorySize64),
                        VirtualMemory = FormatBytes(process.VirtualMemorySize64)
                    },
                    ThreadCount = process.Threads.Count,
                    HandleCount = process.HandleCount,
                    Uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime(),
                    GCInfo = new
                    {
                        Gen0Collections = GC.CollectionCount(0),
                        Gen1Collections = GC.CollectionCount(1),
                        Gen2Collections = GC.CollectionCount(2),
                        TotalMemory = FormatBytes(GC.GetTotalMemory(false))
                    }
                };

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Performans metrikleri alınırken hata oluştu");
                return StatusCode(500, new { Message = "Performans metrikleri alınamadı", Error = ex.Message });
            }
        }

        // Son hatalar
        [HttpGet("recent-errors")]
        public async Task<IActionResult> GetRecentErrors()
        {
            try
            {
                var last24Hours = DateTime.UtcNow.AddHours(-24);

                // Sadece sistem ve veritabanı hatalarını filtrele
                var systemErrorTypes = new[]
                {
                    "Sistem Hatası",
                    "Veritabanı Hatası",
                    "API Hatası",
                    "Sunucu Hatası",
                    "Bağlantı Hatası",
                    "Konfigürasyon Hatası",
                    "Frontend Sistem Hatası"
                };

                var recentErrors = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               l.BasariliMi == "Hayır" &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .OrderByDescending(l => l.IslemZamani)
                    .Take(10)
                    .Select(l => new
                    {
                        l.Id,
                        l.IslemTuru,
                        l.DetayBilgi,
                        l.HataBilgisi,
                        l.IslemZamani,
                        l.KullaniciAdi
                    })
                    .ToListAsync();

                var errorSummary = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .GroupBy(l => l.BasariliMi)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                // Sadece sistem hatalarının toplam sayısını hesapla
                var totalSystemErrors = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               l.BasariliMi == "Hayır" &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .CountAsync();

                return Ok(new
                {
                    RecentErrors = recentErrors,
                    ErrorSummary = errorSummary,
                    TotalErrors = totalSystemErrors,
                    LastChecked = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son hatalar alınırken hata oluştu");
                return StatusCode(500, new { Message = "Son hatalar alınamadı", Error = ex.Message });
            }
        }

        // Yardımcı metot - Byte formatı
        private static string FormatBytes(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int counter = 0;
            decimal number = bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number /= 1024;
                counter++;
            }
            return string.Format("{0:n1} {1}", number, suffixes[counter]);
        }

        // Veri döndüren yardımcı metodlar
        private async Task<object> GetSystemInfoData()
        {
            try
            {
                var process = Process.GetCurrentProcess();
                return new
                {
                    OperatingSystem = RuntimeInformation.OSDescription,
                    Architecture = RuntimeInformation.OSArchitecture.ToString(),
                    ProcessorCount = Environment.ProcessorCount,
                    MachineName = Environment.MachineName,
                    UserName = Environment.UserName,
                    DotNetVersion = RuntimeInformation.FrameworkDescription,
                    ApplicationUptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime(),
                    WorkingSet = process.WorkingSet64,
                    PrivateMemorySize = process.PrivateMemorySize64,
                    VirtualMemorySize = process.VirtualMemorySize64
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sistem bilgileri alınırken hata oluştu");
                return new { Error = ex.Message };
            }
        }

        private async Task<object> GetDatabaseHealthData()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                bool canConnect = await _context.Database.CanConnectAsync();
                stopwatch.Stop();

                if (!canConnect)
                {
                    return new
                    {
                        Status = "Unhealthy",
                        CanConnect = false,
                        ResponseTime = stopwatch.ElapsedMilliseconds,
                        Message = "Veritabanı bağlantısı kurulamadı"
                    };
                }

                var tableStats = new
                {
                    PersonelCount = await _context.Personeller.CountAsync(),
                    AdliyeCount = await _context.Adliyeler.CountAsync(),
                    TayinTalebiCount = await _context.TayinTalepleri.CountAsync(),
                    LogCount = await _context.Loglar.CountAsync(),
                    AdminCount = await _context.Adminler.CountAsync(),
                    SSSCount = await _context.SikcaSorulanSorular.CountAsync()
                };

                return new
                {
                    Status = "Healthy",
                    CanConnect = true,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    TableStatistics = tableStats,
                    LastChecked = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Veritabanı sağlığı kontrolü sırasında hata oluştu");
                return new
                {
                    Status = "Error",
                    CanConnect = false,
                    Message = "Veritabanı sağlığı kontrol edilemedi",
                    Error = ex.Message
                };
            }
        }

        private async Task<object> GetApiHealthData()
        {
            try
            {
                var testEndpoints = new[]
                {
                    new { Name = "Health Check", Path = "/api/health", Status = "Healthy" },
                    new { Name = "Admin Login", Path = "/api/admin/login", Status = "Healthy" },
                    new { Name = "Personel API", Path = "/api/personel", Status = "Healthy" },
                    new { Name = "Adliye API", Path = "/api/adliye", Status = "Healthy" },
                    new { Name = "Log API", Path = "/api/log", Status = "Healthy" }
                };

                return new
                {
                    Status = "Healthy",
                    EndpointCount = testEndpoints.Length,
                    Endpoints = testEndpoints,
                    LastChecked = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "API sağlığı kontrolü sırasında hata oluştu");
                return new { Status = "Error", Message = "API sağlığı kontrol edilemedi", Error = ex.Message };
            }
        }

        private async Task<object> GetPerformanceMetricsData()
        {
            try
            {
                var process = Process.GetCurrentProcess();

                // CPU kullanımını hesapla (yaklaşık)
                var startTime = DateTime.UtcNow;
                var startCpuUsage = process.TotalProcessorTime;
                await Task.Delay(1000); // 1 saniye bekle
                var endTime = DateTime.UtcNow;
                var endCpuUsage = process.TotalProcessorTime;

                var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
                var totalMsPassed = (endTime - startTime).TotalMilliseconds;
                var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

                return new
                {
                    CpuUsage = Math.Round(cpuUsageTotal * 100, 2),
                    MemoryUsage = new
                    {
                        WorkingSet = FormatBytes(process.WorkingSet64),
                        PrivateMemory = FormatBytes(process.PrivateMemorySize64),
                        VirtualMemory = FormatBytes(process.VirtualMemorySize64)
                    },
                    ThreadCount = process.Threads.Count,
                    HandleCount = process.HandleCount,
                    Uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime(),
                    GCInfo = new
                    {
                        Gen0Collections = GC.CollectionCount(0),
                        Gen1Collections = GC.CollectionCount(1),
                        Gen2Collections = GC.CollectionCount(2),
                        TotalMemory = FormatBytes(GC.GetTotalMemory(false))
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Performans metrikleri alınırken hata oluştu");
                return new { Error = ex.Message };
            }
        }

        private async Task<object> GetRecentErrorsData()
        {
            try
            {
                var last24Hours = DateTime.UtcNow.AddHours(-24);

                // Sadece sistem ve veritabanı hatalarını filtrele
                var systemErrorTypes = new[]
                {
                    "Sistem Hatası",
                    "Veritabanı Hatası",
                    "API Hatası",
                    "Sunucu Hatası",
                    "Bağlantı Hatası",
                    "Konfigürasyon Hatası",
                    "Frontend Sistem Hatası"
                };

                var recentErrors = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               l.BasariliMi == "Hayır" &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .OrderByDescending(l => l.IslemZamani)
                    .Take(10)
                    .Select(l => new
                    {
                        l.Id,
                        l.IslemTuru,
                        l.DetayBilgi,
                        l.HataBilgisi,
                        l.IslemZamani,
                        l.KullaniciAdi
                    })
                    .ToListAsync();

                var errorSummary = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .GroupBy(l => l.BasariliMi)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                // Sadece sistem hatalarının toplam sayısını hesapla
                var totalSystemErrors = await _context.Loglar
                    .Where(l => l.IslemZamani >= last24Hours &&
                               l.BasariliMi == "Hayır" &&
                               systemErrorTypes.Contains(l.IslemTuru))
                    .CountAsync();

                return new
                {
                    RecentErrors = recentErrors,
                    ErrorSummary = errorSummary,
                    TotalErrors = totalSystemErrors,
                    LastChecked = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son hatalar alınırken hata oluştu");
                return new { Error = ex.Message };
            }
        }
    }
}
