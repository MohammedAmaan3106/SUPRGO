import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../context/StoreContext';
import { createFloorTileTexture, createAisleSignTexture, createEntranceBannerTexture } from '../../textures/labelGenerator';
import { soundManager } from '../../audio/soundManager';

export const SupermarketEnvironment: React.FC = () => {
  const { playerPosition, isDoorOpen, setIsDoorOpen, settings } = useStore();
  const leftDoorRef = useRef<THREE.Mesh>(null);
  const rightDoorRef = useRef<THREE.Mesh>(null);
  const doorStateRef = useRef<boolean>(false);

  // Floor textures
  const { map: floorMap, roughnessMap: floorRough } = useMemo(() => createFloorTileTexture(), []);
  const entranceBannerTex = useMemo(() => createEntranceBannerTexture(), []);

  // Aisle Signs
  const aisle1Tex = useMemo(() => createAisleSignTexture(1, 'Fruits & Fresh Produce', 'Farm-fresh apples, bananas, greens, bakery', '#16a34a'), []);
  const aisle2Tex = useMemo(() => createAisleSignTexture(2, 'Dairy & Cold Drinks', 'Chilled milk, cheeses, juices, energy beverages', '#2563eb'), []);
  const aisle3Tex = useMemo(() => createAisleSignTexture(3, 'Groceries & Staples', 'Basmati rice, atta, dals, ghee, oils, cereals', '#b45309'), []);
  const aisle4Tex = useMemo(() => createAisleSignTexture(4, 'Snacks & Biscuits', 'Lay\'s chips, Doritos, Oreo, dark chocolate, nuts', '#ea580c'), []);
  const aisle5Tex = useMemo(() => createAisleSignTexture(5, 'Personal, Baby & Home', 'Shampoos, Dove, diapers, cleaning detergents', '#9333ea'), []);

  // Sliding door proximity check
  useFrame((_, delta) => {
    // Entrance is around X: 0, Z: 13.5
    const distToDoor = Math.hypot(playerPosition[0], playerPosition[2] - 13.5);
    const shouldOpen = distToDoor < 4.2;

    if (shouldOpen !== doorStateRef.current) {
      doorStateRef.current = shouldOpen;
      setIsDoorOpen(shouldOpen);
      if (shouldOpen) {
        soundManager.playDoorSlide();
        soundManager.playDoorChime();
      }
    }

    // Animate door sliding smoothly
    const targetLeftX = shouldOpen ? -2.2 : -0.95;
    const targetRightX = shouldOpen ? 2.2 : 0.95;

    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = THREE.MathUtils.damp(leftDoorRef.current.position.x, targetLeftX, 6, delta);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = THREE.MathUtils.damp(rightDoorRef.current.position.x, targetRightX, 6, delta);
    }
  });

  return (
    <group>
      {/* Ambient and Main Lighting */}
      <ambientLight intensity={0.65} color="#f8fafc" />
      <directionalLight
        position={[0, 14, 0]}
        intensity={0.8}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />

      {/* Warm Fill Spotlights above main store aisles */}
      <pointLight position={[-12, 4.2, 0]} intensity={0.7} distance={12} color="#fef08a" />
      <pointLight position={[-5, 4.2, 0]} intensity={0.8} distance={12} color="#93c5fd" />
      <pointLight position={[3, 4.2, 0]} intensity={0.7} distance={12} color="#fed7aa" />
      <pointLight position={[11, 4.2, 0]} intensity={0.7} distance={12} color="#e9d5ff" />
      <pointLight position={[0, 4.0, 10]} intensity={0.9} distance={10} color="#ffffff" />

      {/* 1. Reflective Supermarket Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial
          map={floorMap}
          roughnessMap={floorRough}
          roughness={0.2}
          metalness={0.08}
        />
      </mesh>

      {/* Porch outside front entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 16.5]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Welcome Entrance Mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 12.8]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial color="#0f766e" roughness={0.9} />
      </mesh>

      {/* 2. Supermarket Ceiling Grid with Industrial Structural Beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.0, 0]}>
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>

      {/* Overhead Fluorescent Linear LED Fixtures */}
      {[-12, -5, 3, 11].map((x) => (
        <group key={`led-row-${x}`} position={[x, 4.85, 0]}>
          {[-6, 0, 6].map((z) => (
            <group key={`led-${x}-${z}`} position={[0, 0, z]}>
              <mesh>
                <boxGeometry args={[0.4, 0.15, 3.8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0, -0.08, 0]}>
                <boxGeometry args={[0.3, 0.02, 3.6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 3. Outer Perimeter Walls */}
      {/* Back Wall */}
      <mesh position={[0, 2.5, -14.0]}>
        <boxGeometry args={[34, 5.0, 0.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-16.0, 2.5, 0]}>
        <boxGeometry args={[0.4, 5.0, 28]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[16.0, 2.5, 0]}>
        <boxGeometry args={[0.4, 5.0, 28]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Front Entrance Glass Facade */}
      {/* Left Wall Panel */}
      <mesh position={[-9.5, 2.5, 13.8]}>
        <boxGeometry args={[13, 5.0, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      {/* Right Wall Panel */}
      <mesh position={[9.5, 2.5, 13.8]}>
        <boxGeometry args={[13, 5.0, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Store Entrance Header Sign with Official Brand Logo */}
      <mesh position={[0, 4.05, 13.82]}>
        <planeGeometry args={[6.2, 2.0]} />
        <meshBasicMaterial map={entranceBannerTex} />
      </mesh>
      <mesh position={[0, 4.05, 13.78]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.2, 2.0]} />
        <meshBasicMaterial map={entranceBannerTex} />
      </mesh>

      {/* Automatic Sliding Glass Doors */}
      <group position={[0, 0, 13.8]}>
        {/* Left Sliding Door */}
        <mesh ref={leftDoorRef} position={[-0.95, 1.6, 0]}>
          <boxGeometry args={[1.8, 3.2, 0.08]} />
          <meshPhysicalMaterial
            color="#93c5fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
            thickness={0.1}
          />
        </mesh>
        {/* Right Sliding Door */}
        <mesh ref={rightDoorRef} position={[0.95, 1.6, 0]}>
          <boxGeometry args={[1.8, 3.2, 0.08]} />
          <meshPhysicalMaterial
            color="#93c5fd"
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.8}
            thickness={0.1}
          />
        </mesh>
        {/* Door frames */}
        <mesh position={[0, 3.25, 0]}>
          <boxGeometry args={[4.2, 0.15, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. Hanging Aisle Signboards */}
      {/* Aisle 1 Sign */}
      <group position={[-12.5, 3.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle1Tex} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle1Tex} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Aisle 2 Sign */}
      <group position={[-6.5, 3.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle2Tex} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle2Tex} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Aisle 3 Sign */}
      <group position={[-0.5, 3.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle3Tex} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle3Tex} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Aisle 4 Sign */}
      <group position={[5.5, 3.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle4Tex} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle4Tex} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Aisle 5 Sign */}
      <group position={[11.5, 3.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle5Tex} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.1]} />
          <meshBasicMaterial map={aisle5Tex} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.4]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* 5. Trolley Parking Bay Station (Near entrance right side) */}
      <group position={[11.5, 0, 12.5]}>
        {/* Floor marking yellow border */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <planeGeometry args={[4.2, 2.0]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
          <planeGeometry args={[4.0, 1.8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Stainless steel guide rail */}
        <mesh position={[0, 0.45, -0.9]}>
          <boxGeometry args={[4.2, 0.06, 0.06]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-2.0, 0.22, -0.9]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[2.0, 0.22, -0.9]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

