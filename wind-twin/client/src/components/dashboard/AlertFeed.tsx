import React from 'react'
import { Alert } from '@wind-twin/shared/types/alert'

interface Props { alerts: Alert[] }

export default function AlertFeed({ alerts }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <p className="text-sm text-cyan-300">Active Alerts</p>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        {alerts.map(alert => (
          <div key={alert.id} className="rounded-2xl border border-cyan-500/10 bg-[#021523]/80 p-3">
            <p className="font-medium text-white">{alert.sensor}</p>
            <p className="text-xs text-cyan-200">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
