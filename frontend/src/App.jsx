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

// Escudos (URLs públicas de Wikipedia / Wikimedia). Si no existe, se usa iniciales.
const ESCUDOS = {
  // Premier League
  "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_new_crest.svg",
  "Bournemouth": "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg",
  "Brentford": "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
  "Brighton": "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg",
  "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  "Crystal Palace": "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg",
  "Everton": "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
  "Fulham": "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg",
  "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  "Newcastle": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
  "Nottingham Forest": "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg",
  "Tottenham": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
  "Wolves": "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg",

  // La Liga
  "Alavés": "https://upload.wikimedia.org/wikipedia/en/f/f8/Deportivo_Alaves_logo_%282020%29.svg",
  "Athletic Club": "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  "Atlético Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Betis": "https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg",
  "Celta": "https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg",
  "Getafe": "https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg",
  "Girona": "https://upload.wikimedia.org/wikipedia/en/f/f7/Girona_FC_Logo.svg",
  "Osasuna": "https://upload.wikimedia.org/wikipedia/en/d/db/Osasuna_logo.svg",
  "Rayo Vallecano": "https://upload.wikimedia.org/wikipedia/en/1/12/Rayo_Vallecano_logo.svg",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Real Sociedad": "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  "Sevilla": "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
  "Valencia": "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg",
  "Villarreal": "https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg",

  // Serie A
  "Atalanta": "https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",
  "Bologna": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_FC_1909_logo.svg",
  "Fiorentina": "https://upload.wikimedia.org/wikipedia/commons/f/f2/ACF_Fiorentina_2.svg",
  "Inter": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  "Juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
  "Lazio": "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg",
  "Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  "Napoli": "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli.svg",
  "Roma": "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  "Torino": "https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg",

  // Bundesliga
  "Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  "Borussia Dortmund": "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  "Dortmund": "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  "RB Leipzig": "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
  "Leverkusen": "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  "Eintracht Frankfurt": "https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg",

  // Ligue 1
  "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "PSG": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "Marseille": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
  "Lyon": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "Monaco": "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
  "Lille": "https://upload.wikimedia.org/wikipedia/en/6/6f/LOSC_Lille_logo.svg",

  // Liga Boliviana
  "Always Ready": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Always_Ready_logo.svg",
  "Aurora": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Club_Aurora_logo.svg",
  "Blooming": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Blooming_logo.svg",
  "Bolívar": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Club_Bol%C3%ADvar_logo.svg",
  "Guabirá": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Guabir%C3%A1_logo.svg",
  "Independiente Petrolero": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Independiente_Petrolero_logo.svg",
  "Jorge Wilstermann": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Jorge_Wilstermann_logo.svg",
  "Nacional Potosí": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Nacional_Potos%C3%AD_logo.svg",
  "Oriente Petrolero": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Oriente_Petrolero_logo.svg",
  "Real Santa Cruz": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Real_Santa_Cruz_logo.svg",
  "Royal Pari": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Royal_Pari_logo.svg",
  "The Strongest": "https://upload.wikimedia.org/wikipedia/commons/5/5e/The_Strongest_logo.svg",
  "Universitario de Vinto": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Universitario_de_Vinto_logo.svg",

  // Sudamérica / Copas
  "Boca Juniors": "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ_logo.svg",
  "River Plate": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_River_Plate.svg",
  "Flamengo": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg",
  "Palmeiras": "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
  "São Paulo": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Sao_Paulo_FC_logo.svg",
  "Fluminense": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Fluminense_FC_crest.svg",
  "Grêmio": "https://upload.wikimedia.org/wikipedia/commons/0/08/Gremio_logo.svg",
  "Colo-Colo": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Colo-Colo_logo.svg",
  "Peñarol": "https://upload.wikimedia.org/wikipedia/commons/7/7e/CA_Pe%C3%B1arol_logo.svg"
}

