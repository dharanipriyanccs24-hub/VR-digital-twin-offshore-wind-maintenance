import client from './client'
import { TurbineUnit } from '@wind-twin/shared/types/turbine'

export async function fetchTurbines() {
  return client.get<TurbineUnit[]>('/api/turbines')
}

export async function fetchTurbine(id: string) {
  return client.get<TurbineUnit>(`/api/turbines/${id}`)
}
