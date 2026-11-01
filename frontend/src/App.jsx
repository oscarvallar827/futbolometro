import { useState, useEffect, useRef } from 'react'
import './App.css'

const LIGAS = {
  "Premier League": ["Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Ipswich Town", "Leicester City", "Liverpool", "Manchester City", "Manchester United", "Newcastle", "Nottingham Forest", "Southampton", "Tottenham", "West Ham", "Wolves"],
  "La Liga": ["Alavés", "Athletic Club", "Atlético Madrid", "Barcelona", "Betis", "Celta", "Espanyol", "Getafe", "Girona", "Las Palmas", "Leganés", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Valladolid", "Villarreal"],
  "Serie A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "Bundesliga": ["Augsburg", "Bayern Munich", "Bochum", "Dortmund", "Eintracht Frankfurt", "Freiburg", "Heidenheim", "Hoffenheim", "Holstein Kiel", "Leverkusen", "Mainz", "Mönchengladbach", "RB Leipzig", "St. Pauli", "Stuttgart", "Union Berlin", "Werder Bremen", "Wolfsburg"],
  "Ligue 1": ["Angers", "Auxerre", "Brest", "Le Havre", "Lens", "Lille", "Lyon", "Marseille", "Monaco", "Montpellier", "Nantes", "Nice", "Paris Saint-Germain", "Reims", "Rennes", "Saint-Étienne", "Strasbourg", "Toulouse"],
  "Liga Boliviana": ["Always Ready", "Aurora", "Blooming", "Bolívar", "Guabirá", "Independiente Petrolero", "Jorge Wilstermann", "Nacional Potosí", "Oriente Petrolero", "Real Santa Cruz", "Royal Pari", "San Antonio Bulo Bulo", "The Strongest", "Universitario de Vinto"],
  "Champions League": ["Arsenal", "Aston Villa", "Atlético Madrid", "Barcelona", "Bayern Munich", "Benfica", "Borussia Dortmund", "Celtic", "Club Brugge", "Feyenoord", "Inter", "Juventus", "Leverkusen", "Liverpool", "Manchester City", "Milan", "Monaco", "PSG", "Real Madrid", "Sporting CP"],
  "Copa Libertadores": ["Atlético Mineiro", "Boca Juniors", "Bolívar", "Colo-Colo", "Flamengo", "Fluminense", "Grêmio", "Independiente del Valle", "Palmeiras", "Peñarol", "River Plate", "San Lorenzo", "São Paulo", "The Strongest"],
  "Copa Sudamericana": ["Always Ready", "América Mineiro", "Athletico Paranaense", "Barcelona SC", "Belgrano", "Botafogo", "Bragantino", "Corinthians", "Defensa y Justicia", "Fortaleza", "Internacional", "Lanús", "LDU Quito", "Racing"]
}

function App() {
  const [ligaLocal, setLigaLocal] = useState("Premier League")
  const [ligaVisitante, setLigaVisitante] = useState("Premier League")
  const [equipoLocal, setEquipoLocal] = useState("Arsenal")
  const [equipoVisitante, setEquipoVisitante] = useState("Liverpool")

  const [form, setForm] = useState({
    comentario: "El equipo local viene en una racha increible y seguro goleamos hoy en casa",
    promedio_goles_local: 2.1,
    promedio_goles_visitante: 0.9,
    racha_puntos_local: 12,
    racha_puntos_visitante: 5
  })

  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio("/champions.mp3")
    audioRef.current.volume = 0.6
  }, [])

  const playChampions = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const stopChampions = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleLigaLocal = (e) => {
    const value = e.target.value
    setLigaLocal(value)
    setEquipoLocal(LIGAS[value][0])
    if (value === "Champions League") playChampions()
    else stopChampions()
  }

  const handleLigaVisitante = (e) => {
    const value = e.target.value
    setLigaVisitante(value)
    setEquipoVisitante(LIGAS[value][0])
    if (value === "Champions League") playChampions()
    else stopChampions()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name.includes("promedio") || name.includes("racha") ? parseFloat(value) || 0 : value
    }))
  }

  const predecir = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError("")
    setResultado(null)

    try {
      const payload = {
        comentario: form.comentario,
        promedio_goles_local: form.promedio_goles_local,
        promedio_goles_visitante: form.promedio_goles_visitante,
        racha_puntos_local: form.racha_puntos_local,
        racha_puntos_visitante: form.racha_puntos_visitante
      }

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Error en la API")
      const data = await res.json()
      setResultado(data)
    } catch (err) {
      setError("No se pudo conectar con el backend. Asegúrate de que la API esté corriendo en http://localhost:8000")
    } finally {
      setCargando(false)
    }
  }

  const getColor = (pred) => {
    if (pred === "local") return "#10b981"
    if (pred === "empate") return "#f59e0b"
    return "#ef4444"
  }

  const getLabel = (pred) => {
    if (pred === "local") return equipoLocal
    if (pred === "empate") return "Empate"
    return equipoVisitante
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚽</span>
          <div>
            <h1>Futbolómetro</h1>
            <p>Predicción inteligente de partidos</p>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="match-card">
          <div className="match-header">
            <h2>Nuevo Análisis de Partido</h2>
            <span className="badge">Híbrido NLP + Stats</span>
          </div>

          <form onSubmit={predecir} className="form">
            <div className="field">
              <label>Comentario / Análisis del partido</label>
              <textarea
                name="comentario"
                value={form.comentario}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="stats-grid">
              <div className="stat-group">
                <label>Liga Local</label>
                <select value={ligaLocal} onChange={handleLigaLocal}>
                  {Object.keys(LIGAS).map(liga => <option key={liga}>{liga}</option>)}
                </select>
                <label>Equipo Local</label>
                <select value={equipoLocal} onChange={(e) => setEquipoLocal(e.target.value)}>
                  {LIGAS[ligaLocal].map(eq => <option key={eq}>{eq}</option>)}
                </select>
                <div className="inputs">
                  <div className="field">
                    <label>Prom. Goles</label>
                    <input type="number" step="0.1" name="promedio_goles_local" value={form.promedio_goles_local} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Racha Puntos</label>
                    <input type="number" name="racha_puntos_local" value={form.racha_puntos_local} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="vs">VS</div>

              <div className="stat-group">
                <label>Liga Visitante</label>
                <select value={ligaVisitante} onChange={handleLigaVisitante}>
                  {Object.keys(LIGAS).map(liga => <option key={liga}>{liga}</option>)}
                </select>
                <label>Equipo Visitante</label>
                <select value={equipoVisitante} onChange={(e) => setEquipoVisitante(e.target.value)}>
                  {LIGAS[ligaVisitante].map(eq => <option key={eq}>{eq}</option>)}
                </select>
                <div className="inputs">
                  <div className="field">
                    <label>Prom. Goles</label>
                    <input type="number" step="0.1" name="promedio_goles_visitante" value={form.promedio_goles_visitante} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Racha Puntos</label>
                    <input type="number" name="racha_puntos_visitante" value={form.racha_puntos_visitante} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="predict-btn" disabled={cargando}>
              {cargando ? "Analizando..." : "Obtener Predicción"}
            </button>
          </form>
        </div>

        {error && <div className="error-card">{error}</div>}

        {resultado && (
          <div className="result-card">
            <div className="result-header">
              <h2>{equipoLocal} vs {equipoVisitante}</h2>
              <p className="ligas-info">{ligaLocal} · {ligaVisitante}</p>
            </div>

            <div className="prediction-box" style={{ borderColor: getColor(resultado.prediccion_final) }}>
              <div className="prediction-label">Predicción Final</div>
              <div className="prediction-value" style={{ color: getColor(resultado.prediccion_final) }}>
                {getLabel(resultado.prediccion_final)}
              </div>
            </div>

            <div className="probs-section">
              <h3>Probabilidades</h3>
              {Object.entries(resultado.probabilidades_combinadas).map(([clase, prob]) => (
                <div key={clase} className="prob-row">
                  <span className="prob-name">{getLabel(clase)}</span>
                  <div className="prob-bar">
                    <div className="prob-fill" style={{ width: `${prob * 100}%`, background: getColor(clase) }} />
                  </div>
                  <span className="prob-percent">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="breakdown">
              <h3>Desglose de Modelos</h3>
              <div className="breakdown-grid">
                <div className="model-card">
                  <h4>NLP (Comentarios)</h4>
                  {Object.entries(resultado.desglose_modelos.probabilidades_nlp_comentarios).map(([k, v]) => (
                    <div key={k} className="model-line">
                      <span>{getLabel(k)}</span>
                      <strong>{(v * 100).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
                <div className="model-card">
                  <h4>Estadísticas</h4>
                  {Object.entries(resultado.desglose_modelos.probabilidades_estadisticas_goles_racha).map(([k, v]) => (
                    <div key={k} className="model-line">
                      <span>{getLabel(k)}</span>
                      <strong>{(v * 100).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
              <p className="weights">
                Peso Estadísticas: {resultado.desglose_modelos.pesos_aplicados.peso_stats * 100}% · 
                Peso NLP: {resultado.desglose_modelos.pesos_aplicados.peso_nlp * 100}%
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App