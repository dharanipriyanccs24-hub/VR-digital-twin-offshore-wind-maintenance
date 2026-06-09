import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface Props { data: { name: string; power: number }[] }

export default function PowerChart({ data }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <p className="text-sm text-cyan-300">24h Power Output</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fill: '#7dd3fc', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#7dd3fc', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="power" fill="#12d6fd" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
