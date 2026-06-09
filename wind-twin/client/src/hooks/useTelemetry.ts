import { useEffect } from 'react'
import { SensorReading } from '@wind-twin/shared/types/turbine'
import { useSocket } from './useSocket'
import { useTurbineStore } from '../store/turbineStore'

export function useTelemetry(turbineId: string) {
  const setReading = useTurbineStore(state => state.setReading)

  const socket = useSocket((reading: SensorReading) => {
    if (reading.turbineId === turbineId) {
      setReading(reading)
    }
  })

  useEffect(() => {
    socket.emit('join:turbine', { turbineId })
    return () => {
      socket.emit('leave:turbine', { turbineId })
    }
  }, [socket, turbineId])
}
