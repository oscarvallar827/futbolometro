from pydantic import BaseModel, Field, field_validator

class MatchPredictionRequest(BaseModel):
    comentario: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Comentario o análisis sobre el partido"
    )
    promedio_goles_local: float = Field(..., ge=0.0, le=6.0, description="Promedio de goles del local (0 a 6)")
    promedio_goles_visitante: float = Field(..., ge=0.0, le=6.0, description="Promedio de goles del visitante (0 a 6)")
    racha_puntos_local: int = Field(..., ge=0, le=15, description="Puntos del local en los últimos 5 partidos (0 a 15)")
    racha_puntos_visitante: int = Field(..., ge=0, le=15, description="Puntos del visitante en los últimos 5 partidos (0 a 15)")

    @field_validator("comentario")
    @classmethod
    def validar_comentario(cls, v: str) -> str:
        texto = v.strip()
        if not texto:
            raise ValueError("El comentario no puede estar vacío.")
        palabras = texto.split()
        if len(palabras) < 3:
            raise ValueError("El comentario debe tener al menos 3 palabras para poder analizarse.")
        if len(texto) < 10:
            raise ValueError("El comentario es demasiado corto.")
        return texto

    @field_validator("promedio_goles_local", "promedio_goles_visitante")
    @classmethod
    def validar_promedio_goles(cls, v: float) -> float:
        if v < 0:
            raise ValueError("El promedio de goles no puede ser negativo.")
        if v > 6:
            raise ValueError("El promedio de goles no puede ser mayor a 6.")
        return round(v, 2)

    @field_validator("racha_puntos_local", "racha_puntos_visitante")
    @classmethod
    def validar_racha(cls, v: int) -> int:
        if v < 0 or v > 15:
            raise ValueError("La racha de puntos debe estar entre 0 y 15.")
        return v