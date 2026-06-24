import { Request, Response } from 'express'
import { supabaseAdmin } from '../utils/supabase.js'
import type { Material } from '../types/clients.js'

export async function listMaterials(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .order('name', { ascending: true })
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

export async function getMaterial(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) { res.status(404).json({ error: 'Material no encontrado' }); return }
  res.json(data)
}

export async function createMaterial(req: Request, res: Response) {
  const { name, unit, description } = req.body
  if (!name) { res.status(400).json({ error: 'El nombre es requerido' }); return }

  const record: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    unit: unit ?? 'TN',
    description: description ?? null,
    active: true
  }

  const { data, error } = await supabaseAdmin
    .from('materials')
    .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(201).json(data)
}

export async function updateMaterial(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

export async function toggleMaterial(req: Request, res: Response) {
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('materials')
    .select('active')
    .eq('id', req.params.id)
    .single()
  if (fetchError) { res.status(404).json({ error: 'Material no encontrado' }); return }

  const { data, error } = await supabaseAdmin
    .from('materials')
    .update({ active: !(current as any).active, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
