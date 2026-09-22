## Cómo ejecutar cada parte

### Backend (ASP.NET Core API)

```powershell
cd backend\FinanzasIA.API
dotnet run
```

- API en `http://localhost:5226`
- Documentación OpenAPI en `http://localhost:5226/openapi/v1.json`

Base de datos: SQL Server local. La conexión está en `appsettings.json`. Para crear la base de datos:

```powershell
dotnet ef database update
```

### Frontend (React + TypeScript)

```powershell
cd frontend
npm install
npm run dev
```

- Aplicación en `http://localhost:5173`
- El proxy de Vite reenvía `/api` al backend en `http://localhost:5226`

### Servicio de IA (FastAPI)

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8123
```

- Healthcheck en `http://localhost:8123/api/health`