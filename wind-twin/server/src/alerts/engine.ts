import { AlertSeverity } from '@wind-twin/shared/types/alert'
import { SensorReading } from '@wind-twin/shared/types/turbine'
import { alertRules } from './rules'

interface ActiveAlertKey {
  turbineId: string
  sensor: string
  severity: AlertSeverity
}

const activeAlerts = new Map<string, { lastFired: number; lastNormal: number }>()

function keyFor(rule: typeof alertRules[number], reading: SensorReading) {
  return `${reading.turbineId}:${rule.sensor}:${rule.severity}`
}

function isNormal(rule: typeof alertRules[number], reading: SensorReading) {
  const value = reading[rule.sensor] as number
  switch (rule.comparator) {
    case 'GT':
      return value <= rule.threshold
    case 'LT':
      return value >= rule.threshold
    case 'OUTSIDE':
      if (rule.sensor === 'gridFrequency') {
        return value >= 49.5 && value <= 50.5
      }
      return true
  }
}

export function evaluateAlerts(reading: SensorReading) {
  const now = Date.now()
  const events: any[] = []

  alertRules.forEach(rule => {
    const value = reading[rule.sensor] as number
    const key = keyFor(rule, reading)
    const active = activeAlerts.get(key)
    const condition = (rule.comparator === 'GT' && value > rule.threshold)
      || (rule.comparator === 'LT' && value < rule.threshold)
      || (rule.comparator === 'OUTSIDE' && (value < 49.5 || value > 50.5))

    if (condition) {
      if (!active || now - active.lastFired > 120_000) {
        activeAlerts.set(key, { lastFired: now, lastNormal: 0 })
        events.push({ turbineId: reading.turbineId, sensor: rule.sensor, severity: rule.severity, message: rule.message, value, threshold: rule.threshold })
      }
    } else if (active) {
      const normalSince = active.lastNormal || now
      active.lastNormal = normalSince
      if (now - normalSince >= 60_000) {
        events.push({ resolved: true, turbineId: reading.turbineId, sensor: rule.sensor, severity: rule.severity })
        activeAlerts.delete(key)
      }
    }
  })

  return events
}
