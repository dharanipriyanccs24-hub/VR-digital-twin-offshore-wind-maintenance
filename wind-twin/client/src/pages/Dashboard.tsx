import React from 'react'
import Topbar from '../components/layout/Topbar'
import LeftPanel from '../components/layout/LeftPanel'
import RightPanel from '../components/layout/RightPanel'
import TurbineScene from '../components/scene/TurbineScene'
import HealthScore from '../components/dashboard/HealthScore'
import MetricCard from '../components/dashboard/MetricCard'
import SensorChart from '../components/dashboard/SensorChart'
import PowerChart from '../components/dashboard/PowerChart'
import AlertFeed from '../components/dashboard/AlertFeed'
import ComponentWear from '../components/dashboard/ComponentWear'
import TelemetryBar from '../components/dashboard/TelemetryBar'

const demoHistory = Array.from({ length: 12 }, (_, index) => ({ time: `${index}:00`, value: 5 + Math.random() * 4 }))
const demoPower = Array.from({ length: 8 }, (_, index) => ({ name: `${index}h`, power: 4 + Math.random() * 3 }))
const demoAlerts = []

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#010b14] via-[#031226] to-[#020f18] text-white">
      <Topbar />
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
        <LeftPanel />
        <main className="space-y-6">
          <section className="rounded-[32px] bg-[#03101d]/80 p-6 shadow-xl shadow-cyan-700/20">
            <TurbineScene />
          </section>
          <div className="grid gap-6 xl:grid-cols-4">
            <HealthScore score={87.3} trend={3.2} />
            <MetricCard title="Rotor RPM" value="9.4k" />
            <MetricCard title="Wind Gust" value="7.8 m/s" />
            <MetricCard title="Power" value="1.86 MW" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <SensorChart data={demoHistory} />
            <div className="space-y-6">
              <PowerChart data={demoPower} />
              <AlertFeed alerts={demoAlerts} />
            </div>
          </div>
          <section className="rounded-[32px] bg-[#03101d]/80 p-6 shadow-xl shadow-cyan-700/20">
            <p className="mb-5 text-sm text-cyan-300">Component Wear</p>
            <div className="space-y-4">
              <ComponentWear label="Blade" percent={22} />
              <ComponentWear label="Gearbox" percent={33} />
              <ComponentWear label="Bearings" percent={18} />
              <ComponentWear label="Monopile" percent={12} />
            </div>
          </section>
          <TelemetryBar
            items={[
              { label: 'Nacelle Temp', value: '68°C' },
              { label: 'Hydraulic Pressure', value: '220 bar' },
              { label: 'Vibration', value: '0.12 g' },
              { label: 'Grid Frequency', value: '50.01 Hz' }
            ]}
          />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
