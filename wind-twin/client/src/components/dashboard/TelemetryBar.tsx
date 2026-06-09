import React from 'react'

interface TelemetryItem {
  label: string
  value: string
}

interface Props { items: TelemetryItem[] }

export default function TelemetryBar({ items }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(item => (
          <div key={item.label} className="rounded-2xl bg-[#021523]/80 p-3 text-sm">
            <p className="text-cyan-300">{item.label}</p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
