import React, { ReactNode } from 'react'

interface Props { open: boolean; onClose: () => void; children: ReactNode }

export default function Modal({ open, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[#02101d] p-6 shadow-2xl">
        <button onClick={onClose} className="mb-4 text-cyan-300">Close</button>
        {children}
      </div>
    </div>
  )
}
