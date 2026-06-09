import React from 'react'

interface Props { title: string; value: string }

export default function MetricCard({ title, value }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  )
}
