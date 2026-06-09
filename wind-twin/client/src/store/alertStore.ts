import { create } from 'zustand'
import { Alert } from '@wind-twin/shared/types'

interface AlertState {
  alerts: Alert[]
  dismissed: string[]
  setAlerts: (alerts: Alert[]) => void
  dismissAlert: (id: string) => void
}

export const useAlertStore = create<AlertState>(set => ({
  alerts: [],
  dismissed: [],
  setAlerts: alerts => set({ alerts }),
  dismissAlert: id => set(state => ({ dismissed: [...state.dismissed, id] }))
}))
