from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.preprocessing import StandardScaler
from src.nlp.preprocessing import TextPreprocessor

def construir_pipeline_nlp(modelo_nombre: str, params: dict) -> Pipeline:
    """
    Construye el pipeline reproducible de NLP:
    TextPreprocessor -> TfidfVectorizer -> Clasificador (Naive Bayes, Regresión Logística o Línea Base).
    """
    nlp_cfg = params["nlp"]
    preprocessor = TextPreprocessor(
        reduccion=nlp_cfg["reduccion"],
        conservar_negaciones=nlp_cfg["conservar_negaciones"]
    )
    vectorizer = TfidfVectorizer(
        ngram_range=tuple(nlp_cfg["ngram_range"]),
        max_features=nlp_cfg["max_features"],
        min_df=nlp_cfg["min_df"],
        max_df=nlp_cfg["max_df"]
    )

    if modelo_nombre == "baseline":
        clf = DummyClassifier(strategy="most_frequent")
    elif modelo_nombre == "naive_bayes":
        nb_cfg = params["modelos_nlp"]["naive_bayes"]
        clf = MultinomialNB(alpha=nb_cfg["alpha"])
    elif modelo_nombre == "logistic_regression":
        lr_cfg = params["modelos_nlp"]["logistic_regression"]
        clf = LogisticRegression(
            C=lr_cfg["C"],
            max_iter=lr_cfg["max_iter"],
            class_weight=lr_cfg["class_weight"],
            random_state=params["semilla"]
        )
    else:
        raise ValueError(f"Modelo NLP no reconocido: {modelo_nombre}")

    return Pipeline([
        ("preprocessor", preprocessor),
        ("tfidf", vectorizer),
        ("clf", clf)
    ])

def construir_pipeline_stats(params: dict) -> Pipeline:
    """
    Construye el pipeline único para estadísticas numéricas (goles y racha):
    StandardScaler -> LogisticRegression.
    """
    st_cfg = params["modelo_stats"]
    return Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(
            C=st_cfg["C"],
            max_iter=st_cfg["max_iter"],
            random_state=params["semilla"]
        ))
    ])
