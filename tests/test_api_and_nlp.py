from fastapi.testclient import TestClient
from api.main import app
from src.nlp.preprocessing import TextPreprocessor

client = TestClient(app)

def test_preprocessor_conserva_negacion():
    prep = TextPreprocessor(reduccion="stemming").fit([])
    info = prep.explain_text("El equipo local NO juega bien hoy!")
    assert "no" in info["tokens_filtrados"]

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_predict_endpoint():
    payload = {
        "comentario": "El equipo local viene goleando y no pierde en casa",
        "promedio_goles_local": 2.4,
        "promedio_goles_visitante": 0.9,
        "racha_puntos_local": 13,
        "racha_puntos_visitante": 4
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediccion_final" in data
    assert "preprocesamiento_paso_a_paso" in data
