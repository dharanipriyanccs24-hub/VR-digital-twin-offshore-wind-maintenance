import React from 'react'
import { WorkOrder } from '@wind-twin/shared/types/workorder'

interface Props { orders: WorkOrder[] }

export default function WorkOrderList({ orders }: Props) {
  return (
    <div className="rounded-3xl bg-[#06172a]/80 p-4 shadow-xl shadow-cyan-700/10">
      <div className="grid gap-3">
        {orders.map(order => (
          <div key={order.id} className="rounded-2xl border border-cyan-500/10 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{order.title}</p>
              <span className="text-xs text-cyan-200">{order.priority}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{order.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
