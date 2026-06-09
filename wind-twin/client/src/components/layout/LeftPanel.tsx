import React from 'react'

export default function LeftPanel() {
  return (
    <aside className="w-full max-w-xs space-y-4 p-4 bg-[#041426]/90 border-r border-cyan-500/10">
      <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/20">
        <p className="text-sm text-cyan-300">Fleet Navigator</p>
        <h2 className="mt-2 text-xl font-semibold">8 Turbines</h2>
      </div>
      <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
        <p className="text-sm text-cyan-300">Operations Log</p>
        <div className="mt-3 space-y-2 text-xs text-slate-300">{/* Log entries go here */}</div>
      </div>
    </aside>
  )
}
