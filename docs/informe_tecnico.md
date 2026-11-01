# Informe Técnico - Futbolómetro

## 1. Problema
Predicción del resultado de un partido de fútbol (`local`, `empate` o `visitante`) combinando:
- Análisis de texto (comentarios/análisis de hinchas o prensa) mediante NLP.
- Variables estadísticas (promedio de goles y racha de puntos de los últimos 5 partidos).

## 2. Dataset
Se utiliza un conjunto de datos de ejemplo sintético generado por el pipeline cuando no existe un CSV externo.  
El texto está en español. El origen y la generación se documentan en `src/data/prepare.py`.

## 3. Pipeline de NLP
El preprocesamiento incluye:
- Normalización (minúsculas, eliminación de tildes, puntuación, etc.)
- Tokenización
- Eliminación de stop words (conservando negaciones)
- Stemming
- N-gramas (unigramas + bigramas)
- Vectorización TF-IDF

Se comparó Naive Bayes Multinomial contra Regresión Logística. Se eligió el de mejor F1-macro en validación cruzada.

## 4. Modelos
- **NLP**: Naive Bayes vs Regresión Logística (se selecciona el mejor).
- **Estadístico**: Regresión Logística sobre promedio de goles y racha de puntos.
- **Ensamble**: combinación ponderada de las probabilidades de ambos modelos (60% stats / 40% NLP por defecto).

## 5. Arquitectura
- `src/pipeline.py`: entrenamiento reproducible con un solo comando.
- `api/`: FastAPI que carga los modelos serializados y expone `/api/predict`, `/api/metrics` y `/api/health`.
- `frontend/`: React + Vite que consume la API y muestra predicción, probabilidades, desglose y preprocesamiento paso a paso.

## 6. Resultados
El pipeline genera métricas de comparación de modelos y las guarda en `artifacts/`.  
El backend las expone y el frontend las muestra.

## 7. Uso de IA
Se utilizó asistencia de IA para la generación de partes del frontend y la documentación, con revisión y adaptación del equipo.