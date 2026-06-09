import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Html } from '@react-three/drei'
import TurbineModel from './TurbineModel'
import OceanPlane from './OceanPlane'

export default function TurbineScene() {
  return (
    <div className="relative h-full w-full rounded-[32px] border border-cyan-500/10 bg-[#041426]/80">
      <Canvas camera={{ position: [60, 40, 80], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 40, 20]} intensity={1.2} />
        <Sky sunPosition={[100, 20, 100]} turbidity={8} />
        <Suspense fallback={null}>
          <TurbineModel />
          <OceanPlane />
        </Suspense>
        <OrbitControls minDistance={20} maxDistance={200} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-cyan-500/10 px-4 py-2 text-xs text-cyan-100">3D turbine viewport</div>
    </div>
  )
}
