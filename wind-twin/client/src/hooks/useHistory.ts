import { useEffect, useState } from 'react'
import axios from 'axios'

export function useHistory(turbineId: string, sensor: string) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchHistory() {
      const response = await axios.get(`/api/telemetry/${turbineId}/history`, {
        params: { sensor, hours: 24, interval: '1m' }
      })
      setData(response.data.data || [])
    }
    fetchHistory()
  }, [turbineId, sensor])

  return data
}
