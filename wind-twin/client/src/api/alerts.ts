import client from './client'
import { Alert } from '@wind-twin/shared/types/alert'

export async function fetchAlerts(params?: Record<string, string | boolean>) {
  return client.get<Alert[]>('/api/alerts', { params })
}

export async function acknowledgeAlert(id: string) {
  return client.patch(`/api/alerts/${id}/acknowledge`)
}

export async function resolveAlert(id: string) {
  return client.patch(`/api/alerts/${id}/resolve`)
}
