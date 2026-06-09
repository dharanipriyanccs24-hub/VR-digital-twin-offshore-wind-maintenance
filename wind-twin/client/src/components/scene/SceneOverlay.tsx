import React from 'react'

export default function SceneOverlay() {
  return (
    <div className="absolute left-4 top-4 space-y-3 text-xs text-cyan-200">
      <div className="rounded-3xl bg-[#02111c]/80 px-3 py-2 border border-cyan-500/20">Annotation: Blade Integrity</div>
      <div className="rounded-3xl bg-[#02111c]/80 px-3 py-2 border border-cyan-500/20">Annotation: Nacelle Temp</div>
    </div>
  )
}
