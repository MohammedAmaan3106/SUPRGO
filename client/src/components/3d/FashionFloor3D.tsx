import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export const FashionFloor3D: React.FC = () => {
  // Wood texture simulation for luxury fashion boutique
  const floorWoodTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark espresso herringbone wood
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#292524';
      for (let i = 0; i < 512; i += 32) {
        ctx.fillRect(i, 0, 16, 512);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let j = 0; j < 512; j += 64) {
        ctx.fillRect(0, j, 512, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 10);
    return texture;
  }, []);

  return (
    <group position={[0, 5.6, 0]}>
      {/* ========================================================
          1. FIRST FLOOR STRUCTURAL SLAB (Y = 5.6)
          ======================================================== */}
      {/* Main Floor Surface (Herringbone Espresso Boutique Flooring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 28]} />
        <meshStandardMaterial
          map={floorWoodTex}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Ceiling of First Floor (Y = 5.0m relative to 1st floor -> World Y = 10.6) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.8, 0]}>
        <planeGeometry args={[34, 28]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Boutique Track Spotlights */}
      {[-10.5, -4.0, 4.0, 10.5].map((x) => (
        <group key={`track-${x}`} position={[x, 4.7, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.08, 20]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {[-6, -2, 2, 6].map((z) => (
            <group key={`spot-${x}-${z}`} position={[0, -0.15, z]}>
              <mesh rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.1, 0.22, 16]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
              <pointLight intensity={0.7} distance={9} color="#fef08a" />
            </group>
          ))}
        </group>
      ))}

      {/* ========================================================
          2. ATRIUM OPENING & GLASS BALUSTRADE RAILING AROUND ELEVATOR
          ======================================================== */}
      {/* Front Atrium Glass Balustrade (Z = -9.8) */}
      <mesh position={[-6.2, 0.55, -9.8]}>
        <boxGeometry args={[7.2, 1.1, 0.04]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.4}
          roughness={0.1}
          transmission={0.85}
          thickness={0.05}
        />
      </mesh>
      <mesh position={[-6.2, 1.1, -9.8]}>
        <boxGeometry args={[7.2, 0.05, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>

      <mesh position={[6.2, 0.55, -9.8]}>
        <boxGeometry args={[7.2, 1.1, 0.04]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.4}
          roughness={0.1}
          transmission={0.85}
          thickness={0.05}
        />
      </mesh>
      <mesh position={[6.2, 1.1, -9.8]}>
        <boxGeometry args={[7.2, 0.05, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* ========================================================
          3. AISLE F1: MEN'S APPAREL & CASUALS (X = -10.5)
          ======================================================== */}
      <group position={[-10.5, 0, 0]}>
        {/* Overhead Department Neon Sign */}
        <group position={[0, 3.6, -0.2]}>
          <mesh>
            <planeGeometry args={[4.2, 0.9]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 0.12, 0.02]} fontSize={0.22} color="#38bdf8" anchorX="center" anchorY="middle">
            MEN'S COLLECTION
          </Text>
          <Text position={[0, -0.18, 0.02]} fontSize={0.11} color="#94a3b8" anchorX="center" anchorY="middle">
            Denim • Formal Shirts • Polos • Hoodies & Jackets
          </Text>
        </group>

        {/* Rack 1: Double-Tier Hanging Steel Rails (Z: -8.0 to -1.5) */}
        <group position={[0, 0, -4.8]}>
          {/* Vertical steel posts */}
          {[-3.0, 0, 3.0].map((z, idx) => (
            <mesh key={`men-rail-post-${idx}`} position={[0, 1.1, z]}>
              <cylinderGeometry args={[0.03, 0.03, 2.2]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
          {/* Horizontal hanging bars */}
          <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 6.2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 6.2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Low base shoe shelf */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.2, 0.1, 6.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
        </group>

        {/* Rack 2: Folded Garment Display Tables & Mannequin (Z: 0.0 to 6.5) */}
        <group position={[0, 0, 3.2]}>
          {/* Modern Scandinavian Wood & Black Steel Table */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.06, 5.8]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[1.0, 0.05, 5.2]} />
            <meshStandardMaterial color="#92400e" roughness={0.4} />
          </mesh>
          {/* Table Legs */}
          {[-2.5, 2.5].map((z) => (
            <group key={`m-table-leg-${z}`} position={[0, 0.22, z]}>
              <mesh position={[-0.5, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.44]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
              <mesh position={[0.5, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.44]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>
          ))}

          {/* Styled Male Mannequin */}
          <group position={[0, 0, -2.2]}>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Legs (Trousers) */}
            <mesh position={[-0.08, 0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.9]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            <mesh position={[0.08, 0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.9]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            {/* Torso (Blazer Jacket) */}
            <mesh position={[0, 1.35, 0]}>
              <boxGeometry args={[0.38, 0.7, 0.22]} />
              <meshStandardMaterial color="#27272a" roughness={0.6} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.85, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================
          4. AISLE F2: WOMEN'S BOUTIQUE & ETHNIC WEAR (X = -4.0)
          ======================================================== */}
      <group position={[-4.0, 0, 0]}>
        {/* Overhead Department Sign */}
        <group position={[0, 3.6, -0.2]}>
          <mesh>
            <planeGeometry args={[4.2, 0.9]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 0.12, 0.02]} fontSize={0.22} color="#f472b6" anchorX="center" anchorY="middle">
            WOMEN'S BOUTIQUE
          </Text>
          <Text position={[0, -0.18, 0.02]} fontSize={0.11} color="#94a3b8" anchorX="center" anchorY="middle">
            Dresses • Silk Kurtis • Tops • Cashmere • Skirts
          </Text>
        </group>

        {/* Rack 1: Brushed Brass Luxury Rails (Z: -8.0 to -1.5) */}
        <group position={[0, 0, -4.8]}>
          {[-3.0, 0, 3.0].map((z, idx) => (
            <mesh key={`fem-post-${idx}`} position={[0, 1.1, z]}>
              <cylinderGeometry args={[0.03, 0.03, 2.2]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 6.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 6.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Rack 2: Tiered Display Island with Female Mannequin (Z: 0.0 to 6.5) */}
        <group position={[0, 0, 3.2]}>
          {/* Glass and Rose Gold Display Table */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.3, 0.04, 5.6]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.9, 0.04, 5.0]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} roughness={0.1} />
          </mesh>

          {/* Styled Female Mannequin */}
          <group position={[0, 0, 2.2]}>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} />
            </mesh>
            {/* Midi Dress */}
            <mesh position={[0, 0.85, 0]}>
              <coneGeometry args={[0.26, 1.1, 16]} />
              <meshStandardMaterial color="#e11d48" roughness={0.5} />
            </mesh>
            {/* Torso */}
            <mesh position={[0, 1.35, 0]}>
              <cylinderGeometry args={[0.13, 0.16, 0.5, 14]} />
              <meshStandardMaterial color="#e11d48" roughness={0.5} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.75, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#fcd34d" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================
          5. AISLE F3: FOOTWEAR & SNEAKER LOUNGE (X = 4.0)
          ======================================================== */}
      <group position={[4.0, 0, 0]}>
        {/* Overhead Department Sign */}
        <group position={[0, 3.6, -0.2]}>
          <mesh>
            <planeGeometry args={[4.2, 0.9]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 0.12, 0.02]} fontSize={0.22} color="#fb923c" anchorX="center" anchorY="middle">
            SNEAKER & SHOE LOUNGE
          </Text>
          <Text position={[0, -0.18, 0.02]} fontSize={0.11} color="#94a3b8" anchorX="center" anchorY="middle">
            Nike • Adidas • Clarks Brogues • Running Shoes
          </Text>
        </group>

        {/* Display Wall 1: Illuminated Floating Glass Shoe Shelves (Z: -8.0 to -1.5) */}
        <group position={[0, 0, -4.8]}>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.3, 2.5, 6.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {/* 4 Illuminated Tiers */}
          {[0.5, 1.0, 1.5, 2.0].map((y, idx) => (
            <mesh key={`shoe-shelf-${idx}`} position={[-0.3, y, 0]}>
              <boxGeometry args={[0.55, 0.04, 6.2]} />
              <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Display Wall 2 with Try-on Fitting Bench (Z: 0.0 to 6.5) */}
        <group position={[0, 0, 3.2]}>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.3, 2.5, 5.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {[0.5, 1.0, 1.5, 2.0].map((y, idx) => (
            <mesh key={`shoe-shelf-2-${idx}`} position={[-0.3, y, 0]}>
              <boxGeometry args={[0.55, 0.04, 5.6]} />
              <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.1} />
            </mesh>
          ))}

          {/* Luxury Leather Shoe Fitting Bench */}
          <group position={[-1.2, 0, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[0.7, 0.15, 2.4]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            {/* Tufted Leather Cushion */}
            <mesh position={[0, 0.36, 0]}>
              <boxGeometry args={[0.66, 0.09, 2.36]} />
              <meshStandardMaterial color="#451a03" roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================
          6. AISLE F4: ACCESSORIES, BAGS & KIDS CORNER (X = 10.5)
          ======================================================== */}
      <group position={[10.5, 0, 0]}>
        {/* Overhead Department Sign */}
        <group position={[0, 3.6, -0.2]}>
          <mesh>
            <planeGeometry args={[4.2, 0.9]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 0.12, 0.02]} fontSize={0.22} color="#a855f7" anchorX="center" anchorY="middle">
            LUXURY BAGS & ACCESSORIES
          </Text>
          <Text position={[0, -0.18, 0.02]} fontSize={0.11} color="#94a3b8" anchorX="center" anchorY="middle">
            Fossil Handbags • Ray-Ban • Belts • Kids Apparel
          </Text>
        </group>

        {/* Handbag Towers & Glass Vitrine (Z: -8.0 to -1.5) */}
        <group position={[0, 0, -4.8]}>
          {/* Glass display showcase */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.9, 6.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[1.3, 0.5, 5.8]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        </group>

        {/* Kids Fashion & Backpacks Island (Z: 0.0 to 6.5) */}
        <group position={[0, 0, 3.2]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.9, 5.8]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.3} />
          </mesh>
          {/* Colorful overhead flags */}
          {[-2, 0, 2].map((z, idx) => (
            <mesh key={`kid-flag-${idx}`} position={[0, 1.4, z]}>
              <boxGeometry args={[0.05, 0.35, 0.5]} />
              <meshBasicMaterial color={['#ec4899', '#3b82f6', '#10b981'][idx]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================
          7. PERIMETER WALLS & ARCHITECTURAL ATRIUM (FLOOR 1)
          ======================================================== */}
      {/* Back Boutique Wall (Z = -14.0) */}
      <mesh position={[0, 2.4, -14.0]}>
        <boxGeometry args={[34, 4.8, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Decorative Backlit Bronze Wall Trim */}
      <mesh position={[0, 4.2, -13.78]}>
        <boxGeometry args={[32, 0.1, 0.02]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Left Wall (X = -16.0) */}
      <mesh position={[-16.0, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Boutique Dressing Room Full-Length Mirrors along left wall */}
      {[-3, 3].map((z) => (
        <group key={`mirror-${z}`} position={[-15.75, 2.2, z]}>
          <mesh>
            <boxGeometry args={[0.04, 3.2, 1.6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.05} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.06, 3.3, 1.7]} />
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Right Wall (X = 16.0) */}
      <mesh position={[16.0, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Front Glass Panorama Windows (Z = 13.8) */}
      <mesh position={[0, 2.4, 13.8]}>
        <boxGeometry args={[34, 4.8, 0.3]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.8}
        />
      </mesh>
      {/* Window mullions */}
      {[-10, -5, 0, 5, 10].map((x) => (
        <mesh key={`mullion-${x}`} position={[x, 2.4, 13.8]}>
          <boxGeometry args={[0.15, 4.8, 0.35]} />
          <meshStandardMaterial color="#020617" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};
