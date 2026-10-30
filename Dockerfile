# API do Enxoval para hospedar (Fly.io, Render, Railway...). Tudo que precisa persistir fica em /dados
# (montar um volume aí): banco SQLite, fotos e chaves do cookie de login. Ver docs/hospedagem.md.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/Enxoval.Domain/Enxoval.Domain.csproj src/Enxoval.Domain/
COPY src/Enxoval.Api/Enxoval.Api.csproj src/Enxoval.Api/
RUN dotnet restore src/Enxoval.Api/Enxoval.Api.csproj
COPY src/Enxoval.Domain/ src/Enxoval.Domain/
COPY src/Enxoval.Api/ src/Enxoval.Api/
RUN dotnet publish src/Enxoval.Api/Enxoval.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
# Fontes para o PDF (QuestPDF) e a largura de colunas do Excel (ClosedXML).
RUN apt-get update && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080 \
    ConnectionStrings__Enxoval="Data Source=/dados/enxoval.db" \
    Fotos__Pasta=/dados/fotos \
    DataProtection__Pasta=/dados/chaves
EXPOSE 8080
ENTRYPOINT ["dotnet", "Enxoval.Api.dll"]
