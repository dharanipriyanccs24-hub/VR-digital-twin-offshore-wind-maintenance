import { create } from 'zustand'
import { User } from '@wind-twin/shared/types/user'

interface AuthState {
  user?: User
  token?: string
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: undefined,
  token: undefined,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: undefined, token: undefined })
}))
