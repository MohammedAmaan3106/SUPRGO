import React from 'react';

export const ShelvesAndAisles: React.FC = () => {
  return (
    <group>
      {/* ========================================================
          AISLE 1: PRODUCE STANDS & BAKERY DISPLAY (X = -12.5)
          ======================================================== */}
      {/* Rack A1-R1: Fresh Fruit Crates (Z: -8.5 to -1.5) */}
      <group position={[-12.5, 0, -5.0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.85, 7.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[1.6, 0.15, 7.0]} />
          <meshStandardMaterial color="#92400e" roughness={0.65} />
        </mesh>
        {/* Tier 2 Upper Riser */}
        <mesh position={[0.2, 1.35, 0]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[1.1, 0.12, 6.8]} />
          <meshStandardMaterial color="#b45309" roughness={0.65} />
        </mesh>
        {/* Wooden slatted separators */}
        {[-3.0, -1.5, 0, 1.5, 3.0].map((z, idx) => (
          <mesh key={`crate-div-${idx}`} position={[0, 1.15, z]}>
            <boxGeometry args={[1.7, 0.35, 0.06]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Rack A1-R2: Farm Vegetables & Bakery (Z: 0.5 to 7.5) */}
      <group position={[-12.5, 0, 4.0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.85, 7.2]} />
          <meshStandardMaterial color="#854d0e" roughness={0.6} />
        </mesh>
        {/* Tiered decks for greens & bakery */}
        {[0.95, 1.35, 1.75].map((y, idx) => (
          <mesh key={`bakery-tier-${idx}`} position={[0, y, 0]}>
            <boxGeometry args={[1.6 - idx * 0.15, 0.05, 7.0]} />
            <meshStandardMaterial color="#a16207" roughness={0.5} />
          </mesh>
        ))}
        {/* Warm bakery backlight */}
        <pointLight position={[0, 1.5, 2.0]} intensity={0.5} distance={4} color="#fbbf24" />
      </group>

      {/* ========================================================
          AISLE 2: CHILLED DAIRY & BEVERAGE REFRIGERATORS (X = -6.5)
          ======================================================== */}
      {/* Chiller Unit 1: Dairy (Z: -8.5 to -1.5) */}
      <group position={[-6.5, 0, -5.0]}>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[1.8, 2.65, 7.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.05, 1.35, 0]}>
          <boxGeometry args={[1.65, 2.5, 7.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* 5 Wire Shelves */}
        {[0.6, 1.0, 1.4, 1.8, 2.2].map((y, sIdx) => (
          <mesh key={`fridge1-shelf-${sIdx}`} position={[0.1, y, 0]}>
            <boxGeometry args={[1.5, 0.035, 6.9]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Glass Front */}
        <mesh position={[-0.85, 1.35, 0]}>
          <boxGeometry args={[0.05, 2.4, 7.0]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.32}
            roughness={0.1}
            transmission={0.85}
            thickness={0.05}
          />
        </mesh>
        {/* Chrome Handles */}
        {[-2.5, -0.8, 0.8, 2.5].map((z, hIdx) => (
          <mesh key={`handle1-${hIdx}`} position={[-0.92, 1.35, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
        <pointLight position={[0, 1.8, 0]} intensity={0.7} distance={4.5} color="#67e8f9" />
      </group>

      {/* Chiller Unit 2: Chilled Beverages (Z: 0.5 to 7.5) */}
      <group position={[-6.5, 0, 4.0]}>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[1.8, 2.65, 7.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.05, 1.35, 0]}>
          <boxGeometry args={[1.65, 2.5, 7.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {[0.6, 1.0, 1.4, 1.8, 2.2].map((y, sIdx) => (
          <mesh key={`fridge2-shelf-${sIdx}`} position={[0.1, y, 0]}>
            <boxGeometry args={[1.5, 0.035, 6.9]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[-0.85, 1.35, 0]}>
          <boxGeometry args={[0.05, 2.4, 7.0]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.32}
            roughness={0.1}
            transmission={0.85}
            thickness={0.05}
          />
        </mesh>
        {[-2.5, -0.8, 0.8, 2.5].map((z, hIdx) => (
          <mesh key={`handle2-${hIdx}`} position={[-0.92, 1.35, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
        <pointLight position={[0, 1.8, 0]} intensity={0.7} distance={4.5} color="#67e8f9" />
      </group>

      {/* ========================================================
          AISLE 3: GROCERIES & STAPLES GONDOLAS (X = -0.5)
          ======================================================== */}
      {/* Gondola 1 (Z: -8.5 to -1.5) */}
      <group position={[-0.5, 0, -5.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola3-1-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} />
            </mesh>
            {/* Price tag rail */}
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Gondola 2 (Z: 0.5 to 7.5) */}
      <group position={[-0.5, 0, 4.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola3-2-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          AISLE 4: SNACKS & PACKAGED FOODS GONDOLAS (X = 5.5)
          ======================================================== */}
      {/* Gondola 1 (Z: -8.5 to -1.5) */}
      <group position={[5.5, 0, -5.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola4-1-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#ea580c" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#ea580c" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Gondola 2 (Z: 0.5 to 7.5) */}
      <group position={[5.5, 0, 4.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola4-2-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#ea580c" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#ea580c" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          AISLE 5: PERSONAL CARE, BABY & HOUSEHOLD (X = 11.5)
          ======================================================== */}
      {/* Gondola 1 (Z: -8.5 to -1.5) */}
      <group position={[11.5, 0, -5.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola5-1-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.3} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#9333ea" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#9333ea" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Gondola 2 (Z: 0.5 to 7.5) */}
      <group position={[11.5, 0, 4.0]}>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.08, 2.5, 7.0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.8, 0.3, 7.0]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.3} />
        </mesh>
        {[0.6, 1.05, 1.5, 1.95, 2.35].map((y, sIdx) => (
          <group key={`gondola5-2-${sIdx}`} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 0.04, 6.9]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.3} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.02, 0.05, 6.9]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
