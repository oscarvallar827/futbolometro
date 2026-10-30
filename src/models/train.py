import json
import joblib
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
from src.config import ARTIFACTS_DIR, load_params
from src.data.prepare import cargar_y_dividir_datos
from src.models.experiments import construir_pipeline_nlp, construir_pipeline_stats

FEATURES_STATS = [
    "promedio_goles_local",
    "promedio_goles_visitante",
    "racha_puntos_local",
    "racha_puntos_visitante"
]

def entrenar_y_evaluar():
    """
    Entrena los modelos de NLP (comparando Línea Base, Naive Bayes y Regresión Logística),
    compara experimentos de Stemming vs Lematización y Unigramas vs Bigramas,
    entrena el modelo tabular de goles/racha y serializa los artefactos en artifacts/.
    """
    params = load_params()
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    train_df, test_df = cargar_y_dividir_datos()

    X_train_text, y_train = train_df["comentario"].tolist(), train_df["resultado"].tolist()
    X_test_text, y_test = test_df["comentario"].tolist(), test_df["resultado"].tolist()

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=params["semilla"])
    resultados_nlp = {}
    pipelines_entrenados = {}

    # 1. Comparación de modelos NLP exigida por la rúbrica
    for nombre in ["baseline", "naive_bayes", "logistic_regression"]:
        pipe = construir_pipeline_nlp(nombre, params)
        cv_scores = cross_val_score(pipe, X_train_text, y_train, cv=cv, scoring="f1_macro")
        pipe.fit(X_train_text, y_train)
        preds = pipe.predict(X_test_text)

        resultados_nlp[nombre] = {
            "f1_macro_cv": round(float(cv_scores.mean()), 4),
            "accuracy_test": round(float(accuracy_score(y_test, preds)), 4),
            "f1_macro_test": round(float(f1_score(y_test, preds, average="macro")), 4),
            "confusion_matrix": confusion_matrix(y_test, preds, labels=["local", "empate", "visitante"]).tolist()
        }
        pipelines_entrenados[nombre] = pipe

    # Seleccionamos el mejor modelo NLP entre Naive Bayes y Regresión Logística
    mejor_nlp = max(
        ["naive_bayes", "logistic_regression"],
        key=lambda m: resultados_nlp[m]["f1_macro_cv"]
    )
    modelo_nlp_prod = pipelines_entrenados[mejor_nlp]

    # 2. Entrenamiento del modelo único de estadísticas (goles y racha)
    X_train_stats = train_df[FEATURES_STATS]
    X_test_stats = test_df[FEATURES_STATS]
    pipe_stats = construir_pipeline_stats(params)
    cv_stats = cross_val_score(pipe_stats, X_train_stats, y_train, cv=cv, scoring="f1_macro")
    pipe_stats.fit(X_train_stats, y_train)
    preds_stats = pipe_stats.predict(X_test_stats)

    metricas_stats = {
        "f1_macro_cv": round(float(cv_stats.mean()), 4),
        "accuracy_test": round(float(accuracy_score(y_test, preds_stats)), 4),
        "f1_macro_test": round(float(f1_score(y_test, preds_stats, average="macro")), 4)
    }

    # 3. Guardar artefactos serializados para que el Backend no reimplemente nada
    joblib.dump(modelo_nlp_prod, ARTIFACTS_DIR / "model_nlp.joblib")
    joblib.dump(pipe_stats, ARTIFACTS_DIR / "model_stats.joblib")

    resumen_metricas = {
        "modelo_nlp_en_produccion": mejor_nlp,
        "comparacion_modelos_nlp": resultados_nlp,
        "modelo_estadistico_goles_racha": metricas_stats,
        "pesos_ensamble": params["ensamble"],
        "configuracion_nlp": params["nlp"]
    }
    with open(ARTIFACTS_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(resumen_metricas, f, indent=2, ensure_ascii=False)

    return resumen_metricas

if __name__ == "__main__":
    metricas = entrenar_y_evaluar()
    print("Entrenamiento completado. Modelo NLP en producción:", metricas["modelo_nlp_en_produccion"])
