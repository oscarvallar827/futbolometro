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
    if (pred === 'local') return '#22c55e'
    if (pred === 'empate') return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="app">
      <header>
        <h1>⚽ Futbolómetro</h1>
        <p>Predicción híbrida de partidos · NLP + Estadísticas</p>
      </header>

      <main>
        <form onSubmit={predecir} className="formulario">
          <div className="campo">
            <label>Comentario / Análisis del partido</label>
            <textarea
              name="comentario"
              value={form.comentario}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid-stats">
            <div className="campo">
              <label>Promedio goles Local</label>
              <input
                type="number"
                step="0.1"
                name="promedio_goles_local"
                value={form.promedio_goles_local}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Promedio goles Visitante</label>
              <input
                type="number"
                step="0.1"
                name="promedio_goles_visitante"
                value={form.promedio_goles_visitante}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Racha puntos Local</label>
              <input
                type="number"
                name="racha_puntos_local"
                value={form.racha_puntos_local}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Racha puntos Visitante</label>
              <input
                type="number"
                name="racha_puntos_visitante"
                value={form.racha_puntos_visitante}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? 'Prediciendo...' : 'Predecir Resultado'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {resultado && (
          <div className="resultado">
            <h2>Predicción Final</h2>
            <div 
              className="prediccion-final"
              style={{ backgroundColor: getColor(resultado.prediccion_final) }}
            >
              {resultado.prediccion_final.toUpperCase()}
            </div>

            <div className="probabilidades">
              <h3>Probabilidades combinadas</h3>
              {Object.entries(resultado.probabilidades_combinadas).map(([clase, prob]) => (
                <div key={clase} className="barra-container">
                  <span className="label">{clase}</span>
                  <div className="barra">
                    <div 
                      className="barra-fill"
                      style={{ 
                        width: `${prob * 100}%`,
                        backgroundColor: getColor(clase)
                      }}
                    />
                  </div>
                  <span className="porcentaje">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="desglose">
              <h3>Desglose de modelos</h3>
              <div className="modelos-grid">
                <div className="modelo">
                  <h4>NLP (Comentarios)</h4>
                  {Object.entries(resultado.desglose_modelos.probabilidades_nlp_comentarios).map(([k, v]) => (
                    <p key={k}>{k}: {(v * 100).toFixed(1)}%</p>
                  ))}
                </div>
                <div className="modelo">
                  <h4>Estadísticas (Goles + Racha)</h4>
                  {Object.entries(resultado.desglose_modelos.probabilidades_estadisticas_goles_racha).map(([k, v]) => (
                    <p key={k}>{k}: {(v * 100).toFixed(1)}%</p>
                  ))}
                </div>
              </div>
              <p className="pesos">
                Pesos aplicados: Stats {resultado.desglose_modelos.pesos_aplicados.peso_stats * 100}% · 
                NLP {resultado.desglose_modelos.pesos_aplicados.peso_nlp * 100}%
              </p>
            </div>

            {resultado.preprocesamiento_paso_a_paso && (
              <details className="explicacion">
                <summary>Ver preprocesamiento NLP paso a paso</summary>
                <pre>{JSON.stringify(resultado.preprocesamiento_paso_a_paso, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
