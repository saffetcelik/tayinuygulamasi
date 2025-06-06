using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Threading.Tasks;
using TayinAPI.Data;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Tayin API",
        Version = "v1",
        Description = "Tayin Uygulaması API Dokümantasyonu",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Tayin API Support"
        }
    });

    // JWT Bearer token desteği ekle
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// PostgreSQL veritabanı bağlantısı ekle
builder.Services.AddDbContext<TayinDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpContext erişimi için
builder.Services.AddHttpContextAccessor();

// Log servisi ekliyoruz
builder.Services.AddScoped<TayinAPI.Services.LogService>();

// JSON döngüsel referansları işleme
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // ReferenceHandler.IgnoreCycles kullanalım - döngüsel referansları yok sayar
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.MaxDepth = 64;
});

// CORS politikası ekle
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("CorsOrigins").Get<string[]>())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Kimlik bilgilerini göndermeye izin ver
    });
});

// JWT kimlik doğrulama ekle
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

var app = builder.Build();

// Veritabanını başlat, migration'ları uygula ve temel verileri oluştur
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try 
    {
        var context = services.GetRequiredService<TayinDbContext>();
        
        logger.LogInformation("Veritabanına bağlanılıyor...");
        Console.WriteLine("Veritabanına bağlanılıyor...");
        
        // Veritabanı bağlantısını kontrol et
        if (context.Database.CanConnect())
        {
            logger.LogInformation("Veritabanı bağlantısı başarılı.");
            Console.WriteLine("Veritabanı bağlantısı başarılı.");
            
            // Eksik migration'ları uygula
            logger.LogInformation("Veritabanı migration'ları uygulanıyor...");
            Console.WriteLine("Veritabanı migration'ları uygulanıyor...");
            context.Database.Migrate();
            logger.LogInformation("Migration'lar başarıyla uygulandı.");
            Console.WriteLine("Migration'lar başarıyla uygulandı.");
            
            // Veritabanı başlangıç verilerini ekle
            logger.LogInformation("Veritabanı başlangıç verileri ekleniyor...");
            Console.WriteLine("Veritabanı başlangıç verileri ekleniyor...");
            await DbInitializer.InitializeAsync(context);
            logger.LogInformation("Veritabanı başlangıç verileri başarıyla eklendi.");
            Console.WriteLine("Veritabanı başlangıç verileri başarıyla eklendi.");
        }
        else
        {
            var errorMessage = "Veritabanına bağlanılamadı! Bağlantı ayarlarını kontrol edin.";
            logger.LogError(errorMessage);
            Console.WriteLine(errorMessage);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Veritabani hazırlanırken hata oluştu: {ex.Message}");
        // Daha detaylı hata bilgisi
        Console.WriteLine($"Hata detayları: {ex.ToString()}");
    }
}

// Configure the HTTP request pipeline.
// Swagger'ı hem Development hem de Production ortamında etkinleştir
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tayin API v1");
    c.RoutePrefix = string.Empty; // Root URL'de erişilebilir olacak (/)
});

// Global Exception Handler - Swagger'dan sonra gelsin
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionFeature?.Error;

        // Hata loglanıyor
        var logService = context.RequestServices.GetRequiredService<TayinAPI.Services.LogService>();
        await logService.KaydetAsync(
            "Sistem Hatası",
            $"API'de beklenmeyen hata: {exception?.Message}",
            null,
            "Sistem",
            false,
            $"{exception?.GetType().Name}: {exception?.StackTrace}"
        );

        // Hata yanıtı
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { hata = "İşlem sırasında beklenmeyen bir hata oluştu." });
    });
});

app.UseHttpsRedirection();

// CORS middleware'ini etkinleştir
app.UseCors();

// Kimlik doğrulama ve yetkilendirme middleware'lerini etkinleştir
app.UseAuthentication();
app.UseAuthorization();

// Controller'ları eşle
app.MapControllers();

app.Run();
