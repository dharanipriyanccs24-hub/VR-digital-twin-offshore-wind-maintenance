import { SensorReading } from '@wind-twin/shared/types/turbine'

export interface DataAdapter {
  start(): void
  stop(): void
  onReading(callback: (reading: SensorReading) => void): void
  onFault(callback: (fault: FaultEvent) => void): void
}

export interface FaultEvent {
  turbineId: string
  sensor: string
  severity: 'WARNING' | 'CRITICAL'
  message: string
  value: number
}
