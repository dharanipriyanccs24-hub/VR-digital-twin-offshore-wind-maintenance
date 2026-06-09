import React, { useRef } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { useFrame } from '@react-three/fiber'

function createBladeGeometry() {
  const vertices = [
    0, 0, 0,
    1.5, 0, 0,
    40, 0.15, 0,
    40, -0.15, 0
  ]
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32Array(vertices), 3)
  geometry.computeVertexNormals()
  return geometry
}

export default function TurbineModel() {
  const bladesRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 0.8
    }
  })

  return (
    <group>
      <mesh position={[0, 40, 0]}>
        <cylinderGeometry args={[1.5, 3, 80, 16]} />
        <meshStandardMaterial color="#1a3a52" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 81, 0]}> 
        <boxGeometry args={[8, 4, 5]} />
        <meshStandardMaterial color="#0d2a40" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 82.5, 3.5]}> 
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#94d8f0" metalness={0.5} roughness={0.15} />
      </mesh>
      <group ref={bladesRef} position={[0, 82.5, 3.5]}> 
        {[0, 120, 240].map(angle => (
          <mesh
            key={angle}
            rotation={[0, 0, (angle * Math.PI) / 180]}
            position={[0, 0, 0]}
          >
            <bufferGeometry attach="geometry" {...createBladeGeometry()} />
            <meshStandardMaterial color="#d0e8f0" metalness={0.2} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
