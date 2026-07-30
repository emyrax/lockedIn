import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 120 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.015;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.008;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#f97316" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function HelmetModel() {
  const helmetGeometry = useMemo(() => {
    const profile = [
      [0, 2.1], [0.35, 2.0], [0.7, 1.8], [1.0, 1.5],
      [1.2, 1.1], [1.3, 0.7], [1.28, 0.35], [1.2, 0.15],
      [1.35, 0.05], [1.35, -0.05], [1.05, -0.12],
      [0.75, -0.2], [0.65, -0.45], [0.7, -0.7],
      [0.85, -0.95], [0.9, -1.2], [0.85, -1.45], [0.75, -1.7],
    ];
    return new THREE.LatheGeometry(
      profile.map(p => new THREE.Vector2(p[0], p[1])),
      64
    );
  }, []);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh geometry={helmetGeometry}>
        <MeshDistortMaterial
          color="#f97316"
          distort={0.5}
          speed={2.5}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function ConnectionLines() {
  const lineRef = useRef();
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 30; i++) {
      const theta = (i / 30) * Math.PI * 2;
      const r = 2.5;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta * 2) * 1.2, Math.sin(theta) * r));
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = clock.elapsedTime * 0.03;
    }
  });

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#f97316" transparent opacity={0.35} />
    </line>
  );
}

export default function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <ParticleField />
        <HelmetModel />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}