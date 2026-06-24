import { Request, Response } from 'express'
import { supabaseAdmin } from '../utils/supabase.js'
import type { Client } from '../types/clients.js'

export async function listClients(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .order('name', { ascending: true })
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

export async function getClient(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) { res.status(404).json({ error: 'Cliente no encontrado' }); return }
  res.json(data)
}

export async function createClient(req: Request, res: Response) {
  const { name, nit, contactName, phone, email, address } = req.body
  if (!name) { res.status(400).json({ error: 'El nombre es requerido' }); return }

  const record: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    nit: nit ?? null,
    contactName: contactName ?? null,
    phone: phone ?? null,
    email: email ?? null,
    address: address ?? null,
    status: 'active'
  }

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(201).json(data)
}

export async function updateClient(req: Request, res: Response) {
  const { id } = req.params
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}

export async function deleteClient(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
