type ReportsViewProps = {
  exportLog: string[]
  simulateExport: (reportName: string) => void
}

export function ReportsView({ exportLog, simulateExport }: ReportsViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Exportar reportes</h2>
        <div className="action-row">
          <button type="button" className="mini-btn" onClick={() => simulateExport('Costo mensual')}>
            Costo mensual
          </button>
          <button type="button" className="mini-btn" onClick={() => simulateExport('Costo por camión')}>
            Por camión
          </button>
          <button type="button" className="mini-btn" onClick={() => simulateExport('Mantenimientos')}>
            Mantenimientos
          </button>
        </div>
      </article>

      <article className="card">
        <h2>Bitácora de exportaciones</h2>
        <ul>
          {exportLog.length === 0 && <li>Sin exportaciones aún.</li>}
          {exportLog.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}
