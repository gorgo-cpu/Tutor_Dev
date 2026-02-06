FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore ./TutorBackend.csproj
RUN dotnet publish ./TutorBackend.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:4000
EXPOSE 4000
COPY --from=build /out .
ENTRYPOINT ["dotnet", "TutorBackend.dll"]

