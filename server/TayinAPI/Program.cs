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
builder.Services.AddSwaggerGen();

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

// Veritabanını başlat ve temel verileri oluştur
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<TayinDbContext>();
        Console.WriteLine("Veritabani Basliyor...");
        await DbInitializer.InitializeAsync(context);
        Console.WriteLine("Veritabani Basariyla Basladi.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Veritabani Basiliyorken Hata: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS middleware'ini etkinleştir
app.UseCors();

// Kimlik doğrulama ve yetkilendirme middleware'lerini etkinleştir
app.UseAuthentication();
app.UseAuthorization();

// Controller'ları eşle
app.MapControllers();

// Global Exception Handler - Tüm yakalanmamış hataları loglar
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

app.Run();
