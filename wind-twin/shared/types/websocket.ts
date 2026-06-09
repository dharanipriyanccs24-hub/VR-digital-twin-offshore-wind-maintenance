import { SensorReading } from './turbine'
import { Alert } from './alert'

export type CommandAction =
  | 'PITCH_ADJUST'
  | 'FAULT_RESET'
  | 'EMERGENCY_STOP'
  | 'START_DIAGNOSTIC'
  | 'RESUME'

export interface JoinTurbinePayload {
  turbineId: string
}

export interface CommandPayload {
  commandId: string
  turbineId: string
  action: CommandAction
  params?: Record<string, unknown>
}

export interface PongPayload {
  t: number
  serverTime: number
}

export interface WebsocketEvents {
  'reading': SensorReading
  'alert:new': Alert
  'alert:resolved': { alertId: string }
  'command:ack': {
    commandId: string
    status: 'OK' | 'FAILED'
    message: string
  }
  'turbine:status': {
    turbineId: string
    status: string
  }
  'pong': PongPayload
}
