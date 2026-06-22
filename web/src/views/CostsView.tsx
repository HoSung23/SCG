import type { SharedViewProps } from './types'

export function CostsView({ dashboard, formatMoney }: SharedViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Gastos registrados</h2>
        <ul>
          <li><span>Combustible</span><strong>{formatMoney(dashboard.costs.fuel)}</strong></li>
          <li><span>Mantenimiento</span><strong>{formatMoney(dashboard.costs.maintenance)}</strong></li>
          <li><span>Planilla</span><strong>{formatMoney(dashboard.costs.payroll)}</strong></li>
          <li><span>Administrativo</span><strong>{formatMoney(dashboard.costs.admin)}</strong></li>
        </ul>
      </article>

      <article className="card">
        <h2>Registrar gasto</h2>
        <div className="form-grid">
          <label htmlFor="expense-category">Categoría</label>
          <select
            id="expense-category"
            value={dashboard.expenseForm.type}
            onChange={(event) => dashboard.setExpenseForm({ ...dashboard.expenseForm, type: event.target.value })}
          >
            <option value="maintenance">Mantenimiento</option>
            <option value="fuel">Combustible</option>
            <option value="other">Otro</option>
          </select>

          <label htmlFor="expense-label">Descripción</label>
          <input
            id="expense-label"
            value={dashboard.expenseForm.description}
            onChange={(event) => dashboard.setExpenseForm({ ...dashboard.expenseForm, description: event.target.value })}
            placeholder="Ej: compra de repuesto"
          />

          <label htmlFor="expense-amount">Monto (GTQ)</label>
          <input
            id="expense-amount"
            type="number"
            min="0"
            value={dashboard.expenseForm.amount}
            onChange={(event) => dashboard.setExpenseForm({ ...dashboard.expenseForm, amount: event.target.value })}
            placeholder="0"
          />

          <button type="button" className="action-btn" onClick={dashboard.registerExpense}>Guardar movimiento</button>
        </div>
      </article>
    </section>
  )
}
