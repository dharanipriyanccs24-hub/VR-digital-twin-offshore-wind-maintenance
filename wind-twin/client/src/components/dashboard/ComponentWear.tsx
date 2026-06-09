import React from 'react'

interface Props { label: string; percent: number }

export default function ComponentWear({ label, percent }: Props) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between text-cyan-200">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-500/10">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
