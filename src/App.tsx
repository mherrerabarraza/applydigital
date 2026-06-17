import './App.css'

function App() {
  return (
    <main className="page">
      <header className="topbar" aria-label="Barra superior">
        <button
          type="button"
          className="login-icon"
          aria-label="Login"
          title="Login"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            <path d="M4.5 18.25a6.5 6.5 0 0 1 13 0v.25h-13v-.25Z" />
            <path d="M19.5 12.5h-4" />
            <path d="m17.75 10.75 1.75 1.75-1.75 1.75" />
          </svg>
        </button>
      </header>

      <section className="hero" aria-label="Encabezado principal">
        <p className="eyebrow">DIGITAL EXPERIENCE PARTNER</p>
        <h1>
          Creamos experiencias digitales con profundidad humana y velocidad
          inteligente.
        </h1>
        <p className="hero-copy">
          Diseñamos, construimos y optimizamos productos para marcas ambiciosas en
          comercio, contenido y datos.
        </p>
      </section>

      <section className="content section-grid" aria-label="Servicios">
        <article className="card">
          <h2>Estrategia y producto</h2>
          <p>
            Identificamos oportunidades reales y definimos una hoja de ruta clara
            para lanzar valor rápido.
          </p>
        </article>
        <article className="card">
          <h2>Experiencias de cliente</h2>
          <p>
            Diseñamos recorridos personalizados y consistentes en web, app y
            canales de soporte.
          </p>
        </article>
        <article className="card">
          <h2>Escala con IA aplicada</h2>
          <p>
            Integramos automatización y agentes en tus flujos para acelerar
            contenido, operación y aprendizaje.
          </p>
        </article>
      </section>

      <section className="content clients" aria-label="Clientes">
        <p className="label">Marcas que confían en este enfoque</p>
        <div className="client-row">
          <span>ATLASSIAN</span>
          <span>DISNEY</span>
          <span>P&amp;G</span>
          <span>COCA-COLA</span>
          <span>ARC'TERYX</span>
        </div>
      </section>

      <section className="content cta" aria-label="Llamado a la acción">
        <h2>Listos para construir algo relevante</h2>
        <p>
          Si quieres transformar tu experiencia digital de punta a punta, esta
          página es un buen punto de partida.
        </p>
      </section>
    </main>
  )
}

export default App
