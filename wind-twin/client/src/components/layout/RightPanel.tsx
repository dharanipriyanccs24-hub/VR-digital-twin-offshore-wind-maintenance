import React from 'react'

export default function RightPanel() {
  return (
    <aside className="w-full max-w-md space-y-4 p-4 bg-[#041426]/90 border-l border-cyan-500/10">
      <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/20">
        <p className="text-sm text-cyan-300">Live Health Score</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-semibold">87.3</span>
          <span className="text-sm text-emerald-400">/100</span>
        </div>
      </div>
      <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
        <p className="text-sm text-cyan-300">Active Alerts</p>
        <div className="mt-3 space-y-2 text-xs text-slate-300">{/* Alert feed here */}</div>
      </div>
    </aside>
  )
}
