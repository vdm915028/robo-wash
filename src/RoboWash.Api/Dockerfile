# Образ собирается из папки проекта: на клиент API не смотрит, а тесты в рантайм не едут.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Манифест копируется отдельно от кода: пока зависимости не менялись, слой с restore берётся из кэша.
COPY RoboWash.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Cloud Run шлёт запросы на 8080, если не сказано иное. ASP.NET Core про переменную PORT не знает,
# поэтому порт задаётся здесь явно — иначе контракт держался бы на совпадении двух умолчаний.
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app ./
ENTRYPOINT ["dotnet", "RoboWash.Api.dll"]
