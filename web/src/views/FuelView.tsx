import type { SharedViewProps } from './types'

type FuelViewProps = SharedViewProps & {
  selectedFuelStation: string
  setSelectedFuelStation: (value: string) => void
  newFuelPrice: string
  setNewFuelPrice: (value: string) => void
}

export function FuelView({ dashboard, formatMoney, fuelState, selectedFuelStation, setSelectedFuelStation, newFuelPrice, setNewFuelPrice }: FuelViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Precios diesel</h2>
        <table>
          <thead>
            <tr>
              <th>Gasolinera</th>
              <th>Precio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {fuelState.map((item) => (
              <tr key={item.station}>
                <td>{item.station}</td>
                <td>{formatMoney(item.dieselGtq)}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Actualizar precio MEM</h2>
        <div className="form-grid">
          <label htmlFor="fuel-station">Gasolinera</label>
          <select id="fuel-station" value={selectedFuelStation} onChange={(event) => setSelectedFuelStation(event.target.value)}>
            {fuelState.map((item) => (
              <option key={item.station} value={item.station}>{item.station}</option>
            ))}
          </select>

          <label htmlFor="fuel-price">Nuevo precio</label>
          <input id="fuel-price" type="number" min="0" value={newFuelPrice} onChange={(event) => setNewFuelPrice(event.target.value)} />

          <button type="button" className="action-btn" onClick={dashboard.updateFuelPrice}>Guardar precio</button>
        </div>
      </article>
    </section>
  )
}
