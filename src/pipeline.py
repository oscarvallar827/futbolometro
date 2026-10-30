from src.models.train import entrenar_y_evaluar

def main():
    """Punto de entrada único reproducible: python -m src.pipeline"""
    print("Iniciando pipeline reproducible de Futbolómetro...")
    resumen = entrenar_y_evaluar()
    print("Artefactos guardados en artifacts/ exitosamente.")
    print(resumen)

if __name__ == "__main__":
    main()