function getEscudo(equipo) {
  return ESCUDOS[equipo] || null
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

  const playChampions = () => {
    const audio = new Audio("/champions.mp3")
    audio.volume = 0.7
    audio.play().catch(err => console.log("Error audio:", err))
  }

  const handleLigaLocal = (e) => {
    const value = e.target.value
    setLigaLocal(value)
    setEquipoLocal(LIGAS[value][0])
    if (value === "Champions League") playChampions()
  }

  const handleLigaVisitante = (e) => {
    const value = e.target.value
    setLigaVisitante(value)
    setEquipoVisitante(LIGAS[value][0])
    if (value === "Champions League") playChampions()
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

  const TeamBadge = ({ equipo }) => {
    const url = getEscudo(equipo)
    if (url) {
      return <img src={url} alt={equipo} className="team-badge" />
    }
    return <div className="team-initials">{equipo.slice(0, 3).toUpperCase()}</div>
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
                <div className="team-header">
                  <TeamBadge equipo={equipoLocal} />
                  <div>
                    <label>Liga Local</label>
                    <select value={ligaLocal} onChange={handleLigaLocal}>
                      {Object.keys(LIGAS).map(liga => <option key={liga}>{liga}</option>)}
                    </select>
                    <label>Equipo Local</label>
                    <select value={equipoLocal} onChange={(e) => setEquipoLocal(e.target.value)}>
                      {LIGAS[ligaLocal].map(eq => <option key={eq}>{eq}</option>)}
                    </select>
                  </div>
                </div>
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
                <div className="team-header">
                  <TeamBadge equipo={equipoVisitante} />
                  <div>
                    <label>Liga Visitante</label>
                    <select value={ligaVisitante} onChange={handleLigaVisitante}>
                      {Object.keys(LIGAS).map(liga => <option key={liga}>{liga}</option>)}
                    </select>
                    <label>Equipo Visitante</label>
                    <select value={equipoVisitante} onChange={(e) => setEquipoVisitante(e.target.value)}>
                      {LIGAS[ligaVisitante].map(eq => <option key={eq}>{eq}</option>)}
                    </select>
                  </div>
                </div>
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
              <div className="result-teams">
                <TeamBadge equipo={equipoLocal} />
                <h2>{equipoLocal} vs {equipoVisitante}</h2>
                <TeamBadge equipo={equipoVisitante} />
              </div>
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

            {resultado.preprocesamiento_paso_a_paso && (
              <div className="preprocess-section">
                <h3>Preprocesamiento NLP (paso a paso)</h3>
                <div className="preprocess-grid">
                  {resultado.preprocesamiento_paso_a_paso.texto_normalizado && (
                    <div className="preprocess-item">
                      <h4>Texto normalizado</h4>
                      <p>{resultado.preprocesamiento_paso_a_paso.texto_normalizado}</p>
                    </div>
                  )}
                  {resultado.preprocesamiento_paso_a_paso.tokens && (
                    <div className="preprocess-item">
                      <h4>Tokens</h4>
                      <p>{Array.isArray(resultado.preprocesamiento_paso_a_paso.tokens) ? resultado.preprocesamiento_paso_a_paso.tokens.join(", ") : resultado.preprocesamiento_paso_a_paso.tokens}</p>
                    </div>
                  )}
                  {resultado.preprocesamiento_paso_a_paso.stop_words_eliminadas && (
                    <div className="preprocess-item">
                      <h4>Stop words eliminadas</h4>
                      <p>{Array.isArray(resultado.preprocesamiento_paso_a_paso.stop_words_eliminadas) ? resultado.preprocesamiento_paso_a_paso.stop_words_eliminadas.join(", ") : resultado.preprocesamiento_paso_a_paso.stop_words_eliminadas}</p>
                    </div>
                  )}
                  {resultado.preprocesamiento_paso_a_paso.stemming_o_lemas && (
                    <div className="preprocess-item">
                      <h4>Stemming / Lemas</h4>
                      <p>{Array.isArray(resultado.preprocesamiento_paso_a_paso.stemming_o_lemas) ? resultado.preprocesamiento_paso_a_paso.stemming_o_lemas.join(", ") : resultado.preprocesamiento_paso_a_paso.stemming_o_lemas}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App