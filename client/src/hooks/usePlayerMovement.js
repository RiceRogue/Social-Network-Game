import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MOVE_SPEED = 3.5
const BOUNDS = { x: 8, z: 5 }  // plaza half-extents

/**
 * usePlayerMovement — handles WASD + click-to-move for the local player.
 *
 * Returns:
 *   posRef     — THREE.Vector3 ref for current position (shared with HubWorld)
 *   dirRef     — number ref: -1 left, 0 neutral, +1 right
 *   isMovingRef — boolean ref
 */
export function usePlayerMovement(onMove) {
  const posRef = useRef(new THREE.Vector3(0, 0, 0))
  const targetRef = useRef(new THREE.Vector3(0, 0, 0))
  const dirRef = useRef(0)
  const isMovingRef = useRef(false)
  const keysRef = useRef({})
  const { camera, raycaster, gl } = useThree()

  // Keyboard input
  useEffect(() => {
    const onDown = (e) => { keysRef.current[e.code] = true }
    const onUp = (e) => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // Click-to-move
  const handleClick = useCallback((e) => {
    const rect = gl.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hit = new THREE.Vector3()
    raycaster.ray.intersectPlane(groundPlane, hit)
    if (hit) {
      hit.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, hit.x))
      hit.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, hit.z))
      hit.y = 0
      targetRef.current.copy(hit)
    }
  }, [camera, raycaster, gl])

  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick)
    return () => gl.domElement.removeEventListener('click', handleClick)
  }, [handleClick, gl])

  useFrame((_, delta) => {
    const keys = keysRef.current
    const pos = posRef.current
    const vel = new THREE.Vector3()

    // WASD movement
    if (keys['KeyW'] || keys['ArrowUp'])    vel.z -= 1
    if (keys['KeyS'] || keys['ArrowDown'])  vel.z += 1
    if (keys['KeyA'] || keys['ArrowLeft'])  vel.x -= 1
    if (keys['KeyD'] || keys['ArrowRight']) vel.x += 1

    if (vel.lengthSq() > 0) {
      // WASD overrides click target
      vel.normalize().multiplyScalar(MOVE_SPEED * delta)
      targetRef.current.copy(pos).add(vel)
      targetRef.current.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, targetRef.current.x))
      targetRef.current.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, targetRef.current.z))
    }

    // Move toward target
    const toTarget = new THREE.Vector3().subVectors(targetRef.current, pos)
    const dist = toTarget.length()

    if (dist > 0.05) {
      const step = Math.min(dist, MOVE_SPEED * delta)
      pos.addScaledVector(toTarget.normalize(), step)
      pos.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, pos.x))
      pos.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, pos.z))

      isMovingRef.current = true
      dirRef.current = toTarget.x > 0.1 ? 1 : toTarget.x < -0.1 ? -1 : 0

      onMove?.(pos, dirRef.current)
    } else {
      isMovingRef.current = false
      dirRef.current = 0
    }
  })

  return { posRef, dirRef, isMovingRef }
}
