import React from 'react'

export default function Topbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-midnight/80 backdrop-blur border-b border-ocean-500/10">
      <div>
        <p className="text-xs text-ocean-200">OceanSentinel</p>
        <h1 className="text-xl font-semibold text-ocean-100">Turbine Digital Twin</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg border border-ocean-500/30 px-3 py-2 text-sm text-ocean-50 bg-ocean-500/5">Enter VR</button>
      </div>
    </div>
  )
}
