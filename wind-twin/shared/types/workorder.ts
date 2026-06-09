export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface WorkOrder {
  id: string
  turbineId: string
  title: string
  description: string
  priority: Priority
  status: WorkOrderStatus
  assignedToId?: string
  scheduledFor?: string
  completedAt?: string
  createdAt: string
  checklist: ChecklistItem[]
  estimatedHours?: number
}

export interface ChecklistItem {
  label: string
  done: boolean
}
