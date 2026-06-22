import type { RolesViewProps } from './types'

export function RolesView({ roleMatrix, selectedRole, setSelectedRole, roleModules }: RolesViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Roles y permisos</h2>
        <table>
          <thead>
            <tr>
              <th>Rol</th>
              <th>Acceso</th>
            </tr>
          </thead>
          <tbody>
            {roleMatrix.map((item) => (
              <tr key={item.role}>
                <td>{item.role}</td>
                <td>{item.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Simulación por rol</h2>
        <label htmlFor="role-view">Ver como</label>
        <select id="role-view" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
          {roleMatrix.map((item) => (
            <option key={item.role} value={item.role}>{item.role}</option>
          ))}
        </select>

        <h3>Módulos visibles</h3>
        <ul>
          {(roleModules[selectedRole] ?? []).map((moduleName) => (
            <li key={moduleName}>{moduleName}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}
