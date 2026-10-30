from pathlib import Path
import yaml

# Ruta raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
PARAMS_PATH = BASE_DIR / "params.yaml"
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

def load_params() -> dict:
    """Carga los hiperparámetros y configuraciones desde params.yaml."""
    with open(PARAMS_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)
