import { create } from 'zustand'
import { TurbineUnit, SensorReading } from '@wind-twin/shared/types'

interface TurbineState {
  selectedTurbine?: TurbineUnit
  turbines: TurbineUnit[]
  readings: Record<string, SensorReading>
  setTurbines: (turbines: TurbineUnit[]) => void
  setSelectedTurbine: (turbine: TurbineUnit) => void
  setReading: (reading: SensorReading) => void
}

export const useTurbineStore = create<TurbineState>(set => ({
  turbines: [],
  readings: {},
  setTurbines: turbines => set({ turbines }),
  setSelectedTurbine: selectedTurbine => set({ selectedTurbine }),
  setReading: reading => set(state => ({ readings: { ...state.readings, [reading.turbineId]: reading } }))
}))
