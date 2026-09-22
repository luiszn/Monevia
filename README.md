# FinanzasIA

Aplicación de finanzas personales con **análisis inteligente por IA**. Registra tus ingresos y
gastos, define presupuestos y obtén insights automáticos sobre tus finanzas.

## Características

- **Ingresos / Gastos**: registro, edición, eliminación, búsqueda y filtros (por período, categoría y tipo).
- **Presupuestos**: por categoría con avisos automáticos (⚬ ≥85% "Cerca", ✖ 100% "Superado").
- **Dashboard**: balance, comparación con el período anterior, gastos por categoría y evolución diaria (gráficos).
- **Análisis IA**: resumen del período, mayor gasto, alertas de presupuesto y respuesta a preguntas en lenguaje natural (`¿En qué gasté más esta semana?`, `¿Cuánto gasté en comida?`, `¿Cómo voy con mis presupuestos?`).
- **Seguridad**: autenticación JWT con contraseñas hasheadas (BCrypt) y aislamiento total de datos por usuario.
- **Temas**: modo claro/oscuro y diseño responsive con navegación lateral.

## Arquitectura

```
┌─────────────┐   /api   ┌──────────────────────┐    SQL Server
│  Frontend   │ ───────► │  ASP.NET Core Web API │ ────────────────►
│ React + TS  │          │  (JWT + EF Core)      │
└─────────────┘          └──────────┬───────────┘
                                    │ HTTP (datos reales del usuario)
                                    ▼
                          ┌──────────────────────┐
                          │  Servicio IA (Python │
                          │  FastAPI) - reglas + │
                          │  LLM opcional        │
                          └──────────────────────┘
```

Por defecto el servicio IA funciona con **reglas** (sin API key ni conexión externa). Si se definen
las variables de entorno `OPENAI_API_KEY` y `OPENAI_MODELO`, las preguntas y resúmenes se generan con
un LLM compatible con la API de OpenAI.

## Requisitos

- .NET SDK 10
- Node.js 20+ (se usa `npm.cmd` en Windows)
- Python 3.13+ (con Python 3.14 usar pydantic ≥ 2.13)
- SQL Server local (o contenedor)

## Cómo ejecutar

### 1. Backend (ASP.NET Core API)

```powershell
cd backend\FinanzasIA.API
dotnet restore
dotnet ef database update   # solo la primera vez: crea la BD y los datos semilla
dotnet run
```

- API en `http://localhost:5226` · OpenAPI en `http://localhost:5226/openapi/v1.json`
- La conexión a BD está en `appsettings.json`

### 2. Servicio de IA (FastAPI)

```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8123
```

- Healthcheck en `http://localhost:8123/api/health`
- **Importante**: debe ejecutarse desde la carpeta `ai-service` para que el módulo `app.main` esté disponible.

### 3. Frontend (React + TypeScript)

```powershell
cd frontend
npm install
npm.cmd run dev
```

- Aplicación en `http://localhost:5173` (el proxy de Vite reenvía `/api` al backend en `:5226`)

## Pruebas

```powershell
# Backend (xUnit)
cd backend\FinanzasIA.API.Tests
dotnet test

# Servicio IA (pytest)
cd ai-service
.\.venv\Scripts\python.exe -m pytest -q

# Frontend (build + lint)
cd frontend
npm.cmd run build
npm.cmd run lint
```

## Despliegue con Docker

```powershell
docker compose up --build
```

Incluye: SQL Server 2022, API, servicio IA y frontend servido por nginx.

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5226 |
| Servicio IA | http://localhost:8123 |

La base de datos y las migraciones se aplican automáticamente al arrancar la API. La clave JWT,
la conexión a SQL Server y la URL del servicio IA se configuran por variables de entorno
(`Jwt__Key`, `ConnectionStrings__DefaultConnection`, `IA__BaseUrl`) y pueden editarse en
`docker-compose.yml`.

> ⚠️ **Seguridad**: cambia la clave JWT y la contraseña `SA` de SQL Server antes de usar esto en un entorno público.