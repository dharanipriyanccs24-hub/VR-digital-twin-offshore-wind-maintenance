import { AlertSeverity } from '@wind-twin/shared/types/alert'
import { SensorReading } from '@wind-twin/shared/types/turbine'

export interface AlertRule {
  sensor: keyof SensorReading
  severity: AlertSeverity
  threshold: number
  comparator: 'GT' | 'LT' | 'OUTSIDE'
  message: string
}

export const alertRules: AlertRule[] = [
  { sensor: 'nacelleTemp', severity: 'CRITICAL', comparator: 'GT', threshold: 85, message: 'Nacelle temperature exceeds critical threshold' },
  { sensor: 'hydraulicPressure', severity: 'CRITICAL', comparator: 'LT', threshold: 165, message: 'Hydraulic pressure below critical threshold' },
  { sensor: 'vibration', severity: 'CRITICAL', comparator: 'GT', threshold: 0.15, message: 'Vibration exceeds critical threshold' },
  { sensor: 'generatorTemp', severity: 'CRITICAL', comparator: 'GT', threshold: 105, message: 'Generator temperature exceeds critical threshold' },
  { sensor: 'gridFrequency', severity: 'CRITICAL', comparator: 'OUTSIDE', threshold: 0, message: 'Grid frequency outside safe band' },
  { sensor: 'nacelleTemp', severity: 'WARNING', comparator: 'GT', threshold: 75, message: 'Nacelle temperature above warning threshold' },
  { sensor: 'hydraulicPressure', severity: 'WARNING', comparator: 'LT', threshold: 185, message: 'Hydraulic pressure below warning threshold' },
  { sensor: 'vibration', severity: 'WARNING', comparator: 'GT', threshold: 0.1, message: 'Vibration exceeds warning threshold' },
  { sensor: 'gearboxOilTemp', severity: 'WARNING', comparator: 'GT', threshold: 65, message: 'Gearbox oil temperature above warning threshold' },
  { sensor: 'generatorTemp', severity: 'WARNING', comparator: 'GT', threshold: 95, message: 'Generator temperature above warning threshold' }
]
