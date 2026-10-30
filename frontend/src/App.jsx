import { useState } from 'react'
import './App.css'

function App() {
  const [form, setForm] = useState({
    comentario: 'El equipo local viene en una racha increible y seguro goleamos hoy en casa',
    promedio_goles_local: 2.1,
    promedio_goles_visitante: 0.9,
    racha_puntos_local: 12,
    racha_puntos_visitante: 5
  })

  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'comentario' ? value : parseFloat(value) || 0
    }))
  }

  const predecir = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setResultado(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Error en la API')
      const data = await res.json()
      setResultado(data)
    } catch (err) {
      setError('No se pudo conectar con el backend. Asegúrate de que la API esté corriendo en http://localhost:8000')
    } finally {
      setCargando(false)
    }
  }

  const getColor = (pred) => {
    if (pred === 'local') return '#10b981'
    if (pred === 'empate') return '#f59e0b'
    return '#ef4444'
  }

  const getLabel = (pred) => {
    if (pred === 'local') return 'Victoria Local'
    if (pred === 'empate') return 'Empate'
    return 'Victoria Visitante'
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
                placeholder="Escribí un comentario o análisis del partido..."
                required
              />
            </div>

            <div className="stats-grid">
              <div className="stat-group">
                <h3>Equipo Local</h3>
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
                <h3>Equipo Visitante</h3>
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
              {cargando ? 'Analizando...' : 'Obtener Predicción'}
            </button>
          </form>
        </div>

        {error && <div className="error-card">{error}</div>}

        {resultado && (
          <div className="result-card">
            <div className="result-header">
              <h2>Resultado del Análisis</h2>
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