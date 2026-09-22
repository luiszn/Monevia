from fastapi import FastAPI

app = FastAPI(
    title="FinanzasIA AI Service",
    description="Servicio de análisis financiero con IA para FinanzasIA.",
    version="0.1.0",
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}