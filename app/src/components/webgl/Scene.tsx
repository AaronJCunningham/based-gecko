"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import Link from "next/link";
import { useRef, useMemo } from "react";

function ParticleWave(): JSX.Element {
  const count = 1000;
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, [count]);

  const positionsRef = useRef<Float32Array>(new Float32Array(initialPositions));
  const pointsRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 0.3;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      const x0 = initialPositions[ix];
      const y0 = initialPositions[iy];
      const z0 = initialPositions[iz];
      const dist = Math.sqrt(x0 * x0 + z0 * z0);
      const angle = Math.atan2(z0, x0) + time;
      positionsRef.current[ix] = Math.cos(angle) * dist;
      positionsRef.current[iy] = y0 + Math.sin(time + dist) * 0.5;
      positionsRef.current[iz] = Math.sin(angle) * dist;
    }
    if (pointsRef.current)
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          // @ts-expect-error R3F bufferAttribute props not fully typed
          array={positionsRef.current}
          itemSize={3}
          count={count}
        />
      </bufferGeometry>
      {/* @ts-expect-error R3F pointsMaterial color prop not fully typed */}
      <pointsMaterial color="#00ffff" size={0.05} depthWrite={false} />
    </points>
  );
}

export default function Scene(): JSX.Element {
  return (
    <div className="col-span-9 p-2 pt-0 rounded-md line-left line-right h-screen relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 z-20"
      >
        ← Back
      </Link>
      <p className="absolute inset-0 flex items-center justify-center text-cyan-400 z-10">
        No Active Trading Pair.
      </p>
      <Canvas className="w-full h-full">
        <ambientLight intensity={0.5} />
        <ParticleWave />
      </Canvas>
    </div>
  );
}
