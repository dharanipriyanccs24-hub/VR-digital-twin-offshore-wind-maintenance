import React from 'react'

interface Props { label: string; variant?: 'info' | 'warning' | 'critical' }

const colors = {
  info: 'bg-cyan-500 text-slate-950',
  warning: 'bg-amber-400 text-slate-950',
  critical: 'bg-rose-500 text-white'
}

export default function Badge({ label, variant = 'info' }: Props) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[variant]}`}>{label}</span>
}
