# Futbolómetro - Proyecto Integrador (NLP + Estadísticas de Partidos)

Sistema web completo que predice el resultado de un partido de fútbol (`local`, `empate`, `visitante`) combinando:
1. **Pipeline completo de NLP** sobre comentarios y publicaciones de hinchas/prensa (comparando **Naive Bayes Multinomial** y **Regresión Logística** contra una línea base).
2. **Modelo estadístico tabular** (**Regresión Logística**) basado en el promedio de goles y la racha de puntos de los últimos 5 partidos.
3. **Ensamble ponderado en el Backend (FastAPI)** que integra las probabilidades de ambos motores sin reimplementar el preprocesamiento.

## Ejecución rápida desde cero

```bash
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 1. Entrenar modelos y generar artefactos con un solo comando
python -m src.pipeline

# 2. Levantar el Backend con FastAPI
uvicorn api.main:app --reload --port 8000
```
