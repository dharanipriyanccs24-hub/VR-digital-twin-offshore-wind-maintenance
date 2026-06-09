import { SensorReading } from '@wind-twin/shared/types/turbine'
import { DataAdapter, FaultEvent } from './dataAdapter'

interface SimulatorState {
  reading: SensorReading
  spikes: Record<string, number>
}

const turbineIds = ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08']

function buildInitialReading(turbineId: string): SimulatorState {
  return {
    reading: {
      turbineId,
      timestamp: new Date().toISOString(),
      power: turbineId === 'A-04' ? 0 : 4 + Math.random() * 2,
      rpm: turbineId === 'A-04' ? 0 : 7 + Math.random() * 3,
      pitch: 5 + Math.random() * 5,
      windSpeed: 8 + Math.random() * 4,
      nacelleTemp: 55 + (turbineId === 'A-07' ? 2 : 0) + Math.random() * 5,
      gearboxOilTemp: 45 + Math.random() * 8,
      vibration: 0.05 + Math.random() * 0.03,
      hydraulicPressure: 210 + Math.random() * 30,
      bladePitchA: 10 + Math.random() * 4,
      bladePitchB: 10 + Math.random() * 4,
      bladePitchC: 10 + Math.random() * 4,
      generatorTemp: 65 + Math.random() * 10,
      gridFrequency: 49.95 + Math.random() * 0.1,
      reactivePower: 0.5 + Math.random() * 1.5
    },
    spikes: {}
  }
}

export class Simulator implements DataAdapter {
  private intervalId: NodeJS.Timer | null = null
  private readingCallback: ((reading: SensorReading) => void) | null = null
  private faultCallback: ((fault: FaultEvent) => void) | null = null
  private states = turbineIds.map(buildInitialReading)

  start() {
    if (this.intervalId) return
    this.intervalId = setInterval(() => this.tick(), 500)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  onReading(callback: (reading: SensorReading) => void) {
    this.readingCallback = callback
  }

  onFault(callback: (fault: FaultEvent) => void) {
    this.faultCallback = callback
  }

  private tick() {
    this.states.forEach(state => {
      const reading = state.reading
      if (reading.turbineId === 'A-04') {
        reading.power = 0
        reading.rpm = 0
        reading.pitch = 0
      } else {
        reading.power = clamp(reading.power + randomDelta(0.15), 0, 8)
        reading.rpm = clamp(reading.rpm + randomDelta(0.3), 0, 15)
        reading.pitch = clamp(reading.pitch + randomDelta(0.5), 0, 30)
        reading.windSpeed = clamp(reading.windSpeed + randomDelta(0.2), 0, 25)
        reading.nacelleTemp = clamp(reading.nacelleTemp + randomDelta(0.8), 40, 90)
        reading.gearboxOilTemp = clamp(reading.gearboxOilTemp + randomDelta(0.5), 30, 70)
        reading.vibration = clamp(reading.vibration + randomDelta(0.005), 0.01, 0.2)
        reading.hydraulicPressure = clamp(reading.hydraulicPressure + randomDelta(2), 150, 300)
        reading.bladePitchA = clamp(reading.bladePitchA + randomDelta(0.5), 0, 30)
        reading.bladePitchB = clamp(reading.bladePitchB + randomDelta(0.5), 0, 30)
        reading.bladePitchC = clamp(reading.bladePitchC + randomDelta(0.5), 0, 30)
        reading.generatorTemp = clamp(reading.generatorTemp + randomDelta(0.8), 50, 110)
        reading.gridFrequency = clamp(reading.gridFrequency + randomDelta(0.01), 49.8, 50.2)
        reading.reactivePower = clamp(reading.reactivePower + randomDelta(0.1), 0, 4)
      }

      reading.timestamp = new Date().toISOString()
      this.injectFaults(state)
      this.readingCallback?.(reading)
    })
  }

  private injectFaults(state: SimulatorState) {
    const { reading, spikes } = state
    const id = reading.turbineId

    if (!spikes.nacelle && Math.random() < 0.02) {
      spikes.nacelle = 30
      reading.nacelleTemp = clamp(reading.nacelleTemp + 15, 40, 110)
      this.emitFault(id, 'nacelleTemp', 'CRITICAL', reading.nacelleTemp, 85, 'Nacelle overtemperature spike')
    }
    if (!spikes.hydraulic && Math.random() < 0.01) {
      spikes.hydraulic = 20
      reading.hydraulicPressure = 160
      this.emitFault(id, 'hydraulicPressure', 'CRITICAL', reading.hydraulicPressure, 165, 'Hydraulic pressure drop')
    }
    if (!spikes.vibration && Math.random() < 0.01) {
      spikes.vibration = 10
      reading.vibration = 0.18
      this.emitFault(id, 'vibration', 'CRITICAL', reading.vibration, 0.15, 'High vibration event')
    }

    Object.keys(spikes).forEach(key => {
      if (spikes[key] && spikes[key] > 0) {
        spikes[key] -= 1
      }
    })
  }

  private emitFault(turbineId: string, sensor: string, severity: 'WARNING' | 'CRITICAL', value: number, threshold: number, message: string) {
    this.faultCallback?.({ turbineId, sensor, severity, value, threshold, message })
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function randomDelta(max: number) {
  return (Math.random() - 0.5) * 2 * max
}
