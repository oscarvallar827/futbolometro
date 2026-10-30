from pydantic import BaseModel, Field, field_validator

class MatchPredictionRequest(BaseModel):
    comentario: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        description="Comentario o publicación de redes sociales sobre el partido"
    )
    promedio_goles_local: float = Field(..., ge=0.0, le=10.0, description="Promedio de goles anotados por el local")
    promedio_goles_visitante: float = Field(..., ge=0.0, le=10.0, description="Promedio de goles anotados por el visitante")
    racha_puntos_local: int = Field(..., ge=0, le=15, description="Puntos obtenidos por el local en los últimos 5 partidos (0 a 15)")
    racha_puntos_visitante: int = Field(..., ge=0, le=15, description="Puntos obtenidos por el visitante en los últimos 5 partidos (0 a 15)")

    @field_validator("comentario")
    @classmethod
    def validar_comentario_no_vacio(cls, v: str) -> str:
        texto = v.strip()
        if len(texto.split()) < 2:
            raise ValueError("El comentario debe contener al menos 2 palabras para ser analizado.")
        return texto
