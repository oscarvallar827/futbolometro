from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.schemas import MatchPredictionRequest
from api.service import HybridPredictorService

app = FastAPI(
    title="Futbolómetro API - Proyecto Integrador",
    description="Predicción híbrida de partidos combinando NLP sobre comentarios y estadísticas de goles/racha.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

service = HybridPredictorService()

@app.get("/api/health")
def health_check():
    """Endpoint de estado del servicio."""
    return {"status": "ok", "modelo_nlp_activo": service.metrics["modelo_nlp_en_produccion"]}

@app.get("/api/metrics")
def obtener_metricas():
    """Devuelve las métricas de validación cruzada, prueba y comparación de modelos."""
    return service.metrics

@app.post("/api/predict")
def predecir(req: MatchPredictionRequest):
    """Recibe un comentario y las estadísticas de goles/racha y devuelve la predicción combinada."""
    return service.predecir_partido(req.model_dump())
