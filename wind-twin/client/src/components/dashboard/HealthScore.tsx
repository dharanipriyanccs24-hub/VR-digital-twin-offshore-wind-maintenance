import React from 'react'

interface Props { score: number; trend: number }

export default function HealthScore({ score, trend }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-6 shadow-xl shadow-cyan-700/20">
      <p className="text-sm text-cyan-300">Live Health Score</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-5xl font-semibold">{score.toFixed(1)}</span>
        <span className="text-sm text-emerald-400">+{trend.toFixed(1)}%</span>
      </div>
    </div>
  )
}
