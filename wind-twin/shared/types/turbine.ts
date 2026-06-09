export interface TurbineUnit {
  id: string
  name: string
  latitude: number
  longitude: number
  installDate: string
  ratedPowerMW: number
  hubHeightM: number
  status: TurbineStatus
  latestReading?: SensorReading
}

export interface SensorReading {
  turbineId: string
  timestamp: string
  power: number
  rpm: number
  pitch: number
  windSpeed: number
  nacelleTemp: number
  gearboxOilTemp: number
  vibration: number
  hydraulicPressure: number
  bladePitchA: number
  bladePitchB: number
  bladePitchC: number
  generatorTemp: number
  gridFrequency: number
  reactivePower: number
}

export type TurbineStatus = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE' | 'OFFLINE'
