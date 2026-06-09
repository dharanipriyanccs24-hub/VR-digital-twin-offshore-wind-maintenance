import { InfluxDB, WriteApi } from 'influxdb-client'
import { config } from '../config/env'
import { SensorReading } from '@wind-twin/shared/types/turbine'

const client = new InfluxDB({ url: config.INFLUX_URL, token: config.INFLUX_TOKEN })
const writeApi = client.getWriteApi(config.INFLUX_ORG, config.INFLUX_BUCKET)

export function writeReading(reading: SensorReading) {
  const point = {
    measurement: 'turbine_reading',
    tags: { turbineId: reading.turbineId },
    fields: {
      power: reading.power,
      rpm: reading.rpm,
      pitch: reading.pitch,
      windSpeed: reading.windSpeed,
      nacelleTemp: reading.nacelleTemp,
      gearboxOilTemp: reading.gearboxOilTemp,
      vibration: reading.vibration,
      hydraulicPressure: reading.hydraulicPressure,
      bladePitchA: reading.bladePitchA,
      bladePitchB: reading.bladePitchB,
      bladePitchC: reading.bladePitchC,
      generatorTemp: reading.generatorTemp,
      gridFrequency: reading.gridFrequency,
      reactivePower: reading.reactivePower
    },
    timestamp: new Date(reading.timestamp)
  }
  writeApi.writePoint(point as any)
}

export function flushWrites() {
  writeApi.flush().catch(console.error)
}
