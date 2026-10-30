import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from src.config import DATA_RAW_DIR, load_params

def generar_dataset_ejemplo_si_no_existe():
    """
    Genera un dataset estructurado de ejemplo con comentarios de hinchas y estadísticas
    de partidos si aún no se ha colocado el archivo CSV en data/raw/partidos_comentarios.csv.
    Etiquetas:
      - 'local': tendencia/victoria del equipo local
      - 'empate': partido parejo / empate
      - 'visitante': tendencia/victoria del equipo visitante
    """
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_RAW_DIR / "partidos_comentarios.csv"
    if csv_path.exists():
        return csv_path

    params = load_params()
    rng = np.random.default_rng(params["semilla"])

    plantillas_local = [
        "El equipo local viene en una racha increible y seguro goleamos hoy en casa",
        "No hay forma de perder en nuestro estadio, la delantera esta impecable y anotando",
        "Excelente nivel del local, ganamos facil este partido con nuestra hinchada",
        "El visitante no juega a nada y tiene lesionados, hoy gana el local sin dudas",
        "Vamos con todo hoy en casa, venimos ganando cinco partidos seguidos"
    ]
    plantillas_empate = [
        "Partido muy cerrado y parejo, ninguno arriesga y seguro terminan empatando",
        "Los dos equipos defienden bien pero no tienen gol, huele a empate sin goles",
        "Racha irregular de ambos clubes, no veo un ganador claro para esta jornada",
        "Siempre que juegan estos dos terminan igualados, partido trabado en el mediocampo",
        "Ambos cuidan el resultado, ninguno quiere perder y van a empatar"
    ]
    plantillas_visitante = [
        "El local es un desastre total, no ganan hace meses y el visitante los va a golear",
        "Pesima defensa del equipo local, hoy gana el visitante de contragolpe",
        "El visitante llega invicto y con su goleador encendido, victoria visitante segura",
        "No tenemos defensa ni arquero, hoy perdemos en casa contra el puntero",
        "Superioridad total de la visita, vienen con mejor racha y mas goles a favor"
    ]

    filas = []
    clases = ["local", "empate", "visitante"]
    for i in range(1200):
        clase = clases[i % 3]
        if clase == "local":
            comentario = rng.choice(plantillas_local)
            goles_local = round(rng.uniform(1.5, 3.2), 2)
            goles_visita = round(rng.uniform(0.4, 1.4), 2)
            racha_local = int(rng.integers(9, 16))
            racha_visita = int(rng.integers(1, 8))
        elif clase == "empate":
            comentario = rng.choice(plantillas_empate)
            goles_local = round(rng.uniform(0.8, 1.6), 2)
            goles_visita = round(rng.uniform(0.8, 1.6), 2)
            racha_local = int(rng.integers(5, 11))
            racha_visita = int(rng.integers(5, 11))
        else:
            comentario = rng.choice(plantillas_visitante)
            goles_local = round(rng.uniform(0.3, 1.3), 2)
            goles_visita = round(rng.uniform(1.6, 3.1), 2)
            racha_local = int(rng.integers(1, 7))
            racha_visita = int(rng.integers(9, 16))

        filas.append({
            "id_partido": i + 1,
            "comentario": comentario,
            "promedio_goles_local": goles_local,
            "promedio_goles_visitante": goles_visita,
            "racha_puntos_local": racha_local,
            "racha_puntos_visitante": racha_visita,
            "resultado": clase
        })

    df = pd.DataFrame(filas)
    df.to_csv(csv_path, index=False, encoding="utf-8")
    return csv_path

def cargar_y_dividir_datos():
    """Carga el dataset, limpia nulos y realiza división estratificada entrenamiento/prueba."""
    params = load_params()
    csv_path = generar_dataset_ejemplo_si_no_existe()
    df = pd.read_csv(csv_path, encoding="utf-8").dropna().drop_duplicates(subset=["id_partido"])

    train_df, test_df = train_test_split(
        df,
        test_size=params["test_size"],
        random_state=params["semilla"],
        stratify=df["resultado"]
    )
    return train_df, test_df
