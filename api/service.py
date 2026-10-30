import json
import joblib
import pandas as pd
from src.config import ARTIFACTS_DIR, load_params
from src.models.train import FEATURES_STATS, entrenar_y_evaluar

class HybridPredictorService:
    """
    Servicio que carga los pipelines serializados (NLP y Estadísticas) al iniciar la API
    y calcula la predicción combinada sin reimplementar el preprocesamiento.
    """
    def __init__(self):
        if not (ARTIFACTS_DIR / "model_nlp.joblib").exists():
            entrenar_y_evaluar()
        self.model_nlp = joblib.load(ARTIFACTS_DIR / "model_nlp.joblib")
        self.model_stats = joblib.load(ARTIFACTS_DIR / "model_stats.joblib")
        with open(ARTIFACTS_DIR / "metrics.json", "r", encoding="utf-8") as f:
            self.metrics = json.load(f)
        self.params = load_params()

    def predecir_partido(self, payload: dict) -> dict:
        # 1. Predicción de probabilidades desde el pipeline de NLP (comentarios)
        clases_nlp = list(self.model_nlp.classes_)
        probs_nlp_arr = self.model_nlp.predict_proba([payload["comentario"]])[0]
        probs_nlp = {clases_nlp[i]: float(probs_nlp_arr[i]) for i in range(len(clases_nlp))}

        # Extraer el paso a paso del preprocesador guardado dentro del pipeline
        preprocessor = self.model_nlp.named_steps["preprocessor"]
        explicacion_nlp = preprocessor.explain_text(payload["comentario"])

        # 2. Predicción de probabilidades desde el modelo estadístico (goles y racha)
        df_stats = pd.DataFrame([{col: payload[col] for col in FEATURES_STATS}])
        clases_stats = list(self.model_stats.classes_)
        probs_stats_arr = self.model_stats.predict_proba(df_stats)[0]
        probs_stats = {clases_stats[i]: float(probs_stats_arr[i]) for i in range(len(clases_stats))}

        # 3. Ensamble ponderado (Ej. 60% Estadísticas + 40% NLP Comentarios)
        w_stats = self.params["ensamble"]["peso_stats"]
        w_nlp = self.params["ensamble"]["peso_nlp"]

        probs_finales = {}
        for c in ["local", "empate", "visitante"]:
            p_comb = (w_stats * probs_stats.get(c, 0.0)) + (w_nlp * probs_nlp.get(c, 0.0))
            probs_finales[c] = round(p_comb, 4)

        prediccion_ganadora = max(probs_finales, key=probs_finales.get)

        return {
            "prediccion_final": prediccion_ganadora,
            "probabilidades_combinadas": probs_finales,
            "desglose_modelos": {
                "probabilidades_nlp_comentarios": {k: round(v, 4) for k, v in probs_nlp.items()},
                "probabilidades_estadisticas_goles_racha": {k: round(v, 4) for k, v in probs_stats.items()},
                "pesos_aplicados": {"peso_stats": w_stats, "peso_nlp": w_nlp}
            },
            "preprocesamiento_paso_a_paso": explicacion_nlp
        }
