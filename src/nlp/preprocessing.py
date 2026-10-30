import re
from unidecode import unidecode
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import SnowballStemmer
from sklearn.base import BaseEstimator, TransformerMixin

# Descarga silenciosa de recursos necesarios de NLTK
for resource in ["punkt", "stopwords", "punkt_tab"]:
    try:
        nltk.data.find(f"tokenizers/{resource}" if "punkt" in resource else f"corpora/{resource}")
    except LookupError:
        nltk.download(resource, quiet=True)

# Diccionario base de lematización para vocabulario futbolístico en español
LEMAS_FUTBOL = {
    "ganamos": "ganar", "ganaron": "ganar", "ganara": "ganar", "ganando": "ganar",
    "perdimos": "perder", "perdieron": "perder", "perdera": "perder", "perdiendo": "perder",
    "empatamos": "empatar", "empataron": "empatar", "empatara": "empatar",
    "goleamos": "golear", "golearon": "golear", "goles": "gol", "golazo": "gol",
    "lesionados": "lesionado", "lesion": "lesionado", "malisimo": "malo", "pesimo": "malo",
    "buenisimo": "bueno", "excelentes": "excelente", "jugadores": "jugador", "partidos": "partido"
}

class TextPreprocessor(BaseEstimator, TransformerMixin):
    """
    Transformador compatible con scikit-learn Pipeline.
    Ejecuta normalización, tokenización, filtrado de stop words (conservando negaciones)
    y reducción morfológica (stemming o lematización).
    """
    def __init__(self, reduccion: str = "stemming", conservar_negaciones: list = None):
        self.reduccion = reduccion
        self.conservar_negaciones = conservar_negaciones or ["no", "nunca", "sin", "ni", "tampoco"]

    def fit(self, X, y=None):
        # Inicializamos las stop words en español y el stemmer Snowball
        base_stopwords = set(stopwords.words("spanish"))
        # Quitamos los acentos de la lista de stop words para que coincida con el texto normalizado
        self.stop_words_ = {unidecode(w.lower()) for w in base_stopwords}
        # Retiramos las partículas de negación de la lista de exclusión
        for neg in self.conservar_negaciones:
            self.stop_words_.discard(unidecode(neg.lower()))
        self.stemmer_ = SnowballStemmer("spanish")
        return self

    def normalizar(self, texto: str) -> str:
        """Paso 1: Minúsculas, eliminación de URLs, menciones, números, puntuación y tildes."""
        if not isinstance(texto, str):
            texto = str(texto)
        texto = texto.lower()
        # Eliminar URLs
        texto = re.sub(r"http\S+|www\.\S+", " ", texto)
        # Eliminar menciones (@usuario) pero conservar el texto del hashtag
        texto = re.sub(r"@\w+", " ", texto)
        texto = texto.replace("#", " ")
        # Eliminar tildes y llevar a ASCII (conservando letras)
        texto = unidecode(texto)
        # Eliminar números y caracteres especiales/emojis
        texto = re.sub(r"[^a-z\s]", " ", texto)
        # Colapsar espacios múltiples
        texto = re.sub(r"\s+", " ", texto).strip()
        return texto

    def tokenizar(self, texto_normalizado: str) -> list:
        """Paso 2: Separar el texto en unidades léxicas (tokens)."""
        if not texto_normalizado:
            return []
        return word_tokenize(texto_normalizado, language="spanish")

    def filtrar_stopwords(self, tokens: list) -> tuple:
        """Paso 3: Filtrar palabras vacías conservando negaciones."""
        if not hasattr(self, "stop_words_"):
            self.fit([])
        tokens_limpios = [t for t in tokens if t not in self.stop_words_ and len(t) > 1]
        eliminadas = [t for t in tokens if t in self.stop_words_]
        return tokens_limpios, eliminadas

    def reducir_morfologia(self, tokens: list) -> list:
        """Paso 4: Aplicar Stemming (Snowball) o Lematización según configuración."""
        if not hasattr(self, "stemmer_"):
            self.fit([])
        if self.reduccion == "stemming":
            return [self.stemmer_.stem(t) for t in tokens]
        else:
            # Lematización híbrida basada en diccionario de dominio + reglas de sufijos
            lemas = []
            for t in tokens:
                if t in LEMAS_FUTBOL:
                    lemas.append(LEMAS_FUTBOL[t])
                elif t.endswith("ando") or t.endswith("iendo"):
                    lemas.append(t[:-4] + "ar")
                elif t.endswith("es") and len(t) > 4:
                    lemas.append(t[:-2])
                elif t.endswith("s") and len(t) > 3:
                    lemas.append(t[:-1])
                else:
                    lemas.append(t)
            return lemas

    def explain_text(self, texto: str) -> dict:
        """Devuelve el desglose paso a paso para mostrarlo en el Frontend."""
        normalizado = self.normalizar(texto)
        tokens = self.tokenizar(normalizado)
        tokens_sin_sw, sw_eliminadas = self.filtrar_stopwords(tokens)
        reducidos = self.reducir_morfologia(tokens_sin_sw)
        return {
            "original": texto,
            "normalizado": normalizado,
            "tokens": tokens,
            "stopwords_eliminadas": sw_eliminadas,
            "tokens_filtrados": tokens_sin_sw,
            "terminos_reducidos": reducidos,
            "metodo_reduccion": self.reduccion,
            "texto_final": " ".join(reducidos)
        }

    def transform(self, X):
        """Transforma una lista/Serie de textos crudos en textos procesados para TF-IDF."""
        resultados = []
        for texto in X:
            pasos = self.explain_text(texto)
            resultados.append(pasos["texto_final"])
        return resultados
