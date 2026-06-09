import client from './client'
import { WorkOrder } from '@wind-twin/shared/types/workorder'

export async function fetchWorkOrders(params?: Record<string, string>) {
  return client.get<WorkOrder[]>('/api/workorders', { params })
}

export async function createWorkOrder(data: Partial<WorkOrder>) {
  return client.post<WorkOrder>('/api/workorders', data)
}

export async function updateWorkOrder(id: string, data: Partial<WorkOrder>) {
  return client.patch<WorkOrder>(`/api/workorders/${id}`, data)
}
