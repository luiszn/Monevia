<div align="center">

# 💸 Monevia

**Gestión de finanzas personales con análisis inteligente por IA**

[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

*Registra ingresos y gastos, define presupuestos y obtén insights automáticos sobre tus finanzas.*

</div>

---

##  Características

| Módulo | Descripción |
|--------|-------------|
|  **Dashboard** | Balance general, comparación con el período anterior, gastos por categoría y evolución diaria con gráficos interactivos |
|  **Ingresos & Gastos** | Registro, edición, eliminación, búsqueda y filtros avanzados por período, categoría y tipo |
|  **Presupuestos** | Presupuestos por categoría con avisos automáticos — ⚠️ ≥ 85% *"Cerca del límite"* / 🔴 100% *"Superado"* |
|  **Análisis IA** | Resumen del período, mayor gasto, alertas de presupuesto y respuestas a preguntas en lenguaje natural |
|  **Seguridad** | Autenticación JWT con contraseñas hasheadas (BCrypt) y aislamiento total de datos por usuario |
|  **UI/UX** | Modo claro/oscuro, diseño responsive y navegación lateral |

###  Consultas de ejemplo al asistente IA

```
¿En qué gasté más esta semana?
¿Cuánto gasté en comida este mes?
¿Cómo voy con mis presupuestos?
```

> Por defecto el servicio IA funciona con **reglas** (sin API key ni conexión externa). Configurando
> `OPENAI_API_KEY` y `OPENAI_MODELO`, las respuestas se generan con un LLM compatible con la API de OpenAI.

---

##  Arquitectura

```
┌──────────────────┐         /api          ┌───────────────────────────┐
│   Frontend       │ ───────────────────►  │   ASP.NET Core Web API    │
│  React + TS      │                       │   JWT · EF Core           │
│  (Vite · :5173)  │                       │   (:5226)                 │
└──────────────────┘                       └────────────┬──────────────┘
                                                        │
                                           HTTP (datos reales del usuario)
                                                        │
                                                        ▼
                                           ┌────────────────────────────┐
                                           │   Servicio IA (Python)     │
                                           │   FastAPI · (:8123)        │
                                           │   Reglas + LLM opcional    │
                                           └────────────────────────────┘
                                                        │
                                                        ▼
                                                  SQL Server 2022
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router, Recharts |
| **Backend** | ASP.NET Core 10, Entity Framework Core, JWT Bearer |
| **Servicio IA** | Python 3.13+, FastAPI, Pydantic v2 |
| **Base de datos** | SQL Server 2022 |
| **Infraestructura** | Docker Compose, nginx |

---

## 📋 Requisitos previos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) (en Windows se usa `npm.cmd`)
- [Python 3.13+](https://python.org/) (con Python 3.14 usar Pydantic ≥ 2.13)
- SQL Server local o en contenedor

---

## 🚀 Inicio rápido

### Opción A — Docker Compose *(recomendado)*

La forma más sencilla de levantar todo el stack de una sola vez:

```powershell
docker compose up --build
```

Levanta SQL Server 2022, la API, el servicio IA y el frontend servido por nginx.  
Las migraciones de BD se aplican automáticamente al arrancar.

| Servicio | URL |
|----------|-----|
|  Frontend | http://localhost:5173 |
|  API REST | http://localhost:5226 |
|  Servicio IA | http://localhost:8123 |

> ⚠️ **Seguridad**: cambia la clave JWT (`Jwt__Key`) y la contraseña SA de SQL Server antes de desplegar en un entorno público.

---

### Opción B — Desarrollo local

#### 1. Backend — ASP.NET Core API

```powershell
cd backend\Monevia.API
dotnet restore
dotnet ef database update   # Solo la primera vez: crea la BD y aplica datos semilla
dotnet run
```

- API disponible en: `http://localhost:5226`
- OpenAPI (Swagger): `http://localhost:5226/openapi/v1.json`
- Configuración de BD en: `appsettings.json` → `ConnectionStrings__DefaultConnection`

#### 2. Servicio IA — FastAPI

```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8123
```

- Healthcheck: `http://localhost:8123/api/health`

> **Importante**: ejecuta siempre desde la carpeta `ai-service` para que el módulo `app.main` esté disponible en el path.

#### 3. Frontend — React + TypeScript

```powershell
cd frontend
npm install
npm.cmd run dev
```

- Aplicación en: `http://localhost:5173`
- El proxy de Vite reenvía `/api` al backend en `:5226` automáticamente.

---

##  Pruebas

```powershell
# Backend — xUnit
cd backend\Monevia.API.Tests
dotnet test

# Servicio IA — pytest
cd ai-service
.\.venv\Scripts\python.exe -m pytest -q

# Frontend — build + lint
cd frontend
npm.cmd run build
npm.cmd run lint
```

---

## ⚙️ Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|:---------:|
| `Jwt__Key` | Clave secreta para firmar tokens JWT | ✅ |
| `ConnectionStrings__DefaultConnection` | Cadena de conexión a SQL Server | ✅ |
| `IA__BaseUrl` | URL del servicio IA (ej. `http://localhost:8123`) | ✅ |
| `OPENAI_API_KEY` | API key de OpenAI — habilita respuestas con LLM | ⬜ |
| `OPENAI_MODELO` | Modelo a usar (ej. `gpt-4o-mini`) | ⬜ |

Todas pueden configurarse directamente en `docker-compose.yml` para el despliegue en contenedores.

---

## 📁 Estructura del proyecto

```
Monevia/
├── backend/
│   ├── Monevia.API/          # ASP.NET Core Web API
│   └── Monevia.API.Tests/    # Pruebas unitarias (xUnit)
├── frontend/                 # App React + TypeScript (Vite)
├── ai-service/
│   ├── app/                  # FastAPI — lógica de IA y reglas
│   └── tests/                # Pruebas del servicio IA (pytest)
└── docker-compose.yml        # Orquestación completa del stack
```

---

<div align="center">

Hecho con ❤️ &nbsp;·&nbsp; [Reportar un problema](../../issues) &nbsp;·&nbsp; [Solicitar una función](../../issues)

</div>
