import React, { useMemo } from 'react'
import { Color, Vector2 } from 'three'
import { useFrame } from '@react-three/fiber'

export default function OceanPlane() {
  const ref = React.useRef<any>(null)
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      color: { value: new Color('#051525') },
      amplitude: { value: 0.5 }
    }),
    []
  )

  useFrame(state => {
    if (ref.current) {
      uniforms.time.value = state.clock.elapsedTime
      ref.current.material.uniforms.time.value = uniforms.time.value
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} ref={ref}>
      <planeGeometry args={[500, 500, 50, 50]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          uniform float time;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 0.08 + time * 1.2) * 0.8;
            pos.z += sin(pos.y * 0.11 + time * 1.4) * 0.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(color * (0.6 + 0.4 * vUv.y), 1.0);
          }
        `}
        transparent={false}
      />
    </mesh>
  )
}
