import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';

export const StorePathNavigation: React.FC = () => {
  const { navigationTarget, playerPosition } = useStore();
  const groupRef = useRef<THREE.Group>(null);

  // Generate intermediate waypoint dots along floor
  const points = React.useMemo(() => {
    if (!navigationTarget) return [];

    const startX = playerPosition[0];
    const startZ = playerPosition[2];
    const endX = navigationTarget.position[0];
    const endZ = navigationTarget.position[2];

    const pts: [number, number, number][] = [];
    const count = 18;

    // Direct / L-shaped aisle corridor path
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      // Navigate down center corridor first, then into aisle
      let x = startX + (endX - startX) * (t * t);
      let z = startZ + (endZ - startZ) * t;

      pts.push([x, 0.02, z]);
    }

    return pts;
  }, [navigationTarget, playerPosition]);

  useFrame((state) => {
    if (groupRef.current) {
      // Pulse animation
      const s = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
      groupRef.current.children.forEach((child, idx) => {
        child.scale.set(s, s, s);
      });
    }
  });

  if (!navigationTarget || points.length === 0) return null;

  return (
    <group ref={groupRef}>
      {/* Waypoint floor dot rings */}
      {points.map((pt, idx) => (
        <mesh key={`path-dot-${idx}`} position={pt} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.16, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.7 - (idx / points.length) * 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Target Shelf Floating Beacon Arrow */}
      <group position={[navigationTarget.position[0], 2.4, navigationTarget.position[2]]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.25, 0.5, 4]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <pointLight intensity={0.8} distance={3} color="#06b6d4" />
      </group>
    </group>
  );
};

