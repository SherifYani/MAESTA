FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["JobMagnet.API/JobMagnet.API.csproj", "JobMagnet.API/"]
COPY ["JobMagnet.Application/JobMagnet.Application.csproj", "JobMagnet.Application/"]
COPY ["JobMagnet.Core/JobMagnet.Core.csproj", "JobMagnet.Core/"]
COPY ["JobMagnet.Infrastructure/JobMagnet.Infrastructure.csproj", "JobMagnet.Infrastructure/"]

RUN dotnet restore "JobMagnet.API/JobMagnet.API.csproj"

COPY . .
WORKDIR "/src/JobMagnet.API"
RUN dotnet build "JobMagnet.API.csproj" -c Release -o /app/build

# ─── Publish Stage ────────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "JobMagnet.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ─── Final Stage ─────────────────────────────────────────────────────────────
FROM base AS final
WORKDIR /app

# Create folder for logs
RUN mkdir -p /app/logs

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "JobMagnet.API.dll"]
