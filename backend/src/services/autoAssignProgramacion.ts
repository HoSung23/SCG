import { supabaseAdmin } from '../utils/supabase.js'

export type AutoAssignResult = {
  success: boolean
  programacionId: string
  codigo: string
  pilotId: string | null
  pilotName: string | null
  truckCodigo: string | null
  truckPlate: string | null
  message: string
}

/**
 * Busca un piloto por nombre exacto (case-insensitive, normalized).
 */
async function findPilotByName(pilotName: string) {
  const normalized = pilotName.toLowerCase().trim()

  const { data: pilots, error } = await supabaseAdmin
    .from('pilots')
    .select('id, name')
    .ilike('name', `%${normalized}%`)
    .limit(10)

  if (error) {
    return null
  }

  // Busca coincidencia exacta o mejor aproximación
  const exact = pilots.find((p) => p.name.toLowerCase() === normalized)
  if (exact) return exact

  // Si no hay coincidencia exacta, retorna el primero
  return pilots[0] ?? null
}

/**
 * Busca un camión por placa o modelo aproximado.
 */
async function findTruckByPlateOrModel(placeOrModel: string) {
  const normalized = placeOrModel.toLowerCase().trim()

  const { data: trucks, error } = await supabaseAdmin
    .from('trucks')
    .select('id, codigo, plate, model')
    .or(`plate.ilike.%${normalized}%, model.ilike.%${normalized}%`)
    .limit(5)

  if (error) {
    return null
  }

  // Busca coincidencia exacta por placa
  const exactPlate = trucks.find((t) => t.plate.toLowerCase() === normalized)
  if (exactPlate) return exactPlate

  return trucks[0] ?? null
}

/**
 * Auto-asigna piloto y camión a una programación por su código.
 * Busca:
 * - Piloto por nombre en la columna 'nombre' o 'transportista'
 * - Camión por placa en la columna 'placa'
 */
export async function autoAssignByCode(
  codigo: string,
  pilotNameField?: string,
  truckPlateField?: string
): Promise<AutoAssignResult> {
  // 1. Buscar programación por código
  const { data: prog, error: progError } = await supabaseAdmin
    .from('programacion')
    .select('*')
    .eq('codigo', codigo)
    .single()

  if (progError || !prog) {
    return {
      success: false,
      programacionId: '',
      codigo,
      pilotId: null,
      pilotName: null,
      truckCodigo: null,
      truckPlate: null,
      message: `Programación con código ${codigo} no encontrada`
    }
  }

  // 2. Intentar asignar piloto por nombre
  const pilotNameToSearch = pilotNameField ?? prog.nombre ?? prog.transportista
  let pilotId: string | null = null
  let pilotName: string | null = null

  if (pilotNameToSearch) {
    const foundPilot = await findPilotByName(pilotNameToSearch)
    if (foundPilot) {
      pilotId = foundPilot.id
      pilotName = foundPilot.name
    }
  }

  // 3. Intentar asignar camión por placa
  const truckPlateToSearch = truckPlateField ?? prog.placa
  let truckCodigo: string | null = null
  let truckPlate: string | null = null

  if (truckPlateToSearch) {
    const foundTruck = await findTruckByPlateOrModel(truckPlateToSearch)
    if (foundTruck) {
      truckCodigo = foundTruck.codigo
      truckPlate = foundTruck.plate
    }
  }

  // 4. Actualizar programación si encontramos piloto o camión
  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (pilotId) {
    updates.pilot_id = pilotId
  }
  if (truckCodigo) {
    updates.truck_codigo = truckCodigo
  }

  // Si ambos están asignados, cambiar status
  if (pilotId && truckCodigo) {
    updates.status = 'asignado'
    updates.assigned_at = new Date().toISOString()
  }

  if (Object.keys(updates).length > 1) {
    // Más de solo updated_at
    await supabaseAdmin
      .from('programacion')
      .update(updates)
      .eq('id', prog.id)
  }

  return {
    success: !!(pilotId && truckCodigo),
    programacionId: prog.id,
    codigo,
    pilotId,
    pilotName,
    truckCodigo,
    truckPlate,
    message: pilotId && truckCodigo 
      ? `✓ Asignado: Piloto ${pilotName} + Camión ${truckPlate}`
      : `⚠ Parcial: Piloto=${pilotName ?? 'no encontrado'}, Camión=${truckPlate ?? 'no encontrado'}`
  }
}

/**
 * Auto-asigna múltiples programaciones que llegaron desde Gmail sync.
 */
export async function autoAssignBatch(codigos: string[]): Promise<AutoAssignResult[]> {
  const results: AutoAssignResult[] = []

  for (const codigo of codigos) {
    const result = await autoAssignByCode(codigo)
    results.push(result)
  }

  return results
}

/**
 * Busca todas las programaciones pendientes o sin asignar y las procesa.
 */
export async function autoAssignPendingProgramaciones(): Promise<AutoAssignResult[]> {
  const { data: programaciones, error } = await supabaseAdmin
    .from('programacion')
    .select('codigo')
    .or('status.is.null, status.eq.pendiente, pilot_id.is.null, truck_id.is.null')
    .limit(100)

  if (error) {
    console.error('Error fetching pending programaciones:', error)
    return []
  }

  const results = await autoAssignBatch(programaciones.map((p) => p.codigo))
  return results
}
