export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface Alert {
  id: string
  turbineId: string
  sensor: string
  severity: AlertSeverity
  message: string
  value: number
  threshold: number
  firedAt: string
  resolvedAt?: string
  acknowledgedBy?: string
}

export interface AlertRule {
  sensor: string
  severity: AlertSeverity
  threshold: number
  comparator: 'GT' | 'LT' | 'OUTSIDE'
}
