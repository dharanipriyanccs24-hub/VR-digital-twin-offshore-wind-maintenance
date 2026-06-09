import React, { useEffect } from 'react'

interface Props { message: string; onClose: () => void }

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(id)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 rounded-3xl bg-cyan-500/95 px-4 py-3 text-sm text-slate-950 shadow-xl">
      {message}
    </div>
  )
}
