import { Request, Response } from 'express'
import { supabaseAdmin } from '../utils/supabase.js'
import { autoAssignByCode, autoAssignBatch, autoAssignPendingProgramaciones } from '../services/autoAssignProgramacion.js'

// ── Listar programaciones con joins opcionales ──────────────
export async function listProgramacion(req: Request, res: Response) {
  const { status, fecha, fechaInicio, fechaFin } = req.query

  let query = supabaseAdmin
    .from('programacion')
    .select('*, pilots(id, name), trucks(id, plate, model), trips(id, status)')
    .order('fecha_programacion', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500)

  if (status) query = query.eq('status', String(status))
  if (fecha) query = query.eq('fecha_programacion', String(fecha))

  // Rango de fechas: fechaInicio y fechaFin (YYYY-MM-DD)
  if (fechaInicio) query = query.gte('fecha_programacion', String(fechaInicio))
  if (fechaFin) query = query.lte('fecha_programacion', String(fechaFin))

  const { data, error } = await query
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

// ── Obtener una programación ────────────────────────────────
export async function getProgramacion(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('programacion')
    .select('*, pilots(id, name, phone_number), trucks(id, plate, model, status), trips(*)')
    .eq('id', req.params.id)
    .single()
  if (error) { res.status(404).json({ error: 'No encontrado' }); return }
  res.json(data)
}

// ── Asignar piloto ──────────────────────────────────────────
export async function assignPilot(req: Request, res: Response) {
  const { pilotId, assignedBy } = req.body
  if (!pilotId) { res.status(400).json({ error: 'pilotId requerido' }); return }

  const { data, error } = await supabaseAdmin
    .from('programacion')
    .update({
      pilot_id: pilotId,
      assigned_by: assignedBy ?? null,
      assigned_at: new Date().toISOString(),
      status: 'asignado'
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

// ── Asignar camión ──────────────────────────────────────────
export async function assignTruck(req: Request, res: Response) {
  const { truckCodigo, assignedBy } = req.body
  if (!truckCodigo) { res.status(400).json({ error: 'truckCodigo requerido' }); return }

  const { data, error } = await supabaseAdmin
    .from('programacion')
    .update({
      truck_codigo: truckCodigo,
      assigned_by: assignedBy ?? null,
      assigned_at: new Date().toISOString(),
      status: 'asignado'
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

// ── Generar viaje desde programación ───────────────────────
export async function generateTrip(req: Request, res: Response) {
  // 1. Obtener programación
  const { data: prog, error: progError } = await supabaseAdmin
    .from('programacion')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (progError || !prog) { res.status(404).json({ error: 'Programación no encontrada' }); return }
  if (!prog.pilot_id || !prog.truck_codigo) {
    res.status(400).json({ error: 'Debes asignar piloto y camión antes de generar el viaje' })
    return
  }
  if (prog.trip_id) {
    res.status(409).json({ error: 'Ya existe un viaje generado para esta programación' })
    return
  }

  // 1.5 Validar límite: domingo máximo 12pm
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = domingo, 1 = lunes, etc.
  const hour = now.getHours()
  
  if (dayOfWeek === 0 && hour >= 12) {
    res.status(400).json({ 
      error: 'No se pueden crear viajes el domingo después de las 12:00pm. Límite del piloto alcanzado para esta semana.' 
    })
    return
  }

  // 2. Crear viaje
  const { data: trip, error: tripError } = await supabaseAdmin
    .from('trips')
    .insert([{
      truck_codigo: prog.truck_codigo,
      pilot_id: prog.pilot_id,
      origin: prog.origen ?? 'Sin origen',
      destination: prog.destino ?? 'Sin destino',
      distance_km: 0,
      status: 'programado',
      trip_code: prog.codigo ?? null,
      customer: prog.nombre ?? prog.transportista ?? null,
      material: prog.material ?? null,
      order_number: prog.pedido ?? null,
      delivery_number: prog.entrega ?? null,
      transport_company: prog.transporte ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (tripError || !trip) { res.status(500).json({ error: tripError?.message ?? 'Error creando viaje' }); return }

  // 3. Actualizar programación con trip_id y status
  await supabaseAdmin
    .from('programacion')
    .update({ trip_id: trip.id, status: 'en_curso', updated_at: new Date().toISOString() } as any)
    .eq('id', req.params.id)

  res.status(201).json({ trip, programacionId: req.params.id })
}

// ── Auto-asignar por código ─────────────────────────────────
export async function autoAssignByCodeRoute(req: Request, res: Response) {
  const { codigo, pilotName, truckPlate } = req.body

  if (!codigo) {
    res.status(400).json({ error: 'codigo requerido' })
    return
  }

  const result = await autoAssignByCode(codigo, pilotName, truckPlate)
  res.status(result.success ? 200 : 400).json(result)
}

// ── Auto-asignar por lote de códigos ────────────────────────
export async function autoAssignBatchRoute(req: Request, res: Response) {
  const { codigos } = req.body

  if (!Array.isArray(codigos) || codigos.length === 0) {
    res.status(400).json({ error: 'codigos debe ser un array no vacío' })
    return
  }

  const results = await autoAssignBatch(codigos)
  const successCount = results.filter((r) => r.success).length
  res.status(200).json({
    total: results.length,
    assigned: successCount,
    failed: results.length - successCount,
    results
  })
}

// ── Auto-asignar todas las programaciones pendientes ────────
export async function autoAssignPendingRoute(req: Request, res: Response) {
  const results = await autoAssignPendingProgramaciones()
  const successCount = results.filter((r) => r.success).length

  res.status(200).json({
    total: results.length,
    assigned: successCount,
    failed: results.length - successCount,
    results
  })
}
