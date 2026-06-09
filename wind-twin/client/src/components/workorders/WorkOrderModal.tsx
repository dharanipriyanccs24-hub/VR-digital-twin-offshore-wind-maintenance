import React from 'react'

interface Props { open: boolean; onClose: () => void }

export default function WorkOrderModal({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
      <div className="w-full max-w-xl rounded-3xl bg-[#03101d] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dispatch Work Order</h2>
          <button onClick={onClose} className="text-cyan-300">Close</button>
        </div>
        <div className="mt-4 text-slate-300">Modal content placeholder.</div>
      </div>
    </div>
  )
}
