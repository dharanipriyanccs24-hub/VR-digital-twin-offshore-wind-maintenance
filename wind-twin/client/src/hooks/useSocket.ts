import { useEffect, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { SensorReading } from '@wind-twin/shared/types/turbine'

const URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

export function useSocket(onReading: (reading: SensorReading) => void) {
  const socket = useMemo(() => io(URL, { transports: ['websocket'] }), [])

  useEffect(() => {
    socket.on('reading', onReading)
    socket.on('connect_error', console.error)
    return () => {
      socket.off('reading', onReading)
      socket.disconnect()
    }
  }, [socket, onReading])

  return socket as Socket
}
