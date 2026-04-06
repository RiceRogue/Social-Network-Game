import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import CharacterSprite from './CharacterSprite'
import ChatBox from './ChatBox'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

function PlazaFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#0d1117" roughness={0.9} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => i - 5).map((x) => (
        <mesh key={`vl${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x * 1.6, 0, 0]}>
          <planeGeometry args={[0.02, 12]} />
          <meshBasicMaterial color="#1a1f2e" />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => i - 3.5).map((z) => (
        <mesh key={`hl${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z * 1.4]}>
          <planeGeometry args={[18, 0.02]} />
          <meshBasicMaterial color="#1a1f2e" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.4, 1.5, 64]} />
        <meshBasicMaterial color="#00ffff" opacity={0.15} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color="#00ffff" opacity={0.4} transparent />
      </mesh>
      {[[-7, 4], [7, 4], [-7, -4], [7, -4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.6, 8]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
          </mesh>
          <pointLight position={[0, 1.8, 0]} intensity={0.5} color="#00ffff" distance={4} />
        </group>
      ))}
    </group>
  )
}

function LocalPlayer({ profile }) {
  const { sendMove } = useSocket()
  const posArr = useRef([0, 0, 0])
  const dirRef = useRef(0)
  const [pos, setPos] = useState([0, 0, 0])
  const [moveDir, setMoveDir] = useState(0)
  const titleOverride = useGameStore((s) => s._titleOverride)
  const reputation = useGameStore((s) => s.reputation)

  const { posRef } = usePlayerMovement((newPos, dir) => {
    posArr.current = [newPos.x, 0, newPos.z]
    dirRef.current = dir
    setPos([newPos.x, 0, newPos.z])
    setMoveDir(dir)
    sendMove([newPos.x, 0, newPos.z], dir)
  })

  return (
    <CharacterSprite
      position={pos}
      username={profile.username}
      headId={profile.headId}
      reputation={reputation}
      titleOverride={titleOverride}
      moveDir={moveDir}
    />
  )
}

function RemotePlayer({ player }) {
  const pos = player.position ?? [
    (Math.random() - 0.5) * 8,
    0,
    (Math.random() - 0.5) * 4,
  ]
  return (
    <CharacterSprite
      position={pos}
      username={player.username}
      headId={player.headId}
      reputation={player.reputation ?? 0}
      moveDir={player.direction ?? 0}
    />
  )
}

function AmbientParticles() {
  const meshRef = useRef()
  const count = 60
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 18)
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.setY(i, positions.current[i * 3 + 1] + Math.sin(t * 0.4 + i) * 0.3)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00ffff" size={0.04} transparent opacity={0.3} />
    </points>
  )
}

function NetworkHUD({ profile, onLogout }) {
  const reputation = useGameStore((s) => s.reputation)
  return (
    <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
      <div className="bg-black/70 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5">
        <p className="text-cyan-400 font-bold text-sm tracking-wide">{profile.username}</p>
        <p className="text-yellow-400 text-xs tracking-widest">REP {reputation}</p>
      </div>
      <button
        onClick={onLogout}
        className="text-xs text-slate-700 hover:text-red-400 transition-colors"
      >
        ✕ leave
      </button>
    </div>
  )
}

function ControlsHint() {
  return (
    <div className="absolute bottom-5 right-5 z-20 text-slate-800 text-xs text-right space-y-1">
      <p>WASD / arrows to move</p>
      <p>click to walk</p>
    </div>
  )
}

function NetworkLabel() {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <p className="text-slate-800 text-xs tracking-[0.4em] uppercase">
        <span className="text-cyan-900">social</span> network
      </p>
    </div>
  )
}

export default function HubWorld() {
  const profile = useGameStore((s) => s.profile)
  const clearProfile = useGameStore((s) => s.clearProfile)
  const otherPlayers = useGameStore((s) => s.otherPlayers)

  return (
    <div className="w-full h-full relative bg-[#070810]">
      <NetworkHUD profile={profile} onLogout={clearProfile} />
      <NetworkLabel />
      <ChatBox />
      <ControlsHint />

      <Canvas>
        <OrthographicCamera
          makeDefault
          position={[0, 10, 8]}
          zoom={80}
          near={0.1}
          far={100}
        />
        <ambientLight intensity={0.3} color="#0a0a1a" />
        <directionalLight position={[5, 10, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#0033ff" distance={20} />

        <Suspense fallback={null}>
          <PlazaFloor />
          <AmbientParticles />
          <LocalPlayer profile={profile} />
          {Object.values(otherPlayers).map((player) => (
            <RemotePlayer key={player.id} player={player} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
