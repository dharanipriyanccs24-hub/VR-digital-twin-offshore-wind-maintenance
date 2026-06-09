import React from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Props { data: { time: string; value: number }[] }

export default function SensorChart({ data }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <p className="text-sm text-cyan-300">Telemetry Trend</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip cursor={false} />
            <Line type="monotone" dataKey="value" stroke="#78e3ff" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
