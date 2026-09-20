namespace backend;

using backend.Services;
using backend.Middleware;
using backend.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


public class Program
{
    public static void Main(string[] args)
    {
        // Initialize currency from environment variable (set at build/deployment time)
        var currencyArg = Environment.GetEnvironmentVariable("CURRENCY_CODE");
        Config.Initialize(currencyArg);

        var builder = WebApplication.CreateBuilder(args);
        var jwtKey = builder.Configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured. Please set environment variable JWT__Key.");
        var key = Encoding.UTF8.GetBytes(jwtKey);
        builder.Services.AddSingleton<IJwtKeyProvider>(new JwtKeyProvider(jwtKey));

        Console.WriteLine("Starting application...");

        // Add services
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddHttpClient();
        builder.Services.AddScoped<TransactionLogService>();
        builder.Services.AddScoped<CommitmentService>();

        // JWT Authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        //Console.WriteLine($"OnMessageReceived: Token = {context.Token}");
                        //Console.WriteLine("Token recieved");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        //Console.WriteLine("OnTokenValidated: Success");
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"OnAuthenticationFailed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();

        // Database
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        // CORS: in dev allow Vite (localhost:5173), in production allow specific domain
        var allowedOrigins = builder.Environment.IsDevelopment()
            ? new[] { Config.DEV_DOMAIN }             // Vite dev server
            : new[] { Config.PRODUCT_DOMAIN };        // production domain

        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        // In-memory caching
        builder.Services.AddMemoryCache();

        // Swagger
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });

        /* Built app */
        var app = builder.Build();
        app.UseMiddleware<ErrorHandlingMiddleware>();


        // Configure pipeline
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseCors("AllowFrontend");
        }
        else
        {
            // Disable CORS in production -- frontend is served from same origin
            // app.UseHttpsRedirection();
            // app.MapFallbackToFile("index.html");
        }

        // Authentication must come before Authorization
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();


        // Database migrations
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate(); // Creates DB or updates to latest migration
        }

        Console.WriteLine("Application configured. Starting...");
        app.Run();

    }
}
