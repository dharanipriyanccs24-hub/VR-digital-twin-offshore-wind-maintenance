export type UserRole = 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}
